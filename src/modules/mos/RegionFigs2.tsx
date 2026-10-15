import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './data/mosRegionFig'
import { REGION_COLOR, T, regionName } from './RegionFigs'
import { VDD, VTN, nId, nRegion, type Region } from './model'

const VW = 480
const VH = 330
const MA = 1e-3

/* ---------- 输出特性 Id–Vds ---------- */

/** 曲线族的 Vgs，从小到大 */
export const FAMILY_VGS = [1.2, 1.8, 2.4, 3, 3.3]
const O_X0 = 56
const O_X1 = 420
const O_Y0 = 270
const O_Y1 = 44
const O_IMAX = 8 * MA
const ox = (v: number) => O_X0 + (v / VDD) * (O_X1 - O_X0)
const oy = (i: number) => O_Y0 - (i / O_IMAX) * (O_Y0 - O_Y1)

function curvePath(vgs: number, vmax = VDD, imax = O_IMAX) {
  const n = 66
  const pts: string[] = []
  for (let k = 0; k <= n; k += 1) {
    const v = (k / n) * vmax
    const i = nId(vgs, v)
    if (i <= imax) {
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${ox(v).toFixed(1)} ${oy(i).toFixed(1)}`)
    }
  }
  return pts.join(' ')
}

/** 边界 Vds = Vov：Id 取模型在 Vov = Vds 处的值（饱和公式，含 λ） */
function edgePath() {
  const n = 66
  const pts: string[] = []
  for (let k = 0; k <= n; k += 1) {
    const v = (k / n) * VDD
    const i = nId(v + VTN, v)
    if (i <= O_IMAX) {
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${ox(v).toFixed(1)} ${oy(i).toFixed(1)}`)
    }
  }
  return pts.join(' ')
}

export function OutputFig({ vgs, vds }: { vgs: number; vds: number }) {
  const { t } = useLocale()
  const region = nRegion(vgs, vds)
  const color = REGION_COLOR[region]
  const id = nId(vgs, vds)
  const xTicks = [0, 1, 2, 3]
  const yTicks = [0, 2, 4, 6, 8]

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.outAria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={O_X0} y1={oy(v * MA)} x2={O_X1} y2={oy(v * MA)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={O_X0 - 8} y={oy(v * MA) + 4} anchor="end" size={10} color="var(--dim)" mono>{`${v}`}</T>
          </g>
        ))}
        {xTicks.map((v) => (
          <T key={v} x={ox(v)} y={O_Y0 + 14} size={10} color="var(--dim)" mono>{`${v}`}</T>
        ))}
        <line x1={O_X0} y1={O_Y0} x2={O_X1} y2={O_Y0} stroke="var(--line-2)" />
        <line x1={O_X0} y1={O_Y0} x2={O_X0} y2={O_Y1} stroke="var(--line-2)" />
        <T x={O_X0} y={30} anchor="start" size={11} color="var(--muted)">Id (mA)</T>
        <T x={O_X1} y={O_Y0 + 32} anchor="end" size={11} color="var(--muted)">Vds (V)</T>
        <T x={VW - 10} y={18} anchor="end" size={13} color={color} bold>{t(regionName(region))}</T>

        {FAMILY_VGS.map((g) => (
          <g key={g}>
            <path d={curvePath(g)} fill="none" stroke="var(--text-2)" strokeOpacity="0.55" strokeWidth="1.5" />
            <T x={O_X1 + 6} y={oy(nId(g, VDD)) + 3} anchor="start" size={10} color="var(--muted)" mono>{`Vgs ${g.toFixed(1)}`}</T>
          </g>
        ))}
        <path d={edgePath()} fill="none" stroke="var(--red)" strokeWidth="1.6" strokeDasharray="5 4" />
        <line x1={O_X0 + 10} y1={O_Y1 + 12} x2={O_X0 + 30} y2={O_Y1 + 12} stroke="var(--red)" strokeWidth="1.6" strokeDasharray="5 4" />
        <T x={O_X0 + 36} y={O_Y1 + 16} anchor="start" size={10} color="var(--muted)" mono>{t(FIG.edge)}</T>
        <T x={O_X0 + 36} y={O_Y1 + 30} anchor="start" size={10} color="var(--muted)" mono>{t(FIG.edgeEq)}</T>

        {vgs > VTN ? <path d={curvePath(vgs)} fill="none" stroke={color} strokeWidth="2.8" /> : null}
        <line x1={ox(vds)} y1={O_Y0} x2={ox(vds)} y2={oy(id)} stroke={color} strokeDasharray="3 3" />
        <circle cx={ox(vds)} cy={oy(id)} r="5.5" fill={color} stroke="var(--well)" strokeWidth="1.5" />
      </svg>
      <figcaption>{t(FIG.outCap)}</figcaption>
    </figure>
  )
}

/* ---------- 转移特性 Id–Vgs ---------- */

