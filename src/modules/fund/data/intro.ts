import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

type Txt = LText | string

/* ---------- 1. DUT 与管脚 ---------- */

export const DUT_LEAD: LText[] = [
  loc(
    '被测的芯片叫 DUT（Device Under Test），有时也叫 UUT（Unit Under Test）。',
    'The chip being tested is called the DUT (Device Under Test), sometimes the UUT (Unit Under Test).',
  ),
  loc(
    '信号通过管脚（pin）进出 DUT。输入、输出、三态、双向这四类合称“信号脚”；电源脚和地不算信号脚，它们的内部结构也和信号脚不一样。',
    'Signals enter and leave the DUT through its pins. Input, output, tri-state and bidirectional pins are together called "signal pins"; power and ground pins are not signal pins, and their internal structure is different too.',
  ),
]

export type PinKind = 'input' | 'output' | 'tri' | 'bidir' | 'power'

export const PIN_TYPES: Array<{ id: PinKind; title: LText; sub: Txt; text: LText; explain: LText[] }> = [
  {
    id: 'input',
    title: loc('输入脚', 'Input pin'),
    sub: loc('外部 → 芯片内部', 'Outside → chip'),
    text: loc(
      '输入脚是外部信号和内部逻辑之间的缓冲器。它感知加上来的电压，把它翻译成 0 或 1 交给内部电路。',
      'An input pin is a buffer between external signals and the internal logic. It senses the applied voltage and translates it into a 0 or 1 for the internal circuitry.',
    ),
    explain: [
      loc('测试时，测试机“驱动”输入脚：要 0 就给 VIL，要 1 就给 VIH。', 'During test the tester "drives" input pins: VIL for a 0, VIH for a 1.'),
      loc(
        '输入脚本身不做 Pass/Fail 比较——信号加在输入上，结果从输出上看。',
        'Input pins themselves are not compared for Pass/Fail: signals are applied to inputs, and results are observed on outputs.',
      ),
    ],
  },
  {
    id: 'output',
    title: loc('输出脚', 'Output pin'),
    sub: loc('芯片内部 → 外部', 'Chip → outside'),
    text: loc(
      '输出脚是内部逻辑和外部之间的缓冲器。它要输出正确的 0 / 1 电压，同时还要能带得动 IOL / IOH 电流。',
      'An output pin is a buffer between the internal logic and the outside world. It must produce correct 0 / 1 voltages while driving the IOL / IOH currents.',
    ),
    explain: [
      loc(
        '测试时，测试机用比较器读它的电压（和 VOL / VOH 比），用电流负载给它加 IOL / IOH。',
        'During test the tester reads its voltage with comparators (against VOL / VOH) and loads it with IOL / IOH using the current load.',
      ),
      loc('输出脚不能接测试机的驱动器，否则两边同时在“推”同一个点。', 'An output pin must not be connected to a tester driver, or both sides would "push" on the same node.'),
    ],
  },
  {
    id: 'tri',
    title: loc('三态输出', 'Tri-state output'),
    sub: 'Tri-State®',
    text: loc(
      '功能和输出脚一样，多了一个本领：能“关掉”，进入高阻态（Z），既不拉高也不拉低。',
      'Works like an output pin with one extra ability: it can be "turned off" into a high-impedance state (Z), pulling neither high nor low.',
    ),
    explain: [
      loc('高阻态让多颗芯片可以挂在同一根总线上，轮流输出。', 'The high-impedance state lets several chips share one bus and take turns driving it.'),
      loc('测试时要额外验证：使能关闭时它真的放开了总线。', 'Test must also verify that it really releases the bus when disabled.'),
    ],
  },
  {
    id: 'bidir',
    title: loc('双向脚', 'Bidirectional pin'),
    sub: loc('输入 + 输出 + 高阻', 'Input + output + Z'),
    text: loc(
      '既能当输入，又能当输出，还能关成高阻。数据总线上的管脚大多是双向脚。',
      'Can act as an input, an output, or be turned off to high impedance. Most data bus pins are bidirectional.',
    ),
    explain: [
      loc(
        '写数据时它是输入，读数据时它是输出。测试机这一路也要跟着在“驱动”和“比较”之间来回切换，这叫 I/O 切换。',
        'When writing data it is an input; when reading data it is an output. The tester channel must switch back and forth between "drive" and "compare" to match; this is called I/O switching.',
      ),
      loc(
        '切换时要保证 DUT 和测试机不会同时驱动，否则就是 I/O 冲突（见下面的管脚电子）。',
        'Switching must ensure the DUT and the tester never drive at the same time; otherwise there is an I/O conflict (see pin electronics below).',
      ),
    ],
  },
  {
    id: 'power',
    title: loc('电源脚', 'Power pins'),
    sub: 'VDD / VCC / VSS / Ground',
    text: loc(
      '接电源或地的管脚。它们由测试机的 DPS 供电，结构和信号脚不同。',
      'Pins connected to power or ground. They are supplied by the tester DPS and are built differently from signal pins.',
    ),
    explain: [
      loc('VCC：TTL 器件的电源脚。', 'VCC: the supply pin of TTL devices.'),
      loc('VDD：CMOS 器件的电源脚。', 'VDD: the supply pin of CMOS devices.'),
      loc('VSS：给 VDD / VCC 送进来的电流提供回流路径。', 'VSS: the return path for the current supplied through VDD / VCC.'),
      loc(
        'Ground（接地）：把信号脚或某个节点接到测试系统的参考点，或接到 VSS。只有一组电源的器件，VSS 常常就直接叫“地”。',
        'Ground: connects a signal pin or node to the test system reference, or to VSS. On devices with a single supply, VSS is often simply called "ground".',
      ),
    ],
  },
]

/* ---------- 2. 测试程序 ---------- */

export const PROG_LEAD: LText[] = [
  loc(
    '测试程序的目的：控制测试硬件，保证 DUT 达到或超过规格书里的全部设计参数。',
    'The purpose of a test program: control the test hardware to ensure the DUT meets or exceeds every design parameter in the specification.',
  ),
  loc(
    '每一项测试都只给一个结论：Pass 或 Fail。Pass 说明满足规格；Fail 说明它达不到规格，不能用在目标应用里。',
    'Every test gives exactly one verdict: Pass or Fail. Pass means it meets the spec; Fail means it does not and cannot be used in the target application.',
  ),
  loc('程序通常分三段：', 'A program usually has three sections:'),
]

export const PROG_PARTS: Array<{ id: string; title: LText; sub: LText; text: LText; explain: LText[] }> = [
  {
    id: 'dc',
    title: loc('DC 测试', 'DC test'),
    sub: loc('电压、电流参数', 'Voltage & current parameters'),
    text: loc(
      '验证电压和电流参数：例如输出电压 VOL / VOH、输入漏电、电源电流。主要靠 PMU 一项项量。',
      'Verifies voltage and current parameters such as output voltages VOL / VOH, input leakage and supply current. Mostly measured one by one with the PMU.',
    ),
    explain: [loc('DC 测试验证电压和电流参数。', 'DC tests verify voltage and current parameters.'), loc('详细做法见 {@fDc}。', 'For details see {@fDc}.')],
  },
  {
    id: 'func',
    title: loc('功能测试', 'Functional test'),
    sub: loc('逻辑对不对', 'Is the logic right?'),
    text: loc(
      '验证器件各个逻辑功能是否正确：把向量一行行灌进去，比较每个输出是不是期望值。',
      'Verifies that every logic function of the device is correct: vectors are applied row by row and each output is compared with its expected value.',
    ),
    explain: [
      loc('功能测试验证各个逻辑功能的正确性。', 'Functional tests verify that each logic function is correct.'),
      loc('详细做法见 {@fFunc}。', 'For details see {@fFunc}.'),
    ],
  },
  {
    id: 'ac',
    title: loc('AC 测试', 'AC test'),
    sub: loc('在规定时间内做对', 'Right, and on time'),
    text: loc(
      '验证器件能在规定的时序约束内完成逻辑操作：比如传输延迟、建立 / 保持时间。',
      'Verifies that the device completes its logic operations within the specified timing constraints, such as propagation delay and setup / hold time.',
    ),
    explain: [
      loc('AC 测试验证“够不够快”：逻辑对了，还要在规定的时间内对。', 'AC tests verify "fast enough": the logic must be correct, and correct within the specified time.'),
      loc('详细做法见 {@fAc}。', 'For details see {@fAc}.'),
    ],
  },
]

export const BIN_LEAD = loc(
  '测试程序还能按性能把好片分档，这叫分 Bin（binning）。同一批 CPU，能跑 150 MHz 的是最好的 Bin 1；只能跑 100 MHz 的不如它，但也不该扔掉，归为 Bin 2，卖给另一类客户。',
  'A test program can also sort good parts by performance; this is binning. In one lot of CPUs, those that run at 150 MHz are the best, Bin 1; those that only run at 100 MHz are not as good but should not be thrown away: they go to Bin 2 and are sold to other customers.',
)

export const BIN1_F = 150
export const BIN2_F = 100

export type BinId = 'bin1' | 'bin2' | 'speed' | 'dc'

