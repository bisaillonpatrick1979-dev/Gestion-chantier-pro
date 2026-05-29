'use client'

type AdminEntityCardProps = {
  title: string
  subtitle?: string
  meta?: string
  status?: string
  children?: React.ReactNode
}

export default function AdminEntityCard({ title, subtitle, meta, status, children }: AdminEntityCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-white">{title}</h3>
          {subtitle && <p className="mt-1 truncate text-sm text-slate-300">{subtitle}</p>}
          {meta && <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{meta}</p>}
        </div>
        {status && (
          <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">
            {status}
          </span>
        )}
      </div>
      {children && <div className="mt-4 border-t border-white/10 pt-3 text-sm text-slate-300">{children}</div>}
    </article>
  )
}
