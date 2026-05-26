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
    const infernalOverrides = themeId === 'inferno' ? `
      :root {
        --card: transparent !important;
        --card-alt: transparent !important;
        --surface: transparent !important;
      }
      body[data-theme='inferno'] :is(
        .inferno-card-glow,
        .bg-white\\/5, .bg-white\\/10, .bg-white\\/20,
        .rounded-xl, .rounded-2xl,
        [class*='card'], [class*='panel'],
        div[style*='var(--card)'], div[style*='var(--surface)'],
        [role='dialog'] > div
      ) {
        background: transparent !important;
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-color: rgba(255, 110, 35, 0.46) !important;
      }
      body[data-theme='inferno'] :is(h1,h2,h3,h4,p,span,label,small,button) {
        text-shadow: 0 1px 2px rgba(0,0,0,.85), 0 0 10px rgba(255,122,20,.26);
      }
    ` : ''
    styleEl.textContent = (theme.globalCSS ?? '') + infernalOverrides

    // ── 3. Appliquer data-theme sur le body ───────────────────────────────
    document.body.setAttribute('data-theme', themeId)

  }, [theme, themeId])

  return null
}
