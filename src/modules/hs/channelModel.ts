/**
 * 传输与信号完整性（HS-02）的教学模型。
 * 发送端：PRBS7 NRZ，电平 ±1（归一化）。可选预加重 pre-emphasis：
 *   e[n] = (x[n] − k·x[n−1]) / (1 + k)，k = PE_K。跳变位保持满幅 1，连续相同的位被压低到 (1−k)/(1+k)。
 * 传输线：特性阻抗 Z0 = 50 Ω，单程时延 TD = 100 ps（示意值）。
 * 反射：终端 ZL 的反射系数 Γ_L = reflectionCoeff(ZL, Z0)（实数，因为 ZL 为纯电阻）；
 *   驱动端内阻 ZS = 25 Ω（示意值，取得比 Z0 小，让回声看得见），Γ_S = (ZS − Z0) / (ZS + Z0)。
 *   用弹跳图（lattice）得到接收端的第 k 次到达：(1 + Γ_L)·(Γ_L·Γ_S)^k·x(t − (2k+1)·TD)，k = 0, 1, 2。
 *   归一化：ZL = Z0 时只有 k = 0 项、系数为 1，即无反射时接收幅度为 1。
 *   稳态（直流）电平 = (1 + Γ_L) / (1 − Γ_L·Γ_S)；ZL 偏离 Z0 时，电平会被抬高或压低。
 * 损耗：一阶低通，BW 为 −3 dB 带宽，τ = 1000 / (2π·BW) ps。奈奎斯特频率 f_N = 速率 / 2，损耗 = 10·log10(1 + (f_N / BW)²) dB。
 * 眼高：中心采样点上，1 的最小值减去 0 的最大值；眼张开度 = 眼高 / 远端稳态电平，
 * 这样 ZL 造成的电平变化被扣除，剩下的只有码间干扰与回声的影响；理想无损无反射时为 2。
 */

import { prbsBits } from './core/prbs'
import { reflectionCoeff, returnLossDb } from '../rf/core/units'

export type PeMode = 'off' | 'on'

/** 速率选项，显示顺序即数组顺序；默认取 [0] */
export const RATES: number[] = [5, 10, 16]
/** 预加重开关：显示顺序即数组顺序；默认取 [0]（关） */
export const PE_MODES: PeMode[] = ['off', 'on']

export type ChannelState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 通道 −3 dB 带宽，GHz */
  bw: number
  /** 终端（接收端）负载阻抗，Ω */
  zl: number
  /** 预加重开关 */
  pe: PeMode
}

export const Z0 = 50
/** 驱动器内阻（示意值） */
export const ZS = 25
/** 单程时延（示意值），ps */
export const TD_PS = 100
/** 预加重系数 k */
export const PE_K = 0.3
/** 每个 UI 的采样点数 */
export const SPU = 32
/** 眼张开度判据（教学用，非标准值）：相对远端满幅的中心眼高 ≥ 0.6，理想值为 2 */
export const EYE_PASS = 0.6
/** 波形窗口长度，UI */
export const VIEW_UI = 12

const NBITS = 3 * 127
/** 跳过第一个完整 PRBS 周期，让通道记忆建立起来 */
const SKIP = 127
const ECHO_TERMS = 3

export const DEFAULT_CHANNEL: ChannelState = { rate: RATES[0], bw: 8, zl: Z0, pe: PE_MODES[0] }

export type ChannelAnalysis = {
  /** 单位间隔，ps */
  ui: number
  /** 奈奎斯特频率 f_N = 速率 / 2，GHz */
  nyquistGhz: number
  /** f_N 处的通道损耗，dB */
  lossDb: number
  /** |Γ_L| */
  gammaMag: number
  /** 回波损耗 −20·log10|Γ_L|，dB；完全匹配时为 Infinity */
  returnLoss: number
  /** 远端稳态电平，ZL = Z0 时为 1 */
  levelRel: number
  /** 中心眼高（归一化，ZL = Z0 且无损时理想为 2） */
  eyeHeight: number
  /** 相对远端满幅的眼张开度 = 眼高 / 远端稳态电平，理想为 2 */
  eyeOpen: number
  pass: boolean
  /** 接收端波形（归一化），VIEW_UI 个 UI */
  view: Float64Array
  /** 理想 NRZ（不加预加重、无损），与 view 同一时间轴 */
  ideal: Float64Array
}

