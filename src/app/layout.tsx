import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import ThemeInjector from '@/components/ThemeInjector'
import OnboardingGuard from '@/components/OnboardingGuard'

export const metadata: Metadata = {
  title: 'Gestion Chantier Pro',
  description: 'Application de gestion de chantier - Hailite Xteriors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <ThemeInjector />
          {/* Redirige vers /onboarding si c'est la première ouverture */}
          <OnboardingGuard />
          <Navbar />
          {children}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
