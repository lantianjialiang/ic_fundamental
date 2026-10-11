import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const APPROACH: Card[] = [
  {
    id: 'worst',
    title: loc('最坏情况测试', 'Worst-case testing'),
    sub: loc('全部同时放在极限', 'All at the limit at once'),
    text: loc('所有时序参数同时设在规格值上跑功能向量。Pass 即全部满足。', 'Set every timing parameter to its spec value at the same time and run the functional vectors. Pass means all are met.'),
    explain: [
      loc('量产常用：一次运行覆盖几十个参数，最省时间。代价是 Fail 时不知道是哪一个参数。', 'Common in production: one run covers dozens of parameters, saving the most time. The cost is that a Fail does not tell you which parameter.'),
    ],
  },
  {
    id: 'single',
    title: loc('单项测试', 'Individual testing'),
    sub: loc('一次只推一个', 'One parameter at a time'),
    text: loc('被测参数放在极限，其他参数放松。', 'The parameter under test is at its limit; the others are relaxed.'),
    explain: [
      loc('能明确知道是哪一项不达标，适合表征、Debug 和新品导入。时间成本高。', 'Tells you exactly which item fails. Suited to characterization, troubleshooting and new product introduction. Costly in time.'),
    ],
  },
  {
    id: 'gonogo',
    title: loc('Go / No-Go', 'Go / No-Go'),
    sub: loc('判一次', 'One decision'),
    text: loc('只在规格值跑一次：过或不过。', 'Run once at the spec value: pass or fail.'),
    explain: [loc('量产的默认做法：只关心有没有满足规格，不关心离规格还有多远。Pass 说明达到或超过了要求，但余量多少不知道。它比读出记录快得多。', 'The production default: it only asks whether the spec is met, not how far from the spec the device is. Pass means the requirement is met or exceeded, but the margin is unknown. Much faster than read & record.')],
  },
  {
    id: 'search',
    title: loc('读出记录', 'Read & record'),
    sub: loc('Read & record · 搜索', 'Read & record · search'),
    text: loc('反复调整边沿，找到芯片刚好从 Pass 变 Fail 的那个时间，记录下来。', 'Adjust an edge repeatedly to find the exact time where the chip changes from Pass to Fail, and record it.'),
    explain: [
      loc('用于表征、建立 Guardband、做 Shmoo（{@shmoo}）。每个参数要跑十几次，所以量产很少用。', 'Used for characterization, setting guardbands and shmoo plots ({@shmoo}). Each parameter takes a dozen or more runs, so production rarely uses it.'),
      loc('测出的 DC、AC 实际值会保存到文件或打印出来，便于分析芯片的真实性能。军用规格常常要求这种测法。', 'The measured DC and AC values are saved to a file or printed for analyzing the chip\'s real performance. Military specs often require this method.'),
    ],
  },
]

export const COMPROMISE: LText[] = [
  loc('测试机不够快时的两种妥协：', 'Two compromises when the tester is not fast enough:'),
  loc('降频测试：功能在低频跑，AC 参数用单个周期内的边沿位置来测——很多建立 / 保持 / 延迟时间不需要全速也能测出来。但 fMAX 本身和与频率相关的问题（发热、电源噪声）就测不到了。', 'Reduced-frequency testing: run the function at low frequency and measure AC parameters with edge placement inside a single cycle. Many setup / hold / delay times can be measured without full speed. But fMAX itself and frequency-related problems (heating, supply noise) go untested.'),
  loc('多路复用（Multiplexing）：两路 50 MHz 通道轮流接到同一个管脚，一路管奇数拍、一路管偶数拍，管脚上的数据率就是 100 MHz。测试速率（每路通道）和数据速率（管脚上）不再相同。', 'Multiplexing: two 50 MHz channels take turns on the same pin, one for odd cycles and one for even cycles, so the data rate at the pin is 100 MHz. The test rate (per channel) and the data rate (at the pin) are no longer the same.'),
]

export type ParamId = 'setup' | 'hold' | 'tpd' | 'pw' | 'fmax' | 'en'

