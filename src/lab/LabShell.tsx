import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { MODULES, type ModuleId } from '../modules/catalog'
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
  const navItems = labNav
    ? labNav.navIds
        .map((id) => MODULES.find((item) => item.id === id))
        .filter((item): item is (typeof MODULES)[number] => Boolean(item))
    : MODULES

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
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`lab__nav-item${moduleId === item.id ? ' is-active' : ''}`}
          onClick={() => onModuleChange(item.id)}
        >
          M{item.code}
        </button>
      ))}
    </>
  )

  return (
    <div className={`lab${scroll ? ' lab--scroll' : ''}`}>
      <LabHeader title={title} goal={goal} nav={nav} />
      {children}
      {footer}
    </div>
  )
}
