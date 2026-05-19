'use client'
// src/components/PunchButton.tsx
// Bouton Punch In/Out — design unique par thème
// ✅ quantum · xp · deco · inferno · arctic · carbon · aventure · zen · ludique

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

const HammerSVG = ({ color = '#FF9F1C', size = 52 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect x="8" y="14" width="28" height="14" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M28 21H44V28H28" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    <path d="M16 28V42" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M12 42H20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const LeafSVG = ({ color = 'white', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6C22 6 8 14 8 28c0 6.6 6.3 10 14 10 7.7 0 14-3.4 14-10C36 14 22 6 22 6Z"
      stroke={color} strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M22 38V16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M22 28C18 24 14 20 14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M22 24C26 20 30 18 30 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
)

/* 🔥 INFERNO flame icon */
const FlameSVG = ({ color = '#ff8800', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 4 C24 4 14 14 14 24 C14 28 16 31 18 33 C18 33 17 28 20 26 C20 26 19 32 23 35 C23 35 21 30 24 28 C24 28 22 33 26 36 C26 36 30 33 30 28 C30 28 33 30 33 34 C35 31 36 28 36 24 C36 14 24 4 24 4Z"
      fill={color} opacity="0.9" filter="url(#flameShadow)"/>
    <path d="M24 12 C24 12 18 20 18 26 C18 30 21 33 24 34 C24 34 22 30 24 28 C24 28 25 31 26 33 C28 31 29 29 29 26 C29 22 24 12 24 12Z"
      fill="#ffee00" opacity="0.85"/>
    <ellipse cx="24" cy="30" rx="3" ry="4" fill="rgba(255,255,255,0.7)" opacity="0.6"/>
    <defs>
      <filter id="flameShadow"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
        <feOffset dx="0" dy="2" result="offset"/>
        <feComposite in="SourceGraphic" in2="offset" operator="over"/></filter>
    </defs>
  </svg>
)

/* ❄️ ARCTIC snowflake icon */
const SnowflakeSVG = ({ color = '#80eeff', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {[0, 60, 120].map(angle => (
      <g key={angle} transform={`rotate(${angle} 24 24)`}>
        <line x1="24" y1="6" x2="24" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="16" y1="12" x2="24" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="32" y1="12" x2="24" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="36" x2="24" y2="30" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="32" y1="36" x2="24" y2="30" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      </g>
    ))}
    <circle cx="24" cy="24" r="3.5" fill={color}/>
    <circle cx="24" cy="24" r="1.5" fill="white"/>
  </svg>
)

/* 🪙 CARBON hexagon icon */
const HexSVG = ({ color = '#c0c0c0', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <polygon points="24,6 38,14 38,30 24,38 10,30 10,14" stroke={color} strokeWidth="2" fill="none"/>
    <polygon points="24,12 33,17 33,27 24,32 15,27 15,17" stroke={color} strokeWidth="1.5" fill={`${color}22`} opacity="0.7"/>
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.8"/>
    <circle cx="24" cy="24" r="1.8" fill="white" opacity="0.9"/>
    {/* metallic shine */}
    <path d="M16 14 L20 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ─── INFERNO: composants de flammes CSS ────────────────────────────────────

const InfernoFlameDecor = ({ isRunning }: { isRunning: boolean }) => (
  <>
    {/* Atmospheric volcanic background */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(180,35,0,0.55) 0%, rgba(80,10,0,0.3) 50%, transparent 75%)',
      pointerEvents: 'none',
    }}/>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 40% at 50% 100%, rgba(255,60,0,0.25) 0%, transparent 60%)',
      filter: 'blur(20px)',
      pointerEvents: 'none',
      animation: 'infernoLavaRise 7s ease-in-out infinite',
    }}/>

    {/* Horizon lava glow line */}
    <div style={{
      position: 'absolute', bottom: '22%', left: '50%', transform: 'translateX(-50%)',
      width: '65%', height: 2,
      background: 'linear-gradient(90deg, transparent, rgba(255,80,0,0.3), rgba(255,150,0,0.55), rgba(255,80,0,0.3), transparent)',
      filter: 'blur(2px)',
      pointerEvents: 'none',
    }}/>

    {/* Volcanic mountain silhouette */}
    <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '25%', opacity: 0.08, pointerEvents: 'none' }}
      viewBox="0 0 360 60" preserveAspectRatio="none">
      <path d="M0,60 L0,40 L40,15 L80,35 L120,5 L160,28 L200,2 L240,25 L280,10 L320,30 L360,18 L360,60Z" fill="#ff2200"/>
    </svg>

    {/* Star particles */}
    {[{x:'10%',y:'12%',s:2,d:0},{x:'85%',y:'10%',s:2.5,d:.3},{x:'92%',y:'50%',s:1.5,d:.7},
      {x:'6%',y:'62%',s:1.5,d:.5},{x:'94%',y:'68%',s:1,d:1},{x:'44%',y:'6%',s:1,d:.6},
      {x:'75%',y:'80%',s:1,d:.2}].map((s, i) => (
      <div key={i} style={{
        position: 'absolute', top: s.y, left: s.x,
        width: s.s, height: s.s, borderRadius: '50%',
        background: i % 2 === 0 ? '#ff8800' : '#ffcc00',
        animation: `infernoFlicker ${2 + i * 0.3}s ease-in-out ${s.d}s infinite`,
        pointerEvents: 'none', zIndex: 1,
      }}/>
    ))}

    {/* Corner brackets */}
    {[
      { top: 9, left: 9,   borderTop: '2px solid #ff6600', borderLeft:   '2px solid #ff6600' },
      { top: 9, right: 9,  borderTop: '2px solid #ff6600', borderRight:  '2px solid #ff6600' },
      { bottom: 9, left: 9,  borderBottom: '2px solid #ff6600', borderLeft:  '2px solid #ff6600' },
      { bottom: 9, right: 9, borderBottom: '2px solid #ff6600', borderRight: '2px solid #ff6600' },
    ].map((s, i) => (
      <div key={i} style={{ position: 'absolute', width: 20, height: 20, opacity: 0.65, zIndex: 3, pointerEvents: 'none', ...s }}/>
    ))}

    {/* ═══ REAL CSS FLAMES ═══ */}
    {/* Positioned from bottom=0, rising up through the button area */}
    <div style={{
      position: 'absolute', bottom: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: 260, height: 280,
      pointerEvents: 'none', zIndex: 1,
      opacity: isRunning ? 1 : 0.35,
      transition: 'opacity 0.8s ease',
    }}>
      {/* Layer 5 — outermost dark halo */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 240, height: 200,
        background: 'radial-gradient(ellipse 55% 100% at 50% 100%, rgba(90,0,0,0.7) 0%, rgba(50,0,0,0.4) 48%, transparent 100%)',
        borderRadius: '55% 55% 0 0', filter: 'blur(14px)',
        animation: 'ifl5 2.2s ease-in-out infinite', transformOrigin: '50% 100%',
      }}/>
      {/* Layer 4 — dark red */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 200, height: 185,
        background: 'radial-gradient(ellipse 52% 100% at 50% 100%, #aa0000 0%, #660000 48%, transparent 100%)',
        borderRadius: '52% 52% 0 0', filter: 'blur(9px)',
        animation: 'ifl4 1.9s ease-in-out infinite', transformOrigin: '50% 100%', opacity: 0.82,
      }}/>
      {/* Layer 3 — orange-red */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 160, height: 215,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ff3300 0%, #cc1100 50%, transparent 100%)',
        borderRadius: '50% 50% 0 0', filter: 'blur(5px)',
        animation: 'ifl3 1.55s ease-in-out infinite', transformOrigin: '50% 100%', opacity: 0.9,
      }}/>
      {/* Layer 2 — bright orange */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 240,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ff8800 0%, #ff3300 55%, transparent 100%)',
        borderRadius: '50% 50% 0 0', filter: 'blur(3px)',
        animation: 'ifl2 1.2s ease-in-out infinite', transformOrigin: '50% 100%', opacity: 0.92,
      }}/>
      {/* Layer 1 — yellow core */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 70, height: 255,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ffee00 0%, #ffaa00 38%, #ff5500 72%, transparent 100%)',
        borderRadius: '50% 50% 0 0', filter: 'blur(2px)',
        animation: 'ifl1 0.95s ease-in-out infinite', transformOrigin: '50% 100%',
      }}/>
      {/* White hot tip */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 28, height: 270,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, rgba(255,255,240,0.98) 0%, #ffee00 50%, transparent 100%)',
        borderRadius: '50% 50% 0 0', filter: 'blur(1px)',
        animation: 'ifl1 0.72s ease-in-out infinite', transformOrigin: '50% 100%',
      }}/>

      {/* Embers */}
      {isRunning && [
        { l: 'calc(50% - 42px)', bg: '#ffee00', s: 3.5, a: 'iEmber0', d: 0.9, delay: 0 },
        { l: 'calc(50% + 28px)', bg: '#ff8800', s: 3,   a: 'iEmber1', d: 1.1, delay: .15 },
        { l: 'calc(50% - 18px)', bg: '#ff4400', s: 4,   a: 'iEmber2', d: .85, delay: .3 },
        { l: 'calc(50% + 48px)', bg: '#ffcc00', s: 2.5, a: 'iEmber3', d: 1.2, delay: .08 },
        { l: 'calc(50% - 32px)', bg: '#ff6600', s: 3,   a: 'iEmber4', d: 1.0, delay: .45 },
        { l: 'calc(50% + 12px)', bg: '#ffaa00', s: 2.5, a: 'iEmber5', d: .95, delay: .22 },
        { l: 'calc(50% - 8px)',  bg: '#ff3300', s: 3,   a: 'iEmber6', d: 1.15,delay: .55 },
        { l: 'calc(50% + 36px)', bg: '#ffee00', s: 2.5, a: 'iEmber7', d: .8,  delay: .38 },
        { l: 'calc(50% - 55px)', bg: '#ff8800', s: 2.5, a: 'iEmber8', d: 1.05,delay: .6 },
      ].map((e, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 8, left: e.l,
          width: e.s, height: e.s, borderRadius: '50%',
          background: e.bg,
          animation: `${e.a} ${e.d}s ease-out ${e.delay}s infinite`,
          filter: 'blur(0.4px)',
          boxShadow: `0 0 4px ${e.bg}`,
        }}/>
      ))}
    </div>
  </>
)

