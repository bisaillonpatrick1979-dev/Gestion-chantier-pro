'use client'
// src/components/layout/BottomNav.tsx
// Navigation bas — icônes SVG Art Déco quand thème deco actif

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

// ════════════════════════════════════════════════════════
// ICÔNES ART DÉCO SVG — une par onglet
// ════════════════════════════════════════════════════════

// Dashboard — éventail Art Déco (comme le concept image)
const IconDashboardDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Éventail — lignes rayonnantes depuis le bas centre */}
      {[[-50,-2],[−35,0],[-20,2],[-5,3],[5,3],[20,2],[35,0],[50,-2]].map(([dx], i) => (
        <line key={i} x1="12" y1="22" x2={12 + (dx ?? 0)} y2="4"
          stroke={c} strokeWidth={i === 3 || i === 4 ? 1.5 : 0.9} strokeLinecap="round" opacity={1 - Math.abs(i-3.5)*0.1}/>
      ))}
      <line x1="12" y1="22" x2="2"  y2="8"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
      <line x1="12" y1="22" x2="6"  y2="5"  stroke={c} strokeWidth="1.0" strokeLinecap="round" opacity="0.65"/>
      <line x1="12" y1="22" x2="10" y2="4"  stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.80"/>
      <line x1="12" y1="22" x2="12" y2="4"  stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="14" y2="4"  stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.80"/>
      <line x1="12" y1="22" x2="18" y2="5"  stroke={c} strokeWidth="1.0" strokeLinecap="round" opacity="0.65"/>
      <line x1="12" y1="22" x2="22" y2="8"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
      {/* Arc décoratif */}
      <path d="M4 20 Q12 12 20 20" stroke={c} strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M6 21 Q12 15 18 21" stroke={c} strokeWidth="0.7" fill="none" opacity="0.4"/>
      {/* Point central */}
      <circle cx="12" cy="22" r="1.5" fill={c}/>
    </svg>
  )
}

// Stats — colonnes géométriques Art Déco
const IconStatsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Colonnes avec hauteurs différentes */}
      <rect x="2"  y="14" width="4" height="8" stroke={c} strokeWidth="1.2" fill={active ? 'rgba(214,178,94,0.15)' : 'none'}/>
      <rect x="8"  y="9"  width="4" height="13" stroke={c} strokeWidth="1.2" fill={active ? 'rgba(214,178,94,0.15)' : 'none'}/>
      <rect x="14" y="5"  width="4" height="17" stroke={c} strokeWidth="1.5" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      <rect x="20" y="11" width="2" height="11" stroke={c} strokeWidth="1.0" fill={active ? 'rgba(214,178,94,0.12)' : 'none'}/>
      {/* Chapiteaux des colonnes (style Art Déco) */}
      <line x1="1"  y1="14" x2="7"  y2="14" stroke={c} strokeWidth="1.5"/>
      <line x1="7"  y1="9"  x2="13" y2="9"  stroke={c} strokeWidth="1.5"/>
      <line x1="13" y1="5"  x2="19" y2="5"  stroke={c} strokeWidth="1.5"/>
      {/* Ligne de base */}
      <line x1="1" y1="22" x2="23" y2="22" stroke={c} strokeWidth="1.2"/>
    </svg>
  )
}

// Projets — colonnes / chantier Art Déco
const IconProjetsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Bâtiment géométrique */}
      <polygon points="12,2 20,8 20,9 12,4 4,9 4,8" stroke={c} strokeWidth="1.2" fill="none"/>
      <polygon points="12,5 18,9 18,10 12,7 6,10 6,9" stroke={c} strokeWidth="1" fill="none" opacity="0.7"/>
      {/* Corps */}
      <rect x="4"  y="9"  width="16" height="13" stroke={c} strokeWidth="1.2" fill="none"/>
      {/* Fenêtres — symétrie Art Déco */}
      <rect x="6"  y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      <rect x="10.5" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      <rect x="15" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      {/* Porte centrale */}
      <rect x="10" y="18" width="4" height="4" stroke={c} strokeWidth="0.9" fill="none"/>
      {/* Étoile au sommet */}
      <path d="M12 0.5L12.8 2.5H15L13.5 3.5L14 5.5L12 4.2L10 5.5L10.5 3.5L9 2.5H11.2Z" fill={c} opacity="0.8"/>
    </svg>
  )
}

