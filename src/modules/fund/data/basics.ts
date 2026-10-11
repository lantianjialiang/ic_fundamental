import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------- 工程计数法 ---------- */

export type Prefix = { id: string; sym: string; name: LText; exp: number }

export const PREFIXES: Prefix[] = [
  { id: 'G', sym: 'G', name: loc('吉（Giga）', 'Giga'), exp: 9 },
  { id: 'M', sym: 'M', name: loc('兆（Mega）', 'Mega'), exp: 6 },
  { id: 'k', sym: 'k', name: loc('千（Kilo）', 'Kilo'), exp: 3 },
  { id: 'da', sym: 'da', name: loc('十（Deka）', 'Deka'), exp: 1 },
  { id: '1', sym: '', name: loc('无前缀', 'No prefix'), exp: 0 },
  { id: 'd', sym: 'd', name: loc('分（Deci）', 'Deci'), exp: -1 },
  { id: 'm', sym: 'm', name: loc('毫（Milli）', 'Milli'), exp: -3 },
  { id: 'u', sym: 'µ', name: loc('微（Micro）', 'Micro'), exp: -6 },
  { id: 'n', sym: 'n', name: loc('纳（Nano）', 'Nano'), exp: -9 },
]

/** Hz 排第一：换算器默认取第一个前缀 G 和第一个单位，演示 2.5 GHz 这种常见的时钟频率 */
export const UNITS = ['Hz', 'V', 'A', 'Ω', 's'] as const
export type Unit = (typeof UNITS)[number]

export const NOTATION_LEAD: LText[] = [
  loc(
    '测试里的数字跨度很大：电源几伏，漏电几纳安，频率几百兆赫兹。每次都写一串 0 既难看又容易数错。',
    'Numbers in testing span a huge range: supplies of a few volts, leakage of a few nanoamps, frequencies of hundreds of megahertz. Writing long strings of zeros is ugly and easy to miscount.',
  ),
  loc(
    '办法是用 10 的幂。工程上每隔 1000 倍取一个前缀：k 是 10³，M 是 10⁶，m 是 10⁻³，µ 是 10⁻⁶，n 是 10⁻⁹。',
    'The fix is powers of 10. Engineering notation uses one prefix per factor of 1000: k is 10³, M is 10⁶, m is 10⁻³, µ is 10⁻⁶, n is 10⁻⁹.',
  ),
  loc(
    '测试程序和 Datalog 里常见“计算机写法”：1E-3 就是 1 × 10⁻³。键盘上打不出 µ 时，常用 u 代替，比如 10uA。',
    'Test programs and datalogs often use "computer notation": 1E-3 means 1 × 10⁻³. When µ is not on the keyboard, u is used instead, e.g. 10uA.',
  ),
]

/** 保留有效数字并去掉尾随 0 */
export function fmtNum(x: number, digits = 6) {
  if (x === 0) return '0'
  const s = Number(x.toPrecision(digits)).toString()
  return s.replace('e+', 'E+').replace('e-', 'E-')
}

/** 把数值拆成 尾数 × 10^指数 */
export function sci(x: number) {
  if (x === 0) return { m: 0, e: 0 }
  const e = Math.floor(Math.log10(Math.abs(x)) + 1e-12)
  return { m: Number((x / 10 ** e).toPrecision(6)), e }
}

/** 工程写法：指数取 3 的倍数 */
export function eng(x: number) {
  if (x === 0) return { m: 0, e: 0 }
  const e = Math.floor(Math.log10(Math.abs(x)) / 3 + 1e-12) * 3
  return { m: Number((x / 10 ** e).toPrecision(6)), e }
}

export function supNum(n: number) {
  const map: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(n)
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
}

/* ---------- 电压 / 电流 / 电阻 ---------- */

