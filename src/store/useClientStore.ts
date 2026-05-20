'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  syncClientsToSupabase,
  fetchClientsFromSupabase,
} from '@/lib/sync'

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  postalCode: string
  notes: string
  createdAt: string
}

interface ClientStore {
  clients: Client[]
  isSyncing: boolean
  lastSync: string | null
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
  syncToCloud: () => Promise<void>
  fetchFromCloud: () => Promise<void>
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],
      isSyncing: false,
      lastSync: null,

      addClient: (data) => {
        const newClient: Client = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        const newClients = [...get().clients, newClient]
        set({ clients: newClients })
        syncClientsToSupabase(newClients)
        return newClient
      },

      updateClient: (id, updates) => {
        const newClients = get().clients.map(c => c.id === id ? { ...c, ...updates } : c)
        set({ clients: newClients })
        syncClientsToSupabase(newClients)
      },

      deleteClient: (id) => {
        const newClients = get().clients.filter(c => c.id !== id)
        set({ clients: newClients })
        syncClientsToSupabase(newClients)
      },

      syncToCloud: async () => {
        set({ isSyncing: true })
        try {
          await syncClientsToSupabase(get().clients)
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('syncToCloud clients error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },

      fetchFromCloud: async () => {
        set({ isSyncing: true })
        try {
          const remote = await fetchClientsFromSupabase()
          if (remote && remote.length > 0) {
            set({ clients: remote })
          }
          set({ lastSync: new Date().toISOString() })
        } catch (e) {
          console.error('fetchFromCloud clients error:', e)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    { name: 'client-store-v1' }
  )
)
