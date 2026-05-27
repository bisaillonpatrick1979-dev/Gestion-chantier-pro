'use client'

import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'

export default function TermsPage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button onClick={() => router.back()} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">← {t('Retour', 'Back')}</button>
        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white">
          <h1 className="text-2xl font-black mb-3">📋 {t('Conditions d’utilisation', 'Terms of use')}</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-4">{t('Version 1.0 — Ces conditions expliquent les règles de base pour utiliser l’application.', 'Version 1.0 — These terms explain the basic rules for using the app.')}</p>
          <div className="space-y-4 text-sm leading-relaxed text-white/75">
            <p>{t('L’application sert à aider à gérer les chantiers, heures, clients, employés, projets, documents, catalogue, factures, estimations et rapports.', 'The app helps manage jobsites, time, clients, employees, projects, documents, catalog items, invoices, estimates, and reports.')}</p>
            <p>{t('L’utilisateur est responsable de l’exactitude des données entrées et doit avoir l’autorisation de gérer les informations de compagnie, clients, employés, sous-traitants, photos et documents.', 'The user is responsible for the accuracy of entered data and must be authorized to manage company, client, employee, subcontractor, photo, and document information.')}</p>
            <p>{t('Les calculs de paie, taxes, retenues, profits, devis et rapports sont des aides de gestion. Ils doivent être vérifiés par un professionnel qualifié avant usage officiel.', 'Payroll, tax, deduction, profit, estimate, and report calculations are management aids. They should be verified by a qualified professional before official use.')}</p>
            <p>{t('L’utilisateur doit respecter les lois applicables à son entreprise, à ses employés, à ses clients et à sa région.', 'The user must follow the laws that apply to their business, employees, clients, and region.')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
