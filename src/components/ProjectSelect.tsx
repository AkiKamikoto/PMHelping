import { useStore } from '../store/useStore'

export function ProjectSelect({
  value,
  onChange,
}: {
  value: string | 'all'
  onChange: (id: string | 'all') => void
}) {
  const projects = useStore((s) => s.projects)

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg px-3 py-1.5 text-sm"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      <option value="all">Все проекты</option>
      {projects
        .filter((p) => !p.archived)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
    </select>
  )
}
