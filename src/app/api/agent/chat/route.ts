import type { NextRequest } from 'next/server'

type ConversationMessage = {
  role: 'user' | 'assistant'
  content: string
}

type UserContext = {
  role: 'employee' | 'admin'
  name?: string
  page?: string
}

const SYSTEM_PROMPT = `Tu es l'agent IA de Gestion Chantier Pro, l'application de gestion de chantier pour Hailite Xteriors.

Tu aides les employés terrain et les administrateurs avec :
- Punch in/out : suivi du temps, chronomètre, modes de travail (à l'heure, au pied carré, à la job)
- Paie et salaires : calcul des heures, des revenus, des retenues, employés salariés vs sous-contractants
- Chantiers et projets : planification, suivi de l'avancement, problèmes techniques sur le terrain
- Matériaux : listes détaillées, prix estimés, quantités nécessaires, fournisseurs, options alternatives
- Ingénierie de construction : solutions techniques, codes du bâtiment, résolution de problèmes de chantier
- Facturation et comptabilité : invoices, gestion clients, suivi des paiements
- Catalogue : produits et services de la compagnie
- Motivation d'équipe : objectifs, challenges, récompenses

Réponds toujours en français, de façon claire et pratique.
Si un employé terrain pose une question, adapte ta réponse pour quelqu'un sur le chantier — court, direct, actionnable.
Si c'est un administrateur, donne des réponses plus détaillées côté gestion et comptabilité.
Pour les questions de matériaux ou d'ingénierie, donne des listes précises avec des chiffres concrets.`

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY non configurée. Ajoutez-la dans Vercel → Settings → Environment Variables.' },
      { status: 500 }
    )
  }

  let body: { message: string; history?: ConversationMessage[]; userContext?: UserContext }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { message, history = [], userContext } = body

  if (!message?.trim()) {
    return Response.json({ error: 'Message vide' }, { status: 400 })
  }

  // Append user context to system prompt
  let system = SYSTEM_PROMPT
  if (userContext) {
    const label = userContext.role === 'admin' ? 'Administrateur' : 'Employé terrain'
    system += `\n\nUtilisateur actuel : ${label}${userContext.name ? ` — ${userContext.name}` : ''}${userContext.page ? ` (page: ${userContext.page})` : ''}.`
  }

  // Build messages: keep last 20 turns to avoid token limits
  const messages: ConversationMessage[] = [
    ...history.slice(-20),
    { role: 'user', content: message.trim() },
  ]

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        stream: true,
        system,
        messages,
      }),
    })

    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => 'Erreur Anthropic')
      return Response.json({ error: err }, { status: res.status || 500 })
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
