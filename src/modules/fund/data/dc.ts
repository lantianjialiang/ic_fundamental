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
      loc('规矩：先把源设到 0 V / 0 A（或关闭），切好继电器，再把源加上去；测完反过来。IOS 测试最容易犯这个错。'),
    ],
  },
  {
    id: 'latch',
    title: loc('Latch-up'),
    sub: loc('闩锁'),
    text: loc('寄生 PNPN 被触发，VDD 到地形成低阻通路。'),
    explain: [
      loc('DC 测试会往管脚上强加电压电流。如果强加的电压高于 VDD 或低于地超过一个二极管压降，就可能把寄生晶闸管点着（M16）。'),
      loc('表现：IDD 突然变得很大，并且改输入也降不下来。只能掉电。所以 PMU 要设好钳位和电流限。'),
    ],
  },
  {
    id: 'bin',
    title: loc('Bin'),
    sub: loc('硬 Bin / 软 Bin'),
    text: loc('测完把芯片分到不同的“箱子”。'),
    explain: [
      loc('硬 Bin（Hard bin）是物理的：分选机把芯片放进不同料盒，数量少，通常 8 个以内。'),
      loc('软 Bin（Soft bin）是记录的：具体哪一项失败。多个软 Bin 可以归到同一个硬 Bin，例如 VOH、VOL 失败都进“DC 失败”料盒。'),
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
    ],
  },
  {
    id: 'static',
    title: loc('Static IDD'),
    sub: loc('静止电流'),
    text: loc('输入固定在 0 V / VDD，输出开路，芯片不翻转，量电源电流。'),
    explain: [
      loc('理想 CMOS 静止时几乎不耗电，只有 µA 级漏电。输入电平要给到真正的 0 V 和 VDD，给在中间电平会让输入管半开，电流虚高。'),
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
    text: loc('所有输入脚并在一起接到一个 PMU，量一次总电流。最快，但不知道是哪只脚漏，单只坏脚还可能被平均掉。'),
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
      loc('规格书会给这类脚单独的极限；用普通 ±10 µA 去判，会把好芯片全判死。'),
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
  loc('VDD = VDDmax，跑预处理向量，把被测输出置为高电平。'),
  loc('PMU 先设成强加 0 V、电流钳位约 100 mA——此时继电器还断开。'),
  loc('闭合 PMU 继电器：输出被短到 0 V。源本来就在 0 V，所以切换瞬间不是“热切换”。'),
  loc('等几百微秒稳定，读电流，和极限比。'),
  loc('先断开 PMU 继电器，再把源复位。'),
  loc('换下一个输出。绝不同时短多个输出。'),
]

export const TAKEAWAY: LText[] = [
  loc('DC 测试 = 静态地强加电压/电流，量另一个量。每条规格都可以换算成一个电阻。'),
  loc('粗功能在 DC 前：DC 要靠功能向量做预处理。'),
  loc('读 VOH/VOL 的 Datalog：刚好超限是驱动弱；跑到另一条电源轨附近是状态错。'),
  loc('IDD 分 Gross / Static / IDDQ / Dynamic，各抓不同的问题。'),
  loc('IIL/IIH 并联测最快，但会漏掉单只坏脚。'),
  loc('切继电器前先把源归零：避免热切换。'),
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
    explain: loc('并联测量只看总和，单脚超限可能被淹没，这是它快的代价。'),
  },
  {
    id: 'q6',
    prompt: loc('IOS 测试中，正确避免热切换的做法是？'),
    options: [
      { id: 'a', text: loc('PMU 先设 0 V 再闭合继电器；测完先断继电器再复位源') },
      { id: 'b', text: loc('先闭合继电器，再把 PMU 从 5 V 降到 0 V') },
      { id: 'c', text: loc('所有输出一起短到地，省时间') },
    ],
    answer: 'a',
    explain: loc('继电器切换时两端压差为零、没有电流，就不会拉弧或产生尖峰。'),
  },
]
