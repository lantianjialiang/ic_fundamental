import { useLocale } from '../../i18n/LocaleContext'
import { S } from './patternData'
import { type CoverageRow, PATTERN_IDS, PATTERN_OPTIONS, type PatternId, opsPerCell } from './patternModel'

const CW = 480
const TOP = 36
const ROW_H = 58
const LABEL_X = 12
const BAR_X = 124
const BAR_MAX = 230
const BAR_H = 14

/**
 * 五种 Pattern 的覆盖（检出数，蓝条）与耗时（每单元操作次数，金条）。
 * selected 那一行加底色，对应页面上选中的 Pattern。
 */
export function PatternFig({ selected, rows }: { selected: PatternId; rows: CoverageRow[] }) {
  const { t } = useLocale()
  const total = rows.length
  const costs = PATTERN_IDS.map((id) => opsPerCell(id))
  const maxCost = Math.max(...costs)
  const height = TOP + PATTERN_IDS.length * ROW_H + 6

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${height}`} className="mem-fig" role="img" aria-label={t(S.figAria)}>
        <rect x={BAR_X} y={8} width={10} height={10} className="mem-bar-cov" />
        <text x={BAR_X + 16} y={17} className="mem-fig-muted">{t(S.covLegend)}</text>
        <rect x={BAR_X + 170} y={8} width={10} height={10} className="mem-bar-cost" />
        <text x={BAR_X + 186} y={17} className="mem-fig-muted">{t(S.costLegend)}</text>
        {PATTERN_IDS.map((id, index) => {
          const y0 = TOP + index * ROW_H
          const detected = rows.filter((row) => row.cells[id].detected).length
          const covWidth = total > 0 ? (detected / total) * BAR_MAX : 0
          const cost = costs[index]
          const costWidth = (cost / maxCost) * BAR_MAX
          const option = PATTERN_OPTIONS.find((item) => item.id === id)
          const label = option === undefined ? id : t(option.label)
          return (
            <g key={id}>
              {id === selected ? <rect x={4} y={y0 - 8} width={CW - 8} height={ROW_H - 8} rx={6} className="mem-row-sel" /> : null}
              <text x={LABEL_X} y={y0 + 19} className="mem-fig-text">{label}</text>
              <rect x={BAR_X} y={y0} width={covWidth} height={BAR_H} className="mem-bar-cov" />
              <text x={BAR_X + covWidth + 6} y={y0 + 11} className="mem-fig-text">{`${detected} / ${total}`}</text>
              <rect x={BAR_X} y={y0 + 22} width={costWidth} height={BAR_H} className="mem-bar-cost" />
              <text x={BAR_X + costWidth + 6} y={y0 + 33} className="mem-fig-text">{`${cost}`}</text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(S.figCap)}</figcaption>
    </figure>
  )
}
