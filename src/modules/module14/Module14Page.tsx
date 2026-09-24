import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { FREQS, QUIZ, TAKEAWAY, VOLTS, YIELD, cellPass, cellText } from './data/content'

type Module14PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Cell = { v: number; f: number }

type Focus = { kind: 'cell'; cell: Cell } | { kind: 'yield' } | { kind: 'takeaway' }

export function Module14Page({ moduleId, onModuleChange }: Module14PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'cell', cell: { v: 1.0, f: 90 } })
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m14.title)}
      goal={t(ui.m14.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m14.asideLater)}
      nextId="alu"
      nextLabel={t(ui.m14.next)}
    >
      <Section title={t(ui.m14.introTitle)}>
        <p>{t(ui.m14.introBody)}</p>
      </Section>

      <Section title={t(ui.m14.gridTitle)} note={t(ui.m14.gridNote)}>
        <div className="shmoo">
          <div className="shmoo__grid" style={{ gridTemplateColumns: `48px repeat(${FREQS.length}, 1fr)` }}>
            <span />
            {FREQS.map((f) => (
              <span key={f} className="shmoo__h">
                {f}
              </span>
            ))}
            {[...VOLTS].reverse().map((v) => (
              <ShmooRow
                key={v}
                v={v}
                active={focus.kind === 'cell' ? focus.cell : null}
                onPick={(cell) => setFocus({ kind: 'cell', cell })}
              />
            ))}
          </div>
          <p className="intro__note">Voltage ↑ · Frequency →</p>
        </div>
      </Section>

      <Section title={t(ui.m14.yieldTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'yield' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'yield' })}
        >
          {t(YIELD)}
        </button>
      </Section>

      <Section title={t(ui.m14.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m14.quizTitle)} note={t(ui.m14.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m14.yes)} no={t(ui.m14.no)} />
      </Section>
    </LessonFrame>
  )
}

function ShmooRow({
  v,
  active,
  onPick,
}: {
  v: number
  active: Cell | null
  onPick: (cell: Cell) => void
}) {
  return (
    <>
      <span className="shmoo__v">{v.toFixed(1)}</span>
      {FREQS.map((f) => {
        const pass = cellPass(v, f)
        const isActive = active?.v === v && active.f === f
        return (
          <button
            key={f}
            type="button"
            className={`shmoo__cell${pass ? ' is-pass' : ' is-fail'}${isActive ? ' is-active' : ''}`}
            onClick={() => onPick({ v, f })}
          >
            {pass ? 'P' : 'F'}
          </button>
        )
      })}
    </>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m14.kickerTakeaway), title: t(ui.m14.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'yield') {
    return { kicker: t(ui.m14.kickerYield), title: 'Yield / Bin', text: t(YIELD) }
  }
  const pass = cellPass(focus.cell.v, focus.cell.f)
  return {
    kicker: t(ui.m14.kickerCell),
    title: `${focus.cell.v.toFixed(1)} V · ${focus.cell.f} MHz · ${pass ? 'P' : 'F'}`,
    text: t(cellText(focus.cell.v, focus.cell.f, pass)),
  }
}
