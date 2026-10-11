import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------------- 1. 同步时序电路为什么难测 ---------------- */

export const WHY_LEAD: LText[] = [
  loc('Scan 测试的目的：缩短测试开发时间和测试时间。它要求设计时就在芯片里加专门的测试电路（Scan 设计）。思路是“分而治之”。', 'The purpose of scan testing is to cut test development time and test time. It requires dedicated test circuitry to be added to the chip at design time (scan design). The idea is "divide and conquer".'),
  loc('看一个通用的同步时序电路模型：一块组合逻辑，加一排存储元件 M1、M2 … Mn，由系统时钟控制。组合逻辑的输入有两类：芯片的主输入（PI），和从存储元件反馈回来的“次态变量”。主输出（PO）由主输入和存储元件的当前状态共同决定。', 'Consider a general model of a synchronous sequential circuit: a block of combinational logic plus a row of storage elements M1, M2 ... Mn controlled by the system clock. The combinational logic has two kinds of inputs: the primary inputs (PI) of the chip, and the "secondary variables" fed back from the storage elements. The primary outputs (PO) depend on both the primary inputs and the present state of the storage elements.'),
  loc('麻烦在于：存储元件的下一个状态，既取决于主输入，又取决于它自己当前的状态。测试只能直接控制主输入、直接观察主输出。两块电路互相依赖，哪一块都不能直接控制、直接观察——先测哪块？', 'The trouble: the next state of the storage elements depends both on the primary inputs and on their own present state. A test can directly control only the primary inputs and directly observe only the primary outputs. The two blocks depend on each other, and neither can be directly controlled or observed. Which do you test first?'),
]

/* ---------------- 2. 加入 Scan 路径 ---------------- */

export const PATH_LEAD: LText[] = [
  loc('Scan 设计的办法：在每个存储元件前面加一个二选一开关（多路选择器），所有开关由同一个 Scan Select 信号控制。', 'The scan design approach: add a two-way switch (multiplexer) in front of each storage element, with all switches controlled by a single Scan Select signal.'),
  loc('Scan Select 关：开关把组合逻辑的输出接到存储元件，电路照常工作（正常模式）。Scan Select 开：存储元件被串成一条与外界隔离的串入串出移位寄存器，入口叫 Scan Data In，出口叫 Scan Data Out。', 'Scan Select off: the switches connect the combinational logic outputs to the storage elements, and the circuit works as usual (normal mode). Scan Select on: the storage elements are chained into an isolated serial-in, serial-out shift register, with input Scan Data In and output Scan Data Out.'),
  loc('在 Scan 模式下，只要把想要的值按顺序放在 Scan Data In 上，用系统时钟一位一位移进去，就能把所有存储元件预置成任意值。', 'In scan mode, simply place the desired values on Scan Data In in order and shift them in one bit per system clock, and every storage element can be preset to any value.'),
]

export const ABILITIES: Card[] = [
  {
    id: 'iso',
    title: loc('存储元件可以单独测', 'Storage elements can be tested alone'),
    text: loc('串成移位寄存器后，存储元件和组合逻辑隔离开，可以用 Flush、Shift 这类标准测试单独检查每一个触发器。', 'Once chained into a shift register, the storage elements are isolated from the combinational logic, and each flip-flop can be checked on its own with standard tests such as flush and shift.'),
  },
  {
    id: 'set',
    title: loc('次态可以任意设', 'Secondary variables can be set freely'),
    text: loc('次态变量可以直接移进任意值，不再受当前状态的限制——组合逻辑的这一半输入变得完全可控。', 'Any value can be shifted directly into the secondary variables, no longer limited by the present state. This half of the combinational logic inputs becomes fully controllable.'),
  },
  {
    id: 'obs',
    title: loc('组合逻辑的输出可以直接看', 'Combinational outputs become observable'),
    text: loc('组合逻辑送往存储元件的输出，先在正常模式下打一拍存进触发器，再移出来看——这一半输出变得完全可观察。', 'The combinational logic outputs that feed the storage elements are first captured into the flip-flops with one clock in normal mode, then shifted out. This half of the outputs becomes fully observable.'),
  },
]

