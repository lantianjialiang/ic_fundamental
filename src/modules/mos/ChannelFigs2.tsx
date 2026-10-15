import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { accRatio, channelRatio, depletionRatio, NA_LOG, surfaceLogs, VT_ABS, type Dev } from './data/mosChannelModel'
import { FIG } from './data/mosChannelText'
import { T } from './ChannelFigs'

const sample = (lo: number, hi: number, step: number) => {
  const out: number[] = []
  for (let v = lo; v <= hi + 1e-9; v += step) {
    out.push(v)
  }
  return out
}

const axisName = (dev: Dev) => (dev === 'n' ? 'Vgs (V)' : '−Vgs (V)')
const signedVth = (dev: Dev, vt: number) => `${dev === 'n' ? '+' : '−'}${vt.toFixed(2)} V`

/* ---------- 电荷和耗尽深度随 Vgs 变化 ---------- */

const PX0 = 70
const PX1 = 720
const VN_LO = -2
const VN_HI = 3
const plotX = (vn: number) => PX0 + ((vn - VN_LO) / (VN_HI - VN_LO)) * (PX1 - PX0)
const plotY = (r: number) => 230 - r * 170

export function ChargePlot({ dev, vn }: { dev: Dev; vn: number }) {
  const { t } = useLocale()
  const vt = VT_ABS[dev]
  const xs = sample(VN_LO, VN_HI, 0.05)
  const curves: Array<{ id: string; label: LText; color: string; dash?: string; f: (v: number) => number }> = [
    { id: 'acc', label: FIG.plotAcc, color: 'var(--gold)', dash: '6 4', f: (v) => accRatio(v) },
    { id: 'dep', label: FIG.plotDep, color: 'var(--text-2)', f: (v) => depletionRatio(v, vt) },
    { id: 'inv', label: FIG.plotInv, color: 'var(--blue)', f: (v) => channelRatio(v, vt) },
  ]
  const legendX = [70, 260, 430]
  return (
    <figure className="term-fig mosChannel-plot-wrap">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="img" aria-label={t(FIG.plotCap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        <T x={PX0} y={26} anchor="start" size={11} color="var(--muted)">
          {t(FIG.relative)}
        </T>
        <path d={`M${PX0} ${plotY(0)} H${PX1}`} stroke="var(--line-2)" strokeWidth="1.5" />
        <path d={`M${PX0} 50 V${plotY(0)}`} stroke="var(--line-2)" strokeWidth="1.5" />
        {[0, 0.5, 1].map((r) => (
          <g key={r}>
            <path d={`M${PX0 - 4} ${plotY(r)} H${PX0}`} stroke="var(--line-2)" />
            <T x={PX0 - 8} y={plotY(r) + 4} anchor="end" size={11} color="var(--muted)">
              {r === 0 ? '0' : r.toFixed(1)}
            </T>
            {r > 0 ? <path d={`M${PX0} ${plotY(r)} H${PX1}`} stroke="var(--line-3)" strokeDasharray="2 4" /> : null}
          </g>
        ))}
        {[-2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <path d={`M${plotX(v)} ${plotY(0)} v4`} stroke="var(--line-2)" />
            <T x={plotX(v)} y={248} size={11} color="var(--muted)">
              {v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'}
            </T>
          </g>
        ))}
        <T x={(PX0 + PX1) / 2} y={266} size={11} color="var(--muted)">
          {axisName(dev)}
        </T>
        <path d={`M${plotX(vt)} 50 V${plotY(0)}`} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="5 4" />
        <T x={plotX(vt) + 5} y={44} anchor="start" size={11} color="var(--muted)">
          {t(FIG.vthMark)}
        </T>
        {curves.map((c) => (
          <path
            key={c.id}
            d={xs.map((v, i) => `${i === 0 ? 'M' : 'L'}${plotX(v).toFixed(1)} ${plotY(c.f(v)).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={c.color}
            strokeWidth="2.5"
            strokeDasharray={c.dash}
          />
        ))}
        <path d={`M${plotX(vn)} 50 V${plotY(0)}`} stroke="var(--red)" strokeWidth="2" />
        {curves.map((c) => (
          <circle key={`d${c.id}`} cx={plotX(vn)} cy={plotY(c.f(vn))} r="4.5" fill={c.color} stroke="var(--well)" strokeWidth="1.5" />
        ))}
        {curves.map((c, i) => (
          <g key={`l${c.id}`}>
            <path d={`M${legendX[i]} 286 h22`} stroke={c.color} strokeWidth="2.5" strokeDasharray={c.dash} />
            <T x={legendX[i] + 28} y={290} anchor="start">
              {t(c.label)}
            </T>
          </g>
        ))}
      </svg>
      <figcaption>{t(FIG.plotCap)}</figcaption>
    </figure>
  )
}

/* ---------- 表面载流子浓度（对数）和 Vth ---------- */

const VX0 = 70
const VX1 = 720
const V_LO = -1
const V_HI = 3
const vthX = (vn: number) => VX0 + ((vn - V_LO) / (V_HI - V_LO)) * (VX1 - VX0)
const vthY = (lg: number) => 250 - (lg / 20) * 200
const SUP: Record<number, string> = { 5: '10⁵', 10: '10¹⁰', 15: '10¹⁵' }

export function VthPlot({ dev, shift }: { dev: Dev; shift: number }) {
  const { t } = useLocale()
  const vt = VT_ABS[dev]
  const vt2 = vt + shift
  const xs = sample(V_LO, V_HI, 0.05)
  const color = { min: dev === 'n' ? 'var(--blue)' : 'var(--gold)', maj: dev === 'n' ? 'var(--gold)' : 'var(--blue)' }
  const path = (key: 'minority' | 'majority', v0: number) =>
    xs.map((v, i) => `${i === 0 ? 'M' : 'L'}${vthX(v).toFixed(1)} ${vthY(surfaceLogs(v, v0)[key]).toFixed(1)}`).join(' ')
  const legend: Array<{ x: number; y: number; label: LText; color: string; dash?: string; w: number }> = [
    { x: 70, y: 304, label: FIG.vthMin, color: color.min, w: 2.5 },
    { x: 400, y: 304, label: FIG.vthMaj, color: color.maj, w: 2.5 },
    { x: 70, y: 322, label: FIG.vthBulk, color: 'var(--muted)', dash: '5 4', w: 1.5 },
    { x: 400, y: 322, label: FIG.vthAfter, color: 'var(--red)', dash: '6 4', w: 2.5 },
  ]
  return (
    <figure className="term-fig mosChannel-plot-wrap">
      <svg viewBox="0 0 760 336" className="term-fig__svg" role="img" aria-label={t(FIG.vthCap)}>
        <rect width="760" height="336" rx="10" fill="var(--well)" />
        <T x={VX0} y={20} anchor="start" size={11} color="var(--muted)">
          {t(FIG.surfaceConc)}
        </T>
        <path d={`M${VX0} 250 H${VX1}`} stroke="var(--line-2)" strokeWidth="1.5" />
        <path d={`M${VX0} 50 V250`} stroke="var(--line-2)" strokeWidth="1.5" />
        {[5, 10, 15].map((lg) => (
          <g key={lg}>
            <path d={`M${VX0} ${vthY(lg)} H${VX1}`} stroke="var(--line-3)" strokeDasharray="2 4" />
            <T x={VX0 - 8} y={vthY(lg) + 4} anchor="end" size={11} color="var(--muted)">
              {SUP[lg]}
            </T>
          </g>
        ))}
        {[-1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <path d={`M${vthX(v)} 250 v4`} stroke="var(--line-2)" />
            <T x={vthX(v)} y={268} size={11} color="var(--muted)">
              {v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'}
            </T>
          </g>
        ))}
        <T x={(VX0 + VX1) / 2} y={284} size={11} color="var(--muted)">
          {axisName(dev)}
        </T>
        <path d={`M${VX0} ${vthY(NA_LOG)} H${VX1}`} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="5 4" />
        {shift > 0 ? (
          <g fill="none" stroke="var(--red)" strokeWidth="2.5" strokeDasharray="6 4">
            <path d={path('minority', vt2)} />
            <path d={path('majority', vt2)} />
          </g>
        ) : null}
        <path d={path('majority', vt)} fill="none" stroke={color.maj} strokeWidth="2.5" />
        <path d={path('minority', vt)} fill="none" stroke={color.min} strokeWidth="2.5" />
        <path d={`M${vthX(vt)} 50 V250`} stroke="var(--text-2)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx={vthX(vt)} cy={vthY(NA_LOG)} r="5" fill={color.min} stroke="var(--well)" strokeWidth="1.5" />
        <T x={vthX(vt) - (shift > 0 ? 5 : 0)} y={42} anchor={shift > 0 ? 'end' : 'middle'} size={11} mono color="var(--text)">
          {`${t(FIG.vthMark)} = ${signedVth(dev, vt)}`}
        </T>
        {shift > 0 ? (
          <g>
            <path d={`M${vthX(vt2)} 50 V250`} stroke="var(--red)" strokeWidth="1.5" strokeDasharray="3 3" />
            <T x={vthX(vt2) + 5} y={42} anchor="start" size={11} mono color="var(--red)">
              {`→ ${signedVth(dev, vt2)}`}
            </T>
          </g>
        ) : null}
        {legend.map((item) => (
          <g key={item.label.en}>
            <path d={`M${item.x} ${item.y - 4} h22`} stroke={item.color} strokeWidth={item.w} strokeDasharray={item.dash} />
            <T x={item.x + 28} y={item.y} anchor="start">
              {t(item.label)}
            </T>
          </g>
        ))}
      </svg>
      <figcaption>{t(FIG.vthCap)}</figcaption>
    </figure>
  )
}
