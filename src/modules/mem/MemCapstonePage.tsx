import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import './memCapstone.css'
import { ArrayFig, BinFig, TimingFig } from './MemCapstoneFig'
import {
  BIN_LABEL,
  CYCLE_OPTIONS,
  DEV_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  PAUSE_UI_OPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  batchText,
  taskItems,
  verdictOf,
} from './memCapstoneData'
import {
  BATCH,
  BIN_NO,
  DEFAULT_CAP,
  DEV_NAME,
  type CapState,
  type Outcome,
  type Settings,
  type StepId,
  formatUs,
  genBatch,
  summarize,
  toCsv,
} from './memCapstoneModel'
import { MEM_META } from './meta'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 某一步的结果：没有执行（第一个 Fail 之后）时显示 NA */
function stepValue(out: Outcome, step: StepId): { text: LText; state?: 'pass' | 'fail' } {
  const found = out.steps.find((st) => st.step === step)
  if (found === undefined) {
    return { text: S.na }
  }
  return found.pass ? { text: S.pass, state: 'pass' } : { text: S.fail, state: 'fail' }
}

export function MemCapstonePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CapState>(DEFAULT_CAP)
  const update = (patch: Partial<CapState>) => setState((prev) => ({ ...prev, ...patch }))
  const settings = useMemo<Settings>(
    () => ({ kind: state.kind, cycle: state.cycle, pauseMs: state.pauseMs }),
    [state.kind, state.cycle, state.pauseMs],
  )
  const batch = useMemo(() => genBatch(state.kind), [state.kind])
  const summary = useMemo(() => summarize(batch, settings), [batch, settings])
  const out = summary.outcomes[state.serial - 1]
  const verdict = verdictOf(batch[state.serial - 1], out, settings)
  const waitShare = summary.avgTimeUs > 0 ? Math.round((summary.avgWaitUs / summary.avgTimeUs) * 100) : 0

  const exportCsv = () => {
    const blob = new Blob([toCsv(batch, summary.outcomes)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${DEV_NAME[state.kind]}-report.csv`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    update({ exported: true })
  }

  const firstFailText = out.march !== null && out.march.failAddrs.length > 0 ? String(out.march.failAddrs[0]) : t(S.noAddr)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memCapstone.title)}
      goal={t(MEM_META.memCapstone.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={<TaskList items={taskItems(state, summary)} onReset={() => setState(DEFAULT_CAP)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memBin', 'memMarch', 'memDram', 'memBist']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mcap-controls">
          <div className="mcap-field">
            <span className="mcap-field__label">{t(S.devLabel)}</span>
            <Seg options={DEV_OPTIONS} value={state.kind} onChange={(id) => update({ kind: id })} />
          </div>
          <div className="mcap-field">
            <span className="mcap-field__label">{t(S.cycleLabel)}</span>
            <Seg options={CYCLE_OPTIONS} value={state.cycle} onChange={(id) => update({ cycle: id })} />
          </div>
          <div className="mcap-field">
            <span className="mcap-field__label">{t(S.pauseLabel)}</span>
            <Seg options={PAUSE_UI_OPTIONS} value={String(state.pauseMs)} onChange={(id) => update({ pauseMs: Number(id) })} />
          </div>
        </div>
        <div className="mcap-controls">
          <Knob label={S.serialLabel} value={state.serial} unit="" min={1} max={BATCH} step={1} onChange={(serial) => update({ serial })} />
        </div>

        <div className="mcap-grid">
          <div className="mcap-cell">
            <Readout
              items={[
                { label: S.rTacc, value: `${out.tAccNs.toFixed(2)} ns`, state: out.tAccNs <= out.limitNs ? 'pass' : 'fail' },
                { label: S.rLimit, value: `${out.limitNs.toFixed(1)} ns` },
                { label: S.rTiming, value: t(stepValue(out, 'timing').text), state: stepValue(out, 'timing').state },
                { label: S.rFunc, value: t(stepValue(out, 'functional').text), state: stepValue(out, 'functional').state },
                { label: S.rFirst, value: firstFailText },
                { label: S.rRet, value: t(stepValue(out, 'retention').text), state: stepValue(out, 'retention').state },
                { label: S.rWeak, value: String(out.weakCells.length) },
                { label: S.rBin, value: `${BIN_NO[out.bin]} · ${t(BIN_LABEL[out.bin])}`, state: out.bin === 'pass' ? 'pass' : 'fail' },
                { label: S.rTime, value: formatUs(out.testTimeUs) },
              ]}
            />
          </div>
          <div className="mcap-cell">
            <p className="mcap-title">{t(S.arrayTitle)}</p>
            <ArrayFig outcome={out} />
            <p className="mcap-title">{t(S.timingTitle)}</p>
            <TimingFig tAcc={out.tAccNs} limit={out.limitNs} />
          </div>
        </div>
      </Section>

      <Section title={t(S.batchTitle)} note={t(S.batchNote)}>
        <div className="mcap-grid">
          <div className="mcap-cell">
            <Readout
              items={[
                { label: S.rYield, value: `${(summary.yieldRate * 100).toFixed(0)} %` },
                {
                  label: S.rCounts,
                  value: `${summary.counts.pass} / ${summary.counts.timing} / ${summary.counts.functional} / ${summary.counts.retention}`,
                },
                { label: S.rAvg, value: formatUs(summary.avgTimeUs) },
                { label: S.rWait, value: `${waitShare} %` },
                { label: S.rEscapes, value: String(summary.escapes), state: summary.escapes > 0 ? 'fail' : undefined },
              ]}
            />
            <p className="mcap-note">{t(batchText(summary))}</p>
          </div>
          <div className="mcap-cell">
            <p className="mcap-title">{t(S.binTitle)}</p>
            <BinFig counts={summary.counts} />
          </div>
        </div>

        <div className="mcap-actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={exportCsv}>
            {t(S.exportBtn)}
          </button>
          {state.exported ? <span className="mcap-note">{t(S.exported)}</span> : null}
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
