import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const ROLES: Card[] = [
  {
    id: 'verify',
    title: loc('功能验证', 'Functional verification'),
    sub: loc('Verification · 设计阶段', 'Verification · design phase'),
    text: loc('问：设计对不对？在仿真器或第一批样片上，尽量覆盖所有功能和角落情况。', 'Asks: is the design correct? Cover every function and corner case, in the simulator or on first silicon.'),
    explain: [
      loc('验证关心“设计有没有 Bug”。向量可以很长、可以跑很久，目标是把设计意图全部检查一遍。', 'Verification asks "does the design have bugs?" Vectors can be long and run for a long time; the goal is to check the whole design intent.'),
    ],
  },
  {
    id: 'mfg',
    title: loc('量产功能测试', 'Production functional test'),
    sub: loc('Manufacturing · 每一颗', 'Manufacturing · every device'),
    text: loc('问：这一颗有没有制造缺陷？设计已经被证明是对的。', 'Asks: does this device have a manufacturing defect? The design is already proven correct.'),
    explain: [
      loc('量产关心“这颗芯片有没有做坏”。时间就是成本，所以要用尽量短的向量抓尽量多的缺陷——这就引出了故障模型和故障覆盖率。', 'Production asks "was this chip built badly?" Test time is cost, so catch as many defects as possible with as few vectors as possible. This leads to fault models and fault coverage.'),
    ],
  },
]

export const SOURCES: Card[] = [
  {
    id: 'app',
    title: loc('应用型 / 并行向量', 'Application / parallel vectors'),
    sub: loc('Application · Parallel', 'Application · Parallel'),
    text: loc('从芯片的外部管脚、按正常工作方式驱动和比较，就像真实系统在用它。', 'Drive and compare through the external pins in normal operating mode, just as a real system would use the chip.'),
    explain: [
      loc('常来自设计验证的仿真波形，转换成测试机格式。直观、贴近实际用法，但对复杂电路很难做到高覆盖率。', 'Often converted from design-verification simulation waveforms into tester format. Intuitive and close to real use, but hard to reach high coverage on complex circuits.'),
    ],
  },
  {
    id: 'scan',
    title: loc('Scan / 结构化向量', 'Scan / structural vectors'),
    sub: loc('Structural · ATPG', 'Structural · ATPG'),
    text: loc('不管芯片“用来干什么”，只按电路结构，用 ATPG 自动生成，目标是故障覆盖率。', 'Ignores what the chip "is for". Generated automatically by ATPG from the circuit structure, targeting fault coverage.'),
    explain: [
      loc('借助 Scan 链把内部触发器变成可直接读写的节点，组合逻辑就能被逐块测试（{@vector}、{@scan}）。', 'Scan chains turn internal flip-flops into directly readable and writable nodes, so combinational logic can be tested block by block ({@vector}, {@scan}).'),
    ],
  },
]

export const COVERAGE_LEAD = loc('故障覆盖率 = 被向量检测到的故障数 ÷ 故障模型里的故障总数。常用 Stuck-at 模型：假设每个节点可能固定在 0 或 1。故障模拟器把每个故障逐个注入，看向量能不能让输出出错。', 'Fault coverage = faults detected by the vectors ÷ total faults in the fault model. The common stuck-at model assumes any node may be stuck at 0 or 1. A fault simulator injects each fault in turn and checks whether the vectors make an output go wrong.')

export const DFT: Card[] = [
  {
    id: 'adhoc',
    title: loc('Ad-hoc DFT', 'Ad-hoc DFT'),
    sub: loc('针对具体难点', 'Targets specific trouble spots'),
    text: loc('哪里难测改哪里：加测试点、加复位、把长计数器拆开。', 'Fix whatever is hard to test: add test points, add resets, split long counters.'),
    explain: [
      loc('经典例子：一个 30 位计数器，要看到最高位翻转得跑 2³⁰ 个时钟。加几个测试点把它拆成几段，每段可以单独预置和观察，测试时间从秒级降到微秒级。', 'Classic example: a 30-bit counter needs 2³⁰ clocks before the top bit toggles. A few test points split it into segments that can each be preset and observed, cutting test time from seconds to microseconds.'),
    ],
  },
  {
    id: 'scan',
    title: loc('Scan', 'Scan'),
    sub: loc('结构化 DFT', 'Structured DFT'),
    text: loc('把触发器串成移位寄存器，从外面直接写入和读出内部状态。', 'Chain the flip-flops into a shift register so internal state can be written and read directly from outside.'),
    explain: [
      loc('Mux Scan：每个触发器前加一个二选一，Scan Enable 选择“功能输入”还是“上一级的输出”。最常用。', 'Mux scan: a 2-to-1 mux in front of each flip-flop; Scan Enable selects the "functional input" or the "previous stage output". The most common style.'),
      loc('LSSD（电平敏感扫描设计）：用两相不重叠时钟的锁存器对，对时序要求最宽松。', 'LSSD (level-sensitive scan design): latch pairs driven by two non-overlapping clocks. The most relaxed timing requirements.'),
      loc('双时钟 Scan：功能时钟和扫描时钟分开，用不同时钟控制移位和捕获。', 'Two-clock scan: separate functional and scan clocks control shift and capture.'),
      loc('Full Scan：所有触发器都进链，ATPG 最容易；Partial Scan：只挑一部分，省面积和速度代价，但覆盖率和 ATPG 难度变差。', 'Full scan: every flip-flop is in a chain, so ATPG is easiest. Partial scan: only some are, saving area and speed, but coverage drops and ATPG gets harder.'),
    ],
  },
  {
    id: 'bist',
    title: loc('BIST', 'BIST'),
    sub: loc('内建自测试', 'Built-in self-test'),
    text: loc('芯片自己产生向量、自己压缩结果。测试机只需要启动它、读一个签名。', 'The chip generates its own vectors and compresses its own results. The tester only starts it and reads a signature.'),
    explain: [
      loc('LFSR（线性反馈移位寄存器）产生伪随机向量 → 送进被测电路 → MISR（多输入签名寄存器）把所有输出压缩成一个签名 → 和好片的签名比。', 'An LFSR (linear feedback shift register) generates pseudo-random vectors → applied to the circuit under test → a MISR (multiple-input signature register) compresses all outputs into one signature → compared with a good device signature.'),
      loc('Memory BIST 最常见：大容量 SRAM 用片上 March 算法自测，测试机只读 Pass / Fail。', 'Memory BIST is the most common: large SRAMs test themselves with an on-chip March algorithm, and the tester just reads Pass / Fail.'),
    ],
  },
  {
    id: 'jtag',
    title: loc('JTAG / 边界扫描', 'JTAG / boundary scan'),
    sub: loc('IEEE 1149.1', 'IEEE 1149.1'),
    text: loc('用 4–5 根线（TAP）控制芯片内部的测试逻辑和每个 I/O 的边界扫描单元。', 'Uses 4–5 wires (the TAP) to control on-chip test logic and the boundary-scan cell on every I/O.'),
    explain: [
      loc('TAP 管脚：TCK 时钟、TMS 模式选择、TDI 数据输入、TDO 数据输出、可选的 TRST 复位。', 'TAP pins: TCK clock, TMS mode select, TDI data in, TDO data out, and optional TRST reset.'),
      loc('边界扫描单元串在每个 I/O 后面，可以直接设定每个输出的电平、关断它，或者读取每个输入。', 'Boundary-scan cells sit behind every I/O. They can set each output level directly, turn it off, or read each input.'),
      loc('对 DC 测试很有用：不用写复杂的预处理向量，通过 JTAG 直接把某个输出设成高、低或高阻，再用 PMU 量。', 'Very useful for DC tests: instead of writing complex preconditioning vectors, set an output high, low or high-Z through JTAG, then measure with the PMU.'),
    ],
  },
]

