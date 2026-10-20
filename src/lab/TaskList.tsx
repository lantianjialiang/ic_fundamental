import { useLocale } from '../i18n/LocaleContext'
import { loc, type LText } from '../i18n/locale'
import './TaskList.css'

/** 任务卡：done 由实验当前参数实时算出，不单独存状态，所以重置就能还原 */
export type TaskItem = { id: string; text: LText; done: boolean }

export const TASK_TEXT = {
  title: loc('任务卡', 'Task cards'),
  note: loc('完成情况由当前参数自动判定，改参数后即时更新。', 'Judged automatically from the current settings; updates as you change them.'),
  done: loc('已完成', 'Done'),
  todo: loc('未完成', 'To do'),
  reset: loc('重置实验', 'Reset experiment'),
}

export function TaskList({ items, onReset }: { items: TaskItem[]; onReset: () => void }) {
  const { t } = useLocale()
  const doneCount = items.filter((item) => item.done).length
  return (
    <div className="task-list">
      <p className="task-list__head">
        <b>{t(TASK_TEXT.title)}</b>
        <span>{`${doneCount} / ${items.length}`}</span>
      </p>
      <p className="task-list__note">{t(TASK_TEXT.note)}</p>
      <ol className="task-list__items">
        {items.map((item) => (
          <li key={item.id} className={`task-list__item${item.done ? ' is-done' : ''}`}>
            <span className="task-list__mark" aria-label={t(item.done ? TASK_TEXT.done : TASK_TEXT.todo)}>
              {item.done ? '✓' : '○'}
            </span>
            <span>{t(item.text)}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="lab__btn" onClick={onReset}>
        {t(TASK_TEXT.reset)}
      </button>
    </div>
  )
}
