/**
 * 综合课「高速接口测试」的仿真模型（HS-08）：虚构的串行器件 VDUT-SER1，所有数值都是本站的教学取值。
 *
 * 一颗样片的参数：
 * - skewPs：数据眼中心相对采样时钟的偏移（ps），样片不同，最佳采样相位就不同；
 * - djPp、rjRms：确定性抖动（峰峰值）与随机抖动（rms），按双狄拉克模型估计；
 * - eyeMv：中心处的眼高（噪声为零时），noiseMv：电压噪声的 rms。
 *
 * 误码率（每个采样点）= 时序项 + 电压项：
 *   时序项 = ½ · [ Q((d − DJ/2) / RJ) + Q((UI − d − DJ/2) / RJ) ]，d 为采样点到左边沿的距离（ps）；
 *   电压项 = Q((eyeMv / 2) / noiseMv)。
 * 在中心处，时序项的解析形式与 hs/core/jitter.ts 的 tjAtBer 一致：眼宽(BER) = UI − TJ(BER)，TJ = DJ + 2·Q·RJ。
 *
 * 全部是纯函数：没有随机数、没有 Date.now，同一样片每次结果都一样。
 */

import { qFunction, qOfBer, tjAtBer } from './core/jitter'

/** 虚构器件名（只用于显示与 CSV 文件名） */
export const DEVICE_NAME = 'VDUT-SER1'

/** 教学速率与 UI */
export const RATE_GBPS = 10
export const UI_PS = 1000 / RATE_GBPS

/** 本站的教学规格（不是任何标准的数值）：BER 限值 1e-12 下，眼宽不小于 0.40 UI，眼高不小于 120 mV */
export const BER_LIMIT = 1e-12
export const SPEC_EW_UI = 0.4
export const SPEC_EH_MV = 120

/** 时序扫描：从 0 到 1 UI，每 2.5 ps 一个采样相位，共 40 点 */
export const SWEEP_STEP_PS = 2.5
export const SWEEP_POINTS = Math.round(UI_PS / SWEEP_STEP_PS)

export type SampleId = 'typ' | 'jitter' | 'noise'

/** 样片的显示顺序即数组顺序；默认取 [0] */
export const SAMPLE_IDS: SampleId[] = ['typ', 'jitter', 'noise']

export type SampleParams = {
  skewPs: number
  djPp: number
  rjRms: number
  eyeMv: number
  noiseMv: number
}

export const SAMPLES: Record<SampleId, SampleParams> = {
  typ: { skewPs: 12, djPp: 18, rjRms: 2.5, eyeMv: 260, noiseMv: 6 },
  jitter: { skewPs: 12, djPp: 30, rjRms: 3.5, eyeMv: 260, noiseMv: 6 },
  noise: { skewPs: 30, djPp: 18, rjRms: 2.5, eyeMv: 200, noiseMv: 12 },
}

export const DEFAULT_SAMPLE: SampleId = SAMPLE_IDS[0]

function wrapUi(ps: number): number {
  return ((ps % UI_PS) + UI_PS) % UI_PS
}

/** 采样点 phasePs 处的时序误码率 */
export function timingBer(phasePs: number, p: SampleParams): number {
  const d = wrapUi(phasePs - p.skewPs)
  const left = qFunction((d - p.djPp / 2) / p.rjRms)
  const right = qFunction((UI_PS - d - p.djPp / 2) / p.rjRms)
  return 0.5 * (left + right)
}

/** 采样点 phasePs 处的总误码率：时序项加上电压项（与相位无关） */
export function berAt(phasePs: number, p: SampleParams): number {
  return timingBer(phasePs, p) + qFunction(p.eyeMv / 2 / p.noiseMv)
}

/** BER = ber 时的眼宽（UI）与眼高（mV），用双狄拉克 TJ 与噪声 rms 解析求出 */
export function eyeWidthUi(ber: number, p: SampleParams): number {
  return (UI_PS - tjAtBer(p.djPp, p.rjRms, ber)) / UI_PS
}

