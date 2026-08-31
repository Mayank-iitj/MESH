'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({ interval = 3000 }: { interval?: number }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      // Only refresh if the document is visible to save resources
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [router, interval])

  return null // This component doesn't render anything
}
