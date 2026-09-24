import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import {
  LOOP,
  PE,
  PMU_TEASER,
  QUIZ,
  TAKEAWAY,
  type LoopId,
  type PeId,
  type QuizId,
} from './data/content'

type Module03PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'loop'; id: LoopId }
  | { kind: 'pe'; id: PeId }
  | { kind: 'pmu' }
  | { kind: 'takeaway' }

const CYCLE: LoopId[] = ['tester', 'drive', 'dut', 'compare']

export function Module03Page({ moduleId, onModuleChange }: Module03PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'takeaway' })
  const [pulse, setPulse] = useState<LoopId | null>(null)
  const [playing, setPlaying] = useState(false)
  const [answers, setAnswers] = useState<Partial<Record<QuizId, string>>>({})

  useEffect(() => {
    if (!playing) return
    let step = 0
    setPulse(CYCLE[0])
    setFocus({ kind: 'loop', id: CYCLE[0] })
    const timer = window.setInterval(() => {
      step += 1
      if (step >= CYCLE.length) {
        window.clearInterval(timer)
        setPlaying(false)
        setPulse(null)
        return
      }
      const id = CYCLE[step]
      setPulse(id)
      setFocus({ kind: 'loop', id })
    }, 700)
    return () => window.clearInterval(timer)
  }, [playing])

  const detail = resolveDetail(focus, t)
  const activeLoop = focus.kind === 'loop' ? focus.id : pulse

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m03.title)}
      goal={t(ui.m03.goal)}
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <section className="intro__section">
            <h2>{t(ui.m03.introTitle)}</h2>
            <p>{t(ui.m03.introBody)}</p>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m03.loopTitle)}</h2>
            <p className="intro__note">{t(ui.m03.loopNote)}</p>
            <div className="loop">
              <LoopBox id="tester" active={activeLoop === 'tester'} onFocus={setFocus} />
              <div className="loop__fork" aria-hidden="true">
                <span>│</span>
                <span>┌──────┴──────┐</span>
              </div>
              <div className="loop__row">
                <LoopBox id="drive" active={activeLoop === 'drive'} onFocus={setFocus} />
                <span className="loop__gap"> </span>
                <LoopBox id="compare" active={activeLoop === 'compare'} onFocus={setFocus} />
              </div>
              <div className="loop__mid" aria-hidden="true">
                <span>{t(ui.m03.give)}</span>
                <span>{t(ui.m03.see)}</span>
              </div>
              <LoopBox id="dut" active={activeLoop === 'dut'} onFocus={setFocus} />
              <p className="loop__caption">{t(ui.m03.loopCaption)}</p>
              <button
                type="button"
                className="lab__btn lab__btn--primary"
                onClick={() => setPlaying(true)}
                disabled={playing}
              >
                {playing ? t(ui.m03.playing) : t(ui.m03.play)}
              </button>
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m03.peTitle)}</h2>
            <p className="intro__note">{t(ui.m03.peNote)}</p>
            <div className="pe">
              {PE.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pe__card${focus.kind === 'pe' && focus.id === item.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'pe', id: item.id })}
                >
                  <strong>{item.title}</strong>
                  <span>{t(item.full)}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`pe__pmu${focus.kind === 'pmu' ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'pmu' })}
            >
              {t(ui.m03.pmuEntry)}
            </button>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m03.takeawayTitle)}</h2>
            <button
              type="button"
              className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'takeaway' })}
            >
              {t(TAKEAWAY)}
            </button>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m03.quizTitle)}</h2>
            <p className="intro__note">{t(ui.m03.quizNote)}</p>
            <div className="quiz">
              {QUIZ.map((question, index) => (
                <QuizCard
                  key={question.id}
                  index={index + 1}
                  question={question}
                  picked={answers[question.id]}
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
          <p className="legend__hint">{t(ui.m03.asideLater)}</p>
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            onClick={() => onModuleChange('pmu')}
          >
            {t(ui.m03.next)}
          </button>
        </aside>
      </div>
    </LabShell>
  )
}

function LoopBox({
  id,
  active,
  onFocus,
}: {
  id: LoopId
  active: boolean
  onFocus: (focus: Focus) => void
}) {
  const item = LOOP.find((node) => node.id === id)
  if (!item) return null
  return (
    <button
      type="button"
      className={`loop__box${active ? ' is-active' : ''}${id === 'dut' ? ' loop__box--dut' : ''}`}
      onClick={() => onFocus({ kind: 'loop', id })}
    >
      {item.title}
    </button>
  )
}

function QuizCard({
  index,
  question,
  picked,
  onPick,
}: {
  index: number
  question: (typeof QUIZ)[number]
  picked?: string
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
          {correct ? t(ui.m03.yes) : t(ui.m03.no)}
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
    return { kicker: t(ui.m03.kickerTakeaway), title: t(ui.m03.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'pmu') {
    return { kicker: t(ui.m03.kickerNext), title: 'PMU', text: t(PMU_TEASER) }
  }
  if (focus.kind === 'pe') {
    const item = PE.find((node) => node.id === focus.id)
    return {
      kicker: t(ui.m03.kickerPe),
      title: item ? `${item.title} · ${t(item.full)}` : '',
      text: item ? t(item.text) : '',
    }
  }
  const item = LOOP.find((node) => node.id === focus.id)
  return { kicker: t(ui.m03.kickerLoop), title: item?.title ?? '', text: item ? t(item.text) : '' }
}
