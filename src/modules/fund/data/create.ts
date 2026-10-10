import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'
import { type Seg } from './func'

/* ---------- 1. 从规格书到测试计划 ---------- */

export const PLAN_LEAD: LText[] = [
  loc('写程序之前，把整本规格书仔细读一遍。边读边列出每一项测试，以及每一项的准确条件。尤其要真正弄懂芯片的时序。'),
  loc('确认手里是最新版：最后一刻改了规格或改了管脚排列，最好的计划也会泡汤。有不确定的地方，尽量当面问设计工程师。'),
]

export type CheckItem = { id: string; group: LText; label: LText; why: LText }

const G_NOTE = loc('做笔记')
const G_PWR = loc('电源与地')
const G_SPECIAL = loc('特殊情况')
const G_EXC = loc('备注与例外')

export const CHECKLIST: CheckItem[] = [
  {
    id: 'notes',
    group: G_NOTE,
    label: loc('准备一个笔记本 / 文件夹，记下想法、疑问和需要特殊处理的地方'),
    why: loc('读规格书时冒出来的疑问，过两天就忘了。把信息集中在一个地方，后面设计硬件、写程序时随时翻。'),
  },
  {
    id: 'hiI',
    group: G_PWR,
    label: loc('大电流器件：负载板要有专门的电源层和地层'),
    why: loc('电流大时，细走线上的压降和噪声会让芯片实际拿到的 VDD 不准。专门的电源 / 地平面阻抗低。'),
  },
  {
    id: 'hiV',
    group: G_PWR,
    label: loc('需要高 VDD 的管脚：和测试机驱动器、比较器隔离'),
    why: loc('超过管脚电子（Pin Electronics）承受范围的电压会损坏测试机通道，要用继电器或专门电源隔开。'),
  },
  {
    id: 'gnd',
    group: G_PWR,
    label: loc('确认测试机是驱动地（Driven / Buffered Ground）还是硬地（Hard Ground）'),
    why: loc('不同测试机的地不一样，有的两种都有。用哪一种要在规划初期就定下来，因为它影响负载板布线。'),
  },
  {
    id: 'sense',
    group: G_PWR,
    label: loc('有 Sense 线就要正确接到 DUT 附近'),
    why: loc('Sense 线监测芯片管脚处的真实电压，让电源补偿走线压降。接错或不接，DUT 上的电压就不准。'),
  },
  {
    id: 'decap',
    group: G_PWR,
    label: loc('考虑去耦电容，抑制 DUT 自己产生的电源噪声'),
    why: loc('芯片翻转时会从电源抽出尖峰电流。靠近管脚的去耦电容就地供电，避免 VDD 抖动导致误判。'),
  },
  {
    id: 'od',
    group: G_SPECIAL,
    label: loc('开漏输出需要上拉'),
    why: loc('开漏输出只能拉低，不能输出高电平。没有上拉电阻或电流负载，测出来永远不是“1”。'),
  },
  {
    id: 'idd',
    group: G_SPECIAL,
    label: loc('IDD 很大时：增加 VDD / 地的通路'),
    why: loc('一个管脚、一根线扛不住大电流，要多给几条并联通路。'),
  },
  {
    id: 'hv',
    group: G_SPECIAL,
    label: loc('需要高压信号进入测试模式、或给 EEPROM 编程'),
    why: loc('这类高压通常超过普通通道范围，需要额外的电源和切换电路，硬件设计时就要留出来。'),
  },
  {
    id: 'gbd',
    group: G_EXC,
    label: loc('标着“设计保证”（Guaranteed by Design）的参数不用测'),
    why: loc('设计保证的参数不需要上测试机，省测试时间。但要在文档里写清楚它没测、为什么没测。'),
  },
  {
    id: 'relax',
    group: G_EXC,
    label: loc('因夹具噪声需要放宽的参数，以及规格允许放宽多少'),
    why: loc('有些参数在测试夹具上测不了那么准，需要放宽。有的规格书会直接写明可以放宽多少。'),
  },
]

/* ---------- 2. 功能测试时序策略 ---------- */

