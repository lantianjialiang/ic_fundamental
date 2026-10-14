import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerPkg: loc('封装', 'Package'),
  kickerInside: loc('剖面', 'Cross-section'),
  kickerFlow: loc('封装流程', 'Assembly flow'),
  kickerTest: loc('两道测试', 'Two test steps'),
  introTitle: loc('为什么裸 Die 不能直接用', 'Why a bare die cannot be used as is'),
  galleryTitle: loc('常见封装长什么样', 'What common packages look like'),
  galleryNote: loc(
    '每种封装都按真实尺寸比例画，左下角有 1 mm 比例尺。QFN、BGA、WLCSP 的引出端在底面，所以左边画的是底视图。',
    'Each package is drawn to its real proportions, with a 1 mm scale bar at the lower left. QFN, BGA and WLCSP have their terminals underneath, so the left view for them is the bottom view.',
  ),
  pitch: loc('引脚间距', 'Pitch'),
  mount: loc('安装方式', 'Mounting'),
  pins: loc('本图引脚数', 'Pins shown'),
  forTest: loc('对测试：', 'For test: '),
  insideTitle: loc('封装里面：打线 vs 倒装', 'Inside the package: wire bond vs flip chip'),
  insideNote: loc('切换两种结构，点右边的部件名看它的作用和常见失效。', 'Switch between the two structures and click a part name on the right to see its role and typical failures.'),
  wire: loc('打线 BGA', 'Wire-bond BGA'),
  flip: loc('倒装 BGA', 'Flip-chip BGA'),
  flowTitle: loc('封装流程：一颗好 Die 变成成品', 'Assembly flow: a good die becomes a finished part'),
  flowNote: loc('以打线 BGA 为例分步播放。引线框架封装（SOP、QFP）在植球那一步换成电镀和切筋成形。', 'Step through a wire-bond BGA. Lead-frame packages (SOP, QFP) replace ball attach with plating and trim-and-form.'),
  cpftTitle: loc('CP 和 FT：同一颗芯片测两次', 'CP and FT: the same chip is tested twice'),
  cpftNote: loc('点上面一栏看对应的接触方式。', 'Click a column to see how contact is made.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('针卡、Socket、负载板怎么接到 ATE 上，见 {@connection}；车间里的分选机见 {@fAte}。', 'How probe cards, sockets and load boards connect to the ATE: {@connection}; handlers on the floor: {@fAte}.'),
  next: loc('下一课：常用元器件', 'Next: Common components'),
}

export const INTRO: LText[] = [
  loc(
    '切下来的 Die 只有指甲盖大，Pad 只有几十微米宽，又怕湿气、怕划、怕静电，根本没法直接焊到电路板上。',
    'A diced die is fingernail-sized, its pads are only tens of micrometres wide, and it is vulnerable to moisture, scratches and static. It cannot be soldered straight onto a circuit board.',
  ),
  loc(
    '封装做三件事：保护 Die；把细小的 Pad 引到板子能焊的间距（几百微米到 2.54 mm）；把热量导出去。封装形式也决定了测试时用什么 Socket、怎么接触。',
    'A package does three things: it protects the die; it fans the tiny pads out to a pitch a board can solder (a few hundred micrometres up to 2.54 mm); and it carries heat away. The package type also decides which socket test uses and how contact is made.',
  ),
]

export type PkgId = 'dip' | 'sop' | 'qfp' | 'qfn' | 'bga' | 'wlcsp'

