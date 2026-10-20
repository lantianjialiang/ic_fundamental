import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './dynamicData'
import { CYCLES, FLOOR_DB, N_POINTS, type DynamicResult } from './dynamicModel'

const W = 480
const H = 200
const PX0 = 44
const PX1 = 456
const PY_TOP = 20
const PY_BOT = 176
const HALF = N_POINTS / 2
const COLS = PX1 - PX0

/** 频点 → x 坐标；0 … N/2 对应 0 … fs/2（0–5 MHz） */
const bx = (bin: number) => PX0 + (bin / HALF) * (PX1 - PX0)

/** dBFS → y 坐标：0 dBFS 在顶部，FLOOR_DB 在底部，超出范围的截断 */
const dbY = (db: number) => {
  const clamped = Math.min(0, Math.max(FLOOR_DB, db))
  return PY_TOP + (clamped / FLOOR_DB) * (PY_BOT - PY_TOP)
}

/** 幅度（满量程峰值归一）→ dBFS；幅度为 0 时取底线，避免 -Infinity */
const ampDb = (amp: number) => (amp > 0 ? 20 * Math.log10(amp) : FLOOR_DB)

/** 每个像素列取该列内的最大幅度，细小的谐波尖峰不会在降采样时丢掉 */
function tracePoints(amps: Float64Array): string {
  const top = new Float64Array(COLS).fill(FLOOR_DB)
  for (let k = 1; k < HALF; k += 1) {
    const col = Math.min(COLS - 1, Math.floor((k * COLS) / HALF))
    const db = ampDb(amps[k])
    if (db > top[col]) {
      top[col] = db
    }
  }
  const pts: string[] = []
  for (let c = 0; c < COLS; c += 1) {
    pts.push(`${(PX0 + c + 0.5).toFixed(1)},${dbY(top[c]).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** 标注文字的 y 坐标：在峰值上方 6 px，但不超出绘图区顶部 */
const labelY = (peakY: number) => Math.max(14, peakY - 6)

/** 频谱图：0–5 MHz、纵轴 dBFS；标出基波、HD2、HD3、噪底，以及限制 SFDR 的杂散 */
export function SpectrumFig({ result }: { result: DynamicResult }) {
  const { t } = useLocale()
  const hd2 = result.harmonics.find((h) => h.order === 2)
  const hd3 = result.harmonics.find((h) => h.order === 3)
  const fundX = bx(CYCLES)
  const fundY = dbY(ampDb(result.fundAmp))
  const noiseY = dbY(result.noiseFloorDb)
  const spurY = dbY(ampDb(result.amps[result.spurBin]))
  const freqTicks = [0, 1, 2, 3, 4, 5]
  const dbTicks = [0, -40, -80, -120]

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.specAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY_TOP} width={PX1 - PX0} height={PY_BOT - PY_TOP} fill="var(--fig-box)" stroke="var(--line-2)" />

        {dbTicks.map((db) => (
          <g key={db}>
            <line x1={PX0} x2={PX1} y1={dbY(db)} y2={dbY(db)} stroke="var(--line-2)" strokeOpacity="0.4" strokeDasharray="2 3" />
            <text x={PX0 - 4} y={dbY(db) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${db}`}
            </text>
          </g>
        ))}

        <polyline points={tracePoints(result.amps)} fill="none" stroke="var(--blue)" strokeWidth="1.2" />
        <line x1={PX0} x2={PX1} y1={noiseY} y2={noiseY} stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={PX1 - 4} y={Math.min(PY_BOT - 4, noiseY + 12)} textAnchor="end" fill="var(--muted)" fontSize="10">
          {t(FIG.noise)}
        </text>

        <text x={fundX} y={labelY(fundY)} textAnchor="middle" fill="var(--blue)" fontSize="10" fontFamily="var(--mono)">
          {t(FIG.fund)}
        </text>
        {hd2 ? (
          <text x={bx(hd2.bin)} y={labelY(dbY(ampDb(hd2.amp)))} textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
            HD2
          </text>
        ) : null}
        {hd3 ? (
          <text x={bx(hd3.bin)} y={labelY(dbY(ampDb(hd3.amp)))} textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
            HD3
          </text>
        ) : null}
        <circle cx={bx(result.spurBin)} cy={spurY} r="3.5" fill="var(--red)" />

        {freqTicks.map((mhz) => (
          <text
            key={mhz}
            x={bx((mhz * HALF) / 5)}
            y={190}
            textAnchor={mhz === 0 ? 'start' : mhz === 5 ? 'end' : 'middle'}
            fill="var(--muted)"
            fontSize="10"
            fontFamily="var(--mono)"
          >
            {`${mhz}`}
          </text>
        ))}
      </svg>
      <figcaption>{t(FIG.specCap)}</figcaption>
    </figure>
  )
}
