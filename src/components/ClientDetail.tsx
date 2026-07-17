import { useMemo, useState } from 'react'
import { Phone, Mail, User, Pencil, Plus, Trash2, PhoneCall, Users, StickyNote, Mail as MailIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { InteractionType } from '../types'
import { INTERACTION_LABELS } from '../types'
import { ClientModal } from './ClientModal'
import { formatDate, formatDateTime, minutesToHuman } from '../utils/date'
import { StatusBadge } from './Badge'

const INTERACTION_ICON: Record<InteractionType, typeof Phone> = {
  call: PhoneCall,
  meeting: Users,
  email: MailIcon,
  note: StickyNote,
}

export function ClientDetail({ clientId }: { clientId: string }) {
  const client = useStore((s) => s.clients.find((c) => c.id === clientId))
  const allProjects = useStore((s) => s.projects)
  const allTasks = useStore((s) => s.tasks)
  const timeEntries = useStore((s) => s.timeEntries)
  const allInteractions = useStore((s) => s.interactions)
  const addInteraction = useStore((s) => s.addInteraction)
  const deleteInteraction = useStore((s) => s.deleteInteraction)

  const projects = useMemo(() => allProjects.filter((p) => p.clientId === clientId), [allProjects, clientId])
  const interactions = useMemo(
    () => allInteractions.filter((i) => i.clientId === clientId),
    [allInteractions, clientId]
  )

  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<InteractionType>('call')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [summary, setSummary] = useState('')

  if (!client) return null

  const projectTaskStats = projects.map((p) => {
    const projectTasks = allTasks.filter((t) => t.projectId === p.id)
    const open = projectTasks.filter((t) => t.status !== 'done').length
    const taskIds = new Set(projectTasks.map((t) => t.id))
    const minutes = timeEntries.filter((e) => taskIds.has(e.taskId)).reduce((sum, e) => sum + e.minutes, 0)
    return { project: p, total: projectTasks.length, open, minutes }
  })

  const sortedInteractions = [...interactions].sort((a, b) => b.date.localeCompare(a.date))

  function handleAddInteraction() {
    if (!summary.trim()) return
    addInteraction({ clientId, type, date: new Date(date).toISOString(), summary: summary.trim() })
    setSummary('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{client.name}</h2>
              {client.status === 'archived' && <StatusBadge status="done" />}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {client.contactPerson && (
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  {client.contactPerson}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} />
                  {client.phone}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} />
                  {client.email}
                </span>
              )}
            </div>
            {client.notes && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {client.notes}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Pencil size={13} />
            Изменить
          </button>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <h3 className="mb-3 text-sm font-semibold">Проекты клиента</h3>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {projectTaskStats.map(({ project, total, open, minutes }) => (
              <div key={project.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: project.color }} />
                  {project.name}
                </span>
                <span className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>
                    {open}/{total} открыто
                  </span>
                  {minutes > 0 && <span>{minutesToHuman(minutes)}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">Новая запись в истории</h3>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Тип
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InteractionType)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            >
              {Object.entries(INTERACTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Когда
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Описание
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInteraction()}
              placeholder="О чём договорились"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>
          <button
            onClick={handleAddInteraction}
            disabled={!summary.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:brightness-95 disabled:opacity-40 disabled:hover:brightness-100"
            style={{ background: 'var(--series-1)' }}
          >
            <Plus size={15} />
            Добавить
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">История работы</h3>
        {sortedInteractions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Записей пока нет — добавьте первую встречу, звонок или заметку.
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {sortedInteractions.map((i) => {
              const Icon = INTERACTION_ICON[i.type]
              return (
                <div key={i.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'color-mix(in srgb, var(--series-1) 14%, transparent)', color: 'var(--series-1)' }}
                    >
                      <Icon size={13} />
                    </span>
                    <div>
                      <p className="text-sm">{i.summary}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {INTERACTION_LABELS[i.type]} · {formatDateTime(i.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteInteraction(i.id)}
                    className="rounded-md p-1 transition-colors hover:bg-[var(--hover-overlay)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Клиент с {formatDate(client.createdAt)}
      </p>

      {editing && <ClientModal client={client} onClose={() => setEditing(false)} />}
    </div>
  )
}
