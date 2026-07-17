import type { ReactNode } from 'react'

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && (
        <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-sm"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      <p className="mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {p.name ? `${p.name}: ` : ''}
          {p.value}
        </p>
      ))}
    </div>
  )
}
