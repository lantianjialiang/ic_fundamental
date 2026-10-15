import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Callout, Readout } from '../fund/parts'
import { RefP } from '../prep/common'
import { CHECK, CHECK_PASS, CHECK_TEXT } from './data/mosPrimerQuiz'

/** 学前自测：答完全部题后按得分给出「跳过 / 学完」建议 */
export function PrimerCheck({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const answered = CHECK.filter((q) => answers[q.id] !== undefined).length
  const correct = CHECK.filter((q) => answers[q.id] === q.answer).length
  const done = answered === CHECK.length
  const pass = correct >= CHECK_PASS

  return (
    <>
      <div className="quiz">
        {CHECK.map((question, index) => {
          const picked = answers[question.id]
          const judged = picked !== undefined
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
                  if (judged && isAnswer) {
                    state = ' is-right'
                  } else if (judged && isPicked) {
                    state = ' is-wrong'
                  }
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
              {judged ? <p className={`quiz__explain${picked === question.answer ? ' is-ok' : ' is-bad'}`}>{t(question.explain)}</p> : null}
            </div>
          )
        })}
      </div>
      <div className="prep-actions">
        <Readout
          items={[
            { label: CHECK_TEXT.progress, value: `${answered} / ${CHECK.length}` },
            { label: CHECK_TEXT.score, value: `${correct} / ${CHECK.length}`, state: done ? (pass ? 'pass' : 'fail') : undefined },
          ]}
        />
        <button type="button" className="lab__btn" onClick={() => setAnswers({})} disabled={answered === 0}>
          {t(CHECK_TEXT.reset)}
        </button>
      </div>
      {done ? (
        <Callout tone={pass ? 'ok' : 'warn'}>
          <RefP text={pass ? CHECK_TEXT.skip : CHECK_TEXT.study} onOpen={onOpen} />
        </Callout>
      ) : null}
    </>
  )
}
