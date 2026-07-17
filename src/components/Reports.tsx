import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { eachDayOfInterval, format, isSameDay, parseISO, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useStore } from '../store/useStore'
import { STATUS_LABELS, STATUS_ORDER } from '../types'
import { ChartCard, ChartTooltip } from './ChartCard'
import { minutesToHuman } from '../utils/date'

const STATUS_COLOR: Record<string, string> = {
  todo: 'var(--text-muted)',
  in_progress: 'var(--series-1)',
  review: 'var(--series-4)',
  done: 'var(--status-good)',
}

export function Reports({ projectId }: { projectId: string | 'all' }) {
  const allTasks = useStore((s) => s.tasks)
  const allProjects = useStore((s) => s.projects)
  const tasks = useMemo(
    () => allTasks.filter((t) => projectId === 'all' || t.projectId === projectId),
    [allTasks, projectId]
  )
  const projects = useMemo(() => allProjects.filter((p) => !p.archived), [allProjects])
  const timeEntries = useStore((s) => s.timeEntries)

  const statusData = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: tasks.filter((t) => t.status === status).length,
  }))

  const workloadData = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tasks) {
      if (t.status === 'done') continue
      const key = t.assignee.trim() || 'Не назначено'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()].map(([assignee, count]) => ({ assignee, count })).sort((a, b) => b.count - a.count)
  }, [tasks])

  const timeByProjectData = useMemo(() => {
    const relevantProjects = projectId === 'all' ? projects : projects.filter((p) => p.id === projectId)
    return relevantProjects.map((p) => {
      const taskIds = new Set(tasks.filter((t) => t.projectId === p.id).map((t) => t.id))
      const minutes = timeEntries.filter((e) => taskIds.has(e.taskId)).reduce((sum, e) => sum + e.minutes, 0)
      return { project: p.name, minutes, hours: Math.round((minutes / 60) * 10) / 10, color: p.color }
    })
  }, [projects, tasks, timeEntries, projectId])

  const trendData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
    return days.map((day) => ({
      date: format(day, 'd MMM', { locale: ru }),
      count: tasks.filter((t) => t.completedAt && isSameDay(parseISO(t.completedAt), day)).length,
    }))
  }, [tasks])

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Задачи по статусам" subtitle="Распределение всех задач по статусу">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--gridline)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--gridline)', opacity: 0.4 }} content={<ChartTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48} name="Задач">
              {statusData.map((d) => (
                <Cell key={d.status} fill={STATUS_COLOR[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Загрузка по исполнителям" subtitle="Открытые задачи на человека">
        {workloadData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workloadData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--gridline)" />
              <XAxis dataKey="assignee" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'var(--gridline)', opacity: 0.4 }} content={<ChartTooltip />} />
              <Bar dataKey="count" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={48} name="Задач" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Затраченное время по проектам" subtitle="Суммарно в часах">
        {timeByProjectData.every((d) => d.minutes === 0) ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeByProjectData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--gridline)" />
              <XAxis dataKey="project" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} unit="ч" />
              <Tooltip
                cursor={{ fill: 'var(--gridline)', opacity: 0.4 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <ChartTooltip active={active} label={String(label)} payload={[{ value: payload[0].payload.hours, name: 'Часов' }]} />
                  ) : null
                }
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48} name="Часов">
                {timeByProjectData.map((d) => (
                  <Cell key={d.project} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {timeByProjectData.some((d) => d.minutes > 0) && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {timeByProjectData
              .filter((d) => d.minutes > 0)
              .map((d) => `${d.project}: ${minutesToHuman(d.minutes)}`)
              .join(' · ')}
          </p>
        )}
      </ChartCard>

      <ChartCard title="Динамика завершения задач" subtitle="Закрыто задач в день, последние 30 дней">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--gridline)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--baseline)' }} tickLine={false} interval={4} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="count" stroke="var(--series-1)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Завершено" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
      Пока недостаточно данных
    </div>
  )
}
