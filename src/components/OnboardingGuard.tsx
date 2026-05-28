'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/store/useOnboardingStore'

export default function OnboardingGuard() {
  const { completed } = useOnboardingStore()
  const router        = useRouter()
  const pathname      = usePathname()

  useEffect(() => {
    const publicPaths = ['/onboarding', '/recovery']

    // Redirige vers l'onboarding si pas complété, sauf pour la récupération d'accès.
    if (!completed && !publicPaths.includes(pathname)) {
      router.replace('/onboarding')
    }
  }, [completed, pathname, router])

  return null
}
