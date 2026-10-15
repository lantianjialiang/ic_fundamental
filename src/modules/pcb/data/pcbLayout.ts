import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerBoard: loc('好布局与坏布局', 'Good vs bad layout'),
  kickerDecap: loc('去耦电容', 'Decoupling'),
  kickerReturn: loc('回流路径', 'Return path'),
  kickerRules: loc('走线与专项规则', 'Routing and special rules'),
  introTitle: loc('先摆再连：布局决定了一半的成败', 'Place first, route second: placement decides half the outcome'),
  next: loc('下一课：工具与实操（Altium）', 'Next: Tools in practice (Altium)'),
  asideLater: loc(
    '叠层怎么给信号一个完整的参考平面见 {@pcbStack}；线宽、阻抗、热焊盘的数字见 {@pcbBasics}；开关电流突变为什么会让电压跌落见 {@mosDynamic}；测试板上同样的规则见 {@connection} 和 {@fProgram}；探头地线的回路见 {@pMeasure}。',
    'How the stack-up gives a signal a complete reference plane: {@pcbStack}; the numbers for width, impedance and thermal reliefs: {@pcbBasics}; why a sudden switching current makes the voltage dip: {@mosDynamic}; the same rules on test boards: {@connection} and {@fProgram}; the loop of a probe ground lead: {@pMeasure}.',
  ),
  boardTitle: loc('同一块小板：好布局和坏布局', 'The same small board, laid out badly and well'),
  boardNote: loc(
    '板上有 USB 插座、LDO、MCU、晶振和去耦电容。先看「坏布局」，点图上带编号的红框，每一处都按「问题 → 原因 → 改法」讲；再切到「好布局」，同样的位置看它是怎么摆的。底层假定是完整的地平面。',
    'The board has a USB receptacle, an LDO, an MCU, a crystal and decoupling capacitors. Start with the bad layout and click the numbered red boxes; each one goes problem, reason, fix. Then switch to the good layout and look at the same spots. The bottom layer is assumed to be a solid ground plane.',
  ),
  viewBad: loc('坏布局', 'Bad layout'),
  viewGood: loc('好布局', 'Good layout'),
  lblProblem: loc('问题：', 'Problem: '),
  lblReason: loc('原因：', 'Why: '),
  lblFix: loc('改法：', 'Fix: '),
  lblGood: loc('好布局里：', 'In the good layout: '),
  boardCapBad: loc(
    '示意（不按比例）：坏布局，点编号看问题。虚线框是底层地平面上的一道槽。',
    'Illustration (not to scale): the bad layout. Click a number for the problem. The dashed bar is a slot in the bottom-layer ground plane.',
  ),
  boardCapGood: loc(
    '示意（不按比例）：好布局，点编号看它怎么做。三块底色是功能分区：接口、电源、MCU 数字区。',
    'Illustration (not to scale): the good layout. Click a number to see how it is done. The three tints are the function zones: interface, power, MCU digital.',
  ),
  zoneIf: loc('接口区', 'Interface'),
  zonePw: loc('电源区', 'Power'),
  zoneMcu: loc('MCU 区', 'MCU'),
  principleTitle: loc('这些原则背后的道理', 'The reasoning behind the principles'),
  decapTitle: loc('去耦电容：离引脚多近才算近', 'Decoupling capacitors: how close is close'),
  decapNote: loc(
    '芯片内部开关时要在几纳秒内多拿一点电流，只有紧挨引脚的电容能及时给。选一种摆法，看电流环（阴影）有多大，以及由此算出的电感和电压跌落。',
    'When the chip switches inside it needs extra current within a few nanoseconds, and only a capacitor right next to the pin can supply it in time. Pick a placement, then look at the current loop (shaded) and the inductance and voltage dip computed from it.',
  ),
  decapModel: loc(
    '示意参数：0402 电容自身 0.5 nH，每个过孔 0.4 nH，参考平面上方的走线约 0.8 nH/mm，1 mm 画 12 像素；电流阶跃 50 mA、1 ns。数值只用来比较大小，不是任何一块板的实测值。',
    'Illustrative parameters: 0402 capacitor 0.5 nH itself, 0.4 nH per via, about 0.8 nH/mm of trace over a reference plane, 1 mm drawn as 12 px; current step 50 mA in 1 ns. The numbers are for comparing sizes only, not measurements of a real board.',
  ),
  rdLoop: loc('回路电感', 'Loop inductance'),
  rdZ: loc('100 MHz 阻抗', 'Impedance at 100 MHz'),
  rdDip: loc('电压跌落', 'Voltage dip'),
  returnTitle: loc('回流路径：电流总要回到源头', 'Return path: current always returns to its source'),
  returnNote: loc(
    '俯视图是一根走线和下面的地平面，下方是在 A–A 处的横截面。切换「完整 / 开槽」和「低频 / 高频」，看回流电流（蓝点）走哪里，右边的读数是回路面积相对「完整平面、高频」的倍数。',
    'The top view shows one trace over a ground plane; below is the cross-section at A-A. Switch between solid and slotted plane and between low and high frequency, and watch where the return current (blue dots) goes. The readout is the loop area relative to a solid plane at high frequency.',
  ),
  takeawayTitle: loc('这一课要带走的', 'Take away'),
  quizTitle: loc('小测验', 'Quiz'),
  quizNote: loc('5 道题，答完点选项就能看到解释。', 'Five questions; click an option to see the explanation.'),
  rulesTitle: loc('走线与专项规则', 'Routing and special rules'),
  rulesNote: loc(
    '五张卡片：走线基本规则、晶振、模拟与数字分区、差分对、热设计。点卡片看图和说明。',
    'Cards for routing basics, the crystal, analog and digital partitioning, differential pairs and thermal design. Click a card for the figure and the explanation.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '原理图决定板子「接什么」，布局和布线决定它「能不能好好工作」。同一张原理图，摆法不同，一块板能稳稳跑，另一块会复位、死机、过不了 EMC，或者在 ATE 上测出一堆莫名其妙的失效。',
    'The schematic decides what is connected; placement and routing decide whether the board works well. From the same schematic, one layout runs steadily and another resets, hangs, fails EMC, or shows odd failures on the ATE.',
  ),
  loc(
    '这一课只讲最基本的原则，并且每条都给出原因：按功能分区摆放；电源路径宽而短、地要完整；去耦电容放在引脚旁；理解回流路径；走线避开锐角和长分支；晶振、模拟数字分区、差分对和散热各有各的要点。叠层是它们的前提，见 {@pcbStack}；线宽和阻抗的数字见 {@pcbBasics}。',
    'This lesson covers only the basic principles, each with its reason: place by function; keep power paths wide and short and the ground intact; put decoupling capacitors beside the pins; understand the return path; avoid acute angles and long stubs; and the points for the crystal, analog/digital partitioning, differential pairs and heat. The stack-up is their precondition: {@pcbStack}; the numbers for width and impedance: {@pcbBasics}.',
  ),
  loc(
    '测试工程师也要懂这些：load board 和探针卡上同样有去耦、回流和差分走线，板子上的 ATE 通道一旦回路太大，测出的波形就不是芯片本身的，见 {@connection}、{@fProgram}。',
    'Test engineers need this too: load boards and probe cards also have decoupling, return paths and differential routing, and a channel with too large a loop shows a waveform that is not the chip itself. See {@connection} and {@fProgram}.',
  ),
]

