import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const ROLES: Card[] = [
  {
    id: 'verify',
    title: loc('功能验证'),
    sub: loc('Verification · 设计阶段'),
    text: loc('问：设计对不对？在仿真器或第一批样片上，尽量覆盖所有功能和角落情况。'),
    explain: [
      loc('验证关心“设计有没有 Bug”。向量可以很长、可以跑很久，目标是把设计意图全部检查一遍。'),
    ],
  },
  {
    id: 'mfg',
    title: loc('量产功能测试'),
    sub: loc('Manufacturing · 每一颗'),
    text: loc('问：这一颗有没有制造缺陷？设计已经被证明是对的。'),
    explain: [
      loc('量产关心“这颗芯片有没有做坏”。时间就是成本，所以要用尽量短的向量抓尽量多的缺陷——这就引出了故障模型和故障覆盖率。'),
    ],
  },
]

export const SOURCES: Card[] = [
  {
    id: 'app',
    title: loc('应用型 / 并行向量'),
    sub: loc('Application · Parallel'),
    text: loc('从芯片的外部管脚、按正常工作方式驱动和比较，就像真实系统在用它。'),
    explain: [
      loc('常来自设计验证的仿真波形，转换成测试机格式。直观、贴近实际用法，但对复杂电路很难做到高覆盖率。'),
    ],
  },
  {
    id: 'scan',
    title: loc('Scan / 结构化向量'),
    sub: loc('Structural · ATPG'),
    text: loc('不管芯片“用来干什么”，只按电路结构，用 ATPG 自动生成，目标是故障覆盖率。'),
    explain: [
      loc('借助 Scan 链把内部触发器变成可直接读写的节点，组合逻辑就能被逐块测试（{@vector}、{@scan}）。'),
    ],
  },
]

export const COVERAGE_LEAD = loc('故障覆盖率 = 被向量检测到的故障数 ÷ 故障模型里的故障总数。常用 Stuck-at 模型：假设每个节点可能固定在 0 或 1。故障模拟器把每个故障逐个注入，看向量能不能让输出出错。')

export const DFT: Card[] = [
  {
    id: 'adhoc',
    title: loc('Ad-hoc DFT'),
    sub: loc('针对具体难点'),
    text: loc('哪里难测改哪里：加测试点、加复位、把长计数器拆开。'),
    explain: [
      loc('经典例子：一个 30 位计数器，要看到最高位翻转得跑 2³⁰ 个时钟。加几个测试点把它拆成几段，每段可以单独预置和观察，测试时间从秒级降到微秒级。'),
    ],
  },
  {
    id: 'scan',
    title: loc('Scan'),
    sub: loc('结构化 DFT'),
    text: loc('把触发器串成移位寄存器，从外面直接写入和读出内部状态。'),
    explain: [
      loc('Mux Scan：每个触发器前加一个二选一，Scan Enable 选择“功能输入”还是“上一级的输出”。最常用。'),
      loc('LSSD（电平敏感扫描设计）：用两相不重叠时钟的锁存器对，对时序要求最宽松。'),
      loc('双时钟 Scan：功能时钟和扫描时钟分开，用不同时钟控制移位和捕获。'),
      loc('Full Scan：所有触发器都进链，ATPG 最容易；Partial Scan：只挑一部分，省面积和速度代价，但覆盖率和 ATPG 难度变差。'),
    ],
  },
  {
    id: 'bist',
    title: loc('BIST'),
    sub: loc('内建自测试'),
    text: loc('芯片自己产生向量、自己压缩结果。测试机只需要启动它、读一个签名。'),
    explain: [
      loc('LFSR（线性反馈移位寄存器）产生伪随机向量 → 送进被测电路 → MISR（多输入签名寄存器）把所有输出压缩成一个签名 → 和好片的签名比。'),
      loc('Memory BIST 最常见：大容量 SRAM 用片上 March 算法自测，测试机只读 Pass / Fail。'),
    ],
  },
  {
    id: 'jtag',
    title: loc('JTAG / 边界扫描'),
    sub: loc('IEEE 1149.1'),
    text: loc('用 4–5 根线（TAP）控制芯片内部的测试逻辑和每个 I/O 的边界扫描单元。'),
    explain: [
      loc('TAP 管脚：TCK 时钟、TMS 模式选择、TDI 数据输入、TDO 数据输出、可选的 TRST 复位。'),
      loc('边界扫描单元串在每个 I/O 后面，可以直接设定每个输出的电平、关断它，或者读取每个输入。'),
      loc('对 DC 测试很有用：不用写复杂的预处理向量，通过 JTAG 直接把某个输出设成高、低或高阻，再用 PMU 量。'),
    ],
  },
]

