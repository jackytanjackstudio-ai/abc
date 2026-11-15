// Shared name-layout engine. Runs identically in the browser (live preview)
// and on the server (re-validation, production export): both load the same
// versioned font file and measure the real glyph outlines with opentype.js.
// All coordinates are millimetres in the template's front-face space.

import type { Font } from 'opentype.js'
import type { Rect, Template } from './catalog'

export interface MeasuredName {
  /** outline path at baseline origin (0,0), in mm */
  d: string
  /** glyph outline bounds relative to the baseline origin */
  x1: number
  y1: number
  x2: number
  y2: number
  w: number
  h: number
}

export type LayoutIssue =
  | { code: 'empty' }
  | { code: 'missing_glyphs'; chars: string[] }
  | { code: 'too_long'; max: number }
  | { code: 'size_range'; min: number; max: number }
  | { code: 'too_big' }
  | { code: 'out_of_bounds' }
  | { code: 'keep_out'; id: string; label: string }

const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p

export function normalizeName(text: string) {
  return text.normalize('NFC').replace(/\s+/g, ' ')
}

export function missingGlyphs(font: Font, text: string): string[] {
  const missing = new Set<string>()
  for (const ch of Array.from(text)) {
    if (ch === ' ') continue
    if (font.charToGlyphIndex(ch) === 0) missing.add(ch)
  }
  return Array.from(missing)
}

// opentype.js 2.0's Path.toPathData() can emit "NaN" while optimising
// (seen with Caveat), which silently drops glyphs. Serialise commands ourselves.
function pathData(commands: { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }[]) {
  const n = (v: number | undefined) => {
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('invalid glyph outline')
    return String(round(v, 3))
  }
  let d = ''
  for (const c of commands) {
    if (c.type === 'M' || c.type === 'L') d += `${c.type}${n(c.x)} ${n(c.y)}`
    else if (c.type === 'Q') d += `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
    else if (c.type === 'C') d += `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
    else if (c.type === 'Z') d += 'Z'
  }
  return d
}

function plainLayout(font: Font, text: string, sizeMm: number) {
  const scale = sizeMm / font.unitsPerEm
  const glyphs = Array.from(text).map((ch) => font.charToGlyph(ch))
  const first = glyphs[0]?.getPath(0, 0, sizeMm)
  if (!first) return font.getPath('', 0, 0, sizeMm)
  first.commands = []
  let x = 0
  glyphs.forEach((g, i) => {
    first.extend(g.getPath(x, 0, sizeMm))
    let kern = 0
    if (glyphs[i + 1]) {
      try {
        kern = font.getKerningValue(g, glyphs[i + 1])
      } catch {
        kern = 0
      }
    }
    x += ((g.advanceWidth ?? 0) + kern) * scale
  })
  return first
}

export function measureName(font: Font, text: string, sizeMm: number, opts: { obliqueDeg?: number } = {}): MeasuredName | null {
  let path: ReturnType<Font['getPath']>
  try {
    path = font.getPath(text, 0, 0, sizeMm, { kerning: true })
  } catch {
    // Some fonts (Playfair italic, Great Vibes) use GSUB lookups opentype.js
    // can't shape yet, whatever feature flags are passed. Lay glyphs out
    // directly (cmap + advance width + pair kerning, no substitutions).
    // Deterministic, so browser and server still produce identical outlines.
    path = plainLayout(font, text, sizeMm)
  }
  // Synthetic italic: shear around the baseline (y is down, so ascenders move right).
  // Applied to the outline itself, so bounds, boundary checks and the production file all see the slant.
  if (opts.obliqueDeg) {
    const k = Math.tan((opts.obliqueDeg * Math.PI) / 180)
    for (const c of path.commands as { x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }[]) {
      if (c.x !== undefined && c.y !== undefined) c.x -= c.y * k
      if (c.x1 !== undefined && c.y1 !== undefined) c.x1 -= c.y1 * k
      if (c.x2 !== undefined && c.y2 !== undefined) c.x2 -= c.y2 * k
    }
  }
  const bb = path.getBoundingBox()
  if (!isFinite(bb.x1) || bb.x2 - bb.x1 <= 0) return null
  return {
    d: pathData(path.commands as Parameters<typeof pathData>[0]),
    x1: round(bb.x1, 3),
    y1: round(bb.y1, 3),
    x2: round(bb.x2, 3),
    y2: round(bb.y2, 3),
    w: round(bb.x2 - bb.x1, 3),
    h: round(bb.y2 - bb.y1, 3),
  }
}

/** Glyph-outline box when the outline's centre sits at (cx, cy). */
export function boxAt(m: MeasuredName, cx: number, cy: number): Rect {
  return { x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h }
}

