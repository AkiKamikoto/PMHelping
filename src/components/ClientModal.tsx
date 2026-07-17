import { useState } from 'react'
import { X, Trash2, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Client } from '../types'
import { useEscapeClose } from '../utils/useEscapeClose'

export function ClientModal({
  client,
  onClose,
}: {
  client: Client | null
  onClose: (createdId?: string) => void
}) {
  const addClient = useStore((s) => s.addClient)
  const updateClient = useStore((s) => s.updateClient)
  const archiveClient = useStore((s) => s.archiveClient)
  const deleteClient = useStore((s) => s.deleteClient)

  const [name, setName] = useState(client?.name ?? '')
  const [contactPerson, setContactPerson] = useState(client?.contactPerson ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [notes, setNotes] = useState(client?.notes ?? '')

  function handleSave() {
    if (!name.trim()) return
    if (client) {
      updateClient(client.id, { name: name.trim(), contactPerson, phone, email, notes })
      onClose()
    } else {
      const id = addClient({ name: name.trim(), contactPerson, phone, email, notes })
      onClose(id)
    }
  }

  function handleArchive() {
    if (!client) return
    archiveClient(client.id)
    onClose()
  }

  function handleDelete() {
    if (!client) return
    if (confirm('Удалить клиента и всю историю взаимодействий с ним? Это действие необратимо.')) {
      deleteClient(client.id)
      onClose()
    }
  }

  useEscapeClose(onClose)

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={() => onClose()}
    >
      <div
        className="modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl p-5"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{client ? 'Редактировать клиента' : 'Новый клиент'}</h2>
          <button
            onClick={() => onClose()}
            className="rounded-md p-1 transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Компания
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: ООО «Ромашка»"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Контактное лицо
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Телефон
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Заметки
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Особенности клиента, договорённости и т.д."
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {client ? (
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
              onClick={() => onClose()}
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