export const PKGS: Array<{
  id: PkgId
  name: string
  full: LText
  pitch: string
  pins: number
  mount: LText
  text: LText
  test: LText
}> = [
  {
    id: 'dip',
    name: 'DIP',
    full: loc('双列直插', 'Dual in-line package'),
    pitch: '2.54 mm',
    pins: 8,
    mount: loc('通孔插装', 'Through-hole'),
    text: loc(
      '两排直脚插进电路板的孔里再焊。一端有半圆缺口，缺口左下第一个脚是 1 脚，从上往下看按逆时针数。今天主要见于教学和少数功率、老产品。',
      'Two rows of straight pins go through holes in the board and are soldered. One end has a half-round notch; with the notch on the left, the lower-left pin is pin 1, and pins count counterclockwise seen from the top. Today it is mostly found in teaching and a few power or legacy parts.',
    ),
    test: loc('引脚粗、间距大，Socket 最简单，手工也能插拔。', 'Thick pins at wide pitch make the simplest socket; it can even be loaded by hand.'),
  },
  {
    id: 'sop',
    name: 'SOP',
    full: loc('小外形封装', 'Small outline package'),
    pitch: '1.27 mm',
    pins: 8,
    mount: loc('表面贴装', 'Surface mount'),
    text: loc(
      '两侧伸出「鸥翼形」引脚，向外、向下再平着贴在板子焊盘上。体积比 DIP 小得多，是最常见的小管脚数封装。1 脚旁边有圆点或斜边。',
      'Gull-wing leads come out of two sides, bend out and down, and sit flat on the board pads. Much smaller than DIP, it is the most common low-pin-count package. Pin 1 is marked by a dot or a bevelled edge.',
    ),
    test: loc('Socket 的触点压在引脚的平脚上；引脚变形（共面性差）会接触不良。', 'Socket contacts press on the flat feet of the leads; bent leads (poor coplanarity) give bad contact.'),
  },
  {
    id: 'qfp',
    name: 'QFP',
    full: loc('四边扁平封装', 'Quad flat package'),
    pitch: '0.8 mm',
    pins: 44,
    mount: loc('表面贴装', 'Surface mount'),
    text: loc(
      '四边都有鸥翼引脚，适合几十到两百多个管脚。间距可以做到 0.4 mm，但引脚越细越容易弯。',
      'Gull-wing leads on all four sides, for tens up to two hundred-odd pins. Pitch can go down to 0.4 mm, but finer leads bend more easily.',
    ),
    test: loc('引脚都在四周，眼睛能看到焊点；细间距时 Socket 对位要求高。', 'All leads are around the edge, so solder joints are visible; at fine pitch the socket needs precise alignment.'),
  },
  {
    id: 'qfn',
    name: 'QFN',
    full: loc('四边无引脚扁平封装', 'Quad flat no-lead'),
    pitch: '0.5 mm',
    pins: 32,
    mount: loc('表面贴装', 'Surface mount'),
    text: loc(
      '没有伸出的引脚，金属焊端露在底面四边，中间还有一块大的散热焊盘（Exposed Pad），通常接地。体积小、寄生电感小、散热好。',
      'No protruding leads: metal terminals are exposed on the four bottom edges, and a large exposed pad in the middle (usually ground) carries heat. Small, low parasitic inductance, good thermal path.',
    ),
    test: loc('Socket 触点要从下面顶到底面焊端和中间焊盘；焊点藏在下面，看不见。', 'Socket contacts push up on the bottom terminals and the centre pad; the solder joints are hidden underneath.'),
  },
  {
    id: 'bga',
    name: 'BGA',
    full: loc('球栅阵列', 'Ball grid array'),
    pitch: '0.8 mm',
    pins: 100,
    mount: loc('表面贴装', 'Surface mount'),
    text: loc(
      '底面整面排满锡球，按行（字母）列（数字）编号，角上标 A1。管脚多（几百到几千）、走线短，是处理器、FPGA、GPU 的主流封装。',
      'The whole underside is covered with solder balls numbered by row (letter) and column (number), with A1 marked at a corner. High pin counts (hundreds to thousands) and short paths make it the mainstream package for processors, FPGAs and GPUs.',
    ),
    test: loc('Socket 用一针对一球的弹簧针（Pogo Pin）从下面顶住锡球；焊点只能用 X 光检查。', 'The socket uses one spring pin (pogo pin) per ball pushing up from below; solder joints can only be inspected by X-ray.'),
  },
  {
    id: 'wlcsp',
    name: 'WLCSP',
    full: loc('晶圆级芯片尺寸封装', 'Wafer-level chip-scale package'),
    pitch: '0.4 mm',
    pins: 36,
    mount: loc('表面贴装', 'Surface mount'),
    text: loc(
      '直接在晶圆上长凸点，切下来就是成品：封装和 Die 一样大，没有塑封外壳。手机里很多小芯片是这种。',
      'Bumps are grown directly on the wafer, and each diced die is the finished part: the package is the same size as the die, with no mould body. Many small chips in phones use it.',
    ),
    test: loc('没有塑封保护，容易崩边；很多产品在晶圆阶段就把测试做完，FT 很少甚至没有。', 'With no mould protection it chips easily; many products finish testing at wafer level, with little or no FT.'),
  },
]

