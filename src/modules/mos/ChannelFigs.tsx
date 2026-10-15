import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { fmtV } from '../fund/parts'
import { Hit } from '../prep/common'
import { PARTS, type PartId } from './data/mosChannel'
import { accRatio, channelRatio, chState, depletionRatio, gateRatio, seeded, VT_ABS, type Dev } from './data/mosChannelModel'
import { FIG, STATE_SHORT } from './data/mosChannelText'
import '../prep/prep.css'
import './mosChannel.css'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/* ---------- 剖面几何（viewBox 800 宽） ---------- */

export const SURF = 170
export const BOTTOM = 376
export const WELL_BOTTOM = 360
export const GATE = { x0: 280, x1: 520, polyTop: 126, oxTop: 160 }
export const SRC = { x0: 116, x1: 300 }
export const DRN = { x0: 500, x1: 700 }
export const JUNC = 55
export const BODY = { x0: 30, x1: 76, depth: 30 }
export const PLUG = { s: 160, g: 400, d: 650, b: 53 }
/** 耗尽区最大深度（像素），对应阈值时 */
export const XD_MAX = 104
const ACC_MAX = 14
const CH_MAX = 22

type Pt = { x: number; y: number }
type RPt = Pt & { rank: number }
type Sites = { holesA: Pt[]; ionsA: Pt[]; holesB: Pt[]; ionsB: Pt[]; acc: RPt[]; chan: RPt[] }

const ROWS_A = [204, 230, 256, 282, 308, 334]
const ROWS_B = [256, 282, 308, 334]

function ranks(n: number, rnd: () => number) {
  const keys = Array.from({ length: n }, (_, i) => ({ i, k: rnd() }))
  keys.sort((a, b) => a.k - b.k)
  const out = new Array<number>(n).fill(0)
  keys.forEach((e, rank) => {
    out[e.i] = rank
  })
  return out
}

/** 固定种子生成粒子的家位置：每次渲染都一样，Vgs 只决定谁显示、谁被推走 */
function build(seed: number): Sites {
  const rnd = seeded(seed)
  const jit = (v: number, a: number) => v + (rnd() - 0.5) * 2 * a
  const holesA: Pt[] = []
  const ionsA: Pt[] = []
  for (const y of ROWS_A) {
    for (let c = 0; c < 7; c += 1) {
      holesA.push({ x: jit(316 + 26 * c, 3.5), y: jit(y, 3.5) })
      ionsA.push({ x: jit(329 + 26 * c, 3), y: jit(y + 13, 3) })
    }
  }
  const holesB: Pt[] = []
  const ionsB: Pt[] = []
  for (const x0 of [140, 520]) {
    for (const y of ROWS_B) {
      for (let c = 0; c < 6; c += 1) {
        holesB.push({ x: jit(x0 + 26 * c, 3.5), y: jit(y, 3.5) })
        ionsB.push({ x: jit(x0 + 13 + 26 * c, 3), y: jit(y + 13, 3) })
      }
    }
  }
  const accRank = ranks(ACC_MAX, rnd)
  const acc = accRank.map((rank, i) => ({ x: jit(314 + i * 13.5, 2), y: jit(i % 2 === 0 ? 178 : 189, 2), rank }))
  const chRank = ranks(CH_MAX, rnd)
  const chan = chRank.map((rank, i) => ({ x: jit(312 + (i % 11) * 17.6, 2), y: jit(i < 11 ? 177 : 189, 1.5), rank }))
  return { holesA, ionsA, holesB, ionsB, acc, chan }
}

const SITES: Record<Dev, Sites> = { n: build(1017), p: build(2029) }

export type CarrierKind = 'hole' | 'electron'

export function Carrier({ kind, x, y, hidden = false, dx = 0, dy = 0 }: { kind: CarrierKind; x: number; y: number; hidden?: boolean; dx?: number; dy?: number }) {
  const hole = kind === 'hole'
  return (
    <g
      className="mosChannel-p"
      style={{ opacity: hidden ? 0 : 1, transform: hidden ? `translate(${dx}px, ${dy}px)` : 'translate(0px, 0px)' }}
    >
      <circle cx={x} cy={y} r="5.5" fill={hole ? 'var(--card)' : 'var(--blue)'} stroke={hole ? 'var(--gold)' : 'var(--well)'} strokeWidth={hole ? 1.8 : 1} />
      <text x={x} y={y + 3.4} textAnchor="middle" fontSize="10" fontWeight={700} fill={hole ? 'var(--gold)' : 'var(--well)'}>
        {hole ? '+' : '−'}
      </text>
    </g>
  )
}

