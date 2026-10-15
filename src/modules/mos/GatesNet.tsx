import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { conducts, leafOn, outLevel, sigLabel, type Level, type Net, type Sig } from './gatesModel'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, mono = false, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily={mono ? 'var(--mono)' : undefined} fontWeight={bold ? 700 : undefined}>
      {children}
    </text>
  )
}

export const LW = 120
export const LH = 64
const GAP = 16
const TX = 70
export const DIM = 'var(--muted)'
export const HI_UP = 'var(--gold)'
export const HI_DOWN = 'var(--blue)'

export function size(net: Net): { w: number; h: number } {
  if (net.k === 'leaf') {
    return { w: LW, h: LH }
  }
  const sizes = net.c.map(size)
  if (net.k === 'ser') {
    return { w: Math.max(...sizes.map((s) => s.w)), h: sizes.reduce((sum, s) => sum + s.h, 0) + GAP * (sizes.length - 1) }
  }
  return { w: sizes.reduce((sum, s) => sum + s.w, 0), h: Math.max(...sizes.map((s) => s.h)) }
}

const wire = (x1: number, y1: number, x2: number, y2: number, live: boolean, hl: string, key: string) => (
  <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={live ? hl : DIM} strokeWidth={live ? 3.5 : 2} strokeLinecap="round" />
)

type DrawProps = { net: Net; x: number; y: number; live: boolean; hl: string; sig: Sig; onT: string; offT: string }

/** 单只晶体管：垂直画，上端子 y，下端子 y + LH；NMOS 箭头在源极（下端）指向沟道，PMOS 箭头在源极（上端）背离沟道 */
function Leaf({ net, x, y, live, hl, sig, onT, offT }: DrawProps) {
  if (net.k !== 'leaf') {
    return null
  }
  const tx = x + TX
  const on = leafOn(net, sig)
  const col = on ? 'var(--green)' : DIM
  const wc = live ? hl : DIM
  const ww = live ? 3.5 : 2
  return (
    <g>
      {on ? <rect x={x + 6} y={y + 4} width={LW - 12} height={LH - 8} rx={8} fill="var(--green)" fillOpacity={0.12} /> : null}
      <path d={`M${tx} ${y} V${y + 21} H${tx - 12} M${tx} ${y + LH} V${y + 43} H${tx - 12}`} fill="none" stroke={wc} strokeWidth={ww} strokeLinecap="round" />
      <path d={`M${tx - 12} ${y + 17} V${y + 25} M${tx - 12} ${y + 28} V${y + 36} M${tx - 12} ${y + 39} V${y + 47}`} fill="none" stroke={live ? hl : col} strokeWidth={3} />
      <path d={`M${tx - 18} ${y + 16} V${y + 48}`} fill="none" stroke={col} strokeWidth={3} />
      {net.p ? (
        <g>
          <circle cx={tx - 22.5} cy={y + 32} r={3.5} fill="var(--card)" stroke={col} strokeWidth={1.8} />
          <path d={`M${tx - 26} ${y + 32} H${tx - 40}`} stroke={col} strokeWidth={2} />
          <polygon points={`${tx - 3},${y + 21} ${tx - 9},${y + 17.5} ${tx - 9},${y + 24.5}`} fill={wc} />
        </g>
      ) : (
        <g>
          <path d={`M${tx - 18} ${y + 32} H${tx - 40}`} stroke={col} strokeWidth={2} />
          <polygon points={`${tx - 12},${y + 43} ${tx - 6},${y + 39.5} ${tx - 6},${y + 46.5}`} fill={wc} />
        </g>
      )}
      <T x={tx - 44} y={y + 36} anchor="end" size={12} color="var(--text)" bold>
        {sigLabel(net.g)}
      </T>
      <T x={tx + 8} y={y + 36} anchor="start" size={10} color={col} bold={on}>
        {on ? onT : offT}
      </T>
    </g>
  )
}

export function Draw(props: DrawProps) {
  const { net, x, y, live, hl, sig } = props
  if (net.k === 'leaf') {
    return <Leaf {...props} />
  }
  const { w, h } = size(net)
  const cx = x + w / 2
  if (net.k === 'ser') {
    let cy = y
    const parts: ReactNode[] = []
    net.c.forEach((child, i) => {
      const s = size(child)
      parts.push(<Draw key={`n${i}`} {...props} net={child} x={x + (w - s.w) / 2} y={cy} />)
      if (i > 0) {
        parts.push(wire(cx, cy - GAP, cx, cy, live, hl, `w${i}`))
      }
      cy += s.h + GAP
    })
    return <g>{parts}</g>
  }
  let cursor = x
  const parts: ReactNode[] = []
  const centres: number[] = []
  net.c.forEach((child, i) => {
    const s = size(child)
    const ccx = cursor + s.w / 2
    centres.push(ccx)
    const childLive = live && conducts(child, sig)
    parts.push(<Draw key={`n${i}`} {...props} net={child} x={cursor} y={y} live={childLive} />)
    parts.push(wire(ccx, y, cx, y, childLive, hl, `t${i}`))
    parts.push(wire(ccx, y + h, cx, y + h, childLive, hl, `b${i}`))
    if (s.h < h) {
      parts.push(wire(ccx, y + s.h, ccx, y + h, childLive, hl, `e${i}`))
    }
    cursor += s.w
  })
  const dots = [...centres, cx].flatMap((px, i) => [<circle key={`dt${i}`} cx={px} cy={y} r={3} fill={DIM} />, <circle key={`db${i}`} cx={px} cy={y + h} r={3} fill={DIM} />])
  return (
    <g>
      {parts}
      {dots}
    </g>
  )
}

