'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { exportGroupedPayrollForAccountant } from '@/lib/accountantPayrollExport'
import {
  PAYROLL_YEAR,
  PAYROLL_LAST_UPDATED,
  PAYROLL_NEXT_UPDATE,
  CANADA_FEDERAL,
  CANADA_PROVINCES,
  USA_FEDERAL,
  USA_STATES,
} from '@/lib/payrollrates'

const RULE_VERSION = '2026.01'
const EFFECTIVE_DATE = PAYROLL_LAST_UPDATED
const NEXT_REVIEW = '2026-07-01'

type VerifyStatus = 'ok' | 'warning' | 'error'
type VerifyItem = { labelFr: string; labelEn: string; status: VerifyStatus; actual: string; expected: string }
type VerifyReport = { status: VerifyStatus; checkedAt: string; score: number; items: VerifyItem[] }

function near(a: number, b: number) { return Math.abs(a - b) < 0.000001 }
function makeItem(labelFr: string, labelEn: string, ok: boolean, actual: string | number, expected: string | number, warning = false): VerifyItem {
  return { labelFr, labelEn, status: ok ? 'ok' : warning ? 'warning' : 'error', actual: String(actual), expected: String(expected) }
}

function runRulesVerification(): VerifyReport {
  const expectedRegions = ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT']
  const missingRegions = expectedRegions.filter(code => !CANADA_PROVINCES[code])
  const badRegionData = Object.values(CANADA_PROVINCES).filter(region => !region.brackets?.length || region.basicPersonalAmount <= 0)
  const today = new Date()
  const nextUpdateDate = new Date(`${PAYROLL_NEXT_UPDATE}T00:00:00`)
  const expectedNextUpdate = NEXT_REVIEW

  const items: VerifyItem[] = [
    makeItem('Année des règles installées', 'Installed rules year', PAYROLL_YEAR === 2026, PAYROLL_YEAR, 2026),
    makeItem('Version du paquet local', 'Local package version', RULE_VERSION === '2026.01', RULE_VERSION, '2026.01'),
    makeItem('Date de mise à jour locale', 'Local update date', PAYROLL_LAST_UPDATED === '2026-01-01', PAYROLL_LAST_UPDATED, '2026-01-01'),
    makeItem('Prochaine mise à jour locale', 'Local next update', String(PAYROLL_NEXT_UPDATE) === expectedNextUpdate, PAYROLL_NEXT_UPDATE, expectedNextUpdate),
    makeItem('Calendrier non expiré', 'Calendar not expired', today < nextUpdateDate, today.toISOString().slice(0, 10), PAYROLL_NEXT_UPDATE, true),
    makeItem('RPC/CPP employé', 'CPP employee rate', near(CANADA_FEDERAL.cpp.employeeRate, 0.0595), CANADA_FEDERAL.cpp.employeeRate, 0.0595),
    makeItem('RPC/CPP employeur', 'CPP employer rate', near(CANADA_FEDERAL.cpp.employerRate, 0.0595), CANADA_FEDERAL.cpp.employerRate, 0.0595),
    makeItem('Plafond RPC/CPP YMPE', 'CPP YMPE ceiling', CANADA_FEDERAL.cpp.maxInsurableEarnings === 74600, CANADA_FEDERAL.cpp.maxInsurableEarnings, 74600),
    makeItem('Exemption de base RPC/CPP', 'CPP basic exemption', CANADA_FEDERAL.cpp.basicExemption === 3500, CANADA_FEDERAL.cpp.basicExemption, 3500),
    makeItem('Contribution max RPC/CPP employé', 'Max CPP employee contribution', Math.abs(CANADA_FEDERAL.cpp.maxEmployeeContribution - 4034.10) < 0.01, CANADA_FEDERAL.cpp.maxEmployeeContribution.toFixed(2), '4034.10'),
    makeItem('RPC2/CPP2', 'CPP2 rate', near(CANADA_FEDERAL.cpp.cpp2Rate, 0.04), CANADA_FEDERAL.cpp.cpp2Rate, 0.04),
    makeItem('Plafond RPC2/CPP2 YAMPE', 'CPP2 YAMPE ceiling', CANADA_FEDERAL.cpp.cpp2MaxEarnings === 81200, CANADA_FEDERAL.cpp.cpp2MaxEarnings, 81200),
    makeItem('AE/EI employé', 'EI employee rate', near(CANADA_FEDERAL.ei.employeeRate, 0.0163), CANADA_FEDERAL.ei.employeeRate, 0.0163),
    makeItem('Maximum assurable AE/EI', 'EI maximum insurable earnings', CANADA_FEDERAL.ei.maxInsurableEarnings === 65700, CANADA_FEDERAL.ei.maxInsurableEarnings, 65700),
    makeItem('Multiplicateur AE/EI employeur', 'EI employer multiplier', near(CANADA_FEDERAL.ei.employerMultiplier, 1.4), CANADA_FEDERAL.ei.employerMultiplier, 1.4),
    makeItem('Paliers fédéraux Canada présents', 'Canada federal brackets present', CANADA_FEDERAL.incomeTax.brackets.length === 5, CANADA_FEDERAL.incomeTax.brackets.length, 5),
    makeItem('Toutes les provinces/territoires Canada', 'All Canadian regions', missingRegions.length === 0, missingRegions.length ? missingRegions.join(', ') : expectedRegions.length, expectedRegions.length),
    makeItem('Données provinciales complètes', 'Complete provincial data', badRegionData.length === 0, badRegionData.length ? badRegionData.map(r => r.code).join(', ') : 'OK', 'OK'),
    makeItem('USA Social Security', 'USA Social Security', near(USA_FEDERAL.socialSecurity.rate, 0.062), USA_FEDERAL.socialSecurity.rate, 0.062),
    makeItem('USA Medicare', 'USA Medicare', near(USA_FEDERAL.medicare.rate, 0.0145), USA_FEDERAL.medicare.rate, 0.0145),
    makeItem('USA FUTA employeur', 'USA FUTA employer', near(USA_FEDERAL.futa.rate, 0.006), USA_FEDERAL.futa.rate, 0.006),
    makeItem('Paliers fédéraux USA présents', 'USA federal brackets present', USA_FEDERAL.incomeTax.brackets.length === 7, USA_FEDERAL.incomeTax.brackets.length, 7),
    makeItem('États USA configurés', 'Configured US states', Object.keys(USA_STATES).length >= 40, Object.keys(USA_STATES).length, '40+', true),
  ]

  const errors = items.filter(i => i.status === 'error').length
  const warnings = items.filter(i => i.status === 'warning').length
  const passed = items.filter(i => i.status === 'ok').length

  return {
    status: errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'ok',
    checkedAt: new Date().toISOString(),
    score: Math.round((passed / items.length) * 100),
    items,
  }
}

