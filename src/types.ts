export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  name: string
  color: string
  createdAt: string
  archived: boolean
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate: string | null
  createdAt: string
  completedAt: string | null
}

export interface TimeEntry {
  id: string
  taskId: string
  startedAt: string
  endedAt: string | null
  minutes: number
  note: string
}

export interface Reminder {
  id: string
  taskId: string | null
  title: string
  remindAt: string
  done: boolean
  createdAt: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
}

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
}
