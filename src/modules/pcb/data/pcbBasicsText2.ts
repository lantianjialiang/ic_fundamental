import { loc, type LText } from '../../../i18n/locale'

export type PourId = 'solid' | 'relief' | 'island'

export const POUR_S = {
  title: loc('铺铜、热焊盘与孤岛', 'Copper pour, thermal reliefs and islands'),
  note: loc('切换三种情况，看焊盘怎么接进铜皮，以及为什么。', 'Switch between three cases to see how a pad joins the pour, and why.'),
  kicker: loc('铺铜', 'Copper pour'),
  spoke: loc('辐条宽度', 'Spoke width'),
  spokeI: loc('4 根辐条合计载流', 'Four spokes carry'),
  assume: loc('外层 1 oz、ΔT = 20 °C，按 IPC-2221 估算', 'External 1 oz, ΔT = 20 °C, IPC-2221 estimate'),
  cap: loc(
    '通孔焊盘（孔 + 环）放在大铜皮里的三种情况，按真实比例（焊盘直径 1.8 mm，孔 1.0 mm）。铜皮是金色，浅色环带是铜皮与焊盘之间被挖掉的间隙。',
    'A through-hole pad (hole plus ring) in a large pour, in three cases, to scale (1.8 mm pad, 1.0 mm hole). The pour is gold; the pale ring is the gap cleared between pour and pad.',
  ),
}

export const POURS: Array<{ id: PourId; title: LText; text: LText }> = [
  {
    id: 'solid',
    title: loc('全连接', 'Solid connection'),
    text: loc(
      '焊盘和铜皮直接连成一片：电流和散热最好，电感最小。但焊接时铜皮像散热片，烙铁或回流的热量被大铜皮立刻带走，焊盘升不到焊料熔点，就会冷焊、孔里爬锡不满；小元件两端散热不同还会立碑。所以接地大铜皮上的通孔脚和小元件不要全连接。',
      'The pad merges with the pour: best current and heat flow, lowest inductance. But in soldering the pour acts as a heatsink and carries the iron\'s or oven\'s heat away at once, so the pad never reaches solder melting temperature, giving cold joints and poor hole fill; small parts with unequal heat sinking at their two ends can tombstone. So do not fully connect through-hole pins and small parts to a big ground pour.',
    ),
  },
  {
    id: 'relief',
    title: loc('热焊盘（花焊盘）', 'Thermal relief'),
    text: loc(
      '在焊盘周围挖一圈间隙，只留 2–4 根细辐条连到铜皮。辐条细，热量不能很快流走，焊接时焊盘能升温，焊点可靠；代价是辐条限制了电流，也让电感稍大。辐条总宽要够电源电流：电流大的脚要加宽辐条或不用热焊盘并改用多个过孔散热。',
      'Clear a gap around the pad and leave only 2–4 thin spokes to the pour. Thin spokes keep heat from draining away, so the pad warms up during soldering and the joint is reliable; the price is that the spokes limit current and add a little inductance. The total spoke width must carry the supply current: for high-current pins widen the spokes, or skip the relief and use more vias for the heat.',
    ),
  },
  {
    id: 'island',
    title: loc('孤岛', 'Island'),
    text: loc(
      '孤岛是铺铜里没有连到任何网络的一块铜：线把铜皮切成了两块，其中一块没有出路。它像天线，会耦合和辐射噪声；窄条还可能在蚀刻或使用中剥落成碎屑。所以孤岛要删掉，或者用过孔把它接到地，大多数软件有「删除死铜」的选项。',
      'An island is a piece of pour not connected to any net: traces cut the pour in two and one part is left with no exit. It acts as an antenna, coupling and radiating noise, and a narrow sliver can flake off during etching or in use. Remove islands, or stitch them to ground with a via; most tools have a remove-dead-copper option.',
    ),
  },
]

export type MarkId = 'silk' | 'polar' | 'fid' | 'tp'

