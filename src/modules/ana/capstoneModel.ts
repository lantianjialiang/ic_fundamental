/**
 * 综合课「混合信号芯片测试程序」的仿真模型（教学示意：虚构器件 VDUT-CAP1，所有数值都是示意）。
 *
 * 一颗 DUT 按测试程序的顺序执行若干测试项。每项的读数 = 工艺真值 + 测量噪声；
 * 判定用的是「测试限值」= 规格向内收 guardband 之后的限值。
 *
 * 全部是纯函数，没有 Math.random、没有 Date.now：
 * - DUT 只由种子决定（seededRandom(seed + i)），与测试程序无关，所以同一批 DUT 可以比较不同的顺序、guardband、stopOnFail；
 * - 同一种子、同一套设置，结果完全一样。
 */

import { gaussian, seededRandom } from './core/rng'
import { cpk, mean, stdev } from './core/stats'

export type ItemId = 'idd' | 'vref' | 'offset' | 'lnr'

/** 一项测试的规格与仿真参数 */
export type TestItemSpec = {
  id: ItemId
  /** 单位；同时用于 CSV 表头，所以只用 ASCII */
  unit: string
  /** 显示与 CSV 的小数位数 */
  decimals: number
  /** 工艺分布的均值 μ 与标准差 σ */
  nominal: number
  sigma: number
  /** 规格下限 / 上限；null 表示该边没有规格 */
  lsl: number | null
  usl: number | null
  /** 测试仪每次读数的测量噪声标准差 */
  measureSigma: number
  /** 故障 DUT 在这一项上的偏移；偏移后通常超出规格，边缘样本可能仍在规格内（此时 truthGood 据实记为好品） */
  defectShift: number
  /** 执行这一项的耗时，ms（示意常量） */
  timeMs: number
  /** 这一项 Fail 时进入的 Bin 号 */
  bin: number
  /** guardband 的可选值；数组第 0 项是默认值 */
  guardbands: number[]
}

const IDD_SPEC: TestItemSpec = {
  id: 'idd',
  unit: 'mA',
  decimals: 2,
  nominal: 5.0,
  sigma: 0.15,
  lsl: null,
  usl: 6.0,
  measureSigma: 0.02,
  defectShift: 1.2,
  timeMs: 20,
  bin: 2,
  guardbands: [0, 0.2, 0.7],
}

const VREF_SPEC: TestItemSpec = {
  id: 'vref',
  unit: 'V',
  decimals: 4,
  nominal: 1.2,
  sigma: 0.003,
  lsl: 1.17,
  usl: 1.23,
  measureSigma: 0.0005,
  defectShift: -0.04,
  timeMs: 30,
  bin: 3,
  guardbands: [0, 0.01, 0.024],
}

const OFFSET_SPEC: TestItemSpec = {
  id: 'offset',
  unit: 'mV',
  decimals: 2,
  nominal: 0,
  sigma: 0.5,
  lsl: -3,
  usl: 3,
  measureSigma: 0.1,
  defectShift: 4,
  timeMs: 50,
  bin: 4,
  guardbands: [0, 1.0, 2.0],
}

const LNR_SPEC: TestItemSpec = {
  id: 'lnr',
  unit: 'mV',
  decimals: 2,
  nominal: 2.0,
  sigma: 0.4,
  lsl: null,
  usl: 4.0,
  measureSigma: 0.1,
  defectShift: 2.2,
  timeMs: 80,
  bin: 5,
  guardbands: [0, 0.4, 1.2],
}

/** 测试项的默认顺序就是这个数组的顺序：IDD → VREF → OFFSET → LNR */
export const ITEMS: TestItemSpec[] = [IDD_SPEC, VREF_SPEC, OFFSET_SPEC, LNR_SPEC]

export const SPEC: Record<ItemId, TestItemSpec> = {
  idd: IDD_SPEC,
  vref: VREF_SPEC,
  offset: OFFSET_SPEC,
  lnr: LNR_SPEC,
}

export const DEFAULT_ORDER: ItemId[] = ITEMS.map((item) => item.id)

export const DEFAULT_GUARDBAND: Record<ItemId, number> = {
  idd: IDD_SPEC.guardbands[0],
  vref: VREF_SPEC.guardbands[0],
  offset: OFFSET_SPEC.guardbands[0],
  lnr: LNR_SPEC.guardbands[0],
}

