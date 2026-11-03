import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { prnuMeasured } from './core/sensor'
import {
  COLOR_FRAMES,
  FRAME_TIME_S,
  GRADE_A_SPEC,
  PRNU_TRUE,
  SETTLE_S,
  SIGMA_OVER_MU,
  STEP_IDS,
  TRANSFER_S,
  type ProgramAnalysis,
  type ProgramState,
  type StepId,
} from './snsProgramModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f2 = (n: number) => n.toFixed(2)
const f3 = (n: number) => n.toFixed(3)

const MEAS_2 = prnuMeasured(PRNU_TRUE, SIGMA_OVER_MU, 2) * 100
const DEMO_TIME = 10 * FRAME_TIME_S + SETTLE_S + TRANSFER_S
const DEMO_UPH = 3600 / DEMO_TIME

export const STEP_LABEL: Record<StepId, LText> = {
  power: loc('上电与连续性', 'Power and continuity'),
  iface: loc('接口与出图', 'Interface and image'),
  dark: loc('暗场', 'Dark frame'),
  bright: loc('亮场', 'Bright frames'),
  color: loc('颜色（可选）', 'Color (optional)'),
  otp: loc('缺陷图与 OTP', 'Defect map and OTP'),
}

export const STEP_BIN_LABEL: Record<StepId, string> = {
  power: '2',
  iface: '3',
  dark: '4',
  bright: '5',
  color: '5',
  otp: '6',
}

