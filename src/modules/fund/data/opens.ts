import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const WHY: LText[] = [
  loc('开短路（Continuity / Opens-Shorts）通常安排在测试流程前段，用来检查测试通道与被测引脚之间是否有预期的导通路径。', 'Opens/shorts (continuity) is usually checked early in the test flow to verify the expected conduction paths between tester channels and DUT pins.'),
  loc('它能抓到：探针没扎上、Socket 接触不良、焊线断了（开路）；相邻管脚连锡、焊线碰在一起、管脚对电源或地短路（短路）。', 'It catches probes that missed the pad, poor socket contact and broken bond wires (opens); solder bridges between adjacent pins, touching bond wires, and pins shorted to power or ground (shorts).'),
  loc('它也是保护：短路的芯片如果直接上电跑功能，可能烧芯片、烧针卡、甚至伤测试机。先花几毫秒确认接触，后面的测试才有意义。', 'It is also protection: powering up a shorted chip and running functional tests can burn the chip, the probe card, or even damage the tester. A few milliseconds spent confirming contact make every later test meaningful.'),
]

export const HOW: LText[] = [
  loc('把所有管脚——包括 VDD——都接到 0 V。', 'Connect every pin - including VDD - to 0 V.'),
  loc('PMU 对被测脚强加 −100 µA（常见范围 100–500 µA），电压钳位 ±3 V。', 'The PMU forces −100 µA into the pin under test (typical range 100–500 µA) with a ±3 V voltage clamp.'),
  loc('电流从地经过对地保护二极管流出被测脚，二极管正偏，读到约 −0.65 V。', 'Current flows from ground through the ground protection diode and out of the pin; the diode is forward-biased and reads about −0.65 V.'),
  loc('和极限比：比 −1.5 V 还负 → 开路；比 −0.2 V 还接近 0 → 短路；中间 → Pass。', 'Compare with the limits: more negative than −1.5 V → open; closer to 0 than −0.2 V → short; in between → Pass.'),
  loc('再打 +100 µA 测对 VDD 的那只二极管，极限镜像为 +0.2 V ~ +1.5 V。', 'Then force +100 µA to test the diode to VDD; the limits mirror to +0.2 V ~ +1.5 V.'),
  loc('换下一个管脚，直到全部测完。', 'Move to the next pin until all pins are tested.'),
]

export type Fault = 'good' | 'open' | 'short' | 'neighbor' | 'res'

export const FAULTS: Array<{ id: Fault; label: LText; text: LText }> = [
  { id: 'good', label: loc('正常', 'Good'), text: loc('保护二极管正偏，读到一个二极管压降，约 0.65 V。', 'The protection diode is forward-biased, reading one diode drop, about 0.65 V.') },
  { id: 'open', label: loc('开路', 'Open'), text: loc('电流没有路可走，PMU 一直把电压往外推，直到撞上 ±3 V 钳位。', 'The current has no path, so the PMU keeps pushing the voltage until it hits the ±3 V clamp.') },
  { id: 'short', label: loc('对地短路', 'Short to GND'), text: loc('管脚直接接到 0 V，电流从短路点流走，读到接近 0 V。', 'The pin is tied directly to 0 V; current escapes through the short and the reading is near 0 V.') },
  { id: 'neighbor', label: loc('和相邻脚短路', 'Short to neighbor'), text: loc('相邻管脚此刻也接在 0 V，所以看起来和对地短路一样，读到接近 0 V。', 'The adjacent pin is also at 0 V right now, so it looks just like a short to ground, reading near 0 V.') },
  { id: 'res', label: loc('阻性短路 1 kΩ', 'Resistive 1 kΩ'), text: loc('不是硬短，而是 1 kΩ 漏到地。电压 = 电流 × 1 kΩ，电流越大读数越高。', 'Not a hard short but a 1 kΩ leak to ground. Voltage = current × 1 kΩ, so more current gives a higher reading.') },
]

export const CLAMP = 3
export const OPEN_LIMIT = 1.5
export const SHORT_LIMIT = 0.2

