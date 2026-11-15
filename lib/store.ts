import 'server-only'
import { db, type Queryable } from './db'
import type { DesignSnapshot } from './design'

export interface OrderLine {
  lineNo: number
  designId: string
  designVersion: number
  sku: string
  qty: number
  unitCents: number
  title: string
}

export type OrderStatus = 'pending_payment' | 'paid' | 'needs_review' | 'expired' | 'cancelled'

export interface Order {
  id: string
  number: string
  token: string
  status: OrderStatus
  createdAt: string
  paidAt?: string
  currency: string
  country: string
  lines: OrderLine[]
  subtotalCents: number
  personalizationCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  stripeSessionId?: string
  paymentIntentId?: string
  attribution?: Record<string, string>
  events: { at: string; type: string; note?: string }[]
}

export interface ProductionJob {
  id: string
  key: string // orderId:lineNo:designVersion — one active job per key
  orderId: string
  orderNumber: string
  lineNo: number
  designId: string
  qty: number
  needsTransfer: boolean
  status: 'queued' | 'accepted' | 'in_production' | 'qc_passed' | 'rejected'
  createdAt: string
}

type Row<T> = { data: T }

// ---- designs
export async function getDesign(id: string): Promise<DesignSnapshot | undefined> {
  const { rows } = await (await db()).query<Row<DesignSnapshot>>('SELECT data FROM designs WHERE id = $1', [id])
  return rows[0]?.data
}

export async function insertDesign(d: DesignSnapshot) {
  await (await db()).query('INSERT INTO designs (id, lineage, version, created_at, data) VALUES ($1, $2, $3, $4, $5)', [
    d.id,
    d.lineage,
    d.version,
    d.createdAt,
    JSON.stringify(d),
  ])
}

// ---- orders
export async function getOrder(id: string): Promise<Order | undefined> {
  const { rows } = await (await db()).query<Row<Order>>('SELECT data FROM orders WHERE id = $1', [id])
  return rows[0]?.data
}

export async function insertOrder(o: Order) {
  await (await db()).query('INSERT INTO orders (id, number, status, created_at, data) VALUES ($1, $2, $3, $4, $5)', [
    o.id,
    o.number,
    o.status,
    o.createdAt,
    JSON.stringify(o),
  ])
}

async function saveOrder(q: Queryable, o: Order) {
  await q.query('UPDATE orders SET status = $2, data = $3 WHERE id = $1', [o.id, o.status, JSON.stringify(o)])
}

// ---- inventory
export async function getInventory(): Promise<Record<string, number>> {
  const { rows } = await (await db()).query<{ sku: string; qty: number }>('SELECT sku, qty FROM inventory')
  return Object.fromEntries(rows.map((r) => [r.sku, Number(r.qty)]))
}

// ---- jobs
export async function listJobs(status?: string | null): Promise<ProductionJob[]> {
  const { rows } = status
    ? await (await db()).query<Row<ProductionJob>>('SELECT data FROM jobs WHERE status = $1 ORDER BY created_at', [status])
    : await (await db()).query<Row<ProductionJob>>('SELECT data FROM jobs ORDER BY created_at')
  return rows.map((r) => r.data)
}

export async function getJob(id: string): Promise<ProductionJob | undefined> {
  const { rows } = await (await db()).query<Row<ProductionJob>>('SELECT data FROM jobs WHERE id = $1', [id])
  return rows[0]?.data
}

// ---- payment events (atomic)
export interface PaymentContext {
  order: Order
  /** current stock for the order's SKUs (rows locked) — mutate to change */
  inventory: Record<string, number>
  designHasName: Record<string, boolean>
  activeJobKeys: Set<string>
  /** push new jobs to create */
  newJobs: ProductionJob[]
}

/**
 * Applies a payment-provider event exactly once. The event id is recorded,
 * and the order + its inventory rows are locked, in one transaction.
 * Returns false when the event was already processed or the order is unknown.
 */
export async function applyPaymentEvent(eventId: string, orderId: string, fn: (ctx: PaymentContext) => void): Promise<boolean> {
  return (await db()).transaction(async (q) => {
    const ins = await q.query<{ id: string }>('INSERT INTO processed_events (id) VALUES ($1) ON CONFLICT (id) DO NOTHING RETURNING id', [eventId])
    if (ins.rows.length === 0) return false // duplicate delivery

    const o = await q.query<Row<Order>>('SELECT data FROM orders WHERE id = $1 FOR UPDATE', [orderId])
    const order = o.rows[0]?.data
    if (!order) return false

    const skus = Array.from(new Set(order.lines.map((l) => l.sku)))
    const inv = await q.query<{ sku: string; qty: number }>('SELECT sku, qty FROM inventory WHERE sku = ANY($1) ORDER BY sku FOR UPDATE', [skus])
    const inventory: Record<string, number> = Object.fromEntries(inv.rows.map((r) => [r.sku, Number(r.qty)]))
    const before = { ...inventory }

    const ids = order.lines.map((l) => l.designId)
    const ds = await q.query<{ id: string; has_name: boolean }>("SELECT id, (data->'name') IS NOT NULL AND data->'name' <> 'null'::jsonb AS has_name FROM designs WHERE id = ANY($1)", [ids])
    const designHasName = Object.fromEntries(ds.rows.map((r) => [r.id, !!r.has_name]))

    const jk = await q.query<{ job_key: string }>("SELECT job_key FROM jobs WHERE order_id = $1 AND status <> 'rejected'", [orderId])
    const ctx: PaymentContext = { order, inventory, designHasName, activeJobKeys: new Set(jk.rows.map((r) => r.job_key)), newJobs: [] }

    fn(ctx)

    for (const [sku, qty] of Object.entries(ctx.inventory)) {
      if (qty !== before[sku]) await q.query('UPDATE inventory SET qty = $2 WHERE sku = $1', [sku, qty])
    }
    await saveOrder(q, ctx.order)
    for (const j of ctx.newJobs) {
      await q.query(
        "INSERT INTO jobs (id, job_key, order_id, status, created_at, data) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (job_key) WHERE status <> 'rejected' DO NOTHING",
        [j.id, j.key, j.orderId, j.status, j.createdAt, JSON.stringify(j)],
      )
    }
    return true
  })
}
