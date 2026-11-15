import 'server-only'
import crypto from 'crypto'
import { getModel } from './catalog'
import type { DesignSnapshot } from './design'
import type { ProductionJob } from './store'

/** Production endpoints are behind a shared key until the admin/RBAC module exists. */
export function authorizeProduction(request: Request) {
  const key = process.env.PRODUCTION_API_KEY
  if (!key) return false
  const given = Buffer.from(request.headers.get('x-production-key') ?? '')
  const want = Buffer.from(key)
  return given.length === want.length && crypto.timingSafeEqual(given, want)
}

/**
 * Print parameters still to be locked at the factory's signed sample (brief p.8).
 * Kept here so the sheet states them explicitly instead of implying defaults.
 */
export const PRINT_SPEC = {
  process: 'UV DTF transfer, name layer only (pattern is pre-printed by the factory)',
  layers: ['COLOR', 'WHITE (underbase, same outline)', 'VARNISH (same outline)', 'CUT (outline box + 3 mm)'],
  cutMarginMm: 3,
  mirror: false,
  pendingFactorySignOff: ['RIP colour profile', 'white choke / spread', 'varnish type', 'minimum stroke width', 'placement tolerance'],
}

/**
 * UV DTF name file: transparent background, real-size millimetres, text
 * converted to outlines (no font needed at the factory), in the front-lid
 * template space so the sheet's anchor values apply directly. Separate named
 * layers (Illustrator/Inkscape compatible) for colour, white underbase,
 * varnish and the cut line, so the RIP can map each to its channel.
 */
export function nameLayerSvg(d: DesignSnapshot, opts: { mirror?: boolean } = {}) {
  if (!d.name) return null
  const { panelW, panelH } = d.coordinateSystem
  const n = d.name
  const glyphs = `<path d="${n.outline.d}" transform="translate(${n.outline.tx} ${n.outline.ty})"/>`
  const m = PRINT_SPEC.cutMarginMm
  const cut = { x: n.bbox.x - m, y: n.bbox.y - m, w: n.bbox.w + 2 * m, h: n.bbox.h + 2 * m }
  const layer = (id: string, attrs: string, body: string) =>
    `  <g id="${id}" inkscape:groupmode="layer" inkscape:label="${id}" ${attrs}>
    ${body}
  </g>`
  const inner = [
    layer('CUT', 'fill="none" stroke="#FF00FF" stroke-width="0.25"', `<rect x="${r(cut.x)}" y="${r(cut.y)}" width="${r(cut.w)}" height="${r(cut.h)}" rx="2"/>`),
    layer('VARNISH', 'fill="#00FFFF" display="none"', glyphs),
    layer('WHITE', 'fill="#FFFFFF" display="none"', glyphs),
    layer('COLOR', `fill="${n.colorHex}"`, glyphs),
  ].join('\n')
  const body = opts.mirror ? `<g transform="translate(${panelW} 0) scale(-1 1)">
${inner}
</g>` : inner
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${panelW}mm" height="${panelH}mm" viewBox="0 0 ${panelW} ${panelH}">
  <!-- design ${d.id} v${d.version} · template ${d.templateId}@${d.templateVersion} · font ${n.fontId}@${n.fontVersion}${n.italic && n.italic !== 'none' ? ` italic(${n.italic})` : ''} · colour ${n.colorName} ${n.colorHex}${opts.mirror ? ' · MIRRORED' : ''} -->
  <!-- WHITE and VARNISH layers are hidden for viewing; enable them in the RIP. Spot names/values follow the factory's signed sample. -->
${body}
</svg>`
}

const r = (v: number) => Math.round(v * 100) / 100

export function positioningSheet(job: ProductionJob, d: DesignSnapshot) {
  const model = getModel(d.modelId)
  const layer = nameLayerSvg(d)
  return {
    orderNumber: job.orderNumber,
    lineNo: job.lineNo,
    qty: job.qty,
    sku: d.sku,
    case: { model: d.modelName, color: d.colorName, dimensionsCm: model?.dimensionsCm },
    pattern: { id: d.patternId, version: d.patternVersion, prePrinted: true },
    template: { id: d.templateId, version: d.templateVersion },
    orientation: 'front lid, viewed head-on, handle at top',
    origin: 'top-left corner of front lid; +x right, +y down; millimetres',
    transferRequired: job.needsTransfer,
    name: d.name
      ? {
          text: d.name.text,
          font: `${d.name.fontId}@${d.name.fontVersion}`,
          italic: d.name.italic ?? 'none', // already baked into the outline file
          sizeMm: d.name.sizeMm,
          color: { name: d.name.colorName, hex: d.name.colorHex },
          anchor: 'outline centre',
          anchorMm: { x: d.name.x, y: d.name.y },
          glyphBoxMm: d.name.bbox,
        }
      : null,
    print: PRINT_SPEC,
    files: layer
      ? {
          nameLayerSvg: {
            layers: ['COLOR', 'WHITE', 'VARNISH', 'CUT'],
            sizeMm: { w: d.coordinateSystem.panelW, h: d.coordinateSystem.panelH },
            sha256: crypto.createHash('sha256').update(layer).digest('hex'),
          },
        }
      : {},
    designId: d.id,
    designVersion: d.version,
  }
}
