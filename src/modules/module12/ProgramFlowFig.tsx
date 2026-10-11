import { useLocale } from '../../i18n/LocaleContext'
import { L, TESTS, type FlowFrame } from './data/content'

const NODE_W = 80
const NODE_H = 44
const ROW_Y = 64
const BIN_Y = 160
const BIN_H = 50
const nodeX = (i: number) => 14 + i * 94
const LAST = TESTS.length + 1

/** 芯片图标的位置：上排节点上方，或某个 Fail Bin 下方 */
function chipPos(frame: FlowFrame) {
  if (frame.at === 'start') return { x: nodeX(0) + NODE_W / 2, y: 38 }
  if (frame.at === 'test') return { x: nodeX(frame.i + 1) + NODE_W / 2, y: 38 }
  if (frame.from === null) return { x: nodeX(LAST) + NODE_W / 2, y: 38 }
  return { x: nodeX(frame.from + 1) + NODE_W / 2, y: BIN_Y + BIN_H + 22 }
}

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const horiz = y1 === y2
  const head = horiz ? `M${x2} ${y2} l-7 -4 v8 z` : `M${x2} ${y2} l-4 -7 h8 z`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.6" />
      <path d={head} fill={color} />
    </g>
  )
}

export function ProgramFlowFig({ frame, frames }: { frame: FlowFrame; frames: FlowFrame[] }) {
  const { t } = useLocale()
  const stepIdx = frames.indexOf(frame)
  // 已经测过的项和结果
  const done = new Map<number, boolean>()
  frames.slice(0, stepIdx + 1).forEach((f) => {
    if (f.at === 'test') done.set(f.i, f.pass)
  })
  const cur = frame.at === 'test' ? frame.i : -1
  const landed = frame.at === 'bin' ? frame.from : undefined
  const chip = chipPos(frame)
  const chipStroke =
    frame.at === 'bin' ? (frame.from === null ? 'var(--green)' : 'var(--red)') : frame.at === 'test' && !frame.pass ? 'var(--red)' : 'var(--text-2)'

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 280" className="term-fig__svg" role="img" aria-label={t(L.flowCap)}>
        <rect width="680" height="280" rx="10" fill="var(--well)" />

        {/* 装片 */}
        <rect x={nodeX(0)} y={ROW_Y} width={NODE_W} height={NODE_H} rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x={nodeX(0) + NODE_W / 2} y={ROW_Y + 27} textAnchor="middle" fill="var(--text-2)" fontSize="12">
          {t(L.start)}
        </text>

        {TESTS.map((item, i) => {
          const x = nodeX(i + 1)
          const cx = x + NODE_W / 2
          const res = done.get(i)
          const isCur = cur === i
          const stroke = isCur ? 'var(--gold)' : res === true ? 'var(--green-line)' : res === false ? 'var(--red)' : 'var(--line-2)'
          const fill = res === true ? 'var(--green-bg)' : res === false ? 'var(--red-bg)' : 'var(--fig-box)'
          const binHit = landed === i
          return (
            <g key={item.id}>
              <Arrow x1={nodeX(i) + NODE_W} y1={ROW_Y + NODE_H / 2} x2={x} y2={ROW_Y + NODE_H / 2} color={res !== undefined ? 'var(--green)' : 'var(--line-2)'} />
              <rect x={x} y={ROW_Y} width={NODE_W} height={NODE_H} rx="8" fill={fill} stroke={stroke} strokeWidth={isCur ? 2.5 : 1.5} />
              <text x={cx} y={ROW_Y + 19} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="var(--mono)">
                {item.short}
              </text>
              <text x={cx} y={ROW_Y + 35} textAnchor="middle" fill="var(--muted)" fontSize="10">
                {t(item.name)}
              </text>
              {/* Fail 分支 */}
              <Arrow x1={cx} y1={ROW_Y + NODE_H} x2={cx} y2={BIN_Y} color={res === false ? 'var(--red)' : 'var(--line-2)'} />
              <text x={cx + 5} y={ROW_Y + NODE_H + 28} fill={res === false ? 'var(--red)' : 'var(--dim)'} fontSize="10">
                {t(L.failWord)}
              </text>
              <rect
                x={x + 8}
                y={BIN_Y}
                width={NODE_W - 16}
                height={BIN_H}
                rx="6"
                fill={binHit ? 'var(--red-bg)' : 'var(--fig-box-2)'}
                stroke={binHit ? 'var(--red)' : 'var(--line-2)'}
                strokeWidth={binHit ? 2 : 1}
              />
              <text x={cx} y={BIN_Y + 30} textAnchor="middle" fill={binHit ? 'var(--red)' : 'var(--text-2)'} fontSize="12" fontFamily="var(--mono)">
                {`Bin ${item.bin}`}
              </text>
            </g>
          )
        })}

        {/* Bin 1 */}
        <Arrow
          x1={nodeX(LAST - 1) + NODE_W}
          y1={ROW_Y + NODE_H / 2}
          x2={nodeX(LAST)}
          y2={ROW_Y + NODE_H / 2}
          color={landed === null ? 'var(--green)' : 'var(--line-2)'}
        />
        <rect
          x={nodeX(LAST)}
          y={ROW_Y}
          width={NODE_W}
          height={NODE_H}
          rx="8"
          fill={landed === null ? 'var(--green-bg)' : 'var(--fig-box)'}
          stroke={landed === null ? 'var(--green)' : 'var(--green-line)'}
          strokeWidth={landed === null ? 2.5 : 1.5}
        />
        <text x={nodeX(LAST) + NODE_W / 2} y={ROW_Y + 19} textAnchor="middle" fill="var(--green)" fontSize="13" fontFamily="var(--mono)">
          Bin 1
        </text>
        <text x={nodeX(LAST) + NODE_W / 2} y={ROW_Y + 35} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.good)}
        </text>

        {/* 芯片 */}
        <g className="m12-chip" style={{ transform: `translate(${chip.x}px, ${chip.y}px)` }}>
          {[-10, -3, 4, 11].map((dx) => (
            <g key={dx}>
              <line x1={dx} y1={-15} x2={dx} y2={-11} stroke="var(--muted)" strokeWidth="1.5" />
              <line x1={dx} y1={11} x2={dx} y2={15} stroke="var(--muted)" strokeWidth="1.5" />
            </g>
          ))}
          <rect x={-17} y={-11} width={34} height={22} rx="3" fill="var(--card)" stroke={chipStroke} strokeWidth="2" />
          <text x={0} y={4} textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="var(--mono)">
            DUT
          </text>
        </g>
      </svg>
      <figcaption>{t(L.flowCap)}</figcaption>
    </figure>
  )
}
