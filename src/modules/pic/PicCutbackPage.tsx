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
import { type Die } from '../qual/core/wafer'
import { WaferMap } from '../qual/WaferMap'
import { PIC_META } from './meta'
import {
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  RADIAL_OPTIONS,
  S,
  TAKEAWAY,
  fill,
  taskItems,
  verdictOf,
} from './picCutbackData'
import { DARK_THRESHOLD_NA, DEFAULT_CUT, LENGTHS_CM, analyseCut, type CutPoint, type CutState } from './picCutbackModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

const PLOT_SUMMARY = loc(
  '斜率 {slope} dB/cm，截距 {intercept} dB。GC 损耗是截距的一半，等于 {gc} dB。',
  'Slope {slope} dB/cm, intercept {intercept} dB. GC loss is half the intercept, {gc} dB.',
)

const MAP_SUMMARY = loc(
  '晶圆上提取损耗从 {lo} 到 {hi} dB/cm。选中第 {row} 行第 {col} 列，斜率 {loss} dB/cm。',
  'Extracted loss on the wafer runs from {lo} to {hi} dB/cm. Selected row {row}, column {col}, slope {loss} dB/cm.',
)

function CutScatter({
  points,
  slope,
  intercept,
  aria,
  xLabel,
  yLabel,
  summary,
}: {
  points: CutPoint[]
  slope: number
  intercept: number
  aria: string
  xLabel: string
  yLabel: string
  summary: string
}) {
  const W = 520
  const H = 280
  const L = 52
  const R = 16
  const T = 28
  const B = 36
  const xMax = 2.4
  const samples = [...points.map((point) => point.lossDb), intercept, slope * xMax + intercept]
  const yMax = Math.max(1, ...samples) * 1.12
  const xOf = (x: number) => L + (x / xMax) * (W - L - R)
  const yOf = (y: number) => T + (1 - y / yMax) * (H - T - B)

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill="#0d1117" />
        <text x={8} y={16} fill="#c9d1d9" fontSize={11}>
          {yLabel}
        </text>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#161b22" stroke="#3d4756" />
        {[0, 1, 2, 3].map((tick) => {
          const y = yMax * (tick / 3)
          return (
            <text key={tick} x={L - 6} y={yOf(y) + 3} fill="#8b949e" fontSize={10} textAnchor="end">
              {y.toFixed(1)}
            </text>
          )
        })}
        {[0, 1, 2].map((x) => (
          <text key={x} x={xOf(x)} y={H - 18} fill="#8b949e" fontSize={10} textAnchor="middle">
            {String(x)}
          </text>
        ))}
        <line x1={xOf(0)} y1={yOf(intercept)} x2={xOf(xMax)} y2={yOf(slope * xMax + intercept)} stroke="#e8c45a" strokeWidth={1.8} />
        {points.map((point, index) => (
          <circle key={index} cx={xOf(point.lengthCm)} cy={yOf(point.lossDb)} r={3.5} fill="#58a6ff" />
        ))}
        <text x={(L + W - R) / 2} y={H - 4} fill="#8b949e" fontSize={11} textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

export function PicCutbackPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CutState>(DEFAULT_CUT)
  const [picked, setPicked] = useState<number | null>(null)
  const analysis = useMemo(() => analyseCut(state), [state])
  const selectedId = analysis.wafer.dies.find((die) => die.id === picked)?.id ?? analysis.wafer.dies[0].id
  const die = analysis.wafer.dies.find((item) => item.id === selectedId) ?? analysis.wafer.dies[0]
  const verdict = verdictOf(state, analysis, die)
  const fit = analysis.fit
  const slope = fit?.slopeDbPerCm ?? 0
  const intercept = fit?.interceptDb ?? 0
  const update = (patch: Partial<CutState>) => setState((prev) => ({ ...prev, ...patch }))
  const toggleLen = (index: number) => {
    setState((prev) => {
      const use = prev.use.map((on, i) => (i === index ? !on : on))
      if (use.filter(Boolean).length < 2) return prev
      return { ...prev, use }
    })
  }
  const reset = () => {
    setState({ ...DEFAULT_CUT, use: [...DEFAULT_CUT.use] })
    setPicked(null)
  }
  const params = analysis.wafer.dies.map((item) => item.param)
  const lo = Math.min(...params)
  const hi = Math.max(...params)
  const colorOf = (item: Die) => {
    const scale = (item.param - lo) / Math.max(hi - lo, 1e-6)
    return `rgb(${Math.round(32 + scale * 196)}, ${Math.round(64 + scale * 110)}, ${Math.round(150 - scale * 70)})`
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picCutback.title)}
      goal={t(PIC_META.picCutback.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picLink' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['picSweep', 'picAlign', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <Knob label={S.lossLabel} value={state.trueLoss} unit="dB/cm" min={0.5} max={6} step={0.1} onChange={(trueLoss) => update({ trueLoss: round(trueLoss, 1) })} />
          <Knob label={S.gcLabel} value={state.gcDb} unit="dB" min={0.5} max={6} step={0.1} onChange={(gcDb) => update({ gcDb: round(gcDb, 1) })} />
          <Knob label={S.noiseLabel} value={state.noiseDb} unit="dB" min={0} max={1} step={0.05} onChange={(noiseDb) => update({ noiseDb: round(noiseDb, 2) })} />
          <Knob label={S.repeatLabel} value={state.repeats} unit="" min={1} max={6} step={1} onChange={(repeats) => update({ repeats: Math.round(repeats) })} />
          <Knob label={S.edgeLabel} value={state.edgeDb} unit="dB/cm" min={0} max={2} step={0.1} onChange={(edgeDb) => update({ edgeDb: round(edgeDb, 1) })} />
          <Knob label={S.darkLabel} value={state.darkNa} unit="nA" min={1} max={80} step={1} onChange={(darkNa) => update({ darkNa: Math.round(darkNa) })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.lenLabel)}</span>
            <div className="seg" role="group" aria-label={t(S.lenLabel)}>
              {LENGTHS_CM.map((lengthCm, index) => (
                <button key={lengthCm} type="button" className={state.use[index] ? 'is-active' : ''} aria-pressed={state.use[index]} onClick={() => toggleLen(index)}>
                  {`${lengthCm} cm`}
                </button>
              ))}
            </div>
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.radialLabel)}</span>
            <Seg options={RADIAL_OPTIONS} value={state.radial} onChange={(radial) => update({ radial })} />
          </div>
        </div>

        <div className="hs-grid">
          <div>
            <CutScatter
              points={analysis.points}
              slope={slope}
              intercept={intercept}
              aria={t(S.plotAria)}
              xLabel={t(S.xLabel)}
              yLabel={t(S.yLabel)}
              summary={t(fill(PLOT_SUMMARY, { slope: slope.toFixed(3), intercept: intercept.toFixed(3), gc: (intercept / 2).toFixed(3) }))}
            />
            <WaferMap
              wafer={analysis.wafer}
              colorOf={colorOf}
              selected={selectedId}
              onPick={setPicked}
              summary={t(fill(MAP_SUMMARY, { lo: lo.toFixed(2), hi: hi.toFixed(2), row: String(die.row + 1), col: String(die.col + 1), loss: die.param.toFixed(3) }))}
              ariaLabel={t(S.mapAria)}
              dieLabel={(item) => t(fill(S.dieLabel, { row: String(item.row + 1), col: String(item.col + 1), loss: item.param.toFixed(3) }))}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rSlope, value: `${slope.toFixed(3)} dB/cm`, state: analysis.slopeErr !== null && Math.abs(analysis.slopeErr) < 0.1 ? 'pass' : 'fail' },
                { label: S.rInt, value: `${intercept.toFixed(3)} dB` },
                { label: S.rGc, value: `${(intercept / 2).toFixed(3)} dB` },
                { label: S.rErr, value: `${(slope - state.trueLoss).toFixed(3)} dB/cm` },
                { label: S.rR2, value: fit ? fit.r2.toFixed(4) : '—' },
                { label: S.rDie, value: `${die.param.toFixed(3)} dB/cm` },
                {
                  label: S.rDark,
                  value: `${state.darkNa} / ${DARK_THRESHOLD_NA} nA`,
                  state: state.darkNa > DARK_THRESHOLD_NA ? 'fail' : 'pass',
                },
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
