import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card, type Text } from '../parts'

/* ---------- 1. 表征是什么 ---------- */

export const WHAT: Card[] = [
  {
    id: 'limit',
    title: loc('找极限', 'Find the limits'),
    sub: loc('不是判过不过，而是量到哪', 'Not pass or fail, but how far'),
    text: loc('表征（Characterization）要回答：这颗芯片到底能工作到哪里？最低多少伏、最快多少 ns、输入门限在哪。', 'Characterization answers: how far can this chip really go? The lowest voltage, the fastest time in ns, where the input thresholds are.'),
    explain: [
      loc('量产测试只关心“满不满足规格”；表征要把真实边界找出来，看离规格还有多少余量。', 'Production test only asks "does it meet spec?"; characterization finds the real boundary and shows how much margin there is to the spec.'),
      loc('常用工具：二分搜索、线性搜索、Shmoo 图。电压、电流、时序参数都可以表征。', 'Common tools: binary search, linear search, shmoo plots. Voltage, current and timing parameters can all be characterized.'),
    ],
  },
  {
    id: 'pf',
    title: loc('两端都要有 Pass / Fail', 'Pass at one end, Fail at the other'),
    sub: loc('先包住边界，再搜', 'Bracket the boundary, then search'),
    text: loc('能搜的前提：参数在范围一端必须 Pass，另一端必须 Fail。例如 VIL = 0 V 跑功能向量 Pass，VIL = 2 V 跑 Fail。', 'A search requires the parameter to Pass at one end of the range and Fail at the other. For example, functional vectors Pass at VIL = 0 V and Fail at VIL = 2 V.'),
    explain: [
      loc('有了一个已知 Pass 点和一个已知 Fail 点，边界一定夹在中间，才能用搜索把它逼出来。', 'With one known Pass point and one known Fail point, the boundary must lie between them, so a search can close in on it.'),
      loc('如果两端都 Pass 或都 Fail，说明范围没包住边界，搜出来的数没有意义。', 'If both ends Pass or both Fail, the range does not bracket the boundary and the search result is meaningless.'),
    ],
  },
  {
    id: 'vec',
    title: loc('常要专用向量', 'Often needs dedicated vectors'),
    sub: loc('功能向量不一定够用', 'Functional vectors may not be enough'),
    text: loc('表征要让芯片做“能暴露极限”的动作。很多时候要专门为某一个功能写一组向量。', 'Characterization must make the chip do things that expose its limits. Often a vector set has to be written just for one function.'),
    explain: [
      loc('量产功能向量的目的和表征不一样，不一定能把某个参数单独推到极限。', 'Production functional vectors serve a different purpose and may not push a single parameter to its limit.'),
      loc('用之前必须先弄懂这组向量在干什么——尤其是 AC 参数表征：搜的那条边沿，向量里必须真的在比较对应的那次跳变。', 'Understand what the vectors do before using them, especially for AC characterization: for the edge being searched, the vectors must actually compare the corresponding transition.'),
    ],
  },
]

/** 端点检查：芯片真实 VIL 门限（V） */
export const CHECK_TRUTH = 1.34

export const CHECK_RANGES: Array<{ id: string; lo: number; hi: number }> = [
  { id: 'good', lo: 0, hi: 2.0 },
  { id: 'low', lo: 0, hi: 1.0 },
  { id: 'high', lo: 1.6, hi: 2.0 },
]

/* ---------- 2. 二分 vs 线性 ---------- */

export const RACE_MAX = 2.0

export const RES_OPTIONS = [50, 20, 10] as const
export type ResMv = (typeof RES_OPTIONS)[number]

export type Test = { i: number; pass: boolean }
export type BinState = { lo: number; hi: number; tests: Test[] }
export type LinState = { k: number; tests: Test[]; done: boolean }

/** 在第 i 档电压（i × res）上跑一次功能测试：VIL 不超过门限就 Pass */
export const vilPass = (i: number, resV: number, truth: number) => i * resV <= truth + 1e-9

export const binInit = (n: number): BinState => ({ lo: 0, hi: n, tests: [] })
export const binDone = (s: BinState) => s.hi - s.lo <= 1

