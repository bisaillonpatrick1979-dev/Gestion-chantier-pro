import type { NextRequest } from 'next/server'

const ANTHROPIC_API = 'https://api.anthropic.com'
const BETA_HEADER = 'managed-agents-2026-04-01'

function baseHeaders(apiKey: string, contentType = true) {
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': BETA_HEADER,
  }
}

type UserContext = {
  role: 'employee' | 'admin'
  name?: string
  page?: string
}

async function createSession(apiKey: string, agentId: string, environmentId?: string, vaultId?: string): Promise<string> {
  const res = await fetch(`${ANTHROPIC_API}/v1/sessions`, {
    method: 'POST',
    headers: baseHeaders(apiKey),
    body: JSON.stringify({
      environment_id: environmentId,
      agent: { type: 'agent', id: agentId },
      vault_ids: vaultId ? [vaultId] : [],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Session: ${err}`)
  }
  const data = await res.json()
  return data.id
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.ANTHROPIC_AGENT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
  const vaultId = process.env.ANTHROPIC_VAULT_ID

  if (!apiKey || !agentId) {
    return Response.json(
      { error: 'Agent IA non configuré. Ajoutez ANTHROPIC_API_KEY et ANTHROPIC_AGENT_ID dans Vercel.' },
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

  if (!message?.trim()) {
    return Response.json({ error: 'Message vide' }, { status: 400 })
  }

  try {
    // Reuse or create session
    let activeSessionId = sessionId
    if (!activeSessionId) {
      activeSessionId = await createSession(apiKey, agentId, environmentId, vaultId)
    }

    // Build context-aware message
    const parts: string[] = []
    if (userContext) {
      const roleLabel = userContext.role === 'admin' ? 'Administrateur' : 'Employé terrain'
      parts.push(`[Contexte: ${roleLabel}${userContext.name ? ` — ${userContext.name}` : ''}${userContext.page ? ` — page: ${userContext.page}` : ''}]`)
    }
    parts.push(message.trim())
    const fullMessage = parts.join('\n')

    // Send user event to session
    const eventsRes = await fetch(`${ANTHROPIC_API}/v1/sessions/${activeSessionId}/events`, {
      method: 'POST',
      headers: baseHeaders(apiKey),
      body: JSON.stringify({
        events: [{ type: 'user', text: fullMessage }],
      }),
    })

    if (!eventsRes.ok) {
      const err = await eventsRes.text()
      return Response.json({ error: `Envoi message: ${err}` }, { status: eventsRes.status })
    }

    // Open SSE stream from Anthropic and proxy it back to client
    const streamRes = await fetch(`${ANTHROPIC_API}/v1/sessions/${activeSessionId}/events/stream`, {
      headers: {
        ...baseHeaders(apiKey, false),
        Accept: 'text/event-stream',
      },
    })

    if (!streamRes.ok || !streamRes.body) {
      const err = await streamRes.text().catch(() => 'stream unavailable')
      return Response.json(
        { error: `Flux SSE: ${err}`, sessionId: activeSessionId },
        { status: streamRes.status || 500 }
      )
    }

    return new Response(streamRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Session-Id': activeSessionId,
      },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
