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
import { RF_META } from './meta'
import { ErrorFig, PathFig } from './RfCalFig'
import { CAL_OPTIONS, INTRO, MISCONCEPTIONS, PATH_CAP, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfCalData'
import { calibrate, DEFAULT_CAL, SPEC_DB, type CalState } from './rfCalModel'
import './rfCal.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const f2 = (value: number) => value.toFixed(2)

export function RfCalPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CalState>(DEFAULT_CAL)
  const result = useMemo(() => calibrate(state), [state])
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<CalState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfCal.title)}
      goal={t(RF_META.rfCal.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfCapstone"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DEFAULT_CAL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfSystem', 'rfSparam', 'rfDb']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rf-controls">
          <div className="rf-field">
            <span className="rf-field__label">{t(S.methodLabel)}</span>
            <Seg options={CAL_OPTIONS} value={state.method} onChange={(method) => update({ method })} />
          </div>
          <Knob label={S.lossLabel} value={state.lossPerGhz} unit="dB/GHz" min={0} max={0.5} step={0.05} onChange={(lossPerGhz) => update({ lossPerGhz })} />
          <Knob label={S.rippleLabel} value={state.ripple} unit="dB" min={0} max={0.5} step={0.05} onChange={(ripple) => update({ ripple })} />
          <Knob label={S.uncLabel} value={state.stdUnc} unit="dB" min={0} max={0.3} step={0.01} onChange={(stdUnc) => update({ stdUnc })} />
        </div>

        <PathFig method={state.method} caption={t(PATH_CAP[state.method])} />

        <div className="rf-grid">
          <ErrorFig result={result} />
          <div className="rf-cell">
            <Readout
              items={[
                { label: S.rLoss, value: `${f2(result.lossAtStop)} dB` },
                {
                  label: S.rBefore,
                  value: `${f2(result.maxBefore)} dB @ ${result.maxBeforeF.toFixed(1)} GHz`,
                  state: result.maxBefore > SPEC_DB ? 'fail' : 'pass',
                },
                {
                  label: S.rAfter,
                  value: `${f2(result.maxAfter)} dB @ ${result.maxAfterF.toFixed(1)} GHz`,
                  state: result.pass ? 'pass' : 'fail',
                },
                { label: S.rSpec, value: `±${SPEC_DB.toFixed(1)} dB` },
                { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
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
    </LessonFrame>
  )
}
