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
import { SNS_META } from './meta'
import { DefectMapView, FrameView } from './plots'
import { FOCUS_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, fill, taskItems, verdictOf } from './snsFlatData'
import { DEFAULT_FLAT, FLAT_W, analyseFlat, type FlatState } from './snsFlatModel'
import './sns.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const asId = (id: string): ModuleId => id as ModuleId

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

function LineFig({
  means,
  exposures,
  slope,
  intercept,
  at,
  aria,
  caption,
  xLabel,
  yLabel,
}: {
  means: number[]
  exposures: number[]
  slope: number
  intercept: number
  at: number
  aria: string
  caption: string
  xLabel: string
  yLabel: string
}) {
  const W = 560
  const H = 240
  const L = 40
  const R = 16
  const T = 28
  const B = 36
  const x0 = Math.min(...exposures)
  const x1 = Math.max(...exposures)
  const y0 = Math.min(...means) * 0.85
  const y1 = Math.max(...means) * 1.08
  const xOf = (x: number) => L + ((x - x0) / (x1 - x0 || 1)) * (W - L - R)
  const yOf = (y: number) => T + (1 - (y - y0) / (y1 - y0 || 1)) * (H - T - B)
  const fit = `${xOf(x0).toFixed(1)},${yOf(slope * x0 + intercept).toFixed(1)} ${xOf(x1).toFixed(1)},${yOf(slope * x1 + intercept).toFixed(1)}`
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        <polyline fill="none" stroke={GOLD} strokeWidth={1.6} points={fit} />
        {means.map((mean, index) => (
          <circle key={index} cx={xOf(exposures[index])} cy={yOf(mean)} r={index === at ? 5.5 : 3.2} fill={index === at ? GOLD : BLUE} />
        ))}
        <text x={L} y={16} fill={TEXT} fontSize={11}>
          {yLabel}
        </text>
        <text x={W / 2} y={H - 10} fill={MUTED} fontSize={11} textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      <p className="sns-summary">{caption}</p>
    </figure>
  )
}

export function SnsFlatPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<FlatState>(DEFAULT_FLAT)
  const analysis = useMemo(() => analyseFlat(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<FlatState>) => setState((prev) => ({ ...prev, ...patch }))
  const share = Number.isFinite(analysis.temporalShare) ? `${(analysis.temporalShare * 100).toFixed(1)} %` : '—'

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsFlat.title)}
      goal={t(SNS_META.snsFlat.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={asId('snsOptical')}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_FLAT)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaStats']} onOpen={onModuleChange} />
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
        <PracticeSteps items={taskItems(state, analysis)} />

        <Callout>{t(S.callout)}</Callout>
        <div className="hs-controls">
          <Knob label={S.prnuLabel} value={state.prnuPct} unit="%" min={0.2} max={3} step={0.1} onChange={(v) => update({ prnuPct: Math.round(v * 10) / 10 })} />
          <Knob label={S.shadeLabel} value={state.shadingPct} unit="%" min={0} max={10} step={0.5} onChange={(v) => update({ shadingPct: Math.round(v * 2) / 2 })} />
          <Knob label={S.nLabel} value={state.nAvg} unit="" min={1} max={16} step={1} onChange={(v) => update({ nAvg: Math.round(v) })} />
          <Knob label={S.deadLabel} value={state.thDead} unit="" min={0} max={0.8} step={0.01} onChange={(v) => update({ thDead: Math.round(v * 100) / 100 })} />
          <Knob label={S.lowLabel} value={state.thLow} unit="" min={0.05} max={0.9} step={0.05} onChange={(v) => update({ thLow: Math.round(v * 20) / 20 })} />
          <Knob label={S.hotLabel} value={state.thHot} unit="DN" min={100} max={2500} step={50} onChange={(v) => update({ thHot: Math.round(v / 50) * 50 })} />
          <Knob label={S.nlLabel} value={state.nonlin} unit="" min={0} max={0.12} step={0.005} onChange={(v) => update({ nonlin: Math.round(v * 200) / 200 })} />
        </div>
        <div className="hs-controls">
          <label className="hs-field__label">
            <input type="checkbox" checked={state.darkCorrect} onChange={(event) => update({ darkCorrect: event.target.checked })} />
            {` ${t(S.darkLabel)}`}
          </label>
          <label className="hs-field__label">
            <input type="checkbox" checked={state.removeShading} onChange={(event) => update({ removeShading: event.target.checked })} />
            {` ${t(S.shadeToggle)}`}
          </label>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.focusLabel)}</span>
            <Seg options={FOCUS_OPTIONS} value={state.focus} onChange={(focus) => update({ focus })} />
          </div>
        </div>
        <div className="hs-grid">
          <div>
            <FrameView
              frame={analysis.frame}
              w={FLAT_W}
              mode="heat"
              aria={t(S.frameAria)}
              summary={t(fill(S.frameCap, { prnu: (analysis.prnuShown * 100).toFixed(2) }))}
            />
            <DefectMapView
              kind={analysis.kind}
              w={FLAT_W}
              aria={t(S.mapAria)}
              summary={t(
                fill(S.mapCap, {
                  d: String(analysis.counts.dead),
                  h: String(analysis.counts.hot),
                  l: String(analysis.counts.low),
                  k: String(analysis.clusters),
                }),
              )}
              legend={{ ok: t(S.legOk), dead: t(S.legDead), hot: t(S.legHot), low: t(S.legLow) }}
            />
            <LineFig
              means={analysis.means}
              exposures={analysis.exposures}
              slope={analysis.slope}
              intercept={analysis.intercept}
              at={analysis.atIndex}
              aria={t(S.linAria)}
              caption={t(S.linCap)}
              xLabel={t(S.axX)}
              yLabel={t(S.axY)}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rShown, value: `${(analysis.prnuShown * 100).toFixed(2)} %` },
                { label: S.rOn, value: `${(analysis.prnuOn * 100).toFixed(2)} %` },
                { label: S.rOff, value: `${(analysis.prnuOff * 100).toFixed(2)} %` },
                { label: S.rFormula, value: `${(analysis.prnuFormula * 100).toFixed(2)} %` },
                { label: S.rSigma, value: analysis.sigmaOverMu.toFixed(4) },
                { label: S.rShare, value: share },
                { label: S.rDead, value: `${analysis.counts.dead} / ${analysis.mask.dead}` },
                { label: S.rHot, value: `${analysis.counts.hot} / ${analysis.mask.hot}` },
                { label: S.rLow, value: `${analysis.counts.low} / ${analysis.mask.low}` },
                { label: S.rCluster, value: String(analysis.clusters) },
                { label: S.rDev, value: `${analysis.maxDevPct.toFixed(2)} %` },
                { label: S.rExp, value: `${(analysis.exposures[analysis.atIndex] ?? 0).toFixed(3)} s` },
              ]}
            />
          </div>
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
