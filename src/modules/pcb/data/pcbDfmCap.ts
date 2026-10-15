import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type ProjectId = 'mcu' | 'sensor'

export const PROJECTS: Array<{ id: ProjectId; title: LText; sub: LText; blocks: LText[] }> = [
  {
    id: 'mcu',
    title: loc('MCU 最小系统板', 'MCU minimum-system board'),
    sub: loc('USB 供电，STM32 一类的 MCU', 'USB powered, an STM32-class MCU'),
    blocks: [
      loc('电源：USB 5 V 输入 + 保险丝 / TVS + 3.3 V LDO，输入输出各有电容（LDO 手册通常要求，否则可能振荡）', 'Power: USB 5 V in + fuse / TVS + 3.3 V LDO with input and output capacitors (LDO datasheets usually require them, or the regulator may oscillate)'),
      loc('去耦：每个 VDD 脚一颗 100 nF，紧贴引脚，外加一颗 4.7–10 µF 储能电容；离得远时走线电感会让电容来不及补电流', 'Decoupling: one 100 nF per VDD pin right at the pin, plus one 4.7–10 µF bulk cap; placed far away, trace inductance stops the cap from supplying current fast enough'),
      loc('时钟与复位：晶振紧贴 MCU、下面不走线；复位脚上拉 + 100 nF', 'Clock and reset: crystal right next to the MCU with no traces under it; reset pull-up + 100 nF'),
      loc('接口：USB 或 UART 排针放在板边，SWD 编程口', 'Interfaces: USB or a UART header at the board edge, plus an SWD programming port'),
      loc('测试点：3V3、5V、GND、复位、SWDIO / SWCLK', 'Test points: 3V3, 5V, GND, reset, SWDIO / SWCLK'),
    ],
  },
  {
    id: 'sensor',
    title: loc('传感器小板', 'Sensor breakout board'),
    sub: loc('I²C 温湿度 / 加速度传感器', 'I²C temperature-humidity / accelerometer sensor'),
    blocks: [
      loc('电源：排针输入 3.3–5 V + LDO（若传感器只耐 3.3 V），反接保护二极管', 'Power: header input 3.3–5 V + LDO (if the sensor only tolerates 3.3 V), reverse-polarity diode'),
      loc('去耦：传感器 VDD 脚 100 nF 紧贴引脚，LDO 输入输出电容', 'Decoupling: 100 nF right at the sensor VDD pin, LDO input and output caps'),
      loc('I²C：SDA / SCL 各一个 4.7 kΩ 上拉（I²C 是开漏输出，不上拉线就拉不高）；地址选择焊盘', 'I²C: one 4.7 kΩ pull-up each on SDA / SCL (I²C is open-drain, so without pull-ups the lines never go high); address-select pads'),
      loc('接口：2.54 mm 排针放在板边，丝印标出 VCC / GND / SDA / SCL', 'Interface: a 2.54 mm header at the board edge, silk-labelled VCC / GND / SDA / SCL'),
      loc('测试点：VCC、GND、SDA、SCL、中断脚', 'Test points: VCC, GND, SDA, SCL, interrupt pin'),
    ],
  },
]

export type LayerId = 'gtp' | 'gto' | 'gts' | 'gtl' | 'gbl' | 'gbs' | 'gbo' | 'gbp' | 'gko' | 'drl'

