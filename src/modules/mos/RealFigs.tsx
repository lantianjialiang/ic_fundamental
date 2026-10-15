import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { DIODE_LABEL, type DiodeMode } from './data/mosReal'
import { SUB_LABEL } from './data/mosRealSub'
import { idTotal, swing, T_REF, TEACH, vthAt, type DevParams } from './realModel'
import { VDD } from './model'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400}>
      {children}
    </text>
  )
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }

/** 10 的 n 次方，带上标 */
export function pow10(n: number) {
  return `10${String(n)
    .split('')
    .map((ch) => SUP[ch] ?? ch)
    .join('')}`
}

/** 倍数：小的直接写，大的用 m × 10ⁿ */
export function fmtTimes(x: number) {
  if (x >= 0.1 && x < 1000) {
    return `× ${x < 10 ? x.toFixed(2) : x.toFixed(0)}`
  }
  const e = Math.floor(Math.log10(x))
  return `× ${(x / 10 ** e).toFixed(1)} × ${pow10(e)}`
}

export function fmtAmp(i: number) {
  const a = Math.abs(i)
  const units: Array<[number, string]> = [
    [1, 'A'],
    [1e-3, 'mA'],
    [1e-6, 'µA'],
    [1e-9, 'nA'],
    [1e-12, 'pA'],
    [1e-15, 'fA'],
  ]
  for (const [scale, unit] of units) {
    if (a >= scale) {
      return `${(i / scale).toFixed(2)} ${unit}`
    }
  }
  return `${(i / 1e-18).toFixed(2)} aA`
}

function Arrow({ x, y, dir, color = 'var(--bg)' }: { x: number; y: number; dir: 'u' | 'd' | 'l' | 'r'; color?: string }) {
  const pts: Record<string, string> = {
    u: `${x},${y - 7} ${x - 6},${y + 5} ${x + 6},${y + 5}`,
    d: `${x},${y + 7} ${x - 6},${y - 5} ${x + 6},${y - 5}`,
    l: `${x - 7},${y} ${x + 5},${y - 6} ${x + 5},${y + 6}`,
    r: `${x + 7},${y} ${x - 5},${y - 6} ${x - 5},${y + 6}`,
  }
  return <polygon points={pts[dir]} fill={color} stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round" />
}

