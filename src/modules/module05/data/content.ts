import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/** 五层主线：每层一个名字、一句副标题、一段说明 */
export type LayerId = 'sheet' | 'spec' | 'method' | 'setup' | 'result'

export const LAYERS: Array<{ id: LayerId; name: string; sub: LText; text: LText }> = [
  {
    id: 'sheet',
    name: 'Datasheet',
    sub: loc('器件承诺', 'What the part promises'),
    text: loc(
      '规格书只写一句承诺：输入不低于 2.0 V，芯片一定认成 1。它不告诉你怎么测。',
      'The datasheet makes one promise: any input at or above 2.0 V is read as a 1. It does not say how to test it.',
    ),
  },
  {
    id: 'spec',
    name: 'Test Spec',
    sub: loc('测什么、怎么判', 'What to test, how to judge'),
    text: loc(
      'Test Spec 把承诺写成可判定的一项：在什么条件下测，什么结果算过。条件取最坏情况：VDD 用最低值，输入 1 只给 2.0 V。',
      'The test spec turns the promise into one judgeable item: the test conditions and the pass limit. Use the worst case: VDD at its minimum, and every input 1 driven at only 2.0 V.',
    ),
  },
  {
    id: 'method',
    name: 'Method',
    sub: loc('怎么施加、怎么看', 'How to apply, how to observe'),
    text: loc(
      'ATE 看不见芯片内部“认成了什么”。办法是跑功能向量：输入的 1 只给 2.0 V，看输出是否仍然对。门限高于 2.0 V 的芯片会把这些 1 认成 0。',
      'ATE cannot see what the chip “thinks” the input is. So run functional vectors with every input 1 at only 2.0 V and check the outputs. A part whose threshold is above 2.0 V reads those 1s as 0s.',
    ),
  },
  {
    id: 'setup',
    name: 'Tester Setup / Program',
    sub: loc('机台上的设置', 'Settings on the tester'),
    text: loc(
      '落到机台上，就是 Level 表里的一个数：VIH = 2.0 V。程序再写上电源、跑哪个 Pattern、失败进哪个 Bin。',
      'On the tester this becomes one number in the level table: VIH = 2.0 V. The program adds the supply, which pattern to run, and which bin a failure goes to.',
    ),
  },
  {
    id: 'result',
    name: 'Pass / Fail',
    sub: loc('出结果', 'The verdict'),
    text: loc(
      '每个 Strobe 都比对上期望值，这一项才 Pass。只要有一拍不对，就是 Fail，芯片进失败 Bin。',
      'The item passes only if every strobe matches its expected value. One wrong strobe means Fail, and the part goes to a fail bin.',
    ),
  },
]

/** 示例向量：输入位，DUT 只是把输入传到输出 */
export const BITS: Array<0 | 1> = [1, 0, 1, 1, 0, 1, 0, 0]

export const VIH_SPEC = 2.0
export const VIL_SPEC = 0.8

/** 两颗示例芯片：实际输入门限 */
export const DUTS: Array<{ id: 'good' | 'bad'; label: LText; threshold: number }> = [
  { id: 'good', label: loc('门限 1.6 V 的芯片', 'Part with a 1.6 V threshold'), threshold: 1.6 },
  { id: 'bad', label: loc('门限 2.15 V 的芯片', 'Part with a 2.15 V threshold'), threshold: 2.15 },
]

/** 「DC 还是 AC」小练习 */
export type Family = 'dc' | 'ac'

export const GUESS: Array<{ id: string; name: string; limit: string; family: Family; why: LText }> = [
  {
    id: 'vih',
    name: 'VIH',
    limit: '≥ 2.0 V',
    family: 'dc',
    why: loc('电压门限，与快慢无关。', 'A voltage threshold. Speed does not matter.'),
  },
  {
    id: 'voh',
    name: 'VOH @ IOH',
    limit: '≥ 2.4 V @ 4 mA',
    family: 'dc',
    why: loc('带负载时的输出电压，静态量。', 'Output voltage under load. A static quantity.'),
  },
  {
    id: 'idd',
    name: 'IDD',
    limit: '< 20 mA',
    family: 'dc',
    why: loc('电源电流，静态量。', 'Supply current. A static quantity.'),
  },
  {
    id: 'tpd',
    name: 'tPD',
    limit: '≤ 8 ns',
    family: 'ac',
    why: loc('输入变到输出变的延迟，单位是时间。', 'Delay from input change to output change, measured in time.'),
  },
  {
    id: 'fmax',
    name: 'fMAX',
    limit: '100 MHz',
    family: 'ac',
    why: loc('最高工作频率，是速度。', 'Maximum operating frequency: a speed item.'),
  },
]