export const DFT_ATE = loc('DFT 也要和测试机配合：Scan 链越多越短，需要的测试机 Scan 通道越多、向量深度越浅；BIST 降低对测试机速度和存储的要求；JTAG 只占很少的管脚，适合低成本测试机和多工位并测。')

export const TERMS: Card[] = [
  { id: 'pat', title: loc('测试向量'), sub: loc('Test pattern'), text: loc('一拍一行：每个管脚这一拍驱动什么、期望什么。') },
  { id: 'fmt', title: loc('信号格式'), sub: loc('Signal format'), text: loc('输入的 0 和 1 在一个周期里具体画成什么波形。') },
  { id: 'strobe', title: loc('Strobe'), sub: loc('比较时刻'), text: loc('在周期里的哪个时刻（或哪段时间）去比较输出。') },
  { id: 'sample', title: loc('采样时刻'), sub: loc('Sample time'), text: loc('比较器真正读输出电平的那一瞬间，由 Strobe 边沿决定。') },
  { id: 'mask', title: loc('Mask'), sub: loc('X / 不比较'), text: loc('这一拍这个输出不比较，比如上电后还不确定的状态。') },
  { id: 'cycle', title: loc('测试周期'), sub: loc('Test cycle = 1 / f'), text: loc('一拍的长度。10 MHz 对应 100 ns。周期的起点叫 T0，所有边沿都从 T0 算起。') },
]

export type Fmt = 'NRZ' | 'DNRZ' | 'RZ' | 'RO' | 'SBC' | 'ZD'

export const FORMATS: Array<{ id: Fmt; name: LText; text: LText }> = [
  { id: 'NRZ', name: loc('NRZ 不归零'), text: loc('数据在 T0 变化，整个周期保持。数据不变就没有边沿。最简单，常用于地址、数据。') },
  { id: 'DNRZ', name: loc('DNRZ 延迟不归零'), text: loc('和 NRZ 一样整周期保持，只是变化时刻从 T0 推迟到边沿 1。用来做 Setup / Hold 相对于时钟的定位。') },
  { id: 'RZ', name: loc('RZ 归零'), text: loc('数据为 1 时在边沿 1 到边沿 2 之间出一个高脉冲，其余时间为 0。数据为 0 就一直是 0。典型用于正脉冲时钟。') },
  { id: 'RO', name: loc('RO 归一'), text: loc('RZ 的反相：平时为 1，数据为 0 时在边沿 1 到边沿 2 之间出一个低脉冲。用于低有效的时钟或选通。') },
  { id: 'SBC', name: loc('SBC 补码包围'), text: loc('边沿 1 之前和边沿 2 之后输出数据的反码，中间才是数据。每一拍都有两个边沿，Setup 和 Hold 一次都考到。') },
  { id: 'ZD', name: loc('Z 窗口驱动'), text: loc('只在边沿 1 到边沿 2 之间驱动数据，其余时间驱动器关断（高阻）。用于双向管脚：不驱动时把总线让出来。') },
]

export type Level = 0 | 1 | 'z'
export type Seg = { x0: number; x1: number; level: Level }

