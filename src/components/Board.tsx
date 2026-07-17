import { useState } from 'react'
import { Plus, FolderPlus, Pencil, CalendarClock } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Project, Task, TaskStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER, PROJECT_STAGE_LABELS } from '../types'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { ProjectModal } from './ProjectModal'
import { formatDate } from '../utils/date'

export function Board({
  projectId,
  onOpenClient,
}: {
  projectId: string | 'all'
  onOpenClient?: (clientId: string) => void
}) {
  const projects = useStore((s) => s.projects)
  const clients = useStore((s) => s.clients)
  const tasks = useStore((s) => s.tasks)
  const moveTask = useStore((s) => s.moveTask)

  const [editingTask, setEditingTask] = useState<Task | null | 'new'>(null)
  const [editingProject, setEditingProject] = useState<Project | null | 'new'>(null)
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)

  const activeProjects = projects.filter((p) => !p.archived)
  const filteredTasks = tasks.filter((t) => projectId === 'all' || t.projectId === projectId)

  const defaultProjectId = projectId !== 'all' ? projectId : activeProjects[0]?.id

  if (activeProjects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl p-10 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Пока нет ни одного проекта.</p>
        <button
          onClick={() => setEditingProject('new')}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:brightness-95"
          style={{ background: 'var(--series-1)' }}
        >
          <FolderPlus size={16} />
          Создать проект
        </button>
        {editingProject !== null && (
          <ProjectModal project={editingProject === 'new' ? null : editingProject} onClose={() => setEditingProject(null)} />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {activeProjects.map((p) => {
            const client = clients.find((c) => c.id === p.clientId)
            const overdue = p.deadline && p.stage !== 'completed' && Date.parse(p.deadline) < Date.now()
            return (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-full px-1 py-1 text-xs"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <button
                  onClick={() => setEditingProject(p)}
                  className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-shadow hover:shadow-[0_0_0_1px_var(--series-1)]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                  {p.stage !== 'active' && (
                    <span style={{ color: 'var(--text-muted)' }}>· {PROJECT_STAGE_LABELS[p.stage]}</span>
                  )}
                  {p.deadline && (
                    <span
                      className="flex items-center gap-1"
                      style={{ color: overdue ? 'var(--status-critical)' : 'var(--text-muted)' }}
                    >
                      <CalendarClock size={11} />
                      {formatDate(p.deadline)}
                    </span>
                  )}
                  <Pencil size={10} style={{ color: 'var(--text-muted)' }} />
                </button>
                {client && (
                  <button
                    onClick={() => onOpenClient?.(client.id)}
                    disabled={!onOpenClient}
                    className="rounded-full px-1.5 py-0.5 transition-opacity enabled:hover:opacity-70"
                    style={{ color: onOpenClient ? 'var(--series-1)' : 'var(--text-muted)' }}
                  >
                    · {client.name}
                  </button>
                )}
              </div>
            )
          })}
          <button
            onClick={() => setEditingProject('new')}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--series-1)' }}
          >
            <FolderPlus size={13} />
            Проект
          </button>
        </div>
        {defaultProjectId && (
          <button
            onClick={() => setEditingTask('new')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110 active:brightness-95"
            style={{ background: 'var(--series-1)' }}
          >
            <Plus size={16} />
            Новая задача
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((status) => {
          const columnTasks = filteredTasks.filter((t) => t.status === status)
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverStatus(status)
              }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData('text/task-id')
                if (taskId) moveTask(taskId, status)
                setDragOverStatus(null)
              }}
              className="flex flex-col gap-2 rounded-xl p-3"
              style={{
                background: dragOverStatus === status ? 'color-mix(in srgb, var(--series-1) 8%, var(--surface-1))' : 'var(--surface-1)',
                border: '1px solid var(--border)',
                minHeight: 200,
              }}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
                <span
                  className="rounded-full px-1.5 text-xs"
                  style={{ background: 'var(--page-plane)', color: 'var(--text-muted)' }}
                >
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setEditingTask(task)} showProject={projectId === 'all'} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {editingTask !== null && (
        <TaskModal
          task={editingTask === 'new' ? null : editingTask}
          defaultProjectId={defaultProjectId ?? activeProjects[0].id}
          onClose={() => setEditingTask(null)}
          onOpenClient={onOpenClient}
        />
      )}
      {editingProject !== null && (
        <ProjectModal project={editingProject === 'new' ? null : editingProject} onClose={() => setEditingProject(null)} />
      )}
    </div>
  )
}
