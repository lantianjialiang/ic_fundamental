import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type DutId, type RangeId, type VectorId } from '../model/iddq'
import { type Bias, type Defect, type DefectKind, type OsVerdict, type PinId } from '../model/continuity'

/** 界面文案 */
export const S = {
  introTitle: loc('这一课怎么用', 'How to use this lesson'),
  introBody: loc(
    '先在第一个标签「基础台」里拧 Period、Drive、Strobe 与漏电限流，看 Strobe 落在哪里会 PASS 或 FAIL（原 D15 实验台并入本课）。然后是一台简化的 ATE 工作站：左边选测试项，中间配条件，按 Run 执行；每跑一次，Datalog 里多一行。点 Datalog 的任意一行，结果区和右侧栏会解释它为什么 PASS、FAIL 或无效。多改几次条件再跑，比较前后两行。',
    'Start with the first tab, the basic bench: turn period, drive, strobe and the leakage limit and see where the strobe makes a PASS or FAIL (the former D15 bench is merged into this lesson). Then comes a simplified ATE workstation: pick a test on the left, set the conditions in the middle and press Run; every run adds a line to the datalog. Click any datalog line and the result panel and the side bar explain why it passed, failed or was invalid. Change the conditions, run again, and compare the lines.',
  ),
  disclaimer: loc(
    '数值仅为教学示例，不代表任何具体芯片的真实规格。教学 DUT：VT8，8 脚，VDD = 1.8 V，绝对最大额定值 2.0 V。',
    'All numbers are teaching examples and do not represent any real chip. Teaching DUT: VT8, 8 pins, VDD = 1.8 V, absolute maximum 2.0 V.',
  ),
  wsTitle: loc('虚拟 ATE 工作站', 'Virtual ATE workstation'),
  wsBar: loc('程序 VT8_DEMO · 站点 1 · 离线教学模式', 'Program VT8_DEMO · Site 1 · offline teaching mode'),
  tree: loc('测试项', 'Test items'),
  treeAria: loc('选择测试项', 'Choose a test item'),
  tabIddq: loc('IDDQ 静态电流', 'IDDQ quiescent current'),
  tabOs: loc('Open / Short 开短路', 'Open / Short continuity'),
  config: loc('测试条件', 'Test conditions'),
  result: loc('结果', 'Result'),
  datalog: loc('Datalog', 'Datalog'),
  run: loc('Run', 'Run'),
  runAll: loc('Run V1–V4', 'Run V1–V4'),
  clear: loc('清空 Datalog', 'Clear datalog'),
  noRun: loc('还没有运行记录。设好条件后按 Run。', 'No runs yet. Set the conditions and press Run.'),
  logNote: loc('最新的在最上面。点一行看解释。', 'Newest first. Click a line for the explanation.'),
  why: loc('为什么', 'Why'),
  model: loc('模型拆解', 'Model breakdown'),
  truth: loc('幕后（只在注入模式显示）', 'Behind the scenes (inject mode only)'),
  takeawayTitle: loc('本课要点', 'Key points'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Each answer is checked and explained at once.'),
  yes: loc('对。', 'Correct. '),
  no: loc('不对。', 'Not quite. '),
  kickerIntro: loc('工作站', 'Workstation'),
  kickerIddq: loc('IDDQ', 'IDDQ'),
  kickerOs: loc('开短路', 'Opens / shorts'),
  kickerQuiz: loc('复习', 'Review'),
  asideIntroTitle: loc('先跑一次默认条件', 'Run the defaults first'),
  asideIntroText: loc(
    '默认是正常芯片、1.8 V、Vector 1、等待 5 ms、自动量程。先按 Run 看一行 PASS，再一次只改一个条件，看哪一项让结果变了。',
    'The defaults are a good chip, 1.8 V, Vector 1, 5 ms settling and auto range. Press Run to see one PASS line, then change one condition at a time and see which one changes the result.',
  ),
  asideOsTitle: loc('先测 Pin 1', 'Test Pin 1 first'),
  asideOsText: loc(
    '默认没有注入缺陷、−100 µA、钳位 ±3 V、窗口 −1.5 ~ −0.2 V，其它脚和 VDD 接 0 V。先全选 Pin 跑一次，看好片的读数，再注入缺陷比较。',
    'By default there is no defect, −100 µA, a ±3 V clamp, a −1.5 to −0.2 V window, and the other pins and VDD at 0 V. Select all pins and run once to see a good chip, then inject a defect and compare.',
  ),
  later: loc(
    'IDDQ 的来历在 {@pmu} 和 {@dc}，开短路的原理在 {@fOpens}。这里不讲新名词，只让你自己配、自己跑、自己解释。',
    'IDDQ is introduced in {@pmu} and {@dc}; the opens / shorts principle is in {@fOpens}. No new names here: you configure, run and explain it yourself.',
  ),

  // IDDQ
  dut: loc('虚拟 DUT', 'Virtual DUT'),
  vdd: loc('VDD 供电', 'VDD supply'),
  vddHint: loc('规格 1.8 V（1.62–1.98 V），绝对最大 2.0 V', 'Spec 1.8 V (1.62–1.98 V), absolute maximum 2.0 V'),
  vddAbsWarn: loc('超过绝对最大额定值 2.0 V：Run 时测试机会中止。', 'Above the 2.0 V absolute maximum: the tester will abort on Run.'),
  vector: loc('静态向量', 'Static vector'),
  settle: loc('等待稳定时间', 'Settling time'),
  settleHint: loc('施加向量后等多久再测；充电电流时间常数 τ = 0.5 ms', 'How long to wait after the vector before measuring; charging time constant τ = 0.5 ms'),
  range: loc('电流量程', 'Current range'),
  rangeHint: loc('分辨率 = 量程 / 1000', 'Resolution = range / 1000'),
  clamp: loc('DPS 电流钳位', 'DPS current clamp'),
  limit: loc('IDDQ 上限', 'IDDQ upper limit'),
  colNo: loc('#', '#'),
  colDut: loc('DUT', 'DUT'),
  colCond: loc('条件', 'Conditions'),
  colRead: loc('读数', 'Reading'),
  colLimit: loc('限值', 'Limit'),
  colResult: loc('结果', 'Result'),
  readLabel: loc('IDDQ 读数', 'IDDQ reading'),
  trueLabel: loc('真实电流（模型）', 'True current (model)'),
  rangeLabel: loc('使用量程', 'Range used'),
  resLabel: loc('分辨率', 'Resolution'),
  overRange: loc('OVER RANGE', 'OVER RANGE'),
  invalidRead: loc('无效读数', 'Invalid reading'),
  noMeasure: loc('未测量', 'Not measured'),

  // 开短路
  mode: loc('DUT 来源', 'DUT source'),
  modeInject: loc('自己注入缺陷', 'Inject a defect yourself'),
  modeQuiz: loc('诊断练习（隐藏故障）', 'Diagnosis drill (hidden fault)'),
  defect: loc('注入缺陷', 'Injected defect'),
  pinA: loc('缺陷所在 Pin', 'Defect pin'),
  pinB: loc('另一端 Pin', 'Other pin'),
  rc: loc('接触电阻', 'Contact resistance'),
  pins: loc('要测的 Pin', 'Pins to test'),
  pinsHint: loc('点芯片图上的引脚或下面的按钮来勾选。Pin 4 = GND、Pin 8 = VDD 是电源脚，不做这一项。', 'Click a pin on the drawing or a button below to select it. Pin 4 = GND and Pin 8 = VDD are supply pins and are not tested here.'),
  selectAll: loc('全选信号脚', 'Select all signal pins'),
  polarity: loc('Force 极性', 'Force polarity'),
  polNeg: loc('−I（测对 GND 的下二极管）', '−I (lower diode to GND)'),
  polPos: loc('+I（测对 VDD 的上二极管）', '+I (upper diode to VDD)'),
  force: loc('Force 电流大小', 'Force current magnitude'),
  vclamp: loc('电压钳位 ±', 'Voltage clamp ±'),
  openTh: loc('Open 门限', 'Open threshold'),
  shortTh: loc('Short 门限', 'Short threshold'),
  mirror: loc('按 Force 极性设置门限（±1.5 / ±0.2 V）', 'Set thresholds for the force polarity (±1.5 / ±0.2 V)'),
  others: loc('其它信号脚', 'Other signal pins'),
  vddPin: loc('VDD 脚', 'VDD pin'),
  biasGnd: loc('接 0 V', 'At 0 V'),
  biasFloat: loc('浮空', 'Floating'),
  osModelNote: loc(
    '这是可配置的教学测试模型：实际开短路方法、极性、激励和判定因 ATE 平台和器件而异。有的平台用 +I 测对 VDD 的上保护二极管，有的用 −I 测对 GND 的下保护二极管，也有两个都测的。',
    'This is a configurable teaching model: real opens / shorts methods, polarity, stimulus and limits vary by ATE platform and device. Some platforms force +I into the upper diode to VDD, some force −I through the lower diode to GND, and some test both.',
  ),
  colPin: loc('Pin', 'Pin'),
  colForce: loc('Force', 'Force'),
  colVm: loc('测得电压', 'Measured V'),
  colWin: loc('窗口', 'Window'),
  colVerdict: loc('判定', 'Verdict'),
  clampedTag: loc('撞钳位', 'clamped'),
  summary: loc('本次运行', 'This run'),
  noPins: loc('先至少选一个 Pin。', 'Select at least one pin first.'),
  quizPick: loc('第几题', 'Drill'),
  quizNext: loc('换一题', 'Next drill'),
  quizAsk: loc('你的诊断', 'Your diagnosis'),
  quizType: loc('故障类型', 'Fault type'),
  quizSubmit: loc('提交诊断', 'Submit diagnosis'),
  quizHidden: loc('故障已隐藏。用不同的极性、偏置组合多跑几次，再下结论。', 'The fault is hidden. Run several times with different polarity and bias combinations before deciding.'),
  quizRight: loc('诊断正确。', 'Correct diagnosis.'),
  quizWrong: loc('诊断不对。', 'Not the right diagnosis.'),
  chipAria: loc('VT8 芯片俯视图，8 脚，左侧 1–4 脚，右侧 5–8 脚，点击引脚可勾选', 'Top view of the VT8 chip, 8 pins, pins 1–4 on the left and 5–8 on the right; click a pin to select it'),
  chipCap: loc(
    '俯视图：圆点和缺口标出 Pin 1，引脚逆时针编号。高亮框 = 已勾选；引脚旁的字是最近一次的判定。',
    'Top view: the dot and notch mark Pin 1; pins are numbered counter-clockwise. Highlighted outline = selected; the word next to a pin is its latest verdict.',
  ),
}

export const DUTS: Array<{ id: DutId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'good',
    title: loc('正常芯片', 'Good chip'),
    sub: loc('只有正常的亚阈值漏电', 'Only normal subthreshold leakage'),
    text: loc('1.8 V、V1 下约 24 µA。', 'About 24 µA at 1.8 V, V1.'),
  },
  {
    id: 'gox',
    title: loc('额外静态漏电', 'Extra static leakage'),
    sub: loc('栅氧漏电：VDD–GND 间约 11.9 kΩ', 'Gate-oxide leak: about 11.9 kΩ VDD–GND'),
    text: loc('每个向量都多出约 151 µA。', 'About 151 µA extra in every vector.'),
  },
  {
    id: 'bridge',
    title: loc('向量相关漏电', 'Vector-dependent leakage'),
    sub: loc('节点 A–B 桥接，只在 A ≠ B 时导电', 'A–B bridge, conducts only when A ≠ B'),
    text: loc('只有 V2、V3 暴露缺陷。', 'Only V2 and V3 expose the defect.'),
  },
]

