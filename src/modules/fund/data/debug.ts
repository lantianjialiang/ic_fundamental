import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------------- 1. 四个嫌疑对象 ---------------- */

export type SuspectId = 'dut' | 'iface' | 'tester' | 'prog'

export const SUSPECT_LEAD: LText[] = [
  loc('产线上测试一 Fail，机台就停着，停一分钟都是钱。可能的原因太多，不知道从哪下手——所以先把范围缩到四个嫌疑对象。'),
  loc('要么直接找到真凶，要么排除掉其中三个，剩下那个就是。两条路都能把问题找出来。'),
]

export const SUSPECTS: Array<Card & { id: SuspectId }> = [
  {
    id: 'dut',
    title: loc('DUT（被测芯片）'),
    sub: loc('芯片本身坏了'),
    text: loc('芯片真的有缺陷：输入漏电大、输出驱动不够、内部功能错。这是测试本来就想抓的东西。'),
    explain: [
      loc('最便宜的排除方法：把芯片取出来空座重测，或者换一颗已知是好的标准品（Standard Device）来测。'),
      loc('如果标准品 Pass，测试环境就是好的，坏的是这颗芯片。'),
    ],
  },
  {
    id: 'iface',
    title: loc('接口硬件'),
    sub: loc('负载板 · 插座 · Pogo'),
    text: loc('Pin Electronics 和 DUT 之间的所有东西：负载板、测试座、Pogo Pin；晶圆测试时还有探针卡，用 Handler 时还有 Handler 接口。'),
    explain: [
      loc('脏污、受潮、继电器粘住、元件坏、Pogo 弯了，都会漏电或接触不良。'),
      loc('排除方法：程序里的负载板自测（Loadboard Test）；或者把接口硬件整个拆掉，直接在测试头上重测。'),
    ],
  },
  {
    id: 'tester',
    title: loc('测试机'),
    sub: loc('PMU · 通道 · 电源'),
    text: loc('测试机自己的硬件：某个通道的 PMU 漏电、驱动器坏、电源不准。'),
    explain: [
      loc('排除方法：把程序和负载板搬到另一台测试机上试；或者跑测试机诊断（Diagnostics）。'),
      loc('报修测试机要放在最后，确认别的都排除了再叫维护部门。'),
    ],
  },
  {
    id: 'prog',
    title: loc('测试程序'),
    sub: loc('内存损坏 · 加载选项'),
    text: loc('“软件又不会坏”？会。程序和向量存在测试机内存里，电源噪声、接触松动都可能把它弄坏；加载时选错封装、选错测试类型，管脚映射就全错了。'),
    explain: [
      loc('排除方法：重新加载程序。注意程序名和版本都要对，加载时问的每个问题都要答对。'),
      loc('程序名很容易敲错：正确的是 L17279B，手一滑就成了 L17297B。'),
    ],
  },
]

export const FIRST_STEP = loc('第一步永远一样：打开 Datalog 重跑一遍，看实测值到底是多少。再想想这一项是怎么测的（加压测流还是加流测压），和一个通过的读数比一比。')

/* ---------------- 2. 限值失效 vs 灾难性失效 ---------------- */

export type FailKind = 'limit' | 'cata'

export const KIND_TEXT: Record<FailKind, LText> = {
  limit: loc('限值失效（Marginal）：读数是“合理的”，只是差一点没过线。芯片基本在工作，要查的是芯片性能、条件和限值。'),
  cata: loc('灾难性失效（Catastrophic）：读数离谱——正好等于钳位、等于量程最大值、全 0、符号反了。多半是有东西没接上、没设对，先找原因，不要先怀疑芯片性能。'),
}

