import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------- 从晶圆到出货 ---------- */

export const FLOW_LEAD: LText[] = [
  loc('1947 年晶体管诞生，半导体产业从此开始。今天一颗 VLSI（超大规模集成电路）里有上百万个晶体管。'),
  loc('芯片先做在晶圆（wafer）上：一片圆形的硅片，上面整齐排着很多个相同的电路，每一个叫一颗 die（复数 dice）。每颗 die 彼此独立。'),
  loc('从晶圆到出货，芯片要被测两次：还在晶圆上时测一次（晶圆测试），装进封装后再测一次（成品测试）。点下面的步骤看细节。'),
]

export const FLOW: Card[] = [
  {
    id: 'fab',
    title: loc('① 晶圆制造'),
    sub: loc('Fab'),
    text: loc('在硅片上做出成百上千颗相同的 die。晶圆上有平边或缺口作为方向标记，还有几颗 process monitor die 用来监控工艺。'),
    explain: [
      loc('晶圆在制造和测试过程中都有一个平边（flat）或缺口（notch），通常朝上，用来定方向。'),
      loc('很多晶圆上有几颗 process monitor die（工艺监控片）。不管做什么产品，它们在所有晶圆上都一样，电特性是已知的。制造过程中在特定节点测它们，就能确认工艺是否正常。'),
    ],
  },
  {
    id: 'probe',
    title: loc('② 晶圆测试'),
    sub: loc('Wafer probe / Die sort'),
    text: loc('用探针卡扎到每颗 die 的 bond pad 上，逐颗测电压、电流、时序和功能。'),
    explain: [
      loc('制造完成后，每颗 die 都要彻底测一遍，这叫 wafer probing 或 die sort。要验证电压、电流、时序和功能，确认它满足器件规格。'),
      loc('探针扎到 bond pad 上，测试机通过探针卡和负载板给 die 加信号、读结果。'),
    ],
  },
  {
    id: 'mark',
    title: loc('③ 标记坏片'),
    sub: loc('墨点 / 电子晶圆图'),
    text: loc('不合格的 die 打一个墨点，或者把好坏位置存成电子晶圆图（wafer map）。'),
    explain: [
      loc('传统做法是给坏 die 点一个墨点（ink dot），后面一眼就能认出来。'),
      loc('现在很多公司更喜欢电子晶圆图：把每颗 die 的位置和结果存成文件，封装时按图挑出好片。这样就没有打墨点装置带来的各种麻烦。'),
    ],
  },
  {
    id: 'saw',
    title: loc('④ 划片'),
    sub: loc('Sawing'),
    text: loc('把晶圆锯开，分成一颗颗 die。打了墨点（或晶圆图上标坏）的 die 直接报废。'),
  },
  {
    id: 'pkg',
    title: loc('⑤ 封装'),
    sub: loc('Assembly'),
    text: loc('好的 die 装进封装的 die cavity，用 bond wire 把 bond pad 连到封装引脚，再盖上盖子密封。'),
  },
  {
    id: 'final',
    title: loc('⑥ 成品测试'),
    sub: loc('Package / Final test'),
    text: loc('封装后再测一次。可能要在几个温度下各测一遍，保证对温度敏感的参数。'),
    explain: [
      loc('如果探针卡或晶圆测试设备限制了速度和性能，成品测试可能要比晶圆测试更严格。'),
      loc('对温度敏感的参数要在多个温度下测。选上面的等级看看要测哪几个温度。'),
    ],
  },
]

export type Grade = 'com' | 'mil'

export const GRADE_TEMPS: Record<Grade, number[]> = {
  com: [0, 25, 70],
  mil: [-55, 25, 125],
}

/* ---------- 晶圆探针测试 ---------- */

export const WAFER = { cx: 200, cy: 190, r: 165, pitch: 24, size: 21 }

export type Die = { id: string; col: number; row: number; x: number; y: number; pm: boolean; edge: number }

const PM_POS = ['-4,-1', '3,-2', '-2,3', '2,2']