export const VIR: Card[] = [
  {
    id: 'v',
    title: loc('电压 Voltage', 'Voltage'),
    sub: loc('单位 V（伏特） · 公式符号 E', 'Unit V (volt) · symbol E'),
    text: loc(
      '电压是两点之间的电位差。电源负极堆着多余的电子，正极缺电子，这个“落差”就是电压。',
      'Voltage is the potential difference between two points. The negative terminal of a source has excess electrons, the positive terminal lacks them; this "drop" is the voltage.',
    ),
    explain: [
      loc(
        '电压是两点之间的电位差。电源负极堆着多余的电子，正极是正离子，两端的落差可以用电压表量出来，比如 5.0 V。',
        'Voltage is the potential difference between two points. The negative terminal holds excess electrons, the positive terminal holds positive ions, and the difference can be read with a voltmeter, e.g. 5.0 V.',
      ),
      loc(
        '单位 V 来自意大利物理学家伏打（Volta），他最早测量了它。冬天走过地毯被“电”一下，就是你身上积了静电电压。',
        'The unit V comes from the Italian physicist Volta, who first measured it. The shock you get after walking across a carpet in winter is static voltage built up on your body.',
      ),
      loc(
        '公式里电压常写成 E，来自 EMF（ElectroMotive Force，电动势）。也有书直接用 V。',
        'In formulas voltage is often written E, from EMF (ElectroMotive Force). Some books simply use V.',
      ),
    ],
  },
  {
    id: 'i',
    title: loc('电流 Current', 'Current'),
    sub: loc('单位 A（安培） · 公式符号 I', 'Unit A (ampere) · symbol I'),
    text: loc(
      '电流是电荷在导体里的流动。把导线接到电源两端，电荷就会流动，试图抹平电压差。',
      'Current is the flow of charge through a conductor. Connect a wire across a source and charge flows, trying to cancel the voltage difference.',
    ),
    explain: [
      loc(
        '用一根铜线把电源正负极连起来，电荷就会流过导线，想把两端的电位差抹平。这个流动就是电流。',
        'Connect the positive and negative terminals with a copper wire and charge flows through it, trying to even out the potential difference. That flow is current.',
      ),
      loc(
        '单位是安培（A），来自法国物理学家安培，和伏打是同时代人。测试里常见 mA、µA、nA，例如 2.5 mA。',
        'The unit is the ampere (A), after the French physicist Ampère, a contemporary of Volta. In testing you often see mA, µA and nA, e.g. 2.5 mA.',
      ),
      loc('公式符号是 I。', 'The formula symbol is I.'),
    ],
  },
  {
    id: 'r',
    title: loc('电阻 Resistance', 'Resistance'),
    sub: loc('单位 Ω（欧姆） · 公式符号 R', 'Unit Ω (ohm) · symbol R'),
    text: loc(
      '电阻是阻碍电流的“摩擦力”。同样的电压下，电阻越大，电流越小。',
      'Resistance is the "friction" that opposes current. At the same voltage, more resistance means less current.',
    ),
    explain: [
      loc('电阻阻碍电流流动，就像摩擦力阻碍物体运动。', 'Resistance opposes the flow of current, just as friction opposes motion.'),
      loc(
        '单位是欧姆，写成希腊字母 Ω，来自德国物理学家欧姆。公式符号就是 R。',
        'The unit is the ohm, written with the Greek letter Ω, after the German physicist Ohm. The formula symbol is R.',
      ),
      loc(
        '不同材料的电阻差别很大，而且大多数材料的电阻会随温度变化。',
        'Resistance varies widely between materials, and for most materials it also changes with temperature.',
      ),
    ],
  },
]

export type Material = { id: string; name: LText; ohm: number; text: LText }

