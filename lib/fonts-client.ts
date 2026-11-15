'use client'

import { parse, type Font } from 'opentype.js'
import { FONTS } from './catalog'

const cache = new Map<string, Promise<Font>>()

export function loadClientFont(fontId: string): Promise<Font> {
  const meta = FONTS.find((f) => f.id === fontId)
  if (!meta) return Promise.reject(new Error(`Unknown font ${fontId}`))
  const key = `${meta.id}@${meta.version}`
  let p = cache.get(key)
  if (!p) {
    p = fetch(meta.file)
      .then((r) => {
        if (!r.ok) throw new Error(`Font ${meta.name} failed to load`)
        return r.arrayBuffer()
      })
      .then((buf) => parse(buf))
    p.catch(() => cache.delete(key))
    cache.set(key, p)
  }
  return p
}
