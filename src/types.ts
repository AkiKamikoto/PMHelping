export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ProjectStage = 'planning' | 'active' | 'on_hold' | 'completed'

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  planning: 'Планирование',
  active: 'Активный',
  on_hold: 'На паузе',
  completed: 'Завершён',
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  clientId: string | null
  stage: ProjectStage
  startDate: string | null
  deadline: string | null
  budget: number | null
  createdAt: string
  archived: boolean
}

export type ClientStatus = 'active' | 'archived'

export interface Client {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  website: string
  messenger: string
  address: string
  inn: string
  industry: string
  source: string
  notes: string
  status: ClientStatus
  createdAt: string
}

export type InteractionType = 'call' | 'meeting' | 'email' | 'note'

export interface Interaction {
  id: string
  clientId: string
  type: InteractionType
  date: string
  summary: string
  createdAt: string
}

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  call: 'Звонок',
  meeting: 'Встреча',
  email: 'Письмо',
  note: 'Заметка',
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
