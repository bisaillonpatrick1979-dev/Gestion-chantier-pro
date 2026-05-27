'use client'

import { CSSProperties, useState } from 'react'
import { hasSupabaseEnvironment, supabase } from '@/lib/supabase'
import { useStorageSettingsStore } from '@/store/useStorageSettingsStore'
import { getCompanyId, getInstallationId, getOrCreateCompanyId, getOrCreateInstallationId } from '@/lib/tenant'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export default function SupabaseDiagnosticPage() {
  const { storageMode, cloudSyncEnabled } = useStorageSettingsStore()
  const { lastSync } = useEmployeeStore()
  const [result, setResult] = useState('')

  const companyId = getCompanyId() ?? getOrCreateCompanyId()
  const installationId = getInstallationId() ?? getOrCreateInstallationId()

  async function testConnection() {
    setResult('Test en cours...')
    try {
      const { error } = await supabase.from('employees').select('id').limit(1)
      if (error) throw error
      setResult('Connexion Supabase OK ✅')
    } catch (e: any) {
      setResult(`Connexion échouée: ${e?.message ?? 'Erreur inconnue'}`)
    }
  }

  async function copyCompanyId() {
    await navigator.clipboard.writeText(companyId)
    setResult('company_id copié ✅')
  }

  return (
    <main style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>🔎 Supabase Diagnostic</h1>
      <p style={{ marginBottom: 16, opacity: 0.85 }}>Avant les tests multi-compagnies, exécutez les migrations SQL RLS dans Supabase.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        <DiagRow label="Supabase URL configurée" value={hasSupabaseEnvironment ? 'Oui' : 'Non'} />
        <DiagRow label="Anon key configurée" value={hasSupabaseEnvironment ? 'Oui (masquée)' : 'Non'} />
        <DiagRow label="storageMode" value={storageMode} />
        <DiagRow label="cloudSyncEnabled" value={String(cloudSyncEnabled)} />
        <DiagRow label="company_id" value={companyId} />
        <DiagRow label="installation_id" value={installationId} />
        <DiagRow label="dernière sync" value={lastSync ?? 'N/A'} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={testConnection} style={btn}>Tester connexion Supabase</button>
        <button onClick={copyCompanyId} style={btn}>Copier company_id</button>
      </div>
      {result && <p style={{ marginTop: 12 }}>{result}</p>}
    </main>
  )
}

function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, border: '1px solid #333', borderRadius: 10, padding: 10 }}>
      <strong>{label}</strong>
      <span style={{ textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

const btn: CSSProperties = {
  border: '1px solid #444',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 700,
}