/** 把一串数据按格式展开成电平段（时间单位 ns） */
export function formatSegments(fmt: Fmt, bits: number[], period: number, t1: number, t2: number): Seg[] {
  const segs: Seg[] = []
  bits.forEach((bit, i) => {
    const d = (bit ? 1 : 0) as 0 | 1
    const nd = (bit ? 0 : 1) as 0 | 1
    const prev = (i === 0 ? 0 : bits[i - 1] ? 1 : 0) as 0 | 1
    const t0 = i * period
    const push = (a: number, b: number, level: Level) => {
      if (b > a) segs.push({ x0: t0 + a, x1: t0 + b, level })
    }
    if (fmt === 'NRZ') push(0, period, d)
    if (fmt === 'DNRZ') {
      push(0, t1, prev)
      push(t1, period, d)
    }
    if (fmt === 'RZ') {
      push(0, t1, 0)
      push(t1, t2, d)
      push(t2, period, 0)
    }
    if (fmt === 'RO') {
      push(0, t1, 1)
      push(t1, t2, d)
      push(t2, period, 1)
    }
    if (fmt === 'SBC') {
      push(0, t1, nd)
      push(t1, t2, d)
      push(t2, period, nd)
    }
    if (fmt === 'ZD') {
      push(0, t1, 'z')
      push(t1, t2, d)
      push(t2, period, 'z')
    }
  })
  return segs
}

export const CHARS: Array<{ ch: string; kind: LText; text: LText }> = [
  { ch: '0', kind: loc('驱动'), text: loc('输入驱动为逻辑 0（按信号格式和 VIL 画出来）') },
  { ch: '1', kind: loc('驱动'), text: loc('输入驱动为逻辑 1（按信号格式和 VIH）') },
  { ch: 'L', kind: loc('比较'), text: loc('期望输出低：Strobe 时电压 ≤ VOL') },
  { ch: 'H', kind: loc('比较'), text: loc('期望输出高：Strobe 时电压 ≥ VOH') },
  { ch: 'Z', kind: loc('比较'), text: loc('期望高阻：负载把引脚拉到 VREF，电压落在 VOL 与 VOH 之间') },
  { ch: 'X', kind: loc('屏蔽'), text: loc('不驱动也不比较（Mask）') },
]

export const TIMESET = loc('Time Set（时间集）：一组“周期 + 每个管脚的格式和边沿 + Strobe 位置”的组合。向量的每一行都指定用哪个 Time Set，比如初始化用慢的、正式测试用快的。')

export const EXEC_STEPS: LText[] = [
  loc('设电源：VDD（先 VDDmin，再 VDDmax 各跑一遍）。'),
  loc('设输入电平：VIL / VIH。'),
  loc('设输出比较电平：VOL / VOH。'),
  loc('设负载：IOL / IOH 和切换电压 VREF（要测高阻时必须有负载）。'),
  loc('设时序：周期、每个输入的边沿 1 / 边沿 2、每个输出的 Strobe。'),
  loc('设信号格式：每个输入用 NRZ、RZ、SBC……'),
  loc('指定向量的起止地址，选择 Time Set。'),
  loc('运行，读结果：全对 Pass；有 Fail 时记录失败的向量号和管脚。'),
]

export const WORST = loc('最坏情况测试：所有输入的时序同时放在规格极限上，一次跑完，Pass 就代表全部参数都满足——快，但 Fail 了不知道是哪个参数。单项测试：一次只把一个参数推到极限，其他放松——慢，但能定位。量产多用前者，表征和 Debug 用后者。')

export const RELAX = loc('放松（Relaxed）参数：不是本次要考的参数，就给宽松的值，避免它先挂掉干扰判断。比如测 VIH 时用慢周期，测时序时用标准电平。')

export const GROSS = loc('粗功能（Gross functional）：用最宽松的条件跑一遍——慢周期（如 500 ns）、全部 NRZ、放松的电平和时序。只问“基本逻辑活着吗”，放在开短路之后、DC 之前。它同时把整套向量（包括 DC 测试要用的预处理向量）都验证一遍，后面的测试才能放心使用；量产中它的结果也是很有用的良率信息。')