export const BINS: Array<{ id: BinId; label: LText; good: boolean }> = [
  { id: 'bin1', label: loc('Bin 1（≥ 150 MHz）', 'Bin 1 (≥ 150 MHz)'), good: true },
  { id: 'bin2', label: loc('Bin 2（≥ 100 MHz）', 'Bin 2 (≥ 100 MHz)'), good: true },
  { id: 'speed', label: loc('不合格：太慢', 'Fail: too slow'), good: false },
  { id: 'dc', label: loc('不合格：DC / 功能', 'Fail: DC / functional'), good: false },
]

export function binOf(fmax: number): BinId {
  if (fmax >= BIN1_F) return 'bin1'
  if (fmax >= BIN2_F) return 'bin2'
  return 'speed'
}

export const BIN_TEXT: Record<BinId, LText> = {
  bin1: loc('150 MHz 也能正确工作：最好的一档，Bin 1，卖最高价。', 'Works correctly even at 150 MHz: the best grade, Bin 1, sold at the highest price.'),
  bin2: loc('150 MHz 下出错，但 100 MHz 下正确：降一档到 Bin 2，照样能卖。', 'Fails at 150 MHz but works at 100 MHz: downgraded to Bin 2 and still sellable.'),
  speed: loc('连 100 MHz 都跑不对：达不到任何一档的规格，判 Fail。', 'Fails even at 100 MHz: it meets no grade spec and is rejected.'),
  dc: loc('DC 或功能测试就没过，根本轮不到测速度。', 'It already failed DC or functional test, so speed was never tested.'),
}

/** 模拟一批芯片：最高频率大致正态分布，另有少量 DC / 功能不良 */
export function makeLot(n: number): BinId[] {
  const out: BinId[] = []
  for (let k = 0; k < n; k += 1) {
    if (Math.random() < 0.06) {
      out.push('dc')
      continue
    }
    const u = Math.max(1e-9, Math.random())
    const v = Math.random()
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    out.push(binOf(140 + 28 * z))
  }
  return out
}

export const PROG_MORE: LText[] = [
  loc(
    '程序还要指挥外部设备：告诉分选机（handler）或探针台（prober）这颗测完了、该放进哪个 Bin、换下一颗。',
    'The program also directs external equipment: it tells the handler or prober that this part is done, which bin it goes in, and to bring the next one.',
  ),
  loc(
    '最后，它要把结果汇总成报表。测试工程师和产品工程师看这些汇总找问题、提良率。',
    'Finally, it summarizes the results into reports. Test and product engineers use these summaries to find problems and improve yield.',
  ),
]

/* ---------- 3. 没有唯一正确的测法 ---------- */

export const RIGHT_LEAD = loc(
  '“测试程序怎么写才对？”没有唯一答案。对这个场合最好的方法，换个场合未必合适。写程序之前，先把下面四个因素想清楚。',
  '"What is the right way to write a test program?" There is no single answer. The best method for one situation may not suit another. Before writing a program, think through the four factors below.',
)

export const FACTORS: Array<{ id: string; title: LText; sub: LText; text: LText }> = [
  {
    id: 'purpose',
    title: loc('测试目的', 'Test purpose'),
    sub: loc('测来干什么', 'Why test?'),
    text: loc(
      '晶圆测试、成品测试、QA、表征……每种用途要求不同，需要各自的测试程序。',
      'Wafer sort, final test, QA, characterization... each purpose has different requirements and needs its own test program.',
    ),
  },
  {
    id: 'tester',
    title: loc('测试机能力', 'Tester capability'),
    sub: loc('手里有什么设备', 'What equipment you have'),
    text: loc(
      '程序要把测试机的本事用足。同一个参数，高端机和低成本机的测法可能完全不同。',
      'A program should make full use of the tester. The same parameter may be tested completely differently on a high-end tester and a low-cost one.',
    ),
  },
  {
    id: 'money',
    title: loc('成本', 'Cost'),
    sub: loc('最重要的一条', 'The most important'),
    text: loc(
      '测试会显著增加制造成本。测什么、怎么测，很多时候就是拿售价和测试成本来权衡。',
      'Test adds significantly to manufacturing cost. What to test and how is often a trade-off between selling price and test cost.',
    ),
  },
  {
    id: 'philo',
    title: loc('公司测试哲学', 'Test philosophy'),
    sub: loc('公司的共识', 'Company consensus'),
    text: loc(
      '测试哲学是公司内部对“怎么测最好”的共识：取决于自身需求、产品售价，也常受过去的经验教训影响。',
      'A test philosophy is a company\'s internal consensus on "the best way to test": it depends on its needs and product prices, and is often shaped by lessons learned in the past.',
    ),
  },
]

export const PURPOSES: Array<{ id: string; title: LText; sub: Txt; text: LText }> = [
  {
    id: 'wafer',
    title: loc('晶圆测试', 'Wafer sort'),
    sub: 'Wafer / Die Sort',
    text: loc(
      '还在晶圆上就逐颗测试，第一次把好 die 和坏 die 分开。也叫 wafer sort 或 die sort。',
      'Each die is tested while still on the wafer, separating good dice from bad for the first time. Also called wafer sort or die sort.',
    ),
  },
  {
    id: 'pkg',
    title: loc('封装测试', 'Package test'),
    sub: loc('成品测试 Final Test', 'Final Test'),
    text: loc(
      '晶圆切开、每颗 die 封进封装之后再测：确认封装过程没出错，并且器件仍然满足设计规格。',
      'Tested again after the wafer is sawed and each die is packaged: confirms that assembly caused no damage and the device still meets its design specs.',
    ),
  },
  { id: 'qa', title: loc('QA 测试', 'QA test'), sub: 'Quality Assurance', text: loc('抽样复测，确认封装测试本身做对了。', 'A sample is retested to confirm that package test itself was done correctly.') },
  {
    id: 'char',
    title: loc('器件表征', 'Characterization'),
    sub: 'Characterization',
    text: loc(
      '找出每个参数的工作极限——它到底能工作到多快、多低的电压。',
      'Finds the operating limits of each parameter: how fast and at how low a voltage it can really work.',
    ),
  },
  {
    id: 'burn',
    title: loc('老化前后测试', 'Pre / post burn-in'),
    sub: 'Pre / Post Burn-In',
    text: loc(
      '老化前后各测一次，确认老化没有让参数漂移；并筛掉“早夭”器件——有缺陷、刚用不久就会坏的那些。',
      'Tested before and after burn-in to confirm that parameters have not drifted, and to screen out "infant mortality" devices: defective parts that would fail soon after use begins.',
    ),
  },
  {
    id: 'mil',
    title: loc('军品测试', 'Military test'),
    sub: 'Military',
    text: loc('在整个温度范围内做严格测试，并把结果完整记录存档。', 'Rigorous testing across the full temperature range, with complete records of the results archived.'),
  },
  {
    id: 'incoming',
    title: loc('来料检验', 'Incoming inspection'),
    sub: 'Incoming Inspection',
    text: loc('客户买回芯片后自己测一遍，用到产品里之前先确认质量。', 'The customer tests purchased chips to confirm quality before using them in a product.'),
  },
  {
    id: 'assy',
    title: loc('组装验证', 'Assembly verification'),
    sub: 'Assembly Verification',
    text: loc(
      '确认器件挺过了组装过程、而且装对了。测试项目和封装测试类似，可能是它的子集；通常在海外封装厂做。',
      'Confirms the device survived assembly and was assembled correctly. The tests resemble package test, possibly a subset; usually done at an offshore assembly site.',
    ),
  },
  {
    id: 'fa',
    title: loc('失效分析', 'Failure analysis'),
    sub: 'Failure Analysis',
    text: loc('分析坏掉的器件，找出它为什么坏。找到原因就能改进可靠性。', 'Failed devices are analyzed to find out why they failed. Finding the cause makes it possible to improve reliability.'),
  },
]

export const TESTER_ROWS: Array<{ id: string; item: Txt; high: LText; low: LText; impact: LText }> = [
  {
    id: 'timing',
    item: loc('时序', 'Timing'),
    high: loc('高精度，能做高速测量', 'High accuracy, high-speed measurement'),
    low: loc('速度低、精度低', 'Low speed, low accuracy'),
    impact: loc(
      '低成本机的时序精度可能达不到器件规格的要求，有些 AC 参数根本没法直接测。',
      'A low-cost tester\'s timing accuracy may not meet the device spec, and some AC parameters cannot be tested directly at all.',
    ),
  },
  {
    id: 'mem',
    item: loc('向量存储器', 'Vector memory'),
    high: loc('大，图形一次装完', 'Large; patterns load at once'),
    low: loc('小，可能要中途重装向量', 'Small; may need reloading mid-test'),
    impact: loc('重装向量要花时间，每颗芯片的测试时间就变长了。', 'Reloading vectors takes time, so test time per chip increases.'),
  },
  {
    id: 'pmu',
    item: 'PMU',
    high: loc('多个，DC 可以并行测', 'Several; DC tests in parallel'),
    low: loc('只有一个，只能串行测', 'Only one; tests in series'),
    impact: loc(
      '只有一个 PMU 时，几百个管脚的 DC 参数只能一个接一个量，DC 测试时间很长。',
      'With only one PMU, DC parameters on hundreds of pins must be measured one after another, so DC test time is long.',
    ),
  },
  {
    id: 'load',
    item: loc('电流负载', 'Current load'),
    high: loc('可编程', 'Programmable'),
    low: loc('可能没有，要靠负载板上的硬件', 'May be absent; needs load board hardware'),
    impact: loc(
      '可编程电流负载让接口硬件更简单，程序里改个数就能换负载，更灵活。',
      'A programmable current load simplifies the interface hardware; changing a number in the program changes the load, which is more flexible.',
    ),
  },
  {
    id: 'perpin',
    item: loc('时序与电平', 'Timing & levels'),
    high: loc('每个管脚独立（per pin）', 'Independent per pin'),
    low: loc('共享资源', 'Shared resources'),
    impact: loc(
      '资源共享时，程序要想办法让共用同一组电平 / 时序的管脚凑在一起，程序更复杂，测试也更慢。',
      'With shared resources, the program must group pins that share the same levels / timing, making the program more complex and the test slower.',
    ),
  },
]

