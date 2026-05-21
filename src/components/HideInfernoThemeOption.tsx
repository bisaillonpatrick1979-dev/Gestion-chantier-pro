'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function HideInfernoThemeOption() {
  const { themeId, setTheme } = useThemeStore()

  useEffect(() => {
    if (themeId === 'inferno') setTheme('quantum')
  }, [themeId, setTheme])

  useEffect(() => {
    const timer = window.setInterval(() => {
      document.querySelectorAll('button').forEach(button => {
        if ((button.textContent || '').includes('Inferno')) button.remove()
      })
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  return null
}
