import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Fault } from './core/array'
import { type MarchElement } from './core/march'

const CW = 480
const CH = 132
const X0 = 36
const STEP_X = 52
const CELL_W = 44
const CELL_Y = 58
const CELL_H = 40
const ARROW_Y = 30

export type Mark = { cell: number; text: string; role: 'fault' | 'agg' | 'vic' }

/** 故障在阵列上的标记：SAF / TF 标在单元上；耦合标出侵害（A）与受害（V）；地址故障标出悬空或别名 */
export function marksOf(fault: Fault | null): Mark[] {
  if (fault === null) {
    return []
  }
  if (fault.kind === 'SAF') {
    return [{ cell: fault.cell, text: `SAF${fault.value}`, role: 'fault' }]
  }
  if (fault.kind === 'TF') {
    return [{ cell: fault.cell, text: fault.rising ? 'TF↑' : 'TF↓', role: 'fault' }]
  }
  if (fault.kind === 'CFIN' || fault.kind === 'CFID') {
    return [
      { cell: fault.aggressor, text: 'A', role: 'agg' },
      { cell: fault.victim, text: 'V', role: 'vic' },
    ]
  }
  if (fault.kind === 'AF_NOACCESS') {
    return [{ cell: fault.addr, text: 'AF', role: 'fault' }]
  }
  return [
    { cell: fault.addr, text: 'AF', role: 'fault' },
    { cell: fault.target, text: 'AF', role: 'fault' },
  ]
}

export type CurrentOp = {
  addr: number
  write: boolean
  /** 读操作的比较结果；写操作为 null */
  pass: boolean | null
}

const FIG = {
  aria: loc(
    '8 单元阵列：当前操作的地址高亮，箭头表示元素的地址方向，标签标出注入故障的位置',
    'An 8-cell array: the current address is highlighted, the arrow shows the element’s address direction, and labels mark where the fault is injected',
  ),
  cap: loc(
    '格子是逻辑地址，也是物理单元。A 是侵害单元、V 是受害单元；AF 表示地址故障。蓝色是写，绿色是读出一致，红色是读出不一致。',
    'Cells are logical addresses and also physical cells. A is the aggressor, V the victim, AF an address fault. Blue is a write, green a matching read, red a mismatched read.',
  ),
  up: loc('升序 ⇑', 'ascending ⇑'),
  down: loc('降序 ⇓', 'descending ⇓'),
  any: loc('任意 ⇕（按升序）', 'either ⇕ (ascending)'),
  idle: loc('尚未执行', 'Not started'),
}

/** 阵列图：当前地址高亮，箭头表示方向，故障位置标签 */
export function MarchFig({
  size,
  current,
  order,
  marks,
}: {
  size: number
  current: CurrentOp | null
  order: MarchElement['order'] | null
  marks: Mark[]
}) {
  const { t } = useLocale()
  const cellClass = (index: number): string => {
    if (current === null || current.addr !== index) {
      return 'mem-cell'
    }
    if (current.write) {
      return 'mem-cell is-cur is-w'
    }
    return current.pass === false ? 'mem-cell is-cur is-bad' : 'mem-cell is-cur is-ok'
  }
  const arrowLeft = X0
  const arrowRight = X0 + (size - 1) * STEP_X + CELL_W
  let arrow = null
  if (order === 'up') {
    arrow = (
      <g>
        <line x1={arrowLeft} y1={ARROW_Y} x2={arrowRight} y2={ARROW_Y} className="mem-arrow" />
        <polygon points={`${arrowRight},${ARROW_Y} ${arrowRight - 8},${ARROW_Y - 5} ${arrowRight - 8},${ARROW_Y + 5}`} className="mem-arrow-head" />
      </g>
    )
  } else if (order === 'down') {
    arrow = (
      <g>
        <line x1={arrowRight} y1={ARROW_Y} x2={arrowLeft} y2={ARROW_Y} className="mem-arrow" />
        <polygon points={`${arrowLeft},${ARROW_Y} ${arrowLeft + 8},${ARROW_Y - 5} ${arrowLeft + 8},${ARROW_Y + 5}`} className="mem-arrow-head" />
      </g>
    )
  } else if (order === 'any') {
    arrow = (
      <text x={CW / 2} y={ARROW_Y + 4} textAnchor="middle" className="mem-fig-text">
        {t(FIG.any)}
      </text>
    )
  }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="mem-fig mem-array" role="img" aria-label={t(FIG.aria)}>
        {arrow}
        {Array.from({ length: size }, (_, index) => {
          const x = X0 + index * STEP_X
          const mark = marks.filter((item) => item.cell === index)
          return (
            <g key={index}>
              {mark.map((item, k) => (
                <text key={k} x={x + CELL_W / 2} y={CELL_Y - 8} textAnchor="middle" className={`mem-mark is-${item.role}`}>
                  {item.text}
                </text>
              ))}
              <rect x={x} y={CELL_Y} width={CELL_W} height={CELL_H} rx={6} className={cellClass(index)} />
              <text x={x + CELL_W / 2} y={CELL_Y + CELL_H + 16} textAnchor="middle" className="mem-fig-text">
                {String(index)}
              </text>
            </g>
          )
        })}
        {current === null ? <text x={CW / 2} y={CH - 6} textAnchor="middle" className="mem-fig-muted">{t(FIG.idle)}</text> : null}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