export const PARAMS: Array<Card & { id: ParamId; how: LText; pass: LText }> = [
  {
    id: 'setup',
    title: loc('建立时间 Setup', 'Setup time'),
    sub: loc('数据要提前多久', 'How early data must arrive'),
    text: loc('时钟有效边沿之前，数据必须保持稳定的最短时间。', 'The minimum time data must be stable before the active clock edge.'),
    how: loc('时钟边沿固定，把数据边沿往时钟方向推近。数据离时钟越近越难；搜到刚好开始失败的位置。', 'Keep the clock edge fixed and move the data edge toward the clock. The closer the data is to the clock, the harder it gets; search for the point where it just starts to fail.'),
    pass: loc('给出的建立时间 ≥ 芯片实际需要的建立时间 → Pass。规格是最小值：在规格值上必须 Pass。只在输入脚上测；实测值可以是负数（数据在参考边沿之后才到也能被正确锁存）。', 'Setup time given ≥ setup time the chip actually needs → Pass. The spec is a minimum: it must Pass at the spec value. Measured only on input pins; the measured value can be negative (data arriving after the reference edge is still latched correctly).'),
  },
  {
    id: 'hold',
    title: loc('保持时间 Hold', 'Hold time'),
    sub: loc('数据要多留多久', 'How long data must stay'),
    text: loc('时钟有效边沿之后，数据还必须保持的最短时间。', 'The minimum time data must remain after the active clock edge.'),
    how: loc('时钟边沿固定，把数据撤走的边沿往时钟方向拉近。常用 SBC 格式，让数据后面紧跟反码。', 'Keep the clock edge fixed and move the data-removal edge toward the clock. SBC format is common, so the complement follows the data immediately.'),
    pass: loc('给出的保持时间 ≥ 芯片需要的保持时间 → Pass。只在输入脚上测；实测值也可以是负数（数据在参考边沿之前撤走也没问题）。', 'Hold time given ≥ hold time the chip needs → Pass. Measured only on input pins; the measured value can also be negative (data removed before the reference edge is still fine).'),
  },
  {
    id: 'tpd',
    title: loc('传输延迟 tPD', 'Propagation delay tPD'),
    sub: loc('输入到输出', 'Input to output'),
    text: loc('输入（或时钟）变化到输出变化之间的时间。', 'The time from an input (or clock) change to the resulting output change.'),
    how: loc('输入边沿固定，移动输出 Strobe。Strobe 早于输出稳定就 Fail，晚于就 Pass。', 'Keep the input edge fixed and move the output strobe. A strobe before the output settles fails; after it, passes.'),
    pass: loc('规格是最大值：Strobe 放在规格时刻，输出已正确 → Pass。只在输出脚上测，结果只能是正数——输出不可能在引起它的信号之前就变化。', 'The spec is a maximum: with the strobe at the spec time, the output is already correct → Pass. Measured only on output pins, and the result can only be positive: an output cannot change before the signal that causes it.'),
  },
  {
    id: 'pw',
    title: loc('最小脉宽', 'Minimum pulse width'),
    sub: loc('Pulse width', 'Pulse width'),
    text: loc('时钟或选通脉冲必须保持的最短宽度。', 'The shortest width a clock or strobe pulse must have.'),
    how: loc('用 RZ / RO 格式，把边沿 1 和边沿 2 互相靠近，缩短脉冲，看芯片何时开始失败。', 'Use RZ / RO format and move edge 1 and edge 2 toward each other to shorten the pulse, watching for when the chip starts to fail.'),
    pass: loc('规格值宽度下工作正常 → Pass。', 'Works correctly at the spec width → Pass.'),
  },
  {
    id: 'fmax',
    title: loc('最高频率 fMAX', 'Maximum frequency fMAX'),
    sub: loc('Maximum frequency', 'Maximum frequency'),
    text: loc('芯片能正确工作的最短周期的倒数。', 'The inverse of the shortest period at which the chip works correctly.'),
    how: loc('其他边沿按周期比例缩放，逐步缩短周期跑功能向量，直到失败。测试机自身频率必须够高。', 'Scale the other edges in proportion to the period, and shorten the period step by step while running the functional vectors until it fails. The tester itself must be fast enough.'),
    pass: loc('在规格周期（如 tRC = 15 ns）下功能全对 → Pass。', 'All functions correct at the spec period (e.g. tRC = 15 ns) → Pass.'),
  },
  {
    id: 'en',
    title: loc('输出使能 / 关断', 'Output enable / disable'),
    sub: loc('tEN / tDIS · tLZ / tHZ', 'tEN / tDIS · tLZ / tHZ'),
    text: loc('使能信号变化后，输出从高阻变成驱动（或反过来）的时间。', 'The time after the enable signal changes for the output to go from high-Z to driving (or the reverse).'),
    how: loc('使能（Enable）是从高阻变成驱动有效电平，关断（Disable）是从驱动变成高阻。两者都要带 VREF 负载（中间电平，如 2.0 V）：关断后靠它把引脚拉到 VOL 与 VOH 之间。测关断（tHZ）时期望 Z，Strobe 放在规格时刻，看引脚是否已离开有效电平。', 'Enable is going from high-Z to driving a valid level; disable is going from driving to high-Z. Both need a VREF load (a mid level, e.g. 2.0 V), which pulls the pin between VOL and VOH after disable. To test disable (tHZ), expect Z, place the strobe at the spec time and check that the pin has left the valid level.'),
    pass: loc('tHZ、tEN 是最大值；tLZ 是最小值（不能太早开始驱动）。', 'tHZ and tEN are maximums; tLZ is a minimum (the output must not start driving too early).'),
  },
]

