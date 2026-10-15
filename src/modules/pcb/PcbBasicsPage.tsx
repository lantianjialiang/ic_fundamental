import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, type PrepNote } from '../prep/common'
import { PCB_META } from './meta'
import { SpaceSection, TermsSection, WidthSection } from './BasicsSecA'
import { MarksSection, ImpedanceSection, PourSection } from './BasicsSecB'
import { FootprintSection } from './BasicsSecC'
import { INTRO, S, TERMS, TERMS_S } from './data/pcbBasics'
import { QUIZ } from './data/pcbBasicsQuiz'
import { TAKEAWAY } from './data/pcbBasicsText3'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PcbBasicsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<PrepNote | null>(null)
  const first = TERMS[0]
  const shown: PrepNote = note ?? { kicker: TERMS_S.kicker, title: first.title, text: first.text }
  const sec = { onOpen: onModuleChange, setNote }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbBasics.title)}
      goal={t(PCB_META.pcbBasics.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbLayout"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <TermsSection {...sec} />
      <WidthSection {...sec} />
      <SpaceSection {...sec} />
      <PourSection {...sec} />
      <MarksSection {...sec} />
      <ImpedanceSection {...sec} />
      <FootprintSection {...sec} />

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
