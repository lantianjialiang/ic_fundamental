import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'
import { type Seg as WaveSeg } from './func'

/* ---------- 1. 向量是什么 ---------- */

export const VEC_LEAD: LText[] = [
  loc('测试向量（Test Vector）也叫测试图形（Pattern）或真值表：一行一个周期，写着这个周期每个输入要给什么、每个输出应该是什么。'),
  loc('用什么字符都可以，只要测试机知道每个字符代表什么动作。最常见的一套是：0 / 1 驱动输入，L / H / Z 比较输出，X 什么都不做。'),
]

export const CHARS: Card[] = [
  { id: '0', title: '0', sub: loc('驱动低'), text: loc('输入脚：驱动器在驱动沿输出 VIL。') },
  { id: '1', title: '1', sub: loc('驱动高'), text: loc('输入脚：驱动器在驱动沿输出 VIH。') },
  { id: 'L', title: 'L', sub: loc('期望低'), text: loc('输出脚：Strobe 时刻电压必须低于 VOL，否则 Fail。') },
  { id: 'H', title: 'H', sub: loc('期望高'), text: loc('输出脚：Strobe 时刻电压必须高于 VOH，否则 Fail。') },
  { id: 'Z', title: 'Z', sub: loc('期望高阻'), text: loc('三态输出：Strobe 时刻管脚应该没人驱动，电压停在负载给的中间电平（VREF 附近），既不高于 VOH 也不低于 VOL。') },
  { id: 'X', title: 'X', sub: loc('不驱动、不比较'), text: loc('Don’t care / 屏蔽：这个周期驱动器不驱动，比较器也不看。常用于还没初始化的输出，或 I/O 脚的方向切换期。') },
]

export type Stage = { id: string; name: LText | string; sub: string; text: LText }

export const STAGES: Stage[] = [
  { id: 'mem', name: loc('向量存储器'), sub: 'raw', text: loc('一行向量只是几个字符，例如 IN = 1、OUT = L。这是“生”数据：没说什么时候变，也没说变成多少伏。') },
  { id: 'ts', name: 'Time Set', sub: 'TS1', text: loc('Time Set 给出时间：周期 100 ns，IN 在 10 ns 驱动，OUT 在 70 ns Strobe。不同行可以引用不同的 Time Set。') },
  { id: 'fmt', name: loc('格式'), sub: 'NRZ', text: loc('格式决定波形形状。NRZ：在驱动沿变成数据值，整个周期保持。换成 RZ 就会变成一个脉冲。') },
  { id: 'lvl', name: loc('电平'), sub: 'VIL/VIH', text: loc('电平决定电压：0 → VIL = 0.4 V，1 → VIH = 2.4 V。到这里数据才“熟”了，由 Pin Electronics 的驱动器送到管脚。') },
  { id: 'dut', name: 'DUT', sub: 'NOT', text: loc('芯片（这里是一个反相器）收到输入，约 15 ns 后输出跳变。') },
  { id: 'cmp', name: loc('比较器'), sub: 'Strobe', text: loc('Strobe 时刻，比较器把 OUT 的电压和 VOL / VOH 比，得到 L / H / 中间，再和向量里存的期望字符比。期望响应存在向量存储器里——所以叫 Stored Response。') },
]

export const PIPE_VECS: Array<{ id: string; inp: 0 | 1; exp: 'L' | 'H' | 'X' }> = [
  { id: 'v0', inp: 0, exp: 'X' },
  { id: 'v1', inp: 1, exp: 'L' },
  { id: 'v2', inp: 0, exp: 'H' },
  { id: 'v3', inp: 1, exp: 'L' },
]

export const PIPE = { period: 100, drive: 10, strobe: 70, delay: 15, vil: 0.4, vih: 2.4 }

