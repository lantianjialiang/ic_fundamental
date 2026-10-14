import { type KeyboardEvent, type ReactNode } from 'react'
import { LessonChips, LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { type ModuleId } from '../catalog'

export const PREP_TEXT = {
  related: loc('相关课程：', 'Related lessons: '),
  illustrative: loc('示意图', 'Illustration'),
}

/** SVG 里可点的元素：回车 / 空格也能选中 */
export function keyPick(fn: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fn()
    }
  }
}

export function Hit({
  label,
  active,
  onPick,
  children,
}: {
  label: string
  active: boolean
  onPick: () => void
  children: ReactNode
}) {
  return (
    <g role="button" tabIndex={0} aria-label={label} aria-pressed={active} className="prep-hit" onClick={onPick} onKeyDown={keyPick(onPick)}>
      {children}
    </g>
  )
}

/** 一段正文；其中的 {@课程ID} 显示成可点的课程编号 */
export function RefP({ text, onOpen }: { text: LText; onOpen: (id: ModuleId) => void }) {
  return (
    <p>
      <LessonRefText text={text} onOpenLesson={onOpen} />
    </p>
  )
}

export function RefParas({ paras, onOpen }: { paras: LText[]; onOpen: (id: ModuleId) => void }) {
  return (
    <>
      {paras.map((para) => (
        <RefP key={para.zh} text={para} onOpen={onOpen} />
      ))}
    </>
  )
}

/** 节末「相关课程」小签 */
export function Related({ ids, onOpen }: { ids: readonly ModuleId[]; onOpen: (id: ModuleId) => void }) {
  return <LessonChips label={PREP_TEXT.related} lessons={ids} onOpenLesson={onOpen} />
}

/** 侧栏说明：kicker / 标题 / 正文 */
export type PrepNote = { kicker: LText; title: LText; text: LText }

export function useT() {
  return useLocale().t
}
