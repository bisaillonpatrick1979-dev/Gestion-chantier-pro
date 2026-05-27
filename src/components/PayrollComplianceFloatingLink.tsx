'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'

export default function PayrollComplianceFloatingLink() {
  const pathname = usePathname()
  const { lang } = useLangStore()

  if (pathname !== '/paye') return null

  const label = lang === 'fr' ? 'Conformité paie' : 'Payroll compliance'

  return (
    <Link
      href="/payroll-compliance"
      style={{
        position: 'fixed',
        right: 14,
        bottom: 92,
        zIndex: 80,
        padding: '12px 14px',
        borderRadius: 999,
        border: '1px solid rgba(34,211,238,0.45)',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(34,211,238,0.95))',
        color: 'white',
        fontSize: 12,
        fontWeight: 950,
        textDecoration: 'none',
        boxShadow: '0 12px 30px rgba(0,0,0,0.42), 0 0 18px rgba(34,211,238,0.28)',
        letterSpacing: 0.4,
      }}
    >
      🧾 {label}
    </Link>
  )
}
