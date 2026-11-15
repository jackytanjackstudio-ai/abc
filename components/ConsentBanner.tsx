'use client'

import { useEffect, useState } from 'react'
import { captureAttribution, getConsent, setConsent } from '@/lib/analytics'

export default function ConsentBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    captureAttribution()
    setShow(getConsent() === null)
  }, [])
  if (!show) return null
  const choose = (v: 'granted' | 'denied') => {
    setConsent(v)
    setShow(false)
  }
  return (
    <div role="region" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-50 border-t border-forest/15 bg-paper p-4 shadow-lg">
      <div className="container-custom flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          We use analytics to understand which patterns people explore. We never record the names you type.
        </p>
        <div className="flex gap-2">
          <button className="chip" onClick={() => choose('denied')}>Decline</button>
          <button className="chip chip-active" onClick={() => choose('granted')}>Accept</button>
        </div>
      </div>
    </div>
  )
}
