import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { DnlInlFig, HistFig } from './StaticFig'
import { ANA_META } from './meta'
import {
  DEVICE_OPTIONS,
  HITS_SEG_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  fmtLsb,
  isPredictionRight,
  predictFeedback,
  taskItems,
  verdictOf,
} from './staticData'
import { DEFAULT_STATIC, staticResult, type DeviceId, type StaticState } from './staticModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function AnaStaticPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<StaticState>(DEFAULT_STATIC)
  const [predict, setPredict] = useState('')
  const result = staticResult(state)
  const predicted = isPredictionRight(predict, result.expected)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<StaticState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => {
    setState(DEFAULT_STATIC)
    setPredict('')
  }

  const predictText = t(predictFeedback(predict, predicted, result.expected))
  let predictClass = ''
  if (predict !== '') {
    predictClass = predicted ? ' is-ok' : ' is-bad'
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaStatic.title)}
      goal={t(ANA_META.anaStatic.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaDynamic"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result, predicted)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSampling', 'anaDynamic', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.deviceLabel)}</span>
            <Seg<DeviceId> options={DEVICE_OPTIONS} value={state.device} onChange={(device) => update({ device })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.hitsLabel)}</span>
            <Seg options={HITS_SEG_OPTIONS} value={String(state.hits)} onChange={(id) => update({ hits: Number(id) })} />
          </div>
        </div>

        <div className="ana-grid">
          <div className="ana-cell">
            <h3>{t(S.histTitle)}</h3>
            <p className="intro__note">{t(S.histNote)}</p>
            <HistFig result={result} />
          </div>
          <div className="ana-cell">
            <h3>{t(S.dnlTitle)}</h3>
            <p className="intro__note">{t(S.dnlNote)}</p>
            <DnlInlFig result={result} />
          </div>
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rHits, value: String(result.hits) },
              { label: S.rOffset, value: fmtLsb(result.offsetLsb), state: result.offsetPass ? 'pass' : 'fail' },
              { label: S.rGain, value: fmtLsb(result.gainLsb), state: result.gainPass ? 'pass' : 'fail' },
              { label: S.rDnl, value: `${result.maxDnl.toFixed(2)} LSB`, state: result.dnlPass ? 'pass' : 'fail' },
              { label: S.rInl, value: `${result.maxInl.toFixed(2)} LSB`, state: result.inlPass ? 'pass' : 'fail' },
              {
                label: S.rMissing,
                value: result.missing.length > 0 ? result.missing.join(', ') : t(S.none),
                state: result.missPass ? 'pass' : 'fail',
              },
              { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
            ]}
          />
          <div className="ana-predict">
            <label className="ana-field__label" htmlFor="ana-static-predict">
              {t(S.predictTitle)} · {t(S.predictLabel)}
            </label>
            <input
              id="ana-static-predict"
              className="ana-predict__input"
              type="number"
              step="0.1"
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
