'use client'

import { useRouter } from 'next/navigation'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import ShareAppButton from '@/components/ShareAppButton'

const APP_VERSION = '0.1.0'
const BUILD_LABEL = 'MVP local / Supabase-ready'
const CREATED_BY = 'Hailite Apps'

export default function AboutPage() {
  const router = useRouter()
  const { lang } = useLangStore()
  const { theme, themeId } = useThemeStore()
  const isDeco = themeId === 'deco'
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const cardStyle = {
    background: isDeco ? 'rgba(13,10,0,0.84)' : theme.colors.card,
    border: isDeco ? '1px solid rgba(214,178,94,0.26)' : `1px solid ${theme.colors.border}`,
    borderRadius: 20,
    padding: 18,
    boxShadow: '0 10px 28px rgba(0,0,0,0.34)',
  }

  const muted = isDeco ? 'rgba(214,178,94,0.62)' : theme.colors.textMuted
  const titleColor = isDeco ? '#D6B25E' : theme.colors.text
  const accent = isDeco ? '#D6B25E' : theme.colors.primary

  return (
    <div className="min-h-screen pb-24 pt-4 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white"
          >
            ← {t('Retour', 'Back')}
          </button>
          <ShareAppButton />
        </div>

        <section style={cardStyle}>
          <h1 style={{ color: titleColor, fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
            ℹ️ {t('À propos de l’application', 'About the app')}
          </h1>
          <p style={{ color: muted, fontSize: 13, lineHeight: 1.6 }}>
            {t(
              'Gestion Chantier Pro est une application de gestion terrain pour entrepreneurs : temps, employés, clients, projets, catalogue, facturation et suivi de chantier.',
              'Gestion Chantier Pro is a field management app for contractors: time, employees, clients, projects, catalog, invoicing, and jobsite tracking.'
            )}
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: accent, fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
            🧾 {t('Informations', 'Information')}
          </h2>
          <div className="space-y-3 text-sm">
            <InfoRow label={t('Nom', 'Name')} value="Gestion Chantier Pro" color={titleColor} muted={muted} />
            <InfoRow label={t('Version', 'Version')} value={APP_VERSION} color={titleColor} muted={muted} />
            <InfoRow label={t('Build', 'Build')} value={BUILD_LABEL} color={titleColor} muted={muted} />
            <InfoRow label={t('Créé par', 'Created by')} value={CREATED_BY} color={titleColor} muted={muted} />
            <InfoRow label={t('Type', 'Type')} value={t('Outil de gestion de chantier', 'Jobsite management tool')} color={titleColor} muted={muted} />
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: accent, fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
            🔐 {t('Confidentialité et données', 'Privacy and data')}
          </h2>
          <p style={{ color: muted, fontSize: 13, lineHeight: 1.65 }}>
            {t(
              'L’application peut stocker des informations de chantier, clients, employés, paie approximative, factures et projets. Les données peuvent être conservées localement dans le navigateur et, si configuré, synchronisées avec Supabase.',
              'The app may store jobsite, client, employee, approximate payroll, invoice, and project information. Data may be stored locally in the browser and, when configured, synchronized with Supabase.'
            )}
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: accent, fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
            ⚖️ {t('Notes légales', 'Legal notes')}
          </h2>
          <p style={{ color: muted, fontSize: 13, lineHeight: 1.65 }}>
            {t(
              'Les calculs de paie, taxes, déductions, estimations et rapports sont fournis comme aide de gestion. Ils doivent être vérifiés par un comptable, fiscaliste ou professionnel qualifié avant usage officiel.',
              'Payroll, tax, deduction, estimate, and reporting calculations are provided as management aids. They should be verified by an accountant, tax professional, or qualified professional before official use.'
            )}
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: accent, fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
            📣 {t('Partager l’application', 'Share the app')}
          </h2>
          <p style={{ color: muted, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>
            {t(
              'Utilisez le bouton ci-dessous pour envoyer le lien de l’application à un collègue, un ami ou un autre entrepreneur.',
              'Use the button below to send the app link to a colleague, friend, or another contractor.'
            )}
          </p>
          <ShareAppButton />
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value, color, muted }: { label: string; value: string; color: string; muted: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
      <span style={{ color: muted, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ color, fontSize: 13, fontWeight: 800, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
