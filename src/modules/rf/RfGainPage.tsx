import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, type ReadoutItem } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { GainFig } from './GainFig'
import { RF_META } from './meta'
import { DEVICE_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfGainData'
import { BAND_MAX, BAND_MIN, DEFAULT_GAIN, F0_MAX, F0_MIN, Q_MAX, Q_MIN, analyseGain, type GainState } from './rfGainModel'
import './rfGain.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfGainPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<GainState>(DEFAULT_GAIN)
  const analysis = useMemo(() => analyseGain(state), [state])
  const verdict = verdictOf(analysis)
  const update = (patch: Partial<GainState>) => setState((prev) => ({ ...prev, ...patch }))

  const bwItem: ReadoutItem =
    analysis.fLow !== null && analysis.fHigh !== null
      ? {
          label: S.rBw,
          value: `${(analysis.fHigh - analysis.fLow).toFixed(2)} GHz (${analysis.fLow.toFixed(2)}–${analysis.fHigh.toFixed(2)})`,
        }
      : { label: S.rBw, value: t(S.outRange) }
  const gainItem: ReadoutItem =
    state.device === 'amp'
      ? { label: S.rGain, value: `${analysis.g0.toFixed(1)} dB` }
      : { label: S.rIl, value: `${(-analysis.g0).toFixed(1)} dB` }
  const verdictState = analysis.pass ? 'pass' : 'fail'
  const readout: ReadoutItem[] = [
    gainItem,
    { label: S.rPeakF, value: `${analysis.peakF.toFixed(2)} GHz` },
    bwItem,
    { label: S.rFlat, value: `${analysis.flatPp.toFixed(2)} dB`, state: verdictState },
    { label: S.rVerdict, value: t(analysis.pass ? S.pass : S.fail), state: verdictState },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfGain.title)}
      goal={t(RF_META.rfGain.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfP1db"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_GAIN)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfDb', 'rfSparam', 'anaSignal']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rfg-controls">
          <div className="rfg-field">
            <span className="rfg-field__label">{t(S.deviceLabel)}</span>
            <Seg options={DEVICE_OPTIONS} value={state.device} onChange={(device) => update({ device })} />
          </div>
          <Knob label={S.f0Label} value={state.f0} unit="GHz" min={F0_MIN} max={F0_MAX} step={0.1} onChange={(f0) => update({ f0 })} />
          <Knob label={S.qLabel} value={state.q} unit="" min={Q_MIN} max={Q_MAX} step={0.1} onChange={(q) => update({ q })} />
          <Knob label={S.bandLabel} value={state.band} unit="GHz" min={BAND_MIN} max={BAND_MAX} step={0.1} onChange={(band) => update({ band })} />
        </div>

        <div className="rfg-grid">
          <GainFig analysis={analysis} />
          <div className="rfg-cell">
            <Readout items={readout} />
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
