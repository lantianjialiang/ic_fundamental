import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { MARKS, QUIZ, TAKEAWAY, TPD, acPass, freqOf, type MarkId } from './data/content'

type Module09PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'mark'; id: MarkId } | { kind: 'fmax' } | { kind: 'takeaway' }

export function Module09Page({ moduleId, onModuleChange }: Module09PageProps) {
  const { t } = useLocale()
  const [period, setPeriod] = useState(16)
  const [focus, setFocus] = useState<Focus>({ kind: 'mark', id: 'tpd' })
  const pass = acPass(period)
  const freq = freqOf(period)
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m09.title)}
      goal={t(ui.m09.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m09.asideLater)}
      nextId="vector"
      nextLabel={t(ui.m09.next)}
    >
      <Section title={t(ui.m09.introTitle)}>
        <p>{t(ui.m09.introBody)}</p>
      </Section>

      <Section title={t(ui.m09.marksTitle)} note={t(ui.m09.marksNote)}>
        <div className="wave wave--marks">
          <div className="wave__row">
            <span>IN</span>
            <div className="wave__bar">
              <i style={{ marginLeft: '8%', width: '30%' }} />
            </div>
          </div>
          <div className="wave__row">
            <span>OUT</span>
            <div className="wave__bar">
              <i style={{ marginLeft: `${8 + TPD * 2}%`, width: '30%' }} />
            </div>
          </div>
          <p className="wave__cap">tpd ≈ {TPD} ns</p>
        </div>
        <div className="pick pick--3">
          {MARKS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'mark' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'mark', id: item.id })}
            >
              {item.title}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m09.fmaxTitle)} note={t(ui.m09.fmaxNote)}>
        <div className="meter">
          <label>
            <span>
              {t(ui.m09.period)} {period.toFixed(0)} ns ≈ {freq.toFixed(0)} MHz
            </span>
            <input
              type="range"
              min={6}
              max={20}
              step={0.5}
              value={period}
              onChange={(event) => {
                setPeriod(Number(event.target.value))
                setFocus({ kind: 'fmax' })
              }}
            />
          </label>
          <p>
            <b className={pass ? 'is-ok' : 'is-bad'}>{pass ? 'PASS' : 'FAIL'}</b>
            {pass
              ? `  ${freq.toFixed(0)} MHz ${t({ zh: '仍来得及' })}`
              : `  ${t({ zh: 'Period 已短过 tpd + 余量，功能向量 Fail' })}`}
          </p>
        </div>
      </Section>

      <Section title={t(ui.m09.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m09.quizTitle)} note={t(ui.m09.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m09.yes)} no={t(ui.m09.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m09.kickerTakeaway), title: t(ui.m09.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'fmax') {
    return {
      kicker: t(ui.m09.kickerFmax),
      title: 'fMAX',
      text: t({ zh: '教学门槛约 100 MHz（Period 10 ns）。再短，同一套向量也会 Fail。' }),
    }
  }
  const item = MARKS.find((node) => node.id === focus.id)
  return { kicker: t(ui.m09.kickerMark), title: item?.title ?? '', text: item ? t(item.text) : '' }
}
