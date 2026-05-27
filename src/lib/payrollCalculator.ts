// src/lib/payrollCalculator.ts
import {
  CANADA_FEDERAL,
  CANADA_PROVINCES,
  USA_FEDERAL,
  USA_STATES,
  PAYROLL_YEAR,
} from './payrollrates'

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type WorkerType = 'contractor' | 'salaried'
export type Country = 'CA' | 'US'

type PayrollBracket = { upTo?: number; min?: number; max?: number; rate: number }

export const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
}

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, { fr: string; en: string }> = {
  weekly: { fr: 'Hebdomadaire', en: 'Weekly' },
  biweekly: { fr: 'Aux deux semaines', en: 'Bi-weekly' },
  semimonthly: { fr: 'Deux fois/mois', en: 'Semi-monthly' },
  monthly: { fr: 'Mensuel', en: 'Monthly' },
}

export interface PayrollResult {
  country: Country
  province: string
  payFrequency: PayFrequency
  grossPay: number
  annualGross: number
  deductions: {
    cpp?: number
    cpp2?: number
    ei?: number
    federalTax?: number
    provincialTax?: number
    socialSecurity?: number
    medicare?: number
    stateTax?: number
    federalIncomeTax?: number
  }
  employerCost: {
    cpp?: number
    cpp2?: number
    ei?: number
    socialSecurity?: number
    medicare?: number
    futa?: number
  }
  totalDeductions: number
  netPay: number
  totalEmployerCost: number
  effectiveTaxRate: number
  notes: string[]
  year: number
}

function calcBracketTax(annualIncome: number, brackets: PayrollBracket[], personalAmount = 0): number {
  const taxableIncome = Math.max(0, annualIncome - personalAmount)
  let tax = 0
  let previousLimit = 0

  for (const bracket of brackets) {
    if (typeof bracket.upTo === 'number') {
      const upper = bracket.upTo
      if (taxableIncome <= previousLimit) break
      const taxable = Math.max(0, Math.min(taxableIncome, upper) - previousLimit)
      tax += taxable * bracket.rate
      previousLimit = upper
    } else {
      const min = bracket.min ?? previousLimit
      const max = bracket.max ?? Infinity
      if (taxableIncome <= min) break
      const taxable = Math.max(0, Math.min(taxableIncome, max) - min)
      tax += taxable * bracket.rate
      previousLimit = max
    }
  }

  return tax
}

