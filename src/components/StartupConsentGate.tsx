'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { useStorageSettingsStore, StorageMode, PersonalCloudProvider } from '@/store/useStorageSettingsStore'
import { chooseBackupFolderAndSave, downloadBackupFile, importBackupFile, supportsNativeDirectoryPicker } from '@/lib/backup'

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
    bulletsFr: ['Fonctionne hors ligne.', 'Plus privé.', 'Choisissez un endroit pour garder un fichier de sauvegarde.', 'Peut être perdu si le navigateur, l’app ou l’appareil est effacé.'],
    bulletsEn: ['Works offline.', 'More private.', 'Choose a place to keep a backup file.', 'May be lost if the browser, app, or device is erased.'],
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
    bulletsFr: ['Vous contrôlez le fichier.', 'Bon choix pour garder une copie personnelle.', 'L’app vous demande l’autorisation avant de créer ou télécharger un fichier.', 'La sauvegarde dépend de vous.'],
    bulletsEn: ['You control the file.', 'Good choice for keeping a personal copy.', 'The app asks permission before creating or downloading a file.', 'The backup depends on you.'],
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

const PROVIDERS: { id: PersonalCloudProvider; fr: string; en: string }[] = [
  { id: 'device', fr: 'Cet appareil / Téléchargements', en: 'This device / Downloads' },
  { id: 'icloud', fr: 'iCloud Drive', en: 'iCloud Drive' },
  { id: 'google-drive', fr: 'Google Drive', en: 'Google Drive' },
  { id: 'samsung-files', fr: 'Samsung Files / Mes fichiers', en: 'Samsung Files / My Files' },
  { id: 'onedrive', fr: 'OneDrive', en: 'OneDrive' },
  { id: 'other', fr: 'Autre emplacement', en: 'Other location' },
]

