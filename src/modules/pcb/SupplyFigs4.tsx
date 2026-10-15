import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { S } from './data/pcbSupply'
import { SMT } from './data/pcbSupplySmt'

const L = {
  lowPaste: loc('锡膏偏少', 'low paste'),
  tomb: loc('立碑', 'tombstone'),
  hole: loc('空洞', 'void'),
  heat: loc('峰值约 245 °C', 'peak ≈ 245 °C'),
  bed: loc('针床夹具（弹簧针）', 'bed of nails (spring pins)'),
  fct: loc('FCT：上电、运行、测量', 'FCT: power, run, measure'),
}

const TOP = 152
const PASTE_H = 8
const PASTE = '#7f8c99'
const SOLDER = '#b8c0c8'
const METAL = '#a7afb8'
const MOLTEN = '#e0a040'
const BALLS = [270, 302, 334, 366, 398]
const PADS = [
  ...[110, 164].map((x) => ({ x, w: 24 })),
  ...BALLS.map((x) => ({ x, w: 22 })),
  ...[460, 514].map((x) => ({ x, w: 24 })),
]
const THT_X = [580, 640]
const TEST_X = [130, 250, 340, 480, 540]
const BODY = 'var(--neutral-fill)'
const EDGE = 'var(--text-2)'

function Board() {
  const fill = { fill: 'var(--green-bg)', stroke: 'var(--green-line)' }
  return (
    <g>
      <rect x="70" y="156" width="505" height="20" {...fill} />
      <rect x="585" y="156" width="50" height="20" {...fill} />
      <rect x="645" y="156" width="45" height="20" {...fill} />
      {PADS.map((p) => (
        <rect key={p.x} x={p.x - p.w / 2} y={TOP} width={p.w} height="4" fill="var(--gold)" />
      ))}
      {THT_X.map((x) => (
        <g key={x} fill="var(--gold)">
          <rect x={x - 5} y={TOP} width="2" height="27" />
          <rect x={x + 3} y={TOP} width="2" height="27" />
          <rect x={x - 14} y={TOP} width="9" height="3" />
          <rect x={x + 5} y={TOP} width="9" height="3" />
          <rect x={x - 14} y="176" width="9" height="3" />
          <rect x={x + 5} y="176" width="9" height="3" />
        </g>
      ))}
    </g>
  )
}

function Chip({ x, bottom, joined }: { x: number; bottom: number; joined: boolean }) {
  const y = bottom - 20
  return (
    <g>
      <rect x={x} y={y} width="66" height="20" rx="2" fill={BODY} stroke={EDGE} />
      <rect x={x} y={y} width="8" height="20" fill={METAL} stroke={EDGE} />
      <rect x={x + 58} y={y} width="8" height="20" fill={METAL} stroke={EDGE} />
      {joined ? (
        <g fill={SOLDER} stroke={EDGE} strokeWidth="0.6">
          <polygon points={`${x - 6},${TOP} ${x},134 ${x},${TOP}`} />
          <polygon points={`${x + 72},${TOP} ${x + 66},134 ${x + 66},${TOP}`} />
        </g>
      ) : null}
    </g>
  )
}

function Bga({ reflowed, voidAt }: { reflowed: boolean; voidAt?: number }) {
  const cy = reflowed ? 143 : 133
  const ry = reflowed ? 9 : 11
  return (
    <g>
      <rect x="250" y={cy - ry - 14} width="168" height="14" fill={BODY} stroke={EDGE} />
      {BALLS.map((x) => (
        <ellipse key={x} cx={x} cy={cy} rx={reflowed ? 12 : 11} ry={ry} fill={SOLDER} stroke={EDGE} strokeWidth="0.8" />
      ))}
      {voidAt ? <circle cx={voidAt} cy={cy} r="4" fill="var(--card)" /> : null}
    </g>
  )
}

function Paste({ low, upTo }: { low?: number; upTo?: number }) {
  return (
    <g fill={PASTE}>
      {PADS.filter((p) => upTo === undefined || p.x + p.w / 2 < upTo).map((p) => {
        const h = p.x === low ? 3 : PASTE_H
        return <rect key={p.x} x={p.x - p.w / 2} y={TOP - h} width={p.w} height={h} />
      })}
    </g>
  )
}

