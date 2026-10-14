import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { DEMO_LABEL, S, type DemoId, type PartId } from './data/parts'

const L = {
  nonPolar: loc('无极性', 'Non-polar'),
  polar: loc('有极性', 'Polarised'),
  bands: loc('色环', 'Colour bands'),
  chip: loc('贴片', 'Chip'),
  mlcc: loc('陶瓷贴片', 'Ceramic chip'),
  elec: loc('电解电容', 'Electrolytic'),
  stripe: loc('白条 = 负极', 'Stripe = negative'),
  longLead: loc('长脚 A', 'Long lead A'),
  shortLead: loc('短脚 K（平边）', 'Short lead K (flat)'),
  flat: loc('平面朝自己', 'Flat face toward you'),
  pinsNote: loc('以 2N3904 为例', 'Example: 2N3904'),
  partCap: loc('左右是同一个元件。字母：A 阳极、K 阴极、B/C/E 基/集/射极、G/D/S 栅/漏/源极。', 'Both sides are the same component. Letters: A anode, K cathode, B/C/E base/collector/emitter, G/D/S gate/drain/source.'),
}

const STROKE = 'var(--text)'
const LEAD = 'var(--line-3)'

function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400}>
      {children}
    </text>
  )
}

function arrowHead(x: number, y: number, angle: number, size = 7) {
  const a1 = angle + Math.PI * 0.85
  const a2 = angle - Math.PI * 0.85
  return `M${x + size * Math.cos(a1)} ${y + size * Math.sin(a1)} L${x} ${y} L${x + size * Math.cos(a2)} ${y + size * Math.sin(a2)}`
}

function Symbol({ id }: { id: PartId }) {
  const { t } = useLocale()
  const sw = 2
  if (id === 'r') {
    const zig = Array.from({ length: 6 }, (_, i) => `L${110 + i * 15 + 7.5} ${150 + (i % 2 === 0 ? -10 : 10)}`).join(' ')
    return (
      <g stroke={STROKE} strokeWidth={sw} fill="none">
        <path d="M50 90 H115 M195 90 H260" />
        <rect x="115" y="80" width="80" height="20" />
        <path d={`M50 150 H110 ${zig} L200 150 H260`} strokeLinejoin="round" />
        <g stroke="none">
          <T x={24} y={76} anchor="start" color="var(--dim)" size={10}>
            IEC
          </T>
          <T x={24} y={136} anchor="start" color="var(--dim)" size={10}>
            ANSI
          </T>
        </g>
      </g>
    )
  }
  if (id === 'c') {
    return (
      <g stroke={STROKE} strokeWidth={sw} fill="none">
        <path d="M50 90 H148 M162 90 H260" />
        <path d="M148 72 V108 M162 72 V108" strokeWidth="3" />
        <path d="M50 155 H148 M162 155 H260" />
        <path d="M148 137 V173" strokeWidth="3" />
        <path d="M168 137 Q158 155 168 173" strokeWidth="3" />
        <g stroke="none">
          <T x={136} y={146} color={STROKE} size={14} bold>
            +
          </T>
          <T x={24} y={66} anchor="start" color="var(--dim)" size={10}>
            {t(L.nonPolar)}
          </T>
          <T x={24} y={131} anchor="start" color="var(--dim)" size={10}>
            {t(L.polar)}
          </T>
        </g>
      </g>
    )
  }
  if (id === 'l') {
    return (
      <g stroke={STROKE} strokeWidth={sw} fill="none">
        <path d="M50 120 H95 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 H260" />
      </g>
    )
  }
  if (id === 'd' || id === 'led') {
    return (
      <g stroke={STROKE} strokeWidth={sw}>
        <path d="M50 120 H130 M166 120 H260" fill="none" />
        <path d="M130 100 L130 140 L166 120 Z" fill={STROKE} />
        <path d="M166 100 V140" strokeWidth="3" />
        {id === 'led' ? (
          <g fill="none" strokeWidth="1.5">
            <path d="M150 98 L170 76" />
            <path d={arrowHead(170, 76, -0.833)} />
            <path d="M164 104 L184 82" />
            <path d={arrowHead(184, 82, -0.833)} />
          </g>
        ) : (
          <g fill="none" strokeWidth="1.2" stroke="var(--blue)">
            <path d="M118 82 H178" />
            <path d={arrowHead(178, 82, 0, 6)} />
          </g>
        )}
        <g stroke="none">
          <T x={70} y={110} color="var(--gold)" bold>
            A
          </T>
          <T x={240} y={110} color="var(--gold)" bold>
            K
          </T>
          {id === 'd' ? (
            <T x={148} y={74} color="var(--blue)" size={10}>
              I
            </T>
          ) : null}
        </g>
      </g>
    )
  }
  if (id === 'npn') {
    return (
      <g stroke={STROKE} strokeWidth={sw} fill="none">
        <circle cx="168" cy="120" r="36" strokeWidth="1.5" />
        <path d="M50 120 H150" />
        <path d="M150 98 V142" strokeWidth="3.5" />
        <path d="M150 110 L182 90 V44" />
        <path d="M150 130 L182 150 V196" />
        <path d={arrowHead(178, 147.5, Math.atan2(20, 32), 9)} strokeWidth="2" />
        <g stroke="none">
          <T x={70} y={110} color="var(--gold)" bold>
            B
          </T>
          <T x={196} y={54} anchor="start" color="var(--gold)" bold>
            C
          </T>
          <T x={196} y={194} anchor="start" color="var(--gold)" bold>
            E
          </T>
        </g>
      </g>
    )
  }
  if (id === 'nmos') {
    return (
      <g stroke={STROKE} strokeWidth={sw} fill="none">
        <path d="M50 120 H130 M130 94 V146" />
        <path d="M144 94 V108 M144 113 V127 M144 132 V146" strokeWidth="3" />
        <path d="M144 101 H178 V44" />
        <path d="M144 139 H178 V196" />
        <path d="M150 120 H178 V139" />
        <path d={arrowHead(150, 120, Math.PI, 8)} strokeWidth="2" />
        <g stroke="none">
          <T x={70} y={110} color="var(--gold)" bold>
            G
          </T>
          <T x={192} y={54} anchor="start" color="var(--gold)" bold>
            D
          </T>
          <T x={192} y={194} anchor="start" color="var(--gold)" bold>
            S
          </T>
        </g>
      </g>
    )
  }
  return (
    <g stroke={STROKE} strokeWidth={sw} fill="none">
      <path d="M120 70 L120 170 L210 120 Z" />
      <path d="M50 95 H120 M50 145 H120 M210 120 H260 M165 95 V60 M165 145 V180" />
      <g stroke="none">
        <T x={131} y={100} color={STROKE} size={16} bold>
          −
        </T>
        <T x={131} y={150} color={STROKE} size={16} bold>
          +
        </T>
        <T x={174} y={66} anchor="start" color="var(--gold)" size={10}>
          V+
        </T>
        <T x={174} y={180} anchor="start" color="var(--gold)" size={10}>
          V−
        </T>
        <T x={244} y={110} color="var(--gold)" size={10}>
          OUT
        </T>
      </g>
    </g>
  )
}

