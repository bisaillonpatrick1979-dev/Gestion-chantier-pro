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
  payrollVacationRate: number       // % vacances (6 = min construction AB)
  payrollHealthInsurance: number    // Assurance santé $/période
  payrollDentalInsurance: number    // Assurance dentaire $/période
  payrollLifeInsurance: number      // Assurance vie $/période
  payrollLTD: number                // Invalidité longue durée $/période
  payrollRRSP: number               // REER collectif % du brut
  payrollEAP: number                // PAE $/période
  payrollCustom1Name: string        // Déduction personnalisée 1 — nom
  payrollCustom1Amount: number      // Déduction personnalisée 1 — montant
  payrollCustom2Name: string        // Déduction personnalisée 2 — nom
  payrollCustom2Amount: number      // Déduction personnalisée 2 — montant
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
