/**
 * api.ts — ATE 模拟器引擎的类型门面
 *
 * 引擎（engine/*.js）是从独立的 ATESim 项目原样搬过来的纯 JS：不访问 DOM、
 * 所有数值来自共享规格表，固定种子可复现。这里只做三件事：
 * 1. 按依赖顺序加载引擎（rng → dut → instruments → tests → flow → lot → scenarios）；
 * 2. 给界面用得着的 API 补上类型；
 * 3. 提供与语言无关的格式化 / 运行小工具（带文案的格式化在 text 里）。
 */
import './engine/rng.js'
import './engine/dut.js'
import './engine/instruments.js'
import './engine/tests.js'
import './engine/flow.js'
import './engine/lot.js'
import './engine/scenarios.js'

export type Bin = 1 | 2 | 3 | 4 | 5 | 6

export type ProgramItem = {
  order: number
  id: string
  name: string
  cname: string
  condition: string
  unit: string
  nominal: number
  sigma: number
  digits: number
  lsl: number | null
  usl: number | null
  bin: Bin
  timeMs: number
  enabled: boolean
  kind: string
}

export type PinReading = { name: string; value: number; pass: boolean }

export type TestResult = {
  id: string
  name: string
  cname: string
  condition: string
  unit: string
  digits: number
  value: number
  lsl: number | null
  usl: number | null
  bin: Bin
  pass: boolean
  timeMs: number
  detail: {
    pins?: PinReading[]
    worstPin?: string
    failPins?: string[]
    IIL?: number
    IIH?: number
    worst?: string
  }
}

export type FlowResult = {
  dieIndex: number
  bin: Bin
  pass: boolean
  results: TestResult[]
  timeMs: number
  failItem: string | null
  testedItems: number
}

export type Die = {
  index: number
  wafer: number
  x: number
  y: number
  process: number
  inCluster: boolean
  trueGood: boolean
  defects: Record<string, boolean>
  pins: Array<{ name: string; v: number }>
  true: {
    continuity: number
    iil: number
    iih: number
    voh: number
    vol: number
    iddDyn: number
    iddStdby: number
    fmax: number
  }
}

export type DieRecord = {
  index: number
  wafer: number
  x: number
  y: number
  bin: Bin
  firstBin: Bin
  trueGood: boolean
  process: number
  attempts: number
  timeMs: number
  retestTimeMs: number
  failItem: string | null
  values: Record<string, number>
  passes: Record<string, boolean>
}

export type ItemStats = {
  id: string
  name: string
  cname: string
  unit: string
  digits: number
  lsl: number | null
  usl: number | null
  enabled: boolean
  mean: number
  sigma: number
  min: number
  max: number
  tested: number
  failed: number
  passRate: number | null
  cpk: number
  values: number[]
}

export type LotStats = {
  total: number
  count: number
  good: number
  yieldPct: number
  firstPassYieldPct: number
  retestRecovered: number
  retest: number
  binCounts: Record<string, number>
  binPct: Record<string, number>
  binByItem: Record<string, number>
  items: ItemStats[]
  avgTimeMs: number
  retestExtraMs: number
  totalTimeMs: number
  overkill: number
  overkillPct: number
  underkill: number
  underkillPct: number
  trueGoodCount: number
  trueBadCount: number
  wafers: Array<{ wafer: number; dice: DieRecord[] }>
  records: DieRecord[]
  elapsedMs?: number
}

export type LotProgress = { done: number; total: number; yieldPct: number }

export type LotRequest = {
  count: number
  seed: number
  program: ProgramItem[]
  config: Record<string, unknown>
  instrumentConfig: Record<string, number>
  stopOnFirstFail: boolean
  retest: number
  chunk?: number
}

export type LimitOverride = { lsl?: number | null; usl?: number | null }

export type ScenarioCorrect = {
  mode?: 'choice' | 'text' | 'none'
  rootCause?: string
  action?: string
  rootCauseText?: string
  rootCauseKeys?: string[]
  actionText?: string
  actionKeys?: string[]
}

export type ScenarioSetup = {
  config: Record<string, unknown>
  instrumentConfig: Record<string, number>
  limits: Record<string, LimitOverride>
  describe: string
  seed?: number
}

export type Scenario = {
  id: string
  name: string
  tag: string
  brief: string
  task: string
  hint: string
  setup: ScenarioSetup
  correct: ScenarioCorrect
  explanation: string
  isCustom?: boolean
  batch?: { count: number; retest: number; seed: number }
}

export type CustomDef = {
  id: string | null
  name: string
  brief: string
  defectRates: Record<string, number>
  shift: Record<string, number>
  instrument: { contactR: number; contactVar: number; contactDrift: number; noiseScale: number }
  limits: Record<string, { lsl: number | null; usl: number | null }>
  answer: {
    mode?: string
    rootCause: string
    rootCauseText: string
    rootCauseKeys: string[]
    action: string
    actionText: string
    actionKeys: string[]
    explanation: string
  }
  batch: { count: number; retest: number; seed: number }
}

export type GradeResult = {
  mode: string
  rootCorrect: boolean
  actionCorrect: boolean
  level: 'full' | 'partial' | 'none'
  rootHit: { hits: number; hitKeys: string[]; total: number; ratio: number } | null
  actionHit: { hits: number; hitKeys: string[]; total: number; ratio: number } | null
}

