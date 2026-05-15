// src/store/useCompanyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logo: string; // base64 ou URL
  gstNumber: string;
  wcbNumber: string;
  licenseNumber: string;
  // Taxes Alberta
  gstRate: number; // 5% par défaut
  // Paiement
  bankInfo: string;
  paymentTerms: string; // ex: "Net 30"
  // Notes par défaut sur documents
  defaultNotes: string;
  defaultTerms: string;
}

export interface CompanyStore {
  company: CompanyInfo;
  updateCompany: (data: Partial<CompanyInfo>) => void;
  resetCompany: () => void;
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  address: '',
  city: '',
  province: 'AB',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  logo: '',
  gstNumber: '',
  wcbNumber: '',
  licenseNumber: '',
  gstRate: 5,
  bankInfo: '',
  paymentTerms: 'Net 30',
  defaultNotes: '',
  defaultTerms: 'Paiement dû dans les 30 jours suivant la réception de la facture.',
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,

      updateCompany: (data: Partial<CompanyInfo>) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      resetCompany: () =>
        set({ company: defaultCompany }),
    }),
    {
      name: 'company-store-v1',
    }
  )
);
