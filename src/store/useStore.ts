import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Project, Task, TaskStatus, TimeEntry, Reminder } from '../types'

const PROJECT_COLORS = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948']

function seedData(): { projects: Project[]; tasks: Task[] } {
  const now = new Date().toISOString()
  const projectId = uuid()
  return {
    projects: [
      { id: projectId, name: 'Внедрение Bitrix24', color: PROJECT_COLORS[0], createdAt: now, archived: false },
    ],
    tasks: [
      {
        id: uuid(),
        projectId,
        title: 'Настроить воронку продаж',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: null,
        createdAt: now,
        completedAt: null,
      },
    ],
  }
}

interface RunningTimer {
  taskId: string
  entryId: string
  startedAt: string
}

interface State {
  projects: Project[]
  tasks: Task[]
  timeEntries: TimeEntry[]
  reminders: Reminder[]
  runningTimer: RunningTimer | null

  addProject: (name: string, color?: string) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  archiveProject: (id: string) => void
  deleteProject: (id: string) => void

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  moveTask: (id: string, status: TaskStatus) => void
  deleteTask: (id: string) => void

  startTimer: (taskId: string) => void
  stopTimer: () => void
  addManualTimeEntry: (taskId: string, minutes: number, note: string, startedAt: string) => void
  deleteTimeEntry: (id: string) => void

  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'done'>) => void
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void

  exportData: () => string
  importData: (json: string) => void
  resetData: () => void
}

const seed = seedData()

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      projects: seed.projects,
      tasks: seed.tasks,
      timeEntries: [],
      reminders: [],
      runningTimer: null,

      addProject: (name, color) => {
        const id = uuid()
        const project: Project = {
          id,
          name,
          color: color ?? PROJECT_COLORS[get().projects.length % PROJECT_COLORS.length],
          createdAt: new Date().toISOString(),
          archived: false,
        }
        set((s) => ({ projects: [...s.projects, project] }))
        return id
      },
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      archiveProject: (id) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, archived: true } : p)) })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
        })),

      addTask: (task) => {
        const id = uuid()
        const newTask: Task = { ...task, id, createdAt: new Date().toISOString(), completedAt: null }
        set((s) => ({ tasks: [...s.tasks, newTask] }))
        return id
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      moveTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : null }
              : t
          ),
        })),
      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          timeEntries: s.timeEntries.filter((e) => e.taskId !== id),
          reminders: s.reminders.filter((r) => r.taskId !== id),
        })),

      startTimer: (taskId) => {
        const running = get().runningTimer
        if (running) get().stopTimer()
        const entryId = uuid()
        const startedAt = new Date().toISOString()
        set((s) => ({
          runningTimer: { taskId, entryId, startedAt },
          timeEntries: [...s.timeEntries, { id: entryId, taskId, startedAt, endedAt: null, minutes: 0, note: '' }],
        }))
      },
      stopTimer: () => {
        const running = get().runningTimer
        if (!running) return
        const endedAt = new Date().toISOString()
        const minutes = Math.max(1, Math.round((Date.parse(endedAt) - Date.parse(running.startedAt)) / 60000))
        set((s) => ({
          runningTimer: null,
          timeEntries: s.timeEntries.map((e) => (e.id === running.entryId ? { ...e, endedAt, minutes } : e)),
        }))
      },
      addManualTimeEntry: (taskId, minutes, note, startedAt) =>
        set((s) => ({
          timeEntries: [
            ...s.timeEntries,
            { id: uuid(), taskId, startedAt, endedAt: startedAt, minutes, note },
          ],
        })),
      deleteTimeEntry: (id) => set((s) => ({ timeEntries: s.timeEntries.filter((e) => e.id !== id) })),

      addReminder: (reminder) =>
        set((s) => ({
          reminders: [...s.reminders, { ...reminder, id: uuid(), createdAt: new Date().toISOString(), done: false }],
        })),
      toggleReminder: (id) =>
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      exportData: () => {
        const { projects, tasks, timeEntries, reminders } = get()
        return JSON.stringify({ projects, tasks, timeEntries, reminders }, null, 2)
      },
      importData: (json) => {
        const data = JSON.parse(json)
        set({
          projects: data.projects ?? [],
          tasks: data.tasks ?? [],
          timeEntries: data.timeEntries ?? [],
          reminders: data.reminders ?? [],
          runningTimer: null,
        })
      },
      resetData: () => set({ ...seedData(), timeEntries: [], reminders: [], runningTimer: null }),
    }),
    { name: 'pmhelping-storage' }
  )
)

export { PROJECT_COLORS }
