import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const INTRO: LText[] = [
  loc(
    '{@intro} 的框图里，ATE 主机只是一个方块。打开它，最多的东西是一路一路的 Channel：DUT 的每根数字管脚背后都有一路，负责在每一拍给信号、看信号。',
    'In the {@intro} diagram the ATE mainframe was one box. Open it and what you find most is channels: one behind every digital DUT pin, driving and checking the pin every cycle.',
  ),
]

/** 教学用电平 */
export const LV = { vih: 3.0, vil: 0.0, voh: 2.4, vol: 0.4 }
/** 一拍 20 ns：5 ns 驱动沿，DUT 延迟 6 ns，15 ns Strobe */
export const TM = { period: 20, drive: 5, tpd: 6, strobe: 15 }

export type DutCase = 'good' | 'stuck'

export const STEPS: Array<{ label: LText; text: LText }> = [
  {
    label: loc('取向量', 'Fetch vector'),
    text: loc(
      'Pattern 内存取出这一拍的一行：A 脚驱动 1，Y 脚期望 H。',
      'Pattern memory hands over this cycle’s row: drive 1 on pin A, expect H on pin Y.',
    ),
  },
  {
    label: loc('生成沿', 'Make edge'),
    text: loc(
      'Timing 决定什么时候动手：这一拍从 0 开始，5 ns 处给出驱动沿。',
      'Timing decides when to act: the cycle starts at 0 and the drive edge comes at 5 ns.',
    ),
  },
  {
    label: loc('选电平', 'Pick level'),
    text: loc(
      'Level 决定给多高：逻辑 1 用 VIH = 3.0 V（逻辑 0 用 VIL = 0 V），交给 Driver。',
      'Level decides how high: logic 1 uses VIH = 3.0 V (logic 0 would use VIL = 0 V), handed to the driver.',
    ),
  },
  {
    label: loc('驱动管脚', 'Drive pin'),
    text: loc(
      'Driver 在 5 ns 把 A 脚从 0 V 推到 3.0 V。信号经过 Load Board 和 Socket 到达 DUT。',
      'At 5 ns the driver pushes pin A from 0 V to 3.0 V. The signal reaches the DUT through the load board and socket.',
    ),
  },
  {
    label: loc('DUT 响应', 'DUT responds'),
    text: loc(
      'DUT 经过约 6 ns 延迟，在 Y 脚输出。Y 的电压回到另一路 Channel 的 Comparator，和 VOH = 2.4 V、VOL = 0.4 V 比。',
      'After about 6 ns of delay the DUT drives pin Y. Y’s voltage returns to another channel’s comparator and is checked against VOH = 2.4 V and VOL = 0.4 V.',
    ),
  },
  {
    label: loc('Strobe 采样', 'Strobe'),
    text: loc(
      '15 ns 时 Strobe 采样一次：此刻高于 VOH 读成 H，低于 VOL 读成 L。Strobe 要放在输出稳定之后。',
      'At 15 ns the strobe samples once: above VOH reads H, below VOL reads L. The strobe must come after the output has settled.',
    ),
  },
  {
    label: loc('判定', 'Judge'),
    text: loc(
      '读到的值和 Pattern 里的期望比较：一样就 Pass，不一样就 Fail。下一拍从头再来。',
      'The value read is compared to the expect in the pattern: same means Pass, different means Fail. The next cycle starts over.',
    ),
  },
]

export const CASES: Array<{ id: DutCase; label: LText }> = [
  { id: 'good', label: loc('好芯片', 'Good chip') },
  { id: 'stuck', label: loc('坏芯片：Y 卡在 0', 'Bad chip: Y stuck at 0') },
]

export type PeId = 'driver' | 'comparator' | 'timing' | 'level'

export const PE: Array<{ id: PeId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'driver',
    title: loc('Driver', 'Driver'),
    sub: loc('驱动器：负责“给”', 'Driver: the “give” part'),
    text: loc(
      '把逻辑 1 / 0 变成真实电压 VIH / VIL，推到 DUT 的输入脚上。',
      'Turns logic 1 / 0 into real voltages VIH / VIL and pushes them onto a DUT input.',
    ),
  },
  {
    id: 'comparator',
    title: loc('Comparator', 'Comparator'),
    sub: loc('比较器：负责“看”', 'Comparator: the “look” part'),
    text: loc(
      '把 DUT 输出电压和 VOH / VOL 比，在 Strobe 时刻读成 H、L 或中间值（判 Fail）。',
      'Checks the DUT output voltage against VOH / VOL and, at the strobe, reads H, L, or in-between (a Fail).',
    ),
  },
  {
    id: 'timing',
    title: loc('Timing', 'Timing'),
    sub: loc('时序：决定“什么时候”', 'Timing: decides “when”'),
    text: loc(
      '给每一拍定周期、驱动沿和 Strobe 时刻。怎么设见 {@timing}。',
      'Sets each cycle’s period, drive edges, and strobe time. How to set them: {@timing}.',
    ),
  },
  {
    id: 'level',
    title: loc('Level', 'Level'),
    sub: loc('电平：决定“多高”', 'Level: decides “how high”'),
    text: loc(
      '提供驱动电平 VIH / VIL 和比较门限 VOH / VOL。数值来自规格书，见 {@spec}。',
      'Supplies drive levels VIH / VIL and compare thresholds VOH / VOL. The numbers come from the datasheet; see {@spec}.',
    ),
  },
]

