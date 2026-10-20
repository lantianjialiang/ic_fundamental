/**
 * MEM-13 综合：存储器测试的教学模型（纯函数，不访问 DOM）。
 *
 * 虚拟器件（只用本项目定义的型号 VDUT-SRAM1 / VDUT-DRAM1，数值都是教学取值）：
 *   - 8×8 = 64 个单元；缺陷由器件编号的种子生成（seededRandom），同一编号每次得到同一颗器件
 *   - 功能缺陷：SAF、TF、CFIN / CFID（耦合只发生在物理相邻的单元之间）、AF（地址译码错误）
 *   - 时序：每颗器件有访问时间 tAcc（ns），少数器件偏慢
 *   - DRAM：每个单元有保持时间 retentionMs。多数单元远长于规格的 64 ms；少数漏电单元很短
 *
 * 测试流程（按顺序执行，第一个 Fail 即停，并由那一步决定 Bin）：
 *   1) 上电与时序检查：tAcc ≤ 测试周期 − 建立余量（阈值比较）→ 不过判 时序失败
 *   2) 功能测试：March C−（runMarch，memory 课的算法引擎）→ 不过判 功能失败
 *   3) 保持时间测试（仅 DRAM）：写 1、等待 pauseMs、读回；保持时间短于 pauseMs 的单元读出 0 → 保持失败
 *
 * 测试时间 = 已执行步骤的操作数 × T_OP_US（教学取值）+ 保持等待时间。
 * 停在第一个 Fail 的器件，后面的步骤不再计时，所以平均时间会比“全测”短。
 */
import { gaussian, seededRandom } from '../ana/core/rng'
import type { Fault } from './core/array'
import { type RunResult } from './core/array'
import { MARCH_C_MINUS, opsPerCell, runMarch } from './core/march'

export const SIZE = 64
/** 阵列一行（或一列）的单元数：SIZE = SIDE × SIDE */
export const SIDE = 8
/** 每次操作的时间（µs），教学取值：100 ns，含 ATE 的开销 */
export const T_OP_US = 0.1
/** 第 1 步（时序检查）用的操作数，教学取值 */
export const TIMING_OPS = 16
/** 建立余量（ns）：tAcc 必须不超过 周期 − 建立余量 */
export const T_SU_NS = 2
/** DRAM 保持时间规格（ms）：教学取值，与常见的 64 ms 刷新周期一致 */
export const SPEC_RET_MS = 64
export const BATCH = 100

export type DevKind = 'sram' | 'dram'
export const DEV_KINDS: DevKind[] = ['sram', 'dram']
export const DEV_NAME: Record<DevKind, string> = { sram: 'VDUT-SRAM1', dram: 'VDUT-DRAM1' }

export type CycleId = '100' | '125' | '80'
export const CYCLE_IDS: CycleId[] = ['100', '125', '80']
/** 测试周期（ns）：100 MHz → 10 ns，125 MHz → 8 ns，80 MHz → 12.5 ns */
export const PERIOD_NS: Record<CycleId, number> = { '100': 10, '125': 8, '80': 12.5 }

/** 保持等待时间的选项：第一个是规格值 */
export const PAUSE_OPTIONS: number[] = [SPEC_RET_MS, 32, 128]

export type Settings = { kind: DevKind; cycle: CycleId; pauseMs: number }
export const DEFAULT_SETTINGS: Settings = { kind: DEV_KINDS[0], cycle: CYCLE_IDS[0], pauseMs: PAUSE_OPTIONS[0] }

/** 页面状态：测试设置 + 当前器件编号 + 是否导出过 CSV（用于任务卡） */
export type CapState = Settings & { serial: number; exported: boolean }
export const DEFAULT_CAP: CapState = { ...DEFAULT_SETTINGS, serial: 1, exported: false }

// 缺陷与参数的教学取值（每单元或每颗器件的概率）
const P_SAF = 0.002
const P_TF = 0.002
const P_CF = 0.03
const P_AF = 0.02
const P_SLOW = 0.03
const SLOW_ADD_NS = 3.5
const TACC: Record<DevKind, { mean: number; sigma: number }> = {
  sram: { mean: 5, sigma: 0.5 },
  dram: { mean: 5.6, sigma: 0.5 },
}
const P_LEAK = 0.008
const LEAK_MIN_MS = 8
const LEAK_MAX_MS = 200
const RET_MEDIAN_MS = 1500
const RET_SIGMA = 0.5

export type DutSpec = {
  kind: DevKind
  serial: number
  tAccNs: number
  faults: Fault[]
  /** DRAM 每个单元的保持时间（ms）；SRAM 为 null */
  retentionMs: number[] | null
}

const pick = (rng: () => number, n: number): number => Math.floor(rng() * n)

