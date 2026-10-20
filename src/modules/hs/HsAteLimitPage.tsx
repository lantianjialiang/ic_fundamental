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
import { EyeCanvas, ResponseFig } from './AteLimitFig'
import {
  DEEMBED_OPTIONS,
  INTRO,
  LOOP_PARAS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './ateLimitData'
import {
  DEFAULT_ATE,
  RATE_GBPS,
  UI_PS,
  analyseAt,
  chainRisePs,
  fixtureBw,
  maxPassRate,
  type AteState,
} from './ateLimitModel'
import { HS_META } from './meta'
import './hs.css'
import './hsAteLimit.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsAteLimitPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<AteState>(DEFAULT_ATE)
  const analysis = useMemo(() => analyseAt(RATE_GBPS, state), [state])
  /** 同样的 ATE 与夹具设置，但不去嵌入：任务卡「去嵌入是否有用」要拿它来比较 */
  const baseline = useMemo(() => analyseAt(RATE_GBPS, { ...state, deembed: 'none' }).measured, [state])
  const maxReal = useMemo(() => maxPassRate(state, 'real'), [state])
  const maxMeas = useMemo(() => maxPassRate(state, 'measured'), [state])
  const verdict = verdictOf(state, analysis.real, analysis.measured)
  const update = (patch: Partial<AteState>) => setState((prev) => ({ ...prev, ...patch }))
  const rise = chainRisePs(state)
  const riseShare = ((rise / UI_PS) * 100).toFixed(0)
  const { real, measured } = analysis

  const rateText = (rate: number | null) => (rate === null ? t(S.none) : `${rate} Gb/s`)
  const asideText = verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsAteLimit.title)}
      goal={t(HS_META.hsAteLimit.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={asideText}
      asideLater={t(S.asideLater)}
      nextId="hsCapstone"
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(state, real, measured, baseline)}
          onReset={() => setState(DEFAULT_ATE)}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pmu', 'hsEye', 'fAte', 'hsJitter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <Knob label={S.knobAte} value={state.ateBw} unit="GHz" min={4} max={20} step={1} onChange={(ateBw) => update({ ateBw })} />
          <Knob
            label={S.knobLoss}
            value={state.fixLossDb}
            unit="dB"
            min={0.5}
            max={6}
            step={0.5}
            onChange={(fixLossDb) => update({ fixLossDb })}
          />
          <div className="hs-field">
            <span className="hs-field__label">{t(S.deLabel)}</span>
            <Seg options={DEEMBED_OPTIONS} value={state.deembed} onChange={(deembed) => update({ deembed })} />
          </div>
          <Knob
            label={S.knobErr}
            value={Math.round(state.modelErr * 100)}
            unit="%"
            min={-30}
            max={30}
            step={5}
            onChange={(value) => update({ modelErr: value / 100 })}
          />
        </div>

        <div className="ate-eyes">
          <EyeCanvas wave={analysis.realWave} label={S.realAria} caption={S.realCap} />
          <EyeCanvas wave={analysis.wave} label={S.measAria} caption={S.measCap} />
        </div>

        <div className="hs-grid">
          <ResponseFig state={state} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rRealEye, value: `${real.height.toFixed(0)} mV / ${real.width.toFixed(2)} UI`, state: real.pass ? 'pass' : 'fail' },
                { label: S.rMeasEye, value: `${measured.height.toFixed(0)} mV / ${measured.width.toFixed(2)} UI`, state: measured.pass ? 'pass' : 'fail' },
                { label: S.rHits, value: String(measured.hits), state: measured.hits > 0 ? 'fail' : 'pass' },
                { label: S.rVerdict, value: t(measured.pass ? S.pass : S.fail), state: measured.pass ? 'pass' : 'fail' },
                { label: S.rRise, value: `${rise.toFixed(0)} ps (${riseShare}% UI)` },
                { label: S.rFixBw, value: `${fixtureBw(state).toFixed(2)} GHz` },
                { label: S.rMaxReal, value: rateText(maxReal), state: maxReal !== null && maxReal >= RATE_GBPS ? 'pass' : 'fail' },
                { label: S.rMaxMeas, value: rateText(maxMeas), state: maxMeas !== null && maxMeas >= RATE_GBPS ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.loopTitle)} note={t(S.loopNote)}>
        <RefParas paras={LOOP_PARAS} onOpen={onModuleChange} />
        <Related ids={['scan', 'memBist', 'hsInterface']} onOpen={onModuleChange} />
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
