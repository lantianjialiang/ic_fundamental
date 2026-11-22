import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram } from '../mfg/FlowVisuals'

export type Architecture = 'd2' | 'd25' | 'd3' | 'fo'

const GOLD = '#ffdb83'
const COPPER = '#dda665'
const DIE = '#81aaf0'
const BGA = [99, 164, 229, 294, 359, 424]
const CAPTIONS = {
  d2: loc('2D 倒装示例中，单颗裸片经凸点接有机基板，再由 BGA 焊球接 PCB。', 'In this 2D flip-chip example, one die joins the substrate through bumps and the PCB through BGA balls.'),
  d25: loc('2.5D 把芯粒 A、B 并排放在连续的中介层上。芯粒间信号主要横向走在细线层，另一路经 C4、基板与焊球接板。', '2.5D places dies A and B side by side over a continuous interposer. Fine lateral routing links them, while another route reaches the PCB through C4, substrate and balls.'),
  d3: loc('3D 把芯粒 B 叠在 A 上。芯粒间信号竖向跨过键合面，图中用 TSV 将信号穿过下层硅后接基板。', '3D stacks B on A. Die-to-die wiring crosses the bond interface vertically. In this example a TSV carries a signal through the lower die toward the substrate.'),
  fo: loc('这是模封扇出的一例。芯片嵌在模封料中，薄 RDL 把焊盘引到芯片面积之外的焊球。SiP 还可用其他方法集成多个功能。', 'This is a molded fan-out example. The die sits in mold compound and thin RDL carries its pads to balls outside the die footprint. A SiP can use other techniques to integrate several functions.'),
}

export function ApkArchitecture({ kind, route, part }: { kind: Architecture; route?: boolean; part?: string }) {
  const { t } = useLocale()
  const fanout = kind === 'fo'
  const sideBySide = kind === 'd25'
  const stacked = kind === 'd3'
  const dieY = sideBySide ? 83 : 110
  const edge = (id: string) => part === id ? GOLD : undefined
  const edgeWidth = (id: string) => part === id ? 3 : 1
  return (
    <Diagram title={loc('同一观察方向下的封装截面', 'Package cross-sections in a common orientation')} caption={CAPTIONS[kind]}>
      <svg className="flow-technical-svg" viewBox="0 0 520 270" role="img" aria-label={t(CAPTIONS[kind])} data-architecture={kind} data-part={part}>
        <rect x="39" y="224" width="443" height="22" rx="4" fill="#285f56" />
        <text x="260" y="241" textAnchor="middle">PCB</text>
        {BGA.map((x) => <g key={x}>
          <rect x={x - 12} y="222" width="24" height="5" rx="2" fill={COPPER} />
          <circle cx={x} cy="213" r="9" fill={COPPER} stroke={edge('ball')} strokeWidth={edgeWidth('ball')} />
        </g>)}
        {fanout ? <>
          <rect x="63" y="110" width="394" height="86" rx="8" fill="#3c506a" />
          <text x="441" y="159" textAnchor="end">{t(loc('模封料', 'Mold'))}</text>
          <rect x="63" y="190" width="394" height="14" rx="3" fill="#368e83" />
          <text x="439" y="188" textAnchor="end">RDL</text>
        </> : <>
          <rect x="62" y="170" width="396" height="33" rx="5" fill="#36776c" stroke={edge('sub')} strokeWidth={edgeWidth('sub')} />
          <text x="441" y="191" textAnchor="end">{t(loc('封装基板', 'Substrate'))}</text>
          <rect x="65" y="37" width="390" height="12" rx="3" fill="#8394a8" stroke={edge('lid')} strokeWidth={edgeWidth('lid')} />
          <path d="M70 49 V170 M450 49 V170" stroke="#8394a8" strokeWidth="5" opacity=".65" />
          <text x="454" y="29" textAnchor="end">{t(loc('盖板', 'Lid'))}</text>
        </>}
        {sideBySide && <>
          <rect x="76" y="126" width="369" height="30" rx="3" fill="#537895" stroke={edge('intp')} strokeWidth={edgeWidth('intp')} />
          <path d="M77 134 H443" stroke="#abbed0" strokeWidth="2" />
          <text x="427" y="149" textAnchor="end">{t(loc('中介层', 'Interposer'))}</text>
          {[107, 164, 229, 294, 359, 417].map((x) => <rect key={x} x={x - 7} y="156" height="14" width="14" rx="6"
            fill={COPPER} stroke={edge('c4')} strokeWidth={edgeWidth('c4')} />)}
          <text x="82" y="168">C4</text>
        </>}
        <rect x={sideBySide ? '106' : '181'} y={fanout ? 151 : dieY} width="140" height={fanout ? 38 : sideBySide ? 31 : 46} rx="4"
          fill={DIE} stroke={edge('die')} strokeWidth={edgeWidth('die')} />
        <text x={sideBySide ? 176 : 251} y={fanout ? 175 : sideBySide ? 105 : 139} textAnchor="middle" className="flow-die-label">Die A</text>
        {sideBySide && <>
          <rect x="286" y="83" width="124" height="31" rx="4" fill={DIE} stroke={edge('die')} strokeWidth={edgeWidth('die')} />
          <text x="348" y="105" textAnchor="middle" className="flow-die-label">Die B</text>
        </>}
        {stacked && <>
          <rect x="200" y="65" width="103" height="37" rx="4" fill="#58bfb0" />
          <text x="252" y="90" textAnchor="middle" className="flow-die-label">Die B</text>
          <path d="M200 106 H303" stroke="#d7b37d" strokeWidth="5" />
          <path d="M265 102 V156" stroke={COPPER} strokeWidth="7" />
          <text x="296" y="77">TSV</text>
          <path d="M297 81 L268 111" stroke="#9cb3c7" strokeWidth="1.5" />
        </>}
        {!fanout && (sideBySide ? [125, 160, 197, 226, 303, 337, 372, 397] : [193, 218, 242, 266, 290, 312]).map((x) => (
          <rect key={x} x={x - 5} y={sideBySide ? 114 : 156} width="10" height={sideBySide ? 12 : 14} rx="4"
            fill={COPPER} stroke={edge('bump')} strokeWidth={edgeWidth('bump')} />
        ))}
        {route && <g stroke={GOLD} fill="none" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {kind === 'd2' && <path data-signal="board" d="M193 154 V182 H164 V223" />}
          {kind === 'd25' && <>
            <path data-signal="chiplets" d="M226 113 V134 H303 V113" />
            <path data-signal="board" d="M160 113 V134 H164 V221" stroke="#72e1c8" />
          </>}
          {kind === 'd3' && <path data-signal="stack" d="M265 99 V184 H229 V222" />}
          {fanout && <path data-signal="redistribution" d="M190 187 V197 H99 V223" />}
        </g>}
      </svg>
      {route && sideBySide && <p className="flow-diagram-detail">{t(loc('金线连接两颗芯粒，青线把另一条信号从芯粒引向 PCB。', 'Gold links the two dies. Teal carries a separate signal from a die to the PCB.'))}</p>}
    </Diagram>
  )
}