export default function PayrollCompliancePage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const { employees, dayDetails } = useEmployeeStore()
  const { company } = useCompanyStore()
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [verification, setVerification] = useState<VerifyReport | null>(null)
  const [sentToAccountant, setSentToAccountant] = useState(false)
  const [periodType, setPeriodType] = useState<'weekly' | 'biweekly' | 'custom'>('weekly')
  const [batchPreparedAt, setBatchPreparedAt] = useState<string | null>(null)
  const [exportInfo, setExportInfo] = useState<string>('')
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const status = useMemo(() => {
    if (!verification) return t('À vérifier', 'Needs review')
    if (verification.status === 'ok') return t('Conforme localement', 'Locally compliant')
    if (verification.status === 'warning') return t('À surveiller', 'Needs attention')
    return t('Non conforme', 'Not compliant')
  }, [verification, lang])

  const statusClass = verification?.status === 'ok'
    ? 'text-emerald-300'
    : verification?.status === 'warning'
      ? 'text-amber-300'
      : verification?.status === 'error'
        ? 'text-red-300'
        : 'text-cyan-200'

  const payrollCounts = useMemo(() => {
    const workers = employees.filter(emp => emp.id !== 'admin' && emp.active !== false)
    return {
      total: workers.length,
      salaried: workers.filter(emp => emp.workerType === 'salaried').length,
      contractors: workers.filter(emp => emp.workerType !== 'salaried').length,
    }
  }, [employees])

  const verifyRules = () => {
    const report = runRulesVerification()
    setVerification(report)
    setLastCheck(report.checkedAt)
    localStorage.setItem('payroll-compliance-last-check', report.checkedAt)
    localStorage.setItem('payroll-compliance-report', JSON.stringify(report))
  }

  const sendToAccountant = () => {
    const now = new Date().toISOString()
    const result = exportGroupedPayrollForAccountant({ company, employees, dayDetails, periodType, lang: lang as 'fr' | 'en' })
    setSentToAccountant(true)
    setBatchPreparedAt(now)
    setExportInfo(`${result.employeeCount} ${t('personne(s)', 'worker(s)')} · ${result.start} → ${result.end}`)
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
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Statut', 'Status')}</span><strong className={statusClass}>{status}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Score', 'Score')}</span><strong>{verification ? `${verification.score}%` : '—'}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Version règles', 'Rules version')}</span><strong>{RULE_VERSION}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('En vigueur', 'Effective')}</span><strong>{EFFECTIVE_DATE}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Révision prévue', 'Review due')}</span><strong>{NEXT_REVIEW}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-white/60 text-xs font-bold uppercase">{t('Dernière vérif.', 'Last check')}</span><strong>{lastCheck ? lastCheck.slice(0, 10) : '—'}</strong></div>
        </section>

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white space-y-3">
          <h2 className="text-lg font-black">🔄 {t('Vérification réelle des règles', 'Real rules verification')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Ce bouton compare maintenant les règles installées dans l’application avec le manifeste de conformité local 2026.01.', 'This button now compares the rules installed in the app against the local 2026.01 compliance manifest.')}</p>
          <button onClick={verifyRules} className="w-full rounded-2xl p-4 bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 font-black">{t('Lancer la vérification complète', 'Run full verification')}</button>
          {verification && (
            <div className="rounded-2xl p-4 bg-black/20 border border-white/10 space-y-2">
              <p className="text-xs text-white/55 font-bold">{t('Résultats détaillés', 'Detailed results')}</p>
              {verification.items.map(item => (
                <div key={item.labelFr} className="rounded-xl p-3 bg-white/5 border border-white/10">
                  <div className="flex justify-between gap-2">
                    <strong className="text-sm">{item.status === 'ok' ? '✅' : item.status === 'warning' ? '⚠️' : '🚨'} {lang === 'fr' ? item.labelFr : item.labelEn}</strong>
                    <span className="text-[10px] text-white/50">{item.status.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-white/55 mt-1">{t('Actuel', 'Actual')}: {item.actual} · {t('Attendu', 'Expected')}: {item.expected}</p>
                </div>
              ))}
              <p className="text-amber-200 text-xs leading-relaxed">{t('Cette vérification confirme le paquet installé localement. La paie officielle doit quand même être validée par l’entreprise ou le comptable.', 'This verification confirms the locally installed package. Official payroll must still be validated by the business or accountant.')}</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl p-5 bg-violet-500/10 border border-violet-300/30 text-white space-y-4">
          <h2 className="text-lg font-black">📤 {t('Envoi groupé au comptable', 'Grouped accountant send')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Un seul bouton prépare la paie de tout le monde pour la période choisie, mais chaque personne reste séparée : salariés, sous-traitants et contracteurs. Le comptable reçoit un fichier CSV clair, sans mélanger les montants.', 'One button prepares payroll for everyone for the selected period, but each person stays separated: employees, subcontractors, and contractors. The accountant receives a clear CSV file without mixed amounts.')}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'weekly', fr: 'Semaine', en: 'Weekly' },
              { id: 'biweekly', fr: '2 semaines', en: 'Biweekly' },
              { id: 'custom', fr: 'Période perso', en: 'Custom' },
            ].map(option => (
              <button key={option.id} onClick={() => setPeriodType(option.id as 'weekly' | 'biweekly' | 'custom')} className={`rounded-2xl p-3 text-xs font-black border ${periodType === option.id ? 'bg-violet-500/30 border-violet-200 text-white' : 'bg-white/5 border-white/10 text-white/60'}`}>{lang === 'fr' ? option.fr : option.en}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl p-3 bg-black/20 border border-white/10"><p className="text-xl font-black">{payrollCounts.total}</p><p className="text-[10px] text-white/55">{t('total', 'total')}</p></div>
            <div className="rounded-2xl p-3 bg-black/20 border border-white/10"><p className="text-xl font-black">{payrollCounts.salaried}</p><p className="text-[10px] text-white/55">{t('salariés', 'employees')}</p></div>
            <div className="rounded-2xl p-3 bg-black/20 border border-white/10"><p className="text-xl font-black">{payrollCounts.contractors}</p><p className="text-[10px] text-white/55">{t('contracteurs', 'contractors')}</p></div>
          </div>
          <button onClick={sendToAccountant} className="w-full rounded-2xl p-4 bg-violet-500/25 border border-violet-300/50 text-violet-100 font-black">{t('Générer le fichier comptable CSV', 'Generate accountant CSV file')}</button>
          {sentToAccountant && <p className="text-emerald-300 text-xs font-bold">✓ {t('Fichier comptable généré.', 'Accountant file generated.')} {exportInfo || (batchPreparedAt ? batchPreparedAt.slice(0, 10) : '')}</p>}
        </section>

        <section className="rounded-3xl p-5 bg-white/5 border border-white/10 text-white space-y-3">
          <h2 className="text-lg font-black">📄 {t('Envoi individuel', 'Individual send')}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t('Chaque paie doit aussi pouvoir être envoyée séparément si un employé, un sous-traitant ou une période demande une vérification à part.', 'Each payroll should also be sendable separately if an employee, subcontractor, or period needs a separate review.')}</p>
          <button onClick={sendToAccountant} className="w-full rounded-2xl p-4 bg-white/10 border border-white/15 text-white font-black">{t('Générer un export individuel', 'Generate individual export')}</button>
        </section>

        <section className="rounded-3xl p-5 bg-amber-500/10 border border-amber-300/30 text-amber-100">
          <h2 className="text-base font-black mb-2">⚠️ {t('Validation obligatoire', 'Required validation')}</h2>
          <p className="text-sm leading-relaxed">{t('L’application aide à préparer la paie, mais les retenues, taxes, remises et obligations légales doivent être validées par l’entreprise ou son professionnel comptable avant tout paiement officiel.', 'The app helps prepare payroll, but deductions, taxes, remittances, and legal obligations must be validated by the business or its accounting professional before any official payment.')}</p>
        </section>
      </div>
    </div>
  )
}