export const MICRO: Card[] = [
  { id: 'repeat', title: loc('重复 Repeat'), sub: 'Repeat 25', text: loc('同一行向量连续执行 N 个周期，只占一行存储。等待、复位保持时很常用。') },
  { id: 'loop', title: loc('循环 Loop'), sub: 'Loop / Branch', text: loc('一段向量反复执行，或根据条件跳转。例如等芯片某个标志位出现再往下走。') },
  { id: 'sub', title: loc('子程序'), sub: 'Subroutine', text: loc('把常用的一段（例如一次总线写）写成子程序，多处调用，省向量存储。') },
  { id: 'ts', title: loc('实时换 Time Set'), sub: 'on the fly', text: loc('每一行都可以指定用哪个 Time Set：时序值和格式可以逐周期切换。驱动器也能逐周期开关，比较器可以逐周期选择看不看。') },
  { id: 'trans', title: loc('向量翻译器'), sub: 'Translator', text: loc('每家测试机写微码和指令的方式都不一样。把测试程序搬到另一个品牌的测试机上，就需要向量翻译器转换格式。') },
]

export const SOURCE_LEAD: LText[] = [
  loc('复杂芯片的向量一般从设计阶段的仿真数据中提取：把仿真结果转换成目标测试机的格式，必要时再做加工。几百万个周期的向量很常见。'),
  loc('向量可能由设计工程师、测试工程师或仿真工程师来做。关键是既懂芯片，也懂测试机。'),
]

/* ---------- 2. 示例向量文件 ---------- */

export type PinKind = 'in' | 'io'
export const PINS: Array<{ name: string; kind: PinKind }> = [
  { name: 'RST', kind: 'in' },
  { name: 'CS', kind: 'in' },
  { name: 'WE', kind: 'in' },
  { name: 'OE', kind: 'in' },
  { name: 'A3', kind: 'in' },
  { name: 'A2', kind: 'in' },
  { name: 'A1', kind: 'in' },
  { name: 'A0', kind: 'in' },
  { name: 'D3', kind: 'io' },
  { name: 'D2', kind: 'io' },
  { name: 'D1', kind: 'io' },
  { name: 'D0', kind: 'io' },
]

export type TsName = 'Reset' | 'Write' | 'Read'
export type Micro = 'Normal' | 'Repeat 25' | 'Halt'

export type VLine = { ts: TsName; pins: string; micro: Micro; note: LText }

export const VLINES: VLine[] = [
  { ts: 'Reset', pins: '0111' + '0000' + 'XXXX', micro: 'Normal', note: loc('拉低复位，总线不管') },
  { ts: 'Reset', pins: '0111' + '0000' + 'XXXX', micro: 'Repeat 25', note: loc('复位保持 25 个周期') },
  { ts: 'Reset', pins: '1111' + '0000' + 'ZZZZ', micro: 'Normal', note: loc('释放复位，未选中：总线应为高阻') },
  { ts: 'Write', pins: '1001' + '0000' + '0101', micro: 'Normal', note: loc('地址 0 写 5h') },
  { ts: 'Write', pins: '1001' + '0001' + '1010', micro: 'Normal', note: loc('地址 1 写 Ah') },
  { ts: 'Read', pins: '1010' + '0000' + 'LHLH', micro: 'Normal', note: loc('读地址 0，期望 5h') },
  { ts: 'Read', pins: '1010' + '0001' + 'HLHL', micro: 'Normal', note: loc('读地址 1，期望 Ah') },
  { ts: 'Read', pins: '1111' + '0000' + 'ZZZZ', micro: 'Normal', note: loc('撤片选，输出回到高阻') },
  { ts: 'Read', pins: '1111' + '0000' + 'XXXX', micro: 'Halt', note: loc('结束') },
]

export const microCycles = (m: Micro) => (m === 'Repeat 25' ? 25 : 1)

export const FILE_HEAD: LText[] = [
  loc('; 字符：0/1 驱动低/高，L/H 期望低/高，Z 期望高阻，X 不驱动也不比较'),
  loc('; Time Set：Reset / Write / Read，具体时序值写在主程序里'),
  loc('; 微码：Normal 执行 1 个周期，Repeat 25 重复 25 个周期，Halt 停止'),
]

export const TS_TEXT: Record<TsName, LText> = {
  Reset: loc('Reset 时序组：复位用，时序通常很宽松。向量里只写名字，数值在主测试程序里定义；有的测试机只支持编号，不支持名字。'),
  Write: loc('Write 时序组：WE 用低脉冲格式（RO），地址和数据用 NRZ，满足写周期的建立 / 保持要求。'),
  Read: loc('Read 时序组：OE 有效后在规格时刻 Strobe 数据总线。'),
}

