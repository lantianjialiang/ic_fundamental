import { useEffect, useMemo, useRef, useState } from 'react'
import { AppChrome } from '../home/AppChrome'
import { LessonChips, LessonRefText } from '../home/LessonRefText'
import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'
import { lessonCode, resolveLessonRefs, trackById } from '../tracks/catalog'
import { CHANGELOG, type ChangeEntry } from './log'
import '../faq/faq.css'
import './changelog.css'

export type ChangelogPageProps = {
  entryId?: string
  onSelect: (entryId: string | undefined, replace?: boolean) => void
  onHome: () => void
  onOpenLesson: (id: ModuleId) => void
}

const T = {
  search: loc('搜索更新：中文、英文或日期，例如 基板、socket、2026-10', 'Search updates in English or Chinese, or by date, e.g. substrate, socket, 2026-10'),
  searchAria: loc('搜索更新日志', 'Search the changelog'),
  total: loc('共 {n} 条', '{n} entries'),
  matched: loc('匹配 {m} / {n} 条', '{m} of {n} entries match'),
  empty: loc('没有匹配的更新。', 'No matching updates.'),
  expandAll: loc('全部展开', 'Expand all'),
  collapseAll: loc('全部收起', 'Collapse all'),
  related: loc('相关课程：', 'Related lessons:'),
  linkAria: loc('这条更新的地址：', 'Link to this entry: '),
  note: loc(
    '新的在前。每一条是一次学生能看到的修改。2026-09-24 之后的旧记录按 git 提交整理；更早的没有进版本库。',
    'Newest first. Each entry is one change students can see. Older entries after 2026-09-24 are taken from git commits; anything earlier was not in the repository.',
  ),
  pageName: loc('更新日志', 'Changelog'),
}

const IDS = new Set(CHANGELOG.map((item) => item.id))
const FIRST_ID = CHANGELOG[0]?.id

function haystack(item: ChangeEntry) {
  return [item.id, item.date, item.title.zh, item.title.en ?? '', resolveLessonRefs(item.body.zh), resolveLessonRefs(item.body.en ?? ''), ...item.lessons.map(lessonCode)]
    .join('\n')
    .toLowerCase()
}

const HAYSTACK = new Map(CHANGELOG.map((item) => [item.id, haystack(item)]))

export function ChangelogPage({ entryId, onSelect, onHome, onOpenLesson }: ChangelogPageProps) {
  const { t } = useLocale()
  const track = trackById('changelog')
  const target = entryId && IDS.has(entryId) ? entryId : undefined
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Set<string>>(() => new Set(target ? [target] : FIRST_ID ? [FIRST_ID] : []))
  const pendingScroll = useRef(false)

  useEffect(() => {
    if (entryId && !IDS.has(entryId)) onSelect(undefined, true)
  }, [entryId, onSelect])

  useEffect(() => {
    if (!target) return
    setQuery('')
    setOpen((prev) => new Set(prev).add(target))
    pendingScroll.current = true
  }, [target])

  useEffect(() => {
    if (!pendingScroll.current || !target) return
    const el = document.getElementById(`log-${target}`)
    if (!el) return
    pendingScroll.current = false
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  })

  const q = query.trim().toLowerCase()
  const shown = useMemo(() => (q ? CHANGELOG.filter((item) => HAYSTACK.get(item.id)?.includes(q)) : CHANGELOG), [q])
  const allOpen = shown.length > 0 && shown.every((item) => open.has(item.id))

  const onSearch = (value: string) => {
    setQuery(value)
    const next = value.trim().toLowerCase()
    const first = next ? CHANGELOG.find((item) => HAYSTACK.get(item.id)?.includes(next)) : undefined
    if (first) setOpen((prev) => new Set(prev).add(first.id))
  }

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = q
    ? t(T.matched).replace('{m}', String(shown.length)).replace('{n}', String(CHANGELOG.length))
    : t(T.total).replace('{n}', String(CHANGELOG.length))

  return (
    <AppChrome title={t(track?.title ?? T.pageName)} goal={t(track?.blurb ?? T.note)} onHome={onHome} active="changelog">
      <section className="intro__section faq-top">
        <p>{t(T.note)}</p>
        <div className="tool-bar">
          <input
            type="search"
            className="tool-search"
            value={query}
            placeholder={t(T.search)}
            aria-label={t(T.searchAria)}
            onChange={(event) => onSearch(event.target.value)}
          />
          <button type="button" className="lab__btn" onClick={() => setOpen(allOpen ? new Set() : new Set(shown.map((item) => item.id)))} disabled={shown.length === 0}>
            {t(allOpen ? T.collapseAll : T.expandAll)}
          </button>
          <span className="tool-count" aria-live="polite">
            {count}
          </span>
        </div>
      </section>
      {shown.length === 0 ? (
        <section className="intro__section">
          <p className="tool-empty">{t(T.empty)}</p>
        </section>
      ) : (
        <section className="intro__section">
          {shown.map((item) => {
            const isOpen = open.has(item.id)
            return (
              <article key={item.id} id={`log-${item.id}`} className={`faq-item${isOpen ? ' is-open' : ''}${target === item.id ? ' is-target' : ''}`}>
                <h3 className="faq-item__q">
                  <button type="button" className="faq-item__toggle" aria-expanded={isOpen} aria-controls={`log-a-${item.id}`} onClick={() => toggle(item.id)}>
                    <span className="faq-item__chev" aria-hidden="true">
                      ▸
                    </span>
                    <time className="log-date" dateTime={item.date}>
                      {item.date}
                    </time>
                    {t(item.title)}
                  </button>
                  <a className="faq-item__link" href={`#/changelog/${item.id}`} aria-label={`${t(T.linkAria)}${t(item.title)}`} title={`#/changelog/${item.id}`}>
                    #
                  </a>
                </h3>
                <div id={`log-a-${item.id}`} className="faq-item__a" hidden={!isOpen}>
                  <p>
                    <LessonRefText text={item.body} onOpenLesson={onOpenLesson} />
                  </p>
                  {item.lessons.length > 0 ? <LessonChips label={T.related} lessons={item.lessons} onOpenLesson={onOpenLesson} /> : null}
                </div>
              </article>
            )
          })}
        </section>
      )}
    </AppChrome>
  )
}
