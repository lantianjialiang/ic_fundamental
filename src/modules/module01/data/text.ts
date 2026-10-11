import { loc, type LText } from '../../../i18n/locale'
import type { ContactPhase, LayerId, TestFlow } from './layout'

/** D02 课所有学生可见文字（中英双语） */
export const T = {
  flowGroup: loc('测试流程', 'Test flow'),
  ft: loc('FT 成品测试', 'FT final test'),
  cp: loc('CP 晶圆测试', 'CP wafer sort'),
  explode: loc('分解', 'Explode'),
  assemble: loc('组装', 'Assemble'),
  contact: loc('接触动画', 'Contact animation'),
  contactReplay: loc('重播接触动画', 'Replay contact'),
  section: loc('剖开', 'Cutaway'),
  pkgGroup: loc('封装', 'Package'),
  bga: loc('BGA', 'BGA'),
  qfp: loc('QFP', 'QFP'),
  probeGroup: loc('探针类型', 'Probe type'),
  cantilever: loc('悬臂针', 'Cantilever'),
  vertical: loc('垂直针', 'Vertical'),
  labels: loc('3D 标注', '3D labels'),
  resetView: loc('重置视角', 'Reset view'),
  hint: loc(
    '左键 360° 旋转 · 滚轮缩放 · 右键平移 · 点板上的走线或侧栏通道看信号路径',
    'Left-drag to orbit 360° · wheel zoom · right-drag pan · click a board trace or a channel in the panel',
  ),
  next: loc('下一课：ATE 里面有什么', 'Next: What is inside an ATE?'),
  stageAria: loc('3D 测试工位', '3D test cell'),
  scaleNote: loc(
    '为看清结构，尺寸已放大；真实测试机有数百到上千路通道，这里用 16 路示意。',
    'Sizes are enlarged for clarity; a real tester has hundreds to thousands of channels — 16 are shown here.',
  ),
  scaleShort: loc('尺寸已放大 · 16 路通道示意', 'Enlarged scale · 16 channels shown'),

  layersTitle: loc('叠层结构', 'Stack'),
  layersHint: loc('点某一层：镜头对准并框出它，再点一次取消。', 'Click a layer to focus the camera on it; click again to release.'),
  channelsTitle: loc('通道', 'Channels'),
  pathTitle: loc('信号路径', 'Signal path'),
  noChannel: loc('选一个通道，或在 3D 中点 Load Board / Probe Card 上的走线。', 'Pick a channel, or click a trace on the Load Board / Probe Card in 3D.'),
  clear: loc('清除选择', 'Clear selection'),
  pathViewGroup: loc('路径显示方式', 'Path view'),
  pathOnly: loc('只看路径', 'Path only'),
  showAll: loc('显示全部', 'Show all'),
  pathOnlyHint: loc(
    '只看路径：其它部件变得几乎透明，只留下这一路真正经过的零件发光——通道板、那根 Pogo 针、板上的焊盘 / 走线 / 过孔，以及 FT 的 Socket 针和锡球、CP 的空间转换器、探针和 die pad。',
    'Path only: everything else turns nearly transparent and only the parts this channel actually passes through glow — the channel card, its pogo pin, the pads / traces / vias on the board, plus the socket pin and solder ball (FT) or the space transformer, probe and die pad (CP).',
  ),
  pcbTitle: loc('PCB 层', 'PCB layers'),
  pcbText: loc(
    'Load Board 是 8 层板：板边能看到绿油、铜箔、FR4 介质一层层交替。表面绿色的是阻焊绿油 (solder mask)，焊盘处开窗露出沉金；白字是丝印 (silkscreen)，标出位号 C/R/K/J/TP 和 PIN 1。示意走线：底层 L8 → 过孔 → 内层 L3 → 过孔 → 顶层 L1。分解、剖开或选中通道时板子变半透明；剖开后切口能看到各层铜箔和贯穿全板的过孔。',
    'The load board is an 8-layer PCB: its edge shows solder mask, copper and FR4 dielectric alternating. The green coat is solder mask, opened over the gold (ENIG) pads; the white print is silkscreen marking reference designators C/R/K/J/TP and PIN 1. Example route: bottom L8 → via → inner L3 → via → top L1. The board turns see-through when exploded, cut away or a channel is selected; the cutaway face shows every copper layer and vias running through the whole board.',
  ),
  phaseTitle: loc('接触动画', 'Contact sequence'),
  phaseIdle: loc('点工具栏「接触动画」观看压接 / 扎针全过程。', 'Press “Contact animation” in the toolbar to watch the docking / probing sequence.'),
  stepOf: loc('第 {i} / {n} 步', 'Step {i} of {n}'),
  pulseLegend: loc('金色 = 去程（ATE 驱动）· 蓝色 = 回程（DUT 响应）', 'Gold = outbound (ATE drive) · Blue = return (DUT response)'),

  bgaSub: loc('BGA · 底部 100 颗锡球', 'BGA · 100 solder balls'),
  qfpSub: loc('QFP · 四边 64 根鸥翼引脚', 'QFP · 64 gull-wing leads'),
  mainframe: loc('Mainframe 主机柜', 'Mainframe'),
  mainframeSub: loc('电源 / 同步 / 数据，经电缆连到测试头', 'Power, sync and data — cabled to the test head'),
  cards: loc('通道板 (Pin Electronics)', 'Channel cards (pin electronics)'),
  notch: loc('Notch 定位口', 'Notch'),
  dutDie: loc('被测 die', 'Die under test'),
  st: loc('空间转换器', 'Space transformer'),
  stiffener: loc('加强板', 'Stiffener'),
} as const

