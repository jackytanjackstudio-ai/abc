import type { Metadata } from 'next'
import Studio from '@/components/studio/Studio'
import { getInventory } from '@/lib/store'

export const dynamic = 'force-dynamic'

// The studio can hold a customer's personal design → never indexed.
export const metadata: Metadata = { title: 'Personalize', robots: { index: false, follow: true } }

export default async function StudioPage({
  searchParams,
}: {
  searchParams: { model?: string; color?: string; pattern?: string; design?: string; line?: string }
}) {
  return <Studio key={`${searchParams.design ?? ''}${searchParams.line ?? ''}`} inventory={await getInventory()} initial={searchParams} />
}