export type UseId = 'toy' | 'sat'

export const USES: Array<{ id: UseId; label: LText; price: number; text: LText }> = [
  {
    id: 'toy',
    label: loc('游戏玩具：$0.15', 'Toy game: $0.15'),
    price: 0.15,
    text: loc('一颗只卖 $0.15，只能承受最少的测试成本。', 'At only $0.15 per chip, it can bear only minimal test cost.'),
  },
  {
    id: 'sat',
    label: loc('卫星：$350', 'Satellite: $350'),
    price: 350,
    text: loc(
      '同一颗芯片用在卫星上卖 $350，能承受昂贵的测试。坏一颗的代价是整颗卫星。',
      'The same chip sells for $350 in a satellite and can bear expensive testing. One failure could cost the whole satellite.',
    ),
  },
]

/** 示意：测试成本按售价的 5% 估算 */
export const BUDGET_RATIO = 0.05

export type TestItemId = 'opens' | 'func' | 'dc' | 'ac' | 'vdd' | 'temp' | 'burn' | 'doc'

export const TEST_ITEMS: Array<{ id: TestItemId; label: LText; cost: number; toy: boolean; sat: boolean }> = [
  { id: 'opens', label: loc('开短路', 'Opens / shorts'), cost: 0.001, toy: true, sat: true },
  { id: 'func', label: loc('功能测试（典型 VDD）', 'Functional (typical VDD)'), cost: 0.003, toy: true, sat: true },
  { id: 'dc', label: loc('全部 DC 参数', 'All DC parameters'), cost: 0.004, toy: false, sat: true },
  { id: 'ac', label: loc('全部 AC 时序参数', 'All AC timing parameters'), cost: 0.006, toy: false, sat: true },
  { id: 'vdd', label: loc('最高 / 最低 VDD 再跑一遍功能', 'Functional again at max / min VDD'), cost: 0.004, toy: false, sat: true },
  { id: 'temp', label: loc('高温、低温各测一遍', 'Retest at hot and cold'), cost: 0.8, toy: false, sat: true },
  { id: 'burn', label: loc('老化前后各测一遍', 'Test before and after burn-in'), cost: 6, toy: false, sat: true },
  { id: 'doc', label: loc('逐颗记录数据、出报告', 'Log every part and report'), cost: 3, toy: false, sat: true },
]

export const COST_NOTE = loc(
  '成本都是示意数字，只看量级：预算按售价的 5% 估算。两种用途各有自己的规格书，所以要写两套不同的测试程序。',
  'All costs are illustrative; only the order of magnitude matters. The budget is estimated at 5% of the selling price. Each application has its own specification, so two different test programs are needed.',
)

export function fmtMoney(x: number) {
  if (x === 0) return '$0'
  if (x < 0.1) return `$${x.toFixed(4)}`
  return `$${x.toFixed(2)}`
}

export const PHILO_TEXT = loc(
  '开始写程序之前，把四个因素都想一遍。写测试程序不是“对”与“错”的问题，而是在给定的条件下找最合适的方案。',
  'Before you start writing a program, think through all four factors. Writing a test program is not a matter of "right" or "wrong", but of finding the best solution under the given conditions.',
)

/* ---------- 4. 测试系统 ---------- */

export const SYS_LEAD: LText[] = [
  loc(
    '测试系统（ATE，Automated Test Equipment）是一堆电子和机械硬件，用来模拟 DUT 在实际应用中的工作条件，从而找出坏片。',
    'A test system (ATE, Automated Test Equipment) is a collection of electronic and mechanical hardware that simulates the operating conditions the DUT will see in its application, in order to find bad parts.',
  ),
  loc(
    '它其实是电源、电表、信号源、图形发生器等许多仪器的集合，全部听一台主控计算机指挥。计算机执行测试程序：给 DUT 正确的电压、电流、时序和功能状态，监视响应，再和预设极限比较，得出 Pass/Fail。',
    'It is really a collection of many instruments (power supplies, meters, signal sources, pattern generators and more) all directed by a main control computer. The computer runs the test program: it applies the correct voltages, currents, timing and functional states to the DUT, monitors the response, and compares it with preset limits to reach Pass/Fail.',
  ),
]

export type BlockId = 'cpu' | 'dps' | 'rvs' | 'pmu' | 'vec' | 'timing' | 'opt' | 'clk' | 'ext' | 'head' | 'lb' | 'bin'

export const BLOCKS: Record<BlockId, { title: Txt; text: LText }> = {
  cpu: {
    title: loc('CPU / 硬盘 / 网络', 'CPU / disk / network'),
    text: loc(
      '系统控制器。里面的计算机控制整台测试机，负责数据进出：新机器一般有网络接口和存储介质。硬盘和内存在本地存信息，显示器和键盘给操作员用。',
      'The system controller. Its computer controls the whole tester and handles data in and out; newer machines usually have a network interface and storage media. Disk and memory store information locally, and the monitor and keyboard serve the operator.',
    ),
  },
  dps: {
    title: loc('DPS（Device Power Supply）', 'DPS (Device Power Supply)'),
    text: loc('器件电源：给 DUT 的电源脚（VDD / VCC）提供电压和电流。', 'Device power supply: provides voltage and current to the DUT power pins (VDD / VCC).'),
  },
  rvs: {
    title: loc('RVS（Reference Voltage Supply）', 'RVS (Reference Voltage Supply)'),
    text: loc(
      '参考电压源：给管脚电子卡上的驱动器和比较器提供 0 / 1 的参考电平，也就是 VIL、VIH、VOL、VOH。老的或便宜的机器 RVS 数量有限，同一时刻能设的输入 / 输出电平种类也有限。',
      'Reference voltage supply: provides the 0 / 1 reference levels, i.e. VIL, VIH, VOL and VOH, to the drivers and comparators on the pin electronics cards. Older or cheaper testers have few RVSs, which limits how many different input / output levels can be set at one time.',
    ),
  },
  pmu: {
    title: loc('PMU（Precision Measurement Unit）', 'PMU (Precision Measurement Unit)'),
    text: loc(
      '精密测量单元：做精确的 DC 测量，能加压测流或加流测压。有的系统在测试头里给每个管脚配一个 PMU（PMU per pin）。',
      'Precision measurement unit: makes accurate DC measurements, forcing voltage / measuring current or forcing current / measuring voltage. Some systems put one PMU per pin in the test head (PMU per pin).',
    ),
  },
  vec: {
    title: loc('向量存储器', 'Vector memory'),
    text: loc(
      '高速存储器，存测试向量（也叫测试图形、真值表）：每一行是各输入、输出在某个时刻的状态。输入（驱动）图形送给 DUT；输出（期望）图形拿去和 DUT 的输出比较，不一致就是功能失效。',
      'High-speed memory holding the test vectors (also called test patterns or truth tables): each row is the state of every input and output at one moment. Input (drive) patterns are applied to the DUT; output (expect) patterns are compared with the DUT outputs, and any mismatch is a functional failure.',
    ),
  },
  timing: {
    title: loc('时序子系统', 'Timing subsystem'),
    text: loc(
      '存着格式（Format，波形形状）、屏蔽（Mask）和时序组（Time Set）。它从向量存储器拿到驱动数据，加上波形格式和边沿时刻，变成格式化数据送到管脚卡的驱动器；同时给输出采样提供 Strobe 时刻。',
      'Holds the formats (waveform shapes), masks and time sets. It takes drive data from vector memory, applies the waveform format and edge times, and sends the formatted data to the pin card drivers; it also provides the strobe times for sampling outputs.',
    ),
  },
  opt: {
    title: loc('特殊选件', 'Special options'),
    text: loc(
      '各种可选硬件：例如做存储器测试用的算法图形发生器（APG），或做模拟测试的专用模块。',
      'Various optional hardware, such as an algorithmic pattern generator (APG) for memory test, or dedicated modules for analog test.',
    ),
  },
  clk: {
    title: loc('系统时钟', 'System clocks'),
    text: loc(
      '让信息在整台系统里同步流动。这些时钟往往比功能测试的速率高得多。很多系统还有校准电路，能自动检查和校准系统时序。',
      'Keep information flowing synchronously through the whole system. These clocks often run much faster than the functional test rate. Many systems also have calibration circuitry that automatically checks and calibrates system timing.',
    ),
  },
  ext: {
    title: loc('外部接口', 'External interfaces'),
    text: loc(
      '和其它硬件通信：探针台、分选机，或特殊的测试仪器。通常用串口或 GPIB（IEEE-488）协议。',
      'Communicate with other hardware: probers, handlers or special test instruments. Usually via serial or GPIB (IEEE-488) protocols.',
    ),
  },
  head: {
    title: loc('测试头 / 管脚电子', 'Test head / pin electronics'),
    text: loc(
      '测试头里插着管脚电子卡，并对接 DUT 的测试硬件（负载板）。一个“测试通道”就是卡上为一个 DUT 管脚提供和检测电压、电流、时序的那一组电路。',
      'The test head holds the pin electronics cards and docks to the DUT test hardware (load board). A "test channel" is the set of circuits on a card that supplies and senses voltage, current and timing for one DUT pin.',
    ),
  },
  lb: {
    title: loc('负载板', 'Load board'),
    text: loc(
      '测试系统和 DUT 之间的物理接口。通过测试座、探针卡或分选机接到 DUT 上；板上放着测试需要的元件，比如继电器、电阻负载、电源去耦电容。',
      'The physical interface between the test system and the DUT. It connects to the DUT through a socket, probe card or handler, and carries components needed for test such as relays, resistive loads and power supply decoupling capacitors.',
    ),
  },
  bin: {
    title: 'Bin box',
    text: loc(
      '放在测试头旁边的小盒子（test box / bin box），一般有 Start 和 Reset 按钮，并显示 Pass/Fail 结果。',
      'A small box next to the test head (test box / bin box), usually with Start and Reset buttons and a Pass/Fail display.',
    ),
  },
}