export const SEARCH_LO = 0
export const SEARCH_HI = 32
export const SEARCH_RES = 0.25

export const SEARCH_LEAD = loc('二分搜索：已知边界在 [下限, 上限] 之间。每次把 Strobe 放在中点，Pass 就说明边界在左半边，Fail 在右半边。每跑一次，范围减半。', 'Binary search: the boundary is known to lie in [low, high]. Each time, place the strobe at the midpoint: Pass means the boundary is in the left half, Fail means the right half. Every run halves the range.')

export const SEARCH_FORMULA = loc('需要的次数 = ⌈ log₂((上限 − 下限) / 分辨率) ⌉。0–32 ns、分辨率 0.25 ns：⌈log₂128⌉ = 7 次。线性扫描要 128 次。', 'Runs needed = ⌈ log₂((high − low) / resolution) ⌉. For 0–32 ns at 0.25 ns resolution: ⌈log₂128⌉ = 7 runs. A linear search needs 128.')

export type TimingKind = 'write' | 'read'

export type BusSeg = { x0: number; x1: number; kind: 'valid' | 'x' | 'z' | 'hi' | 'lo'; label?: string }

export const SRAM_SPAN = 20

export const WRITE_ROWS: Array<{ name: string; segs: BusSeg[] }> = [
  {
    name: 'ADDR',
    segs: [
      { x0: 0, x1: 15, kind: 'valid', label: 'A' },
      { x0: 15, x1: 20, kind: 'x' },
    ],
  },
  { name: 'CS1', segs: [{ x0: 0, x1: 20, kind: 'lo' }] },
  {
    name: 'WE',
    segs: [
      { x0: 0, x1: 2, kind: 'hi' },
      { x0: 2, x1: 13, kind: 'lo' },
      { x0: 13, x1: 20, kind: 'hi' },
    ],
  },
  {
    name: 'DIN',
    segs: [
      { x0: 0, x1: 2, kind: 'x' },
      { x0: 2, x1: 14, kind: 'valid', label: 'D' },
      { x0: 14, x1: 20, kind: 'x' },
    ],
  },
]

export const READ_ROWS: Array<{ name: string; segs: BusSeg[] }> = [
  {
    name: 'ADDR',
    segs: [
      { x0: 0, x1: 15, kind: 'valid', label: 'A' },
      { x0: 15, x1: 20, kind: 'x' },
    ],
  },
  { name: 'CS1', segs: [{ x0: 0, x1: 20, kind: 'lo' }] },
  {
    name: 'OE',
    segs: [
      { x0: 0, x1: 5, kind: 'hi' },
      { x0: 5, x1: 20, kind: 'lo' },
    ],
  },
  {
    name: 'DOUT',
    segs: [
      { x0: 0, x1: 7, kind: 'z' },
      { x0: 7, x1: 15, kind: 'x' },
      { x0: 15, x1: 20, kind: 'valid', label: 'Q' },
    ],
  },
]

export type Span = { id: string; row: number; from: number; to: number; label: string; text: LText }

