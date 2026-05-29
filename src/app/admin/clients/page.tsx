'use client'

import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import AdminEntityCard from '@/components/admin/AdminEntityCard'

const sampleClients = [
  { name: 'Client résidentiel', type: 'Particulier', contact: 'Téléphone / email à compléter', status: 'Actif' },
  { name: 'Compagnie cliente', type: 'Entreprise', contact: 'Contact principal à compléter', status: 'Prospect' },
]

export default function AdminClientsPage() {
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
              <button className="rounded-2xl bg-amber-300 px-4 py-3 font-black text-slate-950">+ Nouveau client</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sampleClients.map((client) => (
              <AdminEntityCard key={client.name} title={client.name} subtitle={client.contact} meta={client.type} status={client.status}>
                <p>Fiche détail prévue : adresse, téléphone, email, chantiers liés, devis, contrats, factures et notes.</p>
              </AdminEntityCard>
            ))}
          </div>
        </section>
      </AdminShell>
    </RoleGuard>
  )
}