export const LOG_ROWS: Array<{
  id: string
  test: string
  pin: string
  value: string
  limit: string
  answer: FailKind
  why: LText
}> = [
  {
    id: 'r1',
    test: 'IIH',
    pin: 'A3',
    value: '+1.08 µA',
    limit: '≤ 1.00 µA',
    answer: 'limit',
    why: loc('只超了 8%，读数是合理的漏电。和通过的芯片、历史 Datalog 比一比：是这颗偏大，还是限值太紧、温度不对。'),
  },
  {
    id: 'r2',
    test: 'IIL',
    pin: 'A5',
    value: '−10.00 µA',
    limit: '≥ −1.00 µA',
    answer: 'cata',
    why: loc('正好等于 ±10 µA 量程的满刻度——测量“顶格”了，真实电流可能大得多。像是管脚对地短路或接了不该接的东西。'),
  },
  {
    id: 'r3',
    test: 'Continuity',
    pin: 'CS',
    value: '−3.000 V',
    limit: '−1.5 ~ −0.2 V',
    answer: 'cata',
    why: loc('正好等于 PMU 的 −3 V 钳位。电流没有通路：开路、探针没扎上、插座接触不良。'),
  },
  {
    id: 'r4',
    test: 'VOL @ 8 mA',
    pin: 'D2',
    value: '0.43 V',
    limit: '≤ 0.40 V',
    answer: 'limit',
    why: loc('输出低电平只高了 30 mV。输出在工作，只是驱动略弱，或者负载电流、VDD 条件偏严。'),
  },
  {
    id: 'r5',
    test: 'VOH @ −4 mA',
    pin: 'D0–D7',
    value: '0.000 V',
    limit: '≥ 2.40 V',
    answer: 'cata',
    why: loc('8 个输出全是 0：不可能 8 个驱动同时坏。更像是预置向量没跑、输出没被使能，或 VDD 根本没加上。'),
  },
  {
    id: 'r6',
    test: 'IDD',
    pin: 'VDD',
    value: '−0.42 mA',
    limit: '2 ~ 25 mA',
    answer: 'cata',
    why: loc('电源电流是负的：电流从芯片往电源里倒灌。常见原因是输入电平比 VDD 还高，经保护二极管反向供电；或者程序把电源设错了。'),
  },
  {
    id: 'r7',
    test: 'VOH @ −4 mA',
    pin: 'D5',
    value: '2.37 V',
    limit: '≥ 2.40 V',
    answer: 'limit',
    why: loc('差 30 mV，一个脚、合理数值。典型的边缘失效，看看其它芯片的 D5 是不是也在边上。'),
  },
  {
    id: 'r8',
    test: 'tPD',
    pin: 'Q0',
    value: '15.4 ns',
    limit: '≤ 15.0 ns',
    answer: 'limit',
    why: loc('慢了 0.4 ns。时序在工作，只是偏慢。用 Search 找出真实值，再用 Shmoo 看它随 VDD 的变化。'),
  },
]

/* ---------------- 3. 从哪里开始 ---------------- */

export const BEGIN_LEAD = loc('从哪下手，取决于三件事：哪项在 Fail？这个程序和这个产品以前的历史？现在已经知道了什么？先看 DC、AC 还是功能 Fail，只挂一项还是一大片，只挂一个脚还是很多脚。一次只解决一个问题。')

export const ON_TESTER: Card[] = [
  {
    id: 'hw',
    title: loc('查测试硬件'),
    sub: loc('跑负载板自测'),
    text: loc('程序应该带一个负载板测试，先跑它。硬件合格才往下走。必要时把负载板拆下来重新装一次。'),
  },
  {
    id: 'std',
    title: loc('测标准品'),
    sub: loc('已知是好的芯片'),
    text: loc('拿一颗已知好的芯片测一遍，和失效读数比差别。再问一句：这个产品以前在这台测试机上测通过吗？'),
  },
  {
    id: 'basic',
    title: loc('核对基本项'),
    sub: loc('版本 · 方向 · 输入数据'),
    text: loc('程序版本对不对？芯片版本对不对？芯片在座子里放的方向对不对？程序需要的数据输入对了没有？'),
  },
  {
    id: 'scope',
    title: loc('示波器 + DVM'),
    sub: loc('停在失败项逐脚看'),
    text: loc('诊断通过、标准品也 Fail、版本都对——挑一项盯住。停在失败项，用 DVM 确认 VDD 和输入电平，用示波器确认时序，每个管脚都看，找噪声和不对的电平。'),
  },
  {
    id: 'relax',
    title: loc('放宽参数'),
    sub: loc('VIL/VIH/VOL/VOH/时序'),
    text: loc('把电平和时序放宽，让芯片更容易通过，再测。结果变了没有？变了，说明问题和这个参数有关。'),
  },
  {
    id: 'other',
    title: loc('换一台测试机'),
    sub: loc('结果一样就不是测试机'),
    text: loc('能换就换。结果一样，就不是测试机的问题；换了通过，把第一台的现象讲清楚交给维护部门。'),
  },
  {
    id: 'os',
    title: loc('先让开短路通过'),
    sub: loc('再看输入漏电'),
    text: loc('开短路 Fail，芯片不可能正常工作。很多项一起 Fail 时，先把开短路弄通过，再看输入漏电。'),
  },
  {
    id: 'maint',
    title: loc('最后才报修'),
    sub: loc('完整诊断'),
    text: loc('没有别的测试机可换，上面都试过还是不行，才请维护部门跑完整诊断。'),
  },
]

