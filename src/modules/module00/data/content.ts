import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const WHAT: LText[] = [
  loc(
    '芯片从晶圆到出货，每一步都可能做出坏片。测试用 ATE 自动给每一颗 DUT 加信号、测响应、判 Pass / Fail，坏的挑出来，好的才往下走。',
    'From wafer to shipment, every step can produce bad parts. Test uses ATE to stimulate each DUT, measure the response, and judge Pass / Fail. Bad parts are pulled out; only good ones move on.',
  ),
  loc(
    '测试的本职是判断，不是修芯片。它保护的是出货质量和后面工序的成本。（存储芯片是个例外：测出坏单元后可以换上备用行列，这叫 Repair，是测试流程里专门加的一步。）',
    'Test’s job is to judge, not to repair. It protects outgoing quality and the cost of later steps. (Memory is the exception: once test finds bad cells, spare rows/columns can be swapped in. That step is called repair and is added to the test flow on purpose.)',
  ),
]

export type ChainId = 'wafer' | 'cp' | 'pkg' | 'ft' | 'ship'

export const CHAIN: Array<{ id: ChainId; title: LText; sub: LText; text: LText; test?: boolean }> = [
  {
    id: 'wafer',
    title: loc('Wafer', 'Wafer'),
    sub: loc('晶圆', 'Wafer'),
    text: loc(
      'Fab 把电路做到硅片上，一片晶圆上有几十到几万颗还没切开的 die（die 越大，颗数越少）。此时谁好谁坏还不知道。',
      'The fab builds the circuit on silicon. One wafer holds tens to tens of thousands of undiced dies (bigger dies, fewer per wafer). Nobody knows yet which ones work.',
    ),
  },
  {
    id: 'cp',
    title: loc('CP', 'CP'),
    sub: loc('晶圆测试', 'Wafer sort'),
    test: true,
    text: loc(
      'Chip Probing（也叫 Circuit Probe、Wafer Sort）。封装前，用探针扎晶圆上的 pad，把坏 die 记进晶圆 Bin 图，省掉封装坏片的钱。',
      'Chip Probing (also called Circuit Probe or Wafer Sort). Before packaging, needles touch the pads on the wafer and bad dies are recorded in the wafer bin map, so nobody pays to package them.',
    ),
  },
  {
    id: 'pkg',
    title: loc('Packaging', 'Packaging'),
    sub: loc('封装', 'Assembly'),
    text: loc(
      '晶圆切割成一颗颗 die，只把 CP 判为好的 die 装进封装（打线或倒装焊），引出引脚或焊球，变成常见的芯片样子。',
      'The wafer is diced; only the dies CP judged good are packaged (wire-bonded or flip-chip) and given pins or balls — the chip shape people recognize.',
    ),
  },
  {
    id: 'ft',
    title: loc('FT', 'FT'),
    sub: loc('成品测试', 'Final test'),
    test: true,
    text: loc(
      'Final Test。Handler 把封装好的器件压进 Socket，做更完整的功能、DC、AC 测试，决定能不能出货。封装本身也可能做坏（打线断、焊球虚接），所以还要再测。',
      'Final Test. A handler presses packaged devices into a socket for fuller functional, DC, and AC tests that decide shipment. Assembly itself can break parts (broken bond wires, bad balls), so they are tested again.',
    ),
  },
  {
    id: 'ship',
    title: loc('Ship', 'Ship'),
    sub: loc('出货', 'Shipment'),
    text: loc(
      '通过 FT 的器件按 Bin 分好，装盘或编带，交给客户。',
      'Parts that pass FT are sorted by Bin, packed in trays or on tape, and sent to customers.',
    ),
  },
]

