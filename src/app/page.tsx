'use client'
import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useProjectStore } from '@/store/useProjectStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { MaterialEntry } from '@/types/employee'
import { useLangStore } from '@/store/useLangStore'
import PunchInModal from '@/components/PunchInModal'
import PunchButton from '@/components/PunchButton'

type Screen = 'select' | 'pin' | 'dashboard'

// ── Effet shimmer or ──────────────────────────────────────────────────────────
const GoldRevenueCard = ({ revenue, isFr }: { revenue: number; isFr: boolean }) => {
  const formatted = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1200, #2a1f00, #1a1200)',
      border: '1px solid rgba(214,178,94,0.5)',
      borderRadius: '16px',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
    }}>
      {/* Shimmer animé */}
      <style>{`
        @keyframes goldShimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes coinFall {
          0% { transform: translateY(-20px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
        .gold-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.15) 50%, transparent 100%);
          animation: goldShimmer 2.5s infinite;
          pointer-events: none;
        }
        .coin { position: absolute; font-size: 14px; animation: coinFall 2s infinite; pointer-events: none; }
      `}</style>
      <div className="gold-shimmer" style={{ position: 'absolute', inset: 0 }} />

      {/* Pièces qui tombent */}
      {revenue > 0 && [
        { left: '15%', delay: '0s' },
        { left: '45%', delay: '0.8s' },
        { left: '75%', delay: '1.4s' },
      ].map((coin, i) => (
        <span key={i} className="coin" style={{ left: coin.left, top: 0, animationDelay: coin.delay }}>🪙</span>
      ))}

      <p style={{
        color: 'rgba(214,178,94,0.8)', fontSize: '10px',
        letterSpacing: '2px', fontWeight: '700', marginBottom: '6px',
        position: 'relative', zIndex: 1,
      }}>
        {isFr ? '💰 REVENUS' : '💰 REVENUE'}
      </p>
      <p style={{
        color: '#FFD700',
        fontSize: '36px',
        fontWeight: '900',
        lineHeight: 1,
        textAlign: 'right',
        textShadow: '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
        position: 'relative', zIndex: 1,
        fontFamily: 'monospace',
      }}>
        {formatted}
      </p>
      <p style={{
        color: 'rgba(214,178,94,0.6)', fontSize: '10px',
        textAlign: 'right', marginTop: '4px',
        position: 'relative', zIndex: 1,
      }}>CAD</p>
    </div>
  )
}