export const MATERIALS: Material[] = [
  {
    id: 'ag',
    name: loc('银', 'Silver'),
    ohm: 9.9,
    text: loc('银是导电最好的金属，但贵，一般只在触点、镀层上用。', 'Silver is the best conducting metal, but it is expensive, so it is mostly used for contacts and plating.'),
  },
  {
    id: 'cu',
    name: loc('铜', 'Copper'),
    ohm: 10.37,
    text: loc(
      '铜只比银差一点，又便宜得多，所以导线、PCB 走线几乎都是铜。',
      'Copper is only slightly worse than silver and much cheaper, so wires and PCB traces are almost all copper.',
    ),
  },
  {
    id: 'au',
    name: loc('金', 'Gold'),
    ohm: 14.7,
    text: loc(
      '金导电不如铜，但不氧化、很软。芯片的焊线（bond wire）和接触镀层常用金。',
      'Gold conducts worse than copper, but it does not oxidize and is very soft. Chip bond wires and contact plating often use gold.',
    ),
  },
  {
    id: 'al',
    name: loc('铝', 'Aluminum'),
    ohm: 17,
    text: loc(
      '铝比铜差一些，但轻、便宜、好加工。芯片上的 bond pad 就是软铝做的。',
      'Aluminum is a bit worse than copper, but light, cheap and easy to process. The bond pads on a chip are made of soft aluminum.',
    ),
  },
  {
    id: 'ni',
    name: loc('镍', 'Nickel'),
    ohm: 47,
    text: loc('镍的电阻约是铜的 4.5 倍，常做镀层的打底层。', 'Nickel has about 4.5 times the resistance of copper and is often used as an underlayer for plating.'),
  },
  {
    id: 'fe',
    name: loc('铁', 'Iron'),
    ohm: 74,
    text: loc('铁的电阻约是铜的 7 倍，不适合做导线。', 'Iron has about 7 times the resistance of copper, so it is a poor choice for wires.'),
  },
  {
    id: 'c',
    name: loc('碳', 'Carbon'),
    ohm: 21000,
    text: loc(
      '碳的电阻是铜的约 2000 倍，所以常拿来做电阻器，而不是导线。',
      'Carbon has about 2000 times the resistance of copper, so it is used to make resistors, not wires.',
    ),
  },
]

export const MAT_NOTE = loc(
  '教材给出的 25 °C 典型值：同样粗细、同样长度（1 英尺）的导线，数字越大越难导电。条形图按铁 = 满格画，碳远远超出。',
  'Typical values at 25 °C from the textbook, for wires of the same gauge and length (1 foot): the larger the number, the worse it conducts. The bars are scaled so iron = full; carbon goes far off the scale.',
)

export const TC_COEF = { cu: 0.00393, c: -0.0005 }

export const TC_TEXT: LText[] = [
  loc(
    '大多数材料的电阻会随温度变。温度升高、电阻变大，叫正温度系数（positive TC），金属基本都是这样。',
    'The resistance of most materials changes with temperature. If resistance rises as temperature rises, that is a positive temperature coefficient (positive TC); almost all metals behave this way.',
  ),
  loc(
    '温度升高、电阻反而变小，叫负温度系数（negative TC），碳和半导体就是例子。',
    'If resistance falls as temperature rises, that is a negative temperature coefficient (negative TC); carbon and semiconductors are examples.',
  ),
  loc(
    '所以 Datalog 上的电阻、漏电、速度都要注明测试温度。拖一下温度看看。',
    'That is why resistance, leakage and speed in a datalog must always state the test temperature. Drag the temperature to see.',
  ),
]

/* ---------- 欧姆定律测电阻 ---------- */

export const R_NOM = 2000
export const R_TOL = 0.1
export const R_MIN = R_NOM * (1 - R_TOL)
export const R_MAX = R_NOM * (1 + R_TOL)
export const FV_VOLT = 5
export const FI_AMP = 2.5e-3

export const OHM_LEAD: LText[] = [
  loc(
    '欧姆定律：E = I × R。知道其中两个，就能算第三个：I = E / R，R = E / I。',
    "Ohm's law: E = I × R. Know any two and you can compute the third: I = E / R, R = E / I.",
  ),
  loc(
    '测试机只会两件事：加电压测电流，或加电流测电压。它不会直接“量欧姆”，电阻是算出来的。',
    'A tester can do only two things: force voltage / measure current, or force current / measure voltage. It never "measures ohms" directly; resistance is calculated.',
  ),
  loc(
    '而且生产测试通常不关心电阻到底是多少，只关心它在不在规格里。所以我们把电阻规格换算成电流或电压的上下限，让测试机直接比。',
    'Production test usually does not care what the exact resistance is, only whether it is within spec. So we convert the resistance spec into current or voltage limits and let the tester compare directly.',
  ),
]

export type OhmMode = 'fv' | 'fi'

