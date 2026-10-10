import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const WORDS: Card[] = [
  {
    id: 'hot',
    title: loc('热切换'),
    sub: loc('Hot switching'),
    text: loc('在有电压、有电流的时候切换继电器。'),
    explain: [
      loc('继电器触点在带电时断开或闭合，会拉电弧、产生电压尖峰。轻则触点寿命变短，重则尖峰超过芯片的绝对最大额定值。'),
      loc('规矩：继电器动作之前，先让它两端处于同一电压（没有电流）。IOS 测试最容易犯这个错。'),
    ],
  },
  {
    id: 'latch',
    title: loc('Latch-up'),
    sub: loc('闩锁'),
    text: loc('寄生 PNPN 被触发，VDD 到地形成低阻通路。'),
    explain: [
      loc('DC 测试会往管脚上强加电压电流。如果强加的电压高于 VDD 或低于地超过一个二极管压降，就可能把寄生晶闸管点着（{@latch}）。'),
      loc('表现：IDD 突然变得很大，并且改输入也降不下来。只能掉电。所以 PMU 要设好钳位和电流限。'),
    ],
  },
  {
    id: 'bin',
    title: loc('Bin'),
    sub: loc('硬 Bin / 软 Bin'),
    text: loc('测完把芯片分到不同的“箱子”。'),
    explain: [
      loc('分 Bin 的目的：把测完的芯片按结果分类——良品（可能还分速度等级）和各类失败品，分别放好、分别计数。'),
      loc('硬 Bin（Hard bin）是物理的：测试程序在测试结束时给分选机一个 Bin 信号，分选机据此把芯片放进对应的料盒或料管。数量受分选机限制，至少 2 个（好 / 坏）。'),
      loc('软 Bin（Soft bin）是软件计数器：具体哪一项失败，数量基本不受限制。多个软 Bin 可以归到同一个硬 Bin，例如 VOH、VOL 失败都进“DC 失败”料盒。'),
    ],
  },
  {
    id: 'flow',
    title: loc('测试流程'),
    sub: loc('Program flow'),
    text: loc('开短路 → 粗功能 → DC → 功能 → AC。'),
    explain: [
      loc('粗功能（Gross functional）放在 DC 前：DC 测试要靠功能向量做预处理，如果芯片连基本功能都不对，DC 量到的也没意义。'),
      loc('量产时会按失败率重排：最常失败、又最快的项提前，坏片越早停下，平均测试时间越短。但有依赖关系的项不能乱排。'),
      loc('流程对量产程序最重要：量产最看重吞吐量（每小时测多少颗）。规划流程时还要考虑要收集多少数据、要不要分速度等级（不止一个良品 Bin），并把 Pass / Fail 分支和 Bin 一起画进流程图。'),
    ],
  },
]

export const BINS: Array<{ soft: string; item: LText; hard: string; note: LText }> = [
  { soft: 'SB1', item: loc('全部通过'), hard: 'HB1', note: loc('良品') },
  { soft: 'SB2', item: loc('开短路'), hard: 'HB7', note: loc('接触或封装问题') },
  { soft: 'SB3', item: loc('粗功能'), hard: 'HB5', note: loc('功能失败') },
  { soft: 'SB4', item: loc('VOH / VOL'), hard: 'HB4', note: loc('DC 失败') },
  { soft: 'SB5', item: loc('IIL / IIH / IOZ'), hard: 'HB4', note: loc('DC 失败') },
  { soft: 'SB6', item: loc('IDD'), hard: 'HB3', note: loc('电流失败') },
  { soft: 'SB7', item: loc('全功能'), hard: 'HB5', note: loc('功能失败') },
  { soft: 'SB8', item: loc('AC 速度'), hard: 'HB2', note: loc('降速等级出货') },
]

