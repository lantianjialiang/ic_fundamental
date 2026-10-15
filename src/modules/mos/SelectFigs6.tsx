import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { rOn } from './model'
import { f1 } from './data/mosSelectMath'
import { PARTS, SUPPLY, VDRIVE, type Part } from './data/mosSelectParts'
import { T } from './SelectFigs'

export function Frame({ cap, h, children }: { cap: LText; h: number; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 760 ${h}`} className="term-fig__svg" role="img" aria-label={t(cap)}>
        <rect width="760" height={h} rx="10" fill="var(--well)" />
        {children}
      </svg>
      <figcaption>{t(cap)}</figcaption>
    </figure>
  )
}

/* ---------- 1. 标准电平管 vs 逻辑电平管 ---------- */
const PA = PARTS[0]
const PB = PARTS[1]
const kOf = (p: Part) => 1 / ((p.rds[0].mohm / 1000) * (p.rds[0].vgs - p.vth.typ))
const LG = {
  cap: loc(
    '示意（平方律估算）：标准电平管在 3.3 V 时 Vgs − Vth 只剩零点几伏，电阻是几欧；逻辑电平管同样的 3.3 V 下只有几十毫欧。纵轴是对数坐标。',
    'Illustrative (square-law estimate): at 3.3 V a standard-level part has only a few tenths of a volt of Vgs − Vth and several ohms; a logic-level part at the same 3.3 V has tens of milliohms. The vertical axis is logarithmic.',
  ),
  std: loc('标准电平管（Vth ≈ 3 V）', 'Standard-level (Vth ≈ 3 V)'),
  logic: loc('逻辑电平管（Vth ≈ 0.8 V）', 'Logic-level (Vth ≈ 0.8 V)'),
  mcu: loc('MCU 3.3 V', 'MCU 3.3 V'),
  axisY: loc('等效 Rds(on)', 'Effective Rds(on)'),
}
const LX0 = 70
const LX1 = 730
const LY0 = 190
const LY1 = 40
const lx = (v: number) => LX0 + (v / 10) * (LX1 - LX0)
const ly = (ohm: number) => LY0 - ((Math.log10(ohm) + 3) / 6) * (LY0 - LY1)
const fmtR = (ohm: number) => (ohm >= 1 ? `${f1(ohm)} Ω` : `${Math.round(ohm * 1000)} mΩ`)

function rPath(p: Part) {
  let d = ''
  for (let v = p.vth.typ + 0.01; v <= 10; v += 0.05) {
    const r = rOn(v, kOf(p), p.vth.typ)
    if (r <= 1000) {
      d += `${d ? 'L' : 'M'}${lx(v).toFixed(1)} ${ly(r).toFixed(1)} `
    }
  }
  return d
}

export function LogicCaseFig() {
  const { t } = useLocale()
  const rA = rOn(VDRIVE, kOf(PA), PA.vth.typ)
  const rB = rOn(VDRIVE, kOf(PB), PB.vth.typ)
  const sum = loc(
    `2 A 时：标准电平管 P = I² × R ≈ ${Math.round(4 * rB)} W，逻辑电平管 P ≈ ${(4 * rA).toFixed(2)} W`,
    `At 2 A: standard-level P = I² × R ≈ ${Math.round(4 * rB)} W, logic-level P ≈ ${(4 * rA).toFixed(2)} W`,
  )
  const ticks: Array<[number, string]> = [[0.001, '1 mΩ'], [0.01, '10 mΩ'], [0.1, '100 mΩ'], [1, '1 Ω'], [10, '10 Ω'], [100, '100 Ω'], [1000, '1 kΩ']]
  return (
    <Frame cap={LG.cap} h={236}>
      {ticks.map(([ohm, label]) => (
        <g key={label}>
          <line x1={LX0} y1={ly(ohm)} x2={LX1} y2={ly(ohm)} stroke="var(--line-3)" strokeOpacity="0.6" />
          <T x={LX0 - 8} y={ly(ohm) + 4} anchor="end" size={10} color="var(--dim)" mono>
            {label}
          </T>
        </g>
      ))}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <T key={v} x={lx(v)} y={LY0 + 16} size={10} color="var(--dim)" mono>
          {`${v}`}
        </T>
      ))}
      <line x1={LX0} y1={LY0} x2={LX1} y2={LY0} stroke="var(--line-2)" />
      <line x1={LX0} y1={LY0} x2={LX0} y2={LY1} stroke="var(--line-2)" />
      <line x1={lx(VDRIVE)} y1={LY1} x2={lx(VDRIVE)} y2={LY0} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <T x={lx(VDRIVE) + 5} y={LY0 - 6} anchor="start" size={10} color="var(--gold)">
        {t(LG.mcu)}
      </T>
      <path d={rPath(PB)} fill="none" stroke="var(--red)" strokeWidth="2.4" />
      <path d={rPath(PA)} fill="none" stroke="var(--green)" strokeWidth="2.4" />
      <circle cx={lx(VDRIVE)} cy={ly(rB)} r="5" fill="var(--red)" />
      <circle cx={lx(VDRIVE)} cy={ly(rA)} r="5" fill="var(--green)" />
      <T x={lx(VDRIVE) + 10} y={ly(rB) - 10} anchor="start" size={11} color="var(--red)" mono>
        {fmtR(rB)}
      </T>
      <T x={lx(VDRIVE) + 10} y={ly(rA) - 10} anchor="start" size={11} color="var(--green)" mono>
        {fmtR(rA)}
      </T>
      <T x={LX1 - 4} y={ly(rOn(10, kOf(PB), PB.vth.typ)) - 10} anchor="end" size={10} color="var(--red)">
        {t(LG.std)}
      </T>
      <T x={LX1 - 4} y={ly(rOn(10, kOf(PA), PA.vth.typ)) - 10} anchor="end" size={10} color="var(--green)">
        {t(LG.logic)}
      </T>
      <T x={LX0} y={22} anchor="start" size={11} color="var(--text)">
        {t(sum)}
      </T>
      <T x={LX1} y={LY0 + 34} anchor="end" size={10} color="var(--muted)">
        Vgs (V)
      </T>
      <text transform={`translate(14 ${(LY0 + LY1) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--muted)" fontSize="10">
        {t(LG.axisY)}
      </text>
    </Frame>
  )
}

/* ---------- 2. 栅极浮空 ---------- */
const FL = {
  cap: loc(
    '示意：MCU 复位时引脚是高阻，浮空的栅极像天线，漏电和耦合噪声让 Vgs 乱飘，越过 Vgs(th) 管子就半开；加下拉电阻后栅极被固定在 0 V。',
    'Illustrative: during MCU reset the pin is high-impedance, and a floating gate acts as an antenna: leakage and coupled noise make Vgs wander, and above Vgs(th) the transistor half-turns on; with a pull-down the gate is held at 0 V.',
  ),
  top: loc('无下拉：Vgs 乱飘，越过 Vth 就半开', 'No pull-down: Vgs wanders and half-turns it on above Vth'),
  bottom: loc('有 100 kΩ 下拉：始终接近 0 V', 'With a 100 kΩ pull-down: always near 0 V'),
  hiz: loc('高阻', 'Hi-Z'),
  vth: loc('Vgs(th)', 'Vgs(th)'),
}
const WX0 = 270
const WX1 = 696

function Row({ y0, wave, pull, label, color }: { y0: number; wave: (u: number) => number; pull: boolean; label: LText; color: string }) {
  const { t } = useLocale()
  const wy = (v: number) => y0 - Math.max(0, v) * 40
  const vth = PA.vth.typ
  let d = ''
  for (let k = 0; k <= 160; k += 1) {
    const u = k / 160
    d += `${k === 0 ? 'M' : 'L'}${(WX0 + u * (WX1 - WX0)).toFixed(1)} ${wy(wave(u)).toFixed(1)} `
  }
  return (
    <g>
      <line x1={WX0} y1={y0} x2={WX1} y2={y0} stroke="var(--line-2)" />
      <line x1={WX0} y1={wy(vth)} x2={WX1} y2={wy(vth)} stroke="var(--red)" strokeDasharray="5 4" />
      <T x={WX1 + 6} y={wy(vth) + 3} anchor="start" size={10} color="var(--red)">
        {t(FL.vth)}
      </T>
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
      <T x={WX0} y={y0 - 92} anchor="start" size={10.5} color={color}>
        {t(label)}
      </T>
      <g stroke="var(--text-2)" strokeWidth="2" fill="none" strokeLinecap="round">
        <rect x="20" y={y0 - 62} width="56" height="28" rx="4" fill="var(--card)" />
        <path d={`M76 ${y0 - 48} H96`} />
        <rect x="96" y={y0 - 56} width="30" height="16" fill="var(--card)" />
        <path d={`M126 ${y0 - 48} H186`} />
        <path d={`M186 ${y0 - 64} V${y0 - 32}`} strokeWidth="3" />
        {pull ? <path d={`M176 ${y0 - 48} V${y0 - 36} M176 ${y0 - 22} V${y0}`} /> : null}
        {pull ? <rect x="170" y={y0 - 36} width="12" height="14" fill="var(--card)" /> : null}
        {pull ? <path d={`M164 ${y0} H188`} /> : null}
      </g>
      <circle cx="176" cy={y0 - 48} r="3.5" fill="var(--text)" />
      <T x={48} y={y0 - 44} size={10} color="var(--text)" mono>
        GPIO
      </T>
      <T x={48} y={y0 - 24} size={10} color="var(--muted)">
        {t(FL.hiz)}
      </T>
      <T x={111} y={y0 - 62} size={10} color="var(--text-2)" mono>
        Rg
      </T>
      <T x={196} y={y0 - 44} anchor="start" size={10} color="var(--text-2)" mono>
        G
      </T>
      {pull ? (
        <T x={190} y={y0 - 24} anchor="start" size={10} color="var(--green)" mono>
          100 kΩ
        </T>
      ) : null}
    </g>
  )
}

const noisy = (u: number) => 0.55 + 0.45 * Math.sin(2 * Math.PI * 1.1 * u + 0.4) + 0.3 * Math.sin(2 * Math.PI * 3.1 * u + 2) + 0.25 * u
const held = (u: number) => 0.03 + 0.015 * Math.sin(2 * Math.PI * 3.1 * u)

export function FloatCaseFig() {
  return (
    <Frame cap={FL.cap} h={262}>
      <Row y0={118} wave={noisy} pull={false} label={FL.top} color="var(--red)" />
      <Row y0={242} wave={held} pull label={FL.bottom} color="var(--green)" />
    </Frame>
  )
}

/* ---------- 3. 续流二极管 ---------- */
const FB = {
  cap: loc(
    '示意：关断时电感电流不能突变。没有二极管，漏极被顶到雪崩，平台电压约等于 BVdss；有二极管，漏极只被钳在电源电压加二极管压降。',
    'Illustrative: the inductor current cannot jump at turn-off. With no diode the drain is driven into avalanche and the plateau sits near BVdss; with a diode the drain is clamped at the supply plus the diode drop.',
  ),
  off: loc('关断', 'turn off'),
  axisX: loc('时间 (µs)', 'Time (µs)'),
}
const BV = PARTS[0].vds
const L_MH = 1
const I_A = 2
const T_AVAL = ((L_MH * 1e-3 * I_A) / (BV - SUPPLY)) * 1e6
const E_MJ = 0.5 * L_MH * I_A * I_A
const FX0 = 70
const FX1 = 730
const FY0 = 200
const FY1 = 40
const fx = (us: number) => FX0 + (us / 300) * (FX1 - FX0)
const fy = (v: number) => FY0 - (v / 40) * (FY0 - FY1)

export function FlybackCaseFig() {
  const { t } = useLocale()
  const t0 = 50
  const bad = [[0, 0], [t0, 0], [t0, BV], [t0 + T_AVAL, BV], [t0 + T_AVAL, SUPPLY], [300, SUPPLY]]
  const good = [[0, 0], [t0, 0], [t0, SUPPLY + 0.5], [t0 + T_AVAL, SUPPLY + 0.5], [t0 + T_AVAL, SUPPLY], [300, SUPPLY]]
  const pts = (a: number[][]) => a.map(([us, v], k) => `${k === 0 ? 'M' : 'L'}${fx(us).toFixed(1)} ${fy(v).toFixed(1)}`).join(' ')
  const l2 = loc(`持续 ${Math.round(T_AVAL)} µs，储能 ${f1(E_MJ)} mJ 全落在管子里`, `lasts ${Math.round(T_AVAL)} µs; all ${f1(E_MJ)} mJ lands in the MOSFET`)
  return (
    <Frame cap={FB.cap} h={240}>
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={FX0} y1={fy(v)} x2={FX1} y2={fy(v)} stroke="var(--line-3)" strokeOpacity="0.6" />
          <T x={FX0 - 8} y={fy(v) + 4} anchor="end" size={10} color="var(--dim)" mono>
            {`${v}`}
          </T>
        </g>
      ))}
      {[0, 100, 200, 300].map((us) => (
        <T key={us} x={fx(us)} y={FY0 + 16} size={10} color="var(--dim)" mono>
          {`${us}`}
        </T>
      ))}
      <line x1={fx(t0)} y1={FY1} x2={fx(t0)} y2={FY0} stroke="var(--muted)" strokeDasharray="4 3" />
      <T x={fx(t0) - 5} y={FY0 - 6} anchor="end" size={10} color="var(--muted)">
        {t(FB.off)}
      </T>
      <path d={pts(bad)} fill="none" stroke="var(--red)" strokeWidth="2.4" />
      <path d={pts(good)} fill="none" stroke="var(--green)" strokeWidth="2.4" />
      <T x={fx(t0) + 8} y={fy(BV) - 24} anchor="start" size={10.5} color="var(--red)">
        {t(loc(`无二极管：雪崩钳在约 ${BV} V`, `No diode: avalanche clamp near ${BV} V`))}
      </T>
      <T x={fx(t0) + 8} y={fy(BV) - 10} anchor="start" size={10.5} color="var(--red)">
        {t(l2)}
      </T>
      <T x={fx(t0 + T_AVAL) + 16} y={fy(SUPPLY) - 20} anchor="start" size={10.5} color="var(--green)">
        {t(loc(`有二极管：钳在 ${SUPPLY} + 0.5 V`, `With diode: clamped at ${SUPPLY} + 0.5 V`))}
      </T>
      <T x={FX1} y={FY0 + 34} anchor="end" size={10} color="var(--muted)">
        {t(FB.axisX)}
      </T>
      <T x={FX0} y={FY1 - 12} anchor="start" size={11} color="var(--muted)">
        Vds (V)
      </T>
    </Frame>
  )
}