export const TIMING_STEPS: LText[] = [
  loc('先定测试频率（Test Rate），以及时钟和控制信号放在周期里的什么位置。'),
  loc('再定时钟 / 控制信号的有效沿。'),
  loc('确定输入什么时候被读进（锁存）。'),
  loc('确定输出什么时候送出来。仔细看输出延迟参数——保证输出在本周期结束之前已经传到管脚上。'),
]

export const TIMING_LEAD: LText[] = [
  loc('功能测试的时序要逐条对照规格书，画成测试时序图。还要考虑测试机的速度、精度和资源数量——读一读测试机的规格。'),
  loc('不可能一次就把所有输入沿、信号格式和 AC 参数都测到。先做一套能跑粗功能测试的基本时序，跑通以后再慢慢加复杂度。'),
  loc('如果向量来自仿真，要看仿真用的时序：测试程序必须复现它。仿真时序应该符合规格书，也必须在测试机能力范围内。'),
]

export const CLK_EDGE = 10
export const OUT_BITS = [1, 0, 1, 0]

export function clkSegs(period: number, cycles: number): Seg[] {
  const segs: Seg[] = []
  for (let k = 0; k < cycles; k += 1) {
    const t0 = k * period
    segs.push({ x0: t0, x1: t0 + CLK_EDGE, level: 0 })
    segs.push({ x0: t0 + CLK_EDGE, x1: t0 + CLK_EDGE + period / 2, level: 1 })
    segs.push({ x0: t0 + CLK_EDGE + period / 2, x1: t0 + period, level: 0 })
  }
  return segs
}

/** 第 k 个周期的时钟沿锁存后，经过 tPD 输出 OUT_BITS[k] */
export function outSegs(period: number, tpd: number, cycles: number): Seg[] {
  const span = period * cycles
  const segs: Seg[] = []
  let cur = 0
  let level: Seg['level'] = 'z'
  for (let k = 0; k < cycles; k += 1) {
    const at = k * period + CLK_EDGE + tpd
    if (at >= span) break
    segs.push({ x0: cur, x1: at, level })
    cur = at
    level = OUT_BITS[k] as 0 | 1
  }
  segs.push({ x0: cur, x1: span, level })
  return segs.filter((s) => s.x1 > s.x0)
}

/** Strobe 时刻看到的输出：数字或 null（还没出来） */
export function sampleOut(period: number, tpd: number, k: number, strobe: number): number | null {
  const tt = k * period + strobe
  let got: number | null = null
  for (let j = 0; j < OUT_BITS.length; j += 1) {
    if (j * period + CLK_EDGE + tpd <= tt) got = OUT_BITS[j]
  }
  return got
}

export const TIMING_MSG = {
  cross: loc('输出有效时刻（时钟沿 + tPD）已经跨过周期边界：本周期的数据要到下一个周期才出来。要么加长周期，要么检查时序安排。'),
  early: loc('Strobe 比输出有效时刻还早，比到的是上一个周期的旧数据或者未定态。把 Strobe 往后挪。'),
  tight: loc('能 Pass，但 Strobe 离输出有效时刻不到 3 ns，余量太小，温度、电压一变就会 Fail。'),
  ok: loc('输出在周期结束前已经稳定，Strobe 落在有效区间里，余量充足。'),
}

export const HW_ADVICE: LText[] = [
  loc('时间允许的话，先只做手测用的硬件。初期调试时如果硬件要大改，还没做的针卡和接口板就不用跟着返工。'),
  loc('外部元件和连线越少越好。硬件在量产环境里“有自毁倾向”——能用测试机内部资源完成的，就别加外部电路。'),
  loc('回头翻一遍笔记：有没有需要特殊硬件的地方？现在就把细节定下来。'),
]

/* ---------- 3. 管脚映射与分组 ---------- */

export type PinFn = 'in' | 'out' | 'pwr'
export type PinErr = 'dup' | 'fn'

export type PinRow = {
  pin: number
  name: string
  fn: PinFn
  ch: string
  err?: PinErr
  fixFn?: PinFn
  fixCh?: string
}

