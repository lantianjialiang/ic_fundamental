import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

type Txt = LText | string

/* ---------- 1. DUT 与管脚 ---------- */

export const DUT_LEAD: LText[] = [
  loc('被测的芯片叫 DUT（Device Under Test），有时也叫 UUT（Unit Under Test）。'),
  loc('信号通过管脚（pin）进出 DUT。输入、输出、三态、双向这四类合称“信号脚”；电源脚和地不算信号脚，它们的内部结构也和信号脚不一样。'),
]

export type PinKind = 'input' | 'output' | 'tri' | 'bidir' | 'power'

export const PIN_TYPES: Array<{ id: PinKind; title: LText; sub: Txt; text: LText; explain: LText[] }> = [
  {
    id: 'input',
    title: loc('输入脚'),
    sub: loc('外部 → 芯片内部'),
    text: loc('输入脚是外部信号和内部逻辑之间的缓冲器。它感知加上来的电压，把它翻译成 0 或 1 交给内部电路。'),
    explain: [
      loc('测试时，测试机“驱动”输入脚：要 0 就给 VIL，要 1 就给 VIH。'),
      loc('输入脚本身不做 Pass/Fail 比较——信号加在输入上，结果从输出上看。'),
    ],
  },
  {
    id: 'output',
    title: loc('输出脚'),
    sub: loc('芯片内部 → 外部'),
    text: loc('输出脚是内部逻辑和外部之间的缓冲器。它要输出正确的 0 / 1 电压，同时还要能带得动 IOL / IOH 电流。'),
    explain: [
      loc('测试时，测试机用比较器读它的电压（和 VOL / VOH 比），用电流负载给它加 IOL / IOH。'),
      loc('输出脚不能接测试机的驱动器，否则两边同时在“推”同一个点。'),
    ],
  },
  {
    id: 'tri',
    title: loc('三态输出'),
    sub: 'Tri-State®',
    text: loc('功能和输出脚一样，多了一个本领：能“关掉”，进入高阻态（Z），既不拉高也不拉低。'),
    explain: [
      loc('高阻态让多颗芯片可以挂在同一根总线上，轮流输出。'),
      loc('测试时要额外验证：使能关闭时它真的放开了总线。'),
    ],
  },
  {
    id: 'bidir',
    title: loc('双向脚'),
    sub: loc('输入 + 输出 + 高阻'),
    text: loc('既能当输入，又能当输出，还能关成高阻。数据总线上的管脚大多是双向脚。'),
    explain: [
      loc('写数据时它是输入，读数据时它是输出。测试机这一路也要跟着在“驱动”和“比较”之间来回切换，这叫 I/O 切换。'),
      loc('切换时要保证 DUT 和测试机不会同时驱动，否则就是 I/O 冲突（见下面的管脚电子）。'),
    ],
  },
  {
    id: 'power',
    title: loc('电源脚'),
    sub: 'VDD / VCC / VSS / Ground',
    text: loc('接电源或地的管脚。它们由测试机的 DPS 供电，结构和信号脚不同。'),
    explain: [
      loc('VCC：TTL 器件的电源脚。'),
      loc('VDD：CMOS 器件的电源脚。'),
      loc('VSS：给 VDD / VCC 送进来的电流提供回流路径。'),
      loc('Ground（接地）：把信号脚或某个节点接到测试系统的参考点，或接到 VSS。只有一组电源的器件，VSS 常常就直接叫“地”。'),
    ],
  },
]

/* ---------- 2. 测试程序 ---------- */

export const PROG_LEAD: LText[] = [
  loc('测试程序的目的：控制测试硬件，保证 DUT 达到或超过规格书里的全部设计参数。'),
  loc('每一项测试都只给一个结论：Pass 或 Fail。Pass 说明满足规格；Fail 说明它达不到规格，不能用在目标应用里。'),
  loc('程序通常分三段：'),
]

export const PROG_PARTS: Array<{ id: string; title: LText; sub: LText; text: LText; explain: LText[] }> = [
  {
    id: 'dc',
    title: loc('DC 测试'),
    sub: loc('电压、电流参数'),
    text: loc('验证电压和电流参数：例如输出电压 VOL / VOH、输入漏电、电源电流。主要靠 PMU 一项项量。'),
    explain: [loc('DC 测试验证电压和电流参数。'), loc('详细做法见 {@fDc}。')],
  },
  {
    id: 'func',
    title: loc('功能测试'),
    sub: loc('逻辑对不对'),
    text: loc('验证器件各个逻辑功能是否正确：把向量一行行灌进去，比较每个输出是不是期望值。'),
    explain: [loc('功能测试验证各个逻辑功能的正确性。'), loc('详细做法见 {@fFunc}。')],
  },
  {
    id: 'ac',
    title: loc('AC 测试'),
    sub: loc('在规定时间内做对'),
    text: loc('验证器件能在规定的时序约束内完成逻辑操作：比如传输延迟、建立 / 保持时间。'),
    explain: [loc('AC 测试验证“够不够快”：逻辑对了，还要在规定的时间内对。'), loc('详细做法见 {@fAc}。')],
  },
]

