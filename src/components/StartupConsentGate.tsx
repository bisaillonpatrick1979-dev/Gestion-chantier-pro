'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { useStorageSettingsStore, StorageMode } from '@/store/useStorageSettingsStore'

const KEY = 'gcp-startup-consent-v1'

type ChoiceInfo = {
  mode: StorageMode
  icon: string
  titleFr: string
  titleEn: string
  subtitleFr: string
  subtitleEn: string
  detailFr: string
  detailEn: string
  bulletsFr: string[]
  bulletsEn: string[]
}

const CHOICES: ChoiceInfo[] = [
  {
    mode: 'local',
    icon: '📱',
    titleFr: 'Local seulement',
    titleEn: 'Local only',
    subtitleFr: 'Données gardées sur cet appareil.',
    subtitleEn: 'Data kept on this device.',
    detailFr: 'Vos données restent sur ce téléphone, cette tablette ou ce navigateur. Rien n’est envoyé vers Supabase par ce choix.',
    detailEn: 'Your data stays on this phone, tablet, or browser. Nothing is sent to Supabase with this choice.',
    bulletsFr: ['Fonctionne hors ligne.', 'Plus privé.', 'Peut être perdu si le navigateur, l’app ou l’appareil est effacé.'],
    bulletsEn: ['Works offline.', 'More private.', 'May be lost if the browser, app, or device is erased.'],
  },
  {
    mode: 'file-backup',
    icon: '💾',
    titleFr: 'Sauvegarde fichier',
    titleEn: 'File backup',
    subtitleFr: 'Export manuel vers votre cloud personnel.',
    subtitleEn: 'Manual export to your personal cloud.',
    detailFr: 'Vos données restent locales. Vous pouvez exporter un fichier de sauvegarde et le garder dans iCloud, Google Drive, Samsung Files, OneDrive ou ailleurs.',
    detailEn: 'Your data stays local. You can export a backup file and keep it in iCloud, Google Drive, Samsung Files, OneDrive, or elsewhere.',
    bulletsFr: ['Vous contrôlez le fichier.', 'Bon choix pour garder une copie personnelle.', 'La sauvegarde dépend de vous.'],
    bulletsEn: ['You control the file.', 'Good choice for keeping a personal copy.', 'The backup depends on you.'],
  },
  {
    mode: 'supabase',
    icon: '☁️',
    titleFr: 'Supabase / Cloud sécurisé',
    titleEn: 'Supabase / Secure cloud',
    subtitleFr: 'Sauvegarde cloud, multi-appareils et équipe.',
    subtitleEn: 'Cloud backup, multi-device, and team use.',
    detailFr: 'Les données peuvent être synchronisées dans Supabase pour récupérer vos informations, travailler sur plusieurs appareils et gérer une équipe.',
    detailEn: 'Data can be synchronized to Supabase to recover information, work across devices, and manage a team.',
    bulletsFr: ['Nous appliquons des mesures strictes pour protéger l’accès aux données.', 'Conçu pour rôles Admin, Employé et Sous-traitant.', 'Les données vont dans le cloud seulement si vous activez ce choix.'],
    bulletsEn: ['We apply strict measures to protect data access.', 'Designed for Admin, Employee, and Subcontractor roles.', 'Data goes to the cloud only if you enable this choice.'],
  },
]

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 10002, overflowY: 'auto', background: '#030712', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560, background: '#111827', border: '1px solid #22d3ee55', borderRadius: 24, padding: 18, color: 'white' }}>
        <h1 style={{ fontSize: 22, fontWeight: 950, marginBottom: 8 }}>🔐 {t('Autorisation et sauvegarde', 'Consent and backup')}</h1>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.45, marginBottom: 12 }}>{t('Choisissez où vos données seront gardées. Cliquez sur une option pour voir ce que ce choix veut dire.', 'Choose where your data will be kept. Tap an option to see what the choice means.')}</p>

        <div style={{ display: 'grid', gap: 10 }}>
          {CHOICES.map(choice => {
            const active = mode === choice.mode
            return (
              <button key={choice.mode} onClick={() => setMode(choice.mode)} style={choiceBtn(active)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28 }}>{choice.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 950, fontSize: 15 }}>{lang === 'fr' ? choice.titleFr : choice.titleEn}</div>
                    <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 3 }}>{lang === 'fr' ? choice.subtitleFr : choice.subtitleEn}</div>
                    {active && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ color: '#e5e7eb', fontSize: 12, lineHeight: 1.45, margin: 0 }}>{lang === 'fr' ? choice.detailFr : choice.detailEn}</p>
                        <ul style={{ color: '#93c5fd', fontSize: 12, lineHeight: 1.55, margin: '8px 0 0 18px', padding: 0 }}>
                          {(lang === 'fr' ? choice.bulletsFr : choice.bulletsEn).map(item => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  {active && <span style={{ color: '#22d3ee', fontWeight: 950 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <label style={{ display: 'flex', gap: 10, marginTop: 14, fontSize: 12, color: '#e5e7eb', lineHeight: 1.4 }}>
          <input type="checkbox" checked={ok} onChange={() => setOk(v => !v)} style={{ width: 18, height: 18 }} />
          <span>{t('Je comprends ce choix de sauvegarde et j’accepte de continuer.', 'I understand this backup choice and agree to continue.')}</span>
        </label>

        <button onClick={save} disabled={!ok} style={{ width: '100%', marginTop: 14, padding: 14, borderRadius: 16, border: 'none', opacity: ok ? 1 : .45, background: 'linear-gradient(135deg,#7c3aed,#22d3ee)', color: 'white', fontWeight: 950 }}>{t('Continuer', 'Continue')}</button>
      </div>
    </div>
  )
}

function choiceBtn(active: boolean) {
  return {
    width: '100%',
    padding: 13,
    borderRadius: 16,
    border: active ? '2px solid #22d3ee' : '1px solid #ffffff22',
    background: active ? '#0891b233' : '#ffffff0d',
    color: 'white',
    textAlign: 'left' as const,
    cursor: 'pointer',
  }
}
