import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  DEVICE_OPTIONS,
  SPEC_MARGIN_NS,
  TOH_NS,
  type TimingState,
  analyseTiming,
  tAAOf,
  windowOf,
} from './memTimingModel'

const en = (text: LText): string => text.en ?? text.zh

/** 数字统一到最多两位小数，去掉无意义的尾零 */
export const fmt = (value: number): string => String(Number(value.toFixed(2)))

export const INTRO: LText[] = [
  loc(
    '存储器的读写都有时间约束。地址改变后，数据要经过访问时间 tAA 才稳定；它保持到下一个地址改变之后的 tOH 才失效。ATE 的采样点必须落在这段有效窗口里。',
    'Memory reads are timing-constrained. After the address changes, the data takes the access time tAA to settle, and stays valid until a time tOH after the next address change. The ATE strobe must land inside this valid window.',
  ),
  loc(
    '采样点早于 tAA 是建立（setup）不足，晚于 T + tOH 是保持（hold）不足。窗口宽度 = T + tOH − tAA：周期越短、器件越慢，窗口越窄。',
    'A strobe before tAA is a setup shortfall; one after T + tOH is a hold shortfall. Window width = T + tOH − tAA, so a shorter period or a slower part narrows the window.',
  ),
  loc(
    '下面的页面让你选器件和周期、移动采样点，看窗口与裕量；然后用二分法只靠通过 / 失败的测量找左边界；最后用 Shmoo 图看周期与采样点共同决定的通过区。',
    'Below you pick a part and a period, move the strobe, and watch the window and margin. Bisection then finds the left edge from pass/fail alone, and a Shmoo map shows the pass region set jointly by period and strobe.',
  ),
]

