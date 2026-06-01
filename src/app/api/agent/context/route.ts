import { NextRequest, NextResponse } from 'next/server'
import { fetchAgentContext } from '@/lib/agentContext'

/**
 * GET /api/agent/context
 * Returns live Supabase context for the AI agent.
 * Protected by AGENT_CONTEXT_SECRET env var.
 * Can be used as an MCP tool endpoint for Anthropic Managed Agents.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.AGENT_CONTEXT_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'AGENT_CONTEXT_SECRET not configured. Set this env var to enable public access to context data.' },
      { status: 503 }
    )
  }

  const provided =
    request.headers.get('x-api-key') ??
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ctx = await fetchAgentContext()
    return NextResponse.json(ctx)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
