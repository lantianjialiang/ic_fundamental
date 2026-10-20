import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, type ReadoutItem } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { Ip3Fig } from './Ip3Fig'
import { RF_META } from './meta'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfIp3Data'
import {
  DEFAULT_IP3,
  IIP3_MAX,
  IIP3_MIN,
  PIN_MAX,
  PIN_MIN,
  TONE_MAX_MHZ,
  TONE_MIN_MHZ,
  simulateIp3,
  type Ip3State,
} from './rfIp3Model'
import './rfIp3.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfIp3Page({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<Ip3State>(DEFAULT_IP3)
  const analysis = useMemo(() => simulateIp3(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<Ip3State>) => setState((prev) => ({ ...prev, ...patch }))

  /** 有谱线重叠时，IM3 与 IIP3 / OIP3 的读数没有意义，显示为破折号 */
  const read = (value: string) => (analysis.clash ? '—' : value)
  const verdictState = analysis.clash || !analysis.pass ? 'fail' : 'pass'
  const readout: ReadoutItem[] = [
    { label: S.rGain, value: `${analysis.gainMeasDb.toFixed(2)} dB` },
    { label: S.rPout, value: `${analysis.pF1.toFixed(2)} dBm` },
    { label: S.rDelta, value: read(`${analysis.dIm3.toFixed(2)} dB`) },
    { label: S.rIip3, value: read(`${analysis.iip3Read.toFixed(2)} dBm (${t(S.setTag)} ${state.iip3.toFixed(1)})`) },
    { label: S.rOip3, value: read(`${analysis.oip3Read.toFixed(2)} dBm (${t(S.setTag)} ${analysis.oip3Set.toFixed(1)})`) },
    {
      label: S.rVerdict,
      value: analysis.clash ? t(S.clashShort) : t(analysis.pass ? S.pass : S.fail),
      state: verdictState,
    },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfIp3.title)}
      goal={t(RF_META.rfIp3.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={`${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfNf"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_IP3)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfP1db', 'anaFft', 'rfModulation']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rfip3-controls">
          <Knob label={S.f1Label} value={state.f1} unit="MHz" min={TONE_MIN_MHZ} max={TONE_MAX_MHZ} step={1} onChange={(f1) => update({ f1 })} />
          <Knob label={S.f2Label} value={state.f2} unit="MHz" min={TONE_MIN_MHZ} max={TONE_MAX_MHZ} step={1} onChange={(f2) => update({ f2 })} />
          <Knob label={S.pinLabel} value={state.pin} unit="dBm" min={PIN_MIN} max={PIN_MAX} step={0.5} onChange={(pin) => update({ pin })} />
          <Knob label={S.iip3Label} value={state.iip3} unit="dBm" min={IIP3_MIN} max={IIP3_MAX} step={0.5} onChange={(iip3) => update({ iip3 })} />
        </div>

        <div className="rfip3-grid">
          <Ip3Fig analysis={analysis} />
          <div className="rfip3-cell">
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