export const VIEW = {
  top: loc('俯视图', 'Top view'),
  bottom: loc('底视图（翻过来看）', 'Bottom view (flipped over)'),
  side: loc('侧视图（装在板上）', 'Side view (on the board)'),
  pcb: loc('电路板', 'PCB'),
  mirror: loc(
    '底视图是把芯片翻过来看的，左右镜像，所以 1 脚 / A1 在右上角，编号方向变成顺时针。',
    'The bottom view is the chip flipped over, mirrored left to right, so pin 1 / A1 sits at the top right and numbering runs clockwise.',
  ),
}

export type InsideMode = 'wire' | 'flip'
export type PartId = 'die' | 'attach' | 'wire' | 'mold' | 'bump' | 'underfill' | 'substrate' | 'ball'

export const PARTS: Record<PartId, { title: LText; text: LText }> = {
  die: {
    title: loc('Die（芯片）', 'Die'),
    text: loc(
      '真正的电路在这块硅上。打线时电路面朝上，Pad 在四周；倒装时电路面朝下，Pad 和凸点铺满整个面，硅背面朝上便于散热。',
      'The actual circuit is on this silicon. In wire bond the circuit faces up with pads around the edge; in flip chip it faces down with pads and bumps over the whole area, and the bare back faces up for cooling.',
    ),
  },
  attach: {
    title: loc('粘片胶', 'Die attach'),
    text: loc(
      '把 Die 粘在基板上的胶或焊料，也是 Die 往下散热的通道。里面有空洞会形成局部热点，高功率测试时更容易失效。',
      'Adhesive or solder that bonds the die to the substrate, and also the die’s path for heat downward. Voids in it create hot spots, which fail more easily under high-power test.',
    ),
  },
  wire: {
    title: loc('键合线', 'Bond wires'),
    text: loc(
      '金线或铜线，直径约 15–30 µm，一头焊在 Die 的 Pad 上，一头焊在基板的焊指上。断线是开路，塑封时线被冲歪碰到旁边一根是短路，这正是开短路测试要抓的 {@fOpens}。',
      'Gold or copper wire about 15–30 µm across, bonded to a die pad at one end and a substrate finger at the other. A broken wire is an open; a wire swept against its neighbour during moulding is a short. That is exactly what opens/shorts test catches {@fOpens}.',
    ),
  },
  mold: {
    title: loc('塑封料', 'Mould compound'),
    text: loc(
      '环氧树脂把 Die 和线包起来防潮、防撞。吸了潮的封装在回流焊时水汽膨胀会开裂（「爆米花」），所以有湿敏等级和烘烤要求，可靠性验证见 {@fQualify}。',
      'Epoxy encapsulates the die and wires against moisture and impact. A package that has absorbed moisture can crack when the vapour expands during reflow (“popcorning”), hence moisture sensitivity levels and bake rules; reliability qualification: {@fQualify}.',
    ),
  },
  bump: {
    title: loc('凸点（Bump）', 'Bumps'),
    text: loc(
      'Die 面上的一个个小焊球或铜柱，直接把 Die 焊到基板上，路径比键合线短得多，电感小、适合高速和大电流。凸点开裂表现为开路或电阻变大。',
      'Small solder balls or copper pillars on the die face that solder it directly to the substrate. The path is much shorter than a wire, so inductance is low and it suits high speed and high current. A cracked bump shows up as an open or higher resistance.',
    ),
  },
  underfill: {
    title: loc('底部填充胶', 'Underfill'),
    text: loc(
      '填满 Die 和基板之间的缝隙，把凸点包住。硅和基板热胀冷缩不一样，没有填充胶时凸点会在温度循环中被拉裂。',
      'Fills the gap between die and substrate and encases the bumps. Silicon and substrate expand differently with temperature; without underfill, bumps are cracked by thermal cycling.',
    ),
  },
  substrate: {
    title: loc('基板', 'Substrate'),
    text: loc(
      '一块很薄的多层小电路板，把 Die 上很密的 Pad「扇出」到底面间距大得多的锡球。Die 的 Pad 间距只有几十微米，锡球间距是 0.4–1 mm。',
      'A thin multi-layer mini circuit board that fans the die’s dense pads out to balls at a much wider pitch underneath. Die pads are tens of micrometres apart; balls are 0.4–1 mm apart.',
    ),
  },
  ball: {
    title: loc('锡球', 'Solder balls'),
    text: loc(
      '焊到电路板上的引出端。FT 时 Socket 的弹簧针就顶在这些锡球上，接触电阻和压力都会影响测量，见 {@connection}。',
      'The terminals soldered to the board. During FT, socket spring pins press on these balls; contact resistance and force both affect measurements, see {@connection}.',
    ),
  },
}

