'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useCompanyStore } from '@/store/useCompanyStore';
import { useClientStore } from '@/store/useClientStore';
import { useLangStore } from '@/store/useLangStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Document, DocumentType, DocumentStatus } from '@/types/documents';
import BottomNav from '@/components/BottomNav';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${(n || 0).toFixed(2)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
};

const DOC_LABELS: Record<DocumentType, { fr: string; en: string; emoji: string }> = {
  facture:  { fr: 'Facture',  en: 'Invoice',  emoji: '🧾' },
  devis:    { fr: 'Devis',    en: 'Quote',    emoji: '📋' },
  contrat:  { fr: 'Contrat',  en: 'Contract', emoji: '📝' },
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  brouillon: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  envoye:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  accepte:   'bg-green-500/20 text-green-300 border-green-500/30',
  refuse:    'bg-red-500/20 text-red-300 border-red-500/30',
  paye:      'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const STATUS_LABELS: Record<DocumentStatus, { fr: string; en: string }> = {
  brouillon: { fr: 'Brouillon', en: 'Draft' },
  envoye:    { fr: 'Envoyé',    en: 'Sent' },
  accepte:   { fr: 'Accepté',  en: 'Accepted' },
  refuse:    { fr: 'Refusé',   en: 'Declined' },
  paye:      { fr: 'Payé',     en: 'Paid' },
};

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ onSave, existing, onClear, label }: {
  onSave: (data: string) => void;
  existing?: string;
  onClear: () => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDraw, setHasDraw] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true); setHasDraw(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); setDrawing(false); };

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDraw(false); onClear();
  };

  const save = () => {
    const canvas = canvasRef.current; if (!canvas || !hasDraw) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-yellow-400 uppercase tracking-widest">✍️ {label}</label>
      {existing && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-2 mb-1">
          <p className="text-xs text-green-400 mb-1">✅ Signature enregistrée</p>
          <img src={existing} alt="sig" className="max-h-10 mx-auto" />
        </div>
      )}
      <canvas
        ref={canvasRef} width={600} height={150}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        className="w-full rounded-xl border-2 border-dashed border-orange-400/50 bg-white/5 cursor-crosshair touch-none"
        style={{ height: '110px' }}
      />
      <div className="flex gap-2">
        <button onClick={clear}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition font-semibold">
          🗑️ Effacer
        </button>
        <button onClick={save} disabled={!hasDraw && !existing}
          className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 py-2.5 text-sm font-bold text-white transition">
          ✅ Enregistrer
        </button>
      </div>
    </div>
  );
}

