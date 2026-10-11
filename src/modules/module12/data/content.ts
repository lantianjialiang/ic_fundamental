import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/* ---------------- 第一段：测试流程 ---------------- */

export type TestId = 'os' | 'idd' | 'func' | 'dc' | 'ac'

/** 一条 Test Item 的四件套：条件 + 向量 + 极限 + Fail Bin */
export type TestItem = {
  id: TestId
  name: LText
  short: string
  cond: LText
  vec: LText
  limit: LText
  bin: number
  why: LText
}

export const TESTS: TestItem[] = [
  {
    id: 'os',
    name: loc('开短路', 'Opens / shorts'),
    short: 'O/S',
    cond: loc('VDD = 0 V，每个信号脚抽 100 µA', 'VDD = 0 V, pull 100 µA from each signal pin'),
    vec: loc('不用向量', 'No vectors'),
    limit: loc('−1.5 V ≤ V ≤ −0.2 V', '−1.5 V ≤ V ≤ −0.2 V'),
    bin: 6,
    why: loc(
      '最先做，而且不上电：管脚没接好，后面每一项都不可信，还可能烧坏芯片。',
      'Done first and unpowered: if a pin is not connected, every later test is meaningless and may even damage the chip.',
    ),
  },
  {
    id: 'idd',
    name: loc('上电 / IDD', 'Power-up / IDD'),
    short: 'IDD',
    cond: loc('按顺序上电，VDD = 5.0 V', 'Power up in sequence, VDD = 5.0 V'),
    vec: loc('一小段预置向量', 'A short preconditioning pattern'),
    limit: loc('IDD ≤ 10 mA', 'IDD ≤ 10 mA'),
    bin: 5,
    why: loc(
      '电源电流先粗查一遍：电源对地短路的芯片，在这里就停下。',
      'A gross check of supply current: a chip with a power-to-ground short stops here.',
    ),
  },
  {
    id: 'func',
    name: loc('功能', 'Functional'),
    short: 'FUNC',
    cond: loc('VDD min 与 max，标称时序', 'VDD min and max, nominal timing'),
    vec: loc('全部功能向量', 'All functional vectors'),
    limit: loc('每个 Strobe 都等于期望值', 'Every strobe matches the expected data'),
    bin: 4,
    why: loc(
      '芯片会不会「算对」。向量和 Strobe 详见 {@func}。',
      'Does the chip compute correctly? Vectors and strobes are in {@func}.',
    ),
  },
  {
    id: 'dc',
    name: loc('DC 参数', 'DC parametrics'),
    short: 'DC',
    cond: loc('VDD max，IOH = −1 mA', 'VDD max, IOH = −1 mA'),
    vec: loc('把输出设成 1 或 0 的向量', 'Vectors that set outputs to 1 or 0'),
    limit: loc('VOH ≥ 2.4 V，|IIL|、|IIH| ≤ 1 µA', 'VOH ≥ 2.4 V, |IIL| and |IIH| ≤ 1 µA'),
    bin: 3,
    why: loc(
      '电平和漏电够不够规格。测法详见 {@dc}。',
      'Are output levels and leakage within spec? Methods are in {@dc}.',
    ),
  },
  {
    id: 'ac',
    name: loc('AC 参数', 'AC parametrics'),
    short: 'AC',
    cond: loc('规格频率，规格时序', 'Spec frequency and timing'),
    vec: loc('走关键路径的向量', 'Vectors that exercise critical paths'),
    limit: loc('tPD ≤ 10 ns', 'tPD ≤ 10 ns'),
    bin: 2,
    why: loc(
      '来不来得及。Setup / Hold / tPD 详见 {@timing}。',
      'Is it fast enough? Setup, hold and tPD are in {@timing}.',
    ),
  },
]

export type FailPick = TestId | 'none'

export const FAIL_OPTIONS: Array<{ id: FailPick; label: LText }> = [
  { id: 'none', label: loc('全部 Pass', 'All pass') },
  ...TESTS.map((item) => ({ id: item.id as FailPick, label: item.name })),
]

/** 芯片此刻在哪：start = 刚装上；test = 正在测第 i 项；bin = 落进某个 Bin */
export type FlowFrame = { at: 'start' } | { at: 'test'; i: number; pass: boolean } | { at: 'bin'; bin: number; from: number | null }

export function flowFrames(fail: FailPick): FlowFrame[] {
  const frames: FlowFrame[] = [{ at: 'start' }]
  for (let i = 0; i < TESTS.length; i += 1) {
    const pass = TESTS[i].id !== fail
    frames.push({ at: 'test', i, pass })
    if (!pass) {
      frames.push({ at: 'bin', bin: TESTS[i].bin, from: i })
      return frames
    }
  }
  frames.push({ at: 'bin', bin: 1, from: null })
  return frames
}