export const S = {
  kickerNow: loc('这一版程序', 'This program'),
  introTitle: loc('VDUT-CIS1 的量产程序', 'A production program for VDUT-CIS1'),
  coreTitle: loc('拨一拨：帧数、分级与导出', 'Try it: frames, grades and the export'),
  coreNote: loc(
    '1000 颗来自固定种子，改参数会变分布，同一组参数每次一样。不逐颗画帧。时间 = 帧数 × {ft} s + 光源稳定 {settle} s + 传输 {xfer} s。颜色步固定 {color} 帧。五项必测是上电、接口、暗场、亮场、OTP。等级 A 的示意上限是缺陷数 {aSpec}。',
    '1000 dice come from a fixed seed. Changing a knob changes the mix, and the same knobs always repeat. No frame is drawn per die. Time = frames x {ft} s + light settle {settle} s + transfer {xfer} s. The color step uses a fixed {color} frames. The five required steps are power, interface, dark, bright and OTP. The teaching limit for grade A is {aSpec} defects.',
  ),
  callout: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  darkFrames: loc('暗场帧数', 'Dark frames'),
  brightFrames: loc('亮场帧数', 'Bright frames'),
  hotMax: loc('暗场热点上限', 'Dark hot-pixel limit'),
  gradeA: loc('等级 A 的缺陷上限', 'Grade A defect limit'),
  gradeB: loc('等级 B 的缺陷上限', 'Grade B defect limit'),
  density: loc('缺陷密度（泊松 λ）', 'Defect density (Poisson lambda)'),
  cluster: loc('簇概率', 'Cluster probability'),
  budget: loc('时间预算', 'Time budget'),
  enableAria: loc('启用当前选中的步骤', 'Enable the selected step'),
  on: loc('开', 'On'),
  off: loc('关', 'Off'),
  exportBtn: loc('导出文本摘要', 'Export text summary'),
  exportAria: loc('把零件号、Bin 和等级存进当前状态', 'Store part id, bin and grade in the current state'),
  exportEmpty: loc('还没有导出。改任何旋钮都会把上一份摘要作废。', 'Nothing exported yet. Any knob change discards the previous summary.'),
  exportCap: loc('摘要前几行。全文以 PART、BIN、GRADE 存在当前状态里，可与 {@genStdf} 的记录对照。', 'First lines of the summary. The full text is kept in the current state as PART, BIN and GRADE lines, to set beside {@genStdf}.'),
  rTime: loc('测试时间', 'Test time'),
  rBudget: loc('预算', 'Budget'),
  rUph: loc('UPH = 3600 / 时间', 'UPH = 3600 / time'),
  rFrames: loc('计入时间的帧数', 'Frames counted in the time'),
  rPrnu: loc('亮场 PRNU_meas', 'Bright PRNU_meas'),
  rTemporal: loc('PRNU 的时间项 σt/μ / sqrt(N)', 'PRNU temporal term st/mu / sqrt(N)'),
  rBin1: loc('Bin 1（A/B/C）', 'Bin 1 (A/B/C)'),
  rBin2: loc('Bin 2 电源', 'Bin 2 power'),
  rBin3: loc('Bin 3 接口', 'Bin 3 interface'),
  rBin4: loc('Bin 4 暗场', 'Bin 4 dark'),
  rBin5: loc('Bin 5 亮场', 'Bin 5 bright'),
  rBin6: loc('Bin 6 OTP', 'Bin 6 OTP'),
  rGrade: loc('等级 A / B / C', 'Grades A / B / C'),
  barAria: loc('各 Bin 的颗数', 'Die count in each bin'),
  barCap: loc('金色是 Bin 1。蓝色是失败分档。', 'Gold is bin 1. Blue is a fail bin.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '等级 A / B / C 现在是 {a} / {b} / {c}。原因：A 要求缺陷数 ≤ {aLim} 且没有簇，B 要求 ≤ {bLim}，其余为 C。A 的上限必须严于 B（数字更小），否则模型会把 B 抬到 A，两个等级叠在一起就没有意义。有簇就不能进 A，所以不能只看缺陷总数。测试时间 {time} s，预算 {budget} s，UPH = 3600 / {time} = {uph}。导出的文本行可以拿到 {@genStdf} 里核对零件号和 Bin。',
    'Grades A / B / C are {a} / {b} / {c}. Reason: A needs a defect count ≤ {aLim} and no cluster, B needs ≤ {bLim}, and the rest are C. The A limit must be stricter than B (a smaller number); otherwise the model raises B to A and the two grades collapse. A cluster cannot be grade A, so the total count is not enough. Test time is {time} s against a budget of {budget} s. UPH = 3600 / {time} = {uph}. The exported lines can be checked in {@genStdf} against part id and bin.',
  ),
  task1: loc(
    '保持五项必测开着，并把测试时间压到预算以内。默认帧数会超过预算：减少帧数，或把预算调到时间以上。',
    'Keep the five required steps on, and bring the test time within the budget. The default frame count is over the budget: drop frames, or raise the budget above the time.',
  ),
  task2: loc(
    '把亮场帧数降到 2 或更少，看 PRNU_meas 里的时间项变大，Bin 5 也会跟着变。',
    'Lower the bright-frame count to 2 or fewer and watch the temporal term inside PRNU_meas grow. Bin 5 moves with it.',
  ),
  task3: loc(
    '把等级 A 的缺陷上限设为 5，并在侧栏读出此时的 A / B / C 颗数。',
    'Set the grade A defect limit to 5, and read the A / B / C counts in the side panel.',
  ),
  task4: loc('点导出，把零件号、Bin 和等级存进当前状态。', 'Press export and store part id, bin and grade in the current state.'),
  vPower: loc('电源和连续性失败进 Bin 2', 'Power and continuity failures go to bin 2'),
  vIface: loc('接口或出图失败进 Bin 3', 'Interface or image failures go to bin 3'),
  vDark: loc('暗场热点超限进 Bin 4', 'Dark hot pixels over the limit go to bin 4'),
  vBright: loc('亮场 PRNU 超限进 Bin 5', 'Bright PRNU over the limit goes to bin 5'),
  vColor: loc('颜色失败也进 Bin 5', 'A color failure also goes to bin 5'),
  vOtp: loc('OTP 写不进进 Bin 6', 'An OTP write failure goes to bin 6'),
  vStep: loc(
    '这一步失败进入 Bin {bin}，当前这一档有 {n} 颗。五项必测开着 {req} / 5。亮场 PRNU_meas 是 {prnu}%，时间项 σt/μ/sqrt(N) = {temporal}。原因：',
    'A failure at this step goes to bin {bin}. That bin holds {n} dice. Required steps on: {req} / 5. Bright PRNU_meas is {prnu}%, and the temporal term st/mu/sqrt(N) is {temporal}. Reason: ',
  ),
}

