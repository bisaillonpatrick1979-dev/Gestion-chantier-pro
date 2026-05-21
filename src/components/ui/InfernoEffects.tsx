'use client'

import React from 'react'

interface InfernoFlamesProps {
  active: boolean
  buttonSize?: number
}

export const InfernoFlames: React.FC<InfernoFlamesProps> = () => null

export const AmbientEmbers: React.FC = () => null

interface InfernoPunchWrapperProps {
  active: boolean
  children: React.ReactNode
}

export const InfernoPunchWrapper: React.FC<InfernoPunchWrapperProps> = ({ children }) => {
  return <>{children}</>
}
