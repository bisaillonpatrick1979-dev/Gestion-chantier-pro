// src/store/useCompanyStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CompanyInfo {
  name: string
  ownerName: string
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
  logoUrl: string
  // Paiement
  bankName: string
  bankTransit: string
  bankInstitution: string
  bankAccount: string
  etransferEmail: string
  // Notes / conditions par défaut
  defaultNotes: string
  defaultPaymentTerms: string
  defaultDuedays: number
  // ── Paramètres paie salariés ─────────────────────────────────────────────
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
  // ── Géofencing ────────────────────────────────────────────────────────────
  geofencingEnabled: boolean        // Activer/désactiver le géofencing
  geofencingRadius: number          // Distance max en mètres (défaut 50)
  jobsiteLatLng: string             // "lat,lng" du chantier actif — ex: "51.0447,-114.0719"
}

interface CompanyStore {
  company: CompanyInfo
  setCompany: (info: Partial<CompanyInfo>) => void
  resetCompany: () => void
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: 'Patrick Bisaillon',
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
  logoUrl: '',
  bankName: '',
  bankTransit: '',
  bankInstitution: '',
  bankAccount: '',
  etransferEmail: '',
  defaultNotes: '',
  defaultPaymentTerms: 'Net 30',
  defaultDuedays: 30,
  // Payroll defaults
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
  // Géofencing defaults
  geofencingEnabled: false,
  geofencingRadius: 50,
  jobsiteLatLng: '',
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,
      setCompany: (info) =>
        set((state) => ({ company: { ...state.company, ...info } })),
      resetCompany: () => set({ company: defaultCompany }),
    }),
    { name: 'company-store-v1' }
  )
)
