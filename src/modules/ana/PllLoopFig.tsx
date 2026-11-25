import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Seg } from '../fund/parts'
import { MEASURE_WINDOW_US, lockCurve, type PllResult, type PllState } from './pllModel'

const PARTS = [
  { id: 'pfd', label: loc('鉴相器', 'Phase detector'), x: 112, short: 'PFD' },
  { id: 'filter', label: loc('环路滤波器', 'Loop filter'), x: 244, short: 'LPF' },
  { id: 'vco', label: loc('振荡器', 'Oscillator'), x: 376, short: 'VCO' },
  { id: 'divider', label: loc('反馈分频器', 'Feedback divider'), x: 244, short: '÷N' },
] as const

export function PllLoopFig({ state, result, time, onTime }: {
  state: PllState; result: PllResult; time: number; onTime: (time: number) => void
}) {
  const { t } = useLocale()
  const [mode, setMode] = useState<(typeof PARTS)[number]['id']>('pfd')
  const error = result.stable ? lockCurve(state.bwKhz).reduce((nearest, point) =>
    Math.abs(point.t - time) < Math.abs(nearest.t - time) ? point : nearest).ppm : undefined
  const feedback = state.fOutMhz / result.divider
  const details = {
    pfd: loc('PFD 比较参考边沿和分频后的反馈边沿，输出相位先后信息。下方曲线是闭环输出的频率误差。', 'The PFD compares reference and divided-feedback edges. The graph below shows closed-loop output frequency error.'),
    filter: loc(`滤波后的控制量送给 VCO。带宽 ${state.bwKhz} kHz，对应模型时间常数 ${result.tauUs.toFixed(2)} µs。`, `The filtered correction drives the VCO. A bandwidth of ${state.bwKhz} kHz gives a modeled time constant of ${result.tauUs.toFixed(2)} µs.`),
    vco: loc(`控制量调整 VCO 频率，目标输出 ${state.fOutMhz} MHz。游标对照振荡器的剩余频率误差。`, `The control signal changes the VCO frequency toward ${state.fOutMhz} MHz. Use the cursor to inspect the remaining frequency error.`),
    divider: loc(`把名义输出 ${state.fOutMhz} MHz 除以 ${result.divider}，反馈约为 ${feedback.toFixed(3)} MHz，与参考比较。`, `Divide nominal ${state.fOutMhz} MHz by ${result.divider} to feed about ${feedback.toFixed(3)} MHz back for comparison.`),
  }
  const color = (id: string) => id === mode ? 'var(--gold)' : 'var(--blue-strong)'
  return (
    <figure className="term-fig">
      <Seg options={PARTS} value={mode} onChange={setMode} />
      <svg viewBox="0 0 505 169" className="term-fig__svg" role="img" aria-label={t(details[mode])} data-pll-block={mode}>
        <rect width="505" height="169" fill="var(--well)" />
        <g strokeWidth="2.5" fill="none">
          <path d="M20 54 H65 m-7 -5 l7 5 l-7 5" stroke={color('pfd')} />
          <path d="M159 54 H197 m-7 -5 l7 5 l-7 5" stroke={color('filter')} />
          <path d="M291 54 H329 m-7 -5 l7 5 l-7 5 M423 54 H485 m-7 -5 l7 5 l-7 5" stroke={color('vco')} />
          <path d="M450 54 V118 H291 m7 -5 l-7 5 l7 5 M197 118 H112 V75 m-5 7 l5 -7 l5 7"
            stroke={color('divider')} />
        </g>
        {PARTS.map(({ id, x, short }) => {
          const y = id === 'divider' ? 118 : 54
          return <g key={id}>
            <rect x={x - 47} y={y - 21} width="94" height="42" rx="5" fill={id === mode ? 'var(--gold-bg)' : 'var(--panel)'} stroke={color(id)} />
            <text x={x} y={y + 6} textAnchor="middle" fill="var(--text)" fontSize="17">{short}</text>
          </g>
        })}
        <text x="16" y="24" fill="var(--text)" fontSize="15">{state.fRefMhz} MHz</text>
        <text x="484" y="24" fill="var(--text)" textAnchor="end" fontSize="15">{state.fOutMhz} MHz</text>
        <text x="244" y="155" fill="var(--text)" textAnchor="middle" fontSize="15">{`N = ${result.divider}`}</text>
      </svg>
      <div className="knob-row">
        <Knob label={loc('锁定曲线游标', 'Lock-curve cursor')} value={time} min={0} max={MEASURE_WINDOW_US} step={1} unit="µs" onChange={onTime} />
      </div>
      <figcaption aria-live="polite">{t(details[mode])}{' '}
        {error !== undefined && t(loc(`${time} µs 时剩余误差约 ${error.toFixed(1)} ppm。`, `At ${time} µs the remaining error is about ${error.toFixed(1)} ppm.`))}
      </figcaption>
    </figure>
  )
}
