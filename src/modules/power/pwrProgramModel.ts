/**
 * PWR-08 综合测试程序的教学模型：固定 seed 的 1000 颗虚拟 DUT、4 个 Site、stop-on-fail 流程、
 * 动态 PAT 限值、UIS 抽样、时间 / UPH / COT、STDF 导出与往返校验。
 * 纯函数、无 DOM、不含界面文字。数值全部是教学示意，不对应任何真实器件。
 */
import { cpkOf, FLAG_TEST_FAIL, meanSd, mulberry32, parseStdf, encodeFile, STDF_VERSION, summarizeStdf, validateSequence, type RecordInput } from '../gen/model/stdf'
import { cotCents, uph, type MsParams } from '../gen/model/multisite'
import { dynamicPatLimits } from '../qual/core/pat'
import { pulseHeating, rdsErrorFromRise, type ZthModel } from './core/thermal'

/* ---------------- 群体与 Site ---------------- */

export const N_DUT = 1000
export const N_SITES = 4
/** 固定 seed：同一 seed 永远得到同一批 DUT，流程改动前后可以直接比较 */
export const SEED = 2026
/** 器件本身有缺陷的比例 */
export const DEFECT_RATE = 0.1
/** Site 3 的接触不良比例（其余 Site 的比例） */
export const SITE_BAD = 3
export const BAD_CONTACT_RATE_BAD_SITE = 0.3
export const BAD_CONTACT_RATE_OTHER = 0.02
/** 接触电阻经 sense 路径泄漏进 Rds(on) 读数的系数（mΩ / Ω，教学示意） */
export const RC_LEAK_MOHM_PER_OHM = 2

export type Defect = 'gate' | 'idss' | 'vth' | 'bv' | 'rds' | 'vsd' | 'latent' | 'marginal'

/** 器件缺陷的种类与权重（和为 100）。latent 静态测试全过，只有 UIS 能抓到 */
export const DEFECT_MIX: Array<{ kind: Defect; weight: number }> = [
  { kind: 'gate', weight: 15 },
  { kind: 'idss', weight: 10 },
  { kind: 'vth', weight: 15 },
  { kind: 'bv', weight: 10 },
  { kind: 'rds', weight: 15 },
  { kind: 'vsd', weight: 10 },
  { kind: 'latent', weight: 10 },
  { kind: 'marginal', weight: 15 },
]

export type Dut = {
  id: number
  site: number
  defect: Defect | null
  /** Kelvin 接触电阻（Ω） */
  rc: number
  vth: number
  /** Rds(on)，不含接触泄漏与自热（mΩ） */
  rds0: number
  igss: number
  idss: number
  bv: number
  vsd: number
  /** 决定这颗 DUT 是否被 UIS 抽中的随机数，0–1 */
  uisRoll: number
}

