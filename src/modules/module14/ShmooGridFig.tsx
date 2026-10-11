import { useLocale } from '../../i18n/LocaleContext'
import { FREQS, L, SPEC, VOLTS, cellKind, fmaxAt, inSpec, isPass, type ChipModel } from './data/content'

export type Cell = { v: number; f: number }

const LEFT = 64
const TOP = 18
const CW = 38
const CH = 18
const NR = VOLTS.length
const NC = FREQS.length
const PLOT_W = NC * CW
const PLOT_H = NR * CH
const F0 = FREQS[0]
const FSTEP = FREQS[1] - FREQS[0]
const V0 = VOLTS[0]
const VSTEP = VOLTS[1] - VOLTS[0]

/** 频率 → x（以格子中心为准，可以是小数格） */
const fx = (f: number) => LEFT + ((f - F0) / FSTEP + 0.5) * CW
/** 电压 → y（高电压在上） */
const vy = (v: number) => TOP + (NR - 1 - (v - V0) / VSTEP + 0.5) * CH

export function ShmooGridFig({ chip, active, onPick }: { chip: ChipModel; active: Cell | null; onPick: (cell: Cell) => void }) {
  const { t } = useLocale()
  const height = TOP + PLOT_H + 60
  // 规格框：频率从最左一格到 400 MHz 那一格的右边，电压从 0.90 那一行底到 1.10 那一行顶
  const specX0 = LEFT
  const specX1 = fx(SPEC.fMax) + CW / 2
  const specY0 = vy(SPEC.vMax) - CH / 2
  const specY1 = vy(SPEC.vMin) + CH / 2
  // 模型边界线：从最低工作电压到最高一行
  const vTop = VOLTS[NR - 1]
  const fEdge = F0 + (NC - 0.5) * FSTEP
  const vStart = chip.vmin - VSTEP / 2
  const vEnd = Math.min(vTop + VSTEP / 2, chip.vt + fEdge / chip.k)
  const lineX = (v: number) => fx(fmaxAt(chip, v))
  const vminY = vy(vStart)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.figCap)}>
        <rect width="680" height={height} rx="10" fill="var(--well)" />
        {VOLTS.map((v) => (
          <g key={v}>
            <text x={LEFT - 8} y={vy(v) + 4} textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
              {v.toFixed(2)}
            </text>
            {FREQS.map((f) => {
              const kind = cellKind(chip, v, f)
              const pass = isPass(kind)
              const spec = inSpec(v, f)
              const isActive = active !== null && Math.abs(active.v - v) < 1e-6 && active.f === f
              let fill = 'var(--fig-box-2)'
              if (pass) fill = 'var(--green-bg)'
              else if (spec) fill = 'var(--red-bg)'
              return (
                <rect
                  key={f}
                  className="m14-cell"
                  x={fx(f) - CW / 2 + 1}
                  y={vy(v) - CH / 2 + 1}
                  width={CW - 2}
                  height={CH - 2}
                  rx="2"
                  fill={fill}
                  stroke={isActive ? 'var(--gold)' : pass ? 'var(--green-line)' : spec ? 'var(--red-line)' : 'var(--line-soft)'}
                  strokeWidth={isActive ? 2.5 : 1}
                  onClick={() => onPick({ v, f })}
                />
              )
            })}
          </g>
        ))}

        {/* 模型边界：fMAX 随 VDD 线性升高；最低工作电压 */}
        <line
          x1={lineX(vStart)}
          y1={vminY}
          x2={lineX(vEnd)}
          y2={vy(vEnd)}
          stroke="var(--text-2)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          pointerEvents="none"
        />
        <line x1={LEFT} y1={vminY} x2={lineX(vStart)} y2={vminY} stroke="var(--text-2)" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />
        <text x={LEFT + 4} y={vminY + 13} fill="var(--text-2)" fontSize="10" pointerEvents="none">
          {`${t(L.vminLine)} ≈ ${chip.vmin.toFixed(2)} V`}
        </text>
        <text x={LEFT + PLOT_W - 4} y={TOP + 12} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)" pointerEvents="none">
          {t(L.model)}
        </text>

        {/* 规格框 */}
        <rect
          x={specX0}
          y={specY0}
          width={specX1 - specX0}
          height={specY1 - specY0}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeDasharray="6 4"
          pointerEvents="none"
        />
        <text x={specX1 - 4} y={specY0 - 4} textAnchor="end" fill="var(--gold)" fontSize="11" pointerEvents="none">
          {t(L.spec)}
        </text>

        {/* 坐标 */}
        {FREQS.map((f, c) =>
          c % 2 === 0 ? (
            <text key={f} x={fx(f)} y={TOP + PLOT_H + 14} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
              {f}
            </text>
          ) : null,
        )}
        <text x={LEFT + PLOT_W / 2} y={TOP + PLOT_H + 32} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.axisF)}
        </text>
        <text x={8} y={TOP - 6} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(L.axisV)}
        </text>

        {/* 图例 */}
        {[
          { label: L.legendPass, fill: 'var(--green-bg)', stroke: 'var(--green-line)' },
          { label: L.legendFail, fill: 'var(--fig-box-2)', stroke: 'var(--line-soft)' },
          { label: L.legendBad, fill: 'var(--red-bg)', stroke: 'var(--red-line)' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${LEFT + i * 130}, ${TOP + PLOT_H + 42})`}>
            <rect width="14" height="10" rx="2" fill={item.fill} stroke={item.stroke} />
            <text x="20" y="9" fill="var(--text-2)" fontSize="10">
              {t(item.label)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(L.figCap)}</figcaption>
    </figure>
  )
}