export type ArchId = 'shared' | 'perpin'

export const ARCH_TEXT: Record<ArchId, LText> = {
  shared: loc(
    '共享资源：几个管脚共用同一组 RVS（或同一套时序）。用同一组的管脚只能设成同样的电平。资源越少，程序越难排。',
    'Shared resources: several pins share one set of RVSs (or one set of timing). Pins in the same group can only be set to the same levels. The fewer the resources, the harder the program is to arrange.',
  ),
  perpin: loc(
    'Tester per pin：每个管脚都能独立设置输入 / 输出电平和时序。程序好写，测试也快，但硬件贵。',
    'Tester per pin: every pin can have its own input / output levels and timing. Programs are easier to write and tests run faster, but the hardware is expensive.',
  ),
}

export const VEC_KINDS: Array<{ id: string; title: LText; sub: Txt; text: LText }> = [
  {
    id: 'par',
    title: loc('并行向量', 'Parallel vectors'),
    sub: 'Parallel',
    text: loc(
      '每一行同时给出所有管脚的状态，一行一个周期，从各管脚并行加上去、并行比较。',
      'Each row gives the state of all pins at once, one row per cycle, applied and compared on all pins in parallel.',
    ),
  },
  {
    id: 'scan',
    title: loc('Scan 向量', 'Scan vectors'),
    sub: 'Scan',
    text: loc(
      '把芯片内部的触发器串成一条长链，从少数几个 Scan 管脚串行移进移出数据。详见 {@fScan}。',
      'The flip-flops inside the chip are chained into a long shift register, and data is shifted serially in and out through a few scan pins. See {@fScan}.',
    ),
  },
]

/* ---------- 5. PMU ---------- */

export const PMU_LEAD: LText[] = [
  loc(
    'PMU 用来做精确的 DC 测量。“Force”（施加）指测试机主动加上一个电压或电流。',
    'The PMU makes accurate DC measurements. "Force" means the tester actively applies a voltage or current.',
  ),
  loc(
    '选了加电流，测量就自动变成测电压；选了加电压，测量就自动变成测电流。选好模式，再设施加值。',
    'Choose force current and the measurement automatically becomes voltage; choose force voltage and it becomes current. Pick the mode first, then set the force value.',
  ),
  loc(
    '有的系统只有一个中央 PMU，所有通道轮流用；有的有几个，每个管 8 或 16 个通道；高端系统每个通道一个 PMU（PMU per pin）。',
    'Some systems have a single central PMU that all channels share in turn; some have several, each serving 8 or 16 channels; high-end systems have one PMU per channel (PMU per pin).',
  ),
]

export type PmuMode = 'fvmi' | 'fimv'

/** 本模拟里 PMU 硬件本身的输出极限（示意） */
export const PMU_IMAX = 500
export const PMU_VMAX = 30

export type PmuIn = {
  mode: PmuMode
  /** FVMI 为 V，FIMV 为 mA */
  force: number
  /** 负载电阻 Ω，开路为 Infinity */
  r: number
  clampOn: boolean
  /** FVMI 为 mA，FIMV 为 V */
  clamp: number
}

export type PmuOut = { v: number; i: number; clamped: boolean; hw: boolean }

/** 电流单位 mA，电压单位 V */
export function pmuSolve(p: PmuIn): PmuOut {
  if (p.mode === 'fvmi') {
    const ideal = Number.isFinite(p.r) ? (p.force / p.r) * 1000 : 0
    const lim = p.clampOn ? Math.min(p.clamp, PMU_IMAX) : PMU_IMAX
    if (ideal > lim) return { v: (lim / 1000) * p.r, i: lim, clamped: p.clampOn, hw: !p.clampOn }
    return { v: p.force, i: ideal, clamped: false, hw: false }
  }
  const ideal = Number.isFinite(p.r) ? (p.force / 1000) * p.r : Infinity
  const lim = p.clampOn ? Math.min(p.clamp, PMU_VMAX) : PMU_VMAX
  if (ideal > lim) {
    const i = Number.isFinite(p.r) ? (lim / p.r) * 1000 : 0
    return { v: lim, i, clamped: p.clampOn, hw: !p.clampOn }
  }
  return { v: ideal, i: p.force, clamped: false, hw: false }
}

export type PmuPreset = {
  id: string
  label: LText
  mode: PmuMode
  force: number
  r: number
  clampOn: boolean
  clamp: number
  hi: number
  text: LText
}

export const PMU_PRESETS: PmuPreset[] = [
  {
    id: 'fv-good',
    label: loc('例 1：5 V / 250 Ω', 'Ex. 1: 5 V / 250 Ω'),
    mode: 'fvmi',
    force: 5,
    r: 250,
    clampOn: true,
    clamp: 30,
    hi: 25,
    text: loc(
      '加 5 V 到 250 Ω：I = E / R = 20 mA。规格要求最大 25 mA，所以设 Fail GT 25 mA，电流钳位 30 mA。读到 20 mA，Pass。',
      'Force 5 V into 250 Ω: I = E / R = 20 mA. The spec allows at most 25 mA, so set Fail GT 25 mA with a 30 mA current clamp. The reading is 20 mA: Pass.',
    ),
  },
  {
    id: 'fv-short-nc',
    label: loc('例 1 坏品 10 Ω，无钳位', 'Ex. 1 bad part 10 Ω, no clamp'),
    mode: 'fvmi',
    force: 5,
    r: 10,
    clampOn: false,
    clamp: 30,
    hi: 25,
    text: loc(
      '坏品只有 10 Ω：5 V / 10 Ω = 500 mA！这么大的电流可能烧掉探针卡、走线、管脚电子，甚至旁边的 DUT。',
      'The bad part is only 10 Ω: 5 V / 10 Ω = 500 mA! That much current can burn the probe card, traces, pin electronics, or even neighboring DUTs.',
    ),
  },
  {
    id: 'fv-short',
    label: loc('例 1 坏品 10 Ω，钳位 30 mA', 'Ex. 1 bad part 10 Ω, clamp 30 mA'),
    mode: 'fvmi',
    force: 5,
    r: 10,
    clampOn: true,
    clamp: 30,
    hi: 25,
    text: loc(
      '同一个坏品，电流被钳在 30 mA。30 mA 大于 25 mA 的 Fail 限，测试照样 Fail，电流却被限制在安全值。DUT 上的电压只剩 30 mA × 10 Ω = 0.3 V。',
      'Same bad part, but the current is clamped at 30 mA. 30 mA exceeds the 25 mA fail limit, so the test still fails while the current stays at a safe value. The voltage on the DUT drops to 30 mA × 10 Ω = 0.3 V.',
    ),
  },
  {
    id: 'fi-good',
    label: loc('例 2：10 mA / 500 Ω', 'Ex. 2: 10 mA / 500 Ω'),
    mode: 'fimv',
    force: 10,
    r: 500,
    clampOn: true,
    clamp: 6,
    hi: 5.25,
    text: loc(
      '加 10 mA 到 500 Ω：E = I × R = 5 V。规格最大 5.25 V，所以设 Fail GT 5.25 V，电压钳位 6 V。读到 5 V，Pass。',
      'Force 10 mA into 500 Ω: E = I × R = 5 V. The spec maximum is 5.25 V, so set Fail GT 5.25 V with a 6 V voltage clamp. The reading is 5 V: Pass.',
    ),
  },
  {
    id: 'fi-open',
    label: loc('例 2 坏品：开路，钳位 6 V', 'Ex. 2 bad part: open, clamp 6 V'),
    mode: 'fimv',
    force: 10,
    r: Infinity,
    clampOn: true,
    clamp: 6,
    hi: 5.25,
    text: loc(
      '开路时 10 mA 无处可流，PMU 会一直往上推电压。有 6 V 钳位，电压停在 6 V：超过 5.25 V，Fail，而且电压安全。',
      'With an open, the 10 mA has nowhere to flow, so the PMU keeps pushing the voltage up. With a 6 V clamp the voltage stops at 6 V: above 5.25 V, so it fails, and the voltage stays safe.',
    ),
  },
  {
    id: 'fi-open-nc',
    label: loc('例 2 坏品：开路，无钳位', 'Ex. 2 bad part: open, no clamp'),
    mode: 'fimv',
    force: 10,
    r: Infinity,
    clampOn: false,
    clamp: 6,
    hi: 5.25,
    text: loc(
      '10 mA 进 500 Ω 是 5 V，进 5 kΩ 是 50 V，进开路理论上是无穷大。没有钳位，电压就冲到 PMU 能输出的最大值，可能伤到 DUT、硬件甚至操作员。',
      '10 mA into 500 Ω is 5 V, into 5 kΩ is 50 V, and into an open is in theory infinite. Without a clamp the voltage shoots to the PMU maximum output and can damage the DUT, the hardware or even the operator.',
    ),
  },
]

