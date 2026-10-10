import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------------- 1. 寄生 SCR ---------------- */

export const SCR_LEAD: LText[] = [
  loc('CMOS 把 P 沟道和 N 沟道 MOS 做在一起，要靠 P 阱或 N 阱把两种管子隔开。阱、衬底和 MOS 的源漏叠在一起，无意中就长出了一个四层结构 PNPN——可控硅（SCR）。硅片里的结构细节见 {@latch}。'),
  loc('等效电路是两只横向双极管：PNP 的集电极喂 NPN 的基极，NPN 的集电极又喂 PNP 的基极。PNP 的发射极是阳极（接 VDD），NPN 的发射极是阴极（接 GND），两个基极就是两个“门”。'),
  loc('平时两只管子都关着。一旦有电流流进衬底或阱，让其中一只导通，它的集电极电流又把另一只打开——互相喂基极，正反馈，VDD 到 GND 之间就出现一条低阻通路。这就是闩锁（Latch-up）。'),
]

/* ---------------- 2. SCR 伏安特性 ---------------- */

export const VBO0 = 9
export const VBO_SLOPE = 0.35
export const VBO_MIN = 1.5
export const VON = 1.0
export const RON = 0.5
export const IH_MA = 50
export const ILIM_MA = 300

export type ScrMode = 'block' | 'on' | 'fizzle'

/** 门极电流越大，转折电压越低 */
export function vbo(igMa: number) {
  return Math.max(VBO_MIN, VBO0 - VBO_SLOPE * igMa)
}

/** 导通态电流（mA），由外部电路决定 */
export function onCurrent(vs: number, r: number, limit: boolean) {
  const i = (Math.max(0, vs - VON) / (r + RON)) * 1000
  return limit ? Math.min(i, ILIM_MA) : i
}

/** 有状态：已经闩住的保持闩住，直到电流低于 IH */
export function nextMode(prev: ScrMode, vs: number, ig: number, r: number, limit: boolean): ScrMode {
  const fire = prev === 'on' || vs >= vbo(ig)
  if (!fire) return 'block'
  return onCurrent(vs, r, limit) >= IH_MA ? 'on' : 'fizzle'
}

export const SCR_TEXT: Record<ScrMode, LText> = {
  block: loc('阻断：电压低于转折电压 VBO，SCR 只有微小的漏电流。'),
  on: loc('闩锁：SCR 已经导通，两端只剩约 1 V，电流完全由外部电路（电源电压、串联电阻、电源限流）决定。把门极电流拿掉也没用——只有让电流降到 IH 以下（例如掉电）才会解除。'),
  fizzle: loc('触发了，但维持不住：外部电阻太大，导通后电流达不到维持电流 IH，SCR 自己又关断了。这就是串电阻能防止持续闩锁的原因。'),
}

export const SCR_NOTE = loc('试一试：VDD 放在 5 V，把门极电流慢慢加到 12 mA 左右，VBO 降到 5 V 以下就触发；再把门极电流拉回 0——还锁着。点“掉电”才解除。关掉电源限流、把串联电阻调到 1 Ω，看电流有多大。')

/* ---------------- 3. 常见触发源 ---------------- */

export const TRIGGERS: Card[] = [
  {
    id: 'rail',
    title: loc('输入/输出超出电源轨'),
    sub: loc('过冲 · 欠冲'),
    text: loc('管脚电压高于 VDD 或低于 GND，保护二极管导通，电流直接流进阱或衬底——正好是 SCR 的门。'),
    explain: [
      loc('测试中常见来源：测试机输入电平设得比 VDD 高、负载板走线振铃、VDD 还没上电就先给输入加电平。'),
    ],
  },
  {
    id: 'seq',
    title: loc('多电源上电顺序错'),
    sub: loc('VDD1 / VDD2 …'),
    text: loc('芯片有多路电源时，某一路先上，另一路还在 0 V，接口处的管脚就等于“超出电源轨”。'),
    explain: [loc('上电顺序要和电路设计工程师确认，程序里严格按顺序加。')],
  },
  {
    id: 'ir',
    title: loc('电源轨上的 I·R 压降'),
    sub: loc('大输出电流'),
    text: loc('很多输出同时拉大电流，芯片内部电源线和地线上有电阻，压降会让局部的 VDD/GND 偏移，局部结就可能正偏。'),
    explain: [loc('同时翻转的输出越多、负载越重，越危险。')],
  },
]

