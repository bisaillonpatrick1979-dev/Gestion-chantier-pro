'use client'

import { useEffect, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useProjectStore } from '@/store/useProjectStore'
import { usePayrollStore } from '@/store/usePayrollStore'

export default function SyncManager() {
  const fetchEmployees = useEmployeeStore(s => s.fetchFromCloud)
  const fetchClients   = useClientStore(s => s.fetchFromCloud)
  const fetchDocuments = useDocumentStore(s => s.fetchFromCloud)
  const fetchCompany   = useCompanyStore(s => s.fetchFromCloud)
  const fetchProjects  = useProjectStore(s => s.fetchFromCloud)
  const fetchPayroll   = usePayrollStore(s => s.fetchFromCloud)

  const syncEmployees = useEmployeeStore(s => s.syncToCloud)
  const syncClients   = useClientStore(s => s.syncToCloud)
  const syncDocuments = useDocumentStore(s => s.syncToCloud)
  const syncCompany   = useCompanyStore(s => s.syncToCloud)
  const syncProjects  = useProjectStore(s => s.syncToCloud)
  const syncPayroll   = usePayrollStore(s => s.syncToCloud)

  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const run = async () => {
      try {
        console.log('🔄 SyncManager — push local → Supabase...')
        await Promise.all([
          syncCompany(),
          syncEmployees(),
          syncClients(),
          syncDocuments(),
          syncProjects(),
          syncPayroll(),
        ])
        console.log('✅ Push OK — fetch Supabase → local...')
        await Promise.all([
          fetchCompany(),
          fetchEmployees(),
          fetchClients(),
          fetchDocuments(),
          fetchProjects(),
          fetchPayroll(),
        ])
        console.log('✅ Sync complet')
      } catch (e) {
        console.error('❌ SyncManager error:', e)
      }
    }

    const timeout = setTimeout(run, 2000)
    const interval = setInterval(run, 5 * 60 * 1000)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        Promise.all([
          syncCompany(), syncEmployees(), syncClients(),
          syncDocuments(), syncProjects(), syncPayroll(),
        ]).then(() => Promise.all([
          fetchCompany(), fetchEmployees(), fetchClients(),
          fetchDocuments(), fetchProjects(), fetchPayroll(),
        ])).catch(console.error)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return null
}
