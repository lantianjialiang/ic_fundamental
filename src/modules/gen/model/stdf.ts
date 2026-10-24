// STDF V4 教学子集：写出、读取（大小端自动识别）、示例批次生成、统计与顺序校验。
// 纯函数、无 DOM、不含界面文字；界面文字由页面层按 code 用 loc() 映射。
// 记录名、字段名保持英文，与文件内容一致，不随界面语言变化。
// 字段布局对照 STDF V4 规范（FAR / MIR / PIR / PTR / PRR / PCR / HBR / SBR / MRR）。
// 注意：本子集没有实现 WIR/WRR、FTR、MPR、ATR 等记录；读取时它们按“未知记录”整段跳过。

export type FieldType = 'U1' | 'U2' | 'U4' | 'I1' | 'I2' | 'R4' | 'B1' | 'C1' | 'Cn'

export type FieldDef = { name: string; type: FieldType }

export type RecordName = 'FAR' | 'MIR' | 'MRR' | 'PCR' | 'HBR' | 'SBR' | 'PIR' | 'PRR' | 'PTR'

type RecordDef = { typ: number; sub: number; fields: FieldDef[] }

const f = (name: string, type: FieldType): FieldDef => ({ name, type })

/** 记录定义：REC_TYP / REC_SUB 与字段顺序。尾部字段可省略，规范允许。 */
export const RECORD_DEFS: Record<RecordName, RecordDef> = {
  FAR: { typ: 0, sub: 10, fields: [f('CPU_TYPE', 'U1'), f('STDF_VER', 'U1')] },
  MIR: {
    typ: 1,
    sub: 10,
    fields: [
      f('SETUP_T', 'U4'),
      f('START_T', 'U4'),
      f('STAT_NUM', 'U1'),
      f('MODE_COD', 'C1'),
      f('RTST_COD', 'C1'),
      f('PROT_COD', 'C1'),
      f('BURN_TIM', 'U2'),
      f('CMOD_COD', 'C1'),
      f('LOT_ID', 'Cn'),
      f('PART_TYP', 'Cn'),
      f('NODE_NAM', 'Cn'),
      f('TSTR_TYP', 'Cn'),
      f('JOB_NAM', 'Cn'),
    ],
  },
  MRR: { typ: 1, sub: 20, fields: [f('FINISH_T', 'U4'), f('DISP_COD', 'C1'), f('USR_DESC', 'Cn')] },
  PCR: {
    typ: 1,
    sub: 30,
    fields: [f('HEAD_NUM', 'U1'), f('SITE_NUM', 'U1'), f('PART_CNT', 'U4'), f('RTST_CNT', 'U4'), f('ABRT_CNT', 'U4'), f('GOOD_CNT', 'U4'), f('FUNC_CNT', 'U4')],
  },
  HBR: {
    typ: 1,
    sub: 40,
    fields: [f('HEAD_NUM', 'U1'), f('SITE_NUM', 'U1'), f('HBIN_NUM', 'U2'), f('HBIN_CNT', 'U4'), f('HBIN_PF', 'C1'), f('HBIN_NAM', 'Cn')],
  },
  SBR: {
    typ: 1,
    sub: 50,
    fields: [f('HEAD_NUM', 'U1'), f('SITE_NUM', 'U1'), f('SBIN_NUM', 'U2'), f('SBIN_CNT', 'U4'), f('SBIN_PF', 'C1'), f('SBIN_NAM', 'Cn')],
  },
  PIR: { typ: 5, sub: 10, fields: [f('HEAD_NUM', 'U1'), f('SITE_NUM', 'U1')] },
  PRR: {
    typ: 5,
    sub: 20,
    fields: [
      f('HEAD_NUM', 'U1'),
      f('SITE_NUM', 'U1'),
      f('PART_FLG', 'B1'),
      f('NUM_TEST', 'U2'),
      f('HARD_BIN', 'U2'),
      f('SOFT_BIN', 'U2'),
      f('X_COORD', 'I2'),
      f('Y_COORD', 'I2'),
      f('TEST_T', 'U4'),
      f('PART_ID', 'Cn'),
      f('PART_TXT', 'Cn'),
    ],
  },
  PTR: {
    typ: 15,
    sub: 10,
    fields: [
      f('TEST_NUM', 'U4'),
      f('HEAD_NUM', 'U1'),
      f('SITE_NUM', 'U1'),
      f('TEST_FLG', 'B1'),
      f('PARM_FLG', 'B1'),
      f('RESULT', 'R4'),
      f('TEST_TXT', 'Cn'),
      f('ALARM_ID', 'Cn'),
      f('OPT_FLAG', 'B1'),
      f('RES_SCAL', 'I1'),
      f('LLM_SCAL', 'I1'),
      f('HLM_SCAL', 'I1'),
      f('LO_LIMIT', 'R4'),
      f('HI_LIMIT', 'R4'),
      f('UNITS', 'Cn'),
    ],
  },
}

