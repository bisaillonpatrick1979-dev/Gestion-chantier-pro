'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Employee, EmployeeSession, DayDetail, MaterialEntry } from '@/types/employee'
import {
  syncEmployeesToSupabase,
  fetchEmployeesFromSupabase,
  syncDayDetailToSupabase,
  fetchDayDetailsFromSupabase,
} from '@/lib/sync'

interface EmployeeStore {
  employees: Employee[]
  currentEmployeeId: string | null
  activeSessions: Record<string, EmployeeSession>
  dayDetails: Record<string, DayDetail>
  isSyncing: boolean
  lastSync: string | null
  addEmployee: (data: Omit<Employee, 'id' | 'createdAt' | 'invoiceSequence'>) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  verifyPin: (employeeId: string, pin: string) => boolean
  setCurrentEmployee: (id: string | null) => void
  punchIn: (employeeId: string) => void
  punchOut: (employeeId: string, materials?: MaterialEntry[]) => void
  startBreak: (employeeId: string) => void
  endBreak: (employeeId: string) => void
  tick: () => void
  getDayDetail: (employeeId: string, date: string) => DayDetail | null
  getNextInvoiceNumber: (employeeId: string) => string
  incrementInvoiceSequence: (employeeId: string) => void
  syncToCloud: () => Promise<void>
  fetchFromCloud: () => Promise<void>
}

const COLORS = ['#ea580c','#f59e0b','#22c55e','#06b6d4','#a855f7','#ec4899','#3b82f6']

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [{
        id: 'admin',
        name: 'Admin',
        role: 'admin',
        pin: '0000',
        workMode: 'heure',
        hourlyRate: 45,
        color: '#ea580c',
        active: true,
        createdAt: new Date().toISOString(),
        invoiceSequence: 0,
      }],
      currentEmployeeId: null,
      activeSessions: {},
      dayDetails: {},
      isSyncing: false,
      lastSync: null,

      addEmployee: (data) => {
        const { employees } = get()
        const newEmp: Employee = {
          ...data,
          active: true,
          id: Date.now().toString(),
          color: COLORS[employees.length % COLORS.length],
          createdAt: new Date().toISOString(),
          invoiceSequence: 0,
        }
        set({ employees: [...employees, newEmp] })
        // Sync immédiat
        syncEmployeesToSupabase([...employees, newEmp])
      },

      updateEmployee: (id, updates) => {
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
        }))
        syncEmployeesToSupabase(get().employees)
      },

      deleteEmployee: (id) => {
        set(state => ({
          employees: state.employees.filter(e => e.id !== id)
        }))
        syncEmployeesToSupabase(get().employees)
      },

      verifyPin: (employeeId, pin) => {
        const emp = get().employees.find(e => e.id === employeeId)
        return emp?.pin === pin
      },

      setCurrentEmployee: (id) => set({ currentEmployeeId: id }),

      punchIn: (employeeId) => {
        const { activeSessions, employees } = get()
        const emp = employees.find(e => e.id === employeeId)
        if (!emp) return
        set({
          activeSessions: {
            ...activeSessions,
            [employeeId]: {
              id: Date.now().toString(),
              employeeId,
              startTime: new Date().toISOString(),
              endTime: null,
              elapsed: 0,
              breakElapsed: 0,
              revenue: 0,
              workMode: emp.workMode,
              isOnBreak: false,
            }
          }
        })
      },

      punchOut: (employeeId, materials) => {
        const { activeSessions, dayDetails, employees } = get()
        const session = activeSessions[employeeId]
        const emp = employees.find(e => e.id === employeeId)
        if (!session || !emp) return

        const now = new Date()
        const dateKey = now.toISOString().split('T')[0]
        const detailKey = `${employeeId}-${dateKey}`

        let finalRevenue = 0
        if (emp.workMode === 'heure') {
          finalRevenue = (session.elapsed / 3600) * emp.hourlyRate
        } else if (emp.workMode === 'surface' && materials) {
          finalRevenue = materials.reduce((sum, m) => sum + m.total, 0)
        }

        const completed: EmployeeSession = {
          ...session,
          endTime: now.toISOString(),
          revenue: finalRevenue,
          materials,
        }

        const existing = dayDetails[detailKey]
        const updated: DayDetail = {
          date: dateKey,
          employeeId,
          sessions: [...(existing?.sessions || []), completed],
          totalHours: (existing?.totalHours || 0) + session.elapsed / 3600,
          totalRevenue: (existing?.totalRevenue || 0) + finalRevenue,
          totalBreak: (existing?.totalBreak || 0) + session.breakElapsed,
          materials: [...(existing?.materials || []), ...(materials || [])],
          notes: existing?.notes || '',
        }

        const newSessions = { ...activeSessions }
        delete newSessions[employeeId]

        set({
          activeSessions: newSessions,
          dayDetails: { ...dayDetails, [detailKey]: updated }
        })

        // Sync day detail immédiat
        syncDayDetailToSupabase(detailKey, updated)
      },

      startBreak: (employeeId) => {
        const { activeSessions } = get()
        if (!activeSessions[employeeId]) return
        set({
          activeSessions: {
            ...activeSessions,
            [employeeId]: { ...activeSessions[employeeId], isOnBreak: true }
          }
        })
      },

      endBreak: (employeeId) => {
        const { activeSessions } = get()
        if (!activeSessions[employeeId]) return
        set({
          activeSessions: {
            ...activeSessions,
            [employeeId]: { ...activeSessions[employeeId], isOnBreak: false }
          }
        })
      },

      tick: () => {
        const { activeSessions, employees } = get()
        if (Object.keys(activeSessions).length === 0) return
        const updated = { ...activeSessions }
        let cha
