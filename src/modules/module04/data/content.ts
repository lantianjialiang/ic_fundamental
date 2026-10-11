import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const INTRO = loc(
  '上一课的 Comparator 把电压读成 H / L。可管脚上的电压是连续的，不只两个值。这一课看两件事：ATE 怎样用门限把电压翻译成 0/1；需要电压、电流数值本身时，怎样用 PMU 去量。',
  'In the last lesson the comparator read a voltage as H / L. But a pin voltage is continuous, not just two values. This lesson covers two things: how ATE uses thresholds to translate voltage into 0/1, and how the PMU measures the voltage or current itself when the number matters.',
)

export const VMAX = 3.3

export type PinSide = 'input' | 'output'

/** 教学门限：输入 VIL / VIH（DUT 怎么认），输出 VOL / VOH（ATE 怎么看） */
export const SIDES: Record<
  PinSide,
  { label: LText; lo: number; hi: number; loName: string; hiName: string; sym: [string, string]; text: LText }
> = {
  input: {
    label: loc('输入脚：DUT 怎么认', 'Input pin: how the DUT reads it'),
    lo: 0.8,
    hi: 2.0,
    loName: 'VIL',
    hiName: 'VIH',
    sym: ['0', '1'],
    text: loc(
      '规格书保证：不高于 VIL 一定认成 0，不低于 VIH 一定认成 1。中间 DUT 可能认成任何一个。所以 ATE 驱动时，1 要给得比 VIH 高、0 要给得比 VIL 低。',
      'The datasheet guarantees: at or below VIL is always 0, at or above VIH is always 1. In between, the DUT may read either. So when the ATE drives, a 1 must be above VIH and a 0 below VIL.',
    ),
  },
  output: {
    label: loc('输出脚：ATE 怎么看', 'Output pin: how the ATE reads it'),
    lo: 0.4,
    hi: 2.4,
    loName: 'VOL',
    hiName: 'VOH',
    sym: ['L', 'H'],
    text: loc(
      'Comparator 用 VOL / VOH 两条线：高于 VOH 读成 H，低于 VOL 读成 L。落在中间既不是 H 也不是 L，期望什么都判 Fail。',
      'The comparator uses two lines, VOL and VOH: above VOH reads H, below VOL reads L. In between is neither, so it fails whatever was expected.',
    ),
  },
}

export type Zone = 'lo' | 'mid' | 'hi'

export function zoneOf(side: PinSide, volts: number): Zone {
  const s = SIDES[side]
  if (volts >= s.hi) return 'hi'
  if (volts <= s.lo) return 'lo'
  return 'mid'
}

export type PmuMode = 'fvmi' | 'fimv'

export const MODES: Array<{ id: PmuMode; title: LText; sub: LText; text: LText }> = [
  {
    id: 'fvmi',
    title: loc('FVMI 加压测流', 'FVMI: force V, measure I'),
    sub: loc('例：输入漏电 IIL / IIH、静态电流 IDDQ', 'e.g. input leakage IIL / IIH, quiescent current IDDQ'),
    text: loc(
      'PMU 把管脚钉在一个电压上，读流过的电流。漏电太大说明输入结构有问题。',
      'The PMU holds the pin at a set voltage and reads the current that flows. Too much leakage means the input structure is faulty.',
    ),
  },
  {
    id: 'fimv',
    title: loc('FIMV 加流测压', 'FIMV: force I, measure V'),
    sub: loc('例：开短路、输出 VOH / VOL', 'e.g. opens/shorts, output VOH / VOL'),
    text: loc(
      'PMU 往管脚里灌或抽一个固定电流，读管脚上的电压。下面的开短路就是这种测法。',
      'The PMU pushes or pulls a fixed current through the pin and reads the pin voltage. The opens/shorts test below works this way.',
    ),
  },
]

export const PMU_MORE = loc(
  '钳位、量程、Kelvin 连接这些仪器细节见 {@fIntro}；各项 DC 参数怎么测见 {@dc}。',
  'Instrument details such as clamps, ranges, and Kelvin connection are in {@fIntro}; how each DC parameter is measured is in {@dc}.',
)

