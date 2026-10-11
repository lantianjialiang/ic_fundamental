import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'
import { type Seg as WaveSeg } from './func'

/* ---------- 1. 向量是什么 ---------- */

export const VEC_LEAD: LText[] = [
  loc('测试向量（Test Vector）也叫测试图形（Pattern）或真值表：一行一个周期，写着这个周期每个输入要给什么、每个输出应该是什么。', 'Test vectors are also called patterns or a truth table: one row per cycle, stating what each input gets and what each output should be in that cycle.'),
  loc('用什么字符都可以，只要测试机知道每个字符代表什么动作。最常见的一套是：0 / 1 驱动输入，L / H / Z 比较输出，X 什么都不做。', 'Any characters will do, as long as the tester knows what action each one means. The most common set: 0 / 1 drive inputs, L / H / Z compare outputs, X does nothing.'),
]

export const CHARS: Card[] = [
  { id: '0', title: '0', sub: loc('驱动低', 'Drive low'), text: loc('输入脚：驱动器在驱动沿输出 VIL。', 'Input pin: the driver outputs VIL at the drive edge.') },
  { id: '1', title: '1', sub: loc('驱动高', 'Drive high'), text: loc('输入脚：驱动器在驱动沿输出 VIH。', 'Input pin: the driver outputs VIH at the drive edge.') },
  { id: 'L', title: 'L', sub: loc('期望低', 'Expect low'), text: loc('输出脚：Strobe 时刻电压必须低于 VOL，否则 Fail。', 'Output pin: at the strobe the voltage must be below VOL, otherwise Fail.') },
  { id: 'H', title: 'H', sub: loc('期望高', 'Expect high'), text: loc('输出脚：Strobe 时刻电压必须高于 VOH，否则 Fail。', 'Output pin: at the strobe the voltage must be above VOH, otherwise Fail.') },
  { id: 'Z', title: 'Z', sub: loc('期望高阻', 'Expect high-Z'), text: loc('三态输出：Strobe 时刻管脚应该没人驱动，电压停在负载给的中间电平（VREF 附近），既不高于 VOH 也不低于 VOL。', 'Tri-state output: at the strobe nothing should drive the pin, so it sits at the mid level set by the load (near VREF), neither above VOH nor below VOL.') },
  { id: 'X', title: 'X', sub: loc('不驱动、不比较', 'No drive, no compare'), text: loc('Don’t care / 屏蔽：这个周期驱动器不驱动，比较器也不看。常用于还没初始化的输出，或 I/O 脚的方向切换期。', 'Don’t care / mask: in this cycle the driver is off and the comparator ignores the pin. Typical for outputs not yet initialized, or while an I/O pin is changing direction.') },
]

export type Stage = { id: string; name: LText | string; sub: string; text: LText }

export const STAGES: Stage[] = [
  { id: 'mem', name: loc('向量存储器', 'Vector memory'), sub: 'raw', text: loc('一行向量只是几个字符，例如 IN = 1、OUT = L。这是“生”数据：没说什么时候变，也没说变成多少伏。', 'A vector row is just a few characters, e.g. IN = 1, OUT = L. This is "raw" data: it says neither when to change nor to what voltage.') },
  { id: 'ts', name: 'Time Set', sub: 'TS1', text: loc('Time Set 给出时间：周期 100 ns，IN 在 10 ns 驱动，OUT 在 70 ns Strobe。不同行可以引用不同的 Time Set。', 'The time set supplies timing: period 100 ns, IN driven at 10 ns, OUT strobed at 70 ns. Different rows may reference different time sets.') },
  { id: 'fmt', name: loc('格式', 'Format'), sub: 'NRZ', text: loc('格式决定波形形状。NRZ：在驱动沿变成数据值，整个周期保持。换成 RZ 就会变成一个脉冲。', 'The format sets the waveform shape. NRZ: change to the data value at the drive edge and hold for the whole cycle. Switch to RZ and it becomes a pulse.') },
  { id: 'lvl', name: loc('电平', 'Levels'), sub: 'VIL/VIH', text: loc('电平决定电压：0 → VIL = 0.4 V，1 → VIH = 2.4 V。到这里数据才“熟”了，由 Pin Electronics 的驱动器送到管脚。', 'Levels set the voltage: 0 → VIL = 0.4 V, 1 → VIH = 2.4 V. Only now is the data "cooked", and the pin electronics driver sends it to the pin.') },
  { id: 'dut', name: 'DUT', sub: 'NOT', text: loc('芯片（这里是一个反相器）收到输入，约 15 ns 后输出跳变。', 'The device (an inverter here) receives the input, and its output switches about 15 ns later.') },
  { id: 'cmp', name: loc('比较器', 'Comparator'), sub: 'Strobe', text: loc('Strobe 时刻，比较器把 OUT 的电压和 VOL / VOH 比，得到 L / H / 中间，再和向量里存的期望字符比。期望响应存在向量存储器里——所以叫 Stored Response。', 'At the strobe, the comparator checks the OUT voltage against VOL / VOH to get L / H / in-between, then compares that with the expected character stored in the vector. The expected response lives in vector memory, hence the name Stored Response.') },
]

