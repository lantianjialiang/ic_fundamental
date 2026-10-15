import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { T } from './FlowFigs'

// 画布局部坐标 578 × 302；板子 30 × 20 mm，10 px 每 mm
const S = 10
const BX = 14
const BY = 51
const BW = 30
const BH = 20
const RED = 'var(--red)'
const BLUE = 'var(--blue)'
const X = (mm: number) => BX + mm * S
const Y = (mm: number) => BY + mm * S

const L = {
  boardCap: loc('30 × 20 mm 板框', '30 × 20 mm outline'),
  total: loc('总厚', 'Total'),
  notScale: loc('示意，不按比例', 'Illustrative, not to scale'),
  ink: loc('油墨', 'ink'),
  maskInk: loc('阻焊油墨', 'mask ink'),
  stackTitle: loc('层叠', 'Layer stack'),
  notePos: loc('飞线：尚未布的连接', 'Ratsnest: connections not yet routed'),
  noteGnd: loc('GND 靠底层铺铜连接', 'GND is joined by the bottom pour'),
  simple: loc('接口只画了两个代表性焊盘', 'Connector drawn with two representative pads'),
}

type Pt = [number, number]

// 焊盘位置（mm）
const J1_V: Pt = [4.6, 7]
const J1_G: Pt = [4.6, 13]
const R1_A: Pt = [10.2, 5]
const R1_B: Pt = [11.8, 5]
const D1_A: Pt = [15.2, 5]
const D1_C: Pt = [16.8, 5]
const C1_A: Pt = [14, 9.2]
const C1_B: Pt = [14, 10.8]
const U1_1: Pt = [19.05, 15.25]
const U1_2: Pt = [20.95, 15.25]
const U1_3: Pt = [20, 12.75]
const TP1: Pt = [26, 16]
const VIAS: Pt[] = [[18.3, 5], [14, 12.2], [17.6, 15.25], [4.6, 15.6]]

function pad([x, y]: Pt, w: number, h: number, key: string) {
  return <rect key={key} x={X(x) - (w * S) / 2} y={Y(y) - (h * S) / 2} width={w * S} height={h * S} fill={RED} />
}

