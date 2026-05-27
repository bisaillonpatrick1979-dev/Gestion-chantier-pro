'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { useStorageSettingsStore, StorageMode } from '@/store/useStorageSettingsStore'

const KEY = 'gcp-startup-consent-v1'

export default function StartupConsentGate() {
  const pathname = usePathname()
  const { lang } = useLangStore()
  const { completed } = useOnboardingStore()
  const { setStorageMode } = useStorageSettingsStore()
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState<StorageMode>('local')
  const [ok, setOk] = useState(false)
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    setDone(localStorage.getItem(KEY) === 'yes')
    setReady(true)
  }, [])

  const save = () => {
    if (!ok) return
    setStorageMode(mode)
    localStorage.setItem(KEY, 'yes')
    localStorage.setItem('gcp-startup-storage-mode', mode)
    localStorage.setItem('gcp-startup-consent-date', new Date().toISOString())
    setDone(true)
  }

  if (!ready || done || !completed || pathname === '/onboarding') return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10002, background: '#030712', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#111827', border: '1px solid #22d3ee55', borderRadius: 24, padding: 18, color: 'white' }}>
        <h1 style={{ fontSize: 22, fontWeight: 950, marginBottom: 8 }}>🔐 {t('Autorisation et sauvegarde', 'Consent and backup')}</h1>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.45 }}>{t('Choisissez où vos données seront gardées.', 'Choose where your data will be kept.')}</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <button onClick={() => setMode('local')} style={btn(mode === 'local')}>📱 {t('Local seulement', 'Local only')}</button>
          <button onClick={() => setMode('file-backup')} style={btn(mode === 'file-backup')}>💾 {t('Sauvegarde fichier', 'File backup')}</button>
          <button onClick={() => setMode('supabase')} style={btn(mode === 'supabase')}>☁️ {t('Supabase / Cloud sécurisé', 'Supabase / Secure cloud')}</button>
        </div>
        <p style={{ color: '#93c5fd', fontSize: 12, lineHeight: 1.45, marginTop: 12 }}>{t('Nous appliquons des mesures strictes pour protéger l’accès aux données.', 'We apply strict measures to protect data access.')}</p>
        <label style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 12, color: '#e5e7eb' }}>
          <input type="checkbox" checked={ok} onChange={() => setOk(v => !v)} />
          <span>{t('Je comprends et j’accepte ce choix.', 'I understand and accept this choice.')}</span>
        </label>
        <button onClick={save} disabled={!ok} style={{ width: '100%', marginTop: 14, padding: 14, borderRadius: 16, border: 'none', opacity: ok ? 1 : .45, background: 'linear-gradient(135deg,#7c3aed,#22d3ee)', color: 'white', fontWeight: 950 }}>{t('Continuer', 'Continue')}</button>
      </div>
    </div>
  )
}

function btn(active: boolean) {
  return { padding: 13, borderRadius: 14, border: active ? '2px solid #22d3ee' : '1px solid #ffffff22', background: active ? '#0891b233' : '#ffffff0d', color: 'white', textAlign: 'left' as const, fontWeight: 900, cursor: 'pointer' }
}