export const LIMIT_TEXT: LText[] = [
  loc(
    'PMU 有两个可编程的测量极限：上限和下限。可以只开一个，也可以两个都开。',
    'The PMU has two programmable measurement limits: a high limit and a low limit. You can enable either one or both.',
  ),
  loc(
    '上限做 Fail Greater Than（FGT）比较：读数比上限更正，就 Fail。',
    'The high limit performs a Fail Greater Than (FGT) comparison: a reading more positive than the limit fails.',
  ),
  loc(
    '下限做 Fail Less Than（FLT）比较：读数比下限更负，就 Fail。',
    'The low limit performs a Fail Less Than (FLT) comparison: a reading more negative than the limit fails.',
  ),
]

export const CLAMP_TEXT: LText[] = [
  loc(
    '钳位是限制 PMU 输出电压或电流的电路，用来保护操作员、测试硬件和 DUT。',
    'A clamp is a circuit that limits the PMU output voltage or current, protecting the operator, the test hardware and the DUT.',
  ),
  loc(
    '加压时，PMU 会给出“维持这个电压所需的任意电流”。管脚对地短路，它就拼命加大电流——所以加压必须设电流钳位。',
    'When forcing voltage, the PMU supplies "whatever current is needed to hold that voltage". If the pin is shorted to ground it drives ever more current, so forcing voltage always requires a current clamp.',
  ),
  loc(
    '加流时，PMU 会把电压一直往上推，直到推出设定的电流。管脚开路，电压就一路飙升——所以加流必须设电压钳位。',
    'When forcing current, the PMU keeps raising the voltage until the set current flows. If the pin is open the voltage soars, so forcing current always requires a voltage clamp.',
  ),
  loc(
    '钳位值必须设在 Fail 限之外。否则读数最多只到钳位，永远超不过极限，这条测试永远不会 Fail。',
    'The clamp must be set beyond the fail limit. Otherwise the reading can never exceed the clamp, never crosses the limit, and the test can never fail.',
  ),
]

/* ---------- 6. Kelvin ---------- */

export const KELVIN_LEAD: LText[] = [
  loc(
    '为了让加的电压准，PMU 用四线制：两根 Force 线走电流，两根 Sense 线去量关心的那一点（通常是 DUT）的电压。',
    'To force an accurate voltage, the PMU uses a four-wire connection: two Force lines carry the current, and two Sense lines measure the voltage at the point of interest (usually the DUT).',
  ),
  loc(
    '导线都有电阻。按欧姆定律，电流流过导线就会产生压降，所以 DUT 上的电压和 PMU 输出端的电压不一样。',
    'All wires have resistance. By Ohm\'s law, current through a wire produces a voltage drop, so the voltage at the DUT differs from the voltage at the PMU output.',
  ),
  loc(
    'Sense 线不走电流，没有压降，量到的就是 DUT 上的真实电压；PMU 根据它把输出抬高，补上导线压降。Force 线和 Sense 线连在一起的那一点叫 Kelvin 连接点。',
    'The Sense lines carry no current and so have no drop; they read the true voltage at the DUT, and the PMU raises its output accordingly to make up for the wire drop. The point where the Force and Sense lines join is called the Kelvin connection.',
  ),
]

export const KELVIN_V = 5

/* ---------- 7. 量程 ---------- */

export const RANGE_LEAD: LText[] = [
  loc(
    'PMU 要选施加量程和测量量程。选对量程，结果才最准：一般选能覆盖目标值的最小量程。',
    'The PMU needs a force range and a measure range. The right range gives the most accurate result: generally choose the smallest range that covers the target value.',
  ),
  loc(
    '量程同时也是上限：施加量程决定最多能加多少；测量量程决定最多能量多少，超出部分量不到。',
    'A range is also a ceiling: the force range sets the most you can apply, and the measure range sets the most you can measure; anything beyond it cannot be read.',
  ),
]

export const FORCE_RANGES = [2, 10]
export const MEAS_RANGES = [1, 10, 100]
export const RANGE_LOAD = 1000

export const GLITCH_TEXT = loc(
  '接着 DUT 换量程！换量程会产生噪声尖峰（毛刺，glitch）——信号在极短时间内突然跳变，可能损坏 DUT。正确做法：先断开 PMU，换好量程再接上。',
  'Changing range while connected to the DUT! A range change produces a noise spike (glitch): a sudden jump in the signal for a very short time that can damage the DUT. The correct way: disconnect the PMU, change the range, then reconnect.',
)

/* ---------- 8. 管脚电子 ---------- */

export const PE_LEAD: LText[] = [
  loc(
    '管脚电子（Pin Card、PE、PEC 或 I/O 卡）是测试系统资源和 DUT 之间的接口：给 DUT 送输入信号，接收 DUT 的输出信号。',
    'Pin electronics (pin card, PE, PEC or I/O card) is the interface between the test system resources and the DUT: it delivers input signals to the DUT and receives the DUT output signals.',
  ),
  loc(
    '各家设计不同，但一般都有：驱动器、开关驱动器和电流负载的 I/O 切换电路、电压比较器、PMU 接入点、可编程电流负载，可能还有高速电流测量电路，甚至每通道一个 PMU。',
    'Designs vary by vendor, but most include: a driver, I/O switching circuitry for the driver and current load, voltage comparators, a PMU connection point, a programmable current load, and possibly high-speed current measurement circuitry or even one PMU per channel.',
  ),
]

export type PeMode = 'drive' | 'compare' | 'pmu' | 'leak'

export type PeSwitch = { f1: boolean; f2: boolean; k1: boolean; k2: boolean; k3: boolean }

/** F1、F2 由同一根“高速 I/O 切换”信号控制，F2 前面有一个反相器，所以两者总是一开一关 */
export function peSwitch(mode: PeMode): PeSwitch {
  return {
    f1: mode === 'drive',
    f2: mode !== 'drive',
    k1: mode === 'drive' || mode === 'compare',
    k2: mode === 'pmu',
    k3: mode === 'leak',
  }
}

/** 先断后合：切换过程中只保留新旧两种状态都闭合的开关 */
export function peTransit(a: PeMode, b: PeMode): PeSwitch {
  const x = peSwitch(a)
  const y = peSwitch(b)
  return { f1: x.f1 && y.f1, f2: x.f2 && y.f2, k1: x.k1 && y.k1, k2: x.k2 && y.k2, k3: x.k3 && y.k3 }
}

export const PE_MODES: Array<{ id: PeMode; label: LText; text: LText }> = [
  {
    id: 'drive',
    label: loc('输入（驱动）', 'Input (drive)'),
    text: loc(
      '通道设成输入：F1 打开、K1 闭合，驱动器的信号送到 DUT。驱动器收到时序子系统送来的格式化数据 FDATA：要 0 就输出 RVS 给的 VIL，要 1 就输出 VIH。F2 关断，电流负载不接入。',
      'Channel set as input: F1 on, K1 closed, so the driver signal reaches the DUT. The driver receives formatted data FDATA from the timing subsystem: for a 0 it outputs the VIL supplied by the RVS, for a 1 it outputs VIH. F2 is off, so the current load is not connected.',
    ),
  },
  {
    id: 'compare',
    label: loc('输出（比较 + 负载）', 'Output (compare + load)'),
    text: loc(
      '通道设成输出：F1 关断，驱动器的信号过不去；F2 打开，电流负载接上 DUT 输出；电压比较器拿 DUT 的输出和 VOL / VOH 比。',
      'Channel set as output: F1 off, so the driver signal is blocked; F2 on, so the current load is connected to the DUT output; the voltage comparators compare the DUT output with VOL / VOH.',
    ),
  },
  {
    id: 'pmu',
    label: loc('PMU 测量', 'PMU measure'),
    text: loc(
      'PMU 接入管脚时，先断开 K1，再合上 K2。这个顺序让 PMU 和整套 I/O 电路隔离开，DC 测量不受驱动器、负载、比较器影响。',
      'To connect the PMU to a pin, first open K1, then close K2. This order isolates the PMU from the whole I/O circuit, so the DC measurement is unaffected by the driver, load and comparators.',
    ),
  },
  {
    id: 'leak',
    label: loc('高速漏电', 'Fast leakage'),
    text: loc(
      '有的系统用高速电流比较器代替每通道一个 PMU，快速测小电流（漏电）。K3 把电流比较器接到被测管脚上。系统若已经是 PMU per pin，就不需要它。',
      'Some systems use a high-speed current comparator instead of one PMU per channel to measure small currents (leakage) quickly. K3 connects the current comparator to the pin under test. A system that already has PMU per pin does not need it.',
    ),
  },
]

