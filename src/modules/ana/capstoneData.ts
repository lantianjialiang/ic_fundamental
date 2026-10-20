import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { cpk } from './core/stats'
import { DUT_COUNT, ITEMS, SPEC, type BatchResult, type ItemId } from './capstoneModel'

/** 通过门槛（示意）：良率不低于 80%，每项 Cpk 不低于 1.00，stopOnFail 开启后平均每颗测试时间不超过 175 ms */
export const YIELD_TARGET = 0.8
export const CPK_TARGET = 1.0
export const STOP_TIME_TARGET_MS = 175

/**
 * 带占位符的文案：{0}、{1} … 按顺序换成数值。
 * 数字由代码算出后填进来，文案本身不用模板字符串，所以中文只出现在 loc() 的参数里。
 */
export function fill(text: LText, ...values: string[]): LText {
  const apply = (s: string): string => s.replace(/\{(\d+)\}/g, (_, i: string) => values[Number(i)] ?? '')
  const filled = { ...text }
  filled.zh = apply(text.zh)
  if (text.en !== undefined) {
    filled.en = apply(text.en)
  }
  return filled
}

export function pct(value: number): string {
  return (value * 100).toFixed(1)
}

export function fmtCpk(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '—'
}

export const ITEM_NAME: Record<ItemId, LText> = {
  idd: loc('VDD 电流 IDD', 'VDD supply current (IDD)'),
  vref: loc('基准电压 VREF', 'Reference voltage (VREF)'),
  offset: loc('ADC 偏移 OFFSET', 'ADC offset (OFFSET)'),
  lnr: loc('LDO 线性调整率 LNR', 'LDO line regulation (LNR)'),
}

