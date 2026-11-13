'use client'

import { useSyncExternalStore } from 'react'
import type { DesignSnapshot } from './design'

export interface CartLine {
  lineId: string
  qty: number
  design: DesignSnapshot
}

const KEY = 'viarou_cart_v1'
const listeners = new Set<() => void>()
let cache: CartLine[] | null = null

function load(): CartLine[] {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    cache = []
  }
  return cache!
}

function save(lines: CartLine[]) {
  cache = lines
  try {
    localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    /* storage full / blocked: cart lives for this tab only */
  }
  listeners.forEach((l) => l())
}

const EMPTY: CartLine[] = []

export function useCart() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null
          cb()
        }
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(cb)
        window.removeEventListener('storage', onStorage)
      }
    },
    load,
    () => EMPTY,
  )
}

export const cart = {
  get: load,
  add(design: DesignSnapshot, qty: number) {
    const lineId = Math.random().toString(36).slice(2, 10)
    save([...load(), { lineId, qty, design }])
    return lineId
  },
  /** Replace a line's design with a newer version (edit from cart). */
  replace(lineId: string, design: DesignSnapshot, qty?: number) {
    save(load().map((l) => (l.lineId === lineId ? { ...l, design, qty: qty ?? l.qty } : l)))
  },
  setQty(lineId: string, qty: number) {
    save(load().map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)))
  },
  remove(lineId: string) {
    save(load().filter((l) => l.lineId !== lineId))
  },
  clear() {
    save([])
  },
}
