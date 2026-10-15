import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { S } from './data/pcbSupply'
import { REFLOW, ZONES, reflowPoints, reflowVerdict, type ZoneId } from './data/pcbSupplyReflow'

const L = {
  liquidus: loc('217 °C 液相线（SAC305）', '217 °C liquidus (SAC305)'),
  window: loc('目标峰值 240–250 °C', 'target peak 240–250 °C'),
  time: loc('时间 (s)', 'Time (s)'),
  temp: loc('温度 (°C)', 'Temp (°C)'),
}

const X0 = 70
const X1 = 720
const Y0 = 210
const Y1 = 34
const T_TOP = 270
const sx = (time: number) => X0 + (time / REFLOW.tMax) * (X1 - X0)
const sy = (temp: number) => Y0 - (temp / T_TOP) * (Y0 - Y1)
const line = (pts: Array<[number, number]>) => pts.map(([a, b]) => `${sx(a).toFixed(1)},${sy(b).toFixed(1)}`).join(' ')

export function ReflowFig({ peak, zone, onPick }: { peak: number; zone: ZoneId; onPick: (id: ZoneId) => void }) {
  const { t } = useLocale()
  const r = REFLOW
  const c = reflowPoints(peak)
  const [p0, p1, p2, p3, p4, p5] = c.pts
  const edges: Record<ZoneId, [number, number]> = {
    pre: [0, r.preEndT],
    soak: [r.preEndT, r.soakEndT],
    reflow: [r.soakEndT, c.tHoldEnd],
    cool: [c.tHoldEnd, c.tCoolEnd],
  }
  const segs: Record<ZoneId, Array<[number, number]>> = {
    pre: [p0, p1],
    soak: [p1, p2],
    reflow: [p2, p3, p4],
    cool: [p4, p5],
  }
  const verdict = reflowVerdict(peak)
  const peakColor = verdict === 'ok' ? 'var(--green)' : 'var(--red)'
  const tUp = r.soakEndT + (r.liquidus - r.soakEnd) / r.rampUp
  const tDown = c.tHoldEnd + (peak - r.liquidus) / r.coolRate
  const yLiq = sy(r.liquidus)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 252" className="term-fig__svg" role="group" aria-label={t(S.reflowCap)}>
        <rect width="760" height="252" rx="10" fill="var(--well)" />
        {[0, 50, 100, 150, 200, 250].map((v) => (
          <g key={v}>
            <line x1={X0} y1={sy(v)} x2={X1} y2={sy(v)} stroke="var(--line-3)" strokeWidth="0.6" />
            <text x={X0 - 6} y={sy(v) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {v}
            </text>
          </g>
        ))}
        {[0, 60, 120, 180, 240, 300, 360].map((v) => (
          <text key={v} x={sx(v)} y={Y0 + 15} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {v}
          </text>
        ))}
        <text x={X1} y={Y0 + 34} textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(L.time)}
        </text>
        <text x="8" y="24" fill="var(--muted)" fontSize="11">
          {t(L.temp)}
        </text>
        <rect x={X0} y={sy(r.windowHi)} width={X1 - X0} height={sy(r.windowLo) - sy(r.windowHi)} fill="var(--green-bg)" />
        <text x={X1 - 6} y={sy(r.windowHi) - 4} textAnchor="end" fill="var(--green)" fontSize="10">
          {t(L.window)}
        </text>
        {ZONES.map((z) => {
          const [a, b] = edges[z.id]
          const on = z.id === zone
          return (
            <Hit key={z.id} label={t(z.name)} active={on} onPick={() => onPick(z.id)}>
              <rect x={sx(a)} y={Y1 - 4} width={sx(b) - sx(a)} height={Y0 - Y1 + 4} fill={on ? 'var(--gold-bg)' : 'transparent'} fillOpacity={on ? 0.7 : 1} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="3 3" />
              <text x={(sx(a) + sx(b)) / 2} y="24" textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="11" fontWeight={on ? 700 : 400}>
                {t(z.name)}
              </text>
            </Hit>
          )
        })}
        <line x1={X0} y1={yLiq} x2={X1} y2={yLiq} stroke="var(--red)" strokeWidth="1" strokeDasharray="5 4" />
        <text x={X0 + 6} y={yLiq - 5} fill="var(--red)" fontSize="10">
          {t(L.liquidus)}
        </text>
        <polyline points={line(c.pts)} fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={line(segs[zone])} fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={sx(tUp)} y1={yLiq} x2={sx(tDown)} y2={yLiq} stroke={peakColor} strokeWidth="3" />
        <text x={(sx(tUp) + sx(tDown)) / 2} y={yLiq + 15} textAnchor="middle" fill={peakColor} fontSize="10" fontFamily="var(--mono)">
          TAL
        </text>
        <text x={sx(c.tHoldEnd) - 3} y={sy(peak) - 6} textAnchor="end" fill={peakColor} fontSize="11" fontWeight="700" fontFamily="var(--mono)">
          {`${peak} °C`}
        </text>
      </svg>
      <figcaption>{t(S.reflowCap)}</figcaption>
    </figure>
  )
}
