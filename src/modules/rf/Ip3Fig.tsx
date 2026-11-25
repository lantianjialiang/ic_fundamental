import { useLocale } from '../../i18n/LocaleContext'
import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { FIG, S } from './rfIp3Data'
import { ampToDbm, N_POINTS, PIN_MIN, type Ip3Analysis } from './rfIp3Model'

const TRACES = [
  { id: 'fund', label: loc('追踪基波 f₁', 'Trace fundamental f₁') },
  { id: 'im', label: loc('追踪较强的 IM3', 'Trace the stronger IM3') },
] as const

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
export function Ip3Fig({ analysis, pin }: { analysis: Ip3Analysis; pin: number }) {
  const { t } = useLocale()
  const [trace, setTrace] = useState<(typeof TRACES)[number]['id']>('fund')
  const { spectrum, bins } = analysis
  const selectedIm = analysis.pImLow >= analysis.pImHigh ? bins.imLow : bins.imHigh
  const selectedBin = trace === 'fund' ? bins.f1 : selectedIm
  const im = Math.max(analysis.pImLow, analysis.pImHigh)
  const px = (value: number) => 47 + 395 * (value - PIN_MIN) / (analysis.iip3Read - PIN_MIN + 3)
  const low = im + 3 * (PIN_MIN - pin) - 5
  const high = analysis.oip3Read + 10
  const py = (value: number) => 174 - 146 * (value - low) / Math.max(1, high - low)
  const tracePath = (anchor: number, slope: number) =>
    `M${px(PIN_MIN)} ${py(anchor + slope * (PIN_MIN - pin))} L${px(analysis.iip3Read)} ${py(analysis.oip3Read)}`
  const parts: string[] = []
  for (let k = 0; k < spectrum.length; k += 1) {
    parts.push(`${fx(k).toFixed(1)},${dy(ampToDbm(spectrum[k])).toFixed(1)}`)
  }
  return (
    <figure className="term-fig">
      <Seg options={TRACES} value={trace} onChange={setTrace} />
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
        {!analysis.clash && <circle data-frequency-marker={selectedBin} cx={fx(selectedBin)} cy={dy(trace === 'fund' ? analysis.pF1 : im)}
          r="7" fill="none" stroke="var(--gold)" strokeWidth="2" />}
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
      {!analysis.clash && <svg viewBox="0 0 480 217" className="term-fig__svg" role="img"
        aria-label={t(loc('从同一对实测点外推 IP3', 'Extrapolate IP3 from the same measured points'))} data-ip3-input={pin} data-ip3-trace={trace}>
        <rect width="480" height="217" fill="var(--well)" />
        <path d="M47 24 V174 H451" stroke="var(--muted)" strokeWidth="2" fill="none" />
        <path d={tracePath(analysis.pF1, 1)} stroke="var(--blue)" strokeWidth={trace === 'fund' ? 3 : 1.5} strokeDasharray="6 4" />
        <path d={tracePath(im, 3)} stroke="var(--red)" strokeWidth={trace === 'im' ? 3 : 1.5} strokeDasharray="6 4" />
        <path d={`M${px(pin)} ${py(analysis.pF1)} V${py(im)}`} stroke="var(--gold)" strokeWidth="2" />
        <circle cx={px(pin)} cy={py(analysis.pF1)} r={trace === 'fund' ? 5 : 3} fill="var(--blue)" />
        <circle cx={px(pin)} cy={py(im)} r={trace === 'im' ? 5 : 3} fill="var(--red)" />
        <circle cx={px(analysis.iip3Read)} cy={py(analysis.oip3Read)} r="4.5" fill="var(--gold)" />
        <text x="41" y="19" fill="var(--text)" fontSize="14">Pout (dBm)</text>
        <text x="451" y="202" fill="var(--text)" textAnchor="end" fontSize="14">Pin (dBm)</text>
        <text x={px(pin)} y="190" fill="var(--text)" textAnchor="middle" fontSize="14">{pin}</text>
        <text x={px(analysis.iip3Read) - 7} y={py(analysis.oip3Read) - 9} fill="var(--gold)"
          textAnchor="end" fontSize="14">{`IIP3 ≈ ${analysis.iip3Read.toFixed(2)}`}</text>
      </svg>}
      <figcaption aria-live="polite">{t(FIG.cap)}{' '}
        {!analysis.clash && t(loc(`光标读到 ${selectedBin} MHz，${(trace === 'fund' ? analysis.pF1 : im).toFixed(2)} dBm。功率图用实测点外推 1:1 和 3:1 斜率，交点是 IIP3 ≈ ${pin} + ${analysis.dIm3.toFixed(2)} / 2 = ${analysis.iip3Read.toFixed(2)} dBm。`,
          `The marked bin is ${selectedBin} MHz at ${(trace === 'fund' ? analysis.pF1 : im).toFixed(2)} dBm. The sweep diagram extrapolates 1:1 and 3:1 slopes from the measured points. IIP3 ≈ ${pin} + ${analysis.dIm3.toFixed(2)} / 2 = ${analysis.iip3Read.toFixed(2)} dBm.`))}
      </figcaption>
    </figure>
  )
}
