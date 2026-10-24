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
import { JitterBathFig, JitterHistFig } from './HsJitterFig'
import { PrereqSection } from './HsPrereq'
import {
  BER_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  PREREQ,
  QUIZ,
  RATE_OPTIONS,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './hsJitterData'
import { DEFAULT_JITTER, analyseJitter, type JitterState } from './hsJitterModel'
import { HS_META } from './meta'
import './hs.css'
import './hsJitter.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsJitterPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<JitterState>(DEFAULT_JITTER)
  const analysis = useMemo(() => analyseJitter(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<JitterState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsJitter.title)}
      goal={t(HS_META.hsJitter.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsEye"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_JITTER)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsTiming', 'hsEye', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.berLabel)}</span>
            <Seg options={BER_OPTIONS} value={String(state.ber)} onChange={(id) => update({ ber: Number(id) })} />
          </div>
          <Knob label={S.rjLabel} value={state.rj} unit="ps" min={0} max={5} step={0.1} onChange={(rj) => update({ rj })} />
          <Knob label={S.djLabel} value={state.dj} unit="ps" min={0} max={40} step={1} onChange={(dj) => update({ dj })} />
        </div>

        <div className="hs-grid">
          <div className="hs-stack">
            <JitterHistFig analysis={analysis} />
            <JitterBathFig analysis={analysis} ber={state.ber} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(1)} ps` },
                { label: S.rQ, value: analysis.q.toFixed(2) },
                { label: S.rTjRef, value: `${analysis.tjRef.toFixed(1)} ps` },
                { label: S.rTjTarget, value: `${analysis.tjTarget.toFixed(1)} ps` },
                { label: S.rOpen, value: `${analysis.opening.toFixed(1)} ps`, state: analysis.pass ? 'pass' : 'fail' },
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
