import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { S, fill } from './relBurnInData'

import { BI_MAX_H, TARGET_PPM, type BiCurvePoint } from './relBurnInModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const GREEN = '#3fb950'

const W = 480
const H = 200
const PL = 52
const PR = 16
const PT = 14
const PB = 40
const PLOT_W = W - PL - PR
const PLOT_H = H - PT - PB
const PPM_MIN = 1
const PPM_MAX = 10000
const TICKS = [0, 42, 84, 126, 168]

const xOfH = (h: number) => PL + (h / BI_MAX_H) * PLOT_W

const FIG = {
  costAria: loc('BI 时间与单件成本的曲线', 'Curve of cost per part against BI time'),
  costCap: loc(
    '总成本 = BI 成本（随时间线性增加）+ 报废与现场失效成本（随时间下降）。两条线相加的最低点，就是不管 ppm 时最省的 BI 时间。',
    'Total cost = BI cost (rises linearly with time) + scrap and field-failure cost (falls with time). The lowest point of the sum is the cheapest BI time when ppm is ignored.',
  ),
  ppmAria: loc('BI 时间与 T_field 内现场 ppm 的曲线，纵轴为对数刻度', 'Field ppm within T_field against BI time, log scale on the vertical axis'),
  ppmCap: loc(
    '现场 ppm 随 BI 时间快速下降，之后越来越慢。虚线是 ppm 目标：曲线第一次低于它的时间，就是达标的最短 BI 时间。',
    'Field ppm falls fast with BI time, then more slowly. The dashed line is the ppm target: the first time the curve drops below it is the shortest BI time that meets the target.',
  ),
  xHours: loc('BI 时间（h）', 'BI time (h)'),
  yCostUnit: loc('纵轴：$/件', 'Vertical: $/part'),
  yPpmUnit: loc('纵轴：ppm（对数）', 'Vertical: ppm (log)'),
}