export const PREVENT = loc('防住闩锁的思路：把寄生 SCR 的参数控制住，保证芯片只要在绝对最大额定值以内工作，就永远进不了导通态。所以寄生 SCR 的参数和其它电参数一样，要做充分的特性测试，验证工艺设计目标。')

/* ---------------- 4. 测试参数与向量 ---------------- */

export const TEST_LEAD: LText[] = [
  loc('闩锁测试的思路是“故意点火”：想办法把寄生 SCR 推进导通态，看它进不进去。'),
  loc('两条路：加高电压直到 VBO（过压测试，把 VDD 和所有输入抬高）；或者往阱/衬底注入门极电流（电流触发测试，往每个输入、输出脚灌电流、抽电流）。具体数值来自工艺规格，要和电路设计、工艺工程师一起定。'),
]

export const PARAMS: Array<{ sym: string; def: LText; typ: LText | string; text: LText }> = [
  { sym: 'VDDMAX', def: loc('最大工作 VDD'), typ: '5.25 V', text: loc('测 IDD 的基准条件。两次 IDD 测量之间 VDD 不能低于它。') },
  { sym: 'VDDOVR', def: loc('抬高后的 VDD'), typ: '7.0 V（5 V 设计）', text: loc('过压测试时把 VDD 抬到这里，试探 VBO。') },
  { sym: 'VIHOVR', def: loc('抬高后的正输入电压'), typ: 'VDD + 0.5 V', text: loc('比电源还高 0.5 V，让输入保护二极管导通，往阱里注入电流。') },
  { sym: 'VILOVR', def: loc('抬高后的负输入电压'), typ: 'GND − 0.5 V', text: loc('比地还低 0.5 V，让对地保护二极管导通，从衬底抽电流。') },
  { sym: 'TRIGIH', def: loc('最大正向注入电流：灌进管脚而不闩锁'), typ: '> 20 mA', text: loc('用 PMU 往输入或输出脚灌电流。芯片必须扛住这么大而不闩锁。') },
  { sym: 'TRIGIL', def: loc('最大负向注入电流：从管脚抽出而不闩锁'), typ: '> 20 mA', text: loc('用 PMU 从管脚往外抽电流。') },
  { sym: 'IDDQ', def: loc('最大静态 IDD'), typ: loc('静态 IDD 规格'), text: loc('第一次测 IDD 的上限。超过它，说明芯片本来就不正常，测试中止。') },
  { sym: 'IDD1', def: loc('实测的静态 IDD'), typ: '—', text: loc('触发前测到的 IDD，存进程序变量，作为触发后比较的基准。') },
  { sym: 'IDDT', def: loc('触发后 IDD 允许的最大变化'), typ: '< 5% × IDD1', text: loc('触发后 IDD 必须落在 IDD1 ± IDDT 之内，否则判闩锁。') },
]

export const PATTERNS: LText[] = [
  loc('Pattern 1：把芯片预置到已知状态（和静态 IDD 测试一样）。'),
  loc('Pattern 2：所有输入在“互补背景”下逐个高低翻转——测一个脚时其余脚处在相反状态。'),
  loc('Pattern 3：所有输出翻高翻低（和 VOH/VOL 测试一样）。'),
  loc('Pattern 4：把高阻输出置为高阻态（和 IOZ 测试一样）。'),
]

export const HW_NOTE: LText[] = [
  loc('SCR 一旦触发，电流只受外部电路限制。VDD 电源必须限流到安全值，约 300 mA；电源不能编程限流，就串一个电阻。'),
  loc('拆掉负载板上大于 20 µF 的旁路电容：大电容储能，触发时会瞬间放出很大的电流，限流也挡不住。'),
]

/* ---------------- 5. 测试流程模拟器 ---------------- */

export type TestMode = 'vbo' | 'input' | 'hiz' | 'output'
export type Pol = 'hi' | 'lo'
export type Chip = 'good' | 'latch' | 'leaky'

