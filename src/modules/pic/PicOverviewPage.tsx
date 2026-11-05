import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { PIC_META } from './meta'
import { PicOverviewFig } from './PicOverviewFig'
import {
  BLOCK_ASIDE,
  CHOICE_LABEL,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  ROLE_TITLE,
  S,
  STAGE_LABEL,
  TAKEAWAY,
  TEST_TITLE,
  WHY_OPTIONS,
  roleOptions,
  stageOptions,
  taskItems,
  verdictOf,
} from './picOverviewData'
import {
  ROLE_IDS,
  TEST_IDS,
  analyseOverview,
  cloneOverview,
  type OverviewState,
  type RoleId,
  type StageId,
  type TestId,
} from './picOverviewModel'
import './pic.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PicOverviewPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<OverviewState>(cloneOverview)
  const analysis = useMemo(() => analyseOverview(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<OverviewState>) => setState((prev) => ({ ...prev, ...patch }))
  const roleCards = ROLE_IDS.map((id) => ({
    id,
    title: ROLE_TITLE[id],
    sub: CHOICE_LABEL[state.roles[id]],
    text: ROLE_TITLE[id],
  }))
  const testCards = TEST_IDS.map((id) => ({
    id,
    title: TEST_TITLE[id],
    sub: STAGE_LABEL[state.stages[id]],
    text: TEST_TITLE[id],
  }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picOverview.title)}
      goal={t(PIC_META.picOverview.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picUnits' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(analysis)} onReset={() => setState(cloneOverview())} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsChannel']} onOpen={onModuleChange} />
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
        <PracticeSteps items={taskItems(analysis)} />

        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <Knob
            label={S.powerLabel}
            value={state.powerW}
            unit="W"
            min={1}
            max={20}
            step={1}
            onChange={(powerW) => update({ powerW: Math.round(powerW) })}
          />
          <Knob
            label={S.rateLabel}
            value={state.rateTbps}
            unit="Tbps"
            min={0.4}
            max={6.4}
            step={0.1}
            onChange={(rateTbps) => update({ rateTbps: Math.round(rateTbps * 10) / 10 })}
          />
        </div>
        <div className="hs-grid">
          <PicOverviewFig block={state.block} onPick={(block) => update({ block })} />
          <div className="hs-cell">
            <p>{t(BLOCK_ASIDE[state.block])}</p>
            <Readout
              items={[
                { label: S.rPj, value: `${analysis.pj.toFixed(2)} pJ/bit` },
                { label: S.rJoule, value: `${(analysis.pj * 1e-12).toExponential(2)} J` },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.roleTitle)} note={t(S.roleNote)}>
        <Cards
          items={roleCards}
          activeId={state.roleFocus}
          cols={4}
          onPick={(item) => update({ roleFocus: item.id as RoleId })}
        />
        <div className="hs-field">
          <span className="hs-field__label">{t(S.rolePick)}</span>
          <Seg
            options={roleOptions(state.roleFocus)}
            value={state.roles[state.roleFocus]}
            onChange={(choice) =>
              setState((prev) => ({ ...prev, roles: { ...prev.roles, [prev.roleFocus]: choice } }))
            }
          />
        </div>
      </Section>

      <Section title={t(S.stageTitle)} note={t(S.stageNote)}>
        <Cards
          items={testCards}
          activeId={state.testFocus}
          cols={3}
          onPick={(item) => update({ testFocus: item.id as TestId })}
        />
        <div className="hs-field">
          <span className="hs-field__label">{t(S.stagePick)}</span>
          <Seg
            options={stageOptions(state.testFocus)}
            value={state.stages[state.testFocus]}
            onChange={(stage) =>
              setState((prev) => ({
                ...prev,
                stages: { ...prev.stages, [prev.testFocus]: stage as StageId },
              }))
            }
          />
        </div>
      </Section>

      <Section title={t(S.whyTitle)}>
        <div className="hs-field">
          <span className="hs-field__label">{t(S.whyLabel)}</span>
          <Seg options={WHY_OPTIONS} value={state.why} onChange={(why) => update({ why })} />
        </div>
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
