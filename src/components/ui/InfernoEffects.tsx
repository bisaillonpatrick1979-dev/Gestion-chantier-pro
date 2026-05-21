'use client'

import React from 'react'
import { useThemeStore } from '@/store/useThemeStore'

interface InfernoFlamesProps {
  active: boolean
  buttonSize?: number
}

export const InfernoFlames: React.FC<InfernoFlamesProps> = ({ active, buttonSize = 162 }) => {
  const { theme } = useThemeStore()
  if (theme.id !== 'inferno') return null

  const opacity = active ? 0.95 : 0.72
  const scale = buttonSize / 162

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        overflow: 'hidden',
        opacity,
      }}
    >
      <style>{`
        @keyframes infernoSideFlame {
          0%,100% { transform: translateY(2px) scaleY(.92) skewX(-2deg); opacity: .74; }
          45% { transform: translateY(-9px) scaleY(1.12) skewX(3deg); opacity: 1; }
          72% { transform: translateY(-3px) scaleY(1.02) skewX(-4deg); opacity: .88; }
        }
        @keyframes infernoSideEmber {
          0% { transform: translate3d(0, 8px, 0) scale(.55); opacity: 0; }
          22% { opacity: .9; }
          100% { transform: translate3d(16px, -58px, 0) scale(.1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .inferno-side-flame, .inferno-side-ember { animation: none !important; }
        }
      `}</style>
      <div style={{ position: 'absolute', left: '2%', right: '2%', bottom: 0, height: 110 * scale, background: 'linear-gradient(0deg, rgba(90,18,4,.42), rgba(155,48,10,.14) 48%, transparent 86%)' }} />
      {(['left', 'right'] as const).map(side => {
        const isLeft = side === 'left'
        const flames = [
          { x: 4,  w: 92, h: 124, delay: '0s',    dur: '2.6s', rot: -12, color: 'rgba(255,82,10,.82)' },
          { x: 16, w: 64, h: 152, delay: '.35s',  dur: '2.9s', rot: 8,   color: 'rgba(255,172,44,.78)' },
          { x: 32, w: 78, h: 118, delay: '.75s',  dur: '2.35s',rot: -4,  color: 'rgba(221,42,7,.70)' },
          { x: 54, w: 54, h: 136, delay: '1.05s', dur: '3.1s', rot: 14,  color: 'rgba(255,210,78,.58)' },
          { x: 78, w: 88, h: 112, delay: '.2s',   dur: '2.75s',rot: -10, color: 'rgba(255,101,13,.72)' },
          { x: 106,w: 58, h: 144, delay: '.9s',   dur: '2.45s',rot: 6,   color: 'rgba(255,145,28,.68)' },
        ]
        return (
          <div key={side} style={{
            position: 'absolute',
            bottom: 0,
            left: isLeft ? 0 : 'auto',
            right: isLeft ? 'auto' : 0,
            width: '42%',
            height: 170 * scale,
            transform: isLeft ? 'none' : 'scaleX(-1)',
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92 * scale, background: 'radial-gradient(ellipse at 42% 100%, rgba(255,132,22,.48), rgba(118,20,4,.24) 45%, transparent 72%)' }} />
            {flames.map((f, i) => (
              <div key={i} style={{ position: 'absolute', left: `${f.x}%`, bottom: 6, width: f.w * scale, height: f.h * scale, transform: `rotate(${f.rot}deg)`, transformOrigin: '50% 100%' }}>
                <div className="inferno-side-flame" style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '54% 46% 48% 52% / 76% 70% 28% 24%',
                  background: `radial-gradient(ellipse at 48% 78%, rgba(255,235,128,.82) 0%, rgba(255,163,36,.72) 28%, ${f.color} 52%, rgba(115,18,4,.34) 74%, transparent 100%)`,
                  clipPath: 'polygon(50% 0%, 66% 20%, 60% 39%, 79% 58%, 62% 100%, 31% 100%, 43% 67%, 22% 49%, 39% 31%)',
                  animation: `infernoSideFlame ${f.dur} ease-in-out ${f.delay} infinite`,
                  willChange: 'transform, opacity',
                }} />
              </div>
            ))}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={`e-${i}`} className="inferno-side-ember" style={{
                position: 'absolute',
                left: `${18 + i * 15}%`,
                bottom: 28 + i * 4,
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: i % 2 ? '#ff9c28' : '#ffd56a',
                boxShadow: '0 0 5px rgba(255,120,24,.8)',
                animation: `infernoSideEmber ${2.8 + i * .35}s ease-out ${i * .42}s infinite`,
                willChange: 'transform, opacity',
              }} />
            ))}
          </div>
        )
      })}
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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, minHeight: 300 }}>
      <style>{`
        @keyframes infernoPanelBreath {
          0%,100% { opacity: .78; transform: translateY(0); }
          50% { opacity: .96; transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .inferno-panel-glow { animation: none !important; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,6,2,.96), rgba(7,2,1,.99))' }} />
      <div className="inferno-panel-glow" style={{
        position: 'absolute', left: '8%', right: '8%', bottom: 8, height: '58%',
        background: `radial-gradient(ellipse at 50% 100%, rgba(${active ? '255,92,12,.38' : '190,52,10,.25'}), rgba(110,20,4,.18) 42%, transparent 72%)`,
        animation: 'infernoPanelBreath 4.5s ease-in-out infinite',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,92,12,.12), transparent 18%, transparent 82%, rgba(255,92,12,.12))' }} />

      <InfernoFlames active={active} />

      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,103,24,.36)', borderRadius: 16, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 12, top: 12, width: 24, height: 24, borderLeft: '2px solid rgba(255,103,24,.72)', borderTop: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', right: 12, top: 12, width: 24, height: 24, borderRight: '2px solid rgba(255,103,24,.72)', borderTop: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', left: 12, bottom: 12, width: 24, height: 24, borderLeft: '2px solid rgba(255,103,24,.72)', borderBottom: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', right: 12, bottom: 12, width: 24, height: 24, borderRight: '2px solid rgba(255,103,24,.72)', borderBottom: '2px solid rgba(255,103,24,.72)' }} />

      <div style={{ position: 'relative', zIndex: 12 }}>
        {children}
      </div>
    </div>
  )
}