export const DFT_ATE = loc('DFT 也要和测试机配合：Scan 链越多越短，需要的测试机 Scan 通道越多、向量深度越浅；BIST 降低对测试机速度和存储的要求；JTAG 只占很少的管脚，适合低成本测试机和多工位并测。', 'DFT must also fit the tester: more, shorter scan chains need more tester scan channels but less vector depth; BIST lowers tester speed and memory requirements; JTAG uses very few pins, suiting low-cost testers and multi-site testing.')

export const TERMS: Card[] = [
  { id: 'pat', title: loc('测试向量', 'Test vectors'), sub: loc('Test pattern', 'Test pattern'), text: loc('一拍一行：每个管脚这一拍驱动什么、期望什么。', 'One row per cycle: what each pin drives and expects in that cycle.') },
  { id: 'fmt', title: loc('信号格式', 'Signal format'), sub: loc('Signal format', 'NRZ / RZ / SBC ...'), text: loc('输入的 0 和 1 在一个周期里具体画成什么波形。', 'The exact waveform an input 0 or 1 takes within one cycle.') },
  { id: 'strobe', title: loc('Strobe', 'Strobe'), sub: loc('比较时刻', 'Compare time'), text: loc('在周期里的哪个时刻（或哪段时间）去比较输出。', 'The moment (or window) in the cycle when the output is compared.') },
  { id: 'sample', title: loc('采样时刻', 'Sample time'), sub: loc('Sample time', 'Sample time'), text: loc('比较器真正读输出电平的那一瞬间，由 Strobe 边沿决定。', 'The instant the comparator actually reads the output level, set by the strobe edge.') },
  { id: 'mask', title: loc('Mask', 'Mask'), sub: loc('X / 不比较', 'X / don\'t compare'), text: loc('这一拍这个输出不比较，比如上电后还不确定的状态。', 'This output is not compared in this cycle, e.g. a state still unknown after power-up.') },
  { id: 'cycle', title: loc('测试周期', 'Test cycle'), sub: loc('Test cycle = 1 / f', 'Test cycle = 1 / f'), text: loc('一拍的长度。10 MHz 对应 100 ns。周期的起点叫 T0，所有边沿都从 T0 算起。', 'The length of one cycle. 10 MHz means 100 ns. The cycle start is called T0, and every edge is measured from T0.') },
]

export type Fmt = 'NRZ' | 'DNRZ' | 'RZ' | 'RO' | 'SBC' | 'ZD'

export const FORMATS: Array<{ id: Fmt; name: LText; text: LText }> = [
  { id: 'NRZ', name: loc('NRZ 不归零', 'NRZ non-return to zero'), text: loc('数据在 T0 变化，整个周期保持。数据不变就没有边沿。最简单，常用于地址、数据。', 'Data changes at T0 and holds for the whole cycle. No change in data means no edge. The simplest format, common for address and data.') },
  { id: 'DNRZ', name: loc('DNRZ 延迟不归零', 'DNRZ delayed NRZ'), text: loc('和 NRZ 一样整周期保持，只是变化时刻从 T0 推迟到边沿 1。用来做 Setup / Hold 相对于时钟的定位。', 'Holds for the whole cycle like NRZ, but changes at edge 1 instead of T0. Used to place setup / hold relative to a clock.') },
  { id: 'RZ', name: loc('RZ 归零', 'RZ return to zero'), text: loc('数据为 1 时在边沿 1 到边沿 2 之间出一个高脉冲，其余时间为 0。数据为 0 就一直是 0。典型用于正脉冲时钟。', 'When data is 1, a high pulse from edge 1 to edge 2; 0 the rest of the time. When data is 0 it stays 0. Typical for positive-pulse clocks.') },
  { id: 'RO', name: loc('RO 归一', 'RO return to one'), text: loc('RZ 的反相：平时为 1，数据为 0 时在边沿 1 到边沿 2 之间出一个低脉冲。用于低有效的时钟或选通。', 'The inverse of RZ: normally 1; when data is 0, a low pulse from edge 1 to edge 2. Used for active-low clocks or strobes.') },
  { id: 'SBC', name: loc('SBC 补码包围', 'SBC surround by complement'), text: loc('边沿 1 之前和边沿 2 之后输出数据的反码，中间才是数据。每一拍都有两个边沿，Setup 和 Hold 一次都考到。', 'Drives the complement of the data before edge 1 and after edge 2, with the true data in between. Every cycle has two edges, so setup and hold are both tested in one pass.') },
  { id: 'ZD', name: loc('Z 窗口驱动', 'ZD Z-window drive'), text: loc('只在边沿 1 到边沿 2 之间驱动数据，其余时间驱动器关断（高阻）。用于双向管脚：不驱动时把总线让出来。', 'Drives data only from edge 1 to edge 2; the driver is off (high-Z) the rest of the time. Used on bidirectional pins to release the bus when not driving.') },
]

export type Level = 0 | 1 | 'z'
export type Seg = { x0: number; x1: number; level: Level }

