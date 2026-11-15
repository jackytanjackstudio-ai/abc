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
 * UV DTF name layer: transparent background, real-size millimetres, text
 * converted to outlines (no font needed at the factory). Coordinates are in
 * the front-lid template space so the sheet's anchor values apply directly.
 */
export function nameLayerSvg(d: DesignSnapshot) {
  if (!d.name) return null
  const { panelW, panelH } = d.coordinateSystem
  const n = d.name
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${panelW}mm" height="${panelH}mm" viewBox="0 0 ${panelW} ${panelH}">
  <!-- design ${d.id} v${d.version} · template ${d.templateId}@${d.templateVersion} · font ${n.fontId}@${n.fontVersion} -->
  <path d="${n.outline.d}" transform="translate(${n.outline.tx} ${n.outline.ty})" fill="${n.colorHex}"/>
</svg>`
}

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
          sizeMm: d.name.sizeMm,
          color: { name: d.name.colorName, hex: d.name.colorHex },
          anchor: 'outline centre',
          anchorMm: { x: d.name.x, y: d.name.y },
          glyphBoxMm: d.name.bbox,
        }
      : null,
    files: layer
      ? { nameLayerSvg: { sha256: crypto.createHash('sha256').update(layer).digest('hex') } }
      : {},
    designId: d.id,
    designVersion: d.version,
  }
}
