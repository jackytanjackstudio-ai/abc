// Static catalog for the VIAROU MVP. In production this moves to the commerce
// platform / admin; the shapes here mirror what the order snapshot freezes.

export const BRAND = 'VIAROU' // placeholder brand name (see brief p.17)
export const CURRENCY = 'usd'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Front-face print template. All units are millimetres, origin = top-left of the front lid, +x right, +y down. */
export interface Template {
  id: string
  version: number
  panel: { w: number; h: number }
  safe: Rect
  keepOuts: { id: string; label: string; rect: Rect }[]
  recommended: { x: number; y: number }
  fontSizeMm: { min: number; max: number; default: number }
  maxChars: number
}

export interface CaseModel {
  id: string
  name: string
  short: string
  dimensionsCm: { h: number; w: number; d: number }
  weightKg: number
  capacityL: number
  priceCents: number
  interior: string[]
  template: Template
}

export interface CaseColor {
  id: string
  name: string
  hex: string
  /** colour used for hardware / outline on this shell */
  trim: string
}

export type SeriesId = 'line' | 'journey' | 'pattern' | 'lifestyle'

export interface Series {
  id: SeriesId
  name: string
  tagline: string
}

export interface Pattern {
  id: string
  series: SeriesId
  name: string
  version: number
  active: boolean
  description: string
}

export interface NameFont {
  id: string
  name: string
  version: number
  file: string
}

export interface NameColor {
  id: string
  name: string
  hex: string
}

function template(id: string, w: number, h: number): Template {
  const inset = 24 // lid zipper + curved edge
  return {
    id,
    version: 1,
    panel: { w, h },
    safe: { x: inset, y: inset, w: w - inset * 2, h: h - inset * 2 },
    keepOuts: [
      { id: 'pull', label: 'lid pull tab', rect: { x: w - inset - 34, y: h / 2 - 35, w: 34, h: 70 } },
      { id: 'badge', label: 'brand badge', rect: { x: w / 2 - 40, y: h - inset - 34, w: 80, h: 34 } },
    ],
    recommended: { x: w / 2, y: Math.round(h * 0.3) },
    fontSizeMm: { min: 20, max: 80, default: 42 },
    maxChars: 14,
  }
}

export const MODELS: CaseModel[] = [
  {
    id: 'cabin',
    name: 'Cabin 20″',
    short: 'Cabin',
    dimensionsCm: { h: 55, w: 38, d: 22 },
    weightKg: 3.4,
    capacityL: 39,
    priceCents: 28900,
    interior: ['Front lid laptop sleeve (up to 15″)', 'Zip divider with mesh pocket', 'Compression straps'],
    template: template('cabin-front', 320, 470),
  },
  {
    id: 'checkin',
    name: 'Check-in 24″',
    short: 'Check-in',
    dimensionsCm: { h: 66, w: 44, d: 27 },
    weightKg: 4.3,
    capacityL: 68,
    priceCents: 34900,
    interior: ['Front lid document pocket', 'Zip divider with mesh pocket', 'Compression straps', 'Laundry bag'],
    template: template('checkin-front', 370, 570),
  },
  {
    id: 'large',
    name: 'Large 28″',
    short: 'Large',
    dimensionsCm: { h: 76, w: 50, d: 31 },
    weightKg: 5.1,
    capacityL: 98,
    priceCents: 39900,
    interior: ['Front lid document pocket', 'Full zip divider', 'Compression straps', 'Shoe bag'],
    template: template('large-front', 420, 660),
  },
]

export const COLORS: CaseColor[] = [
  { id: 'chalk', name: 'Chalk', hex: '#EEE9DF', trim: '#B9B1A2' },
  { id: 'sand', name: 'Sand', hex: '#D8C7A9', trim: '#A08C6C' },
  { id: 'sage', name: 'Sage', hex: '#AEBBA5', trim: '#7A8A72' },
  { id: 'forest', name: 'Forest', hex: '#2F4A3C', trim: '#1B2C23' },
]

export const SERIES: Series[] = [
  { id: 'line', name: 'LINE', tagline: 'Quiet stripes and grids' },
  { id: 'journey', name: 'JOURNEY', tagline: 'Peaks, tides and routes' },
  { id: 'pattern', name: 'PATTERN', tagline: 'Classic repeats, re-cut' },
  { id: 'lifestyle', name: 'LIFESTYLE', tagline: 'Sun, palms and postmarks' },
]

