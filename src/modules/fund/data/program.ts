import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------- 1. 三种程序 ---------- */

export const PROGRAMS: Card[] = [
  {
    id: 'eng',
    title: loc('工程程序', 'Engineering program'),
    sub: loc('Engineering · 第一版', 'Engineering · first version'),
    text: loc('第一版程序通常是工程工具：先验证芯片能不能工作，顺便收集数据。', 'The first program is usually an engineering tool: verify that the device works and collect data along the way.'),
    explain: [
      loc('结构要方便改：电压、电流、时序都应该很容易调。', 'Its structure should be easy to modify: voltages, currents and timing should all be easy to adjust.'),
      loc('最好带一些快速调试的小例程，必要时也放几段表征例程。', 'Ideally it includes small routines for quick troubleshooting, and some characterization routines where needed.'),
      loc('它不追求快，追求的是“想改就改、想看就看”。', 'Speed is not the goal; the goal is "change anything, look at anything".'),
    ],
  },
  {
    id: 'char',
    title: loc('表征程序', 'Characterization program'),
    sub: loc('Characterization · 找极限', 'Characterization · find limits'),
    text: loc('目的是找出芯片的工作极限，通常是工程程序的扩展。', 'Its purpose is to find the device\'s operating limits; it is usually an extension of the engineering program.'),
    explain: [
      loc('尽量用测试机操作系统自带的例程，不要自己重写：Shmoo 图、电平搜索、时序搜索。', 'Use the routines built into the tester operating system rather than writing your own: Shmoo plots, level searches, timing searches.'),
      loc('它跑得慢没关系，要的是每个参数“到底能拉到哪里”。', 'Running slowly is fine; what matters is "how far each parameter can really go".'),
    ],
  },
  {
    id: 'prod',
    title: loc('量产程序', 'Production program'),
    sub: loc('Production · 分好坏', 'Production · sort good from bad'),
    text: loc('唯一目的：把坏片和好片分开。用于晶圆测试（Wafer Sort）、成品测试（Final Test）或 QA 抽检。', 'Its only purpose: separate bad devices from good ones. Used for wafer sort, final test or QA sampling.'),
    explain: [
      loc('必须尽可能快。测试时间就是成本。', 'It must be as fast as possible. Test time is cost.'),
      loc('工程程序的灵活性在这里被拿去换测试时间：能写死的写死，能合并的合并，Fail 了马上停。', 'Here the flexibility of the engineering program is traded for test time: hard-code what can be hard-coded, merge what can be merged, stop at the first Fail.'),
    ],
  },
]

export const COMPARE_ROWS: Array<{ id: string; label: LText; cells: [LText, LText, LText] }> = [
  {
    id: 'goal',
    label: loc('目的', 'Purpose'),
    cells: [loc('验证功能、收集信息', 'Verify function, collect data'), loc('找出工作极限', 'Find operating limits'), loc('分出好片和坏片', 'Sort good from bad')],
  },
  {
    id: 'flex',
    label: loc('灵活性', 'Flexibility'),
    cells: [loc('高：电压/电流/时序随手改', 'High: change V/I/timing freely'), loc('高：参数可扫描', 'High: parameters can be swept'), loc('低：参数基本写死', 'Low: parameters mostly fixed')],
  },
  {
    id: 'speed',
    label: loc('速度', 'Speed'),
    cells: [loc('不重要', 'Not important'), loc('慢（要扫很多点）', 'Slow (many points to sweep)'), loc('越快越好', 'The faster the better')],
  },
  {
    id: 'tool',
    label: loc('常用工具', 'Typical tools'),
    cells: [loc('调试例程、Datalog', 'Debug routines, datalog'), loc('Shmoo、电平搜索、时序搜索', 'Shmoo, level search, timing search'), loc('分 Bin、测试汇总', 'Binning, test summary')],
  },
]

/* ---------- 2. 开发前要想清楚的事 ---------- */