export const HABITS: Card[] = [
  {
    id: 'offline',
    title: loc('Datalog 离线看'),
    text: loc('把 Datalog 打到文件或打印机，拿回座位慢慢看。不要占着昂贵的机台盯屏幕。通过和失败的项都要记。'),
  },
  {
    id: 'all',
    title: loc('看所有项'),
    text: loc('通过的项里也有线索：IDD 对不对？输入漏电有没有 Fail？VOL/VOH 看起来正常吗？DC 失效是限值型还是灾难型？'),
  },
  {
    id: 'history',
    title: loc('以前通过过吗'),
    text: loc('找出这一项通过时的 Datalog，把所有项逐一对比。'),
  },
  {
    id: 'time',
    title: loc('限时 2–3 小时'),
    text: loc('一个问题在机台上耗了两三个小时还没头绪，就停下来，休息一下，找同事讨论。'),
  },
  {
    id: 'review',
    title: loc('请同事复查'),
    text: loc('程序刚调试时就 Fail，收集尽量多的数据回座位把自己的工作全查一遍。讲给另一位工程师听，常常讲着讲着就找到了。'),
  },
]

/* ---------------- 4. IIL/IIH 排错游戏 ---------------- */

export type Cause = 'dut' | 'board' | 'tester' | 'prog'
export type ProgSub = 'mem' | 'pkg'
export type ProgState = 'bad' | 'ok' | 'wrongName' | 'wrongPkg'

export type Game = { cause: Cause; sub: ProgSub; pin: string; prog: ProgState }

export const PROG_RIGHT = 'L17279B'
export const PROG_WRONG = 'L17297B'
export const PKG_RIGHT = '84'
export const PKG_WRONG = '64'
export const LIMIT_UA = 1
export const RANGE_UA = 100

const PINS = ['A3', 'B1', 'CS', 'WE', 'D4']
const CAUSES: Cause[] = ['dut', 'board', 'tester', 'prog']

export function newGame(): Game {
  const cause = CAUSES[Math.floor(Math.random() * CAUSES.length)]
  const sub: ProgSub = Math.random() < 0.5 ? 'mem' : 'pkg'
  const pin = PINS[Math.floor(Math.random() * PINS.length)]
  return { cause, sub, pin, prog: cause === 'prog' ? 'bad' : 'ok' }
}

/** 一次实验的硬件配置 */
export type Rig = { dut: 'bad' | 'std' | 'none'; iface: boolean; tester: 'A' | 'B' }

export type ActionId = 'retest' | 'empty' | 'noIface' | 'std' | 'other' | 'diag' | 'reload'

export const ACTIONS: Array<{ id: ActionId; label: LText; min: number; rig?: Rig }> = [
  { id: 'retest', label: loc('原样重测'), min: 1, rig: { dut: 'bad', iface: true, tester: 'A' } },
  { id: 'empty', label: loc('取出芯片，空座重测'), min: 1, rig: { dut: 'none', iface: true, tester: 'A' } },
  { id: 'noIface', label: loc('拆掉接口硬件重测'), min: 15, rig: { dut: 'none', iface: false, tester: 'A' } },
  { id: 'std', label: loc('换标准品测'), min: 2, rig: { dut: 'std', iface: true, tester: 'A' } },
  { id: 'other', label: loc('带上芯片和负载板，换一台测试机'), min: 30, rig: { dut: 'bad', iface: true, tester: 'B' } },
  { id: 'diag', label: loc('跑测试机诊断'), min: 60 },
  { id: 'reload', label: loc('重新加载程序'), min: 5 },
]

export type Reading = { ua: number; over: boolean; garbage: boolean }