/** 路径显示方式：数组顺序即按钮顺序，初始值取第一个（只看路径） */
export const PATH_VIEWS = [
  { id: 'path', pathOnly: true, label: T.pathOnly },
  { id: 'all', pathOnly: false, label: T.showAll },
] as const

type LayerText = { name: LText; sub: LText; desc: LText }

export const LAYER_TEXT: Record<TestFlow, Partial<Record<LayerId, LayerText>>> = {
  FT: {
    handler: {
      name: loc('Handler 压头', 'Handler plunger'),
      sub: loc('吸嘴 + 压头', 'Nozzle + plunger'),
      desc: loc(
        '分选机 (Handler) 的测试臂：吸嘴吸住芯片，压头把它压进 Socket，测完再按结果分 bin。',
        'The handler’s test arm: a vacuum nozzle picks the device, the plunger presses it into the socket, then bins it by result.',
      ),
    },
    dut: {
      name: loc('DUT 封装芯片', 'DUT (packaged device)'),
      sub: loc('被测器件', 'Device under test'),
      desc: loc(
        '被测器件。BGA 底部是锡球阵列，QFP 四边是鸥翼引脚；顶面激光打标和 pin 1 圆点。',
        'The device under test. A BGA has a solder-ball array underneath, a QFP has gull-wing leads on four sides; the top carries laser marking and a pin-1 dot.',
      ),
    },
    socket: {
      name: loc('Socket 测试座', 'Socket'),
      sub: loc('定位腔 + 弹簧针阵列', 'Pocket + pogo-pin array'),
      desc: loc(
        '定位腔把芯片对准，里面一根根弹簧针 (pogo pin) 把芯片引脚接到 Load Board。可插拔、会磨损，要定期更换。',
        'The pocket aligns the device; an array of spring-loaded pogo pins links each lead to the load board. Removable and wears out, so it is replaced regularly.',
      ),
    },
    loadboard: {
      name: loc('Load Board / DIB', 'Load Board / DIB'),
      sub: loc('8 层 PCB · 绿油 · 丝印 · 沉金焊盘', '8-layer PCB · mask · silk · ENIG'),
      desc: loc(
        '每种芯片专用的 8 层接口板：把 Socket 下的细间距焊盘经过孔和内层扇出到测试头通道；板上有旁路电容、串联电阻、测试点、继电器和连接器，丝印标着每个器件的位号。',
        'A device-specific 8-layer interface board: vias and inner layers fan the fine-pitch socket pads out to tester channels. It carries bypass capacitors, series resistors, test points, relays and connectors, each labeled in silkscreen.',
      ),
    },
    pogo: {
      name: loc('Pogo Tower 接口塔', 'Pogo Tower'),
      sub: loc('方框内的弹簧针块', 'Pogo blocks in a frame'),
      desc: loc(
        '一排排弹簧针块，把测试头通道板和 Load Board 压接起来；换 Load Board 不用焊接。',
        'Rows of pogo blocks press the test-head channel cards against the load board, so boards can be swapped without soldering.',
      ),
    },
    testhead: {
      name: loc('Test Head 测试头', 'Test Head'),
      sub: loc('对接框 + 通道板', 'Docking frame + channel cards'),
      desc: loc(
        '测试机离 DUT 最近的部分，里面插着通道板 (Pin Electronics)，每一路驱动 / 比较信号都从这里出发；经电缆连到主机柜。',
        'The part of the tester closest to the DUT. Channel cards (pin electronics) inside drive and compare every signal; cables run back to the mainframe.',
      ),
    },
  },
  CP: {
    testhead: {
      name: loc('Test Head 测试头', 'Test Head'),
      sub: loc('翻转朝下扣在 Prober 上', 'Flipped, docked onto the prober'),
      desc: loc(
        'CP 时测试头翻转朝下，对接到探针台 (Prober) 上；通道板仍是信号的起点。',
        'For wafer sort the test head is flipped and docked onto the prober; the channel cards are still where signals start.',
      ),
    },
    pogo: {
      name: loc('Pogo Tower 接口塔', 'Pogo Tower'),
      sub: loc('环形弹簧针块', 'Ring of pogo blocks'),
      desc: loc(
        '环形排列的弹簧针块，压在探针卡边缘那一圈焊盘上。',
        'Pogo blocks arranged in a ring press onto the ring of pads at the probe-card edge.',
      ),
    },
    probecard: {
      name: loc('Probe Card 探针卡', 'Probe Card'),
      sub: loc('加强板 · 圆 PCB · 空间转换器 · 探针', 'Stiffener · round PCB · space transformer · probes'),
      desc: loc(
        '顶部金属加强板防变形；大圆 PCB 边缘一圈焊盘接 Pogo；中央空间转换器把间距缩小到针距；探针扎在 die 的 pad 上。',
        'A metal stiffener keeps it flat; the round PCB has a ring of pogo pads at the edge; the central space transformer shrinks the pitch down to probe pitch; the probes land on die pads.',
      ),
    },
    wafer: {
      name: loc('晶圆 Wafer', 'Wafer'),
      sub: loc('数百颗 die · notch 定位', 'Hundreds of dies · notch'),
      desc: loc(
        '一片晶圆上有数百颗 die，notch 缺口用来定方向；高亮的是当前被测 die。',
        'A wafer carries hundreds of dies; the notch fixes its orientation. The highlighted die is the one under test.',
      ),
    },
    chuck: {
      name: loc('Prober Chuck 吸盘', 'Prober chuck'),
      sub: loc('真空吸盘 · 同心槽', 'Vacuum chuck · concentric grooves'),
      desc: loc(
        '真空吸盘吸住晶圆，在 XY 方向把被测 die 移到针下，再沿 Z 上升接触探针。',
        'The vacuum chuck holds the wafer, moves the target die under the probes in XY, then rises in Z to touch down.',
      ),
    },
  },
}

