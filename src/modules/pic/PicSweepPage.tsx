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
import { PIC_META } from './meta'
import { SpectrumPlot } from './plots'
import { DUT_OPTIONS, FIG_SUMMARY, INTRO, MISCONCEPTIONS, NORM_OPTIONS, QUIZ, S, TAKEAWAY, fill, taskItems, verdictOf } from './picSweepData'
import { DEFAULT_SWEEP, erGapDb, analyseSweep, type SweepState } from './picSweepModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function PicSweepPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SweepState>(DEFAULT_SWEEP)
  const [cursor, setCursor] = useState(0)
  const analysis = useMemo(() => analyseSweep(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<SweepState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => {
    setState(DEFAULT_SWEEP)
    setCursor(0)
  }
  const n = analysis.scan.lambdaNm.length
  const i = Math.min(cursor, Math.max(0, n - 1))
  const gap = erGapDb(analysis)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picSweep.title)}
      goal={t(PIC_META.picSweep.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picAlign' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['picUnits', 'rfDb']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.dutLabel)}</span>
            <Seg options={DUT_OPTIONS} value={state.dut} onChange={(dut) => update({ dut })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.normLabel)}</span>
            <Seg options={NORM_OPTIONS} value={state.norm} onChange={(norm) => update({ norm })} />
          </div>
          <Knob label={S.spanLabel} value={state.spanNm} unit="nm" min={4} max={20} step={1} onChange={(spanNm) => update({ spanNm })} />
          <Knob label={S.stepLabel} value={state.stepNm} unit="nm" min={0.05} max={3} step={0.05} onChange={(stepNm) => update({ stepNm: round(stepNm, 2) })} />
          <Knob label={S.laserLabel} value={state.laserDbm} unit="dBm" min={-10} max={6} step={1} onChange={(laserDbm) => update({ laserDbm })} />
          <Knob label={S.floorLabel} value={state.floorDbm} unit="dBm" min={-70} max={-5} step={1} onChange={(floorDbm) => update({ floorDbm })} />
          <Knob label={S.wanderLabel} value={state.wanderDb} unit="dB" min={0} max={6} step={0.5} onChange={(wanderDb) => update({ wanderDb: round(wanderDb, 1) })} />
        </div>

        <div className="hs-grid">
          <SpectrumPlot
            lambdaNm={analysis.scan.lambdaNm}
            curves={[
              { id: 'raw', legend: t(S.legRaw), color: '#58a6ff', db: analysis.scan.rawDb },
              { id: 'norm', legend: t(S.legNorm), color: '#e8c45a', db: analysis.scan.normDb },
            ]}
            cursor={i}
            onCursor={setCursor}
            aria={t(S.plotAria)}
            summary={t(
              fill(FIG_SUMMARY, {
                nm: analysis.scan.lambdaNm[i].toFixed(3),
                raw: analysis.scan.rawDb[i].toFixed(2),
                norm: analysis.scan.normDb[i].toFixed(2),
              }),
            )}
            xLabel={t(S.xLabel)}
            yLabel={t(S.yLabel)}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rLam, value: `${analysis.scanDip.lambda0.toFixed(3)} nm` },
                { label: S.rFine, value: `${analysis.fineDip.lambda0.toFixed(3)} nm` },
                { label: S.rFsr, value: `${analysis.fsr.toFixed(2)} nm` },
                { label: S.rFwhm, value: `${analysis.fineDip.fwhmNm.toFixed(3)} nm` },
                { label: S.rEr, value: `${analysis.fineDip.erDb.toFixed(1)} dB` },
                { label: S.rMeas, value: `${analysis.measuredErDb.toFixed(1)} dB`, state: gap >= 3 ? 'fail' : 'pass' },
                { label: S.rErr, value: `${analysis.meanErrDb.toFixed(3)} dB`, state: analysis.meanErrDb < 0.05 ? 'pass' : 'fail' },
                { label: S.rTime, value: `${analysis.points} / ${analysis.timeS.toFixed(2)} s` },
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
