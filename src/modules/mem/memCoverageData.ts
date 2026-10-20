import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  ALG_IDS,
  type AlgId,
  type CoverageResult,
  type CoverageState,
  FAULT_KINDS,
  type FaultKind,
  LAMBDA,
  LAMBDA_IDS,
  type LambdaId,
  RESULTS,
  SIM_FAULTS,
} from './memCoverageModel'

export const ALG_OPTIONS: Array<{ id: AlgId; label: LText }> = [
  { id: ALG_IDS[0], label: loc('MSCAN（基线）', 'MSCAN (baseline)') },
  { id: ALG_IDS[1], label: loc('MATS+', 'MATS+') },
  { id: ALG_IDS[2], label: loc('March X', 'March X') },
  { id: ALG_IDS[3], label: loc('March C−', 'March C−') },
]

export const LAMBDA_OPTIONS: Array<{ id: LambdaId; label: LText }> = [
  { id: LAMBDA_IDS[0], label: loc(`低（平均 ${LAMBDA.low} 个）`, `Low (${LAMBDA.low} per device)`) },
  { id: LAMBDA_IDS[1], label: loc(`中（平均 ${LAMBDA.mid} 个）`, `Mid (${LAMBDA.mid} per device)`) },
  { id: LAMBDA_IDS[2], label: loc(`高（平均 ${LAMBDA.high} 个）`, `High (${LAMBDA.high} per device)`) },
]

/** 故障类别的名称；English 部分保留器件标准缩写 */
export const FAULT_NAME: Record<FaultKind, LText> = {
  SAF: loc('固定故障 SAF', 'Stuck-at (SAF)'),
  TF: loc('跳变故障 TF', 'Transition (TF)'),
  CFIN: loc('耦合（反转）CFin', 'Coupling inversion (CFin)'),
  CFID: loc('耦合（强制）CFid', 'Coupling idempotent (CFid)'),
  AF_NOACCESS: loc('地址不访问 AF', 'Address no-access (AF)'),
  AF_ALIAS: loc('地址别名 AF', 'Address alias (AF)'),
}

export const S = {
  kickerNow: loc('这一组算法', 'This algorithm'),
  introTitle: loc('覆盖率与耗时：算法越长，抓得越全，也越慢', 'Coverage and time: longer algorithms catch more but run longer'),
  coreTitle: loc('同一批故障，对比四种算法', 'Same fault set, four algorithms'),
  coreNote: loc(
    `在 128 单元的仿真阵列上随机注入 ${SIM_FAULTS} 个故障（种子固定，每次结果相同），每个故障单独跑一遍算法。覆盖率 = 检出数 ÷ 注入数；耗时按 1 Mbit、100 MHz 换算。`,
    `${SIM_FAULTS} random faults are injected into a 128-cell simulated array (fixed seed, same result every time), and each fault is run through the algorithm on its own. Coverage = detected ÷ injected; time is scaled to a 1 Mbit device at 100 MHz.`,
  ),
  algLabel: loc('算法', 'Algorithm'),
  lambdaLabel: loc('缺陷密度（每颗器件平均缺陷数）', 'Defect density (average defects per device)'),
  rCov: loc('覆盖率（检出 / 注入）', 'Coverage (detected / injected)'),
  rTime: loc('1 Mbit 耗时（ms）', 'Time on 1 Mbit (ms)'),
  rSim: loc('仿真阵列操作数（128 单元）', 'Operations on the 128-cell array'),
  rTrue: loc('真实良率 e^−λ（与测试无关）', 'True yield e^−λ (independent of test)'),
  rTest: loc('测试良率 e^−λc（测试判 PASS 的比例）', 'Test yield e^−λc (share judged PASS)'),
  rPpm: loc('出货不良（PPM）', 'Escapes shipped (PPM)'),
  tableTitle: loc('各类故障的检出数 / 注入数', 'Detected / injected for each fault class'),
  tableNote: loc(
    '同一批故障、同一个种子。绿色为全部检出，橙色为部分检出，红色为一个都没检出。当前算法那一列用金色边框标出。',
    'Same fault set and seed. Green: all detected; amber: some detected; red: none detected. The column of the current algorithm has a gold border.',
  ),
  classHead: loc('故障类别', 'Fault class'),
  titleVerdict: loc('覆盖率不等于良率', 'Coverage is not yield'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的覆盖率要按缺陷统计分布来算，还要区分故障模型、工艺缺陷与测试逃逸；这里只练同一批故障上的比较，以及覆盖率、耗时、良率三者的关系。',
    'Real coverage is computed from the statistical distribution of defects and must separate fault models, process defects and test escapes; here we only compare algorithms on one fault set and link coverage, time and yield.',
  ),
  next: loc('下一课：Bin 与失效分析', 'Next: Bin and Failure Analysis'),
  task1: loc('选 MATS+，找出它漏检的跳变故障（TF）。', 'Select MATS+ and find the transition faults (TF) it misses.'),
  task2: loc('选 March C−，覆盖率达到 95% 以上，耗时约为 MATS+ 的两倍。', 'Select March C−, reach 95% or more coverage, and note its time is about twice MATS+.'),
  task3: loc(
    `把缺陷密度调到高，选覆盖率 90% 以上的算法，看真实良率仍只有约 ${Math.round(Math.exp(-LAMBDA.high) * 100)}%。`,
    `Set defect density to high, pick an algorithm with 90% or more coverage, and see that the true yield is still only about ${Math.round(Math.exp(-LAMBDA.high) * 100)}%.`,
  ),
}

