'use client'

import { useEffect, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useCompanyStore } from '@/store/useCompanyStore'

export default function SyncManager() {
  const fetchEmployees = useEmployeeStore(s => s.fetchFromCloud)
  const fetchClients   = useClientStore(s => s.fetchFromCloud)
  const fetchDocuments = useDocumentStore(s => s.fetchFromCloud)
  const fetchCompany   = useCompanyStore(s => s.fetchFromCloud)
  const hasFetched     = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    // Fetch toutes les données au démarrage
    const fetchAll = async () => {
      await Promise.all([
        fetchCompany(),
        fetchEmployees(),
        fetchClients(),
        fetchDocuments(),
      ])
      console.log('✅ Sync Supabase terminé')
    }

    fetchAll()

    // Re-sync toutes les 5 minutes (multi-appareils)
    const interval = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Re-fetch quand l'app revient au premier plan
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        Promise.all([
          fetchCompany(),
          fetchEmployees(),
          fetchClients(),
          fetchDocuments(),
        ])
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return null
}
