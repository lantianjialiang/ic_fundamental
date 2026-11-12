import type { ReactNode } from 'react'
import { LessonChips, LessonRefText } from '../home/LessonRefText'
import { useLocale } from '../i18n/LocaleContext'
import { loc, type LText } from '../i18n/locale'
import type { ModuleId } from '../modules/catalog'

export type PanelProps = { onOpenLesson: (id: ModuleId) => void }

export const RELATED = loc('相关课程：', 'Related lessons:')

export function Seg({
  label,
  items,
  activeId,
  onPick,
}: {
  label: LText
  items: ReadonlyArray<{ id: string; label: LText }>
  activeId: string
  onPick: (id: string) => void
}) {
  const { t } = useLocale()
  return (
    <div className="seg" role="group" aria-label={t(label)}>
      {items.map((item) => (
        <button key={item.id} type="button" className={item.id === activeId ? 'is-active' : ''} onClick={() => onPick(item.id)}>
          {t(item.label)}
        </button>
      ))}
    </div>
  )
}

export function Outcome({ tone, text }: { tone: 'hint' | 'bad' | 'ok'; text: LText | null }) {
  const { t } = useLocale()
  if (!text) return null
  if (tone === 'hint') return <p className="tools-hint">{t(text)}</p>
  return (
    <div className={tone === 'ok' ? 'callout callout--ok' : 'callout callout--bad'}>
      <p>{t(text)}</p>
    </div>
  )
}

export function Note({ text, lessons, onOpenLesson }: { text: LText; lessons: ModuleId[]; onOpenLesson: (id: ModuleId) => void }) {
  return (
    <>
      <div className="callout">
        <p>
          <LessonRefText text={text} onOpenLesson={onOpenLesson} />
        </p>
      </div>
      <LessonChips label={RELATED} lessons={lessons} onOpenLesson={onOpenLesson} />
    </>
  )
}

export function Field({
  id,
  label,
  value,
  onChange,
  readOnly,
  bad,
  onFocus,
  inputMode = 'decimal',
  after,
}: {
  id: string
  label: LText
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  bad?: boolean
  onFocus?: () => void
  inputMode?: 'decimal' | 'text' | 'numeric'
  after?: ReactNode
}) {
  const { t } = useLocale()
  return (
    <div className={`tools-field${readOnly ? '' : ' is-source'}`}>
      <label htmlFor={id}>{t(label)}</label>
      <div className="tools-field__box">
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          maxLength={inputMode === 'text' ? 256 : 64}
          readOnly={readOnly}
          className={bad ? 'is-bad' : undefined}
          onFocus={onFocus}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        />
        {after}
      </div>
    </div>
  )
}

export function CheckField({
  id,
  label,
  checked,
  onChecked,
  value,
  onChange,
  after,
}: {
  id: string
  label: LText
  checked: boolean
  onChecked: (checked: boolean) => void
  value: string
  onChange: (value: string) => void
  after?: ReactNode
}) {
  const { t } = useLocale()
  return (
    <div className={`tools-field${checked ? ' is-source' : ''}`}>
      <label className="tools-check" htmlFor={`${id}-known`}>
        <input id={`${id}-known`} type="checkbox" checked={checked} onChange={(event) => onChecked(event.target.checked)} />
        <span>{t(label)}</span>
      </label>
      <div className="tools-field__box">
        <input
          id={id}
          value={value}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          readOnly={!checked}
          onChange={(event) => onChange(event.target.value)}
        />
        {after}
      </div>
    </div>
  )
}

export const EMPTY = loc('输入一个数。', 'Enter a number.')
export const BAD_NUM = loc('这里要填数字，例如 6 或 0.15。', 'Enter a number, such as 6 or 0.15.')

export function readNumber(text: string): number | null {
  const body = text.trim().replace(/,/g, '')
  if (!body || body === '-' || body === '.' || body === '-.') return null
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(body)) return null
  const value = Number(body)
  return Number.isFinite(value) ? value : null
}
