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
import { ANA_META } from './meta'
import { BodeFig, WaveFig } from './SignalFig'
import { FILTER_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './signalData'
import { DEFAULT_SIGNAL, signalResult, type SignalState } from './signalModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaSignalPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SignalState>(DEFAULT_SIGNAL)
  const result = signalResult(state)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<SignalState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_SIGNAL)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaSignal.title)}
      goal={t(ANA_META.anaSignal.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaSampling"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaSampling.title)}`}
      extra={<TaskList items={taskItems(state, result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaMeasure', 'anaSampling', 'anaFft']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <Knob label={S.fLabel} value={state.f} unit="kHz" min={0.5} max={5} step={0.1} onChange={(f) => update({ f })} />
          <Knob label={S.ampALabel} value={state.ampA} unit="V" min={0.2} max={2} step={0.1} onChange={(ampA) => update({ ampA })} />
          <Knob label={S.ampBLabel} value={state.ampB} unit="V" min={0.2} max={2} step={0.1} onChange={(ampB) => update({ ampB })} />
          <Knob label={S.phaseLabel} value={state.phaseB} unit="°" min={-180} max={180} step={5} onChange={(phaseB) => update({ phaseB })} />
          <div className="ana-field">
            <span className="ana-field__label">{t(S.filterLabel)}</span>
            <Seg options={FILTER_OPTIONS} value={state.filter ? 'on' : 'off'} onChange={(id) => update({ filter: id === 'on' })} />
          </div>
          <Knob label={S.fcLabel} value={state.fc} unit="kHz" min={0.1} max={20} step={0.1} onChange={(fc) => update({ fc })} />
        </div>

        <div className="ana-grid">
          <WaveFig state={state} result={result} />
          <div className="ana-cell">
            <Readout
              items={[
                { label: S.rPeriod, value: `${result.period.toFixed(2)} ms` },
                { label: S.rPhase, value: `${result.phaseDiff.toFixed(1)}°` },
                { label: S.rGain, value: `${result.gainDb.toFixed(2)} dB` },
                { label: S.rOutB, value: `${result.outAmpB.toFixed(2)} V` },
                { label: S.rBw, value: state.filter ? `${state.fc.toFixed(1)} kHz` : t(S.noFilterBw) },
                { label: S.rErr, value: `${result.ampErrPct.toFixed(2)} %` },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.bodeTitle)} note={t(S.bodeNote)}>
        <BodeFig state={state} />
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
