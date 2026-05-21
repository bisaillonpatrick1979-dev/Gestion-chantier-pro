'use client'

import React from 'react'

interface InfernoFlamesProps {
  active: boolean
  buttonSize?: number
}

export const InfernoFlames: React.FC<InfernoFlamesProps> = ({ active, buttonSize = 162 }) => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno') return null

  const scale = buttonSize / 162

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9, overflow: 'hidden', opacity: active ? 0.95 : 0.72 }}>
      <style>{`
        @keyframes infernoCoreFlame {
          0%,100% { transform: translateY(4px) scaleY(.88) scaleX(.95); opacity: .56; }
          50% { transform: translateY(-8px) scaleY(1.08) scaleX(1.05); opacity: .92; }
        }
        @keyframes infernoEmberRise {
          0% { transform: translate3d(0,12px,0) scale(.2); opacity: 0; }
          24% { opacity: .75; }
          100% { transform: translate3d(10px,-80px,0) scale(.08); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: 20, height: 90 * scale, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,124,18,.42) 0%, rgba(180,44,4,.18) 52%, transparent 84%)' }} />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ position: 'absolute', left: `${14 + i * 13}%`, bottom: 26, width: `${10 + (i % 2) * 4}%`, height: `${96 + (i % 3) * 24}px`, transformOrigin: '50% 100%', animation: `infernoCoreFlame ${2.2 + i * 0.24}s ease-in-out ${i * 0.18}s infinite` }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '54% 46% 62% 38% / 80% 76% 24% 20%', clipPath: 'polygon(50% 0%, 66% 24%, 62% 45%, 80% 66%, 65% 100%, 32% 100%, 38% 65%, 20% 47%, 38% 26%)', background: i % 2 ? 'radial-gradient(ellipse at 48% 76%, rgba(255,238,150,.85), rgba(255,164,46,.72) 34%, rgba(255,72,14,.52) 62%, rgba(94,12,2,.20) 80%, transparent 100%)' : 'radial-gradient(ellipse at 48% 76%, rgba(255,224,124,.82), rgba(255,136,30,.68) 34%, rgba(220,52,10,.54) 62%, rgba(90,10,2,.22) 80%, transparent 100%)' }} />
        </div>
      ))}

      {Array.from({ length: 16 }).map((_, i) => (
        <div key={`ember-${i}`} style={{ position: 'absolute', left: `${12 + ((i * 7) % 74)}%`, bottom: `${30 + (i % 3) * 6}px`, width: i % 3 === 0 ? 4 : 2.5, height: i % 3 === 0 ? 4 : 2.5, borderRadius: '50%', background: i % 2 ? '#ffb24d' : '#ffd67c', boxShadow: '0 0 8px rgba(255,126,20,.75)', animation: `infernoEmberRise ${3.1 + (i % 5) * .4}s ease-out ${i * .22}s infinite` }} />
      ))}
    </div>
  )
}

export const AmbientEmbers: React.FC = () => null

interface InfernoPunchWrapperProps {
  active: boolean
  children: React.ReactNode
}

export const InfernoPunchWrapper: React.FC<InfernoPunchWrapperProps> = ({ active, children }) => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno') return <>{children}</>

  return (
    <div className="inferno-punch-stage" style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, minHeight: 320 }}>
      <style>{`
        @keyframes infernoPanelBreath { 0%,100% { opacity: .64; } 50% { opacity: .92; } }
        @keyframes infernoHazardMove { 0% { background-position: 0 0; } 100% { background-position: 48px 0; } }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#080707 0%, #12100e 52%, #080606 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,140,70,.08) 1px, transparent 1.3px), radial-gradient(rgba(255,255,255,.02) 1px, transparent 1.4px)', backgroundSize: '16px 16px, 21px 21px', backgroundPosition: '0 0, 9px 10px', mixBlendMode: 'screen', opacity: .65 }} />

      <div style={{ position: 'absolute', left: '5%', right: '5%', top: 20, bottom: 20, borderRadius: 18, background: 'linear-gradient(180deg, rgba(44,16,10,.56), rgba(18,9,8,.68))', border: '1px solid rgba(255,126,48,.34)', boxShadow: 'inset 0 1px 0 rgba(255,210,150,.15), inset 0 -40px 80px rgba(0,0,0,.48), 0 10px 40px rgba(0,0,0,.52)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />

      <div style={{ position: 'absolute', left: '5%', right: '5%', top: 20, height: 10, borderTopLeftRadius: 18, borderTopRightRadius: 18, background: 'repeating-linear-gradient(-45deg, rgba(255,168,62,.95) 0 10px, rgba(16,16,16,.95) 10px 20px)', animation: 'infernoHazardMove 1.4s linear infinite', zIndex: 8 }} />
      <div style={{ position: 'absolute', left: '5%', right: '5%', bottom: 20, height: 10, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, background: 'repeating-linear-gradient(45deg, rgba(255,168,62,.95) 0 10px, rgba(16,16,16,.95) 10px 20px)', animation: 'infernoHazardMove 1.4s linear infinite', zIndex: 8 }} />

      <div className="inferno-panel-glow" style={{ position: 'absolute', left: '12%', right: '12%', bottom: 30, height: '44%', background: `radial-gradient(ellipse at 50% 100%, rgba(${active ? '255,100,18,.32' : '176,62,12,.24'}), rgba(100,26,8,.14) 52%, transparent 86%)`, animation: 'infernoPanelBreath 4.2s ease-in-out infinite', zIndex: 6 }} />

      <InfernoFlames active={active} />

      <div style={{ position: 'absolute', left: '5%', right: '5%', top: 20, bottom: 20, borderRadius: 18, border: '1px solid rgba(255,138,60,.42)', zIndex: 10 }} />
      <div style={{ position: 'relative', zIndex: 20 }}>{children}</div>
    </div>
  )
}
