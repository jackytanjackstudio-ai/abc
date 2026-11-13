import 'server-only'
import fs from 'fs'
import path from 'path'
import { parse, type Font } from 'opentype.js'
import { getFont } from './catalog'

const cache = new Map<string, Font>()

/** Loads the exact versioned font file the browser preview uses (public/fonts). */
export function loadServerFont(fontId: string): Font | null {
  const meta = getFont(fontId)
  if (!meta) return null
  const key = `${meta.id}@${meta.version}`
  const hit = cache.get(key)
  if (hit) return hit
  const buf = fs.readFileSync(path.join(process.cwd(), 'public', meta.file))
  const font = parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
  cache.set(key, font)
  return font
}
