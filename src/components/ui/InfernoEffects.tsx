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

  const opacity = active ? 0.9 : 0.64
  const scale = buttonSize / 162

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 38,
        bottom: 42,
        pointerEvents: 'none',
        zIndex: 8,
        overflow: 'hidden',
        opacity,
      }}
    >
      <style>{`
        @keyframes infernoSideFlame {
          0%,100% { transform: translateY(5px) scaleY(.88) skewX(-2deg); opacity: .64; }
          45% { transform: translateY(-7px) scaleY(1.08) skewX(3deg); opacity: .96; }
          72% { transform: translateY(-1px) scaleY(.98) skewX(-3deg); opacity: .80; }
        }
        @keyframes infernoSideSweep {
          0%,100% { opacity: .16; transform: translateX(-10px) scaleX(.96); }
          50% { opacity: .40; transform: translateX(8px) scaleX(1.03); }
        }
        @keyframes infernoSideEmber {
          0% { transform: translate3d(0, 8px, 0) scale(.42); opacity: 0; }
          28% { opacity: .68; }
          100% { transform: translate3d(12px, -38px, 0) scale(.1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .inferno-side-flame, .inferno-side-ember, .inferno-side-sweep { animation: none !important; }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        left: '4%',
        right: '4%',
        bottom: 18,
        height: 62 * scale,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,88,14,.30), rgba(126,24,5,.14) 48%, transparent 78%)',
      }} />

      {(['left', 'right'] as const).map(side => {
        const isLeft = side === 'left'
        const flames = [
          { x: 2,  w: 48, h: 86,  delay: '0s',    dur: '2.8s', rot: -10, color: 'rgba(255,82,10,.68)' },
          { x: 18, w: 36, h: 104, delay: '.35s',  dur: '3.15s', rot: 7,   color: 'rgba(255,174,48,.60)' },
          { x: 34, w: 44, h: 92,  delay: '.75s',  dur: '2.55s', rot: -4,  color: 'rgba(222,50,9,.60)' },
          { x: 52, w: 32, h: 98,  delay: '1.05s', dur: '3.25s', rot: 12,  color: 'rgba(255,210,78,.44)' },
          { x: 68, w: 46, h: 82,  delay: '.2s',   dur: '2.95s', rot: -9,  color: 'rgba(255,100,13,.60)' },
        ]
        return (
          <div key={side} style={{
            position: 'absolute',
            bottom: 24,
            left: isLeft ? 0 : 'auto',
            right: isLeft ? 'auto' : 0,
            width: '34%',
            height: 128 * scale,
            transform: isLeft ? 'none' : 'scaleX(-1)',
          }}>
            <div className="inferno-side-sweep" style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 82 * scale,
              background: 'linear-gradient(90deg, transparent, rgba(255,210,84,.28), rgba(255,96,14,.18), transparent)',
              animation: 'infernoSideSweep 3.4s ease-in-out infinite',
              willChange: 'transform, opacity',
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 74 * scale,
              background: 'radial-gradient(ellipse at 42% 100%, rgba(255,132,22,.38), rgba(118,20,4,.16) 45%, transparent 72%)',
            }} />
            {flames.map((f, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${f.x}%`,
                bottom: 0,
                width: f.w * scale,
                height: f.h * scale,
                transform: `rotate(${f.rot}deg)`,
                transformOrigin: '50% 100%',
              }}>
                <div className="inferno-side-flame" style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '54% 46% 48% 52% / 76% 70% 28% 24%',
                  background: `radial-gradient(ellipse at 48% 78%, rgba(255,235,128,.66) 0%, rgba(255,163,36,.60) 28%, ${f.color} 54%, rgba(92,18,5,.22) 76%, transparent 100%)`,
                  clipPath: 'polygon(50% 0%, 66% 20%, 60% 39%, 79% 58%, 62% 100%, 31% 100%, 43% 67%, 22% 49%, 39% 31%)',
                  animation: `infernoSideFlame ${f.dur} ease-in-out ${f.delay} infinite`,
                  willChange: 'transform, opacity',
                }} />
              </div>
            ))}
            {[0, 1, 2].map(i => (
              <div key={`e-${i}`} className="inferno-side-ember" style={{
                position: 'absolute',
                left: `${20 + i * 19}%`,
                bottom: 28 + i * 5,
                width: 2.5,
                height: 2.5,
                borderRadius: '50%',
                background: i % 2 ? '#ff9c28' : '#ffd56a',
                boxShadow: '0 0 4px rgba(255,120,24,.62)',
                animation: `infernoSideEmber ${3.2 + i * .45}s ease-out ${i * .58}s infinite`,
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
    <div className="inferno-punch-stage" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, minHeight: 300 }}>
      <style>{`
        @keyframes infernoPanelBreath {
          0%,100% { opacity: .70; transform: translateY(0); }
          50% { opacity: .90; transform: translateY(-2px); }
        }
        @keyframes infernoPunchButtonPulse {
          0%,100% {
            filter: brightness(1) saturate(1.08);
            box-shadow: 0 0 0 4px rgba(255,72,18,.50), 0 0 46px rgba(255,52,14,.56), 0 0 98px rgba(190,18,4,.26), inset 0 3px 12px rgba(255,218,92,.34), inset 0 -14px 26px rgba(88,6,0,.50), 0 10px 40px rgba(0,0,0,.78);
          }
          50% {
            filter: brightness(1.16) saturate(1.22);
            box-shadow: 0 0 0 5px rgba(255,96,24,.62), 0 0 62px rgba(255,92,20,.72), 0 0 118px rgba(210,24,4,.34), inset 0 4px 14px rgba(255,232,130,.42), inset 0 -14px 28px rgba(88,6,0,.56), 0 10px 40px rgba(0,0,0,.78);
          }
        }
        .inferno-punch-stage .inferno-card-glow {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          animation: none !important;
          filter: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .inferno-punch-stage .inferno-card-glow::before,
        .inferno-punch-stage .inferno-card-glow::after {
          content: none !important;
          display: none !important;
        }
        .inferno-punch-stage .inferno-card-glow button {
          background: radial-gradient(circle at 38% 32%, #ffe071 0%, #ff982c 22%, #ff4d10 50%, #d32206 76%, #7a0900 100%) !important;
          border: 1px solid rgba(255,190,72,.78) !important;
          box-shadow: 0 0 0 4px rgba(255,72,18,.50), 0 0 46px rgba(255,52,14,.56), 0 0 98px rgba(190,18,4,.26), inset 0 3px 12px rgba(255,218,92,.34), inset 0 -14px 26px rgba(88,6,0,.50), 0 10px 40px rgba(0,0,0,.78) !important;
          animation: infernoPunchButtonPulse 3.1s ease-in-out infinite !important;
          filter: none;
          overflow: hidden !important;
          color: white !important;
        }
        .inferno-punch-stage .inferno-card-glow button::before,
        .inferno-punch-stage .inferno-card-glow button::after {
          content: none !important;
          display: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .inferno-panel-glow,
          .inferno-punch-stage .inferno-card-glow button { animation: none !important; }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, background: 'transparent' }} />
      <div className="inferno-panel-glow" style={{
        position: 'absolute', left: '7%', right: '7%', bottom: 52, height: '48%',
        background: `radial-gradient(ellipse at 50% 100%, rgba(${active ? '255,92,12,.30' : '190,52,10,.22'}), rgba(110,20,4,.15) 42%, transparent 72%)`,
        animation: 'infernoPanelBreath 4.8s ease-in-out infinite',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,92,12,.08), transparent 16%, transparent 84%, rgba(255,92,12,.08))' }} />

      <InfernoFlames active={active} />

      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,103,24,.42)', borderRadius: 16, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 12, top: 12, width: 24, height: 24, borderLeft: '2px solid rgba(255,103,24,.72)', borderTop: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', right: 12, top: 12, width: 24, height: 24, borderRight: '2px solid rgba(255,103,24,.72)', borderTop: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', left: 12, bottom: 12, width: 24, height: 24, borderLeft: '2px solid rgba(255,103,24,.72)', borderBottom: '2px solid rgba(255,103,24,.72)' }} />
      <div style={{ position: 'absolute', right: 12, bottom: 12, width: 24, height: 24, borderRight: '2px solid rgba(255,103,24,.72)', borderBottom: '2px solid rgba(255,103,24,.72)' }} />

      <div style={{ position: 'relative', zIndex: 20 }}>
        {children}
      </div>
    </div>
  )
}