/** 按叠层图从上到下的顺序 */
export const GERBER: Array<{ id: LayerId; ext: string; name: LText; text: LText }> = [
  {
    id: 'gtp',
    ext: 'GTP',
    name: loc('顶层锡膏（钢网）', 'Top paste (stencil)'),
    text: loc('顶面 SMD 焊盘的锡膏开口，用来做钢网，不是板子上的一层：板厂不用它，贴片厂用它刻钢网。', 'The paste openings over top SMD pads, used to cut the stencil. It is not a layer of the board: the fab ignores it, the assembler uses it.'),
  },
  {
    id: 'gto',
    ext: 'GTO',
    name: loc('顶层丝印', 'Top silkscreen'),
    text: loc('顶面的白色字符：位号、极性、1 脚标记、板名版本。印在阻焊之上，所以不能压在焊盘上。', 'White legend on top: designators, polarity, pin-1 marks, board name and revision. It is printed over the mask, which is why it must stay off pads.'),
  },
  {
    id: 'gts',
    ext: 'GTS',
    name: loc('顶层阻焊', 'Top solder mask'),
    text: loc('画的是阻焊「开窗」：有图形的地方不盖绿油、露出铜去焊接。所以这层是负片意义，漏了开窗焊盘就被盖住。', 'It draws the mask openings: where there is a shape, no green mask is applied and copper is exposed for soldering. It is negative in meaning, so a missing opening covers the pad.'),
  },
  {
    id: 'gtl',
    ext: 'GTL',
    name: loc('顶层铜', 'Top copper'),
    text: loc('顶面的走线、焊盘、铺铜。板厂用它做外层图形转移和蚀刻。', 'Top-side traces, pads and pours. The fab uses it for outer-layer imaging and etching.'),
  },
  {
    id: 'gbl',
    ext: 'GBL',
    name: loc('底层铜', 'Bottom copper'),
    text: loc('底面的走线和铺铜；双层板通常在这里铺完整地平面，给信号提供回流路径。', 'Bottom-side traces and pours; a two-layer board usually puts an unbroken ground plane here to give signals a return path.'),
  },
  {
    id: 'gbs',
    ext: 'GBS',
    name: loc('底层阻焊', 'Bottom solder mask'),
    text: loc('底面阻焊开窗。底面的测试点必须在这层开窗，否则被绿油盖住，探针接触不到。', 'Bottom mask openings. Bottom test points must be opened here, or the mask covers them and probes cannot make contact.'),
  },
  {
    id: 'gbo',
    ext: 'GBO',
    name: loc('底层丝印', 'Bottom silkscreen'),
    text: loc('底面字符。底面没有元件也常用来标测试点名称、版本号；没有内容时可以是空文件，但最好说明。', 'Bottom legend. Even with no bottom parts it often labels test points and the revision; it may be empty, but say so.'),
  },
  {
    id: 'gbp',
    ext: 'GBP',
    name: loc('底层锡膏（钢网）', 'Bottom paste (stencil)'),
    text: loc('底面钢网开口。单面贴片时是空的，但仍建议输出，让贴片厂确认底面确实没有 SMD。', 'Bottom stencil openings. Empty for single-sided assembly, but still export it so the assembler can confirm there are no bottom SMDs.'),
  },
  {
    id: 'gko',
    ext: 'GKO / GM1',
    name: loc('板框（外形）', 'Board outline'),
    text: loc('板子的外形和内部开槽，成型工序按它铣边。Altium 常用 GM1（机械层 1）或 GKO（禁布层）；只能有一个闭合轮廓，别让两层都画、互相矛盾。', 'The board shape and internal cut-outs; routing follows it. Altium commonly uses GM1 (mechanical 1) or GKO (keep-out); there must be one closed outline, not two conflicting ones.'),
  },
  {
    id: 'drl',
    ext: 'DRL / TXT',
    name: loc('NC 钻孔文件（Excellon）', 'NC drill file (Excellon)'),
    text: loc('所有孔的坐标和孔径，钻孔机直接读。它不是 Gerber 格式，最容易漏发；金属化孔和非金属化孔最好分开输出。', 'Coordinates and sizes of every hole, read directly by the drilling machine. It is not Gerber format and is the file most often forgotten; export plated and non-plated holes separately.'),
  },
]

export type SheetGroupId = 'files' | 'design' | 'review'

