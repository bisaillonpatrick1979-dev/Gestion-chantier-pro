'use client'
import { useEffect, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import {
  syncCompanyToSupabase, fetchCompanyFromSupabase,
  syncEmployeesToSupabase, fetchEmployeesFromSupabase,
  syncClientsToSupabase, fetchClientsFromSupabase,
  syncDocumentsToSupabase, fetchDocumentsFromSupabase,
  syncDayDetailsToSupabase, fetchDayDetailsFromSupabase,
} from '@/lib/syncSupabase'

const COMPANY_ID = 'hailite-xteriors'

export function useSyncManager() {
  const { employees, dayDetails, activeSessions } = useEmployeeStore()
  const { company } = useCompanyStore()
  const { clients } = useClientStore()
  const { documents } = useDocumentStore()
  const initialSyncDone = useRef(false)

  // ── Pull depuis Supabase au démarrage ─────────────────────────────────────
  useEffect(() => {
    if (initialSyncDone.current) return
    initialSyncDone.current = true

    const pull = async () => {
      try {
        // Company
        const remoteCompany = await fetchCompanyFromSupabase(COMPANY_ID)
        if (remoteCompany) {
          useCompanyStore.getState().setCompany(remoteCompany)
        }

        // Employees
        const remoteEmployees = await fetchEmployeesFromSupabase(COMPANY_ID)
        if (remoteEmployees.length > 0) {
          useEmployeeStore.setState({ employees: remoteEmployees })
        }

        // Clients
        const remoteClients = await fetchClientsFromSupabase(COMPANY_ID)
        if (remoteClients.length > 0) {
          useClientStore.setState({ clients: remoteClients })
        }

        // Documents
        const remoteDocs = await fetchDocumentsFromSupabase(COMPANY_ID)
        if (remoteDocs.length > 0) {
          useDocumentStore.setState({ documents: remoteDocs })
        }

        // Day Details
        const remoteDayDetails = await fetchDayDetailsFromSupabase(COMPANY_ID)
        if (Object.keys(remoteDayDetails).length > 0) {
          useEmployeeStore.setState({ dayDetails: remoteDayDetails })
        }

      } catch (err) {
        console.error('Supabase pull error:', err)
      }
    }

    pull()
  }, [])

  // ── Push vers Supabase quand les données changent ─────────────────────────
  useEffect(() => {
    if (!initialSyncDone.current) return
    const timer = setTimeout(() => {
      syncCompanyToSupabase(COMPANY_ID, company).catch(console.error)
    }, 1000)
    return () => clearTimeout(timer)
  }, [company])

  useEffect(() => {
    if (!initialSyncDone.current) return
    const timer = setTimeout(() => {
      syncEmployeesToSupabase(COMPANY_ID, employees).catch(console.error)
    }, 1000)
    return () => clearTimeout(timer)
  }, [employees])

  useEffect(() => {
    if (!initialSyncDone.current) return
    const timer = setTimeout(() => {
      syncClientsToSupabase(COMPANY_ID, clients).catch(console.error)
    }, 1000)
    return () => clearTimeout(timer)
  }, [clients])

  useEffect(() => {
    if (!initialSyncDone.current) return
    const timer = setTimeout(() => {
      syncDocumentsToSupabase(COMPANY_ID, documents).catch(console.error)
    }, 1000)
    return () => clearTimeout(timer)
  }, [documents])

  useEffect(() => {
    if (!initialSyncDone.current) return
    const timer = setTimeout(() => {
      syncDayDetailsToSupabase(COMPANY_ID, dayDetails).catch(console.error)
    }, 2000)
    return () => clearTimeout(timer)
  }, [dayDetails])
}
