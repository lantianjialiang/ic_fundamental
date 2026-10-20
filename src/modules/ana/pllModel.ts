/**
 * 「PLL / 时钟测试」的仿真模型（教学示意，虚拟器件 VDUT-PLL1，不对应真实型号）。
 * 结构：参考晶振 f_ref → 鉴相器 PFD → 环路滤波 LF → VCO → 输出 f_out，输出经 ÷N 反馈回鉴相器。
 * 锁定时 f_out = N·f_ref，所以参考的 ppm 误差会原样出现在输出上。
 * 锁定过程用一阶指数模型：误差 e(t) = 2% · exp(−t / τ)，τ = 1 / (2π·BW)。
 * 周期抖动用种子随机数的 Monte Carlo 估计，结果可复现。
 * 所有数值都是模型生成的示意结果。
 */
import { gaussian, seededRandom } from './core/rng'
import { stdev } from './core/stats'

/** 参考频率可选项，显示顺序就是数组顺序（MHz） */
export const F_REF_OPTIONS_MHZ: number[] = [10, 20, 25, 50]
/** 输出频率可选项（MHz），与参考频率组合后 N 都是整数 */
export const F_OUT_OPTIONS_MHZ: number[] = [800, 1000, 1200]
export const BW_MIN_KHZ = 10
export const BW_MAX_KHZ = 2000
export const REF_PPM_MAX = 100
export const REF_JITTER_MAX_PS = 4
/** 上电时 VCO 偏离目标的起始误差：2%，单位 ppm */
export const START_OFFSET_PPM = 20000
/** 锁定窗：误差进入 ±10 ppm 即认为锁定 */
export const LOCK_WINDOW_PPM = 10
/** 锁定时间规格（µs） */
export const LOCK_SPEC_US = 10
/** 测试窗口（µs）：窗口内没锁定就判不锁定 */
export const MEASURE_WINDOW_US = 40
/** 输出频率误差规格：±50 ppm */
export const PPM_SPEC = 50
/** 周期抖动规格（ps，rms） */
export const JITTER_SPEC_PS = 2
/** VCO 自身的随机抖动（ps，rms），模型假设值 */
export const VCO_JITTER_PS = 0.8
/** Monte Carlo 的周期样本数 */
export const JITTER_SAMPLES = 2000
/** 稳定性判据：BW 不超过 f_ref / UNSTABLE_DIV（经验规则 BW ≤ f_ref/10） */
export const UNSTABLE_DIV = 10

export type PllState = {
  /** 参考频率（MHz） */
  fRefMhz: number
  /** 输出频率（MHz） */
  fOutMhz: number
  /** 环路带宽（kHz） */
  bwKhz: number
  /** 参考晶振的频率偏差（ppm） */
  refPpm: number
  /** 参考的周期抖动（ps，rms） */
  refJitterPs: number
  /** 随机种子：同一种子结果可复现 */
  seed: number
}

export const DEFAULT_PLL: PllState = {
  fRefMhz: F_REF_OPTIONS_MHZ[0],
  fOutMhz: F_OUT_OPTIONS_MHZ[0],
  bwKhz: 50,
  refPpm: 20,
  refJitterPs: 1,
  seed: 1,
}

export type LockStatus = 'unstable' | 'no-lock' | 'slow' | 'ok'

export type PllResult = {
  /** 反馈分频比 N = f_out / f_ref */
  divider: number
  /** 环路是否稳定 */
  stable: boolean
  /** 一阶模型的时间常数 τ（µs） */
  tauUs: number
  /** 从 2% 进入 ±10 ppm 的时间（µs）；不稳定时为 Infinity */
  lockUs: number
  /** 锁定判定：不稳定 / 测试窗内未锁定 / 超过锁定时间规格 / 正常 */
  lockStatus: LockStatus
  /** 锁定后输出的频率误差（ppm）：等于参考的 ppm 误差 */
  outPpm: number
  /** 锁定后输出的频率误差（Hz）：ppm × f_out（MHz）即 Hz */
  outErrHz: number
  /** 理论周期抖动 √(J_ref² + J_vco²)（ps） */
  jitterTheoryPs: number
  /** Monte Carlo 测得的周期抖动（ps，rms） */
  jitterPs: number
  /** 频率误差是否在 ±50 ppm 规格内 */
  ppmOk: boolean
  /** 周期抖动是否在规格内 */
  jitterOk: boolean
  /** 综合判定：稳定、锁定时间合格、频率与抖动都在规格内 */
  pass: boolean
}