export const MARKS_S = {
  title: loc('丝印、极性标识、Fiducial 与测试点', 'Silkscreen, polarity marks, fiducials and test points'),
  note: loc('点板上的标记，或点下面的按钮，看每种标记的规则和原因。', 'Click a mark on the board or a button below to see its rules and reasons.'),
  kicker: loc('标记', 'Marks'),
  open: loc('阻焊开窗直径', 'Mask opening diameter'),
  ring: loc('铜点外的净空', 'Clear ring around the dot'),
  dot: loc('铜点直径', 'Copper dot'),
  cap: loc(
    '示意图。左：一小块板上的丝印、极性标记、全局和局部 Fiducial、测试点；右：Fiducial 放大，中间是 1 mm 铜点，外面是阻焊开窗，开窗里不许有铜、丝印和阻焊。',
    'Illustration. Left: silkscreen, polarity marks, global and local fiducials and a test point on a small board. Right: a fiducial enlarged, a 1 mm copper dot inside a mask opening; the opening must hold no copper, silk or mask.',
  ),
}

export const MARKS: Array<{ id: MarkId; title: LText; text: LText }> = [
  {
    id: 'silk',
    title: loc('丝印', 'Silkscreen'),
    text: loc(
      '丝印是印在阻焊上的白色字符和轮廓：位号、元件外框、1 脚、版本号、板名。丝印不能压在焊盘上（油墨沾在铜上会焊不上），文字线宽一般不小于 0.15 mm、高度不小于 1 mm，否则印出来糊成一团。位号方向尽量统一，装好元件后仍要看得见。',
      'Silkscreen is white text and outline printed over the solder mask: designators, part outlines, pin 1, revision and board name. It must not touch pads (ink on copper blocks soldering). Keep strokes at least about 0.15 mm and text at least about 1 mm high, or it prints as a blur. Keep designator orientation consistent and visible after the parts are placed.',
    ),
  },
  {
    id: 'polar',
    title: loc('极性标识', 'Polarity marks'),
    text: loc(
      '有方向的元件必须在丝印上标出方向：二极管画阴极的竖线，电解和钽电容标正极的 +，集成电路用圆点或缺口标 1 脚，LED 标阴极，连接器标 1 脚。标识要放在元件装好后仍然能看到的位置，不要被元件本体盖住。装反的电解电容会鼓包甚至炸。',
      'Parts with a direction need it on the silkscreen: a bar on the diode cathode, a + on electrolytic and tantalum capacitors, a dot or notch at IC pin 1, the LED cathode, pin 1 on connectors. Place the mark where it is still visible once the part is on, not under the body. A reversed electrolytic can swell or burst.',
    ),
  },
  {
    id: 'fid',
    title: loc('Fiducial 标记点', 'Fiducial marks'),
    text: loc(
      'Fiducial 是给贴片机相机看的定位标记：一个直径 1 mm 的裸铜圆点，周围阻焊开窗直径 2–3 mm，开窗内不放铜、丝印和阻焊，这样对比度才够。全局 Fiducial 放在板子（或拼板）对角的两到三个位置，用来校正整块板的位置和涨缩；局部 Fiducial 放在细间距元件（QFP、QFN、BGA）对角，用来校正这一个元件的位置。离板边至少 3–5 mm，以便夹具夹持。',
      'A fiducial is a registration mark for the pick-and-place camera: a bare copper dot 1 mm across, with a solder-mask opening of 2–3 mm; the opening holds no copper, silk or mask, which gives the camera contrast. Global fiducials sit at two or three corners of the board (or panel) and correct the position and scaling of the whole board; local fiducials sit at opposite corners of a fine-pitch part (QFP, QFN, BGA) and correct that one part. Keep them at least 3–5 mm from the edge so the rails can grip.',
    ),
  },
  {
    id: 'tp',
    title: loc('测试点', 'Test points'),
    text: loc(
      '测试点是为探针留的裸铜圆点，直径 1.0–1.5 mm、不盖阻焊，放在电源、地、关键信号、编程和调试口的网络上，位号 TP。ICT 针床和飞针靠它接触，调试时示波器探头也能搭上；间距按探针要求（常见 2.54 mm 的整数倍）、尽量集中在一面。没留测试点，量产和故障分析都会很痛苦。',
      'A test point is a bare copper dot left for probes, 1.0–1.5 mm across with no mask over it, on power, ground, key signals and the programming and debug nets, designated TP. ICT bed-of-nails and flying probes land on it, and a scope probe can hook onto it while debugging; spacing follows the probe requirement (commonly multiples of 2.54 mm) and they are best gathered on one side. Without test points, production and failure analysis both hurt.',
    ),
  },
]
