'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  syncCompanyToSupabase,
  fetchCompanyFromSupabase,
} from '@/lib/sync'

export interface CompanyInfo {
  name: string
  ownerName: string
  logoUrl: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  email: string
  website: string
  gstNumber: string
  wcbNumber: string
  bnNumber: string
  etransferEmail: string
  bankName: string
  bankTransit: string
  bankInstitution: string
  bankAccount: string
  defaultPaymentTerms: string
  defaultNotes: string
  geofencingEnabled: boolean
  geofencingRadius: number
  jobsiteLatLng: string
  payrollVacationRate: number
  payrollHealthInsurance: number
  payrollDentalInsurance: number
  payrollLifeInsurance: number
  payrollLTD: number
  payrollRRSP: number
  payrollEAP: number
  payrollCustom1Name: string
  payrollCustom1Amount: number
  payrollCustom2Name: string
  payrollCustom2Amount: number
}

interface CompanyStore {
  company: CompanyInfo
  isSyncing: boolean
  lastSync: string | null
  setCompany: (updates: Partial<CompanyInfo>) => void
  resetCompany: () => void
  syncToCloud: () => Promise<void>
  fetchFromCloud: () => Promise<void>
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: '',
  logoUrl: '',
  address: '',
  city: '',
  province: 'AB',
  postalCode: '',
  country: 'CA',
  phone: '',
  email: '',
  website: '',
  gstNumber: '',
  wcbNumber: '',
  bnNumber: '',
  etransferEmail: '',
  bankName: '',
  bankTransit: '',
  bankInstitution: '',
  bankAccount: '',
  defaultPaymentTerms: 'Net 30',
  defaultNotes: '',
  geofencingEnabled: false,
  geofencingRadius: 100,
  jobsiteLatLng: '',
  payrollVacationRate: 6,
  payrollHealthInsurance: 0,
  payrollDentalInsurance: 0,
  payrollLifeInsurance: 0,
  payrollLTD: 0,
  payrollRRSP: 0,
  payrollEAP: 0,
  payrollCustom1Name: '',
  payrollCustom1Amount: 0,
  payrollCustom2Name: '',
  payrollCustom2Amount: 0,
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      company: defaultCompany,
      isSyncing: false,
      lastSync: null,

      setCompany: (updates) => {
        const newCompany = { ...get().company, ...updates }
        set({ company: newCompany })
        syncCompanyToSupabase(newCompany)
      },

      resetCompany: () => {
        set({ company: defaultCompany })
        syncCompanyToSupabase(defaultCompany)
      },

      syncToCloud: async () => {
        set({ isSyncing: true })
        try {
          await syncCompanyToSupabase(get().company)
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('syncToCloud company error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },

      fetchFromCloud: async () => {
        set({ isSyncing: true })
        try {
          const remote = await fetchCompanyFromSupabase()
          if (remote) {
            set({ company: { ...defaultCompany, ...remote } })
          }
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('fetchFromCloud company error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    { name: 'company-store-v1' }
  )
)
