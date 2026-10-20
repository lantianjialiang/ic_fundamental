/**
 * 存储器并行测试的教学模型（MEM-10，纯函数）。
 *
 * 通道：ATE 固定 64 个通道（教学取值），每颗被测器件需要 12 个地址 / 数据 / 控制通道，
 *       所以 Site 数 N = floor(64 / 12) = 5 是上限。
 * Pattern：所有 Site 共享同一份 March C− 图形，同时执行；单颗的图形时间 = 每单元操作数 × 单元数 / 测试频率。
 * 失效数据：每个 Site 有自己的失效存储器，深度 1024 条记录；每个失效位占 1 条记录。
 *          超过深度的失效只能计数，不能再存地址。
 * 批次：一次插入（索引）时间 0.3 s 固定，所有 Site 共用一次。之后各 Site 的失效记录经同一条数据通道依次读出，
 *       读出时间与 Site 数成正比，这是吞吐在高失效率下饱和的原因。
 * 吞吐 = 3600 × N ÷ 批次时间（颗 / 小时）。
 * 所有数值都是教学取值，不代表某款真实 ATE。
 */
import { MARCH_C_MINUS, opsPerCell } from './core/march'

/** ATE 通道总数 */
export const CH_TOTAL = 64
/** 每颗器件需要的通道数（地址 / 数据 / 控制） */
export const CH_PER_DUT = 12
/** Site 数上限：floor(通道数 / 每颗所需通道数) */
export const N_MAX = Math.floor(CH_TOTAL / CH_PER_DUT)
/** 测试频率，Hz */
export const TESTER_HZ = 100e6
/** 1 Mbit = 2^20 位（教学取值的单元数） */
export const MBIT = 1 << 20
/** 一次插入的索引时间，所有 Site 共用，s */
export const INDEX_S = 0.3
/** 每条失效记录的读出时间，s */
export const REC_S = 100e-6
/** 每个 Site 失效存储器的深度（记录条数） */
export const FAIL_DEPTH = 1024
const SECONDS_PER_HOUR = 3600

export const SITE_COUNTS: number[] = Array.from({ length: N_MAX }, (_, i) => i + 1)

export const CAP_IDS = ['m1', 'm4', 'm16'] as const
export type CapId = (typeof CAP_IDS)[number]
export const CAP_MBIT: Record<CapId, number> = { m1: 1, m4: 4, m16: 16 }

/** 每颗器件的失效位数（每个失效位占一条记录）；按最坏批次计算：每个 Site 都是失效器件 */
export const FAIL_IDS = ['few', 'some', 'many'] as const
export type FailId = (typeof FAIL_IDS)[number]
export const FAIL_BITS: Record<FailId, number> = { few: 10, some: 300, many: 5000 }

export type ParallelState = { cap: CapId; fail: FailId; sites: number }

export const DEFAULT_PARALLEL: ParallelState = { cap: CAP_IDS[0], fail: FAIL_IDS[0], sites: SITE_COUNTS[0] }

/** 单颗器件 March C− 的图形时间，s */
export function patternSeconds(capMbit: number): number {
  return (opsPerCell(MARCH_C_MINUS) * capMbit * MBIT) / TESTER_HZ
}

export type BatchResult = {
  /** 每个 Site 实际存下的失效记录数（不超过深度） */
  stored: number
  /** 失效数据是否超过深度（超出的只能计数） */
  overflow: boolean
  /** 每个 Site 的失效存储器占用百分比 */
  fillPct: number
  /** 单个 Site 的失效读出时间，s */
  tRead: number
  /** 批次时间：图形 + 索引 + 所有 Site 的读出，s */
  tBatch: number
  /** 失效读出占批次时间的比例 */
  readShare: number
  /** 吞吐，颗 / 小时 */
  throughput: number
}

/** 给定容量、失效级别和 Site 数，算出一个批次的结果 */
export function batchAt(capMbit: number, fail: FailId, sites: number): BatchResult {
  const bits = FAIL_BITS[fail]
  const stored = Math.min(bits, FAIL_DEPTH)
  const tRead = stored * REC_S
  const tBase = patternSeconds(capMbit) + INDEX_S
  const tBatch = tBase + sites * tRead
  return {
    stored,
    overflow: bits > FAIL_DEPTH,
    fillPct: (stored / FAIL_DEPTH) * 100,
    tRead,
    tBatch,
    readShare: (sites * tRead) / tBatch,
    throughput: (SECONDS_PER_HOUR * sites) / tBatch,
  }
}

export type ParallelResult = BatchResult & {
  cap: number
  sites: number
  channelsUsed: number
  /** 单 Site 时的吞吐，用来算倍数 */
  singleThroughput: number
  speedup: number
  /** 所有 Site 的失效存储器合计占用的记录数 */
  totalStored: number
  /** 通道是否已经用到上限 */
  channelFull: boolean
}

export function analyseParallel(state: ParallelState): ParallelResult {
  const cap = CAP_MBIT[state.cap]
  const batch = batchAt(cap, state.fail, state.sites)
  const single = batchAt(cap, state.fail, 1)
  return {
    ...batch,
    cap,
    sites: state.sites,
    channelsUsed: state.sites * CH_PER_DUT,
    singleThroughput: single.throughput,
    speedup: batch.throughput / single.throughput,
    totalStored: state.sites * batch.stored,
    channelFull: state.sites === N_MAX,
  }
}

/** 吞吐随 Site 数变化的曲线（同一容量、同一失效级别） */
export function curveFor(capId: CapId, fail: FailId): Array<{ sites: number; throughput: number }> {
  return SITE_COUNTS.map((sites) => ({ sites, throughput: batchAt(CAP_MBIT[capId], fail, sites).throughput }))
}
