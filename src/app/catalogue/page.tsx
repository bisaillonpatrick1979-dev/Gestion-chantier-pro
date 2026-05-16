'use client'
import { useState } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useRouter } from 'next/navigation'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Material, Unit, Category } from '@/store/useCatalogueStore'

const CATEGORIES: Record<Category, { label: string; labelen: string; emoji: string; color: string }> = {
  toiture:     { label: 'Toiture',       labelen: 'Roofing',       emoji: '🏠', color: '#ea580c' },
  siding:      { label: 'Siding',        labelen: 'Siding',        emoji: '🏡', color: '#f59e0b' },
  fixations:   { label: 'Fixations',     labelen: 'Fasteners',     emoji: '🔩', color: '#06b6d4' },
  etancheite:  { label: 'Étanchéité',    labelen: 'Waterproofing', emoji: '💧', color: '#3b82f6' },
  structure:   { label: 'Structure',     labelen: 'Structure',     emoji: '🪵', color: '#22c55e' },
  maindoeuvre: { label: "Main d'oeuvre", labelen: 'Labor',         emoji: '👷', color: '#a855f7' },
}

const UNITS: Unit[] = ['pi²', 'pi lin.', 'boîte', 'rouleau', 'feuille', 'tube', 'unité', 'heure']

const emptyNew = (): Omit<Material, 'id'> => ({
  category: 'toiture', name: '', nameen: '', emoji: '📦',
  unit: 'pi²', priceMin: 0, priceMax: 0, price: 0,
  description: '', descriptionen: '',
})

