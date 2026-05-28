'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { restoreAdminAccess, disableLocalLoginRequirements } from '@/lib/recovery'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export default function RecoveryPage() {
  const router = useRouter()
  const { employees } = useEmployeeStore()
  const admin = useMemo(() => employees.find((employee) => employee.role === 'admin'), [employees])
  const [newPin, setNewPin] = useState('')
  const [message, setMessage] = useState('')

  const pinReady = newPin.trim().length >= 4

  function restoreWithPin() {
    if (!pinReady) {
      setMessage('Entrez un nouveau PIN admin de 4 chiffres ou plus.')
      return
    }
    restoreAdminAccess(newPin)
    router.replace('/')
  }

  function continueAdminLocal() {
    restoreAdminAccess()
    router.replace('/')
  }

  function disableLocksOnly() {
    disableLocalLoginRequirements()
    setMessage('Verrouillage local temporairement désactivé. Vous pouvez revenir à l’application.')
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '18px 14px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={{ border: '1px solid rgba(245,158,11,.5)', background: 'rgba(245,158,11,.12)', borderRadius: 18, padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: '#f59e0b', letterSpacing: 1, textTransform: 'uppercase' }}>Mode récupération bêta</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>Accès admin de récupération</h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, opacity: .9, marginTop: 8 }}>
          Mode récupération bêta — à utiliser seulement par le propriétaire. Cette page restaure l’accès local sans supprimer les clients, employés, documents, projets, paie, catalogue, Supabase, company_id ou installation_id.
        </p>
      </section>

      <section style={card}>
        <h2 style={title}>1. Méthodes non activées pour la connexion</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <Notice text="QR code à venir / non activé pour la connexion" />
          <Notice text="Biométrie à venir via Passkey / Face ID / verrouillage appareil" />
        </div>
      </section>

      <section style={card}>
        <h2 style={title}>2. Nouveau PIN admin</h2>
        <p style={help}>Aucun ancien PIN n’est affiché. Entrez un nouveau PIN pour remettre l’admin en accès.</p>
        <input
          inputMode="numeric"
          type="password"
          value={newPin}
          onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 12))}
          placeholder="Nouveau PIN admin"
          style={input}
        />
        <button onClick={restoreWithPin} style={{ ...primaryButton, opacity: pinReady ? 1 : .55 }}>
          Forcer ce nouveau PIN admin
        </button>
      </section>

      <section style={card}>
        <h2 style={title}>3. Récupération rapide</h2>
        <p style={help}>Ces actions ne suppriment pas les stores de données. Elles enlèvent seulement l’état de verrouillage local et les méthodes obligatoires non fonctionnelles.</p>
        <button onClick={disableLocksOnly} style={secondaryButton}>Désactiver temporairement le verrouillage local</button>
        <button onClick={continueAdminLocal} style={secondaryButton}>
          {admin ? 'Continuer en admin local' : 'Créer un admin local et continuer'}
        </button>
        <button onClick={() => router.replace('/')} style={ghostButton}>Retour à l’application</button>
      </section>

      {message && <p style={{ border: '1px solid rgba(34,197,94,.4)', background: 'rgba(34,197,94,.12)', borderRadius: 12, padding: 12, color: '#22c55e', fontWeight: 800 }}>{message}</p>}
    </main>
  )
}

function Notice({ text }: { text: string }) {
  return <p style={{ border: '1px solid rgba(148,163,184,.25)', borderRadius: 12, padding: 10, fontSize: 13, opacity: .9 }}>ℹ️ {text}</p>
}

const card = {
  border: '1px solid rgba(148,163,184,.22)',
  background: 'rgba(15,23,42,.72)',
  borderRadius: 18,
  padding: 16,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}

const title = { fontSize: 17, fontWeight: 900 }
const help = { fontSize: 13, lineHeight: 1.45, opacity: .78 }
const input = { width: '100%', border: '1px solid rgba(148,163,184,.35)', borderRadius: 12, padding: '14px 12px', fontSize: 18, background: 'rgba(2,6,23,.65)', color: 'white', letterSpacing: 2 }
const primaryButton = { border: 'none', borderRadius: 12, padding: '14px 12px', background: '#f59e0b', color: '#111827', fontWeight: 900, minHeight: 48 }
const secondaryButton = { border: '1px solid rgba(148,163,184,.32)', borderRadius: 12, padding: '13px 12px', background: 'rgba(255,255,255,.06)', color: 'white', fontWeight: 850, minHeight: 48 }
const ghostButton = { border: 'none', borderRadius: 12, padding: '13px 12px', background: 'transparent', color: '#93c5fd', fontWeight: 850, minHeight: 48 }