export const EQUATION = loc('基于公式的时序（Equation based timing）：所有边沿都写成“规格值 × SCALE”这样的公式。改一个变量，整套时序就按比例一起收紧或放松，边沿之间的相对位置保持不变——粗功能用慢时序、全速测试用规格时序、不同速度等级的芯片，都只需改这一个数。调试时也最方便。')

export const INVERTER_PROGRAM = loc(`// 时钟反相器：10 MHz 功能测试
SET VDD        = 4.75 V          // 先 VDDmin
SET VIL / VIH  = 0.8 V / 2.0 V
SET VOL / VOH  = 0.4 V / 2.4 V
SET LOAD       IOL = 8 mA, IOH = -5.2 mA, VREF = 1.5 V
TIMESET TS1:
  PERIOD   100 ns
  CLK      RZ   edge1 = 25 ns, edge2 = 75 ns
  DATA     SBC  edge1 = 10 ns, edge2 = 30 ns
  OUT      STROBE at 83 ns
RUN PATTERN inv_func  START 0  STOP 15  TIMESET TS1
IF FAIL -> BIN 5
SET VDD = 5.25 V                 // 再 VDDmax
RUN PATTERN inv_func ...`)

export const WALK_LEAD = loc('功能化的开短路：不用 PMU 逐脚量，而用向量一次扫完。每一拍只有一个管脚设为“Z 比较”，其余全部驱动 0。负载从 VREF = 3 V 往这个管脚灌 400 µA。')

export const WALK_POINTS: LText[] = [
  loc('正常：电流流进对 VDD 的保护二极管（VDD 此时为 0 V），引脚约 +0.65 V，落在 VOL = 0.2 V 与 VOH = 1.5 V 之间 → 判为 Z → Pass。'),
  loc('开路：没有电流通路，负载把引脚拉到 VREF = 3 V，高于 VOH → 读成 H → Fail。'),
  loc('短路：引脚被别的 0 V 管脚或地拉住，低于 VOL → 读成 L → Fail。'),
  loc('Strobe 放得很晚（如 900 ns），给负载对引脚电容充电留足时间。'),
  loc('对 VSS 的二极管：VDD 二极管全部通过就说明没有短路，再加一拍让所有脚同时为 Z、负载改为抽电流，一拍就查完所有对地二极管有没有开路。'),
  loc('优点是快：比 PMU 逐脚量快得多。缺点是 Datalog 只有 Pass / Fail，不如电压读数直观。常见做法：功能化开短路失败时，再跑一次 PMU 串行法，把失败脚的电压记下来。'),
]

export const WALK_PINS = ['A0', 'A1', 'A2', 'A3', 'D0', 'D1']

export const VIH_TEXT: LText[] = [
  loc('功能化的 VIL / VIH：把测试机的驱动低电平设为 VIL（0.8 V）、高电平设为 VIH（2.2 V），跑功能向量。全对就证明芯片在规格门槛上能正确识别 0 和 1。'),
  loc('VDDmin 和 VDDmax 各跑一次：输入门槛会随电源电压移动。'),
  loc('Fail 时：先确认不是噪声——大量输出同时翻转会让地弹起，芯片看到的输入电平被抬高或压低。把电平往松的方向扫，找到实际门槛，和规格比差多少。'),
]

export const LOAD_LEAD = loc('功能测试时输出要带负载，否则 VOL / VOH 是在空载下比的，太容易过。测试机的动态负载等效为：一个参考电压 VREF，经过电阻（或可编程电流源）接到输出脚。')

export const OPEN_DRAIN = loc('开漏（Open drain）输出只能拉低，不能拉高：输出为 1 时其实是高阻。测试时期望写 L 和 Z，并且必须有上拉负载，否则“高”是浮空的。开源（Open source）反过来，只能拉高。')

