import { useEffect } from 'react'
import { AppChrome } from '../home/AppChrome'
import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { trackById } from '../tracks/catalog'
import { CATS, TOOLS } from './catalog'
import type { ToolsPageProps } from './pageProps'
import './tools.css'

export type { ToolsPageProps }

export function ToolsPage({ toolId, onSelect, onHome, onOpenLesson }: ToolsPageProps) {
  const { t } = useLocale()
  const track = trackById('tools')
  const active = TOOLS.find((tool) => tool.id === toolId) ?? TOOLS[0]
  const Panel = active.panel

  useEffect(() => {
    if (toolId && !TOOLS.some((tool) => tool.id === toolId)) onSelect(undefined, true)
  }, [toolId, onSelect])

  return (
    <AppChrome title={t(track?.title ?? TOOLS[0].title)} goal={t(track?.blurb ?? TOOLS[0].title)} onHome={onHome} active="tools">
      <div className="tools-layout">
        <nav className="tools-nav" aria-label={t(loc('选择工具', 'Choose a tool'))}>
          {CATS.map((cat) => (
            <div key={cat.id} className="tools-nav__group">
              <p className="tools-nav__cat">{t(cat.title)}</p>
              {TOOLS.filter((tool) => tool.cat === cat.id).map((tool) => (
                <a
                  key={tool.id}
                  className={tool.id === active.id ? 'is-active' : ''}
                  aria-current={tool.id === active.id ? 'page' : undefined}
                  href={"#/tools/" + tool.id}
                >
                  {t(tool.title)}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <section className="intro__section tools-panel">
          <h2>{t(active.title)}</h2>
          <Panel onOpenLesson={onOpenLesson} />
        </section>
      </div>
    </AppChrome>
  )
}
