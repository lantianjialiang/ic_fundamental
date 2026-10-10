import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type ChainId = 'normal' | 'scan'

export const CHAINS: Array<{ id: ChainId; title: LText; text: LText; diagram: string }> = [
  {
    id: 'normal',
    title: loc('普通逻辑'),
    diagram: 'FF → Logic → FF → Logic → FF',
    text: loc('状态住在 FF 里。中间被组合逻辑挡住，外部 Pin 设不了、也读不到这些 Q。'),
  },
  {
    id: 'scan',
    title: loc('扫描链'),
    diagram: 'SI → FF → FF → FF → FF → SO',
    text: loc('测试模式把 Scan FF 串成移位寄存器。SE=1 时走 SI，状态可以移进、移出。'),
  },
]

export type StepId = 'shift1' | 'capture' | 'shift2' | 'compare'

export const STEPS: Array<{ id: StepId; title: string; text: LText }> = [
  { id: 'shift1', title: 'Shift', text: loc('SE=1。从 SI 移入激励，把内部 FF 置成想要的状态。') },
  { id: 'capture', title: 'Capture', text: loc('SE=0，回到功能时钟，让中间组合逻辑算一拍，结果打进下一组 FF。') },
  { id: 'shift2', title: 'Shift', text: loc('再进入扫描移位，把捕获到的状态从 SO 移出来。') },
  { id: 'compare', title: 'Compare', text: loc('移出的串和期望比。Fail 在链上的某一拍，而不是在一个外部数据脚。') },
]

export const FF_EXPLAIN: LText[] = [
  loc('FF = Flip-Flop，边沿触发的 1 位寄存器。CLK 沿到来时，Q 变成当时的 D；平时 Q 保持。芯片里的“状态”就住在这些 FF 里。'),
  loc('常见脚：D（数据）、CLK（时钟）、Q（输出）。有的还有复位、Qn。它不是组合门：同一组输入，Q 还取决于上一拍存了什么。'),
  loc('它也不是 Latch。Latch 是电平透明（使能有效时 D 直通）；FF 只在沿上采样。{@latch} 的 Latch-up 是闩锁效应，和这种寄存器不是一回事。'),
  loc('Scan FF = 普通 FF 前面加 2 选 1。SE=0 走功能 D，SE=1 走 SI。串起来以后，ATE 才能把内部状态移进、移出。'),
]

export type AdvId = 'mux' | 'multi' | 'comp' | 'speed' | 'bscan' | 'lbist' | 'occ' | 'xmask'

export const ADVANCED: Array<{ id: AdvId; title: string; text: LText; explain: LText[] }> = [
  {
    id: 'mux',
    title: 'Muxed-D Scan',
    text: loc('最常见的实现：每个 FF 的 D 前加 2 选 1。LSSD 是另一路（两级锁存），课上先记 Muxed-D。'),
    explain: [
      loc('SE 选功能 D 还是 SI。工业界大多数标准单元库是这种。'),
      loc('LSSD（Level Sensitive Scan Design）用主从锁存和两相时钟，思想相同：测试时变成可移位。'),
    ],
  },
  {
    id: 'multi',
    title: '多条扫描链',
    text: loc('一根超长链 Shift 太慢。切成许多短链并行移，测试时间按链数下降。'),
    explain: [
      loc('代价是 SI / SO 脚变多，或后面用压缩共用少数几根脚。'),
    ],
  },
  {
    id: 'comp',
    title: 'Scan Compression',
    text: loc('外面只有很少 SI/SO，里面仍是很多短链。用解压 / 压缩逻辑把数据摊开再收拢。'),
    explain: [
      loc('要解决的是：扫描脚不够，但 Shift 时间还是要短。ATE 存的是压缩后的向量。'),
      loc('不讲某家压缩器名字。记住：Pin 少、链多、数据先展开再压回。'),
    ],
  },
  {
    id: 'speed',
    title: 'At-speed Scan',
    text: loc('Capture 用接近功能的快时钟，抓慢路径。Transition Pattern 就靠它。'),
    explain: [
      loc('LOS：移位最后一拍当发射。LOC：功能捕获的第一拍当发射。都是两拍，问“来不来得及”。'),
      loc('慢时钟只能测 stuck-at。速度规格要 at-speed。'),
    ],
  },
  {
    id: 'bscan',
    title: 'Boundary Scan',
    text: loc('IEEE 1149.1 / JTAG。封装脚旁边一圈单元，测板级连线，不是片内某个 AND。'),
    explain: [
      loc('TCK / TMS / TDI / TDO。用来查虚焊、开路、板子走线，和内部 Scan 链目的不同。'),
      loc('同一颗芯片常常两种都有：内部 Scan 交货，Boundary Scan 上板。'),
    ],
  },
  {
    id: 'lbist',
    title: 'Logic BIST',
    text: loc('片上自己出伪随机向量、自己压签名。少依赖 ATE 存海量 Pattern。'),
    explain: [
      loc('PRPG 产生激励，MISR 收响应。ATE 往往只比最后的签名。'),
      loc('覆盖率、X 态处理是它的代价。现场和车规有时更愿意片上自测。'),
    ],
  },
  {
    id: 'occ',
    title: 'OCC',
    text: loc('On-Chip Clocking。片上 PLL 出 at-speed 脉冲，ATE 不必直接送 GHz 功能时钟。'),
    explain: [
      loc('ATE 给慢控制，芯片自己打两拍快时钟做 launch / capture。'),
    ],
  },
  {
    id: 'xmask',
    title: 'X-mask',
    text: loc('有的位不确定（X），不能拿来 Compare。掩掉这些位，避免好芯片被误杀。'),
    explain: [
      loc('未初始化的记忆、三态、异步，都会出 X。压缩后 X 还会扩散，所以高级 Scan 必须谈掩码。'),
    ],
  },
]

