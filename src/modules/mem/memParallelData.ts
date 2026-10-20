import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  CAP_IDS,
  CAP_MBIT,
  CH_PER_DUT,
  CH_TOTAL,
  type CapId,
  FAIL_BITS,
  FAIL_DEPTH,
  FAIL_IDS,
  type FailId,
  N_MAX,
  type ParallelResult,
  type ParallelState,
  patternSeconds,
  SITE_COUNTS,
} from './memParallelModel'

export const CAP_OPTIONS: Array<{ id: CapId; label: LText }> = [
  { id: CAP_IDS[0], label: loc('1 Mbit', '1 Mbit') },
  { id: CAP_IDS[1], label: loc('4 Mbit', '4 Mbit') },
  { id: CAP_IDS[2], label: loc('16 Mbit', '16 Mbit') },
]

export const FAIL_OPTIONS: Array<{ id: FailId; label: LText }> = [
  { id: FAIL_IDS[0], label: loc(`少（${FAIL_BITS.few} 位）`, `Few (${FAIL_BITS.few} bits)`) },
  { id: FAIL_IDS[1], label: loc(`中（${FAIL_BITS.some} 位）`, `Some (${FAIL_BITS.some} bits)`) },
  { id: FAIL_IDS[2], label: loc(`多（${FAIL_BITS.many} 位）`, `Many (${FAIL_BITS.many} bits)`) },
]

export const SITE_OPTIONS: Array<{ id: string; label: string }> = SITE_COUNTS.map((n) => ({ id: String(n), label: String(n) }))

export const S = {
  kickerNow: loc('这一批次', 'This batch'),
  introTitle: loc('并行测试：一份图形同时驱动几颗器件', 'Parallel test: one pattern drives several devices at once'),
  coreTitle: loc('固定通道数，选择 Site 数', 'Fixed channels: choose the number of sites'),
  coreNote: loc(
    `ATE 有 ${CH_TOTAL} 个通道，每颗器件要 ${CH_PER_DUT} 个，Site 数最多 floor(${CH_TOTAL} ÷ ${CH_PER_DUT}) = ${N_MAX}。图形（地址、命令、时序）共享，各 Site 的失效数据各存一份，深度有限。左图是吞吐随 Site 数的变化，右图是失效存储器的占用。`,
    `The ATE has ${CH_TOTAL} channels and each device needs ${CH_PER_DUT}, so the number of sites is at most floor(${CH_TOTAL} ÷ ${CH_PER_DUT}) = ${N_MAX}. The pattern (addresses, commands, timing) is shared, while each site stores its own fail data in a limited depth. The left plot shows throughput against sites; the right plot shows fail-memory use.`,
  ),
  capLabel: loc('被测容量', 'Device capacity'),
  failLabel: loc('每颗器件的失效位数（最坏批次）', 'Failing bits per device (worst batch)'),
  siteLabel: loc(`Site 数（上限 ${N_MAX}）`, `Sites (max ${N_MAX})`),
  rCh: loc('通道占用', 'Channels used'),
  rTime: loc('批次时间（s）', 'Batch time (s)'),
  rThr: loc('吞吐（颗 / 小时）', 'Throughput (devices / hour)'),
  rSpeed: loc('相对单 Site 的倍数', 'Speed-up vs one site'),
  rFill: loc('每 Site 失效存储器占用', 'Fail memory used per site'),
  rTotal: loc('全部 Site 合计的失效记录', 'Fail records across all sites'),
  rShare: loc('失效读出占批次时间', 'Readout share of batch time'),
  titleFull: loc('Fail Memory 占满', 'Fail memory full'),
  titleChannel: loc('通道上限', 'Channel limit'),
  titleNear: loc('接近线性增长', 'Close to linear growth'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的并行测试还要考虑每个 Site 的继电器切换、插座接触、分选机的搬运节拍，以及各 Site 之间的测试时间差；这里只练通道、图形共享、失效存储器三件事。',
    'Real parallel test also deals with relay switching per site, socket contact, handler timing, and differences between sites; here we only practise channels, shared patterns and fail memory.',
  ),
  next: loc('下一课：测试覆盖率与良率', 'Next: Test Coverage and Yield'),
  task1: loc(
    '1 Mbit、失效很少：把 Site 数调到上限，看吞吐接近按 Site 数成比例增长。',
    '1 Mbit with few failures: set the sites to the limit and see throughput grow close to proportionally.',
  ),
  task2: loc('大量失效、Site 数到上限：找出 Fail Memory 占满、吞吐增长放缓的状态。', 'Many failures with sites at the limit: find the state where fail memory is full and throughput flattens.'),
  task3: loc('把容量改成 16 Mbit，记下单颗图形时间，并和 1 Mbit 比较。', 'Change the capacity to 16 Mbit, note the pattern time per device, and compare it with 1 Mbit.'),
}

