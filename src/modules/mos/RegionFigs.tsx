import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { REGIONS } from './data/mosRegion'
import { FIG } from './data/mosRegionFig'
import { VDD, VTN, nRegion, type Region } from './model'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, mono = false, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily={mono ? 'var(--mono)' : undefined} fontWeight={bold ? 700 : undefined}>
      {children}
    </text>
  )
}

/** 区域颜色：截止灰、线性金、饱和绿（电子固定用蓝色，不和区域色混） */
export const REGION_COLOR: Record<Region, string> = {
  cutoff: 'var(--muted)',
  linear: 'var(--gold)',
  sat: 'var(--green)',
}

export function regionName(id: Region) {
  return (REGIONS.find((r) => r.id === id) ?? REGIONS[0]).name
}

export function fmtId(i: number) {
  if (i <= 0) {
    return '0 mA'
  }
  if (i >= 1e-5) {
    return `${(i / 1e-3).toFixed(2)} mA`
  }
  return `${(i / 1e-6).toFixed(1)} µA`
}

/* ---------- 沟道厚度分布 ---------- */

/** 饱和区夹断点向源极位移的放大系数（真实位移很小，这里放大到看得见） */
const PINCH_SHIFT = 0.12

export type Profile = {
  /** 夹断点位置，0 = 源端，1 = 漏端；没有夹断时为 1 */
  xp: number
  /** u = 0..1 处的沟道电压 V */
  volt: (u: number) => number
  /** u = 0..1 处的沟道厚度，单位 V（正比于 Vgs − V(x) − Vth） */
  thick: (u: number) => number
}

export function channelProfile(vgs: number, vds: number): Profile {
  const vov = vgs - VTN
  const region = nRegion(vgs, vds)
  if (region === 'cutoff') {
    return { xp: 0, volt: (u) => vds * u ** 3, thick: () => 0 }
  }
  if (region === 'linear') {
    const edge = vov - vds
    const thick = (u: number) => Math.sqrt(Math.max(0, vov * vov - (vov * vov - edge * edge) * u))
    return { xp: 1, volt: (u) => vov - thick(u), thick }
  }
  const xp = Math.max(0.6, 1 - PINCH_SHIFT * Math.sqrt(vds - vov))
  const thick = (u: number) => (u < xp ? vov * Math.sqrt(1 - u / xp) : 0)
  const volt = (u: number) => (u < xp ? vov - thick(u) : vov + ((vds - vov) * (u - xp)) / Math.max(1 - xp, 1e-6))
  return { xp, volt, thick }
}

/* ---------- 剖面图 ---------- */

const VW = 480
const VH = 330
const XS = 163
const XD = 317
const SURF = 170
const PX_PER_V = 8.5
const ux = (u: number) => XS + u * (XD - XS)

function channelPath(p: Profile) {
  const end = Math.min(p.xp, 1)
  const n = 48
  const pts: string[] = []
  for (let i = 0; i <= n; i += 1) {
    const u = (end * i) / n
    pts.push(`L${ux(u).toFixed(1)} ${(SURF + p.thick(u) * PX_PER_V).toFixed(1)}`)
  }
  return `M${XS} ${SURF} ${pts.join(' ')} L${ux(end).toFixed(1)} ${SURF} Z`
}

function depletionPath(p: Profile) {
  const n = 24
  const pts: string[] = []
  for (let i = 0; i <= n; i += 1) {
    const u = i / n
    pts.push(`L${ux(u).toFixed(1)} ${(SURF + 50 + (10 * Math.max(p.volt(u), 0)) / VDD).toFixed(1)}`)
  }
  return `M${XS} ${SURF} ${pts.join(' ')} L${XD} ${SURF} Z`
}

