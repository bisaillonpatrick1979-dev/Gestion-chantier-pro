'use client'

import { useEffect, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useProjectStore } from '@/store/useProjectStore'
import { usePayrollStore } from '@/store/usePayrollStore'
import { useStorageSettingsStore } from '@/store/useStorageSettingsStore'

export default function SyncManager() {
  const storageMode = useStorageSettingsStore(s => s.storageMode)
  const cloudSyncEnabled = useStorageSettingsStore(s => s.cloudSyncEnabled)
  const canSyncCloud = storageMode === 'supabase' && cloudSyncEnabled === true
  const hasFetched = useRef(false)

  const fetchEmployees = useEmployeeStore(s => s.fetchFromCloud)
  const fetchClients = useClientStore(s => s.fetchFromCloud)
  const fetchDocuments = useDocumentStore(s => s.fetchFromCloud)
  const fetchCompany = useCompanyStore(s => s.fetchFromCloud)
  const fetchProjects = useProjectStore(s => s.fetchFromCloud)
  const fetchPayroll = usePayrollStore(s => s.fetchFromCloud)

  const syncEmployees = useEmployeeStore(s => s.syncToCloud)
  const syncClients = useClientStore(s => s.syncToCloud)
  const syncDocuments = useDocumentStore(s => s.syncToCloud)
  const syncCompany = useCompanyStore(s => s.syncToCloud)
  const syncProjects = useProjectStore(s => s.syncToCloud)
  const syncPayroll = usePayrollStore(s => s.syncToCloud)

  const runSync = async () => {
    if (!canSyncCloud) return
    await Promise.all([syncCompany(), syncEmployees(), syncClients(), syncDocuments(), syncProjects(), syncPayroll()])
    await Promise.all([fetchCompany(), fetchEmployees(), fetchClients(), fetchDocuments(), fetchProjects(), fetchPayroll()])
  }

  useEffect(() => {
    if (!canSyncCloud) return
    if (hasFetched.current) return
    hasFetched.current = true
    const timeout = window.setTimeout(() => runSync().catch(console.error), 2000)
    const interval = window.setInterval(() => runSync().catch(console.error), 5 * 60 * 1000)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [canSyncCloud])

  useEffect(() => {
    if (!canSyncCloud) return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') runSync().catch(console.error)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [canSyncCloud])

  return null
}