export const PATTERNS: Pattern[] = [
  { id: 'line-pinstripe', series: 'line', name: 'Pinstripe', version: 1, active: true, description: 'Fine vertical pinstripes.' },
  { id: 'line-grid', series: 'line', name: 'Grid', version: 1, active: true, description: 'An open window-pane grid.' },
  { id: 'line-horizon', series: 'line', name: 'Horizon', version: 1, active: true, description: 'Broad horizontal bands.' },
  { id: 'journey-peaks', series: 'journey', name: 'Peaks', version: 1, active: true, description: 'Layered mountain ridges.' },
  { id: 'journey-tides', series: 'journey', name: 'Tides', version: 1, active: true, description: 'Rolling ocean swells.' },
  { id: 'journey-route', series: 'journey', name: 'Route', version: 1, active: true, description: 'A dotted route between stops.' },
  { id: 'pattern-check', series: 'pattern', name: 'Check', version: 1, active: true, description: 'A two-tone check.' },
  { id: 'pattern-dots', series: 'pattern', name: 'Dots', version: 1, active: true, description: 'Offset polka dots.' },
  { id: 'pattern-chevron', series: 'pattern', name: 'Chevron', version: 1, active: true, description: 'Stacked chevrons.' },
  { id: 'lifestyle-palms', series: 'lifestyle', name: 'Palms', version: 1, active: true, description: 'Scattered palm leaves.' },
  { id: 'lifestyle-sunset', series: 'lifestyle', name: 'Sunset', version: 1, active: true, description: 'Low suns over the sea.' },
  { id: 'lifestyle-postmark', series: 'lifestyle', name: 'Postmark', version: 1, active: true, description: 'Stamps from places visited.' },
]

export const FONTS: NameFont[] = [
  { id: 'serif', name: 'Serif', version: 1, file: '/fonts/serif-v1.woff' },
  { id: 'sans', name: 'Sans', version: 1, file: '/fonts/sans-v1.woff' },
  { id: 'script', name: 'Script', version: 1, file: '/fonts/script-v1.woff' },
  { id: 'block', name: 'Block', version: 1, file: '/fonts/block-v1.woff' },
]

export const NAME_COLORS: NameColor[] = [
  { id: 'forest', name: 'Forest green', hex: '#1F3A2E' },
  { id: 'ink', name: 'Ink black', hex: '#1C1C1C' },
  { id: 'cream', name: 'Cream', hex: '#F4EFE6' },
  { id: 'terracotta', name: 'Terracotta', hex: '#B4653F' },
  { id: 'ochre', name: 'Ochre', hex: '#C9A24A' },
  { id: 'sky', name: 'Sky blue', hex: '#6E8FB0' },
]

export const PERSONALIZATION_FEE_CENTS = 2500
export const PRODUCTION_DAYS = '5–7 business days'

/** Initial stock per SKU; runtime stock lives in data/runtime/inventory.json. */
export const DEFAULT_STOCK: Record<string, number> = {
  'cabin-chalk': 40,
  'cabin-sand': 40,
  'cabin-sage': 25,
  'cabin-forest': 0,
  'checkin-chalk': 30,
  'checkin-sand': 30,
  'checkin-sage': 15,
  'checkin-forest': 12,
  'large-chalk': 20,
  'large-sand': 0,
  'large-sage': 10,
  'large-forest': 8,
}

/** Shipping per box, in cents, by destination. Operations replaces this with the real carrier config. */
export const MARKETS: Record<
  string,
  { name: string; transit: string; rates: Record<string, number> }
> = {
  US: { name: 'United States', transit: '6–9 business days', rates: { cabin: 2900, checkin: 3900, large: 4900 } },
  CA: { name: 'Canada', transit: '7–10 business days', rates: { cabin: 3400, checkin: 4400, large: 5400 } },
  GB: { name: 'United Kingdom', transit: '6–9 business days', rates: { cabin: 3200, checkin: 4200, large: 5200 } },
  AU: { name: 'Australia', transit: '7–11 business days', rates: { cabin: 3400, checkin: 4600, large: 5600 } },
  SG: { name: 'Singapore', transit: '4–6 business days', rates: { cabin: 1900, checkin: 2600, large: 3300 } },
  MY: { name: 'Malaysia', transit: '4–7 business days', rates: { cabin: 1900, checkin: 2600, large: 3300 } },
}

export const sku = (modelId: string, colorId: string) => `${modelId}-${colorId}`

export const getModel = (id?: string | null) => MODELS.find((m) => m.id === id)
export const getColor = (id?: string | null) => COLORS.find((c) => c.id === id)
export const getPattern = (id?: string | null) => PATTERNS.find((p) => p.id === id)
export const getSeries = (id?: string | null) => SERIES.find((s) => s.id === id)
export const getFont = (id?: string | null) => FONTS.find((f) => f.id === id)
export const getNameColor = (id?: string | null) => NAME_COLORS.find((c) => c.id === id)

export function formatMoney(cents: number, currency = CURRENCY) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}
