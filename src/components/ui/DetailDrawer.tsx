'use client'

import { useEffect } from 'react'

type DetailDrawerProps = {
  open: boolean
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}

export default function DetailDrawer({ open, title, subtitle, children, onClose, footer }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-slate-950 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Détail</p>
              <h2 className="mt-1 truncate text-2xl font-black">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 font-black text-white">
              Fermer
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <footer className="border-t border-white/10 bg-slate-950 p-4">{footer}</footer>}
      </aside>
    </div>
  )
}
