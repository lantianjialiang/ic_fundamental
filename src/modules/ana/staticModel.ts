/**
 * 「ADC / DAC 静态参数」的器件模型：虚构 6 位 ADC VDUT-ADC1，数值为教学示意，不对应任何真实芯片。
 *
 * 模型：码 k 的理想跳变点是 T_k = k（单位 LSB，k = 1..63）。器件的真实跳变点为
 *   T_k = offset + k·(1 + gain) + σ·gauss_k
 * 其中 offset 是整体平移，gain 是满量程的比例误差，gauss_k 是每个跳变点自己的随机偏差（决定 DNL / INL）。
 * 丢码器件把某个跳变点拉到前一个跳变点上，使该码的宽度为 0。
 *
 * 测试：输入是一段覆盖 [RAMP_LO, RAMP_HI] 的均匀斜坡，每个样本落在哪个码由跳变点决定，
 * 统计各码的命中数（码密度直方图）。样本用 seededRandom 生成，同一种子结果可复现。
 */
import { gaussian, seededRandom } from './core/rng'

export const NBITS = 6
export const NCODES = 1 << NBITS
export const CODE_MAX = NCODES - 1

/** 斜坡起点、终点（LSB）：起点在码 0 之前、终点超过满量程，使两端的码也能采到样本 */
export const RAMP_LO = -2
export const RAMP_HI = 66
export const RAMP_LEN = RAMP_HI - RAMP_LO

/** 参与 DNL / INL 计算的中间码数：码 1 ~ CODE_MAX − 1 */
export const INNER_COUNT = CODE_MAX - 1

/** 限值（示意，LSB） */
export const LIMIT_OFFSET_LSB = 1
export const LIMIT_GAIN_LSB = 1
export const LIMIT_DNL_LSB = 0.5
export const LIMIT_INL_LSB = 1

/** 直方图测量的随机种子（固定，保证页面刷新后结果一致） */
export const MEAS_SEED = 2026

/** 样本数选项：数组顺序就是显示顺序，第一个为默认值 */
export const HITS_OPTIONS: number[] = [64000, 16000, 4000, 1000, 250]

export type DeviceId = 'typ' | 'gain' | 'miss'

export type DeviceSpec = {
  id: DeviceId
  /** 整体偏移，LSB */
  offsetLsb: number
  /** 满量程比例误差，无量纲（0.02 = 2%） */
  gainErr: number
  /** 丢码的码号；null 表示没有丢码 */
  missCode: number | null
  /** 生成跳变点随机偏差的种子 */
  seed: number
  /** 跳变点随机偏差的标准差，LSB */
  sigmaLsb: number
}

/** 器件：数组顺序就是显示顺序，第一个为默认值 */
export const DEVICES: DeviceSpec[] = [
  { id: 'typ', offsetLsb: 0.2, gainErr: 0.003, missCode: null, seed: 1729, sigmaLsb: 0.05 },
  { id: 'gain', offsetLsb: 0.2, gainErr: 0.02, missCode: null, seed: 1729, sigmaLsb: 0.05 },
  { id: 'miss', offsetLsb: 0.2, gainErr: 0.003, missCode: 37, seed: 1729, sigmaLsb: 0.05 },
]

export type StaticState = {
  device: DeviceId
  /** 样本数 N */
  hits: number
}

export const DEFAULT_STATIC: StaticState = {
  device: DEVICES[0].id,
  hits: HITS_OPTIONS[0],
}

export function deviceOf(id: DeviceId): DeviceSpec {
  const found = DEVICES.find((d) => d.id === id)
  return found ?? DEVICES[0]
}

/** 真实跳变点 T_1 ~ T_63，共 63 个，下标 k − 1 对应 T_k */
export function buildTransitions(device: DeviceSpec): number[] {
  const random = seededRandom(device.seed)
  const trans: number[] = []
  for (let k = 1; k <= CODE_MAX; k++) {
    const noise = device.sigmaLsb * gaussian(random)
    trans.push(device.offsetLsb + k * (1 + device.gainErr) + noise)
  }
  if (device.missCode !== null) {
    /* 把跳变点 T_missCode+1 拉到 T_missCode 上：码 missCode 的宽度为 0，永远采不到 */
    trans[device.missCode] = trans[device.missCode - 1]
  }
  return trans
}

