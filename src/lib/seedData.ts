// src/lib/seedData.ts
// Données de démonstration complètes — PIN : 0000 pour tous

import type { Employee } from '@/types/employee'
import type { GCPDocument } from '@/types/documents'

const now = new Date().toISOString()

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const makeSession = (date: string, workHours: number) => {
  const punchInMs  = new Date(`${date}T13:00:00.000Z`).getTime() // 7h AM MDT
  const breakMs    = 30 * 60 * 1000                              // 30 min
  const punchOutMs = punchInMs + workHours * 3_600_000 + breakMs
  return {
    punchIn:  new Date(punchInMs).toISOString(),
    punchOut: new Date(punchOutMs).toISOString(),
  }
}

const makeDetail = (date: string, hours: number, rate: number) => ({
  date,
  totalHours:   hours,
  totalRevenue: Math.round(hours * rate * 100) / 100,
  totalBreak:   1800, // 30 min en secondes
  sessions:     [makeSession(date, hours)],
})

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYÉS — contractors invoiceSequence = 3 (2 invoices déjà créées)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_EMPLOYEES: Employee[] = [
  // Admin
  {
    id: 'seed-admin-001', name: 'Patrick Bisaillon', role: 'admin', pin: '0000',
    workMode: 'heure', hourlyRate: 45, color: '#D6B25E',
    active: true, createdAt: now, invoiceSequence: 1, workerType: 'contractor',
  },
  // Contracteurs
  {
    id: 'seed-contractor-001', name: 'Jean-François Roy', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 38, color: '#3b82f6',
    active: true, createdAt: now, invoiceSequence: 3, workerType: 'contractor',
  },
  {
    id: 'seed-contractor-002', name: 'Marc Leblanc', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 35, color: '#22c55e',
    active: true, createdAt: now, invoiceSequence: 3, workerType: 'contractor',
  },
  {
    id: 'seed-contractor-003', name: 'Kevin Tremblay', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 32, color: '#f97316',
    active: true, createdAt: now, invoiceSequence: 3, workerType: 'contractor',
  },
  // Salariés
  {
    id: 'seed-salaried-001', name: 'Sophie Gagnon', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 28, color: '#a855f7',
    active: true, createdAt: now, invoiceSequence: 1, workerType: 'salaried',
    employeeCountry: 'CA', employeeProvince: 'AB', payFrequency: 'weekly',
  },
  {
    id: 'seed-salaried-002', name: 'Luc Fortin', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 30, color: '#ec4899',
    active: true, createdAt: now, invoiceSequence: 1, workerType: 'salaried',
    employeeCountry: 'CA', employeeProvince: 'AB', payFrequency: 'biweekly',
  },
  {
    id: 'seed-salaried-003', name: 'David Martin', role: 'employee', pin: '0000',
    workMode: 'heure', hourlyRate: 26, color: '#14b8a6',
    active: true, createdAt: now, invoiceSequence: 1, workerType: 'salaried',
    employeeCountry: 'CA', employeeProvince: 'AB', payFrequency: 'weekly',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPAGNIE
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_COMPANY = {
  name: 'Hailite Xteriors',
  ownerName: 'Patrick Bisaillon',
  address: '123 Construction Ave NW',
  city: 'Calgary',
  province: 'AB',
  postalCode: 'T2X 0A1',
  phone: '403-555-0100',
  email: 'info@hailite.ca',
  gstNumber: '123456789 RT0001',
  wcbNumber: 'WCB-654321',
  logoUrl: '',
  etransferEmail: 'patrick@hailite.ca',
  bankName: 'RBC Royal Bank',
  bankTransit: '00123',
  bankInstitution: '003',
  bankAccount: '1234567',
  defaultNotes: 'Merci pour votre confiance! Paiement dû dans 30 jours. Virement Interac accepté.',
  defaultPaymentTerms: 'Net 30',
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_CLIENTS = [
  {
    id: 'seed-client-001', name: 'Martin Côté',
    phone: '403-555-0201', email: 'martin.cote@email.com',
    address: '456 Oak Ave SW', city: 'Calgary', province: 'AB', postalCode: 'T2Y 1B2',
    notes: 'Client régulier — toiture résidentielle. Préfère les communications par texto.',
    createdAt: now,
  },
  {
    id: 'seed-client-002', name: 'Jennifer Walsh',
    phone: '403-555-0302', email: 'jwalsh@email.com',
    address: '789 Maple Dr NW', city: 'Calgary', province: 'AB', postalCode: 'T3A 2C3',
    notes: 'Siding + toiture. Propriétaire très attentionnée aux détails.',
    createdAt: now,
  },
  {
    id: 'seed-client-003', name: 'Robert Chen',
    phone: '587-555-0403', email: 'rchen@email.com',
    address: '321 Pine Rd', city: 'Airdrie', province: 'AB', postalCode: 'T4B 3D4',
    notes: 'Nouveau client — dégâts de grêle mai 2026. Urgent.',
    createdAt: now,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
const compInfo = {
  companyName: 'Hailite Xteriors',
  companyAddress: '123 Construction Ave NW, Calgary AB T2X 0A1',
  companyPhone: '403-555-0100',
  companyEmail: 'info@hailite.ca',
  companyGST: '123456789 RT0001',
  companyWCB: 'WCB-654321',
}

export const SEED_DOCUMENTS: GCPDocument[] = [
  // Facture + GST + dépôt → sent
  {
    id: 'seed-doc-001', type: 'invoice', number: 'INV-2026-001',
    date: '2026-05-01', dueDate: '2026-05-31', status: 'sent',
    clientId: 'seed-client-001', clientName: 'Martin Côté',
    clientAddress: '456 Oak Ave SW, Calgary AB T2Y 1B2',
    clientEmail: 'martin.cote@email.com', clientPhone: '403-555-0201',
    ...compInfo,
    lines: [
      { id: 'sd1-l1', description: 'Remplacement toiture — bardeaux asphaltés IKO', qty: 500, unit: 'pi²', unitPrice: 8.50 },
      { id: 'sd1-l2', description: "Main d'oeuvre installation", qty: 16, unit: 'heure', unitPrice: 45.00 },
      { id: 'sd1-l3', description: 'Disposition des déchets et nettoyage', qty: 1, unit: 'unité', unitPrice: 350.00 },
    ],
    subtotal: 5320.00, discountPct: 0, discountAmount: 0,
    taxRate: 5, taxAmount: 266.00, total: 5586.00,
    depositAmount: 2000.00, balanceDue: 3586.00,
    notes: "Garantie main d'oeuvre 2 ans. Matériaux garantis par le fabricant IKO.",
    createdAt: '2026-05-01T10:00:00.000Z', updatedAt: '2026-05-01T10:00:00.000Z',
  },
  // Facture + GST + remise 10% → paid
  {
    id: 'seed-doc-002', type: 'invoice', number: 'INV-2026-002',
    date: '2026-04-15', dueDate: '2026-05-15', status: 'paid',
    clientId: 'seed-client-002', clientName: 'Jennifer Walsh',
    clientAddress: '789 Maple Dr NW, Calgary AB T3A 2C3',
    clientEmail: 'jwalsh@email.com', clientPhone: '403-555-0302',
    ...compInfo,
    lines: [
      { id: 'sd2-l1', description: 'Installation siding vinyle Gentek', qty: 800, unit: 'pi²', unitPrice: 6.25 },
      { id: 'sd2-l2', description: "Main d'oeuvre installation", qty: 20, unit: 'heure', unitPrice: 42.00 },
    ],
    subtotal: 5840.00, discountPct: 10, discountAmount: 584.00,
    taxRate: 5, taxAmount: 262.80, total: 5518.80,
    depositAmount: 0, balanceDue: 0,
    notes: 'Facture payée en totalité le 2026-04-22. Merci!',
    createdAt: '2026-04-15T09:00:00.000Z', updatedAt: '2026-04-22T09:00:00.000Z',
  },
  // Facture sans taxe → draft
  {
    id: 'seed-doc-003', type: 'invoice', number: 'INV-2026-003',
    date: '2026-05-18', dueDate: '', status: 'draft',
    clientId: 'seed-client-003', clientName: 'Robert Chen',
    clientAddress: '321 Pine Rd, Airdrie AB T4B 3D4',
    clientEmail: 'rchen@email.com', clientPhone: '587-555-0403',
    ...compInfo,
    lines: [
      { id: 'sd3-l1', description: 'Inspection toiture post-grêle', qty: 2, unit: 'heure', unitPrice: 125.00 },
    ],
    subtotal: 250.00, discountPct: 0, discountAmount: 0,
    taxRate: 0, taxAmount: 0, total: 250.00,
    depositAmount: 0, balanceDue: 250.00,
    notes: "Inspection préliminaire — rapport d'expertise complet inclus.",
    createdAt: '2026-05-18T08:00:00.000Z', updatedAt: '2026-05-18T08:00:00.000Z',
  },
  // Devis + GST + remise 5% → draft
  {
    id: 'seed-doc-004', type: 'quote', number: 'QUO-2026-001',
    date: '2026-05-10', dueDate: '2026-06-10', status: 'draft',
    clientId: 'seed-client-003', clientName: 'Robert Chen',
    clientAddress: '321 Pine Rd, Airdrie AB T4B 3D4',
    clientEmail: 'rchen@email.com', clientPhone: '587-555-0403',
    ...compInfo,
    lines: [
      { id: 'sd4-l1', description: 'Remplacement toiture complète — bardeaux architectural IKO', qty: 1200, unit: 'pi²', unitPrice: 8.50 },
      { id: 'sd4-l2', description: 'Installation siding vinyle — façade principale', qty: 600, unit: 'pi²', unitPrice: 6.25 },
      { id: 'sd4-l3', description: "Main d'oeuvre complète (équipe 3 personnes)", qty: 48, unit: 'heure', unitPrice: 45.00 },
    ],
    subtotal: 16110.00, discountPct: 5, discountAmount: 805.50,
    taxRate: 5, taxAmount: 765.23, total: 16069.73,
    depositAmount: 0, balanceDue: 16069.73,
    notes: "Devis valide 30 jours. Dépôt de 30% requis à l'acceptation. Durée estimée : 5-7 jours ouvrables.",
    createdAt: '2026-05-10T11:00:00.000Z', updatedAt: '2026-05-10T11:00:00.000Z',
  },
  // Contrat + GST + dépôt 30% → sent
  {
    id: 'seed-doc-005', type: 'contract', number: 'CON-2026-001',
    date: '2026-05-05', dueDate: '', status: 'sent',
    clientId: 'seed-client-001', clientName: 'Martin Côté',
    clientAddress: '456 Oak Ave SW, Calgary AB T2Y 1B2',
    clientEmail: 'martin.cote@email.com', clientPhone: '403-555-0201',
    ...compInfo,
    lines: [
      { id: 'sd5-l1', description: 'Remplacement toiture complète — forfait tout inclus', qty: 1, unit: 'unité', unitPrice: 12500.00 },
      { id: 'sd5-l2', description: "Garantie main d'oeuvre 5 ans", qty: 1, unit: 'unité', unitPrice: 500.00 },
    ],
    subtotal: 13000.00, discountPct: 0, discountAmount: 0,
    taxRate: 5, taxAmount: 650.00, total: 13650.00,
    depositAmount: 4095.00, balanceDue: 9555.00,
    notes: "Travaux prévus : été 2026. Durée : 3-5 jours ouvrables. Nettoyage complet du site inclus. Permis inclus si requis.",
    createdAt: '2026-05-05T14:00:00.000Z', updatedAt: '2026-05-05T14:00:00.000Z',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PUNCH DATA — 10 jours ouvrables (4-15 mai 2026) pour 3 contracteurs
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_DAYS = [
  '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08',
  '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15',
]

// Heures par jour — variation réaliste
const JFR_HOURS = [8.5, 9.0, 8.0, 8.5, 7.5, 9.0, 8.5, 8.0, 9.0, 8.0]  // $38/h
const ML_HOURS  = [8.0, 7.5, 8.5, 8.0, 7.0, 8.5, 8.0, 7.5, 8.5, 8.0]  // $35/h
const KT_HOURS  = [7.5, 8.0, 7.0, 8.5, 7.5, 8.0, 7.5, 8.0, 7.5, 8.5]  // $32/h

export const SEED_DAY_DETAILS: Record<string, any> = {}

BUSINESS_DAYS.forEach((date, i) => {
  SEED_DAY_DETAILS[`seed-contractor-001-${date}`] = makeDetail(date, JFR_HOURS[i], 38)
  SEED_DAY_DETAILS[`seed-contractor-002-${date}`] = makeDetail(date, ML_HOURS[i],  35)
  SEED_DAY_DETAILS[`seed-contractor-003-${date}`] = makeDetail(date, KT_HOURS[i],  32)
})

// ─────────────────────────────────────────────────────────────────────────────
// INVOICES EMPLOYÉS — 2 par contracteur (sem.1 payée, sem.2 envoyée)
// ─────────────────────────────────────────────────────────────────────────────
const companyInvoiceInfo = {
  companyName: 'Hailite Xteriors',
  companyAddress: '123 Construction Ave NW',
  companyCity: 'Calgary AB T2X 0A1',
  companyGST: '123456789 RT0001',
}

const buildWeekDays = (days: string[], hours: number[], rate: number) =>
  days.map((date, i) => ({ date, hours: hours[i], revenue: Math.round(hours[i] * rate * 100) / 100, sessions: 1 }))

// Jean-François Roy — JR
const JFR_W1_HOURS = JFR_HOURS.slice(0, 5) // 41.5h
const JFR_W2_HOURS = JFR_HOURS.slice(5)    // 42.5h
const JFR_W1_TOTAL = JFR_W1_HOURS.reduce((s, h) => s + h, 0) // 41.5
const JFR_W2_TOTAL = JFR_W2_HOURS.reduce((s, h) => s + h, 0) // 42.5

// Marc Leblanc — ML
const ML_W1_HOURS = ML_HOURS.slice(0, 5)  // 39.0h
const ML_W2_HOURS = ML_HOURS.slice(5)     // 40.5h
const ML_W1_TOTAL = ML_W1_HOURS.reduce((s, h) => s + h, 0)
const ML_W2_TOTAL = ML_W2_HOURS.reduce((s, h) => s + h, 0)

// Kevin Tremblay — KT
const KT_W1_HOURS = KT_HOURS.slice(0, 5)  // 38.5h
const KT_W2_HOURS = KT_HOURS.slice(5)     // 39.5h
const KT_W1_TOTAL = KT_W1_HOURS.reduce((s, h) => s + h, 0)
const KT_W2_TOTAL = KT_W2_HOURS.reduce((s, h) => s + h, 0)

export const SEED_EMPLOYEE_INVOICES = [
  // Jean-François Roy — Semaine 1 (payée)
  {
    id: 'seed-einv-jfr-w1',
    number: 'JR-001',
    employeeId: 'seed-contractor-001',
    employeeName: 'Jean-François Roy',
    employeeInitials: 'JR',
    employeeColor: '#3b82f6',
    employeeAddress: '2847 Boul. des Sources',
    employeeCity: 'Calgary AB T2P 1B4',
    employeePhone: '514-555-0187',
    employeeEmail: 'jfroy.construction@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-04',
    periodEnd: '2026-05-08',
    days: buildWeekDays(BUSINESS_DAYS.slice(0, 5), JFR_W1_HOURS, 38),
    totalHours: JFR_W1_TOTAL,
    hourlyRate: 38,
    subtotal: Math.round(JFR_W1_TOTAL * 38 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(JFR_W1_TOTAL * 38 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'payee',
    notes: 'Travaux toiture — chantier Martin Côté',
    createdAt: '2026-05-09T10:00:00.000Z',
  },
  // Jean-François Roy — Semaine 2 (envoyée)
  {
    id: 'seed-einv-jfr-w2',
    number: 'JR-002',
    employeeId: 'seed-contractor-001',
    employeeName: 'Jean-François Roy',
    employeeInitials: 'JR',
    employeeColor: '#3b82f6',
    employeeAddress: '2847 Boul. des Sources',
    employeeCity: 'Calgary AB T2P 1B4',
    employeePhone: '514-555-0187',
    employeeEmail: 'jfroy.construction@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-11',
    periodEnd: '2026-05-15',
    days: buildWeekDays(BUSINESS_DAYS.slice(5), JFR_W2_HOURS, 38),
    totalHours: JFR_W2_TOTAL,
    hourlyRate: 38,
    subtotal: Math.round(JFR_W2_TOTAL * 38 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(JFR_W2_TOTAL * 38 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'envoyee',
    notes: 'Travaux toiture — chantier Martin Côté + Robert Chen',
    createdAt: '2026-05-16T10:00:00.000Z',
  },
  // Marc Leblanc — Semaine 1 (payée)
  {
    id: 'seed-einv-ml-w1',
    number: 'ML-001',
    employeeId: 'seed-contractor-002',
    employeeName: 'Marc Leblanc',
    employeeInitials: 'ML',
    employeeColor: '#22c55e',
    employeeAddress: '1052 Ave Sarcee Trail SW',
    employeeCity: 'Calgary AB T3E 6S6',
    employeePhone: '403-555-0248',
    employeeEmail: 'marc.leblanc.construction@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-04',
    periodEnd: '2026-05-08',
    days: buildWeekDays(BUSINESS_DAYS.slice(0, 5), ML_W1_HOURS, 35),
    totalHours: ML_W1_TOTAL,
    hourlyRate: 35,
    subtotal: Math.round(ML_W1_TOTAL * 35 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(ML_W1_TOTAL * 35 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'payee',
    notes: 'Siding — chantier Jennifer Walsh',
    createdAt: '2026-05-09T11:00:00.000Z',
  },
  // Marc Leblanc — Semaine 2 (envoyée)
  {
    id: 'seed-einv-ml-w2',
    number: 'ML-002',
    employeeId: 'seed-contractor-002',
    employeeName: 'Marc Leblanc',
    employeeInitials: 'ML',
    employeeColor: '#22c55e',
    employeeAddress: '1052 Ave Sarcee Trail SW',
    employeeCity: 'Calgary AB T3E 6S6',
    employeePhone: '403-555-0248',
    employeeEmail: 'marc.leblanc.construction@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-11',
    periodEnd: '2026-05-15',
    days: buildWeekDays(BUSINESS_DAYS.slice(5), ML_W2_HOURS, 35),
    totalHours: ML_W2_TOTAL,
    hourlyRate: 35,
    subtotal: Math.round(ML_W2_TOTAL * 35 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(ML_W2_TOTAL * 35 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'envoyee',
    notes: 'Siding + toiture — chantier Robert Chen',
    createdAt: '2026-05-16T11:00:00.000Z',
  },
  // Kevin Tremblay — Semaine 1 (payée)
  {
    id: 'seed-einv-kt-w1',
    number: 'KT-001',
    employeeId: 'seed-contractor-003',
    employeeName: 'Kevin Tremblay',
    employeeInitials: 'KT',
    employeeColor: '#f97316',
    employeeAddress: '734 Cougar Ridge Dr SW',
    employeeCity: 'Calgary AB T3H 5E6',
    employeePhone: '587-555-0319',
    employeeEmail: 'kevin.tremblay.ext@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-04',
    periodEnd: '2026-05-08',
    days: buildWeekDays(BUSINESS_DAYS.slice(0, 5), KT_W1_HOURS, 32),
    totalHours: KT_W1_TOTAL,
    hourlyRate: 32,
    subtotal: Math.round(KT_W1_TOTAL * 32 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(KT_W1_TOTAL * 32 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'payee',
    notes: 'Toiture — divers chantiers',
    createdAt: '2026-05-09T12:00:00.000Z',
  },
  // Kevin Tremblay — Semaine 2 (envoyée)
  {
    id: 'seed-einv-kt-w2',
    number: 'KT-002',
    employeeId: 'seed-contractor-003',
    employeeName: 'Kevin Tremblay',
    employeeInitials: 'KT',
    employeeColor: '#f97316',
    employeeAddress: '734 Cougar Ridge Dr SW',
    employeeCity: 'Calgary AB T3H 5E6',
    employeePhone: '587-555-0319',
    employeeEmail: 'kevin.tremblay.ext@email.com',
    employeeGSTNumber: '',
    periodStart: '2026-05-11',
    periodEnd: '2026-05-15',
    days: buildWeekDays(BUSINESS_DAYS.slice(5), KT_W2_HOURS, 32),
    totalHours: KT_W2_TOTAL,
    hourlyRate: 32,
    subtotal: Math.round(KT_W2_TOTAL * 32 * 100) / 100,
    remisePercent: 0, remiseAmount: 0,
    gstEnabled: false, gstRate: 5, gstAmount: 0,
    total: Math.round(KT_W2_TOTAL * 32 * 100) / 100,
    ...companyInvoiceInfo,
    status: 'envoyee',
    notes: 'Toiture Martin Côté + Robert Chen',
    createdAt: '2026-05-16T12:00:00.000Z',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES PO — 3 bons de commande réalistes
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_COMMANDES = [
  // PO-001 — Bardeaux reçus
  {
    id: 'seed-cmd-001',
    numero: 'PO-001',
    fournisseur: 'ABC Roofing Supply Ltd.',
    fournisseurEmail: 'orders@abcroofing.ca',
    fournisseurPhone: '403-555-7001',
    adresseLivraison: '456 Oak Ave SW, Calgary AB',
    projetRef: 'Toiture Martin Côté — INV-2026-001',
    dateLivraison: '2026-05-03',
    date: '2026-04-30',
    status: 'recue',
    items: [
      { id: 'cmd1-i1', name: 'Bardeaux asphaltés IKO Cambridge 30 ans', unit: 'botte', quantite: 28, notes: 'Couleur: Weathered Wood' },
      { id: 'cmd1-i2', name: 'Membrane sous-toiture', unit: 'rouleau', quantite: 4, notes: 'Grace Ice & Water Shield' },
      { id: 'cmd1-i3', name: 'Solin aluminium 4"', unit: 'barre', quantite: 10, notes: '' },
      { id: 'cmd1-i4', name: 'Clous à toiture 1.75"', unit: 'boîte', quantite: 5, notes: '1kg/boîte' },
    ],
    notes: 'Livraison confirmée le 3 mai. Tout reçu en bon état.',
    createdAt: '2026-04-30T09:00:00.000Z',
    sentAt: '2026-04-30T09:30:00.000Z',
    receivedAt: '2026-05-03T14:00:00.000Z',
  },
  // PO-002 — Siding envoyé
  {
    id: 'seed-cmd-002',
    numero: 'PO-002',
    fournisseur: 'Western Building Materials',
    fournisseurEmail: 'commandes@westernbm.ca',
    fournisseurPhone: '403-555-7002',
    adresseLivraison: '789 Maple Dr NW, Calgary AB',
    projetRef: 'Siding Jennifer Walsh',
    dateLivraison: '2026-05-20',
    date: '2026-05-15',
    status: 'envoyee',
    items: [
      { id: 'cmd2-i1', name: 'Siding vinyle Gentek Carvedwood 44', unit: 'boîte', quantite: 42, notes: 'Couleur: Driftwood' },
      { id: 'cmd2-i2', name: 'Cornière extérieure vinyle', unit: 'barre', quantite: 16, notes: '10 pieds chaque' },
      { id: 'cmd2-i3', name: 'Sous-siding isolant Tyvek', unit: 'rouleau', quantite: 6, notes: '' },
      { id: 'cmd2-i4', name: 'Moulures de fenêtre vinyle', unit: 'unité', quantite: 8, notes: 'Pour 8 fenêtres' },
    ],
    notes: 'Confirmer la livraison 48h avant. Accès par la ruelle.',
    createdAt: '2026-05-15T10:00:00.000Z',
    sentAt: '2026-05-15T10:30:00.000Z',
  },
  // PO-003 — Brouillon pour inspection Robert Chen
  {
    id: 'seed-cmd-003',
    numero: 'PO-003',
    fournisseur: 'Rona Pro Calgary NE',
    fournisseurEmail: '',
    fournisseurPhone: '403-555-7003',
    adresseLivraison: '321 Pine Rd, Airdrie AB',
    projetRef: 'Chantier Robert Chen — dégâts grêle',
    dateLivraison: '2026-05-25',
    date: '2026-05-18',
    status: 'brouillon',
    items: [
      { id: 'cmd3-i1', name: 'Bardeaux asphaltés IKO Cambridge 30 ans', unit: 'botte', quantite: 65, notes: 'Couleur: Charcoal — à confirmer avec client' },
      { id: 'cmd3-i2', name: 'Solin de cheminée aluminium', unit: 'kit', quantite: 2, notes: '' },
      { id: 'cmd3-i3', name: 'Évent de toiture 14"', unit: 'unité', quantite: 4, notes: '' },
      { id: 'cmd3-i4', name: 'Membrane auto-adhésive', unit: 'rouleau', quantite: 8, notes: '2 épaisseurs sur rives' },
      { id: 'cmd3-i5', name: 'Feutre de construction #15', unit: 'rouleau', quantite: 6, notes: '' },
    ],
    notes: 'EN ATTENTE — confirmer devis avec client avant commande.',
    createdAt: '2026-05-18T08:00:00.000Z',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CLÉS LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_STORE_KEYS = [
  'employee-store-v1',
  'company-store-v1',
  'client-store-v1',
  'document-store-v1',
  'project-store-v1',
  'payroll-rules-store-v1',
  'payroll-store-v1',
  'work-store-v2',
  'contractor-store-v1',
  'catalogue-store-v1',
  'commande-store-v1',
  'employee-invoice-store-v1',
  'gcp-goals-v1',
  'voice-reminder-store-v1',
  'onboarding-store-v1',
  'gcp-theme',
  'gcp-lang',
]
