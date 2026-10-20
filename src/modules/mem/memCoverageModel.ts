/**
 * 测试覆盖率与良率的教学模型（MEM-11，纯函数）。
 *
 * 覆盖率：在仿真阵列（128 单元）上随机注入 240 个故障，每次只注入一个故障（单故障模型，避免故障之间互相掩盖），
 *        用 runMarch 跑算法，检出即记为“被抓到”。覆盖率 = 检出数 / 注入数。
 *        随机序列由 seededRandom(SEED) 生成，同一个种子每次结果一样。
 * 耗时：耗时 = 每单元操作数 × 单元数 ÷ 测试频率。这里换算到 1 Mbit、100 MHz 的器件，单位 ms。
 * 良率（泊松模型，教学简化）：每颗器件的缺陷数 K ~ Poisson(λ)，每个缺陷被算法抓到的概率为 c（覆盖率）。
 *        真实良率 = e^(−λ)（与测试无关）；测试良率 = e^(−λc)（测试判 PASS 的比例）；
 *        出货不良 = (1 − e^(−λ(1−c))) × 10⁶（PPM，每百万颗通过测试的器件里实际有缺陷的数量）。
 * 注意：覆盖率高只说明“能抓到多少注入的故障”；良率还取决于缺陷密度 λ 和修复能力（见 MEM-09）。
 */
import { seededRandom } from '../ana/core/rng'
import { type Fault } from './core/array'
import { MARCH_C_MINUS, MATS_PLUS, type MarchAlgorithm, opsPerCell, runMarch } from './core/march'

export const SIM_CELLS = 128
export const SIM_FAULTS = 240
export const SEED = 2026
export const TESTER_HZ = 100e6
export const MBIT = 1 << 20

/** 故障类别（与 Fault 的 kind 一一对应），显示顺序即数组顺序 */
export const FAULT_KINDS = ['SAF', 'TF', 'CFIN', 'CFID', 'AF_NOACCESS', 'AF_ALIAS'] as const
export type FaultKind = (typeof FAULT_KINDS)[number]

/** 基线：只做 w0、r0、w1、r1 四遍，每遍单向不交替，最弱但最快 */
export const MSCAN: MarchAlgorithm = {
  name: 'MSCAN',
  elements: [
    { order: 'any', ops: ['w0'] },
    { order: 'any', ops: ['r0'] },
    { order: 'any', ops: ['w1'] },
    { order: 'any', ops: ['r1'] },
  ],
}

/** March X：⇕(w0); ⇑(r0,w1); ⇓(r1,w0); ⇕(r0)，每单元 6 次操作 */
export const MARCH_X: MarchAlgorithm = {
  name: 'March X',
  elements: [
    { order: 'any', ops: ['w0'] },
    { order: 'up', ops: ['r0', 'w1'] },
    { order: 'down', ops: ['r1', 'w0'] },
    { order: 'any', ops: ['r0'] },
  ],
}

export const ALG_IDS = ['mscan', 'mats', 'marchx', 'marchc'] as const
export type AlgId = (typeof ALG_IDS)[number]

export const ALG_BY_ID: Record<AlgId, MarchAlgorithm> = {
  mscan: MSCAN,
  mats: MATS_PLUS,
  marchx: MARCH_X,
  marchc: MARCH_C_MINUS,
}

export const LAMBDA_IDS = ['low', 'mid', 'high'] as const
export type LambdaId = (typeof LAMBDA_IDS)[number]
/** 每颗器件平均缺陷数 λ（教学取值） */
export const LAMBDA: Record<LambdaId, number> = { low: 0.2, mid: 1, high: 2 }

export type CoverageState = { alg: AlgId; lambda: LambdaId }

export const DEFAULT_COVERAGE: CoverageState = { alg: ALG_IDS[0], lambda: LAMBDA_IDS[0] }

/**
 * 随机注入故障：类型按概率分配（SAF 25%、TF 20%、CFIN 15%、CFID 15%、AF 无访问 12.5%、AF 别名 12.5%）。
 * 耦合与别名的两个地址互不相同。
 */
