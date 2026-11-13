import 'server-only'
import crypto from 'crypto'
import {
  CURRENCY,
  PERSONALIZATION_FEE_CENTS,
  getColor,
  getFont,
  getModel,
  getNameColor,
  getPattern,
  sku as makeSku,
} from './catalog'
import type { DesignInput, DesignSnapshot } from './design'
import { loadServerFont } from './fonts-server'
import { boxAt, checkPlacement, describeIssue, measureName, missingGlyphs, normalizeName, originFor } from './layout'
import { renderCaseSvg } from './render'
import { readInventory, tx } from './store'

export class DesignError extends Error {
  constructor(public field: string, message: string) {
    super(message)
  }
}

const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : NaN)

/** Re-runs the full layout on the server. Never trusts client-side bounds. */
export function buildSnapshot(input: DesignInput, prev?: DesignSnapshot): DesignSnapshot {
  const model = getModel(input?.modelId)
  if (!model) throw new DesignError('modelId', 'Unknown case size.')
  const color = getColor(input.colorId)
  if (!color) throw new DesignError('colorId', 'Unknown case colour.')
  const pattern = getPattern(input.patternId)
  if (!pattern || !pattern.active) throw new DesignError('patternId', 'This pattern is not available.')
  const theSku = makeSku(model.id, color.id)
  if ((readInventory()[theSku] ?? 0) <= 0) throw new DesignError('colorId', `${model.name} in ${color.name} is out of stock.`)

  const t = model.template
  let name: DesignSnapshot['name'] = null
  const raw = input.name
  if (raw && typeof raw.text === 'string' && normalizeName(raw.text).trim() !== '') {
    const text = normalizeName(raw.text).trim()
    if (Array.from(text).length > t.maxChars) throw new DesignError('name.text', `Names can be up to ${t.maxChars} characters.`)
    const fontMeta = getFont(raw.fontId)
    if (!fontMeta) throw new DesignError('name.fontId', 'Unknown font.')
    const nameColor = getNameColor(raw.colorId)
    if (!nameColor) throw new DesignError('name.colorId', 'Unknown name colour.')
    const sizeMm = num(raw.sizeMm)
    if (!(sizeMm >= t.fontSizeMm.min && sizeMm <= t.fontSizeMm.max))
      throw new DesignError('name.sizeMm', `Letter size must be ${t.fontSizeMm.min}–${t.fontSizeMm.max} mm.`)
    const x = num(raw.x)
    const y = num(raw.y)
    if (isNaN(x) || isNaN(y)) throw new DesignError('name.position', 'Name position is missing.')

    const font = loadServerFont(fontMeta.id)
    if (!font) throw new DesignError('name.fontId', 'Font unavailable.')
    const missing = missingGlyphs(font, text)
    if (missing.length) throw new DesignError('name.text', describeIssue({ code: 'missing_glyphs', chars: missing }))
    const m = measureName(font, text, sizeMm)
    if (!m) throw new DesignError('name.text', 'This name has no printable characters.')
    const box = boxAt(m, x, y)
    const issue = checkPlacement(t, box)
    if (issue) throw new DesignError('name.position', describeIssue(issue))
    const o = originFor(m, x, y)
    name = {
      text,
      fontId: fontMeta.id,
      fontVersion: fontMeta.version,
      sizeMm,
      colorId: nameColor.id,
      colorName: nameColor.name,
      colorHex: nameColor.hex,
      anchor: 'outline-center',
      x,
      y,
      bbox: { x: round(box.x), y: round(box.y), w: round(box.w), h: round(box.h) },
      outline: { d: m.d, tx: o.x, ty: o.y },
    }
  }

  const id = crypto.randomUUID()
  const personalizationCents = name ? PERSONALIZATION_FEE_CENTS : 0
  return {
    id,
    lineage: prev?.lineage ?? id,
    version: prev ? prev.version + 1 : 1,
    createdAt: new Date().toISOString(),
    sku: theSku,
    modelId: model.id,
    modelName: model.name,
    colorId: color.id,
    colorName: color.name,
    patternId: pattern.id,
    patternName: pattern.name,
    patternVersion: pattern.version,
    templateId: t.id,
    templateVersion: t.version,
    coordinateSystem: { face: 'front', origin: 'lid-top-left', units: 'mm', panelW: t.panel.w, panelH: t.panel.h },
    name,
    pricing: {
      baseCents: model.priceCents,
      personalizationCents,
      unitCents: model.priceCents + personalizationCents,
      currency: CURRENCY,
    },
    // Preview carries no customer name in its title/alt; the name only exists as outline geometry.
    previewSvg: renderCaseSvg(model, color, pattern.id, {
      uid: id.slice(0, 8),
      title: `${model.name} in ${color.name} with ${pattern.name} pattern`,
      name: name ? { d: name.outline.d, tx: name.outline.tx, ty: name.outline.ty, color: name.colorHex } : null,
    }),
  }
}

const round = (n: number) => Math.round(n * 100) / 100

export async function saveDesign(input: DesignInput) {
  const prev = input.supersedes ? await tx((db) => db.designs[input.supersedes!]) : undefined
  const snap = buildSnapshot(input, prev)
  await tx((db) => {
    db.designs[snap.id] = snap
  })
  return snap
}
