import { supabase } from './supabase'

// ── COMPANY ──────────────────────────────────────────────────────────────────
export async function syncCompanyToSupabase(companyId: string, data: any) {
  await supabase.from('company_info').upsert({ company_id: companyId, data, updated_at: new Date().toISOString() }, { onConflict: 'company_id' })
}

export async function fetchCompanyFromSupabase(companyId: string) {
  const { data } = await supabase.from('company_info').select('data').eq('company_id', companyId).single()
  return data?.data ?? null
}

// ── EMPLOYEES ────────────────────────────────────────────────────────────────
export async function syncEmployeesToSupabase(companyId: string, employees: any[]) {
  for (const emp of employees) {
    await supabase.from('employees').upsert({
      id: emp.id, company_id: companyId,
      name: emp.name, role: emp.role, pin: emp.pin,
      work_mode: emp.workMode, hourly_rate: emp.hourlyRate,
      color: emp.color, active: emp.active,
      worker_type: emp.workerType,
      phone: emp.phone, email: emp.email,
      address: emp.address, city: emp.city,
      province: emp.province, postal_code: emp.postalCode,
      emergency_contact: emp.emergencyContact,
      emergency_phone: emp.emergencyPhone,
      emergency_relation: emp.emergencyRelation,
      hire_date: emp.hireDate,
      contract_renewal_date: emp.contractRenewalDate,
      vacation_rate_override: emp.vacationRateOverride,
      annual_salary: emp.annualSalary,
      employee_province: emp.employeeProvince,
      pay_frequency: emp.payFrequency,
      pay_period_start: emp.payPeriodStart,
      business_name: emp.businessName,
      gst_number: emp.gstNumber,
      sin: emp.sin,
      invoice_sequence: emp.invoiceSequence,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }
}

export async function fetchEmployeesFromSupabase(companyId: string) {
  const { data } = await supabase.from('employees').select('*').eq('company_id', companyId)
  if (!data) return []
  return data.map((e: any) => ({
    id: e.id, name: e.name, role: e.role, pin: e.pin,
    workMode: e.work_mode, hourlyRate: e.hourly_rate,
    color: e.color, active: e.active,
    workerType: e.worker_type,
    phone: e.phone, email: e.email,
    address: e.address, city: e.city,
    province: e.province, postalCode: e.postal_code,
    emergencyContact: e.emergency_contact,
    emergencyPhone: e.emergency_phone,
    emergencyRelation: e.emergency_relation,
    hireDate: e.hire_date,
    contractRenewalDate: e.contract_renewal_date,
    vacationRateOverride: e.vacation_rate_override,
    annualSalary: e.annual_salary,
    employeeProvince: e.employee_province,
    payFrequency: e.pay_frequency,
    payPeriodStart: e.pay_period_start,
    businessName: e.business_name,
    gstNumber: e.gst_number,
    sin: e.sin,
    invoiceSequence: e.invoice_sequence,
    createdAt: e.created_at,
  }))
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
export async function syncClientsToSupabase(companyId: string, clients: any[]) {
  for (const c of clients) {
    await supabase.from('clients').upsert({
      id: c.id, company_id: companyId,
      name: c.name, phone: c.phone,
      email: c.email, address: c.address,
      city: c.city, province: c.province,
      postal_code: c.postalCode, notes: c.notes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }
}

export async function fetchClientsFromSupabase(companyId: string) {
  const { data } = await supabase.from('clients').select('*').eq('company_id', companyId)
  if (!data) return []
  return data.map((c: any) => ({
    id: c.id, name: c.name, phone: c.phone,
    email: c.email, address: c.address,
    city: c.city, province: c.province,
    postalCode: c.postal_code, notes: c.notes,
    createdAt: c.created_at,
  }))
}

// ── DOCUMENTS ────────────────────────────────────────────────────────────────
export async function syncDocumentsToSupabase(companyId: string, documents: any[]) {
  for (const d of documents) {
    await supabase.from('documents').upsert({
      id: d.id, company_id: companyId,
      type: d.type, number: d.number,
      date: d.date, due_date: d.dueDate,
      status: d.status,
      client_id: d.clientId, client_name: d.clientName,
      client_address: d.clientAddress, client_email: d.clientEmail,
      client_phone: d.clientPhone, site_address: d.siteAddress,
      ref_quote: d.refQuote, ref_contract: d.refContract,
      company_name: d.companyName, company_address: d.companyAddress,
      company_phone: d.companyPhone, company_email: d.companyEmail,
      company_gst: d.companyGST, company_wcb: d.companyWCB,
      company_bn: d.companyBN, company_logo: d.companyLogo,
      lines: d.lines,
      material_lines: d.materialLines ?? [],
      labour_lines: d.labourLines ?? [],
      other_lines: d.otherLines ?? [],
      subcontract_lines: d.subcontractLines ?? [],
      subtotal: d.subtotal, subtotal_materials: d.subtotalMaterials,
      subtotal_labour: d.subtotalLabour, subtotal_other: d.subtotalOther,
      subtotal_subcontract: d.subtotalSubcontract,
      discount_pct: d.discountPct, discount_amount: d.discountAmount,
      tax_rate: d.taxRate, tax_amount: d.taxAmount,
      total: d.total, deposit_amount: d.depositAmount,
      deposit_pct: d.depositPct, payment_mid_pct: d.paymentMidPct,
      payment_final_pct: d.paymentFinalPct, balance_due: d.balanceDue,
      late_interest_pct: d.lateInterestPct, holdback_pct: d.holdbackPct,
      warranty_years: d.warrantyYears, quote_valid_days: d.quoteValidDays,
      work_start_date: d.workStartDate, work_end_date: d.workEndDate,
      permit_by: d.permitBy, accepted_payments: d.acceptedPayments ?? [],
      contract_object: d.contractObject,
      clause_change_order: d.clauseChangeOrder,
      clause_resiliation: d.clauseResiliation,
      clause_warranty_details: d.clauseWarrantyDetails,
      has_insurance: d.hasInsurance,
      subcontract_authorized: d.subcontractAuthorized,
      subcontractor_name: d.subcontractorName,
      subcontractor_phone: d.subcontractorPhone,
      subcontractor_license: d.subcontractorLicense,
      notes: d.notes, signature: d.signature,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }
}

export async function fetchDocumentsFromSupabase(companyId: string) {
  const { data } = await supabase.from('documents').select('*').eq('company_id', companyId)
  if (!data) return []
  return data.map((d: any) => ({
    id: d.id, type: d.type, number: d.number,
    date: d.date, dueDate: d.due_date, status: d.status,
    clientId: d.client_id, clientName: d.client_name,
    clientAddress: d.client_address, clientEmail: d.client_email,
    clientPhone: d.client_phone, siteAddress: d.site_address,
    refQuote: d.ref_quote, refContract: d.ref_contract,
    companyName: d.company_name, companyAddress: d.company_address,
    companyPhone: d.company_phone, companyEmail: d.company_email,
    companyGST: d.company_gst, companyWCB: d.company_wcb,
    companyBN: d.company_bn, companyLogo: d.company_logo,
    lines: d.lines,
    materialLines: d.material_lines,
    labourLines: d.labour_lines,
    otherLines: d.other_lines,
    subcontractLines: d.subcontract_lines,
    subtotal: d.subtotal, subtotalMaterials: d.subtotal_materials,
    subtotalLabour: d.subtotal_labour, subtotalOther: d.subtotal_other,
    subtotalSubcontract: d.subtotal_subcontract,
    discountPct: d.discount_pct, discountAmount: d.discount_amount,
    taxRate: d.tax_rate, taxAmount: d.tax_amount,
    total: d.total, depositAmount: d.deposit_amount,
    depositPct: d.deposit_pct, paymentMidPct: d.payment_mid_pct,
    paymentFinalPct: d.payment_final_pct, balanceDue: d.balance_due,
    lateInterestPct: d.late_interest_pct, holdbackPct: d.holdback_pct,
    warrantyYears: d.warranty_years, quoteValidDays: d.quote_valid_days,
    workStartDate: d.work_start_date, workEndDate: d.work_end_date,
    permitBy: d.permit_by, acceptedPayments: d.accepted_payments,
    contractObject: d.contract_object,
    clauseChangeOrder: d.clause_change_order,
    clauseResiliation: d.clause_resiliation,
    clauseWarrantyDetails: d.clause_warranty_details,
    hasInsurance: d.has_insurance,
    subcontractAuthorized: d.subcontract_authorized,
    subcontractorName: d.subcontractor_name,
    subcontractorPhone: d.subcontractor_phone,
    subcontractorLicense: d.subcontractor_license,
    notes: d.notes, signature: d.signature,
    createdAt: d.created_at, updatedAt: d.updated_at,
  }))
}

// ── DAY DETAILS ───────────────────────────────────────────────────────────────
export async function syncDayDetailsToSupabase(companyId: string, dayDetails: Record<string, any>) {
  for (const [key, detail] of Object.entries(dayDetails)) {
    await supabase.from('day_details').upsert({
      id: key, company_id: companyId,
      employee_id: detail.employeeId,
      date: detail.date,
      sessions: detail.sessions ?? [],
      total_hours: detail.totalHours,
      total_revenue: detail.totalRevenue,
      total_break: detail.totalBreak,
      materials: detail.materials ?? [],
      notes: detail.notes ?? '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }
}

export async function fetchDayDetailsFromSupabase(companyId: string) {
  const { data } = await supabase.from('day_details').select('*').eq('company_id', companyId)
  if (!data) return {}
  const result: Record<string, any> = {}
  for (const d of data) {
    result[d.id] = {
      date: d.date, employeeId: d.employee_id,
      sessions: d.sessions, totalHours: d.total_hours,
      totalRevenue: d.total_revenue, totalBreak: d.total_break,
      materials: d.materials, notes: d.notes,
    }
  }
  return result
    }
