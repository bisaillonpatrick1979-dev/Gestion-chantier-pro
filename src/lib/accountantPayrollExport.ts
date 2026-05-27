import type { DayDetail, Employee } from '@/types/employee'
import type { CompanyInfo } from '@/store/useCompanyStore'

const RULE_VERSION = '2026.01'

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function money(value: number) {
  return value.toFixed(2)
}

function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getDateRange(periodType: 'weekly' | 'biweekly' | 'custom') {
  const today = new Date()
  const end = new Date(today)
  const start = new Date(today)
  start.setDate(today.getDate() - (periodType === 'biweekly' ? 13 : 6))
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

function detailsForEmployee(employeeId: string, dayDetails: Record<string, DayDetail>, start: string, end: string) {
  return Object.values(dayDetails)
    .filter(detail => detail.employeeId === employeeId && detail.date >= start && detail.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date))
}

function employeeTotals(employee: Employee, details: DayDetail[]) {
  const hours = details.reduce((sum, detail) => sum + detail.totalHours, 0)
  const amount = details.reduce((sum, detail) => sum + detail.totalRevenue, 0)
  const breakSeconds = details.reduce((sum, detail) => sum + detail.totalBreak, 0)
  return {
    hours,
    amount,
    breakHours: breakSeconds / 3600,
    type: employee.workerType === 'salaried' ? 'salaried' : 'contractor',
  }
}

export function exportGroupedPayrollForAccountant(params: {
  company: CompanyInfo
  employees: Employee[]
  dayDetails: Record<string, DayDetail>
  periodType: 'weekly' | 'biweekly' | 'custom'
  lang: 'fr' | 'en'
}) {
  const { company, employees, dayDetails, periodType, lang } = params
  const { start, end } = getDateRange(periodType)
  const activeEmployees = employees.filter(emp => emp.id !== 'admin' && emp.active !== false)

  const title = lang === 'fr' ? 'Dossier de paie pour comptable' : 'Payroll package for accountant'
  const periodLabel = periodType === 'weekly' ? (lang === 'fr' ? 'Hebdomadaire' : 'Weekly') : periodType === 'biweekly' ? (lang === 'fr' ? 'Aux deux semaines' : 'Biweekly') : (lang === 'fr' ? 'Personnalisée' : 'Custom')

  const rows: string[][] = []
  rows.push([title])
  rows.push(['Company', company.name || ''])
  rows.push(['Period type', periodLabel])
  rows.push(['Period start', start])
  rows.push(['Period end', end])
  rows.push(['Payroll rules version', RULE_VERSION])
  rows.push(['Generated at', new Date().toISOString()])
  rows.push([])
  rows.push(['SUMMARY'])
  rows.push(['Worker category', 'Count', 'Total hours', 'Total amount CAD'])

  const salaried = activeEmployees.filter(emp => emp.workerType === 'salaried')
  const contractors = activeEmployees.filter(emp => emp.workerType !== 'salaried')

  const salariedTotals = salaried.map(emp => employeeTotals(emp, detailsForEmployee(emp.id, dayDetails, start, end)))
  const contractorTotals = contractors.map(emp => employeeTotals(emp, detailsForEmployee(emp.id, dayDetails, start, end)))

  rows.push(['Salaried employees', String(salaried.length), money(salariedTotals.reduce((s, item) => s + item.hours, 0)), money(salariedTotals.reduce((s, item) => s + item.amount, 0))])
  rows.push(['Contractors / subcontractors', String(contractors.length), money(contractorTotals.reduce((s, item) => s + item.hours, 0)), money(contractorTotals.reduce((s, item) => s + item.amount, 0))])
  rows.push([])
  rows.push(['SALARIED EMPLOYEES - SEPARATED'])
  rows.push(['Employee', 'Province', 'Pay frequency', 'Hours', 'Break hours', 'Gross / amount CAD', 'Rules version', 'Validation note'])
  salaried.forEach(emp => {
    const totals = employeeTotals(emp, detailsForEmployee(emp.id, dayDetails, start, end))
    rows.push([emp.name, emp.employeeProvince || company.province || '', emp.payFrequency || '', money(totals.hours), money(totals.breakHours), money(totals.amount), RULE_VERSION, 'Validate deductions, taxes, remittances, vacation pay and net pay before official payment.'])
  })
  rows.push([])
  rows.push(['CONTRACTORS / SUBCONTRACTORS - SEPARATED'])
  rows.push(['Worker', 'Business name', 'GST number', 'Work mode', 'Hours', 'Break hours', 'Amount CAD', 'Rules version', 'Validation note'])
  contractors.forEach(emp => {
    const totals = employeeTotals(emp, detailsForEmployee(emp.id, dayDetails, start, end))
    rows.push([emp.name, emp.businessName || '', emp.gstNumber || '', emp.workMode, money(totals.hours), money(totals.breakHours), money(totals.amount), RULE_VERSION, 'Validate contractor status, invoice requirements, GST and payment before official payment.'])
  })
  rows.push([])
  rows.push(['IMPORTANT NOTE'])
  rows.push(['This file is prepared by the app for review. The business or accounting professional must validate payroll deductions, taxes, remittances and legal obligations before official payment.'])

  const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n')
  const safeCompany = (company.name || 'company').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  downloadTextFile(`payroll-accountant-package-${safeCompany}-${start}-to-${end}.csv`, csv)

  return { start, end, employeeCount: activeEmployees.length }
}
