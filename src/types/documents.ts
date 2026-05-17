// src/types/documents.ts

export type DocumentType = 'invoice' | 'quote' | 'contract'
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  unitPrice: number
}

export interface GCPDocument {
  id: string
  type: DocumentType
  number: string
  date: string
  dueDate?: string
  status: DocumentStatus

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

// Alias de compatibilité
export type Document = GCPDocument
