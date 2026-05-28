'use client'

import { Employee } from '@/types/employee'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export const RECOVERY_MESSAGE_KEY = 'gcp-recovery-message'
export const RECOVERY_LOCK_DISABLED_KEY = 'gcp-local-lock-disabled-until'
export const REQUIRED_LOGIN_METHOD_KEY = 'gcp-required-login-method'
export const QR_REQUIRED_KEY = 'gcp-qr-login-required'
export const BIOMETRIC_REQUIRED_KEY = 'gcp-biometric-login-required'
export const BLOCKED_SESSION_KEY = 'gcp-session-blocked'

function recoveryUntil() {
  const until = new Date()
  until.setHours(until.getHours() + 24)
  return until.toISOString()
}

export function disableLocalLoginRequirements() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RECOVERY_LOCK_DISABLED_KEY, recoveryUntil())
  window.localStorage.setItem(REQUIRED_LOGIN_METHOD_KEY, 'pin')
  window.localStorage.setItem(QR_REQUIRED_KEY, 'false')
  window.localStorage.setItem(BIOMETRIC_REQUIRED_KEY, 'false')
  window.localStorage.removeItem(BLOCKED_SESSION_KEY)
}

function createAdmin(pin: string): Employee {
  return {
    id: 'admin',
    name: 'Admin',
    role: 'admin',
    pin,
    workMode: 'heure',
    hourlyRate: 45,
    color: '#ea580c',
    active: true,
    createdAt: new Date().toISOString(),
    invoiceSequence: 0,
  }
}

export function restoreAdminAccess(newPin?: string) {
  disableLocalLoginRequirements()

  const state = useEmployeeStore.getState()
  const existingAdmin = state.employees.find((employee) => employee.role === 'admin')
  const adminId = existingAdmin?.id ?? 'admin'
  const adminPin = newPin && newPin.trim().length >= 4 ? newPin.trim() : existingAdmin?.pin

  const employees = existingAdmin
    ? state.employees.map((employee) => (
        employee.id === existingAdmin.id
          ? { ...employee, active: true, pin: adminPin ?? employee.pin }
          : employee
      ))
    : [...state.employees, createAdmin(adminPin ?? String(Math.floor(100000 + Math.random() * 900000)))]

  useEmployeeStore.setState({
    employees,
    currentEmployeeId: adminId,
  })

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(RECOVERY_MESSAGE_KEY, 'Accès restauré. Configurez un nouveau PIN dans Réglages.')
  }

  return adminId
}
