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
import { ACPR_OK_DB, analyseEvm, DEFAULT_EVM, EVM_OK_PCT, type EvmState } from './evmModel'
import { RF_META } from './meta'
import { RappFig, SpectrumFig } from './RfEvmFig'
import { ConstellationFig } from './RfModulationFig'
import { FIG, INTRO, IBO, MISCONCEPTIONS, QUIZ, S, taskItems, TAKEAWAY, verdictOf } from './rfEvmData'
import { SCHEME_OPTIONS } from './rfModulationData'
import './rfModulation.css'
import './rfEvm.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfEvmPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<EvmState>(DEFAULT_EVM)
  const analysis = useMemo(() => analyseEvm(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<EvmState>) => setState((prev) => ({ ...prev, ...patch }))
  const evmOk = analysis.evmPct <= EVM_OK_PCT
  const acprOk = analysis.acprDb <= ACPR_OK_DB

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfEvm.title)}
      goal={t(RF_META.rfEvm.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfCal"
      nextLabel={`${t(S.nextPrefix)}${t(RF_META.rfCal.title)}`}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_EVM)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfModulation', 'rfNf', 'rfSystem']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rf-controls">
          <div className="rf-field">
            <span className="rf-field__label">{t(S.schemeLabel)}</span>
            <Seg options={SCHEME_OPTIONS} value={state.scheme} onChange={(scheme) => update({ scheme })} />
          </div>
          <Knob label={S.iboLabel} value={state.ibo} unit="dB" min={IBO.min} max={IBO.max} step={IBO.step} onChange={(ibo) => update({ ibo })} />
        </div>

        <div className="rf-grid">
          <ConstellationFig points={analysis.refPts} rx={analysis.rxPts} span={2} aria={FIG.constAria} caption={FIG.constCap} />
          <RappFig rmsIn={analysis.rmsIn} peakIn={analysis.peakIn} aria={FIG.rappAria} caption={FIG.rappCap} />
        </div>

        <div className="rf-wide">
          <SpectrumFig freq={analysis.specFreq} ideal={analysis.specIdeal} dist={analysis.specDist} aria={FIG.specAria} caption={FIG.specCap} />
        </div>

        <div className="rf-cell">
          <Readout
            items={[
              { label: S.rEvm, value: `${analysis.evmPct.toFixed(2)} %`, state: evmOk ? 'pass' : 'fail' },
              { label: S.rAcpr, value: `${analysis.acprDb.toFixed(1)} dBc`, state: acprOk ? 'pass' : 'fail' },
              { label: S.rAcprIdeal, value: `${analysis.acprIdealDb.toFixed(1)} dBc` },
              { label: S.rPapr, value: `${analysis.papr.toFixed(1)} dB` },
              { label: S.rPeak, value: analysis.peakIn.toFixed(2) },
              { label: S.rVerdict, value: t(evmOk && acprOk ? S.pass : S.fail), state: evmOk && acprOk ? 'pass' : 'fail' },
            ]}
          />
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
