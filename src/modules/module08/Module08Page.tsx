import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { TimingScope } from '../timing/TimingScope'
import { M08_MARKS, TIMING, type TimingMark } from '../timing/glossary'
import { PERIOD, QUIZ, TAKEAWAY, strobeKind } from './data/content'

type Module08PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'term'; id: TimingMark } | { kind: 'takeaway' }

export function Module08Page({ moduleId, onModuleChange }: Module08PageProps) {
  const { t } = useLocale()
  const [strobe, setStrobe] = useState(5)
  const [focus, setFocus] = useState<Focus>({ kind: 'term', id: 'drive' })
  const mark = focus.kind === 'term' ? focus.id : 'strobe'
  const kind = strobeKind(strobe)
  const label =
    kind === 'early' ? t(ui.m08.early) : kind === 'late' ? t(ui.m08.late) : t(ui.m08.window)
  const detail = resolveDetail(focus, t, label)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m08.title)}
      goal={t(ui.m08.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m08.asideLater)}
      nextId="ac"
      nextLabel={t(ui.m08.next)}
    >
      <Section title={t(ui.m08.introTitle)}>
        <p>{t(ui.m08.introBody)}</p>
      </Section>

      <Section title={t(ui.m08.termsTitle)} note={t(ui.m08.termsNote)}>
        <div className="pick pick--3">
          {M08_MARKS.map((id) => (
            <button
              key={id}
              type="button"
              className={`pick__card${mark === id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'term', id })}
            >
              {TIMING[id].title}
            </button>
          ))}
        </div>
        <TimingScope mark={mark} t={t} strobeNs={strobe} replayLabel={t(ui.timing.replay)} />
        <div className="wave">
          <label>
            <span>
              Strobe {strobe.toFixed(1)} ns · {label}
            </span>
            <input
              type="range"
              min={0}
              max={PERIOD}
              step={0.1}
              value={strobe}
              onChange={(event) => {
                setStrobe(Number(event.target.value))
                setFocus({ kind: 'term', id: 'strobe' })
              }}
            />
          </label>
        </div>
      </Section>

      <Section title={t(ui.m08.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m08.quizTitle)} note={t(ui.m08.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m08.yes)} no={t(ui.m08.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(
  focus: Focus,
  t: (text: import('../../i18n/locale').LText | string) => string,
  label: string,
) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m08.kickerTakeaway), title: t(ui.m08.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.id === 'strobe') {
    return {
      kicker: t(ui.m08.kickerWave),
      title: `${TIMING.strobe.title} · ${label}`,
      text: t(TIMING.strobe.text),
    }
  }
  const item = TIMING[focus.id]
  return { kicker: t(ui.m08.kickerTerm), title: item.title, text: t(item.text) }
}