export const CHIP_TYPES: Array<{ id: string; title: LText; sub: LText; text: LText; params: LText[] }> = [
  {
    id: 'digital',
    title: loc('数字芯片', 'Digital ICs'),
    sub: loc('MCU、SoC、FPGA、逻辑 ASIC', 'MCU, SoC, FPGA, logic ASIC'),
    text: loc(
      '大量依赖测试向量（Pattern）：一拍一拍地给 0/1、比 0/1。本轨道主要讲它。',
      'Relies on test vectors (patterns): drive 0/1 and compare 0/1 cycle by cycle. This track is mostly about it.',
    ),
    params: [loc('VIH / VIL、VOH / VOL', 'VIH / VIL, VOH / VOL'), loc('IDD、漏电', 'IDD, leakage'), loc('功能 Pattern', 'Functional patterns'), loc('Setup / Hold', 'Setup / Hold')],
  },
  {
    id: 'analog',
    title: loc('模拟芯片', 'Analog ICs'),
    sub: loc('LDO、运放、ADC / DAC、电源管理', 'LDO, op-amp, ADC / DAC, power management'),
    text: loc(
      '测连续量的精度和噪声，主要靠精密源表和采样，而不是海量 Pattern。',
      'Measures accuracy and noise of continuous values, mostly with precision source-measure and sampling, not huge patterns.',
    ),
    params: [loc('Offset、Gain', 'Offset, Gain'), loc('INL / DNL', 'INL / DNL'), loc('Iq', 'Iq'), loc('PSRR', 'PSRR')],
  },
  {
    id: 'memory',
    title: loc('存储芯片', 'Memory ICs'),
    sub: loc('DRAM、SRAM、Flash', 'DRAM, SRAM, Flash'),
    text: loc(
      '大阵列、按地址读写，用 March 等算法；坏单元还能用冗余修复，测试时间很长。',
      'Large arrays read and written by address with March-type algorithms; bad cells can be repaired with redundancy. Test time is long.',
    ),
    params: [loc('March 算法', 'March algorithms'), loc('Retention', 'Retention'), loc('地址译码', 'Address decode'), loc('Repair', 'Repair')],
  },
  {
    id: 'rf',
    title: loc('射频芯片', 'RF ICs'),
    sub: loc('PA、LNA、收发器', 'PA, LNA, transceivers'),
    text: loc(
      '看高频功率、阻抗和调制质量，需要 RF 仪器和校准，数字 Channel 替代不了。',
      'Looks at RF power, impedance, and modulation quality. It needs RF instruments and calibration; a digital channel cannot replace them.',
    ),
    params: [loc('功率', 'Power'), loc('S 参数', 'S-parameters'), loc('噪声系数', 'Noise figure'), loc('EVM', 'EVM')],
  },
]

export type TermId =
  | 'cp'
  | 'ft'
  | 'ate'
  | 'dut'
  | 'tester'
  | 'loadboard'
  | 'socket'
  | 'probecard'
  | 'handler'
  | 'testprogram'
  | 'testpattern'
  | 'bin'
  | 'yield'

export type Term = {
  id: TermId
  name: string
  full: LText
  /** 侧栏：这个词是什么意思 */
  text: LText
  /** 图注：图里画的是什么 */
  caption: LText
}

