import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, type ReadoutItem, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { PWR_META } from './meta'
import { RdsErrFig } from './PwrStaticFig'
import {
  COMPLIANCE_LABEL,
  COMPLIANCE_UNIT,
  FORCE_LABEL,
  FORCE_TABLE,
  FORCE_UNIT,
  INTRO,
  MISCONCEPTIONS,
  PARAM_SEG,
  QUIZ,
  S,
  SAMPLE_SEG,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './pwrStaticData'
import {
  COMPLIANCE,
  DUTY_PCT,
  FORCE,
  LIMIT_NA,
  PULSE_US,
  TA_C,
  controlsOf,
  initialStatic,
  measureOf,
  type StaticParam,
  type StaticState,
} from './pwrStaticModel'
import './pwrStatic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 读数的显示格式：各参数按自己的量级和单位写 */
function formatValue(param: StaticParam, value: number): string {
  if (param === 'bvdss') {
    return `${value.toFixed(2)} V`
  }
  if (param === 'vth') {
    return `${value.toFixed(3)} V`
  }
  if (param === 'rdson') {
    return `${(value * 1000).toFixed(2)} mΩ`
  }
  return `${value.toFixed(1)} nA`
}

export function PwrStaticPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<StaticState>(() => initialStatic())
  const m = measureOf(state)
  const verdict = verdictOf(state, m)
  const isLeakage = state.param === 'idss' || state.param === 'igss'
  const isRds = state.param === 'rdson'

  const update = (patch: Partial<StaticState>) => setState((prev) => ({ ...prev, ...patch }))
  const setParam = (param: StaticParam) => setState((prev) => ({ ...prev, param, ...controlsOf(param) }))

  const items: ReadoutItem[] = [
    { label: S.rMeas, value: formatValue(state.param, m.value) },
    { label: S.rClip, value: t(m.clipped ? S.clipHit : S.clipNo), state: m.clipped ? 'fail' : undefined },
  ]
  if (isRds && m.dTj !== null && m.errPct !== null) {
    items.push({ label: S.rDtj, value: `${m.dTj.toFixed(2)} K` })
    items.push({ label: S.rErr, value: `${m.errPct.toFixed(2)} %`, state: m.errPct < 1 ? 'pass' : 'fail' })
    items.push({
      label: S.rMaxPulse,
      value: m.maxPulse !== null && Number.isFinite(m.maxPulse) ? `${(m.maxPulse * 1e3).toFixed(2)} ms` : t(S.noLimit),
    })
  }
  if (state.param === 'bvdss' && m.errPct !== null) {
    items.push({ label: S.rErr, value: `${m.errPct.toFixed(2)} %` })
  }
  if (state.param === 'vth' && m.vthDiffMv !== null) {
    items.push({ label: S.rVthDiff, value: `${m.vthDiffMv.toFixed(1)} mV` })
  }
  if (isLeakage) {
    let judge = t(S.judgeUnknown)
    let judgeState: 'pass' | 'fail' | undefined
    if (m.pass === true) {
      judge = t(S.pass)
      judgeState = 'pass'
    } else if (m.pass === false) {
      judge = t(S.fail)
      judgeState = 'fail'
    }
    items.push({ label: S.rJudge, value: judge, state: judgeState })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrStatic.title)}
      goal={t(PWR_META.pwrStatic.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrKelvin"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(initialStatic())} />}
    >
      <Section title={t(S.introTitle)} note={t(S.introNote)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <table className="pwr-table">
          <thead>
            <tr>
              <th>{t(S.tableParam)}</th>
              <th>{t(S.tableForce)}</th>
              <th>{t(S.tableMeasure)}</th>
              <th>{t(S.tableNote)}</th>
            </tr>
          </thead>
          <tbody>
            {FORCE_TABLE.map((row, index) => (
              <tr key={index}>
                <td>{t(row.param)}</td>
                <td>{t(row.force)}</td>
                <td>{t(row.measure)}</td>
                <td>{t(row.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Related ids={['anaSmu', 'anaStatic', 'anaLeak']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.paramLabel)}</span>
            <Seg options={PARAM_SEG} value={state.param} onChange={(param) => setParam(param)} />
          </div>
          <Knob
            label={FORCE_LABEL[state.param]}
            value={state.force}
            unit={FORCE_UNIT[state.param]}
            min={FORCE[state.param].min}
            max={FORCE[state.param].max}
            step={FORCE[state.param].step}
            onChange={(force) => update({ force })}
          />
          <Knob
            label={COMPLIANCE_LABEL[state.param]}
            value={state.compliance}
            unit={COMPLIANCE_UNIT[state.param]}
            min={COMPLIANCE[state.param].min}
            max={COMPLIANCE[state.param].max}
            step={COMPLIANCE[state.param].step}
            onChange={(compliance) => update({ compliance })}
          />
          {isLeakage ? (
            <Knob
              label={S.limitLabel}
              value={state.limitNa}
              unit={S.limitUnit}
              min={LIMIT_NA.min}
              max={LIMIT_NA.max}
              step={LIMIT_NA.step}
              onChange={(limitNa) => update({ limitNa })}
            />
          ) : null}
          {isLeakage ? (
            <div className="hs-field">
              <span className="hs-field__label">{t(S.sampleLabel)}</span>
              <Seg options={SAMPLE_SEG} value={state.sample} onChange={(sample) => update({ sample })} />
            </div>
          ) : null}
          <Knob
            label={S.taLabel}
            value={state.ta}
            unit={S.taUnit}
            min={TA_C.min}
            max={TA_C.max}
            step={TA_C.step}
            onChange={(ta) => update({ ta })}
          />
          {isRds ? (
            <Knob
              label={S.pulseLabel}
              value={state.pulseUs}
              unit={S.pulseUnit}
              min={PULSE_US.min}
              max={PULSE_US.max}
              step={PULSE_US.step}
              onChange={(pulseUs) => update({ pulseUs })}
            />
          ) : null}
          {isRds ? (
            <Knob
              label={S.dutyLabel}
              value={state.dutyPct}
              unit={S.dutyUnit}
              min={DUTY_PCT.min}
              max={DUTY_PCT.max}
              step={DUTY_PCT.step}
              onChange={(dutyPct) => update({ dutyPct })}
            />
          ) : null}
        </div>
        <p className="pwr-formula">{t(S.complianceNote)}</p>
        <p className="pwr-formula">{t(S.thermalNote)}</p>
        {state.param === 'vth' ? <Callout tone="warn">{t(S.vthNote)}</Callout> : null}

        <div className="hs-grid">
          <div className="pwr-figs">{isRds ? <RdsErrFig state={state} /> : null}</div>
          <div className="hs-cell">
            <Readout items={items} />
          </div>
        </div>
        <p className="pwr-formula">{t(S.formulaNote)}</p>
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
