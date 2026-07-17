import { useMemo } from 'react'
import { ListTodo, AlertTriangle, CalendarClock, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { View } from '../App'
import { StatTile } from './StatTile'
import { PriorityBadge, StatusBadge } from './Badge'
import { formatDate, isOverdue, isDueSoon } from '../utils/date'

export function Dashboard({
  projectId,
  onNavigate,
}: {
  projectId: string | 'all'
  onNavigate: (view: View) => void
}) {
  const allTasks = useStore((s) => s.tasks)
  const tasks = useMemo(
    () => allTasks.filter((t) => projectId === 'all' || t.projectId === projectId),
    [allTasks, projectId]
  )
  const projects = useStore((s) => s.projects)

  const open = tasks.filter((t) => t.status !== 'done')
  const overdue = open.filter((t) => isOverdue(t.dueDate, t.status))
  const dueSoon = open.filter((t) => isDueSoon(t.dueDate, t.status) && !isOverdue(t.dueDate, t.status))
  const inProgress = tasks.filter((t) => t.status === 'in_progress')

  const upcoming = [...overdue, ...dueSoon]
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button
          onClick={() => onNavigate('board')}
          className="w-full rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--series-1)]"
        >
          <StatTile label="Открытые задачи" value={open.length} icon={<ListTodo size={18} />} />
        </button>
        <button
          onClick={() => onNavigate('board')}
          className="w-full rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--series-1)]"
        >
          <StatTile label="Просрочено" value={overdue.length} icon={<AlertTriangle size={18} />} tone={overdue.length > 0 ? 'critical' : 'default'} />
        </button>
        <button
          onClick={() => onNavigate('board')}
          className="w-full rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--series-1)]"
        >
          <StatTile label="Дедлайн на неделе" value={dueSoon.length} icon={<CalendarClock size={18} />} tone={dueSoon.length > 0 ? 'warning' : 'default'} />
        </button>
        <button
          onClick={() => onNavigate('board')}
          className="w-full rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--series-1)]"
        >
          <StatTile label="В работе" value={inProgress.length} icon={<Loader2 size={18} />} />
        </button>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">Требуют внимания</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Нет просроченных задач и дедлайнов на ближайшую неделю. Отлично!
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {upcoming.map((task) => {
              const project = projects.find((p) => p.id === task.projectId)
              const late = isOverdue(task.dueDate, task.status)
              return (
                <button
                  key={task.id}
                  onClick={() => onNavigate('board')}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[var(--hover-overlay)]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {project && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project.color }} />}
                    <span className="truncate text-sm">{task.title}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <span
                    className="shrink-0 text-xs font-medium"
                    style={{ color: late ? 'var(--status-critical)' : 'var(--status-warning)' }}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">В работе сейчас</h3>
        {inProgress.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Нет задач в статусе «В работе».
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {inProgress.map((task) => (
              <button
                key={task.id}
                onClick={() => onNavigate('board')}
                className="flex items-center justify-between gap-3 py-2.5 text-left"
              >
                <span className="truncate text-sm">{task.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {task.assignee && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {task.assignee}
                    </span>
                  )}
                  <StatusBadge status={task.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
