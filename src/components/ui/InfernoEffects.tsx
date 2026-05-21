'use client'

import React from 'react'

export const InfernoFlames = () => null
export const AmbientEmbers = () => null

export function InfernoPunchWrapper({ children }: { active: boolean; children: React.ReactNode }) {
  return <>{children}</>
}
