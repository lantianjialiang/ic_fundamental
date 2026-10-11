import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { Callout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import { DUTS, GUESS, LAYERS, QUIZ, TAKEAWAY, type Family } from './data/content'
import { SpecPipeFig } from './SpecPipeFig'
import './module05.css'

type Module05PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module05Page({ moduleId, onModuleChange }: Module05PageProps) {
  const { t } = useLocale()
  const player = useStepPlayer(LAYERS.length, 2200)
  const [dut, setDut] = useState<'good' | 'bad'>('good')
  const [guesses, setGuesses] = useState<Record<string, Family>>({})
  const layer = LAYERS[player.step]
  const threshold = DUTS.find((item) => item.id === dut)?.threshold ?? 1.6

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m05.title)}
      goal={t(ui.m05.goal)}
      kicker={`${t(ui.m05.kickerPipe)} ${player.step + 1} / ${LAYERS.length}`}
      asideTitle={layer.name}
      asideText={t(layer.text)}
      asideLater={t(ui.m05.asideLater)}
      nextId="dc"
      nextLabel={t(ui.m05.next)}
    >
      <Section title={t(ui.m05.introTitle)}>
        <p>{t(ui.m05.introBody)}</p>
      </Section>

      <Section title={t(ui.m05.pipeTitle)} note={t(ui.m05.pipeNote)}>
        <Seg options={DUTS.map((item) => ({ id: item.id, label: item.label }))} value={dut} onChange={setDut} />
        <SpecPipeFig step={player.step} threshold={threshold} onPick={player.goTo} />
        <StepControls player={player} stepLabels={LAYERS.map((item) => item.sub)} />
        <Callout tone={dut === 'good' ? 'ok' : 'bad'}>
          {t(dut === 'good' ? ui.m05.dutGood : ui.m05.dutBad)}
        </Callout>
      </Section>

      <Section title={t(ui.m05.guessTitle)} note={t(ui.m05.guessNote)}>
        <div className="m05-guess">
          {GUESS.map((row) => {
            const picked = guesses[row.id]
            return (
              <div key={row.id} className="m05-guess__row">
                <b>{row.name}</b>
                <span>{row.limit}</span>
                <div className="kind">
                  {(['dc', 'ac'] as const).map((family) => {
                    let state = ''
                    if (picked && family === row.family) state = ' is-right'
                    else if (picked === family) state = ' is-wrong'
                    return (
                      <button
                        key={family}
                        type="button"
                        className={`kind__btn${picked === family ? ' is-picked' : ''}${state}`}
                        onClick={() => setGuesses((prev) => ({ ...prev, [row.id]: family }))}
                      >
                        {family.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
                <em>{picked ? t(row.why) : ''}</em>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title={t(ui.m05.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m05.quizTitle)} note={t(ui.m05.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m05.yes)} no={t(ui.m05.no)} />
      </Section>
    </LessonFrame>
  )
}
