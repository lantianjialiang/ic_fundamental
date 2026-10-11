import { useId, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { DRIVE_LEAD, TPD, type TimingMark } from './glossary'

type TimingScopeProps = {
  /** CLK 周期，ns */
  period: number
  /** Strobe 位置（相对第 n 拍 CLK 沿，ns）；不传就不画 */
  strobe?: number
  /** Strobe 能否采到第 n 拍的有效值：决定圆点和窗口的颜色 */
  strobeOk?: boolean
  /** 在 OUT 下方标出「有效窗口」字样 */
  labelWindow?: boolean
  /** 要画的尺寸标注 */
  marks?: TimingMark[]
  /** 高亮的那一条尺寸 */
  active?: TimingMark
  caption: string
}

const L = {
  window: loc('有效窗口', 'valid window'),
  strobe: loc('Strobe', 'Strobe'),
}

/** 横轴：-6 ns 到 30 ns，第 n 拍的 CLK 上升沿在 0 */
const T0 = -6
const T1 = 30
const X0 = 72
const X1 = 660
const CLK_HI = 44
const CLK_LO = 76
const DAT_T = 124
const DAT_B = 156
const OUT_T = 204
const OUT_B = 236
const H = 300
const SWEEP = '2.6s'

const xs = (t: number) => X0 + ((t - T0) * (X1 - X0)) / (T1 - T0)
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
const lab = (k: number) => (k === 0 ? 'n' : k > 0 ? `n+${k}` : `n−${-k}`)

export function TimingScope({ period, strobe, strobeOk = true, labelWindow, marks = [], active, caption }: TimingScopeProps) {
  const { t } = useLocale()
  const [play, setPlay] = useState(0)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const clipId = `ts-clip-${uid}-${play}`
  const hatchId = `ts-hatch-${uid}`
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const P = period
  const winOk = P > TPD
  const tone = strobeOk ? 'green' : 'red'

  return (
    <figure className="term-fig">
      <div className="term-fig__bar">
        <button type="button" className="lab__btn" onClick={() => setPlay((n) => n + 1)}>
          {t(ui.timing.replay)}
        </button>
      </div>
      <svg key={play} viewBox={`0 0 680 ${H}`} className="term-fig__svg" role="img" aria-label={caption}>
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--muted)" strokeWidth="1.2" />
          </pattern>
          {still ? null : (
            <clipPath id={clipId}>
              <rect x="0" y="0" width="0" height={H}>
                <animate attributeName="width" from="0" to="680" dur={SWEEP} fill="freeze" />
              </rect>
            </clipPath>
          )}
        </defs>
        <rect width="680" height={H} rx="10" fill="var(--well)" />

        {/* 第 n 拍和第 n+1 拍的 CLK 沿：所有时间都从这里量 */}
        {[0, P].map((tt) => (
          <line key={tt} x1={xs(tt)} y1="36" x2={xs(tt)} y2="250" stroke="var(--line-2)" strokeDasharray="4 4" />
        ))}
        {railName('CLK', (CLK_HI + CLK_LO) / 2)}
        {railName('DATA', (DAT_T + DAT_B) / 2)}
        {railName('OUT', (OUT_T + OUT_B) / 2)}

        <g clipPath={still ? undefined : `url(#${clipId})`}>
          {winOk && strobe !== undefined ? (
            <rect
              x={xs(TPD)}
              y={OUT_T - 8}
              width={xs(P) - xs(TPD)}
              height={OUT_B - OUT_T + 16}
              rx="4"
              fill={`var(--${tone}-bg)`}
              stroke={`var(--${tone}-line)`}
            />
          ) : null}
          <path d={clkPath(P)} fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinejoin="round" />
          {dataSegs(P).map(([a, b, k]) => bus(a, b, DAT_T, DAT_B, lab(k), `d${k}`))}
          <rect x={X0} y={OUT_T} width={X1 - X0} height={OUT_B - OUT_T} fill={`url(#${hatchId})`} opacity="0.55" />
          {outSegs(P).map(([a, b, k]) => bus(a, b, OUT_T, OUT_B, lab(k), `o${k}`))}
        </g>

        {labelWindow && winOk ? (
          <text x={xs(P) - 4} y={OUT_B + 18} textAnchor="end" fill={`var(--${tone})`} fontSize="12">
            {t(L.window)}
          </text>
        ) : null}

        {marks.includes('period') ? dim(0, P, 26, `Period ${fmt(P)} ns`, active === 'period') : null}
        {marks.includes('setup') ? dim(-DRIVE_LEAD, 0, 180, `tSU ${fmt(DRIVE_LEAD)} ns`, active === 'setup') : null}
        {marks.includes('hold') ? dim(0, P - DRIVE_LEAD, 180, `tH ${fmt(P - DRIVE_LEAD)} ns`, active === 'hold', true) : null}
        {marks.includes('tpd') ? dim(0, TPD, 274, `tPD ${fmt(TPD)} ns`, active === 'tpd') : null}

        {strobe !== undefined ? strobeMark(strobe, strobeOk, t(L.strobe)) : null}

        {still ? null : (
          <line x1={X0} y1="36" x2={X0} y2="250" stroke="var(--gold)" strokeWidth="1.5" opacity="0.8">
            <animate attributeName="x1" from={X0} to={X1} dur={SWEEP} fill="freeze" />
            <animate attributeName="x2" from={X0} to={X1} dur={SWEEP} fill="freeze" />
            <animate attributeName="opacity" values="0.8;0.8;0" keyTimes="0;0.96;1" dur={SWEEP} fill="freeze" />
          </line>
        )}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

function railName(name: string, y: number) {
  return (
    <text x="16" y={y + 4} fill="var(--muted)" fontSize="13" fontFamily="var(--mono)">
      {name}
    </text>
  )
}

/** CLK：kP 上升，kP + P/2 下降 */
function clkPath(P: number) {
  const edges: number[] = []
  for (let k = Math.floor(T0 / P) - 1; k * P <= T1; k += 1) edges.push(k * P, k * P + P / 2)
  const inside = edges.filter((e) => e > T0 && e < T1).sort((a, b) => a - b)
  let high = ((T0 % P) + P) % P < P / 2
  let d = `M ${xs(T0)} ${high ? CLK_HI : CLK_LO}`
  for (const e of inside) {
    high = !high
    d += ` H ${xs(e)} V ${high ? CLK_HI : CLK_LO}`
  }
  return `${d} H ${xs(T1)}`
}

/** DATA：测试机在每个沿前 DRIVE_LEAD 换数据，第 k 段在第 k 个沿被采进去 */
function dataSegs(P: number): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = []
  for (let k = Math.floor((T0 + DRIVE_LEAD) / P) - 1; k * P - DRIVE_LEAD < T1; k += 1) {
    const a = Math.max(k * P - DRIVE_LEAD, T0)
    const b = Math.min((k + 1) * P - DRIVE_LEAD, T1)
    if (b > a) out.push([a, b, k])
  }
  return out
}

/** OUT：第 k 个沿后 tPD 才稳定，到下一个沿为止；其余时间在变（斜线底纹） */
function outSegs(P: number): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = []
  for (let k = Math.floor(T0 / P) - 1; k * P + TPD < T1; k += 1) {
    const a = Math.max(k * P + TPD, T0)
    const b = Math.min((k + 1) * P, T1)
    if (b > a) out.push([a, b, k])
  }
  return out
}

