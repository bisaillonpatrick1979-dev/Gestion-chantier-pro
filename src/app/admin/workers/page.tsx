'use client'

import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export default function AdminWorkersPage() {
  const { employees, activeSessions } = useEmployeeStore()
  const workers = employees.filter((employee) => employee.id !== 'admin')

  return (
    <RoleGuard allow={['admin']} fallbackTitle="Équipe verrouillée" fallbackMessage="Les employés ne peuvent pas consulter la fiche RH ou la paie des autres travailleurs.">
      <AdminShell title="Équipe" subtitle="Employés salariés et sous-traitants. Gestion RH, paie, conformité et accès terrain.">
        <section className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Travailleurs</h2>
                <p className="mt-1 text-sm text-slate-300">Chaque fiche doit contenir infos personnelles, urgence, NAS/SIN, WCB, GST, assurance et mode de paie.</p>
              </div>
              <button className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Ajouter travailleur</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workers.length === 0 && (
              <AdminEntityCard title="Aucun travailleur" subtitle="Ajoute un employé ou sous-traitant pour commencer." status="À faire">
                <p>La prochaine étape sera de brancher un formulaire complet en drawer/popup.</p>
              </AdminEntityCard>
            )}
            {workers.map((worker) => {
              const active = activeSessions[worker.id]
              const type = worker.workerType === 'contractor' ? 'Sous-traitant' : 'Salarié / employé'
              return (
                <AdminEntityCard key={worker.id} title={worker.name} subtitle={`${type} • ${worker.workMode}`} meta={`${worker.hourlyRate || 0}$/h`} status={active ? 'Punch actif' : worker.active ? 'Actif' : 'Inactif'}>
                  <p>Téléphone : {worker.phone || 'à compléter'}</p>
                  <p>Email : {worker.email || 'à compléter'}</p>
                  <p>Urgence : {worker.emergencyContact || 'à compléter'}</p>
                </AdminEntityCard>
              )
            })}
          </div>
        </section>
      </AdminShell>
    </RoleGuard>
  )
}