function Real({ id }: { id: PartId }) {
  const { t } = useLocale()
  if (id === 'r') {
    const bands = [
      { x: 488, c: '#e8c51e' },
      { x: 508, c: '#7f3fbf' },
      { x: 528, c: '#d0342c' },
      { x: 578, c: '#c9a227' },
    ]
    return (
      <g>
        <line x1="380" y1="96" x2="690" y2="96" stroke={LEAD} strokeWidth="3" />
        <rect x="470" y="80" width="130" height="32" rx="14" fill="#d9c7a1" stroke="var(--text-2)" />
        {bands.map((b) => (
          <rect key={b.x} x={b.x} y="80" width="9" height="32" fill={b.c} />
        ))}
        <T x={535} y={134} color="var(--muted)" size={10}>
          {t(L.bands)}
        </T>
        <rect x="500" y="156" width="70" height="28" rx="2" fill="#2a2f36" stroke="var(--text-3)" />
        <rect x="500" y="156" width="11" height="28" fill={LEAD} />
        <rect x="559" y="156" width="11" height="28" fill={LEAD} />
        <T x={535} y={175} color="#f0f0f0" size={12}>
          472
        </T>
        <T x={580} y={175} anchor="start" color="var(--muted)" size={10}>
          {t(L.chip)}
        </T>
      </g>
    )
  }
  if (id === 'c') {
    return (
      <g>
        <rect x="380" y="104" width="76" height="32" rx="2" fill="#c8a77a" />
        <rect x="380" y="104" width="12" height="32" fill={LEAD} />
        <rect x="444" y="104" width="12" height="32" fill={LEAD} />
        <T x={418} y={158} color="var(--muted)" size={10}>
          {t(L.mlcc)}
        </T>
        <line x1="572" y1="150" x2="572" y2="212" stroke={LEAD} strokeWidth="3" />
        <line x1="606" y1="150" x2="606" y2="192" stroke={LEAD} strokeWidth="3" />
        <rect x="552" y="58" width="74" height="92" rx="6" fill="var(--blue-bg-2)" stroke="var(--text-2)" />
        <rect x="598" y="58" width="16" height="92" fill="var(--line-3)" />
        {[76, 100, 124].map((y) => (
          <T key={y} x={606} y={y} color="var(--well)" size={14} bold>
            −
          </T>
        ))}
        <T x={560} y={210} anchor="end" color="var(--gold)" size={13} bold>
          +
        </T>
        <T x={618} y={192} anchor="start" color="var(--gold)" size={13} bold>
          −
        </T>
        <T x={640} y={84} anchor="start" color="var(--muted)" size={10}>
          {t(L.elec)}
        </T>
        <T x={640} y={100} anchor="start" color="var(--muted)" size={10}>
          {t(L.stripe)}
        </T>
      </g>
    )
  }
  if (id === 'l') {
    const turns = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      return `M${535 + 26 * Math.cos(a)} ${120 + 26 * Math.sin(a)} L${535 + 52 * Math.cos(a)} ${120 + 52 * Math.sin(a)}`
    }).join(' ')
    return (
      <g>
        <circle cx="535" cy="120" r="39" fill="none" stroke="var(--line-2)" strokeWidth="24" />
        <path d={turns} stroke="#b87333" strokeWidth="3" />
        <path d="M498 150 L470 200 M572 150 L600 200" stroke="#b87333" strokeWidth="3" fill="none" />
      </g>
    )
  }
  if (id === 'd') {
    return (
      <g>
        <line x1="380" y1="120" x2="690" y2="120" stroke={LEAD} strokeWidth="3" />
        <rect x="480" y="104" width="110" height="32" rx="4" fill="#2a2f36" stroke="var(--text-3)" />
        <rect x="568" y="104" width="12" height="32" fill="#d9d9d9" />
        <T x={400} y={108} color="var(--gold)" bold>
          A
        </T>
        <T x={670} y={108} color="var(--gold)" bold>
          K
        </T>
      </g>
    )
  }
  if (id === 'led') {
    return (
      <g>
        <line x1="520" y1="158" x2="520" y2="214" stroke={LEAD} strokeWidth="3" />
        <line x1="550" y1="158" x2="550" y2="194" stroke={LEAD} strokeWidth="3" />
        <path d="M505 150 V96 A30 30 0 0 1 565 96 V150 Z" fill="var(--red)" opacity="0.45" stroke="var(--red-line)" />
        <path d="M498 150 H566 V160 H498 Z" fill="var(--red)" opacity="0.6" />
        <line x1="566" y1="146" x2="566" y2="164" stroke="var(--text)" strokeWidth="2" />
        <T x={512} y={212} anchor="end" color="var(--gold)" size={11}>
          {t(L.longLead)}
        </T>
        <T x={560} y={192} anchor="start" color="var(--gold)" size={11}>
          {t(L.shortLead)}
        </T>
      </g>
    )
  }
  if (id === 'npn') {
    return (
      <g>
        {[505, 535, 565].map((x) => (
          <line key={x} x1={x} y1="140" x2={x} y2="196" stroke={LEAD} strokeWidth="3" />
        ))}
        <path d="M485 140 V80 Q485 66 499 66 H571 Q585 66 585 80 V140 Z" fill="#2a2f36" stroke="var(--text-3)" />
        <T x={535} y={108} color="#f0f0f0" size={10}>
          2N3904
        </T>
        {['1', '2', '3'].map((n, i) => (
          <T key={n} x={505 + i * 30} y={210} color="var(--dim)" size={10}>
            {n}
          </T>
        ))}
        {['E', 'B', 'C'].map((n, i) => (
          <T key={n} x={505 + i * 30} y={225} color="var(--gold)" bold>
            {n}
          </T>
        ))}
        <T x={600} y={100} anchor="start" color="var(--muted)" size={10}>
          {t(L.flat)}
        </T>
        <T x={600} y={116} anchor="start" color="var(--muted)" size={10}>
          {t(L.pinsNote)}
        </T>
      </g>
    )
  }
  if (id === 'nmos') {
    return (
      <g>
        <rect x="506" y="145" width="10" height="22" fill={LEAD} />
        <rect x="554" y="145" width="10" height="22" fill={LEAD} />
        <rect x="530" y="73" width="10" height="22" fill={LEAD} />
        <rect x="495" y="95" width="80" height="50" rx="3" fill="#2a2f36" stroke="var(--text-3)" />
        <T x={511} y={184} color="var(--gold)" bold>
          1 G
        </T>
        <T x={559} y={184} color="var(--gold)" bold>
          2 S
        </T>
        <T x={535} y={66} color="var(--gold)" bold>
          3 D
        </T>
        <T x={600} y={124} anchor="start" color="var(--muted)" size={10}>
          SOT-23
        </T>
      </g>
    )
  }
  const xs = [487, 519, 551, 583]
  return (
    <g>
      {xs.map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y="155" width="10" height="18" fill={LEAD} />
          <rect x={x - 5} y="67" width="10" height="18" fill={LEAD} />
          <T x={x} y={188} color={i === 0 ? 'var(--gold)' : 'var(--dim)'} size={10} bold={i === 0}>
            {i + 1}
          </T>
          <T x={x} y={60} color="var(--dim)" size={10}>
            {8 - i}
          </T>
        </g>
      ))}
      <rect x="468" y="85" width="134" height="70" rx="3" fill="#2a2f36" stroke="var(--text-3)" />
      <circle cx="482" cy="142" r="4" fill="#5a6068" />
      <T x={535} y={124} color="#f0f0f0" size={11}>
        LM358
      </T>
      <T x={620} y={124} anchor="start" color="var(--muted)" size={10}>
        SOP-8
      </T>
    </g>
  )
}