function buildDice(): Die[] {
  const list: Die[] = []
  const { cx, cy, r, pitch, size } = WAFER
  for (let row = -7; row <= 6; row += 1) {
    for (let col = -7; col <= 6; col += 1) {
      const x = cx + col * pitch + (pitch - size) / 2
      const y = cy + row * pitch + (pitch - size) / 2
      const corners = [
        [x, y],
        [x + size, y],
        [x, y + size],
        [x + size, y + size],
      ]
      const inside = corners.every(([px, py]) => Math.hypot(px - cx, py - cy) <= r - 6)
      // 顶部缺口附近不放 die
      const nearNotch = Math.abs(x + size / 2 - cx) < 20 && y < cy - r + 34
      if (!inside || nearNotch) continue
      const edge = Math.hypot(x + size / 2 - cx, y + size / 2 - cy) / r
      list.push({ id: `${col},${row}`, col, row, x, y, pm: PM_POS.includes(`${col},${row}`), edge })
    }
  }
  return list
}

export const DICE = buildDice()

/** 探针走位：逐行蛇形，跳过 process monitor die */
export const PROBE_ORDER: number[] = (() => {
  const idx = DICE.map((d, i) => ({ d, i })).filter((item) => !item.d.pm)
  const rows = Array.from(new Set(idx.map((item) => item.d.row))).sort((p, q) => p - q)
  return rows.flatMap((row, k) => {
    const inRow = idx.filter((item) => item.d.row === row).sort((p, q) => p.d.col - q.d.col)
    return (k % 2 === 0 ? inRow : inRow.reverse()).map((item) => item.i)
  })
})()

export const DIE_BINS: Array<{ bin: number; label: LText }> = [
  { bin: 1, label: loc('好片') },
  { bin: 2, label: loc('开短路失效') },
  { bin: 3, label: loc('DC 失效') },
  { bin: 4, label: loc('功能失效') },
  { bin: 5, label: loc('AC 失效') },
]

/** 给每颗 die 随机一个 bin；越靠边越容易坏 */
export function makeResults(): number[] {
  return DICE.map((d) => {
    const pFail = 0.06 + 0.3 * d.edge ** 6
    if (Math.random() >= pFail) return 1
    const r = Math.random()
    if (r < 0.2) return 2
    if (r < 0.45) return 3
    if (r < 0.8) return 4
    return 5
  })
}

export const WAFER_LEAD = loc('探针从晶圆一角开始，一行一行蛇形走，每到一颗 die 就测一遍。紫色的是 process monitor die，产品测试时跳过。点任何一颗 die，右边会放大给你看。')

export const DIE_NOTE: LText[] = [
  loc('die 四周浅色的小方块是 bond pad。晶圆测试时探针扎在它上面；封装时 bond wire 也焊在它上面，连到封装引脚。'),
  loc('bond pad 是软铝做的，探针一扎就留下一个小坑，叫 probe mark。操作员在显微镜下看到每个 pad 都有 probe mark，就知道探针确实接触到了。'),
]

/* ---------- 封装 ---------- */

export type PkgStyle = 'dual' | 'cerdip' | 'smd' | 'single' | 'module' | 'quad' | 'grid' | 'ball' | 'mcm'

