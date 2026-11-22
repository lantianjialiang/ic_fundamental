import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram, DiagramChoices } from '../mfg/FlowVisuals'

export type InterposerKind = 'si' | 'rdl' | 'bridge'

const ROUTE = [
  { id: 'die', title: loc('GPU → HBM', 'GPU → HBM') },
  { id: 'board', title: loc('GPU → 系统板', 'GPU → system board') },
] as const
export type InterposerRoute = (typeof ROUTE)[number]['id']
const STACK = {
  si: {
    layer: loc('整片硅中介层', 'Full silicon interposer'),
    die: loc('两个芯粒由整片硅上的细线层连接。红棕色 TSV 穿过硅片，主要用于向下接封装基板。', 'Fine wiring on a full silicon plate links the two dies. Brown TSVs cross the silicon for connections down to the substrate.'),
    board: loc('信号从顶层布线进 TSV，穿过硅中介层到下方的 C4，再经过基板到系统板。', 'Top routing takes the signal through a silicon TSV to C4, then through the substrate to the system board.'),
  },
  rdl: {
    layer: loc('整片 RDL 中介层', 'Full RDL interposer'),
    die: loc('信号通过覆盖两颗芯粒下方的铜布线层横向跨过间隙。介质层和铜过孔组成整片 RDL 中介层。', 'Copper routing beneath both dies spans the gap. Dielectrics and copper vias form a continuous RDL interposer.'),
    board: loc('信号沿铜线转层，在介质中的铜过孔向下，接到基板和板端。', 'The trace changes layers through copper vias in dielectric, then continues to the substrate and board.'),
  },
  bridge: {
    layer: loc('局部硅桥', 'Local silicon bridge'),
    die: loc('桥只覆盖 GPU 和 HBM 相邻的两排焊盘。细线跨过两颗芯粒之间的缝，远离缝的焊盘落在基板上。', 'The bridge sits under the neighboring pad rows of the GPU and HBM. Fine wiring spans the seam; pads farther from the seam land on the substrate.'),
    board: loc('示例的普通板级 I/O 从远离缝的凸点直接走基板。局部桥只服务靠近缝的芯粒间连接。', 'This board-facing I/O takes a bump away from the seam straight into the substrate. The local bridge serves die-to-die connections near the seam.'),
  },
}
const CHIPLETS = [{ x: 77, name: 'GPU' }, { x: 278, name: 'HBM' }]
const BUMPS = [106, 141, 176, 212, 241, 296, 326, 362, 397, 432]
const BALLS = [103, 165, 227, 289, 351, 413]
const COPPER = '#d39466'

export function ApkInterposerRouting({ kind, route, onRoute }: {
  kind: InterposerKind; route: InterposerRoute; onRoute: (route: InterposerRoute) => void
}) {
  const { t } = useLocale()
  const isBridge = kind === 'bridge'
  const description = STACK[kind]
  const path = route === 'die' ? 'M241 99 V129 H296 V99'
    : isBridge ? 'M141 99 V172 H165 V226' : kind === 'si'
      ? 'M141 99 V129 H164 V170 H165 V226' : 'M141 99 V129 H158 V145 H164 V171 H165 V226'
  return (
    <Diagram title={loc('同一对 GPU 和 HBM 的两条连接', 'Two connections from the same GPU and HBM pair')} caption={description[route]}>
      <DiagramChoices label={loc('信号目的端', 'Signal destination')} items={ROUTE} value={route} onPick={onRoute} />
      <svg viewBox="0 0 510 258" className="flow-technical-svg" role="img"
        aria-label={t(description[route])} data-interposer={kind} data-route={route}>
        <rect x="50" y="227" width="410" height="20" rx="3" fill="#315b59" />
        <text x="255" y="242" textAnchor="middle">PCB</text>
        <rect x="53" y={isBridge ? '124' : '171'} width="404" height={isBridge ? '82' : '35'} rx="4" fill="#30756c" />
        <text x="442" y="196" textAnchor="end">{t(loc('封装基板', 'Package substrate'))}</text>
        {BALLS.map((x) => <circle key={x} cx={x} cy="216" r="10" fill={COPPER} />)}
        {CHIPLETS.map(({ x, name }) => <g key={name}>
          <rect x={x} y="63" width="168" height="39" rx="4" fill="#88aff0" />
          <text x={x + 84} y="88" textAnchor="middle" className="flow-die-label">{name}</text>
        </g>)}
        {isBridge
          ? <rect data-layer="local" x="204" y="125" width="123" height="33" rx="3" fill="#496a96" stroke="#a2badd" strokeWidth="2" />
          : <rect data-layer="full" x="71" y="125" width="376" height="33" rx="3" fill={kind === 'si' ? '#496a96' : '#62578e'} stroke="#a2badd" strokeWidth="2" />}
        {BUMPS.map((x) => <rect key={x} x={x - 6} y="102" width="12" height="23" rx="5" fill={COPPER} />)}
        {kind === 'si' && <path data-via="tsv" d="M164 130 V158 M219 130 V158 M290 130 V158 M362 130 V158" stroke={COPPER} strokeWidth="5" />}
        {kind === 'rdl' && <>
          <path data-via="rdl" d="M158 130 V145 H164 V158 M216 130 V145 H223 V159 M283 130 V145 H290 V158 M355 130 V145 H362 V158" stroke={COPPER} fill="none" strokeWidth="4" />
          <path d="M72 142 H446 M72 151 H446" stroke="#9b90ce" strokeWidth="2" />
        </>}
        {!isBridge && [106, 164, 219, 290, 362, 429].map((x) => <rect key={x} x={x - 7} y="158" width="14" height="13" rx="6" fill={COPPER} />)}
        <text x={isBridge ? 265 : 427} y="151" textAnchor={isBridge ? 'middle' : 'end'}>{t(description.layer)}</text>
        <path d={path} data-signal={route} fill="none" stroke="#ffdb83" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </Diagram>
  )
}
