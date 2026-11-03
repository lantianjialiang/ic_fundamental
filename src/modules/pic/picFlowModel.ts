import { yieldProduct } from './core/link'

/**
 * CPO 测试流程（PIC-09）。
 * 无 KGD：封装良率 = yAsic × yEngine^n。
 * 有 KGD 且引擎测试开着：坏引擎在引擎测试报废，ASIC 不跟着丢，出货按 yAsic 计。
 */

export const FLOW_IDS = ['wafer', 'eic', 'kgd', 'asm', 'etest', 'asic', 'fiber', 'pkg'] as const
export type FlowId = (typeof FLOW_IDS)[number]

export const KGD_IDS = ['off', 'on'] as const
export type KgdId = (typeof KGD_IDS)[number]

export const ALIGN0_S = 30

/** 教学单位，不是真实报价。越晚发现越贵。 */
export const SCRAP = {
  wafer: 2,
  engine: 6,
  asic: 40,
  late: 90,
} as const

export type FlowState = {
  yAsic: number
  yEngine: number
  nEngines: number
  kgd: KgdId
  parallel: number
  alignS: number
  otherS: number
  enabled: Record<FlowId, boolean>
  selected: FlowId
}

function allOn(): Record<FlowId, boolean> {
  return { wafer: true, eic: true, kgd: true, asm: true, etest: true, asic: true, fiber: true, pkg: true }
}

export const DEFAULT_FLOW: FlowState = {
  yAsic: 0.9,
  yEngine: 0.9,
  nEngines: 4,
  kgd: KGD_IDS[0],
  parallel: 1,
  alignS: ALIGN0_S,
  otherS: 20,
  enabled: allOn(),
  selected: FLOW_IDS[0],
}

export type FlowAnalysis = {
  yieldNoKgd: number
  kgdEffective: boolean
  shippedPerAsic: number
  scrapOff: number
  scrapOn: number
  scrapDelta: number
  uph: number
}

export function analyseFlow(state: FlowState): FlowAnalysis {
  const n = state.nEngines
  const yieldNoKgd = yieldProduct([state.yAsic, ...Array.from({ length: n }, () => state.yEngine)])
  const kgdEffective = state.kgd === 'on' && state.enabled.etest
  const shippedPerAsic = state.yAsic * (kgdEffective ? 1 : state.yEngine ** n)
  const scrapOff = (1 - yieldNoKgd) * SCRAP.late
  const scrapOn = n * (1 - state.yEngine) * SCRAP.engine + (1 - state.yAsic) * SCRAP.asic
  const uph = 3600 / (state.alignS / Math.max(1, state.parallel) + state.otherS)
  return {
    yieldNoKgd,
    kgdEffective,
    shippedPerAsic,
    scrapOff,
    scrapOn,
    scrapDelta: scrapOff - scrapOn,
    uph,
  }
}
