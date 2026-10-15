import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import {
  HUNT,
  NET_ROWS,
  NET_TEXT,
  REF_ROWS,
  REF_TEXT,
  S,
  SOURCES,
  SYMBOL_RULES,
  WHY_FOOTPRINT,
  type HuntId,
  type RuleTab,
} from './data/pcbFlow'
import { SymbolFig } from './FlowFigs'
import { HuntFig } from './FlowFigs2'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

const TABS: Array<{ id: RuleTab; label: typeof S.tabSymbol }> = [
  { id: 'symbol', label: S.tabSymbol },
  { id: 'ref', label: S.tabRef },
  { id: 'net', label: S.tabNet },
]

export function RulesSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [tab, setTab] = useState<RuleTab>(TABS[0].id)
  const noteFor = (id: RuleTab): PrepNote => {
    const label = TABS.find((x) => x.id === id) ?? TABS[0]
    const text = id === 'symbol' ? SYMBOL_RULES[0] : id === 'ref' ? REF_TEXT : NET_TEXT
    return { kicker: S.kickerRule, title: label.label, text }
  }
  return (
    <Section title={t(S.ruleTitle)} note={t(S.ruleNote)}>
      <Seg
        options={TABS}
        value={tab}
        onChange={(id) => {
          setTab(id)
          setNote(noteFor(id))
        }}
      />
      {tab === 'symbol' ? (
        <>
          <SymbolFig />
          <Callout>
            <ul>
              {SYMBOL_RULES.map((rule) => (
                <li key={rule.zh}>
                  <RefP text={rule} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          </Callout>
        </>
      ) : null}
      {tab === 'ref' ? (
        <>
          <div className="prep-table-wrap">
            <table className="prep-table">
              <thead>
                <tr>
                  <th>{t(S.colPrefix)}</th>
                  <th>{t(S.colPart)}</th>
                  <th>{t(S.colExample)}</th>
                </tr>
              </thead>
              <tbody>
                {REF_ROWS.map((row) => (
                  <tr key={row.prefix}>
                    <td>
                      <b>{row.prefix}</b>
                    </td>
                    <td>{t(row.part)}</td>
                    <td>{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn">
            <RefP text={REF_TEXT} onOpen={onOpen} />
          </Callout>
        </>
      ) : null}
      {tab === 'net' ? (
        <>
          <div className="prep-table-wrap">
            <table className="prep-table">
              <thead>
                <tr>
                  <th>{t(S.colKind)}</th>
                  <th>{t(S.colGood)}</th>
                  <th>{t(S.colBad)}</th>
                  <th>{t(S.colWhy)}</th>
                </tr>
              </thead>
              <tbody>
                {NET_ROWS.map((row) => (
                  <tr key={row.good}>
                    <td>{t(row.kind)}</td>
                    <td>
                      <b>{row.good}</b>
                    </td>
                    <td>{row.bad}</td>
                    <td>{t(row.why)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn">
            <RefP text={NET_TEXT} onOpen={onOpen} />
          </Callout>
        </>
      ) : null}
      <Related ids={['pParts', 'pcbBasics']} onOpen={onOpen} />
    </Section>
  )
}

export function HuntSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [seen, setSeen] = useState<HuntId[]>([])
  const [showAll, setShowAll] = useState(false)
  const [last, setLast] = useState<HuntId | null>(null)
  const issues = HUNT.filter((h) => h.issue)
  const found = issues.filter((h) => showAll || seen.includes(h.id)).length
  const item = HUNT.find((h) => h.id === last)
  const pick = (id: HuntId) => {
    const hit = HUNT.find((h) => h.id === id)
    setSeen((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setLast(id)
    if (hit) {
      setNote({ kicker: S.kickerHunt, title: hit.title, text: hit.text })
    }
  }
  return (
    <Section title={t(S.huntTitle)} note={t(S.huntNote)}>
      <HuntFig seen={seen} showAll={showAll} last={last} onPick={pick} />
      <div className="pcbFlow-actions">
        <span className="pcbFlow-found">
          {t(S.found)} <b>{`${found} / ${issues.length}`}</b>
        </span>
        <button type="button" className="lab__btn" onClick={() => setShowAll(true)}>
          {t(S.showAll)}
        </button>
        <button
          type="button"
          className="lab__btn"
          onClick={() => {
            setSeen([])
            setShowAll(false)
            setLast(null)
          }}
        >
          {t(S.resetHunt)}
        </button>
      </div>
      <Callout tone={item ? (item.issue ? 'bad' : 'ok') : undefined}>
        {item ? (
          <>
            <p>
              <b>{t(item.title)}</b>
            </p>
            <RefP text={item.text} onOpen={onOpen} />
          </>
        ) : (
          <p>{t(S.huntIdle)}</p>
        )}
        {found === issues.length ? <p>{t(S.huntDone)}</p> : null}
      </Callout>
      <Related ids={['pDigital', 'pcbLayout']} onOpen={onOpen} />
    </Section>
  )
}

export function SourceSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [id, setId] = useState<string>(SOURCES[0].id)
  const item = SOURCES.find((s) => s.id === id) ?? SOURCES[0]
  return (
    <Section title={t(S.sourceTitle)} note={t(S.sourceNote)}>
      <Cards
        items={SOURCES}
        activeId={id}
        onPick={(s) => {
          setId(s.id)
          setNote({ kicker: S.kickerSource, title: s.title, text: s.text })
        }}
      />
      <Callout>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={item.text} onOpen={onOpen} />
        <p>
          <b>{t(S.pros)}</b>
          {t(item.pros)}
        </p>
        <p>
          <b>{t(S.cons)}</b>
          {t(item.cons)}
        </p>
      </Callout>
      <Callout tone="warn">
        <p>
          <b>{t(S.whyTitle)}</b>
        </p>
        <RefParas paras={WHY_FOOTPRINT} onOpen={onOpen} />
      </Callout>
      <Related ids={['pPackage', 'spec', 'pcbDfm']} onOpen={onOpen} />
    </Section>
  )
}
