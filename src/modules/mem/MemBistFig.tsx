import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './memBistData'
import { type BistResult, COLS, ROWS } from './memBistModel'

const W = 480
const H = 268
/** 单元格的间距与边长（SVG 单位） */
const PITCH = 13
const CELL = 11
const Y0 = 50
const X_LEFT = 70
const X_RIGHT = 300

type Tone = 'dim' | 'red' | 'green' | 'blue'

const FILL: Record<Tone, string> = {
  dim: 'var(--fig-box)',
  red: 'var(--red)',
  green: 'var(--green)',
  blue: 'var(--blue)',
}

function Grid({
  x0,
  title,
  toneOf,
  repairedRows,
  repairedCols,
}: {
  x0: number
  title: string
  toneOf: (row: number, col: number) => Tone
  repairedRows: Set<number>
  repairedCols: Set<number>
}) {
  const rects: ReactNode[] = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tone = toneOf(row, col)
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={x0 + col * PITCH}
          y={Y0 + row * PITCH}
          width={CELL}
          height={CELL}
          rx="2"
          fill={FILL[tone]}
          stroke={tone === 'dim' ? 'var(--line-2)' : 'none'}
          strokeWidth="0.5"
        />,
      )
    }
  }
  const colLabels: ReactNode[] = []
  for (let col = 0; col < COLS; col += 1) {
    colLabels.push(
      <text
        key={`c${col}`}
        x={x0 + col * PITCH + CELL / 2}
        y={Y0 - 6}
        textAnchor="middle"
        fill={repairedCols.has(col) ? 'var(--green)' : 'var(--muted)'}
        fontSize="9"
        fontFamily="var(--mono)"
      >
        {col}
      </text>,
    )
  }
  const rowLabels: ReactNode[] = []
  for (let row = 0; row < ROWS; row += 1) {
    rowLabels.push(
      <text
        key={`r${row}`}
        x={x0 - 6}
        y={Y0 + row * PITCH + CELL - 2}
        textAnchor="end"
        fill={repairedRows.has(row) ? 'var(--green)' : 'var(--muted)'}
        fontSize="9"
        fontFamily="var(--mono)"
      >
        {row}
      </text>,
    )
  }
  return (
    <g>
      <text x={x0 - 6} y={18} fill="var(--text)" fontSize="11">
        {title}
      </text>
      {colLabels}
      {rowLabels}
      {rects}
    </g>
  )
}

/** 两张阵列图：左边是 BIST 查出的失效位，右边是修复 + ECC 之后的结果 */
export function MemBistFig({ result }: { result: BistResult }) {
  const { t } = useLocale()
  const rawKeys = new Set(result.raw.map((c) => c.row * COLS + c.col))
  const residualKeys = new Set(result.residual.map((c) => c.row * COLS + c.col))
  const wordBits = new Map(result.words.map((w) => [w.row, w.bits]))
  const repairedRows = new Set(result.plan.rows)
  const repairedCols = new Set(result.plan.cols)

  const rawTone = (row: number, col: number): Tone => (rawKeys.has(row * COLS + col) ? 'red' : 'dim')

  const afterTone = (row: number, col: number): Tone => {
    const key = row * COLS + col
    if (residualKeys.has(key)) {
      if (result.ecc && wordBits.get(row) === 1) {
        return 'blue'
      }
      return 'red'
    }
    if (rawKeys.has(key)) {
      return 'green'
    }
    return 'dim'
  }

  return (
    <figure className="term-fig mbist-fig">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="term-fig__svg"
        role="img"
        aria-label={t(FIG.pairAria)}
      >
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <Grid x0={X_LEFT} title={t(FIG.rawTitle)} toneOf={rawTone} repairedRows={new Set()} repairedCols={new Set()} />
        <Grid x0={X_RIGHT} title={t(FIG.afterTitle)} toneOf={afterTone} repairedRows={repairedRows} repairedCols={repairedCols} />
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
