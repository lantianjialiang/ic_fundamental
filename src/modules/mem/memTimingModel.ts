/**
 * MEM-06 存储器时序测试（纯函数）。
 *
 * 读数据有效窗口：地址在 t=0 改变，数据在 tAA 之后稳定，并一直保持到下一个地址改变（t = T）之后的 tOH。
 * 所以有效窗口是 [tAA, T + tOH]，宽度 = T + tOH − tAA。采样点 s 通过，当且仅当它落在窗口内。
 * 裕量 = 采样点到两条边界中较近的一条的距离；裕量最大的是窗口中央。
 */
import { loc, type LText } from '../../i18n/locale'

/** 输出保持时间：下一个地址改变之后，旧数据仍然有效的时间（教学取值） */
export const TOH_NS = 1.5
/** 量产判定要求的最小裕量（教学取值）：裕量不足 1 ns 时，即使功能上能过也要报警 */
export const SPEC_MARGIN_NS = 1

/** 周期选项，与综合课一致（100 / 125 / 80 MHz）；数组第一个是默认值 */
export const PERIOD_OPTIONS_NS: number[] = [10, 8, 12.5]

export type DeviceId = 'typ' | 'fast' | 'slow'

/** 器件的 tAA（地址改变到数据稳定的时间）。顺序即显示顺序，默认取第一个 */
export const DEVICE_OPTIONS: Array<{ id: DeviceId; label: LText; tAA: number }> = [
  { id: 'typ', label: loc('典型器件', 'Typical part'), tAA: 6 },
  { id: 'fast', label: loc('快器件', 'Fast part'), tAA: 4 },
  { id: 'slow', label: loc('慢器件', 'Slow part'), tAA: 8.5 },
]

export const DEVICE_IDS: DeviceId[] = DEVICE_OPTIONS.map((item) => item.id)

export function tAAOf(id: DeviceId): number {
  const found = DEVICE_OPTIONS.find((item) => item.id === id)
  return found === undefined ? DEVICE_OPTIONS[0].tAA : found.tAA
}

export type TimingState = {
  device: DeviceId
  period: number
  /** 采样点相对地址改变的时刻，ns */
  strobe: number
  /** 是否已经做过一次二分搜索 */
  searched: boolean
}

export const DEFAULT_TIMING: TimingState = { device: DEVICE_IDS[0], period: PERIOD_OPTIONS_NS[0], strobe: 7.5, searched: false }

export type Window = { lo: number; hi: number; width: number; centre: number; maxMargin: number }

/** 读数据有效窗口：[tAA, T + tOH] */
export function windowOf(tAA: number, period: number): Window {
  const hi = period + TOH_NS
  const width = hi - tAA
  return { lo: tAA, hi, width, centre: (tAA + hi) / 2, maxMargin: width / 2 }
}

/** 采样点的裕量（ns）：负数表示落在窗口外 */
export function marginAt(tAA: number, period: number, strobe: number): number {
  const w = windowOf(tAA, period)
  return Math.min(strobe - w.lo, w.hi - strobe)
}

export function passAt(tAA: number, period: number, strobe: number): boolean {
  return marginAt(tAA, period, strobe) >= 0
}

export type BisectStep = { strobe: number; pass: boolean }

/**
 * 二分搜索有效窗口的左边界（只用通过/失败的测量，不直接读 tAA）。
 * 左端 0 失败；右端取周期 T，若 T 也失败说明一个周期内放不下这颗器件，返回 ok=false。
 * 每一步把区间对半分；steps 步后误差不超过 T / 2^steps。
 */
export function bisectEdge(tAA: number, period: number, steps: number = 7): { ok: boolean; estimate: number; trace: BisectStep[] } {
  const trace: BisectStep[] = []
  if (!passAt(tAA, period, period)) {
    return { ok: false, estimate: Number.NaN, trace }
  }
  let lo = 0
  let hi = period
  for (let i = 0; i < steps; i += 1) {
    const mid = (lo + hi) / 2
    const pass = passAt(tAA, period, mid)
    trace.push({ strobe: mid, pass })
    if (pass) {
      hi = mid
    } else {
      lo = mid
    }
  }
  return { ok: true, estimate: hi, trace }
}

/** Shmoo 网格：列是周期，行是采样点（0–14 ns，每行 1 ns） */
export const SHMOO_PERIODS: number[] = [7, 8, 9, 10, 11, 12, 12.5, 13, 14]
export const SHMOO_STROBES: number[] = Array.from({ length: 15 }, (_, index) => index)

export function shmooPass(tAA: number, period: number, strobe: number): boolean {
  return passAt(tAA, period, strobe)
}

export type TimingAnalysis = {
  tAA: number
  period: number
  win: Window
  margin: number
  pass: boolean
  /** 裕量达到量产要求 */
  robust: boolean
  early: boolean
  late: boolean
}

export function analyseTiming(state: TimingState): TimingAnalysis {
  const tAA = tAAOf(state.device)
  const win = windowOf(tAA, state.period)
  const margin = marginAt(tAA, state.period, state.strobe)
  return {
    tAA,
    period: state.period,
    win,
    margin,
    pass: margin >= 0,
    robust: margin >= SPEC_MARGIN_NS,
    early: state.strobe < win.lo,
    late: state.strobe > win.hi,
  }
}
