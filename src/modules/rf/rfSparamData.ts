import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DEFAULT_SPARAM, VSWR_LIMIT, analyseSparam, applyPreset, type SparamAnalysis, type SparamState } from './rfSparamModel'
import { fmtNum } from './rfFormat'

/** 只有一种语言的数字文本：中英文相同，不用再翻译 */
function same(text: string): LText {
  return loc(text, text)
}

/** 两位小数；接近 0 的值显示为 0.00，避免 “-0.00” */
function f2(value: number): string {
  return fmtNum(Math.abs(value) < 0.005 ? 0 : value, 2)
}

export const S = {
  kickerNow: loc('这个负载', 'This load'),
  introTitle: loc('反射从哪里来', 'Where reflection comes from'),
  introParas: [
    loc(
      '射频系统通常按 50 Ω 设计：电缆、仪器端口与夹具都以 Z0 = 50 Ω 为参考。负载阻抗 ZL 偏离 Z0，信号到达负载时一部分会沿原路反射回去，反射的多少由反射系数 Γ 描述：Γ = (ZL − Z0) / (ZL + Z0)。',
      'RF systems are usually designed around 50 Ω: cables, instrument ports and fixtures are all referenced to Z0 = 50 Ω. When the load impedance ZL differs from Z0, part of the signal is reflected back along the path. The amount is given by the reflection coefficient Γ = (ZL − Z0) / (ZL + Z0).',
    ),
    loc(
      'S 参数就是把反射、透射写成复数的一套记法；单端口负载的 S11 就是这里的 Γ。回波损耗 RL、电压驻波比 VSWR 与失配损耗都从 |Γ| 算出，换算成 dB 的规则见 {@rfDb}。',
      'S-parameters write reflection and transmission as complex numbers; for a one-port load, S11 is the Γ used here. Return loss RL, VSWR and mismatch loss are all computed from |Γ|; the dB conversion rules are in {@rfDb}.',
    ),
  ],
  coreTitle: loc('选择负载，看反射', 'Pick a load and see the reflection'),
  coreNote: loc(
    '点选预设，或拖动 R、X 自定义负载。Γ 平面与曲线同时更新；VSWR ≤ 2 为合格。',
    'Pick a preset, or drag R and X to build a custom load. The Γ plane and the curve update together; VSWR ≤ 2 counts as passing.',
  ),
  loadLabel: loc('负载', 'Load'),
  rLabel: loc('负载电阻 R（Ω）', 'Load resistance R (Ω)'),
  xLabel: loc('负载电抗 X（Ω）', 'Load reactance X (Ω)'),
  rGamma: loc('反射系数 |Γ|', 'Reflection |Γ|'),
  rRl: loc('回波损耗 RL', 'Return loss RL'),
  rVswr: loc('电压驻波比 VSWR', 'VSWR'),
  rMismatch: loc('失配损耗', 'Mismatch loss'),
  rReflected: loc('反射功率占比', 'Reflected power'),
  rVerdict: loc('判定', 'Verdict'),
  passWord: loc('合格', 'Pass'),
  failWord: loc('不合格', 'Fail'),
  formulaTitle: loc('公式（Z0 = 50 Ω）', 'Formulas (Z0 = 50 Ω)'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '这一课只看单频点、纯无源负载的反射。真实的匹配还要用 LC 网络，并且随频率变化；S 参数的完整测量由矢量网络分析仪完成。',
    'This lesson only looks at reflection from a passive load at a single frequency. Real matching uses LC networks that vary with frequency, and full S-parameter measurement is done with a vector network analyzer.',
  ),
  next: loc('下一课：增益与插入损耗', 'Next: Gain and Insertion Loss'),
  verdictMatch: loc('匹配：没有反射', 'Matched: no reflection'),
  verdictPass: loc('合格：VSWR ≤ 2', 'Pass: VSWR ≤ 2'),
  verdictFail: loc('失配：VSWR 超过 2', 'Mismatch: VSWR above 2'),
  noteMatch: loc(
    'ZL 恰好等于 Z0，Γ = 0，RL 为无穷大。实际负载很少这样正好，所以要用匹配网络把它调回 Z0 附近。',
    'ZL is exactly Z0, so Γ = 0 and RL is infinite. Real loads are rarely this exact, so a matching network is used to bring them back near Z0.',
  ),
  noteFull: loc(
    '|Γ| = 1：入射功率全部被反射。纯电抗负载（R = 0）就是这种情况，不论 X 多大，它都不消耗功率，只把信号原路送回。',
    '|Γ| = 1: all incident power is reflected. A pure reactive load (R = 0) is in this state for any X: it absorbs no power and sends the signal straight back.',
  ),
  noteReact: loc(
    '有电抗（X ≠ 0）时，Γ 的虚部不为零，|Γ| 变大：即使电阻正好是 50 Ω，也会反射。这时要靠匹配网络抵消电抗，只调电阻没有用。',
    'With reactance (X ≠ 0) the imaginary part of Γ is nonzero, so |Γ| grows: even a 50 Ω resistance reflects. A matching network must cancel the reactance; adjusting the resistance alone does not help.',
  ),
  noteRes: loc(
    '只有电阻偏离 50 Ω，电抗为 0：|Γ| = |R − 50| / (R + 50)。R 离 50 Ω 越远，反射越大。',
    'Only the resistance differs from 50 Ω and the reactance is zero: |Γ| = |R − 50| / (R + 50). The farther R is from 50 Ω, the more it reflects.',
  ),
  task1: loc('选“50 Ω 匹配”，读出 |Γ| 与 RL。', 'Select “50 Ω matched” and read |Γ| and RL.'),
  task2: loc('把负载改成 25 Ω 或 100 Ω，看 VSWR 为什么同样是 2。', 'Set the load to 25 Ω or 100 Ω and see why both give VSWR = 2.'),
  task3: loc('给负载加上电抗（X ≠ 0），看 |Γ| 怎样变大。', 'Add reactance (X ≠ 0) to the load and watch |Γ| grow.'),
  task4: loc('让 VSWR 超过 2，读出失配损耗。', 'Push VSWR above 2 and read the mismatch loss.'),
}

