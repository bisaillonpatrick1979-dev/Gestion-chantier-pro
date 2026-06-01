'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'

type Role = 'user' | 'agent'

type Message = {
  id: string
  role: Role
  content: string
}

type ApiMessage = {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME = 'Bonjour ! 👷 Je suis l\'agent IA de Chantier Pro.\n\nPose-moi n\'importe quelle question : paie, matériaux, chantier, prix, punch, facturation...'

// Parse the standard Anthropic streaming SSE format (content_block_delta events)
function parseSSEChunk(chunk: string): string {
  let result = ''
  const lines = chunk.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const event = JSON.parse(data) as Record<string, unknown>
      if (event.type === 'content_block_delta') {
        const delta = event.delta as Record<string, unknown> | undefined
        if (delta?.type === 'text_delta') {
          result += (delta.text ?? '') as string
        }
      }
    } catch {
      // skip non-JSON lines (event: lines, pings, etc.)
    }
  }
  return result
}

export default function AgentChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'agent', content: WELCOME },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) scrollBottom()
  }, [messages, open, scrollBottom])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Build API history from displayed messages (excluding welcome, converting roles)
  function buildHistory(): ApiMessage[] {
    return messages
      .filter((m) => m.id !== 'welcome' && m.content.trim())
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsgId = `u-${Date.now()}`
    const agentMsgId = `a-${Date.now() + 1}`

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: agentMsgId, role: 'agent', content: '' },
    ])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: buildHistory(),
          userContext: {
            role: currentEmployee ? 'employee' : 'admin',
            name: (currentEmployee as { name?: string } | undefined)?.name ?? 'Administrateur',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
        }),
      })

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => 'Erreur inconnue')
        let detail = err
        try {
          const parsed = JSON.parse(err) as { error?: string }
          detail = parsed.error ?? err
        } catch { /* keep raw */ }
        setMessages((prev) =>
          prev.map((m) => (m.id === agentMsgId ? { ...m, content: `⚠️ ${detail}` } : m))
        )
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() ?? ''

        for (const block of blocks) {
          const text = parseSSEChunk(block)
          if (text) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId ? { ...m, content: m.content + text } : m
              )
            )
          }
        }
      }

      // Flush remainder
      if (buffer) {
        const text = parseSSEChunk(buffer)
        if (text) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId ? { ...m, content: m.content + text } : m
            )
          )
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsgId
            ? { ...m, content: `⚠️ Erreur réseau : ${String(err)}` }
            : m
        )
      )
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer l'agent IA" : "Ouvrir l'agent IA"}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
          boxShadow: open
            ? '0 0 0 3px rgba(251,191,36,0.4), 0 8px 24px rgba(251,191,36,0.35)'
            : '0 4px 20px rgba(251,191,36,0.4)',
        }}
      >
        <span className="text-2xl select-none">{open ? '✕' : '✨'}</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-3xl border border-amber-400/20 backdrop-blur-xl"
          style={{
            bottom: '6rem',
            right: '1rem',
            width: 'min(360px, calc(100vw - 2rem))',
            height: 'min(540px, calc(100vh - 12rem))',
            background: 'rgba(12, 12, 22, 0.97)',
            boxShadow:
              '0 0 0 1px rgba(251,191,36,0.15), 0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(251,191,36,0.08)',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-shrink-0 items-center gap-3 rounded-t-3xl border-b border-amber-400/15 px-4 py-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(251,191,36,0.13) 0%, rgba(217,119,6,0.06) 100%)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black leading-none text-amber-300">Agent Chantier Pro</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {currentEmployee
                  ? `Bonjour ${(currentEmployee as { name?: string }).name ?? 'employé'} 👋`
                  : 'Espace administrateur'}
              </p>
            </div>
            {/* Online dot */}
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={
                    m.role === 'user'
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(217,119,6,0.15))',
                          border: '1px solid rgba(251,191,36,0.28)',
                          color: '#fef3c7',
                        }
                      : {
                          background: 'rgba(255,255,255,0.055)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          color: '#e2e8f0',
                        }
                  }
                >
                  {m.content ||
                    (loading && m.role === 'agent' ? (
                      <span className="flex items-center gap-1 py-0.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </span>
                    ) : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex flex-shrink-0 gap-2 rounded-b-3xl border-t border-white/[0.07] p-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pose ta question… (Entrée pour envoyer)"
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.065)',
                border: '1px solid rgba(255,255,255,0.11)',
                maxHeight: '80px',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 rounded-xl px-4 text-sm font-black text-black transition-all disabled:opacity-40 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
