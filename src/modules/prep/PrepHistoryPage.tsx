import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import { CHIPS, EVENTS, EXHAUST_BODY, INTRO, QUIZ, S, TAKEAWAY, VECTOR_RATE, fmtCount, fmtDuration, verdict, type EventId } from './data/history'
import { CountChartFig, ExhaustBarFig, TimelineFig } from './HistoryFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUP[Number(d)])
    .join('')

function pow2(n: number) {
  if (n <= 20) {
    return (2 ** n).toLocaleString('en-US')
  }
  const exp = Math.floor(n * Math.log10(2))
  const mant = 2 ** n / 10 ** exp
  return `${mant.toFixed(2)} × 10${sup(exp)}`
}

export function PrepHistoryPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [event, setEvent] = useState<EventId>(EVENTS[0].id)
  const [chip, setChip] = useState(CHIPS[0].id)
  const [bits, setBits] = useState(8)
  const [note, setNote] = useState<PrepNote | null>(null)

  const ev = EVENTS.find((e) => e.id === event) ?? EVENTS[0]
  const chipItem = CHIPS.find((c) => c.id === chip) ?? CHIPS[0]
  const seconds = 2 ** bits / VECTOR_RATE
  const judge = verdict(seconds)
  const shown: PrepNote = note ?? { kicker: S.kickerTime, title: ev.title, text: ev.text }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pHistory.title)}
      goal={t(ui.pHistory.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pSilicon"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.timeTitle)} note={t(S.timeNote)}>
        <TimelineFig
          active={event}
          onPick={(id) => {
            setEvent(id)
            setNote(null)
          }}
        />
        <Callout tone="warn">
          <p>
            <b>{`${ev.year} · ${t(ev.title)}`}</b>
          </p>
          <p>{t(ev.text)}</p>
          <p>
            <b>{t(S.impact)}</b>
            {t(ev.impact)}
          </p>
        </Callout>
        <Related ids={ev.links} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.countTitle)} note={t(S.countNote)}>
        <CountChartFig
          active={chip}
          onPick={(id) => {
            setChip(id)
            const c = CHIPS.find((item) => item.id === id)
            if (c) {
              setNote({ kicker: S.kickerCount, title: { zh: `${c.name} · ${c.year}`, en: `${c.name} · ${c.year}` }, text: fmtCount(c.count) })
            }
          }}
        />
        <Readout
          items={[
            { label: chipItem.name, value: String(chipItem.year) },
            { label: S.kickerCount, value: t(fmtCount(chipItem.count)) },
          ]}
        />
      </Section>

      <Section title={t(S.exhaustTitle)} note={t(S.exhaustNote)}>
        <div className="knob-row">
          <Knob label={S.bits} value={bits} unit="" min={8} max={64} step={1} onChange={setBits} />
        </div>
        <Readout
          items={[
            { label: S.patterns, value: pow2(bits) },
            { label: S.time, value: t(fmtDuration(seconds)), state: judge.tone === 'ok' ? 'pass' : judge.tone === 'bad' ? 'fail' : undefined },
          ]}
        />
        <ExhaustBarFig seconds={seconds} tone={judge.tone} />
        <Callout tone={judge.tone === 'ok' ? 'ok' : judge.tone === 'bad' ? 'bad' : 'warn'}>
          <p>{t(judge.text)}</p>
        </Callout>
        {EXHAUST_BODY.map((para) => (
          <RefP key={para.zh} text={para} onOpen={onModuleChange} />
        ))}
        <Related ids={['vector', 'scan', 'fVector', 'fScan']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
