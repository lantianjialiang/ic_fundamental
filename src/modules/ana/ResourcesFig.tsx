import { useLocale } from '../../i18n/LocaleContext'
import { seededRandom } from './core/rng'
import { FIG, PIN_NAME, RES_SHORT } from './resourcesData'
import {
  ERR_LIMIT_MV,
  PINS,
  SETTLE_MAX_US,
  compatible,
  readingDev,
  settleErrMv,
  type Assign,
  type PinId,
  type PinResult,
  type ResId,
  type Source,
} from './resourcesModel'

/** 每个引脚的线色：供电红、测量绿、激励蓝 */
const PIN_COLOR: Record<PinId, string> = { vdd: 'var(--red)', vref: 'var(--green)', ain: 'var(--blue)' }

/* ---------- 负载板示意：ATE 资源 → Relay → DUT 引脚 ---------- */

const LW = 480
const LH = 256
const BOX_X = 16
const BOX_W = 112
const BOX_H = 28
const BOX_Y0 = 40
const BOX_STEP = 38
const LB_X = 190
const LB_W = 150
const LB_Y = 34
const LB_H = 200
const RELAY_L = 276
const RELAY_R = 304
const DUT_X = 366
const DUT_Y = 96
const DUT_W = 104
const DUT_H = 110

/** 每种资源在左侧资源列中的行号（从上到下） */
const SOURCE_ROW: Record<Source, number> = { dps: 0, smu: 1, awg: 2, digitizer: 3, dmm: 4 }
const SOURCES: Source[] = ['dps', 'smu', 'awg', 'digitizer', 'dmm']
/** 三个 DUT 引脚在负载板右侧的高度，以及各自的走线竖向位置（互相错开，避免线段重合） */
const PIN_Y: Record<PinId, number> = { vdd: 150, vref: 170, ain: 190 }
const PIN_BUS: Record<PinId, number> = { vdd: 146, vref: 158, ain: 170 }

const boxY = (src: Source) => BOX_Y0 + SOURCE_ROW[src] * BOX_STEP
const boxMidY = (src: Source) => boxY(src) + BOX_H / 2

