import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { type CaseId } from './data/content'

const CHECKS = [
  { id: 'power', label: loc('电源', 'Supply') },
  { id: 'channel', label: loc('测试机通道', 'Tester channel') },
  { id: 'board', label: loc('负载板', 'Load board') },
  { id: 'socket', label: loc('Socket', 'Socket') },
  { id: 'dut', label: loc('DUT 采样端', 'DUT sample') },
] as const
const FIRST = { all: 0, pin: 3, freq: 4 }
const SPEED = [
  { id: 'fast', label: loc('100 MHz', '100 MHz') },
  { id: 'slow', label: loc('80 MHz', '80 MHz') },
] as const

export function DebugProbeFig({ scenario }: { scenario: CaseId }) {
  const { t } = useLocale()
  const [node, setNode] = useState<(typeof CHECKS)[number]['id']>('power')
  const [speed, setSpeed] = useState<(typeof SPEED)[number]['id']>('fast')
  const index = CHECKS.findIndex(({ id }) => id === node)
  const first = scenario === 'freq' && speed === 'slow' ? -1 : FIRST[scenario]
  const failed = first >= 0 && index >= first
  const supply = node === 'power'
  const sample = scenario === 'freq' && node === 'dut'
  const strobe = speed === 'slow' ? 12.5 : 10
  const switching = sample ? 11 : 4
  const x = (time: number) => 76 + 26 * time
  const measured = supply ? (failed ? '0.9 V' : '1.8 V') : failed ? '0' : '1'
  return (
    <figure className="term-fig">
      {scenario === 'freq' && <Seg options={SPEED} value={speed} onChange={setSpeed} />}
      <Seg options={CHECKS} value={node} onChange={setNode} />
      <svg viewBox="0 0 490 158" className="term-fig__svg" role="img"
        aria-label={t(loc('期望与实测波形', 'Expected and measured waveforms'))} data-debug-node={node} data-debug-first={first}>
        <rect width="490" height="158" fill="var(--well)" />
        <text x="67" y="38" textAnchor="end" fill="var(--text)" fontSize="15">{t(loc('期望', 'Expected'))}</text>
        <text x="67" y="99" textAnchor="end" fill="var(--text)" fontSize="15">{t(loc('实测', 'Measured'))}</text>
        <path d={supply ? 'M76 29 H450' : 'M76 55 H180 V29 H450'} stroke="var(--blue-strong)" strokeWidth="3" fill="none" />
        <path d={supply ? `M76 ${failed ? 110 : 86} H450` : failed && !sample ? 'M76 113 H450' : `M76 113 H${x(switching)} V86 H450`}
          stroke={failed ? 'var(--red)' : 'var(--green)'} strokeWidth="3" fill="none" />
        {sample && <><path d={`M${x(strobe)} 17 V125`} stroke="var(--gold)" strokeDasharray="4 4" strokeWidth="2" />
          <text x={x(strobe)} y="146" textAnchor="middle" fill="var(--text)" fontSize="15">{`Strobe ${strobe} ns`}</text></>}
      </svg>
      <figcaption aria-live="polite">
        {t(loc(`教学样例 · A5 · ${t(CHECKS[index].label)}读数 ${measured}。`, `Example · A5 · ${t(CHECKS[index].label)} reading ${measured}.`))}{' '}
        {index === first ? t(loc('从这里首次观察到偏离。', 'The first discrepancy appears here.')) :
          failed ? t(loc('此处异常，向前检查找到最先偏离的一站。', 'This reading is abnormal. Check upstream for the first discrepancy.')) : t(loc('该站与参考一致。', 'This point agrees with the reference.'))}
      </figcaption>
    </figure>
  )
}
