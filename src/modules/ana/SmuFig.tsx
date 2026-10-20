import { useLocale } from '../../i18n/LocaleContext'
import { fmtOhm, fmtV } from '../fund/parts'
import { fmtSI } from './measureModel'
import { DUT_NAMES, FIG, S } from './smuData'
import { CONT_HIGH, CONT_LOW, dutResistance, type SmuResult, type SmuState } from './smuModel'

const HW = 480
const HH = 200

/** 接线示意：左边是 PMU / SMU 通道，右边是 DUT 管脚；管脚对地的元件随 DUT 状态变化，撞限时强制线变红 */
export function HookupSmuFig({ state, result }: { state: SmuState; result: SmuResult }) {
  const { t } = useLocale()
  const fvmi = state.mode === 'fvmi'
  const r = dutResistance(state.dut)
  const hit = result.compliance
  const forceColor = hit ? 'var(--red)' : 'var(--blue)'
  const legColor = 'var(--text-2)'
  const limitText = fvmi ? fmtSI(state.iLimit, 'A') : fmtSI(state.vLimit, 'V')
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${HW} ${HH}`} className="term-fig__svg" role="img" aria-label={t(FIG.hookAria)}>
        <rect width={HW} height={HH} rx="10" fill="var(--well)" />

        <rect x="20" y="56" width="130" height="110" rx="8" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="85" y="76" textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight={700}>
          {t(FIG.instrument)}
        </text>
        <text x="85" y="96" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
          {fvmi ? 'FVMI' : 'FIMV'}
        </text>
        <text x="85" y="116" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.boxLimit)}
        </text>
        <text x="85" y="130" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {limitText}
        </text>
        <text x="85" y="152" textAnchor="middle" fill={hit ? 'var(--red)' : 'var(--green)'} fontSize="10" fontWeight={700}>
          {t(hit ? FIG.hitText : FIG.okText)}
        </text>

        <path d="M150 96 H380" fill="none" stroke={forceColor} strokeWidth="2" />
        <text x="265" y="86" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {fvmi ? 'Force V' : 'Force I'}
        </text>
        <path d="M150 128 H260 V176 H330" fill="none" stroke="var(--line-2)" strokeWidth="2" />
        <path d="M330 176 H430" fill="none" stroke={legColor} strokeWidth="2" />
        <text x="440" y="180" textAnchor="start" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          VSS
        </text>

        <text x="380" y="72" textAnchor="middle" fill="var(--text)" fontSize="10">
          {t(FIG.pinText)}
        </text>

        {r === null ? (
          <g>
            <path d="M372 88 L388 104 M388 88 L372 104" fill="none" stroke="var(--red)" strokeWidth="2" />
            <text x="380" y="132" textAnchor="middle" fill="var(--red)" fontSize="10">
              {t(FIG.noPathText)}
            </text>
          </g>
        ) : (
          <g>
            <path d="M350 96 H410" fill="none" stroke={legColor} strokeWidth="2" />
            <path d="M350 96 V112 M350 140 V176" fill="none" stroke={legColor} strokeWidth="2" />
            <rect x="344" y="112" width="12" height="28" fill="var(--fig-box-2)" stroke={legColor} />
            <text x="338" y="130" textAnchor="end" fill="var(--text)" fontSize="9" fontFamily="var(--mono)">
              {fmtOhm(r)}
            </text>
            <path d="M410 96 V110 M410 122 V176" fill="none" stroke={legColor} strokeWidth="2" />
            <polygon points="402,122 418,122 410,110" fill="var(--fig-box-2)" stroke={legColor} />
            <path d="M402 110 H418" fill="none" stroke={legColor} strokeWidth="2" />
            <text x="426" y="120" textAnchor="start" fill="var(--text-2)" fontSize="9" fontFamily="var(--mono)">
              D
            </text>
          </g>
        )}

        <text x="380" y="194" textAnchor="middle" fill="var(--text)" fontSize="10">
          {t(DUT_NAMES[state.dut])}
        </text>
      </svg>
      <figcaption>{t(FIG.hookCap)}</figcaption>
    </figure>
  )
}

const CW = 480
const CH = 160
const CX0 = 40
const CX1 = 440
const AXIS_Y = 92
/** FVMI 电流刻度：1 µA 到 1 A，对数 */
const LOG_MIN = -6
const LOG_MAX = 0
/** FIMV 电压刻度：−4 V 到 +4 V，线性 */
const V_SPAN = 4

function clampTo(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi)
}

function xOfCurrent(amp: number): number {
  const exponent = clampTo(Math.log10(Math.max(Math.abs(amp), 1e-6)), LOG_MIN, LOG_MAX)
  return CX0 + ((exponent - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (CX1 - CX0)
}

function xOfVoltage(volt: number): number {
  return CX0 + ((clampTo(volt, -V_SPAN, V_SPAN) + V_SPAN) / (2 * V_SPAN)) * (CX1 - CX0)
}

/** 文字对齐：靠左的文字向右展开，靠右的向左展开，避免伸出图外 */
function alignOf(x: number): 'start' | 'middle' | 'end' {
  if (x < 110) {
    return 'start'
  }
  if (x > 370) {
    return 'end'
  }
  return 'middle'
}

/** 限值仪表：理想读数（蓝圈）、限值（金色短线）与仪器读数（实心点）画在同一刻度上 */
export function ComplianceFig({ state, result }: { state: SmuState; result: SmuResult }) {
  const { t } = useLocale()
  const fvmi = state.mode === 'fvmi'
  const hit = result.compliance
  const readingColor = hit ? 'var(--red)' : 'var(--green)'

  const idealValue = result.ideal ?? (fvmi ? 0 : Math.sign(state.iForce) * 1000)
  const idealX = fvmi ? xOfCurrent(idealValue) : xOfVoltage(idealValue)
  const readingX = fvmi ? xOfCurrent(result.reading) : xOfVoltage(result.reading)

  let idealText = ''
  if (result.ideal === null) {
    idealText = t(S.noPath)
  } else if (fvmi) {
    idealText = fmtSI(result.ideal, 'A')
  } else {
    idealText = fmtV(result.ideal)
    if (result.ideal > V_SPAN) {
      idealText = `${idealText} →`
    }
    if (result.ideal < -V_SPAN) {
      idealText = `← ${idealText}`
    }
  }
  const readingText = fvmi ? fmtSI(result.reading, 'A') : fmtV(result.reading)

  const windowX1 = xOfVoltage(CONT_LOW)
  const windowX2 = xOfVoltage(CONT_HIGH)

  let limitText = ''
  let limitX = CX0
  let limitAlign: 'start' | 'middle' | 'end' = 'middle'
  let ticks: number[] = []
  if (fvmi) {
    limitX = xOfCurrent(state.iLimit)
    limitAlign = alignOf(limitX)
    limitText = `${t(FIG.limit)} ${fmtSI(state.iLimit, 'A')}`
    ticks = [limitX]
  } else {
    limitX = (CX0 + CX1) / 2
    limitText = `${t(FIG.limit)} ±${state.vLimit.toFixed(2)} V`
    ticks = [xOfVoltage(-state.vLimit), xOfVoltage(state.vLimit)]
  }

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="term-fig__svg" role="img" aria-label={t(FIG.compAria)}>
        <rect width={CW} height={CH} rx="10" fill="var(--well)" />

        {fvmi ? null : (
          <rect x={windowX1} y={AXIS_Y - 6} width={windowX2 - windowX1} height="12" fill="var(--green)" fillOpacity="0.25" />
        )}
        <line x1={CX0} x2={CX1} y1={AXIS_Y} y2={AXIS_Y} stroke="var(--line-2)" strokeWidth="2" />
        {ticks.map((x, index) => (
          <line key={index} x1={x} x2={x} y1={AXIS_Y - 14} y2={AXIS_Y + 14} stroke="var(--gold)" strokeWidth="2" strokeDasharray="4 3" />
        ))}
        <text x={limitX} y="20" textAnchor={limitAlign} fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {limitText}
        </text>

        <text x={idealX} y="64" textAnchor={alignOf(idealX)} fill="var(--blue)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.ideal)} ${idealText}`}
        </text>
        <circle cx={idealX} cy={AXIS_Y} r="6" fill="none" stroke="var(--blue)" strokeWidth="2" />
        <circle cx={readingX} cy={AXIS_Y} r="4" fill={readingColor} />
        <text x={readingX} y="122" textAnchor={alignOf(readingX)} fill={readingColor} fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.reading)} ${readingText}`}
        </text>

        {fvmi ? (
          <g>
            <text x={CX0} y="148" textAnchor="start" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              1 µA
            </text>
            <text x={CX1} y="148" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              1 A
            </text>
          </g>
        ) : (
          <g>
            <text x={CX0} y="148" textAnchor="start" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              -4 V
            </text>
            <text x={CX1} y="148" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              +4 V
            </text>
            <text x={(windowX1 + windowX2) / 2} y="148" textAnchor="middle" fill="var(--green)" fontSize="10">
              {t(FIG.window)}
            </text>
          </g>
        )}
      </svg>
      <figcaption>{t(FIG.compCap)}</figcaption>
    </figure>
  )
}
