// SVG renderings of the front-opening case. The front lid is drawn in the
// same millimetre space as the print template, offset by LID_OFFSET.

import { BRAND, type CaseColor, type CaseModel } from './catalog'
import { patternArt } from './patterns'

export const SHELL_MARGIN = 16

export function caseGeometry(model: CaseModel) {
  const { w, h } = model.template.panel
  const shellW = w + SHELL_MARGIN * 2
  const shellH = h + SHELL_MARGIN * 2
  return {
    shellW,
    shellH,
    lid: { x: SHELL_MARGIN, y: SHELL_MARGIN },
    viewBox: { x: -24, y: -70, w: shellW + 48, h: shellH + 70 + 64 },
  }
}

export interface NameLayer {
  d: string
  tx: number
  ty: number
  color: string
}

/** Shell, lid, pattern and hardware. Lid-local content uses id-prefixed clip paths so several renders can share a page. */
export function caseBaseMarkup(model: CaseModel, color: CaseColor, patternId: string | null, uid: string) {
  const g = caseGeometry(model)
  const { w, h } = model.template.panel
  const pull = model.template.keepOuts.find((k) => k.id === 'pull')!.rect
  const badge = model.template.keepOuts.find((k) => k.id === 'badge')!.rect
  const clip = `lidclip-${uid}`
  const trim = color.trim
  return `
<defs><clipPath id="${clip}"><rect x="0" y="0" width="${w}" height="${h}" rx="30"/></clipPath></defs>
<rect x="${g.shellW * 0.3}" y="-58" width="${g.shellW * 0.4}" height="20" rx="10" fill="${trim}"/>
<rect x="${g.shellW * 0.36}" y="-40" width="10" height="44" fill="${trim}"/>
<rect x="${g.shellW * 0.64 - 10}" y="-40" width="10" height="44" fill="${trim}"/>
<rect x="${g.shellW * 0.12}" y="${g.shellH - 6}" width="44" height="58" rx="10" fill="#2a2a28"/>
<rect x="${g.shellW * 0.88 - 44}" y="${g.shellH - 6}" width="44" height="58" rx="10" fill="#2a2a28"/>
<rect x="0" y="0" width="${g.shellW}" height="${g.shellH}" rx="44" fill="${color.hex}" stroke="${trim}" stroke-width="3"/>
<g transform="translate(${g.lid.x} ${g.lid.y})">
  <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="${color.hex}"/>
  <g clip-path="url(#${clip})">${patternId ? patternArt(patternId, w, h) : ''}</g>
  <rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="24" fill="none" stroke="${trim}" stroke-width="2.5" stroke-dasharray="5 4"/>
  <rect x="${pull.x + 6}" y="${pull.y}" width="${pull.w - 12}" height="${pull.h}" rx="10" fill="${trim}"/>
  <rect x="${pull.x + 12}" y="${pull.y + 12}" width="${pull.w - 24}" height="${pull.h - 24}" rx="5" fill="${color.hex}" opacity="0.6"/>
  <rect x="${badge.x}" y="${badge.y}" width="${badge.w}" height="${badge.h}" rx="8" fill="${trim}"/>
  <text x="${badge.x + badge.w / 2}" y="${badge.y + badge.h / 2 + 4.5}" text-anchor="middle" font-family="Georgia, serif" font-size="13" letter-spacing="2" fill="${color.hex}">${BRAND}</text>
  <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="none" stroke="${trim}" stroke-width="2"/>
</g>`
}

export function nameLayerMarkup(layer: NameLayer) {
  return `<path d="${layer.d}" transform="translate(${layer.tx} ${layer.ty})" fill="${layer.color}"/>`
}

export function renderCaseSvg(
  model: CaseModel,
  color: CaseColor,
  patternId: string | null,
  opts: { name?: NameLayer | null; uid: string; title?: string },
) {
  const g = caseGeometry(model)
  const vb = g.viewBox
  const title = opts.title ? `<title>${escapeXml(opts.title)}</title>` : ''
  const name = opts.name
    ? `<g transform="translate(${g.lid.x} ${g.lid.y})">${nameLayerMarkup(opts.name)}</g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img">${title}${caseBaseMarkup(model, color, patternId, opts.uid)}${name}</svg>`
}

/** Schematic of the front lid opened, showing the front compartment. */
export function renderOpenSvg(model: CaseModel, color: CaseColor) {
  const g = caseGeometry(model)
  const W = g.shellW
  const H = g.shellH
  const t = color.trim
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -70 ${W * 1.9} ${H + 140}" role="img"><title>${escapeXml(model.name)} with the front lid open</title>
<rect x="${W * 0.3}" y="-58" width="${W * 0.4}" height="20" rx="10" fill="${t}"/>
<rect x="0" y="0" width="${W}" height="${H}" rx="44" fill="${color.hex}" stroke="${t}" stroke-width="3"/>
<rect x="${SHELL_MARGIN}" y="${SHELL_MARGIN}" width="${W - SHELL_MARGIN * 2}" height="${H - SHELL_MARGIN * 2}" rx="30" fill="#3b3a36"/>
<rect x="${SHELL_MARGIN + 18}" y="${SHELL_MARGIN + 18}" width="${W - SHELL_MARGIN * 2 - 36}" height="${(H - SHELL_MARGIN * 2) * 0.55}" rx="14" fill="#55534d"/>
<text x="${W / 2}" y="${SHELL_MARGIN + 18 + (H - SHELL_MARGIN * 2) * 0.28}" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#e9e4da">Laptop sleeve</text>
<rect x="${SHELL_MARGIN + 18}" y="${SHELL_MARGIN + 36 + (H - SHELL_MARGIN * 2) * 0.55}" width="${W - SHELL_MARGIN * 2 - 36}" height="${(H - SHELL_MARGIN * 2) * 0.35}" rx="14" fill="#55534d"/>
<text x="${W / 2}" y="${SHELL_MARGIN + 36 + (H - SHELL_MARGIN * 2) * 0.73}" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#e9e4da">Document pocket</text>
<path d="M${W} ${SHELL_MARGIN} L${W * 1.8} ${-30} L${W * 1.8} ${H + 30} L${W} ${H - SHELL_MARGIN} Z" fill="${color.hex}" stroke="${t}" stroke-width="3"/>
<rect x="${W * 0.12}" y="${H - 6}" width="44" height="58" rx="10" fill="#2a2a28"/>
<rect x="${W * 0.88 - 44}" y="${H - 6}" width="44" height="58" rx="10" fill="#2a2a28"/>
</svg>`
}

/** Square pattern swatch for the pattern matrix. */
export function renderSwatchSvg(patternId: string, color: CaseColor, title: string) {
  const s = 240
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" role="img"><title>${escapeXml(title)}</title><rect width="${s}" height="${s}" fill="${color.hex}"/>${patternArt(patternId, s, s)}</svg>`
}

export function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}
