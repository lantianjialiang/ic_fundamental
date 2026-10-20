import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DQ_COUNT, uiOf, type DdrAnalysis, type DdrState } from './memDdrModel'

export const S = {
  kickerNow: loc('这一次训练', 'This training run'),
  introTitle: loc('读写训练：让 DQS 落在数据窗口的中心', 'Read-write training: put DQS in the centre of the data window'),
  cmdTitle: loc('命令、数据总线与选通', 'Command, data bus and strobe'),
  cmdNote: loc('示意，省略了 CK、Vref 与 ODT 等信号。', 'Schematic only; CK, Vref and ODT signals are omitted.'),
  cmdCa: loc(
    'CA（命令 / 地址）总线：单向，携带 ACT、RD、WR、PRE、REF 等命令和地址。',
    'CA (command / address) bus: one-way, carries commands such as ACT, RD, WR, PRE and REF, plus addresses.',
  ),
  cmdDq: loc(
    'DQ（数据）总线：双向，读时由芯片送出，写时由控制器送出；一个字节通道有 8 根。',
    'DQ (data) bus: bidirectional; the chip drives it on reads and the controller on writes. One byte lane has 8 lines.',
  ),
  cmdDqs: loc(
    'DQS（选通）：与 DQ 同时送出，接收端用它的边沿决定在哪一刻采样 DQ。',
    'DQS (strobe): sent alongside DQ; the receiver uses its edges to decide when to sample DQ.',
  ),
  coreTitle: loc('拨一拨：DQS 延迟 d 与每一位的窗口', 'Try it: DQS delay d and each bit’s window'),
  coreNote: loc(
    '每一行是一根 DQ 数据线。绿色 = 在 d 处能正确采样（PASS），深色 = 采样点落在这一位的窗口之外（FAIL）。金色框是所有位窗口的交集，也就是 8 位能同时 PASS 的范围。',
    'Each row is one DQ line. Green = sampled correctly at d (PASS); dark = the sample falls outside that bit’s window (FAIL). The gold box is the intersection of all windows: the range where all 8 bits pass together.',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  eyeLabel: loc('有效窗口宽 W (UI)', 'Valid window W (UI)'),
  skewLabel: loc('DQ 偏斜 σ (UI)', 'DQ skew σ (UI)'),
  delayLabel: loc('DQS 延迟 d (ps)', 'DQS delay d (ps)'),
  trainBtn: loc('训练：d 设到交集中心', 'Train: set d to the intersection centre'),
  dq0Btn: loc('只按 DQ0 训练', 'Train on DQ0 only'),
  rUi: loc('单位间隔 UI', 'Unit interval UI'),
  rWindow: loc('交集 [左, 右]', 'Intersection [left, right]'),
  rCentre: loc('训练中心 d*', 'Trained centre d*'),
  rMargin: loc('中心裕量（左 = 右）', 'Centre margin (left = right)'),
  rDelta: loc('当前 d 距交集左 / 右边界', 'Current d: distance to left / right edge'),
  rFailBits: loc('当前 d 失效位数', 'Failing bits at current d'),
  rVerdict: loc('判定', 'Verdict'),
  rDq0: loc('只按 DQ0 训练：失效位数', 'Trained on DQ0 only: failing bits'),
  closed: loc('闭合', 'Closed'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的训练还要扫电压参考（Vref）、做写均衡（write leveling）、加入抖动与温度变化，并且逐位做 deskew 补偿；这里只练 DQS 延迟、窗口交集与裕量。',
    'Real training also sweeps the reference voltage (Vref), performs write leveling, includes jitter and temperature drift, and deskews each bit; here we only practise the DQS delay, the window intersection and the margin.',
  ),
  next: loc('下一课：BIST、冗余修复与 ECC', 'Next: BIST, Redundancy Repair and ECC'),
  task1: loc(
    '把 d 扫到窗口之外（FAIL），看清是哪几位失效，记下交集的左右边界。',
    'Move d outside the window (FAIL), see which bits fail, and note the left and right edges of the intersection.',
  ),
  task2: loc(
    '用“训练”按钮把 d 设到交集中心：8 位全部 PASS，左右裕量相等。',
    'Use the train button to set d to the intersection centre: all 8 bits PASS, with equal left and right margins.',
  ),
  task3: loc(
    '用“只按 DQ0 训练”设 d，看有几位失效；它说明为什么要每一位都训练。',
    'Use “train on DQ0 only” and count the failing bits; this shows why every bit has to be trained.',
  ),
  task4: loc('把 DQ 偏斜 σ 加大到 0.12 UI 以上，看交集怎么变窄。', 'Raise DQ skew σ to 0.12 UI or more and watch the intersection narrow.'),
  task5: loc('让窗口闭合（交集为空），再说出它为什么闭合。', 'Close the window (empty intersection) and explain why it closed.'),
}

export const FIG = {
  stripAria: loc('DQ 位 PASS / FAIL 条带图：横轴为 DQS 延迟，纵轴为 8 根数据线', 'PASS / FAIL strip chart: DQS delay on the horizontal axis, eight data lines on the vertical axis'),
  stripCap: loc(
    '横轴是 DQS 延迟 d（0 到一个 UI），纵轴是 DQ0 到 DQ7。绿色表示该位在这个 d 能正确采样。金色框是交集：只有落在框内的 d 才能让 8 位同时 PASS。',
    'Horizontal axis: DQS delay d from 0 to one UI; vertical axis: DQ0 to DQ7. Green means that bit samples correctly at this d. The gold box is the intersection: only a d inside it lets all eight bits pass together.',
  ),
  marginAria: loc('裕量曲线：所有位的最小裕量与 DQ0 单独的裕量', 'Margin curves: the worst-bit margin across all bits and the DQ0-only margin'),
  marginCap: loc(
    '纵轴是裕量（ps），曲线高于 0 的部分是 PASS。金色实线是所有位中最小的那一条（三角形的重叠），蓝色虚线只看 DQ0。两条线的峰值与宽度不同，说明只用一位训练会高估窗口。',
    'Vertical axis: margin in ps; the part above 0 is PASS. The solid gold curve is the smallest margin across all bits; the dashed blue curve is DQ0 alone. Their peaks and widths differ, so training on one bit overestimates the window.',
  ),
  axisDelay: loc('DQS 延迟 d', 'DQS delay d'),
  axisLines: loc('DQ 位', 'DQ bit'),
  marginLabel: loc('裕量 (ps)', 'Margin (ps)'),
}

export const INTRO: LText[] = [
  loc(
    '{@memDram} 讲的是存储单元本身。这一课讲存储器接口：DDR / LPDDR 有三组信号——命令 / 地址总线（CA，携带 ACT、RD、WR、PRE、REF 等命令）、双向数据总线（DQ）和选通（DQS）。DQS 与 DQ 同时送出，接收端用 DQS 的边沿决定在哪一刻采样 DQ。',
    'The {@memDram} lesson covered the cell itself. This one covers the memory interface: DDR and LPDDR have a command / address bus (CA, carrying ACT, RD, WR, PRE, REF and so on), a bidirectional data bus (DQ) and a strobe (DQS). DQS is sent alongside DQ, and the receiver uses its edges to decide when to sample DQ.',
  ),
  loc(
    '数据速率高时，一个 UI 只有几百皮秒；DQ 线的走线长度、延迟和芯片内部的偏差都会让各位的数据窗口错开。读写训练就是找一个 DQS 延迟，让每一位都能在自己的窗口里被采到。这与 {@hsEye} 的眼图是同一个概念：眼宽就是数据窗口。',
    'At high data rates one UI is only a few hundred picoseconds, and DQ trace length, delay and on-chip variation shift each bit’s data window. Read/write training finds a DQS delay that lets every bit be sampled inside its own window. This is the same idea as the eye in {@hsEye}: the eye width is the data window.',
  ),
  loc(
    '这一课要说清三件事：每一位的数据窗口在哪里（逐位扫描）；为什么所有位共用一个 DQS 时，只能取窗口的交集；训练后的左右裕量怎么读。',
    'This lesson covers three things: where each bit’s data window sits (a per-bit scan); why the shared DQS can only use the intersection of the windows; and how to read the left and right margins after training.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '所有位用同一个延迟就行，只训练 DQ0 即可。各位的窗口位置不同，只按 DQ0 训练，在别的位上可能已经落在窗口外。',
    'One delay works for every bit, so training DQ0 is enough. Each bit’s window sits in a different place; training on DQ0 alone can leave another bit outside its window.',
  ),
  loc(
    '取任何一位的窗口都行，只要裕量够大。只有交集才是所有位同时 PASS 的范围；单独一位的窗口在别的位上可能失效。',
    'Any single bit’s window will do as long as its margin is large. Only the intersection is the range where all bits pass together; one bit’s window can fail on the others.',
  ),
  loc(
    '裕量越大越好，所以训练时应该把 d 放在窗口边缘。裕量是到左右边界的距离，中心的左右裕量最均衡；放在边缘，温度或电压一变就会掉出窗口。',
    'More margin is always better, so training should put d near an edge. Margin is the distance to the left and right edges; the centre balances the two. At an edge, a small shift in temperature or voltage drops the sample out of the window.',
  ),
]

export const TAKEAWAY: LText = loc(
  'UI = 1000 ÷ 速率（ps）。每一位的数据窗口以 c_i 为中心、宽 W。整组共用一根 DQS，所以所有位都通过的 d 落在所有窗口的交集里。训练就是找交集的中点，左右裕量相等；交集为空则窗口闭合，要靠降速或改善信号来救。',
  'UI = 1000 ÷ rate (ps). Each bit’s data window is centred at c_i with width W. One DQS is shared by the group, so the d where all bits pass lies in the intersection of all windows. Training finds the midpoint of that intersection, with equal left and right margins; an empty intersection means the window has closed and must be recovered by lowering the rate or improving the signal.',
)

/** 小测数字：Q4 为 d 到交集左右边界的距离（ps），Q5 为速率（Gb/s）；答案由模型算出 */
const Q4_LEFT = 20
const Q4_RIGHT = 60
const Q5_RATE = 6.4

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('读写时，DQS 起什么作用？', 'What does DQS do during reads and writes?'),
    options: [
      { id: 'a', text: loc('传送读写命令', 'It carries the read and write commands') },
      { id: 'b', text: loc('提供采样时刻：接收端用它的边沿决定何时采样 DQ', 'It provides the sampling moment: the receiver uses its edges to decide when to sample DQ') },
      { id: 'c', text: loc('给芯片供电', 'It supplies power to the chip') },
    ],
    answer: 'b',
    explain: loc(
      '命令走 CA 总线。DQS 与 DQ 同时送出（源同步），接收端用 DQS 的边沿采样 DQ。DQS 的延迟不对，采样就会落在数据边沿附近，错误增多。',
      'Commands travel on the CA bus. DQS is sent with DQ (source-synchronous), and the receiver samples DQ on its edges. If the DQS delay is wrong, sampling lands near a data edge and errors rise.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('为什么每一位（DQ）都要单独扫描并训练？', 'Why must each DQ bit be scanned and trained?'),
    options: [
      { id: 'a', text: loc('每一位的走线与内部延迟不同，它的数据窗口位置也不同', 'Each bit has its own trace and internal delay, so its data window sits in a different place') },
      { id: 'b', text: loc('每一位的电压不同，所以要分别供电', 'Each bit has a different voltage, so each needs its own supply') },
      { id: 'c', text: loc('为了让测试时间更长', 'To make the test run longer') },
    ],
    answer: 'a',
    explain: loc(
      '偏斜让各位的窗口错开。只扫一位，别的位可能已经在窗口外；逐位扫描才能知道每一位的窗口在哪里，训练结果也才可靠。',
      'Skew shifts each bit’s window. If you scan only one bit, the others may already be outside their windows; a per-bit scan is what reveals where each window is, so the training result can be trusted.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('要让所有位同时 PASS，DQS 的延迟应该落在哪里？', 'For all bits to PASS together, where must the DQS delay sit?'),
    options: [
      { id: 'a', text: loc('所有位窗口的并集', 'The union of all bits’ windows') },
      { id: 'b', text: loc('所有位窗口的交集', 'The intersection of all bits’ windows') },
      { id: 'c', text: loc('任意一位的窗口中心', 'The centre of any one bit’s window') },
    ],
    answer: 'b',
    explain: loc(
      'DQS 整组共用，只有同时落在每一位窗口里的 d 才能让所有位都通过，这就是交集。并集里可能有的位在窗口外，而单独一位的中心在别的位上也可能失效。',
      'DQS is shared by the group, so only a d that lies inside every bit’s window passes all bits: that is the intersection. The union can include points outside some bits’ windows, and any single bit’s centre can fail on the others.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `当前 d 距交集左边界 ${Q4_LEFT} ps，距右边界 ${Q4_RIGHT} ps。要让左右裕量最均衡，d 应该往哪边移、移多少？`,
      `The current d is ${Q4_LEFT} ps from the left edge of the intersection and ${Q4_RIGHT} ps from the right edge. To balance the margins, which way should d move, and by how much?`,
    ),
    options: [
      { id: 'a', text: loc(`往右移 ${(Q4_RIGHT - Q4_LEFT) / 2} ps`, `Right by ${(Q4_RIGHT - Q4_LEFT) / 2} ps`) },
      { id: 'b', text: loc(`往左移 ${(Q4_RIGHT - Q4_LEFT) / 2} ps`, `Left by ${(Q4_RIGHT - Q4_LEFT) / 2} ps`) },
      { id: 'c', text: loc('不动，左右裕量已经相等', 'Stay put; the margins are already equal') },
    ],
    answer: 'a',
    explain: loc(
      `交集宽 ${Q4_LEFT + Q4_RIGHT} ps，中心在左边界右侧 ${(Q4_LEFT + Q4_RIGHT) / 2} ps 处，也就是 d 右移 ${(Q4_RIGHT - Q4_LEFT) / 2} ps。移完后左右裕量都是 ${(Q4_LEFT + Q4_RIGHT) / 2} ps。`,
      `The intersection is ${Q4_LEFT + Q4_RIGHT} ps wide, so its centre is ${(Q4_LEFT + Q4_RIGHT) / 2} ps from the left edge, which means moving d right by ${(Q4_RIGHT - Q4_LEFT) / 2} ps. After the move both margins are ${(Q4_LEFT + Q4_RIGHT) / 2} ps.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(`数据速率为 ${Q5_RATE} Gb/s 时，一个 UI 是多少？`, `At a data rate of ${Q5_RATE} Gb/s, how long is one UI?`),
    options: [
      { id: 'a', text: loc(`${(1000 * Q5_RATE).toFixed(0)} ps`, `${(1000 * Q5_RATE).toFixed(0)} ps`) },
      { id: 'b', text: loc(`${(1000 / Q5_RATE / 10).toFixed(1)} ps`, `${(1000 / Q5_RATE / 10).toFixed(1)} ps`) },
      { id: 'c', text: loc(`${uiOf(Q5_RATE).toFixed(2)} ps`, `${uiOf(Q5_RATE).toFixed(2)} ps`) },
    ],
    answer: 'c',
    explain: loc(
      `UI = 1 ÷ 速率 = 1000 ÷ ${Q5_RATE} = ${uiOf(Q5_RATE).toFixed(2)} ps。速率越高，UI 越短，窗口能用的时间就越少。`,
      `UI = 1 ÷ rate = 1000 ÷ ${Q5_RATE} = ${uiOf(Q5_RATE).toFixed(2)} ps. The higher the rate, the shorter the UI, and the less time each window has.`,
    ),
  },
]

/** 右侧说明栏：根据训练结果给结论和原因 */
export function verdictOf(a: DdrAnalysis): { title: LText; text: LText } {
  const delay = a.delay.toFixed(0)
  if (!a.open) {
    const offset = Math.abs(a.centres[a.worstBit] - a.ui / 2).toFixed(0)
    return {
      title: S.fail,
      text: loc(
        `没有任何一个 d 能让 ${DQ_COUNT} 位同时 PASS：窗口之间的交集是空的。偏斜最大的是 DQ${a.worstBit}，它的中心离 UI / 2 偏了 ${offset} ps，而半窗口只有 ${a.half.toFixed(0)} ps。偏斜超过半窗口，两边的窗口就对不上了；要减小偏斜，或加宽窗口（降速或改善信号）。`,
        `No d lets all ${DQ_COUNT} bits pass together: the windows have no common intersection. The largest skew is DQ${a.worstBit}, whose centre sits ${offset} ps from UI / 2, while the half-window is only ${a.half.toFixed(0)} ps. Once the skew exceeds the half-window the windows no longer overlap; reduce the skew, or widen the window by lowering the rate or improving the signal.`,
      ),
    }
  }
  const left = (a.delay - a.lo).toFixed(0)
  const right = (a.hi - a.delay).toFixed(0)
  const centre = a.trained.toFixed(0)
  if (a.allPass) {
    return {
      title: S.pass,
      text: loc(
        `d = ${delay} ps 时 ${DQ_COUNT} 位全部 PASS。交集是 [${a.lo.toFixed(0)}, ${a.hi.toFixed(0)}] ps，中心在 ${centre} ps；d 到左、右边界分别是 ${left} ps 和 ${right} ps。`,
        `At d = ${delay} ps all ${DQ_COUNT} bits PASS. The intersection is [${a.lo.toFixed(0)}, ${a.hi.toFixed(0)}] ps with its centre at ${centre} ps; d is ${left} ps from the left edge and ${right} ps from the right edge.`,
      ),
    }
  }
  const outside = Math.abs(a.delay < a.lo ? a.lo - a.delay : a.delay - a.hi).toFixed(0)
  const side: LText =
    a.delay < a.lo
      ? loc(`交集左侧 ${outside} ps`, `${outside} ps left of the intersection`)
      : loc(`交集右侧 ${outside} ps`, `${outside} ps right of the intersection`)
  return {
    title: S.fail,
    text: loc(
      `d = ${delay} ps 时有 ${a.failBits} 位失效：d 落在${side.zh}，至少有一位的窗口不包含它。把 d 移到交集中心 ${centre} ps，所有位就能同时通过。`,
      `At d = ${delay} ps, ${a.failBits} bits fail: d sits ${side.en ?? side.zh}, so at least one bit’s window does not contain it. Moving d to the intersection centre at ${centre} ps lets all bits pass together.`,
    ),
  }
}

/** 任务卡：完成与否由当前设置与训练结果算出 */
export function taskItems(state: DdrState, a: DdrAnalysis): TaskItem[] {
  return [
    { id: 'scan', text: S.task1, done: a.open && !a.allPass },
    { id: 'train', text: S.task2, done: a.open && a.allPass && Math.abs(a.delay - a.trained) <= 1 },
    { id: 'dq0', text: S.task3, done: Math.abs(a.delay - a.dq0Centre) <= 1 && a.dq0FailBits > 0 },
    { id: 'skew', text: S.task4, done: state.skew >= 0.12 },
    { id: 'closed', text: S.task5, done: !a.open },
  ]
}