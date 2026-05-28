export const BACKUP_VERSION = '1.0'
export const BACKUP_SCHEMA_VERSION = '2026.supabase.beta.1'

const STORAGE_KEYS = [
  'employee-store-v1',
  'client-store-v1',
  'document-store-v1',
  'project-store-v1',
  'catalogue-store-v1',
  'company-store-v1',
  'employee-invoice-store-v1',
  'payroll-rules-store-v1',
  'goal-store-v1',
  'theme-store-v1',
  'lang-store-v1',
  'onboarding-store-v1',
  'storage-settings-v1',
  'gcp-legal-consent-v2',
  'gcp-startup-consent-v1',
]

export function buildBackupPayload() {
  const data: Record<string, string | null> = {}

  STORAGE_KEYS.forEach((key) => {
    data[key] = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
  })

  return {
    app: 'Gestion Chantier Pro',
    version: BACKUP_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    company_id: typeof window !== 'undefined' ? window.localStorage.getItem('gcp-active-company-id') : null,
    installation_id: typeof window !== 'undefined' ? window.localStorage.getItem('gcp-installation-id') : null,
    exportedAt: new Date().toISOString(),
    storage: data,
  }
}

export function downloadBackupFile(providerLabel?: string) {
  const payload = buildBackupPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const suffix = providerLabel ? providerLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase() : 'backup'
  const link = document.createElement('a')

  link.href = url
  link.download = `gestion-chantier-pro-${suffix}-${date}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function importBackupFile(file: File) {
  const text = await file.text()
  const payload = JSON.parse(text)

  if (payload?.app !== 'Gestion Chantier Pro' || !payload?.storage) {
    throw new Error('Invalid backup file')
  }

  Object.entries(payload.storage as Record<string, string | null>).forEach(([key, value]) => {
    if (!STORAGE_KEYS.includes(key)) return
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  })
}

export function supportsNativeDirectoryPicker() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export async function chooseBackupFolderAndSave(providerLabel: string) {
  const win = window as unknown as {
    showDirectoryPicker?: () => Promise<{ getFileHandle: (name: string, options: { create: boolean }) => Promise<{ createWritable: () => Promise<{ write: (content: string) => Promise<void>; close: () => Promise<void> }> }> }>
  }

  if (!win.showDirectoryPicker) {
    downloadBackupFile(providerLabel)
    return { method: 'download' as const }
  }

  const dir = await win.showDirectoryPicker()
  const date = new Date().toISOString().slice(0, 10)
  const fileHandle = await dir.getFileHandle(`gestion-chantier-pro-backup-${date}.json`, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(buildBackupPayload(), null, 2))
  await writable.close()
  return { method: 'folder' as const }
}
