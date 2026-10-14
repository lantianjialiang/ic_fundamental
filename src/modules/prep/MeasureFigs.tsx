import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { fmtOhm } from '../fund/parts'
import { KELVIN_LABEL, type HookId, type KelvinId } from './data/measure'

const L = {
  ohmCap: loc('电流表串在回路里，电压表跨在电阻两端。黄色箭头是电流方向（从电源正极出发）。', 'The ammeter is in series with the loop; the voltmeter is across the resistor. The yellow arrow is the current direction (out of the supply’s + terminal).'),
  hookCap: loc('黑表笔插 COM；红表笔插 VΩ 测电压、电阻，插 A 测电流。', 'Black lead in COM; red lead in VΩ for voltage and resistance, in A for current.'),
  short: loc('短路！', 'Short!'),
  live: loc('通电中', 'Powered'),
  meterInside: loc('表的内部', 'Inside the meter'),
  loadCap: loc('真实的电压表 = 理想电压表 + 并联的输入电阻 Rin。', 'A real voltmeter = an ideal voltmeter + a parallel input resistance Rin.'),
  scopeCap: loc('横轴是时间，竖轴是电压；左边箭头是 0 V 位置，顶上 T 是触发点。', 'Horizontal is time, vertical is voltage; the left arrow marks 0 V and the T at the top marks the trigger point.'),
}

const W = { stroke: 'var(--text-2)', strokeWidth: 2, fill: 'none' }
const HOT = 'var(--gold)'

function Res({ x, y, vertical, label, labelSide = 'left', hot = false, bad = false }: { x: number; y: number; vertical: boolean; label?: string; labelSide?: 'left' | 'right' | 'top' | 'bottom'; hot?: boolean; bad?: boolean }) {
  const w = vertical ? 24 : 60
  const h = vertical ? 60 : 16
  let lx = x
  let ly = y + 4
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (labelSide === 'left') {
    lx = x - w / 2 - 8
    anchor = 'end'
  } else if (labelSide === 'right') {
    lx = x + w / 2 + 8
    anchor = 'start'
  } else if (labelSide === 'top') {
    ly = y - h / 2 - 8
  } else {
    ly = y + h / 2 + 16
  }
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={bad ? 'var(--red-bg)' : 'var(--card)'} stroke={bad ? 'var(--red)' : hot ? HOT : 'var(--text)'} strokeWidth="2" style={{ transition: 'fill 0.2s' }} />
      {label ? (
        <text x={lx} y={ly} textAnchor={anchor} fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
          {label}
        </text>
      ) : null}
    </g>
  )
}

function Src({ x, y, label, current = false }: { x: number; y: number; label: string; current?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="24" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
      {current ? (
        <path d={`M${x} ${y + 14} V${y - 12} M${x - 6} ${y - 5} L${x} ${y - 13} L${x + 6} ${y - 5}`} fill="none" stroke="var(--text)" strokeWidth="2" />
      ) : (
        <g>
          <text x={x} y={y - 6} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">
            +
          </text>
          <text x={x} y={y + 16} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">
            −
          </text>
        </g>
      )}
      <text x={x - 32} y={y + 4} textAnchor="end" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
        {label}
      </text>
    </g>
  )
}

function Meter({ x, y, letter, tone }: { x: number; y: number; letter: string; tone?: 'ok' | 'bad' }) {
  const stroke = tone === 'bad' ? 'var(--red)' : tone === 'ok' ? 'var(--green)' : 'var(--blue)'
  return (
    <g>
      <circle cx={x} cy={y} r="20" fill="var(--card)" stroke={stroke} strokeWidth="2.2" />
      <text x={x} y={y + 6} textAnchor="middle" fill={stroke} fontSize="17" fontWeight="700">
        {letter}
      </text>
    </g>
  )
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.5" fill="var(--text-2)" />
}

function Flow({ x, y, dir, color = HOT }: { x: number; y: number; dir: 'r' | 'l' | 'u' | 'd'; color?: string }) {
  const d = {
    r: `M${x - 10} ${y - 6} L${x} ${y} L${x - 10} ${y + 6}`,
    l: `M${x + 10} ${y - 6} L${x} ${y} L${x + 10} ${y + 6}`,
    d: `M${x - 6} ${y - 10} L${x} ${y} L${x + 6} ${y - 10}`,
    u: `M${x - 6} ${y + 10} L${x} ${y} L${x + 6} ${y + 10}`,
  }[dir]
  return <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
}