export const FIG = {
  pairAria: loc(
    '左图是吞吐随 Site 数的变化，右图是各 Site 数下失效存储器的合计，两图的 Site 数对齐',
    'Left: throughput against site count; right: total fail-memory across sites for each site count. The two charts share the same site axis',
  ),
  leftAria: loc(
    '吞吐随 Site 数变化的折线图：三条线分别是失效少、中、多，当前设置用粗线标出',
    'Throughput against site count: three lines for few, some and many failing bits; the current setting is drawn thicker',
  ),
  rightAria: loc(
    '各 Site 数下失效存储器合计占用的柱状图，当前 Site 数用高亮标出',
    'Bar chart of total fail-memory records across all sites for each site count; the current site count is highlighted',
  ),
  leftTitle: loc('吞吐（颗 / 小时）', 'Throughput (devices / hour)'),
  rightTitle: loc('失效记录合计（条）', 'Fail records in total'),
  limit: loc('通道上限', 'Channel limit'),
  xLabel: loc('Site 数', 'Sites'),
  few: loc('少', 'Few'),
  some: loc('中', 'Some'),
  many: loc('多', 'Many'),
  cap: loc(
    '左图：同一容量下三种失效级别的吞吐曲线，粗线是当前选择。右图：当前失效级别下，各 Site 数的失效存储器合计占用；每个 Site 的深度是 1024 条。',
    'Left: throughput curves for the three fail levels at the chosen capacity; the thick line is the current choice. Right: total fail-memory use for each site count at the current fail level; each site has a depth of 1024 records.',
  ),
}

