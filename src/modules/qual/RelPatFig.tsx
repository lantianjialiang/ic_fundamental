import { useLocale } from '../../i18n/LocaleContext'
import { CAT, S, fill } from './relPatData'
import { type LimitLine, type Outcome, SITE_IDS, type WindowId } from './relPatModel'

/** 晶圆图的判定配色：颜色写死在 SVG / 样式里，与 wafer.css 的 die 背景一起使用 */
export const OUTCOME_COLOR: Record<Outcome, string> = {
  pass: '#2b4766',
  spec: '#6e7681',
  'pat-latent': '#3fb950',
  'nbr-latent': '#9be9a8',
  'pat-good': '#d29922',
  'nbr-good': '#a371f7',
  escape: '#f85149',
}

const OUTCOME_ORDER: Outcome[] = ['pass', 'spec', 'pat-latent', 'nbr-latent', 'pat-good', 'nbr-good', 'escape']

/** 参数着色：以整 Lot 中位数为中心，z 在 ±4 之间，蓝到红 */
export function paramColor(z: number): string {
  const c = Math.min(4, Math.max(-4, z))
  const hue = 220 - ((c + 4) / 8) * 220
  return `hsl(${hue.toFixed(0)} 70% 50%)`
}

/** 判定配色的图例（与晶圆图颜色对应） */
export function OutcomeLegend() {
  const { t } = useLocale()
  return (
    <div className="rel-pat-legend">
      {OUTCOME_ORDER.map((o) => (
        <span key={o} className="rel-pat-legend__item">
          <i style={{ background: OUTCOME_COLOR[o] }} aria-hidden="true" />
          {t(CAT[o])}
        </span>
      ))}
    </div>
  )
}

const BINS = 30
const W = 520
const H = 210
const PAD_L = 14
const PAD_R = 14
const PAD_T = 12
const PAD_B = 26
const GOOD_BAR = '#3b6ea5'
const LATENT_BAR = '#f0883e'
const LOT_LINE = '#e8c45a'
const WAFER_LINE = '#c9d1d9'
const SITE_LINES = ['#58a6ff', '#3fb950', '#f778ba', '#d2a8ff']

/**
 * 参数直方图（PAT 页）：好 die 与潜在缺陷（真值）分色堆叠，画出当前窗口套用到本片的限值线。
 * 限值线的颜色：整 Lot 金色实线，本片灰色虚线，每 Site 按测试座着色。
 */
export function PatHistFig({
  values,
  lines,
  windowId,
  ariaLabel,
}: {
  values: Array<{ v: number; latent: boolean }>
  lines: LimitLine[]
  windowId: WindowId
  ariaLabel: string
}) {
  const { t } = useLocale()
  const finite = lines.flatMap((line) => [line.lo, line.hi]).filter((x) => Number.isFinite(x))
  const all = values.map((x) => x.v)
  const lo0 = Math.min(...all, ...finite)
  const hi0 = Math.max(...all, ...finite)
  const pad = (hi0 - lo0) * 0.02 || 1
  const lo = lo0 - pad
  const hi = hi0 + pad
  const binW = (hi - lo) / BINS

  const good = new Array<number>(BINS).fill(0)
  const latent = new Array<number>(BINS).fill(0)
  for (const x of values) {
    const idx = Math.min(BINS - 1, Math.max(0, Math.floor((x.v - lo) / binW)))
    if (x.latent) {
      latent[idx] += 1
    } else {
      good[idx] += 1
    }
  }
  const yMax = Math.max(1, ...good.map((g, i) => g + latent[i]))
  const xOf = (v: number) => PAD_L + ((v - lo) / (hi - lo)) * (W - PAD_L - PAD_R)
  const yOf = (count: number) => H - PAD_B - (count / yMax) * (H - PAD_T - PAD_B)
  const barW = (W - PAD_L - PAD_R) / BINS

  const lineStyle = (line: LimitLine) => {
    if (line.site !== null) {
      return { stroke: SITE_LINES[line.site % SITE_LINES.length], dash: undefined }
    }
    if (windowId === 'wafer') {
      return { stroke: WAFER_LINE, dash: '5 3' }
    }
    return { stroke: LOT_LINE, dash: undefined }
  }

  return (
    <figure className="rel-pat-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="rel-pat-svg" role="img" aria-label={ariaLabel}>
        <rect x={PAD_L} y={PAD_T} width={W - PAD_L - PAD_R} height={H - PAD_T - PAD_B} fill="#0d1117" stroke="#3d4756" />
        {good.map((g, i) => {
          const x = PAD_L + i * barW
          const yG = yOf(g)
          const yL = yOf(g + latent[i])
          return (
            <g key={i}>
              <rect x={x + 0.5} y={yG} width={Math.max(0, barW - 1)} height={H - PAD_B - yG} fill={GOOD_BAR} />
              <rect x={x + 0.5} y={yL} width={Math.max(0, barW - 1)} height={yG - yL} fill={LATENT_BAR} />
            </g>
          )
        })}
        {lines.map((line, index) => {
          const style = lineStyle(line)
          return (
            <g key={index}>
              {Number.isFinite(line.lo) ? (
                <line x1={xOf(line.lo)} x2={xOf(line.lo)} y1={PAD_T} y2={H - PAD_B} stroke={style.stroke} strokeWidth={1.6} strokeDasharray={style.dash} />
              ) : null}
              {Number.isFinite(line.hi) ? (
                <line x1={xOf(line.hi)} x2={xOf(line.hi)} y1={PAD_T} y2={H - PAD_B} stroke={style.stroke} strokeWidth={1.6} strokeDasharray={style.dash} />
              ) : null}
            </g>
          )
        })}
        <text x={PAD_L} y={H - 8} fill="#8b949e" fontSize={11}>
          {lo.toFixed(1)}
        </text>
        <text x={W - PAD_R} y={H - 8} textAnchor="end" fill="#8b949e" fontSize={11}>
          {hi.toFixed(1)}
        </text>
        <text x={PAD_L + 4} y={PAD_T + 12} fill="#8b949e" fontSize={11}>
          {String(yMax)}
        </text>
      </svg>
      <div className="rel-pat-legend">
        <span className="rel-pat-legend__item">
          <i style={{ background: GOOD_BAR }} aria-hidden="true" />
          {t(S.legGood)}
        </span>
        <span className="rel-pat-legend__item">
          <i style={{ background: LATENT_BAR }} aria-hidden="true" />
          {t(S.legLatent)}
        </span>
        {windowId === 'site'
          ? SITE_IDS.map((site) => (
              <span key={site} className="rel-pat-legend__item">
                <i style={{ background: SITE_LINES[site % SITE_LINES.length] }} aria-hidden="true" />
                {t(fill(S.legSite, site + 1))}
              </span>
            ))
          : null}
        {windowId === 'lot' ? (
          <span className="rel-pat-legend__item">
            <i style={{ background: LOT_LINE }} aria-hidden="true" />
            {t(S.legLot)}
          </span>
        ) : null}
        {windowId === 'wafer' ? (
          <span className="rel-pat-legend__item">
            <i style={{ background: WAFER_LINE }} aria-hidden="true" />
            {t(S.legWafer)}
          </span>
        ) : null}
      </div>
      <figcaption>{t(S.histCap)}</figcaption>
    </figure>
  )
}
