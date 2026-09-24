import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  ADVANCED,
  CHAINS,
  FF_EXPLAIN,
  QUIZ,
  STEPS,
  TAKEAWAY,
  type AdvId,
  type ChainId,
  type StepId,
} from './data/content'
import { FfFig, ScanFfFig } from './FfFig'
import { ScanKindFig } from './ScanKindFig'

type Module11PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'ff' }
  | { kind: 'chain'; id: ChainId }
  | { kind: 'step'; id: StepId }
  | { kind: 'adv'; id: AdvId }
  | { kind: 'takeaway' }

const ORDER: StepId[] = ['shift1', 'capture', 'shift2', 'compare']

export function Module11Page({ moduleId, onModuleChange }: Module11PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'ff' })
  const [advId, setAdvId] = useState<AdvId>('mux')
  const [playing, setPlaying] = useState(false)
  const [pulse, setPulse] = useState<StepId | null>(null)

  useEffect(() => {
    if (!playing) return
    let step = 0
    setPulse(ORDER[0])
    setFocus({ kind: 'step', id: ORDER[0] })
    const timer = window.setInterval(() => {
      step += 1
      if (step >= ORDER.length) {
        window.clearInterval(timer)
        setPlaying(false)
        setPulse(null)
        return
      }
      const id = ORDER[step]
      setPulse(id)
      setFocus({ kind: 'step', id })
    }, 700)
    return () => window.clearInterval(timer)
  }, [playing])

  const activeStep = focus.kind === 'step' ? focus.id : pulse
  const adv = ADVANCED.find((item) => item.id === advId)
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m11.title)}
      goal={t(ui.m11.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m11.asideLater)}
      nextId="program"
      nextLabel={t(ui.m11.next)}
    >
      <Section title={t(ui.m11.introTitle)}>
        <p>{t(ui.m11.introBody)}</p>
      </Section>

      <Section title={t(ui.m11.ffTitle)} note={t(ui.m11.ffNote)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'ff' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'ff' })}
        >
          {t(ui.m11.ffLead)}
        </button>
        <FfFig t={t} />
        <ScanFfFig t={t} />
        <div className="term-explain">
          {FF_EXPLAIN.map((para) => (
            <p key={para.zh}>{t(para)}</p>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m11.chainTitle)} note={t(ui.m11.chainNote)}>
        <div className="pick pick--2">
          {CHAINS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'chain' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'chain', id: item.id })}
            >
              <strong>{t(item.title)}</strong>
              <span className="mono">{item.diagram}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m11.playTitle)} note={t(ui.m11.playNote)}>
        <div className="steps">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`steps__box${activeStep === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'step', id: item.id })}
            >
              {index + 1}. {item.title}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="lab__btn lab__btn--primary"
          disabled={playing}
          onClick={() => setPlaying(true)}
        >
          {playing ? t(ui.m11.playing) : t(ui.m11.play)}
        </button>
      </Section>

      <Section title={t(ui.m11.advTitle)} note={t(ui.m11.advNote)}>
        <div className="pick pick--3">
          {ADVANCED.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'adv' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => {
                setAdvId(item.id)
                setFocus({ kind: 'adv', id: item.id })
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
        <ScanKindFig id={advId} t={t} />
        {adv ? (
          <div className="term-explain">
            {adv.explain.map((para) => (
              <p key={para.zh}>{t(para)}</p>
            ))}
          </div>
        ) : null}
      </Section>

      <Section title={t(ui.m11.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m11.quizTitle)} note={t(ui.m11.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m11.yes)} no={t(ui.m11.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m11.kickerTakeaway), title: t(ui.m11.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'ff') {
    return { kicker: t(ui.m11.kickerFf), title: 'FF', text: t(FF_EXPLAIN[0]) }
  }
  if (focus.kind === 'adv') {
    const item = ADVANCED.find((node) => node.id === focus.id)
    return { kicker: t(ui.m11.kickerAdv), title: item?.title ?? '', text: item ? t(item.text) : '' }
  }
  if (focus.kind === 'step') {
    const item = STEPS.find((node) => node.id === focus.id)
    return { kicker: t(ui.m11.kickerStep), title: item?.title ?? '', text: item ? t(item.text) : '' }
  }
  const item = CHAINS.find((node) => node.id === focus.id)
  return { kicker: t(ui.m11.kickerChain), title: item ? t(item.title) : '', text: item ? t(item.text) : '' }
}
