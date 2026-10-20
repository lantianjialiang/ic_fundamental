import { useLocale } from '../../i18n/LocaleContext'
import { type Access } from './core/array'
import { FIG, accessTag } from './rwData'
import { type Level, type Slot } from './rwModel'

const VW = 560
const VH = 292
const X0 = 96
const X1 = 548
const SLOT_W = (X1 - X0) / 12
const SLOT_PER_ACCESS = 4
const BUS_HI = 4
const BUS_LO = 32
const DIG_HI = 6
const DIG_LO = 30
const TOP = { cs: 58, we: 104, oe: 150, addr: 196, data: 242 }

const xOf = (i: number) => X0 + i * SLOT_W

/** 数字线：低电平为 LO，高电平为 HI；未执行的时隙变淡 */
function Digital({ label, levels, top, executed }: { label: string; levels: Level[]; top: number; executed: number }) {
  const y = (level: Level) => top + (level === 1 ? DIG_HI : DIG_LO)
  return (
    <g>
      <text x={8} y={top + 20} fill="var(--text-2)" fontSize="12" fontFamily="monospace">
        {label}
      </text>
      {levels.map((level, i) => {
        const a = xOf(i)
        const b = xOf(i + 1)
        const prev = i === 0 ? level : levels[i - 1]
        return (
          <g key={i} opacity={i < executed ? 1 : 0.25}>
            {i > 0 && prev !== level ? <line x1={a} y1={y(prev)} x2={a} y2={y(level)} stroke="var(--sky)" strokeWidth="2" /> : null}
            <line x1={a} y1={y(level)} x2={b} y2={y(level)} stroke="var(--sky)" strokeWidth="2" />
          </g>
        )
      })}
    </g>
  )
}

/** 总线上一个时隙的形状；busy 为过渡区，z 为高阻（虚线），drive / out 为有效数据（六边形） */
function BusSlot({ slot, index, label, fill, stroke, executed }: { slot: Slot; index: number; label: string; fill: string; stroke: string; executed: number }) {
  const a = xOf(index) + 2
  const b = xOf(index + 1) - 2
  const hi = TOP.data + BUS_HI
  const lo = TOP.data + BUS_LO
  const mid = (hi + lo) / 2
  const s = 4
  const shape = `M${a} ${mid} L${a + s} ${hi} L${b - s} ${hi} L${b} ${mid} L${b - s} ${lo} L${a + s} ${lo} Z`
  const data = slot.data
  return (
    <g opacity={index < executed ? 1 : 0.25}>
      {data.kind === 'z' ? <line x1={a} y1={mid} x2={b} y2={mid} stroke="var(--muted)" strokeWidth="2" strokeDasharray="4 4" /> : null}
      {data.kind === 'busy' ? <rect x={a} y={hi} width={b - a} height={lo - hi} fill="url(#mrw-hatch)" stroke="var(--line-2)" /> : null}
      {data.kind === 'drive' || data.kind === 'out' ? (
        <>
          <path d={shape} fill={fill} stroke={stroke} strokeWidth="1.5" />
          <text x={(a + b) / 2} y={mid + 4} textAnchor="middle" fill="var(--text)" fontSize="12">
            {label}
          </text>
        </>
      ) : null}
    </g>
  )
}

export function RwFig({ slots, seq, executed }: { slots: Slot[]; seq: Access[]; executed: number }) {
  const { t } = useLocale()
  const levelsOf = (pick: (s: Slot) => Level) => slots.map(pick)
  const cursorX = executed > 0 ? xOf(executed - 1) + SLOT_W / 2 : null

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />
        <defs>
          <pattern id="mrw-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-2)" strokeWidth="2" />
          </pattern>
        </defs>

        {seq.map((acc, k) => (
          <text key={`tag-${k}`} x={xOf(k * SLOT_PER_ACCESS) + 4} y={20} fill="var(--text-2)" fontSize="11">
            {t(accessTag(acc, k))}
          </text>
        ))}
        {Array.from({ length: slots.length }, (_, i) => (
          <text key={`ph-${i}`} x={xOf(i) + SLOT_W / 2} y={46} textAnchor="middle" fill="var(--dim)" fontSize="10">
            {slots[i].phase + 1}
          </text>
        ))}
        {seq.map((_, k) =>
          k > 0 ? (
            <line
              key={`sep-${k}`}
              x1={xOf(k * SLOT_PER_ACCESS)}
              y1={28}
              x2={xOf(k * SLOT_PER_ACCESS)}
              y2={VH - 10}
              stroke="var(--line-2)"
              strokeDasharray="3 3"
            />
          ) : null,
        )}

        <Digital label="CS#" levels={levelsOf((s) => s.cs)} top={TOP.cs} executed={executed} />
        <Digital label="WE#" levels={levelsOf((s) => s.we)} top={TOP.we} executed={executed} />
        <Digital label="OE#" levels={levelsOf((s) => s.oe)} top={TOP.oe} executed={executed} />

        <text x={8} y={TOP.addr + 20} fill="var(--text-2)" fontSize="12" fontFamily="monospace">
          ADDR
        </text>
        {slots.map((slot, i) => (
          <g key={`addr-${i}`} opacity={i < executed ? 1 : 0.25}>
            <path
              d={`M${xOf(i) + 2} ${TOP.addr + BUS_HI + (BUS_LO - BUS_HI) / 2} L${xOf(i) + 6} ${TOP.addr + BUS_HI} L${xOf(i + 1) - 6} ${TOP.addr + BUS_HI} L${xOf(i + 1) - 2} ${TOP.addr + BUS_HI + (BUS_LO - BUS_HI) / 2} L${xOf(i + 1) - 6} ${TOP.addr + BUS_LO} L${xOf(i) + 6} ${TOP.addr + BUS_LO} Z`}
              fill="var(--fig-box)"
              stroke="var(--line-2)"
              strokeWidth="1.2"
            />
            <text
              x={(xOf(i) + xOf(i + 1)) / 2}
              y={TOP.addr + (BUS_HI + BUS_LO) / 2 + 4}
              textAnchor="middle"
              fill="var(--text-2)"
              fontSize="11"
            >
              {slot.addr}
            </text>
          </g>
        ))}

        <text x={8} y={TOP.data + 20} fill="var(--text-2)" fontSize="12" fontFamily="monospace">
          DATA
        </text>
        {slots.map((slot, i) => {
          const data = slot.data
          let value = ''
          if (data.kind === 'drive' || data.kind === 'out') {
            value = String(data.value)
          }
          const isDrive = data.kind === 'drive'
          return (
            <BusSlot
              key={`data-${i}`}
              slot={slot}
              index={i}
              label={value}
              fill={isDrive ? 'rgba(88, 166, 255, 0.18)' : 'var(--green-bg)'}
              stroke={isDrive ? 'var(--sky)' : 'var(--green)'}
              executed={executed}
            />
          )
        })}

        {cursorX === null ? null : (
          <line x1={cursorX} y1={30} x2={cursorX} y2={VH - 8} stroke="var(--gold)" strokeWidth="1.5" />
        )}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