export const MODE_TEXT = {
  none: loc('原始电路：存储元件的输入来自组合逻辑，输出又反馈回组合逻辑。测试机碰不到中间这些信号。', 'Original circuit: the storage element inputs come from the combinational logic, and their outputs feed back into it. The tester cannot reach these internal signals.'),
  normal: loc('Scan Select 关（正常模式）：二选一开关选组合逻辑的输出，电路照常工作。', 'Scan Select off (normal mode): the two-way switch selects the combinational logic output, and the circuit works as usual.'),
  scan: loc('Scan Select 开（Scan 模式）：二选一开关选上一个存储元件的输出，所有存储元件串成一条移位寄存器，从 Scan Data In 进、Scan Data Out 出。', 'Scan Select on (scan mode): the two-way switch selects the previous storage element\'s output, chaining all storage elements into one shift register, in at Scan Data In and out at Scan Data Out.'),
}

/* ---------------- 3. Flush / Shift 测试 ---------------- */

export const CHAIN_N = 8
export const CHAIN_CLOCKS = 16

export type ChainTest = 'flush1' | 'flush0' | 'shift'
export type Bit = 0 | 1

export const CHAIN_TEXT: Record<ChainTest, LText> = {
  flush1: loc('Flush 1：所有存储元件先初始化成 0，再从 Scan Data In 送进一个 1，用系统时钟把它一路推到 Scan Data Out。', 'Flush 1: initialize all storage elements to 0, then feed a single 1 in at Scan Data In and clock it all the way to Scan Data Out.'),
  flush0: loc('Flush 0：反过来，在全 1 的背景里推一个 0 过去。两次 Flush 合起来，检查了每个存储元件能不能进入两种逻辑状态。', 'Flush 0: the reverse, pushing a single 0 through an all-1 background. Together, the two flush tests check that every storage element can enter both logic states.'),
  shift: loc('Shift：把 00110011… 移过整条链。每个存储元件都会经历 0→0、0→1、1→1、1→0 四种“当前态 → 下一态”组合。', 'Shift: shift 00110011... through the whole chain. Every storage element goes through all four "present → next state" combinations: 0→0, 0→1, 1→1, 1→0.'),
}

export const CHAIN_INIT_NOTE = loc('这里假设先用复位把链初始化成背景值。', 'Here we assume the chain is first initialized to the background value by a reset.')

function sdiAt(test: ChainTest, c: number): Bit {
  if (test === 'flush1') return c === 0 ? 1 : 0
  if (test === 'flush0') return c === 0 ? 0 : 1
  return (c % 4 < 2 ? 0 : 1) as Bit
}

export function sdiSeq(test: ChainTest): Bit[] {
  return Array.from({ length: CHAIN_CLOCKS }, (_, c) => sdiAt(test, c))
}

export type StuckFault = { k: number; v: Bit } | null

/** 返回第 0..CHAIN_CLOCKS 拍之后链上各触发器的值 */
export function chainStates(test: ChainTest, fault: StuckFault): Bit[][] {
  const bg: Bit = test === 'flush0' ? 1 : 0
  const force = (s: Bit[]) => (fault ? s.map((b, i) => (i === fault.k - 1 ? fault.v : b)) : s)
  const states: Bit[][] = [force(Array.from({ length: CHAIN_N }, () => bg))]
  for (let c = 1; c <= CHAIN_CLOCKS; c += 1) {
    const prev = states[c - 1]
    states.push(force([sdiAt(test, c - 1), ...prev.slice(0, CHAIN_N - 1)]))
  }
  return states
}

export const CHAIN_FAULT_TIP = {
  locate: loc('第 {c} 拍就开始不一致，之后一直是 {v}：stuck 的值只走了 {c} 拍就到了出口，说明它离 FF8 只差 {c} 级——是 FF{k} stuck-at-{v}。', 'Mismatches start at clock {c} and stay at {v}: the stuck value reached the output in only {c} clocks, so it is {c} stages from FF8. It is FF{k} stuck-at-{v}.'),
  vague: loc('只在本该出现被推送那一位的地方不一致：链上某个触发器 stuck 在了背景值 {v}，但这个测试看不出是哪一个。换另一种 Flush（背景取反）就能定位。', 'The only mismatch is where the pushed bit should have appeared: some flip-flop on the chain is stuck at the background value {v}, but this test cannot tell which. Use the other flush test (inverted background) to locate it.'),
  shiftVague: loc('输出和期望不一致，说明链坏了。要精确定位，用背景值和 stuck 值相反的那种 Flush 测试。', 'The output does not match the expected values, so the chain is broken. To pinpoint the fault, use the flush test whose background is opposite to the stuck value.'),
  none: loc('输出序列和期望完全一致：链是好的。', 'The output sequence matches the expected values exactly: the chain is good.'),
}

