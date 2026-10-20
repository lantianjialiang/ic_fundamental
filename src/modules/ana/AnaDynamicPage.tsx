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
import { BIT_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, WINDOW_OPTIONS, taskItems, verdictOf } from './dynamicData'
import { SpectrumFig } from './DynamicFig'
import { DEFAULT_DYNAMIC, HD_MAX_DB, HD_MIN_DB, NOISE_MAX_LSB, SINAD_SPEC, analyze, type DynamicState } from './dynamicModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaDynamicPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DynamicState>(DEFAULT_DYNAMIC)
  const result = analyze(state)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<DynamicState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_DYNAMIC)
  const sinadPass = result.sinad >= SINAD_SPEC

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaDynamic.title)}
      goal={t(ANA_META.anaDynamic.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaPll"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaPll.title)}`}
      extra={<TaskList items={taskItems(state, result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSampling', 'anaFft', 'anaStatic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.bitsLabel)}</span>
            <Seg options={BIT_OPTIONS} value={String(state.bits)} onChange={(id) => update({ bits: Number(id) })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.windowLabel)}</span>
            <Seg options={WINDOW_OPTIONS} value={state.window} onChange={(id) => update({ window: id })} />
          </div>
          <Knob label={S.noiseLabel} value={state.noiseLsb} unit="LSB" min={0} max={NOISE_MAX_LSB} step={0.1} onChange={(noiseLsb) => update({ noiseLsb })} />
          <Knob label={S.hd2Label} value={state.hd2Db} unit="dBc" min={HD_MIN_DB} max={HD_MAX_DB} step={1} onChange={(hd2Db) => update({ hd2Db })} />
          <Knob label={S.hd3Label} value={state.hd3Db} unit="dBc" min={HD_MIN_DB} max={HD_MAX_DB} step={1} onChange={(hd3Db) => update({ hd3Db })} />
          <Knob label={S.seedLabel} value={state.seed} unit="" min={1} max={99} step={1} onChange={(seed) => update({ seed })} />
        </div>

        <SpectrumFig result={result} />

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rIdeal, value: `${result.ideal.toFixed(1)} dB` },
              { label: S.rIdealInput, value: `${result.idealAtInput.toFixed(1)} dB` },
              { label: S.rSnr, value: `${result.snr.toFixed(1)} dB` },
              { label: S.rSinad, value: `${result.sinad.toFixed(1)} dB`, state: sinadPass ? 'pass' : 'fail' },
              { label: S.rThd, value: `${result.thd.toFixed(1)} dBc` },
              { label: S.rSfdr, value: `${result.sfdr.toFixed(1)} dBc` },
              { label: S.rSpur, value: result.spurHarmonic !== null ? `HD${result.spurHarmonic}` : t(S.spurNoise) },
              { label: S.rEnob, value: result.enob.toFixed(2) },
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