function Stencil({ bladeX }: { bladeX: number }) {
  const holes = PADS.map((p) => [p.x - p.w / 2, p.x + p.w / 2]).sort((a, b) => a[0] - b[0])
  const bars: ReactNode[] = []
  let cursor = 70
  holes.forEach(([a, b]) => {
    bars.push(<rect key={a} x={cursor} y={TOP - PASTE_H} width={a - cursor} height={PASTE_H} />)
    cursor = b
  })
  bars.push(<rect key="end" x={cursor} y={TOP - PASTE_H} width={690 - cursor} height={PASTE_H} />)
  return (
    <g>
      <g fill={EDGE} fillOpacity="0.85">
        {bars}
      </g>
      <Paste upTo={bladeX} />
      <circle cx={bladeX + 14} cy="134" r="8" fill={PASTE} />
      <line x1={bladeX} y1="143" x2={bladeX - 35} y2="88" stroke={EDGE} strokeWidth="6" strokeLinecap="round" />
      <rect x={bladeX - 48} y="72" width="26" height="14" rx="3" fill={EDGE} />
      <line x1={bladeX - 34} y1="60" x2={bladeX + 16} y2="60" stroke={EDGE} strokeWidth="1.6" markerEnd="url(#smtArrow)" />
    </g>
  )
}

function Eye({ x, y, w, to }: { x: number; y: number; w: number; to: number }) {
  const cx = x + w / 2
  return (
    <g>
      <polygon points={`${cx - 6},${y + 28} ${cx + 6},${y + 28} ${cx + to},140 ${cx - to},140`} fill="var(--gold-bg)" fillOpacity="0.6" stroke="var(--gold)" strokeWidth="0.6" />
      <rect x={x} y={y} width={w} height="22" rx="4" fill="var(--card)" stroke={EDGE} />
      <circle cx={cx} cy={y + 24} r="6" fill={BODY} stroke={EDGE} />
    </g>
  )
}

function Tht({ fillColor }: { fillColor: string }) {
  return (
    <g>
      {THT_X.map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="138" width="3" height="52" fill={METAL} />
          <rect x={x - 5} y="156" width="10" height="20" fill={fillColor} />
          <polygon points={`${x - 11},179 ${x - 1.5},189 ${x + 1.5},189 ${x + 11},179`} fill={fillColor} stroke={EDGE} strokeWidth="0.6" />
        </g>
      ))}
      <rect x="560" y="96" width="100" height="44" rx="8" fill={BODY} stroke={EDGE} />
      <rect x="566" y="100" width="10" height="36" rx="3" fill={METAL} fillOpacity="0.5" />
    </g>
  )
}

function Sources({ step }: { step: number }) {
  if (step === 7) {
    return (
      <g>
        {TEST_X.map((x) => (
          <g key={x}>
            <rect x={x - 6} y="176" width="12" height="3" fill="var(--gold)" />
            <rect x={x - 1} y="179" width="2" height="14" fill={METAL} />
            <rect x={x - 3} y="193" width="6" height="19" fill={BODY} stroke={EDGE} strokeWidth="0.6" />
          </g>
        ))}
      </g>
    )
  }
  return null
}

