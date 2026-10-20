import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg, Steps } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { RF_META } from './meta'
import { RfOverviewFig } from './RfOverviewFig'
import { MISCONCEPTIONS, QUIZ, S, INTRO, TAKEAWAY, taskItems, verdictOf } from './rfOverviewData'
import { formatSi } from './rfFormat'
import { DEFAULT_OVERVIEW, SCENARIOS, SLIDER_STEPS, analyseFreq, freqFromPos, posFromFreq, type OverviewState } from './rfOverviewModel'
import './rfOverview.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfOverviewPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<OverviewState>(DEFAULT_OVERVIEW)
  const analysis = useMemo(() => analyseFreq(state.freqHz), [state.freqHz])
  const verdict = verdictOf(state.freqHz, analysis)
  const activeId = SCENARIOS.find((item) => item.freqHz === state.freqHz)?.id ?? ''
  const freqText = formatSi(state.freqHz, 'Hz')
  const bandText = analysis.band === null ? t(S.noBand) : t(analysis.band.name)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfOverview.title)}
      goal={t(RF_META.rfOverview.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={`${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfDb"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state.freqHz)} onReset={() => setState(DEFAULT_OVERVIEW)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaSignal']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.scenarioLabel)}</span>
            <Seg
              options={SCENARIOS.map((item) => ({ id: item.id, label: item.label }))}
              value={activeId}
              onChange={(id) => {
                const hit = SCENARIOS.find((item) => item.id === id)
                if (hit !== undefined) {
                  setState({ freqHz: hit.freqHz })
                }
              }}
            />
          </div>
          <label className="rf-slider">
            <span>
              {t(S.freqLabel)} <b>{freqText}</b>
            </span>
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS}
              step={1}
              value={posFromFreq(state.freqHz)}
              aria-label={t(S.freqLabel)}
              onChange={(event) => setState({ freqHz: freqFromPos(Number(event.target.value)) })}
            />
          </label>
        </div>

        <Callout>
          <p>{t(S.assume)}</p>
        </Callout>

        <div className="hs-grid">
          <RfOverviewFig freqHz={state.freqHz} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rFreq, value: freqText },
                { label: S.rLambda, value: formatSi(analysis.lambdaM, 'm') },
                { label: S.rBand, value: bandText },
                { label: S.rTenth, value: formatSi(analysis.tenthM, 'm') },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.scenTitle)}>
        <Steps items={S.scenarios} />
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