/** 按隐藏原因给出这次实验的漏电读数 */
export function measureLeak(game: Game, rig: Rig): Reading {
  // 换机台时程序在 B 上重新加载：内存损坏消失，但加载时的封装选项会被照抄
  const prog = rig.tester === 'B' && game.prog === 'bad' && game.sub === 'mem' ? 'ok' : game.prog
  if (prog === 'wrongName') return { ua: 0, over: false, garbage: true }
  const present = rig.iface && rig.dut !== 'none'
  let ua = 0.02
  if (present && prog === 'bad') ua += game.sub === 'mem' ? 57.2 : RANGE_UA
  if (present && prog === 'wrongPkg') ua += RANGE_UA
  if (game.cause === 'board' && rig.iface) ua += 12.4
  if (game.cause === 'tester' && rig.tester === 'A') ua += 25.3
  if (game.cause === 'dut' && rig.dut === 'bad' && present) ua += 38.6
  if (ua >= RANGE_UA) return { ua: RANGE_UA, over: true, garbage: false }
  return { ua, over: false, garbage: false }
}

export function readingPass(r: Reading) {
  return !r.garbage && !r.over && r.ua <= LIMIT_UA
}

export const CLUE: Record<Exclude<ActionId, 'reload' | 'diag'>, { pass: LText; fail: LText }> = {
  retest: {
    pass: loc('原样重测通过了。如果刚才重新加载过程序，说明问题出在程序上。'),
    fail: loc('还是 Fail。原样重测只能确认现象稳定，提供不了新信息。'),
  },
  empty: {
    pass: loc('空座电流消失：漏电只在插座里有芯片时出现。可能是芯片坏了，也可能是程序让芯片处在不该有的状态。'),
    fail: loc('座子里没有芯片还在漏：问题不在芯片，在接口硬件、测试机或程序之外的路径上。'),
  },
  noIface: {
    pass: loc('拆掉接口硬件就不漏了：负载板、座子或 Pogo 可疑。'),
    fail: loc('直接在测试头上还在漏：测试机通道可疑。'),
  },
  std: {
    pass: loc('标准品通过：测试机、接口硬件、程序都是好的，坏的是这颗芯片。'),
    fail: loc('标准品也 Fail：问题不在这颗芯片，在测试环境（接口、测试机或程序）里。'),
  },
  other: {
    pass: loc('换机台通过：原机台可疑。但别忘了，换机台时程序也是重新加载的——内存损坏也会在这里“消失”。'),
    fail: loc('换了测试机还是 Fail：不是原测试机的问题。'),
  },
}

export const GARBAGE = loc('读数没有意义：加载的是 L17297B——另一个产品的程序，开短路大面积 Fail。按工单重新加载 L17279B。')
export const DIAG_PASS = loc('诊断 PASS：测试机硬件正常。（花了 1 小时机台时间。）')
export const DIAG_FAIL = loc('诊断 FAIL：通道 37 PMU 漏电超标。测试机硬件有问题，交给维护部门。')

export const CAUSE_LABEL: Record<Cause, LText> = {
  dut: loc('DUT 坏了'),
  board: loc('负载板漏电'),
  tester: loc('测试机通道坏了'),
  prog: loc('测试程序有问题'),
}

export const SUB_TEXT: Record<ProgSub, LText> = {
  mem: loc('这一局是：测试机内存里的程序数据被电源噪声弄坏了，输入电平被改成了异常值，芯片的保护二极管被推着导通。'),
  pkg: loc('这一局是：加载程序时把封装选成了 64 脚（这颗是 84 脚），管脚映射全错，被测通道其实接在芯片的电源脚上，读数顶到量程。'),
}

export const SHORTEST: Record<Cause, LText> = {
  dut: loc('最短路径：换标准品测（2 分钟）。标准品 Pass，说明测试机、接口、程序全是好的，坏的只能是这颗芯片。也可以先空座重测再测标准品来确认。'),
  board: loc('最短路径：空座重测还漏（不是芯片）→ 拆掉接口硬件重测不漏（不是测试机）→ 接口硬件。约 16 分钟。'),
  tester: loc('最短路径：空座重测还漏 → 拆掉接口硬件还漏 → 测试机。约 16 分钟，然后再跑诊断确认坏通道，交给维护。'),
  prog: loc('最短路径：空座重测不漏（像是芯片坏）→ 但标准品也 Fail（又不像芯片坏）→ 两条线索矛盾，嫌疑落到程序 → 按工单选 L17279B、84 脚重新加载 → 原样重测通过。约 9 分钟。'),
}

/* ---------------- 5. 调试工具 ---------------- */

