import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from './common'
import { LEVEL, evalGate, type GateId } from './data/digital'

const L = {
  gateCap: loc('美标（ANSI）画法：与门是 D 形，或门是盾形，小圆圈表示取反。', 'ANSI distinctive shapes: AND is D-shaped, OR is shield-shaped, and a small circle means invert.'),
  adderCap: loc('A、B 各分两路，一路进异或门得到和 S，一路进与门得到进位 C。交叉的线没有圆点，表示不相连。', 'A and B each split two ways: one into the XOR for the sum S, one into the AND for the carry C. Crossing wires without a dot are not connected.'),
  shiftCap: loc('四个 D 触发器共用一根时钟线。每个 Q 接到下一个的 D。', 'Four D flip-flops share one clock line. Each Q feeds the next D.'),
  toggle: loc('点击切换', 'Click to toggle'),
  dataIn: loc('输入', 'Input'),
}

const HI = 'var(--gold)'
const LO = 'var(--line-2)'
const wire = (v: number) => ({ stroke: v ? HI : LO, strokeWidth: v ? 3 : 2, fill: 'none', style: { transition: 'stroke 0.2s' } })

/** 门的外形；x 为左边界，cy 为中心，h 为高度。返回输入端 x 坐标和输出端 x 坐标 */
export function gateGeom(id: GateId, x: number, cy: number, h: number) {
  const w = h * 1.2
  const top = cy - h / 2
  const bottom = cy + h / 2
  const bubble = h * 0.07
  const orBack = (y: number, dx = 0) => {
    const t = (y - top) / h
    return x + dx + 2 * t * (1 - t) * 0.3 * h
  }
  if (id === 'not') {
    const tw = h * 0.8
    return {
      body: `M${x} ${top + h * 0.1} L${x} ${bottom - h * 0.1} L${x + tw} ${cy} Z`,
      extra: '',
      bubble: { cx: x + tw + bubble, r: bubble },
      inX: () => x,
      outX: x + tw + bubble * 2,
    }
  }
  if (id === 'and' || id === 'nand') {
    return {
      body: `M${x} ${top} H${x + w - h / 2} A${h / 2} ${h / 2} 0 0 1 ${x + w - h / 2} ${bottom} H${x} Z`,
      extra: '',
      bubble: id === 'nand' ? { cx: x + w + bubble, r: bubble } : null,
      inX: () => x,
      outX: x + w + (id === 'nand' ? bubble * 2 : 0),
    }
  }
  const body = `M${x} ${top} Q${x + 0.3 * h} ${cy} ${x} ${bottom} Q${x + 0.7 * w} ${bottom} ${x + w} ${cy} Q${x + 0.7 * w} ${top} ${x} ${top} Z`
  const off = -h * 0.14
  return {
    body,
    extra: id === 'xor' ? `M${x + off} ${top} Q${x + off + 0.3 * h} ${cy} ${x + off} ${bottom}` : '',
    bubble: id === 'nor' ? { cx: x + w + bubble, r: bubble } : null,
    inX: (y: number) => (id === 'xor' ? orBack(y, off) : orBack(y)),
    outX: x + w + (id === 'nor' ? bubble * 2 : 0),
  }
}

function GateBody({ id, x, cy, h, out }: { id: GateId; x: number; cy: number; h: number; out: number }) {
  const g = gateGeom(id, x, cy, h)
  return (
    <g>
      <path d={g.body} fill={out ? 'var(--gold-bg)' : 'var(--card)'} stroke="var(--text)" strokeWidth="2" style={{ transition: 'fill 0.2s' }} />
      {g.extra ? <path d={g.extra} fill="none" stroke="var(--text)" strokeWidth="2" /> : null}
      {g.bubble ? <circle cx={g.bubble.cx} cy={cy} r={g.bubble.r} fill="var(--card)" stroke="var(--text)" strokeWidth="2" /> : null}
    </g>
  )
}

function InputBtn({ x, y, name, v, onToggle }: { x: number; y: number; name: string; v: number; onToggle: () => void }) {
  const { t } = useLocale()
  return (
    <Hit label={`${name || t(L.dataIn)} = ${v}, ${t(L.toggle)}`} active={v === 1} onPick={onToggle}>
      <rect x={x - 22} y={y - 16} width="44" height="32" rx="8" fill={v ? 'var(--gold-bg)' : 'var(--card)'} stroke={v ? HI : 'var(--line-2)'} strokeWidth="2" />
      <text x={x} y={y + 5} textAnchor="middle" fill="var(--text)" fontSize="15" fontWeight="700" fontFamily="var(--mono)">
        {v}
      </text>
      <text x={x - 30} y={y + 5} textAnchor="end" fill="var(--text-2)" fontSize="13" fontWeight="700">
        {name}
      </text>
    </Hit>
  )
}