/* ---------------- 4. 完整测试三步 ---------------- */

export type CombFault = 'none' | 'd2sa0' | 'd3sa1' | 'd4sa0' | 'zsa1'

export const COMB_FAULTS: Array<{ id: CombFault; label: LText | string }> = [
  { id: 'none', label: loc('无故障', 'No fault') },
  { id: 'd2sa0', label: 'D2 stuck-at-0' },
  { id: 'd3sa1', label: 'D3 stuck-at-1' },
  { id: 'd4sa0', label: 'D4 stuck-at-0' },
  { id: 'zsa1', label: 'Z stuck-at-1' },
]

export const EQUATIONS = ['D1 = A · Q2', 'D2 = Q1 ⊕ Q3', 'D3 = ¬(Q4 · B)', 'D4 = Q1 + Q2', 'Z = Q3 · Q4']

export type Tri = Bit | null

export function comb(q: Tri[], a: Bit, b: Bit, fault: CombFault): { d: Tri[]; z: Tri } {
  if (q.some((v) => v === null)) return { d: [null, null, null, null], z: null }
  const [q1, q2, q3, q4] = q as Bit[]
  let d: Bit[] = [(a & q2) as Bit, (q1 ^ q3) as Bit, (1 - (q4 & b)) as Bit, (q1 | q2) as Bit]
  let z = (q3 & q4) as Bit
  if (fault === 'd2sa0') d = [d[0], 0, d[2], d[3]]
  if (fault === 'd3sa1') d = [d[0], d[1], 1, d[3]]
  if (fault === 'd4sa0') d = [d[0], d[1], d[2], 0]
  if (fault === 'zsa1') z = 1
  return { d, z }
}

export const PHASES = 11

export type Phase = {
  mode: 'scan' | 'normal'
  q: Tri[]
  sdi: Tri
  sdo: Tri
  /** 主输入是否已加上 */
  pi: boolean
}

/** 0 = 初始；1–4 移入；5 加主输入；6 正常模式打一拍；7–10 移出 */
export function scanPhases(vec: Bit[], fault: CombFault, a: Bit, b: Bit): Phase[] {
  const out: Phase[] = [{ mode: 'scan', q: [null, null, null, null], sdi: null, sdo: null, pi: false }]
  let q: Tri[] = [null, null, null, null]
  for (let p = 1; p <= 4; p += 1) {
    const bit = vec[4 - p]
    const sdo = q[3]
    q = [bit, q[0], q[1], q[2]]
    out.push({ mode: 'scan', q, sdi: bit, sdo, pi: false })
  }
  out.push({ mode: 'scan', q, sdi: null, sdo: null, pi: true })
  q = comb(q, a, b, fault).d
  out.push({ mode: 'normal', q, sdi: null, sdo: null, pi: true })
  for (let p = 7; p <= 10; p += 1) {
    const sdo = q[3]
    q = [0, q[0], q[1], q[2]]
    out.push({ mode: 'scan', q, sdi: 0, sdo, pi: true })
  }
  return out
}

export const PHASE_TEXT: LText[] = [
  loc('开始：触发器里是什么不知道（X）。', 'Start: the flip-flop contents are unknown (X).'),
  loc('Scan 模式，第 1 拍：Q4 要的值先送进去。', 'Scan mode, clock 1: the value for Q4 goes in first.'),
  loc('Scan 模式，第 2 拍。', 'Scan mode, clock 2.'),
  loc('Scan 模式，第 3 拍。', 'Scan mode, clock 3.'),
  loc('Scan 模式，第 4 拍：激励全部就位，Q1–Q4 = 你设的值。', 'Scan mode, clock 4: all stimulus is in place; Q1–Q4 = the values you set.'),
  loc('加主输入 A、B。组合逻辑稳定下来，主输出 Z 可以直接比较。', 'Apply primary inputs A and B. The combinational logic settles, and primary output Z can be compared directly.'),
  loc('切到正常模式，打一拍系统时钟：组合逻辑的输出 D1–D4 被存进触发器（捕获）。', 'Switch to normal mode and pulse the system clock once: the combinational outputs D1–D4 are stored in the flip-flops (capture).'),
  loc('切回 Scan 模式，移出第 1 位（Q4 的捕获值先出来）。同时可以移入下一组激励。', 'Switch back to scan mode and shift out bit 1 (Q4\'s captured value comes out first). The next stimulus can be shifted in at the same time.'),
  loc('移出第 2 位。', 'Shift out bit 2.'),
  loc('移出第 3 位。', 'Shift out bit 3.'),
  loc('移出第 4 位：和期望响应比较。', 'Shift out bit 4: compare with the expected response.'),
]