export function CrossFig({ vgs, vds }: { vgs: number; vds: number }) {
  const { t } = useLocale()
  const region = nRegion(vgs, vds)
  const p = channelProfile(vgs, vds)
  const hasChannel = region !== 'cutoff'
  const xpx = ux(p.xp)
  const gap = XD - xpx
  const vov = vgs - VTN

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.crossAria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />
        <T x={16} y={18} anchor="start" size={11} color="var(--text)" mono>{`Vgs ${vgs.toFixed(2)} V`}</T>
        <T x={176} y={18} anchor="start" size={11} color="var(--text)" mono>{`Vds ${vds.toFixed(2)} V`}</T>
        <T x={336} y={18} anchor="start" size={11} color="var(--text)" mono>{`Vov ${vov.toFixed(2)} V`}</T>

        <rect x="10" y={SURF} width="460" height="130" fill="var(--red)" fillOpacity="0.1" stroke="var(--line-2)" />
        <rect x="22" y={SURF} width="28" height="20" fill="var(--red)" fillOpacity="0.3" />
        <rect x="70" y={SURF} width={XS - 70} height="46" fill="var(--blue)" fillOpacity="0.28" />
        <rect x={XD} y={SURF} width={410 - XD} height="46" fill="var(--blue)" fillOpacity="0.28" />

        <path d={depletionPath(p)} fill="var(--gold)" fillOpacity="0.14" stroke="var(--gold)" strokeDasharray="4 3" strokeOpacity="0.8" />
        {hasChannel ? <path d={channelPath(p)} fill="var(--blue)" fillOpacity="0.85" /> : null}
        {region === 'sat' && gap > 6 ? <rect x={xpx} y={SURF} width={gap} height="14" fill="var(--gold)" fillOpacity="0.35" /> : null}
        {region === 'sat' && gap > 16 ? (
          <g fill="var(--blue)" stroke="var(--blue)">
            <path d={`M${xpx + 2} ${SURF + 7} H${XD - 8}`} strokeDasharray="3 2" fill="none" />
            <path d={`M${XD - 9} ${SURF + 3} L${XD - 2} ${SURF + 7} L${XD - 9} ${SURF + 11} Z`} />
          </g>
        ) : null}

        <rect x="155" y="160" width="170" height="10" fill="var(--muted)" fillOpacity="0.5" stroke="var(--text-2)" />
        <rect x="155" y="126" width="170" height="34" fill="var(--dim)" fillOpacity="0.5" stroke="var(--text-2)" />
        <g fill="var(--text-2)">
          <rect x="233" y="104" width="14" height="22" />
          <rect x="105" y="142" width="14" height="28" />
          <rect x="356" y="142" width="14" height="28" />
          <rect x="29" y="142" width="14" height="28" />
        </g>
        {region === 'sat' ? <circle cx={xpx} cy={SURF} r="4" fill="var(--red)" stroke="var(--well)" /> : null}

        <path d="M155 165 L128 100" stroke="var(--muted)" strokeWidth="1" fill="none" />
        <T x={124} y={96} anchor="end" size={10} color="var(--muted)">{t(FIG.oxide)}</T>
        <T x={240} y={148} size={11} color="var(--text-2)">{t(FIG.poly)}</T>
        <T x={240} y={98} size={12} color="var(--text)" bold>G</T>
        <T x={112} y={134} size={12} color="var(--text)" bold>S</T>
        <T x={363} y={134} size={12} color="var(--text)" bold>D</T>
        <T x={36} y={134} size={12} color="var(--text)" bold>B</T>
        <T x={36} y={184} size={10} color="var(--text-2)" mono>p+</T>
        <T x={116} y={200} size={11} color="var(--text-2)" mono>n+</T>
        <T x={363} y={200} size={11} color="var(--text-2)" mono>n+</T>
        <T x={240} y={290} size={11} color="var(--muted)">{t(FIG.substrate)}</T>

        <rect x="16" y="304" width="14" height="8" fill="var(--blue)" fillOpacity="0.85" />
        <T x={36} y={312} anchor="start" size={10} color="var(--muted)">{t(FIG.legChannel)}</T>
        <rect x="130" y="304" width="14" height="8" fill="var(--gold)" fillOpacity="0.3" stroke="var(--gold)" strokeDasharray="3 2" />
        <T x={150} y={312} anchor="start" size={10} color="var(--muted)">{t(FIG.legDepl)}</T>
        <circle cx="222" cy="308" r="4" fill="var(--red)" />
        <T x={232} y={312} anchor="start" size={10} color="var(--muted)">{t(FIG.legPinch)}</T>
        <T x={VW - 10} y={314} anchor="end" size={13} color={REGION_COLOR[region]} bold>{t(regionName(region))}</T>
      </svg>
      <figcaption>{t(FIG.crossCap)}</figcaption>
    </figure>
  )
}
