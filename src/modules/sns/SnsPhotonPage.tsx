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
import {
  DOM_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  plotSummary,
  taskItems,
  verdictOf,
} from './snsPhotonData'
import { DEFAULT_PHOTON, analysePhoton, photonFlags, snrCurve, type PhotonState, type SnrPoint } from './snsPhotonModel'
import './sns.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const q = (value: number, digits: number) => Number(value.toFixed(digits))

function fmtCount(n: number): string {
  if (!Number.isFinite(n)) return '--'
  const abs = Math.abs(n)
  if (abs >= 1e5 || (abs > 0 && abs < 1e-2)) return n.toExponential(3)
  if (abs >= 100) return n.toFixed(1)
  return n.toFixed(3)
}

function SnrPlot({
  points,
  signal,
  aria,
  summary,
  xLabel,
  yLabel,
}: {
  points: SnrPoint[]
  signal: number
  aria: string
  summary: string
  xLabel: string
  yLabel: string
}) {
  const W = 560
  const H = 280
  const L = 46
  const R = 16
  const T = 24
  const B = 34
  const xs = points.map((p) => Math.log10(p.signal))
  const ys = points.flatMap((p) => [p.snr, p.shot])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  let y0 = Math.min(...ys)
  let y1 = Math.max(...ys)
  const pad = (y1 - y0) * 0.08 || 1
  y0 -= pad
  y1 += pad
  const xOf = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R)
  const yOf = (v: number) => T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B)
  const line = (pick: 'snr' | 'shot') =>
    points.map((p) => `${xOf(Math.log10(p.signal)).toFixed(1)},${yOf(p[pick]).toFixed(1)}`).join(' ')
  const mark = Math.min(Math.max(signal, points[0].signal), points[points.length - 1].signal)
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill="#0d1117" />
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#161b22" stroke="#3d4756" />
        <line x1={xOf(Math.log10(mark))} x2={xOf(Math.log10(mark))} y1={T} y2={H - B} stroke="#8b949e" strokeDasharray="3 3" />
        <polyline fill="none" stroke="#e8c45a" strokeWidth={1.6} points={line('shot')} />
        <polyline fill="none" stroke="#58a6ff" strokeWidth={1.8} points={line('snr')} />
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

export function SnsPhotonPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PhotonState>(DEFAULT_PHOTON)
  const analysis = useMemo(() => analysePhoton(state), [state])
  const curve = useMemo(() => snrCurve(analysis.darkE, state.read), [analysis.darkE, state.read])
  const verdict = verdictOf(state, analysis)
  const flags = photonFlags(state, analysis)
  const update = (patch: Partial<PhotonState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsPhoton.title)}
      goal={t(SNS_META.snsPhoton.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'snsPixel' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_PHOTON)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaOverview', 'anaStats']} onOpen={onModuleChange} />
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

        <Callout>{t(S.teach)}</Callout>
        <div className="hs-controls">
          <Knob label={S.lambdaLabel} value={state.lambdaNm} unit="nm" min={400} max={1000} step={10} onChange={(v) => update({ lambdaNm: v })} />
          <Knob label={S.powerLabel} value={state.powerPw} unit="pW" min={0.1} max={20} step={0.1} onChange={(v) => update({ powerPw: q(v, 1) })} />
          <Knob label={S.areaLabel} value={state.areaUm2} unit="um2" min={1} max={10} step={0.5} onChange={(v) => update({ areaUm2: q(v, 1) })} />
          <Knob label={S.expLabel} value={state.exposureMs} unit="ms" min={1} max={50} step={1} onChange={(v) => update({ exposureMs: v })} />
          <Knob label={S.qeLabel} value={state.qe} unit="" min={0.05} max={1} step={0.05} onChange={(v) => update({ qe: q(v, 2) })} />
          <Knob label={S.darkLabel} value={state.darkPerS} unit="e-/s" min={0} max={2000} step={10} onChange={(v) => update({ darkPerS: v })} />
          <Knob label={S.readLabel} value={state.read} unit="e-" min={0} max={100} step={1} onChange={(v) => update({ read: v })} />
          <Knob label={S.signalLabel} value={state.signal} unit="e-" min={0} max={20000} step={100} onChange={(v) => update({ signal: v })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.domLabel)}</span>
            <Seg options={DOM_OPTIONS} value={state.dom} onChange={(dom) => update({ dom })} />
          </div>
        </div>
        <div className="hs-grid">
          <SnrPlot
            points={curve}
            signal={state.signal}
            aria={t(S.plotAria)}
            summary={t(plotSummary(state, analysis))}
            xLabel={t(S.plotX)}
            yLabel={t(S.plotY)}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rEnergy, value: `${analysis.energyEv.toFixed(3)} eV` },
                { label: S.rFlux, value: `${fmtCount(analysis.photonsPerS)} /s` },
                { label: S.rPhotons, value: fmtCount(analysis.photons) },
                { label: S.rOptical, value: fmtCount(analysis.opticalE) },
                { label: S.rResp, value: `${analysis.resp.toFixed(3)} A/W`, state: flags.t1 ? 'pass' : undefined },
                { label: S.rIrr, value: `${fmtCount(analysis.irradiance)} W/m2` },
                { label: S.rDarkE, value: analysis.darkE.toFixed(2) },
                { label: S.rShot, value: analysis.shotRms.toFixed(2) },
                { label: S.rDarkRms, value: analysis.darkRms.toFixed(2) },
                { label: S.rRead, value: analysis.readRms.toFixed(2) },
                { label: S.rSnr, value: `${analysis.snr.toFixed(2)} dB`, state: flags.t2 ? 'pass' : undefined },
                { label: S.rLin, value: analysis.snrLin.toFixed(2) },
                { label: S.rCross, value: analysis.crossE.toFixed(1), state: flags.t3 ? 'pass' : undefined },
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
