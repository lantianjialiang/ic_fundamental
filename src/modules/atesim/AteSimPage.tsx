import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { pick } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import {
  ATE,
  createLotSteps,
  createProgram,
  download,
  lotToCsv,
  readTextFile,
  runDie,
  type CustomDef,
  type DieRecord,
  type LotProgress,
  type LotRequest,
  type LotStats,
  type ProgramItem,
  type Scenario,
} from './api'
import {
  customToScenario,
  defToDraft,
  draftToDef,
  emptyDraft,
  gradeScenario,
  presetScenarios,
  tf,
  validateCustom,
  type CustomDraft,
} from './model'
import { CustomPanel } from './panels/CustomPanel'
import { LotPanel } from './panels/LotPanel'
import { ProgramPanel } from './panels/ProgramPanel'
import { ReportPanel } from './panels/ReportPanel'
import { ScenarioPanel } from './panels/ScenarioPanel'
import { SinglePanel } from './panels/SinglePanel'
import { defaultState, loadSaved, persist, restore, type SimState, type Tab } from './state'
import { S } from './text'
import './atesim.css'

type AteSimPageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

const TABS: Tab[] = ['program', 'single', 'lot', 'scenario', 'custom', 'report']

/** 批量运行需要的全部输入（场景载入时会用自己的程序与种子） */
type RunSpec = {
  program: ProgramItem[]
  seed: number
  config: Record<string, unknown>
  instrument: Record<string, number>
  count: number
  retest: number
  stopOnFirstFail: boolean
}

/** 批量生成器跑完后的返回值 */
type LotRun = { records: DieRecord[]; stats: LotStats; request: LotRequest }

/** 导入的配置 JSON 形状（只校验用到的字段） */
type ConfigFile = {
  program?: Array<{ id?: string; lsl?: number | null; usl?: number | null; enabled?: boolean }>
  seed?: number
  batch?: { count?: number; retest?: number; seed?: number }
  stopOnFirstFail?: boolean
  activeConfig?: Record<string, unknown>
  activeInstrument?: Record<string, number>
  scenarioId?: string | null
  customScenarios?: CustomDef[]
}

/**
 * AteSimPage：ATE 模拟器的外壳
 *
 * 六个页签共用一份测试程序与种子；批量用生成器 + requestAnimationFrame 分帧推进，
 * 页面不会因为 5000 颗 die 卡住；限值、种子、得分与自定义场景存 localStorage。
 */