// ─── Client Picker ────────────────────────────────────────────────────────────
function ClientPickerModal({ onSelect, onClose, lang }: {
  onSelect: (id: string) => void;
  onClose: () => void;
  lang: string;
}) {
  const { clients } = useClientStore();
  const [search, setSearch] = useState('');
  const filtered = (clients as Array<{id:string;name:string;email?:string;phone?:string;address?:string;city?:string}>)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl bg-gray-900 border-t border-white/10 p-5 pb-8 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">👥 {lang === 'fr' ? 'Choisir un client' : 'Choose a client'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'fr' ? 'Rechercher...' : 'Search...'}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none mb-3" />
        <div className="overflow-y-auto space-y-2 flex-1">
          {filtered.map(c => (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className="w-full text-left rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-orange-400/50 hover:bg-orange-500/10 transition">
              <p className="font-semibold text-white text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.email} · {c.phone}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-6">
              {lang === 'fr' ? 'Aucun client trouvé' : 'No client found'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { documents, updateDocument, addDocument, addLineItem, updateLineItem, removeLineItem,
          calculateTotals, addTax, updateTax, removeTax, updateDiscount, updateDeposit } = useDocumentStore();
  const { company } = useCompanyStore();
  const { clients } = useClientStore();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Trouver le doc existant
  const doc = documents.find(d => d.id === docId);

  const [tab, setTab] = useState<'details' | 'items' | 'financials' | 'preview'>('details');
  const [saved, setSaved] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // ── Spinner hydratation ───────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">📄</div>
          <p className="text-gray-400 text-sm">{t('Chargement...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // ── Doc introuvable ───────────────────────────────────────────────────────
  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="text-5xl">❓</div>
          <p className="text-white font-bold">{t('Document introuvable', 'Document not found')}</p>
          <button onClick={() => router.push('/documents')}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold">
            {t('Retour', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const label = DOC_LABELS[doc.type];

  const handleSelectClient = (clientId: string) => {
    const c = (clients as Array<{id:string;name:string;email?:string;phone?:string;address?:string;city?:string;province?:string;postalCode?:string}>)
      .find(cl => cl.id === clientId);
    if (!c) return;
    updateDocument(doc.id, {
      client: {
        name: c.name,
        address: c.address ?? '',
        city: c.city ?? '',
        province: c.province ?? 'AB',
        postalCode: c.postalCode ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
      }
    });
    setShowClientPicker(false);
  };

  const handleSave = () => {
    // Auto-remplir infos compagnie depuis le store
    updateDocument(doc.id, {
      company: {
        name: company.name || 'Hailite Xteriors',
        address: company.address,
        city: `${company.city}${company.province ? ', ' + company.province : ''} ${company.postalCode}`.trim(),
        province: company.province,
        postalCode: company.postalCode,
        email: company.email,
        phone: company.phone,
        license: company.licenseNumber,
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEmail = () => {
    const subj = encodeURIComponent(`${lang === 'fr' ? label.fr : label.en} #${doc.number} — ${doc.company.name}`);
    const body = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ${doc.client.name},\n\nVeuillez trouver votre ${label.fr.toLowerCase()} #${doc.number}.\n\nTotal : ${fmt(doc.total)} | Solde dû : ${fmt(doc.balanceDue)}\n\nMerci,\n${doc.company.name}`
        : `Hello ${doc.client.name},\n\nPlease find your ${label.en.toLowerCase()} #${doc.number}.\n\nTotal: ${fmt(doc.total)} | Balance due: ${fmt(doc.balanceDue)}\n\nThank you,\n${doc.company.name}`
    );
    window.location.href = `mailto:${doc.client.email}?subject=${subj}&body=${body}`;
  };

  const handleSMS = () => {
    const msg = encodeURIComponent(
      `${doc.company.name} — ${lang === 'fr' ? label.fr : label.en} #${doc.number}\nTotal: ${fmt(doc.total)} | ${lang === 'fr' ? 'Solde dû' : 'Balance due'}: ${fmt(doc.balanceDue)}`
    );
    window.location.href = `sms:${doc.client.phone}?body=${msg}`;
  };

  const TABS = [
    { id: 'details'    as const, label: t('Détails', 'Details') },
    { id: 'items'      as const, label: t('Lignes', 'Items') },
    { id: 'financials' as const, label: t('Montants', 'Amounts') },
    { id: 'preview'    as const, label: t('Aperçu', 'Preview') },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gray-950/98 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-2xl leading-none">←</button>
          <span className="text-lg">{label.emoji}</span>
          <span className="font-black text-base flex-1 truncate">
            {lang === 'fr' ? label.fr : label.en} {doc.number}
          </span>
          {/* Status badge cliquable */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`text-xs px-2 py-1 rounded-full border font-semibold ${STATUS_COLORS[doc.status]}`}>
              {STATUS_LABELS[doc.status][lang as 'fr' | 'en'] ?? doc.status} ▾
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-8 bg-gray-800 border border-white/10 rounded-xl overflow-hidden z-50 min-w-32">
                {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map(s => (
                  <button key={s} onClick={() => { updateDocument(doc.id, { status: s }); setShowStatusMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white">
                    {STATUS_LABELS[s][lang as 'fr' | 'en']}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === tb.id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU — padding bas généreux pour la barre d'actions */}
      <div className="px-4 pt-4 pb-44 space-y-4">

        {/* ═══ DÉTAILS ═══ */}
        {tab === 'details' && (
          <>
            {/* Compagnie auto */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">🏢 {t('Compagnie', 'Company')}</h3>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">✅ Auto</span>
              </div>
              {(company.logo || company.logoUrl) && (
                <img src={company.logo || company.logoUrl} alt="logo" className="h-10 mb-2 rounded object-contain" />
              )}
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="font-bold text-white">{company.name || 'Hailite Xteriors'}</p>
                {company.address && <p>{company.address}</p>}
                {company.city && <p>{company.city}, {company.province} {company.postalCode}</p>}
                {company.phone && <p>{company.phone}</p>}
                {company.email && <p>{company.email}</p>}
                {company.gstNumber && <p className="text-xs text-gray-500">GST: {company.gstNumber}</p>}
                {company.wcbNumber && <p className="text-xs text-gray-500">WCB: {company.wcbNumber}</p>}
              </div>
              <button onClick={() => router.push('/settings')}
                className="mt-2 text-xs text-orange-400 underline">
                ✏️ {t('Modifier dans Réglages', 'Edit in Settings')}
              </button>
            </div>

            {/* Client */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">👤 Client</h3>
                <button onClick={() => setShowClientPicker(true)}
                  className="rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 text-xs font-bold hover:bg-blue-500/30 transition">
                  👥 {t('Choisir', 'Choose')}
                </button>
              </div>
              {doc.client.name ? (
                <div className="text-sm text-gray-300 space-y-0.5">
                  <p className="font-bold text-white">{doc.client.name}</p>
                  {doc.client.address && <p>{doc.client.address}</p>}
                  {doc.client.city && <p>{doc.client.city}</p>}
                  {doc.client.phone && <p>{doc.client.phone}</p>}
                  {doc.client.email && <p>{doc.client.email}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {([
                    { k: 'name',       lbl: t('Nom', 'Name'),         ph: 'John Smith'      },
                    { k: 'address',    lbl: t('Adresse', 'Address'),  ph: '456 Oak Ave'     },
                    { k: 'city',       lbl: t('Ville', 'City'),       ph: 'Calgary, AB'     },
                    { k: 'phone',      lbl: t('Tél', 'Phone'),        ph: '403-555-0000'    },
                    { k: 'email',      lbl: 'Email',                   ph: 'client@email.com'},
                  ] as {k: keyof typeof doc.client; lbl: string; ph: string}[]).map(({ k, lbl, ph }) => (
                    <div key={k}>
                      <label className="block text-xs text-gray-500 mb-1">{lbl}</label>
                      <input value={doc.client[k]}
                        onChange={e => updateDocument(doc.id, { client: { ...doc.client, [k]: e.target.value } })}
                        placeholder={ph}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">📅 {t('Dates', 'Dates')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('Date', 'Date')}</label>
                  <input type="date" value={doc.date}
                    onChange={e => updateDocument(doc.id, { date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {doc.type === 'facture' ? t('Échéance', 'Due Date') : t('Valide jusqu\'au', 'Valid Until')}
                  </label>
                  <input type="date" value={doc.dueDate}
                    onChange={e => updateDocument(doc.id, { dueDate: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Notes & Termes */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">📝 Notes</h3>
              <textarea value={doc.notes}
                onChange={e => updateDocument(doc.id, { notes: e.target.value })}
                rows={3} placeholder="Notes..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none" />
              <label className="block text-xs text-gray-500 mb-1">{t('Termes', 'Terms')}</label>
              <textarea value={doc.terms}
                onChange={e => updateDocument(doc.id, { terms: e.target.value })}
                rows={2} placeholder="Net 30..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none resize-none" />
            </div>

            {/* Signatures */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest">✍️ Signatures</h3>
              <SignaturePad
                label={t('Signature contracteur', 'Contractor Signature')}
                onSave={data => updateDocument(doc.id, { contractorSignature: data, contractorSignatureDate: new Date().toISOString() })}
                existing={doc.contractorSignature}
                onClear={() => updateDocument(doc.id, { contractorSignature: '', contractorSignatureDate: '' })}
              />
              <SignaturePad
                label={t('Signature client', 'Client Signature')}
                onSave={data => updateDocument(doc.id, { clientSignature: data, clientSignatureDate: new Date().toISOString() })}
                existing={doc.clientSignature}
                onClear={() => updateDocument(doc.id, { clientSignature: '', clientSignatureDate: '' })}
              />
            </div>
          </>
        )}

        {/* ═══ LIGNES ═══ */}
        {tab === 'items' && (
          <div className="space-y-3">
            {doc.items.map((item, idx) => (
              <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  <button onClick={() => removeLineItem(doc.id, item.id)} className="text-red-400 hover:text-red-300 text-lg leading-none">✕</button>
                </div>
                <div className="space-y-2">
                  <input value={item.description}
                    onChange={e => updateLineItem(doc.id, item.id, { description: e.target.value })}
                    placeholder={t('Description...', 'Description...')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-400 focus:outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('Qté', 'Qty')}</label>
                      <input type="number" value={item.quantity}
                        onChange={e => updateLineItem(doc.id, item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">$/u</label>
                      <input type="number" value={item.unitPrice}
                        onChange={e => updateLineItem(doc.id, item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div className="flex items-end pb-2">
                      <p className="text-sm font-bold text-orange-400">= {fmt(item.quantity * item.unitPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addLineItem(doc.id)}
              className="w-full rounded-2xl border border-dashed border-orange-500/50 bg-orange-500/5 py-4 text-orange-400 font-bold hover:bg-orange-500/10 transition text-sm">
              ＋ {t('Ajouter une ligne', 'Add Line')}
            </button>
          </div>
        )}

        {/* ═══ MONTANTS ═══ */}
        {tab === 'financials' && (
          <div className="space-y-4">
            {/* Taxes */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">🏛️ Taxes</h3>
              {doc.taxes.map(tax => (
                <div key={tax.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={tax.enabled}
                    onChange={e => updateTax(doc.id, tax.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-orange-500" />
                  <input value={tax.name}
                    onChange={e => updateTax(doc.id, tax.id, { name: e.target.value })}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  <input type="number" value={tax.rate}
                    onChange={e => updateTax(doc.id, tax.id, { rate: parseFloat(e.target.value) || 0 })}
                    className="w-16 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white text-right focus:border-orange-400 focus:outline-none" />
                  <span className="text-gray-400 text-sm">%</span>
                  <button onClick={() => removeTax(doc.id, tax.id)} className="text-red-400 text-sm">✕</button>
                </div>
              ))}
              <button onClick={() => addTax(doc.id)}
                className="text-xs text-orange-400 underline">+ {t('Ajouter taxe', 'Add tax')}</button>
            </div>

            {/* Remise */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">🏷️ {t('Remise', 'Discount')}</h3>
              <div className="flex gap-2">
                {(['none', 'percent', 'fixed'] as const).map(dt => (
                  <button key={dt} onClick={() => updateDiscount(doc.id, dt, doc.discountValue)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                      doc.discountType === dt
                        ? 'bg-orange-500 border-orange-400 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}>
                    {dt === 'none' ? t('Aucune', 'None') : dt === 'percent' ? '%' : '$'}
                  </button>
                ))}
              </div>
              {doc.discountType !== 'none' && (
                <input type="number" value={doc.discountValue}
                  onChange={e => updateDiscount(doc.id, doc.discountType, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
              )}
            </div>

            {/* Dépôt */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">💰 {t('Dépôt reçu', 'Deposit Received')}</h3>
              <input type="number" value={doc.deposit}
                onChange={e => updateDeposit(doc.id, parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none" />
            </div>

            {/* Totaux */}
            <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-2">
              {[
                { lbl: t('Sous-total', 'Subtotal'), val: doc.subtotal, cls: 'text-gray-300 text-sm' },
                ...(doc.discountAmount > 0 ? [{ lbl: t('Remise', 'Discount'), val: -doc.discountAmount, cls: 'text-gray-400 text-sm' }] : []),
                { lbl: t('Taxes', 'Taxes'), val: doc.totalTax, cls: 'text-gray-300 text-sm' },
                { lbl: 'TOTAL', val: doc.total, cls: 'font-bold text-white border-t border-white/20 pt-2 mt-1' },
                ...(doc.deposit > 0 ? [{ lbl: t('Dépôt', 'Deposit'), val: -doc.deposit, cls: 'text-gray-400 text-sm' }] : []),
                { lbl: t('SOLDE DÛ', 'BALANCE DUE'), val: doc.balanceDue, cls: 'font-black text-orange-400 text-lg border-t border-orange-500/30 pt-2 mt-1' },
              ].map(({ lbl, val, cls }) => (
                <div key={lbl} className={`flex justify-between items-center ${cls}`}>
                  <span>{lbl}</span>
                  <span className="font-mono">{val < 0 ? `−${fmt(Math.abs(val))}` : fmt(val)}</span>
                </div>
              ))}
            </div>

            {company.eTransferEmail && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-xs text-green-400 font-semibold">💳 E-Transfer: {company.eTransferEmail}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ APERÇU ═══ */}
        {tab === 'preview' && (
          <div id="doc-preview" className="rounded-2xl bg-white text-gray-900 p-5 shadow-2xl">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-5">
              <div>
                {(company.logo || company.logoUrl) && (
                  <img src={company.logo || company.logoUrl} alt="logo" className="h-12 mb-2 object-contain" />
                )}
                <p className="font-black text-xl">{doc.company.name || company.name || 'Hailite Xteriors'}</p>
                {doc.company.address && <p className="text-xs text-gray-500">{doc.company.address}</p>}
                {doc.company.city && <p className="text-xs text-gray-500">{doc.company.city}</p>}
                {doc.company.phone && <p className="text-xs text-gray-500">{doc.company.phone}</p>}
                {doc.company.email && <p className="text-xs text-gray-500">{doc.company.email}</p>}
                {company.gstNumber && <p className="text-xs text-gray-500">GST: {company.gstNumber}</p>}
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-orange-500">
                  {(lang === 'fr' ? label.fr : label.en).toUpperCase()}
                </p>
                <p className="font-bold text-gray-700">#{doc.number}</p>
                <p className="text-xs text-gray-500">{t('Date', 'Date')}: {doc.date}</p>
                <p className="text-xs text-gray-500">
                  {doc.type === 'facture' ? t('Échéance', 'Due') : t('Valide', 'Valid')}: {doc.dueDate}
                </p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  doc.status === 'paye' ? 'bg-green-100 text-green-700' :
                  doc.status === 'brouillon' ? 'bg-gray-100 text-gray-600' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {STATUS_LABELS[doc.status][lang as 'fr' | 'en'].toUpperCase()}
                </span>
              </div>
            </div>

            {/* Client */}
            {doc.client.name && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('Facturé à', 'Bill To')}</p>
                <p className="font-bold">{doc.client.name}</p>
                {doc.client.address && <p className="text-xs text-gray-600">{doc.client.address}</p>}
                {doc.client.city && <p className="text-xs text-gray-600">{doc.client.city}</p>}
                {doc.client.phone && <p className="text-xs text-gray-600">{doc.client.phone}</p>}
                {doc.client.email && <p className="text-xs text-gray-600">{doc.client.email}</p>}
              </div>
            )}

            {/* Lignes */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-xs font-bold text-gray-500 uppercase">{t('Description', 'Description')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">{t('Qté', 'Qty')}</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">$/u</th>
                  <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{item.description || '—'}</td>
                    <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div className="ml-auto w-56 space-y-1 text-sm mb-4">
              <div className="flex justify-between text-gray-600"><span>{t('Sous-total', 'Subtotal')}</span><span>{fmt(doc.subtotal)}</span></div>
              {doc.discountAmount > 0 && (
                <div className="flex justify-between text-gray-600"><span>{t('Remise', 'Disc.')}</span><span>−{fmt(doc.discountAmount)}</span></div>
              )}
              {doc.taxes.filter(t => t.enabled).map(tax => (
                <div key={tax.id} className="flex justify-between text-gray-600">
                  <span>{tax.name} ({tax.rate}%)</span>
                  <span>{fmt((doc.subtotal - doc.discountAmount) * tax.rate / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1"><span>TOTAL</span><span>{fmt(doc.total)}</span></div>
              {doc.deposit > 0 && (
                <>
                  <div className="flex justify-between text-xs text-gray-500"><span>{t('Dépôt', 'Deposit')}</span><span>−{fmt(doc.deposit)}</span></div>
                  <div className="flex justify-between font-black text-orange-600 text-base border-t border-orange-200 pt-1">
                    <span>{t('SOLDE DÛ', 'BALANCE DUE')}</span><span>{fmt(doc.balanceDue)}</span>
                  </div>
                </>
              )}
            </div>

            {doc.notes && (
              <div className="border-t border-gray-200 pt-3 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-600">{doc.notes}</p>
              </div>
            )}
            {doc.terms && <p className="text-xs text-gray-500">{t('Termes', 'Terms')}: {doc.terms}</p>}
            {company.eTransferEmail && <p className="text-xs text-gray-500 mt-1">💳 E-Transfer: {company.eTransferEmail}</p>}

            {/* Signatures */}
            {(doc.contractorSignature || doc.clientSignature) && (
              <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-2 gap-4">
                {doc.contractorSignature && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('Contracteur', 'Contractor')}</p>
                    <img src={doc.contractorSignature} alt="sig" className="h-10 border-b border-gray-400 w-full object-contain" />
                    {doc.contractorSignatureDate && <p className="text-xs text-gray-400 mt-1">{new Date(doc.contractorSignatureDate).toLocaleDateString('fr-CA')}</p>}
                  </div>
                )}
                {doc.clientSignature && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('Client', 'Client')}</p>
                    <img src={doc.clientSignature} alt="sig" className="h-10 border-b border-gray-400 w-full object-contain" />
                    {doc.clientSignatureDate && <p className="text-xs text-gray-400 mt-1">{new Date(doc.clientSignatureDate).toLocaleDateString('fr-CA')}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BARRE D'ACTIONS — au-dessus de la BottomNav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-gray-950/98 backdrop-blur-md border-t border-white/10 px-3 py-2">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button onClick={() => setTab('preview')}
            className="flex-1 flex flex-col items-center gap-0.5 rounded-xl bg-white/5 border border-white/10 py-2 hover:bg-white/10 transition">
            <span className="text-base">👁️</span>
            <span className="text-[10px] text-gray-400 font-bold">{t('Aperçu', 'Preview')}</span>
          </button>
          <button onClick={() => window.print()}
            className="flex-1 flex flex-col items-center gap-0.5 rounded-xl bg-white/5 border border-white/10 py-2 hover:bg-white/10 transition">
            <span className="text-base">📄</span>
            <span className="text-[10px] text-gray-400 font-bold">PDF</span>
          </button>
          <button onClick={handleEmail}
            className="flex-1 flex flex-col items-center gap-0.5 rounded-xl bg-blue-500/20 border border-blue-500/30 py-2 hover:bg-blue-500/30 transition">
            <span className="text-base">📧</span>
            <span className="text-[10px] text-blue-300 font-bold">Email</span>
          </button>
          <button onClick={handleSMS}
            className="flex-1 flex flex-col items-center gap-0.5 rounded-xl bg-green-500/20 border border-green-500/30 py-2 hover:bg-green-500/30 transition">
            <span className="text-base">💬</span>
            <span className="text-[10px] text-green-300 font-bold">SMS</span>
          </button>
          <button onClick={handleSave}
            className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 transition border ${
              saved ? 'bg-green-500 border-green-400' : 'bg-orange-500 hover:bg-orange-600 border-orange-400'
            }`}>
            <span className="text-base">{saved ? '✅' : '💾'}</span>
            <span className="text-[10px] text-white font-bold">{saved ? t('Sauvé!', 'Saved!') : t('Sauver', 'Save')}</span>
          </button>
        </div>
      </div>

      {showClientPicker && (
        <ClientPickerModal onSelect={handleSelectClient} onClose={() => setShowClientPicker(false)} lang={lang} />
      )}

      <BottomNav />
    </div>
  );
}
