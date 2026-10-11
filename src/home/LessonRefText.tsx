import { Fragment } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { pick, type LText } from '../i18n/locale'
import { MODULE_IDS, type ModuleId } from '../modules/catalog'
import { LESSON_TITLE } from '../modules/titles'
import { lessonCode } from '../tracks/catalog'
import './extras.css'

const isModule = (value: string): value is ModuleId => (MODULE_IDS as readonly string[]).includes(value)

/** 显示一段文案，把其中的 {@课程ID} 换成可点击的课程编号 */
export function LessonRefText({ text, onOpenLesson }: { text: LText; onOpenLesson: (id: ModuleId) => void }) {
  const { locale, t } = useLocale()
  const parts = pick(text, locale).split(/\{@(\w+)\}/)
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>
        if (!isModule(part)) return <Fragment key={index}>{part}</Fragment>
        return (
          <button
            key={index}
            type="button"
            className="lesson-ref"
            title={t(LESSON_TITLE[part])}
            onClick={() => onOpenLesson(part)}
          >
            {lessonCode(part)}
          </button>
        )
      })}
    </>
  )
}

/** 一排课程编号小签，点了进那一课 */
export function LessonChips({
  label,
  lessons,
  onOpenLesson,
}: {
  label: LText
  lessons: readonly ModuleId[]
  onOpenLesson: (id: ModuleId) => void
}) {
  const { t } = useLocale()
  if (lessons.length === 0) return null
  return (
    <p className="ref-chips">
      <span>{t(label)}</span>
      {lessons.map((id) => (
        <button key={id} type="button" className="ref-chip" title={t(LESSON_TITLE[id])} onClick={() => onOpenLesson(id)}>
          {lessonCode(id)}
        </button>
      ))}
    </p>
  )
}
