import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { Callout, Readout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import { FAULTS, QUIZ, TAKEAWAY, VECTORS, dutOut, type Bit, type FaultId } from './data/content'
import { VectorRunFig } from './VectorRunFig'
import './module07.css'

type Module07PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

const NO_FLIP = VECTORS.map(() => false)

export function Module07Page({ moduleId, onModuleChange }: Module07PageProps) {
  const { t } = useLocale()
  const player = useStepPlayer(VECTORS.length, 1500)
  const [fault, setFault] = useState<FaultId>('none')
  const [flipped, setFlipped] = useState<boolean[]>(NO_FLIP)

  const expected = VECTORS.map((row, i) => (flipped[i] ? 1 - row.y : row.y) as Bit)
  const failRows = VECTORS.map((row, i) => (dutOut(row, fault).y === expected[i] ? 0 : i + 1)).filter(
    (n) => n > 0 && n <= player.step + 1,
  )
  const row = VECTORS[player.step]
  const char = (bit: Bit) => (bit ? 'H' : 'L')
  const tampered = flipped.some(Boolean)
  const faultText = FAULTS.find((item) => item.id === fault)?.text
  const asideText =
    fault !== 'none' && faultText ? t(faultText) : tampered ? t(ui.m07.tamperNote) : t(ui.m07.rowNote)

  const restart = () => player.reset()

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m07.title)}
      goal={t(ui.m07.goal)}
      kicker={`${t(ui.m07.kickerVec)} ${player.step + 1} / ${VECTORS.length}`}
      asideTitle={`A=${row.a} B=${row.b} → ${t(ui.m07.expectY)} ${char(expected[player.step])}`}
      asideText={asideText}
      asideLater={t(ui.m07.asideLater)}
      nextId="timing"
      nextLabel={t(ui.m07.next)}
    >
      <Section title={t(ui.m07.introTitle)}>
        <p>{t(ui.m07.introBody)}</p>
      </Section>

      <Section title={t(ui.m07.tableTitle)} note={t(ui.m07.tableNote)}>
        <Seg
          options={FAULTS.map((item) => ({ id: item.id, label: item.label }))}
          value={fault}
          onChange={(id) => {
            setFault(id)
            restart()
          }}
        />
        <VectorRunFig
          step={player.step}
          expected={expected}
          flipped={flipped}
          fault={fault}
          onPick={player.goTo}
          onFlip={(i) => {
            setFlipped((prev) => prev.map((v, k) => (k === i ? !v : v)))
            player.goTo(i)
          }}
        />
        <StepControls
          player={player}
          nextLabel={ui.m07.nextRow}
          stepLabels={VECTORS.map((vec) => ({ zh: `A=${vec.a} B=${vec.b}`, en: `A=${vec.a} B=${vec.b}` }))}
        />
        <div className="row-actions">
          <button type="button" className="lab__btn" disabled={!tampered} onClick={() => setFlipped(NO_FLIP)}>
            {t(ui.m07.restore)}
          </button>
        </div>
        <Readout
          items={[
            { label: ui.m07.ran, value: `${player.step + 1} / ${VECTORS.length}` },
            {
              label: ui.m07.failRows,
              value: failRows.length ? failRows.join(', ') : '—',
              state: failRows.length ? 'fail' : 'pass',
            },
          ]}
        />
        <Callout tone={fault === 'none' && !tampered ? 'ok' : 'warn'}>{asideText}</Callout>
        <p className="intro__note">{t(ui.m07.charsNote)}</p>
      </Section>

      <Section title={t(ui.m07.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m07.quizTitle)} note={t(ui.m07.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m07.yes)} no={t(ui.m07.no)} />
      </Section>
    </LessonFrame>
  )
}