export const INSIDE: Record<InsideMode, PartId[]> = {
  wire: ['die', 'attach', 'wire', 'mold', 'substrate', 'ball'],
  flip: ['die', 'bump', 'underfill', 'substrate', 'ball'],
}

export const INSIDE_CAP = loc('剖面示意，纵向放大。真实键合线细到肉眼几乎看不见。', 'Cross-section, vertically exaggerated. Real bond wires are almost too thin to see.')

export const FLOW: Array<{ title: LText; text: LText }> = [
  {
    title: loc('背面减薄', 'Back-grind'),
    text: loc(
      '晶圆正面贴保护膜朝下，砂轮从背面磨，把 775 µm 磨到约 100–300 µm，封装才能做薄。',
      'The wafer front is taped and faces down while a grinding wheel thins it from the back, from 775 µm to about 100–300 µm, so the package can be thin.',
    ),
  },
  {
    title: loc('划片', 'Dicing'),
    text: loc(
      '晶圆贴到绷在铁环上的蓝膜上，用高速旋转的金刚石刀片（或激光）沿划片道切开，Die 仍然粘在膜上不散。',
      'The wafer is mounted on tape stretched across a metal frame and cut along the scribe lines by a fast-spinning diamond blade (or a laser); the dies stay stuck to the tape.',
    ),
  },
  {
    title: loc('粘片', 'Die attach'),
    text: loc(
      '按 CP 的晶圆图只捡好 Die：吸嘴把 Die 从膜上取下，放到涂了粘片胶的基板上，再烘烤固化。',
      'Following the CP wafer map, only good dies are picked: a vacuum collet lifts each die off the tape and places it on a substrate coated with die-attach adhesive, which is then cured.',
    ),
  },
  {
    title: loc('引线键合', 'Wire bond'),
    text: loc(
      '键合机用超声和压力，把金线或铜线一头焊在 Die 的 Pad 上，拉一个弧，另一头焊在基板焊指上。每秒能打十几根。',
      'The wire bonder uses ultrasound and force to weld one end of a gold or copper wire to a die pad, pulls a loop, and welds the other end to a substrate finger, at more than ten wires per second.',
    ),
  },
  {
    title: loc('塑封', 'Moulding'),
    text: loc(
      '把加热软化的环氧塑封料压进模具，包住 Die 和线，固化后成为黑色外壳。',
      'Heated, softened epoxy mould compound is pressed into a mould around the die and wires, and cures into the black body.',
    ),
  },
  {
    title: loc('植球', 'Ball attach'),
    text: loc('在基板底面的焊盘上放锡球，过回流炉熔化后焊牢。', 'Solder balls are placed on the pads under the substrate and reflowed in an oven to fuse them on.'),
  },
  {
    title: loc('打标、切单', 'Mark and singulate'),
    text: loc(
      '激光在顶面刻上型号和批号（用来追溯），再把整条基板切成一颗颗成品。',
      'A laser marks the part number and lot code on top (for traceability), and the substrate strip is sawn into individual parts.',
    ),
  },
  {
    title: loc('FT 成品测试', 'Final test'),
    text: loc(
      '分选机把成品压进测试座，Socket 的弹簧针顶住锡球，测试机按规格全测一遍，再按结果分 Bin。',
      'The handler presses each part into the test socket, spring pins contact the balls, the tester runs the full specification, and parts are sorted into bins by result.',
    ),
  },
]

