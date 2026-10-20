/**
 * 高速接口测试的教学模型（HS-06）。
 * 码型：prbsBits(order, N) 产生 N 位 NRZ 数据，第 k 位占 [k, k+1) UI。
 * 边沿偏移（单位 UI，相对位边界 k）由三部分相加：
 *   · 确定性抖动 DJ：双狄拉克，每个边沿等概率落在 ±DJ/2 两点之一；
 *   · 随机抖动 RJ：高斯，rms 为 σ；
 *   · 长连偏移 W：边沿前面连续 ≥ LONG_RUN 个相同位时，这个边沿再推迟 W（示意，模拟交流耦合的基线漂移）。
 * 取样：接收端在 k + φ 时刻判决第 k 位。该时刻的电平由最近一次已经发生的边沿决定，
 * 所以只有相邻边沿越过采样点时才出错。
 * 路径：外部链路还要加上夹具与 ATE 比较器的附加抖动（ATE_EXT_*）；Loopback 只剩芯片内部路径。
 * 外推：双狄拉克的解析式 extrapolatedBer()，只含 DJ 与 RJ，不含长连偏移。
 * 所有随机数来自 seededRandom(SEED)，同样的设置每次算出的结果一样。
 */

import { gaussian, seededRandom } from '../ana/core/rng'
import { tjAtBer, qFunction } from './core/jitter'
import { prbsBits, type PrbsOrder } from './core/prbs'

export type InterfacePath = 'ext' | 'loop'

export type InterfaceState = {
  /** PRBS 阶数，显示顺序即 ORDERS 的顺序 */
  order: PrbsOrder
  /** 测试路径：ext = 外部链路（ATE 采样引脚），loop = Loopback（芯片内部回环） */
  path: InterfacePath
  /** 数据速率，Gb/s */
  rate: number
  /** 采样相位，UI（0 = 左边沿处，0.5 = 眼中心） */
  phase: number
  /** DUT 随机抖动 rms，ps */
  rj: number
  /** DUT 确定性抖动 峰峰值，ps */
  dj: number
  /** 长连边沿偏移，ps */
  wander: number
}

export const ORDERS: PrbsOrder[] = [7, 15, 31]
export const PATHS: InterfacePath[] = ['ext', 'loop']
export const RATES: number[] = [10, 16]

export const DEFAULT_INTERFACE: InterfaceState = {
  order: ORDERS[0],
  path: PATHS[0],
  rate: RATES[0],
  phase: 0.5,
  rj: 1.5,
  dj: 10,
  wander: 0,
}

/** 每个取样点统计的位数 */
export const BITS = 40000
/** 相位扫描的步数：0 到 1 UI 共 PHASE_STEPS + 1 个点 */
export const PHASE_STEPS = 50
/** 连续相同位达到这个长度，紧跟其后的边沿才会被长连偏移推迟 */
export const LONG_RUN = 8
/** 外部链路附加的 DJ 峰峰值与 RJ rms，ps（教学示意值，不对应任何具体设备） */
export const ATE_EXT_DJ_PS = 8
export const ATE_EXT_RJ_PS = 1
/** 目标 BER，用于外推眼宽 */
export const TARGET_BER = 1e-12

const SEED = 0x3c1d

export type PathJitter = { djPs: number; rjPs: number }

/** 按测试路径算出实际落在接收端的抖动：外部链路多出 ATE 与夹具的一份 */
export function pathJitter(state: InterfaceState): PathJitter {
  if (state.path === 'loop') {
    return { djPs: state.dj, rjPs: state.rj }
  }
  return { djPs: state.dj + ATE_EXT_DJ_PS, rjPs: Math.hypot(state.rj, ATE_EXT_RJ_PS) }
}

type Trace = {
  bits: Uint8Array
  /** 第 k 个位边界上的边沿偏移，UI */
  off: Float64Array
  /** 第 k 个边沿是否被长连偏移推迟 */
  longFlag: Uint8Array
}

/** 生成一次实验的码型与边沿偏移；同一设置下结果固定 */
function buildTrace(state: InterfaceState, jitter: PathJitter): Trace {
  const ui = 1000 / state.rate
  const djUi = jitter.djPs / ui
  const sigmaUi = jitter.rjPs / ui
  const wanderUi = state.wander / ui
  const length = BITS + 2
  const bits = prbsBits(state.order, length)
  const off = new Float64Array(length)
  const longFlag = new Uint8Array(length)
  const random = seededRandom(SEED)
  let run = 1
  for (let k = 0; k < length; k += 1) {
    const sign = random() < 0.5 ? -1 : 1
    let offset = (sign * djUi) / 2 + sigmaUi * gaussian(random)
    if (k > 0) {
      if (bits[k] === bits[k - 1]) {
        run += 1
      } else {
        if (run >= LONG_RUN) {
          longFlag[k] = 1
          offset += wanderUi
        }
        run = 1
      }
    }
    off[k] = offset
  }
  return { bits, off, longFlag }
}

