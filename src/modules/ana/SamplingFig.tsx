import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './samplingData'
import { WINDOW_MS, sampleCurves, sampleResult, type Point, type SampleState } from './samplingModel'

const W = 480
const H = 200
const PX0 = 44
const PX1 = 456
const PY_TOP = 18
const PY_BOT = 168
const PY_MID = (PY_TOP + PY_BOT) / 2
const AMP = 60
const TIME_TICKS = [0, 1, 2, 3, 4]

const tx = (ms: number) => PX0 + (ms / WINDOW_MS) * (PX1 - PX0)
const ty = (v: number) => PY_MID - v * AMP

function toPolyline(points: Point[]): string {
  return points.map((p) => `${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ')
}

/** 时域图：输入正弦（开 AAF 时还有原始信号对比）、采样点，预测正确后再画折叠后的表观波形 */
export function WaveFig({ state, showAlias }: { state: SampleState; showAlias: boolean }) {
  const { t } = useLocale()
  const curves = sampleCurves(state)
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.waveAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY_TOP} width={PX1 - PX0} height={PY_BOT - PY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />
        <line x1={PX0} x2={PX1} y1={PY_MID} y2={PY_MID} stroke="var(--line-2)" strokeDasharray="3 3" />

        {state.aaf ? <polyline points={toPolyline(curves.raw)} fill="none" stroke="var(--muted)" strokeWidth="1.2" opacity="0.7" /> : null}
        <polyline points={toPolyline(curves.input)} fill="none" stroke="var(--blue)" strokeWidth="2" />
        {showAlias ? (
          <polyline points={toPolyline(curves.alias)} fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 3" />
        ) : null}

        {curves.samples.map((p, index) => (
          <circle key={index} cx={tx(p.x)} cy={ty(p.y)} r="3" fill="var(--purple)" />
        ))}

        {TIME_TICKS.map((ms) => (
          <text key={ms} x={tx(ms)} y={186} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${ms} ms`}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.waveCap)}</figcaption>
    </figure>
  )
}

const FW = 480
const FH = 150
const FX0 = 40
const FX1 = 440
const FMAX = 20
const FAX_Y = 76
const FREQ_TICKS = [0, 5, 10, 15, 20]

const fx = (khz: number) => FX0 + (khz / FMAX) * (FX1 - FX0)
const f1 = (value: number) => value.toFixed(1)

/** 频谱图：0–20 kHz；奈奎斯特频率以上的区域标红（会折叠），标出 f_in，预测正确后再标出表观频率 */
export function FreqFig({ state, showAlias }: { state: SampleState; showAlias: boolean }) {
  const { t } = useLocale()
  const result = sampleResult(state)
  const nyqX = fx(result.nyquist)
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${FW} ${FH}`} className="term-fig__svg" role="img" aria-label={t(FIG.freqAria)}>
        <rect width={FW} height={FH} rx="10" fill="var(--well)" />
        <rect x={nyqX} y="20" width={FX1 - nyqX} height={FAX_Y - 20} fill="var(--red)" fillOpacity="0.1" />
        <line x1={FX0} x2={FX1} y1={FAX_Y} y2={FAX_Y} stroke="var(--line-2)" />

        <line x1={fx(state.fin)} x2={fx(state.fin)} y1="26" y2={FAX_Y} stroke="var(--blue)" strokeWidth="2" />
        <line x1={nyqX} x2={nyqX} y1="26" y2={FAX_Y} stroke="var(--red)" strokeWidth="1.5" strokeDasharray="4 3" />
        {showAlias ? (
          <line
            x1={fx(result.alias)}
            x2={fx(result.alias)}
            y1="26"
            y2={FAX_Y}
            stroke="var(--gold)"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
        ) : null}

        {FREQ_TICKS.map((khz) => (
          <text key={khz} x={fx(khz)} y={92} textAnchor={khz === FMAX ? 'end' : 'middle'} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {khz === FMAX ? `${khz} kHz` : `${khz}`}
          </text>
        ))}

        <text x={FX0} y="110" fill="var(--blue)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.fin)} = ${f1(state.fin)} kHz`}
        </text>
        <text x={FX0} y="124" fill="var(--red)" fontSize="10" fontFamily="var(--mono)">
          {`${t(FIG.nyq)} = ${f1(result.nyquist)} kHz`}
        </text>
        {showAlias ? (
          <text x={FX0} y="138" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
            {`${t(FIG.apparent)} = ${f1(result.alias)} kHz`}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(FIG.freqCap)}</figcaption>
    </figure>
  )
}
