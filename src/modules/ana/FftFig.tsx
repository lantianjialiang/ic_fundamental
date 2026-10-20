import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './fftData'
import { BIN_KHZ, FS_KHZ, N_POINTS, RECORD_MS, spectrumDb, type FftResult, type FftState } from './fftModel'

/* ---------- 时域图 ---------- */

const W = 480
const H = 196
const PX0 = 44
const PX1 = 456
const PY_TOP = 14
const PY_BOT = 150
const PY_MID = (PY_TOP + PY_BOT) / 2
/** 纵轴范围 ±1.2 V，基波峰值 1 V 留出余量 */
const VMAX = 1.2
const TIME_TICKS = [0, 2, 4, 6, 8, 10]

const tx = (ms: number) => PX0 + (ms / RECORD_MS) * (PX1 - PX0)
const ty = (v: number) => PY_MID - (v / VMAX) * ((PY_BOT - PY_TOP) / 2)

/** 把 N 点序列画成折线：第 n 点的时刻为 n / fs（ms），scale 为 ±1 时可画正负包络 */
function recordPoints(values: ArrayLike<number>, scale: number): string {
  const parts: string[] = []
  for (let n = 0; n < values.length; n += 1) {
    parts.push(`${tx(n / FS_KHZ).toFixed(1)},${ty(values[n] * scale).toFixed(1)}`)
  }
  return parts.join(' ')
}

/** 时域图：N 点记录；非矩形窗时额外画出窗的正负包络（虚线） */
export function WaveFig({ state, result }: { state: FftState; result: FftResult }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.timeAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY_TOP} width={PX1 - PX0} height={PY_BOT - PY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />
        <line x1={PX0} x2={PX1} y1={PY_MID} y2={PY_MID} stroke="var(--line-2)" strokeDasharray="3 3" />

        {state.win !== 'rect' ? (
          <>
            <polyline points={recordPoints(result.win, 1)} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 3" />
            <polyline points={recordPoints(result.win, -1)} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 3" />
          </>
        ) : null}
        <polyline points={recordPoints(result.wave, 1)} fill="none" stroke="var(--blue)" strokeWidth="1.6" />

        {TIME_TICKS.map((ms) => (
          <text key={ms} x={tx(ms)} y={PY_BOT + 16} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${ms} ms`}
          </text>
        ))}
        <text x={PX0} y={H - 8} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`N = ${N_POINTS}    N / fs = ${RECORD_MS.toFixed(2)} ms`}
        </text>
      </svg>
      <figcaption>{t(FIG.timeCap)}</figcaption>
    </figure>
  )
}

/* ---------- 频域图 ---------- */

const FW = 480
const FH = 196
const FX0 = 44
const FX1 = 456
const FY_TOP = 14
const FY_BOT = 148
const FMAX = 50
const DB_FLOOR = -120
const FREQ_TICKS = [0, 10, 20, 30, 40, 50]
const DB_TICKS = [0, -40, -80, -120]

const fx = (khz: number) => FX0 + (khz / FMAX) * (FX1 - FX0)
/** dB 映射到纵坐标：0 dBV 在顶部，−120 dBV（噪声底）在底部，超出范围的截到边界 */
const dy = (db: number) => {
  const clamped = Math.min(0, Math.max(db, DB_FLOOR))
  return FY_TOP + (clamped / DB_FLOOR) * (FY_BOT - FY_TOP)
}

/** 单边幅度谱：第 k 根谱线位于 k·Δf */
function spectrumPoints(amp: Float64Array): string {
  const parts: string[] = []
  for (let k = 0; k < amp.length; k += 1) {
    parts.push(`${fx(k * BIN_KHZ).toFixed(1)},${dy(spectrumDb(amp[k])).toFixed(1)}`)
  }
  return parts.join(' ')
}

/** 读数谱线的颜色：基波、HD2、HD3 */
const READ_COLORS = ['var(--blue)', 'var(--gold)', 'var(--purple)']

/** 频谱图：0 到 50 kHz，标出基波与 2、3 次谐波的位置和读数谱线 */
export function FreqFig({ result }: { result: FftResult }) {
  const { t } = useLocale()
  const readAmp = [result.fund, result.hd2, result.hd3]
  const harmonics = [1, 2, 3]
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${FW} ${FH}`} className="term-fig__svg" role="img" aria-label={t(FIG.freqAria)}>
        <rect width={FW} height={FH} rx="10" fill="var(--well)" />
        <rect x={FX0} y={FY_TOP} width={FX1 - FX0} height={FY_BOT - FY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />

        {DB_TICKS.map((db) => (
          <g key={db}>
            <line x1={FX0} x2={FX1} y1={dy(db)} y2={dy(db)} stroke="var(--line-2)" strokeDasharray="2 4" opacity="0.6" />
            <text x={FX0 - 6} y={dy(db) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${db}`}
            </text>
          </g>
        ))}

        {harmonics.map((h) => (
          <line
            key={h}
            x1={fx(h * result.f0)}
            x2={fx(h * result.f0)}
            y1={FY_TOP}
            y2={FY_BOT}
            stroke={READ_COLORS[h - 1]}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        ))}

        <polyline points={spectrumPoints(result.amp)} fill="none" stroke="var(--blue)" strokeWidth="1.3" />

        {harmonics.map((h) => (
          <circle
            key={h}
            cx={fx(result.readBins[h - 1] * BIN_KHZ)}
            cy={dy(spectrumDb(readAmp[h - 1]))}
            r="3.5"
            fill={READ_COLORS[h - 1]}
          />
        ))}

        {FREQ_TICKS.map((khz) => (
          <text key={khz} x={fx(khz)} y={FY_BOT + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${khz}`}
          </text>
        ))}

        <text x={FX0} y={FH - 10} fill="var(--blue)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.fund)} ${result.fund.toFixed(3)} V`}
        </text>
        <text x={FX0 + 160} y={FH - 10} fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.hd2)} ${result.hd2Pct.toFixed(2)}%`}
        </text>
        <text x={FX0 + 320} y={FH - 10} fill="var(--purple)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.hd3)} ${result.hd3Pct.toFixed(2)}%`}
        </text>
      </svg>
      <figcaption>{t(FIG.freqCap)}</figcaption>
    </figure>
  )
}
