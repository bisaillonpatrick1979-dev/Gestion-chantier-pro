'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GCPDocument, Document, DocumentType, LineItem } from '@/types/documents'

interface DocumentStore {
  documents: GCPDocument[]
  addDocument: (type: DocumentType) => GCPDocument
  updateDocument: (id: string, updates: Partial<GCPDocument>) => void
  deleteDocument: (id: string) => void
  addLineItem: (docId: string) => void
  updateLineItem: (docId: string, itemId: string, updates: Partial<LineItem>) => void
  removeLineItem: (docId: string, itemId: string) => void
  calculateTotals: (docId: string) => void
}

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6)

const generateNumber = (type: DocumentType, count: number): string => {
  const prefix = type === 'invoice' ? 'FAC' : type === 'quote' ? 'DEV' : 'CON'
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(4, '0')
  return `${prefix}-${year}-${num}`
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (type) => {
        const { documents } = get()
        const typeCount = documents.filter(d => d.type === type).length
        const now = new Date()
        const due = new Date(now)
        due.setDate(due.getDate() + 30)

        const newDoc: GCPDocument = {
          id: uid(),
          type,
          status: 'draft',
          number: generateNumber(type, typeCount),
          date: now.toISOString().split('T')[0],
          dueDate: due.toISOString().split('T')[0],
          clientName: '',
          clientAddress: '',
          clientEmail: '',
          clientPhone: '',
          companyName: 'Hailite Xteriors',
          companyAddress: '',
          companyPhone: '',
          companyEmail: '',
          companyGST: '',
          companyWCB: '',
          lines: [{ id: uid(), description: '', qty: 1, unit: 'unité', unitPrice: 0 }],
          subtotal: 0,
          discountPct: 0,
          discountAmount: 0,
          taxRate: 5,
          taxAmount: 0,
          total: 0,
          depositAmount: 0,
          balanceDue: 0,
          notes: '',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        }

        set({ documents: [...documents, newDoc] })
        return newDoc
      },

      updateDocument: (id, updates) => set(state => ({
        documents: state.documents.map(d =>
          d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
        )
      })),

      deleteDocument: (id) => set(state => ({
        documents: state.documents.filter(d => d.id !== id)
      })),

      addLineItem: (docId) => {
        const newItem: LineItem = { id: uid(), description: '', qty: 1, unit: 'unité', unitPrice: 0 }
        set(state => ({
          documents: state.documents.map(d =>
            d.id === docId ? { ...d, lines: [...d.lines, newItem] } : d
          )
        }))
      },

      updateLineItem: (docId, itemId, updates) => {
        set(state => ({
          documents: state.documents.map(d => {
            if (d.id !== docId) return d
            return {
              ...d,
              lines: d.lines.map(item =>
                item.id !== itemId ? item : { ...item, ...updates }
              )
            }
          })
        }))
        get().calculateTotals(docId)
      },

      removeLineItem: (docId, itemId) => {
        set(state => ({
          documents: state.documents.map(d =>
            d.id !== docId ? d : { ...d, lines: d.lines.filter(i => i.id !== itemId) }
          )
        }))
        get().calculateTotals(docId)
      },

      calculateTotals: (docId) => {
        set(state => ({
          documents: state.documents.map(d => {
            if (d.id !== docId) return d
            const subtotal = d.lines.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
            const discountAmount = subtotal * ((d.discountPct ?? 0) / 100)
            const taxable = subtotal - discountAmount
            const taxAmount = taxable * ((d.taxRate ?? 5) / 100)
            const total = taxable + taxAmount
            const balanceDue = total - (d.depositAmount ?? 0)
            return { ...d, subtotal, discountAmount, taxAmount, total, balanceDue, updatedAt: new Date().toISOString() }
          })
        }))
      },
    }),
    { name: 'document-store-v1' }
  )
)
