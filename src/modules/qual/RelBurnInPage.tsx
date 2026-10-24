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
import { BiCostFig, BiPpmFig } from './RelBurnInFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, SCREEN_OPTIONS, TAKEAWAY, taskItems, U, verdictOf } from './relBurnInData'
import { analyseBi, bestFeasible, bestUnconstrained, type BiState, costCurve, DEFAULT_BI, minHForTarget, REF_T_BI, TARGET_PPM } from './relBurnInModel'
import './relBurnIn.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RelBurnInPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<BiState>(DEFAULT_BI)
  const analysis = useMemo(() => analyseBi(state), [state])
  const curve = useMemo(() => costCurve(state), [state])
  const refCurve = useMemo(() => costCurve({ ...state, tBiC: REF_T_BI }), [state])
  const best = bestFeasible(curve, TARGET_PPM)
  const bestFree = bestUnconstrained(curve)
  const hMin = minHForTarget(curve, TARGET_PPM)
  const meets = analysis.fieldPpm <= TARGET_PPM
  const verdict = verdictOf(state, analysis, curve)
  const update = (patch: Partial<BiState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relBurnIn.title)}
      goal={t(REL_META.relBurnIn.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="relAuto"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis, curve, refCurve)} onReset={() => setState(DEFAULT_BI)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relBathtub', 'relAccel', 'relStress']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.pLabel} value={state.pDefectPct} unit="%" min={0.1} max={5} step={0.1} onChange={(pDefectPct) => update({ pDefectPct })} />
          <Knob label={S.betaLabel} value={state.betaD} unit={t(U.shape)} min={0.4} max={0.8} step={0.05} onChange={(betaD) => update({ betaD })} />
          <Knob label={S.etaLabel} value={state.etaD} unit="h" min={300} max={5000} step={100} onChange={(etaD) => update({ etaD })} />
          <Knob label={S.tBiLabel} value={state.tBiC} unit="°C" min={85} max={150} step={5} onChange={(tBiC) => update({ tBiC })} />
          <Knob label={S.vBiLabel} value={state.vBi} unit="V" min={5} max={6} step={0.1} onChange={(vBi) => update({ vBi })} />
          <Knob label={S.hLabel} value={state.biHours} unit="h" min={0} max={168} step={1} onChange={(biHours) => update({ biHours })} />
        </div>
        <div className="hs-controls">
          <Knob label={S.cBiLabel} value={state.cBi} unit={t(U.costH)} min={0.001} max={0.01} step={0.001} onChange={(cBi) => update({ cBi })} />
          <Knob label={S.cScrapLabel} value={state.cScrap} unit={t(U.costPart)} min={0.1} max={2} step={0.1} onChange={(cScrap) => update({ cScrap })} />
          <Knob label={S.cFieldLabel} value={state.cField} unit={t(U.costPart)} min={1} max={100} step={1} onChange={(cField) => update({ cField })} />
          <Knob label={S.tFieldLabel} value={state.tFieldH} unit="h" min={1000} max={43800} step={1000} onChange={(tFieldH) => update({ tFieldH })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.screenLabel)}</span>
            <Seg options={SCREEN_OPTIONS} value={state.screen} onChange={(screen) => update({ screen })} />
          </div>
        </div>

        <div className="hs-grid">
          <div className="rel-figs">
            <BiCostFig curve={curve} hours={state.biHours} bestH={bestFree.h} />
            <BiPpmFig curve={curve} hours={state.biHours} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rAf, value: analysis.af.toFixed(1) },
                { label: S.rRemoved, value: `${(analysis.biRemoved * 100).toFixed(3)}%` },
                { label: S.rResidual, value: `${(analysis.residual * 1e6).toFixed(0)} ppm` },
                { label: S.rFieldPpm, value: `${analysis.fieldPpm.toFixed(0)} ppm`, state: meets ? 'pass' : 'fail' },
                { label: S.rTargetLabel, value: `${TARGET_PPM} ppm` },
                { label: S.rCost, value: `$${analysis.cost.toFixed(3)}` },
                { label: S.rBestFree, value: `${bestFree.h} h` },
                { label: S.rBestFeasible, value: best === null ? t(S.noneWithin) : `${best.h} h` },
                { label: S.rBestTarget, value: hMin === null ? t(S.noneWithin) : `${hMin} h` },
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
