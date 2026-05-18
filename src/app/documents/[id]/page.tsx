'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useClientStore } from '@/store/useClientStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useLangStore } from '@/store/useLangStore'
import { useThemeStore } from '@/store/useThemeStore'
import { GCPDocument } from '@/types/documents'
import {
  DecoSeparator, DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow,
} from '@/components/DecoElements'

// ── Types ──────────────────────────────────────────────────────────────────
interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  unitPrice: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)

export default function DocumentDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const docId    = params?.id as string

  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const { themeId } = useThemeStore()
  const isXP       = themeId === 'xp'
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const isZen      = themeId === 'zen'
  const isLudique  = themeId === 'ludique'
  const cardClass  = isDeco
    ? 'deco-card-sweep'
    : isQuantum
    ? 'quantum-card-glow'
    : isAventure
    ? 'aventure-card-glow'
    : ''

  const { documents, updateDocument, addDocument } = useDocumentStore()
  const { clients }                                  = useClientStore()
  const { company }                                  = useCompanyStore()

  // ── Trouver le doc existant ───────────────────────────────────────────
  const existing = documents.find(d => d.id === docId)

  // ── État local ───────────────────────────────────────────────────────
  const [docType, setDocType]       = useState<'invoice' | 'quote' | 'contract'>(
    (existing?.type as any) ?? 'invoice'
  )
  const [docNumber, setDocNumber]   = useState(existing?.number ?? '')
  const [docDate, setDocDate]       = useState(
    existing?.date ?? new Date().toISOString().split('T')[0]
  )
  const [dueDate, setDueDate]       = useState(existing?.dueDate ?? '')
  const [status, setStatus]         = useState(existing?.status ?? 'draft')

  // Infos client
  const [clientId, setClientId]     = useState(existing?.clientId ?? '')
  const [clientName, setClientName] = useState(existing?.clientName ?? '')
  const [clientAddress, setClientAddress] = useState(existing?.clientAddress ?? '')
  const [clientEmail, setClientEmail]   = useState(existing?.clientEmail ?? '')
  const [clientPhone, setClientPhone]   = useState(existing?.clientPhone ?? '')

  // Infos compagnie — auto depuis useCompanyStore
  const [compName, setCompName]         = useState(existing?.companyName     ?? company.name)
  const [compAddress, setCompAddress]   = useState(company.address)
  const [compCity, setCompCity]         = useState(company.city)
  const [compProvince, setCompProvince] = useState(company.province)
  const [compPostal, setCompPostal]     = useState(company.postalCode)
  const [compPhone, setCompPhone]       = useState(existing?.companyPhone     ?? company.phone)
  const [compEmail, setCompEmail]       = useState(existing?.companyEmail     ?? company.email)
  const [compGST, setCompGST]           = useState(existing?.companyGST       ?? company.gstNumber)
  const [compWCB, setCompWCB]           = useState(existing?.companyWCB       ?? company.wcbNumber)

  // Lignes
  const [lines, setLines] = useState<LineItem[]>(
    existing?.lines ?? [{ id: uid(), description: '', qty: 1, unit: t('unité', 'unit'), unitPrice: 0 }]
  )

  // Taxes / remise / dépôt
  const [taxRate, setTaxRate]           = useState(existing?.taxRate ?? 5)
  const [discountPct, setDiscountPct]   = useState(existing?.discountPct ?? 0)
  const [depositAmount, setDepositAmount] = useState(existing?.depositAmount ?? 0)

  // Notes
  const [notes, setNotes] = useState(existing?.notes ?? '')

  // Signature
  const [signature, setSignature] = useState(existing?.signature ?? '')
  const sigRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)

  // Tab local
  const [tab, setTab] = useState<'info' | 'lines' | 'total' | 'sign'>('info')

  // ── État PDF Preview ─────────────────────────────────────────────────
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  // ── Sync infos compagnie quand le store change ─────────────────────
  useEffect(() => {
    if (!existing) {
      setCompName(company.name)
      setCompAddress(company.address)
      setCompCity(company.city)
      setCompProvince(company.province)
      setCompPostal(company.postalCode)
      setCompPhone(company.phone)
      setCompEmail(company.email)
      setCompGST(company.gstNumber)
      setCompWCB(company.wcbNumber)
    }
  }, [company])

  // ── Sync client quand on sélectionne ─────────────────────────────
  const handleSelectClient = (id: string) => {
    setClientId(id)
    const cl = clients.find(c => c.id === id)
    if (cl) {
      setClientName(cl.name)
      setClientAddress(cl.address ?? '')
      setClientEmail(cl.email ?? '')
      setClientPhone(cl.phone ?? '')
    }
  }

  // ── Calculs ───────────────────────────────────────────────────────
  const subtotal    = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const discountAmt = subtotal * (discountPct / 100)
  const taxable     = subtotal - discountAmt
  const taxAmt      = taxable * (taxRate / 100)
  const total       = taxable + taxAmt
  const balanceDue  = total - depositAmount

  // ── Gestion lignes ────────────────────────────────────────────────
  const addLine = () =>
    setLines(l => [...l, { id: uid(), description: '', qty: 1, unit: t('unité', 'unit'), unitPrice: 0 }])

  const updateLine = (id: string, field: keyof LineItem, value: string | number) =>
    setLines(l => l.map(li => li.id === id ? { ...li, [field]: value } : li))

  const removeLine = (id: string) =>
    setLines(l => l.filter(li => li.id !== id))

  // ── Sauvegarde ───────────────────────────────────────────────────
  const save = () => {
    const payload: GCPDocument = {
      id: docId,
      type: docType,
      number: docNumber,
      date: docDate,
      dueDate,
      status,
      clientId,
      clientName,
      clientAddress,
      clientEmail,
      clientPhone,
      companyName: compName,
      companyAddress: `${compAddress}, ${compCity} ${compProvince} ${compPostal}`,
      companyPhone: compPhone,
      companyEmail: compEmail,
      companyGST: compGST,
      companyWCB: compWCB,
      companyLogo: company.logoUrl,
      lines,
      subtotal,
      discountPct,
      discountAmount: discountAmt,
      taxRate,
      taxAmount: taxAmt,
      total,
      depositAmount,
      balanceDue,
      notes,
      signature,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (existing) {
      updateDocument(docId, payload)
    } else {
      addDocument(docType)
      updateDocument(docId, payload)
    }
    router.push('/documents')
  }

  // ── Actions ──────────────────────────────────────────────────────
  const docTypeLabel = docType === 'invoice'
    ? t('Facture', 'Invoice')
    : docType === 'quote'
    ? t('Devis', 'Quote')
    : t('Contrat', 'Contract')

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`${docTypeLabel} ${docNumber} — ${compName}`)
    const bodyLines = [
      t(`Bonjour ${clientName},`, `Hello ${clientName},`),
      '',
      t(
        `Veuillez trouver ci-joint votre ${docTypeLabel.toLowerCase()} #${docNumber}.`,
        `Please find attached your ${docTypeLabel} #${docNumber}.`
      ),
      '',
      `${t('Sous-total', 'Subtotal')}: ${fmt(subtotal)}`,
      ...(discountPct > 0 ? [`${t('Remise', 'Discount')} (${discountPct}%): -${fmt(discountAmt)}`] : []),
      `GST (${taxRate}%): ${fmt(taxAmt)}`,
      `${t('TOTAL', 'TOTAL')}: ${fmt(total)}`,
      ...(depositAmount > 0 ? [`${t('Solde dû', 'Balance Due')}: ${fmt(balanceDue)}`] : []),
      ...(dueDate ? [`${t('Échéance', 'Due Date')}: ${dueDate}`] : []),
      '',
      notes ? `${t('Notes', 'Notes')}: ${notes}` : '',
      '',
      t('Merci pour votre confiance!', 'Thank you for your business!'),
      compName,
      compPhone,
    ].filter(l => l !== undefined)
    const body = encodeURIComponent(bodyLines.join('\n'))
    const to = clientEmail || ''
    window.open(`mailto:${to}?subject=${subject}&body=${body}`)
  }

  const handleSendSMS = () => {
    const msgLines = [
      `${compName}`,
      `${docTypeLabel} #${docNumber}`,
      `${t('Client', 'Client')}: ${clientName}`,
      `${t('Total', 'Total')}: ${fmt(total)}`,
      ...(depositAmount > 0 ? [`${t('Solde dû', 'Balance Due')}: ${fmt(balanceDue)}`] : []),
      ...(dueDate ? [`${t('Échéance', 'Due')}: ${dueDate}`] : []),
    ]
    const body = encodeURIComponent(msgLines.join('\n'))
    const phone = clientPhone.replace(/\D/g, '')
    window.open(`sms:${phone ? `+1${phone}` : ''}?body=${body}`)
  }

  const handlePrintPdf = () => {
    setShowPdfPreview(true)
    setTimeout(() => window.print(), 400)
  }

  // ── Signature canvas ────────────────────────────────────────────
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    const ctx = sigRef.current?.getContext('2d')
    if (!ctx) return
    const r = sigRef.current!.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top)
  }
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const ctx = sigRef.current?.getContext('2d')
    if (!ctx) return
    const r = sigRef.current!.getBoundingClientRect()
    ctx.strokeStyle = isDeco ? '#D6B25E' : '#a855f7'
    ctx.lineWidth = 2
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top)
    ctx.stroke()
  }
  const endDraw = () => {
    setDrawing(false)
    setSignature(sigRef.current?.toDataURL() ?? '')
  }
  const clearSig = () => {
    const ctx = sigRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, sigRef.current!.width, sigRef.current!.height)
    setSignature('')
  }

  // ── UI classes ─────────────────────────────────────────────────
  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco
      ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum
      ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'
    }`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const TABS = [
    { id: 'info',  icon: '📋', label: t('Info', 'Info') },
    { id: 'lines', icon: '📝', label: t('Lignes', 'Lines') },
    { id: 'total', icon: '💰', label: t('Total', 'Total') },
    { id: 'sign',  icon: '✍️', label: t('Signature', 'Sign') },
  ] as const

  const DOC_TYPES = [
    { id: 'invoice',  emoji: '🧾', label: t('Facture', 'Invoice') },
    { id: 'quote',    emoji: '📄', label: t('Devis', 'Quote') },
    { id: 'contract', emoji: '📜', label: t('Contrat', 'Contract') },
  ] as const

  const STATUSES = [
    { id: 'draft',   label: t('Brouillon', 'Draft'),   color: 'bg-gray-500/20 text-gray-400' },
    { id: 'sent',    label: t('Envoyé', 'Sent'),       color: 'bg-blue-500/20 text-blue-300' },
    { id: 'paid',    label: t('Payé', 'Paid'),         color: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'overdue', label: t('En retard', 'Overdue'), color: 'bg-red-500/20 text-red-400' },
  ] as const

  // ── Couleur accent selon thème ────────────────────────────────
  const accentColor = isDeco ? '#D6B25E' : isQuantum ? '#a855f7' : '#3b82f6'
  const accentBg    = isDeco ? 'rgba(214,178,94,0.12)' : isQuantum ? 'rgba(168,85,247,0.12)' : 'rgba(59,130,246,0.12)'
  const accentBorder = isDeco ? 'rgba(214,178,94,0.3)' : isQuantum ? 'rgba(168,85,247,0.3)' : 'rgba(59,130,246,0.3)'

  // ── Contenu du PDF (document formaté) ────────────────────────
  const companyFullAddress = [compAddress, compCity, compProvince, compPostal].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 relative" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {isDeco && <DecoBackground />}

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
              ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            ←
          </button>
          {isDeco ? (
            <DecoTitle>{existing ? t('Modifier', 'Edit') : t('Nouveau', 'New')} {docType === 'invoice' ? t('Facture', 'Invoice') : docType === 'quote' ? t('Devis', 'Quote') : t('Contrat', 'Contract')}</DecoTitle>
          ) : (
            <h1 className={`text-xl font-black tracking-tight
              ${isXP ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'
                : isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400'
                : 'text-white'}`}>
              {existing ? t('Modifier', 'Edit') : t('Nouveau', 'New')} {docType === 'invoice' ? '🧾' : docType === 'quote' ? '📄' : '📜'}
            </h1>
          )}
        </div>

        {/* Type + Statut */}
        <div className={`rounded-2xl p-4 mb-4 ${cardClass}
          ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
            : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
            : 'bg-white/5 border border-white/10'}`}>
          {isDeco && <DecoCorners />}

          <div className="flex gap-2 mb-4">
            {DOC_TYPES.map(dt => (
              <button key={dt.id} onClick={() => setDocType(dt.id as any)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                  ${docType === dt.id
                    ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]'
                      : isQuantum ? 'bg-violet-600 text-white'
                      : 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50'}`}>
                {dt.emoji} {dt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('N° Document', 'Doc Number')}</label>
              <input className={inputClass} value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder="INV-2024-001" />
            </div>
            <div>
              <label className={labelClass}>{t('Date', 'Date')}</label>
              <input className={inputClass} type="date" value={docDate}
                onChange={e => setDocDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{t('Échéance', 'Due Date')}</label>
              <input className={inputClass} type="date" value={dueDate}
                onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{t('Statut', 'Status')}</label>
              <select className={inputClass} value={status}
                onChange={e => setStatus(e.target.value as any)}>
                {STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id as any)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${tab === tb.id
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]'
                    : isQuantum ? 'bg-violet-600 text-white'
                    : 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* ─── TAB INFO ─── */}
        {tab === 'info' && (
          <div className="space-y-4">
            {/* Infos compagnie */}
            <div className={`rounded-2xl p-5 space-y-3 ${cardClass}
              ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                : 'bg-white/5 border border-white/10'}`}>
              {isDeco && <DecoCorners />}
              <div className="flex items-center gap-2 mb-3">
                {company.logoUrl && (
                  <img src={company.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
                )}
                <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                  🏢 {t('Votre compagnie', 'Your Company')}
                  <span className="ml-2 text-xs font-normal text-white/40">
                    {t('(depuis Réglages)', '(from Settings)')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>{t('Nom compagnie', 'Company Name')}</label>
                  <input className={inputClass} value={compName}
                    onChange={e => setCompName(e.target.value)} placeholder="Hailite Xteriors" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('Adresse', 'Address')}</label>
                  <input className={inputClass} value={compAddress}
                    onChange={e => setCompAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div>
                  <label className={labelClass}>{t('Ville', 'City')}</label>
                  <input className={inputClass} value={compCity}
                    onChange={e => setCompCity(e.target.value)} placeholder="Calgary" />
                </div>
                <div>
                  <label className={labelClass}>{t('Province', 'Province/State')}</label>
                  <input className={inputClass} value={compProvince}
                    onChange={e => setCompProvince(e.target.value)} placeholder="AB" />
                </div>
                <div>
                  <label className={labelClass}>{t('Code postal', 'Postal Code')}</label>
                  <input className={inputClass} value={compPostal}
                    onChange={e => setCompPostal(e.target.value)} placeholder="T2X 1A1" />
                </div>
                <div>
                  <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
                  <input className={inputClass} value={compPhone}
                    onChange={e => setCompPhone(e.target.value)} placeholder="403-555-1234" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('Courriel', 'Email')}</label>
                  <input className={inputClass} value={compEmail}
                    onChange={e => setCompEmail(e.target.value)} placeholder="info@hailite.ca" />
                </div>
                <div>
                  <label className={labelClass}>{t('N° TPS/GST', 'GST Number')}</label>
                  <input className={inputClass} value={compGST}
                    onChange={e => setCompGST(e.target.value)} placeholder="123456789 RT0001" />
                </div>
                <div>
                  <label className={labelClass}>{t('N° WCB', 'WCB Number')}</label>
                  <input className={inputClass} value={compWCB}
                    onChange={e => setCompWCB(e.target.value)} placeholder="WCB-XXXXXX" />
                </div>
              </div>
            </div>

            {/* Infos client */}
            <div className={`rounded-2xl p-5 space-y-3 ${cardClass}
              ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                : 'bg-white/5 border border-white/10'}`}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                👥 {t('Client', 'Client')}
              </div>

              {clients.length > 0 && (
                <div>
                  <label className={labelClass}>👥 {t('Choisir un client existant', 'Select Existing Client')}</label>
                  <select className={inputClass} value={clientId}
                    onChange={e => handleSelectClient(e.target.value)}>
                    <option value="">{t('— Nouveau client —', '— New Client —')}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>{t('Nom du client', "Client's Name")}</label>
                  <input className={inputClass} value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder={t('Jean Tremblay', 'John Smith')} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('Adresse client', 'Client Address')}</label>
                  <input className={inputClass} value={clientAddress}
                    onChange={e => setClientAddress(e.target.value)}
                    placeholder="456 Oak Ave, Calgary AB" />
                </div>
                <div>
                  <label className={labelClass}>{t('Courriel', 'Email')}</label>
                  <input className={inputClass} value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@email.com" />
                </div>
                <div>
                  <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
                  <input className={inputClass} value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="403-555-5678" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB LIGNES ─── */}
        {tab === 'lines' && (
          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={line.id} className={`rounded-2xl p-4 space-y-3 ${cardClass}
                ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                  : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                  : 'bg-white/5 border border-white/10'}`}>
                {isDeco && <DecoCorners />}

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest
                    ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/40'}`}>
                    {t('Ligne', 'Line')} {idx + 1}
                  </span>
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(line.id)}
                      className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center justify-center">
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label className={labelClass}>{t('Description', 'Description')}</label>
                  <input className={inputClass} value={line.description}
                    onChange={e => updateLine(line.id, 'description', e.target.value)}
                    placeholder={t('Remplacement de toiture...', 'Roof replacement...')} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelClass}>{t('Qté', 'Qty')}</label>
                    <input className={inputClass} type="number" value={line.qty}
                      onChange={e => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('Unité', 'Unit')}</label>
                    <input className={inputClass} value={line.unit}
                      onChange={e => updateLine(line.id, 'unit', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('Prix unit.', 'Unit Price')}</label>
                    <input className={inputClass} type="number" value={line.unitPrice}
                      onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className={`text-right text-sm font-bold
                  ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>
                  = {fmt(line.qty * line.unitPrice)}
                </div>
              </div>
            ))}

            <button onClick={addLine}
              className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all
                ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60 hover:border-[#D6B25E]/60'
                  : isQuantum ? 'border-violet-500/30 text-violet-400/60 hover:border-violet-500/60'
                  : 'border-white/20 text-white/40 hover:border-white/40'}`}>
              ➕ {t('Ajouter une ligne', 'Add Line')}
            </button>
          </div>
        )}

        {/* ─── TAB TOTAL ─── */}
        {tab === 'total' && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
              ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                : 'bg-white/5 border border-white/10'}`}>
              {isDeco && <DecoCorners />}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('Remise %', 'Discount %')}</label>
                  <input className={inputClass} type="number" value={discountPct}
                    onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)} min="0" max="100" />
                </div>
                <div>
                  <label className={labelClass}>{t('TPS/GST %', 'GST %')}</label>
                  <input className={inputClass} type="number" value={taxRate}
                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} min="0" max="100" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t('Dépôt reçu $', 'Deposit Received $')}</label>
                  <input className={inputClass} type="number" value={depositAmount}
                    onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)} min="0" />
                </div>
              </div>

              {/* Récapitulatif */}
              <div className={`rounded-xl p-4 space-y-2 ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/20'
                : 'bg-white/5 border border-white/10'}`}>
                {[
                  { label: t('Sous-total', 'Subtotal'), val: subtotal },
                  ...(discountPct > 0 ? [{ label: `🏷️ ${t('Remise', 'Discount')} (${discountPct}%)`, val: -discountAmt }] : []),
                  { label: `🇨🇦 GST (${taxRate}%)`, val: taxAmt },
                  { label: t('💰 TOTAL', '💰 TOTAL'), val: total, big: true },
                  ...(depositAmount > 0 ? [
                    { label: t('✅ Dépôt reçu', '✅ Deposit Received'), val: -depositAmount },
                    { label: t('🔴 Solde dû', '🔴 Balance Due'), val: balanceDue, big: true, red: true },
                  ] : []),
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center
                    ${(row as any).big ? 'pt-2 border-t border-white/10' : ''}`}>
                    <span className={`text-sm ${(row as any).big ? 'font-black' : 'text-white/60'}`}>
                      {row.label}
                    </span>
                    <span className={`font-bold
                      ${(row as any).red ? 'text-red-400 text-lg' : (row as any).big
                        ? isDeco ? 'text-[#D6B25E] text-xl' : isQuantum ? 'text-violet-300 text-xl' : 'text-white text-xl'
                        : 'text-white/80 text-sm'}`}>
                      {fmt(row.val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t('Notes / Conditions', 'Notes / Terms')}</label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-none`}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('Merci pour votre confiance!', 'Thank you for your business!')}
                />
              </div>

              {isDeco && <DecoDiamondRow />}
            </div>
          </div>
        )}

        {/* ─── TAB SIGNATURE ─── */}
        {tab === 'sign' && (
          <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}

            <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              ✍️ {t('Signature du client', 'Client Signature')}
            </div>

            <div className={`rounded-xl overflow-hidden border
              ${isDeco ? 'border-[#D6B25E]/30 bg-[#0a0700]'
                : 'border-white/20 bg-black/30'}`}>
              <canvas
                ref={sigRef} width={320} height={160}
                className="w-full touch-none cursor-crosshair"
                onPointerDown={startDraw} onPointerMove={draw}
                onPointerUp={endDraw} onPointerLeave={endDraw}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={clearSig}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                🗑️ {t('Effacer', 'Clear')}
              </button>
              {signature && (
                <div className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 text-center">
                  ✅ {t('Signée', 'Signed')}
                </div>
              )}
            </div>

            {signature && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/20">
                <img src={signature} alt="Signature" className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
             SECTION ACTIONS — Email / SMS / Preview PDF / Télécharger
            ═══════════════════════════════════════════════════════════════ */}
        <div className={`rounded-2xl p-4 mt-4 ${cardClass}
          ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
            : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
            : 'bg-white/5 border border-white/10'}`}>
          {isDeco && <DecoCorners />}

          <p className={`text-xs font-bold uppercase tracking-widest mb-3
            ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/50'}`}>
            📤 {t('Envoyer & Exporter', 'Send & Export')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Email */}
            <button
              onClick={handleSendEmail}
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
              className="rounded-xl py-3 px-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95">
              <span className="text-2xl">📧</span>
              {t('Envoyer Email', 'Send Email')}
            </button>

            {/* SMS */}
            <button
              onClick={handleSendSMS}
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
              className="rounded-xl py-3 px-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95">
              <span className="text-2xl">📱</span>
              {t('Envoyer SMS', 'Send SMS')}
            </button>

            {/* Preview PDF */}
            <button
              onClick={() => setShowPdfPreview(true)}
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
              className="rounded-xl py-3 px-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95">
              <span className="text-2xl">👁️</span>
              {t('Preview PDF', 'Preview PDF')}
            </button>

            {/* Télécharger PDF */}
            <button
              onClick={handlePrintPdf}
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
              className="rounded-xl py-3 px-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95">
              <span className="text-2xl">⬇️</span>
              {t('Télécharger PDF', 'Download PDF')}
            </button>
          </div>
        </div>

        {/* ─── BOUTON SAUVEGARDER ─── */}
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <button onClick={save}
            className={`w-full max-w-lg mx-auto block py-4 rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95
              ${isDeco
                ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00] shadow-[#D6B25E]/30'
                : isQuantum
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-violet-500/30'
                : isAventure
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : isXP
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'
              }`}>
            💾 {t('Sauvegarder', 'Save')} {docType === 'invoice' ? t('la facture', 'Invoice') : docType === 'quote' ? t('le devis', 'Quote') : t('le contrat', 'Contract')}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
           MODAL PDF PREVIEW
          ═══════════════════════════════════════════════════════════════════════ */}
      {showPdfPreview && (
        <div
          id="pdf-modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', alignItems: 'flex-end', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ background: '#f3f4f6', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '96vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Header modal */}
            <div style={{ position: 'sticky', top: 0, background: '#1f2937', borderRadius: '20px 20px 0 0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div>
                <p style={{ color: 'white', fontSize: '15px', fontWeight: 800 }}>
                  👁️ {t('Preview', 'Preview')} — {docTypeLabel} {docNumber}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                  {clientName || t('Sans client', 'No client')} · {fmt(total)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{ background: '#3b82f6', border: 'none', borderRadius: '10px', padding: '8px 14px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  🖨️ {t('Imprimer / PDF', 'Print / PDF')}
                </button>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  style={{ background: '#374151', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Document formaté (fond blanc, printable) */}
            <div id="document-to-print" style={{ background: 'white', margin: '12px', borderRadius: '12px', padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

              {/* ── EN-TÊTE ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
                <div>
                  {company.logoUrl && (
                    <img src={company.logoUrl} alt="Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
                  )}
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginBottom: '4px' }}>
                    {compName || 'Hailite Xteriors'}
                  </p>
                  {compAddress && <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>{compAddress}</p>}
                  {(compCity || compProvince) && (
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>
                      {[compCity, compProvince, compPostal].filter(Boolean).join(' ')}
                    </p>
                  )}
                  {compPhone && <p style={{ fontSize: '11px', color: '#6b7280' }}>📞 {compPhone}</p>}
                  {compEmail && <p style={{ fontSize: '11px', color: '#6b7280' }}>✉️ {compEmail}</p>}
                  {compGST && <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>TPS/GST: {compGST}</p>}
                  {compWCB && <p style={{ fontSize: '10px', color: '#9ca3af' }}>WCB: {compWCB}</p>}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: accentColor, letterSpacing: '-0.5px' }}>
                    {docType === 'invoice' ? t('FACTURE', 'INVOICE') : docType === 'quote' ? t('DEVIS', 'QUOTE') : t('CONTRAT', 'CONTRACT')}
                  </p>
                  {docNumber && (
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginTop: '4px' }}>#{docNumber}</p>
                  )}
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                    {t('Date :', 'Date:')} {docDate}
                  </p>
                  {dueDate && (
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>
                      {t('Échéance :', 'Due:')} {dueDate}
                    </p>
                  )}
                  <span style={{
                    display: 'inline-block', marginTop: '8px', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                    background: status === 'paid' ? '#d1fae5' : status === 'overdue' ? '#fee2e2' : status === 'sent' ? '#dbeafe' : '#f3f4f6',
                    color: status === 'paid' ? '#065f46' : status === 'overdue' ? '#991b1b' : status === 'sent' ? '#1e40af' : '#6b7280',
                  }}>
                    {status === 'paid' ? t('PAYÉ', 'PAID') : status === 'overdue' ? t('EN RETARD', 'OVERDUE') : status === 'sent' ? t('ENVOYÉ', 'SENT') : t('BROUILLON', 'DRAFT')}
                  </span>
                </div>
              </div>

              {/* ── INFOS CLIENT ── */}
              {clientName && (
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', marginBottom: '20px', borderLeft: `4px solid ${accentColor}` }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    {t('FACTURÉ À', 'BILL TO')}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{clientName}</p>
                  {clientAddress && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{clientAddress}</p>}
                  {clientPhone && <p style={{ fontSize: '12px', color: '#6b7280' }}>📞 {clientPhone}</p>}
                  {clientEmail && <p style={{ fontSize: '12px', color: '#6b7280' }}>✉️ {clientEmail}</p>}
                </div>
              )}

              {/* ── TABLEAU LIGNES ── */}
              {lines.some(l => l.description || l.unitPrice > 0) && (
                <div style={{ marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', borderBottom: `2px solid ${accentColor}` }}>
                        {[
                          { label: t('Description', 'Description'), align: 'left', width: '45%' },
                          { label: t('Qté', 'Qty'), align: 'center', width: '10%' },
                          { label: t('Unité', 'Unit'), align: 'center', width: '12%' },
                          { label: t('Prix unit.', 'Unit Price'), align: 'right', width: '16%' },
                          { label: t('Total', 'Total'), align: 'right', width: '17%' },
                        ].map(h => (
                          <th key={h.label} style={{ padding: '8px 6px', textAlign: h.align as any, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', width: h.width }}>
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.filter(l => l.description || l.unitPrice > 0).map((line, i) => (
                        <tr key={line.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 6px', color: '#374151', fontWeight: 500 }}>{line.description}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'center', color: '#374151' }}>{line.qty}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'center', color: '#6b7280' }}>{line.unit}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', color: '#374151' }}>{fmt(line.unitPrice)}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', color: '#111827', fontWeight: 700 }}>{fmt(line.qty * line.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── TOTAUX ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ minWidth: '260px', background: '#f9fafb', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb' }}>
                  {[
                    { label: t('Sous-total', 'Subtotal'), value: fmt(subtotal), muted: true },
                    ...(discountPct > 0 ? [{ label: `${t('Remise', 'Discount')} (${discountPct}%)`, value: `-${fmt(discountAmt)}`, red: true }] : []),
                    { label: `GST (${taxRate}%)`, value: fmt(taxAmt), muted: true },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{row.label}</p>
                      <p style={{ fontSize: '12px', color: (row as any).red ? '#ef4444' : '#374151', fontWeight: 600 }}>{row.value}</p>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '2px solid #e5e7eb', marginTop: '4px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#111827' }}>TOTAL</p>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: accentColor }}>{fmt(total)}</p>
                  </div>
                  {depositAmount > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>{t('Dépôt reçu', 'Deposit Received')}</p>
                        <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>-{fmt(depositAmount)}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#fef2f2', borderRadius: '8px', marginTop: '6px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b' }}>{t('SOLDE DÛ', 'BALANCE DUE')}</p>
                        <p style={{ fontSize: '16px', fontWeight: 900, color: '#ef4444' }}>{fmt(balanceDue)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── NOTES ── */}
              {notes && (
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', marginBottom: '20px', borderLeft: `3px solid ${accentColor}` }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    {t('Notes / Conditions', 'Notes / Terms')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notes}</p>
                </div>
              )}

              {/* ── SIGNATURE ── */}
              {signature && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    ✍️ {t('Signature du client', 'Client Signature')}
                  </p>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', maxWidth: '240px' }}>
                    <img src={signature} alt="Signature" style={{ width: '100%', display: 'block' }} />
                  </div>
                </div>
              )}

              {/* ── LIGNES DE SIGNATURE (si pas de signature numérique) ── */}
              {!signature && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                  {[t('Signature client', 'Client Signature'), t('Signature autorisée', 'Authorized Signature')].map(label => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '44px', marginBottom: '6px' }} />
                      <p style={{ fontSize: '10px', color: '#9ca3af' }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── PIED DE PAGE ── */}
              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '20px', paddingTop: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {compName} · {compPhone} · {compEmail}
                  {compGST ? ` · TPS/GST: ${compGST}` : ''}
                </p>
                <p style={{ fontSize: '9px', color: '#d1d5db', marginTop: '4px' }}>
                  {t('Généré par Gestion Chantier Pro — Hailite Xteriors', 'Generated by Gestion Chantier Pro — Hailite Xteriors')}
                </p>
              </div>

            </div>{/* end document-to-print */}

            {/* Boutons bas modal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px 16px 24px' }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '14px', borderRadius: '12px', background: accentColor, border: 'none', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                🖨️ {t('Imprimer / PDF', 'Print / PDF')}
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                style={{ padding: '14px', borderRadius: '12px', background: '#374151', border: 'none', color: '#d1d5db', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                ✕ {t('Fermer', 'Close')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
