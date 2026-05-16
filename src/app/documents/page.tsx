'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useThemeStore } from '@/store/useThemeStore'
import { DocumentType, DocumentStatus } from '@/types/documents'
import { formatCurrency } from '@/lib/formatters'
import { useLangStore } from '@/store/useLangStore'
import { tr } from '@/lib/translations'
import {
  DecoSeparator,
  DecoCorners,
  DecoTitle,
  DecoOrnament,
  DecoBackground,
  DecoDiamondRow,
  DecoFlower,
} from '@/components/DecoElements'

const STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: '#64748b' },
  envoye:    { label: 'Envoyé',    color: '#3b82f6' },
  accepte:   { label: 'Accepté',   color: '#22c55e' },
  refuse:    { label: 'Refusé',    color: '#ef4444' },
  paye:      { label: 'Payé',      color: '#f59e0b' },
}

export default function DocumentsPage() {
  const { documents, addDocument } = useDocumentStore()
  const { theme } = useThemeStore()
  const router = useRouter()
  const { lang } = useLangStore()
  const [filter, setFilter] = useState<DocumentType | 'all'>('all')

  const TYPE_LABELS = {
    facture: { label: tr('invoices', lang), emoji: '📄' },
    devis:   { label: tr('quotes', lang),   emoji: '📋' },
    contrat: { label: tr('contracts', lang), emoji: '📝' },
  }

  const filtered = filter === 'all' ? documents : documents.filter(d => d.type === filter)

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

      {/* Titre avec gravure */}
      <div style={{ paddingTop: '4px' }}>
        <DecoTitle>{tr('documentsTitle', lang)}</DecoTitle>
      </div>

      {/* Ornement haut */}
      <DecoOrnament opacity={0.12}/>

      {/* Boutons nouveau document */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {(['facture', 'devis', 'contrat'] as DocumentType[]).map(type => (
          <button
            key={type}
            onClick={() => handleNew(type)}
            style={{
              padding: '16px 8px', borderRadius: '14px', cursor: 'pointer',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s',
            }}
          >
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

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {(['all', 'facture', 'devis', 'contrat'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', flexShrink: 0,
              border: filter === f ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: filter === f ? 'var(--primary)20' : 'transparent',
              color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' as const,
              transition: 'all 0.2s',
            }}
          >
            {f === 'all' ? tr('all', lang) : f === 'facture' ? tr('invoices', lang) : f === 'devis' ? tr('quotes', lang) : tr('contracts', lang)}
          </button>
        ))}
      </div>

      {/* Liste vide */}
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center' as const }}>
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
              {lang === 'fr' ? 'Aucun document' : 'No documents'}
            </p>
            <p style={{ color: 'var(--text-weak)', fontSize: '12px', marginBottom: '16px' }}>
              {lang === 'fr' ? 'Créez-en un ci-dessus.' : 'Create one above.'}
            </p>
            <DecoDiamondRow count={7} opacity={0.3}/>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.slice().reverse().map(doc => (
            <div
              key={doc.id}
              style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => router.push(`/documents/${doc.id}`)}
            >
              <DecoBackground/>
              <DecoCorners opacity={0.2}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '24px' }}>{TYPE_LABELS[doc.type].emoji}</span>
                <div>
                  <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700 }}>{doc.number}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                    {doc.client.name || tr('clientNotDefined', lang)} — {doc.date}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const, position: 'relative', zIndex: 1 }}>
                <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>
                  {formatCurrency(doc.total)}
                </p>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  color: STATUS_LABELS[doc.status].color,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                }}>
                  {STATUS_LABELS[doc.status].label}
                </span>
              </div>
            </div>
          ))}
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