export function binStep(s: BinState, resV: number, truth: number): BinState {
  if (binDone(s)) return s
  const mid = Math.floor((s.lo + s.hi) / 2)
  const pass = vilPass(mid, resV, truth)
  return { lo: pass ? mid : s.lo, hi: pass ? s.hi : mid, tests: [...s.tests, { i: mid, pass }] }
}

export const linInit = (): LinState => ({ k: 0, tests: [], done: false })

export function linStep(s: LinState, n: number, resV: number, truth: number): LinState {
  if (s.done) return s
  const pass = vilPass(s.k, resV, truth)
  const tests = [...s.tests, { i: s.k, pass }]
  if (!pass || s.k >= n) return { k: s.k, tests, done: true }
  return { k: s.k + 1, tests, done: false }
}

export const RACE_LEAD: LText[] = [
  loc('同一颗芯片、同一个 VIL 门限，两种搜法同时开跑。范围 0–2.0 V，0 V 已知 Pass、2.0 V 已知 Fail。', 'Same chip, same VIL threshold, two search methods racing. Range 0–2.0 V; 0 V is known to Pass and 2.0 V is known to Fail.'),
  loc('二分搜索每次测中点，Pass 就往上半找，Fail 就往下半找；线性搜索从 0 V 开始一档一档往上加，直到第一次 Fail。', 'Binary search tests the midpoint each time: Pass moves to the upper half, Fail to the lower half. Linear search starts at 0 V and steps up one increment at a time until the first Fail.'),
]

export const LINEAR_WHEN: LText[] = [
  loc('线性搜索平均比二分慢得多，只在必须时才用。典型例子：施密特触发器（Schmitt trigger）输入。', 'Linear search is much slower than binary search on average, so use it only when you must. Typical example: Schmitt trigger inputs.'),
  loc('施密特输入有回差：上升时在 VT+ 翻转，下降时在 VT− 翻转。二分搜索的电压忽高忽低，输入一会儿从上面来、一会儿从下面来，结果取决于上一次的状态，搜不出确定值。线性搜索只朝一个方向走，测到的就是干净的 VT+（或反向走测 VT−）。', 'A Schmitt input has hysteresis: it switches at VT+ when rising and at VT− when falling. Binary search jumps up and down, so the input approaches sometimes from above and sometimes from below; the result depends on the previous state and no definite value is found. Linear search moves in one direction only and measures a clean VT+ (or VT− going the other way).'),
]

export const DEMO_STEPS: Array<{ range: string; mid: string; cmp: LText; next: string }> = [
  { range: '1 – 9', mid: '5', cmp: loc('5 > 4，去下半', '5 > 4, go to lower half'), next: '1 – 5' },
  { range: '1 – 5', mid: '3', cmp: loc('3 不大于 4，去上半', '3 is not > 4, go to upper half'), next: '3 – 5' },
  { range: '3 – 5', mid: '4', cmp: loc('4 不大于 4，去上半', '4 is not > 4, go to upper half'), next: '4 – 5' },
  { range: '4 – 5', mid: '4.5', cmp: loc('4.5 > 4，去下半', '4.5 > 4, go to lower half'), next: '4 – 4.5' },
  { range: '4 – 4.5', mid: '—', cmp: loc('范围宽 0.5，已小于分辨率 1，停止。结果 = 4', 'Range width 0.5 is below resolution 1. Stop. Result = 4'), next: '4' },
]

export const DEMO_LEAD = loc('教材里的小例子：在 1…9 里找未知数 4，分辨率 1。每次只能问“中点比它大吗？”', 'A small example from the textbook: find the unknown number 4 within 1…9, resolution 1. Each step may only ask "is the midpoint greater than it?"')

/* ---------- 3. 从搜索结果算 AC 参数 ---------- */

export type AcKind = 'setup' | 'hold' | 'tpd'

export const AC_SPAN = 100

export const AC_DEFAULT: Record<AcKind, { ref: number; res: number }> = {
  setup: { ref: 60, res: 52 },
  hold: { ref: 60, res: 63 },
  tpd: { ref: 20, res: 40 },
}

