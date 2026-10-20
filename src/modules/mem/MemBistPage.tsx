import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import { MEM_META } from './meta'
import { MemBistFig } from './MemBistFig'
import { ECC_OPTIONS, INTRO, MISCONCEPTIONS, QUIZ, S, SAMPLE_OPTIONS, TAKEAWAY, taskItems, verdictOf } from './memBistData'
import { analyseBist, type BistState, DEFAULT_BIST, type RepairStep, SPARE_COLS, SPARE_ROWS } from './memBistModel'
import './memBist.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 修复步骤的一行文字：第几步、替换哪一行或哪一列、那条线上有几个失效位 */
function stepText(step: RepairStep, n: number): LText {
  if (step.line === 'row') {
    return loc(`第 ${n} 步：替换第 ${step.index} 行（失效 ${step.count} 位）`, `Step ${n}: replace row ${step.index} (${step.count} fails)`)
  }
  return loc(`第 ${n} 步：替换第 ${step.index} 列（失效 ${step.count} 位）`, `Step ${n}: replace column ${step.index} (${step.count} fails)`)
}

export function MemBistPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<BistState>(DEFAULT_BIST)
  const result = useMemo(() => analyseBist(state), [state])
  const verdict = verdictOf(result)
  const update = (patch: Partial<BistState>) => setState((prev) => ({ ...prev, ...patch }))
  const steps = result.plan.steps

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memBist.title)}
      goal={t(MEM_META.memBist.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memParallel"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DEFAULT_BIST)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memMarch', 'memFault', 'memBin']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mbist-controls">
          <div className="mbist-field">
            <span className="mbist-field__label">{t(S.sampleLabel)}</span>
            <Seg options={SAMPLE_OPTIONS} value={state.sample} onChange={(sample) => update({ sample })} />
          </div>
          <div className="mbist-field">
            <span className="mbist-field__label">{t(S.eccLabel)}</span>
            <Seg options={ECC_OPTIONS} value={state.ecc} onChange={(ecc) => update({ ecc })} />
          </div>
        </div>

        <div className="mbist-grid">
          <MemBistFig result={result} />
          <div className="mbist-cell">
            <Readout
              items={[
                { label: S.rRaw, value: `${result.raw.length}` },
                { label: S.rPlan, value: `${result.plan.rows.length}/${SPARE_ROWS} · ${result.plan.cols.length}/${SPARE_COLS}` },
                { label: S.rResidual, value: `${result.residual.length}`, state: result.residual.length > 0 ? 'fail' : 'pass' },
                { label: S.rEcc, value: `${result.wordsFixed} / ${result.wordsBad}`, state: result.wordsBad > 0 ? 'fail' : undefined },
                { label: S.rVerdict, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
              ]}
            />
            <div className="mbist-steps">
              <p className="mbist-steps__title">{t(S.stepsTitle)}</p>
              {steps.length === 0 ? (
                <p>{t(S.noRepair)}</p>
              ) : (
                <ol>
                  {steps.map((step, index) => (
                    <li key={index}>{t(stepText(step, index + 1))}</li>
                  ))}
                </ol>
              )}
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