/* ---------- 开短路：所有脚接 0 V，−100 µA，钳位 ±3 V ---------- */

export type Fault = 'good' | 'open' | 'short'

export const FORCE_UA = -100
export const CLAMP = 3
export const OPEN_LIMIT = -1.5
export const SHORT_LIMIT = -0.2

export const FAULTS: Array<{ id: Fault; label: LText; volt: number; text: LText }> = [
  {
    id: 'good',
    label: loc('正常', 'Good'),
    volt: -0.65,
    text: loc(
      '电流从 0 V 的 VSS 经对地保护二极管流到管脚，再被 PMU 抽走。二极管正偏，读到一个压降，约 −0.65 V。',
      'Current flows from VSS at 0 V through the ground protection diode to the pin and into the PMU. The diode is forward-biased, so the pin reads one diode drop, about −0.65 V.',
    ),
  },
  {
    id: 'open',
    label: loc('开路', 'Open'),
    volt: -CLAMP,
    text: loc(
      '探针没扎上或焊线断了，电流无路可走。PMU 一直把电压往负推，直到撞上 −3 V 钳位。',
      'The needle missed or a bond wire is broken, so the current has no path. The PMU keeps pushing the voltage negative until it hits the −3 V clamp.',
    ),
  },
  {
    id: 'short',
    label: loc('短路', 'Short'),
    volt: -0.004,
    text: loc(
      '管脚直接短到地（或短到此刻也接 0 V 的相邻脚）。电流从短路处走，不经过二极管，读数接近 0 V。',
      'The pin is shorted to ground (or to a neighbor that is also at 0 V right now). Current takes the short instead of the diode, so the reading is close to 0 V.',
    ),
  },
]

export type Verdict = 'pass' | 'open' | 'short'

export function judge(volt: number): Verdict {
  if (volt < OPEN_LIMIT) return 'open'
  if (volt > SHORT_LIMIT) return 'short'
  return 'pass'
}

export const VERDICT: Record<Verdict, LText> = {
  pass: loc('PASS：读到二极管压降，接触良好。', 'PASS: one diode drop, the contact is good.'),
  open: loc('FAIL 开路：比 −1.5 V 更负。', 'FAIL open: more negative than −1.5 V.'),
  short: loc('FAIL 短路：比 −0.2 V 更接近 0。', 'FAIL short: closer to 0 than −0.2 V.'),
}

export const OPENS_SETUP = loc(
  '设置：所有管脚（包括 VDD）接 0 V；PMU 对被测脚加 −100 µA，电压钳位 ±3 V。判定：比 −1.5 V 更负 → 开路；比 −0.2 V 更接近 0 → 短路；中间 → Pass。完整做法（正向电流、阻性短路、读 Datalog）见 {@fOpens}。',
  'Setup: every pin, VDD included, at 0 V; the PMU forces −100 µA into the pin under test with a ±3 V clamp. Verdict: more negative than −1.5 V → open; closer to 0 than −0.2 V → short; in between → Pass. The full method (positive current, resistive shorts, reading the datalog) is in {@fOpens}.',
)

