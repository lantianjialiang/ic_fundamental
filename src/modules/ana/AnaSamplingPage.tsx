import { useState } from 'react'
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
import { ANA_META } from './meta'
import { FreqFig, WaveFig } from './SamplingFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, predictOk, taskItems, verdictOf } from './samplingData'
import { DEFAULT_SAMPLE, sampleResult, type SampleState } from './samplingModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const AAF_OPTIONS: Array<{ id: 'off' | 'on'; label: LText }> = [
  { id: 'off', label: S.aafOff },
  { id: 'on', label: S.aafOn },
]

export function AnaSamplingPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SampleState>(DEFAULT_SAMPLE)
  const [predict, setPredict] = useState('')
  const result = sampleResult(state)
  const predicted = predictOk(predict, result)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<SampleState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => {
    setState(DEFAULT_SAMPLE)
    setPredict('')
  }

  let predictText = t(S.predictHint)
  if (predict !== '') {
    predictText = t(predicted ? S.predictOk : S.predictBad)
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaSampling.title)}
      goal={t(ANA_META.anaSampling.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaFft"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result, predicted)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pMeasure', 'anaSignal', 'anaFft']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <Knob label={S.fsLabel} value={state.fs} unit="kHz" min={2} max={20} step={0.1} onChange={(fs) => update({ fs })} />
          <Knob label={S.finLabel} value={state.fin} unit="kHz" min={0.5} max={20} step={0.1} onChange={(fin) => update({ fin })} />
          <div className="ana-field">
            <span className="ana-field__label">{t(S.aafLabel)}</span>
            <Seg
              options={AAF_OPTIONS}
              value={state.aaf ? 'on' : 'off'}
              onChange={(id) => update({ aaf: id === 'on' })}
            />
          </div>
          <Knob label={S.fcLabel} value={state.fc} unit="kHz" min={0.5} max={20} step={0.1} onChange={(fc) => update({ fc })} />
        </div>

        <div className="ana-grid">
          <WaveFig state={state} showAlias={predicted} />
          <FreqFig state={state} showAlias={predicted} />
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rNyquist, value: `${result.nyquist.toFixed(1)} kHz` },
              { label: S.rPerPeriod, value: result.perPeriod.toFixed(1), state: result.aliasing ? 'fail' : 'pass' },
              { label: S.rGain, value: `${result.gainDb.toFixed(1)} dB` },
              { label: S.rAliasing, value: t(result.aliasing ? S.yes : S.no), state: result.aliasing ? 'fail' : 'pass' },
              { label: S.rApparent, value: predicted ? `${result.alias.toFixed(1)} kHz` : t(S.hidden) },
            ]}
          />
          <div className="ana-predict">
            <label className="ana-field__label" htmlFor="ana-predict">
              {t(S.predictTitle)} · {t(S.predictLabel)}
            </label>
            <input
              id="ana-predict"
              className="ana-predict__input"
              type="number"
              step="0.1"
              value={predict}
              placeholder="?"
              onChange={(e) => setPredict(e.target.value)}
            />
            <p className={`ana-predict__note${predict === '' ? '' : predicted ? ' is-ok' : ' is-bad'}`}>{predictText}</p>
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
