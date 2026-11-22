import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { PIC_TEACH, mziTransmission, ringAllPass, waveguidePhase } from './core/photonics'
import { type DeviceAnalysis, type DeviceState } from './picDeviceModel'

const TAU = 2 * Math.PI
const BG = '#142435'
const LIGHT = '#76e0b4'
const BLUE = '#79caf1'
const GOLD = '#ffdb80'
const TEXT = '#e5eef8'

function phaseGuide(state: DeviceState, lengthUm: number, lambdaNm: number) {
  return waveguidePhase({ lambdaNm, neff: state.neff, ng: state.ng, lengthUm })
}

function samplePhase(state: DeviceState, samples: number[], phase: number, target: number): number | undefined {
  const first = phaseGuide(state, state.dlUm, samples[0])
  const last = phaseGuide(state, state.dlUm, samples[samples.length - 1])
  const minOrder = Math.ceil((last - target) / TAU)
  const maxOrder = Math.floor((first - target) / TAU)
  if (minOrder > maxOrder) return undefined
  const order = Math.max(minOrder, Math.min(maxOrder, Math.round((phase - target) / TAU)))
  const targetPhase = TAU * order + target
  const inv = targetPhase / (TAU * state.dlUm * 1000) - (state.neff - state.ng) / PIC_TEACH.lambdaNm
  const wavelength = state.ng / inv
  return Math.round((wavelength - samples[0]) / (samples[1] - samples[0]))
}

function PhaseArrow({ x, y, radians, color }: { x: number; y: number; radians: number; color: string }) {
  return <g transform={`translate(${x},${y})`}>
    <circle r="20" fill={BG} stroke="#6c859c" />
    <path d="M-16 0 H16 M0 -16 V16" stroke="#6c859c" strokeWidth="1" />
    <path d="M0 0 H17 M12 -4 L17 0 L12 4" stroke={color} strokeWidth="3" fill="none" transform={`rotate(${-radians * 180 / Math.PI})`} />
  </g>
}

