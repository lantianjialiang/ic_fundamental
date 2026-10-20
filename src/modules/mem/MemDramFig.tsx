import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './memDramData'
import { CELLS, COLS, DECAY_MAX_MS, ROWS, SWEEP_MS, V_MIN_RATIO, decayCurve, medianRetention, type DramAnalysis } from './memDramModel'

/** 示波器风格的深色底，颜色写死：SVG 里不便读 CSS 变量 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const CELL_OK = '#2b3d55'
const CELL_FAIL = '#f85149'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const MONO = 'Consolas, ui-monospace, monospace'

/* ---------- 阵列：每个方块一个单元，失效标红 ---------- */

const CELL = 6
const ARR_PAD = 8
const ARR_W = ARR_PAD * 2 + COLS * CELL
const ARR_H = ARR_PAD * 2 + ROWS * CELL

export function DramArrayFig({ analysis }: { analysis: DramAnalysis }) {
  const { t } = useLocale()
  const weakRow = Math.floor(analysis.weakestIndex / COLS)
  const weakCol = analysis.weakestIndex % COLS
  const cells = Array.from({ length: CELLS }, (_, i) => {
    const x = ARR_PAD + (i % COLS) * CELL
    const y = ARR_PAD + Math.floor(i / COLS) * CELL
    const failing = analysis.failMask[i] === 1
    return <rect key={i} x={x} y={y} width={CELL - 1} height={CELL - 1} fill={failing ? CELL_FAIL : CELL_OK} />
  })

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${ARR_W} ${ARR_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.arrayAria)}>
        <rect x={0} y={0} width={ARR_W} height={ARR_H} fill={BG} />
        {cells}
        <rect
          x={ARR_PAD + weakCol * CELL - 1}
          y={ARR_PAD + weakRow * CELL - 1}
          width={CELL + 1}
          height={CELL + 1}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.2}
        />
      </svg>
      <figcaption>{t(FIG.arrayCap)}</figcaption>
    </figure>
  )
}

/* ---------- 衰减曲线：最弱单元 vs 典型单元 ---------- */

const DC_W = 440
const DC_H = 210
const DC_PAD_L = 40
const DC_PAD_R = 12
const DC_PAD_T = 14
const DC_PAD_B = 28
const DC_PLOT_W = DC_W - DC_PAD_L - DC_PAD_R
const DC_PLOT_H = DC_H - DC_PAD_T - DC_PAD_B

const xOfT = (ms: number) => DC_PAD_L + (ms / DECAY_MAX_MS) * DC_PLOT_W
const yOfV = (v: number) => DC_PAD_T + (1 - v) * DC_PLOT_H

function polyline(retMs: number): string {
  return decayCurve(retMs, DECAY_MAX_MS, 160)
    .map((p) => `${xOfT(p.t).toFixed(1)},${yOfV(p.v).toFixed(1)}`)
    .join(' ')
}

export function DramDecayFig({ analysis, tRef }: { analysis: DramAnalysis; tRef: number }) {
  const { t } = useLocale()
  const typical = medianRetention(analysis.retention)
  const xRef = xOfT(tRef)
  const yThreshold = yOfV(V_MIN_RATIO)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${DC_W} ${DC_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.decayAria)}>
        <rect x={0} y={0} width={DC_W} height={DC_H} fill={BG} />
        {[0, V_MIN_RATIO, 1].map((v) => (
          <line key={v} x1={DC_PAD_L} x2={DC_PAD_L + DC_PLOT_W} y1={yOfV(v)} y2={yOfV(v)} stroke={GRID} strokeWidth={1} />
        ))}
        <line x1={DC_PAD_L} x2={DC_PAD_L} y1={DC_PAD_T} y2={DC_PAD_T + DC_PLOT_H} stroke={GRID} strokeWidth={1} />
        <line x1={xRef} x2={xRef} y1={DC_PAD_T} y2={DC_PAD_T + DC_PLOT_H} stroke={LABEL} strokeWidth={1} strokeDasharray="4 3" />
        <line
          x1={DC_PAD_L}
          x2={DC_PAD_L + DC_PLOT_W}
          y1={yThreshold}
          y2={yThreshold}
          stroke={GOLD}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <polyline points={polyline(typical)} fill="none" stroke={BLUE} strokeWidth={1.6} />
        <polyline points={polyline(analysis.weakestMs)} fill="none" stroke={CELL_FAIL} strokeWidth={1.6} />

        <g fontFamily={MONO} fontSize={11} fill={LABEL}>
          <text x={DC_PAD_L - 6} y={yOfV(1)} textAnchor="end" dominantBaseline="middle">1</text>
          <text x={DC_PAD_L - 6} y={yOfV(V_MIN_RATIO)} textAnchor="end" dominantBaseline="middle">0.5</text>
          <text x={DC_PAD_L - 6} y={yOfV(0)} textAnchor="end" dominantBaseline="middle">0</text>
          <text x={xOfT(0)} y={DC_PAD_T + DC_PLOT_H + 14} textAnchor="middle">0</text>
          <text x={xOfT(256)} y={DC_PAD_T + DC_PLOT_H + 14} textAnchor="middle">256</text>
          <text x={xOfT(DECAY_MAX_MS)} y={DC_PAD_T + DC_PLOT_H + 14} textAnchor="end">512 ms</text>
          <text x={xRef + 4} y={DC_PAD_T + 10} textAnchor="start">tREF</text>
          <text x={DC_PAD_L + DC_PLOT_W - 4} y={yThreshold - 4} textAnchor="end" fill={GOLD}>
            {t(FIG.thresholdLabel)}
          </text>
        </g>
      </svg>
      <figcaption>{t(FIG.decayCap)}</figcaption>
    </figure>
  )
}

