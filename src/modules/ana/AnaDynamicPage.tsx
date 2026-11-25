import { useState } from 'react'
import { SpectralRecordFig } from './SpectralRecordFig'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
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
import { DEFAULT_DYNAMIC, HD_MAX_DB, HD_MIN_DB, INPUT_AMP, NOISE_MAX_LSB, SINAD_SPEC, analyze, type DynamicState } from './dynamicModel'
import './ana.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

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

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(state, result)} />

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
              { label: loc('如果读数来自满量程正弦', 'If the reading were from a full-scale sine'),
                value: `(${result.sinad.toFixed(2)} − 1.76) / 6.02 ≈ ${((result.sinad - 1.76) / 6.02).toFixed(2)} bit` },
              { label: loc('把本实验的 0.9 FS 正弦归算到满量程', 'Refer this lab’s 0.9 FS sine to full scale'),
                value: `(${result.sinad.toFixed(2)} + ${(20 * Math.log10(1 / INPUT_AMP)).toFixed(2)} − 1.76) / 6.02 ≈ ${result.enob.toFixed(2)} bit` },
            ]}
          />
          <p className="intro__note">{t(loc('补偿量是 20 log₁₀(1/0.9)。1.76 dB 和 6.02 dB/bit 来自理想 ADC 的满量程正弦量化噪声模型。',
            'The correction is 20 log₁₀(1/0.9). The constants 1.76 dB and 6.02 dB/bit come from the ideal ADC quantization-noise model for a full-scale sine.'))}</p>
        </div>
      </Section>

      

      <SpectralRecordFig initial="power" />
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
