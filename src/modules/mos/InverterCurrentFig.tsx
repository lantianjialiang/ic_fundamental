import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { Gnd, MosSym, T } from './SwitchFigs'

const PATH = {
  charge: 'M202 30 V110 H320 V126',
  discharge: 'M320 126 V110 H202 V191',
  short: 'M202 30 V191',
  leak: 'M202 30 V191',
}
const MODES = [
  { id: 'charge', label: loc('负载充电', 'Load charging'), note: loc('Vin 下降，PMOS 给负载电容充电。电流从 VDD 流向 Cᴸ，Vout 上升。', 'As Vin falls, the PMOS charges the load capacitor. Current flows from VDD into Cᴸ and Vout rises.') },
  { id: 'discharge', label: loc('负载放电', 'Load discharging'), note: loc('Vin 上升，NMOS 给负载电容放电。此刻电容中已有的能量经 NMOS 耗散，Vout 下降。', 'As Vin rises, the NMOS discharges the load capacitor. Stored energy is dissipated through the NMOS and Vout falls.') },
  { id: 'short', label: loc('瞬态直通', 'Transient shoot-through'), note: loc('输入边沿经过两管都可导通的区间时，电流可以直接从 VDD 经两管到地。这条路径与电容支路并存。', 'While the input passes through the region where both devices can conduct, current can flow directly from VDD to ground. The capacitor branch exists alongside this path.') },
  { id: 'leak', label: loc('稳定漏电', 'Steady-state leakage'), note: loc('这里取 Vin 已稳定在低电平。NMOS 处于截止状态，仍有小的漏电流。虚线表示简化的沟道漏电路径，稳定的电容没有充放电。', 'Vin is held low in this example. The off NMOS still leaks a small current. The dashed line shows simplified channel leakage, with no load-capacitor charging or discharging at steady state.') },
] as const

export function InverterCurrentFig() {
  const { t } = useLocale()
  const [id, setId] = useState<(typeof MODES)[number]['id']>('charge')
  const phase = MODES.find((item) => item.id === id) ?? MODES[0]
  const pColor = id !== 'discharge' ? 'var(--green)' : 'var(--muted)'
  const nColor = id === 'discharge' || id === 'short' ? 'var(--green)' : 'var(--muted)'
  const arrow = id === 'charge' ? 'M314 121 L320 128 L326 121'
    : id === 'discharge' ? 'M250 105 L242 110 L250 115' : 'M195 119 L202 127 L209 119'
  return (
    <figure className="term-fig">
      <Seg options={MODES} value={id} onChange={setId} />
      <svg viewBox="0 0 460 216" className="term-fig__svg" role="img" aria-label={t(phase.note)} data-current-path={id}>
        <rect width="460" height="216" fill="var(--well)" />
        <g stroke="var(--text-2)" strokeWidth="2" fill="none">
          <path d="M185 30 H219 M202 30 V40 M202 100 V120 M202 180 V191 M202 110 H320 V126 M320 135 V191 M306 126 H334 M306 135 H334 M98 70 H150 M98 70 V150 H150 M77 110 H98" />
          <Gnd x={202} y={191} /><Gnd x={320} y={191} />
        </g>
        <path d={PATH[id]} fill="none" stroke="var(--gold)" strokeWidth={id === 'leak' ? 2 : 4} strokeDasharray={id === 'leak' ? '3 6' : undefined} />
        <path d={arrow} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
        <MosSym x={180} y={70} kind="p" flip color={pColor} />
        <MosSym x={180} y={150} kind="n" color={nColor} />
        <circle cx="202" cy="110" r="4" fill="var(--text)" />
        <T x={202} y={22} size={17}>VDD</T>
        <T x={55} y={115} size={17}>Vin</T>
        <T x={265} y={99} size={17}>Vout</T>
        <T x={353} y={137} size={17}>Cᴸ</T>
      </svg>
      <figcaption aria-live="polite">{t(phase.note)}</figcaption>
    </figure>
  )
}