/** 把一串数据按格式展开成电平段（时间单位 ns） */
export function formatSegments(fmt: Fmt, bits: number[], period: number, t1: number, t2: number): Seg[] {
  const segs: Seg[] = []
  bits.forEach((bit, i) => {
    const d = (bit ? 1 : 0) as 0 | 1
    const nd = (bit ? 0 : 1) as 0 | 1
    const prev = (i === 0 ? 0 : bits[i - 1] ? 1 : 0) as 0 | 1
    const t0 = i * period
    const push = (a: number, b: number, level: Level) => {
      if (b > a) segs.push({ x0: t0 + a, x1: t0 + b, level })
    }
    if (fmt === 'NRZ') push(0, period, d)
    if (fmt === 'DNRZ') {
      push(0, t1, prev)
      push(t1, period, d)
    }
    if (fmt === 'RZ') {
      push(0, t1, 0)
      push(t1, t2, d)
      push(t2, period, 0)
    }
    if (fmt === 'RO') {
      push(0, t1, 1)
      push(t1, t2, d)
      push(t2, period, 1)
    }
    if (fmt === 'SBC') {
      push(0, t1, nd)
      push(t1, t2, d)
      push(t2, period, nd)
    }
    if (fmt === 'ZD') {
      push(0, t1, 'z')
      push(t1, t2, d)
      push(t2, period, 'z')
    }
  })
  return segs
}

export const CHARS: Array<{ ch: string; kind: LText; text: LText }> = [
  { ch: '0', kind: loc('驱动', 'Drive'), text: loc('输入驱动为逻辑 0（按信号格式和 VIL 画出来）', 'Drive input to logic 0 (shaped by the signal format, at VIL)') },
  { ch: '1', kind: loc('驱动', 'Drive'), text: loc('输入驱动为逻辑 1（按信号格式和 VIH）', 'Drive input to logic 1 (signal format, at VIH)') },
  { ch: 'L', kind: loc('比较', 'Compare'), text: loc('期望输出低：Strobe 时电压 ≤ VOL', 'Expect output low: voltage ≤ VOL at strobe') },
  { ch: 'H', kind: loc('比较', 'Compare'), text: loc('期望输出高：Strobe 时电压 ≥ VOH', 'Expect output high: voltage ≥ VOH at strobe') },
  { ch: 'Z', kind: loc('比较', 'Compare'), text: loc('期望高阻：负载把引脚拉到 VREF，电压落在 VOL 与 VOH 之间', 'Expect high-Z: the load pulls the pin to VREF, so the voltage falls between VOL and VOH') },
  { ch: 'X', kind: loc('屏蔽', 'Mask'), text: loc('不驱动也不比较（Mask）', 'Neither drive nor compare (mask)') },
]

export const TIMESET = loc('Time Set（时间集）：一组“周期 + 每个管脚的格式和边沿 + Strobe 位置”的组合。向量的每一行都指定用哪个 Time Set，比如初始化用慢的、正式测试用快的。', 'Time set: a bundle of "period + each pin\'s format and edges + strobe placement". Every vector row names the time set it uses, e.g. a slow one for initialization and a fast one for the real test.')

export const EXEC_STEPS: LText[] = [
  loc('设电源：VDD（先 VDDmin，再 VDDmax 各跑一遍）。', 'Set power: VDD (run once at VDDmin, then once at VDDmax).'),
  loc('设输入电平：VIL / VIH。', 'Set input levels: VIL / VIH.'),
  loc('设输出比较电平：VOL / VOH。', 'Set output compare levels: VOL / VOH.'),
  loc('设负载：IOL / IOH 和切换电压 VREF（要测高阻时必须有负载）。', 'Set the load: IOL / IOH and commutating voltage VREF (a load is required to test high-Z).'),
  loc('设时序：周期、每个输入的边沿 1 / 边沿 2、每个输出的 Strobe。', 'Set timing: period, edge 1 / edge 2 for each input, strobe for each output.'),
  loc('设信号格式：每个输入用 NRZ、RZ、SBC……', 'Set signal formats: NRZ, RZ, SBC ... for each input.'),
  loc('指定向量的起止地址，选择 Time Set。', 'Specify the vector start and stop addresses and select the time set.'),
  loc('运行，读结果：全对 Pass；有 Fail 时记录失败的向量号和管脚。', 'Run and read the result: all correct = Pass; on Fail, log the failing vector number and pins.'),
]

export const WORST = loc('最坏情况测试：所有输入的时序同时放在规格极限上，一次跑完，Pass 就代表全部参数都满足——快，但 Fail 了不知道是哪个参数。单项测试：一次只把一个参数推到极限，其他放松——慢，但能定位。量产多用前者，表征和 Debug 用后者。', 'Worst-case testing: all input timings sit at their spec limits at once, run in one pass. Pass means every parameter is met. Fast, but a Fail does not tell you which parameter. Individual testing: push one parameter to its limit at a time and relax the rest. Slow, but it pinpoints the problem. Production mostly uses the former; characterization and troubleshooting use the latter.')

export const RELAX = loc('放松（Relaxed）参数：不是本次要考的参数，就给宽松的值，避免它先挂掉干扰判断。比如测 VIH 时用慢周期，测时序时用标准电平。', 'Relaxed parameters: any parameter not under test gets a loose value so it does not fail first and confuse the result. For example, use a slow period when testing VIH, and nominal levels when testing timing.')

export const GROSS = loc('粗功能（Gross functional）：用最宽松的条件跑一遍——慢周期（如 500 ns）、全部 NRZ、放松的电平和时序。只问“基本逻辑活着吗”，放在开短路之后、DC 之前。它同时把整套向量（包括 DC 测试要用的预处理向量）都验证一遍，后面的测试才能放心使用；量产中它的结果也是很有用的良率信息。', 'Gross functional: one run under the loosest conditions: slow period (e.g. 500 ns), all NRZ, relaxed levels and timing. It only asks "is the basic logic alive?" and runs after opens/shorts and before DC. It also proves the whole vector set (including the preconditioning vectors used by DC tests) so later tests can rely on it. In production its result is useful yield information too.')

export const EQUATION = loc('基于公式的时序（Equation based timing）：所有边沿都写成“规格值 × SCALE”这样的公式。改一个变量，整套时序就按比例一起收紧或放松，边沿之间的相对位置保持不变——粗功能用慢时序、全速测试用规格时序、不同速度等级的芯片，都只需改这一个数。调试时也最方便。', 'Equation-based timing: every edge is written as a formula like "spec value × SCALE". Change one variable and the whole timing set tightens or loosens proportionally, keeping the edges in the same relative positions. Slow timing for gross functional, spec timing for at-speed tests, and different speed grades all need just this one number changed. It is also the easiest to troubleshoot.')