function Txt({ x, y, children, anchor = 'start', color = 'var(--text)', size = 12, mono = true }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight="700" fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/* ---------- 欧姆定律 ---------- */

export function OhmFig({ v, r }: { v: number; r: number }) {
  const { t } = useLocale()
  const i = v / r
  const p = v * i
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(L.ohmCap)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <path d="M110 116 V50 H308 M352 50 H650 V120 M650 160 V230 H110 V164" {...W} />
        <path d="M520 50 V110 M520 170 V230" {...W} />
        <Dot x={520} y={50} />
        <Dot x={520} y={230} />
        <Src x={110} y={140} label={`${v.toFixed(1)} V`} />
        <Meter x={330} y={50} letter="A" />
        <Res x={520} y={140} vertical label={fmtOhm(r).replace('.0 ', ' ')} bad={p > 0.25} />
        <Meter x={650} y={140} letter="V" />
        {v > 0 ? (
          <g>
            <Flow x={210} y={50} dir="r" />
            <Flow x={440} y={50} dir="r" />
            <Flow x={520} y={205} dir="d" />
            <Flow x={300} y={230} dir="l" />
          </g>
        ) : null}
        <Txt x={330} y={96} anchor="middle" color="var(--blue)">
          {i >= 1e-3 || i === 0 ? `${(i * 1e3).toFixed(2)} mA` : `${(i * 1e6).toFixed(0)} µA`}
        </Txt>
        <Txt x={680} y={145} color="var(--blue)">
          {`${v.toFixed(2)} V`}
        </Txt>
      </svg>
      <figcaption>{t(L.ohmCap)}</figcaption>
    </figure>
  )
}

/* ---------- 接法对错 ---------- */

const DISPLAY: Record<HookId, string> = { vOk: '5.00 V', vSeries: '4.99 V', aOk: '5.00 mA', aShort: 'FUSE', ohmLive: '-.--' }

export function HookFig({ id, tone }: { id: HookId; tone: 'ok' | 'warn' | 'bad' }) {
  const { t } = useLocale()
  const series = id === 'vSeries' || id === 'aOk'
  const across = id === 'vOk' || id === 'ohmLive'
  const shortSrc = id === 'aShort'
  const letter = id === 'aOk' || id === 'aShort' ? 'A' : id === 'ohmLive' ? 'Ω' : 'V'
  const mTone = tone === 'ok' ? 'ok' : 'bad'
  const flowing = id === 'vOk' || id === 'aOk' || id === 'ohmLive'
  const jackA = letter === 'A'
  const dial = { V: -135, Ω: -90, A: -45 } as const
  const ang = (dial[letter] * Math.PI) / 180
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(L.hookCap)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <path d={`M90 116 V50 H${series ? 225 : 400} ${series ? 'M265 50 H400' : ''} V110 M400 170 V230 H90 V164`} {...W} />
        <Src x={90} y={140} label="5 V" />
        <Res x={400} y={140} vertical label="1 kΩ" />
        {series ? <Meter x={245} y={50} letter={letter} tone={mTone} /> : null}
        {across ? (
          <g>
            <path d="M400 50 H480 V120 M480 160 V230 H400" {...W} />
            <Dot x={400} y={50} />
            <Dot x={400} y={230} />
            <Meter x={480} y={140} letter={letter} tone={mTone} />
          </g>
        ) : null}
        {shortSrc ? (
          <g>
            <path d="M180 50 V120 M180 160 V230" {...W} stroke="var(--red)" />
            <Dot x={180} y={50} />
            <Dot x={180} y={230} />
            <Meter x={180} y={140} letter="A" tone="bad" />
            <Flow x={140} y={50} dir="r" color="var(--red)" />
            <Flow x={180} y={92} dir="d" color="var(--red)" />
            <Flow x={180} y={196} dir="d" color="var(--red)" />
            <Flow x={130} y={230} dir="l" color="var(--red)" />
            <Txt x={210} y={145} color="var(--red)" mono={false}>
              {t(L.short)}
            </Txt>
          </g>
        ) : null}
        {flowing ? (
          <g>
            <Flow x={170} y={50} dir="r" />
            <Flow x={400} y={205} dir="d" />
            <Flow x={250} y={230} dir="l" />
          </g>
        ) : null}
        {id === 'ohmLive' ? (
          <Txt x={58} y={164} anchor="end" color="var(--red)" size={11} mono={false}>
            {t(L.live)}
          </Txt>
        ) : null}

        <rect x="560" y="14" width="186" height="232" rx="14" fill="var(--panel-2)" stroke="var(--line-2)" />
        <rect x="578" y="30" width="150" height="46" rx="4" fill="var(--well)" stroke="var(--line)" />
        <Txt x={653} y={61} anchor="middle" size={20} color={tone === 'bad' ? 'var(--red)' : tone === 'warn' ? 'var(--gold)' : 'var(--green)'}>
          {DISPLAY[id]}
        </Txt>
        <circle cx="653" cy="136" r="30" fill="var(--card)" stroke="var(--line-2)" strokeWidth="2" />
        {(['V', 'Ω', 'A'] as const).map((k) => {
          const a = (dial[k] * Math.PI) / 180
          return (
            <Txt key={k} x={653 + 44 * Math.cos(a)} y={136 + 44 * Math.sin(a) + 5} anchor="middle" size={12} color={k === letter ? HOT : 'var(--dim)'}>
              {k}
            </Txt>
          )
        })}
        <line x1="653" y1="136" x2={653 + 26 * Math.cos(ang)} y2={136 + 26 * Math.sin(ang)} stroke={HOT} strokeWidth="4" strokeLinecap="round" style={{ transition: 'all 0.25s' }} />
        {[
          { x: 598, name: 'A', fill: jackA ? 'var(--red)' : 'var(--card)' },
          { x: 653, name: 'COM', fill: 'var(--text)' },
          { x: 708, name: 'VΩ', fill: jackA ? 'var(--card)' : 'var(--red)' },
        ].map((j) => (
          <g key={j.name}>
            <circle cx={j.x} cy="204" r="10" fill={j.fill} stroke="var(--text-2)" strokeWidth="2" />
            <Txt x={j.x} y={232} anchor="middle" size={11} color="var(--text-2)">
              {j.name}
            </Txt>
          </g>
        ))}
      </svg>
      <figcaption>{t(L.hookCap)}</figcaption>
    </figure>
  )
}

