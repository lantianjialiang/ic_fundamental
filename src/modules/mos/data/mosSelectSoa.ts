import { loc, type LText } from '../../../i18n/locale'
import { cat } from './mosSelectMath'
import { PARTS, TEMPCO, TJ_MAX } from './mosSelectParts'

/** 示意 SOA：取 DEMO-C（DPAK）。外壳固定在 25 °C，单次脉冲，所以只是上限；实际板子要降额 */
const C = PARTS[2]

export const SOA = {
  vmax: C.vds,
  imax: C.idA,
  /** 热态（150 °C）Rds(on) Ω */
  rds: (C.rds[1].mohm * (1 + TEMPCO * (TJ_MAX - 25))) / 1000,
  /** 结到壳热阻 °C/W */
  rth: 2.5,
  tc: 25,
  /** 短脉冲时 Zth ≈ k·√t（一维热扩散），长到 Zth 追上 RθJC 就是直流。单位 °C/W/√s */
  k: 15,
  vminAxis: 0.01,
  vmaxAxis: 100,
  iminAxis: 0.1,
  imaxAxis: 100,
}

export type PulseId = 'dc' | 'ms10' | 'ms1' | 'us100'

export const PULSES: Array<{ id: PulseId; label: LText; tw: number }> = [
  { id: 'dc', label: loc('直流 DC', 'DC'), tw: Infinity },
  { id: 'ms10', label: loc('10 ms', '10 ms'), tw: 0.01 },
  { id: 'ms1', label: loc('1 ms', '1 ms'), tw: 0.001 },
  { id: 'us100', label: loc('100 µs', '100 µs'), tw: 0.0001 },
]

export const zth = (tw: number) => Math.min(SOA.rth, SOA.k * Math.sqrt(tw))
export const powerLimit = (tw: number) => (TJ_MAX - SOA.tc) / zth(tw)

/** 某个脉宽下，在 Vds 处允许的最大电流 */
export const idLimit = (v: number, tw: number) => Math.min(v / SOA.rds, SOA.imax, powerLimit(tw) / v)

export type SoaWhy = 'ok' | 'vds' | 'rds' | 'id' | 'power'

export function judge(v: number, i: number, tw: number): SoaWhy {
  if (v > SOA.vmax) {
    return 'vds'
  }
  if (i > v / SOA.rds) {
    return 'rds'
  }
  if (i > SOA.imax) {
    return 'id'
  }
  if (i * v > powerLimit(tw)) {
    return 'power'
  }
  return 'ok'
}

const num = (x: number) => Number(x.toPrecision(3)).toString()

export function soaReason(why: SoaWhy, v: number, i: number, pulse: LText, tw: number): LText {
  const p = v * i
  const pl = powerLimit(tw)
  if (why === 'ok') {
    return loc(
      `在 SOA 内：P = ${num(v)} V × ${num(i)} A = ${num(p)} W，低于「${pulse.zh}」的功率限制 ${num(pl)} W，电压和电流也都没越界。`,
      `Inside the SOA: P = ${num(v)} V × ${num(i)} A = ${num(p)} W, below the ${pulse.en ?? pulse.zh} power limit of ${num(pl)} W, and neither voltage nor current is over its limit.`,
    )
  }
  if (why === 'vds') {
    return loc(
      `在 SOA 外：Vds = ${num(v)} V 超过电压限制 ${SOA.vmax} V，漏源会击穿，再短的脉冲也救不了。`,
      `Outside the SOA: Vds = ${num(v)} V is above the ${SOA.vmax} V voltage limit and the drain-source junction breaks down; no pulse is short enough to save it.`,
    )
  }
  if (why === 'rds') {
    return loc(
      `在 SOA 外：全导通时 Vds 也至少是 I × Rds(on) = ${num(i)} A × ${num(SOA.rds * 1000)} mΩ = ${num(i * SOA.rds)} V，这个点的 Vds 比它还小，落在 Rds(on) 限制线的左上方，物理上到不了。`,
      `Outside the SOA: even fully on, Vds is at least I × Rds(on) = ${num(i)} A × ${num(SOA.rds * 1000)} mΩ = ${num(i * SOA.rds)} V; this point has less Vds than that, left of the Rds(on) limit line, which the device cannot reach.`,
    )
  }
  if (why === 'id') {
    return loc(
      `在 SOA 外：Id = ${num(i)} A 超过电流限制 ${SOA.imax} A（封装和键合线能过的电流），和 Vds 的大小无关；功率还没超不代表安全。`,
      `Outside the SOA: Id = ${num(i)} A is above the ${SOA.imax} A current limit (what the package and bond wires can carry), whatever Vds is; staying under the power limit does not make it safe.`,
    )
  }
  return cat(
    loc(`在 SOA 外：P = ${num(v)} V × ${num(i)} A = ${num(p)} W，超过「${pulse.zh}」的功率限制 ${num(pl)} W，结温会冲过 ${TJ_MAX} °C。`, `Outside the SOA: P = ${num(v)} V × ${num(i)} A = ${num(p)} W, above the ${pulse.en ?? pulse.zh} power limit of ${num(pl)} W, so Tj would pass ${TJ_MAX} °C. `),
    Number.isFinite(tw)
      ? loc('脉宽越短热越来不及传出去，允许的功率越大。', 'The shorter the pulse, the less time heat has to spread, so the allowed power is larger.')
      : loc('直流下热一直在累积，只能靠 RθJC 往外散。', 'With DC the heat keeps accumulating and can only leave through RθJC.'),
  )
}