export function analyseChannel(state: ChannelState): ChannelAnalysis {
  const ui = 1000 / state.rate
  const dt = ui / SPU
  const nyquistGhz = state.rate / 2
  const lossDb = 10 * Math.log10(1 + (nyquistGhz / state.bw) ** 2)
  const tau = 1000 / (2 * Math.PI * state.bw)
  const alpha = 1 - Math.exp(-dt / tau)

  /** ZL 为纯电阻，Γ 是实数；|Γ| 即绝对值 */
  const gammaL = reflectionCoeff({ re: state.zl, im: 0 }, Z0).re
  const gammaS = (ZS - Z0) / (ZS + Z0)
  const gammaMag = Math.abs(gammaL)
  const levelRel = (1 + gammaL) / (1 - gammaL * gammaS)

  const bits = prbsBits(7, NBITS)
  const sign = (bit: number) => (bit === 1 ? 1 : -1)
  /** 发送端每一位的电平（预加重后） */
  const tx = new Float64Array(NBITS)
  for (let n = 0; n < NBITS; n += 1) {
    const x = sign(bits[n])
    if (state.pe === 'on') {
      const prev = n === 0 ? x : sign(bits[n - 1])
      tx[n] = (x - PE_K * prev) / (1 + PE_K)
    } else {
      tx[n] = x
    }
  }

  /** 弹跳图的各项：延迟（采样点）与系数 */
  const delays: number[] = []
  const coeffs: number[] = []
  for (let k = 0; k < ECHO_TERMS; k += 1) {
    delays.push(Math.round(((2 * k + 1) * TD_PS) / dt))
    coeffs.push((1 + gammaL) * (gammaL * gammaS) ** k)
  }

  const total = NBITS * SPU
  const y = new Float64Array(total)
  let prevOut = 0
  for (let i = 0; i < total; i += 1) {
    let r = 0
    for (let k = 0; k < ECHO_TERMS; k += 1) {
      const j = i - delays[k]
      const bit = j < 0 ? 0 : Math.floor(j / SPU)
      r += coeffs[k] * tx[bit]
    }
    prevOut = i === 0 ? r : prevOut + alpha * (r - prevOut)
    y[i] = prevOut
  }

  /** 第 m 位在接收端的中心采样点：发送位置 + 第一次到达的时延 */
  const centreOf = (m: number) => m * SPU + SPU / 2 + delays[0]
  let minOne = Infinity
  let maxZero = -Infinity
  for (let m = SKIP; m < NBITS; m += 1) {
    const i = centreOf(m)
    if (i >= total) {
      break
    }
    const v = y[i]
    if (bits[m] === 1) {
      if (v < minOne) {
        minOne = v
      }
    } else if (v > maxZero) {
      maxZero = v
    }
  }
  const eyeHeight = minOne - maxZero
  /** 相对远端满幅的眼张开度：去掉 ZL 造成的电平变化，只剩码间干扰与回声的影响 */
  const eyeOpen = eyeHeight / levelRel

  const viewCount = VIEW_UI * SPU
  const view = new Float64Array(viewCount)
  const ideal = new Float64Array(viewCount)
  for (let j = 0; j < viewCount; j += 1) {
    view[j] = y[SKIP * SPU + j]
    /** 理想方波也按第一次到达的时延平移，和接收波形同一时间轴 */
    ideal[j] = sign(bits[SKIP + Math.floor((j - delays[0]) / SPU)])
  }

  return {
    ui,
    nyquistGhz,
    lossDb,
    gammaMag,
    returnLoss: returnLossDb(gammaMag),
    levelRel,
    eyeHeight,
    eyeOpen,
    pass: eyeOpen >= EYE_PASS,
    view,
    ideal,
  }
}
