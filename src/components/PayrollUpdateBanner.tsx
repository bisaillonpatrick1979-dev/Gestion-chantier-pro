'use client'

import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

const PAYROLL_YEAR = 2026
const PAYROLL_NEXT_UPDATE = '2027-01-01'
const BANNER_KEY = `payroll-banner-dismissed-${PAYROLL_YEAR}`

export default function PayrollUpdateBanner() {
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'
  const isQuantum = themeId === 'quantum'

  const [show, setShow] = useState(false)

  useEffect(() => {
    const today = new Date()
    const nextUpdate = new Date(PAYROLL_NEXT_UPDATE)
    const dismissed = localStorage.getItem(BANNER_KEY)
    if (dismissed) return
    const daysUntil = Math.floor((nextUpdate.getTime() - today.getTime()) / 86400000)
    const daysPast  = Math.floor((today.getTime() - nextUpdate.getTime()) / 86400000)
    if ((daysUntil >= 0 && daysUntil <= 7) || (daysPast >= 0 && daysPast <= 30)) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const isPast = new Date() >= new Date(PAYROLL_NEXT_UPDATE)

  return (
    <div className={`mx-4 mt-2 rounded-2xl p-4 border flex gap-3 items-start
      ${isDeco ? 'bg-[#1a1500]/90 border-[#D6B25E]/40'
        : isQuantum ? 'bg-[#0a0015]/90 border-violet-500/40'
        : 'bg-orange-950/80 border-orange-500/40'}`}>
      <div className="text-2xl flex-shrink-0">{isPast ? '🚨' : '🔔'}</div>
      <div className="flex-1">
        <div className={`font-bold text-sm mb-1
          ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-orange-300'}`}>
          {isPast
            ? t('Mise à jour des taux de paie requise', 'Payroll Rates Update Required')
            : t('Rappel — Taux de paie à vérifier bientôt', 'Reminder — Payroll Rates Update Soon')}
        </div>
        <div className="text-white/60 text-xs leading-relaxed">
          {t(
            `Les taux CPP, AE et impôts changent le 1er janvier. Taux actuels : ${PAYROLL_YEAR}. Mettre à jour src/lib/payrollrates.ts avec les chiffres de l'ARC.`,
            `CPP, EI and tax rates change January 1st. Current rates: ${PAYROLL_YEAR}. Update src/lib/payrollrates.ts with new CRA figures.`
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll.html"
            target="_blank" rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold
              ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]'
                : isQuantum ? 'bg-violet-500/20 text-violet-300'
                : 'bg-orange-500/20 text-orange-300'}`}>
            🔗 {t('Site ARC', 'CRA Website')}
          </a>
          <button
            onClick={() => { localStorage.setItem(BANNER_KEY, '1'); setShow(false) }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white/60">
            {t('Compris ✓', 'Got it ✓')}
          </button>
        </div>
      </div>
    </div>
  )
}