export const AC_INFO: Record<AcKind, { name: LText; formula: string; moved: LText; text: LText }> = {
  setup: {
    name: loc('建立时间 Setup', 'Setup time'),
    formula: 'Setup = ref − result',
    moved: loc('搜索移动的是数据的前沿（数据开始有效的那条沿），时钟沿固定不动。', 'The search moves the data leading edge (where data becomes valid); the clock edge stays fixed.'),
    text: loc('数据前沿越往时钟靠，建立时间越短。搜索报告最后一次 Pass 的数据前沿位置；用参考沿减去它，就是芯片需要的建立时间。', 'The closer the data leading edge gets to the clock, the shorter the setup time. The search reports the data leading-edge position of the last Pass; the reference edge minus it is the setup time the chip needs.'),
  },
  hold: {
    name: loc('保持时间 Hold', 'Hold time'),
    formula: 'Hold = result − ref',
    moved: loc('搜索移动的是数据的后沿（数据撤走的那条沿），时钟沿固定不动。', 'The search moves the data trailing edge (where data is removed); the clock edge stays fixed.'),
    text: loc('数据后沿越往时钟靠，保持时间越短。用搜索结果减去参考沿，就是保持时间。', 'The closer the data trailing edge gets to the clock, the shorter the hold time. The search result minus the reference edge is the hold time.'),
  },
  tpd: {
    name: loc('传输延迟 tPD', 'Propagation delay tPD'),
    formula: 'tPD = result − ref',
    moved: loc('搜索移动的是输出的比较 Strobe，输入沿固定不动。', 'The search moves the output compare strobe; the input edge stays fixed.'),
    text: loc('Strobe 早于输出跳变就 Fail，晚于就 Pass，搜索找到 Fail→Pass 的那一点。减去控制这个输出的输入沿时刻，就是 tPD。', 'A strobe before the output transition fails and one after it passes; the search finds the Fail→Pass point. Subtracting the time of the input edge that controls this output gives tPD.'),
  },
}

export const AC_LEAD = loc('搜索程序只会移动一条沿，它并不知道参考信号在哪。所以搜出来的数还要套一个公式，减掉参考沿的位置。', 'The search routine only moves one edge and does not know where the reference signal is. So the search result must go through a formula that subtracts the reference edge position.')

/* ---------- 4. 常见表征参数 ---------- */

export type Param = { id: string; name: Text; what: LText; how: LText }