/** FAR 的 CPU_TYPE：2 = IBM PC 系（小端），1 = Sun（大端）；见规范 FAR 节 */
export const CPU_TYPE_LE = 2
export const CPU_TYPE_BE = 1
export const STDF_VERSION = 4
/** TEST_FLG 的 bit 7：1 = 测试失败；bit 6 = 0 表示 pass/fail 有效 */
export const FLAG_TEST_FAIL = 0x80
/** OPT_FLAG 的 bit 6 / bit 7：1 = 没有低限 / 没有高限 */
const OPT_NO_LO = 0x40
const OPT_NO_HI = 0x80

const FIELD_SIZE: Record<Exclude<FieldType, 'Cn' | 'C1'>, number> = {
  U1: 1,
  U2: 2,
  U4: 4,
  I1: 1,
  I2: 2,
  R4: 4,
  B1: 1,
}

export type RecordInput = { name: RecordName; fields: Record<string, number | string> }

function asciiBytes(text: string): number[] {
  return Array.from(text, (ch) => ch.charCodeAt(0) & 0x7f)
}

function encodeField(def: FieldDef, value: number | string | undefined, le: boolean): number[] {
  const type = def.type
  if (type === 'Cn') {
    const bytes = asciiBytes(typeof value === 'string' ? value : '').slice(0, 255)
    return [bytes.length, ...bytes]
  }
  if (type === 'C1') {
    const text = typeof value === 'string' ? value : ''
    return [text.length > 0 ? text.charCodeAt(0) & 0x7f : 0x20]
  }
  const num = typeof value === 'number' ? value : 0
  const view = new DataView(new ArrayBuffer(FIELD_SIZE[type]))
  switch (type) {
    case 'U1':
    case 'B1':
      view.setUint8(0, num)
      break
    case 'U2':
      view.setUint16(0, num, le)
      break
    case 'U4':
      view.setUint32(0, num, le)
      break
    case 'I1':
      view.setInt8(0, num)
      break
    case 'I2':
      view.setInt16(0, num, le)
      break
    case 'R4':
      view.setFloat32(0, num, le)
      break
    default:
      break
  }
  return Array.from(new Uint8Array(view.buffer))
}

/**
 * 把记录序列写成 STDF 字节流。
 * 写出端用自己的字节序（le = true 为小端），并在 FAR 里写 CPU_TYPE，读取端据此转换。
 */
export function encodeFile(records: RecordInput[], le = true): Uint8Array {
  const out: number[] = []
  for (const rec of records) {
    const def = RECORD_DEFS[rec.name]
    const payload: number[] = []
    for (const field of def.fields) {
      const isCpu = rec.name === 'FAR' && field.name === 'CPU_TYPE'
      const value = isCpu ? (le ? CPU_TYPE_LE : CPU_TYPE_BE) : rec.fields[field.name]
      payload.push(...encodeField(field, value, le))
    }
    const len = payload.length
    const lenBytes = le ? [len & 0xff, (len >> 8) & 0xff] : [(len >> 8) & 0xff, len & 0xff]
    out.push(...lenBytes, def.typ, def.sub, ...payload)
  }
  return Uint8Array.from(out)
}

export type ParsedField = {
  id: number
  record: number
  name: string
  type: string
  offset: number
  size: number
  value: number | string
}

export type ParsedRecord = {
  index: number
  name: string
  typ: number
  sub: number
  offset: number
  length: number
  known: boolean
  broken: boolean
  fields: ParsedField[]
}

export type ParseErrorCode = 'EMPTY' | 'NOT_FAR' | 'TRUNCATED_HEADER' | 'TRUNCATED_RECORD' | 'FIELD_OVERRUN'

export type ParseError = { code: ParseErrorCode; offset: number }

export type ParseResult = {
  /** true = 小端，false = 大端，null = 无法识别（文件开头不是 FAR） */
  le: boolean | null
  records: ParsedRecord[]
  fields: ParsedField[]
  errors: ParseError[]
}