/** NMOS 符号：D 在上、S 在下，体接源，体二极管阳极在源。cx, cy 是沟道中心 */
export function Nmos({ cx, cy, on, diode }: { cx: number; cy: number; on: boolean; diode: boolean }) {
  const x0 = cx + 10
  const dx = cx + 34
  const body = diode ? 'var(--gold)' : 'var(--text-2)'
  return (
    <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${cx - 30} ${cy} H${cx - 14}`} stroke={on ? 'var(--green)' : 'var(--text-2)'} />
      <path d={`M${cx - 14} ${cy - 18} V${cy + 18}`} stroke={on ? 'var(--green)' : 'var(--muted)'} strokeWidth="3" />
      <path d={`M${cx - 6} ${cy - 18} V${cy - 10} M${cx - 6} ${cy - 4} V${cy + 4} M${cx - 6} ${cy + 10} V${cy + 18}`} />
      <path d={`M${cx - 6} ${cy - 14} H${x0} V${cy - 34}`} />
      <path d={`M${cx - 6} ${cy + 14} H${x0} V${cy + 34}`} />
      <path d={`M${cx - 6} ${cy} H${x0} V${cy + 14}`} />
      <path d={`M${cx + 2} ${cy - 4} L${cx - 6} ${cy} L${cx + 2} ${cy + 4} Z`} fill="var(--text-2)" />
      <g stroke={body}>
        <path d={`M${x0} ${cy - 14} H${dx} V${cy - 6}`} />
        <path d={`M${x0} ${cy + 14} H${dx} V${cy + 6}`} />
        <path d={`M${dx - 6} ${cy + 6} H${dx + 6} L${dx} ${cy - 6} Z`} fill={diode ? 'var(--gold)' : 'none'} />
        <path d={`M${dx - 6} ${cy - 6} H${dx + 6}`} />
      </g>
      <circle cx={x0} cy={cy - 14} r="2.5" fill="var(--text-2)" stroke="none" />
      <circle cx={x0} cy={cy + 14} r="2.5" fill="var(--text-2)" stroke="none" />
    </g>
  )
}

const NX = 240
const X0 = NX + 10
const HS = 100
const LS = 240
const SW = 170

const PATHS: Record<DiodeMode, string> = {
  dead: `M${X0} 290 V${LS + 14} H${X0 + 24} V${LS - 14} H${X0} V${SW} H660 V290 H${X0}`,
  sync: `M${X0} 290 V${LS + 14} H${NX - 6} V${LS - 14} H${X0} V${SW} H660 V290 H${X0}`,
  block: `M120 50 H${X0} V${HS - 14} H${NX - 6} V${HS + 14} H${X0} V${SW} H660 V290 H120 V50`,
}

export function DiodeFig({ mode, vsw }: { mode: DiodeMode; vsw: string }) {
  const { t } = useLocale()
  const hsOn = mode === 'block'
  const lsOn = mode === 'sync'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 320" className="term-fig__svg" role="img" aria-label={t(DIODE_LABEL.cap)}>
        <rect width="760" height="320" rx="10" fill="var(--well)" />
        <g fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M120 50 H${X0} V${HS - 34} M${X0} ${HS + 34} V${SW} M${X0} ${LS - 34} V${SW} M${X0} ${LS + 34} V290 M120 290 H700`} />
          <path d="M120 50 V150 M108 150 H132 M114 158 H126 M120 158 V290" />
          <path d={`M${X0} ${SW} H370 a12.5 12.5 0 0 1 25 0 a12.5 12.5 0 0 1 25 0 a12.5 12.5 0 0 1 25 0 a12.5 12.5 0 0 1 25 0 H660 V205 M660 255 V290`} />
          <path d="M560 170 V200 M544 200 H576 M544 208 H576 M560 208 V290" />
        </g>
        <rect x="650" y="205" width="20" height="50" fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <g fill="var(--text-2)">
          <circle cx={X0} cy={SW} r="3.5" />
          <circle cx="560" cy={SW} r="3" />
        </g>
        <path d={PATHS[mode]} fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <Nmos cx={NX} cy={HS} on={hsOn} diode={false} />
        <Nmos cx={NX} cy={LS} on={lsOn} diode={mode === 'dead'} />
        {mode === 'dead' ? (
          <g>
            <Arrow x={X0 + 24} y={LS} dir="u" />
            <Arrow x={X0} y={196} dir="u" />
          </g>
        ) : null}
        {mode === 'sync' ? <Arrow x={X0} y={196} dir="u" /> : null}
        {mode === 'block' ? (
          <g>
            <Arrow x={190} y={50} dir="r" />
            <Arrow x={X0} y={150} dir="d" />
          </g>
        ) : null}
        <Arrow x={330} y={SW} dir="r" />
        <Arrow x={660} y={230} dir="d" />
        <Arrow x={450} y={290} dir="l" />
        <T x={104} y={104} anchor="end" color="var(--text)" bold>
          VIN
        </T>
        <T x={708} y={294} anchor="start" color="var(--text)" bold>
          GND
        </T>
        <T x={X0 - 12} y={SW - 6} anchor="end" color="var(--text)" bold>
          SW
        </T>
        <T x={420} y={146} color="var(--text-2)">
          L
        </T>
        <T x={582} y={244} anchor="start">
          Cout
        </T>
        <T x={684} y={234} anchor="start">
          {t(DIODE_LABEL.load)}
        </T>
        <T x={NX - 34} y={HS + 4} anchor="end" color={hsOn ? 'var(--green)' : 'var(--muted)'} bold>
          {t(hsOn ? DIODE_LABEL.hsOn : DIODE_LABEL.hsOff)}
        </T>
        <T x={NX - 34} y={LS + 4} anchor="end" color={lsOn ? 'var(--green)' : 'var(--muted)'} bold>
          {t(lsOn ? DIODE_LABEL.lsOn : DIODE_LABEL.lsOff)}
        </T>
        <T x={X0 + 42} y={LS + 4} anchor="start" color={mode === 'dead' ? 'var(--gold)' : 'var(--muted)'} bold={mode === 'dead'}>
          {t(DIODE_LABEL.diode)}
        </T>
        <T x={282} y={146} anchor="start" color="var(--gold)" bold>
          {`Vsw ${vsw}`}
        </T>
      </svg>
      <figcaption>{t(DIODE_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 亚阈值：对数坐标 Id–Vgs ---------- */

export const PLOT = { x0: 80, x1: 720, y0: 30, y1: 290, vMax: 1.5, lMin: -20, lMax: -2 }
export const px = (v: number) => PLOT.x0 + (v / PLOT.vMax) * (PLOT.x1 - PLOT.x0)
export const py = (l: number) => PLOT.y0 + ((PLOT.lMax - l) / (PLOT.lMax - PLOT.lMin)) * (PLOT.y1 - PLOT.y0)

/** 采样一条 log10(Id) 曲线成 path */
export function curvePath(c: number, dev: DevParams, vds: number, vMax = PLOT.vMax) {
  const pts: string[] = []
  for (let v = 0; v <= vMax + 1e-9; v += 0.01) {
    const l = Math.log10(Math.max(idTotal(v, vds, c, dev), 1e-30))
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${px(v).toFixed(1)} ${Math.max(py(l), PLOT.y0 - 30).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function LogAxes({ clipId, xLabel, yLabel }: { clipId: string; xLabel: string; yLabel: string }) {
  const ticks = [-18, -14, -10, -6, -2]
  return (
    <g>
      <clipPath id={clipId}>
        <rect x={PLOT.x0} y={PLOT.y0} width={PLOT.x1 - PLOT.x0} height={PLOT.y1 - PLOT.y0} />
      </clipPath>
      <rect x={PLOT.x0} y={PLOT.y0} width={PLOT.x1 - PLOT.x0} height={PLOT.y1 - PLOT.y0} fill="var(--card)" stroke="var(--line)" />
      {ticks.map((l) => (
        <g key={l}>
          <path d={`M${PLOT.x0} ${py(l)} H${PLOT.x1}`} stroke="var(--line-3)" />
          <T x={PLOT.x0 - 6} y={py(l) + 4} anchor="end" size={10} color="var(--muted)">
            {pow10(l)}
          </T>
        </g>
      ))}
      {[0, 0.5, 1, 1.5].map((v) => (
        <g key={v}>
          <path d={`M${px(v)} ${PLOT.y0} V${PLOT.y1}`} stroke="var(--line-3)" />
          <T x={px(v)} y={PLOT.y1 + 16} size={10} color="var(--muted)">
            {String(v)}
          </T>
        </g>
      ))}
      <T x={PLOT.x0} y={20} anchor="start" size={11} color="var(--text-2)">
        {yLabel}
      </T>
      <T x={PLOT.x1} y={PLOT.y1 + 34} anchor="end" size={11} color="var(--text-2)">
        {xLabel}
      </T>
    </g>
  )
}

export function SubFig({ n, temp, vgs }: { n: number; temp: number; vgs: number }) {
  const { t } = useLocale()
  const dev: DevParams = { ...TEACH, n }
  const vth = vthAt(temp)
  const ioff = idTotal(0, VDD, temp, dev)
  const id = idTotal(vgs, VDD, temp, dev)
  const sMv = swing(temp, n) * 1000
  const xa = 0.2
  const la = Math.log10(idTotal(xa, VDD, temp, dev))
  const xb = xa + sMv / 1000
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 340" className="term-fig__svg" role="img" aria-label={t(SUB_LABEL.cap)}>
        <rect width="760" height="340" rx="10" fill="var(--well)" />
        <LogAxes clipId="mosRealSubClip" xLabel={t(SUB_LABEL.axisX)} yLabel={t(SUB_LABEL.axisY)} />
        <g clipPath="url(#mosRealSubClip)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {temp === T_REF ? null : <path d={curvePath(T_REF, dev, VDD)} stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" />}
          <path d={curvePath(temp, dev, VDD)} stroke="var(--gold)" strokeWidth="3" />
          <path d={`M${px(vth)} ${PLOT.y0} V${PLOT.y1}`} stroke="var(--blue)" strokeDasharray="4 3" />
          <path d={`M${px(xa)} ${py(la)} H${px(xb)} V${py(la + 1)}`} stroke="var(--red)" strokeWidth="2" />
        </g>
        <T x={px(vth) + 5} y={PLOT.y0 + 14} anchor="start" color="var(--blue)" bold>
          {t(SUB_LABEL.vthMark)}
        </T>
        <T x={px(xa)} y={py(la) + 15} anchor="start" color="var(--red)" bold>
          {`S = ${sMv.toFixed(0)} mV`}
        </T>
        <T x={px(xb) + 6} y={py(la) - 4} anchor="start" color="var(--red)">
          {t(SUB_LABEL.decade)}
        </T>
        <path d={`M${PLOT.x0} ${py(Math.log10(ioff))} H${px(0.12)}`} stroke="var(--red)" strokeDasharray="2 3" />
        <circle cx={px(0)} cy={py(Math.log10(ioff))} r="5" fill="var(--red)" />
        <T x={px(0) + 14} y={PLOT.y0 + 16} anchor="start" color="var(--red)" bold>
          {`● Ioff = ${fmtAmp(ioff)}`}
        </T>
        <circle cx={px(vgs)} cy={py(Math.log10(id))} r="6" fill="var(--green)" stroke="var(--well)" strokeWidth="2" />
        <T x={px(0) + 14} y={PLOT.y0 + 34} anchor="start" color="var(--green)" bold>
          {`● Id = ${fmtAmp(id)}`}
        </T>
        <path d="M330 11 H358" stroke="var(--gold)" strokeWidth="3" />
        <T x={364} y={15} anchor="start">
          {`${t(SUB_LABEL.now)} ${temp} °C`}
        </T>
        <path d="M600 11 H628" stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" />
        <T x={634} y={15} anchor="start">
          {t(SUB_LABEL.ref)}
        </T>
      </svg>
      <figcaption>{t(SUB_LABEL.cap)}</figcaption>
    </figure>
  )
}
