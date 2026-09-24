import { useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { type LText } from '../i18n/locale'

export type QuizQuestion = {
  id: string
  prompt: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
}

type QuizListProps = {
  questions: QuizQuestion[]
  yes: string
  no: string
}

export function QuizList({ questions, yes, no }: QuizListProps) {
  const { t } = useLocale()
  const [answers, setAnswers] = useState<Record<string, string>>({})

  return (
    <div className="quiz">
      {questions.map((question, index) => {
        const picked = answers[question.id]
        const judged = picked !== undefined
        const correct = picked === question.answer
        return (
          <div key={question.id} className="quiz__card">
            <p className="quiz__prompt">
              {index + 1}. {t(question.prompt)}
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
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
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
      })}
    </div>
  )
}