export default function CataloguePage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { addDocument, addLineItem, updateLineItem, calculateTotals } = useDocumentStore()
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useCatalogueStore()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddToDoc, setShowAddToDoc] = useState<Material | null>(null)
  const [qty, setQty] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMat, setNewMat] = useState<Omit<Material, 'id'>>(emptyNew())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const filtered = materials.filter(m => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory
    const name = lang === 'fr' ? m.name : m.nameen
    return matchCat && name.toLowerCase().includes(search.toLowerCase())
  })

  const handleAddToDoc = (material: Material) => { setShowAddToDoc(material); setQty(1) }

  const handleConfirmAdd = () => {
    if (!showAddToDoc) return
    const doc = addDocument('facture')
    addLineItem(doc.id)
    const item = doc.items[doc.items.length - 1]
    updateLineItem(doc.id, item.id, {
      description: lang === 'fr' ? showAddToDoc.name : showAddToDoc.nameen,
      quantity: qty,
      unitPrice: showAddToDoc.price,
    })
    calculateTotals(doc.id)
    setShowAddToDoc(null)
    router.push(`/documents/${doc.id}`)
  }

  const handleSaveNew = () => {
    if (!newMat.name.trim()) return
    addMaterial(newMat)
    setNewMat(emptyNew())
    setShowAddForm(false)
  }

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* TITRE + BOUTON AJOUTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: '700' }}>
          📦 {t('CATALOGUE', 'CATALOG')}
        </h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
          background: theme.colors.primary, border: 'none',
          color: 'white', fontSize: '13px', fontWeight: '700',
        }}>
          {showAddForm ? '✕ Fermer' : '＋ Ajouter'}
        </button>
      </div>

      {/* FORMULAIRE AJOUT */}
      {showAddForm && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px', border: `2px solid ${theme.colors.primary}` }}>
          <p style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: '700', letterSpacing: '2px' }}>
            ＋ {t('NOUVEAU MATÉRIAU', 'NEW MATERIAL')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input value={newMat.name} onChange={e => setNewMat(p => ({ ...p, name: e.target.value }))}
              placeholder={t('Nom (FR)', 'Name (FR)')}
              style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
            <input value={newMat.nameen} onChange={e => setNewMat(p => ({ ...p, nameen: e.target.value }))}
              placeholder="Name (EN)"
              style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <select value={newMat.category} onChange={e => setNewMat(p => ({ ...p, category: e.target.value as Category }))}
              style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }}>
              {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {lang === 'fr' ? v.label : v.labelen}</option>
              ))}
            </select>
            <select value={newMat.unit} onChange={e => setNewMat(p => ({ ...p, unit: e.target.value as Unit }))}
              style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input value={newMat.emoji} onChange={e => setNewMat(p => ({ ...p, emoji: e.target.value }))}
              placeholder="Emoji"
              style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px', textAlign: 'center' as const }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Prix $</label>
              <input type="number" value={newMat.price} onChange={e => setNewMat(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Min $</label>
              <input type="number" value={newMat.priceMin} onChange={e => setNewMat(p => ({ ...p, priceMin: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Max $</label>
              <input type="number" value={newMat.priceMax} onChange={e => setNewMat(p => ({ ...p, priceMax: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
            </div>
          </div>
          <input value={newMat.description} onChange={e => setNewMat(p => ({ ...p, description: e.target.value }))}
            placeholder={t('Description (FR)', 'Description (FR)')}
            style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '13px' }} />
          <button onClick={handleSaveNew} style={{
            padding: '12px', borderRadius: '10px', cursor: 'pointer',
            background: theme.colors.primary, border: 'none',
            color: 'white', fontSize: '14px', fontWeight: '700',
          }}>
            ✅ {t('Sauvegarder le matériau', 'Save material')}
          </button>
        </div>
      )}

      {/* RECHERCHE */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder={t('🔍 Rechercher un matériau...', '🔍 Search material...')}
        style={{
          width: '100%', background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '10px', padding: '12px 16px',
          color: theme.colors.text, fontSize: '14px', outline: 'none',
        }} />

      {/* FILTRES CATÉGORIE */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setSelectedCategory('all')} style={{
          padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
          whiteSpace: 'nowrap' as const, fontSize: '12px', fontWeight: '700',
          border: selectedCategory === 'all' ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
          background: selectedCategory === 'all' ? theme.colors.glow1 : 'transparent',
          color: selectedCategory === 'all' ? theme.colors.primary : theme.colors.textMuted,
        }}>
          {t('Tous', 'All')} ({materials.length})
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => {
          const count = materials.filter(m => m.category === key).length
          return (
            <button key={key} onClick={() => setSelectedCategory(key)} style={{
              padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              whiteSpace: 'nowrap' as const, fontSize: '12px', fontWeight: '700',
              border: selectedCategory === key ? `2px solid ${cat.color}` : `1px solid ${theme.colors.border}`,
              background: selectedCategory === key ? `${cat.color}22` : 'transparent',
              color: selectedCategory === key ? cat.color : theme.colors.textMuted,
            }}>
              {cat.emoji} {lang === 'fr' ? cat.label : cat.labelen} ({count})
            </button>
          )
        })}
      </div>

      {/* LISTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <div style={{ ...card, textAlign: 'center' as const, padding: '40px' }}>
            <p style={{ color: theme.colors.textMuted }}>
              {t('Aucun matériau trouvé.', 'No material found.')}
            </p>
          </div>
        )}
        {filtered.map(mat => {
          const cat = CATEGORIES[mat.category]
          const name = lang === 'fr' ? mat.name : mat.nameen
          const desc = lang === 'fr' ? mat.description : mat.descriptionen
          const isEditing = editingId === mat.id

          return (
            <div key={mat.id} style={{ ...card, borderLeft: `4px solid ${cat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>

                {/* INFO */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>{mat.emoji}</span>
                    <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>{name}</p>
                  </div>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '8px' }}>{desc}</p>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <input value={mat.name}
                          onChange={e => updateMaterial(mat.id, { name: e.target.value })}
                          placeholder="Nom FR"
                          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '12px' }} />
                        <input value={mat.nameen}
                          onChange={e => updateMaterial(mat.id, { nameen: e.target.value })}
                          placeholder="Name EN"
                          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                        <div>
                          <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Prix $</label>
                          <input type="number" value={mat.price}
                            onChange={e => updateMaterial(mat.id, { price: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.primary}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Min $</label>
                          <input type="number" value={mat.priceMin}
                            onChange={e => updateMaterial(mat.id, { priceMin: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ color: theme.colors.textMuted, fontSize: '10px' }}>Max $</label>
                          <input type="number" value={mat.priceMax}
                            onChange={e => updateMaterial(mat.id, { priceMax: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '13px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <select value={mat.unit} onChange={e => updateMaterial(mat.id, { unit: e.target.value as Unit })}
                          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '12px' }}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <select value={mat.category} onChange={e => updateMaterial(mat.id, { category: e.target.value as Category })}
                          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '6px', padding: '6px 8px', color: theme.colors.text, fontSize: '12px' }}>
                          {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([k, v]) => (
                            <option key={k} value={k}>{v.emoji} {lang === 'fr' ? v.label : v.labelen}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => setEditingId(null)} style={{
                        padding: '8px', borderRadius: '8px', cursor: 'pointer',
                        background: theme.colors.primary, border: 'none',
                        color: 'white', fontSize: '12px', fontWeight: '700',
                      }}>✅ {t('Sauvegarder', 'Save')}</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: `${cat.color}22`, color: cat.color, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' }}>
                        {lang === 'fr' ? cat.label : cat.labelen}
                      </span>
                      <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                        {t('Unité:', 'Unit:')} {mat.unit}
                      </span>
                    </div>
                  )}
                </div>

                {/* PRIX + ACTIONS */}
                {!isEditing && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ textAlign: 'right' as const }}>
                      <p style={{ color: theme.colors.secondary, fontSize: '18px', fontWeight: '800' }}>
                        {mat.price.toFixed(2)}$
                      </p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>/{mat.unit}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                        ({mat.priceMin}-{mat.priceMax}$)
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setEditingId(mat.id)} style={{
                        padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                        border: `1px solid ${theme.colors.border}`,
                        background: 'transparent', color: theme.colors.textMuted, fontSize: '12px',
                      }}>✏️</button>
                      {confirmDeleteId === mat.id ? (
                        <button onClick={() => { deleteMaterial(mat.id); setConfirmDeleteId(null) }} style={{
                          padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                          border: '1px solid #ef4444', background: '#ef444422', color: '#ef4444', fontSize: '11px', fontWeight: '700',
                        }}>Confirmer ✕</button>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(mat.id)} style={{
                          padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${theme.colors.border}`,
                          background: 'transparent', color: '#ef4444', fontSize: '12px',
                        }}>🗑️</button>
                      )}
                      <button onClick={() => handleAddToDoc(mat)} style={{
                        padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                        border: `1px solid ${cat.color}`,
                        background: `${cat.color}22`, color: cat.color, fontSize: '12px', fontWeight: '700',
                      }}>+ {t('Facture', 'Invoice')}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL AJOUTER À FACTURE */}
      {showAddToDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>
              + {t('Ajouter à une nouvelle facture', 'Add to new invoice')}
            </h2>
            <div style={{ background: theme.colors.card, borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'fr' ? showAddToDoc.name : showAddToDoc.nameen}
                </p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {showAddToDoc.price.toFixed(2)}$ / {showAddToDoc.unit}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, color: theme.colors.text, fontSize: '20px', cursor: 'pointer' }}>-</button>
                <span style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '700', minWidth: '30px', textAlign: 'center' as const }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${theme.colors.primary}`, background: theme.colors.glow1, color: theme.colors.primary, fontSize: '20px', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: theme.colors.textMuted }}>Total:</span>
              <span style={{ color: theme.colors.secondary, fontSize: '18px', fontWeight: '800' }}>{(showAddToDoc.price * qty).toFixed(2)}$</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowAddToDoc(null)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textMuted, fontSize: '14px', fontWeight: '700' }}>
                {t('Annuler', 'Cancel')}
              </button>
              <button onClick={handleConfirmAdd} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: theme.colors.primary, color: 'white', fontSize: '14px', fontWeight: '700' }}>
                ✅ {t('Créer facture', 'Create invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
