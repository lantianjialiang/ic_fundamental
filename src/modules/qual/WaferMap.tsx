import { useMemo } from 'react'
import { type Die, type WaferMap as WaferMapData } from './core/wafer'
import './wafer.css'

type Props = {
  wafer: WaferMapData
  /** 每颗 die 的背景色（CSS 颜色） */
  colorOf: (die: Die) => string
  /** 选中的 die id，没有则为 null */
  selected: number | null
  onPick: (id: number) => void
  /** 整片晶圆的文字替代（读数摘要），已翻译好 */
  summary: string
  /** 无障碍名称，已翻译好 */
  ariaLabel: string
  /** 每颗 die 的无障碍描述（如坐标与参数），由调用方翻译 */
  dieLabel: (die: Die) => string
}

/**
 * 晶圆图（REL-07 / REL-08 共用）。
 * 用 CSS 网格排列按钮：每颗 die 都能用 Tab 聚焦、用 Enter 选中，并带文字描述；
 * 圆外的格子是空的占位，不参与键盘导航。
 */
export function WaferMap({ wafer, colorOf, selected, onPick, summary, ariaLabel, dieLabel }: Props) {
  const grid = useMemo(() => {
    const d = wafer.diameterDie
    const cells: Array<Die | null> = new Array(d * d).fill(null)
    for (const die of wafer.dies) {
      cells[die.row * d + die.col] = die
    }
    return cells
  }, [wafer])

  return (
    <div className="wafer">
      <div className="wafer__grid" role="group" aria-label={ariaLabel} style={{ gridTemplateColumns: `repeat(${wafer.diameterDie}, 1fr)` }}>
        {grid.map((die, index) =>
          die === null ? (
            <span key={index} className="wafer__empty" aria-hidden="true" />
          ) : (
            <button
              key={index}
              type="button"
              className={`wafer__die${selected === die.id ? ' is-sel' : ''}`}
              style={{ background: colorOf(die) }}
              aria-label={dieLabel(die)}
              aria-pressed={selected === die.id}
              onClick={() => onPick(die.id)}
            />
          ),
        )}
      </div>
      <p className="wafer__summary">{summary}</p>
    </div>
  )
}