export const CONCERNS: Card[] = [
  {
    id: 'hw',
    title: loc('硬件限制', 'Hardware limits'),
    sub: loc('测试机够不够用', 'Is the tester capable?'),
    text: loc('看完规格书、画好测试时序图以后，先确认测试硬件能满足要求。', 'After reading the spec and drawing the test timing diagrams, first confirm the test hardware can meet the requirements.'),
    explain: [
      loc('测试速率（最高频率）够不够？输入、输出、VDD 的电压和电流范围够不够？', 'Is the test rate (maximum frequency) enough? Are the voltage and current ranges for inputs, outputs and VDD enough?'),
      loc('别忘了探针台（Prober）、分选机（Handler）和其它外部设备，它们也有自己的限制。', 'Do not forget the prober, handler and other external equipment; they have their own limits too.'),
    ],
  },
  {
    id: 'thru',
    title: loc('产能', 'Throughput'),
    sub: loc('Throughput', 'Throughput'),
    text: loc('估算芯片在目标测试机上的测试时间。量产以后每小时能测多少颗？', 'Estimate the device test time on the target tester. How many devices per hour can be tested in production?'),
    explain: [
      loc('如果芯片要大批量生产，而测试时间太长、产能跟不上，那可能该换一台测试机。', 'If the device will be produced in high volume but the test time is too long to keep up, it may be time for a different tester.'),
      loc('下面的计算器可以帮你算 UPH 和每颗的测试成本。', 'The calculator below works out UPH and test cost per device.'),
    ],
  },
  {
    id: 'avail',
    title: loc('机台可用性', 'Tester availability'),
    sub: loc('到时候有没有机器', 'Will a tester be free?'),
    text: loc('需要的时候，目标测试机有没有空？和它对接的探针台、分选机有没有空？', 'When you need it, will the target tester be available? And the prober and handler that dock to it?'),
    explain: [loc('程序写得再好，量产那天排不到机台也没用。提前确认，或者准备一个备选平台。', 'However good the program is, it is useless if no tester is free on production day. Confirm early, or prepare a backup platform.')],
  },
  {
    id: 'cost',
    title: loc('测试成本 vs 芯片价格', 'Test cost vs device price'),
    sub: loc('值不值得', 'Is it worth it?'),
    text: loc('选测试机时要算账：在一台很贵的测试机上测一颗很便宜的芯片，可能根本不划算。', 'Do the math when choosing a tester: testing a very cheap device on a very expensive tester may not pay at all.'),
    explain: [loc('测试成本 ≈ 机时费 ÷ 每小时测的颗数。它占芯片售价的比例越小越好。', 'Test cost ≈ tester hourly rate ÷ devices tested per hour. The smaller its share of the selling price, the better.')],
  },
]

/** 每颗测试成本占售价的比例阈值 */
export const COST_OK = 0.03
export const COST_BAD = 0.1

export const COST_HINT = {
  ok: loc('测试成本只占售价的一小部分，这台机器合适。', 'Test cost is only a small part of the price; this tester is a good fit.'),
  warn: loc('测试成本已经占到售价的 3% 以上，值得想办法：缩短测试时间、增加并测、或换便宜一点的平台。', 'Test cost is already over 3% of the price; worth acting on: shorten test time, test more sites in parallel, or move to a cheaper platform.'),
  bad: loc('测试成本超过售价的 10%，这颗芯片放在这台机器上测不划算。考虑更便宜的测试机、更多并测，或者大幅砍测试时间。', 'Test cost exceeds 10% of the price; testing this device on this tester does not pay. Consider a cheaper tester, more parallel sites, or a big cut in test time.'),
}

/* ---------- 3. 程序开头菜单 ---------- */

export type TestMode = 'sort' | 'final' | 'qa' | 'char'

export const MODES: Array<{ id: TestMode; label: LText }> = [
  { id: 'sort', label: loc('Wafer Sort', 'Wafer Sort') },
  { id: 'final', label: loc('Final Test', 'Final Test') },
  { id: 'qa', label: loc('QA Test', 'QA Test') },
  { id: 'char', label: loc('Characterization', 'Characterization') },
]

