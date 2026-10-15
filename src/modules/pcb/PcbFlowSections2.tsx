import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg, type ReadoutItem } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { CHECKS, CHECK_GROUPS, PIN_CASES, REVIEW_TEXT, S, type PinCase, type PinView } from './data/pcbFlow'
import { PinFig } from './FlowFigs3'
import { PIN_COUNT, allLandings, landing, wrongCount } from './flowPinModel'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }

const VIEWS: Array<{ id: PinView; label: typeof S.viewLib }> = [
  { id: 'lib', label: S.viewLib },
  { id: 'fixed', label: S.viewFixed },
]

export function PinSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [kase, setKase] = useState<PinCase>(PIN_CASES[0].id)
  const [view, setView] = useState<PinView>(VIEWS[0].id)
  const [pin, setPin] = useState(1)
  const item = PIN_CASES.find((c) => c.id === kase) ?? PIN_CASES[0]
  const l = landing(kase, view, pin)
  const wrong = wrongCount(kase, view)
  const noteFor = (c: PinCase, v: PinView): PrepNote => {
    const it = PIN_CASES.find((x) => x.id === c) ?? PIN_CASES[0]
    return { kicker: S.kickerPin, title: it.title, text: v === 'lib' ? it.lib : it.fixed }
  }
  const items: ReadoutItem[] = [
    { label: S.chipPin, value: `${l.pin.n} · ${l.pin.name}` },
    { label: S.landsOn, value: String(l.pad.num) },
    { label: S.padNet, value: l.pad.name },
  ]
  if (kase === 'qfn') {
    items.push({ label: S.offset, value: `${l.offsetMm.toFixed(3)} mm` })
    items.push({ label: S.overlap, value: `${Math.round(l.overlapPct)} %` })
  }
  items.push({ label: S.result, value: t(l.ok ? S.match : S.mismatch), state: l.ok ? 'pass' : 'fail' })
  items.push({ label: S.wrongPads, value: `${wrong} / ${PIN_COUNT[kase]}`, state: wrong === 0 ? 'pass' : 'fail' })
  return (
    <Section title={t(S.pinTitle)} note={t(S.pinNote)}>
      <Seg
        options={PIN_CASES.map((c) => ({ id: c.id, label: c.label }))}
        value={kase}
        onChange={(id) => {
          setKase(id)
          setPin(1)
          setNote(noteFor(id, view))
        }}
      />
      <Seg
        options={VIEWS}
        value={view}
        onChange={(id) => {
          setView(id)
          setNote(noteFor(kase, id))
        }}
      />
      <PinFig kase={kase} view={view} pin={pin} onPick={setPin} />
      <Readout items={items} />
      <Callout tone={allLandings(kase, view).every((x) => x.ok) ? 'ok' : 'bad'}>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={view === 'lib' ? item.lib : item.fixed} onOpen={onOpen} />
      </Callout>
      <Related ids={['pPackage', 'pParts', 'pcbBasics']} onOpen={onOpen} />
    </Section>
  )
}

export function ReviewSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [done, setDone] = useState<string[]>([])
  const total = CHECKS.length
  const pct = Math.round((done.length / total) * 100)
  const toggle = (id: string) => {
    const c = CHECKS.find((x) => x.id === id)
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    if (c) {
      setNote({ kicker: S.kickerReview, title: c.text, text: c.why })
    }
  }
  return (
    <Section title={t(S.reviewTitle)} note={t(S.reviewNote)}>
      <RefParas paras={REVIEW_TEXT} onOpen={onOpen} />
      <div className="pcbFlow-actions">
        <span className="pcbFlow-found">
          {t(S.progress)} <b>{`${done.length} / ${total}`}</b>
        </span>
        <button type="button" className="lab__btn" onClick={() => setDone([])}>
          {t(S.resetCheck)}
        </button>
      </div>
      <div className="pcbFlow-meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done.length} aria-label={t(S.progress)}>
        <span style={{ width: `${pct}%` }} />
      </div>
      {CHECK_GROUPS.map((g) => (
        <div key={g.id} className="pcbFlow-group">
          <h3>{t(g.title)}</h3>
          {CHECKS.filter((c) => c.group === g.id).map((c) => {
            const on = done.includes(c.id)
            return (
              <label key={c.id} className={`pcbFlow-check${on ? ' is-on' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
                <span>{t(c.text)}</span>
                <small>{t(c.why)}</small>
              </label>
            )
          })}
        </div>
      ))}
      <Callout tone={done.length === total ? 'ok' : 'warn'}>
        <p>{t(done.length === total ? S.checkDone : S.checkTodo)}</p>
      </Callout>
      <Related ids={['pcbDfm', 'pcbTools', 'pcbLayout']} onOpen={onOpen} />
    </Section>
  )
}