export const ATPG_NOTE = loc('组合逻辑的测试向量怎么来？假设所有输入（主输入 + 触发器）完全可控、所有输出（主输出 + 进触发器的线）完全可观察，用 ATPG / 故障仿真工具自动生成。这一步已经研究得很成熟——Scan 把“时序电路测试生成”这个难题，变成了“组合逻辑测试生成”这个已解决的问题。', 'Where do the combinational test vectors come from? Assuming all inputs (primary inputs + flip-flops) are fully controllable and all outputs (primary outputs + lines into the flip-flops) are fully observable, ATPG / fault simulation tools generate them automatically. This is a mature field: scan turns the hard problem of "sequential test generation" into the solved problem of "combinational test generation".')

/* ---------------- 5. LSSD ---------------- */

export const LSSD_LEAD: LText[] = [
  loc('实现 Scan 的设计方法有好几种，最受关注的是 IBM 提出的 LSSD（Level Sensitive Scan Design，电平敏感扫描设计）。', 'There are several design methods for implementing scan; the best known is LSSD (Level Sensitive Scan Design), proposed by IBM.'),
  loc('它的目标是让电路工作不依赖时钟边沿的上升/下降时间这类 AC 参数——这些参数设计时难仿真，生产时难监控。', 'Its goal is to make circuit operation independent of AC parameters such as clock rise/fall times, which are hard to simulate in design and hard to monitor in production.'),
  loc('做法是给两个可以直接控制的时钟：一个管数据进存储元件，另一个管存储元件的输出。两个时钟不重叠，数据在组合逻辑里传播时，前一级的输出不会“抢跑”到下一级——竞争（Race）就被避开了。', 'It uses two directly controllable clocks: one for data entering the storage elements, the other for the storage element outputs. The two clocks do not overlap, so as data propagates through the combinational logic, one stage\'s output cannot "race ahead" into the next. Races are avoided.'),
]

/* ---------------- 6. Scan 测试机 ---------------- */

export const MEM_CARDS: Card[] = [
  {
    id: 'par',
    title: loc('并行向量存储', 'Parallel vector memory'),
    sub: loc('Pin wide', 'Pin wide'),
    text: loc('普通功能测试的向量内存：每个周期给每个管脚一位数据，速度快、很宽。用来存几百万拍、但只有一两个管脚在变的 Scan 数据，非常浪费。', 'Vector memory for ordinary functional tests: one bit per pin per cycle, fast and very wide. Using it for scan data, millions of cycles with only one or two pins changing, is very wasteful.'),
  },
  {
    id: 'ser',
    title: loc('串行（Scan）向量存储', 'Serial (scan) vector memory'),
    sub: loc('通常 2 位宽：SDI + SDO', 'Usually 2 bits wide: SDI + SDO'),
    text: loc('Scan 专用测试机多一块串行内存，通常两位宽（Scan Data In 和 Scan Data Out），可以在程序里配置成不同的深度/宽度比。每个通道都能编程选择用并行还是串行向量。', 'Scan testers add a serial memory, usually two bits wide (Scan Data In and Scan Data Out), which can be configured in the program for different depth/width ratios. Each channel can be programmed to use parallel or serial vectors.'),
  },
]

export const TESTER_LEAD = loc('大规模电路里存储元件很多，一条 Scan 链会非常长。Scan Pattern 是电路状态的串行表示，几百万拍很常见。所以存储元件常被分成多条链，同时移位，测试更简单、更快。', 'Large circuits have many storage elements, so a single scan chain would be very long. A scan pattern is a serial representation of the circuit state, and millions of cycles are common. So the storage elements are often split into several chains that shift simultaneously, making testing simpler and faster.')