export const WRITE_SPANS: Span[] = [
  { id: 'tSA', row: 0, from: 0, to: 2, label: 'tSA ≥ 2', text: loc('地址在 T0 给出，WE 在 2 ns 下降：正好给足 2 ns 的地址建立时间。', 'The address is applied at T0 and WE falls at 2 ns, giving exactly 2 ns of address setup time.') },
  { id: 'tPWE', row: 2, from: 2, to: 13, label: 'tPWE ≥ 11', text: loc('WE 低电平从 2 ns 到 13 ns，正好 11 ns。', 'WE is low from 2 ns to 13 ns, exactly 11 ns.') },
  { id: 'tAW', row: 0, from: 0, to: 13, label: 'tAW ≥ 13', text: loc('写在 WE 上升沿（13 ns）结束。地址从 0 到 13 ns 有效，正好 13 ns。所以 WE 上升放在 13 ns，是由 tAW 决定的——这就是“WE 控制”的写周期。', 'The write ends at the WE rising edge (13 ns). The address is valid from 0 to 13 ns, exactly 13 ns. So placing the WE rise at 13 ns is set by tAW. This is a "WE-controlled" write cycle.') },
  { id: 'tSD', row: 3, from: 2, to: 13, label: 'tSD ≥ 11', text: loc('数据在 2 ns 给出，到 WE 上升（13 ns）稳定了 11 ns。', 'Data is applied at 2 ns and has been stable for 11 ns when WE rises (13 ns).') },
  { id: 'tHD', row: 3, from: 13, to: 14, label: 'tHD ≥ 1', text: loc('WE 上升后数据再保持 1 ns，到 14 ns 才撤掉。', 'Data holds for 1 ns more after WE rises and is removed at 14 ns.') },
  { id: 'tHA', row: 0, from: 13, to: 15, label: 'tHA ≥ 2', text: loc('WE 上升后地址再保持 2 ns，到 15 ns。', 'The address holds for 2 ns more after WE rises, until 15 ns.') },
  { id: 'tWC', row: 0, from: 0, to: 15, label: 'tWC ≥ 15', text: loc('整个写周期 15 ns：13 + 2 = 15。周期设 15 ns，所有最小值参数一次全部压在极限上——这是最坏情况测试。', 'The whole write cycle is 15 ns: 13 + 2 = 15. With the period at 15 ns, every minimum parameter sits at its limit at once. This is worst-case testing.') },
]

export const READ_SPANS: Span[] = [
  { id: 'tAA', row: 0, from: 0, to: 15, label: 'tAA ≤ 15', text: loc('地址在 T0 给出，最晚 15 ns 数据有效。', 'The address is applied at T0; data is valid by 15 ns at the latest.') },
  { id: 'tDOE', row: 2, from: 5, to: 15, label: 'tDOE ≤ 10', text: loc('OE 在 5 ns 下降，最晚 10 ns 后（15 ns）数据有效。OE 下降不早于 5 ns 时，OE 就是最晚到的那个条件——“OE 控制”的读周期。', 'OE falls at 5 ns, and data is valid at most 10 ns later (15 ns). When OE falls no earlier than 5 ns, OE is the last condition to arrive. This is an "OE-controlled" read cycle.') },
  { id: 'tLZOE', row: 3, from: 5, to: 7, label: 'tLZOE ≥ 2', text: loc('OE 下降后至少 2 ns 输出才开始驱动（离开高阻）。最小值：太早驱动会和总线上别的器件打架。', 'The output starts driving (leaves high-Z) at least 2 ns after OE falls. A minimum: driving too early would fight other devices on the bus.') },
  { id: 'strobe', row: 3, from: 15, to: 15, label: 'Strobe @ 15', text: loc('Strobe 放在 15 ns：同时满足 tAA 和 tDOE 两个最大值。此刻 DOUT 必须是正确数据。', 'Strobe at 15 ns meets both maximums, tAA and tDOE. At this instant DOUT must hold the correct data.') },
]

