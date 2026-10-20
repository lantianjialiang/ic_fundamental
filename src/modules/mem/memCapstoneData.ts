import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  type BatchSummary,
  BATCH,
  BIN_NAME_EN,
  BIN_NO,
  type Bin,
  type CapState,
  type CycleId,
  DEV_NAME,
  type DevKind,
  type DutSpec,
  formatUs,
  leakyAtSpec,
  limitNsOf,
  MARCH_OPS,
  type Outcome,
  passTimeUs,
  PERIOD_NS,
  PAUSE_OPTIONS,
  RET_OPS,
  SIZE,
  type Settings,
  SPEC_RET_MS,
  T_OP_US,
  T_SU_NS,
  TIMING_OPS,
} from './memCapstoneModel'

/** 界面用的选项：第一个是默认选中项（ID 顺序即显示顺序） */
export const DEV_OPTIONS: Array<{ id: DevKind; label: LText }> = [
  { id: 'sram', label: loc(`${DEV_NAME.sram}（同步 SRAM）`, `${DEV_NAME.sram} (sync SRAM)`) },
  { id: 'dram', label: loc(`${DEV_NAME.dram}（DRAM）`, `${DEV_NAME.dram} (DRAM)`) },
]

export const CYCLE_OPTIONS: Array<{ id: CycleId; label: LText }> = [
  { id: '100', label: loc(`100 MHz（${PERIOD_NS['100']} ns）`, `100 MHz (${PERIOD_NS['100']} ns)`) },
  { id: '125', label: loc(`125 MHz（${PERIOD_NS['125']} ns）`, `125 MHz (${PERIOD_NS['125']} ns)`) },
  { id: '80', label: loc(`80 MHz（${PERIOD_NS['80']} ns）`, `80 MHz (${PERIOD_NS['80']} ns)`) },
]

export const PAUSE_UI_OPTIONS: Array<{ id: string; label: LText }> = PAUSE_OPTIONS.map((ms) => ({
  id: String(ms),
  label: ms === SPEC_RET_MS ? loc(`${ms} ms（规格）`, `${ms} ms (spec)`) : loc(`${ms} ms`, `${ms} ms`),
}))

/** 单颗与批次的 Bin 名（页面显示用） */
export const BIN_LABEL: Record<Bin, LText> = {
  pass: loc('通过', 'Pass'),
  timing: loc('时序失败', 'Timing fail'),
  functional: loc('功能失败', 'Functional fail'),
  retention: loc('保持失败', 'Retention fail'),
}