export const VDDMAX = 5.25
export const VDDOVR = 7.0
export const IDDQ_UA = 50
export const IDDT_PCT = 5
export const TRIG_MA = 20

const IDD_GOOD = 12
const IDD_LEAKY = 850
const IDD_LATCH = ILIM_MA * 1000

export const STEP_TITLES: LText[] = [
  loc('加 VDDMAX'),
  loc('预置到已知状态'),
  loc('测 IDD，存为 IDD1'),
  loc('和 IDDQ 比'),
  loc('施加触发'),
  loc('撤掉触发，不掉电'),
  loc('再预置一次'),
  loc('再测 IDD'),
  loc('掉电'),
  loc('和 IDD1 ± IDDT 比'),
  loc('输出结果'),
]

export function trigName(mode: TestMode, pol: Pol) {
  if (mode === 'vbo') return 'VDDOVR / VIHOVR / VILOVR'
  return pol === 'hi' ? 'TRIGIH' : 'TRIGIL'
}

/** 每一步的具体做法 */
export function stepDetail(i: number, mode: TestMode, pol: Pol): LText {
  const pat =
    mode === 'hiz'
      ? loc('跑 Pattern 4：把被测脚置为高阻；结束时高阻脚由测试机驱动。前后用同一个结束地址。')
      : mode === 'output'
        ? pol === 'lo'
          ? loc('跑 Pattern 3 的对应地址：把被测输出预置成低态。')
          : loc('跑 Pattern 3 的对应地址：把被测输出预置成高态。')
        : loc('跑 Pattern 1：把芯片预置到已知状态。')
  switch (i) {
    case 0:
      return loc('VDD = VDDMAX = 5.25 V，输入电平放在电源轨上：VIH = VDDMAX，VIL = GND。')
    case 1:
    case 6:
      return pat
    case 2:
      return loc('用 DC 测量系统测流进 VDD 的电流，存进程序变量 IDD1。')
    case 3:
      return loc('IDD1 > IDDQ 就输出“初始静态 IDD 失效”和 VDD、IDD 值，掉电，中止测试。')
    case 4:
      if (mode === 'vbo') return loc('VDD 升到 VDDOVR = 7.0 V，VIH = VIHOVR，VIL = VILOVR；跑 Pattern 2，每个输入轮流翻高翻低，其余脚处在相反状态。')
      return pol === 'hi'
        ? loc('用 DC 测量系统往被测脚灌入 TRIGIH = +20 mA。')
        : loc('用 DC 测量系统从被测脚抽出 TRIGIL = −20 mA。')
    case 5:
      return mode === 'vbo'
        ? loc('输入电平先回到原值，再把 VDD 降回 VDDMAX。全程不掉电。')
        : loc('撤掉注入电流，VDD 保持在 VDDMAX。全程不掉电。')
    case 7:
      return loc('再测一次流进 VDD 的电流。')
    case 8:
      return loc('掉电，为下一项测试做准备。')
    case 9:
      return loc('要求 IDD1 − IDDT < IDD < IDD1 + IDDT，IDDT = 5% × IDD1。超出就是闩锁了。')
    default:
      return loc('输出 Pass / Fail，以及 VDD、IDD、触发参数（过压测试还输出 VDDOVR；电流测试还输出管脚名）。')
  }
}

export type SimPoint = { vdd: number; idd: number }
export type SimResult = {
  /** 下标 0 = 开始前，1..11 = 第 1..11 步之后 */
  points: SimPoint[]
  idd1: number
  idd2: number
  /** 中止在哪一步之后（第 4 步），没中止为 0 */
  abortAt: number
  verdict: 'pass' | 'latch' | 'abort'
}