export const TAKEAWAY = loc(
  'FF 存状态。外部 Pin 够不到这些 Q，才把 Scan FF 串起来：Shift → Capture → Shift → Compare。压缩、at-speed、BIST 是在这条思想上加约束。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('FF 是什么？'),
    options: [
      { id: 'gate', text: loc('和 AND 一样的组合门') },
      { id: 'reg', text: loc('边沿触发的 1 位寄存器，芯片的状态住在这里') },
      { id: 'lock', text: loc('就是 {@latch} 的 Latch-up') },
      { id: 'pin', text: loc('ATE 的一根电源脚') },
    ],
    answer: 'reg',
    explain: loc('Flip-Flop。CLK 沿把 D 抄到 Q。Latch-up 是闩锁效应，别混。'),
  },
  {
    id: 'q2',
    prompt: loc('为什么需要 Scan？'),
    options: [
      { id: 'pretty', text: loc('让版图更好看') },
      { id: 'reach', text: loc('外部 Pin 够不到内部 FF 的状态') },
      { id: 'voh', text: loc('用来测 VOH') },
      { id: 'bin', text: loc('用来印 Bin 标签') },
    ],
    answer: 'reach',
    explain: loc('组合逻辑挡住了中间寄存器。串成链才能移进激励、移出响应。'),
  },
  {
    id: 'q3',
    prompt: loc('四步的顺序是？'),
    options: [
      { id: 'ok', text: loc('Shift → Capture → Shift → Compare') },
      { id: 'rev', text: loc('Compare → Capture → Shift') },
      { id: 'dc', text: loc('只 Force 电流') },
      { id: 'one', text: loc('只 Compare 一次就够，不用 Shift') },
    ],
    answer: 'ok',
    explain: loc('先把状态搬进去，捕获一拍功能，再搬出来比。'),
  },
  {
    id: 'q4',
    prompt: loc('Capture 在做什么？'),
    options: [
      { id: 'shift', text: loc('继续移位') },
      { id: 'func', text: loc('SE=0，用功能时钟让组合逻辑算一拍') },
      { id: 'power', text: loc('关掉电源') },
      { id: 'bin', text: loc('写 Bin') },
    ],
    answer: 'func',
    explain: loc('没有 Capture，移进移出的只是同一个移位寄存器，测不到中间逻辑。'),
  },
  {
    id: 'q5',
    prompt: loc('Scan Compression 要解决什么？'),
    options: [
      { id: 'voh', text: loc('测输出高电平') },
      { id: 'pin', text: loc('扫描脚少，但仍要很多短链、Shift 要短') },
      { id: 'mem', text: loc('代替 Memory March') },
      { id: 'fix', text: loc('自动修好失效') },
    ],
    answer: 'pin',
    explain: loc('外面少 SI/SO，里面多短链。数据展开再压回。'),
  },
  {
    id: 'q6',
    prompt: loc('Boundary Scan 和内部 Scan 的差别？'),
    options: [
      { id: 'same', text: loc('完全一样，只是名字不同') },
      { id: 'board', text: loc('Boundary Scan 测板级脚和连线；内部 Scan 测片内逻辑') },
      { id: 'fast', text: loc('Boundary Scan 就是 at-speed') },
      { id: 'pmu', text: loc('Boundary Scan 是 PMU') },
    ],
    answer: 'board',
    explain: loc('JTAG 围在封装脚上。片内 AND 的 stuck-at 还是内部链 + ATPG。'),
  },
]
