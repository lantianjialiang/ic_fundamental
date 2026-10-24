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
import { DEFAULT_PAT, type Limits, type PatState, TARGET_CAPTURE, TARGET_YIELD_LOSS, runPat, samplePat } from './relPatModel'
import { WaferMap } from './WaferMap'
import './relPat.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const fmtLim = (l: Limits) => `[${l.lo.toFixed(1)}, ${l.hi.toFixed(1)}]`

export function RelPatPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PatState>(DEFAULT_PAT)
  const [picked, setPicked] = useState<number | null>(null)
  const run = useMemo(() => runPat(state), [state])
  const { stats } = run
  const hand = useMemo(() => samplePat(state.k), [state.k])
  const verdict = verdictOf(state, run)
  const captureOk = stats.capture >= TARGET_CAPTURE
  const yieldOk = stats.yieldLoss <= TARGET_YIELD_LOSS
  const shiftSigma = (run.waferMedian - run.lotMedian) / run.sigmaRob

  const update = (patch: Partial<PatState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    if (patch.wafer !== undefined) {
      setPicked(null)
    }
  }
  const reset = () => {
    setState(DEFAULT_PAT)
    setPicked(null)
  }

  const colorOf = (die: Die) => {
    if (state.colorBy === 'param') {
      if (die.hardFail) {
        return '#484f58'
      }
      return paramColor((die.param - run.lotMedian) / run.sigmaRob)
    }
    return OUTCOME_COLOR[run.outcome[die.id]]
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

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
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
          <div className="hs-field">
            <span className="hs-field__label">{t(S.colorLabel)}</span>
            <Seg options={COLOR_SEG} value={state.colorBy} onChange={(colorBy) => update({ colorBy })} />
          </div>
        </div>

        <div className="hs-grid">
          <div className="rel-pat-figs">
            <WaferMap
              wafer={run.map}
              colorOf={colorOf}
              selected={picked}
              onPick={setPicked}
              summary={t(waferSummary(run))}
              ariaLabel={t(S.mapAria)}
              dieLabel={dieLabel}
            />
            {state.colorBy === 'outcome' ? <OutcomeLegend /> : <p className="rel-pat-legend">{t(S.paramLegend)}</p>}
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
