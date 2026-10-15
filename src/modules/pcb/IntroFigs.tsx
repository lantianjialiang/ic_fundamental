import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { ROLE_LABEL, type RoleId } from './data/pcbIntro'

export const C = {
  cu: '#c8793f',
  cuPlated: '#e29a5a',
  core: '#4c6a45',
  pp: '#9aa85c',
  mask: '#2e9d4f',
  sn: '#d3dae1',
  steel: '#aab3bd',
  body: '#2a2f38',
  heat: '#ff8a4c',
}

export type Span = [number, number]

/** 从一组线段里挖掉若干空隙（孔、反焊盘、阻焊开窗） */
export function cut(segs: Span[], gaps: Span[]): Span[] {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0])
  const out: Span[] = []
  for (const [s0, s1] of segs) {
    let cur = s0
    for (const [g0, g1] of sorted) {
      if (g1 <= cur || g0 >= s1) {
        continue
      }
      if (g0 > cur) {
        out.push([cur, g0])
      }
      cur = Math.max(cur, g1)
    }
    if (cur < s1) {
      out.push([cur, s1])
    }
  }
  return out
}

export function Rects({ spans, y, h, fill }: { spans: Span[]; y: number; h: number; fill: string }) {
  return (
    <>
      {spans.map(([a, b]) => (
        <rect key={`${a}-${b}`} x={a} y={y} width={b - a} height={h} fill={fill} />
      ))}
    </>
  )
}

/** 金属化孔的孔壁（剖面里是两条细铜线） */
export function Barrel({ x, r, y0, y1 }: { x: number; r: number; y0: number; y1: number }) {
  return (
    <>
      <rect x={x - r - 1.6} y={y0} width="1.6" height={y1 - y0} fill={C.cuPlated} />
      <rect x={x + r} y={y0} width="1.6" height={y1 - y0} fill={C.cuPlated} />
    </>
  )
}

export function Txt({ x, y, children, anchor = 'middle', size = 11, fill = 'var(--text-2)', bold }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; size?: number; fill?: string; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={fill} fontWeight={bold ? 700 : undefined}>
      {children}
    </text>
  )
}

export function Lead({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="var(--muted)" strokeWidth="1" />
}

/** 剖面图右侧的一列标注：py 从上到下递增，文字行距至少 17，指引线按顺序不交叉 */
export function Side({ items, px = 496 }: { items: Array<{ py: number; text: string }>; px?: number }) {
  let prev = -100
  return (
    <>
      {items.map((it) => {
        const ly = Math.max(it.py, prev + 17)
        prev = ly
        return (
          <g key={it.text}>
            <Lead d={`M${px} ${it.py} L524 ${ly} H550`} />
            <circle cx={px} cy={it.py} r="1.8" fill="var(--text-2)" />
            <Txt x={556} y={ly + 4} anchor="start">
              {it.text}
            </Txt>
          </g>
        )
      })}
    </>
  )
}

/** 一条带圆点的指引线：from 是文字一端，to 是指到的结构 */
export function Note({ x, y, from, to, text, anchor = 'middle' }: { x: number; y: number; from: [number, number]; to: [number, number]; text: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      <Txt x={x} y={y} anchor={anchor}>
        {text}
      </Txt>
      <Lead d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} />
      <circle cx={to[0]} cy={to[1]} r="1.8" fill="var(--text-2)" />
    </>
  )
}

const L = {
  fence: loc('过孔栅栏', 'Via fence'),
}

const Y = { top: 150, l1: 152, pp1: 158, l2: 168, core: 173, l3: 195, pp2: 200, l4: 210, bot: 218 }
const BX0 = 30
const BX1 = 730
const SCREW = { x: 62, r: 6 }
const VIAS = [178, 190, 202].map((x) => ({ x, r: 3 }))
const PINS = [345, 380, 415].map((x) => ({ x, r: 4 }))
const FENCE = [553, 667].map((x) => ({ x, r: 3 }))
const HOLES = [SCREW, ...VIAS, ...PINS, ...FENCE]
const gapOf = (hs: Array<{ x: number; r: number }>, pad = 0): Span[] => hs.map((h) => [h.x - h.r, h.x + h.r] as Span).map(([a, b]) => [a - pad, b + pad] as Span)