/** SVG translate that places the baseline-origin path so its outline centre is at (cx, cy). */
export function originFor(m: MeasuredName, cx: number, cy: number) {
  return { x: round(cx - (m.x1 + m.x2) / 2, 3), y: round(cy - (m.y1 + m.y2) / 2, 3) }
}

const EPS = 1e-6
const intersects = (a: Rect, b: Rect) =>
  a.x < b.x + b.w - EPS && a.x + a.w > b.x + EPS && a.y < b.y + b.h - EPS && a.y + a.h > b.y + EPS

export function fits(t: Template, m: MeasuredName) {
  return m.w <= t.safe.w + EPS && m.h <= t.safe.h + EPS
}

export function checkPlacement(t: Template, box: Rect): LayoutIssue | null {
  const s = t.safe
  if (box.w > s.w + EPS || box.h > s.h + EPS) return { code: 'too_big' }
  if (box.x < s.x - EPS || box.y < s.y - EPS || box.x + box.w > s.x + s.w + EPS || box.y + box.h > s.y + s.h + EPS)
    return { code: 'out_of_bounds' }
  for (const k of t.keepOuts) if (intersects(box, k.rect)) return { code: 'keep_out', id: k.id, label: k.label }
  return null
}

function clampToSafe(t: Template, m: MeasuredName, cx: number, cy: number) {
  const s = t.safe
  const nx = Math.min(Math.max(cx, s.x + m.w / 2), s.x + s.w - m.w / 2)
  const ny = Math.min(Math.max(cy, s.y + m.h / 2), s.y + s.h - m.h / 2)
  return { x: round(nx), y: round(ny), clamped: Math.abs(nx - cx) > EPS || Math.abs(ny - cy) > EPS }
}

/**
 * Move toward a proposed centre. Stops at the safe-area edge and slides along
 * keep-out zones instead of entering them. `hit` reports a boundary contact.
 */
export function constrainMove(
  t: Template,
  m: MeasuredName,
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number; hit: null | 'edge' | string } {
  const c = clampToSafe(t, m, to.x, to.y)
  const ok = (x: number, y: number) => !checkPlacement(t, boxAt(m, x, y))
  if (ok(c.x, c.y)) return { x: c.x, y: c.y, hit: c.clamped ? 'edge' : null }
  const blocker = checkPlacement(t, boxAt(m, c.x, c.y))
  const label = blocker && blocker.code === 'keep_out' ? blocker.label : 'edge'
  if (ok(c.x, from.y)) return { x: c.x, y: from.y, hit: label }
  if (ok(from.x, c.y)) return { x: from.x, y: c.y, hit: label }
  return { x: from.x, y: from.y, hit: label }
}

/** Nearest valid centre to a target point (spiral grid search), or null if the name cannot fit anywhere. */
export function nearestValid(t: Template, m: MeasuredName, target: { x: number; y: number }) {
  if (!fits(t, m)) return null
  const start = clampToSafe(t, m, target.x, target.y)
  if (!checkPlacement(t, boxAt(m, start.x, start.y))) return { x: start.x, y: start.y }
  const step = 2
  const maxR = Math.max(t.panel.w, t.panel.h)
  for (let rad = step; rad <= maxR; rad += step) {
    let best: { x: number; y: number; d: number } | null = null
    for (let a = 0; a < 360; a += 10) {
      const p = clampToSafe(t, m, start.x + rad * Math.cos((a * Math.PI) / 180), start.y + rad * Math.sin((a * Math.PI) / 180))
      if (!checkPlacement(t, boxAt(m, p.x, p.y))) {
        const d = Math.hypot(p.x - target.x, p.y - target.y)
        if (!best || d < best.d) best = { x: p.x, y: p.y, d }
      }
    }
    if (best) return { x: best.x, y: best.y }
  }
  return null
}

export function recommendedPosition(t: Template, m: MeasuredName) {
  return nearestValid(t, m, t.recommended)
}

export function describeIssue(issue: LayoutIssue): string {
  switch (issue.code) {
    case 'empty':
      return 'Enter a name, or clear it to buy the pattern as is.'
    case 'missing_glyphs':
      return `This font can't print: ${issue.chars.map((c) => `“${c}”`).join(' ')}. Remove it or choose another font.`
    case 'too_long':
      return `Names can be up to ${issue.max} characters.`
    case 'size_range':
      return `Letter size must be between ${issue.min} and ${issue.max} mm.`
    case 'too_big':
      return "The name doesn't fit this case at this size. Make it smaller or shorten the name."
    case 'out_of_bounds':
      return 'The name runs past the printable area.'
    case 'keep_out':
      return `The name overlaps the ${issue.label}. Move it to a clear area.`
  }
}
