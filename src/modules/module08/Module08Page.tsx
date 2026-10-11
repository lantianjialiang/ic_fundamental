import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { TimingScope } from '../timing/TimingScope'
import { DRIVE_LEAD, TH_MIN, TIMING, TIMING_MARKS, TPD, TSU_MIN, type TimingMark } from '../timing/glossary'
import {
  PERIOD_1,
  PERIOD_MAX,
  PERIOD_MIN,
  QUIZ,
  STROBE_MAX,
  TAKEAWAY,
  acPass,
  freqOf,
  strobeKind,
  type StrobeKind,
} from './data/content'

type Module08PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'strobe' } | { kind: 'mark'; id: TimingMark }

const PRESET: Record<StrobeKind, number> = { early: 4, window: 14, late: 23 }
/** 按时间先后排：太早 → 刚好 → 太晚；初始选第一个 */
const STROBE_OPTS: Array<{ id: StrobeKind; label: LText }> = [
  { id: 'early', label: ui.m08.early },
  { id: 'window', label: ui.m08.window },
  { id: 'late', label: ui.m08.late },
]
const CARDS = TIMING_MARKS.map((id) => ({ id, title: TIMING[id].title, text: TIMING[id].text }))
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export function Module08Page({ moduleId, onModuleChange }: Module08PageProps) {
  const { t } = useLocale()
  const [strobe, setStrobe] = useState(PRESET[STROBE_OPTS[0].id])
  const [period, setPeriod] = useState(PERIOD_MAX)
  const [mark, setMark] = useState<TimingMark>(CARDS[0].id)
  const [focus, setFocus] = useState<Focus>({ kind: 'strobe' })

  const kind = strobeKind(strobe)
  const strobeOk = kind === 'window'
  const capS1 = kind === 'early' ? ui.m08.capEarly : kind === 'late' ? ui.m08.capLate : ui.m08.capOk

  const pass = acPass(period)
  const win = period - TPD
  const strobe2 = (TPD + period) / 2
  const capS2 = `Period ${fmt(period)} ns · ${t(ui.m08.outWin)} ${fmt(Math.max(win, 0))} ns · ${t(pass ? ui.m08.capPass : ui.m08.capFail)}`

  const aside =
    focus.kind === 'strobe'
      ? { kicker: t(ui.m08.kickerStrobe), title: t(ui.m08.strobeAsideTitle), text: t(ui.m08.strobeAside) }
      : { kicker: t(ui.m08.kickerMark), title: t(TIMING[focus.id].title), text: t(TIMING[focus.id].text) }

  const verdict = (ok: boolean) => ({
    label: ui.m08.verdict,
    value: t(ok ? ui.m08.pass : ui.m08.fail),
    state: ok ? ('pass' as const) : ('fail' as const),
  })

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m08.title)}
      goal={t(ui.m08.goal)}
      kicker={aside.kicker}
      asideTitle={aside.title}
      asideText={aside.text}
      asideLater={t(ui.m08.asideLater)}
      nextId="vector"
      nextLabel={t(ui.m08.next)}
    >
      <Section title={t(ui.m08.introTitle)}>
        <p>{t(ui.m08.introBody)}</p>
      </Section>

      <Section title={t(ui.m08.s1Title)} note={t(ui.m08.s1Note)}>
        <Seg
          options={STROBE_OPTS}
          value={kind}
          onChange={(id) => {
            setStrobe(PRESET[id])
            setFocus({ kind: 'strobe' })
          }}
        />
        <TimingScope
          period={PERIOD_1}
          strobe={strobe}
          strobeOk={strobeOk}
          labelWindow
          marks={['tpd']}
          active="tpd"
          caption={t(capS1)}
        />
        <div className="wave">
          <Knob
            label={ui.m08.strobePos}
            value={strobe}
            unit="ns"
            min={0}
            max={STROBE_MAX}
            step={0.5}
            onChange={(v) => {
              setStrobe(v)
              setFocus({ kind: 'strobe' })
            }}
          />
        </div>
        <Readout
          items={[
            { label: ui.m08.strobePos, value: `${fmt(strobe)} ns` },
            { label: ui.m08.winRange, value: `${TPD} – ${PERIOD_1} ns` },
            verdict(strobeOk),
          ]}
        />
      </Section>

      <Section title={t(ui.m08.s2Title)} note={t(ui.m08.s2Note)}>
        <Cards
          items={CARDS}
          activeId={mark}
          cols={4}
          onPick={(item) => {
            setMark(item.id)
            setFocus({ kind: 'mark', id: item.id })
          }}
        />
        <TimingScope
          period={period}
          strobe={strobe2}
          strobeOk={pass}
          marks={TIMING_MARKS}
          active={mark}
          caption={capS2}
        />
        <div className="wave">
          <Knob
            label={ui.m08.period}
            value={period}
            unit="ns"
            min={PERIOD_MIN}
            max={PERIOD_MAX}
            step={0.5}
            onChange={(v) => {
              setPeriod(v)
              setMark('period')
              setFocus({ kind: 'mark', id: 'period' })
            }}
          />
        </div>
        <Readout
          items={[
            { label: ui.m08.freq, value: `${freqOf(period).toFixed(0)} MHz` },
            { label: ui.m08.outWin, value: `${fmt(Math.max(win, 0))} ns`, state: pass ? 'pass' : 'fail' },
            { label: ui.m08.tsuGiven, value: `${DRIVE_LEAD} / ≥${TSU_MIN} ns` },
            { label: ui.m08.thGiven, value: `${fmt(period - DRIVE_LEAD)} / ≥${TH_MIN} ns` },
            verdict(pass),
          ]}
        />
        <p className="intro__note">{t(ui.m08.marginNote)}</p>
        <Callout>{t(ui.m08.searchNote)}</Callout>
      </Section>

      <Section title={t(ui.m08.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m08.quizTitle)} note={t(ui.m08.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m08.yes)} no={t(ui.m08.no)} />
      </Section>
    </LessonFrame>
  )
}
