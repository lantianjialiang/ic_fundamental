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
import { ChannelFig } from './ChannelFig'
import { PrereqSection } from './HsPrereq'
import {
  INTRO,
  MISCONCEPTIONS,
  PE_OPTIONS,
  PREREQ,
  QUIZ,
  RATE_OPTIONS,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './channelData'
import { type ChannelState, DEFAULT_CHANNEL, analyseChannel } from './channelModel'
import { HS_META } from './meta'
import './hs.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsChannelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ChannelState>(DEFAULT_CHANNEL)
  const analysis = useMemo(() => analyseChannel(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<ChannelState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsChannel.title)}
      goal={t(HS_META.hsChannel.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsTiming"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_CHANNEL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsBasics', 'hsEye', 'rfSparam']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.peLabel)}</span>
            <Seg options={PE_OPTIONS} value={state.pe} onChange={(pe) => update({ pe })} />
          </div>
          <Knob label={S.bwLabel} value={state.bw} unit="GHz" min={2} max={12} step={0.5} onChange={(bw) => update({ bw })} />
          <Knob label={S.zlLabel} value={state.zl} unit="Ω" min={20} max={150} step={5} onChange={(zl) => update({ zl })} />
        </div>

        <div className="hs-grid">
          <ChannelFig analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rNyq, value: `${analysis.nyquistGhz.toFixed(1)} GHz` },
                { label: S.rLoss, value: `${analysis.lossDb.toFixed(2)} dB` },
                { label: S.rGamma, value: analysis.gammaMag.toFixed(2) },
                { label: S.rRl, value: Number.isFinite(analysis.returnLoss) ? `${analysis.returnLoss.toFixed(1)} dB` : '∞' },
                { label: S.rLevel, value: `${analysis.levelRel.toFixed(2)}` },
                { label: S.rOpen, value: analysis.eyeOpen.toFixed(2) },
                { label: S.rVerdict, value: t(analysis.pass ? S.pass : S.fail), state: analysis.pass ? 'pass' : 'fail' },
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

      <PrereqSection title={S.prereqTitle} note={S.prereqNote} items={PREREQ} />
    </LessonFrame>
  )
}