export const TAKEAWAY: LText[] = [
  loc('芯片里没有抽象的 0/1，只有电压和电流；ATE 用门限把它们翻译成 0/1。', 'There is no abstract 0/1 inside a chip, only voltages and currents; ATE uses thresholds to translate them into 0/1.'),
  loc('输入看 VIL / VIH，输出看 VOL / VOH；两条线之间是不确定区，不算 0 也不算 1。', 'Inputs use VIL / VIH, outputs use VOL / VOH; between the two lines is an uncertain zone that is neither 0 nor 1.'),
  loc('PMU 量数值本身，方式是 Force / Measure：加压测流（FVMI）或加流测压（FIMV）。', 'The PMU measures the value itself by force / measure: force voltage and measure current (FVMI), or force current and measure voltage (FIMV).'),
  loc('开短路是第一项 PMU 测试：−100 µA 下正常约 −0.65 V，开路撞钳位约 −3 V，短路接近 0 V。', 'Opens/shorts is the first PMU test: at −100 µA a good pin reads about −0.65 V, an open hits the clamp near −3 V, a short reads close to 0 V.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('PMU 和 Digital Channel 的 Comparator 有什么不同？', 'How does the PMU differ from a digital channel’s comparator?'),
    options: [
      { id: 'a', text: loc('Comparator 只判高低；PMU 给出电压或电流的具体数值', 'The comparator only judges high/low; the PMU gives the actual voltage or current value') },
      { id: 'b', text: loc('两者完全一样', 'They are exactly the same') },
      { id: 'c', text: loc('PMU 只能判 0/1', 'The PMU can only judge 0/1') },
    ],
    answer: 'a',
    explain: loc('Comparator 是翻译后的 0/1；PMU 留下翻译之前的物理量，再和规格比。', 'The comparator gives the translated 0/1; the PMU keeps the physical value before translation and compares it with the spec.'),
  },
  {
    id: 'q2',
    prompt: loc('输入脚 VIL = 0.8 V、VIH = 2.0 V。给它 1.2 V，DUT 会认成什么？', 'An input has VIL = 0.8 V and VIH = 2.0 V. Given 1.2 V, what does the DUT read?'),
    options: [
      { id: 'a', text: loc('一定是 1', 'Always 1') },
      { id: 'b', text: loc('一定是 0', 'Always 0') },
      { id: 'c', text: loc('不确定，可能是 0 也可能是 1', 'Uncertain — it may read 0 or 1') },
    ],
    answer: 'c',
    explain: loc('1.2 V 在 VIL 和 VIH 之间，规格书不保证结果。', '1.2 V lies between VIL and VIH, where the datasheet guarantees nothing.'),
  },
  {
    id: 'q3',
    prompt: loc('VIH / VIL 和 VOH / VOL 各说的是哪一类管脚？', 'Which kind of pin do VIH / VIL and VOH / VOL describe?'),
    options: [
      { id: 'a', text: loc('VIH / VIL 说输出，VOH / VOL 说输入', 'VIH / VIL are outputs; VOH / VOL are inputs') },
      { id: 'b', text: loc('VIH / VIL 说输入，VOH / VOL 说输出', 'VIH / VIL are inputs; VOH / VOL are outputs') },
      { id: 'c', text: loc('四个都是电流', 'All four are currents') },
    ],
    answer: 'b',
    explain: loc('I = Input，O = Output。', 'I = Input, O = Output.'),
  },
  {
    id: 'q4',
    prompt: loc('开短路测试中，PMU 加 −100 µA，某脚读到 −2.98 V。这是什么？', 'In an opens/shorts test the PMU forces −100 µA and a pin reads −2.98 V. What is it?'),
    options: [
      { id: 'a', text: loc('正常', 'Good') },
      { id: 'b', text: loc('开路：电流无路可走，电压撞到 −3 V 钳位', 'Open: the current has no path and the voltage hits the −3 V clamp') },
      { id: 'c', text: loc('短路', 'Short') },
    ],
    answer: 'b',
    explain: loc('比 −1.5 V 更负判开路；读数约等于钳位值，正是开路的特征。', 'More negative than −1.5 V is an open; a reading at the clamp value is the signature of an open.'),
  },
  {
    id: 'q5',
    prompt: loc('想测输入脚的漏电流，PMU 用哪种方式？', 'To measure an input pin’s leakage current, which PMU mode do you use?'),
    options: [
      { id: 'a', text: loc('FVMI：加电压，测电流', 'FVMI: force voltage, measure current') },
      { id: 'b', text: loc('FIMV：加电流，测电压', 'FIMV: force current, measure voltage') },
      { id: 'c', text: loc('跑 Pattern 看 H / L', 'Run a pattern and look at H / L') },
    ],
    answer: 'a',
    explain: loc('要的结果是电流，就加电压、测电流。', 'The answer you want is a current, so force voltage and measure current.'),
  },
]