/** 输入 x（LSB）落在哪个码：等于满足 T_k ≤ x 的跳变点个数，结果在 0 ~ CODE_MAX 之间 */
export function codeOf(x: number, trans: number[]): number {
  let lo = 0
  let hi = trans.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (trans[mid] <= x) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo
}

/** 码密度直方图：hits 次均匀斜坡采样，统计每个码的命中数 */
export function histogram(hits: number, trans: number[]): number[] {
  const random = seededRandom(MEAS_SEED)
  const counts: number[] = new Array<number>(NCODES).fill(0)
  for (let i = 0; i < hits; i++) {
    const x = RAMP_LO + RAMP_LEN * random()
    counts[codeOf(x, trans)] += 1
  }
  return counts
}

/** 理想情况下每个中间码的命中数：N 次样本均匀铺在 RAMP_LEN 个 LSB 上，每码宽 1 LSB */
export function expectedPerCode(hits: number): number {
  return hits / RAMP_LEN
}

export type StaticResult = {
  hits: number
  counts: number[]
  /** 跳变点 T_1 的估计值减去理想值 1 LSB，LSB */
  offsetLsb: number
  /** 满量程跨度（T_63 − T_1）减去理想跨度 62 LSB，LSB */
  gainLsb: number
  /** 中间码的 DNL，下标 k − 1 对应码 k，LSB */
  dnl: number[]
  /** 中间码的 INL（DNL 的累加），下标 k − 1 对应码 k，LSB */
  inl: number[]
  maxDnl: number
  maxInl: number
  /** 中间码里命中数为 0 的码号 */
  missing: number[]
  expected: number
  offsetPass: boolean
  gainPass: boolean
  dnlPass: boolean
  inlPass: boolean
  missPass: boolean
  pass: boolean
}

export function staticResult(state: StaticState): StaticResult {
  const device = deviceOf(state.device)
  const trans = buildTransitions(device)
  const counts = histogram(state.hits, trans)
  const n = state.hits

  /* 端点法：T_1 = RAMP_LO + RAMP_LEN·H_0/N；T_63 对应低于它的全部样本 H_0 + Σ H_1..62 */
  const t1 = RAMP_LO + (RAMP_LEN * counts[0]) / n
  let interiorSum = 0
  for (let k = 1; k <= INNER_COUNT; k++) {
    interiorSum += counts[k]
  }
  const tTop = RAMP_LO + (RAMP_LEN * (counts[0] + interiorSum)) / n
  const offsetLsb = t1 - 1
  const gainLsb = tTop - t1 - INNER_COUNT

  /* DNL 以中间码的平均命中数为基准：增益误差让所有码等比例变化，归一后不计入 DNL */
  const mean = interiorSum / INNER_COUNT
  const dnl: number[] = []
  const inl: number[] = []
  const missing: number[] = []
  let cumDnl = 0
  for (let k = 1; k <= INNER_COUNT; k++) {
    const value = counts[k] / mean - 1
    dnl.push(value)
    cumDnl += value
    inl.push(cumDnl)
    if (counts[k] === 0) {
      missing.push(k)
    }
  }
  const maxDnl = dnl.reduce((m, v) => Math.max(m, Math.abs(v)), 0)
  const maxInl = inl.reduce((m, v) => Math.max(m, Math.abs(v)), 0)

  const offsetPass = Math.abs(offsetLsb) <= LIMIT_OFFSET_LSB
  const gainPass = Math.abs(gainLsb) <= LIMIT_GAIN_LSB
  const dnlPass = maxDnl <= LIMIT_DNL_LSB
  const inlPass = maxInl <= LIMIT_INL_LSB
  const missPass = missing.length === 0
  return {
    hits: n,
    counts,
    offsetLsb,
    gainLsb,
    dnl,
    inl,
    maxDnl,
    maxInl,
    missing,
    expected: expectedPerCode(n),
    offsetPass,
    gainPass,
    dnlPass,
    inlPass,
    missPass,
    pass: offsetPass && gainPass && dnlPass && inlPass && missPass,
  }
}