export function PartFig({ id }: { id: PartId }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 240" className="term-fig__svg" role="img" aria-label={t(L.partCap)}>
        <rect width="760" height="240" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="290" height="220" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="320" y="10" width="430" height="220" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={155} y={30} color="var(--muted)" size={12}>
          {t(S.symbol)}
        </T>
        <T x={535} y={30} color="var(--muted)" size={12}>
          {t(S.real)}
        </T>
        <Symbol id={id} />
        <Real id={id} />
      </svg>
      <figcaption>{t(L.partCap)}</figcaption>
    </figure>
  )
}

/* ---------- 特性曲线 ---------- */

const X0 = 80
const X1 = 690
const Y0 = 220
const Y1 = 30

export const IS = 1e-14
export const VT = 0.02585
export const diodeI = (v: number) => IS * (Math.exp(v / VT) - 1)
export const mosI = (vgs: number) => (vgs <= 1 ? 0 : 1e-3 * (vgs - 1) ** 2)
export const R_SET = [100, 220, 470]

export function fmtA(i: number) {
  const a = Math.abs(i)
  if (a < 1e-6) {
    return `${(i * 1e9).toFixed(a < 1e-8 ? 3 : 1)} nA`
  }
  if (a < 1e-3) {
    return `${(i * 1e6).toFixed(1)} µA`
  }
  return `${(i * 1e3).toFixed(2)} mA`
}