const KNOWN: Map<number, RecordName> = new Map(
  (Object.keys(RECORD_DEFS) as RecordName[]).map((name) => [RECORD_DEFS[name].typ * 256 + RECORD_DEFS[name].sub, name]),
)

/**
 * 字节序识别：FAR 的 REC_LEN 恒为 2、REC_TYP = 0、REC_SUB = 10。
 * 开头是 02 00 → 小端；00 02 → 大端；其它 → 无法识别。
 */
export function detectByteOrder(bytes: Uint8Array): boolean | null {
  if (bytes.length < 4) {
    return null
  }
  const farTag = bytes[2] === 0 && bytes[3] === 10
  if (farTag && bytes[0] === 2 && bytes[1] === 0) {
    return true
  }
  if (farTag && bytes[0] === 0 && bytes[1] === 2) {
    return false
  }
  return null
}

function addField(
  result: ParseResult,
  record: ParsedRecord,
  name: string,
  type: string,
  offset: number,
  size: number,
  value: number | string,
) {
  const field: ParsedField = { id: result.fields.length, record: record.index, name, type, offset, size, value }
  result.fields.push(field)
  record.fields.push(field)
}

function decodeValue(type: FieldType, bytes: Uint8Array, view: DataView, p: number, size: number, le: boolean): number | string {
  if (type === 'Cn') {
    return String.fromCharCode(...bytes.subarray(p + 1, p + size))
  }
  if (type === 'C1') {
    return String.fromCharCode(bytes[p])
  }
  switch (type) {
    case 'U1':
    case 'B1':
      return view.getUint8(p)
    case 'U2':
      return view.getUint16(p, le)
    case 'U4':
      return view.getUint32(p, le)
    case 'I1':
      return view.getInt8(p)
    case 'I2':
      return view.getInt16(p, le)
    case 'R4':
      return view.getFloat32(p, le)
    default:
      return 0
  }
}

function parsePayload(
  result: ParseResult,
  record: ParsedRecord,
  bytes: Uint8Array,
  view: DataView,
  le: boolean,
  start: number,
  end: number,
  defs: FieldDef[],
) {
  let p = start
  for (const def of defs) {
    if (p >= end) {
      break
    }
    const size = def.type === 'Cn' ? 1 + bytes[p] : def.type === 'C1' ? 1 : FIELD_SIZE[def.type]
    if (p + size > end) {
      record.broken = true
      result.errors.push({ code: 'FIELD_OVERRUN', offset: p })
      p = end
      break
    }
    addField(result, record, def.name, def.type, p, size, decodeValue(def.type, bytes, view, p, size, le))
    p += size
  }
  if (p < end) {
    addField(result, record, 'UNPARSED', 'raw', p, end - p, end - p)
  }
}

/** 读取 STDF 字节流：按记录头切分、按字节序解码字段；未知记录整段跳过，不报错 */
export function parseStdf(bytes: Uint8Array): ParseResult {
  const result: ParseResult = { le: null, records: [], fields: [], errors: [] }
  if (bytes.length === 0) {
    result.errors.push({ code: 'EMPTY', offset: 0 })
    return result
  }
  const le = detectByteOrder(bytes)
  if (le === null) {
    result.errors.push({ code: 'NOT_FAR', offset: 0 })
    return result
  }
  result.le = le
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let pos = 0
  while (pos < bytes.length) {
    if (pos + 4 > bytes.length) {
      result.errors.push({ code: 'TRUNCATED_HEADER', offset: pos })
      break
    }
    const length = view.getUint16(pos, le)
    const typ = bytes[pos + 2]
    const sub = bytes[pos + 3]
    const end = pos + 4 + length
    if (end > bytes.length) {
      result.errors.push({ code: 'TRUNCATED_RECORD', offset: pos })
      break
    }
    const name = KNOWN.get(typ * 256 + sub)
    const record: ParsedRecord = {
      index: result.records.length,
      name: name ?? `REC_${typ}_${sub}`,
      typ,
      sub,
      offset: pos,
      length,
      known: name !== undefined,
      broken: false,
      fields: [],
    }
    result.records.push(record)
    addField(result, record, 'REC_LEN', 'U2', pos, 2, length)
    addField(result, record, 'REC_TYP', 'U1', pos + 2, 1, typ)
    addField(result, record, 'REC_SUB', 'U1', pos + 3, 1, sub)
    if (name === undefined) {
      addField(result, record, 'DATA', 'raw', pos + 4, length, length)
    } else {
      parsePayload(result, record, bytes, view, le, pos + 4, end, RECORD_DEFS[name].fields)
    }
    pos = end
  }
  return result
}

