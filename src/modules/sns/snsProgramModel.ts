/**
 * SNS-09 VDUT-CIS1 量产程序。1000 颗，种子固定，不用 Math.random，不逐颗画帧。
 * 分档与规格表一致：电源/连续性 Bin 2，接口 Bin 3，暗场 Bin 4，
 * 亮场/PRNU/行缺陷 Bin 5，OTP Bin 6，其余 Bin 1 并给 A/B/C。
 */
import { VDUT_CIS1 } from '../../data/virtual-duts/vdut-sns'
import { gaussian, mulberry32, prnuMeasured } from './core/sensor'

export const N_DICE = 1000
export const PROG_SEED = 20261103
export const FRAME_TIME_S = 0.04
export const SETTLE_S = 0.3
export const TRANSFER_S = 0.4
export const COLOR_FRAMES = 3
export const GRADE_A_SPEC = 5
export const PRNU_TRUE = VDUT_CIS1.prnu
export const SIGMA_OVER_MU = 0.02
export const PRNU_FAIL = 0.03

export const STEP_IDS = ['power', 'iface', 'dark', 'bright', 'color', 'otp'] as const
export type StepId = (typeof STEP_IDS)[number]

export const REQUIRED_STEPS: StepId[] = ['power', 'iface', 'dark', 'bright', 'otp']

export const STEP_BIN: Record<StepId, number> = {
  power: 2,
  iface: 3,
  dark: 4,
  bright: 5,
  color: 5,
  otp: 6,
}

export type ProgramState = {
  enabled: Record<StepId, boolean>
  darkFrames: number
  brightFrames: number
  hotMax: number
  gradeA: number
  gradeB: number
  density: number
  clusterProb: number
  budgetS: number
}

export const DEFAULT_PROGRAM: ProgramState = {
  enabled: { power: true, iface: true, dark: true, bright: true, color: true, otp: true },
  darkFrames: 8,
  brightFrames: 8,
  hotMax: 8,
  gradeA: 12,
  gradeB: 20,
  density: 10,
  clusterProb: 0.15,
  budgetS: 1.1,
}

export type Grade = 'A' | 'B' | 'C'

export type DieRow = { id: number; bin: number; grade: Grade | '' }

export type ProgramAnalysis = {
  dice: DieRow[]
  bins: Record<number, number>
  grades: Record<Grade, number>
  timeS: number
  uph: number
  frames: number
  prnuMeas: number
  temporal: number
  withinBudget: boolean
  requiredOn: boolean
}

function poissonDraw(rand: () => number, mean: number): number {
  if (mean <= 0) return 0
  if (mean > 40) return Math.max(0, Math.round(mean + Math.sqrt(mean) * gaussian(rand)))
  const limit = Math.exp(-mean)
  let k = 0
  let p = 1
  do {
    k += 1
    p *= rand()
  } while (p > limit && k < 400)
  return k - 1
}

export function frameCount(s: ProgramState): number {
  let n = 0
  if (s.enabled.dark) n += s.darkFrames
  if (s.enabled.bright) n += s.brightFrames
  if (s.enabled.color) n += COLOR_FRAMES
  return n
}

/** 时间 = 帧数 × 帧时间 + 光源稳定 + 传输 */
export function testTimeS(s: ProgramState): number {
  return frameCount(s) * FRAME_TIME_S + SETTLE_S + TRANSFER_S
}

export function gradeLimits(s: ProgramState): { a: number; b: number } {
  return { a: s.gradeA, b: Math.max(s.gradeB, s.gradeA) }
}

export function analyseProgram(s: ProgramState): ProgramAnalysis {
  const bins: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const grades: Record<Grade, number> = { A: 0, B: 0, C: 0 }
  const dice: DieRow[] = []
  const limits = gradeLimits(s)
  const temporal = SIGMA_OVER_MU / Math.sqrt(Math.max(s.brightFrames, 1))
  for (let i = 0; i < N_DICE; i += 1) {
    const rand = mulberry32((PROG_SEED + i * 997) >>> 0)
    const powerFail = rand() < 0.02
    const ifaceFail = rand() < 0.015
    const hot = poissonDraw(rand, s.density * 0.45)
    const defects = poissonDraw(rand, s.density)
    const cluster = rand() < s.clusterProb
    const prnuDraw = Math.max(0, PRNU_TRUE + temporal * gaussian(rand))
    const brightFail = prnuDraw > PRNU_FAIL
    const colorFail = rand() < 0.01
    const otpFail = rand() < 0.012
    let bin = 1
    let grade: Grade | '' = ''
    if (s.enabled.power && powerFail) bin = 2
    else if (s.enabled.iface && ifaceFail) bin = 3
    else if (s.enabled.dark && hot > s.hotMax) bin = 4
    else if (s.enabled.bright && brightFail) bin = 5
    else if (s.enabled.color && colorFail) bin = 5
    else if (s.enabled.otp && otpFail) bin = 6
    else {
      bin = 1
      if (defects <= limits.a && !cluster) grade = 'A'
      else if (defects <= limits.b) grade = 'B'
      else grade = 'C'
      grades[grade] += 1
    }
    bins[bin] += 1
    dice.push({ id: i + 1, bin, grade })
  }
  const timeS = testTimeS(s)
  const requiredOn = REQUIRED_STEPS.every((id) => s.enabled[id])
  return {
    dice,
    bins,
    grades,
    timeS,
    uph: timeS > 0 ? 3600 / timeS : 0,
    frames: frameCount(s),
    prnuMeas: prnuMeasured(PRNU_TRUE, SIGMA_OVER_MU, s.brightFrames),
    temporal,
    withinBudget: timeS <= s.budgetS + 1e-9,
    requiredOn,
  }
}

/** 文本摘要，行内只有零件号、Bin 和等级，方便和 {@genStdf} 的思路对照 */
export function exportSummary(dice: DieRow[]): string {
  const lines = ['VDUT-CIS1', 'PART BIN GRADE']
  for (const die of dice) {
    const id = String(die.id).padStart(4, '0')
    lines.push(`PART ${id} BIN ${die.bin} GRADE ${die.grade === '' ? '-' : die.grade}`)
  }
  return lines.join('\n')
}
