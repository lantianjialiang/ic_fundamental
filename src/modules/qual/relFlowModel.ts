/**
 * REL-08 量产测试流程的教学模型（车规 VDUT-AUTO1）。
 *
 * 虚拟群体：8 片晶圆，每片约 300 颗 die（core/wafer.ts 的 makeWafer），共约 2400 颗。三类问题：
 *   - 硬失效：功能或开短路，任何测试站都能抓到；
 *   - 温度相关的参数偏移：只在某一温度超限（冷端或高温），只有覆盖那个温度的测试站才能抓到；
 *   - 潜在缺陷：规格内、常温看不出来，带一个 Weibull(β = 0.6) 的早期失效时间；Burn-in 与 PAT 对它起作用。
 *
 * 结果用期望值：每颗器件记录“存活概率” alive 和各 Bin 的概率 probs。
 * 同一组参数与流程永远得到同一结果（wafer 的 seed 固定，没有运行时随机数）。
 * STDF 导出是对每颗器件的 Bin 概率用固定 seed 抽样一次，件数与期望值会有偏差，文件本身可复现。
 *
 * 数值来源：阿伦尼乌斯 AF 与 Weibull CDF 来自 core/reliability.ts；动态 PAT 与邻近规则来自 core/pat.ts。
 * 成本、节拍、良率等参数都是教学示意值，不对应任何具体设备或标准。
 */
import { arrheniusAF, weibullCdf } from './core/reliability'
import { dynamicPatLimits, neighborRule } from './core/pat'
import { makeWafer, mulberry32, type WaferMap } from './core/wafer'
import { encodeFile, FLAG_TEST_FAIL, STDF_VERSION, type RecordInput, type ParseResult } from '../gen/model/stdf'

/* ------------------------------------------------------------------ */
/* 流程节点                                                             */
/* ------------------------------------------------------------------ */

/** 节点 ID；默认顺序即数组顺序（CP → BI → FT → PAT → 可靠性抽检） */
export const NODE_IDS = ['cpRoom', 'cpHot', 'bi', 'ftCold', 'ftRoom', 'ftHot', 'pat', 'relSample'] as const
export type NodeId = (typeof NODE_IDS)[number]

export const DEFAULT_ORDER: NodeId[] = [...NODE_IDS]

/** temp：测试温度 °C（null = 不是测试站）；touchS：测试机每颗器件的接触时间，秒（示意值） */
export const NODE_INFO: Record<NodeId, { temp: number | null; touchS: number }> = {
  cpRoom: { temp: 25, touchS: 0.5 },
  cpHot: { temp: 125, touchS: 0.5 },
  bi: { temp: null, touchS: 0 },
  ftCold: { temp: -40, touchS: 0.8 },
  ftRoom: { temp: 25, touchS: 0.8 },
  ftHot: { temp: 125, touchS: 0.8 },
  pat: { temp: null, touchS: 0 },
  relSample: { temp: null, touchS: 0 },
}

/** 测试机开始时所在的温度（室温） */
export const START_TEMP_C = 25

/* ------------------------------------------------------------------ */
/* 教学参数（示意值，界面上以“示例”标注）                                  */
/* ------------------------------------------------------------------ */

export const N_WAFERS = 8
export const DIE_DIAMETER = 20
export const BASE_SEED = 2026
export const LATENT_SHIFT_SIGMA = 3
export const PARAM_MEAN = 1.0
export const PARAM_SIGMA = 0.05
/** 参数规格限，mA：均值 ± 5σ，正常器件不会超限 */
export const SPEC_LO = PARAM_MEAN - 5 * PARAM_SIGMA
export const SPEC_HI = PARAM_MEAN + 5 * PARAM_SIGMA

/** 潜在缺陷的早期失效：Weibull β = 0.6，η 为教学取值（小时，使用条件） */
export const BETA_LATENT = 0.6
export const ETA_LATENT = 600
/** 现场窗口：使用 1 年（8760 h，使用条件） */
export const FIELD_H = 8760

/** Burn-in 的温度与激活能：125 °C，Ea = 0.7 eV，使用温度 55 °C */
export const EA_TEACH = 0.7
export const USE_TEMP_C = 55
export const BI_TEMP_C = 125
export const AF_BI = arrheniusAF(EA_TEACH, USE_TEMP_C, BI_TEMP_C)