/** 芯片模型：按测试方式和芯片类型推演 VDD / IDD */
export function simulate(mode: TestMode, chip: Chip, dropPower: boolean): SimResult {
  const idd0 = chip === 'leaky' ? IDD_LEAKY : IDD_GOOD
  const pts: SimPoint[] = [{ vdd: 0, idd: 0 }]
  const on = { vdd: VDDMAX, idd: idd0 }
  pts.push(on, on, on, on)
  if (idd0 > IDDQ_UA) {
    for (let i = 5; i <= 11; i += 1) pts.push({ vdd: 0, idd: 0 })
    return { points: pts, idd1: idd0, idd2: 0, abortAt: 4, verdict: 'abort' }
  }
  let latched = chip === 'latch'
  const trigVdd = mode === 'vbo' ? VDDOVR : VDDMAX
  pts.push({ vdd: trigVdd, idd: latched ? IDD_LATCH : mode === 'vbo' ? idd0 * 1.6 : idd0 })
  // 错误做法：撤触发时掉了电，闩锁被“掉电”悄悄解除了
  if (dropPower) latched = false
  const after = latched ? IDD_LATCH : idd0 * 1.01
  pts.push(dropPower ? { vdd: 0, idd: 0 } : { vdd: VDDMAX, idd: after })
  pts.push({ vdd: VDDMAX, idd: after }, { vdd: VDDMAX, idd: after })
  pts.push({ vdd: 0, idd: 0 }, { vdd: 0, idd: 0 }, { vdd: 0, idd: 0 })
  const ok = Math.abs(after - idd0) < (idd0 * IDDT_PCT) / 100
  return { points: pts, idd1: idd0, idd2: after, abortAt: 0, verdict: ok ? 'pass' : 'latch' }
}

export function fmtIdd(ua: number) {
  if (ua >= 1000) return `${(ua / 1000).toFixed(1)} mA`
  return `${ua.toFixed(1)} µA`
}

export const VERDICT_TEXT: Record<SimResult['verdict'], LText> = {
  pass: loc('PASS：触发后 IDD 回到原值，芯片没有闩锁。'),
  latch: loc('FAIL：触发后 IDD 冲到电源限流值 300 mA，撤掉触发也不回落——芯片闩锁了。'),
  abort: loc('中止：初始静态 IDD 就超过 IDDQ，芯片本身有问题，不做闩锁测试，掉电。'),
}

export const DROP_WARN = loc('错误做法：撤掉触发时掉了电。闩锁靠掉电解除，这样第二次 IDD 测量就看不到闩锁，会把会闩锁的芯片判成 PASS。两次 IDD 测量之间 VDD 绝不能低于 VDDMAX。')

export const MODE_NOTE: Record<TestMode, LText> = {
  vbo: loc('过压测试：VDD 和所有输入一起抬高，试探 VBO。'),
  input: loc('输入脚：每个输入脚分别做 TRIGIH 和 TRIGIL 两次，所有输入脚都要做。'),
  hiz: loc('高阻脚：和输入脚一样，只是用 Pattern 4 预置，保证被测脚处于高阻态。'),
  output: loc('输出脚：每个脚测两种状态，每种只加一个电流——低态配 TRIGIL，高态配 TRIGIH。'),
}

/* ---------------- 6. 施加激励的顺序 ---------------- */

export const STIM_LEAD = loc('闩锁只有在不超过绝对最大额定值时才不会发生。额定值规定输入不能超出电源轨（例如 VDD + 10% 到 GND − 10%），所以 VDD 和输入激励的先后顺序要排好；I/O 脚也要先初始化，避免芯片和测试机互相“顶牛”产生大电流。这个顺序适用于所有 CMOS 测试。')

export const POWER_UP: LText[] = [
  loc('测试机把所有输入脚驱动到 0 V；I/O 脚设为不驱动，输出负载接 0 V。'),
  loc('按规定顺序给各 VDD 脚加电。'),
  loc('设置输入电平 VIL / VIH。'),
  loc('设置输出负载的参考电压。'),
  loc('设置输出比较电平 VOL / VOH。'),
]

export const POWER_DOWN: LText[] = [
  loc('I/O 脚设为不驱动。'),
  loc('输出负载参考电压设为 0 V。'),
  loc('输入电平 VIL / VIH 设为 0 V。'),
  loc('按规定顺序撤掉各 VDD 脚的电压。'),
]

/* ---------------- 收尾 ---------------- */

