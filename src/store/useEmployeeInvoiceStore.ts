'use client'
// src/store/useEmployeeInvoiceStore.ts
// Store pour les factures de travailleur autonome (employés qui facturent Hailite Xteriors)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EmployeeInvoiceStatus = 'brouillon' | 'envoyee' | 'payee'

export interface EmployeeInvoiceDay {
  date: string
  hours: number
  revenue: number
  sessions: number
}

export interface EmployeeInvoice {
  id: string
  number: string              // ex: PAT-2026-0001
  employeeId: string
  employeeName: string
  employeeInitials: string    // ex: PB
  employeeColor: string       // couleur du profil
  // Infos facturation employé (travailleur autonome)
  employeeAddress: string
  employeeCity: string
  employeePhone: string
  employeeEmail: string
  employeeGSTNumber: string   // numéro TPS si enregistré
  // Période
  periodStart: string         // lundi de la semaine
  periodEnd: string           // dimanche de la semaine
  // Détail des jours travaillés
  days: EmployeeInvoiceDay[]
  totalHours: number
  hourlyRate: number
  // Calculs financiers
  subtotal: number
  remisePercent: number
  remiseAmount: number
  gstEnabled: boolean
  gstRate: number             // 5% Alberta par défaut
  gstAmount: number
  total: number
  // Compagnie destinataire (Hailite Xteriors)
  companyName: string
  companyAddress: string
  companyCity: string
  companyGST: string
  // Méta
  status: EmployeeInvoiceStatus
  createdAt: string
  sentAt?: string
  paidAt?: string
  notes: string
}

interface EmployeeInvoiceStore {
  invoices: EmployeeInvoice[]
  addInvoice: (data: Omit<EmployeeInvoice, 'id' | 'createdAt'>) => EmployeeInvoice
  updateInvoice: (id: string, updates: Partial<EmployeeInvoice>) => void
  deleteInvoice: (id: string) => void
  updateStatus: (id: string, status: EmployeeInvoiceStatus) => void
  getByEmployee: (employeeId: string) => EmployeeInvoice[]
  getByWeek: (employeeId: string, weekStart: string) => EmployeeInvoice | undefined
  getTotalByStatus: (status: EmployeeInvoiceStatus) => number
}

export const useEmployeeInvoiceStore = create<EmployeeInvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (data) => {
        const newInvoice: EmployeeInvoice = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ invoices: [...state.invoices, newInvoice] }))
        return newInvoice
      },

      updateInvoice: (id, updates) => set(state => ({
        invoices: state.invoices.map(inv =>
          inv.id === id ? { ...inv, ...updates } : inv
        )
      })),

      deleteInvoice: (id) => set(state => ({
        invoices: state.invoices.filter(inv => inv.id !== id)
      })),

      updateStatus: (id, status) => {
        const now = new Date().toISOString()
        const extras: Partial<EmployeeInvoice> = { status }
        if (status === 'envoyee') extras.sentAt = now
        if (status === 'payee')  extras.paidAt  = now
        set(state => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, ...extras } : inv
          )
        }))
      },

      getByEmployee: (employeeId) =>
        get().invoices
          .filter(inv => inv.employeeId === employeeId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      getByWeek: (employeeId, weekStart) =>
        get().invoices.find(inv =>
          inv.employeeId === employeeId && inv.periodStart === weekStart
        ),

      getTotalByStatus: (status) =>
        get().invoices
          .filter(inv => inv.status === status)
          .reduce((sum, inv) => sum + inv.total, 0),
    }),
    { name: 'employee-invoice-store-v1' }
  )
)

