import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './signalData'
import {
  BODE_F_MAX,
  BODE_F_MIN,
  bodeCurve,
  gainDb,
  lowpassGain,
  lowpassPhaseDeg,
  signalCurves,
  WINDOW_MS,
  type Point,
  type SignalResult,
  type SignalState,
} from './signalModel'

/* ---------- 时域波形图 ---------- */

const WW = 520
const WH = 240
const WX0 = 44
const WX1 = 500
const WY0 = 100
/** 每伏幅度对应的像素，最大 2 V 时波形顶端在 y = 34 附近 */
const WSCALE = 33

export function WaveFig({ state, result }: { state: SignalState; result: SignalResult }) {
  const { t } = useLocale()
  const curves = signalCurves(state)
  const xOf = (time: number) => WX0 + (time / WINDOW_MS) * (WX1 - WX0)
  const yOf = (volt: number) => WY0 - volt * WSCALE
  const pathOf = (points: Point[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.x).toFixed(1)} ${yOf(p.y).toFixed(1)}`).join(' ')

  const periodEnd = WX0 + (result.period / WINDOW_MS) * (WX1 - WX0)
  const periodMid = (WX0 + periodEnd) / 2
  const legendY = 230

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${WW} ${WH}`} className="term-fig__svg" role="img" aria-label={t(FIG.waveAria)}>
        <line x1={WX0} y1={WY0} x2={WX1} y2={WY0} stroke="#cbd5e1" strokeWidth={1} />
        <path d={pathOf(curves.a)} fill="none" stroke="#2563eb" strokeWidth={2} />
        <path d={pathOf(curves.bIn)} fill="none" stroke="#d97706" strokeWidth={2} />
        {state.filter ? <path d={pathOf(curves.bOut)} fill="none" stroke="#7c3aed" strokeWidth={2} /> : null}

        <line x1={WX0} y1={186} x2={WX0} y2={192} stroke="#64748b" strokeWidth={1} />
        <line x1={periodEnd} y1={186} x2={periodEnd} y2={192} stroke="#64748b" strokeWidth={1} />
        <line x1={WX0} y1={189} x2={periodEnd} y2={189} stroke="#64748b" strokeWidth={1} />
        <text x={periodMid} y={206} textAnchor="middle" fontSize={11} fill="#334155">
          {`T = ${result.period.toFixed(2)} ms`}
        </text>

        <text x={WX1} y={16} textAnchor="end" fontSize={12} fill="#0f172a">
          {`Δφ = ${result.phaseDiff.toFixed(1)}°`}
        </text>

        <line x1={WX0} y1={legendY - 4} x2={WX0 + 16} y2={legendY - 4} stroke="#2563eb" strokeWidth={2} />
        <text x={WX0 + 22} y={legendY} fontSize={11} fill="#334155">{t(FIG.legA)}</text>
        <line x1={180} y1={legendY - 4} x2={196} y2={legendY - 4} stroke="#d97706" strokeWidth={2} />
        <text x={202} y={legendY} fontSize={11} fill="#334155">{t(FIG.legB)}</text>
        {state.filter ? (
          <>
            <line x1={290} y1={legendY - 4} x2={306} y2={legendY - 4} stroke="#7c3aed" strokeWidth={2} />
            <text x={312} y={legendY} fontSize={11} fill="#334155">{t(FIG.legBout)}</text>
          </>
        ) : null}
      </svg>
      <figcaption>{t(FIG.waveCap)}</figcaption>
    </figure>
  )
}

/* ---------- 伯德图：一阶 RC 低通的幅度与相位 ---------- */

const BW = 520
const BH = 296
const BX0 = 84
const BX1 = 440
const DB_TOP = 30
const DB_BOTTOM = 130
const DB_MIN = -60
const DEG_TOP = 170
const DEG_BOTTOM = 270
const DEG_MIN = -90
const DB_REF = -3

function xOfFreq(f: number): number {
  const span = Math.log10(BODE_F_MAX) - Math.log10(BODE_F_MIN)
  return BX0 + ((Math.log10(f) - Math.log10(BODE_F_MIN)) / span) * (BX1 - BX0)
}

/* 0 dB 在上沿，DB_MIN 在下沿；DB_MIN 与 DEG_MIN 都是负数，比值为正 */
function yOfDb(db: number): number {
  const clamped = Math.max(db, DB_MIN)
  return DB_TOP + (clamped / DB_MIN) * (DB_BOTTOM - DB_TOP)
}