const LEVEL_COLOR: Record<Level, string> = { '0': HI_DOWN, '1': HI_UP, Z: DIM, X: 'var(--red)' }

const PUN_LABEL = loc('上拉网络（PMOS）', 'Pull-up (PMOS)')
const PDN_LABEL = loc('下拉网络（NMOS）', 'Pull-down (NMOS)')
const ON_LABEL = loc('导通', 'ON')
const OFF_LABEL = loc('关断', 'OFF')

const VW = 540
const XC = 215
const X_OUT = 430

type GateNetProps = { pun: Net; pdn: Net; sig: Sig; label: string; caption: string }

/** 完整的门：VDD 轨 → 上拉网络 → OUT → 下拉网络 → GND */
export function GateNetFig({ pun, pdn, sig, label, caption }: GateNetProps) {
  const { t } = useLocale()
  const sp = size(pun)
  const sn = size(pdn)
  const wide = Math.max(sp.w, sn.w, 240)
  const upLive = conducts(pun, sig)
  const downLive = conducts(pdn, sig)
  const level = outLevel(pun, pdn, sig)
  const yRail = 26
  const yPun = 50
  const yOut = yPun + sp.h + 18
  const yPdn = yOut + 18
  const yGnd = yPdn + sn.h + 22
  const vh = yGnd + 46
  const outColor = LEVEL_COLOR[level]
  const props = { sig, onT: t(ON_LABEL), offT: t(OFF_LABEL) }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${vh}`} className="term-fig__svg" role="img" aria-label={label}>
        <rect width={VW} height={vh} rx="10" fill="var(--well)" />
        <path d={`M${XC - wide / 2 - 16} ${yRail} H${XC + wide / 2 + 16}`} stroke="var(--text-2)" strokeWidth="3" />
        <T x={XC - wide / 2 - 16} y={yRail - 8} anchor="start" size={12} color="var(--text)" bold>
          VDD
        </T>
        {wire(XC, yRail, XC, yPun, upLive, HI_UP, 'rail')}
        <Draw net={pun} x={XC - sp.w / 2} y={yPun} live={upLive} hl={HI_UP} {...props} />
        {wire(XC, yPun + sp.h, XC, yOut, upLive, HI_UP, 'pu')}
        {wire(XC, yOut, XC, yPdn, downLive, HI_DOWN, 'pd')}
        {wire(XC, yOut, X_OUT, yOut, upLive || downLive, upLive ? HI_UP : HI_DOWN, 'out')}
        <circle cx={XC} cy={yOut} r={4.5} fill={outColor} />
        <circle cx={X_OUT} cy={yOut} r={5} fill="var(--card)" stroke={outColor} strokeWidth="2.5" />
        <T x={X_OUT + 12} y={yOut - 6} anchor="start" size={11} color="var(--muted)">
          OUT
        </T>
        <T x={X_OUT + 12} y={yOut + 14} anchor="start" size={14} color={outColor} bold mono>
          {`${label} = ${level}`}
        </T>
        <Draw net={pdn} x={XC - sn.w / 2} y={yPdn} live={downLive} hl={HI_DOWN} {...props} />
        {wire(XC, yPdn + sn.h, XC, yGnd, downLive, HI_DOWN, 'gnd')}
        <path d={`M${XC - 18} ${yGnd} H${XC + 18} M${XC - 11} ${yGnd + 7} H${XC + 11} M${XC - 4} ${yGnd + 14} H${XC + 4}`} stroke="var(--text-2)" strokeWidth="3" strokeLinecap="round" />
        <T x={XC + 28} y={yGnd + 12} anchor="start" size={12} color="var(--text)" bold>
          GND
        </T>
        <T x={XC + sp.w / 2 + 14} y={yPun + sp.h / 2 + 4} anchor="start" size={11} color="var(--muted)">
          {t(PUN_LABEL)}
        </T>
        <T x={XC + sn.w / 2 + 14} y={yPdn + sn.h / 2 + 4} anchor="start" size={11} color="var(--muted)">
          {t(PDN_LABEL)}
        </T>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