/* ---------- 负载效应 ---------- */

export function LoadFig({ rin, reading }: { rin: number; reading: number }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(L.loadCap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <path d="M100 120 V40 H320 V60 M320 120 V160 M320 220 V244 H100 V168" {...W} />
        <Src x={100} y={144} label="10 V" />
        <Res x={320} y={90} vertical label="10 kΩ" />
        <Res x={320} y={190} vertical label="10 kΩ" />
        <Dot x={320} y={140} />
        <Dot x={320} y={244} />
        <rect x="420" y="112" width="220" height="148" rx="8" fill="none" stroke="var(--blue)" strokeDasharray="5 4" />
        <text x="530" y="130" textAnchor="middle" fill="var(--blue)" fontSize="11">
          {t(L.meterInside)}
        </text>
        <path d="M320 140 H590 V168 M590 208 V244 M470 140 V158 M470 218 V244 M320 244 H590" {...W} />
        <Dot x={470} y={140} />
        <Dot x={470} y={244} />
        <Res x={470} y={188} vertical label={`Rin ${fmtOhm(rin).replace(/\.0+ /, ' ')}`} labelSide="right" hot />
        <Meter x={590} y={188} letter="V" />
        <Txt x={656} y={192} color="var(--blue)">
          {`${reading.toFixed(3)} V`}
        </Txt>
      </svg>
      <figcaption>{t(L.loadCap)}</figcaption>
    </figure>
  )
}

/* ---------- 两线 / 四线 ---------- */