export const PE_PARTS: LText[] = [
  loc(
    'F1 / F2 是场效应管（FET），当作高速开关用：F1 把驱动器和 DUT 隔开，F2 把电流负载和 DUT 隔开。I/O 切换（DUT 一会儿收数据、一会儿送数据）全靠它们。',
    'F1 / F2 are field-effect transistors (FETs) used as high-speed switches: F1 isolates the driver from the DUT and F2 isolates the current load from the DUT. I/O switching (the DUT receiving data one moment and sending it the next) depends entirely on them.',
  ),
  loc(
    'K1 / K2 / K3 是继电器，动作慢，在测试项目之间切换：K1 接 I/O 电路，K2 接 PMU，K3 接高速电流比较器。',
    'K1 / K2 / K3 are relays: slow, and switched between tests. K1 connects the I/O circuit, K2 the PMU, and K3 the high-speed current comparator.',
  ),
]

export const VIH_LV = 3.0
export const VIL_LV = 0.0
export const VOH_LV = 2.4
export const VOL_LV = 0.4
export const IOL_MA = 8
export const IOH_MA = 0.4

export type CmpRead = 'low' | 'high' | 'mid'

export function compare(v: number): CmpRead {
  if (v <= VOL_LV) return 'low'
  if (v >= VOH_LV) return 'high'
  return 'mid'
}

export const CMP_TEXT: Record<CmpRead, LText> = {
  low: loc('输出 ≤ VOL：比较器认成逻辑 0。', 'Output ≤ VOL: the comparator reads logic 0.'),
  high: loc('输出 ≥ VOH：比较器认成逻辑 1。', 'Output ≥ VOH: the comparator reads logic 1.'),
  mid: loc(
    '输出在 VOL 和 VOH 之间：既不是有效的 0 也不是有效的 1——要么是三态（高阻），要么是坏输出。',
    'Output between VOL and VOH: neither a valid 0 nor a valid 1. It is either tri-stated (high impedance) or a bad output.',
  ),
}

/** 二极管热电压 n·kT/q（V）：决定两路分流的过渡宽度 */
const DIODE_VT = 0.026
/** |Vout − VREF| 小于它时算“过渡区”，代码面板高亮第三个分支 */
export const LOAD_BAND = 0.1

export type LoadBranch = 'iol' | 'ioh' | 'mid'

/**
 * 电流负载 = 二极管桥 + 两个恒流源。
 * 上节点 A 由 IOL 源灌入电流，下节点 B 由 IOH 源抽走电流；左节点接 VREF 缓冲器，右节点经 F2 接 DUT。
 *   D1：A → DUT   D2：A → VREF   D3：VREF → B   D4：DUT → B
 * A 的电压由左右两点中较低的那点决定，IOL 主要走阴极更低的那只二极管；B 同理，IOH 主要从阳极更高的那点抽。
 * 两只并联二极管的电流比 = exp(ΔV / VT)，所以 Vout 离 VREF 几个 VT 以外就几乎全走一边。
 * 返回各支路电流（mA），iDut 正 = 从测试机流入 DUT。
 */
export function bridge(v: number, vref: number) {
  const toDut = 1 / (1 + Math.exp((v - vref) / DIODE_VT))
  const d1 = IOL_MA * toDut
  const d2 = IOL_MA - d1
  const d4 = IOH_MA * (1 - toDut)
  const d3 = IOH_MA - d4
  const branch: LoadBranch = v < vref - LOAD_BAND ? 'iol' : v > vref + LOAD_BAND ? 'ioh' : 'mid'
  return { d1, d2, d3, d4, iDut: d1 - d4, branch }
}

/** DUT 输出高阻时没有别的电流通路，引脚停在 iDut = 0 的点：VREF + VT·ln(IOL / IOH)，只比 VREF 高几十 mV */
export const HIZ_OFFSET = DIODE_VT * Math.log(IOL_MA / IOH_MA)

export const LOAD_TEXT: LText[] = [
  loc(
    '电流负载（也叫动态负载、可编程电流负载）在功能测试时给 DUT 输出当负载，能编程为正电流或负电流。',
    'The current load (also called dynamic load or programmable current load) loads the DUT outputs during functional test and can be programmed for positive or negative current.',
  ),
  loc(
    '方向约定：正电流 = 从测试机流入器件；负电流 = 从器件流入测试机。',
    'Direction convention: positive current flows from the tester into the device; negative current flows from the device into the tester.',
  ),
  loc(
    'IOL：输出 0 时 DUT 必须“吸”进的电流；IOH：输出 1 时 DUT 必须“送”出的电流。VREF 设定切换点：输出比 VREF 低，流 IOL；比 VREF 高，流 IOH。',
    'IOL: the current the DUT must sink when outputting 0; IOH: the current the DUT must source when outputting 1. VREF sets the switch point: below VREF the load draws IOL, above VREF it draws IOH.',
  ),
  loc(
    '电路上它是一个二极管桥：上端由 IOL 恒流源往里灌电流，下端由 IOH 恒流源往外抽电流，左端接 VREF，右端经 F2 接 DUT。不需要任何控制信号，DUT 的电压自己决定二极管谁导通：输出比 VREF 低，D1 导通，IOL 流进 DUT，同时 D3 导通，IOH 由 VREF 那边提供；输出比 VREF 高，D2 把 IOL 引到 VREF，D4 从 DUT 抽走 IOH。真实二极管在 VREF 附近几十 mV 内是两路分流，净电流从 +IOL 平滑过渡到 −IOH。',
    'In circuit terms it is a diode bridge: an IOL current source pushes current into the top node, an IOH current source pulls current out of the bottom node, the left node is tied to VREF and the right node reaches the DUT through F2. No control signal is needed; the DUT voltage itself decides which diodes conduct. Below VREF, D1 conducts and IOL flows into the DUT, while D3 conducts and IOH is supplied from the VREF side. Above VREF, D2 steers IOL into VREF and D4 pulls IOH out of the DUT. Real diodes share the current within a few tens of mV of VREF, so the net current moves smoothly from +IOL to −IOH.',
  ),
  loc(
    '三态（高阻）测试就靠它：DUT 输出高阻时没有别的电流通路，桥把引脚拉到净电流为 0 的那一点，也就是约等于 VREF。VREF 设在 VOL 和 VOH 之间，比较器就读到“中间”，测试机由此判出这只脚确实是高阻。',
    'Tri-state (high-impedance) testing relies on this. With the DUT output in high impedance there is no other current path, so the bridge pulls the pin to the point where the net current is zero, which is about VREF. Set VREF between VOL and VOH, and the comparators read "between", which is how the tester confirms the pin really is high impedance.',
  ),
  loc('电流负载还用在三态功能测试和功能式开短路测试里。', 'The current load is also used in tri-state functional tests and functional opens/shorts tests.'),
]

/** 代码面板：把二极管桥写成程序。on 表示该行属于哪个分支（不写 = 常亮）；code 只含 ASCII，变量值运行时填入 */
export const LOAD_CODE: Array<{ code: string; cm?: LText; on?: LoadBranch; fill?: 'iol' | 'ioh' | 'vref' }> = [
  { code: '', cm: loc('测试程序里只设三个数', 'The test program sets only three numbers') },
  { code: 'load.IOL  = ', fill: 'iol', cm: loc('DUT 输出 0 时要吸的电流', 'current the DUT must sink at 0') },
  { code: 'load.IOH  = ', fill: 'ioh', cm: loc('DUT 输出 1 时要送的电流', 'current the DUT must source at 1') },
  { code: 'load.VREF = ', fill: 'vref', cm: loc('切换点', 'switch point') },
  { code: '' },
  { code: '', cm: loc('二极管桥每一刻都在做的事（硬件自动完成，不用写）', 'What the diode bridge does at every instant (done by hardware, not written)') },
  { code: 'function currentLoad(Vout) {' },
  { code: '  const band = 0.1', cm: loc('V：二极管从全通到全断只需约 4 个热电压', 'V: a diode goes from fully on to off within about 4 thermal voltages') },
  { code: '  if (Vout < VREF - band) {', on: 'iol' },
  { code: '    return +IOL', on: 'iol', cm: loc('D1 导通：IOL 流入 DUT；D3 导通：IOH 由 VREF 提供', 'D1 on: IOL into the DUT; D3 on: IOH supplied by VREF') },
  { code: '  }', on: 'iol' },
  { code: '  if (Vout > VREF + band) {', on: 'ioh' },
  { code: '    return -IOH', on: 'ioh', cm: loc('D2 导通：IOL 流进 VREF；D4 导通：IOH 从 DUT 抽出', 'D2 on: IOL into VREF; D4 on: IOH pulled out of the DUT') },
  { code: '  }', on: 'ioh' },
  {
    code: '  return share(IOL, IOH)',
    on: 'mid',
    cm: loc('VREF 附近：两路分流，净电流在 +IOL 和 −IOH 之间', 'Near VREF: both paths share, net current between +IOL and −IOH'),
  },
  { code: '}' },
]

