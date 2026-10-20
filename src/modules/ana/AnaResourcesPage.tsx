import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { GroundFig, LoadBoardFig, SettleFig } from './ResourcesFig'
import {
  INTRO,
  MISCONCEPTIONS,
  PIN_NAME,
  PIN_TEXT,
  QUIZ,
  RES_OPTIONS,
  S,
  SHIELD_OPTIONS,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './resourcesData'
import {
  DEFAULT_ASSIGN,
  DEFAULT_SEED,
  PINS,
  SETTLE_DEFAULT_US,
  SETTLE_MAX_US,
  SIGMA_LIMIT_MV,
  connectedOf,
  evaluate,
  minSettleUs,
  vrefSigmaMv,
  type Assign,
  type PinId,
  type ResId,
} from './resourcesModel'
import './ana.css'
import './resources.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaResourcesPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [assign, setAssign] = useState<Assign>(DEFAULT_ASSIGN)
  const [settleUs, setSettleUs] = useState<number>(SETTLE_DEFAULT_US)
  const [shield, setShield] = useState(false)
  const [seed, setSeed] = useState<number>(DEFAULT_SEED)

  const results = evaluate(assign, settleUs)
  const sigma = vrefSigmaMv(assign.vref, shield, seed)
  const verdict = verdictOf(results, sigma, shield)
  const allPass =
    PINS.every((pin) => results[pin].status === 'ok') && sigma !== null && sigma <= SIGMA_LIMIT_MV
  const connectedCount = connectedOf(results).length

  const setPin = (pin: PinId, res: ResId) => setAssign((prev) => ({ ...prev, [pin]: res }))
  const reset = () => {
    setAssign(DEFAULT_ASSIGN)
    setSettleUs(SETTLE_DEFAULT_US)
    setShield(false)
    setSeed(DEFAULT_SEED)
  }

  const errValue = (pin: PinId): string => {
    const result = results[pin]
    if (result.status === 'off') {
      return t(S.notConnected)
    }
    if (result.status === 'incompatible') {
      return t(S.incompatible)
    }
    return `${result.errMv.toFixed(2)} mV`
  }
  const errState = (pin: PinId): 'pass' | 'fail' | undefined => {
    const status = results[pin].status
    if (status === 'off') {
      return undefined
    }
    return status === 'ok' ? 'pass' : 'fail'
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaResources.title)}
      goal={t(ANA_META.anaResources.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaSmu"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaSmu.title)}`}
      extra={<TaskList items={taskItems(results, settleUs, sigma)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaMeasure', 'pmu', 'anaSmu']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          {PINS.map((pin) => (
            <div className="ana-field" key={pin}>
              <span className="ana-field__label">{t(PIN_TEXT[pin])}</span>
              <select
                className="res-select"
                value={assign[pin]}
                aria-label={`${PIN_NAME[pin]} · ${t(S.pinResource)}`}
                onChange={(event) => setPin(pin, event.target.value as ResId)}
              >
                {RES_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <Knob
            label={S.settleLabel}
            value={settleUs}
            unit="µs"
            min={0}
            max={SETTLE_MAX_US}
            step={1}
            onChange={setSettleUs}
          />
          <div className="ana-field">
            <span className="ana-field__label">{t(S.shieldLabel)}</span>
            <Seg options={SHIELD_OPTIONS} value={shield ? 'on' : 'off'} onChange={(id) => setShield(id === 'on')} />
          </div>
        </div>

        <div className="ana-grid">
          <LoadBoardFig assign={assign} shield={shield} />
          <SettleFig results={results} settleUs={settleUs} />
        </div>

        <div className="ana-grid">
          <GroundFig res={assign.vref} shield={shield} seed={seed} settleUs={settleUs} />
          <div className="ana-cell">
            <Readout
              items={[
                { label: `VDD · ${t(S.rErr)}`, value: errValue('vdd'), state: errState('vdd') },
                { label: `VREF · ${t(S.rErr)}`, value: errValue('vref'), state: errState('vref') },
                { label: `AIN · ${t(S.rErr)}`, value: errValue('ain'), state: errState('ain') },
                {
                  label: S.rSigma,
                  value: sigma === null ? t(S.notConnected) : `${sigma.toFixed(2)} mV`,
                  state: sigma === null ? undefined : sigma <= SIGMA_LIMIT_MV ? 'pass' : 'fail',
                },
                {
                  label: S.rMinSettle,
                  value: connectedCount === 0 ? '—' : `${minSettleUs(results).toFixed(1)} µs`,
                },
                { label: S.rVerdict, value: t(allPass ? S.pass : S.fail), state: allPass ? 'pass' : 'fail' },
              ]}
            />
            <div className="res-actions">
              <button type="button" className="lab__btn" onClick={() => setSeed((value) => value + 1)}>
                {t(S.resample)}
              </button>
            </div>
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
