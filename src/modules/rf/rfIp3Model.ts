/**
 * RF-07 双音测试与 IIP3 / OIP3 的仿真模型（多项式非线性，教学模型，不对应任何具体器件）。
 * 器件：y = a1·x + a3·x³，x 为输入电压（峰值，V），50 Ω 系统。
 *   - 小信号增益 GAIN_DB = 15 dB（教学设定），a1 = 10^(G/20)。
 *   - 由器件的 IIP3 设定 a3：单音时三阶项与基波相等的输入峰值幅度 A_IIP3 满足 (3/4)·|a3|·A² = a1，
 *     所以 a3 = −4·a1 / (3·A_IIP3²)，负号表示压缩型。
 * 双音输入：x(t) = A·cos(2π·f1·t) + A·cos(2π·f2·t)，两音峰值相同。展开 x³ 后：
 *   - 基波（f1、f2）的分量以及三阶交调 IM3（2f1−f2、2f2−f1）的峰值幅度都是 (3/4)·|a3|·A³ 量级，
 *     在本模型里由 FFT 读出，而不是由公式直接给出；
 *   - 三次谐波与其它三阶和差项也在同一组谱线上。
 * 数值方法：采样率 FS = 1024 MHz、N = 1024 点，谱线间隔 1 MHz，所有频率都是整数 MHz，
 *   恰好落在谱线上，矩形窗无泄漏（相干采样）。读数用 core/fft.ts 的 amplitudeSpectrum。
 * 功率：峰值幅度 A 的正弦在 50 Ω 上的功率 P = A²/(2·50) W，即 P(mW) = 10·A²；dBm = mwToDbm(P)。
 *   所有功率都按 50 Ω 负载、以 1 mW 为参考计算，因此 dB 差值与参考一致。
 * 读数：
 *   - P_fund：f1 处的基波功率（dBm，每音）；
 *   - ΔIM3 = P_fund − P_IM3（dB），取 2f1−f2 与 2f2−f1 两侧中较小（较差）的一侧；
 *   - IIP3 = Pin + ΔIM3/2，OIP3 = P_out + ΔIM3/2。
 *     假设：基波斜率 1、IM3 斜率 3（小信号、远离压缩）。当回退不够时，基波本身已被压缩，读数会偏离设定值。
 * 谱线重叠检查：若某个 IM3 或谐波与另一根谱线落在同一 bin（例如 f1 = 2·f2 时 2f1−f2 = 3f2），读数不可靠。
 */

import { amplitudeSpectrum } from '../ana/core/fft'
import { dbmToMw, mwToDbm } from './core/units'

export const FS_MHZ = 1024
export const N_POINTS = 1024
/** 谱线间隔 = FS / N = 1 MHz，所以频率的数值就是谱线编号 */
export const BIN_MHZ = FS_MHZ / N_POINTS
export const R_LOAD = 50
/** 小信号增益（dB），教学设定值 */
export const GAIN_DB = 15

export const TONE_MIN_MHZ = 60
export const TONE_MAX_MHZ = 140
export const F1_DEFAULT = 100
export const F2_DEFAULT = 112
export const PIN_MIN = -30
export const PIN_MAX = 0
export const PIN_DEFAULT = -15
export const IIP3_MIN = 5
export const IIP3_MAX = 20
export const IIP3_DEFAULT = 10
/** 读出的 IIP3 与设定相差不超过它才 PASS（dB） */
export const IIP3_TOL_DB = 0.5

export type Ip3State = {
  /** 两音频率，MHz（整数，即谱线编号） */
  f1: number
  f2: number
  /** 每音的输入功率，dBm */
  pin: number
  /** 器件的 IIP3 设定，dBm */
  iip3: number
}

export const DEFAULT_IP3: Ip3State = { f1: F1_DEFAULT, f2: F2_DEFAULT, pin: PIN_DEFAULT, iip3: IIP3_DEFAULT }

/** 幅度（峰值 V）→ 功率（dBm，50 Ω）：P(mW) = 10·A² */
export function ampToDbm(amp: number): number {
  return mwToDbm(Math.max(10 * amp * amp, 1e-30))
}

export type Ip3Analysis = {
  /** 单边幅度谱，长度 N/2，第 k 根谱线为 k MHz */
  spectrum: Float64Array
  /** 读数所在的谱线编号 */
  bins: { f1: number; f2: number; imLow: number; imHigh: number }
  /** 谱线重叠或落在 DC / 越界：读数不可用 */
  clash: boolean
  /** 两音的基波功率（dBm，每音） */
  pF1: number
  pF2: number
  /** IM3 两侧的功率（dBm） */
  pImLow: number
  pImHigh: number
  /** ΔIM3 = 基波 − IM3（dB），取较差的一侧 */
  dIm3: number
  /** 从仿真读出的 IIP3 / OIP3（dBm） */
  iip3Read: number
  oip3Read: number
  /** 器件设定：IIP3，以及小信号 OIP3 = IIP3 + G */
  iip3Set: number
  oip3Set: number
  /** 读出的 IIP3 减设定值（dB） */
  err: number
  /** 回退 = IIP3 − Pin（dB） */
  backoffDb: number
  /** 测得的增益 = 基波输出 − 输入（dB） */
  gainMeasDb: number
  pass: boolean
}

/** 运行一次双音仿真并读出 IIP3 / OIP3 */
export function simulateIp3(state: Ip3State): Ip3Analysis {
  const a1 = 10 ** (GAIN_DB / 20)
  /** A² = 10·P(mW)：峰值幅度与功率（50 Ω）的关系 */
  const aIip3 = Math.sqrt(dbmToMw(state.iip3) / 10)
  const a3 = (-4 * a1) / (3 * aIip3 * aIip3)
  const aIn = Math.sqrt(dbmToMw(state.pin) / 10)

  const y = new Float64Array(N_POINTS)
  for (let n = 0; n < N_POINTS; n += 1) {
    const v = aIn * (Math.cos((2 * Math.PI * state.f1 * n) / FS_MHZ) + Math.cos((2 * Math.PI * state.f2 * n) / FS_MHZ))
    y[n] = a1 * v + a3 * v * v * v
  }
  const spectrum = amplitudeSpectrum(y, 'rect')

  const { f1, f2 } = state
  const imLow = Math.abs(2 * f1 - f2)
  const imHigh = Math.abs(2 * f2 - f1)
  const lines = [f1, f2, imLow, imHigh, 3 * f1, 3 * f2, 2 * f1 + f2, f1 + 2 * f2]
  const clash = new Set(lines).size !== lines.length || lines.some((k) => k === 0 || k >= N_POINTS / 2)

  const pF1 = ampToDbm(spectrum[f1])
  const pF2 = ampToDbm(spectrum[f2])
  const pImLow = ampToDbm(spectrum[imLow])
  const pImHigh = ampToDbm(spectrum[imHigh])
  const dIm3 = Math.min(pF1 - pImLow, pF1 - pImHigh)
  const iip3Read = state.pin + dIm3 / 2
  const oip3Read = pF1 + dIm3 / 2
  const err = iip3Read - state.iip3
  return {
    spectrum,
    bins: { f1, f2, imLow, imHigh },
    clash,
    pF1,
    pF2,
    pImLow,
    pImHigh,
    dIm3,
    iip3Read,
    oip3Read,
    iip3Set: state.iip3,
    oip3Set: state.iip3 + GAIN_DB,
    err,
    backoffDb: state.iip3 - state.pin,
    gainMeasDb: pF1 - state.pin,
    pass: !clash && Math.abs(err) <= IIP3_TOL_DB,
  }
}
