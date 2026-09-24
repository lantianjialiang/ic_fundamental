import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { CONCEPTS, POW2, QUIZ, TAKEAWAY, type ConceptId } from './data/content'

type Module10PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'exp'; bits: number } | { kind: 'concept'; id: ConceptId } | { kind: 'takeaway' }

export function Module10Page({ moduleId, onModuleChange }: Module10PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'exp', bits: 32 })
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m10.title)}
      goal={t(ui.m10.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m10.asideLater)}
      nextId="scan"
      nextLabel={t(ui.m10.next)}
    >
      <Section title={t(ui.m10.introTitle)}>
        <p>{t(ui.m10.introBody)}</p>
      </Section>

      <Section title={t(ui.m10.expTitle)} note={t(ui.m10.expNote)}>
        <div className="pick pick--4">
          {POW2.map((item) => (
            <button
              key={item.bits}
              type="button"
              className={`pick__card${focus.kind === 'exp' && focus.bits === item.bits ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'exp', bits: item.bits })}
            >
              <strong>2^{item.bits}</strong>
              <span>{item.count}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m10.conceptsTitle)} note={t(ui.m10.conceptsNote)}>
        <div className="pick pick--3">
          {CONCEPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'concept' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'concept', id: item.id })}
            >
              {item.title}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m10.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m10.quizTitle)} note={t(ui.m10.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m10.yes)} no={t(ui.m10.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m10.kickerTakeaway), title: t(ui.m10.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'concept') {
    const item = CONCEPTS.find((node) => node.id === focus.id)
    return { kicker: t(ui.m10.kickerConcept), title: item?.title ?? '', text: item ? t(item.text) : '' }
  }
  const item = POW2.find((node) => node.bits === focus.bits)
  return {
    kicker: t(ui.m10.kickerExp),
    title: item ? `2^${item.bits} = ${item.count}` : '',
    text: item ? t(item.note) : '',
  }
}
