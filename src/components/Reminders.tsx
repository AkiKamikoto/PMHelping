import { useEffect, useRef, useState } from 'react'
import { BellRing, Check, Plus, Trash2, BellOff } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDateTime } from '../utils/date'

function useDeadlineNotifications() {
  const reminders = useStore((s) => s.reminders)
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    const id = setInterval(() => {
      if (Notification.permission !== 'granted') return
      const now = Date.now()
      for (const r of reminders) {
        if (r.done || notifiedRef.current.has(r.id)) continue
        if (Date.parse(r.remindAt) <= now) {
          new Notification('PMHelping — напоминание', { body: r.title })
          notifiedRef.current.add(r.id)
        }
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [reminders])
}

export function Reminders() {
  const reminders = useStore((s) => s.reminders)
  const addReminder = useStore((s) => s.addReminder)
  const toggleReminder = useStore((s) => s.toggleReminder)
  const deleteReminder = useStore((s) => s.deleteReminder)

  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )

  useDeadlineNotifications()

  function handleEnableNotifications() {
    if (typeof Notification === 'undefined') return
    Notification.requestPermission().then(setPermission)
  }

  function handleAdd() {
    if (!title.trim() || !remindAt) return
    addReminder({ taskId: null, title: title.trim(), remindAt: new Date(remindAt).toISOString() })
    setTitle('')
    setRemindAt('')
  }

  const pending = reminders.filter((r) => !r.done).sort((a, b) => a.remindAt.localeCompare(b.remindAt))
  const done = reminders.filter((r) => r.done).sort((a, b) => b.remindAt.localeCompare(a.remindAt))

  return (
    <div className="flex flex-col gap-6">
      {permission !== 'granted' && permission !== 'unsupported' && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl p-4"
          style={{ background: 'color-mix(in srgb, var(--status-warning) 12%, var(--surface-1))', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 text-sm">
            <BellOff size={16} style={{ color: 'var(--status-warning)' }} />
            Разрешите уведомления браузера, чтобы получать напоминания о дедлайнах.
          </div>
          <button
            onClick={handleEnableNotifications}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ background: 'var(--series-1)' }}
          >
            Включить
          </button>
        </div>
      )}

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">Новое напоминание</h3>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Текст
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: позвонить клиенту"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Когда напомнить
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            />
          </label>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || !remindAt}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            style={{ background: 'var(--series-1)' }}
          >
            <Plus size={15} />
            Добавить
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <BellRing size={15} />
          Предстоящие ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Нет активных напоминаний.
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {pending.map((r) => {
              const overdue = Date.parse(r.remindAt) < Date.now()
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm">{r.title}</p>
                    <p className="text-xs" style={{ color: overdue ? 'var(--status-critical)' : 'var(--text-muted)' }}>
                      {formatDateTime(r.remindAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleReminder(r.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                      style={{ background: 'color-mix(in srgb, var(--status-good) 14%, transparent)', color: 'var(--status-good)' }}
                    >
                      <Check size={13} />
                      Готово
                    </button>
                    <button onClick={() => deleteReminder(r.id)} style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Выполненные
          </h3>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {done.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                  {r.title}
                </p>
                <button onClick={() => deleteReminder(r.id)} style={{ color: 'var(--text-muted)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
