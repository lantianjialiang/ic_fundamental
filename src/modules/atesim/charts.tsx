/**
 * charts.tsx — 手写 SVG / CSS 图表：Bin 分布、良率趋势、直方图、Wafer Map
 *
 * 颜色全部走站点 CSS 变量，深浅色主题自动跟随；刻度与图例文字走 i18n。
 */
import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { fmtVal, histogram, type DieRecord, type ItemStats, type LotStats } from './api'
import { binLong, binShort, itemLabel, tf } from './model'
import { S } from './text'

const BIN_COLOR: Record<number, string> = {
  1: 'var(--green)',
  2: 'var(--red)',
  3: 'var(--gold)',
  4: 'var(--blue)',
  5: 'var(--purple)',
  6: 'var(--sky)',
}

const BINS = [1, 2, 3, 4, 5, 6]

/** BinBars：各 Bin 的占比条（横向，比竖柱更适合中英文标签） */
export function BinBars({ stats }: { stats: LotStats }) {
  const { t } = useLocale()
  const max = Math.max(...BINS.map((bin) => stats.binCounts[bin] || 0), 1)
  return (
    <div className="atesim-bins">
      {BINS.map((bin) => {
        const count = stats.binCounts[bin] || 0
        const share = stats.total ? (count / stats.total) * 100 : 0
        return (
          <div key={bin} className="atesim-bin-row">
            <span className="atesim-bin-label">
              <b>Bin {bin}</b>
              {binShort(bin, t)}
            </span>
            <span className="atesim-bin-track">
              <i
                style={{
                  width: Math.max(count ? 1.5 : 0, (count / max) * 100) + '%',
                  background: BIN_COLOR[bin],
                }}
              />
            </span>
            <span className="atesim-bin-value">{tf(t, S.lot.binShare, { n: count, pct: share.toFixed(2) })}</span>
          </div>
        )
      })}
    </div>
  )
}

/** TrendChart：良率随测试序号的变化（按等分桶计算，避免 5000 个点） */
export function TrendChart({ records }: { records: DieRecord[] }) {
  const points = useMemo(() => {
    const buckets = Math.min(30, Math.max(6, Math.round(records.length / 25)))
    const size = Math.max(1, Math.ceil(records.length / buckets))
    const out: Array<{ x: number; y: number }> = []
    for (let i = 0; i < records.length; i += size) {
      const slice = records.slice(i, i + size)
      const good = slice.filter((r) => r.bin === 1).length
      out.push({ x: i + slice.length, y: (good / slice.length) * 100 })
    }
    return out
  }, [records])

  const W = 420
  const H = 152
  const pad = { l: 34, r: 10, t: 12, b: 24 }
  const maxX = records.length || 1
  const sx = (x: number) => pad.l + (x / maxX) * (W - pad.l - pad.r)
  const sy = (y: number) => H - pad.b - (y / 100) * (H - pad.t - pad.b)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]

  return (
    <svg
      className="atesim-chart atesim-chart--trend"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="yield trend"
    >
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(tick)} y2={sy(tick)} stroke="var(--line-soft)" />
          <text x={pad.l - 6} y={sy(tick) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
            {tick}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="var(--blue)" strokeWidth="2" />
      {last ? (
        <>
          <circle cx={sx(last.x)} cy={sy(last.y)} r="3" fill="var(--gold)" />
          <text x={sx(last.x)} y={sy(last.y) - 8} textAnchor="end" fontSize="11" fill="var(--gold)">
            {last.y.toFixed(1)}%
          </text>
        </>
      ) : null}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--line)" />
      <text x={pad.l} y={H - 8} fontSize="11" fill="var(--muted)">
        0
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fontSize="11" fill="var(--muted)">
        #{maxX}
      </text>
    </svg>
  )
}

