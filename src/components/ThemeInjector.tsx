'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeProvider() {
  const { theme, themeId } = useThemeStore()

  useEffect(() => {
    // ── 1. Injecter les variables CSS dans :root ──────────────────────────
    const root = document.documentElement
    const c = theme.colors
    root.style.setProperty('--background',    c.background)
    root.style.setProperty('--surface',       c.surface)
    root.style.setProperty('--card',          c.card)
    root.style.setProperty('--card-alt',      c.cardAlt)
    root.style.setProperty('--border',        c.border)
    root.style.setProperty('--border-strong', c.borderStrong)
    root.style.setProperty('--text',          c.text)
    root.style.setProperty('--text-muted',    c.textMuted)
    root.style.setProperty('--text-weak',     c.textWeak)
    root.style.setProperty('--primary',       c.primary)
    root.style.setProperty('--primary-light', c.primaryLight)
    root.style.setProperty('--secondary',     c.secondary)
    root.style.setProperty('--secondary-light',c.secondaryLight)
    root.style.setProperty('--glow1',         c.glow1)
    root.style.setProperty('--glow2',         c.glow2)
    root.style.setProperty('--success',       c.success)
    root.style.setProperty('--warning',       c.warning)
    root.style.setProperty('--danger',        c.danger)
    root.style.setProperty('--info',          c.info)
    root.style.setProperty('--nav-bg',        c.navBackground)
    root.style.setProperty('--nav-border',    c.navBorder)
    root.style.setProperty('--nav-active',    c.navActive)
    root.style.setProperty('--nav-inactive',  c.navInactive)

    // ── 2. Injecter le globalCSS du thème ────────────────────────────────
    const styleId = 'gcp-theme-css'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = theme.globalCSS ?? ''

    // ── 3. Appliquer data-theme sur le body ───────────────────────────────
    document.body.setAttribute('data-theme', themeId)

  }, [theme, themeId])

  return null
}
