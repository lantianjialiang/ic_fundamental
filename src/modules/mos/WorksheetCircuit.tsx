import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { Gnd, MosSym, T } from './SwitchFigs'
import { SUPPLY, VDRIVE, type DiodeId, type LoadId, type TopologyId } from './data/mosSelectParts'

const COMMANDS = [
  { id: 'on', label: loc('请求导通', 'Command on') },
  { id: 'off', label: loc('请求关断', 'Command off') },
] as const

export function WorksheetCircuit({ topology, load, diode }: { topology: TopologyId; load: LoadId; diode: DiodeId }) {
  const { t } = useLocale()
  const [command, setCommand] = useState<(typeof COMMANDS)[number]['id']>('on')
  const low = topology === 'low'
  const pmos = topology === 'highP'
  const coil = load === 'ind'
  const protectedLoad = coil && diode === 'with'
  const flyback = protectedLoad && command === 'off' && low
  const showSpike = coil && !protectedLoad && command === 'off' && low
  const my = low ? 150 : 66
  const top = low ? 40 : 103
  const bottom = low ? 112 : 177
  const center = (top + bottom) / 2
  const part = coil ? 'q15 7 0 14 q15 7 0 14 q15 7 0 14' : 'l-8 5 16 8 -16 8 16 8 -16 8 8 5'
  const loadPath = `M226 ${top} V${center - 21} ${part} V${bottom}`
  const current = low && command === 'on'
  const note = !low
    ? pmos ? loc('PMOS 的源极固定在 12 V。3.3 V GPIO 的高电平仍比源极低，无法可靠关断。', 'The PMOS source stays at 12 V. A 3.3 V GPIO high remains below the source, so the switch cannot reliably turn off.')
      : loc('高边 NMOS 的源极接负载端。源极升高时，直驱 GPIO 留下的 VGS 减小，无法把负载端推到 12 V。', 'The high-side NMOS source is at the load. As it rises, direct GPIO drive leaves less VGS and cannot bring the load to 12 V.')
    : flyback ? loc('开关关断后，线圈电流仍向下流过负载，再沿二极管从下往上回到线圈。', 'With the switch off, coil current still flows downward through the load and returns upward through the diode.')
      : showSpike ? loc('开关关断时没有续流二极管。线圈迫使漏极电压升高，图中标出尖峰位置。', 'The switch turns off without a flyback diode. The coil drives up drain voltage at the marked node.')
        : current ? loc('低边 NMOS 的源极接地。导通后电流从母线经过负载和 NMOS 到地。', 'The low-side NMOS source is grounded. With it on, current flows from the bus through the load and MOSFET to ground.')
          : loc('开关关断，阻性负载的电流停止。', 'Switching off stops the current through the resistive load.')
  return (
    <figure className="term-fig">
      <Seg options={COMMANDS} value={command} onChange={setCommand} />
      <svg viewBox="0 0 450 220" className="term-fig__svg" role="img" aria-label={t(note)}
        data-topology={topology} data-load={load} data-flyback={flyback}>
        <rect width="450" height="220" fill="var(--well)" />
        <rect x="26" y={my - 17} width="108" height="34" rx="5" fill="var(--blue-bg)" stroke="var(--blue)" />
        <T x={80} y={my + 5} size={15}>{`GPIO ${VDRIVE} V`}</T>
        <path d={`M134 ${my} H174`} fill="none" stroke="var(--blue-strong)" strokeWidth="2.5" />
        <g fill="none" stroke={current ? 'var(--gold)' : 'var(--text-2)'} strokeWidth="2.5">
          <path d={low ? 'M226 27 V40 M226 112 V120 M226 180 V193' : 'M226 27 V36 M226 96 V103 M226 177 V193'} />
          <path d={loadPath} stroke={flyback ? 'var(--gold)' : undefined} />
        </g>
        <MosSym x={204} y={my} kind={pmos ? 'p' : 'n'} flip={pmos} color={current ? 'var(--gold)' : 'var(--text)'} />
        <Gnd x={226} y={193} />
        {protectedLoad && <g fill="none" stroke={flyback ? 'var(--gold)' : 'var(--green)'} strokeWidth="2.5" data-protection>
          <path d={`M226 ${top} H321 V${center - 9} M226 ${bottom} H321 V${center + 9} M310 ${center - 9} H332`} />
          <path d={`M312 ${center + 9} H330 L321 ${center - 9} Z`} />
        </g>}
        {flyback && <path d={`M338 ${center + 28} V${center + 9} m-4 6 l4 -6 l4 6`} fill="none" stroke="var(--gold)" strokeWidth="2" />}
        {showSpike && <path data-spike d="M239 118 H251 L257 99 L263 118 H278" fill="none" stroke="var(--red)" strokeWidth="3" />}
        <T x={226} y={21} size={16}>{`VDD = ${SUPPLY} V`}</T>
        <T x={250} y={center + 6} anchor="start" size={15}>{t(coil ? loc('线圈', 'Coil') : loc('电阻', 'Resistor'))}</T>
        {protectedLoad && <T x={345} y={center - 12} anchor="start" size={14}>{t(loc('续流二极管', 'Flyback diode'))}</T>}
      </svg>
      <figcaption aria-live="polite">{t(note)}</figcaption>
    </figure>
  )
}