function gauss(rand: () => number): number {
  const u = Math.max(rand(), 1e-12)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function pickDefect(roll: number): Defect {
  let acc = 0
  for (const item of DEFECT_MIX) {
    acc += item.weight
    if (roll * 100 < acc) {
      return item.kind
    }
  }
  return DEFECT_MIX[DEFECT_MIX.length - 1].kind
}

/** 每颗 DUT 的随机数抽取次数固定，保证同一 seed 的群体完全可复现 */
export function makePopulation(seed: number, n: number): Dut[] {
  const rand = mulberry32(seed)
  const duts: Dut[] = []
  for (let i = 0; i < n; i += 1) {
    const site = (i % N_SITES) + 1
    const hasDefect = rand() < DEFECT_RATE
    const kindRoll = rand()
    const contactRoll = rand()
    const rcRoll = rand()
    const mag = rand()
    const gVth = gauss(rand)
    const gRds = gauss(rand)
    const gIgss = gauss(rand)
    const gIdss = gauss(rand)
    const gBv = gauss(rand)
    const gVsd = gauss(rand)
    const uisRoll = rand()

    const badContact = contactRoll < (site === SITE_BAD ? BAD_CONTACT_RATE_BAD_SITE : BAD_CONTACT_RATE_OTHER)
    const dut: Dut = {
      id: i + 1,
      site,
      defect: hasDefect ? pickDefect(kindRoll) : null,
      rc: badContact ? 1.5 + rcRoll : 0.2 + 0.2 * rcRoll,
      vth: 3 + 0.08 * gVth,
      rds0: 6 + 0.35 * gRds,
      igss: Math.abs(10 + 3 * gIgss),
      idss: Math.abs(1 + 0.3 * gIdss),
      bv: 120 + 2 * gBv,
      vsd: 0.8 + 0.02 * gVsd,
      uisRoll,
    }
    applyDefect(dut, mag)
    duts.push(dut)
  }
  return duts
}

/** 按缺陷种类改写参数；mag 在 0–1 之间，决定缺陷的严重程度 */
function applyDefect(d: Dut, mag: number) {
  if (d.defect === null) {
    return
  }
  switch (d.defect) {
    case 'gate':
      d.igss = 300 + 200 * mag
      break
    case 'idss':
      d.idss = 50 + 30 * mag
      break
    case 'vth':
      d.vth = mag < 0.5 ? 1.5 + 0.3 * mag : 4.5 + 0.3 * mag
      break
    case 'bv':
      d.bv = 85 + 10 * mag
      break
    case 'rds':
      d.rds0 = 14 + 4 * mag
      break
    case 'vsd':
      d.vsd = 1.5 + 0.2 * mag
      break
    case 'marginal':
      d.rds0 = 8.5 + mag
      break
    case 'latent':
      break
    default:
      break
  }
}

let cachedPopulation: Dut[] | null = null

/** 默认群体：按 SEED 生成一次并缓存 */
export function defaultPopulation(): Dut[] {
  if (cachedPopulation === null) {
    cachedPopulation = makePopulation(SEED, N_DUT)
  }
  return cachedPopulation
}

/* ---------------- 测试项与限值 ---------------- */

export type StepId = 'kelvin' | 'igss' | 'vth' | 'idss' | 'bvdss' | 'rds' | 'vsd' | 'uis'
export type StaticId = Exclude<StepId, 'uis'>

/** 规范表中的默认顺序：1 Kelvin、2 Igss、3 Vth、4 Idss、5 BVdss、6 Rds(on)、7 Vsd、8 抽样 UIS */
export const STEP_ORDER: StepId[] = ['kelvin', 'igss', 'vth', 'idss', 'bvdss', 'rds', 'vsd', 'uis']

/** 必测项：除抽样的 UIS 以外的全部步骤 */
export const MANDATORY_STEPS: StepId[] = ['kelvin', 'igss', 'vth', 'idss', 'bvdss', 'rds', 'vsd']

/** 失败 Bin（规范表）：Igss 与 Idss 都是 3 */
export const STEP_BIN: Record<StepId, number> = {
  kelvin: 2,
  igss: 3,
  vth: 6,
  idss: 3,
  bvdss: 4,
  rds: 5,
  vsd: 5,
  uis: 7,
}

/** 每项的测试时间（ms，教学示意）；UIS 耗时最长，并且只对被抽中的 DUT 执行 */
export const STEP_MS: Record<StepId, number> = {
  kelvin: 8,
  igss: 12,
  vth: 25,
  idss: 40,
  bvdss: 60,
  rds: 30,
  vsd: 15,
  uis: 450,
}

/** 限值（教学示例，以现行标准与各公司规程为准）；单位见 STEP_UNIT */
export const STEP_LIMIT: Record<StepId, { lo: number; hi: number }> = {
  kelvin: { lo: 0, hi: 1.0 },
  igss: { lo: 0, hi: 100 },
  vth: { lo: 2.0, hi: 4.0 },
  idss: { lo: 0, hi: 10 },
  bvdss: { lo: 100, hi: 1000 },
  rds: { lo: 0, hi: 10 },
  vsd: { lo: 0, hi: 1.2 },
  uis: { lo: 0.5, hi: 1.5 },
}

export const STEP_UNIT: Record<StepId, string> = {
  kelvin: 'OHM',
  igss: 'NA',
  vth: 'V',
  idss: 'UA',
  bvdss: 'V',
  rds: 'MOHM',
  vsd: 'V',
  uis: 'FLAG',
}

/** STDF 里的测试名（ASCII，不随界面语言变化） */
export const STEP_NAME: Record<StepId, string> = {
  kelvin: 'KELVIN',
  igss: 'IGSS',
  vth: 'VTH',
  idss: 'IDSS',
  bvdss: 'BVDSS',
  rds: 'RDS_ON',
  vsd: 'VSD',
  uis: 'UIS',
}

/** STDF 里的 Bin 名称（ASCII） */
export const BIN_NAME: Record<number, string> = {
  1: 'PASS',
  2: 'KELVIN',
  3: 'LEAK',
  4: 'BVDSS',
  5: 'RDS_VSD',
  6: 'VTH',
  7: 'UIS',
}

/* ---------------- 脉宽与自热 ---------------- */

/** 脉宽选项（µs）：顺序即显示顺序，默认取 [0] */
export const PULSE_ORDER = [300, 1000, 10000]

/** 教学热模型：两级 Foster 网络（K/W） */
export const ZTH_RDS: ZthModel = {
  stages: [
    { rth: 40, tau: 0.002 },
    { rth: 20, tau: 0.02 },
  ],
}
/** Rds 测试电流（A）与 Rds(on) 温度系数 α（每 K 的相对变化，教学示意） */
export const TEST_CURRENT_A = 10
export const RDS_ALPHA_PER_K = 0.005

export type Readings = Record<StaticId, number>

/** Rds(on) 读数 = 真值 + 接触泄漏 + 自热偏差（脉宽越长，温升越大，偏差越大） */
export function rdsReading(d: Dut, pulseUs: number): number {
  const pW = TEST_CURRENT_A * TEST_CURRENT_A * (d.rds0 / 1000)
  const dT = pulseHeating(pW, pulseUs * 1e-6, ZTH_RDS)
  const bias = d.rds0 * rdsErrorFromRise(RDS_ALPHA_PER_K, dT)
  return d.rds0 + RC_LEAK_MOHM_PER_OHM * d.rc + bias
}

export function readingsOf(d: Dut, pulseUs: number): Readings {
  return {
    kelvin: d.rc,
    igss: d.igss,
    vth: d.vth,
    idss: d.idss,
    bvdss: d.bv,
    rds: rdsReading(d, pulseUs),
    vsd: d.vsd,
  }
}

/* ---------------- 程序状态 ---------------- */

export type FlowStep = { id: StepId; enabled: boolean }
export type PatMode = 'off' | 'on'
export const PAT_ORDER: PatMode[] = ['off', 'on']

export type ProgramState = {
  steps: FlowStep[]
  pulseUs: number
  /** UIS 抽样率（%） */
  uisPct: number
  pat: PatMode
  /** PAT 限值的 k（σ 的倍数，示例值 3–8） */
  patK: number
}

/** 初始值：流程取规范表顺序并全部启用；脉宽、PAT 取 [0]；UIS 抽样 20 % */
export const DEFAULT_PROGRAM: ProgramState = {
  steps: STEP_ORDER.map((id) => ({ id, enabled: true })),
  pulseUs: PULSE_ORDER[0],
  uisPct: 20,
  pat: PAT_ORDER[0],
  patK: 5,
}

/** 教学的单颗测试时间预算（ms）：超过则说明测试时间不够用 */
export const TIME_BUDGET_MS = 500
/** 漏检目标（DPPM，教学示例） */
export const TARGET_DPPM = 5000

/* ---------------- 成本模型参数（教学示意） ---------------- */

const INDEX_S = 0.4
const PAR_S = 0.05
const C_BASE = 60
const C_PER_SITE = 4
const CH_TOTAL = 32
const CH_PER_DUT = 8

/* ---------------- 运行 ---------------- */

export type DutResult = {
  id: number
  site: number
  truthBad: boolean
  sampled: boolean
  /** 实际执行过的项目，按流程顺序 */
  ran: StepId[]
  failStep: StepId | null
  bin: number
  timeMs: number
  /** 每个执行过的项目的测得值（UIS 为 1 / 0） */
  values: Partial<Record<StepId, number>>
}

export type SiteStat = { site: number; n: number; kelvinFails: number; rdsMean: number }

export type ProgramSummary = {
  n: number
  passN: number
  yieldPct: number
  /** 失效 Bin 按数量从多到少排列 */
  pareto: Array<{ bin: number; count: number }>
  escapes: number
  overkill: number
  dppm: number
  avgMs: number
  budgetOk: boolean
  retest: number
  cpkRds: number | null
  cpkVth: number | null
  uph: number
  cotCents: number
  patLo: number
  patHi: number
  sites: SiteStat[]
}

export type ProgramResult = { results: DutResult[]; summary: ProgramSummary }

function stepPasses(id: StepId, value: number, patOn: boolean, pat: { lo: number; hi: number }): boolean {
  if (id === 'rds' && patOn && (value < pat.lo || value > pat.hi)) {
    return false
  }
  const lim = STEP_LIMIT[id]
  return value >= lim.lo && value <= lim.hi
}

function runOne(d: Dut, r: Readings, flow: StepId[], state: ProgramState, pat: { lo: number; hi: number }): DutResult {
  const sampled = d.uisRoll < state.uisPct / 100
  const ran: StepId[] = []
  const values: Partial<Record<StepId, number>> = {}
  let timeMs = 0
  let failStep: StepId | null = null
  for (const id of flow) {
    if (id === 'uis' && !sampled) {
      continue
    }
    ran.push(id)
    timeMs += STEP_MS[id]
    const value = id === 'uis' ? (d.defect === 'latent' ? 0 : 1) : r[id]
    values[id] = value
    if (!stepPasses(id, value, state.pat === 'on', pat)) {
      failStep = id
      break
    }
  }
  return {
    id: d.id,
    site: d.site,
    truthBad: d.defect !== null,
    sampled,
    ran,
    failStep,
    bin: failStep === null ? 1 : STEP_BIN[failStep],
    timeMs,
    values,
  }
}

function valuesOf(results: DutResult[], id: StepId): number[] {
  const out: number[] = []
  for (const r of results) {
    const v = r.values[id]
    if (v !== undefined) {
      out.push(v)
    }
  }
  return out
}

/** 运行测试程序：流程、PAT、统计与成本。同一 state 与群体的结果完全相同 */
export function runProgram(state: ProgramState, duts: Dut[] = defaultPopulation()): ProgramResult {
  const readings = duts.map((d) => readingsOf(d, state.pulseUs))
  const pat = dynamicPatLimits(
    readings.map((r) => r.rds),
    state.patK,
  )
  const flow = state.steps.filter((s) => s.enabled).map((s) => s.id)
  const results = duts.map((d, i) => runOne(d, readings[i], flow, state, pat))
  return { results, summary: summarize(results, pat) }
}

function summarize(results: DutResult[], pat: { lo: number; hi: number }): ProgramSummary {
  const n = results.length
  const passN = results.filter((r) => r.bin === 1).length
  const binCount = new Map<number, number>()
  for (const r of results) {
    if (r.bin !== 1) {
      binCount.set(r.bin, (binCount.get(r.bin) ?? 0) + 1)
    }
  }
  const pareto = [...binCount.entries()]
    .map(([bin, count]) => ({ bin, count }))
    .sort((a, b) => b.count - a.count || a.bin - b.bin)
  const escapes = results.filter((r) => r.truthBad && r.bin === 1).length
  const overkill = results.filter((r) => !r.truthBad && r.bin !== 1).length
  const avgMs = n > 0 ? results.reduce((sum, r) => sum + r.timeMs, 0) / n : 0
  const kelvinFailN = results.filter((r) => r.failStep === 'kelvin').length
  const retest = n > 0 ? kelvinFailN / n : 0

  const params: MsParams = {
    indexS: INDEX_S,
    parS: PAR_S,
    serS: avgMs / 1000,
    retest,
    cBase: C_BASE,
    cPerSite: C_PER_SITE,
    chTotal: CH_TOTAL,
    chPerDut: CH_PER_DUT,
  }

  const sites: SiteStat[] = []
  for (let s = 1; s <= N_SITES; s += 1) {
    const rows = results.filter((r) => r.site === s)
    sites.push({
      site: s,
      n: rows.length,
      kelvinFails: rows.filter((r) => r.failStep === 'kelvin').length,
      rdsMean: meanSd(valuesOf(rows, 'rds')).mean,
    })
  }

  return {
    n,
    passN,
    yieldPct: n > 0 ? (passN / n) * 100 : 0,
    pareto,
    escapes,
    overkill,
    dppm: passN > 0 ? (escapes / passN) * 1e6 : 0,
    avgMs,
    budgetOk: avgMs <= TIME_BUDGET_MS,
    retest,
    cpkRds: cpkOf(valuesOf(results, 'rds'), null, STEP_LIMIT.rds.hi),
    cpkVth: cpkOf(valuesOf(results, 'vth'), STEP_LIMIT.vth.lo, STEP_LIMIT.vth.hi),
    uph: uph(params, N_SITES),
    cotCents: cotCents(params, N_SITES),
    patLo: pat.lo,
    patHi: pat.hi,
    sites,
  }
}

/* ---------------- STDF 导出与往返校验 ---------------- */

/** 把运行结果写成 STDF 记录序列：FAR、MIR、每颗 DUT 的 PIR / PTR / PRR，然后 PCR、HBR、MRR */
export function toStdfRecords(result: ProgramResult): RecordInput[] {
  const records: RecordInput[] = [
    { name: 'FAR', fields: { STDF_VER: STDF_VERSION } },
    {
      name: 'MIR',
      fields: {
        SETUP_T: 1761300000,
        START_T: 1761300060,
        STAT_NUM: 1,
        MODE_COD: 'P',
        LOT_ID: 'LOT-PWR08',
        PART_TYP: 'VDUT-MOS1',
        NODE_NAM: 'ATE-SIM',
        TSTR_TYP: 'SIM-ATE',
        JOB_NAM: 'PWR08_FT',
      },
    },
  ]
  for (const r of result.results) {
    records.push({ name: 'PIR', fields: { HEAD_NUM: 1, SITE_NUM: r.site } })
    for (const id of r.ran) {
      const failed = r.failStep === id
      records.push({
        name: 'PTR',
        fields: {
          TEST_NUM: STEP_ORDER.indexOf(id) + 101,
          HEAD_NUM: 1,
          SITE_NUM: r.site,
          TEST_FLG: failed ? FLAG_TEST_FAIL : 0,
          PARM_FLG: 0,
          RESULT: r.values[id] ?? 0,
          TEST_TXT: STEP_NAME[id],
          ALARM_ID: '',
          OPT_FLAG: 0,
          RES_SCAL: 0,
          LLM_SCAL: 0,
          HLM_SCAL: 0,
          LO_LIMIT: STEP_LIMIT[id].lo,
          HI_LIMIT: STEP_LIMIT[id].hi,
          UNITS: STEP_UNIT[id],
        },
      })
    }
    records.push({
      name: 'PRR',
      fields: {
        HEAD_NUM: 1,
        SITE_NUM: r.site,
        PART_FLG: 0,
        NUM_TEST: r.ran.length,
        HARD_BIN: r.bin,
        SOFT_BIN: r.bin,
        X_COORD: 0,
        Y_COORD: 0,
        TEST_T: Math.round(r.timeMs),
        PART_ID: `P${String(r.id).padStart(4, '0')}`,
        PART_TXT: '',
      },
    })
  }
  const counts = binCounts(result.results)
  const passN = counts.get(1) ?? 0
  records.push({
    name: 'PCR',
    fields: { HEAD_NUM: 255, SITE_NUM: 255, PART_CNT: result.results.length, RTST_CNT: 0, ABRT_CNT: 0, GOOD_CNT: passN, FUNC_CNT: result.results.length },
  })
  for (const [bin, count] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
    records.push({
      name: 'HBR',
      fields: { HEAD_NUM: 255, SITE_NUM: 255, HBIN_NUM: bin, HBIN_CNT: count, HBIN_PF: bin === 1 ? 'P' : 'F', HBIN_NAM: BIN_NAME[bin] ?? 'UNKNOWN' },
    })
  }
  records.push({ name: 'MRR', fields: { FINISH_T: 1761300900, DISP_COD: 'C', USR_DESC: '' } })
  return records
}

function binCounts(results: DutResult[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const r of results) {
    map.set(r.bin, (map.get(r.bin) ?? 0) + 1)
  }
  return map
}

/**
 * 导出并回读：编码成 STDF 字节，再用 GEN-01 的解析器读回。
 * binsMatch 表示读回的 Bin 计数与仿真结果完全一致；issues 是顺序校验的问题数。
 */
export function exportCheck(result: ProgramResult): { bytes: Uint8Array; partN: number; binsMatch: boolean; issues: number } {
  const records = toStdfRecords(result)
  const bytes = encodeFile(records, true)
  const summary = summarizeStdf(parseStdf(bytes))
  const expected = binCounts(result.results)
  const binsMatch =
    summary.partN === result.results.length &&
    summary.hardBins.length === expected.size &&
    summary.hardBins.every((row) => expected.get(row.bin) === row.count)
  return { bytes, partN: summary.partN, binsMatch, issues: validateSequence(records).length }
}
