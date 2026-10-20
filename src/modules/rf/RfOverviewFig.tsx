import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { formatSi } from './rfFormat'
import { BANDS, LOG_MAX, LOG_MIN } from './rfOverviewModel'

const CW = 480
const CH = 176
const PAD_L = 14
const PAD_R = 14
const BAND_TOP = 52
const BAND_H = 40
const AXIS_Y = 122
const PLOT_W = CW - PAD_L - PAD_R

const TICKS = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11]
const BAND_FILL = ['#1f3b57', '#24486b', '#2c5a85', '#35699c', '#3f79b3', '#4a88c8']

const FIG = {
  aria: loc(
    '射频频段与当前频率：横轴为对数频率，六个色块是 MF 到 EHF 频段，竖线标出当前频率',
    'RF bands and current frequency: log frequency axis, six coloured blocks for MF to EHF, and a vertical line at the current frequency',
  ),
  cap: loc(
    '横轴按对数刻度，每一格差 10 倍。色块是 ITU 的频段划分；竖线是当前频率，它所在的色块就是它的频段。',
    'The axis is logarithmic, each step is ten times the last. The blocks are the ITU band split; the vertical line is the current frequency, and the block it sits in is its band.',
  ),
  axis: loc('频率（对数刻度）', 'Frequency (log scale)'),
}

/** 把频率映射到横坐标；超出滑块范围的部分夹在两端 */
function xOf(freqHz: number): number {
  const clamped = Math.min(Math.max(freqHz, 10 ** LOG_MIN), 10 ** LOG_MAX)
  return PAD_L + ((Math.log10(clamped) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * PLOT_W
}

/** 频段色块 + 对数频率轴 + 当前频率竖线（纯 SVG） */
export function RfOverviewFig({ freqHz }: { freqHz: number }) {
  const { t } = useLocale()
  const x = xOf(freqHz)
  const labelOnLeft = x > CW / 2
  return (
    <figure className="term-fig">
      <svg className="rf-svg" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.aria)}>
        <rect x={0} y={0} width={CW} height={CH} rx={10} className="rf-svg__bg" />
        {BANDS.map((band, index) => {
          const x0 = xOf(band.low)
          const x1 = xOf(band.high)
          return (
            <g key={band.code}>
              <rect x={x0} y={BAND_TOP} width={x1 - x0} height={BAND_H} fill={BAND_FILL[index % BAND_FILL.length]} />
              <text x={(x0 + x1) / 2} y={BAND_TOP + BAND_H / 2} textAnchor="middle" dominantBaseline="middle" className="rf-band-label">
                {band.code}
              </text>
            </g>
          )
        })}
        <line x1={PAD_L} y1={AXIS_Y} x2={CW - PAD_R} y2={AXIS_Y} className="rf-axis" />
        {TICKS.map((hz, index) => {
          const anchor = index === 0 ? 'start' : 'middle'
          return (
            <g key={hz}>
              <line x1={xOf(hz)} y1={AXIS_Y} x2={xOf(hz)} y2={AXIS_Y + 5} className="rf-axis" />
              <text x={xOf(hz)} y={AXIS_Y + 18} textAnchor={anchor} className="rf-tick">
                {formatSi(hz, 'Hz', 3)}
              </text>
            </g>
          )
        })}
        <text x={CW / 2} y={CH - 6} textAnchor="middle" className="rf-tick">
          {t(FIG.axis)}
        </text>
        <line x1={x} y1={BAND_TOP - 14} x2={x} y2={AXIS_Y} className="rf-marker" />
        <circle cx={x} cy={AXIS_Y} r={4} className="rf-marker-dot" />
        <text x={labelOnLeft ? x - 6 : x + 6} y={BAND_TOP - 18} textAnchor={labelOnLeft ? 'end' : 'start'} className="rf-marker-label">
          {formatSi(freqHz, 'Hz')}
        </text>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