export const TAKEAWAY: LText[] = [
  loc('量产功能测试是找制造缺陷，不是找设计 Bug；故障覆盖率衡量向量好不好。'),
  loc('DFT 让内部可控、可观：Ad-hoc、Scan、BIST、JTAG。'),
  loc('同一个“1”，换个信号格式就是不同的波形；格式决定了哪些边沿被考到。'),
  loc('边沿 Strobe 只看一瞬；窗口 Strobe 要求整段稳定，能抓毛刺。'),
  loc('高阻要靠负载把引脚拉到 VREF，再用 VOL / VOH 之间判 Z。'),
  loc('8 步执行：电源、输入电平、比较电平、负载、时序、格式、向量范围、运行。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('5 拍数据 1 1 1 1 1，用 NRZ 格式，一共有几个边沿？'),
    options: [
      { id: 'a', text: loc('1 个：只在第一拍从 0 变 1') },
      { id: 'b', text: loc('10 个') },
      { id: 'c', text: loc('5 个') },
    ],
    answer: 'a',
    explain: loc('NRZ 数据不变就不翻转。换成 RZ 就是 5 个正脉冲、10 个边沿。'),
  },
  {
    id: 'q3',
    prompt: loc('输出在 Strobe 前后有一个很窄的毛刺，哪种 Strobe 能抓到？'),
    options: [
      { id: 'a', text: loc('窗口 Strobe（毛刺落在窗口内时）') },
      { id: 'b', text: loc('边沿 Strobe 一定能抓到') },
      { id: 'c', text: loc('都抓不到') },
    ],
    answer: 'a',
    explain: loc('边沿 Strobe 只看一个时刻，毛刺不正好在那一刻就看不见。'),
  },
  {
    id: 'q4',
    prompt: loc('期望 Z 时，测试机怎么判断引脚是高阻？'),
    options: [
      { id: 'a', text: loc('负载把引脚拉到 VREF，电压在 VOL 和 VOH 之间') },
      { id: 'b', text: loc('电压为 0') },
      { id: 'c', text: loc('电流为 0') },
    ],
    answer: 'a',
    explain: loc('没有负载时高阻脚是浮空的，读数不确定，所以一定要设 VREF。'),
  },
  {
    id: 'q5',
    prompt: loc('Walking-Z 开短路测试中，某脚读成 H，说明？'),
    options: [
      { id: 'a', text: loc('开路：被负载拉到了 VREF = 3 V') },
      { id: 'b', text: loc('短路') },
      { id: 'c', text: loc('正常') },
    ],
    answer: 'a',
    explain: loc('正常应读到约 0.65 V（Z），短路读到 L。'),
  },
  {
    id: 'q6',
    prompt: loc('JTAG 边界扫描对 DC 测试有什么帮助？'),
    options: [
      { id: 'a', text: loc('不写复杂预处理向量，直接把输出设成高、低或高阻') },
      { id: 'b', text: loc('让 PMU 更准') },
      { id: 'c', text: loc('没有帮助') },
    ],
    answer: 'a',
    explain: loc('边界扫描单元可以直接控制每个 I/O 的状态。'),
  },
  {
    id: 'b1',
    prompt: loc('规格写 VDD = 5.0 V ± 10%，VDDmin 是多少？'),
    options: [
      { id: 'a', text: loc('4.75 V') },
      { id: 'b', text: loc('4.5 V') },
      { id: 'c', text: loc('4.9 V') },
      { id: 'd', text: loc('5.5 V') },
    ],
    answer: 'b',
    explain: loc('5.0 × (1 − 10%) = 4.5 V；VDDmax = 5.5 V。4.75 V 是 ± 5% 的下限。'),
  },
  {
    id: 'b2',
    prompt: loc('规格写 VDD = 5.0 V ± 5%，功能测试应在哪些电压下跑？'),
    options: [
      { id: 'a', text: loc('5.00 V') },
      { id: 'b', text: loc('4.75 V 和 5.52 V') },
      { id: 'c', text: loc('4.50 V 和 5.50 V') },
      { id: 'd', text: loc('4.57 V 和 5.25 V') },
      { id: 'e', text: loc('以上都不对') },
    ],
    answer: 'e',
    explain: loc('正确答案是 4.75 V 和 5.25 V，各跑一遍：功能必须在整个电压范围内成立，只跑 5.00 V 不够。B 和 D 各写错了一个数（5.52、4.57），C 是 ± 10% 的范围，所以选“以上都不对”。'),
  },
  {
    id: 'b3',
    prompt: loc('AC 输出负载的作用，是模拟输出在实际系统里接到一个或多个器件输入时的环境。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('规格书常要求 AC 测试时输出接一个电阻 / 二极管 / 电容网络，用来模拟芯片装进最终产品（电脑、手机）后，输出要驱动的那些电路。时序参数要在这种负载下测才有意义。'),
  },
  {
    id: 'b4',
    prompt: loc('VIL / VIH 规格靠什么测试来验证？'),
    options: [
      { id: 'a', text: loc('DC 测试') },
      { id: 'b', text: loc('功能测试') },
      { id: 'c', text: loc('AC 时序测试') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('虽然 VIL / VIH 列在 DC 特性表里，但没法用 PMU 量出来。做法是把驱动电平设成 VIL / VIH 跑功能向量，全对就说明芯片在规格门槛上能正确识别 0 和 1。VDDmin、VDDmax 各跑一次。'),
  },
  {
    id: 'b5',
    prompt: loc('VIL / VIH 测试失败时，失败 Datalog 上显示的失败管脚是？'),
    options: [
      { id: 'a', text: loc('输入脚') },
      { id: 'b', text: loc('输出脚') },
      { id: 'c', text: loc('电源脚') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('功能测试只比较输出。某个输入把 1 认成了 0，芯片的逻辑就走错，表现为某些输出的值不对。所以 Datalog 上失败的是输出脚，要找是哪个输入的问题，得逐脚放松电平去排查。'),
  },
  {
    id: 'b6',
    prompt: loc('VIH 设为 2.0 V 时测试失败。调试时怎样改电压能让测试通过？'),
    options: [
      { id: 'a', text: loc('把 VIH 降低 0.4 V') },
      { id: 'b', text: loc('把 VIH 提高到 VDD') },
      { id: 'c', text: loc('把 VDD 提高 0.4 V') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('放松 VIH 是把它往上提，VDD 是最松的 VIH；放松 VIL 是往下降，0 V 最松。芯片已经过了粗功能，放松后应该能通过，以此确认问题出在输入门槛上。降低 VIH 只会更难过；改 VDD 改的是工作条件，不是输入电平。注意：这是调试手段，芯片在规格值上仍然算失败。'),
  },
  {
    id: 'b7',
    prompt: loc('功能化测 VOL/IOL、VOH/IOH：比较器设为规格的 VOL / VOH，动态（或电阻）负载提供 IOL / IOH。测试通过，就说明这四个参数都满足规格。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('负载让输出在跑向量时真的吸 / 吐 IOL、IOH，比较器同时检查电压不越过 VOL / VOH。两者同时成立，四个参数就都被验证了，而且比 PMU 逐脚量快得多。'),
  },
  {
    id: 'b8',
    prompt: loc('调试时功能化 VOL/IOL、VOH/IOH 测试失败，可能需要加长测试周期（降低频率）再跑，来确认 VOL、VOH 本身是否正常。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('输出带满负载时翻转变慢；很多输出同时带大电流翻转还会产生噪声。降低频率、把 Strobe 往后挪，给输出足够时间稳定，就能区分“电平不够”和“来不及”。也可以分批给少量管脚加负载。'),
  },
  {
    id: 'b9',
    prompt: loc('功能化测高阻（Z）时，要用负载把引脚拉到一个中间电平，让比较器判断。合适的中间电平是？（VOL = 0.4 V，VOH = 2.4 V）'),
    options: [
      { id: 'a', text: loc('5.0 V') },
      { id: 'b', text: loc('2.0 V') },
      { id: 'c', text: loc('3.0 V') },
      { id: 'd', text: loc('0.4 V') },
      { id: 'e', text: loc('以上都对') },
    ],
    answer: 'b',
    explain: loc('高阻的判据是电压在 VOL 和 VOH 之间，所以 VREF 必须落在 0.4–2.4 V 中间，常用 1.5 V 或 2.0 V。5.0 V、3.0 V 高于 VOH 会被判成 H；0.4 V 等于 VOL 会被判成 L。'),
  },
  {
    id: 'b10',
    prompt: loc('做粗功能测试（Gross functional）的目的是？'),
    options: [
      { id: 'a', text: loc('在最严的条件下证明芯片满足全部规格') },
      { id: 'b', text: loc('用放松的条件确认芯片功能“活着”，并验证整套向量（包括预处理向量）能正确运行') },
      { id: 'c', text: loc('测出芯片的最高频率') },
      { id: 'd', text: loc('代替开短路测试') },
    ],
    answer: 'b',
    explain: loc('粗功能放松频率、时序、电平和负载，给芯片最好的机会通过。它放在 DC 之前，确认后面 DC 测试要用的预处理向量都能跑对；量产中它也提供有用的良率信息。'),
  },
  {
    id: 'b11',
    prompt: loc('基于公式的时序（Equation based timing）有什么好处？'),
    options: [
      { id: 'a', text: loc('改一个变量（如 SCALE），整套时序按比例收紧或放松，边沿相对位置不变') },
      { id: 'b', text: loc('让测试机跑得更快') },
      { id: 'c', text: loc('不需要看规格书') },
      { id: 'd', text: loc('能自动修正芯片的时序错误') },
    ],
    answer: 'a',
    explain: loc('把每个边沿写成“规格值 × SCALE”。SCALE = 1 就是规格时序；调大就是粗功能的慢时序。不同测试、不同速度等级只需改一个数，调试也方便。'),
  },
  {
    id: 'b12',
    prompt: loc('开漏（Open drain）输出不能做什么？（选最完整的答案）'),
    options: [
      { id: 'a', text: loc('驱动逻辑 0') },
      { id: 'b', text: loc('驱动逻辑 1') },
      { id: 'c', text: loc('向外提供电流（Source）') },
      { id: 'd', text: loc('B 和 C') },
    ],
    answer: 'd',
    explain: loc('开漏输出内部没有上拉管，只能拉低、只能吸电流。它既不能自己驱动出 1，也不能往外供电流；高电平必须靠外部上拉电阻或动态负载。'),
  },
  {
    id: 'b13',
    prompt: loc('“输入控制信号是 RO 格式”，RO 是什么意思？'),
    options: [
      { id: 'a', text: loc('Return to One（归一）：平时为 1，数据为 0 时在边沿 1 到边沿 2 之间出一个低脉冲') },
      { id: 'b', text: loc('Read Only：只读') },
      { id: 'c', text: loc('Return to Zero：数据为 1 时出一个高脉冲') },
      { id: 'd', text: loc('数据只在 T0 变化') },
    ],
    answer: 'a',
    explain: loc('RO = Return to One。数据为 1 时整拍保持 1，没有脉冲；数据为 0 时出一个负脉冲。适合低有效的控制信号，例如 OE、CS1。C 是 RZ，D 是 NRZ。'),
  },
  {
    id: 'b14',
    prompt: loc('要一次跑向量就同时保证 Setup 和 Hold 时间，必须用哪种信号格式？'),
    options: [
      { id: 'a', text: loc('NRZ') },
      { id: 'b', text: loc('RZ') },
      { id: 'c', text: loc('SBC（补码包围）') },
      { id: 'd', text: loc('DNRZ') },
    ],
    answer: 'c',
    explain: loc('SBC 在数据前后都是数据的反码：边沿 1 前是反码（考 Setup），边沿 2 后又回到反码（考 Hold）。不管数据是 0 还是 1，每拍都有翻转，所以它是唯一能一次同时保证两者的格式。不支持 SBC 的测试机，可以用 RZ 跑一遍（考数据为 1 的拍）、RO 再跑一遍（考数据为 0 的拍）。'),
  },
  {
    id: 'b15',
    prompt: loc('数据只在 T0 变化的信号格式叫什么？'),
    options: [
      { id: 'a', text: loc('DNRZ') },
      { id: 'b', text: loc('RZ') },
      { id: 'c', text: loc('RO') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'd',
    explain: loc('答案是 NRZ（不归零）：数据在周期起点 T0 变化，整拍保持。DNRZ 是把变化时刻推迟到 T0 之后的某个边沿；RZ、RO 是脉冲格式。'),
  },
  {
    id: 'b16',
    prompt: loc('SBC（XOR）格式下，数据为 0 时这一拍的波形是？'),
    options: [
      { id: 'a', text: loc('整拍为 0') },
      { id: 'b', text: loc('T0 到边沿 1 为 1，边沿 1 到边沿 2 为 0，边沿 2 到周期结束为 1') },
      { id: 'c', text: loc('T0 到边沿 1 为 0，边沿 1 到边沿 2 为 1，之后为 0') },
      { id: 'd', text: loc('整拍为高阻') },
    ],
    answer: 'b',
    explain: loc('SBC：周期开始先输出数据的反码（1），等到边沿 1 才给出真正的数据（0），边沿 2 之后又回到反码（1）。形状就是一个低脉冲。C 是数据为 1 时的 SBC 波形。可以在上面“信号格式”区块选 SBC、把某一位设成 0 看看。'),
  },
  {
    id: 'b17',
    prompt: loc('哪种信号格式在高阻和驱动之间切换（控制驱动器的开关）？'),
    options: [
      { id: 'a', text: loc('ZD（Z 窗口驱动，也叫 Drive / Inhibit）') },
      { id: 'b', text: loc('NRZ') },
      { id: 'c', text: loc('SBC') },
      { id: 'd', text: loc('RO') },
    ],
    answer: 'a',
    explain: loc('ZD 只在边沿 1 到边沿 2 之间打开驱动器、驱动数据，其余时间驱动器关断，测试机通道呈高阻。用于双向管脚：不驱动时把总线让给芯片。'),
  },
  {
    id: 'b18',
    prompt: loc('已知工作频率，怎么算测试周期？'),
    options: [
      { id: 'a', text: loc('周期 = 1 / 频率') },
      { id: 'b', text: loc('周期 = 频率 × 2') },
      { id: 'c', text: loc('周期 = 1 / (2 × 频率)') },
      { id: 'd', text: loc('周期 = 频率 / 1000') },
    ],
    answer: 'a',
    explain: loc('cycle_time = 1 / frequency。10 MHz → 100 ns；66 MHz → 约 15 ns。'),
  },
  {
    id: 'b19',
    prompt: loc('功能化开短路比 DC（PMU）开短路好在哪？'),
    options: [
      { id: 'a', text: loc('速度快得多') },
      { id: 'b', text: loc('Datalog 能看到每只脚的电压') },
      { id: 'c', text: loc('不需要任何负载') },
      { id: 'd', text: loc('能测出电源脚的电流') },
    ],
    answer: 'a',
    explain: loc('功能化方法用向量逐拍扫过所有管脚，比 PMU 逐脚强加电流、等稳定、再量电压快得多。代价是 Datalog 只有 Pass / Fail，不如电压读数直观，所以常在失败时再补跑一次 PMU 法。'),
  },
  {
    id: 'b20',
    prompt: loc('功能化开短路测试中，电流由什么强加？'),
    options: [
      { id: 'a', text: loc('PMU') },
      { id: 'b', text: loc('可编程（动态）电流负载') },
      { id: 'c', text: loc('强加的是电压，不是电流') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('被测脚的驱动器关断后，动态电流负载从 VREF = 3 V 往引脚灌约 400 µA，让对 VDD 的保护二极管正偏。PMU 不参与，这也是它快的原因。'),
  },
  {
    id: 'b21',
    prompt: loc('功能化开短路测试用 Pin Electronics 里的比较器来判断开路 / 短路。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('比较器设成中间带（Z 模式）：VOL = 0.2 V、VOH = 1.5 V。正常二极管约 0.65 V，落在中间判 Pass；短路约 0 V 低于 VOL，开路被拉到 3 V 高于 VOH，都判 Fail。'),
  },
]