/** 物理相邻的单元（上下左右），边界内 */
function neighbours(cell: number): number[] {
  const row = Math.floor(cell / SIDE)
  const col = cell % SIDE
  const out: number[] = []
  if (row > 0) {
    out.push(cell - SIDE)
  }
  if (row < SIDE - 1) {
    out.push(cell + SIDE)
  }
  if (col > 0) {
    out.push(cell - 1)
  }
  if (col < SIDE - 1) {
    out.push(cell + 1)
  }
  return out
}

function retentionOf(rng: () => number): number[] {
  const out: number[] = []
  for (let cell = 0; cell < SIZE; cell += 1) {
    let ret = Math.exp(Math.log(RET_MEDIAN_MS) + RET_SIGMA * gaussian(rng))
    if (rng() < P_LEAK) {
      ret = LEAK_MIN_MS + rng() * (LEAK_MAX_MS - LEAK_MIN_MS)
    }
    out.push(ret)
  }
  return out
}

/** 按器件类型与编号生成一颗器件：时序、功能缺陷、（DRAM）保持时间；取随机数的顺序固定 */
export function genDut(kind: DevKind, serial: number): DutSpec {
  const rng = seededRandom(serial * 2 + (kind === 'dram' ? 1 : 0))
  const timing = TACC[kind]
  let tAccNs = timing.mean + timing.sigma * gaussian(rng)
  if (rng() < P_SLOW) {
    tAccNs += SLOW_ADD_NS
  }

  const faults: Fault[] = []
  for (let cell = 0; cell < SIZE; cell += 1) {
    if (rng() < P_SAF) {
      faults.push({ kind: 'SAF', cell, value: rng() < 0.5 ? 0 : 1 })
    }
    if (rng() < P_TF) {
      faults.push({ kind: 'TF', cell, rising: rng() < 0.5 })
    }
  }
  if (rng() < P_CF) {
    const aggressor = pick(rng, SIZE)
    const around = neighbours(aggressor)
    const victim = around[pick(rng, around.length)]
    if (rng() < 0.5) {
      faults.push({ kind: 'CFIN', aggressor, victim, rising: rng() < 0.5 })
    } else {
      faults.push({ kind: 'CFID', aggressor, victim, rising: rng() < 0.5, value: rng() < 0.5 ? 0 : 1 })
    }
  }
  if (rng() < P_AF) {
    const addr = pick(rng, SIZE)
    if (rng() < 0.5) {
      faults.push({ kind: 'AF_NOACCESS', addr })
    } else {
      faults.push({ kind: 'AF_ALIAS', addr, target: addr ^ 1 })
    }
  }

  const retentionMs = kind === 'dram' ? retentionOf(rng) : null
  return { kind, serial, tAccNs, faults, retentionMs }
}

/** 一批器件：编号 1 … BATCH，结果可复现 */
export function genBatch(kind: DevKind): DutSpec[] {
  const out: DutSpec[] = []
  for (let serial = 1; serial <= BATCH; serial += 1) {
    out.push(genDut(kind, serial))
  }
  return out
}

export type StepId = 'timing' | 'functional' | 'retention'
export type Bin = 'pass' | 'timing' | 'functional' | 'retention'
/** Bin 号按测试顺序排列：Pass 为 1 */
export const BIN_NO: Record<Bin, number> = { pass: 1, timing: 2, functional: 3, retention: 4 }
/** CSV 用的英文 Bin 名 */
export const BIN_NAME_EN: Record<Bin, string> = {
  pass: 'Pass',
  timing: 'Timing fail',
  functional: 'Functional fail',
  retention: 'Retention fail',
}

export type StepResult = {
  step: StepId
  pass: boolean
  ops: number
  waitMs: number
  timeUs: number
}

export type Outcome = {
  tAccNs: number
  limitNs: number
  /** 实际执行过的步骤；第一个 Fail 之后的步骤不出现 */
  steps: StepResult[]
  bin: Bin
  /** 功能测试的结果；没有执行时为 null */
  march: RunResult | null
  /** DRAM 保持测试中读回为 0 的单元（保持时间 < pauseMs） */
  weakCells: number[]
  testTimeUs: number
}

/** March C− 的总操作数：每个单元 10 次 × 64 */
export const MARCH_OPS = opsPerCell(MARCH_C_MINUS) * SIZE
/** DRAM 保持测试的读写操作数：写 64 次 + 读 64 次 */
export const RET_OPS = 2 * SIZE

export const limitNsOf = (periodNs: number): number => periodNs - T_SU_NS

const opsTimeUs = (ops: number): number => ops * T_OP_US

