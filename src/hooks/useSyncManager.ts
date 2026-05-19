'use client'
import { useEffect } from 'react'
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
  const { employees, dayDetails } = useEmployeeStore()
  const { company } = useCompanyStore()
  const { clients } = useClientStore()
  const { documents } = useDocumentStore()

  // ── Pull au démarrage ─────────────────────────────────────────────────────
  useEffect(() => {
    const pull = async () => {
      try {
        const remoteCompany = await fetchCompanyFromSupabase(COMPANY_ID)
        if (remoteCompany) useCompanyStore.getState().setCompany(remoteCompany)

        const remoteEmployees = await fetchEmployeesFromSupabase(COMPANY_ID)
        if (remoteEmployees.length > 0) useEmployeeStore.setState({ employees: remoteEmployees })

        const remoteClients = await fetchClientsFromSupabase(COMPANY_ID)
        if (remoteClients.length > 0) useClientStore.setState({ clients: remoteClients })

        const remoteDocs = await fetchDocumentsFromSupabase(COMPANY_ID)
        if (remoteDocs.length > 0) useDocumentStore.setState({ documents: remoteDocs })

        const remoteDayDetails = await fetchDayDetailsFromSupabase(COMPANY_ID)
        if (Object.keys(remoteDayDetails).length > 0) useEmployeeStore.setState({ dayDetails: remoteDayDetails })

      } catch (err) {
        console.error('Supabase pull error:', err)
      }
    }
    pull()
  }, [])

  // ── Push immédiat au démarrage ────────────────────────────────────────────
  useEffect(() => {
    syncCompanyToSupabase(COMPANY_ID, company).catch(console.error)
  }, [])

  // ── Push quand les données changent ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      syncCompanyToSupabase(COMPANY_ID, company).catch(console.error)
    }, 1500)
    return () => clearTimeout(timer)
  }, [company])

  useEffect(() => {
    const timer = setTimeout(() => {
      syncEmployeesToSupabase(COMPANY_ID, employees).catch(console.error)
    }, 1500)
    return () => clearTimeout(timer)
  }, [employees])

  useEffect(() => {
    const timer = setTimeout(() => {
      syncClientsToSupabase(COMPANY_ID, clients).catch(console.error)
    }, 1500)
    return () => clearTimeout(timer)
  }, [clients])

  useEffect(() => {
    const timer = setTimeout(() => {
      syncDocumentsToSupabase(COMPANY_ID, documents).catch(console.error)
    }, 1500)
    return () => clearTimeout(timer)
  }, [documents])

  useEffect(() => {
    const timer = setTimeout(() => {
      syncDayDetailsToSupabase(COMPANY_ID, dayDetails).catch(console.error)
    }, 2000)
    return () => clearTimeout(timer)
  }, [dayDetails])
}
