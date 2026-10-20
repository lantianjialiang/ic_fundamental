import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import './memPattern.css'
import './memMarch.css'
import { ARRAY_SIZE } from './faultSet'
import { MarchFig, marksOf } from './MarchFig'
import { COVERAGE, ELEMENT_NOTE, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, elementText, taskItems, verdictOf } from './marchData'
import {
  ALGORITHMS,
  DEFAULT_MARCH,
  FAULT_CHOICES,
  type MarchState,
  algOf,
  faultOf,
  marchSteps,
  runChoice,
} from './marchModel'
import { MEM_META } from './meta'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemMarchPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<MarchState>(DEFAULT_MARCH)
  const alg = algOf(state.alg)
  const choice = faultOf(state.fault)
  const steps = useMemo(() => marchSteps(alg, ARRAY_SIZE), [alg])
  const result = useMemo(() => runChoice(alg, choice), [alg, choice])
  const count = steps.length
  const shown = Math.min(state.step, count)
  const cur = shown > 0 ? steps[shown - 1] : null
  const entry = shown > 0 ? result.log[shown - 1] : null
  const current = cur !== null && entry !== null ? { addr: cur.addr, write: cur.write, pass: cur.write ? null : entry.pass } : null
  const order = cur === null ? null : alg.elements[cur.element].order
  const verdict = verdictOf(state.alg, choice, result, steps)
  const marks = marksOf(choice.fault)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memMarch.title)}
      goal={t(MEM_META.memMarch.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memTiming"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, count, result)} onReset={() => setState(DEFAULT_MARCH)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memFault', 'memPattern', 'memTiming']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mmar-controls">
          <div className="mmar-field">
            <span className="mmar-field__label">{t(S.algLabel)}</span>
            <Seg options={ALGORITHMS} value={state.alg} onChange={(id) => setState({ alg: id, fault: state.fault, step: 0 })} />
          </div>
          <div className="mmar-field">
            <span className="mmar-field__label">{t(S.faultLabel)}</span>
            <select
              className="mmar-select"
              value={state.fault}
              aria-label={t(S.faultLabel)}
              onChange={(e) => setState({ alg: state.alg, fault: e.target.value, step: 0 })}
            >
              {FAULT_CHOICES.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.label)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mmar-buttons">
          <button type="button" className="lab__btn" disabled={shown >= count} onClick={() => setState({ ...state, step: Math.min(count, shown + 1) })}>
            {t(S.stepOne)}
          </button>
          <button type="button" className="lab__btn" disabled={shown >= count} onClick={() => setState({ ...state, step: count })}>
            {t(S.stepAll)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setState({ alg: state.alg, fault: state.fault, step: 0 })}>
            {t(S.stepReset)}
          </button>
          <span className="mmar-progress">{`${t(S.progress)}: ${shown} / ${count}`}</span>
        </div>
        <p className="mmar-note">{t(S.opHelp)}</p>

        <div className="mmar-grid">
          <MarchFig size={ARRAY_SIZE} current={current} order={order} marks={marks} />
          <div className="mmar-cell">
            <Readout
              items={[
                { label: S.rElement, value: cur === null ? t(S.notStarted) : `${cur.element + 1}  ${elementText(alg.elements[cur.element])}` },
                { label: S.rAddr, value: cur === null ? '—' : String(cur.addr) },
                { label: S.rOp, value: cur === null ? '—' : cur.op },
                { label: S.rExpect, value: entry === null || entry.expected === null ? '—' : String(entry.expected) },
                { label: S.rActual, value: entry === null || entry.actual === null ? '—' : String(entry.actual) },
                {
                  label: S.rResult,
                  value: cur === null ? t(S.notStarted) : cur.write || entry === null ? t(S.noCompare) : t(entry.pass ? S.match : S.mismatch),
                  state: cur === null || cur.write || entry === null ? undefined : entry.pass ? 'pass' : 'fail',
                },
              ]}
            />
            <p className="mmar-elements__title">{t(S.elementsTitle)}</p>
            <ol className="mmar-elements">
              {alg.elements.map((el, index) => (
                <li key={index} className={cur !== null && cur.element === index ? 'mmar-elem is-cur' : 'mmar-elem'}>
                  {elementText(el)}
                </li>
              ))}
            </ol>
            <p className="mmar-note">{t(ELEMENT_NOTE)}</p>
          </div>
        </div>

        <p className="mmar-table-block__title">{t(S.logTitle)}</p>
        <p className="mmar-note">{t(S.logNote)}</p>
        <div className="mmar-log">
          <table className="mmar-table">
            <thead>
              <tr>
                {S.logCols.map((col, index) => (
                  <th key={index}>{t(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {steps.map((st, index) => {
                const done = index < shown
                const logged = result.log[index]
                const resultText = !done ? '' : st.write ? t(S.noCompare) : t(logged.pass ? S.match : S.mismatch)
                return (
                  <tr key={index} className={done ? 'mmar-row' : 'mmar-row is-pending'}>
                    <td>{index + 1}</td>
                    <td>{st.element + 1}</td>
                    <td>{st.addr}</td>
                    <td>{st.op}</td>
                    <td>{done && logged.expected !== null ? logged.expected : '—'}</td>
                    <td>{done && logged.actual !== null ? logged.actual : '—'}</td>
                    <td>{resultText}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t(S.covTitle)} note={t(S.covNote)}>
        <div className="mmar-log">
          <table className="mmar-table mmar-cov" aria-label={t(S.covAria)}>
            <thead>
              <tr>
                <th>{t(S.covFault)}</th>
                {ALGORITHMS.map((item) => (
                  <th key={item.id}>{t(item.label)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVERAGE.map((row) => (
                <tr key={row.preset.id}>
                  <td>{t(row.preset.name)}</td>
                  {ALGORITHMS.map((item) => {
                    const cell = row.cells[item.id]
                    return (
                      <td key={item.id} className={cell.detected ? 'is-hit' : 'is-miss'}>
                        {cell.detected ? t(S.hitAt(cell.step + 1, cell.addr)) : t(S.miss)}
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
