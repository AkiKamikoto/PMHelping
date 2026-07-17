import { useCallback, useState } from 'react'
import { LayoutDashboard, KanbanSquare, Timer, BarChart3, BellRing, Download, Upload, FolderKanban, Building2 } from 'lucide-react'
import { useStore } from './store/useStore'
import { Dashboard } from './components/Dashboard'
import { Board } from './components/Board'
import { TimeTracking } from './components/TimeTracking'
import { Reports } from './components/Reports'
import { Reminders } from './components/Reminders'
import { Clients } from './components/Clients'
import { ProjectSelect } from './components/ProjectSelect'

export type View = 'dashboard' | 'clients' | 'board' | 'time' | 'reports' | 'reminders'

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'clients', label: 'Клиенты', icon: Building2 },
  { id: 'board', label: 'Доска задач', icon: KanbanSquare },
  { id: 'time', label: 'Учёт времени', icon: Timer },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
  { id: 'reminders', label: 'Напоминания', icon: BellRing },
]

const PROJECT_FILTER_VIEWS: View[] = ['dashboard', 'board', 'time', 'reports']

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [projectId, setProjectId] = useState<string | 'all'>('all')
  const [focusClientId, setFocusClientId] = useState<string | null>(null)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)

  const goToClient = useCallback((clientId: string) => {
    setFocusClientId(clientId)
    setView('clients')
  }, [])

  const goToProject = useCallback((projectIdToOpen: string) => {
    setProjectId(projectIdToOpen)
    setView('board')
  }, [])

  const clearFocusClient = useCallback(() => setFocusClientId(null), [])

  function handleExport() {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmhelping-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          importData(String(reader.result))
        } catch {
          alert('Не удалось прочитать файл — проверьте формат JSON.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="flex min-h-svh" style={{ background: 'var(--page-plane)' }}>
      <aside
        className="flex w-60 shrink-0 flex-col gap-1 p-4"
        style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}
      >
        <div className="mb-4 flex items-center gap-2 px-2">
          <FolderKanban size={22} style={{ color: 'var(--series-1)' }} />
          <span className="text-lg font-semibold">PMHelping</span>
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--hover-overlay)]"
            style={{
              background: view === id ? 'color-mix(in srgb, var(--series-1) 14%, transparent)' : undefined,
              color: view === id ? 'var(--series-1)' : 'var(--text-secondary)',
            }}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}

        <div className="mt-auto flex flex-col gap-1 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleExport}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Download size={16} />
            Экспорт данных
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--hover-overlay)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Upload size={16} />
            Импорт данных
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h1 className="text-xl font-semibold">{NAV.find((n) => n.id === view)?.label}</h1>
          {PROJECT_FILTER_VIEWS.includes(view) && <ProjectSelect value={projectId} onChange={setProjectId} />}
        </header>

        <div className="p-6">
          {view === 'dashboard' && <Dashboard projectId={projectId} onNavigate={setView} />}
          {view === 'clients' && (
            <Clients focusClientId={focusClientId} onFocusHandled={clearFocusClient} onOpenProject={goToProject} />
          )}
          {view === 'board' && <Board projectId={projectId} onOpenClient={goToClient} />}
          {view === 'time' && <TimeTracking projectId={projectId} />}
          {view === 'reports' && <Reports projectId={projectId} />}
          {view === 'reminders' && <Reminders />}
        </div>
      </main>
    </div>
  )
}

export default App
