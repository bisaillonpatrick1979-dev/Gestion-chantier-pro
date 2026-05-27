'use client'

import { useState } from 'react'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'

export default function ShareAppButton() {
  const { lang } = useLangStore()
  const { theme, themeId } = useThemeStore()
  const [copied, setCopied] = useState(false)
  const isDeco = themeId === 'deco'

  const label = copied ? (lang === 'fr' ? 'Copié' : 'Copied') : (lang === 'fr' ? 'Partager' : 'Share')

  const handleShare = async () => {
    const url = window.location.origin
    const title = 'Gestion Chantier Pro'
    const text = lang === 'fr'
      ? 'Application de gestion de chantier, temps, employés, clients et facturation.'
      : 'Jobsite management app for time, employees, clients, and invoicing.'

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={label}
      aria-label={label}
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        cursor: 'pointer',
        border: isDeco ? '1px solid rgba(214,178,94,0.45)' : `1px solid ${theme.colors.border}`,
        background: isDeco ? 'rgba(214,178,94,0.12)' : theme.colors.glow1,
        color: isDeco ? '#D6B25E' : theme.colors.primary,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      🔗 <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