export const FIG = {
  curveAria: loc(
    '覆盖率—耗时曲线：横轴是 1 Mbit 的测试时间，纵轴是覆盖率，每种算法一个点，当前选择的点用金色标出',
    'Coverage versus time curve: horizontal axis is test time for 1 Mbit, vertical axis is coverage; one point per algorithm, the current choice in gold',
  ),
  curveTitle: loc('覆盖率—耗时曲线', 'Coverage vs time'),
  xLabel: loc('1 Mbit 测试耗时（ms）', 'Time on 1 Mbit (ms)'),
  yLabel: loc('覆盖率', 'Coverage'),
  cap: loc(
    '每个点是一种算法。横轴是 1 Mbit、100 MHz 下的测试时间（每单元操作数 × 单元数 ÷ 频率），纵轴是同一批故障上的覆盖率。金色点是当前选择。',
    'Each point is one algorithm. The horizontal axis is test time on a 1 Mbit device at 100 MHz (operations per cell × cells ÷ frequency); the vertical axis is coverage on the same fault set. The gold point is the current choice.',
  ),
}

export const INTRO = [
  loc(
    '{@memPattern} 和 {@memMarch} 已经分别讲了图形的覆盖范围和 March 算法的记法。这一课把它们放到同一张图上：算法每多一遍读写，覆盖率会涨多少，耗时又会多多少。',
    'The {@memPattern} and {@memMarch} lessons covered pattern coverage and March notation. This lesson puts them on one chart: each extra read or write pass raises coverage by some amount and adds time.',
  ),
  loc(
    '覆盖率不等于良率。覆盖率只回答“注入的故障有多少被抓到”；良率还取决于每颗器件真的有多少缺陷，以及缺陷能不能被修复（见 {@memBist}）。统计样本要多大，见 {@anaStats}。',
    'Coverage is not yield. Coverage only answers how many of the injected faults are caught; yield also depends on how many real defects each device has and whether they can be repaired (see {@memBist}). For how large a sample must be, see {@anaStats}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '覆盖率 100% 就等于良率 100%。覆盖率只针对被注入的那些故障类型；器件本身缺陷多，即使全都被抓到，良率也会低。',
    'Coverage of 100% means yield of 100%. Coverage only covers the fault types that were injected; a device with many defects still yields poorly even if all of them are caught.',
  ),
  loc(
    '算法越长越好，应该一直用 March C−。测试时间直接变成成本；对缺陷少、故障类型单一的场合，短算法可以先筛，关键器件再用长算法。',
    'The longer the algorithm, the better, so always use March C−. Test time is directly cost; where defects are few and of one type, a short algorithm can screen first and a long one can be kept for critical devices.',
  ),
  loc(
    '仿真里的覆盖率就是真实器件的覆盖率。仿真只有 128 单元、240 个随机故障，换一个种子数字会变；它只能用来比较算法的相对位置。',
    'Simulated coverage equals the coverage of real devices. The simulation has only 128 cells and 240 random faults, and a different seed changes the numbers; it only shows the relative position of the algorithms.',
  ),
]

export const TAKEAWAY: LText = loc(
  '覆盖率 = 检出的故障数 ÷ 注入的故障数；耗时 = 每单元操作数 × 单元数 ÷ 测试频率；算法越长，覆盖率通常越高，耗时也成倍增加；覆盖率高不等于良率高，良率由缺陷密度和修复能力决定。',
  'Coverage = detected faults ÷ injected faults; time = operations per cell × cells ÷ test frequency; longer algorithms usually cover more but take proportionally longer; high coverage does not mean high yield, which is set by defect density and repair.',
)

