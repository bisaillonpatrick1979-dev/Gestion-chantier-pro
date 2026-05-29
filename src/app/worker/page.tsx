'use client'

import WorkerShell from '@/components/layout/WorkerShell'
import RoleGuard from '@/components/security/RoleGuard'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'

export default function WorkerPage() {
  const { employees, currentEmployeeId, activeSessions, dayDetails } = useEmployeeStore()
  const employee = employees.find((item) => item.id === currentEmployeeId)
  const active = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const todayKey = employee ? `${employee.id}-${new Date().toISOString().split('T')[0]}` : ''
  const today = todayKey ? dayDetails[todayKey] : null

  return (
    <RoleGuard allow={['employee', 'admin']} fallbackTitle="Connexion employé requise" fallbackMessage="Choisis ton profil et entre ton PIN pour accéder à ton espace terrain.">
      <WorkerShell title="Accueil terrain" subtitle="Tes informations seulement : punch, pauses, journée, calendrier et profil.">
        <section className="grid gap-4">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Statut actuel</p>
            <h2 className="mt-2 text-2xl font-black">{active ? 'Punch actif' : 'Aucun punch actif'}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {active ? `Temps : ${formatTimer(active.elapsed)} • Valeur : ${formatCurrency(active.revenue)}` : 'Utilise l’onglet Punch pour commencer ta journée.'}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aujourd’hui</p>
              <p className="mt-2 text-3xl font-black text-cyan-300">{(today?.totalHours || 0).toFixed(1)}h</p>
              <p className="mt-1 text-sm text-slate-300">heures travaillées</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Argent</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">{formatCurrency(today?.totalRevenue || 0)}</p>
              <p className="mt-1 text-sm text-slate-300">valeur du jour</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pauses</p>
              <p className="mt-2 text-3xl font-black text-amber-300">{formatTimer(today?.totalBreak || 0)}</p>
              <p className="mt-1 text-sm text-slate-300">temps de pause</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">Règle importante</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Cet espace ne doit afficher que tes données personnelles. Les contrats clients, profits, comptabilité, paie des autres employés et réglages admin restent dans l’espace Admin.
            </p>
          </div>
        </section>
      </WorkerShell>
    </RoleGuard>
  )
}