export const VECTORS: Array<{ id: VectorId; label: string }> = [
  { id: 'v1', label: 'V1 · A=0 B=0' },
  { id: 'v2', label: 'V2 · A=1 B=0' },
  { id: 'v3', label: 'V3 · A=0 B=1' },
  { id: 'v4', label: 'V4 · A=1 B=1' },
]

export const RANGES: Array<{ id: RangeId; label: LText }> = [
  { id: 'auto', label: loc('自动', 'Auto') },
  { id: 'r10u', label: loc('10 µA', '10 µA') },
  { id: 'r100u', label: loc('100 µA', '100 µA') },
  { id: 'r1m', label: loc('1 mA', '1 mA') },
  { id: 'r10m', label: loc('10 mA', '10 mA') },
]

/** DPS 电流钳位可选值（µA），滑块按下标取值 */
export const CLAMP_STEPS = [50, 100, 200, 500, 1000, 10000, 100000]
export const CLAMP_DEFAULT_INDEX = 5
/** Force 电流幅值可选值（µA），滑块按下标取值 */
export const FORCE_STEPS = [0, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
export const FORCE_DEFAULT_INDEX = 4
/** 接触电阻可选值（Ω） */
export const RC_STEPS = [50, 100, 200, 500, 1000, 2000, 5000, 10000]
export const RC_DEFAULT_INDEX = 5

export const DEFECTS: Array<{ id: DefectKind; label: LText }> = [
  { id: 'none', label: loc('无', 'None') },
  { id: 'open', label: loc('开路', 'Open') },
  { id: 'pinPin', label: loc('两脚短路', 'Pin-to-pin short') },
  { id: 'pinGnd', label: loc('对 GND 短路', 'Short to GND') },
  { id: 'pinVdd', label: loc('对 VDD 短路', 'Short to VDD') },
  { id: 'contact', label: loc('高接触电阻', 'High contact resistance') },
]

export const BIASES: Array<{ id: Bias; label: LText }> = [
  { id: 'gnd', label: S.biasGnd },
  { id: 'float', label: S.biasFloat },
]

export const OS_MODES: Array<{ id: 'inject' | 'quiz'; label: LText }> = [
  { id: 'inject', label: S.modeInject },
  { id: 'quiz', label: S.modeQuiz },
]

export const VERDICT_LABEL: Record<OsVerdict, LText> = {
  pass: loc('PASS', 'PASS'),
  marginal: loc('边缘', 'MARGINAL'),
  open: loc('OPEN', 'OPEN'),
  short: loc('SHORT', 'SHORT'),
  abort: loc('中止', 'ABORTED'),
}

/** 诊断练习：题号固定对应一个隐藏故障，和运行次数无关 */
export const PUZZLES: Array<{ defect: Defect; explain: LText }> = [
  {
    defect: { kind: 'open', a: 'p3', b: 'p1', rc: 1 },
    explain: loc(
      'Pin 3 无论 ±I、其它脚接地还是浮空都撞钳位，其它脚正常：Pin 3 开路（探针没扎上、焊线断或 Socket 没压到）。',
      'Pin 3 hits the clamp with ±I and with the other pins grounded or floating, while the others are normal: Pin 3 is open (missed probe, broken bond wire or socket not pressed).',
    ),
  },
  {
    defect: { kind: 'pinPin', a: 'p5', b: 'p6', rc: 1 },
    explain: loc(
      'Pin 5、Pin 6 在“其它脚接 0 V”时都读 ≈ 0 V；把其它脚浮空后两者都回到约 −0.61 V。说明它们不是对地短路，而是彼此短在一起：测一个时另一个接地，电流从邻脚流走。',
      'Pins 5 and 6 both read ≈ 0 V with the other pins at 0 V; with the other pins floating both return to about −0.61 V. So neither is shorted to ground: they are shorted to each other, and while one is tested the grounded neighbor takes the current.',
    ),
  },
  {
    defect: { kind: 'pinGnd', a: 'p2', b: 'p1', rc: 1 },
    explain: loc(
      'Pin 2 不管其它脚、VDD 接地还是浮空都读 ≈ 0 V：它直接连到 GND 上了。',
      'Pin 2 reads ≈ 0 V whether the other pins and VDD are grounded or floating: it is tied straight to GND.',
    ),
  },
  {
    defect: { kind: 'pinVdd', a: 'p7', b: 'p1', rc: 1 },
    explain: loc(
      'Pin 7 在 VDD 接 0 V 时读 ≈ 0 V（看起来像对地短路）；把 VDD 浮空后变成约 −0.49 V：电流改经 VDD 网络的二极管流回，说明它短在 VDD 上，不是 GND。',
      'Pin 7 reads ≈ 0 V with VDD at 0 V (looks like a short to ground); with VDD floating it becomes about −0.49 V because the current returns through the diodes on the VDD net. It is shorted to VDD, not GND.',
    ),
  },
  {
    defect: { kind: 'contact', a: 'p1', b: 'p2', rc: 2000 },
    explain: loc(
      'Pin 1 读约 −0.85 V，比好片多 0.2 V，仍在窗口内但被标“边缘”。多出来的压降 = 100 µA × 2 kΩ：高接触电阻。清洁 Socket / 针尖后复测。',
      'Pin 1 reads about −0.85 V, 0.2 V more than a good pin, still inside the window but flagged marginal. The extra drop = 100 µA × 2 kΩ: high contact resistance. Clean the socket / probe tips and retest.',
    ),
  },
  {
    defect: { kind: 'none', a: 'p1', b: 'p2', rc: 1 },
    explain: loc(
      '所有信号脚都约 −0.65 V，换极性、换偏置也都正常：这颗芯片没有开短路缺陷。敢下“没问题”的结论也是诊断。',
      'Every signal pin reads about −0.65 V and stays normal with the other polarity and biases: this chip has no opens / shorts defect. Concluding “nothing is wrong” is a diagnosis too.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc(
    'IDDQ = f(芯片, 向量, VDD, 缺陷)。缺陷电流只在向量把缺陷两端置成不同电平时才出现，所以 IDDQ 要跑多个静态向量。',
    'IDDQ = f(chip, vector, VDD, defect). Defect current only appears when the vector puts the two ends of the defect at different levels, so IDDQ needs several static vectors.',
  ),
  loc(
    '读数先要“有效”才谈 PASS / FAIL：没上电、超量程、DPS 限流、超 Abs Max 都不是芯片的结论，是测试条件的问题。',
    'A reading must be valid before PASS / FAIL means anything: no power, over-range, DPS current limit and exceeding Abs Max are not verdicts on the chip but problems with the test conditions.',
  ),
  loc(
    '等待时间太短，读数里混着充电电流，好芯片也会 FAIL；量程太大，分辨率不够，接近限值时判不准。',
    'Too short a settling time leaves charging current in the reading, so even a good chip fails; too large a range leaves too little resolution to judge near the limit.',
  ),
  loc(
    '开短路：好脚读一个二极管压降（约 0.65 V），开路撞钳位，短路接近 0 V；高接触电阻读数 = 二极管压降 + I × R。',
    'Opens / shorts: a good pin reads one diode drop (about 0.65 V), an open hits the clamp, a short reads near 0 V; high contact resistance reads diode drop + I × R.',
  ),
  loc(
    '“Short”只说明电流有旁路，不说明短在哪：把其它脚浮空、把 VDD 浮空再测，才能分出两脚短路、对地短路和对 VDD 短路。',
    '“Short” only says the current found a bypass, not where: float the other pins, then float VDD and retest to tell a pin-to-pin short from a short to GND or to VDD.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'vate-q1',
    prompt: loc(
      '向量相关漏电的芯片在 V1（A=0 B=0）下 IDDQ = 24 µA，PASS。能说明它没有缺陷吗？',
      'The vector-dependent chip reads 24 µA IDDQ under V1 (A=0 B=0) and passes. Does that prove it has no defect?',
    ),
    options: [
      { id: 'a', text: loc('能，读数和好片一样', 'Yes, the reading matches a good chip') },
      { id: 'b', text: loc('不能，V1 没让桥接两端出现压差', 'No, V1 does not put a voltage across the bridge') },
      { id: 'c', text: loc('不能，因为量程选错了', 'No, because the range is wrong') },
    ],
    answer: 'b',
    explain: loc(
      'A、B 同为 0 时桥接两端电位相同，没有电流。只有 A ≠ B 的向量（V2、V3）才会让缺陷导电，IDDQ 升到约 175 µA。',
      'With A and B both 0 the bridge has no voltage across it and carries no current. Only vectors with A ≠ B (V2, V3) make the defect conduct and raise IDDQ to about 175 µA.',
    ),
  },
  {
    id: 'vate-q2',
    prompt: loc('VDD 设成 0 V 跑 IDDQ，读到 0 µA。结论是？', 'IDDQ is run with VDD set to 0 V and reads 0 µA. The conclusion?'),
    options: [
      { id: 'a', text: loc('PASS，漏电为零', 'PASS, zero leakage') },
      { id: 'b', text: loc('读数无效，芯片根本没上电', 'Invalid reading, the chip was never powered') },
      { id: 'c', text: loc('FAIL，芯片坏了', 'FAIL, the chip is broken') },
    ],
    answer: 'b',
    explain: loc(
      '没加电就没有电流，0 µA 只说明电源没开，不说明芯片好。IDDQ 必须在规格电压下测，测试程序要先检查条件有效再判定。',
      'No supply, no current: 0 µA only says the supply was off, not that the chip is good. IDDQ must be measured at the spec voltage, and the program must check the conditions are valid before judging.',
    ),
  },
  {
    id: 'vate-q3',
    prompt: loc(
      '正常芯片等待 1 ms 后测得 295 µA，FAIL；等 5 ms 后测得 24 µA。哪次可信？',
      'A good chip reads 295 µA after 1 ms and fails; after 5 ms it reads 24 µA. Which one is trustworthy?',
    ),
    options: [
      { id: 'a', text: loc('1 ms 那次，先测的更准', 'The 1 ms one, earlier is more accurate') },
      { id: 'b', text: loc('5 ms 那次，1 ms 时充电电流还没衰减完', 'The 5 ms one; at 1 ms the charging current has not decayed') },
      { id: 'c', text: loc('都不可信', 'Neither') },
    ],
    answer: 'b',
    explain: loc(
      '施加向量后电容在充电，电流按 exp(−t/τ) 衰减，τ = 0.5 ms。1 ms 只有 2τ，还剩约 270 µA 瞬态；5 ms = 10τ，瞬态只剩 0.1 µA，读到的才是静态电流。',
      'After the vector is applied the capacitances charge and the current decays as exp(−t/τ) with τ = 0.5 ms. 1 ms is only 2τ and about 270 µA of transient remains; 5 ms = 10τ leaves just 0.1 µA, so the reading is the static current.',
    ),
  },
  {
    id: 'vate-q4',
    prompt: loc(
      '开短路时 Pin 5 和 Pin 6 都判 SHORT（≈ 0 V）。其它脚改成浮空后两脚都回到约 −0.61 V。最可能的故障是？',
      'In opens / shorts both Pin 5 and Pin 6 read SHORT (≈ 0 V). With the other pins floating both return to about −0.61 V. The most likely fault?',
    ),
    options: [
      { id: 'a', text: loc('Pin 5、Pin 6 都对地短路', 'Pins 5 and 6 are both shorted to ground') },
      { id: 'b', text: loc('Pin 5 和 Pin 6 互相短路', 'Pins 5 and 6 are shorted to each other') },
      { id: 'c', text: loc('两脚都开路', 'Both pins are open') },
    ],
    answer: 'b',
    explain: loc(
      '其它脚接 0 V 时，测 Pin 5 的电流经短路流进接地的 Pin 6，所以读 ≈ 0 V，反过来也一样。浮空后邻脚不再接地，电流只能走两脚的保护二极管，读数恢复。对地短路浮空后仍是 0 V。',
      'With the other pins at 0 V, current into Pin 5 flows through the short into grounded Pin 6, so it reads ≈ 0 V, and vice versa. Floating removes the neighbor’s ground, so the current can only use the two pins’ protection diodes and the reading recovers. A short to ground would stay at 0 V.',
    ),
  },
  {
    id: 'vate-q5',
    prompt: loc(
      '把电压钳位设成 ±0.5 V 后，所有脚都判 OPEN。原因是？',
      'With the voltage clamp at ±0.5 V every pin reads OPEN. Why?',
    ),
    options: [
      { id: 'a', text: loc('芯片全部开路', 'Every pin is open') },
      { id: 'b', text: loc('钳位比二极管压降 0.65 V 还低，好脚也撞钳位', 'The clamp is below the 0.65 V diode drop, so even good pins clamp') },
      { id: 'c', text: loc('Force 电流方向反了', 'The force current has the wrong polarity') },
    ],
    answer: 'b',
    explain: loc(
      '好脚要 0.65 V 才能送进 100 µA。钳位只允许 0.5 V，电流送不进去，PMU 停在钳位上，和开路的表现一样。钳位要设在 Open 门限之外。',
      'A good pin needs 0.65 V to take 100 µA. A 0.5 V clamp stops the PMU before the current gets in, which looks exactly like an open. The clamp must sit beyond the open threshold.',
    ),
  },
]

export const pinLabel = (pin: PinId, pins: Array<{ id: PinId; no: number; name: string }>) => {
  const p = pins.find((x) => x.id === pin)
  return p ? `Pin ${p.no} (${p.name})` : pin
}