export const MICRO_TEXT: Record<Micro, LText> = {
  Normal: loc('Normal：这一行执行一个周期。'),
  'Repeat 25': loc('Repeat 25：这一行连续执行 25 个周期，向量存储只占一行。'),
  Halt: loc('Halt：执行完这一行就停止整个向量序列。'),
}

export function charText(kind: PinKind, ch: string): LText {
  if (kind === 'in') {
    if (ch === '0') return loc('输入驱动低（VIL）。')
    if (ch === '1') return loc('输入驱动高（VIH）。')
    return loc('输入不驱动。')
  }
  if (ch === '0') return loc('I/O 脚此刻是输入：测试机驱动低，写进芯片。')
  if (ch === '1') return loc('I/O 脚此刻是输入：测试机驱动高，写进芯片。')
  if (ch === 'L') return loc('I/O 脚此刻是输出：驱动器关断，比较器在 Strobe 时期望低。')
  if (ch === 'H') return loc('I/O 脚此刻是输出：驱动器关断，比较器在 Strobe 时期望高。')
  if (ch === 'Z') return loc('期望高阻：芯片不该驱动总线，测试机也不驱动，检查电压停在 VREF 附近。')
  return loc('不驱动、不比较：复位期间输出状态未知，先屏蔽掉。')
}

export const FILE_NOTE = loc('这一份向量把 6 种字符全用上了：输入脚用 0/1，数据总线写的时候用 0/1、读的时候用 L/H，片选无效时用 Z，复位期间用 X。')

/* ---------- 3. 棋盘格 ---------- */

export type CbView = 'write' | 'read'

export function cbRows(view: CbView, start: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const addr = start + i
    const data = addr % 2 === 0 ? '5' : 'A'
    return {
      addr,
      hex: addr.toString(16).toUpperCase().padStart(2, '0'),
      din: view === 'write' ? data : 'x',
      dout: view === 'write' ? 'x' : data,
      cs1: '0',
      cs2: '1',
      we: view === 'write' ? '0' : '1',
      oe: view === 'write' ? '1' : '0',
      ts: view,
      value: addr % 2 === 0 ? 5 : 10,
    }
  })
}

export const CB_LEAD: LText[] = [
  loc('Figure 10-1 是 ITS 9000 上 256 × 4 静态 RAM 的棋盘格向量。第一列地址（Hex，0 → 255），第二列输入数据，第三列输出数据，然后是 CS1、CS2、WE、OE，最后是指向 Time Set 的名字。'),
  loc('先用 write 时序组把整片写一遍，再用 read 时序组读一遍。写的时候输出列是 x（不测）；读的时候输出列出现 5 / A，表示要比较。'),
]

export const CB_WHY = loc('5h = 0101，Ah = 1010。偶数地址写 5、奇数地址写 A：同一个字里相邻位相反，相邻地址的同一位也相反，存储阵列里 0 和 1 就像棋盘一样交错。相邻单元之间的短路、耦合都会让读回的数据出错。')

export const TESTERS: Card[] = [
  {
    id: 'its',
    title: 'ITS 9000',
    sub: 'Schlumberger',
    text: loc('按列排：地址、数据用 Hex 写，一行一个周期，行尾写 Time Set 名字（write / read）。直观、紧凑。'),
  },
  {
    id: 'trillium',
    title: 'Trillium Delta Master',
    sub: 'LTX',
    text: loc('文件开头先定义每个字符的含义，连信号格式（RZ、SBC 等）也写在字符定义里。'),
  },
  {
    id: 'sentry',
    title: 'Sentry Series 20',
    sub: 'Schlumberger',
    text: loc('所有字符都只写 0 或 1，驱动 / 比较由 SET D、SET M 语句定义，所以很难读。LSUBR 定义连续子程序，用于动态 IDD 测试。'),
  },
]

/* ---------- 4. 仿真数据采集 ---------- */

export type Bit = 0 | 1
export type SimSig = { name: string; init: Bit; ev: Array<{ t: number; v: Bit }> }

