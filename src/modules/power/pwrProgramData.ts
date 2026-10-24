import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { fillText } from './pwrWbgData'
import {
  MANDATORY_STEPS,
  PAT_ORDER,
  PULSE_ORDER,
  STEP_LIMIT,
  STEP_MS,
  TARGET_DPPM,
  TIME_BUDGET_MS,
  type PatMode,
  type ProgramState,
  type ProgramSummary,
  type StepId,
} from './pwrProgramModel'

/** 每项的名称、条件、限值文字；限值里的数字由模型常数填入 */
export const STEP_TEXT: Record<StepId, { name: LText; cond: LText; limit: LText }> = {
  kelvin: {
    name: loc('Kelvin 接触检查', 'Kelvin contact check'),
    cond: loc('每个引脚的 force / sense 接触电阻', 'Force / sense contact resistance per pin'),
    limit: loc('Rc ≤ {hi} Ω', 'Rc ≤ {hi} Ω'),
  },
  igss: {
    name: loc('Igss 栅极漏电', 'Igss gate leakage'),
    cond: loc('Vgs = 20 V，Vds = 0 V', 'Vgs = 20 V, Vds = 0 V'),
    limit: loc('|Igss| ≤ {hi} nA', '|Igss| ≤ {hi} nA'),
  },
  vth: {
    name: loc('Vth 阈值电压', 'Vth threshold voltage'),
    cond: loc('Id = 1 mA 恒流点', 'Id = 1 mA constant-current point'),
    limit: loc('{lo} ≤ Vth ≤ {hi} V', '{lo} ≤ Vth ≤ {hi} V'),
  },
  idss: {
    name: loc('Idss 漏电（高压偏置）', 'Idss leakage (high-voltage bias)'),
    cond: loc('高压偏置，Vgs = 0', 'High-voltage bias, Vgs = 0'),
    limit: loc('Idss ≤ {hi} µA', 'Idss ≤ {hi} µA'),
  },
  bvdss: {
    name: loc('BVdss 击穿电压', 'BVdss breakdown voltage'),
    cond: loc('Id = 250 µA，Vgs = 0', 'Id = 250 µA, Vgs = 0'),
    limit: loc('BVdss ≥ {lo} V', 'BVdss ≥ {lo} V'),
  },
  rds: {
    name: loc('Rds(on) 脉冲测量', 'Rds(on) pulsed measurement'),
    cond: loc('Id = 10 A，脉宽见下方选择', 'Id = 10 A, pulse width set below'),
    limit: loc('Rds(on) ≤ {hi} mΩ，可加 PAT', 'Rds(on) ≤ {hi} mΩ, PAT optional'),
  },
  vsd: {
    name: loc('Vsd 体二极管压降', 'Vsd body-diode drop'),
    cond: loc('Isd = 5 A', 'Isd = 5 A'),
    limit: loc('Vsd ≤ {hi} V', 'Vsd ≤ {hi} V'),
  },
  uis: {
    name: loc('UIS 抽样（雪崩）', 'UIS sample (avalanche)'),
    cond: loc('只对被抽中的 DUT 执行', 'Run only on sampled DUTs'),
    limit: loc('通过 / 失效（教学简化）', 'Pass / fail (teaching simplification)'),
  },
}

/** 失效 Bin 的说明（规范表的 Bin 号） */
export const BIN_TEXT: Record<number, LText> = {
  2: loc('Kelvin 接触', 'Kelvin contact'),
  3: loc('漏电（Igss / Idss）', 'Leakage (Igss / Idss)'),
  4: loc('BVdss 击穿', 'BVdss breakdown'),
  5: loc('Rds(on) / Vsd', 'Rds(on) / Vsd'),
  6: loc('Vth 阈值', 'Vth threshold'),
  7: loc('UIS 抽样', 'UIS sample'),
}

export function stepLimitText(id: StepId): LText {
  const lim = STEP_LIMIT[id]
  return fillText(STEP_TEXT[id].limit, { lo: String(lim.lo), hi: String(lim.hi) })
}

function pulseText(us: number): LText {
  const text = us >= 1000 ? `${us / 1000} ms` : `${us} µs`
  return loc(text, text)
}

