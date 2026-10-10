import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const APPROACH: Card[] = [
  {
    id: 'worst',
    title: loc('最坏情况测试'),
    sub: loc('全部同时放在极限'),
    text: loc('所有时序参数同时设在规格值上跑功能向量。Pass 即全部满足。'),
    explain: [
      loc('量产常用：一次运行覆盖几十个参数，最省时间。代价是 Fail 时不知道是哪一个参数。'),
    ],
  },
  {
    id: 'single',
    title: loc('单项测试'),
    sub: loc('一次只推一个'),
    text: loc('被测参数放在极限，其他参数放松。'),
    explain: [
      loc('能明确知道是哪一项不达标，适合表征、Debug 和新品导入。时间成本高。'),
    ],
  },
  {
    id: 'gonogo',
    title: loc('Go / No-Go'),
    sub: loc('判一次'),
    text: loc('只在规格值跑一次：过或不过。'),
    explain: [loc('量产的默认做法：只关心有没有满足规格，不关心离规格还有多远。')],
  },
  {
    id: 'search',
    title: loc('读出记录'),
    sub: loc('Read & record · 搜索'),
    text: loc('反复调整边沿，找到芯片刚好从 Pass 变 Fail 的那个时间，记录下来。'),
    explain: [
      loc('用于表征、建立 Guardband、做 Shmoo（M14）。每个参数要跑十几次，所以量产很少用。'),
    ],
  },
]

export const COMPROMISE: LText[] = [
  loc('测试机不够快时的两种妥协：'),
  loc('降频测试：功能在低频跑，AC 参数用单个周期内的边沿位置来测——很多建立 / 保持 / 延迟时间不需要全速也能测出来。但 fMAX 本身和与频率相关的问题（发热、电源噪声）就测不到了。'),
  loc('多路复用（Multiplexing）：两路 50 MHz 通道轮流接到同一个管脚，一路管奇数拍、一路管偶数拍，管脚上的数据率就是 100 MHz。测试速率（每路通道）和数据速率（管脚上）不再相同。'),
]

export type ParamId = 'setup' | 'hold' | 'tpd' | 'pw' | 'fmax' | 'en'

export const PARAMS: Array<Card & { id: ParamId; how: LText; pass: LText }> = [
  {
    id: 'setup',
    title: loc('建立时间 Setup'),
    sub: loc('数据要提前多久'),
    text: loc('时钟有效边沿之前，数据必须保持稳定的最短时间。'),
    how: loc('时钟边沿固定，把数据边沿往时钟方向推近。数据离时钟越近越难；搜到刚好开始失败的位置。'),
    pass: loc('给出的建立时间 ≥ 芯片实际需要的建立时间 → Pass。规格是最小值：在规格值上必须 Pass。'),
  },
  {
    id: 'hold',
    title: loc('保持时间 Hold'),
    sub: loc('数据要多留多久'),
    text: loc('时钟有效边沿之后，数据还必须保持的最短时间。'),
    how: loc('时钟边沿固定，把数据撤走的边沿往时钟方向拉近。常用 SBC 格式，让数据后面紧跟反码。'),
    pass: loc('给出的保持时间 ≥ 芯片需要的保持时间 → Pass。'),
  },
  {
    id: 'tpd',
    title: loc('传输延迟 tPD'),
    sub: loc('输入到输出'),
    text: loc('输入（或时钟）变化到输出变化之间的时间。'),
    how: loc('输入边沿固定，移动输出 Strobe。Strobe 早于输出稳定就 Fail，晚于就 Pass。'),
    pass: loc('规格是最大值：Strobe 放在规格时刻，输出已正确 → Pass。'),
  },
  {
    id: 'pw',
    title: loc('最小脉宽'),
    sub: loc('Pulse width'),
    text: loc('时钟或选通脉冲必须保持的最短宽度。'),
    how: loc('用 RZ / RO 格式，把边沿 1 和边沿 2 互相靠近，缩短脉冲，看芯片何时开始失败。'),
    pass: loc('规格值宽度下工作正常 → Pass。'),
  },
  {
    id: 'fmax',
    title: loc('最高频率 fMAX'),
    sub: loc('Maximum frequency'),
    text: loc('芯片能正确工作的最短周期的倒数。'),
    how: loc('其他边沿按周期比例缩放，逐步缩短周期跑功能向量，直到失败。测试机自身频率必须够高。'),
    pass: loc('在规格周期（如 tRC = 15 ns）下功能全对 → Pass。'),
  },
  {
    id: 'en',
    title: loc('输出使能 / 关断'),
    sub: loc('tEN / tDIS · tLZ / tHZ'),
    text: loc('使能信号变化后，输出从高阻变成驱动（或反过来）的时间。'),
    how: loc('要带 VREF 负载。测关断（tHZ）时期望 Z，Strobe 放在规格时刻，看引脚是否已离开 VOL / VOH 区。'),
    pass: loc('tHZ、tEN 是最大值；tLZ 是最小值（不能太早开始驱动）。'),
  },
]

export const SEARCH_LO = 0
export const SEARCH_HI = 32
export const SEARCH_RES = 0.25

export const SEARCH_LEAD = loc('二分搜索：已知边界在 [下限, 上限] 之间。每次把 Strobe 放在中点，Pass 就说明边界在左半边，Fail 在右半边。每跑一次，范围减半。')

