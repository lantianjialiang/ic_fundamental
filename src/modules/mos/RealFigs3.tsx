import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { LATCH_LABEL } from './data/mosRealRel'
import { T } from './RealFigs'

type Dir = 'u' | 'd' | 'l' | 'r'

function Tri({ x, y, dir, color }: { x: number; y: number; dir: Dir; color: string }) {
  const pts: Record<Dir, string> = {
    u: `${x},${y - 7} ${x - 6},${y + 5} ${x + 6},${y + 5}`,
    d: `${x},${y + 7} ${x - 6},${y - 5} ${x + 6},${y - 5}`,
    l: `${x - 7},${y} ${x + 5},${y - 6} ${x + 5},${y + 6}`,
    r: `${x + 7},${y} ${x - 5},${y - 6} ${x - 5},${y + 6}`,
  }
  return <polygon points={pts[dir]} fill={color} stroke="var(--well)" strokeWidth="1" strokeLinejoin="round" />
}

/** 三极管符号：基极在左。PNP 发射极在上、箭头指向基极；NPN 发射极在下、箭头指向外 */
function Bjt({ cx, cy, kind, on, color }: { cx: number; cy: number; kind: 'pnp' | 'npn'; on: boolean; color: string }) {
  const bx = cx - 6
  const ex = cx + 8
  const stroke = on ? color : 'var(--text-2)'
  const b: [number, number] = kind === 'pnp' ? [bx, cy - 5] : [bx, cy + 5]
  const e: [number, number] = kind === 'pnp' ? [ex, cy - 15] : [ex, cy + 15]
  const [from, to] = kind === 'pnp' ? [e, b] : [b, e]
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const tip = [from[0] + dx * 0.85, from[1] + dy * 0.85]
  const pts = [tip, [tip[0] - 7 * ux - 3.5 * uy, tip[1] - 7 * uy + 3.5 * ux], [tip[0] - 7 * ux + 3.5 * uy, tip[1] - 7 * uy - 3.5 * ux]]
  return (
    <g fill="none" stroke={stroke} strokeWidth={on ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={cx} cy={cy} r="20" fill={on ? 'var(--card)' : 'none'} />
      <path d={`M${bx} ${cy - 10} V${cy + 10} M${bx} ${cy} H${cx - 30}`} />
      <path d={`M${bx} ${cy - 5} L${ex} ${cy - 15} V${cy - 26} M${bx} ${cy + 5} L${ex} ${cy + 15} V${cy + 26}`} />
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={stroke} />
    </g>
  )
}

function Diff({ x, w, y = 140, kind, label }: { x: number; w: number; y?: number; kind: 'n' | 'p'; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="26" fill={kind === 'n' ? 'var(--blue-bg-2)' : 'var(--gold-bg-2)'} stroke={kind === 'n' ? 'var(--blue)' : 'var(--gold)'} />
      <T x={x + w / 2} y={y + 17} size={10} color="var(--text)">
        {label}
      </T>
    </g>
  )
}

function Gate({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="130" width="54" height="10" fill="var(--fig-box-2)" stroke="var(--line-2)" />
      <rect x={x} y="118" width="54" height="12" fill="var(--neutral-fill)" stroke="var(--line-2)" />
      <T x={x + 27} y={110} size={10} color="var(--muted)">
        IN
      </T>
    </g>
  )
}

export function LatchFig({ step }: { step: number }) {
  const { t } = useLocale()
  const q1 = step >= 1
  const q2 = step >= 2
  const trig = step <= 2
  const big = step >= 4
  const width = step >= 4 ? 6 : step === 3 ? 3.5 : 2.5
  const R = 'var(--red)'
  const B = 'var(--blue)'
  const line = (children: ReactNode) => (
    <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  )
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 500" className="term-fig__svg" role="img" aria-label={t(LATCH_LABEL.cap)}>
        <rect width="760" height="500" rx="10" fill="var(--well)" />
        <rect x="20" y="140" width="720" height="160" fill="var(--gold-bg)" stroke="var(--gold-line)" />
        <path d="M372 140 H692 V250 a12 12 0 0 1 -12 12 H384 a12 12 0 0 1 -12 -12 Z" fill="var(--blue-bg)" stroke="var(--blue-line)" />
        <Diff x={44} w={40} kind="p" label="p+" />
        <Diff x={112} w={50} kind="n" label="n+" />
        <Diff x={228} w={50} kind="n" label="n+" />
        <Diff x={410} w={50} kind="p" label="p+" />
        <Diff x={526} w={50} kind="p" label="p+" />
        <Diff x={612} w={40} kind="n" label="n+" />
        <Gate x={168} />
        <Gate x={466} />
        {line(
          <>
            <path d="M64 140 V96 H137 V140" />
            <path d="M551 140 V96 H632 V140" />
            <path d="M253 140 V62 H435 V140" />
          </>,
        )}
        <T x={100} y={88} color="var(--text)" bold>
          GND
        </T>
        <T x={592} y={88} color="var(--text)" bold>
          VDD
        </T>
        <T x={290} y={54} color="var(--text)" bold>
          OUT
        </T>
        <T x={210} y={256} color="var(--gold)" size={11}>
          {t(LATCH_LABEL.sub)}
        </T>
        <T x={460} y={240} color="var(--blue)" size={11}>
          {t(LATCH_LABEL.n)}
        </T>
        <T x={72} y={232} anchor="start" color="var(--muted)" size={10}>
          Rsub
        </T>
        <T x={644} y={188} anchor="start" color="var(--muted)" size={10}>
          Rwell
        </T>
        {trig ? (
          <g>
            <path d="M380 16 V52" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
            <Tri x={380} y={46} dir="d" color="var(--gold)" />
            <T x={392} y={34} anchor="start" color="var(--gold)" bold>
              {t(LATCH_LABEL.trigger)}
            </T>
            <path d="M435 166 V176 H624 V166" fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray="6 4" strokeLinejoin="round" />
            <Tri x={500} y={176} dir="r" color="var(--gold)" />
          </g>
        ) : null}
        {q1 ? (
          <g>
            <path d="M551 166 V282 H64 V166" fill="none" stroke={R} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
            <Tri x={551} y={232} dir="d" color={R} />
            <Tri x={300} y={282} dir="l" color={R} />
            <Tri x={64} y={232} dir="u" color={R} />
            <T x={562} y={248} anchor="start" color={R} bold>
              Q1
            </T>
          </g>
        ) : null}
        {q2 ? (
          <g>
            <path d="M632 166 V200 H137 V166" fill="none" stroke={B} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
            <Tri x={632} y={184} dir="d" color={B} />
            <Tri x={440} y={200} dir="l" color={B} />
            <Tri x={250} y={200} dir="l" color={B} />
            <Tri x={137} y={184} dir="u" color={B} />
            <T x={310} y={190} color={B} bold>
              Q2
            </T>
          </g>
        ) : null}
        {line(
          <>
            <path d="M250 330 H550 M250 480 H550" />
            <path d="M408 330 V346 M330 330 V342 M330 366 V372 H370 M350 372 V404 H508 V425 M408 398 V440 H470 M440 440 V452 M440 476 V480 M508 466 V480" />
            <rect x="324" y="342" width="12" height="24" />
            <rect x="434" y="452" width="12" height="24" />
          </>,
        )}
        <g fill="var(--text-2)">
          <circle cx="350" cy="372" r="3" />
          <circle cx="440" cy="440" r="3" />
        </g>
        <Bjt cx={400} cy={372} kind="pnp" on={q1} color={R} />
        <Bjt cx={500} cy={440} kind="npn" on={q2} color={B} />
        <T x={556} y={334} anchor="start" color="var(--text)" bold>
          VDD
        </T>
        <T x={556} y={484} anchor="start" color="var(--text)" bold>
          GND
        </T>
        <T x={312} y={358} anchor="end" color="var(--muted)" size={10}>
          Rwell
        </T>
        <T x={428} y={470} anchor="end" color="var(--muted)" size={10}>
          Rsub
        </T>
        <T x={428} y={376} anchor="start" color={q1 ? R : 'var(--muted)'} bold>
          {t(LATCH_LABEL.q1)}
        </T>
        <T x={530} y={444} anchor="start" color={q2 ? B : 'var(--muted)'} bold>
          {t(LATCH_LABEL.q2)}
        </T>
        {step >= 3 ? (
          <T x={200} y={414} color="var(--gold)" size={12} bold>
            {t(LATCH_LABEL.loop)}
          </T>
        ) : null}
        <rect x="590" y="310" width="150" height="180" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={604} y={338} anchor="start" size={11}>
          {t(LATCH_LABEL.q1)}
        </T>
        <T x={726} y={338} anchor="end" color={q1 ? R : 'var(--muted)'} size={11} bold>
          {t(q1 ? LATCH_LABEL.on : LATCH_LABEL.off)}
        </T>
        <T x={604} y={366} anchor="start" size={11}>
          {t(LATCH_LABEL.q2)}
        </T>
        <T x={726} y={366} anchor="end" color={q2 ? B : 'var(--muted)'} size={11} bold>
          {t(q2 ? LATCH_LABEL.on : LATCH_LABEL.off)}
        </T>
        <T x={604} y={394} anchor="start" size={11}>
          {t(LATCH_LABEL.path)}
        </T>
        <T x={604} y={412} anchor="start" color={big ? R : 'var(--muted)'} size={11} bold>
          {t(big ? LATCH_LABEL.large : LATCH_LABEL.small)}
        </T>
        {step >= 3 ? (
          <T x={604} y={434} anchor="start" color="var(--gold)" size={11} bold>
            {t(LATCH_LABEL.holdOn)}
          </T>
        ) : null}
        <path d="M604 456 H624" stroke={R} strokeWidth="3" />
        <T x={632} y={460} anchor="start" size={10}>
          {t(LATCH_LABEL.legendQ1)}
        </T>
        <path d="M604 474 H624" stroke={B} strokeWidth="3" />
        <T x={632} y={478} anchor="start" size={10}>
          {t(LATCH_LABEL.legendQ2)}
        </T>
      </svg>
      <figcaption>{t(LATCH_LABEL.cap)}</figcaption>
    </figure>
  )
}
