import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards } from '../fund/parts'
import { RefP, type PrepNote } from '../prep/common'
import { S } from './data/mosSelect'
import { CASES, CASE_LABEL, FLOW, type CaseId } from './data/mosSelectFlow'
import { CaseFig } from './SelectFigs7'
import { FlowFig } from './SelectFigs5'

type Props = { onOpen: (id: ModuleId) => void; onNote: (note: PrepNote) => void }

export function SelectFlow({ onOpen, onNote }: Props) {
  const { t } = useLocale()
  const flow = useStepPlayer(FLOW.length, 2200)
  const prev = useRef(flow.step)
  const item = FLOW[flow.step]

  // 步骤从播放器内部变化时同步侧栏；首次渲染不动侧栏
  useEffect(() => {
    if (prev.current === flow.step) {
      return
    }
    prev.current = flow.step
    onNote({ kicker: S.kickerFlow, title: FLOW[flow.step].title, text: FLOW[flow.step].text })
  }, [flow.step, onNote])

  return (
    <>
      <FlowFig step={flow.step} onPick={flow.goTo} />
      <StepControls player={flow} stepLabels={FLOW.map((s) => s.title)} />
      <Callout>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <RefP text={item.text} onOpen={onOpen} />
      </Callout>
    </>
  )
}

export function SelectCases({ onOpen, onNote }: Props) {
  const { t } = useLocale()
  const [id, setId] = useState<CaseId>(CASES[0].id)
  const item = CASES.find((c) => c.id === id) ?? CASES[0]
  return (
    <>
      <Cards
        items={CASES.map((c) => ({ id: c.id, title: c.title, sub: c.sub, text: c.symptom }))}
        activeId={id}
        cols={3}
        onPick={(c) => {
          const next = CASES.find((x) => x.id === c.id) ?? CASES[0]
          setId(next.id)
          onNote({ kicker: S.kickerCase, title: next.title, text: next.cause })
        }}
      />
      <CaseFig id={id} />
      <Callout tone="bad">
        <p>
          <b>{t(CASE_LABEL.symptom)}</b>
          {t(item.symptom)}
        </p>
        <p>
          <b>{t(CASE_LABEL.cause)}</b>
          {t(item.cause)}
        </p>
      </Callout>
      <Callout tone="ok">
        <p>
          <b>{t(CASE_LABEL.fix)}</b>
        </p>
        <RefP text={item.fix} onOpen={onOpen} />
      </Callout>
    </>
  )
}
