import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Seg } from '../fund/parts'
import { type SparamAnalysis } from './rfSparamModel'

const LOADS = [
  { id: 'current', label: loc('当前负载', 'Current load') },
  { id: 'open', label: loc('开路', 'Open') },
  { id: 'short', label: loc('短路', 'Short') },
] as const

export function ReflectionPacket({ gamma }: { gamma: SparamAnalysis['gamma'] }) {
  const { t } = useLocale()
  const [mode, setMode] = useState<(typeof LOADS)[number]['id']>('current')
  const [flight, setFlight] = useState(50)
  const reflected = flight > 50
  const re = mode === 'open' ? 1 : mode === 'short' ? -1 : gamma.re
  const im = mode === 'current' ? gamma.im : 0
  const amp = reflected ? Math.hypot(re, im) : 1
  const phase = reflected ? Math.atan2(im, re) : 0
  const center = 67 + 347 * (reflected ? 2 - flight / 50 : flight / 50)
  const wave = Array.from({ length: 184 }, (_, i) => {
    const x = 50 + i * 2
    const z = (x - center) / 36
    const y = 110 - 54 * amp * Math.exp(-(z * z)) * Math.cos((reflected ? -1 : 1) * z * 5 + phase)
    return `${i === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <figure className="term-fig">
      <Seg options={LOADS} value={mode} onChange={setMode} />
      <div className="knob-row"><Knob label={loc('脉冲行程', 'Pulse travel')} value={flight}
        min={0} max={100} step={1} unit="%" onChange={setFlight} /></div>
      <svg viewBox="0 0 475 184" className="term-fig__svg" role="img" data-wave-phase={reflected ? 'reflected' : 'incident'} data-reflection-load={mode}
        aria-label={t(loc('同一个脉冲沿传输线入射和反射', 'One pulse traveling into and back from the load'))}>
        <rect width="475" height="184" fill="var(--well)" />
        <path d="M50 110 H416 M416 38 V151" stroke="var(--muted)" strokeDasharray="3 3" fill="none" />
        <path d={wave} fill="none" stroke={reflected ? 'var(--gold)' : 'var(--blue-strong)'} strokeWidth="3" />
        <text x="49" y="36" fill="var(--text)" fontSize="16">{t(reflected ? loc('反射 ←', 'Reflected ←') : loc('入射 →', 'Incident →'))}</text>
        <text x="420" y="169" textAnchor="end" fill="var(--text)" fontSize="15">{t(loc('负载', 'Load'))}</text>
        <text x="49" y="169" fill="var(--text)" fontSize="15">{t(loc('信号源', 'Source'))}</text>
      </svg>
      <figcaption aria-live="polite">
        {t(loc(`此负载 Γ = ${re.toFixed(2)} ${im < 0 ? '−' : '+'} j${Math.abs(im).toFixed(2)}。开路正向反射，短路反相，匹配时反射幅度为零。图用窄带波包示意。`, `For this load, Γ = ${re.toFixed(2)} ${im < 0 ? '−' : '+'} j${Math.abs(im).toFixed(2)}. An open reflects in phase, a short inverts the pulse, and a match gives zero reflection. The figure uses a narrowband packet.`))}
      </figcaption>
    </figure>
  )
}
