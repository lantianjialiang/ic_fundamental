import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './memBinData'
import { type BitMap, GRID } from './memBinModel'

const CELL = 18
const PAD = 26
const SIZE = PAD * 2 + CELL * GRID

/** 行列号只在每隔 4 格的位置标出，避免文字挤在一起 */
const TICKS = [0, 4, 8, 12]

/** 16×16 失效位图：红色为失效位，其余为通过位 */
export function MemBinFig({ map }: { map: BitMap }) {
  const { t } = useLocale()
  const cells: ReactNode[] = []
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      const failed = map.fails[row * GRID + col] === 1
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={PAD + col * CELL + 1}
          y={PAD + row * CELL + 1}
          width={CELL - 2}
          height={CELL - 2}
          rx="2"
          fill={failed ? 'var(--red)' : 'var(--fig-box)'}
          stroke={failed ? 'none' : 'var(--line-2)'}
        />,
      )
    }
  }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="term-fig__svg" role="img" aria-label={t(FIG.mapAria)}>
        <rect width={SIZE} height={SIZE} rx="10" fill="var(--well)" />
        {cells}
        {TICKS.map((idx) => (
          <text
            key={`r${idx}`}
            x={PAD - 6}
            y={PAD + idx * CELL + CELL / 2 + 3}
            textAnchor="end"
            fill="var(--muted)"
            fontSize="9"
            fontFamily="var(--mono)"
          >
            {idx}
          </text>
        ))}
        {TICKS.map((idx) => (
          <text
            key={`c${idx}`}
            x={PAD + idx * CELL + CELL / 2}
            y={PAD - 8}
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="9"
            fontFamily="var(--mono)"
          >
            {idx}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.mapCap)}</figcaption>
    </figure>
  )
}
