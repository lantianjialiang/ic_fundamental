import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card, type Text } from '../parts'

/* ---------- 1. 表征是什么 ---------- */

export const WHAT: Card[] = [
  {
    id: 'limit',
    title: loc('找极限'),
    sub: loc('不是判过不过，而是量到哪'),
    text: loc('表征（Characterization）要回答：这颗芯片到底能工作到哪里？最低多少伏、最快多少 ns、输入门限在哪。'),
    explain: [
      loc('量产测试只关心“满不满足规格”；表征要把真实边界找出来，看离规格还有多少余量。'),
      loc('常用工具：二分搜索、线性搜索、Shmoo 图。电压、电流、时序参数都可以表征。'),
    ],
  },
  {
    id: 'pf',
    title: loc('两端都要有 Pass / Fail'),
    sub: loc('先包住边界，再搜'),
    text: loc('能搜的前提：参数在范围一端必须 Pass，另一端必须 Fail。例如 VIL = 0 V 跑功能向量 Pass，VIL = 2 V 跑 Fail。'),
    explain: [
      loc('有了一个已知 Pass 点和一个已知 Fail 点，边界一定夹在中间，才能用搜索把它逼出来。'),
      loc('如果两端都 Pass 或都 Fail，说明范围没包住边界，搜出来的数没有意义。'),
    ],
  },
  {
    id: 'vec',
    title: loc('常要专用向量'),
    sub: loc('功能向量不一定够用'),
    text: loc('表征要让芯片做“能暴露极限”的动作。很多时候要专门为某一个功能写一组向量。'),
    explain: [
      loc('量产功能向量的目的和表征不一样，不一定能把某个参数单独推到极限。'),
      loc('用之前必须先弄懂这组向量在干什么——尤其是 AC 参数表征：搜的那条边沿，向量里必须真的在比较对应的那次跳变。'),
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
  loc('同一颗芯片、同一个 VIL 门限，两种搜法同时开跑。范围 0–2.0 V，0 V 已知 Pass、2.0 V 已知 Fail。'),
  loc('二分搜索每次测中点，Pass 就往上半找，Fail 就往下半找；线性搜索从 0 V 开始一档一档往上加，直到第一次 Fail。'),
]

export const LINEAR_WHEN: LText[] = [
  loc('线性搜索平均比二分慢得多，只在必须时才用。典型例子：施密特触发器（Schmitt trigger）输入。'),
  loc('施密特输入有回差：上升时在 VT+ 翻转，下降时在 VT− 翻转。二分搜索的电压忽高忽低，输入一会儿从上面来、一会儿从下面来，结果取决于上一次的状态，搜不出确定值。线性搜索只朝一个方向走，测到的就是干净的 VT+（或反向走测 VT−）。'),
]

export const DEMO_STEPS: Array<{ range: string; mid: string; cmp: LText; next: string }> = [
  { range: '1 – 9', mid: '5', cmp: loc('5 > 4，去下半'), next: '1 – 5' },
  { range: '1 – 5', mid: '3', cmp: loc('3 不大于 4，去上半'), next: '3 – 5' },
  { range: '3 – 5', mid: '4', cmp: loc('4 不大于 4，去上半'), next: '4 – 5' },
  { range: '4 – 5', mid: '4.5', cmp: loc('4.5 > 4，去下半'), next: '4 – 4.5' },
  { range: '4 – 4.5', mid: '—', cmp: loc('范围宽 0.5，已小于分辨率 1，停止。结果 = 4'), next: '4' },
]

export const DEMO_LEAD = loc('教材里的小例子：在 1…9 里找未知数 4，分辨率 1。每次只能问“中点比它大吗？”')

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
    name: loc('建立时间 Setup'),
    formula: 'Setup = ref − result',
    moved: loc('搜索移动的是数据的前沿（数据开始有效的那条沿），时钟沿固定不动。'),
    text: loc('数据前沿越往时钟靠，建立时间越短。搜索报告最后一次 Pass 的数据前沿位置；用参考沿减去它，就是芯片需要的建立时间。'),
  },
  hold: {
    name: loc('保持时间 Hold'),
    formula: 'Hold = result − ref',
    moved: loc('搜索移动的是数据的后沿（数据撤走的那条沿），时钟沿固定不动。'),
    text: loc('数据后沿越往时钟靠，保持时间越短。用搜索结果减去参考沿，就是保持时间。'),
  },
  tpd: {
    name: loc('传输延迟 tPD'),
    formula: 'tPD = result − ref',
    moved: loc('搜索移动的是输出的比较 Strobe，输入沿固定不动。'),
    text: loc('Strobe 早于输出跳变就 Fail，晚于就 Pass，搜索找到 Fail→Pass 的那一点。减去控制这个输出的输入沿时刻，就是 tPD。'),
  },
}