export const MODE_TEXT: Record<TestMode, LText> = {
  sort: loc('晶圆测试：在探针台上，用针卡扎每一颗 Die。', 'Wafer sort: on the prober, a probe card contacts each die.'),
  final: loc('成品测试：封装以后，在分选机上测。', 'Final test: after packaging, tested on the handler.'),
  qa: loc('QA 抽检：从已经测过的成品里抽样再测一遍，通常限值更严。', 'QA sampling: a sample of already tested parts is retested, usually with tighter limits.'),
  char: loc('表征：工程用，跑 Shmoo、搜索等慢例程。', 'Characterization: for engineering, runs slow routines such as Shmoo and searches.'),
}

export const TEMPS: string[] = ['-40', '25', '85', '125']
export const VERSIONS: string[] = ['Rev A', 'Rev B']

/** 负载板测试 / 诊断可能出现的故障，用来模拟“偶尔失败” */
export const LB_FAULTS: LText[] = [
  loc('继电器 K3 吸合后电阻过大', 'Relay K3 resistance too high when closed'),
  loc('A5 通道漏电超限', 'Channel A5 leakage over limit'),
  loc('上拉电阻 R12 读数偏离', 'Pull-up resistor R12 reading off nominal'),
]

export const DIAG_FAULTS: LText[] = [
  loc('通道 17 驱动器 / 比较器自环 Fail', 'Channel 17 driver / comparator loopback Fail'),
  loc('VIH 参考电压读数偏离 2.0 V', 'VIH reference voltage reading off 2.0 V'),
]

export const MENU_LOG = {
  lbPass: loc('负载板测试 PASS：全脚漏电、VDD / 地、继电器、外部电阻都正常。', 'Load board test PASS: all-pin leakage, VDD / ground, relays and external resistors are all OK.'),
  lbFail: loc('负载板测试 FAIL：{x}。请修好硬件后重跑。', 'Load board test FAIL: {x}. Fix the hardware and rerun.'),
  diagPass: loc('快速诊断 PASS：RVS 0.8 V / 2.0 V 全脚 DC 正常，驱动器-比较器自环正常。', 'Quick diagnostics PASS: RVS 0.8 V / 2.0 V all-pin DC OK, driver-comparator loopback OK.'),
  diagFail: loc('快速诊断 FAIL：{x}。不要开始测试。', 'Quick diagnostics FAIL: {x}. Do not start testing.'),
  start: loc('开始测试：{x}', 'Start testing: {x}'),
  needLb: loc('还没通过负载板测试。', 'Load board test not passed yet.'),
  needDiag: loc('还没通过快速诊断。', 'Quick diagnostics not passed yet.'),
  needInfo: loc('请填写 Lot 号、操作员和机台号。', 'Enter the lot number, operator and tester ID.'),
}

export const MENU_LEAD: LText[] = [
  loc('量产程序启动后先给操作员一个菜单：选测试类型（Wafer Sort、Final、QA、Characterization）、温度，必要时选器件版本。', 'When a production program starts, it first gives the operator a menu: choose the test type (Wafer Sort, Final, QA, Characterization), the temperature, and the device revision if needed.'),
  loc('同时记下 Lot 号、操作员 ID、测试机编号。菜单里也可以写上硬件安装的提示。', 'It also records the lot number, operator ID and tester number. The menu can include hardware setup hints too.'),
  loc('最关键的一条：测芯片之前，必须先跑负载板测试和快速诊断。程序要设计成——这两项不过，就不能开始测试。随时能重跑负载板测试也很有用。', 'Most important: before testing devices, the load board test and quick diagnostics must run first. Design the program so that testing cannot start unless both pass. Being able to rerun the load board test at any time is also very useful.'),
]

/* ---------- 4. 上电 / 下电 ---------- */

