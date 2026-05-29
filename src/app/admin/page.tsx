'use client'

import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import { useEmployeeStore } from '@/store/useEmployeeStore'

function money(value: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value)
}

export default function AdminPage() {
  const { employees, activeSessions, dayDetails } = useEmployeeStore()
  const realEmployees = employees.filter((employee) => employee.id !== 'admin')
  const activeCount = Object.keys(activeSessions).length
  const totalHours = Object.values(dayDetails).reduce((sum, day) => sum + (day.totalHours || 0), 0)
  const totalRevenue = Object.values(dayDetails).reduce((sum, day) => sum + (day.totalRevenue || 0), 0)

  return (
    <RoleGuard allow={['admin']} fallbackTitle="Espace admin verrouillé" fallbackMessage="Les employés ne peuvent pas accéder aux clients, contrats, profits, factures globales ou réglages d'administration.">
      <AdminShell title="Tableau de bord admin" subtitle="Vue bureau : équipe, chantiers, documents, comptabilité et statistiques.">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Équipe</p>
            <p className="mt-2 text-3xl font-black text-white">{realEmployees.length}</p>
            <p className="mt-1 text-sm text-slate-300">employés / sous-traitants</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">En cours</p>
            <p className="mt-2 text-3xl font-black text-amber-300">{activeCount}</p>
            <p className="mt-1 text-sm text-slate-300">punch actif</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Heures</p>
            <p className="mt-2 text-3xl font-black text-cyan-300">{totalHours.toFixed(1)}h</p>
            <p className="mt-1 text-sm text-slate-300">historique local</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Production</p>
            <p className="mt-2 text-3xl font-black text-emerald-300">{money(totalRevenue)}</p>
            <p className="mt-1 text-sm text-slate-300">valeur terrain</p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">Priorités de refactor</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <p>✅ Séparer Admin/Bureau et Employé/Terrain.</p>
              <p>➡️ Créer Clients, Employés, Chantiers en listes compactes + détails.</p>
              <p>➡️ Ajouter documents professionnels : devis, contrats, factures PDF.</p>
              <p>➡️ Ajouter signature tactile, logo, watermark, preview, email/SMS.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">Sécurité rôle</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Cette section doit rester réservée à l'administrateur. Les employés doivent seulement voir leurs propres punchs, pauses, statistiques, calendrier, profil et factures personnelles de sous-traitant.
            </p>
          </div>
        </section>
      </AdminShell>
    </RoleGuard>
  )
}
