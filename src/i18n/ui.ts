import { loc } from './locale'

export const ui = {
  labName: loc('半导体测试实验室', 'Semiconductor Test Laboratory'),
  langZh: loc('中文', '中文'),
  langEn: loc('EN', 'EN'),
  themeDark: loc('深色', 'Dark'),
  themeLight: loc('浅色', 'Light'),
  themeAria: loc('配色', 'Theme'),
  langAria: loc('语言', 'Language'),
  navAria: loc('课程目录', 'Lessons'),
  loading: loc('加载中…', 'Loading…'),
  copyright: loc('© 2026 lantianjialiang · MIT License', '© 2026 lantianjialiang · MIT License'),

  timing: {
    replay: loc('再播一次', 'Replay'),
  },

  home: {
    title: loc('选一条轨道开始', 'Pick a track to start'),
    goal: loc(
      '换芯片类型，换的是规格和仪器，不换这条主线。',
      'Changing the chip type changes the specs and instruments, not this spine.',
    ),
    introTitle: loc('一种主线，多种芯片', 'One spine, many chips'),
    introBody: loc('不管测哪种芯片，都沿着这一串走：', 'Whatever chip you test, you follow this chain:'),
    spineSteps: ['Datasheet', 'Test Spec', 'Method', 'Tester Setup', 'Program', 'Pass / Fail'],
    readyGroup: loc('可以上课', 'Ready'),
    pendingGroup: loc('大纲已列，课还没做', 'Outlined, lessons not built yet'),
    lessonCount: loc('节课 →', 'lessons →'),
    home: loc('首页', 'Home'),
    backTrack: loc('返回轨道', 'Back to track'),
    openLesson: loc('进入这一课', 'Open this lesson'),
    pending: loc('待开课', 'Coming'),
    ready: loc('可上课', 'Ready'),
    lessonsTitle: loc('课程', 'Lessons'),
    knowledgeTitle: loc('需要掌握', 'What you will learn'),
  },

  m01: {
    title: loc('什么是半导体测试？', 'What is semiconductor test?'),
    goal: loc(
      '知道测试在产业链的哪一步、用哪些设备、常见的词是什么意思。',
      'Learn where test sits in the chain, which equipment it uses, and what the common words mean.',
    ),
    whatTitle: loc('半导体测试在干什么？', 'What does semiconductor test do?'),
    chainTitle: loc('测试在产业链的哪里', 'Where test sits in the chain'),
    chainNote: loc('点一站，看右侧说明。', 'Click a step to read about it on the right.'),
    chipsTitle: loc('不同芯片，测法不同', 'Different chips, different tests'),
    chipsNote: loc('本轨道讲数字芯片；其他三类先认个脸。', 'This track covers digital ICs; just meet the other three for now.'),
    chipParams: loc('典型测试项：', 'Typical tests:'),
    termsTitle: loc('先认识这些词', 'Words to know first'),
    termsNote: loc('点一个词：右侧是定义，下方是它长什么样。', 'Click a word: the definition is on the right, what it looks like is below.'),
    diagramTitle: loc('一张系统框图', 'One system diagram'),
    diagramNote: loc('只看每块在哪、连到谁。ATE 内部在 {@ate} 展开。', 'Just see where each block sits and what it connects to. {@ate} opens up the ATE.'),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right/wrong and an explanation at once.'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
    next: loc('下一课：DUT 如何接到 ATE', 'Next: How is a DUT connected to an ATE?'),
    kickerChain: loc('产业链', 'Industry chain'),
    kickerTerm: loc('术语', 'Glossary'),
    kickerChip: loc('芯片类型', 'Chip type'),
    kickerDiagram: loc('系统框图', 'System diagram'),
  },

  m02: {
    title: loc('DUT 如何接到 ATE？', 'How is a DUT connected to an ATE?'),
    goalFt: loc(
      'FT：Handler 把封装好的 DUT 压进 Socket。信号路径：Test Head 通道板 → Pogo Tower → Load Board → Socket 弹簧针 → DUT 引脚。',
      'FT: the handler presses the packaged DUT into the socket. Signal path: test-head channel card → pogo tower → load board → socket pogo pin → DUT lead.',
    ),
    goalCp: loc(
      'CP：测试头翻转扣在 Prober 上，探针扎到晶圆 die 上。信号路径：Test Head 通道板 → Pogo Tower → Probe Card → 探针 → Die pad。',
      'CP: the flipped test head docks onto the prober and the probes touch a die on the wafer. Signal path: test-head channel card → pogo tower → probe card → probe → die pad.',
    ),
  },

  m03: {
    title: loc('ATE 里面有什么？', 'What is inside an ATE?'),
    goal: loc(
      '看懂一路 Channel 在一拍里做什么：什么时候、给多高的电平，什么时候、按什么门限去看。',
      'See what one channel does in a cycle: when and at what level it drives, and when and against which thresholds it looks.',
    ),
    introTitle: loc('打开 ATE 主机', 'Open the ATE mainframe'),
    cycleTitle: loc('Channel 的一拍', 'One cycle of a channel'),
    cycleNote: loc(
      '按“下一步”逐步看，或自动播放。切到坏芯片再播一遍，看 Fail 是怎么来的。',
      'Step through with Next, or press Play. Switch to the bad chip and play again to see where a Fail comes from.',
    ),
    passNote: loc('读到 H = 期望 H → 这一拍 PASS。', 'Read H = expect H → this cycle PASSES.'),
    failNote: loc('读到 L ≠ 期望 H → 这一拍 FAIL，这颗芯片进失效 Bin。', 'Read L ≠ expect H → this cycle FAILS and the chip goes to a fail bin.'),
    peTitle: loc('Pin Electronics 的四块', 'The four blocks of pin electronics'),
    peNote: loc('点一块，图里用紫框标出它的位置。', 'Click a block; a purple frame marks it in the figure.'),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right/wrong and an explanation at once.'),
    kickerPe: loc('Pin Electronics', 'Pin Electronics'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
    next: loc('下一课：为什么测试不只是 0 和 1', 'Next: Why test is more than 0 and 1'),
  },

  m04: {
    title: loc('为什么测试不只是 0 和 1', 'Why test is more than 0 and 1'),
    goal: loc(
      '看 ATE 怎样把真实电压翻译成 0/1，以及 PMU 怎样用 Force / Measure 量出电压和电流。',
      'See how ATE translates real voltages into 0/1, and how the PMU uses force / measure to read voltage and current.',
    ),
    introTitle: loc('电压是连续的', 'Voltage is continuous'),
    scaleTitle: loc('逻辑 0/1 和真实电压', 'Logic 0/1 vs real voltage'),
    scaleNote: loc('拖动滑条改变管脚电压；切换输入脚 / 输出脚，看门限怎么变。', 'Drag the slider to change the pin voltage; switch between input and output pins to see the thresholds change.'),
    pinVolt: loc('管脚电压', 'Pin voltage'),
    reads: loc('读成', 'Reads as'),
    midIn: loc('不确定区：DUT 可能认成 0，也可能认成 1。', 'Uncertain zone: the DUT may read 0 or 1.'),
    midOut: loc('既不是 H 也不是 L：这一拍判 Fail。', 'Neither H nor L: this cycle fails.'),
    pmuTitle: loc('PMU：Force / Measure', 'PMU: force / measure'),
    pmuNote: loc('PMU 一边施加、一边测量。点一种方式看接法。', 'The PMU forces one quantity and measures the other. Click a mode to see the hookup.'),
    opensTitle: loc('第一个 PMU 测试：开短路', 'The first PMU test: opens/shorts'),
    opensNote: loc('选一种情况，看电流走哪条路、读数落在哪个区间。', 'Pick a case to see where the current flows and which window the reading lands in.'),
    forced: loc('施加', 'Forced'),
    read: loc('读数', 'Reading'),
    verdict: loc('判定', 'Verdict'),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right/wrong and an explanation at once.'),
    kickerScale: loc('门限', 'Thresholds'),
    kickerPmu: loc('PMU', 'PMU'),
    kickerOpens: loc('开短路', 'Opens/shorts'),
    next: loc('下一课：从 Datasheet 到 Test Spec', 'Next: From datasheet to test spec'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m05: {
    title: loc('从 Datasheet 到 Test Specification', 'From Datasheet to Test Specification'),
    goal: loc(
      '一条规格要经过五层，才变成机台上的 Pass / Fail。',
      'A spec passes through five layers before it becomes a Pass / Fail on the tester.',
    ),
    introTitle: loc('先翻译规格，再写程序', 'Translate the spec before writing the program'),
    introBody: loc(
      'Datasheet 写器件承诺什么；Test Spec 写在什么条件下测、什么算过；然后选测法、设机台，最后才出结果。下面拿一颗假想的 3.3 V 通用芯片的 VIH 走一遍。完整规格书读法详见 {@fSpec}。',
      'The datasheet states what the part promises. The test spec states the conditions and what counts as a pass. Then you choose a method, set up the tester, and only then get a result. Below we walk the VIH spec of an imaginary 3.3 V general-purpose part. For reading a full datasheet, see {@fSpec}.',
    ),
    pipeTitle: loc('五层主线：跟着 VIH 走一遍', 'Five layers: follow VIH through'),
    pipeNote: loc(
      '点上方方块或按「下一步」。先选一颗芯片：门限高于 2.0 V 的那颗，会在哪一层露馅？',
      'Click a box or press Next. Pick a part first: where does the one with a threshold above 2.0 V get caught?',
    ),
    dutGood: loc(
      '门限 1.6 V：2.0 V 的输入越过门限，每个 1 都认对，最后全部 Strobe 通过。',
      '1.6 V threshold: a 2.0 V input is above it, every 1 is read correctly, and all strobes pass.',
    ),
    dutBad: loc(
      '门限 2.15 V：2.0 V 的输入没越过门限，1 被认成 0，输出跟着错，Strobe 判 Fail。给 3.3 V 就发现不了它。',
      '2.15 V threshold: a 2.0 V input stays below it, 1s are read as 0s, the output goes wrong, and the strobes fail. Driving 3.3 V would never catch it.',
    ),
    guessTitle: loc('小练习：DC 还是 AC？', 'Quick check: DC or AC?'),
    guessNote: loc(
      '静态的电压、电流归 DC；延迟、频率归 AC。每行点一个。',
      'Static voltages and currents are DC; delays and frequencies are AC. Pick one per row.',
    ),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right or wrong with an explanation at once.'),
    kickerPipe: loc('主线', 'Layer'),
    asideLater: loc(
      '下一课动手做 DC 测试：VOH / VOL 带着电流测。',
      'Next lesson: hands-on DC test, measuring VOH / VOL under load current.',
    ),
    next: loc('下一课：DC Test', 'Next: DC Test'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m06: {
    title: loc('DC Test', 'DC Test'),
    goal: loc(
      'DC 测试用 PMU 在一根脚上加一个量、测另一个量，再和规格比。',
      'A DC test uses the PMU to force one quantity on a pin, measure the other, and compare with the spec.',
    ),
    introTitle: loc('三组 DC 参数', 'Three groups of DC parameters'),
    introBody: loc(
      'DC 参数分三组。PMU 要么 Force 电流、Measure 电压，要么反过来。',
      'DC parameters fall into three groups. The PMU either forces current and measures voltage, or the reverse.',
    ),
    colGroup: loc('组', 'Group'),
    colItems: loc('参数', 'Parameters'),
    colAsk: loc('问什么', 'What it asks'),
    colHow: loc('怎么测', 'How to test'),
    moreDc: loc(
      '每一项的完整测法、测试顺序和 IDD 的几种测法详见 {@fDc}。',
      'For the full method of each item, test order, and the IDD variants, see {@fDc}.',
    ),
    vohTitle: loc('VOH @ IOH / VOL @ IOL：拖电流看电压', 'VOH @ IOH / VOL @ IOL: drag the current, watch the voltage'),
    vohNote: loc(
      '输出管可以看成一个导通电阻 R_on。VDD 越低管子越弱、R_on 越大，所以这里按最坏情况 VDD 最低值 3.0 V 测。拖动电流（拖到 0 mA 就是空载），看输出电压怎么变；再换一颗驱动偏弱的芯片。',
      'Treat the output transistor as an on-resistance R_on. A lower VDD makes it weaker and R_on larger, so the test here uses the worst case, the minimum VDD of 3.0 V. Drag the current (0 mA means no load) and watch the output voltage; then switch to a part with weak drive.',
    ),
    modeVoh: loc('测 VOH（输出 1）', 'Test VOH (output 1)'),
    modeVol: loc('测 VOL（输出 0）', 'Test VOL (output 0)'),
    driveGood: loc('正常芯片', 'Normal part'),
    driveWeak: loc('驱动偏弱', 'Weak drive'),
    measured: loc('测得电压', 'Measured voltage'),
    limit: loc('极限', 'Limit'),
    atSpecLabel: loc('规格测试点', 'Spec test point'),
    atSpecPass: loc(
      '在规格电流 {i} 下，{v}，合格。这颗芯片这一项 Pass。',
      'At the spec current {i}, {v}: within the limit. This item passes.',
    ),
    atSpecFail: loc(
      '在规格电流 {i} 下，{v}，已超出极限。输出管太弱，这一项 Fail。',
      'At the spec current {i}, {v}: outside the limit. The output transistor is too weak; this item fails.',
    ),
    offSpec: loc(
      '正式判定只看规格电流这一点（{i}，此时 {v}）。现在的电流只是看趋势：电流越大，压降越大。',
      'The official verdict uses only the spec current ({i}, giving {v}). Other currents just show the trend: more current, more drop.',
    ),
    noLoad: loc(
      '空载（0 mA）：没有电流流过 R_on，R_on 上没有压降，{v}。正常芯片和驱动偏弱的芯片读数一模一样，分不出好坏。把电流拖回规格值 {i} 再比。',
      'No load (0 mA): no current flows through R_on, so there is no drop across it and {v}. The normal part and the weak-drive part read exactly the same, so you cannot tell them apart. Drag the current back to the spec value {i} and compare again.',
    ),
    cmpTitle: loc('空载 vs 带载：两颗芯片的读数', 'No load vs loaded: readings of the two parts'),
    cmpPoint: loc('测试点', 'Test point'),
    cmpNoLoad: loc('空载 0 mA', 'No load, 0 mA'),
    cmpSpec: loc('规格电流', 'Spec current'),
    cmpNote: loc(
      '空载时两颗读数相同（输出就是 VDD 或 0 V）；带上规格电流，压降 I × R_on 才出现，R_on 大的那颗压降更大，读数分开并被判 Fail。',
      'Unloaded, both read the same (the output is simply VDD or 0 V). Only with the spec current does the drop I × R_on appear; the part with the larger R_on drops more, the readings separate, and it fails.',
    ),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right or wrong with an explanation at once.'),
    latchEntry: loc('电源电流突然飙高？可能是 Latch-up，见 {@latch}。', 'Supply current suddenly soaring? It may be latch-up; see {@latch}.'),
    asideLater: loc(
      '下一课：用测试向量检查芯片的功能。',
      'Next lesson: check the chip’s function with test vectors.',
    ),
    next: loc('下一课：Functional Test', 'Next: Functional Test'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m07: {
    title: loc('Functional Test', 'Functional Test'),
    goal: loc(
      '按真值表驱动输入、比较输出。真值表的一行就是一条测试向量。',
      'Drive inputs and compare outputs per the truth table. One truth-table row is one test vector.',
    ),
    introTitle: loc('功能对不对，按真值表比', 'Is the function right? Compare against the truth table'),
    introBody: loc(
      '例子用 XOR：两个输入不同，输出为 1；相同为 0。门电路详见 {@fBasics}。',
      'The example is XOR: the output is 1 when the inputs differ and 0 when they match. For logic gates, see {@fBasics}.',
    ),
    tableTitle: loc('真值表一行 = 一条向量', 'One truth-table row = one vector'),
    tableNote: loc(
      '每一行向量占一拍（一个周期），一拍里依次发生三件事：Tester 驱动 A、B → DUT 算出 Y → Strobe 时把 Y 和期望字符比较。点 Y 列的 H / L 可以改期望值；上方可以给芯片注入一个 stuck 故障。',
      'Each vector row takes one cycle, and within that cycle three things happen in turn: the tester drives A and B → the DUT produces Y → at the strobe Y is compared with the expected character. Click H / L in the Y column to change an expected value; use the buttons above to inject a stuck-at fault.',
    ),
    nextRow: loc('下一行向量', 'Next vector'),
    restore: loc('恢复正确期望', 'Restore expected values'),
    ran: loc('已跑', 'Run'),
    failRows: loc('失败行', 'Failing rows'),
    expectY: loc('期望 Y', 'expect Y'),
    rowNote: loc(
      '驱动输入，等芯片输出稳定，在 Strobe 时刻比较。四行都对就是 Pass。',
      'Drive the inputs, let the output settle, compare at the strobe. All four rows right means Pass.',
    ),
    tamperNote: loc(
      '期望值被改过：芯片没坏，改过的那一行也会 Fail。所以看到 Fail，先核对向量本身。',
      'An expected value was edited: the part is fine, yet the edited row fails. On a fail, check the vector itself first.',
    ),
    charsNote: loc(
      '向量字符：1 / 0 是驱动高 / 低，H / L 是期望高 / 低（只比较），X 是不比较。信号格式和 Time Set 详见 {@fFunc}。',
      'Vector characters: 1 / 0 drive high / low, H / L expect high / low (compare only), X means do not compare. For signal formats and time sets, see {@fFunc}.',
    ),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right or wrong with an explanation at once.'),
    kickerVec: loc('向量', 'Vector'),
    asideLater: loc(
      'Strobe 具体在一拍的什么时刻、边沿放在哪里，下一课讲 Timing。',
      'Exactly when in the cycle the strobe falls, and where the edges go, is the next lesson: Timing.',
    ),
    next: loc('下一课：Timing 与 AC 参数', 'Next: Timing and AC parameters'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m08: {
    title: loc('Timing 与 AC 参数', 'Timing and AC Parameters'),
    goal: loc(
      '同一张 CLK / DATA / OUT 图：先学 Strobe 放在哪，再在图上量出 Setup、Hold、tPD 和 fMAX。',
      'One CLK / DATA / OUT diagram: first where to place the strobe, then measure setup, hold, tPD and fMAX on it.',
    ),
    introTitle: loc('输出不是立刻变的', 'The output does not change instantly'),
    introBody: loc(
      '测试机每一拍做两件事：在 Drive 时刻给输入，在 Strobe 时刻看输出。DUT 收到 CLK 沿后要过一段 tPD，OUT 才稳定。下面两段用的是同一张图，斜线区表示 OUT 正在变。',
      'In every cycle the tester does two things: it applies inputs at the drive time and looks at outputs at the strobe time. After a CLK edge the DUT needs tPD before OUT is stable. Both parts below use the same diagram; the hatched area means OUT is changing.',
    ),
    s1Title: loc('① Strobe 放在哪', '① Where to place the strobe'),
    s1Note: loc(
      '拖滑块或点三个位置。色带是第 n 拍 OUT 的有效窗口：tPD 之后、下一个 CLK 沿之前；Strobe 落在里面色带是绿的，落在外面变红。Period 固定 20 ns。',
      'Drag the slider or pick a position. The band is the valid window of OUT for cycle n: after tPD and before the next CLK edge. It turns green when the strobe is inside and red when it is outside. Period is fixed at 20 ns.',
    ),
    early: loc('太早', 'Too early'),
    window: loc('刚好', 'In window'),
    late: loc('太晚', 'Too late'),
    strobePos: loc('Strobe 位置', 'Strobe time'),
    winRange: loc('有效窗口', 'Valid window'),
    verdict: loc('判定', 'Result'),
    pass: loc('PASS', 'PASS'),
    fail: loc('FAIL', 'FAIL'),
    capEarly: loc(
      '太早：CLK 沿后还没到 tPD，OUT 仍在变（斜线区），采到的不是这一拍的结果，好芯片也 Fail。',
      'Too early: tPD has not passed since the CLK edge, so OUT is still changing (hatched). The tester does not see this cycle’s result, and even a good device fails.',
    ),
    capOk: loc(
      '刚好：OUT 已经稳定，下一拍还没开始变，采到的就是这一拍的结果。',
      'In window: OUT is stable and the next cycle has not started changing it, so the tester sees this cycle’s result.',
    ),
    capLate: loc(
      '太晚：已经过了下一个 CLK 沿，OUT 开始变成下一拍的值，比较的对象错了。',
      'Too late: the next CLK edge has passed and OUT is turning into the next cycle’s value, so the comparison is against the wrong data.',
    ),
    s2Title: loc('② AC 参数：在同一张图上量时间', '② AC parameters: measuring time on the same diagram'),
    s2Note: loc(
      '点参数看它量的是哪一段。再把 Period 往短里拖，看输出窗口什么时候装不下 Strobe。',
      'Pick a parameter to see which span it measures. Then drag Period shorter and watch when the output window can no longer hold the strobe.',
    ),
    period: loc('Period', 'Period'),
    freq: loc('频率', 'Frequency'),
    outWin: loc('输出窗口', 'Output window'),
    tsuGiven: loc('tSU 提供 / 规格', 'tSU given / spec'),
    thGiven: loc('tH 提供 / 规格', 'tH given / spec'),
    capPass: loc('Strobe 放在窗口中间，放得下，Pass。', 'The strobe fits in the middle of the window: pass.'),
    capFail: loc(
      '窗口不到 2 ns（或已经没有），Strobe 放不下，同一套向量 Fail。',
      'The window is under 2 ns (or gone), the strobe cannot fit, and the same vectors fail.',
    ),
    marginNote: loc(
      '本例 tPD = 8 ns，Strobe 至少要 2 ns 窗口（测试机边沿精度 + 沿本身的上升时间）。所以 Period ≥ 10 ns，fMAX = 100 MHz。tSU、tH 在这里一直够，先撞墙的是输出窗口。',
      'Here tPD = 8 ns and the strobe needs at least a 2 ns window (tester edge accuracy plus the edge’s own rise time). So Period ≥ 10 ns and fMAX = 100 MHz. tSU and tH stay sufficient here; the output window is what runs out first.',
    ),
    searchNote: loc(
      '真实测试不靠拖滑块：Go/No-Go 在规格点只判一次 Pass / Fail；要知道实际值，就让测试机反复跑，用二分搜索逼近边界，详见 {@fAc}。把两个条件一起扫成 Pass / Fail 图，详见 {@fChar}。',
      'Real tests do not use a slider. Go/No-Go checks pass / fail once at the spec point; to find the actual value, the tester reruns the test and closes in on the boundary with a binary search (see {@fAc}). Sweeping two conditions into a pass / fail plot is covered in {@fChar}.',
    ),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right or wrong with an explanation at once.'),
    kickerStrobe: loc('Strobe', 'Strobe'),
    kickerMark: loc('AC 参数', 'AC parameter'),
    strobeAsideTitle: loc('Strobe：什么时候看输出', 'Strobe: when to look at the output'),
    strobeAside: loc(
      'Drive 是测试机给输入换值的时刻，Strobe 是它比较输出的时刻（也叫 Compare）。Strobe 必须落在 OUT 已经稳定的窗口里。本课按最坏情况算：下一个 CLK 沿一到，OUT 就可能开始变，所以窗口右端取在下一个沿；真实芯片还会多保持一小段（输出保持时间），那是额外余量。',
      'Drive is when the tester changes an input; the strobe is when it compares the output (also called compare). The strobe must fall inside the window where OUT is stable. This lesson takes the worst case: OUT may start changing as soon as the next CLK edge arrives, so the window ends at that edge. Real devices hold the old value a little longer (output hold time), which is extra margin.',
    ),
    asideLater: loc(
      '沿速、抖动、传输线等信号完整性问题这里不展开。',
      'Edge rates, jitter, transmission lines and other signal-integrity topics are not covered here.',
    ),
    next: loc('下一课：测试向量开发', 'Next: Test Vector Development'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m10: {
    title: loc('测试向量开发', 'Test Vector Development'),
    goal: loc(
      '穷举为什么不行；三种向量从哪来；一条向量怎样抓住一个故障。',
      'Why exhaustive testing fails, where the three kinds of vectors come from, and how one vector catches one fault.',
    ),
    introTitle: loc('两个输入能穷举，几十个就不行', 'Two inputs can be exhausted; a few dozen cannot'),
    introBody: loc(
      '与门只有 00 / 01 / 10 / 11 四种输入，全跑一遍就行。输入一多，组合数按 2ⁿ 翻倍，测试时间先撑不住。所以真正的问题是：用尽量少的向量，抓住尽量多的坏芯片。',
      'An AND gate has only four inputs, 00 / 01 / 10 / 11, so you can run them all. With more inputs the count doubles as 2ⁿ and test time runs out first. The real question is how to catch as many bad devices as possible with as few vectors as possible.',
    ),
    explodeTitle: loc('① 穷举会爆炸', '① Exhaustive testing explodes'),
    explodeNote: loc(
      '拖输入位数 n，再拖内部触发器个数 s，看两条时间条怎么长。',
      'Drag the number of inputs n and the number of internal flip-flops s, and watch the two time bars grow.',
    ),
    knobN: loc('输入位数 n', 'Inputs n'),
    knobS: loc('触发器个数 s', 'Flip-flops s'),
    timeIn: loc('只看输入的时间', 'Time, inputs only'),
    timeState: loc('加上触发器的时间', 'Time, with flip-flops'),
    explodeSo: loc(
      '所以要换思路：不追求跑遍所有组合，而是按「电路可能怎么坏」挑向量。',
      'So change the approach: instead of running every combination, choose vectors by how the circuit might fail.',
    ),
    explodeWhy: loc(
      '为什么加触发器也是乘 2 的指数？组合电路的输出只由当前输入决定：n 个输入有 2ⁿ 种组合，每种跑一次就穷举完了。时序电路的输出还取决于触发器里存的内部状态：s 个触发器各存 0 或 1，共 2ˢ 种状态；同一组输入在不同状态下结果可能不同，所以每一种状态下都要把 2ⁿ 种输入试一遍，共 2ⁿ × 2ˢ = 2ⁿ⁺ˢ 条。小例子：n = 2、s = 1，4 种输入 × 2 种状态 = 8 条。而且状态不能从外部直接设，要先从 Pin 跑一串向量把芯片「带到」那个状态，这些额外的向量还没算进去，所以 2ⁿ⁺ˢ 只是下限。下图第二条时间条就按 2ⁿ⁺ˢ 条、每条 100 ns 算。',
      'Why do flip-flops also multiply by a power of 2? A combinational circuit’s output depends only on its present inputs: n inputs give 2ⁿ combinations, and running each once exhausts it. A sequential circuit’s output also depends on the internal state held in its flip-flops: s flip-flops, each holding 0 or 1, give 2ˢ states. The same inputs can give different results in different states, so all 2ⁿ inputs must be tried in every state: 2ⁿ × 2ˢ = 2ⁿ⁺ˢ vectors. Small example: n = 2, s = 1 gives 4 inputs × 2 states = 8. On top of that, the state cannot be set directly from outside; you first have to run a string of vectors through the pins to bring the chip into that state, and those extra vectors are not counted, so 2ⁿ⁺ˢ is only a lower bound. The second time bar below is computed for 2ⁿ⁺ˢ vectors at 100 ns each.',
    ),
    explodeAsideTitle: loc('穷举：2ⁿ 条，有触发器时 ≥ 2ⁿ⁺ˢ', 'Exhaustive: 2ⁿ, or ≥ 2ⁿ⁺ˢ with flip-flops'),
    explodeAside: loc(
      'n 个输入有 2ⁿ 种组合，每多 1 个输入条数翻倍。时序电路的输出还取决于 s 个触发器存的状态（2ˢ 种），每种状态下都要把 2ⁿ 种输入试一遍：2ⁿ × 2ˢ = 2ⁿ⁺ˢ。例如 n = 2、s = 1：4 × 2 = 8 条。状态又不能从 Pin 直接设，进入每个状态还要额外的向量，所以 2ⁿ⁺ˢ 只是下限。',
      'n inputs give 2ⁿ combinations; each extra input doubles the count. A sequential circuit’s output also depends on the state of its s flip-flops (2ˢ states), and all 2ⁿ inputs must be tried in each state: 2ⁿ × 2ˢ = 2ⁿ⁺ˢ. For n = 2, s = 1 that is 4 × 2 = 8. The state cannot be set directly from the pins, and reaching each state takes extra vectors, so 2ⁿ⁺ˢ is only a lower bound.',
    ),
    sourceTitle: loc('② 三种向量从哪来', '② Where the three kinds of vectors come from'),
    sourceNote: loc(
      '点一种看它由谁提供、怎么生成、测试工程师要做什么。大部分向量不是测试工程师从零手写的：Functional 主要来自设计验证仿真，ATPG / Scan 来自 DFT 工程师。Algorithmic 和 ATPG 都是自动生成，但对象不同，不要把 March 叫成 ATPG。',
      'Pick one to see who provides it, how it is made, and what the test engineer does with it. Most vectors are not written from scratch by the test engineer: functional vectors mostly come from design-verification simulation, and ATPG / scan vectors come from the DFT engineer. Algorithmic and ATPG vectors are both generated automatically but target different things; a March test is not ATPG.',
    ),
    faultTitle: loc('③ 故障模型：一条向量抓一个故障', '③ Fault models: one vector catches one fault'),
    faultNote: loc(
      '故障模型就是「假设电路会怎样坏」。最常用的 Stuck-at：某个节点粘死在 0 或 1。选一个故障，再逐条试输入，看哪条让好芯片和坏芯片的输出不同。',
      'A fault model is an assumption about how the circuit fails. The most common, stuck-at, says a node is stuck at 0 or 1. Pick a fault, then try inputs one by one to see which makes the good and faulty outputs differ.',
    ),
    pickVec: loc('输入 AB：', 'Inputs AB:'),
    tranTitle: loc('Transition 故障：要一对向量', 'Transition faults need a pair of vectors'),
    tranNote: loc(
      '节点能到 0 也能到 1，只是跳得太慢。一条静态向量看不出来，要先放旧值、再发起跳变、用快时钟去采。',
      'The node can reach both 0 and 1; it just switches too slowly. A single static vector cannot show this: set the old value, launch the transition, then sample with a fast clock.',
    ),
    tranAside: loc(
      'Transition（跳变延迟）故障问的是「这一拍来不来得及」。V1 初始化，V2 发起跳变，Capture 用接近工作频率的时钟。Stuck-at 只问电平对不对。',
      'A transition (delay) fault asks "does it make it within this cycle?". V1 initializes, V2 launches the transition, and capture uses a clock near the operating frequency. Stuck-at only asks whether the level is right.',
    ),
    moreTitle: loc('再往下走', 'Going further'),
    scanNote: loc(
      '上面的与门输入直接接在管脚上。真芯片里大多数节点藏在触发器后面，从管脚既设不了也看不到，ATPG 很难做。Scan 把触发器串成链，让内部状态能移进、移出，详见 {@scan}。',
      'The AND gate above is wired straight to pins. In a real chip most nodes sit behind flip-flops that pins can neither set nor observe, which makes ATPG very hard. Scan links the flip-flops into a chain so internal state can be shifted in and out; see {@scan}.',
    ),
    moreNote: loc(
      '向量怎样从设计仿真转出来、Print on Strobe / Print on Change、格式转换和向量压缩，详见 {@fVector}。',
      'How vectors are extracted from design simulation, print-on-strobe / print-on-change, format conversion and vector compression are covered in {@fVector}.',
    ),
    takeawayTitle: loc('本课要点', 'Key points'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'You see right or wrong with an explanation at once.'),
    kickerExplode: loc('穷举', 'Exhaustive'),
    kickerSource: loc('向量来源', 'Vector source'),
    kickerFault: loc('故障模型', 'Fault model'),
    asideLater: loc(
      'March 算法表不用背。DFT、压缩、at-speed Scan 留给后面的课。',
      'No need to memorize March tables. DFT, compression and at-speed scan come in later lessons.',
    ),
    next: loc('下一课：Scan Test', 'Next: Scan test'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m11: {
    title: loc('Scan Test', 'Scan Test'),
    goal: loc(
      '把内部 FF 串成一条链，才能测到外部 Pin 够不到的状态。',
      'Chain the internal FFs together so you can test state that no external pin can reach.',
    ),
    asideLater: loc(
      '先能画出 Scan FF 和那条链，说清四步。压缩、At-speed 这些以后再学。',
      'First be able to draw a scan FF and the chain and explain the four steps. Compression and at-speed come later.',
    ),
    next: loc('下一课：', 'Next: '),
  },

  m12: {
    title: loc('测试程序与排错', 'Test Program and Debug'),
    goal: loc(
      '测试程序是一张 Flow：一项项测，Fail 即停并分 Bin。程序不工作时，先查共用的东西。',
      'A test program is a flow: test item by item, stop at the first failure and bin the part. When the program fails, check shared things first.',
    ),
    asideLater: loc(
      '不写某家测试机的指令。能说清 Flow、四件套和排查顺序就够了。',
      'No vendor-specific tester code. Being able to explain the flow, the four parts and the debug order is enough.',
    ),
    next: loc('下一课：', 'Next: '),
  },

  m14: {
    title: loc('Yield、Characterization、Shmoo', 'Yield, Characterization and Shmoo'),
    goal: loc(
      '量产钉在几个条件上判 Bin；表征扫出芯片能工作到哪条边界、离规格还有多少裕量。',
      'Production checks a few conditions and bins the part; characterization maps where the chip stops working and how much margin is left.',
    ),
    asideLater: loc(
      '每一格用的都是同一套功能向量，变的只是 VDD 和频率。',
      'Every cell uses the same functional vectors; only VDD and frequency change.',
    ),
    next: loc('下一课：', 'Next: '),
  },

  m15: {
    title: loc('虚拟 4-bit ALU 的 Test Program', 'Test Program for a Virtual 4-bit ALU'),
    goal: loc(
      '把前面学的串成一条闭环：规格 → 测试项 → 向量 → Timing / DC → 运行 → 排错。每一步当场判对错。',
      'Tie the earlier lessons into one loop: specs → tests → vectors → timing / DC → run → debug. Every step is checked on the spot.',
    ),
    introTitle: loc('用一颗教学 ALU 把前面串起来', 'One teaching ALU ties it all together'),
    introBody: loc(
      'A、B 各 4 位进去，OP 告诉它算什么，Y 和 Carry 出来。按向导走七步；第 6 步逐拍运行，第 7 步注入故障并定位。',
      'A and B (4 bits each) go in, OP selects the operation, Y and Carry come out. Follow the seven steps: step 6 runs cycle by cycle, step 7 injects and locates a fault.',
    ),
    portTitle: loc('先认这颗 ALU', 'Meet the ALU'),
    portNote: loc('这些脚就是每条向量要 Drive / Compare 的对象。', 'These pins are what every vector drives and compares.'),
    step: loc('步骤', 'Step'),
    injectNote: loc('选一种故障。第 3 步勾过的向量按正确 Timing 立刻重跑。', 'Pick a fault. The vectors from step 3 rerun at once with correct timing.'),
    causeNote: loc('根因：只看红行的规律来选。', 'Root cause: choose from the pattern of red rows only.'),
    needVec: loc('先在第 3 步勾向量。', 'Select vectors in step 3 first.'),
    takeawayTitle: loc('带走这一句', 'Takeaway'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'Each answer is checked and explained at once.'),
    kickerStep: loc('向导', 'Wizard'),
    asideLater: loc('不用手写某家 Tester 的 API，意图对了就过关。', 'No vendor-specific tester code is needed; getting the intent right is enough.'),
    next: loc('下一课：Latch-up 入口', 'Next: Latch-up primer'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m16: {
    title: loc('Latch-up 入口', 'Latch-up Primer'),
    goal: loc(
      '能指出 CMOS 里寄生的 PNPN 在哪，说清它怎么被触发、为什么撤掉触发还锁着。',
      'Locate the parasitic PNPN in CMOS and explain how it triggers and why it stays latched after the trigger is gone.',
    ),
    introTitle: loc('不是功能向量写错了', 'Not a wrong vector'),
    introBody: loc(
      'Latch-up（闩锁）：CMOS 结构里寄生的 PNPN 被触发后，VDD 到 GND 形成低阻通路，电流大到能烧坏芯片。它靠正反馈自己维持，只有掉电才解除。',
      'Latch-up: once the parasitic PNPN inside a CMOS structure is triggered, VDD and GND are joined by a low-resistance path and the current can destroy the chip. Positive feedback keeps it on; only power-down clears it.',
    ),
    figTitle: loc('剖面：寄生 PNPN 在哪', 'Cross-section: where the PNPN hides'),
    figNote: loc('点卡片或图里的元件，对应部分会高亮。', 'Click a card or a part in the figure to highlight it.'),
    animTitle: loc('动画：从触发到锁住', 'Animation: from trigger to latch'),
    animNote: loc('一步一步看：触发 → 正反馈 → IDD 飙升 → 撤触发仍锁着 → 掉电解除。', 'Step through: trigger → feedback → IDD soars → still latched without trigger → power-down clears it.'),
    testTitle: loc('和测试的关系', 'What it means in test'),
    takeawayTitle: loc('带走这一句', 'Takeaway'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'Each answer is checked and explained at once.'),
    kickerFig: loc('结构', 'Structure'),
    kickerAnim: loc('过程', 'Sequence'),
    kickerTakeaway: loc('本课要点', 'Key point'),
    asideLater: loc('完整的闩锁测试（触发方式、限流、参数）在 {@fLatch}。', 'The full latch-up test (trigger methods, current limit, parameters) is in {@fLatch}.'),
    next: loc('下一课：交互实验', 'Next: Interactive bench'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  m17: {
    title: loc('交互实验', 'Interactive Bench'),
    goal: loc('自己拧参数，立刻看到波形和 Pass / Fail。', 'Turn the knobs yourself and see the waveform and pass / fail at once.'),
    introTitle: loc('拧旋钮，不要只背名字', 'Turn knobs, do not just memorize names'),
    introBody: loc(
      '三个实验台：时序、漏电、向量与 Stuck-at。概念来自 {@timing}、{@pmu}、{@vector} 和 {@alu}，这里让结果跟着你的手变。',
      'Three benches: timing, leakage, and vectors with stuck-at faults. The ideas come from {@timing}, {@pmu}, {@vector} and {@alu}; here the result follows your hand.',
    ),
    tabTime: loc('时序', 'Timing'),
    tabLeak: loc('漏电 / PMU', 'Leakage / PMU'),
    tabPat: loc('向量 / Stuck-at', 'Vectors / Stuck-at'),
    patTitle: loc('跑一组向量，注入 Stuck-at', 'Run vectors and inject a stuck-at fault'),
    patNote: loc('数值都写成四位二进制 [3][2][1][0]，最右是 [0]。红字是和期望不同的位。', 'Values are 4-bit binary [3][2][1][0], rightmost is [0]. Red bits differ from expected.'),
    patPick: loc('点一行可勾选 / 取消该向量：', 'Click a row to include or exclude that vector:'),
    patBits: loc('运行结果（位序 Y[3] Y[2] Y[1] Y[0] · C）：', 'Results (bit order Y[3] Y[2] Y[1] Y[0] · C):'),
    patAside: loc('红行就是能测到这个故障的向量；一条红行都没有，说明向量没覆盖它。', 'Red rows are the vectors that detect this fault; no red row means the vectors do not cover it.'),
    timeTitle: loc('自己排一拍', 'Place the strobe yourself'),
    timeNote: loc('横轴固定 0–40 ns：Period 变大，每一拍就变宽。', 'The axis is fixed at 0–40 ns: a longer period makes each cycle wider.'),
    leakTitle: loc('漏电：Force → Measure → Limit', 'Leakage: Force → Measure → Limit'),
    leakNote: loc(
      'DUT 漏电随电压变。Force 3.3 V、Limit 10 μA 应 Pass；Limit 改成 2 μA 应 Fail。完整的 IIL / IIH 测试见 {@dc}。',
      'DUT leakage follows the voltage. Force 3.3 V with a 10 μA limit should pass; a 2 μA limit should fail. Full IIL / IIH tests are in {@dc}.',
    ),
    force: loc('Force 电压', 'Force voltage'),
    limit: loc('判定上限', 'Test limit'),
    leakHint: loc('PMU 测的是数值，不问 0 / 1：Force → Measure → 和 Limit 比 → Pass / Fail。', 'The PMU measures a value, not 0 / 1: Force → Measure → compare to limit → pass / fail.'),
    presetEarly: loc('示例：Strobe = 3 ns（太早）', 'Example: Strobe = 3 ns (too early)'),
    presetOk: loc('示例：Strobe = 7 ns（在窗口内）', 'Example: Strobe = 7 ns (inside the window)'),
    presetLate: loc('示例：Strobe = Period（太晚）', 'Example: Strobe = Period (too late)'),
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'Each answer is checked and explained at once.'),
    kickerTime: loc('时序', 'Timing'),
    kickerLeak: loc('PMU', 'PMU'),
    kickerPat: loc('向量', 'Vectors'),
    kickerQuiz: loc('复习', 'Review'),
    asideLater: loc('Setup / Hold / tpd 的定义在 {@timing}。这里只问：你把比较点放在哪。', 'Setup / hold / tpd are defined in {@timing}. Here the only question is where you put the compare point.'),
    next: loc('下一课：虚拟 ATE 操作系统', 'Next: Virtual ATE Training System'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
  },

  vate: {
    title: loc('虚拟 ATE 操作系统', 'Virtual ATE Training System'),
    goal: loc(
      '像操作真机一样：配测试条件、选资源、Run、读 Datalog，并说清芯片为什么 PASS、FAIL 或读数无效。',
      'Work it like a real tester: set conditions, pick resources, run, read the datalog, and explain why the chip passes, fails or gives an invalid reading.',
    ),
  },

  fund: {
    quizTitle: loc('复习题', 'Review questions'),
    quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
    takeawayTitle: loc('带走这几句', 'Key takeaways'),
    yes: loc('对。', 'Correct. '),
    no: loc('不对。', 'Not quite. '),
    pass: loc('PASS', 'PASS'),
    fail: loc('FAIL', 'FAIL'),
    next: loc('下一课：', 'Next: '),
  },

  m18: {
    title: loc('器件规格书', 'Device Specification'),
    goal: loc('读懂一份数字芯片规格书：每一行都是“在什么条件下，量什么，极限多少”。', 'Read a digital chip data sheet: every line says "under what conditions, measure what, against what limit".'),
  },

  m19: {
    title: loc('开短路测试', 'Opens/Shorts Test'),
    goal: loc('用 PMU 打一个小电流，读保护二极管电压，判断管脚是接好、开路还是短路。', 'Force a small current with the PMU, read the protection diode voltage, and judge whether a pin is connected, open or shorted.'),
  },

  m20: {
    title: loc('DC 参数测试', 'DC Parametric Tests'),
    goal: loc('VOH/VOL、IDD、IIL/IIH、IOZ、VI、IOS：怎么测、按什么顺序测、Fail 了怎么看 Datalog。', 'VOH/VOL, IDD, IIL/IIH, IOZ, VI, IOS: how to test them, in what order, and how to read the datalog on a Fail.'),
  },

  m21: {
    title: loc('功能测试', 'Functional Testing'),
    goal: loc(
      '信号格式、Strobe、向量字符、Time Set 和 DFT。把“跑向量”拆成能调的每一个旋钮。',
      'Signal formats, strobes, vector characters, time sets and DFT. Break "running vectors" down into every knob you can adjust.',
    ),
  },

  m22: {
    title: loc('AC 参数测试', 'AC Parametric Testing'),
    goal: loc(
      'Setup、Hold、传输延迟、脉宽、fMAX：Go/No-Go 判一次，或者用二分搜索把边界找出来。',
      'Setup, hold, propagation delay, pulse width, fMAX: judge once with Go/No-Go, or find the boundary with a binary search.',
    ),
  },

  fBasics: {
    title: loc('电学与数字逻辑基础', 'Electrical and Digital Logic Basics'),
    goal: loc(
      '工程计数法、电压电流电阻、用欧姆定律测电阻、二 / 十 / 十六进制、逻辑电平和基本门电路。',
      'Engineering notation, voltage, current and resistance, measuring resistance with Ohm\'s law, binary / decimal / hex, logic levels and basic gates.',
    ),
  },

  fAte: {
    title: loc('晶圆、封装与测试设备', 'Wafers, Packages and Test Equipment'),
    goal: loc(
      '芯片从晶圆到封装要被测两次。认识探针台、分选机、负载板，以及四类测试机。',
      'A chip is tested twice on its way from wafer to package. Meet the prober, handler, load board and the four classes of tester.',
    ),
  },

  fIntro: {
    title: loc('测试入门：DUT、PMU 与管脚电子', 'Getting Started: DUT, PMU and Pin Electronics'),
    goal: loc(
      'DUT 有哪些管脚、测试程序分几段、测试系统里有什么；PMU 怎么 Force / Measure、为什么一定要设钳位。',
      'What pins a DUT has, how a test program is divided, what is inside a test system; how the PMU forces and measures, and why a clamp must always be set.',
    ),
  },

  fChar: {
    title: loc('器件表征', 'Device Characterization'),
    goal: loc(
      '找出芯片真正能工作到哪里：二分搜索、线性搜索、Shmoo 图和 Datalog。',
      'Find out how far the chip can really go: binary search, linear search, shmoo plots and the datalog.',
    ),
  },

  fVector: {
    title: loc('测试向量开发', 'Test Vector Development'),
    goal: loc('向量文件长什么样、仿真数据怎么变成向量、给设计工程师的 Simulation for Test 守则。', 'What a vector file looks like, how simulation data becomes vectors, and the Simulation for Test guidelines for design engineers.'),
  },

  fProgram: {
    title: loc('测试程序开发要点', 'Test Program Development Essentials'),
    goal: loc('工程 / 表征 / 量产三种程序；开发前要想清楚的事；上电下电顺序；分 Bin 和测试汇总。', 'Engineering, characterization and production programs; what to settle before development; power-up and power-down sequences; binning and the test summary.'),
  },

  fCreate: {
    title: loc('编写测试程序', 'Creating a Test Program'),
    goal: loc('从规格书列测试计划、定管脚映射，先写负载板测试，再一步步让新程序第一次跑起来。', 'Build the test plan from the spec, define the pin map, write the load board test first, then bring up the new program step by step.'),
  },

  fDebug: {
    title: loc('排错', 'Troubleshooting'),
    goal: loc('Fail 了先怀疑谁：DUT、接口硬件、测试机、测试程序。逐个排除，再用好调试工具。', 'When a test fails, who do you suspect first: DUT, interface hardware, tester, or test program? Rule them out one by one, then make good use of the debug tools.'),
  },

  fQualify: {
    title: loc('程序验证与文档', 'Qualifying the Program & Documentation'),
    goal: loc('程序写完还不能交：留样品、查 Margin、Shmoo 每个向量、验证分 Bin，最后整理文档包。', 'A finished program is not ready to release yet: keep samples, check margins, Shmoo every vector set, verify binning, and finally assemble the documentation package.'),
  },

  fLatch: {
    title: loc('CMOS 闩锁测试', 'CMOS Latch-up Testing'),
    goal: loc('寄生 SCR 怎么被触发，以及怎么用过压和注入电流去“故意点火”，看芯片会不会锁住。', 'How the parasitic SCR gets triggered, and how to use overvoltage and injected current to "light the fuse on purpose" and see whether the device latches up.'),
  },

  fScan: {
    title: loc('Scan 测试原理', 'Scan Test Principles'),
    goal: loc('时序电路为什么难测；Scan 怎么把触发器串成移位寄存器；Flush / Shift 测试和 Scan 专用测试机。', 'Why sequential circuits are hard to test; how scan chains flip-flops into a shift register; flush / shift tests and dedicated scan testers.'),
  },
}
