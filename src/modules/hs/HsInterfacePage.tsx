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
import { BathtubFig, PathFig } from './InterfaceFig'
import {
  INTRO,
  MISCONCEPTIONS,
  ORDER_OPTIONS,
  PATH_OPTIONS,
  QUIZ,
  RATE_OPTIONS,
  S,
  TAKEAWAY,
  berText,
  openText,
  orderOf,
  taskItems,
  verdictOf,
} from './interfaceData'
import { BITS, DEFAULT_INTERFACE, analyseInterface, type InterfaceState } from './interfaceModel'
import { HS_META } from './meta'
import './hs.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsInterfacePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<InterfaceState>(DEFAULT_INTERFACE)
  const analysis = useMemo(() => analyseInterface(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<InterfaceState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsInterface.title)}
      goal={t(HS_META.hsInterface.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="hsAteLimit"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_INTERFACE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsEye', 'hsJitter', 'hsAteLimit']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.patternLabel)}</span>
            <Seg options={ORDER_OPTIONS} value={String(state.order)} onChange={(id) => update({ order: orderOf(id) })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.pathLabel)}</span>
            <Seg options={PATH_OPTIONS} value={state.path} onChange={(id) => update({ path: id })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.rateLabel)}</span>
            <Seg options={RATE_OPTIONS} value={String(state.rate)} onChange={(id) => update({ rate: Number(id) })} />
          </div>
          <Knob label={S.phaseLabel} value={state.phase} unit="UI" min={0} max={1} step={0.01} onChange={(phase) => update({ phase })} />
          <Knob label={S.rjLabel} value={state.rj} unit="ps" min={0} max={8} step={0.5} onChange={(rj) => update({ rj })} />
          <Knob label={S.djLabel} value={state.dj} unit="ps" min={0} max={30} step={1} onChange={(dj) => update({ dj })} />
          <Knob label={S.wanderLabel} value={state.wander} unit="ps" min={0} max={30} step={1} onChange={(wander) => update({ wander })} />
        </div>

        <div className="hs-grid">
          <BathtubFig analysis={analysis} phase={state.phase} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rUi, value: `${analysis.ui.toFixed(0)} ps` },
                { label: S.rPhase, value: `${(state.phase * analysis.ui).toFixed(0)} ps` },
                { label: S.rErr, value: `${analysis.errors} / ${BITS}`, state: analysis.errors > 0 ? 'fail' : 'pass' },
                { label: S.rBer, value: t(berText(analysis)), state: analysis.pass ? 'pass' : 'fail' },
                { label: S.rOpenLoop, value: t(openText(analysis.openLoopPs, analysis.ui)) },
                { label: S.rOpenExt, value: t(openText(analysis.openExtPs, analysis.ui)) },
                { label: S.rVerdict, value: t(analysis.pass ? S.pass : S.fail), state: analysis.pass ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>

        <PathFig path={state.path} />
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
