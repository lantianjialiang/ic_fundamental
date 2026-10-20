import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './structureData'
import { BANKS, COLS, ROWS, encode, fieldOfBit, type Cell, type Field, type Mapping, type StructureAnalysis } from './structureModel'

const VW = 520
const VH = 316
const CELL = 24
const GRID_Y = 44
/** 两个 Bank 的左上角 x 坐标 */
const GRID_X = [40, 312]
const BIT_X0 = 108
const BIT_STEP = 44
const BIT_W = 40
const BIT_Y = 262

/** 地址位的颜色：Bank（金）、行（蓝）、列（绿） */
const FIELD_FILL: Record<Field, string> = {
  bank: 'rgba(232, 196, 90, 0.30)',
  row: 'rgba(88, 166, 255, 0.30)',
  col: 'rgba(63, 185, 80, 0.30)',
}
const FIELD_TEXT: Record<Field, string> = {
  bank: 'var(--gold)',
  row: 'var(--sky)',
  col: 'var(--green-2)',
}

/** 单元中心的 x / y（SVG 坐标） */
const cx = (bank: number, col: number) => GRID_X[bank] + col * CELL + (CELL - 2) / 2
const cy = (row: number) => GRID_Y + row * CELL + (CELL - 2) / 2

function same(a: Cell, b: Cell) {
  return a.bank === b.bank && a.row === b.row && a.col === b.col
}

export function StructureFig({
  analysis,
  mapping,
  addr,
}: {
  analysis: StructureAnalysis
  mapping: Mapping
  addr: number
}) {
  const { t } = useLocale()
  const cur = analysis.cell
  const next = analysis.next
  const bitsOf = addr.toString(2).padStart(7, '0')
  const fieldLabel: Record<Field, string> = { bank: t(FIG.bank), row: t(FIG.row), col: t(FIG.col) }

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />

        {Array.from({ length: BANKS }, (_, bank) => (
          <g key={`bank-${bank}`}>
            <text x={GRID_X[bank] + (COLS * CELL) / 2} y={18} textAnchor="middle" fill="var(--text-2)" fontSize="12">
              {`${t(FIG.bank)} ${bank}`}
            </text>
            {Array.from({ length: COLS }, (_, col) => (
              <text key={`cl-${col}`} x={cx(bank, col)} y={GRID_Y - 8} textAnchor="middle" fill="var(--dim)" fontSize="10">
                {col}
              </text>
            ))}
            {Array.from({ length: ROWS }, (_, row) => (
              <text key={`rl-${row}`} x={GRID_X[bank] - 6} y={cy(row) + 4} textAnchor="end" fill="var(--dim)" fontSize="10">
                {row}
              </text>
            ))}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const here: Cell = { bank, row, col }
                const isCur = same(here, cur)
                const isNext = next !== null && same(here, next)
                const inBand = bank === cur.bank && (row === cur.row || col === cur.col)
                let fill = 'var(--fig-box)'
                if (isCur) {
                  fill = 'var(--gold)'
                } else if (inBand) {
                  fill = 'rgba(88, 166, 255, 0.22)'
                }
                const x = GRID_X[bank] + col * CELL
                const y = GRID_Y + row * CELL
                return (
                  <g key={`cell-${row}-${col}`}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL - 2}
                      height={CELL - 2}
                      rx="3"
                      fill={fill}
                      stroke={isNext ? 'var(--sky)' : 'none'}
                      strokeWidth={isNext ? 2 : 0}
                      strokeDasharray={isNext ? '3 2' : undefined}
                    />
                    <text
                      x={x + (CELL - 2) / 2}
                      y={y + (CELL - 2) / 2 + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isCur ? '#0d1117' : 'var(--text-2)'}
                    >
                      {encode(here, mapping)}
                    </text>
                  </g>
                )
              }),
            )}
          </g>
        ))}

        {next !== null && next.bank === cur.bank ? (
          <line
            x1={cx(cur.bank, cur.col)}
            y1={cy(cur.row)}
            x2={cx(next.bank, next.col)}
            y2={cy(next.row)}
            stroke="var(--sky)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        ) : null}

        {/* 地址位：颜色表示字段，下方是位号 */}
        {[6, 5, 4, 3, 2, 1, 0].map((bit) => {
          const x = BIT_X0 + (6 - bit) * BIT_STEP
          return (
            <g key={`bit-${bit}`}>
              <rect x={x} y={BIT_Y} width={BIT_W} height={26} rx="4" fill={FIELD_FILL[fieldOfBit(bit, mapping)]} stroke="var(--line-2)" />
              <text x={x + BIT_W / 2} y={BIT_Y + 18} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="monospace">
                {bitsOf[6 - bit]}
              </text>
              <text x={x + BIT_W / 2} y={BIT_Y + 42} textAnchor="middle" fill="var(--dim)" fontSize="10">
                {`a${bit}`}
              </text>
            </g>
          )
        })}
        <text x={BIT_X0 + BIT_W / 2} y={BIT_Y - 6} textAnchor="middle" fill={FIELD_TEXT.bank} fontSize="11">
          {fieldLabel.bank}
        </text>
        <text x={BIT_X0 + 2 * BIT_STEP + BIT_W / 2} y={BIT_Y - 6} textAnchor="middle" fill={FIELD_TEXT[fieldOfBit(5, mapping)]} fontSize="11">
          {fieldLabel[fieldOfBit(5, mapping)]}
        </text>
        <text x={BIT_X0 + 5 * BIT_STEP + BIT_W / 2} y={BIT_Y - 6} textAnchor="middle" fill={FIELD_TEXT[fieldOfBit(2, mapping)]} fontSize="11">
          {fieldLabel[fieldOfBit(2, mapping)]}
        </text>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
