import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const WHY: LText[] = [
  loc('测试工程师拿到一颗新芯片，第一件事不是写程序，而是读规格。规格告诉你：这颗芯片承诺了什么，在什么条件下承诺。', 'When a test engineer gets a new chip, the first job is not writing a program but reading the specification. The spec tells you what the chip promises, and under what conditions.'),
  loc('没有规格，Pass / Fail 就没有依据。“输出高电平够不够高”这句话，只有写成“VDD = 4.75 V、拉 5.2 mA 时 VOH ≥ 2.4 V”才能测。', 'Without a spec, Pass / Fail has no basis. "Is the output high level high enough?" can only be tested once it is written as "VOH ≥ 2.4 V at VDD = 4.75 V, sourcing 5.2 mA".'),
]

export const KINDS: Card[] = [
  {
    id: 'design',
    title: loc('设计规格', 'Design Spec'),
    sub: loc('Design Spec · 写给设计', 'Design Spec · for designers'),
    text: loc('芯片要做成什么样：功能、引脚、性能目标。先于电路存在，开发过程中会改。', 'What the chip should be: functions, pins, performance targets. It exists before the circuit and changes during development.'),
    explain: [
      loc('设计规格是“我们打算做什么”。它驱动电路设计和仿真，里面的数字往往是目标值，不一定都是最终对外承诺的值。', 'The design spec is "what we plan to build". It drives circuit design and simulation; its numbers are often targets, not necessarily the final values promised to customers.'),
      loc('测试工程师读它，是为了早点知道芯片有哪些模式、有没有 DFT（Scan、BIST、JTAG），提前规划测试方案。', 'Test engineers read it to learn early which modes the chip has and whether it has DFT (Scan, BIST, JTAG), so they can plan the test strategy ahead of time.'),
    ],
  },
  {
    id: 'test',
    title: loc('测试规格', 'Test Spec'),
    sub: loc('Test Spec · 写给测试', 'Test Spec · for test'),
    text: loc('每一项怎么测：条件、极限、顺序。是测试程序的直接依据。', 'How each item is tested: conditions, limits, order. It is the direct basis of the test program.'),
    explain: [
      loc('测试规格把数据手册里的每一行变成可执行的测试：施加什么电压电流、用哪组向量预处理、在什么时刻比较、极限是多少。', 'The test spec turns each line of the data sheet into an executable test: what voltage or current to apply, which vectors to precondition with, when to compare, and what the limits are.'),
      loc('它的极限通常比数据手册更紧一点（Guardband），给测试机误差和温度漂移留余量，保证出货的芯片在客户手里一定满足手册。', 'Its limits are usually a bit tighter than the data sheet (guardband), leaving margin for tester error and temperature drift, so shipped chips are sure to meet the data sheet in the customer\'s hands.'),
    ],
  },
  {
    id: 'device',
    title: loc('器件规格 / 数据手册', 'Device Spec / Data Sheet'),
    sub: loc('Data Sheet · 写给客户', 'Data Sheet · for customers'),
    text: loc('对外的承诺。客户照它设计系统，出货芯片必须满足它——相当于买卖合同。', 'The external promise. Customers design their systems from it, and every shipped chip must meet it - it is effectively a sales contract.'),
    explain: [
      loc('客户不会看你的设计文件，只看数据手册。他按手册里的 VOH、tAA 去设计电路板，如果芯片达不到，就是违约。', 'Customers never see your design files, only the data sheet. They design their boards around its VOH and tAA; if the chip falls short, that is a breach of contract.'),
      loc('所以量产测试的核心任务只有一句：证明每一颗出货的芯片都满足数据手册。', 'So the core task of production test fits in one sentence: prove that every shipped chip meets the data sheet.'),
    ],
  },
]

export const WORDS: Card[] = [
  {
    id: 'pre',
    title: loc('预处理', 'Preconditioning'),
    sub: loc('Preconditioning', 'Preconditioning'),
    text: loc('测量之前，先把芯片放进一个确定的状态。', 'Before measuring, put the chip into a known state.'),
    explain: [
      loc('例：测 VOH 之前，先跑一段向量让某个输出变成高电平，停在那里，再用 PMU 去量。', 'Example: before measuring VOH, run some vectors to drive an output high, stop there, then measure it with the PMU.'),
      loc('预处理没做对，量到的就不是你想量的东西——比如输出其实是低，VOH 必然 Fail，但芯片未必坏。', 'If preconditioning is wrong, you are not measuring what you think - e.g. if the output is actually low, VOH is bound to fail, yet the chip may be fine.'),
    ],
  },
  {
    id: 'static',
    title: loc('静态', 'Static'),
    sub: loc('Static', 'Static'),
    text: loc('测量时芯片不翻转：输入固定，等电压电流稳定后再读。', 'The chip does not switch during the measurement: inputs are held fixed, and you read after voltage and current settle.'),
    explain: [loc('大部分 DC 测试是静态的：VOH/VOL、IIL/IIH、IOZ、静态 IDD。芯片停在某个向量上，PMU 慢慢量。', 'Most DC tests are static: VOH/VOL, IIL/IIH, IOZ, static IDD. The chip stops on a vector and the PMU measures at leisure.')],
  },
  {
    id: 'dynamic',
    title: loc('动态', 'Dynamic'),
    sub: loc('Dynamic', 'Dynamic'),
    text: loc('测量时芯片正在按某个频率运行。', 'The chip is running at some frequency during the measurement.'),
    explain: [
      loc('动态 IDD：在 fMAX 下循环跑向量，同时量电源平均电流。功能测试和 AC 测试本身也都是动态的。', 'Dynamic IDD: loop vectors at fMAX while measuring the average supply current. Functional and AC tests are dynamic by nature too.'),
    ],
  },
]