export const OHM_MODE_TEXT: Record<OhmMode, LText> = {
  fv: loc(
    '加压测流：电源给 5.0 V，串联的电流表读电流。电阻最小 1800 Ω 时电流最大 5 / 1800 = 2.78 mA；电阻最大 2200 Ω 时电流最小 5 / 2200 = 2.27 mA。注意：电阻越大，电流越小，上下限是反过来的。',
    'Force voltage / measure current: the source applies 5.0 V and a series ammeter reads the current. At the minimum 1800 Ω the current is highest, 5 / 1800 = 2.78 mA; at the maximum 2200 Ω it is lowest, 5 / 2200 = 2.27 mA. Note: higher resistance means lower current, so the limits are reversed.',
  ),
  fi: loc(
    '加流测压：电流源打 2.5 mA，并联的电压表读压降。1800 Ω × 2.5 mA = 4.5 V，2200 Ω × 2.5 mA = 5.5 V。电阻越大，电压越大。',
    'Force current / measure voltage: the current source forces 2.5 mA and a parallel voltmeter reads the drop. 1800 Ω × 2.5 mA = 4.5 V, 2200 Ω × 2.5 mA = 5.5 V. Higher resistance means higher voltage.',
  ),
}

export const METER_TEXT: Record<OhmMode, LText> = {
  fv: loc(
    '电流表串在回路里，它自己的内阻会加到被测电阻上。所以电流表内阻必须远小于被测电阻：10 Ω 的表测 2000 Ω，误差就有 0.5%。',
    'The ammeter sits in series, so its own internal resistance adds to the resistor under test. Its resistance must be much smaller than the resistor: a 10 Ω meter measuring 2000 Ω already adds 0.5% error.',
  ),
  fi: loc(
    '电压表并在电阻两端，它会分走一部分电流。所以电压表内阻必须远大于被测电阻：10 MΩ 的表测 2000 Ω，只分走约 0.02% 的电流。',
    'The voltmeter sits in parallel and steals some of the current. Its resistance must be much larger than the resistor: a 10 MΩ meter across 2000 Ω takes only about 0.02% of the current.',
  ),
}

export const PICK_I_TEXT = loc(
  '大多数器件工作在 3–5 V。加流测压时，可以挑一个电流让压降刚好落进这个范围：期望 5 kΩ 的电阻，打 1 mA 就得到 5 V。',
  'Most devices operate at 3–5 V. When forcing current, pick a current that puts the voltage drop in that range: for an expected 5 kΩ resistor, forcing 1 mA gives 5 V.',
)

/* ---------- 进制 ---------- */

export const BASE_LEAD: LText[] = [
  loc(
    '十进制：我们有 10 根手指，所以数到 9 以后进位。24 = 2×10¹ + 4×10⁰。罗马数字没有“0”，1996 要写成 MCMXCVI，非常啰嗦。',
    'Decimal: we have 10 fingers, so after 9 we carry. 24 = 2×10¹ + 4×10⁰. Roman numerals have no "0", so 1996 becomes MCMXCVI, which is very clumsy.',
  ),
  loc(
    '二进制：想象每只手只有一根手指，只有 0 和 1，满 2 就进位。每一位代表 2 的幂。一个二进制位叫 bit。电路做“一根手指”比做“十根手指”容易得多，所以计算机内部全是二进制。',
    'Binary: imagine one finger per hand; there are only 0 and 1, and you carry at 2. Each digit is a power of 2. One binary digit is a bit. A circuit with "one finger" is far easier to build than one with "ten fingers", so computers are binary inside.',
  ),
  loc(
    '十六进制：二进制太长，于是每 4 位一组写成一个十六进制位（16 = 2⁴）。0–9 不够用，就借 A–F 表示 10–15。8 个 bit（一个 byte）正好是两位十六进制，FF = 255。',
    'Hexadecimal: binary is too long, so every 4 bits are written as one hex digit (16 = 2⁴). 0–9 is not enough, so A–F stand for 10–15. 8 bits (one byte) is exactly two hex digits; FF = 255.',
  ),
]

export const HEX_TIP = loc(
  '十六进制转十进制最省事的办法：先把每个十六进制位拆成 4 个 bit，再按 2 的幂加起来。点上面的十六进制位，下表会高亮它对应的 4 位；点表里的一行，就把这 4 位改成那个值。',
  'The easiest way to convert hex to decimal: split each hex digit into 4 bits, then add up the powers of 2. Click a hex digit above to highlight its 4 bits in the table; click a row in the table to set those 4 bits to that value.',
)

/* ---------- 逻辑电平 ---------- */

export const VIL = 0.8
export const VIH = 2.0
export const VOL = 0.4
export const VOH = 2.4
export const VDD = 5