function OutLamp({ x, y, name, v }: { x: number; y: number; name: string; v: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="16" fill={v ? 'var(--gold)' : 'var(--card)'} stroke={v ? HI : 'var(--line-2)'} strokeWidth="2" style={{ transition: 'fill 0.2s' }} />
      <text x={x} y={y + 5} textAnchor="middle" fill={v ? 'var(--well)' : 'var(--text)'} fontSize="15" fontWeight="700" fontFamily="var(--mono)">
        {v}
      </text>
      <text x={x + 26} y={y + 5} fill="var(--text-2)" fontSize="13" fontWeight="700">
        {name}
      </text>
    </g>
  )
}

export function GateFig({ id, a, b, onA, onB }: { id: GateId; a: number; b: number; onA: () => void; onB: () => void }) {
  const { t } = useLocale()
  const h = 100
  const x = 330
  const cy = 120
  const g = gateGeom(id, x, cy, h)
  const y = evalGate(id, a, b)
  const single = id === 'not'
  const ya = single ? cy : cy - 25
  const yb = cy + 25
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 240" className="term-fig__svg" role="group" aria-label={t(L.gateCap)}>
        <rect width="760" height="240" rx="10" fill="var(--well)" />
        <path d={`M182 ${ya} H${g.inX(ya)}`} {...wire(a)} />
        {single ? null : <path d={`M182 ${yb} H${g.inX(yb)}`} {...wire(b)} />}
        <path d={`M${g.outX} ${cy} H584`} {...wire(y)} />
        <GateBody id={id} x={x} cy={cy} h={h} out={y} />
        <InputBtn x={160} y={ya} name="A" v={a} onToggle={onA} />
        {single ? null : <InputBtn x={160} y={yb} name="B" v={b} onToggle={onB} />}
        <OutLamp x={600} y={cy} name="Y" v={y} />
      </svg>
      <figcaption>{t(L.gateCap)}</figcaption>
    </figure>
  )
}

export function AdderFig({ a, b, onA, onB }: { a: number; b: number; onA: () => void; onB: () => void }) {
  const { t } = useLocale()
  const h = 70
  const gx = 380
  const xorY = 80
  const andY = 190
  const xg = gateGeom('xor', gx, xorY, h)
  const ag = gateGeom('and', gx, andY, h)
  const s = a ^ b
  const c = a & b
  const aY = xorY - 18
  const bY = andY + 18
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="group" aria-label={t(L.adderCap)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <path d={`M142 ${aY} H${xg.inX(aY)}`} {...wire(a)} />
        <path d={`M220 ${aY} V${andY - 18} H${ag.inX(andY - 18)}`} {...wire(a)} />
        <path d={`M142 ${bY} H${ag.inX(bY)}`} {...wire(b)} />
        <path d={`M280 ${bY} V${xorY + 18} H${xg.inX(xorY + 18)}`} {...wire(b)} />
        <circle cx="220" cy={aY} r="4" fill={a ? HI : 'var(--text-2)'} />
        <circle cx="280" cy={bY} r="4" fill={b ? HI : 'var(--text-2)'} />
        <path d={`M${xg.outX} ${xorY} H584`} {...wire(s)} />
        <path d={`M${ag.outX} ${andY} H584`} {...wire(c)} />
        <GateBody id="xor" x={gx} cy={xorY} h={h} out={s} />
        <GateBody id="and" x={gx} cy={andY} h={h} out={c} />
        <text x={gx + 40} y={xorY + 5} textAnchor="middle" fill="var(--muted)" fontSize="11">
          XOR
        </text>
        <text x={gx + 40} y={andY + 5} textAnchor="middle" fill="var(--muted)" fontSize="11">
          AND
        </text>
        <InputBtn x={120} y={aY} name="A" v={a} onToggle={onA} />
        <InputBtn x={120} y={bY} name="B" v={b} onToggle={onB} />
        <OutLamp x={600} y={xorY} name="S" v={s} />
        <OutLamp x={600} y={andY} name="C" v={c} />
      </svg>
      <figcaption>{t(L.adderCap)}</figcaption>
    </figure>
  )
}

const FF_X = (i: number) => 200 + i * 130
const FF_W = 80

