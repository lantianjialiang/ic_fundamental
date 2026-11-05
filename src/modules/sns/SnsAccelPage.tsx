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
import {
  INTRO,
  MISCONCEPTIONS,
  MODE_OPTIONS,
  PLAN_OPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  exampleNumbers,
  fill,
  taskItems,
  verdictOf,
} from './snsAccelData'
import { DEFAULT_ACCEL, analyseAccel, type AccelState } from './snsAccelModel'
import './sns.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

const asId = (id: string): ModuleId => id as ModuleId

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function SnsAccelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<AccelState>(DEFAULT_ACCEL)
  const analysis = useMemo(() => analyseAccel(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<AccelState>) => setState((prev) => ({ ...prev, ...patch }))
  const noiseMv = analysis.noiseMg * state.sVg

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsAccel.title)}
      goal={t(SNS_META.snsAccel.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={asId('snsProgram')}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(DEFAULT_ACCEL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaTrim']} onOpen={onModuleChange} />
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
        <PracticeSteps items={taskItems(state)} />

        <Callout>{t(S.callout)}</Callout>
        <div className="hs-controls">
          <Knob label={S.sLabel} value={state.sVg} unit="V/g" min={0.1} max={1} step={0.01} onChange={(v) => update({ sVg: Math.round(v * 100) / 100 })} />
          <Knob label={S.offLabel} value={state.offsetV} unit="V" min={0} max={3.3} step={0.01} onChange={(v) => update({ offsetV: Math.round(v * 100) / 100 })} />
          <Knob label={S.ndLabel} value={state.ndUg} unit="µg/√Hz" min={10} max={5000} step={10} onChange={(v) => update({ ndUg: Math.round(v / 10) * 10 })} />
          <Knob label={S.bwLabel} value={state.bwHz} unit="Hz" min={10} max={400} step={10} onChange={(v) => update({ bwHz: Math.round(v / 10) * 10 })} />
          <Knob label={S.nlLabel} value={state.nonlin} unit="" min={0} max={0.05} step={0.001} onChange={(v) => update({ nonlin: Math.round(v * 1000) / 1000 })} />
          <Knob label={S.tempLabel} value={state.tempC} unit="°C" min={-40} max={85} step={5} onChange={(v) => update({ tempC: Math.round(v) })} />
          <Knob label={S.tiltLabel} value={state.tiltDeg} unit="°" min={0} max={8} step={1} onChange={(v) => update({ tiltDeg: Math.round(v) })} />
        </div>
        <div className="hs-controls">
          <label className="hs-field__label">
            <input type="checkbox" checked={state.noiseOff} onChange={(event) => update({ noiseOff: event.target.checked })} />
            {` ${t(S.noiseLabel)}`}
          </label>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.modeLabel)}</span>
            <Seg options={MODE_OPTIONS} value={state.mode} onChange={(mode) => update({ mode })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.planLabel)}</span>
            <Seg options={PLAN_OPTIONS} value={state.plan} onChange={(plan) => update({ plan })} />
          </div>
        </div>
        {state.mode === 'example' ? (
          <Callout tone="ok">
            <p>{t(fill(S.exampleLine, exampleNumbers))}</p>
          </Callout>
        ) : null}
        <div className="hs-grid">
          <figure className="sns-fig">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <caption className="sns-summary">{t(S.tableCap)}</caption>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>{t(S.colAxis)}</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>{t(S.colG)}</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>{t(S.colV)}</th>
                </tr>
              </thead>
              <tbody>
                {analysis.reads.map((row) => (
                  <tr key={`${row.axis}${row.g}`}>
                    <td style={{ padding: '4px 8px' }}>{row.axis}</td>
                    <td style={{ textAlign: 'right', padding: '4px 8px' }}>{`${row.g > 0 ? '+' : ''}${row.g} g`}</td>
                    <td style={{ textAlign: 'right', padding: '4px 8px' }}>{`${row.volt.toFixed(4)} V`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rPlus, value: `${analysis.vPlus.toFixed(4)} V` },
                { label: S.rMinus, value: `${analysis.vMinus.toFixed(4)} V` },
                { label: S.rOff, value: `${analysis.offsetV.toFixed(4)} V` },
                { label: S.rS, value: `${analysis.sVg.toFixed(4)} V/g` },
                { label: S.rTilt, value: `${analysis.tiltPct.toFixed(3)} %` },
                { label: S.rNoise, value: `${analysis.noiseMg.toFixed(2)} mg` },
                { label: S.rNoiseV, value: `${noiseMv.toFixed(3)} mV` },
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