/* ------------------------------------------------------------------ */
/* 统计：Part 级（PIR→PTR→PRR 一组）与 Test 级（每个 PTR）             */
/* ------------------------------------------------------------------ */

export type TestResult = { num: number; site: number; failed: boolean; value: number; name: string; unit: string; lo: number | null; hi: number | null }

export type PartRow = {
  partId: string
  head: number
  site: number
  hardBin: number
  softBin: number
  results: TestResult[]
}

export type BinCount = { bin: number; count: number; name: string }

export type TestStat = {
  num: number
  name: string
  unit: string
  lo: number | null
  hi: number | null
  values: number[]
  failN: number
  mean: number
  sd: number
  cpk: number | null
}

export type SiteStat = { site: number; n: number; fails: number; means: Record<number, number> }

export type LotSummary = {
  lotId: string
  partType: string
  partN: number
  passN: number
  failN: number
  yieldRatio: number
  hardBins: BinCount[]
  tests: TestStat[]
  sites: SiteStat[]
  parts: PartRow[]
}

function valueOf(rec: ParsedRecord, name: string): number | string | undefined {
  const field = rec.fields.find((item) => item.name === name)
  return field?.value
}

function numOf(rec: ParsedRecord, name: string): number {
  const value = valueOf(rec, name)
  return typeof value === 'number' ? value : 0
}

function strOf(rec: ParsedRecord, name: string): string {
  const value = valueOf(rec, name)
  return typeof value === 'string' ? value : ''
}

/** 样本均值与样本标准差（n−1） */
export function meanSd(values: number[]): { mean: number; sd: number } {
  const n = values.length
  if (n === 0) {
    return { mean: 0, sd: 0 }
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / n
  if (n < 2) {
    return { mean, sd: 0 }
  }
  const ss = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0)
  return { mean, sd: Math.sqrt(ss / (n - 1)) }
}

/** Cpk = min(USL − μ, μ − LSL) / (3σ)；只有一侧限值时只算那一侧；σ = 0 或样本太少返回 null */
export function cpkOf(values: number[], lo: number | null, hi: number | null): number | null {
  if (values.length < 2) {
    return null
  }
  const { mean, sd } = meanSd(values)
  if (!(sd > 0)) {
    return null
  }
  const terms: number[] = []
  if (hi !== null) {
    terms.push((hi - mean) / (3 * sd))
  }
  if (lo !== null) {
    terms.push((mean - lo) / (3 * sd))
  }
  if (terms.length === 0) {
    return null
  }
  return Math.min(...terms)
}

/** 把一组测得值分进 bins 个等宽区间；超出 [lo, hi] 的值夹到边界格 */
export function histogram(values: number[], bins: number, lo: number, hi: number): number[] {
  const counts = new Array<number>(bins).fill(0)
  const width = (hi - lo) / bins
  if (!(width > 0)) {
    return counts
  }
  for (const v of values) {
    const raw = Math.floor((v - lo) / width)
    const idx = Math.min(bins - 1, Math.max(0, raw))
    counts[idx] += 1
  }
  return counts
}

