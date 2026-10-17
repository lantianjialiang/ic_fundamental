/**
 * model.ts — 把引擎数据翻译成界面文字，并把界面输入翻译成引擎配置
 *
 * 引擎里的场景文案是中文的，这里统一按当前语言重新拼装；反向则把自定义表单
 * 的草稿清洗成引擎可用的 CustomDef。判分仍交给引擎（结构比较 / 关键词命中）。
 */
import { loc, pick, type LText, type Locale } from '../../i18n/locale'
import {
  ATE,
  fmtNum,
  pct,
  type CustomDef,
  type GradeResult,
  type LimitOverride,
  type Scenario,
} from './api'
import { S, type TFn } from './text'

export const LIST_SEP = loc('；', '; ')
export const RANGE_SEP = loc(' ~ ', '–')

const DEFAULT_RATES: Record<string, number> = {
  open: 0.015,
  short: 0.01,
  leak: 0.02,
  idd: 0.015,
  speedTail: 0.03,
}

const DEFAULT_INSTRUMENT = { contactR: 8, contactVar: 0.12, contactDrift: 0, noiseScale: 1 }

const SHIFT_NAMES: Record<string, LText | string> = {
  iddDyn: loc('IDD 动态', 'IDD dynamic'),
  iddStdby: loc('IDD 待机', 'IDD standby'),
  fmax: 'Fmax',
  voh: 'VOH',
  vol: 'VOL',
  leak: loc('输入漏电', 'input leakage'),
  continuity: loc('连续性压降', 'continuity drop'),
}

const SHIFT_UNITS: Record<string, string> = {
  iddDyn: 'mA',
  iddStdby: 'µA',
  fmax: 'MHz',
  voh: 'V',
  vol: 'V',
  leak: 'nA',
  continuity: 'V',
}

/** tf：把 loc() 文案里的 {占位符} 换成实际值（中英文语序不同也安全） */
export function tf(t: TFn, text: LText | string, params: Record<string, string | number>): string {
  return t(text).replace(/\{(\w+)\}/g, (whole, key: string) =>
    params[key] === undefined ? whole : String(params[key]),
  )
}

/** itemLabel：测试项 id → 名称 */
export function itemLabel(id: string, t: TFn): string {
  const entry = (S.item as Record<string, { name: LText; condition: LText }>)[id]
  return entry ? t(entry.name) : id
}

/** itemCondition：测试项 id → 测试条件 */
export function itemCondition(id: string, t: TFn): string {
  const entry = (S.item as Record<string, { name: LText; condition: LText }>)[id]
  return entry ? t(entry.condition) : ''
}

/** binShort：Bin 短名（柱状图、图例） */
export function binShort(bin: number, t: TFn): string {
  return t(S.bin.short[bin] || `Bin ${bin}`)
}

/** binLong：Bin 全名（结果标题、Wafer Map 提示） */
export function binLong(bin: number, t: TFn): string {
  return t(S.bin.long[bin] || `Bin ${bin}`)
}

/** limitText：限值文本（单边 / 双边 / 无限制） */
export function limitText(
  item: { lsl: number | null; usl: number | null; unit: string; digits: number },
  t: TFn,
): string {
  const l = item.lsl
  const h = item.usl
  const u = item.unit || ''
  if ((l === null || l === undefined) && (h === null || h === undefined)) return t(S.common.noLimit)
  if (l === null || l === undefined) return '≤ ' + fmtNum(h, item.digits) + u
  if (h === null || h === undefined) return '≥ ' + fmtNum(l, item.digits) + u
  return fmtNum(l, item.digits) + t(RANGE_SEP) + fmtNum(h, item.digits) + u
}

/** presetScenarios：五个预置场景，文案换成当前语言 */
export function presetScenarios(t: TFn): Scenario[] {
  return ATE.Scenarios.SCENARIOS.map((sc) => localizePreset(sc, t))
}

/** presetScenario：按 id 取预置场景 */
export function presetScenario(id: string, t: TFn): Scenario | null {
  const sc = ATE.Scenarios.getScenario(id)
  return sc ? localizePreset(sc, t) : null
}