export const CONDS: Array<{ kind: LText; cond: LText; limit: LText }> = [
  {
    kind: loc('DC 测试', 'DC tests'),
    cond: loc('VDD、输入电平、PMU 强加的电流或电压、温度', 'VDD, input levels, current or voltage forced by the PMU, temperature'),
    limit: loc('电压或电流的上下限，例如 VOH ≥ 2.4 V、IIH ≤ 10 µA', 'Voltage or current limits, e.g. VOH ≥ 2.4 V, IIH ≤ 10 µA'),
  },
  {
    kind: loc('功能测试', 'Functional tests'),
    cond: loc('VDD、VIL/VIH、比较电平 VOL/VOH、负载、周期与边沿、向量', 'VDD, VIL/VIH, compare levels VOL/VOH, load, period and edges, vectors'),
    limit: loc('每一拍输出是否等于期望：全对 Pass，任何一拍错就 Fail', 'Whether every cycle\'s output matches the expected value: all correct is Pass, any mismatch is Fail'),
  },
  {
    kind: loc('AC 测试', 'AC tests'),
    cond: loc('同功能测试，再加上被测边沿的位置', 'Same as functional, plus the position of the edge under test'),
    limit: loc('时间的上下限，例如 tAA ≤ 15 ns、tSD ≥ 11 ns', 'Time limits, e.g. tAA ≤ 15 ns, tSD ≥ 11 ns'),
  },
]

export type Grade = 'com' | 'mil'

export const GRADES: Record<Grade, { name: LText; tMin: number; tMax: number; vMin: number; vMax: number; tol: string; idd: number }> = {
  com: { name: loc('商业级', 'Commercial'), tMin: 0, tMax: 70, vMin: 4.75, vMax: 5.25, tol: '±5%', idd: 120 },
  mil: { name: loc('军用级', 'Military'), tMin: -55, tMax: 125, vMin: 4.5, vMax: 5.5, tol: '±10%', idd: 150 },
}

export type SheetTab = 'abs' | 'op' | 'dc' | 'logic' | 'read' | 'write'

export const SHEET_TABS: Array<{ id: SheetTab; label: LText }> = [
  { id: 'abs', label: loc('极限额定值', 'Abs. Max') },
  { id: 'op', label: loc('工作范围', 'Operating') },
  { id: 'dc', label: loc('DC 特性', 'DC') },
  { id: 'logic', label: loc('逻辑功能', 'Truth Table') },
  { id: 'read', label: loc('读时序', 'Read Timing') },
  { id: 'write', label: loc('写时序', 'Write Timing') },
]

export type SheetRow = {
  id: string
  cells: (g: (typeof GRADES)[Grade]) => Array<LText | string>
  explain: LText[]
}

export const SHEET_HEAD: Record<SheetTab, LText[]> = {
  abs: [loc('项目', 'Item'), loc('额定值', 'Rating'), loc('说明', 'Note')],
  op: [loc('项目', 'Item'), loc('最小', 'Min'), loc('最大', 'Max')],
  dc: [loc('符号', 'Symbol'), loc('条件', 'Conditions'), loc('最小', 'Min'), loc('最大', 'Max')],
  logic: [loc('CS1', 'CS1'), loc('CS2', 'CS2'), loc('WE', 'WE'), loc('OE', 'OE'), loc('模式', 'Mode'), loc('数据脚', 'Data pins')],
  read: [loc('符号', 'Symbol'), loc('含义', 'Parameter'), loc('最小 ns', 'Min ns'), loc('最大 ns', 'Max ns')],
  write: [loc('符号', 'Symbol'), loc('含义', 'Parameter'), loc('最小 ns', 'Min ns'), loc('最大 ns', 'Max ns')],
}

const ABS_NOTE = loc('超过就可能永久损坏。它不是工作条件，也不是测试项——测试时任何时刻都不能超过它。', 'Exceeding it may cause permanent damage. It is neither an operating condition nor a test item - it must never be exceeded at any moment during test.')

