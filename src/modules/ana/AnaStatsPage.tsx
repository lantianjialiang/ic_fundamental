import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { GuardFig, HistFig } from './StatsFig'
import {
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  batchLine,
  taskItems,
  verdictOf,
} from './statsData'
import {
  DEFAULT_STATS,
  HIST_BINS,
  HIST_HI,
  HIST_LO,
  TARGET_CPK,
  TARGET_ESCAPE_PCT,
  TARGET_OVERKILL_PCT,
  TARGET_YIELD_PCT,
  analyze,
  histogram,
  pct,
  sampleBatch,
  summarize,
  type StatsState,
} from './statsModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaStatsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<StatsState>(DEFAULT_STATS)
  const result = analyze(state)
  const verdict = verdictOf(state, result)
  const points = useMemo(() => sampleBatch(state), [state])
  const counts = useMemo(
    () => histogram(points.map((p) => p.y), HIST_LO, HIST_HI, HIST_BINS),
    [points],
  )
  const summary = summarize(points, state)

  const update = (patch: Partial<StatsState>) => setState((prev) => ({ ...prev, ...patch }))
  const resample = () => setState((prev) => ({ ...prev, seed: prev.seed + 1 }))
  const reset = () => setState(DEFAULT_STATS)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaStats.title)}
      goal={t(ANA_META.anaStats.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaCapstone"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaCapstone.title)}`}
      extra={<TaskList items={taskItems(state, result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaStatic', 'anaMeasure', 'anaCapstone']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <Knob label={S.muLabel} value={state.mu} unit="mV" min={-20} max={20} step={1} onChange={(mu) => update({ mu })} />
          <Knob label={S.sigmaLabel} value={state.sigma} unit="mV" min={5} max={30} step={0.5} onChange={(sigma) => update({ sigma })} />
          <Knob label={S.guardLabel} value={state.guard} unit="mV" min={0} max={10} step={0.5} onChange={(guard) => update({ guard })} />
          <Knob label={S.sigmaMLabel} value={state.sigmaM} unit="mV" min={0.5} max={10} step={0.5} onChange={(sigmaM) => update({ sigmaM })} />
          <Knob label={S.biasLabel} value={state.bias} unit="mV" min={-3} max={3} step={0.1} onChange={(bias) => update({ bias })} />
        </div>
        <div className="ana-controls">
          <button type="button" className="lab__btn lab__btn--primary" onClick={resample}>
            {t(S.resampleBtn)}
          </button>
          <button type="button" className="lab__btn" onClick={reset}>
            {t(S.resetBtn)}
          </button>
        </div>

        <div className="ana-grid">
          <HistFig counts={counts} testLo={result.testLo} testHi={result.testHi} />
          <GuardFig state={state} />
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rLimits, value: `${result.testLo}–${result.testHi} mV` },
              { label: S.rYield, value: pct(result.yieldTrue, 3), state: result.yieldTrue * 100 >= TARGET_YIELD_PCT ? 'pass' : 'fail' },
              { label: S.rTestYield, value: pct(result.yieldTest, 3) },
              { label: S.rOver, value: pct(result.overkill, 2), state: result.overkill * 100 <= TARGET_OVERKILL_PCT ? 'pass' : 'fail' },
              { label: S.rUnder, value: pct(result.escape, 2), state: result.escape * 100 <= TARGET_ESCAPE_PCT ? 'pass' : 'fail' },
              { label: S.rCp, value: result.cp.toFixed(2) },
              { label: S.rCpk, value: result.cpkProcess.toFixed(2), state: result.cpkProcess >= TARGET_CPK ? 'pass' : 'fail' },
              { label: S.rCpkMeas, value: result.cpkMeasured.toFixed(2) },
              { label: S.rUnc, value: `±${result.uncertainty.toFixed(1)} mV` },
            ]}
          />
          <p className="intro__note">{t(batchLine(summary))}</p>
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
