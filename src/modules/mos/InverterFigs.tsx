import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { FL } from './data/mosInverterFig'
import { FIG, PARTS, REGION_NAME, type PartId, type PhaseId } from './data/mosInverter'
import { inverterCurrent, inverterOut, nRegion, VDD, VTN, VTP, type Region } from './model'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/* ---------- 模型量：全部来自 ./model ---------- */

export function opState(vin: number) {
  const vout = inverterOut(vin)
  return {
    vin,
    vout,
    vsg: VDD - vin,
    vsd: VDD - vout,
    nReg: nRegion(vin, vout),
    pReg: nRegion(VDD - vin, VDD - vout, -VTP),
    idd: inverterCurrent(vin),
  }
}
export type OpState = ReturnType<typeof opState>

/** 增益 dVout/dVin，中心差分 */
export function gainAt(vin: number) {
  const a = Math.max(vin - 0.005, 0)
  const b = Math.min(vin + 0.005, VDD)
  return (inverterOut(b) - inverterOut(a)) / (b - a)
}

export function phaseOf(s: OpState): PhaseId {
  if (s.nReg === 'cutoff') {
    return 'p1'
  }
  if (s.pReg === 'cutoff') {
    return 'p4'
  }
  if (s.nReg === 'sat' && s.pReg === 'sat') {
    return 'vm'
  }
  return s.nReg === 'sat' ? 'p2' : 'p3'
}

function findKey() {
  let lo = 0
  let hi = VDD
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2
    if (inverterOut(mid) > mid) {
      lo = mid
    } else {
      hi = mid
    }
  }
  const vm = (lo + hi) / 2
  let vil = 0
  let vih = 0
  let found = false
  let satLo = 0
  let satHi = 0
  let satFound = false
  for (let k = 0; k <= 3300; k += 1) {
    const v = k / 1000
    if (gainAt(v) <= -1) {
      vil = found ? vil : v
      vih = v
      found = true
    }
    const s = opState(v)
    if (s.nReg === 'sat' && s.pReg === 'sat') {
      satLo = satFound ? satLo : v
      satHi = v
      satFound = true
    }
  }
  const voh = inverterOut(vil)
  const vol = inverterOut(vih)
  return { vm, vil, vih, voh, vol, nml: vil - vol, nmh: voh - vih, satLo, satHi }
}
/** VM、单位增益点、噪声容限，启动时用数值算一次 */
export const KEY = findKey()

const N_PTS = 330
export const VTC = Array.from({ length: N_PTS + 1 }, (_, k) => {
  const vin = (k / N_PTS) * VDD
  return { vin, vout: inverterOut(vin), idd: inverterCurrent(vin) }
})
export const PEAK_MA = Math.max(...VTC.map((p) => p.idd)) * 1e3

export const regionColor = (r: Region) => (r === 'sat' ? 'var(--blue)' : r === 'linear' ? 'var(--green)' : 'var(--dim)')

/* ---------- MOS 符号：箭头 NMOS 指向沟道，PMOS 背离沟道 ---------- */

const GATE_X = 96