export const BIN_LEAD = loc(
  '测试程序还能按性能把好片分档，这叫分 Bin（binning）。同一批 CPU，能跑 150 MHz 的是最好的 Bin 1；只能跑 100 MHz 的不如它，但也不该扔掉，归为 Bin 2，卖给另一类客户。',
)

export const BIN1_F = 150
export const BIN2_F = 100

export type BinId = 'bin1' | 'bin2' | 'speed' | 'dc'

export const BINS: Array<{ id: BinId; label: LText; good: boolean }> = [
  { id: 'bin1', label: loc('Bin 1（≥ 150 MHz）'), good: true },
  { id: 'bin2', label: loc('Bin 2（≥ 100 MHz）'), good: true },
  { id: 'speed', label: loc('不合格：太慢'), good: false },
  { id: 'dc', label: loc('不合格：DC / 功能'), good: false },
]

export function binOf(fmax: number): BinId {
  if (fmax >= BIN1_F) return 'bin1'
  if (fmax >= BIN2_F) return 'bin2'
  return 'speed'
}

export const BIN_TEXT: Record<BinId, LText> = {
  bin1: loc('150 MHz 也能正确工作：最好的一档，Bin 1，卖最高价。'),
  bin2: loc('150 MHz 下出错，但 100 MHz 下正确：降一档到 Bin 2，照样能卖。'),
  speed: loc('连 100 MHz 都跑不对：达不到任何一档的规格，判 Fail。'),
  dc: loc('DC 或功能测试就没过，根本轮不到测速度。'),
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
  loc('程序还要指挥外部设备：告诉分选机（handler）或探针台（prober）这颗测完了、该放进哪个 Bin、换下一颗。'),
  loc('最后，它要把结果汇总成报表。测试工程师和产品工程师看这些汇总找问题、提良率。'),
]

/* ---------- 3. 没有唯一正确的测法 ---------- */

export const RIGHT_LEAD = loc(
  '“测试程序怎么写才对？”没有唯一答案。对这个场合最好的方法，换个场合未必合适。写程序之前，先把下面四个因素想清楚。',
)

export const FACTORS: Array<{ id: string; title: LText; sub: LText; text: LText }> = [
  { id: 'purpose', title: loc('测试目的'), sub: loc('测来干什么'), text: loc('晶圆测试、成品测试、QA、表征……每种用途要求不同，需要各自的测试程序。') },
  { id: 'tester', title: loc('测试机能力'), sub: loc('手里有什么设备'), text: loc('程序要把测试机的本事用足。同一个参数，高端机和低成本机的测法可能完全不同。') },
  { id: 'money', title: loc('成本'), sub: loc('最重要的一条'), text: loc('测试会显著增加制造成本。测什么、怎么测，很多时候就是拿售价和测试成本来权衡。') },
  { id: 'philo', title: loc('公司测试哲学'), sub: loc('公司的共识'), text: loc('测试哲学是公司内部对“怎么测最好”的共识：取决于自身需求、产品售价，也常受过去的经验教训影响。') },
]

export const PURPOSES: Array<{ id: string; title: LText; sub: Txt; text: LText }> = [
  { id: 'wafer', title: loc('晶圆测试'), sub: 'Wafer / Die Sort', text: loc('还在晶圆上就逐颗测试，第一次把好 die 和坏 die 分开。也叫 wafer sort 或 die sort。') },
  { id: 'pkg', title: loc('封装测试'), sub: loc('成品测试 Final Test'), text: loc('晶圆切开、每颗 die 封进封装之后再测：确认封装过程没出错，并且器件仍然满足设计规格。') },
  { id: 'qa', title: loc('QA 测试'), sub: 'Quality Assurance', text: loc('抽样复测，确认封装测试本身做对了。') },
  { id: 'char', title: loc('器件表征'), sub: 'Characterization', text: loc('找出每个参数的工作极限——它到底能工作到多快、多低的电压。') },
  { id: 'burn', title: loc('老化前后测试'), sub: 'Pre / Post Burn-In', text: loc('老化前后各测一次，确认老化没有让参数漂移；并筛掉“早夭”器件——有缺陷、刚用不久就会坏的那些。') },
  { id: 'mil', title: loc('军品测试'), sub: 'Military', text: loc('在整个温度范围内做严格测试，并把结果完整记录存档。') },
  { id: 'incoming', title: loc('来料检验'), sub: 'Incoming Inspection', text: loc('客户买回芯片后自己测一遍，用到产品里之前先确认质量。') },
  { id: 'assy', title: loc('组装验证'), sub: 'Assembly Verification', text: loc('确认器件挺过了组装过程、而且装对了。测试项目和封装测试类似，可能是它的子集；通常在海外封装厂做。') },
  { id: 'fa', title: loc('失效分析'), sub: 'Failure Analysis', text: loc('分析坏掉的器件，找出它为什么坏。找到原因就能改进可靠性。') },
]