export const TERMS: Term[] = [
  {
    id: 'cp',
    name: 'CP',
    full: loc('Chip Probing / 晶圆测试', 'Chip Probing / Wafer Sort'),
    text: loc(
      '封装前的晶圆测试，也叫 Circuit Probe、Wafer Sort。DUT 是晶圆上还没切开的 die。',
      'Wafer test before packaging, also called Circuit Probe or Wafer Sort. The DUT is a die on the uncut wafer.',
    ),
    caption: loc(
      '侧视：探针卡固定在测试头下方，Prober 的 chuck 托着晶圆往上顶，让针尖扎到一颗 die（金框）的 pad 上。测完，chuck 移到下一颗。',
      'Side view: the probe card is fixed under the test head. The prober’s chuck lifts the wafer so the needle tips land on one die’s pads (gold frame). After the test, the chuck steps to the next die.',
    ),
  },
  {
    id: 'ft',
    name: 'FT',
    full: loc('Final Test', 'Final Test'),
    text: loc('封装后的成品测试。DUT 是封装好的芯片。', 'Test after packaging. The DUT is the packaged chip.'),
    caption: loc(
      '侧视：Handler 压头把封装好的芯片压进 Socket，焊球压在弹簧针上。Socket 用螺丝固定在 Load Board 上（方便更换），Load Board 下面是测试头。',
      'Side view: the handler plunger presses the packaged chip into the socket so its balls rest on spring pins. The socket is screwed onto the load board (so it can be replaced), and the test head is below.',
    ),
  },
  {
    id: 'ate',
    name: 'ATE',
    full: loc('Automatic Test Equipment', 'Automatic Test Equipment'),
    text: loc(
      '自动测试设备。按测试程序给 DUT 加信号、测量响应、判 Pass / Fail。',
      'Automatic Test Equipment. It follows the test program to stimulate the DUT, measure the response, and judge Pass / Fail.',
    ),
    caption: loc(
      '量产 ATE = 主机柜 + 测试头。电缆把主机里的资源接到测试头，测试头架在支架上；DUT 在测试头上方，中间隔着 Load Board 和 Socket。',
      'A production ATE = mainframe + test head. Cables bring the mainframe resources to the head, which sits on a manipulator. The DUT is on top of the head, with the load board and socket in between.',
    ),
  },
  {
    id: 'dut',
    name: 'DUT',
    full: loc('Device Under Test', 'Device Under Test'),
    text: loc(
      '正在被测的器件。CP 时是晶圆上的 die，FT 时是封装好的芯片。',
      'The device being tested: a die on the wafer in CP, a packaged chip in FT.',
    ),
    caption: loc(
      '一颗 QFP 封装芯片：四边各 8 根引脚，从塑封体侧面伸出、向下弯成鸥翼形（右侧侧视），左上角圆点标出 1 号脚。',
      'A QFP packaged chip: 8 leads on each side come out of the body and bend down into a gull wing (side view on the right). The dot at top left marks pin 1.',
    ),
  },
  {
    id: 'tester',
    name: 'Tester',
    full: loc('测试机', 'Tester'),
    text: loc(
      '工厂里对 ATE 的常用叫法。它为每个管脚提供一路测试通道（Channel）。',
      'The usual shop-floor name for the ATE. It gives every pin its own test channel.',
    ),
    caption: loc(
      '测试头剖面：里面竖插着一排通道板，每块板有若干 Channel；顶面每组弹簧针对应下面一块板，把信号送到 Load Board。',
      'Test head cross-section: a row of channel boards stands inside, each with several channels. Each group of pogo pins on top belongs to the board below it and carries its signals up to the load board.',
    ),
  },
  {
    id: 'loadboard',
    name: 'Load Board',
    full: loc('负载板', 'Load board'),
    text: loc(
      '为这颗芯片专门做的 PCB，把测试头的通道布线到 Socket 的每个管脚。',
      'A PCB made for this one device. It routes test-head channels to every pin of the socket.',
    ),
    caption: loc(
      '俯视：四边是和测试头弹簧针接触的焊盘，金色走线汇到中间 Socket 位置四边的焊盘，蓝色圆点是换层的过孔。',
      'Top view: pads along the edges meet the test head’s pogo pins; gold traces run to the pads on all four sides of the socket site in the middle; blue dots are vias.',
    ),
  },
  {
    id: 'socket',
    name: 'Socket',
    full: loc('测试插座', 'Test socket'),
    text: loc(
      'FT 用的插座。不用焊接就能让芯片反复插拔、可靠接触。',
      'The FT socket. It lets chips be inserted again and again with reliable contact and no soldering.',
    ),
    caption: loc(
      '翻盖式 Socket 剖面：底座里是一排弹簧针，上端顶着芯片焊球，下端压在 Load Board 焊盘上；盖子合上，压块把芯片压紧。量产时没有盖子，改由 Handler 压头往下压。',
      'Clamshell socket cross-section: spring pins in the base touch the chip’s balls at the top and the load-board pads at the bottom. Closing the lid lets its pusher press the chip down. In production there is no lid; the handler plunger presses instead.',
    ),
  },
  {
    id: 'probecard',
    name: 'Probe Card',
    full: loc('探针卡', 'Probe card'),
    text: loc(
      'CP 用的接口板，作用相当于 FT 的 Load Board + Socket。',
      'The CP interface board; it does the job of the FT load board plus socket.',
    ),
    caption: loc(
      '俯视：圆形 PCB，边缘一圈焊盘接测试头；中间窗口里，探针从四边伸向中心，每根针尖对准 die 上的一个 pad。',
      'Top view: a round PCB whose rim pads meet the test head. In the center window, needles reach in from all four sides, each tip aimed at one pad on the die.',
    ),
  },
  {
    id: 'handler',
    name: 'Handler',
    full: loc('分选机', 'Handler'),
    text: loc(
      'FT 的搬运设备：把芯片送进 Socket，测完按 Bin 分拣。它只搬运，不测量。',
      'The FT material-moving machine: it puts chips into the socket and sorts them by Bin after test. It moves parts; it does not measure.',
    ),
    caption: loc(
      '俯视：从进料盘取芯片 → 压进测试位的 Socket → 按 ATE 给的 Bin 放进对应的出料盘。',
      'Top view: pick from the input tray → press into the socket at the test site → drop into the output tray for the Bin the ATE reports.',
    ),
  },
  {
    id: 'testprogram',
    name: 'Test Program',
    full: loc('测试程序', 'Test program'),
    text: loc(
      '告诉 ATE 测什么、按什么顺序、限值多少、失败进哪个 Bin。',
      'Tells the ATE what to test, in what order, against which limits, and which Bin a failure goes to.',
    ),
    caption: loc(
      '程序按顺序跑一串测试项，每项把测量值和限值比较。量产常用“遇错即停”：第一个失败项决定 Bin，这里 VOH 低于 2.4 V，进 Bin 3（DC 失败）。',
      'The program runs tests in order and compares each measured value to its limits. Production usually stops on the first fail, and that test decides the Bin: here VOH is below 2.4 V, so the part goes to Bin 3 (DC fail).',
    ),
  },
  {
    id: 'testpattern',
    name: 'Pattern',
    full: loc('测试向量', 'Test vectors'),
    text: loc(
      '一拍一行的表：每根输入脚给 0 还是 1，每根输出脚期望 H 还是 L（或 X 不比较）。',
      'A table, one row per cycle: drive 0 or 1 on each input, expect H or L on each output (or X: do not compare).',
    ),
    caption: loc(
      '1 / 0 = 驱动，H / L = 期望，X = 这一拍不比较。例子里 Y = A·B + C，可以逐行核对期望值。高亮的是正在执行的那一行。',
      '1 / 0 = drive, H / L = expect, X = do not compare this cycle. Here Y = A·B + C, so every expected value can be checked row by row. The highlighted row is the one running now.',
    ),
  },
  {
    id: 'bin',
    name: 'Bin',
    full: loc('分档', 'Bin'),
    text: loc(
      '测完后给每颗 DUT 的分类号。编号的含义由测试程序定义，本课例子：Bin 1 = 好品，Bin 3 = DC 失败，Bin 5 = 功能失败。',
      'The category number each DUT gets after test. The test program defines what each number means; in this lesson Bin 1 = good, Bin 3 = DC fail, Bin 5 = functional fail.',
    ),
    caption: loc(
      'CP 的晶圆 Bin 图：每个格子是一颗完整的 die，颜色是它的 Bin。边缘不完整的 die 不测、不画；底部小缺口是晶圆定位 notch。',
      'CP wafer bin map: each square is one whole die, colored by its Bin. Partial dies at the edge are not tested or drawn; the small notch at the bottom orients the wafer.',
    ),
  },
  {
    id: 'yield',
    name: 'Yield',
    full: loc('良率', 'Yield'),
    text: loc(
      '好品数 ÷ 测试数。是质量和成本最直接的数字。',
      'Good count ÷ tested count — the most direct quality and cost number.',
    ),
    caption: loc(
      '和 Bin 图是同一张晶圆：绿色（Bin 1）格子数 ÷ 全部格子数 = 良率，四舍五入到整数。',
      'The same wafer as the bin map: green (Bin 1) squares ÷ all squares = yield, rounded to a whole percent.',
    ),
  },
]

