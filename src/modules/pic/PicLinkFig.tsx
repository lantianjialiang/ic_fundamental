import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Readout, Seg } from '../fund/parts'
import { fmtBer } from './picLinkData'
import { type LinkAnalysis, type LinkState } from './picLinkModel'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const SIGNAL_POINTS = [
  { id: 'tx', label: loc('发射光眼', 'Transmitted eye') },
  { id: 'rx', label: loc('接收光眼', 'Received eye') },
  { id: 'pd', label: loc('光电流与噪声', 'Photocurrent and noise') },
] as const

export function PicLinkFig({ state, analysis }: { state: LinkState; analysis: LinkAnalysis }) {
  const { t } = useLocale()
  const [view, setView] = useState<(typeof SIGNAL_POINTS)[number]['id']>('tx')
  const { erLin, pHighMw, pLowMw, pAvgMw, pRxMw, sigmaEffA, q, ber } = analysis
  const attenuation = 10 ** (-state.lossDb / 10)
  const pd = view === 'pd'
  const scale = view === 'tx' ? 1 : attenuation * (pd ? state.rAw * 1e3 : 1)
  const high = pHighMw * scale
  const low = pLowMw * scale
  const middle = pAvgMw * scale
  const sigma = pd ? sigmaEffA * 1e6 : 0
  const max = high * 1.12 + sigma
  const min = Math.min(0, low - sigma)
  const y = (value: number) => 174 - 137 * (value - min) / (max - min)
  const yHigh = y(high)
  const yLow = y(low)
  const yMid = y(middle)
  const unit = pd ? 'µA' : 'mW'
  const levelFormat = (value: number) => pd ? value.toFixed(1) : value.toFixed(3)

  return (
    <figure className="pic-fig">
      <Seg options={SIGNAL_POINTS} value={view} onChange={setView} />
      <svg viewBox="0 0 442 216" role="img" aria-label={t(SIGNAL_POINTS.find((point) => point.id === view)!.label)} className="pic-svg">
        <rect width="442" height="216" rx="10" fill={BG} />
        <path d="M43 26 V174 H294" stroke={EDGE} fill="none" />
        <path d={`M294 ${yHigh} L313 65 M294 ${yLow} L313 153`} stroke={MUTED} strokeDasharray="3 4" />
        <path d={`M43 ${yMid} H294 L313 109`} stroke="#63c8ad" strokeDasharray="4 4" />
        <path d="M168 25 V174" stroke={GOLD} strokeDasharray="4 4" />
        {pd && [high, low].map((level) => (
          <rect data-eye-noise="" key={level} x="76" width="190" y={y(level + sigma)} height={y(level - sigma) - y(level + sigma)}
            fill={BLUE} fillOpacity=".24" />
        ))}
        <g stroke={BLUE} fill="none" strokeWidth="2.3" data-link-eye={view}>
          <path d={`M43 ${yHigh} H294 M43 ${yLow} H294`} />
          <path d={`M43 ${yMid} C66 ${yHigh},73 ${yHigh},107 ${yHigh} H229 C263 ${yHigh},270 ${yHigh},294 ${yMid}
            M43 ${yMid} C66 ${yLow},73 ${yLow},107 ${yLow} H229 C263 ${yLow},270 ${yLow},294 ${yMid}`} />
        </g>
        <path d={`M175 ${yHigh} H184 V${yLow} H175`} stroke={GOLD} strokeWidth="2" fill="none" />
        <text x="191" y={yMid - 7} fill={GOLD} fontSize="14">{pd ? 'ΔI' : 'OMA'}</text>
        <g fill={TEXT} fontSize="14">
          <text x="317" y="69">{pd ? 'I₁' : 'P₁'} = {levelFormat(high)} {unit}</text>
          <text x="317" y="113" fill="#63c8ad">{pd ? 'Iavg' : 'Pavg'} = {levelFormat(middle)} {unit}</text>
          <text x="317" y="157">{pd ? 'I₀' : 'P₀'} = {levelFormat(low)} {unit}</text>
          <text x="168" y="197" textAnchor="middle">{t(loc('同一采样时刻', 'Same sampling instant'))}</text>
        </g>
      </svg>
      <figcaption className="pic-summary">{t(loc('光眼为电平示意。切换观察位置可跟踪同一采样时刻；电流视图的蓝色带表示各电平的 ±1σ。',
        'The eye shows signal levels. Switch measurement points to follow the same sampling instant. In the current view, the blue bands span ±1σ at each level.'))}</figcaption>
      <div data-link-view={view}>
        <Readout items={[
          { label: loc('光眼的高低功率差', 'High-low optical power difference'),
            value: `OMA = P₁ − P₀ ≈ ${pHighMw.toFixed(3)} − ${pLowMw.toFixed(3)} = ${state.txOmaMw.toFixed(3)} mW` },
          { label: loc('等概率平均值与消光比', 'Equal-probability average and extinction ratio'),
            value: `Pavg = (P₁ + P₀) / 2 ≈ ${pAvgMw.toFixed(3)} mW · ER = P₁ / P₀ ≈ ${erLin.toFixed(2)}× = ${state.erDb} dB` },
          { label: loc('经过链路损耗的接收 OMA', 'Received OMA after link loss'),
            value: `${state.txOmaMw.toFixed(3)} × 10^(−${state.lossDb} / 10) ≈ ${pRxMw.toFixed(3)} mW` },
          { label: loc('探测器电流差与等噪声 Q', 'Photodetector current gap and equal-noise Q'),
            value: `ΔI = R × OMAᵣₓ ≈ ${(state.rAw * pRxMw * 1e3).toFixed(1)} µA · Q = ΔI / (2σ) ≈ ${q.toFixed(2)}` },
          { label: loc('用高斯尾概率函数把 Q 转为 BER', 'Convert Q to BER with the Gaussian tail function'),
            value: `σ ≈ ${(sigmaEffA * 1e6).toFixed(1)} µA · BER = Qfunc(${q.toFixed(2)}) ≈ ${fmtBer(ber)}` },
        ]} />
      </div>
    </figure>
  )
}