export const OTHERS = loc(
  'Channel 旁边还有两样：DPS 给 DUT 供电并测电源电流；PMU 加电压测电流、加电流测压，用来测参数（下一课）。完整的测试系统结构见 {@fIntro}。',
  'Two more units sit beside the channels: the DPS powers the DUT and measures supply current; the PMU forces voltage and measures current or the reverse, for parametric tests (next lesson). Full system structure: {@fIntro}.',
)

export const TAKEAWAY: LText[] = [
  loc('每根数字管脚背后有一路 Channel；一拍里它做的事是：取向量 → 定时刻 → 选电平 → 驱动 → 采样 → 比较。', 'Every digital pin has a channel. In one cycle it does: fetch vector → time → level → drive → sample → compare.'),
  loc('Driver 负责给，Comparator 负责看；Timing 管什么时候，Level 管多高。', 'The driver gives, the comparator looks; Timing says when, Level says how high.'),
  loc('Strobe 只采一个时刻，要放在 DUT 输出稳定之后。', 'The strobe samples one instant and must come after the DUT output settles.'),
  loc('Pass / Fail 是“读到的”和“期望的”逐拍比较的结果。', 'Pass / Fail comes from comparing what was read with what was expected, cycle by cycle.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一拍里，Channel 的 Driver 和 Comparator 分别做什么？', 'In one cycle, what do a channel’s driver and comparator do?'),
    options: [
      { id: 'a', text: loc('Driver 看输出，Comparator 给输入', 'The driver looks at outputs; the comparator drives inputs') },
      { id: 'b', text: loc('Driver 给 DUT 输入加电平，Comparator 判断 DUT 输出的高低', 'The driver puts levels on DUT inputs; the comparator judges DUT outputs high or low') },
      { id: 'c', text: loc('两者都只测电流', 'Both only measure current') },
    ],
    answer: 'b',
    explain: loc('给和看是两件事，分别由 Driver 和 Comparator 完成。', 'Giving and looking are separate jobs, done by the driver and the comparator.'),
  },
  {
    id: 'q2',
    prompt: loc('Level 和 Timing 各管什么？', 'What do Level and Timing each control?'),
    options: [
      { id: 'a', text: loc('Level 管电压多高，Timing 管什么时候', 'Level sets how high; Timing sets when') },
      { id: 'b', text: loc('Level 管什么时候，Timing 管电压多高', 'Level sets when; Timing sets how high') },
      { id: 'c', text: loc('两者都管 Pattern 存多少行', 'Both set how many rows the pattern holds') },
    ],
    answer: 'a',
    explain: loc('VIH / VIL / VOH / VOL 来自 Level；驱动沿和 Strobe 时刻来自 Timing。', 'VIH / VIL / VOH / VOL come from Level; drive edges and strobe times come from Timing.'),
  },
  {
    id: 'q3',
    prompt: loc('DUT 延迟 6 ns，驱动沿在 5 ns。Strobe 放在 8 ns 会怎样？', 'The DUT delay is 6 ns and the drive edge is at 5 ns. What happens with the strobe at 8 ns?'),
    options: [
      { id: 'a', text: loc('没问题，越早越好', 'Fine — earlier is better') },
      { id: 'b', text: loc('输出 11 ns 才变，8 ns 读到的还是旧值，好芯片也会判 Fail', 'The output only changes at 11 ns, so 8 ns reads the old value and even a good chip fails') },
      { id: 'c', text: loc('Strobe 时刻不影响结果', 'The strobe time does not matter') },
    ],
    answer: 'b',
    explain: loc('Strobe 必须在输出稳定之后。本课动画里放在 15 ns。', 'The strobe must come after the output settles. The animation places it at 15 ns.'),
  },
  {
    id: 'q4',
    prompt: loc('Strobe 时刻 Y 脚是 1.5 V（VOL 0.4 V，VOH 2.4 V），Comparator 读到什么？', 'At the strobe, pin Y is 1.5 V (VOL 0.4 V, VOH 2.4 V). What does the comparator read?'),
    options: [
      { id: 'a', text: loc('H', 'H') },
      { id: 'b', text: loc('L', 'L') },
      { id: 'c', text: loc('既不是 H 也不是 L，期望 H 或 L 都判 Fail', 'Neither H nor L, so it fails whether H or L was expected') },
    ],
    answer: 'c',
    explain: loc('高于 VOH 才算 H，低于 VOL 才算 L，中间的电压两头都不算。', 'Only above VOH counts as H and only below VOL as L; anything in between counts as neither.'),
  },
  {
    id: 'q5',
    prompt: loc('想测某个管脚的漏电流，用 Channel 里的哪一块？', 'To measure a pin’s leakage current, which part do you use?'),
    options: [
      { id: 'a', text: loc('Comparator', 'The comparator') },
      { id: 'b', text: loc('不在这四块里，要用 PMU', 'None of the four — use the PMU') },
      { id: 'c', text: loc('Timing', 'Timing') },
    ],
    answer: 'b',
    explain: loc('Pin Electronics 管 0/1 的给和看；量电压、电流用 PMU，下一课讲。', 'Pin electronics gives and looks at 0/1; voltage and current measurements use the PMU, covered next lesson.'),
  },
]
