import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { useTheme } from '../theme'

type LabHeaderProps = {
  title: string
  goal: string
  nav?: ReactNode
  /** 首页：显示大号站点图标和名称 */
  brand?: boolean
}

const LOGO = `${import.meta.env.BASE_URL}favicon.svg`

export function LabHeader({ title, goal, nav, brand }: LabHeaderProps) {
  const { locale, setLocale, t } = useLocale()
  const { theme, setTheme } = useTheme()

  return (
    <header className={`lab__header${brand ? ' lab__header--home' : ''}`}>
      <div className="lab__head-row">
        {brand ? (
          <a className="lab__brand" href="#/">
            <img src={LOGO} alt="" width="40" height="40" />
            <b>{t(ui.labName)}</b>
          </a>
        ) : (
          <a className="lab__eyebrow" href="#/">
            <img src={LOGO} alt="" width="16" height="16" />
            {t(ui.labName)}
          </a>
        )}
        <div className="lab__switches">
          <div className="lab__lang" role="group" aria-label={t(ui.themeAria)}>
            <button
              type="button"
              className={`lab__lang-btn${theme === 'dark' ? ' is-active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              {t(ui.themeDark)}
            </button>
            <button
              type="button"
              className={`lab__lang-btn${theme === 'light' ? ' is-active' : ''}`}
              onClick={() => setTheme('light')}
            >
              {t(ui.themeLight)}
            </button>
          </div>
          <div className="lab__lang" role="group" aria-label={t(ui.langAria)}>
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
      </div>
      {brand ? <p className="lab__tagline">{t(ui.labTagline)}</p> : <h1>{title}</h1>}
      {!brand ? <p className="lab__goal">{goal}</p> : null}
      <nav className="lab__nav" aria-label={t(ui.navAria)}>
        {nav}
      </nav>
    </header>
  )
}