export const PKGS: Array<{ id: string; name: string; full: LText; sides: LText; text: LText; style: PkgStyle; pins: number }> = [
  { id: 'dip', name: 'DIP', full: loc('双列直插封装'), sides: loc('两边'), text: loc('Dual Inline Package。dual 表示引脚在两条长边上，插进电路板的孔里。'), style: 'dual', pins: 8 },
  { id: 'cerdip', name: 'CerDIP', full: loc('陶瓷 DIP'), sides: loc('两边'), text: loc('陶瓷外壳的 DIP。die 装在中间的 die cavity 里，用金属盖密封，耐高温、气密性好，军品常用。'), style: 'cerdip', pins: 8 },
  { id: 'pdip', name: 'PDIP', full: loc('塑封 DIP'), sides: loc('两边'), text: loc('塑料外壳的 DIP，便宜，民用最常见。'), style: 'dual', pins: 8 },
  { id: 'pga', name: 'PGA', full: loc('针栅阵列'), sides: loc('底面整片'), text: loc('Pin Grid Array。引脚是一根根针，排满底面，适合引脚很多的芯片，比如老式 CPU。'), style: 'grid', pins: 0 },
  { id: 'bga', name: 'BGA', full: loc('球栅阵列'), sides: loc('底面整片'), text: loc('Ball Grid Array。底面是一颗颗焊球，引脚密度高、走线短，现在的大芯片几乎都是 BGA。'), style: 'ball', pins: 0 },
  { id: 'sop', name: 'SOP', full: loc('小外形封装'), sides: loc('两边'), text: loc('Small Outline Package。两边鸥翼形引脚，贴在板子表面焊接。'), style: 'smd', pins: 8 },
  { id: 'tsop', name: 'TSOP', full: loc('薄型小外形封装'), sides: loc('两边'), text: loc('Thin SOP，更薄的 SOP，内存颗粒常用。'), style: 'smd', pins: 12 },
  { id: 'tssop', name: 'TSSOP', full: loc('薄型缩小小外形封装'), sides: loc('两边'), text: loc('Thin Shrink SOP，又薄、脚距又小，真的越来越小了。'), style: 'smd', pins: 16 },
  { id: 'sip', name: 'SIP', full: loc('单列直插封装'), sides: loc('一边'), text: loc('Single Inline Package，引脚只在一条边上排成一列。'), style: 'single', pins: 10 },
  { id: 'simm', name: 'SIMM', full: loc('单列内存模组'), sides: loc('一边（金手指）'), text: loc('Single Inline Memory Module，就是电脑里的内存条：一块小板上焊着几颗内存，一边是金手指。'), style: 'module', pins: 24 },
  { id: 'qfp', name: 'QFP', full: loc('四边扁平封装'), sides: loc('四边'), text: loc('Quad Flat Pack。quad 表示四条边都有引脚。'), style: 'quad', pins: 10 },
  { id: 'tqfp', name: 'TQFP', full: loc('薄型 QFP'), sides: loc('四边'), text: loc('Thin QFP，更薄的 QFP。'), style: 'quad', pins: 12 },
  { id: 'mqfp', name: 'MQFP', full: loc('公制 QFP'), sides: loc('四边'), text: loc('Metric QFP，尺寸按公制定义的 QFP。'), style: 'quad', pins: 10 },
  { id: 'mcm', name: 'MCM', full: loc('多芯片模组'), sides: loc('看外壳'), text: loc('Multi Chip Module，一个封装里装不止一颗 die，以前叫 hybrid（混合电路）。'), style: 'mcm', pins: 10 },
]

export const BOND_TEXT: LText[] = [
  loc('封装时，die 粘在封装中央的 die cavity 里。一根根极细的 bond wire 把 die 上的 bond pad 连到封装的引脚。最后盖上盖子密封。'),
  loc('晶圆测试时在显微镜下看，探针卡上的探针扎在 bond pad 上的样子，和这些 bond wire 很像。'),
]

/* ---------- ATE ---------- */

export const ATE_LEAD: LText[] = [
  loc('芯片越复杂，测试也越复杂。一颗 VLSI 可能要上百项电压、电流、时序测试，外加几百万步功能测试。对有些器件，测试是制造成本里最大的一块。'),
  loc('ATE（Automatic Test Equipment，自动测试设备）就是一组由计算机控制的高性能测试仪器。仪器和计算机合在一起，就是一台测试系统。'),
  loc('做集成电路有多种工艺：TTL（双极型）、ECL、SOS（蓝宝石上的硅）、CMOS。都要测，本课程主要讲数字 TTL 和 CMOS 电路。'),
]

export const ATE_PARTS: Card[] = [
  { id: 'inst', title: loc('测试仪器'), sub: loc('Force / Measure'), text: loc('电源、PMU、管脚电子、时序发生器……负责给芯片加电压电流、发波形，并测量结果。') },
  { id: 'cpu', title: loc('计算机'), sub: loc('控制一切'), text: loc('计算机控制所有测试硬件：什么时候加什么电压、发哪组图形、和哪个极限比。') },
  { id: 'prog', title: loc('测试程序'), sub: loc('Test program'), text: loc('计算机执行的一组指令就是测试程序。同一台测试机换一个程序，就能测另一种芯片。') },
  { id: 'cal', title: loc('校准'), sub: loc('Calibration'), text: loc('测试系统结果一致、可重复，靠的是定期校准：检查（必要时调整）所有加载和测量仪器的精度。') },
]

