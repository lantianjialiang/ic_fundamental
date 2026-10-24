import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { fill } from './pwrKelvinModel'
import { FLAT_MIN_US, LOW_IG_MA, type GateAnalysis, type GateState } from './pwrGateModel'

export const S = {
  kickerNow: loc('这一次充电', 'This charge'),
  introTitle: loc('栅极电荷：用电荷量看开关过程', 'Gate charge: reading the switching process as charge'),
  coreTitle: loc('拨一拨：恒流充电时栅压与漏压怎么走', 'Try it: how Vgs and Vds move under constant-current charging'),
  coreNote: loc(
    '恒定的 Ig 向栅极注入电荷，Q = Ig·t。曲线分三段：充 Cgs 到平台、米勒平台（Vds 下降）、再充到驱动电压。金色阴影是米勒平台。',
    'A constant Ig injects charge into the gate, Q = Ig·t. The curve has three parts: charging Cgs up to the plateau, the Miller plateau (Vds falls), then charging to the drive voltage. The gold band is the Miller plateau.',
  ),
  igLabel: loc('测试恒流 Ig（mA）', 'Test current Ig (mA)'),
  vddLabel: loc('漏源电压 Vdd（V）', 'Drain supply Vdd (V)'),
  cgsLabel: loc('栅源电容 Cgs（nF）', 'Gate-source capacitance Cgs (nF)'),
  cgd0Label: loc('Cgd 在 Vds = 0 时的值（nF，随 Vds 下降）', 'Cgd at Vds = 0 (nF, falls with Vds)'),
  vthLabel: loc('阈值电压 Vth（V）', 'Threshold voltage Vth (V)'),
  vdriveLabel: loc('驱动电压 Vdrive（V）', 'Drive voltage Vdrive (V)'),
  fswLabel: loc('开关频率 fsw（kHz）', 'Switching frequency fsw (kHz)'),
  rQgs: loc('Qgs（平台前的电荷）', 'Qgs (charge before the plateau)'),
  rQgd: loc('Qgd（平台期间的电荷）', 'Qgd (charge during the plateau)'),
  rQg: loc('Qg（总栅极电荷）', 'Qg (total gate charge)'),
  rVplat: loc('米勒平台电压', 'Miller plateau voltage'),
  rTpl: loc('平台持续时间 Qgd / Ig', 'Plateau duration Qgd / Ig'),
  rPdrive: loc('驱动损耗 Qg·Vdrive·fsw', 'Drive loss Qg·Vdrive·fsw'),
  guessLabel: loc('你从曲线读到的 Qgd（nC）', 'Qgd you read from the curve (nC)'),
  guessHint: loc('判定：与模型值相差 ±5% 以内算读对。', 'Judged correct within ±5% of the model value.'),
  guessEmpty: loc('还没输入', 'Not entered yet'),
  guessOkMsg: loc('读对了（在 ±5% 以内）', 'Correct (within ±5%)'),
  guessNoMsg: loc('还不在 ±5% 以内，再看看平台的起止点', 'Not within ±5% yet; check where the plateau starts and ends'),
  vgsTrace: loc('Vgs（栅源电压）', 'Vgs (gate-source voltage)'),
  vdsTrace: loc('Vds（漏源电压）', 'Vds (drain-source voltage)'),
  plateauLabel: loc('米勒平台', 'Miller plateau'),
  scopeAria: loc(
    '栅压 Vgs 与漏压 Vds 随时间变化的示波器视图，金色阴影为米勒平台',
    'Scope view of Vgs and Vds over time; the gold band marks the Miller plateau',
  ),
  scopeSummary: loc(
    '平台电压约 {v} V，平台持续 {t} µs（Qgd / Ig）；Vds 在平台期间从 Vdd 降到 0.5 V（教学值）。',
    'Plateau voltage about {v} V, lasting {t} µs (Qgd / Ig); Vds falls from Vdd to 0.5 V during the plateau (teaching value).',
  ),
  teachNote: loc(
    '教学示意：平台电压取 Vth + 1 V（Id/gfs 取固定值）；Cgd 的非线性是教学模型。教学简化公式：P = Qg·Vdrive·fsw。',
    'Teaching illustration: the plateau voltage is taken as Vth + 1 V (Id/gfs held fixed); the Cgd non-linearity is a teaching model. Teaching-simplified formula: P = Qg·Vdrive·fsw.',
  ),
  standardNote: loc(
    '示例，以现行标准为准：这里的电压与频率取值只用来演示，不是任何器件或标准的数值。',
    'Example; follow the current standard: the voltage and frequency values here are for demonstration and are not any device’s or standard’s values.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实测试里，栅极电荷与电容通常是抽样或特性化测量，不在每颗上做。下一课的双脉冲测试会把开关能量放进同一套时序里看。',
    'In real tests gate charge and capacitance are usually sampled or characterized, not measured on every part. The next lesson, double-pulse test, puts switching energy into the same timing picture.',
  ),
  next: loc('下一课：双脉冲测试与开关能量', 'Next: Double-pulse test and switching energy'),
  task1: loc(
    'T1：从曲线的平台段读出 Qgd，填入上方输入框，误差在 ±5% 以内。',
    'T1: Read Qgd from the plateau segment, enter it in the box above, and be within ±5%.',
  ),
  task2: loc(
    'T2：把 Vdd 调到 80 V 以上，看 Qgd 怎么变，并说出原因（Cgd 随 Vds 下降，高压时平台要“扫”过更大的 Vds 范围）。',
    'T2: Raise Vdd to 80 V or more, see how Qgd changes, and explain why (Cgd falls as Vds falls, so a higher Vdd makes the plateau sweep a wider Vds range).',
  ),
  task3: loc(
    'T3：Qg = 60 nC、Vdrive = 10 V、fsw = 500 kHz 时驱动损耗为 0.3 W；把参数调到驱动损耗读数约 0.3 W（±5%）。',
    'T3: Drive loss is P = Qg·Vdrive·fsw. Tune Cgs or fsw until the drive-loss readout is 0.3 W (within ±0.015 W).',
  ),
  task4: loc(
    'T4：找出 Ig 过大或过小时平台难辨的情况（平台短于 0.5 µs，或 Ig 不超过 2 mA），说明原因。',
    'T4: Find a case where the plateau is hard to read at too large or too small an Ig (plateau shorter than 0.5 µs, or Ig at most 2 mA), and say why.',
  ),
}

