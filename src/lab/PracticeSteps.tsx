import { useLocale } from '../i18n/LocaleContext'
import { loc } from '../i18n/locale'
import { type TaskItem } from './TaskList'
import './TaskList.css'

/** 练习区顶部的步骤，文案与右侧任务卡同一条、同一顺序 */
export const PRACTICE_NOTE = loc(
  '下面的步骤和右侧任务卡是同一顺序。先按这一步把条件设好，再读算出来的数；任务里不写答案，数和原因出现在你设好之后。',
  'The steps below are the same task cards, in the same order. Set this step’s conditions, then read the number you get. The task does not state the answer; the number and the reason show up after you set it.',
)

export const LEARN_TITLE = loc('先看懂', 'Learn this first')

export function PracticeSteps({ items }: { items: TaskItem[] }) {
  const { t } = useLocale()
  return (
    <ol className="lab-steps">
      {items.map((item, index) => (
        <li key={item.id} className={item.done ? 'is-done' : undefined}>
          <span className="lab-steps__n">{index + 1}</span>
          <span>{t(item.text)}</span>
        </li>
      ))}
    </ol>
  )
}