export const PINS: PinRow[] = [
  { pin: 1, name: 'A3', fn: 'in', ch: 'CH04' },
  { pin: 2, name: 'A2', fn: 'in', ch: 'CH03' },
  { pin: 3, name: 'A1', fn: 'in', ch: 'CH02' },
  { pin: 4, name: 'A0', fn: 'in', ch: 'CH01' },
  { pin: 5, name: 'A5', fn: 'in', ch: 'CH06' },
  { pin: 6, name: 'A6', fn: 'in', ch: 'CH07' },
  { pin: 7, name: 'A7', fn: 'in', ch: 'CH08' },
  { pin: 8, name: 'GND', fn: 'pwr', ch: 'GND' },
  { pin: 9, name: 'D0', fn: 'in', ch: 'CH09' },
  { pin: 10, name: 'O0', fn: 'out', ch: 'CH13' },
  { pin: 11, name: 'D1', fn: 'in', ch: 'CH10' },
  { pin: 12, name: 'O1', fn: 'out', ch: 'CH10', err: 'dup', fixCh: 'CH14' },
  { pin: 13, name: 'D2', fn: 'in', ch: 'CH11' },
  { pin: 14, name: 'O2', fn: 'out', ch: 'CH15' },
  { pin: 15, name: 'D3', fn: 'in', ch: 'CH12' },
  { pin: 16, name: 'O3', fn: 'out', ch: 'CH16' },
  { pin: 17, name: 'CS2', fn: 'in', ch: 'CH18' },
  { pin: 18, name: 'OE', fn: 'out', ch: 'CH20', err: 'fn', fixFn: 'in' },
  { pin: 19, name: 'CS1', fn: 'in', ch: 'CH17' },
  { pin: 20, name: 'WE', fn: 'in', ch: 'CH19' },
  { pin: 21, name: 'A4', fn: 'in', ch: 'CH05' },
  { pin: 22, name: 'VDD', fn: 'pwr', ch: 'DPS1' },
]

export const FN_LABEL: Record<PinFn, LText> = {
  in: loc('输入'),
  out: loc('输出'),
  pwr: loc('电源'),
}

export const PIN_SIGNAL: Record<string, LText> = {
  A: loc('地址'),
  D: loc('数据输入'),
  O: loc('数据输出'),
  CS1: loc('片选 1（低有效）'),
  CS2: loc('片选 2（高有效）'),
  WE: loc('写使能'),
  OE: loc('输出使能'),
  VDD: loc('电源'),
  GND: loc('地'),
}

export function signalOf(name: string): LText {
  return PIN_SIGNAL[name] ?? PIN_SIGNAL[name[0]] ?? loc('—')
}

export type PinGroup = { id: string; name: string; label: LText; pins: string[] }

/** 按功能和信号名自动生成管脚组 */
export function buildGroups(rows: Array<{ name: string; fn: PinFn }>): PinGroup[] {
  const by = (test: (r: { name: string; fn: PinFn }) => boolean) => rows.filter(test).map((r) => r.name)
  return [
    { id: 'addr', name: 'ADDR', label: loc('地址输入'), pins: by((r) => r.fn === 'in' && /^A\d$/.test(r.name)) },
    { id: 'din', name: 'DIN', label: loc('数据输入'), pins: by((r) => r.fn === 'in' && /^D\d$/.test(r.name)) },
    { id: 'dout', name: 'DOUT', label: loc('数据输出（比较）'), pins: by((r) => r.fn === 'out') },
    { id: 'ctrl', name: 'CTRL', label: loc('控制输入'), pins: by((r) => r.fn === 'in' && !/^[AD]\d$/.test(r.name)) },
    { id: 'pwr', name: 'PWR', label: loc('电源 / 地'), pins: by((r) => r.fn === 'pwr') },
  ]
}

export const PIN_ERR_TEXT: Record<PinErr, LText> = {
  dup: loc('找到了：O1 和 D1 都写成了 CH10。一个测试机通道不能同时接两个器件脚。改成 CH14 以后，O0–O3 就是连续的 CH13–CH16。'),
  fn: loc('找到了：OE 是输出使能，是一个输入控制信号，却被标成了“输出”。结果它被自动分进 DOUT 组，测试机会去比较它而不是驱动它。改成“输入”后它回到 CTRL 组。'),
}