export const PIPE_VECS: Array<{ id: string; inp: 0 | 1; exp: 'L' | 'H' | 'X' }> = [
  { id: 'v0', inp: 0, exp: 'X' },
  { id: 'v1', inp: 1, exp: 'L' },
  { id: 'v2', inp: 0, exp: 'H' },
  { id: 'v3', inp: 1, exp: 'L' },
]

export const PIPE = { period: 100, drive: 10, strobe: 70, delay: 15, vil: 0.4, vih: 2.4 }

export const MICRO: Card[] = [
  { id: 'repeat', title: loc('重复 Repeat', 'Repeat'), sub: 'Repeat 25', text: loc('同一行向量连续执行 N 个周期，只占一行存储。等待、复位保持时很常用。', 'Runs the same vector row for N consecutive cycles while using only one row of memory. Common for waits and holding reset.') },
  { id: 'loop', title: loc('循环 Loop', 'Loop'), sub: 'Loop / Branch', text: loc('一段向量反复执行，或根据条件跳转。例如等芯片某个标志位出现再往下走。', 'Repeats a block of vectors, or branches on a condition, e.g. wait for a device flag before moving on.') },
  { id: 'sub', title: loc('子程序', 'Subroutine'), sub: 'Subroutine', text: loc('把常用的一段（例如一次总线写）写成子程序，多处调用，省向量存储。', 'Write a frequently used block (e.g. one bus write) as a subroutine and call it from many places to save vector memory.') },
  { id: 'ts', title: loc('实时换 Time Set', 'Time set on the fly'), sub: 'on the fly', text: loc('每一行都可以指定用哪个 Time Set：时序值和格式可以逐周期切换。驱动器也能逐周期开关，比较器可以逐周期选择看不看。', 'Every row can name its own time set, so timing values and formats can change cycle by cycle. Drivers can also be switched on/off per cycle, and the comparator can be enabled or masked per cycle.') },
  { id: 'trans', title: loc('向量翻译器', 'Vector translator'), sub: 'Translator', text: loc('每家测试机写微码和指令的方式都不一样。把测试程序搬到另一个品牌的测试机上，就需要向量翻译器转换格式。', 'Every tester vendor writes microcode and instructions differently. Moving a test program to another brand of tester needs a vector translator to convert the format.') },
]

export const SOURCE_LEAD: LText[] = [
  loc('复杂芯片的向量一般从设计阶段的仿真数据中提取：把仿真结果转换成目标测试机的格式，必要时再做加工。几百万个周期的向量很常见。', 'Vectors for complex devices are usually extracted from design simulation data: the simulation results are converted to the target tester format and post-processed if needed. Vectors with millions of cycles are common.'),
  loc('向量可能由设计工程师、测试工程师或仿真工程师来做。关键是既懂芯片，也懂测试机。', 'Vectors may be created by the design engineer, the test engineer or a simulation engineer. The key is to understand both the device and the tester.'),
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
  { ts: 'Reset', pins: '0111' + '0000' + 'XXXX', micro: 'Normal', note: loc('拉低复位，总线不管', 'Assert reset, ignore bus') },
  { ts: 'Reset', pins: '0111' + '0000' + 'XXXX', micro: 'Repeat 25', note: loc('复位保持 25 个周期', 'Hold reset for 25 cycles') },
  { ts: 'Reset', pins: '1111' + '0000' + 'ZZZZ', micro: 'Normal', note: loc('释放复位，未选中：总线应为高阻', 'Release reset, not selected: bus should be high-Z') },
  { ts: 'Write', pins: '1001' + '0000' + '0101', micro: 'Normal', note: loc('地址 0 写 5h', 'Write 5h to address 0') },
  { ts: 'Write', pins: '1001' + '0001' + '1010', micro: 'Normal', note: loc('地址 1 写 Ah', 'Write Ah to address 1') },
  { ts: 'Read', pins: '1010' + '0000' + 'LHLH', micro: 'Normal', note: loc('读地址 0，期望 5h', 'Read address 0, expect 5h') },
  { ts: 'Read', pins: '1010' + '0001' + 'HLHL', micro: 'Normal', note: loc('读地址 1，期望 Ah', 'Read address 1, expect Ah') },
  { ts: 'Read', pins: '1111' + '0000' + 'ZZZZ', micro: 'Normal', note: loc('撤片选，输出回到高阻', 'Deselect chip, outputs back to high-Z') },
  { ts: 'Read', pins: '1111' + '0000' + 'XXXX', micro: 'Halt', note: loc('结束', 'End') },
]

