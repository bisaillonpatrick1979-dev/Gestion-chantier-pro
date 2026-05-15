'use client'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency } from '@/lib/formatters'

export default function ComptabilitePage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { documents } = useDocumentStore()
  const { employees, dayDetails } = useEmployeeStore()

  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const currentYear = now.getFullYear().toString()

  // MONTHLY STATS
  const monthDocs = documents.filter(d => d.createdAt?.startsWith(currentMonth))
  const monthRevenue = monthDocs.filter(d => d.status === 'paye').reduce((sum, d) => sum + d.total, 0)
  const monthPending = monthDocs.filter(d => d.status === 'envoye' || d.status === 'accepte').reduce((sum, d) => sum + d.balanceDue, 0)
  const monthInvoices = monthDocs.filter(d => d.type === 'facture').length
  const monthQuotes = monthDocs.filter(d => d.type === 'devis').length

  // YEARLY STATS
  const yearDocs = documents.filter(d => d.createdAt?.startsWith(currentYear))
  const yearRevenue = yearDocs.filter(d => d.status === 'paye').reduce((sum, d) => sum + d.total, 0)
  const yearPending = yearDocs.filter(d => d.status === 'envoye' || d.status === 'accepte').reduce((sum, d) => sum + d.balanceDue, 0)

  // BY STATUS
  const byStatus = {
    brouillon: documents.filter(d => d.status === 'brouillon'),
    envoye:    documents.filter(d => d.status === 'envoye'),
    accepte:   documents.filter(d => d.status === 'accepte'),
    paye:      documents.filter(d => d.status === 'paye'),
    refuse:    documents.filter(d => d.status === 'refuse'),
  }

  // BY EMPLOYEE
  const employeeStats = employees.map(emp => {
    const empDetails = Object.entries(dayDetails)
      .filter(([key]) => key.startsWith(emp.id))
      .map(([, detail]) => detail)
    const totalRevenue = empDetails.reduce((sum, d) => sum + d.totalRevenue, 0)
    const totalHours = empDetails.reduce((sum, d) => sum + d.totalHours, 0)
    const totalDays = empDetails.length
    return { emp, totalRevenue, totalHours, totalDays }
  }).filter(s => s.totalRevenue > 0 || s.totalHours > 0)

  // MONTHLY BREAKDOWN (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short', year: '2-digit' })
    const revenue = documents
      .filter(doc => doc.createdAt?.startsWith(key) && doc.status === 'paye')
      .reduce((sum, doc) => sum + doc.total, 0)
    const pending = documents
      .filter(doc => doc.createdAt?.startsWith(key) && (doc.status === 'envoye' || doc.status === 'accepte'))
      .reduce((sum, doc) => sum + doc.balanceDue, 0)
    return { key, label, revenue, pending }
  }).reverse()

  const maxRevenue = Math.max(...last6Months.map(m => m.revenue + m.pending), 1)

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const STATUS_CONFIG = {
    brouillon: { label: lang === 'fr' ? 'Brouillon' : 'Draft',    color: '#64748b', emoji: '📝' },
    envoye:    { label: lang === 'fr' ? 'Envoyé' : 'Sent',        color: '#3b82f6', emoji: '📤' },
    accepte:   { label: lang === 'fr' ? 'Accepté' : 'Accepted',   color: '#22c55e', emoji: '✅' },
    paye:      { label: lang === 'fr' ? 'Payé' : 'Paid',          color: '#f59e0b', emoji: '💰' },
    refuse:    { label: lang === 'fr' ? 'Refusé' : 'Refused',     color: '#ef4444', emoji: '❌' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* TITLE */}
      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>
        📊 {lang === 'fr' ? 'COMPTABILITÉ' : 'ACCOUNTING'}
      </h1>

      {/* MONTHLY SUMMARY */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
        }}>
          📅 {lang === 'fr' ? 'CE MOIS-CI' : 'THIS MONTH'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: lang === 'fr' ? 'Revenus encaissés' : 'Revenue collected', value: formatCurrency(monthRevenue), color: '#22c55e', icon: '💰' },
            { label: lang === 'fr' ? 'En attente' : 'Pending', value: formatCurrency(monthPending), color: '#f59e0b', icon: '⏳' },
            { label: lang === 'fr' ? 'Factures créées' : 'Invoices created', value: `${monthInvoices}`, color: theme.colors.primary, icon: '📄' },
            { label: lang === 'fr' ? 'Devis envoyés' : 'Quotes sent', value: `${monthQuotes}`, color: theme.colors.primaryLight, icon: '📋' },
          ].map(item => (
            <div key={item.label} style={{
              background: theme.colors.surface,
              borderRadius: '10px', padding: '12px',
            }}>
              <p style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</p>
              <p style={{ color: item.color, fontSize: '18px', fontWeight: '800' }}>{item.value}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginTop: '2px' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* YEARLY SUMMARY */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
        }}>
          📆 {lang === 'fr' ? `ANNÉE ${currentYear}` : `YEAR ${currentYear}`}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px' }}>
            <p style={{ fontSize: '20px', marginBottom: '4px' }}>💰</p>
            <p style={{ color: '#22c55e', fontSize: '18px', fontWeight: '800' }}>{formatCurrency(yearRevenue)}</p>
            <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{lang === 'fr' ? 'Total encaissé' : 'Total collected'}</p>
          </div>
          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px' }}>
            <p style={{ fontSize: '20px', marginBottom: '4px' }}>⏳</p>
            <p style={{ color: '#f59e0b', fontSize: '18px', fontWeight: '800' }}>{formatCurrency(yearPending)}</p>
            <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{lang === 'fr' ? 'Total en attente' : 'Total pending'}</p>
          </div>
        </div>
      </div>

      {/* 6 MONTH CHART */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '16px'
        }}>
          📈 {lang === 'fr' ? '6 DERNIERS MOIS' : 'LAST 6 MONTHS'}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
          {last6Months.map(m => (
            <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end' }}>
                {m.pending > 0 && (
                  <div style={{
                    width: '100%',
                    height: `${(m.pending / maxRevenue) * 80}px`,
                    background: '#f59e0b',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '4px',
                  }} title={formatCurrency(m.pending)} />
                )}
                {m.revenue > 0 && (
                  <div style={{
                    width: '100%',
                    height: `${(m.revenue / maxRevenue) * 80}px`,
                    background: '#22c55e',
                    borderRadius: m.pending > 0 ? '0' : '4px 4px 0 0',
                    minHeight: '4px',
                  }} title={formatCurrency(m.revenue)} />
                )}
                {m.revenue === 0 && m.pending === 0 && (
                  <div style={{ width: '100%', height: '4px', background: theme.colors.border, borderRadius: '4px' }} />
                )}
              </div>
              <span style={{ color: theme.colors.textMuted, fontSize: '9px', textAlign: 'center' as const }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }} />
            <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{lang === 'fr' ? 'Encaissé' : 'Collected'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
            <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{lang === 'fr' ? 'En attente' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* BY STATUS */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
        }}>
          📋 {lang === 'fr' ? 'PAR STATUT' : 'BY STATUS'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(Object.entries(byStatus) as [keyof typeof byStatus, typeof documents][]).map(([status, docs]) => {
            const config = STATUS_CONFIG[status]
            const total = docs.reduce((sum, d) => sum + d.total, 0)
            return (
              <div key={status} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: theme.colors.surface, borderRadius: '10px', padding: '12px',
                borderLeft: `3px solid ${config.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{config.emoji}</span>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                      {config.label}
                    </p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {docs.length} {lang === 'fr' ? 'document(s)' : 'document(s)'}
                    </p>
                  </div>
                </div>
                <p style={{ color: config.color, fontSize: '14px', fontWeight: '800' }}>
                  {formatCurrency(total)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* BY EMPLOYEE */}
      {employeeStats.length > 0 && (
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '11px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
          }}>
            👥 {lang === 'fr' ? 'PAR EMPLOYÉ' : 'BY EMPLOYEE'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employeeStats.map(({ emp, totalRevenue, totalHours, totalDays }) => (
              <div key={emp.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: theme.colors.surface, borderRadius: '10px', padding: '12px',
                borderLeft: `3px solid ${emp.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: emp.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px',
                  }}>
                    {emp.name[0]}
                  </div>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                      {emp.name}
                    </p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {totalHours.toFixed(1)}h · {totalDays} {lang === 'fr' ? 'jour(s)' : 'day(s)'}
                    </p>
                  </div>
                </div>
                <p style={{ color: emp.color, fontSize: '14px', fontWeight: '800' }}>
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL DOCUMENTS */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700', marginBottom: '12px'
        }}>
          🗂️ {lang === 'fr' ? 'TOUS LES DOCUMENTS' : 'ALL DOCUMENTS'}
        </p>
        {documents.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: 'center' as const, fontSize: '14px', padding: '20px' }}>
            {lang === 'fr' ? 'Aucun document' : 'No documents'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...documents].reverse().map(doc => {
              const config = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={doc.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '8px',
                }}>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                      {doc.number}
                    </p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {doc.client.name || (lang === 'fr' ? 'Client non défini' : 'Client not defined')} · {doc.date}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                      {formatCurrency(doc.total)}
                    </p>
                    <span style={{
                      color: config?.color || theme.colors.textMuted,
                      fontSize: '10px', fontWeight: '700',
                      textTransform: 'uppercase' as const,
                    }}>
                      {config?.label || doc.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