export function Ion({ x, y, sign, on = true }: { x: number; y: number; sign: '+' | '−'; on?: boolean }) {
  const color = sign === '−' ? 'var(--gold)' : 'var(--blue)'
  return (
    <g className="mosChannel-fade" style={{ opacity: on ? 1 : 0.22 }}>
      <rect x={x - 5} y={y - 5} width="10" height="10" rx="1.5" fill="var(--card)" stroke={color} strokeWidth="1.4" />
      <text x={x} y={y + 3.4} textAnchor="middle" fontSize="10" fontWeight={700} fill={color}>
        {sign}
      </text>
    </g>
  )
}

const SD_X_S = [138, 172, 206, 240, 274]
const SD_X_D = [526, 560, 594, 628, 662]

/** 剖面里所有会动的东西：耗尽区、载流子、固定离子、积累层、沟道 */
export function Particles({ dev, vn, cap }: { dev: Dev; vn: number; cap: boolean }) {
  const s = SITES[dev]
  const vt = VT_ABS[dev]
  const st = chState(dev, vn)
  const xd = depletionRatio(vn, vt) * XD_MAX
  const edge = SURF + xd
  const accN = Math.round(accRatio(vn) * ACC_MAX)
  const chN = st === 'th' ? 3 : st === 'inv' ? Math.min(CH_MAX, 4 + Math.round(channelRatio(vn, vt) * (CH_MAX - 4))) : 0
  const maj: CarrierKind = dev === 'n' ? 'hole' : 'electron'
  const min: CarrierKind = dev === 'n' ? 'electron' : 'hole'
  const ionSign = dev === 'n' ? '−' : '+'
  const majColor = dev === 'n' ? 'var(--gold)' : 'var(--blue)'
  const minColor = dev === 'n' ? 'var(--blue)' : 'var(--gold)'
  // 没有源漏时，耗尽区铺满整个栅下
  const x0 = cap ? GATE.x0 : SRC.x1
  const x1 = cap ? GATE.x1 : DRN.x0
  return (
    <g pointerEvents="none">
      <rect className="mosChannel-dep" x={x0} y={SURF} width={x1 - x0} height={xd} style={{ height: xd }} fill="var(--well)" opacity={0.6} />
      <path
        className="mosChannel-dep"
        d={`M${x0} ${SURF} H${x1}`}
        stroke="var(--muted)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        style={{ transform: `translateY(${xd}px)`, opacity: xd < 1 ? 0 : 1 }}
      />
      <rect className="mosChannel-fade" x={x0} y={SURF + 1} width={x1 - x0} height="21" rx="9" fill={majColor} style={{ opacity: (accN / ACC_MAX) * 0.3 }} />
      <rect className="mosChannel-fade" x={x0} y={SURF + 1} width={x1 - x0} height="21" rx="9" fill={minColor} style={{ opacity: Math.min(1, chN / 10) * 0.32 }} />
      {s.ionsA.map((p, i) => (
        <Ion key={`ia${i}`} x={p.x} y={p.y} sign={ionSign} on={p.y < edge} />
      ))}
      {s.ionsB.map((p, i) => (
        <Ion key={`ib${i}`} x={p.x} y={p.y} sign={ionSign} on={false} />
      ))}
      {s.holesB.map((p, i) => (
        <Carrier key={`hb${i}`} kind={maj} x={p.x} y={p.y} />
      ))}
      {s.holesA.map((p, i) => (
        <Carrier key={`ha${i}`} kind={maj} x={p.x} y={p.y} hidden={p.y < edge} dy={26} />
      ))}
      {s.acc.map((p, i) => (
        <Carrier key={`ac${i}`} kind={maj} x={p.x} y={p.y} hidden={p.rank >= accN} dy={32} />
      ))}
      {s.chan.map((p, i) => (
        <Carrier
          key={`ch${i}`}
          kind={min}
          x={p.x}
          y={p.y}
          hidden={p.rank >= chN}
          dx={cap ? 0 : p.x < 400 ? SRC.x1 - 30 - p.x : DRN.x0 + 30 - p.x}
          dy={cap ? 60 : 0}
        />
      ))}
      {cap
        ? null
        : [...SD_X_S, ...SD_X_D].map((x, i) => <Carrier key={`sd${x}`} kind={min} x={x} y={i % 2 === 0 ? 186 : 200} />)}
    </g>
  )
}

/* ---------- 剖面图本体 ---------- */

export type DeviceMode = 'parts' | 'anim' | 'cap'

const P_COL = { bg: 'var(--gold-bg)', bg2: 'var(--gold-bg-2)', line: 'var(--gold-line)' }
const N_COL = { bg: 'var(--blue-bg)', bg2: 'var(--blue-bg-2)', line: 'var(--blue-line)' }

