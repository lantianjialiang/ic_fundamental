import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { Knob, Seg } from '../fund/parts'
import { amplitudeSpectrum, windowCoefficients, type WindowKind } from './core/fft'

const N = 64
const FS_KHZ = 64
const F_IN = 5.5
const RECORD = Float64Array.from({ length: N }, (_, n) =>
  .8 * Math.sin(2 * Math.PI * F_IN * n / FS_KHZ) + .03 * Math.sin(2 * Math.PI * 23 * n / FS_KHZ))
const PHASES = [
  { id: 'samples', label: loc('采样点', 'Samples') },
  { id: 'window', label: loc('时域乘窗', 'Windowed record') },
  { id: 'fft', label: loc('频点与邻点', 'FFT and nearby bins') },
  { id: 'power', label: loc('带内功率', 'Band power') },
] as const
const WINDOWS = [
  { id: 'rect', label: loc('矩形窗', 'Rectangular') },
  { id: 'hann', label: loc('Hann 窗', 'Hann') },
] as const
type Phase = (typeof PHASES)[number]['id']
const x = (sample: number, extent: number) => 44 + 404 * sample / extent

export function SpectralRecordFig({ initial }: { initial: Phase }) {
  const { t } = useLocale()
  const [phase, setPhase] = useState<Phase>(initial)
  const [window, setWindow] = useState<Extract<WindowKind, 'rect' | 'hann'>>('hann')
  const [sample, setSample] = useState(11)
  const [bin, setBin] = useState(6)
  const [guard, setGuard] = useState(2)
  const hist = useMemo(() => amplitudeSpectrum(RECORD, window), [window])
  const coeffs = useMemo(() => windowCoefficients(window, N), [window])
  const gain = coeffs.reduce((sum, w) => sum + w, 0)
  const enbw = N * coeffs.reduce((sum, w) => sum + w * w, 0) / (gain ** 2)
  const fft = phase === 'fft' || phase === 'power'
  const weighted = phase === 'window'
  const masked = (index: number) => index === 0 || Math.abs(index - F_IN) <= guard
  const noise = hist.reduce((sum, amp, index) => sum + (masked(index) ? 0 : amp ** 2 / (2 * enbw)), 0)
  const amplitudeY = (v: number) => 91 - 58 * v
  const sampleY = (n: number) => amplitudeY(RECORD[n] * (weighted ? coeffs[n] : 1))
  const binY = (v: number) => 146 - Math.max(0, (70 + 20 * Math.log10(Math.max(1e-12, v))) * 1.6)
  const focus = fft ? bin : sample
  return (
    <Section title={t(loc('同一份记录，从采样到频谱', 'One record from sampling to spectrum'))}>
    <figure className="term-fig spectral-record">
      <Seg options={PHASES} value={phase} onChange={setPhase} />
      {phase !== 'samples' && <Seg options={WINDOWS} value={window} onChange={setWindow} />}
      <div className="knob-row">
        {fft
          ? <Knob label={loc('查看频点 k', 'Inspect bin k')} value={bin} unit="" min={1} max={hist.length - 1} step={1} onChange={setBin} />
          : <Knob label={loc('查看采样点 n', 'Inspect sample n')} value={sample} unit="" min={0} max={N - 1} step={1} onChange={setSample} />}
        {phase === 'power' && <Knob label={loc('主频保护半宽', 'Fundamental guard half-width')} value={guard} unit="bin" min={1} max={5} step={1} onChange={setGuard} />}
      </div>
      <svg className="term-fig__svg" viewBox="0 0 481 180" role="img" data-record-phase={phase} data-record-window={window}
        aria-label={t(loc('同一个 64 点采样记录的时频对照', 'Time and frequency views of one 64-sample record'))}>
        <rect width="481" height="180" fill="var(--well)" />
        <path d="M44 24 V146 H450" stroke="var(--muted)" strokeWidth="1.5" fill="none" />
        {fft ? Array.from(hist, (amp, i) => (
          <path key={i} data-bin={i} data-included={!masked(i)} d={`M${x(i, hist.length - 1)} 146 V${binY(amp)}`}
            stroke={i === bin ? 'var(--gold)' : phase === 'power' && masked(i) ? 'var(--muted)' : 'var(--blue-strong)'} strokeWidth={i === bin ? 4 : 3} />
        )) : <>
          {weighted && <path d={Array.from(coeffs, (value, i) => `${i ? 'L' : 'M'}${x(i, N - 1)} ${amplitudeY(value)}`).join(' ')}
            fill="none" stroke="var(--purple)" strokeDasharray="4 3" />}
          <path d={Array.from(RECORD, (_, i) => `${i ? 'L' : 'M'}${x(i, N - 1)} ${sampleY(i)}`).join(' ')} fill="none" stroke="var(--blue-strong)" strokeWidth="1.6" />
          {Array.from(RECORD, (_, i) => <circle key={i} cx={x(i, N - 1)} cy={sampleY(i)} r={i === focus ? 5 : 2}
            fill={i === focus ? 'var(--gold)' : 'var(--blue-strong)'} />)}
        </>}
        <text x="448" y="168" textAnchor="end" fontSize="15" fill="var(--text)">{fft ? 'k · Δf = 1 kHz' : 'n · Δt = 15.625 µs'}</text>
        <text x="43" y="18" fontSize="14" fill="var(--text)">{fft ? 'dB re 1 Vpeak' : 'V'}</text>
      </svg>
      <figcaption aria-live="polite">
        {t(loc('同一示例记录含 5.5 kHz 主信号与 23 kHz 小杂散，采样率 64 kS/s。', 'This shared record contains a 5.5 kHz tone and a small 23 kHz spur, sampled at 64 kS/s.'))}{' '}
        {t(phase === 'samples' ? loc(`n=${sample}，t=${(sample / FS_KHZ * 1000).toFixed(3)} µs，x[n]=${RECORD[sample].toFixed(3)} V。`, `n=${sample}, t=${(sample / FS_KHZ * 1000).toFixed(3)} µs, x[n]=${RECORD[sample].toFixed(3)} V.`)
          : phase === 'window' ? loc(`x[${sample}] × w[${sample}] = ${RECORD[sample].toFixed(3)} × ${coeffs[sample].toFixed(3)} ≈ ${(RECORD[sample] * coeffs[sample]).toFixed(3)} V。紫线标窗系数。`, `x[${sample}] × w[${sample}] = ${RECORD[sample].toFixed(3)} × ${coeffs[sample].toFixed(3)} ≈ ${(RECORD[sample] * coeffs[sample]).toFixed(3)} V. Purple traces the window coefficients.`)
            : phase === 'fft' ? loc(`k=${bin} 对应 ${bin} kHz，幅值约 ${hist[bin].toFixed(4)} Vpeak。5.5 kHz 位于两档之间，会分摊到相邻频点。`, `Bin ${bin} is ${bin} kHz, at about ${hist[bin].toFixed(4)} Vpeak. The 5.5 kHz tone falls between bins and spreads into its neighbors.`)
              : loc(`剔除直流和主频 ±${guard} 档后，把其余幅值平方求和，再除以 2×ENBW（ENBW=${enbw.toFixed(2)} 档），得到约 ${noise.toExponential(3)} V²。本记录包含杂散和剩余泄漏。`, `Exclude DC and bins within ±${guard} of the tone, sum the squared amplitudes, then divide by 2×ENBW (ENBW=${enbw.toFixed(2)} bins). The remaining power is about ${noise.toExponential(3)} V² and includes the spur and residual leakage.`))}
      </figcaption>
    </figure>
    </Section>
  )
}
