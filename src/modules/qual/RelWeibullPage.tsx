import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { REL_META } from './meta'
import { WeibullPlotFig } from './RelWeibullFig'
import { fill } from './relStressData'
import { INTRO, MISCONCEPTIONS, orDash, QUIZ, S, TAKEAWAY, taskItems, verdictOf, modeLabel } from './relWeibullData'
import { analyseWeibull, DEFAULT_WEIBULL, failureMode, type WeibullState } from './relWeibullModel'
import './relWeibull.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RelWeibullPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<WeibullState>(DEFAULT_WEIBULL)
  const analysis = useMemo(() => analyseWeibull(state), [state])
  const mode = failureMode(analysis.fit.beta)
  const verdict = verdictOf(state, analysis, mode)
  const update = (patch: Partial<WeibullState>) => setState((prev) => ({ ...prev, ...patch }))
  const errPct = (value: number) => (Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '—')

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relWeibull.title)}
      goal={t(REL_META.relWeibull.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      nextId="relBurnIn"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_WEIBULL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relStress', 'relBathtub', 'relAccel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.betaLabel} value={state.beta} unit="" min={0.5} max={4} step={0.1} onChange={(beta) => update({ beta })} />
          <Knob label={S.etaLabel} value={state.eta} unit="h" min={200} max={3000} step={50} onChange={(eta) => update({ eta })} />
          <Knob label={S.nLabel} value={state.n} unit="" min={5} max={200} step={5} onChange={(n) => update({ n })} />
          <Knob label={S.censorLabel} value={state.censorAt} unit="h" min={200} max={3000} step={100} onChange={(censorAt) => update({ censorAt })} />
        </div>
        <div className="hs-controls">
          <Knob label={S.seedLabel} value={state.seed} unit="" min={1} max={99} step={1} onChange={(seed) => update({ seed })} />
          <Knob label={S.afLabel} value={state.af} unit="" min={1} max={150} step={0.1} onChange={(af) => update({ af: Number(af.toFixed(1)) })} />
        </div>

        <div className="hs-grid">
          <div className="rel-stress-figs">
            <p className="rel-std-note">
              <b>{t(S.figPlotTitle)}</b> {t(S.figPlotNote)}
            </p>
            <WeibullPlotFig state={state} analysis={analysis} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: fill(S.rBeta, { tb: state.beta.toFixed(1) }), value: orDash(analysis.fit.beta, (v) => v.toFixed(2)) },
                { label: S.rBetaErr, value: errPct(analysis.errBeta) },
                { label: fill(S.rEta, { te: String(state.eta) }), value: orDash(analysis.fit.eta, (v) => v.toFixed(0)) },
                { label: S.rEtaErr, value: errPct(analysis.errEta) },
                { label: S.rCounts, value: `${analysis.failures} / ${analysis.censored}` },
                { label: S.rR2, value: orDash(analysis.fit.r2, (v) => v.toFixed(3)) },
                { label: S.rMode, value: analysis.finite ? t(modeLabel(mode)) : '—' },
                { label: S.rB10, value: `${orDash(analysis.b10Use, (v) => v.toFixed(0))} / ${analysis.b10True.toFixed(0)} h` },
                {
                  label: S.rR10,
                  value: `${orDash(analysis.rUse10, (v) => v.toFixed(3))} / ${analysis.rTrue10.toFixed(3)}`,
                },
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
