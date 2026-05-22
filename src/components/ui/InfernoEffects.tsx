'use client'

import React from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export const InfernoFlames = () => null
export const AmbientEmbers = () => null

export function InfernoPunchWrapper({ children }: { active: boolean; children: React.ReactNode }) {
  return <>{children}</>
}
