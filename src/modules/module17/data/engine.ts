export type TimingInput = {
  period: number
  drive: number
  delay: number
  strobe: number
}

export type TimingReason = 'pass' | 'early' | 'late' | 'before-drive' | 'slow'

export function settleAt(drive: number, delay: number) {
  return drive + delay
}

/** 判断一拍的 Strobe 位置。所有时间都是相对本周期起点 */
export function judgeTiming(p: TimingInput): { pass: boolean; reason: TimingReason } {
  if (p.strobe >= p.period) return { pass: false, reason: 'late' }
  if (p.drive + p.delay >= p.period) return { pass: false, reason: 'slow' }
  if (p.strobe < p.drive) return { pass: false, reason: 'before-drive' }
  if (p.strobe < p.drive + p.delay) return { pass: false, reason: 'early' }
  return { pass: true, reason: 'pass' }
}

/** DUT 在 3.3 V 时漏电 3.2 μA，等效成一只漏电阻 */
export const LEAK_OHM = 3.3 / 3.2e-6

export function leakCurrentUa(forceV: number) {
  return (forceV / LEAK_OHM) * 1e6
}

export function judgeLeak(forceV: number, limitUa: number) {
  const meas = leakCurrentUa(forceV)
  return { meas, pass: meas <= limitUa + 1e-9 }
}
