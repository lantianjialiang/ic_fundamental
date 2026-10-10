import { useState } from 'react'
import { loc, type LText } from '../../i18n/locale'
import { TIMING, type TimingMark } from './glossary'

type TimingScopeProps = {
  mark: TimingMark
  t: (text: LText | string) => string
  /** {@timing}：Strobe 位置，单位 ns，0–10 */
  strobeNs?: number
  replayLabel: string
}

const X0 = 88
const X1 = 640
const CLK = 52
const DAT = 132
const OUT = 212
const CLK1 = 280
const CLK2 = 560
const DRV0 = 160
const DRV1 = 196
const HOLD = 400
const FALL = 436
const OUT_AT = 380
const WIN_R = 500

export function TimingScope({ mark, t, strobeNs = 5, replayLabel }: TimingScopeProps) {
  const [play, setPlay] = useState(0)
  const strobeX = CLK1 + (strobeNs / 10) * (CLK2 - CLK1)
  const item = TIMING[mark]
  const outName = mark === 'ctq' ? 'Q' : 'OUT'

  return (
    <figure className={`term-fig term-fig--${mark}`}>
      <div className="term-fig__bar">
        <button type="button" className="lab__btn" onClick={() => setPlay((n) => n + 1)}>
          {replayLabel}
        </button>
      </div>
      <svg
        key={play}
        viewBox="0 0 680 300"
        className="term-fig__svg"
        role="img"
        aria-label={t(item.caption)}
      >
        <defs>
          <marker id={`arr-${mark}-${play}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0 0 L7 3.5 L0 7 Z" fill="var(--gold)" />
          </marker>
        </defs>
        <rect x="0" y="0" width="680" height="300" rx="6" fill="var(--well)" />
        {ticks()}
        {railName('CLK', CLK)}
        {railName('DATA', DAT)}
        {railName(outName, OUT)}
        {canonicalWaves(mark)}
        {highlights(mark, strobeX, t, `arr-${mark}-${play}`)}
        <line className="term-fig__now" x1={X0} y1="20" x2={X0} y2="248" stroke="var(--gold)" strokeWidth="1.5">
          <animate attributeName="x1" from={X0} to={X1} dur="3.4s" repeatCount="indefinite" />
          <animate attributeName="x2" from={X0} to={X1} dur="3.4s" repeatCount="indefinite" />
        </line>
      </svg>
      <figcaption>{t(item.caption)}</figcaption>
    </figure>
  )
}

function ticks() {
  return (
    <g stroke="var(--fig-box-2)" strokeWidth="1">
      {[160, 240, 320, 400, 480, 560].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="248" />
      ))}
    </g>
  )
}

function railName(name: string, y: number) {
  return (
    <text x="16" y={y + 4} fill="var(--muted)" fontSize="13" fontFamily="Segoe UI, Microsoft YaHei, sans-serif">
      {name}
    </text>
  )
}

function yOf(rail: number, high: boolean) {
  return high ? rail - 16 : rail + 16
}

/** 两课同一张：CLK 两拍，DATA 带斜边，OUT/Q 晚于输入 */
function canonicalWaves(mark: TimingMark) {
  const clk = `
    M ${X0} ${yOf(CLK, false)}
    H ${CLK1} V ${yOf(CLK, true)}
    H ${420} V ${yOf(CLK, false)}
    H ${CLK2} V ${yOf(CLK, true)}
    H ${X1}
  `
  const slopeClass = mark === 'edge' ? 'term-fig__slope' : undefined
  const data = `
    M ${X0} ${yOf(DAT, false)}
    H ${DRV0}
    L ${DRV1} ${yOf(DAT, true)}
    H ${HOLD}
    L ${FALL} ${yOf(DAT, false)}
    H ${X1}
  `
  const out = `
    M ${X0} ${yOf(OUT, false)}
    H ${OUT_AT} V ${yOf(OUT, true)}
    H ${X1}
  `
  return (
    <g fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinejoin="round">
      <path d={clk} />
      <path d={data} className={slopeClass} />
      <path d={out} className={mark === 'ctq' ? 'term-fig__q' : undefined} />
    </g>
  )
}

function dim(x1: number, x2: number, y: number, label: string, marker: string) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--gold)" strokeWidth="1.6" markerEnd={`url(#${marker})`} />
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke="var(--gold)" strokeWidth="1.4" />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke="var(--gold)" strokeWidth="1.4" />
      <text
        x={(x1 + x2) / 2}
        y={y - 10}
        textAnchor="middle"
        fill="var(--gold)"
        fontSize="13"
        fontFamily="Segoe UI, Microsoft YaHei, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

function edgeMark(x: number, y: number, label: string) {
  return (
    <g className="term-fig__edge">
      <line x1={x} y1={y - 28} x2={x} y2={y + 28} stroke="var(--gold)" strokeWidth="1.4" strokeDasharray="3 3" />
      <text x={x + 8} y={y - 32} fill="var(--gold)" fontSize="13">
        {label}
      </text>
    </g>
  )
}

function highlights(
  mark: TimingMark,
  strobeX: number,
  t: (text: LText | string) => string,
  marker: string,
) {
  if (mark === 'drive') {
    return (
      <g>
        {edgeMark(DRV0, DAT, t(loc('Drive')))}
        {dim(X0, DRV0, 268, t(loc('还没驱动')), marker)}
      </g>
    )
  }
  if (mark === 'strobe') {
    return (
      <g>
        <rect className="term-fig__win" x={OUT_AT} y={OUT - 22} width={WIN_R - OUT_AT} height="44" />
        {edgeMark(strobeX, OUT, t(loc('Strobe')))}
        {dim(OUT_AT, WIN_R, 268, t(loc('有效窗口')), marker)}
        <circle className="term-fig__dot" cx={strobeX} cy={yOf(OUT, true)} r="5" fill="var(--gold)" />
      </g>
    )
  }
  if (mark === 'period' || mark === 'fmax') {
    return (
      <g>
        {edgeMark(CLK1, CLK, t(loc('沿 1')))}
        {edgeMark(CLK2, CLK, t(loc('沿 2')))}
        {dim(CLK1, CLK2, 268, t(loc(mark === 'fmax' ? 'Period → 再短就 Fail' : 'Period = 一拍')), marker)}
      </g>
    )
  }
  if (mark === 'setup') {
    return (
      <g>
        {edgeMark(DRV1, DAT, t(loc('数据稳住')))}
        {edgeMark(CLK1, CLK, t(loc('CLK 沿')))}
        {dim(DRV1, CLK1, 268, t(loc('tSU')), marker)}
      </g>
    )
  }
  if (mark === 'hold') {
    return (
      <g>
        {edgeMark(CLK1, CLK, t(loc('CLK 沿')))}
        {edgeMark(HOLD, DAT, t(loc('数据才变')))}
        {dim(CLK1, HOLD, 268, t(loc('tH')), marker)}
      </g>
    )
  }
  if (mark === 'tpd') {
    return (
      <g>
        {edgeMark(DRV0, DAT, t(loc('DATA 变')))}
        {edgeMark(OUT_AT, OUT, t(loc('OUT 才变')))}
        {dim(DRV0, OUT_AT, 268, t(loc('tPD')), marker)}
      </g>
    )
  }
  if (mark === 'edge') {
    return (
      <g>
        {dim(DRV0, DRV1, DAT - 36, t(loc('tr 上升')), marker)}
        {dim(HOLD, FALL, DAT + 40, t(loc('tf 下降')), marker)}
        {dim(DRV0, FALL, 268, t(loc('沿不是一条竖线')), marker)}
      </g>
    )
  }
  return (
    <g>
      {edgeMark(CLK1, CLK, t(loc('CLK 沿')))}
      {edgeMark(OUT_AT, OUT, t(loc('Q 有效')))}
      {dim(CLK1, OUT_AT, 268, t(loc('tCQ')), marker)}
    </g>
  )
}
