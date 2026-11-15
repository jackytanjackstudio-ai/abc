import 'server-only'
import fs from 'fs'
import path from 'path'
import { parse, type Font } from 'opentype.js'
import { fontVariant, getFont } from './catalog'

const cache = new Map<string, Font>()

/**
 * Loads the exact versioned font file the browser preview uses (public/fonts).
 * Returns the parsed font plus the oblique angle to apply for synthetic italics.
 */
export function loadServerFont(fontId: string, italic = false): { font: Font; obliqueDeg: number } | null {
  const meta = getFont(fontId)
  if (!meta) return null
  const v = fontVariant(meta, italic)
  let font = cache.get(v.key)
  if (!font) {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', v.file))
    font = parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
    cache.set(v.key, font)
  }
  return { font, obliqueDeg: v.obliqueDeg }
}
