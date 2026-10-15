import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerSwitch: loc('电控开关', 'Voltage-controlled switch'),
  kickerTerm: loc('端子', 'Terminal'),
  kickerSym: loc('符号与封装', 'Symbol and package'),
  kickerCmp: loc('MOS 与 BJT', 'MOSFET vs BJT'),
  introTitle: loc('先把它当成一个开关', 'Start by treating it as a switch'),
  switchTitle: loc('栅极电压控制源漏通断', 'Gate voltage opens and closes the drain–source path'),
  switchNote: loc('拖动 Vgs：左边是开关类比，右边是同一个电路里真实的 NMOS。', 'Drag Vgs: the left side is the switch analogy, the right side is a real NMOS in the same circuit.'),
  vgsKnob: loc('栅源电压 Vgs', 'Gate-source voltage Vgs'),
  termTitle: loc('四个端子：G、D、S、B', 'Four terminals: G, D, S, B'),
  termNote: loc('点击符号上的端子，看它的作用。', 'Click a terminal on the symbol to see what it does.'),
  symTitle: loc('NMOS / PMOS：符号和实物封装', 'NMOS / PMOS: symbols and real packages'),
  symNote: loc(
    '点击图里的元件（符号或封装）切换 NMOS / PMOS；下面的按钮切换 3 端 / 4 端画法、增强型 / 耗尽型和封装。',
    'Click the component in the figure (symbol or package) to switch NMOS / PMOS; the buttons below switch 3- / 4-terminal drawing, enhancement / depletion and the package.',
  ),
  cmpTitle: loc('和三极管（BJT）比一比', 'Compared with the bipolar transistor (BJT)'),
  cmpNote: loc('点击表格的一行，侧栏给出原因。', 'Click a table row; the sidebar gives the reason.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('5 道题，选完立刻出对错和解释。', 'Five questions; pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('下一课把剖面切开，看 Vgs 超过 Vth 时沟道到底是怎么出现的。', 'The next lesson cuts the device open to show how the channel actually appears once Vgs passes Vth.'),
  next: loc('下一课：沟道是怎么形成的', 'Next: How the channel forms'),
  state: loc('状态', 'State'),
  on: loc('导通', 'On'),
  off: loc('关断', 'Off'),
  type: loc('类型', 'Type'),
  mode: loc('类型（沟道）', 'Kind (channel)'),
  onWhen: loc('导通条件', 'Turns on when'),
  pinout: loc('典型引脚', 'Typical pinout'),
}

export const INTRO: LText[] = [
  loc(
    '在 {@pParts} 里见过 NMOS 的符号和 SOT-23 小封装。这一课先不讲物理，只记住一句话：MOS 管是一个用电压控制的开关——栅极（G）和源极（S）之间的电压够高，漏极（D）和源极之间就接通；不够，就断开。',
    'In {@pParts} you met the NMOS symbol and its small SOT-23 package. This lesson skips the physics and keeps one idea: a MOSFET is a switch controlled by voltage. When the gate (G) to source (S) voltage is high enough, the drain (D) connects to the source; when it is not, they are disconnected.',
  ),
  loc(
    '芯片里的每个逻辑门都是几只这样的开关拼起来的（{@pDigital}）；芯片管脚的输出驱动也是一对 MOS 管，所以 {@dc} 里测的 VOH / VOL、IOH / IOL，测的就是这些开关导通时的好坏。',
    'Every logic gate inside a chip is a few of these switches put together ({@pDigital}); each output pin is driven by a pair of MOSFETs too, so the VOH / VOL and IOH / IOL measured in {@dc} measure how well these switches conduct.',
  ),
]

export const SWITCH = {
  title: loc('电压控制的开关', 'A voltage-controlled switch'),
  text: loc(
    'Vgs 低于阈值 Vth 时 D–S 之间没有导电通道，开关断开；Vgs 超过 Vth 后栅极下面形成沟道，D–S 接通。Vgs 越高沟道越“粗”，导通电阻越小。',
    'Below the threshold Vth there is no conducting path between D and S, so the switch is open; above Vth a channel forms under the gate and D–S conducts. The higher Vgs, the “wider” the channel and the lower the on-resistance.',
  ),
  why: loc(
    '为什么有一个门槛？栅极和沟道之间隔着一层绝缘的栅氧，栅压只能靠电场把电子吸到硅表面；要吸够电子、让表面从 P 型“翻转”成 N 型，电压必须超过 Vth。这个过程见 {@mosChannel}。',
    'Why is there a threshold? An insulating gate oxide separates the gate from the silicon, so the gate can only pull electrons to the surface with its electric field. Enough electrons to “invert” the P-type surface into N-type need a voltage above Vth. The process is shown in {@mosChannel}.',
  ),
  notBinary: loc(
    '注意 Vgs 刚过 Vth 时电流还很小，开关并不是“一下子”全开：要让它像一根导线，Vgs 要比 Vth 高出不少，所以数字电路让 Vgs 在 0 和 VDD 之间摆，只用全关和全开两头。',
    'Just above Vth the current is still small, so the switch does not snap fully on. To make it behave like a wire, Vgs must be well above Vth, which is why digital circuits swing Vgs between 0 and VDD and use only the fully-off and fully-on ends.',
  ),
  illustr: loc(
    '示意参数：共用教学模型 Vth = 0.7 V、k = 2 mA/V²，负载 RL = 1 kΩ，VDD = 3.3 V；电流由平方律模型求解。',
    'Illustrative values: shared teaching model with Vth = 0.7 V, k = 2 mA/V², load RL = 1 kΩ, VDD = 3.3 V; current solved from the square-law model.',
  ),
}