export type SysId =
  | 'program'
  | 'controller'
  | 'ate'
  | 'pe'
  | 'pmu'
  | 'dps'
  | 'head'
  | 'loadboard'
  | 'socket'
  | 'dut'
  | 'result'

export const SYS: Record<SysId, { title: LText; text: LText }> = {
  program: {
    title: loc('Test Program', 'Test Program'),
    text: loc('一切从这里开始：工程师写好程序，决定整台系统怎么动。', 'Everything starts here: the engineer’s program decides what the whole system does.'),
  },
  controller: {
    title: loc('工作站', 'Workstation'),
    text: loc('加载并运行测试程序，把命令发给 ATE 主机，收回结果。', 'Loads and runs the test program, sends commands to the mainframe, and collects results.'),
  },
  ate: {
    title: loc('ATE 主机', 'ATE mainframe'),
    text: loc(
      '装着所有测量资源：每个管脚一路 Pin Electronics，加上 PMU 和给 DUT 供电的 DPS。',
      'Holds all the measurement resources: pin electronics for every pin, plus PMUs and the DPS that powers the DUT.',
    ),
  },
  pe: {
    title: loc('Pin Electronics', 'Pin Electronics'),
    text: loc(
      '管脚电子：每根数字管脚的驱动和比较电路，0/1 从这里进出。内部结构见 {@ate}，完整电路见 {@fIntro}。',
      'Pin electronics: the drive and compare circuit behind each digital pin; 0/1 go in and out here. Inside view in {@ate}; full circuit in {@fIntro}.',
    ),
  },
  pmu: {
    title: loc('PMU', 'PMU'),
    text: loc(
      '精密测量单元：加电压测电流，或加电流测电压。原理见 {@pmu} 和 {@fIntro}。',
      'Parametric measurement unit: force voltage and measure current, or the reverse. See {@pmu} and {@fIntro}.',
    ),
  },
  dps: {
    title: loc('DPS', 'DPS'),
    text: loc('Device Power Supply：给 DUT 的 VDD 供电，同时能测电源电流。', 'Device Power Supply: powers the DUT’s VDD and can measure supply current.'),
  },
  head: {
    title: loc('Test Head', 'Test Head'),
    text: loc('测试头：通道板装在这里，尽量靠近 DUT，信号路径越短越好。', 'The test head holds the channel boards as close to the DUT as possible; shorter signal paths are better.'),
  },
  loadboard: {
    title: loc('Load Board', 'Load Board'),
    text: loc('压在测试头上，把每一路通道接到 Socket 的对应管脚。', 'Sits on the test head and connects every channel to the matching socket pin.'),
  },
  socket: {
    title: loc('Socket / Probe Card', 'Socket / Probe Card'),
    text: loc('FT 用 Socket 夹住封装芯片；CP 换成 Probe Card 扎晶圆。路径细节见 {@connection}。', 'FT uses a socket to hold the packaged chip; CP swaps in a probe card on the wafer. Path details in {@connection}.'),
  },
  dut: {
    title: loc('DUT', 'DUT'),
    text: loc('被加信号、被测量的那颗芯片或 die。', 'The chip or die being stimulated and measured.'),
  },
  result: {
    title: loc('Pass / Fail → Bin', 'Pass / Fail → Bin'),
    text: loc(
      '每一项和限值比完，工作站给出 Bin 号。FT 时 Handler 按它把芯片放进对应料盘；CP 时 die 还连在晶圆上没法分拣，Prober 把 Bin 号记进晶圆 Bin 图，封装厂只封好 die。',
      'After every test is compared to its limits, the workstation assigns a Bin. In FT the handler drops the chip into the matching tray. In CP the die is still part of the wafer and cannot be sorted, so the prober records the Bin in the wafer bin map and assembly packages only the good dies.',
    ),
  },
}

