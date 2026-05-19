// src/hooks/useGeofencing.ts
// Hook géofencing — vérifie si l'employé est dans le rayon d'au moins un projet ouvert

import { useState, useEffect, useCallback } from 'react'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useProjectStore } from '@/store/useProjectStore'

// ─────────────────────────────────────────────────────────────────────────────
// 📐 TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type GeofenceStatus =
  | 'disabled'        // Géofencing désactivé par l'admin
  | 'no_jobsite'      // Aucun projet ouvert avec coordonnées
  | 'checking'        // En train de vérifier la position
  | 'granted'         // Dans le rayon d'au moins un chantier
  | 'denied'          // Trop loin de tous les chantiers
  | 'gps_error'       // Erreur GPS / permission refusée
  | 'gps_unavailable' // GPS non disponible (navigateur)

export interface NearestJobsite {
  projectId: string
  name: string
  distance: number   // Distance en mètres
}

export interface GeofenceResult {
  status: GeofenceStatus
  distance: number | null         // Distance au chantier le plus proche (null si inconnue)
  nearestJobsite: NearestJobsite | null  // Chantier le plus proche
  activeJobsiteCount: number      // Nombre de chantiers ouverts avec GPS
  radius: number                  // Rayon configuré en mètres
  canPunchIn: boolean             // true = autorisé à puncher
  isChecking: boolean             // true = en cours de vérification
  errorMessage: string | null     // Message d'erreur lisible
  refresh: () => void             // Forcer une nouvelle vérification
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

function parseLatLng(latLng: string): { lat: number; lng: number } | null {
  const parts = latLng.split(',')
  if (parts.length !== 2) return null
  const lat = parseFloat(parts[0].trim())
  const lng = parseFloat(parts[1].trim())
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🪝 HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function useGeofencing(): GeofenceResult {
  const { company } = useCompanyStore()
  const { geofencingEnabled, geofencingRadius } = company
  const { getActiveJobsites } = useProjectStore()

  const [status, setStatus]               = useState<GeofenceStatus>('checking')
  const [distance, setDistance]           = useState<number | null>(null)
  const [nearestJobsite, setNearestJobsite] = useState<NearestJobsite | null>(null)
  const [trigger, setTrigger]             = useState(0)

  const refresh = useCallback(() => setTrigger(t => t + 1), [])

  // Récupère les chantiers actifs avec coordonnées GPS valides
  const activeJobsites = getActiveJobsites()

  useEffect(() => {
    // ── Géofencing désactivé par l'admin ─────────────────────────────────
    if (!geofencingEnabled) {
      setStatus('disabled')
      setDistance(null)
      setNearestJobsite(null)
      return
    }

    // ── Aucun projet ouvert avec coordonnées GPS ──────────────────────────
    if (activeJobsites.length === 0) {
      setStatus('no_jobsite')
      setDistance(null)
      setNearestJobsite(null)
      return
    }

    // ── Pas de GPS disponible dans le navigateur ──────────────────────────
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('gps_unavailable')
      setDistance(null)
      setNearestJobsite(null)
      return
    }

    // ── Vérification GPS ──────────────────────────────────────────────────
    setStatus('checking')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Calculer distance vers chaque chantier actif
        let nearest: NearestJobsite | null = null
        let minDistance = Infinity

        for (const jobsite of activeJobsites) {
          const coords = parseLatLng(jobsite.latLng)
          if (!coords) continue

          const dist = haversineDistance(latitude, longitude, coords.lat, coords.lng)

          if (dist < minDistance) {
            minDistance = dist
            nearest = {
              projectId: jobsite.projectId,
              name: jobsite.name,
              distance: Math.round(dist),
            }
          }
        }

        setNearestJobsite(nearest)
        setDistance(nearest ? Math.round(minDistance) : null)

        // ✅ Autorisé si dans le rayon d'AU MOINS UN chantier
        if (nearest && minDistance <= geofencingRadius) {
          setStatus('granted')
        } else {
          setStatus('denied')
        }
      },
      (error) => {
        console.warn('Geofencing GPS error:', error.message)
        setStatus('gps_error')
        setDistance(null)
        setNearestJobsite(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache 30 secondes
      }
    )
  }, [geofencingEnabled, geofencingRadius, activeJobsites.length, trigger])

  // ── Valeurs dérivées ──────────────────────────────────────────────────────
  const canPunchIn =
    status === 'disabled' ||        // Géofencing off → toujours autorisé
    status === 'no_jobsite' ||      // Aucun chantier configuré → autorisé
    status === 'gps_unavailable' || // Pas de GPS → autorisé (fail-safe)
    status === 'gps_error' ||       // Erreur GPS → autorisé (fail-safe)
    status === 'granted'            // Dans le rayon ✅

  const isChecking = status === 'checking'

  const errorMessage: string | null = (() => {
    if (status === 'denied' && nearestJobsite) {
      return `Trop loin de "${nearestJobsite.name}" — ${nearestJobsite.distance}m (max ${geofencingRadius}m)`
    }
    if (status === 'denied') {
      return `Hors zone — tous les chantiers sont hors du rayon de ${geofencingRadius}m`
    }
    if (status === 'gps_error') {
      return 'Permission GPS refusée — autorisez la localisation'
    }
    return null
  })()

  return {
    status,
    distance,
    nearestJobsite,
    activeJobsiteCount: activeJobsites.length,
    radius: geofencingRadius,
    canPunchIn,
    isChecking,
    errorMessage,
    refresh,
  }
}