export function ShiftFig({ din, bits, pulse, onDin }: { din: number; bits: number[]; pulse: number; onDin: () => void }) {
  const { t } = useLocale()
  const dY = 92
  const clkY = 132
  const busY = 196
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 230" className="term-fig__svg" role="group" aria-label={t(L.shiftCap)}>
        <rect width="760" height="230" rx="10" fill="var(--well)" />
        <path d={`M124 ${dY} H${FF_X(0)}`} {...wire(din)} />
        {bits.map((v, i) => {
          const x = FF_X(i)
          const next = i < bits.length - 1 ? FF_X(i + 1) : 700
          return (
            <g key={i}>
              <path d={`M${x + FF_W} ${dY} H${next}`} {...wire(v)} />
              <path d={`M${x - 14} ${busY} V${clkY} H${x}`} fill="none" stroke="var(--blue)" strokeWidth="1.6" />
              <circle cx={x - 14} cy={busY} r="3.5" fill="var(--blue)" />
              <rect x={x} y="62" width={FF_W} height="96" rx="4" fill={v ? 'var(--gold-bg)' : 'var(--card)'} stroke="var(--text)" strokeWidth="1.6" style={{ transition: 'fill 0.25s' }} />
              <path d={`M${x} ${clkY - 7} L${x + 10} ${clkY} L${x} ${clkY + 7}`} fill="none" stroke="var(--text)" strokeWidth="1.4" />
              <text x={x + 6} y={dY + 4} fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
                D
              </text>
              <text x={x + FF_W - 6} y={dY + 4} textAnchor="end" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
                Q
              </text>
              <text x={x + FF_W / 2} y="128" textAnchor="middle" fill="var(--text)" fontSize="24" fontWeight="700" fontFamily="var(--mono)">
                {v}
              </text>
              <text x={x + FF_W / 2} y="52" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
                {`FF${i}`}
              </text>
            </g>
          )
        })}
        <path key={pulse} className={pulse > 0 ? 'prep-pulse' : undefined} d={`M${FF_X(0) - 14} ${busY} H${FF_X(3) - 14} M100 ${busY} H${FF_X(0) - 14}`} fill="none" stroke="var(--blue)" strokeWidth="2" />
        <text x="100" y={busY + 18} fill="var(--blue)" fontSize="11" fontFamily="var(--mono)">
          CLK
        </text>
        <text x="750" y={dY - 10} textAnchor="end" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
          Scan Out
        </text>
        <text x="80" y={dY - 26} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {`${t(L.dataIn)} / Scan In`}
        </text>
        <InputBtn x={100} y={dY} name="" v={din} onToggle={onDin} />
      </svg>
      <figcaption>{t(L.shiftCap)}</figcaption>
    </figure>
  )
}

export function LevelFig({ v }: { v: number }) {
  const { t } = useLocale()
  const x0 = 60
  const x1 = 700
  const vx = (volt: number) => x0 + (volt / LEVEL.vdd) * (x1 - x0)
  const zone = v <= LEVEL.vil ? 'low' : v >= LEVEL.vih ? 'high' : 'undef'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 190" className="term-fig__svg" role="img" aria-label={t(LEVEL.cap)}>
        <defs>
          <pattern id="prep-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="var(--red-bg)" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--red-line)" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="760" height="190" rx="10" fill="var(--well)" />
        <rect x={x0} y="70" width={vx(LEVEL.vil) - x0} height="40" fill="var(--blue-bg-2)" stroke={zone === 'low' ? 'var(--blue)' : 'var(--line-2)'} strokeWidth={zone === 'low' ? 2 : 1} />
        <rect x={vx(LEVEL.vil)} y="70" width={vx(LEVEL.vih) - vx(LEVEL.vil)} height="40" fill="url(#prep-hatch)" stroke={zone === 'undef' ? 'var(--red)' : 'var(--line-2)'} strokeWidth={zone === 'undef' ? 2 : 1} />
        <rect x={vx(LEVEL.vih)} y="70" width={x1 - vx(LEVEL.vih)} height="40" fill="var(--gold-bg-2)" stroke={zone === 'high' ? 'var(--gold)' : 'var(--line-2)'} strokeWidth={zone === 'high' ? 2 : 1} />
        <text x={(x0 + vx(LEVEL.vil)) / 2} y="95" textAnchor="middle" fill="var(--blue)" fontSize="12" fontWeight="700">
          {t(LEVEL.low)}
        </text>
        <text x={(vx(LEVEL.vil) + vx(LEVEL.vih)) / 2} y="95" textAnchor="middle" fill="var(--red)" fontSize="12" fontWeight="700">
          {t(LEVEL.undef)}
        </text>
        <text x={(vx(LEVEL.vih) + x1) / 2} y="95" textAnchor="middle" fill="var(--gold)" fontSize="12" fontWeight="700">
          {t(LEVEL.high)}
        </text>
        {[
          { volt: 0, label: '0 V' },
          { volt: LEVEL.vil, label: 'VIL 0.8 V' },
          { volt: LEVEL.vih, label: 'VIH 2.0 V' },
          { volt: LEVEL.vdd, label: '3.3 V' },
        ].map((m) => (
          <g key={m.label}>
            <line x1={vx(m.volt)} y1="110" x2={vx(m.volt)} y2="122" stroke="var(--text-2)" />
            <text x={vx(m.volt)} y="138" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
              {m.label}
            </text>
          </g>
        ))}
        <g style={{ transform: `translateX(${vx(v)}px)`, transition: 'transform 0.15s' }}>
          <path d="M0 66 L-8 50 H8 Z" fill="var(--text)" />
          <text x="0" y="42" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="700" fontFamily="var(--mono)">
            {`${v.toFixed(2)} V`}
          </text>
        </g>
      </svg>
      <figcaption>{t(LEVEL.cap)}</figcaption>
    </figure>
  )
}
