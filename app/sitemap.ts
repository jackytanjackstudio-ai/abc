import type { MetadataRoute } from 'next'
import { MODELS, SERIES } from '@/lib/catalog'

// Public, indexable pages only (no cart, checkout, studio or order pages).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return [
    '',
    '/products',
    '/collections',
    '/help',
    '/contact',
    ...SERIES.map((s) => `/collections/${s.id}`),
    ...MODELS.map((m) => `/products/${m.id}`),
  ].map((p) => ({ url: `${base}${p}` }))
}