/** 小测题里的数字由模型算出 */
const T_MATS = RESULTS.mats.timeMs
const T_MARCHC = RESULTS.marchc.timeMs

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('1 Mbit、100 MHz 下，March C− 的测试时间大约是 MATS+ 的几倍？', 'On 1 Mbit at 100 MHz, roughly how many times longer is March C− than MATS+?'),
    options: [
      { id: 'a', text: loc('1 倍', '1×') },
      { id: 'b', text: loc('2 倍', '2×') },
      { id: 'c', text: loc('0.5 倍', '0.5×') },
    ],
    answer: 'b',
    explain: loc(
      `MATS+ 每单元 ${RESULTS.mats.ops} 次操作，March C− 每单元 ${RESULTS.marchc.ops} 次。1 Mbit 下分别约 ${T_MATS.toFixed(1)} ms 和 ${T_MARCHC.toFixed(1)} ms，正好 2 倍。`,
      `MATS+ does ${RESULTS.mats.ops} operations per cell and March C− does ${RESULTS.marchc.ops}. On 1 Mbit they take about ${T_MATS.toFixed(1)} ms and ${T_MARCHC.toFixed(1)} ms, exactly twice.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('覆盖率的定义是什么？', 'How is coverage defined?'),
    options: [
      { id: 'a', text: loc('好品数 ÷ 测试数', 'Good parts ÷ parts tested') },
      { id: 'b', text: loc('检出的故障数 ÷ 注入的故障数', 'Faults detected ÷ faults injected') },
      { id: 'c', text: loc('通过的单元数 ÷ 单元总数', 'Cells passed ÷ total cells') },
    ],
    answer: 'b',
    explain: loc(
      '覆盖率只看“注入的故障里有多少被抓到”。好品数 ÷ 测试数是良率，不是覆盖率。',
      'Coverage only asks how many injected faults were caught. Good parts ÷ parts tested is yield, not coverage.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('覆盖率 100% 能保证良率高吗？', 'Does 100% coverage guarantee high yield?'),
    options: [
      { id: 'a', text: loc('能，只要算法够长', 'Yes, as long as the algorithm is long enough') },
      { id: 'b', text: loc('不能，良率还取决于缺陷密度和修复能力', 'No, yield also depends on defect density and repair') },
      { id: 'c', text: loc('能，因为通过测试的器件都是好的', 'Yes, because every device that passes is good') },
    ],
    answer: 'b',
    explain: loc(
      '覆盖率只说明能抓出多少注入的故障。一颗器件缺陷很多时，即使全部被抓到，也会判 FAIL 拉低良率；有修复能力的器件，良率还要看修复后能救回多少。',
      'Coverage only says how many injected faults are caught. A device with many defects fails and lowers yield even if all of them are caught; for repairable devices, yield also depends on how many can be rescued.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('为什么 MATS+ 查不出跳变故障（TF↓）？', 'Why does MATS+ miss the falling transition fault (TF↓)?'),
    options: [
      { id: 'a', text: loc('最后一次写 0 之后没有再读，TF↓ 留下的错误看不到', 'After its last write of 0 there is no read, so the error left by TF↓ is never seen') },
      { id: 'b', text: loc('TF↓ 在实际器件中不存在', 'TF↓ does not exist in real devices') },
      { id: 'c', text: loc('MATS+ 的地址顺序不对', 'MATS+ uses the wrong address order') },
    ],
    answer: 'a',
    explain: loc(
      `MATS+ 最后一个元素是 ⇓(r1,w0)：写 0 时，TF↓ 会让单元停在 1，但之后没有读操作。在仿真里，MATS+ 只检出 ${RESULTS.mats.byKind.TF.detected}/${RESULTS.mats.byKind.TF.total} 个跳变故障，March C− 全部检出。`,
      `The last element of MATS+ is ⇓(r1,w0): when it writes 0, TF↓ leaves the cell at 1, and nothing reads it afterwards. In the simulation MATS+ detects ${RESULTS.mats.byKind.TF.detected}/${RESULTS.mats.byKind.TF.total} transition faults, while March C− detects all of them.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('缺陷密度不变，测试覆盖率提高，测出的良率会怎样？', 'With defect density fixed, what happens to the measured yield as test coverage rises?'),
    options: [
      { id: 'a', text: loc('上升，因为测试更严了', 'Rises, because the test is stricter') },
      { id: 'b', text: loc('不变，因为良率只由缺陷密度决定', 'Unchanged, because yield is set only by defect density') },
      { id: 'c', text: loc('下降，更多有缺陷的器件被判 FAIL', 'Falls, because more defective devices are judged FAIL') },
    ],
    answer: 'c',
    explain: loc(
      '测试良率 = e^(−λc)，覆盖率 c 越大，它越小：更多有缺陷的器件被测出来。出货不良 PPM 则随覆盖率上升而下降，这才是覆盖率的价值。',
      'Test yield = e^(−λc) falls as coverage c rises: more defective devices are caught. Escapes shipped in PPM fall as coverage rises; that is the value of coverage.',
    ),
  },
]