export function calculateCanadaPayroll(grossPay: number, provinceCode: string, payFrequency: PayFrequency): PayrollResult {
  const periods = PAY_PERIODS[payFrequency]
  const annualGross = grossPay * periods
  const province = CANADA_PROVINCES[provinceCode] ?? CANADA_PROVINCES.AB
  const fed = CANADA_FEDERAL
  const notes: string[] = []
  const deductions: PayrollResult['deductions'] = {}
  const employerCost: PayrollResult['employerCost'] = {}

  if (!CANADA_PROVINCES[provinceCode]) notes.push(`Province ${provinceCode} non trouvée — utilisation Alberta par défaut`)

  if (provinceCode !== 'QC') {
    const pensionableEarnings = Math.min(
      Math.max(0, annualGross - fed.cpp.basicExemption),
      fed.cpp.maxInsurableEarnings - fed.cpp.basicExemption
    )
    const annualCPP = Math.min(pensionableEarnings * fed.cpp.employeeRate, fed.cpp.maxEmployeeContribution)
    deductions.cpp = annualCPP / periods
    employerCost.cpp = deductions.cpp

    if (annualGross > fed.cpp.maxInsurableEarnings) {
      const cpp2Earnings = Math.min(
        annualGross - fed.cpp.maxInsurableEarnings,
        fed.cpp.cpp2MaxEarnings - fed.cpp.maxInsurableEarnings
      )
      const annualCPP2 = Math.min(cpp2Earnings * fed.cpp.cpp2Rate, fed.cpp.cpp2MaxContribution)
      deductions.cpp2 = annualCPP2 / periods
      employerCost.cpp2 = deductions.cpp2
    }
  } else {
    notes.push('Québec : QPP/RRQ et RQAP peuvent différer. Vérifiez avec Revenu Québec.')
    deductions.cpp = (annualGross * 0.0608) / periods
    employerCost.cpp = deductions.cpp
  }

  if (provinceCode !== 'QC') {
    const insurable = Math.min(annualGross, fed.ei.maxInsurableEarnings)
    const annualEI = Math.min(insurable * fed.ei.employeeRate, fed.ei.maxEmployeePremium)
    deductions.ei = annualEI / periods
    employerCost.ei = deductions.ei * fed.ei.employerMultiplier
  } else {
    deductions.ei = (annualGross * 0.013) / periods
    employerCost.ei = deductions.ei * 1.4
  }

  const annualFederalTax = calcBracketTax(annualGross, fed.incomeTax.brackets, fed.incomeTax.basicPersonalAmount)
  const federalTaxAdjusted = Math.max(
    0,
    annualFederalTax - ((deductions.cpp ?? 0) * periods * 0.15) - ((deductions.ei ?? 0) * periods * 0.15)
  )
  deductions.federalTax = federalTaxAdjusted / periods

  const annualProvTax = calcBracketTax(annualGross, province.brackets, province.basicPersonalAmount)
  deductions.provincialTax = annualProvTax / periods

  const totalDeductions =
    (deductions.cpp ?? 0) +
    (deductions.cpp2 ?? 0) +
    (deductions.ei ?? 0) +
    (deductions.federalTax ?? 0) +
    (deductions.provincialTax ?? 0)

  const totalEmployerExtra =
    (employerCost.cpp ?? 0) +
    (employerCost.cpp2 ?? 0) +
    (employerCost.ei ?? 0)

  const netPay = grossPay - totalDeductions

  if (annualGross > 100000) notes.push('Revenu élevé : vérifiez avec un comptable pour optimisation fiscale.')
  notes.push(`Calculs estimés pour ${province.code} — ${PAYROLL_YEAR}. Utilisez le calculateur PDOC de l'ARC pour confirmation officielle.`)

  return {
    country: 'CA',
    province: province.code,
    payFrequency,
    grossPay,
    annualGross,
    deductions,
    employerCost,
    totalDeductions,
    netPay,
    totalEmployerCost: grossPay + totalEmployerExtra,
    effectiveTaxRate: grossPay > 0 ? (totalDeductions / grossPay) * 100 : 0,
    notes,
    year: PAYROLL_YEAR,
  }
}

export function calculateUSAPayroll(grossPay: number, stateCode: string, payFrequency: PayFrequency): PayrollResult {
  const periods = PAY_PERIODS[payFrequency]
  const annualGross = grossPay * periods
  const state = USA_STATES[stateCode]
  const fed = USA_FEDERAL
  const notes: string[] = []
  const deductions: PayrollResult['deductions'] = {}
  const employerCost: PayrollResult['employerCost'] = {}

  if (!state) notes.push(`État ${stateCode} non trouvé — aucun impôt d'état appliqué.`)

  const ssAnnualWages = Math.min(annualGross, fed.socialSecurity.wageBase)
  const annualSS = ssAnnualWages * fed.socialSecurity.rate
  deductions.socialSecurity = annualSS / periods
  employerCost.socialSecurity = annualSS / periods
  if (annualGross > fed.socialSecurity.wageBase) notes.push('Plafond Social Security atteint — pas de déduction supplémentaire au-delà du plafond.')

  deductions.medicare = grossPay * fed.medicare.rate
  employerCost.medicare = grossPay * fed.medicare.rate
  if (annualGross > fed.medicare.additionalThreshold) {
    deductions.medicare += grossPay * fed.medicare.additionalRate
    notes.push('Medicare additionnel 0.9% appliqué.')
  }

  const annualFederalTax = calcBracketTax(annualGross, fed.incomeTax.brackets, fed.incomeTax.standardDeductionSingle)
  deductions.federalIncomeTax = annualFederalTax / periods

  if (state) {
    deductions.stateTax = grossPay * state.incomeTaxRate
    if (state.incomeTaxRate === 0) notes.push(`${state.name} : aucun impôt sur le revenu d'état configuré.`)
  }

  const futaAnnualWages = Math.min(annualGross, fed.futa.wageBase)
  employerCost.futa = (futaAnnualWages * fed.futa.rate) / periods

  const totalDeductions =
    (deductions.socialSecurity ?? 0) +
    (deductions.medicare ?? 0) +
    (deductions.federalIncomeTax ?? 0) +
    (deductions.stateTax ?? 0)

  const totalEmployerExtra =
    (employerCost.socialSecurity ?? 0) +
    (employerCost.medicare ?? 0) +
    (employerCost.futa ?? 0)

  const netPay = grossPay - totalDeductions

  notes.push(`Calculs estimés pour ${stateCode} — ${PAYROLL_YEAR}. Vérifiez avec un comptable CPA américain.`)

  return {
    country: 'US',
    province: stateCode,
    payFrequency,
    grossPay,
    annualGross,
    deductions,
    employerCost,
    totalDeductions,
    netPay,
    totalEmployerCost: grossPay + totalEmployerExtra,
    effectiveTaxRate: grossPay > 0 ? (totalDeductions / grossPay) * 100 : 0,
    notes,
    year: PAYROLL_YEAR,
  }
}

