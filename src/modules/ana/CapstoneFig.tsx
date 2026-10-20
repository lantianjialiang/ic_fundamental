import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './capstoneData'
import { BIN_PASS, DUT_COUNT, ITEMS, specIndex, type BatchResult, type ItemId } from './capstoneModel'

/* Bin 柱状图：横向 5 个槽位（Bin 1 + 4 个失效 Bin），纵向满格 = 100 颗 */
const BW = 480
const BH = 190
const BASE_Y = 150
const BAR_MAX_H = 110
const SLOT_X0 = 40
const SLOT_W = (BW - SLOT_X0 - 12) / 5
const BAR_W = 52

export function BinFig({ batch }: { batch: BatchResult }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${BW} ${BH}`} className="term-fig__svg" role="img" aria-label={t(FIG.binAria)}>
        <rect width={BW} height={BH} rx="10" fill="var(--well)" />
        <text x="14" y="18" fill="var(--muted)" fontSize="10">
          {t(FIG.binTitle)}
        </text>
        <line x1={SLOT_X0} x2={BW - 12} y1={BASE_Y} y2={BASE_Y} stroke="var(--line-2)" />
        {batch.binCounts.map((item, index) => {
          const cx = SLOT_X0 + SLOT_W * (index + 0.5)
          const h = (item.count / DUT_COUNT) * BAR_MAX_H
          const isPass = item.bin === BIN_PASS
          const failSpec = ITEMS.find((spec) => spec.bin === item.bin)
          const code = isPass || !failSpec ? t(FIG.good) : failSpec.id.toUpperCase()
          return (
            <g key={item.bin}>
              <rect
                x={cx - BAR_W / 2}
                y={BASE_Y - h}
                width={BAR_W}
                height={h}
                fill={isPass ? 'var(--green)' : 'var(--blue)'}
                fillOpacity="0.8"
              />
              <text x={cx} y={BASE_Y - h - 5} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
                {item.count}
              </text>
              <text x={cx} y={168} textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
                {`Bin ${item.bin}`}
              </text>
              <text x={cx} y={183} textAnchor="middle" fill="var(--muted)" fontSize="10">
                {code}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.binCap)}</figcaption>
    </figure>
  )
}

/* 每项通过率条：按执行顺序自上而下；只统计实际执行过这一项的 DUT */
const YW = 480
const TOP = 30
const ROW_H = 28
const BAR_X = 72
const BAR_LEN = 240

export function YieldFig({ batch, order }: { batch: BatchResult; order: ItemId[] }) {
  const { t } = useLocale()
  const height = TOP + order.length * ROW_H + 12
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${YW} ${height}`} className="term-fig__svg" role="img" aria-label={t(FIG.yieldAria)}>
        <rect width={YW} height={height} rx="10" fill="var(--well)" />
        <text x="14" y="18" fill="var(--muted)" fontSize="10">
          {t(FIG.yieldTitle)}
        </text>
        {order.map((id, row) => {
          const stat = batch.itemStats[specIndex(id)]
          const y = TOP + row * ROW_H
          const finite = Number.isFinite(stat.passRate)
          const len = finite ? stat.passRate * BAR_LEN : 0
          const valueText = finite ? `${(stat.passRate * 100).toFixed(1)}%  ·  ${stat.passed}/${stat.executed}` : '—'
          return (
            <g key={id}>
              <text x="14" y={y + 16} fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
                {id.toUpperCase()}
              </text>
              <rect x={BAR_X} y={y + 5} width={BAR_LEN} height="14" fill="var(--fig-box-2)" />
              <rect x={BAR_X} y={y + 5} width={len} height="14" fill="var(--green)" fillOpacity="0.8" />
              <text x={BAR_X + BAR_LEN + 8} y={y + 16} fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
                {valueText}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.yieldCap)}</figcaption>
    </figure>
  )
}
