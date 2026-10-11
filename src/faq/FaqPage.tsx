import { useEffect, useMemo, useRef, useState } from 'react'
import { AppChrome } from '../home/AppChrome'
import { LessonChips, LessonRefText } from '../home/LessonRefText'
import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { FeedbackLinks } from '../lab/Feedback'
import { type ModuleId } from '../modules/catalog'
import { lessonCode, resolveLessonRefs, trackById } from '../tracks/catalog'
import { FAQ_GROUPS, FAQ_ITEMS, type FaqItem } from './faq'
import './faq.css'

export type FaqPageProps = {
  faqId?: string
  /** 选中（或清除）一条问答；replace = true 时不新增历史记录 */
  onSelect: (faqId: string | undefined, replace?: boolean) => void
  onHome: () => void
  onOpenLesson: (id: ModuleId) => void
}

const T = {
  search: loc('搜索问题：中文、英文都可以，例如 Strobe、漏电、D04', 'Search questions in English or Chinese, e.g. strobe, leakage, D04'),
  searchAria: loc('搜索常见问题', 'Search the FAQ'),
  total: loc('共 {n} 条', '{n} questions'),
  matched: loc('匹配 {m} / {n} 条', '{m} of {n} questions match'),
  empty: loc('没有匹配的问题。可以换个说法，或者直接在页面底部提问。', 'No matching questions. Try another wording, or ask at the bottom of the page.'),
  expandAll: loc('全部展开', 'Expand all'),
  collapseAll: loc('全部收起', 'Collapse all'),
  related: loc('相关课程：', 'Related lessons:'),
  linkAria: loc('这条问答的地址：', 'Link to this question: '),
  askTitle: loc('我的问题不在这里', 'My question is not here'),
  askText: loc(
    '把问题发给我们：可以在 GitHub 提 Issue，也可以发邮件。链接会自动带上这个页面的信息。收到的问题会整理后补进这份 FAQ。',
    'Send us your question by GitHub issue or email; the links fill in this page’s details for you. Questions we receive are collected and added to this FAQ.',
  ),
  pageName: loc('常见问题', 'FAQ'),
}

const FAQ_IDS = new Set(FAQ_ITEMS.map((item) => item.id))
const FIRST_ID = FAQ_ITEMS[0]?.id

function haystack(item: FaqItem) {
  return [
    item.id,
    item.q.zh,
    item.q.en ?? '',
    resolveLessonRefs(item.a.zh),
    resolveLessonRefs(item.a.en ?? ''),
    ...item.lessons.map(lessonCode),
  ]
    .join('\n')
    .toLowerCase()
}

const HAYSTACK = new Map(FAQ_ITEMS.map((item) => [item.id, haystack(item)]))

export function FaqPage({ faqId, onSelect, onHome, onOpenLesson }: FaqPageProps) {
  const { t } = useLocale()
  const track = trackById('faq')
  const target = faqId && FAQ_IDS.has(faqId) ? faqId : undefined
  const [query, setQuery] = useState('')
  // 默认展开第一条；深链接进来时展开目标那一条
  const [open, setOpen] = useState<Set<string>>(() => new Set(target ? [target] : FIRST_ID ? [FIRST_ID] : []))
  const pendingScroll = useRef(false)

  // 地址里的问答不存在：回到 FAQ 首页，不留下这条历史
  useEffect(() => {
    if (faqId && !FAQ_IDS.has(faqId)) onSelect(undefined, true)
  }, [faqId, onSelect])

  useEffect(() => {
    if (!target) return
    setQuery('')
    setOpen((prev) => new Set(prev).add(target))
    pendingScroll.current = true
  }, [target])

  useEffect(() => {
    if (!pendingScroll.current || !target) return
    const el = document.getElementById(`faq-${target}`)
    if (!el) return
    pendingScroll.current = false
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  })

  const q = query.trim().toLowerCase()
  const shown = useMemo(() => (q ? FAQ_ITEMS.filter((item) => HAYSTACK.get(item.id)?.includes(q)) : FAQ_ITEMS), [q])
  const shownIds = new Set(shown.map((item) => item.id))
  const allOpen = shown.length > 0 && shown.every((item) => open.has(item.id))

  const onSearch = (value: string) => {
    setQuery(value)
    const next = value.trim().toLowerCase()
    const first = next ? FAQ_ITEMS.find((item) => HAYSTACK.get(item.id)?.includes(next)) : undefined
    // 搜索时默认展开第一条匹配
    if (first) setOpen((prev) => new Set(prev).add(first.id))
  }

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(shown.map((item) => item.id)))

  const count = q
    ? t(T.matched).replace('{m}', String(shown.length)).replace('{n}', String(FAQ_ITEMS.length))
    : t(T.total).replace('{n}', String(FAQ_ITEMS.length))

  return (
    <AppChrome title={t(track?.title ?? T.pageName)} goal={t(track?.blurb ?? T.askText)} onHome={onHome} active="faq">
      <section className="intro__section faq-top">
        <div className="tool-bar">
          <input
            type="search"
            className="tool-search"
            value={query}
            placeholder={t(T.search)}
            aria-label={t(T.searchAria)}
            onChange={(event) => onSearch(event.target.value)}
          />
          <button type="button" className="lab__btn" onClick={toggleAll} disabled={shown.length === 0}>
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
        FAQ_GROUPS.map((group) => {
          const items = group.items.filter((item) => shownIds.has(item.id))
          if (items.length === 0) return null
          return (
            <section key={group.id} className="intro__section faq-group">
              <h2 className="faq-group__title">{t(group.title)}</h2>
              {items.map((item) => {
                const isOpen = open.has(item.id)
                return (
                  <article
                    key={item.id}
                    id={`faq-${item.id}`}
                    className={`faq-item${isOpen ? ' is-open' : ''}${target === item.id ? ' is-target' : ''}`}
                  >
                    <h3 className="faq-item__q">
                      <button
                        type="button"
                        className="faq-item__toggle"
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${item.id}`}
                        onClick={() => toggle(item.id)}
                      >
                        <span className="faq-item__chev" aria-hidden="true">
                          ▸
                        </span>
                        {t(item.q)}
                      </button>
                      <a
                        className="faq-item__link"
                        href={`#/faq/${item.id}`}
                        aria-label={`${t(T.linkAria)}${t(item.q)}`}
                        title={`#/faq/${item.id}`}
                      >
                        #
                      </a>
                    </h3>
                    <div id={`faq-a-${item.id}`} className="faq-item__a" hidden={!isOpen}>
                      <p>
                        <LessonRefText text={item.a} onOpenLesson={onOpenLesson} />
                      </p>
                      <LessonChips label={T.related} lessons={item.lessons} onOpenLesson={onOpenLesson} />
                    </div>
                  </article>
                )
              })}
            </section>
          )
        })
      )}

      <section className="intro__section faq-ask">
        <h2>{t(T.askTitle)}</h2>
        <p>{t(T.askText)}</p>
        <FeedbackLinks page={t(T.pageName)} prefix="[Question]" />
      </section>
    </AppChrome>
  )
}
