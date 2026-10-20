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
import { ARRAY_SIZE } from './faultSet'
import { MEM_META } from './meta'
import { PatternFig } from './PatternFig'
import { COVERAGE, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './patternData'
import { DEFAULT_PATTERN, PATTERN_IDS, PATTERN_OPTIONS, type PatternState, opsPerCell } from './patternModel'
import './memPattern.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemPatternPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PatternState>(DEFAULT_PATTERN)
  const pattern = state.pattern
  const verdict = verdictOf(pattern, COVERAGE)
  const total = COVERAGE.length
  const detected = COVERAGE.filter((row) => row.cells[pattern].detected).length
  const cost = opsPerCell(pattern, ARRAY_SIZE)
  const baseCost = opsPerCell('all0', ARRAY_SIZE)
  const accesses = cost * ARRAY_SIZE

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memPattern.title)}
      goal={t(MEM_META.memPattern.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memMarch"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(pattern, COVERAGE)} onReset={() => setState(DEFAULT_PATTERN)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memFault', 'memStructure', 'memMarch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mem-controls">
          <div className="mem-field">
            <span className="mem-field__label">{t(S.patLabel)}</span>
            <Seg options={PATTERN_OPTIONS} value={pattern} onChange={(id) => setState({ pattern: id })} />
          </div>
        </div>

        <div className="mem-grid">
          <PatternFig selected={pattern} rows={COVERAGE} />
          <div className="mem-cell">
            <Readout
              items={[
                { label: S.rCov, value: `${detected} / ${total}`, state: detected === total ? 'pass' : 'fail' },
                { label: S.rAcc, value: `${accesses}` },
                { label: S.rPerCell, value: `${cost}` },
                { label: S.rCost, value: `${(cost / baseCost).toFixed(0)} ×` },
              ]}
            />
          </div>
        </div>

        <div className="prep-table-wrap">
          <table className="prep-table mem-cov" aria-label={t(S.tableAria)}>
            <thead>
              <tr>
                <th>{t(S.faultCol)}</th>
                {PATTERN_OPTIONS.map((option) => (
                  <th key={option.id} className={option.id === pattern ? 'is-sel' : ''}>
                    {t(option.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVERAGE.map((row) => (
                <tr key={row.fault.id}>
                  <td className="mem-cov__name">{t(row.fault.name)}</td>
                  {PATTERN_IDS.map((id) => {
                    const cell = row.cells[id]
                    return (
                      <td key={id} className={id === pattern ? 'is-sel' : ''}>
                        {cell.detected ? (
                          <span className="mem-hit">{`${t(S.hit)} · ${t(S.addr)} ${cell.failAddrs.join(', ')}`}</span>
                        ) : (
                          <span className="mem-miss">{t(S.miss)}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
