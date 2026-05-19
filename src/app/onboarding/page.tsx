'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { CANADA_PROVINCES, US_STATES, getTaxRate, getTaxLabel } from '@/lib/taxRates'

type Step = 1 | 2 | 3 | 4
type Lang = 'fr' | 'en'
type Country = 'CA' | 'US'

export default function OnboardingPage() {
  const router = useRouter()
  const { complete, completed, reset } = useOnboardingStore()
  const { setLang } = useLangStore()
  const { setCompany } = useCompanyStore()

  const [step, setStep]                       = useState<Step>(1)
  const [animKey, setAnimKey]                 = useState(0)
  const [animDir, setAnimDir]                 = useState<'fwd' | 'back'>('fwd')
  const [selectedLang, setSelectedLang]       = useState<Lang>('fr')
  const [selectedCountry, setSelectedCountry] = useState<Country>('CA')
  const [selectedProvince, setSelectedProvince] = useState('AB')

  useEffect(() => {
    if (completed) router.replace('/')
  }, [completed, router])

  const provinces = selectedCountry === 'CA' ? CANADA_PROVINCES : US_STATES
  const taxRate   = getTaxRate(selectedCountry, selectedProvince)
  const taxLabel  = getTaxLabel(selectedCountry, selectedProvince)
  const taxPct    = (taxRate * 100).toFixed(taxRate === 0.14975 ? 3 : taxRate === 0 ? 0 : 2).replace(/\.?0+$/, '')

  const t = (fr: string, en: string) => selectedLang === 'fr' ? fr : en

  function goTo(s: Step, dir: 'fwd' | 'back' = 'fwd') {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    setStep(s)
  }

  function selectLang(l: Lang) {
    setSelectedLang(l)
    goTo(2, 'fwd')
  }

  function selectCountry(c: Country) {
    setSelectedCountry(c)
    setSelectedProvince(c === 'CA' ? 'AB' : 'TX')
    goTo(3, 'fwd')
  }

  function handleComplete() {
    setLang(selectedLang)
    setCompany({ province: selectedProvince })
    complete({ lang: selectedLang, country: selectedCountry, province: selectedProvince })
    router.replace('/')
  }

  const currentRegion = provinces.find(p => p.code === selectedProvince)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #050210 0%, #130830 40%, #050210 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px', overflowY: 'auto',
    }}>
      <style>{`
        @keyframes ob_fwd  { from { opacity: 0; transform: translateX(40px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes ob_back { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ob_float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes ob_shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes ob_glow  { 0%,100% { opacity: 0.35; } 50% { opacity: 0.8; } }
        @keyframes ob_pulse { 0%,100% { box-shadow: 0 0 20px rgba(168,85,247,0.4); } 50% { box-shadow: 0 0 40px rgba(168,85,247,0.7); } }
        @keyframes ob_fade  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ob-fwd  { animation: ob_fwd  0.4s cubic-bezier(.22,.68,0,1.2) both; }
        .ob-back { animation: ob_back 0.4s cubic-bezier(.22,.68,0,1.2) both; }
        .ob-float { animation: ob_float 3.2s ease-in-out infinite; }
        .ob-shimmer { background: linear-gradient(90deg, #a855f7, #22d3ee, #a855f7); background-size: 200% auto; animation: ob_shimmer 3s linear infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .ob-btn-main { transition: all 0.15s; animation: ob_pulse 2.5s ease-in-out infinite; }
        .ob-btn-main:active { transform: scale(0.97); }
        .ob-choice { transition: all 0.15s; border-radius: 18px; cursor: pointer; display: flex; align-items: center; gap: 18px; padding: 20px; text-align: left; width: 100%; }
        .ob-choice:active { transform: scale(0.97); }
        .ob-lang-btn { transition: all 0.18s; cursor: pointer; border-radius: 20px; padding: 22px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; border: none; }
        .ob-lang-btn:active { transform: scale(0.96); }
        .ob-fade-1 { animation: ob_fade 0.5s ease 0.1s both; }
        .ob-fade-2 { animation: ob_fade 0.5s ease 0.25s both; }
        .ob-fade-3 { animation: ob_fade 0.5s ease 0.4s both; }
        .ob-fade-4 { animation: ob_fade 0.5s ease 0.55s both; }
      `}</style>

      {/* Étoiles de fond */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {['⭐','✨','💜','🔮','⚡','🌟','💫'].map((star, i) => (
          <div key={i} style={{
            position: 'absolute',
            left:  `${[8, 78, 42, 88, 22, 62, 50][i]}%`,
            top:   `${[18, 12, 80, 55, 88, 30, 65][i]}%`,
            fontSize: `${[14, 20, 12, 18, 14, 16, 10][i]}px`,
            opacity: 0.2,
            animation: `ob_glow ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
          }}>{star}</div>
        ))}
      </div>

      {/* Indicateur de progression */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
        {([1,2,3,4] as Step[]).map(s => (
          <div key={s} style={{
            height: '8px',
            width: s === step ? '28px' : '8px',
            borderRadius: '4px',
            background: s < step
              ? '#a855f7'
              : s === step
              ? 'linear-gradient(90deg, #a855f7, #22d3ee)'
              : 'rgba(168,85,247,0.15)',
            transition: 'all 0.35s cubic-bezier(.22,.68,0,1.2)',
            boxShadow: s === step ? '0 0 14px rgba(168,85,247,0.7)' : 'none',
          }}/>
        ))}
      </div>

      <div
        key={`step-${animKey}`}
        className={animDir === 'fwd' ? 'ob-fwd' : 'ob-back'}
        style={{
          width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1,
          background: 'rgba(14,6,32,0.96)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: '26px', padding: '36px 24px',
          boxShadow: '0 0 80px rgba(168,85,247,0.15), 0 30px 80px rgba(0,0,0,0.5)',
        }}
      >

        {/* ══ ÉTAPE 1 — BIENVENUE / WELCOME ══ */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>

            {/* Logo flottant */}
            <div className="ob-float ob-fade-1" style={{ fontSize: '72px', marginBottom: '20px', lineHeight: 1 }}>
              🏗️
            </div>

            {/* Nom de l'app */}
            <h1 className="ob-shimmer ob-fade-1" style={{
              fontSize: '18px', fontWeight: 900, letterSpacing: '3px',
              marginBottom: '4px',
            }}>
              GESTION CHANTIER PRO
            </h1>
            <p style={{ color: '#4c1d95', fontSize: '10px', letterSpacing: '3px', marginBottom: '20px', fontWeight: 700 }}>
              HAILITE XTERIORS
            </p>

            {/* Ligne décorative */}
            <div style={{
              width: '60px', height: '2px',
              background: 'linear-gradient(90deg, transparent, #a855f7, #22d3ee, transparent)',
              margin: '0 auto 24px',
            }}/>

            {/* Message bilingue */}
            <div className="ob-fade-2" style={{
              padding: '16px 20px',
              borderRadius: '16px',
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
              marginBottom: '28px',
            }}>
              <p style={{
                color: '#e9d5ff', fontSize: '16px', fontWeight: 800,
                marginBottom: '6px', lineHeight: 1.3,
              }}>
                Bienvenue · Welcome
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                Merci d'avoir choisi Gestion Chantier Pro.<br/>
                Thank you for choosing Gestion Chantier Pro.
              </p>
            </div>

            {/* Label langue */}
            <p className="ob-fade-3" style={{
              color: '#a855f7', fontSize: '11px', fontWeight: 800,
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Choisissez votre langue · Choose your language
            </p>

            {/* Boutons langue — sans drapeaux */}
            <div className="ob-fade-4" style={{ display: 'flex', gap: '12px' }}>

              {/* Français */}
              <button
                className="ob-lang-btn"
                onClick={() => selectLang('fr')}
                style={{
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.45)',
                }}
              >
                <span style={{
                  fontSize: '28px', fontWeight: 900,
                  background: 'linear-gradient(135deg, #a855f7, #c084fc)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '1px',
                }}>FR</span>
                <p style={{ color: '#e9d5ff', fontSize: '16px', fontWeight: 900, margin: 0 }}>Français</p>
                <p style={{ color: '#6b7280', fontSize: '10px', margin: 0 }}>Canada · Québec</p>
                <span style={{ color: '#a855f7', fontSize: '18px', marginTop: '4px' }}>→</span>
              </button>

              {/* English */}
              <button
                className="ob-lang-btn"
                onClick={() => selectLang('en')}
                style={{
                  background: 'rgba(34,211,238,0.06)',
                  border: '1px solid rgba(34,211,238,0.4)',
                }}
              >
                <span style={{
                  fontSize: '28px', fontWeight: 900,
                  background: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '1px',
                }}>EN</span>
                <p style={{ color: '#e9d5ff', fontSize: '16px', fontWeight: 900, margin: 0 }}>English</p>
                <p style={{ color: '#6b7280', fontSize: '10px', margin: 0 }}>Canada · USA</p>
                <span style={{ color: '#22d3ee', fontSize: '18px', marginTop: '4px' }}>→</span>
              </button>

            </div>

            <p style={{ color: '#2d1b6b', fontSize: '10px', marginTop: '20px', lineHeight: 1.5 }}>
              Modifiable dans ⚙️ Réglages · Changeable in ⚙️ Settings
            </p>
          </div>
        )}

        {/* ══ ÉTAPE 2 — PAYS ══ */}
        {step === 2 && (
          <div>
            <button onClick={() => goTo(1, 'back')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
              ← {t('Retour', 'Back')}
            </button>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px' }}>🌍</div>
              <h2 style={{ color: '#e9d5ff', fontSize: '22px', fontWeight: 900, margin: '0 0 8px' }}>
                {t('Où êtes-vous situés ?', 'Where are you located?')}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                {t('Pour configurer les taxes automatiquement', 'To configure taxes automatically')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="ob-choice" onClick={() => selectCountry('CA')} style={{ border: '1px solid rgba(168,85,247,0.45)', background: 'rgba(168,85,247,0.08)' }}>
                <span style={{ fontSize: '44px' }}>🇨🇦</span>
                <div>
                  <p style={{ color: '#e9d5ff', fontSize: '20px', fontWeight: 900, margin: 0 }}>Canada</p>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>GST 5% (AB) → HST 15% (ON/NB…)</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#a855f7', fontSize: '20px' }}>→</span>
              </button>
              <button className="ob-choice" onClick={() => selectCountry('US')} style={{ border: '1px solid rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.05)' }}>
                <span style={{ fontSize: '44px' }}>🇺🇸</span>
                <div>
                  <p style={{ color: '#e9d5ff', fontSize: '20px', fontWeight: 900, margin: 0 }}>United States</p>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>0% (AK/MT/OR) → 7.25% (CA)</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#22d3ee', fontSize: '20px' }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 — PROVINCE / ÉTAT ══ */}
        {step === 3 && (
          <div>
            <button onClick={() => goTo(2, 'back')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
              ← {t('Retour', 'Back')}
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>{selectedCountry === 'CA' ? '🍁' : '⭐'}</div>
              <h2 style={{ color: '#e9d5ff', fontSize: '20px', fontWeight: 900, margin: '0 0 6px' }}>
                {t(selectedCountry === 'CA' ? 'Votre province' : 'Votre état', selectedCountry === 'CA' ? 'Your province' : 'Your state')}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                {t('Les taxes s\'ajustent automatiquement', 'Taxes adjust automatically')}
              </p>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                {t(selectedCountry === 'CA' ? 'Province' : 'État', selectedCountry === 'CA' ? 'Province' : 'State')}
              </label>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.45)', borderRadius: '14px', color: '#e9d5ff', fontSize: '16px', fontWeight: 700, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                {provinces.map(p => (
                  <option key={p.code} value={p.code} style={{ background: '#12082a', color: '#e9d5ff' }}>
                    {p.flag} {selectedLang === 'fr' ? p.nameFr : p.nameEn} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '28px' }}>💰</span>
              <div>
                <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                  {t('Taxes configurées', 'Tax configured')}
                </p>
                <p style={{ color: '#e9d5ff', fontSize: '20px', fontWeight: 900, margin: 0, fontFamily: 'monospace' }}>
                  {taxPct}% — {taxLabel}
                </p>
                {currentRegion && (
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0 0' }}>
                    {selectedLang === 'fr' ? currentRegion.nameFr : currentRegion.nameEn}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => goTo(4, 'fwd')} className="ob-btn-main" style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: '1px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
              {t('Continuer →', 'Continue →')}
            </button>
          </div>
        )}

        {/* ══ ÉTAPE 4 — RÉSUMÉ / SUMMARY ══ */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div className="ob-float" style={{ fontSize: '70px', marginBottom: '16px', lineHeight: 1 }}>🚀</div>
            <h2 style={{ color: '#22c55e', fontSize: '24px', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>
              {t('Tout est prêt !', 'All set!')}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '28px', lineHeight: 1.5 }}>
              {t("Votre application est configurée et prête à l'emploi.", 'Your application is configured and ready to use.')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
              {[
                { icon: '🌐', label: t('Langue', 'Language'), value: selectedLang === 'fr' ? 'Français' : 'English', color: '#a855f7' },
                { icon: '🌍', label: t('Pays', 'Country'),    value: selectedCountry === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States', color: '#22d3ee' },
                { icon: '📍', label: t('Région', 'Region'),   value: currentRegion ? `${currentRegion.flag} ${selectedLang === 'fr' ? currentRegion.nameFr : currentRegion.nameEn} (${selectedProvince})` : selectedProvince, color: '#f59e0b' },
                { icon: '💰', label: t('Taxes', 'Tax Rate'),  value: `${taxPct}% — ${taxLabel}`, color: '#22c55e' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: '12px', background: `${item.color}12`, border: `1px solid ${item.color}33` }}>
                  <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700 }}>{item.icon} {item.label}</span>
                  <span style={{ color: item.color, fontSize: '13px', fontWeight: 800 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => goTo(3, 'back')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, margin: '0 auto 18px' }}>
              ← {t('Modifier la config', 'Edit configuration')}
            </button>
            <button onClick={handleComplete} className="ob-btn-main" style={{ width: '100%', padding: '22px', borderRadius: '18px', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 900, letterSpacing: '2px', background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #22d3ee 100%)', backgroundSize: '200% auto', color: 'white' }}>
              {t('🚀 DÉMARRER L\'APP', '🚀 LET\'S START!')}
            </button>
            <p style={{ color: '#4c1d95', fontSize: '11px', marginTop: '14px', lineHeight: 1.5 }}>
              {t('Vous pouvez modifier ces réglages à tout moment dans ⚙️ Réglages', 'You can change these settings anytime in ⚙️ Settings')}
            </p>
          </div>
        )}
      </div>

      <p style={{ color: '#2d1b6b', fontSize: '11px', letterSpacing: '2px', fontWeight: 700, marginTop: '24px', position: 'relative', zIndex: 1 }}>
        HAILITE XTERIORS © 2026
      </p>
    </div>
  )
            }
