'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export default function BottomNav() {
  const pathname = usePathname()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { currentEmployeeId, employees } = useEmployeeStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = currentEmployee?.role === 'admin'
  const isLoggedIn = !!currentEmployeeId

  // Tabs selon le rôle
  const adminTabs = [
    { href: '/',             emoji: '📊', label: t('Dashboard', 'Dashboard')     },
    { href: '/stats',        emoji: '📈', label: t('Stats', 'Stats')             },
    { href: '/catalogue',    emoji: '📦', label: t('Catalogue', 'Catalog')       },
    { href: '/documents',    emoji: '📁', label: t('Documents', 'Documents')     },
    { href: '/comptabilite', emoji: '💰', label: t('Comptabilité', 'Accounting') },
    { href: '/clients', emoji: '👥', label: t('Clients', 'Clients') },
    { href: '/settings',     emoji: '⚙️', label: t('Réglages', 'Settings')      },
  ]

  const employeeTabs = [
    { href: '/',      emoji: '📊', label: t('Dashboard', 'Dashboard') },
    { href: '/stats', emoji: '📈', label: t('Stats', 'Stats')         },
    { href: '/paye',  emoji: '💵', label: t('Ma paye', 'My pay')      },
  ]

  // Si pas connecté → aucun onglet
  if (!isLoggedIn) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '64px', zIndex: 50,
        background: 'rgba(10,5,0,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
          🔒 {t('Connectez-vous pour accéder', 'Login to access')}
        </p>
      </nav>
    )
  }

  const tabs = isAdmin ? adminTabs : employeeTabs

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '64px', zIndex: 50,
      background: 'rgba(10,5,0,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${theme.colors.border}`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-around',
    }}>
      {tabs.map(({ href, emoji, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
            textDecoration: 'none', padding: '8px 12px',
            flex: 1,
          }}>
            <span style={{ fontSize: '18px' }}>{emoji}</span>
            <span style={{
              fontSize: '9px', fontWeight: '600',
              letterSpacing: '0.5px',
              color: active ? theme.colors.primary : theme.colors.textMuted,
            }}>
              {label}
            </span>
            {active && (
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: theme.colors.primary,
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
