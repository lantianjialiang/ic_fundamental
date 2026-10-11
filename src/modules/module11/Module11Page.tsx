import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { Callout, Seg } from '../fund/parts'
import { type ModuleId } from '../catalog'
import { ADVANCED, BIG_STEPS, FAULTS, L, PHASE_LABEL, QUIZ, TAKEAWAY, buildFrames, type FaultId } from './data/content'
import { FfFig } from './FfFig'
import { ScanPlayFig } from './ScanPlayFig'
import './scan.css'

type Module11PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module11Page({ moduleId, onModuleChange }: Module11PageProps) {
  const { t } = useLocale()
  const [fault, setFault] = useState<FaultId>('none')
  const frames = useMemo(() => buildFrames(fault), [fault])
  const player = useStepPlayer(frames.length, 1100)
  const frame = frames[Math.min(player.step, frames.length - 1)]
  const tone = frame.phase === 'compare' ? (fault === 'none' ? 'ok' : 'bad') : undefined

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m11.title)}
      goal={t(ui.m11.goal)}
      kicker={t(L.kicker)}
      asideTitle={t(PHASE_LABEL[frame.phase])}
      asideText={t(frame.caption)}
      asideLater={t(ui.m11.asideLater)}
      nextId="program"
      nextLabel={t(ui.m11.next) + t(ui.m12.title)}
    >
      <Section title={t(L.introTitle)}>
        <p>{t(L.introBody)}</p>
      </Section>

      <Section title={t(L.ffTitle)} note={t(L.ffNote)}>
        <FfFig />
      </Section>

      <Section title={t(L.playTitle)} note={t(L.playNote)}>
        <div className="m11-faults">
          <Seg options={FAULTS} value={fault} onChange={setFault} />
        </div>
        <div className="steps">
          {BIG_STEPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`steps__box${item.phases.includes(frame.phase) ? ' is-active' : ''}`}
              onClick={() => player.goTo(frames.findIndex((f) => item.phases.includes(f.phase)))}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
        <ScanPlayFig frame={frame} fault={fault} />
        <Callout tone={tone}>
          <p className="m11-caption">{t(frame.caption)}</p>
        </Callout>
        <StepControls player={player} stepLabels={frames.map((f) => PHASE_LABEL[f.phase])} />
      </Section>

      <Section title={t(L.advTitle)} note={t(L.advNote)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(L.colName)}</th>
              <th>{t(L.colWhat)}</th>
            </tr>
          </thead>
          <tbody>
            {ADVANCED.map((row) => (
              <tr key={row.id}>
                <td>{t(row.name)}</td>
                <td>{t(row.what)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="intro__note">{t(L.advMore)}</p>
      </Section>

      <Section title={t(L.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(L.quizTitle)} note={t(L.quizNote)}>
        <QuizList questions={QUIZ} yes={t(L.yes)} no={t(L.no)} />
      </Section>
    </LessonFrame>
  )
}
