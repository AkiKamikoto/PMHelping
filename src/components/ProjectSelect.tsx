import { useMemo } from 'react'
import { useStore } from '../store/useStore'

export function ProjectSelect({
  value,
  onChange,
}: {
  value: string | 'all'
  onChange: (id: string | 'all') => void
}) {
  const projects = useStore((s) => s.projects)
  const clients = useStore((s) => s.clients)

  const groups = useMemo(() => {
    const active = projects.filter((p) => !p.archived)
    const byClient = new Map<string, typeof active>()
    const unassigned: typeof active = []
    for (const p of active) {
      if (!p.clientId) {
        unassigned.push(p)
        continue
      }
      const list = byClient.get(p.clientId) ?? []
      list.push(p)
      byClient.set(p.clientId, list)
    }
    const clientGroups = [...byClient.entries()]
      .map(([clientId, list]) => ({
        label: clients.find((c) => c.id === clientId)?.name ?? 'Клиент',
        projects: list,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
    return { clientGroups, unassigned }
  }, [projects, clients])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg px-3 py-1.5 text-sm"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      <option value="all">Все проекты</option>
      {groups.clientGroups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </optgroup>
      ))}
      {groups.unassigned.length > 0 && (
        <optgroup label="Без клиента">
          {groups.unassigned.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}