export const S = {
  kickerNow: loc('这一次读出的时序', 'The read timing in this run'),
  introTitle: loc('时序：采样点必须落在数据有效窗口里', 'Timing: the strobe must land inside the data-valid window'),
  coreTitle: loc('拨一拨：选器件和周期，移动采样点', 'Try it: pick a part and a period, then move the strobe'),
  coreNote: loc(
    '采样点 s 是 ATE 相对地址改变的时刻。绿色带是数据有效窗口 [tAA, T + tOH]：左边缘是 tAA，右边缘是 T + tOH。',
    'The strobe s is the ATE sampling time measured from the address change. The green band is the data-valid window [tAA, T + tOH]: its left edge is tAA and its right edge is T + tOH.',
  ),
  deviceLabel: loc('器件', 'Part'),
  periodLabel: loc('周期 T', 'Period T'),
  strobeLabel: loc('采样点 s', 'Strobe s'),
  waveTitle: loc('读数据有效窗口', 'Read data-valid window'),
  waveNote: loc(
    '横轴是相对地址改变的时间。窗口外的数据都无效：左侧是还没稳定，右侧是下一个地址已经改变了它。',
    'The horizontal axis is time after the address changes. Outside the window the data is invalid: on the left it has not settled yet, on the right the next address has already changed it.',
  ),
  waveStrobe: loc('采样', 'Strobe'),
  lowEdge: loc('左边界 tAA', 'Left edge tAA'),
  highEdge: loc('右边界 T + tOH', 'Right edge T + tOH'),
  rWindow: loc('有效窗口', 'Valid window'),
  rWidth: loc('窗口宽度', 'Window width'),
  rCentre: loc('窗口中央', 'Window centre'),
  rMargin: loc('采样裕量', 'Strobe margin'),
  rMax: loc('最大裕量', 'Largest margin'),
  rVerdict: loc('判定', 'Verdict'),
  passWord: loc('PASS', 'PASS'),
  failWord: loc('FAIL', 'FAIL'),
  bisectTitle: loc('二分找左边界（只用通过 / 失败的测量）', 'Bisection for the left edge (pass/fail measurements only)'),
  bisectNote: loc(
    'ATE 不知道器件的 tAA，只能在选定的采样点上测通过或失败。二分法每次测区间中点，把区间对半缩小。',
    'The ATE does not know the part’s tAA; it can only test pass or fail at a chosen strobe. Bisection tests the midpoint each time and halves the interval.',
  ),
  bisectButton: loc('运行二分搜索', 'Run bisection'),
  bisectNot: loc(
    '这颗器件在一个周期内放不下：采样点放到 T 也 FAIL，二分无从开始。',
    'This part does not fit in one period: even a strobe at T fails, so bisection has nowhere to start.',
  ),
  bisectNotRun: loc('尚未运行。', 'Not run yet.'),
  bisectStep: (index: number, strobe: string, pass: boolean) =>
    loc(
      `第 ${index} 次：s = ${strobe} ns → ${pass ? 'PASS' : 'FAIL'}`,
      `step ${index}: s = ${strobe} ns → ${pass ? 'PASS' : 'FAIL'}`,
    ),
  bisectResult: (estimate: string, bound: string) =>
    loc(
      `边界估计 ≈ ${estimate} ns，误差上限 ${bound} ns`,
      `Estimated edge ≈ ${estimate} ns, error bound ${bound} ns`,
    ),
  shmooTitle: loc('Shmoo：周期 × 采样点的通过图', 'Shmoo: pass map over period × strobe'),
  shmooNote: loc(
    '每个格子是一次测量：绿色 PASS，灰色 FAIL。下边界是水平的，由 tAA 决定；上边界斜向上，由 T + tOH 决定。周期越短，通过带越窄，最后消失。',
    'Each cell is one measurement: green is PASS, grey is FAIL. The lower edge is horizontal and set by tAA; the upper edge slopes up and is set by T + tOH. A shorter period narrows the pass band until it closes.',
  ),
  shmooAxisX: loc('周期 T（ns）', 'Period T (ns)'),
  shmooAxisY: loc('采样点 s（ns）', 'Strobe s (ns)'),
  shmooCurrent: loc('当前设置', 'Current setting'),
  shmooAria: loc('周期与采样点的通过图（Shmoo）', 'Shmoo pass map of period versus strobe'),
  shmooPassLegend: loc('PASS', 'PASS'),
  shmooFailLegend: loc('FAIL', 'FAIL'),
  verdictEarly: (strobe: string, tAA: string) =>
    loc(
      `采样点 ${strobe} ns 早于 tAA = ${tAA} ns，此时数据还没稳定。数据要先于采样点稳定，这里不够，属于建立（setup）不足，判 FAIL。`,
      `The strobe at ${strobe} ns is earlier than tAA = ${tAA} ns, so the data has not settled yet. The data must settle before the strobe; here it does not, a setup shortfall, so FAIL.`,
    ),
  verdictLate: (strobe: string, hi: string) =>
    loc(
      `采样点 ${strobe} ns 晚于 T + tOH = ${hi} ns，此时下一个地址已经改变了数据。这是保持（hold）不足，判 FAIL。`,
      `The strobe at ${strobe} ns is later than T + tOH = ${hi} ns, so the next address change has already altered the data. A hold shortfall, so FAIL.`,
    ),
  verdictThin: (margin: string, width: string, maxM: string) =>
    loc(
      `采样点落在窗口内，但裕量只有 ${margin} ns，低于要求的 ${fmt(SPEC_MARGIN_NS)} ns。窗口宽 ${width} ns，中央的最大裕量只有 ${maxM} ns：功能上能过，量产裕量不够。`,
      `The strobe is inside the window, but its margin is only ${margin} ns, below the required ${fmt(SPEC_MARGIN_NS)} ns. The window is ${width} ns wide and the best margin, at the centre, is only ${maxM} ns: it passes functionally but the production margin is not enough.`,
    ),
  verdictPass: (strobe: string, margin: string, centre: string) =>
    loc(
      `采样点 ${strobe} ns 在窗口内，裕量 ${margin} ns ≥ ${fmt(SPEC_MARGIN_NS)} ns。窗口中央是 ${centre} ns，那里的裕量最大。`,
      `The strobe at ${strobe} ns is inside the window with a margin of ${margin} ns ≥ ${fmt(SPEC_MARGIN_NS)} ns. The window centre is at ${centre} ns, where the margin is largest.`,
    ),
  asideLater: loc(
    '真实测试还要考虑温度、电压、ATE 自身的时序精度与抖动；这里只看一个理想器件的窗口与采样点。',
    'Real tests also account for temperature, voltage, and the ATE’s own timing accuracy and jitter; here we look only at an idealised part’s window and strobe.',
  ),
  next: loc('下一课：存储器 DRAM 测试', 'Next: DRAM test'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('运行一次二分搜索，找到左边界', 'Run a bisection search and find the left edge'),
  task2: loc('典型器件在 8 ns 下，采样点放在窗口中央附近，裕量 ≥ 1 ns', 'Typical part at 8 ns: strobe near the window centre with margin ≥ 1 ns'),
  task3: loc('慢器件在 8 ns 下，看它的最大裕量是否达得到 1 ns', 'Slow part at 8 ns: check whether its largest margin reaches 1 ns'),
  task4: loc('把采样点推过 T + tOH，看 FAIL 出现在哪一侧', 'Push the strobe past T + tOH and see on which side the FAIL appears'),
}

export const MISCONCEPTIONS: LText[] = [
  loc(
    '只要 PASS 就说明采样点选得好。PASS 只说明采样点落在窗口内；裕量可能只有 0.1 ns，温度或电压一变就 FAIL。',
    'A PASS means the strobe is well placed. It only means the strobe is inside the window; the margin may be only 0.1 ns, and a shift in temperature or voltage would then cause a FAIL.',
  ),
  loc(
    '采样点放在窗口最早或最晚的位置最保险。两侧都有风险：左边是建立不足，右边是保持不足；最稳的是窗口中央。',
    'Placing the strobe at the very start or very end of the window is safest. Both sides carry risk: the left edge is a setup shortfall and the right edge is a hold shortfall; the centre is the most robust.',
  ),
  loc(
    '把周期拉长，所有器件都能过，所以可以用慢速测试代替。那是放宽了测试条件，器件并没有变好，而且测试时间变长。',
    'Lengthening the period lets every part pass, so a slow test can replace the real one. That relaxes the test condition rather than making the part better, and the test takes longer.',
  ),
]

export const TAKEAWAY: LText = loc(
  '存储器读的采样窗口是 [tAA, T + tOH]：左边界由器件的访问时间决定，右边界随周期变化。采样点要放在窗口中央，裕量不够就不能放行。二分法只靠通过 / 失败的测量就能找到边界；Shmoo 把周期和采样点都扫一遍，通过带的形状告诉你哪一侧的边界在限制测试。',
  'The read strobe window is [tAA, T + tOH]: the left edge is set by the part’s access time and the right edge moves with the period. Place the strobe in the centre of the window, and do not release a part whose margin is too thin. Bisection finds an edge from pass/fail measurements alone; a Shmoo sweeps period and strobe together, and the shape of the pass band shows which edge is limiting the test.',
)

/** 当前器件的显示名（取选项的 label） */
function deviceName(id: TimingState['device']): LText {
  const found = DEVICE_OPTIONS.find((item) => item.id === id)
  return found === undefined ? DEVICE_OPTIONS[0].label : found.label
}

/** 右侧说明栏：结论 + 原因。失效时说明是哪一侧，通过时说明裕量 */
export function verdictOf(state: TimingState): { title: LText; text: LText } {
  const a = analyseTiming(state)
  const name = deviceName(state.device)
  const strobe = fmt(state.strobe)
  if (a.early) {
    return {
      title: loc(`${name.zh}：FAIL（采样太早）`, `${en(name)}: FAIL (strobe too early)`),
      text: S.verdictEarly(strobe, fmt(a.tAA)),
    }
  }
  if (a.late) {
    return {
      title: loc(`${name.zh}：FAIL（采样太晚）`, `${en(name)}: FAIL (strobe too late)`),
      text: S.verdictLate(strobe, fmt(a.win.hi)),
    }
  }
  if (!a.robust) {
    return {
      title: loc(`${name.zh}：PASS，但裕量不足`, `${en(name)}: PASS, margin too thin`),
      text: S.verdictThin(fmt(a.margin), fmt(a.win.width), fmt(a.win.maxMargin)),
    }
  }
  return {
    title: loc(`${name.zh}：PASS，裕量充足`, `${en(name)}: PASS, margin sufficient`),
    text: S.verdictPass(strobe, fmt(a.margin), fmt(a.win.centre)),
  }
}

/** 四张任务卡：完成与否由当前设置与二分状态算出 */
export function taskItems(state: TimingState): TaskItem[] {
  const tAA = tAAOf(state.device)
  const win = windowOf(tAA, state.period)
  return [
    {
      id: 'search',
      text: S.task1,
      done: state.searched,
    },
    {
      id: 'centre',
      text: S.task2,
      done:
        state.device === 'typ' &&
        state.period === 8 &&
        Math.abs(state.strobe - win.centre) <= 0.3 &&
        analyseTiming(state).robust,
    },
    {
      id: 'slow',
      text: S.task3,
      done: state.device === 'slow' && state.period === 8 && win.maxMargin < SPEC_MARGIN_NS,
    },
    {
      id: 'late',
      text: S.task4,
      done: state.strobe > state.period + TOH_NS,
    },
  ]
}

/* 小测题的数字全部由模型算出 */
const T_MAIN = 10
const TAA_TYP = tAAOf('typ')
const TAA_SLOW = tAAOf('slow')
const W_10 = windowOf(TAA_TYP, T_MAIN)
const W_8 = windowOf(TAA_TYP, 8)
const SLOW_8 = windowOf(TAA_SLOW, 8)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `周期 T = ${T_MAIN} ns，tAA = ${fmt(TAA_TYP)} ns，tOH = ${fmt(TOH_NS)} ns，有效窗口宽多少？`,
      `With T = ${T_MAIN} ns, tAA = ${fmt(TAA_TYP)} ns and tOH = ${fmt(TOH_NS)} ns, how wide is the valid window?`,
    ),
    options: [
      { id: 'a', text: loc(`${fmt(T_MAIN - TAA_TYP)} ns`, `${fmt(T_MAIN - TAA_TYP)} ns`) },
      { id: 'b', text: loc(`${fmt(W_10.width)} ns`, `${fmt(W_10.width)} ns`) },
      { id: 'c', text: loc(`${T_MAIN} ns`, `${T_MAIN} ns`) },
    ],
    answer: 'b',
    explain: loc(
      `窗口 = [tAA, T + tOH] = [${fmt(W_10.lo)}, ${fmt(W_10.hi)}] ns，宽度 = ${fmt(W_10.hi)} − ${fmt(W_10.lo)} = ${fmt(W_10.width)} ns。`,
      `The window is [tAA, T + tOH] = [${fmt(W_10.lo)}, ${fmt(W_10.hi)}] ns, so its width is ${fmt(W_10.hi)} − ${fmt(W_10.lo)} = ${fmt(W_10.width)} ns.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('周期从 10 ns 降到 8 ns，窗口宽度怎样变化？（tAA 仍是典型器件的值）', 'The period drops from 10 ns to 8 ns. How does the window width change? (tAA stays at the typical value)'),
    options: [
      { id: 'a', text: loc(`变窄 ${fmt(T_MAIN - 8)} ns，从 ${fmt(W_10.width)} ns 到 ${fmt(W_8.width)} ns`, `Narrower by ${fmt(T_MAIN - 8)} ns, from ${fmt(W_10.width)} ns to ${fmt(W_8.width)} ns`) },
      { id: 'b', text: loc(`变宽 ${fmt(T_MAIN - 8)} ns`, `Wider by ${fmt(T_MAIN - 8)} ns`) },
      { id: 'c', text: loc('不变，因为 tAA 不变', 'Unchanged, because tAA does not change') },
    ],
    answer: 'a',
    explain: loc(
      '周期减少 2 ns，右边界 T + tOH 也减少 2 ns；左边界 tAA 不动，所以宽度减少 2 ns。',
      'The period falls by 2 ns, so the right edge T + tOH also falls by 2 ns; the left edge tAA does not move, so the width falls by 2 ns.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('慢器件在 8 ns 周期下，能否找到裕量 ≥ 1 ns 的采样点？', 'Can a slow part at an 8 ns period find a strobe with margin ≥ 1 ns?'),
    options: [
      { id: 'a', text: loc('能，把采样点放在 T 处，裕量最大', 'Yes, a strobe at T has the largest margin') },
      { id: 'b', text: loc(`不能，窗口只有 ${fmt(SLOW_8.width)} ns，中央的最大裕量是 ${fmt(SLOW_8.maxMargin)} ns`, `No, the window is only ${fmt(SLOW_8.width)} ns wide and the largest margin, at the centre, is ${fmt(SLOW_8.maxMargin)} ns`) },
      { id: 'c', text: loc('能，只要采样点落在 tAA 处', 'Yes, as long as the strobe is placed exactly at tAA') },
    ],
    answer: 'b',
    explain: loc(
      `窗口 = [${fmt(SLOW_8.lo)}, ${fmt(SLOW_8.hi)}] ns，宽 ${fmt(SLOW_8.width)} ns。中央的裕量是宽度的一半，只有 ${fmt(SLOW_8.maxMargin)} ns，低于要求的 1 ns。`,
      `The window is [${fmt(SLOW_8.lo)}, ${fmt(SLOW_8.hi)}] ns, ${fmt(SLOW_8.width)} ns wide. The margin at the centre is half the width, only ${fmt(SLOW_8.maxMargin)} ns, below the required 1 ns.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('采样点早于 tAA 时，失效属于哪一类？', 'When the strobe is earlier than tAA, which kind of failure is it?'),
    options: [
      { id: 'a', text: loc('保持（hold）不足', 'Hold shortfall') },
      { id: 'b', text: loc('建立（setup）不足', 'Setup shortfall') },
      { id: 'c', text: loc('周期太长', 'Period too long') },
    ],
    answer: 'b',
    explain: loc(
      '数据还没稳定就去采样，数据要先于采样点稳定，这一条不满足，就是建立（setup）不足。',
      'Sampling before the data has settled breaks the requirement that data be stable before the strobe; that is a setup shortfall.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('二分法测得：采样点 5 ns 失败、6 ns 通过。左边界 tAA 在哪里？', 'Bisection measured: a strobe at 5 ns fails and at 6 ns passes. Where is the left edge tAA?'),
    options: [
      { id: 'a', text: loc('小于 5 ns', 'Below 5 ns') },
      { id: 'b', text: loc('在 5 到 6 ns 之间', 'Between 5 and 6 ns') },
      { id: 'c', text: loc('大于 6 ns', 'Above 6 ns') },
    ],
    answer: 'b',
    explain: loc(
      '5 ns 失败说明 tAA > 5；6 ns 通过说明 tAA ≤ 6。边界在 (5, 6] 之间，二分会继续把这个区间对半缩小。',
      'A failure at 5 ns means tAA > 5; a pass at 6 ns means tAA ≤ 6. The edge lies in (5, 6], and bisection keeps halving that interval.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('Shmoo 图上的通过带为什么是斜的？', 'Why is the pass band on a Shmoo map slanted?'),
    options: [
      { id: 'a', text: loc('下边界由 tAA 决定，是水平的；上边界 T + tOH 随周期变化，是斜的；周期越短，带越窄', 'The lower edge is set by tAA and is horizontal; the upper edge T + tOH moves with the period and is slanted; a shorter period narrows the band') },
      { id: 'b', text: loc('通过带是竖直的，周期不影响窗口', 'The band is vertical because the period does not affect the window') },
      { id: 'c', text: loc('斜率由电源电压决定，与时序无关', 'The slope is set by the supply voltage and is unrelated to timing') },
    ],
    answer: 'a',
    explain: loc(
      'Shmoo 的横轴是周期，纵轴是采样点。左边界 tAA 不随周期变，右边界 T + tOH 随 T 增大而增大，因此通过带向上倾斜。',
      'The Shmoo’s horizontal axis is the period and the vertical axis is the strobe. The left edge tAA does not depend on the period, while the right edge T + tOH grows with T, so the pass band slopes upward.',
    ),
  },
]
