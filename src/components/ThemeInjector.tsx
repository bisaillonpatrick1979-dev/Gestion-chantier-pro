'use client'
// src/components/ThemeInjector.tsx
// Injecte le CSS global du thème actif dans le <head>
// À placer dans le layout principal

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeInjector() {
  const { theme } = useThemeStore()

  useEffect(() => {
    // Supprimer l'ancien style injecté
    const old = document.getElementById('theme-global-css')
    if (old) old.remove()

    // Injecter le nouveau CSS si le thème en a
    if (theme.globalCSS) {
      const style = document.createElement('style')
      style.id = 'theme-global-css'
      style.textContent = theme.globalCSS
      document.head.appendChild(style)
    }

    // Appliquer la couleur de fond au body
    document.body.style.background = theme.colors.background
    document.body.style.color = theme.colors.text

    return () => {
      const el = document.getElementById('theme-global-css')
      if (el) el.remove()
    }
  }, [theme])

  return null
}

