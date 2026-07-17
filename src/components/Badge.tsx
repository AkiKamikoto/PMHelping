import type { TaskPriority, TaskStatus } from '../types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../types'

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--series-1)',
  high: 'var(--status-warning)',
  urgent: 'var(--status-critical)',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const color = PRIORITY_COLOR[priority]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'var(--text-muted)',
  in_progress: 'var(--series-1)',
  review: 'var(--series-4)',
  done: 'var(--status-good)',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const color = STATUS_COLOR[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
