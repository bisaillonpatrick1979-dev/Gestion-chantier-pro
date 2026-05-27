'use client'

import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'

export default function PrivacyPage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button onClick={() => router.back()} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">← {t('Retour', 'Back')}</button>
        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white">
          <h1 className="text-2xl font-black mb-3">🔐 {t('Politique de confidentialité', 'Privacy policy')}</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-4">{t('Version 1.0 — Cette politique explique quelles données peuvent être utilisées et pourquoi.', 'Version 1.0 — This policy explains what data may be used and why.')}</p>
          <div className="space-y-4 text-sm leading-relaxed text-white/75">
            <p>{t('L’application peut gérer des données de compagnie, clients, employés, sous-traitants, projets, heures, montants, factures, documents, photos, paramètres et localisation si activée.', 'The app may manage company, client, employee, subcontractor, project, time, amount, invoice, document, photo, settings, and location data when enabled.')}</p>
            <p>{t('Les données servent à faire fonctionner l’application, sauvegarder les informations, générer des documents, suivre les heures, organiser les clients et projets, et produire des rapports.', 'Data is used to operate the app, save information, generate documents, track time, organize clients and projects, and produce reports.')}</p>
            <p>{t('Selon le mode choisi, les données peuvent rester locales, être exportées dans un fichier de sauvegarde ou être synchronisées avec Supabase/cloud.', 'Depending on the selected mode, data may stay local, be exported into a backup file, or be synchronized with Supabase/cloud.')}</p>
            <p>{t('Nous appliquons des mesures strictes pour protéger l’accès aux données, incluant les rôles, permissions limitées et règles d’accès lorsque le cloud est activé.', 'We apply strict measures to protect data access, including roles, limited permissions, and access rules when cloud is enabled.')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