export function eyeHeightMv(ber: number, p: SampleParams): number {
  return p.eyeMv - 2 * qOfBer(ber) * p.noiseMv
}

export type SweepPoint = { phasePs: number; ber: number }

/** 时序扫描：每个采样相位上的 BER */
export function timingSweep(p: SampleParams): SweepPoint[] {
  const points: SweepPoint[] = []
  for (let k = 0; k < SWEEP_POINTS; k += 1) {
    const phasePs = k * SWEEP_STEP_PS
    points.push({ phasePs, ber: berAt(phasePs, p) })
  }
  return points
}

export type RunReport = {
  points: SweepPoint[]
  bestPhasePs: number
  berAtBest: number
  ewUi: number
  ehMv: number
  checks: { ber: boolean; ew: boolean; eh: boolean; overall: boolean }
}

/**
 * 一键运行：扫时序 → 取最佳采样相位 → 眼宽、眼高（BER 1e-12）→ 与规格比较。
 * 最佳相位取时序项最小的扫描点（即数据眼的中心）。不用总 BER 来选：噪声大时电压项把浴盆底抬平，
 * 总 BER 在多个相位上相等，选不出唯一的点。
 */
export function runAll(sample: SampleId): RunReport {
  const p = SAMPLES[sample]
  const points = timingSweep(p)
  let best = points[0]
  let bestTiming = timingBer(best.phasePs, p)
  for (const point of points) {
    const timing = timingBer(point.phasePs, p)
    if (timing < bestTiming) {
      best = point
      bestTiming = timing
    }
  }
  const berAtBest = berAt(best.phasePs, p)
  const ewUi = eyeWidthUi(BER_LIMIT, p)
  const ehMv = eyeHeightMv(BER_LIMIT, p)
  const ber = berAtBest <= BER_LIMIT
  const ew = ewUi >= SPEC_EW_UI
  const eh = ehMv >= SPEC_EH_MV
  return {
    points,
    bestPhasePs: best.phasePs,
    berAtBest,
    ewUi,
    ehMv,
    checks: { ber, ew, eh, overall: ber && ew && eh },
  }
}

/** 直接计数验证 BER ≤ 1e-12 所需的时间（s）：按 95% 置信度取 3 ÷ BER 个比特，每比特 1 UI */
export function countingSeconds(ber: number): number {
  return (3 / ber) * (UI_PS * 1e-12)
}

/** 导出 CSV（纯函数）：列为 item,value,unit,limit,result；每个扫描点一行，后面是汇总行 */
export function buildCsv(report: RunReport): string {
  const header = 'item,value,unit,limit,result'
  const lines: string[] = [header]
  for (const point of report.points) {
    const result = point.ber <= BER_LIMIT ? 'PASS' : 'FAIL'
    lines.push(`bathtub_${point.phasePs.toFixed(1)}ps,${point.ber.toExponential(3)},BER,${BER_LIMIT.toExponential(0)},${result}`)
  }
  lines.push(`best_phase,${report.bestPhasePs.toFixed(1)},ps,,`)
  lines.push(`ber_at_best_phase,${report.berAtBest.toExponential(3)},BER,${BER_LIMIT.toExponential(0)},${report.checks.ber ? 'PASS' : 'FAIL'}`)
  lines.push(`eye_width_at_1e-12,${report.ewUi.toFixed(3)},UI,${SPEC_EW_UI.toFixed(2)},${report.checks.ew ? 'PASS' : 'FAIL'}`)
  lines.push(`eye_height_at_1e-12,${report.ehMv.toFixed(1)},mV,${SPEC_EH_MV},${report.checks.eh ? 'PASS' : 'FAIL'}`)
  lines.push(`overall,,,,${report.checks.overall ? 'PASS' : 'FAIL'}`)
  return lines.join('\n')
}
