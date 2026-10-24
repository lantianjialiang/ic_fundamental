import { useLocale } from '../../i18n/LocaleContext'
import { DEVICE_LABEL, fillL, S } from './pwrSelectorData'
import {
  DEVICE_TYPES,
  RATINGS,
  RDS_MOHM,
  lossOf,
  type AppSpec,
  type DevicePick,
  type DeviceType,
} from './pwrSelectorModel'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 RF 课保持一致） */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

/** 各器件的折线颜色；IGBT 不画 Rds(on)，所以没有折线颜色 */
const LINE_COLOR: Record<DeviceType, string> = {
  'si-mos': MUTED,
  igbt: '#d2a8ff',
  'sic-mos': GOLD,
  'gan-hemt': BLUE,
}

const RDS_W = 520
const RDS_H = 236
const PAD_L = 56
const PAD_R = 16
const PAD_T = 36
const PAD_B = 34
const PLOT_W = RDS_W - PAD_L - PAD_R
const PLOT_H = RDS_H - PAD_T - PAD_B
/** 纵轴：10^0 ～ 10^3 mΩ，对数刻度 */
const LOG_MIN = 0
const LOG_MAX = 3

const xOfIndex = (index: number) => PAD_L + ((index + 0.5) / RATINGS.length) * PLOT_W
const yOfMohm = (mohm: number) => PAD_T + (1 - (Math.log10(mohm) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * PLOT_H

/** 只画有数据的器件（IGBT 的 Rds(on) 整行为空，不画） */
const PLOTTED = DEVICE_TYPES.filter((type) => RDS_MOHM[type].some((value) => value !== null))

/** Rds(on) 随额定耐压的折线图（对数纵轴）；当前应用的耐压用虚线标出 */
export function RdsFig({ pick }: { pick: DevicePick }) {
  const { t } = useLocale()
  const currentIndex = RATINGS.indexOf(pick.rating)
  const currentValue = RDS_MOHM[pick.type][currentIndex]
  const summary =
    currentValue === null || currentValue === undefined
      ? t(fillL(S.rdsNoneSummary, { type: DEVICE_LABEL[pick.type], rating: String(pick.rating) }))
      : t(
          fillL(S.rdsSummary, {
            type: DEVICE_LABEL[pick.type],
            rating: String(pick.rating),
            value: currentValue.toFixed(1),
          }),
        )
  const ticks = [1, 10, 100, 1000]

  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox={`0 0 ${RDS_W} ${RDS_H}`} role="img" aria-label={t(S.rdsAria)} className="pwr-svg">
        <rect x={0} y={0} width={RDS_W} height={RDS_H} rx={10} fill={BG} />
        <text x={12} y={18} fill={TEXT} fontSize={12}>
          {t(S.rdsTitle)}
        </text>
        {PLOTTED.map((type, index) => (
          <g key={type} transform={`translate(${PAD_L + index * 118}, 26)`}>
            <line x1={0} y1={0} x2={14} y2={0} stroke={LINE_COLOR[type]} strokeWidth={2.5} />
            <text x={20} y={4} fill={TEXT} fontSize={11}>
              {t(DEVICE_LABEL[type])}
            </text>
          </g>
        ))}
        <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={BOX} stroke={EDGE} />
        {ticks.map((mohm) => (
          <g key={mohm}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOfMohm(mohm)} y2={yOfMohm(mohm)} stroke={EDGE} strokeDasharray="2 3" />
            <text x={PAD_L - 6} y={yOfMohm(mohm) + 4} textAnchor="end" fill={MUTED} fontSize={10}>
              {String(mohm)}
            </text>
          </g>
        ))}
        <text x={PAD_L - 6} y={PAD_T - 6} textAnchor="end" fill={MUTED} fontSize={10}>
          mΩ
        </text>
        {RATINGS.map((rating, index) => (
          <text key={rating} x={xOfIndex(index)} y={RDS_H - 12} textAnchor="middle" fill={MUTED} fontSize={11}>
            {`${rating} V`}
          </text>
        ))}
        {currentIndex >= 0 ? (
          <line
            x1={xOfIndex(currentIndex)}
            x2={xOfIndex(currentIndex)}
            y1={PAD_T}
            y2={PAD_T + PLOT_H}
            stroke={GOLD}
            strokeDasharray="4 3"
            opacity={0.7}
          />
        ) : null}
        {PLOTTED.map((type) => {
          const points = RATINGS.map((_, index) => ({ index, value: RDS_MOHM[type][index] }))
          let d = ''
          points.forEach((point, order) => {
            if (point.value === null) {
              return
            }
            const prev = order > 0 ? points[order - 1].value : null
            const cmd = prev === null ? 'M' : 'L'
            d += `${cmd}${xOfIndex(point.index).toFixed(1)},${yOfMohm(point.value).toFixed(1)} `
          })
          return (
            <g key={type}>
              <path d={d.trim()} fill="none" stroke={LINE_COLOR[type]} strokeWidth={2} />
              {points.map((point) =>
                point.value === null ? null : (
                  <circle
                    key={point.index}
                    cx={xOfIndex(point.index)}
                    cy={yOfMohm(point.value)}
                    r={type === pick.type && point.index === currentIndex ? 5.5 : 3}
                    fill={LINE_COLOR[type]}
                  />
                ),
              )}
            </g>
          )
        })}
      </svg>
      <figcaption>
        <span className="pwr-fig__summary">{summary}</span>
        <span className="pwr-fig__cap">{t(S.rdsCap)}</span>
      </figcaption>
    </figure>
  )
}

