import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const POW2 = [
  { bits: 2, count: '4', note: loc('XOR 可以当场穷举。') },
  { bits: 8, count: '256', note: loc('一个字节的输入组合。') },
  { bits: 16, count: '65 536', note: loc('已经不适合人手写。') },
  { bits: 32, count: '4 294 967 296', note: loc('按 1 µs 一条，大约 72 分钟只跑完组合一次；顺序逻辑再乘状态，覆盖率仍没有保证。') },
]

export type ConceptId = 'func' | 'algo' | 'fault' | 'stuck' | 'tran' | 'atpg' | 'dft' | 'scan'

export const CONCEPTS: Array<{ id: ConceptId; title: string; text: LText; explain: LText[] }> = [
  {
    id: 'func',
    title: 'Functional Pattern',
    text: loc('按功能 / 真值表写的向量。上一课的 XOR 四行就是。'),
    explain: [
      loc('人按“芯片该干什么”写：输入 01，输出该是 1。不问某个门粘没粘住。'),
      loc('交货时功能向量仍然要跑。它证明规格，不证明故障覆盖率。'),
    ],
  },
  {
    id: 'algo',
    title: 'Algorithmic Pattern',
    text: loc('规则阵列上现场算下一拍，不预先存全部。Memory March 是典型。'),
    explain: [
      loc('对象是规则结构：Memory 的地址连续、读写动作重复。没有“每个门搜一组输入”这回事。'),
      loc('做法是写算法。例如 March：从低地址到高地址写 0，再读 0 写 1。ATE 的算法引擎按地址算出下一拍。'),
      loc('256 Mbit 不能先存 2²⁸ 条向量。时间、容量都要求边跑边生成。'),
      loc('和 ATPG 的分界：这里靠阵列规律；ATPG 靠门级网表和故障列表。两者都不是手写真值表，但不是一种工具。'),
    ],
  },
  {
    id: 'fault',
    title: 'Fault Model',
    text: loc('我们假设电路会怎样坏。没有模型，就不知道“测完了”是什么意思。'),
    explain: [
      loc('真实失效有开路、桥接、太慢、接触不良。模型是故意简化，才能数覆盖率。'),
      loc('Stuck-at、Transition 是数字逻辑最常用的两套。Memory 另有耦合、地址译码，那是算法侧的模型。'),
    ],
  },
  {
    id: 'stuck',
    title: 'Stuck-at Fault',
    text: loc('某节点粘在 0 或 1。最常用的结构故障模型。看下面的 AND 例子。'),
    explain: [
      loc('例子：AND 的输出 Y 粘在 1。好电路在 A=1、B=0 时 Y 该是 0；坏了则永远是 1。一条 Pattern「10 → 期望 0」就能分开好/坏。'),
      loc('若 Y 粘在 0：要让好电路的 Y=1，所以用 A=1、B=1，期望 1。坏了采到 0。'),
      loc('EDA 工具怎么出这条向量：读门级网表 → 每个节点列出 s-a-0 / s-a-1 → 对这一条故障做三件事：激活（好电路上该点与粘死值相反）、传播（敏化一条路到输出脚或 Scan FF）、反推（把路径两侧输入配齐）。找到就留下 Pattern，等价故障一起丢掉。'),
      loc('覆盖率 = 已检出故障 / 可测故障。不是“真值表跑完了”。Y 若被后面的门挡住，还要把侧输入打成让故障能穿过去的值。'),
    ],
  },
  {
    id: 'tran',
    title: 'Transition Fault',
    text: loc('该跳变时跳不动。比 stuck-at 更靠近速度。需要成对的向量。'),
    explain: [
      loc('例子：还是那个 AND 的 Y，慢升（slow-to-rise）。先拍 V1：A=0、B=1，把 Y 放到 0。再拍 V2：A=1、B=1，Y 该从 0 升到 1。用接近功能的周期做 Capture。若 Y 升得太慢，采到的仍是 0。'),
      loc('所以 Transition Pattern 是一对，不是一条静态向量。Stuck-at 只问电平对不对；Transition 还问“这一拍里来不来得及”。'),
      loc('工具怎么出：先按 stuck-at 的路径找到能让 Y 跳的输入，再拆成初始化 + 发射（launch）两拍，最后用 at-speed 时钟 Capture。发射可以在移位最后一拍（LOS）或捕获的第一拍（LOC），名字下一课立。'),
      loc('规格链：Datasheet 的速度 → 选 Transition / at-speed 方法 → ATE 按两拍时序回放 → 和期望比。'),
    ],
  },
  {
    id: 'atpg',
    title: 'ATPG',
    text: loc('按门级网表和故障模型自动搜向量。人不手写 2³²。不是 Memory 算法。'),
    explain: [
      loc('Automatic Test Pattern Generation。输入是网表 + 故障列表，输出是 Pattern 文件，给 ATE 回放。'),
      loc('和 Algorithmic 的差别：ATPG 面向不规则逻辑门，预先搜好再存下来；Algorithmic 面向规则阵列，测试时按地址现场算。ATPG 不走 Memory March，March 也不对每个 AND 列 s-a-1。'),
      loc('搜的目标：让好电路和带故障的电路，在某个可观察点（输出脚或 Scan FF）上值不同。这就是激活 + 传播。'),
      loc('没有 DFT（尤其是 Scan），内部触发器的状态搜爆，ATPG 对顺序电路几乎做不动。工具出向量，DFT 先改电路。'),
    ],
  },
  {
    id: 'dft',
    title: 'DFT',
    text: loc('Design For Testability：设计时加结构，测试才做得成、做得快。'),
    explain: [
      loc('DFT 不是又一种 Pattern，是改芯片。最要紧的一件事：给触发器加上扫描通路，让内部状态能移进、移出。'),
      loc('还有测试点、压缩、Logic BIST、边界扫描。目的都是：可控制、可观察、时间受得了。'),
      loc('和 ATPG 的关系：DFT 先改网表，ATPG 再对改过的网表出向量。没有 Scan，工具不是“更聪明”，是根本搜不到。'),
      loc('和 Algorithmic 的关系：Memory 的可测性常常是 BIST / 冗余，不是给每个单元跑 ATPG。'),
    ],
  },
  {
    id: 'scan',
    title: 'Scan',
    text: loc('把内部触发器串起来才能测到。下一课拆四步，并立高级 Scan 的名字。'),
    explain: [
      loc('普通 FF 的 D 来自组合逻辑，外部脚设不了、也读不到中间状态。Scan 把它们串成移位寄存器。'),
      loc('ATPG 假设这条链已经在。下一课先认 FF，再走 Shift → Capture → Shift → Compare。'),
    ],
  },
]

