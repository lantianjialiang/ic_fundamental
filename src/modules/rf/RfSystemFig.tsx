import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ERROR_TEXT, S } from './rfSystemData'
import { type LinkAnalysis, type PartKind } from './rfSystemModel'

const CW = 480
const CH = 190
const PAD = 10
const GAP = 12
const BOX_Y = 64
const BOX_H = 44

const PART_LABEL: Record<PartKind, LText> = {
  sg: loc('SG', 'SG'),
  cable: loc('线缆', 'Cable'),
  fixture: loc('夹具', 'Fixture'),
  dut: loc('DUT', 'DUT'),
  sa: loc('SA', 'SA'),
}

const FIG = {
  aria: loc(
    '测试链路图：按顺序画出信号源、线缆、夹具、DUT、线缆、分析仪，每个元件下方标出之后的功率（dBm）',
    'Test link diagram: signal source, cable, fixture, DUT, cable and analyzer in order, with the power after each part in dBm under it',
  ),
  cap: loc(
    '元件按链路顺序排列。方框下的数字是信号经过该元件之后的功率：线缆、夹具使它下降，DUT 按 0 dB 计。',
    'Parts are drawn in link order. The number under each box is the power after that part: cables and fixtures lower it, and the DUT is taken as 0 dB.',
  ),
}

/** 链路图：纯 SVG，元件个数随方案变化，方框宽度均分 */
export function RfSystemFig({ parts, analysis }: { parts: PartKind[]; analysis: LinkAnalysis }) {
  const { t } = useLocale()
  const count = Math.max(parts.length, 1)
  const boxWidth = (CW - 2 * PAD - (count - 1) * GAP) / count
  const statusText = analysis.error === null ? t(S.verdictOk) : t(ERROR_TEXT[analysis.error].title)
  return (
    <figure className="term-fig">
      <svg className="rf-svg" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.aria)}>
        <rect x={0} y={0} width={CW} height={CH} rx={10} className="rf-svg__bg" />
        <text x={PAD} y={28} className={analysis.error === null ? 'rf-status rf-status--ok' : 'rf-status rf-status--bad'}>
          {`${analysis.error === null ? '✓' : '✗'} ${statusText}`}
        </text>
        {parts.map((part, index) => {
          const x = PAD + index * (boxWidth + GAP)
          const level = analysis.levels[index]
          const cls = part === 'dut' ? 'rf-box rf-box--dut' : part === 'cable' || part === 'fixture' ? 'rf-box rf-box--pass' : 'rf-box rf-box--inst'
          return (
            <g key={index}>
              {index > 0 ? <line x1={x - GAP} y1={BOX_Y + BOX_H / 2} x2={x} y2={BOX_Y + BOX_H / 2} className="rf-wire" /> : null}
              <rect x={x} y={BOX_Y} width={boxWidth} height={BOX_H} rx={6} className={cls} />
              <text x={x + boxWidth / 2} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="middle" className="rf-box-label">
                {t(PART_LABEL[part])}
              </text>
              <text x={x + boxWidth / 2} y={BOX_Y + BOX_H + 20} textAnchor="middle" className="rf-level">
                {level === null ? '—' : `${level.toFixed(1)} dBm`}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
