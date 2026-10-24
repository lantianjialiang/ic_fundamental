import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { PrereqSection } from './HsPrereq'
import { TimingFig } from './HsTimingFig'
import { INTRO, MISCONCEPTIONS, PREREQ, QUIZ, RATE_OPTIONS, S, TAKEAWAY, taskItems, verdictOf } from './hsTimingData'
import { DEFAULT_TIMING, analyseTiming, type TimingState } from './hsTimingModel'
import { HS_META } from './meta'
import './hs.css'
import './hsTiming.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsTimingPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<TimingState>(DEFAULT_TIMING)
  const analysis = useMemo(() => analyseTiming(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<TimingState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsTiming.title)}
      goal={t(HS_META.hsTiming.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsJitter"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_TIMING)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsBasics', 'hsEye', 'anaSampling']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <Knob label={S.tsuLabel} value={state.tsu} unit="ps" min={0} max={30} step={1} onChange={(tsu) => update({ tsu })} />
          <Knob label={S.thLabel} value={state.th} unit="ps" min={0} max={30} step={1} onChange={(th) => update({ th })} />
          <Knob label={S.jitterLabel} value={state.jitter} unit="ps" min={0} max={5} step={0.5} onChange={(jitter) => update({ jitter })} />
          <Knob label={S.phaseLabel} value={state.phase} unit="%" min={0} max={100} step={1} onChange={(phase) => update({ phase })} />
        </div>

        <div className="hs-grid">
          <TimingFig analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(1)} ps` },
                { label: S.rSample, value: `${analysis.sample.toFixed(1)} ps` },
                { label: S.rSetup, value: `${analysis.setupBoundary.toFixed(1)} ps` },
                { label: S.rHold, value: `${analysis.holdBoundary.toFixed(1)} ps` },
                { label: S.rWindow, value: `${analysis.window.toFixed(1)} ps`, state: analysis.window > 0 ? 'pass' : 'fail' },
                { label: S.rSetupMargin, value: `${analysis.setupMargin.toFixed(1)} ps`, state: analysis.setupMargin >= 0 ? 'pass' : 'fail' },
                { label: S.rHoldMargin, value: `${analysis.holdMargin.toFixed(1)} ps`, state: analysis.holdMargin >= 0 ? 'pass' : 'fail' },
                { label: S.rVerdict, value: t(analysis.pass ? S.pass : S.fail), state: analysis.pass ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>
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

      <PrereqSection title={S.prereqTitle} note={S.prereqNote} items={PREREQ} />
    </LessonFrame>
  )
}
