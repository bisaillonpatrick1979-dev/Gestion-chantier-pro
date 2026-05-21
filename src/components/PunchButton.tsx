'use client'
// src/components/PunchButton.tsx
// Bouton Punch In/Out — identité visuelle unique par thème

import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

interface PunchButtonProps {
  isRunning: boolean
  isOnBreak: boolean
  onPunch: () => void
  elapsed?: number
  revenue?: number
  disabled?: boolean
}

// ─── SVGs thématiques ────────────────────────────────────────────────────────

const FingerprintSVG = ({ color = 'white', size = 64 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 8C18.7 8 8 18.7 8 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
    <path d="M32 12C21 12 12 21 12 32c0 4.5 1.5 8.6 4 11.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    <path d="M32 16c-8.8 0-16 7.2-16 16 0 3.8 1.3 7.2 3.5 9.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M32 20c-6.6 0-12 5.4-12 12 0 2.8 1 5.4 2.6 7.4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
    <path d="M32 24c-4.4 0-8 3.6-8 8 0 1.8.6 3.5 1.6 4.8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="3" fill={color}/>
    <path d="M44 20.5C47.6 23.4 50 27.9 50 33c0 5.5-2.8 10.4-7 13.3" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    <path d="M40 16.8C44.8 19.5 48 24.9 48 31c0 4.2-1.6 8-4.2 10.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
)

const DecoDiamondSVG = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 6L40 20L24 44L8 20L24 6Z" stroke="#1A1200" strokeWidth="1.8" fill="none" opacity="0.7"/>
    <path d="M8 20H40" stroke="#1A1200" strokeWidth="1.5" opacity="0.5"/>
    <path d="M16 11L12 20M32 11L36 20" stroke="#1A1200" strokeWidth="1.5" opacity="0.4"/>
    <path d="M24 6L20 20L24 44L28 20L24 6Z" stroke="#1A1200" strokeWidth="1" opacity="0.3"/>
    <path d="M18 14L22 20" stroke="rgba(255,240,180,0.6)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const StarSVG = ({ color = '#FACC15', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6L26.5 17H38L28.5 23.5L32 35L22 28L12 35L15.5 23.5L6 17H17.5L22 6Z"
      stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3"/>
  </svg>
)