/** BER 对接收 OMA。横轴按对数均匀（曲线点本身是对数取样）。 */
export function BerOmaPlot({
  omaMw,
  ber,
  cursor,
  onCursor,
  aria,
  summary,
  xLabel,
  yLabel,
  markLabel,
  operating,
}: {
  omaMw: number[]
  ber: number[]
  cursor: number
  onCursor: (index: number) => void
  aria: string
  summary: string
  xLabel: string
  yLabel: string
  markLabel: string
  operating: { omaMw: number; ber: number }
}) {
  const W = 440
  const H = 220
  const L = 46
  const R = 14
  const T = 28
  const B = 32
  const n = omaMw.length
  const i = Math.min(Math.max(0, cursor), Math.max(0, n - 1))
  const yOf = (value: number) => {
    const log = Math.max(-16, Math.min(0, Math.log10(Math.max(value, 1e-18))))
    return T + ((0 - log) / 16) * (H - T - B)
  }
  const xOf = (index: number) => L + (n <= 1 ? 0 : (index / (n - 1)) * (W - L - R))
  const operatingIndex = (n - 1) * Math.log(operating.omaMw / omaMw[0]) / Math.log(omaMw[n - 1] / omaMw[0])
  const d = ber.map((value, index) => `${index === 0 ? 'M' : 'L'} ${xOf(index).toFixed(1)} ${yOf(value).toFixed(1)}`).join(' ')
  const yMark = yOf(1e-12)

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <text x={8} y={16} fill={TEXT} fontSize={11}>
          {yLabel}
        </text>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        {[0, -4, -8, -12, -16].map((tick) => {
          const y = yOf(10 ** tick)
          return (
            <g key={tick}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke={EDGE} />
              <text x={L - 4} y={y + 3} fill={MUTED} fontSize={10} textAnchor="end">
                {String(tick)}
              </text>
            </g>
          )
        })}
        <line x1={L} x2={W - R} y1={yMark} y2={yMark} stroke={MUTED} strokeDasharray="4 3" />
        <text x={L + 6} y={yMark - 4} fill={MUTED} fontSize={10}>
          {markLabel}
        </text>
        <path d={d} fill="none" stroke={BLUE} strokeWidth={1.8} />
        <line x1={xOf(i)} x2={xOf(i)} y1={T} y2={H - B} stroke={GOLD} strokeDasharray="3 3" />
        <circle data-link-operating={operating.omaMw} cx={xOf(Math.min(n - 1, Math.max(0, operatingIndex)))}
          cy={yOf(operating.ber)} r="5" fill="#63c8ad" stroke={BG} strokeWidth="1.5" />
        <text x={(L + W - R) / 2} y={H - 8} fill={MUTED} fontSize={11} textAnchor="middle">
          {`${xLabel}  ${omaMw[0]?.toFixed(2)} – ${omaMw[n - 1]?.toFixed(2)}`}
        </text>
      </svg>
      <input
        type="range"
        min={0}
        max={Math.max(0, n - 1)}
        step={1}
        value={i}
        aria-label={aria}
        onChange={(event) => onCursor(Number(event.target.value))}
      />
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}
