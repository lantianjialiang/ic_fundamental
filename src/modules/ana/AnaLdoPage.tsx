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
import { HookFig, LoadFig, PsrrFig } from './LdoFig'
import { ANA_META } from './meta'
import {
  FREQ_OPTIONS,
  INTRO,
  LOAD_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  fmtSigned,
  isPredictionRight,
  predictFeedback,
  taskItems,
  verdictOf,
} from './ldoData'
import { DEFAULT_LDO, IQ_UA, VIN_MAX, VIN_MIN, ldoResult, type LdoState } from './ldoModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaLdoPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<LdoState>(DEFAULT_LDO)
  const [predict, setPredict] = useState('')
  const result = ldoResult(state)
  const predicted = isPredictionRight(predict, result.lineMvPerV)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<LdoState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => {
    setState(DEFAULT_LDO)
    setPredict('')
  }

  const predictText = t(predictFeedback(predict, predicted, result.lineMvPerV))
  let predictClass = ''
  if (predict !== '') {
    predictClass = predicted ? ' is-ok' : ' is-bad'
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaLdo.title)}
      goal={t(ANA_META.anaLdo.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaStatic"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result, predicted)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <HookFig />
        <Related ids={['anaResources', 'anaSmu', 'anaMeasure']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <Knob
            label={S.vinLabel}
            value={state.vin}
            unit="V"
            min={VIN_MIN}
            max={VIN_MAX}
            step={0.1}
            onChange={(vin) => update({ vin })}
          />
          <div className="ana-field">
            <span className="ana-field__label">{t(S.loadLabel)}</span>
            <Seg options={LOAD_OPTIONS} value={String(state.iloadMa)} onChange={(id) => update({ iloadMa: Number(id) })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.freqLabel)}</span>
            <Seg options={FREQ_OPTIONS} value={String(state.freqHz)} onChange={(id) => update({ freqHz: Number(id) })} />
          </div>
        </div>

        <div className="ana-grid">
          <div className="ana-cell">
            <h3>{t(S.loadTitle)}</h3>
            <p className="intro__note">{t(S.loadNote)}</p>
            <LoadFig state={state} />
          </div>
          <div className="ana-cell">
            <h3>{t(S.psrrTitle)}</h3>
            <p className="intro__note">{t(S.psrrNote)}</p>
            <PsrrFig state={state} />
          </div>
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rVoutLo, value: `${result.voutLo.toFixed(4)} V` },
              { label: S.rVoutVin, value: `${result.voutVin.toFixed(4)} V` },
              { label: S.rLine, value: `${result.lineMvPerV.toFixed(2)} mV/V`, state: result.linePass ? 'pass' : 'fail' },
              { label: S.rAcc, value: fmtSigned(result.accPct), state: result.accPass ? 'pass' : 'fail' },
              { label: S.rLoad, value: `${result.loadMvPerMa.toFixed(3)} mV/mA`, state: result.loadPass ? 'pass' : 'fail' },
              { label: S.rIq, value: `${IQ_UA} µA`, state: result.iqPass ? 'pass' : 'fail' },
              { label: S.rPsrr, value: `${result.psrrDb.toFixed(1)} dB`, state: result.psrrPass ? 'pass' : 'fail' },
              { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
            ]}
          />
          <div className="ana-predict">
            <label className="ana-field__label" htmlFor="ana-ldo-predict">
              {t(S.predictTitle)} · {t(S.predictLabel)}
            </label>
            <input
              id="ana-ldo-predict"
              className="ana-predict__input"
              type="number"
              step="0.01"
              value={predict}
              placeholder="?"
              onChange={(e) => setPredict(e.target.value)}
            />
            <p className={`ana-predict__note${predictClass}`}>{predictText}</p>
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