export const FLOW_LABEL = {
  wheel: loc('砂轮', 'Grinding wheel'),
  tape: loc('保护膜', 'Protective tape'),
  before: loc('原厚 775 µm', 'Was 775 µm'),
  after: loc('约 100–300 µm', 'About 100–300 µm'),
  blade: loc('刀片', 'Blade'),
  frame: loc('铁环 + 蓝膜', 'Frame + tape'),
  collet: loc('吸嘴', 'Collet'),
  laser: loc('激光', 'Laser'),
  pusher: loc('分选机压头', 'Handler plunger'),
  socket: loc('测试座 Socket', 'Test socket'),
  cap: loc('剖面示意，纵向放大。', 'Cross-section, vertically exaggerated.'),
}

export type StageId = 'cp' | 'ft'

export const CPFT: Array<{ id: StageId; title: LText; rows: Array<{ k: LText; v: LText }> }> = [
  {
    id: 'cp',
    title: loc('CP 晶圆测试', 'CP · wafer test'),
    rows: [
      { k: loc('什么时候', 'When'), v: loc('封装前，晶圆还没切', 'Before packaging, wafer still whole') },
      { k: loc('怎么接触', 'Contact'), v: loc('探针卡上的针扎到 Die 的铝 Pad 上', 'Probe-card needles land on the die’s aluminium pads') },
      { k: loc('目的', 'Purpose'), v: loc('挑掉坏 Die，省下封装钱', 'Reject bad dies to save packaging cost') },
      {
        k: loc('局限', 'Limits'),
        v: loc('针细、路径长，大电流和最高速度不好测', 'Thin needles and long paths make high current and top speed hard to test'),
      },
    ],
  },
  {
    id: 'ft',
    title: loc('FT 成品测试', 'FT · final test'),
    rows: [
      { k: loc('什么时候', 'When'), v: loc('封装后，出厂前', 'After packaging, before shipping') },
      { k: loc('怎么接触', 'Contact'), v: loc('Socket 弹簧针顶在锡球 / 引脚上', 'Socket spring pins press on balls or leads') },
      { k: loc('目的', 'Purpose'), v: loc('抓封装引入的缺陷，按规格分 Bin', 'Catch defects added by assembly, sort into bins against the spec') },
      {
        k: loc('为什么还要测', 'Why test again'),
        v: loc('打线、塑封、植球都可能出新问题，CP 时看不到', 'Bonding, moulding and ball attach can all create new faults that CP could not see'),
      },
    ],
  },
]

export const CPFT_LABEL = {
  probeCard: loc('探针卡', 'Probe card'),
  needle: loc('探针', 'Needles'),
  wafer: loc('晶圆', 'Wafer'),
  chuck: loc('卡盘（可控温）', 'Chuck (temperature-controlled)'),
  pusher: loc('压头', 'Plunger'),
  part: loc('成品', 'Packaged part'),
  pogo: loc('弹簧针', 'Pogo pins'),
  loadboard: loc('负载板', 'Load board'),
}

