/**
 * 谐波与杂散的教学模型（RF-09）。
 * 假设：采样率 fs = 1024 MHz，记录 N = 1024 点（1 µs），频率分辨率 1 MHz，第 k 个 bin 就是 k MHz。
 *   基波 f0 = 100 MHz 正好是第 100 个 bin；2 次、3 次谐波落在 200、300 MHz 的整数 bin 上（相干采样），谱线不会漏到相邻 bin。
 *   杂散 137 MHz 不是基波的整数倍（示意时钟或混频产物）。
 * 时域：x[n] = sin(基波) + A2·sin(2·基波) + A3·sin(3·基波) + As·sin(137 MHz) + 白噪声（rms 1e-4，固定种子）。
 *   A2、A3、As 由 dBc 换算：A = 10^(dBc/20)，相对基波幅度 1。
 * 频谱：amplitudeSpectrum（Blackman–Harris 窗）得到单边幅度谱，dBc = toDb(amp_k, amp_基波)。
 * 频谱掩模：阶梯线，限值是教学取值，不对应任何规范；只检查 50 MHz 以上，0–50 MHz 视为基波附近，不在掩模内。
 */
import { amplitudeSpectrum, toDb } from '../ana/core/fft'
import { gaussian, seededRandom } from '../ana/core/rng'

export const FS_MHZ = 1024
export const N_POINTS = 1024
export const F0_MHZ = 100
export const SPUR_MHZ = 137
const NOISE_RMS = 1e-4
const SEED = 0x5eed

export type HarmState = {
  /** 2 次谐波相对基波的电平，dBc */
  h2: number
  /** 3 次谐波相对基波的电平，dBc */
  h3: number
  /** 137 MHz 非谐波杂散相对基波的电平，dBc */
  spur: number
}

export const DEFAULT_HARM: HarmState = { h2: -38, h3: -45, spur: -50 }

export type MaskStep = { fromMhz: number; toMhz: number; limitDbc: number }

/** 频谱掩模（教学取值）：阶梯线，每段频率范围允许的最大 dBc */
export const MASK: MaskStep[] = [
  { fromMhz: 50, toMhz: 150, limitDbc: -45 },
  { fromMhz: 150, toMhz: 250, limitDbc: -30 },
  { fromMhz: 250, toMhz: 400, limitDbc: -40 },
  { fromMhz: 400, toMhz: 512, limitDbc: -50 },
]

/** 某个频率处的掩模限值；0–50 MHz 不在掩模内，返回 null */
export function limitAt(freqMhz: number): number | null {
  for (let i = 0; i < MASK.length; i += 1) {
    const step = MASK[i]
    if (freqMhz >= step.fromMhz && freqMhz < step.toMhz) {
      return step.limitDbc
    }
  }
  return null
}

/** 生成时域波形并算出单边频谱，返回每个 bin（即每 MHz）的 dBc */
export function harmSpectrum(state: HarmState): Float64Array {
  const random = seededRandom(SEED)
  const x = new Float64Array(N_POINTS)
  const a2 = 10 ** (state.h2 / 20)
  const a3 = 10 ** (state.h3 / 20)
  const aSpur = 10 ** (state.spur / 20)
  for (let n = 0; n < N_POINTS; n += 1) {
    const phase = (2 * Math.PI * n) / N_POINTS
    x[n] =
      Math.sin(F0_MHZ * phase) +
      a2 * Math.sin(2 * F0_MHZ * phase) +
      a3 * Math.sin(3 * F0_MHZ * phase) +
      aSpur * Math.sin(SPUR_MHZ * phase) +
      NOISE_RMS * gaussian(random)
  }
  const amp = amplitudeSpectrum(x, 'blackman-harris')
  const ref = amp[F0_MHZ]
  const dbc = new Float64Array(amp.length)
  for (let k = 0; k < amp.length; k += 1) {
    dbc[k] = toDb(amp[k], ref)
  }
  return dbc
}

export type CompKey = 'f0' | 'h2' | 'h3' | 'spur'

export type Component = {
  key: CompKey
  freqMhz: number
  /** 测得的 dBc（基波为 0） */
  dbc: number
  /** 掩模限值，dBc；基波与不在掩模内的频率为 null */
  limitDbc: number | null
  /** 余量 = 限值 − 测量值，dB；正数为合格，负数为超限 */
  margin: number | null
  pass: boolean
}

export type HarmAnalysis = {
  dbc: Float64Array
  comps: Record<CompKey, Component>
  pass: boolean
}

export function analyseHarm(state: HarmState): HarmAnalysis {
  const dbc = harmSpectrum(state)
  const build = (key: CompKey, freqMhz: number): Component => {
    const value = dbc[freqMhz]
    const limitDbc = key === 'f0' ? null : limitAt(freqMhz)
    const margin = limitDbc === null ? null : limitDbc - value
    return { key, freqMhz, dbc: value, limitDbc, margin, pass: margin === null || margin >= 0 }
  }
  const comps: Record<CompKey, Component> = {
    f0: build('f0', F0_MHZ),
    h2: build('h2', 2 * F0_MHZ),
    h3: build('h3', 3 * F0_MHZ),
    spur: build('spur', SPUR_MHZ),
  }
  const pass = comps.h2.pass && comps.h3.pass && comps.spur.pass
  return { dbc, comps, pass }
}