export default function StartupConsentGate() {
  const pathname = usePathname()
  const { lang } = useLangStore()
  const { completed } = useOnboardingStore()
  const {
    setStorageMode,
    setBackupProvider,
    setBackupLocationLabel,
    setBackupPermissionGranted,
    markBackupDone,
  } = useStorageSettingsStore()
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState<StorageMode>('local')
  const [provider, setProvider] = useState<PersonalCloudProvider>('device')
  const [locationLabel, setLocationLabel] = useState('')
  const [permission, setPermission] = useState(false)
  const [ok, setOk] = useState(false)
  const [message, setMessage] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    setDone(localStorage.getItem(KEY) === 'yes')
    setReady(true)
  }, [])

  const selectedProvider = PROVIDERS.find(p => p.id === provider)
  const providerName = lang === 'fr' ? selectedProvider?.fr : selectedProvider?.en
  const needsBackupSetup = mode === 'local' || mode === 'file-backup'

  const createBackupNow = async () => {
    try {
      if (!permission) {
        setMessage(t('Cochez d’abord l’autorisation de créer/télécharger un fichier de sauvegarde.', 'First check the permission to create/download a backup file.'))
        return
      }
      const label = locationLabel || providerName || 'backup'
      const result = await chooseBackupFolderAndSave(label)
      markBackupDone()
      setBackupPermissionGranted(true)
      setMessage(result.method === 'folder'
        ? t('Fichier créé dans le dossier choisi.', 'File created in the selected folder.')
        : t('Fichier téléchargé. Choisissez ensuite votre cloud ou dossier personnel pour le conserver.', 'File downloaded. Then choose your cloud or personal folder to keep it.'))
    } catch {
      setMessage(t('Création annulée ou bloquée par le navigateur.', 'Creation cancelled or blocked by the browser.'))
    }
  }

  const quickDownload = () => {
    if (!permission) {
      setMessage(t('Cochez d’abord l’autorisation de créer/télécharger un fichier de sauvegarde.', 'First check the permission to create/download a backup file.'))
      return
    }
    downloadBackupFile(locationLabel || providerName || 'backup')
    markBackupDone()
    setBackupPermissionGranted(true)
    setMessage(t('Fichier de sauvegarde téléchargé.', 'Backup file downloaded.'))
  }

  const handleImport = async (file?: File) => {
    if (!file) return
    try {
      await importBackupFile(file)
      setImportMessage(t('Sauvegarde importée. Fermez et rouvrez l’application pour recharger les données.', 'Backup imported. Close and reopen the app to reload data.'))
    } catch {
      setImportMessage(t('Fichier invalide ou import impossible.', 'Invalid file or import failed.'))
    }
  }

  const save = () => {
    if (!ok) return
    if (needsBackupSetup && !permission) {
      setMessage(t('Confirmez l’autorisation de sauvegarde avant de continuer.', 'Confirm backup permission before continuing.'))
      return
    }
    setStorageMode(mode)
    setBackupProvider(provider)
    setBackupLocationLabel(locationLabel || providerName || '')
    setBackupPermissionGranted(permission)
    localStorage.setItem(KEY, 'yes')
    localStorage.setItem('gcp-startup-storage-mode', mode)
    localStorage.setItem('gcp-startup-backup-provider', provider)
    localStorage.setItem('gcp-startup-backup-location', locationLabel || providerName || '')
    localStorage.setItem('gcp-startup-consent-date', new Date().toISOString())
    setDone(true)
  }

  if (!ready || done || !completed || pathname === '/onboarding') return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10002, overflowY: 'auto', background: '#030712', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 580, background: '#111827', border: '1px solid #22d3ee55', borderRadius: 24, padding: 18, color: 'white' }}>
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

        {needsBackupSetup && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)' }}>
            <p style={{ color: '#22d3ee', fontSize: 12, fontWeight: 950, marginBottom: 8 }}>📁 {t('Où voulez-vous garder vos sauvegardes ?', 'Where do you want to keep backups?')}</p>
            <select value={provider} onChange={e => setProvider(e.target.value as PersonalCloudProvider)} style={{ width: '100%', padding: 12, borderRadius: 12, background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,.18)', marginBottom: 8 }}>
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{lang === 'fr' ? p.fr : p.en}</option>)}
            </select>
            <input value={locationLabel} onChange={e => setLocationLabel(e.target.value)} placeholder={t('Nom du dossier ou note : ex. Google Drive / Chantier Pro', 'Folder name or note: e.g. Google Drive / Chantier Pro')} style={{ width: '100%', padding: 12, borderRadius: 12, background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,.18)', marginBottom: 8 }} />
            <p style={{ color: '#cbd5e1', fontSize: 11, lineHeight: 1.45, marginBottom: 8 }}>
              {supportsNativeDirectoryPicker()
                ? t('Ce navigateur peut demander de choisir un dossier. Sinon, l’app téléchargera un fichier que vous placerez dans votre cloud personnel.', 'This browser may ask you to choose a folder. Otherwise, the app downloads a file that you place in your personal cloud.')
                : t('Sur mobile/iPhone/Samsung, le navigateur télécharge souvent le fichier. Vous pourrez ensuite choisir iCloud, Google Drive, Samsung Files ou un autre dossier avec le menu de partage/fichiers.', 'On mobile/iPhone/Samsung, the browser often downloads the file. You can then choose iCloud, Google Drive, Samsung Files, or another folder using the share/files menu.')}
            </p>
            <label style={{ display: 'flex', gap: 10, fontSize: 12, color: '#e5e7eb', lineHeight: 1.4, marginBottom: 8 }}>
              <input type="checkbox" checked={permission} onChange={() => setPermission(v => !v)} style={{ width: 18, height: 18 }} />
              <span>{t('J’autorise l’application à créer ou télécharger un fichier de sauvegarde selon le choix de mon appareil/navigateur.', 'I authorize the app to create or download a backup file according to my device/browser choice.')}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={createBackupNow} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(34,211,238,.45)', background: 'rgba(34,211,238,.12)', color: '#a5f3fc', fontWeight: 950 }}>{t('Créer fichier', 'Create file')}</button>
              <button onClick={quickDownload} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(168,85,247,.45)', background: 'rgba(168,85,247,.12)', color: '#ddd6fe', fontWeight: 950 }}>{t('Télécharger', 'Download')}</button>
            </div>
            <label style={{ display: 'block', marginTop: 8, padding: 12, borderRadius: 12, border: '1px dashed rgba(255,255,255,.22)', color: '#cbd5e1', fontSize: 12, textAlign: 'center', cursor: 'pointer' }}>
              {t('Importer une sauvegarde existante', 'Import existing backup')}
              <input type="file" accept="application/json,.json" onChange={e => handleImport(e.target.files?.[0])} style={{ display: 'none' }} />
            </label>
            {message && <p style={{ color: '#93c5fd', fontSize: 11, marginTop: 8 }}>{message}</p>}
            {importMessage && <p style={{ color: '#86efac', fontSize: 11, marginTop: 8 }}>{importMessage}</p>}
          </div>
        )}

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
