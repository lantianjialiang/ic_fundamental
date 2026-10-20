import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { DUT_INPUT_MAX_DBM, type Level } from './rfDbModel'

const CW = 480
const CH = 250
const PAD_L = 52
const PAD_R = 16
const PAD_T = 16
const PAD_B = 34
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 纵轴范围 −50 … +40 dBm；级联的输入范围保证节点不会越界 */
const VMIN = -50
const VMAX = 40
const TICK_VALUES = [-40, -20, 0, 20, 40]

const NODE_X0 = PAD_L + 44
const NODE_X1 = CW - PAD_R - 44

const FIG = {
  aria: loc(
    '级联功率图：信号源、线缆、放大器、衰减器各节点的功率（dBm），虚线为示例输入上限',
    'Cascade power chart: power in dBm at the source, cable, amplifier and attenuator nodes, with a dashed example input limit',
  ),
  cap: loc(
    '每一段的 dB 直接加在上一个节点的 dBm 上：增益往上走，损耗往下走。虚线是 VDUT-RFT1 的示例输入上限，超过它就会过功率。',
    'Each stage adds its dB to the dBm of the node before it: gain moves the level up, loss moves it down. The dashed line is the example input limit of VDUT-RFT1; above it the DUT is overdriven.',
  ),
  nodes: [loc('信号源', 'Source'), loc('线缆', 'Cable'), loc('放大器', 'Amp.'), loc('衰减器', 'Attn.')],
}

const yOf = (dbm: number) => PAD_T + ((VMAX - dbm) / (VMAX - VMIN)) * PLOT_H

const xOfNode = (index: number) => NODE_X0 + (index * (NODE_X1 - NODE_X0)) / 3

/** 级联功率图：纯 SVG，节点坐标由模型给出的 levels 决定 */
export function RfDbFig({ levels }: { levels: Level[] }) {
  const { t } = useLocale()
  const points = levels.map((level, index) => ({ x: xOfNode(index), y: yOf(level.dbm), dbm: level.dbm }))
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')
  const limitText = loc(`示例上限 +${DUT_INPUT_MAX_DBM} dBm`, `Example limit +${DUT_INPUT_MAX_DBM} dBm`)
  return (
    <figure className="term-fig">
      <svg className="rf-svg" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.aria)}>
        <rect x={0} y={0} width={CW} height={CH} rx={10} className="rf-svg__bg" />
        {TICK_VALUES.map((value) => (
          <g key={value}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(value)} y2={yOf(value)} className={value === 0 ? 'rf-grid rf-grid--zero' : 'rf-grid'} />
            <text x={PAD_L - 6} y={yOf(value)} textAnchor="end" dominantBaseline="middle" className="rf-tick">
              {value > 0 ? `+${value}` : `${value}`}
            </text>
          </g>
        ))}
        <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(DUT_INPUT_MAX_DBM)} y2={yOf(DUT_INPUT_MAX_DBM)} className="rf-limit" />
        <text x={PAD_L + 4} y={yOf(DUT_INPUT_MAX_DBM) - 4} className="rf-limit-label">
          {t(limitText)}
        </text>
        <polyline points={polyline} className="rf-trace" />
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r={4} className="rf-node" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="rf-value">
              {`${point.dbm.toFixed(1)} dBm`}
            </text>
            <text x={point.x} y={PAD_T + PLOT_H + 18} textAnchor="middle" className="rf-tick">
              {t(FIG.nodes[index])}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
