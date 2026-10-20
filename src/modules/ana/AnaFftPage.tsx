import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { FreqFig, WaveFig } from './FftFig'
import {
  INTRO,
  MISCONCEPTIONS,
  MODE_OPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  WIN_OPTIONS,
  stateOf,
  taskItems,
  verdictOf,
} from './fftData'
import { BIN_KHZ, DEFAULT_FFT, F_MAX_KHZ, F_MIN_KHZ, TRUE_FUND_V, TRUE_HD2_PCT, TRUE_HD3_PCT, analyze, fmtPct, type FftState } from './fftModel'
import { ANA_META } from './meta'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaFftPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<FftState>(DEFAULT_FFT)
  const result = analyze(state)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<FftState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_FFT)

  const f0Text = state.mode === 'coherent' ? `${result.f0.toFixed(3)} kHz (M = ${result.m})` : `${result.f0.toFixed(3)} kHz`

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaFft.title)}
      goal={t(ANA_META.anaFft.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaLeak"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaLeak.title)}`}
      extra={<TaskList items={taskItems(state, result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSampling', 'anaSignal', 'anaDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.modeLabel)}</span>
            <Seg options={MODE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.winLabel)}</span>
            <Seg options={WIN_OPTIONS} value={state.win} onChange={(win) => update({ win })} />
          </div>
          <Knob
            label={S.finLabel}
            value={state.fin}
            unit="kHz"
            min={F_MIN_KHZ}
            max={F_MAX_KHZ}
            step={0.1}
            onChange={(fin) => update({ fin })}
          />
        </div>

        <div className="ana-grid">
          <WaveFig state={state} result={result} />
          <FreqFig result={result} />
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rTrue, value: `${TRUE_FUND_V} V · ${TRUE_HD2_PCT}% · ${TRUE_HD3_PCT}%` },
              { label: S.rBin, value: `${(BIN_KHZ * 1000).toFixed(1)} Hz` },
              { label: S.rF0, value: f0Text },
              {
                label: S.rFund,
                value: `${result.fund.toFixed(3)} V (${fmtPct(result.errFund)})`,
                state: stateOf(result.errFund),
              },
              {
                label: S.rHd2,
                value: `${result.hd2Pct.toFixed(2)}% (${fmtPct(result.errHd2)})`,
                state: stateOf(result.errHd2),
              },
              {
                label: S.rHd3,
                value: `${result.hd3Pct.toFixed(2)}% (${fmtPct(result.errHd3)})`,
                state: stateOf(result.errHd3),
              },
              { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
            ]}
          />
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
