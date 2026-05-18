export type EmployeeRole         = 'admin' | 'employee'
export type EmployeeWorkMode     = 'heure' | 'forfait' | 'surface'
export type EmployeeWorkerType   = 'contractor' | 'salaried'
export type EmployeeCountry      = 'CA' | 'US'
export type EmployeePayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type EmployeePayPeriodStart = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  pin: string
  workMode: EmployeeWorkMode
  hourlyRate: number
  color: string
  active: boolean
  createdAt: string
  invoiceSequence: number
  // Type de travailleur et paie
  workerType?: EmployeeWorkerType
  employeeCountry?: EmployeeCountry
  employeeProvince?: string
  payFrequency?: EmployeePayFrequency
  payPeriodStart?: EmployeePayPeriodStart  // Jour de début de la semaine de paie
  annualSalary?: number                    // Salaire annuel (si salarié)
}

export interface EmployeeSession {
  id: string
  employeeId: string
  startTime: string
  endTime: string | null
  elapsed: number
  breakElapsed: number
  revenue: number
  workMode: EmployeeWorkMode
  materials?: MaterialEntry[]
  isOnBreak: boolean
}

export interface MaterialEntry {
  id: string
  material: string
  squareFeet: number
  pricePerSqFt: number
  total: number
}

export interface DayDetail {
  date: string
  employeeId: string
  sessions: EmployeeSession[]
  totalHours: number
  totalRevenue: number
  totalBreak: number
  materials?: MaterialEntry[]
  notes: string
}
