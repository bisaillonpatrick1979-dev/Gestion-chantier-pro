'use client'

import React from 'react'
import { useThemeStore } from '@/store/useThemeStore'

/* ══════════════════════════════════════════════════════════════════════════════
   InfernoFlames
   — 5 couches CSS de flammes réelles autour du bouton punch
   — S'affiche uniquement quand theme.id === 'inferno' ET active === true
   — Usage : <InfernoFlames active={punchActive} buttonSize={162} />
══════════════════════════════════════════════════════════════════════════════ */
interface InfernoFlamesProps {
  active: boolean
  buttonSize?: number
}

export const InfernoFlames: React.FC<InfernoFlamesProps> = ({
  active,
  buttonSize = 162,
}) => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno' || !active) return null

  const sz = buttonSize

  return (
    <div
      style={{
        position: 'absolute',
        bottom: sz / 2 - 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: sz + 60,
        height: sz + 20,
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      {/* Layer 5 — halo externe sombre, très flou */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz + 50, height: sz * 0.80,
        background: 'radial-gradient(ellipse 55% 100% at 50% 100%, rgba(100,0,0,.70) 0%, rgba(60,0,0,.45) 45%, transparent 100%)',
        borderRadius: '55% 55% 0 0',
        filter: 'blur(12px)',
        animation: 'ifl5 2.2s ease-in-out infinite',
        transformOrigin: '50% 100%',
        opacity: 0.70,
      }} />

      {/* Layer 4 — rouge foncé */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz + 24, height: sz * 0.78,
        background: 'radial-gradient(ellipse 52% 100% at 50% 100%, #aa0000 0%, #660000 48%, transparent 100%)',
        borderRadius: '52% 52% 0 0',
        filter: 'blur(8px)',
        animation: 'ifl4 1.9s ease-in-out infinite',
        transformOrigin: '50% 100%',
        opacity: 0.78,
      }} />

      {/* Layer 3 — orange-rouge */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz * 0.90, height: sz * 0.90,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ff3300 0%, #cc1100 50%, transparent 100%)',
        borderRadius: '50% 50% 0 0',
        filter: 'blur(5px)',
        animation: 'ifl3 1.55s ease-in-out infinite',
        transformOrigin: '50% 100%',
        opacity: 0.88,
      }} />

      {/* Layer 2 — orange vif */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz * 0.62, height: sz * 0.75,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ff8800 0%, #ff3300 55%, transparent 100%)',
        borderRadius: '50% 50% 0 0',
        filter: 'blur(3px)',
        animation: 'ifl2 1.2s ease-in-out infinite',
        transformOrigin: '50% 100%',
        opacity: 0.92,
      }} />

      {/* Layer 1 — jaune core */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz * 0.36, height: sz * 0.60,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #ffee00 0%, #ffaa00 38%, #ff5500 72%, transparent 100%)',
        borderRadius: '50% 50% 0 0',
        filter: 'blur(2px)',
        animation: 'ifl1 0.95s ease-in-out infinite',
        transformOrigin: '50% 100%',
      }} />

      {/* Tip blanc-chaud */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: sz * 0.14, height: sz * 0.34,
        background: 'radial-gradient(ellipse 50% 100% at 50% 100%, rgba(255,255,240,.98) 0%, #ffee00 50%, transparent 100%)',
        borderRadius: '50% 50% 0 0',
        filter: 'blur(1px)',
        animation: 'ifl1 0.72s ease-in-out infinite',
        transformOrigin: '50% 100%',
      }} />

      {/* ── Embers ── */}
      {([
        { l: 'calc(50% - 38px)', bg: '#ffee00', s: 3,   a: 'iEmber0', d: 0.90, delay: 0.00 },
        { l: 'calc(50% + 22px)', bg: '#ff8800', s: 2.5, a: 'iEmber1', d: 1.10, delay: 0.15 },
        { l: 'calc(50% - 12px)', bg: '#ff4400', s: 3.5, a: 'iEmber2', d: 0.85, delay: 0.30 },
        { l: 'calc(50% + 40px)', bg: '#ffcc00', s: 2,   a: 'iEmber3', d: 1.20, delay: 0.08 },
        { l: 'calc(50% - 28px)', bg: '#ff6600', s: 3,   a: 'iEmber4', d: 1.00, delay: 0.45 },
        { l: 'calc(50% + 10px)', bg: '#ffaa00', s: 2,   a: 'iEmber5', d: 0.95, delay: 0.22 },
        { l: 'calc(50% - 5px)',  bg: '#ff3300', s: 2.5, a: 'iEmber6', d: 1.15, delay: 0.55 },
        { l: 'calc(50% + 32px)', bg: '#ffee00', s: 2,   a: 'iEmber7', d: 0.80, delay: 0.38 },
        { l: 'calc(50% - 48px)', bg: '#ff8800', s: 2,   a: 'iEmber8', d: 1.05, delay: 0.60 },
      ] as const).map((e, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 6, left: e.l,
          width: e.s, height: e.s, borderRadius: '50%',
          background: e.bg,
          animation: `${e.a} ${e.d}s ease-out ${e.delay}s infinite`,
          filter: 'blur(0.4px)',
          boxShadow: `0 0 3px ${e.bg}`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   AmbientEmbers
   — Particules de braise qui flottent dans toute la page
   — S'affiche uniquement quand theme.id === 'inferno'
   — Usage : <AmbientEmbers /> dans le layout ou la page racine
══════════════════════════════════════════════════════════════════════════════ */
export const AmbientEmbers: React.FC = () => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno') return null

  const particles = [
    { left: '8%',  dur: 6.0, delay: 0.0, size: 3,   color: '#ff6600', drift: '20px'  },
    { left: '20%', dur: 8.0, delay: 2.0, size: 2,   color: '#ffaa00', drift: '-15px' },
    { left: '35%', dur: 5.0, delay: 0.5, size: 2.5, color: '#ff4400', drift: '25px'  },
    { left: '50%', dur: 7.0, delay: 3.0, size: 2,   color: '#ffcc00', drift: '-10px' },
    { left: '65%', dur: 6.0, delay: 1.0, size: 3,   color: '#ff8800', drift: '18px'  },
    { left: '78%', dur: 9.0, delay: 4.0, size: 2,   color: '#ff3300', drift: '-22px' },
    { left: '88%', dur: 5.5, delay: 1.5, size: 2.5, color: '#ffaa00', drift: '12px'  },
    { left: '15%', dur: 7.5, delay: 5.0, size: 2,   color: '#ff6600', drift: '-8px'  },
    { left: '55%', dur: 6.5, delay: 2.5, size: 3,   color: '#ff9900', drift: '30px'  },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: '-10px',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          // @ts-ignore CSS custom property
          '--drift': p.drift,
          animation: `iAmbEmber ${p.dur}s ease-in-out ${p.delay}s infinite`,
          filter: 'blur(0.5px)',
          boxShadow: `0 0 4px ${p.color}`,
        }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   InfernoPunchWrapper
   — Conteneur atmosphérique autour du bouton punch
   — Remplace ton wrapper existant pour le thème inferno
   — Usage : enveloppe ton <PunchButton> existant
   
   Exemple :
     <InfernoPunchWrapper active={punchActive}>
       <PunchButton ... />
     </InfernoPunchWrapper>
══════════════════════════════════════════════════════════════════════════════ */
interface InfernoPunchWrapperProps {
  active: boolean
  children: React.ReactNode
}

export const InfernoPunchWrapper: React.FC<InfernoPunchWrapperProps> = ({
  active,
  children,
}) => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno') return <>{children}</>

  const stars = [
    { x: '9%',  y: '11%', s: 2.0, d: 0.0 }, { x: '86%', y: '8%',  s: 2.5, d: 0.3 },
    { x: '92%', y: '52%', s: 1.5, d: 0.7 }, { x: '5%',  y: '66%', s: 1.5, d: 0.5 },
    { x: '94%', y: '72%', s: 1.0, d: 1.0 }, { x: '44%', y: '5%',  s: 1.0, d: 0.6 },
    { x: '18%', y: '80%', s: 1.2, d: 0.9 }, { x: '78%', y: '84%', s: 1.0, d: 0.2 },
    { x: '88%', y: '33%', s: 1.0, d: 1.2 },
  ]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14 }}>

      {/* Corner brackets */}
      {[
        { top: 9, left: 9,   borderTop: `2px solid ${theme.colors.primary}`, borderLeft:  `2px solid ${theme.colors.primary}` },
        { top: 9, right: 9,  borderTop: `2px solid ${theme.colors.primary}`, borderRight: `2px solid ${theme.colors.primary}` },
        { bottom: 9, left: 9,  borderBottom: `2px solid ${theme.colors.primary}`, borderLeft:  `2px solid ${theme.colors.primary}` },
        { bottom: 9, right: 9, borderBottom: `2px solid ${theme.colors.primary}`, borderRight: `2px solid ${theme.colors.primary}` },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 22, height: 22, zIndex: 20, opacity: 0.70, ...s }} />
      ))}

      {/* ── Atmospheric background ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* deep bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(20,3,0,.97) 0%, rgba(5,0,0,1) 100%)`,
        }} />
        {/* ground lava glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: `radial-gradient(ellipse 90% 80% at 50% 100%, rgba(${active ? '150,30,0' : '80,15,0'},.85) 0%, rgba(60,8,0,.40) 48%, transparent 72%)`,
          animation: 'infernoAtmFog 7s ease-in-out infinite',
          transition: 'all 1.2s',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: '40%',
          background: `radial-gradient(ellipse 80% 100% at 50% 100%, rgba(${active ? '200,50,0' : '100,20,0'},.45) 0%, transparent 65%)`,
          filter: 'blur(22px)',
          animation: 'infernoAtmFog2 9s ease-in-out 2s infinite',
        }} />
        {/* horizon line */}
        <div style={{
          position: 'absolute', bottom: '26%', left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: 2,
          background: `linear-gradient(90deg,transparent,rgba(${active ? '255,80,0' : '180,40,0'},.25),rgba(${active ? '255,140,0' : '220,60,0'},.55),rgba(${active ? '255,80,0' : '180,40,0'},.25),transparent)`,
          filter: 'blur(1.5px)',
          transition: 'all 1s',
        }} />
        {/* volcanic silhouette */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '32%', opacity: 0.10, pointerEvents: 'none' }}
          viewBox="0 0 360 80"
          preserveAspectRatio="none"
        >
          <path d="M0,80 L0,52 L28,24 L56,44 L95,10 L130,36 L170,4 L210,30 L250,14 L290,38 L325,18 L360,40 L360,80Z" fill="#ff2200" />
        </svg>
        {/* center glow when active */}
        {active && (
          <div style={{
            position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(40,0,0,.22) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.y, left: s.x,
          width: s.s, height: s.s, borderRadius: '50%',
          background: i % 2 === 0 ? theme.colors.primary : theme.colors.primaryLight,
          opacity: 0.50,
          animation: `infernoFlicker ${2 + i * 0.3}s ease-in-out ${s.d}s infinite`,
          zIndex: 2, pointerEvents: 'none',
        }} />
      ))}

      {/* Content (le bouton punch existant) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