function yOfDeg(deg: number): number {
  const clamped = Math.max(deg, DEG_MIN)
  return DEG_TOP + (clamped / DEG_MIN) * (DEG_BOTTOM - DEG_TOP)
}

export function BodeFig({ state }: { state: SignalState }) {
  const { t } = useLocale()
  const curve = bodeCurve(state.fc)
  const dbPath = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOfFreq(p.f).toFixed(1)} ${yOfDb(p.db).toFixed(1)}`)
    .join(' ')
  const degPath = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOfFreq(p.f).toFixed(1)} ${yOfDeg(p.deg).toFixed(1)}`)
    .join(' ')

  const xf = xOfFreq(state.f)
  const xc = xOfFreq(state.fc)
  const gainAtF = lowpassGain(state.f, state.fc)
  const phaseAtF = lowpassPhaseDeg(state.f, state.fc)
  /* f 与 fc 的标注：谁在右边谁往右写，避免两个字挤在一起 */
  const fAtRight = state.f >= state.fc
  const fLabelX = fAtRight ? xf + 4 : xf - 4
  const fLabelAnchor = fAtRight ? 'start' : 'end'
  const fcLabelX = fAtRight ? xc - 4 : xc + 4
  const fcLabelAnchor = fAtRight ? 'end' : 'start'

  const dbTicks = [0, -20, -40, -60]
  const degTicks = [0, -45, -90]
  const freqTicks = [0.1, 1, 10]

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${BW} ${BH}`} className="term-fig__svg" role="img" aria-label={t(FIG.bodeAria)}>
        {dbTicks.map((db) => (
          <g key={`db${db}`}>
            <line x1={BX0} y1={yOfDb(db)} x2={BX1} y2={yOfDb(db)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={BX0 - 6} y={yOfDb(db) + 4} textAnchor="end" fontSize={10} fill="#64748b">{db}</text>
          </g>
        ))}
        {degTicks.map((deg) => (
          <g key={`deg${deg}`}>
            <line x1={BX0} y1={yOfDeg(deg)} x2={BX1} y2={yOfDeg(deg)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={BX0 - 6} y={yOfDeg(deg) + 4} textAnchor="end" fontSize={10} fill="#64748b">
              {`${deg}°`}
            </text>
          </g>
        ))}
        {freqTicks.map((f) => (
          <g key={`fg${f}`}>
            <line x1={xOfFreq(f)} y1={DB_TOP} x2={xOfFreq(f)} y2={DEG_BOTTOM} stroke="#f1f5f9" strokeWidth={1} />
            <text x={xOfFreq(f)} y={288} textAnchor="middle" fontSize={10} fill="#64748b">{f}</text>
          </g>
        ))}
        <text x={BX1} y={288} textAnchor="end" fontSize={10} fill="#64748b">kHz</text>

        <line x1={BX0} y1={yOfDb(DB_REF)} x2={BX1} y2={yOfDb(DB_REF)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" />
        <text x={BX1 + 6} y={yOfDb(DB_REF) + 4} textAnchor="start" fontSize={10} fill="#475569">−3 dB</text>

        <path d={dbPath} fill="none" stroke="#7c3aed" strokeWidth={2} />
        <path d={degPath} fill="none" stroke="#7c3aed" strokeWidth={2} />

        <line x1={xf} y1={DB_TOP} x2={xf} y2={DEG_BOTTOM} stroke="#2563eb" strokeWidth={1} />
        <line x1={xc} y1={DB_TOP} x2={xc} y2={DEG_BOTTOM} stroke="#d97706" strokeWidth={1} strokeDasharray="4 3" />
        <text x={fLabelX} y={20} textAnchor={fLabelAnchor} fontSize={11} fill="#2563eb">f</text>
        <text x={fcLabelX} y={20} textAnchor={fcLabelAnchor} fontSize={11} fill="#b45309">fc</text>

        <circle cx={xf} cy={yOfDb(gainDb(gainAtF))} r={3.5} fill="#2563eb" />
        <circle cx={xf} cy={yOfDeg(phaseAtF)} r={3.5} fill="#2563eb" />

        <text x={4} y={22} fontSize={10} fill="#334155">|H| (dB)</text>
        <text x={4} y={162} fontSize={10} fill="#334155">∠H (°)</text>
      </svg>
      <figcaption>{t(FIG.bodeCap)}</figcaption>
    </figure>
  )
}
