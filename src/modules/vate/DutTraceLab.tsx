import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Readout, Seg } from '../fund/parts'
import { VERDICT_LABEL } from './data/content'
import { fmtForce, fmtV, pinName } from './data/explain'
import { NO_DEFECT, SIG_PINS, runOs, type OsConfig } from './model/continuity'
import { IDDQ_SPEC, runIddq, type IddqConfig } from './model/iddq'
import { STATUS_LABEL } from './parts'

const DIES = [
  { id: 'a', label: loc('DUT A', 'DUT A') },
  { id: 'b', label: loc('DUT B', 'DUT B') },
  { id: 'c', label: loc('DUT C', 'DUT C') },
] as const

const STAGES = [
  loc('准备测试', 'Ready'),
  loc('T200 接触检查', 'T200 contact check'),
  loc('T100 静态电流', 'T100 quiescent current'),
  loc('记录 Bin', 'Record bin'),
]
const CONTACT: OsConfig = { forceUa: -100, clampV: 3, openTh: -1.5, shortTh: -.2, others: 'gnd', vdd: 'gnd' }
const CURRENT: IddqConfig = { dut: 'good', vdd: IDDQ_SPEC.vddNom, vector: 'v1', settleMs: 5, range: 'auto', clampUa: 1000, limitUa: IDDQ_SPEC.limitUa }

export function DutTraceLab() {
  const { t } = useLocale()
  const [die, setDie] = useState<(typeof DIES)[number]['id']>('a')
  const [stage, setStage] = useState(0)
  const contact = useMemo(() => runOs(die === 'b' ? { ...NO_DEFECT, kind: 'open' } : NO_DEFECT, CONTACT, [SIG_PINS[0]]).rows[0], [die])
  const contactPass = contact.verdict === 'pass'
  const current = runIddq({ ...CURRENT, dut: die === 'c' ? 'gox' : 'good' })
  const bin = !contactPass ? 2 : current.status === 'pass' ? 1 : 3
  const skipCurrent = !contactPass && stage >= 1
  const nextStage = stage === 1 && !contactPass ? 3 : Math.min(3, stage + 1)
  return (
    <div className="vlab">
      <figure className="term-fig">
        <Seg options={DIES} value={die} onChange={(id) => { setDie(id); setStage(0) }} />
        <svg viewBox="0 0 414 116" className="term-fig__svg" role="img" aria-label={t(loc('当前 DUT 的测试顺序', 'Test sequence for the current DUT'))}>
          <rect width="414" height="116" rx="10" fill="var(--well)" />
          <path data-vate-flow={stage} d={skipCurrent ? 'M54 55 H155 Q246 109 357 55' : 'M54 55 H357'}
            fill="none" stroke="var(--muted)" strokeWidth="2" />
          {STAGES.map((label, index) => {
            const x = 54 + 101 * index
            const active = index === stage
            const skipped = index === 2 && skipCurrent
            return <g key={index} opacity={skipped ? '.45' : 1}>
              <circle cx={x} cy="55" r="10" fill={active ? 'var(--gold)' : 'var(--fig-box)'} stroke={active ? 'var(--gold)' : 'var(--muted)'} strokeWidth="2" />
              <text x={x} y={index % 2 === 0 ? 29 : 97} textAnchor="middle" fontSize={index === 0 ? 13 : 12} fill="var(--text)">
                {t(label)}
              </text>
            </g>
          })}
        </svg>
        <div className="lab__actions">
          <button className="lab__btn" type="button" onClick={() => setStage(0)}>{t(loc('重走这颗 DUT', 'Restart this DUT'))}</button>
          <button className="lab__btn lab__btn--primary" type="button" disabled={stage === 3} onClick={() => setStage(nextStage)}>
            {t(loc('执行下一步', 'Execute next step'))}
          </button>
        </div>
        <figcaption>{t(loc('固定样片与测试顺序，先做接触检查。接触通过后才上电测 IDDQ。Bin 1、2、3 为本实验的演示分箱。',
          'The samples and test sequence are fixed. Check contact first, then power up for IDDQ only after contact passes. Bins 1, 2 and 3 are used for this exercise.'))}</figcaption>
        <div aria-live="polite" data-vate-trace={stage}>
          <Readout items={[
            ...(stage >= 1 ? [
              { label: loc('T200 激励与实际电压', 'T200 stimulus and measured voltage'),
                value: `${pinName(contact.pin)} · ${fmtForce(CONTACT.forceUa)} → ${fmtV(contact.vm)}` },
              { label: loc('T200 窗口与判定', 'T200 limits and verdict'),
                value: `${fmtV(CONTACT.openTh)} < V < ${fmtV(CONTACT.shortTh)} · ${t(VERDICT_LABEL[contact.verdict])}` },
            ] : []),
            ...(stage >= 2 && contactPass ? [
              { label: loc('T100 激励与实际电流', 'T100 stimulus and measured current'),
                value: `VDD ${CURRENT.vdd} V · ${CURRENT.vector.toUpperCase()} · ${CURRENT.settleMs} ms → ${current.readingUa ?? '—'} µA` },
              { label: loc('T100 上限与判定', 'T100 limit and verdict'),
                value: `IDDQ ≤ ${CURRENT.limitUa} µA · ${t(STATUS_LABEL[current.status])}` },
            ] : []),
            ...(stage === 3 ? [
              { label: loc('首次失败项', 'First failing test'), value: bin === 1 ? t(loc('全部通过', 'All tests passed'))
                : bin === 2 ? t(loc('T200 接触失败，T100 跳过', 'T200 contact fail; T100 skipped')) : t(STAGES[2]) },
              { label: loc('最终分箱', 'Final bin'), value: `Bin ${bin}`, state: bin === 1 ? 'pass' as const : 'fail' as const },
            ] : []),
          ]} />
        </div>
      </figure>
    </div>
  )
}
