import { useLocale } from '../../i18n/LocaleContext'
import { S } from './pwrDptData'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const WIRE = '#8b949e'
const PART = '#c9d1d9'
const BLUE = '#58a6ff'
const GOLD = '#e8c45a'

/**
 * 双脉冲电路示意图（教学示意）：母线 Vdc → 负载电感 L → 开关节点 SW；
 * 续流二极管 D 接在 SW 与母线之间；下管 DUT 的漏极在 SW，源极接地；Rg 串在栅极回路；Lstray 在母线上。
 * 探头：Vds 跨在 DUT 两端，Id 在 SW 的电流路径上。
 */
export function DptCircuitFig() {
  const { t } = useLocale()
  return (
    <figure className="pwr-dpt-fig">
      <svg viewBox="0 0 420 180" role="img" aria-label={t(S.circuitAria)} className="pwr-dpt-svg">
        <rect x={0} y={0} width={420} height={180} rx={10} fill={BG} />

        {/* 母线与杂散电感 */}
        <path d="M60 26 H220" stroke={WIRE} strokeWidth={2} fill="none" />
        <path d="M220 26 q5 -7 10 0 q5 -7 10 0 q5 -7 10 0 q5 -7 10 0" stroke={PART} strokeWidth={1.8} fill="none" />
        <path d="M260 26 H380" stroke={WIRE} strokeWidth={2} fill="none" />
        <text x={64} y={16} fill={PART} fontSize={12}>Vdc</text>
        <text x={240} y={14} textAnchor="middle" fill={PART} fontSize={11}>Lstray</text>

        {/* 负载电感 L，从母线到开关节点 SW */}
        <path d="M110 26 V40" stroke={WIRE} strokeWidth={2} fill="none" />
        <path
          d="M110 40 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10"
          stroke={PART}
          strokeWidth={1.8}
          fill="none"
        />
        <path d="M110 80 V92 H210" stroke={WIRE} strokeWidth={2} fill="none" />
        <text x={100} y={64} textAnchor="end" fill={PART} fontSize={12}>L</text>

        {/* 续流二极管 D：阳极在 SW，阴极朝母线 */}
        <path d="M160 92 V66 M152 66 H168 L160 54 Z M152 50 H168 M160 50 V26" stroke={PART} strokeWidth={1.8} fill="none" />
        <text x={146} y={64} textAnchor="end" fill={PART} fontSize={12}>D</text>

        {/* Id 探头：在 SW 电流路径上 */}
        <circle cx={182} cy={92} r={7} fill={BG} stroke={GOLD} strokeWidth={1.5} />
        <text x={182} y={96} textAnchor="middle" fill={GOLD} fontSize={9}>I</text>
        <text x={182} y={80} textAnchor="middle" fill={GOLD} fontSize={10}>Id</text>

        {/* 下管 DUT：漏极在 SW，源极接地，栅极经 Rg 驱动 */}
        <path d="M210 92 V100 H216 M216 100 V130 M216 130 H210 V142 M204 104 V126" stroke={PART} strokeWidth={2} fill="none" />
        <text x={226} y={150} fill={PART} fontSize={12}>DUT</text>
        <path d="M204 115 H186" stroke={WIRE} strokeWidth={1.8} fill="none" />
        <path d="M186 115 L180 111 L174 119 L168 111 L162 119 L156 115" stroke={PART} strokeWidth={1.6} fill="none" />
        <text x={171} y={106} textAnchor="middle" fill={PART} fontSize={11}>Rg</text>
        <path d="M156 115 H140" stroke={WIRE} strokeWidth={1.8} fill="none" />
        <rect x={96} y={104} width={44} height={22} rx={4} fill="none" stroke={WIRE} />
        <text x={118} y={119} textAnchor="middle" fill={WIRE} fontSize={10}>Vdrive</text>

        {/* 地 */}
        <path d="M210 142 V156 M196 156 H224 M200 161 H220 M204 166 H216" stroke={WIRE} strokeWidth={1.8} fill="none" />
        <text x={230} y={166} fill={WIRE} fontSize={11}>GND</text>

        {/* Vds 探头：跨在 DUT 两端 */}
        <path d="M222 100 H236 V130 H222" stroke={BLUE} strokeWidth={1.4} strokeDasharray="4 3" fill="none" />
        <text x={240} y={116} fill={BLUE} fontSize={11}>Vds</text>
      </svg>
      <figcaption className="pwr-dpt-note">{t(S.circuitCap)}</figcaption>
      <div className="pwr-dpt-legend">
        <span>{t(S.legendL)}</span>
        <span>{t(S.legendD)}</span>
        <span>{t(S.legendVds)}</span>
        <span>{t(S.legendId)}</span>
      </div>
    </figure>
  )
}
