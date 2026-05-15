'use client'
import { useState } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useRouter } from 'next/navigation'

type Unit = 'pi²' | 'pi lin.' | 'boîte' | 'rouleau' | 'feuille' | 'tube' | 'unité'
type Category = 'toiture' | 'siding' | 'fixations' | 'etancheite' | 'structure' | 'maindoeuvre'

interface Material {
  id: string
  category: Category
  name: string
  nameen: string
  emoji: string
  unit: Unit
  priceMin: number
  priceMax: number
  price: number
  description: string
  descriptionen: string
}

const defaultMaterials: Material[] = [
  // TOITURE
  { id: '1', category: 'toiture', name: 'Bardeau asphalte 3 tabs', nameen: 'Asphalt shingle 3 tabs', emoji: '🏠', unit: 'pi²', priceMin: 5, priceMax: 12, price: 7, description: 'Le plus populaire au Québec, durée de vie 20-30 ans', descriptionen: 'Most popular in Quebec, lifespan 20-30 years' },
  { id: '2', category: 'toiture', name: 'Bardeau architectural', nameen: 'Architectural shingle', emoji: '🏠', unit: 'pi²', priceMin: 8, priceMax: 15, price: 11, description: 'Bardeau épais, aspect 3D, durée de vie 30+ ans', descriptionen: 'Thick shingle, 3D look, lifespan 30+ years' },
  { id: '3', category: 'toiture', name: 'Tôle acier prépeint', nameen: 'Prepainted steel roofing', emoji: '🔩', unit: 'pi²', priceMin: 13, priceMax: 25, price: 18, description: 'Durée de vie 50+ ans, très résistant', descriptionen: 'Lifespan 50+ years, very resistant' },
  { id: '4', category: 'toiture', name: 'Tôle aluminium', nameen: 'Aluminum roofing', emoji: '🔩', unit: 'pi²', priceMin: 15, priceMax: 30, price: 22, description: 'Léger, résistant à la grêle, recyclable 100%', descriptionen: 'Light, hail resistant, 100% recyclable' },
  { id: '5', category: 'toiture', name: 'Membrane élastomère', nameen: 'Elastomeric membrane', emoji: '🌊', unit: 'pi²', priceMin: 8, priceMax: 14, price: 10, description: 'Idéal pour toit plat, très étanche', descriptionen: 'Ideal for flat roof, very waterproof' },
  { id: '6', category: 'toiture', name: 'Membrane TPO', nameen: 'TPO membrane', emoji: '🌊', unit: 'pi²', priceMin: 6, priceMax: 12, price: 9, description: 'Toit plat commercial et résidentiel', descriptionen: 'Commercial and residential flat roof' },
  { id: '7', category: 'toiture', name: 'Sous-couche synthétique', nameen: 'Synthetic underlayment', emoji: '📄', unit: 'rouleau', priceMin: 80, priceMax: 150, price: 110, description: 'Protection sous le revêtement, résistant à l\'humidité', descriptionen: 'Protection under cladding, moisture resistant' },
  { id: '8', category: 'toiture', name: 'Ice & Water Shield', nameen: 'Ice & Water Shield', emoji: '❄️', unit: 'rouleau', priceMin: 120, priceMax: 200, price: 155, description: 'Protection contre les dégâts de glace, zone de rive', descriptionen: 'Ice damage protection, eave zone' },
  { id: '9', category: 'toiture', name: 'Papier de construction 15 lb', nameen: '15 lb building paper', emoji: '📄', unit: 'rouleau', priceMin: 40, priceMax: 70, price: 55, description: 'Sous-couche économique, papier goudronné', descriptionen: 'Economical underlayment, tar paper' },
  // SIDING
  { id: '10', category: 'siding', name: 'Siding vinyle', nameen: 'Vinyl siding', emoji: '🏡', unit: 'pi²', priceMin: 2, priceMax: 5, price: 3.5, description: 'Économique, facile d\'entretien, grande variété de couleurs', descriptionen: 'Affordable, easy maintenance, wide color variety' },
  { id: '11', category: 'siding', name: 'Siding aluminium', nameen: 'Aluminum siding', emoji: '🏡', unit: 'pi²', priceMin: 4, priceMax: 8, price: 6, description: 'Durable, résistant aux insectes et à la pourriture', descriptionen: 'Durable, insect and rot resistant' },
  { id: '12', category: 'siding', name: 'Siding fibrociment (Hardie)', nameen: 'Fiber cement siding (Hardie)', emoji: '🏡', unit: 'pi²', priceMin: 6, priceMax: 12, price: 9, description: 'Aspect bois, résistant au feu et aux intempéries, 50+ ans', descriptionen: 'Wood look, fire and weather resistant, 50+ years' },
  { id: '13', category: 'siding', name: 'Siding bois composite', nameen: 'Composite wood siding', emoji: '🌲', unit: 'pi²', priceMin: 5, priceMax: 10, price: 7.5, description: 'Aspect naturel du bois sans l\'entretien', descriptionen: 'Natural wood look without the maintenance' },
  { id: '14', category: 'siding', name: 'Siding PVC', nameen: 'PVC siding', emoji: '🏡', unit: 'pi²', priceMin: 3, priceMax: 6, price: 4.5, description: 'Imperméable, sans entretien, longue durée', descriptionen: 'Waterproof, maintenance-free, long-lasting' },
  { id: '15', category: 'siding', name: 'Panneau de cèdre', nameen: 'Cedar panel', emoji: '🌲', unit: 'pi²', priceMin: 8, priceMax: 18, price: 13, description: 'Bois naturel, aspect haut de gamme, traitement requis', descriptionen: 'Natural wood, high-end look, treatment required' },
  // FIXATIONS
  { id: '16', category: 'fixations', name: 'Clous galvanisés', nameen: 'Galvanized nails', emoji: '🔨', unit: 'boîte', priceMin: 15, priceMax: 25, price: 20, description: 'Résistants à la rouille, boîte de 1 kg', descriptionen: 'Rust resistant, 1 kg box' },
  { id: '17', category: 'fixations', name: 'Vis à toiture', nameen: 'Roofing screws', emoji: '🔩', unit: 'boîte', priceMin: 20, priceMax: 35, price: 27, description: 'Avec rondelle EPDM, boîte de 250', descriptionen: 'With EPDM washer, box of 250' },
  { id: '18', category: 'fixations', name: 'Agrafe inox', nameen: 'Stainless staples', emoji: '📌', unit: 'boîte', priceMin: 18, priceMax: 30, price: 24, description: 'Inoxydable, boîte de 1000', descriptionen: 'Rust-proof, box of 1000' },
  { id: '19', category: 'fixations', name: 'Calfeutrant acrylique', nameen: 'Acrylic caulk', emoji: '🔧', unit: 'tube', priceMin: 8, priceMax: 15, price: 11, description: 'Scellant flexible, peinturable', descriptionen: 'Flexible sealant, paintable' },
  { id: '20', category: 'fixations', name: 'Calfeutrant polyuréthane', nameen: 'Polyurethane caulk', emoji: '🔧', unit: 'tube', priceMin: 12, priceMax: 22, price: 17, description: 'Haute performance, résistant aux UV', descriptionen: 'High performance, UV resistant' },
  // ETANCHEITE
  { id: '21', category: 'etancheite', name: 'Solin aluminium', nameen: 'Aluminum flashing', emoji: '💧', unit: 'pi lin.', priceMin: 2, priceMax: 4, price: 3, description: 'Protection aux jonctions, bandes préformées', descriptionen: 'Junction protection, preformed strips' },
  { id: '22', category: 'etancheite', name: 'Solin de plomb', nameen: 'Lead flashing', emoji: '💧', unit: 'pi lin.', priceMin: 3, priceMax: 6, price: 4.5, description: 'Autour des cheminées et pénétrations', descriptionen: 'Around chimneys and penetrations' },
  { id: '23', category: 'etancheite', name: 'Ruban d\'étanchéité', nameen: 'Waterproof tape', emoji: '📏', unit: 'rouleau', priceMin: 25, priceMax: 45, price: 35, description: 'Joints et raccords, auto-adhésif', descriptionen: 'Joints and connections, self-adhesive' },
  { id: '24', category: 'etancheite', name: 'Pare-vapeur 6 mil', nameen: '6 mil vapor barrier', emoji: '🛡️', unit: 'rouleau', priceMin: 60, priceMax: 100, price: 80, description: 'Contrôle de l\'humidité, rouleau 10x100 pi', descriptionen: 'Moisture control, 10x100 ft roll' },
  // STRUCTURE
  { id: '25', category: 'structure', name: 'OSB 7/16', nameen: 'OSB 7/16', emoji: '🪵', unit: 'feuille', priceMin: 25, priceMax: 40, price: 32, description: 'Panneau de structure, 4x8 pi', descriptionen: 'Structural panel, 4x8 ft' },
  { id: '26', category: 'structure', name: 'Contreplaqué 1/2"', nameen: 'Plywood 1/2"', emoji: '🪵', unit: 'feuille', priceMin: 30, priceMax: 50, price: 40, description: 'Feuille de bois multiplis, 4x8 pi', descriptionen: 'Multilayer wood sheet, 4x8 ft' },
  { id: '27', category: 'structure', name: 'Latte 1x3', nameen: '1x3 strapping', emoji: '📏', unit: 'pi lin.', priceMin: 1, priceMax: 2, price: 1.5, description: 'Support pour siding, bois traité', descriptionen: 'Siding support, treated wood' },
  { id: '28', category: 'structure', name: 'Solive 2x4', nameen: '2x4 joist', emoji: '📏', unit: 'pi lin.', priceMin: 3, priceMax: 5, price: 4, description: 'Bois de charpente standard', descriptionen: 'Standard framing lumber' },
  { id: '29', category: 'structure', name: 'Solive 2x6', nameen: '2x6 joist', emoji: '📏', unit: 'pi lin.', priceMin: 4, priceMax: 7, price: 5.5, description: 'Charpente renforcée, murs extérieurs', descriptionen: 'Reinforced framing, exterior walls' },
  // MAIN D'OEUVRE
  { id: '30', category: 'maindoeuvre', name: 'Installation bardeau', nameen: 'Shingle installation', emoji: '👷', unit: 'pi²', priceMin: 2, priceMax: 4, price: 3, description: 'Main d\'oeuvre installation bardeau asphalte', descriptionen: 'Labor for asphalt shingle installation' },
  { id: '31', category: 'maindoeuvre', name: 'Installation tôle', nameen: 'Metal roofing installation', emoji: '👷', unit: 'pi²', priceMin: 4, priceMax: 8, price: 6, description: 'Main d\'oeuvre installation toiture métallique', descriptionen: 'Labor for metal roofing installation' },
  { id: '32', category: 'maindoeuvre', name: 'Installation siding', nameen: 'Siding installation', emoji: '👷', unit: 'pi²', priceMin: 3, priceMax: 6, price: 4.5, description: 'Main d\'oeuvre pose de revêtement extérieur', descriptionen: 'Labor for exterior cladding installation' },
  { id: '33', category: 'maindoeuvre', name: 'Démolition / Enlèvement', nameen: 'Demolition / Removal', emoji: '🗑️', unit: 'pi²', priceMin: 1, priceMax: 2, price: 1.5, description: 'Enlèvement ancien revêtement et disposition', descriptionen: 'Old cladding removal and disposal' },
  { id: '34', category: 'maindoeuvre', name: 'Heure technicien', nameen: 'Technician hour', emoji: '⏱️', unit: 'unité', priceMin: 45, priceMax: 95, price: 65, description: 'Taux horaire technicien qualifié', descriptionen: 'Qualified technician hourly rate' },
]