export const TESTER_ROWS: Array<{ id: string; item: Txt; high: LText; low: LText; impact: LText }> = [
  {
    id: 'timing',
    item: loc('时序'),
    high: loc('高精度，能做高速测量'),
    low: loc('速度低、精度低'),
    impact: loc('低成本机的时序精度可能达不到器件规格的要求，有些 AC 参数根本没法直接测。'),
  },
  {
    id: 'mem',
    item: loc('向量存储器'),
    high: loc('大，图形一次装完'),
    low: loc('小，可能要中途重装向量'),
    impact: loc('重装向量要花时间，每颗芯片的测试时间就变长了。'),
  },
  {
    id: 'pmu',
    item: 'PMU',
    high: loc('多个，DC 可以并行测'),
    low: loc('只有一个，只能串行测'),
    impact: loc('只有一个 PMU 时，几百个管脚的 DC 参数只能一个接一个量，DC 测试时间很长。'),
  },
  {
    id: 'load',
    item: loc('电流负载'),
    high: loc('可编程'),
    low: loc('可能没有，要靠负载板上的硬件'),
    impact: loc('可编程电流负载让接口硬件更简单，程序里改个数就能换负载，更灵活。'),
  },
  {
    id: 'perpin',
    item: loc('时序与电平'),
    high: loc('每个管脚独立（per pin）'),
    low: loc('共享资源'),
    impact: loc('资源共享时，程序要想办法让共用同一组电平 / 时序的管脚凑在一起，程序更复杂，测试也更慢。'),
  },
]

export type UseId = 'toy' | 'sat'

export const USES: Array<{ id: UseId; label: LText; price: number; text: LText }> = [
  { id: 'toy', label: loc('游戏玩具：$0.15'), price: 0.15, text: loc('一颗只卖 $0.15，只能承受最少的测试成本。') },
  { id: 'sat', label: loc('卫星：$350'), price: 350, text: loc('同一颗芯片用在卫星上卖 $350，能承受昂贵的测试。坏一颗的代价是整颗卫星。') },
]

/** 示意：测试成本按售价的 5% 估算 */
export const BUDGET_RATIO = 0.05

export type TestItemId = 'opens' | 'func' | 'dc' | 'ac' | 'vdd' | 'temp' | 'burn' | 'doc'

export const TEST_ITEMS: Array<{ id: TestItemId; label: LText; cost: number; toy: boolean; sat: boolean }> = [
  { id: 'opens', label: loc('开短路'), cost: 0.001, toy: true, sat: true },
  { id: 'func', label: loc('功能测试（典型 VDD）'), cost: 0.003, toy: true, sat: true },
  { id: 'dc', label: loc('全部 DC 参数'), cost: 0.004, toy: false, sat: true },
  { id: 'ac', label: loc('全部 AC 时序参数'), cost: 0.006, toy: false, sat: true },
  { id: 'vdd', label: loc('最高 / 最低 VDD 再跑一遍功能'), cost: 0.004, toy: false, sat: true },
  { id: 'temp', label: loc('高温、低温各测一遍'), cost: 0.8, toy: false, sat: true },
  { id: 'burn', label: loc('老化前后各测一遍'), cost: 6, toy: false, sat: true },
  { id: 'doc', label: loc('逐颗记录数据、出报告'), cost: 3, toy: false, sat: true },
]

export const COST_NOTE = loc('成本都是示意数字，只看量级：预算按售价的 5% 估算。两种用途各有自己的规格书，所以要写两套不同的测试程序。')

export function fmtMoney(x: number) {
  if (x === 0) return '$0'
  if (x < 0.1) return `$${x.toFixed(4)}`
  return `$${x.toFixed(2)}`
}

export const PHILO_TEXT = loc(
  '开始写程序之前，把四个因素都想一遍。写测试程序不是“对”与“错”的问题，而是在给定的条件下找最合适的方案。',
)

/* ---------- 4. 测试系统 ---------- */

export const SYS_LEAD: LText[] = [
  loc('测试系统（ATE，Automated Test Equipment）是一堆电子和机械硬件，用来模拟 DUT 在实际应用中的工作条件，从而找出坏片。'),
  loc('它其实是电源、电表、信号源、图形发生器等许多仪器的集合，全部听一台主控计算机指挥。计算机执行测试程序：给 DUT 正确的电压、电流、时序和功能状态，监视响应，再和预设极限比较，得出 Pass/Fail。'),
]

export type BlockId = 'cpu' | 'dps' | 'rvs' | 'pmu' | 'vec' | 'timing' | 'opt' | 'clk' | 'ext' | 'head' | 'lb' | 'bin'

