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
import { INTRO, MISCONCEPTIONS, QUIZ, S, SOURCE_OPTIONS, TAKEAWAY, taskItems, verdictOf } from './snsOpticalData'
import { DEFAULT_OPTICAL, analyseOptical, type OpticalState } from './snsOpticalModel'
import './sns.css'

const asId = (id: string): ModuleId => id as ModuleId

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function SnsOpticalPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<OpticalState>(DEFAULT_OPTICAL)
  const analysis = useMemo(() => analyseOptical(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<OpticalState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsOptical.title)}
      goal={t(SNS_META.snsOptical.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={asId('snsAccel')}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(DEFAULT_OPTICAL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['genMultisite']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout>{t(S.callout)}</Callout>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.sourceLabel)}</span>
            <Seg options={SOURCE_OPTIONS} value={state.source} onChange={(source) => update({ source })} />
          </div>
          <Knob label={S.nuLabel} value={state.nonuniformPct} unit="%" min={0} max={3} step={0.1} onChange={(v) => update({ nonuniformPct: Math.round(v * 10) / 10 })} />
          <Knob label={S.stLabel} value={state.stabilityPct} unit="%" min={0} max={2} step={0.1} onChange={(v) => update({ stabilityPct: Math.round(v * 10) / 10 })} />
          <Knob label={S.calLabel} value={state.calErrPct} unit="%" min={0} max={5} step={0.1} onChange={(v) => update({ calErrPct: Math.round(v * 10) / 10 })} />
          <Knob label={S.prnuLabel} value={state.prnuPct} unit="%" min={0} max={3} step={0.1} onChange={(v) => update({ prnuPct: Math.round(v * 10) / 10 })} />
          <Knob label={S.frameLabel} value={state.frames} unit="" min={1} max={80} step={1} onChange={(v) => update({ frames: Math.round(v) })} />
          <Knob label={S.mpLabel} value={state.megapixels} unit="MP" min={1} max={20} step={1} onChange={(v) => update({ megapixels: Math.round(v) })} />
          <Knob label={S.bitLabel} value={state.bits} unit="bit" min={8} max={14} step={1} onChange={(v) => update({ bits: Math.round(v) })} />
          <Knob label={S.linkLabel} value={state.gbps} unit="Gbps" min={0.5} max={10} step={0.5} onChange={(v) => update({ gbps: Math.round(v * 2) / 2 })} />
        </div>
        <div className="hs-controls">
          <label className="hs-field__label">
            <input type="checkbox" checked={state.limitGeometry} onChange={(event) => update({ limitGeometry: event.target.checked })} />
            {` ${t(S.geoLabel)}`}
          </label>
          <label className="hs-field__label">
            <input type="checkbox" checked={state.limitUniform} onChange={(event) => update({ limitUniform: event.target.checked })} />
            {` ${t(S.uniLabel)}`}
          </label>
        </div>
        <Readout
          items={[
            { label: S.rMeas, value: `${analysis.measuredPct.toFixed(3)} %` },
            { label: S.rBytes, value: `${analysis.mbPerFrame.toFixed(2)} MB` },
            { label: S.rTime, value: `${analysis.transferS.toFixed(2)} s` },
            { label: S.rSpec, value: `${analysis.spectralPct.toFixed(2)} %` },
          ]}
        />
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
