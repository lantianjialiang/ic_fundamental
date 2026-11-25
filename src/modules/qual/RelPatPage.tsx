import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { type Die } from './core/wafer'
import { REL_META } from './meta'
import { OUTCOME_COLOR, OutcomeLegend, PatHistFig, paramColor } from './RelPatFig'
import {
  CAT,
  COLOR_SEG,
  INTRO,
  MISCONCEPTIONS,
  NBR_SEG,
  QUIZ,
  S,
  SAMPLE_TEXT,
  TAKEAWAY,
  WAFER_SEG,
  WINDOW_SEG,
  fill,
  handState,
  taskItems,
  verdictOf,
  waferSummary,
} from './relPatData'
import { DEFAULT_PAT, type Limits, type PatRun, type PatState, TARGET_CAPTURE, TARGET_YIELD_LOSS, runPat, samplePat, siteOf } from './relPatModel'
import { WaferMap } from './WaferMap'
import './relPat.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const fmtLim = (l: Limits) => `[${l.lo.toFixed(1)}, ${l.hi.toFixed(1)}]`
const MAP_VIEWS = [
  { id: 'outcome', label: loc('综合结果', 'Combined outcome') },
  { id: 'pat', label: loc('PAT 看单颗', 'PAT: one die') },
  { id: 'sba', label: loc('SBA 看整批', 'SBA: whole lot') },
  { id: 'nbr', label: loc('邻近筛选看周围', 'Neighbour screening: nearby dies') },
] as const
const isPriorFail = (outcome: PatRun['outcome'][number]) => outcome === 'spec' || outcome.startsWith('pat-')

