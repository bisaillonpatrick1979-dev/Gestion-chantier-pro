import { supabase, isSupabaseConfigured } from './supabase'

function canSync() {
  if (!isSupabaseConfigured) {
    console.warn('Supabase sync skipped: environment variables are not configured.')
    return false
  }
  return true
}

// Temporary single-tenant strategy (no company_id yet):
// replace the full remote list so stale local caches cannot repopulate cloud rows.
async function replaceTableRows(table: 'employees' | 'clients' | 'documents' | 'projects', rows: any[]) {
  if (!canSync()) return
  const { data: existingRows, error: fetchErr } = await supabase.from(table).select('id')
  if (fetchErr) {
    console.error(`Fetch existing ${table} ids error:`, fetchErr)
    return
  }

  const nextIds = new Set((rows ?? []).map((r: any) => r.id).filter(Boolean))
  const existingIds = (existingRows ?? []).map((r: any) => r.id).filter(Boolean)
  const idsToDelete = existingIds.filter((id: string) => !nextIds.has(id))

  if (rows.length > 0) {
    const { error: upsertErr } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
    if (upsertErr) {
      console.error(`Sync ${table} upsert error:`, upsertErr)
      return
    }
  }

  if (idsToDelete.length > 0) {
    const { error: deleteErr } = await supabase.from(table).delete().in('id', idsToDelete)
    if (deleteErr) console.error(`Sync ${table} delete stale ids error:`, deleteErr)
  }
}

// ── EMPLOYEES ─────────────────────────────────────────────────────────────
export async function syncEmployeesToSupabase(employees: any[]) {
  if (!canSync()) return
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
  await replaceTableRows('employees', rows)
}

export async function fetchEmployeesFromSupabase() {
  if (!canSync()) return null
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
  if (!canSync()) return
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
  if (!canSync()) return null
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
  if (!canSync()) return
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
  await replaceTableRows('clients', rows)
}

export async function fetchClientsFromSupabase() {
  if (!canSync()) return null
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
  if (!canSync()) return
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
    contract_object: d.contractObject ?? '',
    clause_change_order: d.clauseChangeOrder ?? '',
    clause_resiliation: d.clauseResiliation ?? '',
    clause_warranty_details: d.clauseWarrantyDetails ?? '',
    has_insurance: d.hasInsurance ?? true,
    subcontract_authorized: d.subcontractAuthorized ?? false,
    subcontractor_name: d.subcontractorName ?? '',
    subcontractor_phone: d.subcontractorPhone ?? '',
    subcontractor_license: d.subcontractorLicense ?? '',
    notes: d.notes ?? '',
    signature: d.signature ?? '',
    updated_at: new Date().toISOString(),
  }))
  await replaceTableRows('documents', rows)
}

export async function fetchDocumentsFromSupabase() {
  if (!canSync()) return null
  const { data, error } = await supabase.from('documents').select('*').order('created_at')
  if (error) { console.error('Fetch documents error:', error); return null }
  return data.map((d: any) => ({
    id: d.id,
    type: d.type,
    status: d.status,
    number: d.number,
    date: d.date,
    dueDate: d.due_date,
    clientId: d.client_id,
    clientName: d.client_name,
    clientAddress: d.client_address,
    clientEmail: d.client_email,
    clientPhone: d.client_phone,
    siteAddress: d.site_address,
    refQuote: d.ref_quote,
    refContract: d.ref_contract,
    companyName: d.company_name,
    companyAddress: d.company_address,
    companyPhone: d.company_phone,
    companyEmail: d.company_email,
    companyGST: d.company_gst,
    companyWCB: d.company_wcb,
    companyBN: d.company_bn,
    companyLogo: d.company_logo,
    lines: d.lines ?? [],
    materialLines: d.material_lines ?? [],
    labourLines: d.labour_lines ?? [],
    otherLines: d.other_lines ?? [],
    subcontractLines: d.subcontract_lines ?? [],
    subtotal: d.subtotal,
    subtotalMaterials: d.subtotal_materials,
    subtotalLabour: d.subtotal_labour,
    subtotalOther: d.subtotal_other,
    subtotalSubcontract: d.subtotal_subcontract,
    discountPct: d.discount_pct,
    discountAmount: d.discount_amount,
    taxRate: d.tax_rate,
    taxAmount: d.tax_amount,
    total: d.total,
    depositAmount: d.deposit_amount,
    depositPct: d.deposit_pct,
    paymentMidPct: d.payment_mid_pct,
    paymentFinalPct: d.payment_final_pct,
    balanceDue: d.balance_due,
    lateInterestPct: d.late_interest_pct,
    holdbackPct: d.holdback_pct,
    warrantyYears: d.warranty_years,
    quoteValidDays: d.quote_valid_days,
    workStartDate: d.work_start_date,
    workEndDate: d.work_end_date,
    permitBy: d.permit_by,
    acceptedPayments: d.accepted_payments ?? [],
    contractObject: d.contract_object,
    clauseChangeOrder: d.clause_change_order,
    clauseResiliation: d.clause_resiliation,
    clauseWarrantyDetails: d.clause_warranty_details,
    hasInsurance: d.has_insurance,
    subcontractAuthorized: d.subcontract_authorized,
    subcontractorName: d.subcontractor_name,
    subcontractorPhone: d.subcontractor_phone,
    subcontractorLicense: d.subcontractor_license,
    notes: d.notes,
    signature: d.signature,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }))
}