export function calculatePayroll(grossPay: number, country: Country, regionCode: string, payFrequency: PayFrequency): PayrollResult {
  return country === 'CA'
    ? calculateCanadaPayroll(grossPay, regionCode, payFrequency)
    : calculateUSAPayroll(grossPay, regionCode, payFrequency)
}

export function formatPayrollResult(result: PayrollResult, lang: 'fr' | 'en' = 'fr'): {
  label: string
  amount: number
  type: 'gross' | 'deduction' | 'employer' | 'net' | 'total'
  isEmployer?: boolean
}[] {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const rows = []
  const d = result.deductions
  const e = result.employerCost

  rows.push({ label: t('Salaire brut', 'Gross Pay'), amount: result.grossPay, type: 'gross' as const })

  if (result.country === 'CA') {
    if (d.cpp) rows.push({ label: t('RPC (employé)', 'CPP (employee)'), amount: -d.cpp, type: 'deduction' as const })
    if (d.cpp2) rows.push({ label: t('RPC2 (employé)', 'CPP2 (employee)'), amount: -d.cpp2, type: 'deduction' as const })
    if (d.ei) rows.push({ label: t('AE (employé)', 'EI (employee)'), amount: -d.ei, type: 'deduction' as const })
    if (d.federalTax) rows.push({ label: t('Impôt fédéral', 'Federal Tax'), amount: -d.federalTax, type: 'deduction' as const })
    if (d.provincialTax) rows.push({ label: t('Impôt provincial', 'Provincial Tax'), amount: -d.provincialTax, type: 'deduction' as const })
    rows.push({ label: t('💵 NET À PAYER', '💵 NET PAY'), amount: result.netPay, type: 'net' as const })
    rows.push({ label: '─────', amount: 0, type: 'total' as const })
    if (e.cpp) rows.push({ label: t('RPC (employeur)', 'CPP (employer)'), amount: e.cpp, type: 'employer' as const, isEmployer: true })
    if (e.cpp2) rows.push({ label: t('RPC2 (employeur)', 'CPP2 (employer)'), amount: e.cpp2, type: 'employer' as const, isEmployer: true })
    if (e.ei) rows.push({ label: t('AE (employeur)', 'EI (employer)'), amount: e.ei, type: 'employer' as const, isEmployer: true })
  } else {
    if (d.socialSecurity) rows.push({ label: 'Social Security (EE)', amount: -d.socialSecurity, type: 'deduction' as const })
    if (d.medicare) rows.push({ label: 'Medicare (EE)', amount: -d.medicare, type: 'deduction' as const })
    if (d.federalIncomeTax) rows.push({ label: t('Impôt fédéral', 'Federal Income Tax'), amount: -d.federalIncomeTax, type: 'deduction' as const })
    if (d.stateTax) rows.push({ label: t('Impôt etat', 'State Tax'), amount: -d.stateTax, type: 'deduction' as const })
    rows.push({ label: t('💵 NET À PAYER', '💵 NET PAY'), amount: result.netPay, type: 'net' as const })
    rows.push({ label: '─────', amount: 0, type: 'total' as const })
    if (e.socialSecurity) rows.push({ label: 'Social Security (ER)', amount: e.socialSecurity, type: 'employer' as const, isEmployer: true })
    if (e.medicare) rows.push({ label: 'Medicare (ER)', amount: e.medicare, type: 'employer' as const, isEmployer: true })
    if (e.futa) rows.push({ label: 'FUTA (ER)', amount: e.futa, type: 'employer' as const, isEmployer: true })
  }

  rows.push({ label: t('🏷️ Coût total employeur', '🏷️ Total Employer Cost'), amount: result.totalEmployerCost, type: 'total' as const })
  return rows
}
