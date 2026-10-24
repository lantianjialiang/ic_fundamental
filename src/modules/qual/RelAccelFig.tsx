import { useLocale } from '../../i18n/LocaleContext'
import { arrheniusAF } from './core/reliability'
import { EA_SPREAD, type AccelAnalysis, type AccelState } from './relAccelModel'
import { FIG } from './relAccelData'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 REL-01 一致） */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const W = 560
const H = 240

/* ---------- Arrhenius 曲线：AF_T 随试验温度（对数纵轴） ---------- */
const AX0 = 62
const AX1 = 540
const AY0 = 26
const AY1 = 196
const T_LO = 60
const T_HI = 160
/** 纵轴范围：10^-1 … 10^3 */
const LOG_LO = -1
const LOG_HI = 3

function mapTx(tC: number): number {
  return AX0 + ((tC - T_LO) / (T_HI - T_LO)) * (AX1 - AX0)
}

function mapAy(af: number): number {
  const lg = Math.log10(Math.max(af, Math.pow(10, LOG_LO)))
  const clamped = Math.min(Math.max(lg, LOG_LO), LOG_HI)
  return AY1 - ((clamped - LOG_LO) / (LOG_HI - LOG_LO)) * (AY1 - AY0)
}

const T_TICKS = [60, 80, 100, 120, 140, 160]
const AF_TICKS: Array<{ v: number; label: string }> = [
  { v: 0.1, label: '0.1' },
  { v: 1, label: '1' },
  { v: 10, label: '10' },
  { v: 100, label: '10²' },
  { v: 1000, label: '10³' },
]

export function ArrFig({ state }: { state: AccelState }) {
  const { t } = useLocale()
  const temps: number[] = []
  for (let tC = T_LO; tC <= T_HI; tC += 2) {
    temps.push(tC)
  }
  const curve = (ea: number) => temps.map((tC) => `${mapTx(tC).toFixed(1)} ${mapAy(arrheniusAF(ea, state.tUse, tC)).toFixed(1)}`)
  const path = (ea: number) => `M ${curve(ea).join(' L ')}`
  const markX = mapTx(state.tStress)
  const markY = mapAy(arrheniusAF(state.ea, state.tUse, state.tStress))
  return (
    <figure className="term-fig rel-acc-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.arrAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} fill={BOX} />
        <text x={AX0} y={16} fill={TEXT} fontSize={12}>
          {t(FIG.arrTitle)}
        </text>
        {AF_TICKS.map((tick) => (
          <g key={tick.label}>
            <line x1={AX0} y1={mapAy(tick.v)} x2={AX1} y2={mapAy(tick.v)} stroke={EDGE} strokeOpacity={0.35} strokeDasharray="2 4" />
            <text x={AX0 - 6} y={mapAy(tick.v) + 4} textAnchor="end" fill={MUTED} fontSize={11}>
              {tick.label}
            </text>
          </g>
        ))}
        {T_TICKS.map((tC) => (
          <text key={tC} x={mapTx(tC)} y={212} textAnchor="middle" fill={MUTED} fontSize={11}>
            {tC}
          </text>
        ))}
        <text x={AX1} y={232} textAnchor="end" fill={MUTED} fontSize={11}>
          {t(FIG.arrAxisT)}
        </text>
        <path d={path(state.ea - EA_SPREAD)} fill="none" stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={path(state.ea + EA_SPREAD)} fill="none" stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={path(state.ea)} fill="none" stroke={GOLD} strokeWidth={2} />
        <circle cx={markX} cy={markY} r={4} fill={GOLD} stroke={BG} strokeWidth={1.5} />
      </svg>
      <figcaption>
        {t(FIG.arrCap)}
        <span className="rel-legend">{t(FIG.arrLegend)}</span>
      </figcaption>
    </figure>
  )
}

/* ---------- 分项 AF 条形图：对数，中线为 1，未计入的分项标为未计入 ---------- */
const BX0 = 160
const BX1 = 430
const BMID = (BX0 + BX1) / 2
const HALF = (BX1 - BX0) / 2
/** 半宽对应的十进制范围：±2.5 个数量级 */
const SPAN = 2.5

function barX(value: number): number {
  const lg = Math.log10(Math.max(value, 1e-9))
  const clamped = Math.min(Math.max(lg, -SPAN), SPAN)
  return BMID + (clamped / SPAN) * HALF
}

type BarRow = { key: string; label: string; value: number; counted: boolean; accent: boolean }

export function FactorFig({ analysis }: { analysis: AccelAnalysis }) {
  const { t } = useLocale()
  const rows: BarRow[] = [
    { key: 'temp', label: t(FIG.facT), value: analysis.afT, counted: analysis.flags.temp, accent: false },
    { key: 'volt', label: t(FIG.facV), value: analysis.afV, counted: analysis.flags.volt, accent: false },
    { key: 'cycle', label: t(FIG.facCm), value: analysis.afCm, counted: analysis.flags.cycle, accent: false },
    { key: 'current', label: t(FIG.facJ), value: analysis.afJ, counted: analysis.flags.current, accent: false },
    { key: 'total', label: t(FIG.facTotal), value: analysis.total, counted: true, accent: true },
  ]
  return (
    <figure className="term-fig rel-acc-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.facAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <text x={12} y={18} fill={TEXT} fontSize={12}>
          {t(FIG.facTitle)}
        </text>
        <line x1={BMID} y1={26} x2={BMID} y2={200} stroke={MUTED} strokeDasharray="3 3" />
        {rows.map((row, i) => {
          const y = 44 + i * 36
          const hasValue = row.counted
          const xEnd = barX(row.value)
          const fill = row.accent ? GOLD : BLUE
          return (
            <g key={row.key}>
              <text x={12} y={y + 12} fill={row.counted ? TEXT : MUTED} fontSize={12}>
                {row.label}
              </text>
              <rect x={BX0} y={y} width={BX1 - BX0} height={16} rx={4} fill={BOX} />
              {hasValue ? (
                <rect x={Math.min(BMID, xEnd)} y={y} width={Math.abs(xEnd - BMID)} height={16} rx={3} fill={fill} />
              ) : null}
              <text x={548} y={y + 12} textAnchor="end" fill={row.counted ? TEXT : MUTED} fontSize={12}>
                {hasValue ? row.value.toFixed(2) : t(FIG.facNot)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.facCap)}</figcaption>
    </figure>
  )
}
