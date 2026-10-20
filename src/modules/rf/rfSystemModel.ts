/**
 * RF-03 测试系统与链路的教学模型（纯函数）。
 * 链路是一串元件：信号源 SG → 线缆 → 夹具 → DUT → 线缆 → 分析仪 SA。
 * 判定规则（按顺序检查，先出现的先报）：
 *   1. 必须有信号源 SG，否则 DUT 没有激励；
 *   2. 必须有分析仪 SA，否则 DUT 的输出没处读；
 *   3. 必须有 DUT，否则 SG 到 SA 只是直通，测的是线缆；
 *   4. SG 必须在链路起点、SA 在终点，否则方向接反。
 * 功率沿链路逐段相减（线缆、夹具的损耗为正数，单位 dB）；DUT 本身按 0 dB 计，只算到达 DUT 输入的功率。
 */
import { loc, type LText } from '../../i18n/locale'

export type PartKind = 'sg' | 'cable' | 'fixture' | 'dut' | 'sa'

export type PresetId = 'std' | 'noSg' | 'noSa' | 'noDut' | 'reversed'

export type LinkErrorCode = 'noSg' | 'noSa' | 'noDut' | 'reversed'

/** 示例上限：VDUT-RFT1 的输入功率上限（教学值） */
export const DUT_INPUT_MAX_DBM = 10

/** 连接方案，显示顺序即数组顺序；默认取 [0]（标准链路） */
export const PRESETS: Array<{ id: PresetId; label: LText; parts: PartKind[] }> = [
  { id: 'std', label: loc('标准链路', 'Standard link'), parts: ['sg', 'cable', 'fixture', 'dut', 'cable', 'sa'] },
  { id: 'noSg', label: loc('缺信号源', 'No signal source'), parts: ['cable', 'fixture', 'dut', 'cable', 'sa'] },
  { id: 'noSa', label: loc('缺分析仪', 'No analyzer'), parts: ['sg', 'cable', 'fixture', 'dut', 'cable'] },
  { id: 'noDut', label: loc('缺 DUT', 'No DUT'), parts: ['sg', 'cable', 'sa'] },
  { id: 'reversed', label: loc('SG / SA 接反', 'SG and SA reversed'), parts: ['sa', 'cable', 'fixture', 'dut', 'cable', 'sg'] },
]

export type RfSystemState = {
  preset: PresetId
  /** 信号源输出，dBm */
  sgDbm: number
  /** 每根线缆的损耗，dB（正数） */
  cableDb: number
  /** 夹具损耗，dB（正数） */
  fixtureDb: number
}

export const DEFAULT_SYSTEM: RfSystemState = {
  preset: PRESETS[0].id,
  sgDbm: 0,
  cableDb: 1.5,
  fixtureDb: 2,
}

/** 按规则检查连接；返回第一条不满足的规则，全部满足返回 null */
export function checkLink(parts: PartKind[]): LinkErrorCode | null {
  const count = (kind: PartKind) => parts.filter((part) => part === kind).length
  if (count('sg') === 0) {
    return 'noSg'
  }
  if (count('sa') === 0) {
    return 'noSa'
  }
  if (count('dut') === 0) {
    return 'noDut'
  }
  if (parts[0] !== 'sg' || parts[parts.length - 1] !== 'sa') {
    return 'reversed'
  }
  return null
}

export type LinkAnalysis = {
  error: LinkErrorCode | null
  /** 每个元件之后的功率，dBm；还没有信号源时为 null */
  levels: Array<number | null>
  /** 到达 DUT 输入的功率，dBm */
  dutDbm: number | null
  /** 分析仪读数（DUT 之后的线缆已经扣除），dBm */
  saDbm: number | null
  /** DUT 前段的总损耗，dB（正数） */
  upstreamLossDb: number
  overLimit: boolean
}

export function analyseLink(state: RfSystemState): LinkAnalysis {
  const parts = PRESETS.find((preset) => preset.id === state.preset)?.parts ?? []
  const error = checkLink(parts)
  const levels: Array<number | null> = []
  let level: number | null = null
  let upstreamLossDb = 0
  let seenDut = false
  let dutDbm: number | null = null
  let saDbm: number | null = null
  for (const part of parts) {
    if (part === 'sg') {
      level = state.sgDbm
    } else if (level !== null && (part === 'cable' || part === 'fixture')) {
      const loss = part === 'cable' ? state.cableDb : state.fixtureDb
      level -= loss
      if (!seenDut) {
        upstreamLossDb += loss
      }
    } else if (part === 'dut') {
      seenDut = true
      dutDbm = level
    } else if (part === 'sa') {
      saDbm = level
    }
    levels.push(level)
  }
  return {
    error,
    levels,
    dutDbm,
    saDbm,
    upstreamLossDb,
    overLimit: error === null && dutDbm !== null && dutDbm > DUT_INPUT_MAX_DBM,
  }
}

/** 当前方案的元件序列 */
export function partsOf(state: RfSystemState): PartKind[] {
  return PRESETS.find((preset) => preset.id === state.preset)?.parts ?? []
}
