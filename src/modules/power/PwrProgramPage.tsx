import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { PWR_META } from './meta'
import { ParetoFig, SiteFig } from './PwrProgramFig'
import { INTRO, MISCONCEPTIONS, PAT_SEG, PULSE_SEG, QUIZ, S, STEP_TEXT, stepLimitText, TAKEAWAY, taskItems, verdictOf } from './pwrProgramData'
import { DEFAULT_PROGRAM, exportCheck, runProgram, STEP_BIN, TARGET_DPPM, TIME_BUDGET_MS, type ProgramState } from './pwrProgramModel'
import { fillText } from './pwrWbgData'
import './pwrProgram.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 导出结果只对导出时的那一份流程有效；改动任何参数后自动失效 */
type ExportRecord = { state: ProgramState; ok: boolean; partN: number }

export function PwrProgramPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ProgramState>(DEFAULT_PROGRAM)
  const [exported, setExported] = useState<ExportRecord | null>(null)
  const result = useMemo(() => runProgram(state), [state])
  const { summary } = result
  const verdict = verdictOf(state, summary)
  const exportOk = exported !== null && exported.state === state && exported.ok
  const exportNow = exported !== null && exported.state === state ? exported : null

  const update = (patch: Partial<ProgramState>) => setState((prev) => ({ ...prev, ...patch }))

  const toggle = (index: number) =>
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, enabled: !step.enabled } : step)),
    }))

  const move = (index: number, dir: -1 | 1) =>
    setState((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.steps.length) {
        return prev
      }
      const steps = [...prev.steps]
      const current = steps[index]
      steps[index] = steps[target]
      steps[target] = current
      return { ...prev, steps }
    })

  const exportFile = () => {
    const check = exportCheck(result)
    const ok = check.binsMatch && check.issues === 0
    if (ok) {
      const blob = new Blob([new Uint8Array(check.bytes)], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'pwr08_program.stdf'
      link.click()
      URL.revokeObjectURL(url)
    }
    setExported({ state, ok, partN: check.partN })
  }

  const exportText = exportNow === null ? S.exportIdle : exportNow.ok ? fillText(S.exportOk, { n: String(exportNow.partN) }) : S.exportBad
  const exportState = exportNow === null ? undefined : exportNow.ok ? 'pass' : 'fail'

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrProgram.title)}
      goal={t(PWR_META.pwrProgram.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={
        <TaskList
          items={taskItems(state, summary, exportOk)}
          onReset={() => {
            setState(DEFAULT_PROGRAM)
            setExported(null)
          }}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['genStdf', 'genMultisite', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="pwrp-note">{t(S.flowTitle)}</p>
        <div className="pwrp-flow-wrap">
          <table className="pwrp-flow">
            <thead>
              <tr>
                <th>{t(S.colOn)}</th>
                <th>#</th>
                <th>{t(S.colItem)}</th>
                <th>{t(S.colCond)}</th>
                <th>{t(S.colLimit)}</th>
                <th>{t(S.colBin)}</th>
                <th>{t(S.colMove)}</th>
              </tr>
            </thead>
            <tbody>
              {state.steps.map((step, index) => (
                <tr key={step.id} className={step.enabled ? undefined : 'is-off'}>
                  <td>
                    <input type="checkbox" checked={step.enabled} onChange={() => toggle(index)} aria-label={t(S.enableAria)} />
                  </td>
                  <td>{index + 1}</td>
                  <td>{t(STEP_TEXT[step.id].name)}</td>
                  <td className="pwrp-cond">{t(STEP_TEXT[step.id].cond)}</td>
                  <td>{t(stepLimitText(step.id))}</td>
                  <td>{`${STEP_BIN[step.id]}`}</td>
                  <td>
                    <span className="pwrp-move">
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={t(S.moveUp)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === state.steps.length - 1}
                        aria-label={t(S.moveDown)}
                      >
                        ↓
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pwrp-note">{t(S.stdNote)}</p>

        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.pulseLabel)}</span>
            <Seg options={PULSE_SEG} value={String(state.pulseUs)} onChange={(id) => update({ pulseUs: Number(id) })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.patLabel)}</span>
            <Seg options={PAT_SEG} value={state.pat} onChange={(pat) => update({ pat })} />
          </div>
          <Knob label={S.patKLabel} value={state.patK} unit="σ" min={3} max={8} step={0.5} onChange={(patK) => update({ patK })} />
          <Knob label={S.uisLabel} value={state.uisPct} unit="%" min={0} max={100} step={5} onChange={(uisPct) => update({ uisPct })} />
        </div>

        <div className="pwrp-grid">
          <div className="pwrp-stack">
            <ParetoFig rows={summary.pareto} />
            <SiteFig sites={summary.sites} />
            <p className="pwrp-note">{t(S.illus)}</p>
            <p className="pwrp-note">{t(S.formulaTime)}</p>
            <p className="pwrp-note">{t(S.formulaUph)}</p>
          </div>
          <div className="pwrp-cell">
            <Readout
              items={[
                { label: S.rYield, value: `${summary.yieldPct.toFixed(1)} %` },
                { label: S.rEsc, value: String(summary.escapes) },
                { label: S.rOver, value: String(summary.overkill) },
                { label: S.rDppm, value: String(Math.round(summary.dppm)), state: summary.dppm <= TARGET_DPPM ? 'pass' : 'fail' },
                { label: S.rAvg, value: `${summary.avgMs.toFixed(0)} ms`, state: summary.budgetOk ? 'pass' : 'fail' },
                { label: S.rBudget, value: `${TIME_BUDGET_MS} ms · ${t(summary.budgetOk ? S.rWithin : S.rOver2)}`, state: summary.budgetOk ? 'pass' : 'fail' },
                { label: S.rRetest, value: `${(summary.retest * 100).toFixed(1)} %` },
                { label: S.rUph, value: summary.uph.toFixed(0) },
                { label: S.rCot, value: summary.cotCents.toFixed(2) },
                { label: S.rCpkRds, value: summary.cpkRds === null ? '—' : summary.cpkRds.toFixed(2) },
                { label: S.rCpkVth, value: summary.cpkVth === null ? '—' : summary.cpkVth.toFixed(2) },
                { label: S.rPat, value: `${summary.patLo.toFixed(2)} – ${summary.patHi.toFixed(2)} mΩ` },
              ]}
            />
            <div className="pwrp-export">
              <button type="button" className="pwrp-btn" onClick={exportFile}>
                {t(S.exportBtn)}
              </button>
              <Readout items={[{ label: S.rExport, value: t(exportText), state: exportState }]} />
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