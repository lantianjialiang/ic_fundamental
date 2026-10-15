import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { JUNCTION_LABEL, LATTICE_LABEL, type JunctionState, type LatticeId } from './data/mosPrimer'

function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400}>
      {children}
    </text>
  )
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }

/** 1e16 → 1.0 × 10¹⁶ */
export function fmtSci(x: number) {
  const e = Math.floor(Math.log10(x))
  const m = x / 10 ** e
  const sup = String(e)
    .split('')
    .map((ch) => SUP[ch] ?? ch)
    .join('')
  return `${m.toFixed(1)} × 10${sup}`
}

/* ---------- 物理量 ---------- */

export const VBI = 0.7
export const IS = 1e-14
export const VT = 0.02585
export const diodeCurrent = (v: number) => IS * (Math.exp(v / VT) - 1)
/** 耗尽区宽度相对零偏的倍数；正偏接近 Vbi 时公式失效，夹住下限 */
export const depletionScale = (v: number) => Math.sqrt(Math.max(VBI - v, 0.02) / VBI)

export function junctionState(v: number): JunctionState {
  if (v < 0) {
    return 'rev'
  }
  if (v === 0) {
    return 'zero'
  }
  return diodeCurrent(v) >= 1e-4 ? 'fwdOn' : 'fwdWeak'
}

export function fmtI(i: number) {
  const a = Math.abs(i)
  const units: Array<[number, string]> = [
    [1e-3, 'mA'],
    [1e-6, 'µA'],
    [1e-9, 'nA'],
    [1e-12, 'pA'],
  ]
  for (const [scale, unit] of units) {
    if (a >= scale) {
      return `${(i / scale).toFixed(2)} ${unit}`
    }
  }
  return `${(i / 1e-15).toFixed(2)} fA`
}

/* ---------- 硅晶格 ---------- */

const AX = (c: number) => 50 + 76 * c
const AY = (r: number) => 40 + 58 * r
const COLS = 6
const ROWS = 4
const gap = (c: number, r: number): [number, number] => [AX(c) + 38, AY(r) + 29]

type Bond = { dir: 'h' | 'v'; c: number; r: number; k: 0 | 1 }
type LatticeCfg = { dopants: Array<[number, number]>; electrons: Array<[number, number]>; holes: Bond[] }

const LATTICE_CFG: Record<LatticeId, LatticeCfg> = {
  i: { dopants: [], electrons: [gap(3, 0)], holes: [{ dir: 'h', c: 3, r: 1, k: 0 }] },
  n: { dopants: [[1, 1], [4, 2]], electrons: [gap(1, 1), gap(4, 1)], holes: [{ dir: 'h', c: 0, r: 3, k: 1 }] },
  p: {
    dopants: [[1, 1], [4, 2]],
    electrons: [gap(0, 2)],
    holes: [
      { dir: 'h', c: 1, r: 1, k: 0 },
      { dir: 'h', c: 4, r: 2, k: 0 },
    ],
  },
}

function bondDots(b: Omit<Bond, 'k'>): Array<[number, number]> {
  if (b.dir === 'h') {
    const mx = AX(b.c) + 38
    return [
      [mx - 6, AY(b.r)],
      [mx + 6, AY(b.r)],
    ]
  }
  const my = AY(b.r) + 29
  return [
    [AX(b.c), my - 6],
    [AX(b.c), my + 6],
  ]
}