/** 从已解析的记录流汇总出批次统计（数据只来自文件里的 PIR / PTR / PRR / HBR / MIR） */
export function summarizeStdf(parsed: ParseResult): LotSummary {
  let lotId = ''
  let partType = ''
  const hbrNames = new Map<number, string>()
  const parts: PartRow[] = []
  let current: { head: number; site: number; results: TestResult[] } | null = null

  for (const rec of parsed.records) {
    if (rec.name === 'MIR') {
      lotId = strOf(rec, 'LOT_ID')
      partType = strOf(rec, 'PART_TYP')
    } else if (rec.name === 'HBR') {
      hbrNames.set(numOf(rec, 'HBIN_NUM'), strOf(rec, 'HBIN_NAM'))
    } else if (rec.name === 'PIR') {
      current = { head: numOf(rec, 'HEAD_NUM'), site: numOf(rec, 'SITE_NUM'), results: [] }
    } else if (rec.name === 'PTR' && current) {
      const flg = numOf(rec, 'TEST_FLG')
      const opt = numOf(rec, 'OPT_FLAG')
      current.results.push({
        num: numOf(rec, 'TEST_NUM'),
        site: numOf(rec, 'SITE_NUM'),
        failed: (flg & FLAG_TEST_FAIL) !== 0,
        value: numOf(rec, 'RESULT'),
        name: strOf(rec, 'TEST_TXT'),
        unit: strOf(rec, 'UNITS'),
        lo: (opt & OPT_NO_LO) !== 0 ? null : numOf(rec, 'LO_LIMIT'),
        hi: (opt & OPT_NO_HI) !== 0 ? null : numOf(rec, 'HI_LIMIT'),
      })
    } else if (rec.name === 'PRR' && current) {
      parts.push({
        partId: strOf(rec, 'PART_ID'),
        head: current.head,
        site: numOf(rec, 'SITE_NUM'),
        hardBin: numOf(rec, 'HARD_BIN'),
        softBin: numOf(rec, 'SOFT_BIN'),
        results: current.results,
      })
      current = null
    }
  }

  const binMap = new Map<number, number>()
  for (const part of parts) {
    binMap.set(part.hardBin, (binMap.get(part.hardBin) ?? 0) + 1)
  }
  const hardBins: BinCount[] = [...binMap.keys()]
    .sort((a, b) => a - b)
    .map((bin) => ({ bin, count: binMap.get(bin) ?? 0, name: hbrNames.get(bin) ?? `BIN ${bin}` }))

  const testMap = new Map<number, { name: string; unit: string; lo: number | null; hi: number | null; values: number[]; failN: number }>()
  for (const part of parts) {
    for (const r of part.results) {
      let entry = testMap.get(r.num)
      if (!entry) {
        entry = { name: r.name, unit: r.unit, lo: r.lo, hi: r.hi, values: [], failN: 0 }
        testMap.set(r.num, entry)
      }
      entry.values.push(r.value)
      if (r.failed) {
        entry.failN += 1
      }
    }
  }
  const tests: TestStat[] = [...testMap.entries()].map(([num, e]) => {
    const { mean, sd } = meanSd(e.values)
    return { num, name: e.name, unit: e.unit, lo: e.lo, hi: e.hi, values: e.values, failN: e.failN, mean, sd, cpk: cpkOf(e.values, e.lo, e.hi) }
  })

  const siteMap = new Map<number, PartRow[]>()
  for (const part of parts) {
    const list = siteMap.get(part.site) ?? []
    list.push(part)
    siteMap.set(part.site, list)
  }
  const sites: SiteStat[] = [...siteMap.keys()]
    .sort((a, b) => a - b)
    .map((site) => {
      const list = siteMap.get(site) ?? []
      const means: Record<number, number> = {}
      for (const test of tests) {
        const vals = list.flatMap((part) => part.results.filter((r) => r.num === test.num).map((r) => r.value))
        means[test.num] = meanSd(vals).mean
      }
      return { site, n: list.length, fails: list.filter((part) => part.hardBin !== 1).length, means }
    })

  const partN = parts.length
  const passN = parts.filter((part) => part.hardBin === 1).length
  return {
    lotId,
    partType,
    partN,
    passN,
    failN: partN - passN,
    yieldRatio: partN > 0 ? passN / partN : 0,
    hardBins,
    tests,
    sites,
    parts,
  }
}

/* ------------------------------------------------------------------ */
/* 示例批次：仿真生成，不含真实客户数据                                 */
/* ------------------------------------------------------------------ */

export type LotTest = {
  num: number
  name: string
  unit: string
  lo: number
  hi: number
  mu: number
  sigma: number
  /** 注入失效时的测得值（必须落在限值外） */
  failValue: number
  hard: number
  soft: number
  hardName: string
  softName: string
}

/** 测试程序：VOH、IDD、IIL 三项。第一个失效项决定 Bin（即 first fail 原则）。 */
export const LOT_TESTS: LotTest[] = [
  { num: 1001, name: 'VOH', unit: 'V', lo: 2.4, hi: 3.6, mu: 3.3, sigma: 0.03, failValue: 2.25, hard: 2, soft: 21, hardName: 'VOH', softName: 'VOH_LOW' },
  { num: 1002, name: 'IDD', unit: 'mA', lo: 5, hi: 15, mu: 12, sigma: 0.8, failValue: 17.5, hard: 3, soft: 31, hardName: 'IDD', softName: 'IDD_HIGH' },
  { num: 1003, name: 'IIL', unit: 'uA', lo: -2, hi: 2, mu: 0.4, sigma: 0.15, failValue: 3, hard: 4, soft: 41, hardName: 'IIL', softName: 'IIL_HIGH' },
]