export const SHEET: Array<{ id: SheetGroupId; title: LText; items: Array<{ id: string; text: LText }> }> = [
  {
    id: 'files',
    title: loc('Gerber 文件齐全', 'Complete Gerber set'),
    items: GERBER.map((g) => ({ id: g.id, text: loc(`${g.ext} · ${g.name.zh}`, `${g.ext} · ${g.name.en ?? g.name.zh}`) })),
  },
  {
    id: 'design',
    title: loc('设计内容', 'Design content'),
    items: [
      { id: 'd1', text: loc('电源输入 + 稳压 + 输入输出电容', 'Power input + regulator + input / output caps') },
      { id: 'd2', text: loc('每个 VDD 脚一颗 100 nF 去耦，紧贴引脚', 'One 100 nF decoupling cap per VDD pin, right at the pin') },
      { id: 'd3', text: loc('接口连接器放在板边', 'Interface connectors at the board edge') },
      { id: 'd4', text: loc('电源、地、关键信号都有测试点', 'Test points on power, ground and key signals') },
      { id: 'd5', text: loc('3 个 Fiducial、极性和 1 脚标记', '3 fiducials, polarity and pin-1 marks') },
      { id: 'd6', text: loc('底面完整地平面，没有被走线切断', 'Unbroken bottom ground plane, not cut by traces') },
    ],
  },
  {
    id: 'review',
    title: loc('DRC 与评审', 'DRC and review'),
    items: [
      { id: 'r1', text: loc('DRC 用板厂规则跑完，0 错误', 'DRC run with the fab’s rules: 0 errors') },
      { id: 'r2', text: loc('没有未布线网络（连通性检查通过）', 'No unrouted nets (connectivity check passes)') },
      { id: 'r3', text: loc('所有封装 1:1 打印比对过', 'Every footprint checked on a 1:1 printout') },
      { id: 'r4', text: loc('用 Gerber 查看器逐层打开检查过', 'Each layer opened and checked in a Gerber viewer') },
      { id: 'r5', text: loc('BOM、坐标文件已导出，位号一致', 'BOM and pick-and-place exported, designators match') },
      { id: 'r6', text: loc('制造说明：板厚、铜厚、表面处理、颜色', 'Fab notes: thickness, copper weight, finish, colour') },
    ],
  },
]

