import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const WHY: LText[] = [
  loc('开短路（Continuity / Opens-Shorts）永远是第一项。它回答一个最朴素的问题：测试机的每一路，是不是真的接到了芯片的每一个管脚上？'),
  loc('它能抓到：探针没扎上、Socket 接触不良、焊线断了（开路）；相邻管脚连锡、焊线碰在一起、管脚对电源或地短路（短路）。'),
  loc('它也是保护：短路的芯片如果直接上电跑功能，可能烧芯片、烧针卡、甚至伤测试机。先花几毫秒确认接触，后面的测试才有意义。'),
]

export const HOW: LText[] = [
  loc('把所有管脚——包括 VDD——都接到 0 V。'),
  loc('PMU 对被测脚强加 −100 µA（常见范围 100–500 µA），电压钳位 ±3 V。'),
  loc('电流从地经过对地保护二极管流出被测脚，二极管正偏，读到约 −0.65 V。'),
  loc('和极限比：比 −1.5 V 还负 → 开路；比 −0.2 V 还接近 0 → 短路；中间 → Pass。'),
  loc('再打 +100 µA 测对 VDD 的那只二极管，极限镜像为 +0.2 V ~ +1.5 V。'),
  loc('换下一个管脚，直到全部测完。'),
]

export type Fault = 'good' | 'open' | 'short' | 'neighbor' | 'res'

export const FAULTS: Array<{ id: Fault; label: LText; text: LText }> = [
  { id: 'good', label: loc('正常'), text: loc('保护二极管正偏，读到一个二极管压降，约 0.65 V。') },
  { id: 'open', label: loc('开路'), text: loc('电流没有路可走，PMU 一直把电压往外推，直到撞上 ±3 V 钳位。') },
  { id: 'short', label: loc('对地短路'), text: loc('管脚直接接到 0 V，电流从短路点流走，读到接近 0 V。') },
  { id: 'neighbor', label: loc('和相邻脚短路'), text: loc('相邻管脚此刻也接在 0 V，所以看起来和对地短路一样，读到接近 0 V。') },
  { id: 'res', label: loc('阻性短路 1 kΩ'), text: loc('不是硬短，而是 1 kΩ 漏到地。电压 = 电流 × 1 kΩ，电流越大读数越高。') },
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
  pass: loc('PASS：读到二极管压降，接触良好。'),
  open: loc('FAIL：开路。电压冲到钳位，说明电流没有通路。'),
  short: loc('FAIL：短路。电压不到 0.2 V，电流没走保护二极管，而是从别的路径流走了。'),
}

export const RES_NOTE = loc('试试阻性短路：100 µA 时 1 kΩ 只压降 0.1 V，判短路；把电流加到 250 µA 以上，压降超过 0.2 V，它就“混过去”了。电流不是越大越好。')

export const DATALOG: Array<{ pin: string; volt: number; answer: Verdict; why: LText }> = [
  { pin: 'A0', volt: -0.652, answer: 'pass', why: loc('一个二极管压降，正常。') },
  { pin: 'A1', volt: -0.648, answer: 'pass', why: loc('正常。') },
  { pin: 'A2', volt: -2.999, answer: 'open', why: loc('撞到 −3 V 钳位，典型开路：探针没扎上或焊线断。') },
  { pin: 'A3', volt: -0.661, answer: 'pass', why: loc('正常。') },
  { pin: 'D0', volt: -0.003, answer: 'short', why: loc('几乎 0 V，硬短路。') },
  { pin: 'D1', volt: -0.012, answer: 'short', why: loc('D1、D2 同时约 0 V，而且相邻——很可能是两脚之间连锡。') },
  { pin: 'D2', volt: -0.011, answer: 'short', why: loc('和 D1 一起看：相邻脚互短，测其中一个时另一个接地，所以两个都读到 0 V。') },
  { pin: 'OE', volt: -0.124, answer: 'short', why: loc('−0.12 V 没超过 −0.2 V，判短路。数值不是 0，更像阻性漏电，例如约 1 kΩ 到地。') },
  { pin: 'CS1', volt: -1.82, answer: 'open', why: loc('比 −1.5 V 更负但没到钳位：接触电阻很大或半开路，按开路处理。') },
]

export const TAKEAWAY: LText[] = [
  loc('开短路是第一项测试：确认接触，也保护芯片和测试机。'),
  loc('所有脚接 0 V，PMU 打 ±100 µA，钳位 ±3 V，读保护二极管约 0.65 V。'),
  loc('超过 1.5 V 是开路，不到 0.2 V 是短路。'),
  loc('相邻脚互短看起来和对地短路一样；看 Datalog 时要把相邻脚放在一起看。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('开短路测试时，VDD 管脚接在哪里？'),
    options: [
      { id: 'a', text: loc('0 V，和其他管脚一样') },
      { id: 'b', text: loc('5 V') },
      { id: 'c', text: loc('悬空') },
    ],
    answer: 'a',
    explain: loc('所有脚都接 0 V，对 VDD 的二极管才有确定的参考点；也避免芯片在接触未知时被上电。'),
  },
  {
    id: 'q2',
    prompt: loc('打 −100 µA，读到 −3.0 V，说明什么？'),
    options: [
      { id: 'a', text: loc('开路，电压撞到钳位') },
      { id: 'b', text: loc('短路') },
      { id: 'c', text: loc('正常') },
    ],
    answer: 'a',
    explain: loc('电流没有通路，PMU 只能把电压一直推到钳位值。'),
  },
  {
    id: 'q3',
    prompt: loc('为什么要设电压钳位 ±3 V？'),
    options: [
      { id: 'a', text: loc('开路时限制电压，避免损伤芯片或在别的脚上引起意外导通') },
      { id: 'b', text: loc('为了测得更准') },
      { id: 'c', text: loc('没有原因') },
    ],
    answer: 'a',
    explain: loc('恒流源遇到开路会把电压推得很高，钳位是安全措施。'),
  },
  {
    id: 'q4',
    prompt: loc('相邻两脚连锡，两脚分别测时会看到？'),
    options: [
      { id: 'a', text: loc('两脚都读到约 0 V') },
      { id: 'b', text: loc('两脚都读到 −3 V') },
      { id: 'c', text: loc('两脚都正常') },
    ],
    answer: 'a',
    explain: loc('测一个脚时，另一个脚接在 0 V，电流从连锡处流走。'),
  },
  {
    id: 'q5',
    prompt: loc('测试电流为什么不是越大越好？'),
    options: [
      { id: 'a', text: loc('阻性短路的压降随电流变大，可能超过 0.2 V 而被误判为 Pass') },
      { id: 'b', text: loc('大电流测得更慢') },
      { id: 'c', text: loc('大电流一定会烧芯片') },
    ],
    answer: 'a',
    explain: loc('100 µA 量级既能让二极管正偏，又能把几 kΩ 级的漏电暴露出来。'),
  },
]