export type Count = { errors: number; longErrors: number }

/**
 * 在采样相位 phase（UI）上统计错误位。第 k 位在 k + phase 时刻取样：
 * 若第 k+1 个边沿已经越过 k+phase（偏移 ≤ phase − 1），取到第 k+1 位；
 * 否则若第 k 个边沿还没到（偏移 > phase），取到第 k−1 位；其余情况取到第 k 位。
 * longErrors 记录错误是否由被长连偏移推迟的边沿引起。
 */
function countAt(trace: Trace, phase: number): Count {
  const { bits, off, longFlag } = trace
  let errors = 0
  let longErrors = 0
  for (let k = 1; k <= BITS; k += 1) {
    let value = bits[k]
    let edge = -1
    if (off[k + 1] <= phase - 1) {
      value = bits[k + 1]
      edge = k + 1
    } else if (off[k] > phase) {
      value = bits[k - 1]
      edge = k
    }
    if (value !== bits[k]) {
      errors += 1
      if (longFlag[edge] === 1) {
        longErrors += 1
      }
    }
  }
  return { errors, longErrors }
}

export type SweepPoint = { phase: number; errors: number; longErrors: number }

export type InterfaceAnalysis = {
  /** 单位间隔，ps */
  ui: number
  /** 当前路径下落在接收端的 DJ 峰峰值与 RJ rms，ps */
  djPs: number
  rjPs: number
  /** 同一组抖动换算成 UI */
  djUi: number
  sigmaUi: number
  /** 当前采样相位的统计 */
  errors: number
  longErrors: number
  /** 实测 BER = 错误位数 ÷ 位数（0 错误时无意义，见 floor） */
  ber: number
  /** 0 错误时的 95% 置信上限，3 ÷ N（rule of three） */
  floor: number
  pass: boolean
  /** 0–1 UI 的整条浴盆扫描 */
  sweep: SweepPoint[]
  /** 外推到 TARGET_BER 的眼宽，ps；可能为负（闭合） */
  openPs: number
  openLoopPs: number
  openExtPs: number
}

/**
 * 眼宽（外推）= UI − TJ@BER，TJ 用教科书式 tjAtBer（DJ_pp + 2·Q·σ）。
 * 它与浴盆曲线上 extrapolatedBer 解出的 1e-12 位置相差约 0.3–2 ps（数值检查过），读数与曲线在图上看不出差别。
 */
function openAt(jitter: PathJitter, ui: number): number {
  return ui - tjAtBer(jitter.djPs, jitter.rjPs, TARGET_BER)
}

/**
 * 双狄拉克解析式的 BER(φ)，只含 DJ 与 RJ（不含长连偏移）。
 * 每个位边界有 ½ 的概率翻转；左右两侧各有“边沿太晚”与“边沿太早”两种误判。
 * 只在码型没有触发长连缺陷时可信，所以页面上标注为外推。
 */
export function extrapolatedBer(phase: number, djUi: number, sigmaUi: number): number {
  if (sigmaUi <= 0) {
    return 0
  }
  const half = djUi / 2
  const late = 0.5 * (qFunction((phase - half) / sigmaUi) + qFunction((phase + half) / sigmaUi))
  const early = 0.5 * (qFunction((1 - phase + half) / sigmaUi) + qFunction((1 - phase - half) / sigmaUi))
  return 0.5 * (late + early)
}

export function analyseInterface(state: InterfaceState): InterfaceAnalysis {
  const ui = 1000 / state.rate
  const jitter = pathJitter(state)
  const trace = buildTrace(state, jitter)
  const sweep: SweepPoint[] = []
  for (let i = 0; i <= PHASE_STEPS; i += 1) {
    const phase = i / PHASE_STEPS
    const count = countAt(trace, phase)
    sweep.push({ phase, errors: count.errors, longErrors: count.longErrors })
  }
  const now = countAt(trace, state.phase)
  const loopJitter = pathJitter({ ...state, path: 'loop' })
  const extJitter = pathJitter({ ...state, path: 'ext' })
  return {
    ui,
    djPs: jitter.djPs,
    rjPs: jitter.rjPs,
    djUi: jitter.djPs / ui,
    sigmaUi: jitter.rjPs / ui,
    errors: now.errors,
    longErrors: now.longErrors,
    ber: now.errors / BITS,
    floor: 3 / BITS,
    pass: now.errors === 0,
    sweep,
    openPs: openAt(jitter, ui),
    openLoopPs: openAt(loopJitter, ui),
    openExtPs: openAt(extJitter, ui),
  }
}
