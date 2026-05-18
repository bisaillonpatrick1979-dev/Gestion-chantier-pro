// src/lib/seedData.ts
// Données de démonstration pour les tests
// Tous les employés ont le PIN : 0000

import type { Employee } from '@/types/employee'

const now = new Date().toISOString()

// ── Employés seed ──────────────────────────────────────────────────────────
export const SEED_EMPLOYEES: Employee[] = [
  // Admin
  {
    id: 'seed-admin-001',
    name: 'Patrick Bisaillon',
    role: 'admin',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 45,
    color: '#D6B25E',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },

  // Contracteurs (3)
  {
    id: 'seed-contractor-001',
    name: 'Jean-François Roy',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 38,
    color: '#3b82f6',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  {
    id: 'seed-contractor-002',
    name: 'Marc Leblanc',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 35,
    color: '#22c55e',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  {
    id: 'seed-contractor-003',
    name: 'Kevin Tremblay',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 32,
    color: '#f97316',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },

  // Salariés (3)
  {
    id: 'seed-salaried-001',
    name: 'Sophie Gagnon',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 28,
    color: '#a855f7',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'weekly',
  },
  {
    id: 'seed-salaried-002',
    name: 'Luc Fortin',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 30,
    color: '#ec4899',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'biweekly',
  },
  {
    id: 'seed-salaried-003',
    name: 'David Martin',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 26,
    color: '#14b8a6',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'weekly',
  },
]

// ── Compagnie seed ─────────────────────────────────────────────────────────
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
  bankName: 'RBC',
  bankTransit: '00123',
  bankInstitution: '003',
  bankAccount: '1234567',
  defaultNotes: 'Merci pour votre confiance! Paiement dû dans 30 jours.',
  defaultPaymentTerms: 'Net 30',
}

// ── Clients seed ───────────────────────────────────────────────────────────
export const SEED_CLIENTS = [
  {
    id: 'seed-client-001',
    name: 'Martin Côté',
    phone: '403-555-0201',
    email: 'martin.cote@email.com',
    address: '456 Oak Ave SW',
    city: 'Calgary',
    province: 'AB',
    postalCode: 'T2Y 1B2',
    notes: 'Client régulier — toiture résidentielle',
    createdAt: now,
  },
  {
    id: 'seed-client-002',
    name: 'Jennifer Walsh',
    phone: '403-555-0302',
    email: 'jwalsh@email.com',
    address: '789 Maple Dr NW',
    city: 'Calgary',
    province: 'AB',
    postalCode: 'T3A 2C3',
    notes: 'Siding + toiture',
    createdAt: now,
  },
  {
    id: 'seed-client-003',
    name: 'Robert Chen',
    phone: '587-555-0403',
    email: 'rchen@email.com',
    address: '321 Pine Rd',
    city: 'Airdrie',
    province: 'AB',
    postalCode: 'T4B 3D4',
    notes: 'Nouveau client — dégâts grêle',
    createdAt: now,
  },
]

// ── Clés localStorage de tous les stores ──────────────────────────────────
export const ALL_STORE_KEYS = [
  'employee-store-v1',
  'company-store-v1',
  'client-store-v1',
  'document-store-v1',
  'catalogue-store-v1',
  'commande-store-v1',
  'employee-invoice-store-v1',
  'gcp-goals-v1',
  'voice-reminder-store-v1',
  'onboarding-store-v1',
]
