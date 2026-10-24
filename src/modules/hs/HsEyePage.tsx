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
import { EyeFig } from './EyeFig'
import { PrereqSection } from './HsPrereq'
import { INTRO, MISCONCEPTIONS, PREREQ, QUIZ, RATE_OPTIONS, S, TAKEAWAY, taskItems, verdictOf } from './eyeData'
import { DEFAULT_EYE, analyseEye, type EyeState } from './eyeModel'
import { HS_META } from './meta'
import './hs.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsEyePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<EyeState>(DEFAULT_EYE)
  const analysis = useMemo(() => analyseEye(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<EyeState>) => setState((prev) => ({ ...prev, ...patch }))
  const risePct = ((analysis.riseTime / analysis.ui) * 100).toFixed(0)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsEye.title)}
      goal={t(HS_META.hsEye.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsInterface"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_EYE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pmu', 'anaSampling', 'hsJitter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <Knob label={S.bwLabel} value={state.bw} unit="GHz" min={2} max={12} step={0.5} onChange={(bw) => update({ bw })} />
          <Knob label={S.rjLabel} value={state.rj} unit="ps" min={0} max={8} step={0.5} onChange={(rj) => update({ rj })} />
        </div>

        <div className="hs-grid">
          <EyeFig analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(0)} ps` },
                { label: S.rRise, value: `${analysis.riseTime.toFixed(0)} ps (${risePct}% UI)` },
                { label: S.rHeight, value: `${analysis.height.toFixed(0)} mV` },
                { label: S.rWidth, value: `${analysis.width.toFixed(2)} UI` },
                { label: S.rHits, value: String(analysis.hits), state: analysis.hits > 0 ? 'fail' : 'pass' },
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
