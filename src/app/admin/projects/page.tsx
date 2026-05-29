'use client'

import { useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'
import DetailDrawer from '@/components/ui/DetailDrawer'

const sampleProjects = [
  { name: 'Chantier à créer', client: 'Client à sélectionner', address: 'Adresse à compléter', status: 'Planifié' },
]

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60'
const labelClass = 'grid gap-2 text-sm font-bold text-slate-300'

export default function AdminProjectsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <RoleGuard allow={['admin']} fallbackTitle="Chantiers verrouillés" fallbackMessage="Les employés voient seulement leurs chantiers assignés, pas la gestion complète des projets.">
      <AdminShell title="Chantiers" subtitle="Projets avec client, adresse, rayon GPS, équipe, photos, punchs, extras et profit.">
        <section className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Projets / chantiers</h2>
                <p className="mt-1 text-sm text-slate-300">Chaque chantier doit relier client, employés, sous-traitants, documents, photos, GPS et rentabilité.</p>
              </div>
              <button onClick={() => setDrawerOpen(true)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Nouveau chantier</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sampleProjects.map((project) => (
              <button key={project.name} onClick={() => setDrawerOpen(true)} className="text-left">
                <AdminEntityCard title={project.name} subtitle={project.address} meta={project.client} status={project.status}>
                  <p>Toucher pour ouvrir la fiche chantier : GPS, équipe, photos, documents et profit.</p>
                </AdminEntityCard>
              </button>
            ))}
          </div>
        </section>

        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Fiche chantier"
          subtitle="Client, adresse, rayon GPS, équipe, documents et suivi terrain."
          footer={
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 font-black text-white">Annuler</button>
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">Sauver chantier</button>
            </div>
          }
        >
          <form className="grid gap-4">
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Informations chantier</h3>
              <label className={labelClass}>Nom chantier<input className={inputClass} placeholder="Ex: Revêtement extérieur — Abalone Crescent" /></label>
              <label className={labelClass}>Client
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>Choisir un client</option>
                  <option>Client résidentiel</option>
                  <option>Compagnie cliente</option>
                </select>
              </label>
              <label className={labelClass}>Statut
                <select className={inputClass} defaultValue="planned">
                  <option value="planned">Planifié</option>
                  <option value="active">Actif</option>
                  <option value="paused">En attente</option>
                  <option value="completed">Terminé</option>
                  <option value="invoiced">Facturé</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Adresse et géolocalisation</h3>
              <label className={labelClass}>Adresse chantier<input className={inputClass} placeholder="Adresse complète du chantier" /></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={labelClass}>Ville<input className={inputClass} placeholder="Calgary" /></label>
                <label className={labelClass}>Province<input className={inputClass} placeholder="Alberta" /></label>
                <label className={labelClass}>Rayon GPS<input className={inputClass} defaultValue="25" inputMode="numeric" /></label>
              </div>
              <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                Règle prévue : punch permis seulement dans le rayon GPS du chantier. Si le travailleur sort de la zone, pause automatique.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Équipe et dates</h3>
              <label className={labelClass}>Équipe assignée<input className={inputClass} placeholder="Employés / sous-traitants assignés" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Début prévu<input className={inputClass} type="date" /></label>
                <label className={labelClass}>Fin prévue<input className={inputClass} type="date" /></label>
              </div>
              <label className={labelClass}>Priorité
                <select className={inputClass} defaultValue="normal">
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Documents et notes</h3>
              <label className={labelClass}>Devis / contrat lié<input className={inputClass} placeholder="Document à relier" /></label>
              <label className={labelClass}>Photos / fichiers<input className={inputClass} placeholder="Upload à brancher" /></label>
              <textarea className={`${inputClass} min-h-28`} placeholder="Instructions chantier, scope of work, matériaux, accès, notes client..." />
            </div>
          </form>
        </DetailDrawer>
      </AdminShell>
    </RoleGuard>
  )
}