export function RelPatPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PatState>(DEFAULT_PAT)
  const [picked, setPicked] = useState<number | null>(null)
  const [mapView, setMapView] = useState<(typeof MAP_VIEWS)[number]['id']>('outcome')
  const [binLimit, setBinLimit] = useState(1.2)
  const run = useMemo(() => runPat(state), [state])
  const { stats } = run
  const hand = useMemo(() => samplePat(state.k), [state.k])
  const verdict = verdictOf(state, run)
  const captureOk = stats.capture >= TARGET_CAPTURE
  const yieldOk = stats.yieldLoss <= TARGET_YIELD_LOSS
  const shiftSigma = (run.waferMedian - run.lotMedian) / run.sigmaRob
  const active = picked === null ? run.map.dies[Math.floor(run.map.dies.length / 2)] : run.map.dies[picked]
  const activeOutcome = run.outcome[active.id]
  const activeLimit = run.applied.find((line) => line.site === null || line.site === siteOf(active)) ?? run.lotLimits
  const binRate = 100 * stats.specFail / stats.dies
  const lotHeld = binRate > binLimit
  const neighbours = new Set(run.map.dies.filter((die) => die.id !== active.id
    && Math.hypot(die.row - active.row, die.col - active.col) <= state.radius).map((die) => die.id))
  const sourceCount = [...neighbours].filter((id) => isPriorFail(run.outcome[id])).length

  const update = (patch: Partial<PatState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    if (patch.wafer !== undefined) {
      setPicked(null)
    }
  }
  const reset = () => {
    setState(DEFAULT_PAT)
    setPicked(null)
    setMapView('outcome')
    setBinLimit(1.2)
  }

  const colorOf = (die: Die) => {
    const outcome = run.outcome[die.id]
    if (mapView === 'pat' || mapView === 'nbr') {
      return isPriorFail(outcome) || (mapView === 'nbr' && outcome.startsWith('nbr-'))
        ? OUTCOME_COLOR[outcome] : '#536173'
    }
    if (mapView === 'sba') {
      return outcome === 'spec' ? OUTCOME_COLOR.spec : '#536173'
    }
    if (state.colorBy === 'param') {
      if (die.hardFail) {
        return '#484f58'
      }
      return paramColor((die.param - run.lotMedian) / run.sigmaRob)
    }
    return OUTCOME_COLOR[outcome]
  }

  const dieLabel = (die: Die) => {
    const truth = die.hardFail ? S.truthHard : die.latent ? S.truthLatent : S.truthGood
    return t(fill(S.dieLabel, die.row + 1, die.col + 1, die.param.toFixed(2), CAT[run.outcome[die.id]], truth))
  }

  const handLabel = (st: ReturnType<typeof handState>) => {
    if (st === 'ok') {
      return t(S.handOk)
    }
    if (st === 'wrong') {
      return t(S.handTry)
    }
    return t(S.handEmpty)
  }
  const handClass = (st: ReturnType<typeof handState>) => {
    if (st === 'ok') {
      return 'rel-pat-hand__ok'
    }
    if (st === 'wrong') {
      return 'rel-pat-hand__bad'
    }
    return 'rel-pat-hand__none'
  }
  const medianState = handState(state.handMedian, hand.median)
  const madState = handState(state.handMad, hand.mad)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relPat.title)}
      goal={t(REL_META.relPat.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="relFlow"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, run)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaStats', 'genStdf', 'relAuto']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(state, run)} />

        <div className="hs-controls">
          <Knob label={S.meanLabel} value={state.mean} unit="µA" min={40} max={60} step={1} onChange={(mean) => update({ mean })} />
          <Knob label={S.sigmaLabel} value={state.sigma} unit="µA" min={0.5} max={4} step={0.5} onChange={(sigma) => update({ sigma })} />
          <Knob label={S.latentLabel} value={state.latentPct} unit="%" min={0.1} max={2} step={0.1} onChange={(latentPct) => update({ latentPct })} />
          <Knob label={S.clusterLabel} value={state.clusterPct} unit="%" min={0} max={100} step={10} onChange={(clusterPct) => update({ clusterPct })} />
          <Knob label={S.shiftLabel} value={state.latentShift} unit="σ" min={2} max={6} step={0.5} onChange={(latentShift) => update({ latentShift })} />
          <Knob label={S.kLabel} value={state.k} unit="σ_rob" min={3} max={8} step={0.5} onChange={(k) => update({ k })} />
        </div>

        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.windowLabel)}</span>
            <Seg options={WINDOW_SEG} value={state.window} onChange={(windowId) => update({ window: windowId })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.waferLabel)}</span>
            <Seg options={WAFER_SEG} value={state.wafer} onChange={(wafer) => update({ wafer })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.nbrLabel)}</span>
            <Seg options={NBR_SEG} value={state.nbr} onChange={(nbr) => update({ nbr })} />
          </div>
          <Knob label={S.radiusLabel} value={state.radius} unit="die" min={0.5} max={3} step={0.5} onChange={(radius) => update({ radius })} />
          <Knob label={S.minLabel} value={state.minFails} unit="die" min={1} max={8} step={1} onChange={(minFails) => update({ minFails })} />
          {mapView === 'outcome' && <div className="hs-field">
            <span className="hs-field__label">{t(S.colorLabel)}</span>
            <Seg options={COLOR_SEG} value={state.colorBy} onChange={(colorBy) => update({ colorBy })} />
          </div>}
        </div>

        <div className="hs-grid">
          <div className="rel-pat-figs">
            <Seg options={MAP_VIEWS} value={mapView} onChange={setMapView} />
            {mapView === 'sba' && <Knob label={loc('历史失败 Bin 警戒线（示例）', 'Historical fail-bin limit (example)')}
              value={binLimit} unit="%" min={0.5} max={3} step={0.1} onChange={setBinLimit} />}
            <div className={mapView === 'sba' ? `rel-pat-lot ${lotHeld ? 'is-held' : ''}` : undefined}
              data-pat-scope={mapView} data-lot-held={mapView === 'sba' ? lotHeld : undefined}>
              <WaferMap
                wafer={run.map}
                colorOf={colorOf}
                selected={mapView === 'outcome' ? picked : mapView === 'sba' ? null : active.id}
                onPick={setPicked}
                summary={t(waferSummary(run))}
                ariaLabel={t(S.mapAria)}
                dieLabel={dieLabel}
                markOf={mapView === 'nbr' ? (die) => neighbours.has(die.id)
                  ? isPriorFail(run.outcome[die.id]) ? 'source' : 'near' : undefined : undefined}
              />
            </div>
            {mapView === 'outcome' && (state.colorBy === 'outcome' ? <OutcomeLegend /> : <p className="rel-pat-legend">{t(S.paramLegend)}</p>)}
            {mapView === 'pat' && <Readout items={[
              { label: loc('选中的 die 及其 PAT 窗口', 'Selected die and its PAT window'),
                value: `(${active.row + 1}, ${active.col + 1}) · ${active.param.toFixed(2)} µA · ${fmtLim(activeLimit)} µA` },
              { label: loc('对单颗的判定', 'Decision for one die'),
                value: t(activeOutcome === 'spec' ? loc('规格已失败，先剔除', 'Failed spec, removed before PAT')
                  : activeOutcome.startsWith('pat-') ? loc('超出统计窗口，PAT 剔除', 'Outside the statistical window; removed by PAT')
                    : loc('落在窗口内，通过 PAT', 'Inside the window; passes PAT')) },
            ]} />}
            {mapView === 'sba' && <Readout items={[
              { label: loc('整批规格失败 Bin 占比', 'Spec-fail bin share across the whole lot'),
                value: `${stats.specFail} / ${stats.dies} × 100% ≈ ${binRate.toFixed(2)}%` },
              { label: loc('整批判定（当前晶圆是批次的一部分）', 'Lot decision (this wafer belongs to the lot)'),
                value: t(lotHeld ? loc('超过警戒线，整批待查', 'Above the limit; hold the lot for review')
                  : loc('达到或低于警戒线，继续流转', 'At or below the limit; release for the next step')),
                state: lotHeld ? 'fail' : 'pass' },
            ]} />}
            {mapView === 'nbr' && <Readout items={[
              { label: loc('所选 die 周围的失败邻居（黄框）', 'Failing neighbours around the selected die (gold outlines)'),
                value: `${sourceCount} / ${neighbours.size} · r = ${state.radius} die · m = ${state.minFails}` },
              { label: loc('对中心 die 的邻近判定', 'Neighbour decision for the centre die'),
                value: t(isPriorFail(activeOutcome) ? loc('规格或 PAT 已剔除', 'Already removed by spec or PAT')
                  : sourceCount >= state.minFails ? loc('达到门槛，开启邻近规则后剔除', 'Threshold met; reject when neighbourhood screening is enabled')
                    : loc('低于门槛，保留中心 die', 'Below the threshold; keep the centre die')) },
            ]} />}
            <PatHistFig values={run.values} lines={run.applied} windowId={state.window} ariaLabel={t(S.histAria)} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rPat, value: `${stats.patRemoved}` },
                {
                  label: S.rCapture,
                  value: `${stats.latentCaught} / ${stats.latent} (${(stats.capture * 100).toFixed(0)}%)`,
                  state: captureOk ? 'pass' : 'fail',
                },
                {
                  label: S.rYield,
                  value: `${(stats.yieldLoss * 100).toFixed(2)}%`,
                  state: yieldOk ? 'pass' : 'fail',
                },
                { label: S.rEscape, value: `${stats.escapes}` },
                { label: S.rNbr, value: `${stats.nbrExtra}` },
                { label: S.rLotLim, value: fmtLim(run.lotLimits) },
                { label: S.rWaferLim, value: fmtLim(run.waferLimits) },
                { label: S.rShift, value: shiftSigma.toFixed(2) },
              ]}
            />
          </div>
        </div>

        <div className="rel-pat-hand">
          <h3>{t(S.handTitle)}</h3>
          <p>{t(S.handNote)}</p>
          <p className="rel-pat-hand__data">{SAMPLE_TEXT}</p>
          <label className="rel-pat-hand__row">
            <span>{t(S.handMedianLabel)}</span>
            <input
              type="number"
              step="any"
              aria-label={t(S.handMedianLabel)}
              value={state.handMedian}
              onChange={(event) => update({ handMedian: event.target.value })}
            />
            <span className={handClass(medianState)}>{handLabel(medianState)}</span>
          </label>
          <label className="rel-pat-hand__row">
            <span>{t(S.handMadLabel)}</span>
            <input
              type="number"
              step="any"
              aria-label={t(S.handMadLabel)}
              value={state.handMad}
              onChange={(event) => update({ handMad: event.target.value })}
            />
            <span className={handClass(madState)}>{handLabel(madState)}</span>
          </label>
        </div>
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
