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
import { PIC_META } from './meta'
import {
  INTRO,
  MISCONCEPTIONS,
  MW3_OPTIONS,
  NODE_LABEL,
  QUIZ,
  S,
  TAKEAWAY,
  fill,
  lossOptions,
  taskItems,
  verdictOf,
} from './picUnitsData'
import {
  DEFAULT_UNITS,
  NODE_IDS,
  analyseUnits,
  fmtDbm,
  fmtMw,
  type Mw3Id,
  type UnitsNode,
  type UnitsState,
} from './picUnitsModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'

function PowerChain({ nodes, aria, summary }: { nodes: Array<UnitsNode & { name: string }>; aria: string; summary: string }) {
  const width = 680
  const height = 148
  const boxW = 104
  const boxH = 40
  const gap = 28
  const y = 16
  const row = nodes.length * boxW + (nodes.length - 1) * gap
  const x0 = (width - row) / 2
  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={width} height={height} rx={10} fill={BG} />
        {nodes.map((node, index) => {
          const x = x0 + index * (boxW + gap)
          const next = index < nodes.length - 1
          return (
            <g key={node.id}>
              {next ? (
                <line x1={x + boxW} y1={y + boxH / 2} x2={x + boxW + gap - 6} y2={y + boxH / 2} stroke={GOLD} strokeWidth={1.4} />
              ) : null}
              <rect x={x} y={y} width={boxW} height={boxH} rx={8} fill={BOX} stroke={EDGE} />
              <text x={x + boxW / 2} y={y + 25} textAnchor="middle" fill={TEXT} fontSize={12}>
                {node.name}
              </text>
              <text x={x + boxW / 2} y={y + boxH + 18} textAnchor="middle" fill={TEXT} fontSize={11}>
                {`${fmtDbm(node.dbm)} dBm`}
              </text>
              <text x={x + boxW / 2} y={y + boxH + 34} textAnchor="middle" fill={MUTED} fontSize={11}>
                {`${fmtMw(node.mw)} mW`}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

export function PicUnitsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<UnitsState>(DEFAULT_UNITS)
  const analysis = useMemo(() => analyseUnits(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<UnitsState>) => setState((prev) => ({ ...prev, ...patch }))
  const chain = NODE_IDS.map((id, index) => ({ ...analysis.nodes[index], name: t(NODE_LABEL[id]) }))
  const round1 = (value: number) => Math.round(value * 10) / 10

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picUnits.title)}
      goal={t(PIC_META.picUnits.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picDevice' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(analysis)} onReset={() => setState(DEFAULT_UNITS)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfDb']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <Knob label={S.laserLabel} value={state.laserDbm} unit="dBm" min={-5} max={15} step={1} onChange={(laserDbm) => update({ laserDbm })} />
          <Knob label={S.gcInLabel} value={state.gcInDb} unit="dB" min={0} max={6} step={0.5} onChange={(gcInDb) => update({ gcInDb })} />
          <Knob label={S.lengthLabel} value={state.lengthCm} unit="cm" min={0.1} max={2} step={0.1} onChange={(lengthCm) => update({ lengthCm: round1(lengthCm) })} />
          <Knob label={S.lossLabel} value={state.lossDbPerCm} unit="dB/cm" min={0.5} max={5} step={0.5} onChange={(lossDbPerCm) => update({ lossDbPerCm })} />
          <Knob label={S.modLabel} value={state.modDb} unit="dB" min={0} max={8} step={1} onChange={(modDb) => update({ modDb })} />
          <Knob label={S.gcOutLabel} value={state.gcOutDb} unit="dB" min={0} max={6} step={0.5} onChange={(gcOutDb) => update({ gcOutDb })} />
          <Knob label={S.lambdaLabel} value={state.lambdaNm} unit="nm" min={1270} max={1610} step={10} onChange={(lambdaNm) => update({ lambdaNm })} />
        </div>
        <div className="hs-field">
          <span className="hs-field__label">{t(S.mw3Label)}</span>
          <Seg options={MW3_OPTIONS} value={state.mw3} onChange={(mw3) => update({ mw3: mw3 as Mw3Id })} />
        </div>
        <div className="hs-field">
          <span className="hs-field__label">{t(S.lossPickLabel)}</span>
          <Seg options={lossOptions(analysis.parts)} value={state.lossPick} onChange={(lossPick) => update({ lossPick })} />
        </div>
        <PowerChain
          nodes={chain}
          aria={t(S.chainAria)}
          summary={t(
            fill(S.chainSum, {
              out: fmtDbm(analysis.arrival),
              mw: fmtMw(analysis.nodes[analysis.nodes.length - 1].mw),
              loss: analysis.total.toFixed(2),
            }),
          )}
        />
        <Readout
          items={[
            { label: S.rFreq, value: `${analysis.freqTHz.toFixed(1)} THz` },
            { label: S.rTotal, value: `${analysis.total.toFixed(2)} dB` },
            { label: S.rArrival, value: `${fmtDbm(analysis.arrival)} dBm` },
            ...chain.map((node) => ({
              label: fill(S.rNode, { name: node.name }),
              value: `${fmtDbm(node.dbm)} dBm / ${fmtMw(node.mw)} mW`,
            })),
            ...(state.mw3 === 'on' ? [{ label: S.rMw3, value: `${analysis.mw3.toFixed(3)} mW` }] : []),
          ]}
        />
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