type Engine = {
  Rng: {
    mixSeed: (seed: number, index: number) => number
    summarize: (values: number[]) => {
      count: number
      mean: number
      sd: number
      min: number
      max: number
      p1: number
      p50: number
      p99: number
    }
    cpk: (mu: number, sigma: number, lsl: number | null, usl: number | null) => number
    histogram: (
      values: number[],
      bins?: number,
      min?: number | null,
      max?: number | null,
    ) => { edges: number[]; counts: number[]; centers: number[]; binWidth: number; max: number }
    fmt: (v: number, digits?: number) => string
  }
  DUT: {
    SPEC: Record<string, { nominal: number; sigma: number; lsl: number | null; usl: number | null; bin: Bin; unit: string; digits: number }>
    generateDie: (seed: number, config: Record<string, unknown>, index: number) => Die
    waferPositions: (target: number) => Array<{ x: number; y: number }>
  }
  Instruments: {
    createInstruments: (config: Record<string, number>, seed: number) => {
      beginTouch: (dieIndex: number, total: number) => number
      contactR: number
    }
  }
  Tests: {
    createProgram: () => ProgramItem[]
    findItem: (program: ProgramItem[], id: string) => ProgramItem | null
    judge: (value: number, lsl: number | null, usl: number | null) => boolean
    margin: (value: number, lsl: number | null, usl: number | null) => number
  }
  Flow: { run: (die: Die, program: ProgramItem[], options: Record<string, unknown>) => FlowResult }
  Lot: {
    lotSteps: (request: LotRequest) => Generator<LotProgress, { records: DieRecord[]; stats: LotStats; request: LotRequest }, void>
    runLot: (request: LotRequest) => { records: DieRecord[]; stats: LotStats; request: LotRequest }
    toCSV: (stats: LotStats) => string
  }
  Scenarios: {
    SCENARIOS: Scenario[]
    OPTIONS: {
      rootCause: Array<{ id: string; label: string; keys: string[] }>
      action: Array<{ id: string; label: string; keys: string[] }>
    }
    CUSTOM_TEMPLATES: Array<{ id: string; label: string; def: Record<string, unknown> }>
    getScenario: (id: string) => Scenario | null
    buildSetup: (scenario: Scenario) => {
      program: ProgramItem[]
      config: Record<string, unknown>
      instrumentConfig: Record<string, number>
      seed: number
    }
    grade: (scenario: Scenario, rootCause: unknown, action?: unknown) => GradeResult
    sanitizeCustom: (def: unknown) => CustomDef
    validateCustom: (def: unknown) => { ok: boolean; errors: string[]; def: CustomDef }
    splitKeys: (value: unknown) => string[]
    deriveKeys: (text: string) => string[]
    getCustomTemplate: (id: string) => Record<string, unknown> | null
  }
}

const ATE = (globalThis as unknown as { ATE: Engine }).ATE

export { ATE }

/** createProgram：默认测试程序（限值来自共享规格表） */
export function createProgram(): ProgramItem[] {
  return ATE.Tests.createProgram()
}

/** findItem：按 id 取测试项 */
export function findItem(program: ProgramItem[], id: string): ProgramItem | null {
  return ATE.Tests.findItem(program, id)
}

/** binNumbers：界面上固定展示的 Bin 顺序 */
export const BIN_ORDER: Bin[] = [1, 2, 3, 4, 5, 6]

/** runDie：测一颗 die（单颗页用；与批量页的落针方式一致） */
export function runDie(
  index: number,
  seed: number,
  program: ProgramItem[],
  config: Record<string, unknown>,
  instrumentConfig: Record<string, number>,
  stopOnFirstFail: boolean,
): { die: Die; result: FlowResult } {
  const die = ATE.DUT.generateDie(seed, config, index)
  const inst = ATE.Instruments.createInstruments(instrumentConfig, ATE.Rng.mixSeed(seed, index * 31 + 7))
  inst.beginTouch(index, 500)
  const result = ATE.Flow.run(die, program, { instruments: inst, stopOnFirstFail })
  return { die, result }
}

/** createLotSteps：批量运行生成器（界面按帧推进，避免卡死） */
export function createLotSteps(request: LotRequest) {
  return ATE.Lot.lotSteps(request)
}

/** runLot：同步跑完一个 lot */
export function runLot(request: LotRequest) {
  return ATE.Lot.runLot(request)
}

/** lotToCsv：逐颗数据导出 CSV */
export function lotToCsv(stats: LotStats): string {
  return ATE.Lot.toCSV(stats)
}

/** waferPositions：一片 wafer 上 die 的坐标（−0.94…0.94） */
export function waferPositions(count: number): Array<{ x: number; y: number }> {
  return ATE.DUT.waferPositions(count)
}

/** histogram：等宽分箱 */
export function histogram(values: number[], bins: number, min?: number | null, max?: number | null) {
  return ATE.Rng.histogram(values, bins, min, max)
}

/** cpk：单边/双边规格的过程能力 */
export function cpk(mu: number, sigma: number, lsl: number | null, usl: number | null): number {
  return ATE.Rng.cpk(mu, sigma, lsl, usl)
}

/** fmtVal：按精度格式化测量值，NaN → — */
export function fmtVal(value: number | null | undefined, digits = 3): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return Number(value.toFixed(digits)).toString()
}

/** fmtNum：去掉多余小数位（留空 → 空字符串） */
export function fmtNum(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return Number(value.toFixed(digits)).toString()
}

/** pct：0.015 → "1.5%" */
export function pct(value: number, digits = 2): string {
  return fmtNum(value * 100, digits) + '%'
}

/** download：触发浏览器下载 */
export function download(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** readTextFile：读一个本地文本文件（导入 JSON 用） */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read error'))
    reader.readAsText(file, 'utf-8')
  })
}
