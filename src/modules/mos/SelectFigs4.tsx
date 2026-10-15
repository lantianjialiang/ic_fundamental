import { type MouseEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { PULSES, SOA, idLimit, judge, powerLimit, type PulseId } from './data/mosSelectSoa'
import { T } from './SelectFigs'

const L = {
  cap: loc(
    '示意 SOA（DEMO-C，双对数坐标，外壳 25 °C，单次脉冲）：左上是 Rds(on) 限制线，上方是电流限制，右侧是电压限制，斜线是不同脉宽的功率限制。点图可放置工作点。',
    'Illustrative SOA (DEMO-C, log-log, 25 °C case, single pulse): the Rds(on) limit line is at the upper left, the current limit at the top, the voltage limit on the right, and the slanted lines are power limits for different pulse widths. Click the chart to place an operating point.',
  ),
  rds: loc('Rds(on) 限制线', 'Rds(on) limit'),
  imax: loc(`Id 最大 ${SOA.imax} A（封装）`, `Id max ${SOA.imax} A (package)`),
  vmax: loc(`Vds 最大 ${SOA.vmax} V`, `Vds max ${SOA.vmax} V`),
  region: loc('绿色：所选脉宽的 SOA', 'green: SOA for the selected pulse'),
  axisX: loc('漏源电压 Vds (V)', 'Drain-source voltage Vds (V)'),
}

const X0 = 70
const X1 = 730
const Y0 = 310
const Y1 = 30
const DEC_X = Math.log10(SOA.vmaxAxis / SOA.vminAxis)
const DEC_Y = Math.log10(SOA.imaxAxis / SOA.iminAxis)
export const rx = (v: number) => X0 + (Math.log10(v / SOA.vminAxis) / DEC_X) * (X1 - X0)
export const ry = (i: number) => Y0 - (Math.log10(i / SOA.iminAxis) / DEC_Y) * (Y0 - Y1)
const fromX = (px: number) => SOA.vminAxis * Math.pow(10, ((px - X0) / (X1 - X0)) * DEC_X)
const fromY = (py: number) => SOA.iminAxis * Math.pow(10, ((Y0 - py) / (Y0 - Y1)) * DEC_Y)
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

function regionPath(tw: number) {
  const n = 160
  const v0 = SOA.vminAxis
  let d = `M${rx(v0).toFixed(1)} ${ry(SOA.iminAxis).toFixed(1)} `
  for (let k = 0; k <= n; k += 1) {
    const v = v0 * Math.pow(SOA.vmax / v0, k / n)
    d += `L${rx(v).toFixed(1)} ${ry(Math.max(SOA.iminAxis, idLimit(v, tw))).toFixed(1)} `
  }
  return `${d}L${rx(SOA.vmax).toFixed(1)} ${ry(SOA.iminAxis).toFixed(1)} Z`
}

type Props = { pulse: PulseId; v: number; i: number; onPlace: (v: number, i: number) => void }

export function SoaFig({ pulse, v, i, onPlace }: Props) {
  const { t } = useLocale()
  const tw = PULSES.find((p) => p.id === pulse)?.tw ?? Infinity
  const ok = judge(v, i, tw) === 'ok'
  const place = (event: MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) {
      return
    }
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    const p = pt.matrixTransform(ctm.inverse())
    onPlace(clamp(fromX(p.x), SOA.vminAxis, SOA.vmaxAxis), clamp(fromY(p.y), SOA.iminAxis, SOA.imaxAxis))
  }
  const rdsEnd = SOA.imax * SOA.rds
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 360" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="760" height="360" rx="10" fill="var(--well)" />
        {[0.1, 1, 10, 100].map((a) => (
          <g key={a}>
            <line x1={X0} y1={ry(a)} x2={X1} y2={ry(a)} stroke="var(--line-3)" strokeOpacity="0.6" />
            <T x={X0 - 8} y={ry(a) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${a}`}
            </T>
          </g>
        ))}
        {[0.01, 0.1, 1, 10, 100].map((a) => (
          <g key={a}>
            <line x1={rx(a)} y1={Y1} x2={rx(a)} y2={Y0} stroke="var(--line-3)" strokeOpacity="0.6" />
            <T x={rx(a)} y={Y0 + 16} size={10} color="var(--dim)" mono>
              {`${a}`}
            </T>
          </g>
        ))}
        <rect x={rx(SOA.vmax)} y={Y1} width={X1 - rx(SOA.vmax)} height={Y0 - Y1} fill="var(--red)" fillOpacity="0.07" />
        <path d={regionPath(tw)} fill="var(--green)" fillOpacity="0.2" stroke="var(--green)" strokeWidth="2" />
        <T x={X0 + 8} y={Y0 - 8} anchor="start" size={10} color="var(--green)">
          {t(L.region)}
        </T>
        <path d={`M${rx(SOA.vminAxis)} ${ry(SOA.vminAxis / SOA.rds)} L${rx(rdsEnd)} ${ry(SOA.imax)}`} stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        <text transform={`translate(92 216) rotate(-29.5)`} fill="var(--gold)" fontSize="10">
          {t(L.rds)}
        </text>
        <path d={`M${rx(rdsEnd)} ${ry(SOA.imax)} H${rx(SOA.vmax)}`} stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        <T x={rx(rdsEnd) + 10} y={ry(SOA.imax) - 5} anchor="start" size={10} color="var(--muted)">
          {t(L.imax)}
        </T>
        <line x1={rx(SOA.vmax)} y1={Y1} x2={rx(SOA.vmax)} y2={Y0} stroke="var(--red)" strokeWidth="2" strokeDasharray="6 4" />
        <T x={rx(SOA.vmax) - 5} y={44} anchor="end" size={10} color="var(--red)">
          {t(L.vmax)}
        </T>
        {PULSES.map((p) => {
          const pw = powerLimit(p.tw)
          const on = p.id === pulse
          const vStart = pw / SOA.imax
          return (
            <g key={p.id}>
              <path d={`M${rx(vStart)} ${ry(SOA.imax)} L${rx(SOA.vmax)} ${ry(pw / SOA.vmax)}`} stroke="var(--blue)" strokeWidth={on ? 2.6 : 1.2} strokeOpacity={on ? 1 : 0.6} fill="none" />
              <T x={rx(SOA.vmax) + 8} y={ry(pw / SOA.vmax) + 4} anchor="start" size={10} color="var(--blue)">
                {t(p.label)}
              </T>
            </g>
          )
        })}
        <rect x={X0} y={Y1} width={X1 - X0} height={Y0 - Y1} fill="transparent" style={{ cursor: 'crosshair' }} onClick={place} />
        <circle cx={rx(v)} cy={ry(i)} r="6.5" fill={ok ? 'var(--green)' : 'var(--red)'} stroke="var(--text)" strokeWidth="1.5" pointerEvents="none" />
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <T x={X1} y={Y0 + 40} anchor="end" size={11} color="var(--muted)">
          {t(L.axisX)}
        </T>
        <T x={X0} y={Y1 - 10} anchor="start" size={11} color="var(--muted)">
          Id (A)
        </T>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
