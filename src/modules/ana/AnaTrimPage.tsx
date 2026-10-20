import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { TrimCurveFig, TrimFlowFig } from './TrimFig'
import {
  DIE_OPTIONS,
  INTRO,
  METHOD_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './trimData'
import { DEFAULT_TRIM, evaluate, fmtMv, toBits, type TrimMethod, type TrimState } from './trimModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaTrimPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<TrimState>(DEFAULT_TRIM)
  const view = evaluate(state)
  const verdict = verdictOf(view)
  const locked = state.otpCode !== null

  const pickDie = (dieId: string) => {
    if (!locked) {
      setState((prev) => ({ ...prev, dieId }))
    }
  }
  const pickMethod = (method: TrimMethod) => {
    if (!locked) {
      setState((prev) => ({ ...prev, method }))
    }
  }
  const program = () => {
    setState((prev) => (prev.otpCode === null ? { ...prev, otpCode: evaluate(prev).code } : prev))
  }
  const readback = () => {
    setState((prev) => (prev.otpCode === null ? prev : { ...prev, readback: true }))
  }
  const retest = () => {
    setState((prev) => (prev.readback ? { ...prev, retested: true } : prev))
  }
  const reset = () => setState(DEFAULT_TRIM)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaTrim.title)}
      goal={t(ANA_META.anaTrim.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaStats"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaStats.title)}`}
      extra={<TaskList items={taskItems(view)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaLdo', 'anaMeasure', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.dieLabel)}</span>
            <Seg options={DIE_OPTIONS} value={state.dieId} onChange={pickDie} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.methodLabel)}</span>
            <Seg options={METHOD_OPTIONS} value={state.method} onChange={pickMethod} />
          </div>
        </div>

        <div className="ana-grid">
          <TrimCurveFig view={view} />
          <TrimFlowFig view={view} />
        </div>

        <div className="ana-controls">
          <button type="button" className="lab__btn lab__btn--primary" disabled={locked} onClick={program}>
            {t(S.programBtn)}
          </button>
          <button type="button" className="lab__btn" disabled={!locked || state.readback} onClick={readback}>
            {t(S.readBtn)}
          </button>
          <button type="button" className="lab__btn" disabled={!state.readback || state.retested} onClick={retest}>
            {t(S.retestBtn)}
          </button>
          <button type="button" className="lab__btn" onClick={reset}>
            {t(S.resetBtn)}
          </button>
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rOffset, value: fmtMv(view.die.offsetMv) },
              { label: S.rCode, value: `${view.code} (${toBits(view.code)})` },
              { label: S.rMv, value: `${view.mv.toFixed(2)} mV` },
              { label: S.rErr, value: fmtMv(view.err), state: view.ok ? 'pass' : 'fail' },
              { label: S.rCount, value: `${view.measurements}` },
              { label: S.rOtp, value: t(view.programmed ? S.otpWritten : S.otpBlank) },
              { label: S.rReadback, value: t(view.readback ? S.readbackOk : S.notYet) },
              {
                label: S.rRetest,
                value: view.reading === null ? t(S.notYet) : `${view.reading.toFixed(2)} mV`,
                state: view.reading === null ? undefined : view.retestOk ? 'pass' : 'fail',
              },
            ]}
          />
        </div>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
