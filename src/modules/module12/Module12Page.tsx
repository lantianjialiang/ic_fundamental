import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { Callout, Cards, Readout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import {
  CASES,
  FAIL_OPTIONS,
  FLOW_TEXT,
  L,
  QUIZ,
  TAKEAWAY,
  TESTS,
  flowFrames,
  type CaseId,
  type FailPick,
  type FlowFrame,
} from './data/content'
import { ProgramFlowFig } from './ProgramFlowFig'
import './program.css'

type Module12PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module12Page({ moduleId, onModuleChange }: Module12PageProps) {
  const { t } = useLocale()
  const [fail, setFail] = useState<FailPick>('func')
  const frames = useMemo(() => flowFrames(fail), [fail])
  const player = useStepPlayer(frames.length, 1200)
  const frame = frames[Math.min(player.step, frames.length - 1)]
  const [focus, setFocus] = useState<'flow' | CaseId>('flow')
  const [caseId, setCaseId] = useState<CaseId>('all')
  const [guesses, setGuesses] = useState<Partial<Record<CaseId, string>>>({})

  const caption = (f: FlowFrame): string => {
    if (f.at === 'start') return t(FLOW_TEXT.start)
    if (f.at === 'bin') return f.from === null ? t(FLOW_TEXT.binPass) : t(FLOW_TEXT.binFail).replace('{bin}', String(f.bin))
    const item = TESTS[f.i]
    return `${t(item.name)}${t(L.sep)}${t(item.why)} ${t(f.pass ? FLOW_TEXT.pass : FLOW_TEXT.fail)}`
  }

  const stepLabel = (f: FlowFrame): LText => {
    if (f.at === 'start') return L.start
    if (f.at === 'test') return TESTS[f.i].name
    return loc(`Bin ${f.bin}`, `Bin ${f.bin}`)
  }

  const active = CASES.find((item) => item.id === caseId) ?? CASES[0]
  const picked = guesses[active.id]
  const item = frame.at === 'test' ? TESTS[frame.i] : null

  const aside =
    focus === 'flow'
      ? { kicker: t(L.kickerFlow), title: t(stepLabel(frame)), text: caption(frame) }
      : { kicker: t(L.kickerCase), title: t(active.title), text: t(active.scene) }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m12.title)}
      goal={t(ui.m12.goal)}
      kicker={aside.kicker}
      asideTitle={aside.title}
      asideText={aside.text}
      asideLater={t(ui.m12.asideLater)}
      nextId="shmoo"
      nextLabel={t(ui.m12.next) + t(ui.m14.title)}
      extra={
        <button type="button" className="linkish" onClick={() => onModuleChange('latch')}>
          {t(L.latch)}
        </button>
      }
    >
      <Section title={t(L.introTitle)}>
        <p>{t(L.introBody)}</p>
      </Section>

      <Section title={t(L.flowTitle)} note={t(L.flowNote)}>
        <div className="m12-pick">
          <span>{t(L.failPick)}</span>
          <Seg
            options={FAIL_OPTIONS}
            value={fail}
            onChange={(id) => {
              setFail(id)
              setFocus('flow')
              player.reset()
            }}
          />
        </div>
        <ProgramFlowFig frame={frame} frames={frames} />
        <Callout tone={frame.at === 'bin' ? (frame.from === null ? 'ok' : 'bad') : undefined}>
          <p>{caption(frame)}</p>
        </Callout>
        {item ? (
          <Readout
            items={[
              { label: L.colCond, value: t(item.cond) },
              { label: L.colVec, value: t(item.vec) },
              { label: L.colLimit, value: t(item.limit) },
              { label: L.colBin, value: `Bin ${item.bin}` },
            ]}
          />
        ) : null}
        <div onClickCapture={() => setFocus('flow')}>
          <StepControls player={player} stepLabels={frames.map(stepLabel)} />
        </div>
      </Section>

      <Section title={t(L.debugTitle)} note={t(L.caseNote)}>
        <p>{t(L.debugBody)}</p>
        <Cards
          items={CASES.map((c) => ({ id: c.id, title: c.title, text: c.scene }))}
          activeId={caseId}
          cols={3}
          onPick={(c) => {
            setCaseId(c.id)
            setFocus(c.id)
          }}
        />
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
                  onClick={() => {
                    setGuesses((prev) => ({ ...prev, [active.id]: option.id }))
                    setFocus(active.id)
                  }}
                >
                  {t(option.text)}
                </button>
              )
            })}
          </div>
          {picked !== undefined ? (
            <div className="spec__method">
              <p className={picked === active.answer ? 'is-ok' : 'is-bad'}>
                {picked === active.answer ? t(L.yes) : t(L.no)}
                {t(active.explain)}
              </p>
              <p>{t(active.order)}</p>
            </div>
          ) : null}
        </div>
      </Section>

      <Section title={t(L.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((line) => (
            <p key={line.zh}>{t(line)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(L.quizTitle)} note={t(L.quizNote)}>
        <QuizList questions={QUIZ} yes={t(L.yes)} no={t(L.no)} />
      </Section>
    </LessonFrame>
  )
}