export const DUT_COUNT = 100
export const DEFAULT_SEED = 1
/** 换一批时种子加这个步长：每批占用 seed .. seed + DUT_COUNT - 1，相邻两批不重叠 */
export const SEED_STEP = 100
/** 每颗 DUT 带故障的概率（示意）；故障会把某一项的读数推到规格之外 */
export const DEFECT_RATE = 0.12
export const BIN_PASS = 1
export const BIN_CODES: number[] = [BIN_PASS, ...ITEMS.map((item) => item.bin)]
export const DUT_ID_PREFIX = 'VDUT-CAP1'

/** 测试程序的全部设置：顺序、停止策略、每项 guardband、批次种子 */
export type ProgramConfig = {
  /** 测试项的执行顺序，自上而下 */
  order: ItemId[]
  /** true：遇到第一个 Fail 立即停止，后面的项不再执行 */
  stopOnFail: boolean
  /** 每项的 guardband，取值来自该项 guardbands 数组 */
  guardband: Record<ItemId, number>
  /** 批次种子 */
  seed: number
}

/** 一项的执行结果；没有执行过则为 null */
export type ItemRun = { value: number; pass: boolean }

export type DutResult = {
  dutId: string
  /** 按 ITEMS 的下标排列（不是按执行顺序） */
  runs: Array<ItemRun | null>
  /** 最终 Bin：全部通过为 1；否则是执行顺序中第一个 Fail 的项的 Bin */
  bin: number
  /** 实际执行过的测试项耗时之和，ms */
  timeMs: number
  /** 真值是否都在规格之内（不看 guardband，也不看测量噪声）：只用于统计误杀和漏检 */
  truthGood: boolean
}

export type ItemStat = {
  /** 实际执行这一项的 DUT 数 */
  executed: number
  passed: number
  /** 通过率；一颗都没执行过时为 NaN */
  passRate: number
  mean: number
  sd: number
  /** Cpk 按规格（USL / LSL）计算，不看 guardband；样本不足时为 NaN */
  cpk: number
}

export type BatchResult = {
  duts: DutResult[]
  passCount: number
  /** 良率 = 通过数 ÷ 测试数 */
  yieldRate: number
  /** 按 BIN_CODES 的顺序给出每个 Bin 的颗数 */
  binCounts: Array<{ bin: number; count: number }>
  /** 按 ITEMS 的下标排列 */
  itemStats: ItemStat[]
  avgTimeMs: number
  /** 误杀：真值在规格内，却被判 Fail */
  overkill: number
  /** 漏检：真值超出规格，却被判 Pass */
  escape: number
}

export function specIndex(id: ItemId): number {
  return ITEMS.findIndex((item) => item.id === id)
}

/** 测试限值：规格向内收 guardband，guardband 越大限值越窄 */
export function testLimits(spec: TestItemSpec, guardband: number): { lo: number | null; hi: number | null } {
  return {
    lo: spec.lsl === null ? null : spec.lsl + guardband,
    hi: spec.usl === null ? null : spec.usl - guardband,
  }
}

/** 边界值算在范围内（读数等于限值时 Pass） */
export function inside(value: number, lo: number | null, hi: number | null): boolean {
  if (lo !== null && value < lo) {
    return false
  }
  if (hi !== null && value > hi) {
    return false
  }
  return true
}

/**
 * 生成第 index 颗 DUT 的工艺真值与测量读数。
 * 随机数的消耗顺序固定：先故障判定，再每项的工艺偏差，再每项的测量噪声。
 */
function sampleDut(seed: number, index: number): { params: number[]; readings: number[] } {
  const random = seededRandom(seed + index)
  const hasDefect = random() < DEFECT_RATE
  const defectAt = Math.min(ITEMS.length - 1, Math.floor(random() * ITEMS.length))
  const params: number[] = []
  for (let k = 0; k < ITEMS.length; k += 1) {
    const spec = ITEMS[k]
    let value = spec.nominal + spec.sigma * gaussian(random)
    if (hasDefect && k === defectAt) {
      value += spec.defectShift
    }
    params.push(value)
  }
  const readings: number[] = []
  for (let k = 0; k < ITEMS.length; k += 1) {
    readings.push(params[k] + ITEMS[k].measureSigma * gaussian(random))
  }
  return { params, readings }
}