export type SeqMode = 'up' | 'down'
export type StepId = 'zero' | 'vdd' | 'vin' | 'load' | 'unload' | 'inzero' | 'vddoff' | 'drvoff'

/** drv：输入驱动器是否打开；vin：输入高电平 VIH；load：外部电路是否接上 */
export type PState = { drv: boolean; vdd: number; vin: number; load: boolean }

export const VDD_ON = 5
export const VIH_ON = 4
export const VEXT = 5
export const LATCH_MARGIN = 0.5
/** 每一步里电压爬升占这一步的比例 */
export const RAMP = 0.4

export const SEQ_STEPS: Record<StepId, { label: LText; text: LText }> = {
  zero: {
    label: loc('所有电源和输入置 0 V（打开驱动器）', 'All supplies and inputs to 0 V (drivers on)'),
    text: loc('先把所有电源和输入脚都钉在 0 V，而且输入驱动器要打开——否则输入是悬空的，电平不确定。', 'First hold all supplies and input pins at 0 V, with the input drivers on; otherwise the inputs float at an undefined level.'),
  },
  vdd: { label: loc('上 VDD', 'Apply VDD'), text: loc('VDD 从 0 升到 5 V。此时输入都在 0 V，不会高过 VDD。', 'VDD rises from 0 to 5 V. The inputs are all at 0 V, so none can exceed VDD.') },
  vin: { label: loc('设 VIL / VIH', 'Set VIL / VIH'), text: loc('VDD 已经稳定，再把输入参考电平设好（这里 VIH = 4 V）。4 V 低于 VDD + 0.5 V，安全。', 'With VDD stable, set the input reference levels (here VIH = 4 V). 4 V is below VDD + 0.5 V, so it is safe.') },
  load: { label: loc('接外部电路 / 负载', 'Connect external circuits / load'), text: loc('最后接上外部电路和负载（这里是上拉到 5 V 的外部电源）。', 'Finally connect the external circuits and load (here an external supply pulling up to 5 V).') },
  unload: { label: loc('断开负载 / 外部电路', 'Disconnect load / external circuits'), text: loc('下电第一步：先把输出负载和外部硬件断开，不让外部电源再往芯片管脚上灌电压。', 'First power-down step: disconnect the output loads and external hardware so no external supply keeps forcing voltage onto the device pins.') },
  inzero: { label: loc('输入归零', 'Inputs to 0 V'), text: loc('把输入电平降到 0 V。驱动器仍然开着，输入被钉在 0 V。', 'Lower the input levels to 0 V. The drivers stay on, holding the inputs at 0 V.') },
  vddoff: { label: loc('VDD 置 0 再断开', 'VDD to 0 V, then disconnect'), text: loc('输入已经是 0 V，现在把 VDD 设成 0 V，然后断开。', 'The inputs are already at 0 V; now set VDD to 0 V, then disconnect it.') },
  drvoff: { label: loc('关闭驱动器', 'Turn drivers off'), text: loc('测试结束，关掉测试机的输入驱动器。', 'Testing is done; turn off the tester\'s input drivers.') },
}

/** 打乱后的候选顺序（固定，避免每次渲染都变） */
export const SEQ_POOL: Record<SeqMode, StepId[]> = {
  up: ['vin', 'load', 'zero', 'vdd'],
  down: ['vddoff', 'drvoff', 'unload', 'inzero'],
}

export const SEQ_RIGHT: Record<SeqMode, StepId[]> = {
  up: ['zero', 'vdd', 'vin', 'load'],
  down: ['unload', 'inzero', 'vddoff', 'drvoff'],
}

export const SEQ_INIT: Record<SeqMode, PState> = {
  up: { drv: false, vdd: 0, vin: 0, load: false },
  down: { drv: true, vdd: VDD_ON, vin: VIH_ON, load: true },
}