export const PHASE_TEXT: Record<ContactPhase, LText> = {
  idle: T.phaseIdle,
  load: loc('Handler 吸嘴吸住 DUT，移到 Socket 正上方', 'The handler nozzle holds the DUT and moves it over the socket'),
  press: loc('压头下压，DUT 沿定位腔落入 Socket', 'The plunger descends; the DUT drops into the socket pocket'),
  compress: loc('继续下压：弹簧针被压缩，接触可靠', 'More force: the pogo pins compress for a reliable contact'),
  align: loc('Prober 把被测 die 移到探针正下方', 'The prober moves the target die under the probes'),
  rise: loc('Chuck 上升，针尖着陆 (touchdown)', 'The chuck rises — the probe tips touch down'),
  overdrive: loc(
    '过驱动 (overdrive)：再抬一点，针微弯，针尖在 pad 上划出 scrub 痕',
    'Overdrive: a little more lift bends the probes and the tips scrub a mark into the pads',
  ),
  signal: loc(
    '信号脉冲：从 Test Head 出发到 DUT，再沿原路返回',
    'Signal pulse: from the test head to the DUT and back along the same path',
  ),
  done: loc('接触完成，可以开始测试了。', 'Contact made — ready to test.'),
}

export const HOP_TEXT = {
  pe: loc('Test Head 通道板：驱动器 / 比较器', 'Test head channel card: driver / comparator'),
  cardEdge: loc('通道板金手指 → 接口', 'Card edge fingers → interface'),
  pogoTower: loc('Pogo Tower 弹簧针', 'Pogo tower pin'),
  lbBottom: loc('Load Board 底层焊盘（L8）', 'Load board bottom pad (L8)'),
  ftVia1: loc('过孔 1：底层 L8 → 内层 L3', 'Via 1: bottom L8 → inner L3'),
  ftVia2: loc('过孔 2：内层 L3 → 顶层 L1', 'Via 2: inner L3 → top L1'),
  inner: loc('内层走线', 'Inner-layer track'),
  lbTop: loc('Load Board 顶层焊盘（L1）', 'Load board top pad (L1)'),
  socketPin: loc('Socket 弹簧针', 'Socket pogo pin'),
  dutBall: loc('DUT 锡球 {name}', 'DUT ball {name}'),
  dutLead: loc('DUT 引脚 Pin {name}', 'DUT lead pin {name}'),
  dutDie: loc('封装内部 → 芯片 die', 'Inside the package → die'),
  pcTop: loc('Probe Card 边缘焊盘', 'Probe card edge pad'),
  cpVia1: loc('过孔 1：顶层 → 内层', 'Via 1: top → inner'),
  cpVia2: loc('过孔 2：内层 → 底层', 'Via 2: inner → bottom'),
  st: loc('空间转换器：间距缩小到针距', 'Space transformer: pitch shrinks to probe pitch'),
  needleCantilever: loc('悬臂针', 'Cantilever probe'),
  needleVertical: loc('垂直针', 'Vertical probe'),
  diePad: loc('Die pad {name}', 'Die pad {name}'),
} as const