const VOH_NUM = 1001

/** 确定性伪随机数（mulberry32）：同一种子永远得到同一批数据 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rand: () => number): number {
  const u = Math.max(rand(), 1e-12)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export type LotConfig = {
  seed: number
  lotId: string
  parts: number
  sites: number
  defectRate: number
  /** 每个 Site 对 VOH 的偏移（V），下标 = Site − 1，用来模拟某个 Site 的系统偏差 */
  siteOffsetV: number[]
}

function mirFields(lotId: string): Record<string, number | string> {
  return {
    SETUP_T: 1761300000,
    START_T: 1761300060,
    STAT_NUM: 1,
    MODE_COD: 'P',
    RTST_COD: ' ',
    PROT_COD: ' ',
    BURN_TIM: 0,
    CMOD_COD: ' ',
    LOT_ID: lotId,
    PART_TYP: 'VDUT-DEMO1',
    NODE_NAM: 'ATE-SIM',
    TSTR_TYP: 'SIM-ATE',
    JOB_NAM: 'DEMO_FT',
  }
}

function ptrFields(t: LotTest, value: number, failed: boolean, site: number): Record<string, number | string> {
  return {
    TEST_NUM: t.num,
    HEAD_NUM: 1,
    SITE_NUM: site,
    TEST_FLG: failed ? FLAG_TEST_FAIL : 0,
    PARM_FLG: 0,
    RESULT: value,
    TEST_TXT: t.name,
    ALARM_ID: '',
    OPT_FLAG: 0,
    RES_SCAL: 0,
    LLM_SCAL: 0,
    HLM_SCAL: 0,
    LO_LIMIT: t.lo,
    HI_LIMIT: t.hi,
    UNITS: t.unit,
  }
}

function binName(bin: number, kind: 'hard' | 'soft'): string {
  if (bin === 1) {
    return 'PASS'
  }
  const hit = LOT_TESTS.find((t) => (kind === 'hard' ? t.hard === bin : t.soft === bin))
  if (!hit) {
    return 'UNKNOWN'
  }
  return kind === 'hard' ? hit.hardName : hit.softName
}

/** 生成一个 FT 批次的记录序列（FAR…MRR）。Bin 规则：第一个失效项决定 Bin，全部通过为 Bin 1 */
export function buildLot(cfg: LotConfig): RecordInput[] {
  const rand = mulberry32(cfg.seed)
  const records: RecordInput[] = [
    { name: 'FAR', fields: { STDF_VER: STDF_VERSION } },
    { name: 'MIR', fields: mirFields(cfg.lotId) },
  ]
  const hardCount = new Map<number, number>()
  const softCount = new Map<number, number>()
  let passN = 0

  for (let i = 0; i < cfg.parts; i++) {
    const site = (i % cfg.sites) + 1
    const hasDefect = rand() < cfg.defectRate
    const defectIndex = Math.floor(rand() * LOT_TESTS.length)
    const values = LOT_TESTS.map((t, k) => {
      let v = t.mu + t.sigma * gauss(rand)
      if (t.num === VOH_NUM) {
        v += cfg.siteOffsetV[site - 1] ?? 0
      }
      if (hasDefect && k === defectIndex) {
        v = t.failValue
      }
      return v
    })
    const results = LOT_TESTS.map((t, k) => ({ t, v: values[k], failed: values[k] < t.lo || values[k] > t.hi }))
    const firstFail = results.find((r) => r.failed)
    const hard = firstFail ? firstFail.t.hard : 1
    const soft = firstFail ? firstFail.t.soft : 1
    if (!firstFail) {
      passN += 1
    }
    hardCount.set(hard, (hardCount.get(hard) ?? 0) + 1)
    softCount.set(soft, (softCount.get(soft) ?? 0) + 1)

    records.push({ name: 'PIR', fields: { HEAD_NUM: 1, SITE_NUM: site } })
    for (const r of results) {
      records.push({ name: 'PTR', fields: ptrFields(r.t, r.v, r.failed, site) })
    }
    records.push({
      name: 'PRR',
      fields: {
        HEAD_NUM: 1,
        SITE_NUM: site,
        PART_FLG: 0,
        NUM_TEST: LOT_TESTS.length,
        HARD_BIN: hard,
        SOFT_BIN: soft,
        X_COORD: 0,
        Y_COORD: 0,
        TEST_T: 900 + Math.floor(rand() * 200),
        PART_ID: `P${String(i + 1).padStart(4, '0')}`,
        PART_TXT: '',
      },
    })
  }

  records.push({
    name: 'PCR',
    fields: { HEAD_NUM: 255, SITE_NUM: 255, PART_CNT: cfg.parts, RTST_CNT: 0, ABRT_CNT: 0, GOOD_CNT: passN, FUNC_CNT: cfg.parts },
  })
  for (const bin of [...hardCount.keys()].sort((a, b) => a - b)) {
    records.push({
      name: 'HBR',
      fields: { HEAD_NUM: 255, SITE_NUM: 255, HBIN_NUM: bin, HBIN_CNT: hardCount.get(bin) ?? 0, HBIN_PF: bin === 1 ? 'P' : 'F', HBIN_NAM: binName(bin, 'hard') },
    })
  }
  for (const bin of [...softCount.keys()].sort((a, b) => a - b)) {
    records.push({
      name: 'SBR',
      fields: { HEAD_NUM: 255, SITE_NUM: 255, SBIN_NUM: bin, SBIN_CNT: softCount.get(bin) ?? 0, SBIN_PF: bin === 1 ? 'P' : 'F', SBIN_NAM: binName(bin, 'soft') },
    })
  }
  records.push({ name: 'MRR', fields: { FINISH_T: 1761300900, DISP_COD: 'C', USR_DESC: '' } })
  return records
}