/** 负载板示意：资源选了就有一条线接到对应引脚（Relay 闭合），Off 时 Relay 断开；开屏蔽时画金色虚线框 */
export function LoadBoardFig({ assign, shield }: { assign: Assign; shield: boolean }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${LW} ${LH}`} className="term-fig__svg" role="img" aria-label={t(FIG.loadAria)}>
        <rect width={LW} height={LH} rx="10" fill="var(--well)" />
        <text x={BOX_X} y="24" fill="var(--muted)" fontSize="10">
          {t(FIG.resourceHeader)}
        </text>

        {SOURCES.map((src) => (
          <g key={src}>
            <rect x={BOX_X} y={boxY(src)} width={BOX_W} height={BOX_H} rx="4" fill="var(--fig-box)" stroke="var(--line-2)" />
            <text x={BOX_X + BOX_W / 2} y={boxY(src) + 18} textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight={700}>
              {RES_SHORT[src]}
            </text>
          </g>
        ))}

        <rect x={LB_X} y={LB_Y} width={LB_W} height={LB_H} rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x={LB_X + LB_W / 2} y={LB_Y + 18} textAnchor="middle" fill="var(--text-2)" fontSize="11">
          Load Board
        </text>

        {PINS.map((pin) => {
          const res = assign[pin]
          const y = PIN_Y[pin]
          const busX = PIN_BUS[pin]
          if (res === 'off') {
            return (
              <g key={pin}>
                <circle cx={RELAY_L} cy={y} r="2.5" fill="var(--text-2)" />
                <circle cx={RELAY_R} cy={y} r="2.5" fill="var(--text-2)" />
                <line x1={RELAY_L} y1={y} x2={RELAY_R - 8} y2={y - 9} stroke="var(--dim)" strokeWidth="1.5" />
                <text x={DUT_X + 6} y={y + 3} fill="var(--text-2)" fontSize="9" fontFamily="var(--mono)">
                  {PIN_NAME[pin]}
                </text>
              </g>
            )
          }
          return (
            <g key={pin}>
              <polyline
                points={`${BOX_X + BOX_W},${boxMidY(res)} ${busX},${boxMidY(res)} ${busX},${y} ${RELAY_L},${y}`}
                fill="none"
                stroke={PIN_COLOR[pin]}
                strokeWidth="1.8"
              />
              <circle cx={RELAY_L} cy={y} r="2.5" fill="var(--text-2)" />
              <circle cx={RELAY_R} cy={y} r="2.5" fill="var(--text-2)" />
              <line x1={RELAY_L} y1={y} x2={RELAY_R} y2={y} stroke={PIN_COLOR[pin]} strokeWidth="2" />
              <line x1={RELAY_R} y1={y} x2={DUT_X} y2={y} stroke={PIN_COLOR[pin]} strokeWidth="1.8" />
              <text x={DUT_X + 6} y={y + 3} fill="var(--text)" fontSize="9" fontFamily="var(--mono)">
                {PIN_NAME[pin]}
              </text>
            </g>
          )
        })}

        <rect x={DUT_X} y={DUT_Y} width={DUT_W} height={DUT_H} rx="6" fill="var(--fig-box-2)" stroke="var(--text-2)" />
        <text x={DUT_X + DUT_W / 2} y={DUT_Y + 16} textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight={700}>
          DUT
        </text>
        <text x={DUT_X + DUT_W / 2} y={DUT_Y + 30} textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="var(--mono)">
          VDUT-REF2
        </text>

        {shield ? (
          <g>
            <rect x="182" y="26" width="290" height="216" rx="6" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="182" y="252" fill="var(--gold)" fontSize="10">
              {t(FIG.shieldLabel)}
            </text>
          </g>
        ) : null}
      </svg>
      <figcaption>{t(FIG.loadCap)}</figcaption>
    </figure>
  )
}

/* ---------- 建立误差随时间收敛（对数纵轴） ---------- */

const SW = 480
const SH = 200
const SPX0 = 60
const SPX1 = 452
const SPY0 = 28
const SPY1 = 150
/** 对数纵轴范围：10^LOG_BOT 到 10^LOG_TOP mV，即 0.1 mV 到 100 mV */
const LOG_TOP = 2
const LOG_BOT = -1
const TIME_TICKS = [0, 50, 100, 150, 200]
const MV_TICKS = [100, 10, 1, 0.1]

const sx = (us: number) => SPX0 + (us / SETTLE_MAX_US) * (SPX1 - SPX0)
const sy = (mv: number) => {
  const clamped = Math.min(Math.max(mv, 0.1), 100)
  return SPY0 + ((LOG_TOP - Math.log10(clamped)) / (LOG_TOP - LOG_BOT)) * (SPY1 - SPY0)
}

/** 每个已接入引脚画一条收敛曲线；指数曲线在对数轴上是直线 */
export function SettleFig({ results, settleUs }: { results: Record<PinId, PinResult>; settleUs: number }) {
  const { t } = useLocale()
  const lines: Array<{ pin: PinId; src: Source }> = []
  for (const pin of PINS) {
    const res = results[pin].res
    if (res !== 'off') {
      lines.push({ pin, src: res })
    }
  }
  const curveOf = (src: Source) => {
    const points: string[] = []
    for (let us = 0; us <= SETTLE_MAX_US; us += 2) {
      points.push(`${sx(us).toFixed(1)},${sy(settleErrMv(src, us)).toFixed(1)}`)
    }
    return points.join(' ')
  }
  const markX = Math.min(SPX1 - 40, Math.max(SPX0 + 40, sx(settleUs)))
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${SW} ${SH}`} className="term-fig__svg" role="img" aria-label={t(FIG.settleAria)}>
        <rect width={SW} height={SH} rx="10" fill="var(--well)" />
        <text x="8" y="14" fill="var(--muted)" fontSize="10">
          {t(FIG.settleTitle)}
        </text>
        <rect x={SPX0} y={SPY0} width={SPX1 - SPX0} height={SPY1 - SPY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        {MV_TICKS.map((mv) => (
          <g key={mv}>
            <line x1={SPX0} x2={SPX1} y1={sy(mv)} y2={sy(mv)} stroke="var(--line-2)" strokeDasharray="2 3" />
            <text x={SPX0 - 6} y={sy(mv) + 4} textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
              {`${mv} mV`}
            </text>
          </g>
        ))}

        <line x1={SPX0} x2={SPX1} y1={sy(ERR_LIMIT_MV)} y2={sy(ERR_LIMIT_MV)} stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={SPX1} y={sy(ERR_LIMIT_MV) - 4} textAnchor="end" fill="var(--red)" fontSize="9">
          {t(FIG.limitLabel)}
        </text>

        {lines.length === 0 ? (
          <text x={SW / 2} y={SH / 2} textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(FIG.noConnected)}
          </text>
        ) : null}

        {lines.map((line, index) => (
          <g key={line.pin}>
            <polyline points={curveOf(line.src)} fill="none" stroke={PIN_COLOR[line.pin]} strokeWidth="2" />
            <text x={300} y={40 + index * 14} fill={PIN_COLOR[line.pin]} fontSize="10" fontFamily="var(--mono)">
              {`${PIN_NAME[line.pin]} · ${RES_SHORT[line.src]}`}
            </text>
          </g>
        ))}

        <line x1={sx(settleUs)} x2={sx(settleUs)} y1={SPY0} y2={SPY1} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={markX} y="186" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.now)} ${settleUs} µs`}
        </text>

        {TIME_TICKS.map((us) => (
          <text key={us} x={sx(us)} y="168" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
            {`${us}`}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.settleCap)}</figcaption>
    </figure>
  )
}

/* ---------- VREF 读数分布：每个点是一次读数相对目标值的偏差 ---------- */

const GW = 480
const GH = 170
const GX0 = 40
const GX1 = 440
const GY0 = 34
const GY1 = 136

/** 读数散点：横向是偏差（建立误差 + 噪声），纵向只是为了把点分开（随机抖动，与种子有关） */
export function GroundFig({
  res,
  shield,
  seed,
  settleUs,
}: {
  res: ResId
  shield: boolean
  seed: number
  settleUs: number
}) {
  const { t } = useLocale()
  if (res === 'off' || !compatible('vref', res)) {
    return (
      <figure className="term-fig">
        <svg viewBox={`0 0 ${GW} ${GH}`} className="term-fig__svg" role="img" aria-label={t(FIG.stripAria)}>
          <rect width={GW} height={GH} rx="10" fill="var(--well)" />
          <text x={GW / 2} y={GH / 2} textAnchor="middle" fill="var(--muted)" fontSize="11">
            {t(FIG.noVref)}
          </text>
        </svg>
        <figcaption>{t(FIG.stripCap)}</figcaption>
      </figure>
    )
  }
  const dev = readingDev(res, settleUs, shield, seed)
  const widest = dev.reduce((acc, value) => Math.max(acc, Math.abs(value)), 0)
  const half = Math.max(6, Math.ceil(widest))
  const xOf = (mv: number) => GX0 + ((mv + half) / (2 * half)) * (GX1 - GX0)
  const random = seededRandom(seed + 101)
  const ticks = [-half, -half / 2, 0, half / 2, half]
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${GW} ${GH}`} className="term-fig__svg" role="img" aria-label={t(FIG.stripAria)}>
        <rect width={GW} height={GH} rx="10" fill="var(--well)" />
        <text x={GX0} y="16" fill="var(--muted)" fontSize="10">
          {t(FIG.stripAxis)}
        </text>
        <text x={GX1} y="28" textAnchor="end" fill="var(--red)" fontSize="9">
          {t(FIG.limitStrip)}
        </text>
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        <line x1={xOf(-ERR_LIMIT_MV)} x2={xOf(-ERR_LIMIT_MV)} y1={GY0} y2={GY1} stroke="var(--red)" strokeDasharray="4 3" />
        <line x1={xOf(ERR_LIMIT_MV)} x2={xOf(ERR_LIMIT_MV)} y1={GY0} y2={GY1} stroke="var(--red)" strokeDasharray="4 3" />
        <line x1={xOf(0)} x2={xOf(0)} y1={GY0} y2={GY1} stroke="var(--gold)" strokeWidth="1.2" />

        {dev.map((value, index) => (
          <circle
            key={index}
            cx={xOf(value).toFixed(1)}
            cy={(GY0 + 6 + random() * (GY1 - GY0 - 12)).toFixed(1)}
            r="2.2"
            fill="var(--purple)"
            fillOpacity="0.7"
          />
        ))}

        {ticks.map((mv) => (
          <text key={mv} x={xOf(mv)} y={GY1 + 14} textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
            {`${mv}`}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.stripCap)}</figcaption>
    </figure>
  )
}
