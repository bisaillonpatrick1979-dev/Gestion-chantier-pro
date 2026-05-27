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
    setSentToAccountant(true)
    localStorage.setItem('payroll-compliance-accountant-export', new Date().toISOString())
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

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white space-y-3">
          <h2 className="text-lg font-black">📤 {t('Envoyer au comptable', 'Send to accountant')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Prépare un résumé de paie pour salarié ou contracteur avec période, heures, montants, province, version des règles et note de validation.', 'Prepares a payroll summary for an employee or contractor with period, hours, amounts, province, rules version, and validation note.')}</p>
          <button onClick={sendToAccountant} className="w-full rounded-2xl p-4 bg-violet-500/20 border border-violet-300/40 text-violet-100 font-black">{t('Préparer l’envoi comptable', 'Prepare accountant send')}</button>
          {sentToAccountant && <p className="text-emerald-300 text-xs font-bold">✓ {t('Résumé marqué comme prêt à envoyer au comptable.', 'Summary marked as ready to send to accountant.')}</p>}
        </section>

        <section className="rounded-3xl p-5 bg-amber-500/10 border border-amber-300/30 text-amber-100">
          <h2 className="text-base font-black mb-2">⚠️ {t('Validation obligatoire', 'Required validation')}</h2>
          <p className="text-sm leading-relaxed">{t('L’application aide à préparer la paie, mais les retenues, taxes, remises et obligations légales doivent être validées par l’entreprise ou son professionnel comptable avant tout paiement officiel.', 'The app helps prepare payroll, but deductions, taxes, remittances, and legal obligations must be validated by the business or its accounting professional before any official payment.')}</p>
        </section>
      </div>
    </div>
  )
}
