import { useMemo, useState } from 'react'
import { X, Trash2, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Project } from '../types'
import { useEscapeClose } from '../utils/useEscapeClose'

export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const allClients = useStore((s) => s.clients)
  const clients = useMemo(() => allClients.filter((c) => c.status === 'active'), [allClients])
  const addProject = useStore((s) => s.addProject)
  const updateProject = useStore((s) => s.updateProject)
  const archiveProject = useStore((s) => s.archiveProject)
  const deleteProject = useStore((s) => s.deleteProject)

  const [name, setName] = useState(project?.name ?? '')
  const [clientId, setClientId] = useState(project?.clientId ?? '')

  function handleSave() {
    if (!name.trim()) return
    if (project) {
      updateProject(project.id, { name: name.trim(), clientId: clientId || null })
    } else {
      addProject(name.trim(), clientId || null)
    }
    onClose()
  }

  function handleArchive() {
    if (!project) return
    archiveProject(project.id)
    onClose()
  }

  function handleDelete() {
    if (!project) return
    if (confirm('Удалить проект вместе со всеми его задачами? Это действие необратимо.')) {
      deleteProject(project.id)
      onClose()
    }
  }

  useEscapeClose(onClose)

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel w-full max-w-md rounded-xl p-5"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{project ? 'Редактировать проект' : 'Новый проект'}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Название проекта
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Внедрение Bitrix24"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Клиент
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            >
              <option value="">Без привязки к клиенту</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {project ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleArchive}
                className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Archive size={15} />
                Архивировать
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--status-critical)' }}
              >
                <Trash2 size={15} />
                Удалить
              </button>
            </div>
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
              disabled={!name.trim()}
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