export type TermId = 'g' | 'd' | 's' | 'b'

export const TERMS: Array<{ id: TermId; name: string; title: LText; text: LText; link: LText }> = [
  {
    id: 'g',
    name: 'G',
    title: loc('G 栅极 Gate', 'G · Gate'),
    text: loc(
      '控制端。栅极和沟道之间隔着一层很薄的绝缘栅氧，所以直流下几乎不取电流；它和下面的硅构成一个电容，加电压就是给这个电容充电。',
      'The control terminal. A very thin insulating gate oxide separates it from the channel, so it draws almost no DC current; together with the silicon below it forms a capacitor, and applying a voltage means charging that capacitor.',
    ),
    link: loc('电容怎么让沟道出现，见 {@mosChannel}；栅电容为什么拖慢开关，见 {@mosDynamic}。', 'How this capacitor makes the channel appear: {@mosChannel}; why gate capacitance slows switching: {@mosDynamic}.'),
  },
  {
    id: 'd',
    name: 'D',
    title: loc('D 漏极 Drain', 'D · Drain'),
    text: loc(
      '电流的一端。NMOS 里电子从源极流到漏极，所以常规电流从 D 流向 S；D 通常接负载，电压比 S 高。',
      'One end of the current path. In an NMOS electrons flow from source to drain, so conventional current flows from D to S; D usually connects to the load and sits at a higher voltage than S.',
    ),
    link: loc('Vds 的大小决定管子工作在线性区还是饱和区，见 {@mosRegion}。', 'How large Vds is decides between the linear and saturation regions, see {@mosRegion}.'),
  },
  {
    id: 's',
    name: 'S',
    title: loc('S 源极 Source', 'S · Source'),
    text: loc(
      '载流子的“源头”，也是 Vgs 的参考点：开关看的是 G 相对 S 的电压，不是 G 对地的电压。NMOS 的 S 一般接低电位（地），PMOS 的 S 一般接高电位（电源）。',
      'Where the carriers come from, and the reference for Vgs: the switch responds to G relative to S, not G relative to ground. An NMOS source usually goes to the low side (ground); a PMOS source usually goes to the high side (supply).',
    ),
    link: loc('为什么高边 NMOS 的源极跟着输出走、栅压不够用，见 {@mosSwitch}。', 'Why a high-side NMOS has its source riding on the output and runs out of gate voltage: {@mosSwitch}.'),
  },
  {
    id: 'b',
    name: 'B',
    title: loc('B 体极 / 衬底 Body', 'B · Body (substrate)'),
    text: loc(
      'NMOS 做在 P 型衬底上，B 就是这块衬底。B 要接最低电位，让它和源、漏之间的 PN 结一直反偏、不导通。分立 MOS 管在管壳里就把 B 和 S 连在一起，所以外面只有 3 个脚；芯片里 NMOS 的 B 接地，PMOS（做在 N 阱里）的 B 接 VDD。',
      'An NMOS is built on a P-type substrate, and B is that substrate. B must sit at the lowest potential so its PN junctions to source and drain stay reverse-biased and never conduct. Discrete MOSFETs tie B to S inside the package, so only 3 pins come out; on a chip the NMOS body goes to ground and the PMOS body (in an N-well) goes to VDD.',
    ),
    link: loc('B 接 S 以后，B–D 之间的 PN 结就变成了体二极管，见 {@mosReal}。', 'Once B is tied to S, the B–D junction becomes the body diode, see {@mosReal}.'),
  },
]

export type MosType = 'n' | 'p'
export type SymStyle = 'three' | 'four'
export type ChanMode = 'enh' | 'dep'
export type PkgId = 'sot23' | 'to220'

