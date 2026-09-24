import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { CASES, QUIZ, TAKEAWAY, type CaseId } from './data/content'

type Module13PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'case'; id: CaseId } | { kind: 'takeaway' }

export function Module13Page({ moduleId, onModuleChange }: Module13PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'case', id: 'all' })
  const [guesses, setGuesses] = useState<Partial<Record<CaseId, string>>>({})
  const active = CASES.find((item) => item.id === (focus.kind === 'case' ? focus.id : 'all')) ?? CASES[0]
  const picked = guesses[active.id]
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m13.title)}
      goal={t(ui.m13.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m13.asideLater)}
      nextId="shmoo"
      nextLabel={t(ui.m13.next)}
      extra={
        <button type="button" className="linkish" onClick={() => onModuleChange('latch')}>
          {t(ui.m13.latchEntry)}
        </button>
      }
    >
      <Section title={t(ui.m13.introTitle)}>
        <p>{t(ui.m13.introBody)}</p>
      </Section>

      <Section title={t(ui.m13.caseTitle)}>
        <div className="pick pick--3">
          {CASES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'case' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'case', id: item.id })}
            >
              {t(item.title)}
            </button>
          ))}
        </div>
        <div className="case">
          <p>{t(active.scene)}</p>
          <div className="quiz__options">
            {active.options.map((option) => {
              const judged = picked !== undefined
              const isPicked = picked === option.id
              const isAnswer = option.id === active.answer
              let state = ''
              if (judged && isAnswer) state = ' is-right'
              else if (judged && isPicked && !isAnswer) state = ' is-wrong'
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`quiz__option${isPicked ? ' is-picked' : ''}${state}`}
                  onClick={() => setGuesses((prev) => ({ ...prev, [active.id]: option.id }))}
                >
                  {t(option.text)}
                </button>
              )
            })}
          </div>
          {picked !== undefined ? (
            <div className="spec__method">
              <p className={picked === active.answer ? 'is-ok' : 'is-bad'}>
                {picked === active.answer ? t(ui.m13.yes) : t(ui.m13.no)}
                {t(active.explain)}
              </p>
              <p>{t(active.order)}</p>
            </div>
          ) : null}
        </div>
      </Section>

      <Section title={t(ui.m13.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m13.quizTitle)} note={t(ui.m13.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m13.yes)} no={t(ui.m13.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m13.kickerTakeaway), title: t(ui.m13.kickerOne), text: t(TAKEAWAY) }
  }
  const item = CASES.find((node) => node.id === focus.id)
  return { kicker: t(ui.m13.kickerCase), title: item ? t(item.title) : '', text: item ? t(item.scene) : '' }
}
