import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { AppChrome } from '../home/AppChrome'
import { LessonChips, LessonRefText } from '../home/LessonRefText'
import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'
import { LESSON_TITLE } from '../modules/titles'
import { lessonCode, resolveLessonRefs, trackById } from '../tracks/catalog'
import { TERMS, type GlossaryTerm } from './terms'
import './glossary.css'

export type GlossaryPageProps = {
  termId?: string
  /** 选中（或清除）一个词条；replace = true 时不新增历史记录 */
  onSelect: (termId: string | undefined, replace?: boolean) => void
  onHome: () => void
  onOpenLesson: (id: ModuleId) => void
}

const G = {
  intro: loc(
    '每个词只完整写一次：主词条放在它第一次出现的那一课下面，并列出所有出处；其它课只列名字，点一下跳到主词条。词条右上角的 # 是这个词的固定地址，可以直接分享。',
    'Each term is written out once: the main entry sits under the first lesson that uses it and lists every source; other lessons show only the name, which jumps to the main entry. The # at the top right of an entry is its permanent address for sharing.',
  ),
  search: loc('搜索术语：中文、英文都可以，例如 Strobe、漏电、D04', 'Search terms in English or Chinese, e.g. strobe, leakage, D04'),
  searchAria: loc('搜索术语', 'Search terms'),
  viewAria: loc('术语表视图', 'Glossary view'),
  byLesson: loc('按课程', 'By lesson'),
  az: loc('A–Z', 'A–Z'),
  total: loc('共 {n} 条', '{n} terms'),
  matched: loc('匹配 {m} / {n} 条', '{m} of {n} terms match'),
  empty: loc('没有匹配的术语。换个说法试试，或者到常见问题里找找。', 'No matching terms. Try another wording, or look in the FAQ.'),
  goLesson: loc('去这一课 →', 'Open lesson →'),
  see: loc('见', 'see'),
  sources: loc('出处：', 'Sources:'),
  linkAria: loc('这个词条的地址：', 'Link to this entry: '),
  lettersAria: loc('按首字母跳转', 'Jump to letter'),
}

const VIEWS = [
  { id: 'lesson', label: G.byLesson },
  { id: 'az', label: G.az },
] as const

type ViewId = (typeof VIEWS)[number]['id']

/** 分组顺序：先 D 轨，再 F 轨 */
const LESSON_ORDER: ModuleId[] = [
  ...new Set([...(trackById('digital')?.lessons ?? []), ...(trackById('fund')?.lessons ?? [])]),
]

const rank = (id: ModuleId) => {
  const index = LESSON_ORDER.indexOf(id)
  return index < 0 ? Number.MAX_SAFE_INTEGER : index
}

const sortedLessons = (term: GlossaryTerm) => [...term.lessons].sort((a, b) => rank(a) - rank(b))
const homeOf = (term: GlossaryTerm) => sortedLessons(term)[0]

const TERM_IDS = new Set(TERMS.map((term) => term.id))

const letterOf = (term: GlossaryTerm) => {
  const first = term.term.trim().charAt(0).toUpperCase()
  return first >= 'A' && first <= 'Z' ? first : '#'
}

const byTerm = (a: GlossaryTerm, b: GlossaryTerm) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' })

function haystack(term: GlossaryTerm) {
  return [
    term.id,
    term.term,
    term.name.zh,
    term.name.en ?? '',
    resolveLessonRefs(term.def.zh),
    resolveLessonRefs(term.def.en ?? ''),
    ...term.lessons.map(lessonCode),
  ]
    .join('\n')
    .toLowerCase()
}

const HAYSTACK = new Map(TERMS.map((term) => [term.id, haystack(term)]))

