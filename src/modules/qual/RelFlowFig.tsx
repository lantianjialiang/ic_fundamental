import { useLocale } from '../../i18n/LocaleContext'
import { NODE_CODE, BIN_NAME, S } from './relFlowData'
import { BIN_NOS, NODE_INFO, type FlowResult, type NodeId } from './relFlowModel'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 RF 课一致） */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const W = 520
/** 纵坐标：温度 → y，−40 °C 在下，125 °C 在上 */
const yOf = (temp: number) => 150 - ((temp + 40) / 165) * 120

/**
 * 测试温度折线图（TempProfilePlot）：只画启用的测试站，按执行顺序排列。
 * 相邻两站温度不同，中间标 soak。
 */
export function TempFig({ result }: { result: FlowResult }) {
  const { t } = useLocale()
  const stations: Array<{ id: NodeId; temp: number }> = []
  for (const node of result.nodes) {
    const temp = NODE_INFO[node.id].temp
    if (temp !== null) {
      stations.push({ id: node.id, temp })
    }
  }
  const n = stations.length
  const xs = stations.map((_, i) => (n <= 1 ? W / 2 : 70 + (i * (W - 140)) / (n - 1)))

  return (
    <figure className="term-fig rf-flow-fig">
      <svg viewBox="0 0 520 190" role="img" aria-label={t(S.tempAria)} className="rf-flow-svg">
        <rect x={0} y={0} width={W} height={190} rx={10} fill={BG} />
        {[-40, 25, 125].map((temp) => (
          <g key={temp}>
            <line x1={52} y1={yOf(temp)} x2={W - 16} y2={yOf(temp)} stroke={EDGE} strokeDasharray="3 4" />
            <text x={44} y={yOf(temp) + 4} textAnchor="end" fill={MUTED} fontSize={12}>
              {`${temp} °C`}
            </text>
          </g>
        ))}
        {n > 0 ? (
          <polyline
            points={stations.map((s, i) => `${xs[i]},${yOf(s.temp)}`).join(' ')}
            fill="none"
            stroke={BLUE}
            strokeWidth={2}
          />
        ) : null}
        {stations.map((s, i) => {
          const prev = i > 0 ? stations[i - 1] : null
          const changed = prev !== null && prev.temp !== s.temp
          const midX = prev !== null ? (xs[i - 1] + xs[i]) / 2 : 0
          const midY = prev !== null ? (yOf(prev.temp) + yOf(s.temp)) / 2 : 0
          return (
            <g key={`${s.id}-${i}`}>
              {changed ? (
                <text x={midX} y={midY - 6} textAnchor="middle" fill={GOLD} fontSize={11}>
                  soak
                </text>
              ) : null}
              <circle cx={xs[i]} cy={yOf(s.temp)} r={5} fill={BOX} stroke={GOLD} strokeWidth={2} />
              <text x={xs[i]} y={yOf(s.temp) - 12} textAnchor="middle" fill={TEXT} fontSize={12}>
                {NODE_CODE[s.id] ?? ''}
              </text>
              <text x={xs[i]} y={176} textAnchor="middle" fill={MUTED} fontSize={11}>
                {`${i + 1}`}
              </text>
            </g>
          )
        })}
        {n === 0 ? (
          <text x={W / 2} y={100} textAnchor="middle" fill={MUTED} fontSize={13}>
            {t(S.tempEmpty)}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(S.tempCap)}</figcaption>
    </figure>
  )
}

/**
 * Bin Pareto（SVG 条形图）：每类拒收的期望件数，从多到少排（PASS 在读数里单独给出）。
 * 每一行的名字在条形上方一行，数字在右侧，避免横向重叠。
 */
export function ParetoFig({ result }: { result: FlowResult }) {
  const { t } = useLocale()
  const rows = BIN_NOS.filter((bin) => bin !== 1)
    .map((bin) => ({ bin, count: result.bins[bin] }))
    .sort((a, b) => b.count - a.count || a.bin - b.bin)
  const max = Math.max(1e-9, ...rows.map((r) => r.count))
  const rowH = 40
  const height = 30 + rows.length * rowH

  return (
    <figure className="term-fig rf-flow-fig">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={t(S.paretoAria)} className="rf-flow-svg">
        <rect x={0} y={0} width={W} height={height} rx={10} fill={BG} />
        <text x={12} y={20} fill={TEXT} fontSize={12}>
          {t(S.paretoTitle)}
        </text>
        {rows.map((row, i) => {
          const y = 30 + i * rowH
          const barW = (row.count / max) * (W - 24)
          const color = i === 0 ? GOLD : BLUE
          return (
            <g key={row.bin}>
              <text x={12} y={y + 12} fill={TEXT} fontSize={12}>
                {t(BIN_NAME[row.bin])}
              </text>
              <text x={W - 12} y={y + 12} textAnchor="end" fill={TEXT} fontSize={12}>
                {row.count.toFixed(1)}
              </text>
              <rect x={12} y={y + 18} width={W - 24} height={10} rx={3} fill={BOX} />
              {barW > 0 ? <rect x={12} y={y + 18} width={barW} height={10} rx={3} fill={color} /> : null}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(S.paretoCap)}</figcaption>
    </figure>
  )
}
