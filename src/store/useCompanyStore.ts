import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CompanyInfo {
  name: string
  ownerName: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  rbq: string
  neq: string
  tps: string
  tvq: string
  gst: string
  pst: string
  hst: string
  liabilityInsurer: string
  liabilityPolicyNumber: string
  liabilityAmount: string
  liabilityExpiry: string
  workerCompInsurer: string
  workerCompNumber: string
  workerCompExpiry: string
  errorOmissionInsurer: string
  errorOmissionNumber: string
  errorOmissionExpiry: string
  paymentMethods: string
  bankName: string
  bankTransitNumber: string
  interacEmail: string
  legalNotes: string
  warrantyText: string
}

interface CompanyStore {
  company: CompanyInfo
  updateCompany: (updates: Partial<CompanyInfo>) => void
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: '',
  phone: '514-555-0000',
  email: 'info@hailite.com',
  website: '',
  address: '123 Rue Principale',
  city: 'Montréal',
  province: 'QC',
  postalCode: 'H1A 1A1',
  country: 'Canada',
  rbq: 'RBQ-123456',
  neq: '',
  tps: '',
  tvq: '',
  gst: '',
  pst: '',
  hst: '',
  liabilityInsurer: '',
  liabilityPolicyNumber: '',
  liabilityAmount: '',
  liabilityExpiry: '',
  workerCompInsurer: '',
  workerCompNumber: '',
  workerCompExpiry: '',
  errorOmissionInsurer: '',
  errorOmissionNumber: '',
  errorOmissionExpiry: '',
  paymentMethods: 'Chèque, Virement Interac, Comptant',
  bankName: '',
  bankTransitNumber: '',
  interacEmail: '',
  legalNotes: '',
  warrantyText: "Tous les travaux sont garantis pour une période de 1 an contre les défauts de main-d'oeuvre.",
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,
      updateCompany: (updates: Partial<CompanyInfo>) => set((state: CompanyStore) => ({
        company: { ...state.company, ...updates } as CompanyInfo
      })),
    }),
    { name: 'company-store-v1' }
  )
)

