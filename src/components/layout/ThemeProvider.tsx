'use client'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // ── Variables CSS ────────────────────────────────────────────────────
    root.style.setProperty('--color-background',     theme.colors.background)
    root.style.setProperty('--color-surface',        theme.colors.surface)
    root.style.setProperty('--color-card',           theme.colors.card)
    root.style.setProperty('--color-primary',        theme.colors.primary)
    root.style.setProperty('--color-primary-light',  theme.colors.primaryLight)
    root.style.setProperty('--color-secondary',      theme.colors.secondary)
    root.style.setProperty('--color-secondary-light',theme.colors.secondaryLight)
    root.style.setProperty('--color-text',           theme.colors.text)
    root.style.setProperty('--color-text-muted',     theme.colors.textMuted)
    root.style.setProperty('--color-border',         theme.colors.border)
    root.style.setProperty('--color-glow1',          theme.colors.glow1)
    root.style.setProperty('--color-glow2',          theme.colors.glow2)

    // ── Body couleurs ─────────────────────────────────────────────────────
    document.body.style.backgroundColor = theme.colors.background
    document.body.style.color = theme.colors.text

    // ── CSS global du thème (effets spéciaux par thème) ───────────────────
    const oldStyle = document.getElementById('theme-global-css')
    if (oldStyle) oldStyle.remove()
    if (theme.globalCSS) {
      const style = document.createElement('style')
      style.id = 'theme-global-css'
      style.textContent = theme.globalCSS
      document.head.appendChild(style)
    }
  }, [theme])

  return (
    <>
      {/* Spacer fixe pour le Navbar (64px) + safe area iOS */}
      <div style={{ height: '64px', flexShrink: 0 }} aria-hidden="true" />
      {/* Contenu principal avec padding bottom pour la BottomNav (64px) */}
      <main style={{
        minHeight: 'calc(100vh - 64px)',
        paddingBottom: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        boxSizing: 'border-box',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </main>
    </>
  )
}