export const INTRO = [
  loc(
    '栅极电荷测试用恒定电流 Ig 向栅极充电，测量 Vgs 随时间的变化。因为 Q = Ig·t，时间就是电荷量，所以曲线上的平台长度直接给出 Qgd。Ciss、Crss、Coss 与 Qg、Qgs、Qgd 的关系，以及电容与开关时间的测法，见 {@pwrSelector} 与 {@pwrStatic}。',
    'The gate-charge test charges the gate with a constant current Ig and records Vgs against time. Because Q = Ig·t, time is charge: the plateau length on the curve gives Qgd directly. The link between Ciss, Crss, Coss and Qg, Qgs, Qgd, and how capacitance and switching time are measured, is covered in {@pwrSelector} and {@pwrStatic}.',
  ),
  loc(
    '曲线分三段。第一段，Vds 还在 Vdd，充 Cgs 与 Cgd，把 Vgs 充到平台电压；第二段是米勒平台，Vgs 不动，电流全部用来给 Cgd 充电，Vds 从 Vdd 掉下来；第三段 Vds 已经很低，再把 Vgs 充到驱动电压。驱动损耗 P = Qg·Vdrive·fsw 也由总电荷 Qg 决定。',
    'The curve has three parts. First, Vds is still at Vdd, and Cgs and Cgd charge until Vgs reaches the plateau voltage. Second, the Miller plateau: Vgs holds still, all the current goes into Cgd, and Vds falls from Vdd. Third, Vds is already low and Vgs climbs to the drive voltage. Drive loss P = Qg·Vdrive·fsw is set by the total charge Qg.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '电容是常数。Cgd 随 Vds 高度非线性：Vds 低时很大，高压时很小。所以 Ciss、Coss 要写明 Vds 条件，不同条件下的数字不能直接比。',
    'Capacitance is a constant. Cgd is strongly non-linear in Vds: large at low Vds and small at high voltage. So Ciss and Coss must state the Vds condition, and numbers from different conditions cannot be compared directly.',
  ),
  loc(
    'Qg 与测试 Ig 无关。恒流积分后总电荷只由器件和电压决定，但 Ig 过大时平台被压缩、被示波器采样“抹平”，读数变难；Ig 过小时平台受漏电与漂移拖累。',
    'Qg has nothing to do with the test Ig. After constant-current integration the total charge depends only on the device and voltages. But when Ig is too large the plateau is squeezed and smoothed out by scope sampling, and when Ig is too small it is distorted by leakage and drift.',
  ),
  loc(
    'Ciss 越小越好。Ciss 小开关快，但导通电阻 Rds(on) 与芯片面积、Qg 之间有折中；只看 Ciss 会忽略导通损耗。',
    'Smaller Ciss is always better. A smaller Ciss switches faster, but there is a trade-off with Rds(on), chip area and Qg; looking at Ciss alone ignores conduction loss.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Q = Ig·t，平台长度 t = Qgd / Ig；Qg 是总电荷，驱动损耗 P = Qg·Vdrive·fsw（教学简化公式）。Cgd 随 Vds 非线性，测电容和电荷都要写明 Vds 条件。Ig 太大平台被抹平，太小被漏电拖累，要选在中间。',
  'Q = Ig·t, so the plateau length is t = Qgd / Ig; Qg is the total charge and drive loss is P = Qg·Vdrive·fsw (teaching-simplified formula). Cgd is non-linear in Vds, so capacitance and charge tests must state the Vds condition. Too large an Ig smears the plateau, too small lets leakage distort it; choose something in between.',
)

/** 小测题里的数字由同一套公式算出，与页面保持一致 */
const Q1_P = 60e-9 * 10 * 5e5
const Q2_T = 18 / 10
const Q3_Q = 3 * 4

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'Qg = 60 nC、Vdrive = 10 V、fsw = 500 kHz。栅极驱动损耗 P 约是多少？',
      'Qg = 60 nC, Vdrive = 10 V, fsw = 500 kHz. About what is the gate drive loss P?',
    ),
    options: [
      { id: 'a', text: loc('0.03 W', '0.03 W') },
      { id: 'b', text: loc(`${Q1_P.toFixed(1)} W`, `${Q1_P.toFixed(1)} W`) },
      { id: 'c', text: loc('3 W', '3 W') },
    ],
    answer: 'b',
    explain: loc(
      `P = Qg·Vdrive·fsw = 60e-9 × 10 × 5e5 = ${Q1_P.toFixed(1)} W。fsw 是频率，要先把 500 kHz 换成 5×10⁵ Hz。`,
      `P = Qg·Vdrive·fsw = 60e-9 × 10 × 5e5 = ${Q1_P.toFixed(1)} W. fsw is a frequency, so 500 kHz must become 5×10⁵ Hz first.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('Ig = 10 mA 恒流充电，平台期间的电荷 Qgd = 18 nC。平台持续多长时间？', 'Constant Ig = 10 mA charges the gate, and the plateau charge Qgd = 18 nC. How long does the plateau last?'),
    options: [
      { id: 'a', text: loc('18 µs', '18 µs') },
      { id: 'b', text: loc('0.18 µs', '0.18 µs') },
      { id: 'c', text: loc(`${Q2_T.toFixed(1)} µs`, `${Q2_T.toFixed(1)} µs`) },
    ],
    answer: 'c',
    explain: loc(
      `t = Qgd / Ig = 18 nC / 10 mA = ${Q2_T.toFixed(1)} µs。nC 除以 mA 直接得到 µs，因为 1 nC / 1 mA = 1 µs。`,
      `t = Qgd / Ig = 18 nC / 10 mA = ${Q2_T.toFixed(1)} µs. Dividing nC by mA gives µs directly, since 1 nC / 1 mA = 1 µs.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('Cgs = 3 nF，忽略 Cgd，把 Vgs 从 0 充到 4 V，需要多少栅极电荷？', 'Cgs = 3 nF, ignoring Cgd: how much gate charge is needed to take Vgs from 0 to 4 V?'),
    options: [
      { id: 'a', text: loc('0.75 nC', '0.75 nC') },
      { id: 'b', text: loc(`${Q3_Q.toFixed(0)} nC`, `${Q3_Q.toFixed(0)} nC`) },
      { id: 'c', text: loc('1.3 µC', '1.3 µC') },
    ],
    answer: 'b',
    explain: loc(
      `Q = C·V = 3 nF × 4 V = ${Q3_Q.toFixed(0)} nC。这是忽略 Cgd 的近似；真实 Qgs 还要加上 Cgd 的那一部分。`,
      `Q = C·V = 3 nF × 4 V = ${Q3_Q.toFixed(0)} nC. This ignores Cgd; the real Qgs also includes the Cgd share.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于米勒平台，哪一组说法正确？①平台期间 Vgs 基本保持 ②平台期间 Vds 下降 ③平台期间电流主要在充 Cgd ④平台期间 Vgs 还在明显上升',
      'About the Miller plateau, which combination is correct? ① Vgs stays roughly constant during the plateau ② Vds falls during the plateau ③ during the plateau the current mainly charges Cgd ④ Vgs still rises clearly during the plateau',
    ),
    options: [
      { id: 'a', text: loc('①②③', '① ② and ③') },
      { id: 'b', text: loc('②④', '② and ④') },
      { id: 'c', text: loc('①④', '① and ④') },
    ],
    answer: 'a',
    explain: loc(
      '①②③ 正确。④ 错：平台期间 Vgs 基本不动，因为注入的电流都被 Cgd 吸收（Vds 在变），栅压没有余量再升高。',
      '① ② and ③ are correct. ④ is wrong: during the plateau Vgs barely moves, because the injected current is absorbed by Cgd while Vds changes.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于电容关系，哪一组说法正确？①Ciss = Cgs + Cgd ②Crss = Cgd ③Coss = Cds + Cgd ④Ciss 不随 Vds 变化',
      'About the capacitance relations, which combination is correct? ① Ciss = Cgs + Cgd ② Crss = Cgd ③ Coss = Cds + Cgd ④ Ciss does not change with Vds',
    ),
    options: [
      { id: 'a', text: loc('①②④', '① ② and ④') },
      { id: 'b', text: loc('②③④', '② ③ and ④') },
      { id: 'c', text: loc('①②③', '① ② and ③') },
    ],
    answer: 'c',
    explain: loc(
      '①②③ 正确。④ 错：Cgd 随 Vds 非线性变化，Ciss 包含 Cgd，所以也随 Vds 变化，测试时必须写明 Vds 条件。',
      '① ② and ③ are correct. ④ is wrong: Cgd is non-linear in Vds and Ciss contains Cgd, so Ciss changes with Vds and the test must state the Vds condition.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('Qg 与测试用的恒流 Ig 有什么关系？', 'What is the relation between Qg and the test constant current Ig?'),
    options: [
      { id: 'a', text: loc('有关：Ig 越大，Qg 越大', 'Related: the larger Ig, the larger Qg') },
      { id: 'b', text: loc('有关：Ig 越小，Qg 越大', 'Related: the smaller Ig, the larger Qg') },
      { id: 'c', text: loc('无关：恒流积分后总电荷只由器件与电压决定，Ig 只决定平台占多长时间', 'Unrelated: after constant-current integration the total charge depends only on the device and voltages; Ig only sets how long the plateau lasts') },
    ],
    answer: 'c',
    explain: loc(
      'Q = Ig·t，Ig 大则 t 短，两者乘积不变。Ig 决定的是平台的时间长度与可读性，不改变 Qg。',
      'Q = Ig·t: a larger Ig gives a shorter t and the product stays the same. Ig sets the plateau duration and how readable it is, but does not change Qg.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('其它条件不变，把 Vdd 从 50 V 升到 100 V，Qgd 会怎样？', 'Other things equal, raising Vdd from 50 V to 100 V: what happens to Qgd?'),
    options: [
      { id: 'a', text: loc('变大：平台要让 Vds 从更高的电压降下来，Cgd 的积分范围更大', 'Larger: the plateau must pull Vds down from a higher voltage, so the integral of Cgd covers a wider range') },
      { id: 'b', text: loc('变小：Vdd 越高，Cgd 越小，平台越短', 'Smaller: a higher Vdd means smaller Cgd and a shorter plateau') },
      { id: 'c', text: loc('不变：Qgd 只由 Vth 决定', 'Unchanged: Qgd is set by Vth alone') },
    ],
    answer: 'a',
    explain: loc(
      'Qgd = ∫ Cgd(v) dv，积分上限是 Vdd。Vdd 升高，积分范围变大，所以 Qgd 变大。这也是 Qgd 随测试电压变化的原因，测 Qgd 必须写明 Vdd。',
      'Qgd = ∫ Cgd(v) dv with the upper limit at Vdd. A higher Vdd widens the integration range, so Qgd grows. This is why Qgd depends on the test voltage and must be reported with Vdd.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('“电容是常数，测一次就够”，这个说法对吗？', 'Is it right that “capacitance is a constant, one measurement is enough”?'),
    options: [
      { id: 'a', text: loc('对，Cgs、Cgd、Cds 都是常数', 'Yes, Cgs, Cgd and Cds are all constants') },
      { id: 'b', text: loc('不对：Cgd 随 Vds 非线性变化（低压时大），测试条件必须写明 Vds', 'No: Cgd changes non-linearly with Vds (large at low voltage), so the test must state Vds') },
      { id: 'c', text: loc('对，但只随温度变化', 'Yes, but it only changes with temperature') },
    ],
    answer: 'b',
    explain: loc(
      'Cgd 高度非线性：Vds 低时很大，高压时很小。同一颗器件在不同 Vds 下测出的 Ciss、Coss 不同，所以数据表里的电容都带着 Vds 条件。',
      'Cgd is strongly non-linear: large at low Vds and small at high Vds. The same device gives different Ciss and Coss at different Vds, which is why datasheet capacitances carry a Vds condition.',
    ),
  },
]

export function gateVerdict(s: GateState, a: GateAnalysis): { title: LText; text: LText } {
  if (a.tPlUs <= FLAT_MIN_US) {
    return {
      title: loc('平台太短，示波器难分辨', 'Plateau too short for the scope'),
      text: fill(
        loc(
          'Ig = {i} mA 时平台只有 {t} µs（Qgd / Ig）。Ig 大，平台被压缩到采样间隔附近，斜线被“抹平”，读 Qgd 不准。Qg 本身并没有变，变的是平台的可读性。',
          'At Ig = {i} mA the plateau lasts only {t} µs (Qgd / Ig). A large Ig squeezes the plateau toward the sample interval and smears it flat, so Qgd is hard to read. Qg itself has not changed; only how readable the plateau is has.',
        ),
        { i: s.igMa.toFixed(0), t: a.tPlUs.toFixed(2) },
      ),
    }
  }
  if (s.igMa <= LOW_IG_MA) {
    return {
      title: loc('Ig 过小，平台受漏电拖累', 'Ig too small: leakage distorts the plateau'),
      text: fill(
        loc(
          'Ig = {i} mA 时平台要 {t} µs 才走完。电流小，漏电、夹具泄漏和漂移的占比变大，Vgs 的平台不再平，起止难以判定（教学示意）。Qg 仍由电荷积分决定。',
          'At Ig = {i} mA the plateau takes {t} µs to pass. With a small current, leakage, fixture loss and drift take a bigger share, so the plateau is no longer flat and its start and end are hard to pick out (teaching illustration). Qg is still set by charge integration.',
        ),
        { i: s.igMa.toFixed(0), t: a.tPlUs.toFixed(1) },
      ),
    }
  }
  return {
    title: loc('平台清晰，可以读 Qgd', 'Plateau is clear: Qgd can be read'),
    text: fill(
      loc(
        'Ig = {i} mA，平台持续 {t} µs，Qgd = {q} nC（= Ig × t）。Vdd = {v} V 时 Cgd 的积分范围由 Vdd 决定，所以 Qgd 要和 Vdd 一起报告。',
        'Ig = {i} mA, the plateau lasts {t} µs, and Qgd = {q} nC (= Ig × t). With Vdd = {v} V the Cgd integration range is set by Vdd, so Qgd must be reported together with Vdd.',
      ),
      { i: s.igMa.toFixed(0), t: a.tPlUs.toFixed(2), q: a.qgd.toFixed(1), v: s.vdd.toFixed(0) },
    ),
  }
}

/** 任务卡 T1 的读数判定：输入框为空或不是数字时不算完成 */
export function guessOk(guess: string, qgd: number): boolean {
  const value = Number(guess)
  if (guess.trim() === '' || !Number.isFinite(value)) {
    return false
  }
  return Math.abs(value - qgd) <= 0.05 * qgd
}

/** 四张任务卡：完成与否由当前参数与读数算出，重置后自动还原 */
export function taskItems(s: GateState, a: GateAnalysis, guess: string): TaskItem[] {
  return [
    { id: 'read-qgd', text: S.task1, done: guessOk(guess, a.qgd) },
    { id: 'vdd-up', text: S.task2, done: s.vdd >= 80 },
    { id: 'drive-loss', text: S.task3, done: Math.abs(a.pDriveW - 0.3) <= 0.015 },
    { id: 'ig-extreme', text: S.task4,     done: a.tPlUs <= FLAT_MIN_US || s.igMa <= LOW_IG_MA },
  ]
}