const WHY: Record<StepId, LText> = {
  power: loc('开路或短路的器件不必再出图。', 'An open or a short should not continue into an image test.'),
  iface: loc('出不了图，后面的暗场和亮场没有数据。', 'With no image, the dark and bright tests have no data.'),
  dark: loc('暗场先把热点过多的器件拦住。', 'The dark test stops parts whose hot-pixel count is already too high.'),
  bright: loc('亮场帧数变少时，PRNU 的时间项变大，更多器件被判超限。', 'With fewer bright frames the PRNU temporal term grows, and more parts are called over limit.'),
  color: loc('颜色是可选项，失败仍归到亮场那一档。', 'Color is optional. A failure still shares the bright-test bin.'),
  otp: loc('缺陷图和校准要写进 OTP，写失败就不能当成品出。', 'The defect map and the calibration have to be written to OTP. A failed write cannot ship as a finished part.'),
}

export function coreNote(): LText {
  return fill(S.coreNote, {
    ft: f2(FRAME_TIME_S),
    settle: f2(SETTLE_S),
    xfer: f2(TRANSFER_S),
    color: String(COLOR_FRAMES),
    aSpec: String(GRADE_A_SPEC),
  })
}

export const INTRO = [
  loc(
    '量产程序按顺序做：上电和连续性（失败 Bin 2）、接口和出图（Bin 3）、暗场（Bin 4）、亮场的 PRNU 与缺陷（Bin 5）、可选的颜色（仍是 Bin 5）、缺陷图和校准写入 OTP（Bin 6）。都通过的器件进 Bin 1，再按缺陷数和簇分成 A、B、C。',
    'A production program runs in order: power and continuity (fail bin 2), interface and image (bin 3), dark (bin 4), bright PRNU and defects (bin 5), optional color (still bin 5), then the defect map and calibration written to OTP (bin 6). Parts that pass all of that go to bin 1 and are graded A, B or C by defect count and clusters.',
  ),
  loc(
    '帧数同时决定测试时间和估计有多稳。亮场帧数下降时，prnuMeasured 里的时间项 (σt/μ)/sqrt(N) 变大，PRNU 超限的误判会变多。默认帧数故意超过时间预算，逼你在帧数和预算之间做一次取舍。',
    'Frame count sets both the test time and how steady the estimate is. When the bright-frame count falls, the temporal term (st/mu)/sqrt(N) inside prnuMeasured grows, and more parts are falsely called over the PRNU limit. The default frame count is deliberately over the time budget, so you have to trade frames against the budget.',
  ),
  loc(
    '缺陷图不是一张统计海报。它要写进 OTP，后面的系统靠它替换坏点。导出的零件号、Bin 和等级是一份可以复核的记录，格式上的思路见 {@genStdf}。群体是 1000 颗虚拟 die，种子固定。',
    'A defect map is not a statistics poster. It is written to OTP so a later system can replace the bad pixels. The exported part id, bin and grade are a record that can be checked again. The format idea is in {@genStdf}. The population is 1000 virtual dice with a fixed seed.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '帧数越多越好。帧数多，时间项更小，但测试时间线性变长，UPH 下降。预算里面要的是够用的 N，不是最大的 N。',
    'More frames are always better. More frames shrink the temporal term, and the test time grows in proportion, so UPH falls. Inside a budget you want an N that is enough, not the largest N.',
  ),
  loc(
    '缺陷图只是统计。量产要把这张图和校准系数写进 OTP。写不进去是 Bin 6，不是一个可以忽略的报表。',
    'A defect map is only a statistic. Production writes that map and the calibration coefficients into OTP. A failed write is bin 6, not a report you can skip.',
  ),
  loc(
    '分级只看缺陷总数。簇会把本可以进 A 的器件降下去。A、B、C 的界限要同时看个数和簇。',
    'Grading looks only at the total defect count. A cluster drops a part that would otherwise be grade A. The A, B and C limits have to see both the count and the cluster.',
  ),
]