// ── COMPANY INFO ──────────────────────────────────────────────────────────
export async function syncCompanyToSupabase(company: any) {
  if (!canSync()) return
  const row = {
    id: 'singleton',
    name: company.name ?? '',
    owner_name: company.ownerName ?? '',
    logo_url: company.logoUrl ?? '',
    address: company.address ?? '',
    city: company.city ?? '',
    province: company.province ?? 'AB',
    postal_code: company.postalCode ?? '',
    country: company.country ?? 'CA',
    phone: company.phone ?? '',
    email: company.email ?? '',
    website: company.website ?? '',
    gst_number: company.gstNumber ?? '',
    wcb_number: company.wcbNumber ?? '',
    bn_number: company.bnNumber ?? '',
    etransfer_email: company.etransferEmail ?? '',
    bank_name: company.bankName ?? '',
    bank_transit: company.bankTransit ?? '',
    bank_institution: company.bankInstitution ?? '',
    bank_account: company.bankAccount ?? '',
    default_payment_terms: company.defaultPaymentTerms ?? 'Net 30',
    default_notes: company.defaultNotes ?? '',
    geofencing_enabled: company.geofencingEnabled ?? false,
    geofencing_radius: company.geofencingRadius ?? 100,
    jobsite_lat_lng: company.jobsiteLatLng ?? '',
    payroll_vacation_rate: company.payrollVacationRate ?? 6,
    payroll_health_insurance: company.payrollHealthInsurance ?? 0,
    payroll_dental_insurance: company.payrollDentalInsurance ?? 0,
    payroll_life_insurance: company.payrollLifeInsurance ?? 0,
    payroll_ltd: company.payrollLTD ?? 0,
    payroll_rrsp: company.payrollRRSP ?? 0,
    payroll_eap: company.payrollEAP ?? 0,
    payroll_custom1_name: company.payrollCustom1Name ?? '',
    payroll_custom1_amount: company.payrollCustom1Amount ?? 0,
    payroll_custom2_name: company.payrollCustom2Name ?? '',
    payroll_custom2_amount: company.payrollCustom2Amount ?? 0,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('company_info').upsert(row, { onConflict: 'id' })
  if (error) console.error('Sync company error:', error)
}

export async function fetchCompanyFromSupabase() {
  if (!canSync()) return null
  const { data, error } = await supabase.from('company_info').select('*').eq('id', 'singleton').single()
  if (error) { console.error('Fetch company error:', error); return null }
  return {
    name: data.name,
    ownerName: data.owner_name,
    logoUrl: data.logo_url,
    address: data.address,
    city: data.city,
    province: data.province,
    postalCode: data.postal_code,
    country: data.country,
    phone: data.phone,
    email: data.email,
    website: data.website,
    gstNumber: data.gst_number,
    wcbNumber: data.wcb_number,
    bnNumber: data.bn_number,
    etransferEmail: data.etransfer_email,
    bankName: data.bank_name,
    bankTransit: data.bank_transit,
    bankInstitution: data.bank_institution,
    bankAccount: data.bank_account,
    defaultPaymentTerms: data.default_payment_terms,
    defaultNotes: data.default_notes,
    geofencingEnabled: data.geofencing_enabled,
    geofencingRadius: data.geofencing_radius,
    jobsiteLatLng: data.jobsite_lat_lng,
    payrollVacationRate: data.payroll_vacation_rate,
    payrollHealthInsurance: data.payroll_health_insurance,
    payrollDentalInsurance: data.payroll_dental_insurance,
    payrollLifeInsurance: data.payroll_life_insurance,
    payrollLTD: data.payroll_ltd,
    payrollRRSP: data.payroll_rrsp,
    payrollEAP: data.payroll_eap,
    payrollCustom1Name: data.payroll_custom1_name,
    payrollCustom1Amount: data.payroll_custom1_amount,
    payrollCustom2Name: data.payroll_custom2_name,
    payrollCustom2Amount: data.payroll_custom2_amount,
  }
}

// ── PAYROLL RECORDS ───────────────────────────────────────────────────────
export async function syncPayrollToSupabase(records: any[]) {
  if (!canSync() || !records.length) return
  const rows = records.map(r => ({
    id: r.id,
    employee_id: r.employeeId,
    employee_name: r.employeeName ?? '',
    week_start: r.weekStart ?? '',
    week_end: r.weekEnd ?? '',
    hours_worked: r.hoursWorked ?? 0,
    gross_pay: r.grossPay ?? 0,
    cpp: r.cpp ?? 0,
    ei: r.ei ?? 0,
    fed_tax: r.fedTax ?? 0,
    ab_tax: r.abTax ?? 0,
    total_deductions: r.totalDeductions ?? 0,
    net_pay: r.netPay ?? 0,
    payment_method: r.paymentMethod ?? 'etransfer',
    payment_date: r.paymentDate ?? '',
    payment_ref: r.paymentRef ?? '',
    status: r.status ?? 'pending',
    notes: r.notes ?? '',
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('payroll_records').upsert(rows, { onConflict: 'id' })
  if (error) console.error('Sync payroll error:', error)
}

export async function fetchPayrollFromSupabase() {
  if (!canSync()) return null
  const { data, error } = await supabase.from('payroll_records').select('*').order('created_at')
  if (error) { console.error('Fetch payroll error:', error); return null }
  return data.map((r: any) => ({
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    weekStart: r.week_start,
    weekEnd: r.week_end,
    hoursWorked: r.hours_worked,
    grossPay: r.gross_pay,
    cpp: r.cpp,
    ei: r.ei,
    fedTax: r.fed_tax,
    abTax: r.ab_tax,
    totalDeductions: r.total_deductions,
    netPay: r.net_pay,
    paymentMethod: r.payment_method,
    paymentDate: r.payment_date,
    paymentRef: r.payment_ref,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

// ── PROJECTS ──────────────────────────────────────────────────────────────
export async function syncProjectsToSupabase(projects: any[]) {
  if (!canSync()) return
  const rows = projects.map(p => ({
    id: p.id,
    name: p.name,
    client_id: p.clientId ?? '',
    client_name: p.clientName ?? '',
    address: p.address ?? '',
    city: p.city ?? '',
    status: p.status ?? 'open',
    pay_mode: p.payMode ?? 'hourly',
    hourly_rate: p.hourlyRate ?? null,
    job_amount: p.jobAmount ?? null,
    sqft_rate: p.sqftRate ?? null,
    client_amount: p.clientAmount ?? null,
    assigned_employee_ids: p.assignedEmployeeIds ?? [],
    expenses: p.expenses ?? [],
    work_logs: p.workLogs ?? [],
    jobsite_lat_lng: p.jobsiteLatLng ?? null,
    notes: p.notes ?? '',
    closed_at: p.closedAt ?? null,
    updated_at: new Date().toISOString(),
  }))
  await replaceTableRows('projects', rows)
}

export async function fetchProjectsFromSupabase() {
  if (!canSync()) return null
  const { data, error } = await supabase.from('projects').select('*').order('created_at')
  if (error) { console.error('Fetch projects error:', error); return null }
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    clientId: p.client_id,
    clientName: p.client_name,
    address: p.address,
    city: p.city,
    status: p.status,
    payMode: p.pay_mode,
    hourlyRate: p.hourly_rate,
    jobAmount: p.job_amount,
    sqftRate: p.sqft_rate,
    clientAmount: p.client_amount,
    assignedEmployeeIds: p.assigned_employee_ids ?? [],
    expenses: p.expenses ?? [],
    workLogs: p.work_logs ?? [],
    jobsiteLatLng: p.jobsite_lat_lng,
    notes: p.notes,
    closedAt: p.closed_at,
    createdAt: p.created_at,
  }))
}
