import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

export const WHY: LText[] = [
  loc('测试工程师拿到一颗新芯片，第一件事不是写程序，而是读规格。规格告诉你：这颗芯片承诺了什么，在什么条件下承诺。'),
  loc('没有规格，Pass / Fail 就没有依据。“输出高电平够不够高”这句话，只有写成“VDD = 4.75 V、拉 5.2 mA 时 VOH ≥ 2.4 V”才能测。'),
]

export const KINDS: Card[] = [
  {
    id: 'design',
    title: loc('设计规格'),
    sub: loc('Design Spec · 写给设计'),
    text: loc('芯片要做成什么样：功能、引脚、性能目标。先于电路存在，开发过程中会改。'),
    explain: [
      loc('设计规格是“我们打算做什么”。它驱动电路设计和仿真，里面的数字往往是目标值，不一定都是最终对外承诺的值。'),
      loc('测试工程师读它，是为了早点知道芯片有哪些模式、有没有 DFT（Scan、BIST、JTAG），提前规划测试方案。'),
    ],
  },
  {
    id: 'test',
    title: loc('测试规格'),
    sub: loc('Test Spec · 写给测试'),
    text: loc('每一项怎么测：条件、极限、顺序。是测试程序的直接依据。'),
    explain: [
      loc('测试规格把数据手册里的每一行变成可执行的测试：施加什么电压电流、用哪组向量预处理、在什么时刻比较、极限是多少。'),
      loc('它的极限通常比数据手册更紧一点（Guardband），给测试机误差和温度漂移留余量，保证出货的芯片在客户手里一定满足手册。'),
    ],
  },
  {
    id: 'device',
    title: loc('器件规格 / 数据手册'),
    sub: loc('Data Sheet · 写给客户'),
    text: loc('对外的承诺。客户照它设计系统，出货芯片必须满足它——相当于买卖合同。'),
    explain: [
      loc('客户不会看你的设计文件，只看数据手册。他按手册里的 VOH、tAA 去设计电路板，如果芯片达不到，就是违约。'),
      loc('所以量产测试的核心任务只有一句：证明每一颗出货的芯片都满足数据手册。'),
    ],
  },
]

export const WORDS: Card[] = [
  {
    id: 'pre',
    title: loc('预处理'),
    sub: loc('Preconditioning'),
    text: loc('测量之前，先把芯片放进一个确定的状态。'),
    explain: [
      loc('例：测 VOH 之前，先跑一段向量让某个输出变成高电平，停在那里，再用 PMU 去量。'),
      loc('预处理没做对，量到的就不是你想量的东西——比如输出其实是低，VOH 必然 Fail，但芯片未必坏。'),
    ],
  },
  {
    id: 'static',
    title: loc('静态'),
    sub: loc('Static'),
    text: loc('测量时芯片不翻转：输入固定，等电压电流稳定后再读。'),
    explain: [loc('大部分 DC 测试是静态的：VOH/VOL、IIL/IIH、IOZ、静态 IDD。芯片停在某个向量上，PMU 慢慢量。')],
  },
  {
    id: 'dynamic',
    title: loc('动态'),
    sub: loc('Dynamic'),
    text: loc('测量时芯片正在按某个频率运行。'),
    explain: [
      loc('动态 IDD：在 fMAX 下循环跑向量，同时量电源平均电流。功能测试和 AC 测试本身也都是动态的。'),
    ],
  },
]

export const CONDS: Array<{ kind: LText; cond: LText; limit: LText }> = [
  {
    kind: loc('DC 测试'),
    cond: loc('VDD、输入电平、PMU 强加的电流或电压、温度'),
    limit: loc('电压或电流的上下限，例如 VOH ≥ 2.4 V、IIH ≤ 10 µA'),
  },
  {
    kind: loc('功能测试'),
    cond: loc('VDD、VIL/VIH、比较电平 VOL/VOH、负载、周期与边沿、向量'),
    limit: loc('每一拍输出是否等于期望：全对 Pass，任何一拍错就 Fail'),
  },
  {
    kind: loc('AC 测试'),
    cond: loc('同功能测试，再加上被测边沿的位置'),
    limit: loc('时间的上下限，例如 tAA ≤ 15 ns、tSD ≥ 11 ns'),
  },
]

export type Grade = 'com' | 'mil'

