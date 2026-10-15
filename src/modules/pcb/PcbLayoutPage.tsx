import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, type PrepNote } from '../prep/common'
import { INTRO, S, TAKEAWAY } from './data/pcbLayout'
import { PROBLEMS } from './data/pcbLayoutBoard'
import { QUIZ } from './data/pcbLayoutQuiz'
import { BoardSection, DecapSection, RulesSection, boardNote } from './LayoutSections'
import { ReturnSection } from './LayoutReturn'
import { PCB_META } from './meta'
import '../prep/prep.css'
import './pcbLayout.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PcbLayoutPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<PrepNote | null>(null)
  // 默认说明：第一个互动（坏布局）里排在最前面的问题
  const shown: PrepNote = note ?? boardNote('bad', PROBLEMS[0])
  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbLayout.title)}
      goal={t(PCB_META.pcbLayout.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbTools"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <BoardSection onOpen={onModuleChange} setNote={setNote} />
      <DecapSection onOpen={onModuleChange} setNote={setNote} />
      <ReturnSection onOpen={onModuleChange} setNote={setNote} />
      <RulesSection onOpen={onModuleChange} setNote={setNote} />

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
