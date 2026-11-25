import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Readout, Seg } from '../fund/parts'
import { SOURCE_OPTIONS } from './snsOpticalData'
import { type OpticalAnalysis, type OpticalState } from './snsOpticalModel'

const STAGES = [
  { id: 'illumination', label: loc('均匀照明', 'Uniform illumination') },
  { id: 'reference', label: loc('参考探测', 'Reference measurement') },
  { id: 'pixel', label: loc('像素校正', 'Pixel correction') },
] as const

const BEAMS = {
  broadband: ['#f3c775'],
  rgb: ['#ed7770', '#41c98f', '#609cf1'],
  ir: ['#da81b9'],
}

const VARIATION = [-1, -0.35, 0.4, 1]

export function SnsOpticalPath({ state, analysis }: { state: OpticalState; analysis: OpticalAnalysis }) {
  const { t } = useLocale()
  const [stage, setStage] = useState<(typeof STAGES)[number]['id']>('illumination')
  const source = SOURCE_OPTIONS.find((option) => option.id === state.source)!
  const colors = BEAMS[state.source]
  const opticalVariation = stage === 'illumination' ? state.nonuniformPct : 0
  const pixelVariation = stage === 'pixel' ? state.prnuPct : 0
  return (
    <figure className="term-fig">
      <Seg options={STAGES} value={stage} onChange={setStage} />
      <svg className="term-fig__svg" viewBox="0 0 444 232" role="img"
        aria-label={t(loc('光源经匀光后分别照向参考探测器和样品像素', 'A homogenized source illuminates the reference detector and sample pixels'))}>
        <rect width="444" height="232" rx="10" fill="var(--well)" />
        <rect x="14" y="112" width="103" height="59" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x="150" y="112" width="84" height="59" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x="294" y="36" width="131" height="48" rx="8" fill="var(--fig-box)" stroke={stage === 'reference' ? 'var(--blue)' : 'var(--line-2)'} />
        <rect x="294" y="112" width="131" height="100" rx="8" fill="var(--fig-box)" stroke={stage === 'pixel' ? 'var(--blue)' : 'var(--line-2)'} />
        <g data-optical-stage={stage} data-optical-source={state.source} fill="none">
          {colors.map((color, index) => {
            const y = 141 + (index - (colors.length - 1) / 2) * 5
            return <path key={color} d={`M117 ${y} H150 M234 ${y} H294`} stroke={color} strokeWidth={stage === 'illumination' ? 4 : 2} />
          })}
          <path d="M264 141 V60 H294" stroke="var(--blue)" strokeWidth={stage === 'reference' ? 4 : 2} />
          <path d="M359 84 V111" stroke="var(--blue)" strokeDasharray="4 4" strokeWidth={stage === 'pixel' ? 3 : 1} />
          <path d="M285 54 L294 60 L285 66 M285 135 L294 141 L285 147 M353 102 L359 111 L365 102"
            stroke="var(--blue)" strokeWidth="2" />
        </g>
        <g fill="var(--text)" fontSize="15" textAnchor="middle">
          <text x="65" y="145">{t(source.label)}</text>
          <text x="192" y="145">{t(loc('匀光器', 'Homogenizer'))}</text>
          <text x="359" y="66">{t(loc('参考探测器', 'Reference detector'))}</text>
          <text x="359" y="145">{t(loc('样品像素', 'Sample pixels'))}</text>
          <text x="359" y="201" fontSize="13">{stage === 'pixel' ? t(loc('校正后检查残差', 'Inspect corrected residual')) : t(loc('像素响应示意', 'Illustrative pixel response'))}</text>
        </g>
        {VARIATION.map((factor, index) => (
          <rect key={factor} data-optical-pixel={index} x={309 + 27 * index} y="155" width="19" height="25" rx="3"
            fill={state.source === 'rgb' ? 'var(--text)' : colors[0]} fillOpacity={0.65 + factor * (opticalVariation + pixelVariation) / 10} />
        ))}
      </svg>
      <figcaption>{t({
        illumination: loc('匀光器把选中的宽谱、RGB 或红外光送到样品。调节非均匀度，像素条的亮度差会随之放大，图中对比度为示意。',
          'The homogenizer feeds the sample with the selected broadband, RGB, or infrared source. Change source non-uniformity to vary the illustrative pixel contrast.'),
        reference: loc('参考探测器走分光支路，按波段测入射光。器件响应除以相应的入射光读数，可消除光源整体强弱的影响。',
          'The reference branch measures incident light by band. Divide device response by that incident-light reading to normalize for source intensity.'),
        pixel: loc('参考读数校正整体光强，逐像素平场校正还需要空间校准。这里用理想平场校正后的像素差示意本征 PRNU，可单独调整本征 PRNU。',
          'Reference data normalize overall intensity. Pixel flat-field correction also needs a spatial calibration. The residual shown after ideal flat-field correction illustrates intrinsic PRNU, which you can adjust separately.'),
      }[stage])}</figcaption>
      <Readout items={[
        { label: loc('测得 PRNU（两种独立、小幅空间变化）', 'Measured PRNU (small, independent spatial variations)'),
          value: `√(${state.prnuPct.toFixed(1)}² + ${state.nonuniformPct.toFixed(1)}²) ≈ ${analysis.measuredPct.toFixed(3)} %` },
        { label: loc('每帧字节数（假设紧凑打包）', 'Bytes per frame (packed samples)'),
          value: `${state.megapixels} × 10⁶ px × ${state.bits} bit/px ÷ 8 bit/B = ${analysis.bytesPerFrame.toLocaleString('en-US')} B` },
        { label: loc('传输时间（忽略协议开销）', 'Transfer time (excluding protocol overhead)'),
          value: `${analysis.mbPerFrame.toFixed(2)} × 10⁶ B × ${state.frames} × 8 bit/B ÷ (${state.gbps} × 10⁹ bit/s) = ${analysis.transferS.toPrecision(3)} s` },
      ]} />
    </figure>
  )
}
