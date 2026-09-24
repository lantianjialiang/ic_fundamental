import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  PERIOD,
  QUIZ,
  TAKEAWAY,
  TERMS,
  VALID_FROM,
  VALID_TO,
  strobeKind,
  type TermId,
} from './data/content'

type Module08PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'wave' } | { kind: 'term'; id: TermId } | { kind: 'takeaway' }

export function Module08Page({ moduleId, onModuleChange }: Module08PageProps) {
  const { t } = useLocale()
  const [strobe, setStrobe] = useState(5)
  const [focus, setFocus] = useState<Focus>({ kind: 'wave' })
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

      <Section title={t(ui.m08.waveTitle)} note={t(ui.m08.waveNote)}>
        <div className="wave" onClick={() => setFocus({ kind: 'wave' })}>
          <WaveRow name="CLK" delay={0} width={28} />
          <WaveRow name="DATA" delay={8} width={70} />
          <WaveRow name="OUT" delay={(VALID_FROM / PERIOD) * 100} width={55} />
          <div className="wave__track">
            <span className="wave__win" style={{ left: `${(VALID_FROM / PERIOD) * 100}%`, width: `${((VALID_TO - VALID_FROM) / PERIOD) * 100}%` }} />
            <span className="wave__strobe" style={{ left: `${(strobe / PERIOD) * 100}%` }} />
          </div>
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
                setFocus({ kind: 'wave' })
              }}
            />
          </label>
        </div>
      </Section>

      <Section title={t(ui.m08.termsTitle)} note={t(ui.m08.termsNote)}>
        <div className="pick pick--3">
          {TERMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'term' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'term', id: item.id })}
            >
              {item.title}
            </button>
          ))}
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

function WaveRow({ name, delay, width }: { name: string; delay: number; width: number }) {
  return (
    <div className="wave__row">
      <span>{name}</span>
      <div className="wave__bar">
        <i style={{ marginLeft: `${delay}%`, width: `${width}%` }} />
      </div>
    </div>
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
  if (focus.kind === 'term') {
    const item = TERMS.find((node) => node.id === focus.id)
    return { kicker: t(ui.m08.kickerTerm), title: item?.title ?? '', text: item ? t(item.text) : '' }
  }
  return {
    kicker: t(ui.m08.kickerWave),
    title: label,
    text: t({
      zh: '黄线是 Strobe。灰带是输出已稳定的窗口。线在带外，好芯片也会判错。',
    }),
  }
}