const LOSS_W = 520
const LOSS_H = 206
const LABEL_X = 8
const BAR_X = 132
const BAR_MAX = 250
const ROW_Y0 = 50
const ROW_GAP = 36

/** 四类器件在当前应用、当前耐压下的导通与开关损耗条形图（教学简化估算） */
export function LossFig({ app, pick }: { app: AppSpec; pick: DevicePick }) {
  const { t } = useLocale()
  const rows = DEVICE_TYPES.map((type) => ({ type, loss: lossOf(app, { type, rating: pick.rating }) }))
  const maxTotal = Math.max(1e-9, ...rows.map((row) => row.loss.total))
  const summary = rows
    .map((row) => `${t(DEVICE_LABEL[row.type])} ${row.loss.offered ? `${row.loss.total.toFixed(2)} W` : t(S.notOffered)}`)
    .join('; ')

  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox={`0 0 ${LOSS_W} ${LOSS_H}`} role="img" aria-label={t(S.lossAria)} className="pwr-svg">
        <rect x={0} y={0} width={LOSS_W} height={LOSS_H} rx={10} fill={BG} />
        <text x={12} y={18} fill={TEXT} fontSize={12}>
          {t(S.lossTitle)}
        </text>
        <rect x={BAR_X} y={28} width={10} height={10} rx={2} fill={BLUE} />
        <text x={BAR_X + 16} y={37} fill={TEXT} fontSize={11}>
          {t(S.legendCond)}
        </text>
        <rect x={BAR_X + 80} y={28} width={10} height={10} rx={2} fill={GOLD} />
        <text x={BAR_X + 96} y={37} fill={TEXT} fontSize={11}>
          {t(S.legendSw)}
        </text>
        {rows.map((row, index) => {
          const y = ROW_Y0 + index * ROW_GAP
          const isCurrent = row.type === pick.type
          const cond = row.loss.offered ? (row.loss.conduction / maxTotal) * BAR_MAX : 0
          const sw = row.loss.offered ? (row.loss.switching / maxTotal) * BAR_MAX : 0
          return (
            <g key={row.type}>
              <text x={LABEL_X} y={y + 13} fill={isCurrent ? TEXT : MUTED} fontSize={12} fontWeight={isCurrent ? 700 : 400}>
                {t(DEVICE_LABEL[row.type])}
              </text>
              <rect x={BAR_X} y={y} width={BAR_MAX} height={18} rx={4} fill={BOX} />
              {row.loss.offered ? (
                <g>
                  <rect x={BAR_X} y={y} width={Math.max(cond, 0)} height={18} rx={4} fill={BLUE} />
                  <rect x={BAR_X + cond} y={y} width={Math.max(sw, 0)} height={18} fill={GOLD} />
                  <text x={BAR_X + BAR_MAX + 8} y={y + 13} fill={TEXT} fontSize={11}>
                    {`${row.loss.total.toFixed(2)} W`}
                  </text>
                </g>
              ) : (
                <text x={BAR_X + 8} y={y + 13} fill={MUTED} fontSize={11}>
                  {t(S.notOffered)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption>
        <span className="pwr-fig__summary">{summary}</span>
        <span className="pwr-fig__cap">{t(S.lossCap)}</span>
      </figcaption>
    </figure>
  )
}
