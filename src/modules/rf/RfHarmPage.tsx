import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { RF_META } from './meta'
import { HarmFig } from './RfHarmFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfHarmData'
import { analyseHarm, DEFAULT_HARM, type HarmState } from './rfHarmModel'
import './rfHarm.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfHarmPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<HarmState>(DEFAULT_HARM)
  const analysis = useMemo(() => analyseHarm(state), [state])
  const verdict = verdictOf(analysis)
  const update = (patch: Partial<HarmState>) => setState((prev) => ({ ...prev, ...patch }))
  const { f0, h2, h3, spur } = analysis.comps

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfHarm.title)}
      goal={t(RF_META.rfHarm.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfPhaseNoise"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_HARM)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfP1db', 'rfIp3', 'anaFft']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.h2Label} value={state.h2} unit="dBc" min={-60} max={-10} step={1} onChange={(h2) => update({ h2 })} />
          <Knob label={S.h3Label} value={state.h3} unit="dBc" min={-70} max={-10} step={1} onChange={(h3) => update({ h3 })} />
          <Knob label={S.spurLabel} value={state.spur} unit="dBc" min={-80} max={-20} step={1} onChange={(spur) => update({ spur })} />
        </div>

        <div className="hs-grid">
          <HarmFig analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rF0, value: `${f0.dbc.toFixed(1)} dBc` },
                { label: S.rH2, value: `${h2.dbc.toFixed(1)} dBc`, state: h2.pass ? 'pass' : 'fail' },
                { label: S.rH3, value: `${h3.dbc.toFixed(1)} dBc`, state: h3.pass ? 'pass' : 'fail' },
                { label: S.rSpur, value: `${spur.dbc.toFixed(1)} dBc`, state: spur.pass ? 'pass' : 'fail' },
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
    </LessonFrame>
  )
}
