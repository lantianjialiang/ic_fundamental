import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import { MEM_META } from './meta'
import {
  ALG_OPTIONS,
  INTRO,
  LAMBDA_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './memCoverageData'
import { CoverageCurveFig, FaultTable } from './MemCoverageFig'
import { analyseCoverage, type CoverageState, DEFAULT_COVERAGE } from './memCoverageModel'
import './memCoverage.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemCoveragePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CoverageState>(DEFAULT_COVERAGE)
  const result = useMemo(() => analyseCoverage(state), [state])
  const verdict = verdictOf(result)
  const update = (patch: Partial<CoverageState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memCoverage.title)}
      goal={t(MEM_META.memCoverage.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memBin"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DEFAULT_COVERAGE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memFault', 'memPattern', 'memBin']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mcov-controls">
          <div className="mcov-field">
            <span className="mcov-field__label">{t(S.algLabel)}</span>
            <Seg options={ALG_OPTIONS} value={state.alg} onChange={(alg) => update({ alg })} />
          </div>
          <div className="mcov-field">
            <span className="mcov-field__label">{t(S.lambdaLabel)}</span>
            <Seg options={LAMBDA_OPTIONS} value={state.lambda} onChange={(lambda) => update({ lambda })} />
          </div>
        </div>

        <div className="mcov-grid">
          <CoverageCurveFig current={state.alg} />
          <div className="mcov-cell">
            <Readout
              items={[
                { label: S.rCov, value: `${(result.coverage * 100).toFixed(1)}% (${result.detected}/${result.total})` },
                { label: S.rTime, value: result.timeMs.toFixed(1) },
                { label: S.rSim, value: `${result.simOps}` },
                { label: S.rTrue, value: `${(result.trueYield * 100).toFixed(1)}%` },
                { label: S.rTest, value: `${(result.testYield * 100).toFixed(1)}%` },
                { label: S.rPpm, value: `${Math.round(result.ppm)}`, state: result.ppm > 0 ? 'fail' : 'pass' },
              ]}
            />
          </div>
        </div>

        <div className="mcov-table-block">
          <p className="mcov-table-block__title">{t(S.tableTitle)}</p>
          <p className="mcov-table-block__note">{t(S.tableNote)}</p>
          <FaultTable current={state.alg} />
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