export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak, updateEmployee,
  } = useEmployeeStore()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const [screen, setScreen] = useState<Screen>('select')
  const [selectedId, setSelectedId] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [pinError, setPinError] = useState(false)
  const [showPunchModal, setShowPunchModal] = useState(false)
  const [punchModalMode, setPunchModalMode] = useState<'in' | 'out'>('in')
  const [showPunchOut, setShowPunchOut] = useState(false)
  const [materials, setMaterials] = useState<MaterialEntry[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState(false)
  const [tempRate, setTempRate] = useState('')

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const activeSession = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const isRunning = !!activeSession
  const isOnBreak = activeSession?.isOnBreak ?? false
  const activeProjectLog = currentEmployeeId ? getActiveLogForEmployee(currentEmployeeId) : null

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const handleSelectEmployee = (id: string) => { setSelectedId(id); setPin(''); setPinError(false); setScreen('pin') }

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) {
        setCurrentEmployee(selectedId); setScreen('dashboard'); setPinError(false)
      } else {
        setPinError(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 1000)
      }
    }
  }

  const handleLogout = () => { setCurrentEmployee(null); setScreen('select'); setPin(''); setSelectedId('') }

  const handlePunchIn = () => { if (!currentEmployeeId) return; setPunchModalMode('in'); setShowPunchModal(true) }
  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    if (activeProjectLog) { setPunchModalMode('out'); setShowPunchModal(true); return }
    if (currentEmployee?.workMode === 'surface') { setShowPunchOut(true) } else { punchOut(currentEmployeeId) }
  }

  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') { punchIn(currentEmployeeId) }
    else { punchOut(currentEmployeeId, materials); setMaterials([]) }
  }

  const handleConfirmPunchOut = () => {
    if (!currentEmployeeId) return
    punchOut(currentEmployeeId, materials); setShowPunchOut(false); setMaterials([])
  }

  const addMaterial = () => setMaterials([...materials, { id: Date.now().toString(), material: '', squareFeet: 0, pricePerSqFt: 0, total: 0 }])
  const updateMaterial = (id: string, field: string, value: string | number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== id) return m
      const updated = { ...m, [field]: value }
      updated.total = updated.squareFeet * updated.pricePerSqFt
      return updated
    }))
  }

  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month - 1, d))
    return days
  }

  const today = new Date().toISOString().split('T')[0]

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="metal-text" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px' }}>HAILITE XTERIORS</h1>
          <p style={{ color: theme.colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
            {t('Sélectionnez votre profil', 'Select your profile')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: employees.filter(e=>e.active).length > 3 ? '1fr 1fr' : '1fr', gap: '12px' }}>
          {employees.filter(e => e.active).map(emp => (
            <button key={emp.id} onClick={() => handleSelectEmployee(emp.id)} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px', borderRadius: '14px', cursor: 'pointer',
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card, textAlign: 'left' as const,
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`,
                boxShadow: `0 0 20px ${emp.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0,
              }}>{emp.name[0].toUpperCase()}</div>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '16px', fontWeight: '700' }}>{emp.name}</p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                </p>
              </div>
              {activeSessions[emp.id] && (
                <div style={{ marginLeft: 'auto', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── PIN ───────────────────────────────────────────────────────────────────
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '24px' }}>
        <button onClick={() => setScreen('select')} style={{ alignSelf: 'flex-start', color: theme.colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
          ← {t('Retour', 'Back')}
        </button>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: 'white', boxShadow: `0 0 30px ${emp?.color}66` }}>
          {emp?.name[0].toUpperCase()}
        </div>
        <p style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '700' }}>{emp?.name}</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: pin.length > i ? pinError ? '#ef4444' : theme.colors.primary : theme.colors.surface, border: `2px solid ${pinError ? '#ef4444' : theme.colors.border}`, transition: 'all 0.2s', boxShadow: pin.length > i ? `0 0 12px ${theme.colors.primary}` : 'none' }} />
          ))}
        </div>
        {pinError && <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%', maxWidth: '280px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button key={i} onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d !== '') handlePinDigit(d) }} style={{ height: '64px', borderRadius: '12px', cursor: d ? 'pointer' : 'default', border: `1px solid ${theme.colors.border}`, background: d ? theme.colors.card : 'transparent', color: theme.colors.text, fontSize: d === '⌫' ? '20px' : '24px', fontWeight: '700', opacity: d ? 1 : 0 }}>{d}</button>
          ))}
        </div>
      </div>
    )
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: currentEmployee?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: 'white' }}>
            {currentEmployee?.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>
              {currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              {activeProjectLog ? `🏗️ ${activeProjectLog.project.name}` : currentEmployee?.workMode}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textMuted, fontSize: '12px', fontWeight: '600' }}>
          {t('Déconnexion', 'Logout')}
        </button>
      </div>

      {/* ── CARTE PROJET EN COURS — agrandie + taux modifiable ── */}
      {activeProjectLog && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}18, ${theme.colors.primary}08)`,
          border: `1.5px solid ${theme.colors.primary}50`,
          borderRadius: '16px', padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: theme.colors.primary, fontSize: '10px', letterSpacing: '2px', fontWeight: '700', marginBottom: '6px' }}>
                🏗️ PROJET EN COURS
              </p>
              <p style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '900', lineHeight: 1.2 }}>
                {activeProjectLog.project.name}
              </p>
              <p style={{ color: theme.colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
                📍 {activeProjectLog.project.address}, {activeProjectLog.project.city}
              </p>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: '700' }}>🟢 ACTIF</p>
            </div>
          </div>

          {/* Taux — modifiable */}
          <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginBottom: '2px' }}>
                {activeProjectLog.project.payMode === 'hourly' ? t('Taux horaire', 'Hourly rate') :
                 activeProjectLog.project.payMode === 'job' ? t('À la job', 'Flat rate') : t('Au pi²', 'Per sqft')}
              </p>
              {editingRate ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={tempRate}
                    onChange={e => setTempRate(e.target.value)}
                    autoFocus
                    style={{ width: '80px', background: 'rgba(255,255,255,0.1)', border: `1px solid ${theme.colors.primary}`, borderRadius: '8px', padding: '6px 10px', color: 'white', fontSize: '20px', fontWeight: '900' }}
                  />
                  <span style={{ color: theme.colors.textMuted, fontSize: '14px' }}>$/h</span>
                  <button onClick={() => {
                    if (currentEmployeeId && tempRate) {
                      updateEmployee(currentEmployeeId, { hourlyRate: parseFloat(tempRate) })
                    }
                    setEditingRate(false)
                  }} style={{ background: theme.colors.primary, border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>✓</button>
                  <button onClick={() => setEditingRate(false)} style={{ background: 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '6px 10px', color: theme.colors.textMuted, cursor: 'pointer', fontSize: '13px' }}>✕</button>
                </div>
              ) : (
                <p style={{ color: 'white', fontSize: '24px', fontWeight: '900' }}>
                  {activeProjectLog.project.payMode === 'hourly' ? `$${activeProjectLog.log.hourlyRate}/h` :
                   activeProjectLog.project.payMode === 'job' ? `$${activeProjectLog.log.jobPay ?? 0}` :
                   `$${activeProjectLog.log.hourlyRate}/pi²`}
                </p>
              )}
            </div>
            {!editingRate && activeProjectLog.project.payMode === 'hourly' && (
              <button onClick={() => { setTempRate(String(activeProjectLog.log.hourlyRate)); setEditingRate(true) }}
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '8px 12px', color: theme.colors.textMuted, cursor: 'pointer', fontSize: '13px' }}>
                ✏️ {t('Modifier', 'Edit')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── REVENUS (OR) + TEMPS ── */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Revenus — or/doré */}
        <GoldRevenueCard revenue={activeSession?.revenue || 0} isFr={lang === 'fr'} />

        {/* Temps */}
        <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <p style={{ color: theme.colors.primary, fontSize: '10px', letterSpacing: '2px', fontWeight: '700', marginBottom: '8px', alignSelf: 'flex-start' }}>
            {t('⏱ TEMPS', '⏱ TIME')}
          </p>
          <p style={{ color: theme.colors.text, fontSize: '22px', fontWeight: '900', fontFamily: 'monospace', lineHeight: 1.1, textAlign: 'right' }}>
            {formatTimer(activeSession?.elapsed || 0)}
          </p>
          <p style={{ color: isOnBreak ? '#f97316' : isRunning ? '#22c55e' : theme.colors.textMuted, fontSize: '11px', marginTop: '4px', textAlign: 'right' }}>
            ⬤ {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}
          </p>
        </div>
      </div>

      {/* Punch Button — sans double affichage */}
      <PunchButton
        isRunning={isRunning}
        isOnBreak={isOnBreak}
        onPunch={isRunning ? handlePunchOut : handlePunchIn}
        elapsed={activeSession?.elapsed || 0}
        revenue={activeSession?.revenue || 0}
      />

      {/* Pause / Reprendre */}
      {isRunning && !isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: `2px solid ${theme.colors.warning}`, color: theme.colors.warning, background: 'transparent', padding: '12px 32px', fontSize: '15px', cursor: 'pointer', fontWeight: '700' }}>
            {t('☕ PAUSE', '☕ BREAK')}
          </button>
        </div>
      )}
      {isRunning && isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: `2px solid ${theme.colors.success}`, color: theme.colors.success, background: 'transparent', padding: '12px 32px', fontSize: '15px', cursor: 'pointer', fontWeight: '700' }}>
            {t('▶ REPRENDRE', '▶ RESUME')}
          </button>
        </div>
      )}

      {/* Modal Punch In/Out projet */}
      {showPunchModal && currentEmployee && (
        <PunchInModal
          employeeId={currentEmployee.id}
          employeeName={currentEmployee.name}
          employeeHourlyRate={currentEmployee.hourlyRate ?? 45}
          mode={punchModalMode}
          onComplete={handlePunchModalComplete}
          onCancel={() => setShowPunchModal(false)}
        />
      )}

      {/* Modal surface fallback */}
      {showPunchOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh', overflowY: 'auto' as const }}>
            <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>📐 {t('Matériaux posés', 'Materials installed')}</h2>
            {materials.map(m => (
              <div key={m.id} style={{ background: theme.colors.card, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={m.material} onChange={e => updateMaterial(m.id, 'material', e.target.value)} placeholder={t('Matériau...', 'Material...')}
                  style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '14px', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet} onChange={e => updateMaterial(m.id, 'squareFeet', Number(e.target.value))} placeholder="Pi²"
                    style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '14px' }} />
                  <input type="number" value={m.pricePerSqFt} onChange={e => updateMaterial(m.id, 'pricePerSqFt', Number(e.target.value))} placeholder="$/pi²"
                    style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '14px' }} />
                </div>
                <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>Total: {formatCurrency(m.total)}</p>
              </div>
            ))}
            <button onClick={addMaterial} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: `1px dashed ${theme.colors.primary}`, background: 'transparent', color: theme.colors.primary, fontSize: '13px', fontWeight: '700' }}>
              + {t('Ajouter un matériau', 'Add material')}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textMuted, fontSize: '14px', fontWeight: '700' }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: theme.colors.primary, color: 'white', fontSize: '14px', fontWeight: '700' }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m-2).toISOString().slice(0,7)) }}
            style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.text, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
          <p style={{ color: theme.colors.text, fontWeight: '700', fontSize: '14px', textTransform: 'capitalize' as const }}>{monthLabel}</p>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m).toISOString().slice(0,7)) }}
            style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.text, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {(lang === 'fr' ? ['Di','Lu','Ma','Me','Je','Ve','Sa'] : ['Su','Mo','Tu','We','Th','Fr','Sa']).map(d => (
            <div key={d} style={{ textAlign: 'center' as const, fontSize: '10px', color: theme.colors.textMuted, fontWeight: '700', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const dateKey = day.toISOString().split('T')[0]
            const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{ minHeight: '44px', borderRadius: '8px', border: isToday ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`, background: detail ? `${theme.colors.primary}22` : theme.colors.surface, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: isToday ? theme.colors.primary : theme.colors.textMuted, fontWeight: isToday ? '800' : '400' }}>{day.getDate()}</span>
                {detail && <span style={{ fontSize: '9px', color: theme.colors.secondary }}>{formatCurrency(detail.totalRevenue)}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div style={card}>
        <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '3px', fontWeight: '700', marginBottom: '12px' }}>{t('LÉGENDE', 'LEGEND')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { emoji: '⛱️', fr: 'Congé / Vacances',   en: 'Day off',      color: '#06b6d4', tint: 'rgba(6,182,212,0.15)'   },
            { emoji: '🌙', fr: 'Petite journée',      en: 'Short (< 4h)', color: '#64748b', tint: 'rgba(100,116,139,0.15)' },
            { emoji: '📋', fr: 'Journée moyenne',     en: 'Average (4-6h)',color: '#3b82f6', tint: 'rgba(59,130,246,0.15)'  },
            { emoji: '✅', fr: 'Journée normale',     en: 'Normal (6-8h)', color: '#22c55e', tint: 'rgba(34,197,94,0.15)'   },
            { emoji: '⭐', fr: 'Bonne journée',       en: 'Good (8-10h)',  color: '#eab308', tint: 'rgba(234,179,8,0.15)'   },
            { emoji: '🔥', fr: 'Grosse journée',      en: 'Big (10-12h)', color: '#f97316', tint: 'rgba(249,115,22,0.15)'  },
            { emoji: '💎', fr: 'Très grosse journée', en: 'Huge (12h+)',  color: '#a855f7', tint: 'rgba(168,85,247,0.15)'  },
          ].map(item => (
            <div key={item.emoji} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: item.tint, borderLeft: `3px solid ${item.color}`, borderRadius: '8px', padding: '10px 12px' }}>
              <span style={{ fontSize: '20px' }}>{item.emoji}</span>
              <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>{t(item.fr, item.en)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL DÉTAIL JOURNÉE — avec mode + taux + matériaux ── */}
      {selectedDay && (() => {
        const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${selectedDay}`] : null
        const emp = currentEmployee
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '85vh', overflowY: 'auto' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: theme.colors.primary, fontSize: '18px', fontWeight: '800' }}>📅 {selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} style={{ color: theme.colors.textMuted, background: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: '50%', cursor: 'pointer', fontSize: '18px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>

              {!detail ? (
                <p style={{ color: theme.colors.textMuted, textAlign: 'center' as const, padding: '20px' }}>
                  {t('Aucune donnée pour cette journée', 'No data for this day')}
                </p>
              ) : (
                <>
                  {/* Mode travail + taux */}
                  <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginBottom: '4px' }}>{t('Mode de travail', 'Work mode')}</p>
                      <p style={{ color: theme.colors.primary, fontSize: '15px', fontWeight: '800' }}>
                        {emp?.workMode === 'heure' ? `⏱️ ${t('À l\'heure', 'Hourly')}` :
                         emp?.workMode === 'surface' ? `📐 ${t('Au pi²', 'Per sqft')}` :
                         `💰 ${t('Forfait', 'Flat rate')}`}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginBottom: '4px' }}>
                        {emp?.workMode === 'heure' ? t('Taux horaire', 'Rate') : emp?.workMode === 'surface' ? '$/pi²' : t('Montant', 'Amount')}
                      </p>
                      <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: '900' }}>
                        ${emp?.hourlyRate ?? 0}{emp?.workMode === 'heure' ? '/h' : emp?.workMode === 'surface' ? '/pi²' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: t('Heures', 'Hours'),    value: `${detail.totalHours.toFixed(2)}h`,  color: theme.colors.primary   },
                      { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: '#FFD700'              },
                      { label: t('Pauses', 'Breaks'),   value: formatTimer(detail.totalBreak),       color: '#f97316'              },
                      { label: 'Sessions',              value: `${detail.sessions.length}`,          color: theme.colors.primaryLight },
                    ].map(item => (
                      <div key={item.label} style={{ background: theme.colors.card, borderRadius: '10px', padding: '16px', textAlign: 'center' as const }}>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '6px' }}>{item.label}</p>
                        <p style={{ color: item.color, fontSize: '20px', fontWeight: '800' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sessions */}
                  {detail.sessions.length > 0 && (
                    <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: theme.colors.primary, fontSize: '11px', marginBottom: '8px', letterSpacing: '2px', fontWeight: '700' }}>SESSIONS</p>
                      {detail.sessions.map((session, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                            {new Date(session.startTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                            {session.endTime && ` → ${new Date(session.endTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span style={{ color: theme.colors.secondary, fontSize: '12px', fontWeight: '700' }}>{formatTimer(session.elapsed)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matériaux pi² */}
                  {detail.materials && detail.materials.length > 0 && (
                    <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: theme.colors.primary, fontSize: '11px', marginBottom: '8px', letterSpacing: '2px', fontWeight: '700' }}>
                        📐 {t('MATÉRIAUX POSÉS', 'MATERIALS INSTALLED')}
                      </p>
                      {detail.materials.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '8px', marginBottom: '8px' }}>
                          <div>
                            <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '600' }}>{m.material}</p>
                            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                              {(m as unknown as Record<string,number>).squareFeet ?? (m as unknown as Record<string,number>).sqft ?? 0} pi² × ${(m as unknown as Record<string,number>).pricePerSqFt ?? (m as unknown as Record<string,number>).ratePerSqft ?? 0}/pi²
                            </p>
                          </div>
                          <span style={{ color: theme.colors.secondary, fontSize: '14px', fontWeight: '700' }}>
                            {formatCurrency(m.total)}
                          </span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                        <span style={{ color: theme.colors.textMuted, fontSize: '12px', fontWeight: '700' }}>Total pi²</span>
                        <span style={{ color: '#FFD700', fontSize: '15px', fontWeight: '900' }}>
                          {formatCurrency(detail.materials.reduce((s,m) => s + m.total, 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
