import { useLocale } from '../../i18n/LocaleContext'
import { fmtOhm } from '../fund/parts'
import { FIG, S } from './measureData'
import { I_RANGES, LEAD_OHM, LIMIT_PCT, V_RANGES, fmtSI, measureOnRange, type MeasureState } from './measureModel'

const HW = 480
const HH = 210

/** 接线示意：仪器在左，DUT 在右，两条加压回路（蓝），4 线时再加两根感测线（金色虚线） */
export function HookupFig({ state }: { state: MeasureState }) {
  const { t } = useLocale()
  const two = state.wires === 'two'
  const leadColor = two ? 'var(--red)' : 'var(--dim)'
  const modeText = state.mode === 'forceV' ? S.modeForceV : S.modeForceI
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${HW} ${HH}`} className="term-fig__svg" role="img" aria-label={t(FIG.hookAria)}>
        <rect width={HW} height={HH} rx="10" fill="var(--well)" />

        <rect x="20" y="58" width="130" height="136" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="85" y="78" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight={700}>
          {t(FIG.instrument)}
        </text>
        <text x="85" y="132" textAnchor="middle" fill="var(--text-2)" fontSize="10">
          {t(modeText)}
        </text>
        <text x="146" y="88" textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">S+</text>
        <text x="146" y="104" textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">F+</text>
        <text x="146" y="156" textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">F−</text>
        <text x="146" y="172" textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">S−</text>

        <path d="M150 100 H400 V110" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <path d="M400 150 V160 H150" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <rect x="200" y="94" width="40" height="12" fill={leadColor} fillOpacity="0.35" stroke={leadColor} />
        <text x="220" y="103" textAnchor="middle" fill="var(--text)" fontSize="9" fontFamily="var(--mono)">
          {fmtOhm(LEAD_OHM)}
        </text>
        <rect x="250" y="154" width="40" height="12" fill={leadColor} fillOpacity="0.35" stroke={leadColor} />
        <text x="270" y="163" textAnchor="middle" fill="var(--text)" fontSize="9" fontFamily="var(--mono)">
          {fmtOhm(LEAD_OHM)}
        </text>

        {two ? null : (
          <g fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeDasharray="5 3">
            <path d="M150 84 H410 V110" />
            <path d="M410 150 V176 H150" />
          </g>
        )}
        <text x="290" y="36" textAnchor="middle" fill="var(--text-2)" fontSize="10">
          {t(two ? FIG.senseTwo : FIG.senseFour)}
        </text>

        <rect x="370" y="110" width="60" height="40" fill="var(--fig-box-2)" stroke="var(--text-2)" />
        <text x="400" y="127" textAnchor="middle" fill="var(--text)" fontSize="10" fontWeight={700}>
          DUT
        </text>
        <text x="400" y="142" textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="var(--mono)">
          {fmtOhm(state.rDut)}
        </text>
      </svg>
      <figcaption>{t(FIG.hookCap)}</figcaption>
    </figure>
  )
}

const RW = 480
const ROW_H = 26
const TOP = 34
const BAR_X = 128
const BAR_W = 300
/** 横条的刻度上限：2% */
const AXIS_MAX_PCT = 2

/** 量程 vs 误差带：每一档量程画一根横条，超过限值的标红，超量程的标 OVR */
export function RangeFig({ state }: { state: MeasureState }) {
  const { t } = useLocale()
  const isV = state.mode === 'forceV'
  const ranges = isV ? I_RANGES : V_RANGES
  const selected = isV ? state.iRange : state.vRange
  const unit = isV ? 'A' : 'V'
  const rows = ranges.map((range) => ({ range, result: measureOnRange(state, range) }))
  const height = TOP + rows.length * ROW_H + 18
  const limitX = BAR_X + (LIMIT_PCT / AXIS_MAX_PCT) * BAR_W

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${RW} ${height}`} className="term-fig__svg" role="img" aria-label={t(FIG.rangeAria)}>
        <rect width={RW} height={height} rx="10" fill="var(--well)" />
        <text x={BAR_X} y="18" fill="var(--muted)" fontSize="10">
          {t(FIG.bandAxis)}
        </text>
        <text x={limitX} y={height - 2} textAnchor="middle" fill="var(--gold)" fontSize="10">
          {t(FIG.limitLabel)}
        </text>
        <line x1={limitX} x2={limitX} y1={TOP - 6} y2={height - 14} stroke="var(--gold)" strokeDasharray="4 3" />

        {rows.map((row, index) => {
          const y = TOP + index * ROW_H
          const isSel = row.range === selected
          const r = row.result
          const barColor = r.bandPct <= LIMIT_PCT ? 'var(--green)' : 'var(--red)'
          const barWidth = (Math.min(r.bandPct, AXIS_MAX_PCT) / AXIS_MAX_PCT) * BAR_W
          return (
            <g key={row.range}>
              <text x="12" y={y + 15} fill="var(--text)" fontSize="11" fontWeight={isSel ? 700 : 400} fontFamily="var(--mono)">
                {`${fmtSI(row.range, unit)}${isSel ? ' ◀' : ''}`}
              </text>
              <rect x={BAR_X} y={y + 5} width={BAR_W} height="12" fill="var(--fig-box-2)" />
              {r.overrange ? (
                <text x={BAR_X + 6} y={y + 15} fill="var(--red)" fontSize="11" fontWeight={700}>
                  OVR
                </text>
              ) : (
                <>
                  <rect x={BAR_X} y={y + 5} width={barWidth} height="12" fill={barColor} fillOpacity="0.8" />
                  <text x={BAR_X + BAR_W + 8} y={y + 15} fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
                    {`${r.bandPct.toFixed(2)}%`}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.rangeCap)}</figcaption>
    </figure>
  )
}
