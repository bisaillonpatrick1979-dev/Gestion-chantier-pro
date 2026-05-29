'use client'

import { useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'
import DetailDrawer from '@/components/ui/DetailDrawer'

const sampleClients = [
  { name: 'Client résidentiel', type: 'Particulier', contact: 'Téléphone / email à compléter', status: 'Actif' },
  { name: 'Compagnie cliente', type: 'Entreprise', contact: 'Contact principal à compléter', status: 'Prospect' },
]

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60'
const labelClass = 'grid gap-2 text-sm font-bold text-slate-300'

export default function AdminClientsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <RoleGuard allow={['admin']} fallbackTitle="Clients verrouillés" fallbackMessage="Les employés ne peuvent pas accéder à la base clients complète.">
      <AdminShell title="Clients" subtitle="Particuliers et compagnies. Liste compacte, fiche complète au clic à venir.">
        <section className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Base clients</h2>
                <p className="mt-1 text-sm text-slate-300">Chaque client doit pouvoir être une personne ou une compagnie.</p>
              </div>
              <button onClick={() => setDrawerOpen(true)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Nouveau client</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sampleClients.map((client) => (
              <button key={client.name} onClick={() => setDrawerOpen(true)} className="text-left">
                <AdminEntityCard title={client.name} subtitle={client.contact} meta={client.type} status={client.status}>
                  <p>Toucher pour ouvrir la fiche client complète.</p>
                </AdminEntityCard>
              </button>
            ))}
          </div>
        </section>

        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Fiche client"
          subtitle="Particulier ou compagnie, avec informations de contact et adresse."
          footer={
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 font-black text-white">Annuler</button>
              <button onClick={() => setDrawerOpen(false)} className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">Sauver client</button>
            </div>
          }
        >
          <form className="grid gap-4">
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Type de client</h3>
              <label className={labelClass}>Type
                <select className={inputClass} defaultValue="particulier">
                  <option value="particulier">Particulier</option>
                  <option value="compagnie">Compagnie</option>
                </select>
              </label>
              <label className={labelClass}>Nom personne ou compagnie<input className={inputClass} placeholder="Ex: Jean Tremblay ou ABC Construction" /></label>
              <label className={labelClass}>Contact principal<input className={inputClass} placeholder="Nom du contact" /></label>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Coordonnées</h3>
              <label className={labelClass}>Téléphone<input className={inputClass} placeholder="(403) 000-0000" inputMode="tel" /></label>
              <label className={labelClass}>Email<input className={inputClass} placeholder="client@email.com" inputMode="email" /></label>
              <label className={labelClass}>Adresse civique<input className={inputClass} placeholder="Adresse complète" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>Ville<input className={inputClass} placeholder="Calgary" /></label>
                <label className={labelClass}>Province / État<input className={inputClass} placeholder="Alberta" /></label>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-lg font-black">Notes</h3>
              <textarea className={`${inputClass} min-h-28`} placeholder="Notes internes, préférences, infos chantier..." />
            </div>
          </form>
        </DetailDrawer>
      </AdminShell>
    </RoleGuard>
  )
}
