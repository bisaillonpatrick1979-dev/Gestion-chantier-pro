// src/hooks/useGeofencing.ts
// Hook géofencing — calcule distance GPS entre l'employé et le chantier

import { useState, useEffect, useCallback } from 'react'
import { useCompanyStore } from '@/store/useCompanyStore'

// ─────────────────────────────────────────────────────────────────────────────
// 📐 TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type GeofenceStatus =
  | 'disabled'      // Géofencing désactivé par l'admin
  | 'no_jobsite'    // Aucun chantier configuré
  | 'checking'      // En train de vérifier la position
  | 'granted'       // Dans le rayon — peut puncher
  | 'denied'        // Trop loin — ne peut pas puncher
  | 'gps_error'     // Erreur GPS / permission refusée
  | 'gps_unavailable' // GPS non disponible (navigateur)

export interface GeofenceResult {
  status: GeofenceStatus
  distance: number | null       // Distance en mètres (null si inconnue)
  radius: number                // Rayon configuré en mètres
  canPunchIn: boolean           // true = autorisé à puncher
  isChecking: boolean           // true = en cours de vérification
  errorMessage: string | null   // Message d'erreur lisible
  jobsiteLabel: string          // Label du chantier configuré
  refresh: () => void           // Forcer une nouvelle vérification
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧮 FORMULE HAVERSINE — distance entre 2 coordonnées GPS
// ─────────────────────────────────────────────────────────────────────────────

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000 // Rayon de la Terre en mètres
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance en mètres
}

// ─────────────────────────────────────────────────────────────────────────────
// 🪝 HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function useGeofencing(): GeofenceResult {
  const { company } = useCompanyStore()
  const { geofencingEnabled, geofencingRadius, jobsiteLatLng } = company

  const [status, setStatus]     = useState<GeofenceStatus>('checking')
  const [distance, setDistance] = useState<number | null>(null)
  const [trigger, setTrigger]   = useState(0)

  const refresh = useCallback(() => setTrigger(t => t + 1), [])

  useEffect(() => {
    // ── Géofencing désactivé ──────────────────────────────────────────────
    if (!geofencingEnabled) {
      setStatus('disabled')
      setDistance(null)
      return
    }

    // ── Aucun chantier configuré ──────────────────────────────────────────
    if (!jobsiteLatLng || !jobsiteLatLng.includes(',')) {
      setStatus('no_jobsite')
      setDistance(null)
      return
    }

    // ── Pas de GPS disponible ─────────────────────────────────────────────
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('gps_unavailable')
      setDistance(null)
      return
    }

    // ── Parser les coordonnées du chantier ────────────────────────────────
    const parts = jobsiteLatLng.split(',')
    const jobLat = parseFloat(parts[0]?.trim())
    const jobLng = parseFloat(parts[1]?.trim())

    if (isNaN(jobLat) || isNaN(jobLng)) {
      setStatus('no_jobsite')
      setDistance(null)
      return
    }

    // ── Vérification GPS ──────────────────────────────────────────────────
    setStatus('checking')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const dist = haversineDistance(latitude, longitude, jobLat, jobLng)
        setDistance(Math.round(dist))

        if (dist <= geofencingRadius) {
          setStatus('granted')
        } else {
          setStatus('denied')
        }
      },
      (error) => {
        console.warn('Geofencing GPS error:', error.message)
        setStatus('gps_error')
        setDistance(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache 30 secondes
      }
    )
  }, [geofencingEnabled, geofencingRadius, jobsiteLatLng, trigger])

  // ── Calcul des valeurs dérivées ───────────────────────────────────────────
  const canPunchIn =
    status === 'disabled' ||    // Géofencing off → toujours autorisé
    status === 'no_jobsite' ||  // Pas de chantier → toujours autorisé
    status === 'gps_unavailable' || // Pas de GPS → toujours autorisé
    status === 'gps_error' ||   // Erreur GPS → on laisse passer (fail-safe)
    status === 'granted'        // Dans le rayon ✅

  const isChecking = status === 'checking'

  const errorMessage: string | null = (() => {
    if (status === 'denied' && distance !== null) {
      return `Trop loin du chantier — ${distance}m (max ${geofencingRadius}m)`
    }
    if (status === 'gps_error') {
      return 'Permission GPS refusée — autorisez la localisation'
    }
    return null
  })()

  // Label du chantier pour l'affichage
  const jobsiteLabel = jobsiteLatLng
    ? `📍 ${jobsiteLatLng}`
    : ''

  return {
    status,
    distance,
    radius: geofencingRadius,
    canPunchIn,
    isChecking,
    errorMessage,
    jobsiteLabel,
    refresh,
  }
    }