export const GRADES: Record<Grade, { name: LText; tMin: number; tMax: number; vMin: number; vMax: number; tol: string; idd: number }> = {
  com: { name: loc('商业级'), tMin: 0, tMax: 70, vMin: 4.75, vMax: 5.25, tol: '±5%', idd: 120 },
  mil: { name: loc('军用级'), tMin: -55, tMax: 125, vMin: 4.5, vMax: 5.5, tol: '±10%', idd: 150 },
}

export type SheetTab = 'abs' | 'op' | 'dc' | 'logic' | 'read' | 'write'

export const SHEET_TABS: Array<{ id: SheetTab; label: LText }> = [
  { id: 'abs', label: loc('极限额定值') },
  { id: 'op', label: loc('工作范围') },
  { id: 'dc', label: loc('DC 特性') },
  { id: 'logic', label: loc('逻辑功能') },
  { id: 'read', label: loc('读时序') },
  { id: 'write', label: loc('写时序') },
]

export type SheetRow = {
  id: string
  cells: (g: (typeof GRADES)[Grade]) => Array<LText | string>
  explain: LText[]
}

export const SHEET_HEAD: Record<SheetTab, LText[]> = {
  abs: [loc('项目'), loc('额定值'), loc('说明')],
  op: [loc('项目'), loc('最小'), loc('最大')],
  dc: [loc('符号'), loc('条件'), loc('最小'), loc('最大')],
  logic: [loc('CS1'), loc('CS2'), loc('WE'), loc('OE'), loc('模式'), loc('数据脚')],
  read: [loc('符号'), loc('含义'), loc('最小 ns'), loc('最大 ns')],
  write: [loc('符号'), loc('含义'), loc('最小 ns'), loc('最大 ns')],
}

const ABS_NOTE = loc('超过就可能永久损坏。它不是工作条件，也不是测试项——测试时任何时刻都不能超过它。')

