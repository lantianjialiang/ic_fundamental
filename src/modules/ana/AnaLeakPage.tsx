import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { HookFig, SettleFig } from './LeakFig'
import {
  DUT_OPTIONS,
  INTRO,
  MEASURE_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './leakData'
import { DEFAULT_LEAK, judge, type LeakState } from './leakModel'
import { ANA_META } from './meta'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaLeakPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<LeakState>(DEFAULT_LEAK)
  const result = judge(state)
  const verdict = verdictOf(state, result)
  const valid = result.vOk && result.settled
  const update = (patch: Partial<LeakState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_LEAK)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaLeak.title)}
      goal={t(ANA_META.anaLeak.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaLdo"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaLdo.title)}`}
      extra={<TaskList items={taskItems(state, result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSmu', 'fDc', 'vate']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.modeLabel)}</span>
            <Seg options={MEASURE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.dutLabel)}</span>
            <Seg options={DUT_OPTIONS} value={state.dut} onChange={(dut) => update({ dut })} />
          </div>
          <Knob
            label={S.vLabel}
            value={state.vForce}
            unit="V"
            min={1}
            max={5.5}
            step={0.1}
            onChange={(vForce) => update({ vForce })}
          />
          <Knob
            label={S.settleLabel}
            value={state.settleMs}
            unit="ms"
            min={0}
            max={10}
            step={0.1}
            onChange={(settleMs) => update({ settleMs })}
          />
          <Knob
            label={S.guardLabel}
            value={state.guard}
            unit="µA"
            min={0}
            max={5}
            step={0.1}
            onChange={(guard) => update({ guard })}
          />
        </div>

        <div className="ana-grid">
          <HookFig state={state} />
          <SettleFig state={state} />
        </div>

        <div className="ana-cell">
          <p className="ana-field__label">{t(S.devName)}</p>
          <Readout
            items={[
              { label: S.rSpec, value: `${result.spec.toFixed(1)} µA` },
              { label: S.rLimit, value: `${result.limit.toFixed(1)} µA` },
              { label: S.rSteady, value: `${result.steady.toFixed(1)} µA` },
              { label: S.rTrans, value: `${result.transient.toFixed(1)} µA` },
              {
                label: S.rReading,
                value: `${result.reading.toFixed(1)} µA`,
                state: result.pass ? 'pass' : 'fail',
              },
              { label: S.rNeed, value: `${result.needMs.toFixed(1)} ms` },
              {
                label: S.rVerdict,
                value: t(valid ? (result.pass ? S.pass : S.fail) : S.invalid),
                state: valid && result.pass ? 'pass' : 'fail',
              },
            ]}
          />
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
    </LessonFrame>
  )
}