/** 单颗器件跑完整个流程（停在第一个 Fail） */
export function runDut(dut: DutSpec, s: Settings): Outcome {
  const limitNs = limitNsOf(PERIOD_NS[s.cycle])
  const steps: StepResult[] = []
  const timingPass = dut.tAccNs <= limitNs
  steps.push({ step: 'timing', pass: timingPass, ops: TIMING_OPS, waitMs: 0, timeUs: opsTimeUs(TIMING_OPS) })

  let bin: Bin = timingPass ? 'pass' : 'timing'
  let march: RunResult | null = null
  if (timingPass) {
    march = runMarch(MARCH_C_MINUS, SIZE, dut.faults)
    steps.push({ step: 'functional', pass: march.pass, ops: MARCH_OPS, waitMs: 0, timeUs: opsTimeUs(MARCH_OPS) })
    if (!march.pass) {
      bin = 'functional'
    }
  }

  let weakCells: number[] = []
  if (bin === 'pass' && dut.retentionMs !== null) {
    const ret = dut.retentionMs
    weakCells = ret.flatMap((value, cell) => (value < s.pauseMs ? [cell] : []))
    steps.push({
      step: 'retention',
      pass: weakCells.length === 0,
      ops: RET_OPS,
      waitMs: s.pauseMs,
      timeUs: opsTimeUs(RET_OPS) + s.pauseMs * 1000,
    })
    if (weakCells.length > 0) {
      bin = 'retention'
    }
  }

  const testTimeUs = steps.reduce((sum, st) => sum + st.timeUs, 0)
  return { tAccNs: dut.tAccNs, limitNs, steps, bin, march, weakCells, testTimeUs }
}

/** 按规格（64 ms）判断 DRAM 器件是否有短于规格保持时间的单元 */
export function leakyAtSpec(dut: DutSpec): boolean {
  if (dut.retentionMs === null) {
    return false
  }
  return dut.retentionMs.some((value) => value < SPEC_RET_MS)
}

export type BatchSummary = {
  outcomes: Outcome[]
  counts: Record<Bin, number>
  yieldRate: number
  avgTimeUs: number
  avgWaitUs: number
  /** 按测试设置判为 Pass、但按规格 64 ms 会保持失败的器件数（漏检） */
  escapes: number
}

export function summarize(duts: DutSpec[], s: Settings): BatchSummary {
  const outcomes = duts.map((dut) => runDut(dut, s))
  const counts: Record<Bin, number> = { pass: 0, timing: 0, functional: 0, retention: 0 }
  let time = 0
  let wait = 0
  let escapes = 0
  for (let i = 0; i < outcomes.length; i += 1) {
    const out = outcomes[i]
    counts[out.bin] += 1
    time += out.testTimeUs
    for (const st of out.steps) {
      wait += st.waitMs * 1000
    }
    if (out.bin === 'pass' && leakyAtSpec(duts[i])) {
      escapes += 1
    }
  }
  const n = outcomes.length
  return {
    outcomes,
    counts,
    yieldRate: n > 0 ? counts.pass / n : 0,
    avgTimeUs: n > 0 ? time / n : 0,
    avgWaitUs: n > 0 ? wait / n : 0,
    escapes,
  }
}

/** 时间的显示：小于 1 ms 用 µs，否则用 ms */
export function formatUs(us: number): string {
  if (us < 1000) {
    return `${us.toFixed(1)} µs`
  }
  return `${(us / 1000).toFixed(2)} ms`
}

/** 一颗器件全部通过时的测试时间（µs），用于小测：时序 + March（+ DRAM 的保持测试） */
export function passTimeUs(kind: DevKind, pauseMs: number): number {
  const ops = TIMING_OPS + MARCH_OPS + (kind === 'dram' ? RET_OPS : 0)
  const wait = kind === 'dram' ? pauseMs * 1000 : 0
  return opsTimeUs(ops) + wait
}

export const CSV_COLUMNS = [
  'device_id',
  'device_type',
  'tacc_ns',
  'timing_pass',
  'functional_pass',
  'retention_pass',
  'first_fail_addr',
  'weak_cells',
  'bin',
  'bin_name',
  'test_time_us',
] as const

const verdictWord = (outcome: Outcome, step: StepId): string => {
  const found = outcome.steps.find((st) => st.step === step)
  if (found === undefined) {
    return 'NA'
  }
  return found.pass ? 'PASS' : 'FAIL'
}

/** 导出 CSV（英文列名）：每颗器件一行；未执行的步骤写 NA */
export function toCsv(duts: DutSpec[], outcomes: Outcome[]): string {
  const lines: string[] = [CSV_COLUMNS.join(',')]
  for (let i = 0; i < duts.length; i += 1) {
    const dut = duts[i]
    const out = outcomes[i]
    const firstFail = out.march === null ? undefined : out.march.failAddrs[0]
    lines.push(
      [
        dut.serial,
        DEV_NAME[dut.kind],
        dut.tAccNs.toFixed(2),
        verdictWord(out, 'timing'),
        verdictWord(out, 'functional'),
        verdictWord(out, 'retention'),
        firstFail === undefined ? 'NA' : firstFail,
        out.weakCells.length,
        BIN_NO[out.bin],
        BIN_NAME_EN[out.bin],
        out.testTimeUs.toFixed(1),
      ].join(','),
    )
  }
  return `${lines.join('\n')}\n`
}