export type Hookup = 'cp' | 'hand' | 'handler'

export const HOOKUP_TEXT: Record<Hookup, LText> = {
  cp: loc('晶圆测试：探针卡在物理上和电气上把测试系统接到 die 上。负载板（load board，也叫 performance board）把探针卡连到测试系统的仪器。两者配合，信号才能在测试机和 die 之间来回。'),
  hand: loc('手测（hand test）：把封装好的芯片一颗颗手动插进负载板上的测试座（socket）。适合工程调试，量大时太慢。'),
  handler: loc('分选机（handler）：自动抓起一颗未测芯片，压到测试位的接触器上，测完再按 Pass / Fail 结果放进对应的 Bin。适合量产。'),
}

/* ---------- 数字 vs 模拟 ---------- */

export const DA_LEAD: LText[] = [
  loc('数字电路只认两种电平：0 是一个确定的电压，1 是另一个确定的电压。一个 0 或 1 就是一个 bit，8 个 bit 是一个 byte。数值越大、越精细，需要的 bit 越多。'),
  loc('模拟信号是连续的：任意两个电平之间都有无穷多个值。模拟电路可以用电压，也可以用电流表示数据。'),
  loc('用钟表来想：指针表的指针连续走，任何时刻都能读，读多准看你的眼力；数字表只显示整格，比最小一格还小的时间就看不到了。要更精确，就得加位数。'),
]

export type Res = 'min' | 'sec' | 'ds' | 'cs'

export const MIXED: Card[] = [
  { id: 'adc', title: loc('A/D 转换器'), sub: 'ADC', text: loc('把模拟量变成数字量。') },
  { id: 'dac', title: loc('D/A 转换器'), sub: 'DAC', text: loc('把数字量变成模拟量。') },
  { id: 'bdla', title: 'Big D Little A', sub: loc('以数字为主'), text: loc('混合信号器件里大部分是数字电路，只有一小块模拟。') },
  { id: 'bald', title: 'Big A Little D', sub: loc('以模拟为主'), text: loc('混合信号器件里大部分是模拟电路，只有一小块数字。') },
]

export const MIXED_LEAD = loc('同时含有数字和模拟电路的器件叫混合信号（mixed signal）器件，ADC、DAC 就是典型。按哪部分占大头，又分 Big D Little A 和 Big A Little D。')

/* ---------- 四类测试机 ---------- */

export const TESTERS: Card[] = [
  {
    id: 'mem',
    title: loc('Memory 测试机'),
    sub: loc('APG · 并测'),
    text: loc('存储器也是数字器件，DC 参数和普通数字芯片差不多，但功能测试要用专门的算法图形。'),
    explain: [
      loc('Memory 测试机用 APG（Algorithmic Pattern Generator，算法图形发生器）在硬件里现场生成功能图形，不必像普通数字测试机那样预先把向量存进向量存储器。'),
      loc('典型图形有：checkerboard（棋盘格）、反棋盘格、walking ones、walking zeros、butterfly 等。下面可以看几种。'),
      loc('存储器要跑的图形多，测试时间长。为了降低测试成本、提高产出，Memory 测试机通常同时并测很多颗。'),
    ],
  },
  {
    id: 'ana',
    title: loc('模拟（线性）测试机'),
    sub: loc('µV · pA'),
    text: loc('模拟器件需要非常精确地加、测电压和电流，有时要到微伏、皮安级，几乎不需要数字激励。'),
    explain: [
      loc('模拟器件的 DC 参数和数字电路完全不同，要用专门的仪器。模拟测试系统常用机架式仪器，按要测的器件专门挑选搭配。'),
      loc('典型参数：增益、输入失调电流和电压、线性度、共模抑制、电源抑制、动态响应、频率响应、建立时间、过冲、谐波失真、信噪比、响应时间、串扰、相邻通道干扰、精度、噪声。'),
    ],
  },
  {
    id: 'mix',
    title: loc('混合信号测试机'),
    sub: loc('数字 + 模拟'),
    text: loc('同时带有测数字和测模拟的设备。'),
    explain: [
      loc('Big D Little A 测试机：面向以数字为主的电路，DC 和功能测试很强，只支持少量模拟测试。'),
      loc('Big A Little D 测试机：面向以模拟为主的电路，模拟参数测得很准，功能测试能力很有限。'),
    ],
  },
  {
    id: 'dig',
    title: loc('数字测试机'),
    sub: loc('从台式到高端'),
    text: loc('只含数字电路的器件用数字测试机测。价格、性能、体积、选件差别非常大。'),
    explain: [
      loc('低端是台式（bench-top）测试机：管脚少、复杂度低，最高约 20 MHz，能存的图形有限，测 SSI / MSI 小中规模电路。'),
      loc('高端是超快、超多管脚的系统：测试频率可到 400 MHz，最多 1024 个通道，时序资源很准，能存几百万条功能图形。常用来做新 VLSI 的特性分析，但太贵，量产时往往用不起。'),
      loc('中端是行业的“老黄牛”：50–100 MHz，最多 256 通道，性能和成本搭配得最合适。'),
    ],
  },
]