/** 每批器件数（烘箱与温度切换以批为单位） */
export const BATCH_SIZE = 500
/** 测试机小时成本，$/h（示意） */
export const CELL_RATE_PER_H = 150
/** Burn-in 每颗器件每小时的成本，$/（件·h）（示意） */
export const BI_RATE_PER_PART_H = 0.002
/** 可靠性抽检的样本量（示例，以现行标准为准）与单颗成本，$（示意） */
export const SAMPLE_N = 77
export const SAMPLE_UNIT_COST = 1.2

/** 教学目标：ppm 目标与测试成本预算（$ / 良品），用于任务卡与结论 */
export const PPM_TARGET = 300
export const COT_BUDGET = 0.3

/* ------------------------------------------------------------------ */
/* Bin                                                                  */
/* ------------------------------------------------------------------ */

/** Bin 号：1 = PASS；其余为各类拒收 */
export const BIN = { pass: 1, hard: 2, cold: 3, hot: 4, pat: 5, nbr: 6, bi: 7 } as const
export type BinNo = (typeof BIN)[keyof typeof BIN]
export const BIN_NOS: BinNo[] = [1, 2, 3, 4, 5, 6, 7]
/** 拒收类 Bin，按 Bin 号顺序（抽样时使用） */
const REJECT_BINS: BinNo[] = [2, 3, 4, 5, 6, 7]
/** STDF 里的 Bin 名：文件内容保持 ASCII，不随界面语言变化 */
export const BIN_STDF_NAME: Record<BinNo, string> = {
  1: 'PASS',
  2: 'HARD',
  3: 'COLD_SHIFT',
  4: 'HOT_SHIFT',
  5: 'PAT',
  6: 'NEIGHBOR',
  7: 'BI_FAIL',
}

/* ------------------------------------------------------------------ */
/* 虚拟群体                                                             */
/* ------------------------------------------------------------------ */

export type ShiftKind = 'cold' | 'hot' | null

export type Unit = {
  wafer: number
  dieId: number
  col: number
  row: number
  hard: boolean
  shift: ShiftKind
  latent: boolean
  param: number
  /** 仍然存活（未被拒收）的期望比例，0–1 */
  alive: number
  /** 经过 Burn-in 的使用等效小时（h·AF）；没有经过 BI 为 0 */
  biH: number
  /** 各 Bin 的期望件数比例，下标 = Bin 号；与 alive 相加恒为 1 */
  probs: number[]
}

export type PopParams = { hardPct: number; shiftPct: number; latentPct: number }

export type Population = {
  wafers: WaferMap[]
  /** 每片晶圆第一颗 unit 在 units 中的下标 */
  offsets: number[]
  units: Unit[]
  params: PopParams
}

/** 按百分比参数生成虚拟群体；同参数同结果 */
export function buildPopulation(params: PopParams): Population {
  const wafers: WaferMap[] = []
  const offsets: number[] = []
  const units: Unit[] = []
  for (let w = 0; w < N_WAFERS; w += 1) {
    const seed = BASE_SEED + w * 101
    const map = makeWafer({
      diameterDie: DIE_DIAMETER,
      seed,
      clusterProb: 0.6,
      latentRate: params.latentPct / 100,
      hardRate: params.hardPct / 100,
      paramMean: PARAM_MEAN,
      paramSigma: PARAM_SIGMA,
      latentShiftSigma: LATENT_SHIFT_SIGMA,
    })
    wafers.push(map)
    offsets.push(units.length)
    const rand = mulberry32(seed + 7)
    for (const die of map.dies) {
      let shift: ShiftKind = null
      if (!die.hardFail && !die.latent) {
        const roll = rand()
        if (roll < params.shiftPct / 100) {
          shift = rand() < 0.5 ? 'cold' : 'hot'
        }
      }
      units.push({
        wafer: w,
        dieId: die.id,
        col: die.col,
        row: die.row,
        hard: die.hardFail,
        shift,
        latent: die.latent,
        param: die.param,
        alive: 1,
        biH: 0,
        probs: new Array<number>(8).fill(0),
      })
    }
  }
  return { wafers, offsets, units, params }
}

/* ------------------------------------------------------------------ */
/* 流程配置与运行                                                       */
/* ------------------------------------------------------------------ */

