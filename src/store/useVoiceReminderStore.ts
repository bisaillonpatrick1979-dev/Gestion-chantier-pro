import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VoiceReminderState {
  enabled: boolean
  volume: number // 0 à 1
  setEnabled: (v: boolean) => void
  setVolume: (v: number) => void
}

export const useVoiceReminderStore = create<VoiceReminderState>()(
  persist(
    (set) => ({
      enabled: true,
      volume: 0.8,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume }),
    }),
    { name: 'voice-reminder-store-v1' }
  )
)