export const SHEET: Record<SheetTab, SheetRow[]> = {
  abs: [
    {
      id: 'vdd',
      cells: () => ['VDD', '−0.5 ~ 7.0 V', loc('示例值')],
      explain: [ABS_NOTE, loc('测试中最容易越界的是热切换和 IOS 测试：瞬间电压冲击可能超过额定值，见 M20。')],
    },
    {
      id: 'vin',
      cells: () => ['VIN', '−0.5 ~ VDD + 0.5 V', loc('示例值')],
      explain: [ABS_NOTE, loc('输入比 VDD 高、或比地低超过一个二极管压降，保护二极管就会导通，严重时触发 Latch-up（M16）。')],
    },
    {
      id: 'tstg',
      cells: () => ['Tstg', '−65 ~ 150 °C', loc('示例值')],
      explain: [ABS_NOTE, loc('存储温度只说不通电时能放在哪，不代表能在这个温度下工作。')],
    },
  ],
  op: [
    {
      id: 'temp',
      cells: (g) => ['TA', `${g.tMin} °C`, `${g.tMax} °C`],
      explain: [
        loc('工作温度范围。商业级 0–70 °C，军用级 −55–125 °C。'),
        loc('量产时通常在一两个温度点测（常温 + 高温），极限温度的性能靠表征和 Guardband 保证。'),
      ],
    },
    {
      id: 'vdd',
      cells: (g) => [`VDD (5 V ${g.tol})`, `${g.vMin} V`, `${g.vMax} V`],
      explain: [
        loc('5 V ± 5% → 4.75 V 到 5.25 V；± 10% → 4.5 V 到 5.5 V。'),
        loc('这两个端点就是后面所有条件里的 VDDmin 和 VDDmax。哪项在哪端测，取决于哪端更难过（最坏情况）。'),
      ],
    },
  ],
  dc: [
    {
      id: 'voh',
      cells: (g) => ['VOH', `VDD = ${g.vMin} V, IOH = −5.2 mA`, '2.4 V', '—'],
      explain: [
        loc('输出高电平：芯片向外“吐” 5.2 mA 电流时，输出电压不能低于 2.4 V。'),
        loc('为什么在 VDDmin 测？电源越低，上拉管越弱，输出越难拉高，这是最坏情况。IOH 写成负数，表示电流流出芯片。'),
      ],
    },
    {
      id: 'vol',
      cells: (g) => ['VOL', `VDD = ${g.vMin} V, IOL = 8 mA`, '—', '0.4 V'],
      explain: [
        loc('输出低电平：芯片“吸” 8 mA 电流时，输出电压不能高于 0.4 V。'),
        loc('同样在 VDDmin 测：栅压低，下拉管导通电阻大，压降最大。'),
      ],
    },
    {
      id: 'vih',
      cells: () => ['VIH', loc('保证识别为 1'), '2.2 V', '—'],
      explain: [
        loc('输入高电平门槛：只要输入 ≥ 2.2 V，芯片必须当成 1。'),
        loc('不是用 PMU 量的。做法是把 Tester 的驱动高电平设成 2.2 V 跑功能向量，全对就 Pass（M21）。'),
      ],
    },
    {
      id: 'vil',
      cells: () => ['VIL', loc('保证识别为 0'), '—', '0.8 V'],
      explain: [loc('输入低电平门槛：只要输入 ≤ 0.8 V，芯片必须当成 0。同样靠功能测试验证。')],
    },
    {
      id: 'iil',
      cells: (g) => ['IIL / IIH', `VDD = ${g.vMax} V, VIN = 0 V / VDD`, '−10 µA', '10 µA'],
      explain: [
        loc('输入漏电流：把输入拉到 0 V 量 IIL，拉到 VDD 量 IIH，绝对值都不能超过 10 µA。'),
        loc('在 VDDmax 测：电压越高，漏电越大。CMOS 输入理想上是电容，正常漏电只有 nA 级。'),
      ],
    },
    {
      id: 'ioz',
      cells: (g) => ['IOZ', loc(`VDD = ${g.vMax} V，输出禁止，VOUT = 0 / VDD`), '−10 µA', '10 µA'],
      explain: [
        loc('三态输出关断后的漏电流。先预处理：让 OE = 1 或片选无效，输出进入高阻，再量。'),
        loc('高阻脚应该像断开一样；漏得多，会拖累同一条总线上的其他芯片。'),
      ],
    },
    {
      id: 'idd',
      cells: (g) => ['IDD', loc(`VDD = ${g.vMax} V，f = fMAX，输出开路`), '—', `${g.idd} mA`],
      explain: [
        loc('电源电流。条件是最坏的：电压最高、频率最高。输出开路是为了不把负载电流算进来。'),
        loc('商业级 120 mA，军用级 150 mA——更宽的温度范围换来更松的极限。'),
      ],
    },
    {
      id: 'cap',
      cells: () => ['CIN / COUT', '—', '—', '—'],
      explain: [
        loc('输入 / 输出电容在手册里有，但量产不测。它由设计和工艺决定，用抽样表征来保证。'),
        loc('这一点很重要：手册上的项不一定都进测试程序。测试规格会写明哪些项“由设计保证”。'),
      ],
    },
  ],
  logic: [
    {
      id: 'des1',
      cells: () => ['1', 'X', 'X', 'X', loc('未选中'), loc('高阻')],
      explain: [loc('CS1 低有效。CS1 = 1 时芯片没被选中，数据脚高阻、功耗最低。X 表示“这一位是什么都行”。')],
    },
    {
      id: 'des2',
      cells: () => ['X', '0', 'X', 'X', loc('未选中'), loc('高阻')],
      explain: [loc('CS2 高有效。两个片选必须同时有效（CS1 = 0 且 CS2 = 1）芯片才工作。')],
    },
    {
      id: 'odis',
      cells: () => ['0', '1', '1', '1', loc('输出禁止'), loc('高阻')],
      explain: [loc('选中了，但既不写（WE = 1）也不读（OE = 1），输出仍是高阻。IOZ 就是在这种状态下测的。')],
    },
    {
      id: 'read',
      cells: () => ['0', '1', '1', '0', loc('读'), loc('输出数据')],
      explain: [loc('OE = 0 打开输出驱动，地址所指的 4 位数据出现在数据脚上。VOH / VOL 也要先停在这个状态。')],
    },
    {
      id: 'write',
      cells: () => ['0', '1', '0', 'X', loc('写'), loc('输入数据')],
      explain: [loc('WE = 0 时数据脚变成输入，数据被写进地址所指的单元。写的时候 OE 无关，输出会被强制关断。')],
    },
  ],
  read: [
    rowT('tRC', '读周期', '15', '—', '连续两次读之间的最短时间。它决定了读的最高频率：1 / 15 ns ≈ 66.7 MHz。'),
    rowT('tAA', '地址到数据有效', '—', '15', '地址变化后，最慢 15 ns 新数据必须出现。测法：地址在 T0 变，Strobe 放在 T0 + 15 ns。'),
    rowT('tACS', '片选到数据有效', '—', '10', '片选有效后最慢 10 ns 出数据。'),
    rowT('tDOE', 'OE 到数据有效', '—', '10', 'OE 下降后最慢 10 ns 出数据。OE 控制的读时序就靠它（M22）。'),
    rowT('tHZCS', '片选无效到高阻', '—', '8', '取消片选后，输出最慢 8 ns 进入高阻。测法：用带 VREF 的负载，在 Strobe 时看引脚是否落在 VOL 与 VOH 之间。'),
    rowT('tHZOE', 'OE 无效到高阻', '—', '8', 'OE 拉高后最慢 8 ns 高阻。'),
    rowT('tLZCS', '片选有效到低阻', '2', '—', '片选有效后，至少 2 ns 输出才开始驱动。是最小值：太快打开会和总线上别的器件冲突。'),
    rowT('tLZOE', 'OE 有效到低阻', '2', '—', 'OE 有效后至少 2 ns 才开始驱动。'),
  ],
  write: [
    rowT('tWC', '写周期', '15', '—', '两次写之间的最短时间。'),
    rowT('tSA', '地址建立到 WE', '2', '—', '地址必须比 WE 下降早至少 2 ns 稳定。'),
    rowT('tPWE', 'WE 脉宽', '11', '—', 'WE 低电平至少保持 11 ns。测试时给 11 ns（或更短来找余量），能写进去就 Pass。'),
    rowT('tAW', '地址有效到写结束', '13', '—', '= tSA + tPWE = 2 + 11。写在 WE 上升沿结束，所以 WE 上升放在 13 ns。'),
    rowT('tSCS', '片选到写结束', '11', '—', '片选有效到 WE 上升至少 11 ns。'),
    rowT('tSD', '数据建立到写结束', '11', '—', '数据必须在 WE 上升前至少 11 ns 稳定。'),
    rowT('tHD', '数据保持', '1', '—', 'WE 上升后数据还要保持至少 1 ns。'),
    rowT('tHA', '地址保持', '2', '—', 'WE 上升后地址还要保持至少 2 ns。13 + 2 = 15 = tWC。'),
    rowT('tHZWE', 'WE 有效到输出高阻', '—', '8', '开始写时，输出最慢 8 ns 让出总线。'),
    rowT('tLZWE', 'WE 无效到输出低阻', '2', '—', '写结束后至少 2 ns 输出才重新驱动。'),
  ],
}