/** 把若干段双语文字用同一个分隔符连起来；分隔符本身也是双语的 */
function joinLText(parts: LText[], sep: LText): LText {
  return {
    zh: parts.map((p) => p.zh).join(sep.zh),
    en: parts.map((p) => p.en ?? p.zh).join(sep.en ?? sep.zh),
  }
}

const MISSED_PREFIX = loc('漏检的类别：', 'Missed classes: ')
const MISSED_NONE = loc('所有故障类别都被检出', 'every fault class is detected')

/** 右侧说明栏：结论与原因写在同一段（text），note 给出测试良率与出货不良的解释（没有时为 null） */
export function verdictOf(r: CoverageResult): { title: LText; text: LText; note: LText | null } {
  const cov = (r.coverage * 100).toFixed(1)
  const missed = FAULT_KINDS.filter((k) => r.byKind[k].detected < r.byKind[k].total)
  const missedList = joinLText(
    missed.map((k) => FAULT_NAME[k]),
    loc('、', ', '),
  )
  const missedText: LText =
    missed.length > 0
      ? { zh: `${MISSED_PREFIX.zh}${missedList.zh}`, en: `${MISSED_PREFIX.en ?? MISSED_PREFIX.zh}${missedList.en ?? missedList.zh}` }
      : MISSED_NONE
  const lambda = r.lambda
  const trueY = (r.trueYield * 100).toFixed(1)
  const testY = (r.testYield * 100).toFixed(1)
  const ppm = Math.round(r.ppm).toString()
  const full = r.coverage >= 1
  return {
    title: S.titleVerdict,
    text: loc(
      `${r.name} 在 ${r.total} 个随机故障中检出 ${r.detected} 个，覆盖率 ${cov}%，1 Mbit 上耗时约 ${r.timeMs.toFixed(1)} ms。${missedText.zh}。覆盖率只说明注入的故障被抓到多少；这颗器件平均有 ${lambda} 个缺陷，真实良率约 ${trueY}%，这个数不随算法变化，要靠降低缺陷密度或修复来提高。`,
      `${r.name} detects ${r.detected} of ${r.total} random faults, coverage ${cov}%, and takes about ${r.timeMs.toFixed(1)} ms on 1 Mbit. ${missedText.en ?? missedText.zh}. Coverage only says how many injected faults are caught; this device averages ${lambda} defects, so the true yield is about ${trueY}%, which does not change with the algorithm and must be improved by lowering defect density or by repair.`,
    ),
    note: full
      ? loc(
        `这组故障模型里覆盖率已经是 100%，出货不良为 0；但真实器件的缺陷不止这几类，所以不能据此说良率高。`,
        `In this fault model coverage is already 100%, so escapes are 0; real devices have more kinds of defects than these, so this does not mean high yield.`,
      )
      : loc(
        `测试良率约 ${testY}%，出货不良约 ${ppm} PPM。覆盖率越高，测试越会把有缺陷的器件判 FAIL，测出的良率越低，但出货的不良越少。`,
        `Test yield is about ${testY}% and escapes are about ${ppm} PPM. The higher the coverage, the more defective devices the test judges FAIL, so the measured yield falls, but fewer bad parts ship.`,
      ),
  }
}

/** 三张任务卡：完成与否由当前算法、缺陷密度和覆盖率算出 */
export function taskItems(state: CoverageState, r: CoverageResult): TaskItem[] {
  return [
    { id: 'tf', text: S.task1, done: state.alg === 'mats' && r.byKind.TF.detected < r.byKind.TF.total },
    { id: 'marchc', text: S.task2, done: state.alg === 'marchc' && r.coverage >= 0.95 },
    { id: 'yield', text: S.task3, done: state.lambda === 'high' && r.coverage >= 0.9 },
  ]
}