export const SEARCH_FORMULA = loc('需要的次数 = ⌈ log₂((上限 − 下限) / 分辨率) ⌉。0–32 ns、分辨率 0.25 ns：⌈log₂128⌉ = 7 次。线性扫描要 128 次。')

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
  { id: 'tSA', row: 0, from: 0, to: 2, label: 'tSA ≥ 2', text: loc('地址在 T0 给出，WE 在 2 ns 下降：正好给足 2 ns 的地址建立时间。') },
  { id: 'tPWE', row: 2, from: 2, to: 13, label: 'tPWE ≥ 11', text: loc('WE 低电平从 2 ns 到 13 ns，正好 11 ns。') },
  { id: 'tAW', row: 0, from: 0, to: 13, label: 'tAW ≥ 13', text: loc('写在 WE 上升沿（13 ns）结束。地址从 0 到 13 ns 有效，正好 13 ns。所以 WE 上升放在 13 ns，是由 tAW 决定的——这就是“WE 控制”的写周期。') },
  { id: 'tSD', row: 3, from: 2, to: 13, label: 'tSD ≥ 11', text: loc('数据在 2 ns 给出，到 WE 上升（13 ns）稳定了 11 ns。') },
  { id: 'tHD', row: 3, from: 13, to: 14, label: 'tHD ≥ 1', text: loc('WE 上升后数据再保持 1 ns，到 14 ns 才撤掉。') },
  { id: 'tHA', row: 0, from: 13, to: 15, label: 'tHA ≥ 2', text: loc('WE 上升后地址再保持 2 ns，到 15 ns。') },
  { id: 'tWC', row: 0, from: 0, to: 15, label: 'tWC ≥ 15', text: loc('整个写周期 15 ns：13 + 2 = 15。周期设 15 ns，所有最小值参数一次全部压在极限上——这是最坏情况测试。') },
]

export const READ_SPANS: Span[] = [
  { id: 'tAA', row: 0, from: 0, to: 15, label: 'tAA ≤ 15', text: loc('地址在 T0 给出，最晚 15 ns 数据有效。') },
  { id: 'tDOE', row: 2, from: 5, to: 15, label: 'tDOE ≤ 10', text: loc('OE 在 5 ns 下降，最晚 10 ns 后（15 ns）数据有效。OE 下降不早于 5 ns 时，OE 就是最晚到的那个条件——“OE 控制”的读周期。') },
  { id: 'tLZOE', row: 3, from: 5, to: 7, label: 'tLZOE ≥ 2', text: loc('OE 下降后至少 2 ns 输出才开始驱动（离开高阻）。最小值：太早驱动会和总线上别的器件打架。') },
  { id: 'strobe', row: 3, from: 15, to: 15, label: 'Strobe @ 15', text: loc('Strobe 放在 15 ns：同时满足 tAA 和 tDOE 两个最大值。此刻 DOUT 必须是正确数据。') },
]

export const TAKEAWAY: LText[] = [
  loc('AC 测试 = 把边沿或 Strobe 放在时间极限上跑功能向量。'),
  loc('最小值参数（Setup、Hold、脉宽）：测试机给的时间压到规格值；最大值参数（tPD、tAA）：Strobe 放在规格时刻。'),
  loc('量产用 Go/No-Go + 最坏情况；表征用搜索，二分法最快。'),
  loc('测试机不够快：降频、多路复用，或者靠表征保证。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('量产为什么多用 Go/No-Go，而不是每颗都搜出实际值？'),
    options: [
      { id: 'a', text: loc('搜索每个参数要跑十几次，测试时间太长') },
      { id: 'b', text: loc('搜索不准') },
      { id: 'c', text: loc('规格不允许') },
    ],
    answer: 'a',
    explain: loc('量产只需要知道是否满足规格。实际值留给表征。'),
  },
  {
    id: 'q2',
    prompt: loc('0–32 ns 范围、0.25 ns 分辨率，二分搜索要几次？'),
    options: [
      { id: 'a', text: loc('7 次') },
      { id: 'b', text: loc('128 次') },
      { id: 'c', text: loc('32 次') },
    ],
    answer: 'a',
    explain: loc('32 / 0.25 = 128 = 2⁷。'),
  },
  {
    id: 'q3',
    prompt: loc('tPD 规格 ≤ 15 ns，Go/No-Go 时 Strobe 放在哪？'),
    options: [
      { id: 'a', text: loc('输入边沿后 15 ns') },
      { id: 'b', text: loc('输入边沿后 0 ns') },
      { id: 'c', text: loc('周期末尾') },
    ],
    answer: 'a',
    explain: loc('最大值参数：在规格时刻输出必须已经正确。放到周期末尾就测不到 tPD 了。'),
  },
  {
    id: 'q4',
    prompt: loc('256×4 SRAM 写周期里，WE 上升沿为什么放在 13 ns？'),
    options: [
      { id: 'a', text: loc('tAW = 13 ns：地址有效到写结束至少 13 ns') },
      { id: 'b', text: loc('随便选的') },
      { id: 'c', text: loc('tWC = 13 ns') },
    ],
    answer: 'a',
    explain: loc('同时也满足 tSA + tPWE = 2 + 11 = 13，最小值参数全部压在极限上。'),
  },
  {
    id: 'q5',
    prompt: loc('两路 50 MHz 通道复用到一个管脚，管脚数据率是？'),
    options: [
      { id: 'a', text: loc('100 MHz') },
      { id: 'b', text: loc('50 MHz') },
      { id: 'c', text: loc('25 MHz') },
    ],
    answer: 'a',
    explain: loc('两路轮流，每路只管一半的拍。测试速率 50 MHz，数据速率 100 MHz。'),
  },
]
