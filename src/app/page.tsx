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
import {
  DecoSeparator,
  DecoCorners,
  DecoTitle,
  DecoOrnament,
  DecoBackground,
  DecoDiamondRow,
  DecoStarRow,
  DecoFlower,
} from '@/components/DecoElements'

type Screen = 'select' | 'pin' | 'dashboard'

export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak, updateEmployee,
  } = useEmployeeStore()
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'

  const [screen, setScreen] = useState<Screen>('select')
  const [selectedId, setSelectedId] = useState('')
  const [pin, setPin] = useState('')
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
  const today = new Date().toISOString().split('T')[0]

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  }

  const handleSelectEmployee = (id: string) => { setSelectedId(id); setPin(''); setPinError(false); setScreen('pin') }
  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) { setCurrentEmployee(selectedId); setScreen('dashboard'); setPinError(false) }
      else { setPinError(true); setTimeout(() => { setPin(''); setPinError(false) }, 1000) }
    }
  }
  const handleLogout = () => { setCurrentEmployee(null); setScreen('select'); setPin(''); setSelectedId('') }
  const handlePunchIn = () => { if (!currentEmployeeId) return; setPunchModalMode('in'); setShowPunchModal(true) }
  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    if (activeProjectLog) { setPunchModalMode('out'); setShowPunchModal(true); return }
    if (currentEmployee?.workMode === 'surface') setShowPunchOut(true)
    else punchOut(currentEmployeeId)
  }
  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') punchIn(currentEmployeeId)
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

  // ══ SÉLECTION ══════════════════════════════════════════════════════════════
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
        <style>{`
          .emp-card:active { transform: scale(0.97); }
          .emp-card { transition: transform 0.15s ease; }
        `}</style>

        {/* Ornement haut */}
        <DecoOrnament opacity={0.15}/>

        <div style={{ textAlign: 'center' }}>
          <h1 className="metal-text" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '4px' }}>
            HAILITE XTERIORS
          </h1>
          <DecoDiamondRow count={5} opacity={0.3}/>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {t('Sélectionnez votre profil', 'Select your profile')}
          </p>
        </div>

        <DecoSeparator opacity={0.25}/>

        <div style={{
          display: 'grid',
          gridTemplateColumns: employees.filter(e => e.active).length > 3 ? '1fr 1fr' : '1fr',
          gap: '10px',
        }}>
          {employees.filter(e => e.active).map((emp, idx) => (
            <button key={emp.id} className="emp-card" onClick={() => handleSelectEmployee(emp.id)} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px', borderRadius: '14px', cursor: 'pointer',
              border: '1px solid var(--border)',
              background: 'var(--card)', textAlign: 'left' as const,
              position: 'relative', overflow: 'hidden',
            }}>
              <DecoBackground/>
              <DecoCorners opacity={0.3}/>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                background: `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`,
                boxShadow: `0 0 18px ${emp.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 800, color: 'white',
                position: 'relative', zIndex: 1,
              }}>{emp.name[0].toUpperCase()}</div>
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <p style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 700 }}>{emp.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                </p>
              </div>
              {activeSessions[emp.id] && (
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0, position: 'relative', zIndex: 1 }}/>
              )}
            </button>
          ))}
        </div>

        <DecoSeparator opacity={0.2}/>

        {/* Ornement bas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.2 }}>
          <DecoFlower size={35} opacity={1}/>
          <DecoFlower size={50} opacity={1}/>
          <DecoFlower size={35} opacity={1}/>
        </div>

        <p style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '3px', color: 'var(--text-weak)', fontWeight: 700 }}>
          🔒 {t('CONNECTEZ-VOUS POUR ACCÉDER', 'LOGIN TO ACCESS')}
        </p>
      </div>
    )
  }

  // ══ PIN ════════════════════════════════════════════════════════════════════
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingTop: '16px' }}>
        <button onClick={() => setScreen('select')} style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
          ← {t('Retour', 'Back')}
        </button>

        <DecoOrnament opacity={0.12}/>

        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white', boxShadow: `0 0 30px ${emp?.color}66` }}>
          {emp?.name[0].toUpperCase()}
        </div>

        <p style={{ color: 'var(--text)', fontSize: '17px', fontWeight: 700, letterSpacing: '2px' }}>{emp?.name}</p>
        <DecoDiamondRow count={5} opacity={0.3}/>

        <div style={{ display: 'flex', gap: '14px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: pin.length > i ? pinError ? '#ef4444' : 'var(--primary)' : 'var(--surface)',
              border: `2px solid ${pinError ? '#ef4444' : 'var(--border)'}`,
              transition: 'all 0.2s',
              boxShadow: pin.length > i ? `0 0 12px var(--primary)` : 'none',
            }}/>
          ))}
        </div>

        {pinError && <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%', maxWidth: '260px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button key={i} onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d !== '') handlePinDigit(d) }} style={{
              height: '60px', borderRadius: '10px', cursor: d ? 'pointer' : 'default',
              border: '1px solid var(--border)', background: d ? 'var(--card)' : 'transparent',
              color: 'var(--text)', fontSize: d === '⌫' ? '18px' : '22px', fontWeight: 700, opacity: d ? 1 : 0,
            }}>{d}</button>
          ))}
        </div>
      </div>
    )
  }

  // ══ DASHBOARD ══════════════════════════════════════════════════════════════
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
  const revenue = activeSession?.revenue || 0
  const formattedRevenue = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
      <style>{`
        @keyframes goldShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes coinFall { 0%{transform:translateY(-10px);opacity:0} 20%{opacity:1} 100%{transform:translateY(50px);opacity:0} }
        @keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.8)} }
        .coin-fall{position:absolute;font-size:12px;pointer-events:none;animation:coinFall 2s infinite}
        .status-dot{animation:statusPulse 2s ease-in-out infinite}
      `}</style>

      {/* Header */}
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DecoBackground/>
        <DecoCorners opacity={0.25}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, ${currentEmployee?.color}99, ${currentEmployee?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, color: 'white', boxShadow: `0 0 14px ${currentEmployee?.color}55` }}>
            {currentEmployee?.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.5px' }}>
              {currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 700 }}>
              {activeSession ? (isOnBreak ? '☕ EN PAUSE' : '🟢 EN SERVICE') : '⏸ HORS SERVICE'}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, position: 'relative', zIndex: 1 }}>
          {t('SORTIR', 'LOGOUT')}
        </button>
      </div>

      {/* Taux + Statut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DecoBackground/>
          <DecoCorners opacity={0.2}/>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '15px' }}>$</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
              {t('TAUX', 'RATE')}
            </p>
            {editingRate ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="number" value={tempRate} onChange={e => setTempRate(e.target.value)} autoFocus style={{ width: '55px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '15px', fontWeight: 900, outline: 'none' }}/>
                <button onClick={() => { if (currentEmployeeId && tempRate) updateEmployee(currentEmployeeId, { hourlyRate: parseFloat(tempRate) }); setEditingRate(false) }} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', fontSize: '15px' }}>✓</button>
              </div>
            ) : (
              <p onClick={() => { setTempRate(String(currentEmployee?.hourlyRate ?? 45)); setEditingRate(true) }} style={{ fontSize: '14px', fontWeight: 900, cursor: 'pointer', color: 'var(--primary)' }}>
                ${currentEmployee?.hourlyRate ?? 45}/h
              </p>
            )}
          </div>
        </div>

        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DecoBackground/>
          <DecoCorners opacity={0.2}/>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '15px' }}>⏱</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>STATUT</p>
            <p style={{ fontSize: '12px', fontWeight: 900, color: isRunning ? (isOnBreak ? '#f97316' : 'var(--success)') : 'var(--text)', letterSpacing: '0.5px' }}>
              {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}
            </p>
          </div>
        </div>
      </div>

      {/* Revenus + Temps */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
        <div style={{ ...card, background: 'linear-gradient(135deg, #1a1200, #2a1f00, #1a1200)' }}>
          <DecoBackground/>
          <DecoCorners opacity={0.35}/>
          {revenue > 0 && [{ left: '15%', delay: '0s' }, { left: '50%', delay: '0.9s' }, { left: '80%', delay: '1.6s' }].map((coin, i) => (
            <span key={i} className="coin-fall" style={{ left: coin.left, top: 0, animationDelay: coin.delay }}>🪙</span>
          ))}
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: 'rgba(214,178,94,0.7)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
            {t('💰 REVENUS', '💰 REVENUE')}
          </p>
          <p style={{
            fontSize: '26px', fontWeight: 900, lineHeight: 1, fontFamily: 'monospace',
            position: 'relative', zIndex: 1,
            background: 'linear-gradient(90deg, #C49A3C, #F2D27A, #FFE9A0, #F2D27A, #C49A3C)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'goldShimmer 3s linear infinite',
          }}>{formattedRevenue}</p>
          <p style={{ fontSize: '9px', color: 'rgba(214,178,94,0.4)', marginTop: '4px', position: 'relative', zIndex: 1 }}>CAD</p>
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <DecoBackground/>
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
            {t('⏱ TEMPS', '⏱ TIME')}
          </p>
          <p style={{ color: 'var(--text)', fontSize: '19px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
            {formatTimer(activeSession?.elapsed || 0)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', position: 'relative', zIndex: 1 }}>
            <div className="status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : '#555', flexShrink: 0 }}/>
            <p style={{ fontSize: '9px', fontWeight: 700, color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : 'var(--text-muted)' }}>
              {isOnBreak ? 'PAUSE' : isRunning ? 'ACTIF' : 'ATTENTE'}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton Punch */}
      <PunchButton isRunning={isRunning} isOnBreak={isOnBreak} onPunch={isRunning ? handlePunchOut : handlePunchIn} elapsed={activeSession?.elapsed || 0} revenue={activeSession?.revenue || 0}/>

      {/* Gravure sous le punch */}
      {!isRunning && (
        <div style={{ padding: '4px 0' }}>
          <DecoSeparator opacity={0.2}/>
          <DecoStarRow count={5}/>
          <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '3px', color: 'var(--success)', fontWeight: 700, marginTop: '4px' }}>
            ● {t('PRÊT À POINÇONNER', 'READY TO PUNCH')}
          </p>
        </div>
      )}

      {/* Pause / Reprendre */}
      {isRunning && !isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--warning)', color: 'var(--warning)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
            {t('☕ PAUSE', '☕ BREAK')}
          </button>
        </div>
      )}
      {isRunning && isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--success)', color: 'var(--success)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
            {t('▶ REPRENDRE', '▶ RESUME')}
          </button>
        </div>
      )}

      {/* Modals */}
      {showPunchModal && currentEmployee && (
        <PunchInModal employeeId={currentEmployee.id} employeeName={currentEmployee.name} employeeHourlyRate={currentEmployee.hourlyRate ?? 45} mode={punchModalMode} onComplete={handlePunchModalComplete} onCancel={() => setShowPunchModal(false)}/>
      )}

      {showPunchOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 80px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 800 }}>📐 {t('Matériaux posés', 'Materials installed')}</h2>
            {materials.map(m => (
              <div key={m.id} style={{ background: 'var(--card)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={m.material} onChange={e => updateMaterial(m.id, 'material', e.target.value)} placeholder={t('Matériau...', 'Material...')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px', width: '100%' }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet} onChange={e => updateMaterial(m.id, 'squareFeet', Number(e.target.value))} placeholder="Pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                  <input type="number" value={m.pricePerSqFt} onChange={e => updateMaterial(m.id, 'pricePerSqFt', Number(e.target.value))} placeholder="$/pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                </div>
                <p style={{ color: 'var(--secondary)', fontSize: '13px', fontWeight: 700 }}>Total: {formatCurrency(m.total)}</p>
              </div>
            ))}
            <button onClick={addMaterial} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>+ {t('Ajouter', 'Add')}</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: 'var(--primary)', color: '#000', fontSize: '14px', fontWeight: 700 }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div style={{ ...card }}>
        <DecoBackground/>
        <DecoCorners opacity={0.3}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m-2).toISOString().slice(0,7)) }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>‹</button>
          <DecoTitle>{monthLabel.toUpperCase()}</DecoTitle>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m).toISOString().slice(0,7)) }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
          {(lang === 'fr' ? ['DI','LU','MA','ME','JE','VE','SA'] : ['SU','MO','TU','WE','TH','FR','SA']).map(d => (
            <div key={d} style={{ textAlign: 'center' as const, fontSize: '9px', color: 'var(--primary)', fontWeight: 800, padding: '3px 0', letterSpacing: '0.5px', opacity: 0.7 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', position: 'relative', zIndex: 1 }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`}/>
            const dateKey = day.toISOString().split('T')[0]
            const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{
                minHeight: '40px', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isToday ? 'var(--primary)18' : detail ? 'var(--success)12' : 'var(--surface)',
                boxShadow: isToday ? '0 0 10px var(--primary)44' : 'none',
              }}>
                <span style={{ fontSize: '11px', color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isToday ? 900 : 400 }}>{day.getDate()}</span>
                {detail && <span style={{ fontSize: '7px', color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(detail.totalRevenue)}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div style={{ ...card }}>
        <DecoBackground/>
        <DecoCorners opacity={0.2}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DecoTitle>{t('LÉGENDE', 'LEGEND')}</DecoTitle>
          <div style={{ height: '8px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {[
              { emoji: '⛱️', fr: 'Congé',         en: 'Day off',  color: '#06b6d4' },
              { emoji: '🌙', fr: 'Petite j.',      en: 'Short',    color: '#64748b' },
              { emoji: '📋', fr: 'Moyenne',        en: 'Average',  color: '#3b82f6' },
              { emoji: '✅', fr: 'Normale',        en: 'Normal',   color: '#22c55e' },
              { emoji: '⭐', fr: 'Bonne j.',       en: 'Good',     color: '#eab308' },
              { emoji: '🔥', fr: 'Grosse j.',      en: 'Big',      color: '#f97316' },
              { emoji: '💎', fr: 'Très grosse',    en: 'Huge',     color: '#a855f7' },
            ].map(item => (
              <div key={item.emoji} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: `${item.color}14`, border: `1px solid ${item.color}28` }}>
                <span style={{ fontSize: '15px' }}>{item.emoji}</span>
                <p style={{ color: item.color, fontSize: '11px', fontWeight: 700 }}>{t(item.fr, item.en)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grand ornement de fin de page */}
      <div style={{ padding: '8px 0' }}>
        <DecoSeparator opacity={0.2}/>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', opacity: 0.15 }}>
          <DecoFlower size={30} opacity={1}/>
          <DecoFlower size={45} opacity={1}/>
          <DecoFlower size={30} opacity={1}/>
        </div>
      </div>

      {/* Modal détail journée */}
      {selectedDay && (() => {
        const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${selectedDay}`] : null
        const emp = currentEmployee
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 80px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 800 }}>📅 {selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} style={{ color: 'var(--text-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              {!detail ? (
                <div>
                  <DecoOrnament opacity={0.15}/>
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' as const, padding: '12px' }}>{t('Aucune donnée', 'No data')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: t('Heures', 'Hours'), value: `${detail.totalHours.toFixed(2)}h`, color: 'var(--primary)' },
                      { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: '#FFD700' },
                      { label: t('Pauses', 'Breaks'), value: formatTimer(detail.totalBreak), color: '#f97316' },
                      { label: 'Sessions', value: `${detail.sessions.length}`, color: 'var(--info)' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--card)', borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px' }}>{item.label}</p>
                        <p style={{ color: item.color, fontSize: '18px', fontWeight: 800 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {detail.sessions.length > 0 && (
                    <div style={{ background: 'var(--card)', borderRadius: '10px', padding: '12px' }}>
                      <DecoTitle>SESSIONS</DecoTitle>
                      {detail.sessions.map((session, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {new Date(session.startTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                            {session.endTime && ` → ${new Date(session.endTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span style={{ color: 'var(--secondary)', fontSize: '12px', fontWeight: 700 }}>{formatTimer(session.elapsed)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Mode: <strong style={{ color: 'var(--primary)' }}>{emp?.workMode}</strong> — ${emp?.hourlyRate}/h
                  </p>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
