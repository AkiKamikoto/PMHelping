import type { ReactNode } from 'react'
import {
  ListChecks,
  Users,
  Activity,
  AlertTriangle,
  RefreshCw,
  FileText,
  XCircle,
  GraduationCap,
  Eye,
  Target,
} from 'lucide-react'
import type { View } from '../App'

const RESPONSIBILITIES: {
  icon: typeof ListChecks
  title: string
  bullets: string[]
  howTo: string
  link?: { view: View; label: string }
}[] = [
  {
    icon: ListChecks,
    title: 'Инициация и планирование',
    bullets: [
      'Определение целей проекта, scope (что входит и что НЕ входит)',
      'Оценка сроков и ресурсов',
      'Составление плана-графика (Gantt, roadmap)',
      'Идентификация рисков на старте',
    ],
    howTo:
      'Используй технику декомпозиции (WBS — Work Breakdown Structure), разбивай крупные цели на задачи, которые можно оценить в часах/днях. Без декомпозиции любая оценка — гадание.',
    link: { view: 'board', label: 'Доска задач' },
  },
  {
    icon: Users,
    title: 'Управление командой и стейкхолдерами',
    bullets: [
      'Распределение задач',
      'Фасилитация коммуникации между разработчиками, дизайнерами, заказчиком',
      'Управление ожиданиями клиента',
    ],
    howTo:
      'Регулярные короткие синки (daily/weekly), а не долгие совещания. Один из главных навыков — сказать заказчику «нет» или «не сейчас», аргументированно, не разрушая отношения.',
    link: { view: 'clients', label: 'Клиенты' },
  },
  {
    icon: Activity,
    title: 'Контроль исполнения',
    bullets: [
      'Отслеживание прогресса по вехам',
      'Управление багтрекером/таск-трекером',
      'Контроль качества на выходе',
    ],
    howTo:
      'Метрики важнее ощущений — velocity, burndown chart, % выполненных задач к дедлайну. В Bitrix24, кстати, для этого есть встроенные отчёты по задачам и диаграмма Ганта — грех не использовать, раз ты с ним и так работаешь.',
    link: { view: 'reports', label: 'Отчёты' },
  },
  {
    icon: AlertTriangle,
    title: 'Управление рисками',
    bullets: [
      'Ведение реестра рисков',
      'Проактивное выявление узких мест (нехватка ресурсов, зависимости от третьих сторон, технический долг)',
    ],
    howTo:
      'Матрица «вероятность × влияние», еженедельный пересмотр топ-5 рисков, а не разовое упражнение в начале проекта.',
    link: { view: 'reminders', label: 'Напоминания' },
  },
  {
    icon: RefreshCw,
    title: 'Управление изменениями (Change Management)',
    bullets: ['Обработка запросов на изменение scope', 'Пересчёт сроков/бюджета при изменениях'],
    howTo:
      'Формализованный change request process — даже простая табличка «что меняется → как это влияет на срок/бюджет → согласовано кем» защищает и тебя, и команду от «ой, а можно ещё вот это добавить бесплатно».',
  },
  {
    icon: FileText,
    title: 'Отчётность',
    bullets: ['Статус-репорты для руководства и клиента', 'Пост-мортемы после завершения проекта'],
    howTo: 'Формат «что сделано / что в работе / риски и блокеры / нужна помощь в» — коротко, регулярно, без воды.',
    link: { view: 'reports', label: 'Отчёты' },
  },
]

const COMPETENCIES = [
  {
    category: 'Hard skills',
    detail: 'Методологии (Agile/Scrum, Waterfall, Kanban), инструменты (Jira, Bitrix24, MS Project, Trello), базовое понимание бюджетирования',
  },
  {
    category: 'Soft skills',
    detail: 'Переговоры, разрешение конфликтов, презентация результатов, активное слушание',
  },
  {
    category: 'Домен',
    detail: 'Понимание предметной области (в твоём случае — CRM/автоматизация бизнес-процессов на Bitrix24)',
  },
]