function dropPath(x0: number, x1: number, y0: number, y1: number, r: number) {
  return `M${x0} ${y0} V${y1 - r} Q${x0} ${y1} ${x0 + r} ${y1} H${x1 - r} Q${x1} ${y1} ${x1} ${y1 - r} V${y0} Z`
}

function Contact({ cx, bottom }: { cx: number; bottom: number }) {
  return (
    <g>
      <rect x={cx - 8} y={84} width="16" height={bottom - 84} fill="var(--text-2)" opacity="0.7" />
      <rect x={cx - 36} y={74} width="72" height="10" fill="var(--fig-box-2)" stroke="var(--text-2)" strokeWidth="1.5" />
    </g>
  )
}

function Terminal({ cx, name }: { cx: number; name: string }) {
  return (
    <g>
      <circle cx={cx} cy={52} r="11" fill="var(--card)" stroke="var(--text-2)" strokeWidth="1.5" />
      <T x={cx} y={57} size={13} bold color="var(--text)">
        {name}
      </T>
    </g>
  )
}

const STATE_COLOR = { acc: 'var(--gold)', flat: 'var(--muted)', dep: 'var(--text)', th: 'var(--blue)', inv: 'var(--green)' }
const GATE_SLOTS = 13

type DeviceProps = {
  dev: Dev
  mode: DeviceMode
  vn?: number
  active?: PartId
  onPick?: (id: PartId) => void
  caption: LText
}

