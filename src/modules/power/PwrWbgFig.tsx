import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { fillText, FIG } from './pwrWbgData'
import {
  GAN_TAU_US,
  MATERIAL_ORDER,
  SWEEP_SPAN_V,
  VPRE_MAX,
  ganRds,
  idOfVgs,
  relSpecificRon,
  type Material,
  type VthResult,
} from './pwrWbgModel'
import './pwrWbg.css'

const MAT_COLOR: Record<Material, string> = { si: 'var(--muted)', sic: 'var(--gold)', gan: 'var(--green)' }

const LOG_MIN = -2
const LOG_MAX = 3
const BAR_X0 = 170
const BAR_W = 300
const BAR_ROW = 46

/** 材料对比条形图：相对比导通电阻取对数刻度，左侧写禁带宽度 */
export function MaterialFig({ bv, appLabel }: { bv: number; appLabel: LText }) {
  const { t } = useLocale()
  const logX = (value: number) => BAR_X0 + ((Math.log10(value) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * BAR_W
  const ticks = [0.01, 0.1, 1, 10, 100, 1000]
  const rowsEnd = 52 + MATERIAL_ORDER.length * BAR_ROW
  const height = rowsEnd + 26
  return (
    <figure className="term-fig pwrw-fig">
      <svg viewBox={`0 0 520 ${height}`} role="img" aria-label={t(FIG.matAria)} className="pwrw-svg">
        <rect x={0} y={0} width={520} height={height} rx={10} fill="var(--well)" />
        <text x={12} y={20} fill="var(--text)" fontSize={12}>
          {t(fillText(FIG.matTitle, { bv: String(bv) }))}
        </text>
        <text x={12} y={38} fill="var(--muted)" fontSize={11}>
          {t(appLabel)}
        </text>
        {MATERIAL_ORDER.map((m, i) => {
          const y = 52 + i * BAR_ROW
          const ron = relSpecificRon(m, bv)
          const width = Math.min(BAR_W, Math.max(2, ((Math.log10(ron) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * BAR_W))
          return (
            <g key={m}>
              <text x={12} y={y + 15} fill="var(--text)" fontSize={12}>
                {t(FIG.matName[m])}
              </text>
              <rect x={BAR_X0} y={y} width={BAR_W} height={20} rx={4} fill="var(--fig-box)" />
              <rect x={BAR_X0} y={y} width={width} height={20} rx={4} fill={MAT_COLOR[m]} fillOpacity={0.75} />
              <text x={BAR_X0 + width + 6} y={y + 15} fill="var(--text)" fontSize={11} fontFamily="var(--mono)">
                {ron >= 1 ? ron.toFixed(1) : ron.toPrecision(2)}
              </text>
            </g>
          )
        })}
        <line x1={BAR_X0} x2={BAR_X0 + BAR_W} y1={rowsEnd - 8} y2={rowsEnd - 8} stroke="var(--line-2)" />
        {ticks.map((v) => (
          <text key={v} x={logX(v)} y={height - 8} textAnchor="middle" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
            {String(v)}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.matCap)}</figcaption>
    </figure>
  )
}

const VW = 520
const VH = 240
const V_PL = 44
const V_PW = 440
const V_PT = 14
const V_PH = 176
const V_YMAX = 30

/** 正扫与反扫的 Id–Vgs 曲线：横向差即 Δ，读数点在 1 mA 恒流线上 */
export function VthFig({ res }: { res: VthResult }) {
  const { t } = useLocale()
  const X = (vgs: number) => V_PL + (vgs / SWEEP_SPAN_V) * V_PW
  const Y = (ma: number) => V_PT + (1 - Math.min(ma, V_YMAX) / V_YMAX) * V_PH
  const samples: number[] = []
  for (let i = 0; i <= 120; i += 1) {
    samples.push((SWEEP_SPAN_V * i) / 120)
  }
  const pathOf = (shift: number) =>
    samples.map((vgs, i) => `${i === 0 ? 'M' : 'L'}${X(vgs).toFixed(1)},${Y(idOfVgs(vgs, shift)).toFixed(1)}`).join(' ')
  const yRead = Y(1)
  return (
    <figure className="term-fig pwrw-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={t(FIG.vthAria)} className="pwrw-svg">
        <rect x={0} y={0} width={VW} height={VH} rx={10} fill="var(--well)" />
        <rect x={V_PL} y={V_PT} width={V_PW} height={V_PH} fill="var(--fig-box)" stroke="var(--line-2)" />
        {[0, 10, 20, 30].map((ma) => (
          <text key={ma} x={V_PL - 6} y={Y(ma) + 4} textAnchor="end" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
            {String(ma)}
          </text>
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((v) => (
          <text key={v} x={X(v)} y={V_PT + V_PH + 14} textAnchor="middle" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
            {String(v)}
          </text>
        ))}
        <text x={V_PL + V_PW} y={VH - 6} textAnchor="end" fill="var(--muted)" fontSize={10}>
          {'Vgs (V)'}
        </text>
        <text x={V_PL} y={V_PT - 3} fill="var(--muted)" fontSize={10}>
          {'Id (mA)'}
        </text>
        <line x1={V_PL} x2={V_PL + V_PW} y1={yRead} y2={yRead} stroke="var(--line-2)" strokeDasharray="3 3" />
        <path d={pathOf(res.shiftFwd)} fill="none" stroke="var(--blue)" strokeWidth={2} />
        <path d={pathOf(res.shiftRev)} fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="6 4" />
        <circle cx={X(res.readFwd)} cy={yRead} r={3.5} fill="var(--blue)" />
        <circle cx={X(res.readRev)} cy={yRead} r={3.5} fill="var(--gold)" />
        <text x={X(res.readFwd) + 6} y={yRead - 8} fill="var(--blue)" fontSize={11}>
          {t(FIG.vthTagF)}
        </text>
        <text x={X(res.readRev) - 6} y={yRead + 16} textAnchor="end" fill="var(--gold)" fontSize={11}>
          {t(FIG.vthTagR)}
        </text>
        <text x={V_PL + 8} y={V_PT + 14} fill="var(--text)" fontSize={11}>
          {t(FIG.vthLegendF)}
        </text>
        <text x={V_PL + V_PW - 8} y={V_PT + 30} textAnchor="end" fill="var(--text)" fontSize={11}>
          {t(FIG.vthLegendR)}
        </text>
      </svg>
      <figcaption>{t(FIG.vthCap)}</figcaption>
    </figure>
  )
}

const PW = 520
const PH = 112
const P_BASE = 84

/** 预置脉冲与两段扫描的栅压时序示意（时间轴不按比例） */
export function PrecondFig({ vpre, tpre }: { vpre: number; tpre: number }) {
  const { t } = useLocale()
  const h = (vpre / VPRE_MAX) * 56
  const wp = 60 + Math.min(tpre, 10) * 14
  const x0 = 40
  const f0 = x0 + wp + 24
  const fTop = P_BASE - (6 / VPRE_MAX) * 56
  const f1 = f0 + 100
  const r0 = f1 + 24
  const r1 = r0 + 100
  const points = [
    `${x0},${P_BASE}`,
    `${x0},${P_BASE - h}`,
    `${x0 + wp},${P_BASE - h}`,
    `${x0 + wp},${P_BASE}`,
    `${f0},${P_BASE}`,
    `${f1},${fTop}`,
    `${r0},${fTop}`,
    `${r1},${P_BASE}`,
  ].join(' ')
  return (
    <figure className="term-fig pwrw-fig">
      <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={t(FIG.preAria)} className="pwrw-svg">
        <rect x={0} y={0} width={PW} height={PH} rx={10} fill="var(--well)" />
        <line x1={x0} x2={PW - 12} y1={P_BASE} y2={P_BASE} stroke="var(--line-2)" />
        <polyline points={points} fill="none" stroke="var(--text)" strokeWidth={2} />
        <text x={x0 + wp / 2} y={P_BASE - h - 6} textAnchor="middle" fill="var(--gold)" fontSize={11}>
          {t(FIG.preTag)}
        </text>
        <text x={f0 + 50} y={PH - 8} textAnchor="middle" fill="var(--blue)" fontSize={11}>
          {t(FIG.preFwd)}
        </text>
        <text x={r0 + 50} y={PH - 8} textAnchor="middle" fill="var(--gold)" fontSize={11}>
          {t(FIG.preRev)}
        </text>
      </svg>
      <figcaption>{t(FIG.preCap)}</figcaption>
    </figure>
  )
}

const GW = 520
const GH = 236
const G_PL = 52
const G_PW = 440
const G_PT = 28
const G_PH = 170

/** GaN：R(t) 随测量延时衰减，横轴对数（0.1 µs – 1000 µs） */
export function GanFig({ k, delayUs }: { k: number; delayUs: number }) {
  const { t } = useLocale()
  const r0 = ganRds(0, 0)
  const rMax = r0 * (1 + Math.max(k, 0.2)) * 1.05
  const X = (us: number) => G_PL + ((Math.log10(us) + 1) / 4) * G_PW
  const Y = (mohm: number) => G_PT + (1 - mohm / rMax) * G_PH
  const pts: string[] = []
  for (let i = 0; i <= 120; i += 1) {
    const us = Math.pow(10, -1 + (4 * i) / 120)
    pts.push(`${i === 0 ? 'M' : 'L'}${X(us).toFixed(1)},${Y(ganRds(k, us)).toFixed(1)}`)
  }
  const ticks = [0.1, 1, 10, 100, 1000]
  return (
    <figure className="term-fig pwrw-fig">
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={t(FIG.ganAria)} className="pwrw-svg">
        <rect x={0} y={0} width={GW} height={GH} rx={10} fill="var(--well)" />
        <rect x={G_PL} y={G_PT} width={G_PW} height={G_PH} fill="var(--fig-box)" stroke="var(--line-2)" />
        <line x1={G_PL} x2={G_PL + G_PW} y1={Y(r0)} y2={Y(r0)} stroke="var(--muted)" strokeDasharray="4 4" />
        <text x={G_PL + 6} y={Y(r0) - 5} fill="var(--muted)" fontSize={10}>
          {t(FIG.ganTagStatic)}
        </text>
        <line x1={X(GAN_TAU_US)} x2={X(GAN_TAU_US)} y1={G_PT} y2={G_PT + G_PH} stroke="var(--line-2)" strokeDasharray="2 4" />
        <line x1={X(1)} x2={X(1)} y1={G_PT} y2={G_PT + G_PH} stroke="var(--blue)" strokeDasharray="5 3" opacity={0.6} />
        <line x1={X(100)} x2={X(100)} y1={G_PT} y2={G_PT + G_PH} stroke="var(--blue)" strokeDasharray="5 3" opacity={0.6} />
        <path d={pts.join(' ')} fill="none" stroke="var(--text)" strokeWidth={2} />
        <line x1={X(delayUs)} x2={X(delayUs)} y1={G_PT} y2={G_PT + G_PH} stroke="var(--gold)" strokeWidth={2} />
        <text x={X(delayUs) + 4} y={G_PT + G_PH - 6} fill="var(--gold)" fontSize={11}>
          {t(FIG.ganTagDelay)}
        </text>
        <text x={X(1)} y={G_PT - 8} textAnchor="middle" fill="var(--blue)" fontSize={10} fontFamily="var(--mono)">
          {'1 µs'}
        </text>
        <text x={X(GAN_TAU_US)} y={G_PT - 8} textAnchor="middle" fill="var(--muted)" fontSize={10}>
          {t(FIG.ganTagTau)}
        </text>
        <text x={X(100)} y={G_PT - 8} textAnchor="middle" fill="var(--blue)" fontSize={10} fontFamily="var(--mono)">
          {'100 µs'}
        </text>
        {ticks.map((us) => (
          <text key={us} x={X(us)} y={G_PT + G_PH + 14} textAnchor="middle" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
            {String(us)}
          </text>
        ))}
        <text x={G_PL} y={GH - 6} fill="var(--muted)" fontSize={10}>
          {t(FIG.ganTimeAxis)}
        </text>
        <text x={G_PL - 6} y={G_PT + 10} textAnchor="end" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
          {rMax.toFixed(0)}
        </text>
        <text x={G_PL - 6} y={G_PT + G_PH} textAnchor="end" fill="var(--muted)" fontSize={10} fontFamily="var(--mono)">
          {'0'}
        </text>
      </svg>
      <figcaption>{t(FIG.ganCap)}</figcaption>
    </figure>
  )
}