export const BLOCKS: Record<BlockId, { title: Txt; text: LText }> = {
  cpu: {
    title: loc('CPU / 硬盘 / 网络'),
    text: loc('系统控制器。里面的计算机控制整台测试机，负责数据进出：新机器一般有网络接口和存储介质。硬盘和内存在本地存信息，显示器和键盘给操作员用。'),
  },
  dps: {
    title: 'DPS（Device Power Supply）',
    text: loc('器件电源：给 DUT 的电源脚（VDD / VCC）提供电压和电流。'),
  },
  rvs: {
    title: 'RVS（Reference Voltage Supply）',
    text: loc('参考电压源：给管脚电子卡上的驱动器和比较器提供 0 / 1 的参考电平，也就是 VIL、VIH、VOL、VOH。老的或便宜的机器 RVS 数量有限，同一时刻能设的输入 / 输出电平种类也有限。'),
  },
  pmu: {
    title: 'PMU（Precision Measurement Unit）',
    text: loc('精密测量单元：做精确的 DC 测量，能加压测流或加流测压。有的系统在测试头里给每个管脚配一个 PMU（PMU per pin）。'),
  },
  vec: {
    title: loc('向量存储器'),
    text: loc('高速存储器，存测试向量（也叫测试图形、真值表）：每一行是各输入、输出在某个时刻的状态。输入（驱动）图形送给 DUT；输出（期望）图形拿去和 DUT 的输出比较，不一致就是功能失效。'),
  },
  timing: {
    title: loc('时序子系统'),
    text: loc('存着格式（Format，波形形状）、屏蔽（Mask）和时序组（Time Set）。它从向量存储器拿到驱动数据，加上波形格式和边沿时刻，变成格式化数据送到管脚卡的驱动器；同时给输出采样提供 Strobe 时刻。'),
  },
  opt: {
    title: loc('特殊选件'),
    text: loc('各种可选硬件：例如做存储器测试用的算法图形发生器（APG），或做模拟测试的专用模块。'),
  },
  clk: {
    title: loc('系统时钟'),
    text: loc('让信息在整台系统里同步流动。这些时钟往往比功能测试的速率高得多。很多系统还有校准电路，能自动检查和校准系统时序。'),
  },
  ext: {
    title: loc('外部接口'),
    text: loc('和其它硬件通信：探针台、分选机，或特殊的测试仪器。通常用串口或 GPIB（IEEE-488）协议。'),
  },
  head: {
    title: loc('测试头 / 管脚电子'),
    text: loc('测试头里插着管脚电子卡，并对接 DUT 的测试硬件（负载板）。一个“测试通道”就是卡上为一个 DUT 管脚提供和检测电压、电流、时序的那一组电路。'),
  },
  lb: {
    title: loc('负载板'),
    text: loc('测试系统和 DUT 之间的物理接口。通过测试座、探针卡或分选机接到 DUT 上；板上放着测试需要的元件，比如继电器、电阻负载、电源去耦电容。'),
  },
  bin: {
    title: 'Bin box',
    text: loc('放在测试头旁边的小盒子（test box / bin box），一般有 Start 和 Reset 按钮，并显示 Pass/Fail 结果。'),
  },
}

export type ArchId = 'shared' | 'perpin'

export const ARCH_TEXT: Record<ArchId, LText> = {
  shared: loc('共享资源：几个管脚共用同一组 RVS（或同一套时序）。用同一组的管脚只能设成同样的电平。资源越少，程序越难排。'),
  perpin: loc('Tester per pin：每个管脚都能独立设置输入 / 输出电平和时序。程序好写，测试也快，但硬件贵。'),
}

export const VEC_KINDS: Array<{ id: string; title: LText; sub: Txt; text: LText }> = [
  { id: 'par', title: loc('并行向量'), sub: 'Parallel', text: loc('每一行同时给出所有管脚的状态，一行一个周期，从各管脚并行加上去、并行比较。') },
  { id: 'scan', title: loc('Scan 向量'), sub: 'Scan', text: loc('把芯片内部的触发器串成一条长链，从少数几个 Scan 管脚串行移进移出数据。详见 {@fScan}。') },
]

/* ---------- 5. PMU ---------- */

