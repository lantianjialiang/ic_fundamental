import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
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
import { BathFig, HistFig, RelCurveFig } from './RelBathtubFig'
import { INTRO, MISCONCEPTIONS, QUIZ, S, SEG_OPTIONS, TAKEAWAY, taskItems, verdictOf } from './relBathtubData'
import { DEFAULT_BATH, PPM_TARGET, analyseBath, fmtHours, type BathState } from './relBathtubModel'
import './relBathtub.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RelBathtubPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<BathState>(DEFAULT_BATH)
  const analysis = useMemo(() => analyseBath(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<BathState>) => setState((prev) => ({ ...prev, ...patch }))
  const earlyPct = Math.round(state.earlyFrac * 1000) / 10

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relBathtub.title)}
      goal={t(REL_META.relBathtub.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="relAccel"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_BATH)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['latch', 'relAccel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.earlyLabel} value={earlyPct} unit="%" min={0} max={5} step={0.5} onChange={(v) => update({ earlyFrac: v / 100 })} />
          <Knob label={S.betaEarlyLabel} value={state.betaEarly} unit="" min={0.3} max={0.9} step={0.05} onChange={(v) => update({ betaEarly: v })} />
          <Knob label={S.etaEarlyLabel} value={state.etaEarly} unit="h" min={10} max={300} step={10} onChange={(v) => update({ etaEarly: v })} />
          <Knob label={S.randomLabel} value={state.randomFit} unit="FIT" min={10} max={1000} step={10} onChange={(v) => update({ randomFit: v })} />
          <Knob label={S.betaWearLabel} value={state.betaWear} unit="" min={2} max={6} step={0.5} onChange={(v) => update({ betaWear: v })} />
          <Knob label={S.etaWearLabel} value={state.etaWear} unit="h" min={10000} max={1000000} step={10000} onChange={(v) => update({ etaWear: v })} />
          <Knob label={S.screenLabel} value={state.screenH} unit="h" min={0} max={2000} step={50} onChange={(v) => update({ screenH: v })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.segLabel)}</span>
            <Seg options={SEG_OPTIONS} value={state.seg} onChange={(seg) => update({ seg })} />
          </div>
          <button type="button" className="lab__btn" onClick={() => update({ seed: state.seed + 1 })}>
            {t(S.resample)}
          </button>
        </div>

        <div className="hs-grid">
          <div className="rel-bath-stack">
            <BathFig analysis={analysis} seg={state.seg} />
            <RelCurveFig analysis={analysis} seg={state.seg} />
            <HistFig analysis={analysis} seg={state.seg} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rEarlyEnd, value: fmtHours(analysis.t1) },
                { label: S.rBottom, value: `${analysis.bottomFit.toFixed(1)} FIT` },
                { label: S.rWearStart, value: fmtHours(analysis.t2) },
                { label: S.rMttf, value: fmtHours(analysis.mttfRandomH) },
                { label: S.rR5Full, value: analysis.r5Full.toFixed(5) },
                { label: S.rR5Random, value: analysis.r5Random.toFixed(5) },
                { label: S.rR90, value: `${fmtHours(analysis.r90)} / ${(analysis.r90 / 8760).toFixed(1)} ${t(S.unitYear)}` },
                { label: S.rMc, value: `${analysis.fail5Count} / ${analysis.fail5Expected.toFixed(1)}` },
                {
                  label: S.rPpm,
                  value: `${analysis.shipPpm.toFixed(0)} ppm`,
                  state: analysis.shipPpm <= PPM_TARGET ? 'pass' : 'fail',
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
