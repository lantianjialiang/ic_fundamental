import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './rfCalData'
import { F_START_GHZ, F_STOP_GHZ, SPEC_DB, type CalMethod, type CalResult } from './rfCalModel'

/** 链路示意：仪器 → 线缆 → 夹具 → DUT；两条虚线是可能的校准参考面，高亮的是当前方式用到的那一个 */
export function PathFig({ method, caption }: { method: CalMethod; caption: string }) {
  const { t } = useLocale()
  const portOn = method === 'deembed'
  const dutOn = method === 'dut'
  return (
    <figure className="rf-cal-path-wrap">
      <svg className="rf-cal-path" viewBox="0 0 480 110" role="img" aria-label={t(FIG.pathAria)}>
        <rect x="0" y="0" width="480" height="110" rx="10" className="rf-fig-bg" />

        <rect x="10" y="44" width="100" height="40" rx="6" className="rf-fig-box" />
        <text x="60" y="69" textAnchor="middle" className="rf-fig-text">{t(FIG.boxInstrument)}</text>

        <rect x="150" y="50" width="80" height="28" rx="4" className="rf-fig-box" />
        <text x="190" y="68" textAnchor="middle" className="rf-fig-text">{t(FIG.boxCable)}</text>

        <rect
          x="270"
          y="50"
          width="80"
          height="28"
          rx="4"
          className={`rf-fig-box${method === 'deembed' ? ' is-on' : ''}`}
        />
        <text x="310" y="68" textAnchor="middle" className="rf-fig-text">{t(FIG.boxFixture)}</text>

        <rect x="380" y="44" width="90" height="40" rx="6" className="rf-fig-box" />
        <text x="425" y="69" textAnchor="middle" className="rf-fig-text">{t(FIG.boxDut)}</text>

        <line x1="110" y1="64" x2="150" y2="64" className="rf-fig-wire" />
        <line x1="230" y1="64" x2="270" y2="64" className="rf-fig-wire" />
        <line x1="350" y1="64" x2="380" y2="64" className="rf-fig-wire" />

        <line x1="110" y1="26" x2="110" y2="94" className={`rf-cal-plane${portOn ? ' is-on' : ''}`} />
        <text x="110" y="18" textAnchor="middle" className={`rf-fig-muted${portOn ? ' is-on' : ''}`}>{t(FIG.planePort)}</text>

        <line x1="380" y1="26" x2="380" y2="94" className={`rf-cal-plane${dutOn ? ' is-on' : ''}`} />
        <text x="380" y="18" textAnchor="middle" className={`rf-fig-muted${dutOn ? ' is-on' : ''}`}>{t(FIG.planeDut)}</text>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

const CW = 480
const CH = 250
const PAD_L = 44
const PAD_R = 50
const PAD_T = 30
const PAD_B = 28
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 误差随频率的曲线：红线校准前，蓝线校准后，金色带是 ±SPEC_DB 规格 */
export function ErrorFig({ result }: { result: CalResult }) {
  const { t } = useLocale()
  const maxAbs = Math.max(result.maxBefore, SPEC_DB)
  const yMax = Math.max(1, Math.ceil(maxAbs * 2) / 2)
  const xOf = (f: number) => PAD_L + ((f - F_START_GHZ) / (F_STOP_GHZ - F_START_GHZ)) * PLOT_W
  const yOf = (db: number) => PAD_T + ((yMax - db) / (2 * yMax)) * PLOT_H
  const lineOf = (key: 'before' | 'after') =>
    result.points.map((p) => `${xOf(p.f).toFixed(1)},${yOf(p[key]).toFixed(1)}`).join(' ')
  const xTicks = [1, 2, 3, 4, 5, 6]

  return (
    <figure className="term-fig rf-cal-err-wrap">
      <svg className="rf-cal-err" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.errAria)}>
        <rect x="0" y="0" width={CW} height={CH} rx="10" className="rf-fig-bg" />

        <text x="8" y="16" className="rf-fig-muted">{t(FIG.unitDb)}</text>
        <line x1={PAD_L} y1={14} x2={PAD_L + 14} y2={14} className="rf-cal-line--before" />
        <text x={PAD_L + 20} y={18} className="rf-fig-text">{t(FIG.legendBefore)}</text>
        <line x1={PAD_L + 90} y1={14} x2={PAD_L + 104} y2={14} className="rf-cal-line--after" />
        <text x={PAD_L + 110} y={18} className="rf-fig-text">{t(FIG.legendAfter)}</text>

        <rect
          x={PAD_L}
          y={yOf(SPEC_DB)}
          width={PLOT_W}
          height={yOf(-SPEC_DB) - yOf(SPEC_DB)}
          className="rf-cal-spec"
        />

        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} className="rf-fig-axis" />
        <line x1={PAD_L} y1={yOf(0)} x2={PAD_L + PLOT_W} y2={yOf(0)} className="rf-fig-grid" />
        <line x1={PAD_L} y1={yOf(SPEC_DB)} x2={PAD_L + PLOT_W} y2={yOf(SPEC_DB)} className="rf-cal-spec-line" />
        <line x1={PAD_L} y1={yOf(-SPEC_DB)} x2={PAD_L + PLOT_W} y2={yOf(-SPEC_DB)} className="rf-cal-spec-line" />

        <text x={PAD_L - 6} y={yOf(yMax) + 4} textAnchor="end" className="rf-fig-muted">{`+${yMax.toFixed(1)}`}</text>
        <text x={PAD_L - 6} y={yOf(0) + 4} textAnchor="end" className="rf-fig-muted">0</text>
        <text x={PAD_L - 6} y={yOf(-yMax) + 4} textAnchor="end" className="rf-fig-muted">{`−${yMax.toFixed(1)}`}</text>

        <text x={PAD_L + PLOT_W + 6} y={yOf(SPEC_DB) + 4} className="rf-fig-muted">{`+${SPEC_DB.toFixed(1)}`}</text>
        <text x={PAD_L + PLOT_W + 6} y={yOf(-SPEC_DB) + 4} className="rf-fig-muted">{`−${SPEC_DB.toFixed(1)}`}</text>

        {xTicks.map((f) => (
          <g key={f}>
            <line x1={xOf(f)} y1={PAD_T + PLOT_H} x2={xOf(f)} y2={PAD_T + PLOT_H + 4} className="rf-fig-axis" />
            <text x={xOf(f)} y={PAD_T + PLOT_H + 16} textAnchor="middle" className="rf-fig-muted">{`${f}`}</text>
          </g>
        ))}
        <text x={PAD_L + PLOT_W + 8} y={PAD_T + PLOT_H + 16} className="rf-fig-muted">{t(FIG.unitGhz)}</text>

        <polyline points={lineOf('before')} className="rf-cal-line--before" />
        <polyline points={lineOf('after')} className="rf-cal-line--after" />
      </svg>
      <figcaption>{t(FIG.errCap)}</figcaption>
    </figure>
  )
}