// Documents — parchemin géométrique Art Déco
const IconDocumentsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Document principal */}
      <path d="M5 3H15L19 7V21H5V3Z" stroke={c} strokeWidth="1.3" fill={active ? 'rgba(214,178,94,0.08)' : 'none'}/>
      {/* Coin plié */}
      <path d="M15 3L15 7H19" stroke={c} strokeWidth="1.3" fill="none"/>
      {/* Lignes de texte stylisées */}
      <line x1="8"  y1="11" x2="16" y2="11" stroke={c} strokeWidth="1" opacity="0.8"/>
      <line x1="8"  y1="14" x2="16" y2="14" stroke={c} strokeWidth="1" opacity="0.6"/>
      <line x1="8"  y1="17" x2="13" y2="17" stroke={c} strokeWidth="1" opacity="0.4"/>
      {/* Ornement Art Déco — petit losange sur le coin */}
      <path d="M15 5L17 7L15 9L13 7Z" stroke={c} strokeWidth="0.8" fill={active ? 'rgba(214,178,94,0.25)' : 'none'} opacity="0.7"/>
      {/* Bordure dorée bas */}
      <line x1="5" y1="21" x2="19" y2="21" stroke={c} strokeWidth="1.5"/>
    </svg>
  )
}

// Comptabilité — balance / colonnes Art Déco
const IconComptaDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Symbole $ stylisé Art Déco */}
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.3" fill={active ? 'rgba(214,178,94,0.08)' : 'none'}/>
      <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="0.7" fill="none" opacity="0.4"/>
      {/* Ligne verticale du $ */}
      <line x1="12" y1="6"  x2="12" y2="18" stroke={c} strokeWidth="1.3"/>
      {/* Courbes du $ */}
      <path d="M15 8.5C14 7.5 10 7.5 10 10C10 12.5 14 12 14 14.5C14 17 10 17 9 16" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* 4 petits losanges aux points cardinaux */}
      {[[12,3],[21,12],[12,21],[3,12]].map(([x,y],i) => (
        <path key={i} d={`M${x} ${(y??0)-1.5}L${(x??0)+1.5} ${y}L${x} ${(y??0)+1.5}L${(x??0)-1.5} ${y}Z`}
          fill={c} opacity="0.7"/>
      ))}
    </svg>
  )
}

// Réglages — roue dentée géométrique Art Déco
const IconReglagesDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Roue dentée géométrique */}
      <circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.4" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      <circle cx="12" cy="12" r="7" stroke={c} strokeWidth="0.7" strokeDasharray="2 2" fill="none" opacity="0.5"/>
      {/* Dents de la roue — 8 losanges réguliers */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const cx = 12 + 8.5 * Math.sin(rad)
        const cy = 12 - 8.5 * Math.cos(rad)
        return (
          <path key={i}
            d={`M${cx} ${cy-1.4}L${cx+1.4} ${cy}L${cx} ${cy+1.4}L${cx-1.4} ${cy}Z`}
            fill={c} opacity={i % 2 === 0 ? 0.9 : 0.5}
          />
        )
      })}
      {/* Lignes de rayons */}
      {[0,90,180,270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line key={i}
            x1={12 + 3.5 * Math.sin(rad)} y1={12 - 3.5 * Math.cos(rad)}
            x2={12 + 7 * Math.sin(rad)}   y2={12 - 7 * Math.cos(rad)}
            stroke={c} strokeWidth="1.3" opacity="0.7"
          />
        )
      })}
    </svg>
  )
}

// Stats employé (vue employé) — graphe montant
const IconStatsDeco2 = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <polyline points="3,18 8,12 13,15 20,6" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="3"  cy="18" r="1.5" fill={c}/>
      <circle cx="8"  cy="12" r="1.5" fill={c}/>
      <circle cx="13" cy="15" r="1.5" fill={c}/>
      <circle cx="20" cy="6"  r="1.5" fill={c}/>
      {/* Flèche vers le haut */}
      <path d="M18 4L20 6L22 4" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke={c} strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}

// Paye — pièce de monnaie Art Déco
const IconPayeDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      {/* Pièce principale */}
      <circle cx="12" cy="12" r="9"   stroke={c} strokeWidth="1.4" fill={active ? 'rgba(214,178,94,0.12)' : 'none'}/>
      <circle cx="12" cy="12" r="6.5" stroke={c} strokeWidth="0.8" fill="none" opacity="0.5"/>
      {/* $ au centre */}
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill={c} fontFamily="serif">$</text>
      {/* Rayons décoratifs autour */}
      {[0,60,120,180,240,300].map((deg,i) => {
        const rad = deg * Math.PI / 180
        return (
          <line key={i}
            x1={12 + 7 * Math.sin(rad)}   y1={12 - 7 * Math.cos(rad)}
            x2={12 + 9 * Math.sin(rad)}   y2={12 - 9 * Math.cos(rad)}
            stroke={c} strokeWidth="1.2" opacity="0.6"
          />
        )
      })}
    </svg>
  )
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════

