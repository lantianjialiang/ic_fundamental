/**
 * 「ADC 动态参数」的仿真模型（教学示意，虚拟器件 VDUT-ADC2，不对应真实型号）。
 * 信号链：正弦输入（0.9 FS）→ 二阶 / 三阶非线性 → 输入参考噪声（高斯）→ N 位中点量化（满量程 ±1 FS）。
 * 用相干采样（f_in = M·fs/N，M 与 N 互质）让基波与各次谐波都落在整数频点上，
 * 再用 core/fft.ts 的 amplitudeSpectrum 读出基波、谐波与噪底。
 * 所有数值都是模型生成的示意结果。
 */
import { amplitudeSpectrum, windowCoefficients, type WindowKind } from './core/fft'
import { gaussian, seededRandom } from './core/rng'

/** FFT 点数，必须是 2 的幂 */
export const N_POINTS = 4096
/** 基波的整周期数 M。401 是奇素数，与 4096 互质，满足相干采样 */
export const CYCLES = 401
/** 输入幅度，单位为满量程 FS：0.9 FS 约 −0.92 dBFS，留出余量避免削顶 */
export const INPUT_AMP = 0.9
/** 统计到第 HARMONIC_MAX 次谐波（HD2 … HD9） */
export const HARMONIC_MAX = 9
/** 规格限值：SINAD 不低于 50 dB（示意） */
export const SINAD_SPEC = 50
/** 可选位数，显示顺序就是数组顺序 */
export const ADC_BITS: number[] = [8, 10, 12, 14]
/** 可选分析窗，显示顺序就是数组顺序 */
export const WINDOW_KINDS: WindowKind[] = ['blackman-harris', 'hann']
/** HD 目标的可调范围（dBc）；低于下限视为没有该项失真 */
export const HD_MIN_DB = -120
export const HD_MAX_DB = -40
/** 输入参考噪声的可调上限（LSB rms） */
export const NOISE_MAX_LSB = 10
/** 频谱纵轴下限（dBFS） */
export const FLOOR_DB = -140

export type DynamicState = {
  /** ADC 位数 N */
  bits: number
  /** 输入参考噪声，单位 LSB rms */
  noiseLsb: number
  /** 二阶谐波 HD2 目标（dBc）；低于 HD_MIN_DB 时关闭二阶非线性 */
  hd2Db: number
  /** 三阶谐波 HD3 目标（dBc）；低于 HD_MIN_DB 时关闭三阶非线性 */
  hd3Db: number
  /** 分析窗 */
  window: WindowKind
  /** 随机种子：同一种子结果可复现；「重新采样」会换一个种子 */
  seed: number
}

export const DEFAULT_DYNAMIC: DynamicState = {
  bits: ADC_BITS[0],
  noiseLsb: 0,
  hd2Db: HD_MIN_DB,
  hd3Db: HD_MIN_DB,
  window: WINDOW_KINDS[0],
  seed: 1,
}

export type Harmonic = {
  /** 谐波次数，2 表示 HD2 */
  order: number
  /** 该谐波所在的频点（已折叠到 0 … N/2） */
  bin: number
  /** 峰值幅度，满量程 FS 归一 */
  amp: number
}

export type DynamicResult = {
  /** 幅度谱（FS 归一的峰值），长度 N/2 */
  amps: Float64Array
  /** HD2 … HD_HARMONIC_MAX */
  harmonics: Harmonic[]
  /** 基波峰值幅度 */
  fundAmp: number
  /** SNR，dB：基波 / 噪声（不含谐波） */
  snr: number
  /** SINAD，dB：基波 / (噪声 + 谐波) */
  sinad: number
  /** THD，dBc：20·log10(√ΣA_h² / A_1) */
  thd: number
  /** THD，% */
  thdPct: number
  /** SFDR，dBc（正数）：基波与最大一根杂散之比 */
  sfdr: number
  /** 最大杂散所在的频点 */
  spurBin: number
  /** 最大杂散若是谐波，给出次数；否则为 null（噪声或其它杂散） */
  spurHarmonic: number | null
  /** 有效位数：(SINAD + 20·log10(FS/A) − 1.76) / 6.02 */
  enob: number
  /** 理想 SNR（满量程正弦）：6.02·N + 1.76 */
  ideal: number
  /** 理想 SNR（本例 0.9 FS 输入）：ideal + 20·log10(0.9) */
  idealAtInput: number
  /** 噪底：各频点的平均幅度（dBFS，与频谱图同一口径） */
  noiseFloorDb: number
}

/**
 * 把 HD2 / HD3 的 dBc 目标换算成非线性多项式 w = v + a2·v² + a3·v³ 的系数（v = A·sin）。
 * 对基波的谐波比：HD2 ≈ a2·A/2，HD3 ≈ a3·A²/4（忽略 a3 对基波的压缩，即一阶近似）。
 */
export function nonlinearCoeffs(hd2Db: number, hd3Db: number): { a2: number; a3: number } {
  const a2 = hd2Db <= HD_MIN_DB ? 0 : (2 * 10 ** (hd2Db / 20)) / INPUT_AMP
  const a3 = hd3Db <= HD_MIN_DB ? 0 : (4 * 10 ** (hd3Db / 20)) / (INPUT_AMP * INPUT_AMP)
  return { a2, a3 }
}

