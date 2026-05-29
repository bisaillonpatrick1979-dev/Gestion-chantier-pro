'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const workerNav = [
  { href: '/worker', label: 'Accueil', icon: '🏠' },
  { href: '/worker/punch', label: 'Punch', icon: '⏱️' },
  { href: '/worker/calendar', label: 'Calendrier', icon: '📅' },
  { href: '/worker/profile', label: 'Profil', icon: '👤' },
  { href: '/worker/invoices', label: 'Mes factures', icon: '🧾' },
]

export default function WorkerShell({ children, title = 'Espace employé', subtitle = 'Punch, pauses, calendrier et profil personnel' }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const employee = employees.find((item) => item.id === currentEmployeeId)

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto w-full max-w-4xl px-3 py-4 md:px-5">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 p-4 shadow-2xl md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Terrain</p>
              <h1 className="mt-2 text-2xl font-black md:text-4xl">{title}</h1>
              <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-right">
              <p className="text-xs text-slate-300">Connecté</p>
              <p className="font-black text-cyan-200">{employee?.name || 'Employé'}</p>
            </div>
          </div>
        </header>
        <nav className="sticky top-16 z-20 mt-3 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur">
          {workerNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`shrink-0 rounded-xl px-3 py-2 text-sm font-black ${active ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.06] text-white'}`}>
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-4">{children}</div>
      </section>
    </main>
  )
}
