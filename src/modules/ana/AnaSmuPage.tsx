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
import { ANA_META } from './meta'
import { ComplianceFig, HookupSmuFig } from './SmuFig'
import { DUT_OPTIONS, INTRO, MISCONCEPTIONS, MODE_OPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './smuData'
import { DEFAULT_SMU, I_FORCE_PRESETS, I_LIMIT_PRESETS, V_LIMIT_PRESETS, continuityJudge, smuMeasure, type SmuState } from './smuModel'
import { fmtSI } from './measureModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaSmuPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SmuState>(DEFAULT_SMU)
  const result = smuMeasure(state)
  const judge = continuityJudge(state, result)
  const fvmi = state.mode === 'fvmi'
  const unit = fvmi ? 'A' : 'V'
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<SmuState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_SMU)

  const iForceOptions = I_FORCE_PRESETS.map((i) => ({ id: String(i), label: fmtSI(i, 'A') }))
  const iLimitOptions = I_LIMIT_PRESETS.map((i) => ({ id: String(i), label: fmtSI(i, 'A') }))
  const vLimitOptions = V_LIMIT_PRESETS.map((v) => ({ id: String(v), label: `${v.toFixed(2)} V` }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaSmu.title)}
      goal={t(ANA_META.anaSmu.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaSignal"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaSignal.title)}`}
      extra={<TaskList items={taskItems(state, result, judge)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaMeasure', 'pmu', 'fOpens']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.modeLabel)}</span>
            <Seg options={MODE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
          {fvmi ? (
            <Knob label={S.vForce} value={state.vForce} unit="V" min={-2} max={5} step={0.05} onChange={(vForce) => update({ vForce })} />
          ) : (
            <div className="ana-field">
              <span className="ana-field__label">{t(S.iForce)}</span>
              <Seg options={iForceOptions} value={String(state.iForce)} onChange={(id) => update({ iForce: Number(id) })} />
            </div>
          )}
          <div className="ana-field">
            <span className="ana-field__label">{t(S.dutLabel)}</span>
            <Seg options={DUT_OPTIONS} value={state.dut} onChange={(dut) => update({ dut })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(fvmi ? S.iLimit : S.vLimit)}</span>
            <Seg
              options={fvmi ? iLimitOptions : vLimitOptions}
              value={String(fvmi ? state.iLimit : state.vLimit)}
              onChange={(id) => update(fvmi ? { iLimit: Number(id) } : { vLimit: Number(id) })}
            />
          </div>
        </div>

        <div className="ana-grid">
          <HookupSmuFig state={state} result={result} />
          <div className="ana-cell">
            <Readout
              items={[
                { label: S.rForce, value: fvmi ? fmtSI(state.vForce, 'V') : fmtSI(state.iForce, 'A') },
                { label: S.rLimit, value: fvmi ? fmtSI(state.iLimit, 'A') : fmtSI(state.vLimit, 'V') },
                { label: S.rIdeal, value: result.ideal === null ? t(S.noPath) : fmtSI(result.ideal, unit) },
                { label: S.rReading, value: fmtSI(result.reading, unit), state: result.compliance ? 'fail' : undefined },
                { label: S.rPinV, value: fmtSI(result.pinVoltage, 'V') },
                { label: S.rPinI, value: fmtSI(result.pinCurrent, 'A') },
                { label: S.rComp, value: t(result.compliance ? S.hit : S.noHit), state: result.compliance ? 'fail' : 'pass' },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.compTitle)} note={t(S.compNote)}>
        <ComplianceFig state={state} result={result} />
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