// 🔥 Flamme SVG pour Inferno
const FlameSVG = ({ size = 52 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <path d="M26 6C26 6 34 16 34 24C34 28.4 31.4 31 28 32C29 29 28 26 26 24C26 24 22 30 22 34C22 38.4 24 42 26 44C18 42 12 36 12 28C12 20 18 12 26 6Z"
      fill="url(#flameGrad1)" opacity="0.9"/>
    <path d="M26 18C26 18 30 24 30 28C30 31.3 28.2 33 26 34C23.8 33 22 31.3 22 28C22 24 26 18 26 18Z"
      fill="url(#flameGrad2)"/>
    <circle cx="26" cy="36" r="3" fill="#FFD060" opacity="0.8"/>
    <defs>
      <linearGradient id="flameGrad1" x1="26" y1="6" x2="26" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF3000"/>
        <stop offset="50%" stopColor="#FF6014"/>
        <stop offset="100%" stopColor="#FFD060"/>
      </linearGradient>
      <linearGradient id="flameGrad2" x1="26" y1="18" x2="26" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFD060"/>
        <stop offset="100%" stopColor="#FF9040"/>
      </linearGradient>
    </defs>
  </svg>
)

// 🧊 Flocon SVG pour Arctic
const SnowflakeSVG = ({ size = 52 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <line x1="26" y1="4" x2="26" y2="48" stroke="#80EEFF" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="4" y1="26" x2="48" y2="26" stroke="#80EEFF" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="9.5" y1="9.5" x2="42.5" y2="42.5" stroke="#80EEFF" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="42.5" y1="9.5" x2="9.5" y2="42.5" stroke="#80EEFF" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Branches */}
    <path d="M26 4L22 10M26 4L30 10" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 48L22 42M26 48L30 42" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 26L10 22M4 26L10 30" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M48 26L42 22M48 26L42 30" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9.5 9.5L14 16M9.5 9.5L16 14" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M42.5 9.5L38 16M42.5 9.5L36 14" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M42.5 42.5L38 36M42.5 42.5L36 38" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9.5 42.5L14 36M9.5 42.5L16 38" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="26" cy="26" r="6" stroke="#80EEFF" strokeWidth="2" fill="rgba(0,212,255,0.2)"/>
    <circle cx="26" cy="26" r="2.5" fill="#00D4FF"/>
  </svg>
)

// 🪙 Boulon SVG pour Carbon
const BoltSVG = ({ size = 52 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="20" stroke="url(#carbonGrad)" strokeWidth="2.5" fill="none"/>
    <circle cx="26" cy="26" r="14" stroke="rgba(200,200,200,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
    <circle cx="26" cy="26" r="8" stroke="url(#carbonGrad)" strokeWidth="2" fill="rgba(50,50,50,0.5)"/>
    {/* Vis hexagonale */}
    <polygon points="26,18 32,22 32,30 26,34 20,30 20,22" stroke="url(#carbonGrad)" strokeWidth="2" fill="none"/>
    <circle cx="26" cy="26" r="3" fill="url(#carbonGrad)"/>
    {/* Encoches */}
    <line x1="26" y1="6" x2="26" y2="10" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="26" y1="42" x2="26" y2="46" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="6" y1="26" x2="10" y2="26" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="42" y1="26" x2="46" y2="26" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="carbonGrad" x1="6" y1="6" x2="46" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#606060"/>
        <stop offset="35%" stopColor="#C0C0C0"/>
        <stop offset="50%" stopColor="#F0F0F0"/>
        <stop offset="65%" stopColor="#C0C0C0"/>
        <stop offset="100%" stopColor="#404040"/>
      </linearGradient>
    </defs>
  </svg>
)

// ─── Config par thème ────────────────────────────────────────────────────────

function getConfig(themeId: string, isRunning: boolean, isFr: boolean) {
  const t = (fr: string, en: string) => isFr ? fr : en

  const configs: Record<string, {
    wrapperClass: string
    wrapperStyle: React.CSSProperties
    buttonClass: string
    buttonStyle: React.CSSProperties
    decorLayers?: React.ReactNode
    icon: React.ReactNode
    labelLine1: string
    labelLine2: string
    statusText: string
    statusColor: string
    statusDotColor: string
    textColor: string
    extraCSS?: string
  }> = {

    // ── QUANTUM ──────────────────────────────────────────────────────────────
    quantum: {
      wrapperClass: 'quantum-card-glow',
      wrapperStyle: {
        background: 'rgba(6,16,40,0.90)',
        borderRadius: 24,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 180, height: 180, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 32%, #FF6B6B, #EF4444 45%, #B91C1C 80%)'
          : 'radial-gradient(circle at 38% 32%, #80E8FF, #38D9FF 35%, #2B7FFF 65%, #1A3ED4 90%)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(239,68,68,0.40), 0 0 40px rgba(239,68,68,0.35), 0 0 80px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,150,150,0.20), 0 8px 30px rgba(0,0,0,0.60)'
          : '0 0 0 3px rgba(43,127,255,0.45), 0 0 40px rgba(43,127,255,0.35), 0 0 80px rgba(56,217,255,0.15), inset 0 2px 4px rgba(56,217,255,0.20), 0 8px 30px rgba(0,0,0,0.60)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(43,127,255,0.04) 30px,rgba(43,127,255,0.04) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(43,127,255,0.04) 30px,rgba(43,127,255,0.04) 31px)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 220, height: 220, borderRadius: '50%',
            border: '1px solid rgba(43,127,255,0.15)',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 240, height: 240, borderRadius: '50%',
            border: '1px solid rgba(56,217,255,0.08)',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
        </>
      ),
      icon: <FingerprintSVG color="white" size={52} />,
      labelLine1: isRunning ? t('PUNCH OUT', 'PUNCH OUT') : t('PUNCH IN', 'PUNCH IN'),
      labelLine2: '',
      statusText: isRunning ? t('EN COURS', 'IN PROGRESS') : t('PRÊT À POINTER', 'READY'),
      statusColor: isRunning ? '#FFB020' : '#00E676',
      statusDotColor: isRunning ? '#FFB020' : '#00E676',
      textColor: 'white',
    },

    // ── XP ───────────────────────────────────────────────────────────────────
    xp: {
      wrapperClass: 'xp-card-glow',
      wrapperStyle: {
        background: 'rgba(20,10,52,0.92)',
        borderRadius: 24,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 190, height: 190, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 32%, #FB923C, #F97316 40%, #EA580C 70%, #C2410C 90%)'
          : 'radial-gradient(circle at 38% 32%, #E879F9, #C084FC 30%, #A855F7 60%, #7C3AED 90%)',
        boxShadow: isRunning
          ? '0 0 0 4px rgba(249,115,22,0.40), 0 0 50px rgba(249,115,22,0.40), 0 0 100px rgba(249,115,22,0.15), inset 0 2px 4px rgba(255,160,80,0.25), 0 8px 30px rgba(0,0,0,0.70)'
          : '0 0 0 4px rgba(168,85,247,0.45), 0 0 50px rgba(168,85,247,0.40), 0 0 100px rgba(168,85,247,0.15), inset 0 2px 4px rgba(232,121,249,0.25), 0 8px 30px rgba(0,0,0,0.70)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          {[0,45,90,135,180,225,270,315].map(deg => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 140, height: 1.5,
              background: isRunning
                ? 'linear-gradient(90deg, rgba(249,115,22,0.50), transparent)'
                : 'linear-gradient(90deg, rgba(168,85,247,0.50), transparent)',
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg)`,
              pointerEvents: 'none',
            }} />
          ))}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 230, height: 230, borderRadius: '50%',
            border: `1px solid ${isRunning ? 'rgba(249,115,22,0.15)' : 'rgba(168,85,247,0.15)'}`,
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
        </>
      ),
      icon: <StarSVG color="#FACC15" size={46} />,
      labelLine1: isRunning ? t('PUNCH OUT', 'PUNCH OUT') : t('PUNCH IN', 'PUNCH IN'),
      labelLine2: isRunning ? '' : t('Gagnez des XP!', 'Earn XP!'),
      statusText: isRunning ? t('🔥 EN COURSE', '🔥 IN PROGRESS') : t('✅ PRÊT', '✅ READY'),
      statusColor: isRunning ? '#F97316' : '#22C55E',
      statusDotColor: isRunning ? '#F97316' : '#22C55E',
      textColor: 'white',
    },

    // ── DECO ─────────────────────────────────────────────────────────────────
    deco: {
      wrapperClass: 'deco-punch-wrapper',
      wrapperStyle: { margin: '0 0 8px' },
      buttonClass: isRunning ? 'deco-punch-btn-out' : 'deco-punch-btn',
      buttonStyle: {
        width: 188, height: 188, borderRadius: '50%',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, position: 'relative',
      },
      decorLayers: (
        <>
          <div className="deco-rays-outer" />
          <div className="deco-rays-inner" />
          <div style={{ position:'absolute', top:'50%', left:'50%', width:218, height:218, borderRadius:'50%', border:'1px solid rgba(214,178,94,0.25)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', width:236, height:236, borderRadius:'50%', border:'1px solid rgba(214,178,94,0.12)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:8, right:8, width:28, height:28, borderTop:'2px solid rgba(214,178,94,0.75)', borderRight:'2px solid rgba(214,178,94,0.75)', pointerEvents:'none', zIndex:10 }} />
          <div style={{ position:'absolute', bottom:8, left:8, width:28, height:28, borderBottom:'2px solid rgba(214,178,94,0.75)', borderLeft:'2px solid rgba(214,178,94,0.75)', pointerEvents:'none', zIndex:10 }} />
        </>
      ),
      icon: <DecoDiamondSVG size={34} />,
      labelLine1: t('POINÇONNER', 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE', 'OUT') : t("L'ENTRÉE", 'IN'),
      statusText: isRunning ? t('● EN SERVICE', '● IN SERVICE') : t('● PRÊT À POINÇONNER', '● READY'),
      statusColor: isRunning ? '#D6B25E' : '#6FAF5A',
      statusDotColor: isRunning ? '#D6B25E' : '#6FAF5A',
      textColor: '#0A0A06',
    },

    // ── 🔥 INFERNO ────────────────────────────────────────────────────────────
    inferno: {
      wrapperClass: 'inferno-card-glow',
      wrapperStyle: {
        background: 'rgba(18,12,10,0.94)',
        borderRadius: 20,
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'linear-gradient(160deg, #742018 0%, #5f1d18 55%, #4f1a16 100%)'
          : 'linear-gradient(160deg, #a6461f 0%, #8e3b1a 52%, #6f2d14 100%)',
        boxShadow: isRunning
          ? '0 0 0 1px rgba(255,140,90,0.24), 0 8px 24px rgba(0,0,0,0.42), inset 0 1px 3px rgba(255,180,140,0.18)'
          : '0 0 0 1px rgba(255,150,90,0.32), 0 10px 26px rgba(0,0,0,0.45), inset 0 1px 3px rgba(255,190,120,0.20)',
        border: '1px solid rgba(255,150,90,0.35)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: null,
      icon: <FlameSVG size={50} />,
      labelLine1: isRunning ? t('ÉTEINDRE', 'PUNCH OUT') : t('ALLUMER', 'PUNCH IN'),
      labelLine2: isRunning ? t('LE FEU', 'THE FIRE') : t('LE FEU', 'THE FIRE'),
      statusText: isRunning ? t('🔥 EN FLAMMES', '🔥 BLAZING') : t('💥 PRÊT À BRÛLER', '💥 READY TO BURN'),
      statusColor: isRunning ? '#FF9040' : '#FF6014',
      statusDotColor: isRunning ? '#FF9040' : '#FFD060',
      textColor: 'white',
    },

    // ── 🧊 ARCTIC ─────────────────────────────────────────────────────────────
    arctic: {
      wrapperClass: 'arctic-card-glow',
      wrapperStyle: {
        background: 'rgba(4,16,30,0.95)',
        borderRadius: 24,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 32%, #FF88AA, #FF4488 40%, #CC0055 75%, #880033 95%)'
          : 'radial-gradient(circle at 38% 32%, #FFFFFF 0%, #C0F8FF 15%, #80EEFF 35%, #00D4FF 60%, #0088CC 85%, #004480 100%)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(255,68,136,0.45), 0 0 40px rgba(255,68,136,0.40), 0 0 80px rgba(204,0,85,0.15), inset 0 2px 6px rgba(255,150,180,0.25), 0 8px 30px rgba(0,0,0,0.70)'
          : '0 0 0 3px rgba(0,212,255,0.45), 0 0 40px rgba(0,212,255,0.40), 0 0 80px rgba(0,136,204,0.20), inset 0 3px 8px rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,136,204,0.30), 0 8px 30px rgba(0,0,0,0.70)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          {/* Cristaux de glace dans les coins */}
          {[
            { top: 12, left: 12 },
            { top: 12, right: 12 },
            { bottom: 12, left: 12 },
            { bottom: 12, right: 12 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 20, height: 20,
              pointerEvents: 'none', zIndex: 5,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="10" y1="2" x2="10" y2="18" stroke="rgba(0,212,255,0.50)" strokeWidth="1.5"/>
                <line x1="2" y1="10" x2="18" y2="10" stroke="rgba(0,212,255,0.50)" strokeWidth="1.5"/>
                <line x1="4" y1="4" x2="16" y2="16" stroke="rgba(0,212,255,0.35)" strokeWidth="1"/>
                <line x1="16" y1="4" x2="4" y2="16" stroke="rgba(0,212,255,0.35)" strokeWidth="1"/>
                <circle cx="10" cy="10" r="2" fill="rgba(0,212,255,0.40)"/>
              </svg>
            </div>
          ))}
          {/* Anneau extérieur givre */}
          <div style={{ position:'absolute', top:'50%', left:'50%', width:220, height:220, borderRadius:'50%', border:'1px solid rgba(0,212,255,0.18)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', width:240, height:240, borderRadius:'50%', border:'1px solid rgba(0,212,255,0.08)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          {/* Reflet de glace en haut */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 40,
            background: 'linear-gradient(180deg, rgba(140,240,255,0.08) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        </>
      ),
      icon: <SnowflakeSVG size={52} />,
      labelLine1: isRunning ? t('DÉGELER', 'PUNCH OUT') : t('GELER', 'PUNCH IN'),
      labelLine2: isRunning ? t('LA SORTIE', 'THE EXIT') : t("L'ENTRÉE", 'THE ENTRY'),
      statusText: isRunning ? t('❄️ EN MISSION GLACÉE', '❄️ FROZEN MISSION') : t('🧊 PRÊT À GELER', '🧊 READY TO FREEZE'),
      statusColor: isRunning ? '#80EEFF' : '#00D4FF',
      statusDotColor: isRunning ? '#80EEFF' : '#00D4FF',
      textColor: isRunning ? 'white' : '#001830',
    },

    // ── 🪙 CARBON ─────────────────────────────────────────────────────────────
    carbon: {
      wrapperClass: 'carbon-card-glow',
      wrapperStyle: {
        background: 'rgba(18,18,18,0.98)',
        borderRadius: 20,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 6px)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 32%, #FF6060, #CC3030 45%, #881010 80%)'
          : 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #E8E8E8 10%, #C0C0C0 30%, #808080 55%, #484848 78%, #202020 100%)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(200,48,48,0.45), 0 0 40px rgba(200,48,48,0.35), inset 0 2px 4px rgba(255,120,120,0.20), 0 10px 40px rgba(0,0,0,0.90)'
          : '0 0 0 2px rgba(100,100,100,0.60), 0 0 0 4px rgba(60,60,60,0.40), 0 0 30px rgba(200,200,200,0.15), inset 0 3px 8px rgba(255,255,255,0.30), inset 0 -3px 8px rgba(0,0,0,0.50), 0 10px 40px rgba(0,0,0,0.90)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          {/* Encoches métal sur les bords */}
          {[0, 90, 180, 270].map((deg, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 8, height: 20,
              background: 'linear-gradient(180deg, #404040, #A0A0A0, #404040)',
              borderRadius: 4,
              transform: `rotate(${deg}deg) translateY(-108px)`,
              transformOrigin: '50% 100%',
              pointerEvents: 'none',
            }} />
          ))}
          {/* Vis dans les coins */}
          {[
            { top: 16, left: 16 },
            { top: 16, right: 16 },
            { bottom: 16, left: 16 },
            { bottom: 16, right: 16 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 14, height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, #C0C0C0, #606060 60%, #202020)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.30), inset 0 -1px 2px rgba(0,0,0,0.60)',
              pointerEvents: 'none', zIndex: 5,
            }}>
              {/* Fente de vis */}
              <div style={{
                position: 'absolute', top: '50%', left: '15%', right: '15%',
                height: 1.5, background: 'rgba(0,0,0,0.60)',
                transform: 'translateY(-50%) rotate(45deg)',
              }} />
            </div>
          ))}
          {/* Anneau externe chrome */}
          <div style={{ position:'absolute', top:'50%', left:'50%', width:218, height:218, borderRadius:'50%', border:'2px solid rgba(180,180,180,0.20)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', width:238, height:238, borderRadius:'50%', border:'1px solid rgba(120,120,120,0.12)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          {/* Reflet chrome en haut */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 3,
            background: 'linear-gradient(90deg, transparent, rgba(220,220,220,0.15), rgba(255,255,255,0.35), rgba(220,220,220,0.15), transparent)',
            pointerEvents: 'none',
          }} />
        </>
      ),
      icon: <BoltSVG size={52} />,
      labelLine1: isRunning ? t('PUNCH OUT', 'PUNCH OUT') : t('PUNCH IN', 'PUNCH IN'),
      labelLine2: isRunning ? t('FIN DE MISSION', 'END MISSION') : t('DÉMARRER', 'START ENGINE'),
      statusText: isRunning ? t('⚙️ MOTEUR EN MARCHE', '⚙️ ENGINE RUNNING') : t('🔩 PRÊT AU TRAVAIL', '🔩 READY TO WORK'),
      statusColor: isRunning ? '#A0A0A0' : '#C0C0C0',
      statusDotColor: isRunning ? '#808080' : '#C0C0C0',
      textColor: isRunning ? 'white' : '#0A0A0A',
    },
  }

  return configs[themeId] ?? configs.quantum
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function PunchButton({ isRunning, isOnBreak, onPunch, disabled }: PunchButtonProps) {
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const isFr = lang === 'fr'
  const cfg = getConfig(themeId, isRunning, isFr)
  const isDeco = themeId === 'deco'
  const isInferno = themeId === 'inferno'
  const isArctic = themeId === 'arctic'
  const isCarbon = themeId === 'carbon'
  const isDisabled = isOnBreak || (disabled ?? false)

  // Couleurs du badge de statut selon thème
  const statusBg = isDeco
    ? 'rgba(214,178,94,0.08)'
    : isInferno ? 'rgba(255,96,20,0.10)'
    : isArctic ? 'rgba(0,212,255,0.08)'
    : isCarbon ? 'rgba(180,180,180,0.08)'
    : 'rgba(255,255,255,0.07)'

  const statusBorder = isDeco
    ? 'rgba(214,178,94,0.25)'
    : isInferno ? 'rgba(255,96,20,0.25)'
    : isArctic ? 'rgba(0,212,255,0.20)'
    : isCarbon ? 'rgba(180,180,180,0.20)'
    : 'rgba(255,255,255,0.12)'

  return (
    <div
      className={cfg.wrapperClass || undefined}
      style={{ ...cfg.wrapperStyle, margin: '0 0 8px' }}
    >
      {cfg.decorLayers}

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        paddingTop: isInferno ? 16 : 0,
      }}>

        {/* Bouton principal */}
        <button
          onClick={onPunch}
          disabled={isDisabled}
          className={cfg.buttonClass}
          style={{
            ...cfg.buttonStyle,
            opacity: isDisabled ? 0.40 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {cfg.icon}

          <span style={{
            fontSize: isDeco ? 14 : 12,
            fontWeight: 900,
            letterSpacing: isDeco ? '0.14em' : isCarbon ? '0.10em' : '0.06em',
            textAlign: 'center',
            lineHeight: 1.15,
            color: cfg.textColor,
            textTransform: 'uppercase',
            maxWidth: 140,
            textShadow: isCarbon && !isRunning ? '0 1px 3px rgba(0,0,0,0.40)' : isArctic && !isRunning ? '0 1px 3px rgba(0,68,128,0.60)' : 'none',
          }}>
            {cfg.labelLine1}
          </span>

          {cfg.labelLine2 && (
            <span style={{
              fontSize: isDeco ? 13 : 11,
              fontWeight: isDeco ? 900 : 700,
              color: isDeco
                ? 'rgba(10,10,6,0.65)'
                : isCarbon && !isRunning ? 'rgba(10,10,10,0.60)'
                : isArctic && !isRunning ? 'rgba(0,40,80,0.70)'
                : `${cfg.textColor}BB`,
              letterSpacing: isDeco ? '0.18em' : '0.08em',
              textTransform: 'uppercase',
            }}>
              {cfg.labelLine2}
            </span>
          )}
        </button>

        {/* Badge de statut */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: statusBg,
          border: `1px solid ${statusBorder}`,
          borderRadius: 999, padding: '6px 18px',
        }}>
          <div
            className={isDeco ? 'deco-status-dot' : ''}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: cfg.statusDotColor,
              boxShadow: `0 0 8px ${cfg.statusDotColor}, 0 0 16px ${cfg.statusDotColor}88`,
            }}
          />
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: cfg.statusColor,
            letterSpacing: isDeco ? '0.12em' : '0.05em',
            textTransform: isDeco ? 'uppercase' : 'none',
          }}>
            {cfg.statusText}
          </span>
        </div>

        {/* Message pause */}
        {isOnBreak && (
          <div style={{
            background: 'rgba(249,115,22,0.14)',
            border: '1px solid rgba(249,115,22,0.35)',
            borderRadius: 12, padding: '8px 18px',
          }}>
            <p style={{ color: '#F97316', fontSize: 13, fontWeight: 700, margin: 0, textAlign: 'center' }}>
              ☕ {isFr ? "En pause — reprenez d'abord" : 'On break — resume first'}
            </p>
          </div>
        )}

        {/* Message géofencing */}
        {!isOnBreak && disabled && (
          <div style={{
            background: isArctic ? 'rgba(0,212,255,0.08)' : isInferno ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isArctic ? 'rgba(0,212,255,0.30)' : 'rgba(239,68,68,0.35)'}`,
            borderRadius: 12, padding: '8px 18px',
          }}>
            <p style={{
              color: isArctic ? '#80EEFF' : '#ef4444',
              fontSize: 12, fontWeight: 700,
              margin: 0, textAlign: 'center',
            }}>
              📍 {isFr ? 'Hors zone — rapprochez-vous du chantier' : 'Out of range — get closer to jobsite'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