const CATEGORIES = {
  toiture:     { label: 'Toiture',       labelen: 'Roofing',       emoji: '🏠', color: '#ea580c' },
  siding:      { label: 'Siding',        labelen: 'Siding',        emoji: '🏡', color: '#f59e0b' },
  fixations:   { label: 'Fixations',     labelen: 'Fasteners',     emoji: '🔩', color: '#06b6d4' },
  etancheite:  { label: 'Étanchéité',    labelen: 'Waterproofing', emoji: '💧', color: '#3b82f6' },
  structure:   { label: 'Structure',     labelen: 'Structure',     emoji: '🪵', color: '#22c55e' },
  maindoeuvre: { label: "Main d'oeuvre", labelen: 'Labor',         emoji: '👷', color: '#a855f7' },
}

export default function CataloguePage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { documents, addDocument, updateDocument, addLineItem, updateLineItem, calculateTotals } = useDocumentStore()
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [materials, setMaterials] = useState<Material[]>(defaultMaterials)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddToDoc, setShowAddToDoc] = useState<Material | null>(null)
  const [qty, setQty] = useState(1)

  const filtered = materials.filter(m => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory
    const name = lang === 'fr' ? m.name : m.nameen
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const handleAddToDoc = (material: Material) => {
    setShowAddToDoc(material)
    setQty(1)
  }

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

  const updatePrice = (id: string, price: number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, price } : m))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* TITLE */}
      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>
        📦 {lang === 'fr' ? 'CATALOGUE' : 'CATALOG'}
      </h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={lang === 'fr' ? '🔍 Rechercher un matériau...' : '🔍 Search material...'}
        style={{
          width: '100%', background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '10px', padding: '12px 16px',
          color: theme.colors.text, fontSize: '14px', outline: 'none',
        }}
      />

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setSelectedCategory('all')} style={{
          padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
          whiteSpace: 'nowrap' as const, fontSize: '12px', fontWeight: '700',
          border: selectedCategory === 'all'
            ? `2px solid ${theme.colors.primary}`
            : `1px solid ${theme.colors.border}`,
          background: selectedCategory === 'all' ? theme.colors.glow1 : 'transparent',
          color: selectedCategory === 'all' ? theme.colors.primary : theme.colors.textMuted,
        }}>
          {lang === 'fr' ? 'Tous' : 'All'}
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
          <button key={key} onClick={() => setSelectedCategory(key)} style={{
            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
            whiteSpace: 'nowrap' as const, fontSize: '12px', fontWeight: '700',
            border: selectedCategory === key
              ? `2px solid ${cat.color}`
              : `1px solid ${theme.colors.border}`,
            background: selectedCategory === key ? `${cat.color}22` : 'transparent',
            color: selectedCategory === key ? cat.color : theme.colors.textMuted,
          }}>
            {cat.emoji} {lang === 'fr' ? cat.label : cat.labelen}
          </button>
        ))}
      </div>

      {/* MATERIALS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(mat => {
          const cat = CATEGORIES[mat.category]
          const name = lang === 'fr' ? mat.name : mat.nameen
          const desc = lang === 'fr' ? mat.description : mat.descriptionen
          const isEditing = editingId === mat.id

          return (
            <div key={mat.id} style={{
              ...card,
              borderLeft: `4px solid ${cat.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                
                {/* LEFT: Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>{mat.emoji}</span>
                    <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>
                      {name}
                    </p>
                  </div>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '8px' }}>
                    {desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: `${cat.color}22`,
                      color: cat.color, fontSize: '10px',
                      fontWeight: '700', padding: '3px 8px',
                      borderRadius: '10px',
                    }}>
                      {lang === 'fr' ? cat.label : cat.labelen}
                    </span>
                    <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {lang === 'fr' ? 'Unité:' : 'Unit:'} {mat.unit}
                    </span>
                  </div>
                </div>

                {/* RIGHT: Price + Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={mat.price}
                        onChange={e => updatePrice(mat.id, Number(e.target.value))}
                        style={{
                          width: '80px', background: theme.colors.surface,
                          border: `1px solid ${theme.colors.primary}`,
                          borderRadius: '6px', padding: '6px 8px',
                          color: theme.colors.text, fontSize: '14px',
                          textAlign: 'right' as const,
                        }}
                      />
                      <span style={{ color: theme.colors.textMuted, fontSize: '11px' }}>$</span>
                      <button onClick={() => setEditingId(null)} style={{
                        background: theme.colors.primary, border: 'none',
                        borderRadius: '6px', padding: '6px 10px',
                        color: 'white', cursor: 'pointer', fontSize: '12px',
                      }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' as const }}>
                      <p style={{
                        color: theme.colors.secondary,
                        fontSize: '18px', fontWeight: '800',
                      }}>
                        {mat.price.toFixed(2)}$
                      </p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                        /{mat.unit}
                      </p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                        ({mat.priceMin}-{mat.priceMax}$)
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditingId(isEditing ? null : mat.id)} style={{
                      padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent', color: theme.colors.textMuted,
                      fontSize: '12px',
                    }}>
                      ✏️
                    </button>
                    <button onClick={() => handleAddToDoc(mat)} style={{
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${cat.color}`,
                      background: `${cat.color}22`, color: cat.color,
                      fontSize: '12px', fontWeight: '700',
                    }}>
                      + {lang === 'fr' ? 'Facture' : 'Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ADD TO DOCUMENT MODAL */}
      {showAddToDoc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '20px 20px 0 0',
            padding: '24px', width: '100%',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>
              + {lang === 'fr' ? 'Ajouter à une nouvelle facture' : 'Add to new invoice'}
            </h2>

            <div style={{
              background: theme.colors.card, borderRadius: '12px', padding: '12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'fr' ? showAddToDoc.name : showAddToDoc.nameen}
                </p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {showAddToDoc.price.toFixed(2)}$ / {showAddToDoc.unit}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface, color: theme.colors.text,
                  fontSize: '20px', cursor: 'pointer',
                }}>-</button>
                <span style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '700', minWidth: '30px', textAlign: 'center' as const }}>
                  {qty}
                </span>
                <button onClick={() => setQty(qty + 1)} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: `1px solid ${theme.colors.primary}`,
                  background: theme.colors.glow1, color: theme.colors.primary,
                  fontSize: '20px', cursor: 'pointer',
                }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: theme.colors.textMuted, fontSize: '13px' }}>
                {lang === 'fr' ? 'Total:' : 'Total:'}
              </span>
              <span style={{ color: theme.colors.secondary, fontSize: '18px', fontWeight: '800' }}>
                {(showAddToDoc.price * qty).toFixed(2)}$
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowAddToDoc(null)} style={{
                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                border: `1px solid ${theme.colors.border}`,
                background: 'transparent', color: theme.colors.textMuted,
                fontSize: '14px', fontWeight: '700',
              }}>
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={handleConfirmAdd} style={{
                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                border: 'none', background: theme.colors.primary,
                color: 'white', fontSize: '14px', fontWeight: '700',
              }}>
                ✅ {lang === 'fr' ? 'Créer facture' : 'Create invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

