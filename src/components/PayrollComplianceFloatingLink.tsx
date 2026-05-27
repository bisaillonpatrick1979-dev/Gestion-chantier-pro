'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'

export default function PayrollComplianceFloatingLink() {
  const pathname = usePathname()
  const { lang } = useLangStore()

  if (pathname === '/onboarding' || pathname === '/payroll-compliance') return null

  const label = lang === 'fr' ? 'Paye / Comptable' : 'Payroll / Accountant'
  const title = lang === 'fr'
    ? 'Envoyer toutes les payes ou des payes sélectionnées au comptable'
    : 'Send all payroll or selected payroll to the accountant'

  return (
    <Link
      href="/payroll-compliance"
      title={title}
      style={{
        position: 'fixed',
        left: 12,
        bottom: 92,
        zIndex: 120,
        padding: '12px 14px',
        borderRadius: 999,
        border: '1px solid rgba(34,211,238,0.55)',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.97), rgba(34,211,238,0.97))',
        color: 'white',
        fontSize: 12,
        fontWeight: 950,
        textDecoration: 'none',
        boxShadow: '0 12px 30px rgba(0,0,0,0.48), 0 0 20px rgba(34,211,238,0.36)',
        letterSpacing: 0.4,
      }}
    >
      🧾 {label}
    </Link>
  )
}