/** 按程序顺序跑一颗 DUT：Fail 的项决定 Bin（第一个 Fail 有效）；stopOnFail 时遇到 Fail 就不再执行后面的项 */
function runDut(index: number, config: ProgramConfig): DutResult {
  const { params, readings } = sampleDut(config.seed, index)
  const runs: Array<ItemRun | null> = ITEMS.map(() => null)
  let bin = BIN_PASS
  let timeMs = 0
  let stopped = false
  for (const id of config.order) {
    if (stopped) {
      break
    }
    const k = specIndex(id)
    const spec = ITEMS[k]
    const limits = testLimits(spec, config.guardband[id])
    const value = readings[k]
    const pass = inside(value, limits.lo, limits.hi)
    runs[k] = { value, pass }
    timeMs += spec.timeMs
    if (!pass) {
      if (bin === BIN_PASS) {
        bin = spec.bin
      }
      if (config.stopOnFail) {
        stopped = true
      }
    }
  }
  const truthGood = ITEMS.every((spec, k) => inside(params[k], spec.lsl, spec.usl))
  return {
    dutId: `${DUT_ID_PREFIX}-${String(index + 1).padStart(3, '0')}`,
    runs,
    bin,
    timeMs,
    truthGood,
  }
}

/** 统计一项：只统计实际执行过这一项的 DUT */
function itemStat(duts: DutResult[], k: number): ItemStat {
  const values: number[] = []
  let passed = 0
  for (const dut of duts) {
    const run = dut.runs[k]
    if (run !== null) {
      values.push(run.value)
      if (run.pass) {
        passed += 1
      }
    }
  }
  const executed = values.length
  const m = mean(values)
  const sd = stdev(values)
  return {
    executed,
    passed,
    passRate: executed === 0 ? Number.NaN : passed / executed,
    mean: m,
    sd,
    cpk: cpk(ITEMS[k].usl, ITEMS[k].lsl, m, sd),
  }
}

/** 跑完整批 DUT（DUT_COUNT 颗）并汇总。纯计算，100 颗在毫秒级完成 */
export function runBatch(config: ProgramConfig): BatchResult {
  const duts: DutResult[] = []
  for (let i = 0; i < DUT_COUNT; i += 1) {
    duts.push(runDut(i, config))
  }
  let passCount = 0
  let timeTotal = 0
  let overkillCount = 0
  let escapeCount = 0
  for (const dut of duts) {
    timeTotal += dut.timeMs
    const passed = dut.bin === BIN_PASS
    if (passed) {
      passCount += 1
    }
    if (dut.truthGood && !passed) {
      overkillCount += 1
    }
    if (!dut.truthGood && passed) {
      escapeCount += 1
    }
  }
  return {
    duts,
    passCount,
    yieldRate: passCount / DUT_COUNT,
    binCounts: BIN_CODES.map((bin) => ({ bin, count: duts.filter((dut) => dut.bin === bin).length })),
    itemStats: ITEMS.map((_, k) => itemStat(duts, k)),
    avgTimeMs: timeTotal / DUT_COUNT,
    overkill: overkillCount,
    escape: escapeCount,
  }
}

/**
 * 导出 CSV（纯函数，返回字符串）。
 * 列：dut_id、每个执行项的 <id>_<unit> 与 <id>_pass、final_bin；列的顺序与测试顺序一致。
 * 没有执行的项，值与 pass 两格都留空。行之间用 \n 分隔，末尾不加换行，所以行数 = DUT_COUNT + 1（含表头）。
 */
export function buildCsv(batch: BatchResult, order: ItemId[]): string {
  const cols = order.map((id) => specIndex(id))
  const header: string[] = ['dut_id']
  for (const k of cols) {
    header.push(`${ITEMS[k].id}_${ITEMS[k].unit}`, `${ITEMS[k].id}_pass`)
  }
  header.push('final_bin')
  const lines: string[] = [header.join(',')]
  for (const dut of batch.duts) {
    const cells: string[] = [dut.dutId]
    for (const k of cols) {
      const run = dut.runs[k]
      if (run === null) {
        cells.push('', '')
      } else {
        cells.push(run.value.toFixed(ITEMS[k].decimals), run.pass ? 'PASS' : 'FAIL')
      }
    }
    cells.push(String(dut.bin))
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}
