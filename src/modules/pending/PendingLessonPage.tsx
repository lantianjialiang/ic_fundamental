import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { LabShell } from '../../lab/LabShell'
import { Section } from '../../lab/LessonFrame'
import { ANA_META } from '../ana/meta'
import { type ModuleId } from '../catalog'
import { HS_META } from '../hs/meta'
import { type LessonMeta } from '../lessonMeta'
import { LESSON_TITLE } from '../titles'

const PENDING_TEXT = {
  title: loc('本课还在开发中', 'This lesson is still in development'),
  body: loc(
    '上方是这一课的学习目标。课程正文、交互实验、任务卡和小测完成后，会在这里开放。',
    'The goal above is the planned outcome of this lesson. The text, interactive experiment, task cards and quiz will open here once they are ready.',
  ),
}

const PENDING_META: Partial<Record<ModuleId, LessonMeta>> = { ...ANA_META, ...HS_META }

type PendingLessonPageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function PendingLessonPage({ moduleId, onModuleChange }: PendingLessonPageProps) {
  const { t } = useLocale()
  const meta = PENDING_META[moduleId]
  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(LESSON_TITLE[moduleId])}
      goal={meta ? t(meta.goal) : ''}
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <Section title={t(PENDING_TEXT.title)}>
            <p>{t(PENDING_TEXT.body)}</p>
          </Section>
        </main>
      </div>
    </LabShell>
  )
}
