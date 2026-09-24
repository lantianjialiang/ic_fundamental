import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import {
  CONTINUITY,
  PARAMS,
  QUIZ,
  TAKEAWAY,
  VIH,
  VIL,
  VMAX,
  logicOf,
  type ContId,
  type ParamId,
  type QuizId,
} from './data/content'

type Module04PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'scale' }
  | { kind: 'param'; id: ParamId }
  | { kind: 'cont'; id: ContId }
  | { kind: 'takeaway' }

export function Module04Page({ moduleId, onModuleChange }: Module04PageProps) {
  const { t } = useLocale()
  const [volts, setVolts] = useState(1.2)
  const [focus, setFocus] = useState<Focus>({ kind: 'scale' })
  const [answers, setAnswers] = useState<Partial<Record<QuizId, string>>>({})

  const logic = logicOf(volts)
  const logicLabel = logic === '1' ? t(ui.m04.high) : logic === '0' ? t(ui.m04.low) : t(ui.m04.mid)
  const detail = resolveDetail(focus, t)

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m04.title)}
      goal={t(ui.m04.goal)}
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <section className="intro__section">
            <h2>{t(ui.m04.introTitle)}</h2>
            <p>{t(ui.m04.introBody)}</p>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m04.scaleTitle)}</h2>
            <p className="intro__note">{t(ui.m04.scaleNote)}</p>
            <div className="scale">
              <button
                type="button"
                className={`scale__pane${focus.kind === 'scale' ? ' is-active' : ''}`}
                onClick={() => setFocus({ kind: 'scale' })}
              >
                <p className="scale__label">{t(ui.m04.digital)}</p>
                <VoltageBar volts={volts} mode="digital" now={t(ui.m04.now)} />
                <p className="scale__read">
                  {t(ui.m04.logic)} {logicLabel}
                </p>
                <p className="scale__hint">{t(ui.m04.digitalHint)}</p>
              </button>
              <button
                type="button"
                className={`scale__pane${focus.kind === 'scale' ? ' is-active' : ''}`}
                onClick={() => setFocus({ kind: 'scale' })}
              >
                <p className="scale__label">{t(ui.m04.parametric)}</p>
                <VoltageBar volts={volts} mode="param" now={t(ui.m04.now)} />
                <p className="scale__read">
                  {t(ui.m04.volts)} {volts.toFixed(2)} V
                </p>
                <p className="scale__hint">{t(ui.m04.paramHint)}</p>
              </button>
            </div>
            <label className="scale__slider">
              <span>
                {t(ui.m04.now)} {volts.toFixed(2)} V
              </span>
              <input
                type="range"
                min={0}
                max={VMAX}
                step={0.05}
                value={volts}
                onChange={(event) => {
                  setVolts(Number(event.target.value))
                  setFocus({ kind: 'scale' })
                }}
              />
            </label>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m04.paramsTitle)}</h2>
            <p className="intro__note">{t(ui.m04.paramsNote)}</p>
            <div className="param">
              {PARAMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`param__card${focus.kind === 'param' && focus.id === item.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'param', id: item.id })}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m04.contTitle)}</h2>
            <p className="intro__note">{t(ui.m04.contNote)}</p>
            <div className="cont">
              {CONTINUITY.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cont__card${focus.kind === 'cont' && focus.id === item.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'cont', id: item.id })}
                >
                  <strong>{item.id === 'open' ? t(ui.m04.open) : t(ui.m04.short)}</strong>
                  <span>
                    {t(ui.m04.force)} 100 µA → {t(ui.m04.measure)} {item.volts.toFixed(2)} V
                  </span>
                  <em>{t(item.verdict)}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m04.takeawayTitle)}</h2>
            <button
              type="button"
              className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'takeaway' })}
            >
              {t(TAKEAWAY)}
            </button>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m04.quizTitle)}</h2>
            <p className="intro__note">{t(ui.m04.quizNote)}</p>
            <div className="quiz">
              {QUIZ.map((question, index) => (
                <QuizCard
                  key={question.id}
                  index={index + 1}
                  question={question}
                  picked={answers[question.id]}
                  yes={t(ui.m04.yes)}
                  no={t(ui.m04.no)}
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
          <p className="legend__hint">{t(ui.m04.asideLater)}</p>
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            onClick={() => onModuleChange('spec')}
          >
            {t(ui.m04.next)}
          </button>
        </aside>
      </div>
    </LabShell>
  )
}

function VoltageBar({
  volts,
  mode,
  now,
}: {
  volts: number
  mode: 'digital' | 'param'
  now: string
}) {
  const { t } = useLocale()
  const pct = (volts / VMAX) * 100
  const vilPct = (VIL / VMAX) * 100
  const vihPct = (VIH / VMAX) * 100

  return (
    <div className={`vbar vbar--${mode}`} aria-hidden="true">
      {mode === 'digital' ? (
        <>
          <span className="vbar__zone vbar__zone--lo" style={{ width: `${vilPct}%` }} />
          <span className="vbar__zone vbar__zone--x" style={{ width: `${vihPct - vilPct}%` }} />
          <span className="vbar__zone vbar__zone--hi" style={{ width: `${100 - vihPct}%` }} />
          <span className="vbar__tick" style={{ left: `${vilPct}%` }} title={t(ui.m04.vilLine)} />
          <span className="vbar__tick" style={{ left: `${vihPct}%` }} title={t(ui.m04.vihLine)} />
        </>
      ) : (
        <span className="vbar__zone vbar__zone--param" />
      )}
      <span className="vbar__needle" style={{ left: `${pct}%` }} title={`${now} ${volts.toFixed(2)} V`} />
    </div>
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
    return { kicker: t(ui.m04.kickerTakeaway), title: t(ui.m04.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'param') {
    const item = PARAMS.find((node) => node.id === focus.id)
    return {
      kicker: t(ui.m04.kickerParam),
      title: item?.title ?? '',
      text: item ? t(item.text) : '',
    }
  }
  if (focus.kind === 'cont') {
    const item = CONTINUITY.find((node) => node.id === focus.id)
    return {
      kicker: t(ui.m04.kickerCont),
      title: focus.id === 'open' ? t(ui.m04.open) : t(ui.m04.short),
      text: item ? t(item.text) : '',
    }
  }
  return {
    kicker: t(ui.m04.kickerScale),
    title: `${t(ui.m04.digital)} / ${t(ui.m04.parametric)}`,
    text: t(ui.m04.scaleNote),
  }
}