export type MemPat = 'checker' | 'inv' | 'walk1' | 'walk0'

export const MEM_PATS: Array<{ id: MemPat; label: LText | string; text: LText }> = [
  { id: 'checker', label: loc('棋盘格'), text: loc('相邻单元写相反的值，像棋盘一样。专抓相邻单元之间的短路和干扰。') },
  { id: 'inv', label: loc('反棋盘格'), text: loc('把棋盘格整体取反再写一遍，保证每个单元 0 和 1 都被验证过。') },
  { id: 'walk1', label: 'Walking 1', text: loc('全 0 背景里只有一个 1，一格一格往前走。检查写一个单元会不会影响别的单元。') },
  { id: 'walk0', label: 'Walking 0', text: loc('全 1 背景里只有一个 0，一格一格往前走，是 walking 1 的反向版本。') },
]

export type TierId = 'bench' | 'mid' | 'high'

export const TIERS: Array<{ id: TierId; name: LText; maxF: number; maxPins: number; range: string; cost: LText }> = [
  { id: 'bench', name: loc('低端台式'), maxF: 20, maxPins: 64, range: '≤ 20 MHz', cost: loc('低') },
  { id: 'mid', name: loc('中端'), maxF: 100, maxPins: 256, range: '50–100 MHz, ≤ 256 ch', cost: loc('中') },
  { id: 'high', name: loc('高端'), maxF: 400, maxPins: 1024, range: '≤ 400 MHz, ≤ 1024 ch', cost: loc('高') },
]

export function recommendTier(f: number, pins: number): TierId | null {
  const tier = TIERS.find((item) => f <= item.maxF && pins <= item.maxPins)
  return tier ? tier.id : null
}

export const TIER_NOTE = loc('台式机的管脚上限教材没有给具体数字，这里按 64 通道示意。')

export const COST_TEXT = loc('测试成本对半导体行业极其敏感，会在器件总制造成本里占很大一块。测试机性能要和器件需求匹配：用功能过剩的高端机，测试成本太高；用性能不够的低端机，测试覆盖不足。够用就好。')

/* ---------- 周边设备 ---------- */