export const S = {
  kicker: loc('这一颗器件', 'This device'),
  introTitle: loc('把前面的课串成一条测试流程', 'Chain the earlier lessons into one test flow'),
  coreTitle: loc('单颗器件：三道关，第一个 Fail 即停', 'One device: three gates, stop at the first fail'),
  coreNote: loc(
    '每颗器件按顺序过三道关：时序检查、功能测试（March C−）、保持测试（仅 DRAM）。哪一道先 Fail，就由它决定 Bin，后面的步骤不再执行。',
    'Each device passes three gates in order: timing check, functional test (March C−) and retention test (DRAM only). The first gate that fails sets the bin, and the later steps are skipped.',
  ),
  devLabel: loc('测试的器件', 'Device under test'),
  cycleLabel: loc('测试周期（频率）', 'Test cycle (frequency)'),
  pauseLabel: loc('保持等待时间（仅 DRAM）', 'Retention wait (DRAM only)'),
  serialLabel: loc('器件编号（1–100）', 'Device number (1–100)'),
  rTacc: loc('访问时间 tAcc', 'Access time tAcc'),
  rLimit: loc(`时序限值 = 周期 − ${T_SU_NS} ns`, `Timing limit = period − ${T_SU_NS} ns`),
  rTiming: loc('Step 1 时序检查', 'Step 1 timing check'),
  rFunc: loc('Step 2 功能（March C−）', 'Step 2 functional (March C−)'),
  rFirst: loc('第一个失效地址', 'First fail address'),
  rRet: loc('Step 3 保持（DRAM）', 'Step 3 retention (DRAM)'),
  rWeak: loc('保持失败的单元数', 'Cells that lost data'),
  rBin: loc('Bin 号', 'Bin number'),
  rTime: loc('本颗测试时间', 'Test time for this device'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  na: loc('不执行', 'Not run'),
  noAddr: loc('无', 'None'),
  batchTitle: loc(`一批 ${BATCH} 颗：Bin 分布、良率与平均测试时间`, `A batch of ${BATCH} devices: bin mix, yield and average test time`),
  batchNote: loc(
    '同样的设置跑整批器件。平均测试时间是每颗器件已执行步骤的时间之和的平均值；DRAM 的保持等待会占去绝大部分。',
    'The same settings run on the whole batch. Average test time is the mean of the time each device spent on the steps it ran; for DRAM most of it is the retention wait.',
  ),
  rYield: loc('良率（Pass 比例）', 'Yield (pass share)'),
  rCounts: loc('Pass / 时序 / 功能 / 保持', 'Pass / timing / functional / retention'),
  rAvg: loc('平均测试时间', 'Average test time'),
  rWait: loc('其中保持等待占比', 'Share of retention wait'),
  rEscapes: loc('漏检（判 Pass，按 64 ms 规格会失败）', 'Escapes (pass here, fail at the 64 ms spec)'),
  exportBtn: loc('导出 CSV（英文列名）', 'Export CSV (English column names)'),
  exported: loc('已导出：文件里每颗器件一行。', 'Exported: one row per device in the file.'),
  waitHint: loc('（DRAM 才有）', '(DRAM only)'),
  arrayTitle: loc('8×8 阵列：失效的位置', '8×8 array: where the failures are'),
  timingTitle: loc('时序：tAcc 与限值', 'Timing: tAcc against the limit'),
  binTitle: loc('批次的 Bin 分布', 'Bin mix for the batch'),
  asideLater: loc(
    '真实的测试还有上电排序、温度、并行测试和报告数据库；这里只用一条流程、一个 Bin 规则和一个 CSV 文件把它们串起来。',
    'Real tests also cover power sequencing, temperature, parallel test and a report database; here one flow, one bin rule and one CSV file tie them together.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc(
    `把器件换成 ${DEV_NAME.dram}，保持等待用 ${SPEC_RET_MS} ms 规格，在批次里找到一颗保持失败（Bin ${BIN_NO.retention}）的器件。`,
    `Switch to ${DEV_NAME.dram}, keep the ${SPEC_RET_MS} ms spec wait, and find a retention fail (bin ${BIN_NO.retention}) in the batch.`,
  ),
  task2: loc(
    `把 ${DEV_NAME.sram} 的周期改到 125 MHz，看时序失败（Bin ${BIN_NO.timing}）有多少，并说出是哪一步判的。`,
    `Set ${DEV_NAME.sram} to 125 MHz, see how many devices fail timing (bin ${BIN_NO.timing}), and say which step decided it.`,
  ),
  task3: loc(
    `把 ${DEV_NAME.dram} 的保持等待降到 32 ms，找到一颗漏检，说明它为什么判 Pass。`,
    `Cut the ${DEV_NAME.dram} retention wait to 32 ms, find an escape, and explain why it passes.`,
  ),
  task4: loc(
    `导出一次 CSV，在文件里找到一颗 Bin ${BIN_NO.functional} 的器件，并说出它的第一个失效地址。`,
    `Export the CSV, find a bin ${BIN_NO.functional} device, and name its first fail address.`,
  ),
}

export const FIG = {
  arrayAria: loc(
    '8×8 阵列：红色为功能测试读出错误的地址，金色为保持测试读回 0 的单元，灰色为通过',
    '8×8 array: red marks addresses that failed the functional test, gold marks cells that read back 0 in the retention test, grey passed',
  ),
  arrayCap: loc(
    '每个方格是一个单元，地址按行优先编号 0–63。金色只在 DRAM 的保持测试中出现，它不是功能失效。',
    'Each square is a cell; addresses 0–63 run row by row. Gold appears only in the DRAM retention test and is not a functional fail.',
  ),
  timingAria: loc('访问时间 tAcc 与时序限值的横条图', 'Bar chart of access time tAcc against the timing limit'),
  timingCap: loc(
    '绿色条长度是 tAcc，竖线是限值 = 周期 − 建立余量。条的末端超过竖线，这颗器件在时序检查中判失败。',
    'The bar is tAcc and the vertical line is the limit = period − setup margin. A bar that passes the line fails the timing check.',
  ),
  binAria: loc('一批器件在四个 Bin 中的数量柱状图', 'Bar chart of how many devices in the batch fall into each bin'),
  binCap: loc(
    '横轴是 Bin 号：1 通过、2 时序失败、3 功能失败、4 保持失败；纵轴是器件数。',
    'The x-axis is the bin: 1 pass, 2 timing fail, 3 functional fail, 4 retention fail; the y-axis is the device count.',
  ),
  cellAddr: (addr: number) => loc(`地址 ${addr}`, `Address ${addr}`),
}

export const INTRO: LText[] = [
  loc(
    '{@memBin} 讲了失效位图和 Bin。这一课把前面的课串成一条完整的测试流程：先看时序，再跑功能测试（{@memMarch} 的 March C−），DRAM 还要测保持时间（{@memDram} 的刷新与保持），最后按第一个 Fail 分 Bin。',
    'The {@memBin} lesson covered fail bitmaps and bins. This lesson chains the earlier lessons into one test flow: timing first, then the functional test (March C− from {@memMarch}), then for DRAM the retention test (refresh and retention from {@memDram}), and finally binning by the first fail.',
  ),
  loc(
    `这里的器件是虚拟的：${DEV_NAME.sram} 是 ${SIZE} 个单元的同步 SRAM，${DEV_NAME.dram} 是同样大小的 DRAM。缺陷由器件编号生成，同一个编号每次都是同一颗器件，方便比较不同的测试设置。`,
    `The devices are virtual: ${DEV_NAME.sram} is a ${SIZE}-cell synchronous SRAM and ${DEV_NAME.dram} is a DRAM of the same size. Defects come from the device number, so the same number is always the same device, which makes different test settings easy to compare.`,
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    `DRAM 测试慢，是因为操作多。其实每次操作只要 ${T_OP_US * 1000} ns，March C− 全部操作不到 ${formatUs(MARCH_OPS * T_OP_US)}；慢的是 ${SPEC_RET_MS} ms 的保持等待。`,
    `DRAM is slow because it has many operations. In fact each operation takes ${T_OP_US * 1000} ns and the whole March C− run is under ${formatUs(MARCH_OPS * T_OP_US)}; the slow part is the ${SPEC_RET_MS} ms retention wait.`,
  ),
  loc(
    '缩短保持等待只会让测试更快，没有坏处。保持时间在等待时长以上的漏电单元，读回会出错；等待缩短后，它们会读对，判成 Pass，漏检流到客户那里。',
    'Shortening the retention wait only makes the test faster, with no downside. A leaky cell whose retention is above the wait reads back correctly and passes; a shorter wait lets such cells through as escapes to the customer.',
  ),
  loc(
    '功能测试通过，就没有保持问题。March 很快，单元的漏电要等时间才会显现，所以保持测试必须单独做，不能用功能测试代替。',
    'If the functional test passes, there is no retention problem. March is fast, but leakage shows only after time has passed, so the retention test must be run separately and cannot be replaced by the functional test.',
  ),
]

export const TAKEAWAY: LText = loc(
  `流程按“便宜的先测、贵的后测、第一个 Fail 即停”排列：时序（${TIMING_OPS} 次操作）→ March C−（${MARCH_OPS} 次）→ DRAM 保持（${SPEC_RET_MS} ms 等待）。Bin 由第一个 Fail 决定；测试时间由已执行的步骤决定；缩短保持等待省时间，但会增加漏检。`,
  `The flow runs cheap steps first, expensive steps later, and stops at the first fail: timing (${TIMING_OPS} operations), March C− (${MARCH_OPS} operations), DRAM retention (a ${SPEC_RET_MS} ms wait). The first fail sets the bin; the steps that ran set the test time; a shorter retention wait saves time but lets escapes through.`,
)

/** 把两段文字拼起来（中文直接连，英文加空格） */
function join(...parts: LText[]): LText {
  return {
    zh: parts.map((p) => p.zh).join(''),
    en: parts.map((p) => p.en ?? p.zh).join(' '),
  }
}

/** 右侧结论：只讲这一颗器件；判定依据用同一套数字说明 */
export function verdictOf(dut: DutSpec, out: Outcome, s: Settings): { title: LText; text: LText } {
  const time = formatUs(out.testTimeUs)
  const escape =
    out.bin === 'pass' && leakyAtSpec(dut)
      ? loc(
          `注意：这颗器件有保持时间短于 ${SPEC_RET_MS} ms 的单元，但本次只等 ${s.pauseMs} ms，没有抓到，它成了漏检。`,
          `Note: this device has a cell with retention under ${SPEC_RET_MS} ms, but this run waited only ${s.pauseMs} ms and missed it, so it is an escape.`,
        )
      : null
  const base = (() => {
    if (out.bin === 'pass') {
      return {
        title: loc(`通过：Bin ${BIN_NO.pass}`, `Pass: bin ${BIN_NO.pass}`),
        text: loc(
          `三道关都 PASS，本颗测试时间 ${time}。`,
          `All gates pass; this device took ${time}.`,
        ),
      }
    }
    if (out.bin === 'timing') {
      return {
        title: loc(`时序失败：Bin ${BIN_NO.timing}`, `Timing fail: bin ${BIN_NO.timing}`),
        text: loc(
          `访问时间 ${out.tAccNs.toFixed(2)} ns 超过限值 ${out.limitNs.toFixed(1)} ns，功能测试和保持测试都没有执行，本颗只用了 ${time}。`,
          `Access time ${out.tAccNs.toFixed(2)} ns exceeds the ${out.limitNs.toFixed(1)} ns limit, so the functional and retention tests did not run; this device used only ${time}.`,
        ),
      }
    }
    if (out.bin === 'functional') {
      const addr = out.march?.failAddrs[0]
      const at = addr === undefined ? '—' : String(addr)
      return {
        title: loc(`功能失败：Bin ${BIN_NO.functional}`, `Functional fail: bin ${BIN_NO.functional}`),
        text: loc(
          `March C− 在地址 ${at} 读出错误，后续步骤不再执行，本颗用了 ${time}。`,
          `March C− read the wrong value at address ${at}; the later steps did not run, and this device used ${time}.`,
        ),
      }
    }
    return {
      title: loc(`保持失败：Bin ${BIN_NO.retention}`, `Retention fail: bin ${BIN_NO.retention}`),
      text: loc(
        `${out.weakCells.length} 个单元的保持时间短于 ${s.pauseMs} ms，等待后读回 0，判为保持失败，本颗用了 ${time}。`,
        `${out.weakCells.length} cells have retention shorter than ${s.pauseMs} ms, read back 0 after the wait, and fail retention; this device used ${time}.`,
      ),
    }
  })()
  return { title: base.title, text: escape ? join(base.text, escape) : base.text }
}

/** 批次结论：良率、平均测试时间与保持等待占比 */
export function batchText(sum: BatchSummary): LText {
  const pct = Math.round(sum.yieldRate * 100)
  const waitPct = sum.avgTimeUs > 0 ? Math.round((sum.avgWaitUs / sum.avgTimeUs) * 100) : 0
  return loc(
    `${BATCH} 颗中 ${sum.counts.pass} 颗 Pass，良率 ${pct}%。平均每颗 ${formatUs(sum.avgTimeUs)}，其中保持等待占 ${waitPct}%。`,
    `${sum.counts.pass} of ${BATCH} devices pass, a yield of ${pct}%. Each device averages ${formatUs(sum.avgTimeUs)}, of which ${waitPct}% is the retention wait.`,
  )
}

/** 四张任务卡：完成情况由当前设置和批次结果实时算出 */
export function taskItems(state: CapState, sum: BatchSummary): TaskItem[] {
  return [
    {
      id: 'dram-retention-fail',
      text: S.task1,
      done: state.kind === 'dram' && state.pauseMs === SPEC_RET_MS && sum.counts.retention > 0,
    },
    {
      id: 'sram-timing-125',
      text: S.task2,
      done: state.kind === 'sram' && state.cycle === '125' && sum.counts.timing > 0,
    },
    {
      id: 'dram-escape',
      text: S.task3,
      done: state.kind === 'dram' && state.pauseMs < SPEC_RET_MS && sum.escapes > 0,
    },
    { id: 'export-csv', text: S.task4, done: state.exported },
  ]
}

/** 小测用的数字：全部由模型算出，与页面保持一致 */
const LIMIT_125 = limitNsOf(PERIOD_NS['125'])
const PASS_DRAM_64 = formatUs(passTimeUs('dram', SPEC_RET_MS))
const PASS_DRAM_32 = formatUs(passTimeUs('dram', 32))
const ALL_OPS_TIME = formatUs((TIMING_OPS + MARCH_OPS + RET_OPS) * T_OP_US)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `一颗器件的访问时间 tAcc = 7 ns，测试周期 8 ns（125 MHz），建立余量 ${T_SU_NS} ns。它过时序检查吗？`,
      `A device has tAcc = 7 ns, the test period is 8 ns (125 MHz) and the setup margin is ${T_SU_NS} ns. Does it pass the timing check?`,
    ),
    options: [
      { id: 'a', text: loc('过：7 ns 小于 8 ns', 'Pass: 7 ns is less than 8 ns') },
      { id: 'b', text: loc(`不过：限值是 ${LIMIT_125} ns，7 ns 超过它，判 Bin ${BIN_NO.timing}`, `Fail: the limit is ${LIMIT_125} ns, 7 ns exceeds it, bin ${BIN_NO.timing}`) },
      { id: 'c', text: loc('过：时序检查只看平均值', 'Pass: the timing check only looks at the average') },
    ],
    answer: 'b',
    explain: loc(
      `限值 = 周期 − 建立余量 = 8 − ${T_SU_NS} = ${LIMIT_125} ns。7 > ${LIMIT_125}，时序失败，Bin ${BIN_NO.timing}；功能测试不再执行。`,
      `Limit = period − setup margin = 8 − ${T_SU_NS} = ${LIMIT_125} ns. 7 > ${LIMIT_125}, so it fails timing, bin ${BIN_NO.timing}, and the functional test is not run.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('用 March C− 测 64 个单元，一共要做多少次读写操作？', 'How many read and write operations does March C− need for 64 cells?'),
    options: [
      { id: 'a', text: loc(`${MARCH_OPS} 次`, `${MARCH_OPS} operations`) },
      { id: 'b', text: loc(`${SIZE} 次`, `${SIZE} operations`) },
      { id: 'c', text: loc(`${SIZE * 6} 次`, `${SIZE * 6} operations`) },
    ],
    answer: 'a',
    explain: loc(
      `March C− 对每个单元共 10 次读写（各元素合计），64 个单元就是 ${MARCH_OPS} 次。每次 ${T_OP_US * 1000} ns，合计 ${formatUs(MARCH_OPS * T_OP_US)}。`,
      `March C− does 10 reads and writes per cell in total across its elements, so 64 cells need ${MARCH_OPS} operations. At ${T_OP_US * 1000} ns each that is ${formatUs(MARCH_OPS * T_OP_US)}.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(`一颗 ${DEV_NAME.dram} 三道关全部通过，测试时间主要花在哪一步？`, `A ${DEV_NAME.dram} passes all three gates. Where does most of its test time go?`),
    options: [
      { id: 'a', text: loc(`时序检查的 ${TIMING_OPS} 次操作`, `The ${TIMING_OPS} operations of the timing check`) },
      { id: 'b', text: loc(`March C− 的 ${MARCH_OPS} 次操作`, `The ${MARCH_OPS} operations of March C−`) },
      { id: 'c', text: loc(`保持等待的 ${SPEC_RET_MS} ms`, `The ${SPEC_RET_MS} ms retention wait`) },
    ],
    answer: 'c',
    explain: loc(
      `全部通过时约 ${PASS_DRAM_64}，其中等待占 ${SPEC_RET_MS} ms。三步的操作加起来只有 ${ALL_OPS_TIME}，所以保持等待是时间的主体。`,
      `A device that passes all gates takes about ${PASS_DRAM_64}, of which ${SPEC_RET_MS} ms is waiting. All three steps' operations add up to only ${ALL_OPS_TIME}, so the retention wait dominates.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('一个 DRAM 单元的保持时间是 40 ms。用 64 ms 等待测它，会怎样？用 32 ms 呢？', 'A DRAM cell retains data for 40 ms. What happens with a 64 ms wait? And with a 32 ms wait?'),
    options: [
      { id: 'a', text: loc('两次都读回正确', 'Both times it reads back correctly') },
      { id: 'b', text: loc('64 ms 时读回 0，判保持失败；32 ms 时读对、判 Pass，但按规格它是漏检', 'At 64 ms it reads 0 and fails retention; at 32 ms it reads correctly and passes, but against the spec it is an escape') },
      { id: 'c', text: loc('两次都读回 0，判保持失败', 'Both times it reads 0 and fails retention') },
    ],
    answer: 'b',
    explain: loc(
      `64 ms 等待时，40 < 64，等待后读回 0，判保持失败。32 ms 等待时，40 > 32，读回正确。但 40 ms 低于规格 ${SPEC_RET_MS} ms，这颗器件在 32 ms 下判 Pass 就是漏检。`,
      `With a 64 ms wait, 40 < 64, so it reads 0 and fails retention. With a 32 ms wait, 40 > 32, so it reads correctly. But 40 ms is below the ${SPEC_RET_MS} ms spec, so passing it at 32 ms is an escape.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('一颗器件既有时序失败，又可能有功能失败。它的 Bin 号是多少？', 'A device could fail both timing and functional tests. What is its bin number?'),
    options: [
      { id: 'a', text: loc(`Bin ${BIN_NO.timing}：时序先测，失败即停，不再跑功能测试`, `Bin ${BIN_NO.timing}: timing runs first and stops on fail, so the functional test never runs`) },
      { id: 'b', text: loc(`Bin ${BIN_NO.functional}：功能失败的数量更多`, `Bin ${BIN_NO.functional}: it has more functional fails`) },
      { id: 'c', text: loc('两个 Bin 都记，看哪个先出现在报告里', 'Both bins are recorded; whichever appears first in the report wins') },
    ],
    answer: 'a',
    explain: loc(
      `流程的第一步是时序检查，不过就停，之后的功能测试不执行。所以 Bin 由时序决定：Bin ${BIN_NO.timing}（${BIN_NAME_EN.timing}）。`,
      `The first step is the timing check; a fail stops the flow and the functional test is never run. So the bin is set by timing: bin ${BIN_NO.timing} (${BIN_NAME_EN.timing}).`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(`${DEV_NAME.dram} 全部通过的器件，把保持等待从 ${SPEC_RET_MS} ms 降到 32 ms，每颗的测试时间大约怎样变化？`, `For a ${DEV_NAME.dram} that passes everything, the retention wait drops from ${SPEC_RET_MS} ms to 32 ms. Roughly how does the test time change?`),
    options: [
      { id: 'a', text: loc('几乎不变', 'Almost unchanged') },
      { id: 'b', text: loc('大约减半', 'Roughly halved') },
      { id: 'c', text: loc('变成 4 倍', 'Four times as long') },
    ],
    answer: 'b',
    explain: loc(
      `等待从 ${SPEC_RET_MS} ms 降到 32 ms，其余步骤只有几十微秒，所以全通过器件的时间从 ${PASS_DRAM_64} 变成 ${PASS_DRAM_32}，约减半。代价是漏检（见上一题）。`,
      `The wait drops from ${SPEC_RET_MS} ms to 32 ms and the other steps take only tens of microseconds, so a fully passing device goes from ${PASS_DRAM_64} to ${PASS_DRAM_32}, roughly half. The cost is escapes (see the previous question).`,
    ),
  },
]