export const FLOW_TEXT = {
  start: loc(
    '分选机（或探针台）把一颗芯片送到测试位，测试程序从 Flow 第一项开始。',
    'The handler (or prober) puts one chip in the test site, and the program starts at the first item of the flow.',
  ),
  pass: loc('Pass，进入下一项。', 'Pass. On to the next item.'),
  fail: loc('Fail。量产里 Fail 即停，不再测后面的项。', 'Fail. In production the flow stops at the first failure.'),
  binFail: loc(
    '分到 Bin {bin}：分选机把它放进这个料盒，测试汇总里这一项的 Fail 数加 1。Bin 号告诉你它是在哪一项挂的。',
    'Sorted to bin {bin}: the handler drops it in that bin and the summary adds one failure for this item. The bin number tells you where it failed.',
  ),
  binPass: loc(
    '每一项都 Pass，进 Bin 1（良品）。',
    'Every item passed, so it goes to bin 1 (good parts).',
  ),
}

/* ---------------- 第二段：排错案例 ---------------- */

export type CaseId = 'all' | 'pin' | 'freq'

export const CASES: Array<{
  id: CaseId
  title: LText
  scene: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
  order: LText
}> = [
  {
    id: 'all',
    title: loc('案例 1：所有芯片都 Fail', 'Case 1: every chip fails'),
    scene: loc(
      '换了好几颗芯片，同一项全都 Fail。',
      'You tried several chips and all of them fail the same test.',
    ),
    options: [
      { id: 'dut', text: loc('这批芯片全坏了', 'The whole lot is bad') },
      {
        id: 'common',
        text: loc(
          '先查所有芯片共用的东西：电源、管脚映射、负载板 / Socket、测试机',
          'Check what all chips share first: power, pin map, load board / socket, tester',
        ),
      },
      { id: 'logic', text: loc('芯片里的 XOR 设计反了', 'The XOR in the chip design is inverted') },
      { id: 'scrap', text: loc('直接报废这批货', 'Scrap the lot right away') },
    ],
    answer: 'common',
    explain: loc(
      '每颗都在同一项挂，更像是大家共用的某样东西坏了，而不是每颗芯片「约好」一起坏。',
      'When every chip fails the same item, something they all share is far more likely to be wrong than every chip failing at once.',
    ),
    order: loc(
      '建议顺序：电源 → 管脚映射 → 负载板 / Socket → 测试机 → 电平 / 时序 / 向量 → 最后才怀疑芯片。',
      'Suggested order: power → pin map → load board / socket → tester → levels / timing / vectors → the chip last.',
    ),
  },
  {
    id: 'pin',
    title: loc('案例 2：只有一个 Pin Fail', 'Case 2: only one pin fails'),
    scene: loc(
      '其他管脚都 Pass，只有同一根管脚每次都 Fail。',
      'All other pins pass; the same single pin fails every time.',
    ),
    options: [
      { id: 'all', text: loc('整台测试机坏了', 'The whole tester is broken') },
      {
        id: 'path',
        text: loc(
          '沿这一根脚的路径查：测试机通道 → 负载板走线 → Socket → 芯片管脚',
          'Follow this one pin: tester channel → load board trace → socket → chip pin',
        ),
      },
      { id: 'vdd', text: loc('一定是 VDD 规格写错了', 'The VDD spec must be wrong') },
      { id: 'scan', text: loc('一定是扫描链断了', 'The scan chain must be broken') },
    ],
    answer: 'path',
    explain: loc(
      '单根脚 Fail，把问题缩到一条物理路径上。这条路径在 {@connection} 里走过一遍。',
      'A single failing pin narrows the problem to one physical path, the one traced in {@connection}.',
    ),
    order: loc(
      '建议顺序：确认是哪根脚 → 通道和映射 → 负载板走线 → Socket 触点 → 最后才是这颗芯片的这根脚。换一颗芯片还在同一根脚 Fail，基本就不是芯片。',
      'Suggested order: confirm the pin → channel and mapping → load board trace → socket contact → this pin of this chip last. If a different chip fails on the same pin, it is almost never the chip.',
    ),
  },
  {
    id: 'freq',
    title: loc('案例 3：100 MHz 全 Fail，80 MHz 全 Pass', 'Case 3: all fail at 100 MHz, all pass at 80 MHz'),
    scene: loc('同一套向量，只改了频率。', 'Same vectors; only the frequency changed.'),
    options: [
      { id: 'dead', text: loc('芯片逻辑功能全错', 'The chip logic is completely wrong') },
      {
        id: 'speed',
        text: loc(
          '速度问题：时序设置、传输延迟或信号完整性，来不及',
          'A speed problem: timing setup, propagation delay or signal integrity',
        ),
      },
      { id: 'open', text: loc('全部管脚开路', 'Every pin is open') },
      { id: 'bin', text: loc('Bin 号写反了', 'The bin numbers are swapped') },
    ],
    answer: 'speed',
    explain: loc(
      '80 MHz 能 Pass，说明功能本身没问题。频率一高就挂，是「来不及」，先回 {@timing} 查 Strobe 位置和 tPD。',
      'Passing at 80 MHz shows the logic works. Failing only at higher speed means "not fast enough": check strobe placement and tPD from {@timing}.',
    ),
    order: loc(
      '建议顺序：确认周期和 Strobe 设置 → VDD 是否在规格边上 → 负载板高频路径 → 最后才问芯片的 fMAX。',
      'Suggested order: check period and strobe settings → is VDD near its limit → load board high-speed paths → finally the chip’s fMAX.',
    ),
  },
]