export const microCycles = (m: Micro) => (m === 'Repeat 25' ? 25 : 1)

export const FILE_HEAD: LText[] = [
  loc('; 字符：0/1 驱动低/高，L/H 期望低/高，Z 期望高阻，X 不驱动也不比较', '; Chars: 0/1 drive low/high, L/H expect low/high, Z expect high-Z, X no drive, no compare'),
  loc('; Time Set：Reset / Write / Read，具体时序值写在主程序里', '; Time sets: Reset / Write / Read, timing values defined in the main program'),
  loc('; 微码：Normal 执行 1 个周期，Repeat 25 重复 25 个周期，Halt 停止', '; Microcode: Normal runs 1 cycle, Repeat 25 repeats 25 cycles, Halt stops'),
]

export const TS_TEXT: Record<TsName, LText> = {
  Reset: loc('Reset 时序组：复位用，时序通常很宽松。向量里只写名字，数值在主测试程序里定义；有的测试机只支持编号，不支持名字。', 'Reset time set: used for reset, timing is usually relaxed. The vector only names it; the values are defined in the main test program. Some testers support only numbers, not names.'),
  Write: loc('Write 时序组：WE 用低脉冲格式（RO），地址和数据用 NRZ，满足写周期的建立 / 保持要求。', 'Write time set: WE uses a low-pulse format (RO), address and data use NRZ, meeting the write-cycle setup / hold requirements.'),
  Read: loc('Read 时序组：OE 有效后在规格时刻 Strobe 数据总线。', 'Read time set: after OE goes active, the data bus is strobed at the specified time.'),
}

export const MICRO_TEXT: Record<Micro, LText> = {
  Normal: loc('Normal：这一行执行一个周期。', 'Normal: this row runs for one cycle.'),
  'Repeat 25': loc('Repeat 25：这一行连续执行 25 个周期，向量存储只占一行。', 'Repeat 25: this row runs for 25 consecutive cycles but uses only one row of vector memory.'),
  Halt: loc('Halt：执行完这一行就停止整个向量序列。', 'Halt: the whole vector sequence stops after this row.'),
}

export function charText(kind: PinKind, ch: string): LText {
  if (kind === 'in') {
    if (ch === '0') return loc('输入驱动低（VIL）。', 'Input driven low (VIL).')
    if (ch === '1') return loc('输入驱动高（VIH）。', 'Input driven high (VIH).')
    return loc('输入不驱动。', 'Input not driven.')
  }
  if (ch === '0') return loc('I/O 脚此刻是输入：测试机驱动低，写进芯片。', 'The I/O pin is an input now: the tester drives low into the device.')
  if (ch === '1') return loc('I/O 脚此刻是输入：测试机驱动高，写进芯片。', 'The I/O pin is an input now: the tester drives high into the device.')
  if (ch === 'L') return loc('I/O 脚此刻是输出：驱动器关断，比较器在 Strobe 时期望低。', 'The I/O pin is an output now: the driver is off and the comparator expects low at the strobe.')
  if (ch === 'H') return loc('I/O 脚此刻是输出：驱动器关断，比较器在 Strobe 时期望高。', 'The I/O pin is an output now: the driver is off and the comparator expects high at the strobe.')
  if (ch === 'Z') return loc('期望高阻：芯片不该驱动总线，测试机也不驱动，检查电压停在 VREF 附近。', 'Expect high-Z: neither the device nor the tester should drive the bus; check that the voltage sits near VREF.')
  return loc('不驱动、不比较：复位期间输出状态未知，先屏蔽掉。', 'No drive, no compare: output state is unknown during reset, so mask it.')
}

export const FILE_NOTE = loc('这一份向量把 6 种字符全用上了：输入脚用 0/1，数据总线写的时候用 0/1、读的时候用 L/H，片选无效时用 Z，复位期间用 X。', 'This vector file uses all 6 characters: inputs use 0/1, the data bus uses 0/1 when writing and L/H when reading, Z when chip select is inactive, and X during reset.')

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
  loc('Figure 10-1 是 ITS 9000 上 256 × 4 静态 RAM 的棋盘格向量。第一列地址（Hex，0 → 255），第二列输入数据，第三列输出数据，然后是 CS1、CS2、WE、OE，最后是指向 Time Set 的名字。', 'Figure 10-1 shows checkerboard vectors for a 256 × 4 static RAM on the ITS 9000. Column 1 is the address (hex, 0 → 255), column 2 the input data, column 3 the output data, then CS1, CS2, WE, OE, and finally the name of the time set.'),
  loc('先用 write 时序组把整片写一遍，再用 read 时序组读一遍。写的时候输出列是 x（不测）；读的时候输出列出现 5 / A，表示要比较。', 'First the whole array is written with the write time set, then read back with the read time set. While writing, the output column is x (not tested); while reading, it shows 5 / A, meaning compare.'),
]

