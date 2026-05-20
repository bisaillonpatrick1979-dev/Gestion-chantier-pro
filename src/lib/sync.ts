import { supabase } from './supabase'

// ── EMPLOYEES ─────────────────────────────────────────────────────────────
export async function syncEmployeesToSupabase(employees: any[]) {
  if (!employees.length) return
  const rows = employees.map(e => ({
    id: e.id,
    name: e.name,
    role: e.role,
    pin: e.pin,
    work_mode: e.workMode,
    hourly_rate: e.hourlyRate ?? 0,
    color: e.color ?? '#a855f7',
    active: e.active ?? true,
    worker_type: e.workerType ?? 'contractor',
    phone: e.phone ?? null,
    email: e.email ?? null,
    address: e.address ?? null,
    city: e.city ?? null,
    province: e.province ?? 'AB',
    postal_code: e.postalCode ?? null,
    emergency_contact: e.emergencyContact ?? null,
    emergency_phone: e.emergencyPhone ?? null,
    emergency_relation: e.emergencyRelation ?? null,
    business_name: e.businessName ?? null,
    gst_number: e.gstNumber ?? null,
    sin: e.sin ?? null,
    hire_date: e.hireDate ?? null,
    contract_renewal_date: e.contractRenewalDate ?? null,
    annual_salary: e.annualSalary ?? null,
    pay_frequency: e.payFrequency ?? null,
    pay_period_start: e.payPeriodStart ?? null,
    employee_province: e.employeeProvince ?? null,
    vacation_rate_override: e.vacationRateOverride ?? null,
    invoice_sequence: e.invoiceSequence ?? 0,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('employees').upsert(rows, { onConflict: 'id' })
  if (error) console.error('Sync employees error:', error)
}

export async function fetchEmployeesFromSupabase() {
  const { data, error } = await supabase.from('employees').select('*').order('created_at')
  if (error) { console.error('Fetch employees error:', error); return null }
  return data.map((e: any) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    pin: e.pin,
    workMode: e.work_mode,
    hourlyRate: e.hourly_rate,
    color: e.color,
    active: e.active,
    workerType: e.worker_type,
    phone: e.phone,
    email: e.email,
    address: e.address,
    city: e.city,
    province: e.province,
    postalCode: e.postal_code,
    emergencyContact: e.emergency_contact,
    emergencyPhone: e.emergency_phone,
    emergencyRelation: e.emergency_relation,
    businessName: e.business_name,
    gstNumber: e.gst_number,
    sin: e.sin,
    hireDate: e.hire_date,
    contractRenewalDate: e.contract_renewal_date,
    annualSalary: e.annual_salary,
    payFrequency: e.pay_frequency,
    payPeriodStart: e.pay_period_start,
    employeeProvince: e.employee_province,
    vacationRateOverride: e.vacation_rate_override,
    invoiceSequence: e.invoice_sequence,
    createdAt: e.created_at,
  }))
}

// ── DAY DETAILS ───────────────────────────────────────────────────────────
export async function syncDayDetailToSupabase(key: string, detail: any) {
  const row = {
    id: key,
    employee_id: detail.employeeId,
    date: detail.date,
    sessions: detail.sessions ?? [],
    total_hours: detail.totalHours ?? 0,
    total_revenue: detail.totalRevenue ?? 0,
    total_break: detail.totalBreak ?? 0,
    materials: detail.materials ?? [],
    notes: detail.notes ?? '',
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('day_details').upsert(row, { onConflict: 'id' })
  if (error) console.error('Sync day_detail error:', error)
}

export async function fetchDayDetailsFromSupabase() {
  const { data, error } = await supabase.from('day_details').select('*')
  if (error) { console.error('Fetch day_details error:', error); return null }
  const result: Record<string, any> = {}
  data.forEach((d: any) => {
    result[d.id] = {
      date: d.date,
      employeeId: d.employee_id,
      sessions: d.sessions ?? [],
      totalHours: d.total_hours,
      totalRevenue: d.total_revenue,
      totalBreak: d.total_break,
      materials: d.materials ?? [],
      notes: d.notes ?? '',
    }
  })
  return result
}

// ── CLIENTS ───────────────────────────────────────────────────────────────
export async function syncClientsToSupabase(clients: any[]) {
  if (!clients.length) return
  const rows = clients.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    province: c.province ?? 'AB',
    postal_code: c.postalCode ?? '',
    notes: c.notes ?? '',
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('clients').upsert(rows, { onConflict: 'id' })
  if (error) console.error('Sync clients error:', error)
}

export async function fetchClientsFromSupabase() {
  const { data, error } = await supabase.from('clients').select('*').order('created_at')
  if (error) { console.error('Fetch clients error:', error); return null }
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    city: c.city,
    province: c.province,
    postalCode: c.postal_code,
    notes: c.notes,
    createdAt: c.created_at,
  }))
}

// ── DOCUMENTS ─────────────────────────────────────────────────────────────
export async function syncDocumentsToSupabase(documents: any[]) {
  if (!documents.length) return
  const rows = documents.map(d => ({
    id: d.id,
    type: d.type,
    status: d.status ?? 'draft',
    number: d.number ?? '',
    date: d.date ?? '',
    due_date: d.dueDate ?? '',
    client_id: d.clientId ?? null,
    client_name: d.clientName ?? '',
    client_address: d.clientAddress ?? '',
    client_email: d.clientEmail ?? '',
    client_phone: d.clientPhone ?? '',
    site_address: d.siteAddress ?? '',
    ref_quote: d.refQuote ?? '',
    ref_contract: d.refContract ?? '',
    company_name: d.companyName ?? '',
    company_address: d.companyAddress ?? '',
    company_phone: d.companyPhone ?? '',
    company_email: d.companyEmail ?? '',
    company_gst: d.companyGST ?? '',
    company_wcb: d.companyWCB ?? '',
    company_bn: d.companyBN ?? '',
    company_logo: d.companyLogo ?? '',
    lines: d.lines ?? [],
    material_lines: d.materialLines ?? [],
    labour_lines: d.labourLines ?? [],
    other_lines: d.otherLines ?? [],
    subcontract_lines: d.subcontractLines ?? [],
    subtotal: d.subtotal ?? 0,
    subtotal_materials: d.subtotalMaterials ?? 0,
    subtotal_labour: d.subtotalLabour ?? 0,
    subtotal_other: d.subtotalOther ?? 0,
    subtotal_subcontract: d.subtotalSubcontract ?? 0,
    discount_pct: d.discountPct ?? 0,
    discount_amount: d.discountAmount ?? 0,
    tax_rate: d.taxRate ?? 5,
    tax_amount: d.taxAmount ?? 0,
    total: d.total ?? 0,
    deposit_amount: d.depositAmount ?? 0,
    deposit_pct: d.depositPct ?? 25,
    payment_mid_pct: d.paymentMidPct ?? 25,
    payment_final_pct: d.paymentFinalPct ?? 50,
    balance_due: d.balanceDue ?? 0,
    late_interest_pct: d.lateInterestPct ?? 2,
    holdback_pct: d.holdbackPct ?? 0,
    warranty_years: d.warrantyYears ?? 2,
    quote_valid_days: d.quoteValidDays ?? 30,
    work_start_date: d.workStartDate ?? '',
    work_end_date: d.workEndDate ?? '',
    permit_by: d.permitBy ?? 'client',
    accepted_payments: d.acceptedPayments ?? [],
    contract_object: d.co