export function scanCalc(ffs: number, chains: number, patterns: number, mhz: number) {
  const len = Math.ceil(ffs / chains)
  // 每个 Pattern 移位 len 拍 + 捕获 1 拍；移出和下一组移入重叠，最后再多移出一次
  const cycles = patterns * (len + 1) + len
  const ms = (cycles / (mhz * 1e6)) * 1000
  const len1 = ffs
  const cycles1 = patterns * (len1 + 1) + len1
  const ms1 = (cycles1 / (mhz * 1e6)) * 1000
  return { len, cycles, ms, ms1, bitsPerChain: patterns * len }
}

export const CALC_NOTE = loc('移出上一组响应和移入下一组激励是同时进行的，所以总周期 ≈ Pattern 数 × (链长 + 1 拍捕获) + 最后一次移出。链数翻倍，链长减半，测试时间几乎减半——代价是多占两倍的 Scan 管脚和测试机串行通道。', 'Shifting out the previous response and shifting in the next stimulus happen at the same time, so total cycles ≈ patterns × (chain length + 1 capture clock) + one final shift-out. Doubling the number of chains halves the chain length and nearly halves test time, at the cost of twice as many scan pins and tester serial channels.')

/* ---------------- 收尾 ---------------- */

export const TAKEAWAY: LText[] = [
  loc('时序电路难测，是因为存储元件的状态既不能直接控制，也不能直接观察，还和组合逻辑互相依赖。', 'Sequential circuits are hard to test because the storage element states can be neither directly controlled nor directly observed, and they depend on the combinational logic.'),
  loc('Scan 在每个存储元件前加二选一开关：Scan Select 关是正常模式，开就串成从 SDI 到 SDO 的移位寄存器。', 'Scan adds a two-way switch in front of each storage element: Scan Select off is normal mode; on chains them into a shift register from SDI to SDO.'),
  loc('先用 Flush（推一个 1 / 推一个 0）和 Shift（00110011）测链本身，再测组合逻辑。', 'First test the chain itself with flush (push a 1 / push a 0) and shift (00110011), then test the combinational logic.'),
  loc('测组合逻辑三步：移入激励并加主输入 → 正常模式打一拍捕获 → 移出比较。向量由 ATPG 生成。', 'Three steps to test combinational logic: shift in stimulus and apply primary inputs → capture with one clock in normal mode → shift out and compare. Vectors come from ATPG.'),
  loc('Scan 测试机有串行向量内存；把链拆成多条并行移位，测试时间成倍缩短。', 'Scan testers have serial vector memory; splitting the chain into several that shift in parallel cuts test time several-fold.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('同步时序电路的测试生成为什么难？', 'Why is test generation for synchronous sequential circuits hard?'),
    options: [
      { id: 'a', text: loc('存储元件的下一个状态依赖当前状态，而且既不能直接控制也不能直接观察', 'The next state of the storage elements depends on the present state, and they can be neither directly controlled nor directly observed') },
      { id: 'b', text: loc('组合逻辑门太多', 'There are too many combinational gates') },
      { id: 'c', text: loc('系统时钟太快', 'The system clock is too fast') },
      { id: 'd', text: loc('主输入太少', 'There are too few primary inputs') },
    ],
    answer: 'a',
    explain: loc('反馈让组合逻辑和存储元件互相依赖。测试机只碰得到主输入和主输出，中间的状态要靠很长的向量序列间接“推”出来。', 'Feedback makes the combinational logic and storage elements depend on each other. The tester reaches only the primary inputs and outputs, so internal states must be "pushed" indirectly with long vector sequences.'),
  },
  {
    id: 'q2',
    prompt: loc('Scan Select 打开时，电路变成什么样？', 'What does the circuit become when Scan Select is on?'),
    options: [
      { id: 'a', text: loc('所有存储元件串成一条从 Scan Data In 到 Scan Data Out 的移位寄存器', 'All storage elements form one shift register from Scan Data In to Scan Data Out') },
      { id: 'b', text: loc('组合逻辑被旁路，主输入直接连到主输出', 'The combinational logic is bypassed, connecting primary inputs straight to primary outputs') },
      { id: 'c', text: loc('时钟停止', 'The clock stops') },
    ],
    answer: 'a',
    explain: loc('每个存储元件前的二选一开关改选上一个存储元件的输出，链就形成了。关掉 Scan Select，开关回到组合逻辑输出，电路恢复正常模式。', 'The two-way switch in front of each storage element selects the previous element\'s output, forming the chain. Turn Scan Select off and the switches go back to the combinational outputs, restoring normal mode.'),
  },
  {
    id: 'q3',
    prompt: loc('Flush 1 测试（全 0 背景推一个 1）和 Flush 0 测试合起来检查了什么？', 'What do the Flush 1 test (a 1 pushed through an all-0 background) and the Flush 0 test check together?'),
    options: [
      { id: 'a', text: loc('每个存储元件都能进入 0 和 1 两种逻辑状态', 'Every storage element can enter both logic states, 0 and 1') },
      { id: 'b', text: loc('组合逻辑的所有 stuck-at 故障', 'All stuck-at faults in the combinational logic') },
      { id: 'c', text: loc('链的最高移位频率', 'The maximum shift frequency of the chain') },
    ],
    answer: 'a',
    explain: loc('推送的那一位要经过每一个触发器，每个触发器都得能翻到那个值再翻回背景值。', 'The pushed bit passes through every flip-flop, so each must be able to switch to that value and back to the background value.'),
  },
  {
    id: 'q4',
    prompt: loc('Shift 测试为什么用 00110011… 这样的序列？', 'Why does the shift test use a sequence like 00110011...?'),
    options: [
      { id: 'a', text: loc('让每个存储元件经历 0→0、0→1、1→1、1→0 所有“当前态 → 下一态”组合', 'So every storage element goes through all "present → next state" combinations: 0→0, 0→1, 1→1, 1→0') },
      { id: 'b', text: loc('这样数据最短', 'It gives the shortest data') },
      { id: 'c', text: loc('为了降低功耗', 'To reduce power') },
    ],
    answer: 'a',
    explain: loc('两个 0、两个 1 交替，相邻两拍正好覆盖四种转换。0101 只有翻转，0000 只有保持，都不完整。', 'Alternating pairs of 0s and 1s make adjacent clocks cover all four transitions. 0101 only toggles and 0000 only holds; neither is complete.'),
  },
  {
    id: 'q5',
    prompt: loc('用 Scan 测组合逻辑，一个 Pattern 的正确顺序是？', 'When testing combinational logic with scan, what is the correct order for one pattern?'),
    options: [
      { id: 'a', text: loc('Scan 模式移入激励并加主输入 → 正常模式打一拍捕获 → Scan 模式移出比较', 'Shift in stimulus in scan mode and apply primary inputs → capture with one clock in normal mode → shift out in scan mode and compare') },
      { id: 'b', text: loc('正常模式跑功能向量 → Scan 模式移出', 'Run functional vectors in normal mode → shift out in scan mode') },
      { id: 'c', text: loc('Scan 模式移入 → Scan 模式直接移出比较', 'Shift in in scan mode → shift straight out in scan mode and compare') },
    ],
    answer: 'a',
    explain: loc('移入让组合逻辑的输入完全可控；正常模式那一拍把组合逻辑的输出存进触发器；移出让这些输出完全可观察。主输出在捕获前直接比较。', 'Shifting in makes the combinational inputs fully controllable; the normal-mode clock stores the combinational outputs in the flip-flops; shifting out makes those outputs fully observable. Primary outputs are compared directly before capture.'),
  },
  {
    id: 'q6',
    prompt: loc('20 000 个触发器、1 000 个 Pattern、移位 50 MHz。从 1 条链改成 10 条链，测试时间大约？', '20 000 flip-flops, 1 000 patterns, shifting at 50 MHz. Going from 1 chain to 10 chains, test time is roughly?'),
    options: [
      { id: 'a', text: loc('从约 400 ms 降到约 40 ms', 'From about 400 ms down to about 40 ms') },
      { id: 'b', text: loc('不变，总位数一样', 'Unchanged; the total number of bits is the same') },
      { id: 'c', text: loc('变长，因为链多了', 'Longer, because there are more chains') },
    ],
    answer: 'a',
    explain: loc('1 条链：1000 × 20 001 + 20 000 ≈ 2 千万拍 ÷ 50 MHz ≈ 400 ms。10 条链同时移位，每条 2 000 位：约 200 万拍 ≈ 40 ms。', '1 chain: 1000 × 20 001 + 20 000 ≈ 20 million clocks ÷ 50 MHz ≈ 400 ms. With 10 chains shifting together, 2 000 bits each: about 2 million clocks ≈ 40 ms.'),
  },
]
