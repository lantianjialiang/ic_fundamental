import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './staticData'
import { CODE_MAX, LIMIT_DNL_LSB, LIMIT_INL_LSB, NCODES, RAMP_LEN, type StaticResult } from './staticModel'

const HW = 480
const HH = 200
const HX0 = 40
const HX1 = 464
const HY_TOP = 24
const HY_BOT = 164
const HBW = (HX1 - HX0) / NCODES - 1.5

/** 码密度直方图：每个码一根柱子；理想中间码计数为虚线；命中数为 0 的码在基线上标红 */
export function HistFig({ result }: { result: StaticResult }) {
  const { t } = useLocale()
  const counts = result.counts
  const peak = Math.max(...counts, result.expected, 1)
  const yMax = peak * 1.08
  const cx = (code: number) => HX0 + (code + 0.5) * ((HX1 - HX0) / NCODES)
  const cy = (value: number) => HY_BOT - (value / yMax) * (HY_BOT - HY_TOP)
  const expY = cy(result.expected)
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${HW} ${HH}`} className="term-fig__svg" role="img" aria-label={t(FIG.histAria)}>
        <rect width={HW} height={HH} rx="10" fill="var(--well)" />
        <text x={HX0} y="14" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.histAxis)}
        </text>
        <text x={HX1} y="14" textAnchor="end" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.histExpect)}
        </text>

        <line x1={HX0} x2={HX1} y1={HY_BOT} y2={HY_BOT} stroke="var(--line-2)" />

        {counts.map((value, code) => {
          const interior = code >= 1 && code <= CODE_MAX - 1
          const fill = interior ? 'var(--blue)' : 'var(--muted)'
          const top = cy(value)
          return (
            <g key={code}>
              <rect x={cx(code) - HBW / 2} y={top} width={HBW} height={HY_BOT - top} fill={fill} fillOpacity="0.8" />
              {interior && value === 0 ? (
                <rect x={cx(code) - HBW / 2} y={HY_BOT - 3} width={HBW} height="3" fill="var(--red)" />
              ) : null}
            </g>
          )
        })}

        <line
          x1={cx(1) - HBW / 2}
          x2={cx(CODE_MAX - 1) + HBW / 2}
          y1={expY}
          y2={expY}
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {[0, 16, 32, 48, CODE_MAX].map((code) => (
          <text key={code} x={cx(code)} y="180" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {code}
          </text>
        ))}
        <text x={HX1} y="194" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`N = ${result.hits}, ${RAMP_LEN} LSB`}
        </text>
      </svg>
      <figcaption>{t(FIG.histCap)}</figcaption>
    </figure>
  )
}

const DW = 480
const DH = 244
const DX0 = 40
const DX1 = 460
const DHALF = 40
const DRANGE = 1.2
const TOP_C = 69
const BOT_C = 186

/** 中间码 k 的横坐标：k = 1 在左，k = 62 在右 */
const dx = (code: number) => DX0 + ((code - 1) / (CODE_MAX - 2)) * (DX1 - DX0)
const dyTop = (value: number) => TOP_C - (value / DRANGE) * DHALF
const dyBot = (value: number) => BOT_C - (value / DRANGE) * DHALF

/** 上半部分：每个中间码的 DNL 柱；下半部分：INL 折线。虚线为限值，超限的柱子标红 */
export function DnlInlFig({ result }: { result: StaticResult }) {
  const { t } = useLocale()
  const bw = (DX1 - DX0) / (CODE_MAX - 2) - 1.4
  const inlPoints = result.inl.map((v, index) => `${dx(index + 1).toFixed(1)},${dyBot(v).toFixed(1)}`).join(' ')
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${DW} ${DH}`} className="term-fig__svg" role="img" aria-label={t(FIG.dnlAria)}>
        <rect width={DW} height={DH} rx="10" fill="var(--well)" />
        <text x={DX0} y="22" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.dnlAxis)}
        </text>
        <text x={DX0} y="140" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.inlAxis)}
        </text>

        <line x1={DX0} x2={DX1} y1={TOP_C} y2={TOP_C} stroke="var(--line-2)" />
        <line x1={DX0} x2={DX1} y1={BOT_C} y2={BOT_C} stroke="var(--line-2)" />
        <line x1={DX0} x2={DX1} y1={dyTop(LIMIT_DNL_LSB)} y2={dyTop(LIMIT_DNL_LSB)} stroke="var(--gold)" strokeDasharray="4 3" />
        <line x1={DX0} x2={DX1} y1={dyTop(-LIMIT_DNL_LSB)} y2={dyTop(-LIMIT_DNL_LSB)} stroke="var(--gold)" strokeDasharray="4 3" />
        <line x1={DX0} x2={DX1} y1={dyBot(LIMIT_INL_LSB)} y2={dyBot(LIMIT_INL_LSB)} stroke="var(--gold)" strokeDasharray="4 3" />
        <line x1={DX0} x2={DX1} y1={dyBot(-LIMIT_INL_LSB)} y2={dyBot(-LIMIT_INL_LSB)} stroke="var(--gold)" strokeDasharray="4 3" />

        {result.dnl.map((v, index) => {
          const code = index + 1
          const y0 = dyTop(0)
          const y1 = dyTop(v)
          const fill = Math.abs(v) > LIMIT_DNL_LSB ? 'var(--red)' : 'var(--blue)'
          return (
            <rect
              key={code}
              x={dx(code) - bw / 2}
              y={Math.min(y0, y1)}
              width={bw}
              height={Math.max(Math.abs(y1 - y0), 0.5)}
              fill={fill}
              fillOpacity="0.85"
            />
          )
        })}

        <polyline points={inlPoints} fill="none" stroke="var(--purple)" strokeWidth="1.8" />

        {[1, 16, 32, 48, CODE_MAX - 1].map((code) => (
          <text key={code} x={dx(code)} y="238" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {code}
          </text>
        ))}
        <text x={DX1} y="20" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${LIMIT_DNL_LSB} / ${LIMIT_INL_LSB} LSB`}
        </text>
      </svg>
      <figcaption>{t(FIG.dnlCap)}</figcaption>
    </figure>
  )
}
