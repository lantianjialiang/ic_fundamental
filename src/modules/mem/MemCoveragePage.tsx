import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
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
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

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

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(state, result)} />

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
          <figure className="term-fig">
            <svg viewBox="0 0 420 170" className="term-fig__svg" role="img" aria-label={t(loc('每千颗投入的检出、通过和漏出流向', 'Detected, passing and escaped units per thousand inputs'))}>
              <rect width="420" height="170" rx="8" fill="var(--well)" />
              <path d="M121 81 H162 V47 H186 M162 81 V117 H186 M279 117 H300" fill="none" stroke="var(--muted)" strokeWidth="2" />
              <rect x="16" y="54" width="105" height="54" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
              <rect x="186" y="21" width="93" height="54" rx="6" fill="var(--fig-box)" stroke="var(--red)" />
              <rect x="186" y="90" width="93" height="54" rx="6" fill="var(--fig-box)" stroke="var(--green)" />
              <rect x="300" y="90" width="103" height="54" rx="6" fill="var(--fig-box)" stroke="var(--gold)" />
              <g fill="var(--text)" textAnchor="middle" fontSize="14">
                <text x="68" y="77">{t(loc('投入', 'Inputs'))}</text><text x="68" y="97">1,000</text>
                <text x="233" y="43">{t(loc('检出', 'Detected'))}</text><text x="233" y="63">{(1000 * (1 - result.testYield)).toFixed(2)}</text>
                <text x="233" y="112">{t(loc('通过', 'Passed'))}</text><text x="233" y="132">{(1000 * result.testYield).toFixed(2)}</text>
                <text x="351" y="112">{t(loc('其中漏检', 'With escapes'))}</text><text x="351" y="132">{(result.testYield * result.ppm / 1000).toFixed(2)}</text>
              </g>
            </svg>
            <figcaption>{t(loc('覆盖率是检出的故障类型占注入故障类型的比例。将它当成每个 Poisson 缺陷独立被检出的概率 c 后，通过率以投入为分母，漏检 PPM 以通过品为分母。',
              'Coverage is detected modeled faults divided by all injected faults. Treating c as the independent detection probability of each Poisson defect, test yield uses all inputs and escape PPM uses only passing devices.'))}</figcaption>
            <Readout items={[
              { label: loc('投入中通过的比例', 'Passing fraction of all inputs'), value: `e^(−λc) ≈ e^(−${result.lambda} × ${result.coverage.toFixed(3)}) ≈ ${(100 * result.testYield).toFixed(2)}%` },
              { label: loc('每百万通过品中的漏检', 'Escapes per million passing devices'),
                value: `[1 − e^(−${result.lambda} × (1 − ${result.coverage.toFixed(3)}))] × 10⁶ ≈ ${Math.round(result.ppm)} ppm` },
            ]} />
          </figure>
        </div>
        <div className="mcov-table-block">
          <p className="mcov-table-block__title">{t(S.tableTitle)}</p>
          <p className="mcov-table-block__note">{t(S.tableNote)}</p>
          <FaultTable current={state.alg} />
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