export type LevelKind = 0 | 1 | 'x'

export function readAsInput(v: number): LevelKind {
  if (v <= VIL) return 0
  if (v >= VIH) return 1
  return 'x'
}

export function judgeOutput(v: number): LevelKind {
  if (v <= VOL) return 0
  if (v >= VOH) return 1
  return 'x'
}

export const LEVEL_LEAD: LText[] = [
  loc(
    '逻辑电路用电压表示 0 和 1，但不是“0 V 才是 0、5 V 才是 1”，而是各有一个范围。下面是典型 TTL 值，VDD = 5 V。',
    'Logic circuits represent 0 and 1 with voltages, but not as "only 0 V is 0, only 5 V is 1"; each has a range. Below are typical TTL values with VDD = 5 V.',
  ),
  loc(
    '作为输入：≤ 0.8 V 认成 0（VIL），≥ 2.0 V 认成 1（VIH），中间是无效区，电路不知道你给的是什么。',
    'As an input: ≤ 0.8 V reads as 0 (VIL), ≥ 2.0 V reads as 1 (VIH); in between is an invalid zone where the circuit cannot tell what you gave it.',
  ),
  loc(
    '作为输出：合格的 0 必须 ≤ 0.4 V（VOL），合格的 1 必须 ≥ 2.4 V（VOH）。输出的要求比输入严。',
    'As an output: a valid 0 must be ≤ 0.4 V (VOL) and a valid 1 must be ≥ 2.4 V (VOH). Output requirements are tighter than input ones.',
  ),
  loc(
    '严出宽进，中间就留出了噪声容限：输出 0 最多 0.4 V，输入到 0.8 V 还认 0，所以信号上叠加 0.4 V 的噪声也不会出错。1 这一侧同理：2.4 − 2.0 = 0.4 V。',
    'Strict outputs and lenient inputs leave a noise margin: an output 0 is at most 0.4 V and an input still reads 0 up to 0.8 V, so 0.4 V of noise on the signal causes no error. The 1 side is the same: 2.4 − 2.0 = 0.4 V.',
  ),
]

export const TTL_CMOS = loc(
  '做集成电路的两大工艺：TTL（晶体管-晶体管逻辑）和 CMOS（互补金属氧化物半导体）。早年 TTL 更快但更费电，功耗基本恒定；CMOS 的功耗和工作频率成正比，频率越高越费电。CMOS 能在同样面积里塞进更多电路，现在几乎所有新设计都用 CMOS。',
  'The two main IC technologies are TTL (Transistor-Transistor Logic) and CMOS (Complementary Metal-Oxide Semiconductor). Early TTL was faster but used more power, roughly constant; CMOS power is proportional to operating frequency, so higher frequency means more power. CMOS packs more circuitry into the same area, and almost all new designs use it today.',
)

export const PERIOD_TEXT = loc(
  '一个逻辑脉冲重复一次的时间叫周期（Period），也叫 cycle。周期 = 1 / 频率。',
  'The time for a logic pulse to repeat is the period, also called a cycle. Period = 1 / frequency.',
)

/* ---------- 门电路 ---------- */

export type GateId = 'not' | 'and' | 'nand' | 'or' | 'nor'

