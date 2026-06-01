"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response || "(pas de réponse)" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Erreur de connexion. Vérifiez votre configuration." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function reset() {
    setMessages([]);
    setSessionId(null);
    setInput("");
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          background: "var(--primary, #a855f7)",
          color: "#fff",
        }}
        aria-label="Assistant IA"
        title="Assistant IA — Gestion Chantier Pro"
      >
        <Bot size={22} />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-end p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="flex flex-col w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "var(--card, #1a1a2e)",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              height: "min(600px, 90dvh)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--primary, #a855f7)" }}
                >
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text, #fff)" }}>
                    Assistant IA
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted, rgba(255,255,255,0.5))" }}>
                    Gestion Chantier Pro
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    className="text-xs px-2 py-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text, #fff)", background: "var(--border, rgba(255,255,255,0.1))" }}
                    title="Nouvelle conversation"
                  >
                    Nouveau
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text, #fff)" }}
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                  <MessageCircle size={32} style={{ color: "var(--primary, #a855f7)" }} />
                  <p className="text-sm text-center" style={{ color: "var(--text, #fff)" }}>
                    Posez une question sur vos chantiers,<br />employés, paie ou factures.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed"
                    style={
                      m.role === "user"
                        ? {
                            background: "var(--primary, #a855f7)",
                            color: "#fff",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: "var(--border, rgba(255,255,255,0.08))",
                            color: "var(--text, #fff)",
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-3 py-2 flex items-center gap-2"
                    style={{
                      background: "var(--border, rgba(255,255,255,0.08))",
                      borderBottomLeftRadius: 4,
                    }}
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{ color: "var(--primary, #a855f7)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted, rgba(255,255,255,0.5))" }}
                    >
                      En train de répondre…
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 flex-shrink-0 flex items-end gap-2"
              style={{ borderTop: "1px solid var(--border, rgba(255,255,255,0.1))" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Posez votre question… (Entrée pour envoyer)"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none disabled:opacity-50 max-h-28 overflow-y-auto"
                style={{
                  background: "var(--border, rgba(255,255,255,0.08))",
                  color: "var(--text, #fff)",
                  border: "1px solid var(--border, rgba(255,255,255,0.15))",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30"
                style={{ background: "var(--primary, #a855f7)", color: "#fff" }}
                aria-label="Envoyer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
