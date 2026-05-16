import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanyInfo {
  // Identité
  name: string;
  tagline: string;
  ownerName: string;
  // Coordonnées
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  // Numéros légaux
  gstNumber: string;   // GST/HST Alberta 5%
  wcbNumber: string;   // WCB Alberta
  businessNumber: string;
  // Paiement
  bankName: string;
  bankTransit: string;
  bankAccount: string;
  etransferEmail: string;
  // Facturation
  defaultDepositPercent: number;
  defaultPaymentTermsDays: number;
  defaultNotes: string;
  // Branding
  logoUrl: string;
  primaryColor: string;
  // Numéros séquentiels
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  nextContractNumber: number;
  invoicePrefix: string;   // ex: "FAC" ou "INV"
  quotePrefix: string;     // ex: "DEV" ou "QUO"
  contractPrefix: string;  // ex: "CTR" ou "CON"
}

interface CompanyState {
  company: CompanyInfo;
  updateCompany: (data: Partial<CompanyInfo>) => void;
  getNextInvoiceNumber: () => string;
  getNextQuoteNumber: () => string;
  getNextContractNumber: () => string;
  resetNumbering: () => void;
}

const defaultCompany: CompanyInfo = {
  name: "Hailite Xteriors",
  tagline: "Qualité & Précision",
  ownerName: "Patrick Bisaillon",
  address: "",
  city: "",
  province: "AB",
  postalCode: "",
  phone: "",
  email: "",
  website: "",
  gstNumber: "",
  wcbNumber: "",
  businessNumber: "",
  bankName: "",
  bankTransit: "",
  bankAccount: "",
  etransferEmail: "",
  defaultDepositPercent: 30,
  defaultPaymentTermsDays: 14,
  defaultNotes:
    "Merci pour votre confiance. Paiement dû dans les délais convenus.",
  logoUrl: "",
  primaryColor: "#D4AF37",
  nextInvoiceNumber: 1,
  nextQuoteNumber: 1,
  nextContractNumber: 1,
  invoicePrefix: "FAC",
  quotePrefix: "DEV",
  contractPrefix: "CTR",
};

function padNumber(n: number, digits = 3): string {
  return String(n).padStart(digits, "0");
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      company: defaultCompany,

      updateCompany: (data) =>
        set((state) => ({
          company: { ...state.company, ...data },
        })),

      getNextInvoiceNumber: () => {
        const { company } = get();
        const num = `${company.invoicePrefix}-${padNumber(company.nextInvoiceNumber)}`;
        set((state) => ({
          company: {
            ...state.company,
            nextInvoiceNumber: state.company.nextInvoiceNumber + 1,
          },
        }));
        return num;
      },

      getNextQuoteNumber: () => {
        const { company } = get();
        const num = `${company.quotePrefix}-${padNumber(company.nextQuoteNumber)}`;
        set((state) => ({
          company: {
            ...state.company,
            nextQuoteNumber: state.company.nextQuoteNumber + 1,
          },
        }));
        return num;
      },

      getNextContractNumber: () => {
        const { company } = get();
        const num = `${company.contractPrefix}-${padNumber(company.nextContractNumber)}`;
        set((state) => ({
          company: {
            ...state.company,
            nextContractNumber: state.company.nextContractNumber + 1,
          },
        }));
        return num;
      },

      resetNumbering: () =>
        set((state) => ({
          company: {
            ...state.company,
            nextInvoiceNumber: 1,
            nextQuoteNumber: 1,
            nextContractNumber: 1,
          },
        })),
    }),
    {
      name: "company-store-v1",
    }
  )
);