/** 成本曲线：三条线 = BI 成本、报废与现场失效成本、总成本；竖线是当前 BI 时间，圆点是无约束的最低点 */
export function BiCostFig({ curve, hours, bestH }: { curve: BiCurvePoint[]; hours: number; bestH: number }) {
  const { t } = useLocale()
  const yMax = Math.max(...curve.map((p) => p.cost)) * 1.05
  const yOf = (value: number) => PT + PLOT_H - (value / yMax) * PLOT_H
  const path = (pick: (p: BiCurvePoint) => number) =>
    curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfH(p.h).toFixed(1)} ${yOf(pick(p)).toFixed(1)}`).join(' ')
  const xNow = xOfH(hours)
  const best = curve[bestH]
  return (
    <figure className="term-fig rel-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.costAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <line x1={PL} y1={PT} x2={PL} y2={PT + PLOT_H} stroke={EDGE} />
        <line x1={PL} y1={PT + PLOT_H} x2={W - PR} y2={PT + PLOT_H} stroke={EDGE} />
        <text x={PL - 6} y={PT + 4} textAnchor="end" fill={MUTED} fontSize={11}>{yMax.toFixed(2)}</text>
        <text x={PL - 6} y={PT + PLOT_H} textAnchor="end" fill={MUTED} fontSize={11}>0</text>
        {TICKS.map((h) => (
          <g key={h}>
            <line x1={xOfH(h)} y1={PT + PLOT_H} x2={xOfH(h)} y2={PT + PLOT_H + 4} stroke={EDGE} />
            <text x={xOfH(h)} y={PT + PLOT_H + 16} textAnchor="middle" fill={MUTED} fontSize={11}>{h}</text>
          </g>
        ))}
        <text x={W - PR} y={H - 6} textAnchor="end" fill={MUTED} fontSize={11}>{t(FIG.xHours)}</text>
        <path d={path((p) => p.costBi)} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={path((p) => p.costRest)} fill="none" stroke={GOLD} strokeWidth={1.5} />
        <path d={path((p) => p.cost)} fill="none" stroke={BLUE} strokeWidth={2.2} />
        <line x1={xNow} y1={PT} x2={xNow} y2={PT + PLOT_H} stroke={TEXT} strokeDasharray="2 3" />
        <circle cx={xOfH(best.h)} cy={yOf(best.cost)} r={3.5} fill={TEXT} />
      </svg>
      <div className="rel-legend" aria-hidden="true">
        <span><i style={{ background: BLUE }} />{t(S.legTotal)}</span>
        <span><i style={{ background: MUTED }} />{t(S.legBi)}</span>
        <span><i style={{ background: GOLD }} />{t(S.legRest)}</span>
        <span>{t(FIG.yCostUnit)}</span>
      </div>
      <figcaption>{t(FIG.costCap)}</figcaption>
    </figure>
  )
}

/** ppm 曲线：对数纵轴，虚线为 ppm 目标；竖线是当前 BI 时间，圆点是当前的现场 ppm */
export function BiPpmFig({ curve, hours }: { curve: BiCurvePoint[]; hours: number }) {
  const { t } = useLocale()
  const logSpan = Math.log10(PPM_MAX) - Math.log10(PPM_MIN)
  const yOf = (ppm: number) => {
    const clamped = Math.min(Math.max(ppm, PPM_MIN), PPM_MAX)
    return PT + ((Math.log10(PPM_MAX) - Math.log10(clamped)) / logSpan) * PLOT_H
  }
  const path = curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOfH(p.h).toFixed(1)} ${yOf(p.ppm).toFixed(1)}`).join(' ')
  const xNow = xOfH(hours)
  const nowPoint = curve[hours]
  const ticks = [1, 10, 100, 1000, 10000]
  return (
    <figure className="term-fig rel-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.ppmAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <line x1={PL} y1={PT} x2={PL} y2={PT + PLOT_H} stroke={EDGE} />
        <line x1={PL} y1={PT + PLOT_H} x2={W - PR} y2={PT + PLOT_H} stroke={EDGE} />
        {ticks.map((value) => (
          <g key={value}>
            <line x1={PL - 3} y1={yOf(value)} x2={PL} y2={yOf(value)} stroke={EDGE} />
            <text x={PL - 6} y={yOf(value) + 4} textAnchor="end" fill={MUTED} fontSize={11}>{value}</text>
          </g>
        ))}
        {TICKS.map((h) => (
          <g key={h}>
            <line x1={xOfH(h)} y1={PT + PLOT_H} x2={xOfH(h)} y2={PT + PLOT_H + 4} stroke={EDGE} />
            <text x={xOfH(h)} y={PT + PLOT_H + 16} textAnchor="middle" fill={MUTED} fontSize={11}>{h}</text>
          </g>
        ))}
        <text x={W - PR} y={H - 6} textAnchor="end" fill={MUTED} fontSize={11}>{t(FIG.xHours)}</text>
        <line x1={PL} y1={yOf(TARGET_PPM)} x2={W - PR} y2={yOf(TARGET_PPM)} stroke={GREEN} strokeDasharray="5 4" />
        <path d={path} fill="none" stroke={BLUE} strokeWidth={2.2} />
        <line x1={xNow} y1={PT} x2={xNow} y2={PT + PLOT_H} stroke={TEXT} strokeDasharray="2 3" />
        <circle cx={xNow} cy={yOf(nowPoint.ppm)} r={3.5} fill={GOLD} />
      </svg>
      <div className="rel-legend" aria-hidden="true">
        <span><i style={{ background: BLUE }} />{t(S.rFieldPpm)}</span>
        <span><i style={{ background: GREEN }} />{t(S.legTarget)}</span>
        <span>{t(FIG.yPpmUnit)}</span>
      </div>
      <figcaption>
        {t(FIG.ppmCap)}
        <span className="rel-fig__now">{t(fill(S.curveNow, String(hours)))}</span>
      </figcaption>
    </figure>
  )
}