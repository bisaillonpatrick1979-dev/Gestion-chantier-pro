// public/sw.js
// Service Worker — Gestion Chantier Pro
const CACHE = 'gcp-v3-payroll-2026'
const STATIC = [
  '/',
  '/stats',
  '/documents',
  '/clients',
  '/settings',
  '/paye',
  '/payroll-compliance',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  )
})

// ── Activate — nettoie les vieux caches ───────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Bypass — cross-origin, non-GET, API externes
  if (!e.request.url.startsWith(self.location.origin)) return
  if (e.request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('supabase.co')
  ) return

  // Assets statiques (_next/static, icônes) — Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    e.request.destination === 'image' ||
    e.request.destination === 'font'
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Pages — Network first pour mieux recevoir les mises à jour, fallback cache offline
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && res.status === 200) {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match('/')))
  )
})

// ── Push Notifications (prêt pour Supabase) ───────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title || 'Chantier Pro', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  if (e.notification.data?.url) {
    e.waitUntil(clients.openWindow(e.notification.data.url))
  }
})