/** Histogram：分布 + LSL/USL 竖线 + 均值线 */
export function Histogram({ item }: { item: ItemStats }) {
  const { t } = useLocale()
  const values = item.values
  const hist = useMemo(() => histogram(values, 32), [values])
  if (!values.length) return <p className="atesim-empty">{t(S.common.none)}</p>

  const W = 640
  const H = 220
  const pad = { l: 42, r: 14, t: 16, b: 30 }
  const lo = hist.edges[0]
  const hi = hist.edges[hist.edges.length - 1]
  const sx = (v: number) => pad.l + ((v - lo) / (hi - lo || 1)) * (W - pad.l - pad.r)
  const barW = (W - pad.l - pad.r) / hist.counts.length
  const maxCount = Math.max(1, hist.max)
  const sy = (c: number) => H - pad.b - (c / maxCount) * (H - pad.t - pad.b)
  const mean =
    values.reduce((sum, v) => sum + v, 0) / values.length
  const ticks = [0, Math.round(maxCount / 2), maxCount]

  return (
    <svg className="atesim-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={itemLabel(item.id, t)}>
      {hist.counts.map((count, i) => (
        <rect
          key={i}
          x={pad.l + i * barW + 0.5}
          y={sy(count)}
          width={Math.max(1, barW - 1)}
          height={Math.max(0, H - pad.b - sy(count))}
          fill="var(--blue-bg-2)"
          stroke="var(--blue-line)"
          strokeWidth="0.5"
        />
      ))}
      {item.lsl !== null ? (
        <g>
          <line x1={sx(item.lsl)} x2={sx(item.lsl)} y1={pad.t} y2={H - pad.b} stroke="var(--gold)" strokeDasharray="4 3" />
          <text x={sx(item.lsl)} y={pad.t - 4} textAnchor="middle" fontSize="10" fill="var(--gold)">
            LSL {fmtVal(item.lsl, item.digits)}
          </text>
        </g>
      ) : null}
      {item.usl !== null ? (
        <g>
          <line x1={sx(item.usl)} x2={sx(item.usl)} y1={pad.t} y2={H - pad.b} stroke="var(--gold)" strokeDasharray="4 3" />
          <text x={sx(item.usl)} y={pad.t - 4} textAnchor="middle" fontSize="10" fill="var(--gold)">
            USL {fmtVal(item.usl, item.digits)}
          </text>
        </g>
      ) : null}
      <line x1={sx(mean)} x2={sx(mean)} y1={pad.t} y2={H - pad.b} stroke="var(--blue)" strokeWidth="1.5" />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(tick)} y2={sy(tick)} stroke="var(--line-soft)" />
          <text x={pad.l - 6} y={sy(tick) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
            {tick}
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--line)" />
      <text x={pad.l} y={H - 8} fontSize="10" fill="var(--muted)">
        {fmtVal(lo, item.digits)} {item.unit}
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fontSize="10" fill="var(--muted)">
        {fmtVal(hi, item.digits)} {item.unit}
      </text>
    </svg>
  )
}

/**
 * WaferMap：一片 wafer 的 Bin 图
 *
 * 画法沿用 F02「晶圆、封装与测试设备」里的晶圆图：圆形片身、顶部缺口、
 * 几乎相接的圆角 die、细描边。良品用浅绿，不良用浅红并在 die 上标出 Bin 号，
 * 所以整片一眼能看出良率与失效分布，而不是一片彩色噪点。
 */
