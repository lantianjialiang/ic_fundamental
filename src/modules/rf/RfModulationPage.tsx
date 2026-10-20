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
import { RF_META } from './meta'
import { analyseModulation, BITS_PER_SYMBOL, DEFAULT_MOD, type ModState } from './modulationModel'
import { ConstellationFig } from './RfModulationFig'
import { FIG, INTRO, MISCONCEPTIONS, QUIZ, S, SCHEME_LABEL, SCHEME_OPTIONS, TAKEAWAY, taskItems, verdictOf } from './rfModulationData'
import './rfModulation.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfModulationPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ModState>(DEFAULT_MOD)
  const analysis = useMemo(() => analyseModulation(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<ModState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfModulation.title)}
      goal={t(RF_META.rfModulation.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfEvm"
      nextLabel={`${t(S.nextPrefix)}${t(RF_META.rfEvm.title)}`}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_MOD)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfDb', 'rfSparam', 'rfEvm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rf-controls">
          <div className="rf-field">
            <span className="rf-field__label">{t(S.schemeLabel)}</span>
            <Seg options={SCHEME_OPTIONS} value={state.scheme} onChange={(scheme) => update({ scheme })} />
          </div>
          <Knob label={S.epsLabel} value={state.epsPct} unit="%" min={-30} max={30} step={1} onChange={(epsPct) => update({ epsPct })} />
          <Knob label={S.phiLabel} value={state.phiDeg} unit="°" min={-20} max={20} step={0.5} onChange={(phiDeg) => update({ phiDeg })} />
        </div>

        <div className="rf-grid">
          <ConstellationFig
            points={analysis.points}
            rx={analysis.rx}
            bad={analysis.bad}
            span={1.6}
            aria={FIG.constAria}
            caption={FIG.constCap}
          />
          <div className="rf-cell">
            <Readout
              items={[
                { label: S.rScheme, value: t(SCHEME_LABEL[state.scheme]) },
                { label: S.rPoints, value: `${analysis.points.length} (${BITS_PER_SYMBOL[state.scheme]})` },
                { label: S.rGain, value: `${analysis.gainErrDb.toFixed(2)} dB` },
                { label: S.rDmin, value: analysis.dMin.toFixed(3) },
                { label: S.rErrors, value: String(analysis.errors), state: analysis.errors > 0 ? 'fail' : 'pass' },
                { label: S.rVerdict, value: t(analysis.errors > 0 ? S.hasErr : S.noErr), state: analysis.errors > 0 ? 'fail' : 'pass' },
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