export function AteSimPage({ moduleId, onModuleChange }: AteSimPageProps) {
  const { t, locale } = useLocale()
  const [state, setState] = useState<SimState>(() => restore(defaultState(t), loadSaved()))
  const [customNote, setCustomNote] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null)
  // 只记「载入了哪个场景」，提示文字在渲染时按当前语言生成，切语言不会留旧文案
  const [loaded, setLoaded] = useState<{ kind: 'scenario'; id: string } | { kind: 'restored' } | null>(
    null,
  )
  const [reportAt, setReportAt] = useState<string | null>(null)

  const rafRef = useRef<number | null>(null)
  const genRef = useRef<Generator<LotProgress, LotRun, void> | null>(null)

  useEffect(() => {
    persist(state)
  }, [state])

  // 切换语言时，如果草稿名还是另一套语言的默认名（用户没改过），就跟着换
  const prevLocale = useRef(locale)
  useEffect(() => {
    const from = prevLocale.current
    prevLocale.current = locale
    const previous = pick(S.custom.defaultName, from)
    const next = pick(S.custom.defaultName, locale)
    setState((prev) =>
      prev.draft.name.trim() === previous
        ? { ...prev, draft: { ...prev.draft, name: next } }
        : prev,
    )
  }, [locale])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      genRef.current = null
    },
    [],
  )

  const tab = state.tab
  const setTab = (next: Tab) => setState((prev) => ({ ...prev, tab: next }))

  /* --------------------------- 场景（预置 + 自定义） --------------------------- */

  const scenarios: Scenario[] = [
    ...presetScenarios(t),
    ...state.customScenarios.map((def) => customToScenario(def, t, locale)),
  ]
  const selectedScenario = scenarios.find((item) => item.id === state.scenarioId) || null

  const loadedNote = !loaded
    ? ''
    : loaded.kind === 'restored'
      ? t(S.scenario.restored)
      : (() => {
          const hit = scenarios.find((item) => item.id === loaded.id)
          return hit ? tf(t, S.scenario.loaded, { name: hit.name, describe: hit.setup.describe }) : ''
        })()

  /* ------------------------------- 程序与单颗 ------------------------------- */

  const updateProgram = (id: string, patch: Partial<ProgramItem>) =>
    setState((prev) => ({
      ...prev,
      program: prev.program.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))

  const resetLimits = () => setState((prev) => ({ ...prev, program: createProgram() }))

  const testDice = (count: number) =>
    setState((prev) => {
      let index = prev.nextDie
      let last = prev.lastSingle
      const history = [...prev.history]
      for (let i = 0; i < count; i++) {
        const out = runDie(
          index,
          prev.seed,
          prev.program,
          prev.activeConfig,
          prev.activeInstrument,
          prev.stopOnFirstFail,
        )
        last = out
        history.push({ index: out.die.index, bin: out.result.bin, trueGood: out.die.trueGood })
        index += 1
      }
      return { ...prev, nextDie: index, lastSingle: last, history: history.slice(-200) }
    })

  const resetSequence = () => setState((prev) => ({ ...prev, nextDie: 0, history: [], lastSingle: null }))

  /* -------------------------------- 批量运行 -------------------------------- */

  const stopGenerator = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    genRef.current = null
  }

  const runLotWith = (spec: RunSpec) => {
    if (genRef.current) return
    const request: LotRequest = {
      count: spec.count,
      seed: spec.seed,
      program: spec.program,
      config: spec.config,
      instrumentConfig: spec.instrument,
      stopOnFirstFail: spec.stopOnFirstFail,
      retest: spec.retest,
      chunk: 25,
    }
    const gen = createLotSteps(request)
    genRef.current = gen
    const started = performance.now()

    setState((prev) => ({
      ...prev,
      running: true,
      lot: null,
      progress: { done: 0, total: request.count, yieldPct: 100 },
      progressNote: '',
    }))

    // 每帧跑一小段，进度条与页面都保持响应
    const tick = () => {
      const running = genRef.current
      if (!running) return
      const before = performance.now()
      let step = running.next()
      let guard = 0
      while (!step.done && performance.now() - before < 14 && guard < 600) {
        step = running.next()
        guard += 1
      }
      if (step.done) {
        genRef.current = null
        rafRef.current = null
        const stats = step.value.stats
        const elapsed = performance.now() - started
        setState((prev) => {
          const keepHist = stats.items.some((item) => item.id === prev.histItem)
          return {
            ...prev,
            running: false,
            lot: stats,
            progress: null,
            progressNote: tf(t, S.lot.done, {
              total: stats.total,
              sec: (elapsed / 1000).toFixed(elapsed < 1000 ? 2 : 1),
            }),
            lotElapsedMs: elapsed,
            waferIndex: 0,
            histItem: keepHist ? prev.histItem : stats.items[0]?.id || prev.histItem,
          }
        })
        return
      }
      setState((prev) => ({ ...prev, progress: step.value }))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const startLot = () =>
    runLotWith({
      program: state.program,
      seed: state.batch.seed,
      config: state.activeConfig,
      instrument: state.activeInstrument,
      count: state.batch.count,
      retest: state.batch.retest,
      stopOnFirstFail: state.stopOnFirstFail,
    })

  const cancelLot = () => {
    const wasRunning = !!genRef.current
    stopGenerator()
    setState((prev) => ({
      ...prev,
      running: false,
      progress: null,
      progressNote: wasRunning ? t(S.lot.canceled) : prev.progressNote,
    }))
  }

  /** applyScenario：把场景配置装进程序 + 种子，并立刻跑一批 */
  const applyScenario = (scenario: Scenario) => {
    stopGenerator()
    const built = ATE.Scenarios.buildSetup(scenario)
    const count = scenario.batch?.count ?? state.batch.count
    const retest = scenario.batch?.retest ?? state.batch.retest
    setState((prev) => ({
      ...prev,
      scenarioId: scenario.id,
      program: built.program,
      seed: built.seed,
      activeConfig: built.config,
      activeInstrument: built.instrumentConfig,
      batch: { count, retest, seed: built.seed },
      grade: null,
      tab: 'lot',
    }))
    setLoaded({ kind: 'scenario', id: scenario.id })
    runLotWith({
      program: built.program,
      seed: built.seed,
      config: built.config,
      instrument: built.instrumentConfig,
      count,
      retest,
      stopOnFirstFail: state.stopOnFirstFail,
    })
  }

  const restoreBase = () => {
    stopGenerator()
    setState((prev) => ({
      ...prev,
      scenarioId: null,
      program: createProgram(),
      activeConfig: {},
      activeInstrument: {},
      grade: null,
      running: false,
      progress: null,
    }))
    setLoaded({ kind: 'restored' })
  }

  /* --------------------------------- 判分 --------------------------------- */

  const submitDiagnosis = (sub: {
    rootCause: string
    action: string
    rootCauseText: string
    actionText: string
  }) => {
    const scenario = selectedScenario
    if (!scenario) return
    const result = gradeScenario(scenario, sub)
    const prev = state.scores[scenario.id] || { best: 0, attempts: 0, solved: false }
    const attempts = prev.attempts + 1
    const base = result.level === 'full' ? 100 : result.level === 'partial' ? 50 : 0
    const score = attempts > 1 ? Math.round(base * 0.6) : base

    setState((prevState) => ({
      ...prevState,
      scores: {
        ...prevState.scores,
        [scenario.id]: {
          best: Math.max(prev.best, score),
          attempts,
          solved: prev.solved || result.level === 'full',
        },
      },
      grade: {
        level: result.level,
        score,
        attempts,
        rootCorrect: result.rootCorrect,
        actionCorrect: result.actionCorrect,
        rootHit: result.rootHit,
        actionHit: result.actionHit,
        mode: result.mode === 'text' ? 'text' : 'choice',
        scenarioId: scenario.id,
        rootCause: sub.rootCause,
        action: sub.action,
        rootText: sub.rootCauseText,
        actionText: sub.actionText,
      },
    }))
  }

  /* ------------------------------ 自定义故障 ------------------------------ */

  const setDraft = (next: CustomDraft) => setState((prev) => ({ ...prev, draft: next }))

  const saveCustom = (run: boolean, asNew = false) => {
    const def = ATE.Scenarios.sanitizeCustom(draftToDef(state.draft))
    const check = validateCustom(def, t)
    if (!check.ok) {
      setCustomNote({ kind: 'bad', text: check.errors[0] })
      return
    }
    const creating = asNew || !def.id
    const id = creating ? 'custom-' + Date.now().toString(36) : (def.id as string)
    const saved: CustomDef = { ...def, id }
    setState((prev) => ({
      ...prev,
      customScenarios: creating
        ? [...prev.customScenarios, saved]
        : prev.customScenarios.map((item) => (item.id === id ? saved : item)),
      editingCustomId: id,
      draft: defToDraft(saved),
    }))
    setCustomNote({
      kind: 'ok',
      text: tf(t, creating ? S.custom.savedAs : S.custom.saved, { name: saved.name }),
    })
    if (run) applyScenario(customToScenario(saved, t, locale))
  }

  const newCustom = () => {
    setState((prev) => ({ ...prev, editingCustomId: null, draft: emptyDraft(t) }))
    setCustomNote(null)
  }

  const clearParams = () => {
    const blank = emptyDraft(t)
    setState((prev) => ({
      ...prev,
      draft: {
        ...blank,
        id: prev.draft.id,
        name: prev.draft.name,
        brief: prev.draft.brief,
        answer: prev.draft.answer,
        batch: prev.draft.batch,
      },
    }))
    setCustomNote({ kind: 'ok', text: t(S.custom.cleared) })
  }

  const exportDef = (def: CustomDef) => {
    const name = (def.name || 'scenario').replace(/[\\/:*?"<>|]+/g, '-')
    download(name + '.json', JSON.stringify(def, null, 2), 'application/json')
    setCustomNote({ kind: 'ok', text: tf(t, S.custom.exportedOne, { name: def.name }) })
  }

  const exportDraft = () => {
    const def = ATE.Scenarios.sanitizeCustom(draftToDef(state.draft))
    if (!String(def.name || '').trim()) {
      setCustomNote({ kind: 'bad', text: t(S.custom.needName) })
      return
    }
    exportDef(def)
  }

  const importDraft = (file: File) => {
    readTextFile(file)
      .then((text) => {
        let data: unknown
        try {
          data = JSON.parse(text)
        } catch {
          setCustomNote({ kind: 'bad', text: t(S.custom.badFile) })
          return
        }
        const raw = data as Record<string, unknown>
        const looksLikeDef = ['defectRates', 'shift', 'instrument', 'limits', 'answer', 'brief'].some(
          (key) => raw && typeof raw === 'object' && key in raw,
        )
        if (!looksLikeDef) {
          setCustomNote({ kind: 'bad', text: t(S.custom.badFile) })
          return
        }
        const def = ATE.Scenarios.sanitizeCustom(raw)
        setState((prev) => ({ ...prev, draft: defToDraft(def), editingCustomId: null }))
        setCustomNote({ kind: 'ok', text: t(S.custom.importedDraft) })
      })
      .catch(() => setCustomNote({ kind: 'bad', text: t(S.custom.badFile) }))
  }

  const editSaved = (id: string) => {
    const hit = state.customScenarios.find((item) => item.id === id)
    if (!hit) return
    setState((prev) => ({ ...prev, editingCustomId: id, draft: defToDraft(hit) }))
    setCustomNote(null)
  }

  const deleteSaved = (id: string) => {
    const hit = state.customScenarios.find((item) => item.id === id)
    if (!hit) return
    if (!window.confirm(tf(t, S.custom.confirmDelete, { name: hit.name }))) return
    setState((prev) => ({
      ...prev,
      customScenarios: prev.customScenarios.filter((item) => item.id !== id),
      editingCustomId: prev.editingCustomId === id ? null : prev.editingCustomId,
      scenarioId: prev.scenarioId === id ? null : prev.scenarioId,
      draft: prev.editingCustomId === id ? emptyDraft(t) : prev.draft,
    }))
    setCustomNote({ kind: 'ok', text: t(S.custom.deleted) })
  }

  const exportSaved = (id: string) => {
    const hit = state.customScenarios.find((item) => item.id === id)
    if (hit) exportDef(hit)
  }

  /* ------------------------------ 配置导入导出 ------------------------------ */

  const exportCsv = () => {
    if (!state.lot) {
      setState((prev) => ({ ...prev, progressNote: t(S.lot.exportEmpty) }))
      return
    }
    download('atesim-lot.csv', lotToCsv(state.lot), 'text/csv;charset=utf-8')
    setState((prev) => ({ ...prev, progressNote: t(S.lot.exportedCsv) }))
  }

  const exportJson = () => {
    const payload = {
      kind: 'atesim-config',
      version: 1,
      program: state.program,
      seed: state.batch.seed,
      stopOnFirstFail: state.stopOnFirstFail,
      batch: state.batch,
      scenarioId: state.scenarioId,
      activeConfig: state.activeConfig,
      activeInstrument: state.activeInstrument,
      customScenarios: state.customScenarios,
    }
    download('atesim-config.json', JSON.stringify(payload, null, 2), 'application/json')
    setState((prev) => ({ ...prev, progressNote: t(S.lot.exportedJson) }))
  }

  const importConfig = (file: File) => {
    readTextFile(file)
      .then((text) => {
        let data: ConfigFile
        try {
          data = JSON.parse(text) as ConfigFile
        } catch {
          setState((prev) => ({ ...prev, progressNote: t(S.lot.badJson) }))
          return
        }
        if (!data || !Array.isArray(data.program)) {
          setState((prev) => ({ ...prev, progressNote: t(S.lot.noProgram) }))
          return
        }
        const program = createProgram().map((item) => {
          const hit = (data.program || []).find((entry) => entry && entry.id === item.id)
          if (!hit) return item
          return {
            ...item,
            lsl: hit.lsl === undefined ? item.lsl : hit.lsl,
            usl: hit.usl === undefined ? item.usl : hit.usl,
            enabled: typeof hit.enabled === 'boolean' ? hit.enabled : item.enabled,
          }
        })
        const seed = Number.isFinite(Number(data.seed)) ? Number(data.seed) : state.batch.seed
        const count = Number(data.batch?.count) || state.batch.count
        const retest = Number.isFinite(Number(data.batch?.retest))
          ? Number(data.batch?.retest)
          : state.batch.retest
        const stopOnFirstFail =
          typeof data.stopOnFirstFail === 'boolean' ? data.stopOnFirstFail : state.stopOnFirstFail
        const config = data.activeConfig || {}
        const instrument = data.activeInstrument || {}

        setState((prev) => ({
          ...prev,
          program,
          seed,
          batch: { count, retest, seed },
          stopOnFirstFail,
          activeConfig: config,
          activeInstrument: instrument,
          scenarioId: data.scenarioId ?? null,
          customScenarios: Array.isArray(data.customScenarios)
            ? data.customScenarios
            : prev.customScenarios,
          progressNote: t(S.lot.imported),
        }))
        runLotWith({ program, seed, config, instrument, count, retest, stopOnFirstFail })
      })
      .catch(() => setState((prev) => ({ ...prev, progressNote: t(S.lot.badJson) })))
  }

  /* --------------------------------- 报告 --------------------------------- */

  const makeReport = () => {
    if (!state.lot) return
    setReportAt(new Date().toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US'))
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.atesim.title)}
      goal={t(ui.atesim.goal)}
      kicker={t(S.page.kicker)}
      asideTitle={t(S.page.asideTitle)}
      asideText={t(S.page.asideText)}
      asideLater={t(S.page.asideLater)}
    >
      <Section title={t(S.page.introTitle)}>
        <p>{t(S.page.intro)}</p>
      </Section>

      <Section title={t(S.page.workbench)} note={t(S.page.workbenchNote)}>
        <div className="seg atesim-tabs" role="tablist" aria-label={t(S.page.workbench)}>
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'is-active' : ''}
              onClick={() => setTab(id)}
            >
              {t(S.tabs[id])}
            </button>
          ))}
        </div>

        {tab === 'program' ? (
          <ProgramPanel
            program={state.program}
            stopOnFirstFail={state.stopOnFirstFail}
            onToggleStop={() =>
              setState((prev) => ({ ...prev, stopOnFirstFail: !prev.stopOnFirstFail }))
            }
            onResetLimits={resetLimits}
            onUpdate={updateProgram}
          />
        ) : null}

        {tab === 'single' ? (
          <SinglePanel
            single={state.lastSingle}
            program={state.program}
            seed={state.seed}
            nextDie={state.nextDie}
            debug={state.debug}
            history={state.history}
            onNext={() => testDice(1)}
            onRun10={() => testDice(10)}
            onReset={resetSequence}
            onToggleDebug={() => setState((prev) => ({ ...prev, debug: !prev.debug }))}
          />
        ) : null}

        {tab === 'lot' ? (
          <LotPanel
            lot={state.lot}
            program={state.program}
            batch={state.batch}
            stopOnFirstFail={state.stopOnFirstFail}
            progress={state.progress}
            progressNote={state.progressNote}
            running={state.running}
            histItem={state.histItem}
            waferIndex={state.waferIndex}
            onRun={startLot}
            onCancel={cancelLot}
            onBatchChange={(patch) =>
              setState((prev) => ({ ...prev, batch: { ...prev.batch, ...patch } }))
            }
            onStopModeChange={(value) => setState((prev) => ({ ...prev, stopOnFirstFail: value }))}
            onHistItemChange={(id) => setState((prev) => ({ ...prev, histItem: id }))}
            onWaferChange={(index) => setState((prev) => ({ ...prev, waferIndex: index }))}
            onExportCsv={exportCsv}
            onExportJson={exportJson}
            onImportFile={importConfig}
          />
        ) : null}

        {tab === 'scenario' ? (
          <ScenarioPanel
            scenarios={scenarios}
            selectedId={state.scenarioId}
            scores={state.scores}
            grade={state.grade}
            loadedNote={loadedNote}
            onSelect={(id) => setState((prev) => ({ ...prev, scenarioId: id, grade: null }))}
            onLoadRun={(id) => {
              const hit = scenarios.find((item) => item.id === id)
              if (hit) applyScenario(hit)
            }}
            onRestore={restoreBase}
            onSubmit={submitDiagnosis}
          />
        ) : null}

        {tab === 'custom' ? (
          <CustomPanel
            draft={state.draft}
            program={state.program}
            customScenarios={state.customScenarios}
            editingId={state.editingCustomId}
            note={customNote}
            onChange={setDraft}
            onSaveRun={() => saveCustom(true)}
            onSave={() => saveCustom(false)}
            onSaveAs={() => saveCustom(false, true)}
            onNew={newCustom}
            onClear={clearParams}
            onExport={exportDraft}
            onImport={importDraft}
            onEditSaved={editSaved}
            onDeleteSaved={deleteSaved}
            onExportSaved={exportSaved}
          />
        ) : null}

        {tab === 'report' ? (
          <ReportPanel
            lot={state.lot}
            program={state.program}
            seed={state.batch.seed}
            stopOnFirstFail={state.stopOnFirstFail}
            batch={state.batch}
            scenarioName={selectedScenario ? selectedScenario.name : null}
            scenarioDescribe={selectedScenario ? selectedScenario.setup.describe : null}
            madeAt={reportAt}
            onGenerate={makeReport}
            onPrint={() => window.print()}
          />
        ) : null}
      </Section>
    </LessonFrame>
  )
}
