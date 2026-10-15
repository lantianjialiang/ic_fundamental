import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { LessonFrame, Section } from '../lab/LessonFrame'
import { type ModuleId } from './catalog'
import { LESSON_TITLE } from './titles'

const L = {
  kicker: loc('建设中', 'In progress'),
  text: loc('这一课正在编写。', 'This lesson is being written.'),
}

/** 课程还没写好时的占位页 */
export function StubLesson({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(LESSON_TITLE[moduleId])}
      goal=""
      kicker={t(L.kicker)}
      asideTitle={t(LESSON_TITLE[moduleId])}
      asideText={t(L.text)}
    >
      <Section title={t(L.kicker)}>
        <p>{t(L.text)}</p>
      </Section>
    </LessonFrame>
  )
}
