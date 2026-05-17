'use client'
// src/app/documents/page.tsx — Historique complet + recherche + filtre statut

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useThemeStore } from '@/store/useThemeStore'
import { DocumentType, DocumentStatus } from '@/types/documents'
import { formatCurrency } from '@/lib/formatters'
import { useLangStore } from '@/store/useLangStore'
import { tr } from '@/lib/translations'
import {
  DecoSeparator, DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow, DecoFlower,
} from '@/components/DecoElements'

const STATUS_CONFIG: Record<DocumentStatus, { label: string; labelEn: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', labelEn: 'Draft',    color: '#64748b', emoji: '📝' },
  envoye:    { label: 'Envoyé',    labelEn: 'Sent',     color: '#3b82f6', emoji: '📤' },
  accepte:   { label: 'Accepté',   labelEn: 'Accepted', color: '#22c55e', emoji: '✅' },
  refuse:    { label: 'Refusé',    labelEn: 'Refused',  color: '#ef4444', emoji: '❌' },
  paye:      { label: 'Payé',      labelEn: 'Paid',     color: '#f59e0b', emoji: '💰' },
}

export default function DocumentsPage() {
  const { documents, addDocument } = useDocumentStore()
  const { theme, themeId } = useThemeStore()
  const router = useRouter()
  const { lang } = useLangStore()

  // ── Theme card class ────────────────────────────────────────────────────────
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const cardClass  = isDeco    ? 'deco-card-sweep'    :
                     isQuantum ? 'quantum-card-glow'  :
                     isAventure ? 'aventure-card-glow' : ''

  // ── Filtres ──────────────────────────────────────────────────────────────────
  const [typeFilter,   setTypeFilter]   = useState<DocumentType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')
  const [search,       setSearch]       = useState('')

  const TYPE_LABELS = {
    facture: { label: tr('invoices',  lang), emoji: '📄' },
    devis:   { label: tr('quotes',    lang), emoji: '📋' },
    contrat: { label: tr('contracts', lang), emoji: '📝' },
  }

  // ── Filtrage ──────────────────────────────────────────────────────────────────
  const filtered = documents.filter(doc => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchClient = doc.client.name?.toLowerCase().includes(q)
      const matchNum    = doc.number?.toLowerCase().includes(q)
      const matchAmount = formatCurrency(doc.total).toLowerCase().includes(q)
      if (!matchClient && !matchNum && !matchAmount) return false
    }
    return true
  }).slice().reverse()

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalEncaisse = documents.filter(d => d.status === 'paye').reduce((s, d) => s + d.total, 0)
  const totalAttente  = documents.filter(d => d.status === 'envoye' || d.status === 'accepte').reduce((s, d) => s + d.balanceDue, 0)
  const totalBrouillon = documents.filter(d => d.status === 'brouillon').length

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  }

  const handleNew = (type: DocumentType) => {
    const doc = addDocument(type)
    router.push(`/documents/${doc.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Titre */}
      <div style={{ paddingTop: '4px' }}>
        <DecoTitle>{tr('documentsTitle', lang)}</DecoTitle>
      </div>

      <DecoOrnament opacity={0.12}/>

      {/* ── Stats rapides ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[
          { label: lang === 'fr' ? 'Encaissé' : 'Collected', value: formatCurrency(totalEncaisse), color: '#22c55e', emoji: '💰' },
          { label: lang === 'fr' ? 'En attente' : 'Pending',  value: formatCurrency(totalAttente),  color: '#f59e0b', emoji: '⏳' },
          { label: lang === 'fr' ? 'Brouillons' : 'Drafts',   value: `${totalBrouillon}`,           color: '#64748b', emoji: '📝' },
        ].map(stat => (
          <div key={stat.label} className={cardClass} style={{ ...card, padding: '12px', textAlign: 'center' }}>
            <DecoBackground/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.emoji}</p>
              <p style={{ color: stat.color, fontSize: '14px', fontWeight: 900, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '3px' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Boutons nouveau document ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {(['facture', 'devis', 'contrat'] as DocumentType[]).map(type => (
          <button key={type} onClick={() => handleNew(type)} style={{ padding: '16px 8px', borderRadius: '14px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
            <DecoBackground/>
            <DecoCorners opacity={0.25}/>
            <span style={{ fontSize: '26px', position: 'relative', zIndex: 1 }}>{TYPE_LABELS[type].emoji}</span>
            <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', position: 'relative', zIndex: 1 }}>
              + {TYPE_LABELS[type].label}
            </span>
          </button>
        ))}
      </div>

      <DecoSeparator opacity={0.2}/>

      {/* ── Recherche ────────────────────────────────────────────────────────── */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={lang === 'fr' ? '🔍 Client, numéro, montant...' : '🔍 Client, number, amount...'}
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />

      {/* ── Filtre type ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {(['all', 'facture', 'devis', 'contrat'] as const).map(f => (
          <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', flexShrink: 0, border: typeFilter === f ? '1px solid var(--primary)' : '1px solid var(--border)', background: typeFilter === f ? 'var(--primary)20' : 'transparent', color: typeFilter === f ? 'var(--primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {f === 'all' ? (lang === 'fr' ? 'Tous' : 'All') : f === 'facture' ? tr('invoices', lang) : f === 'devis' ? tr('quotes', lang) : tr('contracts', lang)}
            <span style={{ marginLeft: '5px', opacity: 0.7 }}>
              ({f === 'all' ? documents.length : documents.filter(d => d.type === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Filtre statut ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
        <button onClick={() => setStatusFilter('all')} style={{ padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', flexShrink: 0, border: statusFilter === 'all' ? '1px solid var(--border-strong)' : '1px solid var(--border)', background: statusFilter === 'all' ? 'var(--surface)' : 'transparent', color: statusFilter === 'all' ? 'var(--text)' : 'var(--text-muted)', fontSize: '11px', fontWeight: statusFilter === 'all' ? 700 : 400, whiteSpace: 'nowrap' }}>
          {lang === 'fr' ? 'Tous statuts' : 'All status'}
        </button>
        {(Object.entries(STATUS_CONFIG) as [DocumentStatus, typeof STATUS_CONFIG[DocumentStatus]][]).map(([status, cfg]) => (
          <button key={status} onClick={() => setStatusFilter(status)} style={{ padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', flexShrink: 0, border: statusFilter === status ? `2px solid ${cfg.color}` : '1px solid var(--border)', background: statusFilter === status ? `${cfg.color}20` : 'transparent', color: statusFilter === status ? cfg.color : 'var(--text-muted)', fontSize: '11px', fontWeight: statusFilter === status ? 700 : 400, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {cfg.emoji} {lang === 'fr' ? cfg.label : cfg.labelEn}
            <span style={{ marginLeft: '4px', opacity: 0.7 }}>
              ({documents.filter(d => d.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Résultat recherche ───────────────────────────────────────────────── */}
      {search && (
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {filtered.length} {lang === 'fr' ? 'résultat(s) pour' : 'result(s) for'} "{search}"
        </p>
      )}

      {/* ── Liste vide ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={cardClass} style={{ ...card, textAlign: 'center' }}>
          <DecoBackground/>
          <DecoCorners opacity={0.3}/>
          <div style={{ position: 'relative', zIndex: 1, padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', opacity: 0.25 }}>
              <DecoFlower size={36} opacity={1}/>
              <DecoFlower size={52} opacity={1}/>
              <DecoFlower size={36} opacity={1}/>
            </div>
            <DecoSeparator opacity={0.3}/>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, margin: '16px 0 8px' }}>
              {search ? (lang === 'fr' ? 'Aucun résultat' : 'No results') : (lang === 'fr' ? 'Aucun document' : 'No documents')}
            </p>
            {search && (
              <button onClick={() => setSearch('')} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>
                ✕ {lang === 'fr' ? 'Effacer la recherche' : 'Clear search'}
              </button>
            )}
            <div style={{ marginTop: '16px' }}>
              <DecoDiamondRow count={7} opacity={0.3}/>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(doc => {
            const sc = STATUS_CONFIG[doc.status]
            const tl = TYPE_LABELS[doc.type]
            return (
              <div key={doc.id} className={cardClass} style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => router.push(`/documents/${doc.id}`)}>
                <DecoBackground/>
                <DecoCorners opacity={0.2}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '24px' }}>{tl.emoji}</span>
                  <div>
                    <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>{doc.number}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      {doc.client.name || (lang === 'fr' ? 'Client non défini' : 'Client not defined')}
                    </p>
                    <p style={{ color: 'var(--text-weak)', fontSize: '10px', marginTop: '1px' }}>{doc.date}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 800 }}>
                    {formatCurrency(doc.total)}
                  </p>
                  {doc.balanceDue > 0 && doc.balanceDue !== doc.total && (
                    <p style={{ color: '#f59e0b', fontSize: '10px', marginTop: '1px' }}>
                      {lang === 'fr' ? 'Solde:' : 'Due:'} {formatCurrency(doc.balanceDue)}
                    </p>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {sc.emoji} {lang === 'fr' ? sc.label : sc.labelEn}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Ornement bas */}
      {filtered.length > 0 && (
        <div style={{ padding: '8px 0' }}>
          <DecoSeparator opacity={0.15}/>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', opacity: 0.15 }}>
            <DecoFlower size={28} opacity={1}/>
            <DecoFlower size={42} opacity={1}/>
            <DecoFlower size={28} opacity={1}/>
          </div>
        </div>
      )}
    </div>
  )
}

