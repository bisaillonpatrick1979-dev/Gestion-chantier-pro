'use client'

import { useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'
import DetailDrawer from '@/components/ui/DetailDrawer'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60'
const labelClass = 'grid gap-2 text-sm font-bold text-slate-300'

export default function AdminWorkersPage() {
  const { employees, activeSessions } = useEmployeeStore()
  const workers = employees.filter((employee) => employee.id !== 'admin')
  const [drawerOpen, setDrawerOpen] = useState(false)

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
              <button onClick={() => setDrawerOpen(true)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Ajouter travailleur</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workers.length === 0 && (
              <button onClick={() => setDrawerOpen(true)} className="text-left">
                <AdminEntityCard title="Aucun travailleur" subtitle="Ajoute un employé ou sous-traitant pour commencer." status="À faire">
                  <p>Toucher pour ouvrir la fiche travailleur.</p>
                </AdminEntityCard>
              </button>
            )}
            {workers.map((worker) => {
              const active = activeSessions[worker.id]
              const type = worker.workerType === 'contractor' ? 'Sous-traitant' : 'Salarié / employé'
              return (
                <button key={worker.id} onClick={() => setDrawerOpen(true)} className="text-left">
                  <AdminEntityCard title={worker.name} subtitle={`${type} • ${worker.workMode}`} meta={`${worker.hourlyRate || 0}$/h`} status={active ? 'Punch actif' : worker.active ? 'Actif' : 'Inactif'}>
                    <p>Téléphone : {worker.phone || 'à compléter'}</p>
                    <p>Email : {worker.email || 'à compléter'}</p>
                    <p>Urgence : {worker.emergencyContact || 'à compléter'}</p>
                  </AdminEntityCard>
                </button>
              )
            })}
          </div>
        </section>

        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Fiche travailleur"
          subtitle="Employé salarié ou sous-traitant avec accès terrain limité."
          footer={
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 font-black text-white">Annuler</button>
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">Sauver travailleur</button>
            </div>
          }
        >
          <form className="grid gap-4">
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Identité et accès</h3>
              <label className={labelClass}>Nom légal<input className={inputClass} placeholder="Nom complet" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Rôle
                  <select className={inputClass} defaultValue="employee">
                    <option value="employee">Employé / Terrain</option>
                    <option value="admin">Admin / Bureau</option>
                  </select>
                </label>
                <label className={labelClass}>PIN<input className={inputClass} placeholder="PIN de connexion" inputMode="numeric" /></label>
              </div>
              <label className={labelClass}>Type de travailleur
                <select className={inputClass} defaultValue="salaried">
                  <option value="salaried">Salarié / employé</option>
                  <option value="contractor">Sous-traitant</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Coordonnées</h3>
              <label className={labelClass}>Téléphone<input className={inputClass} placeholder="(403) 000-0000" inputMode="tel" /></label>
              <label className={labelClass}>Email<input className={inputClass} placeholder="travailleur@email.com" inputMode="email" /></label>
              <label className={labelClass}>Adresse<input className={inputClass} placeholder="Adresse complète" /></label>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Contact d'urgence</h3>
              <label className={labelClass}>Nom contact urgence<input className={inputClass} placeholder="Nom complet" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Téléphone urgence<input className={inputClass} placeholder="Téléphone" inputMode="tel" /></label>
                <label className={labelClass}>Relation<input className={inputClass} placeholder="Conjoint, parent, ami..." /></label>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Paie</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Mode de paie
                  <select className={inputClass} defaultValue="heure">
                    <option value="heure">À l'heure</option>
                    <option value="surface">Au pied carré</option>
                    <option value="forfait">À la job / forfait</option>
                  </select>
                </label>
                <label className={labelClass}>Taux<input className={inputClass} placeholder="42" inputMode="decimal" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Fréquence
                  <select className={inputClass} defaultValue="weekly">
                    <option value="weekly">Hebdomadaire</option>
                    <option value="biweekly">Aux 2 semaines</option>
                    <option value="semimonthly">Semi-mensuel</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </label>
                <label className={labelClass}>Début période<input className={inputClass} placeholder="Vendredi, samedi, lundi..." /></label>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Sous-traitant / conformité</h3>
              <label className={labelClass}>Nom compagnie<input className={inputClass} placeholder="Compagnie du sous-traitant" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>GST / Taxe<input className={inputClass} placeholder="Numéro GST" /></label>
                <label className={labelClass}>NAS / SIN<input className={inputClass} placeholder="Si pas de compagnie" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>WCB<input className={inputClass} placeholder="Numéro WCB" /></label>
                <label className={labelClass}>Assurance responsabilité<input className={inputClass} placeholder="Police / numéro" /></label>
              </div>
              <label className={labelClass}>Logo sous-traitant<input className={inputClass} placeholder="URL ou fichier à brancher plus tard" /></label>
            </div>
          </form>
        </DetailDrawer>
      </AdminShell>
    </RoleGuard>
  )
}
