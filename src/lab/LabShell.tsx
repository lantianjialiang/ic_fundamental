import { useEffect, useRef, type ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { MODULE_IDS, type ModuleId } from '../modules/catalog'
import { LESSON_TITLE } from '../modules/titles'
import { lessonCode } from '../tracks/catalog'
import { Copyright } from './Copyright'
import { LabHeader } from './LabHeader'
import { useLabNav } from './LabNavContext'

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
  const { t } = useLocale()
  const labNav = useLabNav()
  const navIds: readonly ModuleId[] = labNav ? labNav.navIds : MODULE_IDS
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [moduleId])

  const nav = (
    <>
      {labNav ? (
        <>
          <button type="button" className="lab__nav-item" onClick={labNav.goHome}>
            {t(ui.home.home)}
          </button>
          <button type="button" className="lab__nav-item" onClick={labNav.goTrack}>
            {t(ui.home.backTrack)}
          </button>
          <span className="lab__nav-sep" aria-hidden="true" />
        </>
      ) : null}
      {navIds.map((id) => (
        <button
          key={id}
          ref={moduleId === id ? activeRef : undefined}
          type="button"
          title={t(LESSON_TITLE[id])}
          className={`lab__nav-item${moduleId === id ? ' is-active' : ''}`}
          onClick={() => onModuleChange(id)}
        >
          {lessonCode(id)}
        </button>
      ))}
    </>
  )

  return (
    <div className={`lab${scroll ? ' lab--scroll' : ''}`}>
      <LabHeader title={`${lessonCode(moduleId)} · ${title}`} goal={goal} nav={nav} />
      {children}
      {footer}
      <Copyright page={`${lessonCode(moduleId)} · ${title}`} />
    </div>
  )
}
