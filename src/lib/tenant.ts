const COMPANY_ID_KEY = 'gcp-active-company-id'
const INSTALLATION_ID_KEY = 'gcp-installation-id'

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `gcp-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getCompanyId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(COMPANY_ID_KEY)
}

export function setCompanyId(companyId: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(COMPANY_ID_KEY, companyId)
}

export function getOrCreateCompanyId() {
  const existing = getCompanyId()
  if (existing && existing.trim().length > 0) return existing
  const created = randomId()
  setCompanyId(created)
  return created
}

export function getInstallationId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(INSTALLATION_ID_KEY)
}

export function getOrCreateInstallationId() {
  const existing = getInstallationId()
  if (existing && existing.trim().length > 0) return existing
  const created = randomId()
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(INSTALLATION_ID_KEY, created)
  }
  return created
}
