import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { Copyright } from '../lab/Copyright'
import { LabHeader } from '../lab/LabHeader'

type AppChromeProps = {
  title: string
  goal: string
  onHome?: () => void
  children: ReactNode
}

export function AppChrome({ title, goal, onHome, children }: AppChromeProps) {
  const { t } = useLocale()

  const nav = onHome ? (
    <button type="button" className="lab__nav-item" onClick={onHome}>
      {t(ui.home.home)}
    </button>
  ) : null

  return (
    <div className="lab lab--scroll">
      <LabHeader title={title} goal={goal} nav={nav} />
      <div className="lab__body intro home-body">
        <main className="intro__main home">{children}</main>
      </div>
      <Copyright />
    </div>
  )
}