export const SUMMARY: LText[] = [
  loc('测试总结（Test Summary）是一批测完后的统计报表：表头写测试温度、批号、日期；正文列出测试总数、各良品 Bin 的数量、失败总数，以及每一项测试（开短路、Gross IDD、各电压下的功能、VOL/VOH、IDD、IIL/IIH、IOZ……）各挂了多少颗，有时还有平均静态 IDD 这类统计值。'),
  loc('谁用、用来干什么：产品 / 良率工程师和工艺人员拿它分析良率问题，看哪一项失败最多；测试工程师拿它优化流程——量产一段时间后，把最常失败的项往前挪、很少失败的项往后放。量产中常常需要在不清零计数器的情况下随时导出一份中间总结。'),
]

export type FlowItem = { id: string; name: LText; ms: number; fail: number }

export const FLOW_ITEMS: Record<string, FlowItem> = {
  os: { id: 'os', name: loc('开短路'), ms: 10, fail: 0.015 },
  gross: { id: 'gross', name: loc('粗功能'), ms: 30, fail: 0.04 },
  dc: { id: 'dc', name: loc('DC 参数'), ms: 120, fail: 0.02 },
  func: { id: 'func', name: loc('全功能'), ms: 200, fail: 0.06 },
  ac: { id: 'ac', name: loc('AC'), ms: 150, fail: 0.03 },
}

export const FLOWS = {
  book: ['os', 'gross', 'dc', 'func', 'ac'],
  sorted: ['os', 'gross', 'func', 'ac', 'dc'],
}

/** 遇到第一项 Fail 就停：期望测试时间 */
export function expectedMs(order: string[]) {
  let reach = 1
  let total = 0
  for (const id of order) {
    const item = FLOW_ITEMS[id]
    total += reach * item.ms
    reach *= 1 - item.fail
  }
  return total
}

export type OhmRow = { id: string; name: string; v: number; i: number; vText: string; iText: string; text: LText }

export const OHMS: OhmRow[] = [
  { id: 'vol', name: 'VOL', v: 0.4, i: 8e-3, vText: '0.4 V', iText: '8 mA', text: loc('下拉管导通电阻最多 50 Ω。超过就拉不低。') },
  { id: 'voh', name: 'VOH', v: 4.75 - 2.4, i: 5.2e-3, vText: '4.75 − 2.4 V', iText: '5.2 mA', text: loc('上拉管从 VDDmin 掉到 2.4 V，电阻最多约 452 Ω。') },
  { id: 'gidd', name: 'Gross IDD', v: 5.25, i: 45e-3, vText: '5.25 V', iText: '45 mA', text: loc('电源到地的等效电阻至少约 117 Ω。比这还小，多半是短路，立刻停。') },
  { id: 'sidd', name: 'Static IDD', v: 5.25, i: 22e-6, vText: '5.25 V', iText: '22 µA', text: loc('静止 CMOS 应该几乎不导电：电源到地约 239 kΩ 以上。') },
  { id: 'didd', name: 'Dynamic IDD', v: 5.25, i: 18e-3, vText: '5.25 V', iText: '18 mA', text: loc('翻转时的平均等效电阻约 292 Ω。电流主要来自给电容充放电。') },
  { id: 'iil', name: 'IIL / IIH', v: 5.25, i: 10e-6, vText: '5.25 V', iText: '10 µA', text: loc('输入脚对电源或地的漏电阻至少 525 kΩ。') },
  { id: 'ioz', name: 'IOZ', v: 5.25, i: 2e-6, vText: '5.25 V', iText: '2 µA', text: loc('关断的输出应该像断开：约 2.6 MΩ 以上。') },
  { id: 'vi', name: 'VI', v: 1.5, i: 18e-3, vText: '1.5 V', iText: '18 mA', text: loc('输入钳位二极管的等效电阻约 83 Ω。') },
  { id: 'ios', name: 'IOS', v: 5.25, i: 30e-3, vText: '5.25 V', iText: '30–85 mA', text: loc('输出短路到地时的电流 30–85 mA，对应约 62–175 Ω。太小说明驱动弱，太大说明可能自毁。') },
]

export const OHM_LEAD = loc('每条 DC 规格都是“某个电压下，某个电流”。用欧姆定律 R = V / I 换算，就能看出规格在约束芯片里哪一段通路的电阻。这是排错时最有用的直觉。')

