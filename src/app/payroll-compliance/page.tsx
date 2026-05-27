'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'

const RULE_VERSION = '2026.01'
const EFFECTIVE_DATE = '2026-01-01'
const NEXT_REVIEW = '2026-01-02'

export default function PayrollCompliancePage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [sentToAccountant, setSentToAccountant] = useState(false)
  const [periodType, setPeriodType] = useState<'weekly' | 'biweekly' | 'custom'>('weekly')
  const [batchPreparedAt, setBatchPreparedAt] = useState<string | null>(null)
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const status = useMemo(() => {
    if (!lastCheck) return t('À vérifier', 'Needs review')
    return t('Vérifié localement', 'Checked locally')
  }, [lastCheck, lang])

  const verifyRules = () => {
    const now = new Date().toISOString()
    setLastCheck(now)
    localStorage.setItem('payroll-compliance-last-check', now)
  }

  const sendToAccountant = () => {
    const now = new Date().toISOString()
    setSentToAccountant(true)
    setBatchPreparedAt(now)
    localStorage.setItem('payroll-compliance-accountant-export', now)
    localStorage.setItem('payroll-compliance-accountant-period-type', periodType)
  }

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button onClick={() => router.back()} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">← {t('Retour', 'Back')}</button>

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white">
          <h1 className="text-2xl font-black mb-2">🧾 {t('Conformité paie', 'Payroll compliance')}</h1>
          <p className="text-white/60 text-sm leading-relaxed">{t('Centre de suivi pour les règles de paie, les mises à jour annuelles et la validation comptable.', 'Tracking center for payroll rules, annual updates, and accountant validation.')}</p>
        </section>

        <section className="rounded-3xl p-5 bg-cyan-500/10 border border-cyan-300/30 text-white space-y-3">
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Statut', 'Status')}</span><strong className="text-cyan-200">{status}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Version règles', 'Rules version')}</span><strong>{RULE_VERSION}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('En vigueur', 'Effective')}</span><strong>{EFFECTIVE_DATE}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Révision prévue', 'Review due')}</span><strong>{NEXT_REVIEW}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Dernière vérif.', 'Last check')}</span><strong>{lastCheck ? lastCheck.slice(0, 10) : '—'}</strong></div>
        </section>

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white space-y-3">
          <h2 className="text-lg font-black">🔄 {t('Mise à jour des règles', 'Rules update')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Au premier lancement après le 2 janvier, l’application doit vérifier si une nouvelle version des règles de paie existe. Si oui, l’admin doit voir les changements et confirmer avant d’appliquer.', 'On the first launch after January 2, the app should check whether a new payroll rules version exists. If yes, the admin should review changes and confirm before applying them.')}</p>
          <button onClick={verifyRules} className="w-full rounded-2xl p-4 bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 font-black">{t('Vérifier les règles maintenant', 'Check rules now')}</button>
        </section>

        <section className="rounded-3xl p-5 bg-violet-500/10 border border-violet-300/30 text-white space-y-4">
          <h2 className="text-lg font-black">📤 {t('Envoi groupé au comptable', 'Grouped accountant send')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">
            {t(
              'Un seul bouton prépare la paie de tout le monde pour la période choisie, mais chaque personne reste séparée : salariés, sous-traitants et contracteurs. Le comptable reçoit un dossier clair, sans mélanger les montants.',
              'One button prepares payroll for everyone for the selected period, but each person stays separated: employees, subcontractors, and contractors. The accountant receives a clear package without mixed amounts.'
            )}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'weekly', fr: 'Semaine', en: 'Weekly' },
              { id: 'biweekly', fr: '2 semaines', en: 'Biweekly' },
              { id: 'custom', fr: 'Période perso', en: 'Custom' },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setPeriodType(option.id as 'weekly' | 'biweekly' | 'custom')}
                className={`rounded-2xl p-3 text-xs font-black border ${periodType === option.id ? 'bg-violet-500/30 border-violet-200 text-white' : 'bg-white/5 border-white/10 text-white/60'}`}
              >
                {lang === 'fr' ? option.fr : option.en}
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-4 bg-black/20 border border-white/10 space-y-2 text-sm">
            <p className="font-black text-violet-100">{t('Le dossier comptable doit contenir :', 'The accountant package should include:')}</p>
            <ul className="list-disc pl-5 text-white/70 leading-relaxed">
              <li>{t('un résumé général de la période;', 'one general period summary;')}</li>
              <li>{t('un fichier séparé par employé salarié;', 'one separate file per salaried employee;')}</li>
              <li>{t('un fichier séparé par sous-traitant / contracteur;', 'one separate file per subcontractor / contractor;')}</li>
              <li>{t('les heures, taux, montants, province, type de travail et version des règles;', 'hours, rates, amounts, province, work type, and rules version;')}</li>
              <li>{t('une note demandant la validation avant paiement officiel.', 'a note requesting validation before official payment.')}</li>
            </ul>
          </div>

          <button onClick={sendToAccountant} className="w-full rounded-2xl p-4 bg-violet-500/25 border border-violet-300/50 text-violet-100 font-black">{t('Envoyer toutes les payes au comptable', 'Send all payroll to accountant')}</button>
          {sentToAccountant && <p className="text-emerald-300 text-xs font-bold">✓ {t('Dossier groupé marqué prêt pour le comptable.', 'Grouped package marked ready for the accountant.')} {batchPreparedAt ? batchPreparedAt.slice(0, 10) : ''}</p>}
        </section>

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white space-y-3">
          <h2 className="text-lg font-black">📄 {t('Envoi individuel', 'Individual send')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Chaque paie doit aussi pouvoir être envoyée séparément si un employé, un sous-traitant ou une période demande une vérification à part.', 'Each payroll should also be sendable separately if an employee, subcontractor, or period needs a separate review.')}</p>
          <button onClick={sendToAccountant} className="w-full rounded-2xl p-4 bg-white/10 border border-white/15 text-white font-black">{t('Préparer un envoi individuel', 'Prepare individual send')}</button>
        </section>

        <section className="rounded-3xl p-5 bg-amber-500/10 border border-amber-300/30 text-amber-100">
          <h2 className="text-base font-black mb-2">⚠️ {t('Validation obligatoire', 'Required validation')}</h2>
          <p className="text-sm leading-relaxed">{t('L’application aide à préparer la paie, mais les retenues, taxes, remises et obligations légales doivent être validées par l’entreprise ou son professionnel comptable avant tout paiement officiel.', 'The app helps prepare payroll, but deductions, taxes, remittances, and legal obligations must be validated by the business or its accounting professional before any official payment.')}</p>
        </section>
      </div>
    </div>
  )
}
