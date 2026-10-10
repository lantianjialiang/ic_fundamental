import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'

type LabHeaderProps = {
  title: string
  goal: string
  nav?: ReactNode
}

export function LabHeader({ title, goal, nav }: LabHeaderProps) {
  const { locale, setLocale, t } = useLocale()

  return (
    <header className="lab__header">
      <div className="lab__head-row">
        <div className="lab__titles">
          <p className="lab__eyebrow">{t(ui.labName)}</p>
          <h1>{title}</h1>
        </div>
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
      </div>
      <p className="lab__goal">{goal}</p>
      <nav className="lab__nav" aria-label="Modules">
        {nav}
      </nav>
    </header>
  )
}
