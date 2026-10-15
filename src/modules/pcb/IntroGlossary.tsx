import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { type Locale } from '../../i18n/locale'
import { type ModuleId } from '../catalog'
import { Seg } from '../fund/parts'
import { LESSON_TITLE } from '../titles'
import { CATS, S, TERMS, type CatId, type Term } from './data/pcbIntro'
import '../prep/prep.css'
import './pcbIntro.css'

/** 英文界面里，中文名前面的缩写（PCB、ENIG…）补回来，避免只剩一长串英文全称 */
function termName(term: Term, locale: Locale): string {
  if (locale === 'zh') {
    return term.zh
  }
  const m = /^([A-Za-z][A-Za-z0-9-]*)\s/.exec(term.zh)
  if (!m || term.en.toLowerCase().startsWith(m[1].toLowerCase())) {
    return term.en
  }
  return `${m[1]} · ${term.en}`
}

const haystack = (term: Term) => [term.zh, term.en, term.def.zh, term.def.en ?? ''].join(' ').toLowerCase()

export function IntroGlossary({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  const { t, locale } = useLocale()
  const [cat, setCat] = useState<CatId>(CATS[0].id)
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const rows = TERMS.filter((term) => (cat === 'all' || term.cat === cat) && (needle === '' || haystack(term).includes(needle)))
  const count = t(S.count).replace('{m}', String(rows.length)).replace('{n}', String(TERMS.length))
  return (
    <>
      <input
        type="search"
        className="pcbIntro-search"
        value={query}
        placeholder={t(S.search)}
        aria-label={t(S.searchAria)}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div role="group" aria-label={t(S.catAria)}>
        <Seg options={CATS} value={cat} onChange={setCat} />
      </div>
      <p className="pcbIntro-count" aria-live="polite">
        {count}
      </p>
      <div className="pcbIntro-scroll">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.colTerm)}</th>
              <th>{t(S.colDef)}</th>
              <th>{t(S.colLesson)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((term) => {
              const ref = `{@${term.lesson}}`
              return (
                <tr key={term.zh}>
                  <td className="pcbIntro-name">
                    <b>{termName(term, locale)}</b>
                  </td>
                  <td>{t(term.def)}</td>
                  <td>
                    <LessonRefText text={{ zh: ref, en: ref }} onOpenLesson={onOpen} />
                    <span className="pcbIntro-lesson">{t(LESSON_TITLE[term.lesson])}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="prep-muted">{t(S.empty)}</p> : null}
    </>
  )
}