export const TAKEAWAY: LText[] = [
  loc('CMOS 里的阱和衬底天然组成寄生 PNPN（SCR）。触发后 VDD 到 GND 只剩约 1 V，电流只受外部电路限制。'),
  loc('触发有两条路：电压超过 VBO，或者往阱/衬底注入门极电流。门电流越大，VBO 越低。'),
  loc('闩住以后撤掉触发也没用，只有电流降到 IH 以下（掉电）才解除。'),
  loc('测试流程：VDDMAX 下测 IDD1 → 施加触发 → 不掉电 → 再测 IDD，和 IDD1 ± 5% 比。'),
  loc('测试硬件：VDD 限流约 300 mA（或串电阻），拆掉大于 20 µF 的大电容。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('SCR 进入闩锁态后，怎样才能让它关断？'),
    options: [
      { id: 'a', text: loc('把阳极电流降到维持电流 IH 以下，例如掉电') },
      { id: 'b', text: loc('撤掉门极触发电流') },
      { id: 'c', text: loc('把输入电平拉回电源轨以内') },
      { id: 'd', text: loc('等它自己恢复') },
    ],
    answer: 'a',
    explain: loc('两只寄生管互相喂基极，一旦导通就自我维持，和门极电流无关。只有电流低到维持不住正反馈时才会关断。'),
  },
  {
    id: 'q2',
    prompt: loc('往 SCR 的门极注入的电流越大，转折电压 VBO 会怎样？'),
    options: [
      { id: 'a', text: loc('越低：更低的电压就能触发') },
      { id: 'b', text: loc('越高') },
      { id: 'c', text: loc('不变') },
    ],
    answer: 'a',
    explain: loc('门极电流帮一只寄生管先导通，正反馈更容易建立。所以电流触发测试能在正常 VDD 下就把 SCR 点着。'),
  },
  {
    id: 'q3',
    prompt: loc('闩锁测试时，为什么 VDD 电源要限流约 300 mA，并拆掉大于 20 µF 的旁路电容？'),
    options: [
      { id: 'a', text: loc('SCR 导通后电流只受外部电路限制，不限流会烧坏芯片；大电容储能会绕过限流瞬间放电') },
      { id: 'b', text: loc('为了让 IDD 测得更准') },
      { id: 'c', text: loc('为了让 SCR 更容易触发') },
    ],
    answer: 'a',
    explain: loc('导通后 SCR 两端只剩约 1 V，几乎是短路。电源限流（或串电阻）把电流卡在安全值；大电容就在电源出口，放电时限流挡不住。'),
  },
  {
    id: 'q4',
    prompt: loc('为什么第一次和第二次 IDD 测量之间不能掉电？'),
    options: [
      { id: 'a', text: loc('掉电会让闩锁解除，第二次测量就看不到闩锁，会把坏芯片判成 Pass') },
      { id: 'b', text: loc('掉电会损坏测试机') },
      { id: 'c', text: loc('掉电后需要重新跑开短路') },
    ],
    answer: 'a',
    explain: loc('判闩锁靠的就是“撤掉触发后 IDD 还高”。掉电等于把闩锁关掉了，测试就失去意义。'),
  },
  {
    id: 'q5',
    prompt: loc('第一次测得的 IDD1 已经大于 IDDQ，程序应该？'),
    options: [
      { id: 'a', text: loc('输出初始静态 IDD 失效和 VDD、IDD 值，掉电，中止测试') },
      { id: 'b', text: loc('继续施加触发，看会不会更大') },
      { id: 'c', text: loc('把 IDDQ 放宽后继续') },
    ],
    answer: 'a',
    explain: loc('基准都不正常，后面“和 IDD1 比”就没有意义了；芯片本身已经有问题。'),
  },
  {
    id: 'q6',
    prompt: loc('测输出脚的闩锁时，触发电流怎么配？'),
    options: [
      { id: 'a', text: loc('低态配 TRIGIL，高态配 TRIGIH，每种状态只加一个电流') },
      { id: 'b', text: loc('每种状态都加 TRIGIH 和 TRIGIL') },
      { id: 'c', text: loc('只测高态') },
    ],
    answer: 'a',
    explain: loc('输出在低态时从管脚抽电流、在高态时往管脚灌电流，都是把管脚往电源轨外面推的方向，最容易触发。'),
  },
]
