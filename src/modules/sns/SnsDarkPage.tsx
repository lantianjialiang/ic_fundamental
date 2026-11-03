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
import { FrameView } from './plots'
import { FOCUS_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, fill, taskItems, verdictOf } from './snsDarkData'
import { COMPARE_S, DEFAULT_DARK, analyseDark, type DarkState, type HistBin } from './snsDarkModel'
import './sns.css'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const asId = (id: string): ModuleId => id as ModuleId

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

function DarkHist({ bins, aria, caption }: { bins: HistBin[]; aria: string; caption: string }) {
  const W = 560
  const H = 220
  const L = 36
  const R = 12
  const T = 16
  const B = 28
  const maxLog = Math.max(...bins.map((bin) => Math.log10(bin.count + 1)), 0.01)
  const innerW = W - L - R
  const innerH = H - T - B
  const gap = 2
  const bw = innerW / bins.length
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <rect x={L} y={T} width={innerW} height={innerH} fill={BOX} stroke={EDGE} />
        {bins.map((bin, index) => {
          const h = (Math.log10(bin.count + 1) / maxLog) * (innerH - 4)
          return (
            <rect
              key={index}
              x={L + index * bw + gap / 2}
              y={T + innerH - h}
              width={Math.max(bw - gap, 1)}
              height={h}
              fill={bin.hot ? GOLD : BLUE}
            />
          )
        })}
        <text x={L} y={H - 8} fill={MUTED} fontSize={11}>
          {bins[0] ? bins[0].x0.toFixed(0) : '0'}
        </text>
        <text x={W - R} y={H - 8} fill={MUTED} fontSize={11} textAnchor="end">
          {bins.length ? bins[bins.length - 1].x1.toFixed(0) : '0'}
        </text>
      </svg>
      <p className="sns-summary">{caption}</p>
    </figure>
  )
}

function ExposureBars({
  now,
  refValue,
  nowLabel,
  refLabel,
  aria,
}: {
  now: number
  refValue: number
  nowLabel: string
  refLabel: string
  aria: string
}) {
  const W = 560
  const H = 96
  const L = 72
  const max = Math.max(now, refValue, 1)
  const wOf = (v: number) => ((W - L - 70) * v) / max
  const rows = [
    { y: 18, label: nowLabel, value: now, color: GOLD },
    { y: 52, label: refLabel, value: refValue, color: BLUE },
  ]
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        {rows.map((row) => (
          <g key={row.label}>
            <text x={8} y={row.y + 16} fill={TEXT} fontSize={12}>
              {row.label}
            </text>
            <rect x={L} y={row.y} width={Math.max(wOf(row.value), 2)} height={18} fill={row.color} />
            <text x={L + wOf(row.value) + 8} y={row.y + 14} fill={MUTED} fontSize={12}>
              {row.value.toFixed(1)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

export function SnsDarkPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DarkState>(DEFAULT_DARK)
  const analysis = useMemo(() => analyseDark(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<DarkState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsDark.title)}
      goal={t(SNS_META.snsDark.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={asId('snsFlat')}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_DARK)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout>{t(S.callout)}</Callout>
        <div className="hs-controls">
          <Knob label={S.darkLabel} value={state.darkE25} unit="e-/s" min={1} max={100} step={1} onChange={(v) => update({ darkE25: Math.round(v) })} />
          <Knob label={S.doubleLabel} value={state.doubleC} unit="°C" min={4} max={14} step={1} onChange={(v) => update({ doubleC: Math.round(v) })} />
          <Knob label={S.tempLabel} value={state.tempC} unit="°C" min={-40} max={125} step={5} onChange={(v) => update({ tempC: Math.round(v) })} />
          <Knob
            label={S.expLabel}
            value={state.exposureS}
            unit="s"
            min={COMPARE_S / 2}
            max={2}
            step={0.05}
            onChange={(v) => update({ exposureS: Math.round(v * 20) / 20 })}
          />
          <Knob label={S.readLabel} value={state.readNoiseE} unit="e-" min={1} max={30} step={1} onChange={(v) => update({ readNoiseE: Math.round(v) })} />
          <Knob label={S.nLabel} value={state.nAvg} unit="" min={1} max={32} step={1} onChange={(v) => update({ nAvg: Math.round(v) })} />
          <Knob label={S.thLabel} value={state.hotTh} unit="DN" min={80} max={2400} step={20} onChange={(v) => update({ hotTh: Math.round(v / 20) * 20 })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.focusLabel)}</span>
            <Seg options={FOCUS_OPTIONS} value={state.focus} onChange={(focus) => update({ focus })} />
          </div>
        </div>
        <div className="hs-grid">
          <div>
            <FrameView
              frame={analysis.frame}
              w={64}
              mode="gray"
              hot={analysis.hotIdx}
              aria={t(S.frameAria)}
              summary={t(fill(S.frameCap, { mean: analysis.meanDn.toFixed(1), hot: String(analysis.hotIdx.length) }))}
            />
            <DarkHist bins={analysis.hist} aria={t(S.histAria)} caption={t(S.histCap)} />
            <ExposureBars
              now={analysis.eNow}
              refValue={analysis.eRef}
              nowLabel={t(S.barNow)}
              refLabel={t(S.barRef)}
              aria={t(S.barAria)}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rMean, value: `${analysis.meanDn.toFixed(1)} DN` },
                { label: S.rSingle, value: `${analysis.singleNorm.toFixed(3)} DN` },
                { label: S.rDsnu, value: `${analysis.dsnuNorm.toFixed(3)} DN` },
                { label: S.rFull, value: `${analysis.fullStd.toFixed(1)} DN` },
                { label: S.rRatio, value: analysis.ratio.toFixed(2) },
                { label: S.rNow, value: `${analysis.eNow.toFixed(1)} e-` },
                { label: S.rRef, value: `${analysis.eRef.toFixed(1)} e-` },
                { label: S.rHot, value: String(analysis.hotIdx.length) },
                { label: S.rInjected, value: String(analysis.injected) },
                { label: S.rRecall, value: `${(analysis.recall * 100).toFixed(0)} %` },
                { label: S.rFalse, value: `${(analysis.falseRate * 100).toFixed(2)} %` },
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
