'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface POItem {
  id: string
  materialId?: string
  name: string
  unit: string
  quantite: number
  notes?: string
}

export type CommandeStatus = 'brouillon' | 'envoyee' | 'recue'

export interface Commande {
  id: string
  numero: string

  // ── Fournisseur (vendeur) ─────────────────────────────────────────────────
  fournisseur: string
  fournisseurEmail?: string
  fournisseurPhone?: string

  // ── Livraison ────────────────────────────────────────────────────────────
  adresseLivraison?: string   // adresse du chantier
  projetRef?: string          // ex: "Maison Smith — 123 rue Maple"
  dateLivraison?: string      // date souhaitée YYYY-MM-DD

  // ── Infos PO ─────────────────────────────────────────────────────────────
  date: string                // date d'émission
  status: CommandeStatus
  items: POItem[]
  notes: string
  createdAt: string
  sentAt?: string
  receivedAt?: string
}

interface CommandeStore {
  commandes: Commande[]
  nextNumber: number
  addCommande: (data: Omit<Commande, 'id' | 'numero' | 'status' | 'items' | 'createdAt'>) => Commande
  updateCommande: (id: string, updates: Partial<Commande>) => void
  deleteCommande: (id: string) => void
  addItem: (commandeId: string, item: Omit<POItem, 'id'>) => void
  updateItem: (commandeId: string, itemId: string, updates: Partial<POItem>) => void
  removeItem: (commandeId: string, itemId: string) => void
  markSent: (id: string) => void
  markReceived: (id: string) => void
}

export const useCommandeStore = create<CommandeStore>()(
  persist(
    (set, get) => ({
      commandes: [],
      nextNumber: 1,

      addCommande: (data) => {
        const { nextNumber, commandes } = get()
        const newCmd: Commande = {
          ...data,
          id: Date.now().toString(),
          numero: `PO-${String(nextNumber).padStart(3, '0')}`,
          status: 'brouillon',
          items: [],
          createdAt: new Date().toISOString(),
        }
        set({ commandes: [...commandes, newCmd], nextNumber: nextNumber + 1 })
        return newCmd
      },

      updateCommande: (id, updates) => set(s => ({
        commandes: s.commandes.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteCommande: (id) => set(s => ({
        commandes: s.commandes.filter(c => c.id !== id)
      })),

      addItem: (commandeId, item) => set(s => ({
        commandes: s.commandes.map(c =>
          c.id === commandeId
            ? { ...c, items: [...c.items, { ...item, id: Date.now().toString() }] }
            : c
        )
      })),

      updateItem: (commandeId, itemId, updates) => set(s => ({
        commandes: s.commandes.map(c =>
          c.id === commandeId
            ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
            : c
        )
      })),

      removeItem: (commandeId, itemId) => set(s => ({
        commandes: s.commandes.map(c =>
          c.id === commandeId
            ? { ...c, items: c.items.filter(i => i.id !== itemId) }
            : c
        )
      })),

      markSent: (id) => set(s => ({
        commandes: s.commandes.map(c =>
          c.id === id ? { ...c, status: 'envoyee', sentAt: new Date().toISOString() } : c
        )
      })),

      markReceived: (id) => set(s => ({
        commandes: s.commandes.map(c =>
          c.id === id ? { ...c, status: 'recue', receivedAt: new Date().toISOString() } : c
        )
      })),
    }),
    { name: 'commande-store-v1' }
  )
)
