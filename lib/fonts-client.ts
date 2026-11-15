'use client'

import { parse, type Font } from 'opentype.js'
import { FONTS, fontVariant } from './catalog'

const cache = new Map<string, Promise<Font>>()

/** Loads the same versioned font file the server measures with (upright or designed italic). */
export function loadClientFont(fontId: string, italic = false): Promise<Font> {
  const meta = FONTS.find((f) => f.id === fontId)
  if (!meta) return Promise.reject(new Error(`Unknown font ${fontId}`))
  const v = fontVariant(meta, italic)
  let p = cache.get(v.key)
  if (!p) {
    p = fetch(v.file)
      .then((r) => {
        if (!r.ok) throw new Error(`Font ${meta.name} failed to load`)
        return r.arrayBuffer()
      })
      .then((buf) => parse(buf))
    p.catch(() => cache.delete(v.key))
    cache.set(v.key, p)
  }
  return p
}

/** Cache key for a font + italic choice (matches loadClientFont). */
export function fontKey(fontId: string, italic: boolean) {
  const meta = FONTS.find((f) => f.id === fontId)
  return meta ? fontVariant(meta, italic).key : fontId
}
