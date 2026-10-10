import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { DFF_CYCLES, VDD, VIH, VIL, VOH, VOL, type GateId, type OhmMode } from './data/basics'

/* ---------- 欧姆定律测电阻电路 ---------- */

const OL = {
  vsrc: loc('电压源'),
  isrc: loc('电流源'),
  amm: loc('电流表'),
  vm: loc('电压表'),
  dut: loc('被测电阻'),
  capFv: loc('加压测流：电流表串在回路里，读到的电流 I = 5 V / R。'),
  capFi: loc('加流测压：电压表并在电阻两端，读到的压降 E = 2.5 mA × R。'),
}

export function OhmFig({ mode, r, reading, pass }: { mode: OhmMode; r: number; reading: string; pass: boolean }) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const fv = mode === 'fv'
  const meterColor = pass ? 'var(--green)' : 'var(--red)'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img" aria-label={t(fv ? OL.capFv : OL.capFi)}>
        <rect width="680" height="250" rx="10" fill="var(--well)" />
        {/* 回路导线 */}
        <polyline points="110,97 110,50 470,50 470,90" fill="none" stroke={hot} strokeWidth="2.5" />
        <polyline points="110,153 110,200 470,200 470,160" fill="none" stroke={hot} strokeWidth="2.5" />
        {/* 电源 */}
        <circle cx="110" cy="125" r="28" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="2" />
        {fv ? (
          <>
            <text x="110" y="117" textAnchor="middle" fill="var(--text)" fontSize="16">+</text>
            <text x="110" y="143" textAnchor="middle" fill="var(--text)" fontSize="18">−</text>
          </>
        ) : (
          <path d="M110 142 L110 108 M102 116 L110 106 L118 116" fill="none" stroke="var(--text)" strokeWidth="2" />
        )}
        <text x="58" y="120" textAnchor="end" fill="var(--text-2)" fontSize="13">{t(fv ? OL.vsrc : OL.isrc)}</text>
        <text x="58" y="138" textAnchor="end" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">
          {fv ? '5.0 V' : '2.5 mA'}
        </text>
        {/* 电阻（锯齿） */}
        <path
          d="M470 90 L470 98 L482 104 L458 112 L482 120 L458 128 L482 136 L458 144 L470 150 L470 160"
          fill="none"
          stroke="var(--text)"
          strokeWidth="2"
        />
        <text x="496" y="120" fill="var(--text-2)" fontSize="13">{t(OL.dut)}</text>
        <text x="496" y="138" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">{`R = ${r} Ω`}</text>
        {fv ? (
          <>
            {/* 串联电流表 */}
            <rect x="262" y="38" width="56" height="24" fill="var(--well)" />
            <circle cx="290" cy="50" r="22" fill="var(--fig-box)" stroke={meterColor} strokeWidth="2" />
            <text x="290" y="56" textAnchor="middle" fill="var(--text)" fontSize="16">A</text>
            <text x="290" y="92" textAnchor="middle" fill="var(--text-2)" fontSize="12">{t(OL.amm)}</text>
            <text x="290" y="110" textAnchor="middle" fill={meterColor} fontSize="14" fontFamily="var(--mono)">{reading}</text>
            <text x="200" y="42" textAnchor="middle" fill="var(--muted)" fontSize="12">I →</text>
          </>
        ) : (
          <>
            {/* 并联电压表 */}
            <polyline points="470,50 610,50 610,103" fill="none" stroke="var(--line-2)" strokeWidth="2" />
            <polyline points="470,200 610,200 610,147" fill="none" stroke="var(--line-2)" strokeWidth="2" />
            <circle cx="610" cy="125" r="22" fill="var(--fig-box)" stroke={meterColor} strokeWidth="2" />
            <text x="610" y="131" textAnchor="middle" fill="var(--text)" fontSize="16">V</text>
            <text x="610" y="172" textAnchor="middle" fill="var(--text-2)" fontSize="12">{t(OL.vm)}</text>
            <text x="610" y="232" textAnchor="middle" fill={meterColor} fontSize="14" fontFamily="var(--mono)">{reading}</text>
            <text x="290" y="42" textAnchor="middle" fill="var(--muted)" fontSize="12">I = 2.5 mA →</text>
          </>
        )}
      </svg>
      <figcaption>{t(fv ? OL.capFv : OL.capFi)}</figcaption>
    </figure>
  )
}

