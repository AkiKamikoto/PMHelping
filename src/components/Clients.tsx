import { useMemo, useState } from 'react'
import { Search, UserPlus, Building2, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ClientModal } from './ClientModal'
import { ClientDetail } from './ClientDetail'

export function Clients() {
  const clients = useStore((s) => s.clients)
  const projects = useStore((s) => s.projects)
  const interactions = useStore((s) => s.interactions)

  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients
      .filter((c) => (showArchived ? true : c.status === 'active'))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  }, [clients, query, showArchived])

  const activeId = selectedId && clients.some((c) => c.id === selectedId) ? selectedId : (filtered[0]?.id ?? null)

  if (clients.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-xl p-10 text-center"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <Building2 size={28} style={{ color: 'var(--text-muted)' }} />
        <div>
          <p className="font-medium">Пока нет ни одного клиента</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Добавьте компанию клиента, чтобы вести историю работы с ней.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:brightness-95"
          style={{ background: 'var(--series-1)' }}
        >
          <UserPlus size={16} />
          Добавить клиента
        </button>
        {creating && (
          <ClientModal
            client={null}
            onClose={(createdId) => {
              setCreating(false)
              if (createdId) setSelectedId(createdId)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск клиента…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex shrink-0 items-center justify-center rounded-lg p-2 text-white transition hover:brightness-110 active:brightness-95"
            style={{ background: 'var(--series-1)' }}
            title="Добавить клиента"
          >
            <UserPlus size={16} />
          </button>
        </div>

        <button
          onClick={() => setShowArchived((v) => !v)}
          className="flex items-center gap-1.5 self-start text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: showArchived ? 'var(--series-1)' : 'var(--text-muted)' }}
        >
          <Archive size={12} />
          {showArchived ? 'Скрыть архивных' : 'Показать архивных'}
        </button>

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 && (
            <p className="px-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Ничего не найдено.
            </p>
          )}
          {filtered.map((c) => {
            const projectCount = projects.filter((p) => p.clientId === c.id && !p.archived).length
            const lastInteraction = interactions
              .filter((i) => i.clientId === c.id)
              .sort((a, b) => b.date.localeCompare(a.date))[0]
            const selected = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="flex flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-shadow hover:shadow-[0_0_0_1px_var(--series-1)]"
                style={{
                  background: selected ? 'color-mix(in srgb, var(--series-1) 12%, var(--surface-1))' : 'var(--surface-1)',
                  border: selected ? '1px solid var(--series-1)' : '1px solid var(--border)',
                  opacity: c.status === 'archived' ? 0.6 : 1,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  {projectCount > 0 && (
                    <span
                      className="shrink-0 rounded-full px-1.5 text-xs"
                      style={{ background: 'var(--page-plane)', color: 'var(--text-muted)' }}
                    >
                      {projectCount}
                    </span>
                  )}
                </div>
                {c.contactPerson && (
                  <span className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.contactPerson}
                  </span>
                )}
                {lastInteraction && (
                  <span className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    Последний контакт: {new Date(lastInteraction.date).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeId ? (
          <ClientDetail clientId={activeId} />
        ) : (
          <div
            className="flex h-full items-center justify-center rounded-xl p-10 text-sm"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Выберите клиента слева
          </div>
        )}
      </div>

      {creating && (
        <ClientModal
          client={null}
          onClose={(createdId) => {
            setCreating(false)
            if (createdId) setSelectedId(createdId)
          }}
        />
      )}
    </div>
  )
}