export const TYPES: Array<{ id: MosType; label: string; text: LText }> = [
  {
    id: 'n',
    label: 'NMOS',
    text: loc(
      'N 沟道：沟道里导电的是电子。Vgs 为正、超过 Vth 才导通。符号里体极上的箭头指向沟道（箭头方向就是 P 型体指向 N 型沟道的 PN 结方向）。',
      'N-channel: electrons carry the current. It turns on when Vgs is positive and above Vth. In the symbol the body arrow points into the channel (the arrow follows the PN junction from the P-type body to the N-type channel).',
    ),
  },
  {
    id: 'p',
    label: 'PMOS',
    text: loc(
      'P 沟道：导电的是空穴，一切极性反过来。栅极要比源极低（Vgs 为负，低于 Vtp）才导通，所以源极接电源、栅极拉低就打开。箭头从沟道指向外面（N 型体在外，P 型沟道在里）。',
      'P-channel: holes carry the current and every polarity is reversed. The gate must be below the source (Vgs negative, below Vtp) to turn on, so the source goes to the supply and pulling the gate low opens it. The arrow points out of the channel (N-type body outside, P-type channel inside).',
    ),
  },
]

export const STYLES: Array<{ id: SymStyle; label: LText; text: LText }> = [
  {
    id: 'three',
    label: loc('3 端（B 接 S）', '3-terminal (B tied to S)'),
    text: loc('分立器件常用的画法：箭头所在的体极线直接连到源极，表示管壳里 B 已经接 S。', 'The usual drawing for discrete parts: the body line with the arrow joins the source, showing B is tied to S inside the package.'),
  },
  {
    id: 'four',
    label: loc('4 端（B 单独引出）', '4-terminal (separate B)'),
    text: loc('芯片电路图里常见：B 单独引出，NMOS 的 B 接地，PMOS 的 B 接 VDD。', 'Common in on-chip schematics: B has its own terminal; NMOS bodies go to ground and PMOS bodies to VDD.'),
  },
]

export const MODES: Array<{ id: ChanMode; label: LText; text: LText }> = [
  {
    id: 'enh',
    label: loc('增强型', 'Enhancement'),
    text: loc(
      '增强型：Vgs = 0 时没有沟道，常关；要加栅压才“增强”出沟道。所以符号里沟道画成断开的三段。芯片和大多数分立 MOS 管都是增强型。',
      'Enhancement: no channel at Vgs = 0, so it is normally off; gate voltage has to “enhance” a channel into existence. That is why the channel is drawn as three broken segments. Chips and most discrete MOSFETs are enhancement type.',
    ),
  },
  {
    id: 'dep',
    label: loc('耗尽型', 'Depletion'),
    text: loc(
      '耗尽型：制造时就做好了沟道，Vgs = 0 已经导通，常开；NMOS 要加负的 Vgs 把沟道“耗尽”才关断。符号里沟道画成一条实线。只在少数恒流源、启动电路里见到，这里只做了解。',
      'Depletion: the channel is built in during manufacture, so it already conducts at Vgs = 0 and is normally on; an NMOS needs a negative Vgs to “deplete” the channel and turn off. The channel is drawn as a solid line. You meet it only in a few current sources and start-up circuits; an overview is enough here.',
    ),
  },
]

export const PKGS: Array<{ id: PkgId; name: string; pins: [string, string, string]; parts: Record<MosType, string>; view: LText; text: LText }> = [
  {
    id: 'sot23',
    name: 'SOT-23',
    pins: ['G', 'S', 'D'],
    parts: { n: '2N7002', p: 'BSS84' },
    view: loc('俯视图', 'Top view'),
    text: loc(
      '小信号 MOS 管最常见的贴片封装，约 2.9 × 1.3 mm。俯视看，1、2 脚在同一边，3 脚单独在另一边；典型引脚 1 = G、2 = S、3 = D。NMOS（如 2N7002）和 PMOS（如 BSS84）外形完全一样，只能靠型号区分。',
      'The most common SMD package for small-signal MOSFETs, about 2.9 × 1.3 mm. From the top, pins 1 and 2 are on one side and pin 3 is alone on the other; the typical pinout is 1 = G, 2 = S, 3 = D. An NMOS (e.g. 2N7002) and a PMOS (e.g. BSS84) look exactly alike; only the part number tells them apart.',
    ),
  },
  {
    id: 'to220',
    name: 'TO-220',
    pins: ['G', 'D', 'S'],
    parts: { n: 'IRF540N', p: 'IRF9540N' },
    view: loc('印字面朝自己，引脚朝下', 'Marked side toward you, leads down'),
    text: loc(
      '功率 MOS 管常用的插件封装。印字面朝自己、引脚朝下，从左到右典型是 G、D、S；上面带孔的金属片就是漏极 D，用来拧到散热器上——所以金属片和散热器之间要不要绝缘，要看电路。',
      'A common through-hole package for power MOSFETs. With the marked side toward you and leads down, the typical order left to right is G, D, S; the metal tab with the hole is the drain D and bolts to a heatsink, so whether the tab must be insulated from the heatsink depends on the circuit.',
    ),
  },
]

export const PKG_LINE = loc(
  '外形看不出 NMOS 还是 PMOS，引脚顺序也有例外：焊之前一定对照数据手册，选型方法见 {@mosSelect}。',
  'The package does not reveal NMOS or PMOS, and pinouts have exceptions: always check the datasheet before soldering; how to choose a part is covered in {@mosSelect}.',
)
