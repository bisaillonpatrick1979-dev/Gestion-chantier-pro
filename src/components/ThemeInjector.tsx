'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

const INFERNAL_OVERRIDES = `
  body[data-theme="inferno"] {
    --surface: transparent !important;
    --card: transparent !important;
    --card-alt: transparent !important;
    --border: rgba(255,110,35,0.48) !important;
    --border-strong: rgba(255,164,64,0.82) !important;
    --text: #fff4df !important;
    --text-muted: rgba(255,205,150,0.78) !important;
    background:
      radial-gradient(ellipse at 50% 8%, rgba(255,126,26,0.18), transparent 38%),
      radial-gradient(ellipse at 12% 72%, rgba(255,56,0,0.34), transparent 40%),
      radial-gradient(ellipse at 88% 72%, rgba(255,86,10,0.36), transparent 42%),
      radial-gradient(ellipse at 50% 104%, rgba(255,126,26,0.22), transparent 54%),
      linear-gradient(180deg, #070403 0%, #090403 42%, #030303 100%) !important;
    background-attachment: fixed !important;
  }

  body[data-theme="inferno"] .inferno-card-glow {
    position: relative !important;
    overflow: hidden !important;
    isolation: isolate !important;
    background:
      radial-gradient(ellipse at 50% 47%, rgba(255,95,20,0.12), transparent 34%),
      radial-gradient(ellipse at 15% 78%, rgba(255,70,0,0.22), transparent 30%),
      radial-gradient(ellipse at 85% 78%, rgba(255,82,0,0.24), transparent 32%),
      linear-gradient(180deg, rgba(10,4,2,0.18), rgba(0,0,0,0.08)) !important;
    border: 1px solid rgba(255,104,32,0.54) !important;
    border-radius: 28px !important;
    box-shadow:
      0 0 0 1px rgba(255,150,45,0.10) inset,
      0 0 38px rgba(255,74,0,0.16),
      0 18px 45px rgba(0,0,0,0.58) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  body[data-theme="inferno"] .inferno-card-glow::before {
    content: '' !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: 0 !important;
    pointer-events: none !important;
    border-radius: inherit !important;
    padding: 0 !important;
    background:
      repeating-linear-gradient(115deg, rgba(255,110,35,0.045) 0px, rgba(255,110,35,0.045) 1px, transparent 1px, transparent 8px),
      radial-gradient(ellipse at 8% 78%, rgba(255,210,90,0.42), transparent 14%),
      radial-gradient(ellipse at 19% 70%, rgba(255,110,18,0.48), transparent 26%),
      radial-gradient(ellipse at 32% 62%, rgba(190,35,0,0.28), transparent 34%),
      radial-gradient(ellipse at 92% 78%, rgba(255,210,90,0.42), transparent 14%),
      radial-gradient(ellipse at 81% 70%, rgba(255,110,18,0.48), transparent 26%),
      radial-gradient(ellipse at 68% 62%, rgba(190,35,0,0.28), transparent 34%),
      radial-gradient(ellipse at 50% 100%, rgba(255,130,28,0.30), transparent 42%) !important;
    filter: saturate(1.35) contrast(1.08) !important;
    opacity: 0.95 !important;
    -webkit-mask: none !important;
    mask: none !important;
    animation: infernalPanelLife 7s ease-in-out infinite alternate !important;
  }

  body[data-theme="inferno"] .inferno-card-glow::after {
    content: '' !important;
    position: absolute !important;
    left: -12% !important;
    right: -12% !important;
    bottom: -18% !important;
    height: 48% !important;
    z-index: 1 !important;
    pointer-events: none !important;
    border-radius: 0 !important;
    background:
      radial-gradient(ellipse at 18% 70%, rgba(255,185,55,0.46), transparent 18%),
      radial-gradient(ellipse at 28% 76%, rgba(255,70,0,0.34), transparent 28%),
      radial-gradient(ellipse at 72% 76%, rgba(255,88,0,0.36), transparent 30%),
      radial-gradient(ellipse at 84% 70%, rgba(255,185,55,0.44), transparent 18%),
      linear-gradient(90deg, transparent, rgba(255,60,0,0.18), rgba(255,150,40,0.28), rgba(255,60,0,0.18), transparent) !important;
    filter: blur(13px) saturate(1.45) contrast(1.16) !important;
    mix-blend-mode: screen !important;
    opacity: 0.96 !important;
    animation: infernalFloorPulse 4.8s ease-in-out infinite !important;
  }

  body[data-theme="inferno"] .inferno-card-glow > * {
    position: relative !important;
    z-index: 4 !important;
  }

  body[data-theme="inferno"] .inferno-card-glow div[style*="repeating-linear-gradient(-45deg"],
  body[data-theme="inferno"] .inferno-card-glow div[style*="repeating-linear-gradient(45deg"],
  body[data-theme="inferno"] .inferno-card-glow div[style*="clip-path"],
  body[data-theme="inferno"] .inferno-card-glow div[style*="clipPath"] {
    display: none !important;
  }

  body[data-theme="inferno"] .inferno-card-glow button {
    position: relative !important;
    z-index: 8 !important;
    overflow: hidden !important;
    transform: translateZ(0) !important;
    box-shadow:
      0 0 0 4px rgba(255,96,20,0.56),
      0 0 64px rgba(255,96,20,0.64),
      0 0 128px rgba(255,60,0,0.32),
      inset 0 8px 18px rgba(255,235,170,0.30),
      inset 0 -10px 22px rgba(88,10,2,0.48),
      0 14px 46px rgba(0,0,0,0.84) !important;
  }

  body[data-theme="inferno"] .inferno-card-glow button::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    background:
      radial-gradient(circle at 33% 28%, rgba(255,255,220,0.40), transparent 18%),
      radial-gradient(circle at 68% 72%, rgba(170,20,0,0.30), transparent 34%),
      repeating-linear-gradient(135deg, transparent 0px, transparent 14px, rgba(255,210,90,0.09) 15px, transparent 17px);
    mix-blend-mode: screen;
    opacity: 0.78;
  }

  body[data-theme="inferno"] .inferno-card-glow button::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    pointer-events: none;
    border: 1px solid rgba(255,220,120,0.32);
    box-shadow:
      inset 0 0 22px rgba(255,210,90,0.22),
      0 0 30px rgba(255,92,20,0.30);
  }

  body[data-theme="inferno"] .inferno-card-glow button > * {
    position: relative !important;
    z-index: 2 !important;
  }

  body[data-theme="inferno"] .inferno-card-glow::selection {
    background: rgba(255, 100, 20, 0.35);
  }

  body[data-theme="inferno"] .inferno-card-glow {
    background-image:
      radial-gradient(circle at 18% 36%, rgba(255,210,90,0.82) 0 1px, transparent 2px),
      radial-gradient(circle at 32% 68%, rgba(255,96,20,0.68) 0 1px, transparent 2px),
      radial-gradient(circle at 74% 38%, rgba(255,210,90,0.78) 0 1px, transparent 2px),
      radial-gradient(circle at 88% 68%, rgba(255,66,0,0.70) 0 1px, transparent 2px) !important;
    background-size: 190px 190px, 260px 260px, 230px 230px, 330px 330px !important;
    animation: infernalEmbersInPanel 15s linear infinite !important;
  }

  @keyframes infernalPanelLife {
    from { transform: translate3d(-1.5%, 1.5%, 0) scale(1); opacity: 0.78; }
    to { transform: translate3d(1.5%, -2%, 0) scale(1.05); opacity: 1; }
  }

  @keyframes infernalFloorPulse {
    0%, 100% { transform: scaleX(1) translateY(0); opacity: 0.68; }
    50% { transform: scaleX(1.08) translateY(-7px); opacity: 1; }
  }

  @keyframes infernalEmbersInPanel {
    from { background-position: 20px 210px, 90px 260px, 150px 220px, 210px 320px; }
    to { background-position: 70px -190px, 20px -260px, 200px -230px, 110px -330px; }
  }
`

export default function ThemeProvider() {
  const { theme, themeId } = useThemeStore()

  useEffect(() => {
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

    if (themeId === 'inferno') {
      root.style.setProperty('--surface', 'transparent')
      root.style.setProperty('--card', 'transparent')
      root.style.setProperty('--card-alt', 'transparent')
    }

    const styleId = 'gcp-theme-css'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = `${theme.globalCSS ?? ''}\n${themeId === 'inferno' ? INFERNAL_OVERRIDES : ''}`

    document.body.setAttribute('data-theme', themeId)
  }, [theme, themeId])

  return null
}
