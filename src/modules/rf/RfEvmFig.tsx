import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { CHANNEL_BW, rappAm } from './evmModel'

const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const IDEAL = '#8b949e'
const DIST = '#f0883e'
const MAIN = '#e8c45a'
const ADJ = '#5b6575'
const FONT = 'Consolas, ui-monospace, monospace'

/** 频谱图：横轴 ±3 个符号率，纵轴 0 到 −90 dB（相对线性输出的峰值） */
const SW = 640
const SH = 230
const SPAD_L = 44
const SPAD_R = 14
const SPAD_T = 14
const SPAD_B = 34
const SPW = SW - SPAD_L - SPAD_R
const SPH = SH - SPAD_T - SPAD_B
const FMAX = 3
const DB_MIN = -90

const fx = (f: number) => SPAD_L + ((f + FMAX) / (2 * FMAX)) * SPW
const dy = (db: number) => SPAD_T + (-db / -DB_MIN) * SPH

function tracePath(freq: Float64Array, db: Float64Array): string {
  let d = ''
  for (let j = 0; j < freq.length; j += 1) {
    const f = freq[j]
    if (f >= -FMAX && f <= FMAX) {
      const cmd = d === '' ? 'M' : 'L'
      d += `${cmd}${fx(f).toFixed(1)} ${dy(Math.max(db[j], DB_MIN)).toFixed(1)}`
    }
  }
  return d
}

