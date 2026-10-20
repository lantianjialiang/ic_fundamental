import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import './memPattern.css'
import './memTiming.css'
import { ShmooFig, WaveFig } from './TimingFig'
import { DEFAULT_TIMING, DEVICE_OPTIONS, PERIOD_OPTIONS_NS, analyseTiming, bisectEdge, tAAOf, windowOf, type TimingState } from './memTimingModel'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, fmt, taskItems, verdictOf } from './memTimingData'
import { MEM_META } from './meta'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** Seg 的 id 必须是字符串：周期用字符串 id，状态里仍存数字 */
const PERIOD_CHOICES: Array<{ id: string; label: LText }> = PERIOD_OPTIONS_NS.map((p) => ({
  id: String(p),
  label: loc(`${fmt(p)} ns`, `${fmt(p)} ns`),
}))

export function MemTimingPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<TimingState>(DEFAULT_TIMING)
  const tAA = tAAOf(state.device)
  const win = windowOf(tAA, state.period)
  const analysis = analyseTiming(state)
  const bis = useMemo(() => bisectEdge(tAA, state.period), [tAA, state.period])
  const verdict = verdictOf(state)
  const maxError = state.period / 2 ** bis.trace.length

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memTiming.title)}
      goal={t(MEM_META.memTiming.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memDram"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(DEFAULT_TIMING)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memRw', 'memDram', 'hsTiming']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mtim-controls">
          <div className="mtim-field">
            <span className="mtim-field__label">{t(S.deviceLabel)}</span>
            <Seg
              options={DEVICE_OPTIONS}
              value={state.device}
              onChange={(id) => setState({ ...state, device: id, searched: false })}
            />
          </div>
          <div className="mtim-field">
            <span className="mtim-field__label">{t(S.periodLabel)}</span>
            <Seg
              options={PERIOD_CHOICES}
              value={String(state.period)}
              onChange={(id) => setState({ ...state, period: Number(id), searched: false })}
            />
          </div>
        </div>

        <div className="mtim-grid">
          <WaveFig tAA={tAA} period={state.period} strobe={state.strobe} />
          <div className="mtim-cell-side">
            <Knob
              label={S.strobeLabel}
              value={state.strobe}
              unit="ns"
              min={0}
              max={14}
              step={0.5}
              onChange={(v) => setState({ ...state, strobe: v })}
            />
            <Readout
              items={[
                { label: S.lowEdge, value: `${fmt(win.lo)} ns` },
                { label: S.highEdge, value: `${fmt(win.hi)} ns` },
                { label: S.rWidth, value: `${fmt(win.width)} ns` },
                { label: S.rCentre, value: `${fmt(win.centre)} ns` },
                { label: S.rMargin, value: `${fmt(analysis.margin)} ns`, state: analysis.pass ? 'pass' : 'fail' },
                {
                  label: S.rVerdict,
                  value: t(analysis.pass ? S.passWord : S.failWord),
                  state: analysis.pass ? 'pass' : 'fail',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.bisectTitle)} note={t(S.bisectNote)}>
        <div className="mtim-buttons">
          <button type="button" className="lab__btn" onClick={() => setState({ ...state, searched: true })}>
            {t(S.bisectButton)}
          </button>
        </div>
        {state.searched ? (
          bis.ok ? (
            <>
              <ol className="mtim-trace">
                {bis.trace.map((step, index) => (
                  <li key={index} className={step.pass ? 'is-pass' : 'is-fail'}>
                    {t(S.bisectStep(index + 1, fmt(step.strobe), step.pass))}
                  </li>
                ))}
              </ol>
              <p className="mtim-note">{t(S.bisectResult(fmt(bis.estimate), fmt(maxError)))}</p>
            </>
          ) : (
            <p className="mtim-note">{t(S.bisectNot)}</p>
          )
        ) : (
          <p className="mtim-note">{t(S.bisectNotRun)}</p>
        )}
      </Section>

      <Section title={t(S.shmooTitle)} note={t(S.shmooNote)}>
        <ShmooFig device={state.device} strobe={state.strobe} period={state.period} />
        <p className="mtim-legend">
          <span className="mtim-chip is-pass" aria-hidden="true" />
          <span>{t(S.shmooPassLegend)}</span>
          <span className="mtim-chip is-fail" aria-hidden="true" />
          <span>{t(S.shmooFailLegend)}</span>
        </p>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
