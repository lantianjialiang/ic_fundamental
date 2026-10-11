import { useRef, useState, type PointerEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AC_SPAN, type AcKind } from './data/char'

const L = {
  ref: loc('参考沿', 'Ref edge'),
  res: loc('搜索结果', 'Search result'),
  valid: loc('有效', 'Valid'),
  drag: loc('拖动圆点', 'Drag the dots'),
  cap: loc('蓝色是参考沿（程序里设定，固定），金色是搜索移动的那条沿。拖下面的圆点改变它们的位置。', 'Blue is the reference edge (set in the program, fixed); gold is the edge the search moves. Drag the dots below to change their positions.'),
  shCap: loc('Y 轴 VDD 从上到下 5.5 → 3.5 V；X 轴 VIL 从左到右 2.0 → 0 V。悬停或点击格子看坐标。', 'Y axis: VDD 5.5 → 3.5 V from top to bottom; X axis: VIL 2.0 → 0 V from left to right. Hover or click a cell to see its coordinates.'),
}

const X0 = 90
const X1 = 650

type Which = 'ref' | 'res'

export function AcCalcFig({
  kind,
  refT,
  resT,
  onChange,
}: {
  kind: AcKind
  refT: number
  resT: number
  onChange: (which: Which, ns: number) => void
}) {
  const { t } = useLocale()
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<Which | null>(null)
  const x = (ns: number) => X0 + (ns / AC_SPAN) * (X1 - X0)

  const toNs = (clientX: number) => {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box) return 0
    const vx = ((clientX - box.left) / box.width) * 680
    const ns = ((vx - X0) / (X1 - X0)) * AC_SPAN
    return Math.max(0, Math.min(AC_SPAN, Math.round(ns * 2) / 2))
  }

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (drag) onChange(drag, toNs(event.clientX))
  }

  const startDrag = (which: Which) => (event: PointerEvent<SVGGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(which)
  }

  const top1 = 40
  const top2 = 100
  const h = 26
  const blue = 'var(--blue)'
  const gold = 'var(--gold)'

  // 第一行：时钟或输入
  const row1Name = kind === 'tpd' ? 'IN' : 'CLK'
  const row1 =
    kind === 'tpd'
      ? `M${x(0)} ${top1 + h} L${x(refT)} ${top1 + h} L${x(refT)} ${top1} L${x(AC_SPAN)} ${top1}`
      : `M${x(0)} ${top1 + h} L${x(refT)} ${top1 + h} L${x(refT)} ${top1} L${x(Math.min(AC_SPAN, refT + 25))} ${top1} L${x(
          Math.min(AC_SPAN, refT + 25),
        )} ${top1 + h} L${x(AC_SPAN)} ${top1 + h}`

  // 第二行：数据总线或输出
  let validA = 0
  let validB = 0
  if (kind === 'setup') {
    validA = resT
    validB = Math.max(resT + 2, refT + 20)
  } else if (kind === 'hold') {
    validA = Math.min(resT - 2, refT - 25)
    validB = resT
  }
  const mid2 = top2 + h / 2
  const bus = (a: number, b: number) => {
    const xa = x(Math.max(0, a))
    const xb = x(Math.min(AC_SPAN, b))
    return `M${xa} ${mid2} L${xa + 5} ${top2} L${xb - 5} ${top2} L${xb} ${mid2} L${xb - 5} ${top2 + h} L${xa + 5} ${top2 + h} Z`
  }

  const value = kind === 'setup' ? refT - resT : resT - refT
  const arrowY = 160
  const a = Math.min(refT, resT)
  const b = Math.max(refT, resT)

  return (
    <figure className="term-fig">
      <svg
        ref={svgRef}
        viewBox="0 0 680 210"
        className="term-fig__svg char-drag"
        role="img"
        aria-label={t(L.cap)}
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <rect width="680" height="210" rx="10" fill="var(--well)" />
        {[0, 20, 40, 60, 80, 100].map((ns) => (
          <g key={ns}>
            <line x1={x(ns)} y1={22} x2={x(ns)} y2={146} stroke="var(--line-soft)" />
            <text x={x(ns)} y={16} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
              {ns === 0 ? 'T0' : `${ns}`}
            </text>
          </g>
        ))}
        <text x={14} y={top1 + 18} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {row1Name}
        </text>
        <path d={row1} fill="none" stroke="var(--sky)" strokeWidth="2" />
        <line x1={x(refT)} y1={top1} x2={x(refT)} y2={top1 + h} stroke={blue} strokeWidth="3.5" />

        <text x={14} y={top2 + 18} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {kind === 'tpd' ? 'OUT' : 'DATA'}
        </text>
        {kind === 'tpd' ? (
          <>
            <path
              d={`M${x(0)} ${top2 + h} L${x(resT)} ${top2 + h} L${x(resT)} ${top2} L${x(AC_SPAN)} ${top2}`}
              fill="none"
              stroke="var(--green)"
              strokeWidth="2"
            />
            <line x1={x(resT)} y1={top2 - 10} x2={x(resT)} y2={top2 + h + 8} stroke={gold} strokeWidth="2.5" />
            <text x={x(resT) + 5} y={top2 - 2} fill={gold} fontSize="11" fontFamily="var(--mono)">
              Strobe
            </text>
          </>
        ) : (
          <>
            <line x1={x(0)} y1={mid2} x2={x(AC_SPAN)} y2={mid2} stroke="var(--line-2)" strokeDasharray="3 4" />
            <path d={bus(validA, validB)} fill="var(--blue-bg)" stroke="var(--sky)" strokeWidth="1.5" />
            <text x={(x(Math.max(0, validA)) + x(Math.min(AC_SPAN, validB))) / 2} y={mid2 + 4} textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(L.valid)}
            </text>
            <line
              x1={x(resT)}
              y1={top2 - 4}
              x2={x(resT)}
              y2={top2 + h + 4}
              stroke={gold}
              strokeWidth="3.5"
            />
          </>
        )}

        {/* 两条沿的垂直参考线 */}
        <line x1={x(refT)} y1={24} x2={x(refT)} y2={arrowY + 6} stroke={blue} strokeDasharray="4 4" strokeOpacity="0.7" />
        <line x1={x(resT)} y1={24} x2={x(resT)} y2={arrowY + 6} stroke={gold} strokeDasharray="4 4" strokeOpacity="0.7" />

        {/* 结果箭头 */}
        {b - a > 0.01 ? (
          <>
            <line x1={x(a)} y1={arrowY} x2={x(b)} y2={arrowY} stroke="var(--text-2)" strokeWidth="1.5" />
            <path d={`M${x(a)} ${arrowY} l6 -4 l0 8 Z`} fill="var(--text-2)" />
            <path d={`M${x(b)} ${arrowY} l-6 -4 l0 8 Z`} fill="var(--text-2)" />
          </>
        ) : null}
        <text
          x={(x(a) + x(b)) / 2}
          y={arrowY - 6}
          textAnchor="middle"
          fill={value < 0 ? 'var(--red)' : 'var(--text)'}
          fontSize="12"
          fontFamily="var(--mono)"
        >
          {`${kind === 'tpd' ? 'tPD' : kind === 'setup' ? 'Setup' : 'Hold'} = ${value.toFixed(1)} ns`}
        </text>

        {/* 拖动把手 */}
        <line x1={x(0)} y1={186} x2={x(AC_SPAN)} y2={186} stroke="var(--line)" />
        <g className="char-drag__handle" onPointerDown={startDrag('ref')}>
          <circle cx={x(refT)} cy={186} r={9} fill="var(--blue-bg)" stroke={blue} strokeWidth="2" />
          <text x={x(refT)} y={204} textAnchor="middle" fill={blue} fontSize="10">
            {t(L.ref)}
          </text>
        </g>
        <g className="char-drag__handle" onPointerDown={startDrag('res')}>
          <circle cx={x(resT)} cy={186} r={9} fill="var(--gold-bg)" stroke={gold} strokeWidth="2" />
          <text x={x(resT)} y={204} textAnchor="middle" fill={gold} fontSize="10">
            {t(L.res)}
          </text>
        </g>
        <text x={672} y={180} textAnchor="end" fill="var(--dim)" fontSize="10">
          {t(L.drag)}
        </text>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}

