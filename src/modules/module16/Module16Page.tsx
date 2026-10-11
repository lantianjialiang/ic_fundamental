import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards } from '../fund/parts'
import { LatchupFig } from './LatchupFig'
import { PARTS, PHASES, QUIZ, TAKEAWAY, TEST_NOTE, type PartId } from './data/content'

type Module16PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'part' } | { kind: 'phase' } | { kind: 'takeaway' }

export function Module16Page({ moduleId, onModuleChange }: Module16PageProps) {
  const { t } = useLocale()
  const [part, setPart] = useState<PartId>('pnpn')
  const [focus, setFocus] = useState<Focus>({ kind: 'part' })
  const player = useStepPlayer(PHASES.length, 1600)
  const item = PARTS.find((x) => x.id === part) ?? PARTS[0]
  const phase = PHASES[player.step]

  const pickPart = (id: PartId) => {
    setPart(id)
    setFocus({ kind: 'part' })
  }

  const aside: { kicker: LText; title: LText; text: LText } =
    focus.kind === 'takeaway'
      ? { kicker: ui.m16.kickerTakeaway, title: ui.m16.takeawayTitle, text: TAKEAWAY }
      : focus.kind === 'phase'
        ? { kicker: ui.m16.kickerAnim, title: phase.title, text: phase.text }
        : { kicker: ui.m16.kickerFig, title: item.title, text: item.text }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m16.title)}
      goal={t(ui.m16.goal)}
      kicker={t(aside.kicker)}
      asideTitle={t(aside.title)}
      asideText={t(aside.text)}
      asideLater={t(ui.m16.asideLater)}
      nextId="bench"
      nextLabel={t(ui.m16.next)}
    >
      <Section title={t(ui.m16.introTitle)}>
        <p>{t(ui.m16.introBody)}</p>
      </Section>

      <Section title={t(ui.m16.figTitle)} note={t(ui.m16.figNote)}>
        <Cards items={PARTS} activeId={part} onPick={(x) => pickPart(x.id)} cols={3} />
        <LatchupFig part={part} phase={null} onPick={pickPart} />
        <Callout>
          <p>
            <b>{t(item.title)}</b> · {t(item.text)}
          </p>
        </Callout>
      </Section>

      <Section title={t(ui.m16.animTitle)} note={t(ui.m16.animNote)}>
        <div onClickCapture={() => setFocus({ kind: 'phase' })}>
          <StepControls player={player} stepLabels={PHASES.map((x) => x.title)} />
        </div>
        <LatchupFig part={null} phase={player.step} />
        <Callout tone={player.step >= 3 && player.step <= 4 ? 'bad' : player.step === 5 ? 'ok' : player.step === 0 ? undefined : 'warn'}>
          <p>
            <b>
              {player.step}. {t(phase.title)}
            </b>
          </p>
          <p>{t(phase.text)}</p>
        </Callout>
      </Section>

      <Section title={t(ui.m16.testTitle)}>
        <p>{t(TEST_NOTE)}</p>
      </Section>

      <Section title={t(ui.m16.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m16.quizTitle)} note={t(ui.m16.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m16.yes)} no={t(ui.m16.no)} />
      </Section>
    </LessonFrame>
  )
}