/** 右侧说明：数值在同一处给出，结论给出原因 */
export function verdictOf(state: SparamState, a: SparamAnalysis): { title: LText; text: LText; note: LText } {
  const numbers = loc(
    `|Γ| = ${f2(a.gammaMag)}，RL = ${fmtNum(a.rlDb, 2)} dB，VSWR = ${fmtNum(a.vswr, 2)}，失配损耗 = ${fmtNum(a.mismatchDb, 2)} dB。`,
    `|Γ| = ${f2(a.gammaMag)}, RL = ${fmtNum(a.rlDb, 2)} dB, VSWR = ${fmtNum(a.vswr, 2)}, mismatch loss = ${fmtNum(a.mismatchDb, 2)} dB.`,
  )
  if (a.gammaMag < 1e-9) {
    return { title: S.verdictMatch, text: numbers, note: S.noteMatch }
  }
  if (a.pass) {
    return {
      title: S.verdictPass,
      text: numbers,
      note: loc(
        `VSWR ≤ 2 为合格，但它仍有反射：约 ${fmtNum(a.reflectedPct, 1)}% 的功率被反射，失配损耗约 ${fmtNum(a.mismatchDb, 2)} dB。`,
        `VSWR ≤ 2 counts as passing, but it still reflects: about ${fmtNum(a.reflectedPct, 1)}% of the power is reflected, a mismatch loss of about ${fmtNum(a.mismatchDb, 2)} dB.`,
      ),
    }
  }
  let note = S.noteRes
  if (a.gammaMag >= 0.999) {
    note = S.noteFull
  } else if (state.xOhm !== 0) {
    note = S.noteReact
  }
  return { title: S.verdictFail, text: numbers, note }
}

/** 四张任务卡：完成与否由当前负载和分析结果算出 */
export function taskItems(state: SparamState, a: SparamAnalysis): TaskItem[] {
  return [
    { id: 'match', text: S.task1, done: state.preset === 'match' },
    { id: 'two', text: S.task2, done: state.xOhm === 0 && (state.rOhm === 25 || state.rOhm === 100) },
    { id: 'react', text: S.task3, done: state.xOhm !== 0 },
    { id: 'fail', text: S.task4, done: !a.pass },
  ]
}

