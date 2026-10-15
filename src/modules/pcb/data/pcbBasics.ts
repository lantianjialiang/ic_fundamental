import { loc, type LText } from '../../../i18n/locale'

export const S = {
  introTitle: loc('先把几个词说准', 'Get the words right first'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  next: loc('下一课：布局与布线原则', 'Next: Placement and routing principles'),
  asideLater: loc(
    '这些量怎么落到叠层上见 {@pcbStack}；放置和走线的原则见 {@pcbLayout}；交板厂前的自查见 {@pcbDfm}；板子怎么贴片见 {@pcbSupply}。',
    'How these quantities land on the stack-up: {@pcbStack}; placement and routing rules: {@pcbLayout}; the self-check before sending to the fab: {@pcbDfm}; how boards are assembled: {@pcbSupply}.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '这一课是后面所有设计动作的词汇和数字基础：什么叫网络和位号，一根线能走多大电流，两根线要离多远，大面积铺铜为什么要「花焊盘」，哪些标记要放在板上，阻抗跟什么有关，一个封装的焊盘怎样变成钢网开口。',
    'This lesson is the vocabulary and the numbers behind every later design move: what a net and a reference designator are, how much current a trace carries, how far apart two traces must be, why a copper pour needs thermal reliefs, which marks go on the board, what impedance depends on, and how a footprint pad becomes a stencil aperture.',
  ),
  loc(
    '页面里的数字都由公式实时算出，公式是经验式或近似式，用来估算和理解趋势；最终数值要对照器件手册、安规标准和板厂的工艺能力。封装从哪里来见 {@pcbFlow}，封装本身的类型见 {@pPackage}。',
    'Every number here is computed live from a formula. The formulas are empirical or approximate: use them to estimate and to see trends, then confirm against datasheets, safety standards and the fab\'s capability. Where footprints come from: {@pcbFlow}; the package types themselves: {@pPackage}.',
  ),
]

export type TermId = 'net' | 'netlist' | 'refdes' | 'comp' | 'pad' | 'via'

export const TERMS: Array<{ id: TermId; title: LText; text: LText; pit: LText }> = [
  {
    id: 'net',
    title: loc('网络 Net', 'Net'),
    text: loc(
      '网络是「在电气上连在一起的一组引脚」，同一个网络上任意两点电压相同（忽略铜线电阻）。图中 3V3 这个网络连着 R1 的 1 脚、U1 的 3 脚和 C1 的 1 脚；不管线怎么拐，它们是同一个网络。每个网络有名字，名字相同就算连通。',
      'A net is a set of pins that are electrically tied together; any two points on it are at the same voltage (ignoring copper resistance). The 3V3 net here joins R1 pin 1, U1 pin 3 and C1 pin 1; however the copper bends, it is one net. Every net has a name, and equal names mean connected.',
    ),
    pit: loc('网络名拼错（3V3 写成 3v3_）会变成两个网络，板子上就是开路。', 'A misspelt net name (3V3 vs 3v3_) becomes two nets, which is an open circuit on the board.'),
  },
  {
    id: 'netlist',
    title: loc('网表 Netlist', 'Netlist'),
    text: loc(
      '网表是原理图交给 PCB 的连接清单：每个网络一行，列出它连到哪些「位号.引脚」。PCB 软件拿网表生成飞线，布线完成后再用它核对有没有漏连或多连。网表只说「谁连谁」，不说线多宽、走哪里。',
      'The netlist is the connection list the schematic hands to the PCB: one line per net, listing the "designator.pin" entries it touches. The PCB tool builds ratsnest lines from it and checks the finished routing against it for missing or extra connections. It says who connects to whom, not how wide or where.',
    ),
    pit: loc('改了原理图却忘了更新到 PCB，网表和板子就对不上。', 'Editing the schematic without updating the PCB leaves the netlist and the board out of step.'),
  },
  {
    id: 'refdes',
    title: loc('位号 Reference designator', 'Reference designator'),
    text: loc(
      '位号是每个元件在板上的唯一名字：字母表示类型，数字表示序号。R 电阻、C 电容、L 电感、D 二极管、Q 晶体管、U 集成电路、J 连接器、TP 测试点。位号印在丝印上，装配和维修都靠它找元件，BOM 也按位号分组。',
      'The reference designator is each part\'s unique name on the board: a letter for the type and a number for the sequence. R resistor, C capacitor, L inductor, D diode, Q transistor, U integrated circuit, J connector, TP test point. It is printed on the silkscreen and used to find parts during assembly and repair; the BOM groups parts by it.',
    ),
    pit: loc('位号重复（两个 R1）会让 BOM 和贴片坐标出错，必须全板唯一。', 'A duplicated designator (two R1) corrupts the BOM and the pick-and-place file; it must be unique across the board.'),
  },
  {
    id: 'comp',
    title: loc('元件 Component', 'Component'),
    text: loc(
      '元件是实物零件，PCB 上用它的「封装」表示：封装 = 焊盘图形加外形轮廓。同一个电阻值可以有 0402、0603、0805 多种封装，选哪个封装决定焊盘大小。元件的体积、高度还决定了布局时要留多少空间。',
      'A component is the physical part; on the PCB it is represented by its footprint: a pad pattern plus an outline. One resistor value can come in 0402, 0603 or 0805, and the footprint chosen sets the pad size. Body size and height also decide how much room placement must leave.',
    ),
    pit: loc('原理图符号对、封装选错，是最常见的返工原因（见 {@pcbFlow}）。', 'A correct schematic symbol with the wrong footprint is one of the most common causes of rework (see {@pcbFlow}).'),
  },
  {
    id: 'pad',
    title: loc('焊盘 Pad', 'Pad'),
    text: loc(
      '焊盘是元件引脚焊接的那块裸露铜。表贴焊盘只在一层，通孔焊盘每一层都有环形铜。焊盘比引脚大一圈，焊料才能爬上引脚形成焊脚；阻焊在焊盘处开窗，让铜露出来。',
      'A pad is the exposed copper where a lead is soldered. A surface-mount pad exists on one layer; a through-hole pad has a ring of copper on every layer. It is larger than the lead so solder can climb it and form a fillet; the solder mask opens over it to expose the copper.',
    ),
    pit: loc('焊盘比引脚小，焊料爬不上去，焊点强度不够。', 'A pad smaller than the lead gives no room for a fillet and the joint is weak.'),
  },
  {
    id: 'via',
    title: loc('过孔 Via', 'Via'),
    text: loc(
      '过孔是孔壁镀铜的小孔，用来把一层的线接到另一层。图中 GND 走线上的过孔把顶层地接到底层的地平面。过孔不焊元件，所以通常被阻焊盖住；类型和孔环见 {@pcbStack}。',
      'A via is a plated-through hole that joins a trace on one layer to another. The via on the GND trace here ties top-layer ground to the ground plane below. Vias carry no part, so they are normally covered with solder mask; types and annular rings are in {@pcbStack}.',
    ),
    pit: loc('电源线上只放一个小过孔，会成为电流瓶颈，大电流要多打几个。', 'A single small via on a power trace becomes a current bottleneck; carry large current through several vias.'),
  },
]

export const TERMS_S = {
  title: loc('网络、网表、位号、元件、焊盘、过孔', 'Nets, netlist, designators, components, pads and vias'),
  note: loc(
    '点板子上的东西，或点下面的按钮：点线是网络，点 R1 / C1 / U1 文字是位号，点元件的方块是元件，点铜块是焊盘，点圆环是过孔，点右边的清单是网表。',
    'Click things on the board or the buttons below: a trace is a net, the R1 / C1 / U1 text is a designator, a part body is a component, a copper rectangle is a pad, the ring is a via, and the list on the right is the netlist.',
  ),
  kicker: loc('术语', 'Term'),
  cap: loc(
    '顶视图示意。三个元件、三个网络：3V3 连 R1.1、U1.3、C1.1；SIG 连 R1.2、U1.1；GND 连 U1.2、C1.2，并通过过孔到底层地平面。',
    'Top-view illustration. Three parts, three nets: 3V3 joins R1.1, U1.3 and C1.1; SIG joins R1.2 and U1.1; GND joins U1.2 and C1.2 and drops through a via to the ground plane below.',
  ),
}
