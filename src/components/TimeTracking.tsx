import { useEffect, useMemo, useState } from 'react'
import { Play, Square, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDateTime, minutesToHuman } from '../utils/date'

function useNow(activeMs: number | null) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (activeMs === null) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [activeMs])
}

export function TimeTracking({ projectId }: { projectId: string | 'all' }) {
  const allTasks = useStore((s) => s.tasks)
  const tasks = useMemo(
    () => allTasks.filter((t) => projectId === 'all' || t.projectId === projectId),
    [allTasks, projectId]
  )
  const projects = useStore((s) => s.projects)
  const timeEntries = useStore((s) => s.timeEntries)
  const runningTimer = useStore((s) => s.runningTimer)
  const startTimer = useStore((s) => s.startTimer)
  const stopTimer = useStore((s) => s.stopTimer)
  const addManualTimeEntry = useStore((s) => s.addManualTimeEntry)
  const deleteTimeEntry = useStore((s) => s.deleteTimeEntry)

  const runningTask = runningTimer ? allTasks.find((t) => t.id === runningTimer.taskId) : null
  useNow(runningTimer ? 1 : null)

  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualTaskId, setManualTaskId] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10))
  const [manualHours, setManualHours] = useState('0')
  const [manualMinutes, setManualMinutes] = useState('30')
  const [manualNote, setManualNote] = useState('')

  const openTasks = tasks.filter((t) => t.status !== 'done')

  const taskEntries = useMemo(
    () => timeEntries.filter((e) => tasks.some((t) => t.id === e.taskId)).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [timeEntries, tasks]
  )

  const totalsByTask = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of taskEntries) map.set(e.taskId, (map.get(e.taskId) ?? 0) + e.minutes)
    return map
  }, [taskEntries])

  const totalMinutes = taskEntries.reduce((sum, e) => sum + e.minutes, 0)

  function taskTitle(taskId: string) {
    return allTasks.find((t) => t.id === taskId)?.title ?? '—'
  }
  function projectOf(taskId: string) {
    const t = allTasks.find((tt) => tt.id === taskId)
    return t ? projects.find((p) => p.id === t.projectId) : undefined
  }

  function elapsedLabel(): string {
    if (!runningTimer) return ''
    const mins = Math.max(0, Math.floor((Date.now() - Date.parse(runningTimer.startedAt)) / 60000))
    const secs = Math.max(0, Math.floor(((Date.now() - Date.parse(runningTimer.startedAt)) % 60000) / 1000))
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleManualSubmit() {
    if (!manualTaskId) return
    const minutes = Number(manualHours) * 60 + Number(manualMinutes)
    if (minutes <= 0) return
    addManualTimeEntry(manualTaskId, minutes, manualNote, new Date(manualDate).toISOString())
    setShowManual(false)
    setManualNote('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">Таймер</h3>
        {runningTimer ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Идёт запись по задаче
              </p>
              <p className="text-base font-medium">{runningTask?.title ?? taskTitle(runningTimer.taskId)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--series-1)' }}>
                {elapsedLabel()}
              </span>
              <button
                onClick={stopTimer}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
                style={{ background: 'var(--status-critical)' }}
              >
                <Square size={14} />
                Стоп
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--page-plane)', border: '1px solid var(--border)' }}
            >
              <option value="">Выберите задачу…</option>
              {openTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedTaskId && startTimer(selectedTaskId)}
              disabled={!selectedTaskId}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              style={{ background: 'var(--series-1)' }}
            >
              <Play size={14} />
              Старт
            </button>
            <button
              onClick={() => setShowManual((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Plus size={14} />
              Внести вручную
            </button>
          </div>
        )}

        {showManual && (
          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg p-3" style={{ background: 'var(--page-plane)' }}>
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Задача
              <select
                value={manualTaskId}
                onChange={(e) => setManualTaskId(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              >
                <option value="">Выберите…</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Дата
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Часы
              <input
                type="number"
                min={0}
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="w-16 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Минуты
              <input
                type="number"
                min={0}
                max={59}
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="w-16 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Заметка
              <input
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
            </label>
            <button
              onClick={handleManualSubmit}
              disabled={!manualTaskId}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              style={{ background: 'var(--series-1)' }}
            >
              Добавить
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Всего затрачено
          </p>
          <p className="mt-1 text-2xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {minutesToHuman(totalMinutes)}
          </p>
        </div>
        <div className="rounded-xl p-4 md:col-span-2" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <p className="mb-2 text-sm font-semibold">По задачам</p>
          <div className="flex flex-col gap-1.5">
            {[...totalsByTask.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([taskId, mins]) => (
                <div key={taskId} className="flex items-center justify-between text-sm">
                  <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                    {taskTitle(taskId)}
                  </span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{minutesToHuman(mins)}</span>
                </div>
              ))}
            {totalsByTask.size === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Записей пока нет.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold">Журнал времени</h3>
        {taskEntries.filter((e) => e.endedAt).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Записей ещё нет — запустите таймер или внесите время вручную.
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {taskEntries
              .filter((e) => e.endedAt)
              .map((entry) => {
                const project = projectOf(entry.taskId)
                return (
                  <div key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      {project && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project.color }} />}
                      <div className="min-w-0">
                        <p className="truncate text-sm">{taskTitle(entry.taskId)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDateTime(entry.startedAt)}
                          {entry.note ? ` · ${entry.note}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {minutesToHuman(entry.minutes)}
                      </span>
                      <button onClick={() => deleteTimeEntry(entry.id)} style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
