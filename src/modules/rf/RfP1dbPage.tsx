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
import { P1dbFig } from './P1dbFig'
import { RF_META } from './meta'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfP1dbData'
import {
  DEFAULT_P1DB,
  GAIN_MAX,
  GAIN_MIN,
  P_SMOOTH_MAX,
  P_SMOOTH_MIN,
  PIN_MAX,
  PIN_MIN,
  PSAT_MAX,
  PSAT_MIN,
  analyseP1db,
  type P1dbState,
} from './rfP1dbModel'
import './rfP1db.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfP1dbPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<P1dbState>(DEFAULT_P1DB)
  const analysis = useMemo(() => analyseP1db(state), [state])
  const verdict = verdictOf(analysis)
  const update = (patch: Partial<P1dbState>) => setState((prev) => ({ ...prev, ...patch }))

  const fmtDbm = (value: number | null) => (value === null ? '—' : `${value.toFixed(1)} dBm`)
  const compressState = analysis.compressDb >= 1 ? 'fail' : 'pass'
  const readout: ReadoutItem[] = [
    { label: S.rSmall, value: `${analysis.smallGainDb.toFixed(2)} dB` },
    { label: S.rIn1, value: fmtDbm(analysis.p1in) },
    { label: S.rOut1, value: fmtDbm(analysis.p1out) },
    {
      label: S.rGap,
      value: analysis.p1out === null ? '—' : `${(analysis.psat - analysis.p1out).toFixed(2)} dB`,
    },
    { label: S.rOp, value: `${analysis.opPout.toFixed(2)} dBm` },
    { label: S.rComp, value: `${analysis.compressDb.toFixed(2)} dB`, state: compressState },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfP1db.title)}
      goal={t(RF_META.rfP1db.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={`${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfIp3"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_P1DB)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfGain', 'rfDb', 'rfEvm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rfp1-controls">
          <Knob label={S.gainLabel} value={state.gain} unit="dB" min={GAIN_MIN} max={GAIN_MAX} step={1} onChange={(gain) => update({ gain })} />
          <Knob label={S.psatLabel} value={state.psat} unit="dBm" min={PSAT_MIN} max={PSAT_MAX} step={1} onChange={(psat) => update({ psat })} />
          <Knob label={S.pLabel} value={state.p} unit="" min={P_SMOOTH_MIN} max={P_SMOOTH_MAX} step={0.5} onChange={(p) => update({ p })} />
          <Knob label={S.pinLabel} value={state.pin} unit="dBm" min={PIN_MIN} max={PIN_MAX} step={0.5} onChange={(pin) => update({ pin })} />
        </div>

        <div className="rfp1-grid">
          <P1dbFig analysis={analysis} />
          <div className="rfp1-cell">
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