export const INVERTER_PROGRAM = loc(`// 时钟反相器：10 MHz 功能测试
SET VDD        = 4.75 V          // 先 VDDmin
SET VIL / VIH  = 0.8 V / 2.0 V
SET VOL / VOH  = 0.4 V / 2.4 V
SET LOAD       IOL = 8 mA, IOH = -5.2 mA, VREF = 1.5 V
TIMESET TS1:
  PERIOD   100 ns
  CLK      RZ   edge1 = 25 ns, edge2 = 75 ns
  DATA     SBC  edge1 = 10 ns, edge2 = 30 ns
  OUT      STROBE at 83 ns
RUN PATTERN inv_func  START 0  STOP 15  TIMESET TS1
IF FAIL -> BIN 5
SET VDD = 5.25 V                 // 再 VDDmax
RUN PATTERN inv_func ...`, `// Clocked inverter: 10 MHz functional test
SET VDD        = 4.75 V          // VDDmin first
SET VIL / VIH  = 0.8 V / 2.0 V
SET VOL / VOH  = 0.4 V / 2.4 V
SET LOAD       IOL = 8 mA, IOH = -5.2 mA, VREF = 1.5 V
TIMESET TS1:
  PERIOD   100 ns
  CLK      RZ   edge1 = 25 ns, edge2 = 75 ns
  DATA     SBC  edge1 = 10 ns, edge2 = 30 ns
  OUT      STROBE at 83 ns
RUN PATTERN inv_func  START 0  STOP 15  TIMESET TS1
IF FAIL -> BIN 5
SET VDD = 5.25 V                 // then VDDmax
RUN PATTERN inv_func ...`)

export const WALK_LEAD = loc('功能化的开短路：不用 PMU 逐脚量，而用向量一次扫完。每一拍只有一个管脚设为“Z 比较”，其余全部驱动 0。负载从 VREF = 3 V 往这个管脚灌 400 µA。', 'Functional opens/shorts: instead of measuring pin by pin with the PMU, sweep all pins with vectors. In each cycle only one pin is set to "compare Z"; all others drive 0. The load forces 400 µA into that pin from VREF = 3 V.')

export const WALK_POINTS: LText[] = [
  loc('正常：电流流进对 VDD 的保护二极管（VDD 此时为 0 V），引脚约 +0.65 V，落在 VOL = 0.2 V 与 VOH = 1.5 V 之间 → 判为 Z → Pass。', 'Good: current flows into the protection diode to VDD (VDD is at 0 V), the pin sits at about +0.65 V, between VOL = 0.2 V and VOH = 1.5 V → read as Z → Pass.'),
  loc('开路：没有电流通路，负载把引脚拉到 VREF = 3 V，高于 VOH → 读成 H → Fail。', 'Open: no current path, so the load pulls the pin to VREF = 3 V, above VOH → read as H → Fail.'),
  loc('短路：引脚被别的 0 V 管脚或地拉住，低于 VOL → 读成 L → Fail。', 'Short: the pin is held by another 0 V pin or ground, below VOL → read as L → Fail.'),
  loc('Strobe 放得很晚（如 900 ns），给负载对引脚电容充电留足时间。', 'Place the strobe very late (e.g. 900 ns) to give the load enough time to charge the pin capacitance.'),
  loc('对 VSS 的二极管：VDD 二极管全部通过就说明没有短路，再加一拍让所有脚同时为 Z、负载改为抽电流，一拍就查完所有对地二极管有没有开路。', 'Diodes to VSS: if all VDD diodes pass there are no shorts. Add one more cycle with all pins at Z and the load sourcing current instead, and every diode to ground is checked for opens in a single cycle.'),
  loc('优点是快：比 PMU 逐脚量快得多。缺点是 Datalog 只有 Pass / Fail，不如电压读数直观。常见做法：功能化开短路失败时，再跑一次 PMU 串行法，把失败脚的电压记下来。', 'The advantage is speed: much faster than measuring pin by pin with the PMU. The drawback is that the datalog shows only Pass / Fail, less informative than voltage readings. Common practice: when functional opens/shorts fails, rerun the serial PMU method to log the failing pin voltages.'),
]

export const WALK_PINS = ['A0', 'A1', 'A2', 'A3', 'D0', 'D1']

export const VIH_TEXT: LText[] = [
  loc('功能化的 VIL / VIH：把测试机的驱动低电平设为 VIL（0.8 V）、高电平设为 VIH（2.2 V），跑功能向量。全对就证明芯片在规格门槛上能正确识别 0 和 1。', 'Functional VIL / VIH: set the tester drive low level to VIL (0.8 V) and the high level to VIH (2.2 V), then run the functional vectors. All passing proves the chip correctly recognizes 0 and 1 at the spec thresholds.'),
  loc('VDDmin 和 VDDmax 各跑一次：输入门槛会随电源电压移动。', 'Run once at VDDmin and once at VDDmax: input thresholds shift with supply voltage.'),
  loc('Fail 时：先确认不是噪声——大量输出同时翻转会让地弹起，芯片看到的输入电平被抬高或压低。把电平往松的方向扫，找到实际门槛，和规格比差多少。', 'On Fail: first rule out noise. Many outputs switching at once cause ground bounce, which shifts the input levels the chip sees up or down. Sweep the levels in the relaxed direction to find the actual threshold and compare it with the spec.'),
]

export const LOAD_LEAD = loc('功能测试时输出要带负载，否则 VOL / VOH 是在空载下比的，太容易过。测试机的动态负载等效为：一个参考电压 VREF，经过电阻（或可编程电流源）接到输出脚。', 'Outputs must be loaded during functional test; otherwise VOL / VOH are compared with no load and pass too easily. The tester dynamic load is equivalent to a reference voltage VREF connected to the output pin through a resistor (or programmable current source).')

export const OPEN_DRAIN = loc('开漏（Open drain）输出只能拉低，不能拉高：输出为 1 时其实是高阻。测试时期望写 L 和 Z，并且必须有上拉负载，否则“高”是浮空的。开源（Open source）反过来，只能拉高。', 'An open-drain output can only pull low, not high: a 1 output is actually high-Z. Expect L and Z when testing, and a pull-up load is required, otherwise "high" is floating. Open-source outputs are the reverse: they can only pull high.')