type Axis = { max: number; ticks: number[]; fmt: (v: number) => string; label: string }

export function DemoFig({ id, value }: { id: DemoId; value: number }) {
  const { t } = useLocale()
  let xa: Axis
  let ya: Axis
  let curves: Array<{ pts: Array<[number, number]>; label?: string; on: boolean }> = []
  let points: Array<[number, number]> = []
  let extra: ReactNode = null
  const sample = (fn: (x: number) => number, max: number, n = 120) => Array.from({ length: n + 1 }, (_, i): [number, number] => [(i / n) * max, fn((i / n) * max)])

  if (id === 'r') {
    xa = { max: 5, ticks: [0, 1, 2, 3, 4, 5], fmt: (v) => `${v}`, label: `${t(DEMO_LABEL.voltage)} V` }
    ya = { max: 0.05, ticks: [0, 0.01, 0.02, 0.03, 0.04, 0.05], fmt: (v) => `${(v * 1e3).toFixed(0)}`, label: `${t(DEMO_LABEL.current)} mA` }
    curves = R_SET.map((r, k) => ({ pts: sample((v) => v / r, 5, 2), label: `${r} Ω`, on: k === 0 }))
    points = R_SET.map((r) => [value, value / r])
  } else if (id === 'rc') {
    xa = { max: 5, ticks: [0, 1, 2, 3, 4, 5], fmt: (v) => `${v}τ`, label: 't' }
    ya = { max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], fmt: (v) => `${(v * 100).toFixed(0)}%`, label: t(DEMO_LABEL.vc) }
    const f = (x: number) => 1 - Math.exp(-x)
    curves = [{ pts: sample(f, 5), on: true }]
    points = [[value, f(value)]]
    extra = (
      <g>
        {[1, 2, 3, 4, 5].map((n) => {
          const x = X0 + (n / 5) * (X1 - X0)
          const y = Y0 - f(n) * (Y0 - Y1)
          return (
            <g key={n}>
              <line x1={x} y1={Y0} x2={x} y2={y} stroke="var(--line-3)" strokeDasharray="3 3" />
              <circle cx={x} cy={y} r="3" fill="var(--blue)" />
              <text x={x + 6} y={y + 16} fill="var(--blue)" fontSize="10" fontFamily="var(--mono)">
                {`${(f(n) * 100).toFixed(1)}%`}
              </text>
            </g>
          )
        })}
      </g>
    )
  } else if (id === 'd') {
    xa = { max: 0.8, ticks: [0, 0.2, 0.4, 0.6, 0.8], fmt: (v) => v.toFixed(1), label: `${t(DEMO_LABEL.voltage)} V` }
    ya = { max: 0.02, ticks: [0, 0.005, 0.01, 0.015, 0.02], fmt: (v) => `${(v * 1e3).toFixed(0)}`, label: `${t(DEMO_LABEL.current)} mA` }
    curves = [{ pts: sample(diodeI, 0.8, 200), on: true }]
    points = [[value, diodeI(value)]]
  } else {
    xa = { max: 5, ticks: [0, 1, 2, 3, 4, 5], fmt: (v) => `${v}`, label: 'VGS V' }
    ya = { max: 0.02, ticks: [0, 0.005, 0.01, 0.015, 0.02], fmt: (v) => `${(v * 1e3).toFixed(0)}`, label: 'ID mA' }
    curves = [{ pts: sample(mosI, 5), on: true }]
    points = [[value, mosI(value)]]
    const vx = X0 + (1 / 5) * (X1 - X0)
    extra = (
      <g>
        <rect x={X0} y={Y1} width={vx - X0} height={Y0 - Y1} fill="var(--red-bg)" opacity="0.5" />
        <line x1={vx} y1={Y0} x2={vx} y2={Y1} stroke="var(--red-line)" strokeDasharray="4 3" />
        <text x={vx + 6} y={Y1 + 14} fill="var(--red)" fontSize="11">
          Vth = 1 V
        </text>
        <text x={(X0 + vx) / 2} y={Y1 + 34} textAnchor="middle" fill="var(--red)" fontSize="11">
          {t(DEMO_LABEL.off)}
        </text>
      </g>
    )
  }

  const px = (x: number) => X0 + (x / xa.max) * (X1 - X0)
  const py = (y: number) => Y0 - (Math.min(y, ya.max * 1.04) / ya.max) * (Y0 - Y1)
  const path = (pts: Array<[number, number]>) => {
    const kept = pts.filter(([, y]) => y <= ya.max * 1.04)
    return kept.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(' ')
  }

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(DEMO_LABEL.illustr)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        {extra && id === 'mos' ? extra : null}
        {ya.ticks.map((v) => (
          <g key={v}>
            <line x1={X0} y1={py(v)} x2={X1} y2={py(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <text x={X0 - 8} y={py(v) + 4} textAnchor="end" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
              {ya.fmt(v)}
            </text>
          </g>
        ))}
        {xa.ticks.map((v) => (
          <text key={v} x={px(v)} y={Y0 + 16} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
            {xa.fmt(v)}
          </text>
        ))}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <text x={X0} y={Y1 - 10} fill="var(--muted)" fontSize="11">
          {ya.label}
        </text>
        <text x={X1} y={Y0 + 34} textAnchor="end" fill="var(--muted)" fontSize="11">
          {xa.label}
        </text>
        {extra && id !== 'mos' ? extra : null}
        {curves.map((c, k) => {
          const last = c.pts[c.pts.length - 1]
          return (
            <g key={k}>
              <path d={path(c.pts)} fill="none" stroke={c.on ? 'var(--gold)' : 'var(--blue)'} strokeWidth={c.on ? 2.4 : 1.6} />
              {c.label ? (
                <text x={px(last[0]) + 6} y={py(last[1]) + 4} fill={c.on ? 'var(--gold)' : 'var(--blue)'} fontSize="11" fontFamily="var(--mono)">
                  {c.label}
                </text>
              ) : null}
            </g>
          )
        })}
        {points.map(([x, y], k) => (
          <circle key={k} cx={px(x)} cy={py(y)} r="6" fill="var(--card)" stroke={y > ya.max ? 'var(--red)' : 'var(--gold)'} strokeWidth="2.5" style={{ transition: 'cx 0.15s, cy 0.15s' }} />
        ))}
      </svg>
      <figcaption>{t(DEMO_LABEL.illustr)}</figcaption>
    </figure>
  )
}
