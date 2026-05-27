const COMPANY_KEY = 'gcp-company-id'
const INSTALLATION_KEY = 'gcp-installation-id'

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getLocalCompanyId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(COMPANY_KEY)
}

export function setLocalCompanyId(companyId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPANY_KEY, companyId)
}

export function getInstallationId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(INSTALLATION_KEY)
}

export function setInstallationId(installationId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(INSTALLATION_KEY, installationId)
}

export function getOrCreateLocalCompanyId(): string {
  const existing = getLocalCompanyId()
  if (existing) return existing
  const created = generateId('company')
  setLocalCompanyId(created)
  return created
}

export function getOrCreateInstallationId(): string {
  const existing = getInstallationId()
  if (existing) return existing
  const created = generateId('inst')
  setInstallationId(created)
  return created
}

// IMPORTANT:
// Production multi-company isolation requires Supabase Auth + RLS policies.
// company_id in local storage is only a beta tenant partition helper.