function rowT(sym: string, name: string, min: string, max: string, text: string): SheetRow {
  return {
    id: sym,
    cells: () => [sym, loc(name), min, max],
    explain: [
      loc(text),
      min !== '—'
        ? loc('最小值型：Tester 给芯片的时间就按规格值（或更短）。芯片在这么紧的条件下还能工作，就 Pass。')
        : loc('最大值型：Strobe 放在规格时刻。到那一刻输出已经正确，就 Pass。'),
    ],
  }
}

export const LEVELS: Array<{ name: string; vil: string; vih: string; vol: string; voh: string }> = [
  { name: 'TTL', vil: '0.8 V', vih: '2.0 V', vol: '0.4 V', voh: '2.4 V' },
  { name: 'CMOS (VDD = 5 V)', vil: '0.3 VDD = 1.5 V', vih: '0.7 VDD = 3.5 V', vol: '≈ 0.1 V', voh: '≈ VDD − 0.1 V' },
]

export const LEVEL_NOTE = loc('CMOS 输出在轻载时几乎到两条电源轨；具体数值随厂家和负载电流不同，以手册为准。TTL 的噪声容限：2.4 − 2.0 = 0.4 V，0.8 − 0.4 = 0.4 V。')

export const TAKEAWAY: LText[] = [
  loc('数据手册是对客户的合同；量产测试要证明每颗出货芯片都满足它。'),
  loc('每一行规格 = 测试条件（你施加什么）+ 测试极限（你判什么）。'),
  loc('条件挑最坏情况：输出驱动在 VDDmin 测，漏电和 IDD 在 VDDmax 测。'),
  loc('先核对测试机能力：频率、精度、通道数不够，有的项就只能降级测或靠表征保证。'),
]

