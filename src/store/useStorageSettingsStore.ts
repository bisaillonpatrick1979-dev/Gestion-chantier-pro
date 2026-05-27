import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StorageMode = 'local' | 'file-backup' | 'supabase'
export type BackupReminderFrequency = 'off' | '12h' | '24h' | 'weekly'
export type PersonalCloudProvider = 'device' | 'icloud' | 'google-drive' | 'samsung-files' | 'onedrive' | 'other'

interface StorageSettingsState {
  storageMode: StorageMode
  cloudSyncEnabled: boolean
  backupReminderFrequency: BackupReminderFrequency
  lastBackupAt: string | null
  backupProvider: PersonalCloudProvider
  backupLocationLabel: string
  backupPermissionGranted: boolean
  setStorageMode: (mode: StorageMode) => void
  setBackupReminderFrequency: (frequency: BackupReminderFrequency) => void
  setBackupProvider: (provider: PersonalCloudProvider) => void
  setBackupLocationLabel: (label: string) => void
  setBackupPermissionGranted: (granted: boolean) => void
  markBackupDone: () => void
}

export const useStorageSettingsStore = create<StorageSettingsState>()(
  persist(
    (set) => ({
      storageMode: 'local',
      cloudSyncEnabled: false,
      backupReminderFrequency: '24h',
      lastBackupAt: null,
      backupProvider: 'device',
      backupLocationLabel: '',
      backupPermissionGranted: false,
      setStorageMode: (mode) => set({ storageMode: mode, cloudSyncEnabled: mode === 'supabase' }),
      setBackupReminderFrequency: (frequency) => set({ backupReminderFrequency: frequency }),
      setBackupProvider: (provider) => set({ backupProvider: provider }),
      setBackupLocationLabel: (label) => set({ backupLocationLabel: label }),
      setBackupPermissionGranted: (granted) => set({ backupPermissionGranted: granted }),
      markBackupDone: () => set({ lastBackupAt: new Date().toISOString() }),
    }),
    { name: 'storage-settings-v1' }
  )
)

export function isCloudSyncEnabledFromStorage() {
  if (typeof window === 'undefined') return false

  try {
    const raw = window.localStorage.getItem('storage-settings-v1')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.state?.cloudSyncEnabled === true || parsed?.state?.storageMode === 'supabase'
  } catch {
    return false
  }
}