/* ------------------------------------------------------------------ */
/* 单颗 DUT 的组装实验：正确顺序 + 校验器                               */
/* ------------------------------------------------------------------ */

export type DutKey = 'FAR' | 'MIR' | 'PIR' | 'PTR_VOH' | 'PTR_IDD' | 'PTR_IIL' | 'PRR' | 'PCR' | 'HBR' | 'SBR' | 'MRR'

export type DutItem = { key: DutKey; rec: RecordInput }

/**
 * 一颗 VOH 失效的 DUT：标准顺序 FAR → MIR → PIR → PTR×3 → PRR → PCR → HBR → SBR → MRR。
 * prrBin 是 PRR 的 HARD_BIN，允许学生修改；正确值为 VOH 对应的 2。
 */
export function dutItems(prrBin: number): DutItem[] {
  const voh = LOT_TESTS[0]
  const idd = LOT_TESTS[1]
  const iil = LOT_TESTS[2]
  return [
    { key: 'FAR', rec: { name: 'FAR', fields: { STDF_VER: STDF_VERSION } } },
    { key: 'MIR', rec: { name: 'MIR', fields: mirFields('LOT-DEMO-001') } },
    { key: 'PIR', rec: { name: 'PIR', fields: { HEAD_NUM: 1, SITE_NUM: 1 } } },
    { key: 'PTR_VOH', rec: { name: 'PTR', fields: ptrFields(voh, 2.25, true, 1) } },
    { key: 'PTR_IDD', rec: { name: 'PTR', fields: ptrFields(idd, 11.9, false, 1) } },
    { key: 'PTR_IIL', rec: { name: 'PTR', fields: ptrFields(iil, 0.31, false, 1) } },
    {
      key: 'PRR',
      rec: {
        name: 'PRR',
        fields: { HEAD_NUM: 1, SITE_NUM: 1, PART_FLG: 0, NUM_TEST: 3, HARD_BIN: prrBin, SOFT_BIN: 21, X_COORD: 0, Y_COORD: 0, TEST_T: 950, PART_ID: 'P0001', PART_TXT: '' },
      },
    },
    { key: 'PCR', rec: { name: 'PCR', fields: { HEAD_NUM: 255, SITE_NUM: 255, PART_CNT: 1, RTST_CNT: 0, ABRT_CNT: 0, GOOD_CNT: 0, FUNC_CNT: 1 } } },
    { key: 'HBR', rec: { name: 'HBR', fields: { HEAD_NUM: 255, SITE_NUM: 255, HBIN_NUM: 2, HBIN_CNT: 1, HBIN_PF: 'F', HBIN_NAM: 'VOH' } } },
    { key: 'SBR', rec: { name: 'SBR', fields: { HEAD_NUM: 255, SITE_NUM: 255, SBIN_NUM: 21, SBIN_CNT: 1, SBIN_PF: 'F', SBIN_NAM: 'VOH_LOW' } } },
    { key: 'MRR', rec: { name: 'MRR', fields: { FINISH_T: 1761300300, DISP_COD: 'C', USR_DESC: '' } } },
  ]
}

