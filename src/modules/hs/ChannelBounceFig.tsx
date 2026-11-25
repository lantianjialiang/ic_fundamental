import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Readout } from '../fund/parts'
import { TD_PS, Z0, ZS, type ChannelAnalysis } from './channelModel'

const LEFT = 74
const RIGHT = 360
const TIME_Y = 57
const ROW = 44
const TIME_LABEL = loc('从发送沿出发起算', 'Time after launching the edge')

export function ChannelBounceFig({ analysis, load }: { analysis: ChannelAnalysis; load: number }) {
  const { t } = useLocale()
  const [time, setTime] = useState(0)
  const { gammaL, gammaS, ui, lossDb } = analysis
  const incident = [1, gammaL, gammaL * gammaS]
  const elapsed = time / TD_PS
  return (
    <figure className="term-fig">
      <Knob label={TIME_LABEL} value={time} unit="ps" min={0} max={3 * TD_PS} step={10} onChange={setTime} />
      <svg className="term-fig__svg" viewBox="0 0 432 216" role="img"
        aria-label={t(loc('发送端与接收端之间的反射时空图', 'Space-time diagram of channel reflections'))}>
        <rect width="432" height="216" rx="10" fill="var(--well)" />
        <g fill="var(--text)" fontSize="15" textAnchor="middle">
          <text x={LEFT} y="21">{t(loc('发送端', 'Transmitter'))}</text>
          <text x={RIGHT} y="21">{t(loc('终端', 'Termination'))}</text>
          <text x={LEFT} y="42">Zₛ = {ZS} Ω</text>
          <text x={RIGHT} y="42">Zₗ = {load} Ω</text>
          <text x="216" y="28">Z₀ = {Z0} Ω</text>
        </g>
        <path d={`M${LEFT} ${TIME_Y} V196 M${RIGHT} ${TIME_Y} V196`} stroke="var(--muted)" />
        {[0, 1, 2, 3].map((step) => {
          const y = TIME_Y + step * ROW
          return <g key={step}>
            <path d={`M${LEFT} ${y} H${RIGHT}`} stroke="var(--line-2)" strokeDasharray="3 5" />
            <text x={LEFT - 7} y={y + 5} textAnchor="end" fill="var(--text)" fontSize="13">{step * TD_PS} ps</text>
          </g>
        })}
        {incident.map((amplitude, step) => {
          if (amplitude === 0 || elapsed < step) return null
          const progress = Math.min(1, elapsed - step)
          const start = step === 1 ? RIGHT : LEFT
          const end = step === 1 ? LEFT : RIGHT
          const x = start + (end - start) * progress
          const baseY = TIME_Y + step * ROW
          const y = baseY + progress * ROW
          const color = amplitude > 0 ? 'var(--blue)' : 'var(--red)'
          return <g key={step} data-bounce-leg={step} data-amplitude={amplitude}>
            <path d={`M${start} ${baseY} L${x} ${y}`} stroke={color} strokeWidth="3" />
            <circle cx={x} cy={y} r="4.5" fill={color} />
          </g>
        })}
      </svg>
      <Readout items={[
        { label: loc('终端反射系数 Γₗ', 'Load reflection coefficient Γₗ'), value: `(${load} − ${Z0}) / (${load} + ${Z0}) ≈ ${gammaL.toFixed(3)}` },
        { label: loc('发送端反射系数 Γₛ', 'Source reflection coefficient Γₛ'), value: `(${ZS} − ${Z0}) / (${ZS} + ${Z0}) ≈ ${gammaS.toFixed(3)}` },
        { label: loc('第一次远端到达的电压增量', 'Voltage increment at the first load arrival'), value: `1 + Γₗ ≈ ${(1 + gammaL).toFixed(3)}` },
        { label: loc('回声比第一次到达晚', 'Echo lag behind the first arrival'), value: gammaL === 0 ? t(loc('匹配，无回声', 'Matched, no echo')) : `2 × ${TD_PS} ps = ${2 * TD_PS} ps ≈ ${(2 * TD_PS / ui).toFixed(2)} UI` },
        { label: loc('奈奎斯特频率处的带宽损耗', 'Bandwidth loss at Nyquist'), value: `${lossDb.toFixed(2)} dB` },
      ]} />
      <figcaption>
        {t(loc('拖动时间看发送沿如何抵达终端、反射回发送端，再返回终端。蓝色表示同极性，红色表示反极性。把负载调回 50 Ω，回程消失。如果上方波形还有边沿变缓，可单独调带宽观察低通损耗。',
          'Drag through time to follow the edge to the load, back to the source, and back to the load again. Blue keeps the original polarity and red reverses it. Set the load back to 50 Ω to remove the echoes. If the waveform above still has slow edges, adjust bandwidth separately to observe low-pass loss.'))}
      </figcaption>
    </figure>
  )
}