export const SHEET: Record<SheetTab, SheetRow[]> = {
  abs: [
    {
      id: 'tstg',
      cells: () => [loc('存储温度', 'Storage temperature'), '−55 ~ 125 °C', loc('不通电', 'Unpowered')],
      explain: [ABS_NOTE, loc('存储温度只说不通电时能放在哪，不代表能在这个温度下工作。', 'Storage temperature only says where the part can sit unpowered; it does not mean the part can operate at that temperature.')],
    },
    {
      id: 'tbias',
      cells: () => [loc('通电时环境温度', 'Ambient temperature with power applied'), '−55 ~ 125 °C', loc('通电', 'Powered')],
      explain: [
        ABS_NOTE,
        loc('通电后芯片能承受的环境温度。它比工作范围宽：在这里芯片不会坏，但不保证功能和参数合格。', 'The ambient temperature the chip survives while powered. It is wider than the operating range: the chip will not be damaged, but function and parameters are not guaranteed.'),
      ],
    },
    {
      id: 'vdd',
      cells: () => [loc('电源对地（VDD 脚对 VSS 脚）', 'Supply to ground (VDD pins to VSS pins)'), '−0.5 ~ 7.0 V', loc('注 1', 'Note 1')],
      explain: [ABS_NOTE, loc('测试中最容易越界的是热切换和 IOS 测试：瞬间电压冲击可能超过额定值，见 {@fDc}。', 'The likeliest violations during test come from hot switching and IOS tests: momentary voltage spikes can exceed the rating; see {@fDc}.')],
    },
    {
      id: 'vin',
      cells: () => [loc('DC 输入电压', 'DC input voltage'), '−0.5 ~ 7.0 V', loc('注 1', 'Note 1')],
      explain: [
        ABS_NOTE,
        loc('注 1：脉宽小于 20 ns 时，输入最低允许到 −3.0 V。', 'Note 1: for pulses shorter than 20 ns, inputs may go as low as −3.0 V.'),
        loc('输入比 VDD 高、或比地低超过一个二极管压降，保护二极管就会导通，严重时触发 Latch-up（{@latch}）。', 'If an input goes more than one diode drop above VDD or below ground, the protection diode turns on; in severe cases it triggers latch-up ({@latch}).'),
      ],
    },
    {
      id: 'vz',
      cells: () => [loc('高阻态输出脚上的 DC 电压', 'DC voltage on outputs in high-Z'), '−0.5 ~ 7.0 V', loc('注 1', 'Note 1')],
      explain: [ABS_NOTE, loc('IOZ 测试会往高阻输出上强加 0 V 和 VDD，都在这个范围里。', 'The IOZ test forces 0 V and VDD on high-Z outputs; both are inside this range.')],
    },
    {
      id: 'iol',
      cells: () => [loc('灌入输出脚的电流（低电平）', 'Output current into outputs (low)'), '20 mA', '—'],
      explain: [ABS_NOTE, loc('VOL 测试只灌 8 mA，离 20 mA 还远。IOS 短路测试电流可能更大，所以要短时间、一次一个脚。', 'The VOL test sinks only 8 mA, well below 20 mA. IOS short-circuit current can be larger, so it is applied briefly, one pin at a time.')],
    },
    {
      id: 'latch',
      cells: () => [loc('闩锁电流', 'Latch-up current'), '200 mA', '—'],
      explain: [ABS_NOTE, loc('往管脚注入不超过 200 mA 时不应触发 Latch-up。测法见 {@fLatch}。', 'Injecting up to 200 mA into a pin must not trigger latch-up. The test method is in {@fLatch}.')],
    },
  ],
  op: [
    {
      id: 'temp',
      cells: (g) => ['TA', `${g.tMin} °C`, `${g.tMax} °C`],
      explain: [
        loc('工作温度范围。商业级 0–70 °C，军用级 −55–125 °C。', 'Operating temperature range. Commercial 0–70 °C, military −55–125 °C.'),
        loc('量产时通常在一两个温度点测（常温 + 高温），极限温度的性能靠表征和 Guardband 保证。', 'Production usually tests at one or two temperatures (room + hot); performance at the temperature extremes is guaranteed by characterization and guardband.'),
      ],
    },
    {
      id: 'vdd',
      cells: (g) => [`VDD (5 V ${g.tol})`, `${g.vMin} V`, `${g.vMax} V`],
      explain: [
        loc('5 V ± 5% → 4.75 V 到 5.25 V；± 10% → 4.5 V 到 5.5 V。', '5 V ± 5% → 4.75 V to 5.25 V; ± 10% → 4.5 V to 5.5 V.'),
        loc('这两个端点就是后面所有条件里的 VDDmin 和 VDDmax。哪项在哪端测，取决于哪端更难过（最坏情况）。', 'These two endpoints are the VDDmin and VDDmax used in every condition below. Which end a test uses depends on which end is harder to pass (worst case).'),
      ],
    },
  ],
  dc: [
    {
      id: 'voh',
      cells: (g) => ['VOH', `VDD = ${g.vMin} V, IOH = −5.2 mA`, '2.4 V', '—'],
      explain: [
        loc('输出高电平：芯片向外“吐” 5.2 mA 电流时，输出电压不能低于 2.4 V。', 'Output high voltage: while the chip sources 5.2 mA, the output must not drop below 2.4 V.'),
        loc('为什么在 VDDmin 测？电源越低，上拉管越弱，输出越难拉高，这是最坏情况。IOH 写成负数，表示电流流出芯片。', 'Why test at VDDmin? The lower the supply, the weaker the pull-up transistor and the harder it is to pull the output high - the worst case. IOH is negative, meaning current flows out of the chip.'),
      ],
    },
    {
      id: 'vol',
      cells: (g) => ['VOL', `VDD = ${g.vMin} V, IOL = 8 mA`, '—', '0.4 V'],
      explain: [
        loc('输出低电平：芯片“吸” 8 mA 电流时，输出电压不能高于 0.4 V。', 'Output low voltage: while the chip sinks 8 mA, the output must not rise above 0.4 V.'),
        loc('同样在 VDDmin 测：栅压低，下拉管导通电阻大，压降最大。', 'Also tested at VDDmin: with low gate voltage, the pull-down transistor has its highest on-resistance and the largest voltage drop.'),
      ],
    },
    {
      id: 'vih',
      cells: () => ['VIH', loc('保证识别为 1', 'Guaranteed as 1'), '2.2 V', 'VDD'],
      explain: [
        loc('输入高电平门槛：只要输入 ≥ 2.2 V，芯片必须当成 1。', 'Input high threshold: any input ≥ 2.2 V must be recognized as 1.'),
        loc('不是用 PMU 量的。做法是把 Tester 的驱动高电平设成 2.2 V 跑功能向量，全对就 Pass（{@fFunc}）。', 'It is not measured with the PMU. Instead, set the tester\'s drive-high level to 2.2 V and run functional vectors; if all pass, it is a Pass ({@fFunc}).'),
      ],
    },
    {
      id: 'vil',
      cells: () => ['VIL', loc('保证识别为 0', 'Guaranteed as 0'), '0.0 V', '0.8 V'],
      explain: [
        loc('输入低电平门槛：只要输入 ≤ 0.8 V，芯片必须当成 0。同样靠功能测试验证。', 'Input low threshold: any input ≤ 0.8 V must be recognized as 0. Also verified by functional test.'),
        loc('最小值 0.0 V；脉宽小于 20 ns 的下冲允许到 −3.0 V。', 'The minimum is 0.0 V; undershoot shorter than 20 ns may reach −3.0 V.'),
      ],
    },
    {
      id: 'iil',
      cells: (g) => ['IIL / IIH', `VDD = ${g.vMax} V, VIN = 0 V / VDD`, '−10 µA', '10 µA'],
      explain: [
        loc('输入漏电流：把输入拉到 0 V 量 IIL，拉到 VDD 量 IIH，绝对值都不能超过 10 µA。', 'Input leakage: force the input to 0 V to measure IIL and to VDD to measure IIH; neither magnitude may exceed 10 µA.'),
        loc('在 VDDmax 测：电压越高，漏电越大。CMOS 输入理想上是电容，正常漏电只有 nA 级。', 'Tested at VDDmax: higher voltage means more leakage. A CMOS input is ideally a capacitor; normal leakage is only nA-level.'),
      ],
    },
    {
      id: 'ioz',
      cells: (g) => ['IOZ', loc(`VDD = ${g.vMax} V，输出禁止，VOUT = 0 / VDD`, `VDD = ${g.vMax} V, output disabled, VOUT = 0 / VDD`), '−10 µA', '10 µA'],
      explain: [
        loc('三态输出关断后的漏电流。先预处理：让 OE = 1 或片选无效，输出进入高阻，再量。', 'Leakage of a tri-state output when turned off. Precondition first: set OE = 1 or deselect the chip so the output goes high-Z, then measure.'),
        loc('高阻脚应该像断开一样；漏得多，会拖累同一条总线上的其他芯片。', 'A high-Z pin should look like an open circuit; excessive leakage drags down other chips on the same bus.'),
      ],
    },
    {
      id: 'idd',
      cells: (g) => ['IDD', loc(`VDD = ${g.vMax} V，f = fMAX，输出开路`, `VDD = ${g.vMax} V, f = fMAX, outputs open`), '—', `${g.idd} mA`],
      explain: [
        loc('电源电流。条件是最坏的：电压最高、频率最高。输出开路是为了不把负载电流算进来。', 'Supply current. Conditions are worst case: highest voltage, highest frequency. Outputs are left open so load current is not counted.'),
        loc('商业级 120 mA，军用级 150 mA——更宽的温度范围换来更松的极限。', 'Commercial 120 mA, military 150 mA - a wider temperature range earns a looser limit.'),
      ],
    },
    {
      id: 'cap',
      cells: () => ['CIN / COUT', loc('TA = 25 °C，f = 1 MHz，VDD = 5.0 V', 'TA = 25 °C, f = 1 MHz, VDD = 5.0 V'), '—', '8 pF'],
      explain: [
        loc('输入 / 输出电容最大 8 pF，但量产不测。手册注明：首次测一次，以后只在设计或工艺变更时重测。', 'Input / output capacitance is at most 8 pF, but it is not tested in production. The data sheet notes it is tested initially and again only after a design or process change.'),
        loc('这一点很重要：手册上的项不一定都进测试程序。测试规格会写明哪些项“由设计保证”。', 'This matters: not every data sheet item goes into the test program. The test spec states which items are "guaranteed by design".'),
      ],
    },
  ],
  logic: [
    {
      id: 'des1',
      cells: () => ['1', 'X', 'X', 'X', loc('未选中', 'Deselected'), loc('高阻', 'High-Z')],
      explain: [loc('CS1 低有效。CS1 = 1 时芯片没被选中，数据脚高阻、功耗最低。X 表示“这一位是什么都行”。', 'CS1 is active low. With CS1 = 1 the chip is deselected: data pins are high-Z and power is lowest. X means "this bit can be anything".')],
    },
    {
      id: 'des2',
      cells: () => ['X', '0', 'X', 'X', loc('未选中', 'Deselected'), loc('高阻', 'High-Z')],
      explain: [loc('CS2 高有效。两个片选必须同时有效（CS1 = 0 且 CS2 = 1）芯片才工作。', 'CS2 is active high. Both chip selects must be active at once (CS1 = 0 and CS2 = 1) for the chip to operate.')],
    },
    {
      id: 'odis',
      cells: () => ['0', '1', '1', '1', loc('输出禁止', 'Output disabled'), loc('高阻', 'High-Z')],
      explain: [loc('选中了，但既不写（WE = 1）也不读（OE = 1），输出仍是高阻。IOZ 就是在这种状态下测的。', 'Selected, but neither writing (WE = 1) nor reading (OE = 1), so the output stays high-Z. IOZ is measured in this state.')],
    },
    {
      id: 'read',
      cells: () => ['0', '1', '1', '0', loc('读', 'Read'), loc('输出数据', 'Data out')],
      explain: [loc('OE = 0 打开输出驱动，地址所指的 4 位数据出现在数据脚上。VOH / VOL 也要先停在这个状态。', 'OE = 0 enables the output drivers, and the 4-bit word at the address appears on the data pins. VOH / VOL tests must also stop in this state first.')],
    },
    {
      id: 'write',
      cells: () => ['0', '1', '0', 'X', loc('写', 'Write'), loc('输入数据', 'Data in')],
      explain: [loc('WE = 0 时数据脚变成输入，数据被写进地址所指的单元。写的时候 OE 无关，输出会被强制关断。', 'With WE = 0 the data pins become inputs and the data is written into the addressed cell. During a write OE does not matter; the outputs are forced off.')],
    },
  ],
  read: [
    rowT('tRC', loc('读周期', 'Read cycle time'), '15', '—', loc('连续两次读之间的最短时间。它决定了读的最高频率：1 / 15 ns ≈ 66.7 MHz。', 'Minimum time between two consecutive reads. It sets the maximum read frequency: 1 / 15 ns ≈ 66.7 MHz.')),
    rowT('tAA', loc('地址到数据有效', 'Address access time'), '—', '15', loc('地址变化后，最慢 15 ns 新数据必须出现。测法：地址在 T0 变，Strobe 放在 T0 + 15 ns。', 'After the address changes, new data must appear within 15 ns. Test: change the address at T0 and place the strobe at T0 + 15 ns.')),
    rowT('tACS', loc('片选到数据有效', 'Chip select access'), '—', '10', loc('片选有效后最慢 10 ns 出数据。', 'Data must appear within 10 ns after chip select goes active.')),
    rowT('tDOE', loc('OE 到数据有效', 'OE access time'), '—', '10', loc('OE 下降后最慢 10 ns 出数据。OE 控制的读时序就靠它（{@fAc}）。', 'Data must appear within 10 ns after OE falls. OE-controlled read timing relies on it ({@fAc}).')),
    rowT('tHZCS', loc('片选无效到高阻', 'CS inactive to high-Z'), '—', '8', loc('取消片选后，输出最慢 8 ns 进入高阻。测法：用带 VREF 的负载，在 Strobe 时看引脚是否落在 VOL 与 VOH 之间。', 'After deselect, the output must be high-Z within 8 ns. Test: use a load with VREF and check at the strobe whether the pin sits between VOL and VOH.')),
    rowT('tHZOE', loc('OE 无效到高阻', 'OE inactive to high-Z'), '—', '8', loc('OE 拉高后最慢 8 ns 高阻。', 'Output must be high-Z within 8 ns after OE goes high.')),
    rowT('tLZCS', loc('片选有效到低阻', 'CS active to low-Z'), '2', '—', loc('片选有效后，至少 2 ns 输出才开始驱动。是最小值：太快打开会和总线上别的器件冲突。', 'After chip select goes active, the output starts driving no sooner than 2 ns. It is a minimum: turning on too fast can fight other devices on the bus.')),
    rowT('tLZOE', loc('OE 有效到低阻', 'OE active to low-Z'), '2', '—', loc('OE 有效后至少 2 ns 才开始驱动。', 'The output starts driving no sooner than 2 ns after OE goes active.')),
  ],
  write: [
    rowT('tWC', loc('写周期', 'Write cycle time'), '15', '—', loc('两次写之间的最短时间。', 'Minimum time between two writes.')),
    rowT('tSA', loc('地址建立到 WE', 'Address setup to WE'), '2', '—', loc('地址必须比 WE 下降早至少 2 ns 稳定。', 'The address must be stable at least 2 ns before WE falls.')),
    rowT('tPWE', loc('WE 脉宽', 'WE pulse width'), '11', '—', loc('WE 低电平至少保持 11 ns。测试时给 11 ns（或更短来找余量），能写进去就 Pass。', 'WE must stay low for at least 11 ns. Test with 11 ns (or shorter to find margin); if the write succeeds, it is a Pass.')),
    rowT('tAW', loc('地址有效到写结束', 'Address valid to end of write'), '13', '—', loc('= tSA + tPWE = 2 + 11。写在 WE 上升沿结束，所以 WE 上升放在 13 ns。', '= tSA + tPWE = 2 + 11. A write ends on the WE rising edge, so WE rises at 13 ns.')),
    rowT('tSCS', loc('片选到写结束', 'CS to end of write'), '11', '—', loc('片选有效到 WE 上升至少 11 ns。', 'At least 11 ns from chip select active to WE rising.')),
    rowT('tSD', loc('数据建立到写结束', 'Data setup to end of write'), '11', '—', loc('数据必须在 WE 上升前至少 11 ns 稳定。', 'Data must be stable at least 11 ns before WE rises.')),
    rowT('tHD', loc('数据保持', 'Data hold'), '1', '—', loc('WE 上升后数据还要保持至少 1 ns。', 'Data must be held at least 1 ns after WE rises.')),
    rowT('tHA', loc('地址保持', 'Address hold'), '2', '—', loc('WE 上升后地址还要保持至少 2 ns。13 + 2 = 15 = tWC。', 'The address must be held at least 2 ns after WE rises. 13 + 2 = 15 = tWC.')),
    rowT('tHZWE', loc('WE 有效到输出高阻', 'WE active to high-Z'), '—', '8', loc('开始写时，输出最慢 8 ns 让出总线。', 'When a write starts, the output must release the bus within 8 ns.')),
    rowT('tLZWE', loc('WE 无效到输出低阻', 'WE inactive to low-Z'), '2', '—', loc('写结束后至少 2 ns 输出才重新驱动。', 'After a write ends, the output resumes driving no sooner than 2 ns.')),
  ],
}