export const GATES: Array<{ id: GateId; label: string; rule: LText; text: LText }> = [
  {
    id: 'not',
    label: 'NOT',
    rule: loc('输入 0 → 输出 1；输入 1 → 输出 0。', 'Input 0 → output 1; input 1 → output 0.'),
    text: loc(
      '反相器（Inverter）是最基本的门：一个输入、一个输出，把 1 变 0、0 变 1。输出端的小圆圈就表示“取反”。',
      'The inverter is the most basic gate: one input, one output, turning 1 into 0 and 0 into 1. The small bubble at the output means "invert".',
    ),
  },
  {
    id: 'and',
    label: 'AND',
    rule: loc('任一输入为 0 → 输出 0；全部输入为 1 → 输出 1。', 'Any input 0 → output 0; all inputs 1 → output 1.'),
    text: loc(
      '与门：所有输入都是 1，输出才是 1。可以有 2 个或更多输入。只由这类基本门组成的电路叫组合逻辑。',
      'AND gate: the output is 1 only when all inputs are 1. It can have 2 or more inputs. A circuit built only from such basic gates is called combinational logic.',
    ),
  },
  {
    id: 'nand',
    label: 'NAND',
    rule: loc('任一输入为 0 → 输出 1；全部输入为 1 → 输出 0。', 'Any input 0 → output 1; all inputs 1 → output 0.'),
    text: loc(
      '与非门 = 与门后面接一个反相器。在半导体里做 NAND 反而比做 AND 容易，而且优化逻辑时常用它减少总门数，所以它比 AND 更常见。',
      'NAND = an AND gate followed by an inverter. In silicon a NAND is actually easier to build than an AND, and logic optimization often uses it to reduce the total gate count, so it is more common than AND.',
    ),
  },
  {
    id: 'or',
    label: 'OR',
    rule: loc('全部输入为 0 → 输出 0；任一输入为 1 → 输出 1。', 'All inputs 0 → output 0; any input 1 → output 1.'),
    text: loc('或门：只要有一个输入是 1，输出就是 1。', 'OR gate: if any input is 1, the output is 1.'),
  },
  {
    id: 'nor',
    label: 'NOR',
    rule: loc('全部输入为 0 → 输出 1；任一输入为 1 → 输出 0。', 'All inputs 0 → output 1; any input 1 → output 0.'),
    text: loc(
      '或非门 = 或门后面接一个反相器。和 NAND 一样，它比 OR 更容易在硅上实现，也常用来减少门数。',
      'NOR = an OR gate followed by an inverter. Like NAND, it is easier to build in silicon than OR and is often used to reduce gate count.',
    ),
  },
]

export function gateOut(id: GateId, a: number, b: number) {
  switch (id) {
    case 'not':
      return a ? 0 : 1
    case 'and':
      return a && b ? 1 : 0
    case 'nand':
      return a && b ? 0 : 1
    case 'or':
      return a || b ? 1 : 0
    case 'nor':
      return a || b ? 0 : 1
  }
}

export const INV_TERMS: Array<{ id: string; label: string; text: LText }> = [
  {
    id: 't0',
    label: 'T0',
    text: loc(
      '每个测试周期从 T0（time zero）开始。一个周期的长度就是测试周期（test period），这里是 100 ns，也就是 10 MHz。',
      'Every test cycle starts at T0 (time zero). The length of one cycle is the test period, here 100 ns, i.e. 10 MHz.',
    ),
  },
  {
    id: 'vin',
    label: 'VIL / VIH',
    text: loc(
      'VIL 和 VIH 是测试机加到输入脚上的电压：给 0 就打 VIL（例如 0.8 V 或更低），给 1 就打 VIH（例如 2.0 V 或更高）。',
      'VIL and VIH are the voltages the tester drives onto input pins: a 0 is driven at VIL (e.g. 0.8 V or lower), a 1 at VIH (e.g. 2.0 V or higher).',
    ),
  },
  {
    id: 'vout',
    label: 'VOL / VOH',
    text: loc(
      'VOL 和 VOH 是输出脚的期望电平：期望 0 时输出必须 ≤ VOL（0.4 V），期望 1 时必须 ≥ VOH（2.4 V），否则判 Fail。',
      'VOL and VOH are the expected output levels: when 0 is expected the output must be ≤ VOL (0.4 V), when 1 is expected it must be ≥ VOH (2.4 V), otherwise it fails.',
    ),
  },
  {
    id: 'strobe',
    label: 'Strobe',
    text: loc(
      '黄线是比较时刻：输出变化需要一点时间（传播延迟），所以测试机等输出稳定后才去比。',
      'The yellow line is the strobe: the output takes a little time to change (propagation delay), so the tester waits until it settles before comparing.',
    ),
  },
]

export const INV_CAP = loc(
  '反相器的 4 个测试周期：第 1 拍输入 1、期望输出 0；第 2 拍输入 0、期望输出 1；然后重复。',
  'Four test cycles for an inverter: cycle 1 drives 1 and expects 0; cycle 2 drives 0 and expects 1; then repeat.',
)

/* ---------- D 触发器 ---------- */