export const SIM_PERIOD = 100
export const SIM_CYCLES = 4
export const SIM_SPAN = SIM_PERIOD * SIM_CYCLES

export type SimScene = 'mixed' | 'nrz'

const clkEv = Array.from({ length: SIM_CYCLES }, (_, k) => [
  { t: k * 100 + 30, v: 1 as Bit },
  { t: k * 100 + 60, v: 0 as Bit },
]).flat()

export const SIM_SIGS: Record<SimScene, SimSig[]> = {
  mixed: [
    { name: 'CLK', init: 0, ev: clkEv },
    { name: 'DATA', init: 1, ev: [{ t: 100, v: 0 }, { t: 200, v: 1 }] },
    { name: 'OUT', init: 0, ev: [{ t: 42, v: 1 }, { t: 142, v: 0 }, { t: 242, v: 1 }] },
    { name: 'INT', init: 0, ev: [{ t: 270, v: 1 }, { t: 280, v: 0 }] },
  ],
  nrz: [
    { name: 'ADDR', init: 0, ev: [{ t: 100, v: 1 }, { t: 300, v: 0 }] },
    { name: 'DATA', init: 1, ev: [{ t: 100, v: 0 }, { t: 200, v: 1 }] },
    { name: 'WE', init: 0, ev: [{ t: 200, v: 1 }] },
    { name: 'OUT', init: 0, ev: [{ t: 100, v: 1 }, { t: 200, v: 0 }, { t: 300, v: 1 }] },
  ],
}

export function valueAt(sig: SimSig, time: number): Bit {
  let v = sig.init
  for (const e of sig.ev) if (e.t <= time) v = e.v
  return v
}

export function sigSegs(sig: SimSig): WaveSeg[] {
  const segs: WaveSeg[] = []
  let t0 = 0
  let v = sig.init
  for (const e of sig.ev) {
    segs.push({ x0: t0, x1: e.t, level: v })
    t0 = e.t
    v = e.v
  }
  segs.push({ x0: t0, x1: SIM_SPAN, level: v })
  return segs
}

export type SimLine = { t: number; vals: Bit[] }

export function pocLines(sigs: SimSig[]): SimLine[] {
  const times = Array.from(new Set([0, ...sigs.flatMap((s) => s.ev.map((e) => e.t))])).sort((a, b) => a - b)
  return times.map((t) => ({ t, vals: sigs.map((s) => valueAt(s, t)) }))
}

export function posLines(sigs: SimSig[], strobe: number): SimLine[] {
  return Array.from({ length: SIM_CYCLES }, (_, k) => {
    const t = k * SIM_PERIOD + strobe
    return { t, vals: sigs.map((s) => valueAt(s, t)) }
  })
}

export type LostPulse = { name: string; a: number; b: number }

/** 周期中间的边沿数，以及 Print on Strobe 完全看不见的脉冲 */
export function analyzeLoss(sigs: SimSig[], strobe: number) {
  let intra = 0
  let late = 0
  const pulses: LostPulse[] = []
  for (const s of sigs) {
    s.ev.forEach((e, i) => {
      const off = e.t % SIM_PERIOD
      if (off === 0) return
      intra += 1
      const next = s.ev[i + 1]
      const k = Math.floor(e.t / SIM_PERIOD)
      const sample = k * SIM_PERIOD + strobe
      if (next && Math.floor((next.t - 1) / SIM_PERIOD) === k && next.t % SIM_PERIOD !== 0) {
        if (!(sample >= e.t && sample < next.t)) pulses.push({ name: s.name, a: e.t, b: next.t })
        return
      }
      const prev = s.ev[i - 1]
      const isPulseEnd = prev && Math.floor(prev.t / SIM_PERIOD) === k && prev.t % SIM_PERIOD !== 0
      if (!isPulseEnd && strobe < off) late += 1
    })
  }
  return { intra, late, pulses }
}

export const SIM_LEAD: LText[] = [
  loc('仿真跑完，可以把结果存成一个表格文本：每行一个时间戳，加上所有输入 / 输出的状态。再把它转换成测试数据。'),
  loc('记录方式有两种。Print on Strobe（按周期采集）：每个周期只在一个固定时刻记一行，一行就是一个周期。Print on Change（按事件采集）：任何一个信号变化就记一行。'),
]

