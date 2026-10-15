import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { S, type Num, type Outcome, type Sel } from './data/mosApps'

/* 原理图公用元件。导线先画，元件后画（元件的 card 底色会盖住穿过的导线）。 */

export type Hot = ReadonlySet<string>
export type FigProps = { sel: Sel; num: Num; fault: string; out: Outcome }

const C_OFF = 'var(--text-2)'
const C_HOT = 'var(--gold)'
const C_SIG = 'var(--blue)'
export const C_BAD = 'var(--red)'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, mono = false, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/** 图框：aria-label 和图注都走 i18n */
export function AppsSvg({ h, label, caption, children }: { h: number; label: LText; caption?: LText; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 760 ${h}`} className="term-fig__svg" role="img" aria-label={t(label)}>
        <rect width="760" height={h} rx="10" fill="var(--well)" />
        {children}
      </svg>
      <figcaption>{t(caption ?? S.caption)}</figcaption>
    </figure>
  )
}

/** 导线：在 hot 里就画成金色粗线，sig 表示信号线（蓝色） */
export function W({ d, id, hot, sig = false }: { d: string; id?: string; hot?: Hot; sig?: boolean }) {
  const on = id !== undefined && hot !== undefined && hot.has(id)
  return <path d={d} fill="none" stroke={on ? (sig ? C_SIG : C_HOT) : C_OFF} strokeWidth={on ? 3.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
}

export function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.2" fill="var(--text)" />
}

/** 被拿掉的元件：变淡并盖一个红叉 */
function Gone({ x, y, missing, children }: { x: number; y: number; missing?: boolean; children: ReactNode }) {
  if (!missing) {
    return <>{children}</>
  }
  return (
    <g>
      <g opacity="0.3">{children}</g>
      <path d={`M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x - 9} ${y + 9} L${x + 9} ${y - 9}`} stroke={C_BAD} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

/** 电阻：竖放时上下端点在 y ± 16，横放时左右端点在 x ± 16 */
export function Res({ x, y, vertical = true, on = false, missing = false }: { x: number; y: number; vertical?: boolean; on?: boolean; missing?: boolean }) {
  return (
    <Gone x={x} y={y} missing={missing}>
      <rect x={x + (vertical ? -7 : -16)} y={y + (vertical ? -16 : -7)} width={vertical ? 14 : 32} height={vertical ? 32 : 14} fill="var(--card)" stroke={on ? C_HOT : 'var(--text)'} strokeWidth="2" />
    </Gone>
  )
}

/** 电容：竖放（极板水平）时两个端点在 y ± 4，横放时在 x ± 4 */
export function Cap({ x, y, vertical = true, missing = false }: { x: number; y: number; vertical?: boolean; missing?: boolean }) {
  const d = vertical ? `M${x - 12} ${y - 4} H${x + 12} M${x - 12} ${y + 4} H${x + 12}` : `M${x - 4} ${y - 12} V${y + 12} M${x + 4} ${y - 12} V${y + 12}`
  return (
    <Gone x={x} y={y} missing={missing}>
      <path d={d} stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
    </Gone>
  )
}

export function Gnd({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} V${y + 5} M${x - 10} ${y + 5} H${x + 10} M${x - 6} ${y + 9} H${x + 6} M${x - 2} ${y + 13} H${x + 2}`} stroke={C_OFF} strokeWidth="2" strokeLinecap="round" fill="none" />
}

type DioKind = 'd' | 'z' | 'led'

/** 二极管：rot = 0 阳极在左、阴极在右（端点 x ± 6）；90 阳极在上；-90 阳极在下 */
export function Dio({ x, y, rot = 0, kind = 'd', on = false, missing = false }: { x: number; y: number; rot?: 0 | 90 | -90; kind?: DioKind; on?: boolean; missing?: boolean }) {
  const col = on ? C_HOT : 'var(--text)'
  return (
    <Gone x={x} y={y} missing={missing}>
      <g transform={`translate(${x} ${y}) rotate(${rot})`} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round">
        <path d="M-6 -7 L-6 7 L6 0 Z" fill="var(--card)" />
        <path d={kind === 'z' ? 'M9 -9 L6 -7 L6 7 L3 9' : 'M6 -7 V7'} />
        {kind === 'led' ? <path d="M-3 -10 L3 -17 M0 -17 L3 -17 L3 -14 M3 -10 L9 -17 M6 -17 L9 -17 L9 -14" strokeWidth="1.6" /> : null}
      </g>
    </Gone>
  )
}

export type MosGeo = { x: number; y: number; rot?: 0 | 90; flip?: boolean; scale?: number }

/** MOS 的引脚坐标：g 栅极；t 未翻转时的上端（NMOS 是漏极，PMOS 是源极）；b 下端 */
export function mosPin(m: MosGeo, p: 'g' | 't' | 'b'): [number, number] {
  const s = m.scale ?? 1
  let lx = p === 'g' ? -30 : 10
  let ly = p === 'g' ? 0 : p === 't' ? -30 : 30
  if (m.flip) {
    ly = -ly
  }
  lx *= s
  ly *= s
  return m.rot === 90 ? [m.x - ly, m.y + lx] : [m.x + lx, m.y + ly]
}

/**
 * 增强型 MOS 符号（栅极在左，沟道三段，体端子接源极）。
 * NMOS：漏极在上，体箭头指向沟道；PMOS：源极在上，体箭头背离沟道。体二极管阴极在上端。
 */
export function Mos({ kind, x, y, rot = 0, flip = false, scale = 1, on = false, dio = false, noDiode = false, missing = false }: MosGeo & { kind: 'n' | 'p'; on?: boolean; dio?: boolean; noDiode?: boolean; missing?: boolean }) {
  const ch = on ? C_HOT : 'var(--text)'
  const bodyY = kind === 'n' ? 14 : -14
  return (
    <Gone x={x} y={y} missing={missing}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale} ${flip ? -scale : scale})`} fill="none" strokeLinejoin="round" strokeLinecap="round">
        <g stroke="var(--text)" strokeWidth="2">
          <path d="M-30 0 H-12 M-12 -14 V14" />
          <path d="M-6 -14 H10 V-30 M-6 14 H10 V30" />
          <path d={`M-6 0 H10 V${bodyY}`} />
        </g>
        <path d="M-6 -18 V-10 M-6 -4 V4 M-6 10 V18" stroke={ch} strokeWidth="3" />
        <polygon points={kind === 'n' ? '-6,0 1,-4 1,4' : '4,0 -2,-4 -2,4'} fill="var(--text)" stroke="none" />
        {noDiode ? null : (
          <g stroke={dio ? C_HOT : 'var(--text)'} strokeWidth="2">
            <path d="M10 -14 H26 V-4 M26 4 V14 H10" />
            <path d="M21 4 H31 L26 -4 Z" fill="var(--card)" />
            <path d="M21 -4 H31" />
          </g>
        )}
      </g>
    </Gone>
  )
}

/** 一个独立的数值标注：红色表示结果不好 */
export function Tag({ x, y, text, anchor = 'start', bad = false }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; bad?: boolean }) {
  return (
    <T x={x} y={y} anchor={anchor} size={10} mono color={bad ? C_BAD : 'var(--blue)'} bold>
      {text}
    </T>
  )
}
