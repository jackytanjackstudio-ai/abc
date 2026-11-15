'use client'

import { useEffect } from 'react'
import { captureAttribution, track } from '@/lib/analytics'

export default function LandingTracker({ page, patternId, series }: { page: string; patternId?: string; series?: string }) {
  useEffect(() => {
    captureAttribution(patternId ? { landing_pattern: patternId } : {})
    track('landing_view', { page, pattern_id: patternId, series })
  }, [page, patternId, series])
  return null
}