const METHODOLOGIES = [
  {
    name: 'Waterfall',
    when: 'Подходит, когда требования стабильны (например, внедрение с фиксированным ТЗ у заказчика)',
  },
  {
    name: 'Agile/Scrum',
    when: 'Когда требования меняются, нужна гибкость и быстрая обратная связь',
  },
  {
    name: 'Kanban',
    when: 'Хорош для поддержки и постоянного потока задач (частый кейс в проектах внедрения CRM, где есть и разработка, и текучка тикетов)',
  },
]

const MISTAKES = [
  'Пытаться контролировать всё вручную вместо делегирования',
  'Не документировать договорённости (потом «а мы так не договаривались»)',
  'Скрывать риски от заказчика вместо раннего эскалирования',
  'Путать роль PM с ролью тимлида/архитектора — не нужно самому лезть в код',
]

const GROWTH = [
  {
    icon: GraduationCap,
    title: 'Сертификации',
    text: 'PMP (PMI), PSM/CSM (Scrum), хотя на практике опыт ценится больше бумажки',
  },
  {
    icon: Eye,
    title: 'Насмотренность',
    text: 'Чем больше проектов провёл, тем лучше калибруется интуиция по оценке рисков и сроков',
  },
  {
    icon: Target,
    title: 'Специализация',
    text: 'В твоём случае — углубление в Bitrix24 (BPM, роботы, автоматизация) даёт конкурентное преимущество, так как узкая экспертиза + управление проектами = редкое и дорогое сочетание на рынке',
  },
]

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

export function Guide({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <h2 className="text-base font-semibold">Суть роли</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          PM — это не про «делать работу самому», а про создание условий, при которых команда доставляет ценность в
          срок, в бюджете и с нужным качеством. Ключевое противоречие профессии: ты отвечаешь за результат, но обычно
          не имеешь прямой административной власти над людьми, которые этот результат создают. Отсюда — упор на
          влияние, а не на приказы.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold">Основные обязанности</h2>
        <div className="flex flex-col gap-3">
          {RESPONSIBILITIES.map((r, i) => (
            <div
              key={r.title}
              className="rounded-xl p-4"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: 'color-mix(in srgb, var(--series-1) 14%, transparent)', color: 'var(--series-1)' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <r.icon size={15} style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {r.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-3 rounded-lg p-3 text-xs leading-relaxed"
                    style={{ background: 'var(--page-plane)', color: 'var(--text-secondary)' }}
                  >
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Как выполнять:{' '}
                    </span>
                    {r.howTo}
                  </div>
                  {r.link && (
                    <button
                      onClick={() => onNavigate(r.link!.view)}
                      className="mt-2 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--series-1)' }}
                    >
                      Открыть: {r.link.label} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card title="Ключевые компетенции">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {COMPETENCIES.map((c) => (
                <tr key={c.category} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2.5 pr-4 align-top font-medium" style={{ whiteSpace: 'nowrap' }}>
                    {c.category}
                  </td>
                  <td className="py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {c.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Методологии — что выбрать">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {METHODOLOGIES.map((m) => (
            <div key={m.name} className="rounded-lg p-3" style={{ background: 'var(--page-plane)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--series-1)' }}>
                {m.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {m.when}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          На практике большинство PM в РФ/СНГ используют гибрид: Waterfall для контракта и вех с заказчиком +
          Kanban/Scrum внутри команды разработки — именно поэтому доска задач в этом приложении устроена как канбан.
        </p>
      </Card>

      <Card title="Типичные ошибки начинающих PM">
        <ul className="flex flex-col gap-2 text-sm">
          {MISTAKES.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <XCircle size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--status-critical)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{m}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Что нужно для роста в профессии">
        <div className="flex flex-col gap-3">
          {GROWTH.map((g) => (
            <div key={g.title} className="flex items-start gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'color-mix(in srgb, var(--series-1) 14%, transparent)', color: 'var(--series-1)' }}
              >
                <g.icon size={14} />
              </span>
              <div>
                <p className="text-sm font-medium">{g.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {g.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
