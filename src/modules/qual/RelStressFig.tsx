import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { fill, S } from './relStressData'
import { fitByFailures } from './relStressModel'
import { minSampleZeroFail } from './core/reliability'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const GREEN = '#7ee787'
const PURPLE = '#d2a8ff'
const RED = '#ff7b72'

const AXIS_TEXT = {
  yFit: loc('FIT 上限', 'FIT upper bound'),
  xR: loc('失效数 r', 'Failures r'),
  yN: loc('样本数 n', 'Sample size n'),
  xH: loc('试验小时 h', 'Test hours h'),
  target: loc('目标 {v} FIT', 'Target {v} FIT'),
  nowR: loc('当前 r = {v}', 'Now r = {v}'),
  nowN: loc('当前 n = {v}', 'Now n = {v}'),
}

/** 图 1：FIT 上限随失效数 r 变化，当前 r 用金点标出，虚线是目标 */
export function FitCurveFig({
  n,
  hours,
  af,
  cl,
  r,
  target,
}: {
  n: number
  hours: number
  af: number
  cl: number
  r: number
  target: number
}) {
  const { t } = useLocale()
  const values = fitByFailures(n, hours, cl, af, 5)
  const top = Math.max(target * 1.2, ...values)
  const yMax = Math.ceil(top / 50) * 50
  const x0 = 52
  const x1 = 340
  const y0 = 24
  const y1 = 186
  const X = (rr: number) => x0 + (rr / 5) * (x1 - x0)
  const Y = (v: number) => y1 - (v / yMax) * (y1 - y0)
  const polyline = values.map((v, rr) => `${X(rr)},${Y(v)}`).join(' ')
  const current = Math.min(Math.max(r, 0), 5)

  return (
    <figure className="term-fig rel-fig">
      <svg viewBox="0 0 360 230" role="img" aria-label={t(S.figFitAria)} className="rel-svg">
        <rect x={0} y={0} width={360} height={230} rx={10} fill={BG} />
        <text x={12} y={16} fill={TEXT} fontSize={12}>
          {t(AXIS_TEXT.yFit)}
        </text>
        <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={EDGE} />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={EDGE} />
        <text x={x0 - 6} y={y1 + 4} textAnchor="end" fill={MUTED} fontSize={11}>
          0
        </text>
        <text x={x0 - 6} y={y0 + 4} textAnchor="end" fill={MUTED} fontSize={11}>
          {yMax.toFixed(0)}
        </text>
        <line x1={x0} y1={Y(target)} x2={x1} y2={Y(target)} stroke={GREEN} strokeDasharray="4 3" />
        <text x={x1} y={Y(target) - 4} textAnchor="end" fill={GREEN} fontSize={11}>
          {t(fill(AXIS_TEXT.target, { v: target.toFixed(0) }))}
        </text>
        <polyline points={polyline} fill="none" stroke={BLUE} strokeWidth={2} />
        {values.map((v, rr) => (
          <g key={rr}>
            <circle cx={X(rr)} cy={Y(v)} r={rr === current ? 6 : 3} fill={rr === current ? GOLD : BLUE} />
            <text x={X(rr)} y={y1 + 14} textAnchor="middle" fill={MUTED} fontSize={11}>
              {rr}
            </text>
          </g>
        ))}
        <text x={x0} y={222} fill={MUTED} fontSize={11}>
          {t(AXIS_TEXT.xR)}
        </text>
        <text x={X(current)} y={Y(values[current]) - 10} textAnchor="middle" fill={GOLD} fontSize={11}>
          {t(fill(AXIS_TEXT.nowR, { v: String(current) }))}
        </text>
      </svg>
      <figcaption>{t(S.figFitCap)}</figcaption>
    </figure>
  )
}

/** 图 2 的三条等 FIT 目标曲线（r = 0） */
const CURVE_TARGETS: Array<{ fit: number; color: string }> = [
  { fit: 100, color: BLUE },
  { fit: 50, color: GREEN },
  { fit: 25, color: PURPLE },
]
const H_MIN = 250
const H_MAX = 2000
const N_MAX = 600

/** 图 2：样本量–时间折中。每条曲线是一个 FIT 目标，超出 N_MAX 的部分断开 */
export function TradeoffFig({ hours, n, af, cl }: { hours: number; n: number; af: number; cl: number }) {
  const { t } = useLocale()
  const x0 = 56
  const x1 = 420
  const y0 = 16
  const y1 = 214
  const X = (h: number) => x0 + ((h - H_MIN) / (H_MAX - H_MIN)) * (x1 - x0)
  const Y = (v: number) => y1 - (Math.min(v, N_MAX) / N_MAX) * (y1 - y0)

  const curves = CURVE_TARGETS.map((curve) => {
    let path = ''
    let pen = false
    for (let h = H_MIN; h <= H_MAX; h += 25) {
      const need = minSampleZeroFail(curve.fit, cl, h, af)
      if (need > N_MAX) {
        pen = false
      } else {
        path += `${pen ? 'L' : 'M'} ${X(h)} ${Y(need)} `
        pen = true
      }
    }
    const endN = minSampleZeroFail(curve.fit, cl, H_MAX, af)
    return { ...curve, path, endY: Y(endN) }
  })

  const onRight = X(hours) > (x0 + x1) / 2
  const nowX = X(hours)
  const nowY = Y(n)

  return (
    <figure className="term-fig rel-fig">
      <svg viewBox="0 0 480 250" role="img" aria-label={t(S.figTradeAria)} className="rel-svg">
        <rect x={0} y={0} width={480} height={250} rx={10} fill={BG} />
        <text x={12} y={14} fill={TEXT} fontSize={12}>
          {t(AXIS_TEXT.yN)}
        </text>
        <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={EDGE} />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={EDGE} />
        {[0, 200, 400, 600].map((v) => (
          <text key={v} x={x0 - 6} y={Y(v) + 4} textAnchor="end" fill={MUTED} fontSize={11}>
            {v}
          </text>
        ))}
        {[250, 500, 1000, 1500, 2000].map((h) => (
          <text key={h} x={X(h)} y={y1 + 14} textAnchor="middle" fill={MUTED} fontSize={11}>
            {h}
          </text>
        ))}
        <text x={(x0 + x1) / 2} y={246} textAnchor="middle" fill={MUTED} fontSize={11}>
          {t(AXIS_TEXT.xH)}
        </text>
        {curves.map((curve) => (
          <g key={curve.fit}>
            <path d={curve.path} fill="none" stroke={curve.color} strokeWidth={2} />
            <text x={x1 + 4} y={curve.endY + 4} fill={curve.color} fontSize={11}>
              {`${curve.fit} FIT`}
            </text>
          </g>
        ))}
        <circle cx={nowX} cy={nowY} r={6} fill={RED} />
        <text x={onRight ? nowX - 8 : nowX + 8} y={nowY - 8} textAnchor={onRight ? 'end' : 'start'} fill={RED} fontSize={11}>
          {t(fill(AXIS_TEXT.nowN, { v: String(n) }))}
        </text>
      </svg>
      <figcaption>{t(S.figTradeCap)}</figcaption>
    </figure>
  )
}