import { useMemo } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob } from '../fund/parts'
import { frameMean, frameVar } from './core/frames'
import { FrameView, PtcPlot } from './plots'
import { plotSummary, S } from './snsPtcData'
import { type ModeId, type PtcAnalysis, type PtcBuilt } from './snsPtcModel'

function frameComparison(f1: Float32Array, f2: Float32Array) {
  let lo = Infinity
  let hi = -Infinity
  let maxAbs = 1
  const diff = new Float32Array(f1.length)
  for (let i = 0; i < f1.length; i += 1) {
    lo = Math.min(lo, f1[i], f2[i])
    hi = Math.max(hi, f1[i], f2[i])
    diff[i] = f1[i] - f2[i]
    maxAbs = Math.max(maxAbs, Math.abs(diff[i]))
  }
  return { diff, frameScale: [lo, hi] as const, diffScale: [-maxAbs, maxAbs] as const }
}

export function SnsPtcPoint({ built, analysis, mode, index, onSelect }: {
  built: PtcBuilt
  analysis: PtcAnalysis
  mode: ModeId
  index: number
  onSelect: (index: number) => void
}) {
  const { t } = useLocale()
  const { roi, w } = analysis
  const { f1, f2, electrons } = built.pairs[index]
  const { diff, frameScale, diffScale } = useMemo(() => frameComparison(f1, f2), [f1, f2])
  const diffMode = mode === 'diff'
  const mean1 = frameMean(f1, w, roi)
  const mean2 = frameMean(f2, w, roi)
  const dark = frameMean(built.dark, w, roi)
  const mean = analysis.points[index].mean
  const variance = analysis.points[index].variance
  const fmt = (value: number) => value.toFixed(3)
  const meanMath = diffMode ? `(${fmt(mean1)} + ${fmt(mean2)}) / 2 − ${fmt(dark)}` : `${fmt(mean1)} − ${fmt(dark)}`
  const varianceMath = diffMode ? `${fmt(frameVar(diff, w, roi))} / 2` : fmt(frameVar(f1, w, roi))

  return (
    <div className="sns-ptc-point">
      <div className="knobs">
        <Knob label={loc('查看第几个曝光点', 'Inspect exposure point')} value={index + 1} min={1} max={built.pairs.length}
          step={1} unit="" onChange={(value) => onSelect(value - 1)} />
      </div>
      <p className="sns-summary">
        {t(loc(`两帧都用同一曝光，入射信号设为约 ${electrons.toFixed(0)} e⁻/像素。黄框是同一块 ${roi.w} × ${roi.h} ROI，三张图都在这里取样。`, `Both frames use the same exposure, set to about ${electrons.toFixed(0)} e⁻ per pixel. The yellow box marks the same ${roi.w} × ${roi.h} ROI in each image.`))}
      </p>
      <div className="sns-ptc-frames">
        <FrameView frame={f1} w={w} roi={roi} mode="gray" scale={frameScale}
          aria={t(loc('第一张曝光帧', 'First exposure frame'))} summary={`f₁ · μ = ${fmt(mean1)} DN`} />
        <FrameView frame={f2} w={w} roi={roi} mode="gray" scale={frameScale}
          aria={t(loc('第二张曝光帧', 'Second exposure frame'))} summary={`f₂ · μ = ${fmt(mean2)} DN`} />
        <FrameView frame={diff} w={w} roi={roi} mode="gray" scale={diffScale}
          aria={t(loc('同位置像素相减的差帧，灰色等于零', 'Pixel-wise difference, with gray at zero'))}
          summary={t(loc('f₁ − f₂ · 中灰 = 0 DN', 'f₁ − f₂ · gray = 0 DN'))} />
      </div>
      <dl className="sns-ptc-math" aria-live="polite">
        <div><dt>{t(loc('X · 暗场修正均值', 'X · Dark-corrected mean'))}</dt><dd>{meanMath} ≈ {fmt(mean)} DN</dd></div>
        <div><dt>{t(diffMode ? loc('Y · 差帧方差 ÷ 2', 'Y · Difference variance ÷ 2') : loc('Y · 第一帧方差', 'Y · First-frame variance'))}</dt>
          <dd>{diffMode ? `${varianceMath} ≈ ` : ''}{fmt(variance)} DN²</dd></div>
      </dl>
      <p className="sns-summary">
        {t(diffMode ? loc('同一像素的固定响应在 f₁ − f₂ 中相消。若两帧的时间噪声相互独立且方差相同，差值方差 = σ² + σ²，所以用上面方差的一半作为单帧估计。', 'A pixel’s fixed response cancels in f₁ − f₂. If the frames have independent temporal noise with equal variance, the difference has variance σ² + σ². Half gives a single-frame estimate.')
          : loc('单帧模式只用 f₁ 计算散点，固定响应的像素间差异也留在方差里。', 'Single-frame mode computes the point from f₁ alone. Fixed pixel-to-pixel response differences remain in its variance.'))}
      </p>
      <PtcPlot points={analysis.points} slope={analysis.slope} intercept={analysis.intercept} selected={index}
        aria={t(S.plotAria)} summary={t(plotSummary(analysis))} xLabel={t(loc('均值 · DN（对数）', 'Mean · DN (log scale)'))}
        yLabel={t(loc('方差 · DN²（对数）', 'Variance · DN² (log scale)'))} />
      {analysis.slope > 0 && <p className="sns-summary">
        {t(loc(`在散粒噪声近似线性区，按原始 DN、DN² 拟合。m = ${analysis.slope.toFixed(4)} DN，K ≈ 1/m = ${analysis.k.toFixed(2)} e⁻/DN。`, `Fit in original DN and DN² in the approximately linear shot-noise region. m = ${analysis.slope.toFixed(4)} DN and K ≈ 1/m = ${analysis.k.toFixed(2)} e⁻/DN.`))}
      </p>}
    </div>
  )
}