export const CB_WHY = loc('5h = 0101，Ah = 1010。偶数地址写 5、奇数地址写 A：同一个字里相邻位相反，相邻地址的同一位也相反，存储阵列里 0 和 1 就像棋盘一样交错。相邻单元之间的短路、耦合都会让读回的数据出错。', '5h = 0101, Ah = 1010. Even addresses get 5, odd addresses get A: adjacent bits in a word are opposite, and the same bit at adjacent addresses is opposite too, so 0s and 1s alternate in the array like a checkerboard. Any short or coupling between neighboring cells makes the read-back data wrong.')

export const TESTERS: Card[] = [
  {
    id: 'its',
    title: 'ITS 9000',
    sub: 'Schlumberger',
    text: loc('按列排：地址、数据用 Hex 写，一行一个周期，行尾写 Time Set 名字（write / read）。直观、紧凑。', 'Column layout: address and data in hex, one row per cycle, time set name (write / read) at the end of the row. Clear and compact.'),
  },
  {
    id: 'trillium',
    title: 'Trillium Delta Master',
    sub: 'LTX',
    text: loc('文件开头先定义每个字符的含义，连信号格式（RZ、SBC 等）也写在字符定义里。', 'The file starts by defining what each character means; even signal formats (RZ, SBC, etc.) are part of the character definitions.'),
  },
  {
    id: 'sentry',
    title: 'Sentry Series 20',
    sub: 'Schlumberger',
    text: loc('所有字符都只写 0 或 1，驱动 / 比较由 SET D、SET M 语句定义，所以很难读。LSUBR 定义连续子程序，用于动态 IDD 测试。', 'Every character is just 0 or 1; drive / compare is defined by SET D and SET M statements, which makes it hard to read. LSUBR defines a continuous subroutine, used for dynamic IDD tests.'),
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
  loc('仿真跑完，可以把结果存成一个表格文本：每行一个时间戳，加上所有输入 / 输出的状态。再把它转换成测试数据。', 'After a simulation run, the results can be saved as a tabular text file: each row is a timestamp plus the state of every input / output. That file is then converted into test data.'),
  loc('记录方式有两种。Print on Strobe（按周期采集）：每个周期只在一个固定时刻记一行，一行就是一个周期。Print on Change（按事件采集）：任何一个信号变化就记一行。', 'There are two ways to record. Print on Strobe (cycle-based): one row at a fixed time in each cycle, so one row = one cycle. Print on Change (event-based): a row whenever any signal changes.'),
]

export const SCENE_TEXT: Record<SimScene, LText> = {
  mixed: loc('混合格式：CLK 是 RZ 脉冲，DATA 是 NRZ，OUT 在周期中间（42 ns）变化，INT 还有一个 10 ns 的毛刺。', 'Mixed formats: CLK is an RZ pulse, DATA is NRZ, OUT changes mid-cycle (42 ns), and INT has a 10 ns glitch.'),
  nrz: loc('全部 NRZ：所有信号只在周期起点变化。这时 Print on Strobe 一个变化都不会丢。', 'All NRZ: every signal changes only at the start of a cycle. Print on Strobe then loses no changes at all.'),
}

/* ---------- 5. 向量存储深度 ---------- */

export const DEPTHS: Array<{ id: string; n: number; label: string }> = [
  { id: '4k', n: 4096, label: '4K' },
  { id: '64k', n: 65536, label: '64K' },
  { id: '256k', n: 262144, label: '256K' },
  { id: '1m', n: 1048576, label: '1M' },
]

export const MEM_LEAD = loc('向量从测试机里的高速向量存储器执行。存储深度决定一次能装多少向量；装不下就要中途重载，重载期间什么也测不了，白白浪费测试时间。有的测试机只有 4096 深，有的有 1M 甚至更多。', 'Vectors execute from high-speed vector memory in the tester. Memory depth sets how many vectors fit at once; if they do not fit, the memory must be reloaded mid-test, and nothing can be tested during a reload, wasting test time. Some testers are only 4096 deep, others have 1M or more.')

export const HAND_TIPS: LText[] = [
  loc('现在的芯片需要的向量远远多于手工能写的数量。', 'Modern devices need far more vectors than anyone can write by hand.'),
  loc('非要手写时，想办法自动化：用宏，或者用 C / Pascal 写个程序来生成。', 'If you must write them by hand, automate: use macros, or write a C / Pascal program to generate them.'),
  loc('先把芯片功能分块，每块写一个例程：总线写 / 读、复位、端口读 / 写、发送 / 接收数据……再拼起来。', 'Split the device function into blocks and write a routine for each: bus write / read, reset, port read / write, transmit / receive data... then put them together.'),
  loc('尽早和设计工程师碰头：讨论测试细节、时序和电压要求、向量怎么产生；把 Simulation for Test 守则交给他，说明目标测试机的资源和限制。', 'Meet the design engineer early: discuss test details, timing and voltage requirements, and how vectors will be generated; hand over the Simulation for Test guidelines and explain the target tester\'s resources and limits.'),
]

/* ---------- 6. Simulation for Test ---------- */

export const RULES: Array<{ n: number; title: LText; text: LText }> = [
  { n: 1, title: loc('完整初始化，不靠上电状态', 'Fully initialize, never rely on power-up state'), text: loc('仿真一开始就要完整初始化芯片，不能依赖“上电后的状态”。向量反复跑必须结果一致。每个仿真文件独立成块，不依赖别的文件。', 'The simulation must fully initialize the device right from the start, never relying on the "power-up state". Running the vectors repeatedly must give the same result. Each simulation file is self-contained and does not depend on other files.') },
  { n: 2, title: loc('用正常功能来初始化', 'Initialize with normal functions'), text: loc('尽量用 Reset 这类正常应用里的功能来初始化。如果内部有个触发器无法复位，仿真可能看起来正确、应用里也能用，但测试会时好时坏——取决于它每次上电落在哪个状态。', 'Initialize with functions used in normal operation, such as Reset, whenever possible. If an internal flip-flop cannot be reset, the simulation may look correct and the application may work, but the test will pass intermittently, depending on which state it lands in at each power-up.') },
  { n: 3, title: loc('不要强制节点', 'Do not force nodes'), text: loc('内部、外部节点都不能被强制（force）到某个状态。所有状态都必须靠向量本身初始化得到。', 'No internal or external node may be forced to a state. Every state must be reached by initializing through the vectors themselves.') },
  { n: 4, title: loc('初始化完成前不比较输出', 'No output compare before initialization'), text: loc('芯片完全初始化之前不要测试输出，哪怕某些输出看上去已经是确定状态。', 'Do not test outputs before the device is fully initialized, even if some outputs already seem to be in a known state.') },
  { n: 5, title: loc('外部信号用 Print on Change', 'Use Print on Change for external signals'), text: loc('推荐所有外部信号都用 Print on Change 记录，保证每个跳变都被抓到，方便后处理。', 'Record all external signals with Print on Change, so every transition is captured and post-processing is easier.') },
  { n: 6, title: loc('标出 I/O 方向', 'Mark I/O direction'), text: loc('给双向 / 三态信号提供判断方向的依据，例如三态缓冲器内部的 Enable 信号。用它清楚地区分测试机什么时候驱动、什么时候比较、什么时候忽略。', 'Provide a way to tell the direction of bidirectional / tri-state signals, such as the internal Enable of the tri-state buffer. Use it to clearly separate when the tester drives, compares or ignores.') },
  { n: 7, title: loc('仿真与测试同频同时序', 'Same frequency and timing as the test'), text: loc('仿真和测试的频率、时序条件必须一致。最好 / 最坏情况的仿真都要在测试频率下做，并比较结果，确认输出数据不会跨过周期边界。', 'Simulation and test must use the same frequency and timing conditions. Run both best-case and worst-case simulations at the test frequency and compare the results to make sure output data never crosses a cycle boundary.') },
  { n: 8, title: loc('多时钟要同频或整数倍', 'Multiple clocks: equal or integer multiples'), text: loc('有多个时钟时，频率应相同或互为整数倍。4 MHz 和 8 MHz 可以；4 MHz 和 7 MHz 测试机可能处理不了。', 'With multiple clocks, the frequencies should be equal or integer multiples of each other. 4 MHz and 8 MHz is fine; 4 MHz and 7 MHz may be impossible for the tester.') },
  { n: 9, title: loc('激励按周期组织', 'Organize stimulus by cycles'), text: loc('仿真可以异步跑，但大多数数字测试机是同步机器。后处理时波形要切成周期，所以激励尽量按周期组织。', 'Simulation can run asynchronously, but most digital testers are synchronous machines. Waveforms must be cut into cycles during post-processing, so organize the stimulus by cycles where possible.') },
  { n: 10, title: loc('少用实时换时序', 'Avoid on-the-fly timing changes'), text: loc('尽量避免需要实时切换 Time Set；输入信号的时序尽量以芯片的输入时钟为参考。', 'Avoid needing to switch time sets on the fly; reference input signal timing to the device\'s input clock where possible.') },
  { n: 11, title: loc('HEX 输出先确认', 'Check before using HEX output'), text: loc('用 HEX 格式打印仿真输出前，先确认不会出问题。有的转换软件不认 HEX，还得额外再转回二进制。', 'Before printing simulation output in HEX, make sure it will not cause problems. Some conversion software does not accept HEX and needs an extra step back to binary.') },
  { n: 12, title: loc('AC 表征按规格组织时序', 'AC characterization follows the spec'), text: loc('需要做 AC 参数表征时，仿真时序要按 AC 电气规格来组织。例如测建立时间，被测信号和参考信号要在同一个周期里跳变。', 'When AC parameters will be characterized, organize simulation timing according to the AC electrical specs. For a setup time, for example, the measured signal and the reference signal must switch in the same cycle.') },
  { n: 13, title: loc('专门为 DC 参数做向量', 'Dedicated vectors for DC parameters'), text: loc('专门做 DC 用的向量很有用：动态 IDD 要先把芯片置到特定状态再动态运行；VOL / VOH 要让每个输出都到过 0 和 1；VIL / VIH 要让每个输入都高低翻转；所有双向和三态输出都要进过高阻态。', 'Vectors dedicated to DC tests are very useful: dynamic IDD needs the device set to a specific state and then run dynamically; VOL / VOH needs every output to reach both 0 and 1; VIL / VIH needs every input toggled high and low; every bidirectional and tri-state output must enter high-Z.') },
  { n: 14, title: loc('提供时序图', 'Provide timing diagrams'), text: loc('仿真用到的输入 / 输出时序图是必需的。', 'Input / output timing diagrams used in the simulation are required.') },
  { n: 15, title: loc('有疑虑尽早沟通', 'Raise concerns early'), text: loc('如果怀疑仿真某部分有问题，一定告诉测试工程师——能省下大量 Debug 时间。最好在做仿真之前就碰头；来不及的话，至少拿着仿真数据一起过一遍。', 'If you suspect part of the simulation is wrong, tell the test engineer; it saves a lot of troubleshooting time. Ideally meet before the simulation is done; if that is too late, at least walk through the simulation data together.') },
]

export const RULE_EXTRA = loc('另外：仿真文件里出现的所有字符，都要写清楚含义。', 'Also: every character that appears in the simulation file must have its meaning clearly documented.')

export const VIOLATIONS: Array<{ id: string; text: LText; options: number[]; answer: number; why: LText }> = [
  {
    id: 'v1',
    text: loc('仿真一开始就假设所有寄存器都是 0（上电默认值），没有做任何初始化。', 'The simulation assumes from the start that all registers are 0 (power-up default) and does no initialization.'),
    options: [1, 5, 9],
    answer: 1,
    why: loc('上电状态是随机的，每次上测试机都可能不一样。仿真必须自己把芯片完整初始化。', 'The power-up state is random and may differ every time on the tester. The simulation must fully initialize the device itself.'),
  },
  {
    id: 'v2',
    text: loc('内部有个计数器触发器没有复位端，仿真里它“恰好”从 0 开始。', 'An internal counter flip-flop has no reset, and in simulation it "happens" to start at 0.'),
    options: [2, 7, 14],
    answer: 2,
    why: loc('应用里没问题，测试时却会时好时坏：这个触发器每次上电落在哪个状态是随机的。要通过正常功能把它初始化。', 'It works in the application, but the test passes intermittently: which state the flip-flop lands in at each power-up is random. Initialize it through normal functions.'),
  },
  {
    id: 'v3',
    text: loc('为了省事，仿真脚本用 force 把内部状态机直接设到 IDLE。', 'To save effort, the simulation script uses force to set the internal state machine directly to IDLE.'),
    options: [3, 8, 12],
    answer: 3,
    why: loc('测试机没法 force 芯片内部节点。仿真里能到的状态，向量本身也必须能到。', 'A tester cannot force internal device nodes. Any state reached in simulation must also be reachable by the vectors themselves.'),
  },
  {
    id: 'v4',
    text: loc('复位还没结束，向量就开始比较 DOUT（虽然它碰巧是 0）。', 'Before reset has finished, the vectors start comparing DOUT (even though it happens to be 0).'),
    options: [4, 6, 11],
    answer: 4,
    why: loc('初始化完成之前，输出“碰巧”是确定值并不可靠，那几个周期应该写 X。', 'Before initialization is complete, an output that "happens" to be known is not reliable; those cycles should be X.'),
  },
  {
    id: 'v5',
    text: loc('芯片有 4 MHz 和 7 MHz 两个时钟输入，仿真按各自频率自由运行。', 'The device has two clock inputs, 4 MHz and 7 MHz, and the simulation runs each freely at its own frequency.'),
    options: [8, 10, 13],
    answer: 8,
    why: loc('7 不是 4 的整数倍，两个时钟的相位每个周期都在变，测试机的周期结构装不下。', '7 is not an integer multiple of 4, so the phase between the two clocks changes every cycle and does not fit the tester\'s cycle structure.'),
  },
  {
    id: 'v6',
    text: loc('仿真在 10 MHz 下跑，测试机准备在 25 MHz 下跑这组向量。', 'The simulation runs at 10 MHz, but the tester will run these vectors at 25 MHz.'),
    options: [7, 3, 15],
    answer: 7,
    why: loc('频率不同，输出延迟占周期的比例就不同，输出数据可能跨过周期边界，期望值就错位了。', 'At a different frequency the output delay is a different fraction of the cycle, so output data may cross a cycle boundary and the expected values shift.'),
  },
  {
    id: 'v7',
    text: loc('双向数据总线只给出了电平，看不出哪个周期是芯片在驱动。', 'The bidirectional data bus shows only levels; you cannot tell in which cycles the device is driving.'),
    options: [6, 9, 2],
    answer: 6,
    why: loc('不知道方向，就分不清该写 0/1（测试机驱动）还是 L/H（比较）还是 X。要提供 Enable 之类的方向信号。', 'Without the direction you cannot decide between 0/1 (tester drives), L/H (compare) or X. Provide a direction signal such as Enable.'),
  },
]

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('向量是存在向量存储器里的“生”数据：0/1 驱动、L/H/Z 比较、X 不管；和 Time Set、格式、电平结合后才变成管脚上的波形。', 'Vectors are "raw" data in vector memory: 0/1 drive, L/H/Z compare, X ignore. Only combined with the time set, format and levels do they become waveforms on the pins.'),
  loc('期望输出也存在向量里，比较器在 Strobe 时刻比对——Stored Response。', 'Expected outputs are stored in the vectors too, and the comparator checks them at the strobe: Stored Response.'),
  loc('向量里还有微码（Repeat、Loop、子程序、换 Time Set），写法因测试机而异，换机器要用翻译器。', 'Vectors also carry microcode (Repeat, Loop, subroutines, time set changes); the syntax differs by tester, so moving to another tester needs a translator.'),
  loc('大多数向量来自仿真。Print on Strobe 一行一周期，会丢周期中间的变化；Print on Change 全记录但文件很大。', 'Most vectors come from simulation. Print on Strobe gives one row per cycle but loses mid-cycle changes; Print on Change records everything but the files are large.'),
  loc('向量数超过存储深度就要重载，浪费测试时间。尽早和设计工程师沟通，给他 Simulation for Test 守则。', 'More vectors than the memory depth means reloads, which waste test time. Talk to the design engineer early and give them the Simulation for Test guidelines.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('测试工程师应该在什么时候和设计工程师讨论测试向量开发？', 'When should the test engineer discuss test vector development with the design engineer?'),
    options: [
      { id: 'a', text: loc('项目中越早越好，最好在做仿真之前', 'As early in the project as possible, ideally before simulation') },
      { id: 'b', text: loc('仿真全部完成以后', 'After all simulation is finished') },
      { id: 'c', text: loc('芯片流片回来、上测试机发现问题时', 'When silicon is back and problems show up on the tester') },
      { id: 'd', text: loc('量产开始以后', 'After production starts') },
    ],
    answer: 'a',
    explain: loc('越早越好：讨论测试细节、时序和电压要求、向量怎么产生，并把 Simulation for Test 守则交给设计工程师。等仿真做完再改，代价大得多。', 'The earlier the better: discuss test details, timing and voltage requirements, and how vectors will be generated, and hand the Simulation for Test guidelines to the design engineer. Changing things after simulation is done costs far more.'),
  },
  {
    id: 'q2',
    prompt: loc('目前大多数测试向量是从仿真数据中开发出来的。对吗？', 'Most test vectors today are developed from simulation data. True?'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('复杂芯片动辄几百万个周期，手工写不出来。一般把设计阶段的仿真结果转换成测试机格式。', 'Complex devices easily need millions of cycles, which cannot be written by hand. Design simulation results are usually converted to the tester format.'),
  },
  {
    id: 'q3',
    prompt: loc('哪一种仿真记录方式，一行数据代表一个测试周期？', 'Which simulation recording method gives one row of data per test cycle?'),
    options: [
      { id: 'a', text: loc('Print on Strobe（按周期采集）', 'Print on Strobe (cycle-based)') },
      { id: 'b', text: loc('Print on Change（按事件采集）', 'Print on Change (event-based)') },
      { id: 'c', text: loc('两种都是', 'Both') },
    ],
    answer: 'a',
    explain: loc('Print on Strobe 每个周期只在一个时刻采一次，所以一行 = 一个周期。Print on Change 每个跳变都记一行，一个周期可能有很多行。', 'Print on Strobe samples once per cycle at one time, so one row = one cycle. Print on Change records a row for every transition, so one cycle may have many rows.'),
  },
  {
    id: 'q4',
    prompt: loc('测试向量存放在测试机的什么地方？', 'Where are test vectors stored in the tester?'),
    options: [
      { id: 'a', text: loc('高速向量存储器（Vector Memory）', 'High-speed vector memory') },
      { id: 'b', text: loc('PMU 里', 'In the PMU') },
      { id: 'c', text: loc('Time Set 里', 'In the time set') },
      { id: 'd', text: loc('DUT 板上的 EEPROM', 'An EEPROM on the DUT board') },
    ],
    answer: 'a',
    explain: loc('向量序列存在向量存储器里，每一行是一个测试周期的“生”数据，执行时和时序、格式、电平结合后送到管脚。', 'The vector sequence lives in vector memory; each row is the "raw" data for one test cycle, combined with timing, format and levels at run time and sent to the pins.'),
  },
  {
    id: 'q5',
    prompt: loc('测试向量的数量（测试周期数）会影响总测试时间吗？', 'Does the number of test vectors (test cycles) affect total test time?'),
    options: [
      { id: 'a', text: loc('会', 'Yes') },
      { id: 'b', text: loc('不会', 'No') },
    ],
    answer: 'a',
    explain: loc('每个周期都要花时间执行；向量多到超过存储深度，还要中途重载，浪费更多时间。', 'Every cycle takes time to execute; if the vectors exceed the memory depth, mid-test reloads waste even more time.'),
  },
  {
    id: 'q6',
    prompt: loc('一串测试向量的作用是什么？', 'What is the purpose of a set of test vectors?'),
    options: [
      { id: 'a', text: loc('按周期给出输入激励和期望输出，验证芯片是否实现了设计的逻辑功能', 'Give input stimulus and expected outputs cycle by cycle to verify the device performs its designed logic function') },
      { id: 'b', text: loc('测量管脚的漏电流', 'Measure pin leakage current') },
      { id: 'c', text: loc('设定测试机的时序值', 'Set the tester timing values') },
      { id: 'd', text: loc('给芯片供电', 'Power the device') },
    ],
    answer: 'a',
    explain: loc('向量就是芯片应完成的逻辑功能的真值表：输入给什么、输出应该是什么。时序值在 Time Set 里，不在向量里。', 'Vectors are the truth table of the logic function the device should perform: what goes in and what should come out. Timing values are in the time set, not in the vectors.'),
  },
  {
    id: 'q7',
    prompt: loc('棋盘格向量里偶数地址写 5h、奇数地址写 Ah，为什么？', 'Why does the checkerboard pattern write 5h to even addresses and Ah to odd addresses?'),
    options: [
      { id: 'a', text: loc('0101 / 1010 让相邻位、相邻地址都相反，0 和 1 交错', '0101 / 1010 makes adjacent bits and adjacent addresses opposite, so 0s and 1s alternate') },
      { id: 'b', text: loc('5 和 A 是最大的十六进制数', '5 and A are the largest hex digits') },
      { id: 'c', text: loc('测试机只支持这两个值', 'The tester supports only these two values') },
    ],
    answer: 'a',
    explain: loc('相邻单元互为相反值，单元间短路或耦合就会读错。', 'Neighboring cells hold opposite values, so any short or coupling between cells causes a read error.'),
  },
  {
    id: 'q8',
    prompt: loc('200 万个向量放到 4K 深的测试机上跑，最大的问题是？', 'What is the biggest problem with running 2 million vectors on a tester that is 4K deep?'),
    options: [
      { id: 'a', text: loc('要重载约 488 次，重载时间远远超过向量本身的执行时间', 'About 488 reloads, and reload time far exceeds the vector execution time itself') },
      { id: 'b', text: loc('向量会跑得更快', 'The vectors run faster') },
      { id: 'c', text: loc('没有影响', 'No effect') },
    ],
    answer: 'a',
    explain: loc('2,000,000 / 4096 ≈ 489 段，要重载 488 次。每次哪怕只要 0.1 s，也要多花近 50 s——这样的芯片在小存储的测试机上几乎没法量产。', '2,000,000 / 4096 ≈ 489 blocks, so 488 reloads. Even at only 0.1 s each, that adds almost 50 s; such a device is practically impossible to produce on a tester with small memory.'),
  },
]