export function applyStep(s: PState, id: StepId): PState {
  switch (id) {
    case 'zero':
      return { ...s, drv: true, vdd: 0, vin: 0 }
    case 'vdd':
      return { ...s, vdd: VDD_ON }
    case 'vin':
      return { ...s, vin: VIH_ON }
    case 'load':
      return { ...s, load: true }
    case 'unload':
      return { ...s, load: false }
    case 'inzero':
      return { ...s, vin: 0 }
    case 'vddoff':
      return { ...s, vdd: 0 }
    case 'drvoff':
      return { ...s, drv: false }
  }
}

export function buildStates(mode: SeqMode, order: StepId[]): PState[] {
  const list = [SEQ_INIT[mode]]
  order.forEach((id) => list.push(applyStep(list[list.length - 1], id)))
  return list
}

export type Sample = { t: number; vdd: number; vin: number | null; out: number; latch: boolean; float: boolean }

const lerp = (a: number, b: number, r: number) => a + (b - a) * r

/** 时间 t（单位：步）处的各脚电压。第 0 段是初始状态，第 k 段执行第 k 步 */
export function sampleAt(states: PState[], t: number): Sample {
  const n = states.length - 1
  const k = Math.max(0, Math.min(n, Math.floor(t)))
  let vdd: number
  let vin: number | null
  let out: number
  if (k === 0) {
    const s = states[0]
    vdd = s.vdd
    vin = s.drv ? s.vin : null
    out = s.load ? VEXT : 0
  } else {
    const a = states[k - 1]
    const b = states[k]
    const r = Math.min(1, Math.max(0, (t - k) / RAMP))
    vdd = lerp(a.vdd, b.vdd, r)
    if (!b.drv) vin = null
    else vin = a.drv ? lerp(a.vin, b.vin, r) : b.vin
    out = lerp(a.load ? VEXT : 0, b.load ? VEXT : 0, r)
  }
  const latch = (vin !== null && vin > vdd + LATCH_MARGIN + 1e-9) || out > vdd + LATCH_MARGIN + 1e-9
  const float = vin === null && vdd > LATCH_MARGIN
  return { t, vdd, vin, out, latch, float }
}

export const SEQ_LEAD: LText[] = [
  loc('CMOS 芯片上电要小心：任何管脚电压只要比 VDD 高、或比地低超过 0.5 V，就可能触发闩锁（Latch-up）。', 'Power up CMOS devices with care: if any pin goes more than 0.5 V above VDD or below ground, it may trigger latch-up.'),
  loc('闩锁会让芯片内部流过很大的电流，可能直接烧掉被测芯片。所以上电、下电都要按顺序来。', 'Latch-up drives a very large current through the device and can destroy the DUT outright. So both power-up and power-down must follow a sequence.'),
]

export const SEQ_MSG = {
  latch: loc('红色区域：输入或输出脚电压高于 VDD + 0.5 V——可能闩锁！', 'Red region: an input or output pin is above VDD + 0.5 V. Possible latch-up!'),
  float: loc('VDD 已上电，但输入驱动器没打开，输入悬空。CMOS 输入悬空会处在中间电平，可能出现大电流或振荡。', 'VDD is on but the input drivers are off, so the inputs float. A floating CMOS input sits at a mid level and may draw large current or oscillate.'),
  wrongEnd: loc('最后的状态不对：不是所有电压都到了该到的位置。', 'The final state is wrong: not every voltage ended where it should.'),
  order: loc('没有闩锁，但顺序和推荐的不一样。照推荐的顺序做，是最不容易出事的。', 'No latch-up, but the order differs from the recommended one. Following the recommended order is the least risky.'),
  ok: loc('顺序正确，全程没有任何管脚高于 VDD + 0.5 V。', 'Correct sequence: no pin ever went above VDD + 0.5 V.'),
}

/* ---------- 5. 分 Bin 与测试汇总 ---------- */

export type BinTest = { id: string; name: LText; bin: number; rate: number }

