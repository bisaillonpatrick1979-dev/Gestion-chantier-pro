'use client'

import Link from 'next/link'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import type { EmployeeRole } from '@/types/employee'

type RoleGuardProps = {
  allow: EmployeeRole[]
  children: React.ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

export default function RoleGuard({
  allow,
  children,
  fallbackTitle = 'Accès limité',
  fallbackMessage = 'Cette section est réservée au bon rôle utilisateur.',
}: RoleGuardProps) {
  const { employees, currentEmployeeId } = useEmployeeStore()
  const current = employees.find((employee) => employee.id === currentEmployeeId)
  const currentRole = current?.role || null

  if (currentRole && allow.includes(currentRole)) return <>{children}</>

  return (
    <main className="min-h-[70vh] px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-300">Gestion Chantier Pro</p>
        <h1 className="mt-3 text-2xl font-black text-white">{fallbackTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{fallbackMessage}</p>
        <div className="mt-6 grid gap-3">
          <Link href="/" className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">
            Retour au choix de profil
          </Link>
          <Link href="/worker" className="rounded-2xl border border-white/10 px-4 py-3 font-bold text-white">
            Aller à l’espace employé
          </Link>
        </div>
      </section>
    </main>
  )
}
