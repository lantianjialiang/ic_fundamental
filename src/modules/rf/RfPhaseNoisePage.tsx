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
import { RF_META } from './meta'
import { PhaseNoiseFig } from './RfPhaseNoiseFig'
import {
  F0_SEG,
  FLOW_SEG,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './rfPhaseNoiseData'
import { analysePn, DEFAULT_PN, fmtFreq, offsetHz, type PnState } from './rfPhaseNoiseModel'
import './rfPhaseNoise.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfPhaseNoisePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PnState>(DEFAULT_PN)
  const analysis = useMemo(() => analysePn(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<PnState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfPhaseNoise.title)}
      goal={t(RF_META.rfPhaseNoise.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfModulation"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_PN)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaPll', 'rfHarm', 'rfEvm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.f0Label)}</span>
            <Seg options={F0_SEG} value={String(state.f0Ghz)} onChange={(id) => update({ f0Ghz: Number(id) })} />
          </div>
          <Knob label={S.l1kLabel} value={state.l1k} unit="dBc/Hz" min={-100} max={-60} step={1} onChange={(l1k) => update({ l1k })} />
          <Knob label={S.flLabel} value={state.floor} unit="dBc/Hz" min={-160} max={-120} step={1} onChange={(floor) => update({ floor })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.fLowLabel)}</span>
            <Seg options={FLOW_SEG} value={String(state.fLow)} onChange={(id) => update({ fLow: Number(id) })} />
          </div>
        </div>

        <div className="rf-pn-slider">
          <label>
            <span>
              {t(S.offsetLabel)} <b>{fmtFreq(offsetHz(state))}</b>
            </span>
            <input
              type="range"
              min={3}
              max={7}
              step={0.05}
              value={state.offsetExp}
              onChange={(event) => update({ offsetExp: Number(event.target.value) })}
            />
          </label>
        </div>

        <div className="hs-grid">
          <PhaseNoiseFig state={state} analysis={analysis} onPick={(offsetExp) => update({ offsetExp })} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rOffset, value: fmtFreq(offsetHz(state)) },
                { label: S.rL, value: `${analysis.l.toFixed(1)} dBc/Hz` },
                { label: S.rFlicker, value: `${analysis.lFlicker.toFixed(1)} dBc/Hz` },
                { label: S.rFloor, value: `${analysis.lFloor.toFixed(1)} dBc/Hz` },
                { label: S.rBand, value: `${fmtFreq(state.fLow)} – 10 MHz` },
                { label: S.rTheta, value: `${analysis.thetaRad.toFixed(4)} rad rms` },
                {
                  label: S.rJitter,
                  value: `${analysis.jitterPs.toFixed(2)} ps`,
                  state: analysis.pass ? 'pass' : 'fail',
                },
              ]}
            />
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
