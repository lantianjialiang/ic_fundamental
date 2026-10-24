/**
 * REL-03 可靠性试验方法与样本量的教学模型。
 *
 * 样本量 n = 批次数 × 每批样本数（示例 3 批 × 77 片，以现行标准为准）。
 * 加速因子 AF：HTOL / HTSL / HAST 用 Arrhenius（温度）；TC 用 Coffin-Manson（温差）。
 * 器件小时（未加速）DH = n × h；等效器件小时 DH_eq = n × h × AF。
 * FIT 上限由 core/reliability.ts 的 fitUpperBound(r, DH, CL, AF) 给出（它内部除以 AF），再乘 1e9 得 FIT。
 *
 * HAST 在这里只按温度的 Arrhenius 计算，湿度项未计入（教学简化）。
 */
import { arrheniusAF, coffinMansonAF, fitUpperBound, minSampleZeroFail } from './core/reliability'

export type TestType = 'htol' | 'htsl' | 'tc' | 'hast'

/** 试验类型，显示顺序即数组顺序；默认取 [0] */
export const TEST_TYPES: TestType[] = ['htol', 'htsl', 'tc', 'hast']

/** 使用条件的环境温度（教学取值），°C */
export const T_USE_C = 55
/** 温度循环的使用温差 ΔT（教学取值），°C */
export const DT_USE_C = 65
/** Coffin-Manson 指数 n（教学取值） */
export const CM_EXPONENT = 2
/** 置信度选项，显示顺序即数组顺序；默认取 [0] */
export const CL_OPTIONS: number[] = [0.6, 0.9]

export type StressState = {
  type: TestType
  /** 批次数 */
  batches: number
  /** 每批样本数（片） */
  perBatch: number
  /** 试验小时 h */
  hours: number
  /** 应力温度（Arrhenius 类），°C */
  tStress: number
  /** 温度循环的应力温差 ΔT，°C */
  dtStress: number
  /** 激活能 Ea，eV */
  ea: number
  /** 试验中出现的失效数 r */
  r: number
  /** 置信度 CL（0–1） */
  cl: number
  /** 目标 FIT */
  targetFit: number
}

export const DEFAULT_STRESS: StressState = {
  type: TEST_TYPES[0],
  batches: 3,
  perBatch: 77,
  hours: 500,
  tStress: 125,
  dtStress: 165,
  ea: 0.7,
  r: 0,
  cl: CL_OPTIONS[0],
  targetFit: 50,
}

export type StressAnalysis = {
  /** 样本总数 n */
  n: number
  /** 加速因子 */
  af: number
  /** 未加速的器件小时 n × h */
  deviceHours: number
  /** 等效器件小时 n × h × AF */
  equivHours: number
  /** FIT 上限（置信度 CL、失效数 r） */
  fitUpper: number
  /** 证明目标 FIT 所需的最少样本数（同一 h、AF、CL、r） */
  minSample: number
  /** 上限是否不超过目标 */
  pass: boolean
}

export function sampleSize(state: StressState): number {
  return state.batches * state.perBatch
}

/** 当前试验类型与应力条件对应的加速因子 */
export function accelFactor(state: StressState): number {
  if (state.type === 'tc') {
    return coffinMansonAF(DT_USE_C, state.dtStress, CM_EXPONENT)
  }
  return arrheniusAF(state.ea, T_USE_C, state.tStress)
}

/**
 * 证明 fitTarget（FIT）所需的最少样本数。r = 0 时直接用 minSampleZeroFail；
 * r > 0 时用二分查找：fitUpperBound 随 n 增大单调下降，找到第一个满足目标的 n。
 */
export function minSampleFor(fitTarget: number, cl: number, hours: number, af: number, r: number): number {
  if (r === 0) {
    return minSampleZeroFail(fitTarget, cl, hours, af)
  }
  let hi = 1
  while (fitUpperBound(r, hi * hours, cl, af) * 1e9 > fitTarget && hi < 1e7) {
    hi *= 2
  }
  let lo = 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fitUpperBound(r, mid * hours, cl, af) * 1e9 <= fitTarget) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}

export function analyseStress(state: StressState): StressAnalysis {
  const n = sampleSize(state)
  const af = accelFactor(state)
  const deviceHours = n * state.hours
  const fitUpper = fitUpperBound(state.r, deviceHours, state.cl, af) * 1e9
  return {
    n,
    af,
    deviceHours,
    equivHours: deviceHours * af,
    fitUpper,
    minSample: minSampleFor(state.targetFit, state.cl, state.hours, af, state.r),
    pass: fitUpper <= state.targetFit,
  }
}

/** 上限随失效数 r 变化的曲线（r = 0…maxR），用于 FIT 曲线图 */
export function fitByFailures(n: number, hours: number, cl: number, af: number, maxR: number): number[] {
  const out: number[] = []
  for (let r = 0; r <= maxR; r += 1) {
    out.push(fitUpperBound(r, n * hours, cl, af) * 1e9)
  }
  return out
}