/** 数字全部由模型算出，不手写 */
const LOW = analyseSparam(applyPreset(DEFAULT_SPARAM, 'low'))
const REACT = analyseSparam(applyPreset(DEFAULT_SPARAM, 'reactive'))
const PURE_REACT = analyseSparam({ preset: 'custom', rOhm: 0, xOhm: 100 })
/** RL = 20 dB 对应的 |Γ| = 10^(−RL/20) */
const GAMMA_AT_RL20 = 10 ** (-20 / 20)
/** VSWR = 2 对应的 |Γ| = (VSWR − 1) / (VSWR + 1) */
const GAMMA_AT_VSWR2 = (VSWR_LIMIT - 1) / (VSWR_LIMIT + 1)

export const MISCONCEPTIONS: LText[] = [
  loc(
    `回波损耗（RL）越大，功率损耗越大。反了：RL 越大，反射越小，损耗越小。RL 是反射的度量；真正的功率损耗是失配损耗。50 + j50 Ω 的 RL 约为 ${fmtNum(REACT.rlDb, 1)} dB，失配损耗却只有 ${fmtNum(REACT.mismatchDb, 2)} dB。`,
    `A larger return loss means more power lost. This is backwards: a larger RL means less reflection and less loss. RL measures reflection; the actual power loss is the mismatch loss. For 50 + j50 Ω, RL is about ${fmtNum(REACT.rlDb, 1)} dB while the mismatch loss is only ${fmtNum(REACT.mismatchDb, 2)} dB.`,
  ),
  loc(
    'VSWR = 2 的负载一定是 50 Ω。不对：25 Ω 与 100 Ω 的 VSWR 都是 2，因为 VSWR 只由 |Γ| 决定，不分电阻偏大还是偏小；有电抗时 VSWR 也会变差。',
    'A load with VSWR = 2 must be 50 Ω. Not true: 25 Ω and 100 Ω both give VSWR = 2, because VSWR depends only on |Γ|, not on whether R is too high or too low. Reactance also degrades VSWR.',
  ),
  loc(
    '电抗不耗能，所以不会引起反射。不对：电抗不吃功率，但 Γ 的虚部不为零，|Γ| 会变大。50 + j50 Ω 的电阻正好是 50 Ω，仍然有反射。',
    'Reactance does not consume power, so it cannot cause reflection. Not true: reactance absorbs no power, but it makes the imaginary part of Γ nonzero and |Γ| grows. 50 + j50 Ω has exactly 50 Ω of resistance and still reflects.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Γ = (ZL − Z0)/(ZL + Z0)，|Γ| 决定 RL、VSWR 与失配损耗。负载正好 50 Ω 时 Γ = 0；只有电阻偏离时，|Γ| 由 R 决定；有电抗时即使 R 正好 50 Ω 也会反射。VSWR ≤ 2（|Γ| ≤ 1/3）为合格。',
  'Γ = (ZL − Z0)/(ZL + Z0), and |Γ| sets RL, VSWR and mismatch loss. A 50 Ω load gives Γ = 0; if only R differs, |Γ| is set by R; with reactance, even a 50 Ω resistance reflects. VSWR ≤ 2 (|Γ| ≤ 1/3) counts as passing.',
)

/** 公式行：纯符号，不含需要翻译的文字 */
export const FORMULAS: string[] = [
  'Γ = (ZL − Z0) / (ZL + Z0)',
  'RL = −20 · log10 |Γ|',
  'VSWR = (1 + |Γ|) / (1 − |Γ|)',
  'Mismatch = −10 · log10 (1 − |Γ|²)',
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('负载 ZL = 50 Ω，Z0 = 50 Ω，|Γ| 是多少？', 'Load ZL = 50 Ω and Z0 = 50 Ω. What is |Γ|?'),
    options: [
      { id: 'a', text: same('1') },
      { id: 'b', text: same('0') },
      { id: 'c', text: same('0.5') },
    ],
    answer: 'b',
    explain: loc(
      'Γ = (50 − 50) / (50 + 50) = 0，所以 |Γ| = 0，RL 为无穷大，VSWR = 1：没有反射。',
      'Γ = (50 − 50) / (50 + 50) = 0, so |Γ| = 0, RL is infinite and VSWR = 1: no reflection.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('负载 25 Ω（X = 0），|Γ| 约为多少？', 'Load 25 Ω (X = 0). Approximately what is |Γ|?'),
    options: [
      { id: 'a', text: same(f2(LOW.gammaMag)) },
      { id: 'b', text: same(f2(0.5)) },
      { id: 'c', text: same(f2(1)) },
    ],
    answer: 'a',
    explain: loc(
      `Γ = (25 − 50) / (25 + 50) = −1/3，|Γ| = ${f2(LOW.gammaMag)}。电阻偏小同样会反射，且反射量只由 |Γ| 决定。`,
      `Γ = (25 − 50) / (25 + 50) = −1/3, so |Γ| = ${f2(LOW.gammaMag)}. A low resistance reflects too; the reflection depends only on |Γ|.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('VSWR 恰好为 2:1 时，对应的 |Γ| 是多少？', 'At VSWR exactly 2:1, what is |Γ|?'),
    options: [
      { id: 'a', text: same(f2(0.5)) },
      { id: 'b', text: same(f2(GAMMA_AT_VSWR2)) },
      { id: 'c', text: same(f2(1 / 9)) },
    ],
    answer: 'b',
    explain: loc(
      `由 (1 + |Γ|) / (1 − |Γ|) = 2 解出 |Γ| = 1/3 ≈ ${f2(GAMMA_AT_VSWR2)}。反过来，|Γ| = 1/3 时 VSWR 就是 2。`,
      `Solving (1 + |Γ|) / (1 − |Γ|) = 2 gives |Γ| = 1/3 ≈ ${f2(GAMMA_AT_VSWR2)}. Conversely, |Γ| = 1/3 gives VSWR = 2.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('纯电抗负载（R = 0，X = 100 Ω）的 |Γ| 是多少？', 'A pure reactive load (R = 0, X = 100 Ω). What is |Γ|?'),
    options: [
      { id: 'a', text: same(f2(PURE_REACT.gammaMag)) },
      { id: 'b', text: same(f2(0)) },
      { id: 'c', text: same(f2(0.5)) },
    ],
    answer: 'a',
    explain: loc(
      `|Γ| = |j100 − 50| / |j100 + 50| = 1，即 ${f2(PURE_REACT.gammaMag)}。对任意 X 都是 1：入射功率全部被反射，没有功率进入负载。`,
      `|Γ| = |j100 − 50| / |j100 + 50| = 1, i.e. ${f2(PURE_REACT.gammaMag)}. It is 1 for any X: all incident power is reflected and none enters the load.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('回波损耗 RL = 20 dB，|Γ| 是多少？', 'Return loss RL = 20 dB. What is |Γ|?'),
    options: [
      { id: 'a', text: same(f2(GAMMA_AT_RL20)) },
      { id: 'b', text: same(f2(0.5)) },
      { id: 'c', text: same(f2(0.01)) },
    ],
    answer: 'a',
    explain: loc(
      `RL = −20 · log10 |Γ| = 20，所以 |Γ| = 10^(−20/20) = ${f2(GAMMA_AT_RL20)}。RL 每增加 20 dB，|Γ| 缩小为原来的 1/10。`,
      `RL = −20 · log10 |Γ| = 20, so |Γ| = 10^(−20/20) = ${f2(GAMMA_AT_RL20)}. Each 20 dB increase in RL divides |Γ| by 10.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('负载 50 + j50 Ω，失配损耗约为多少？', 'Load 50 + j50 Ω. About how much is the mismatch loss?'),
    options: [
      { id: 'a', text: same(`${f2(0.1)} dB`) },
      { id: 'b', text: same(`${fmtNum(REACT.mismatchDb, 2)} dB`) },
      { id: 'c', text: same(`${fmtNum(REACT.rlDb, 2)} dB`) },
    ],
    answer: 'b',
    explain: loc(
      `|Γ|² = ${fmtNum(REACT.gammaMag * REACT.gammaMag, 2)}，失配损耗 = −10·log10(1 − 0.2) = ${fmtNum(REACT.mismatchDb, 2)} dB。${fmtNum(REACT.rlDb, 2)} dB 是回波损耗 RL，它衡量反射，不是功率损耗。`,
      `|Γ|² = ${fmtNum(REACT.gammaMag * REACT.gammaMag, 2)}, mismatch loss = −10·log10(1 − 0.2) = ${fmtNum(REACT.mismatchDb, 2)} dB. The ${fmtNum(REACT.rlDb, 2)} dB figure is the return loss RL, which measures reflection and is not the power lost.`,
    ),
  },
]
