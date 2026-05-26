'use client'

import React from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import InfernalBackground from '@/components/themes/infernal/InfernalBackground'
import InfernalEmbers from '@/components/themes/infernal/InfernalEmbers'
import InfernalPunchPanel from '@/components/themes/infernal/InfernalPunchPanel'
import InfernalPunchButton from '@/components/themes/infernal/InfernalPunchButton'

export const InfernoFlames = () => {
  const { themeId } = useThemeStore()
  if (themeId !== 'inferno') return null
  return <InfernalBackground />
}

export const AmbientEmbers = () => {
  const { themeId } = useThemeStore()
  if (themeId !== 'inferno') return null
  return <InfernalEmbers />
}

export function InfernoPunchWrapper({ children }: { active: boolean; children: React.ReactNode }) {
  const { themeId } = useThemeStore()
  if (themeId !== 'inferno') return <>{children}</>
  return (
    <InfernalPunchPanel>
      <InfernalPunchButton>{children}</InfernalPunchButton>
    </InfernalPunchPanel>
  )
}
