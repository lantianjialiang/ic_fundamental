import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FAIL_DEPTH, FAIL_IDS, type FailId, curveFor, N_MAX, type ParallelResult, type ParallelState, SITE_COUNTS } from './memParallelModel'
import { FIG } from './memParallelData'

const W = 480
const H = 240
const Y_TOP = 38
const Y_BOT = 188

const LEFT_X0 = 44
const LEFT_X1 = 236
const RIGHT_X0 = 292
const RIGHT_X1 = 458

const STROKE: Record<FailId, string> = {
  few: 'var(--blue)',
  some: 'var(--gold)',
  many: 'var(--red)',
}

const xSite = (sites: number) => LEFT_X0 + ((sites - 1) / (N_MAX - 1)) * (LEFT_X1 - LEFT_X0)

/** 吞吐曲线（左）与失效存储器合计占用柱状图（右）；数据全部由模型算出 */
export function MemParallelFig({ state, result }: { state: ParallelState; result: ParallelResult }) {
  const { t } = useLocale()

  const curves = FAIL_IDS.map((fail) => ({ fail, points: curveFor(state.cap, fail) }))
  const yMax = Math.max(...curves.flatMap((c) => c.points.map((p) => p.throughput))) * 1.1
  const yOf = (value: number) => Y_BOT - (value / yMax) * (Y_BOT - Y_TOP)

  const failLabel: Record<FailId, string> = { few: t(FIG.few), some: t(FIG.some), many: t(FIG.many) }
  const leftLines: ReactNode[] = []
  for (const curve of curves) {
    const current = curve.fail === state.fail
    const points = curve.points.map((p) => `${xSite(p.sites).toFixed(1)},${yOf(p.throughput).toFixed(1)}`).join(' ')
    leftLines.push(
      <polyline
        key={curve.fail}
        points={points}
        fill="none"
        stroke={STROKE[curve.fail]}
        strokeWidth={current ? 3 : 1.5}
        opacity={current ? 1 : 0.45}
      />,
    )
  }

  const barMax = N_MAX * FAIL_DEPTH
  const barW = ((RIGHT_X1 - RIGHT_X0) / SITE_COUNTS.length) * 0.56
  const bars: ReactNode[] = []
  for (const n of SITE_COUNTS) {
    const total = n * result.stored
    const h = (total / barMax) * (Y_BOT - Y_TOP)
    const cx = RIGHT_X0 + ((n - 0.5) / SITE_COUNTS.length) * (RIGHT_X1 - RIGHT_X0)
    const current = n === state.sites
    bars.push(
      <g key={n}>
        <rect
          x={cx - barW / 2}
          y={Y_BOT - h}
          width={barW}
          height={Math.max(h, 0.5)}
          rx="2"
          fill={current ? 'var(--gold)' : 'var(--line-2)'}
        />
        <text x={cx} y={Y_BOT - h - 4} textAnchor="middle" fill="var(--text)" fontSize="9" fontFamily="var(--mono)">
          {total}
        </text>
        <text x={cx} y={Y_BOT + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {n}
        </text>
      </g>,
    )
  }

  return (
    <figure className="term-fig mpar-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.pairAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />

        <text x={LEFT_X0} y={16} fill="var(--text)" fontSize="11">
          {t(FIG.leftTitle)}
        </text>
        <line x1={LEFT_X0} x2={LEFT_X0} y1={Y_TOP} y2={Y_BOT} stroke="var(--line-2)" />
        <line x1={LEFT_X0} x2={LEFT_X1} y1={Y_BOT} y2={Y_BOT} stroke="var(--line-2)" />
        <line x1={LEFT_X1} x2={LEFT_X1} y1={Y_TOP} y2={Y_BOT} stroke="var(--red)" strokeDasharray="4 3" />
        <text x={LEFT_X1} y={Y_TOP - 6} textAnchor="end" fill="var(--red)" fontSize="9">
          {t(FIG.limit)}
        </text>
        {leftLines}
        <circle cx={xSite(state.sites)} cy={yOf(result.throughput)} r="4" fill="var(--text)" />
        {SITE_COUNTS.map((n) => (
          <text key={n} x={xSite(n)} y={Y_BOT + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {n}
          </text>
        ))}
        <text x={LEFT_X0 - 4} y={Y_BOT + 14} textAnchor="end" fill="var(--muted)" fontSize="9">
          0
        </text>
        <text x={LEFT_X0 - 4} y={Y_TOP + 8} textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          {`${Math.round(yMax / 1.1 / 1000)}k`}
        </text>
        <text x={(LEFT_X0 + LEFT_X1) / 2} y={Y_BOT + 26} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.xLabel)}
        </text>

        <text x={RIGHT_X0} y={16} fill="var(--text)" fontSize="11">
          {t(FIG.rightTitle)}
        </text>
        <line x1={RIGHT_X0} x2={RIGHT_X1} y1={Y_BOT} y2={Y_BOT} stroke="var(--line-2)" />
        {bars}
        <text x={(RIGHT_X0 + RIGHT_X1) / 2} y={Y_BOT + 26} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.xLabel)}
        </text>

        <g fontSize="10" fill="var(--muted)">
          <line x1={LEFT_X0} x2={LEFT_X0 + 16} y1={H - 14} y2={H - 14} stroke={STROKE.few} strokeWidth="2" />
          <text x={LEFT_X0 + 20} y={H - 10}>{failLabel.few}</text>
          <line x1={LEFT_X0 + 56} x2={LEFT_X0 + 72} y1={H - 14} y2={H - 14} stroke={STROKE.some} strokeWidth="2" />
          <text x={LEFT_X0 + 76} y={H - 10}>{failLabel.some}</text>
          <line x1={LEFT_X0 + 112} x2={LEFT_X0 + 128} y1={H - 14} y2={H - 14} stroke={STROKE.many} strokeWidth="2" />
          <text x={LEFT_X0 + 132} y={H - 10}>{failLabel.many}</text>
        </g>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
