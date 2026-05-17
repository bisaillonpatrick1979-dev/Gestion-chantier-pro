import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import OnboardingGuard from '@/components/OnboardingGuard'
import PWARegister from '@/components/PWARegister'

export const metadata: Metadata = {
  title: 'Gestion Chantier Pro',
  description: 'Application de gestion de chantier — Hailite Xteriors',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chantier Pro',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Gestion Chantier Pro',
    description: 'Hailite Xteriors — Gestion terrain',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#a855f7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* PWA iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chantier Pro" />
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[#08001a] min-h-screen overflow-x-hidden">
        <OnboardingGuard />
        <PWARegister />
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
