import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { REL_META } from './meta'
import { WeibullPlotFig } from './RelWeibullFig'
import { fill } from './relStressData'
import { INTRO, MISCONCEPTIONS, orDash, QUIZ, S, TAKEAWAY, taskItems, verdictOf, modeLabel } from './relWeibullData'
import { analyseWeibull, DEFAULT_WEIBULL, failureMode, type WeibullState } from './relWeibullModel'
import './relWeibull.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }
const RANK_STEPS = [
  { id: 'observed', label: loc('记录时长', 'Record time') },
  { id: 'rank', label: loc('排序与调整秩', 'Sort and adjust rank') },
  { id: 'plot', label: loc('换成概率坐标', 'Transform to probability coordinates') },
] as const

export function RelWeibullPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<WeibullState>(DEFAULT_WEIBULL)
  const [step, setStep] = useState<(typeof RANK_STEPS)[number]['id']>('observed')
  const [selectedRank, setSelectedRank] = useState(1)
  const analysis = useMemo(() => analyseWeibull(state), [state])
  const rank = Math.min(selectedRank, analysis.rankRows.length)
  const selected = analysis.rankRows[rank - 1]
  const point = selected.point
  const sampleCount = analysis.rankRows.length
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
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => { setState(DEFAULT_WEIBULL); setStep('observed'); setSelectedRank(1) }} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relStress', 'relBathtub', 'relAccel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(state, analysis)} />

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
            <Seg options={RANK_STEPS} value={step} onChange={setStep} />
            <Knob label={loc('按时间选一条记录', 'Pick a time-ordered record')} value={rank} unit=""
              min={1} max={sampleCount} step={1} onChange={setSelectedRank} />
            <div data-weibull-step={step} aria-live="polite">
              <Readout items={[
                { label: loc('原始样片号、时长、状态', 'Original sample ID, observed time and status'),
                  value: `#${selected.index + 1} · ${selected.t.toFixed(2)} h · ${t(point ? loc('已失效', 'Failed') : loc('右删失', 'Right-censored'))}` },
                ...(step === 'observed' ? [] : [
                  { label: loc('按时间排序后的位置与倒序秩', 'Sorted position and reverse rank'),
                    value: `${rank} / ${sampleCount} · r = ${sampleCount} − ${rank} + 1 = ${selected.reverse}` },
                  { label: loc('从上一失效秩更新', 'Update from the previous failure rank'),
                    value: point ? `${point.previous.toFixed(3)} + (${sampleCount} + 1 − ${point.previous.toFixed(3)}) / (1 + ${selected.reverse}) ≈ ${point.adjusted.toFixed(3)}`
                      : t(loc('右删失占据排序位置，调整秩只在失效时更新。', 'Right censoring occupies a sorted position. Update the adjusted rank at each failure.')) },
                ]),
                ...(step === 'plot' && point ? [
                  { label: loc('中位秩给出的失效概率', 'Failure probability estimated from median rank'),
                    value: `F ≈ (${point.adjusted.toFixed(3)} − 0.3) / (${sampleCount} + 0.4) ≈ ${point.f.toFixed(4)}` },
                  { label: loc('拟合坐标', 'Regression coordinates'),
                    value: `x = ln(${selected.t.toFixed(2)}) ≈ ${point.x.toFixed(3)} · y = ln(−ln(1 − F)) ≈ ${point.y.toFixed(3)}` },
                ] : []),
              ]} />
              {step === 'plot' && <p className="rel-std-note">{t(point
                ? loc('金色圆点是这条记录。拟合全部失效点，y 对 ln(t) 的回归斜率就是 β。', 'The gold point is this record. Fit all failures. The regression slope of y against ln(t) gives β.')
                : loc('金色记号落在删失时间线上。样片到该时刻仍存活，因此没有可绘制的失效概率点。', 'The gold marker is on the censoring time line. The sample survived to that time, so it has no failure probability point.'))}</p>}
            </div>
            <WeibullPlotFig state={state} analysis={analysis} selected={step === 'plot' ? selected : undefined} />
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
