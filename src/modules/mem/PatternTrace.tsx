import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Seg } from '../fund/parts'
import { PRESET_FAULTS } from './faultSet'
import { runPattern, type PatternId } from './patternModel'

const CHOICES = PRESET_FAULTS.filter(({ fault }) => fault.kind === 'CFIN' || fault.kind === 'CFID')

export function PatternTrace({ pattern }: { pattern: PatternId }) {
  const { t } = useLocale()
  const [choice, setChoice] = useState(CHOICES[0].id)
  const [shown, setShown] = useState(1)
  const fault = CHOICES.find(({ id }) => id === choice) ?? CHOICES[0]
  const run = useMemo(() => runPattern(pattern, fault.fault), [pattern, fault])
  const current = run.log[shown - 1]
  const flipped = run.log.find(({ coupling }) => coupling?.length)
  const fail = run.log.find((entry) => !entry.pass)
  const change = flipped?.coupling?.[0]
  return (
    <figure className="term-fig pattern-trace" data-pattern-trace={pattern} data-operation={shown}>
      <Seg options={CHOICES.map(({ id, name }) => ({ id, label: name }))} value={choice} onChange={(id) => {
        setChoice(id)
        setShown(1)
      }} />
      <div className="knob-row"><Knob label={loc('查看第几步', 'Inspect operation')} value={shown}
        min={1} max={run.log.length} step={1} unit="" onChange={setShown} /></div>
      <div className="row-actions">
        <button type="button" className="lab__btn" disabled={!flipped} onClick={() => { if (flipped) setShown(flipped.step + 1) }}>
          {t(loc('定位首次耦合改变', 'Find the first coupling change'))}
        </button>
        <button type="button" className="lab__btn" disabled={!fail} onClick={() => { if (fail) setShown(fail.step + 1) }}>
          {t(loc('定位首次读错', 'Find the first wrong read'))}
        </button>
      </div>
      <ol className="mem-coupling-trace">
        <li data-state={flipped?.step === current.step ? 'current' : flipped && flipped.step <= current.step ? 'done' : 'pending'}>
          <strong>{t(loc('侵害写入 → 受害位改变', 'Aggressor write → victim changes'))}</strong>
          <span>{change && flipped && flipped.step <= current.step
            ? `#${flipped.step + 1} · W[${change.aggressor}] → [${change.victim}] ${change.before} → ${change.after}`
            : t(flipped ? loc('尚未执行到改变点', 'Change not reached') : loc('本序列没有触发此改变', 'No change triggered by this sequence'))}</span>
        </li>
        <li data-state={fail && fail.step <= current.step ? 'fail' : 'pending'}>
          <strong>{t(loc('首次读出差异', 'First mismatched read'))}</strong>
          <span>{fail && fail.step <= current.step ? `#${fail.step + 1} · R[${fail.addr}] · ${fail.actual} ≠ ${fail.expected}`
            : t(fail ? loc('尚未读到异常', 'Mismatch not reached') : loc('本序列没有读到异常', 'No mismatch in this sequence'))}</span>
        </li>
      </ol>
      <figcaption aria-live="polite">
        {t(loc(`当前第 ${shown} 步 · ${current.write ? 'W' : 'R'}[${current.addr}]`, `Current operation ${shown} · ${current.write ? 'W' : 'R'}[${current.addr}]`))}
      </figcaption>
    </figure>
  )
}