export const TAKEAWAY: LText[] = [
  loc(
    '每一条规格都要走完五层：Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail。',
    'Every spec goes through five layers: Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail.',
  ),
  loc(
    '测门限要在规格边沿测。给舒适的 3.3 V 只能证明“够高时是 1”，证明不了 2.0 V 也是 1。',
    'Test a threshold at the spec edge. A comfortable 3.3 V only proves “high enough is 1”, not that 2.0 V is still 1.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Datasheet 和 Test Spec 差在哪？', 'How does a datasheet differ from a test spec?'),
    options: [
      { id: 'same', text: loc('同一份文件，换个封面', 'Same document, different cover') },
      {
        id: 'ok',
        text: loc(
          'Datasheet 写器件承诺什么；Test Spec 写在什么条件下测、什么算过',
          'The datasheet states what the part promises; the test spec states the test conditions and what counts as a pass',
        ),
      },
      { id: 'bin', text: loc('Datasheet 是 Bin 表', 'The datasheet is the bin table') },
      { id: 'prog', text: loc('Test Spec 就是测试程序代码', 'The test spec is the program code') },
    ],
    answer: 'ok',
    explain: loc(
      '承诺是目标；Test Spec 加上条件和极限，才变成能判定的一项。',
      'The promise is the goal. Adding conditions and limits turns it into a judgeable item.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('五层主线的正确顺序是？', 'What is the correct order of the five layers?'),
    options: [
      { id: 'rev', text: loc('先写 Program，再回头找 Datasheet', 'Write the program first, then look up the datasheet') },
      {
        id: 'ok',
        text: loc(
          'Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail',
          'Datasheet → Test Spec → Method → Tester Setup / Program → Pass / Fail',
        ),
      },
      { id: 'skip', text: loc('有 Pattern 就够了，不用规格', 'A pattern is enough; no spec needed') },
      { id: 'ate', text: loc('先设 Level，规格以后再说', 'Set levels first; the spec can wait') },
    ],
    answer: 'ok',
    explain: loc(
      '程序里的每个数都应该能追溯到规格里的一行。',
      'Every number in the program should trace back to a line in the spec.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('测 VIH ≥ 2.0 V，为什么输入的 1 只给 2.0 V，不给 3.3 V？', 'To test VIH ≥ 2.0 V, why drive input 1s at only 2.0 V instead of 3.3 V?'),
    options: [
      { id: 'easy', text: loc('3.3 V 会烧坏芯片', '3.3 V would damage the part') },
      {
        id: 'edge',
        text: loc('要证明在规格边沿芯片仍认成 1', 'To prove the part still reads a 1 at the spec edge'),
      },
      { id: 'fast', text: loc('2.0 V 跑得更快', '2.0 V runs faster') },
      { id: 'none', text: loc('无所谓，结果一样', 'It makes no difference') },
    ],
    answer: 'edge',
    explain: loc(
      '门限 2.15 V 的坏片，给 3.3 V 也能过；只有给 2.0 V 才会露馅。',
      'A bad part with a 2.15 V threshold passes at 3.3 V. Only 2.0 V exposes it.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('ATE 怎么知道芯片把 2.0 V 认成了 1？', 'How does the ATE know the part read 2.0 V as a 1?'),
    options: [
      { id: 'look', text: loc('直接测芯片内部节点', 'It probes the internal node directly') },
      { id: 'func', text: loc('跑功能向量，看输出是否按 1 工作', 'It runs functional vectors and checks the outputs behave as if the input were 1') },
      { id: 'idd', text: loc('看电源电流有没有变', 'It checks whether the supply current changes') },
      { id: 'pmu', text: loc('用 PMU 量输入脚电压', 'It measures the input pin voltage with the PMU') },
    ],
    answer: 'func',
    explain: loc(
      '“认成什么”看不见，只能从输出行为推断。所以 VIH 用功能向量来测。',
      'What the part “thinks” is invisible; only output behaviour shows it. That is why VIH is tested with functional vectors.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('IDD < 20 mA 属于哪一类测试？', 'Which kind of test is IDD < 20 mA?'),
    options: [
      { id: 'dc', text: loc('DC：电源电流', 'DC: supply current') },
      { id: 'ac', text: loc('AC：速度', 'AC: speed') },
      { id: 'func', text: loc('只是功能测试', 'Functional test only') },
      { id: 'none', text: loc('不需要测', 'No test needed') },
    ],
    answer: 'dc',
    explain: loc('电流、电压这类静态量归 DC；延迟、频率归 AC。', 'Static currents and voltages are DC; delays and frequencies are AC.'),
  },
]
