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

  // ── ADMIN : 5 onglets ─────────────────────────────────────────────────────
  // Catalogue + Clients + Stats → déplacés dans Réglages
  const adminTabs = [
    { href: '/',             emoji: '🏠', label: t('Dashboard',    'Dashboard')  },
    { href: '/projects',     emoji: '🏗️', label: t('Projets',      'Projects')   },
    { href: '/documents',    emoji: '🧾', label: t('Documents',    'Documents')  },
    { href: '/comptabilite', emoji: '📊', label: t('Compta',       'Accounting') },
    { href: '/settings',     emoji: '⚙️', label: t('Réglages',     'Settings')   },
  ]

  // ── EMPLOYÉ : 3 onglets ───────────────────────────────────────────────────
  const employeeTabs = [
    { href: '/',      emoji: '🏠', label: t('Dashboard', 'Dashboard') },
    { href: '/stats', emoji: '📈', label: t('Stats',     'Stats')     },
    { href: '/paye',  emoji: '💵', label: t('Ma paye',   'My pay')    },
  ]

  // ── PAS CONNECTÉ ──────────────────────────────────────────────────────────
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
        // Active si pathname exact OU sous-page (ex: /projects/123)
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
            textDecoration: 'none', padding: '8px 0',
            flex: 1,
          }}>
            <span style={{
              fontSize: '20px',
              filter: active ? 'none' : 'grayscale(30%)',
              transition: 'transform 0.15s',
              transform: active ? 'scale(1.15)' : 'scale(1)',
              display: 'block',
            }}>
              {emoji}
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: active ? '800' : '600',
              letterSpacing: '0.5px',
              color: active ? theme.colors.primary : theme.colors.textMuted,
              transition: 'color 0.15s',
            }}>
              {label}
            </span>
            {active && (
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: theme.colors.primary,
                boxShadow: `0 0 6px ${theme.colors.primary}`,
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