export const SCENE_TEXT: Record<SimScene, LText> = {
  mixed: loc('混合格式：CLK 是 RZ 脉冲，DATA 是 NRZ，OUT 在周期中间（42 ns）变化，INT 还有一个 10 ns 的毛刺。'),
  nrz: loc('全部 NRZ：所有信号只在周期起点变化。这时 Print on Strobe 一个变化都不会丢。'),
}

/* ---------- 5. 向量存储深度 ---------- */

export const DEPTHS: Array<{ id: string; n: number; label: string }> = [
  { id: '4k', n: 4096, label: '4K' },
  { id: '64k', n: 65536, label: '64K' },
  { id: '256k', n: 262144, label: '256K' },
  { id: '1m', n: 1048576, label: '1M' },
]

export const MEM_LEAD = loc('向量从测试机里的高速向量存储器执行。存储深度决定一次能装多少向量；装不下就要中途重载，重载期间什么也测不了，白白浪费测试时间。有的测试机只有 4096 深，有的有 1M 甚至更多。')

export const HAND_TIPS: LText[] = [
  loc('现在的芯片需要的向量远远多于手工能写的数量。'),
  loc('非要手写时，想办法自动化：用宏，或者用 C / Pascal 写个程序来生成。'),
  loc('先把芯片功能分块，每块写一个例程：总线写 / 读、复位、端口读 / 写、发送 / 接收数据……再拼起来。'),
  loc('尽早和设计工程师碰头：讨论测试细节、时序和电压要求、向量怎么产生；把 Simulation for Test 守则交给他，说明目标测试机的资源和限制。'),
]

/* ---------- 6. Simulation for Test ---------- */

export const RULES: Array<{ n: number; title: LText; text: LText }> = [
  { n: 1, title: loc('完整初始化，不靠上电状态'), text: loc('仿真一开始就要完整初始化芯片，不能依赖“上电后的状态”。向量反复跑必须结果一致。每个仿真文件独立成块，不依赖别的文件。') },
  { n: 2, title: loc('用正常功能来初始化'), text: loc('尽量用 Reset 这类正常应用里的功能来初始化。如果内部有个触发器无法复位，仿真可能看起来正确、应用里也能用，但测试会时好时坏——取决于它每次上电落在哪个状态。') },
  { n: 3, title: loc('不要强制节点'), text: loc('内部、外部节点都不能被强制（force）到某个状态。所有状态都必须靠向量本身初始化得到。') },
  { n: 4, title: loc('初始化完成前不比较输出'), text: loc('芯片完全初始化之前不要测试输出，哪怕某些输出看上去已经是确定状态。') },
  { n: 5, title: loc('外部信号用 Print on Change'), text: loc('推荐所有外部信号都用 Print on Change 记录，保证每个跳变都被抓到，方便后处理。') },
  { n: 6, title: loc('标出 I/O 方向'), text: loc('给双向 / 三态信号提供判断方向的依据，例如三态缓冲器内部的 Enable 信号。用它清楚地区分测试机什么时候驱动、什么时候比较、什么时候忽略。') },
  { n: 7, title: loc('仿真与测试同频同时序'), text: loc('仿真和测试的频率、时序条件必须一致。最好 / 最坏情况的仿真都要在测试频率下做，并比较结果，确认输出数据不会跨过周期边界。') },
  { n: 8, title: loc('多时钟要同频或整数倍'), text: loc('有多个时钟时，频率应相同或互为整数倍。4 MHz 和 8 MHz 可以；4 MHz 和 7 MHz 测试机可能处理不了。') },
  { n: 9, title: loc('激励按周期组织'), text: loc('仿真可以异步跑，但大多数数字测试机是同步机器。后处理时波形要切成周期，所以激励尽量按周期组织。') },
  { n: 10, title: loc('少用实时换时序'), text: loc('尽量避免需要实时切换 Time Set；输入信号的时序尽量以芯片的输入时钟为参考。') },
  { n: 11, title: loc('HEX 输出先确认'), text: loc('用 HEX 格式打印仿真输出前，先确认不会出问题。有的转换软件不认 HEX，还得额外再转回二进制。') },
  { n: 12, title: loc('AC 表征按规格组织时序'), text: loc('需要做 AC 参数表征时，仿真时序要按 AC 电气规格来组织。例如测建立时间，被测信号和参考信号要在同一个周期里跳变。') },
  { n: 13, title: loc('专门为 DC 参数做向量'), text: loc('专门做 DC 用的向量很有用：动态 IDD 要先把芯片置到特定状态再动态运行；VOL / VOH 要让每个输出都到过 0 和 1；VIL / VIH 要让每个输入都高低翻转；所有双向和三态输出都要进过高阻态。') },
  { n: 14, title: loc('提供时序图'), text: loc('仿真用到的输入 / 输出时序图是必需的。') },
  { n: 15, title: loc('有疑虑尽早沟通'), text: loc('如果怀疑仿真某部分有问题，一定告诉测试工程师——能省下大量 Debug 时间。最好在做仿真之前就碰头；来不及的话，至少拿着仿真数据一起过一遍。') },
]