/** 总线画法：两头斜切的六边形，表示「这一段值稳定」 */
function bus(a: number, b: number, top: number, bot: number, label: string, key: string) {
  const xa = xs(a)
  const xb = xs(b)
  const mid = (top + bot) / 2
  const ha = a > T0 ? Math.min(5, (xb - xa) / 2) : 0
  const hb = b < T1 ? Math.min(5, (xb - xa) / 2) : 0
  const d = `M ${xa} ${mid} L ${xa + ha} ${top} H ${xb - hb} L ${xb} ${mid} L ${xb - hb} ${bot} H ${xa + ha} Z`
  return (
    <g key={key}>
      <path d={d} fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="1.8" strokeLinejoin="round" />
      {xb - xa > 30 ? (
        <text x={(xa + xb) / 2} y={mid + 4} textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="var(--mono)">
          {label}
        </text>
      ) : null}
    </g>
  )
}

/** 12px 等宽字大约 7.2px 一个字符 */
const MONO_W = 7.2

/** 尺寸标注。alignStart：段太短放不下字时，字改成从段的左端往右写，免得和左边相邻的标注叠在一起 */
function dim(t1: number, t2: number, y: number, label: string, on: boolean, alignStart = false) {
  const x1 = xs(t1)
  const x2 = xs(t2)
  const c = on ? 'var(--gold)' : 'var(--muted)'
  const w = on ? 2 : 1.2
  const head = Math.min(6, Math.abs(x2 - x1) / 2)
  const outside = alignStart && label.length * MONO_W + 8 > Math.abs(x2 - x1)
  return (
    <g opacity={on ? 1 : 0.7}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth={w} />
      <path d={`M ${x1} ${y} l ${head} -4 v 8 z M ${x2} ${y} l ${-head} -4 v 8 z`} fill={c} />
      <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} stroke={c} strokeWidth={w} />
      <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} stroke={c} strokeWidth={w} />
      <text
        x={outside ? Math.min(x1, x2) + 4 : (x1 + x2) / 2}
        y={y - 8}
        textAnchor={outside ? 'start' : 'middle'}
        fill={c}
        fontSize="12"
        fontWeight={on ? 600 : 400}
        fontFamily="var(--mono)"
      >
        {label}
      </text>
    </g>
  )
}

function strobeMark(s: number, ok: boolean, label: string) {
  const x = xs(s)
  const right = x > X1 - 70
  return (
    <g>
      <line x1={x} y1="36" x2={x} y2="250" stroke="var(--gold)" strokeWidth="1.8" strokeDasharray="5 3" />
      <circle cx={x} cy={(OUT_T + OUT_B) / 2} r="6" fill={ok ? 'var(--green)' : 'var(--red)'} stroke="var(--well)" strokeWidth="2" />
      <text x={right ? x - 6 : x + 6} y={OUT_T - 12} textAnchor={right ? 'end' : 'start'} fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
        {label}
      </text>
    </g>
  )
}