export const PIN_OK_TEXT = loc('这一行没问题。')

export const PIN_LEAD: LText[] = [
  loc('写程序的第一步：输入器件管脚到测试机的映射。每一行包括器件脚号、信号名、功能（输入、输出、I/O、电源）和对应的测试机通道。'),
  loc('每个管脚定义好以后，再按相近的特性（时序、电压、电流）建管脚组。这张表在整个开发过程中会被反复用到，输完一定要检查。'),
]

/* ---------- 4. 开发顺序 + 负载板测试 ---------- */

export const DEV_ORDER: LText[] = [
  loc('开短路（Opens / Shorts）'),
  loc('粗测 IDD（Gross IDD）'),
  loc('粗功能（Gross Functional）——到这里就够开始调试了'),
  loc('时间允许，再加输入漏电测试'),
]

export type LbNodeId = 'start' | 'leak' | 'pwr' | 'relay' | 'comp' | 'diag' | 'ok' | 'stop'

export const LB_NODES: Array<{ id: LbNodeId; label: LText; text: LText }> = [
  { id: 'start', label: loc('装上负载板（空座）'), text: loc('负载板测试在空座、不放芯片的情况下跑。每次换负载板、开班、出现可疑结果时都可以重跑。') },
  { id: 'leak', label: loc('全脚漏电'), text: loc('对每个通道做漏电测试。空座时应该几乎没有电流，有漏电说明负载板上有脏污、短路或元件坏了。') },
  { id: 'pwr', label: loc('VDD / 地'), text: loc('检查 VDD 和地的连接：电源能不能加上去、Sense 线是否接好、有没有对地短路。') },
  { id: 'relay', label: loc('继电器'), text: loc('逐个吸合、释放负载板上的继电器，确认每一个都能切换、接触电阻正常。') },
  { id: 'comp', label: loc('电阻等外部元件'), text: loc('测量上拉电阻、负载电阻、电容等外部元件的值，确认没有焊错、没有坏。') },
  { id: 'diag', label: loc('快速诊断'), text: loc('测试机快速自检：RVS 设 0.8 V / 2.0 V 用 DC 测全脚；再把驱动器和比较器自环做一遍功能自测。') },
  { id: 'ok', label: loc('全部 Pass → 可以放芯片'), text: loc('负载板和测试机都确认没问题，测芯片得到的 Fail 才能归到芯片身上。') },
  { id: 'stop', label: loc('Fail → 停，修好再重跑'), text: loc('任何一项 Fail 都不能开始测芯片。修好负载板或测试机后，从头重跑负载板测试。') },
]

export const LB_CHAIN: LbNodeId[] = ['start', 'leak', 'pwr', 'relay', 'comp', 'diag', 'ok']

export const LB_FAULTS: Array<{ id: 'none' | LbNodeId; label: LText }> = [
  { id: 'none', label: loc('负载板正常') },
  { id: 'leak', label: loc('某通道漏电') },
  { id: 'relay', label: loc('继电器坏了') },
  { id: 'comp', label: loc('上拉电阻焊错') },
  { id: 'diag', label: loc('测试机通道坏') },
]

export const DIAG_CARDS: Card[] = [
  {
    id: 'dc',
    title: loc('DC 诊断'),
    sub: loc('RVS 0.8 V / 2.0 V'),
    text: loc('把输入参考低电平（RVS 低）设为 0.8 V、高电平设为 2.0 V，用 DC 测量系统测每一个管脚。'),
    explain: [loc('每个通道驱动出来的电压都应该是 0.8 V 和 2.0 V。哪一路读数不对，就是那一路的驱动器或参考电源有问题。')],
  },
  {
    id: 'func',
    title: loc('功能自环'),
    sub: loc('驱动器 ↔ 比较器'),
    text: loc('把每个管脚的驱动器和比较器接在一起做自测：驱动器打 0/1，比较器就该读到同样的 0/1。'),
    explain: [loc('这是一个很快的全脚功能检查。哪个通道比不对，就说明它的驱动器、比较器或时序发生器有毛病。')],
  },
]