export type FlowState = {
  /** 节点显示顺序 */
  order: NodeId[]
  /** 每个节点是否启用 */
  on: Record<NodeId, boolean>
  /** 每次温度切换的 soak 时间，秒 */
  soakS: number
  /** Burn-in 时间，小时（BI 温度固定 125 °C） */
  biH: number
  /** PAT 的 k（动态限值 median ± k·σ_rob） */
  patK: number
  /** PAT 计算窗口 */
  patWin: 'lot' | 'wafer'
  /** 邻近规则是否启用（依附于 PAT） */
  nbrOn: boolean
  /** 邻近规则半径（die 间距）与最少失效数 */
  nbrR: number
  nbrM: number
}

export const DEFAULT_FLOW: FlowState = {
  order: DEFAULT_ORDER,
  on: { cpRoom: true, cpHot: true, bi: false, ftCold: true, ftRoom: true, ftHot: true, pat: false, relSample: false },
  soakS: 60,
  biH: 24,
  patK: 3,
  patWin: 'lot',
  nbrOn: false,
  nbrR: 1,
  nbrM: 2,
}

export const DEFAULT_POP: PopParams = { hardPct: 2, shiftPct: 1, latentPct: 0.5 }

export type TraceKey = 'lot' | 'coords' | 'temp' | 'patData' | 'biRead'
export type TraceItem = { key: TraceKey; applicable: boolean; ok: boolean }

export type FlowResult = {
  n: number
  passN: number
  yieldPct: number
  /** 各拒收 Bin 的期望件数，下标 = Bin 号 */
  bins: number[]
  /** 期望的出货后早期失效件数（逃逸） */
  escapeN: number
  /** 逃逸按原因拆分（期望件数） */
  escBy: { hard: number; shift: number; latent: number }
  ppm: number
  /** 执行的节点（按顺序，只含启用的） */
  nodes: Array<{ id: NodeId; win: number }>
  /** 测试温度（去重，按出现顺序），STDF MIR.TST_TEMP 用 */
  tempsUsed: number[]
  /** 温度切换次数（从室温开始） */
  changes: number
  batches: number
  touchS: number
  soakS: number
  tdS: number
  uph: number
  cellCost: number
  biCost: number
  sampleCost: number
  /** 测试成本（$ / 良品） */
  cot: number
  trace: TraceItem[]
  traceRate: number
  /** 抽检命中逃逸的概率；没有启用抽检为 null */
  relDetect: number | null
  /** PAT 与邻近规则分别拒掉的潜在缺陷件数（期望），用来说明两者的作用 */
  patLatentN: number
  nbrLatentN: number
}

export type FlowRun = { result: FlowResult; units: Unit[] }

const sumAlive = (units: Unit[]) => units.reduce((s, u) => s + u.alive, 0)

function reject(u: Unit, bin: BinNo) {
  u.probs[bin] += u.alive
  u.alive = 0
}

/** 拒收站：返回这一站是否抓得到该器件。硬失效所有测试站都抓；温度偏移只抓对应温度 */
function screen(id: NodeId, u: Unit) {
  if (u.hard) {
    reject(u, BIN.hard)
    return
  }
  if (id === 'cpHot' || id === 'ftHot') {
    if (u.shift === 'hot') {
      reject(u, BIN.hot)
    }
    return
  }
  if (id === 'ftCold') {
    if (u.shift === 'cold') {
      reject(u, BIN.cold)
    }
  }
}

/** 给定使用等效小时 H（已经过 BI），潜在缺陷在现场窗口内失效的条件概率 */
export function fieldFailGivenBi(h: number): number {
  const f0 = weibullCdf(BETA_LATENT, ETA_LATENT, h)
  const f1 = weibullCdf(BETA_LATENT, ETA_LATENT, h + FIELD_H)
  const surv = 1 - f0
  return surv > 1e-12 ? (f1 - f0) / surv : 0
}

