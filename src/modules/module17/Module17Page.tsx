import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { BenchLab, type BenchNote } from './BenchLab'
import { QUIZ } from './data/content'

type Module17PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

/** 独立的交互实验课（bench 轨道 X01）：实验台 + 旁注 + 测验。合并进 VATE 的版本见 vate/VatePage.tsx */
export function Module17Page({ moduleId, onModuleChange }: Module17PageProps) {
  const { t } = useLocale()
  const [benchNote, setBenchNote] = useState<BenchNote>({ kicker: '', title: '', text: '' })
  const [quizFocus, setQuizFocus] = useState(false)
  const note: BenchNote = quizFocus
    ? { kicker: t(ui.m17.kickerQuiz), title: t(ui.m17.quizTitle), text: t(ui.m17.quizNote) }
    : benchNote

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m17.title)}
      goal={t(ui.m17.goal)}
      kicker={note.kicker}
      asideTitle={note.title}
      asideText={note.text}
      asideLater={t(ui.m17.asideLater)}
      nextId="vate"
      nextLabel={t(ui.m17.next)}
    >
      <Section title={t(ui.m17.introTitle)}>
        <p>{t(ui.m17.introBody)}</p>
      </Section>

      <BenchLab
        onNote={(next) => {
          setBenchNote(next)
          setQuizFocus(false)
        }}
      />

      <Section title={t(ui.m17.quizTitle)} note={t(ui.m17.quizNote)}>
        <div onClick={() => setQuizFocus(true)}>
          <QuizList questions={QUIZ} yes={t(ui.m17.yes)} no={t(ui.m17.no)} />
        </div>
      </Section>
    </LessonFrame>
  )
}
