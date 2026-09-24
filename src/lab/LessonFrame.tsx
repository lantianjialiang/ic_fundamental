import type { ReactNode } from 'react'
import { LabShell } from './LabShell'
import { type ModuleId } from '../modules/catalog'

type LessonFrameProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
  title: string
  goal: string
  kicker: string
  asideTitle: string
  asideText: string
  asideLater?: string
  nextId?: ModuleId
  nextLabel?: string
  extra?: ReactNode
  children: ReactNode
}

export function LessonFrame({
  moduleId,
  onModuleChange,
  title,
  goal,
  kicker,
  asideTitle,
  asideText,
  asideLater,
  nextId,
  nextLabel,
  extra,
  children,
}: LessonFrameProps) {
  return (
    <LabShell moduleId={moduleId} onModuleChange={onModuleChange} title={title} goal={goal} scroll>
      <div className="lab__body intro">
        <main className="intro__main">{children}</main>
        <aside className="legend intro__aside">
          <h2>{kicker}</h2>
          <p className="legend__path-title">{asideTitle}</p>
          <p className="legend__hint">{asideText}</p>
          {asideLater ? <p className="legend__hint">{asideLater}</p> : null}
          {extra}
          {nextId && nextLabel ? (
            <button
              type="button"
              className="lab__btn lab__btn--primary"
              onClick={() => onModuleChange(nextId)}
            >
              {nextLabel}
            </button>
          ) : null}
        </aside>
      </div>
    </LabShell>
  )
}

export function Section({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="intro__section">
      <h2>{title}</h2>
      {note ? <p className="intro__note">{note}</p> : null}
      {children}
    </section>
  )
}
