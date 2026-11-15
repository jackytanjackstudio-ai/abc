// Design input (from the studio) and the frozen snapshot stored per cart/order line.

export interface DesignNameInput {
  text: string
  fontId: string
  sizeMm: number
  colorId: string
  /** outline centre, mm from the top-left of the front lid */
  x: number
  y: number
}

export interface DesignInput {
  modelId: string
  colorId: string
  patternId: string
  name: DesignNameInput | null
  /** design being edited from the cart; the new snapshot becomes its next version */
  supersedes?: string
}

export interface DesignSnapshot {
  id: string
  lineage: string
  version: number
  createdAt: string
  sku: string
  modelId: string
  modelName: string
  colorId: string
  colorName: string
  patternId: string
  patternName: string
  patternVersion: number
  templateId: string
  templateVersion: number
  coordinateSystem: { face: 'front'; origin: 'lid-top-left'; units: 'mm'; panelW: number; panelH: number }
  name: null | {
    text: string
    fontId: string
    fontVersion: number
    sizeMm: number
    colorId: string
    colorName: string
    colorHex: string
    anchor: 'outline-center'
    x: number
    y: number
    bbox: { x: number; y: number; w: number; h: number }
    outline: { d: string; tx: number; ty: number }
  }
  pricing: { baseCents: number; personalizationCents: number; unitCents: number; currency: string }
  previewSvg: string
}

export function designTitle(d: Pick<DesignSnapshot, 'modelName' | 'patternName' | 'colorName'>) {
  return `${d.modelName} · ${d.patternName} · ${d.colorName}`
}