function rowT(sym: string, name: LText, min: string, max: string, text: LText): SheetRow {
  return {
    id: sym,
    cells: () => [sym, name, min, max],
    explain: [
      text,
      min !== '—'
        ? loc('最小值型：Tester 给芯片的时间就按规格值（或更短）。芯片在这么紧的条件下还能工作，就 Pass。', 'Minimum-type: the tester gives the chip exactly the spec time (or less). If the chip still works under that tight condition, it is a Pass.')
        : loc('最大值型：Strobe 放在规格时刻。到那一刻输出已经正确，就 Pass。', 'Maximum-type: place the strobe at the spec time. If the output is already correct at that moment, it is a Pass.'),
    ],
  }
}

export const LEVELS: Array<{ name: string; vil: string; vih: string; vol: string; voh: string }> = [
  { name: 'TTL', vil: '0.8 V', vih: '2.0 V', vol: '0.4 V', voh: '2.4 V' },
  { name: 'CMOS (VDD = 5 V)', vil: '0.3 VDD = 1.5 V', vih: '0.7 VDD = 3.5 V', vol: '≈ 0.1 V', voh: '≈ VDD − 0.1 V' },
]

export const LEVEL_NOTE = loc('CMOS 输出在轻载时几乎到两条电源轨；具体数值随厂家和负载电流不同，以手册为准。TTL 的噪声容限：2.4 − 2.0 = 0.4 V，0.8 − 0.4 = 0.4 V。', 'Under light load, CMOS outputs swing almost to both supply rails; exact values vary by vendor and load current, so follow the data sheet. TTL noise margin: 2.4 − 2.0 = 0.4 V, 0.8 − 0.4 = 0.4 V.')

