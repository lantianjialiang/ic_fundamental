import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { TERMS, TERMS_S, type TermId } from './data/pcbBasics'
import { widthMilForCurrent, milToMm, type LayerKind } from './data/pcbBasicsModel'
import { WIDTH_S } from './data/pcbBasicsText'

export const C = {
  mask: '#1f6b41',
  copper: '#c8893b',
  hot: '#ffd36a',
  silk: '#f2f2f2',
  body: '#2b2d30',
  lead: '#b9c0c8',
  hole: '#0d1117',
}

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

const L = {
  netlist: loc('网表（连接清单）', 'Netlist (connection list)'),
  netHint: loc('网络名 → 位号.引脚', 'net → designator.pin'),
}

const NETLIST: Array<{ name: string; pins: string }> = [
  { name: '3V3', pins: 'R1.1  U1.3  C1.1' },
  { name: 'SIG', pins: 'R1.2  U1.1' },
  { name: 'GND', pins: 'U1.2  C1.2' },
]

/* ---------- 迷你板：命名各个东西 ---------- */

export function TermsFig({ active, onPick }: { active: TermId; onPick: (id: TermId) => void }) {
  const { t } = useLocale()
  const lab = (id: TermId) => t((TERMS.find((x) => x.id === id) ?? TERMS[0]).title)
  const tr = active === 'net' ? C.hot : C.copper
  const pad = active === 'pad' ? C.hot : C.copper
  const refColor = (on: boolean) => (on ? C.hot : C.silk)
  const bodyStroke = active === 'comp' ? C.hot : 'none'
  const padRects: Array<[number, number, number, number]> = [
    [60, 72, 36, 40],
    [124, 72, 36, 40],
    [340, 72, 36, 40],
    [404, 72, 36, 40],
    [200, 180, 24, 40],
    [276, 180, 24, 40],
    [238, 80, 24, 40],
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="group" aria-label={t(TERMS_S.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <rect x="10" y="30" width="470" height="230" rx="8" fill={C.mask} stroke="var(--line-2)" />
        <Hit label={lab('net')} active={active === 'net'} onPick={() => onPick('net')}>
          <g fill="none" stroke={tr} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            <path d="M78 92 V52 H358 V92 M250 52 V100" />
            <path d="M142 92 V200 H212" />
            <path d="M288 200 V235 H422 V92" />
          </g>
        </Hit>
        <T x={210} y={44} color={active === 'net' ? C.hot : C.silk} size={11} bold>
          3V3
        </T>
        <T x={134} y={150} anchor="end" color={active === 'net' ? C.hot : C.silk} size={11} bold>
          SIG
        </T>
        <T x={322} y={226} color={active === 'net' ? C.hot : C.silk} size={11} bold>
          GND
        </T>
        <Hit label={lab('pad')} active={active === 'pad'} onPick={() => onPick('pad')}>
          <g fill={pad} stroke={active === 'pad' ? C.silk : 'none'} strokeWidth="1.5">
            {padRects.map((r) => (
              <rect key={`${r[0]}-${r[1]}`} x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx="2" />
            ))}
          </g>
        </Hit>
        <Hit label={lab('comp')} active={active === 'comp'} onPick={() => onPick('comp')}>
          <g stroke={bodyStroke} strokeWidth="2.5">
            <rect x="78" y="76" width="64" height="32" fill={C.body} />
            <rect x="78" y="76" width="12" height="32" fill={C.lead} stroke="none" />
            <rect x="130" y="76" width="12" height="32" fill={C.lead} stroke="none" />
            <rect x="358" y="76" width="64" height="32" fill={C.body} />
            <rect x="358" y="76" width="12" height="32" fill={C.lead} stroke="none" />
            <rect x="410" y="76" width="12" height="32" fill={C.lead} stroke="none" />
            <rect x="244" y="108" width="12" height="16" fill={C.lead} stroke="none" />
            <rect x="206" y="176" width="12" height="16" fill={C.lead} stroke="none" />
            <rect x="282" y="176" width="12" height="16" fill={C.lead} stroke="none" />
            <rect x="192" y="124" width="116" height="52" fill={C.body} />
            <circle cx="206" cy="164" r="3.5" fill={C.silk} stroke="none" />
          </g>
        </Hit>
        <Hit label={lab('refdes')} active={active === 'refdes'} onPick={() => onPick('refdes')}>
          <rect x="96" y="118" width="28" height="20" fill="transparent" />
          <T x={110} y={133} color={refColor(active === 'refdes')} size={13} bold>
            R1
          </T>
        </Hit>
        <Hit label={lab('refdes')} active={active === 'refdes'} onPick={() => onPick('refdes')}>
          <rect x="376" y="118" width="28" height="20" fill="transparent" />
          <T x={390} y={133} color={refColor(active === 'refdes')} size={13} bold>
            C1
          </T>
        </Hit>
        <Hit label={lab('refdes')} active={active === 'refdes'} onPick={() => onPick('refdes')}>
          <rect x="236" y="190" width="28" height="20" fill="transparent" />
          <T x={250} y={205} color={refColor(active === 'refdes')} size={13} bold>
            U1
          </T>
        </Hit>
        <Hit label={lab('via')} active={active === 'via'} onPick={() => onPick('via')}>
          <circle cx="355" cy="235" r="12" fill={active === 'via' ? C.hot : C.copper} stroke={C.silk} strokeWidth="1.5" />
          <circle cx="355" cy="235" r="4.5" fill={C.hole} />
        </Hit>
        <Hit label={lab('netlist')} active={active === 'netlist'} onPick={() => onPick('netlist')}>
          <rect x="495" y="30" width="255" height="230" rx="8" fill="var(--card)" stroke={active === 'netlist' ? 'var(--gold)' : 'var(--line)'} strokeWidth={active === 'netlist' ? 2 : 1} />
          <T x={510} y={56} anchor="start" color="var(--text)" size={13} bold>
            {t(L.netlist)}
          </T>
          {NETLIST.map((n, i) => (
            <g key={n.name}>
              <T x={510} y={92 + i * 52} anchor="start" color="var(--gold)" size={13} bold mono>
                {n.name}
              </T>
              <T x={510} y={112 + i * 52} anchor="start" color="var(--text-2)" size={12} mono>
                {n.pins}
              </T>
            </g>
          ))}
          <T x={510} y={246} anchor="start" color="var(--dim)" size={11}>
            {t(L.netHint)}
          </T>
        </Hit>
      </svg>
      <figcaption>{t(TERMS_S.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 线宽—电流曲线 ---------- */

function niceMax(v: number) {
  const steps = [1, 2, 5, 10, 20, 50, 100]
  for (const s of steps) {
    if (v <= s) {
      return s
    }
  }
  return 100
}

export function WidthFig({ amp, widthMm, dT, oz, layer }: { amp: number; widthMm: number; dT: number; oz: number; layer: LayerKind }) {
  const { t } = useLocale()
  const x0 = 70
  const x1 = 720
  const y0 = 190
  const y1 = 26
  const xMax = niceMax(amp * 1.3)
  const at = (i: number) => milToMm(widthMilForCurrent(i, dT, oz, layer))
  const yMax = Math.max(at(xMax), widthMm * 1.1)
  const sx = (i: number) => x0 + (i / xMax) * (x1 - x0)
  const sy = (w: number) => y0 - (w / yMax) * (y0 - y1)
  const pts: string[] = []
  for (let k = 0; k <= 40; k++) {
    const i = (k / 40) * xMax
    pts.push(`${k === 0 ? 'M' : 'L'}${sx(i).toFixed(1)} ${sy(at(Math.max(i, 1e-6))).toFixed(1)}`)
  }
  const px = sx(amp)
  const py = sy(widthMm)
  const flip = px > 560
  const label = `${amp.toFixed(2)} A · ${widthMm.toFixed(2)} mm`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 240" className="term-fig__svg" role="img" aria-label={t(WIDTH_S.cap)}>
        <rect width="760" height="240" rx="10" fill="var(--well)" />
        <path d={`M${x0} ${y1} V${y0} H${x1}`} fill="none" stroke="var(--line-3)" />
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <T x={sx(f * xMax)} y={206} color="var(--muted)" size={11}>
              {(f * xMax).toFixed(f === 0.5 && xMax < 5 ? 1 : 0)}
            </T>
            <T x={x0 - 8} y={sy(f * yMax) + 4} anchor="end" color="var(--muted)" size={11}>
              {(f * yMax).toFixed(yMax < 5 ? 1 : 0)}
            </T>
          </g>
        ))}
        <T x={x1} y={226} anchor="end" color="var(--dim)" size={11}>
          {t(WIDTH_S.capX)}
        </T>
        <T x={x0 + 6} y={y1 - 8} anchor="start" color="var(--dim)" size={11}>
          {t(WIDTH_S.capY)}
        </T>
        <path d={pts.join(' ')} fill="none" stroke="var(--blue)" strokeWidth="2.5" />
        <path d={`M${px} ${y0} V${py} M${x0} ${py} H${px}`} stroke="var(--gold)" strokeDasharray="4 4" fill="none" />
        <circle cx={px} cy={py} r="6" fill="var(--gold)" />
        <T x={flip ? px - 12 : px + 12} y={py - 10} anchor={flip ? 'end' : 'start'} color="var(--gold)" size={12} bold mono>
          {label}
        </T>
      </svg>
      <figcaption>{t(WIDTH_S.cap)}</figcaption>
    </figure>
  )
}