export type SoaScene = { id: string; title: LText; sub: LText; tw: PulseId; v: number; i: number; text: LText }

export const SCENES: SoaScene[] = [
  {
    id: 'on',
    title: loc('持续导通 2 A', 'Fully on, 2 A'),
    sub: loc('DC · 0.04 V', 'DC · 0.04 V'),
    tw: 'dc',
    v: 0.04,
    i: 2,
    text: loc('完全导通时 Vds = I × Rds(on)，点贴着 Rds(on) 限制线右下方，功率只有零点几瓦。', 'When fully on, Vds = I × Rds(on), so the point hugs the Rds(on) line from the lower right and the power is a fraction of a watt.'),
  },
  {
    id: 'inrush',
    title: loc('热插拔浪涌', 'Hot-plug inrush'),
    sub: loc('10 ms · 12 V · 20 A', '10 ms · 12 V · 20 A'),
    tw: 'ms10',
    v: 12,
    i: 20,
    text: loc('给大电容充电的瞬间，管子两端还有几乎整个 12 V，电流又大，功率落在 10 ms 线外面。', 'The instant a big capacitor starts charging, nearly the full 12 V is still across the part and the current is high, so the power lands beyond the 10 ms line.'),
  },
  {
    id: 'short',
    title: loc('同一点，脉宽缩到 1 ms', 'Same point, 1 ms'),
    sub: loc('1 ms · 12 V · 20 A', '1 ms · 12 V · 20 A'),
    tw: 'ms1',
    v: 12,
    i: 20,
    text: loc('电压电流不变，只把时间缩短：热来不及扩散，1 ms 的功率限制更高，点回到 SOA 里。给浪涌限时或限流（软启动）就是这个道理。', 'Same voltage and current, only shorter: heat has less time to spread, the 1 ms power limit is higher and the point is back inside. Limiting inrush in time or current (soft start) works for this reason.'),
  },
  {
    id: 'linear',
    title: loc('线性区长时间', 'Long linear-mode hold'),
    sub: loc('DC · 12 V · 8 A', 'DC · 12 V · 8 A'),
    tw: 'dc',
    v: 12,
    i: 8,
    text: loc('把 MOS 管当可调电阻用（慢速软启动、线性调光），Vds 和 Id 同时大，直流功率限制最低。', 'Using the MOSFET as a variable resistor (slow soft start, linear dimming) keeps Vds and Id high together, and the DC power limit is the lowest.'),
  },
  {
    id: 'spike',
    title: loc('关断电压尖峰', 'Turn-off voltage spike'),
    sub: loc('100 µs · 40 V · 1 A', '100 µs · 40 V · 1 A'),
    tw: 'us100',
    v: 40,
    i: 1,
    text: loc('电流很小、时间很短，但电压越过 Vds 最大值，雪崩击穿。电压限制是一堵竖墙，和脉宽无关。', 'Small current and a short time, but the voltage crosses the Vds maximum and the part avalanches. The voltage limit is a vertical wall, independent of pulse width.'),
  },
  {
    id: 'surge',
    title: loc('短路大电流', 'Short-circuit surge'),
    sub: loc('100 µs · 5 V · 60 A', '100 µs · 5 V · 60 A'),
    tw: 'us100',
    v: 5,
    i: 60,
    text: loc('功率没超，但电流超过封装和键合线能承受的 40 A，会熔断键合线。', 'The power is fine, but the current exceeds the 40 A the package and bond wires can carry, and the bond wires fuse.'),
  },
]