export const AC_LEAD = loc('搜索程序只会移动一条沿，它并不知道参考信号在哪。所以搜出来的数还要套一个公式，减掉参考沿的位置。')

/* ---------- 4. 常见表征参数 ---------- */

export type Param = { id: string; name: Text; what: LText; how: LText }

export const PARAMS: Param[] = [
  { id: 'vddmin', name: 'VDDMIN', what: loc('最低能工作的 VDD'), how: loc('跑功能向量，把 VDD 往下搜，找到刚开始 Fail 的电压。高电压一端 Pass、很低的电压 Fail。') },
  { id: 'vddmax', name: 'VDDMAX', what: loc('最高能工作的 VDD'), how: loc('VDD 往上搜到功能失效。注意别超过绝对最大额定值，避免损坏芯片。') },
  { id: 'vil', name: 'VIL', what: loc('仍被认作 0 的最高输入电压'), how: loc('VIL 从 0 V 往上搜，跑功能向量，找到最后一次 Pass 的电平。可以一组管脚一起搜，也可以逐脚搜。') },
  { id: 'vih', name: 'VIH', what: loc('仍被认作 1 的最低输入电压'), how: loc('VIH 从 VDD 往下搜，找到最后一次 Pass 的电平。可按组或逐脚。') },
  { id: 'vol', name: 'VOL', what: loc('给定 IOL 下的输出低电压'), how: loc('输出置 0，拉固定 IOL 电流，搜比较电平（或用 PMU 直接测）得到 VOL。可按组或逐脚。') },
  { id: 'voh', name: 'VOH', what: loc('给定 IOH 下的输出高电压'), how: loc('输出置 1，灌固定 IOH，搜出 VOH。可按组或逐脚。') },
  { id: 'iol', name: 'IOL', what: loc('给定 VOL 下的输出低电流'), how: loc('把输出电压固定在 VOL，搜能拉的最大电流。逐脚做。') },
  { id: 'ioh', name: 'IOH', what: loc('给定 VOH 下的输出高电流'), how: loc('把输出电压固定在 VOH，搜能灌的最大电流。逐脚做。') },
  { id: 'setup', name: 'Setup', what: loc('参考沿之前信号要有效的最短时间'), how: loc('参考沿固定，移动数据前沿，Setup = 参考 − 结果。') },
  { id: 'hold', name: 'Hold', what: loc('参考沿之后信号要保持的最短时间'), how: loc('参考沿固定，移动数据后沿，Hold = 结果 − 参考。') },
  { id: 'tpd', name: 'tPD', what: loc('参考沿到输出有效的时间'), how: loc('输入沿固定，移动输出 Strobe，tPD = 结果 − 参考。向量里只比较目标的那次跳变（低→高或高→低）。') },
  { id: 'pw', name: loc('最小脉宽'), what: loc('还能正常工作的最窄脉冲'), how: loc('用 RZ / RO 格式，把脉冲的两条沿互相靠近，搜到开始 Fail 的宽度。') },
  { id: 'fmax', name: 'fMAX', what: loc('最高工作频率'), how: loc('把所有时序关系按比例压缩，缩短周期直到失败。信号之间的相对位置要事先规划清楚。') },
]

export const PLAN: LText[] = [
  loc('先看规格书，列出要表征的参数清单。'),
  loc('DC 参数和输入 / 输出门限一般不难；AC 参数可能对应用很关键，但在数字测试机上不一定测得了，有的定义方式甚至做不出 Pass / Fail。'),
  loc('复杂测试先画时序图，弄懂测试怎么运行，再写代码。'),
  loc('每一项都必须能找到 Pass 区和 Fail 区，并报告有意义的数据。'),
  loc('时序关系或器件功能有疑问，直接找设计工程师确认。'),
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
  loc('Shmoo 图同时改变两个测试资源，把每一点的结果画成二维图。这里 Y 轴是 VDD（5.5 → 3.5 V，21 档），X 轴是 VIL（2.0 → 0 V）。'),
  loc('每一格都要真的跑一次功能测试。Pass 打 “$”，Fail 打 “.”。点数是两轴档数相乘，所以 Shmoo 很耗时间。'),
]