export function KelvinFig({ mode }: { mode: KelvinId }) {
  const { t } = useLocale()
  const four = mode === 'four'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(KELVIN_LABEL.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <path d="M90 126 V50 H230 M290 50 H450 V120 M450 180 V240 H290 M230 240 H90 V174" {...W} />
        <Src x={90} y={150} label="1 A" current />
        <Res x={260} y={50} vertical={false} hot />
        <Res x={260} y={240} vertical={false} hot />
        <text x="260" y="32" textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(KELVIN_LABEL.lead)}
        </text>
        <text x="260" y="226" textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(KELVIN_LABEL.lead)}
        </text>
        <Res x={450} y={150} vertical />
        <text x="430" y="154" textAnchor="end" fill="var(--text)" fontSize="11">
          {t(KELVIN_LABEL.dut)}
        </text>
        <text x="104" y="34" fill="var(--gold)" fontSize="11">
          {t(KELVIN_LABEL.force)}
        </text>
        <Flow x={360} y={50} dir="r" />
        <Flow x={470} y={150} dir="d" />
        <Flow x={360} y={240} dir="l" />
        {four ? (
          <g>
            <path d="M450 96 H540 M590 96 H640 V130 M640 170 V204 H590 M540 204 H450" {...W} stroke="var(--blue)" />
            <Dot x={450} y={96} />
            <Dot x={450} y={204} />
            <Res x={565} y={96} vertical={false} />
            <Res x={565} y={204} vertical={false} />
            <text x="565" y="80" textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(KELVIN_LABEL.lead)}
            </text>
            <text x="565" y="228" textAnchor="middle" fill="var(--text-2)" fontSize="11">
              {t(KELVIN_LABEL.lead)}
            </text>
            <Meter x={640} y={150} letter="V" tone="ok" />
            <text x="668" y="140" fill="var(--blue)" fontSize="11">
              {t(KELVIN_LABEL.sense)}
            </text>
            <Txt x={668} y={160} color="var(--green)" size={11}>
              0.10 V
            </Txt>
            <Txt x={668} y={176} color="var(--green)" size={11}>
              → 0.1 Ω
            </Txt>
          </g>
        ) : (
          <g>
            <path d="M170 50 V130 M170 170 V240" {...W} stroke="var(--blue)" />
            <Dot x={170} y={50} />
            <Dot x={170} y={240} />
            <Meter x={170} y={150} letter="V" tone="bad" />
            <Txt x={200} y={146} color="var(--red)" size={11}>
              0.50 V
            </Txt>
            <Txt x={200} y={162} color="var(--red)" size={11}>
              → 0.5 Ω
            </Txt>
          </g>
        )}
      </svg>
      <figcaption>{t(KELVIN_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 示波器 ---------- */

const SX0 = 80
const SX1 = 680
const SY0 = 20
const SY1 = 260
const DIV_X = (SX1 - SX0) / 10
const DIV_Y = (SY1 - SY0) / 8
const GND_Y = SY1 - DIV_Y

export function ScopeFig({ tdiv, vdiv }: { tdiv: number; vdiv: number }) {
  const { t } = useLocale()
  const tmin = -5 * tdiv
  const tmax = 5 * tdiv
  const half = 0.5
  const level = (time: number) => ((((time % 1) + 1) % 1) < half ? 1 : 0)
  const x = (time: number) => SX0 + ((time - tmin) / (tmax - tmin)) * (SX1 - SX0)
  const y = (lv: number) => GND_Y - ((lv * 3.3) / vdiv) * DIV_Y
  const parts: string[] = [`M${x(tmin)} ${y(level(tmin))}`]
  const first = Math.ceil(tmin / half)
  const last = Math.floor(tmax / half)
  for (let k = first; k <= last; k++) {
    const e = k * half
    const before = level(e - 1e-9)
    const after = level(e + 1e-9)
    parts.push(`L${x(e)} ${y(before)} L${x(e)} ${y(after)}`)
  }
  parts.push(`L${x(tmax)} ${y(level(tmax - 1e-9))}`)
  const trigY = y(0.5)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 296" className="term-fig__svg" role="img" aria-label={t(L.scopeCap)}>
        <defs>
          <clipPath id="prep-scope-clip">
            <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} />
          </clipPath>
        </defs>
        <rect width="760" height="296" rx="10" fill="var(--well)" />
        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="#0d1a14" stroke="var(--line-2)" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={SX0 + i * DIV_X} y1={SY0} x2={SX0 + i * DIV_X} y2={SY1} stroke="#2d4a3b" strokeDasharray={i === 5 ? undefined : '2 3'} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1={SX0} y1={SY0 + i * DIV_Y} x2={SX1} y2={SY0 + i * DIV_Y} stroke="#2d4a3b" strokeDasharray={i === 4 ? undefined : '2 3'} />
        ))}
        <path d={parts.join(' ')} fill="none" stroke="#f2d04b" strokeWidth="2.2" clipPath="url(#prep-scope-clip)" />
        <path d={`M${SX0 - 14} ${GND_Y - 6} L${SX0 - 4} ${GND_Y} L${SX0 - 14} ${GND_Y + 6} Z`} fill="#f2d04b" />
        <text x={SX0 - 18} y={GND_Y + 4} textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          0 V
        </text>
        {trigY >= SY0 ? <path d={`M${SX1 + 14} ${trigY - 6} L${SX1 + 4} ${trigY} L${SX1 + 14} ${trigY + 6} Z`} fill="var(--orange-bg, var(--gold))" stroke="var(--gold)" /> : null}
        <text x={(SX0 + SX1) / 2} y={SY0 - 6} textAnchor="middle" fill="var(--gold)" fontSize="11" fontWeight="700" fontFamily="var(--mono)">
          T
        </text>
        <text x={SX0} y="284" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {`${tdiv} ms/div`}
        </text>
        <text x={SX0 + 140} y="284" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {`${vdiv} V/div`}
        </text>
        <text x={SX1} y="284" textAnchor="end" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          1 kHz · 0–3.3 V
        </text>
      </svg>
      <figcaption>{t(L.scopeCap)}</figcaption>
    </figure>
  )
}
