/**
 * state.ts — 模拟器的界面状态与本地保存
 *
 * 与原来的独立项目一致：程序限值、种子、场景得分、自定义场景都存 localStorage，
 * 刷新后继续；批量/单颗的中间结果不存（重新跑即可，种子保证可复现）。
 */
import {
  ATE,
  createProgram,
  type CustomDef,
  type Die,
  type FlowResult,
  type LotProgress,
  type LotStats,
  type ProgramItem,
} from './api'
import { emptyDraft, type CustomDraft } from './model'
import { type TFn } from './text'

export type Tab = 'program' | 'single' | 'lot' | 'scenario' | 'custom' | 'report'

export type ScoreRec = { best: number; attempts: number; solved: boolean }

export type SingleOut = { die: Die; result: FlowResult }

export type GradeOut = {
  level: 'full' | 'partial' | 'none'
  score: number
  attempts: number
  rootCorrect: boolean
  actionCorrect: boolean
  rootHit: { hits: number; hitKeys: string[]; total: number; ratio: number } | null
  actionHit: { hits: number; hitKeys: string[]; total: number; ratio: number } | null
  // 只存作答本身（选项 id / 用户写的文字），展示用的文案在渲染时按当前语言生成
  mode: 'choice' | 'text'
  scenarioId: string
  rootCause: string
  action: string
  rootText: string
  actionText: string
}

export type SimState = {
  tab: Tab
  program: ProgramItem[]
  seed: number
  nextDie: number
  stopOnFirstFail: boolean
  debug: boolean
  history: Array<{ index: number; bin: number; trueGood: boolean }>
  lastSingle: SingleOut | null
  lot: LotStats | null
  lotElapsedMs: number
  progress: LotProgress | null
  progressNote: string
  running: boolean
  histItem: string
  waferIndex: number
  scenarioId: string | null
  scores: Record<string, ScoreRec>
  customScenarios: CustomDef[]
  editingCustomId: string | null
  draft: CustomDraft
  batch: { count: number; retest: number; seed: number }
  activeConfig: Record<string, unknown>
  activeInstrument: Record<string, number>
  grade: GradeOut | null
}

const STORAGE_KEY = 'ate-sim-state-v1'

export function defaultState(t: TFn): SimState {
  return {
    tab: 'program',
    program: createProgram(),
    seed: 20261017,
    nextDie: 0,
    stopOnFirstFail: true,
    debug: false,
    history: [],
    lastSingle: null,
    lot: null,
    lotElapsedMs: 0,
    progress: null,
    progressNote: '',
    running: false,
    histItem: 'idd_dyn',
    waferIndex: 0,
    // 默认选中第一个预置场景：列表里永远有一项是选中的
    scenarioId: ATE.Scenarios.SCENARIOS[0] ? ATE.Scenarios.SCENARIOS[0].id : null,
    scores: {},
    customScenarios: [],
    editingCustomId: null,
    draft: emptyDraft(t),
    batch: { count: 500, retest: 0, seed: 20261017 },
    activeConfig: {},
    activeInstrument: {},
    grade: null,
  }
}

/** 只保存需要跨会话保留的部分 */
function snapshot(s: SimState) {
  return {
    seed: s.seed,
    stopOnFirstFail: s.stopOnFirstFail,
    histItem: s.histItem,
    scenarioId: s.scenarioId,
    scores: s.scores,
    customScenarios: s.customScenarios,
    editingCustomId: s.editingCustomId,
    draft: s.draft,
    batch: s.batch,
    activeConfig: s.activeConfig,
    activeInstrument: s.activeInstrument,
    program: s.program.map((item) => ({ id: item.id, lsl: item.lsl, usl: item.usl, enabled: item.enabled })),
  }
}

export function persist(s: SimState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot(s)))
  } catch {
    /* 隐私模式等场景下写不进去，忽略即可 */
  }
}

type Saved = ReturnType<typeof snapshot>

export function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Saved
  } catch {
    return null
  }
}

/** restore：把存档合并进默认状态（按测试项 id 对齐，结构变化也不会错位） */
export function restore(base: SimState, saved: Saved | null): SimState {
  if (!saved) return base
  const program = base.program.map((item) => {
    const hit = (saved.program || []).find((p) => p.id === item.id)
    if (!hit) return item
    return {
      ...item,
      lsl: hit.lsl === undefined ? item.lsl : hit.lsl,
      usl: hit.usl === undefined ? item.usl : hit.usl,
      enabled: typeof hit.enabled === 'boolean' ? hit.enabled : item.enabled,
    }
  })
  return {
    ...base,
    program,
    seed: typeof saved.seed === 'number' ? saved.seed : base.seed,
    stopOnFirstFail: typeof saved.stopOnFirstFail === 'boolean' ? saved.stopOnFirstFail : base.stopOnFirstFail,
    histItem: saved.histItem || base.histItem,
    scenarioId: saved.scenarioId ?? base.scenarioId,
    scores: saved.scores || {},
    customScenarios: Array.isArray(saved.customScenarios) ? saved.customScenarios : [],
    editingCustomId: saved.editingCustomId ?? null,
    draft: saved.draft || base.draft,
    batch: saved.batch || base.batch,
    activeConfig: saved.activeConfig || {},
    activeInstrument: saved.activeInstrument || {},
  }
}

export function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