export const HOLE_TEXT = loc('“洞”：芯片在工作区中间某一块失效，而这块的上下左右都能工作。洞往往指向真实的设计或工艺问题（例如某个电压下的竞争、内部节点余量不足），单点测试很容易漏掉。')

export const TRACK_TEXT = loc('跟踪（tracking）：让别的测试资源跟着 X/Y 轴一起变。测 CMOS 时 VIH 要跟踪 VDD，否则 VDD 扫到比 VIH 还低时，输入比电源还高，保护二极管正偏，可能触发闩锁（Latch-up）。做时序 Shmoo 时，输入或输出的边沿可能也要跟着时钟沿一起移动。')

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
  loc('每台测试机都有 Datalog：报告测试名、Pass / Fail 的管脚、程序语句号等。表征时可以让它报告实测值。'),
  loc('注意：要先弄懂你这台机器的 Datalog 是怎么抓结果的。某些条件下，它的工作方式会影响记录下来的数。'),
]

export const FIG95_NOTE = loc('Figure 9-5：用标准二分电平搜索工具，在 VDDMIN / VDDNOM / VDDMAX 三个电压下找输入 / 输出门限，再格式化打印。几乎不用写程序。')
export const FIG96_NOTE = loc('Figure 9-6：对 dbus[7:0] 做输出延迟二分搜索。原始值 45 ns，搜索范围 1.0–80.0 ns，Measured 是搜到的跳变时刻。')

export const TOOLS: Card[] = [
  { id: 'shmoo', title: 'Shmoo Plot', text: loc('两个资源同时扫，画出工作区。看全貌、找洞。') },
  { id: 'level', title: 'Level Search', text: loc('电平搜索：VIL / VIH / VOL / VOH 门限，一条语句搞定。') },
  { id: 'binary', title: 'Binary Search', text: loc('二分搜索：电压、电流、时序都能搜，最快。') },
  { id: 'linear', title: 'Linear Search', text: loc('线性搜索：单方向一步步走，用于有回差的输入等场合。') },
  { id: 'datalog', title: 'Datalog', text: loc('把测量值、失败管脚、失败向量号打印出来，留作表征数据。') },
]

export const TOOLS_TIP = loc('能用系统自带工具就用：它们执行快，基本没有 bug。不要花时间重写已经存在、而且好用的代码。')

