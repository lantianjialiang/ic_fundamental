import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './overviewData'
import { VREF, VREF_AXIS_HI, VREF_AXIS_LO, VREF_MAX, VREF_MIN, VREF_TYP, inLimits } from './overviewModel'

const LW = 480
const LH = 190
const LX0 = 30
const LX1 = 450

/** 把电压映射到数轴上的横坐标 */
const xOf = (volt: number) => LX0 + ((volt - VREF_AXIS_LO) / (VREF_AXIS_HI - VREF_AXIS_LO)) * (LX1 - LX0)

/**
 * 基准电压的 min / typ / max 数轴：绿色带是规格允许的范围，金色虚线是 typ（只作参考），
 * 圆点是测得值。min 标签放在左侧、max 放在右侧、typ 放在下方，三段文字互不重叠。
 */
export function LimitFig({ value }: { value: number }) {
  const { t } = useLocale()
  const ok = inLimits(value, VREF)
  const markX = xOf(value)
  const labelX = Math.min(LX1 - 40, Math.max(LX0 + 40, markX))
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${LW} ${LH}`} className="term-fig__svg" role="img" aria-label={t(FIG.limitAria)}>
        <rect width={LW} height={LH} rx="10" fill="var(--well)" />
        <text x={labelX} y="40" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight={700}>
          {`${t(FIG.measured)} ${value.toFixed(3)} V`}
        </text>

        <line x1={LX0} x2={LX1} y1="110" y2="110" stroke="var(--line-2)" />
        <rect x={xOf(VREF_MIN)} y="96" width={xOf(VREF_MAX) - xOf(VREF_MIN)} height="28" fill="var(--green)" fillOpacity="0.2" />
        <line x1={xOf(VREF_MIN)} x2={xOf(VREF_MIN)} y1="84" y2="136" stroke="var(--green)" strokeWidth="2" />
        <line x1={xOf(VREF_MAX)} x2={xOf(VREF_MAX)} y1="84" y2="136" stroke="var(--green)" strokeWidth="2" />
        <line x1={xOf(VREF_TYP)} x2={xOf(VREF_TYP)} y1="86" y2="134" stroke="var(--gold)" strokeDasharray="4 3" />

        <text x={xOf(VREF_MIN) - 6} y="78" textAnchor="end" fill="var(--green)" fontSize="10" fontFamily="var(--mono)">
          {`min ${VREF_MIN.toFixed(3)} V`}
        </text>
        <text x={xOf(VREF_MAX) + 6} y="78" textAnchor="start" fill="var(--green)" fontSize="10" fontFamily="var(--mono)">
          {`max ${VREF_MAX.toFixed(3)} V`}
        </text>
        <text x={xOf(VREF_TYP)} y="152" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {`typ ${VREF_TYP.toFixed(3)} V`}
        </text>

        <circle cx={markX} cy="110" r="6" fill={ok ? 'var(--green)' : 'var(--red)'} stroke="var(--text)" strokeWidth="1.5" />

        <text x={LX0} y="176" textAnchor="start" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${VREF_AXIS_LO.toFixed(3)} V`}
        </text>
        <text x={LX1} y="176" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${VREF_AXIS_HI.toFixed(3)} V`}
        </text>
      </svg>
      <figcaption>{t(FIG.limitCap)}</figcaption>
    </figure>
  )
}
