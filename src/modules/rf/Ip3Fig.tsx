import { useLocale } from '../../i18n/LocaleContext'
import { FIG, S } from './rfIp3Data'
import { ampToDbm, N_POINTS, type Ip3Analysis } from './rfIp3Model'

const W = 480
const H = 200
const PX0 = 46
const PX1 = 468
const PY0 = 14
const PY1 = 166
/** 纵轴范围（dBm）：基波约 0 dBm，IM3 在 −40 到 −100 dBm 之间，−120 dBm 以下截到底边 */
const YMAX = 10
const YMIN = -120
const NYQUIST = N_POINTS / 2
const FREQ_TICKS = [0, 128, 256, 384, 512]
const DB_TICKS = [0, -40, -80, -120]

const fx = (mhz: number) => PX0 + (mhz / NYQUIST) * (PX1 - PX0)
const dy = (dbm: number) => {
  const clamped = Math.min(YMAX, Math.max(dbm, YMIN))
  return PY0 + ((YMAX - clamped) / (YMAX - YMIN)) * (PY1 - PY0)
}

/** 双音输出频谱：蓝点为两个基波，红点为两侧 IM3；谱线编号即频率（MHz） */
export function Ip3Fig({ analysis }: { analysis: Ip3Analysis }) {
  const { t } = useLocale()
  const { spectrum, bins } = analysis
  const parts: string[] = []
  for (let k = 0; k < spectrum.length; k += 1) {
    parts.push(`${fx(k).toFixed(1)},${dy(ampToDbm(spectrum[k])).toFixed(1)}`)
  }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />
        {DB_TICKS.map((db) => (
          <g key={db}>
            <line x1={PX0} x2={PX1} y1={dy(db)} y2={dy(db)} stroke="var(--line-2)" strokeDasharray="2 4" opacity="0.6" />
            <text x={PX0 - 6} y={dy(db) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${db}`}
            </text>
          </g>
        ))}
        <line x1={fx(bins.f1)} x2={fx(bins.f1)} y1={PY0} y2={PY1} stroke="var(--blue)" strokeDasharray="3 3" opacity="0.5" />
        <line x1={fx(bins.f2)} x2={fx(bins.f2)} y1={PY0} y2={PY1} stroke="var(--blue)" strokeDasharray="3 3" opacity="0.5" />
        <line x1={fx(bins.imLow)} x2={fx(bins.imLow)} y1={PY0} y2={PY1} stroke="var(--red)" strokeDasharray="3 3" opacity="0.5" />
        <line x1={fx(bins.imHigh)} x2={fx(bins.imHigh)} y1={PY0} y2={PY1} stroke="var(--red)" strokeDasharray="3 3" opacity="0.5" />
        <polyline points={parts.join(' ')} fill="none" stroke="var(--muted)" strokeWidth="1.2" />
        <circle cx={fx(bins.f1)} cy={dy(analysis.pF1)} r="3.5" fill="var(--blue)" />
        <circle cx={fx(bins.f2)} cy={dy(analysis.pF2)} r="3.5" fill="var(--blue)" />
        <circle cx={fx(bins.imLow)} cy={dy(analysis.pImLow)} r="3.5" fill="var(--red)" />
        <circle cx={fx(bins.imHigh)} cy={dy(analysis.pImHigh)} r="3.5" fill="var(--red)" />
        {FREQ_TICKS.map((mhz) => (
          <text key={mhz} x={fx(mhz)} y={PY1 + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${mhz}`}
          </text>
        ))}
        <text x={PX1} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          MHz
        </text>
      </svg>
      <ul className="rfip3-legend">
        <li className="rfip3-key is-tone">{`${t(S.lgF1)} ${bins.f1} MHz`}</li>
        <li className="rfip3-key is-tone">{`${t(S.lgF2)} ${bins.f2} MHz`}</li>
        <li className="rfip3-key is-im">{`${t(S.lgIm)}: ${bins.imLow} MHz, ${bins.imHigh} MHz`}</li>
      </ul>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
