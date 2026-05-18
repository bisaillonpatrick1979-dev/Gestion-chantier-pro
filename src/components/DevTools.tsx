'use client'
// src/components/DevTools.tsx
// Bouton 🧪 flottant — visible si stores vides OU admin connecté

import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useClientStore } from '@/store/useClientStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import {
  SEED_EMPLOYEES, SEED_COMPANY, SEED_CLIENTS, SEED_DOCUMENTS, ALL_STORE_KEYS,
} from '@/lib/seedData'

// ── Catégories disponibles ─────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'company',
    emoji: '🏢',
    label: 'Compagnie',
    desc: 'Hailite Xteriors — Patrick Bisaillon',
  },
  {
    key: 'employees',
    emoji: '👥',
    label: 'Employés (7)',
    desc: '1 admin + 3 contracteurs + 3 salariés',
  },
  {
    key: 'clients',
    emoji: '👤',
    label: 'Clients (3)',
    desc: 'Martin Côté, Jennifer Walsh, Robert Chen',
  },
  {
    key: 'documents',
    emoji: '📄',
    label: 'Documents (5)',
    desc: '3 factures · 1 devis · 1 contrat',
  },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']
type Selection = Record<CategoryKey, boolean>

export default function DevTools() {
  const { currentEmployeeId, employees } = useEmployeeStore()
  const [open, setOpen]     = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'reset'>('idle')
  const [sel, setSel]       = useState<Selection>({
    company: true, employees: true, clients: true, documents: true,
  })

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isEmpty         = employees.length === 0

  // Visible si stores vides OU si admin connecté
  if (!isEmpty && currentEmployee?.role !== 'admin') return null

  const toggleAll = (val: boolean) =>
    setSel({ company: val, employees: val, clients: val, documents: val })

  const allSelected  = Object.values(sel).every(Boolean)
  const noneSelected = Object.values(sel).every(v => !v)

  // ── Charger les données sélectionnées ────────────────────────────────────
  const handleLoad = () => {
    if (noneSelected) return
    setStatus('loading')

    if (sel.company) {
      useCompanyStore.getState().setCompany(SEED_COMPANY)
    }

    if (sel.employees) {
      useEmployeeStore.setState(state => ({
        ...state,
        employees: SEED_EMPLOYEES,
        currentEmployeeId: 'seed-admin-001',
      }))
    }

    if (sel.clients) {
      useClientStore.setState(state => ({
        ...state,
        clients: SEED_CLIENTS,
      }))
    }

    if (sel.documents) {
      useDocumentStore.setState(state => ({
        ...state,
        documents: SEED_DOCUMENTS,
      }))
    }

    setStatus('loaded')
    setTimeout(() => {
      setOpen(false)
      setStatus('idle')
      window.location.reload()
    }, 1200)
  }

  // ── Réinitialiser tout ───────────────────────────────────────────────────
  const handleReset = () => {
    const ok = window.confirm(
      '⚠️ Effacer TOUTES les données?\n\nEmployés, clients, documents, compagnie...\n\nCette action est irréversible.'
    )
    if (!ok) return
    ALL_STORE_KEYS.forEach(key => localStorage.removeItem(key))
    setStatus('reset')
    setTimeout(() => window.location.reload(), 500)
  }

  // ── Couleur bouton charger ───────────────────────────────────────────────
  const loadBg =
    status === 'loaded'  ? '#22c55e' :
    status === 'loading' ? '#1d4ed8' :
    noneSelected         ? '#374151' : '#2563eb'

  return (
    <>
      {/* ── Bouton flottant 🧪 ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Dev Tools"
        style={{
          position: 'fixed', bottom: '90px', left: '10px', zIndex: 500,
          width: '34px', height: '34px', borderRadius: '50%',
          background: isEmpty ? '#1e3a5f' : '#111827',
          border: `1px solid ${isEmpty ? '#3b82f6' : '#374151'}`,
          color: isEmpty ? '#60a5fa' : '#6b7280',
          fontSize: '15px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}>
        🧪
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '132px', left: '10px', zIndex: 500,
          background: '#111827', border: '1px solid #374151',
          borderRadius: '18px', padding: '16px', width: '240px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          fontFamily: 'system-ui, sans-serif',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              🧪 Dev Tools
            </p>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          {/* PIN badge */}
          <div style={{ padding: '6px 10px', background: '#0f172a', borderRadius: '8px', textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 800, letterSpacing: '5px' }}>0000</span>
            <span style={{ color: '#374151', fontSize: '9px', marginLeft: '6px' }}>PIN tous les employés</span>
          </div>

          {/* Checkboxes */}
          <p style={{ color: '#4b5563', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Données à charger
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {CATEGORIES.map(cat => (
              <label key={cat.key} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
                background: sel[cat.key] ? '#1e3a5f' : '#1f2937',
                border: `1px solid ${sel[cat.key] ? '#3b82f6' : '#374151'}`,
                transition: 'all 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={sel[cat.key]}
                  onChange={e => setSel(s => ({ ...s, [cat.key]: e.target.checked }))}
                  style={{ marginTop: '2px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ color: sel[cat.key] ? '#e2e8f0' : '#6b7280', fontSize: '12px', fontWeight: 700 }}>
                    {cat.emoji} {cat.label}
                  </p>
                  <p style={{ color: '#4b5563', fontSize: '10px', marginTop: '1px', lineHeight: 1.3 }}>
                    {cat.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Tout sélectionner / désélectionner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <button onClick={() => toggleAll(true)} style={{
              padding: '6px', borderRadius: '8px', cursor: 'pointer',
              background: allSelected ? '#374151' : '#1f2937',
              border: '1px solid #374151', color: '#9ca3af', fontSize: '10px', fontWeight: 700,
            }}>
              ☑ Tout cocher
            </button>
            <button onClick={() => toggleAll(false)} style={{
              padding: '6px', borderRadius: '8px', cursor: 'pointer',
              background: noneSelected ? '#374151' : '#1f2937',
              border: '1px solid #374151', color: '#9ca3af', fontSize: '10px', fontWeight: 700,
            }}>
              ☐ Tout décocher
            </button>
          </div>

          {/* Bouton Charger */}
          <button onClick={handleLoad} disabled={noneSelected || status === 'loading'}
            style={{
              width: '100%', padding: '12px', borderRadius: '11px',
              background: loadBg, border: 'none', color: 'white',
              fontSize: '13px', fontWeight: 800, cursor: noneSelected ? 'not-allowed' : 'pointer',
              marginBottom: '8px', opacity: noneSelected ? 0.5 : 1, transition: 'all 0.2s',
            }}>
            {status === 'loaded'  ? '✅ Données chargées !'
             : status === 'loading' ? '⏳ Chargement...'
             : '📦 Charger la sélection'}
          </button>

          {/* Résumé documents si coché */}
          {sel.documents && (
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '8px', marginBottom: '10px' }}>
              <p style={{ color: '#475569', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                5 documents inclus
              </p>
              {[
                { n: 'INV-001', desc: 'Facture + GST + dépôt', status: 'sent',  color: '#3b82f6' },
                { n: 'INV-002', desc: 'Facture + GST + remise 10%', status: 'paid',  color: '#22c55e' },
                { n: 'INV-003', desc: 'Facture sans taxe', status: 'draft', color: '#64748b' },
                { n: 'QUO-001', desc: 'Devis + GST + remise 5%', status: 'draft', color: '#64748b' },
                { n: 'CON-001', desc: 'Contrat + dépôt 30%', status: 'sent',  color: '#3b82f6' },
              ].map(d => (
                <div key={d.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                  <p style={{ color: '#64748b', fontSize: '10px' }}>{d.n} — {d.desc}</p>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: d.color }}>{d.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Séparateur */}
          <div style={{ borderTop: '1px solid #1f2937', margin: '2px 0 10px' }} />

          {/* Bouton Reset */}
          <button onClick={handleReset} style={{
            width: '100%', padding: '11px', borderRadius: '11px',
            background: '#7f1d1d', border: '1px solid #991b1b',
            color: '#fca5a5', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>
            🗑️ Réinitialiser tout
          </button>

          <p style={{ color: '#1f2937', fontSize: '9px', textAlign: 'center', marginTop: '8px' }}>
            {isEmpty ? '⚠️ App vide' : '👑 Admin only'}
          </p>
        </div>
      )}
    </>
  )
}
