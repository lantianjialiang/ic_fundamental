import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './serdesData'
import {
  BER_LIMIT,
  SAMPLES,
  SPEC_EH_MV,
  SPEC_EW_UI,
  UI_PS,
  eyeHeightMv,
  eyeWidthUi,
  type SampleId,
  type SweepPoint,
} from './serdesModel'

const BW = 480
const BH = 240
const BPL = 50
const BPR = 14
const BPT = 14
const BPB = 36
/** 纵轴：log10(BER) 从 0 到 −15，低于 −15 的点画在底边 */
const LG_MIN = -15

const bx = (ps: number) => BPL + (ps / UI_PS) * (BW - BPL - BPR)
const by = (lg: number) => BPT + ((0 - lg) / -LG_MIN) * (BH - BPT - BPB)

/** 浴盆曲线：横轴采样相位（0–1 UI），纵轴 log10(BER)；红线是 1e-12，金线是最佳采样相位 */
export function BathtubFig({ points, bestPhasePs }: { points: SweepPoint[]; bestPhasePs: number }) {
  const { t } = useLocale()
  const curve = points
    .map((point) => {
      const lg = Math.max(Math.log10(point.ber), LG_MIN)
      return `${bx(point.phasePs).toFixed(1)},${by(lg).toFixed(1)}`
    })
    .join(' ')
  const yTicks = [0, -3, -6, -9, -12, -15]
  const xTicks = [0, 25, 50, 75, 100]

  return (
    <figure className="term-fig serdes-fig">
      <svg viewBox={`0 0 ${BW} ${BH}`} role="img" aria-label={t(FIG.bathAria)} className="serdes-svg">
        <rect x={0} y={0} width={BW} height={BH} fill="#0d1117" rx={10} />
        {yTicks.map((lg) => (
          <g key={lg}>
            <line x1={BPL} x2={BW - BPR} y1={by(lg)} y2={by(lg)} stroke="#3d4756" strokeWidth={1} />
            <text x={BPL - 6} y={by(lg)} fill="#8b949e" fontSize={11} textAnchor="end" dominantBaseline="middle">
              {`${lg}`}
            </text>
          </g>
        ))}
        {xTicks.map((ps) => (
          <text key={ps} x={bx(ps)} y={BH - BPB + 14} fill="#8b949e" fontSize={11} textAnchor="middle">
            {`${ps}`}
          </text>
        ))}
        <line x1={BPL} x2={BW - BPR} y1={by(-12)} y2={by(-12)} stroke="#f85149" strokeWidth={1.5} strokeDasharray="5 3" />
        <line x1={bx(bestPhasePs)} x2={bx(bestPhasePs)} y1={BPT} y2={BH - BPB} stroke="#e8c45a" strokeWidth={1.5} />
        <polyline points={curve} fill="none" stroke="#58a6ff" strokeWidth={2.2} />
        <text x={(BPL + BW - BPR) / 2} y={BH - 6} fill="#8b949e" fontSize={11} textAnchor="middle">
          {t(FIG.axisPhase)}
        </text>
      </svg>
      <ul className="serdes-legend">
        <li>
          <span className="serdes-legend__swatch" style={{ background: '#f85149' }} />
          {t(FIG.legendRed)}
        </li>
        <li>
          <span className="serdes-legend__swatch" style={{ background: '#e8c45a' }} />
          {t(FIG.legendBest)}
        </li>
      </ul>
      <figcaption>{t(FIG.bathCap)}</figcaption>
    </figure>
  )
}

const EW = 360
const EH = 240
/** 眼框：横向 1 UI 占 300 px，纵向 1 mV 占 0.3 px，中心在 y = 120 */
const ex = (ui: number) => 30 + ui * 300
const ey = (mv: number) => 120 - mv * 0.3

/** BER 1e-12 下的眼（实线矩形）与规格 mask（虚线矩形）；虚线横线是没有噪声时的中心眼高 */
export function EyeBoxFig({ sample }: { sample: SampleId }) {
  const { t } = useLocale()
  const p = SAMPLES[sample]
  const ew = eyeWidthUi(BER_LIMIT, p)
  const eh = Math.max(0, eyeHeightMv(BER_LIMIT, p))
  const eyeLeft = ex(0.5 - ew / 2)
  const eyeRight = ex(0.5 + ew / 2)
  const maskLeft = ex(0.5 - SPEC_EW_UI / 2)
  const maskRight = ex(0.5 + SPEC_EW_UI / 2)

  return (
    <figure className="term-fig serdes-fig">
      <svg viewBox={`0 0 ${EW} ${EH}`} role="img" aria-label={t(FIG.eyeAria)} className="serdes-svg">
        <rect x={0} y={0} width={EW} height={EH} fill="#0d1117" rx={10} />
        <line x1={ex(0)} x2={ex(1)} y1={ey(p.eyeMv / 2)} y2={ey(p.eyeMv / 2)} stroke="#8b949e" strokeDasharray="2 3" strokeWidth={1} />
        <line x1={ex(0)} x2={ex(1)} y1={ey(-p.eyeMv / 2)} y2={ey(-p.eyeMv / 2)} stroke="#8b949e" strokeDasharray="2 3" strokeWidth={1} />
        <line x1={ex(0.5)} x2={ex(0.5)} y1={20} y2={EH - 20} stroke="#3d4756" strokeDasharray="4 3" strokeWidth={1} />
        <rect
          x={maskLeft}
          y={ey(SPEC_EH_MV / 2)}
          width={maskRight - maskLeft}
          height={ey(-SPEC_EH_MV / 2) - ey(SPEC_EH_MV / 2)}
          fill="none"
          stroke="#e8c45a"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
        <rect
          x={eyeLeft}
          y={ey(eh / 2)}
          width={Math.max(0, eyeRight - eyeLeft)}
          height={Math.max(0, ey(-eh / 2) - ey(eh / 2))}
          fill="rgba(88, 166, 255, 0.18)"
          stroke="#58a6ff"
          strokeWidth={2}
        />
      </svg>
      <ul className="serdes-legend">
        <li>
          <span className="serdes-legend__swatch" style={{ background: '#58a6ff' }} />
          {t(FIG.legendEye)}
        </li>
        <li>
          <span className="serdes-legend__swatch" style={{ background: '#e8c45a' }} />
          {t(FIG.legendMask)}
        </li>
        <li>
          <span className="serdes-legend__swatch" style={{ background: '#8b949e' }} />
          {t(FIG.legendFloor)}
        </li>
      </ul>
      <figcaption>{t(FIG.eyeCap)}</figcaption>
    </figure>
  )
}