// ─── ARCTIC: décors glassmorphism ──────────────────────────────────────────

const ArcticDecor = ({ isRunning }: { isRunning: boolean }) => (
  <>
    {/* Aurora background */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,180,255,0.18) 0%, transparent 65%)',
      pointerEvents: 'none',
    }}/>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,120,200,0.15) 0%, transparent 60%)',
      pointerEvents: 'none',
    }}/>

    {/* Ice crystal particles */}
    {[{x:'12%',y:'15%',s:1.5},{x:'88%',y:'12%',s:2},{x:'5%',y:'55%',s:1.2},
      {x:'93%',y:'60%',s:1.5},{x:'45%',y:'8%',s:1},{x:'20%',y:'78%',s:1.2},{x:'80%',y:'75%',s:1}
    ].map((p, i) => (
      <div key={i} style={{
        position: 'absolute', top: p.y, left: p.x,
        width: p.s, height: p.s, borderRadius: '50%',
        background: i % 2 === 0 ? '#80eeff' : '#fff',
        animation: `arcticCrystal ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
        pointerEvents: 'none', zIndex: 1, opacity: 0.6,
      }}/>
    ))}

    {/* Frost ring around button area */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%) translateY(-12px)',
      width: 220, height: 220, borderRadius: '50%',
      border: '1px solid rgba(0,212,255,0.15)',
      pointerEvents: 'none', zIndex: 1,
      animation: 'arcticPulse 4s ease-in-out infinite',
    }}/>
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%) translateY(-12px)',
      width: 240, height: 240, borderRadius: '50%',
      border: '1px dashed rgba(0,212,255,0.08)',
      pointerEvents: 'none', zIndex: 1,
      animation: 'rotateCW 25s linear infinite',
    }}/>
  </>
)

// ─── CARBON: décors métal chrome ──────────────────────────────────────────

const CarbonDecor = () => (
  <>
    {/* Carbon fiber texture overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 6px)',
      pointerEvents: 'none', borderRadius: 20,
    }}/>
    {/* Subtle chrome reflection top */}
    <div style={{
      position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(200,200,200,0.4), rgba(255,255,255,0.7), rgba(200,200,200,0.4), transparent)',
      pointerEvents: 'none',
    }}/>
    {/* Chrome orbs subtle */}
    <div style={{
      position: 'absolute', top: '20%', right: '8%',
      width: 40, height: 40, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), transparent 65%)',
      border: '1px solid rgba(180,180,180,0.1)',
      pointerEvents: 'none',
    }}/>
    <div style={{
      position: 'absolute', bottom: '25%', left: '8%',
      width: 28, height: 28, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.06), transparent 65%)',
      border: '1px solid rgba(180,180,180,0.08)',
      pointerEvents: 'none',
    }}/>
  </>
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
    paddingTop?: number
  }> = {

    // ── QUANTUM ──────────────────────────────────────────────────────────────
    quantum: {
      wrapperClass: '',
      wrapperStyle: {
        background: 'rgba(10,22,48,0.82)',
        border: '1px solid rgba(60,130,255,0.28)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 24, padding: '32px 16px',
        position: 'relative', overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 180, height: 180, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF4444, #B91C1C)'
          : 'radial-gradient(circle at 40% 35%, #38D9FF, #2F80FF 55%, #1A4ADB)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(239,68,68,0.45), 0 0 50px rgba(239,68,68,0.40)'
          : '0 0 0 3px rgba(47,128,255,0.45), 0 0 50px rgba(47,128,255,0.40)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px)' }} />
      ),
      icon: <FingerprintSVG color="white" size={52} />,
      labelLine1: isRunning ? t('PUNCH OUT', 'PUNCH OUT') : t('PUNCH IN', 'PUNCH IN'),
      labelLine2: '',
      statusText: isRunning ? t('EN COURS', 'IN PROGRESS') : t('PRÊT À POINTER', 'READY'),
      statusColor: isRunning ? '#FFB020' : '#30D979',
      statusDotColor: isRunning ? '#FFB020' : '#30D979',
      textColor: 'white',
    },

    // ── XP ───────────────────────────────────────────────────────────────────
    xp: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#1B1245',
        border: '1px solid rgba(168,85,247,0.30)',
        borderRadius: 24, padding: '32px 16px',
        position: 'relative', overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 190, height: 190, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #F97316, #EA580C 55%, #C2410C)'
          : 'radial-gradient(circle at 40% 35%, #C084FC, #A855F7 55%, #7C3AED)',
        boxShadow: isRunning
          ? '0 0 0 4px rgba(249,115,22,0.40), 0 0 60px rgba(249,115,22,0.45)'
          : '0 0 0 4px rgba(168,85,247,0.40), 0 0 60px rgba(168,85,247,0.45)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          {[0,45,90,135,180,225,270,315].map(deg => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 130, height: 2,
              background: 'linear-gradient(90deg, rgba(168,85,247,0.55), transparent)',
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg)`,
              pointerEvents: 'none', opacity: 0.45,
            }} />
          ))}
        </>
      ),
      icon: <StarSVG color="#FACC15" size={46} />,
      labelLine1: isRunning ? t('POINTEZ LA SORTIE', 'PUNCH OUT') : t("POINTEZ L'ENTRÉE", 'PUNCH IN'),
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
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 218, height: 218, borderRadius: '50%', border: '1px solid rgba(214,178,94,0.25)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 236, height: 236, borderRadius: '50%', border: '1px solid rgba(214,178,94,0.12)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderTop: '2px solid rgba(214,178,94,0.75)', borderRight: '2px solid rgba(214,178,94,0.75)', pointerEvents: 'none', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 8, left: 8, width: 28, height: 28, borderBottom: '2px solid rgba(214,178,94,0.75)', borderLeft: '2px solid rgba(214,178,94,0.75)', pointerEvents: 'none', zIndex: 10 }} />
        </>
      ),
      icon: <DecoDiamondSVG size={34} />,
      labelLine1: t('POINÇONNER', isRunning ? 'PUNCH' : 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE', 'OUT') : t("L'ENTRÉE", 'IN'),
      statusText: isRunning ? t('● EN SERVICE', '● IN SERVICE') : t('● PRÊT À POINÇONNER', '● READY'),
      statusColor: isRunning ? '#D6B25E' : '#6FAF5A',
      statusDotColor: isRunning ? '#D6B25E' : '#6FAF5A',
      textColor: '#0A0A06',
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🔥 INFERNO — Bouton lava avec vraies flammes CSS
    // ══════════════════════════════════════════════════════════════════════════
    inferno: {
      wrapperClass: 'inferno-card-glow',
      wrapperStyle: {
        background: 'linear-gradient(180deg, rgba(10,2,0,0.98) 0%, rgba(16,4,0,0.99) 100%)',
        borderRadius: 20,
        padding: '28px 16px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 340,
      },
      buttonClass: '',
      buttonStyle: {
        width: 192, height: 192, borderRadius: '50%',
        background: isRunning
          ? 'linear-gradient(160deg, #000000 0%, #2a0000 15%, #6a0000 32%, #bb2200 52%, #ee5500 70%, #ff9900 88%, #ffcc00 100%)'
          : 'radial-gradient(circle at 38% 30%, rgba(100,15,0,0.25) 0%, rgba(50,5,0,0.45) 45%, rgba(6,0,0,0.98) 80%)',
        backgroundSize: '300% 300%',
        animation: isRunning
          ? 'infernoLavaFlow 3s ease infinite, infernoBtnGlow 2.2s ease-in-out infinite'
          : 'infernoGlow 4s ease-in-out infinite',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'background 0.6s ease',
        position: 'relative', zIndex: 5,
        // Glass sheen via box shadow
        boxShadow: isRunning
          ? '0 0 35px rgba(255,68,0,0.7), 0 0 80px rgba(255,68,0,0.35), inset 0 2px 0 rgba(255,200,80,0.18), inset 0 0 40px rgba(180,30,0,0.25)'
          : '0 0 12px rgba(200,40,0,0.3), inset 0 1px 0 rgba(255,80,0,0.08)',
      },
      decorLayers: <InfernoFlameDecor isRunning={isRunning} />,
      icon: <FlameSVG
        color={isRunning ? '#ffcc00' : 'rgba(255,100,20,0.55)'}
        size={50}
      />,
      labelLine1: t('POINÇONNER', 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE 🔴', 'OUT 🔴') : t("L'ENTRÉE 🔥", 'IN 🔥'),
      statusText: isRunning ? t('🔥 CHRONO ACTIF', '🔥 ACTIVE') : t('● PRÊT À ALLUMER', '● READY TO IGNITE'),
      statusColor: isRunning ? '#ff9900' : 'rgba(200,80,20,0.7)',
      statusDotColor: isRunning ? '#ff6600' : 'rgba(180,50,10,0.6)',
      textColor: isRunning ? '#ffe8c0' : 'rgba(255,140,60,0.6)',
    },

    // ══════════════════════════════════════════════════════════════════════════
    // ❄️ ARCTIC — Glassmorphism cristal de glace
    // ══════════════════════════════════════════════════════════════════════════
    arctic: {
      wrapperClass: 'arctic-card-glow',
      wrapperStyle: {
        background: 'rgba(3,14,30,0.75)',
        borderRadius: 20,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,212,255,0.22)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 188, height: 188, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 28%, rgba(80,200,255,0.35) 0%, rgba(0,120,200,0.55) 40%, rgba(0,30,80,0.95) 80%)'
          : 'radial-gradient(circle at 38% 28%, rgba(0,180,255,0.12) 0%, rgba(0,80,160,0.25) 45%, rgba(0,15,45,0.97) 80%)',
        boxShadow: isRunning
          ? '0 0 0 2.5px rgba(80,200,255,0.85), 0 0 35px rgba(0,200,255,0.55), 0 0 80px rgba(0,180,240,0.28), inset 0 2px 0 rgba(150,240,255,0.25), inset 0 0 35px rgba(0,150,220,0.15)'
          : '0 0 0 1.5px rgba(0,180,255,0.35), 0 0 20px rgba(0,180,255,0.15), inset 0 1px 0 rgba(100,220,255,0.12)',
        animation: isRunning ? 'arcticPulse 2.5s ease-in-out infinite' : 'arcticPulse 4s ease-in-out infinite',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.4s',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'relative', zIndex: 5,
      },
      decorLayers: <ArcticDecor isRunning={isRunning} />,
      icon: <SnowflakeSVG
        color={isRunning ? '#80eeff' : 'rgba(0,180,255,0.5)'}
        size={46}
      />,
      labelLine1: t('POINÇONNER', 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE ❄️', 'OUT ❄️') : t("L'ENTRÉE ❄️", 'IN ❄️'),
      statusText: isRunning ? t('❄️ CHRONO ACTIF', '❄️ ACTIVE') : t('● PRÊT À POINTER', '● READY'),
      statusColor: isRunning ? '#00d4ff' : 'rgba(0,150,200,0.7)',
      statusDotColor: isRunning ? '#00d4ff' : 'rgba(0,130,180,0.5)',
      textColor: isRunning ? '#c0f0ff' : 'rgba(80,170,210,0.6)',
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🪙 CARBON — Chrome & acier brossé
    // ══════════════════════════════════════════════════════════════════════════
    carbon: {
      wrapperClass: 'carbon-card-glow',
      wrapperStyle: {
        background: 'rgba(14,14,14,0.97)',
        borderRadius: 20,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(160,160,160,0.18)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 188, height: 188, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 38% 28%, #E0E0E0 0%, #888 35%, #444 65%, #111 100%)'
          : 'radial-gradient(circle at 38% 28%, rgba(140,140,140,0.18) 0%, rgba(80,80,80,0.3) 45%, rgba(10,10,10,0.97) 80%)',
        backgroundSize: '200% 200%',
        animation: isRunning ? 'carbonChrome 4s ease infinite, carbonPulse 2.5s ease-in-out infinite' : 'carbonPulse 4s ease-in-out infinite',
        boxShadow: isRunning
          ? '0 0 0 2px rgba(200,200,200,0.7), 0 0 30px rgba(180,180,180,0.35), 0 0 70px rgba(140,140,140,0.18), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 0 40px rgba(100,100,100,0.12)'
          : '0 0 0 1px rgba(140,140,140,0.25), 0 0 15px rgba(120,120,120,0.1), inset 0 1px 0 rgba(200,200,200,0.08)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.4s',
        position: 'relative', zIndex: 5,
      },
      decorLayers: <CarbonDecor />,
      icon: <HexSVG
        color={isRunning ? '#e8e8e8' : 'rgba(140,140,140,0.5)'}
        size={46}
      />,
      labelLine1: t('POINÇONNER', 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE', 'OUT') : t("L'ENTRÉE", 'IN'),
      statusText: isRunning ? t('⚙ CHRONO ACTIF', '⚙ ACTIVE') : t('● PRÊT À POINTER', '● READY'),
      statusColor: isRunning ? '#c8c8c8' : 'rgba(120,120,120,0.6)',
      statusDotColor: isRunning ? '#c0c0c0' : 'rgba(100,100,100,0.5)',
      textColor: isRunning ? '#f0f0f0' : 'rgba(120,120,120,0.55)',
    },

    // ── AVENTURE ─────────────────────────────────────────────────────────────
    aventure: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#231D10',
        border: '2px solid rgba(255,159,28,0.40)',
        borderRadius: 16, padding: '8px 16px 28px',
        position: 'relative', overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF233C, #C0392B 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #FFB020, #F97316 55%, #C85000)',
        boxShadow: isRunning
          ? '0 0 0 6px rgba(239,35,60,0.30), 0 0 50px rgba(239,35,60,0.40)'
          : '0 0 0 6px rgba(255,159,28,0.30), 0 0 50px rgba(249,115,22,0.45)',
        border: '3px solid rgba(0,0,0,0.40)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6,
          background: 'repeating-linear-gradient(-45deg,#FF9F1C 0px,#FF9F1C 8px,#231D10 8px,#231D10 16px)',
          opacity: 0.7 }} />
      ),
      icon: <HammerSVG color="white" size={48} />,
      labelLine1: isRunning ? t('POINTEZ VOTRE SORTIE', 'PUNCH OUT') : t('POINTEZ VOTRE ENTRÉE', 'PUNCH IN'),
      labelLine2: isRunning ? t('Mission en cours!', 'Mission active!') : t("À l'attaque!", "Let's go!"),
      statusText: isRunning ? t('🔨 EN MISSION', '🔨 ON MISSION') : t('🟢 PRÊT', '🟢 READY'),
      statusColor: isRunning ? '#FF9F1C' : '#3BAA35',
      statusDotColor: isRunning ? '#FF9F1C' : '#3BAA35',
      textColor: 'white',
    },

    // ── ZEN ───────────────────────────────────────────────────────────────────
    zen: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#FFFDF8',
        border: '1px solid rgba(98,82,60,0.12)',
        borderRadius: 28, padding: '40px 16px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(98,82,60,0.10)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 175, height: 175, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #D97745, #B85A4A 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #D97745, #C85F3D 55%, #A84A2A)',
        boxShadow: isRunning
          ? '0 18px 45px rgba(184,90,74,0.35)'
          : '0 18px 45px rgba(200,95,61,0.30)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      icon: <LeafSVG color="white" size={40} />,
      labelLine1: isRunning ? t('POINTER LA SORTIE', 'PUNCH OUT') : t('POINTER', 'PUNCH IN'),
      labelLine2: isRunning ? '' : t("l'arrivée", ''),
      statusText: isRunning ? t('● En cours', '● In progress') : t('● Prêt', '● Ready'),
      statusColor: isRunning ? '#C8A96A' : '#6F8F5C',
      statusDotColor: isRunning ? '#C8A96A' : '#6F8F5C',
      textColor: 'white',
    },

    // ── LUDIQUE ───────────────────────────────────────────────────────────────
    ludique: {
      wrapperClass: '',
      wrapperStyle: {
        background: 'linear-gradient(135deg, #003B3D, #063B3A)',
        borderRadius: 24, padding: '0 16px 28px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(15,23,42,0.20)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #FF5F5F, #FF3B30 55%, #C0392B)'
          : 'radial-gradient(circle at 40% 35%, #FF9B3D, #FF7A1A 55%, #E05E00)',
        boxShadow: isRunning
          ? '0 0 0 5px rgba(255,59,48,0.30), 0 0 60px rgba(255,59,48,0.40)'
          : '0 0 0 5px rgba(255,122,26,0.30), 0 0 60px rgba(255,122,26,0.40)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{
          padding: '14px 16px 10px',
          background: 'rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 24,
        }}>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>
            {isFr ? 'Bonjour! 👋' : 'Hello! 👋'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
            {isFr ? 'Prêt à construire une excellente journée.' : 'Ready to build a great day.'}
          </p>
        </div>
      ),
      icon: <FingerprintSVG color="white" size={52} />,
      labelLine1: isRunning ? t('POINÇONNER LA SORTIE', 'PUNCH OUT') : t("POINÇONNER L'ENTRÉE", 'PUNCH IN'),
      labelLine2: '',
      statusText: isRunning ? t('EN COURS ●', 'IN PROGRESS ●') : t('Prêt ●', 'Ready ●'),
      statusColor: isRunning ? '#FF9B3D' : '#34C759',
      statusDotColor: isRunning ? '#FF9B3D' : '#34C759',
      textColor: 'white',
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
  const isDisabled = isOnBreak || (disabled ?? false)

  return (
    <div
      className={cfg.wrapperClass || undefined}
      style={{ ...cfg.wrapperStyle, margin: '0 0 8px' }}
    >
      {cfg.decorLayers}

      <div style={{
        position: 'relative', zIndex: 6,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
      }}>

        {/* Bouton principal */}
        <button
          onClick={onPunch}
          disabled={isDisabled}
          className={cfg.buttonClass}
          style={{
            ...cfg.buttonStyle,
            opacity: isDisabled ? 0.45 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Glass sheen interne */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, transparent 60%)',
            pointerEvents: 'none',
          }}/>

          {cfg.icon}

          <span style={{
            fontSize: isDeco ? 14 : 13,
            fontWeight: 900,
            letterSpacing: isDeco ? '0.14em' : '0.06em',
            textAlign: 'center',
            lineHeight: 1.15,
            color: cfg.textColor,
            textTransform: 'uppercase',
            maxWidth: 140,
            position: 'relative', zIndex: 1,
          }}>
            {cfg.labelLine1}
          </span>

          {cfg.labelLine2 && (
            <span style={{
              fontSize: isDeco ? 13 : 11,
              fontWeight: isDeco ? 900 : 600,
              color: isDeco ? 'rgba(10,10,6,0.65)' : `${cfg.textColor}BB`,
              letterSpacing: isDeco ? '0.18em' : '0.04em',
              textTransform: 'uppercase',
              position: 'relative', zIndex: 1,
            }}>
              {cfg.labelLine2}
            </span>
          )}
        </button>

        {/* Indicateur de statut */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: isDeco ? 'rgba(214,178,94,0.08)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isDeco ? 'rgba(214,178,94,0.25)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 999, padding: '6px 18px',
        }}>
          <div
            className={isDeco ? 'deco-status-dot' : ''}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: cfg.statusDotColor,
              boxShadow: `0 0 8px ${cfg.statusDotColor}`,
            }}
          />
          <span style={{
            fontSize: 12, fontWeight: 700,
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
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 12, padding: '8px 18px',
          }}>
            <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, margin: 0, textAlign: 'center' }}>
              📍 {isFr ? 'Hors zone — rapprochez-vous du chantier' : 'Out of range — get closer to jobsite'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