/** 运行一次流程。确定性：同一群体、同一配置，结果逐位相同 */
export function runFlow(state: FlowState, pop: Population): FlowRun {
  const units: Unit[] = pop.units.map((u) => ({ ...u, alive: 1, biH: 0, probs: new Array<number>(8).fill(0) }))
  const hasCp = state.on.cpRoom || state.on.cpHot
  const biHExp = state.biH * AF_BI
  const allIdx = units.map((_, i) => i)
  const nodes: Array<{ id: NodeId; win: number }> = []
  const tempsUsed: number[] = []
  const latentCaught = { pat: 0, nbr: 0 }
  let touchS = 0
  let changes = 0
  let cur = START_TEMP_C

  for (const id of state.order) {
    if (!state.on[id]) {
      continue
    }
    const win = sumAlive(units)
    nodes.push({ id, win })
    const info = NODE_INFO[id]
    if (info.temp !== null) {
      touchS += info.touchS * win
      if (info.temp !== cur) {
        changes += 1
        cur = info.temp
      }
      if (!tempsUsed.includes(info.temp)) {
        tempsUsed.push(info.temp)
      }
    }

    if (id === 'cpRoom' || id === 'cpHot' || id === 'ftCold' || id === 'ftRoom' || id === 'ftHot') {
      for (const u of units) {
        screen(id, u)
      }
    } else if (id === 'bi') {
      const f = weibullCdf(BETA_LATENT, ETA_LATENT, biHExp)
      for (const u of units) {
        u.biH = biHExp
        if (u.latent && u.alive > 0) {
          u.probs[BIN.bi] += u.alive * f
          u.alive *= 1 - f
        }
      }
    } else if (id === 'pat') {
      const groups: number[][] = state.patWin === 'lot' ? [allIdx] : pop.wafers.map((_, w) => waferIdx(pop, w))
      for (const idx of groups) {
        const live = idx.filter((i) => units[i].alive > 0)
        if (live.length === 0) {
          continue
        }
        const lim = dynamicPatLimits(
          live.map((i) => units[i].param),
          state.patK,
        )
        for (const i of live) {
          const u = units[i]
          if (u.param < lim.lo || u.param > lim.hi) {
            if (u.latent) {
              latentCaught.pat += u.alive
            }
            reject(u, BIN.pat)
          }
        }
      }
      if (state.nbrOn && hasCp) {
        for (let w = 0; w < pop.wafers.length; w += 1) {
          const base = pop.offsets[w]
          const failed = new Set<number>()
          for (let d = 0; d < pop.wafers[w].dies.length; d += 1) {
            if (units[base + d].alive === 0) {
              failed.add(d)
            }
          }
          const extra = neighborRule(pop.wafers[w], failed, state.nbrR, state.nbrM)
          for (const d of extra) {
            const u = units[base + d]
            if (u.alive > 0) {
              if (u.latent) {
                latentCaught.nbr += u.alive
              }
              reject(u, BIN.nbr)
            }
          }
        }
      }
    }
  }

  /* 汇总 */
  const n = units.length
  let passN = 0
  let escapeN = 0
  const escBy = { hard: 0, shift: 0, latent: 0 }
  const bins = new Array<number>(8).fill(0)
  for (const u of units) {
    passN += u.alive
    for (const b of REJECT_BINS) {
      bins[b] += u.probs[b]
    }
    if (u.alive > 0) {
      if (u.hard) {
        escBy.hard += u.alive
      } else if (u.shift !== null) {
        escBy.shift += u.alive
      } else if (u.latent) {
        escBy.latent += u.alive * fieldFailGivenBi(u.biH)
      }
    }
  }
  escapeN = escBy.hard + escBy.shift + escBy.latent

  /* 节拍与成本 */
  const batches = Math.ceil(n / BATCH_SIZE)
  const soakS = changes * batches * state.soakS
  const tdS = touchS + soakS
  const uph = tdS > 0 ? (3600 * n) / tdS : 0
  const biWin = nodes.find((x) => x.id === 'bi')?.win ?? 0
  const cellCost = (CELL_RATE_PER_H * tdS) / 3600
  const biCost = state.on.bi ? BI_RATE_PER_PART_H * state.biH * biWin : 0
  const sampleCost = state.on.relSample ? SAMPLE_N * SAMPLE_UNIT_COST : 0
  const cot = passN > 0 ? (cellCost + biCost + sampleCost) / passN : 0

  /* 追溯完整度 */
  const seq = nodes.map((x) => x.id)
  const hasTest = seq.some((id) => NODE_INFO[id].temp !== null)
  const biPos = seq.indexOf('bi')
  const testBefore = biPos > 0 && seq.slice(0, biPos).some((id) => NODE_INFO[id].temp !== null)
  const testAfter = biPos >= 0 && seq.slice(biPos + 1).some((id) => NODE_INFO[id].temp !== null)
  const patOn = state.on.pat
  const biOn = state.on.bi
  const trace: TraceItem[] = [
    { key: 'lot', applicable: true, ok: hasTest },
    { key: 'coords', applicable: true, ok: hasCp },
    { key: 'temp', applicable: true, ok: hasTest },
    { key: 'patData', applicable: patOn, ok: patOn && hasCp },
    { key: 'biRead', applicable: biOn, ok: biOn && testBefore && testAfter },
  ]
  const applicable = trace.filter((x) => x.applicable)
  const traceRate = applicable.filter((x) => x.ok).length / applicable.length

  const relDetect = state.on.relSample && passN > 0 ? 1 - Math.pow(1 - escapeN / passN, SAMPLE_N) : null

  const result: FlowResult = {
    n,
    passN,
    yieldPct: n > 0 ? (passN / n) * 100 : 0,
    bins,
    escapeN,
    escBy,
    ppm: passN > 0 ? (escapeN / passN) * 1e6 : 0,
    nodes,
    tempsUsed,
    changes,
    batches,
    touchS,
    soakS,
    tdS,
    uph,
    cellCost,
    biCost,
    sampleCost,
    cot,
    trace,
    traceRate,
    relDetect,
    patLatentN: latentCaught.pat,
    nbrLatentN: latentCaught.nbr,
  }
  return { result, units }
}

