// src/store/useCompanyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyInfo {
  name: string;
  ownerName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  gstNumber: string;
  wcbNumber: string;
  licenseNumber: string;
  // Invoice defaults
  defaultGstRate: number;      // Alberta = 5
  defaultDepositPercent: number;
  paymentTerms: string;
  invoiceNotes: string;
  invoiceNextNumber: number;
  quoteNextNumber: number;
  contractNextNumber: number;
  // Bank / E-transfer
  eTransferEmail: string;
  bankName: string;
}

interface CompanyStore {
  company: CompanyInfo;
  setCompany: (updates: Partial<CompanyInfo>) => void;
  resetCompany: () => void;
}

const DEFAULT_COMPANY: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: '',
  address: '',
  city: '',
  province: 'AB',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  gstNumber: '',
  wcbNumber: '',
  licenseNumber: '',
  defaultGstRate: 5,
  defaultDepositPercent: 30,
  paymentTerms: 'Net 15',
  invoiceNotes: 'Merci pour votre confiance. / Thank you for your business.',
  invoiceNextNumber: 1001,
  quoteNextNumber: 2001,
  contractNextNumber: 3001,
  eTransferEmail: '',
  bankName: '',
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: DEFAULT_COMPANY,
      setCompany: (updates) =>
        set((state) => ({
          company: { ...state.company, ...updates },
        })),
      resetCompany: () => set({ company: DEFAULT_COMPANY }),
    }),
    {
      name: 'company-store-v1',
    }
  )
);
