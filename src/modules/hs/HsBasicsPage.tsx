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
import { BasicsFig } from './BasicsFig'
import { PrereqSection } from './HsPrereq'
import { INTRO, MISCONCEPTIONS, PREREQ, QUIZ, RATE_OPTIONS, S, TAKEAWAY, taskItems, verdictOf } from './basicsData'
import { type BasicsState, DEFAULT_BASICS, analyseBasics } from './basicsModel'
import { HS_META } from './meta'
import './hs.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsBasicsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<BasicsState>(DEFAULT_BASICS)
  const analysis = useMemo(() => analyseBasics(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<BasicsState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsBasics.title)}
      goal={t(HS_META.hsBasics.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsChannel"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_BASICS)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSignal', 'anaSampling', 'hsEye']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <Knob label={S.trLabel} value={state.tr} unit="ps" min={10} max={200} step={5} onChange={(tr) => update({ tr })} />
        </div>

        <div className="hs-grid">
          <BasicsFig analysis={analysis} tr={state.tr} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(1)} ps` },
                { label: S.rBw, value: `${analysis.bw.toFixed(2)} GHz` },
                { label: S.rRatio, value: analysis.ratio.toFixed(2) },
                { label: S.rSettled, value: `${(analysis.settled * 100).toFixed(1)} %` },
                { label: S.rMinBw, value: `${analysis.minBw.toFixed(1)} GHz` },
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