export const PARAMS: Param[] = [
  { id: 'vddmin', name: 'VDDMIN', what: loc('最低能工作的 VDD', 'Lowest working VDD'), how: loc('跑功能向量，把 VDD 往下搜，找到刚开始 Fail 的电压。高电压一端 Pass、很低的电压 Fail。', 'Run the functional vectors and search VDD downward to find the voltage where it just starts to Fail. The high-voltage end Passes; a very low voltage Fails.') },
  { id: 'vddmax', name: 'VDDMAX', what: loc('最高能工作的 VDD', 'Highest working VDD'), how: loc('VDD 往上搜到功能失效。注意别超过绝对最大额定值，避免损坏芯片。', 'Search VDD upward until the function fails. Do not exceed the absolute maximum rating, or the chip may be damaged.') },
  { id: 'vil', name: 'VIL', what: loc('仍被认作 0 的最高输入电压', 'Highest input voltage still read as 0'), how: loc('VIL 从 0 V 往上搜，跑功能向量，找到最后一次 Pass 的电平。可以一组管脚一起搜，也可以逐脚搜。', 'Search VIL upward from 0 V while running the functional vectors and find the level of the last Pass. Search a group of pins together or pin by pin.') },
  { id: 'vih', name: 'VIH', what: loc('仍被认作 1 的最低输入电压', 'Lowest input voltage still read as 1'), how: loc('VIH 从 VDD 往下搜，找到最后一次 Pass 的电平。可按组或逐脚。', 'Search VIH downward from VDD and find the level of the last Pass. By group or pin by pin.') },
  { id: 'vol', name: 'VOL', what: loc('给定 IOL 下的输出低电压', 'Output low voltage at a given IOL'), how: loc('输出置 0，拉固定 IOL 电流，搜比较电平（或用 PMU 直接测）得到 VOL。可按组或逐脚。', 'Set the output to 0, sink a fixed IOL, and search the compare level (or measure directly with the PMU) to get VOL. By group or pin by pin.') },
  { id: 'voh', name: 'VOH', what: loc('给定 IOH 下的输出高电压', 'Output high voltage at a given IOH'), how: loc('输出置 1，灌固定 IOH，搜出 VOH。可按组或逐脚。', 'Set the output to 1, source a fixed IOH, and search for VOH. By group or pin by pin.') },
  { id: 'iol', name: 'IOL', what: loc('给定 VOL 下的输出低电流', 'Output low current at a given VOL'), how: loc('把输出电压固定在 VOL，搜能拉的最大电流。逐脚做。', 'Hold the output voltage at VOL and search for the maximum current it can sink. Pin by pin.') },
  { id: 'ioh', name: 'IOH', what: loc('给定 VOH 下的输出高电流', 'Output high current at a given VOH'), how: loc('把输出电压固定在 VOH，搜能灌的最大电流。逐脚做。', 'Hold the output voltage at VOH and search for the maximum current it can source. Pin by pin.') },
  { id: 'setup', name: 'Setup', what: loc('参考沿之前信号要有效的最短时间', 'Minimum time a signal must be valid before the reference edge'), how: loc('参考沿固定，移动数据前沿，Setup = 参考 − 结果。', 'Fix the reference edge and move the data leading edge. Setup = reference − result.') },
  { id: 'hold', name: 'Hold', what: loc('参考沿之后信号要保持的最短时间', 'Minimum time a signal must hold after the reference edge'), how: loc('参考沿固定，移动数据后沿，Hold = 结果 − 参考。', 'Fix the reference edge and move the data trailing edge. Hold = result − reference.') },
  { id: 'tpd', name: 'tPD', what: loc('参考沿到输出有效的时间', 'Time from reference edge to valid output'), how: loc('输入沿固定，移动输出 Strobe，tPD = 结果 − 参考。向量里只比较目标的那次跳变（低→高或高→低）。', 'Fix the input edge and move the output strobe. tPD = result − reference. The vectors compare only the target transition (low→high or high→low).') },
  { id: 'pw', name: loc('最小脉宽', 'Min pulse width'), what: loc('还能正常工作的最窄脉冲', 'Narrowest pulse that still works'), how: loc('用 RZ / RO 格式，把脉冲的两条沿互相靠近，搜到开始 Fail 的宽度。', 'Use RZ / RO format, move the two pulse edges toward each other, and search for the width where it starts to Fail.') },
  { id: 'fmax', name: 'fMAX', what: loc('最高工作频率', 'Maximum operating frequency'), how: loc('把所有时序关系按比例压缩，缩短周期直到失败。信号之间的相对位置要事先规划清楚。', 'Compress all timing relationships proportionally and shorten the period until it fails. Plan the relative positions of the signals in advance.') },
]

export const PLAN: LText[] = [
  loc('先看规格书，列出要表征的参数清单。', 'Read the datasheet first and list the parameters to characterize.'),
  loc('DC 参数和输入 / 输出门限一般不难；AC 参数可能对应用很关键，但在数字测试机上不一定测得了，有的定义方式甚至做不出 Pass / Fail。', 'DC parameters and input / output thresholds are usually easy. AC parameters may be critical to the application but are not always testable on a digital tester; some are even defined in a way that cannot give Pass / Fail.'),
  loc('复杂测试先画时序图，弄懂测试怎么运行，再写代码。', 'For complex tests, draw the timing diagram first and understand how the test runs before writing code.'),
  loc('每一项都必须能找到 Pass 区和 Fail 区，并报告有意义的数据。', 'Every item must have a findable Pass region and Fail region, and must report meaningful data.'),
  loc('时序关系或器件功能有疑问，直接找设计工程师确认。', 'If timing relationships or device function are unclear, confirm directly with the design engineer.'),
]

/* ---------- 5. Shmoo ---------- */

export const SH_VDD: number[] = Array.from({ length: 21 }, (_, i) => Math.round((5.5 - i * 0.1) * 10) / 10)

export function shVil(cols: number): number[] {
  const step = 2.0 / (cols - 1)
  return Array.from({ length: cols }, (_, i) => Math.round((2.0 - i * step) * 1000) / 1000)
}

export const SH_VDDMIN = 3.75
/** 不跟踪时 VIH 固定在这个值 */
export const SH_VIH_FIXED = 4.5

/** 芯片 VIL 门限随 VDD 变化（与教材 Figure 9-5 一致：4.5 V→1.27 V，5.5 V→1.43 V） */
export const shThreshold = (vdd: number) => 0.16 * vdd + 0.55