/* ---------- 5. 第一次跑程序 ---------- */

export type RunOption = { id: string; text: LText; ok: boolean; reply: LText }
export type RunStep = { id: string; title: LText; log: Array<string | LText>; ask: LText; options: RunOption[] }

export const RUN_STEPS: RunStep[] = [
  {
    id: 'hw',
    title: loc('硬件验证'),
    log: ['> LOADBOARD #LB-0256-01 built', '> PROGRAM sram256x4.prg compiled, 0 errors'],
    ask: loc('负载板做好了，程序也编译过了。第一件事做什么？'),
    options: [
      { id: 'a', text: loc('放一颗芯片，直接跑整个程序'), ok: false, reply: loc('硬件和测试机还没证明是好的，芯片 Fail 了你也分不清是谁的错。') },
      { id: 'b', text: loc('先跑完整的负载板测试，并确认测试机诊断通过'), ok: true, reply: loc('对。硬件和测试机完全正常之前，不要开始验证芯片程序。') },
      { id: 'c', text: loc('先跑粗功能，看看芯片活不活'), ok: false, reply: loc('还没确认接触、电流和硬件，就跑功能，太早了。') },
    ],
  },
  {
    id: 'empty',
    title: loc('空座跑开短路'),
    log: ['> LOADBOARD TEST ........ PASS', '> TESTER DIAGNOSTIC ..... PASS'],
    ask: loc('负载板和诊断都 Pass 了。下一步？'),
    options: [
      { id: 'a', text: loc('打开 Datalog，不放芯片（空座）跑开短路'), ok: true, reply: loc('对。先看空座时开短路是不是全部开路 Fail——这证明测试真的能发现“没接上”。') },
      { id: 'b', text: loc('放入芯片跑开短路'), ok: false, reply: loc('先空座跑一次：如果空座都能 Pass，这个测试本身就是坏的。') },
      { id: 'c', text: loc('跳过开短路，直接测 IDD'), ok: false, reply: loc('开短路永远是第一项，不能跳。') },
    ],
  },
  {
    id: 'emptyRes',
    title: loc('看空座结果'),
    log: [
      loc('> OPENS/SHORTS（空座）'),
      '  A0   -3.000 V  FAIL OPEN',
      '  A1   -3.000 V  FAIL OPEN',
      loc('  ...（其余信号脚相同）'),
      '  OE   -3.000 V  FAIL OPEN',
      '  20 / 20 FAIL',
    ],
    ask: loc('空座时所有信号脚都撞到 −3 V 钳位，判开路 Fail。这说明？'),
    options: [
      { id: 'a', text: loc('测试机坏了，需要报修'), ok: false, reply: loc('不是。空座本来就没有二极管可测，电流无路可走，撞钳位正是期望的结果。') },
      { id: 'b', text: loc('正常：空座每个脚都应该开路 Fail。现在放入芯片'), ok: true, reply: loc('对。每个脚都 Fail，说明开短路测试确实能抓到开路。') },
      { id: 'c', text: loc('把开路限值放宽到 −3.5 V，让它 Pass'), ok: false, reply: loc('千万别。空座就该 Fail，改限值等于把测试废掉。') },
    ],
  },
  {
    id: 'opens',
    title: loc('放芯片跑开短路'),
    log: ['> DEVICE INSERTED  S/N 0001'],
    ask: loc('芯片放好了。这次怎么跑？'),
    options: [
      { id: 'a', text: loc('跑完开短路这一项就停，仔细看每个脚的读数离限值有多远'), ok: true, reply: loc('对。不只看 Pass / Fail，还要确认读数稳稳落在限值中间；必要时调整限值。') },
      { id: 'b', text: loc('一口气跑完整个程序'), ok: false, reply: loc('后面的测试还没验证过，一口气跑完，出了问题不知道从哪一项开始错。') },
      { id: 'c', text: loc('只看最后的 PASS / FAIL 结论'), ok: false, reply: loc('读数贴着限值的 Pass 也是隐患。要看具体数值。') },
    ],
  },
  {
    id: 'idd',
    title: loc('粗测 IDD'),
    log: [
      '> OPENS/SHORTS  A0 -0.652 V  A1 -0.648 V ... OE -0.661 V   20/20 PASS',
      '> GROSS IDD  (limit 5.0 mA)',
      '  VDD  48.2 mA   FAIL',
    ],
    ask: loc('开短路读数都在 −0.65 V 左右，很健康。但粗 IDD 规格 5 mA，读到 48.2 mA。怎么办？'),
    options: [
      { id: 'a', text: loc('把限值改成 50 mA'), ok: false, reply: loc('读数大了近 10 倍，说明有严重问题。改限值只是把问题藏起来。') },
      { id: 'b', text: loc('认定这颗芯片是坏的，换一颗'), ok: false, reply: loc('还不能下结论——电流可能根本不是芯片吃的。') },
      { id: 'c', text: loc('取出芯片，空座再测一次 IDD'), ok: true, reply: loc('对。空座的读数应该是 0.0 mA。这一步能分清是芯片的问题还是硬件的问题。') },
    ],
  },
  {
    id: 'iddEmpty',
    title: loc('空座 IDD'),
    log: [loc('> GROSS IDD（空座）'), '  VDD  46.9 mA'],
    ask: loc('空座居然也有 46.9 mA。说明什么？'),
    options: [
      { id: 'a', text: loc('电流不是芯片吃的：负载板或电源通路有问题（如去耦电容击穿、电源接错），先修硬件'), ok: true, reply: loc('对。空座应为 0.0 mA，不是 0 就去查、去解决。修好后：空座 0.0 mA，放芯片 3.1 mA，PASS。') },
      { id: 'b', text: loc('芯片坏了'), ok: false, reply: loc('芯片都拿出来了，电流还在——跟芯片没关系。') },
      { id: 'c', text: loc('正常，测试机都有一点底电流'), ok: false, reply: loc('46.9 mA 可不是“一点”。空座读数应该是 0.0 mA。') },
    ],
  },
  {
    id: 'scope',
    title: loc('验证功能测试的设置'),
    log: [loc('> （硬件已修：更换了击穿的去耦电容 C7）'), '> GROSS IDD  3.1 mA  PASS'],
    ask: loc('开短路、IDD 都好了。功能测试之前还要做什么？'),
    options: [
      { id: 'a', text: loc('直接跑粗功能'), ok: false, reply: loc('先确认激励本身是对的，否则功能结果没有意义。') },
      { id: 'b', text: loc('循环跑向量，用示波器逐个通道看时序和电平；看 VDD 和地；检查上拉、负载有没有接好'), ok: true, reply: loc('对。每个信号都要看，可能的话连输出 Strobe 一起看。') },
      { id: 'c', text: loc('先跑漏电'), ok: false, reply: loc('漏电可以晚一点；功能之前要先确认时序和电平设置对。') },
    ],
  },
  {
    id: 'func',
    title: loc('第一次粗功能'),
    log: ['> FUNCTIONAL DATALOG ON', '> GROSS FUNCTIONAL  pattern sram_march.pat', loc('  PASS（第一次运行）')],
    ask: loc('第一次跑功能就 Pass 了！接下来？'),
    options: [
      { id: 'a', text: loc('出去吃披萨、喝啤酒庆祝'), ok: false, reply: loc('别急。第一次就 Pass 反而要警惕：没有 Fail 不代表测试做对了。') },
      { id: 'b', text: loc('取出芯片，空座再跑一次——应该 Fail'), ok: true, reply: loc('对。空座还 Pass，就说明程序根本没在比较。') },
      { id: 'c', text: loc('换下一颗芯片接着测'), ok: false, reply: loc('先证明测试本身有效，再测更多芯片。') },
    ],
  },
  {
    id: 'funcEmpty',
    title: loc('空座跑功能'),
    log: [loc('> GROSS FUNCTIONAL（空座）'), '  PASS'],
    ask: loc('空座居然也 Pass。说明？'),
    options: [
      { id: 'a', text: loc('程序一定有问题：比如输出被屏蔽（Mask）了、比较器没打开、Strobe 没生效。回头查程序'), ok: true, reply: loc('对。该 Fail 的必须 Fail。修好后空座全部输出 Fail，再放芯片跑。') },
      { id: 'b', text: loc('正常，空座本来就该 Pass'), ok: false, reply: loc('空座没有芯片驱动输出，比较器不可能读到正确的数据，必须 Fail。') },
      { id: 'c', text: loc('测试机坏了'), ok: false, reply: loc('诊断刚刚 Pass，更大的可能是程序本身。') },
    ],
  },
  {
    id: 'pattern',
    title: loc('看 Fail 的规律'),
    log: [
      '> GROSS FUNCTIONAL  S/N 0001   FAIL',
      '  VEC   PIN  EXP  GOT',
      '  0012  O0   H    L',
      '  0012  O2   H    L',
      '  0013  O1   H    L',
      '  0015  O3   H    L',
      loc('  ...（全部失效都是期望 H、读到 L）'),
    ],
    ask: loc('程序修好以后放芯片，这次 Fail 了。所有失效都是“期望 H，读到 L”，四个输出脚都有。先怀疑什么？'),
    options: [
      { id: 'a', text: loc('芯片全坏了，换一批'), ok: false, reply: loc('失效这么整齐，更像是测试设置的共同因素。') },
      { id: 'b', text: loc('只有逻辑 1 错：先查和“1”有关的共同因素——VOH 比较电平设得太高、负载电流太大、Strobe 太早'), ok: true, reply: loc('对。先找规律：只错 1？只错 0？只错某条总线？是不是从第一个向量就错（可能是初始化问题）？') },
      { id: 'c', text: loc('把期望值都改成 L'), ok: false, reply: loc('改期望值让测试 Pass，等于不测。') },
    ],
  },
  {
    id: 'leak',
    title: loc('漏电测试'),
    log: [
      loc('> GROSS FUNCTIONAL   FAIL（vec 0203，和 A3 有关）'),
      '> INPUT LEAKAGE  (limit ±10 µA)',
      '  A3  IIH  +85.0 µA  FAIL',
    ],
    ask: loc('功能还有个别 Fail，漏电测试 A3 也 Fail。先查哪个？'),
    options: [
      { id: 'a', text: loc('先查功能'), ok: false, reply: loc('漏电问题可能正是功能 Fail 的原因。') },
      { id: 'b', text: loc('先查漏电'), ok: true, reply: loc('对。A3 有 85 µA 漏电，可能把输入电平拉偏，导致功能 Fail。解决漏电往往能改善功能结果。') },
    ],
  },
  {
    id: 'designer',
    title: loc('向量还在 Fail'),
    log: [
      loc('> （清洁了 Socket 上的脏污）'),
      '> INPUT LEAKAGE  20/20 PASS',
      loc('> GROSS FUNCTIONAL  FAIL  vec 1203 .. 1210，只有 O2'),
    ],
    ask: loc('漏电解决了。功能只剩向量 1203–1210 的 O2 Fail，向量是设计工程师仿真导出的。怎么办？'),
    options: [
      { id: 'a', text: loc('把这几个向量删掉'), ok: false, reply: loc('删向量就是少测功能，问题可能被带进量产。') },
      { id: 'b', text: loc('尽量多收集 Datalog，和设计工程师一起看；核对仿真时序和测试程序时序是否一致'), ok: true, reply: loc('对。跑完所有向量、把结果存下来离线分析；把程序在做什么讲清楚，确认仿真时序和测试时序一样。') },
      { id: 'c', text: loc('把 O2 的比较屏蔽掉'), ok: false, reply: loc('屏蔽掉就永远发现不了问题。') },
    ],
  },
]