function Electron({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6" fill="var(--blue)" stroke="var(--well)" strokeWidth="1.5" />
}

function Hole({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6" fill="var(--card)" stroke="var(--gold)" strokeWidth="2" />
}

function Ion({ x, y, sign }: { x: number; y: number; sign: '+' | '−' }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="none" stroke={sign === '+' ? 'var(--blue)' : 'var(--gold)'} strokeWidth="1.5" />
      <T x={x} y={y + 4} color={sign === '+' ? 'var(--blue)' : 'var(--gold)'} size={12} bold>
        {sign}
      </T>
    </g>
  )
}

export function LatticeFig({ id }: { id: LatticeId }) {
  const { t } = useLocale()
  const cfg = LATTICE_CFG[id]
  const isDopant = (c: number, r: number) => cfg.dopants.some(([dc, dr]) => dc === c && dr === r)
  const isHole = (b: Bond) => cfg.holes.some((h) => h.dir === b.dir && h.c === b.c && h.r === b.r && h.k === b.k)

  const bonds: Array<Omit<Bond, 'k'>> = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) {
        bonds.push({ dir: 'h', c, r })
      }
      if (r < ROWS - 1) {
        bonds.push({ dir: 'v', c, r })
      }
    }
  }

  const legend: Array<{ icon: ReactNode; text: string }> = [
    { icon: <Electron x={0} y={0} />, text: t(LATTICE_LABEL.electron) },
    { icon: <Hole x={0} y={0} />, text: t(LATTICE_LABEL.hole) },
    {
      icon: (
        <g>
          <circle cx={-6} cy={0} r="2.5" fill="var(--text-2)" />
          <circle cx={6} cy={0} r="2.5" fill="var(--text-2)" />
        </g>
      ),
      text: t(LATTICE_LABEL.bond),
    },
  ]
  if (id === 'n') {
    legend.push({ icon: <Ion x={0} y={0} sign="+" />, text: t(LATTICE_LABEL.donor) })
  }
  if (id === 'p') {
    legend.push({ icon: <Ion x={0} y={0} sign="−" />, text: t(LATTICE_LABEL.acceptor) })
  }

  let summary: string[] = [t(LATTICE_LABEL.equal)]
  if (id === 'n') {
    summary = [`${t(LATTICE_LABEL.majority)} · ${t(LATTICE_LABEL.electrons)}`, `${t(LATTICE_LABEL.minority)} · ${t(LATTICE_LABEL.holes)}`]
  }
  if (id === 'p') {
    summary = [`${t(LATTICE_LABEL.majority)} · ${t(LATTICE_LABEL.holes)}`, `${t(LATTICE_LABEL.minority)} · ${t(LATTICE_LABEL.electrons)}`]
  }

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(LATTICE_LABEL.cap)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="460" height="240" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="480" y="10" width="270" height="240" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g stroke="var(--line-2)" strokeWidth="2">
          {Array.from({ length: ROWS }, (_, r) => (
            <path key={`s${r}`} d={`M${AX(0) - 30} ${AY(r)} H${AX(COLS - 1) + 30}`} />
          ))}
          {Array.from({ length: COLS }, (_, c) => (
            <path key={`v${c}`} d={`M${AX(c)} ${AY(0) - 22} V${AY(ROWS - 1) + 22}`} />
          ))}
        </g>
        {bonds.map((b) =>
          bondDots(b).map(([x, y], k) =>
            isHole({ ...b, k: k as 0 | 1 }) ? null : <circle key={`${b.dir}${b.c}${b.r}${k}`} cx={x} cy={y} r="2.5" fill="var(--text-2)" />,
          ),
        )}
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const dop = isDopant(c, r)
            const fill = dop ? (id === 'n' ? 'var(--blue-bg-2)' : 'var(--gold-bg-2)') : 'var(--fig-box-2)'
            const name = dop ? (id === 'n' ? 'P' : 'B') : 'Si'
            return (
              <g key={`a${c}${r}`}>
                <circle cx={AX(c)} cy={AY(r)} r="17" fill={fill} stroke={dop ? (id === 'n' ? 'var(--blue)' : 'var(--gold)') : 'var(--line-2)'} strokeWidth="1.5" />
                <T x={AX(c)} y={AY(r) + 4} color="var(--text)" size={11} bold={dop}>
                  {name}
                </T>
                {dop ? (
                  <T x={AX(c) + 15} y={AY(r) - 13} color={id === 'n' ? 'var(--blue)' : 'var(--gold)'} size={13} bold>
                    {id === 'n' ? '+' : '−'}
                  </T>
                ) : null}
              </g>
            )
          }),
        )}
        {cfg.holes.map((h) => {
          const [x, y] = bondDots(h)[h.k]
          return <Hole key={`h${h.dir}${h.c}${h.r}`} x={x} y={y} />
        })}
        {cfg.electrons.map(([x, y]) => (
          <Electron key={`e${x}${y}`} x={x} y={y} />
        ))}
        {legend.map((item, k) => (
          <g key={item.text}>
            <g transform={`translate(${502} ${44 + k * 28})`}>{item.icon}</g>
            <T x={520} y={48 + k * 28} anchor="start" size={11}>
              {item.text}
            </T>
          </g>
        ))}
        {summary.map((line, k) => (
          <T key={line} x={500} y={190 + k * 24} anchor="start" color={k === 0 ? 'var(--gold)' : 'var(--muted)'} size={12} bold={k === 0}>
            {line}
          </T>
        ))}
      </svg>
      <figcaption>{t(LATTICE_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- PN 结 ---------- */

const JX = 380
const BAR_L = 80
const BAR_R = 680
const COL = Array.from({ length: 10 }, (_, k) => 15 + 30 * k)
const ROW_Y = [92, 120, 148]

export function JunctionFig({ v }: { v: number }) {
  const { t } = useLocale()
  const hw = 60 * depletionScale(v)
  const i = diodeCurrent(v)
  const arrowW = Math.min(5, Math.max(1, 1 + (Math.log10(Math.max(Math.abs(i), 1e-15)) + 14) * 0.35))

  const legend: Array<{ icon: ReactNode; text: string; x: number }> = [
    { icon: <Hole x={0} y={0} />, text: t(LATTICE_LABEL.hole), x: 30 },
    { icon: <Electron x={0} y={0} />, text: t(LATTICE_LABEL.electron), x: 150 },
    { icon: <Ion x={0} y={0} sign="−" />, text: t(LATTICE_LABEL.acceptor), x: 300 },
    { icon: <Ion x={0} y={0} sign="+" />, text: t(LATTICE_LABEL.donor), x: 480 },
  ]
  const plusLeft = v > 0

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="img" aria-label={t(JUNCTION_LABEL.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        {legend.map((item) => (
          <g key={item.text}>
            <g transform={`translate(${item.x} 22)`}>{item.icon}</g>
            <T x={item.x + 14} y={26} anchor="start" size={11}>
              {item.text}
            </T>
          </g>
        ))}
        <T x={BAR_L} y={58} anchor="start" color="var(--gold)" size={12} bold>
          {t(JUNCTION_LABEL.pSide)}
        </T>
        <T x={BAR_R} y={58} anchor="end" color="var(--blue)" size={12} bold>
          {t(JUNCTION_LABEL.nSide)}
        </T>
        <T x={JX} y={58} color="var(--muted)" size={11}>
          {t(JUNCTION_LABEL.depletion)}
        </T>
        <rect x={BAR_L} y="70" width={JX - BAR_L} height="100" fill="var(--gold-bg)" stroke="var(--gold-line)" />
        <rect x={JX} y="70" width={BAR_R - JX} height="100" fill="var(--blue-bg)" stroke="var(--blue-line)" />
        <rect x={JX - hw} y="70" width={hw * 2} height="100" fill="var(--card)" opacity="0.85" style={{ transition: 'x 0.15s, width 0.15s' }} />
        <path d={`M${JX - hw} 66 V174 M${JX + hw} 66 V174`} stroke="var(--muted)" strokeDasharray="4 3" />
        {COL.map((d) =>
          ROW_Y.map((y) =>
            d < hw ? (
              <g key={`i${d}${y}`}>
                <Ion x={JX - d} y={y} sign="−" />
                <Ion x={JX + d} y={y} sign="+" />
              </g>
            ) : (
              <g key={`c${d}${y}`}>
                <Hole x={JX - d} y={y} />
                <Electron x={JX + d} y={y} />
              </g>
            ),
          ),
        )}
        {hw > 14 ? (
          <g stroke="var(--red)" strokeWidth="1.8" fill="none">
            <path d={`M${JX + hw - 4} 188 H${JX - hw + 4}`} />
            <path d={`M${JX - hw + 11} 183 L${JX - hw + 4} 188 L${JX - hw + 11} 193`} />
          </g>
        ) : null}
        <T x={JX} y={208} color="var(--red)" size={11}>
          {t(JUNCTION_LABEL.field)}
        </T>
        <g stroke="var(--text-2)" strokeWidth="2" fill="none">
          <path d={`M${BAR_L} 120 H40 V255 H372`} />
          <path d={`M${BAR_R} 120 H720 V255 H388`} />
        </g>
        <T x={40} y={110} size={11} color="var(--gold)">
          {t(JUNCTION_LABEL.anode)}
        </T>
        <T x={720} y={110} size={11} color="var(--blue)">
          {t(JUNCTION_LABEL.cathode)}
        </T>
        {v === 0 ? (
          <path d="M372 255 H388" stroke="var(--text-2)" strokeWidth="2" />
        ) : (
          <g stroke="var(--text)" strokeLinecap="round">
            <path d={`M${plusLeft ? 372 : 388} 238 V272`} strokeWidth="3" />
            <path d={`M${plusLeft ? 388 : 372} 246 V264`} strokeWidth="5" />
          </g>
        )}
        {v === 0 ? null : (
          <g>
            <T x={plusLeft ? 360 : 400} y={240} size={13} bold color="var(--text)">
              +
            </T>
            <T x={plusLeft ? 400 : 360} y={240} size={13} bold color="var(--text)">
              −
            </T>
          </g>
        )}
        <T x={380} y={290} size={11} color="var(--muted)">
          {`${Math.abs(v).toFixed(2)} V`}
        </T>
        {v === 0 ? null : (
          <g>
            <g stroke="var(--gold)" strokeWidth={arrowW} fill="none" strokeLinecap="round">
              <path d={v > 0 ? 'M250 255 H150 M162 247 L150 255 L162 263' : 'M150 255 H250 M238 247 L250 255 L238 263'} />
            </g>
            <T x={200} y={280} size={11} color="var(--gold)">
              {`I = ${fmtI(i)}`}
            </T>
          </g>
        )}
      </svg>
      <figcaption>{t(JUNCTION_LABEL.cap)}</figcaption>
    </figure>
  )
}