export function shPass(vdd: number, vil: number, hole: boolean) {
  if (vdd < SH_VDDMIN) return false
  if (hole && vdd >= 4.25 && vdd <= 4.65 && vil >= 0.45 && vil <= 0.85) return false
  return vil <= shThreshold(vdd) + 1e-9
}

export const SHMOO_LEAD: LText[] = [
  loc('Shmoo 图同时改变两个测试资源，把每一点的结果画成二维图。这里 Y 轴是 VDD（5.5 → 3.5 V，21 档），X 轴是 VIL（2.0 → 0 V）。', 'A shmoo plot varies two test resources at once and draws the result of every point as a 2D map. Here the Y axis is VDD (5.5 → 3.5 V, 21 steps) and the X axis is VIL (2.0 → 0 V).'),
  loc('每一格都要真的跑一次功能测试。Pass 打 “$”，Fail 打 “.”。点数是两轴档数相乘，所以 Shmoo 很耗时间。', 'Every cell is a real functional test run. Pass prints "$" and Fail prints ".". The number of points is the product of the steps on both axes, so a shmoo takes a lot of time.'),
]

export const HOLE_TEXT = loc('“洞”：芯片在工作区中间某一块失效，而这块的上下左右都能工作。洞往往指向真实的设计或工艺问题（例如某个电压下的竞争、内部节点余量不足），单点测试很容易漏掉。', 'A "hole": the chip fails in a patch in the middle of its operating region while everything above, below, left and right works. Holes often point to real design or process problems (e.g. a race at a certain voltage, insufficient margin on an internal node) that single-point tests easily miss.')

export const TRACK_TEXT = loc('跟踪（tracking）：让别的测试资源跟着 X/Y 轴一起变。测 CMOS 时 VIH 要跟踪 VDD，否则 VDD 扫到比 VIH 还低时，输入比电源还高，保护二极管正偏，可能触发闩锁（Latch-up）。做时序 Shmoo 时，输入或输出的边沿可能也要跟着时钟沿一起移动。', 'Tracking: other test resources change along with the X/Y axes. For CMOS, VIH must track VDD; otherwise, when VDD sweeps below VIH, the input is above the supply, the protection diode is forward-biased, and latch-up may occur. In a timing shmoo, input or output edges may also need to move with the clock edge.')

/* ---------- 6. Datalog ---------- */

export const FIG95_IN: Array<{ name: string; pin: number; v: [string, string, string] }> = [
  { name: 'VIL', pin: 87, v: ['1.266', '1.346', '1.430'] },
  { name: 'VIH', pin: 87, v: ['1.332', '1.436', '1.544'] },
  { name: 'VIL', pin: 88, v: ['1.242', '1.340', '1.432'] },
  { name: 'VIH', pin: 88, v: ['1.332', '1.436', '1.544'] },
]

export const FIG95_OUT: Array<{ name: string; pin: number; v: [string, string, string] }> = [
  { name: 'VOL', pin: 23, v: ['28.00m', '36.00m', '28.00m'] },
  { name: 'VOH', pin: 23, v: ['4.396', '4.872', '5.380'] },
  { name: 'VOL', pin: 24, v: ['24.00m', '26.00m', '28.00m'] },
  { name: 'VOH', pin: 24, v: ['4.396', '4.868', '5.380'] },
  { name: 'VOL', pin: 30, v: ['22.00m', '25.00m', '27.00m'] },
  { name: 'VOH', pin: 30, v: ['4.376', '4.868', '5.376'] },
]

export const FIG96: Array<{ pin: string; tp: number; measured: number; fail: number }> = [
  { pin: 'dbus[7]', tp: 7, measured: 20.1, fail: 10 },
  { pin: 'dbus[6]', tp: 9, measured: 20.3, fail: 9 },
  { pin: 'dbus[5]', tp: 10, measured: 19.9, fail: 8 },
  { pin: 'dbus[4]', tp: 11, measured: 20.0, fail: 7 },
  { pin: 'dbus[3]', tp: 12, measured: 19.5, fail: 6 },
  { pin: 'dbus[2]', tp: 13, measured: 19.6, fail: 5 },
  { pin: 'dbus[1]', tp: 14, measured: 19.2, fail: 4 },
  { pin: 'dbus[0]', tp: 15, measured: 19.6, fail: 3 },
]