function waferIdx(pop: Population, w: number): number[] {
  const base = pop.offsets[w]
  const out: number[] = []
  for (let d = 0; d < pop.wafers[w].dies.length; d += 1) {
    out.push(base + d)
  }
  return out
}

/* ------------------------------------------------------------------ */
/* STDF 导出                                                            */
/* ------------------------------------------------------------------ */

/** 导出用的抽样 seed：同一配置导出的文件逐字节相同 */
export const EXPORT_SEED = 8080
const PART_TYPE = 'VDUT-AUTO1'
const SETUP_T = 1761300000
const START_T = 1761300060
const FINISH_T = 1761300900

/** 对每颗器件的 Bin 概率做一次固定 seed 的抽样，返回每颗器件的 Bin 号 */
export function realizeBins(units: Unit[], seed: number): BinNo[] {
  const rand = mulberry32(seed)
  return units.map((u) => {
    const r = rand()
    let cum = 0
    for (const b of REJECT_BINS) {
      cum += u.probs[b]
      if (r < cum) {
        return b
      }
    }
    return BIN.pass
  })
}

export type StdfExport = {
  bytes: Uint8Array
  /** 抽样后的实际件数，下标 = Bin 号（用来和解析结果核对） */
  binCounts: number[]
  partN: number
  /** 写入 MIR.TST_TEMP 的字符串，例如 "25/125/-40" */
  tstTemp: string
}

const asciiBytes = (text: string) => Array.from(text.slice(0, 255), (ch) => ch.charCodeAt(0) & 0x7f)

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

/**
 * MIR 的 V4 尾部字段（JOB_REV … TST_TEMP）不在 stdf.ts 的子集里，这里按 V4 顺序补写：
 * JOB_REV、SBLOT_ID、OPER_NAM、EXEC_TYP、EXEC_VER、TEST_COD 六个空串，然后是 TST_TEMP。
 * 解析端（stdf.ts）把它们当作未解析的尾部字节（UNPARSED），由 readTstTemp 读出。
 */
function mirWithTemp(base: Uint8Array, tstTemp: string): Uint8Array {
  const text = asciiBytes(tstTemp)
  const tail = [0, 0, 0, 0, 0, 0, text.length, ...text]
  const out = new Uint8Array(base.length + tail.length)
  out.set(base)
  out.set(tail, base.length)
  const newLen = (base[0] | (base[1] << 8)) + tail.length
  out[0] = newLen & 0xff
  out[1] = (newLen >> 8) & 0xff
  return out
}

/** 从解析结果读回 MIR.TST_TEMP；读不到返回 null */
export function readTstTemp(bytes: Uint8Array, parsed: ParseResult): string | null {
  const mir = parsed.records.find((r) => r.name === 'MIR')
  const raw = mir?.fields.find((f) => f.name === 'UNPARSED')
  if (!raw) {
    return null
  }
  let p = raw.offset
  for (let k = 0; k < 6; k += 1) {
    p += 1 + bytes[p]
  }
  const len = bytes[p]
  return String.fromCharCode(...bytes.subarray(p + 1, p + 1 + len))
}