export function PicDevicePath({ state, analysis, cursor, onCursor }: {
  state: DeviceState; analysis: DeviceAnalysis; cursor: number; onCursor: (index: number) => void
}) {
  const { t } = useLocale()
  const lambdaNm = analysis.lambdaNm[cursor]
  const common = { neff: state.neff, ng: state.ng }
  const mzi = state.tab === 'mzi'
  const hotIndex = state.neff + PIC_TEACH.dneffDt * state.dT
  const phase = mzi ? phaseGuide(state, state.dlUm, lambdaNm)
    : waveguidePhase({ lambdaNm, neff: hotIndex, ng: state.ng, lengthUm: analysis.lengthUm })
  const delta = ((phase % TAU) + TAU) % TAU
  const angle = delta * 180 / Math.PI
  const transmission = mzi ? mziTransmission({ ...common, lambdaNm: [lambdaNm], dlUm: state.dlUm })[0]
    : ringAllPass({ ...common, lambdaNm: [lambdaNm], neff: hotIndex, lengthUm: analysis.lengthUm, a: state.a, r: state.r })[0]
  const radius = 31 + (state.radiusUm - 5) * 1.2
  const nearestRes = Math.round((analysis.resonanceNm - analysis.lambdaNm[0]) / (analysis.lambdaNm[1] - analysis.lambdaNm[0]))
  const ringMark = Math.max(0, Math.min(analysis.lambdaNm.length - 1, nearestRes))
  const wave = `${lambdaNm.toFixed(3)} nm`
  const transmissionText = `${(100 * transmission).toFixed(1)}%`
  const peak = mzi ? samplePhase(state, analysis.lambdaNm, phase, 0) : undefined
  const dip = mzi ? samplePhase(state, analysis.lambdaNm, phase, Math.PI) : undefined

  return (
    <figure className="pic-fig pic-route">
      <div className="seg">
        {mzi ? <>
          <button type="button" disabled={peak === undefined} onClick={() => { if (peak !== undefined) onCursor(peak) }}>{t(loc('定位相长的峰', 'Find a constructive peak'))}</button>
          <button type="button" disabled={dip === undefined} onClick={() => { if (dip !== undefined) onCursor(dip) }}>{t(loc('定位相消的谷', 'Find a destructive dip'))}</button>
        </> : <button type="button" onClick={() => onCursor(ringMark)}>{t(loc('定位最近谐振', 'Find resonance near center'))}</button>}
      </div>
      {mzi && (peak === undefined || dip === undefined) && <p className="pic-summary">{t(loc('当前扫波范围没有覆盖完整的峰谷。', 'This scan range does not contain both a peak and a dip.'))}</p>}
      <svg viewBox="0 0 520 196" className="pic-svg" role="img" aria-label={t(mzi ? loc('MZI 分光、两臂相位与合光', 'MZI split, arm phases and recombination') : loc('微环与直波导的耦合位置', 'Ring-to-bus coupling location'))} data-device-path={state.tab}>
        <rect width="520" height="196" rx="10" fill={BG} />
        {mzi ? <>
          <path d="M23 104 H95 Q117 104 128 82 T160 61 H290 Q315 61 331 82 T366 104" stroke={BLUE} strokeWidth="5" fill="none" />
          <path d="M95 104 Q117 104 126 126 T156 145 H294 Q318 145 334 124 T366 104" stroke={LIGHT} strokeWidth="5" fill="none" />
          <path d="M366 104 H479" stroke={LIGHT} strokeWidth="5" opacity={.15 + .85 * Math.sqrt(transmission)} />
          {[95, 366].map((x) => <circle key={x} cx={x} cy="104" r="6" fill={GOLD} />)}
          <PhaseArrow x={250} y={61} radians={0} color={BLUE} />
          <PhaseArrow x={250} y={145} radians={delta} color={LIGHT} />
          <text x="94" y="173" textAnchor="middle" fill={TEXT} fontSize="17">{t(loc('分光', 'Split'))}</text>
          <text x="365" y="173" textAnchor="middle" fill={TEXT} fontSize="17">{t(loc('合光', 'Combine'))}</text>
          <text x="250" y="27" textAnchor="middle" fill={TEXT} fontSize="17">{t(loc('上臂参考 0°', 'Upper arm 0° reference'))}</text>
          <text x="250" y="180" textAnchor="middle" fill={LIGHT} fontSize="17">{`Δφ = ${angle.toFixed(0)}°`}</text>
          <text x="477" y="82" textAnchor="end" fill={TEXT} fontSize="17">{`T = ${transmissionText}`}</text>
        </> : <>
          <path d="M24 151 H270" stroke={LIGHT} strokeWidth="6" fill="none" />
          <path d="M270 151 H493" stroke={LIGHT} strokeWidth="6" opacity={.15 + .85 * Math.sqrt(transmission)} />
          <circle cx="270" cy={137 - radius} r={radius} fill="#20394e" stroke={BLUE} strokeWidth="5" />
          <path d={`M${270 + radius - 10} ${137 - radius - 25} l10 7 l2 -12`} stroke={GOLD} fill="none" strokeWidth="3" />
          <rect x="242" y="136" width="56" height="22" rx="4" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="4 3" />
          <text x="113" y="181" fill={TEXT} textAnchor="middle" fontSize="17">{t(loc('直波导', 'Bus waveguide'))}</text>
          <text x="270" y="181" fill={GOLD} textAnchor="middle" fontSize="17">{t(loc('耦合区', 'Coupling gap'))}</text>
          <text x="270" y={142 - radius} fill={TEXT} textAnchor="middle" fontSize="17">{`R = ${state.radiusUm} µm`}</text>
          <text x="473" y="132" textAnchor="end" fill={TEXT} fontSize="17">{`T = ${transmissionText}`}</text>
        </>}
      </svg>
      <figcaption className="pic-summary" aria-live="polite">
        {t(mzi ? loc(`谱图游标 λ = ${wave}。相位绕回一圈后 Δφ = ${angle.toFixed(1)}°，T = cos²(Δφ/2) = ${transmissionText}。两臂同向时在这个输出端相长，反向时相消。`, `Spectrum cursor λ = ${wave}. The wrapped Δφ is ${angle.toFixed(1)}°, giving T = cos²(Δφ/2) = ${transmissionText}. At this port aligned fields add and opposite fields cancel.`)
          : loc(`谱图游标 λ = ${wave}，环绕一圈后剩余相位 ${angle.toFixed(1)}°。相位接近整圈时，直波导透射出现谷。a 与 r 越接近，谐振处的谷可越深。`, `Spectrum cursor λ = ${wave}, wrapped round-trip phase ${angle.toFixed(1)}°. A near-integer round trip produces a through-port dip. As a and r approach each other, that resonant dip can deepen.`))}
      </figcaption>
    </figure>
  )
}
