'use client'

import { useEffect } from 'react'

export default function HideInfernoThemeOption() {
  useEffect(() => {
    const timer = window.setInterval(() => {
      document.querySelectorAll('button span').forEach(span => {
        if ((span.textContent || '').includes('Inferno')) span.textContent = 'Infernal'
      })
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  return null
}
