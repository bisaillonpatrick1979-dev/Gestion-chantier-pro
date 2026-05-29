'use client'

import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'

const sampleProjects = [
  { name: 'Chantier à créer', client: 'Client à sélectionner', address: 'Adresse à compléter', status: 'Planifié' },
]

export default function AdminProjectsPage() {
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
              <button className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Nouveau chantier</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sampleProjects.map((project) => (
              <AdminEntityCard key={project.name} title={project.name} subtitle={project.address} meta={project.client} status={project.status}>
                <p>Fiche détail prévue : rayon GPS 25 m, équipe assignée, punchs, photos, extras, devis, contrat, facture et profit.</p>
              </AdminEntityCard>
            ))}
          </div>
        </section>
      </AdminShell>
    </RoleGuard>
  )
}