export const PMU_LEAD: LText[] = [
  loc('PMU 用来做精确的 DC 测量。“Force”（施加）指测试机主动加上一个电压或电流。'),
  loc('选了加电流，测量就自动变成测电压；选了加电压，测量就自动变成测电流。选好模式，再设施加值。'),
  loc('有的系统只有一个中央 PMU，所有通道轮流用；有的有几个，每个管 8 或 16 个通道；高端系统每个通道一个 PMU（PMU per pin）。'),
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
    label: loc('例 1：5 V / 250 Ω'),
    mode: 'fvmi',
    force: 5,
    r: 250,
    clampOn: true,
    clamp: 30,
    hi: 25,
    text: loc('加 5 V 到 250 Ω：I = E / R = 20 mA。规格要求最大 25 mA，所以设 Fail GT 25 mA，电流钳位 30 mA。读到 20 mA，Pass。'),
  },
  {
    id: 'fv-short-nc',
    label: loc('例 1 坏品 10 Ω，无钳位'),
    mode: 'fvmi',
    force: 5,
    r: 10,
    clampOn: false,
    clamp: 30,
    hi: 25,
    text: loc('坏品只有 10 Ω：5 V / 10 Ω = 500 mA！这么大的电流可能烧掉探针卡、走线、管脚电子，甚至旁边的 DUT。'),
  },
  {
    id: 'fv-short',
    label: loc('例 1 坏品 10 Ω，钳位 30 mA'),
    mode: 'fvmi',
    force: 5,
    r: 10,
    clampOn: true,
    clamp: 30,
    hi: 25,
    text: loc('同一个坏品，电流被钳在 30 mA。30 mA 大于 25 mA 的 Fail 限，测试照样 Fail，电流却被限制在安全值。DUT 上的电压只剩 30 mA × 10 Ω = 0.3 V。'),
  },
  {
    id: 'fi-good',
    label: loc('例 2：10 mA / 500 Ω'),
    mode: 'fimv',
    force: 10,
    r: 500,
    clampOn: true,
    clamp: 6,
    hi: 5.25,
    text: loc('加 10 mA 到 500 Ω：E = I × R = 5 V。规格最大 5.25 V，所以设 Fail GT 5.25 V，电压钳位 6 V。读到 5 V，Pass。'),
  },
  {
    id: 'fi-open',
    label: loc('例 2 坏品：开路，钳位 6 V'),
    mode: 'fimv',
    force: 10,
    r: Infinity,
    clampOn: true,
    clamp: 6,
    hi: 5.25,
    text: loc('开路时 10 mA 无处可流，PMU 会一直往上推电压。有 6 V 钳位，电压停在 6 V：超过 5.25 V，Fail，而且电压安全。'),
  },
  {
    id: 'fi-open-nc',
    label: loc('例 2 坏品：开路，无钳位'),
    mode: 'fimv',
    force: 10,
    r: Infinity,
    clampOn: false,
    clamp: 6,
    hi: 5.25,
    text: loc('10 mA 进 500 Ω 是 5 V，进 5 kΩ 是 50 V，进开路理论上是无穷大。没有钳位，电压就冲到 PMU 能输出的最大值，可能伤到 DUT、硬件甚至操作员。'),
  },
]

export const LIMIT_TEXT: LText[] = [
  loc('PMU 有两个可编程的测量极限：上限和下限。可以只开一个，也可以两个都开。'),
  loc('上限做 Fail Greater Than（FGT）比较：读数比上限更正，就 Fail。'),
  loc('下限做 Fail Less Than（FLT）比较：读数比下限更负，就 Fail。'),
]

export const CLAMP_TEXT: LText[] = [
  loc('钳位是限制 PMU 输出电压或电流的电路，用来保护操作员、测试硬件和 DUT。'),
  loc('加压时，PMU 会给出“维持这个电压所需的任意电流”。管脚对地短路，它就拼命加大电流——所以加压必须设电流钳位。'),
  loc('加流时，PMU 会把电压一直往上推，直到推出设定的电流。管脚开路，电压就一路飙升——所以加流必须设电压钳位。'),
  loc('钳位值必须设在 Fail 限之外。否则读数最多只到钳位，永远超不过极限，这条测试永远不会 Fail。'),
]

/* ---------- 6. Kelvin ---------- */

export const KELVIN_LEAD: LText[] = [
  loc('为了让加的电压准，PMU 用四线制：两根 Force 线走电流，两根 Sense 线去量关心的那一点（通常是 DUT）的电压。'),
  loc('导线都有电阻。按欧姆定律，电流流过导线就会产生压降，所以 DUT 上的电压和 PMU 输出端的电压不一样。'),
  loc('Sense 线不走电流，没有压降，量到的就是 DUT 上的真实电压；PMU 根据它把输出抬高，补上导线压降。Force 线和 Sense 线连在一起的那一点叫 Kelvin 连接点。'),
]

export const KELVIN_V = 5

/* ---------- 7. 量程 ---------- */

export const RANGE_LEAD: LText[] = [
  loc('PMU 要选施加量程和测量量程。选对量程，结果才最准：一般选能覆盖目标值的最小量程。'),
  loc('量程同时也是上限：施加量程决定最多能加多少；测量量程决定最多能量多少，超出部分量不到。'),
]

export const FORCE_RANGES = [2, 10]
export const MEAS_RANGES = [1, 10, 100]
export const RANGE_LOAD = 1000

export const GLITCH_TEXT = loc(
  '接着 DUT 换量程！换量程会产生噪声尖峰（毛刺，glitch）——信号在极短时间内突然跳变，可能损坏 DUT。正确做法：先断开 PMU，换好量程再接上。',
)