export const VOX_STEPS: LText[] = [
  loc('上电：VDD = VDDmin（4.75 V）。'),
  loc('跑预处理向量，停在“被测输出为低”（测 VOL）或“为高”（测 VOH）的那一拍。'),
  loc('PMU 接到第一个输出：强加 IOL = +8 mA（流进）或 IOH = −5.2 mA（流出）。'),
  loc('等稳定后量电压，和极限比：VOL ≤ 0.4 V，VOH ≥ 2.4 V。'),
  loc('PMU 移到下一个输出，重复——这叫串行（Serial）静态测法。'),
  loc('全部低电平测完，再跑另一组预处理向量，把输出翻成高，测 VOH。'),
]

export const VDD_MIN = 4.75
export const IOL = 8e-3
export const IOH = 5.2e-3

export function voxReading(test: 'vol' | 'voh', rn: number, rp: number, wrong: boolean) {
  if (test === 'vol') {
    if (!wrong) return IOL * rn
    return Math.min(VDD_MIN + 0.7, VDD_MIN + IOL * rp)
  }
  if (!wrong) return VDD_MIN - IOH * rp
  return -Math.min(0.7, IOH * rn)
}

export const VOX_DIAG = {
  pass: loc('PASS。驱动够强，读数在极限内。'),
  weak: loc('刚超限：输出状态是对的，但输出管不够强。这是真正的参数失败，Datalog 会看到读数只比极限差一点。'),
  wrongVol: loc('读数接近 VDD + 0.7 V：输出其实是高电平，PMU 往里灌电流，被上面的保护二极管钳住了。这不是驱动弱，是预处理没把输出放到低——先查向量和功能。'),
  wrongVoh: loc('读到负电压：输出其实是低电平，PMU 往外抽电流，把引脚拉到地以下。这不是驱动弱，是输出状态错了——先查预处理向量。'),
}

export const IDD_KINDS: Card[] = [
  {
    id: 'gross',
    title: loc('Gross IDD'),
    sub: loc('上电先看一眼'),
    text: loc('一上电就量，门槛很宽。电源对地短路的芯片在这里就被拦下。'),
    explain: [
      loc('它是保护性的：电流明显过大，立即停测，免得烧芯片、烧针卡，也不浪费后面几百毫秒。'),
      loc('电源要设电流限，确保短路时电流也不会超过安全值。'),
      loc('极限怎么定：规格书不直接给 Gross IDD。通常取 IDD 规格的 2–3 倍；如果规格里 IDD 还写着 TBD（To Be Determined，待定），就先测一批样片，取平均读数的 2–3 倍。'),
    ],
  },
  {
    id: 'static',
    title: loc('Static IDD'),
    sub: loc('静止电流'),
    text: loc('输入固定在 0 V / VDD，输出开路，芯片不翻转，量电源电流。'),
    explain: [
      loc('理想 CMOS 静止时几乎不耗电，只有 µA 级漏电。输入电平要给到真正的 0 V 和 VDD，给在中间电平会让输入管半开，电流虚高。'),
      loc('预处理要把芯片放到电流最小的状态，在 VDDmax 下量。单一正电源的芯片，电流总是从电源流进 VDD 脚，读数是正的。'),
    ],
  },
  {
    id: 'iddq',
    title: loc('IDDQ'),
    sub: loc('在多个向量停点量'),
    text: loc('跑向量，停在若干个精心挑选的状态，每个状态量一次静态电流。'),
    explain: [
      loc('有些缺陷（如两根线桥接）功能上可能看不出，但在特定状态下会让电源到地出现一条导电通路，电流比正常高出几十上百倍。'),
      loc('IDDQ 就是专门抓这类缺陷：功能全对，但电流异常，也判 Fail。'),
    ],
  },
  {
    id: 'dynamic',
    title: loc('Dynamic IDD'),
    sub: loc('fMAX 下跑向量'),
    text: loc('在最高频率下循环跑向量，量平均电源电流。'),
    explain: [
      loc('翻转越快，给内部电容充放电的电流越大。所以条件是 VDDmax + fMAX：最坏情况。'),
    ],
  },
]

