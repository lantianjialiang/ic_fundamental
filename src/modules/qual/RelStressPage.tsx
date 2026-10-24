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
import '../hs/hs.css'
import { REL_META } from './meta'
import { FitCurveFig, TradeoffFig } from './RelStressFig'
import { CL_SEG, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, TEST_INFO, TEST_SEG, INTRO, taskItems, verdictOf } from './relStressData'
import { analyseStress, DEFAULT_STRESS, TEST_TYPES, type StressState } from './relStressModel'
import './relStress.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RelStressPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<StressState>(DEFAULT_STRESS)
  const analysis = useMemo(() => analyseStress(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<StressState>) => setState((prev) => ({ ...prev, ...patch }))
  const isTc = state.type === 'tc'

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relStress.title)}
      goal={t(REL_META.relStress.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      nextId="relWeibull"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_STRESS)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relAccel', 'relBathtub', 'relWeibull']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.typeLabel)}</span>
            <Seg options={TEST_SEG} value={state.type} onChange={(type) => update({ type })} />
          </div>
          <Knob label={S.batchesLabel} value={state.batches} unit="" min={1} max={4} step={1} onChange={(batches) => update({ batches })} />
          <Knob label={S.perBatchLabel} value={state.perBatch} unit="" min={10} max={150} step={1} onChange={(perBatch) => update({ perBatch })} />
          <Knob label={S.hoursLabel} value={state.hours} unit="h" min={250} max={2000} step={50} onChange={(hours) => update({ hours })} />
          {isTc ? (
            <Knob label={S.dtStressLabel} value={state.dtStress} unit="°C" min={65} max={200} step={5} onChange={(dtStress) => update({ dtStress })} />
          ) : (
            <Knob label={S.tStressLabel} value={state.tStress} unit="°C" min={85} max={175} step={5} onChange={(tStress) => update({ tStress })} />
          )}
          {isTc ? null : <Knob label={S.eaLabel} value={state.ea} unit="eV" min={0.3} max={1.2} step={0.05} onChange={(ea) => update({ ea })} />}
        </div>
        <div className="hs-controls">
          <Knob label={S.rLabel} value={state.r} unit="" min={0} max={5} step={1} onChange={(r) => update({ r })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.clLabel)}</span>
            <Seg options={CL_SEG} value={String(state.cl)} onChange={(id) => update({ cl: Number(id) })} />
          </div>
          <Knob label={S.targetLabel} value={state.targetFit} unit="FIT" min={10} max={200} step={10} onChange={(targetFit) => update({ targetFit })} />
        </div>
        <p className="rel-std-note">{t(S.stdNote)}</p>

        <div className="hs-grid">
          <div className="rel-stress-figs">
            <p className="rel-std-note">
              <b>{t(S.figFitTitle)}</b> {t(S.figFitNote)}
            </p>
            <FitCurveFig n={analysis.n} hours={state.hours} af={analysis.af} cl={state.cl} r={state.r} target={state.targetFit} />
            <p className="rel-std-note">
              <b>{t(S.figTradeTitle)}</b> {t(S.figTradeNote)}
            </p>
            <TradeoffFig hours={state.hours} n={analysis.n} af={analysis.af} cl={state.cl} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rN, value: String(analysis.n) },
                { label: S.rAf, value: analysis.af.toFixed(1) },
                { label: S.rDh, value: analysis.deviceHours.toExponential(2) },
                { label: S.rEquiv, value: analysis.equivHours.toExponential(2) },
                { label: S.rFit, value: `${analysis.fitUpper.toFixed(1)} FIT` },
                { label: S.rMin, value: String(analysis.minSample) },
                {
                  label: S.rPass,
                  value: t(analysis.pass ? S.meets : S.misses),
                  state: analysis.pass ? 'pass' : 'fail',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.tableTitle)} note={t(S.tableNote)}>
        <div className="rel-table-wrap">
          <table className="rel-table">
            <thead>
              <tr>
                <th>{t(S.colType)}</th>
                <th>{t(S.colPurpose)}</th>
                <th>{t(S.colStress)}</th>
              </tr>
            </thead>
            <tbody>
              {TEST_TYPES.map((type) => (
                <tr key={type}>
                  <td>{TEST_INFO[type].name}</td>
                  <td>{t(TEST_INFO[type].purpose)}</td>
                  <td>{t(TEST_INFO[type].stress)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="rel-std-note">{t(S.otherTests)}</p>
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
