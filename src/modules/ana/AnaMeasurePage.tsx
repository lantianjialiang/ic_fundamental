import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, fmtOhm } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { INTRO, MISCONCEPTIONS, MODE_OPTIONS, QUIZ, S, TAKEAWAY, WIRE_OPTIONS, taskItems, verdictOf } from './measureData'
import { HookupFig, RangeFig } from './MeasureFig'
import { DEFAULT_STATE, I_FORCE_PRESETS, I_RANGES, LIMIT_PCT, R_PRESETS, V_RANGES, fmtPct, fmtSI, measure, type MeasureState } from './measureModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaMeasurePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<MeasureState>(DEFAULT_STATE)
  const result = measure(state)
  const isV = state.mode === 'forceV'
  const measuredUnit = isV ? 'A' : 'V'
  const verdict = verdictOf(result)
  const update = (patch: Partial<MeasureState>) => setState((prev) => ({ ...prev, ...patch }))

  const iRangeOptions = I_RANGES.map((r) => ({ id: String(r), label: fmtSI(r, 'A') }))
  const vRangeOptions = V_RANGES.map((r) => ({ id: String(r), label: fmtSI(r, 'V') }))
  const rOptions = R_PRESETS.map((r) => ({ id: String(r), label: fmtOhm(r) }))
  const iForceOptions = I_FORCE_PRESETS.map((i) => ({ id: String(i), label: fmtSI(i, 'A') }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaMeasure.title)}
      goal={t(ANA_META.anaMeasure.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaResources"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DEFAULT_STATE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pMeasure', 'pmu', 'anaResources']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.modeLabel)}</span>
            <Seg options={MODE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
          {isV ? (
            <Knob label={S.vForce} value={state.vForce} unit="V" min={0} max={5} step={0.05} onChange={(v) => update({ vForce: v })} />
          ) : (
            <div className="ana-field">
              <span className="ana-field__label">{t(S.iForce)}</span>
              <Seg options={iForceOptions} value={String(state.iForce)} onChange={(id) => update({ iForce: Number(id) })} />
            </div>
          )}
          <div className="ana-field">
            <span className="ana-field__label">{t(S.rDut)}</span>
            <Seg options={rOptions} value={String(state.rDut)} onChange={(id) => update({ rDut: Number(id) })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.wiresLabel)}</span>
            <Seg options={WIRE_OPTIONS} value={state.wires} onChange={(wires) => update({ wires })} />
          </div>
        </div>

        <div className="ana-grid">
          <HookupFig state={state} />
          <div className="ana-cell">
            <Readout
              items={[
                { label: S.rTrue, value: fmtSI(result.ideal, measuredUnit) },
                { label: S.rReading, value: fmtSI(result.reading, measuredUnit) },
                { label: S.rSetup, value: fmtPct(result.setupPct), state: Math.abs(result.setupPct) <= LIMIT_PCT ? 'pass' : 'fail' },
                { label: S.rBand, value: `±${fmtSI(result.band, measuredUnit)} (${result.bandPct.toFixed(2)}%)` },
                { label: S.rRange, value: t(result.overrange ? S.ovr : S.ok), state: result.overrange ? 'fail' : undefined },
                { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.rangeTitle)} note={t(S.rangeNote)}>
        <div className="ana-field">
          <span className="ana-field__label">{t(isV ? S.iRangeLabel : S.vRangeLabel)}</span>
          <Seg
            options={isV ? iRangeOptions : vRangeOptions}
            value={String(isV ? state.iRange : state.vRange)}
            onChange={(id) => update(isV ? { iRange: Number(id) } : { vRange: Number(id) })}
          />
        </div>
        <RangeFig state={state} />
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
