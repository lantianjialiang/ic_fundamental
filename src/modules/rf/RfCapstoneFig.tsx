import { useLocale } from '../../i18n/LocaleContext'
import { S } from './rfCapstoneData'
import { BER_LIMIT, SENS_SPEC_DBM, berCurve, berTheory } from './rfCapstoneModel'

const CW = 480
const CH = 240
const PAD_L = 50
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 横轴输入功率（dBm），纵轴 BER（对数）：1 到 1e-6 */
const P_MIN = -110
const P_MAX = -85
const LOG_MAX = 0
const LOG_MIN = -6

const xOf = (p: number) => PAD_L + ((p - P_MIN) / (P_MAX - P_MIN)) * PLOT_W
const yOf = (ber: number) => PAD_T + ((LOG_MAX - Math.log10(ber)) / (LOG_MAX - LOG_MIN)) * PLOT_H

const X_TICKS = [-110, -105, -100, -95, -90, -85]
const Y_TICKS: Array<{ log: number; label: string }> = [
  { log: 0, label: '1' },
  { log: -3, label: '1e-3' },
  { log: -6, label: '1e-6' },
]

/** BER 与输入功率的曲线（解析），标出规格线、BER = 1e-3 参考线与当前测试点 */
export function BerFig({ nfDb, rxTest }: { nfDb: number; rxTest: number }) {
  const { t } = useLocale()
  const curve = berCurve(nfDb, P_MIN, P_MAX, 0.5)
  const polyline = curve.map((c) => `${xOf(c.p).toFixed(1)},${yOf(c.ber).toFixed(1)}`).join(' ')
  const testBer = Math.max(berTheory(rxTest, nfDb), 1e-7)
  const refY = yOf(BER_LIMIT)

  return (
    <figure className="term-fig rf-cap-ber-wrap">
      <svg className="rf-cap-ber" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(S.berAria)}>
        <rect x="0" y="0" width={CW} height={CH} rx="10" className="rf-fig-bg" />

        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} className="rf-fig-axis" />
        <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} className="rf-fig-axis" />

        {Y_TICKS.map((tick) => (
          <g key={tick.label}>
            <line x1={PAD_L} y1={yOf(10 ** tick.log)} x2={PAD_L + PLOT_W} y2={yOf(10 ** tick.log)} className="rf-fig-grid" />
            <text x={PAD_L - 6} y={yOf(10 ** tick.log) + 4} textAnchor="end" className="rf-fig-muted">{tick.label}</text>
          </g>
        ))}

        {X_TICKS.map((p) => (
          <g key={p}>
            <line x1={xOf(p)} y1={PAD_T + PLOT_H} x2={xOf(p)} y2={PAD_T + PLOT_H + 4} className="rf-fig-axis" />
            <text x={xOf(p)} y={PAD_T + PLOT_H + 16} textAnchor="middle" className="rf-fig-muted">{`${p}`}</text>
          </g>
        ))}
        <text x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 16} textAnchor="end" className="rf-fig-muted">dBm</text>

        <line x1={PAD_L} y1={refY} x2={PAD_L + PLOT_W} y2={refY} className="rf-cap-ref" />
        <text x={PAD_L + PLOT_W - 4} y={refY - 5} textAnchor="end" className="rf-fig-muted">{t(S.refLabel)}</text>

        <line x1={xOf(SENS_SPEC_DBM)} y1={PAD_T} x2={xOf(SENS_SPEC_DBM)} y2={PAD_T + PLOT_H} className="rf-cap-spec" />
        <text x={xOf(SENS_SPEC_DBM) - 4} y={PAD_T + 12} textAnchor="end" className="rf-fig-muted">{t(S.specLabel)}</text>

        <line x1={xOf(rxTest)} y1={PAD_T} x2={xOf(rxTest)} y2={PAD_T + PLOT_H} className="rf-cap-test" />
        <text x={xOf(rxTest) + 4} y={PAD_T + PLOT_H - 6} className="rf-fig-muted">{`${rxTest} dBm`}</text>

        <polyline points={polyline} className="rf-cap-curve" />
        <circle cx={xOf(rxTest)} cy={yOf(testBer)} r={4} className="rf-cap-dot" />
      </svg>
      <figcaption>{t(S.berCap)}</figcaption>
    </figure>
  )
}
