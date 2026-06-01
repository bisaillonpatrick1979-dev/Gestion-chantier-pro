'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'

type Role = 'user' | 'agent'

type Message = {
  id: string
  role: Role
  content: string
}

const WELCOME = 'Bonjour ! 👷 Je suis ton agent IA Chantier Pro.\n\nPose-moi n\'importe quelle question : paie, matériaux, chantier, prix, punch, comptabilité...'

function parseSSEChunk(chunk: string): string {
  let result = ''
  const lines = chunk.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6).trim()
    if (!data || data === '[DONE]') continue
    try {
      const event = JSON.parse(data) as Record<string, unknown>
      // Handle various Anthropic event shapes
      const type = event.type as string | undefined
      if (type === 'assistant' || type === 'text' || type === 'message') {
        result += (event.text ?? event.content ?? '') as string
      } else if (type === 'content_block_delta') {
        const delta = event.delta as Record<string, unknown> | undefined
        result += (delta?.text ?? '') as string
      } else if (typeof event.text === 'string') {
        result += event.text
      }
    } catch {
      // Plain text data (not JSON)
      if (data !== '[DONE]') result += data
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
  const [sessionId, setSessionId] = useState<string | null>(null)
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
    if (open) inputRef.current?.focus()
  }, [open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text }
    const agentMsgId = `a-${Date.now() + 1}`
    const agentMsg: Message = { id: agentMsgId, role: 'agent', content: '' }

    setMessages((prev) => [...prev, userMsg, agentMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          userContext: {
            role: currentEmployee ? 'employee' : 'admin',
            name: currentEmployee
              ? (currentEmployee as { name?: string }).name
              : 'Administrateur',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
        }),
      })

      const newSid = res.headers.get('X-Session-Id')
      if (newSid) setSessionId(newSid)

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => 'Erreur inconnue')
        setMessages((prev) =>
          prev.map((m) => (m.id === agentMsgId ? { ...m, content: `⚠️ ${err}` } : m))
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
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const block of lines) {
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

      // Flush remaining buffer
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
            ? { ...m, content: `⚠️ Erreur réseau: ${String(err)}` }
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
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer l\'agent IA' : 'Ouvrir l\'agent IA'}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-amber-500/40 transition-all hover:scale-110 active:scale-95 focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
          boxShadow: open
            ? '0 0 0 3px rgba(251,191,36,0.4), 0 8px 24px rgba(251,191,36,0.3)'
            : '0 4px 20px rgba(251,191,36,0.35)',
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
            background: 'rgba(15, 15, 25, 0.96)',
            boxShadow: '0 0 0 1px rgba(251,191,36,0.15), 0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(251,191,36,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center gap-3 rounded-t-3xl border-b border-amber-400/15 px-4 py-3"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(217,119,6,0.06) 100%)' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-amber-300 leading-none">Agent Chantier Pro</p>
              <p className="mt-0.5 text-xs text-slate-400 truncate">
                {currentEmployee
                  ? `Bonjour ${(currentEmployee as { name?: string }).name ?? 'employé'} 👋`
                  : 'Espace admin'}
              </p>
            </div>
            <div className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 px-4 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={
                    m.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(217,119,6,0.15))',
                          border: '1px solid rgba(251,191,36,0.25)',
                          color: '#fef3c7',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#e2e8f0',
                        }
                  }
                >
                  {m.content || (loading && m.role === 'agent' ? (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex flex-shrink-0 gap-2 rounded-b-3xl border-t border-white/[0.06] p-3">
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
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
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