export const RUN_DONE = loc('第一次跑程序的流程走完了：硬件 → 空座开短路 → 开短路读数 → 粗 IDD（空座对照）→ 示波器验证 → 粗功能（空座对照）→ 看 Fail 规律 → 漏电 → 和设计一起看向量。')

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('先把规格书读透，列出每一项测试和条件；电源、地、特殊情况、例外都记在笔记里。'),
  loc('时序先求能跑：频率和时钟 → 有效沿 → 输入锁存 → 输出有效，输出必须在周期结束前出来。'),
  loc('管脚映射表要反复检查，管脚组从它生成，错一个处处错。'),
  loc('先写负载板测试；硬件和测试机没证明是好的，不要调程序。'),
  loc('每一步都用空座做对照：开短路应全 Fail、IDD 应为 0、功能应 Fail。第一次就 Pass 要警惕。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('调试一个新测试程序时，最先跑的应该是哪一项？'),
    options: [
      { id: 'a', text: loc('开短路测试') },
      { id: 'b', text: loc('负载板测试') },
      { id: 'c', text: loc('粗 IDD 测试') },
      { id: 'd', text: loc('粗功能测试') },
    ],
    answer: 'b',
    explain: loc('在验证芯片程序之前，先要确认负载板测试正常、测试机诊断通过。开短路是放芯片以后的第一项。'),
  },
  {
    id: 'q2',
    prompt: loc('粗 IDD 测试（Gross IDD）在这个阶段的目的是什么？'),
    options: [
      { id: 'a', text: loc('精确测出 IDD，写进规格书') },
      { id: 'b', text: loc('及早发现严重问题，比如电流大了一个数量级；再用空座对照分清是芯片还是硬件') },
      { id: 'c', text: loc('代替功能测试') },
      { id: 'd', text: loc('给芯片预热') },
    ],
    answer: 'b',
    explain: loc('它是一个“报警器”：规格 5 mA 读到 48 mA 就说明有大问题。空座读数应为 0.0 mA，用来判断问题在不在芯片上。'),
  },
  {
    id: 'q3',
    prompt: loc('测第一颗芯片之前，怎样验证功能测试的设置？'),
    options: [
      { id: 'a', text: loc('看程序代码，没有语法错误就行') },
      { id: 'b', text: loc('直接跑，Pass 就说明设置对') },
      { id: 'c', text: loc('循环跑向量，用示波器看每个测试机通道的时序和电压、VDD 和地，确认上拉和负载接好并工作正常') },
      { id: 'd', text: loc('请设计工程师确认向量就行') },
    ],
    answer: 'c',
    explain: loc('每个信号都要亲眼看，可能的话连输出 Strobe 也看。激励对了，功能结果才有意义。'),
  },
  {
    id: 'q4',
    prompt: loc('第一次跑功能测试就 Pass，应该怎么做？'),
    options: [
      { id: 'a', text: loc('出去吃披萨、喝啤酒') },
      { id: 'b', text: loc('取出芯片，空座再跑一次') },
      { id: 'c', text: loc('测另一颗芯片') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('没有 Fail 不保证测试做对了。空座应该 Fail；如果还是 Pass，说明程序有明显错误。披萨和啤酒等真正调通再说。'),
  },
  {
    id: 'q5',
    prompt: loc('功能测试 Fail，输入漏电测试也 Fail，先调哪一个？'),
    options: [
      { id: 'a', text: loc('功能') },
      { id: 'b', text: loc('输入漏电') },
    ],
    answer: 'b',
    explain: loc('漏电可能就是功能 Fail 的原因（输入被拉偏、接触脏污等）。先解决漏电，功能结果常常跟着变好。'),
  },
  {
    id: 'q6',
    prompt: loc('管脚表里 OE 被误标为“输出”，按功能自动建组以后会发生什么？'),
    options: [
      { id: 'a', text: loc('什么也不会发生') },
      { id: 'b', text: loc('OE 被分进输出比较组，测试机去比较它而不是驱动它，芯片输出无法使能') },
      { id: 'c', text: loc('只会影响开短路测试') },
    ],
    answer: 'b',
    explain: loc('管脚组是从映射表生成的，一处错，处处错。所以输完映射表一定要检查。'),
  },
]
