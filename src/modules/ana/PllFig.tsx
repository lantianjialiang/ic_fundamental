import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './pllData'
import { LOCK_SPEC_US, LOCK_WINDOW_PPM, MEASURE_WINDOW_US, START_OFFSET_PPM, lockCurve, type PllResult } from './pllModel'

const W = 480
const H = 200
const PX0 = 44
const PX1 = 456
const PY_TOP = 26
const PY_BOT = 176
const PPM_TICKS = [START_OFFSET_PPM, 1000, 100, 10, 1]
const TIME_TICKS = [0, 10, 20, 30, 40]

/** 时间 → x 坐标：0 … MEASURE_WINDOW_US 映射到绘图区宽度 */
const tx = (us: number) => PX0 + (us / MEASURE_WINDOW_US) * (PX1 - PX0)

/** 误差（ppm）→ y 坐标：对数刻度，START_OFFSET_PPM 在顶部，1 ppm 在底部 */
const ly = (ppm: number) => {
  const clamped = Math.max(1, ppm)
  return PY_TOP + (1 - Math.log10(clamped) / Math.log10(START_OFFSET_PPM)) * (PY_BOT - PY_TOP)
}

/** 锁定曲线、锁定窗（±10 ppm）、10 µs 规格线与锁定时间标注；不稳定时不画曲线 */
export function PllFig({ bwKhz, result }: { bwKhz: number; result: PllResult }) {
  const { t } = useLocale()
  const windowY = ly(LOCK_WINDOW_PPM)
  const specX = tx(LOCK_SPEC_US)
  const stable = result.stable
  const locked = stable && result.lockUs <= MEASURE_WINDOW_US
  const curve = stable
    ? lockCurve(bwKhz)
        .map((p) => `${tx(p.t).toFixed(1)},${ly(p.ppm).toFixed(1)}`)
        .join(' ')
    : ''

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.specAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY_TOP} width={PX1 - PX0} height={PY_BOT - PY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />

        {PPM_TICKS.map((ppm) => (
          <text key={ppm} x={PX0 - 4} y={ly(ppm) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${ppm}`}
          </text>
        ))}
        {TIME_TICKS.map((us) => (
          <text
            key={us}
            x={tx(us)}
            y={190}
            textAnchor={us === 0 ? 'start' : us === MEASURE_WINDOW_US ? 'end' : 'middle'}
            fill="var(--muted)"
            fontSize="10"
            fontFamily="var(--mono)"
          >
            {`${us}`}
          </text>
        ))}

        <line x1={PX0} x2={PX1} y1={windowY} y2={windowY} stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={specX} x2={specX} y1={PY_TOP} y2={PY_BOT} stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={PX0 + 2} y={PY_TOP - 8} fill="var(--gold)" fontSize="10">
          {t(FIG.lockWin)}
        </text>
        <text x={specX + 4} y={PY_TOP - 8} fill="var(--red)" fontSize="10">
          {t(FIG.specLbl)}
        </text>

        {stable ? <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth="2" /> : null}

        {locked ? (
          <g>
            <circle cx={tx(result.lockUs)} cy={windowY} r="3.5" fill="var(--green)" />
            <text x={tx(result.lockUs) - 6} y={windowY + 14} textAnchor="end" fill="var(--green)" fontSize="10" fontFamily="var(--mono)">
              {`${t(FIG.lockLbl)} ${result.lockUs.toFixed(1)} µs`}
            </text>
          </g>
        ) : null}
        {stable && !locked ? (
          <text x={PX1 - 4} y={PY_BOT - 6} textAnchor="end" fill="var(--muted)" fontSize="10">
            {t(FIG.noLock)}
          </text>
        ) : null}
        {!stable ? (
          <text x={(PX0 + PX1) / 2} y={(PY_TOP + PY_BOT) / 2} textAnchor="middle" fill="var(--red)" fontSize="11">
            {t(FIG.unstable)}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(FIG.figCap)}</figcaption>
    </figure>
  )
}