export const INTRO = [
  loc(
    '{@memMarch} 的图形是为一颗器件跑的。量产时 ATE 会同时接几颗器件，让它们共用同一份图形，测试时间就不必随颗数线性增加。这一课只讲存储器特有的部分：共享图形、各自存失效数据，以及通道与失效存储器的限制。',
    'The {@memMarch} lesson runs its pattern on one device. In production the ATE connects several devices at once and lets them share one pattern, so test time does not grow linearly with the device count. This lesson covers only the memory-specific parts: a shared pattern, separate fail data, and the limits of channels and fail memory.',
  ),
  loc(
    '容量越大，单颗的图形时间越长；失效越多，失效数据的读出越慢。选 Site 数时要同时看这两件事，而不是只看通道够不够。',
    'Larger capacity makes each pattern run longer, and more failures make fail-data readout slower. Choosing the number of sites means looking at both, not only whether the channels fit.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '通道够了，Site 数就能无限加。通道只决定上限；失效数据的存储与读出会先让吞吐放缓。',
    'If there are enough channels, sites can be added without limit. Channels only set the ceiling; storing and reading out fail data slows throughput first.',
  ),
  loc(
    '各 Site 共享 Pattern，所以失效数据也可以合并存一份。失效数据属于每颗器件，合并以后就分不清哪颗坏、坏在哪里。',
    'Sites share the pattern, so their fail data could be merged into one store. Fail data belongs to each device; once merged, you cannot tell which device failed or where.',
  ),
  loc(
    '容量加大只是等得久一点，和并行无关。图形时间变长后，每小时测的颗数会明显减少，失效读出占的比例也会变，所以要重新算吞吐。',
    'A larger capacity just takes longer, unrelated to parallelism. Longer pattern time cuts the devices per hour noticeably, and the readout share changes too, so throughput must be recalculated.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Site 数 = floor(通道数 ÷ 每颗通道数)；图形共享，失效数据各存各的；吞吐 = 3600 × Site 数 ÷ 批次时间；失效存储器深度有限，读出时间与 Site 数成正比，所以高失效率下吞吐会饱和。',
  'Sites = floor(channels ÷ channels per device); the pattern is shared while fail data is stored per site; throughput = 3600 × sites ÷ batch time; fail memory depth is limited and readout time grows with sites, so throughput saturates at high failure counts.',
)

/** 小测题中的数字由模型算出 */
const TP_1M = patternSeconds(CAP_MBIT.m1)
const TP_4M = patternSeconds(CAP_MBIT.m4)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(`ATE 固定 ${CH_TOTAL} 个通道，每颗器件要 ${CH_PER_DUT} 个通道，同时最多能测几颗？`, `The ATE has ${CH_TOTAL} channels and each device needs ${CH_PER_DUT}. How many devices can be tested at once at most?`),
    options: [
      { id: 'a', text: loc('4 颗', '4 devices') },
      { id: 'b', text: loc(`${N_MAX} 颗`, `${N_MAX} devices`) },
      { id: 'c', text: loc('6 颗', '6 devices') },
    ],
    answer: 'b',
    explain: loc(
      `${CH_TOTAL} ÷ ${CH_PER_DUT} = ${(CH_TOTAL / CH_PER_DUT).toFixed(2)}，向下取整得 ${N_MAX}。余下 ${CH_TOTAL - N_MAX * CH_PER_DUT} 个通道不够再接一颗器件。`,
      `${CH_TOTAL} ÷ ${CH_PER_DUT} = ${(CH_TOTAL / CH_PER_DUT).toFixed(2)}, rounded down to ${N_MAX}. The remaining ${CH_TOTAL - N_MAX * CH_PER_DUT} channels are not enough for one more device.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('并行测试时，哪一部分可以在各 Site 之间共享？', 'In parallel test, which part can be shared among the sites?'),
    options: [
      { id: 'a', text: loc('每个 Site 的失效数据', 'Each site’s fail data') },
      { id: 'b', text: loc('每颗器件的修复结果', 'Each device’s repair result') },
      { id: 'c', text: loc('同一份图形的地址、命令与时序，同时驱动所有 Site', 'The same pattern of addresses, commands and timing, driving all sites at once') },
    ],
    answer: 'c',
    explain: loc(
      '共享的是图形与时序，所以测试时间不随 Site 数线性增加。失效数据和修复结果属于每颗器件自己，不能共享。',
      'The pattern and timing are shared, so test time does not grow linearly with sites. Fail data and repair results belong to each device and cannot be shared.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('为什么各 Site 的失效数据要分别存储？', 'Why must each site store its fail data separately?'),
    options: [
      { id: 'a', text: loc('为了节省 ATE 的内存', 'To save ATE memory') },
      { id: 'b', text: loc('为了让图形跑得更快', 'To make the pattern run faster') },
      { id: 'c', text: loc('不同器件的失效不同，要分别判定和修复', 'Different devices fail differently, so each must be judged and repaired separately') },
    ],
    answer: 'c',
    explain: loc(
      '每颗器件的坏位置不同，判定和修复都要靠它自己的失效地址。合并存储以后，就无法知道哪一颗在哪里失效。',
      'Each device has its own bad locations, and judgement and repair depend on its own fail addresses. Once merged, you cannot tell which device failed where.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('失效很多时，吞吐随 Site 数增加而放缓，主要原因是什么？', 'With many failures, throughput flattens as sites are added. What is the main reason?'),
    options: [
      { id: 'a', text: loc('Pattern 本身随 Site 数变长了', 'The pattern itself gets longer with more sites') },
      { id: 'b', text: loc('失效记录要经同一条数据通道读出，批次时间随 Site 数增长', 'Fail records are read out over one shared data path, so batch time grows with the number of sites') },
      { id: 'c', text: loc('晶圆温度升高，器件变慢', 'The wafer heats up and the devices slow down') },
    ],
    answer: 'b',
    explain: loc(
      '图形和索引时间与 Site 数无关；每个 Site 的失效读出时间却要累加。失效越多，读出越久，增加 Site 带来的收益就越小。',
      'The pattern and indexing time do not depend on the site count, but each site’s fail readout adds up. More failures mean longer readout, so each extra site adds less.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(`1 Mbit 的 March C− 图形时间约 ${TP_1M.toFixed(3)} s。容量改成 4 Mbit、测试频率不变，图形时间大约是多少？`, `The March C− pattern for 1 Mbit takes about ${TP_1M.toFixed(3)} s. At 4 Mbit with the same test frequency, about how long is the pattern?`),
    options: [
      { id: 'a', text: loc('不变', 'Unchanged') },
      { id: 'b', text: loc(`约 ${TP_4M.toFixed(2)} s（4 倍）`, `About ${TP_4M.toFixed(2)} s (4 times)`) },
      { id: 'c', text: loc(`约 ${(TP_1M / 4).toFixed(3)} s（1/4）`, `About ${(TP_1M / 4).toFixed(3)} s (1/4)`) },
    ],
    answer: 'b',
    explain: loc(
      `图形时间 = 每单元操作数 × 单元数 ÷ 测试频率，与容量成正比。4 Mbit 的单元数是 1 Mbit 的 4 倍，所以约 ${TP_4M.toFixed(3)} s。`,
      `Pattern time = operations per cell × cells ÷ test frequency, which is proportional to capacity. 4 Mbit has four times the cells of 1 Mbit, so it takes about ${TP_4M.toFixed(3)} s.`,
    ),
  },
]

/** 右侧说明栏：结论 + 原因写在同一段；注意 Fail Memory 占满时的判断优先于通道上限 */
export function verdictOf(r: ParallelResult): { title: LText; text: LText; note: LText | null } {
  const share = (r.readShare * 100).toFixed(0)
  const speed = r.speedup.toFixed(2)
  const thr = Math.round(r.throughput).toString()
  const tPat = patternSeconds(r.cap).toFixed(3)
  const note = r.cap > 1
    ? loc(
      `容量 ${r.cap} Mbit：图形时间是 1 Mbit 的 ${r.cap} 倍（${tPat} s），每颗测得慢，吞吐因此下降，但并行的方式不变。`,
      `Capacity ${r.cap} Mbit: the pattern takes ${r.cap} times the 1 Mbit time (${tPat} s), so each device is slower and throughput drops, but the parallel scheme is unchanged.`,
    )
    : null
  if (r.overflow) {
    return {
      title: S.titleFull,
      text: loc(
        `每颗器件的失效有 ${FAIL_BITS.many} 条，超过每 Site 失效存储器的 ${FAIL_DEPTH} 条深度。超出的只能计数，不能存地址，修复分析会缺信息。${r.sites} 个 Site 各读出 ${r.stored} 条，读出占批次时间 ${share}%，所以吞吐增长放缓。`,
        `Each device has ${FAIL_BITS.many} failing bits, more than the ${FAIL_DEPTH}-record depth of each site’s fail memory. The extra bits can only be counted, not stored with their addresses, so repair analysis lacks information. ${r.sites} site(s) each read out ${r.stored} records, readout takes ${share}% of the batch, so throughput flattens.`,
      ),
      note,
    }
  }
  if (r.channelFull) {
    return {
      title: S.titleChannel,
      text: loc(
        `通道用了 ${r.channelsUsed}/${CH_TOTAL}，再加一个 Site 就需要 ${(r.sites + 1) * CH_PER_DUT} 个通道，放不下，这是通道上限。当前吞吐约 ${thr} 颗 / 小时，是单 Site 的 ${speed} 倍。`,
        `Channels used: ${r.channelsUsed}/${CH_TOTAL}. One more site would need ${(r.sites + 1) * CH_PER_DUT} channels, which do not fit, so this is the channel limit. Throughput is about ${thr} devices per hour, ${speed} times one site.`,
      ),
      note,
    }
  }
  return {
    title: S.titleNear,
    text: loc(
      `${r.sites} 个 Site 共用一份图形，批次时间只比 1 个 Site 多出失效读出的部分（占 ${share}%）。吞吐约为单 Site 的 ${speed} 倍，所有 Site 在同一段时间里并行测完。`,
      `${r.sites} sites share one pattern, so the batch takes only the extra fail readout (${share}% of the batch) more than one site. Throughput is about ${speed} times one site, and all sites finish in the same window.`,
    ),
    note,
  }
}

/** 三张任务卡：完成与否由当前设置和批次结果算出 */
export function taskItems(state: ParallelState, r: ParallelResult): TaskItem[] {
  return [
    { id: 'near', text: S.task1, done: state.cap === 'm1' && state.fail === 'few' && state.sites === N_MAX },
    { id: 'full', text: S.task2, done: state.fail === 'many' && state.sites === N_MAX && r.overflow },
    { id: 'cap16', text: S.task3, done: state.cap === 'm16' },
  ]
}
