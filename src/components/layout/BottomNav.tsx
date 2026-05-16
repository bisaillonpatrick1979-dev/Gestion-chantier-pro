'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'

function IcoAccueil({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10V20C5 20.6 5.4 21 6 21H10V16H14V21H18C18.6 21 19 20.6 19 20V10" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IcoFacture({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="14" height="18" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M17 6H21V22H7V20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="8" x2="13" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="11" x2="13" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="10" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoProjet({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.5"/>
      <circle cx="12" cy="15" r="2" stroke={c} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

function IcoDocument({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M14 2V8H20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="16" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoStats({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="2" y1="22" x2="22" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="3" y="13" width="4" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="10" y="7" width="4" height="15" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="17" y="10" width="4" height="12" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

function IcoReglages({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IcoPaye({ c }: { c: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" fill="none"/>
      <line x1="12" y1="6" x2="12" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15 9H10.5C9.1 9 8 10.1 8 11.5C8 12.9 9.1 14 10.5 14H13.5C14.9 14 16 15.1 16 16.5C16 17.9 14.9 19 13.5 19H9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) ?? null
  const isAdmin = currentEmployee?.role === 'admin'

  const adminItems = [
    { href: '/',          label: 'Accueil',   Icon: IcoAccueil  },
    { href: '/invoice',   label: 'Factures',  Icon: IcoFacture  },
    { href: '/projects',  label: 'Projets',   Icon: IcoProjet   },
    { href: '/documents', label: 'Documents', Icon: IcoDocument },
    { href: '/stats',     label: 'Stats',     Icon: IcoStats    },
    { href: '/settings',  label: 'Reglages',  Icon: IcoReglages },
  ]

  const employeeItems = [
    { href: '/',         label: 'Accueil',  Icon: IcoAccueil  },
    { href: '/stats',    label: 'Stats',    Icon: IcoStats    },
    { href: '/paye',     label: 'Paye',     Icon: IcoPaye     },
    { href: '/settings', label: 'Reglages', Icon: IcoReglages },
  ]

  const items = isAdmin ? adminItems : employeeItems

  return (
    <>
      <style>{`
        @keyframes navPulse {
          0%,100% { filter: drop-shadow(0 0 3px var(--nav-active, #D4AF37)); }
          50%      { filter: drop-shadow(0 0 7px var(--nav-active, #D4AF37)); }
        }
        .nav-icon-active { animation: navPulse 2.5s ease-in-out infinite; }
        .nav-link:active { opacity: 0.6 !important; }
      `}</style>

      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'var(--nav-bg, #0a0a0a)',
        borderTop: '1px solid var(--nav-border, #222)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--nav-active, #D4AF37), transparent)',
          opacity: 0.3,
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '60px',
          padding: '0 4px',
        }}>
          {items.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            const color = isActive
              ? 'var(--nav-active, #D4AF37)'
              : 'var(--nav-inactive, #555)'

            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  flex: 1,
                  padding: '6px 2px',
                  textDecoration: 'none',
                  opacity: isActive ? 1 : 0.6,
                  position: 'relative',
                  transition: 'opacity 0.2s',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%', right: '20%',
                    height: '2px',
                    background: 'var(--nav-active, #D4AF37)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <div className={isActive ? 'nav-icon-active' : ''}>
                  <item.Icon c={color} />
                </div>
                <span style={{
                  fontSize: '8px',
                  fontWeight: isActive ? 800 : 500,
                  color,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
