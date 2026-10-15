import { type LText } from '../../../i18n/locale'
import { TEMPCO, type DiodeId, type LoadId, type Part, type TopologyId } from './mosSelectParts'

/** 把中英文片段分别拼起来；字符串和数字两种语言相同 */
export const cat = (...parts: Array<LText | string | number>): LText => ({
  zh: parts.map((p) => (typeof p === 'object' ? p.zh : String(p))).join(''),
  en: parts.map((p) => (typeof p === 'object' ? (p.en ?? p.zh) : String(p))).join(''),
})

export const f1 = (x: number) => x.toFixed(1)
export const fP = (x: number) => (x < 1 ? x.toFixed(2) : x.toFixed(1))

/**
 * Tj = Ta + P × RθJA，而 P = I² × Rds25 × (1 + α (Tj − 25))，Tj 和 Rds 互相影响。
 * 联立后有闭式解；k = P25 × θ × α ≥ 1 时没有稳定解（热失控）。
 */
export function solveTj(i: number, r25mohm: number, theta: number, ta: number) {
  const p25 = (i * i * r25mohm) / 1000
  const k = p25 * theta * TEMPCO
  if (k >= 1) {
    return { runaway: true, tj: Infinity, rHot: Infinity, p: Infinity }
  }
  const tj = (ta + p25 * theta * (1 - 25 * TEMPCO)) / (1 - k)
  const rHot = r25mohm * (1 + TEMPCO * (tj - 25))
  return { runaway: false, tj, rHot, p: (i * i * rHot) / 1000 }
}

export type Thermal = ReturnType<typeof solveTj>

const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2, 10]

export function e12Up(x: number) {
  const decade = Math.pow(10, Math.floor(Math.log10(x)))
  const m = x / decade
  const hit = E12.find((v) => v >= m * (1 - 1e-9)) ?? 10
  return Math.round(hit * decade * 1000) / 1000
}

export type CheckState = 'pass' | 'fail' | 'skip'
export type Check = { id: string; label: LText; value: string; state: CheckState; reason: LText }

export type Input = { topology: TopologyId; part: Part; load: LoadId; diode: DiodeId; current: number; ambient: number }

export const mark = (ok: boolean) => (ok ? '✓' : '✗')