export type IssueCode =
  | 'EMPTY'
  | 'FAR_NOT_FIRST'
  | 'MIR_NOT_SECOND'
  | 'PTR_OUTSIDE_PART'
  | 'PART_NOT_CLOSED'
  | 'PRR_WITHOUT_PIR'
  | 'PART_AFTER_SUMMARY'
  | 'NO_PART'
  | 'MISSING_PCR'
  | 'BIN_PASS_WITH_FAIL'
  | 'BIN_FAIL_WITHOUT_TEST'
  | 'BIN_NOT_IN_HBR'
  | 'MRR_NOT_LAST'
  | 'MISSING_MRR'

export type ValidationIssue = { code: IssueCode; index: number }

/**
 * 校验记录顺序与关键字段。规则：
 * - FAR 第一、MIR 第二、MRR 最后；
 * - 每颗器件是 PIR → PTR* → PRR，PTR 只能在 PIR 与 PRR 之间；
 * - PCR / HBR / SBR 汇总记录放在所有器件之后；
 * - PRR 的 HARD_BIN 必须与失效情况一致（有失效不能是 Bin 1）且出现在 HBR 中。
 */
export function validateSequence(records: RecordInput[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (records.length === 0) {
    issues.push({ code: 'EMPTY', index: 0 })
    return issues
  }
  if (records[0].name !== 'FAR') {
    issues.push({ code: 'FAR_NOT_FIRST', index: 0 })
  }
  if (records.length < 2 || records[1].name !== 'MIR') {
    issues.push({ code: 'MIR_NOT_SECOND', index: 1 })
  }

  let inPart = false
  let partIndex = -1
  let failN = 0
  let summarySeen = false
  let hasPart = false
  let hasPcr = false
  let prrIndex = -1
  let prrBin = -1
  const hbrBins = new Set<number>()

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    if (rec.name === 'PIR') {
      if (summarySeen) {
        issues.push({ code: 'PART_AFTER_SUMMARY', index: i })
      }
      if (inPart) {
        issues.push({ code: 'PART_NOT_CLOSED', index: partIndex })
      }
      inPart = true
      partIndex = i
      failN = 0
    } else if (rec.name === 'PTR') {
      if (!inPart) {
        issues.push({ code: 'PTR_OUTSIDE_PART', index: i })
      } else {
        const flg = Number(rec.fields.TEST_FLG ?? 0)
        if ((flg & FLAG_TEST_FAIL) !== 0) {
          failN += 1
        }
      }
    } else if (rec.name === 'PRR') {
      if (!inPart) {
        issues.push({ code: 'PRR_WITHOUT_PIR', index: i })
      } else {
        inPart = false
        hasPart = true
        const bin = Number(rec.fields.HARD_BIN ?? 0)
        if (failN > 0 && bin === 1) {
          issues.push({ code: 'BIN_PASS_WITH_FAIL', index: i })
        }
        if (failN === 0 && bin !== 1) {
          issues.push({ code: 'BIN_FAIL_WITHOUT_TEST', index: i })
        }
        prrIndex = i
        prrBin = bin
      }
      if (summarySeen) {
        issues.push({ code: 'PART_AFTER_SUMMARY', index: i })
      }
    } else if (rec.name === 'PCR' || rec.name === 'HBR' || rec.name === 'SBR') {
      summarySeen = true
      if (rec.name === 'PCR') {
        hasPcr = true
      }
      if (rec.name === 'HBR') {
        hbrBins.add(Number(rec.fields.HBIN_NUM ?? 0))
      }
    } else if (rec.name === 'MRR') {
      if (i !== records.length - 1) {
        issues.push({ code: 'MRR_NOT_LAST', index: i })
      }
    }
  }

  if (inPart) {
    issues.push({ code: 'PART_NOT_CLOSED', index: partIndex })
  }
  if (!hasPart) {
    issues.push({ code: 'NO_PART', index: records.length - 1 })
  }
  if (!hasPcr) {
    issues.push({ code: 'MISSING_PCR', index: records.length - 1 })
  }
  if (records[records.length - 1].name !== 'MRR') {
    issues.push({ code: 'MISSING_MRR', index: records.length - 1 })
  }
  if (prrIndex >= 0 && !hbrBins.has(prrBin)) {
    issues.push({ code: 'BIN_NOT_IN_HBR', index: prrIndex })
  }
  return issues
}
