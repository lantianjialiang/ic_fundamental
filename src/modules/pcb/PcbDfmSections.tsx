import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefP, Related, type PrepNote } from '../prep/common'
import { GROUPS, S, type CheckGroup, type GroupId } from './data/pcbDfm'
import { ERRORS, type ErrorId } from './data/pcbDfmErrors'
import { joinText, M } from './data/pcbDfmMore'
import { StageFig } from './DfmFigs'
import { BoardFig, ProbeFig } from './DfmFigs3'

export type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

export function Meter({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="pcbDfm-meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

export function CheckSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [ticked, setTicked] = useState<string[]>([])
  const [gid, setGid] = useState<GroupId>(GROUPS[0].id)
  const group = GROUPS.find((g) => g.id === gid) ?? GROUPS[0]
  const count = (g: CheckGroup) => g.items.filter((i) => ticked.includes(i.id)).length
  const done = GROUPS.reduce((acc, g) => ({ ...acc, [g.id]: count(g) }), {} as Record<GroupId, number>)
  const total = GROUPS.reduce((sum, g) => sum + g.items.length, 0)
  const all = GROUPS.reduce((sum, g) => sum + count(g), 0)

  const pickGroup = (id: GroupId) => {
    const g = GROUPS.find((x) => x.id === id)
    setGid(id)
    if (g) {
      setNote({ kicker: S.kickerCheck, title: g.title, text: g.text })
    }
  }
  const toggle = (id: string) => {
    const item = group.items.find((i) => i.id === id)
    setTicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    if (item) {
      setNote({ kicker: S.kickerCheck, title: item.text, text: item.why })
    }
  }

  return (
    <Section title={t(S.checkTitle)} note={t(S.checkNote)}>
      <StageFig active={gid} done={done} onPick={pickGroup} />
      <Callout>
        <p>
          <b>{t(group.title)}</b>
        </p>
        <p>{t(group.text)}</p>
        <RefP text={group.link} onOpen={onOpen} />
      </Callout>
      {gid === 'dft' ? <ProbeFig /> : null}
      <div className="pcbDfm-group">
        <div className="pcbDfm-actions">
          <span className="pcbDfm-found">
            {t(S.checkDone)} <b>{`${count(group)} / ${group.items.length}`}</b>
          </span>
          <button type="button" className="lab__btn" onClick={() => setTicked((prev) => prev.filter((x) => !group.items.some((i) => i.id === x)))}>
            {t(M.clearChecks)}
          </button>
        </div>
        <Meter done={count(group)} total={group.items.length} label={t(S.checkDone)} />
        {group.items.map((item) => {
          const on = ticked.includes(item.id)
          return (
            <label key={item.id} className={`pcbDfm-check${on ? ' is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
              <span>{t(item.text)}</span>
              <small>{t(item.why)}</small>
            </label>
          )
        })}
      </div>
      <p className="pcbDfm-found">
        {t(S.total)} <b>{`${all} / ${total}`}</b>
      </p>
      <Meter done={all} total={total} label={t(S.total)} />
      <Callout tone={count(group) === group.items.length ? 'ok' : 'warn'}>
        <p>{t(count(group) === group.items.length ? M.groupDone : M.groupTodo)}</p>
      </Callout>
      <Related ids={['pcbFab', 'pcbSupply', 'pcbStack', 'pcbBasics']} onOpen={onOpen} />
    </Section>
  )
}

export function ErrorSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [seen, setSeen] = useState<ErrorId[]>([])
  const [showAll, setShowAll] = useState(false)
  const [last, setLast] = useState<ErrorId | null>(null)
  const total = ERRORS.length
  const found = showAll ? total : seen.length
  const item = ERRORS.find((e) => e.id === last)
  const no = item ? ERRORS.indexOf(item) + 1 : 0

  const pick = (id: ErrorId) => {
    const hit = ERRORS.find((e) => e.id === id)
    setSeen((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setLast(id)
    if (hit) {
      setNote({ kicker: S.kickerError, title: hit.title, text: joinText([S.cause, hit.cause, S.effect, hit.effect, S.fix, hit.fix]) })
    }
  }

  return (
    <Section title={t(S.errorTitle)} note={t(S.errorNote)}>
      <BoardFig seen={seen} showAll={showAll} last={last} onPick={pick} />
      <div className="pcbDfm-actions">
        <span className="pcbDfm-found">
          {t(S.found)} <b>{`${found} / ${total}`}</b>
        </span>
        <button type="button" className="lab__btn" onClick={() => setShowAll(true)}>
          {t(S.reveal)}
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
          {t(S.reset)}
        </button>
      </div>
      <Callout tone={item ? 'bad' : undefined}>
        {item ? (
          <>
            <p>
              <b>{`${no}. ${t(item.title)}`}</b>
            </p>
            <dl className="pcbDfm-detail">
              <dt>{t(S.cause)}</dt>
              <dd>{t(item.cause)}</dd>
              <dt>{t(S.effect)}</dt>
              <dd>{t(item.effect)}</dd>
              <dt>{t(S.fix)}</dt>
              <dd>{t(item.fix)}</dd>
              <dt>{t(S.caught)}</dt>
              <dd>{t(item.caught)}</dd>
            </dl>
          </>
        ) : (
          <p>{t(M.errorIdle)}</p>
        )}
        {found === total ? <p>{t(S.allFound)}</p> : null}
      </Callout>
      {found === total ? (
        <div className="prep-table-wrap">
          <table className="prep-table">
            <caption>{t(M.errorTable)}</caption>
            <thead>
              <tr>
                <th>{t(M.colNo)}</th>
                <th>{t(M.colError)}</th>
                <th>{t(M.colFix)}</th>
              </tr>
            </thead>
            <tbody>
              {ERRORS.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>
                  <td>
                    <b>{t(e.title)}</b>
                  </td>
                  <td>{t(e.fix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Related ids={['pcbFlow', 'pcbBasics', 'pcbTools', 'pcbSupply']} onOpen={onOpen} />
    </Section>
  )
}
