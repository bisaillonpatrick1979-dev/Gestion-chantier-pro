'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminNav = [
  { href: '/admin', label: 'Tableau', icon: '📊' },
  { href: '/admin/clients', label: 'Clients', icon: '👥' },
  { href: '/admin/workers', label: 'Équipe', icon: '🦺' },
  { href: '/admin/projects', label: 'Chantiers', icon: '🏗️' },
  { href: '/admin/documents', label: 'Documents', icon: '📄' },
  { href: '/admin/accounting', label: 'Comptabilité', icon: '💰' },
  { href: '/admin/reports', label: 'Stats', icon: '📈' },
  { href: '/admin/settings', label: 'Réglages', icon: '⚙️' },
]

export default function AdminShell({ children, title = 'Administration', subtitle = 'Gestion complète de l’entreprise' }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const pathname = usePathname()
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-7xl gap-4 px-3 py-4 md:px-5">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl lg:block">
          <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 p-4 text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.25em]">Admin</p>
            <h2 className="mt-1 text-xl font-black">Bureau</h2>
            <p className="mt-1 text-xs font-bold opacity-80">Contrats • Factures • Équipe</p>
          </div>
          <nav className="mt-3 grid gap-2">
            {adminNav.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-amber-300 text-slate-950' : 'bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'}`}>
                  <span className="mr-2">{item.icon}</span>{item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-2xl md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Gestion Chantier Pro</p>
            <h1 className="mt-2 text-2xl font-black md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          </header>
          <nav className="sticky top-16 z-20 mt-3 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur lg:hidden">
            {adminNav.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`shrink-0 rounded-xl px-3 py-2 text-sm font-black ${active ? 'bg-amber-300 text-slate-950' : 'bg-white/[0.06] text-white'}`}>
                  {item.icon} {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4">{children}</div>
        </section>
      </section>
    </main>
  )
}
