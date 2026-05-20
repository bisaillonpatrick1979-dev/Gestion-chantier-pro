'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  syncPayrollToSupabase,
  fetchPayrollFromSupabase,
} from '@/lib/sync'

export type PaymentMethod = 'etransfer' | 'cheque' | 'cash' | 'direct_deposit'
export type PayrollStatus = 'pending' | 'paid' | 'void'

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  weekStart: string
  weekEnd: string
  hoursWorked: number
  grossPay: number
  cpp: number
  ei: number
  fedTax: number
  abTax: number
  totalDeductions: number
  netPay: number
  paymentMethod: PaymentMethod
  paymentDate: string
  paymentRef: string
  status: PayrollStatus
  notes: string
  createdAt: string
  updatedAt: string
}

interface PayrollStore {
  records: PayrollRecord[]
  isSyncing: boolean
  lastSync: string | null
  addRecord: (data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => PayrollRecord
  updateRecord: (id: string, updates: Partial<PayrollRecord>) => void
  deleteRecord: (id: string) => void
  getByEmployee: (employeeId: string) => PayrollRecord[]
  getByPeriod: (weekStart: string, weekEnd: string) => PayrollRecord[]
  getPendingByEmployee: (employeeId: string) => PayrollRecord[]
  getTotalPaidByEmployee: (employeeId: string) => number
  getTotalPaidByYear: (year: number) => Record<string, number>
  syncToCloud: () => Promise<void>
  fetchFromCloud: () => Promise<void>
}

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6)

export const usePayrollStore = create<PayrollStore>()(
  persist(
    (set, get) => ({
      records: [],
      isSyncing: false,
      lastSync: null,

      addRecord: (data) => {
        const now = new Date().toISOString()
        const newRecord: PayrollRecord = { ...data, id: uid(), createdAt: now, updatedAt: now }
        const newRecords = [...get().records, newRecord]
        set({ records: newRecords })
        syncPayrollToSupabase(newRecords)
        return newRecord
      },

      updateRecord: (id, updates) => {
        const newRecords = get().records.map(r =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        )
        set({ records: newRecords })
        syncPayrollToSupabase(newRecords)
      },

      deleteRecord: (id) => {
        const newRecords = get().records.filter(r => r.id !== id)
        set({ records: newRecords })
        syncPayrollToSupabase(newRecords)
      },

      getByEmployee: (employeeId) =>
        get().records
          .filter(r => r.employeeId === employeeId)
          .sort((a, b) => b.weekStart.localeCompare(a.weekStart)),

      getByPeriod: (weekStart, weekEnd) =>
        get().records.filter(r => r.weekStart === weekStart && r.weekEnd === weekEnd),

      getPendingByEmployee: (employeeId) =>
        get().records.filter(r => r.employeeId === employeeId && r.status === 'pending'),

      getTotalPaidByEmployee: (employeeId) =>
        get().records
          .filter(r => r.employeeId === employeeId && r.status === 'paid')
          .reduce((sum, r) => sum + r.netPay, 0),

      getTotalPaidByYear: (year) => {
        const result: Record<string, number> = {}
        get().records
          .filter(r => r.status === 'paid' && r.weekStart.startsWith(String(year)))
          .forEach(r => { result[r.employeeId] = (result[r.employeeId] || 0) + r.netPay })
        return result
      },

      syncToCloud: async () => {
        set({ isSyncing: true })
        try {
          await syncPayrollToSupabase(get().records)
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('syncToCloud payroll error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },

      fetchFromCloud: async () => {
        set({ isSyncing: true })
        try {
          const remote = await fetchPayrollFromSupabase()
          if (remote && remote.length > 0) set({ records: remote })
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('fetchFromCloud payroll error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    { name: 'payroll-store-v1' }
  )
)
