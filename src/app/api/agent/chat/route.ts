import type { NextRequest } from 'next/server'

const ANTHROPIC_API = 'https://api.anthropic.com'

function headers(apiKey: string, json = true) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'managed-agents-2026-04-01',
  }
}

type UserContext = {
  role: 'employee' | 'admin'
  name?: string
  page?: string
}

async function createSession(apiKey: string, agentId: string, environmentId?: string, vaultId?: string) {
  const res = await fetch(`${ANTHROPIC_API}/v1/sessions`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      environment_id: environmentId,
      agent: { type: 'agent', id: agentId },
      vault_ids: vaultId ? [vaultId] : [],
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.id as string
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.ANTHROPIC_AGENT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
  const vaultId = process.env.ANTHROPIC_VAULT_ID

  if (!apiKey || !agentId) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY et ANTHROPIC_AGENT_ID requis dans Vercel → Environment Variables.' },
      { status: 500 }
    )
  }

  let body: { message: string; sessionId?: string; userContext?: UserContext }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { message, sessionId, userContext } = body
  if (!message?.trim()) return Response.json({ error: 'Message vide' }, { status: 400 })

  try {
    // Crée une session si on n'en a pas
    let sid = sessionId
    if (!sid) {
      sid = await createSession(apiKey, agentId, environmentId, vaultId)
    }

    // Préfixe de contexte utilisateur
    const ctx = userContext
      ? `[${userContext.role === 'admin' ? 'Admin' : 'Employé'}${userContext.name ? ` — ${userContext.name}` : ''}${userContext.page ? ` — ${userContext.page}` : ''}]\n`
      : ''

    // Envoie le message à l'agent
    const evtRes = await fetch(`${ANTHROPIC_API}/v1/sessions/${sid}/events`, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({ events: [{ type: 'user', text: ctx + message.trim() }] }),
    })
    if (!evtRes.ok) {
      const err = await evtRes.text()
      return Response.json({ error: `Envoi: ${err}` }, { status: evtRes.status })
    }

    // Ouvre le flux SSE et le proxie au client
    const stream = await fetch(`${ANTHROPIC_API}/v1/sessions/${sid}/events/stream`, {
      headers: { ...headers(apiKey, false), Accept: 'text/event-stream' },
    })
    if (!stream.ok || !stream.body) {
      const err = await stream.text().catch(() => 'stream indisponible')
      return Response.json({ error: err, sessionId: sid }, { status: stream.status || 500 })
    }

    return new Response(stream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Session-Id': sid,
      },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