const T_X0 = 56
const T_X1 = 440
const T_Y0 = 262
const T_Y1 = 64
/** 纵轴满量程候选，都能被 4 整除得到 2 位小数的刻度，单位 mA */
const NICE_MAX = [0.04, 0.08, 0.2, 0.4, 0.8, 2, 4, 8]
const tx = (v: number) => T_X0 + (v / VDD) * (T_X1 - T_X0)

function niceMax(imaxMa: number) {
  for (const m of NICE_MAX) {
    if (imaxMa <= m) {
      return m
    }
  }
  return NICE_MAX[NICE_MAX.length - 1]
}

/** 沿 Vgs 的分段：在 Vth 和 Vds + Vth 处断开，每段取中点判区 */
function transferRuns(vds: number) {
  const grid: number[] = []
  for (let k = 0; k <= 66; k += 1) {
    grid.push((k / 66) * VDD)
  }
  for (const b of [VTN, VTN + vds]) {
    if (b > 0 && b < VDD) {
      grid.push(b)
    }
  }
  grid.sort((a, b) => a - b)
  const runs: Array<{ region: Region; pts: number[] }> = []
  for (let k = 0; k < grid.length - 1; k += 1) {
    const a = grid[k]
    const b = grid[k + 1]
    if (b - a < 1e-9) {
      continue
    }
    const region = nRegion((a + b) / 2, vds)
    const last = runs[runs.length - 1]
    if (last && last.region === region) {
      last.pts.push(b)
    } else {
      runs.push({ region, pts: [a, b] })
    }
  }
  return runs
}

export function TransferFig({ vgs, vds }: { vgs: number; vds: number }) {
  const { t } = useLocale()
  const region = nRegion(vgs, vds)
  const color = REGION_COLOR[region]
  const ymax = niceMax(nId(VDD, vds) / MA) * MA
  const ty = (i: number) => T_Y0 - (i / ymax) * (T_Y0 - T_Y1)
  const id = nId(vgs, vds)
  const runs = transferRuns(vds)
  const legend: Region[] = ['cutoff', 'sat', 'linear']
  const xTicks = [0, 1, 2, 3]

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.trAria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />
        {legend.map((r, k) => (
          <g key={r}>
            <rect x={T_X0 + k * 110} y={10} width="10" height="8" fill={REGION_COLOR[r]} />
            <T x={T_X0 + k * 110 + 14} y={18} anchor="start" size={10} color="var(--muted)">{t(regionName(r))}</T>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((k) => {
          const v = (ymax * k) / 4
          return (
            <g key={k}>
              <line x1={T_X0} y1={ty(v)} x2={T_X1} y2={ty(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
              <T x={T_X0 - 8} y={ty(v) + 4} anchor="end" size={10} color="var(--dim)" mono>{`${+(v / MA).toFixed(2)}`}</T>
            </g>
          )
        })}
        {xTicks.map((v) => (
          <T key={v} x={tx(v)} y={T_Y0 + 16} size={10} color="var(--dim)" mono>{`${v}`}</T>
        ))}
        <line x1={T_X0} y1={T_Y0} x2={T_X1} y2={T_Y0} stroke="var(--line-2)" />
        <line x1={T_X0} y1={T_Y0} x2={T_X0} y2={T_Y1} stroke="var(--line-2)" />
        <T x={T_X0} y={48} anchor="start" size={11} color="var(--muted)">Id (mA)</T>
        <T x={T_X1} y={T_Y0 + 36} anchor="end" size={11} color="var(--muted)">Vgs (V)</T>

        {runs.map((run, k) => (
          <rect key={`band${k}`} x={tx(run.pts[0])} y={T_Y0 - 2} width={tx(run.pts[run.pts.length - 1]) - tx(run.pts[0])} height="5" fill={REGION_COLOR[run.region]} />
        ))}
        <line x1={tx(VTN)} y1={T_Y0} x2={tx(VTN)} y2={T_Y1} stroke="var(--red)" strokeDasharray="4 3" />
        <T x={tx(VTN) + 5} y={T_Y1 + 12} anchor="start" size={10} color="var(--red)" mono>{`${t(FIG.trVth)} = ${VTN} V`}</T>
        {runs.map((run, k) => (
          <path
            key={`run${k}`}
            d={run.pts.map((v, j) => `${j === 0 ? 'M' : 'L'}${tx(v).toFixed(1)} ${ty(nId(v, vds)).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={REGION_COLOR[run.region]}
            strokeWidth="2.6"
          />
        ))}
        <line x1={tx(vgs)} y1={T_Y0} x2={tx(vgs)} y2={ty(id)} stroke={color} strokeDasharray="3 3" />
        <circle cx={tx(vgs)} cy={ty(id)} r="5.5" fill={color} stroke="var(--well)" strokeWidth="1.5" />
      </svg>
      <figcaption>{t(FIG.trCap)}</figcaption>
    </figure>
  )
}