export const IDDQ_GOOD = [1.2, 1.6, 1.1, 1.4, 1.3, 1.8, 1.2, 1.5]
export const IDDQ_BAD = [1.3, 1.7, 165, 1.4, 1.2, 172, 1.3, 1.6]
export const IDDQ_LIMIT = 20

export type InMethod = 'serial' | 'parallel' | 'gang'

export const IN_METHODS: Array<{ id: InMethod; label: LText; text: LText }> = [
  {
    id: 'serial',
    label: loc('串行'),
    text: loc('一个 PMU 轮流接到每个输入脚上，逐脚量。能定位到脚，但最慢。'),
  },
  {
    id: 'parallel',
    label: loc('并行'),
    text: loc('每个管脚有自己的 PMU（Per-pin PMU），所有脚同时量。又快又能定位，但要求测试机硬件支持。'),
  },
  {
    id: 'gang',
    label: loc('并联（Ganged）'),
    text: loc('所有输入脚并在一起接到一个 PMU，量一次总电流。最快，也不需要每脚一个 PMU，但不知道是哪只脚漏。教材的做法是并联极限直接用单脚极限（10 µA），超限就改用串行法复测定位；下面按 12 × 10 µA 判，是为了演示极限放宽后单只坏脚会被淹没。只适合高阻 CMOS 输入，带上拉 / 下拉的脚不能并联测。'),
  },
]

export const IN_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'CS1', 'CS2', 'WE', 'OE']
export const IN_LEAK: Record<string, number> = { A5: 35 }
export const IN_LIMIT = 10
export const IN_MEAS_MS = 2

export const OTHER: Card[] = [
  {
    id: 'res',
    title: loc('带上拉/下拉的输入'),
    sub: loc('Resistive inputs'),
    text: loc('有的输入内部接了上拉或下拉电阻，IIL 或 IIH 天然就大。'),
    explain: [
      loc('例：内部 50 kΩ 上拉，输入拉到 0 V 时 IIL ≈ −5 V / 50 kΩ = −100 µA。这不是漏电，是设计如此。'),
      loc('规格书会给这类脚单独的极限（常是一个范围，如 80–120 µA）；用普通 ±10 µA 去判，会把好芯片全判死。'),
      loc('这类脚必须逐脚测（串行或并行都行），不能并联测：每只脚本来就有约 100 µA，加起来一定超过单脚极限。'),
    ],
  },
  {
    id: 'fan',
    title: loc('扇出'),
    sub: loc('Fanout'),
    text: loc('一个输出能带几个同类输入。'),
    explain: [
      loc('高电平扇出 = |IOH| / IIH，低电平扇出 = IOL / |IIL|。两者取小的。'),
      loc('例：算出来高电平能带 17 个、低电平能带 30 个，那这个输出的扇出就是 17。'),
    ],
  },
  {
    id: 'ioz',
    title: loc('IOZ'),
    sub: loc('三态漏电'),
    text: loc('输出关断后，引脚上的漏电流。'),
    explain: [
      loc('步骤：VDD = VDDmax；预处理让输出高阻（OE = 1 或片选无效）；PMU 强加 VDDmax 量 IOZH，强加 0 V 量 IOZL；极限 ±10 µA。'),
      loc('双向脚（I/O）其实就是“输入漏电 + 关断输出漏电”的和，所以有时 IIL/IIH 和 IOZ 合并测。'),
    ],
  },
  {
    id: 'vi',
    title: loc('VI 输入钳位'),
    sub: loc('只对 TTL'),
    text: loc('从输入脚抽 −18 mA，量电压不能比 −1.5 V 更负。'),
    explain: [
      loc('TTL 输入有对地钳位二极管，用来吸收负向振铃。抽 18 mA 时二极管压降应在 1.5 V 以内。'),
      loc('CMOS 输入一般没有这项，或者用开短路测试顺带覆盖。'),
    ],
  },
  {
    id: 'ios',
    title: loc('IOS 输出短路电流'),
    sub: loc('Short-circuit current'),
    text: loc('把输出置高，再短到地，量最大电流。'),
    explain: [
      loc('它告诉你输出驱动的上限：太小说明驱动弱，太大说明真短路时会自毁。'),
      loc('一次只短一个输出，时间尽量短（毫秒级），否则芯片发热，读数和寿命都受影响。'),
    ],
  },
]