export const FILL: QuizQuestion[] = [
  {
    id: 'f1',
    prompt: loc('商业级 256×4 SRAM 的 VOH，应在 VDD = ? 下测'),
    options: [
      { id: 'a', text: loc('4.75 V（VDDmin）') },
      { id: 'b', text: loc('5.00 V') },
      { id: 'c', text: loc('5.25 V（VDDmax）') },
    ],
    answer: 'a',
    explain: loc('电源最低时上拉管最弱，输出最难拉高——最坏情况。'),
  },
  {
    id: 'f2',
    prompt: loc('测 VOH 时，PMU 强加的电流是'),
    options: [
      { id: 'a', text: loc('IOH = −5.2 mA，从芯片流出') },
      { id: 'b', text: loc('IOL = +8 mA，流进芯片') },
      { id: 'c', text: loc('−10 µA') },
    ],
    answer: 'a',
    explain: loc('输出为高时芯片向外供电流，所以是负号的 IOH。'),
  },
  {
    id: 'f3',
    prompt: loc('VOL 的极限和条件'),
    options: [
      { id: 'a', text: loc('≤ 0.4 V，IOL = 8 mA，VDD = 4.75 V') },
      { id: 'b', text: loc('≥ 2.4 V，IOH = −5.2 mA') },
      { id: 'c', text: loc('≤ 0.8 V，不加电流') },
    ],
    answer: 'a',
    explain: loc('VOL 是最大值型极限：吸 8 mA 时输出不能高于 0.4 V。'),
  },
  {
    id: 'f4',
    prompt: loc('IIL / IIH 在哪个电源电压下测？'),
    options: [
      { id: 'a', text: loc('VDDmin') },
      { id: 'b', text: loc('VDDmax') },
      { id: 'c', text: loc('无所谓') },
    ],
    answer: 'b',
    explain: loc('漏电随电压升高而变大，VDDmax 才是最坏情况。'),
  },
  {
    id: 'f5',
    prompt: loc('测 IOZ 之前必须先做什么？'),
    options: [
      { id: 'a', text: loc('让输出进入高阻：OE = 1 或片选无效') },
      { id: 'b', text: loc('让输出为高') },
      { id: 'c', text: loc('跑 fMAX 向量') },
    ],
    answer: 'a',
    explain: loc('IOZ 是“关断状态下”的漏电，预处理就是把输出关掉。'),
  },
  {
    id: 'f6',
    prompt: loc('IDD 的测试条件是'),
    options: [
      { id: 'a', text: loc('VDDmax，f = fMAX，输出开路') },
      { id: 'b', text: loc('VDDmin，静止，输出接负载') },
      { id: 'c', text: loc('VDD = 5 V，任意频率') },
    ],
    answer: 'a',
    explain: loc('电压最高、频率最高时功耗最大；输出开路避免把负载电流算进 IDD。'),
  },
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么说数据手册像一份合同？'),
    options: [
      { id: 'a', text: loc('客户按它设计系统，厂家承诺每颗出货芯片都满足它') },
      { id: 'b', text: loc('因为它要盖章') },
      { id: 'c', text: loc('它规定了测试机型号') },
    ],
    answer: 'a',
    explain: loc('违反手册就是违约。测试的意义就是兑现这份承诺。'),
  },
  {
    id: 'q2',
    prompt: loc('测试规格的极限为什么常常比数据手册更严？'),
    options: [
      { id: 'a', text: loc('给测试机误差、温度和漂移留 Guardband') },
      { id: 'b', text: loc('为了降低良率') },
      { id: 'c', text: loc('手册写错了') },
    ],
    answer: 'a',
    explain: loc('在测试机上刚好 Pass 的芯片，换个环境可能就不满足手册，所以要留余量。'),
  },
  {
    id: 'q3',
    prompt: loc('芯片 fMAX = 66 MHz，测试机最高 20 MHz。怎么办？'),
    options: [
      { id: 'a', text: loc('功能可降频测；速度相关项要换机台、用多路复用，或靠表征保证') },
      { id: 'b', text: loc('照样全速测') },
      { id: 'c', text: loc('不用测速度') },
    ],
    answer: 'a',
    explain: loc('测试机能力不够，必须在规格阶段就发现并作出取舍（M22 讲多路复用）。'),
  },
  {
    id: 'q4',
    prompt: loc('输入电容 CIN 在手册里有，量产要测吗？'),
    options: [
      { id: 'a', text: loc('通常不测，由设计和抽样表征保证') },
      { id: 'b', text: loc('每颗都要测') },
      { id: 'c', text: loc('只在 CP 测') },
    ],
    answer: 'a',
    explain: loc('手册上的项不等于测试项，测试规格会标注“设计保证”。'),
  },
]
