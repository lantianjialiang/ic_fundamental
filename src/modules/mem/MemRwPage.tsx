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
import { RwFig } from './RwFig'
import './memRw.css'
import {
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  VALUE_OPTIONS,
  accessText,
  dataTextOf,
  resultOf,
  taskItems,
  verdictOf,
} from './rwData'
import { DEFAULT_RW, SIZE, buildSlots, sequenceOf, type RwState } from './rwModel'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemRwPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<RwState>(DEFAULT_RW)
  const seq = useMemo(() => sequenceOf(state.addr, state.value), [state.addr, state.value])
  const slots = useMemo(() => buildSlots(seq), [seq])
  const total = slots.length
  const current = state.step > 0 ? slots[state.step - 1] : null
  const verdict = verdictOf(state, seq, slots)
  const result = resultOf(seq, slots, state.step)

  /** 改地址或数据会换一个序列，所以回到第 0 步 */
  const setParam = (patch: Partial<RwState>) => setState((prev) => ({ ...prev, ...patch, step: 0 }))
  const stepOnce = () => setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, total) }))
  const restart = () => setState((prev) => ({ ...prev, step: 0 }))

  /** 第 0 步时所有控制线都是高（空闲） */
  const levels = current ?? { cs: 1, we: 1, oe: 1 }
  const ctlText = `${levels.cs === 1 ? 'H' : 'L'} / ${levels.we === 1 ? 'H' : 'L'} / ${levels.oe === 1 ? 'H' : 'L'}`
  const opText = current === null ? t(S.none) : `${t(seq[current.access].write ? S.opWrite : S.opRead)} #${current.access + 1}`
  const addrBits = (current?.addr ?? state.addr).toString(2).padStart(6, '0')

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memRw.title)}
      goal={t(MEM_META.memRw.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memFault"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, total)} onReset={() => setState(DEFAULT_RW)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memStructure', 'timing', 'memFault']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mrw-controls">
          <Knob label={S.addrLabel} value={state.addr} unit="" min={0} max={SIZE - 1} step={1} onChange={(addr) => setParam({ addr })} />
          <div className="mrw-field">
            <span className="mrw-field__label">{t(S.valueLabel)}</span>
            <Seg options={VALUE_OPTIONS} value={String(state.value)} onChange={(id) => setParam({ value: Number(id) === 1 ? 1 : 0 })} />
          </div>
        </div>
        <div className="mrw-buttons">
          <button type="button" className="lab__btn lab__btn--primary" disabled={state.step >= total} onClick={stepOnce}>
            {t(S.stepBtn)}
          </button>
          <button type="button" className="lab__btn" onClick={restart}>
            {t(S.restartBtn)}
          </button>
        </div>
        <p className="mrw-note">{t(S.simpNote)}</p>

        <div className="mrw-grid">
          <RwFig slots={slots} seq={seq} executed={state.step} />
          <div className="mrw-cell">
            <Readout
              items={[
                { label: S.rStep, value: `${state.step} / ${total}` },
                { label: S.rOp, value: opText },
                { label: S.rCtl, value: ctlText },
                { label: S.rAddr, value: current === null ? t(S.none) : `${current.addr} (${addrBits})` },
                { label: S.rData, value: t(dataTextOf(current)) },
                { label: S.rResult, value: t(result.text), state: result.state },
              ]}
            />
            <ol className="mrw-seq">
              {seq.map((acc, index) => {
                let cls = ''
                if (current !== null && current.access === index) {
                  cls = ' is-current'
                } else if (current !== null && current.access > index) {
                  cls = ' is-done'
                }
                return (
                  <li key={index} className={cls.trim()}>
                    {t(accessText(acc, index))}
                  </li>
                )
              })}
            </ol>
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