/** 生成一段量化后的输出码（归一化到 ±FS）。纯函数：同样的 state 一定得到同样的数组 */
export function simulateCapture(state: DynamicState): Float64Array {
  const { a2, a3 } = nonlinearCoeffs(state.hd2Db, state.hd3Db)
  const lsb = 2 / 2 ** state.bits
  const sigma = state.noiseLsb * lsb
  const random = seededRandom(state.seed)
  const out = new Float64Array(N_POINTS)
  for (let n = 0; n < N_POINTS; n += 1) {
    const v = INPUT_AMP * Math.sin((2 * Math.PI * CYCLES * n) / N_POINTS)
    const w = v + a2 * v * v + a3 * v * v * v
    const y = w + sigma * gaussian(random)
    const clipped = Math.min(Math.max(y, -1), 1 - lsb)
    out[n] = Math.round(clipped / lsb) * lsb
  }
  return out
}

/** 第 order 次谐波所在的频点，折叠到 0 … N/2 */
export function harmonicBin(order: number): number {
  const raw = (order * CYCLES) % N_POINTS
  return raw > N_POINTS / 2 ? N_POINTS - raw : raw
}

/** 主瓣保护宽度（频点数）：相干采样下，Hann 只漏到 ±1 个频点，Blackman-Harris 只漏到 ±3 个频点 */
export function guardBins(window: WindowKind): number {
  return window === 'hann' ? 1 : 3
}

/** 等效噪声带宽（频点数）：N·Σw² / (Σw)²，用来把窗后的噪声功率换回真实噪声功率 */
export function enbwOf(window: WindowKind): number {
  const w = windowCoefficients(window, N_POINTS)
  let sum = 0
  let sumSq = 0
  for (let k = 0; k < N_POINTS; k += 1) {
    sum += w[k]
    sumSq += w[k] * w[k]
  }
  return (N_POINTS * sumSq) / (sum * sum)
}

function markBand(mask: Uint8Array, centre: number, guard: number): void {
  for (let k = centre - guard; k <= centre + guard; k += 1) {
    if (k >= 0 && k < mask.length) {
      mask[k] = 1
    }
  }
}

/** 从一次采样算出全部动态参数 */
export function analyze(state: DynamicState): DynamicResult {
  const x = simulateCapture(state)
  const amps = amplitudeSpectrum(x, state.window)
  const half = N_POINTS / 2
  const guard = guardBins(state.window)
  const enbw = enbwOf(state.window)

  const harmonics: Harmonic[] = []
  for (let order = 2; order <= HARMONIC_MAX; order += 1) {
    const bin = harmonicBin(order)
    harmonics.push({ order, bin, amp: amps[bin] })
  }

  // 信号占用的频点（基波与各次谐波，连同主瓣保护带）不计入噪声
  const signalMask = new Uint8Array(half)
  markBand(signalMask, CYCLES, guard)
  for (const h of harmonics) {
    markBand(signalMask, h.bin, guard)
  }

  let rawNoise = 0
  let spurAmp = 0
  let spurBin = 0
  for (let k = 1; k < half; k += 1) {
    if (signalMask[k] === 0) {
      rawNoise += (amps[k] * amps[k]) / 2
    }
    if (Math.abs(k - CYCLES) > guard && amps[k] > spurAmp) {
      spurAmp = amps[k]
      spurBin = k
    }
  }
  // 窗后每个频点的噪声功率被放大了 ENBW 倍，除以它得到真实的噪声功率
  const noisePow = rawNoise / enbw

  let spurHarmonic: number | null = null
  for (const h of harmonics) {
    if (Math.abs(spurBin - h.bin) <= guard) {
      spurHarmonic = h.order
    }
  }

  const fundAmp = amps[CYCLES]
  const fundPow = (fundAmp * fundAmp) / 2
  const harmPow = harmonics.reduce((acc, h) => acc + (h.amp * h.amp) / 2, 0)
  const harmSq = harmonics.reduce((acc, h) => acc + h.amp * h.amp, 0)
  const thdRatio = Math.sqrt(harmSq) / fundAmp
  const snr = 10 * Math.log10(fundPow / noisePow)
  const sinad = 10 * Math.log10(fundPow / (noisePow + harmPow))
  const ideal = 6.02 * state.bits + 1.76

  return {
    amps,
    harmonics,
    fundAmp,
    snr,
    sinad,
    thd: 20 * Math.log10(thdRatio),
    thdPct: thdRatio * 100,
    sfdr: 20 * Math.log10(fundAmp / spurAmp),
    spurBin,
    spurHarmonic,
    enob: (sinad + 20 * Math.log10(1 / INPUT_AMP) - 1.76) / 6.02,
    ideal,
    idealAtInput: ideal + 20 * Math.log10(INPUT_AMP),
    noiseFloorDb: 10 * Math.log10((2 * rawNoise) / half),
  }
}