export const DATALOG_LEAD: LText[] = [
  loc('每台测试机都有 Datalog：报告测试名、Pass / Fail 的管脚、程序语句号等。表征时可以让它报告实测值。', 'Every tester has a datalog: it reports test names, Pass / Fail pins, program statement numbers and so on. During characterization it can report measured values.'),
  loc('注意：要先弄懂你这台机器的 Datalog 是怎么抓结果的。某些条件下，它的工作方式会影响记录下来的数。', 'Note: first understand how your tester\'s datalog captures results. Under some conditions, the way it works affects the numbers recorded.'),
]

export const FIG95_NOTE = loc('Figure 9-5：用标准二分电平搜索工具，在 VDDMIN / VDDNOM / VDDMAX 三个电压下找输入 / 输出门限，再格式化打印。几乎不用写程序。', 'Figure 9-5: the standard binary level-search tool finds input / output thresholds at three voltages, VDDMIN / VDDNOM / VDDMAX, and prints them formatted. Almost no programming needed.')
export const FIG96_NOTE = loc('Figure 9-6：对 dbus[7:0] 做输出延迟二分搜索。原始值 45 ns，搜索范围 1.0–80.0 ns，Measured 是搜到的跳变时刻。', 'Figure 9-6: binary search of output delay on dbus[7:0]. Original value 45 ns, search range 1.0–80.0 ns; Measured is the transition time found.')

export const TOOLS: Card[] = [
  { id: 'shmoo', title: 'Shmoo Plot', text: loc('两个资源同时扫，画出工作区。看全貌、找洞。', 'Sweep two resources at once and map the operating region. See the whole picture and find holes.') },
  { id: 'level', title: 'Level Search', text: loc('电平搜索：VIL / VIH / VOL / VOH 门限，一条语句搞定。', 'Level search: VIL / VIH / VOL / VOH thresholds in one statement.') },
  { id: 'binary', title: 'Binary Search', text: loc('二分搜索：电压、电流、时序都能搜，最快。', 'Binary search: works on voltage, current and timing, and is the fastest.') },
  { id: 'linear', title: 'Linear Search', text: loc('线性搜索：单方向一步步走，用于有回差的输入等场合。', 'Linear search: steps in one direction, for cases like inputs with hysteresis.') },
  { id: 'datalog', title: 'Datalog', text: loc('把测量值、失败管脚、失败向量号打印出来，留作表征数据。', 'Prints measured values, failing pins and failing vector numbers as characterization data.') },
]

export const TOOLS_TIP = loc('能用系统自带工具就用：它们执行快，基本没有 bug。不要花时间重写已经存在、而且好用的代码。', 'Use the built-in system tools whenever you can: they run fast and are essentially bug-free. Don\'t spend time rewriting code that already exists and works.')