export const TAKEAWAY: LText = loc(
  '失败按顺序进 Bin：电源 2、接口 3、暗场 4、亮场或颜色 5、OTP 6，其余 Bin 1 并给 A/B/C。时间 = 帧数 × 帧时间 + 光源稳定 + 传输，UPH = 3600 / 时间。亮场帧数变少会抬高 PRNU 的时间项。缺陷图写入 OTP。导出的文本留下零件号、Bin 和等级。',
  'Failures fall into bins in order: power 2, interface 3, dark 4, bright or color 5, OTP 6. The rest are bin 1 and receive A, B or C. Time = frames x frame time + light settle + transfer. UPH = 3600 / time. Fewer bright frames raise the PRNU temporal term. The defect map is written to OTP. The exported text keeps part id, bin and grade.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '真 PRNU = 1%，σt/μ = 0.02，亮场只有 2 帧。PRNU_meas 大约是多少？',
      'True PRNU = 1%, st/mu = 0.02, and the bright test uses only 2 frames. About what is PRNU_meas?',
    ),
    options: [
      { id: 'a', text: loc('1.000%', '1.000%') },
      { id: 'b', text: loc(`${f3(MEAS_2)}%`, `${f3(MEAS_2)}%`) },
      { id: 'c', text: loc('2.000%', '2.000%') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'PRNU_meas = sqrt(0.01^2 + 0.02^2 / 2) = {v}%。帧数从 8 降到 2 时，这项明显抬高，Bin 5 的误判会变多。',
        'PRNU_meas = sqrt(0.01^2 + 0.02^2 / 2) = {v}%. Dropping from 8 frames to 2 lifts this term, and more parts are falsely sent to bin 5.',
      ),
      { v: f3(MEAS_2) },
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '10 帧，帧时间 0.04 s，光源稳定 0.30 s，传输 0.40 s。测试时间是多少？',
      '10 frames, frame time 0.04 s, light settle 0.30 s, transfer 0.40 s. What is the test time?',
    ),
    options: [
      { id: 'a', text: loc('0.40 s', '0.40 s') },
      { id: 'b', text: loc(`${f2(DEMO_TIME)} s`, `${f2(DEMO_TIME)} s`) },
      { id: 'c', text: loc('4.00 s', '4.00 s') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '10 × 0.04 + 0.30 + 0.40 = {v} s。稳定和传输不随帧数变，帧时间才随帧数变。',
        '10 x 0.04 + 0.30 + 0.40 = {v} s. Settle and transfer do not grow with the frame count. Frame time does.',
      ),
      { v: f2(DEMO_TIME) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('上面这个测试时间对应的 UPH（3600 / 时间）大约是多少？', 'About what UPH (3600 / time) matches the test time above?'),
    options: [
      { id: 'a', text: loc(Math.round(DEMO_UPH).toString(), Math.round(DEMO_UPH).toString()) },
      { id: 'b', text: loc('3600', '3600') },
      { id: 'c', text: loc('1100', '1100') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'UPH = 3600 / {t} ≈ {u}。这是单工位、不计机械搬运的教学值。时间变长，UPH 就下降。',
        'UPH = 3600 / {t} ≈ {u}. This is a teaching value for one site, with no handler motion. A longer time lowers the UPH.',
      ),
      { t: f2(DEMO_TIME), u: Math.round(DEMO_UPH).toString() },
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于分档，下列哪些说法正确？(1) 电源或连续性失败是 Bin 2；(2) 接口失败是 Bin 3；(3) 暗场失败是 Bin 4；(4) OTP 失败是 Bin 1。',
      'Which statements about bins are correct? (1) A power or continuity failure is bin 2; (2) an interface failure is bin 3; (3) a dark failure is bin 4; (4) an OTP failure is bin 1.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(4) 把通过和失败对调了。OTP 写失败是 Bin 6。Bin 1 是前面都通过之后的等级档。',
      '(4) swaps a pass and a fail. An OTP write failure is bin 6. Bin 1 is the grade bin after everything earlier has passed.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于等级，下列哪些说法正确？(1) A 要求缺陷数不超过上限，并且没有簇；(2) 有簇的器件即使缺陷很少也不能算 A；(3) B 比 A 更严；(4) C 仍在 Bin 1，只是等级更低。',
      'Which statements about grades are correct? (1) A needs the defect count at or under the limit, and no cluster; (2) a cluster keeps a part out of A even when the count is small; (3) B is a tighter limit than A; (4) C is still bin 1, at a lower grade.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 反了。B 的个数上限不低于 A，A 还多一条“不能有簇”。C 是通过测试但缺陷或簇超出 B 的那一档。',
      '(3) is reversed. The count limit for B is not tighter than A, and A also forbids a cluster. C passed the tests, and its defects or cluster sit beyond B.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么默认程序的时间会超过预算？', 'Why does the default program sit over the time budget?'),
    options: [
      { id: 'a', text: loc('为了让你减少帧数或提高预算，看到时间和估计精度是一对', 'So that you drop frames or raise the budget, and see that time and estimate precision are a pair') },
      { id: 'b', text: loc('因为 1000 颗必须逐颗画一帧', 'Because each of the 1000 dice must have a frame drawn') },
      { id: 'c', text: loc('因为 OTP 的 Bin 号写错了', 'Because the OTP bin number is wrong') },
    ],
    answer: 'a',
    explain: loc(
      '默认暗场和亮场帧数加在一起，再加上颜色、稳定和传输，会超过起始预算。五项必测保持开着的时候，要么少拍几帧，要么把预算调高。',
      'The default dark and bright frames, plus color, settle and transfer, sit over the starting budget. With the five required steps left on, you either shoot fewer frames or raise the budget.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('缺陷图写进 OTP 是为了什么？', 'Why is the defect map written to OTP?'),
    options: [
      { id: 'a', text: loc('让后面的系统按这张图替换坏点，而不只是在测试端数一下', 'So a later system can replace bad pixels from that map, not only count them at test') },
      { id: 'b', text: loc('用它代替亮场测试', 'So it can replace the bright test') },
      { id: 'c', text: loc('用它把 UPH 固定成 3600', 'So it can freeze the UPH at 3600') },
    ],
    answer: 'a',
    explain: loc(
      '计数决定等级。图本身要跟着器件走，系统才知道哪个像素不能用。写失败是 Bin 6。',
      'The count sets the grade. The map itself has to travel with the part, so the system knows which pixels it cannot use. A failed write is bin 6.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于必测项，下列哪些说法正确？(1) 上电、接口、暗场、亮场、OTP 是五项必测；(2) 颜色可以关，不算进这五项；(3) 关掉任何一项必测，即使时间达标也不算完成预算任务；(4) 帧数降到 0 仍然算测过亮场。',
      'Which statements about required steps are correct? (1) Power, interface, dark, bright and OTP are the five required steps; (2) color may be off, and it is not one of the five; (3) turning off any required step fails the budget task even when the time is under the budget; (4) zero frames still counts as a bright test.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(4) 不成立。亮场要有帧，时间公式里的帧数来自开着的成像步骤。颜色是可选项，可以关掉来省时间。',
      '(4) does not hold. The bright test needs frames. The frame count in the time formula comes from the imaging steps that are on. Color is optional and can be turned off to save time.',
    ),
  },
]

export function taskItems(state: ProgramState, a: ProgramAnalysis, exported: boolean): TaskItem[] {
  return [
    { id: 'budget', text: S.task1, done: a.requiredOn && a.withinBudget },
    { id: 'bright-frames', text: S.task2, done: state.brightFrames <= 2 },
    { id: 'grade-a', text: S.task3, done: state.gradeA === GRADE_A_SPEC },
    { id: 'export', text: S.task4, done: exported },
  ]
}

export function verdictOf(selected: StepId, state: ProgramState, a: ProgramAnalysis): { title: LText; text: LText } {
  const title: Record<StepId, LText> = {
    power: S.vPower,
    iface: S.vIface,
    dark: S.vDark,
    bright: S.vBright,
    color: S.vColor,
    otp: S.vOtp,
  }
  const why = WHY[selected]
  const text = fill(S.vStep, {
    bin: STEP_BIN_LABEL[selected],
    n: String(a.bins[Number(STEP_BIN_LABEL[selected])] ?? 0),
    req: String(a.requiredOn ? 5 : STEP_IDS.filter((id) => id !== 'color' && state.enabled[id]).length),
    prnu: f2(a.prnuMeas * 100),
    temporal: f3(a.temporal),
  })
  return {
    title: title[selected],
    text: { zh: `${text.zh}${why.zh}`, en: `${text.en ?? ''}${why.en ?? ''}` },
  }
}

export function gradeLater(state: ProgramState, a: ProgramAnalysis): LText {
  const limits = { a: state.gradeA, b: Math.max(state.gradeB, state.gradeA) }
  return fill(S.asideLater, {
    a: String(a.grades.A),
    b: String(a.grades.B),
    c: String(a.grades.C),
    aLim: String(limits.a),
    bLim: String(limits.b),
    time: f2(a.timeS),
    budget: f2(state.budgetS),
    uph: Math.round(a.uph).toString(),
  })
}
