import { loc } from '../../../i18n/locale'
import { type FabStep } from './pcbFabSteps'
import { RULE, minDam, minEdge, minInkClear, minPadGap } from './pcbFabRules'

const mm = (n: number) => n.toFixed(2)

export const STEPS_B: FabStep[] = [
  {
    id: 'mask',
    title: loc('阻焊', 'Solder mask'),
    what: loc(
      '涂液态感光阻焊油墨（LPI），预烘，曝光，显影，让焊盘露出来，最后高温固化。绿色只是常见颜色；它的作用是防焊锡桥连、防铜氧化、绝缘。',
      'Liquid photoimageable (LPI) mask ink is coated, pre-baked, exposed and developed so the pads open up, then fully cured at high temperature. Green is only the common colour; the mask prevents solder bridging, protects copper and insulates.',
    ),
    equip: loc('喷涂机或丝网印刷机、预烘箱、曝光机（底片或 LDI）、显影线、固化炉。', 'Spray coater or screen printer, pre-bake oven, exposure unit (artwork or LDI), developer, cure oven.'),
    rules: [
      {
        title: loc('阻焊开窗要比焊盘大一圈', 'Mask openings are larger than the pad'),
        text: loc(
          `阻焊对位有约 ±${mm(RULE.maskRegTol)} mm 的偏差。开窗如果和焊盘一样大，偏一点就盖住焊盘一角，焊接面积变小；所以开窗每边加大 ${mm(RULE.maskExpansion)} mm。`,
          `Mask registration has about ±${mm(RULE.maskRegTol)} mm of error. An opening exactly as big as the pad would, when shifted, cover a corner of it and shrink the solder area; so each side of the opening is enlarged by ${mm(RULE.maskExpansion)} mm.`,
        ),
      },
      {
        title: loc('阻焊坝有最小宽度', 'The solder dam has a minimum width'),
        text: loc(
          `坝太窄（约小于 ${mm(minDam)} mm），油墨附着不牢，显影或焊接时会掉，焊盘之间就失去防桥连的作用。开窗每边已经让出 ${mm(RULE.maskExpansion)} mm，所以相邻焊盘边缘的间距要 ≥ ${mm(minDam)} + 2 × ${mm(RULE.maskExpansion)} = ${mm(minPadGap)} mm 才留得住坝；间距更小时，厂家只能把几个焊盘开成一整个大窗。`,
          `A dam narrower than about ${mm(minDam)} mm does not stick and falls off in development or soldering, so the pads lose their anti-bridging protection. The opening already takes ${mm(RULE.maskExpansion)} mm per side, so the edge-to-edge pad gap must be ≥ ${mm(minDam)} + 2 × ${mm(RULE.maskExpansion)} = ${mm(minPadGap)} mm to keep a dam; below that the fab can only open several pads as one big window.`,
        ),
      },
    ],
  },
  {
    id: 'legend',
    title: loc('字符', 'Silkscreen legend'),
    what: loc(
      '用丝网印刷或喷墨把白色油墨印在阻焊上：位号、极性、外框、版本号。字符不导电，只给装配和维修的人看。',
      'White ink is screen-printed or inkjet-printed on top of the mask: designators, polarity, outlines, revision. The legend is not electrical; it is for the people who assemble and repair the board.',
    ),
    equip: loc('丝印机或字符喷墨打印机，加热或 UV 固化炉。', 'Screen printer or legend inkjet printer, thermal or UV cure.'),
    rules: [
      {
        title: loc('字符不要压在焊盘上', 'No silkscreen on pads'),
        text: loc(
          `白油墨盖在焊盘上，焊锡就粘不上，造成虚焊。丝印对位偏差约 ±${mm(RULE.inkRegTol)} mm，所以字符离焊盘至少留 ${mm(minInkClear)} mm；线宽也要 ≥ ${mm(RULE.inkLine)} mm，更细印不清。厂家常自动裁掉压盘的字符，裁完字可能不全。`,
          `Ink on a pad stops solder from wetting it and gives a poor joint. Legend registration is about ±${mm(RULE.inkRegTol)} mm, so keep text at least ${mm(minInkClear)} mm from a pad; stroke width must be ≥ ${mm(RULE.inkLine)} mm or it prints unreadably. Fabs often clip legend that touches pads automatically, and the text may end up incomplete.`,
        ),
      },
    ],
  },
  {
    id: 'finish',
    title: loc('表面处理（ENIG）', 'Surface finish (ENIG)'),
    what: loc(
      '裸露的铜焊盘不处理会氧化，焊不上。ENIG 先沉一层镍，再沉很薄的金：镍挡住铜扩散，并在焊接时和锡形成焊点；金只是保护镍不氧化。',
      'Bare copper pads oxidise and will not solder. ENIG deposits nickel first and then a very thin gold layer: the nickel blocks copper diffusion and forms the joint with solder, and the gold only keeps the nickel from oxidising.',
    ),
    equip: loc('化学沉镍金线：清洗、微蚀、活化、沉镍、沉金等一串药水缸。', 'Electroless nickel / immersion gold line: a chain of tanks for cleaning, micro-etch, activation, nickel and gold.'),
    rules: [
      {
        title: loc('平整，适合细间距和 BGA', 'Flat, suited to fine pitch and BGA'),
        text: loc(
          'ENIG 表面平整，细间距和 BGA 的焊盘共面性好；代价是成本高，镍层腐蚀过度时会出“黑盘”，焊点变脆。所以细间距、BGA 选 ENIG，普通板可以选便宜的 HASL 或 OSP。各表面处理的对比见 {@pcbMaterial}。',
          'ENIG is flat, which gives fine-pitch and BGA pads good coplanarity; the cost is higher, and over-corroded nickel causes “black pad” and brittle joints. So choose ENIG for fine pitch and BGA, and cheaper HASL or OSP for ordinary boards. The finishes are compared in {@pcbMaterial}.',
        ),
      },
    ],
  },
  {
    id: 'route',
    title: loc('成型', 'Routing and V-cut'),
    what: loc(
      '数控铣床沿外形线把板子铣出来；长直边的拼板可以用 V 割：两面各割一道 V 形槽，中间留一层薄片，装配后掰开。',
      'A CNC router cuts the board out along the outline; panels with long straight edges can use V-cut: a V groove is cut on both faces, leaving a thin web that is snapped apart after assembly.',
    ),
    equip: loc('数控铣床（锣机）、V 割机、金手指倒角机、洗板机。', 'CNC router, V-cut machine, edge-connector bevelling machine, board washer.'),
    rules: [
      {
        title: loc('铜离板边要留距离', 'Keep copper clear of the board edge'),
        text: loc(
          `铣刀位置公差约 ±${mm(RULE.routeTol)} mm，再加毛刺和露铜的余量 ${mm(RULE.edgeMargin)} mm：铜到板边 ≥ ${mm(RULE.routeTol)} + ${mm(RULE.edgeMargin)} = ${mm(minEdge)} mm。太近就会铣到铜，铜皮翘起，或者侧面露铜造成短路。V 割边还要更大，因为刀槽本身就会偏。`,
          `The router position tolerance is about ±${mm(RULE.routeTol)} mm, plus ${mm(RULE.edgeMargin)} mm for burrs and exposed copper: copper to edge ≥ ${mm(RULE.routeTol)} + ${mm(RULE.edgeMargin)} = ${mm(minEdge)} mm. Too close and the router cuts into copper, lifting it or exposing it on the side to cause shorts. V-cut edges need even more, because the groove itself wanders.`,
        ),
      },
    ],
  },
  {
    id: 'test',
    title: loc('电测', 'Electrical test'),
    what: loc(
      '按设计导出的网表（如 IPC-356），检查每个网络两端是否连通（有没有开路），不同网络之间是否绝缘（有没有短路）。这和 {@fOpens} 的开短路是同一个思路，只是对象是板子。',
      'Against the netlist exported from the design (for example IPC-356), every net is checked for continuity (opens) and different nets for isolation (shorts). It is the same idea as the opens/shorts test in {@fOpens}, applied to a board instead of a chip.',
    ),
    equip: loc('飞针测试机（小批量，不需要治具）；测试架 / 针床（大批量，要做治具，几百到上千根弹簧针）。', 'Flying-probe tester (small runs, no fixture); bed-of-nails fixture (volume, needs a fixture with hundreds to thousands of spring pins).'),
    rules: [
      {
        title: loc('每个网络都要有能被碰到的点', 'Every net needs a point a probe can reach'),
        text: loc(
          '测试针只能碰到表面的焊盘、过孔或测试点。没有任何一处露在外面的网络没法测；焊盘太小，针尖的定位误差还会让它扎不准。这也是设计里要留测试点的原因，见 {@pcbDfm}。',
          'Probes can only touch surface pads, vias or test points. A net with no exposed point cannot be tested, and a pad that is too small lets the probe tip’s positioning error miss it. This is one reason designs keep test points; see {@pcbDfm}.',
        ),
      },
    ],
  },
  {
    id: 'final',
    title: loc('终检', 'Final inspection'),
    what: loc(
      '目检（含放大镜），量外形尺寸、板厚、孔径和翘曲度；抽样做切片，看孔铜厚度；按 IPC-A-600 这类验收标准判合格，再清洗、真空包装。',
      'Visual inspection (with magnification), measurement of outline, thickness, hole size and warp; sampled micro-sections check the hole copper thickness; boards are judged against an acceptance standard such as IPC-A-600, then cleaned and vacuum-packed.',
    ),
    equip: loc('目检台、影像测量仪、测厚仪、切片机和金相显微镜、翘曲检测、真空包装机。', 'Inspection bench, optical measuring machine, thickness gauge, micro-section saw and metallurgical microscope, warp gauge, vacuum packer.'),
    rules: [
      {
        title: loc('在制造说明里写明验收等级', 'State the acceptance class in the fab notes'),
        text: loc(
          'IPC Class 2（一般）和 Class 3（高可靠）对孔铜厚度、孔环破盘的允许量要求不同。你不写，厂家按默认等级验收。需要更严就要在文件里写清楚，也要接受相应的成本。',
          'IPC Class 2 (general) and Class 3 (high reliability) allow different hole-copper thickness and ring breakout. If you do not say, the fab inspects to its default class. If you need it stricter, write it in the files and accept the cost that comes with it.',
        ),
      },
    ],
  },
]
