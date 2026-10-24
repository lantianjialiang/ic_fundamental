import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, type ReadoutItem } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { REL_META } from './meta'
import { fillText, INTRO, MISCONCEPTIONS, NODE_NAME, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './relFlowData'
import { ParetoFig, TempFig } from './RelFlowFig'
import { FlowControls, FlowEditor } from './RelFlowLab'
import {
  buildPopulation,
  COT_BUDGET,
  DEFAULT_FLOW,
  DEFAULT_POP,
  exportStdf,
  N_WAFERS,
  PPM_TARGET,
  runFlow,
  type FlowState,
  type PopParams,
} from './relFlowModel'
import './relFlow.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const LOT_ID = 'LOT-AUTO-001'

/** 对比方案的名字：只开 BI，或只开 PAT + 邻近规则；其它组合不计入 T2 */
function schemeOf(f: FlowState): string | null {
  if (f.on.bi && !f.on.pat) {
    return 'bi'
  }
  if (f.on.pat && f.nbrOn && !f.on.bi) {
    return 'patNbr'
  }
  return null
}

export function RelFlowPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [flow, setFlow] = useState<FlowState>(DEFAULT_FLOW)
  const [pop, setPop] = useState<PopParams>(DEFAULT_POP)
  const [exported, setExported] = useState(false)
  const [schemes, setSchemes] = useState<string[]>([])
  const [soakSeen, setSoakSeen] = useState<number[]>([DEFAULT_FLOW.soakS])

  const population = useMemo(() => buildPopulation(pop), [pop])
  const run = useMemo(() => runFlow(flow, population), [flow, population])
  const r = run.result
  const hasTest = r.tempsUsed.length > 0
  const verdict = verdictOf(flow, r)

  useEffect(() => {
    const key = schemeOf(flow)
    if (key === null) {
      return
    }
    setSchemes((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }, [flow])

  useEffect(() => {
    setSoakSeen((prev) => (prev.includes(flow.soakS) ? prev : [...prev, flow.soakS]))
  }, [flow.soakS])

  const reset = () => {
    setFlow(DEFAULT_FLOW)
    setPop(DEFAULT_POP)
    setExported(false)
    setSchemes([])
    setSoakSeen([DEFAULT_FLOW.soakS])
  }

  const exportFile = () => {
    if (!hasTest) {
      return
    }
    const out = exportStdf(flow, run, LOT_ID)
    const blob = new Blob([new Uint8Array(out.bytes)], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${LOT_ID}_flow.stdf`
    link.click()
    URL.revokeObjectURL(url)
    setExported(true)
  }

  const readout: ReadoutItem[] = [
    { label: S.rYield, value: `${r.yieldPct.toFixed(2)} %` },
    { label: S.rPpm, value: `${Math.round(r.ppm)} ppm`, state: r.ppm <= PPM_TARGET ? 'pass' : 'fail' },
    { label: S.rCot, value: `$ ${r.cot.toFixed(3)}`, state: r.cot <= COT_BUDGET ? 'pass' : 'fail' },
    { label: S.rUph, value: r.uph > 0 ? r.uph.toFixed(0) : '-' },
    { label: S.rTd, value: `${Math.round(r.tdS)} s` },
    { label: S.rChanges, value: `${r.changes}` },
    { label: S.rTrace, value: `${Math.round(r.traceRate * 100)} %` },
    { label: S.rRel, value: r.relDetect === null ? t(S.rOff) : `${(r.relDetect * 100).toFixed(1)} %` },
  ]

  const flowNames = r.nodes.map((x) => t(NODE_NAME[x.id])).join(' → ')
  const reportLines = [
    fillText(S.rLot, { lot: LOT_ID, n: String(r.n), wafers: String(N_WAFERS) }),
    r.nodes.length > 0 ? fillText(S.rFlow, { flow: flowNames }) : S.rFlowNone,
    fillText(S.rYieldLine, { y: r.yieldPct.toFixed(2), ppm: Math.round(r.ppm).toString() }),
    fillText(S.rTimeLine, {
      td: Math.round(r.tdS).toString(),
      touch: Math.round(r.touchS).toString(),
      soak: Math.round(r.soakS).toString(),
      changes: String(r.changes),
      batches: String(r.batches),
    }),
    fillText(S.rCostLine, { uph: r.uph.toFixed(0), cot: r.cot.toFixed(3), budget: COT_BUDGET.toFixed(2) }),
    fillText(S.rTraceLine, { trace: Math.round(r.traceRate * 100).toString() }),
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relFlow.title)}
      goal={t(REL_META.relFlow.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={<TaskList items={taskItems(r, schemes, soakSeen, exported)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['genStdf', 'genMultisite', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rf-lab">
          <FlowEditor flow={flow} onFlow={setFlow} />
          <FlowControls flow={flow} onFlow={setFlow} pop={pop} onPop={setPop} />
        </div>

        <div className="hs-grid">
          <div className="rf-flow-figs">
            <TempFig result={r} />
            <ParetoFig result={r} />
          </div>
          <div className="hs-cell">
            <Readout items={readout} />
            <div className="rf-report">
              <p className="rf-report__title">{t(S.reportTitle)}</p>
              {reportLines.map((line, index) => (
                <p key={index}>{t(line)}</p>
              ))}
              <p className="intro__note">{t(S.rStdfNote)}</p>
            </div>
            <div className="rf-export">
              <button type="button" className="lab__btn lab__btn--primary" disabled={!hasTest} onClick={exportFile}>
                {t(S.exportBtn)}
              </button>
              <p className="intro__note">{t(S.exportNote)}</p>
              {exported ? <p className="intro__note">{t(S.exported)}</p> : null}
            </div>
          </div>
        </div>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
