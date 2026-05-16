'use client'
import { useState } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useRouter } from 'next/navigation'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Material, Unit, Category } from '@/store/useCatalogueStore'

const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  toiture:     { label: 'Toiture',        emoji: '🏠', color: '#ea580c' },
  siding:      { label: 'Siding',         emoji: '🏡', color: '#f59e0b' },
  fixations:   { label: 'Fixations',      emoji: '🔩', color: '#06b6d4' },
  etancheite:  { label: 'Étanchéité',     emoji: '💧', color: '#3b82f6' },
  structure:   { label: 'Structure',      emoji: '🪵', color: '#22c55e' },
  maindoeuvre: { label: "Main-d'oeuvre",  emoji: '👷', color: '#a855f7' },
}

const UNITS: Unit[] = ['pi²', 'pi lin.', 'boîte', 'rouleau', 'feuille', 'tube', 'unité', 'heure']

type PriceView = 'tous' | 'fournisseur' | 'client'

const emptyForm = () => ({
  name: '', nameen: '', emoji: '📦', category: 'toiture' as Category,
  unit: '' as Unit | '',
  prixClient: '', prixFournisseur: '', description: '',
})

export default function CataloguePage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { addDocument, addLineItem, updateLineItem, calculateTotals } = useDocumentStore()
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useCatalogueStore()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [search, setSearch]           = useState('')
  const [priceView, setPriceView]     = useState<PriceView>('tous')
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm]               = useState(emptyForm())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showAddToDoc, setShowAddToDoc] = useState<Material | null>(null)
  const [qty, setQty] = useState(1)

  // Édition inline
  const [editForm, setEditForm] = useState<Partial<Material> & { unit?: Unit | '' }>({})

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const filtered = materials.filter(m => {
    const matchCat  = selectedCategory === 'all' || m.category === selectedCategory
    const name      = lang === 'fr' ? m.name : (m.nameen || m.name)
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchView =
      priceView === 'tous'         ? true :
      priceView === 'client'       ? (m.prixClient      != null && m.prixClient      > 0) :
      priceView === 'fournisseur'  ? (m.prixFournisseur != null && m.prixFournisseur > 0) :
      true
    return matchCat && matchSearch && matchView
  })

  function handleSaveNew() {
    if (!form.name.trim()) return
    const mat: Omit<Material, 'id'> = {
      name: form.name.trim(),
      category: form.category,
    }
    if (form.nameen.trim())       mat.nameen       = form.nameen.trim()
    if (form.emoji.trim())        mat.emoji        = form.emoji.trim()
    if (form.unit)                mat.unit         = form.unit as Unit
    if (form.prixClient !== '')   mat.prixClient   = parseFloat(form.prixClient)  || 0
    if (form.prixFournisseur !== '') mat.prixFournisseur = parseFloat(form.prixFournisseur) || 0
    if (form.description.trim()) mat.description   = form.description.trim()
    addMaterial(mat)
    setForm(emptyForm())
    setShowAddForm(false)
  }

  function startEdit(mat: Material) {
    setEditingId(mat.id)
    setEditForm({
      name: mat.name, nameen: mat.nameen || '', emoji: mat.emoji || '',
      category: mat.category, unit: mat.unit || '',
      prixClient: mat.prixClient, prixFournisseur: mat.prixFournisseur,
      description: mat.description || '',
    })
  }

  function saveEdit(id: string) {
    const updates: Partial<Material> = {
      name:     (editForm.name as string) || '',
      category: editForm.category as Category,
    }
    if (editForm.nameen !== undefined) updates.nameen = editForm.nameen as string
    if (editForm.emoji  !== undefined) updates.emoji  = editForm.emoji  as string
    if (editForm.unit)  updates.unit  = editForm.unit as Unit
    if (editForm.prixClient      != null) updates.prixClient      = Number(editForm.prixClient)
    if (editForm.prixFournisseur != null) updates.prixFournisseur = Number(editForm.prixFournisseur)
    if (editForm.description !== undefined) updates.description = editForm.description as string
    updateMaterial(id, updates)
    setEditingId(null)
    setEditForm({})
  }

  function handleAddToDoc(mat: Material) {
    setShowAddToDoc(mat)
    setQty(1)
  }

  function handleConfirmAdd() {
    if (!showAddToDoc) return
    const price = showAddToDoc.prixClient ?? showAddToDoc.price ?? 0
    const doc = addDocument('facture')
    addLineItem(doc.id)
    const item = doc.items[doc.items.length - 1]
    updateLineItem(doc.id, item.id, {
      description: lang === 'fr' ? showAddToDoc.name : (showAddToDoc.nameen || showAddToDoc.name),
      quantity: qty,
      unitPrice: price,
    })
    calculateTotals(doc.id)
    setShowAddToDoc(null)
    router.push(`/documents/${doc.id}`)
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '14px',
  }

  const inp = {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '9px 11px',
    color: theme.colors.text,
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  const lbl = {
    display: 'block' as const,
    fontSize: '10px',
    color: theme.colors.textMuted,
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  }

  const priceBox = (color: string) => ({
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: '8px',
    padding: '7px 10px',
    minWidth: '80px',
    textAlign: 'right' as const,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ── TITRE + AJOUTER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: 800, margin: 0 }}>
          📦 {t('CATALOGUE', 'CATALOG')}
          <span style={{ fontSize: '11px', color: theme.colors.textMuted, fontWeight: 400, marginLeft: '8px' }}>
            {materials.length} articles
          </span>
        </h1>
        <button onClick={() => { setShowAddForm(!showAddForm); setForm(emptyForm()) }} style={{
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
          background: theme.colors.primary, border: 'none',
          color: 'white', fontSize: '13px', fontWeight: 700,
        }}>
          {showAddForm ? '✕ Fermer' : '＋ Ajouter'}
        </button>
      </div>

      {/* ── FORMULAIRE AJOUT ── */}
      {showAddForm && (
        <div style={{ ...card, border: `2px solid ${theme.colors.primary}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, color: theme.colors.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
            ➕ {t('Nouveau matériau', 'New material')}
          </p>

          {/* Nom + Emoji */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', gap: '8px' }}>
            <div>
              <label style={lbl}>Nom *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Bardeau premium" style={inp} />
            </div>
            <div>
              <label style={lbl}>Emoji</label>
              <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                style={{ ...inp, textAlign: 'center', padding: '9px 4px' }} />
            </div>
          </div>

          {/* Catégorie + Unité */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={lbl}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))} style={inp}>
                {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Unité (optionnel)</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value as Unit | '' }))} style={inp}>
                <option value="">— aucune —</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* DEUX PRIX */}
          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: theme.colors.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>
              💰 Prix (optionnels)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ ...lbl, color: '#22c55e' }}>🏭 Fournisseur ($)</label>
                <input type="number" value={form.prixFournisseur} onChange={e => setForm(p => ({ ...p, prixFournisseur: e.target.value }))}
                  placeholder="0.00" min={0} step={0.01}
                  style={{ ...inp, border: '1px solid #22c55e44', background: '#22c55e0e' }} />
              </div>
              <div>
                <label style={{ ...lbl, color: '#f59e0b' }}>🏷️ Client ($)</label>
                <input type="number" value={form.prixClient} onChange={e => setForm(p => ({ ...p, prixClient: e.target.value }))}
                  placeholder="0.00" min={0} step={0.01}
                  style={{ ...inp, border: '1px solid #f59e0b44', background: '#f59e0b0e' }} />
              </div>
            </div>
            {/* Marge preview */}
            {form.prixFournisseur !== '' && form.prixClient !== '' &&
              parseFloat(form.prixFournisseur) > 0 && parseFloat(form.prixClient) > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textMuted, textAlign: 'center' }}>
                Marge:{' '}
                <strong style={{ color: theme.colors.primary }}>
                  {(((parseFloat(form.prixClient) - parseFloat(form.prixFournisseur)) / parseFloat(form.prixClient)) * 100).toFixed(1)}%
                </strong>
                {' '}· Profit:{' '}
                <strong style={{ color: '#22c55e' }}>
                  {(parseFloat(form.prixClient) - parseFloat(form.prixFournisseur)).toFixed(2)}$
                </strong>
              </div>
            )}
          </div>

          {/* Description optionnelle */}
          <div>
            <label style={lbl}>Description (optionnel)</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Notes sur ce matériau..." style={inp} />
          </div>

          <button onClick={handleSaveNew} style={{
            padding: '12px', borderRadius: '10px', cursor: 'pointer',
            background: theme.colors.primary, border: 'none',
            color: 'white', fontSize: '14px', fontWeight: 700,
          }}>
            ✅ {t('Ajouter au catalogue', 'Add to catalog')}
          </button>
        </div>
      )}

      {/* ── RECHERCHE ── */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder={t('🔍 Rechercher...', '🔍 Search...')}
        style={{ ...inp, background: theme.colors.card, fontSize: '14px', padding: '11px 14px' }} />

      {/* ── VUE PRIX ── */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {([
          { id: 'tous',        label: t('Tous', 'All'),                  emoji: '📦' },
          { id: 'fournisseur', label: t('Mes prix fournisseurs', 'Supplier prices'), emoji: '🏭' },
          { id: 'client',      label: t('Prix clients', 'Client prices'), emoji: '🏷️' },
        ] as { id: PriceView; label: string; emoji: string }[]).map(v => (
          <button key={v.id} onClick={() => setPriceView(v.id)} style={{
            padding: '7px 12px', borderRadius: '20px', cursor: 'pointer',
            whiteSpace: 'nowrap', fontSize: '12px', fontWeight: priceView === v.id ? 700 : 400,
            border: priceView === v.id ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
            background: priceView === v.id ? `${theme.colors.primary}22` : 'transparent',
            color: priceView === v.id ? theme.colors.primary : theme.colors.textMuted,
            flexShrink: 0,
          }}>
            {v.emoji} {v.label}
          </button>
        ))}
      </div>

      {/* ── FILTRES CATÉGORIE ── */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategory('all')} style={{
          padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
          fontSize: '11px', fontWeight: 700, flexShrink: 0,
          border: selectedCategory === 'all' ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
          background: selectedCategory === 'all' ? `${theme.colors.primary}18` : 'transparent',
          color: selectedCategory === 'all' ? theme.colors.primary : theme.colors.textMuted,
        }}>
          Tous ({materials.length})
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
          <button key={key} onClick={() => setSelectedCategory(key)} style={{
            padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
            fontSize: '11px', fontWeight: 700, flexShrink: 0,
            border: selectedCategory === key ? `2px solid ${cat.color}` : `1px solid ${theme.colors.border}`,
            background: selectedCategory === key ? `${cat.color}18` : 'transparent',
            color: selectedCategory === key ? cat.color : theme.colors.textMuted,
          }}>
            {cat.emoji} {cat.label} ({materials.filter(m => m.category === key).length})
          </button>
        ))}
      </div>

      {/* ── LISTE ── */}
      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
          <p style={{ color: theme.colors.textMuted }}>
            {t('Aucun matériau trouvé.', 'No material found.')}
          </p>
        </div>
      )}

      {filtered.map(mat => {
        const cat      = CATEGORIES[mat.category]
        const name     = lang === 'fr' ? mat.name : (mat.nameen || mat.name)
        const isEditing = editingId === mat.id
        const hasFourn  = mat.prixFournisseur != null && mat.prixFournisseur > 0
        const hasClient = mat.prixClient      != null && mat.prixClient      > 0
        const marge     = hasFourn && hasClient
          ? (((mat.prixClient! - mat.prixFournisseur!) / mat.prixClient!) * 100).toFixed(0)
          : null

        return (
          <div key={mat.id} style={{ ...card, borderLeft: `4px solid ${cat.color}` }}>

            {isEditing ? (
              /* ── MODE ÉDITION ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: theme.colors.primary, letterSpacing: '1px' }}>
                  ✏️ {t('Modifier', 'Edit')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px', gap: '6px' }}>
                  <div>
                    <label style={lbl}>Nom</label>
                    <input value={(editForm.name as string) || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Emoji</label>
                    <input value={(editForm.emoji as string) || ''} onChange={e => setEditForm(p => ({ ...p, emoji: e.target.value }))}
                      style={{ ...inp, textAlign: 'center', padding: '9px 2px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={lbl}>Catégorie</label>
                    <select value={(editForm.category as string) || mat.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value as Category }))} style={inp}>
                      {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([k, v]) => (
                        <option key={k} value={k}>{v.emoji} {v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Unité</label>
                    <select value={(editForm.unit as string) || ''} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value as Unit | '' }))} style={inp}>
                      <option value="">— aucune —</option>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ ...lbl, color: '#22c55e' }}>🏭 Fournisseur ($)</label>
                    <input type="number" value={editForm.prixFournisseur ?? ''} onChange={e => setEditForm(p => ({ ...p, prixFournisseur: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00" min={0} step={0.01}
                      style={{ ...inp, border: '1px solid #22c55e44', background: '#22c55e0e' }} />
                  </div>
                  <div>
                    <label style={{ ...lbl, color: '#f59e0b' }}>🏷️ Client ($)</label>
                    <input type="number" value={editForm.prixClient ?? ''} onChange={e => setEditForm(p => ({ ...p, prixClient: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00" min={0} step={0.01}
                      style={{ ...inp, border: '1px solid #f59e0b44', background: '#f59e0b0e' }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Description</label>
                  <input value={(editForm.description as string) || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Notes..." style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => setEditingId(null)} style={{
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${theme.colors.border}`, background: 'transparent',
                    color: theme.colors.textMuted, fontSize: '13px', fontWeight: 700,
                  }}>✕ Annuler</button>
                  <button onClick={() => saveEdit(mat.id)} style={{
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: 'none', background: theme.colors.primary,
                    color: 'white', fontSize: '13px', fontWeight: 700,
                  }}>✅ Sauvegarder</button>
                </div>
              </div>
            ) : (
              /* ── MODE AFFICHAGE ── */
              <>
                {/* Ligne principale: nom + prix */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  {/* Info gauche */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                      {mat.emoji && <span style={{ fontSize: '18px' }}>{mat.emoji}</span>}
                      <span style={{ fontWeight: 700, fontSize: '14px', color: theme.colors.text, wordBreak: 'break-word' }}>{name}</span>
                    </div>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: mat.description ? '6px' : 0 }}>
                      <span style={{ background: `${cat.color}20`, color: cat.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                        {cat.emoji} {cat.label}
                      </span>
                      {mat.unit && (
                        <span style={{ background: theme.colors.surface, color: theme.colors.textMuted, fontSize: '10px', padding: '2px 8px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                          📐 {mat.unit}
                        </span>
                      )}
                    </div>
                    {/* Description si remplie */}
                    {mat.description && (
                      <p style={{ fontSize: '11px', color: theme.colors.textMuted, margin: '4px 0 0' }}>{mat.description}</p>
                    )}
                  </div>

                  {/* Prix droite */}
                  {(hasFourn || hasClient) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                      {hasFourn && (
                        <div style={priceBox('#22c55e')}>
                          <div style={{ fontSize: '9px', color: '#22c55e', fontWeight: 800, letterSpacing: '0.8px' }}>🏭 FOURN.</div>
                          <div style={{ fontSize: '17px', fontWeight: 900, color: '#22c55e', lineHeight: 1.1 }}>
                            {mat.prixFournisseur!.toFixed(2)}$
                          </div>
                          {mat.unit && <div style={{ fontSize: '9px', color: '#22c55e88' }}>/{mat.unit}</div>}
                        </div>
                      )}
                      {hasClient && (
                        <div style={priceBox('#f59e0b')}>
                          <div style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 800, letterSpacing: '0.8px' }}>🏷️ CLIENT</div>
                          <div style={{ fontSize: '17px', fontWeight: 900, color: '#f59e0b', lineHeight: 1.1 }}>
                            {mat.prixClient!.toFixed(2)}$
                          </div>
                          {mat.unit && <div style={{ fontSize: '9px', color: '#f59e0b88' }}>/{mat.unit}</div>}
                        </div>
                      )}
                      {marge && (
                        <div style={{ textAlign: 'right', fontSize: '10px', color: theme.colors.textMuted }}>
                          Marge: <strong style={{ color: theme.colors.primary }}>{marge}%</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Actions ── */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => startEdit(mat)} style={{
                    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${theme.colors.border}`, background: 'transparent',
                    color: theme.colors.textMuted, fontSize: '12px',
                  }}>✏️ {t('Modifier', 'Edit')}</button>

                  {deleteConfirmId === mat.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => setDeleteConfirmId(null)} style={{
                        padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                        border: `1px solid ${theme.colors.border}`, background: 'transparent',
                        color: theme.colors.textMuted, fontSize: '12px',
                      }}>Annuler</button>
                      <button onClick={() => { deleteMaterial(mat.id); setDeleteConfirmId(null) }} style={{
                        padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                        border: '2px solid #ef4444', background: '#ef444422',
                        color: '#ef4444', fontSize: '12px', fontWeight: 800,
                      }}>🗑️ Confirmer</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(mat.id)} style={{
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${theme.colors.border}`, background: 'transparent',
                      color: '#ef4444', fontSize: '12px',
                    }}>🗑️ {t('Supprimer', 'Delete')}</button>
                  )}

                  {hasClient && (
                    <button onClick={() => handleAddToDoc(mat)} style={{
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${cat.color}`, background: `${cat.color}18`,
                      color: cat.color, fontSize: '12px', fontWeight: 700,
                    }}>+ {t('Facture', 'Invoice')}</button>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* ── MODAL AJOUTER À FACTURE ── */}
      {showAddToDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: 800, margin: 0 }}>
              + {t('Ajouter à une nouvelle facture', 'Add to new invoice')}
            </h2>
            <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {lang === 'fr' ? showAddToDoc.name : (showAddToDoc.nameen || showAddToDoc.name)}
                </p>
                <p style={{ color: '#f59e0b', fontSize: '12px', margin: '2px 0 0' }}>
                  🏷️ {(showAddToDoc.prixClient ?? showAddToDoc.price ?? 0).toFixed(2)}$ / {showAddToDoc.unit || 'unité'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, color: theme.colors.text, fontSize: '20px', cursor: 'pointer' }}>-</button>
                <span style={{ color: theme.colors.text, fontSize: '18px', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${theme.colors.primary}`, background: theme.colors.glow1, color: theme.colors.primary, fontSize: '20px', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: theme.colors.textMuted }}>Total:</span>
              <span style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 800 }}>
                {((showAddToDoc.prixClient ?? showAddToDoc.price ?? 0) * qty).toFixed(2)}$
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowAddToDoc(null)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textMuted, fontSize: '14px', fontWeight: 700 }}>
                {t('Annuler', 'Cancel')}
              </button>
              <button onClick={handleConfirmAdd} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: theme.colors.primary, color: 'white', fontSize: '14px', fontWeight: 700 }}>
                ✅ {t('Créer facture', 'Create invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
