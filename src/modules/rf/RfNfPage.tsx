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
import { RF_META } from './meta'
import { ChainFig, ShareFig } from './RfNfFig'
import { ENR_SEG, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfNfData'
import { analyseNf, DEFAULT_NF, type NfState } from './rfNfModel'
import './rfNf.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfNfPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<NfState>(DEFAULT_NF)
  const analysis = useMemo(() => analyseNf(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<NfState>) => setState((prev) => ({ ...prev, ...patch }))
  const [lna, mixer, ifAmp] = analysis.stages
  const matched = Math.abs(analysis.nfFromYDb - analysis.totalNfDb) < 1e-6

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfNf.title)}
      goal={t(RF_META.rfNf.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="rfHarm"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_NF)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfGain', 'rfDb', 'rfIp3']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.gLabel} value={state.g1} unit="dB" min={0} max={30} step={1} onChange={(g1) => update({ g1 })} />
          <Knob label={S.nf1Label} value={state.nf1} unit="dB" min={0.5} max={5} step={0.1} onChange={(nf1) => update({ nf1 })} />
          <Knob label={S.nf2Label} value={state.nf2} unit="dB" min={4} max={12} step={0.5} onChange={(nf2) => update({ nf2 })} />
          <Knob label={S.nf3Label} value={state.nf3} unit="dB" min={2} max={10} step={0.5} onChange={(nf3) => update({ nf3 })} />
        </div>

        <div className="hs-grid">
          <div className="rf-nf-figs">
            <ChainFig analysis={analysis} />
            <ShareFig analysis={analysis} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rTotal, value: `${analysis.totalNfDb.toFixed(2)} dB` },
                { label: S.rChainGain, value: `${analysis.chainGainDb.toFixed(1)} dB` },
                { label: S.rLnaTerm, value: lna.excess.toFixed(3) },
                { label: S.rMixerTerm, value: mixer.excess.toFixed(3) },
                { label: S.rIfTerm, value: ifAmp.excess.toFixed(3) },
                { label: S.rSum, value: (lna.excess + mixer.excess + ifAmp.excess).toFixed(3) },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.yTitle)} note={t(S.yNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.enrLabel)}</span>
            <Seg options={ENR_SEG} value={String(state.enr)} onChange={(id) => update({ enr: Number(id) })} />
          </div>
        </div>
        <div className="hs-cell">
          <Readout
            items={[
              { label: S.yCold, value: `${analysis.nColdDbm.toFixed(2)} dBm` },
              { label: S.yHot, value: `${analysis.nHotDbm.toFixed(2)} dBm` },
              { label: S.yValue, value: analysis.y.toFixed(2) },
              { label: S.yNf, value: `${analysis.nfFromYDb.toFixed(2)} dB` },
              {
                label: S.yCheck,
                value: t(matched ? S.same : S.differ),
                state: matched ? 'pass' : 'fail',
              },
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