function poly(points: Pt[], width: number, color: string, extra?: object) {
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${X(x)} ${Y(y)}`).join(' ')
  return <path d={d} stroke={color} strokeWidth={width * S} fill="none" strokeLinejoin="round" strokeLinecap="butt" {...extra} />
}

function Via({ at }: { at: Pt }) {
  return (
    <g>
      <circle cx={X(at[0])} cy={Y(at[1])} r={0.4 * S} fill="var(--text-2)" />
      <circle cx={X(at[0])} cy={Y(at[1])} r={0.2 * S} fill="var(--well)" />
    </g>
  )
}

function Rats({ pairs }: { pairs: Array<[Pt, Pt]> }) {
  return (
    <g stroke="var(--gold)" strokeWidth="1" opacity="0.9">
      {pairs.map(([a, b], i) => (
        <line key={i} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
      ))}
    </g>
  )
}

function Footprints() {
  const silk = { stroke: 'var(--text-2)', strokeWidth: 1, fill: 'none' }
  return (
    <g>
      <rect x={X(-0.8)} y={Y(5.5)} width={7.2 * S} height={9 * S} {...silk} strokeDasharray="4 3" />
      {pad(J1_V, 1.2, 0.7, 'jv')}
      {pad(J1_G, 1.2, 0.7, 'jg')}
      {pad(R1_A, 0.9, 0.95, 'ra')}
      {pad(R1_B, 0.9, 0.95, 'rb')}
      {pad(D1_A, 0.9, 0.95, 'da')}
      {pad(D1_C, 0.9, 0.95, 'dc')}
      {pad(C1_A, 0.95, 0.9, 'ca')}
      {pad(C1_B, 0.95, 0.9, 'cb')}
      {pad(U1_1, 0.6, 1, 'u1')}
      {pad(U1_2, 0.6, 1, 'u2')}
      {pad(U1_3, 0.6, 1, 'u3')}
      <circle cx={X(TP1[0])} cy={Y(TP1[1])} r={0.75 * S} fill={RED} />
      <path d={`M${X(10.8)} ${Y(4.55)} H${X(11.2)} M${X(10.8)} ${Y(5.45)} H${X(11.2)}`} {...silk} />
      <path d={`M${X(15.8)} ${Y(4.55)} H${X(16.2)} M${X(15.8)} ${Y(5.45)} H${X(16.2)}`} {...silk} />
      <path d={`M${X(17.45)} ${Y(4.4)} V${Y(5.6)}`} {...silk} />
      <path d={`M${X(13.55)} ${Y(9.8)} V${Y(10.2)} M${X(14.45)} ${Y(9.8)} V${Y(10.2)}`} {...silk} />
      <rect x={X(18.6)} y={Y(13.4)} width={2.8 * S} height={1.2 * S} {...silk} />
      <circle cx={X(18.25)} cy={Y(16.1)} r="1.6" fill="var(--text-2)" />
      <T x={X(2.8)} y={Y(9.3)} size={9} color="var(--text)">J1</T>
      <T x={X(2.8)} y={Y(11)} size={8} color="var(--text-2)">USB-C</T>
      <T x={X(11)} y={Y(3.7)} size={9} color="var(--text)">R1</T>
      <T x={X(16)} y={Y(3.7)} size={9} color="var(--text)">D1</T>
      <T x={X(12.4)} y={Y(10.2)} size={9} anchor="end" color="var(--text)">C1</T>
      <T x={X(22.6)} y={Y(13.6)} size={9} anchor="start" color="var(--text)">U1</T>
      <T x={X(26)} y={Y(14.4)} size={9} color="var(--text)">TP1</T>
    </g>
  )
}

function Tracks() {
  return (
    <g>
      {poly([[4.6, 7], [20, 7], [20, 12.75]], 0.5, RED)}
      {poly([[8.2, 7], [10.2, 5]], 0.5, RED)}
      {poly([[14, 7], [14, 9.2]], 0.5, RED)}
      {poly([[11.8, 5], [15.2, 5]], 0.25, RED)}
      {poly([[16.8, 5], [18.3, 5]], 0.25, RED)}
      {poly([[14, 10.8], [14, 12.2]], 0.25, RED)}
      {poly([[19.05, 15.25], [17.6, 15.25]], 0.25, RED)}
      {poly([[4.6, 13], [4.6, 15.6]], 0.25, RED)}
      {poly([[20.95, 15.25], [21.7, 16], [26, 16]], 0.25, RED)}
    </g>
  )
}

function PourShape() {
  const x0 = X(0.5)
  const y0 = Y(0.5)
  const x1 = X(BW - 0.5)
  const y1 = Y(BH - 0.5)
  const r = 0.8 * S
  const holes = VIAS.map(([x, y]) => {
    const cx = X(x)
    const cy = Y(y)
    return `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} Z`
  }).join(' ')
  return (
    <g fill={BLUE} opacity="0.3">
      <path d={`M${x0} ${y0} H${x1} V${y1} H${x0} Z ${holes}`} fillRule="evenodd" stroke={BLUE} strokeWidth="1" />
      {VIAS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={X(x) - 2} y={Y(y) - r - 0.5} width="4" height={r - 3.5} />
          <rect x={X(x) - 2} y={Y(y) + 4} width="4" height={r - 3.5} />
          <rect x={X(x) - r - 0.5} y={Y(y) - 2} width={r - 3.5} height="4" />
          <rect x={X(x) + 4} y={Y(y) - 2} width={r - 3.5} height="4" />
        </g>
      ))}
    </g>
  )
}

export function BoardView({ stage }: { stage: 'place' | 'route' | 'pour' | 'done' | 'shape' }) {
  const { t } = useLocale()
  const copper = stage === 'route' || stage === 'pour' || stage === 'done'
  const pour = stage === 'pour' || stage === 'done'
  const note = stage === 'place' ? L.notePos : stage === 'route' ? L.noteGnd : null
  return (
    <g>
      <rect x={BX} y={BY} width={BW * S} height={BH * S} rx="4" fill="var(--green-bg)" stroke="var(--purple)" strokeWidth="1.8" />
      {pour ? <PourShape /> : null}
      {stage === 'shape' ? null : <Footprints />}
      {copper ? <Tracks /> : null}
      {copper ? VIAS.map(([x, y]) => <Via key={`${x}-${y}`} at={[x, y]} />) : null}
      {stage === 'place' ? (
        <Rats
          pairs={[
            [J1_V, R1_A],
            [R1_A, C1_A],
            [C1_A, U1_3],
            [R1_B, D1_A],
            [J1_G, C1_B],
            [C1_B, U1_1],
            [D1_C, C1_B],
            [U1_2, TP1],
          ]}
        />
      ) : null}
      {stage === 'route' ? (
        <Rats
          pairs={[
            [VIAS[3], VIAS[1]],
            [VIAS[1], VIAS[2]],
            [VIAS[1], VIAS[0]],
          ]}
        />
      ) : null}
      <T x={BX + (BW * S) / 2} y={BY + BH * S + 16} size={10}>{t(L.boardCap)}</T>
      {stage === 'shape' ? null : (
        <T x={BX + (BW * S) / 2} y={BY + BH * S + 30} size={10} color="var(--muted)">{t(L.simple)}</T>
      )}
      {note ? <T x={BX + (BW * S) / 2} y={BY - 10} size={10} color="var(--gold)">{t(note)}</T> : null}
    </g>
  )
}

export function SidePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <g>
      <rect x="330" y="6" width="240" height="290" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={340} y={22} anchor="start" bold color="var(--gold)" size={11}>{title}</T>
      {children}
    </g>
  )
}

const LAYER_ROWS = [
  { name: 'Top Layer', color: RED },
  { name: 'Bottom Layer', color: BLUE },
  { name: 'Top Overlay', color: 'var(--gold)' },
  { name: 'Mechanical 1', color: 'var(--purple)' },
]

export function LayerList({ active, lines }: { active: string; lines: string[] }) {
  return (
    <g>
      {LAYER_ROWS.map((r, i) => {
        const y = 40 + i * 18
        const on = r.name === active
        return (
          <g key={r.name}>
            {on ? <rect x="336" y={y - 11} width="228" height="16" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" /> : null}
            <rect x="342" y={y - 8} width="10" height="10" fill={r.color} />
            <T x={360} y={y} anchor="start" size={10} color={on ? 'var(--gold)' : 'var(--text-2)'} bold={on}>{r.name}</T>
          </g>
        )
      })}
      <T x={340} y={138} anchor="start" bold size={10} color="var(--muted)">Properties</T>
      {lines.map((line, i) => (
        <T key={line} x={340} y={156 + i * 15} anchor="start" size={10} mono>{line}</T>
      ))}
    </g>
  )
}

const CU = 0.035
const TOTAL = 1.6

export function StackPanel() {
  const { t } = useLocale()
  const core = (TOTAL - 2 * CU).toFixed(2)
  const rows = [
    { name: 'Top Overlay', fill: 'var(--text-2)', val: t(L.ink) },
    { name: 'Top Solder', fill: 'var(--green)', val: t(L.maskInk) },
    { name: 'Top Layer (1 oz)', fill: RED, val: `${CU} mm` },
    { name: 'FR-4 core', fill: 'var(--gold-bg-2)', val: `${core} mm` },
    { name: 'Bottom Layer (1 oz)', fill: BLUE, val: `${CU} mm` },
    { name: 'Bottom Solder', fill: 'var(--green)', val: t(L.maskInk) },
    { name: 'Bottom Overlay', fill: 'var(--text-2)', val: t(L.ink) },
  ]
  return (
    <SidePanel title="Layer Stack Manager">
      {rows.map((r, i) => (
        <g key={r.name}>
          <rect x="340" y={34 + i * 26} width="14" height="14" fill={r.fill} stroke="var(--line)" />
          <T x={362} y={45 + i * 26} anchor="start" size={10} mono>{r.name}</T>
          <T x={560} y={45 + i * 26} anchor="end" size={10} mono color="var(--text-2)">{r.val}</T>
        </g>
      ))}
      <T x={340} y={232} anchor="start" size={11} bold color="var(--text)">{`${t(L.total)} ≈ ${(CU * 2 + Number(core)).toFixed(1)} mm`}</T>
      <T x={340} y={250} anchor="start" size={10} color="var(--muted)">{t(L.notScale)}</T>
    </SidePanel>
  )
}