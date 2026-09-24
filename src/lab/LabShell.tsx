import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { MODULES, type ModuleId } from '../modules/catalog'
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
  const { locale, setLocale, t } = useLocale()
  const labNav = useLabNav()
  const navItems = labNav
    ? MODULES.filter((item) => labNav.navIds.includes(item.id))
    : MODULES

  return (
    <div className={`lab${scroll ? ' lab--scroll' : ''}`}>
      <header className="lab__header">
        <div>
          <p className="lab__eyebrow">{t(ui.labName)}</p>
          <h1>{title}</h1>
          <nav className="lab__nav" aria-label="Modules">
            {labNav ? (
              <>
                <button type="button" className="lab__nav-item" onClick={labNav.goHome}>
                  {t(ui.home.home)}
                </button>
                <button type="button" className="lab__nav-item" onClick={labNav.goTrack}>
                  {t(ui.home.backTrack)}
                </button>
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
            <div className="lab__lang" role="group" aria-label="Language">
              <button
                type="button"
                className={`lab__lang-btn${locale === 'zh' ? ' is-active' : ''}`}
                onClick={() => setLocale('zh')}
              >
                {t(ui.langZh)}
              </button>
              <button
                type="button"
                className={`lab__lang-btn${locale === 'en' ? ' is-active' : ''}`}
                onClick={() => setLocale('en')}
              >
                {t(ui.langEn)}
              </button>
            </div>
          </nav>
        </div>
        <p className="lab__goal">{goal}</p>
      </header>
      {children}
      {footer}
    </div>
  )
}