export const PERIPH: Card[] = [
  {
    id: 'lb',
    title: loc('负载板'),
    sub: 'Loadboard / Performance board',
    text: loc('测试头和被测器件之间的机械 + 电气接口，把管脚电子卡的信号送到 DUT。'),
    explain: [
      loc('负载板把测试头接到被测器件。晶圆测试时它接探针卡；手测时测试座装在它上面；量产时它和分选机对接。要配合的设备五花八门，所以负载板种类也很多。'),
      loc('测高速或大电流器件时要用定制负载板：走线必须阻抗匹配，保证信号完整性；各路信号常做等长，保证时序一致。定制负载板很贵，设计制造往往要几个月。'),
    ],
  },
  {
    id: 'prober',
    title: loc('探针台'),
    sub: 'Wafer prober',
    text: loc('晶圆测试时，测试头翻过来压在探针台上，探针台负责搬晶圆、对准、让每颗 die 依次接触探针卡。'),
    explain: [
      loc('晶圆测试时测试头翻转朝下，和探针台上装探针卡的接口组件对接，所以也叫 flip head sort。晶圆放在承片台（chuck）上，和探针卡对准后逐颗接触。'),
      loc('早年晶圆一片片手动放上去，由熟练的操作员手动对准；测试区是敞开的，光和污染都能进来。后来发现有些参数会受光照影响而失效；器件尺寸越来越小，污染会导致参数漂移、失效，缩短器件寿命。'),
      loc('现在的探针台全封闭，光和污染都进不去。晶圆出厂时装在叫 boat 的保护盒里，一盒约 25 片，整盒放进探针台，搬运和对准全部自动完成。'),
      loc('现代探针台也能打墨点，但很多公司改用电子晶圆图。它们非常可靠，基本不再需要熟练的探针操作员。'),
    ],
  },
  {
    id: 'pc',
    title: loc('探针卡'),
    sub: 'Probe card',
    text: loc('把测试头的电子资源连到 die 的每个 pad。'),
    explain: [
      loc('探针卡机械上固定在测试头上。测试资源先经过有弹性的 pogo pin 接到探针卡背面，再沿板内走线到达每根探针，探针扎在 die 的 bond pad 上。'),
      loc('有的探针卡直接做在负载板上，有的通过插座接到负载板。'),
    ],
  },
  {
    id: 'handler',
    title: loc('分选机'),
    sub: 'Device handler',
    text: loc('自动上料、送到测试位、按结果分 Bin 的机器。下面可以自己“开机”试试。'),
    explain: [
      loc('封装种类有多少，分选机的样式就有多少。封装好的芯片放在料管或托盘里送到测试区，装进分选机的料仓。'),
      loc('分选机挑一颗未测芯片送到接触区，插进接触器（contactor）。分选机发出“准备好了”，测试系统才开始测并做 Pass / Fail 判定，然后把 Bin 号告诉分选机。'),
      loc('很多分选机带温度箱，可以在非室温下测试。能放多少个 Bin，受机器的物理尺寸限制。'),
    ],
  },
  {
    id: 'temp',
    title: loc('温度强制单元'),
    sub: 'Temperature forcing unit',
    text: loc('把一个温度罩扣在芯片上，按设定值加热或冷却。手测时控温的最佳办法。'),
    explain: [
      loc('有些器件规格要求在 −55 °C 到 +125 °C 都能正常工作，就得在不同温度下测。'),
      loc('过去加热用手持热探头：费时、把手会烫、和芯片很难接触好，温度也控不准。降温用干冰或液氮：干冰约 −60 °C，而规格通常要 −55 °C 或 0 °C，根本控不准；还经常临时找不到干冰。'),
      loc('温度强制系统可编程、精确、完全自给，只需要接电，是手测座上加热或冷却器件最好的办法。'),
    ],
  },
]

export type BinMode = 'min' | 'full'
export type BinCat = 's200' | 's166' | 's100' | 'dc' | 'ac' | 'func'

export const BIN_CATS: Array<{ id: BinCat; label: LText; good: boolean }> = [
  { id: 's200', label: loc('好品 200 MHz'), good: true },
  { id: 's166', label: loc('好品 166 MHz'), good: true },
  { id: 's100', label: loc('好品 100 MHz'), good: true },
  { id: 'dc', label: loc('DC 坏品'), good: false },
  { id: 'ac', label: loc('AC 坏品'), good: false },
  { id: 'func', label: loc('功能坏品'), good: false },
]

export function randomCat(): BinCat {
  const r = Math.random()
  if (r < 0.18) return 's200'
  if (r < 0.48) return 's166'
  if (r < 0.76) return 's100'
  if (r < 0.84) return 'dc'
  if (r < 0.92) return 'ac'
  return 'func'
}

export const HANDLER_TOTAL = 30

