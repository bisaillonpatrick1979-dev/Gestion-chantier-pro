// src/types/documents.ts

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  unitPrice: number
}

export interface GCPDocument {
  id: string
  type: 'invoice' | 'quote' | 'contract'
  number: string
  date: string
  dueDate?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'

  // Client
  clientId?: string
  clientName: string
  clientAddress?: string
  clientEmail?: string
  clientPhone?: string

  // Compagnie (auto depuis useCompanyStore)
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGST?: string
  companyWCB?: string
  companyLogo?: string

  // Lignes
  lines: LineItem[]

  // Calculs
  subtotal: number
  discountPct?: number
  discountAmount?: number
  taxRate: number
  taxAmount: number
  total: number
  depositAmount?: number
  balanceDue?: number

  // Notes / signature
  notes?: string
  signature?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Alias de compatibilité — au cas où d'autres fichiers utilisent encore 'Document'
export type Document = GCPDocument
