import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { fill } from './relStressData'
import { S } from './relWeibullData'
import { type WeibullAnalysis, type WeibullState } from './relWeibullModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const RED = '#ff7b72'

const LABEL = {
  xTime: loc('时间 t（h，对数刻度）', 'Time t (h, log scale)'),
  yProb: loc('失效概率 F', 'Failure probability F'),
  fit: loc('拟合线', 'Fit'),
  truth: loc('真值', 'True'),
  censor: loc('截尾', 'Censor'),
  betaHat: loc('β̂ = {b}', 'β̂ = {b}'),
}

/** Weibull 概率坐标：纵轴 y = ln(−ln(1−F))，固定在 0.5%–99.5% 之间 */
const Y_LO = Math.log(-Math.log(1 - 0.005))
const Y_HI = Math.log(-Math.log(1 - 0.995))
const TICK_F = [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99]
const X0 = 56
const X1 = 460
const Y0 = 16
const Y1 = 262

/**
 * Weibull 概率图（REL-04 本地组件）：横轴 log10 t，纵轴 ln(−ln(1−F))。
 * 拟合线 y = β̂(ln t − ln η̂)，真值线 y = β(ln t − ln η) 用金色虚线；截尾时间用竖线标出。
 */
export function WeibullPlotFig({ state, analysis }: { state: WeibullState; analysis: WeibullAnalysis }) {
  const { t } = useLocale()
  const allTimes = analysis.samples.map((s) => s.t)
  const tMin = Math.min(...allTimes)
  const tMax = Math.max(...allTimes, state.censorAt)
  const lo = Math.max(Math.floor(Math.log10(tMin)), 0)
  let hi = Math.ceil(Math.log10(tMax))
  if (hi <= lo) {
    hi = lo + 1
  }
  const X = (time: number) => X0 + ((Math.log10(time) - lo) / (hi - lo)) * (X1 - X0)
  const Y = (y: number) => Y1 - ((y - Y_LO) / (Y_HI - Y_LO)) * (Y1 - Y0)
  const tDomainLo = Math.pow(10, lo)
  const tDomainHi = Math.pow(10, hi)

  /** 一条 β(ln t − ln η) 的直线，裁剪到绘图区内 */
  function linePath(beta: number, eta: number): string {
    if (!Number.isFinite(beta) || !Number.isFinite(eta) || beta <= 0) {
      return ''
    }
    const tA = Math.max(tDomainLo, Math.exp(Math.log(eta) + Y_LO / beta))
    const tB = Math.min(tDomainHi, Math.exp(Math.log(eta) + Y_HI / beta))
    if (tA >= tB) {
      return ''
    }
    const yA = beta * (Math.log(tA) - Math.log(eta))
    const yB = beta * (Math.log(tB) - Math.log(eta))
    return `M ${X(tA)} ${Y(yA)} L ${X(tB)} ${Y(yB)}`
  }

  const fitPath = analysis.finite ? linePath(analysis.fit.beta, analysis.fit.eta) : ''
  const truePath = linePath(state.beta, state.eta)
  const inside = analysis.points.filter((p) => {
    const y = Math.log(-Math.log(1 - p.f))
    return y >= Y_LO && y <= Y_HI && p.t >= tDomainLo && p.t <= tDomainHi
  })
  const censorInside = state.censorAt >= tDomainLo && state.censorAt <= tDomainHi

  const xTicks: number[] = []
  for (let k = lo; k <= hi; k += 1) {
    xTicks.push(k)
  }

  return (
    <figure className="term-fig rel-fig">
      <svg viewBox="0 0 480 300" role="img" aria-label={t(S.figPlotAria)} className="rel-svg">
        <rect x={0} y={0} width={480} height={300} rx={10} fill={BG} />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={EDGE} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={EDGE} />
        {TICK_F.map((f) => {
          const y = Math.log(-Math.log(1 - f))
          return (
            <g key={f}>
              <line x1={X0 - 4} y1={Y(y)} x2={X0} y2={Y(y)} stroke={EDGE} />
              <line x1={X0} y1={Y(y)} x2={X1} y2={Y(y)} stroke={EDGE} strokeOpacity={0.35} strokeDasharray="2 4" />
              <text x={X0 - 7} y={Y(y) + 4} textAnchor="end" fill={MUTED} fontSize={11}>
                {`${Math.round(f * 100)}%`}
              </text>
            </g>
          )
        })}
        {xTicks.map((k) => (
          <g key={k}>
            <line x1={X(Math.pow(10, k))} y1={Y1} x2={X(Math.pow(10, k))} y2={Y1 + 4} stroke={EDGE} />
            <text x={X(Math.pow(10, k))} y={Y1 + 16} textAnchor="middle" fill={MUTED} fontSize={11}>
              {String(Math.pow(10, k))}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 34} textAnchor="middle" fill={MUTED} fontSize={11}>
          {t(LABEL.xTime)}
        </text>
        <text x={X0} y={Y0 - 4} fill={TEXT} fontSize={11}>
          {t(LABEL.yProb)}
        </text>
        {censorInside ? (
          <g>
            <line x1={X(state.censorAt)} y1={Y0} x2={X(state.censorAt)} y2={Y1} stroke={MUTED} strokeDasharray="3 3" />
            <text x={X(state.censorAt) + 4} y={Y1 - 6} fill={MUTED} fontSize={11}>
              {t(LABEL.censor)}
            </text>
          </g>
        ) : null}
        {truePath ? <path d={truePath} fill="none" stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 4" /> : null}
        {fitPath ? <path d={fitPath} fill="none" stroke={BLUE} strokeWidth={2} /> : null}
        {inside.map((p, index) => (
          <circle key={index} cx={X(p.t)} cy={Y(Math.log(-Math.log(1 - p.f)))} r={3} fill={TEXT} />
        ))}
        <g>
          <line x1={X0 + 8} y1={Y0 + 18} x2={X0 + 24} y2={Y0 + 18} stroke={BLUE} strokeWidth={2} />
          <text x={X0 + 30} y={Y0 + 22} fill={TEXT} fontSize={11}>
            {t(LABEL.fit)}
          </text>
          <line x1={X0 + 8} y1={Y0 + 34} x2={X0 + 24} y2={Y0 + 34} stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={X0 + 30} y={Y0 + 38} fill={TEXT} fontSize={11}>
            {t(LABEL.truth)}
          </text>
        </g>
        {analysis.finite ? (
          <text x={X1} y={Y0 + 8} textAnchor="end" fill={RED} fontSize={11}>
            {t(fill(LABEL.betaHat, { b: analysis.fit.beta.toFixed(2) }))}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(S.figPlotCap)}</figcaption>
    </figure>
  )
}
