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
import { CouplingHeat } from './plots'
import { ALG_OPTIONS, DELTA_OPTIONS, FIG_SUMMARY, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, compareLine, fill, taskItems, verdictOf } from './picAlignData'
import { DEFAULT_ALIGN, PEAK_X, PEAK_Y, analyseAlign, type AlignState } from './picAlignModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function PicAlignPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<AlignState>(DEFAULT_ALIGN)
  const analysis = useMemo(() => analyseAlign(state), [state])
  const verdict = verdictOf(state, analysis)
  const run = analysis.runs[state.alg]
  const update = (patch: Partial<AlignState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picAlign.title)}
      goal={t(PIC_META.picAlign.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picCutback' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_ALIGN)} />}
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
            <span className="hs-field__label">{t(S.algLabel)}</span>
            <Seg options={ALG_OPTIONS} value={state.alg} onChange={(alg) => update({ alg })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.deltaLabel)}</span>
            <Seg options={DELTA_OPTIONS} value={state.deltaW} onChange={(deltaW) => update({ deltaW })} />
          </div>
          <Knob label={S.wLabel} value={state.wUm} unit="µm" min={2} max={10} step={0.5} onChange={(wUm) => update({ wUm })} />
          <Knob label={S.l0Label} value={state.l0Db} unit="dB" min={0} max={6} step={0.5} onChange={(l0Db) => update({ l0Db })} />
          <Knob label={S.noiseLabel} value={state.noiseDb} unit="dB" min={0} max={3} step={0.1} onChange={(noiseDb) => update({ noiseDb: round(noiseDb, 1) })} />
          <Knob label={S.rangeLabel} value={state.rangeUm} unit="µm" min={2} max={8} step={0.5} onChange={(rangeUm) => update({ rangeUm })} />
          <Knob label={S.stepLabel} value={state.stepUm} unit="µm" min={0.2} max={2} step={0.2} onChange={(stepUm) => update({ stepUm: round(stepUm, 1) })} />
          <Knob label={S.moveLabel} value={state.moveS} unit="s" min={0.05} max={1} step={0.05} onChange={(moveS) => update({ moveS: round(moveS, 2) })} />
        </div>

        <div className="hs-grid">
          <CouplingHeat
            xs={analysis.heatX}
            ys={analysis.heatY}
            db={analysis.heatDb}
            path={run.path}
            mark={{ x: run.x, y: run.y }}
            peak={{ x: PEAK_X, y: PEAK_Y }}
            aria={t(S.mapAria)}
            summary={t(
              fill(FIG_SUMMARY, {
                x0: String(PEAK_X),
                y0: String(PEAK_Y),
                x: run.x.toFixed(2),
                y: run.y.toFixed(2),
                ex: run.excessDb.toFixed(3),
                moves: String(run.moves),
              }),
            )}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rExtra, value: `${analysis.deltaWExtraDb.toFixed(3)} dB` },
                { label: S.rMoves, value: String(run.moves) },
                { label: S.rTime, value: `${run.timeS.toFixed(2)} s` },
                {
                  label: S.rExcess,
                  value: `${run.excessDb.toFixed(3)} dB`,
                  state: state.noiseDb <= 1e-9 && run.excessDb <= 0.2 ? 'pass' : undefined,
                },
                { label: S.rDist, value: `${run.distUm.toFixed(3)} µm` },
                { label: S.rRaster, value: compareLine(analysis, 'raster') },
                { label: S.rSpiral, value: compareLine(analysis, 'spiral') },
                { label: S.rHill, value: compareLine(analysis, 'hill') },
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