export const TAKEAWAY: LText[] = [
  loc('量产功能测试是找制造缺陷，不是找设计 Bug；故障覆盖率衡量向量好不好。', 'Production functional test looks for manufacturing defects, not design bugs. Fault coverage measures how good the vectors are.'),
  loc('DFT 让内部可控、可观：Ad-hoc、Scan、BIST、JTAG。', 'DFT makes the internals controllable and observable: ad-hoc, scan, BIST, JTAG.'),
  loc('同一个“1”，换个信号格式就是不同的波形；格式决定了哪些边沿被考到。', 'The same "1" becomes a different waveform in a different signal format; the format decides which edges get tested.'),
  loc('边沿 Strobe 只看一瞬；窗口 Strobe 要求整段稳定，能抓毛刺。', 'An edge strobe looks at one instant; a window strobe requires the whole window to be stable and can catch glitches.'),
  loc('高阻要靠负载把引脚拉到 VREF，再用 VOL / VOH 之间判 Z。', 'High-Z relies on the load pulling the pin to VREF, then judging Z between VOL and VOH.'),
  loc('8 步执行：电源、输入电平、比较电平、负载、时序、格式、向量范围、运行。', '8 execution steps: power, input levels, compare levels, load, timing, format, vector range, run.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('5 拍数据 1 1 1 1 1，用 NRZ 格式，一共有几个边沿？', 'Five cycles of data 1 1 1 1 1 in NRZ format. How many edges are there?'),
    options: [
      { id: 'a', text: loc('1 个：只在第一拍从 0 变 1', '1: only in the first cycle, 0 to 1') },
      { id: 'b', text: loc('10 个', '10') },
      { id: 'c', text: loc('5 个', '5') },
    ],
    answer: 'a',
    explain: loc('NRZ 数据不变就不翻转。换成 RZ 就是 5 个正脉冲、10 个边沿。', 'NRZ does not toggle when the data does not change. In RZ it would be 5 positive pulses, 10 edges.'),
  },
  {
    id: 'q3',
    prompt: loc('输出在 Strobe 前后有一个很窄的毛刺，哪种 Strobe 能抓到？', 'An output has a very narrow glitch near the strobe. Which strobe can catch it?'),
    options: [
      { id: 'a', text: loc('窗口 Strobe（毛刺落在窗口内时）', 'Window strobe (when the glitch is inside the window)') },
      { id: 'b', text: loc('边沿 Strobe 一定能抓到', 'An edge strobe always catches it') },
      { id: 'c', text: loc('都抓不到', 'Neither can') },
    ],
    answer: 'a',
    explain: loc('边沿 Strobe 只看一个时刻，毛刺不正好在那一刻就看不见。', 'An edge strobe looks at a single instant; unless the glitch is exactly there, it is invisible.'),
  },
  {
    id: 'q4',
    prompt: loc('期望 Z 时，测试机怎么判断引脚是高阻？', 'When expecting Z, how does the tester decide the pin is high-Z?'),
    options: [
      { id: 'a', text: loc('负载把引脚拉到 VREF，电压在 VOL 和 VOH 之间', 'The load pulls the pin to VREF and the voltage is between VOL and VOH') },
      { id: 'b', text: loc('电压为 0', 'The voltage is 0') },
      { id: 'c', text: loc('电流为 0', 'The current is 0') },
    ],
    answer: 'a',
    explain: loc('没有负载时高阻脚是浮空的，读数不确定，所以一定要设 VREF。', 'Without a load a high-Z pin floats and the reading is undefined, so VREF must be set.'),
  },
  {
    id: 'q5',
    prompt: loc('Walking-Z 开短路测试中，某脚读成 H，说明？', 'In a walking-Z opens/shorts test, a pin reads H. What does it mean?'),
    options: [
      { id: 'a', text: loc('开路：被负载拉到了 VREF = 3 V', 'Open: the load pulled it to VREF = 3 V') },
      { id: 'b', text: loc('短路', 'Short') },
      { id: 'c', text: loc('正常', 'Good') },
    ],
    answer: 'a',
    explain: loc('正常应读到约 0.65 V（Z），短路读到 L。', 'A good pin reads about 0.65 V (Z); a short reads L.'),
  },
  {
    id: 'q6',
    prompt: loc('JTAG 边界扫描对 DC 测试有什么帮助？', 'How does JTAG boundary scan help DC tests?'),
    options: [
      { id: 'a', text: loc('不写复杂预处理向量，直接把输出设成高、低或高阻', 'Set outputs high, low or high-Z directly, without complex preconditioning vectors') },
      { id: 'b', text: loc('让 PMU 更准', 'Makes the PMU more accurate') },
      { id: 'c', text: loc('没有帮助', 'It does not help') },
    ],
    answer: 'a',
    explain: loc('边界扫描单元可以直接控制每个 I/O 的状态。', 'Boundary-scan cells directly control the state of every I/O.'),
  },
  {
    id: 'b1',
    prompt: loc('规格写 VDD = 5.0 V ± 10%，VDDmin 是多少？', 'The spec says VDD = 5.0 V ± 10%. What is VDDmin?'),
    options: [
      { id: 'a', text: loc('4.75 V', '4.75 V') },
      { id: 'b', text: loc('4.5 V', '4.5 V') },
      { id: 'c', text: loc('4.9 V', '4.9 V') },
      { id: 'd', text: loc('5.5 V', '5.5 V') },
    ],
    answer: 'b',
    explain: loc('5.0 × (1 − 10%) = 4.5 V；VDDmax = 5.5 V。4.75 V 是 ± 5% 的下限。', '5.0 × (1 − 10%) = 4.5 V; VDDmax = 5.5 V. 4.75 V is the lower limit for ± 5%.'),
  },
  {
    id: 'b2',
    prompt: loc('规格写 VDD = 5.0 V ± 5%，功能测试应在哪些电压下跑？', 'The spec says VDD = 5.0 V ± 5%. At which voltages should the functional test run?'),
    options: [
      { id: 'a', text: loc('5.00 V', '5.00 V') },
      { id: 'b', text: loc('4.75 V 和 5.52 V', '4.75 V and 5.52 V') },
      { id: 'c', text: loc('4.50 V 和 5.50 V', '4.50 V and 5.50 V') },
      { id: 'd', text: loc('4.57 V 和 5.25 V', '4.57 V and 5.25 V') },
      { id: 'e', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'e',
    explain: loc('正确答案是 4.75 V 和 5.25 V，各跑一遍：功能必须在整个电压范围内成立，只跑 5.00 V 不够。B 和 D 各写错了一个数（5.52、4.57），C 是 ± 10% 的范围，所以选“以上都不对”。', 'The correct answer is 4.75 V and 5.25 V, one run each: function must hold over the whole voltage range, so 5.00 V alone is not enough. B and D each have one wrong number (5.52, 4.57), and C is the ± 10% range, so the answer is "None of the above".'),
  },
  {
    id: 'b3',
    prompt: loc('AC 输出负载的作用，是模拟输出在实际系统里接到一个或多个器件输入时的环境。', 'The AC output load simulates the environment of an output connected to one or more device inputs in a real system.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('规格书常要求 AC 测试时输出接一个电阻 / 二极管 / 电容网络，用来模拟芯片装进最终产品（电脑、手机）后，输出要驱动的那些电路。时序参数要在这种负载下测才有意义。', 'Datasheets often require the output to drive a resistor / diode / capacitor network during AC tests, simulating the circuits the output must drive once the chip is in the end product (a PC, a phone). Timing parameters are only meaningful when measured under this load.'),
  },
  {
    id: 'b4',
    prompt: loc('VIL / VIH 规格靠什么测试来验证？', 'Which test verifies the VIL / VIH specs?'),
    options: [
      { id: 'a', text: loc('DC 测试', 'DC test') },
      { id: 'b', text: loc('功能测试', 'Functional test') },
      { id: 'c', text: loc('AC 时序测试', 'AC timing test') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('虽然 VIL / VIH 列在 DC 特性表里，但没法用 PMU 量出来。做法是把驱动电平设成 VIL / VIH 跑功能向量，全对就说明芯片在规格门槛上能正确识别 0 和 1。VDDmin、VDDmax 各跑一次。', 'Although VIL / VIH are listed in the DC characteristics table, they cannot be measured with the PMU. Set the drive levels to VIL / VIH and run the functional vectors; all passing shows the chip recognizes 0 and 1 correctly at the spec thresholds. Run once at VDDmin and once at VDDmax.'),
  },
  {
    id: 'b5',
    prompt: loc('VIL / VIH 测试失败时，失败 Datalog 上显示的失败管脚是？', 'When a VIL / VIH test fails, which pins show as failing in the datalog?'),
    options: [
      { id: 'a', text: loc('输入脚', 'Input pins') },
      { id: 'b', text: loc('输出脚', 'Output pins') },
      { id: 'c', text: loc('电源脚', 'Power pins') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('功能测试只比较输出。某个输入把 1 认成了 0，芯片的逻辑就走错，表现为某些输出的值不对。所以 Datalog 上失败的是输出脚，要找是哪个输入的问题，得逐脚放松电平去排查。', 'Functional tests only compare outputs. If an input reads a 1 as a 0, the logic goes wrong and some outputs show wrong values. So the datalog shows output pins failing; to find the culprit input, relax the levels pin by pin.'),
  },
  {
    id: 'b6',
    prompt: loc('VIH 设为 2.0 V 时测试失败。调试时怎样改电压能让测试通过？', 'The test fails with VIH = 2.0 V. During troubleshooting, which voltage change should make it pass?'),
    options: [
      { id: 'a', text: loc('把 VIH 降低 0.4 V', 'Lower VIH by 0.4 V') },
      { id: 'b', text: loc('把 VIH 提高到 VDD', 'Raise VIH to VDD') },
      { id: 'c', text: loc('把 VDD 提高 0.4 V', 'Raise VDD by 0.4 V') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('放松 VIH 是把它往上提，VDD 是最松的 VIH；放松 VIL 是往下降，0 V 最松。芯片已经过了粗功能，放松后应该能通过，以此确认问题出在输入门槛上。降低 VIH 只会更难过；改 VDD 改的是工作条件，不是输入电平。注意：这是调试手段，芯片在规格值上仍然算失败。', 'Relaxing VIH means raising it, and VDD is the loosest VIH; relaxing VIL means lowering it, and 0 V is the loosest. The chip already passed gross functional, so it should pass once relaxed, confirming the problem is the input threshold. Lowering VIH only makes it harder; changing VDD changes the operating condition, not the input level. Note: this is a troubleshooting aid; the chip still fails at the spec value.'),
  },
  {
    id: 'b7',
    prompt: loc('功能化测 VOL/IOL、VOH/IOH：比较器设为规格的 VOL / VOH，动态（或电阻）负载提供 IOL / IOH。测试通过，就说明这四个参数都满足规格。', 'Functional VOL/IOL, VOH/IOH: the comparators are set to spec VOL / VOH and a dynamic (or resistive) load supplies IOL / IOH. If the test passes, all four parameters meet spec.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('负载让输出在跑向量时真的吸 / 吐 IOL、IOH，比较器同时检查电压不越过 VOL / VOH。两者同时成立，四个参数就都被验证了，而且比 PMU 逐脚量快得多。', 'The load makes the output really sink / source IOL and IOH while the vectors run, and the comparators check that the voltage stays within VOL / VOH. With both true, all four parameters are verified, much faster than measuring pin by pin with the PMU.'),
  },
  {
    id: 'b8',
    prompt: loc('调试时功能化 VOL/IOL、VOH/IOH 测试失败，可能需要加长测试周期（降低频率）再跑，来确认 VOL、VOH 本身是否正常。', 'When a functional VOL/IOL, VOH/IOH test fails during troubleshooting, you may need to lengthen the test cycle (lower the frequency) and rerun to confirm whether VOL and VOH themselves are fine.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('输出带满负载时翻转变慢；很多输出同时带大电流翻转还会产生噪声。降低频率、把 Strobe 往后挪，给输出足够时间稳定，就能区分“电平不够”和“来不及”。也可以分批给少量管脚加负载。', 'Fully loaded outputs switch more slowly, and many outputs switching large currents at once create noise. Lowering the frequency and moving the strobe later gives the outputs time to settle, separating "level too weak" from "not enough time". You can also load a few pins at a time.'),
  },
  {
    id: 'b9',
    prompt: loc('功能化测高阻（Z）时，要用负载把引脚拉到一个中间电平，让比较器判断。合适的中间电平是？（VOL = 0.4 V，VOH = 2.4 V）', 'When testing high-Z functionally, the load pulls the pin to a mid level for the comparators to judge. Which mid level is suitable? (VOL = 0.4 V, VOH = 2.4 V)'),
    options: [
      { id: 'a', text: loc('5.0 V', '5.0 V') },
      { id: 'b', text: loc('2.0 V', '2.0 V') },
      { id: 'c', text: loc('3.0 V', '3.0 V') },
      { id: 'd', text: loc('0.4 V', '0.4 V') },
      { id: 'e', text: loc('以上都对', 'All of the above') },
    ],
    answer: 'b',
    explain: loc('高阻的判据是电压在 VOL 和 VOH 之间，所以 VREF 必须落在 0.4–2.4 V 中间，常用 1.5 V 或 2.0 V。5.0 V、3.0 V 高于 VOH 会被判成 H；0.4 V 等于 VOL 会被判成 L。', 'High-Z is judged by the voltage being between VOL and VOH, so VREF must fall inside 0.4–2.4 V; 1.5 V or 2.0 V are common. 5.0 V and 3.0 V are above VOH and read as H; 0.4 V equals VOL and reads as L.'),
  },
  {
    id: 'b10',
    prompt: loc('做粗功能测试（Gross functional）的目的是？', 'What is the purpose of the gross functional test?'),
    options: [
      { id: 'a', text: loc('在最严的条件下证明芯片满足全部规格', 'Prove the chip meets every spec under the tightest conditions') },
      { id: 'b', text: loc('用放松的条件确认芯片功能“活着”，并验证整套向量（包括预处理向量）能正确运行', 'Confirm under relaxed conditions that the chip is functionally "alive", and verify the whole vector set (including preconditioning vectors) runs correctly') },
      { id: 'c', text: loc('测出芯片的最高频率', 'Measure the chip\'s maximum frequency') },
      { id: 'd', text: loc('代替开短路测试', 'Replace the opens/shorts test') },
    ],
    answer: 'b',
    explain: loc('粗功能放松频率、时序、电平和负载，给芯片最好的机会通过。它放在 DC 之前，确认后面 DC 测试要用的预处理向量都能跑对；量产中它也提供有用的良率信息。', 'Gross functional relaxes frequency, timing, levels and load to give the chip the best chance to pass. It runs before DC to confirm the preconditioning vectors used by later DC tests run correctly; in production it also provides useful yield information.'),
  },
  {
    id: 'b11',
    prompt: loc('基于公式的时序（Equation based timing）有什么好处？', 'What is the benefit of equation-based timing?'),
    options: [
      { id: 'a', text: loc('改一个变量（如 SCALE），整套时序按比例收紧或放松，边沿相对位置不变', 'Change one variable (e.g. SCALE) and the whole timing set tightens or loosens proportionally, keeping relative edge positions') },
      { id: 'b', text: loc('让测试机跑得更快', 'Makes the tester run faster') },
      { id: 'c', text: loc('不需要看规格书', 'No need to read the datasheet') },
      { id: 'd', text: loc('能自动修正芯片的时序错误', 'Automatically fixes the chip\'s timing errors') },
    ],
    answer: 'a',
    explain: loc('把每个边沿写成“规格值 × SCALE”。SCALE = 1 就是规格时序；调大就是粗功能的慢时序。不同测试、不同速度等级只需改一个数，调试也方便。', 'Write every edge as "spec value × SCALE". SCALE = 1 gives spec timing; a larger value gives the slow timing for gross functional. Different tests and speed grades only need one number changed, and troubleshooting is easy.'),
  },
  {
    id: 'b12',
    prompt: loc('开漏（Open drain）输出不能做什么？（选最完整的答案）', 'What can an open-drain output NOT do? (Choose the most complete answer)'),
    options: [
      { id: 'a', text: loc('驱动逻辑 0', 'Drive logic 0') },
      { id: 'b', text: loc('驱动逻辑 1', 'Drive logic 1') },
      { id: 'c', text: loc('向外提供电流（Source）', 'Source current') },
      { id: 'd', text: loc('B 和 C', 'B and C') },
    ],
    answer: 'd',
    explain: loc('开漏输出内部没有上拉管，只能拉低、只能吸电流。它既不能自己驱动出 1，也不能往外供电流；高电平必须靠外部上拉电阻或动态负载。', 'An open-drain output has no internal pull-up transistor; it can only pull low and sink current. It can neither drive a 1 by itself nor source current; the high level must come from an external pull-up resistor or dynamic load.'),
  },
  {
    id: 'b13',
    prompt: loc('“输入控制信号是 RO 格式”，RO 是什么意思？', '"The input control signal uses RO format." What does RO mean?'),
    options: [
      { id: 'a', text: loc('Return to One（归一）：平时为 1，数据为 0 时在边沿 1 到边沿 2 之间出一个低脉冲', 'Return to One: normally 1; when data is 0, a low pulse from edge 1 to edge 2') },
      { id: 'b', text: loc('Read Only：只读', 'Read Only') },
      { id: 'c', text: loc('Return to Zero：数据为 1 时出一个高脉冲', 'Return to Zero: a high pulse when data is 1') },
      { id: 'd', text: loc('数据只在 T0 变化', 'Data changes only at T0') },
    ],
    answer: 'a',
    explain: loc('RO = Return to One。数据为 1 时整拍保持 1，没有脉冲；数据为 0 时出一个负脉冲。适合低有效的控制信号，例如 OE、CS1。C 是 RZ，D 是 NRZ。', 'RO = Return to One. When data is 1 the whole cycle stays 1 with no pulse; when data is 0 there is a negative pulse. Suits active-low control signals such as OE and CS1. C is RZ, D is NRZ.'),
  },
  {
    id: 'b14',
    prompt: loc('要一次跑向量就同时保证 Setup 和 Hold 时间，必须用哪种信号格式？', 'To guarantee both setup and hold time in a single vector run, which signal format must you use?'),
    options: [
      { id: 'a', text: loc('NRZ', 'NRZ') },
      { id: 'b', text: loc('RZ', 'RZ') },
      { id: 'c', text: loc('SBC（补码包围）', 'SBC (surround by complement)') },
      { id: 'd', text: loc('DNRZ', 'DNRZ') },
    ],
    answer: 'c',
    explain: loc('SBC 在数据前后都是数据的反码：边沿 1 前是反码（考 Setup），边沿 2 后又回到反码（考 Hold）。不管数据是 0 还是 1，每拍都有翻转，所以它是唯一能一次同时保证两者的格式。不支持 SBC 的测试机，可以用 RZ 跑一遍（考数据为 1 的拍）、RO 再跑一遍（考数据为 0 的拍）。', 'SBC drives the complement of the data both before and after it: complement before edge 1 (tests setup), back to complement after edge 2 (tests hold). Every cycle toggles whether the data is 0 or 1, so it is the only format that guarantees both in one pass. On a tester without SBC, run once with RZ (tests the cycles with data 1) and again with RO (tests the cycles with data 0).'),
  },
  {
    id: 'b15',
    prompt: loc('数据只在 T0 变化的信号格式叫什么？', 'What is the signal format in which data changes only at T0?'),
    options: [
      { id: 'a', text: loc('DNRZ', 'DNRZ') },
      { id: 'b', text: loc('RZ', 'RZ') },
      { id: 'c', text: loc('RO', 'RO') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'd',
    explain: loc('答案是 NRZ（不归零）：数据在周期起点 T0 变化，整拍保持。DNRZ 是把变化时刻推迟到 T0 之后的某个边沿；RZ、RO 是脉冲格式。', 'The answer is NRZ (non-return to zero): data changes at the cycle start T0 and holds for the whole cycle. DNRZ delays the change to an edge after T0; RZ and RO are pulse formats.'),
  },
  {
    id: 'b16',
    prompt: loc('SBC（XOR）格式下，数据为 0 时这一拍的波形是？', 'In SBC (XOR) format, what is the waveform of a cycle with data 0?'),
    options: [
      { id: 'a', text: loc('整拍为 0', '0 for the whole cycle') },
      { id: 'b', text: loc('T0 到边沿 1 为 1，边沿 1 到边沿 2 为 0，边沿 2 到周期结束为 1', '1 from T0 to edge 1, 0 from edge 1 to edge 2, 1 from edge 2 to the end of the cycle') },
      { id: 'c', text: loc('T0 到边沿 1 为 0，边沿 1 到边沿 2 为 1，之后为 0', '0 from T0 to edge 1, 1 from edge 1 to edge 2, then 0') },
      { id: 'd', text: loc('整拍为高阻', 'High-Z for the whole cycle') },
    ],
    answer: 'b',
    explain: loc('SBC：周期开始先输出数据的反码（1），等到边沿 1 才给出真正的数据（0），边沿 2 之后又回到反码（1）。形状就是一个低脉冲。C 是数据为 1 时的 SBC 波形。可以在上面“信号格式”区块选 SBC、把某一位设成 0 看看。', 'SBC: the cycle starts with the complement of the data (1), the true data (0) appears only at edge 1, and after edge 2 it returns to the complement (1). The shape is a low pulse. C is the SBC waveform for data 1. Try it in the "Signal format" section above: pick SBC and set a bit to 0.'),
  },
  {
    id: 'b17',
    prompt: loc('哪种信号格式在高阻和驱动之间切换（控制驱动器的开关）？', 'Which signal format switches between high-Z and driving (turning the driver on and off)?'),
    options: [
      { id: 'a', text: loc('ZD（Z 窗口驱动，也叫 Drive / Inhibit）', 'ZD (Z-window drive, also called drive / inhibit)') },
      { id: 'b', text: loc('NRZ', 'NRZ') },
      { id: 'c', text: loc('SBC', 'SBC') },
      { id: 'd', text: loc('RO', 'RO') },
    ],
    answer: 'a',
    explain: loc('ZD 只在边沿 1 到边沿 2 之间打开驱动器、驱动数据，其余时间驱动器关断，测试机通道呈高阻。用于双向管脚：不驱动时把总线让给芯片。', 'ZD turns the driver on and drives data only from edge 1 to edge 2; the rest of the time the driver is off and the tester channel is high-Z. Used on bidirectional pins to hand the bus to the chip when not driving.'),
  },
  {
    id: 'b18',
    prompt: loc('已知工作频率，怎么算测试周期？', 'Given the operating frequency, how do you calculate the test cycle?'),
    options: [
      { id: 'a', text: loc('周期 = 1 / 频率', 'Period = 1 / frequency') },
      { id: 'b', text: loc('周期 = 频率 × 2', 'Period = frequency × 2') },
      { id: 'c', text: loc('周期 = 1 / (2 × 频率)', 'Period = 1 / (2 × frequency)') },
      { id: 'd', text: loc('周期 = 频率 / 1000', 'Period = frequency / 1000') },
    ],
    answer: 'a',
    explain: loc('cycle_time = 1 / frequency。10 MHz → 100 ns；66 MHz → 约 15 ns。', 'cycle_time = 1 / frequency. 10 MHz → 100 ns; 66 MHz → about 15 ns.'),
  },
  {
    id: 'b19',
    prompt: loc('功能化开短路比 DC（PMU）开短路好在哪？', 'What is the advantage of functional opens/shorts over DC (PMU) opens/shorts?'),
    options: [
      { id: 'a', text: loc('速度快得多', 'Much faster') },
      { id: 'b', text: loc('Datalog 能看到每只脚的电压', 'The datalog shows each pin\'s voltage') },
      { id: 'c', text: loc('不需要任何负载', 'No load needed') },
      { id: 'd', text: loc('能测出电源脚的电流', 'Measures power pin current') },
    ],
    answer: 'a',
    explain: loc('功能化方法用向量逐拍扫过所有管脚，比 PMU 逐脚强加电流、等稳定、再量电压快得多。代价是 Datalog 只有 Pass / Fail，不如电压读数直观，所以常在失败时再补跑一次 PMU 法。', 'The functional method sweeps all pins cycle by cycle with vectors, much faster than forcing current pin by pin with the PMU, waiting to settle and measuring voltage. The cost is a Pass / Fail-only datalog, less informative than voltage readings, so the PMU method is often rerun on failure.'),
  },
  {
    id: 'b20',
    prompt: loc('功能化开短路测试中，电流由什么强加？', 'In a functional opens/shorts test, what forces the current?'),
    options: [
      { id: 'a', text: loc('PMU', 'PMU') },
      { id: 'b', text: loc('可编程（动态）电流负载', 'Programmable (dynamic) current load') },
      { id: 'c', text: loc('强加的是电压，不是电流', 'A voltage is forced, not a current') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('被测脚的驱动器关断后，动态电流负载从 VREF = 3 V 往引脚灌约 400 µA，让对 VDD 的保护二极管正偏。PMU 不参与，这也是它快的原因。', 'With the driver of the pin under test turned off, the dynamic current load forces about 400 µA into the pin from VREF = 3 V, forward-biasing the protection diode to VDD. The PMU is not involved, which is why it is fast.'),
  },
  {
    id: 'b21',
    prompt: loc('功能化开短路测试用 Pin Electronics 里的比较器来判断开路 / 短路。', 'Functional opens/shorts uses the comparators in the pin electronics to detect opens / shorts.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'a',
    explain: loc('比较器设成中间带（Z 模式）：VOL = 0.2 V、VOH = 1.5 V。正常二极管约 0.65 V，落在中间判 Pass；短路约 0 V 低于 VOL，开路被拉到 3 V 高于 VOH，都判 Fail。', 'The comparators are set to a mid band (Z mode): VOL = 0.2 V, VOH = 1.5 V. A good diode is about 0.65 V, inside the band, so Pass; a short is about 0 V, below VOL, and an open is pulled to 3 V, above VOH, so both Fail.'),
  },
]