export const TOOLS: Card[] = [
  {
    id: 'scopeTool',
    title: loc('Scope Tool'),
    sub: loc('循环 + 同步标记'),
    text: loc('让一段功能向量循环跑，并在指定向量地址上输出一个同步（Sync）脉冲给示波器触发。可以从任意地址开始、停止，可以忽略失败。'),
    explain: [
      loc('有了稳定的触发点，示波器就能看清每个脚的时序和电平。验证新程序、查测试问题都靠它。'),
      loc('这一招必须练熟。'),
    ],
  },
  {
    id: 'shmoo',
    title: loc('Shmoo'),
    sub: loc('扫两个参数画 P/F 图'),
    text: loc('扫两个参数（例如 VDD 和时序），每个点记 Pass / Fail，画出芯片能工作的区域。可以从键盘手动跑，也可以写进程序。'),
    explain: [
      loc('用来调试问题、找工作边界，也是特性程序的核心。DC 和功能测试都能用。'),
      loc('缺点是点数多、跑得慢。'),
    ],
  },
  {
    id: 'search',
    title: loc('Search'),
    sub: loc('二分 / 线性'),
    text: loc('对 DC 或功能测试做二分（Binary）或线性（Linear）搜索：快速看一眼输入/输出门限，或者精确测出某个时序参数。'),
    explain: [
      loc('二分：每次把范围砍一半，次数少；线性：按步长一点点走，慢但能看到中途的反复。'),
    ],
  },
  {
    id: 'resource',
    title: loc('直接改测试机资源'),
    sub: loc('暂停 · 改参数 · Execute'),
    text: loc('电源、输入参考电平、比较电平、时序、功能数据都能从工作站键盘直接读、直接改。'),
    explain: [
      loc('调试时：暂停在失败项上，改相关参数，按 Execute 看结果变不变；需要时用示波器确认。'),
      loc('熟悉这些工具，排错速度会快很多。'),
    ],
  },
  {
    id: 'vector',
    title: loc('查看 / 修改向量'),
    sub: loc('Vector 内存'),
    text: loc('每种测试机都能查看存在向量内存里的 Pattern，也能从键盘直接改某一拍再测。'),
    explain: [
      loc('查向量问题必备；需要一段向量清单时也很方便。'),
    ],
  },
]

/* ---------------- 收尾 ---------------- */

