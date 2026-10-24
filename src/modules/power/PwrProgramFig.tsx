import { useLocale } from '../../i18n/LocaleContext'
import { BIN_TEXT, FIG } from './pwrProgramData'
import { SITE_BAD, type SiteStat } from './pwrProgramModel'

const PW = 520
const P_LABEL_X = 12
const P_BAR_X = 226
const P_BAR_MAX = 214
const P_ROW = 26
const P_TOP = 40

/** 失效 Bin 的 Pareto：按颗数从多到少，条形长度按最大值归一 */
export function ParetoFig({ rows }: { rows: Array<{ bin: number; count: number }> }) {
  const { t } = useLocale()
  const maxCount = Math.max(1, ...rows.map((r) => r.count))
  const height = P_TOP + Math.max(1, rows.length) * P_ROW + 16
  return (
    <figure className="term-fig pwrp-fig">
      <svg viewBox={`0 0 ${PW} ${height}`} role="img" aria-label={t(FIG.paretoAria)} className="pwrp-svg">
        <rect x={0} y={0} width={PW} height={height} rx={10} fill="var(--well)" />
        <text x={P_LABEL_X} y={20} fill="var(--text)" fontSize={12}>
          {t(FIG.paretoTitle)}
        </text>
        {rows.length === 0 ? (
          <text x={P_LABEL_X} y={P_TOP + 14} fill="var(--muted)" fontSize={11}>
            {'—'}
          </text>
        ) : null}
        {rows.map((row, i) => {
          const y = P_TOP + i * P_ROW
          const width = Math.max(2, (row.count / maxCount) * P_BAR_MAX)
          const label = BIN_TEXT[row.bin]
          return (
            <g key={row.bin}>
              <text x={P_LABEL_X} y={y + 16} fill="var(--text)" fontSize={11}>
                {`Bin ${row.bin}`}
              </text>
              <text x={P_LABEL_X + 52} y={y + 16} fill="var(--muted)" fontSize={11}>
                {label ? t(label) : ''}
              </text>
              <rect x={P_BAR_X} y={y + 5} width={P_BAR_MAX} height={14} rx={3} fill="var(--fig-box)" />
              <rect x={P_BAR_X} y={y + 5} width={width} height={14} rx={3} fill="var(--gold)" fillOpacity={0.8} />
              <text x={P_BAR_X + width + 6} y={y + 16} fill="var(--text)" fontSize={11} fontFamily="var(--mono)">
                {String(row.count)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.paretoCap)}</figcaption>
    </figure>
  )
}

const SW = 520
const SH = 200
const S_BASE = 150
const S_TOP = 46
const S_BAR_MAX = S_BASE - S_TOP
const S_GROUP = 120
const S_X0 = 70

/** 四个 Site 的 Kelvin 失效数（柱）与 Rds 均值（底部数字）；Site 3 用强调色 */
export function SiteFig({ sites }: { sites: SiteStat[] }) {
  const { t } = useLocale()
  const maxFails = Math.max(1, ...sites.map((s) => s.kelvinFails))
  return (
    <figure className="term-fig pwrp-fig">
      <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label={t(FIG.siteAria)} className="pwrp-svg">
        <rect x={0} y={0} width={SW} height={SH} rx={10} fill="var(--well)" />
        <text x={12} y={20} fill="var(--text)" fontSize={12}>
          {t(FIG.siteTitle)}
        </text>
        <line x1={20} x2={SW - 20} y1={S_BASE} y2={S_BASE} stroke="var(--line-2)" />
        {sites.map((s, i) => {
          const cx = S_X0 + i * S_GROUP
          const h = (s.kelvinFails / maxFails) * S_BAR_MAX
          const color = s.site === SITE_BAD ? 'var(--gold)' : 'var(--blue)'
          return (
            <g key={s.site}>
              <rect x={cx - 20} y={S_BASE - h} width={40} height={h} rx={3} fill={color} fillOpacity={0.8} />
              <text x={cx} y={S_BASE - h - 5} textAnchor="middle" fill="var(--text)" fontSize={11} fontFamily="var(--mono)">
                {String(s.kelvinFails)}
              </text>
              <text x={cx} y={S_BASE + 16} textAnchor="middle" fill="var(--text)" fontSize={11}>
                {t(FIG.siteLabel(s.site))}
              </text>
              <text x={cx} y={S_BASE + 34} textAnchor="middle" fill="var(--muted)" fontSize={11} fontFamily="var(--mono)">
                {s.rdsMean.toFixed(2)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.figCap)}</figcaption>
    </figure>
  )
}