export const PRINCIPLES: LText[] = [
  loc(
    '按功能分区：接口、电源、MCU 和它的时钟、模拟各占一块，同一功能的元件靠在一起，信号在区内走完，跨区的线才少而短。',
    'Place by function zone: interface, power, the MCU with its clock, and analog each get their own area; parts of one function sit together so that signals finish inside a zone and few, short nets cross zones.',
  ),
  loc(
    '接口靠板边：外壳开孔、线缆和板子才对得上；ESD 和滤波器件紧挨接口，让干扰在进入板子之前就被挡掉。',
    'Connectors at the edge: only then do the enclosure opening, cable and board line up; keep ESD and filter parts right at the connector so that interference is stopped before it enters the board.',
  ),
  loc(
    '发热元件分散：功耗 = 压降 × 电流，LDO 从 5 V 降到 3.3 V、100 mA 就是 (5 − 3.3) × 0.1 = 0.17 W，全部变成热。热源别挤在一起，也别贴着晶振和模拟前端，并给它们铜皮散热。',
    'Spread hot parts: power = voltage drop x current, so an LDO taking 5 V to 3.3 V at 100 mA dissipates (5 - 3.3) x 0.1 = 0.17 W, all as heat. Do not cluster hot parts or put them next to the crystal or analog front end, and give them copper to spread heat.',
  ),
  loc(
    '电源路径宽而短：铜线有电阻也有电感，压降 = I × R，突变时再加 L × di/dt；宽度按电流算（见 {@pcbBasics}），路径越短两者越小。',
    'Wide, short power paths: copper has resistance and inductance, the drop is I x R plus L x di/dt on a sudden change; size the width for the current (see {@pcbBasics}), and the shorter the path the smaller both terms.',
  ),
  loc(
    '地要完整：一整块不被切割的地平面，既是最短的回流路径，又是最低的地阻抗。信号线下面最好永远是连续的地。',
    'Keep the ground solid: an uncut ground plane is both the shortest return path and the lowest ground impedance. Under a signal trace there should always be continuous ground.',
  ),
]

export const TAKEAWAY: LText[] = [
  loc(
    '先分区、后走线：接口靠边，热源分散，晶振和去耦电容贴着 MCU。因为每一条长线都是电阻、电感和天线。',
    'Zone first, route second: connector at the edge, hot parts spread, crystal and decoupling right at the MCU. Every long trace is a resistor, an inductor and an antenna.',
  ),
  loc(
    '去耦电容要贴引脚，过孔要贴电容焊盘。因为回路电感跟路径长度成正比，电感越大，同样的电流突变掉的电压越多（ΔV = L·di/dt）。',
    'Decoupling capacitors go right at the pin and vias right at the capacitor pad, because loop inductance grows with path length, and the larger it is the more voltage a given current step costs (dV = L di/dt).',
  ),
  loc(
    '电流一定回到源头，高频时回流贴在走线正下方的平面里，因为那条路回路面积最小、电感最低。所以不要在信号线下面切地，也不要让它跨缝。',
    'Current always returns to its source, and at high frequency it flows in the plane directly under the trace, because that path has the smallest loop and lowest inductance. So never cut the ground under a signal and never let it cross a gap.',
  ),
  loc(
    '地不要随意分割。多数时候一块完整的地加上分区摆放，比「模拟地」和「数字地」两块更好，因为分割后信号跨过缝隙就没有了回流路径。',
    'Do not split the ground casually. Most of the time one solid ground plus zoned placement beats separate analog and digital grounds, because a signal crossing the split loses its return path.',
  ),
  loc(
    '差分对要等宽、等距、等长，因为差分阻抗由线宽、间距和到平面的距离决定，间距一变阻抗就跳，长度一差信号就转成共模噪声。',
    'Keep differential pairs equal in width, spacing and length, because the differential impedance depends on width, spacing and height over the plane: a spacing change makes it jump, and a length mismatch turns signal into common-mode noise.',
  ),
]
