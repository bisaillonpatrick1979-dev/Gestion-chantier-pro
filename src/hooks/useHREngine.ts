// src/hooks/useHREngine.ts
// Moteur de calcul RH — ancienneté, paliers vacances, conformité, alertes

import { useEffect, useMemo } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { usePayrollRulesStore } from '@/store/usePayrollRulesStore'
import type { Employee } from '@/types/employee'
import type { HRAlert, VacationTier } from '@/store/usePayrollRulesStore'

// ─────────────────────────────────────────────────────────────────────────────
// 📐 TYPES RETOURNÉS
// ─────────────────────────────────────────────────────────────────────────────

export interface Seniority {
  years: number
  months: number
  totalMonths: number
  label: string        // Ex: "2 ans 3 mois"
  labelEN: string      // Ex: "2 years 3 months"
}

export interface VacationInfo {
  currentTier: VacationTier | null
  nextTier: VacationTier | null
  effectiveRate: number          // Taux réel appliqué (override ou palier)
  isOverridden: boolean          // Admin a forcé un taux custom
  monthsUntilNextTier: number    // Mois restants avant prochain palier
  isCompliant: boolean           // Respecte le minimum légal
  legalMinimum: number           // Minimum légal pour la province
}

export interface ComplianceCheck {
  isCompliant: boolean
  violations: string[]
  warnings: string[]
}

