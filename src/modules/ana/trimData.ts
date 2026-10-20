import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  CODE_CENTER,
  CODE_MAX,
  DIES,
  N_BITS,
  V_NOM_MV,
  binarySearch,
  dieOf,
  fmtMv,
  idealCode,
  linearSearch,
  toBits,
  transferMv,
  trimRangeMv,
  type TrimMethod,
  type TrimView,
} from './trimModel'

export const S = {
  nextPrefix: loc('下一课：', 'Next: '),
  kickerNow: loc('这一次修调', 'This trim run'),
  introTitle: loc('修调：用芯片里的一组码抵消工艺偏差', 'Trim: a code stored on chip cancels the process offset'),
  coreTitle: loc('拨一拨：选 die 和搜索方法，再写入 OTP', 'Try it: pick a die and a search method, then program the OTP'),
  coreNote: loc(
    '虚拟基准源 VDUT-REF1 的目标输出是 1.200 V。未修调时，工艺偏差让它偏离目标。5 位修调码每码 2 mV，码 16 就是未修调的输出。写入 OTP 之后，die 和搜索方法都锁定。数字是教学示意。',
    'The virtual reference VDUT-REF1 targets 1.200 V. Untrimmed, process variation moves it off target. The 5-bit trim code steps 2 mV per code, and code 16 is the untrimmed output. Once the OTP is programmed, the die and search method lock. The numbers are illustrative.',
  ),
  dieLabel: loc('被测 die（修调前偏差 ΔV）', 'Die under test (offset before trim, ΔV)'),
  methodLabel: loc('搜索方法', 'Search method'),
  binaryLabel: loc('二分搜索', 'Binary search'),
  linearLabel: loc('线性搜索', 'Linear search'),
  programBtn: loc('① 编程 OTP', '① Program OTP'),
  readBtn: loc('② 回读', '② Read back'),
  retestBtn: loc('③ 复测', '③ Re-test'),
  rOffset: loc('修调前偏差 ΔV', 'Offset before trim ΔV'),
  rCode: loc('修调码（二进制）', 'Trim code (binary)'),
  rMv: loc('修调后输出', 'Output after trim'),
  rErr: loc('误差（限值 ±1.2 mV）', 'Error (limit ±1.2 mV)'),
  rCount: loc('搜索测量次数', 'Search measurements'),
  rOtp: loc('OTP 状态', 'OTP state'),
  rReadback: loc('回读', 'Read back'),
  rRetest: loc('复测读数', 'Re-test reading'),
  otpBlank: loc('空白', 'Blank'),
  otpWritten: loc('已写入', 'Written'),
  readbackOk: loc('与写入码一致', 'Matches written code'),
  notYet: loc('未做', 'Not yet'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  previewTitle: loc('预览', 'Preview'),
  programmedTitle: loc('已写入 OTP', 'OTP programmed'),
  readbackTitle: loc('回读一致', 'Read back OK'),
  passTitle: loc('修调完成', 'Trim complete'),
  rangeTitle: loc('修调范围不够', 'Outside trim range'),
  retestTitle: loc('复测不过', 'Re-test fails'),
  flowSearch: loc('① 搜索修调码', 'Search trim code'),
  flowProgram: loc('② 编程 OTP', 'Program OTP'),
  flowReadback: loc('③ 回读', 'Read back'),
  flowRetest: loc('④ 复测', 'Re-test'),
  stepDone: loc('完成', 'Done'),
  stepNext: loc('下一步', 'Next'),
  stepTodo: loc('待做', 'To do'),
  resetBtn: loc('重新开始', 'Start over'),
  asideLater: loc(
    '温度漂移、基准的长期稳定性和 OTP 的数据保持，留给后面的可靠性相关课程；这里只练搜索、编程、回读和复测的流程。',
    'Temperature drift, long-term stability of the reference and OTP data retention are left to later reliability lessons; here we only practise the search, program, read-back and re-test flow.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc(
    '写入 OTP 之前，用二分搜索修好 die 1，修调后误差在 ±1.2 mV（±0.1%）以内。',
    'Before programming the OTP, trim die 1 with binary search so the error is within ±1.2 mV (±0.1%).',
  ),
  task2: loc(
    '写入 OTP 之前，换成线性搜索修 die 1，并和二分的测量次数比较。',
    'Before programming the OTP, trim die 1 with linear search and compare its measurement count with binary search.',
  ),
  task3: loc(
    '找到修调范围不够的 die 4，确认修完仍然超限，并能说出原因。',
    'Find die 4, which is outside the trim range, confirm it still fails after trim, and say why.',
  ),
  task4: loc(
    '按顺序完成编程 OTP、回读、复测，复测判定 PASS。',
    'Complete program OTP, read back and re-test in order, with re-test PASS.',
  ),
}

export const FIG = {
  curveAria: loc(
    '修调曲线：横轴是修调码，纵轴是输出偏差，标出搜索测过的码、选中的码与限值带',
    'Trim curve: trim code on the x-axis, output error on the y-axis, marking the codes tested, the chosen code and the limit band',
  ),
  curveCap: loc(
    '蓝线是修调码与输出偏差的关系，每码 2 mV。金色虚线之间是 ±0.1% 限值带。紫点是二分搜索测过的码，灰点是线性搜索测过的码；绿圈是选中的码，超限时变红圈。空心点是码 16，即未修调的输出。',
    'The blue line is the trim code against output error, 2 mV per code. The gold dashed lines bound the ±0.1% limit band. Purple dots are codes tested by binary search, grey dots by linear search; the green ring is the chosen code, turning red if it is out of limit. The hollow dot is code 16, the untrimmed output.',
  ),
  curveY: loc('输出偏差 V_out − 1.200 V（mV）', 'Output error V_out − 1.200 V (mV)'),
  curveX: loc('修调码（5 位，0–31）', 'Trim code (5 bits, 0–31)'),
  flowAria: loc('修调流程：搜索、编程、回读、复测，当前该做的一步高亮', 'Trim flow: search, program, read back, re-test, with the next step highlighted'),
  flowCap: loc(
    '编程之后码就固定在 OTP 里，所以前面的搜索结果要先看清楚。金色框是下一步，绿色框已完成。',
    'Once programmed, the code is fixed in the OTP, so check the search result first. The gold box is the next step; green boxes are done.',
  ),
}

export const DIE_OPTIONS: Array<{ id: string; label: LText }> = DIES.map((die, index) => ({
  id: die.id,
  label: loc(`die ${index + 1} · ΔV ${fmtMv(die.offsetMv)}`, `die ${index + 1} · ΔV ${fmtMv(die.offsetMv)}`),
}))

export const METHOD_OPTIONS: Array<{ id: TrimMethod; label: LText }> = [
  { id: 'binary', label: S.binaryLabel },
  { id: 'linear', label: S.linearLabel },
]

export const INTRO: LText[] = [
  loc(
    '{@anaLdo} 已经看到：输出电压会受工艺偏差影响，偏离设计值。修调（Trim）的做法是在芯片里放一组可编程的调节量，出厂前测一次，把输出拨回目标值。',
    '{@anaLdo} showed that output voltage shifts with process variation. Trim adds a programmable adjustment inside the chip: measure once before shipping and turn the output back to target.',
  ),
  loc(
    '这一课练四件事：用二分搜索找修调码，并和线性搜索比较次数；按“编程、回读、复测”的顺序确认修调结果；说清 OTP 写入后为什么不能回退；判断一颗 die 是否超出修调范围。',
    'This lesson practises four things: find the trim code by binary search and compare its count with linear search; confirm the result in the order program, read back, re-test; explain why OTP cannot be undone; decide whether a die is outside the trim range.',
  ),
]

const RANGE = trimRangeMv()

export const MISCONCEPTIONS: LText[] = [
  loc(
    `修调码位数越多，修得就越好。位数决定的是分辨率，修调范围 ≈ 码数 × LSB；偏差超出范围的 die 修不回来。本课的修调范围约为 ${RANGE.lo.toFixed(1)} ~ ${RANGE.hi.toFixed(1)} mV，die 4 的偏差 ${fmtMv(dieOf('die4').offsetMv)} 就在范围之外。`,
    `More trim bits always means a better trim. Bits set the resolution, and the trim range is about codes × LSB; a die whose offset is beyond that range cannot be pulled back. Here the range is about ${RANGE.lo.toFixed(1)} to ${RANGE.hi.toFixed(1)} mV, and die 4 at ${fmtMv(dieOf('die4').offsetMv)} lies outside it.`,
  ),
  loc(
    `线性搜索总比二分慢。次数取决于偏差：die 3 的码靠近起点，线性只要 ${linearSearch(dieOf('die3').offsetMv).measurements} 次，二分固定 ${binarySearch(dieOf('die3').offsetMv).measurements} 次。二分的优势是最坏情况固定（${N_BITS + 1} 次），线性最坏要走完 ${CODE_MAX + 1} 个码。`,
    `Linear search is always slower than binary search. The count depends on the offset: for die 3 the code is near the start, so linear needs only ${linearSearch(dieOf('die3').offsetMv).measurements} measurements while binary always needs ${binarySearch(dieOf('die3').offsetMv).measurements}. Binary's advantage is a fixed worst case (${N_BITS + 1} measurements); linear's worst case walks all ${CODE_MAX + 1} codes.`,
  ),
  loc(
    '写错了 OTP 可以再写一遍覆盖。OTP 用熔丝或反熔丝的物理状态存码，编程是不可逆的，没有擦除操作；所以编程前要先看预览，确认搜索结果在限值内，写错只能换一颗 die。',
    'A wrong OTP write can be overwritten. OTP stores the code in the physical state of fuses or anti-fuses, and programming is irreversible with no erase; so check the preview before programming, because a wrong write means a new die.',
  ),
  loc(
    '编程成功就说明修好了，不用回读和复测。回读只确认码存进去了；复测才确认修调后的输出在限值内。两步看的东西不同，少一步就可能漏掉问题。',
    'A successful program means the trim is done, so read-back and re-test are optional. Read-back only confirms the code was stored; re-test confirms the trimmed output is within limit. They check different things, so skipping one can hide a problem.',
  ),
]

export const TAKEAWAY: LText = loc(
  '修调 = 用 OTP 里的码抵消工艺偏差。二分搜索逐位逼近，最多 6 次测量就能找到最接近目标的码；写入后回读确认、复测确认；OTP 写入不可回退，写错或超范围只能换 die。',
  'Trim = use the code in OTP to cancel process offset. Binary search narrows bit by bit and finds the closest code in at most 6 measurements; then read-back confirms the write and re-test confirms the result. OTP writes cannot be undone, so a wrong write or an out-of-range die means a new die.',
)

/** 右侧说明栏：按当前进度（预览 → 编程 → 回读 → 复测）给一句结论和原因 */
export function verdictOf(v: TrimView): { title: LText; text: LText } {
  const id = v.die.id
  if (!v.inRange) {
    return {
      title: S.rangeTitle,
      text: loc(
        `${id} 的偏差 ${fmtMv(v.die.offsetMv)} 超出修调范围（约 ${RANGE.lo.toFixed(1)} ~ ${RANGE.hi.toFixed(1)} mV）。抵消它需要的码约 ${v.ideal.toFixed(1)}，而码最大只到 ${CODE_MAX}。取码 ${CODE_MAX} 时输出仍偏 ${fmtMv(transferMv(v.die.offsetMv, CODE_MAX) - V_NOM_MV)}，超出 ±1.2 mV。换哪种搜索方法都一样，问题在范围本身。`,
        `${id} offset ${fmtMv(v.die.offsetMv)} is outside the trim range (about ${RANGE.lo.toFixed(1)} to ${RANGE.hi.toFixed(1)} mV). Cancelling it needs code about ${v.ideal.toFixed(1)}, but the largest code is ${CODE_MAX}. At code ${CODE_MAX} the output is still ${fmtMv(transferMv(v.die.offsetMv, CODE_MAX) - V_NOM_MV)}, beyond ±1.2 mV. Either search method gives the same result: the problem is the range itself.`,
      ),
    }
  }
  if (v.reading !== null) {
    if (v.retestOk) {
      return {
        title: S.passTitle,
        text: loc(
          `复测读数 ${v.reading.toFixed(2)} mV，在 ±1.2 mV 限值内，修调完成。码 ${toBits(v.code)} 留在 OTP 里，之后不需要再修调。`,
          `The re-test reads ${v.reading.toFixed(2)} mV, inside the ±1.2 mV limit, so the trim is complete. Code ${toBits(v.code)} stays in the OTP and no further trim is needed.`,
        ),
      }
    }
    return {
      title: S.retestTitle,
      text: loc(
        `复测读数 ${v.reading.toFixed(2)} mV，超出 ±1.2 mV。OTP 已经写死，码不能再改，这颗 die 只能判废或降级。`,
        `The re-test reads ${v.reading.toFixed(2)} mV, beyond ±1.2 mV. The OTP is already written and the code cannot change, so this die can only be scrapped or downgraded.`,
      ),
    }
  }
  if (v.readback) {
    return {
      title: S.readbackTitle,
      text: loc(
        `回读码与写入码 ${toBits(v.code)} 一致。下一步复测：编程和回读只说明码存对了，复测才说明修调后的输出在限值内。`,
        `The read-back code matches the written code ${toBits(v.code)}. Next, re-test: programming and read-back only show the code was stored correctly; the re-test shows the trimmed output is within limit.`,
      ),
    }
  }
  if (v.programmed) {
    return {
      title: S.programmedTitle,
      text: loc(
        `码 ${toBits(v.code)} 已写入 OTP。下一步回读，确认 OTP 里存的码和写入的码一致。`,
        `Code ${toBits(v.code)} is now in the OTP. Next, read back and confirm the stored code matches the written code.`,
      ),
    }
  }
  return {
    title: S.previewTitle,
    text: loc(
      `搜索结果是码 ${v.code}（${toBits(v.code)}），修调后输出 ${v.mv.toFixed(2)} mV，误差 ${fmtMv(v.err)}，在 ±1.2 mV 限值内。这还只是预览：写入 OTP 之前可以换方法比较；写入后就锁住，因为 OTP 不能再改写。`,
      `The search gives code ${v.code} (${toBits(v.code)}): output ${v.mv.toFixed(2)} mV, error ${fmtMv(v.err)}, within the ±1.2 mV limit. This is still a preview: you can compare methods until you program the OTP; after that the choice locks, because the OTP cannot be rewritten.`,
    ),
  }
}

/** 四张任务卡：完成与否直接由当前状态算出 */
export function taskItems(v: TrimView): TaskItem[] {
  return [
    { id: 'binary', text: S.task1, done: v.method === 'binary' && v.die.id === 'die1' && v.ok },
    { id: 'linear', text: S.task2, done: v.method === 'linear' && v.die.id === 'die1' && v.ok },
    { id: 'range', text: S.task3, done: v.die.id === 'die4' && !v.inRange },
    { id: 'otp', text: S.task4, done: v.programmed && v.readback && v.retestOk },
  ]
}

/** 小测的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const DIE1 = dieOf('die1')
const DIE1_BIN = binarySearch(DIE1.offsetMv)
const DIE1_LIN = linearSearch(DIE1.offsetMv)
const DIE1_LIN_LAST = DIE1_LIN.steps[DIE1_LIN.steps.length - 1]
const DIE1_CODE = DIE1_BIN.code
const DIE4 = dieOf('die4')
const LINEAR_WORST = CODE_MAX + 1

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '修调码是 5 位。用二分搜索找码，最多要测量几次（含最后比对相邻码）？',
      'The trim code has 5 bits. With binary search, at most how many measurements are needed (including the final neighbour check)?',
    ),
    options: [
      { id: 'a', text: loc(`${N_BITS} 次`, `${N_BITS} measurements`) },
      { id: 'b', text: loc(`${N_BITS + 1} 次`, `${N_BITS + 1} measurements`) },
      { id: 'c', text: loc(`${LINEAR_WORST} 次`, `${LINEAR_WORST} measurements`) },
    ],
    answer: 'b',
    explain: loc(
      `二分逐位试 ${N_BITS} 次（每次把一位置 1，输出不超过目标就保留），最后比对相邻码，共 ${N_BITS + 1} 次。${LINEAR_WORST} 次是线性搜索的最坏情况，要把 32 个码全测一遍。`,
      `Binary search tries ${N_BITS} bits in turn (set a bit, keep it if the output does not exceed the target), then compares the neighbouring code: ${N_BITS + 1} measurements in total. ${LINEAR_WORST} is the linear-search worst case, which measures all 32 codes.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `die1（修调前偏差 ${fmtMv(DIE1.offsetMv)}）用线性搜索，从码 0 开始逐码上升，直到第一个输出不低于 1.200 V 的码，一共测量几次？`,
      `die1 (offset before trim ${fmtMv(DIE1.offsetMv)}): with linear search starting at code 0 and stepping up until the first code reads at least 1.200 V, how many measurements are taken?`,
    ),
    options: [
      { id: 'a', text: loc(`${DIE1_BIN.measurements} 次`, `${DIE1_BIN.measurements} measurements`) },
      { id: 'b', text: loc(`${DIE1_LIN.measurements} 次`, `${DIE1_LIN.measurements} measurements`) },
      { id: 'c', text: loc(`${LINEAR_WORST} 次`, `${LINEAR_WORST} measurements`) },
    ],
    answer: 'b',
    explain: loc(
      `线性搜索在码 ${DIE1_LIN_LAST.code} 时输出首次达到 ${DIE1_LIN_LAST.mv.toFixed(1)} mV（不低于 1200 mV），前面的码 0 到 ${DIE1_LIN_LAST.code - 1} 也都测过，共 ${DIE1_LIN.measurements} 次。同一颗 die 用二分只要 ${DIE1_BIN.measurements} 次。`,
      `Linear search first reaches at least 1200 mV at code ${DIE1_LIN_LAST.code}, reading ${DIE1_LIN_LAST.mv.toFixed(1)} mV; codes 0 to ${DIE1_LIN_LAST.code - 1} were measured too, ${DIE1_LIN.measurements} measurements in total. Binary search on the same die needs ${DIE1_BIN.measurements}.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('die1 的修调码应该选哪一个？', 'Which trim code should die1 use?'),
    options: [
      { id: 'a', text: loc(`码 ${DIE1_CODE}`, `code ${DIE1_CODE}`) },
      { id: 'b', text: loc(`码 ${DIE1_CODE + 1}`, `code ${DIE1_CODE + 1}`) },
      { id: 'c', text: loc(`码 ${CODE_CENTER}`, `code ${CODE_CENTER}`) },
    ],
    answer: 'a',
    explain: loc(
      `码 ${DIE1_CODE} 的误差是 ${fmtMv(transferMv(DIE1.offsetMv, DIE1_CODE) - V_NOM_MV)}，码 ${DIE1_CODE + 1} 的误差是 ${fmtMv(transferMv(DIE1.offsetMv, DIE1_CODE + 1) - V_NOM_MV)}，取误差小的那个。码 ${CODE_CENTER} 就是未修调的输出，偏差原封不动。`,
      `Code ${DIE1_CODE} has error ${fmtMv(transferMv(DIE1.offsetMv, DIE1_CODE) - V_NOM_MV)} and code ${DIE1_CODE + 1} has ${fmtMv(transferMv(DIE1.offsetMv, DIE1_CODE + 1) - V_NOM_MV)}; pick the smaller error. Code ${CODE_CENTER} is the untrimmed output, so its offset is unchanged.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `die4（修调前偏差 ${fmtMv(DIE4.offsetMv)}）无论怎么搜索都修不回 1.200 V，原因是？`,
      `die4 (offset before trim ${fmtMv(DIE4.offsetMv)}) cannot be trimmed to 1.200 V whatever the search. Why?`,
    ),
    options: [
      { id: 'a', text: loc('二分搜索写错了，换线性搜索就能修好', 'The binary search is wrong; linear search would fix it') },
      { id: 'b', text: loc(`修调范围不够：需要的码约 ${idealCode(DIE4.offsetMv).toFixed(1)}，超过最大码 ${CODE_MAX}`, `Trim range is too small: the code needed is about ${idealCode(DIE4.offsetMv).toFixed(1)}, above the largest code ${CODE_MAX}`) },
      { id: 'c', text: loc('回读出错，所以修调失败', 'The read-back is wrong, so the trim fails') },
    ],
    answer: 'b',
    explain: loc(
      `抵消 ${fmtMv(DIE4.offsetMv)} 需要码约 ${idealCode(DIE4.offsetMv).toFixed(1)}，超过最大码 ${CODE_MAX}。取码 ${CODE_MAX} 时输出仍偏 ${fmtMv(transferMv(DIE4.offsetMv, CODE_MAX) - V_NOM_MV)}，超出 ±1.2 mV。修调范围由码数和 LSB 决定，换搜索方法改变不了它。`,
      `Cancelling ${fmtMv(DIE4.offsetMv)} needs code about ${idealCode(DIE4.offsetMv).toFixed(1)}, above the largest code ${CODE_MAX}. At code ${CODE_MAX} the output is still ${fmtMv(transferMv(DIE4.offsetMv, CODE_MAX) - V_NOM_MV)}, beyond ±1.2 mV. The trim range is set by the code count and LSB, and changing the search method cannot change it.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么 OTP 写入后不能回退？', 'Why can an OTP write not be undone?'),
    options: [
      { id: 'a', text: loc('OTP 靠熔丝或反熔丝的物理状态存码，编程是不可逆的，没有擦除，只能换一颗 die', 'OTP stores the code in the physical state of fuses or anti-fuses; programming is irreversible with no erase, so the only fix is a new die') },
      { id: 'b', text: loc('编程后用软件改写寄存器即可，断电重启就能恢复', 'Software can rewrite the register after programming, and a power cycle restores it') },
      { id: 'c', text: loc('码会随温度慢慢回到默认值，所以不用担心', 'The code slowly returns to its default value with temperature, so there is nothing to worry about') },
    ],
    answer: 'a',
    explain: loc(
      'OTP 的每一位是一个物理结构：熔丝被烧断，或反熔丝被击穿，状态就改变了，而且无法再变回去。所以写错只能换一颗 die，这也是编程前要先看预览的原因。',
      'Each OTP bit is a physical structure: a fuse is blown or an anti-fuse is broken down, and the state changes permanently. A wrong write therefore means a new die, which is why the preview must be checked before programming.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('编程之后，为什么还要回读和复测？', 'After programming, why do we still read back and re-test?'),
    options: [
      { id: 'a', text: loc('回读确认 OTP 里存的码和写入的码一致；复测确认这颗 die 修调后的输出在限值内', 'Read-back confirms the stored code matches the written code; re-test confirms this die’s trimmed output is within limit') },
      { id: 'b', text: loc('回读就是再测一遍输出电压，复测只为统计良率', 'Read-back is just another voltage measurement, and re-test only exists for yield statistics') },
      { id: 'c', text: loc('两步都可以省，编程成功就说明已经修好', 'Both steps can be skipped; a successful program means the trim is done') },
    ],
    answer: 'a',
    explain: loc(
      '编程只说明写了一个码；回读说明这个码确实存进了 OTP；复测说明修调后的输出真的落在限值内。三件事各管一段，缺任何一段都可能把坏的修调结果放过去。',
      'Programming only says a code was written; read-back says that code is really in the OTP; re-test says the trimmed output is really within limit. Each step covers a different risk, and skipping one can let a bad trim pass.',
    ),
  },
]
