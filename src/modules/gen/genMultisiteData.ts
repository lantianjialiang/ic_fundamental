import { loc, type LText } from '../../i18n/locale'
import type { QuizQuestion } from '../../lab/QuizList'
import { type MsParams } from './model/multisite'

export const M = {
  nextPrefix: loc('下一课：', 'Next: '),
  kickerNow: loc('这一组参数的结果', 'Result for these settings'),
  introTitle: loc('Multi-site：一次碰几颗，效率和成本怎么变', 'Multi-site: how efficiency and cost change with sites per touchdown'),
  coreTitle: loc('拨一拨：Site 数、时间与成本', 'Try it: site count, time and cost'),
  coreNote: loc(
    '测试机一次可以同时接 N 颗（N 个 Site）。Index 时间和并行的测试时间不随 N 变，但共享资源（电源、数字通道、逐颗执行的测量步骤）要排队，随 N 线性增加。下面的参数都是教学示意值，拨动它们看 UPH、并行效率和 COT 怎么变。',
    'The tester can test N devices at once (N sites). Index time and the parallel test time do not change with N, but shared resources (supplies, digital channels, measurement steps run device by device) queue up and grow linearly with N. The values below are illustrative; move them to see how UPH, parallel efficiency and COT change.',
  ),
  nLabel: loc('Site 数 N', 'Site count N'),
  indexLabel: loc('T_idx 索引（Index）时间', 'T_idx index time'),
  parLabel: loc('T_par 并行测试时间', 'T_par parallel test time'),
  serLabel: loc('T_ser 每个 Site 的串行时间', 'T_ser serial time per site'),
  retestLabel: loc('r 重测率', 'r retest rate'),
  cBaseLabel: loc('C_base 系统每小时费用', 'C_base system cost per hour'),
  cSiteLabel: loc('C_site 每增加一个 Site 的每小时费用', 'C_site extra cost per hour per site'),
  chTotalLabel: loc('通道总数', 'Total channels'),
  chDutLabel: loc('每颗 DUT 需要的通道', 'Channels needed per DUT'),
  rMaxLabel: loc('Site 上限 N_max', 'Site limit N_max'),
  rTdLabel: loc('T_td 一次 Touchdown', 'T_td per touchdown'),
  rUphLabel: loc('UPH（颗 / 小时）', 'UPH (parts per hour)'),
  rEffLabel: loc('并行效率 η', 'Parallel efficiency η'),
  rCotLabel: loc('COT（美分 / 颗）', 'COT (cents per part)'),
  rHourLabel: loc('每小时费用', 'Hourly cost'),
  overLimit: loc('超过通道上限，不可行', 'Above the channel limit; not feasible'),
  curveAria: loc('单颗测试成本随 Site 数变化的曲线，可行的最低点标出', 'Cost per part versus site count, with the feasible minimum marked'),
  curveCap: loc(
    '横轴是 Site 数 N，纵轴是 COT（美分 / 颗）。灰色虚线段超过通道上限，不可行。方块是当前 N，菱形是可行范围内 COT 最低的 N。',
    'The x-axis is the site count N and the y-axis is COT (cents per part). The grey dashed part is above the channel limit and not feasible. The square marks the current N; the diamond marks the feasible N with the lowest COT.',
  ),
  curveX: loc('Site 数 N', 'Site count N'),
  curveY: loc('COT（美分 / 颗）', 'COT (cents per part)'),
  formulaTitle: loc('公式（当前参数代入）', 'Formulas (with the current settings)'),
  formulaNote: loc(
    '吞吐与效率由时间决定，成本由费用与吞吐共同决定。η 下降来自 T_ser 随 N 线性增加，而 T_idx 与 T_par 不变。',
    'Throughput and efficiency come from the timing; cost comes from the hourly cost divided by throughput. η falls because T_ser grows linearly with N while T_idx and T_par stay fixed.',
  ),
  curveWhy: loc(
    'COT 为什么先降后升：N 增加时 UPH 提高，但每小时费用也增加（C_site），而 η 下降让 UPH 的增长越来越慢。两者在某个 N 处相抵，COT 最低；它常常在通道上限之前就到了。',
    'Why COT falls and then rises: as N grows, UPH rises, but the hourly cost also rises (C_site) and falling η slows the UPH gain. The two balance at one N, where COT is lowest; this often happens before the channel limit.',
  ),
  asideBestOk: loc('当前 N 就是 COT 最低的可行点。', 'The current N is the lowest-COT feasible point.'),
  asideBestNo: loc(
    '当前 N 不是 COT 最低点。看曲线：η 下降抵消了 UPH 的增长后，COT 才会到达最低。',
    'The current N is not the COT minimum. On the curve, COT only reaches its lowest point once falling η cancels the UPH gain.',
  ),
  asideOver: loc('当前 N 超过了通道上限，只能算理论值，实际上不可行。', 'The current N is above the channel limit; the numbers are theoretical and not achievable.'),
  asideLater: loc(
    '模型只保留主要项：Index、并行、串行、重测和费用。真实产线还要看测试机排队、Handler 节拍、相关性和良率；这些在后续课程中再讲。',
    'The model keeps the main terms: index, parallel, serial, retest and cost. A real line also has tester queueing, handler timing, correlation and yield effects, which later lessons cover.',
  ),
  siteTitle: loc('Site 相关性：用 STDF 的 SITE_NUM 分组', 'Site correlation: group STDF by SITE_NUM'),
  siteNote: loc(
    '同一批器件分到 4 个 Site 测试。若某个 Site 的测试通道、负载板或探针有系统偏差，它的测得值会整体偏移，总良率却不一定变差。把 STDF 读回来，按 PIR / PTR / PRR 里的 SITE_NUM 分组，才能看出是哪个 Site。',
    'The parts in one lot are split across 4 sites. If one site has a systematic bias (a channel, a load-board path or a probe), its readings shift as a group, while the overall yield may barely change. Read the STDF back and group by SITE_NUM from PIR / PTR / PRR to see which site it is.',
  ),
  injectBtn: loc('注入偏移（随机选一个 Site）', 'Inject offset (random site)'),
  clearBtn: loc('清除偏移', 'Clear offset'),
  guessLabel: loc('我认为异常的 Site', 'The site I think is abnormal'),
  guessNone: loc('先选一个 Site。', 'Pick a site first.'),
  guessNoInject: loc('还没有注入偏移：各 Site 的均值应该接近，先注入再判断。', 'No offset injected yet: the site means should be close. Inject first, then judge.'),
  guessOk: loc('判对：这个 Site 的 VOH 均值明显偏低，与其它 Site 不同。', 'Correct: this site’s VOH mean is clearly lower than the others.'),
  guessBad: loc('不对：这个 Site 的均值与其它 Site 接近，再看看别的 Site。', 'Not it: this site’s mean is close to the others; check the other sites.'),
  colSite: loc('Site', 'Site'),
  colN: loc('颗数', 'Parts'),
  colFails: loc('失效数', 'Fails'),
  colMean: loc('VOH 均值（V）', 'VOH mean (V)'),
  colDelta: loc('与其它 Site 的差（mV）', 'Difference vs other sites (mV)'),
  siteEnd: loc(
    '关键是看均值，不是看失效数：VOH 的限值是 2.4–3.6 V，偏移 −90 mV 只把均值从 3.30 V 拉到 3.21 V，远离下限，所以失效数几乎不变。只有按 SITE_NUM 分组看均值、标准差和 Cpk 才能暴露它。',
    'Look at the mean, not the fail count: VOH limits are 2.4–3.6 V, so a −90 mV offset only moves the mean from 3.30 V to 3.21 V, far from the lower limit; fails barely change. Only grouping by SITE_NUM and looking at the mean, standard deviation and Cpk reveals it.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  prereqTitle: loc('补充：本课用到的预设知识', 'Supplement: background used in this lesson'),
  prereqNote: loc('正文里的吞吐、效率与成本公式都从这里推出。', 'The throughput, efficiency and cost formulas in the lesson are built from these.'),
  tasksNote: loc('完成情况由当前参数与操作自动判定。', 'Judged automatically from your settings and actions.'),
  task1: loc(
    '把 Site 数 N 调到使 COT 最低的值（以曲线最低点和 COT 读数为准）。',
    'Set the site count N to the value that gives the lowest COT (judge by the curve minimum and the COT readout).',
  ),
  task2: loc(
    '把 N 调到通道允许的上限，记下 UPH 与 η，并说明为什么 η 会下降。',
    'Set N to the channel-limited maximum, note UPH and η, and explain why η falls.',
  ),
  task3: loc(
    '把串行时间 T_ser 调到 0，确认 η 变成 100%；再说明共享资源如何限制并行。',
    'Set the serial time T_ser to 0 and confirm η becomes 100%; then explain how shared resources limit parallelism.',
  ),
  task4: loc(
    '诊断：点“注入偏移”，在下面按 SITE_NUM 分组的表里找出异常 Site，并在下方选中它。',
    'Diagnose: click “Inject offset”, find the abnormal site in the table grouped by SITE_NUM, and select it below.',
  ),
  nMaxNote: loc(
    '通道上限 = floor(通道总数 / 每颗通道数)，Site 数再多也用不上通道。',
    'Channel limit = floor(total channels / channels per DUT); extra sites have no channels to use.',
  ),
}

export const FORMULAS: string[] = [
  'T_td(N) = T_idx + T_par + N · T_ser',
  'UPH(N) = 3600 · N / (T_td(N) · (1 + r))',
  'η(N) = UPH(N) / (N · UPH(1))',
  'C_hour(N) = C_base + N · C_site',
  'COT(N) = C_hour(N) / UPH(N)',
  'N ≤ floor(CH_total / CH_DUT)',
]

export const INTRO: Array<{ zh: string; en: string }> = [
  {
    zh: '数字课 {@ate} 讲过一颗 DUT 怎么接到 ATE 上。量产时一台测试机常常同时测多颗，这叫 Multi-site（多 Site 同测）。一次同测的一组颗数叫一次 Touchdown：Handler 或 Prober 把这组器件一起压到接口上，测完一起取走。',
    en: 'The digital lesson {@ate} covered how one DUT connects to the ATE. In production one tester often tests several devices at once; this is multi-site testing. One group tested together is a touchdown: the handler or prober presses the group onto the interface, tests it, and removes it together.',
  },
  {
    zh: '同测省的是时间，但不是线性省：Index（移动器件）和并行测试只做一次，而共享的测量步骤要逐颗排队。这决定了 UPH 怎么随 Site 数增长，也决定了测试成本 COT（单颗测试成本）有没有最低点。',
    en: 'Multi-site saves time, but not linearly: indexing and the parallel test happen once per touchdown, while shared measurement steps queue device by device. That sets how UPH grows with the site count and whether the cost per part (COT) has a minimum.',
  },
  {
    zh: '同测还带来一个问题：多个 Site 的数据混在一个文件里。要知道某个 Site 有没有问题，必须按 STDF 里的 SITE_NUM 分组看。这一课的第二个实验就是这样做的，数据来自 {@genStdf} 里写出、读回的同一种文件。',
    en: 'Multi-site also mixes several sites’ data in one file. To know whether a site is at fault, group by SITE_NUM in STDF. The second experiment does this, using the same kind of file written and read back in {@genStdf}.',
  },
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'Site 越多，每小时产出越高，所以越多越好。Site 增加时，共享资源形成的串行部分也随 N 增加，η 下降；每小时费用也上升。COT 有一个最低点，多了反而变贵。',
    'More sites means more output per hour, so more is always better. As N grows, the shared serial part grows too, η falls, and the hourly cost rises. COT has a minimum, and going past it makes each part more expensive.',
  ),
  loc(
    '并行效率 100% 才是理想，低于 100% 就是测试机有毛病。η = 100% 要求 T_ser = 0，实际上数字通道、电源、测量步骤都有共享部分；η 低说明串行部分大，应找出是哪一步在排队。',
    'Parallel efficiency of 100% is the ideal, and anything lower means the tester is broken. η = 100% needs T_ser = 0; in practice digital channels, supplies and measurement steps are shared. A low η means a large serial part; find the step that is queueing.',
  ),
  loc(
    '各 Site 的良率一样，就说明各 Site 没问题。良率可能掩盖偏差：偏移只让均值移动，只要仍在限值之内，良率就不变。要按 SITE_NUM 看均值、标准差和 Cpk。',
    'If every site has the same yield, no site has a problem. Yield can hide a bias: an offset only moves the mean, and while the readings stay inside the limits the yield does not change. Look at the mean, standard deviation and Cpk by SITE_NUM.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Site 数 N 决定一次 Touchdown 同测几颗。Index 与并行时间固定，共享的串行时间随 N 增加，所以 UPH 不会随 N 线性增长，并行效率 η 随之下降。COT = C_hour / UPH，而 C_hour 也随 N 增加，于是 COT 有一个最低点，通常在通道上限之前。多 Site 的数据必须按 STDF 的 SITE_NUM 分组，偏移才能被发现。',
  'The site count N sets how many devices one touchdown tests. Index and parallel time are fixed, while the shared serial time grows with N, so UPH does not grow linearly and parallel efficiency η falls. COT = C_hour / UPH, and C_hour also rises with N, so COT has a minimum, usually before the channel limit. Multi-site data must be grouped by SITE_NUM in STDF before an offset can be found.',
)

export const PREREQ: LText[] = [
  loc(
    '吞吐（UPH）：每小时测完的颗数。一次 Touchdown 测 N 颗、用时 T 秒，则 UPH = 3600 · N / T（3600 秒 = 1 小时）。',
    'Throughput (UPH): parts finished per hour. One touchdown of N parts taking T seconds gives UPH = 3600 · N / T (3600 s = 1 hour).',
  ),
  loc(
    '并行与串行：并行部分同时进行，与颗数无关；串行部分逐颗排队，与颗数成正比。总时间 = 并行部分 + 串行部分。',
    'Parallel and serial: the parallel part runs at once regardless of the count; the serial part queues device by device and grows with the count. Total time = parallel part + serial part.',
  ),
  loc(
    '效率：η = 实际吞吐 ÷ 理想吞吐。理想吞吐是 N 倍的单 Site 吞吐，所以 η = UPH(N) / (N · UPH(1))。η 为 1 时没有任何损失。',
    'Efficiency: η = actual throughput ÷ ideal throughput. The ideal is N times the single-site throughput, so η = UPH(N) / (N · UPH(1)). η = 1 means no loss at all.',
  ),
  loc(
    '成本换算：每小时费用 ÷ 每小时颗数 = 每颗费用。1 美元 = 100 美分，所以 COT（美分）= 100 · C_hour / UPH。',
    'Cost conversion: hourly cost ÷ parts per hour = cost per part. One dollar is 100 cents, so COT (cents) = 100 · C_hour / UPH.',
  ),
  loc(
    '分组统计：按某个键（如 SITE_NUM）把记录分组，每组求颗数、失效数和均值。均值的差距再和标准差比较，才知道差距是否有意义。',
    'Grouped statistics: group records by a key such as SITE_NUM, then compute the count, fail count and mean per group. Compare the gap between means with the standard deviation to judge whether it matters.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('T_td(N) = T_idx + T_par + N · T_ser 中，哪一项会随 Site 数 N 增加？', 'In T_td(N) = T_idx + T_par + N · T_ser, which term grows with the site count N?'),
    options: [
      { id: 'a', text: loc('T_idx（索引时间）', 'T_idx (index time)') },
      { id: 'b', text: loc('T_par（并行测试时间）', 'T_par (parallel test time)') },
      { id: 'c', text: loc('N · T_ser（共享资源的串行部分）', 'N · T_ser (serial part from shared resources)') },
      { id: 'd', text: loc('三项都不随 N 变', 'None of them change with N') },
    ],
    answer: 'c',
    explain: loc(
      '索引与并行只做一次，共享资源造成的串行部分逐颗排队，随 N 线性增加。',
      'Indexing and the parallel test happen once per touchdown; the serial part from shared resources queues per device and grows linearly with N.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('若 T_idx = 1.5 s、T_par = 0.8 s、T_ser = 0，那么 η(16) 是多少？', 'If T_idx = 1.5 s, T_par = 0.8 s and T_ser = 0, what is η(16)?'),
    options: [
      { id: 'a', text: loc('33%', '33%') },
      { id: 'b', text: loc('50%', '50%') },
      { id: 'c', text: loc('100%', '100%') },
      { id: 'd', text: loc('1600%', '1600%') },
    ],
    answer: 'c',
    explain: loc(
      'η = (T_idx + T_par + T_ser) / (T_idx + T_par + N·T_ser)。T_ser = 0 时分子分母相等，η = 100%；这说明没有串行部分就没有效率损失。',
      'η = (T_idx + T_par + T_ser) / (T_idx + T_par + N·T_ser). With T_ser = 0 numerator and denominator match, so η = 100%: without a serial part there is no efficiency loss.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('为什么 COT 最低的 Site 数常常不是通道上限？', 'Why is the lowest-COT site count often not the channel limit?'),
    options: [
      { id: 'a', text: loc('通道上限总是最优的，这个问题没有例外。', 'The channel limit is always optimal; there are no exceptions.') },
      {
        id: 'b',
        text: loc(
          'C_site 让每小时费用随 N 增加，而 η 下降又让 UPH 的增长变慢，两者抵消后 COT 先降后升。',
          'C_site makes the hourly cost rise with N, and falling η slows the UPH gain. Together they make COT fall and then rise.',
        ),
      },
      { id: 'c', text: loc('COT 与 N 无关。', 'COT does not depend on N.') },
      { id: 'd', text: loc('UPH 随 N 增加而下降。', 'UPH falls as N grows.') },
    ],
    answer: 'b',
    explain: loc(
      'UPH 仍在增长，但增长越来越慢，而费用每个 Site 都在加。两个因素相抵的那一点 COT 最低。',
      'UPH keeps rising, but ever more slowly, while the cost climbs with every site. COT is lowest where the two effects balance.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('重测率 r 从 0 增加到 0.1，UPH 会怎样变？', 'If the retest rate r rises from 0 to 0.1, what happens to UPH?'),
    options: [
      { id: 'a', text: loc('增加 10%', 'Increases by 10%') },
      { id: 'b', text: loc('保持不变', 'Stays the same') },
      { id: 'c', text: loc('变为原来的 1/1.1', 'Becomes 1/1.1 of the original') },
      { id: 'd', text: loc('变为原来的 0.9', 'Becomes 0.9 of the original') },
    ],
    answer: 'c',
    explain: loc(
      'UPH = 3600·N / (T_td·(1 + r))。重测多花的时间让有效吞吐除以 (1 + r)，所以是原来的 1/1.1。',
      'UPH = 3600·N / (T_td · (1 + r)). Retest time divides the effective throughput by (1 + r), so it is 1/1.1 of the original.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('要找出一个异常的 Site，最合适的做法是什么？', 'What is the best way to find one abnormal site?'),
    options: [
      { id: 'a', text: loc('只看总良率。', 'Look only at overall yield.') },
      { id: 'b', text: loc('数 PRR 的 HARD_BIN 总数。', 'Count the HARD_BIN totals in PRR.') },
      { id: 'c', text: loc('按 SITE_NUM 分组，比较每组参数的均值与失效数。', 'Group by SITE_NUM and compare each group’s parameter means and fail counts.') },
      { id: 'd', text: loc('删掉这个 Site 的文件。', 'Delete that site’s file.') },
    ],
    answer: 'c',
    explain: loc(
      '偏移让某个 Site 的均值整体移动，总良率可能不变；按 SITE_NUM 分组并比较均值，才能看见它。',
      'An offset moves one site’s mean as a whole while the overall yield may not change; grouping by SITE_NUM and comparing means exposes it.',
    ),
  },
]

export const DEFAULT_MS: MsParams = {
  indexS: 1.5,
  parS: 0.8,
  serS: 0.35,
  retest: 0,
  cBase: 150,
  cPerSite: 8,
  chTotal: 512,
  chPerDut: 32,
}

/** 诊断批次中注入的偏移（V），作用在 VOH 上 */
export const INJECT_OFFSET_V = -0.09
export const DIAG_SITES = 4