export const DFF_LEAD: LText[] = [
  loc(
    '触发器（flip-flop）的输出只在时钟到来时“翻转”，因此得名。最常用的是边沿触发：只在时钟跳变的那一刻动作。',
    'A flip-flop gets its name because its output only "flips" when the clock arrives. The most common type is edge-triggered: it acts only at the instant the clock changes.',
  ),
  loc(
    'D 触发器：在 CLK 上升沿那一刻，把 D 的电平复制到 Q。可以把 D 记成 Duplicate（复制）。',
    'D flip-flop: at the rising edge of CLK, the level on D is copied to Q. Think of D as "Duplicate".',
  ),
  loc(
    '两次上升沿之间，D 随便怎么变，Q 都不动——它“记住”了上次采到的值。所以 D 触发器就是 1 位存储器。',
    'Between rising edges, D can change freely and Q does not move; it "remembers" the last sampled value. So a D flip-flop is a 1-bit memory.',
  ),
  loc(
    '触发器还可能有 Preset / Clear 输入和反相输出 Q/。另外还有 T 触发器、J-K 触发器，这里不展开。',
    'Flip-flops may also have Preset / Clear inputs and an inverted output Q/. There are also T and J-K flip-flops, not covered here.',
  ),
]

export const DFF_CYCLES = 8
/** 每个周期分 4 小格，CLK 前半低、后半高，上升沿在 k + 0.5 */
export const DFF_SUB = 4