/** rate：每颗芯片在这一项上的失效概率（%），只在前面各项都 Pass 时才会测到 */
export const BIN_TESTS: BinTest[] = [
  { id: 'os', name: loc('开短路', 'Opens/shorts'), bin: 7, rate: 2 },
  { id: 'idd', name: loc('粗 IDD', 'Gross IDD'), bin: 6, rate: 1.5 },
  { id: 'func', name: loc('功能', 'Functional'), bin: 5, rate: 6 },
  { id: 'leak', name: loc('输入漏电', 'Input leakage'), bin: 4, rate: 2 },
  { id: 'vout', name: loc('VOH / VOL', 'VOH / VOL'), bin: 3, rate: 1.5 },
  { id: 'ac', name: loc('AC tPD', 'AC tPD'), bin: 2, rate: 3 },
]

export const BIN_LEAD: LText[] = [
  loc('量产时一旦某一项 Fail，通常同时做三件事：停止测试、更新测试汇总、选一个 Fail Bin。分选机或探针台按 Bin 号把芯片分到不同的料盒，或在晶圆图上打标记。', 'In production, once a test fails, three things usually happen together: stop testing, update the test summary, and select a Fail bin. The handler or prober uses the bin number to sort devices into different bins, or marks them on the wafer map.'),
  loc('所有测试都 Pass 的进 Bin 1（好片）。测完一批（一个 Lot）后，打出测试汇总：每个 Bin 多少颗、良率多少。', 'Devices that pass every test go to Bin 1 (good). After a lot is finished, a test summary is printed: how many devices in each bin and the yield.'),
]

export const BIN_WHO: LText[] = [
  loc('汇总给谁看？产品工程师、良率工程师、生产管理。它告诉大家这一批“死”在哪一项。', 'Who reads the summary? Product engineers, yield engineers, production management. It tells everyone which test this lot "died" on.'),
  loc('怎么帮助提良率？如果大部分 Fail 都集中在某一项（比如功能），就能对症下药：查这一项的工艺、设计余量，或者检查是不是测试本身太严、硬件有问题。', 'How does it help yield? If most failures cluster in one test (say functional), you can target it: check the process and design margin for that test, or whether the test itself is too tight or the hardware is faulty.'),
]