export default function BottomNav() {
  const pathname  = usePathname()
  const { theme, themeId } = useThemeStore()
  const { lang }  = useLangStore()
  const { currentEmployeeId, employees } = useEmployeeStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin    = currentEmployee?.role === 'admin'
  const isLoggedIn = !!currentEmployeeId

  // ── Tabs Admin ──────────────────────────────────────────────────────────────
  const adminTabs = [
    {
      href: '/',
      emoji: '🏠',
      decoIcon: (a: boolean) => <IconDashboardDeco active={a} />,
      label: t('Dashboard', 'Dashboard'),
    },
    {
      href: '/projects',
      emoji: '🏗️',
      decoIcon: (a: boolean) => <IconProjetsDeco active={a} />,
      label: t('Projets', 'Projects'),
    },
    {
      href: '/documents',
      emoji: '🧾',
      decoIcon: (a: boolean) => <IconDocumentsDeco active={a} />,
      label: t('Documents', 'Documents'),
    },
    {
      href: '/comptabilite',
      emoji: '📊',
      decoIcon: (a: boolean) => <IconComptaDeco active={a} />,
      label: t('Compta', 'Accounting'),
    },
    {
      href: '/settings',
      emoji: '⚙️',
      decoIcon: (a: boolean) => <IconReglagesDeco active={a} />,
      label: t('Réglages', 'Settings'),
    },
  ]

  // ── Tabs Employé ────────────────────────────────────────────────────────────
  const employeeTabs = [
    {
      href: '/',
      emoji: '🏠',
      decoIcon: (a: boolean) => <IconDashboardDeco active={a} />,
      label: t('Dashboard', 'Dashboard'),
    },
    {
      href: '/stats',
      emoji: '📈',
      decoIcon: (a: boolean) => <IconStatsDeco2 active={a} />,
      label: t('Stats', 'Stats'),
    },
    {
      href: '/paye',
      emoji: '💵',
      decoIcon: (a: boolean) => <IconPayeDeco active={a} />,
      label: t('Ma paye', 'My pay'),
    },
  ]

  // ── Pas connecté ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, zIndex: 50,
        background: isDeco ? 'rgba(5,5,5,0.98)' : 'rgba(10,5,0,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: isDeco ? '1px solid rgba(214,178,94,0.30)' : `1px solid ${theme.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isDeco && (
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
            background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.55),transparent)' }} />
        )}
        <p style={{ color: isDeco ? 'rgba(214,178,94,0.50)' : theme.colors.textMuted, fontSize:12, letterSpacing: isDeco ? '0.1em' : 0 }}>
          🔒 {t('Connectez-vous pour accéder', 'Login to access')}
        </p>
      </nav>
    )
  }

  const tabs = isAdmin ? adminTabs : employeeTabs

  // ── ART DÉCO ─────────────────────────────────────────────────────────────────
  if (isDeco) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, zIndex: 50,
        background: 'rgba(5,5,5,0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(214,178,94,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      }}>
        {/* Ligne dorée en haut */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.60),transparent)',
          pointerEvents:'none' }} />

        {tabs.map(({ href, decoIcon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              textDecoration:'none', padding:'8px 0', flex:1,
              transition:'all 0.2s ease',
            }}>
              {/* Icône SVG Art Déco */}
              <div style={{
                transition:'transform 0.2s ease',
                transform: active ? 'scale(1.15) translateY(-1px)' : 'scale(1)',
              }}>
                {decoIcon(active)}
              </div>

              {/* Label */}
              <span style={{
                fontSize:9, fontWeight: active ? 800 : 600,
                letterSpacing:'0.08em',
                color: active ? '#D6B25E' : 'rgba(214,178,94,0.40)',
                textTransform:'uppercase',
                textShadow: active ? '0 0 10px rgba(214,178,94,0.70)' : 'none',
                transition:'all 0.2s ease',
              }}>
                {label}
              </span>

              {/* Point actif doré */}
              {active && (
                <div style={{
                  width:18, height:2,
                  background:'linear-gradient(90deg,transparent,#D6B25E,transparent)',
                  borderRadius:1,
                  boxShadow:'0 0 6px rgba(214,178,94,0.80)',
                }} />
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  // ── AUTRES THÈMES ─────────────────────────────────────────────────────────────
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64, zIndex: 50,
      background: 'rgba(10,5,0,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${theme.colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {tabs.map(({ href, emoji, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={href} href={href} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            textDecoration:'none', padding:'8px 0', flex:1,
          }}>
            <span style={{
              fontSize:20,
              filter: active ? 'none' : 'grayscale(30%)',
              transition:'transform 0.15s',
              transform: active ? 'scale(1.15)' : 'scale(1)',
              display:'block',
            }}>
              {emoji}
            </span>
            <span style={{
              fontSize:9, fontWeight: active ? 800 : 600,
              letterSpacing:'0.5px',
              color: active ? theme.colors.primary : theme.colors.textMuted,
              transition:'color 0.15s',
            }}>
              {label}
            </span>
            {active && (
              <div style={{
                width:4, height:4, borderRadius:'50%',
                background: theme.colors.primary,
                boxShadow:`0 0 6px ${theme.colors.primary}`,
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