export type Cell = { r: number; c: number }

export function ShmooFig({
  vdds,
  vils,
  grid,
  filled,
  charView,
  warnRows,
  hover,
  onHover,
}: {
  vdds: number[]
  vils: number[]
  grid: boolean[][]
  filled: number
  charView: boolean
  warnRows: boolean[]
  hover: Cell | null
  onHover: (cell: Cell | null) => void
}) {
  const { t } = useLocale()
  const cols = vils.length
  const left = 70
  const top = 16
  const cw = 580 / cols
  const ch = 13
  const height = top + vdds.length * ch + 44
  const cursor = filled < vdds.length * cols ? filled : -1

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.shCap)} onMouseLeave={() => onHover(null)}>
        <rect width="680" height={height} rx="10" fill="var(--well)" />
        {vdds.map((vdd, r) => {
          const y = top + r * ch
          return (
            <g key={vdd}>
              {warnRows[r] ? <rect x={4} y={y} width={left - 10} height={ch} fill="var(--red-bg)" /> : null}
              <text
                x={left - 8}
                y={y + ch - 3}
                textAnchor="end"
                fill={warnRows[r] ? 'var(--red)' : 'var(--text-2)'}
                fontSize="9.5"
                fontFamily="var(--mono)"
              >
                {vdd.toFixed(1)}
              </text>
              {vils.map((vil, c) => {
                const idx = r * cols + c
                const done = idx < filled
                const pass = grid[r][c]
                const cx = left + c * cw
                let fill = 'var(--fig-box)'
                let op = 0.35
                if (done && !charView) {
                  fill = pass ? 'var(--green)' : 'var(--fig-box-2)'
                  op = pass ? 0.6 : 0.9
                } else if (done) {
                  op = 0.15
                }
                return (
                  <g key={vil} onMouseEnter={() => onHover({ r, c })} onClick={() => onHover({ r, c })}>
                    <rect x={cx + 0.5} y={y + 0.5} width={cw - 1} height={ch - 1} fill={fill} opacity={op} />
                    {done && charView ? (
                      <text
                        x={cx + cw / 2}
                        y={y + ch - 3}
                        textAnchor="middle"
                        fill={pass ? 'var(--green)' : 'var(--dim)'}
                        fontSize="10"
                        fontFamily="var(--mono)"
                      >
                        {pass ? '$' : '.'}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </g>
          )
        })}
        {cursor >= 0 && filled > 0 ? (
          <rect
            x={left + (cursor % cols) * cw}
            y={top + Math.floor(cursor / cols) * ch}
            width={cw}
            height={ch}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
          />
        ) : null}
        {hover ? (
          <rect
            x={left + hover.c * cw}
            y={top + hover.r * ch}
            width={cw}
            height={ch}
            fill="none"
            stroke="var(--blue)"
            strokeWidth="2"
            pointerEvents="none"
          />
        ) : null}
        {vils.map((vil, c) =>
          Math.abs(vil / 0.4 - Math.round(vil / 0.4)) < 1e-6 ? (
            <text
              key={vil}
              x={left + c * cw + cw / 2}
              y={top + vdds.length * ch + 14}
              textAnchor="middle"
              fill="var(--dim)"
              fontSize="10"
              fontFamily="var(--mono)"
            >
              {vil.toFixed(1)}
            </text>
          ) : null,
        )}
        <text x={left + 290} y={height - 8} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
          {'VIL (V) →'}
        </text>
        <text x={8} y={top - 4} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {'VDD (V)'}
        </text>
      </svg>
      <figcaption>{t(L.shCap)}</figcaption>
    </figure>
  )
}