export function SmtFig({ step, onPick }: { step: number; onPick: (i: number) => void }) {
  const { t } = useLocale()
  const soldered = step >= 3
  const bottom = soldered ? 150 : 144
  const tomb = step === 4
  const leadFill = step === 6 ? MOLTEN : SOLDER
  const heat = [200, 300, 400, 500, 600]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 282" className="term-fig__svg" role="group" aria-label={t(S.smtCap)}>
        <defs>
          <marker id="smtArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={EDGE} />
          </marker>
          <marker id="smtHot" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--red)" />
          </marker>
        </defs>
        <rect width="760" height="282" rx="10" fill="var(--well)" />
        <Board />
        {step === 0 ? <Stencil bladeX={231} /> : null}
        {step === 1 || step === 2 ? <Paste low={step === 1 ? BALLS[2] : undefined} /> : null}
        {step >= 2 ? <Chip x={104} bottom={bottom} joined={soldered} /> : null}
        {step >= 2 ? <Bga reflowed={soldered} voidAt={step === 5 ? BALLS[2] : undefined} /> : null}
        {step >= 3 && !tomb ? <Chip x={454} bottom={bottom} joined /> : null}
        {step === 2 ? <Chip x={454} bottom={126} joined={false} /> : null}
        {tomb ? (
          <g>
            <g transform="rotate(-65 454 150)">
              <Chip x={454} bottom={150} joined={false} />
            </g>
            <polygon points={`448,${TOP} 454,134 454,${TOP}`} fill={SOLDER} stroke={EDGE} strokeWidth="0.6" />
          </g>
        ) : null}
        {step === 1 ? (
          <g>
            <Eye x={300} y={30} w={68} to={76} />
            <circle cx={BALLS[2]} cy="148" r="15" fill="none" stroke="var(--red)" strokeWidth="2" />
            <text x={BALLS[2]} y="122" textAnchor="middle" fill="var(--red)" fontSize="11" fontWeight="700">
              {t(L.lowPaste)}
            </text>
          </g>
        ) : null}
        {step === 2 ? (
          <g>
            <rect x="483" y="52" width="8" height="34" fill={METAL} stroke={EDGE} strokeWidth="0.6" />
            <polygon points="481,86 493,86 497,106 477,106" fill={METAL} stroke={EDGE} strokeWidth="0.6" />
            <line x1="545" y1="76" x2="545" y2="112" stroke={EDGE} strokeWidth="1.6" markerEnd="url(#smtArrow)" />
          </g>
        ) : null}
        {step === 3 ? (
          <g>
            {heat.map((x) => (
              <g key={x} stroke="var(--red)" strokeWidth="1.8">
                <line x1={x} y1="66" x2={x} y2="96" markerEnd="url(#smtHot)" />
                <line x1={x} y1="214" x2={x} y2="190" markerEnd="url(#smtHot)" />
              </g>
            ))}
            <text x="74" y="84" fill="var(--red)" fontSize="11" fontWeight="700">
              {t(L.heat)}
            </text>
          </g>
        ) : null}
        {step === 4 ? (
          <g>
            <Eye x={452} y={30} w={70} to={47} />
            <circle cx="470" cy="122" r="36" fill="none" stroke="var(--red)" strokeWidth="2" />
            <text x="546" y="126" fill="var(--red)" fontSize="11" fontWeight="700">
              {t(L.tomb)}
            </text>
          </g>
        ) : null}
        {step === 5 ? (
          <g>
            <polygon points="326,196 342,196 418,60 250,60" fill="var(--gold-bg)" fillOpacity="0.6" stroke="var(--gold)" strokeWidth="0.6" />
            <rect x="250" y="46" width="168" height="14" rx="3" fill="var(--card)" stroke={EDGE} />
            <rect x="304" y="196" width="60" height="18" rx="3" fill="var(--card)" stroke={EDGE} />
            <circle cx={BALLS[2]} cy="143" r="16" fill="none" stroke="var(--red)" strokeWidth="2" />
            <text x={BALLS[2]} y="102" textAnchor="middle" fill="var(--red)" fontSize="11" fontWeight="700">
              {t(L.hole)}
            </text>
          </g>
        ) : null}
        {step >= 6 ? <Tht fillColor={leadFill} /> : null}
        {step === 6 ? <path d="M500 226 Q530 181 560 180 L660 180 Q690 181 720 226 Z" fill={MOLTEN} fillOpacity="0.85" /> : null}
        <Sources step={step} />
        {step === 7 ? (
          <g>
            <rect x="90" y="212" width="580" height="16" rx="3" fill="var(--card)" stroke={EDGE} />
            <text x="380" y="224" textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(L.bed)}
            </text>
          </g>
        ) : null}
        {step === 8 ? (
          <g>
            {[300, 360, 420].map((x) => (
              <g key={x}>
                <rect x={x - 6} y="176" width="12" height="3" fill="var(--gold)" />
                <line x1={x} y1="179" x2={x} y2="198" stroke="var(--gold)" strokeWidth="1.6" />
              </g>
            ))}
            <rect x="250" y="198" width="220" height="28" rx="5" fill="var(--card)" stroke={EDGE} />
            <text x="360" y="216" textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(L.fct)}
            </text>
          </g>
        ) : null}
        {SMT.map((s, i) => {
          const on = i === step
          const x = 14 + i * 82
          return (
            <Hit key={s.id} label={t(s.title)} active={on} onPick={() => onPick(i)}>
              <rect x={x} y="242" width="76" height="28" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <text x={x + 38} y="260" textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="11" fontWeight={on ? 700 : 400}>
                {`${i + 1} ${t(s.short)}`}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.smtCap)}</figcaption>
    </figure>
  )
}
