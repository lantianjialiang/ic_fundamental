import { useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList, type QuizQuestion } from '../../lab/QuizList'
import { TaskList, type TaskItem } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import { type LessonMeta } from '../lessonMeta'
import '../prep/prep.css'
import './mfg.css'

export const COMMON = {
  teach: loc('教学示意：金额、周期、良率、尺寸都是相对量级，不是任何公司的报价或工艺数据。', 'Teaching illustration: money, cycle time, yield and sizes are relative magnitudes, not any company’s quote or process data.'),
  vendor: loc('厂商技术名，仅作概念示例。', 'Vendor technology name, conceptual example only.'),
  specNote: loc('以现行公开规范为准；这里的数字是教学示意。', 'Follow the current public spec; numbers here are teaching illustrations.'),
  kicker: loc('读数', 'Readout'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  takeTitle: loc('带走这几句', 'Key takeaways'),
  missTitle: loc('常见误区', 'Common mistakes'),
  learnTitle: loc('先看懂', 'Learn this first'),
  practiceTitle: loc('练一练', 'Now practice'),
  practiceNote: loc(
    '下面的步骤和右侧任务卡是同一顺序：第 1 步就是第 1 张卡。做完这一步，才在步骤下面解释你读到的数。',
    'The steps below follow the task cards on the right: step 1 is card 1. The number is explained under the step only after you finish it.',
  ),
  introTitle: loc('这一课在讲什么', 'What this lesson covers'),
}

type Props = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
  meta: LessonMeta
  nextId: ModuleId
  nextLabel: LText
  later: LText
  intro: LText[]
  related?: ModuleId[]
  kicker: LText
  asideTitle: LText
  asideText: LText
  tasks: TaskItem[]
  onReset: () => void
  learn: ReactNode
  practice: ReactNode
  misconceptions: LText[]
  takeaway: LText[]
  quiz: QuizQuestion[]
  notice?: LText
}

export function PackLesson({
  moduleId,
  onModuleChange,
  meta,
  nextId,
  nextLabel,
  later,
  intro,
  related,
  kicker,
  asideTitle,
  asideText,
  tasks,
  onReset,
  learn,
  practice,
  misconceptions,
  takeaway,
  quiz,
  notice,
}: Props) {
  const { t } = useLocale()
  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(meta.title)}
      goal={t(meta.goal)}
      kicker={t(kicker)}
      asideTitle={t(asideTitle)}
      asideText={t(asideText)}
      asideLater={t(later)}
      nextId={nextId}
      nextLabel={t(nextLabel)}
      extra={<TaskList items={tasks} onReset={onReset} />}
    >
      <Section title={t(COMMON.introTitle)}>
        <RefParas paras={intro} onOpen={onModuleChange} />
        <Callout tone="warn">
          <p>{t(COMMON.teach)}</p>
          {notice ? <p>{t(notice)}</p> : null}
        </Callout>
        {related && related.length > 0 ? <Related ids={related} onOpen={onModuleChange} /> : null}
      </Section>
      <Section title={t(COMMON.learnTitle)}>{learn}</Section>
      <Section title={t(COMMON.missTitle)}>
        <Callout>
          {misconceptions.map((item) => (
            <p key={item.en}>{t(item)}</p>
          ))}
        </Callout>
      </Section>
      <Section title={t(COMMON.practiceTitle)} note={t(COMMON.practiceNote)}>
        {practice}
      </Section>
      <Section title={t(COMMON.takeTitle)}>
        <Callout tone="warn">
          {takeaway.map((item) => (
            <p key={item.en}>{t(item)}</p>
          ))}
        </Callout>
      </Section>
      <Section title={t(COMMON.quizTitle)} note={t(COMMON.quizNote)}>
        <QuizList questions={quiz} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}

export function near(value: number, target: number, tol: number) {
  return Math.abs(value - target) <= tol
}

/** 条件一旦达到就保持完成，方便后面的步骤改参数。重置时调用 reset。 */
export function useSticky(active: boolean) {
  const [hit, setHit] = useState(false)
  if (active && !hit) setHit(true)
  return { hit, reset: () => setHit(false) }
}

export function Drill({ n, title, children }: { n: number; title: LText; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <section className="mfg-drill">
      <h3>
        {n}. {t(title)}
      </h3>
      {children}
    </section>
  )
}

/** 这一步还没做完时不展示结论；做完后把读数和原因放在一起。 */
export function After({ show, text }: { show: boolean; text: LText }) {
  const { t } = useLocale()
  if (!show) return null
  return (
    <Callout tone="ok">
      <p>{t(text)}</p>
    </Callout>
  )
}