export const READ_QUIZ: QuizQuestion[] = [
  {
    id: 'r1',
    prompt: loc('Figure 9-6 里，哪一位输出最快？', 'In Figure 9-6, which output bit is fastest?'),
    options: [
      { id: 'a', text: loc('dbus[1]  19.2 ns', 'dbus[1]  19.2 ns') },
      { id: 'b', text: loc('dbus[6]  20.3 ns', 'dbus[6]  20.3 ns') },
      { id: 'c', text: loc('dbus[0]  19.6 ns', 'dbus[0]  19.6 ns') },
    ],
    answer: 'a',
    explain: loc('Measured 一列最小的是 dbus[1] 的 19.2 ns；最慢的是 dbus[6] 的 20.3 ns。8 位之间相差约 1.1 ns，这就是总线的位间偏斜。', 'The smallest value in the Measured column is 19.2 ns on dbus[1]; the slowest is 20.3 ns on dbus[6]. The 8 bits differ by about 1.1 ns, which is the bit-to-bit skew of the bus.'),
  },
  {
    id: 'r2',
    prompt: loc('Figure 9-5 里，VIL 门限随 VDD 怎么变？', 'In Figure 9-5, how does the VIL threshold change with VDD?'),
    options: [
      { id: 'a', text: loc('VDD 越高，VIL 门限越高（约 1.27 → 1.35 → 1.43 V）', 'Higher VDD, higher VIL threshold (about 1.27 → 1.35 → 1.43 V)') },
      { id: 'b', text: loc('VDD 越高，VIL 门限越低', 'Higher VDD, lower VIL threshold') },
      { id: 'c', text: loc('和 VDD 无关', 'Independent of VDD') },
    ],
    answer: 'a',
    explain: loc('CMOS 输入的翻转点大致跟着 VDD 走，所以表征要在 VDDMIN / NOM / MAX 三点都做。规格里的 VIL 要按最差的那一点（VDDMIN 时的 1.266 V）留余量。', 'The switching point of a CMOS input roughly follows VDD, so characterize at all three points: VDDMIN / NOM / MAX. The VIL spec must leave margin against the worst point (1.266 V at VDDMIN).'),
  },
  {
    id: 'r3',
    prompt: loc('同一管脚，VIH 门限总比 VIL 门限高一点（如 1.436 V vs 1.346 V），这说明？', 'On the same pin, the VIH threshold is always a little higher than the VIL threshold (e.g. 1.436 V vs 1.346 V). What does this show?'),
    options: [
      { id: 'a', text: loc('输入翻转点附近有一段不确定区；VIL 搜的是“还认 0”的最高点，VIH 搜的是“已认 1”的最低点', 'There is an uncertain zone around the input switching point; VIL finds the highest point "still read as 0", VIH the lowest point "already read as 1"') },
      { id: 'b', text: loc('测试机坏了', 'The tester is broken') },
      { id: 'c', text: loc('VIH 一定比 VDD 高', 'VIH must be higher than VDD') },
    ],
    answer: 'a',
    explain: loc('两者都在 1.3–1.5 V 附近，离规格（例如 VIL ≤ 0.8 V、VIH ≥ 2.0 V）都很远，说明输入门限余量充足。', 'Both are around 1.3–1.5 V, far from the spec (e.g. VIL ≤ 0.8 V, VIH ≥ 2.0 V), showing ample input threshold margin.'),
  },
]

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('表征是找芯片真正的工作极限；前提是范围两端分别能 Pass 和 Fail。', 'Characterization finds the chip\'s real operating limits; it requires the range to Pass at one end and Fail at the other.'),
  loc('二分搜索（逐次逼近）每次减半，次数约 log₂(范围 / 分辨率)；线性搜索单向一步步走，慢，但有回差的输入只能用它。', 'Binary search (successive approximation) halves the range each time, taking about log₂(range / resolution) runs. Linear search steps in one direction: slow, but the only choice for inputs with hysteresis.'),
  loc('搜索只移动一条沿：Setup = 参考 − 结果，Hold = 结果 − 参考，tPD = 结果 − 参考。', 'A search moves only one edge: Setup = reference − result, Hold = result − reference, tPD = result − reference.'),
  loc('Shmoo 图看两个参数的整个工作区，能发现“洞”，但很耗时；测 CMOS 时 VIH 要跟踪 VDD。', 'A shmoo plot shows the whole operating region of two parameters and can reveal "holes", but it is time-consuming. For CMOS, VIH must track VDD.'),
  loc('优先用测试机自带的 Shmoo、Level Search、搜索和 Datalog 工具。', 'Prefer the tester\'s built-in shmoo, level search, search and datalog tools.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('二分搜索（Binary Search）还有另一个名字，是什么？', 'Binary search has another name. What is it?'),
    options: [
      { id: 'a', text: loc('逐次逼近（Successive Approximation）', 'Successive approximation') },
      { id: 'b', text: loc('线性扫描（Linear Sweep）', 'Linear sweep') },
      { id: 'c', text: loc('Shmoo 搜索', 'Shmoo search') },
      { id: 'd', text: loc('最坏情况测试', 'Worst-case testing') },
    ],
    answer: 'a',
    explain: loc('每次把范围对半分、根据大于 / 小于的结果逼近一位——和逐次逼近型 ADC 是同一个思路。', 'Each step halves the range and approaches one bit closer based on a greater / less result, the same idea as a successive-approximation ADC.'),
  },
  {
    id: 'q2',
    prompt: loc('Shmoo 图、电平搜索这类测试机标准工具，是做器件表征的有效手段。对吗？', 'Standard tester tools such as shmoo plots and level search are effective for device characterization. True?'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('系统工具执行快、基本没有 bug，几乎不用写代码就能得到表征数据，应当优先使用。', 'System tools run fast, are essentially bug-free, and give characterization data with almost no code, so use them first.'),
  },
  {
    id: 'q3',
    prompt: loc('经常需要专门为表征开发测试向量。对吗？', 'Test vectors often need to be developed specifically for characterization. True?'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('量产功能向量不一定能把某个参数单独推到极限。表征往往要为单个功能写专用向量，才能得到有意义的数据。', 'Production functional vectors may not push a single parameter to its limit. Characterization often needs dedicated vectors for a single function to get meaningful data.'),
  },
  {
    id: 'q4',
    prompt: loc('之所以用 Shmoo 图，是因为它比搜索工具跑得快。对吗？', 'Shmoo plots are used because they run faster than search tools. True?'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc('恰恰相反：Shmoo 每一格都要跑一次测试，21 × 51 就是 1071 次，很耗时。用它是因为能看到两个参数的整个工作区（包括洞），不是因为快。', 'Quite the opposite: every shmoo cell is one test run, so 21 × 51 is 1071 runs, which is time-consuming. It is used because it shows the whole operating region of two parameters (including holes), not because it is fast.'),
  },
  {
    id: 'q5',
    prompt: loc('线性搜索通常比二分搜索执行得慢。对吗？', 'Linear search usually runs slower than binary search. True?'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('0–2 V、10 mV 分辨率：二分约 8 次，线性可能要上百次。所以线性搜索只在必须时用（如施密特触发器）。', '0–2 V at 10 mV resolution: binary takes about 8 runs, linear may take over a hundred. So use linear search only when you must (e.g. Schmitt triggers).'),
  },
  {
    id: 'q6',
    prompt: loc('用二分搜索测保持时间（Hold），用哪个公式？', 'Which formula gives hold time from a binary search?'),
    options: [
      { id: 'a', text: loc('Hold = 搜索结果 − 参考信号', 'Hold = search result − reference signal') },
      { id: 'b', text: loc('Hold = 参考信号 − 搜索结果', 'Hold = reference signal − search result') },
      { id: 'c', text: loc('Hold = 搜索结果 + 参考信号', 'Hold = search result + reference signal') },
      { id: 'd', text: loc('Hold = 搜索结果', 'Hold = search result') },
    ],
    answer: 'a',
    explain: loc('Hold 搜的是数据后沿，它在参考沿之后，所以用结果减参考。Setup 正好反过来：参考减结果。', 'Hold searches the data trailing edge, which is after the reference edge, so it is result minus reference. Setup is the reverse: reference minus result.'),
  },
  {
    id: 'q7',
    prompt: loc('VIL 搜索范围 0–2.0 V、分辨率 10 mV，二分搜索大约要几次？', 'VIL search range 0–2.0 V, resolution 10 mV. About how many binary search runs?'),
    options: [
      { id: 'a', text: loc('8 次', '8') },
      { id: 'b', text: loc('20 次', '20') },
      { id: 'c', text: loc('200 次', '200') },
    ],
    answer: 'a',
    explain: loc('2.0 V / 10 mV = 200 档，log₂200 ≈ 7.6，向上取整 8 次。', '2.0 V / 10 mV = 200 steps; log₂200 ≈ 7.6, rounded up to 8 runs.'),
  },
  {
    id: 'q8',
    prompt: loc('做 VDD vs VIL 的 Shmoo 时，为什么要让 VIH 跟踪 VDD？', 'In a VDD vs VIL shmoo, why must VIH track VDD?'),
    options: [
      { id: 'a', text: loc('避免 VDD 扫到比 VIH 还低，输入高于电源，引发闩锁', 'To avoid VDD sweeping below VIH, putting the input above the supply and causing latch-up') },
      { id: 'b', text: loc('让 Shmoo 跑得更快', 'To make the shmoo run faster') },
      { id: 'c', text: loc('为了让 VIL 更准', 'To make VIL more accurate') },
    ],
    answer: 'a',
    explain: loc('输入高于 VDD 时保护二极管正偏、向电源灌电流，CMOS 可能闩锁甚至损坏。', 'When an input is above VDD, the protection diode is forward-biased and forces current into the supply; CMOS may latch up or even be damaged.'),
  },
]
