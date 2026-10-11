import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { ui } from '../i18n/ui'
import { Copyright } from '../lab/Copyright'
import { LabHeader } from '../lab/LabHeader'
import { trackById } from '../tracks/catalog'
import './extras.css'

type AppChromeProps = {
  title: string
  goal: string
  onHome?: () => void
  /** 当前是术语表或 FAQ 页时，顶部对应的链接高亮 */
  active?: 'glossary' | 'faq'
  /** 首页显示大号站点图标 */
  brand?: boolean
  children: ReactNode
}

const TOOL_LINKS = [
  { id: 'glossary', href: '#/glossary' },
  { id: 'faq', href: '#/faq' },
] as const

export function AppChrome({ title, goal, onHome, active, brand, children }: AppChromeProps) {
  const { t } = useLocale()

  const nav = (
    <>
      {onHome ? (
        <>
          <button type="button" className="lab__nav-item" onClick={onHome}>
            {t(ui.home.home)}
          </button>
          <span className="lab__nav-sep" aria-hidden="true" />
        </>
      ) : null}
      {TOOL_LINKS.map((link) => {
        const track = trackById(link.id)
        if (!track) return null
        return (
          <a
            key={link.id}
            href={link.href}
            className={`lab__nav-item app-tool-link${active === link.id ? ' is-active' : ''}`}
            aria-current={active === link.id ? 'page' : undefined}
          >
            {t(track.title)}
          </a>
        )
      })}
    </>
  )

  return (
    <div className="lab lab--scroll">
      <LabHeader title={title} goal={goal} nav={nav} brand={brand} />
      <div className="lab__body intro home-body">
        <main className="intro__main home">{children}</main>
      </div>
      <Copyright page={title} />
    </div>
  )
}