/** 把一次运行导出为 STDF：每颗器件一组 PIR/PTR/PRR（含 X/Y 坐标与 PART_ID），再加汇总记录 */
export function exportStdf(state: FlowState, run: FlowRun, lotId: string): StdfExport {
  const hasCp = state.on.cpRoom || state.on.cpHot
  const realized = realizeBins(run.units, EXPORT_SEED)
  const binCounts = new Array<number>(8).fill(0)
  for (const b of realized) {
    binCounts[b] += 1
  }
  const tstTemp = run.result.tempsUsed.join('/')
  const far: RecordInput = { name: 'FAR', fields: { STDF_VER: STDF_VERSION } }
  const mir: RecordInput = {
    name: 'MIR',
    fields: {
      SETUP_T,
      START_T,
      STAT_NUM: 1,
      MODE_COD: 'P',
      RTST_COD: ' ',
      PROT_COD: ' ',
      BURN_TIM: Math.min(65535, Math.round(state.on.bi ? state.biH * 60 : 0)),
      CMOD_COD: ' ',
      LOT_ID: lotId,
      PART_TYP: PART_TYPE,
      NODE_NAM: 'ATE-SIM',
      TSTR_TYP: 'SIM-ATE',
      JOB_NAM: 'AUTO_FLOW',
    },
  }

  const parts: RecordInput[] = []
  run.units.forEach((u, i) => {
    const bin = realized[i]
    const serial = String(i + 1).padStart(4, '0')
    const failParam = u.param < SPEC_LO || u.param > SPEC_HI
    parts.push({ name: 'PIR', fields: { HEAD_NUM: 1, SITE_NUM: 1 } })
    parts.push({
      name: 'PTR',
      fields: {
        TEST_NUM: 2001,
        HEAD_NUM: 1,
        SITE_NUM: 1,
        TEST_FLG: failParam ? FLAG_TEST_FAIL : 0,
        PARM_FLG: 0,
        RESULT: u.param,
        TEST_TXT: 'Iq',
        ALARM_ID: '',
        OPT_FLAG: 0,
        RES_SCAL: 0,
        LLM_SCAL: 0,
        HLM_SCAL: 0,
        LO_LIMIT: SPEC_LO,
        HI_LIMIT: SPEC_HI,
        UNITS: 'mA',
      },
    })
    parts.push({
      name: 'PRR',
      fields: {
        HEAD_NUM: 1,
        SITE_NUM: 1,
        PART_FLG: bin === BIN.pass ? 0 : 8,
        NUM_TEST: 1,
        HARD_BIN: bin,
        SOFT_BIN: bin,
        X_COORD: hasCp ? u.col : 0,
        Y_COORD: hasCp ? u.row : 0,
        TEST_T: 0,
        PART_ID: `${lotId}-W${u.wafer + 1}-${serial}`,
        PART_TXT: '',
      },
    })
  })

  const summary: RecordInput[] = [
    {
      name: 'PCR',
      fields: { HEAD_NUM: 255, SITE_NUM: 255, PART_CNT: run.units.length, RTST_CNT: 0, ABRT_CNT: 0, GOOD_CNT: binCounts[BIN.pass], FUNC_CNT: run.units.length },
    },
  ]
  for (const b of BIN_NOS) {
    if (binCounts[b] > 0) {
      summary.push({
        name: 'HBR',
        fields: { HEAD_NUM: 255, SITE_NUM: 255, HBIN_NUM: b, HBIN_CNT: binCounts[b], HBIN_PF: b === BIN.pass ? 'P' : 'F', HBIN_NAM: BIN_STDF_NAME[b] },
      })
    }
  }
  summary.push({ name: 'MRR', fields: { FINISH_T, DISP_COD: 'C', USR_DESC: '' } })

  const bytes = concatBytes([
    encodeFile([far], true),
    mirWithTemp(encodeFile([mir], true), tstTemp),
    encodeFile(parts, true),
    encodeFile(summary, true),
  ])
  return { bytes, binCounts, partN: run.units.length, tstTemp }
}
