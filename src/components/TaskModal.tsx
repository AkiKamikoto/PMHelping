import { useState } from 'react'
import { X, Trash2, Building2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER } from '../types'
import { useEscapeClose } from '../utils/useEscapeClose'

export function TaskModal({
  task,
  defaultProjectId,
  onClose,
  onOpenClient,
}: {
  task: Task | null
  defaultProjectId: string
  onClose: () => void
  onOpenClient?: (clientId: string) => void
}) {
  const projects = useStore((s) => s.projects)
  const clients = useStore((s) => s.clients)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const addReminder = useStore((s) => s.addReminder)

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState(task?.projectId ?? defaultProjectId)
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? '')

  const activeProjects = projects.filter((p) => !p.archived)
  const selectedProject = projects.find((p) => p.id === projectId)
  const projectClient = selectedProject?.clientId ? clients.find((c) => c.id === selectedProject.clientId) : null

  function handleOpenClient() {
    if (!projectClient) return
    onOpenClient?.(projectClient.id)
    onClose()
  }

  function handleSave() {
    if (!title.trim()) return
    const dueIso = dueDate ? new Date(dueDate).toISOString() : null
    if (task) {
      updateTask(task.id, { title, description, projectId, status, priority, assignee, dueDate: dueIso })
    } else {
      addTask({ title, description, projectId, status, priority, assignee, dueDate: dueIso })
    }
    onClose()
  }

  function handleDelete() {
    if (!task) return
    if (confirm('Удалить задачу безвозвратно?')) {
      deleteTask(task.id)
      onClose()
    }
  }

  function handleRemindMe() {
    if (!dueDate) return
    addReminder({ taskId: task?.id ?? null, title: `Дедлайн: ${title}`, remindAt: new Date(dueDate).toISOString() })
    alert('Напоминание добавлено на дату дедлайна.')
  }

  useEscapeClose(onClose)

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl p-5"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            autoFocus
            placeholder="Название задачи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
          />
          <textarea
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Проект
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              >
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {projectClient && (
                <button
                  type="button"
                  onClick={handleOpenClient}
                  disabled={!onOpenClient}
                  className="flex items-center gap-1 self-start text-xs transition-opacity enabled:hover:opacity-70"
                  style={{ color: onOpenClient ? 'var(--series-1)' : 'var(--text-muted)' }}
                >
                  <Building2 size={11} />
                  {projectClient.name}
                </button>
              )}
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Статус
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Приоритет
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Исполнитель
              <input
                placeholder="Имя"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Дедлайн
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              />
              {dueDate && (
                <button
                  onClick={handleRemindMe}
                  className="rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ background: 'color-mix(in srgb, var(--series-1) 14%, transparent)', color: 'var(--series-1)' }}
                >
                  Напомнить в этот день
                </button>
              )}
            </div>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {task ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--status-critical)' }}
            >
              <Trash2 size={15} />
              Удалить
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:brightness-95 disabled:opacity-40 disabled:hover:brightness-100"
              style={{ background: 'var(--series-1)' }}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