export function dffQ(d: number[], time: number): 0 | 1 | 'z' {
  // time 以周期为单位
  let q: 0 | 1 | 'z' = 'z'
  for (let k = 0; k < d.length; k += 1) {
    if (k + 0.5 <= time) q = d[k] ? 1 : 0
  }
  return q
}

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc(
    '前缀每隔 1000 倍一档：n、µ、m、k、M、G；计算机写法 1E-3 = 1 × 10⁻³。',
    'Prefixes step by factors of 1000: n, µ, m, k, M, G; computer notation 1E-3 = 1 × 10⁻³.',
  ),
  loc(
    'E = I × R。测试机加压测流或加流测压，把电阻规格换成电流或电压上下限直接比。',
    'E = I × R. The tester forces voltage / measures current or forces current / measures voltage, converting the resistance spec into current or voltage limits to compare directly.',
  ),
  loc(
    '电流表内阻要远小，电压表内阻要远大，否则表本身会改变测量结果。',
    'An ammeter needs very low internal resistance and a voltmeter very high, otherwise the meter itself changes the result.',
  ),
  loc(
    '4 个 bit = 1 位十六进制，8 个 bit = 1 byte；BD₁₆ = 1011 1101₂ = 189。',
    '4 bits = 1 hex digit, 8 bits = 1 byte; BD₁₆ = 1011 1101₂ = 189.',
  ),
  loc(
    'TTL 典型电平 VIL 0.8 / VIH 2.0 / VOL 0.4 / VOH 2.4，噪声容限 0.4 V；D 触发器在上升沿采样，是 1 位存储器。',
    'Typical TTL levels VIL 0.8 / VIH 2.0 / VOL 0.4 / VOH 2.4, noise margin 0.4 V; a D flip-flop samples on the rising edge and is a 1-bit memory.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Datalog 里写着漏电 3.5E-8 A。换成常用前缀是多少？', 'A datalog shows leakage of 3.5E-8 A. What is that with a common prefix?'),
    options: [
      { id: 'a', text: loc('35 nA', '35 nA') },
      { id: 'b', text: loc('3.5 nA', '3.5 nA') },
      { id: 'c', text: loc('35 µA', '35 µA') },
      { id: 'd', text: loc('350 pA', '350 pA') },
    ],
    answer: 'a',
    explain: loc('3.5E-8 = 3.5 × 10⁻⁸ = 35 × 10⁻⁹，n 是 10⁻⁹，所以是 35 nA。', '3.5E-8 = 3.5 × 10⁻⁸ = 35 × 10⁻⁹, and n is 10⁻⁹, so it is 35 nA.'),
  },
  {
    id: 'q2',
    prompt: loc(
      '电阻规格 2000 Ω ±10%，加 5.0 V 测电流。电流的上下限应该设多少？',
      'A resistor is specified at 2000 Ω ±10%. Forcing 5.0 V and measuring current, what should the current limits be?',
    ),
    options: [
      { id: 'a', text: loc('下限 2.27 mA，上限 2.78 mA', 'Low 2.27 mA, high 2.78 mA') },
      { id: 'b', text: loc('下限 2.25 mA，上限 2.75 mA', 'Low 2.25 mA, high 2.75 mA') },
      { id: 'c', text: loc('下限 1.8 mA，上限 2.2 mA', 'Low 1.8 mA, high 2.2 mA') },
      { id: 'd', text: loc('下限 4.5 mA，上限 5.5 mA', 'Low 4.5 mA, high 5.5 mA') },
    ],
    answer: 'a',
    explain: loc(
      '电阻范围 1800–2200 Ω。I = E / R：5 / 2200 = 2.27 mA（电阻最大、电流最小），5 / 1800 = 2.78 mA（电阻最小、电流最大）。电流不是简单地 ±10%。',
      'The resistance range is 1800–2200 Ω. I = E / R: 5 / 2200 = 2.27 mA (max resistance, min current), 5 / 1800 = 2.78 mA (min resistance, max current). The current is not simply ±10%.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('十六进制 BD 等于十进制多少？', 'What is hex BD in decimal?'),
    options: [
      { id: 'a', text: loc('189', '189') },
      { id: 'b', text: loc('173', '173') },
      { id: 'c', text: loc('219', '219') },
      { id: 'd', text: loc('1113', '1113') },
    ],
    answer: 'a',
    explain: loc(
      'B = 1011，D = 1101，BD = 1011 1101₂ = 128 + 32 + 16 + 8 + 4 + 1 = 189。也可以算 11×16 + 13 = 189。',
      'B = 1011, D = 1101, BD = 1011 1101₂ = 128 + 32 + 16 + 8 + 4 + 1 = 189. Or compute 11×16 + 13 = 189.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'TTL 输出合格的 0 不超过 0.4 V，输入 0.8 V 以下认成 0。低电平的噪声容限是多少？',
      'A valid TTL output 0 is at most 0.4 V, and an input reads 0 below 0.8 V. What is the low-level noise margin?',
    ),
    options: [
      { id: 'a', text: loc('0.4 V', '0.4 V') },
      { id: 'b', text: loc('0.8 V', '0.8 V') },
      { id: 'c', text: loc('1.2 V', '1.2 V') },
      { id: 'd', text: loc('2.0 V', '2.0 V') },
    ],
    answer: 'a',
    explain: loc(
      '噪声容限 = VIL − VOL = 0.8 − 0.4 = 0.4 V。输出最差 0.4 V，再叠加不超过 0.4 V 的噪声，接收端仍然认成 0。',
      'Noise margin = VIL − VOL = 0.8 − 0.4 = 0.4 V. With a worst-case output of 0.4 V plus up to 0.4 V of noise, the receiver still reads 0.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('NAND 门两个输入 A = 1、B = 0，输出是？', 'A NAND gate has inputs A = 1, B = 0. What is the output?'),
    options: [
      { id: 'a', text: loc('1', '1') },
      { id: 'b', text: loc('0', '0') },
      { id: 'c', text: loc('无效电平', 'Invalid level') },
    ],
    answer: 'a',
    explain: loc(
      'NAND 只有在全部输入都是 1 时才输出 0。有一个输入是 0，输出就是 1。',
      'A NAND outputs 0 only when all inputs are 1. If any input is 0, the output is 1.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '上升沿触发的 D 触发器，上升沿时 D = 1，随后在下一次上升沿之前 D 变成 0。这期间 Q 是多少？',
      'A rising-edge D flip-flop sees D = 1 at the rising edge, then D changes to 0 before the next rising edge. What is Q during this time?',
    ),
    options: [
      { id: 'a', text: loc('保持 1，直到下一次上升沿', 'Stays 1 until the next rising edge') },
      { id: 'b', text: loc('跟着 D 立刻变成 0', 'Follows D and becomes 0 at once') },
      { id: 'c', text: loc('变成无效电平', 'Goes to an invalid level') },
    ],
    answer: 'a',
    explain: loc(
      'D 触发器只在时钟上升沿采样。两个边沿之间 D 怎么变都不影响 Q，这就是“1 位存储器”。',
      'A D flip-flop samples only on the rising clock edge. Between edges, changes on D do not affect Q; that is what "1-bit memory" means.',
    ),
  },
]
