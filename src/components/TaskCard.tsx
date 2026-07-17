import { Clock, CalendarClock } from 'lucide-react'
import type { Task } from '../types'
import { useStore } from '../store/useStore'
import { PriorityBadge } from './Badge'
import { formatDate, isOverdue, isDueSoon, minutesToHuman } from '../utils/date'

export function TaskCard({
  task,
  onClick,
  showProject,
}: {
  task: Task
  onClick: () => void
  showProject: boolean
}) {
  const project = useStore((s) => s.projects.find((p) => p.id === task.projectId))
  const totalMinutes = useStore((s) =>
    s.timeEntries.filter((e) => e.taskId === task.id).reduce((sum, e) => sum + e.minutes, 0)
  )
  const overdue = isOverdue(task.dueDate, task.status)
  const dueSoon = isDueSoon(task.dueDate, task.status)

  return (
    <button
      onClick={onClick}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
      className="flex w-full flex-col gap-2 rounded-lg p-3 text-left transition-shadow hover:shadow-[0_0_0_1px_var(--series-1)]"
      style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
    >
      {showProject && project && (
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="h-2 w-2 rounded-full" style={{ background: project.color }} />
          {project.name}
        </span>
      )}
      <span className="text-sm font-medium">{task.title}</span>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.assignee && (
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'var(--surface-1)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            {task.assignee}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        {task.dueDate ? (
          <span
            className="flex items-center gap-1"
            style={{ color: overdue ? 'var(--status-critical)' : dueSoon ? 'var(--status-warning)' : 'var(--text-muted)' }}
          >
            <CalendarClock size={12} />
            {formatDate(task.dueDate)}
          </span>
        ) : (
          <span />
        )}
        {totalMinutes > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {minutesToHuman(totalMinutes)}
          </span>
        )}
      </div>
    </button>
  )
}
