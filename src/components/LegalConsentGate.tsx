'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'

const STORAGE_KEY = 'gcp-legal-consent-v1'
const VERSION = '1.0'

export default function LegalConsentGate() {
  const pathname = usePathname()
  const { lang } = useLangStore()
  const { completed } = useOnboardingStore()
  const [ready, setReady] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [checks, setChecks] = useState([false, false, false, false, false, false])

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const saved = raw ? JSON.parse(raw) : null
      setAccepted(saved?.accepted === true && saved?.version === VERSION)
    } catch {
      setAccepted(false)
    } finally {
      setReady(true)
    }
  }, [])

  const allChecked = checks.every(Boolean)

  const toggle = (index: number) => {
    setChecks(values => values.map((value, i) => i === index ? !value : value))
  }

  const accept = () => {
    if (!allChecked) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accepted: true,
      version: VERSION,
      acceptedAt: new Date().toISOString(),
    }))
    setAccepted(true)
  }

  if (!ready || accepted || !completed || pathname === '/onboarding') return null

  const items = [
    t('J’accepte les conditions d’utilisation et la politique de confidentialité.', 'I accept the terms of use and privacy policy.'),
    t('Je comprends que des données peuvent être enregistrées localement sur mon appareil.', 'I understand that data may be stored locally on my device.'),
    t('Je comprends que la synchronisation, si activée, peut envoyer des données vers une base cloud.', 'I understand that sync, when enabled, may send data to a cloud database.'),
    t('Je confirme avoir l’autorisation de gérer les données que j’entre dans l’application.', 'I confirm I am authorized to manage the data I enter in the app.'),
    t('Je comprends que les calculs doivent être vérifiés par un professionnel qualifié.', 'I understand that calculations should be verified by a qualified professional.'),
    t('Je comprends que les permissions caméra, photos, notifications ou GPS seront demandées seulement au besoin.', 'I understand that camera, photo, notification, or GPS permissions will be requested only when needed.'),
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, overflowY: 'auto', background: 'linear-gradient(160deg,#050210,#16082f)', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 540, borderRadius: 26, padding: 22, background: 'rgba(12,5,28,.98)', border: '1px solid rgba(168,85,247,.36)', boxShadow: '0 30px 90px rgba(0,0,0,.58)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 46 }}>🔐</div>
          <h1 style={{ color: '#f5e8ff', fontSize: 22, fontWeight: 950, margin: '8px 0 6px' }}>{t('Consentement', 'Consent')}</h1>
          <p style={{ color: '#a78bfa', fontSize: 12, lineHeight: 1.55, margin: 0 }}>{t('Avant de continuer, confirmez les points importants.', 'Before continuing, confirm the important points.')}</p>
        </div>

        <p style={{ color: '#e9d5ff', fontSize: 13, lineHeight: 1.62, marginBottom: 14 }}>
          {t('Cette application peut gérer des données de compagnie, clients, employés, projets, heures, montants, factures, documents et localisation si activée.', 'This app may manage company, client, employee, project, time, amount, invoice, document, and location data when enabled.')}
        </p>

        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          {items.map((item, index) => (
            <label key={item} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 14, background: checks[index] ? 'rgba(34,211,238,.10)' : 'rgba(255,255,255,.045)', border: checks[index] ? '1px solid rgba(34,211,238,.36)' : '1px solid rgba(255,255,255,.10)', color: '#e9d5ff', fontSize: 12, lineHeight: 1.45 }}>
              <input type="checkbox" checked={checks[index]} onChange={() => toggle(index)} style={{ marginTop: 2, width: 18, height: 18 }} />
              <span>{item}</span>
            </label>
          ))}
        </div>

        <p style={{ color: '#7c6aa8', fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>
          {t('Des mesures raisonnables sont utilisées pour protéger les données, mais aucune application ne peut garantir une sécurité absolue.', 'Reasonable safeguards are used to protect data, but no app can guarantee absolute security.')}
        </p>

        <button onClick={accept} disabled={!allChecked} style={{ width: '100%', padding: '18px 16px', borderRadius: 18, border: 'none', cursor: allChecked ? 'pointer' : 'not-allowed', opacity: allChecked ? 1 : .42, color: 'white', fontSize: 15, fontWeight: 950, letterSpacing: 1, background: 'linear-gradient(135deg,#7c3aed,#a855f7,#22d3ee)', boxShadow: allChecked ? '0 0 28px rgba(168,85,247,.45)' : 'none' }}>
          {t('J’accepte et je continue', 'I accept and continue')}
        </button>
      </div>
    </div>
  )
}
