'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaymentMethod = 'etransfer' | 'cheque' | 'cash' | 'direct_deposit'
export type PayrollStatus = 'pending' | 'paid' | 'void'

export interface PayrollRecord {
  id: string
  // Employé
  employeeId: string
  employeeName: string
  // Période
  weekStart: string        // ISO date "2026-05-12"
  weekEnd: string          // ISO date "2026-05-18"
  // Heures
  hoursWorked: number
  // Montants bruts → déductions → net
  grossPay: number
  cpp: number              // RPC / CPP
  ei: number               // AE / EI
  fedTax: number           // Impôt fédéral
  abTax: number            // Impôt provincial AB
  totalDeductions: number
  netPay: number
  // Paiement
  paymentMethod: PaymentMethod
  paymentDate: string      // ISO date
  paymentRef: string       // # chèque, confirmation e-transfer, etc.
  status: PayrollStatus
  // Méta
  notes: string
  createdAt: string
  updatedAt: string
}

interface PayrollStore {
  records: PayrollRecord[]
  addRecord: (data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => PayrollRecord
  updateRecord: (id: string, updates: Partial<PayrollRecord>) => void
  deleteRecord: (id: string) => void
  // Helpers
  getByEmployee: (employeeId: string) => PayrollRecord[]
  getByPeriod: (weekStart: string, weekEnd: string) => PayrollRecord[]
  getPendingByEmployee: (employeeId: string) => PayrollRecord[]
  getTotalPaidByEmployee: (employeeId: string) => number
  getTotalPaidByYear: (year: number) => Record<string, number> // employeeId → total
}

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6)

export const usePayrollStore = create<PayrollStore>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (data) => {
        const now = new Date().toISOString()
        const newRecord: PayrollRecord = {
          ...data,
          id: uid(),
          createdAt: now,
          updatedAt: now,
        }
        set(state => ({ records: [...state.records, newRecord] }))
        return newRecord
      },

      updateRecord: (id, updates) => set(state => ({
        records: state.records.map(r =>
          r.id === id
            ? { ...r, ...updates, updatedAt: new Date().toISOString() }
            : r
        ),
      })),

      deleteRecord: (id) => set(state => ({
        records: state.records.filter(r => r.id !== id),
      })),

      getByEmployee: (employeeId) =>
        get().records
          .filter(r => r.employeeId === employeeId)
          .sort((a, b) => b.weekStart.localeCompare(a.weekStart)),

      getByPeriod: (weekStart, weekEnd) =>
        get().records.filter(
          r => r.weekStart === weekStart && r.weekEnd === weekEnd
        ),

      getPendingByEmployee: (employeeId) =>
        get().records.filter(
          r => r.employeeId === employeeId && r.status === 'pending'
        ),

      getTotalPaidByEmployee: (employeeId) =>
        get().records
          .filter(r => r.employeeId === employeeId && r.status === 'paid')
          .reduce((sum, r) => sum + r.netPay, 0),

      getTotalPaidByYear: (year) => {
        const result: Record<string, number> = {}
        get().records
          .filter(r => r.status === 'paid' && r.weekStart.startsWith(String(year)))
          .forEach(r => {
            result[r.employeeId] = (result[r.employeeId] || 0) + r.netPay
          })
        return result
      },
    }),
    { name: 'payroll-store-v1' }
  )
)

