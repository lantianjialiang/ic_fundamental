import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import {
  KINDS,
  PIPE,
  QUIZ,
  SPECS,
  TAKEAWAY,
  VIH_STEPS,
  type KindId,
  type PipeId,
  type QuizId,
  type SpecId,
  type VihStepId,
} from './data/content'

type Module05PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'pipe'; id: PipeId }
  | { kind: 'spec'; id: SpecId }
  | { kind: 'vih'; id: VihStepId }
  | { kind: 'takeaway' }

export function Module05Page({ moduleId, onModuleChange }: Module05PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'pipe', id: 'datasheet' })
  const [selectedSpec, setSelectedSpec] = useState<SpecId | null>(null)
  const [guesses, setGuesses] = useState<Partial<Record<SpecId, KindId>>>({})
  const [answers, setAnswers] = useState<Partial<Record<QuizId, string>>>({})

  const activeSpec = selectedSpec ? SPECS.find((row) => row.id === selectedSpec) : undefined
  const detail = resolveDetail(focus, t)

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m05.title)}
      goal={t(ui.m05.goal)}
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <section className="intro__section">
            <h2>{t(ui.m05.introTitle)}</h2>
            <p>{t(ui.m05.introBody)}</p>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m05.pipeTitle)}</h2>
            <p className="intro__note">{t(ui.m05.pipeNote)}</p>
            <div className="pipe">
              {PIPE.map((step, index) => (
                <div key={step.id} className="pipe__item">
                  {index > 0 ? <span className="pipe__arrow">↓</span> : null}
                  <button
                    type="button"
                    className={`pipe__box${focus.kind === 'pipe' && focus.id === step.id ? ' is-active' : ''}`}
                    onClick={() => setFocus({ kind: 'pipe', id: step.id })}
                  >
                    {t(step.title)}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m05.specTitle)}</h2>
            <p className="intro__note">{t(ui.m05.specNote)}</p>
            <div className="spec">
              {SPECS.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`spec__row${selectedSpec === row.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedSpec(row.id)
                    setFocus({ kind: 'spec', id: row.id })
                  }}
                >
                  <strong>{row.name}</strong>
                  <span>{t(row.limit)}</span>
                </button>
              ))}
            </div>
            {activeSpec ? (
              <div className="spec__work">
                <p className="spec__ask">{t(ui.m05.askKind)}</p>
                <div className="kind">
                  {KINDS.map((kind) => {
                    const picked = guesses[activeSpec.id]
                    const judged = picked !== undefined
                    const isPicked = picked === kind.id
                    const isAnswer = kind.id === activeSpec.kind
                    let state = ''
                    if (judged && isAnswer) state = ' is-right'
                    else if (judged && isPicked && !isAnswer) state = ' is-wrong'
                    return (
                      <button
                        key={kind.id}
                        type="button"
                        className={`kind__btn${isPicked ? ' is-picked' : ''}${state}`}
                        onClick={() =>
                          setGuesses((prev) => ({ ...prev, [activeSpec.id]: kind.id }))
                        }
                      >
                        {t(ui.m05[kind.labelKey])}
                      </button>
                    )
                  })}
                </div>
                {guesses[activeSpec.id] !== undefined ? (
                  <div className="spec__method">
                    <p>
                      {t(ui.m05.family)} {t(activeSpec.familyNote)}
                    </p>
                    <h3>{t(ui.m05.methodTitle)}</h3>
                    <p>{t(activeSpec.method)}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="intro__section">
            <h2>{t(ui.m05.vihTitle)}</h2>
            <p className="intro__note">{t(ui.m05.vihNote)}</p>
            <div className="walk">
              {VIH_STEPS.map((step, index) => (
                <div key={step.id} className="walk__item">
                  {index > 0 ? <span className="pipe__arrow">↓</span> : null}
                  <button
                    type="button"
                    className={`walk__box${focus.kind === 'vih' && focus.id === step.id ? ' is-active' : ''}`}
                    onClick={() => setFocus({ kind: 'vih', id: step.id })}
                  >
                    {t(step.title)}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m05.takeawayTitle)}</h2>
            <button
              type="button"
              className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'takeaway' })}
            >
              {t(TAKEAWAY)}
            </button>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m05.quizTitle)}</h2>
            <p className="intro__note">{t(ui.m05.quizNote)}</p>
            <div className="quiz">
              {QUIZ.map((question, index) => (
                <QuizCard
                  key={question.id}
                  index={index + 1}
                  question={question}
                  picked={answers[question.id]}
                  yes={t(ui.m05.yes)}
                  no={t(ui.m05.no)}
                  onPick={(optionId) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
                  }
                />
              ))}
            </div>
          </section>
        </main>

        <aside className="legend intro__aside">
          <h2>{detail.kicker}</h2>
          <p className="legend__path-title">{detail.title}</p>
          <p className="legend__hint">{detail.text}</p>
          <p className="legend__hint">{t(ui.m05.asideLater)}</p>
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            onClick={() => onModuleChange('dc')}
          >
            {t(ui.m05.next)}
          </button>
        </aside>
      </div>
    </LabShell>
  )
}

function QuizCard({
  index,
  question,
  picked,
  yes,
  no,
  onPick,
}: {
  index: number
  question: (typeof QUIZ)[number]
  picked?: string
  yes: string
  no: string
  onPick: (id: string) => void
}) {
  const { t } = useLocale()
  const judged = picked !== undefined
  const correct = picked === question.answer
  return (
    <div className="quiz__card">
      <p className="quiz__prompt">
        {index}. {t(question.prompt)}
      </p>
      <div className="quiz__options">
        {question.options.map((option) => {
          const isPicked = picked === option.id
          const isAnswer = option.id === question.answer
          let state = ''
          if (judged && isAnswer) state = ' is-right'
          else if (judged && isPicked && !isAnswer) state = ' is-wrong'
          return (
            <button
              key={option.id}
              type="button"
              className={`quiz__option${isPicked ? ' is-picked' : ''}${state}`}
              onClick={() => onPick(option.id)}
            >
              {t(option.text)}
            </button>
          )
        })}
      </div>
      {judged ? (
        <p className={`quiz__explain${correct ? ' is-ok' : ' is-bad'}`}>
          {correct ? yes : no}
          {t(question.explain)}
        </p>
      ) : null}
    </div>
  )
}

function resolveDetail(
  focus: Focus,
  t: (text: LText | string) => string,
): { kicker: string; title: string; text: string } {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m05.kickerTakeaway), title: t(ui.m05.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'spec') {
    const item = SPECS.find((row) => row.id === focus.id)
    return {
      kicker: t(ui.m05.kickerSpec),
      title: item ? `${item.name}  ${t(item.limit)}` : '',
      text: item ? t(item.method) : '',
    }
  }
  if (focus.kind === 'vih') {
    const item = VIH_STEPS.find((step) => step.id === focus.id)
    return {
      kicker: t(ui.m05.kickerVih),
      title: item ? t(item.title) : '',
      text: item ? t(item.text) : '',
    }
  }
  const item = PIPE.find((step) => step.id === focus.id)
  return {
    kicker: t(ui.m05.kickerPipe),
    title: item ? t(item.title) : '',
    text: item ? t(item.text) : '',
  }
}