export const TAKEAWAY: LText[] = [
  loc('AC 测试 = 把边沿或 Strobe 放在时间极限上跑功能向量。', 'AC test = run the functional vectors with edges or strobes placed at their timing limits.'),
  loc('最小值参数（Setup、Hold、脉宽）：测试机给的时间压到规格值；最大值参数（tPD、tAA）：Strobe 放在规格时刻。', 'Minimum parameters (setup, hold, pulse width): the tester squeezes the time down to the spec value. Maximum parameters (tPD, tAA): the strobe goes at the spec time.'),
  loc('量产用 Go/No-Go + 最坏情况；表征用搜索，二分法最快。', 'Production uses Go/No-Go + worst case; characterization uses searches, and binary search is fastest.'),
  loc('测试机不够快：降频、多路复用，或者靠表征保证。', 'Tester not fast enough: reduce frequency, multiplex, or guarantee by characterization.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q2',
    prompt: loc('0–32 ns 范围、0.25 ns 分辨率，二分搜索要几次？', 'Range 0–32 ns, resolution 0.25 ns. How many binary search runs are needed?'),
    options: [
      { id: 'a', text: loc('7 次', '7') },
      { id: 'b', text: loc('128 次', '128') },
      { id: 'c', text: loc('32 次', '32') },
    ],
    answer: 'a',
    explain: loc('32 / 0.25 = 128 = 2⁷。', '32 / 0.25 = 128 = 2⁷.'),
  },
  {
    id: 'q3',
    prompt: loc('tPD 规格 ≤ 15 ns，Go/No-Go 时 Strobe 放在哪？', 'The tPD spec is ≤ 15 ns. Where does the strobe go for Go/No-Go?'),
    options: [
      { id: 'a', text: loc('输入边沿后 15 ns', '15 ns after the input edge') },
      { id: 'b', text: loc('输入边沿后 0 ns', '0 ns after the input edge') },
      { id: 'c', text: loc('周期末尾', 'At the end of the cycle') },
    ],
    answer: 'a',
    explain: loc('最大值参数：在规格时刻输出必须已经正确。放到周期末尾就测不到 tPD 了。', 'A maximum parameter: the output must already be correct at the spec time. At the end of the cycle, tPD is no longer tested.'),
  },
  {
    id: 'q4',
    prompt: loc('256×4 SRAM 写周期里，WE 上升沿为什么放在 13 ns？', 'In the 256×4 SRAM write cycle, why is the WE rising edge at 13 ns?'),
    options: [
      { id: 'a', text: loc('tAW = 13 ns：地址有效到写结束至少 13 ns', 'tAW = 13 ns: at least 13 ns from address valid to end of write') },
      { id: 'b', text: loc('随便选的', 'Chosen arbitrarily') },
      { id: 'c', text: loc('tWC = 13 ns', 'tWC = 13 ns') },
    ],
    answer: 'a',
    explain: loc('同时也满足 tSA + tPWE = 2 + 11 = 13，最小值参数全部压在极限上。', 'It also meets tSA + tPWE = 2 + 11 = 13, with every minimum parameter at its limit.'),
  },
  {
    id: 'q5',
    prompt: loc('两路 50 MHz 通道复用到一个管脚，管脚数据率是？', 'Two 50 MHz channels are multiplexed onto one pin. What is the pin data rate?'),
    options: [
      { id: 'a', text: loc('100 MHz', '100 MHz') },
      { id: 'b', text: loc('50 MHz', '50 MHz') },
      { id: 'c', text: loc('25 MHz', '25 MHz') },
    ],
    answer: 'a',
    explain: loc('两路轮流，每路只管一半的拍。测试速率 50 MHz，数据速率 100 MHz。', 'The two channels take turns, each handling half the cycles. Test rate 50 MHz, data rate 100 MHz.'),
  },
  {
    id: 'b1',
    prompt: loc('参考信号到达某个电压点之后，数据还必须保持的时间叫？', 'The time data must remain after the reference signal reaches a given voltage point is called?'),
    options: [
      { id: 'a', text: loc('建立时间（Setup）', 'Setup time') },
      { id: 'b', text: loc('传输延迟', 'Propagation delay') },
      { id: 'c', text: loc('最小脉宽', 'Minimum pulse width') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'd',
    explain: loc('这是保持时间（Hold），选项里没有。建立时间是参考信号之前数据必须到位的时间；例如 tHD = 1 ns：WE 上升（1.5 V 处）之后，数据还要保持至少 1 ns。', 'This is hold time, which is not among the options. Setup time is how long before the reference signal the data must be in place. Example: tHD = 1 ns means data must hold at least 1 ns after WE rises (at 1.5 V).'),
  },
  {
    id: 'b2',
    prompt: loc('规格要求建立时间 12 ns，芯片在只给 10 ns 时也能正常工作。这颗芯片：', 'The spec requires 12 ns setup time, and the chip still works when given only 10 ns. This chip:'),
    options: [
      { id: 'a', text: loc('不满足规格', 'Fails the spec') },
      { id: 'b', text: loc('优于规格', 'Is better than spec') },
      { id: 'c', text: loc('看不懂这道题', 'I don\'t understand the question') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
      { id: 'e', text: loc('以上都对', 'All of the above') },
    ],
    answer: 'b',
    explain: loc('建立时间是最小值型参数：规格承诺“给够 12 ns 一定能工作”。芯片只要 10 ns 就够，说明它比承诺的更好，有 2 ns 余量。', 'Setup time is a minimum-type parameter: the spec promises "given 12 ns, it will work". The chip needs only 10 ns, so it is better than promised, with 2 ns of margin.'),
  },
  {
    id: 'b3',
    prompt: loc('测出负的传输延迟是不可能的（至少是不对的）。', 'Measuring a negative propagation delay is impossible (or at least wrong).'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('传输延迟是“参考信号变化 → 由它引起的输出变化”之间的时间，结果只能是正数：输出不可能在原因发生之前就变。测出负数，说明参考点或搜索设置错了。对比：Setup 和 Hold 可以是负数。', 'Propagation delay is the time from "reference signal change → the output change it causes", so it can only be positive: an output cannot change before its cause. A negative result means the reference point or search setup is wrong. By contrast, setup and hold can be negative.'),
  },
  {
    id: 'b4',
    prompt: loc('传输延迟只在输出信号上测量。', 'Propagation delay is measured only on output signals.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('传输延迟测的是输出什么时候变成有效值，搜索的是输出 Strobe 的位置，所以只在输出脚上做。大多数是从某个输入到输出（如 tAA），有时也测两个输出之间的相对延迟，但被测的仍是输出。Setup / Hold 才是在输入脚上测。', 'Propagation delay measures when an output becomes valid, searching the output strobe position, so it is done only on output pins. Most are from an input to an output (e.g. tAA); sometimes the relative delay between two outputs is measured, but what is measured is still an output. Setup / hold are the ones measured on input pins.'),
  },
  {
    id: 'b5',
    prompt: loc('输出使能（Enable）测试测的是输出从驱动有效数据变成高阻的时间。', 'An output enable test measures the time for an output to go from driving valid data to high-Z.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc('说反了。使能是从高阻变成驱动有效电平（如 tDOE：OE 下降到数据有效）；从驱动变成高阻是输出关断（Disable）时间（如 tHZOE：OE 上升到高阻）。', 'It is backwards. Enable goes from high-Z to driving a valid level (e.g. tDOE: OE falling to data valid); driving to high-Z is the output disable time (e.g. tHZOE: OE rising to high-Z).'),
  },
  {
    id: 'b6',
    prompt: loc('输出使能和输出关断测试，都需要一个外部参考电压来表示输出已进入高阻。', 'Output enable and output disable tests both need an external reference voltage to show that the output is in high-Z.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('高阻的引脚自己不会到任何确定电平，要靠接在 VREF（中间电平，如 2.0 V）上的负载把它拉到 VOL 与 VOH 之间。使能测试从这个中间电平出发，看输出何时变成有效电平；关断测试看输出何时回到中间电平。两者都离不开它。', 'A high-Z pin does not go to any defined level by itself; a load tied to VREF (a mid level, e.g. 2.0 V) pulls it between VOL and VOH. The enable test starts from this mid level and watches when the output becomes valid; the disable test watches when it returns to the mid level. Both depend on it.'),
  },
  {
    id: 'b7',
    prompt: loc('读出记录（Read & record）是最快的测试方法，所以量产常用。', 'Read & record is the fastest test method, so production uses it often.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc('读出记录要把每个参数的实际值测出来（例如用搜索）并保存，最慢。量产常用的是 Go / No-Go：每个参数只按极限判一次，快得多。', 'Read & record must measure each parameter\'s actual value (e.g. by searching) and save it, so it is the slowest. Production commonly uses Go / No-Go: each parameter is judged once against its limit, which is much faster.'),
  },
  {
    id: 'b8',
    prompt: loc('当必须记录芯片的确切性能时（比如军用测试），常用 Go / No-Go 方法。', 'When the chip\'s exact performance must be recorded (e.g. military testing), the Go / No-Go method is common.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc('Go / No-Go 只给出 Pass / Fail，不知道实际值和余量。要记录确切性能，用的是读出记录（Read & record），军用规格常常要求它。', 'Go / No-Go only gives Pass / Fail, with no actual value or margin. Recording exact performance uses read & record, which military specs often require.'),
  },
]
