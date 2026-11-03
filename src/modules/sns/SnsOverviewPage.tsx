import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { SNS_META } from './meta'
import {
  COMP_OPTIONS,
  FIG,
  INTRO,
  MARK_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  STIMULUS_CARDS,
  TAKEAWAY,
  curveSummary,
  taskItems,
  verdictOf,
} from './snsOverviewData'
import { DEFAULT_OVERVIEW, SCAN_X, analyseOverview, overviewFlags, type OverviewState } from './snsOverviewModel'
import './sns.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const q = (value: number, digits: number) => Number(value.toFixed(digits))

function TransferFig({
  xs,
  ys,
  slope,
  intercept,
  aria,
  summary,
  xLabel,
  yLabel,
}: {
  xs: number[]
  ys: number[]
  slope: number
  intercept: number
  aria: string
  summary: string
  xLabel: string
  yLabel: string
}) {
  const W = 560
  const H = 240
  const L = 46
  const R = 16
  const T = 24
  const B = 32
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const fitted = xs.map((x) => slope * x + intercept)
  let y0 = Math.min(...ys, ...fitted)
  let y1 = Math.max(...ys, ...fitted)
  if (y1 - y0 < 1e-6) {
    y0 -= 1
    y1 += 1
  }
  const pad = (y1 - y0) * 0.12
  y0 -= pad
  y1 += pad
  const xOf = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R)
  const yOf = (v: number) => T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B)
  const line = xs.map((x, index) => `${xOf(x).toFixed(1)},${yOf(fitted[index]).toFixed(1)}`).join(' ')
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill="#0d1117" />
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#161b22" stroke="#3d4756" />
        <polyline fill="none" stroke="#e8c45a" strokeWidth={1.6} points={line} />
        {xs.map((x, index) => (
          <circle key={x} cx={xOf(x)} cy={yOf(ys[index])} r={3.4} fill="#58a6ff" />
        ))}
        <text x={8} y={15} fill="#c9d1d9" fontSize={11}>
          {yLabel}
        </text>
        <text x={W / 2} y={H - 8} fill="#8b949e" fontSize={11} textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      <p className="sns-summary">{summary}</p>
    </figure>
  )
}

export function SnsOverviewPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<OverviewState>(DEFAULT_OVERVIEW)
  const analysis = useMemo(() => analyseOverview(state), [state])
  const verdict = verdictOf(state, analysis)
  const flags = overviewFlags(state, analysis)
  const update = (patch: Partial<OverviewState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsOverview.title)}
      goal={t(SNS_META.snsOverview.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'snsPhoton' as ModuleId}
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(state, analysis)}
          onReset={() => setState({ ...DEFAULT_OVERVIEW, marks: { ...DEFAULT_OVERVIEW.marks } })}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaOverview', 'anaTrim']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout>{t(S.teach)}</Callout>
        <div className="hs-controls">
          <Knob label={S.sLabel} value={state.s} unit="" min={0.5} max={5} step={0.1} onChange={(v) => update({ s: q(v, 1) })} />
          <Knob label={S.bLabel} value={state.b} unit="" min={-0.5} max={1} step={0.05} onChange={(v) => update({ b: q(v, 2) })} />
          <Knob label={S.nlLabel} value={state.nl} unit="" min={-0.2} max={0.2} step={0.01} onChange={(v) => update({ nl: q(v, 2) })} />
          <Knob label={S.noiseLabel} value={state.noise} unit="" min={0} max={0.5} step={0.01} onChange={(v) => update({ noise: q(v, 2) })} />
          <Knob label={S.tcoLabel} value={state.tco} unit="/C" min={-0.02} max={0.02} step={0.001} onChange={(v) => update({ tco: q(v, 3) })} />
          <Knob label={S.nLabel} value={state.nAvg} unit="" min={1} max={64} step={1} onChange={(v) => update({ nAvg: v })} />
          <Knob label={S.tempALabel} value={state.tempA} unit="C" min={-40} max={125} step={5} onChange={(v) => update({ tempA: v })} />
          <Knob label={S.tempBLabel} value={state.tempB} unit="C" min={-40} max={125} step={5} onChange={(v) => update({ tempB: v })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.compLabel)}</span>
            <Seg options={COMP_OPTIONS} value={state.comp} onChange={(comp) => update({ comp })} />
          </div>
        </div>
        <div className="hs-grid">
          <TransferFig
            xs={SCAN_X}
            ys={analysis.ys}
            slope={analysis.ls.slope}
            intercept={analysis.ls.intercept}
            aria={t(FIG.curveAria)}
            summary={t(curveSummary(analysis))}
            xLabel={t(FIG.curveX)}
            yLabel={t(FIG.curveY)}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rTpS, value: analysis.tp.s.toFixed(3), state: flags.t1 ? 'pass' : undefined },
                { label: S.rTpB, value: analysis.tp.b.toFixed(3), state: flags.t1 ? 'pass' : undefined },
                { label: S.rLsS, value: analysis.ls.slope.toFixed(3) },
                { label: S.rLsB, value: analysis.ls.intercept.toFixed(3) },
                { label: S.rNl, value: `${analysis.maxNlPct.toFixed(2)} %` },
                { label: S.rStd, value: analysis.stdS.toFixed(4) },
                { label: S.rRatio, value: analysis.tighten.toFixed(3) },
                { label: S.rTco, value: analysis.tcoEst.toFixed(4) },
              ]}
            />
          </div>
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.markLabel)}</span>
            <Seg
              options={MARK_OPTIONS}
              value={state.marks[state.picked]}
              onChange={(mark) => setState((prev) => ({ ...prev, marks: { ...prev.marks, [prev.picked]: mark } }))}
            />
          </div>
        </div>
        <Cards items={STIMULUS_CARDS} activeId={state.picked} cols={4} onPick={(item) => update({ picked: item.id })} />
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
