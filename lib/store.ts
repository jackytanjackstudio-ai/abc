import 'server-only'
import fs from 'fs'
import path from 'path'
import { DEFAULT_STOCK } from './catalog'
import type { DesignSnapshot } from './design'

// MVP persistence: JSON files under data/runtime (git-ignored). Writes are
// serialised in-process. This does NOT work on read-only/serverless hosts
// (e.g. Vercel) or across multiple instances — swap for a database before launch.

const DIR = path.join(process.cwd(), 'data', 'runtime')

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

interface Db {
  designs: Record<string, DesignSnapshot>
  orders: Record<string, Order>
  jobs: Record<string, ProductionJob>
  inventory: Record<string, number>
  processedEvents: string[]
}

function file(name: keyof Db) {
  return path.join(DIR, `${name}.json`)
}

function read<K extends keyof Db>(name: K, fallback: Db[K]): Db[K] {
  try {
    return JSON.parse(fs.readFileSync(file(name), 'utf-8'))
  } catch {
    return fallback
  }
}

function write<K extends keyof Db>(name: K, value: Db[K]) {
  fs.mkdirSync(DIR, { recursive: true })
  const tmp = file(name) + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2))
  fs.renameSync(tmp, file(name))
}

let queue: Promise<unknown> = Promise.resolve()

/** Run a read-modify-write transaction; transactions run one at a time. */
export function tx<T>(fn: (db: Db) => T): Promise<T> {
  const run = queue.then(() => {
    const db: Db = {
      designs: read('designs', {}),
      orders: read('orders', {}),
      jobs: read('jobs', {}),
      inventory: { ...DEFAULT_STOCK, ...read('inventory', {}) },
      processedEvents: read('processedEvents', []),
    }
    const before = JSON.stringify(db)
    const result = fn(db)
    if (JSON.stringify(db) !== before) {
      ;(Object.keys(db) as (keyof Db)[]).forEach((k) => write(k, db[k] as never))
    }
    return result
  })
  queue = run.catch(() => undefined)
  return run
}

export function readDesign(id: string): DesignSnapshot | undefined {
  return read('designs', {})[id]
}

export function readOrder(id: string): Order | undefined {
  return read('orders', {})[id]
}

export function readInventory(): Record<string, number> {
  return { ...DEFAULT_STOCK, ...read('inventory', {}) }
}

export function readJobs(): ProductionJob[] {
  return Object.values(read('jobs', {}))
}
