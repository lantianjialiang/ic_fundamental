import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'

/**
 * 术语表数据：从 D、F 两条轨道各课的术语卡、参数表和正文里汇总。
 *
 * - id：地址用的短名（#/glossary/<id>），只用小写字母、数字、连字符，定了就别改。
 * - term：术语原文，A–Z 视图按它排序。
 * - name：名称，zh 写中文名，en 写英文名（两种语言界面都会同时显示）。
 * - def：一两句解释，口径要和课程里一致。可以写 {@课程ID} 引用。
 * - lessons：讲到它的课。主词条显示在其中课序最靠前的那一课下面，其它课只显示名字并标“见 Dxx”。
 */
export type GlossaryTerm = {
  id: string
  term: string
  name: LText
  def: LText
  lessons: ModuleId[]
}

export const TERMS: GlossaryTerm[] = [
  /* ---------------- D01 什么是半导体测试 ---------------- */
  {
    id: 'cp',
    term: 'CP',
    name: loc('晶圆测试', 'Circuit Probe / wafer sort'),
    def: loc(
      '封装前的晶圆测试：探针卡的针扎在 die 的 pad 上，把坏 die 标出来，省掉封装坏片的钱。DUT 是晶圆上的一颗 die。',
      'Wafer test before packaging: probe-card needles land on each die’s pads and bad dies are marked, so nobody pays to package them. The DUT is one die on the wafer.',
    ),
    lessons: ['intro', 'connection', 'fAte', 'fIntro'],
  },
  {
    id: 'ft',
    term: 'FT',
    name: loc('成品测试', 'Final Test'),
    def: loc(
      '封装后的测试：芯片压进 Socket，做更完整的功能、DC、AC 测试，决定能不能出货。封装本身也可能做坏，所以 CP 之后还要再测。',
      'Test after packaging: the chip is pressed into a socket for fuller functional, DC and AC tests that decide shipment. Assembly can break parts too, so it is tested again after CP.',
    ),
    lessons: ['intro', 'connection', 'fAte', 'fIntro'],
  },
  {
    id: 'ate',
    term: 'ATE',
    name: loc('自动测试设备', 'Automatic Test Equipment'),
    def: loc(
      '按测试程序给 DUT 加信号、测响应、判 Pass / Fail 的设备。量产 ATE = 主机柜 + 测试头。',
      'Equipment that follows the test program to stimulate the DUT, measure the response and judge Pass / Fail. A production ATE = mainframe + test head.',
    ),
    lessons: ['intro', 'ate', 'fAte', 'fIntro'],
  },
  {
    id: 'dut',
    term: 'DUT',
    name: loc('被测器件', 'Device Under Test'),
    def: loc(
      '正在被测的那颗器件：CP 时是晶圆上的 die，FT 时是封装好的芯片。',
      'The device being tested: a die on the wafer in CP, a packaged chip in FT.',
    ),
    lessons: ['intro', 'connection', 'fIntro', 'fDebug'],
  },
  {
    id: 'tester',
    term: 'Tester',
    name: loc('测试机', 'Tester'),
    def: loc(
      '工厂里对 ATE 的常用叫法。它为每个管脚提供一路测试通道。排错时它是四个嫌疑对象之一。',
      'The usual shop-floor name for the ATE. It gives every pin its own test channel, and is one of the four suspects in troubleshooting.',
    ),
    lessons: ['intro', 'fAte', 'fDebug'],
  },
  {
    id: 'channel',
    term: 'Channel',
    name: loc('测试通道', 'Tester channel'),
    def: loc(
      'DUT 每根数字管脚背后的一路资源：取向量、定时刻、选电平、驱动、采样、比较，都在这一路里完成。',
      'The resource behind every digital DUT pin: fetching the vector, timing, level selection, driving, sampling and comparing all happen in this one path.',
    ),
    lessons: ['intro', 'connection', 'ate', 'fIntro'],
  },
  {
    id: 'mainframe',
    term: 'Mainframe',
    name: loc('主机柜', 'Mainframe'),
    def: loc(
      'ATE 放电源、同步和数据资源的机柜，经电缆连到测试头。',
      'The ATE cabinet holding power, sync and data resources, cabled to the test head.',
    ),
    lessons: ['intro', 'connection'],
  },
  {
    id: 'test-head',
    term: 'Test Head',
    name: loc('测试头', 'Test head'),
    def: loc(
      '测试机离 DUT 最近的部分，里面插着通道板（Pin Electronics）。信号路径越短越好，所以它要尽量靠近 DUT；CP 时翻转朝下扣在探针台上。',
      'The part of the tester closest to the DUT, holding the channel cards (pin electronics). Shorter signal paths are better; for CP it is flipped and docked onto the prober.',
    ),
    lessons: ['intro', 'connection', 'fIntro'],
  },
  {
    id: 'load-board',
    term: 'Load Board / DIB',
    name: loc('负载板', 'Load board'),
    def: loc(
      '为一种芯片专门做的多层 PCB，把测试头的通道扇出到 Socket 的每个管脚，板上还有旁路电容、继电器等。上机前要先做空座的负载板测试。',
      'A device-specific multilayer PCB that fans tester channels out to every socket pin and carries bypass capacitors, relays and more. It gets an empty-socket load board test before use.',
    ),
    lessons: ['intro', 'connection', 'fAte', 'fIntro', 'fCreate'],
  },
  {
    id: 'socket',
    term: 'Socket',
    name: loc('测试插座', 'Test socket'),
    def: loc(
      'FT 用的插座：定位腔把芯片对准，弹簧针把引脚接到负载板。不用焊接就能反复插拔，会磨损，要定期更换。',
      'The FT socket: a pocket aligns the chip and pogo pins connect its leads to the load board. Chips go in and out with no soldering; it wears and is replaced regularly.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'probe-card',
    term: 'Probe Card',
    name: loc('探针卡', 'Probe card'),
    def: loc(
      'CP 用的接口板，相当于 FT 的负载板 + Socket：圆形 PCB 边缘接 Pogo，中央的探针扎在 die 的 pad 上。',
      'The CP interface board, doing the job of the FT load board plus socket: a round PCB meets the pogo ring at the edge and its central probes land on the die pads.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'handler',
    term: 'Handler',
    name: loc('分选机', 'Handler'),
    def: loc(
      'FT 的搬运设备：把芯片送进 Socket，测完按 ATE 给的 Bin 分拣。它只搬运，不测量。',
      'The FT material-moving machine: it puts chips into the socket and sorts them by the bin the ATE reports. It moves parts; it does not measure.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'prober',
    term: 'Prober',
    name: loc('探针台', 'Prober'),
    def: loc(
      'CP 的搬运设备：真空吸盘吸住晶圆，把被测 die 移到探针下面并抬起接触，测完挪到下一颗。',
      'The CP material-moving machine: a vacuum chuck holds the wafer, moves the target die under the probes and lifts it into contact, then steps to the next die.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'test-program',
    term: 'Test Program',
    name: loc('测试程序', 'Test program'),
    def: loc(
      '告诉 ATE 测什么、按什么顺序、极限多少、失败进哪个 Bin。结构上是一张 Flow 加一条条 Test Item。',
      'Tells the ATE what to test, in what order, against which limits, and which bin a failure goes to. Structurally it is a flow plus a list of test items.',
    ),
    lessons: ['intro', 'spec', 'program', 'fProgram', 'fCreate', 'fDebug'],
  },
  {
    id: 'pattern',
    term: 'Pattern',
    name: loc('测试向量', 'Test pattern / vectors'),
    def: loc(
      '一拍一行的表：每根输入脚给 0 还是 1，每根输出脚期望 H 还是 L。真值表的一行就是一条向量，量产 Pattern 有成千上万条。',
      'A table with one row per cycle: drive 0 or 1 on each input, expect H or L on each output. One truth-table row is one vector; a production pattern has thousands.',
    ),
    lessons: ['intro', 'ate', 'func', 'vector', 'fFunc', 'fVector'],
  },
  {
    id: 'bin',
    term: 'Bin',
    name: loc('分档', 'Bin'),
    def: loc(
      '测完后给每颗 DUT 的分类号，例如 Bin 1 = 好品。量产里第一个 Fail 的测试项决定它进哪个 Bin，所以 Bin 号也告诉你它挂在哪一项。',
      'The category number each DUT gets after test, e.g. bin 1 = good. In production the first failing item decides the bin, so the bin number also tells you where it failed.',
    ),
    lessons: ['intro', 'program', 'fIntro', 'fDc', 'fProgram'],
  },
  {
    id: 'yield',
    term: 'Yield',
    name: loc('良率', 'Yield'),
    def: loc(
      '好品数 ÷ 测试数，在固定测试条件下算出来。是质量和成本最直接的数字。',
      'Good count ÷ tested count, measured at fixed test conditions. The most direct quality and cost number.',
    ),
    lessons: ['intro', 'shmoo'],
  },
  {
    id: 'wafer',
    term: 'Wafer',
    name: loc('晶圆', 'Wafer'),
    def: loc(
      'Fab 把电路做在上面的硅片，一片上有成百上千颗还没切开的 die；缺口（notch）用来定方向。',
      'The silicon disc the fab builds circuits on, holding hundreds or thousands of undiced dies; a notch fixes its orientation.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'die',
    term: 'Die',
    name: loc('裸片', 'Die'),
    def: loc(
      '晶圆上的一颗芯片。CP 测的就是它；划片后好 die 才去封装。',
      'One chip on the wafer. CP tests it; after dicing only good dies go to assembly.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'pin-electronics',
    term: 'Pin Electronics',
    name: loc('管脚电子', 'Pin electronics'),
    def: loc(
      '每根数字管脚背后的驱动和比较电路，0/1 从这里进出；装在测试头的通道板上。',
      'The drive and compare circuit behind each digital pin, where 0/1 go in and out; it sits on the channel cards in the test head.',
    ),
    lessons: ['intro', 'connection', 'ate', 'fIntro'],
  },
  {
    id: 'pmu',
    term: 'PMU',
    name: loc('精密测量单元', 'Precision / parametric measurement unit'),
    def: loc(
      '加电压测电流（FVMI）或加电流测电压（FIMV）的仪器，给出电压、电流的数值本身，而不只是 0/1。',
      'The instrument that forces voltage and measures current (FVMI) or forces current and measures voltage (FIMV). It returns the value itself, not just 0/1.',
    ),
    lessons: ['intro', 'ate', 'pmu', 'fIntro', 'fOpens', 'fDc'],
  },
  {
    id: 'dps',
    term: 'DPS',
    name: loc('器件电源', 'Device Power Supply'),
    def: loc(
      '给 DUT 的 VDD 供电，同时能测电源电流（IDD）。',
      'Powers the DUT’s VDD and can measure the supply current (IDD).',
    ),
    lessons: ['intro', 'ate', 'fIntro'],
  },
  {
    id: 'adc-dac',
    term: 'ADC / DAC',
    name: loc('模数 / 数模转换器', 'A/D and D/A converters'),
    def: loc(
      'ADC 把模拟量变成数字量，DAC 反过来。模拟、混合信号测试机里都有它们。',
      'An ADC turns an analog quantity into a digital one; a DAC does the reverse. Analog and mixed-signal testers contain both.',
    ),
    lessons: ['intro', 'fAte'],
  },
  {
    id: 'march',
    term: 'March',
    name: loc('March 算法', 'March algorithm'),
    def: loc(
      'Memory 测试的算法：按地址逐个写 0、读 0 写 1……ATE 的算法引擎边跑边生成下一拍，不必预先存全部向量。',
      'A memory test algorithm: write 0 to each address, then read 0 and write 1, and so on. The ATE’s algorithmic generator computes each cycle on the fly instead of storing every vector.',
    ),
    lessons: ['intro', 'vector'],
  },

  /* ---------------- D02 DUT 如何接到 ATE ---------------- */
  {
    id: 'pogo-pin',
    term: 'Pogo Pin',
    name: loc('弹簧针', 'Pogo pin'),
    def: loc(
      '带弹簧的接触针。Socket 里用它接芯片引脚，Pogo Tower 里用它把通道板压接到负载板。压下去才接触可靠。',
      'A spring-loaded contact pin. Sockets use it to touch the device leads; the pogo tower uses it to press channel cards onto the load board. Compression makes the contact reliable.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'pogo-tower',
    term: 'Pogo Tower',
    name: loc('接口塔', 'Pogo tower'),
    def: loc(
      '一排排弹簧针块，把测试头通道板和负载板（或探针卡边缘焊盘）压接起来，换板不用焊接。',
      'Rows of pogo blocks that press the test-head channel cards against the load board (or probe-card edge pads), so boards can be swapped without soldering.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'space-transformer',
    term: 'Space Transformer',
    name: loc('空间转换器', 'Space transformer'),
    def: loc(
      '探针卡中央的一层，把 PCB 上较宽的间距缩小到探针的针距。',
      'The layer in the center of a probe card that shrinks the PCB pitch down to the probe pitch.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'overdrive',
    term: 'Overdrive',
    name: loc('过驱动', 'Overdrive'),
    def: loc(
      '针尖着陆（touchdown）后吸盘再抬一点：探针微弯，针尖在 pad 上划出 scrub 痕，保证接触可靠。',
      'After touchdown the chuck lifts a little more: the probes bend and the tips scrub a mark into the pads, ensuring good contact.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'chuck',
    term: 'Chuck',
    name: loc('吸盘', 'Prober chuck'),
    def: loc(
      '探针台上的真空吸盘：吸住晶圆，在 XY 方向把被测 die 移到针下，再沿 Z 上升接触。',
      'The prober’s vacuum stage: it holds the wafer, moves the target die under the probes in XY, then rises in Z to make contact.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'probe-type',
    term: 'Cantilever / Vertical Probe',
    name: loc('悬臂针 / 垂直针', 'Cantilever / vertical probes'),
    def: loc(
      '探针卡的两种针：悬臂针斜着伸向中心；垂直针直上直下，适合更密、更多的 pad。',
      'Two probe styles: cantilever probes reach in at an angle toward the center; vertical probes go straight down and suit denser, larger pad arrays.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'via',
    term: 'Via',
    name: loc('过孔', 'Via'),
    def: loc(
      '多层 PCB 里在层与层之间换层的竖直导通孔。信号从负载板底层焊盘经过孔、内层走线到顶层焊盘。',
      'A vertical plated hole that carries a signal between PCB layers: from the bottom pad through vias and an inner track to the top pad.',
    ),
    lessons: ['connection'],
  },
  {
    id: 'bga',
    term: 'BGA',
    name: loc('球栅阵列封装', 'Ball Grid Array'),
    def: loc(
      '底部是锡球阵列的封装，管脚多、间距细，靠 Socket 里的弹簧针接触。',
      'A package with an array of solder balls underneath: many pins at fine pitch, contacted by pogo pins in the socket.',
    ),
    lessons: ['connection', 'fAte'],
  },
  {
    id: 'qfp',
    term: 'QFP',
    name: loc('四边扁平封装', 'Quad Flat Pack'),
    def: loc(
      '四边伸出鸥翼引脚的扁平封装，顶面圆点标出 1 号脚。',
      'A flat package with gull-wing leads on all four sides; a dot on top marks pin 1.',
    ),
    lessons: ['intro', 'connection', 'fAte'],
  },
  {
    id: 'relay',
    term: 'Relay',
    name: loc('继电器', 'Relay'),
    def: loc(
      '负载板上可切换的开关，用来接入或断开负载、外部电路。负载板测试要逐个吸合释放，确认能切换、接触电阻正常。',
      'A switch on the load board that connects or disconnects loads and external circuits. The load board test closes and opens each one to check switching and contact resistance.',
    ),
    lessons: ['connection', 'fCreate'],
  },

  /* ---------------- D03 ATE 里面有什么 ---------------- */
  {
    id: 'driver',
    term: 'Driver',
    name: loc('驱动器', 'Driver'),
    def: loc(
      '通道里负责“给”的部分：把逻辑 1 / 0 变成驱动电平 VIH / VIL，推到 DUT 的输入脚上。',
      'The “give” part of a channel: it turns logic 1 / 0 into drive levels VIH / VIL and pushes them onto a DUT input.',
    ),
    lessons: ['ate', 'fIntro', 'fVector'],
  },
  {
    id: 'comparator',
    term: 'Comparator',
    name: loc('比较器', 'Comparator'),
    def: loc(
      '通道里负责“看”的部分：在 Strobe 时刻把输出电压和 VOH / VOL 比，读成 H、L 或中间值（中间值判 Fail）。',
      'The “look” part of a channel: at the strobe it checks the output voltage against VOH / VOL and reads H, L or in-between (in-between fails).',
    ),
    lessons: ['ate', 'pmu', 'fIntro', 'fVector'],
  },
  {
    id: 'timing',
    term: 'Timing',
    name: loc('时序', 'Timing'),
    def: loc(
      '决定“什么时候”：给每一拍定周期、驱动沿和 Strobe 时刻。',
      'Decides “when”: sets each cycle’s period, drive edges and strobe time.',
    ),
    lessons: ['ate', 'timing', 'fIntro'],
  },
  {
    id: 'level',
    term: 'Level',
    name: loc('电平', 'Levels'),
    def: loc(
      '决定“多高”：驱动电平 VIH / VIL 和比较门限 VOH / VOL。落到机台上就是 Level 表里的几个数。',
      'Decides “how high”: drive levels VIH / VIL and compare thresholds VOH / VOL. On the tester these are entries in the level table.',
    ),
    lessons: ['ate', 'spec', 'fVector'],
  },
  {
    id: 'strobe',
    term: 'Strobe',
    name: loc('比较时刻', 'Strobe / compare'),
    def: loc(
      '这一拍里测试机采样输出的时刻。必须落在 tPD 之后、下一个沿之前的窗口里；太早读到旧值，好芯片也会 Fail。',
      'The moment in a cycle when the tester samples the output. It must land after tPD and before the next edge; too early reads the old value and even a good part fails.',
    ),
    lessons: ['ate', 'timing', 'alu', 'bench', 'fFunc', 'fAc'],
  },
  {
    id: 'drive-edge',
    term: 'Drive Edge',
    name: loc('驱动沿', 'Drive edge'),
    def: loc(
      '这一拍里测试机给输入换值的时刻。Drive 是“什么时候给”，Strobe 是“什么时候看”。',
      'The moment in a cycle when the tester changes an input. Drive is “when to apply”; strobe is “when to look”.',
    ),
    lessons: ['ate', 'timing', 'bench'],
  },
  {
    id: 'period',
    term: 'Period',
    name: loc('测试周期', 'Test period / cycle'),
    def: loc(
      '一拍的长度，频率 = 1 / Period，10 MHz 对应 100 ns。周期起点叫 T0，所有边沿都从 T0 算起。',
      'The length of one cycle; frequency = 1 / Period, so 10 MHz is 100 ns. The cycle start is T0 and every edge is measured from it.',
    ),
    lessons: ['ate', 'timing', 'bench', 'fFunc'],
  },
  {
    id: 'vih',
    term: 'VIH',
    name: loc('输入高电平', 'Input high voltage'),
    def: loc(
      '规格书里：不低于它，DUT 一定把输入认成 1（本站示例 2.0 V）。测试机 Level 表里同名的 VIH 是驱动 1 时给的电压，两者不是一回事。',
      'In the datasheet: at or above it the DUT always reads the input as 1 (2.0 V in this site’s examples). The tester’s level-table VIH is the voltage it drives for a 1; they are not the same thing.',
    ),
    lessons: ['ate', 'pmu', 'spec', 'dc', 'fBasics', 'fDc', 'fChar'],
  },
  {
    id: 'vil',
    term: 'VIL',
    name: loc('输入低电平', 'Input low voltage'),
    def: loc(
      '不高于它，DUT 一定把输入认成 0（示例 0.8 V）。VIL 与 VIH 之间是不确定区，DUT 认成什么都可能。',
      'At or below it the DUT always reads the input as 0 (0.8 V in the examples). Between VIL and VIH is an uncertain zone where the DUT may read either.',
    ),
    lessons: ['ate', 'pmu', 'spec', 'dc', 'fBasics', 'fDc', 'fChar'],
  },
  {
    id: 'voh',
    term: 'VOH',
    name: loc('输出高电平', 'Output high voltage'),
    def: loc(
      '输出为 1 时至少要多高（示例 ≥ 2.4 V），而且是带着 IOH 电流时的电压，写作 VOH @ IOH。比较器高于它才读成 H。',
      'How high an output 1 must be (≥ 2.4 V in the examples), measured while sourcing IOH, written VOH @ IOH. The comparator reads H only above it.',
    ),
    lessons: ['ate', 'pmu', 'dc', 'fBasics', 'fDc'],
  },
  {
    id: 'vol',
    term: 'VOL',
    name: loc('输出低电平', 'Output low voltage'),
    def: loc(
      '输出为 0 时最多多高（示例 ≤ 0.4 V），带着 IOL 电流测，写作 VOL @ IOL。比较器低于它才读成 L。',
      'How high an output 0 may be at most (≤ 0.4 V in the examples), measured while sinking IOL, written VOL @ IOL. The comparator reads L only below it.',
    ),
    lessons: ['ate', 'pmu', 'dc', 'fBasics', 'fDc'],
  },
  {
    id: 'vector-memory',
    term: 'Vector Memory',
    name: loc('向量存储器', 'Vector / pattern memory'),
    def: loc(
      '存放每一拍向量的存储器。一行只是几个字符（例如 IN = 1、OUT = L），什么时候变、变成多少伏由 Timing 和 Level 决定。',
      'The memory holding each cycle’s vector. A row is just a few characters (e.g. IN = 1, OUT = L); when it changes and to what voltage come from timing and levels.',
    ),
    lessons: ['ate', 'fIntro', 'fVector', 'fScan'],
  },
  {
    id: 'stuck-at',
    term: 'Stuck-at Fault',
    name: loc('固定型故障', 'Stuck-at fault'),
    def: loc(
      '某根线被钉在 0 或 1。只有把这根线驱成相反值、并能把差别传到输出的向量才抓得到它；哪几行 Fail 就指向哪根线。',
      'A net stuck at 0 or 1. Only a vector that drives the net to the opposite value and propagates the difference to an output can catch it; which rows fail points to which net.',
    ),
    lessons: ['ate', 'func', 'vector', 'scan', 'alu', 'bench', 'fScan'],
  },

  /* ---------------- D04 为什么测试不只是 0 和 1 ---------------- */
  {
    id: 'uncertain-zone',
    term: 'Uncertain Zone',
    name: loc('不确定区', 'Uncertain zone'),
    def: loc(
      '两条门限之间的电压：输入在 VIL 与 VIH 之间 DUT 认成什么都可能；输出在 VOL 与 VOH 之间既不是 H 也不是 L，期望什么都判 Fail。',
      'Voltages between the two thresholds: an input between VIL and VIH may be read either way; an output between VOL and VOH is neither H nor L and fails whatever was expected.',
    ),
    lessons: ['pmu', 'ate', 'fBasics'],
  },
  {
    id: 'force-measure',
    term: 'Force / Measure',
    name: loc('施加 / 测量', 'Force / measure'),
    def: loc(
      'PMU 的工作方式：施加一个量，测另一个量。测试机不会直接量欧姆，电阻是按欧姆定律算出来的。',
      'How a PMU works: force one quantity and measure the other. A tester never measures ohms directly; resistance is computed with Ohm’s law.',
    ),
    lessons: ['pmu', 'fBasics', 'fIntro'],
  },
  {
    id: 'fvmi',
    term: 'FVMI',
    name: loc('加压测流', 'Force voltage, measure current'),
    def: loc(
      'PMU 把管脚钉在一个电压上读电流。用于输入漏电 IIL / IIH、IOZ、IDDQ 等电流类参数。加压时必须设电流钳位。',
      'The PMU holds the pin at a voltage and reads the current. Used for current parameters such as IIL / IIH, IOZ and IDDQ. Forcing voltage requires a current clamp.',
    ),
    lessons: ['pmu', 'fIntro', 'fDc'],
  },
  {
    id: 'fimv',
    term: 'FIMV',
    name: loc('加流测压', 'Force current, measure voltage'),
    def: loc(
      'PMU 往管脚灌或抽一个固定电流读电压。用于开短路、VOH / VOL 等。加流时必须设电压钳位。',
      'The PMU pushes or pulls a fixed current through the pin and reads the voltage. Used for opens / shorts and VOH / VOL. Forcing current requires a voltage clamp.',
    ),
    lessons: ['pmu', 'fIntro', 'fOpens', 'fDc'],
  },
  {
    id: 'opens-shorts',
    term: 'Opens / Shorts',
    name: loc('开短路测试', 'Continuity test'),
    def: loc(
      '第一项测试，确认每路通道真的接到了每个管脚：所有脚接 0 V，PMU 打 −100 µA，正常读到约 −0.65 V；开路撞钳位，短路接近 0 V。',
      'The first test, confirming every channel really reaches every pin: all pins at 0 V, the PMU forces −100 µA; a good pin reads about −0.65 V, an open hits the clamp, a short reads near 0 V.',
    ),
    lessons: ['pmu', 'program', 'fOpens', 'fCreate'],
  },
  {
    id: 'protection-diode',
    term: 'Protection Diode',
    name: loc('保护二极管', 'ESD protection diode'),
    def: loc(
      '每个信号脚对 VSS、对 VDD 各有一只。开短路就是让它正偏，读一个二极管压降（约 0.65 V）；管脚电压超出电源轨时它导通，可能把电流注入衬底触发闩锁。',
      'Every signal pin has one to VSS and one to VDD. Opens / shorts forward-biases it and reads one diode drop (about 0.65 V); a pin driven beyond the rails turns it on and can inject current that triggers latch-up.',
    ),
    lessons: ['pmu', 'fOpens', 'fLatch'],
  },
  {
    id: 'clamp',
    term: 'Clamp',
    name: loc('钳位', 'Clamp'),
    def: loc(
      '限制 PMU 输出电压或电流的电路，保护操作员、硬件和 DUT。加流设电压钳位，加压设电流钳位；钳位值要设在 Fail 极限之外，否则这条测试永远不会 Fail。',
      'A circuit limiting the PMU’s output voltage or current to protect the operator, hardware and DUT. Forcing current needs a voltage clamp, forcing voltage a current clamp; set it beyond the fail limit or the test can never fail.',
    ),
    lessons: ['pmu', 'fIntro', 'fOpens'],
  },
  {
    id: 'kelvin',
    term: 'Kelvin Connection',
    name: loc('开尔文连接（四线制）', 'Kelvin (four-wire) connection'),
    def: loc(
      '两根 Force 线走电流，两根 Sense 线到 DUT 附近量电压。Sense 线不走电流、没有压降，PMU 据此补上导线压降，加到 DUT 上的电压才准。',
      'Two force lines carry the current and two sense lines measure the voltage near the DUT. Sense lines carry no current and drop no voltage, so the PMU can compensate for the wiring drop.',
    ),
    lessons: ['pmu', 'fIntro', 'fCreate'],
  },
  {
    id: 'iil-iih',
    term: 'IIL / IIH',
    name: loc('输入漏电流', 'Input leakage current'),
    def: loc(
      '输入脚接低 / 接高时流过的漏电，用 FVMI 测，本质是在量输入脚到 VDD / VSS 的电阻（5.25 V ÷ 10 µA ≥ 525 kΩ）。',
      'Leakage through an input held low / high, measured with FVMI. It really measures the resistance from the pin to VDD / VSS (5.25 V ÷ 10 µA ≥ 525 kΩ).',
    ),
    lessons: ['pmu', 'dc', 'program', 'bench', 'fDc'],
  },
  {
    id: 'iddq',
    term: 'IDDQ',
    name: loc('静态电源电流', 'Quiescent supply current'),
    def: loc(
      '芯片静止、不翻转时的电源电流。正常只有微安级，偏大说明有漏电或缺陷；闩锁测试也用它作基准。',
      'The supply current while the chip is static. Normally only microamps; a high value points to leakage or defects. Latch-up testing uses it as a reference.',
    ),
    lessons: ['pmu', 'fDc', 'fLatch'],
  },

  /* ---------------- D05 从 Datasheet 到 Test Spec ---------------- */
  {
    id: 'datasheet',
    term: 'Datasheet',
    name: loc('数据手册 / 器件规格', 'Datasheet / device spec'),
    def: loc(
      '器件对用户的承诺，例如“输入不低于 2.0 V 一定认成 1”。它说承诺什么，不说怎么测。',
      'What the part promises the user, e.g. “any input at or above 2.0 V reads as 1”. It says what is promised, not how to test it.',
    ),
    lessons: ['spec', 'fSpec'],
  },
  {
    id: 'test-spec',
    term: 'Test Spec',
    name: loc('测试规格', 'Test specification'),
    def: loc(
      '把承诺写成能判定的测试项：在什么条件下测、什么结果算过。条件 + 极限 = 一条测试。',
      'Turns the promise into judgeable items: the test conditions and what counts as a pass. Conditions + limits = one test.',
    ),
    lessons: ['spec', 'fSpec'],
  },
  {
    id: 'spec-spine',
    term: 'Datasheet → Pass / Fail',
    name: loc('五层主线', 'The five-layer spine'),
    def: loc(
      'Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail。程序里的每个数都应能追溯到规格里的一行。',
      'Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail. Every number in the program should trace back to a line in the spec.',
    ),
    lessons: ['spec'],
  },
  {
    id: 'limit',
    term: 'Limit',
    name: loc('测试极限', 'Test limit'),
    def: loc(
      '测量值要和它比的界限。芯片没变、极限拧紧了，结果也会从 Pass 变成 Fail——测试判的是规格。',
      'The bound a measurement is compared with. With the same chip, tightening the limit can turn a pass into a fail: a test judges against the spec.',
    ),
    lessons: ['spec', 'program', 'bench', 'fSpec'],
  },
  {
    id: 'worst-case',
    term: 'Worst Case',
    name: loc('最坏条件', 'Worst-case conditions'),
    def: loc(
      '在最难过的条件下测：例如 VIH 用规格边沿 2.0 V、VOH 在 VDDmin、漏电和 IDD 在 VDDmax。最坏条件下能过，其它条件自然能过。',
      'Test where passing is hardest: VIH at the 2.0 V spec edge, VOH at VDDmin, leakage and IDD at VDDmax. Passing the worst case covers the rest.',
    ),
    lessons: ['spec', 'fSpec', 'fDc', 'fAc'],
  },
  {
    id: 'dc-test',
    term: 'DC Test',
    name: loc('直流参数测试', 'DC parametric test'),
    def: loc(
      '问“电平对不对、电流超没超”：VIH / VIL、VOH / VOL、IIL / IIH、IOZ、IDD 等静态量。',
      'Asks “is the level right, is the current within limits?”: static quantities such as VIH / VIL, VOH / VOL, IIL / IIH, IOZ and IDD.',
    ),
    lessons: ['spec', 'dc', 'program', 'fIntro', 'fDc'],
  },
  {
    id: 'ac-test',
    term: 'AC Test',
    name: loc('交流参数测试', 'AC parametric test'),
    def: loc(
      '问“来不来得及”：Setup、Hold、tPD、脉宽、fMAX 等时间类参数。',
      'Asks “is it fast enough?”: timing parameters such as setup, hold, tPD, pulse width and fMAX.',
    ),
    lessons: ['spec', 'timing', 'program', 'fIntro', 'fAc'],
  },
  {
    id: 'idd',
    term: 'IDD',
    name: loc('电源电流', 'Supply current'),
    def: loc(
      '流进 VDD 脚的电流，DC 类静态量。程序里先粗查（Gross IDD），电源对地短路的芯片在这里就停下。',
      'The current into the VDD pin, a static DC quantity. Programs check it coarsely first (gross IDD), stopping chips with a power-to-ground short.',
    ),
    lessons: ['spec', 'dc', 'program', 'fDc'],
  },
  {
    id: 'tpd',
    term: 'tPD',
    name: loc('传输延迟', 'Propagation delay'),
    def: loc(
      '从输入（或 CLK）沿到输出稳定的延迟。沿后到 tPD 之间输出还在变，在这里采样会出错。',
      'The delay from an input (or CLK) edge until the output is stable. Between the edge and tPD the output is still changing; sampling there gives wrong data.',
    ),
    lessons: ['spec', 'timing', 'program', 'alu', 'bench', 'fAc', 'fChar'],
  },
  {
    id: 'fmax',
    term: 'fMAX',
    name: loc('最高工作频率', 'Maximum operating frequency'),
    def: loc(
      '功能仍正确的最高频率。Period 缩短到输出窗口（Period − tPD）放不下 Strobe 时就 Fail，这条边界就是 fMAX。',
      'The highest frequency at which the function is still correct. When Period shrinks until the output window (Period − tPD) cannot fit the strobe, it fails; that boundary is fMAX.',
    ),
    lessons: ['spec', 'timing', 'shmoo', 'alu', 'bench', 'fAc'],
  },

  /* ---------------- D06 DC Test ---------------- */
  {
    id: 'ioh-iol',
    term: 'IOH / IOL',
    name: loc('输出高 / 低电平电流', 'Output high / low current'),
    def: loc(
      '测 VOH / VOL 时规定要带的负载电流。输出管有导通电阻，电流越大 VOH 掉得越多、VOL 抬得越高，不带电流测坏的驱动也能过。',
      'The load current specified for VOH / VOL. The output transistor has on-resistance, so more current pulls VOH down and VOL up; without the current a weak driver still passes.',
    ),
    lessons: ['dc', 'fDc'],
  },
  {
    id: 'r-on',
    term: 'R_on',
    name: loc('导通电阻', 'On-resistance'),
    def: loc(
      '把输出管看成一个电阻：VOH = VDD − IOH × R_on，VOL = IOL × R_on。R_on 偏大就是驱动不够。',
      'Treat the output transistor as a resistor: VOH = VDD − IOH × R_on, VOL = IOL × R_on. A high R_on means weak drive.',
    ),
    lessons: ['dc', 'fDc'],
  },
  {
    id: 'source-sink',
    term: 'Source / Sink',
    name: loc('拉电流 / 灌电流', 'Source / sink'),
    def: loc(
      '测 VOH 时电流从 DUT 流出（DUT Source、PMU 吸电流）；测 VOL 时 PMU 往 DUT 灌电流（DUT Sink）。',
      'For VOH the current flows out of the DUT (the DUT sources, the PMU draws); for VOL the PMU pushes current into the DUT (the DUT sinks).',
    ),
    lessons: ['dc', 'fDc'],
  },
  {
    id: 'ioz',
    term: 'IOZ',
    name: loc('高阻态漏电流', 'Off-state (high-Z) leakage'),
    def: loc(
      '输出关成高阻时的漏电。预处理让输出高阻，PMU 加 VDDmax 量 IOZH、加 0 V 量 IOZL。',
      'Leakage of an output switched to high-Z. Precondition the output off, then the PMU forces VDDmax for IOZH and 0 V for IOZL.',
    ),
    lessons: ['dc', 'fDc'],
  },

  /* ---------------- D07 Functional Test ---------------- */
  {
    id: 'functional-test',
    term: 'Functional Test',
    name: loc('功能测试', 'Functional test'),
    def: loc(
      '按真值表驱动输入、在 Strobe 时刻比较输出，问芯片“会不会算对”。哪几行 Fail 是排错的起点。',
      'Drives inputs per the truth table and compares outputs at the strobe, asking “does the chip compute correctly?”. Which rows fail is where debug starts.',
    ),
    lessons: ['func', 'program', 'fIntro', 'fFunc'],
  },
  {
    id: 'truth-table',
    term: 'Truth Table',
    name: loc('真值表', 'Truth table'),
    def: loc(
      '列出每种输入组合下输出应该是什么。每一行就是一条测试向量。',
      'Lists the expected output for every input combination. Each row is one test vector.',
    ),
    lessons: ['func', 'vector', 'fBasics'],
  },
  {
    id: 'logic-gate',
    term: 'Logic Gate',
    name: loc('逻辑门', 'Logic gate'),
    def: loc(
      'AND、OR、XOR、反相器等组合门，输出只取决于当前输入。XOR“不同才为 1”，与门只有全 1 才输出 1。',
      'Combinational gates such as AND, OR, XOR and inverters, whose output depends only on present inputs. XOR is 1 only when inputs differ; AND outputs 1 only when all are 1.',
    ),
    lessons: ['func', 'vector', 'fBasics'],
  },
  {
    id: 'vector-chars',
    term: '1 / 0 / H / L / X',
    name: loc('向量字符', 'Vector characters'),
    def: loc(
      '1 / 0 = 驱动高 / 低（输入）；H / L = 期望高 / 低，只比较不驱动（输出）；X = 这一拍不比较。',
      '1 / 0 = drive high / low (inputs); H / L = expect high / low, compare only, no drive (outputs); X = do not compare this cycle.',
    ),
    lessons: ['func', 'intro', 'fFunc', 'fVector'],
  },
  {
    id: 'mask',
    term: 'Mask',
    name: loc('屏蔽（不比较）', 'Mask / don’t care'),
    def: loc(
      '这一拍这个输出不比较，例如上电后还不确定的状态、Scan 里结果不确定的位（X 屏蔽）。',
      'This output is not compared in this cycle, e.g. a state still unknown after power-up, or unknown bits in scan (X-masking).',
    ),
    lessons: ['func', 'scan', 'fFunc', 'fVector'],
  },

  /* ---------------- D08 Timing 与 AC ---------------- */
  {
    id: 'setup-time',
    term: 'Setup Time (tSU)',
    name: loc('建立时间', 'Setup time'),
    def: loc(
      'CLK 沿到来之前 DATA 必须已经稳定的最短时间，相对 CLK 沿量输入。',
      'The minimum time DATA must be stable before the CLK edge, measured on the input relative to the edge.',
    ),
    lessons: ['timing', 'fAc', 'fChar'],
  },
  {
    id: 'hold-time',
    term: 'Hold Time (tH)',
    name: loc('保持时间', 'Hold time'),
    def: loc(
      'CLK 沿过后 DATA 还要保持不变的最短时间。',
      'The minimum time DATA must stay unchanged after the CLK edge.',
    ),
    lessons: ['timing', 'fAc', 'fChar'],
  },
  {
    id: 'output-window',
    term: 'Output Window',
    name: loc('输出有效窗口', 'Valid output window'),
    def: loc(
      'tPD 之后到下一个 CLK 沿之前、输出稳定的那段时间，宽度 = Period − tPD。Strobe 必须放在里面，还要留出测试机边沿精度的余量。',
      'The span after tPD and before the next CLK edge when the output is stable; width = Period − tPD. The strobe must sit inside, with room for the tester’s edge accuracy.',
    ),
    lessons: ['timing', 'bench'],
  },

  /* ---------------- D09 测试向量开发 ---------------- */
  {
    id: 'exhaustive',
    term: 'Exhaustive Testing',
    name: loc('穷举测试', 'Exhaustive testing'),
    def: loc(
      '把所有输入组合都跑一遍：n 个输入要 2ⁿ 条，再加 s 个触发器至少 2ⁿ⁺ˢ 条。几十位就要几千年，交不了货，而且穷举也不等于故障覆盖率。',
      'Running every input combination: n inputs need 2ⁿ vectors, plus s flip-flops at least 2ⁿ⁺ˢ. A few dozen bits take thousands of years, and exhaustive is not the same as fault coverage.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'atpg',
    term: 'ATPG',
    name: loc('自动测试向量生成', 'Automatic Test Pattern Generation'),
    def: loc(
      '读门级网表和故障列表，对每个故障自动搜一条能抓到它的向量，存成 Pattern 文件交给 ATE 回放，并报出故障覆盖率。',
      'Reads the gate-level netlist and fault list, searches for a vector that catches each fault, stores the result as a pattern file for the ATE, and reports fault coverage.',
    ),
    lessons: ['vector', 'scan'],
  },
  {
    id: 'algorithmic-pattern',
    term: 'Algorithmic Pattern',
    name: loc('算法向量', 'Algorithmic pattern'),
    def: loc(
      '面向 Memory 这类规则阵列：写一段算法，由 ATE 的算法引擎按地址现场生成每一拍，不预先存 2ⁿ 条。',
      'For regular arrays such as memory: write an algorithm and the ATE’s algorithmic generator computes each cycle from the address on the fly, instead of storing 2ⁿ vectors.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'functional-vectors',
    term: 'Functional Vectors',
    name: loc('功能向量', 'Functional vectors'),
    def: loc(
      '按规格书、真值表手写的向量，也叫应用型 / 并行向量。证明“功能对”，但说不出覆盖了多少故障。',
      'Vectors written by hand from the datasheet and truth table, also called application or parallel vectors. They prove the function but say nothing about fault coverage.',
    ),
    lessons: ['vector', 'fFunc', 'fIntro'],
  },
  {
    id: 'fault-model',
    term: 'Fault Model',
    name: loc('故障模型', 'Fault model'),
    def: loc(
      '把物理缺陷抽象成可计算的故障，例如 Stuck-at、Transition。ATPG 按故障模型搜向量。',
      'An abstraction of physical defects into computable faults such as stuck-at and transition faults. ATPG searches vectors against a fault model.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'fault-coverage',
    term: 'Fault Coverage',
    name: loc('故障覆盖率', 'Fault coverage'),
    def: loc(
      '一套向量能抓到的故障占故障列表的比例。ATPG 能报出这个数，手写功能向量报不出。',
      'The fraction of the fault list a vector set can catch. ATPG reports it; hand-written functional vectors cannot.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'activate-propagate',
    term: 'Activate / Propagate',
    name: loc('激活与传播', 'Activate and propagate'),
    def: loc(
      '一条向量要抓住故障，先要让好电路在故障点出现相反值（激活），再把差别传到输出（传播）。例如与门 A 粘 0，只有 11 能抓到。',
      'To catch a fault a vector must give the good circuit the opposite value at the fault site (activate) and carry the difference to an output (propagate). For an AND gate with A stuck-at-0, only 11 works.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'equivalent-fault',
    term: 'Equivalent Faults',
    name: loc('等价故障', 'Equivalent faults'),
    def: loc(
      '需要同一条向量才能抓到、在输出上表现一样的几个故障，例如与门的 A 粘 0 和 Y 粘 0。',
      'Faults caught by the same vector and indistinguishable at the output, e.g. A stuck-at-0 and Y stuck-at-0 on an AND gate.',
    ),
    lessons: ['vector'],
  },
  {
    id: 'transition-fault',
    term: 'Transition Fault',
    name: loc('跳变故障', 'Transition fault'),
    def: loc(
      '慢升 / 慢降：电平最终对，但这一拍来不及。要一对向量：先放旧值，再发起跳变，用快时钟 Capture。',
      'Slow-to-rise / slow-to-fall: the level is eventually right but too late for the cycle. It needs a vector pair: set the old value, launch the transition, capture with a fast clock.',
    ),
    lessons: ['vector', 'scan'],
  },
  {
    id: 'netlist',
    term: 'Gate-level Netlist',
    name: loc('门级网表', 'Gate-level netlist'),
    def: loc(
      '用逻辑门和触发器描述的电路连接关系，ATPG 的输入。',
      'The circuit described as gates and flip-flops with their connections; the input to ATPG.',
    ),
    lessons: ['vector'],
  },

  /* ---------------- D10 Scan Test ---------------- */
  {
    id: 'flip-flop',
    term: 'Flip-Flop (FF)',
    name: loc('触发器', 'Flip-flop'),
    def: loc(
      '边沿触发的 1 位存储：只在 CLK 上升沿把 D 抄到 Q，其余时间 Q 不变。芯片的状态存在这里。它和闩锁（Latch-up）无关。',
      'A 1-bit edge-triggered store: on the rising CLK edge it copies D to Q, holding otherwise. Chip state lives here. It has nothing to do with latch-up.',
    ),
    lessons: ['scan', 'fBasics', 'fScan'],
  },
  {
    id: 'combinational-logic',
    term: 'Combinational Logic',
    name: loc('组合逻辑', 'Combinational logic'),
    def: loc(
      '输出只取决于当前输入、没有记忆的门电路。Scan 测的就是 Capture 那一拍里 FF 之间的组合逻辑。',
      'Gates with no memory whose outputs depend only on present inputs. Scan tests the combinational logic between FFs on the capture clock.',
    ),
    lessons: ['scan', 'fBasics', 'fScan'],
  },
  {
    id: 'scan-chain',
    term: 'Scan Chain',
    name: loc('扫描链', 'Scan chain'),
    def: loc(
      '测试模式下把所有 FF 串成一条移位寄存器：SI → FF1 → … → SO，直接把状态移进去、移出来。解决外部 Pin 够不到内部状态的问题。',
      'In test mode all FFs are chained into one shift register, SI → FF1 → … → SO, so state can be shifted straight in and out. It solves the problem that pins cannot reach internal state.',
    ),
    lessons: ['scan', 'fFunc', 'fScan'],
  },
  {
    id: 'scan-ff',
    term: 'Scan FF',
    name: loc('扫描触发器', 'Scan flip-flop'),
    def: loc(
      '普通 FF 的 D 前加一个二选一 MUX：SE = 0 选功能 D，SE = 1 选上一级 Q。',
      'A plain FF with a 2-to-1 MUX before D: SE = 0 selects the functional D, SE = 1 selects the previous Q.',
    ),
    lessons: ['scan', 'fScan'],
  },
  {
    id: 'se-si-so',
    term: 'SE / SI / SO',
    name: loc('扫描使能 / 输入 / 输出', 'Scan enable / in / out'),
    def: loc(
      'SE 选择移位还是正常工作；SI 是链的入口，SO 是链的出口（最后一个 FF 的 Q）。',
      'SE selects shifting or normal operation; SI is the chain input and SO the chain output (the Q of the last FF).',
    ),
    lessons: ['scan', 'fScan'],
  },
  {
    id: 'shift',
    term: 'Shift',
    name: loc('移位', 'Shift'),
    def: loc(
      'SE = 1，每打一拍时钟，链上每位往后挪一格：移入激励，同时移出上一条的结果。',
      'With SE = 1, each clock moves every bit one place along the chain: the stimulus shifts in while the previous result shifts out.',
    ),
    lessons: ['scan', 'fScan'],
  },
  {
    id: 'capture',
    term: 'Capture',
    name: loc('捕获', 'Capture'),
    def: loc(
      'SE = 0，只打一拍功能时钟，每个 FF 存下组合逻辑算出的 D。被测的就是这一拍。',
      'With SE = 0, one functional clock lets every FF store the D computed by the logic. This clock is what tests the logic.',
    ),
    lessons: ['scan', 'fScan'],
  },
  {
    id: 'scan-compression',
    term: 'Scan Compression',
    name: loc('扫描压缩', 'Scan compression'),
    def: loc(
      '外部只用几个 SI / SO，片内解压成许多短链，结果再压缩回来，缩短 Shift 时间、省管脚。',
      'A few external SI / SO pins feed many short internal chains through a decompressor and compactor, cutting shift time and pins.',
    ),
    lessons: ['scan'],
  },
  {
    id: 'at-speed-scan',
    term: 'At-speed Scan',
    name: loc('全速扫描', 'At-speed scan'),
    def: loc(
      'Capture 用接近工作频率的时钟，抓“来不及”的慢路径（Transition 故障）。',
      'Capture at near-functional speed to catch slow paths (transition faults).',
    ),
    lessons: ['scan'],
  },
  {
    id: 'boundary-scan',
    term: 'Boundary Scan / JTAG',
    name: loc('边界扫描', 'Boundary scan'),
    def: loc(
      '管脚旁边一圈扫描单元，用来测板级连线和焊接，不是测片内逻辑。',
      'A ring of scan cells next to the pins that tests board connections and solder joints, not internal logic.',
    ),
    lessons: ['scan', 'fFunc'],
  },
  {
    id: 'bist',
    term: 'BIST',
    name: loc('内建自测试', 'Built-In Self-Test'),
    def: loc(
      '芯片自己产生向量、压缩结果，ATE 只比最后的签名。Logic BIST 测逻辑，Memory BIST 测存储阵列。',
      'The chip generates its own patterns and compacts the results; the ATE checks only the final signature. Logic BIST covers logic, memory BIST covers arrays.',
    ),
    lessons: ['scan', 'fFunc'],
  },

  /* ---------------- D11 测试程序与排错 ---------------- */
  {
    id: 'test-flow',
    term: 'Test Flow',
    name: loc('测试流程', 'Test flow'),
    def: loc(
      '程序里测试项的顺序，典型是开短路 → 上电 / IDD → 功能 → DC → AC。量产中任何一项 Fail 即停，按这一项分 Bin。',
      'The order of test items, typically opens / shorts → power-up / IDD → functional → DC → AC. In production the flow stops at the first failure and bins by that item.',
    ),
    lessons: ['program', 'fDc', 'fProgram'],
  },
  {
    id: 'test-item',
    term: 'Test Item',
    name: loc('测试项', 'Test item'),
    def: loc(
      '程序里的一条测试，四件套：条件（电压、时序、负载）+ 向量 + 极限 + Fail Bin。',
      'One test in the program, made of four parts: conditions (voltage, timing, load) + vectors + limits + fail bin.',
    ),
    lessons: ['program', 'alu'],
  },
  {
    id: 'four-suspects',
    term: 'Four Suspects',
    name: loc('四个嫌疑对象', 'The four suspects'),
    def: loc(
      'Fail 时要怀疑的四样：测试程序、测试机、接口硬件（负载板、Socket、针卡）、芯片本身。先查便宜又能一次排除最多的，芯片放最后。',
      'What to suspect on a failure: the test program, the tester, the interface hardware (load board, socket, probe card) and the chip. Check what is cheapest and rules out the most first; the chip comes last.',
    ),
    lessons: ['program', 'fDebug'],
  },
  {
    id: 'pin-map',
    term: 'Pin Map',
    name: loc('管脚映射', 'Pin map'),
    def: loc(
      'DUT 管脚和测试机通道的对应表。映射错了，所有芯片会在同一项一起 Fail；建表时要查重复通道、管脚方向写错。',
      'The table pairing DUT pins with tester channels. A wrong map makes every chip fail the same item; check for duplicate channels and wrong pin directions.',
    ),
    lessons: ['program', 'fCreate'],
  },
  {
    id: 'vdd-min-max',
    term: 'VDDmin / VDDmax',
    name: loc('最低 / 最高工作电压', 'Minimum / maximum supply voltage'),
    def: loc(
      '规格允许的电源范围两端。每一项按自己的最坏情况选一端：VOH 等输出驱动在 VDDmin，漏电、IDD、IOS 在 VDDmax；功能常两端都跑。',
      'The two ends of the allowed supply range. Each test picks its own worst case: output drive such as VOH at VDDmin; leakage, IDD and IOS at VDDmax; functional often at both.',
    ),
    lessons: ['program', 'fSpec', 'fDc', 'fChar', 'fQualify', 'fLatch'],
  },

  /* ---------------- D12 Yield、表征、Shmoo ---------------- */
  {
    id: 'characterization',
    term: 'Characterization',
    name: loc('表征', 'Characterization'),
    def: loc(
      '量产只在几个条件上判 Pass / Fail；表征要回答芯片到底能工作到哪里，工具是二分 / 线性搜索和 Shmoo。',
      'Production checks pass / fail at a few conditions; characterization asks where the chip really stops working, using binary / linear search and shmoo plots.',
    ),
    lessons: ['shmoo', 'fIntro', 'fChar'],
  },
  {
    id: 'shmoo',
    term: 'Shmoo Plot',
    name: loc('Shmoo 图', 'Shmoo plot'),
    def: loc(
      '同一套功能向量，在每一个（VDD，频率）组合上跑一遍，每格记 Pass 或 Fail，画出芯片的工作边界。',
      'Run the same functional vectors at every (VDD, frequency) pair and record pass or fail in each cell, mapping the chip’s working boundary.',
    ),
    lessons: ['shmoo', 'fChar', 'fDebug'],
  },
  {
    id: 'spec-box',
    term: 'Spec Box',
    name: loc('规格框', 'Spec box'),
    def: loc(
      'Shmoo 图上规格允许的条件范围（例如 0.90–1.10 V、≤ 400 MHz）。框内必须 Pass，框外 Pass 的部分就是裕量。',
      'The range of conditions the spec allows on a shmoo (e.g. 0.90–1.10 V, ≤ 400 MHz). Everything inside must pass; passing area outside is margin.',
    ),
    lessons: ['shmoo'],
  },
  {
    id: 'margin',
    term: 'Margin',
    name: loc('裕量', 'Margin'),
    def: loc(
      '一个参数在出现 Fail 之前还能被改变多少。离规格越远，越不怕温度、老化和测试机误差；小于约 10% 的参数要在量产前查清。',
      'How far a parameter can move before a failure. The farther from the spec, the safer against temperature, aging and tester error; parameters under about 10% need attention before production.',
    ),
    lessons: ['shmoo', 'fQualify'],
  },
  {
    id: 'vmin',
    term: 'Vmin',
    name: loc('最低工作电压', 'Minimum operating voltage'),
    def: loc(
      '低于它电路已不能可靠翻转和保持数据，频率再低也 Fail。Shmoo 上是一条水平边界，和速度无关。',
      'Below it the circuit can no longer switch and hold data reliably, so it fails at any frequency. On a shmoo it is a horizontal edge, unrelated to speed.',
    ),
    lessons: ['shmoo'],
  },
  {
    id: 'shmoo-hole',
    term: 'Hole / Island',
    name: loc('空洞 / 孤岛', 'Hole / island'),
    def: loc(
      '空洞：四周都 Pass 偏偏这里 Fail；孤岛：按边界本该 Fail 却 Pass。边界不连续，说明有间歇性失效、噪声或程序设置问题，要先排查。',
      'A hole fails although everything around it passes; an island passes where the boundary says it should fail. A broken boundary points to intermittent failures, noise or a program setting, so investigate first.',
    ),
    lessons: ['shmoo'],
  },

  /* ---------------- D13 虚拟 ALU ---------------- */
  {
    id: 'alu',
    term: 'ALU',
    name: loc('算术逻辑单元', 'Arithmetic logic unit'),
    def: loc(
      '按操作码做加法、与、或、异或、移位等运算的电路。{@alu} 用一颗 4 位 ALU 从读规格走到写程序、注入故障。',
      'A circuit that performs add, AND, OR, XOR, shifts and so on by opcode. {@alu} takes a 4-bit ALU from reading the spec to writing the program and injecting faults.',
    ),
    lessons: ['alu'],
  },
  {
    id: 'carry',
    term: 'Carry',
    name: loc('进位', 'Carry'),
    def: loc(
      '加法溢出或移位移出的那一位。测 ALU 要专门用 0xF + 0x1 这类向量把进位逼出来。',
      'The bit produced by an add overflow or shifted out. ALU tests need vectors such as 0xF + 0x1 to force it out.',
    ),
    lessons: ['alu'],
  },
  {
    id: 'fault-injection',
    term: 'Fault Injection',
    name: loc('故障注入', 'Fault injection'),
    def: loc(
      '故意给模型加一个已知故障（Stuck-at、Strobe 过早、运算做错），看哪些测试项、哪几拍会 Fail，练习从现象反推原因。',
      'Deliberately adding a known fault to a model (stuck-at, early strobe, wrong operation) to see which items and cycles fail, practising reasoning back from symptoms.',
    ),
    lessons: ['alu'],
  },

  /* ---------------- D14 Latch-up ---------------- */
  {
    id: 'latch-up',
    term: 'Latch-up',
    name: loc('闩锁效应', 'Latch-up'),
    def: loc(
      'CMOS 里寄生的 PNPN 被触发后，正反馈把 VDD–GND 锁成低阻通路，IDD 飙升；撤掉触发也不熄，只有掉电才解除。',
      'Once the parasitic PNPN in CMOS is triggered, positive feedback locks VDD–GND into a low-resistance path and IDD soars; it stays on after the trigger is removed and only power-down clears it.',
    ),
    lessons: ['latch', 'program', 'fDc', 'fProgram', 'fLatch'],
  },
  {
    id: 'scr',
    term: 'SCR / PNPN',
    name: loc('寄生晶闸管', 'Parasitic thyristor'),
    def: loc(
      'P+（接 VDD）→ N 阱 → P 衬底 → N+（接 GND）四层交替形成的可控硅。平时关着，导通后两端只剩约 1 V，电流由外部电路决定。',
      'The four alternating layers P+ (at VDD) → N-well → P-substrate → N+ (at GND) form a thyristor. Normally off; once on, only about 1 V remains across it and the external circuit sets the current.',
    ),
    lessons: ['latch', 'fLatch'],
  },
  {
    id: 'parasitic-bjt',
    term: 'Parasitic PNP / NPN',
    name: loc('寄生双极管', 'Parasitic bipolar transistors'),
    def: loc(
      'CMOS 结构自带、原理图上没有的两只三极管。NPN 的集电极就是 PNP 的基极，反过来也一样，交叉相连形成正反馈。',
      'Two transistors that come with the CMOS structure but are not in the schematic. The NPN collector is the PNP base and vice versa; this cross-coupling creates positive feedback.',
    ),
    lessons: ['latch'],
  },
  {
    id: 'rwell-rsub',
    term: 'Rwell / Rsub',
    name: loc('阱电阻 / 衬底电阻', 'Well / substrate resistance'),
    def: loc(
      'N 阱和 P 衬底都不是理想导体。电流流过时产生约 0.7 V 压降，就能让寄生管的发射结正偏而打开。',
      'Neither the N-well nor the P-substrate is a perfect conductor. Current through them builds about 0.7 V, enough to forward-bias a parasitic transistor’s emitter junction.',
    ),
    lessons: ['latch'],
  },
  {
    id: 'holding-current',
    term: 'Holding Current (IH)',
    name: loc('维持电流', 'Holding current'),
    def: loc(
      '闩锁后维持导通所需的最小电流。只要电流高于 IH 环路就不灭；掉电或串大电阻让电流低于 IH 才能解除。',
      'The minimum current that keeps a latched SCR on. Above IH the loop persists; only power-down or enough series resistance to drop below IH releases it.',
    ),
    lessons: ['latch', 'fLatch'],
  },
  {
    id: 'current-limit',
    term: 'Current Limit',
    name: loc('电源限流', 'Supply current limit'),
    def: loc(
      '电源输出电流的上限。测试中 IDD 突然像短路时，先靠它保护芯片，再掉电。',
      'The ceiling on supply output current. When IDD suddenly looks like a short in test, it protects the chip until power is removed.',
    ),
    lessons: ['latch', 'fLatch'],
  },
  {
    id: 'esd',
    term: 'ESD',
    name: loc('静电放电', 'Electrostatic discharge'),
    def: loc(
      '静电瞬间放电，是闩锁的触发源之一；HBM / CDM 等完整 ESD 测试属于可靠性轨道。',
      'A sudden static discharge, one of the triggers of latch-up; full ESD testing such as HBM / CDM belongs to the reliability track.',
    ),
    lessons: ['latch'],
  },
  {
    id: 'power-sequence',
    term: 'Power Sequencing',
    name: loc('上下电顺序', 'Power-up / power-down sequence'),
    def: loc(
      '上电：全部置 0（驱动器开）→ VDD → VIL / VIH → 负载；下电反过来。任何脚都不能高过 VDD 0.5 V，顺序错可能触发闩锁。',
      'Power-up: everything to 0 (drivers on) → VDD → VIL / VIH → load; power-down in reverse. No pin may exceed VDD by 0.5 V; a wrong order can trigger latch-up.',
    ),
    lessons: ['latch', 'fProgram', 'fLatch'],
  },
  {
    id: 'cmos',
    term: 'CMOS',
    name: loc('互补金属氧化物半导体', 'Complementary MOS'),
    def: loc(
      'P 沟道和 N 沟道 MOS 做在一起的工艺，靠阱把两种管子隔开；静态电流很小，但结构里藏着寄生 PNPN。',
      'A process that builds P-channel and N-channel MOS together, isolated by wells; static current is tiny, but the structure hides a parasitic PNPN.',
    ),
    lessons: ['latch', 'fBasics', 'fLatch'],
  },

  /* ---------------- F01 电学与数字逻辑基础 ---------------- */
  {
    id: 'ohms-law',
    term: 'Ohm’s Law',
    name: loc('欧姆定律', 'Ohm’s law'),
    def: loc(
      'E = I × R，知道两个就能算第三个。DC 测试本质就是欧姆定律：每条规格背后都藏着一个电阻。',
      'E = I × R; know two and compute the third. DC testing is Ohm’s law at heart: every spec hides a resistor.',
    ),
    lessons: ['fBasics', 'fIntro', 'fDc'],
  },
  {
    id: 'si-prefix',
    term: 'SI Prefixes',
    name: loc('单位前缀', 'SI prefixes'),
    def: loc(
      'G、M、k、m、µ、n 等，每档差 1000 倍。测试里常见 mA、µA、ns、MHz。',
      'G, M, k, m, µ, n and so on, each step a factor of 1000. Common in test: mA, µA, ns, MHz.',
    ),
    lessons: ['fBasics'],
  },
  {
    id: 'binary-hex',
    term: 'Binary / Hex',
    name: loc('二进制 / 十六进制', 'Binary / hexadecimal'),
    def: loc(
      '二进制每位只有 0 和 1（一个 bit）；每 4 位写成一个十六进制位，8 bit = 1 byte = 两位十六进制，FF = 255。',
      'Each binary digit is 0 or 1 (one bit); every 4 bits make one hex digit, and 8 bits = 1 byte = two hex digits, so FF = 255.',
    ),
    lessons: ['fBasics', 'alu'],
  },
  {
    id: 'noise-margin',
    term: 'Noise Margin',
    name: loc('噪声容限', 'Noise margin'),
    def: loc(
      '输出“严出”、输入“宽进”之间的差：输出 0 最多 0.4 V、输入到 0.8 V 还认 0，所以叠加 0.4 V 噪声也不出错；1 这一侧 2.4 − 2.0 = 0.4 V。',
      'The gap between strict outputs and tolerant inputs: an output 0 is at most 0.4 V while an input still reads 0 up to 0.8 V, so 0.4 V of noise is tolerated; on the 1 side, 2.4 − 2.0 = 0.4 V.',
    ),
    lessons: ['fBasics'],
  },

  /* ---------------- F02 晶圆、封装与测试设备 ---------------- */
  {
    id: 'dicing',
    term: 'Dicing / Sawing',
    name: loc('划片', 'Dicing'),
    def: loc(
      '晶圆测试、标记坏片之后，把晶圆切成一颗颗 die，好 die 再去封装。',
      'After wafer sort and reject marking, the wafer is cut into individual dies and the good ones go to assembly.',
    ),
    lessons: ['fAte'],
  },
  {
    id: 'package',
    term: 'Package',
    name: loc('封装', 'Package'),
    def: loc(
      '把 die 装起来、打线、长出引脚或焊球的外壳。常见 DIP、SOP、QFP、PGA、BGA 等，形状决定 Socket 和负载板怎么做。',
      'The housing that holds the die, bonds it and gives it pins or balls. Common types are DIP, SOP, QFP, PGA and BGA; the shape decides the socket and load board.',
    ),
    lessons: ['fAte', 'intro'],
  },
  {
    id: 'tester-classes',
    term: 'Tester Classes',
    name: loc('测试机分类', 'Classes of tester'),
    def: loc(
      'Memory、模拟（线性）、混合信号、数字四类，按要测的器件选。数字测试机又按速度和通道数分低、中、高端。',
      'Memory, analog (linear), mixed-signal and digital testers, chosen by the device. Digital testers are further graded low, mid and high end by speed and channel count.',
    ),
    lessons: ['fAte'],
  },
  {
    id: 'calibration',
    term: 'Calibration',
    name: loc('校准', 'Calibration'),
    def: loc(
      '定期把测试机的电压、电流、时序和标准比对修正，读数才可信。',
      'Periodically comparing and correcting the tester’s voltage, current and timing against standards so readings can be trusted.',
    ),
    lessons: ['fAte'],
  },
  {
    id: 'temperature-forcing',
    term: 'Temperature Forcing Unit',
    name: loc('温度强制单元', 'Temperature forcing unit'),
    def: loc(
      '把 DUT 加热或冷却到规定温度的设备，用于高温、低温测试。',
      'Equipment that heats or cools the DUT to a set temperature for hot and cold testing.',
    ),
    lessons: ['fAte'],
  },

  /* ---------------- F03 测试入门：DUT、PMU 与管脚电子 ---------------- */
  {
    id: 'rvs',
    term: 'RVS',
    name: loc('参考电压源', 'Reference Voltage Supply'),
    def: loc(
      '给管脚电子的驱动器和比较器提供 VIL、VIH、VOL、VOH 参考电平。RVS 少的机器，同一时刻能设的电平种类也少。',
      'Supplies the VIL, VIH, VOL and VOH reference levels to pin-electronics drivers and comparators. Testers with few RVSs can set only a few different levels at once.',
    ),
    lessons: ['fIntro', 'fCreate'],
  },
  {
    id: 'shared-resource',
    term: 'Shared Resource / Per-pin',
    name: loc('共享资源 / 每脚独立', 'Shared vs per-pin resources'),
    def: loc(
      '几个管脚共用一组 RVS、时序或 PMU 时，只能设成一样；每脚独立（Per-pin）资源灵活、能并行，但测试机更贵。',
      'Pins sharing one set of RVSs, timing or a PMU must use the same settings; per-pin resources are flexible and run in parallel, but cost more.',
    ),
    lessons: ['fIntro', 'fDc'],
  },
  {
    id: 'tri-state',
    term: 'Tri-state / High-Z',
    name: loc('三态 / 高阻态', 'Tri-state / high impedance'),
    def: loc(
      '输出除了 0 和 1，还能关断成高阻，把总线让出来。IOZ 测的就是高阻态漏电。',
      'Besides 0 and 1, an output can switch off to high impedance and release the bus. IOZ measures the leakage in that state.',
    ),
    lessons: ['fIntro', 'fDc', 'fVector'],
  },
  {
    id: 'bidirectional',
    term: 'Bidirectional Pin',
    name: loc('双向脚', 'Bidirectional pin'),
    def: loc(
      '有时当输入、有时当输出的管脚。向量里要分清每一拍测试机是驱动、比较还是忽略。',
      'A pin that is sometimes an input and sometimes an output. The vectors must say for each cycle whether the tester drives, compares or ignores it.',
    ),
    lessons: ['fIntro', 'fFunc', 'fVector'],
  },
  {
    id: 'speed-binning',
    term: 'Speed Binning',
    name: loc('速度分档', 'Speed binning'),
    def: loc(
      '按实测速度把好芯片分到不同 Bin，例如 ≥ 150 MHz 进 Bin 1、≥ 100 MHz 进 Bin 2，太慢的判不合格。',
      'Sorting good chips into bins by measured speed, e.g. ≥ 150 MHz to bin 1 and ≥ 100 MHz to bin 2, failing the slow ones.',
    ),
    lessons: ['fIntro'],
  },
  {
    id: 'qa-test',
    term: 'QA Test',
    name: loc('质量保证测试', 'Quality assurance test'),
    def: loc(
      '抽样复测，确认封装测试本身做对了。',
      'A sample is retested to confirm that package test itself was done correctly.',
    ),
    lessons: ['fIntro'],
  },
  {
    id: 'burn-in',
    term: 'Burn-in',
    name: loc('老化', 'Burn-in'),
    def: loc(
      '在高温、高压下让芯片工作一段时间，把早期失效的弱品筛掉；老化前后各测一遍。',
      'Running chips at high temperature and voltage for a while to screen out weak, early-failure parts, with tests before and after.',
    ),
    lessons: ['fIntro'],
  },
  {
    id: 'failure-analysis',
    term: 'Failure Analysis',
    name: loc('失效分析', 'Failure analysis'),
    def: loc(
      '对失效的芯片做电性和物理分析，找出缺陷的位置和原因。',
      'Electrical and physical analysis of failed chips to find where the defect is and why.',
    ),
    lessons: ['fIntro'],
  },

  /* ---------------- F04 器件规格书 ---------------- */
  {
    id: 'design-spec',
    term: 'Design Spec',
    name: loc('设计规格', 'Design specification'),
    def: loc(
      '写给设计者的目标规格；测试规格写给测试工程师，数据手册写给用户。三者各有读者。',
      'The target spec written for designers; the test spec is for test engineers and the datasheet for users. Each has its own reader.',
    ),
    lessons: ['fSpec'],
  },
  {
    id: 'preconditioning',
    term: 'Preconditioning',
    name: loc('预处理', 'Preconditioning'),
    def: loc(
      '测某个参数前，先跑一段向量把芯片放到需要的状态，例如输出置高、置高阻或电流最小的状态。',
      'Running vectors before a parametric test to put the chip in the required state, e.g. output high, high-Z or lowest current.',
    ),
    lessons: ['fSpec', 'fDc', 'program'],
  },
  {
    id: 'static-dynamic',
    term: 'Static / Dynamic',
    name: loc('静态 / 动态', 'Static / dynamic'),
    def: loc(
      '静态参数在芯片不翻转时测（如 Static IDD）；动态参数在芯片运行时测（如 Dynamic IDD，条件 VDDmax + fMAX）。',
      'Static parameters are measured with the chip idle (e.g. static IDD); dynamic ones while it runs (e.g. dynamic IDD at VDDmax + fMAX).',
    ),
    lessons: ['fSpec', 'fDc'],
  },
  {
    id: 'temperature-grade',
    term: 'Commercial / Military Grade',
    name: loc('商业级 / 军用级', 'Commercial / military grade'),
    def: loc(
      '规格等级决定温度和电压范围：商业级 0–70 °C、VDD ±5%；军用级 −55–125 °C、VDD ±10%。',
      'The grade sets temperature and voltage ranges: commercial 0–70 °C, VDD ±5%; military −55–125 °C, VDD ±10%.',
    ),
    lessons: ['fSpec'],
  },
  {
    id: 'abs-max',
    term: 'Absolute Maximum Rating',
    name: loc('绝对最大额定值', 'Absolute maximum rating'),
    def: loc(
      '超过就可能损坏芯片的极限条件。表征往上搜 VDD 时也不能越过它。',
      'Conditions beyond which the chip may be damaged. Even an upward VDD search in characterization must not cross it.',
    ),
    lessons: ['fSpec', 'fChar'],
  },

  /* ---------------- F05 开短路 ---------------- */
  {
    id: 'resistive-short',
    term: 'Resistive Short',
    name: loc('阻性短路', 'Resistive short'),
    def: loc(
      '不是硬短，而是几 kΩ 漏到地。压降 = 电流 × 电阻，测试电流加大会让它超过 0.2 V 而“混过去”，所以电流不是越大越好。',
      'Not a hard short but a few kΩ of leakage to ground. Drop = current × resistance, so a larger test current can push it past 0.2 V and let it slip through; more current is not always better.',
    ),
    lessons: ['fOpens'],
  },
  {
    id: 'datalog',
    term: 'Datalog',
    name: loc('测试数据记录', 'Datalog'),
    def: loc(
      '每个测试项的实测值和判定记录。看开短路要把相邻脚放在一起看；样品的 Datalog 还要带序列号、程序版本、测试机和日期。',
      'The record of measured values and verdicts per test. For opens / shorts read adjacent pins together; sample datalogs also carry the serial number, program revision, tester and date.',
    ),
    lessons: ['fOpens', 'fChar', 'fDebug', 'fQualify'],
  },

  /* ---------------- F06 DC 参数 ---------------- */
  {
    id: 'gross-idd',
    term: 'Gross IDD',
    name: loc('粗测电源电流', 'Gross IDD'),
    def: loc(
      '上电后第一次粗查电源电流，限值宽，目的只是挡住电源对地短路这类严重问题。',
      'The first coarse supply-current check after power-up, with a wide limit, meant only to stop gross problems such as a power-to-ground short.',
    ),
    lessons: ['fDc', 'fProgram', 'fCreate'],
  },
  {
    id: 'ganged',
    term: 'Ganged / Serial / Parallel',
    name: loc('并联 / 串行 / 并行测漏电', 'Ganged / serial / parallel leakage'),
    def: loc(
      '三种测 IIL / IIH 的方法：并联把所有输入接一个 PMU 量总电流，极限仍用单脚值；串行逐脚测能定位；并行每脚一个 PMU，又快又能定位。',
      'Three ways to test IIL / IIH: ganged ties all inputs to one PMU and compares the total with the single-pin limit; serial tests pin by pin and locates failures; parallel uses one PMU per pin, fast and locating.',
    ),
    lessons: ['fDc'],
  },
  {
    id: 'pull-up-down',
    term: 'Pull-up / Pull-down',
    name: loc('上拉 / 下拉', 'Pull-up / pull-down'),
    def: loc(
      '把管脚拉到 VDD 或地的电阻。带上拉 / 下拉的输入本来就有约 100 µA，规格书另给极限，不能并联测；开漏输出则需要外接上拉。',
      'A resistor tying a pin to VDD or ground. Inputs with pull-ups / pull-downs already draw about 100 µA, have their own limits and cannot be ganged; open-drain outputs need an external pull-up.',
    ),
    lessons: ['fDc', 'fCreate'],
  },
  {
    id: 'fanout',
    term: 'Fanout',
    name: loc('扇出', 'Fanout'),
    def: loc(
      '一个输出能带多少个同类输入：输出电流能力 ÷ 每个输入的电流。',
      'How many inputs of the same family one output can drive: output current capability ÷ current per input.',
    ),
    lessons: ['fDc'],
  },
  {
    id: 'vi-clamp',
    term: 'VI (Input Clamp)',
    name: loc('输入钳位电压', 'Input clamp voltage'),
    def: loc(
      '往输入脚灌或抽规定电流时，保护二极管上的电压不能超过规格，检查输入保护结构。',
      'With a specified current forced into or out of an input, the voltage across the protection diode must stay within spec, checking the input protection.',
    ),
    lessons: ['fDc'],
  },
  {
    id: 'ios',
    term: 'IOS',
    name: loc('输出短路电流', 'Output short-circuit current'),
    def: loc(
      '输出为高时被短到 0 V 的电流。一次只短一个输出、VDD 用 VDDmax，按先量 VOH 再降到 0 V 的顺序避免热切换。',
      'The current when a high output is shorted to 0 V. Short one output at a time at VDDmax, and measure VOH first before dropping to 0 V to avoid hot switching.',
    ),
    lessons: ['fDc'],
  },
  {
    id: 'hot-switching',
    term: 'Hot Switching',
    name: loc('热切换', 'Hot switching'),
    def: loc(
      '在有电压、有电流时直接切换继电器或 PMU 连接，会打火、损伤触点或芯片。要先把两边电位对齐再切。',
      'Switching a relay or PMU connection while voltage and current are present, which arcs and damages contacts or the chip. Match the potentials first, then switch.',
    ),
    lessons: ['fDc'],
  },

  /* ---------------- F07 功能测试 ---------------- */
  {
    id: 'signal-format',
    term: 'Signal Format',
    name: loc('信号格式', 'Signal format'),
    def: loc(
      '输入的 0 和 1 在一个周期里画成什么波形：NRZ、DNRZ、RZ、RO、SBC、ZD 等。',
      'The waveform an input 0 or 1 takes within one cycle: NRZ, DNRZ, RZ, RO, SBC, ZD and so on.',
    ),
    lessons: ['fFunc', 'fVector', 'fChar'],
  },
  {
    id: 'nrz',
    term: 'NRZ / DNRZ',
    name: loc('不归零 / 延迟不归零', 'Non-return to zero / delayed NRZ'),
    def: loc(
      'NRZ 在 T0 变化、整个周期保持，最简单，常用于地址和数据；DNRZ 把变化时刻推到边沿 1，用来相对时钟定位 Setup / Hold。',
      'NRZ changes at T0 and holds for the cycle, the simplest format for address and data; DNRZ moves the change to edge 1 to place setup / hold relative to a clock.',
    ),
    lessons: ['fFunc', 'fVector'],
  },
  {
    id: 'rz-ro',
    term: 'RZ / RO',
    name: loc('归零 / 归一', 'Return to zero / return to one'),
    def: loc(
      'RZ：数据为 1 时在边沿 1 到边沿 2 之间出高脉冲，用于正脉冲时钟；RO 反过来，平时为 1、出低脉冲，用于低有效时钟。',
      'RZ gives a high pulse from edge 1 to edge 2 when data is 1, for positive-pulse clocks; RO is the inverse, normally 1 with a low pulse, for active-low clocks.',
    ),
    lessons: ['fFunc', 'fChar'],
  },
  {
    id: 'sbc',
    term: 'SBC',
    name: loc('补码包围', 'Surround by complement'),
    def: loc(
      '边沿 1 之前和边沿 2 之后驱动数据的反码，中间才是数据。每拍都有两个边沿，Setup 和 Hold 一次都考到。',
      'Drives the complement before edge 1 and after edge 2, with true data in between. Every cycle has two edges, so setup and hold are tested in one pass.',
    ),
    lessons: ['fFunc'],
  },
  {
    id: 't0',
    term: 'T0',
    name: loc('周期起点', 'Cycle start'),
    def: loc(
      '每个测试周期的起点，所有驱动沿和 Strobe 都从 T0 算起。',
      'The start of each test cycle; every drive edge and strobe is measured from T0.',
    ),
    lessons: ['fFunc'],
  },
  {
    id: 'time-set',
    term: 'Time Set',
    name: loc('时序组', 'Time set'),
    def: loc(
      '一组周期、边沿、格式和 Strobe 设置。向量每一行可以指定用哪个 Time Set，但实时切换尽量少用。',
      'A bundle of period, edges, formats and strobe settings. Each vector row can name its time set, but switching on the fly should be kept to a minimum.',
    ),
    lessons: ['fFunc', 'fVector'],
  },
  {
    id: 'dft',
    term: 'DFT',
    name: loc('可测性设计', 'Design for testability'),
    def: loc(
      '设计时就为测试留路：Ad-hoc 测试点、Scan、BIST、JTAG 等，让内部节点可控、可观测。',
      'Building test access into the design: ad-hoc test points, scan, BIST, JTAG and so on, so internal nodes become controllable and observable.',
    ),
    lessons: ['fFunc', 'fScan'],
  },

  /* ---------------- F08 AC 参数 ---------------- */
  {
    id: 'go-nogo',
    term: 'Go / No-Go',
    name: loc('通过 / 不通过判定', 'Go / no-go'),
    def: loc(
      '每个参数只在极限处判一次 Pass / Fail，不测实际值。量产用它加最坏条件，快；要记录实际值时用读出记录（Read & record）。',
      'Each parameter is judged once at its limit, with no actual value. Production uses it with worst-case conditions because it is fast; recording actual values needs read & record.',
    ),
    lessons: ['fAc'],
  },
  {
    id: 'binary-search',
    term: 'Binary Search',
    name: loc('二分搜索', 'Binary search'),
    def: loc(
      '每次测范围中点，Pass 往一半找、Fail 往另一半找，每跑一次范围减半，直到小于分辨率。最快的表征工具。',
      'Test the midpoint each time and keep the half where the boundary lies; each run halves the range until it is below the resolution. The fastest characterization tool.',
    ),
    lessons: ['fAc', 'fChar', 'fDebug'],
  },
  {
    id: 'read-record',
    term: 'Read & Record',
    name: loc('读出记录', 'Read and record'),
    def: loc(
      '把每个参数的实际值测出来并保存，能看出余量，但最慢。军用规格常要求它。',
      'Measuring and saving each parameter’s actual value, which shows margin but is slowest. Military specs often require it.',
    ),
    lessons: ['fAc'],
  },
  {
    id: 'pulse-width',
    term: 'Minimum Pulse Width',
    name: loc('最小脉宽', 'Minimum pulse width'),
    def: loc(
      '芯片还能正常响应的最窄脉冲。用 RZ / RO 格式把两条沿互相靠近，搜到开始 Fail 的宽度。',
      'The narrowest pulse the chip still responds to. Move the two edges of an RZ / RO pulse together and search for the width where it starts failing.',
    ),
    lessons: ['fAc', 'fChar'],
  },

  /* ---------------- F09 器件表征 ---------------- */
  {
    id: 'linear-search',
    term: 'Linear Search',
    name: loc('线性搜索', 'Linear search'),
    def: loc(
      '从一端开始一档一档单方向走，直到第一次 Fail。比二分慢得多，只在必须时用，例如有回差的施密特输入。',
      'Step one increment at a time in one direction until the first failure. Much slower than binary search; use it only when needed, e.g. Schmitt inputs with hysteresis.',
    ),
    lessons: ['fChar'],
  },
  {
    id: 'schmitt',
    term: 'Schmitt Trigger',
    name: loc('施密特触发器', 'Schmitt trigger'),
    def: loc(
      '带回差的输入：上升时在 VT+ 翻转，下降时在 VT− 翻转。二分搜索忽高忽低测不出确定值，要用线性搜索。',
      'An input with hysteresis: it switches at VT+ rising and VT− falling. Binary search jumps around and finds no definite value, so use a linear search.',
    ),
    lessons: ['fChar'],
  },

  /* ---------------- F10 测试向量开发 ---------------- */
  {
    id: 'stored-response',
    term: 'Stored Response',
    name: loc('存储响应', 'Stored response'),
    def: loc(
      '期望的输出事先存在向量存储器里，Strobe 时把比较器读到的 H / L 和它逐拍比对。',
      'The expected outputs are stored in vector memory ahead of time; at each strobe the comparator’s H / L is checked against them cycle by cycle.',
    ),
    lessons: ['fVector'],
  },
  {
    id: 'print-on-strobe',
    term: 'Print on Strobe / Change',
    name: loc('按 Strobe / 按跳变打印', 'Print on strobe / print on change'),
    def: loc(
      '仿真转向量时的两种记录方式：按 Strobe 时刻记一次，或每个信号一跳变就记。外部信号推荐 Print on Change，保证跳变不漏。',
      'Two ways to record simulation for vectors: once per strobe, or every time a signal changes. Print on change is recommended for external signals so no transition is missed.',
    ),
    lessons: ['fVector'],
  },
  {
    id: 'repeat-loop',
    term: 'Repeat / Loop / Subroutine',
    name: loc('重复 / 循环 / 子程序', 'Repeat / loop / subroutine'),
    def: loc(
      '向量的微码指令：同一行跑 N 拍只占一行存储；一段向量反复执行或按条件跳转；常用片段写成子程序多处调用。',
      'Vector microcode: run one row for N cycles using one memory row; repeat or branch over a block; write common blocks as subroutines called from many places.',
    ),
    lessons: ['fVector'],
  },
  {
    id: 'vector-translator',
    term: 'Vector Translator',
    name: loc('向量翻译器', 'Vector translator'),
    def: loc(
      '把仿真输出或另一家测试机的向量格式转换成本机格式的软件。',
      'Software that converts simulation output or another tester’s vector format into this tester’s format.',
    ),
    lessons: ['fVector'],
  },
  {
    id: 'simulation-for-test',
    term: 'Simulation for Test',
    name: loc('面向测试的仿真守则', 'Simulation-for-test rules'),
    def: loc(
      '写仿真时就照顾测试：完整初始化、不强制节点、初始化前不比较输出、和测试同频同时序、标出 I/O 方向等。',
      'Writing simulations with test in mind: full initialization, no forced nodes, no output compares before initialization, same frequency and timing as the test, marked I/O direction, and so on.',
    ),
    lessons: ['fVector'],
  },

  /* ---------------- F11 测试程序开发要点 ---------------- */
  {
    id: 'program-types',
    term: 'Engineering / Characterization / Production Program',
    name: loc('三种测试程序', 'Three kinds of test program'),
    def: loc(
      '工程程序用来调试和验证；表征程序把参数测全、找边界；量产程序只测必要的项，追求测试时间短。',
      'An engineering program debugs and verifies; a characterization program measures everything and finds limits; a production program tests only what is needed, as fast as possible.',
    ),
    lessons: ['fProgram'],
  },
  {
    id: 'throughput',
    term: 'Throughput',
    name: loc('产能 / 测试时间', 'Throughput / test time'),
    def: loc(
      '单位时间能测多少颗。测试时间直接变成测试成本，要和芯片价格相称。',
      'How many parts can be tested per unit time. Test time turns directly into test cost, which must suit the device price.',
    ),
    lessons: ['fProgram', 'fIntro'],
  },

  /* ---------------- F12 编写测试程序 ---------------- */
  {
    id: 'load-board-test',
    term: 'Load Board Test',
    name: loc('负载板测试', 'Load board test'),
    def: loc(
      '空座、不放芯片时跑的检查：全脚漏电、VDD / 地、继电器、外部元件和测试机快速诊断。全部 Pass 后，芯片的 Fail 才能归到芯片身上。',
      'Checks run with an empty socket: all-pin leakage, VDD / ground, relays, external parts and quick tester diagnostics. Only after they all pass can a device failure be blamed on the device.',
    ),
    lessons: ['fCreate', 'fDebug'],
  },
  {
    id: 'loopback',
    term: 'Functional Loopback',
    name: loc('功能自环', 'Functional loopback'),
    def: loc(
      '把测试机的驱动器接回比较器做一遍功能自测，确认通道本身没坏。',
      'Looping tester drivers back to comparators for a functional self-test, confirming the channels themselves work.',
    ),
    lessons: ['fCreate'],
  },
  {
    id: 'decoupling',
    term: 'Decoupling Capacitor',
    name: loc('去耦电容', 'Decoupling capacitor'),
    def: loc(
      '放在 DUT 电源脚附近的电容，抑制芯片自己翻转产生的电源噪声。',
      'A capacitor near the DUT supply pins that suppresses supply noise generated by the chip’s own switching.',
    ),
    lessons: ['fCreate'],
  },
  {
    id: 'open-drain',
    term: 'Open Drain',
    name: loc('开漏输出', 'Open-drain output'),
    def: loc(
      '只能往下拉、不能往上推的输出，测试时负载板上要加上拉。',
      'An output that can only pull low, not drive high; the load board must provide a pull-up for test.',
    ),
    lessons: ['fCreate'],
  },
  {
    id: 'gbd',
    term: 'Guaranteed by Design',
    name: loc('设计保证', 'Guaranteed by design'),
    def: loc(
      '规格书里标着“设计保证”的参数由设计和表征担保，量产程序不用测。',
      'Parameters marked “guaranteed by design” are covered by design and characterization, so the production program need not test them.',
    ),
    lessons: ['fCreate'],
  },

  /* ---------------- F13 排错 ---------------- */
  {
    id: 'standard-device',
    term: 'Standard Device',
    name: loc('标准品', 'Known-good standard device'),
    def: loc(
      '确认过的好芯片。先测它：它也 Fail，问题多半在程序、测试机或硬件，不在待测芯片。',
      'A chip already known to be good. Test it first: if it fails too, the problem is most likely the program, tester or hardware, not the device.',
    ),
    lessons: ['fDebug'],
  },
  {
    id: 'scope-tool',
    term: 'Scope Tool',
    name: loc('示波器工具', 'Scope tool'),
    def: loc(
      '测试机软件里的“示波器”，或外接示波器 + 数字电压表，直接看管脚上的真实波形和电压。',
      'The tester software’s built-in “scope”, or an external oscilloscope plus DVM, used to look at real waveforms and voltages on a pin.',
    ),
    lessons: ['fDebug'],
  },

  /* ---------------- F14 程序验证与文档 ---------------- */
  {
    id: 'samples',
    term: 'Serialized Samples',
    name: loc('编号样品', 'Serialized samples'),
    def: loc(
      '程序写完后给样品编序列号保存，每颗留一份完整 Datalog。将来良率掉了，拿出来重测对比。',
      'After the program is written, samples get serial numbers and are kept, each with a full datalog. When yield drops later, retest and compare.',
    ),
    lessons: ['fQualify'],
  },
  {
    id: 'documentation-package',
    term: 'Documentation Package',
    name: loc('文档包', 'Documentation package'),
    def: loc(
      '程序交付时附的整套资料：开发摘要与偏离说明、程序源码清单、流程图与分 Bin、带序列号的 Datalog 和空座 Datalog、所依据的测试规格版本等。',
      'The set of material delivered with the program: development summary and deviations, source listing, flowchart and binning, serialized and empty-socket datalogs, the test-spec revision it was written to, and more.',
    ),
    lessons: ['fQualify'],
  },

  /* ---------------- F15 CMOS 闩锁测试 ---------------- */
  {
    id: 'vbo',
    term: 'VBO',
    name: loc('转折电压', 'Breakover voltage'),
    def: loc(
      'SCR 从阻断转为导通的电压。门极电流越大 VBO 越低，降到 VDD 以下就触发闩锁；过压测试把 VDD 抬高来试探它。',
      'The voltage at which an SCR switches from blocking to conducting. More gate current lowers VBO; once it falls below VDD the device latches. The overvoltage test raises VDD to probe it.',
    ),
    lessons: ['fLatch'],
  },
  {
    id: 'trigger-current',
    term: 'TRIGIH / TRIGIL',
    name: loc('注入触发电流', 'Trigger injection current'),
    def: loc(
      '闩锁测试中用 PMU 往管脚灌（TRIGIH）或抽（TRIGIL）的电流，芯片要扛住规定值（如 > 20 mA）而不闩锁。',
      'The current a PMU forces into (TRIGIH) or pulls out of (TRIGIL) a pin in a latch-up test; the chip must withstand the specified value (e.g. > 20 mA) without latching.',
    ),
    lessons: ['fLatch'],
  },
  {
    id: 'latchup-idd-check',
    term: 'IDD1 / IDDT',
    name: loc('闩锁判定电流', 'Latch-up IDD criteria'),
    def: loc(
      '触发前测静态 IDD 记为 IDD1；触发后 IDD 必须仍在 IDD1 ± IDDT（如 5%）之内，否则判闩锁。',
      'Static IDD measured before triggering is stored as IDD1; after triggering IDD must stay within IDD1 ± IDDT (e.g. 5%), or it is judged latch-up.',
    ),
    lessons: ['fLatch'],
  },

  /* ---------------- F16 Scan 测试原理 ---------------- */
  {
    id: 'flush-test',
    term: 'Flush Test',
    name: loc('Flush 测试', 'Flush test'),
    def: loc(
      '验证扫描链本身：全 0 背景里推一个 1 过去（Flush 1），再在全 1 背景里推一个 0（Flush 0），检查每个存储元件都能进入两种状态。',
      'Checks the scan chain itself: push a single 1 through an all-0 background (flush 1), then a 0 through all 1s (flush 0), proving every storage element can take both states.',
    ),
    lessons: ['fScan'],
  },
  {
    id: 'shift-test',
    term: 'Shift Test',
    name: loc('Shift 测试', 'Shift test'),
    def: loc(
      '把 00110011… 移过整条链，让每个存储元件经历 0→0、0→1、1→1、1→0 四种“当前态 → 下一态”组合。',
      'Shift 00110011… through the whole chain so every storage element goes through all four present → next transitions: 0→0, 0→1, 1→1, 1→0.',
    ),
    lessons: ['fScan'],
  },
  {
    id: 'lssd',
    term: 'LSSD',
    name: loc('电平敏感扫描设计', 'Level Sensitive Scan Design'),
    def: loc(
      'IBM 提出的扫描设计方法：用两个可直接控制、互不重叠的时钟，一个管数据进存储元件、一个管输出，让电路不依赖时钟沿的上升 / 下降时间，避开竞争。',
      'A scan design method proposed by IBM: two directly controllable, non-overlapping clocks, one for data entering the storage elements and one for their outputs, so operation does not depend on clock rise / fall times and races are avoided.',
    ),
    lessons: ['fScan'],
  },
]