export function DeviceFig({ dev, mode, vn = 0, active, onPick, caption }: DeviceProps) {
  const { t } = useLocale()
  const cap = mode === 'cap'
  const parts = mode === 'parts'
  const height = parts ? 392 : 412
  const top = parts ? 30 : 0
  const base = dev === 'n' ? P_COL : N_COL
  const sdCol = dev === 'n' ? N_COL : P_COL
  const vgs = dev === 'n' ? vn : -vn
  const st = chState(dev, vn)
  const sw = (id: PartId, col: string) => ({ stroke: active === id ? 'var(--text)' : col, strokeWidth: active === id ? 3 : 1.5 })
  const titleOf = (id: PartId) => {
    const p = PARTS.find((x) => x.id === id)
    return p ? t(p.title) : id
  }
  const wrap = (id: PartId, children: ReactNode) =>
    onPick ? (
      <Hit key={id} label={titleOf(id)} active={active === id} onPick={() => onPick(id)}>
        {children}
      </Hit>
    ) : (
      <g key={id}>{children}</g>
    )
  const gateCount = Math.round(gateRatio(vn) * GATE_SLOTS)
  const gateSign = vgs > 0 ? '+' : '−'
  const sdName = dev === 'n' ? 'n+' : 'p+'
  const bodyName = dev === 'n' ? 'p+' : 'n+'

  return (
    <figure className="term-fig">
      <svg viewBox={`0 ${top} 800 ${height - top}`} className="term-fig__svg" role="img" aria-label={t(caption)}>
        <rect y={top} width="800" height={height - top} rx="10" fill="var(--well)" />
        {wrap(
          'sub',
          <>
            <path d={dropPath(10, 790, SURF, BOTTOM, 8)} fill={P_COL.bg} {...sw('sub', P_COL.line)} />
            {dev === 'p' ? <path d={dropPath(24, 776, SURF, WELL_BOTTOM, 10)} fill={N_COL.bg} {...sw('sub', N_COL.line)} /> : null}
          </>,
        )}
        {cap
          ? null
          : wrap(
              'sd',
              <>
                <path d={dropPath(SRC.x0, SRC.x1, SURF, SURF + JUNC, 14)} fill={sdCol.bg2} {...sw('sd', sdCol.line)} />
                <path d={dropPath(DRN.x0, DRN.x1, SURF, SURF + JUNC, 14)} fill={sdCol.bg2} {...sw('sd', sdCol.line)} />
                <Contact cx={PLUG.s} bottom={SURF} />
                <Contact cx={PLUG.d} bottom={SURF} />
              </>,
            )}
        {wrap(
          'body',
          <>
            <path d={dropPath(BODY.x0, BODY.x1, SURF, SURF + BODY.depth, 10)} fill={base.bg2} {...sw('body', base.line)} />
            <Contact cx={PLUG.b} bottom={SURF} />
          </>,
        )}
        {cap
          ? null
          : wrap(
              'sti',
              <>
                <rect x="80" y={SURF - 4} width="36" height="50" fill="var(--muted)" fillOpacity="0.55" {...sw('sti', 'var(--text-2)')} />
                <rect x="706" y={SURF - 4} width="34" height="50" fill="var(--muted)" fillOpacity="0.55" {...sw('sti', 'var(--text-2)')} />
              </>,
            )}
        {wrap(
          'oxide',
          <rect x={GATE.x0} y={GATE.oxTop} width={GATE.x1 - GATE.x0} height={SURF - GATE.oxTop} fill="var(--muted)" fillOpacity="0.6" {...sw('oxide', 'var(--text-2)')} />,
        )}
        {wrap(
          'gate',
          <>
            <rect x={GATE.x0} y={GATE.polyTop} width={GATE.x1 - GATE.x0} height={GATE.oxTop - GATE.polyTop} fill="var(--fig-box-2)" {...sw('gate', 'var(--text-2)')} />
            <Contact cx={PLUG.g} bottom={GATE.polyTop + 2} />
          </>,
        )}
        {parts ? null : <Particles dev={dev} vn={vn} cap={cap} />}
        {parts
          ? null
          : Array.from({ length: GATE_SLOTS }, (_, i) => (
              <g key={`gs${i}`} className="mosChannel-fade" style={{ opacity: i < gateCount ? 1 : 0 }}>
                <T x={GATE.x0 + 18 + i * 17.5} y={157} size={13} bold color="var(--text)">
                  {gateSign}
                </T>
              </g>
            ))}
        <Terminal cx={PLUG.b} name="B" />
        <Terminal cx={PLUG.g} name="G" />
        {cap ? null : <Terminal cx={PLUG.s} name="S" />}
        {cap ? null : <Terminal cx={PLUG.d} name="D" />}
        <T x={400} y={143} size={11} color="var(--text)">
          {t(FIG.gate)}
        </T>
        <T x={GATE.x1 + 6} y={166} anchor="start" size={11}>
          {t(FIG.oxide)}
        </T>
        {cap ? null : (
          <>
            <T x={(SRC.x0 + SRC.x1) / 2} y={219} size={12} bold color="var(--text)">
              {sdName}
            </T>
            <T x={(DRN.x0 + DRN.x1) / 2} y={219} size={12} bold color="var(--text)">
              {sdName}
            </T>
            <T x={98} y={196} size={10} bold color="var(--text)">
              {t(FIG.sti)}
            </T>
          </>
        )}
        <T x={(BODY.x0 + BODY.x1) / 2} y={192} size={12} bold color="var(--text)">
          {bodyName}
        </T>
        {dev === 'n' ? (
          <T x={28} y={368} anchor="start" size={11}>
            {t(FIG.subN)}
          </T>
        ) : (
          <>
            <T x={28} y={350} anchor="start" size={11} color="var(--blue)">
              {t(FIG.subP)}
            </T>
            <T x={28} y={371} anchor="start" size={11}>
              {t(FIG.subN)}
            </T>
          </>
        )}
        {parts ? null : (
          <>
            <T x={20} y={24} anchor="start" size={13} bold mono color="var(--text)">
              {`Vgs = ${fmtV(vgs)}`}
            </T>
            <T x={400} y={24} size={13} bold color={STATE_COLOR[st]}>
              {t(STATE_SHORT[st])}
            </T>
            <T x={780} y={24} anchor="end" size={12} color="var(--muted)">
              {t(cap ? FIG.capNoSd : FIG.anchorNote)}
            </T>
            <DeviceLegend dev={dev} />
          </>
        )}
      </svg>
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}

function DeviceLegend({ dev }: { dev: Dev }) {
  const { t } = useLocale()
  const y = 398
  return (
    <g>
      <Carrier kind="hole" x={40} y={y - 4} />
      <T x={52} y={y} anchor="start">
        {t(FIG.hole)}
      </T>
      <Carrier kind="electron" x={110} y={y - 4} />
      <T x={122} y={y} anchor="start">
        {t(FIG.electron)}
      </T>
      <Ion x={215} y={y - 4} sign={dev === 'n' ? '−' : '+'} />
      <T x={229} y={y} anchor="start">
        {t(dev === 'n' ? FIG.ionN : FIG.ionP)}
      </T>
      <rect x="380" y={y - 10} width="16" height="12" fill="var(--well)" stroke="var(--muted)" strokeDasharray="4 3" />
      <T x={402} y={y} anchor="start">
        {t(FIG.depletion)}
      </T>
      <rect x="540" y={y - 10} width="16" height="12" rx="5" fill={dev === 'n' ? 'var(--blue)' : 'var(--gold)'} fillOpacity="0.45" />
      <T x={562} y={y} anchor="start">
        {t(FIG.channel)}
      </T>
    </g>
  )
}
