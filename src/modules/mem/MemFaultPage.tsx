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
import { MEM_META } from './meta'
import { FaultFig } from './FaultFig'
import './memFault.css'
import {
  INTRO,
  KIND_LABEL,
  KIND_OPTIONS,
  MARCH_TEXT,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  elementName,
  taskItems,
  verdictOf,
} from './faultData'
import { DEFAULT_FAULT, SIZE, TWO_CELL, elementIndexOf, injectionOf, runInjection, type FaultState } from './faultModel'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemFaultPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<FaultState>(DEFAULT_FAULT)
  const inj = useMemo(() => injectionOf(state), [state])
  const result = useMemo(() => runInjection(inj), [inj])
  const verdict = verdictOf(state, inj, result)
  const update = (patch: Partial<FaultState>) => setState((prev) => ({ ...prev, ...patch }))
  const twoCell = TWO_CELL.includes(state.kind)
  const firstFail = result.log.find((entry) => !entry.pass)

  const asideText = verdict.note === null ? t(verdict.text) : `${t(verdict.text)} ${t(verdict.note)}`

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memFault.title)}
      goal={t(MEM_META.memFault.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={asideText}
      asideLater={t(S.asideLater)}
      nextId="memPattern"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, inj, result)} onReset={() => setState(DEFAULT_FAULT)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memRw', 'vector', 'memMarch', 'memPattern']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mft-controls">
          <div className="mft-field">
            <span className="mft-field__label">{t(S.kindLabel)}</span>
            <Seg options={KIND_OPTIONS} value={state.kind} onChange={(kind) => update({ kind })} />
          </div>
          <Knob label={S.cellLabel} value={state.cell} unit="" min={0} max={SIZE - 1} step={1} onChange={(cell) => update({ cell })} />
          {twoCell ? (
            <Knob label={S.victimLabel} value={state.victim} unit="" min={0} max={SIZE - 1} step={1} onChange={(victim) => update({ victim })} />
          ) : null}
        </div>
        <p className="mft-note">{`${t(S.algLabel)}${MARCH_TEXT}`}</p>

        <div className="mft-grid">
          <FaultFig state={state} inj={inj} failAddrs={result.failAddrs} />
          <div className="mft-cell">
            <Readout
              items={[
                { label: S.rKind, value: t(KIND_LABEL[state.kind]) },
                { label: S.rPos, value: inj.victim === null ? `${state.cell}` : `${state.cell} / ${inj.victim}` },
                { label: S.rResult, value: t(result.pass ? S.pass : S.fail), state: result.pass ? 'pass' : 'fail' },
                { label: S.rFails, value: `${result.failAddrs.length}` },
                { label: S.rList, value: result.failAddrs.length === 0 ? t(S.none) : result.failAddrs.join(', ') },
                { label: S.rFirst, value: firstFail === undefined ? t(S.none) : t(elementName(elementIndexOf(firstFail.step))) },
              ]}
            />
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