/** 返回被测脚电压（带符号） */
export function measure(fault: Fault, pos: boolean, microAmp: number) {
  const sign = pos ? 1 : -1
  const diode = 0.65 + 0.026 * Math.log(microAmp / 100)
  if (fault === 'good') return sign * diode
  if (fault === 'open') return sign * CLAMP
  if (fault === 'short' || fault === 'neighbor') return sign * 0.004
  return sign * Math.min(diode, microAmp * 1e-6 * 1000)
}

export type Verdict = 'pass' | 'open' | 'short'

export function judge(volt: number): Verdict {
  const mag = Math.abs(volt)
  if (mag > OPEN_LIMIT) return 'open'
  if (mag < SHORT_LIMIT) return 'short'
  return 'pass'
}

export const VERDICT_TEXT: Record<Verdict, LText> = {
  pass: loc('PASS：读到二极管压降，接触良好。', 'PASS: a diode drop is read; contact is good.'),
  open: loc('FAIL：开路。电压冲到钳位，说明电流没有通路。', 'FAIL: open. The voltage ran to the clamp, so the current has no path.'),
  short: loc('FAIL：短路。电压不到 0.2 V，电流没走保护二极管，而是从别的路径流走了。', 'FAIL: short. The voltage is under 0.2 V; the current bypassed the protection diode through another path.'),
}

export const RES_NOTE = loc('试试阻性短路：100 µA 时 1 kΩ 只压降 0.1 V，判短路；把电流加到 250 µA 以上，压降超过 0.2 V，它就“混过去”了。电流不是越大越好。', 'Try the resistive short: at 100 µA, 1 kΩ drops only 0.1 V and is judged a short; raise the current above 250 µA and the drop exceeds 0.2 V, so it "slips through". More current is not always better.')

export const DATALOG: Array<{ pin: string; volt: number; answer: Verdict; why: LText }> = [
  { pin: 'A0', volt: -0.652, answer: 'pass', why: loc('一个二极管压降，正常。', 'One diode drop - normal.') },
  { pin: 'A1', volt: -0.648, answer: 'pass', why: loc('正常。', 'Normal.') },
  { pin: 'A2', volt: -2.999, answer: 'open', why: loc('撞到 −3 V 钳位，典型开路：探针没扎上或焊线断。', 'Hit the −3 V clamp - a classic open: probe missed or bond wire broken.') },
  { pin: 'A3', volt: -0.661, answer: 'pass', why: loc('正常。', 'Normal.') },
  { pin: 'D0', volt: -0.003, answer: 'short', why: loc('几乎 0 V，硬短路。', 'Almost 0 V - a hard short.') },
  { pin: 'D1', volt: -0.012, answer: 'short', why: loc('D1、D2 同时约 0 V，而且相邻——很可能是两脚之间连锡。', 'D1 and D2 both read about 0 V and are adjacent - most likely a solder bridge between them.') },
  { pin: 'D2', volt: -0.011, answer: 'short', why: loc('和 D1 一起看：相邻脚互短，测其中一个时另一个接地，所以两个都读到 0 V。', 'Read together with D1: adjacent pins shorted together; while one is tested the other is grounded, so both read 0 V.') },
  { pin: 'OE', volt: -0.124, answer: 'short', why: loc('−0.12 V 没超过 −0.2 V，判短路。数值不是 0，更像阻性漏电，例如约 1 kΩ 到地。', '−0.12 V does not reach −0.2 V, so it is a short. Since it is not 0, it looks like resistive leakage, e.g. about 1 kΩ to ground.') },
  { pin: 'CS1', volt: -1.82, answer: 'open', why: loc('比 −1.5 V 更负但没到钳位：接触电阻很大或半开路，按开路处理。', 'More negative than −1.5 V but short of the clamp: high contact resistance or a partial open; treat it as open.') },
]