/** Seg 的 id 必须是字符串：脉宽用十进制字符串作 id，页面里再转回数字 */
export const PULSE_SEG = PULSE_ORDER.map((us) => ({ id: String(us), label: pulseText(us) }))

export const PAT_SEG: Array<{ id: PatMode; label: LText }> = PAT_ORDER.map((id) => ({
  id,
  label: id === 'off' ? loc('关闭', 'Off') : loc('开启', 'On'),
}))

export const S = {
  kickerNow: loc('综合', 'Capstone'),
  introTitle: loc('从单项测试到量产测试程序', 'From single tests to a production test program'),
  coreTitle: loc('拨一拨：流程、UIS 抽样与漏检', 'Try it: flow, UIS sampling and escapes'),
  coreNote: loc(
    '1000 颗虚拟 DUT、4 个 Site，固定 seed，结果可以复现。流程按表中顺序执行，遇到第一个失效项就停止，Bin 由它决定。改顺序、关项目、调参数，看 Bin、时间、UPH、COT 与漏检怎么变。数据全部是教学示意。',
    '1000 virtual DUTs on 4 sites with a fixed seed, so results repeat. The flow runs in table order and stops at the first failing item, which sets the bin. Change the order, switch items off or tune parameters, and watch bins, time, UPH, COT and escapes. All data is a teaching illustration.',
  ),
  flowTitle: loc('测试流程（可开关、可调顺序）', 'Test flow (switch items, change order)'),
  colOn: loc('启用', 'On'),
  colItem: loc('项目', 'Item'),
  colCond: loc('条件', 'Condition'),
  colLimit: loc('限值', 'Limit'),
  colBin: loc('失败 Bin', 'Fail bin'),
  colMove: loc('顺序', 'Order'),
  enableAria: loc('启用这一项', 'Enable this item'),
  moveUp: loc('上移一项', 'Move up one place'),
  moveDown: loc('下移一项', 'Move down one place'),
  pulseLabel: loc('Rds(on) 脉宽', 'Rds(on) pulse width'),
  patLabel: loc('PAT 动态限值', 'Dynamic PAT limits'),
  patKLabel: loc('PAT 的 k（σ 倍数）', 'PAT k (multiples of σ)'),
  uisLabel: loc('UIS 抽样率', 'UIS sampling rate'),
  stdNote: loc('示例，以现行标准为准', 'Example; follow the current standard'),
  illus: loc('教学示意', 'Teaching illustration'),
  formulaTime: loc(
    '教学简化：平均时间 = 本颗 DUT 实际执行的各项耗时之和，UIS 只对被抽中的 DUT 计时',
    'Teaching-simplified: average time = sum of the items each DUT actually runs; UIS is timed only on sampled DUTs',
  ),
  formulaUph: loc(
    '教学简化公式：UPH = 3600·N / (T_idx + T_par + N·T_ser)·(1 + r)，N = 4',
    'Teaching-simplified formula: UPH = 3600·N / ((T_idx + T_par + N·T_ser)·(1 + r)), N = 4',
  ),
  rYield: loc('良率', 'Yield'),
  rEsc: loc('漏检（有缺陷却通过）', 'Escapes (defective but passed)'),
  rOver: loc('误杀（好的却失效）', 'Overkill (good but failed)'),
  rDppm: loc('漏检 DPPM', 'Escape DPPM'),
  rAvg: loc('平均测试时间', 'Average test time'),
  rBudget: loc('时间预算', 'Time budget'),
  rRetest: loc('Kelvin 失效（重测率）', 'Kelvin fails (retest rate)'),
  rUph: loc('UPH（4 Site）', 'UPH (4 sites)'),
  rCot: loc('COT（美分 / 颗）', 'COT (cents per part)'),
  rCpkRds: loc('Rds(on) Cpk（只看上限）', 'Rds(on) Cpk (upper limit only)'),
  rCpkVth: loc('Vth Cpk（双侧）', 'Vth Cpk (two-sided)'),
  rPat: loc('PAT 限值 Rds(on)', 'PAT limits, Rds(on)'),
  rWithin: loc('在预算内', 'Within budget'),
  rOver2: loc('超出预算', 'Over budget'),
  rTarget: loc('漏检目标', 'Escape target'),
  rMet: loc('达到', 'Met'),
  rNotMet: loc('未达到', 'Not met'),
  exportBtn: loc('导出 STDF 并回读校验', 'Export STDF and read it back'),
  exportIdle: loc('尚未导出', 'Not exported yet'),
  exportOk: loc('已导出，回读 {n} 颗，Bin 计数与仿真一致', 'Exported; read back {n} parts, bin counts match the simulation'),
  exportBad: loc('回读结果与仿真不一致，检查记录顺序与 Bin', 'Read-back does not match the simulation; check record order and bins'),
  rExport: loc('STDF 回读', 'STDF read-back'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。数值题的限值与标准均为示例，以现行标准为准。', 'Pick an answer to see right or wrong with an explanation. Numbers and limits here are examples; follow the current standard.'),
  asideLater: loc(
    '综合程序的每一项都要说明为什么存在：Kelvin 先于器件参数，UIS 抽样率由时间预算与漏检共同决定，导出的 STDF 必须能被解析器读回。',
    'Every item in the program needs a reason: Kelvin comes before device parameters, the UIS sampling rate balances the time budget against escapes, and exported STDF must read back in the parser.',
  ),
  task1: loc('把全部必测项（除 UIS 抽样外）都开启，并保证平均时间在预算以内。', 'Enable every mandatory item (all except UIS sampling) and keep the average time within budget.'),
  task2: loc('把 Kelvin 检查放在 Rds(on) 之前，用 Site 3 的 Kelvin 失效数证明接触问题能被发现。', 'Put the Kelvin check before Rds(on), and use Site 3’s Kelvin fail count to show the contact problem is caught.'),
  task3: loc('调 UIS 抽样率，在时间预算内把漏检压到目标以下（提示：PAT 能抓住边缘缺陷）。', 'Tune the UIS sampling rate so the average time stays in budget and escapes fall below target (hint: PAT catches marginal defects).'),
  task4: loc('导出 STDF，并用解析器读回，Bin 计数要与仿真一致。', 'Export the STDF and read it back; the bin counts must match the simulation.'),
  vKelvinLate: loc('Kelvin 没有排在 Rds(on) 之前', 'Kelvin is not before Rds(on)'),
  vKelvinLateText: loc(
    'Rds(on) 先测时，Site 3 的接触不良会被当成器件失效（Bin 5），Site 3 的 Rds(on) 均值为 {rds3} mΩ。原因：接触电阻会经 sense 路径泄漏进读数，Kelvin 检查只能在它之前发现。',
    'When Rds(on) runs first, Site 3’s contact fault is counted as a device failure (bin 5), and Site 3’s mean Rds(on) is {rds3} mΩ. Reason: contact resistance leaks into the reading through the sense path, and only a Kelvin check placed earlier can catch it.',
  ),
  vKelvinOff: loc('Kelvin 检查已关闭', 'Kelvin check is switched off'),
  vKelvinOffText: loc(
    '没有 Kelvin 检查，接触不良的 DUT 会混进器件结果。原因：Site 3 的 Rds(on) 偏高无法区分是器件还是接触，应先开启 Kelvin 检查。',
    'Without the Kelvin check, contact-fault DUTs mix into the device results. Reason: a high Site 3 Rds(on) cannot tell a device fault from a contact fault, so the Kelvin check must be on.',
  ),
  vOverBudget: loc('平均测试时间超出预算', 'Average test time is over budget'),
  vOverBudgetText: loc(
    '平均 {ms} ms，预算 {budget} ms。原因：UIS 单颗耗时最长，抽样率越高，时间越长，UPH 下降、COT 上升。',
    'Average {ms} ms against a {budget} ms budget. Reason: UIS is the longest item, so a higher sampling rate adds time, lowers UPH and raises COT.',
  ),
  vEscape: loc('漏检高于目标', 'Escapes are above target'),
  vEscapeText: loc(
    '漏检 {dppm} DPPM，目标 {target}。原因：只有 UIS 能抓到潜在缺陷；边缘缺陷在 Rds(on) 限值之内，需要 PAT 收紧限值才能抓到。',
    'Escapes are {dppm} DPPM against a {target} target. Reason: only UIS catches latent defects, and marginal defects sit inside the Rds(on) limit, so PAT must tighten it to catch them.',
  ),
  vOk: loc('流程在预算内，漏检达到目标', 'The flow fits the budget and meets the escape target'),
  vOkText: loc(
    '平均 {ms} ms，漏检 {dppm} DPPM。原因：UIS 抽样率与 PAT 的组合在时间和漏检之间取得平衡，Kelvin 先于器件参数，接触问题不会误判为器件失效。',
    'Average {ms} ms, escapes {dppm} DPPM. Reason: the UIS sampling rate and PAT together balance time against escapes, and Kelvin before device parameters keeps contact faults from being read as device failures.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '前面几课分别讲了静态参数、开尔文连接、动态参数、双脉冲、UIS、宽禁带器件。综合课要把它们放进一份量产测试程序：项目有顺序，遇到失效就停；限值要随批次变化；UIS 这类有破坏性的项目要抽样；结果要能导出成 STDF，交给下游的数据分析。统计与离群值的做法见 {@relPat} 与 {@anaStats}，雪崩应力的物理背景见 {@pwrUis}。',
    'Earlier lessons covered static parameters, Kelvin connection, dynamic parameters, double-pulse, UIS and wide-bandgap devices. This capstone puts them into one production test program: items have an order and stop on the first failure; limits can follow the lot; a stressful item such as UIS is sampled; and results are exported as STDF for downstream analysis. For the statistics and outlier methods see {@relPat} and {@anaStats}; for the avalanche physics see {@pwrUis}.',
  ),
  loc(
    '输出的数据格式与 Multi-site 的效率计算见 {@genStdf} 与 {@genMultisite}。这一课的数值全部是仿真生成的教学示意，不对应任何真实批次或客户数据。',
    'For the output format and multi-site efficiency see {@genStdf} and {@genMultisite}. All numbers in this lesson are simulated teaching illustrations and do not match any real lot or customer data.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '所有项都全测最稳。UIS 单颗耗时最长，全测会超出时间预算；UPH 下降、COT 上升。应该在预算内用抽样换取覆盖，并用 PAT 补足静态测试。',
    'Testing everything is the safest. UIS is the longest item, so full testing breaks the time budget and lowers UPH while raising COT. Sampling within budget plus PAT on static tests gives better coverage.',
  ),
  loc(
    'Site 3 的 Rds(on) 偏高，说明器件坏了。也可能是接触不良，它们在数据上难以区分；应先做 Kelvin 接触检查，确认接触正常后，再把 Rds(on) 当作器件结果。',
    'A high Site 3 Rds(on) means the device is bad. It can also be a contact fault, and the data alone cannot tell them apart. Run the Kelvin contact check first, and treat Rds(on) as a device result only once contact is confirmed good.',
  ),
  loc(
    '脉宽越长，测得越准。脉宽越长，自热越大，Rds(on) 读数偏高；脉宽要短到避开自热，又要长到读数稳定，应按器件的热时间常数选。',
    'The longer the pulse, the more accurate the reading. A longer pulse adds self-heating, which biases Rds(on) high; the pulse must be short enough to avoid self-heating yet long enough for a stable reading, chosen from the device’s thermal time constant.',
  ),
]

export const TAKEAWAY: LText = loc(
  '量产程序是有顺序的：Kelvin 检查先于器件参数，失效即停，Bin 由第一个失效项决定。UIS 耗时长，抽样率由时间预算和漏检共同定；PAT 能抓住边缘缺陷；导出的 STDF 必须读回，Bin 计数与仿真一致才算数。',
  'A production program has an order: the Kelvin check comes before device parameters, the flow stops at the first failure, and the bin is set by the first failing item. UIS is slow, so its sampling rate balances the time budget against escapes; PAT catches marginal defects; and exported STDF must read back with bin counts that match the simulation.',
)

/* 小测：数值题的结果由模型常数算出，经 fillText 放入文字 */
const Q4_MS = (STEP_MS.uis * 0.25).toFixed(1)
const Q6_CPK = ((10 - 6.5) / (3 * 0.5)).toFixed(2)
const Q9_DPPM = Math.round((4 / 900) * 1e6).toString()

export const QUIZ: QuizQuestion[] = [
  {
    id: 'pp-q1',
    prompt: loc('综合程序里 Kelvin 接触检查为什么要排在 Rds(on) 之前？', 'Why is the Kelvin contact check placed before Rds(on) in the capstone program?'),
    options: [
      { id: 'a', text: loc('先排除接触不良，避免把接触问题误判为器件失效', 'To rule out contact faults first, so they are not misread as device failures') },
      { id: 'b', text: loc('Kelvin 检查可以替代 Rds(on) 的测量值', 'Kelvin can replace the Rds(on) measurement') },
      { id: 'c', text: loc('排在最后可以省掉全部测试时间', 'Placing it last saves all the test time') },
    ],
    answer: 'a',
    explain: loc(
      'Kelvin 测的是接触电阻，不是器件参数。它排在前面，接触不良的 DUT 会在 Bin 2 停下，不会进入 Rds(on) 测量；若排在后面，接触电阻会经 sense 路径混进 Rds(on) 读数，被记成 Bin 5。',
      'The Kelvin check measures contact resistance, not a device parameter. Placed first, a contact-fault DUT stops at bin 2 and never reaches Rds(on); placed last, contact resistance leaks into the Rds(on) reading and is recorded as bin 5.',
    ),
  },
  {
    id: 'pp-q2',
    prompt: loc('某颗 DUT 先在 Vth 失效（Bin 6），之后 Rds(on) 本来也会失效（Bin 5）。按 stop-on-fail 流程，它最终落入哪个 Bin？', 'A DUT fails Vth first (bin 6); Rds(on), which comes later, would also have failed (bin 5). Under the stop-on-fail flow, which bin does it finally land in?'),
    options: [
      { id: 'a', text: loc('Bin 5，因为 Rds(on) 的失效更严重', 'Bin 5, because the Rds(on) failure is more serious') },
      { id: 'b', text: loc('Bin 6，第一个失效项决定 Bin，后面的项不再测', 'Bin 6: the first failing item sets the bin, and later items are not run') },
      { id: 'c', text: loc('Bin 随机取一个', 'A random one of the two') },
    ],
    answer: 'b',
    explain: loc(
      'stop-on-fail 在第一个失效项停止，之后的项目不执行，所以 Rds(on) 不会被测，也不会影响 Bin。这样节省时间，但后面的项目看不到，它们的失效情况不会出现在数据里。',
      'Stop-on-fail halts at the first failing item, so later items never run and cannot set the bin. This saves time, but the later items show no data, so their failures are invisible in the results.',
    ),
  },
  {
    id: 'pp-q3',
    prompt: loc('关于 UIS 抽样，哪一组说法都正确？（1）抽样率越高，潜在缺陷的漏检越少，但时间越长；（2）被抽中的 DUT 不受应力，所以抽样没有代价；（3）抽样率为 0 时 UIS 不耗时，但潜在缺陷全部漏检。', 'For UIS sampling, which option lists only correct statements? (1) a higher sampling rate cuts escapes of latent defects but adds time; (2) a sampled DUT is not stressed, so sampling has no cost; (3) at a 0 % rate UIS takes no time, but all latent defects escape.'),
    options: [
      { id: 'a', text: loc('（1）、（2）', '(1) and (2)') },
      { id: 'b', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'c', text: loc('（2）、（3）', '(2) and (3)') },
    ],
    answer: 'b',
    explain: loc(
      '（2）错：UIS 是雪崩应力，被抽中的 DUT 本身会受到应力，这是抽样要权衡的原因。（1）和（3）正确：抽样率提高，覆盖面变大，时间随之增加。',
      '(2) is wrong: UIS is an avalanche stress, so a sampled DUT is itself stressed; that is why sampling is a trade-off. (1) and (3) are correct: a higher rate widens coverage and adds time, and a 0 % rate means no UIS time and no latent-defect screening.',
    ),
  },
  {
    id: 'pp-q4',
    prompt: fillText(
      loc('假设所有 DUT 都走到 UIS 这一步，UIS 单颗 {ms} ms，抽样率 25 %，平均每颗增加多少毫秒？', 'Assume every DUT reaches the UIS step. With UIS at {ms} ms and a 25 % sampling rate, how many milliseconds does it add per part on average?'),
      { ms: String(STEP_MS.uis) },
    ),
    options: [
      { id: 'a', text: fillText(loc('{v} ms', '{v} ms'), { v: String(STEP_MS.uis) }) },
      { id: 'b', text: fillText(loc('{v} ms', '{v} ms'), { v: String(STEP_MS.uis / 100) }) },
      { id: 'c', text: fillText(loc('{v} ms', '{v} ms'), { v: Q4_MS }) },
    ],
    answer: 'c',
    explain: fillText(
      loc(
        '平均增加 = 抽样率 × 单颗耗时 = 0.25 × {ms} = {v} ms。如果把 25 % 当成 1 %，结果会少 25 倍；直接取单颗耗时则忽略了抽样。',
        'Average added time = sampling rate × item time = 0.25 × {ms} = {v} ms. Reading 25 % as 1 % would be 25 times too small; using the full item time ignores sampling.',
      ),
      { ms: String(STEP_MS.uis), v: Q4_MS },
    ),
  },
  {
    id: 'pp-q5',
    prompt: loc('关于 Rds(on) 的脉宽，哪种说法正确？', 'Which statement about the Rds(on) pulse width is correct?'),
    options: [
      { id: 'a', text: loc('脉宽越长，自热越大，读数偏高；要选在避开自热、又能稳定读数的脉宽', 'The longer the pulse, the more self-heating and the higher the reading; choose a width that avoids self-heating yet reads stably') },
      { id: 'b', text: loc('脉宽越长，读数越准，应尽量取最长', 'The longer the pulse, the more accurate, so use the longest possible') },
      { id: 'c', text: loc('脉宽与 Rds(on) 读数无关', 'Pulse width has no effect on the Rds(on) reading') },
    ],
    answer: 'a',
    explain: loc(
      'Rds(on) 随结温升高而增大。脉宽变长，器件的温升 ΔT = P·Zth(t) 变大，读数随之偏高（教学简化公式）。所以“越长越准”是误区。',
      'Rds(on) rises with junction temperature. A longer pulse raises the temperature rise ΔT = P·Zth(t), so the reading goes up (teaching-simplified formula). So “longer is more accurate” is a misconception.',
    ),
  },
  {
    id: 'pp-q6',
    prompt: loc(
      'Rds(on) 只设上限 10 mΩ，测得均值 6.5 mΩ，σ = 0.5 mΩ。按 Cpk = min(USL − μ, μ − LSL) / (3σ)，只有上限时 Cpk 约为多少？',
      'Rds(on) has only an upper limit of 10 mΩ, the measured mean is 6.5 mΩ and σ = 0.5 mΩ. With Cpk = min(USL − μ, μ − LSL) / (3σ), what is Cpk with only an upper limit?',
    ),
    options: [
      { id: 'a', text: loc('4.67', '4.67') },
      { id: 'b', text: loc('1.17', '1.17') },
      { id: 'c', text: fillText(loc('{v}', '{v}'), { v: Q6_CPK }) },
    ],
    answer: 'c',
    explain: fillText(
      loc(
        '只有上限：Cpk = (USL − μ) / (3σ) = (10 − 6.5) / (3 × 0.5) = {v}。4.67 是用了 σ = 0.25；1.17 是用了 σ = 1.0，都不对。',
        'Upper limit only: Cpk = (USL − μ) / (3σ) = (10 − 6.5) / (3 × 0.5) = {v}. 4.67 uses σ = 0.25; 1.17 uses σ = 1.0; both are wrong.',
      ),
      { v: Q6_CPK },
    ),
  },
  {
    id: 'pp-q7',
    prompt: loc('Site 3 的 Rds(on) 偏高。哪一组说法都正确？（1）Site 3 的 Rds(on) 偏高本身就证明器件坏了；（2）应先做 Kelvin 检查，它能发现接触问题；（3）Kelvin 放在 Rds(on) 之后，接触问题会被误判为器件失效。', 'Site 3 shows a high Rds(on). Which option lists only correct statements? (1) a high Site 3 Rds(on) alone proves the device is bad; (2) the Kelvin check should come first, since it finds contact faults; (3) with Kelvin after Rds(on), contact faults get misread as device failures.'),
    options: [
      { id: 'a', text: loc('（1）、（2）', '(1) and (2)') },
      { id: 'b', text: loc('（2）、（3）', '(2) and (3)') },
      { id: 'c', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'd', text: loc('（1）、（2）、（3）', '(1), (2) and (3)') },
    ],
    answer: 'b',
    explain: loc(
      '（1）错：接触不良也会让 Rds(on) 偏高，二者在数据上难以区分。（2）（3）正确：Kelvin 先行，能把接触问题单独挑出来；放在后面，它们就会以器件失效的形式进入统计。',
      '(1) is wrong: contact faults also raise Rds(on), and the data alone cannot separate the two. (2) and (3) are correct: with Kelvin first, contact faults are isolated; placed later, they enter the statistics as device failures.',
    ),
  },
  {
    id: 'pp-q8',
    prompt: loc('仿真为什么要使用固定的 seed？', 'Why does the simulation use a fixed seed?'),
    options: [
      { id: 'a', text: loc('让每次运行的随机结果都不同，显得更真实', 'So each run gives different random results, which looks more realistic') },
      { id: 'b', text: loc('同一群体才能公平比较不同流程、参数的结果', 'So different flows and parameters are compared on the same population') },
      { id: 'c', text: loc('让 UIS 必然抽中全部 DUT', 'So that UIS always samples every DUT') },
    ],
    answer: 'b',
    explain: loc(
      '同一 seed 生成的 DUT 完全相同，所以改了顺序或抽样率后，变化只来自流程本身，不来自随机性。这也是检查“同 seed 可复现”的意义。',
      'The same seed produces the same DUTs, so a change in order or sampling rate changes only the flow, not the randomness. This is also why “the same seed reproduces” is checked.',
    ),
  },
  {
    id: 'pp-q9',
    prompt: loc(
      '1000 颗中有 900 颗通过，其中 4 颗实际有缺陷（漏检）。漏检 DPPM 约为多少？',
      'Of 1000 parts, 900 pass and 4 of those passing parts are actually defective (escapes). What is the escape DPPM, approximately?',
    ),
    options: [
      { id: 'a', text: loc('4', '4') },
      { id: 'b', text: fillText(loc('{v}', '{v}'), { v: Q9_DPPM }) },
      { id: 'c', text: loc('44.4', '44.4') },
    ],
    answer: 'b',
    explain: fillText(
      loc(
        'DPPM = 漏检数 / 通过数 × 10⁶ = 4 / 900 × 10⁶ ≈ {v}。分母是通过的颗数，不是总颗数。',
        'DPPM = escapes / passed parts × 10⁶ = 4 / 900 × 10⁶ ≈ {v}. The denominator is the number of passed parts, not the total.',
      ),
      { v: Q9_DPPM },
    ),
  },
  {
    id: 'pp-q10',
    prompt: loc('导出 STDF 后，哪一组说法都正确？（1）用解析器读回，Bin 计数应与仿真一致；（2）能编码成字节就说明数据正确，不必读回；（3）还要检查记录顺序（PIR、PTR、PRR、HBR 等）是否合法。', 'After exporting STDF, which option lists only correct statements? (1) reading it back with the parser, the bin counts should match the simulation; (2) if it encodes to bytes, the data is correct and no read-back is needed; (3) the record order (PIR, PTR, PRR, HBR and so on) must also be checked.'),
    options: [
      { id: 'a', text: loc('（1）、（2）', '(1) and (2)') },
      { id: 'b', text: loc('（2）、（3）', '(2) and (3)') },
      { id: 'c', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'd', text: loc('（1）、（2）、（3）', '(1), (2) and (3)') },
    ],
    answer: 'c',
    explain: loc(
      '（2）错：编码成功不代表格式正确，字段或顺序错了解析器仍可能读出错误结果。只有读回并比对 Bin 计数，才能确认导出是正确的。（1）（3）正确。',
      '(2) is wrong: successful encoding does not mean the format is right; a field or order error can still read back wrong. Only reading back and comparing bin counts confirms the export. (1) and (3) are correct.',
    ),
  },
]

/** 任务卡：done 由当前流程与统计结果算出；exportOk 来自页面里最近一次导出的回读结果 */
export function taskItems(state: ProgramState, summary: ProgramSummary, exportOk: boolean): TaskItem[] {
  const enabled = (id: StepId) => state.steps.some((s) => s.id === id && s.enabled)
  const kIdx = state.steps.findIndex((s) => s.id === 'kelvin' && s.enabled)
  const rIdx = state.steps.findIndex((s) => s.id === 'rds' && s.enabled)
  const site3KelvinFails = summary.sites[2]?.kelvinFails ?? 0
  return [
    { id: 'pp-cover', text: S.task1, done: MANDATORY_STEPS.every((id) => enabled(id)) && summary.budgetOk },
    { id: 'pp-kelvin', text: S.task2, done: kIdx >= 0 && (rIdx < 0 || kIdx < rIdx) && site3KelvinFails > 0 },
    { id: 'pp-uis', text: S.task3, done: enabled('uis') && summary.budgetOk && summary.dppm <= TARGET_DPPM },
    { id: 'pp-stdf', text: S.task4, done: exportOk },
  ]
}

/** 右侧说明栏：随流程与统计变化，并写出原因 */
export function verdictOf(state: ProgramState, summary: ProgramSummary): { title: LText; text: LText } {
  const kIdx = state.steps.findIndex((s) => s.id === 'kelvin' && s.enabled)
  const rIdx = state.steps.findIndex((s) => s.id === 'rds' && s.enabled)
  const rds3 = (summary.sites[2]?.rdsMean ?? 0).toFixed(2)
  if (kIdx < 0) {
    return { title: S.vKelvinOff, text: S.vKelvinOffText }
  }
  if (rIdx >= 0 && kIdx > rIdx) {
    return { title: S.vKelvinLate, text: fillText(S.vKelvinLateText, { rds3 }) }
  }
  if (!summary.budgetOk) {
    return {
      title: S.vOverBudget,
      text: fillText(S.vOverBudgetText, { ms: summary.avgMs.toFixed(0), budget: String(TIME_BUDGET_MS) }),
    }
  }
  if (summary.dppm > TARGET_DPPM) {
    return {
      title: S.vEscape,
      text: fillText(S.vEscapeText, { dppm: Math.round(summary.dppm).toString(), target: String(TARGET_DPPM) }),
    }
  }
  return {
    title: S.vOk,
    text: fillText(S.vOkText, { ms: summary.avgMs.toFixed(0), dppm: Math.round(summary.dppm).toString() }),
  }
}

/** 图的文字：标题、标签与无障碍名称 */
export const FIG = {
  paretoAria: loc('失效 Bin 的 Pareto 条形图（教学示意，按数量排序）', 'Pareto bar chart of fail bins (teaching illustration, sorted by count)'),
  paretoTitle: loc('失效 Bin Pareto（颗数）', 'Fail-bin Pareto (parts)'),
  paretoCap: loc(
    '教学示意：条越长，失效颗数越多。同一个 Bin 号可能对应几个项目（Bin 3 是 Igss 与 Idss）。',
    'Teaching illustration: longer bars mean more failing parts. One bin number can cover several items (bin 3 is Igss and Idss).',
  ),
  siteAria: loc('四个 Site 的 Kelvin 失效数与 Rds(on) 均值（教学示意）', 'Kelvin fails and mean Rds(on) for the four sites (teaching illustration)'),
  siteTitle: loc('Kelvin 失效（柱）与 Rds 均值（底部，mΩ）', 'Kelvin fails (bars) and mean Rds (bottom, mΩ)'),
  siteLabel: (site: number) => fillText(loc('Site {i}', 'Site {i}'), { i: String(site) }),
  figCap: loc(
    '教学示意：柱越高，该 Site 的 Kelvin 失效越多。Site 3 的接触电阻偏大，Kelvin 检查把它挑出来；Rds(on) 均值只统计通过 Kelvin 的 DUT。',
    'Teaching illustration: taller bars mean more Kelvin fails at that site. Site 3 has larger contact resistance, and the Kelvin check picks it out; the Rds(on) mean only covers DUTs that passed Kelvin.',
  ),
}