export const TAKEAWAY: LText[] = [
  loc('封装三件事：保护、扇出到板子能焊的间距、散热。', 'A package does three things: protect, fan out to a solderable pitch, and remove heat.'),
  loc('DIP 通孔；SOP / QFP 鸥翼引脚在四周；QFN 焊端在底边；BGA / WLCSP 锡球铺满底面。', 'DIP is through-hole; SOP / QFP have gull-wing leads around the edge; QFN has terminals on the bottom edges; BGA / WLCSP cover the underside with balls.'),
  loc('从顶面看 1 脚在左上、逆时针编号；底视图是镜像，别数反。', 'From the top, pin 1 is upper left and numbering runs counterclockwise; the bottom view is mirrored, so do not count it backwards.'),
  loc('CP 在封装前挑坏 Die；FT 在封装后抓封装缺陷并分 Bin。两次都要。', 'CP rejects bad dies before packaging; FT catches assembly defects and bins parts after. Both are needed.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么不能把裸 Die 直接焊到电路板上？', 'Why can a bare die not be soldered straight onto a board?'),
    options: [
      { id: 'a', text: loc('Pad 太小太密、怕潮怕划，板子焊不了也护不住', 'Its pads are too small and dense, and it is vulnerable; the board cannot solder or protect it') },
      { id: 'b', text: loc('裸 Die 不导电', 'Bare dies do not conduct') },
      { id: 'c', text: loc('裸 Die 太重', 'Bare dies are too heavy') },
    ],
    answer: 'a',
    explain: loc('封装把几十微米的 Pad 扇出到毫米级间距，同时提供保护和散热。', 'The package fans tens-of-micrometre pads out to millimetre-scale pitch while protecting and cooling the die.'),
  },
  {
    id: 'q2',
    prompt: loc('BGA 的焊点为什么只能用 X 光检查？', 'Why can BGA solder joints only be inspected by X-ray?'),
    options: [
      { id: 'a', text: loc('锡球全在封装底下，被芯片本身挡住', 'All the balls are under the package, hidden by the part itself') },
      { id: 'b', text: loc('锡球是透明的', 'The balls are transparent') },
      { id: 'c', text: loc('BGA 不需要检查', 'BGA needs no inspection') },
    ],
    answer: 'a',
    explain: loc('焊点藏在底面阵列里，光学看不到。', 'The joints sit in an array underneath where optics cannot see.'),
  },
  {
    id: 'q3',
    prompt: loc('看一颗 QFN 的底视图时，1 脚标记在哪个角？', 'Looking at the bottom view of a QFN, at which corner is pin 1?'),
    options: [
      { id: 'a', text: loc('左上，和俯视图一样', 'Upper left, same as the top view') },
      { id: 'b', text: loc('右上，因为左右镜像了', 'Upper right, because the view is mirrored') },
      { id: 'c', text: loc('正中间', 'In the middle') },
    ],
    answer: 'b',
    explain: loc('翻过来看左右对调，编号也从逆时针变成顺时针。', 'Flipping it swaps left and right, and the numbering turns from counterclockwise to clockwise.'),
  },
  {
    id: 'q4',
    prompt: loc('CP 全部通过的 Die，为什么封装后还要做 FT？', 'Why do dies that passed CP still need FT after packaging?'),
    options: [
      { id: 'a', text: loc('打线、塑封等步骤会引入新的缺陷', 'Bonding, moulding and other steps can add new defects') },
      { id: 'b', text: loc('CP 的结果会过期', 'CP results expire') },
      { id: 'c', text: loc('只是习惯', 'Only out of habit') },
    ],
    answer: 'a',
    explain: loc('断线、碰线、封装裂开都发生在 CP 之后，只有 FT 能抓到。', 'Broken or touching wires and cracked packages all happen after CP; only FT can catch them.'),
  },
  {
    id: 'q5',
    prompt: loc('倒装（Flip-chip）相对打线的主要优点是？', 'What is the main advantage of flip chip over wire bond?'),
    options: [
      { id: 'a', text: loc('连接更短、电感更小，Pad 可以铺满整个面', 'Shorter connections, lower inductance, and pads can cover the whole face') },
      { id: 'b', text: loc('不需要基板', 'No substrate needed') },
      { id: 'c', text: loc('不需要测试', 'No test needed') },
    ],
    answer: 'a',
    explain: loc('凸点直接焊在基板上，适合高速、大电流、多管脚。', 'Bumps solder straight to the substrate, which suits high speed, high current and high pin count.'),
  },
]