export function WaferMap({
  wafer,
  items,
}: {
  wafer: { wafer: number; dice: DieRecord[] }
  items: ItemStats[]
}) {
  const { t } = useLocale()
  const [hover, setHover] = useState<DieRecord | null>(null)
  const dice = wafer.dice

  // die 落在等间距网格上：从相邻坐标差推出节距，把归一化坐标换成像素
  const grid = useMemo(() => {
    const xs = [...new Set(dice.map((die) => die.x))].sort((a, b) => a - b)
    let pitch = 0.09
    for (let i = 1; i < xs.length; i++) {
      const step = xs[i] - xs[i - 1]
      if (step > 1e-6) {
        pitch = step
        break
      }
    }
    const maxR = dice.reduce((max, die) => Math.max(max, Math.hypot(die.x, die.y)), 0) || 0.94
    return { pitch, maxR }
  }, [dice])

  const BOX = 320
  const center = BOX / 2
  const dieR = 124
  const waferR = 142
  const scale = dieR / grid.maxR
  const diePx = Math.max(5, grid.pitch * scale * 0.88)
  const fontPx = Math.min(9.5, Math.max(6, diePx * 0.68))
  const showBin = diePx >= 7.5

  const counts = useMemo(() => {
    const map: Record<number, number> = {}
    dice.forEach((die) => {
      map[die.bin] = (map[die.bin] || 0) + 1
    })
    return map
  }, [dice])
  const good = counts[1] || 0
  const total = dice.length || 1

  return (
    <div className="atesim-wafer-wrap">
      <figure className="atesim-wafer">
        <svg viewBox={`0 0 ${BOX} ${BOX}`} role="img" aria-label={t(S.lot.waferCap)}>
          <rect width={BOX} height={BOX} rx="10" fill="var(--well)" />
          <circle cx={center} cy={center} r={waferR} fill="var(--fig-box-2)" stroke="var(--line-2)" strokeWidth="2" />
          {dice.map((die) => {
            const bad = die.bin !== 1
            const active = hover?.index === die.index
            return (
              <rect
                key={die.index}
                x={center + die.x * scale - diePx / 2}
                y={center - die.y * scale - diePx / 2}
                width={diePx}
                height={diePx}
                rx={1.4}
                fill={bad ? 'var(--red)' : 'var(--green-bg)'}
                stroke={active ? 'var(--gold)' : bad ? 'var(--red)' : 'var(--green-line)'}
                strokeWidth={active ? 2 : 1}
                onMouseEnter={() => setHover(die)}
                onFocus={() => setHover(die)}
                tabIndex={-1}
              />
            )
          })}
          {/* 不良 die 上标 Bin 号：整片红色里也能读出是哪一类失效 */}
          {showBin
            ? dice
                .filter((die) => die.bin !== 1)
                .map((die) => (
                  <text
                    key={'n' + die.index}
                    x={center + die.x * scale}
                    y={center - die.y * scale + fontPx * 0.36}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontWeight="600"
                    fontSize={fontPx}
                    fontFamily="var(--mono)"
                    pointerEvents="none"
                  >
                    {die.bin}
                  </text>
                ))
            : null}
          {/* 缺口画在 die 之后：看起来就是片缘被切掉一个 V 口 */}
          <path
            d={`M${center - 9} ${center - waferR - 1} L${center} ${center - waferR + 11} L${center + 9} ${center - waferR - 1} Z`}
            fill="var(--well)"
            stroke="var(--line-2)"
            pointerEvents="none"
          />
          <text
            x={center + 14}
            y={center - waferR - 7}
            fill="var(--dim)"
            fontSize="11"
            pointerEvents="none"
          >
            {t(S.lot.waferNotch)}
          </text>
          {hover ? (
            <rect
              x={center + hover.x * scale - diePx / 2 - 2}
              y={center - hover.y * scale - diePx / 2 - 2}
              width={diePx + 4}
              height={diePx + 4}
              rx={2}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
              pointerEvents="none"
            />
          ) : null}
        </svg>
        <figcaption>{t(S.lot.waferCap)}</figcaption>
      </figure>

      <div className="atesim-wafer-side">
        <div className="atesim-wafer__info">
          {hover ? (
            <>
              <p>
                {tf(t, S.lot.waferInfo, {
                  index: hover.index,
                  wafer: hover.wafer,
                  x: hover.x.toFixed(3),
                  y: hover.y.toFixed(3),
                  bin: binLong(hover.bin, t),
                })}
              </p>
              <p className="atesim-wafer__vals">
                {tf(t, S.lot.waferInputs, {
                  list: items
                    .filter((item) => item.enabled && hover.values[item.id] !== undefined)
                    .map(
                      (item) =>
                        itemLabel(item.id, t) +
                        ' ' +
                        fmtVal(hover.values[item.id], item.digits) +
                        ' ' +
                        item.unit,
                    )
                    .join(' · '),
                })}
              </p>
            </>
          ) : (
            <p className="atesim-hint">{t(S.lot.waferHint)}</p>
          )}
        </div>

        <ul className="atesim-legend">
          <li>
            <i className="is-good" />
            {tf(t, S.lot.waferGood, { n: good, total: dice.length })}
          </li>
          <li>
            <i className="is-bad" />
            {tf(t, S.lot.waferBad, { n: dice.length - good, total: dice.length })}
          </li>
        </ul>

        <table className="dtable atesim-table atesim-wafer__table">
          <thead>
            <tr>
              <th>{t(S.report.colBin)}</th>
              <th>{t(S.report.colCount)}</th>
              <th>{t(S.report.colShare)}</th>
            </tr>
          </thead>
          <tbody>
            {BINS.map((bin) => (
              <tr key={bin}>
                <td>
                  <span className="atesim-dot" style={{ background: BIN_COLOR[bin] }} />
                  {binShort(bin, t)}
                </td>
                <td className="num">{counts[bin] || 0}</td>
                <td className="num">{(((counts[bin] || 0) / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