/** 系统框图里方块的显示顺序（从左上到右下），默认选中第一个 */
export const SYS_ORDER: SysId[] = ['program', 'controller', 'ate', 'pe', 'pmu', 'dps', 'head', 'loadboard', 'socket', 'dut', 'result']

export const TAKEAWAY: LText[] = [
  loc(
    '测试 = 自动加信号、测响应、判 Pass / Fail；本职是判断，不修理（存储芯片的冗余修复是专门加的一步）。',
    'Test = automatically stimulate, measure, and judge Pass / Fail. Its job is to judge, not repair (memory redundancy repair is a step added on purpose).',
  ),
  loc('测两次：封装前 CP 测 die，封装后 FT 测成品。', 'Test twice: CP tests dies before packaging, FT tests finished parts after.'),
  loc('CP 用 Probe Card 扎晶圆；FT 用 Load Board + Socket 接芯片，Handler 负责搬运分拣。', 'CP needles the wafer through a probe card; FT reaches the chip through a load board and socket, with a handler moving and sorting.'),
  loc(
    '结果是 Bin 号：FT 时 Handler 按 Bin 分拣，CP 时记进晶圆 Bin 图；好品数 ÷ 测试数 = 良率。',
    'The result is a Bin number: in FT the handler sorts by it, in CP it goes into the wafer bin map. Good count ÷ tested count = yield.',
  ),
  loc(
    '产业角色、封装形态等底子见预备轨 {@pIndustry}、{@pPackage}；物理怎么接到 ATE 见下一课 {@connection}。',
    'Industry roles and package shapes are in the Prep track {@pIndustry}, {@pPackage}; how the DUT hooks to the ATE is the next lesson {@connection}.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('CP 和 FT 时，DUT 分别是什么？', 'What is the DUT in CP and in FT?'),
    options: [
      { id: 'a', text: loc('CP：晶圆上的 die；FT：封装好的芯片', 'CP: a die on the wafer; FT: the packaged chip') },
      { id: 'b', text: loc('两次都是封装好的芯片', 'The packaged chip both times') },
      { id: 'c', text: loc('CP：整片晶圆当一个 DUT；FT：一盘芯片', 'CP: the whole wafer as one DUT; FT: a whole tray') },
    ],
    answer: 'a',
    explain: loc('CP 在封装前，测的是晶圆上一颗一颗的 die；FT 在封装后，测的是成品。', 'CP comes before packaging and tests dies one by one on the wafer; FT comes after and tests finished parts.'),
  },
  {
    id: 'q2',
    prompt: loc('为什么封装前要先做 CP？', 'Why run CP before packaging?'),
    options: [
      { id: 'a', text: loc('CP 能把坏 die 修好', 'CP repairs bad dies') },
      { id: 'b', text: loc('先挑掉坏 die，不花钱封装坏片', 'Pull out bad dies first so nobody pays to package them') },
      { id: 'c', text: loc('CP 测过就不用 FT 了', 'After CP, FT is not needed') },
    ],
    answer: 'b',
    explain: loc(
      'CP 只判断好坏、把坏 die 记下来，坏 die 修不好；先挑掉它们，就不用花钱封装坏片。封装也可能做坏，所以 FT 还要再测。',
      'CP only judges and records bad dies; it cannot make them good. Pulling them out first means nobody pays to package bad parts. Packaging can break parts too, so FT tests again.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('CP 时，用什么接触 DUT？', 'In CP, what contacts the DUT?'),
    options: [
      { id: 'a', text: loc('Socket', 'A socket') },
      { id: 'b', text: loc('Probe Card 上的探针', 'Needles on a probe card') },
      { id: 'c', text: loc('Handler 的吸嘴', 'The handler’s pick-up nozzle') },
    ],
    answer: 'b',
    explain: loc('die 还在晶圆上，没有引脚可插，只能用探针扎 pad。', 'The die is still on the wafer with no pins to insert, so needles land on its pads.'),
  },
  {
    id: 'q4',
    prompt: loc('Handler 和 ATE 怎么分工？', 'How do the handler and the ATE split the work?'),
    options: [
      { id: 'a', text: loc('Handler 测量，ATE 搬运', 'The handler measures; the ATE moves parts') },
      { id: 'b', text: loc('Handler 搬运和分拣，ATE 测量和判定', 'The handler moves and sorts; the ATE measures and judges') },
      { id: 'c', text: loc('两者做同一件事', 'They do the same job') },
    ],
    answer: 'b',
    explain: loc('ATE 给出 Bin 号，Handler 照着把芯片放进对应的料盘。', 'The ATE reports the Bin; the handler drops the chip into the matching tray.'),
  },
  {
    id: 'q5',
    prompt: loc('一片晶圆测了 200 颗 die，180 颗是 Bin 1，良率是多少？', 'A wafer has 200 dies tested and 180 land in Bin 1. What is the yield?'),
    options: [
      { id: 'a', text: loc('90%', '90%') },
      { id: 'b', text: loc('10%', '10%') },
      { id: 'c', text: loc('180%', '180%') },
    ],
    answer: 'a',
    explain: loc('良率 = 好品数 ÷ 测试数 = 180 ÷ 200 = 90%。', 'Yield = good ÷ tested = 180 ÷ 200 = 90%.'),
  },
]