export const S = {
  kickerNow: loc('这一批测试', 'This test run'),
  introTitle: loc('把前面各课串成一个测试程序', 'Put the earlier lessons into one test program'),
  coreTitle: loc('搭测试程序，跑一批 DUT', 'Build the test program and run a batch of DUTs'),
  coreNote: loc(
    '每一行是一项测试，从上到下执行；上移、下移改顺序。右边的 guardband 决定这一项的测试限值：规格向内收这么多。下方结果随设置即时更新。',
    'Each row is one test, run from top to bottom; use the arrows to reorder. On the right, the guardband sets the test limit: the spec pulled inward by that amount. Results below update as you change settings.',
  ),
  orderHead: loc('测试项（自上而下执行）', 'Test item (run top to bottom)'),
  guardHead: loc('guardband（限值向内收）', 'Guardband (limit pulled inward)'),
  moveUp: loc('上移', 'Move up'),
  moveDown: loc('下移', 'Move down'),
  stopLabel: loc('某一项 Fail 之后', 'After a test item fails'),
  stopContinue: loc('继续测完全部项（默认）', 'Keep testing every item (default)'),
  stopOn: loc('stopOnFail：立即停止', 'stopOnFail: stop at once'),
  batchLabel: loc('批次种子', 'Batch seed'),
  newBatch: loc('换一批 DUT', 'New batch of DUTs'),
  resultTitle: loc('运行结果', 'Run results'),
  resultNote: loc(
    '同一批 DUT 由种子固定生成。改顺序、guardband 或 stopOnFail 只改测试程序、不改 DUT，所以可以在同一批上比较。',
    'The batch is fixed by its seed. Changing order, guardband or stopOnFail changes only the program, not the DUTs, so you can compare settings on the same batch.',
  ),
  rYield: loc('良率', 'Yield'),
  rAvgTime: loc('平均每颗测试时间', 'Average test time per DUT'),
  rOverkill: loc('误杀（好品被判 Fail）', 'Overkill (good parts failed)'),
  rEscape: loc('漏检（坏片被判 Pass）', 'Escape (bad parts passed)'),
  rCpk: loc('Cpk（按规格，每项）', 'Cpk (vs spec, per item)'),
  rVerdict: loc('判定（良率与 Cpk 都达标）', 'Verdict (yield and Cpk both met)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  csvBtn: loc('下载 CSV', 'Download CSV'),
  csvAria: loc('下载这一批 DUT 的测试结果 CSV', 'Download the test-result CSV for this batch of DUTs'),
  csvNote: loc(
    'CSV 每颗 DUT 一行：dut_id、每项的值与 PASS / FAIL、final_bin。表头是英文，方便机器读取。',
    'The CSV has one row per DUT: dut_id, each item’s value and PASS / FAIL, then final_bin. Headers are in English so machines can read them.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '这里的 DUT、故障率、噪声和耗时都是示意。真实量产还要考虑重测、温度和测试机成本，见 {@anaStats}。',
    'The DUTs, fault rate, noise and test times here are illustrative. Real production also weighs retest, temperature and tester cost; see {@anaStats}.',
  ),
  vLowYieldTitle: loc('良率偏低', 'Low yield'),
  vLowCpkTitle: loc('Cpk 偏低', 'Low Cpk'),
  vGoodTitle: loc('满足目标', 'Targets met'),
  task1: loc('良率 ≥ {0}%（良率 = 通过数 ÷ 测试数）。', 'Yield ≥ {0}% (yield = passed ÷ tested).'),
  task2: loc('开启 stopOnFail 后，平均每颗测试时间 ≤ {0} ms。', 'With stopOnFail on, average test time per DUT ≤ {0} ms.'),
  task3: loc('四项的 Cpk 都 ≥ {0}（只算实际执行过的读数）。', 'Cpk of all four items ≥ {0} (only readings actually taken).'),
  task4: loc('导出的 CSV 行数正确：{0} 行数据 + 1 行表头。', 'The exported CSV has the right row count: {0} data rows + 1 header row.'),
}

export const FIG = {
  binAria: loc('Bin 柱状图：每个 Bin 的颗数，满格为 100 颗', 'Bin bar chart: count per bin, full scale 100 DUTs'),
  binTitle: loc('Bin 分布（颗数）', 'Bin distribution (count)'),
  binCap: loc(
    'Bin 1 是全部通过的良品；其它 Bin 各对应一项测试。不开 stopOnFail 时 DUT 会跑完全部项，但 Bin 仍取执行顺序中第一个 Fail 的那一项，所以调换顺序会让颗数在各 Bin 之间移动。',
    'Bin 1 is the good part that passed every item; the other bins each stand for one test. Without stopOnFail every DUT runs all items, but its bin still comes from the first failing item in run order, so changing the order moves parts between bins.',
  ),
  good: loc('良品', 'Good'),
  yieldAria: loc('每项通过率条形图，按执行顺序自上而下', 'Pass-rate bars for each item, top to bottom in run order'),
  yieldTitle: loc('每项通过率（按执行顺序）', 'Pass rate per item (run order)'),
  yieldCap: loc(
    '每一条是这一项的通过率，只统计实际执行过这一项的 DUT。stopOnFail 开启后，前面就 Fail 的 DUT 进不了后面的项，后面项的分母会变小。',
    'Each bar is the pass rate of one item, counting only DUTs that actually ran it. With stopOnFail on, DUTs that fail early never reach later items, so those items have a smaller denominator.',
  ),
}

export const INTRO = [
  loc(
    '{@anaStats} 讲了 guardband、Cpk 与良率各自是什么；{@anaLdo} 和 {@anaStatic} 给出了几个具体的测试项。这一课把它们装进同一个测试程序：排顺序、定限值、决定遇 Fail 是否停，再统计一批虚拟芯片。',
    '{@anaStats} explains guardband, Cpk and yield; {@anaLdo} and {@anaStatic} give concrete test items. This lesson puts them into one test program: set the order, set the limits, decide whether to stop at a fail, then tally a batch of virtual chips.',
  ),
  loc(
    '测试程序的整体结构见 {@anaOverview}。这一课只练四件事：排出测试顺序；为每一项选 guardband；决定遇到 Fail 是否立即停止；统计良率、Bin 分布与 Cpk，并导出 CSV。器件是虚构的 VDUT-CAP1，数值都是示意。',
    'The overall structure of a test program is in {@anaOverview}. This lesson practises four things: order the tests; pick a guardband for each; decide whether to stop at the first fail; tally yield, bins and Cpk, then export CSV. The device VDUT-CAP1 is fictional and all values are illustrative.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    'guardband 越大越保险。guardband 只能挡住落在规格边缘、靠测量噪声侥幸通过的坏片；收得越多，落在窄出那一圈的好品就越多被误杀。',
    'A bigger guardband is always safer. Guardband only blocks bad parts that sit near the spec edge and pass only because of measurement noise; the more it tightens the limit, the more good parts near the edge are failed.',
  ),
  loc(
    '开了 stopOnFail，测试时间一定大减。省下的时间只取决于失效比例和失效项的位置：良品仍要跑完全部项，失效率低时省的时间很少。排错和表征时要关掉它，才能看全部数据。',
    'With stopOnFail on, test time always drops a lot. The saving depends only on the fail rate and where the fails sit: good parts still run every item, and at a low fail rate little time is saved. Turn it off for debug and characterization to see all the data.',
  ),
  loc(
    'Cpk 高，这批就没有坏片。Cpk 只是这批测量值的均值与标准差相对规格的余量；几颗坏片可能只让它小幅下降，所以良率必须逐颗统计 Pass / Fail。',
    'A high Cpk means the batch has no bad parts. Cpk only summarizes the batch mean and spread against the spec; a few bad parts may lower it only slightly, so yield must be counted part by part as Pass / Fail.',
  ),
  loc(
    '测试时间与顺序无关。全部跑完时确实无关；开启 stopOnFail 后，把失效率高、耗时短的项放在前面，平均时间才会降下来。',
    'Test time does not depend on order. True when every item runs; with stopOnFail on, putting high-fail-rate, short items first is what brings the average time down.',
  ),
]

export const TAKEAWAY: LText = loc(
  '测试程序 = 顺序 + 限值（规格 − guardband）+ 停止策略 + Bin 分配。Cpk 按规格算，所以不随 guardband 变；误杀与漏检要一起看，收紧限值会换来漏检减少、误杀增加；导出的 CSV 每颗 DUT 一行、表头用英文，便于机器读取。',
  'Test program = order + limits (spec − guardband) + stop policy + bin assignment. Cpk is computed against the spec, so guardband does not change it. Read overkill and escape together: tightening the limit trades more overkill for fewer escapes. The CSV has one row per DUT and English headers so machines can read it.',
)

/** 通过率最低的测试项（只看实际执行过的） */
function worstPass(batch: BatchResult): { code: string; rate: string } {
  let best = -1
  for (let k = 0; k < batch.itemStats.length; k += 1) {
    const rate = batch.itemStats[k].passRate
    if (Number.isFinite(rate) && (best < 0 || rate < batch.itemStats[best].passRate)) {
      best = k
    }
  }
  if (best < 0) {
    return { code: '—', rate: '—' }
  }
  return { code: ITEMS[best].id.toUpperCase(), rate: pct(batch.itemStats[best].passRate) }
}

/** Cpk 最低的测试项 */
function worstCpk(batch: BatchResult): { code: string; value: string } {
  let best = -1
  for (let k = 0; k < batch.itemStats.length; k += 1) {
    const value = batch.itemStats[k].cpk
    if (Number.isFinite(value) && (best < 0 || value < batch.itemStats[best].cpk)) {
      best = k
    }
  }
  if (best < 0) {
    return { code: '—', value: '—' }
  }
  return { code: ITEMS[best].id.toUpperCase(), value: fmtCpk(batch.itemStats[best].cpk) }
}

/** 所有项的 Cpk 都有限且达标 */
export function cpkOk(batch: BatchResult): boolean {
  return batch.itemStats.every((stat) => Number.isFinite(stat.cpk) && stat.cpk >= CPK_TARGET)
}

/** 右侧说明栏：先判良率，再判 Cpk；每一句都给出原因 */
export function verdictOf(batch: BatchResult): { title: LText; text: LText } {
  const yieldText = pct(batch.yieldRate)
  const targetPct = String(Math.round(YIELD_TARGET * 100))
  if (batch.yieldRate < YIELD_TARGET) {
    const worst = worstPass(batch)
    return {
      title: S.vLowYieldTitle,
      text: fill(
        loc(
          '良率 {0}%，低于目标 {1}%。通过率最低的是 {2}（{3}%）。先看误杀（本批 {4} 颗）：误杀多，说明限值（含 guardband）收得太紧；误杀少，失效就是真坏片造成的。',
          'Yield {0}% is below the {1}% target. The lowest pass rate is {2} ({3}%). Check overkill first ({4} in this batch): many overkills mean the limit, guardband included, is too tight; few means the fails are real bad parts.',
        ),
        yieldText,
        targetPct,
        worst.code,
        worst.rate,
        String(batch.overkill),
      ),
    }
  }
  if (!cpkOk(batch)) {
    const worst = worstCpk(batch)
    return {
      title: S.vLowCpkTitle,
      text: fill(
        loc(
          '{0} 的 Cpk 为 {1}，低于 {2}。Cpk 只看这批测量值的均值与标准差：坏片和测量噪声都会拉大标准差，余量随之变小。',
          '{0} has Cpk {1}, below {2}. Cpk uses only the batch mean and standard deviation: bad parts and measurement noise both widen the spread, so the margin shrinks.',
        ),
        worst.code,
        worst.value,
        CPK_TARGET.toFixed(2),
      ),
    }
  }
  return {
    title: S.vGoodTitle,
    text: fill(
      loc(
        '良率 {0}%，所有项 Cpk ≥ {1}。误杀 {2} 颗，漏检 {3} 颗。Cpk 按规格算，不随 guardband 变；guardband 只在误杀与漏检之间做取舍。',
        'Yield {0}%, and every item has Cpk ≥ {1}. Overkill {2}, escape {3}. Cpk is computed against the spec, so guardband does not change it; guardband only trades overkill against escape.',
      ),
      yieldText,
      CPK_TARGET.toFixed(2),
      String(batch.overkill),
      String(batch.escape),
    ),
  }
}

/** 四张任务卡：完成与否由当前设置与结果实时算出（重置即还原） */
export function taskItems(batch: BatchResult, stopOnFail: boolean, csv: string): TaskItem[] {
  return [
    {
      id: 'yield',
      text: fill(S.task1, String(Math.round(YIELD_TARGET * 100))),
      done: batch.yieldRate >= YIELD_TARGET,
    },
    {
      id: 'stop',
      text: fill(S.task2, String(STOP_TIME_TARGET_MS)),
      done: stopOnFail && batch.avgTimeMs <= STOP_TIME_TARGET_MS,
    },
    {
      id: 'cpk',
      text: fill(S.task3, CPK_TARGET.toFixed(2)),
      done: cpkOk(batch),
    },
    {
      id: 'csv',
      text: fill(S.task4, String(DUT_COUNT)),
      done: csv.split('\n').length === DUT_COUNT + 1,
    },
  ]
}

/* ---------- 小测：答案全部由模型常量算出，改了模型，题干和解析自动跟着变 ---------- */

const IDD_USL = SPEC.idd.usl ?? 0
const IDD_GB = SPEC.idd.guardbands[1]
const STOP_TIME_ALL = ITEMS.reduce((sum, item) => sum + item.timeMs, 0)
/** 例题：USL = 6.0，μ = 5.0，σ = 0.25，只看上限 */
const CPK_EXAMPLE = cpk(6.0, null, 5.0, 0.25)
const CPK_WRONG_2SIGMA = (6.0 - 5.0) / (2 * 0.25)
const CPK_WRONG_NO3 = (6.0 - 5.0) / 0.25

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: fill(
      loc('IDD 的规格上限是 {0} mA。guardband 设为 {1} mA 时，测试限值的上限是多少？', 'The IDD spec upper limit is {0} mA. With a guardband of {1} mA, what is the test upper limit?'),
      IDD_USL.toFixed(1),
      IDD_GB.toFixed(1),
    ),
    options: [
      { id: 'a', text: loc(`${(IDD_USL - IDD_GB).toFixed(1)} mA`, `${(IDD_USL - IDD_GB).toFixed(1)} mA`) },
      { id: 'b', text: loc(`${(IDD_USL + IDD_GB).toFixed(1)} mA`, `${(IDD_USL + IDD_GB).toFixed(1)} mA`) },
      { id: 'c', text: loc(`${IDD_USL.toFixed(1)} mA`, `${IDD_USL.toFixed(1)} mA`) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '测试限值 = 规格 − guardband = {0} − {1} = {2} mA。guardband 把上限往里收，挡住的是靠测量噪声侥幸通过的坏片；它不会放宽限值，所以 {3} mA 是把符号写反了，{4} mA 则是忘了 guardband。',
        'Test limit = spec − guardband = {0} − {1} = {2} mA. The guardband pulls the upper limit inward to block bad parts that pass only because of measurement noise; it never loosens the limit. So {3} mA has the sign backwards, and {4} mA ignores the guardband.',
      ),
      IDD_USL.toFixed(1),
      IDD_GB.toFixed(1),
      (IDD_USL - IDD_GB).toFixed(1),
      (IDD_USL + IDD_GB).toFixed(1),
      IDD_USL.toFixed(1),
    ),
  },
  {
    id: 'q2',
    prompt: fill(
      loc('四项全部跑完，每颗 DUT 耗时 {0} ms。开启 stopOnFail 后，一颗 DUT 在第一项 IDD 就 Fail，它耗时多少？', 'Running all four items takes {0} ms per DUT. With stopOnFail on, a DUT fails at the first item, IDD. How long does it take?'),
      String(STOP_TIME_ALL),
    ),
    options: [
      { id: 'a', text: loc(`${ITEMS[0].timeMs} ms`, `${ITEMS[0].timeMs} ms`) },
      { id: 'b', text: loc(`${STOP_TIME_ALL} ms`, `${STOP_TIME_ALL} ms`) },
      { id: 'c', text: loc('0 ms', '0 ms') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'IDD 测完就 Fail，后面三项都不执行，只耗时 {0} ms。关闭 stopOnFail 时要跑完 {1} ms，省下的时间就来自这些被跳过的项。',
        'IDD fails right after it is measured, so the other three items never run and the DUT takes only {0} ms. With stopOnFail off the full {1} ms is spent; the saving comes from the skipped items.',
      ),
      String(ITEMS[0].timeMs),
      String(STOP_TIME_ALL),
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      'USL = 6.0，批内均值 μ = 5.0，σ = 0.25，只看上限。这一项的 Cpk 是多少？',
      'USL = 6.0, batch mean μ = 5.0, σ = 0.25, upper limit only. What is the Cpk of this item?',
    ),
    options: [
      { id: 'a', text: loc(CPK_WRONG_2SIGMA.toFixed(2), CPK_WRONG_2SIGMA.toFixed(2)) },
      { id: 'b', text: loc(CPK_EXAMPLE.toFixed(2), CPK_EXAMPLE.toFixed(2)) },
      { id: 'c', text: loc(CPK_WRONG_NO3.toFixed(2), CPK_WRONG_NO3.toFixed(2)) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'Cpk = (USL − μ) ÷ (3σ) = (6.0 − 5.0) ÷ (3 × 0.25) = {0}。如果把 3σ 写成 2σ，会得到 {1}；如果漏掉分母里的 3，会得到 {2}，两者都不对。',
        'Cpk = (USL − μ) ÷ (3σ) = (6.0 − 5.0) ÷ (3 × 0.25) = {0}. Writing 3σ as 2σ gives {1}; dropping the 3 from the denominator gives {2}. Both are wrong.',
      ),
      CPK_EXAMPLE.toFixed(2),
      CPK_WRONG_2SIGMA.toFixed(2),
      CPK_WRONG_NO3.toFixed(2),
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'DUT 在 IDD 与 OFFSET 两项都 Fail。测试顺序是默认顺序，且没有开 stopOnFail，它进哪个 Bin？',
      'A DUT fails both IDD and OFFSET. The order is the default one, and stopOnFail is off. Which bin does it go to?',
    ),
    options: [
      { id: 'a', text: loc(`Bin ${SPEC.offset.bin}`, `Bin ${SPEC.offset.bin}`) },
      { id: 'b', text: loc('Bin 1', 'Bin 1') },
      { id: 'c', text: loc(`Bin ${SPEC.idd.bin}`, `Bin ${SPEC.idd.bin}`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'Bin 取执行顺序中第一个 Fail 的项。默认顺序里 IDD 排第一，所以进 Bin {0}。如果把 OFFSET 调到 IDD 前面，它就会进 Bin {1}。',
        'The bin comes from the first failing item in run order. In the default order IDD comes first, so the part goes to bin {0}. If OFFSET is moved ahead of IDD, it goes to bin {1}.',
      ),
      String(SPEC.idd.bin),
      String(SPEC.offset.bin),
    ),
  },
  {
    id: 'q5',
    prompt: loc('导出 100 颗 DUT 的 CSV（含表头）后，文件有多少行？', 'After exporting the CSV for 100 DUTs (with the header), how many lines does the file have?'),
    options: [
      { id: 'a', text: loc(`${DUT_COUNT}`, `${DUT_COUNT}`) },
      { id: 'b', text: loc(`${DUT_COUNT + 1}`, `${DUT_COUNT + 1}`) },
      { id: 'c', text: loc(`${DUT_COUNT + 2}`, `${DUT_COUNT + 2}`) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '每颗 DUT 一行，再加 1 行表头，共 {0} 行。文件最后一行后面不加换行符，所以按换行切分正好是 {0} 段；若在末尾多写一个换行，切分就会多出一段空串。',
        'One row per DUT plus one header row gives {0} lines. The file has no newline after its last line, so splitting on newlines gives exactly {0} pieces; an extra trailing newline would add an empty piece.',
      ),
      String(DUT_COUNT + 1),
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '把 guardband 从 0 调大，误杀（好品被判 Fail）与漏检（坏片被判 Pass）会怎样变化？',
      'If the guardband is raised from 0, how do overkill (good parts failed) and escape (bad parts passed) change?',
    ),
    options: [
      { id: 'a', text: loc('误杀增加，漏检减少', 'Overkill rises, escape falls') },
      { id: 'b', text: loc('误杀与漏检都减少', 'Both overkill and escape fall') },
      { id: 'c', text: loc('误杀减少，漏检增加', 'Overkill falls, escape rises') },
    ],
    answer: 'a',
    explain: loc(
      '测试限值向规格内收，落在窄出那一圈的好品被判 Fail 得更多（误杀增加）；靠测量噪声侥幸通过的坏片被挡住得更多（漏检减少）。两头不能同时最优，要按误杀与漏检的代价取舍。',
      'The test limit moves inward, so more good parts in the narrowed band fail (overkill rises), and more bad parts that squeak through on measurement noise are blocked (escape falls). Both cannot be minimized at once; the choice depends on the cost of each.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '开启 stopOnFail 后，怎样排序最省测试时间（各项失效率相近时）？',
      'With stopOnFail on, which ordering saves the most test time (when the items have similar fail rates)?',
    ),
    options: [
      { id: 'a', text: loc('耗时长的项放前面', 'Put the long items first') },
      { id: 'b', text: loc('顺序不影响测试时间', 'The order does not change test time') },
      { id: 'c', text: loc('失效率高、耗时短的项放前面', 'Put high-fail-rate, short items first') },
    ],
    answer: 'c',
    explain: loc(
      '设两项 A（80 ms）与 B（20 ms）的失效率都是 p。B 在前，期望耗时 = 20 + (1 − p) × 80 = 100 − 80p；A 在前，期望耗时 = 80 + (1 − p) × 20 = 100 − 20p。B 在前平均每颗少 60p ms。排序依据是「失效率 ÷ 耗时」，大的放前面。',
      'Take two items, A (80 ms) and B (20 ms), each with fail rate p. B first: expected time = 20 + (1 − p) × 80 = 100 − 80p. A first: expected time = 80 + (1 − p) × 20 = 100 − 20p. B first saves 60p ms per DUT on average. Sort by fail rate ÷ time, largest first.',
    ),
  },
]
