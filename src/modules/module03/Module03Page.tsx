import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Seg, type Note } from '../fund/parts'
import { ChannelFig } from './ChannelFig'
import { CASES, INTRO, OTHERS, PE, QUIZ, STEPS, TAKEAWAY, type DutCase, type PeId } from './data/content'
import './module03.css'

type Module03PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module03Page({ moduleId, onModuleChange }: Module03PageProps) {
  const { t } = useLocale()
  const player = useStepPlayer(STEPS.length, 1600)
  const [dut, setDut] = useState<DutCase>(CASES[0].id)
  const [pe, setPe] = useState<PeId>(PE[0].id)
  const [note, setNote] = useState<Note>({ kicker: ui.m03.kickerPe, title: PE[0].title, text: PE[0].text })

  const cur = STEPS[player.step]
  const last = player.step === STEPS.length - 1

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m03.title)}
      goal={t(ui.m03.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      nextId="pmu"
      nextLabel={t(ui.m03.next)}
    >
      <Section title={t(ui.m03.introTitle)}>
        {INTRO.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      <Section title={t(ui.m03.cycleTitle)} note={t(ui.m03.cycleNote)}>
        <Seg options={CASES.map((c) => ({ id: c.id, label: c.label }))} value={dut} onChange={setDut} />
        <ChannelFig step={player.step} dut={dut} focus={pe} />
        <div className="m03-step">
          <b>{`${player.step + 1} / ${STEPS.length} · ${t(cur.label)}`}</b>
          <span>{t(cur.text)}</span>
          {last ? (
            <span className={dut === 'good' ? 'm03-ok' : 'm03-bad'}>{t(dut === 'good' ? ui.m03.passNote : ui.m03.failNote)}</span>
          ) : null}
        </div>
        <StepControls player={player} stepLabels={STEPS.map((s) => s.label)} />
      </Section>

      <Section title={t(ui.m03.peTitle)} note={t(ui.m03.peNote)}>
        <Cards
          items={PE}
          activeId={pe}
          cols={4}
          onPick={(item) => {
            setPe(item.id)
            setNote({ kicker: ui.m03.kickerPe, title: item.title, text: item.text })
          }}
        />
        <Callout>{t(OTHERS)}</Callout>
      </Section>

      <Section title={t(ui.m03.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m03.quizTitle)} note={t(ui.m03.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m03.yes)} no={t(ui.m03.no)} />
      </Section>
    </LessonFrame>
  )
}
