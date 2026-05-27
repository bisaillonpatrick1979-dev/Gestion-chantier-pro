'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useOnboardingStore } from '@/store/useOnboardingStore'

const STORAGE_KEY = 'gcp-legal-consent-v2'
const VERSION = '2.0'

type ConsentItem = {
  titleFr: string
  titleEn: string
  detailFr: string
  detailEn: string
  link?: string
  linkFr?: string
  linkEn?: string
}

const CONSENTS: ConsentItem[] = [
  {
    titleFr: 'J’accepte les conditions d’utilisation et la politique de confidentialité.',
    titleEn: 'I accept the terms of use and privacy policy.',
    detailFr: 'Les conditions expliquent les règles d’utilisation de l’application. La politique de confidentialité explique quelles données peuvent être utilisées, pourquoi, et selon quel mode de sauvegarde.',
    detailEn: 'The terms explain the app usage rules. The privacy policy explains what data may be used, why, and under which backup mode.',
    link: '/terms',
    linkFr: 'Lire les conditions',
    linkEn: 'Read terms',
  },
  {
    titleFr: 'Je comprends que des données peuvent être enregistrées localement sur mon appareil.',
    titleEn: 'I understand that data may be stored locally on my device.',
    detailFr: 'En mode local, les données restent dans ce téléphone, cette tablette ou ce navigateur. Si l’appareil ou les données du navigateur sont effacés, les données peuvent être perdues sans sauvegarde.',
    detailEn: 'In local mode, data stays on this phone, tablet, or browser. If the device or browser data is cleared, data may be lost without backup.',
  },
  {
    titleFr: 'Je comprends que la synchronisation, si activée, peut envoyer des données vers une base cloud.',
    titleEn: 'I understand that sync, when enabled, may send data to a cloud database.',
    detailFr: 'Le cloud est utilisé seulement si vous choisissez ou activez la synchronisation. Il peut servir à récupérer les données, utiliser plusieurs appareils ou gérer une équipe.',
    detailEn: 'Cloud is used only if you choose or enable sync. It can help recover data, use multiple devices, or manage a team.',
    link: '/privacy',
    linkFr: 'Lire confidentialité',
    linkEn: 'Read privacy',
  },
  {
    titleFr: 'Je confirme avoir l’autorisation de gérer les données que j’entre dans l’application.',
    titleEn: 'I confirm I am authorized to manage the data I enter in the app.',
    detailFr: 'Vous confirmez que vous avez le droit d’ajouter et gérer les informations de compagnie, clients, employés, sous-traitants, photos, documents, heures et montants.',
    detailEn: 'You confirm that you have the right to add and manage company, client, employee, subcontractor, photo, document, time, and amount information.',
  },
  {
    titleFr: 'Je comprends que les calculs doivent être vérifiés par un professionnel qualifié.',
    titleEn: 'I understand that calculations should be verified by a qualified professional.',
    detailFr: 'Les calculs de paie, taxes, retenues, profits, devis et rapports sont des aides de gestion. Ils doivent être vérifiés avant usage officiel.',
    detailEn: 'Payroll, tax, deduction, profit, estimate, and report calculations are management aids. They should be verified before official use.',
  },
  {
    titleFr: 'Je comprends que les permissions caméra, photos, notifications ou GPS seront demandées seulement au besoin.',
    titleEn: 'I understand that camera, photo, notification, or GPS permissions will be requested only when needed.',
    detailFr: 'Ces permissions ne sont demandées que lorsqu’une fonction les utilise, par exemple ajouter une photo, activer un rappel ou utiliser le géofencing.',
    detailEn: 'These permissions are requested only when a feature uses them, such as adding a photo, enabling a reminder, or using geofencing.',
  },
]

export default function LegalConsentGate() {
  const pathname = usePathname()
  const { lang } = useLangStore()
  const { completed } = useOnboardingStore()
  const [ready, setReady] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [checks, setChecks] = useState<boolean[]>(CONSENTS.map(() => false))
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const saved = raw ? JSON.parse(raw) : null
      setAccepted(saved?.accepted === true && saved?.version === VERSION)
    } catch {
      setAccepted(false)
    } finally {
      setReady(true)
    }
  }, [])

  const allChecked = checks.every(Boolean)
  const toggle = (index: number) => setChecks(values => values.map((value, i) => i === index ? !value : value))

  const accept = () => {
    if (!allChecked) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, version: VERSION, acceptedAt: new Date().toISOString() }))
    setAccepted(true)
  }

  if (!ready || accepted || !completed || pathname === '/onboarding') return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, overflowY: 'auto', background: 'linear-gradient(160deg,#050210,#16082f)', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560, borderRadius: 26, padding: 20, background: 'rgba(12,5,28,.98)', border: '1px solid rgba(168,85,247,.36)', boxShadow: '0 30px 90px rgba(0,0,0,.58)' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 42 }}>🔐</div>
          <h1 style={{ color: '#f5e8ff', fontSize: 22, fontWeight: 950, margin: '6px 0' }}>{t('Consentement', 'Consent')}</h1>
          <p style={{ color: '#a78bfa', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{t('Cliquez sur chaque point pour lire l’explication, puis cochez si vous acceptez.', 'Tap each item to read the explanation, then check it if you agree.')}</p>
        </div>

        <div style={{ display: 'grid', gap: 9, marginBottom: 14 }}>
          {CONSENTS.map((item, index) => {
            const open = openIndex === index
            return (
              <div key={item.titleFr} style={{ borderRadius: 14, background: checks[index] ? 'rgba(34,211,238,.10)' : 'rgba(255,255,255,.045)', border: checks[index] ? '1px solid rgba(34,211,238,.36)' : '1px solid rgba(255,255,255,.10)', color: '#e9d5ff' }}>
                <button type="button" onClick={() => setOpenIndex(open ? null : index)} style={{ width: '100%', display: 'flex', gap: 10, padding: 12, background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checks[index]} onChange={(e) => { e.stopPropagation(); toggle(index) }} onClick={(e) => e.stopPropagation()} style={{ marginTop: 2, width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 12, lineHeight: 1.45, fontWeight: 800 }}>{lang === 'fr' ? item.titleFr : item.titleEn}</span>
                  <span style={{ color: '#22d3ee', fontWeight: 950 }}>{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div style={{ padding: '0 12px 12px 40px', color: '#c4b5fd', fontSize: 12, lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>{lang === 'fr' ? item.detailFr : item.detailEn}</p>
                    {item.link && <Link href={item.link} style={{ display: 'inline-block', marginTop: 8, color: '#22d3ee', fontWeight: 900 }}>{lang === 'fr' ? item.linkFr : item.linkEn}</Link>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p style={{ color: '#7c6aa8', fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>{t('Nous appliquons des mesures strictes pour protéger l’accès aux données.', 'We apply strict measures to protect data access.')}</p>
        <button onClick={accept} disabled={!allChecked} style={{ width: '100%', padding: 16, borderRadius: 18, border: 'none', cursor: allChecked ? 'pointer' : 'not-allowed', opacity: allChecked ? 1 : .42, color: 'white', fontSize: 15, fontWeight: 950, background: 'linear-gradient(135deg,#7c3aed,#a855f7,#22d3ee)' }}>{t('J’accepte et je continue', 'I accept and continue')}</button>
      </div>
    </div>
  )
}
