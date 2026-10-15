import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, LOOPS, QUIZ, S, STEPS, TAKEAWAY } from './data/pcbFlow'
import { FlowFig } from './FlowFigs'
import { PCB_META } from './meta'
import { HuntSection, RulesSection, SourceSection } from './PcbFlowSections'
import { PinSection, ReviewSection } from './PcbFlowSections2'
import '../prep/prep.css'
import './pcbFlow.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PcbFlowPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const flow = useStepPlayer(STEPS.length, 2200)
  const [pick, setPick] = useState<PrepNote | null>(null)
  const item = STEPS[flow.step]
  const shown: PrepNote = pick ?? { kicker: S.kickerStep, title: item.title, text: item.text }
  const loop = item.id === 'drc' ? LOOPS.drc : item.id === 'review' ? LOOPS.review : null

  // 操作流程图时，侧栏回到当前步骤的说明
  const player = {
    ...flow,
    next: () => {
      setPick(null)
      flow.next()
    },
    goTo: (i: number) => {
      setPick(null)
      flow.goTo(i)
    },
    toggle: () => {
      setPick(null)
      flow.toggle()
    },
    reset: () => {
      setPick(null)
      flow.reset()
    },
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbFlow.title)}
      goal={t(PCB_META.pcbFlow.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbBasics"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <FlowFig step={flow.step} onPick={player.goTo} />
        <StepControls player={player} stepLabels={STEPS.map((s) => s.title)} />
        <Callout>
          <p>
            <b>{`${flow.step + 1}. ${t(item.title)}`}</b>
          </p>
          <p>
            <LessonRefText text={item.text} onOpenLesson={onModuleChange} />
          </p>
          <dl className="pcbFlow-detail">
            <dt>{t(S.input)}</dt>
            <dd>{t(item.input)}</dd>
            <dt>{t(S.output)}</dt>
            <dd>{t(item.output)}</dd>
            <dt>{t(S.tools)}</dt>
            <dd>{t(item.tools)}</dd>
            <dt>{t(S.pitfall)}</dt>
            <dd>
              <LessonRefText text={item.pitfall} onOpenLesson={onModuleChange} />
            </dd>
          </dl>
          {loop ? <p className="pcbFlow-loop">{t(loop)}</p> : null}
        </Callout>
        <Related ids={['pcbStack', 'pcbFab', 'pcbSupply', 'pcbTools']} onOpen={onModuleChange} />
      </Section>

      <RulesSection onOpen={onModuleChange} setNote={setPick} />
      <HuntSection onOpen={onModuleChange} setNote={setPick} />
      <SourceSection onOpen={onModuleChange} setNote={setPick} />
      <PinSection onOpen={onModuleChange} setNote={setPick} />
      <ReviewSection onOpen={onModuleChange} setNote={setPick} />

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((line) => (
            <p key={line.zh}>{t(line)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