export const TAKEAWAY = loc(
  '32 个输入也不能靠穷举交货：时间耗尽，覆盖率仍对故障模型没有保证。Algorithmic 走阵列规律，ATPG 走门级故障，DFT 让后两者做得成。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 32 个输入的组合逻辑也不能靠穷举交货？'),
    options: [
      { id: 'lazy', text: loc('只是工程师嫌麻烦') },
      { id: 'time', text: loc('向量数量把测试时间撑爆，而且穷举也不等于故障覆盖率') },
      { id: 'ate', text: loc('ATE 插不上 32 根脚') },
      { id: 'xor', text: loc('XOR 超过两输入就不存在') },
    ],
    answer: 'time',
    explain: loc('2³² ≈ 43 亿条。时间是硬约束；即便跑完，stuck-at / transition 仍可能没被激活。'),
  },
  {
    id: 'q2',
    prompt: loc('ATPG 和 Algorithmic Pattern 差在哪？'),
    options: [
      { id: 'same', text: loc('没有差别，都是自动出向量') },
      { id: 'diff', text: loc('ATPG 对门级故障预先搜 Pattern；Algorithmic 对规则阵列现场按算法算') },
      { id: 'bin', text: loc('ATPG 用来打印 Bin') },
      { id: 'dc', text: loc('Algorithmic 就是测 VOH') },
    ],
    answer: 'diff',
    explain: loc('Memory March 不列每个 AND 的 s-a-1；ATPG 也不按地址 ++。对象和生成时机都不同。'),
  },
  {
    id: 'q3',
    prompt: loc('AND 输出 Y 粘在 1，常用哪条向量把它和好好电路分开？'),
    options: [
      { id: '11', text: loc('A=1 B=1，期望 Y=1') },
      { id: '10', text: loc('A=1 B=0（或 0 1），期望 Y=0；坏了则仍是 1') },
      { id: 'xx', text: loc('随便一组输入都行') },
      { id: 'clk', text: loc('只加快时钟') },
    ],
    answer: '10',
    explain: loc('粘在 1 时，好电路必须被驱动到 0，Compare 才分得出好坏。11 时好、坏都是 1，测不到。'),
  },
  {
    id: 'q4',
    prompt: loc('DFT 是做什么的？'),
    options: [
      { id: 'pat', text: loc('又一种 Pattern 格式') },
      { id: 'des', text: loc('设计时加结构（尤其是 Scan），让测试做得成') },
      { id: 'fix', text: loc('修好失效芯片') },
      { id: 'ate', text: loc('ATE 的电源模块') },
    ],
    answer: 'des',
    explain: loc('Design For Testability。ATPG 出向量，DFT 先改电路。'),
  },
  {
    id: 'q5',
    prompt: loc('Transition Fault 的 Pattern 为什么常常是一对？'),
    options: [
      { id: 'pretty', text: loc('工具喜欢偶数') },
      { id: 'pair', text: loc('先初始化，再发射跳变，并用快时钟 Capture') },
      { id: 'dc', text: loc('其实一条静态向量就够') },
      { id: 'mem', text: loc('因为 Memory March 必须成对') },
    ],
    answer: 'pair',
    explain: loc('慢升/慢降问的是“这一拍来不来得及”，必须先放到旧值，再打新值。'),
  },
  {
    id: 'q6',
    prompt: loc('Scan 在这一课讲到哪？'),
    options: [
      { id: 'tool', text: loc('已经会用 DFT 工具') },
      { id: 'name', text: loc('知道要把内部 FF 串起来；四步和高级 Scan 下一课拆') },
      { id: 'mem', text: loc('Scan 就是 Memory March') },
      { id: 'dc', text: loc('Scan 就是测 VOH') },
    ],
    answer: 'name',
    explain: loc('名字先就位。Shift / Capture 和压缩、at-speed 留给下一课。'),
  },
]
