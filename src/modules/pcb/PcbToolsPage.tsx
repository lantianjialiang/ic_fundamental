import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, type PrepNote } from '../prep/common'
import { FILES, INTRO, S, TAKEAWAY } from './data/pcbTools'
import { WALK } from './data/pcbToolsSteps'
import { QUIZ } from './data/pcbToolsQuiz'
import { PCB_META } from './meta'
import { FIRST_FILE, TreeSection, WalkSection } from './ToolsSections'
import { DrcSection, KeysSection } from './ToolsSections2'
import { OrderSection, QuoteSection } from './ToolsSections3'
import '../prep/prep.css'
import './pcbTools.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PcbToolsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const flow = useStepPlayer(WALK.length, 2600)
  const [pick, setPick] = useState<PrepNote | null>(null)
  const [walking, setWalking] = useState(false)
  const first = FILES[FIRST_FILE]
  const item = WALK[flow.step]
  const shown: PrepNote =
    pick ??
    (walking
      ? { kicker: S.kickerStep, title: item.title, text: item.text }
      : { kicker: S.kickerFile, title: first.title, text: first.inside })

  // 操作步骤播放器时，侧栏回到当前步骤的说明
  const touch = () => {
    setPick(null)
    setWalking(true)
  }
  const player = {
    ...flow,
    next: () => {
      touch()
      flow.next()
    },
    goTo: (i: number) => {
      touch()
      flow.goTo(i)
    },
    toggle: () => {
      touch()
      flow.toggle()
    },
    reset: () => {
      touch()
      flow.reset()
    },
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbTools.title)}
      goal={t(PCB_META.pcbTools.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbDfm"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <TreeSection onOpen={onModuleChange} setNote={setPick} />
      <WalkSection player={player} onOpen={onModuleChange} />
      <DrcSection onOpen={onModuleChange} setNote={setPick} />
      <KeysSection onOpen={onModuleChange} />
      <OrderSection onOpen={onModuleChange} setNote={setPick} />
      <QuoteSection onOpen={onModuleChange} setNote={setPick} />

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