/* ---------- 柱状图：同一批单元在不同 tREF 下的失效数 ---------- */

const SW_W = 440
const SW_H = 200
const SW_PAD_L = 40
const SW_PAD_R = 12
const SW_PAD_T = 14
const SW_PAD_B = 34
const SW_PLOT_W = SW_W - SW_PAD_L - SW_PAD_R
const SW_PLOT_H = SW_H - SW_PAD_T - SW_PAD_B

export function DramSweepFig({ fails, tRef }: { fails: number[]; tRef: number }) {
  const { t } = useLocale()
  const slot = SW_PLOT_W / SWEEP_MS.length
  const barW = slot * 0.6
  const maxFails = Math.max(1, ...fails)
  let nearest = 0
  for (let k = 0; k < SWEEP_MS.length; k += 1) {
    if (Math.abs(SWEEP_MS[k] - tRef) < Math.abs(SWEEP_MS[nearest] - tRef)) {
      nearest = k
    }
  }

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${SW_W} ${SW_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.sweepAria)}>
        <rect x={0} y={0} width={SW_W} height={SW_H} fill={BG} />
        <line x1={SW_PAD_L} x2={SW_PAD_L + SW_PLOT_W} y1={SW_PAD_T + SW_PLOT_H} y2={SW_PAD_T + SW_PLOT_H} stroke={GRID} strokeWidth={1} />
        <line x1={SW_PAD_L} x2={SW_PAD_L} y1={SW_PAD_T} y2={SW_PAD_T + SW_PLOT_H} stroke={GRID} strokeWidth={1} />
        {SWEEP_MS.map((ms, k) => {
          const h = (fails[k] / maxFails) * SW_PLOT_H
          const x = SW_PAD_L + k * slot + (slot - barW) / 2
          const y = SW_PAD_T + SW_PLOT_H - h
          const cx = x + barW / 2
          return (
            <g key={ms}>
              <rect x={x} y={y} width={barW} height={h} fill={k === nearest ? GOLD : BLUE} />
              <text x={cx} y={y - 4} textAnchor="middle" fontFamily={MONO} fontSize={11} fill={LABEL}>
                {fails[k]}
              </text>
              <text x={cx} y={SW_PAD_T + SW_PLOT_H + 14} textAnchor="middle" fontFamily={MONO} fontSize={11} fill={LABEL}>
                {ms}
              </text>
            </g>
          )
        })}
        <g fontFamily={MONO} fontSize={11} fill={LABEL}>
          <text x={SW_PAD_L - 6} y={SW_PAD_T + 4} textAnchor="end">{maxFails}</text>
          <text x={SW_PAD_L - 6} y={SW_PAD_T + SW_PLOT_H} textAnchor="end" dominantBaseline="middle">0</text>
          <text x={SW_PAD_L + SW_PLOT_W} y={SW_H - 6} textAnchor="end">{t(FIG.axisTref)}</text>
        </g>
      </svg>
      <figcaption>{t(FIG.sweepCap)}</figcaption>
    </figure>
  )
}