export const TAKEAWAY: LText[] = [
  loc('DRC 通过不等于能生产：DRC 只查你设的规则，封装间距、Fiducial、测试点这些它不知道。', 'Passing DRC is not the same as manufacturable: DRC only checks the rules you set and knows nothing about footprint pitch, fiducials or test points.'),
  loc('DFM 看板厂，DFA 看贴片，DFT 看测试；三张清单在出图前过一遍，比打样后改便宜得多。', 'DFM is about the fab, DFA about assembly, DFT about test; going through all three before release is far cheaper than fixing after prototyping.'),
  loc('封装错是最常见的返工原因：按数据手册做，1:1 打印比对，因为任何软件检查都发现不了画错的封装。', 'Footprint errors are the most common cause of rework: build from the datasheet and check on a 1:1 print, because no software check can catch a wrongly drawn footprint.'),
  loc('测试点要在布局时就留：ICT / 飞针只能测扎得到的网络，和 ATE 测芯片一样靠「加流测压」。', 'Leave test points during placement: ICT / flying probe can only test nets they can reach, using the same force-current, measure-voltage method as an ATE on a chip.'),
  loc('交付不只是 Gerber：还要 NC 钻孔文件、板框、BOM、坐标文件和制造说明，缺一个板厂或贴片厂就会停下来问。', 'Delivery is more than Gerbers: include the NC drill file, outline, BOM, pick-and-place and fab notes; missing any one makes the fab or assembler stop and ask.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一颗 0402 电容一端接细线，另一端整块连进 GND 大铺铜，回流后最可能出现？', 'A 0402 capacitor has a thin trace on one end and the other end merged solidly into a large GND pour. What is most likely after reflow?'),
    options: [
      { id: 'a', text: loc('立碑或冷焊', 'Tombstoning or a cold joint') },
      { id: 'b', text: loc('焊盘被蚀刻断', 'The pad is etched away') },
      { id: 'c', text: loc('没有影响', 'No effect') },
    ],
    answer: 'a',
    explain: loc('铺铜吸热，那一端焊锡熔化晚，先熔一端的表面张力把元件拉立起来；改用花焊盘让两端受热均匀。', 'The pour sinks heat so that end melts late, and surface tension at the molten end stands the part up; a thermal relief evens out the heating.'),
  },
  {
    id: 'q2',
    prompt: loc('Gerber 文件里哪一个决定板子的外形？', 'Which file defines the board shape?'),
    options: [
      { id: 'a', text: loc('GTO', 'GTO') },
      { id: 'b', text: loc('GKO / GM1', 'GKO / GM1') },
      { id: 'c', text: loc('GTP', 'GTP') },
    ],
    answer: 'b',
    explain: loc('板框层给出闭合外形，成型工序按它铣边；GTO 是顶层丝印，GTP 是顶层钢网开口。', 'The outline layer gives the closed shape that routing follows; GTO is top silkscreen and GTP is the top stencil openings.'),
  },
  {
    id: 'q3',
    prompt: loc('判断：一个 0.4 mm 的测试点放在 BGA 正下方并盖了阻焊，针床能测到吗？', 'Judge: a 0.4 mm test point sits right under a BGA and is covered by solder mask. Can a bed of nails test it?'),
    options: [
      { id: 'a', text: loc('能，只要网络连通', 'Yes, as long as the net is connected') },
      { id: 'b', text: loc('不能：太小、被元件挡住、又被阻焊盖住', 'No: too small, blocked by the part and covered by mask') },
    ],
    answer: 'b',
    explain: loc('针床需要 ≥ 1.0 mm、开阻焊窗、上方无遮挡的焊盘；三个条件这里一个都不满足。', 'A bed of nails needs a ≥ 1.0 mm, mask-free pad with nothing above it; this one meets none of the three.'),
  },
  {
    id: 'q4',
    prompt: loc('为什么全局 Fiducial 要放 3 个且不对称？', 'Why place 3 global fiducials asymmetrically?'),
    options: [
      { id: 'a', text: loc('让板子更好看', 'To make the board look better') },
      { id: 'b', text: loc('相机据此校正位置和旋转；不对称能识别出板子放反', 'The camera corrects position and rotation from them; asymmetry reveals a board loaded backwards') },
      { id: 'c', text: loc('给 ICT 当测试点', 'To serve as ICT test points') },
    ],
    answer: 'b',
    explain: loc('两点能定平移和旋转，第三点能校正缩放并检测翻转；对称布置时转 180° 看起来一样，就认不出放反。', 'Two points fix shift and rotation, a third corrects scale and detects flipping; with a symmetric layout a 180° rotation looks identical and goes unnoticed.'),
  },
  {
    id: 'q5',
    prompt: loc('交给板厂的压缩包里只有 7 个 Gerber 层，板厂最可能停下来问什么？', 'The zip sent to the fab contains only seven Gerber layers. What will the fab most likely stop and ask for?'),
    options: [
      { id: 'a', text: loc('NC 钻孔文件', 'The NC drill file') },
      { id: 'b', text: loc('原理图源文件', 'The schematic source') },
      { id: 'c', text: loc('BOM 价格', 'BOM pricing') },
    ],
    answer: 'a',
    explain: loc('钻孔文件是 Excellon 格式、不是 Gerber，最容易漏；没有它板厂不知道在哪里钻多大的孔，无法生产。', 'The drill file is Excellon, not Gerber, so it is the one most often left out; without it the fab does not know where to drill or how big, and cannot build the board.'),
  },
]