export const TAKEAWAY: LText[] = [
  loc('Fail 的原因只有四个嫌疑：DUT、接口硬件、测试机、测试程序。排除三个，剩下那个就是。'),
  loc('第一步永远是开 Datalog 看实测值，分清限值失效和灾难性失效。等于钳位、等于量程、全 0、符号反，都是灾难性线索。'),
  loc('先做最容易又能给出信息的事：空座重测、测标准品。报修测试机放在最后。'),
  loc('程序也会“坏”：内存损坏、加载选项选错、程序名敲错（L17279B ≠ L17297B）。'),
  loc('Scope Tool、Shmoo、Search、直接改资源、改向量——工具越熟，排错越快。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('怎样开始调试一个失效？'),
    options: [
      { id: 'a', text: loc('打开 Datalog 重跑，看实测值，判断是限值失效还是灾难性失效') },
      { id: 'b', text: loc('马上叫维护部门跑诊断') },
      { id: 'c', text: loc('先把限值放宽，让它通过再说') },
      { id: 'd', text: loc('直接换一台测试机') },
    ],
    answer: 'a',
    explain: loc('实测值里有线索：差一点没过线，还是等于钳位、量程顶格、全 0。先看数据，再决定下一步。'),
  },
  {
    id: 'q2',
    prompt: loc('所有被测芯片看起来都是同一种失效，你应该：'),
    options: [
      { id: 'a', text: loc('找同事讨论') },
      { id: 'b', text: loc('拿一颗已知好的标准品来测') },
      { id: 'c', text: loc('叫维护部门') },
      { id: 'd', text: loc('以上都不是') },
    ],
    answer: 'b',
    explain: loc('所有芯片同一种坏法，更像是测试环境的问题。标准品一测就知道：标准品也 Fail，问题在测试环境；标准品通过，才是这批芯片有问题。'),
  },
  {
    id: 'q3',
    prompt: loc('如果每一项测试都 Fail，先调试哪一项？'),
    options: [
      { id: 'a', text: loc('开短路（Continuity）') },
      { id: 'b', text: loc('功能测试') },
      { id: 'c', text: loc('IDD') },
      { id: 'd', text: loc('AC 时序') },
    ],
    answer: 'a',
    explain: loc('开短路不通过，芯片就没接好，后面的测试都没有意义。先把开短路弄通过，再看输入漏电，再往后。'),
  },
  {
    id: 'q4',
    prompt: loc('只有 VIL/VIH 功能测试 Fail，其它测试（包括标称条件下的功能测试）全部通过，最可能的问题是？'),
    options: [
      { id: 'a', text: loc('这一项的输入电平设置——程序里的 VIL/VIH 设错了，或者芯片输入门限刚好在边缘') },
      { id: 'b', text: loc('开短路有问题') },
      { id: 'c', text: loc('芯片功能完全坏了') },
      { id: 'd', text: loc('测试机电源坏了') },
    ],
    answer: 'a',
    explain: loc('其它测试都过，说明接触、电源、向量、芯片功能都没问题。这一项和别的唯一不同就是输入电平，所以先核对程序里的 VIL/VIH，再用 Search 或 Shmoo 看芯片真实的输入门限。'),
  },
  {
    id: 'q5',
    prompt: loc('调试时，理解整个测试程序的流程重要吗？为什么？'),
    options: [
      { id: 'a', text: loc('重要：前面的测试会留下状态（继电器、电平、预置的芯片状态），失败可能是前面的设置造成的') },
      { id: 'b', text: loc('不重要：只看失败的那一项就够了') },
      { id: 'c', text: loc('不重要：流程由测试机自动管理') },
    ],
    answer: 'a',
    explain: loc('测试是一项接一项跑的，前一项的设置会影响后一项。只盯着失败项，常常找不到真正原因；理解整个流程，才能看懂所有项的 Datalog 线索。'),
  },
  {
    id: 'q6',
    prompt: loc('功能测试 Fail，可以改什么来试着让它通过？'),
    options: [
      { id: 'a', text: loc('放宽输入电平') },
      { id: 'b', text: loc('放宽输出电平') },
      { id: 'c', text: loc('放宽时序') },
      { id: 'd', text: loc('以上都可以') },
    ],
    answer: 'd',
    explain: loc('三样都影响功能测试结果。放宽之后结果变了，就知道问题和哪个参数有关。'),
  },
  {
    id: 'q7',
    prompt: loc('Scope Tool 是用来做什么的？'),
    options: [
      { id: 'a', text: loc('让功能向量循环跑，并在选定的向量地址输出同步标记，供示波器观察时序和电平') },
      { id: 'b', text: loc('自动画 Shmoo 图') },
      { id: 'c', text: loc('校准测试机的示波器通道') },
    ],
    answer: 'a',
    explain: loc('循环 + 同步标记给示波器一个稳定的触发点，才能看清某一拍的波形。'),
  },
  {
    id: 'q8',
    prompt: loc('Search 工具一般提供哪两种搜索方式？'),
    options: [
      { id: 'a', text: loc('二分搜索和线性搜索') },
      { id: 'b', text: loc('Pass 搜索和 Fail 搜索') },
      { id: 'c', text: loc('电压搜索和电流搜索') },
    ],
    answer: 'a',
    explain: loc('二分（Binary）每次砍一半，快；线性（Linear）按步长走，慢但能看到全过程。'),
  },
  {
    id: 'q9',
    prompt: loc('Shmoo 图能提供很有价值的信息，但可能要跑很久。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('Shmoo 是二维扫描，每个点都要跑一次测试，点数一多时间就上去了。'),
  },
  {
    id: 'q10',
    prompt: loc('学会直接操作测试机硬件资源，会大大提高开发和调试程序的效率。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('暂停在失败项，直接改电源、电平、时序再 Execute，几秒就能验证一个猜想，不用改程序重新编译加载。'),
  },
  {
    id: 'q11',
    prompt: loc('大多数测试机都可以从键盘直接修改向量内存里的向量数据。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('向量查看工具通常也能改某一拍，然后马上重测，用来查向量问题。'),
  },
  {
    id: 'q12',
    prompt: loc('IIH 超标。取出芯片空座重测，读数变成 0；换上标准品，也 Fail。最该怀疑谁？'),
    options: [
      { id: 'a', text: loc('测试程序（例如内存损坏或加载选项选错）') },
      { id: 'b', text: loc('这颗 DUT') },
      { id: 'c', text: loc('负载板漏电') },
      { id: 'd', text: loc('测试机通道') },
    ],
    answer: 'a',
    explain: loc('空座不漏，排除了接口硬件和测试机的漏电路径；标准品也 Fail，又排除了“这颗芯片坏”。剩下的就是程序：重新加载，注意程序名和选项。'),
  },
]
