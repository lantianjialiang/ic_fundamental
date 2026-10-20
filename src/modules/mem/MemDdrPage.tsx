import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, Steps } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { DdrMarginFig, DdrStripFig } from './MemDdrFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './memDdrData'
import {
  DEFAULT_DDR,
  DQ_COUNT,
  EYE_MAX,
  EYE_MIN,
  EYE_STEP,
  RATES,
  SKEW_MAX,
  SKEW_MIN,
  SKEW_STEP,
  analyseDdr,
  type DdrState,
} from './memDdrModel'
import { MEM_META } from './meta'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

export function MemDdrPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DdrState>(DEFAULT_DDR)
  const analysis = useMemo(() => analyseDdr(state), [state])
  const verdict = verdictOf(analysis)
  const update = (patch: Partial<DdrState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_DDR)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memDdr.title)}
      goal={t(MEM_META.memDdr.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memBist"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memDram', 'hsTiming', 'hsEye']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.cmdTitle)} note={t(S.cmdNote)}>
        <Steps items={[S.cmdCa, S.cmdDq, S.cmdDqs]} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <Knob label={S.eyeLabel} value={state.eyeFrac} unit="UI" min={EYE_MIN} max={EYE_MAX} step={EYE_STEP} onChange={(eyeFrac) => update({ eyeFrac })} />
          <Knob label={S.skewLabel} value={state.skew} unit="UI" min={SKEW_MIN} max={SKEW_MAX} step={SKEW_STEP} onChange={(skew) => update({ skew })} />
          <Knob
            label={S.delayLabel}
            value={analysis.delay}
            unit="ps"
            min={0}
            max={Math.round(analysis.ui)}
            step={1}
            onChange={(delay) => update({ delay })}
          />
        </div>
        <div className="hs-controls">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={!analysis.open}
            onClick={() => update({ delay: Math.round(analysis.trained) })}
          >
            {t(S.trainBtn)}
          </button>
          <button type="button" className="lab__btn" onClick={() => update({ delay: Math.round(analysis.dq0Centre) })}>
            {t(S.dq0Btn)}
          </button>
        </div>

        <div className="hs-grid">
          <div>
            <DdrStripFig analysis={analysis} />
            <DdrMarginFig analysis={analysis} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(1)} ps` },
                {
                  label: S.rWindow,
                  value: analysis.open ? `${analysis.lo.toFixed(0)} – ${analysis.hi.toFixed(0)} ps` : t(S.closed),
                  state: analysis.open ? 'pass' : 'fail',
                },
                { label: S.rCentre, value: analysis.open ? `${analysis.trained.toFixed(0)} ps` : '—' },
                { label: S.rMargin, value: analysis.open ? `${((analysis.hi - analysis.lo) / 2).toFixed(1)} ps` : '—' },
                {
                  label: S.rDelta,
                  value: analysis.open ? `${(analysis.delay - analysis.lo).toFixed(0)} / ${(analysis.hi - analysis.delay).toFixed(0)} ps` : '—',
                  state: analysis.allPass ? 'pass' : 'fail',
                },
                { label: S.rFailBits, value: `${analysis.failBits} / ${DQ_COUNT}`, state: analysis.allPass ? 'pass' : 'fail' },
                { label: S.rDq0, value: `${analysis.dq0FailBits} / ${DQ_COUNT}`, state: analysis.dq0FailBits === 0 ? 'pass' : 'fail' },
                { label: S.rVerdict, value: t(analysis.allPass ? S.pass : S.fail), state: analysis.allPass ? 'pass' : 'fail' },
              ]}
            />
          </div>
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
