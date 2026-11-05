import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { BerOmaPlot, PicLinkFig } from './PicLinkFig'
import { PIC_META } from './meta'
import { CLAIM_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, fill, fmtBer, taskItems, verdictOf } from './picLinkData'
import { DEFAULT_LINK, analyseLink, type LinkState } from './picLinkModel'
import './pic.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

const EYE_SUMMARY = loc(
  '发射 OMA {oma} mW，ER {er} dB。高电平 {hi} mW，低电平 {lo} mW，平均功率 {avg} mW。',
  'Transmitted OMA {oma} mW, ER {er} dB. High {hi} mW, low {lo} mW, average power {avg} mW.',
)

const BER_SUMMARY = loc(
  '游标处接收 OMA {oma} mW，BER {ber}。虚线是 1e-12。',
  'At the cursor, received OMA is {oma} mW and BER is {ber}. The dashed line is 1e-12.',
)

const BER_X = loc('接收 OMA mW', 'Received OMA mW')
const BER_Y = loc('log10 BER', 'log10 BER')

export function PicLinkPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<LinkState>(DEFAULT_LINK)
  const analysis = useMemo(() => analyseLink(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<LinkState>) => setState((prev) => ({ ...prev, ...patch }))
  const point = analysis.curve[analysis.cursor]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picLink.title)}
      goal={t(PIC_META.picLink.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picFlow' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_LINK)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsEye', 'hsJitter', 'hsInterface']} onOpen={onModuleChange} />
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

        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="hs-controls">
          <Knob label={S.omaLabel} value={state.txOmaMw} unit="mW" min={0.4} max={3} step={0.1} onChange={(txOmaMw) => update({ txOmaMw: round(txOmaMw, 1) })} />
          <Knob label={S.erLabel} value={state.erDb} unit="dB" min={3} max={20} step={1} onChange={(erDb) => update({ erDb: Math.round(erDb) })} />
          <Knob label={S.lossLabel} value={state.lossDb} unit="dB" min={0} max={12} step={0.5} onChange={(lossDb) => update({ lossDb: round(lossDb, 1) })} />
          <Knob label={S.rLabel} value={state.rAw} unit="A/W" min={0.2} max={1.2} step={0.05} onChange={(rAw) => update({ rAw: round(rAw, 2) })} />
          <Knob label={S.sigmaLabel} value={state.sigmaUa} unit="µA" min={5} max={40} step={1} onChange={(sigmaUa) => update({ sigmaUa: Math.round(sigmaUa) })} />
          <Knob label={S.jitterLabel} value={state.jitter} unit="" min={0} max={1} step={0.1} onChange={(jitter) => update({ jitter: round(jitter, 1) })} />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.claimLabel)}</span>
            <Seg options={CLAIM_OPTIONS} value={state.claim} onChange={(claim) => update({ claim })} />
          </div>
        </div>

        <div className="hs-grid">
          <div>
            <PicLinkFig
              omaMw={state.txOmaMw}
              erDb={state.erDb}
              aria={t(S.eyeAria)}
              omaLabel="OMA"
              erLabel={`ER ${state.erDb.toFixed(0)} dB`}
              summary={t(
                fill(EYE_SUMMARY, {
                  oma: state.txOmaMw.toFixed(2),
                  er: state.erDb.toFixed(0),
                  hi: analysis.pHighMw.toFixed(3),
                  lo: analysis.pLowMw.toFixed(3),
                  avg: analysis.pAvgMw.toFixed(3),
                }),
              )}
            />
            <BerOmaPlot
              omaMw={analysis.curve.map((item) => item.omaMw)}
              ber={analysis.curve.map((item) => item.ber)}
              cursor={state.cursor}
              onCursor={(cursor) => update({ cursor })}
              aria={t(S.berAria)}
              xLabel={t(BER_X)}
              yLabel={t(BER_Y)}
              markLabel="1e-12"
              summary={t(fill(BER_SUMMARY, { oma: point.omaMw.toFixed(3), ber: fmtBer(point.ber) }))}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rQ, value: analysis.q.toFixed(2) },
                { label: S.rBer, value: fmtBer(analysis.ber), state: analysis.ber > 1e-12 ? 'fail' : 'pass' },
                { label: S.rRx, value: `${analysis.pRxMw.toFixed(3)} mW` },
                { label: S.rSens, value: `${analysis.sensDbm.toFixed(2)} dBm / ${analysis.sensMw.toFixed(3)} mW` },
                { label: S.rRef, value: `${analysis.refSensDbm.toFixed(2)} dBm / ${analysis.refSensMw.toFixed(3)} mW` },
                {
                  label: S.rMargin,
                  value: `${analysis.marginMw.toFixed(3)} mW`,
                  state: analysis.marginMw < 0 ? 'fail' : 'pass',
                },
                { label: S.rAvg, value: `${analysis.pAvgMw.toFixed(3)} mW` },
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