/** 频谱：线性输出（灰色虚线）与失真输出（橙色实线），主信道与两侧相邻信道用色块标出 */
export function SpectrumFig({
  freq,
  ideal,
  dist,
  aria,
  caption,
}: {
  freq: Float64Array
  ideal: Float64Array
  dist: Float64Array
  aria: LText
  caption: LText
}) {
  const { t } = useLocale()
  const half = CHANNEL_BW / 2
  const outer = (3 * CHANNEL_BW) / 2
  const top = SPAD_T
  const bottom = SPAD_T + SPH
  const idealPath = tracePath(freq, ideal)
  const distPath = tracePath(freq, dist)

  return (
    <figure className="term-fig rf-spec">
      <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label={t(aria)} className="rf-spec__svg">
        <rect x={0} y={0} width={SW} height={SH} rx={10} fill={BG} />
        <rect x={fx(-half)} y={top} width={fx(half) - fx(-half)} height={SPH} fill={MAIN} fillOpacity={0.12} />
        <rect x={fx(-outer)} y={top} width={fx(-half) - fx(-outer)} height={SPH} fill={ADJ} fillOpacity={0.28} />
        <rect x={fx(half)} y={top} width={fx(outer) - fx(half)} height={SPH} fill={ADJ} fillOpacity={0.28} />
        {[0, -30, -60, -90].map((db) => (
          <g key={`y${db}`}>
            <line x1={SPAD_L} y1={dy(db)} x2={SPAD_L + SPW} y2={dy(db)} stroke={GRID} strokeWidth={1} />
            <text x={SPAD_L - 6} y={dy(db)} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="end" dominantBaseline="middle">
              {db === 0 ? '0' : `${db}`}
            </text>
          </g>
        ))}
        <line x1={SPAD_L} y1={bottom} x2={SPAD_L + SPW} y2={bottom} stroke={GRID} strokeWidth={1} />
        {[-3, 0, 3].map((f) => (
          <text key={`x${f}`} x={fx(f)} y={bottom + 14} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="middle">
            {f > 0 ? `+${f}` : `${f}`}
          </text>
        ))}
        <text x={fx(0)} y={top + 12} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="middle">
          {t(loc('主信道', 'Main'))}
        </text>
        <text x={fx(-1.5)} y={top + 12} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="middle">
          {t(loc('相邻信道', 'Adjacent'))}
        </text>
        <text x={fx(1.5)} y={top + 12} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="middle">
          {t(loc('相邻信道', 'Adjacent'))}
        </text>
        <path d={idealPath} fill="none" stroke={IDEAL} strokeWidth={1.2} strokeDasharray="4 3" />
        <path d={distPath} fill="none" stroke={DIST} strokeWidth={1.6} />
        <text x={SPAD_L + SPW - 6} y={top + 30} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="end">
          {t(loc('虚线：线性', 'Dashed: linear'))}
        </text>
        <text x={SPAD_L + SPW - 6} y={top + 44} fill={DIST} fontSize={11} fontFamily={FONT} textAnchor="end">
          {t(loc('实线：失真', 'Solid: distorted'))}
        </text>
      </svg>
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}

/** Rapp AM/AM 曲线：输入幅度（饱和 = 1）→ 输出幅度，标出平均与峰值的工作点 */
const RW = 320
const RH = 230
const RPAD_L = 40
const RPAD_R = 12
const RPAD_T = 14
const RPAD_B = 34
const RPW = RW - RPAD_L - RPAD_R
const RPH = RH - RPAD_T - RPAD_B
const XMAX = 2.2
const YMAX = 1.4

const rx = (a: number) => RPAD_L + (a / XMAX) * RPW
const ry = (b: number) => RPAD_T + (1 - b / YMAX) * RPH

export function RappFig({
  rmsIn,
  peakIn,
  aria,
  caption,
}: {
  rmsIn: number
  peakIn: number
  aria: LText
  caption: LText
}) {
  const { t } = useLocale()
  let curve = ''
  for (let a = 0; a <= XMAX + 1e-9; a += 0.02) {
    const cmd = curve === '' ? 'M' : 'L'
    curve += `${cmd}${rx(a).toFixed(1)} ${ry(rappAm(a)).toFixed(1)}`
  }
  const baseY = ry(0)
  const opX = rx(rmsIn)
  const opY = ry(rappAm(rmsIn))
  const peakX = rx(peakIn)
  const peakY = ry(rappAm(peakIn))

  return (
    <figure className="term-fig rf-rapp">
      <svg viewBox={`0 0 ${RW} ${RH}`} role="img" aria-label={t(aria)} className="rf-rapp__svg">
        <rect x={0} y={0} width={RW} height={RH} rx={10} fill={BG} />
        <line x1={RPAD_L} y1={baseY} x2={RPAD_L + RPW} y2={baseY} stroke={GRID} strokeWidth={1} />
        <line x1={RPAD_L} y1={RPAD_T} x2={RPAD_L} y2={baseY} stroke={GRID} strokeWidth={1} />
        <line x1={rx(0)} y1={ry(0)} x2={rx(YMAX)} y2={ry(YMAX)} stroke={LABEL} strokeWidth={1} strokeDasharray="4 3" />
        {[0, 1, 2].map((a) => (
          <text key={`ax${a}`} x={rx(a)} y={baseY + 14} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="middle">
            {`${a}`}
          </text>
        ))}
        {[0, 1].map((b) => (
          <text key={`ay${b}`} x={RPAD_L - 6} y={ry(b)} fill={LABEL} fontSize={11} fontFamily={FONT} textAnchor="end" dominantBaseline="middle">
            {`${b}`}
          </text>
        ))}
        <line x1={opX} y1={opY} x2={opX} y2={baseY} stroke={MAIN} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={peakX} y1={peakY} x2={peakX} y2={baseY} stroke={DIST} strokeWidth={1} strokeDasharray="3 3" />
        <path d={curve} fill="none" stroke={DIST} strokeWidth={1.8} />
        <circle cx={opX} cy={opY} r={4} fill={MAIN} />
        <text x={opX - 5} y={baseY - 6} fill={MAIN} fontSize={11} fontFamily={FONT} textAnchor="end">
          {t(loc('平均', 'Avg'))}
        </text>
        <text x={peakX + 5} y={baseY - 6} fill={DIST} fontSize={11} fontFamily={FONT} textAnchor="start">
          {t(loc('峰值', 'Peak'))}
        </text>
      </svg>
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}