function Mos({ cx, cy, kind, color }: { cx: number; cy: number; kind: 'n' | 'p'; color: string }) {
  const bodyEnd = kind === 'n' ? cy + 18 : cy - 18
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${cx} ${cy - 22} V${cy - 13} M${cx} ${cy - 7} V${cy + 7} M${cx} ${cy + 13} V${cy + 22}`} />
      <path d={`M${cx - 8} ${cy - 18} V${cy + 18} M${cx - 8} ${cy} H${GATE_X}`} />
      <path d={`M${cx} ${cy - 18} H${cx + 22} M${cx} ${cy + 18} H${cx + 22} M${cx} ${cy} H${cx + 22} V${bodyEnd}`} />
      <path d={kind === 'n' ? `M${cx} ${cy} L${cx + 8} ${cy - 4} V${cy + 4} Z` : `M${cx + 22} ${cy} L${cx + 14} ${cy - 4} V${cy + 4} Z`} fill={color} />
    </g>
  )
}

const GND = (x: number, y: number) => `M${x - 14} ${y} H${x + 14} M${x - 9} ${y + 6} H${x + 9} M${x - 4} ${y + 12} H${x + 4}`

const CY_P = 110
const CY_N = 270
const CX = 150
const RX = CX + 22

const HITS: Record<PartId, { x: number; y: number; w: number; h: number }> = {
  pmos: { x: 118, y: 82, w: 72, h: 56 },
  nmos: { x: 118, y: 242, w: 72, h: 56 },
  in: { x: 12, y: 168, w: 84, h: 48 },
  out: { x: 168, y: 140, w: 60, h: 56 },
  cl: { x: 268, y: 196, w: 50, h: 48 },
}

type SchematicProps = { vin?: number; active?: PartId; onPick?: (id: PartId) => void }

/** 反相器电路，局部坐标 340 × 400。给 vin 就显示工作区和电流路径，否则显示连接说明 */
export function Schematic({ vin, active, onPick }: SchematicProps) {
  const { t } = useLocale()
  const s = vin === undefined ? undefined : opState(vin)
  const live = s !== undefined
  const pColor = s ? regionColor(s.pReg) : 'var(--text)'
  const nColor = s ? regionColor(s.nReg) : 'var(--text)'
  const both = s !== undefined && s.nReg !== 'cutoff' && s.pReg !== 'cutoff' && s.idd > 1e-6
  const wire = { stroke: 'var(--text-2)', strokeWidth: 2, fill: 'none' }
  return (
    <g>
      <g {...wire}>
        <path d={`M${RX} 50 V${CY_P - 18} M${RX} ${CY_P + 18} V190 M${RX} ${CY_N - 18} V190 M${RX} ${CY_N + 18} V340`} />
        <path d={`M${GATE_X} ${CY_P} V${CY_N} M24 190 H${GATE_X}`} />
        <path d={`M${RX} 190 H292 M292 190 V222 M292 230 V340`} />
        <path d={`${GND(RX, 340)} ${GND(292, 340)}`} />
      </g>
      <path d={`M${RX - 30} 50 H${RX + 30}`} stroke="var(--text)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M280 222 H304 M280 230 H304" stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
      <Mos cx={CX} cy={CY_P} kind="p" color={pColor} />
      <Mos cx={CX} cy={CY_N} kind="n" color={nColor} />
      {[[RX, CY_P - 18], [RX, CY_N + 18], [RX, 190], [GATE_X, 190]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="var(--text)" />
      ))}
      {both ? (
        <path
          d={`M${RX} 50 V${CY_P - 18} H${CX} V${CY_P + 18} H${RX} V${CY_N - 18} H${CX} V${CY_N + 18} H${RX} V340`}
          fill="none"
          stroke="var(--red)"
          strokeWidth="3"
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
      ) : null}
      <T x={RX} y={38} size={11} color="var(--text)" mono>{`VDD ${VDD} V`}</T>
      <T x={RX} y={368} size={11} color="var(--text)">GND</T>
      <T x={292} y={368} size={11} color="var(--text)">GND</T>
      <T x={310} y={230} anchor="start" size={12} color="var(--text)">CL</T>
      <T x={20} y={180} anchor="start" size={12} color="var(--text)" bold>IN</T>
      <T x={182} y={156} anchor="start" size={12} color="var(--gold)" bold>OUT</T>
      {s ? (
        <>
          <T x={20} y={206} anchor="start" size={10} color="var(--gold)" mono>{`Vin ${s.vin.toFixed(2)} V`}</T>
          <T x={182} y={171} anchor="start" size={11} color="var(--gold)" mono>{`${s.vout.toFixed(2)} V`}</T>
          <T x={166} y={160} anchor="end" size={10} color="var(--red)" mono>{both ? `IDD ${(s.idd * 1e3).toFixed(2)} mA` : ''}</T>
          <T x={186} y={CY_P - 16} anchor="start" size={11} color={pColor} bold>{`PMOS ${t(REGION_NAME[s.pReg])}`}</T>
          <T x={186} y={CY_P - 2} anchor="start" size={10} color="var(--text-2)" mono>{`Vsg ${s.vsg.toFixed(2)} V`}</T>
          <T x={186} y={CY_P + 12} anchor="start" size={10} color="var(--text-2)" mono>{`Vsd ${s.vsd.toFixed(2)} V`}</T>
          <T x={186} y={CY_N - 16} anchor="start" size={11} color={nColor} bold>{`NMOS ${t(REGION_NAME[s.nReg])}`}</T>
          <T x={186} y={CY_N - 2} anchor="start" size={10} color="var(--text-2)" mono>{`Vgs ${s.vin.toFixed(2)} V`}</T>
          <T x={186} y={CY_N + 12} anchor="start" size={10} color="var(--text-2)" mono>{`Vds ${s.vout.toFixed(2)} V`}</T>
        </>
      ) : null}
      {live ? null : (
        <>
          <T x={186} y={CY_P - 16} anchor="start" size={12} color="var(--text)" bold>PMOS</T>
          <T x={186} y={CY_P - 2} anchor="start" size={10}>{t(FL.connP)}</T>
          <T x={186} y={CY_P + 12} anchor="start" size={10}>{t(FL.connDG)}</T>
          <T x={186} y={CY_N - 16} anchor="start" size={12} color="var(--text)" bold>NMOS</T>
          <T x={186} y={CY_N - 2} anchor="start" size={10}>{t(FL.connN)}</T>
          <T x={186} y={CY_N + 12} anchor="start" size={10}>{t(FL.connDG)}</T>
        </>
      )}
      {onPick
        ? PARTS.map((p) => {
            const h = HITS[p.id]
            return (
              <Hit key={p.id} label={t(p.title)} active={active === p.id} onPick={() => onPick(p.id)}>
                <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="6" fill="transparent" stroke={active === p.id ? 'var(--gold)' : 'none'} strokeWidth="1.8" strokeDasharray="5 3" />
              </Hit>
            )
          })
        : null}
    </g>
  )
}

/* ---------- 电路 + VTC + 直通电流 ---------- */

const PX0 = 410
const PX1 = 740
const VY0 = 205
const VY1 = 35
const CY0 = 385
const CY1 = 265
const IMAX = Math.ceil(PEAK_MA * 5) / 5 + 0.2
const px = (v: number) => PX0 + (v / VDD) * (PX1 - PX0)
const vy = (v: number) => VY0 - (v / 3.5) * (VY0 - VY1)
const cy = (ma: number) => CY0 - (ma / IMAX) * (CY0 - CY1)

const curve = (pick: (p: (typeof VTC)[number]) => number, toY: (v: number) => number) =>
  VTC.map((p, k) => `${k === 0 ? 'M' : 'L'}${px(p.vin).toFixed(1)} ${toY(pick(p)).toFixed(1)}`).join(' ')

export function SweepFig({ vin }: { vin: number }) {
  const { t } = useLocale()
  const s = opState(vin)
  // 阶段分界：Vtn、VM、VDD − |Vtp|
  const bounds = [0, VTN, KEY.vm, VDD + VTP, VDD]
  const nums = [1, 2, 3, 4]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 420" className="term-fig__svg" role="img" aria-label={t(FL.sweepAria)}>
        <rect width="760" height="420" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="350" height="400" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g transform="translate(10 10)">
          <Schematic vin={vin} />
        </g>
        <T x={PX0} y={VY1 - 12} anchor="start" size={11} color="var(--muted)">{t(FL.vtcTitle)}</T>
        <T x={PX0} y={CY1 - 12} anchor="start" size={11} color="var(--muted)">{t(FL.iddTitle)}</T>
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={PX0} y1={vy(v)} x2={PX1} y2={vy(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={PX0 - 8} y={vy(v) + 4} anchor="end" size={10} color="var(--dim)" mono>{`${v}`}</T>
            <T x={px(v)} y={VY0 + 16} size={10} color="var(--dim)" mono>{`${v}`}</T>
            <T x={px(v)} y={CY0 + 16} size={10} color="var(--dim)" mono>{`${v}`}</T>
          </g>
        ))}
        {[0, 0.5, 1].map((i) => (
          <g key={i}>
            <line x1={PX0} y1={cy(i)} x2={PX1} y2={cy(i)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={PX0 - 8} y={cy(i) + 4} anchor="end" size={10} color="var(--dim)" mono>{`${i}`}</T>
          </g>
        ))}
        <path d={`M${PX0} ${VY0} H${PX1} M${PX0} ${VY0} V${VY1} M${PX0} ${CY0} H${PX1} M${PX0} ${CY0} V${CY1}`} stroke="var(--line-2)" fill="none" />
        <T x={PX1} y={VY0 + 32} anchor="end" size={11} color="var(--muted)">Vin (V)</T>
        <T x={PX1} y={CY0 + 32} anchor="end" size={11} color="var(--muted)">Vin (V)</T>
        {[bounds[1], bounds[2], bounds[3]].map((b) => (
          <g key={b} stroke="var(--line-3)" strokeDasharray="3 4">
            <line x1={px(b)} y1={VY0} x2={px(b)} y2={VY1} />
            <line x1={px(b)} y1={CY0} x2={px(b)} y2={CY1} />
          </g>
        ))}
        {nums.map((n, k) => (
          <T key={n} x={(px(bounds[k]) + px(bounds[k + 1])) / 2} y={CY0 - 8} size={10} color="var(--dim)" mono>{`${n}`}</T>
        ))}
        <path d={curve((p) => p.vout, vy)} fill="none" stroke="var(--blue)" strokeWidth="2.4" />
        <path d={curve((p) => p.idd * 1e3, cy)} fill="none" stroke="var(--red)" strokeWidth="2.4" />
        <g stroke="var(--gold)" strokeDasharray="2 3" opacity="0.8">
          <line x1={px(vin)} y1={VY0} x2={px(vin)} y2={VY1} />
          <line x1={px(vin)} y1={CY0} x2={px(vin)} y2={CY1} />
        </g>
        <circle cx={px(vin)} cy={vy(s.vout)} r="5.5" fill="var(--gold)" stroke="var(--card)" strokeWidth="1.5" />
        <circle cx={px(vin)} cy={cy(s.idd * 1e3)} r="5.5" fill="var(--gold)" stroke="var(--card)" strokeWidth="1.5" />
      </svg>
      <figcaption>{`${t(FL.sweepCap)} ${t(FIG.schemCap)}`}</figcaption>
    </figure>
  )
}
