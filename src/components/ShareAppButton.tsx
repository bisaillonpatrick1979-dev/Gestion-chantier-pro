'use client'

import { useState } from 'react'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'

export default function ShareAppButton() {
  const { lang } = useLangStore()
  const { themeId } = useThemeStore()
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
    <>
      <style>{`
        @keyframes shareButtonShine {
          0% { transform: translateX(-130%); opacity: 0; }
          18% { opacity: 0.95; }
          42% { transform: translateX(130%); opacity: 0; }
          100% { transform: translateX(130%); opacity: 0; }
        }
      `}</style>
      <button
        type="button"
        onClick={handleShare}
        title={label}
        aria-label={label}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '9px 18px',
          minWidth: 118,
          borderRadius: 999,
          cursor: 'pointer',
          border: isDeco ? '1px solid rgba(242,210,122,0.75)' : '1px solid rgba(255,255,255,0.45)',
          background: isDeco
            ? 'linear-gradient(135deg, #5d3e08 0%, #d6b25e 34%, #fff0a8 50%, #c79625 68%, #4c3208 100%)'
            : 'linear-gradient(135deg, #7c2d12 0%, #ff7a14 30%, #ffd36a 50%, #ff5a14 70%, #431407 100%)',
          color: '#120905',
          fontSize: 14,
          fontWeight: 950,
          letterSpacing: '0.7px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          boxShadow: isDeco
            ? '0 0 18px rgba(214,178,94,0.42), inset 0 1px 0 rgba(255,255,255,0.72)'
            : '0 0 18px rgba(255,122,20,0.48), inset 0 1px 0 rgba(255,255,255,0.65)',
          textShadow: '0 1px 1px rgba(255,255,255,0.38)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.72) 42%, transparent 58%)',
            transform: 'translateX(-120%)',
            animation: 'shareButtonShine 3.2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <span style={{ position: 'relative', zIndex: 1 }}>🔗 {label}</span>
      </button>
    </>
  )
}