/* ---------- 逻辑电平尺 ---------- */

const LL = {
  out: loc('输出（驱动端）'),
  inp: loc('输入（接收端）'),
  bad: loc('无效'),
  nm: loc('噪声容限'),
  cap: loc('左边是驱动端输出必须达到的电平，右边是接收端输入的识别范围。两者之间的黄色带就是噪声容限。黄线是你拖动的电压。'),
}

export function LevelFig({ volt }: { volt: number }) {
  const { t } = useLocale()
  const y = (v: number) => 270 - (v / VDD) * 240
  const zone = (x: number, w: number, lo: number, hi: number, fill: string, label: string) => (
    <g>
      <rect x={x} y={y(hi)} width={w} height={y(lo) - y(hi)} fill={fill} stroke="var(--line)" />
      <text x={x + w / 2} y={(y(lo) + y(hi)) / 2 + 5} textAnchor="middle" fill="var(--text)" fontSize="13">
        {label}
      </text>
    </g>
  )
  const ticks = [0, 1, 2, 3, 4, 5]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(LL.cap)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1="70" y1={y(v)} x2="78" y2={y(v)} stroke="var(--muted)" />
            <text x="64" y={y(v) + 4} textAnchor="end" fill="var(--dim)" fontSize="11" fontFamily="var(--mono)">{`${v} V`}</text>
          </g>
        ))}
        <line x1="78" y1={y(0)} x2="78" y2={y(VDD)} stroke="var(--muted)" />
        <text x="190" y="22" textAnchor="middle" fill="var(--text-2)" fontSize="13">{t(LL.out)}</text>
        <text x="500" y="22" textAnchor="middle" fill="var(--text-2)" fontSize="13">{t(LL.inp)}</text>
        {zone(130, 120, 0, VOL, 'var(--green-bg)', '0')}
        {zone(130, 120, VOL, VOH, 'var(--red-bg)', t(LL.bad))}
        {zone(130, 120, VOH, VDD, 'var(--blue-bg)', '1')}
        {zone(440, 120, 0, VIL, 'var(--green-bg)', '0')}
        {zone(440, 120, VIL, VIH, 'var(--red-bg)', t(LL.bad))}
        {zone(440, 120, VIH, VDD, 'var(--blue-bg)', '1')}
        {/* 噪声容限带 */}
        <rect x="250" y={y(VIL)} width="190" height={y(VOL) - y(VIL)} fill="var(--gold-bg)" stroke="var(--gold-line)" />
        <rect x="250" y={y(VOH)} width="190" height={y(VIH) - y(VOH)} fill="var(--gold-bg)" stroke="var(--gold-line)" />
        <text x="345" y={(y(VIL) + y(VOL)) / 2 + 4} textAnchor="middle" fill="var(--gold)" fontSize="11">
          {`${t(LL.nm)} 0.4 V`}
        </text>
        <text x="345" y={(y(VIH) + y(VOH)) / 2 + 4} textAnchor="middle" fill="var(--gold)" fontSize="11">
          {`${t(LL.nm)} 0.4 V`}
        </text>
        {/* 阈值标注 */}
        <text x="124" y={y(VOL) + 4} textAnchor="end" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">VOL 0.4</text>
        <text x="124" y={y(VOH) + 4} textAnchor="end" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">VOH 2.4</text>
        <text x="566" y={y(VIL) + 4} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">VIL 0.8</text>
        <text x="566" y={y(VIH) + 4} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">VIH 2.0</text>
        <text x="566" y={y(VDD) + 4} fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">VDD 5.0</text>
        {/* 当前电压 */}
        <line x1="84" y1={y(volt)} x2="640" y2={y(volt)} stroke="var(--gold)" strokeWidth="2" />
        <circle cx="84" cy={y(volt)} r="4" fill="var(--gold)" />
        <text x="640" y={y(volt) - 6} textAnchor="end" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          {`${volt.toFixed(2)} V`}
        </text>
      </svg>
      <figcaption>{t(LL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 门电路符号 ---------- */

const GL = {
  click: loc('点输入端切换 0 / 1'),
}

export function GateFig({
  gate,
  a,
  b,
  out,
  onA,
  onB,
}: {
  gate: GateId
  a: number
  b: number
  out: number
  onA: () => void
  onB: () => void
}) {
  const { t } = useLocale()
  const one = 'var(--gold)'
  const zero = 'var(--line-2)'
  const isNot = gate === 'not'
  const isOr = gate === 'or' || gate === 'nor'
  const bubble = gate === 'not' || gate === 'nand' || gate === 'nor'
  const bodyEnd = isNot ? 325 : isOr ? 340 : 330
  const outX = bubble ? bodyEnd + 12 : bodyEnd
  const inEnd = isOr ? 262 : 250
  const body = isNot
    ? 'M250 70 L325 110 L250 150 Z'
    : isOr
      ? 'M240 70 Q290 70 340 110 Q290 150 240 150 Q265 110 240 70 Z'
      : 'M250 70 H290 A40 40 0 0 1 290 150 H250 Z'
  const inputs = isNot ? [{ id: 'A', v: a, y: 110, on: onA }] : [
    { id: 'A', v: a, y: 90, on: onA },
    { id: 'B', v: b, y: 130, on: onB },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 220" className="term-fig__svg" role="img" aria-label={gate}>
        <rect width="680" height="220" rx="10" fill="var(--well)" />
        {inputs.map((pin) => (
          <g key={pin.id} onClick={pin.on} style={{ cursor: 'pointer' }}>
            <line x1="130" y1={pin.y} x2={inEnd} y2={pin.y} stroke={pin.v ? one : zero} strokeWidth="3" />
            <rect x="80" y={pin.y - 16} width="44" height="32" rx="6" fill={pin.v ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={pin.v ? one : 'var(--line)'} />
            <text x="102" y={pin.y + 5} textAnchor="middle" fill="var(--text)" fontSize="15" fontFamily="var(--mono)">
              {pin.v}
            </text>
            <text x="66" y={pin.y + 5} textAnchor="end" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">
              {pin.id}
            </text>
          </g>
        ))}
        <path d={body} fill="var(--fig-box)" stroke="var(--text)" strokeWidth="2" />
        {bubble ? <circle cx={bodyEnd + 6} cy="110" r="6" fill="var(--fig-box)" stroke="var(--text)" strokeWidth="2" /> : null}
        <text x={isNot ? 275 : 285} y="115" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
          {gate.toUpperCase()}
        </text>
        <line x1={outX} y1="110" x2="520" y2="110" stroke={out ? one : zero} strokeWidth="3" />
        <circle cx="545" cy="110" r="22" fill={out ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={out ? one : 'var(--line)'} strokeWidth="2" />
        <text x="545" y="116" textAnchor="middle" fill="var(--text)" fontSize="16" fontFamily="var(--mono)">
          {out}
        </text>
        <text x="585" y="115" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">OUT</text>
        <text x="340" y="200" textAnchor="middle" fill="var(--dim)" fontSize="12">{t(GL.click)}</text>
      </svg>
    </figure>
  )
}

/* ---------- D 触发器时间轴 ---------- */

const DL = {
  cap: loc('灰色虚线 Q 表示还没有被时钟采样过（未知）。点 D 那一行的格子可以改数据。黄色竖线是“现在”，走到 CLK 上升沿（↑）时 Q 才更新。'),
}

type Lv = 0 | 1 | 'z'
type DSeg = { x0: number; x1: number; level: Lv }

const DX0 = 84
const DX1 = 664

function SegLines({ segs, top, color, cut }: { segs: DSeg[]; top: number; color: string; cut?: number }) {
  const x = (c: number) => DX0 + (c / DFF_CYCLES) * (DX1 - DX0)
  const hi = top
  const lo = top + 28
  const y = (l: Lv) => (l === 'z' ? (hi + lo) / 2 : l ? hi : lo)
  const shown = segs
    .filter((s) => cut === undefined || s.x0 < cut)
    .map((s) => (cut !== undefined && s.x1 > cut ? { ...s, x1: cut } : s))
  return (
    <g>
      {shown.map((s, i) => {
        const prev = shown[i - 1]
        return (
          <g key={i}>
            {prev && prev.level !== s.level && prev.level !== 'z' && s.level !== 'z' ? (
              <line x1={x(s.x0)} y1={y(prev.level)} x2={x(s.x0)} y2={y(s.level)} stroke={color} strokeWidth="2" />
            ) : null}
            <line
              x1={x(s.x0)}
              y1={y(s.level)}
              x2={x(s.x1)}
              y2={y(s.level)}
              stroke={s.level === 'z' ? 'var(--muted)' : color}
              strokeWidth="2"
              strokeDasharray={s.level === 'z' ? '4 4' : undefined}
            />
          </g>
        )
      })}
    </g>
  )
}

export function DffFig({ d, time, onToggle }: { d: number[]; time: number; onToggle: (k: number) => void }) {
  const { t } = useLocale()
  const x = (c: number) => DX0 + (c / DFF_CYCLES) * (DX1 - DX0)
  const cycles = Array.from({ length: DFF_CYCLES }, (_, k) => k)
  const clk: DSeg[] = cycles.flatMap((k) => [
    { x0: k, x1: k + 0.5, level: 0 as Lv },
    { x0: k + 0.5, x1: k + 1, level: 1 as Lv },
  ])
  const dSegs: DSeg[] = cycles.map((k) => ({ x0: k, x1: k + 1, level: (d[k] ? 1 : 0) as Lv }))
  const qSegs: DSeg[] = [{ x0: 0, x1: 0.5, level: 'z' }, ...cycles.map((k) => ({ x0: k + 0.5, x1: Math.min(k + 1.5, DFF_CYCLES), level: (d[k] ? 1 : 0) as Lv }))]
  const rows = [
    { name: 'CLK', top: 44 },
    { name: 'D', top: 104 },
    { name: 'Q', top: 164 },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 220" className="term-fig__svg" role="img" aria-label={t(DL.cap)}>
        <rect width="680" height="220" rx="10" fill="var(--well)" />
        {cycles.map((k) => {
          const passed = k + 0.5 <= time
          return (
            <g key={k}>
              <line x1={x(k)} y1="24" x2={x(k)} y2="204" stroke="var(--line)" />
              <line
                x1={x(k + 0.5)}
                y1="30"
                x2={x(k + 0.5)}
                y2="204"
                stroke={passed ? 'var(--gold)' : 'var(--blue)'}
                strokeOpacity={passed ? 0.6 : 0.3}
                strokeDasharray="3 4"
              />
              <text x={x(k + 0.5)} y="22" textAnchor="middle" fill={passed ? 'var(--gold)' : 'var(--dim)'} fontSize="12">
                ↑
              </text>
              <rect
                x={x(k) + 2}
                y="100"
                width={x(k + 1) - x(k) - 4}
                height="36"
                rx="4"
                fill="var(--blue-bg)"
                opacity="0.35"
                style={{ cursor: 'pointer' }}
                onClick={() => onToggle(k)}
              />
              <text x={x(k) + 8} y="150" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
                {d[k]}
              </text>
            </g>
          )
        })}
        {rows.map((row) => (
          <text key={row.name} x="14" y={row.top + 19} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
            {row.name}
          </text>
        ))}
        <SegLines segs={clk} top={44} color="var(--sky)" />
        <SegLines segs={dSegs} top={104} color="var(--purple)" />
        <SegLines segs={qSegs} top={164} color="var(--green)" cut={time} />
        <line x1={x(time)} y1="26" x2={x(time)} y2="206" stroke="var(--gold)" strokeWidth="2" />
      </svg>
      <figcaption>{t(DL.cap)}</figcaption>
    </figure>
  )
}