function localizePreset(sc: Scenario, t: TFn): Scenario {
  const copy = S.scenarios[sc.id]
  if (!copy) return sc
  return {
    ...sc,
    name: t(copy.name),
    tag: copy.tag,
    brief: t(copy.brief),
    task: t(copy.task),
    hint: t(copy.hint),
    explanation: t(copy.explanation),
    setup: { ...sc.setup, describe: t(copy.describe) },
  }
}

/** optionList：根因 / 处置的可选项（预置项，文案随语言） */
export function optionList(kind: 'rootCause' | 'action', t: TFn): Array<{ id: string; label: string }> {
  const entries = S.options[kind] as Record<string, { label: LText }>
  return Object.keys(entries).map((id) => ({ id, label: t(entries[id].label) }))
}

/** optionLabel：按 id 取选项文案 */
export function optionLabel(kind: 'rootCause' | 'action', id: string, t: TFn): string {
  const entry = (S.options[kind] as Record<string, { label: LText }>)[id]
  return entry ? t(entry.label) : id
}

/** presetKeys：预置项在指定语言下的判分关键词 */
function presetKeys(kind: 'rootCause' | 'action', id: string, locale: Locale): string[] {
  const entry = (S.options[kind] as Record<string, { keys: LText }>)[id]
  if (!entry) return []
  return pick(entry.keys, locale)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/** keysOf：某个答案方向的判分关键词（自定义文字优先，预置项按语言取） */
function keysOf(kind: 'rootCause' | 'action', answer: CustomDef['answer'], locale: Locale): string[] {
  const picked = answer[kind]
  if (picked && picked !== 'custom') return presetKeys(kind, picked, locale)
  return Array.isArray(answer[kind === 'rootCause' ? 'rootCauseKeys' : 'actionKeys'])
    ? answer[kind === 'rootCause' ? 'rootCauseKeys' : 'actionKeys']
    : []
}

/** customToScenario：把一份自定义定义变成可运行、可判分的场景 */
export function customToScenario(def: CustomDef, t: TFn, locale: Locale): Scenario {
  const d = ATE.Scenarios.sanitizeCustom(def)
  const config: Record<string, unknown> = {}
  const rates: Record<string, number> = {}
  ;['open', 'short', 'leak', 'idd'].forEach((k) => {
    if (d.defectRates[k] !== undefined) rates[k] = d.defectRates[k]
  })
  if (Object.keys(rates).length) config.defectRates = rates
  if (d.defectRates.speedTail !== undefined) config.speedTailRate = d.defectRates.speedTail
  if (Object.keys(d.shift).length) config.shifts = d.shift

  const instrument: Record<string, number> = {}
  if (Math.abs(d.instrument.contactR - DEFAULT_INSTRUMENT.contactR) > 1e-9) {
    instrument.contactR = d.instrument.contactR
  }
  if (Math.abs(d.instrument.contactVar - DEFAULT_INSTRUMENT.contactVar) > 1e-9) {
    instrument.contactVar = d.instrument.contactVar
  }
  if (d.instrument.contactDrift > 0) instrument.contactDrift = d.instrument.contactDrift
  if (Math.abs(d.instrument.noiseScale - DEFAULT_INSTRUMENT.noiseScale) > 1e-9) {
    instrument.noiseScale = d.instrument.noiseScale
  }

  const mode = d.answer.mode === 'text' ? 'text' : d.answer.mode === 'choice' ? 'choice' : 'none'
  const hasAnswer =
    mode === 'text'
      ? !!(d.answer.rootCauseText && d.answer.actionText)
      : mode === 'choice' && !!d.answer.rootCause && !!d.answer.action

  const changes = summarizeChanges(d, t)
  // 选了预置项时，标准答案文本用当前语言的预置文案（引擎里存的是中文原文）
  const answerText = (kind: 'rootCause' | 'action'): string => {
    const picked = d.answer[kind]
    if (picked && picked !== 'custom') return optionLabel(kind, picked, t)
    return kind === 'rootCause' ? d.answer.rootCauseText : d.answer.actionText
  }
  return {
    id: d.id || 'custom-preview',
    name: d.name,
    tag: t(S.scenario.customTag),
    brief: d.brief || autoBrief(d, t),
    task: t(mode === 'text' ? S.scenario.customTaskText : S.scenario.customTaskChoice),
    hint: t(S.scenario.customHint),
    setup: {
      config,
      instrumentConfig: instrument,
      limits: d.limits as Record<string, LimitOverride>,
      describe: changes.join(t(LIST_SEP)) || t(S.custom.noChanges),
      seed: d.batch.seed,
    },
    correct: {
      mode: hasAnswer ? mode : 'none',
      rootCause: hasAnswer && mode === 'choice' ? d.answer.rootCause : '',
      action: hasAnswer && mode === 'choice' ? d.answer.action : '',
      rootCauseText: hasAnswer ? answerText('rootCause') : '',
      rootCauseKeys: hasAnswer ? keysOf('rootCause', d.answer, locale) : [],
      actionText: hasAnswer ? answerText('action') : '',
      actionKeys: hasAnswer ? keysOf('action', d.answer, locale) : [],
    },
    explanation: d.answer.explanation || autoExplain(d, t),
    isCustom: true,
    batch: { ...d.batch },
  }
}

/** summarizeChanges：把定义翻成「改了哪些参数」的清单 */
export function summarizeChanges(def: CustomDef, t: TFn): string[] {
  const d = ATE.Scenarios.sanitizeCustom(def)
  const out: string[] = []
  const rateNames: Record<string, LText> = {
    open: S.custom.rateOpen,
    short: S.custom.rateShort,
    leak: S.custom.rateLeak,
    idd: S.custom.rateIdd,
    speedTail: S.custom.rateTail,
  }
  Object.keys(rateNames).forEach((k) => {
    const v = d.defectRates[k]
    if (v === undefined || v === null) return
    if (Math.abs(v - DEFAULT_RATES[k]) < 1e-9) return
    out.push(
      tf(t, S.custom.changeRate, {
        name: t(rateNames[k]),
        value: pct(v),
        def: pct(DEFAULT_RATES[k]),
      }),
    )
  })

  Object.keys(SHIFT_NAMES).forEach((k) => {
    const v = d.shift[k]
    if (v === undefined || v === null || Math.abs(v) < 1e-9) return
    out.push(
      tf(t, S.custom.changeShift, {
        name: t(SHIFT_NAMES[k]),
        value: (v > 0 ? '+' : '') + fmtNum(v, 3),
        unit: SHIFT_UNITS[k],
      }),
    )
  })

  if (Math.abs(d.instrument.contactR - DEFAULT_INSTRUMENT.contactR) > 1e-9) {
    out.push(tf(t, S.custom.changeContactR, { value: fmtNum(d.instrument.contactR, 1) }))
  }
  if (Math.abs(d.instrument.contactVar - DEFAULT_INSTRUMENT.contactVar) > 1e-9) {
    out.push(tf(t, S.custom.changeContactVar, { value: pct(d.instrument.contactVar) }))
  }
  if (d.instrument.contactDrift > 0) {
    out.push(tf(t, S.custom.changeContactDrift, { value: fmtNum(d.instrument.contactDrift, 0) }))
  }
  if (Math.abs(d.instrument.noiseScale - DEFAULT_INSTRUMENT.noiseScale) > 1e-9) {
    out.push(tf(t, S.custom.changeNoise, { value: fmtNum(d.instrument.noiseScale, 2) }))
  }

  Object.keys(d.limits).forEach((id) => {
    const ov = d.limits[id]
    const parts: string[] = []
    if (ov.lsl !== null && ov.lsl !== undefined) parts.push('LSL ' + fmtNum(ov.lsl, 4))
    if (ov.usl !== null && ov.usl !== undefined) parts.push('USL ' + fmtNum(ov.usl, 4))
    if (!parts.length) return
    out.push(tf(t, S.custom.changeLimit, { name: itemLabel(id, t), value: parts.join(' / ') }))
  })
  return out
}

/** symptomList：根据参数推断统计页应该看到什么 */
export function symptomList(def: CustomDef, t: TFn): string[] {
  const d = ATE.Scenarios.sanitizeCustom(def)
  const out: string[] = []
  const contactBad =
    d.instrument.contactR > 15 ||
    d.instrument.contactDrift > 10 ||
    Math.abs(d.instrument.contactR - DEFAULT_INSTRUMENT.contactR) > 5
  if (contactBad) out.push(t(S.custom.symContact))
  if (d.instrument.contactDrift > 10) out.push(t(S.custom.symDrift))
  if (d.shift.iddDyn > 0.5 || d.shift.iddStdby > 20 || (d.defectRates.idd || 0) > 0.015) {
    out.push(t(S.custom.symIddUp))
  }
  if (d.shift.iddStdby > 3 && d.shift.iddStdby <= 20) out.push(t(S.custom.symIddNear))
  if (d.shift.voh <= -0.3) out.push(t(S.custom.symVohFail))
  else if (d.shift.voh < -0.02) out.push(t(S.custom.symVohNear))
  if (d.shift.vol >= 0.12) out.push(t(S.custom.symVolFail))
  else if (d.shift.vol > 0.02) out.push(t(S.custom.symVolNear))
  if (d.shift.fmax <= -12) out.push(t(S.custom.symFmaxFail))
  else if (d.shift.fmax < -0.5) out.push(t(S.custom.symFmaxNear))
  if (d.shift.leak > 5 || (d.defectRates.leak || 0) > 0.02) out.push(t(S.custom.symLeak))
  if ((d.defectRates.open || 0) > 0.015 || (d.defectRates.short || 0) > 0.01) {
    out.push(t(S.custom.symContinuity))
  }
  if (Math.abs(d.shift.continuity || 0) > 0.005) out.push(t(S.custom.symContinuityShift))
  if ((d.defectRates.speedTail || 0) > 0.03) out.push(t(S.custom.symSpeedTail))

  let tighter = false
  let looser = false
  const baseProgram = ATE.Tests.createProgram()
  Object.keys(d.limits).forEach((id) => {
    const ov = d.limits[id]
    const base = ATE.Tests.findItem(baseProgram, id)
    if (!base) return
    if (ov.lsl !== null && ov.lsl !== undefined && base.lsl !== null && ov.lsl > base.lsl) tighter = true
    if (ov.usl !== null && ov.usl !== undefined && base.usl !== null && ov.usl < base.usl) tighter = true
    if (ov.lsl !== null && ov.lsl !== undefined && base.lsl !== null && ov.lsl < base.lsl) looser = true
    if (ov.usl !== null && ov.usl !== undefined && base.usl !== null && ov.usl > base.usl) looser = true
  })
  if (tighter) out.push(t(S.custom.symTighter))
  if (looser) out.push(t(S.custom.symLooser))
  if (Math.abs(d.instrument.noiseScale - 1) > 0.5) out.push(t(S.custom.symNoise))
  if (!out.length) out.push(t(S.custom.symNone))
  return out
}

/** autoExplain：没有手写讲解时按参数生成 */
export function autoExplain(def: CustomDef, t: TFn): string {
  const changes = summarizeChanges(def, t)
  return tf(t, S.custom.autoExplain, {
    changes: changes.length ? changes.join(t(LIST_SEP)) : t(S.custom.noChanges),
    symptoms: symptomList(def, t).join(t(LIST_SEP)),
  })
}

/** autoBrief：没有手写任务描述时按参数生成 */
export function autoBrief(def: CustomDef, t: TFn): string {
  const changes = summarizeChanges(def, t)
  return tf(t, S.custom.autoBrief, {
    changes: changes.length ? changes.slice(0, 4).join(t(LIST_SEP)) : t(S.custom.autoBriefEmpty),
  })
}

/** answerSummary：一句话说明这道题怎么判分 */
export function answerSummary(def: CustomDef, t: TFn): string {
  const d = ATE.Scenarios.sanitizeCustom(def)
  if (d.answer.mode === 'none') return t(S.custom.answerSummaryNone)
  if (d.answer.mode === 'choice') {
    return tf(t, S.custom.answerChoice, {
      root: optionLabel('rootCause', d.answer.rootCause, t),
      action: optionLabel('action', d.answer.action, t),
    })
  }
  return tf(t, S.custom.answerTextMode, {
    root: d.answer.rootCauseKeys.join(t(loc('、', ', '))),
    action: d.answer.actionKeys.join(t(loc('、', ', '))),
  })
}

/** validateCustom：校验自定义定义（错误信息随语言） */
export function validateCustom(def: CustomDef, t: TFn): { ok: boolean; errors: string[] } {
  const d = ATE.Scenarios.sanitizeCustom(def)
  const errors: string[] = []
  if (!String(d.name || '').trim()) errors.push(t(S.custom.errName))
  if (!summarizeChanges(d, t).length) errors.push(t(S.custom.errNoChanges))

  Object.keys(d.limits).forEach((id) => {
    const ov = d.limits[id]
    if (
      ov.lsl !== null &&
      ov.lsl !== undefined &&
      ov.usl !== null &&
      ov.usl !== undefined &&
      ov.lsl >= ov.usl
    ) {
      errors.push(tf(t, S.custom.errOrder, { name: itemLabel(id, t) }))
    }
  })

  const rc = d.answer.rootCause
  const ac = d.answer.action
  const hasRc = rc === 'custom' ? !!d.answer.rootCauseText : !!rc
  const hasAc = ac === 'custom' ? !!d.answer.actionText : !!ac
  if (hasRc !== hasAc) errors.push(t(S.custom.errPair))

  if (d.answer.mode === 'text') {
    if (rc === 'custom' && !d.answer.rootCauseText) errors.push(t(S.custom.errCustomRoot))
    if (ac === 'custom' && !d.answer.actionText) errors.push(t(S.custom.errCustomAction))
    if (!d.answer.rootCauseKeys.length) errors.push(t(S.custom.errRootKeys))
    if (!d.answer.actionKeys.length) errors.push(t(S.custom.errActionKeys))
  }
  return { ok: errors.length === 0, errors }
}

/** scenarioMode：这道题怎么判分（预置场景只写了选项 id，没写 mode） */
export function scenarioMode(scenario: Scenario): 'choice' | 'text' | 'none' {
  const explicit = scenario.correct.mode
  if (explicit === 'choice' || explicit === 'text' || explicit === 'none') return explicit
  if (scenario.correct.rootCause || scenario.correct.action) return 'choice'
  if (scenario.correct.rootCauseText && scenario.correct.actionText) return 'text'
  return 'none'
}

/** answerTextOf：某个方向的标准答案文本 */
export function answerTextOf(correct: Scenario['correct'], kind: 'rootCause' | 'action', t: TFn): string {
  const text = kind === 'rootCause' ? correct.rootCauseText : correct.actionText
  if (text) return text
  const id = kind === 'rootCause' ? correct.rootCause : correct.action
  return id ? optionLabel(kind, id, t) : ''
}

/** gradeScenario：按当前语言的答案判分 */
export function gradeScenario(
  scenario: Scenario,
  submission: { rootCause?: string; action?: string; rootCauseText?: string; actionText?: string },
): GradeResult {
  return ATE.Scenarios.grade(scenario, submission)
}

/* ------------------------------------------------------------------ */
/* 自定义表单草稿：允许留空，保存时才交给 sanitizeCustom 钳位            */
/* ------------------------------------------------------------------ */

export type CustomDraft = {
  id: string | null
  name: string
  brief: string
  rates: Record<string, number | undefined>
  shifts: Record<string, number | undefined>
  instrument: { contactR?: number; contactVar?: number; contactDrift?: number; noiseScale?: number }
  limits: Record<string, { lsl?: number | null; usl?: number | null }>
  answer: {
    mode: 'none' | 'choice' | 'text'
    rootCause: string
    rootCauseText: string
    rootCauseKeys: string
    action: string
    actionText: string
    actionKeys: string
    explanation: string
  }
  batch: { count: number; retest: number; seed: number }
}

/** 默认答案项：下拉框一律选第一项，界面上不留空选项 */
export const FIRST_OPTION = {
  rootCause: Object.keys(S.options.rootCause)[0] || '',
  action: Object.keys(S.options.action)[0] || '',
}

/** emptyDraft：新建自定义故障的初值 —— 全部按规格默认值 / 第一个选项填好 */
export function emptyDraft(t: TFn): CustomDraft {
  return {
    id: null,
    name: t(S.custom.defaultName),
    brief: '',
    rates: { ...DEFAULT_RATES },
    shifts: { iddDyn: 0, iddStdby: 0, fmax: 0, voh: 0, vol: 0, leak: 0, continuity: 0 },
    instrument: { ...DEFAULT_INSTRUMENT },
    limits: {},
    answer: {
      mode: 'choice',
      rootCause: FIRST_OPTION.rootCause,
      rootCauseText: '',
      rootCauseKeys: '',
      action: FIRST_OPTION.action,
      actionText: '',
      actionKeys: '',
      explanation: '',
    },
    batch: { count: 500, retest: 0, seed: 20261017 },
  }
}

/** defToDraft：已保存的定义 → 表单草稿 */
export function defToDraft(def: CustomDef): CustomDraft {
  const d = ATE.Scenarios.sanitizeCustom(def)
  return {
    id: d.id,
    name: d.name,
    brief: d.brief,
    rates: { ...d.defectRates },
    shifts: { ...d.shift },
    instrument: { ...d.instrument },
    limits: JSON.parse(JSON.stringify(d.limits)) as CustomDraft['limits'],
    answer: {
      mode: d.answer.mode === 'text' ? 'text' : d.answer.mode === 'choice' ? 'choice' : 'none',
      rootCause: d.answer.rootCause || '',
      rootCauseText: d.answer.rootCauseText || '',
      rootCauseKeys: d.answer.rootCauseKeys.join(', '),
      action: d.answer.action || '',
      actionText: d.answer.actionText || '',
      actionKeys: d.answer.actionKeys.join(', '),
      explanation: d.answer.explanation || '',
    },
    batch: { ...d.batch },
  }
}

/** draftToDef：表单草稿 → 交给引擎定义的原始对象 */
export function draftToDef(draft: CustomDraft): Record<string, unknown> {
  const limits: Record<string, { lsl: number | null; usl: number | null }> = {}
  Object.keys(draft.limits).forEach((id) => {
    const ov = draft.limits[id]
    const lsl = ov.lsl === undefined ? null : ov.lsl
    const usl = ov.usl === undefined ? null : ov.usl
    if (lsl === null && usl === null) return
    limits[id] = { lsl, usl }
  })
  return {
    id: draft.id,
    name: draft.name,
    brief: draft.brief,
    defectRates: draft.rates,
    shift: draft.shifts,
    instrument: draft.instrument,
    limits,
    answer: {
      mode: draft.answer.mode,
      rootCause: draft.answer.rootCause,
      rootCauseText: draft.answer.rootCauseText,
      rootCauseKeys: draft.answer.rootCauseKeys,
      action: draft.answer.action,
      actionText: draft.answer.actionText,
      actionKeys: draft.answer.actionKeys,
      explanation: draft.answer.explanation,
    },
    batch: draft.batch,
  }
}

/** draftToScenario：草稿直接转场景（预览用） */
export function draftToScenario(draft: CustomDraft, t: TFn, locale: Locale): Scenario {
  return customToScenario(ATE.Scenarios.sanitizeCustom(draftToDef(draft)), t, locale)
}

/** templateDefs：三个起步模板（数值在这里，文案随语言） */
export function templateDefs(t: TFn): Array<{ id: string; label: string; def: CustomDef }> {
  const ids = ['weak-drive', 'iddq-leak', 'noisy'] as const
  return ids.map((id) => {
    const copy = S.custom.templates[id]
    const base = copy
      ? { name: t(copy.name), brief: t(copy.brief), explanation: t(copy.explanation) }
      : { name: id, brief: '', explanation: '' }
    const raw: Record<string, unknown> =
      id === 'weak-drive'
        ? {
            name: base.name,
            brief: base.brief,
            shift: { voh: -0.45 },
            answer: { rootCause: 'process-shift', action: 'stop-line', explanation: base.explanation },
            batch: { count: 500, retest: 0, seed: 20261017 },
          }
        : id === 'iddq-leak'
          ? {
              name: base.name,
              brief: base.brief,
              shift: { iddStdby: 45 },
              answer: { rootCause: 'process-shift', action: 'stop-line', explanation: base.explanation },
              batch: { count: 500, retest: 0, seed: 20261017 },
            }
          : {
              name: base.name,
              brief: base.brief,
              instrument: { noiseScale: 6 },
              answer: { explanation: '' },
              batch: { count: 500, retest: 0, seed: 20261017 },
            }
    return { id, label: copy ? t(copy.label) : id, def: ATE.Scenarios.sanitizeCustom(raw) }
  })
}