/* ---------------- 文字 ---------------- */

export const L = {
  introTitle: loc('测试程序 = 一张 Flow + 一条条 Test Item', 'Test program = a flow + test items'),
  introBody: loc(
    '测试程序就是一张流程图：芯片从第一项测到最后一项，任何一项 Fail 就停下，按 Fail 的那一项分到对应的 Bin。每个 Test Item 都由四件套组成：条件（电压、时序、负载）+ 向量 + 极限 + Fail Bin。三种程序、上下电顺序、怎么从规格书写出程序，详见 {@fProgram} 和 {@fCreate}。',
    'A test program is a flow chart: the chip runs from the first item to the last, stops at the first failure and is sorted into the bin for that item. Every test item has four parts: conditions (voltage, timing, load) + vectors + limits + a fail bin. Program types, power sequencing and writing a program from the datasheet are in {@fProgram} and {@fCreate}.',
  ),
  flowTitle: loc('一颗芯片走过 Flow', 'One chip through the flow'),
  flowNote: loc(
    '先选「哪一项会 Fail」，再一步步看芯片怎么走、最后进哪个 Bin。',
    'Pick which item will fail, then step through to see where the chip goes and which bin it lands in.',
  ),
  failPick: loc('让它挂在：', 'Make it fail at:'),
  colCond: loc('条件', 'Conditions'),
  colVec: loc('向量', 'Vectors'),
  colLimit: loc('极限', 'Limits'),
  colBin: loc('Fail Bin', 'Fail bin'),
  start: loc('装片', 'Load'),
  good: loc('良品', 'Good'),
  failWord: loc('Fail', 'Fail'),
  sep: loc('：', ': '),
  flowCap: loc(
    '上面一行是 Pass 的路，每项下面是它的 Fail Bin。金框是芯片此刻所在的测试项。',
    'The top row is the pass path; under each item is its fail bin. The gold box is the item being tested now.',
  ),
  debugTitle: loc('程序「不工作」：先怀疑谁', 'When the program "does not work": what to suspect'),
  debugBody: loc(
    'Fail 了有四个嫌疑对象：测试程序、测试机、接口硬件（负载板、Socket、针卡）、芯片本身。先查便宜又能一次排除最多的，不要一上来就怪芯片。完整的排错方法和调试工具详见 {@fDebug}。',
    'A failure has four suspects: the test program, the tester, the interface hardware (load board, socket, probe card) and the chip itself. Check what is cheapest and rules out the most first; do not blame the chip first. The full debug method and tools are in {@fDebug}.',
  ),
  caseNote: loc('每个案例先选你认为最可能的原因。', 'For each case, pick the most likely cause.'),
  latch: loc(
    '电流突然飙高、断电才恢复？可能是闩锁（Latch-up），见 {@latch}。',
    'Current suddenly shoots up and only recovers after power-off? It may be latch-up; see {@latch}.',
  ),
  takeawayTitle: loc('本课要点', 'Key points'),
  quizTitle: loc('复习题', 'Review'),
  quizNote: loc('选完立刻出对错和解释。', 'You get the answer and explanation right away.'),
  yes: loc('对。', 'Correct. '),
  no: loc('不对。', 'Not quite. '),
  kickerFlow: loc('Flow', 'Flow'),
  kickerCase: loc('排错案例', 'Debug case'),
}

