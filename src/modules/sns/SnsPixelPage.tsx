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
import { SnsPixelFig } from './SnsPixelFig'
import {
  CDS_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  QUANT_OPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  figSummary,
  taskItems,
  verdictOf,
} from './snsPixelData'
import { DEFAULT_PIXEL, READ_E, analysePixel, pixelFlags, type PixelState } from './snsPixelModel'
import './sns.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const q = (value: number, digits: number) => Number(value.toFixed(digits))

export function SnsPixelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PixelState>(DEFAULT_PIXEL)
  const analysis = useMemo(() => analysePixel(state), [state])
  const verdict = verdictOf(state, analysis)
  const flags = pixelFlags(state, analysis)
  const update = (patch: Partial<PixelState>) => setState((prev) => ({ ...prev, ...patch }))
  const skewMs = analysis.skewUs / 1000

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsPixel.title)}
      goal={t(SNS_META.snsPixel.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'snsPtc' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_PIXEL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['snsPhoton', 'anaTrim', 'anaMeasure']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout>{t(S.teach)}</Callout>
        <div className="hs-controls">
          <Knob label={S.cLabel} value={state.cFdFf} unit="fF" min={0.5} max={5} step={0.1} onChange={(v) => update({ cFdFf: q(v, 1) })} />
          <Knob label={S.sfLabel} value={state.sf} unit="" min={0.5} max={1} step={0.02} onChange={(v) => update({ sf: q(v, 2) })} />
          <Knob label={S.colLabel} value={state.col} unit="" min={0.5} max={2} step={0.05} onChange={(v) => update({ col: q(v, 2) })} />
          <Knob label={S.bitsLabel} value={state.bits} unit="bit" min={10} max={14} step={1} onChange={(v) => update({ bits: v })} />
          <Knob label={S.vrefLabel} value={state.vref} unit="V" min={0.5} max={2} step={0.1} onChange={(v) => update({ vref: q(v, 1) })} />
          <Knob label={S.photoLabel} value={state.photoE} unit="e-" min={0} max={20000} step={200} onChange={(v) => update({ photoE: v })} />
          <Knob label={S.rowLabel} value={state.rowTimeUs} unit="us" min={1} max={40} step={1} onChange={(v) => update({ rowTimeUs: v })} />
          <Knob label={S.rowsLabel} value={state.rows} unit="" min={40} max={2000} step={20} onChange={(v) => update({ rows: v })} />
        </div>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.cdsLabel)}</span>
            <Seg options={CDS_OPTIONS} value={state.cds} onChange={(cds) => update({ cds })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.quantLabel)}</span>
            <Seg options={QUANT_OPTIONS} value={state.quantCall} onChange={(quantCall) => update({ quantCall })} />
          </div>
        </div>
        <div className="hs-grid">
          <SnsPixelFig
            photoE={state.photoE}
            cds={state.cds === 'on'}
            aria={t(S.figAria)}
            summary={t(figSummary(state, analysis))}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rCg, value: `${analysis.cgUv.toFixed(1)} uV/e-`, state: flags.t1 ? 'pass' : undefined },
                { label: S.rTotal, value: `${analysis.totalUv.toFixed(2)} uV/e-` },
                { label: S.rKtc, value: `${analysis.ktc.toFixed(2)} e-` },
                { label: S.rK, value: `${analysis.k.toFixed(2)} e-/DN` },
                { label: S.rQuant, value: `${analysis.quant.toFixed(2)} e-` },
                { label: S.rRes, value: `${analysis.residual.toFixed(2)} e-`, state: flags.t2 ? 'pass' : undefined },
                { label: S.rDn, value: `${analysis.dn.toFixed(1)} / ${analysis.full}` },
                { label: S.rShot, value: `${analysis.shot.toFixed(2)} e-` },
                { label: S.rRead, value: `${READ_E.toFixed(0)} e-` },
                { label: S.rSkew, value: `${skewMs.toFixed(2)} ms`, state: flags.t4 ? 'pass' : undefined },
                { label: S.rQ, value: analysis.chargeC.toExponential(3) },
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
