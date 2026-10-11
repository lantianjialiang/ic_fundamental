import { useLocale } from '../../i18n/LocaleContext'
import { FREQS, L, SPEC, VOLTS, cellKind, fmaxAt, inSpec, isPass, type ChipModel } from './data/content'

export type Cell = { v: number; f: number }

const LEFT = 64
/** 顶部留一条标注带，放「空洞」标签和模型公式 */
const TOP = 40
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

/** 一组格子键（`${v}|${f}`）的外框，没有格子时返回 null */
function bbox(keys: string[]) {
  if (keys.length === 0) return null
  const pts = keys.map((k) => {
    const [v, f] = k.split('|').map(Number)
    return { x: fx(f), y: vy(v) }
  })
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return {
    x0: Math.min(...xs) - CW / 2,
    x1: Math.max(...xs) + CW / 2,
    y0: Math.min(...ys) - CH / 2,
    y1: Math.max(...ys) + CH / 2,
  }
}

/** 文字描一圈底色，压在格子上也能看清 */
const halo = { stroke: 'var(--well)', strokeWidth: 4, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const }

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
  const holeBox = bbox(chip.holes)
  const islandBox = bbox(chip.islands)

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
              const specFail = !pass && spec
              const island = kind === 'island'
              let fill = 'var(--fig-box-2)'
              let stroke = 'var(--line-soft)'
              let sw = 1
              if (island) {
                fill = 'var(--orange-bg)'
                stroke = 'var(--gold)'
                sw = 2
              } else if (pass) {
                fill = 'var(--green-bg)'
                stroke = 'var(--green-line)'
              } else if (specFail) {
                fill = 'var(--red)'
                stroke = 'var(--red-2)'
                sw = 1.5
              }
              const cx = fx(f)
              const cy = vy(v)
              return (
                <g key={f}>
                  <rect
                    className="m14-cell"
                    x={cx - CW / 2 + 1}
                    y={cy - CH / 2 + 1}
                    width={CW - 2}
                    height={CH - 2}
                    rx="2"
                    fill={fill}
                    stroke={isActive ? 'var(--text)' : stroke}
                    strokeWidth={isActive ? 2.5 : sw}
                    onClick={() => onPick({ v, f })}
                  />
                  {specFail ? (
                    <path
                      d={`M${cx - 5} ${cy - 5} L${cx + 5} ${cy + 5} M${cx + 5} ${cy - 5} L${cx - 5} ${cy + 5}`}
                      stroke="var(--card)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      pointerEvents="none"
                    />
                  ) : null}
                  {island ? <circle cx={cx} cy={cy} r="3.2" fill="var(--gold)" pointerEvents="none" /> : null}
                </g>
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
        <text x={LEFT + 4} y={vminY + 13} fill="var(--text-2)" fontSize="10" pointerEvents="none" {...halo}>
          {`${t(L.vminLine)} ≈ ${chip.vmin.toFixed(2)} V`}
        </text>
        <text x={LEFT + PLOT_W} y={TOP - 14} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)" pointerEvents="none">
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
        <text x={specX1 - 4} y={specY0 - 4} textAnchor="end" fill="var(--gold)" fontSize="11" fontWeight="600" pointerEvents="none" {...halo}>
          {t(L.spec)}
        </text>

        {/* 空洞标注：标签在顶部标注带，引线垂直落到空洞上沿 */}
        {holeBox ? (
          <g pointerEvents="none">
            <rect
              x={holeBox.x0 - 1}
              y={holeBox.y0 - 1}
              width={holeBox.x1 - holeBox.x0 + 2}
              height={holeBox.y1 - holeBox.y0 + 2}
              rx="3"
              fill="none"
              stroke="var(--red)"
              strokeWidth="2"
            />
            <line x1={(holeBox.x0 + holeBox.x1) / 2} y1={TOP - 10} x2={(holeBox.x0 + holeBox.x1) / 2} y2={holeBox.y0 - 1} stroke="var(--red)" strokeWidth="1.5" />
            <text x={(holeBox.x0 + holeBox.x1) / 2} y={TOP - 14} textAnchor="middle" fill="var(--red)" fontSize="11" fontWeight="600">
              {t(L.noteHole)}
            </text>
          </g>
        ) : null}

        {/* 孤岛标注：标签放在右下角全 Fail 区，引线从孤岛下沿斜下去 */}
        {islandBox ? (
          <g pointerEvents="none">
            <rect
              x={islandBox.x0 - 1}
              y={islandBox.y0 - 1}
              width={islandBox.x1 - islandBox.x0 + 2}
              height={islandBox.y1 - islandBox.y0 + 2}
              rx="3"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <line
              x1={(islandBox.x0 + islandBox.x1) / 2}
              y1={islandBox.y1 + 1}
              x2={(islandBox.x0 + islandBox.x1) / 2 + 14}
              y2={TOP + PLOT_H - 22}
              stroke="var(--gold)"
              strokeWidth="1.5"
            />
            <text x={672} y={TOP + PLOT_H - 10} textAnchor="end" fill="var(--gold)" fontSize="11" fontWeight="600" {...halo}>
              {t(L.noteIsland)}
            </text>
          </g>
        ) : null}

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
        <text x={8} y={TOP - 14} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(L.axisV)}
        </text>

        {/* 图例：英文标签较长，按各自宽度手排横坐标 */}
        {[
          { dx: 0, label: L.legendPass, fill: 'var(--green-bg)', stroke: 'var(--green-line)', mark: '' },
          { dx: 80, label: L.legendFail, fill: 'var(--fig-box-2)', stroke: 'var(--line-soft)', mark: '' },
          { dx: 160, label: L.legendBad, fill: 'var(--red)', stroke: 'var(--red-2)', mark: 'x' },
          { dx: 350, label: L.legendIsland, fill: 'var(--orange-bg)', stroke: 'var(--gold)', mark: 'dot' },
        ].map((item) => (
          <g key={item.dx} transform={`translate(${LEFT + item.dx}, ${TOP + PLOT_H + 42})`}>
            <rect width="16" height="11" rx="2" fill={item.fill} stroke={item.stroke} strokeWidth={item.mark ? 1.5 : 1} />
            {item.mark === 'x' ? <path d="M5 2.5 L11 8.5 M11 2.5 L5 8.5" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" /> : null}
            {item.mark === 'dot' ? <circle cx="8" cy="5.5" r="2.4" fill="var(--gold)" /> : null}
            <text x="22" y="10" fill="var(--text-2)" fontSize="10">
              {t(item.label)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(L.figCap)}</figcaption>
    </figure>
  )
}
