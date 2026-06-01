import type { NextRequest } from 'next/server'

const ANTHROPIC_API = 'https://api.anthropic.com'
const BETA_HEADER = 'managed-agents-2026-04-01'

function anthropicHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': BETA_HEADER,
  }
}

export async function POST(_request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.ANTHROPIC_AGENT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
  const vaultId = process.env.ANTHROPIC_VAULT_ID

  if (!apiKey || !agentId) {
    return Response.json(
      { error: 'Agent IA non configuré. Ajoutez ANTHROPIC_API_KEY et ANTHROPIC_AGENT_ID dans vos variables Vercel.' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${ANTHROPIC_API}/v1/sessions`, {
      method: 'POST',
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify({
        environment_id: environmentId,
        agent: { type: 'agent', id: agentId },
        vault_ids: vaultId ? [vaultId] : [],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `Anthropic: ${err}` }, { status: res.status })
    }

    const session = await res.json()
    return Response.json({ sessionId: session.id })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
