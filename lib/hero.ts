import 'server-only'
import type { CaseModel } from './catalog'
import { loadServerFont } from './fonts-server'
import { measureName, originFor, recommendedPosition } from './layout'
import type { NameLayer } from './render'

/** Sample "EMILY" name layer for marketing renders, laid out by the same engine as the studio. */
export async function heroNameLayer(model: CaseModel, text = 'EMILY'): Promise<NameLayer | null> {
  const font = loadServerFont('serif')
  if (!font) return null
  const m = measureName(font, text, 46)
  if (!m) return null
  const pos = recommendedPosition(model.template, m)
  if (!pos) return null
  const o = originFor(m, pos.x, pos.y)
  return { d: m.d, tx: o.x, ty: o.y, color: '#1F3A2E' }
}
