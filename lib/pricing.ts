import 'server-only'
import { CURRENCY, MARKETS, PRODUCTION_DAYS } from './catalog'
import { designTitle, type DesignSnapshot } from './design'
import { readDesign, readInventory } from './store'

export interface CartLineInput {
  designId: string
  qty: number
}

export class QuoteError extends Error {
  constructor(message: string, public lineIndex?: number) {
    super(message)
  }
}

export function quote(lines: CartLineInput[], country: string) {
  const market = MARKETS[country]
  if (!market) throw new QuoteError('We do not ship to this destination yet.')
  if (!Array.isArray(lines) || lines.length === 0) throw new QuoteError('Your cart is empty.')
  const inventory = readInventory()
  const needBySku: Record<string, number> = {}
  const resolved = lines.map((l, i) => {
    const design = readDesign(String(l.designId))
    if (!design) throw new QuoteError('A design in your cart could not be found. Please remove it and add it again.', i)
    const qty = Math.floor(Number(l.qty))
    if (!(qty >= 1 && qty <= 10)) throw new QuoteError('Quantity must be between 1 and 10.', i)
    needBySku[design.sku] = (needBySku[design.sku] ?? 0) + qty
    return { design, qty }
  })
  for (const [s, need] of Object.entries(needBySku)) {
    if ((inventory[s] ?? 0) < need) {
      const idx = resolved.findIndex((r) => r.design.sku === s)
      throw new QuoteError(`Only ${inventory[s] ?? 0} left of ${resolved[idx].design.modelName} in ${resolved[idx].design.colorName}.`, idx)
    }
  }
  let subtotal = 0
  let personalization = 0
  let shipping = 0
  const out = resolved.map(({ design, qty }, i) => {
    subtotal += design.pricing.baseCents * qty
    personalization += design.pricing.personalizationCents * qty
    shipping += market.rates[design.modelId] * qty
    return { lineNo: i + 1, design, qty, title: designTitle(design) }
  })
  const tax = 0 // TODO(ops/finance): market tax rules or Stripe Tax; shown as a separate line
  return {
    currency: CURRENCY,
    country,
    lines: out,
    subtotalCents: subtotal,
    personalizationCents: personalization,
    shippingCents: shipping,
    taxCents: tax,
    totalCents: subtotal + personalization + shipping + tax,
    productionTime: PRODUCTION_DAYS,
    transitTime: market.transit,
  }
}

export type Quote = ReturnType<typeof quote>
export type QuoteLine = Quote['lines'][number] & { design: DesignSnapshot }