export const TAKEAWAY: LText[] = [
  loc('数据手册是对客户的合同；量产测试要证明每颗出货芯片都满足它。', 'The data sheet is a contract with the customer; production test must prove every shipped chip meets it.'),
  loc('每一行规格 = 测试条件（你施加什么）+ 测试极限（你判什么）。', 'Each spec line = test conditions (what you apply) + test limits (what you judge against).'),
  loc('条件挑最坏情况：输出驱动在 VDDmin 测，漏电和 IDD 在 VDDmax 测。', 'Pick worst-case conditions: output drive at VDDmin, leakage and IDD at VDDmax.'),
  loc('先核对测试机能力：频率、精度、通道数不够，有的项就只能降级测或靠表征保证。', 'Check tester capability first: if speed, accuracy or channel count falls short, some items can only be tested in reduced form or guaranteed by characterization.'),
]

export const FILL: QuizQuestion[] = [
  {
    id: 'f1',
    prompt: loc('商业级 256×4 SRAM 的 VOH，应在 VDD = ? 下测', 'For the commercial 256×4 SRAM, VOH should be tested at VDD = ?'),
    options: [
      { id: 'a', text: loc('4.75 V（VDDmin）', '4.75 V (VDDmin)') },
      { id: 'b', text: loc('5.00 V', '5.00 V') },
      { id: 'c', text: loc('5.25 V（VDDmax）', '5.25 V (VDDmax)') },
    ],
    answer: 'a',
    explain: loc('电源最低时上拉管最弱，输出最难拉高——最坏情况。', 'At the lowest supply the pull-up is weakest and the output hardest to pull high - the worst case.'),
  },
  {
    id: 'f2',
    prompt: loc('测 VOH 时，PMU 强加的电流是', 'When testing VOH, the current forced by the PMU is'),
    options: [
      { id: 'a', text: loc('IOH = −5.2 mA，从芯片流出', 'IOH = −5.2 mA, out of the chip') },
      { id: 'b', text: loc('IOL = +8 mA，流进芯片', 'IOL = +8 mA, into the chip') },
      { id: 'c', text: loc('−10 µA', '−10 µA') },
    ],
    answer: 'a',
    explain: loc('输出为高时芯片向外供电流，所以是负号的 IOH。', 'With the output high, the chip sources current, hence a negative IOH.'),
  },
  {
    id: 'f3',
    prompt: loc('VOL 的极限和条件', 'The limit and conditions for VOL'),
    options: [
      { id: 'a', text: loc('≤ 0.4 V，IOL = 8 mA，VDD = 4.75 V', '≤ 0.4 V, IOL = 8 mA, VDD = 4.75 V') },
      { id: 'b', text: loc('≥ 2.4 V，IOH = −5.2 mA', '≥ 2.4 V, IOH = −5.2 mA') },
      { id: 'c', text: loc('≤ 0.8 V，不加电流', '≤ 0.8 V, no current') },
    ],
    answer: 'a',
    explain: loc('VOL 是最大值型极限：吸 8 mA 时输出不能高于 0.4 V。', 'VOL is a maximum-type limit: while sinking 8 mA the output must not exceed 0.4 V.'),
  },
  {
    id: 'f4',
    prompt: loc('IIL / IIH 在哪个电源电压下测？', 'At which supply voltage are IIL / IIH tested?'),
    options: [
      { id: 'a', text: loc('VDDmin', 'VDDmin') },
      { id: 'b', text: loc('VDDmax', 'VDDmax') },
      { id: 'c', text: loc('无所谓', 'Doesn\'t matter') },
    ],
    answer: 'b',
    explain: loc('漏电随电压升高而变大，VDDmax 才是最坏情况。', 'Leakage rises with voltage, so VDDmax is the worst case.'),
  },
  {
    id: 'f5',
    prompt: loc('测 IOZ 之前必须先做什么？', 'What must be done before testing IOZ?'),
    options: [
      { id: 'a', text: loc('让输出进入高阻：OE = 1 或片选无效', 'Put the output in high-Z: OE = 1 or chip deselected') },
      { id: 'b', text: loc('让输出为高', 'Drive the output high') },
      { id: 'c', text: loc('跑 fMAX 向量', 'Run vectors at fMAX') },
    ],
    answer: 'a',
    explain: loc('IOZ 是“关断状态下”的漏电，预处理就是把输出关掉。', 'IOZ is leakage "in the off state", so preconditioning means turning the output off.'),
  },
  {
    id: 'f6',
    prompt: loc('IDD 的测试条件是', 'The test conditions for IDD are'),
    options: [
      { id: 'a', text: loc('VDDmax，f = fMAX，输出开路', 'VDDmax, f = fMAX, outputs open') },
      { id: 'b', text: loc('VDDmin，静止，输出接负载', 'VDDmin, static, outputs loaded') },
      { id: 'c', text: loc('VDD = 5 V，任意频率', 'VDD = 5 V, any frequency') },
    ],
    answer: 'a',
    explain: loc('电压最高、频率最高时功耗最大；输出开路避免把负载电流算进 IDD。', 'Power is highest at the highest voltage and frequency; open outputs keep load current out of IDD.'),
  },
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么说数据手册像一份合同？', 'Why is the data sheet like a contract?'),
    options: [
      { id: 'a', text: loc('客户按它设计系统，厂家承诺每颗出货芯片都满足它', 'Customers design systems from it, and the vendor promises every shipped chip meets it') },
      { id: 'b', text: loc('因为它要盖章', 'Because it must be stamped') },
      { id: 'c', text: loc('它规定了测试机型号', 'It specifies the tester model') },
    ],
    answer: 'a',
    explain: loc('违反手册就是违约。测试的意义就是兑现这份承诺。', 'Violating the data sheet is a breach of contract. Testing exists to keep that promise.'),
  },
  {
    id: 'q2',
    prompt: loc('测试规格的极限为什么常常比数据手册更严？', 'Why are test spec limits often tighter than the data sheet?'),
    options: [
      { id: 'a', text: loc('给测试机误差、温度和漂移留 Guardband', 'To leave guardband for tester error, temperature and drift') },
      { id: 'b', text: loc('为了降低良率', 'To lower the yield') },
      { id: 'c', text: loc('手册写错了', 'The data sheet is wrong') },
    ],
    answer: 'a',
    explain: loc('在测试机上刚好 Pass 的芯片，换个环境可能就不满足手册，所以要留余量。', 'A chip that barely passes on the tester may fail the data sheet in another environment, so margin is needed.'),
  },
  {
    id: 'q3',
    prompt: loc('芯片 fMAX = 66 MHz，测试机最高 20 MHz。怎么办？', 'The chip\'s fMAX = 66 MHz, but the tester tops out at 20 MHz. What now?'),
    options: [
      { id: 'a', text: loc('功能可降频测；速度相关项要换机台、用多路复用，或靠表征保证', 'Test function at reduced speed; speed items need another tester, multiplexing, or characterization') },
      { id: 'b', text: loc('照样全速测', 'Test at full speed anyway') },
      { id: 'c', text: loc('不用测速度', 'No need to test speed') },
    ],
    answer: 'a',
    explain: loc('测试机能力不够，必须在规格阶段就发现并作出取舍（{@fAc} 讲多路复用）。', 'Tester limitations must be caught at the spec stage and trade-offs made ({@fAc} covers multiplexing).'),
  },
  {
    id: 'q4',
    prompt: loc('输入电容 CIN 在手册里有，量产要测吗？', 'Input capacitance CIN is in the data sheet. Is it tested in production?'),
    options: [
      { id: 'a', text: loc('通常不测，由设计和抽样表征保证', 'Usually not; guaranteed by design and sample characterization') },
      { id: 'b', text: loc('每颗都要测', 'Every chip is tested') },
      { id: 'c', text: loc('只在 CP 测', 'Only at wafer sort') },
    ],
    answer: 'a',
    explain: loc('手册上的项不等于测试项，测试规格会标注“设计保证”。', 'Data sheet items are not the same as test items; the test spec marks some as "guaranteed by design".'),
  },
  {
    id: 'b1',
    prompt: loc('标准 TTL 的输入电平是？', 'What are the standard TTL input levels?'),
    options: [
      { id: 'a', text: loc('VIL = 1.5 V（0.3 VDD），VIH = 3.5 V（0.7 VDD），VDD = 5 V', 'VIL = 1.5 V (0.3 VDD), VIH = 3.5 V (0.7 VDD), VDD = 5 V') },
      { id: 'b', text: loc('VIL = 0.4 V，VIH = 2.0 V', 'VIL = 0.4 V, VIH = 2.0 V') },
      { id: 'c', text: loc('VIL = 0.8 V，VIH = 2.4 V', 'VIL = 0.8 V, VIH = 2.4 V') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'd',
    explain: loc('标准 TTL 输入是 VIL = 0.8 V、VIH = 2.0 V，三个选项都不对。A 是标准 CMOS 输入电平；B 把 VOL（0.4 V）当成了 VIL；C 把 VOH（2.4 V）当成了 VIH。见上面的“标准逻辑电平”表。', 'Standard TTL inputs are VIL = 0.8 V, VIH = 2.0 V, so none of the three is right. A is the standard CMOS input level; B mistakes VOL (0.4 V) for VIL; C mistakes VOH (2.4 V) for VIH. See the "Standard logic levels" table above.'),
  },
  {
    id: 'b2',
    prompt: loc('哪一项 DC 测试是“往输入脚上强加电压，再量电流”？', 'Which DC test "forces a voltage on an input pin and measures current"?'),
    options: [
      { id: 'a', text: loc('VOH / VOL', 'VOH / VOL') },
      { id: 'b', text: loc('IIL / IIH', 'IIL / IIH') },
      { id: 'c', text: loc('VIL / VIH', 'VIL / VIH') },
      { id: 'd', text: loc('IDD', 'IDD') },
    ],
    answer: 'b',
    explain: loc('IIL / IIH（输入漏电）：把输入强加到 0 V 量 IIL，强加到 VDD 量 IIH。VOH / VOL 是对输出强加电流、量电压；VIL / VIH 靠功能测试验证；IDD 量的是电源脚的电流。', 'IIL / IIH (input leakage): force the input to 0 V to measure IIL, to VDD to measure IIH. VOH / VOL force current into an output and measure voltage; VIL / VIH are verified by functional test; IDD measures supply pin current.'),
  },
  {
    id: 'b3',
    prompt: loc('256×4 SRAM 商业级的 IDD 上限是多少？', 'What is the IDD maximum for the commercial 256×4 SRAM?'),
    options: [
      { id: 'a', text: loc('120 mA', '120 mA') },
      { id: 'b', text: loc('150 mA', '150 mA') },
      { id: 'c', text: loc('10 µA', '10 µA') },
      { id: 'd', text: loc('8 mA', '8 mA') },
    ],
    answer: 'a',
    explain: loc('DC 特性表里 IDD 一行：VDD = VDDmax、f = fMAX、输出开路，商业级最大 120 mA，军用级 150 mA。10 µA 是 IIL/IIH 的极限，8 mA 是 IOL。', 'The IDD row of the DC table: VDD = VDDmax, f = fMAX, outputs open; commercial max 120 mA, military 150 mA. 10 µA is the IIL/IIH limit and 8 mA is IOL.'),
  },
  {
    id: 'b4',
    prompt: loc('输出处于逻辑 0 时，用哪项测试保证输出电压正确？', 'With the output at logic 0, which test guarantees the output voltage?'),
    options: [
      { id: 'a', text: loc('VIL', 'VIL') },
      { id: 'b', text: loc('VOL', 'VOL') },
      { id: 'c', text: loc('IOZL', 'IOZL') },
      { id: 'd', text: loc('以上都不对', 'None of the above') },
    ],
    answer: 'b',
    explain: loc('VOL 是输出为低时允许的最高电压：吸 IOL = 8 mA 时不能高于 0.4 V。VIL 是输入门槛，不是输出；IOZL 是输出关断（高阻）时的漏电，输出根本不在逻辑 0。', 'VOL is the highest voltage allowed with the output low: no more than 0.4 V while sinking IOL = 8 mA. VIL is an input threshold, not an output; IOZL is leakage with the output off (high-Z), so the output is not at logic 0 at all.'),
  },
  {
    id: 'b5',
    prompt: loc('256×4 SRAM 商业级的工作温度范围是？', 'What is the operating temperature range of the commercial 256×4 SRAM?'),
    options: [
      { id: 'a', text: loc('−55 °C ~ 125 °C', '−55 °C ~ 125 °C') },
      { id: 'b', text: loc('0 °C ~ 70 °C', '0 °C ~ 70 °C') },
      { id: 'c', text: loc('−40 °C ~ 85 °C', '−40 °C ~ 85 °C') },
      { id: 'd', text: loc('25 °C', '25 °C') },
    ],
    answer: 'b',
    explain: loc('工作范围表：商业级 0–70 °C、VDD = 5 V ± 5%；军用级 −55–125 °C、VDD = 5 V ± 10%。−40–85 °C 是常见的工业级，这份规格里没有。', 'Operating table: commercial 0–70 °C, VDD = 5 V ± 5%; military −55–125 °C, VDD = 5 V ± 10%. −40–85 °C is the common industrial grade, which this spec does not include.'),
  },
  {
    id: 'b6',
    prompt: loc('256×4 SRAM 的 IIL / IIH 测试用什么电流极限？', 'What current limits apply to the 256×4 SRAM IIL / IIH tests?'),
    options: [
      { id: 'a', text: loc('−10 µA ~ +10 µA', '−10 µA ~ +10 µA') },
      { id: 'b', text: loc('−5.2 mA ~ +8 mA', '−5.2 mA ~ +8 mA') },
      { id: 'c', text: loc('0 ~ 120 mA', '0 ~ 120 mA') },
      { id: 'd', text: loc('−2 µA ~ +2 µA', '−2 µA ~ +2 µA') },
    ],
    answer: 'a',
    explain: loc('规格写的是 VSS ≤ VIN ≤ VDD 时，Input Load Current 最小 −10 µA、最大 +10 µA。也就是说强加 0 V 时电流不能比 −10 µA 更负（流出），强加 VDD 时不能超过 +10 µA（流进）。', 'The spec says that for VSS ≤ VIN ≤ VDD, Input Load Current is min −10 µA, max +10 µA. So when forcing 0 V the current must not be more negative than −10 µA (outflow), and when forcing VDD it must not exceed +10 µA (inflow).'),
  },
  {
    id: 'b7',
    prompt: loc('256×4 SRAM 规格里，IOL 和 IOH 的数值相等。', 'In the 256×4 SRAM spec, IOL and IOH have equal values.'),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc('不相等：IOL = 8 mA（输出为低时吸入），IOH = −5.2 mA（输出为高时流出）。不但大小不同，符号也相反——负号表示电流流出芯片。', 'Not equal: IOL = 8 mA (sunk with the output low), IOH = −5.2 mA (sourced with the output high). They differ in magnitude and in sign - the minus sign means current flows out of the chip.'),
  },
]
