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
import { PicFlowFig } from './PicFlowFig'
import { PIC_META } from './meta'
import {
  EN_OPTIONS,
  INTRO,
  KGD_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  STEP_FULL,
  STEP_SHORT,
  TAKEAWAY,
  fill,
  taskItems,
  verdictOf,
} from './picFlowData'
import { DEFAULT_FLOW, FLOW_IDS, analyseFlow, type FlowState } from './picFlowModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function PicFlowPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<FlowState>(DEFAULT_FLOW)
  const analysis = useMemo(() => analyseFlow(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<FlowState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState({ ...DEFAULT_FLOW, enabled: { ...DEFAULT_FLOW.enabled } })

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picFlow.title)}
      goal={t(PIC_META.picFlow.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['genMultisite', 'relBurnIn']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <Knob label={S.yAsicLabel} value={state.yAsic} unit="" min={0.8} max={0.99} step={0.01} onChange={(yAsic) => update({ yAsic: round(yAsic, 2) })} />
          <Knob label={S.yEngLabel} value={state.yEngine} unit="" min={0.9} max={0.99} step={0.01} onChange={(yEngine) => update({ yEngine: round(yEngine, 2) })} />
          <Knob label={S.nLabel} value={state.nEngines} unit="" min={1} max={12} step={1} onChange={(nEngines) => update({ nEngines: Math.round(nEngines) })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.kgdLabel)}</span>
            <Seg options={KGD_OPTIONS} value={state.kgd} onChange={(kgd) => update({ kgd })} />
          </div>
          <Knob label={S.nParLabel} value={state.parallel} unit="" min={1} max={4} step={1} onChange={(parallel) => update({ parallel: Math.round(parallel) })} />
          <Knob label={S.alignLabel} value={state.alignS} unit="s" min={10} max={90} step={5} onChange={(alignS) => update({ alignS: Math.round(alignS) })} />
          <Knob label={S.otherLabel} value={state.otherS} unit="s" min={5} max={60} step={5} onChange={(otherS) => update({ otherS: Math.round(otherS) })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.enLabel)}</span>
            <Seg
              options={EN_OPTIONS}
              value={state.enabled[state.selected] ? EN_OPTIONS[0].id : EN_OPTIONS[1].id}
              onChange={(flag) =>
                setState((prev) => ({
                  ...prev,
                  enabled: { ...prev.enabled, [prev.selected]: flag === EN_OPTIONS[0].id },
                }))
              }
            />
          </div>
        </div>

        <div className="hs-grid">
          <PicFlowFig
            steps={FLOW_IDS.map((id) => ({
              id,
              label: t(STEP_SHORT[id]),
              enabled: state.enabled[id],
              ariaLabel: `${t(STEP_FULL[id])}, ${state.enabled[id] ? t(EN_OPTIONS[0].label) : t(EN_OPTIONS[1].label)}`,
            }))}
            selected={state.selected}
            onSelect={(id) => {
              const found = FLOW_IDS.find((item) => item === id)
              if (found) update({ selected: found })
            }}
            aria={t(S.figAria)}
            summary={t(fill(S.figSummary, { step: t(STEP_FULL[state.selected]), y: analysis.yieldNoKgd.toFixed(3), uph: analysis.uph.toFixed(1) }))}
          />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rYield, value: analysis.yieldNoKgd.toFixed(3) },
                { label: S.rShip, value: analysis.shippedPerAsic.toFixed(3) },
                { label: S.rOff, value: analysis.scrapOff.toFixed(2) },
                { label: S.rOn, value: analysis.scrapOn.toFixed(2) },
                { label: S.rDelta, value: analysis.scrapDelta.toFixed(2) },
                { label: S.rUph, value: analysis.uph.toFixed(1) },
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