export function GlossaryPage({ termId, onSelect, onHome, onOpenLesson }: GlossaryPageProps) {
  const { t } = useLocale()
  const track = trackById('glossary')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewId>(VIEWS[0].id)
  const target = termId && TERM_IDS.has(termId) ? termId : undefined
  const pendingScroll = useRef(false)

  // 地址里的词条不存在：回到术语表首页，不留下这条历史
  useEffect(() => {
    if (termId && !TERM_IDS.has(termId)) onSelect(undefined, true)
  }, [termId, onSelect])

  // 深链接：清掉搜索，保证目标词条一定渲染出来，再滚过去
  useEffect(() => {
    if (!target) return
    setQuery('')
    pendingScroll.current = true
  }, [target])

  useEffect(() => {
    if (!pendingScroll.current || !target) return
    const el = document.getElementById(`g-${target}`)
    if (!el) return
    pendingScroll.current = false
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  })

  const q = query.trim().toLowerCase()
  const shown = useMemo(() => (q ? TERMS.filter((term) => HAYSTACK.get(term.id)?.includes(q)) : TERMS), [q])

  const card = (term: GlossaryTerm) => {
    const showEn = term.name.en && term.name.en.toLowerCase() !== term.term.toLowerCase()
    return (
      <article key={term.id} id={`g-${term.id}`} className={`gl-term${target === term.id ? ' is-target' : ''}`}>
        <header className="gl-term__head">
          <h3 className="gl-term__name">{term.term}</h3>
          <span className="gl-term__zh">{term.name.zh}</span>
          {showEn ? <span className="gl-term__en">{term.name.en}</span> : null}
          <a
            className="gl-term__link"
            href={`#/glossary/${term.id}`}
            aria-label={`${t(G.linkAria)}${term.term}`}
            title={`#/glossary/${term.id}`}
          >
            #
          </a>
        </header>
        <p className="gl-term__def">
          <LessonRefText text={term.def} onOpenLesson={onOpenLesson} />
        </p>
        <LessonChips label={G.sources} lessons={sortedLessons(term)} onOpenLesson={onOpenLesson} />
      </article>
    )
  }

  const byLesson = LESSON_ORDER.map((lessonId) => {
    const inLesson = shown.filter((term) => term.lessons.includes(lessonId))
    if (inLesson.length === 0) return null
    const mains = inLesson.filter((term) => homeOf(term) === lessonId)
    const refs = inLesson.filter((term) => homeOf(term) !== lessonId).sort(byTerm)
    return (
      <section key={lessonId} className="intro__section gl-group">
        <header className="gl-group__head">
          <h2>
            <span className="gl-code">{lessonCode(lessonId)}</span>
            {t(LESSON_TITLE[lessonId])}
          </h2>
          <button type="button" className="lab__btn gl-group__go" onClick={() => onOpenLesson(lessonId)}>
            {t(G.goLesson)}
          </button>
        </header>
        {mains.length > 0 ? <div className="gl-list">{mains.map(card)}</div> : null}
        {refs.length > 0 ? (
          <div className="gl-refs">
            {refs.map((term) => (
              <button key={term.id} type="button" className="gl-ref" onClick={() => onSelect(term.id)}>
                <strong>{term.term}</strong>
                <span>{term.name.zh}</span>
                <em>
                  {t(G.see)} {lessonCode(homeOf(term))}
                </em>
              </button>
            ))}
          </div>
        ) : null}
      </section>
    )
  })

  const sorted = [...shown].sort(byTerm)
  const letters = [...new Set(sorted.map(letterOf))]
  const az = (
    <section className="intro__section gl-az">
      <nav className="gl-letters" aria-label={t(G.lettersAria)}>
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            className="gl-letter"
            onClick={() => document.getElementById(`gl-letter-${letter}`)?.scrollIntoView({ block: 'start' })}
          >
            {letter}
          </button>
        ))}
      </nav>
      {letters.map((letter) => (
        <Fragment key={letter}>
          <h2 id={`gl-letter-${letter}`} className="gl-letter-head">
            {letter}
          </h2>
          <div className="gl-list">{sorted.filter((term) => letterOf(term) === letter).map(card)}</div>
        </Fragment>
      ))}
    </section>
  )

  const count = q
    ? t(G.matched).replace('{m}', String(shown.length)).replace('{n}', String(TERMS.length))
    : t(G.total).replace('{n}', String(TERMS.length))

  return (
    <AppChrome title={t(track?.title ?? G.az)} goal={t(track?.blurb ?? G.intro)} onHome={onHome} active="glossary">
      <section className="intro__section gl-top">
        <p className="intro__note">{t(G.intro)}</p>
        <div className="tool-bar">
          <input
            type="search"
            className="tool-search"
            value={query}
            placeholder={t(G.search)}
            aria-label={t(G.searchAria)}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="lab__modes" role="group" aria-label={t(G.viewAria)}>
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`lab__mode${view === item.id ? ' is-active' : ''}`}
                aria-pressed={view === item.id}
                onClick={() => setView(item.id)}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
          <span className="tool-count" aria-live="polite">
            {count}
          </span>
        </div>
      </section>
      {shown.length === 0 ? (
        <section className="intro__section">
          <p className="tool-empty">{t(G.empty)}</p>
        </section>
      ) : view === 'lesson' ? (
        byLesson
      ) : (
        az
      )}
    </AppChrome>
  )
}