export function sampleFaults(seed: number, count: number, cells: number): Fault[] {
  const random = seededRandom(seed)
  const pick = (): number => Math.min(cells - 1, Math.floor(random() * cells))
  const other = (a: number): number => {
    let b = pick()
    while (b === a) {
      b = pick()
    }
    return b
  }
  const out: Fault[] = []
  for (let i = 0; i < count; i += 1) {
    const u = random()
    if (u < 0.25) {
      out.push({ kind: 'SAF', cell: pick(), value: random() < 0.5 ? 0 : 1 })
    } else if (u < 0.45) {
      out.push({ kind: 'TF', cell: pick(), rising: random() < 0.5 })
    } else if (u < 0.6) {
      const a = pick()
      out.push({ kind: 'CFIN', aggressor: a, victim: other(a), rising: random() < 0.5 })
    } else if (u < 0.75) {
      const a = pick()
      out.push({ kind: 'CFID', aggressor: a, victim: other(a), rising: random() < 0.5, value: random() < 0.5 ? 0 : 1 })
    } else if (u < 0.875) {
      out.push({ kind: 'AF_NOACCESS', addr: pick() })
    } else {
      const a = pick()
      out.push({ kind: 'AF_ALIAS', addr: a, target: other(a) })
    }
  }
  return out
}

/** 故障集合在模块加载时生成一次，所有算法用同一批故障比较 */
export const SAMPLE: Fault[] = sampleFaults(SEED, SIM_FAULTS, SIM_CELLS)

/** 故障的类别 */
export function kindOf(f: Fault): FaultKind {
  return f.kind
}

export type AlgResult = {
  alg: AlgId
  name: string
  /** 每单元操作数 */
  ops: number
  detected: number
  total: number
  coverage: number
  byKind: Record<FaultKind, { detected: number; total: number }>
  /** 仿真阵列（128 单元）上的总操作数 */
  simOps: number
  /** 1 Mbit、100 MHz 下的耗时，ms */
  timeMs: number
}

/** 单故障注入：每个故障单独跑一遍算法，检出即计入 */
export function evaluate(alg: AlgId): AlgResult {
  const march = ALG_BY_ID[alg]
  const byKind: Record<FaultKind, { detected: number; total: number }> = {
    SAF: { detected: 0, total: 0 },
    TF: { detected: 0, total: 0 },
    CFIN: { detected: 0, total: 0 },
    CFID: { detected: 0, total: 0 },
    AF_NOACCESS: { detected: 0, total: 0 },
    AF_ALIAS: { detected: 0, total: 0 },
  }
  let detected = 0
  for (const fault of SAMPLE) {
    const hit = !runMarch(march, SIM_CELLS, [fault]).pass
    const kind = kindOf(fault)
    byKind[kind].total += 1
    if (hit) {
      byKind[kind].detected += 1
      detected += 1
    }
  }
  const ops = opsPerCell(march)
  return {
    alg,
    name: march.name,
    ops,
    detected,
    total: SAMPLE.length,
    coverage: detected / SAMPLE.length,
    byKind,
    simOps: ops * SIM_CELLS,
    timeMs: (ops * MBIT * 1000) / TESTER_HZ,
  }
}

export const RESULTS: Record<AlgId, AlgResult> = {
  mscan: evaluate('mscan'),
  mats: evaluate('mats'),
  marchx: evaluate('marchx'),
  marchc: evaluate('marchc'),
}

/** 真实良率：e^(−λ)，与测试无关 */
export function trueYield(lambda: number): number {
  return Math.exp(-lambda)
}

/** 测试良率：e^(−λc)，测试判 PASS 的比例 */
export function testYield(lambda: number, coverage: number): number {
  return Math.exp(-lambda * coverage)
}

/** 出货不良（PPM）：(1 − e^(−λ(1−c))) × 10⁶ */
export function escapePpm(lambda: number, coverage: number): number {
  return (1 - Math.exp(-lambda * (1 - coverage))) * 1e6
}

export type CoverageResult = AlgResult & {
  lambda: number
  trueYield: number
  testYield: number
  ppm: number
}

export function analyseCoverage(state: CoverageState): CoverageResult {
  const result = RESULTS[state.alg]
  const lambda = LAMBDA[state.lambda]
  return {
    ...result,
    lambda,
    trueYield: trueYield(lambda),
    testYield: testYield(lambda, result.coverage),
    ppm: escapePpm(lambda, result.coverage),
  }
}
