'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { PAYROLL_LAST_UPDATED, PAYROLL_PACKAGE_VERSION } from '@/lib/payrollrates'

const INSTALLED_PACKAGE = PAYROLL_PACKAGE_VERSION

type Manifest = {
  latestPublishedPackage?: string
  latestEffectiveDate?: string
  nextRequiredReview?: string
  validationNoticeFr?: string
  validationNoticeEn?: string
}

export default function PayrollManifestWatcher() {
  const pathname = usePathname()
  const { lang } = useLangStore()
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [checkedAt, setCheckedAt] = useState('')
  const [error, setError] = useState('')
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    if (pathname !== '/payroll-compliance') return
    checkManifest()
  }, [pathname])

  async function checkManifest() {
    setError('')
    try {
      const res = await fetch(`/payroll-rules/manifest.json?ts=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('manifest')
      const data = await res.json()
      setManifest(data)
      const now = new Date().toISOString()
      setCheckedAt(now)
      localStorage.setItem('payroll-manifest-last-check', now)
      localStorage.setItem('payroll-manifest-last-result', JSON.stringify(data))
    } catch {
      setError(t('Manifeste de mise à jour non disponible. Vérifiez Internet ou redeployez.', 'Update manifest unavailable. Check internet or redeploy.'))
    }
  }

  if (pathname !== '/payroll-compliance') return null

  const latest = manifest?.latestPublishedPackage || '—'
  const effective = manifest?.latestEffectiveDate || '—'
  const review = manifest?.nextRequiredReview || '—'
  const updateAvailable = Boolean(manifest && latest !== INSTALLED_PACKAGE)

  return (
    <div style={{ position: 'fixed', left: 12, right: 12, top: 70, zIndex: 90, pointerEvents: 'none' }}>
      <section style={{ pointerEvents: 'auto', maxWidth: 560, margin: '0 auto', borderRadius: 20, padding: 14, background: updateAvailable ? 'rgba(245,158,11,.96)' : 'rgba(6,78,59,.96)', color: 'white', border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 16px 40px rgba(0,0,0,.45)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 14 }}>{updateAvailable ? `⚠️ ${t('Mise à jour paie disponible', 'Payroll update available')}` : `✅ ${t('Paquet paie à jour', 'Payroll package current')}`}</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45 }}>
              {t('Installé', 'Installed')}: {INSTALLED_PACKAGE} · {t('Publié', 'Published')}: {latest} · {t('En vigueur', 'Effective')}: {effective}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, opacity: .9 }}>
              {t('Mise à jour locale', 'Local update')}: {PAYROLL_LAST_UPDATED} · {t('Révision requise', 'Required review')}: {review}
            </p>
            {error && <p style={{ margin: '6px 0 0', fontSize: 11 }}>{error}</p>}
            {checkedAt && <p style={{ margin: '6px 0 0', fontSize: 10, opacity: .78 }}>{t('Vérifié', 'Checked')}: {checkedAt.slice(0, 10)}</p>}
          </div>
          <button onClick={checkManifest} style={{ border: '1px solid rgba(255,255,255,.35)', background: 'rgba(0,0,0,.18)', color: 'white', borderRadius: 999, padding: '8px 10px', fontSize: 11, fontWeight: 900 }}>
            {t('Revérifier', 'Recheck')}
          </button>
        </div>
      </section>
    </div>
  )
}
