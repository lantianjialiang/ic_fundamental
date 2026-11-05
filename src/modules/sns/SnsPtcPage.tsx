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
import { SNS_META } from './meta'
import { FrameView, PtcPlot } from './plots'
import {
  INTRO,
  MISCONCEPTIONS,
  MODE_OPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  frameSummary,
  plotSummary,
  taskItems,
  verdictOf,
} from './snsPtcData'
import { DEFAULT_PTC, analysePtc, buildPtcFrames, ptcFlags, type PtcState } from './snsPtcModel'
import './sns.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const q = (value: number, digits: number) => Number(value.toFixed(digits))

function fmtNum(n: number, digits: number): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '--'
}

export function SnsPtcPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PtcState>(DEFAULT_PTC)
  const built = useMemo(
    () => buildPtcFrames(state),
    [state.kTrue, state.readNoiseE, state.fwcE, state.prnu, state.points],
  )
  const analysis = useMemo(() => analysePtc(state, built), [state, built])
  const verdict = verdictOf(state, analysis)
  const flags = ptcFlags(state, analysis)
  const update = (patch: Partial<PtcState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsPtc.title)}
      goal={t(SNS_META.snsPtc.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'snsDark' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_PTC)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['snsPixel', 'anaStats', 'anaMeasure']} onOpen={onModuleChange} />
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

        <Callout>{t(S.teach)}</Callout>
        <div className="hs-controls">
          <Knob label={S.kLabel} value={state.kTrue} unit="e-/DN" min={5} max={20} step={1} onChange={(v) => update({ kTrue: v })} />
          <Knob label={S.readLabel} value={state.readNoiseE} unit="e-" min={0.5} max={8} step={0.5} onChange={(v) => update({ readNoiseE: q(v, 1) })} />
          <Knob label={S.fwcLabel} value={state.fwcE} unit="e-" min={20000} max={50000} step={2000} onChange={(v) => update({ fwcE: v })} />
          <Knob label={S.prnuLabel} value={state.prnu} unit="" min={0} max={0.05} step={0.005} onChange={(v) => update({ prnu: q(v, 3) })} />
          <Knob label={S.pointsLabel} value={state.points} unit="" min={4} max={12} step={1} onChange={(v) => update({ points: v })} />
          <Knob label={S.roiLabel} value={state.roiSide} unit="px" min={32} max={128} step={4} onChange={(v) => update({ roiSide: v })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.modeLabel)}</span>
            <Seg options={MODE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
        </div>
        <div className="hs-grid">
          <div style={{ display: 'grid', gap: 12 }}>
            <FrameView
              frame={analysis.preview}
              w={analysis.w}
              mode="gray"
              aria={t(S.frameAria)}
              summary={t(frameSummary(analysis))}
            />
            <PtcPlot
              points={analysis.points}
              slope={analysis.slope}
              intercept={analysis.intercept}
              aria={t(S.plotAria)}
              summary={t(plotSummary(analysis))}
              xLabel={t(S.plotX)}
              yLabel={t(S.plotY)}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rK, value: `${fmtNum(analysis.k, 2)} e-/DN`, state: flags.t1 ? 'pass' : undefined },
                { label: S.rRead, value: `${fmtNum(analysis.readNoiseE, 2)} e-` },
                { label: S.rFwc, value: `${fmtNum(analysis.fwcE, 0)} e-`, state: flags.t3 ? 'pass' : undefined },
                { label: S.rDr, value: fmtNum(analysis.dr, 0) },
                { label: S.rSnr, value: fmtNum(analysis.snrMax, 1) },
                {
                  label: S.rRel,
                  value: Number.isFinite(analysis.relK) ? `${(analysis.relK * 100).toFixed(2)} %` : '--',
                },
                { label: S.rVar, value: `${(analysis.varRel * 100).toFixed(2)} %`, state: flags.t4 ? 'pass' : undefined },
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