/* ---------- 8. 管脚电子 ---------- */

export const PE_LEAD: LText[] = [
  loc('管脚电子（Pin Card、PE、PEC 或 I/O 卡）是测试系统资源和 DUT 之间的接口：给 DUT 送输入信号，接收 DUT 的输出信号。'),
  loc('各家设计不同，但一般都有：驱动器、开关驱动器和电流负载的 I/O 切换电路、电压比较器、PMU 接入点、可编程电流负载，可能还有高速电流测量电路，甚至每通道一个 PMU。'),
]

export type PeMode = 'drive' | 'compare' | 'pmu' | 'leak'

export type PeSwitch = { f1: boolean; f2: boolean; k1: boolean; k2: boolean; k3: boolean }

export function peSwitch(mode: PeMode): PeSwitch {
  return {
    f1: mode === 'drive',
    f2: mode === 'compare',
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
    label: loc('输入（驱动）'),
    text: loc('通道设成输入：F1 打开、K1 闭合，驱动器的信号送到 DUT。驱动器收到时序子系统送来的格式化数据 FDATA：要 0 就输出 RVS 给的 VIL，要 1 就输出 VIH。F2 关断，电流负载不接入。'),
  },
  {
    id: 'compare',
    label: loc('输出（比较 + 负载）'),
    text: loc('通道设成输出：F1 关断，驱动器的信号过不去；F2 打开，电流负载接上 DUT 输出；电压比较器拿 DUT 的输出和 VOL / VOH 比。'),
  },
  {
    id: 'pmu',
    label: loc('PMU 测量'),
    text: loc('PMU 接入管脚时，先断开 K1，再合上 K2。这个顺序让 PMU 和整套 I/O 电路隔离开，DC 测量不受驱动器、负载、比较器影响。'),
  },
  {
    id: 'leak',
    label: loc('高速漏电'),
    text: loc('有的系统用高速电流比较器代替每通道一个 PMU，快速测小电流（漏电）。K3 把电流比较器接到被测管脚上。系统若已经是 PMU per pin，就不需要它。'),
  },
]

export const PE_PARTS: LText[] = [
  loc('F1 / F2 是场效应管（FET），当作高速开关用：F1 把驱动器和 DUT 隔开，F2 把电流负载和 DUT 隔开。I/O 切换（DUT 一会儿收数据、一会儿送数据）全靠它们。'),
  loc('K1 / K2 / K3 是继电器，动作慢，在测试项目之间切换：K1 接 I/O 电路，K2 接 PMU，K3 接高速电流比较器。'),
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
  low: loc('输出 ≤ VOL：比较器认成逻辑 0。'),
  high: loc('输出 ≥ VOH：比较器认成逻辑 1。'),
  mid: loc('输出在 VOL 和 VOH 之间：既不是有效的 0 也不是有效的 1——要么是三态（高阻），要么是坏输出。'),
}

/** 返回负载电流（mA，正 = 从测试机流入 DUT） */
export function loadCurrent(v: number, vref: number) {
  if (v < vref) return IOL_MA
  if (v > vref) return -IOH_MA
  return 0
}

export const LOAD_TEXT: LText[] = [
  loc('电流负载（也叫动态负载、可编程电流负载）在功能测试时给 DUT 输出当负载，能编程为正电流或负电流。'),
  loc('方向约定：正电流 = 从测试机流入器件；负电流 = 从器件流入测试机。'),
  loc('IOL：输出 0 时 DUT 必须“吸”进的电流；IOH：输出 1 时 DUT 必须“送”出的电流。VREF 设定切换点：输出比 VREF 低，流 IOL；比 VREF 高，流 IOH。'),
  loc('电流负载还用在三态功能测试和功能式开短路测试里。'),
]

export const CONFLICT_TEXT = loc(
  'I/O 冲突（总线争用，bus contention）：DUT 和驱动器同时往同一个通道上驱动电压。一边推高一边拉低，大电流对冲，读数没有意义，还可能损坏器件。双向脚切换读写时最容易出这种事。',
)

export const PPPMU_TEXT = loc(
  'PPPMU（per pin PMU）：每个管脚一个 PMU，能在所有管脚上同时测电压或电流，同样能加流测压、加压测流。代价是它通常没有系统主 PMU 那么全的功能（量程、精度等）。',
)

/* ---------- 9. 测试工程守则 ---------- */

export const RULES: LText[] = [
  loc('永远不要把输入脚当输出脚做功能测试——比如误在输入脚上打开了输出比较。信号加在输入上，结果从输出上看。'),
  loc('永远不要把测试机的驱动器接到 DUT 的输出脚上：两边会在同一点同时驱动。'),
  loc('永远不要让输入脚悬空，必须给它有效的 0 或 1。CMOS 输入悬空可能引起 latch-up（类似 SCR 的效应，会吸大电流烧毁器件）。'),
  loc('永远不要给输入或输出脚加高于 VDD 或低于地的电压，这可能让 CMOS 器件 latch-up。'),
  loc('加压时一定要设电流钳位。'),
  loc('加流时一定要设电压钳位。'),
  loc('接着器件时，永远不要切换施加量程，也不要切换 PMU 的模式（加压 / 加流）。'),
]