export const TAKEAWAY: LText[] = [
  loc(
    '测试程序是一张 Flow：开短路 → 上电 / IDD → 功能 → DC → AC，任何一项 Fail 即停，分到这一项的 Bin。',
    'A test program is a flow: opens/shorts → power-up / IDD → functional → DC → AC. It stops at the first failure and bins the chip by that item.',
  ),
  loc('每个 Test Item = 条件 + 向量 + 极限 + Fail Bin。', 'Each test item = conditions + vectors + limits + fail bin.'),
  loc(
    '排错先查共用的东西：全部 Fail 查系统，单 Pin Fail 查这一条路径，只在高频 Fail 查时序。',
    'Debug shared things first: all fail → check the system; one pin → check that path; only at high speed → check timing.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么开短路通常排在 Flow 的最前面？', 'Why are opens/shorts usually first in the flow?'),
    options: [
      { id: 'habit', text: loc('只是习惯', 'Just habit') },
      {
        id: 'base',
        text: loc('管脚没接好，后面每一项结果都不可信', 'If a pin is not connected, no later result can be trusted'),
      },
      { id: 'fast', text: loc('它能代替功能测试', 'It replaces functional testing') },
      { id: 'bin', text: loc('它决定 Bin 1', 'It decides bin 1') },
    ],
    answer: 'base',
    explain: loc(
      '先确认每根脚都接上了，再上电测别的。否则 Fail 了也分不清是芯片还是接触。',
      'Confirm every pin is connected before powering up. Otherwise you cannot tell a bad chip from a bad contact.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('一条 Test Item 由哪几件组成？', 'What makes up one test item?'),
    options: [
      { id: 'ok', text: loc('条件 + 向量 + 极限 + Fail Bin', 'Conditions + vectors + limits + fail bin') },
      { id: 'bin', text: loc('只有 Bin 号', 'Only a bin number') },
      { id: 'pcb', text: loc('负载板图纸', 'The load board drawing') },
      { id: 'api', text: loc('某一家测试机的函数名', 'One tester vendor’s function names') },
    ],
    answer: 'ok',
    explain: loc(
      '在什么条件下、跑什么向量、和什么极限比、Fail 了去哪个 Bin。',
      'Under what conditions, with which vectors, against which limits, and which bin on failure.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('量产中一颗芯片在功能测试 Fail，接下来通常怎样？', 'In production a chip fails the functional test. What usually happens next?'),
    options: [
      { id: 'cont', text: loc('继续把后面的 DC、AC 都测完', 'Finish the DC and AC tests anyway') },
      { id: 'stop', text: loc('停止测试，分到功能测试对应的 Fail Bin', 'Stop and sort it into the functional fail bin') },
      { id: 'retest', text: loc('无限次重测直到 Pass', 'Retest until it passes') },
      { id: 'bin1', text: loc('放进 Bin 1', 'Put it in bin 1') },
    ],
    answer: 'stop',
    explain: loc(
      'Fail 即停省测试时间。Bin 号记录它挂在哪一项。',
      'Stopping at the first failure saves test time. The bin number records which item failed.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('所有芯片同一项都 Fail，为什么不先判「芯片全坏」？', 'Every chip fails the same item. Why not conclude the chips are all bad?'),
    options: [
      { id: 'never', text: loc('芯片永远不会坏', 'Chips never fail') },
      {
        id: 'share',
        text: loc(
          '共用的东西（电源、负载板、Socket、映射、程序）能一次解释全部失败',
          'Something shared (power, load board, socket, pin map, program) explains every failure at once',
        ),
      },
      { id: 'xor', text: loc('因为一定是 XOR 设计错', 'It must be an XOR design bug') },
      { id: 'scrap', text: loc('应该先报废', 'Scrap them first') },
    ],
    answer: 'share',
    explain: loc('一颗坏有可能。一连串都在同一项挂，先怀疑自己的测试系统。', 'One bad chip is possible. A whole row failing the same item points at your test setup.'),
  },
  {
    id: 'q5',
    prompt: loc('只有一根管脚 Fail，优先查什么？', 'Only one pin fails. What do you check first?'),
    options: [
      { id: 'all', text: loc('整台测试机重新校准', 'Recalibrate the whole tester') },
      { id: 'one', text: loc('这一根脚的路径：通道 → 负载板走线 → Socket → 芯片管脚', 'That pin’s path: channel → load board trace → socket → chip pin') },
      { id: 'scan', text: loc('改扫描链压缩比', 'Change the scan compression ratio') },
      { id: 'yield', text: loc('改良率公式', 'Change the yield formula') },
    ],
    answer: 'one',
    explain: loc('问题已经缩到一条物理路径，沿着它一段段排除。', 'The problem is narrowed to one physical path; rule it out piece by piece.'),
  },
  {
    id: 'q6',
    prompt: loc('低频 Pass、高频 Fail，更像什么问题？', 'Passes at low speed, fails at high speed. What kind of problem is that?'),
    options: [
      { id: 'truth', text: loc('逻辑功能写反', 'Inverted logic') },
      { id: 'ac', text: loc('来不及：时序设置、tPD 或信号完整性', 'Not fast enough: timing setup, tPD or signal integrity') },
      { id: 'name', text: loc('芯片型号印错', 'Wrong part marking') },
      { id: 'os', text: loc('一定是开短路失败', 'It must be an opens/shorts failure') },
    ],
    answer: 'ac',
    explain: loc('功能还在，只是时间窗口不够了。', 'The function is fine; the timing window ran out.'),
  },
]
