import type { ReactNode } from 'react'

export function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'critical'
}) {
  const toneColor =
    tone === 'critical' ? 'var(--status-critical)' : tone === 'warning' ? 'var(--status-warning)' : 'var(--text-primary)'
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: 'var(--text-muted)' }} className="shrink-0">
            {icon}
          </span>
        )}
      </div>
      <div
        className="mt-2 text-3xl font-semibold"
        style={{ color: toneColor, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>
    </div>
  )
}