export const RULE_EXTRA = loc('另外：仿真文件里出现的所有字符，都要写清楚含义。')

export const VIOLATIONS: Array<{ id: string; text: LText; options: number[]; answer: number; why: LText }> = [
  {
    id: 'v1',
    text: loc('仿真一开始就假设所有寄存器都是 0（上电默认值），没有做任何初始化。'),
    options: [1, 5, 9],
    answer: 1,
    why: loc('上电状态是随机的，每次上测试机都可能不一样。仿真必须自己把芯片完整初始化。'),
  },
  {
    id: 'v2',
    text: loc('内部有个计数器触发器没有复位端，仿真里它“恰好”从 0 开始。'),
    options: [2, 7, 14],
    answer: 2,
    why: loc('应用里没问题，测试时却会时好时坏：这个触发器每次上电落在哪个状态是随机的。要通过正常功能把它初始化。'),
  },
  {
    id: 'v3',
    text: loc('为了省事，仿真脚本用 force 把内部状态机直接设到 IDLE。'),
    options: [3, 8, 12],
    answer: 3,
    why: loc('测试机没法 force 芯片内部节点。仿真里能到的状态，向量本身也必须能到。'),
  },
  {
    id: 'v4',
    text: loc('复位还没结束，向量就开始比较 DOUT（虽然它碰巧是 0）。'),
    options: [4, 6, 11],
    answer: 4,
    why: loc('初始化完成之前，输出“碰巧”是确定值并不可靠，那几个周期应该写 X。'),
  },
  {
    id: 'v5',
    text: loc('芯片有 4 MHz 和 7 MHz 两个时钟输入，仿真按各自频率自由运行。'),
    options: [8, 10, 13],
    answer: 8,
    why: loc('7 不是 4 的整数倍，两个时钟的相位每个周期都在变，测试机的周期结构装不下。'),
  },
  {
    id: 'v6',
    text: loc('仿真在 10 MHz 下跑，测试机准备在 25 MHz 下跑这组向量。'),
    options: [7, 3, 15],
    answer: 7,
    why: loc('频率不同，输出延迟占周期的比例就不同，输出数据可能跨过周期边界，期望值就错位了。'),
  },
  {
    id: 'v7',
    text: loc('双向数据总线只给出了电平，看不出哪个周期是芯片在驱动。'),
    options: [6, 9, 2],
    answer: 6,
    why: loc('不知道方向，就分不清该写 0/1（测试机驱动）还是 L/H（比较）还是 X。要提供 Enable 之类的方向信号。'),
  },
]

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('向量是存在向量存储器里的“生”数据：0/1 驱动、L/H/Z 比较、X 不管；和 Time Set、格式、电平结合后才变成管脚上的波形。'),
  loc('期望输出也存在向量里，比较器在 Strobe 时刻比对——Stored Response。'),
  loc('向量里还有微码（Repeat、Loop、子程序、换 Time Set），写法因测试机而异，换机器要用翻译器。'),
  loc('大多数向量来自仿真。Print on Strobe 一行一周期，会丢周期中间的变化；Print on Change 全记录但文件很大。'),
  loc('向量数超过存储深度就要重载，浪费测试时间。尽早和设计工程师沟通，给他 Simulation for Test 守则。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('测试工程师应该在什么时候和设计工程师讨论测试向量开发？'),
    options: [
      { id: 'a', text: loc('项目中越早越好，最好在做仿真之前') },
      { id: 'b', text: loc('仿真全部完成以后') },
      { id: 'c', text: loc('芯片流片回来、上测试机发现问题时') },
      { id: 'd', text: loc('量产开始以后') },
    ],
    answer: 'a',
    explain: loc('越早越好：讨论测试细节、时序和电压要求、向量怎么产生，并把 Simulation for Test 守则交给设计工程师。等仿真做完再改，代价大得多。'),
  },
  {
    id: 'q2',
    prompt: loc('目前大多数测试向量是从仿真数据中开发出来的。对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('复杂芯片动辄几百万个周期，手工写不出来。一般把设计阶段的仿真结果转换成测试机格式。'),
  },
  {
    id: 'q3',
    prompt: loc('哪一种仿真记录方式，一行数据代表一个测试周期？'),
    options: [
      { id: 'a', text: loc('Print on Strobe（按周期采集）') },
      { id: 'b', text: loc('Print on Change（按事件采集）') },
      { id: 'c', text: loc('两种都是') },
    ],
    answer: 'a',
    explain: loc('Print on Strobe 每个周期只在一个时刻采一次，所以一行 = 一个周期。Print on Change 每个跳变都记一行，一个周期可能有很多行。'),
  },
  {
    id: 'q4',
    prompt: loc('测试向量存放在测试机的什么地方？'),
    options: [
      { id: 'a', text: loc('高速向量存储器（Vector Memory）') },
      { id: 'b', text: loc('PMU 里') },
      { id: 'c', text: loc('Time Set 里') },
      { id: 'd', text: loc('DUT 板上的 EEPROM') },
    ],
    answer: 'a',
    explain: loc('向量序列存在向量存储器里，每一行是一个测试周期的“生”数据，执行时和时序、格式、电平结合后送到管脚。'),
  },
  {
    id: 'q5',
    prompt: loc('测试向量的数量（测试周期数）会影响总测试时间吗？'),
    options: [
      { id: 'a', text: loc('会') },
      { id: 'b', text: loc('不会') },
    ],
    answer: 'a',
    explain: loc('每个周期都要花时间执行；向量多到超过存储深度，还要中途重载，浪费更多时间。'),
  },
  {
    id: 'q6',
    prompt: loc('一串测试向量的作用是什么？'),
    options: [
      { id: 'a', text: loc('按周期给出输入激励和期望输出，验证芯片是否实现了设计的逻辑功能') },
      { id: 'b', text: loc('测量管脚的漏电流') },
      { id: 'c', text: loc('设定测试机的时序值') },
      { id: 'd', text: loc('给芯片供电') },
    ],
    answer: 'a',
    explain: loc('向量就是芯片应完成的逻辑功能的真值表：输入给什么、输出应该是什么。时序值在 Time Set 里，不在向量里。'),
  },
  {
    id: 'q7',
    prompt: loc('棋盘格向量里偶数地址写 5h、奇数地址写 Ah，为什么？'),
    options: [
      { id: 'a', text: loc('0101 / 1010 让相邻位、相邻地址都相反，0 和 1 交错') },
      { id: 'b', text: loc('5 和 A 是最大的十六进制数') },
      { id: 'c', text: loc('测试机只支持这两个值') },
    ],
    answer: 'a',
    explain: loc('相邻单元互为相反值，单元间短路或耦合就会读错。'),
  },
  {
    id: 'q8',
    prompt: loc('200 万个向量放到 4K 深的测试机上跑，最大的问题是？'),
    options: [
      { id: 'a', text: loc('要重载约 488 次，重载时间远远超过向量本身的执行时间') },
      { id: 'b', text: loc('向量会跑得更快') },
      { id: 'c', text: loc('没有影响') },
    ],
    answer: 'a',
    explain: loc('2,000,000 / 4096 ≈ 489 段，要重载 488 次。每次哪怕只要 0.1 s，也要多花近 50 s——这样的芯片在小存储的测试机上几乎没法量产。'),
  },
]