export const RULES_LEAD = loc(
  '下面这些规则大多数情况下都适用。它们被单独列出来，是因为在很多测试程序里反复出问题。看着显而易见，但在具体的测试硬件上，违反它们比你想的容易。如果哪天你真要故意违反，先确认你完全清楚后果。',
)

export type RuleAns = 'ok' | 'bad'

export const RULE_CASES: Array<{ id: string; text: LText; answer: RuleAns; why: LText }> = [
  {
    id: 'c1',
    text: loc('功能测试时，给输入脚 A0 也打开了输出比较（没设屏蔽）。'),
    answer: 'bad',
    why: loc('违规（第 1 条）：输入脚只接收信号，不做 Pass/Fail 比较。比较器会去读驱动器自己的电平，结果毫无意义，还可能误判。'),
  },
  {
    id: 'c2',
    text: loc('DUT 的 Q 是输出脚，测试机这一路却开着驱动器在驱动。'),
    answer: 'bad',
    why: loc('违规（第 2 条）：测试机和 DUT 同时在同一点驱动电压和电流，就是 I/O 冲突，可能损坏器件。'),
  },
  {
    id: 'c3',
    text: loc('CMOS 芯片有一个用不到的输入脚，程序里没管它，让它悬空。'),
    answer: 'bad',
    why: loc('违规（第 3 条）：悬空的 CMOS 输入电平不确定，可能引起 latch-up，吸大电流烧毁器件。必须给它有效的 0 或 1。'),
  },
  {
    id: 'c4',
    text: loc('VDD = 5 V，为了“加严”测试，给输入脚加 6 V（VDD + 1 V）。'),
    answer: 'bad',
    why: loc('违规（第 4 条）：高于 VDD 的电压会让输入保护结构导通，可能触发 CMOS latch-up。'),
  },
  {
    id: 'c5',
    text: loc('PMU 加压测流 2 V，“反正芯片是好的”，没设电流钳位。'),
    answer: 'bad',
    why: loc('违规（第 5 条）：一旦碰到短路的坏品，PMU 会给出任意大的电流，烧针卡、烧管脚电子。'),
  },
  {
    id: 'c6',
    text: loc('PMU 加流 10 mA，Fail GT 5.25 V，电压钳位设 6 V。'),
    answer: 'ok',
    why: loc('可以（第 6 条）：加流设了电压钳位，而且 6 V 在 5.25 V 的 Fail 限之外——开路时电压被限在 6 V，测试照样能 Fail。'),
  },
  {
    id: 'c7',
    text: loc('PMU 还接在管脚上，程序直接从加压测流切到加流测压。'),
    answer: 'bad',
    why: loc('违规（第 7 条）：接着器件切换 PMU 模式，会在管脚上产生毛刺，可能损坏 DUT。先断开再切换。'),
  },
  {
    id: 'c8',
    text: loc('先断开 PMU 的继电器，切换到 100 µA 量程，再把 PMU 接回管脚。'),
    answer: 'ok',
    why: loc('可以（第 7 条的正确做法）：量程是在断开状态下换的，DUT 上不会出现毛刺。'),
  },
]

