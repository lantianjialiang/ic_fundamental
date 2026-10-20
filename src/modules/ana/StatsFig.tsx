import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './statsData'
import {
  GUARD_GRID,
  HIST_BINS,
  HIST_HI,
  HIST_LO,
  LSL_MV,
  TARGET_ESCAPE_PCT,
  TARGET_OVERKILL_PCT,
  USL_MV,
  guardCurve,
  type StatsState,
} from './statsModel'

const W = 480
const H = 236
const PX0 = 44
const PX1 = 456
const PY0 = 14
const PY1 = 180
const HIST_TICKS = [1100, 1150, 1200, 1250, 1300]

const hx = (mv: number) => PX0 + ((mv - HIST_LO) / (HIST_HI - HIST_LO)) * (PX1 - PX0)

/** 测得值直方图：绿柱在测试限值之内（判通过），红柱在之外；红实线是规格，金虚线是测试限值 */
export function HistFig({ counts, testLo, testHi }: { counts: number[]; testLo: number; testHi: number }) {
  const { t } = useLocale()
  const maxCount = Math.max(1, ...counts)
  const binWidth = (PX1 - PX0) / HIST_BINS
  const binMv = (HIST_HI - HIST_LO) / HIST_BINS

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.histAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        {counts.map((count, index) => {
          if (count === 0) {
            return null
          }
          const center = HIST_LO + (index + 0.5) * binMv
          const inside = center >= testLo && center <= testHi
          const h = (count / maxCount) * (PY1 - PY0)
          return (
            <rect
              key={index}
              x={PX0 + index * binWidth}
              y={PY1 - h}
              width={Math.max(binWidth - 0.5, 0.5)}
              height={h}
              fill={inside ? 'var(--green)' : 'var(--red)'}
              fillOpacity={inside ? 0.75 : 0.6}
            />
          )
        })}

        <line x1={hx(LSL_MV)} x2={hx(LSL_MV)} y1={PY0} y2={PY1} stroke="var(--red)" strokeWidth="2" />
        <line x1={hx(USL_MV)} x2={hx(USL_MV)} y1={PY0} y2={PY1} stroke="var(--red)" strokeWidth="2" />
        <line x1={hx(testLo)} x2={hx(testLo)} y1={PY0} y2={PY1} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={hx(testHi)} x2={hx(testHi)} y1={PY0} y2={PY1} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />

        {HIST_TICKS.map((mv) => (
          <text key={mv} x={hx(mv)} y={192} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${mv}`}
          </text>
        ))}

        <rect x={PX0} y={205} width="9" height="9" fill="var(--green)" fillOpacity="0.75" />
        <text x={PX0 + 14} y={213} fill="var(--text)" fontSize="10">
          {t(FIG.histPass)}
        </text>
        <rect x={130} y={205} width="9" height="9" fill="var(--red)" fillOpacity="0.6" />
        <text x={144} y={213} fill="var(--text)" fontSize="10">
          {t(FIG.histFail)}
        </text>
        <line x1={230} x2={240} y1={209} y2={209} stroke="var(--red)" strokeWidth="2" />
        <text x={244} y={213} fill="var(--text)" fontSize="10">
          {t(FIG.histSpec)}
        </text>
        <line x1={340} x2={350} y1={209} y2={209} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={354} y={213} fill="var(--text)" fontSize="10">
          {t(FIG.histLimit)}
        </text>
      </svg>
      <figcaption>{t(FIG.histCap)}</figcaption>
    </figure>
  )
}

const GW = 480
const GH = 232
const GX0 = 44
const GX1 = 456
const GY0 = 14
const GY1 = 176
const GUARD_MAX = GUARD_GRID[GUARD_GRID.length - 1]
const gx = (guard: number) => GX0 + (guard / GUARD_MAX) * (GX1 - GX0)

/** 保护带扫描：过杀（蓝）与漏检（红）随保护带变化，虚线为目标，竖线为当前保护带 */
export function GuardFig({ state }: { state: StatsState }) {
  const { t } = useLocale()
  const curve = guardCurve(state, GUARD_GRID)
  const peak = Math.max(TARGET_OVERKILL_PCT, ...curve.map((p) => Math.max(p.overkillPct, p.escapePct)))
  const yMax = peak * 1.15
  const gy = (value: number) => GY1 - (value / yMax) * (GY1 - GY0)
  const overPts = curve.map((p) => `${gx(p.guard).toFixed(1)},${gy(p.overkillPct).toFixed(1)}`).join(' ')
  const underPts = curve.map((p) => `${gx(p.guard).toFixed(1)},${gy(p.escapePct).toFixed(1)}`).join(' ')
  const yTicks = [0, yMax / 2, yMax]

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${GW} ${GH}`} className="term-fig__svg" role="img" aria-label={t(FIG.guardAria)}>
        <rect width={GW} height={GH} rx="10" fill="var(--well)" />
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        <line x1={GX0} x2={GX1} y1={gy(TARGET_OVERKILL_PCT)} y2={gy(TARGET_OVERKILL_PCT)} stroke="var(--blue)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        <line x1={GX0} x2={GX1} y1={gy(TARGET_ESCAPE_PCT)} y2={gy(TARGET_ESCAPE_PCT)} stroke="var(--red)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />

        <polyline points={overPts} fill="none" stroke="var(--blue)" strokeWidth="2" />
        <polyline points={underPts} fill="none" stroke="var(--red)" strokeWidth="2" />

        <line x1={gx(state.guard)} x2={gx(state.guard)} y1={GY0} y2={GY1} stroke="var(--gold)" strokeWidth="1.5" />
        <text x={gx(state.guard) + 4} y={GY0 + 10} fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {`${state.guard} mV`}
        </text>

        {yTicks.map((value) => (
          <text key={value} x={GX0 - 6} y={gy(value) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${value.toFixed(2)}%`}
          </text>
        ))}
        {[0, 2, 4, 6, 8, 10].map((guard) => (
          <text key={guard} x={gx(guard)} y={190} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${guard}`}
          </text>
        ))}
        <text x={GX1} y={204} textAnchor="end" fill="var(--muted)" fontSize="10">
          {t(FIG.guardX)}
        </text>

        <line x1={GX0} x2={GX0 + 14} y1={222} y2={222} stroke="var(--blue)" strokeWidth="2" />
        <text x={GX0 + 18} y={226} fill="var(--text)" fontSize="10">
          {t(FIG.guardOver)}
        </text>
        <line x1={130} x2={144} y1={222} y2={222} stroke="var(--red)" strokeWidth="2" />
        <text x={148} y={226} fill="var(--text)" fontSize="10">
          {t(FIG.guardUnder)}
        </text>
        <line x1={210} x2={224} y1={222} y2={222} stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={228} y={226} fill="var(--text)" fontSize="10">
          {t(FIG.guardTarget)}
        </text>
        <line x1={290} x2={290} y1={216} y2={228} stroke="var(--gold)" strokeWidth="1.5" />
        <text x={296} y={226} fill="var(--text)" fontSize="10">
          {t(FIG.guardNow)}
        </text>
      </svg>
      <figcaption>{t(FIG.guardCap)}</figcaption>
    </figure>
  )
}
