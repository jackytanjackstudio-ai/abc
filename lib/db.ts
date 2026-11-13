import 'server-only'
import path from 'path'
import { DEFAULT_STOCK } from './catalog'

// One SQL code path for every environment:
//  - DATABASE_URL / POSTGRES_URL set → real Postgres via `pg` (Vercel Postgres, Neon, Supabase…)
//  - otherwise → PGlite (Postgres compiled to WASM) persisted under data/runtime/pglite, for local dev
// Both run the same SQL, so local testing exercises production queries.

export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
}

interface Db extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS designs (
  id text PRIMARY KEY,
  lineage text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  number text NOT NULL UNIQUE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  job_key text NOT NULL,
  order_id text NOT NULL REFERENCES orders(id),
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  data jsonb NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_active_key ON jobs (job_key) WHERE status <> 'rejected';
CREATE TABLE IF NOT EXISTS inventory (
  sku text PRIMARY KEY,
  qty integer NOT NULL CHECK (qty >= 0)
);
CREATE TABLE IF NOT EXISTS processed_events (
  id text PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now()
);
`

async function seed(db: Queryable) {
  for (const [sku, qty] of Object.entries(DEFAULT_STOCK)) {
    await db.query('INSERT INTO inventory (sku, qty) VALUES ($1, $2) ON CONFLICT (sku) DO NOTHING', [sku, qty])
  }
}

async function createPg(url: string): Promise<Db> {
  const { Pool } = await import('pg')
  const pool = new Pool({
    connectionString: url,
    max: 5,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
  })
  return {
    query: (sql, params) => pool.query(sql, params as unknown[]) as never,
    async transaction(fn) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const out = await fn({ query: (s, p) => client.query(s, p as unknown[]) as never })
        await client.query('COMMIT')
        return out
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
    },
  }
}

async function createPglite(): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite')
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), 'data', 'runtime', 'pglite')
  const pg = dir === 'memory' ? new PGlite() : new PGlite(dir)
  return {
    query: (sql, params) => pg.query(sql, params as unknown[]) as never,
    transaction: (fn) => pg.transaction((tx) => fn({ query: (s, p) => tx.query(s, p as unknown[]) as never })),
  }
}

const g = globalThis as unknown as { __viarouDb?: Promise<Db> }

export function db(): Promise<Db> {
  if (!g.__viarouDb) {
    g.__viarouDb = (async () => {
      const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
      const d = url ? await createPg(url) : await createPglite()
      // multi-statement DDL: run statement by statement for driver portability
      for (const stmt of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) await d.query(stmt)
      await seed(d)
      return d
    })()
    g.__viarouDb.catch(() => (g.__viarouDb = undefined))
  }
  return g.__viarouDb
}
