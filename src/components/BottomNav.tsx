'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const IconDashboard = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <line x1="12" y1="22" x2="2"  y2="6"  stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.45"/>
      <line x1="12" y1="22" x2="5"  y2="4"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.55"/>
      <line x1="12" y1="22" x2="8"  y2="3"  stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity="0.70"/>
      <line x1="12" y1="22" x2="10" y2="3"  stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="12" y1="22" x2="12" y2="3"  stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="14" y2="3"  stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="12" y1="22" x2="16" y2="3"  stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity="0.70"/>
      <line x1="12" y1="22" x2="19" y2="4"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.55"/>
      <line x1="12" y1="22" x2="22" y2="6"  stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.45"/>
      <path d="M4 20 Q12 13 20 20" stroke={c} strokeWidth="1" fill="none" opacity="0.55"/>
      <circle cx="12" cy="22" r="1.5" fill={c}/>
    </svg>
  )
}

const IconProjets = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <polygon points="12,2 20,8 20,9 12,4 4,9 4,8" stroke={c} strokeWidth="1.2" fill="none"/>
      <rect x="4" y="9" width="16" height="13" stroke={c} strokeWidth="1.2" fill={active ? 'rgba(214,178,94,0.10)' : 'none'}/>
      <rect x="6"  y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="10" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="15" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="10" y="18" width="4" height="4" stroke={c} strokeWidth="0.9" fill="none"/>
    </svg>
  )
}

const IconDocuments = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <path d="M5 3H15L19 7V21H5V3Z" stroke={c} strokeWidth="1.3" fill={active ? 'rgba(214,178,94,0.08)' : 'none'}/>
      <path d="M15 3L15 7H19" stroke={c} strokeWidth="1.3"/>
      <line x1="8" y1="11" x2="16" y2="11" stroke={c} strokeWidth="1" opacity="0.8"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke={c} strokeWidth="1" opacity="0.6"/>
      <line x1="8" y1="17" x2="13" y2="17" stroke={c} strokeWidth="1" opacity="0.4"/>
    </svg>
  )
}

const IconCompta = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.3" fill={active ? 'rgba(214,178,94,0.08)' : 'none'}/>
      <line x1="12" y1="6" x2="12" y2="18" stroke={c} strokeWidth="1.3"/>
      <path d="M15 8.5C14 7.5 10 7.5 10 10C10 12.5 14 12 14 14.5C14 17 10 17 9 16" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const IconReglages = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.4" fill={active ? 'rgba(214,178,94,0.20)' : 'none'}/>
      <circle cx="12" cy="12" r="7" stroke={c} strokeWidth="0.7" strokeDasharray="2 2" fill="none" opacity="0.5"/>
      <line x1="12" y1="4.5" x2="12" y2="8.5" stroke={c} strokeWidth="1.5"/>
      <line x1="12" y1="15.5" x2="12" y2="19.5" stroke={c} strokeWidth="1.5"/>
      <line x1="4.5" y1="12" x2="8.5" y2="12" stroke={c} strokeWidth="1.5"/>
      <line x1="15.5" y1="12" x2="19.5" y2="12" stroke={c} strokeWidth="1.5"/>
      <circle cx="12" cy="4" r="1.2" fill={c}/>
      <circle cx="12" cy="20" r="1.2" fill={c}/>
      <circle cx="4" cy="12" r="1.2" fill={c}/>
      <circle cx="20" cy="12" r="1.2" fill={c}/>
    </svg>
  )
}

const IconStats = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <polyline points="3,18 8,12 13,15 20,6" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="3"  cy="18" r="1.5" fill={c}/>
      <circle cx="8"  cy="12" r="1.5" fill={c}/>
      <circle cx="13" cy="15" r="1.5" fill={c}/>
      <circle cx="20" cy="6"  r="1.5" fill={c}/>
      <line x1="3" y1="21" x2="21" y2="21" stroke={c} strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}

const IconPaye = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.4" fill={active ? 'rgba(214,178,94,0.12)' : 'none'}/>
      <circle cx="12" cy="12" r="6.5" stroke={c} strokeWidth="0.8" fill="none" opacity="0.5"/>
      <line x1="12" y1="7" x2="12" y2="17" stroke={c} strokeWidth="1.2"/>
      <path d="M14.5 9C13.5 8 10 8 10 10.5C10 13 14 12.5 14 15C14 17 10.5 17 9.5 16" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { theme, themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { currentEmployeeId, employees } = useEmployeeStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin    = currentEmployee?.role === 'admin'
  const isLoggedIn = !!currentEmployeeId

  const adminTabs = [
    { href: '/',             emoji: '🏠', decoIcon: (a: boolean) => <IconDashboard active={a} />, label: t('Dashboard', 'Dashboard')  },
    { href: '/projects',     emoji: '🏗️', decoIcon: (a: boolean) => <IconProjets   active={a} />, label: t('Projets',   'Projects')   },
    { href: '/documents',    emoji: '🧾', decoIcon: (a: boolean) => <IconDocuments active={a} />, label: t('Documents', 'Documents')  },
    { href: '/comptabilite', emoji: '📊', decoIcon: (a: boolean) => <IconCompta    active={a} />, label: t('Compta',    'Accounting') },
    { href: '/settings',     emoji: '⚙️', decoIcon: (a: boolean) => <IconReglages  active={a} />, label: t('Réglages',  'Settings')   },
  ]

  const employeeTabs = [
    { href: '/',      emoji: '🏠', decoIcon: (a: boolean) => <IconDashboard active={a} />, label: t('Dashboard', 'Dashboard') },
    { href: '/stats', emoji: '📈', decoIcon: (a: boolean) => <IconStats     active={a} />, label: t('Stats',     'Stats')     },
    { href: '/paye',  emoji: '💵', decoIcon: (a: boolean) => <IconPaye      active={a} />, label: t('Ma paye',   'My pay')    },
  ]

  const tabs = isAdmin ? adminTabs : employeeTabs

  const navBg     = isDeco ? 'rgba(5,5,5,0.98)'  : 'rgba(10,5,0,0.95)'
  const navBorder = isDeco ? '1px solid rgba(214,178,94,0.25)' : `1px solid ${theme.colors.border}`

  if (!isLoggedIn) {
    return (
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, height:64, zIndex:50,
        background:navBg, backdropFilter:'blur(12px)', borderTop:navBorder,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isDeco && <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.55),transparent)' }} />}
        <p style={{ color: isDeco ? 'rgba(214,178,94,0.50)' : theme.colors.textMuted, fontSize:12 }}>
          🔒 {t('Connectez-vous pour accéder', 'Login to access')}
        </p>
      </nav>
    )
  }

  if (isDeco) {
    return (
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, height:64, zIndex:50,
        background:navBg, backdropFilter:'blur(12px)', borderTop:navBorder,
        display:'flex', alignItems:'center', justifyContent:'space-around' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.60),transparent)', pointerEvents:'none' }} />
        {tabs.map(({ href, decoIcon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center',
              gap:3, textDecoration:'none', padding:'8px 0', flex:1 }}>
              <div style={{ transform: active ? 'scale(1.15) translateY(-1px)' : 'scale(1)', transition:'transform 0.2s ease' }}>
                {decoIcon(active)}
              </div>
              <span style={{ fontSize:9, fontWeight: active ? 800 : 600, letterSpacing:'0.08em',
