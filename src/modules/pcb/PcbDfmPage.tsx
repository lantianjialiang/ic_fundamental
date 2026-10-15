import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, type PrepNote } from '../prep/common'
import { GROUPS, INTRO, S } from './data/pcbDfm'
import { QUIZ, TAKEAWAY } from './data/pcbDfmCap'
import { PCB_META } from './meta'
import { CheckSection, ErrorSection } from './PcbDfmSections'
import { CapstoneSection, CaseSection } from './PcbDfmSections2'
import '../prep/prep.css'
import './pcbDfm.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PcbDfmPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const first = GROUPS[0].items[0]
  const [pick, setPick] = useState<PrepNote | null>(null)
  const shown: PrepNote = pick ?? { kicker: S.kickerCheck, title: first.text, text: first.why }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbDfm.title)}
      goal={t(PCB_META.pcbDfm.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="intro"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <CheckSection onOpen={onModuleChange} setNote={setPick} />
      <ErrorSection onOpen={onModuleChange} setNote={setPick} />
      <CaseSection onOpen={onModuleChange} setNote={setPick} />
      <CapstoneSection onOpen={onModuleChange} setNote={setPick} />

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
