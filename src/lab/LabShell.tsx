import type { ReactNode } from 'react'
import { MODULES, type ModuleId } from '../modules/catalog'

type LabShellProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
  title: string
  goal: string
  scroll?: boolean
  footer?: ReactNode
  children: ReactNode
}

export function LabShell({
  moduleId,
  onModuleChange,
  title,
  goal,
  scroll = false,
  footer,
  children,
}: LabShellProps) {
  return (
    <div className={`lab${scroll ? ' lab--scroll' : ''}`}>
      <header className="lab__header">
        <div>
          <p className="lab__eyebrow">Semiconductor Test Laboratory</p>
          <h1>{title}</h1>
          <nav className="lab__nav" aria-label="Modules">
            {MODULES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`lab__nav-item${moduleId === item.id ? ' is-active' : ''}`}
                onClick={() => onModuleChange(item.id)}
              >
                M{item.code}
              </button>
            ))}
          </nav>
        </div>
        <p className="lab__goal">{goal}</p>
      </header>
      {children}
      {footer}
    </div>
  )
}