export const BIN_TEXT: Record<BinMode, LText> = {
  min: loc('分选机至少要 3 个 Bin：未测、好品、坏品。'),
  full: loc('Bin 多了更方便：坏品按 DC / AC / 功能分开，便于分析失效原因；好品按速度分档（100 / 166 / 200 MHz），快的能卖更高价。'),
}

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('芯片测两次：晶圆上测（probe / die sort，探针卡 + 负载板），封装后再测（final test，手测座或分选机），成品可能要测多个温度。'),
  loc('坏 die 用墨点或电子晶圆图标记；bond pad 上的 probe mark 证明探针扎到了。'),
  loc('ATE = 仪器 + 计算机 + 测试程序，靠定期校准保证结果一致。'),
  loc('测试机分 Memory、模拟、混合信号、数字四类；性能和器件需求匹配，够用就好，测试成本才可控。'),
  loc('负载板要阻抗匹配、等长；探针台全封闭防光防污染；分选机至少 3 个 Bin。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('晶圆测试中不合格的 die，常见的标记方式是？'),
    options: [
      { id: 'a', text: loc('打墨点，或记录到电子晶圆图') },
      { id: 'b', text: loc('立刻用激光切掉') },
      { id: 'c', text: loc('在 bond pad 上留下 probe mark') },
      { id: 'd', text: loc('不需要标记，封装后再挑') },
    ],
    answer: 'a',
    explain: loc('传统做法是打墨点，划片后打墨点的 die 报废；现在很多公司用电子晶圆图记录好坏位置。probe mark 是每颗被扎过的 die 都会有的，不代表好坏。'),
  },
  {
    id: 'q2',
    prompt: loc('军用器件的成品测试，通常在哪几个温度下测？'),
    options: [
      { id: 'a', text: loc('−55 °C、25 °C、125 °C') },
      { id: 'b', text: loc('0 °C、25 °C、70 °C') },
      { id: 'c', text: loc('只在 25 °C') },
      { id: 'd', text: loc('−60 °C、25 °C、150 °C') },
    ],
    answer: 'a',
    explain: loc('军品是 −55 / 25 / 125 °C；0 / 25 / 70 °C 是商用级。对温度敏感的参数要在多个温度下分别保证。'),
  },
  {
    id: 'q3',
    prompt: loc('Memory 测试机为什么用 APG？'),
    options: [
      { id: 'a', text: loc('棋盘格、walking 等图形可以由硬件现场算出来，不必预先存成大量向量') },
      { id: 'b', text: loc('因为 APG 能测微伏级电压') },
      { id: 'c', text: loc('因为存储器没有 DC 参数') },
      { id: 'd', text: loc('因为 APG 比向量存储器更便宜') },
    ],
    answer: 'a',
    explain: loc('存储器的功能图形很有规律，又非常长。APG 每次测试时在硬件里实时生成，而普通数字测试机要把预先生成的向量存在向量存储器里再读出来。'),
  },
  {
    id: 'q4',
    prompt: loc('一颗数字芯片最高 80 MHz、160 个管脚。按教材的分档，量产最合适的是？'),
    options: [
      { id: 'a', text: loc('中端测试机（50–100 MHz，≤ 256 通道）') },
      { id: 'b', text: loc('高端测试机，越快越保险') },
      { id: 'c', text: loc('低端台式测试机') },
      { id: 'd', text: loc('模拟测试机') },
    ],
    answer: 'a',
    explain: loc('台式机最高约 20 MHz，测不了；高端机能测但贵，测试成本过高。中端机刚好覆盖 80 MHz、160 管脚，性能和成本最匹配。'),
  },
  {
    id: 'q5',
    prompt: loc('分选机最少需要几个 Bin？'),
    options: [
      { id: 'a', text: loc('3 个：未测、好品、坏品') },
      { id: 'b', text: loc('2 个：好品、坏品') },
      { id: 'c', text: loc('6 个：按速度和失效类型分') },
      { id: 'd', text: loc('1 个') },
    ],
    answer: 'a',
    explain: loc('未测芯片要有地方放，测完要分好坏，所以至少 3 个。按 DC / AC / 功能或速度档细分是“有了更好”，数量受机器物理尺寸限制。'),
  },
  {
    id: 'q6',
    prompt: loc('现代探针台为什么要做成全封闭？'),
    options: [
      { id: 'a', text: loc('光照会影响某些参数，污染会让参数漂移、器件失效、寿命缩短') },
      { id: 'b', text: loc('为了降低噪音') },
      { id: 'c', text: loc('为了让操作员看不到晶圆') },
      { id: 'd', text: loc('为了省电') },
    ],
    answer: 'a',
    explain: loc('有些测试参数会受光影响而误判失效；器件尺寸越小，污染的危害越大。所以晶圆装在 boat 里整盒进机，全程封闭、自动搬运和对准。'),
  },
]
