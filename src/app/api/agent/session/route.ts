import type { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.ANTHROPIC_AGENT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
  const vaultId = process.env.ANTHROPIC_VAULT_ID

  if (!apiKey || !agentId) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY et ANTHROPIC_AGENT_ID requis.' },
      { status: 500 }
    )
  }

  const res = await fetch('https://api.anthropic.com/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'managed-agents-2026-04-01',
    },
    body: JSON.stringify({
      environment_id: environmentId,
      agent: { type: 'agent', id: agentId },
      vault_ids: vaultId ? [vaultId] : [],
    }),
  })

  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: res.status })
  }

  const data = await res.json()
  return Response.json({ sessionId: data.id })
}
