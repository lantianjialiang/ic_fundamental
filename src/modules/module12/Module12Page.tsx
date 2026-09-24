import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { FLOW, PIECES, QUIZ, TAKEAWAY, type FlowId, type PieceId } from './data/content'

type Module12PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'flow'; id: FlowId } | { kind: 'piece'; id: PieceId } | { kind: 'takeaway' }

export function Module12Page({ moduleId, onModuleChange }: Module12PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'flow', id: 'power' })
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m12.title)}
      goal={t(ui.m12.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m12.asideLater)}
      nextId="debug"
      nextLabel={t(ui.m12.next)}
    >
      <Section title={t(ui.m12.introTitle)}>
        <p>{t(ui.m12.introBody)}</p>
      </Section>

      <Section title={t(ui.m12.flowTitle)} note={t(ui.m12.flowNote)}>
        <div className="tree">
          <p className="tree__root">Test Flow</p>
          {FLOW.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tree__node${focus.kind === 'flow' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'flow', id: item.id })}
            >
              ├── {item.title}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m12.itemTitle)} note={t(ui.m12.itemNote)}>
        <div className="pipe">
          {PIECES.map((item, index) => (
            <div key={item.id} className="pipe__item">
              {index > 0 ? <span className="pipe__arrow">↓</span> : null}
              <button
                type="button"
                className={`pipe__box${focus.kind === 'piece' && focus.id === item.id ? ' is-active' : ''}`}
                onClick={() => setFocus({ kind: 'piece', id: item.id })}
              >
                {item.title}
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m12.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m12.quizTitle)} note={t(ui.m12.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m12.yes)} no={t(ui.m12.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m12.kickerTakeaway), title: t(ui.m12.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'piece') {
    const item = PIECES.find((node) => node.id === focus.id)
    return { kicker: t(ui.m12.kickerItem), title: item?.title ?? '', text: item ? t(item.text) : '' }
  }
  const item = FLOW.find((node) => node.id === focus.id)
  return { kicker: t(ui.m12.kickerFlow), title: item?.title ?? '', text: item ? t(item.text) : '' }
}