export const BIN_MASK = loc('注意：第一项 Fail 就停，所以排在后面的测试项只统计“前面都过了”的芯片。一颗功能 Fail 的芯片，漏电好不好你不知道。调大前面某项的失效率，后面各项的数量会跟着变少。', 'Note: testing stops at the first Fail, so later tests only count devices that "passed everything before". For a device that fails functional, you never learn whether its leakage is good. Raise the fail rate of an earlier test and the counts of later tests drop.')

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('工程程序要好改，表征程序要能扫极限，量产程序要快——灵活性换测试时间。', 'Engineering programs must be easy to modify, characterization programs must sweep to the limits, production programs must be fast: flexibility is traded for test time.'),
  loc('开发前先想清楚：硬件够不够、产能够不够、机台有没有、测试成本划不划算。', 'Before development, think it through: is the hardware enough, is the throughput enough, will a tester be available, does the test cost make sense?'),
  loc('负载板测试和快速诊断不过，程序就不允许开始测试。', 'If the load board test and quick diagnostics do not pass, the program must not allow testing to start.'),
  loc('上电：全部置 0（驱动器开）→ VDD → VIL/VIH → 负载；下电反过来。任何脚都不能高过 VDD 0.5 V。', 'Power-up: everything to 0 (drivers on) → VDD → VIL/VIH → load; power-down in reverse. No pin may go 0.5 V above VDD.'),
  loc('量产 Fail 即停、更新汇总、选 Fail Bin；汇总告诉你良率损失在哪。', 'In production: stop on Fail, update the summary, select a Fail bin; the summary tells you where yield is lost.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('工程测试程序有什么要求？', 'What is required of an engineering test program?'),
    options: [
      { id: 'a', text: loc('电压、电流、时序要容易修改，最好带快速调试例程，可以包含一些表征例程', 'Voltages, currents and timing must be easy to change, ideally with quick troubleshooting routines and possibly some characterization routines') },
      { id: 'b', text: loc('跑得越快越好，参数全部写死', 'Run as fast as possible with all parameters hard-coded') },
      { id: 'c', text: loc('只做好坏分选，不需要任何调试功能', 'Only sort good from bad, no troubleshooting features needed') },
      { id: 'd', text: loc('必须能在探针台和分选机上同时运行', 'Must run on the prober and handler at the same time') },
    ],
    answer: 'a',
    explain: loc('第一版程序是工程工具，用来验证功能、收集信息。它要的是灵活：想改什么就能改什么。', 'The first program is an engineering tool for verifying function and collecting data. What it needs is flexibility: change whatever you want.'),
  },
  {
    id: 'q2',
    prompt: loc('量产测试程序的目的是什么？它和工程程序有什么不同？', 'What is the purpose of a production test program, and how does it differ from an engineering program?'),
    options: [
      { id: 'a', text: loc('找出芯片的工作极限；比工程程序更灵活', 'Find the device\'s operating limits; more flexible than an engineering program') },
      { id: 'b', text: loc('把坏片和好片分开；要尽量快，用工程程序的灵活性去换测试时间', 'Separate bad devices from good; as fast as possible, trading the engineering program\'s flexibility for test time') },
      { id: 'c', text: loc('两者完全一样，只是名字不同', 'They are identical, only the name differs') },
      { id: 'd', text: loc('收集设计数据；比工程程序慢', 'Collect design data; slower than an engineering program') },
    ],
    answer: 'b',
    explain: loc('量产程序用于 Wafer Sort、Final、QA，唯一目的是分好坏。测试时间就是成本，所以牺牲灵活性换速度。', 'Production programs are used for wafer sort, final and QA, with the sole purpose of sorting good from bad. Test time is cost, so flexibility is sacrificed for speed.'),
  },
  {
    id: 'q3',
    prompt: loc('表征程序里最可能用到哪些测试机自带例程？', 'Which built-in tester routines are most likely used in a characterization program?'),
    options: [
      { id: 'a', text: loc('开短路和粗 IDD', 'Opens/shorts and gross IDD') },
      { id: 'b', text: loc('分 Bin 和打印测试汇总', 'Binning and printing the test summary') },
      { id: 'c', text: loc('Shmoo 图、电平搜索、时序搜索', 'Shmoo plots, level searches, timing searches') },
      { id: 'd', text: loc('负载板测试', 'Load board test') },
    ],
    answer: 'c',
    explain: loc('表征就是找极限，测试机自带的 Shmoo、电平搜索、时序搜索正是干这个的，应尽量直接用。', 'Characterization is about finding limits, and the tester\'s built-in Shmoo, level search and timing search do exactly that; use them directly whenever possible.'),
  },
  {
    id: 'q4',
    prompt: loc('开始开发测试程序之前要考虑很多问题。下面哪一组最完整？', 'Many issues must be considered before developing a test program. Which set is the most complete?'),
    options: [
      { id: 'a', text: loc('硬件限制、产能（测试时间）、机台可用性、测试成本和芯片价格的关系', 'Hardware limits, throughput (test time), tester availability, test cost relative to device price') },
      { id: 'b', text: loc('程序的文件名、注释风格、用哪个编辑器', 'Program file names, comment style, which editor to use') },
      { id: 'c', text: loc('只要确认芯片功能完整就行，别的量产时再说', 'Just confirm the device is fully functional; the rest can wait until production') },
      { id: 'd', text: loc('芯片封装颜色、料盒尺寸、标签格式', 'Package color, tray size, label format') },
    ],
    answer: 'a',
    explain: loc('教材列了四项：硬件（速率、电压电流、探针台/分选机）、产能、机台和配套设备是否可用、测试成本 vs 芯片价格。答出三项即可。', 'The textbook lists four: hardware (rate, voltage/current, prober/handler), throughput, availability of the tester and its equipment, and test cost vs device price. Naming three is enough.'),
  },
  {
    id: 'q5',
    prompt: loc('为什么负载板测试很重要？', 'Why is the load board test important?'),
    options: [
      { id: 'a', text: loc('它能代替开短路测试', 'It can replace the opens/shorts test') },
      { id: 'b', text: loc('它确认负载板和测试机本身是好的；否则 Fail 可能是硬件造成的，好片会被误判，坏片也可能被放过', 'It confirms the load board and tester themselves are good; otherwise a Fail may come from the hardware, good devices may be rejected and bad ones may slip through') },
      { id: 'c', text: loc('它能让芯片跑得更快', 'It makes the device run faster') },
      { id: 'd', text: loc('它只在表征时需要', 'It is only needed for characterization') },
    ],
    answer: 'b',
    explain: loc('测芯片之前先证明“尺子”是准的：继电器、电阻、漏电、VDD/地都正常，诊断也通过，测出来的结果才可信。', 'Before measuring devices, prove the "ruler" is accurate: relays, resistors, leakage and VDD/ground are all OK and diagnostics pass; only then are the results trustworthy.'),
  },
  {
    id: 'q6',
    prompt: loc('上电或下电顺序做错，可能发生什么？', 'What can happen if the power-up or power-down sequence is wrong?'),
    options: [
      { id: 'a', text: loc('测试时间稍微变长', 'Test time gets slightly longer') },
      { id: 'b', text: loc('读数有一点偏差，但没有危险', 'Readings are slightly off, but there is no danger') },
      { id: 'c', text: loc('CMOS 芯片闩锁，内部流过很大电流，可能烧毁被测芯片', 'The CMOS device latches up, a very large current flows inside, and the DUT may be destroyed') },
      { id: 'd', text: loc('分 Bin 出错', 'Binning goes wrong') },
    ],
    answer: 'c',
    explain: loc('任何脚高于 VDD 或低于地超过 0.5 V，都可能触发寄生 SCR，形成闩锁大电流。', 'Any pin more than 0.5 V above VDD or below ground can trigger the parasitic SCR, causing a large latch-up current.'),
  },
  {
    id: 'q7',
    prompt: loc('量产测试中出现 Fail 时，通常会做什么？', 'What usually happens when a Fail occurs during production testing?'),
    options: [
      { id: 'a', text: loc('停止测试', 'Stop testing') },
      { id: 'b', text: loc('更新测试汇总', 'Update the test summary') },
      { id: 'c', text: loc('选一个 Fail Bin', 'Select a Fail bin') },
      { id: 'd', text: loc('以上都是', 'All of the above') },
    ],
    answer: 'd',
    explain: loc('量产里 Fail 即停（省时间），同时计入汇总、把芯片分到对应的 Fail Bin，三件事一起做。', 'In production, testing stops on Fail (to save time), the result is added to the summary, and the device goes to the matching Fail bin: all three together.'),
  },
  {
    id: 'q8',
    prompt: loc('单颗测试 0.8 s，分选机换料 0.4 s，4 并测。理想情况下 UPH 是多少？', 'Test time is 0.8 s per insertion, handler index time is 0.4 s, 4 sites in parallel. What is the ideal UPH?'),
    options: [
      { id: 'a', text: loc('3000', '3000') },
      { id: 'b', text: loc('4500', '4500') },
      { id: 'c', text: loc('12000', '12000') },
      { id: 'd', text: loc('18000', '18000') },
    ],
    answer: 'c',
    explain: loc('每次插入 0.8 + 0.4 = 1.2 s，每小时 3600 / 1.2 = 3000 次，每次 4 颗，UPH = 12000。', 'Each insertion takes 0.8 + 0.4 = 1.2 s, so 3600 / 1.2 = 3000 insertions per hour; at 4 devices each, UPH = 12000.'),
  },
]