export const IOS_STEPS: LText[] = [
  loc('VDD = VDDmax，跑预处理向量，把被测输出置为高电平（此时引脚约在 VOH 与 VDD 之间）。'),
  loc('PMU 设成强加 0 A（相当于电压表），闭合继电器，量出这只脚的 VOH 并记下来。'),
  loc('断开继电器，把 PMU 改成强加刚才量到的 VOH 电压，再闭合继电器：两端电压相同，没有热切换。'),
  loc('把 PMU 改成强加 0 V：输出被短到地。读电流，和极限比（例如 −85 ~ −30 mA）。短路时间不超过规格允许值（如 1 s）。'),
  loc('把 PMU 改回强加 VOH，再断开继电器。'),
  loc('换下一个输出。绝不同时短多个输出。'),
]

export const IOS_WHY = loc('为什么不能直接“PMU 设 0 V 再闭合继电器”？因为输出此刻正在输出高电平，继电器一闭合，两端就是 VOH 对 0 V，大电流瞬间流过触点——这正是热切换。')

export const TAKEAWAY: LText[] = [
  loc('DC 测试 = 静态地强加电压/电流，量另一个量。每条规格都可以换算成一个电阻。'),
  loc('粗功能在 DC 前：DC 要靠功能向量做预处理。'),
  loc('读 VOH/VOL 的 Datalog：刚好超限是驱动弱；跑到另一条电源轨附近是状态错。'),
  loc('IDD 分 Gross / Static / IDDQ / Dynamic，各抓不同的问题。'),
  loc('IIL/IIH 并联测最快，但会漏掉单只坏脚。'),
  loc('切继电器前先让两端电压相同：避免热切换。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么粗功能测试要排在 DC 测试前面？'),
    options: [
      { id: 'a', text: loc('DC 测试要用功能向量把输出放到确定状态') },
      { id: 'b', text: loc('因为它更便宜') },
      { id: 'c', text: loc('没有原因') },
    ],
    answer: 'a',
    explain: loc('功能都不对，预处理就不可靠，DC 读数没有意义。'),
  },
  {
    id: 'q2',
    prompt: loc('测 VOL 读到 5.45 V，最可能是？'),
    options: [
      { id: 'a', text: loc('输出其实是高，预处理错了') },
      { id: 'b', text: loc('下拉管稍弱') },
      { id: 'c', text: loc('PMU 坏了') },
    ],
    answer: 'a',
    explain: loc('≈ VDD + 0.7 V，是上保护二极管钳住的电压，说明输出在高电平。'),
  },
  {
    id: 'q3',
    prompt: loc('VOL 读到 0.43 V（极限 0.4 V），最可能是？'),
    options: [
      { id: 'a', text: loc('下拉管驱动不够，真正的参数失败') },
      { id: 'b', text: loc('输出状态错') },
      { id: 'c', text: loc('开路') },
    ],
    answer: 'a',
    explain: loc('状态是对的，只差一点：0.43 / 8 mA ≈ 54 Ω，比 50 Ω 略大。'),
  },
  {
    id: 'q4',
    prompt: loc('功能全对，但某几个向量停点的 IDDQ 高出上百倍，应该？'),
    options: [
      { id: 'a', text: loc('判 Fail：很可能有桥接等缺陷') },
      { id: 'b', text: loc('判 Pass：功能是对的') },
      { id: 'c', text: loc('重测直到通过') },
    ],
    answer: 'a',
    explain: loc('IDDQ 就是为了抓功能测不出的缺陷，这类芯片往往很早就会在客户那里失效。'),
  },
  {
    id: 'q5',
    prompt: loc('12 个输入并联测 IIH，极限按 12 × 10 µA = 120 µA，一只脚漏 35 µA，会？'),
    options: [
      { id: 'a', text: loc('总电流约 36 µA，判 Pass——坏脚漏掉了') },
      { id: 'b', text: loc('判 Fail 并指出是哪只脚') },
      { id: 'c', text: loc('无法测量') },
    ],
    answer: 'a',
    explain: loc('并联测量只看总和，极限一放宽，单脚超限就可能被淹没。所以教材的做法是并联极限仍用单脚的 10 µA：36 µA 会判 Fail，再用串行法复测找出 A5。'),
  },
  {
    id: 'q6',
    prompt: loc('IOS 测试中，正确避免热切换的做法是？'),
    options: [
      { id: 'a', text: loc('PMU 先设 0 V，再闭合继电器') },
      { id: 'b', text: loc('先用 0 A 量出 VOH，PMU 改为强加这个 VOH 后再闭合继电器，然后才改成 0 V') },
      { id: 'c', text: loc('所有输出一起短到地，省时间') },
    ],
    answer: 'b',
    explain: loc('输出此刻是高电平。PMU 设 0 V 直接闭合，继电器两端就是 VOH 对 0 V，一闭合就有大电流——这就是热切换。先让 PMU 和引脚处于同一电压再动继电器，测完也先回到 VOH 再断开。'),
  },
  {
    id: 'b1',
    prompt: loc('测试流程（Program flow）对哪一类测试最重要？'),
    options: [
      { id: 'a', text: loc('表征测试') },
      { id: 'b', text: loc('工程评估') },
      { id: 'c', text: loc('量产测试') },
    ],
    answer: 'c',
    explain: loc('量产最看重吞吐量：先测什么、后测什么、失败了跳到哪个 Bin，直接决定平均每颗的测试时间。表征和工程评估要的是完整数据，通常每项都测完，顺序不那么关键。'),
  },
  {
    id: 'b2',
    prompt: loc('分 Bin（Binning）的目的是？'),
    options: [
      { id: 'a', text: loc('把测完的芯片按结果分类：良品（及速度等级）和各类失败品分开放、分别计数') },
      { id: 'b', text: loc('把芯片按批号排序') },
      { id: 'c', text: loc('决定测试机用哪块 Load board') },
      { id: 'd', text: loc('只是给操作员看的指示灯，没有实际作用') },
    ],
    answer: 'a',
    explain: loc('硬 Bin 控制分选机把芯片放进哪个料盒（数量受分选机限制，至少好 / 坏两个）；软 Bin 是软件计数器，记录具体挂在哪一项（数量基本不受限）。测试结束时程序设置 Bin 信号，分选机读到后把芯片放到对应位置。'),
  },
  {
    id: 'b3',
    prompt: loc('测试总结（Test Summary）上一般有哪些内容？'),
    options: [
      { id: 'a', text: loc('只有一个良率百分比') },
      { id: 'b', text: loc('测试总数、良品数（按 Bin）、失败总数、每一项测试的失败数，以及温度、批号、日期等') },
      { id: 'c', text: loc('每颗芯片的全部测量读数') },
      { id: 'd', text: loc('测试程序的源代码') },
    ],
    answer: 'b',
    explain: loc('测试总结是统计报表：表头有温度、批号、日期，正文有总数、各良品 Bin 数、失败数，以及开短路、Gross IDD、各电压下功能、VOL/VOH、IDD、IIL/IIH、IOZ 等每一项的失败数，还可以有平均静态 IDD 之类的统计值。每颗的全部读数属于 Datalog，不是总结。'),
  },
  {
    id: 'b4',
    prompt: loc('测试总结的信息用来做什么、给谁用？'),
    options: [
      { id: 'a', text: loc('只给客户看') },
      { id: 'b', text: loc('良率 / 产品 / 工艺工程师分析良率问题；测试工程师据此调整测试流程') },
      { id: 'c', text: loc('用来给每颗芯片打标') },
      { id: 'd', text: loc('没什么用，测完就删') },
    ],
    answer: 'b',
    explain: loc('哪一项挂得最多，指向工艺或设计的问题，所以良率相关的工程师要看它；测试工程师根据它把最常失败的项往前挪、很少失败的项往后放，缩短平均测试时间。所以总结里信息越全越好。'),
  },
  {
    id: 'b5',
    prompt: loc('测试规格里写着“TBD”，是什么意思？'),
    options: [
      { id: 'a', text: loc('To Be Determined：待定，数值还没确定') },
      { id: 'b', text: loc('这一项不用测') },
      { id: 'c', text: loc('按测试机默认值') },
      { id: 'd', text: loc('Test By Design：由设计保证') },
    ],
    answer: 'a',
    explain: loc('TBD = To Be Determined。例如早期规格里 IDD 极限写 TBD，做法是先测一批样片看读数，再定极限；Gross IDD 常取平均读数的 2–3 倍。'),
  },
  {
    id: 'b6',
    prompt: loc('静态 IDD 测试的电流通常是？'),
    options: [
      { id: 'a', text: loc('正电流') },
      { id: 'b', text: loc('负电流') },
      { id: 'c', text: loc('正负都可能') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'a',
    explain: loc('单一正电源的芯片，电流总是从电源流进 VDD 脚，按测试机的约定（流进芯片为正）就是正电流。'),
  },
  {
    id: 'b7',
    prompt: loc('大多数情况下，动态电流测试的读数会？'),
    options: [
      { id: 'a', text: loc('比静态 IDD 小') },
      { id: 'b', text: loc('比静态 IDD 大') },
      { id: 'c', text: loc('和静态 IDD 一样') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('静态 IDD 是芯片停在电流最小的状态，CMOS 只有 µA 级漏电；动态 IDD 在 fMAX 下跑向量，内部节点不停翻转，给电容充放电，电流是 mA 级。本课的例子：静态 22 µA，动态 18 mA。'),
  },
  {
    id: 'b8',
    prompt: loc('做静态 IOL 测试前，要先把输出预处理成逻辑 1。'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'b',
    explain: loc('IOL / VOL 测的是输出为低时的吸电流能力，必须先预处理成逻辑 0。预处理成 1 再灌 IOL，读数会被上面的保护二极管钳在 VDD + 0.7 V 附近，这是状态错，不是驱动弱。'),
  },
  {
    id: 'b9',
    prompt: loc('做 IOH 测量时，电流是？'),
    options: [
      { id: 'a', text: loc('正电流') },
      { id: 'b', text: loc('负电流') },
      { id: 'c', text: loc('正负都可能') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('输出为高时芯片向外供电流（Source），电流流出芯片，所以 IOH 是负的，例如 IOH = −5.2 mA。IOL 流进芯片，是正的。'),
  },
  {
    id: 'b10',
    prompt: loc('VOL / IOL 测试：IOL = 4 mA，VOL ≤ 0.4 V。输出最多能有多大电阻还能通过？'),
    options: [
      { id: 'a', text: loc('50 Ω') },
      { id: 'b', text: loc('100 Ω') },
      { id: 'c', text: loc('取决于 VDD') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'b',
    explain: loc('R = V / I = 0.4 V ÷ 4 mA = 100 Ω。VOL 的电压就是下拉管上的压降（输出对地），和 VDD 无关。50 Ω 是本课 8 mA 时的答案。'),
  },
  {
    id: 'b11',
    prompt: loc('输入漏电测试（IIL / IIH）验证的是？'),
    options: [
      { id: 'a', text: loc('输入电容') },
      { id: 'b', text: loc('输入门槛电平') },
      { id: 'c', text: loc('输入电阻') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'c',
    explain: loc('强加电压、量电流，本质是在量输入脚到 VDD / VSS 的电阻：5.25 V ÷ 10 µA，电阻至少 525 kΩ。门槛电平（VIL / VIH）要靠功能测试验证；电容量产不测。'),
  },
  {
    id: 'b12',
    prompt: loc('IIL / IIH 用并行（Per-pin PMU）测量，好处是？'),
    options: [
      { id: 'a', text: loc('所有脚同时量，速度快，而且每只脚的电流都单独知道') },
      { id: 'b', text: loc('更容易发现脚与脚之间的漏电') },
      { id: 'c', text: loc('只需要一个 PMU') },
      { id: 'd', text: loc('可以用于任何测试机') },
    ],
    answer: 'a',
    explain: loc('并行法用每脚一个 PMU 同时量：像并联法一样快，又像串行法一样能定位到脚。代价是测试机要有 Per-pin PMU；而且所有输入同时加同一电压，脚间漏电反而不容易发现（串行法能发现）。'),
  },
  {
    id: 'b13',
    prompt: loc('对带上拉 / 下拉的输入脚测 IIL / IIH，不能用哪种方法？'),
    options: [
      { id: 'a', text: loc('串行法') },
      { id: 'b', text: loc('并联（Ganged）法') },
    ],
    answer: 'b',
    explain: loc('并联法把所有脚接到一个 PMU 量总电流，极限用单脚的值。高阻 CMOS 输入每脚几乎 0 电流，总和也接近 0；但带上拉 / 下拉的脚每只都有约 100 µA，总和必然超过单脚极限，好芯片也会判 Fail。'),
  },
  {
    id: 'b14',
    prompt: loc('IOZ（高阻漏电）测试应在哪些脚上做？'),
    options: [
      { id: 'a', text: loc('纯输入脚') },
      { id: 'b', text: loc('所有纯输出脚') },
      { id: 'c', text: loc('三态输出脚、双向脚，以及规格书 IOZ 项下列出的脚') },
      { id: 'd', text: loc('电源脚') },
    ],
    answer: 'c',
    explain: loc('IOZ 是“输出关断时”的漏电，只有能关断（进入高阻）的脚才有：三态输出和双向脚。具体哪些脚，以规格书 IOZ 项为准。纯输入测 IIL / IIH；不能关断的纯输出没有高阻状态。（原题是多选，正确项为三态、双向、规格指定的脚。）'),
  },
  {
    id: 'b15',
    prompt: loc('做 IOZ 之前，被测脚必须先预处理成？'),
    options: [
      { id: 'a', text: loc('逻辑 1') },
      { id: 'b', text: loc('逻辑 0') },
      { id: 'c', text: loc('关断状态（高阻）') },
      { id: 'd', text: loc('双向状态') },
    ],
    answer: 'c',
    explain: loc('例如让 OE = 1 或片选无效。如果预处理没做对，输出还在驱动 0 或 1，PMU 一加电压就会有大电流，读数往往满量程——这是预处理问题，不是漏电。'),
  },
  {
    id: 'b16',
    prompt: loc('做 VI（输入钳位）测试时：'),
    options: [
      { id: 'a', text: loc('强加负电压') },
      { id: 'b', text: loc('强加正电压') },
      { id: 'c', text: loc('量负电流') },
      { id: 'd', text: loc('以上都不对') },
    ],
    answer: 'd',
    explain: loc('VI 是强加负电流（约 −18 mA，从输入脚抽出）、量电压，读数不能比 −1.5 V 更负。三个选项都把“强加”和“测量”的对象说反了。这项只对 TTL 输入做。'),
  },
  {
    id: 'b17',
    prompt: loc('做 IOS（输出短路电流）测试，需要什么预处理？'),
    options: [
      { id: 'a', text: loc('把被测输出预处理成逻辑 1（输出高电平）') },
      { id: 'b', text: loc('把被测输出预处理成逻辑 0') },
      { id: 'c', text: loc('把输出关成高阻') },
      { id: 'd', text: loc('不需要预处理') },
    ],
    answer: 'a',
    explain: loc('IOS 是输出为高时被短到 0 V 的电流。如果输出其实是 0，PMU 强加 0 V 时两边同电位，读到约 0 mA，这是预处理错了。另外要按“先量 VOH、PMU 设成 VOH 再接上、再降到 0 V”的顺序，避免热切换；一次只短一个输出，VDD 用 VDDmax。'),
  },
]
