/**
 * 眼图的教学模型（HS-05）。
 * 发送端：PRBS7（生成多项式 x^7 + x^6 + 1）NRZ，电平 ±400 mV，周期 127 位。
 * 信道：一阶 RC 低通，τ = 1000 / (2π·BW) ps（BW 单位 GHz）；上升时间 ≈ 350 / BW ps。
 * 抖动：每个比特边界加一个高斯偏移，rms = RJ（ps），种子固定，同样的设置每次算出的结果一样。
 * 眼图：把若干个 UI 叠在一起，中心（0.5 UI）处的上下电平之间的空隙就是眼高；
 * 六边形 mask 是禁区，任何采样点落进去就判 FAIL。
 */

export type EyeState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 信道 −3 dB 带宽，GHz */
  bw: number
  /** 随机抖动 rms，ps */
  rj: number
}

/** 速率选项，显示顺序即数组顺序；默认取 [0] */
export const RATES: number[] = [5, 10, 16]

export const DEFAULT_EYE: EyeState = { rate: RATES[0], bw: 8, rj: 0 }

/** 电平：±LEVEL_MV */
export const LEVEL_MV = 400
/** 六边形 mask：中心处半高 MASK_MV，平顶半宽 MASK_FLAT_UI，尖端半宽 MASK_HALF_UI（单位 UI） */
export const MASK_MV = 200
export const MASK_FLAT_UI = 0.15
export const MASK_HALF_UI = 0.35

/** 每个 UI 的采样点数 */
export const SPU = 32
const PERIOD = 127
const SKIP_BITS = PERIOD
const TOTAL_BITS = 3 * PERIOD
const SEED = 0x2a5f

/** PRBS7：x^7 + x^6 + 1，一个周期 127 位 */
export function prbs7(): number[] {
  const bits: number[] = []
  let reg = 0x7f
  for (let i = 0; i < PERIOD; i += 1) {
    const bit = ((reg >> 6) ^ (reg >> 5)) & 1
    bits.push(bit)
    reg = ((reg << 1) | bit) & 0x7f
  }
  return bits
}

/** mulberry32：一个很短的种子随机数，保证同样的输入得到同样的眼图 */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Box–Muller：标准正态分布 */
function gaussian(random: () => number): number {
  let u = random()
  while (u <= 0) {
    u = random()
  }
  const v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** 判断一个点 (u, y) 是否在 mask 内；u 为到眼中心的水平距离（UI），y 为电压（mV） */
export function inMask(u: number, y: number): boolean {
  if (u > MASK_HALF_UI) {
    return false
  }
  if (u <= MASK_FLAT_UI) {
    return Math.abs(y) <= MASK_MV
  }
  return Math.abs(y) <= (MASK_MV * (MASK_HALF_UI - u)) / (MASK_HALF_UI - MASK_FLAT_UI)
}

export type HitPoint = { x: number; y: number }

export type EyeAnalysis = {
  /** 单位间隔 UI，ps */
  ui: number
  /** 上升时间 ≈ 350 / BW，ps */
  riseTime: number
  /** 中心（0.5 UI）处的眼高，mV；负数表示闭合 */
  height: number
  /** 眼宽，UI */
  width: number
  /** 落进 mask 的采样点数 */
  hits: number
  pass: boolean
  /** 分析用的采样值（mV），每个 UI SPU 个点，从一个整周期之后开始 */
  wave: Float64Array
  /** 落进 mask 的点，x 为 0–2 UI 内的位置 */
  hitPoints: HitPoint[]
}

export function analyseEye(state: EyeState): EyeAnalysis {
  const bits = prbs7()
  const bitAt = (n: number) => bits[((n % PERIOD) + PERIOD) % PERIOD]
  const ui = 1000 / state.rate
  const tau = 1000 / (2 * Math.PI * state.bw)
  const dt = ui / SPU
  const alpha = 1 - Math.exp(-dt / tau)

  const random = seededRandom(SEED)
  const edge = new Float64Array(TOTAL_BITS + 1)
  for (let k = 0; k <= TOTAL_BITS; k += 1) {
    edge[k] = state.rj * gaussian(random)
  }

  /** 第 i 个采样点落在哪一位（考虑抖动后的边沿） */
  const bitIndexAt = (i: number): number => {
    const ti = i * dt
    const n0 = Math.floor(ti / ui)
    if (ti < n0 * ui + edge[n0] - 1e-9) {
      return n0 - 1
    }
    if (ti >= (n0 + 1) * ui + edge[n0 + 1] - 1e-9) {
      return n0 + 1
    }
    return n0
  }

  const total = TOTAL_BITS * SPU
  const y = new Float64Array(total)
  for (let i = 0; i < total; i += 1) {
    const level = bitAt(bitIndexAt(i)) ? LEVEL_MV : -LEVEL_MV
    if (i === 0) {
      y[0] = level
    } else {
      y[i] = y[i - 1] + alpha * (level - y[i - 1])
    }
  }

  const from = SKIP_BITS * SPU
  const minHigh = new Array<number>(SPU).fill(Infinity)
  const maxLow = new Array<number>(SPU).fill(-Infinity)
  const hitPoints: HitPoint[] = []
  let hits = 0
  for (let i = from; i < total; i += 1) {
    const q = i % SPU
    const v = y[i]
    if (bitAt(Math.floor(i / SPU))) {
      if (v < minHigh[q]) {
        minHigh[q] = v
      }
    } else if (v > maxLow[q]) {
      maxLow[q] = v
    }
    const x = (i % (2 * SPU)) / SPU
    const u = Math.min(Math.abs(x - 0.5), Math.abs(x - 1.5))
    if (inMask(u, v)) {
      hits += 1
      hitPoints.push({ x, y: v })
    }
  }

  const openings = minHigh.map((high, q) => high - maxLow[q])
  const height = openings[SPU / 2]
  const width = openings.filter((h) => h > 0).length / SPU

  return {
    ui,
    riseTime: 350 / state.bw,
    height,
    width,
    hits,
    pass: hits === 0,
    wave: y.slice(from, total),
    hitPoints,
  }
}
