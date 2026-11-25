import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { Gnd, T } from './SwitchFigs'
import { fmtTime } from './DynamicFigs'

const EDGES = [
  { id: 'source', label: loc('驱动器供电充栅极', 'Source current into the gate') },
  { id: 'sink', label: loc('栅极向驱动器放电', 'Sink current from the gate') },
] as const

export function GateDrivePath({ volts, rg, current, charge, maxTime }: {
  volts: number; rg: number; current: number; charge: number; maxTime: number
}) {
  const { t } = useLocale()
  const [edge, setEdge] = useState<(typeof EDGES)[number]['id']>('source')
  const source = edge === 'source'
  const time = charge / current
  const end = 67 + 345 * time / maxTime
  const hi = 167 - 54 * volts / 12
  const iq = `${current.toFixed(3)} A`
  return (
    <figure className="term-fig">
      <Seg options={EDGES} value={edge} onChange={setEdge} />
      <svg viewBox="0 0 470 226" className="term-fig__svg" role="img"
        aria-label={t(loc('驱动器、电阻、栅极及对应的充放电时间', 'Driver, resistor, gate and the corresponding charging or discharging time'))}
        data-gate-drive={edge} data-duration-ns={time * 1e9}>
        <rect width="470" height="226" fill="var(--well)" />
        <rect x="22" y="25" width="90" height="37" rx="5" fill="var(--blue-bg)" stroke="var(--blue)" />
        <T x={67} y={48} size={14}>{t(loc('驱动输出级', 'Driver output'))}</T>
        <path d="M112 44 H158 l5 -7 10 14 10 -14 10 14 10 -14 5 7 H338 V59 M338 68 V81 M327 59 H349 M327 68 H349"
          stroke="var(--gold)" strokeWidth="2.5" fill="none" />
        <path d={source ? 'M269 39 L276 44 L269 49' : 'M276 39 L269 44 L276 49'} stroke="var(--gold)" strokeWidth="3" fill="none" />
        <T x={180} y={25} size={15}>{`Rg = ${rg} Ω`}</T>
        <T x={292} y={29} size={14}>{iq}</T>
        <Gnd x={338} y={81} />
        <T x={383} y={69} size={14}>{t(loc('等效栅极', 'Gate charge'))}</T>
        <path d="M54 105 V183 H423" stroke="var(--muted)" strokeWidth="1.5" fill="none" />
        <T x={24} y={121} size={15}>VGS</T>
        <path d={`M56 ${source ? 167 : hi} H67 L${end} ${source ? hi : 167} H421`}
          fill="none" stroke="var(--blue-strong)" strokeWidth="3" />
        <path d={`M${end} 109 V183`} fill="none" stroke="var(--gold)" strokeDasharray="4 4" />
        <T x={230} y={212} size={16} mono>{`Qg / Ig ≈ ${fmtTime(time)}`}</T>
      </svg>
      <figcaption aria-live="polite">{t(loc('蓝线用同一时间尺比较不同驱动。这个估算把栅极电流视为常数，并假设拉电流与灌电流相同。完整米勒平台见上面的开关波形。', 'The blue traces share a time scale across drivers. This estimate uses constant gate current and assumes equal source and sink currents. The switching plot above shows the Miller plateau.'))}</figcaption>
    </figure>
  )
}