export interface HREmployeeStatus {
  employee: Employee
  seniority: Seniority
  vacation: VacationInfo
  compliance: ComplianceCheck
  pendingAlerts: HRAlert[]
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧮 FONCTIONS UTILITAIRES PURES (sans hooks — utilisables partout)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule l'ancienneté à partir d'une date d'embauche
 */
export function calculateSeniority(hireDate: string): Seniority {
  const hire = new Date(hireDate)
  const now = new Date()

  let years = now.getFullYear() - hire.getFullYear()
  let months = now.getMonth() - hire.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  // Ajustement si le jour du mois courant < jour d'embauche
  if (now.getDate() < hire.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  const totalMonths = years * 12 + months

  const label = years > 0
    ? `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`.trim()
    : months > 0
    ? `${months} mois`
    : 'Moins d\'1 mois'

  const labelEN = years > 0
    ? `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`.trim()
    : months > 0
    ? `${months} month${months > 1 ? 's' : ''}`
    : 'Less than 1 month'

  return { years, months, totalMonths, label, labelEN }
}

/**
 * Trouve le palier vacances selon l'ancienneté
 */
export function getVacationTier(
  seniority: Seniority,
  tiers: VacationTier[]
): { current: VacationTier | null; next: VacationTier | null; monthsUntilNext: number } {
  const sorted = [...tiers].sort((a, b) => a.minYears - b.minYears)

  const current = sorted.findLast(t => seniority.years >= t.minYears) ?? null
  const next = sorted.find(t => t.minYears > seniority.years) ?? null

  let monthsUntilNext = 0
  if (next) {
    const monthsRequired = next.minYears * 12
    monthsUntilNext = Math.max(0, monthsRequired - seniority.totalMonths)
  }

  return { current, next, monthsUntilNext }
}

/**
 * Calcule le taux effectif (override admin ou palier automatique)
 */
export function getEffectiveVacationRate(
  employee: Employee,
  tiers: VacationTier[],
  seniority: Seniority,
  legalMinimum: number,
  enforceMinimums: boolean
): number {
  // 1. Override admin en priorité
  if (employee.vacationRateOverride !== undefined && employee.vacationRateOverride > 0) {
    const rate = employee.vacationRateOverride
    if (enforceMinimums) return Math.max(rate, legalMinimum)
    return rate
  }

  // 2. Palier automatique
  const { current } = getVacationTier(seniority, tiers)
  const tierRate = current?.rate ?? legalMinimum

  // 3. Garde-fou légal
  if (enforceMinimums) return Math.max(tierRate, legalMinimum)
  return tierRate
}

/**
 * Vérifie la conformité légale d'un employé
 */
export function checkCompliance(
  employee: Employee,
  effectiveRate: number,
  legalMinimum: number
): ComplianceCheck {
  const violations: string[] = []
  const warnings: string[] = []

  if (effectiveRate < legalMinimum) {
    violations.push(
      `Taux vacances ${effectiveRate}% inférieur au minimum légal ${legalMinimum}% (${employee.employeeProvince || 'AB'})`
    )
  }

  if (!employee.hireDate) {
    warnings.push('Date d\'embauche manquante — ancienneté non calculable')
  }

  if (employee.workerType === 'salaried' && !employee.sin) {
    warnings.push('NAS manquant — requis pour T4 de fin d\'année')
  }

  if (employee.contractRenewalDate) {
    const renewal = new Date(employee.contractRenewalDate)
    const daysUntil = Math.ceil((renewal.getTime() - Date.now()) / 86400000)
    if (daysUntil <= 0) {
      violations.push(`Contrat expiré depuis ${Math.abs(daysUntil)} jour(s)`)
    } else if (daysUntil <= 60) {
      warnings.push(`Contrat à renouveler dans ${daysUntil} jour(s)`)
    }
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
  }
}

/**
 * Génère les alertes RH pour UN employé (sans effets de bord)
 */
export function generateAlertsForEmployee(
  employee: Employee,
  seniority: Seniority,
  vacation: VacationInfo,
  alertDaysBeforeAnniversary: number,
  alertDaysBeforeRenewal: number
): Omit<HRAlert, 'id' | 'triggeredAt' | 'acknowledged'>[] {
  const alerts: Omit<HRAlert, 'id' | 'triggeredAt' | 'acknowledged'>[] = []

  // 1. Alerte palier vacances imminent
  if (
    vacation.nextTier &&
    vacation.monthsUntilNextTier <= Math.ceil(alertDaysBeforeAnniversary / 30) &&
    vacation.monthsUntilNextTier > 0
  ) {
    alerts.push({
      type: 'vacation_tier_upgrade',
      severity: 'info',
      employeeId: employee.id,
      employeeName: employee.name,
      message: `Palier vacances → ${vacation.nextTier.rate}% dans ${vacation.monthsUntilNextTier} mois`,
      messageFR: `${employee.name} atteindra ${vacation.nextTier.minYears} ans d'ancienneté dans ${vacation.monthsUntilNextTier} mois — taux vacances passera à ${vacation.nextTier.rate}%`,
      messageEN: `${employee.name} reaches ${vacation.nextTier.minYears} year(s) seniority in ${vacation.monthsUntilNextTier} month(s) — vacation rate will increase to ${vacation.nextTier.rate}%`,
      dueDate: new Date(Date.now() + vacation.monthsUntilNextTier * 30 * 86400000).toISOString(),
    })
  }

  // 2. Alerte non-conformité
  if (!vacation.isCompliant) {
    alerts.push({
      type: 'legal_minimum_violation',
      severity: 'critical',
      employeeId: employee.id,
      employeeName: employee.name,
      message: `Taux vacances sous le minimum légal`,
      messageFR: `Taux actuel ${vacation.effectiveRate}% < minimum légal ${vacation.legalMinimum}% pour ${employee.employeeProvince || 'AB'}`,
      messageEN: `Current rate ${vacation.effectiveRate}% < legal minimum ${vacation.legalMinimum}% for ${employee.employeeProvince || 'AB'}`,
    })
  }

  // 3. Renouvellement contrat imminent
  if (employee.contractRenewalDate) {
    const daysUntil = Math.ceil(
      (new Date(employee.contractRenewalDate).getTime() - Date.now()) / 86400000
    )
    if (daysUntil > 0 && daysUntil <= alertDaysBeforeRenewal) {
      alerts.push({
        type: 'contract_renewal',
        severity: daysUntil <= 14 ? 'critical' : 'warning',
        employeeId: employee.id,
        employeeName: employee.name,
        message: `Contrat à renouveler dans ${daysUntil} jours`,
        messageFR: `Le contrat de ${employee.name} expire dans ${daysUntil} jour(s)`,
        messageEN: `${employee.name}'s contract expires in ${daysUntil} day(s)`,
        dueDate: employee.contractRenewalDate,
      })
    }
  }

  // 4. Anniversaire de service (années rondes)
  if (employee.hireDate && seniority.months === 0 && seniority.years > 0) {
    alerts.push({
      type: 'anniversary',
      severity: 'info',
      employeeId: employee.id,
      employeeName: employee.name,
      message: `🎉 ${seniority.years} an${seniority.years > 1 ? 's' : ''} de service`,
      messageFR: `${employee.name} célèbre ${seniority.years} an${seniority.years > 1 ? 's' : ''} de service aujourd'hui!`,
      messageEN: `${employee.name} celebrates ${seniority.years} year${seniority.years > 1 ? 's' : ''} of service today!`,
    })
  }

  return alerts
}

// ─────────────────────────────────────────────────────────────────────────────
// 🪝 HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function useHREngine() {
  const employees = useEmployeeStore(s => s.employees)
  const { rules, alerts, addAlert, getActiveAlerts, getCriticalAlerts } =
    usePayrollRulesStore()

  // Calcul complet pour tous les employés salariés avec date d'embauche
  const hrStatuses = useMemo((): HREmployeeStatus[] => {
    return employees
      .filter(e => e.active && e.hireDate && e.workerType === 'salaried')
      .map(employee => {
        const province = employee.employeeProvince || 'AB'
        const legalMinimum = rules.legalMinimums[province] ?? 6
        const seniority = calculateSeniority(employee.hireDate!)

        const { current, next, monthsUntilNext } = getVacationTier(
          seniority,
          rules.vacationTiers
        )

        const effectiveRate = getEffectiveVacationRate(
          employee,
          rules.vacationTiers,
          seniority,
          legalMinimum,
          rules.enforceMinimums
        )

        const vacation: VacationInfo = {
          currentTier: current,
          nextTier: next,
          effectiveRate,
          isOverridden: !!employee.vacationRateOverride,
          monthsUntilNextTier: monthsUntilNext,
          isCompliant: effectiveRate >= legalMinimum,
          legalMinimum,
        }

        const compliance = checkCompliance(employee, effectiveRate, legalMinimum)

        const pendingAlerts = getActiveAlerts().filter(
          a => a.employeeId === employee.id
        )

        return { employee, seniority, vacation, compliance, pendingAlerts }
      })
  }, [employees, rules, alerts])

  // Génère et pousse les alertes automatiquement
  useEffect(() => {
    hrStatuses.forEach(({ employee, seniority, vacation }) => {
      const newAlerts = generateAlertsForEmployee(
        employee,
        seniority,
        vacation,
        rules.alertDaysBeforeAnniversary,
        rules.alertDaysBeforeRenewal
      )
      newAlerts.forEach(alert => addAlert(alert))
    })
  }, [hrStatuses, rules.alertDaysBeforeAnniversary, rules.alertDaysBeforeRenewal])

  // Résumé global
  const summary = useMemo(() => ({
    totalSalaried: hrStatuses.length,
    compliant: hrStatuses.filter(s => s.compliance.isCompliant).length,
    nonCompliant: hrStatuses.filter(s => !s.compliance.isCompliant).length,
    activeAlerts: getActiveAlerts().length,
    criticalAlerts: getCriticalAlerts().length,
  }), [hrStatuses])

  return {
    hrStatuses,
    summary,
    activeAlerts: getActiveAlerts(),
    criticalAlerts: getCriticalAlerts(),
    // Fonctions utilitaires exposées
    calculateSeniority,
    getVacationTier: (seniority: Seniority) =>
      getVacationTier(seniority, rules.vacationTiers),
  }
                                                                                                   }