/** 反馈分频比 N，选项组合下必为整数 */
export function dividerOf(fOutMhz: number, fRefMhz: number): number {
  return Math.round(fOutMhz / fRefMhz)
}

/** 稳定性：BW（kHz）不超过 f_ref（MHz）× 100 kHz，即 f_ref / 10 */
export function isStable(bwKhz: number, fRefMhz: number): boolean {
  return bwKhz <= (fRefMhz * 1000) / UNSTABLE_DIV
}

/** 一阶模型的时间常数 τ = 1 / (2π·BW)，单位 µs（BW 以 kHz 输入） */
export function timeConstantUs(bwKhz: number): number {
  return 1000 / (2 * Math.PI * bwKhz)
}

/** 从起始误差 2% 衰减到锁定窗 ±10 ppm 所需的时间：τ·ln(20000 / 10) */
export function lockTimeUs(bwKhz: number): number {
  return timeConstantUs(bwKhz) * Math.log(START_OFFSET_PPM / LOCK_WINDOW_PPM)
}

/** 锁定过程的误差曲线：0 … MEASURE_WINDOW_US，每 0.5 µs 一个点，误差单位 ppm（相对锁定终值） */
export function lockCurve(bwKhz: number): Array<{ t: number; ppm: number }> {
  const tau = timeConstantUs(bwKhz)
  const points: Array<{ t: number; ppm: number }> = []
  for (let t = 0; t <= MEASURE_WINDOW_US; t += 0.5) {
    points.push({ t, ppm: START_OFFSET_PPM * Math.exp(-t / tau) })
  }
  return points
}

/** 从一组参数算出全部结果。纯函数：抖动的随机数只来自 seededRandom(seed) */
export function analyzePll(state: PllState): PllResult {
  const divider = dividerOf(state.fOutMhz, state.fRefMhz)
  const stable = isStable(state.bwKhz, state.fRefMhz)
  const tauUs = timeConstantUs(state.bwKhz)
  const lockUs = stable ? lockTimeUs(state.bwKhz) : Infinity

  let lockStatus: LockStatus = 'ok'
  if (!stable) {
    lockStatus = 'unstable'
  } else if (lockUs > MEASURE_WINDOW_US) {
    lockStatus = 'no-lock'
  } else if (lockUs > LOCK_SPEC_US) {
    lockStatus = 'slow'
  }

  // 锁定后 f_out = N·f_ref，相对误差不变：输出 ppm = 参考 ppm
  const outPpm = state.refPpm
  const outErrHz = outPpm * state.fOutMhz

  const jitterTheoryPs = Math.sqrt(state.refJitterPs ** 2 + VCO_JITTER_PS ** 2)
  const random = seededRandom(state.seed)
  const samples: number[] = []
  for (let i = 0; i < JITTER_SAMPLES; i += 1) {
    samples.push(jitterTheoryPs * gaussian(random))
  }
  const jitterPs = stdev(samples)

  const ppmOk = Math.abs(outPpm) <= PPM_SPEC
  const jitterOk = jitterPs <= JITTER_SPEC_PS
  return {
    divider,
    stable,
    tauUs,
    lockUs,
    lockStatus,
    outPpm,
    outErrHz,
    jitterTheoryPs,
    jitterPs,
    ppmOk,
    jitterOk,
    pass: lockStatus === 'ok' && ppmOk && jitterOk,
  }
}