export const TAKEAWAY: LText[] = [
  loc('尽早检查开短路可以发现接触异常，也能在后续测试前发现低阻短接。', 'An early continuity check can catch contact problems and low-resistance shorts before later tests.'),
  loc('本课示例中，未测引脚接 0 V，PMU 对当前引脚强加 ±100 µA，电压钳位设为 ±3 V。正常读数的绝对值约为 0.65 V。', 'In this example, untested pins are held at 0 V. The PMU forces ±100 µA on the pin under test with a ±3 V voltage clamp. A good reading has a magnitude of about 0.65 V.'),
  loc('按本例限值，电压绝对值超过 1.5 V 判开路，低于 0.2 V 判短路。', 'Using the example limits, a voltage magnitude above 1.5 V is classified as an open and below 0.2 V as a short.'),
  loc('相邻脚互短看起来和对地短路一样；看 Datalog 时要把相邻脚放在一起看。', 'A short between adjacent pins looks like a short to ground; read adjacent pins together in the datalog.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'continuity-compare',
    prompt: loc('按本课的判定窗口，另一颗 DUT 的某引脚在 −100 µA 下读到 −0.08 V，应先调查哪一种故障？', 'Using the lesson limits, a pin on another DUT reads −0.08 V at −100 µA. Which fault should you investigate first?'),
    options: [
      { id: 'good', text: loc('正常接触', 'Good contact') },
      { id: 'open', text: loc('开路', 'Open') },
      { id: 'short', text: loc('短路或其他低阻路径', 'Short or another low-resistance path') },
    ],
    answer: 'short',
    explain: loc('读数绝对值 0.08 V 低于本例的 0.20 V 下限，先检查电流是否经低阻路径绕开了保护二极管。', 'The reading magnitude is 0.08 V, below the example’s 0.20 V lower limit. Check whether a low-resistance path bypasses the protection diode.'),
  },
  {
    id: 'q3',
    prompt: loc('为什么要设电压钳位 ±3 V？', 'Why set a ±3 V voltage clamp?'),
    options: [
      { id: 'a', text: loc('开路时限制电压，避免损伤芯片或在别的脚上引起意外导通', 'To limit the voltage on an open, avoiding chip damage or unintended conduction on other pins') },
      { id: 'b', text: loc('为了测得更准', 'For more accurate measurement') },
      { id: 'c', text: loc('没有原因', 'No reason') },
    ],
    answer: 'a',
    explain: loc('恒流源遇到开路会把电压推得很高，钳位是安全措施。', 'A current source facing an open pushes the voltage very high; the clamp is a safety measure.'),
  },
  {
    id: 'q4',
    prompt: loc('相邻两脚连锡，两脚分别测时会看到？', 'Two adjacent pins are solder-bridged. Testing each separately shows?'),
    options: [
      { id: 'a', text: loc('两脚都读到约 0 V', 'Both read about 0 V') },
      { id: 'b', text: loc('两脚都读到 −3 V', 'Both read −3 V') },
      { id: 'c', text: loc('两脚都正常', 'Both are normal') },
    ],
    answer: 'a',
    explain: loc('测一个脚时，另一个脚接在 0 V，电流从连锡处流走。', 'While one pin is tested, the other sits at 0 V, and the current escapes through the bridge.'),
  },
  {
    id: 'q5',
    prompt: loc('测试电流为什么不是越大越好？', 'Why is a larger test current not always better?'),
    options: [
      { id: 'a', text: loc('阻性短路的压降随电流变大，可能超过 0.2 V 而被误判为 Pass', 'A resistive short\'s drop grows with current and may exceed 0.2 V, wrongly passing') },
      { id: 'b', text: loc('大电流测得更慢', 'Large currents measure more slowly') },
      { id: 'c', text: loc('大电流一定会烧芯片', 'Large currents always burn the chip') },
    ],
    answer: 'a',
    explain: loc('100 µA 量级既能让二极管正偏，又能把几 kΩ 级的漏电暴露出来。', 'Around 100 µA is enough to forward-bias the diode while still exposing leakage of a few kΩ.'),
  },
  {
    id: 'b1',
    prompt: loc('按本课 DUT 的测试设置，开始逐脚测量前，各引脚设到什么电位？', 'In this lesson’s DUT setup, what voltage are the pins set to before the pin-by-pin measurements begin?'),
    options: [
      { id: 'a', text: loc('全部接 VDD', 'All tied to VDD') },
      { id: 'b', text: loc('全部接地（0 V），包括 VDD 管脚', 'All grounded (0 V), including the VDD pin') },
      { id: 'c', text: loc('全部悬空', 'All floating') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('所有管脚（包括电源和地）都接 0 V。这样两只保护二极管都有确定的参考点：VDD 也是 0 V，打 +100 µA 才能让对 VDD 的二极管正偏；相邻脚接地，脚间短路才会表现为读数接近 0 V。悬空的脚电位不定，读数没有意义。', 'All pins (including power and ground) go to 0 V. That gives both protection diodes a defined reference: with VDD also at 0 V, forcing +100 µA forward-biases the diode to VDD; with neighbors grounded, a pin-to-pin short shows up as a near-0 V reading. A floating pin has an undefined potential, so the reading is meaningless.'),
  },
  {
    id: 'b2',
    prompt: loc('对于本课有两条钳位路径的 I/O，PMU 可以采用哪个电流方向？', 'Which current polarity can the PMU use on the example I/O with two clamp paths?'),
    options: [
      { id: 'a', text: loc('只能是正电流', 'Positive only') },
      { id: 'b', text: loc('只能是负电流', 'Negative only') },
      { id: 'c', text: loc('正电流或负电流都可以', 'Either positive or negative') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'c',
    explain: loc('本例两种方向都可用。−100 µA 使 VSS 钳位二极管正偏，约读到 −0.65 V。+100 µA 使 VDD 钳位二极管正偏，约读到 +0.65 V。实际测试要根据引脚可用的导通路径选方向。', 'Both polarities work in this example. At −100 µA the VSS clamp diode conducts and reads about −0.65 V. At +100 µA the VDD clamp diode conducts and reads about +0.65 V. Choose the test polarity for the conduction paths available on the actual pin.'),
  },
  {
    id: 'b3',
    prompt: loc('−100 µA 下某脚读到 −3.0 V（就像上面 Datalog 里的 A2），它失败的原因是？', 'At −100 µA a pin reads −3.0 V (like A2 in the datalog above). Why does it fail?'),
    options: [
      { id: 'a', text: loc('开路', 'Open') },
      { id: 'b', text: loc('短路', 'Short') },
    ],
    answer: 'a',
    explain: loc('判开路的极限是 −1.5 V。−3.0 V 远比它更负，而且正好等于钳位值：电流找不到通路，PMU 把电压一直推到钳位。典型原因是探针没扎上、Socket 接触不良或焊线断了。', 'The open limit is −1.5 V. −3.0 V is far more negative and exactly equals the clamp: the current finds no path, so the PMU pushes the voltage all the way to the clamp. Typical causes: probe missed, poor socket contact, or a broken bond wire.'),
  },
  {
    id: 'b4',
    prompt: loc('−100 µA 下某脚读到 −0.003 V（就像上面 Datalog 里的 D0），它失败的原因是？', 'At −100 µA a pin reads −0.003 V (like D0 in the datalog above). Why does it fail?'),
    options: [
      { id: 'a', text: loc('开路', 'Open') },
      { id: 'b', text: loc('短路', 'Short') },
    ],
    answer: 'b',
    explain: loc('判短路的极限是 −0.2 V。几乎 0 V 说明电流没有经过保护二极管，而是从一条低阻通路流走了——管脚对地短路，或者和某个（此刻也接 0 V 的）相邻脚短路。', 'The short limit is −0.2 V. Almost 0 V means the current did not pass through the protection diode but escaped through a low-resistance path - the pin is shorted to ground, or to an adjacent pin (also at 0 V right now).'),
  },
  {
    id: 'b5',
    prompt: loc('开路脚读到 −3.0 V，这个数值是由什么决定的？', 'An open pin reads −3.0 V. What sets this value?'),
    options: [
      { id: 'a', text: loc('PMU 的电压钳位', 'The PMU voltage clamp') },
      { id: 'b', text: loc('管脚短路', 'A pin short') },
      { id: 'c', text: loc('PMU 的最大电压量程', 'The PMU\'s maximum voltage range') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'a',
    explain: loc('PMU 强加电流时必须设电压钳位，开短路一般设 ±3 V。开路时电流无路可走，电压被推到钳位就停住，所以读数等于钳位值。如果没设钳位，读数会冲到测试机量程的极限，那才是“最大量程”，而且可能进一步损伤芯片。', 'When the PMU forces current it must have a voltage clamp; for opens/shorts it is usually ±3 V. On an open the current has nowhere to go, so the voltage is pushed to the clamp and stops there - the reading equals the clamp. Without a clamp, the reading would run to the tester\'s range limit - that would be the "maximum range" - and could further damage the chip.'),
  },
]