export const CONFLICT_TEXT = loc(
  'I/O 冲突（总线争用，bus contention）：DUT 和驱动器同时往同一个通道上驱动电压。一边推高一边拉低，大电流对冲，读数没有意义，还可能损坏器件。双向脚切换读写时最容易出这种事。',
  'I/O conflict (bus contention): the DUT and the driver drive voltage onto the same channel at the same time. One pushes high while the other pulls low, large currents fight each other, the reading is meaningless, and the device may be damaged. It happens most easily when bidirectional pins switch between read and write.',
)

export const PPPMU_TEXT = loc(
  'PPPMU（per pin PMU）：每个管脚一个 PMU，能在所有管脚上同时测电压或电流，同样能加流测压、加压测流。代价是它通常没有系统主 PMU 那么全的功能（量程、精度等）。',
  'PPPMU (per pin PMU): one PMU per pin, able to measure voltage or current on all pins simultaneously, with the same force current / measure voltage and force voltage / measure current modes. The trade-off is that it usually lacks the full capability (ranges, accuracy, etc.) of the main system PMU.',
)

/* ---------- 9. 测试工程守则 ---------- */

export const RULES: LText[] = [
  loc(
    '永远不要把输入脚当输出脚做功能测试——比如误在输入脚上打开了输出比较。信号加在输入上，结果从输出上看。',
    'Never functionally test an input pin as an output, for example by accidentally enabling output compare on an input pin. Signals are applied to inputs, and results are observed on outputs.',
  ),
  loc('永远不要把测试机的驱动器接到 DUT 的输出脚上：两边会在同一点同时驱动。', 'Never connect a tester driver to a DUT output pin: both would drive the same node at once.'),
  loc(
    '永远不要让输入脚悬空，必须给它有效的 0 或 1。CMOS 输入悬空可能引起 latch-up（类似 SCR 的效应，会吸大电流烧毁器件）。',
    'Never leave an input pin floating; always give it a valid 0 or 1. A floating CMOS input can cause latch-up (an SCR-like effect that draws large current and destroys the device).',
  ),
  loc(
    '永远不要给输入或输出脚加高于 VDD 或低于地的电压，这可能让 CMOS 器件 latch-up。',
    'Never apply a voltage above VDD or below ground to an input or output pin; it can cause latch-up in CMOS devices.',
  ),
  loc('加压时一定要设电流钳位。', 'Always set a current clamp when forcing voltage.'),
  loc('加流时一定要设电压钳位。', 'Always set a voltage clamp when forcing current.'),
  loc(
    '接着器件时，永远不要切换施加量程，也不要切换 PMU 的模式（加压 / 加流）。',
    'Never change the force range or the PMU mode (force voltage / force current) while connected to the device.',
  ),
]

export const RULES_LEAD = loc(
  '下面这些规则大多数情况下都适用。它们被单独列出来，是因为在很多测试程序里反复出问题。看着显而易见，但在具体的测试硬件上，违反它们比你想的容易。如果哪天你真要故意违反，先确认你完全清楚后果。',
  'The rules below apply in most situations. They are listed separately because they cause problems again and again in many test programs. They look obvious, but on real test hardware they are easier to break than you might think. If you ever really must break one on purpose, make sure you fully understand the consequences first.',
)

export type RuleAns = 'ok' | 'bad'

export const RULE_CASES: Array<{ id: string; text: LText; answer: RuleAns; why: LText }> = [
  {
    id: 'c1',
    text: loc('功能测试时，给输入脚 A0 也打开了输出比较（没设屏蔽）。', 'During functional test, output compare is also enabled on input pin A0 (no mask set).'),
    answer: 'bad',
    why: loc(
      '违规（第 1 条）：输入脚只接收信号，不做 Pass/Fail 比较。比较器会去读驱动器自己的电平，结果毫无意义，还可能误判。',
      'Violation (rule 1): an input pin only receives signals and is not compared for Pass/Fail. The comparator would read the driver\'s own level, which is meaningless and may cause false results.',
    ),
  },
  {
    id: 'c2',
    text: loc('DUT 的 Q 是输出脚，测试机这一路却开着驱动器在驱动。', 'Q is a DUT output pin, yet the tester channel has its driver enabled and driving.'),
    answer: 'bad',
    why: loc(
      '违规（第 2 条）：测试机和 DUT 同时在同一点驱动电压和电流，就是 I/O 冲突，可能损坏器件。',
      'Violation (rule 2): the tester and the DUT drive voltage and current onto the same node at once; that is an I/O conflict and may damage the device.',
    ),
  },
  {
    id: 'c3',
    text: loc('CMOS 芯片有一个用不到的输入脚，程序里没管它，让它悬空。', 'A CMOS chip has an unused input pin that the program ignores and leaves floating.'),
    answer: 'bad',
    why: loc(
      '违规（第 3 条）：悬空的 CMOS 输入电平不确定，可能引起 latch-up，吸大电流烧毁器件。必须给它有效的 0 或 1。',
      'Violation (rule 3): a floating CMOS input has an undefined level and may cause latch-up, drawing large current and destroying the device. It must be given a valid 0 or 1.',
    ),
  },
  {
    id: 'c4',
    text: loc('VDD = 5 V，为了“加严”测试，给输入脚加 6 V（VDD + 1 V）。', 'VDD = 5 V, and to make the test "tighter", 6 V (VDD + 1 V) is applied to an input pin.'),
    answer: 'bad',
    why: loc(
      '违规（第 4 条）：高于 VDD 的电压会让输入保护结构导通，可能触发 CMOS latch-up。',
      'Violation (rule 4): a voltage above VDD turns on the input protection structure and can trigger CMOS latch-up.',
    ),
  },
  {
    id: 'c5',
    text: loc('PMU 加压测流 2 V，“反正芯片是好的”，没设电流钳位。', 'The PMU forces 2 V and measures current with no current clamp, because "the chip is good anyway".'),
    answer: 'bad',
    why: loc(
      '违规（第 5 条）：一旦碰到短路的坏品，PMU 会给出任意大的电流，烧针卡、烧管脚电子。',
      'Violation (rule 5): as soon as a shorted bad part comes along, the PMU supplies unlimited current, burning the probe card and pin electronics.',
    ),
  },
  {
    id: 'c6',
    text: loc('PMU 加流 10 mA，Fail GT 5.25 V，电压钳位设 6 V。', 'The PMU forces 10 mA, Fail GT 5.25 V, voltage clamp at 6 V.'),
    answer: 'ok',
    why: loc(
      '可以（第 6 条）：加流设了电压钳位，而且 6 V 在 5.25 V 的 Fail 限之外——开路时电压被限在 6 V，测试照样能 Fail。',
      'OK (rule 6): forcing current with a voltage clamp, and 6 V is beyond the 5.25 V fail limit; with an open the voltage is held at 6 V and the test still fails.',
    ),
  },
  {
    id: 'c7',
    text: loc('PMU 还接在管脚上，程序直接从加压测流切到加流测压。', 'With the PMU still connected to the pin, the program switches straight from force voltage to force current.'),
    answer: 'bad',
    why: loc(
      '违规（第 7 条）：接着器件切换 PMU 模式，会在管脚上产生毛刺，可能损坏 DUT。先断开再切换。',
      'Violation (rule 7): switching PMU mode while connected creates a glitch on the pin that may damage the DUT. Disconnect first, then switch.',
    ),
  },
  {
    id: 'c8',
    text: loc('先断开 PMU 的继电器，切换到 100 µA 量程，再把 PMU 接回管脚。', 'Open the PMU relay first, switch to the 100 µA range, then reconnect the PMU to the pin.'),
    answer: 'ok',
    why: loc(
      '可以（第 7 条的正确做法）：量程是在断开状态下换的，DUT 上不会出现毛刺。',
      'OK (the correct way for rule 7): the range is changed while disconnected, so no glitch appears on the DUT.',
    ),
  },
]