const L1_SEGS: Span[] = [[46, 78], [136, 146], [166, 214], [234, 354], [370, 390], [405, 425], [532, 566], [588, 598], [622, 632], [654, 688]]
const L1_OPEN: Span[] = [[44, 80], [134, 148], [164, 216], [232, 248], [334, 356], [368, 392], [403, 427], [530, 568], [586, 600], [620, 634], [652, 690]]
const L4_SEGS: Span[] = [[336, 354], [370, 390], [405, 425], [170, 210], [545, 561], [659, 675]]
const L4_OPEN: Span[] = [[334, 356], [368, 392], [403, 427], [168, 212], [543, 563], [657, 677], [56, 68]]

/** 当前作用对应的结构亮起，其余变暗；点它就选中对应的卡片 */
function Part({ roles, active, label, onPick, children }: { roles: RoleId[]; active: RoleId; label: string; onPick: (id: RoleId) => void; children: ReactNode }) {
  const on = roles.includes(active)
  return (
    <Hit label={label} active={on} onPick={() => onPick(on ? active : roles[0])}>
      <g style={{ opacity: on ? 1 : 0.5, filter: on ? 'drop-shadow(0 0 3px var(--gold))' : undefined }}>{children}</g>
    </Hit>
  )
}

export function RoleFig({ active, onPick }: { active: RoleId; onPick: (id: RoleId) => void }) {
  const { t } = useLocale()
  const heatOn = active === 'heat'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 290" className="term-fig__svg" role="group" aria-label={t(ROLE_LABEL.cap)}>
        <defs>
          <marker id="introHeat" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={C.heat} />
          </marker>
        </defs>
        <rect width="760" height="290" rx="10" fill="var(--well)" />
        <Rects spans={cut([[BX0, BX1]], gapOf(HOLES))} y={Y.pp1} h={10} fill={C.pp} />
        <Rects spans={cut([[BX0, BX1]], gapOf(HOLES))} y={Y.core} h={22} fill={C.core} />
        <Rects spans={cut([[BX0, BX1]], gapOf(HOLES))} y={Y.pp2} h={10} fill={C.pp} />
        <Rects spans={cut([[BX0, BX1]], [...gapOf(HOLES), ...L1_OPEN])} y={Y.top} h={8} fill={C.mask} />
        <Rects spans={cut([[BX0, BX1]], [...gapOf(HOLES), ...L4_OPEN])} y={Y.l4} h={8} fill={C.mask} />
        <Rects spans={cut([[BX0, BX1]], gapOf(HOLES, 4))} y={Y.l3} h={5} fill={C.cu} />
        <Part roles={['heat', 'shield']} active={active} label={t(ROLE_LABEL.gnd)} onPick={onPick}>
          <Rects spans={cut([[BX0, BX1]], [...gapOf(HOLES), ...gapOf([PINS[0], PINS[2]], 4)])} y={Y.l2} h={5} fill={C.cu} />
        </Part>
        <Part roles={['connect']} active={active} label={t(ROLE_LABEL.trace)} onPick={onPick}>
          <Rects spans={cut(L1_SEGS, gapOf(HOLES))} y={Y.l1} h={6} fill={C.cu} />
        </Part>
        <Rects spans={cut(L4_SEGS, gapOf(HOLES))} y={Y.l4} h={6} fill={C.cu} />

        <Part roles={['support']} active={active} label={t(ROLE_LABEL.screw)} onPick={onPick}>
          <rect x="46" y={Y.bot} width="32" height="44" fill="#5b6470" />
          <rect x="24" y="262" width="86" height="14" fill="#3a424d" />
          <rect x="58" y="150" width="8" height="98" fill={C.steel} />
          <rect x="48" y="150" width="28" height="2" fill={C.steel} />
          <rect x="50" y="138" width="24" height="12" rx="2" fill={C.steel} />
          <path d="M56 144 H68" stroke="#5b6470" strokeWidth="2" />
        </Part>

        <Part roles={['heat']} active={active} label={t(ROLE_LABEL.vias)} onPick={onPick}>
          {VIAS.map((v) => (
            <Barrel key={v.x} x={v.x} r={v.r} y0={Y.l1} y1={Y.bot - 2} />
          ))}
        </Part>
        <rect x="130" y="121" width="120" height="26" rx="3" fill={C.body} stroke="var(--line)" />
        <Rects spans={[[136, 146], [166, 214], [236, 246]]} y={147} h={5} fill={C.sn} />
        <Txt x={190} y={138} fill="#e6edf3">QFN</Txt>

        <Part roles={['support', 'connect']} active={active} label={t(ROLE_LABEL.conn)} onPick={onPick}>
          <rect x="330" y="108" width="100" height="39" rx="3" fill="#2f3640" stroke="var(--line)" />
          {PINS.map((p) => (
            <g key={p.x}>
              <rect x={p.x - p.r} y={Y.l1} width={p.r * 2} height={Y.bot - 2 - Y.l1} fill={C.sn} />
              <Barrel x={p.x} r={p.r} y0={Y.l1} y1={Y.bot - 2} />
              <path d={`M${p.x - 9} ${Y.bot - 2} L${p.x - 3} 227 H${p.x + 3} L${p.x + 9} ${Y.bot - 2} Z`} fill={C.sn} />
              <rect x={p.x - 1.5} y="118" width="3" height="110" fill={C.steel} />
            </g>
          ))}
        </Part>

        <rect x="580" y="127" width="60" height="20" rx="2" fill={C.body} stroke="var(--line)" />
        <Rects spans={[[588, 598], [622, 632]]} y={147} h={5} fill={C.sn} />
        <Txt x={610} y={141} size={10} fill="#e6edf3">RF</Txt>
        <Part roles={['shield']} active={active} label={t(ROLE_LABEL.can)} onPick={onPick}>
          <path d="M540 149 V98 H680 V149" fill="rgba(170,179,189,0.14)" stroke={C.steel} strokeWidth="3" />
          <Rects spans={[[536, 544], [676, 684]]} y={147} h={5} fill={C.sn} />
          {FENCE.map((v) => (
            <Barrel key={v.x} x={v.x} r={v.r} y0={Y.l1} y1={Y.bot - 2} />
          ))}
        </Part>

        {heatOn ? (
          <g stroke={C.heat} strokeWidth="2" fill="none" markerEnd="url(#introHeat)">
            <path d="M190 153 V166" />
            <path d="M190 171 H132" />
            <path d="M190 171 H248" />
          </g>
        ) : null}

        <Txt x={24} y={64} anchor="start">{t(ROLE_LABEL.screw)}</Txt>
        <Lead d="M62 70 V136" />
        <Txt x={380} y={64}>{t(ROLE_LABEL.conn)}</Txt>
        <Lead d="M380 70 V106" />
        <Txt x={290} y={104}>{t(ROLE_LABEL.trace)}</Txt>
        <Lead d="M290 109 V151" />
        <Txt x={610} y={64}>{t(ROLE_LABEL.can)}</Txt>
        <Lead d="M610 70 V96" />
        <Txt x={190} y={252}>{t(ROLE_LABEL.vias)}</Txt>
        <Lead d="M190 240 V224" />
        <Txt x={292} y={252}>{t(ROLE_LABEL.gnd)}</Txt>
        <Lead d="M292 240 V172" />
        <Txt x={470} y={252}>{t(ROLE_LABEL.pwr)}</Txt>
        <Lead d="M470 240 V198" />
        <Txt x={610} y={252}>{t(L.fence)}</Txt>
        <Lead d="M596 242 L556 222 M624 242 L664 222" />
        <Txt x={118} y={274} anchor="start">{t(ROLE_LABEL.chassis)}</Txt>
      </svg>
      <figcaption>{t(ROLE_LABEL.cap)}</figcaption>
    </figure>
  )
}