export const READ_QUIZ: QuizQuestion[] = [
  {
    id: 'r1',
    prompt: loc('Figure 9-6 里，哪一位输出最快？'),
    options: [
      { id: 'a', text: loc('dbus[1]  19.2 ns') },
      { id: 'b', text: loc('dbus[6]  20.3 ns') },
      { id: 'c', text: loc('dbus[0]  19.6 ns') },
    ],
    answer: 'a',
    explain: loc('Measured 一列最小的是 dbus[1] 的 19.2 ns；最慢的是 dbus[6] 的 20.3 ns。8 位之间相差约 1.1 ns，这就是总线的位间偏斜。'),
  },
  {
    id: 'r2',
    prompt: loc('Figure 9-5 里，VIL 门限随 VDD 怎么变？'),
    options: [
      { id: 'a', text: loc('VDD 越高，VIL 门限越高（约 1.27 → 1.35 → 1.43 V）') },
      { id: 'b', text: loc('VDD 越高，VIL 门限越低') },
      { id: 'c', text: loc('和 VDD 无关') },
    ],
    answer: 'a',
    explain: loc('CMOS 输入的翻转点大致跟着 VDD 走，所以表征要在 VDDMIN / NOM / MAX 三点都做。规格里的 VIL 要按最差的那一点（VDDMIN 时的 1.266 V）留余量。'),
  },
  {
    id: 'r3',
    prompt: loc('同一管脚，VIH 门限总比 VIL 门限高一点（如 1.436 V vs 1.346 V），这说明？'),
    options: [
      { id: 'a', text: loc('输入翻转点附近有一段不确定区；VIL 搜的是“还认 0”的最高点，VIH 搜的是“已认 1”的最低点') },
      { id: 'b', text: loc('测试机坏了') },
      { id: 'c', text: loc('VIH 一定比 VDD 高') },
    ],
    answer: 'a',
    explain: loc('两者都在 1.3–1.5 V 附近，离规格（例如 VIL ≤ 0.8 V、VIH ≥ 2.0 V）都很远，说明输入门限余量充足。'),
  },
]

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('表征是找芯片真正的工作极限；前提是范围两端分别能 Pass 和 Fail。'),
  loc('二分搜索（逐次逼近）每次减半，次数约 log₂(范围 / 分辨率)；线性搜索单向一步步走，慢，但有回差的输入只能用它。'),
  loc('搜索只移动一条沿：Setup = 参考 − 结果，Hold = 结果 − 参考，tPD = 结果 − 参考。'),
  loc('Shmoo 图看两个参数的整个工作区，能发现“洞”，但很耗时；测 CMOS 时 VIH 要跟踪 VDD。'),
  loc('优先用测试机自带的 Shmoo、Level Search、搜索和 Datalog 工具。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('二分搜索（Binary Search）还有另一个名字，是什么？'),
    options: [
      { id: 'a', text: loc('逐次逼近（Successive Approximation）') },
      { id: 'b', text: loc('线性扫描（Linear Sweep）') },
      { id: 'c', text: loc('Shmoo 搜索') },
      { id: 'd', text: loc('最坏情况测试') },
    ],
    answer: 'a',
    explain: loc('每次把范围对半分、根据大于 / 小于的结果逼近一位——和逐次逼近型 ADC 是同一个思路。'),
  },
  {
    id: 'q2',
    prompt: loc('Shmoo 图、电平搜索这类测试机标准工具，是做器件表征的有效手段。对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('系统工具执行快、基本没有 bug，几乎不用写代码就能得到表征数据，应当优先使用。'),
  },
  {
    id: 'q3',
    prompt: loc('经常需要专门为表征开发测试向量。对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('量产功能向量不一定能把某个参数单独推到极限。表征往往要为单个功能写专用向量，才能得到有意义的数据。'),
  },
  {
    id: 'q4',
    prompt: loc('之所以用 Shmoo 图，是因为它比搜索工具跑得快。对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'b',
    explain: loc('恰恰相反：Shmoo 每一格都要跑一次测试，21 × 51 就是 1071 次，很耗时。用它是因为能看到两个参数的整个工作区（包括洞），不是因为快。'),
  },
  {
    id: 'q5',
    prompt: loc('线性搜索通常比二分搜索执行得慢。对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('0–2 V、10 mV 分辨率：二分约 8 次，线性可能要上百次。所以线性搜索只在必须时用（如施密特触发器）。'),
  },
  {
    id: 'q6',
    prompt: loc('用二分搜索测保持时间（Hold），用哪个公式？'),
    options: [
      { id: 'a', text: loc('Hold = 搜索结果 − 参考信号') },
      { id: 'b', text: loc('Hold = 参考信号 − 搜索结果') },
      { id: 'c', text: loc('Hold = 搜索结果 + 参考信号') },
      { id: 'd', text: loc('Hold = 搜索结果') },
    ],
    answer: 'a',
    explain: loc('Hold 搜的是数据后沿，它在参考沿之后，所以用结果减参考。Setup 正好反过来：参考减结果。'),
  },
  {
    id: 'q7',
    prompt: loc('VIL 搜索范围 0–2.0 V、分辨率 10 mV，二分搜索大约要几次？'),
    options: [
      { id: 'a', text: loc('8 次') },
      { id: 'b', text: loc('20 次') },
      { id: 'c', text: loc('200 次') },
    ],
    answer: 'a',
    explain: loc('2.0 V / 10 mV = 200 档，log₂200 ≈ 7.6，向上取整 8 次。'),
  },
  {
    id: 'q8',
    prompt: loc('做 VDD vs VIL 的 Shmoo 时，为什么要让 VIH 跟踪 VDD？'),
    options: [
      { id: 'a', text: loc('避免 VDD 扫到比 VIH 还低，输入高于电源，引发闩锁') },
      { id: 'b', text: loc('让 Shmoo 跑得更快') },
      { id: 'c', text: loc('为了让 VIL 更准') },
    ],
    answer: 'a',
    explain: loc('输入高于 VDD 时保护二极管正偏、向电源灌电流，CMOS 可能闩锁甚至损坏。'),
  },
]