/* ---------- 带走 / 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc(
    '信号脚有输入、输出、三态、双向四种；电源脚 VDD / VCC / VSS / Ground 另算。',
    'Signal pins come in four kinds: input, output, tri-state and bidirectional; power pins VDD / VCC / VSS / Ground are separate.',
  ),
  loc(
    '测试程序分 DC、功能、AC 三段；每项给 Pass/Fail，还能按性能分 Bin。',
    'A test program has three sections: DC, functional and AC; each test gives Pass/Fail, and parts can be binned by performance.',
  ),
  loc(
    '没有唯一正确的测法：看测试目的、测试机能力、成本和公司测试哲学。',
    'There is no single right way to test: it depends on test purpose, tester capability, cost and company test philosophy.',
  ),
  loc(
    'PMU 加压测流、加流测压；加压必设电流钳位，加流必设电压钳位，钳位要设在 Fail 限之外。',
    'The PMU forces voltage / measures current or forces current / measures voltage; forcing voltage needs a current clamp, forcing current needs a voltage clamp, and the clamp must be beyond the fail limit.',
  ),
  loc(
    '管脚电子：驱动器经 F1/K1 驱动，比较器和电流负载读输出；PMU 接入要先断 K1 再合 K2。',
    'Pin electronics: the driver drives through F1/K1, and the comparators and current load handle outputs; to connect the PMU, open K1 before closing K2.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('数字测试程序通常分成哪三段？', 'Which three sections does a digital test program usually have?'),
    options: [
      { id: 'a', text: loc('DC 测试、功能测试、AC 测试', 'DC test, functional test, AC test') },
      { id: 'b', text: loc('晶圆测试、封装测试、QA 测试', 'Wafer sort, package test, QA test') },
      { id: 'c', text: loc('开路测试、短路测试、漏电测试', 'Open test, short test, leakage test') },
      { id: 'd', text: loc('上电、跑向量、下电', 'Power up, run vectors, power down') },
    ],
    answer: 'a',
    explain: loc(
      'DC 验证电压电流参数，功能验证逻辑是否正确，AC 验证能否在规定时序内完成操作。B 是测试的不同用途，不是程序的分段。',
      'DC verifies voltage and current parameters, functional verifies the logic, and AC verifies that operations complete within the specified timing. B lists different test purposes, not program sections.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('“正电流”的定义是：', '"Positive current" is defined as:'),
    options: [
      { id: 'a', text: loc('从测试机流入 DUT 的电流', 'Current flowing from the tester into the DUT') },
      { id: 'b', text: loc('从 DUT 流入测试机的电流', 'Current flowing from the DUT into the tester') },
      { id: 'c', text: loc('从高电压流向低电压的电流', 'Current flowing from high voltage to low voltage') },
    ],
    answer: 'a',
    explain: loc(
      'ATE 的约定：正电流从测试系统流入器件，负电流从器件流入测试系统。所以 IOL（DUT 吸电流）是正的，IOH（DUT 送电流）是负的。',
      'The ATE convention: positive current flows from the test system into the device, negative current from the device into the test system. So IOL (DUT sinking) is positive and IOH (DUT sourcing) is negative.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('既能当输入又能当输出的管脚叫什么？', 'What is a pin that can act as both input and output called?'),
    options: [
      { id: 'a', text: loc('三态输出脚', 'Tri-state output pin') },
      { id: 'b', text: loc('双向脚（Bi-directional）', 'Bidirectional pin') },
      { id: 'c', text: loc('电源脚', 'Power pin') },
      { id: 'd', text: loc('信号地', 'Signal ground') },
    ],
    answer: 'b',
    explain: loc(
      '双向脚能当输入、当输出，还能关成高阻。三态输出脚只能输出或高阻，不能当输入。',
      'A bidirectional pin can be an input, an output, or high impedance. A tri-state output pin can only output or go high impedance; it cannot be an input.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('测试系统里哪个资源给 DUT 供电（提供电压和电流）？', 'Which test system resource powers the DUT (supplies voltage and current)?'),
    options: [
      { id: 'a', text: loc('RVS', 'RVS') },
      { id: 'b', text: loc('DPS', 'DPS') },
      { id: 'c', text: loc('驱动器（Driver）', 'Driver') },
    ],
    answer: 'b',
    explain: loc(
      'DPS（Device Power Supply）给 DUT 电源脚供电。RVS 只给驱动器和比较器提供参考电平；驱动器给输入脚送信号。',
      'The DPS (Device Power Supply) powers the DUT supply pins. The RVS only provides reference levels to the drivers and comparators; the driver sends signals to input pins.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('测试系统里哪个资源用来做非常精确的电压、电流测量？', 'Which test system resource makes very accurate voltage and current measurements?'),
    options: [
      { id: 'a', text: loc('电压比较器', 'Voltage comparator') },
      { id: 'b', text: loc('PMU（Precision Measurement Unit）', 'PMU (Precision Measurement Unit)') },
      { id: 'c', text: loc('向量存储器', 'Vector memory') },
      { id: 'd', text: loc('DPS', 'DPS') },
    ],
    answer: 'b',
    explain: loc(
      'PMU 就是精密测量单元，能加压测流、加流测压。比较器只判断高于 / 低于参考电平，不给出精确数值。',
      'The PMU is the precision measurement unit, able to force voltage / measure current and force current / measure voltage. A comparator only decides above / below a reference level and gives no exact value.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('哪种测试验证器件各个逻辑操作 / 功能是否正确？', 'Which test verifies that each logic operation / function of the device is correct?'),
    options: [
      { id: 'a', text: loc('DC 测试', 'DC test') },
      { id: 'b', text: loc('AC 测试', 'AC test') },
      { id: 'c', text: loc('功能测试', 'Functional test') },
      { id: 'd', text: loc('开短路测试', 'Opens/shorts test') },
    ],
    answer: 'c',
    explain: loc(
      '功能测试灌向量、比较输出，验证逻辑功能。AC 测试关心的是时序，DC 测试关心的是电压电流参数。',
      'Functional test applies vectors and compares outputs to verify logic functions. AC test is about timing, and DC test is about voltage and current parameters.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('用 PMU 加电流时，应该设哪种钳位？', 'When forcing current with the PMU, which clamp should be set?'),
    options: [
      { id: 'a', text: loc('电流钳位', 'Current clamp') },
      { id: 'b', text: loc('电压钳位', 'Voltage clamp') },
      { id: 'c', text: loc('都不用，加电流时不用钳位', 'Neither; no clamp is needed when forcing current') },
    ],
    answer: 'b',
    explain: loc(
      '加流时 PMU 会把电压一直往上推。遇到开路，电压会冲到 PMU 的最大输出，所以必须用电压钳位限制。',
      'When forcing current, the PMU keeps pushing the voltage up. With an open, the voltage shoots to the PMU maximum, so a voltage clamp must limit it.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('用 PMU 加电压时，应该设哪种钳位？', 'When forcing voltage with the PMU, which clamp should be set?'),
    options: [
      { id: 'a', text: loc('电流钳位', 'Current clamp') },
      { id: 'b', text: loc('电压钳位', 'Voltage clamp') },
      { id: 'c', text: loc('都不用，加电压时不用钳位', 'Neither; no clamp is needed when forcing voltage') },
    ],
    answer: 'a',
    explain: loc(
      '加压时 PMU 会给出维持电压所需的任意电流。遇到短路，电流可能大到烧坏硬件，所以必须用电流钳位限制。',
      'When forcing voltage, the PMU supplies whatever current is needed to hold the voltage. With a short, the current can become large enough to burn hardware, so a current clamp must limit it.',
    ),
  },
  {
    id: 'q9',
    prompt: loc(
      '四线制（Kelvin）里，为什么 Sense 线量到的电压比 Force 线准？',
      'In a four-wire (Kelvin) connection, why is the voltage read on the Sense line more accurate than on the Force line?',
    ),
    options: [
      { id: 'a', text: loc('Sense 线不走电流，导线上没有压降', 'The Sense line carries no current, so there is no drop along it') },
      { id: 'b', text: loc('Sense 线比 Force 线粗', 'The Sense line is thicker than the Force line') },
      { id: 'c', text: loc('Sense 线自带放大器', 'The Sense line has a built-in amplifier') },
    ],
    answer: 'a',
    explain: loc(
      '压降 = 电流 × 导线电阻。Force 线走电流，有压降；Sense 线几乎没有电流，量到的就是 Kelvin 连接点（DUT）上的真实电压。',
      'Voltage drop = current × wire resistance. The Force line carries current and has a drop; the Sense line carries almost no current, so it reads the true voltage at the Kelvin connection (the DUT).',
    ),
  },
  {
    id: 'q10',
    prompt: loc(
      '加压 5 V，Fail GT 25 mA，但电流钳位设成了 20 mA。来了一颗 10 Ω 的短路坏品，结果是？',
      'Force 5 V, Fail GT 25 mA, but the current clamp is set to 20 mA. A shorted 10 Ω bad part arrives. What happens?',
    ),
    options: [
      { id: 'a', text: loc('读到 20 mA，判 Pass——坏品漏网', 'Reads 20 mA and passes: the bad part escapes') },
      { id: 'b', text: loc('读到 500 mA，判 Fail', 'Reads 500 mA and fails') },
      { id: 'c', text: loc('读到 25 mA，判 Fail', 'Reads 25 mA and fails') },
    ],
    answer: 'a',
    explain: loc(
      '电流最多只能到钳位 20 mA，永远超不过 25 mA 的上限，这条测试永远不会 Fail。钳位必须设在 Fail 限之外，例如 30 mA。',
      'The current can reach at most the 20 mA clamp and never exceeds the 25 mA limit, so this test can never fail. The clamp must be set beyond the fail limit, e.g. 30 mA.',
    ),
  },
]