/* ---------- 带走 / 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('信号脚有输入、输出、三态、双向四种；电源脚 VDD / VCC / VSS / Ground 另算。'),
  loc('测试程序分 DC、功能、AC 三段；每项给 Pass/Fail，还能按性能分 Bin。'),
  loc('没有唯一正确的测法：看测试目的、测试机能力、成本和公司测试哲学。'),
  loc('PMU 加压测流、加流测压；加压必设电流钳位，加流必设电压钳位，钳位要设在 Fail 限之外。'),
  loc('管脚电子：驱动器经 F1/K1 驱动，比较器和电流负载读输出；PMU 接入要先断 K1 再合 K2。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('数字测试程序通常分成哪三段？'),
    options: [
      { id: 'a', text: loc('DC 测试、功能测试、AC 测试') },
      { id: 'b', text: loc('晶圆测试、封装测试、QA 测试') },
      { id: 'c', text: loc('开路测试、短路测试、漏电测试') },
      { id: 'd', text: loc('上电、跑向量、下电') },
    ],
    answer: 'a',
    explain: loc('DC 验证电压电流参数，功能验证逻辑是否正确，AC 验证能否在规定时序内完成操作。B 是测试的不同用途，不是程序的分段。'),
  },
  {
    id: 'q2',
    prompt: loc('“正电流”的定义是：'),
    options: [
      { id: 'a', text: loc('从测试机流入 DUT 的电流') },
      { id: 'b', text: loc('从 DUT 流入测试机的电流') },
      { id: 'c', text: loc('从高电压流向低电压的电流') },
    ],
    answer: 'a',
    explain: loc('ATE 的约定：正电流从测试系统流入器件，负电流从器件流入测试系统。所以 IOL（DUT 吸电流）是正的，IOH（DUT 送电流）是负的。'),
  },
  {
    id: 'q3',
    prompt: loc('既能当输入又能当输出的管脚叫什么？'),
    options: [
      { id: 'a', text: loc('三态输出脚') },
      { id: 'b', text: loc('双向脚（Bi-directional）') },
      { id: 'c', text: loc('电源脚') },
      { id: 'd', text: loc('信号地') },
    ],
    answer: 'b',
    explain: loc('双向脚能当输入、当输出，还能关成高阻。三态输出脚只能输出或高阻，不能当输入。'),
  },
  {
    id: 'q4',
    prompt: loc('测试系统里哪个资源给 DUT 供电（提供电压和电流）？'),
    options: [
      { id: 'a', text: loc('RVS') },
      { id: 'b', text: loc('DPS') },
      { id: 'c', text: loc('驱动器（Driver）') },
    ],
    answer: 'b',
    explain: loc('DPS（Device Power Supply）给 DUT 电源脚供电。RVS 只给驱动器和比较器提供参考电平；驱动器给输入脚送信号。'),
  },
  {
    id: 'q5',
    prompt: loc('测试系统里哪个资源用来做非常精确的电压、电流测量？'),
    options: [
      { id: 'a', text: loc('电压比较器') },
      { id: 'b', text: loc('PMU（Precision Measurement Unit）') },
      { id: 'c', text: loc('向量存储器') },
      { id: 'd', text: loc('DPS') },
    ],
    answer: 'b',
    explain: loc('PMU 就是精密测量单元，能加压测流、加流测压。比较器只判断高于 / 低于参考电平，不给出精确数值。'),
  },
  {
    id: 'q6',
    prompt: loc('哪种测试验证器件各个逻辑操作 / 功能是否正确？'),
    options: [
      { id: 'a', text: loc('DC 测试') },
      { id: 'b', text: loc('AC 测试') },
      { id: 'c', text: loc('功能测试') },
      { id: 'd', text: loc('开短路测试') },
    ],
    answer: 'c',
    explain: loc('功能测试灌向量、比较输出，验证逻辑功能。AC 测试关心的是时序，DC 测试关心的是电压电流参数。'),
  },
  {
    id: 'q7',
    prompt: loc('用 PMU 加电流时，应该设哪种钳位？'),
    options: [
      { id: 'a', text: loc('电流钳位') },
      { id: 'b', text: loc('电压钳位') },
      { id: 'c', text: loc('都不用，加电流时不用钳位') },
    ],
    answer: 'b',
    explain: loc('加流时 PMU 会把电压一直往上推。遇到开路，电压会冲到 PMU 的最大输出，所以必须用电压钳位限制。'),
  },
  {
    id: 'q8',
    prompt: loc('用 PMU 加电压时，应该设哪种钳位？'),
    options: [
      { id: 'a', text: loc('电流钳位') },
      { id: 'b', text: loc('电压钳位') },
      { id: 'c', text: loc('都不用，加电压时不用钳位') },
    ],
    answer: 'a',
    explain: loc('加压时 PMU 会给出维持电压所需的任意电流。遇到短路，电流可能大到烧坏硬件，所以必须用电流钳位限制。'),
  },
  {
    id: 'q9',
    prompt: loc('四线制（Kelvin）里，为什么 Sense 线量到的电压比 Force 线准？'),
    options: [
      { id: 'a', text: loc('Sense 线不走电流，导线上没有压降') },
      { id: 'b', text: loc('Sense 线比 Force 线粗') },
      { id: 'c', text: loc('Sense 线自带放大器') },
    ],
    answer: 'a',
    explain: loc('压降 = 电流 × 导线电阻。Force 线走电流，有压降；Sense 线几乎没有电流，量到的就是 Kelvin 连接点（DUT）上的真实电压。'),
  },
  {
    id: 'q10',
    prompt: loc('加压 5 V，Fail GT 25 mA，但电流钳位设成了 20 mA。来了一颗 10 Ω 的短路坏品，结果是？'),
    options: [
      { id: 'a', text: loc('读到 20 mA，判 Pass——坏品漏网') },
      { id: 'b', text: loc('读到 500 mA，判 Fail') },
      { id: 'c', text: loc('读到 25 mA，判 Fail') },
    ],
    answer: 'a',
    explain: loc('电流最多只能到钳位 20 mA，永远超不过 25 mA 的上限，这条测试永远不会 Fail。钳位必须设在 Fail 限之外，例如 30 mA。'),
  },
]
