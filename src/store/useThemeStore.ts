import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, getTheme, DEFAULT_THEME_ID } from '@/lib/themes'

const normalizeThemeId = (id: string) => (id === 'inferno' ? DEFAULT_THEME_ID : id)

interface ThemeStore {
  themeId: string
  theme: Theme
  setTheme: (id: string) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      themeId: DEFAULT_THEME_ID,
      theme: getTheme(DEFAULT_THEME_ID),
      setTheme: id => {
        const safeId = normalizeThemeId(id)
        set({
          themeId: safeId,
          theme: getTheme(safeId),
        })
      },
    }),
    {
      name: 'gcp-theme',
      onRehydrateStorage: () => state => {
        if (state?.themeId === 'inferno') {
          state.setTheme(DEFAULT_THEME_ID)
        }
      },
    }
  )
)
