import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Steps } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { DramArrayFig, DramDecayFig, DramSweepFig } from './MemDramFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './memDramData'
import { DEFAULT_DRAM, SWEEP_MS, TREF_MAX, TREF_MIN, TREF_STEP, analyseDram, failSweep, type DramState } from './memDramModel'
import { MEM_META } from './meta'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemDramPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DramState>(DEFAULT_DRAM)
  const analysis = useMemo(() => analyseDram(state), [state])
  const sweep = useMemo(() => failSweep(analysis.retention, SWEEP_MS), [analysis.retention])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<DramState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memDram.title)}
      goal={t(MEM_META.memDram.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memDdr"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_DRAM)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memRw', 'memFault', 'memDdr']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.cmdTitle)} note={t(S.cmdNote)}>
        <Steps items={[S.cmdAct, S.cmdRw, S.cmdPre, S.cmdRef]} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob
            label={S.trefLabel}
            value={state.tRef}
            unit="ms"
            min={TREF_MIN}
            max={TREF_MAX}
            step={TREF_STEP}
            onChange={(tRef) => update({ tRef })}
          />
          <button type="button" className="lab__btn" onClick={() => update({ batch: state.batch + 1 })}>
            {t(S.batchBtn)}
          </button>
        </div>

        <div className="hs-grid">
          <DramArrayFig analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rTref, value: `${state.tRef} ms` },
                { label: S.rFails, value: String(analysis.fails), state: analysis.pass ? 'pass' : 'fail' },
                { label: S.rWeak, value: `${analysis.weakestMs.toFixed(0)} ms` },
                { label: S.rVerdict, value: t(analysis.pass ? S.pass : S.fail), state: analysis.pass ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>

        <DramDecayFig analysis={analysis} tRef={state.tRef} />
        <DramSweepFig fails={sweep} tRef={state.tRef} />
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
