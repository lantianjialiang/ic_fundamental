import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type DptResult, type DptState, type WinKey } from './pwrDptModel'

/** 把占位符 {0}、{1} … 换成数值（数值由代码算出，文案本身不拼中文） */
export function fill(text: LText, ...values: string[]): LText {
  const apply = (s: string): string => s.replace(/\{(\d+)\}/g, (_, i: string) => values[Number(i)] ?? '')
  return loc(apply(text.zh), apply(text.en ?? text.zh))
}

/** 积分窗口的选择：显示顺序即数组顺序，默认取 [0] */
export const WIN_SEG: Array<{ id: WinKey; label: LText }> = [
  { id: 'off', label: loc('关断 Eoff', 'Turn-off Eoff') },
  { id: 'on', label: loc('开通 Eon', 'Turn-on Eon') },
]

export const S = {
  kickerNow: loc('这一次波形', 'This waveform'),
  introTitle: loc('双脉冲：两个脉冲测一次开关能量', 'Double pulse: two pulses measure one switching event'),
  coreTitle: loc('拨一拨：电流怎么来，开关沿怎么走', 'Try it: how the current is set and how the edges move'),
  coreNote: loc(
    '测试条件为教学示例，示例，以现行标准为准。第一脉冲把电感电流打到 I = Vdc·t1/L；关断时测 Eoff；续流后第二脉冲开通，测 Eon（含续流二极管的反向恢复 Qrr）。',
    'Test conditions are teaching examples; example, follow the current standard. The first pulse sets the inductor current to I = Vdc·t1/L; turn-off gives Eoff; after freewheeling, the second pulse turns on and gives Eon (including the freewheel diode reverse recovery Qrr).',
  ),
  kVdc: loc('母线 Vdc', 'Bus Vdc'),
  kL: loc('负载电感 L', 'Load inductor L'),
  kT1: loc('第一脉冲 t1', 'First pulse t1'),
  kRg: loc('栅极电阻 Rg', 'Gate resistor Rg'),
  kLs: loc('杂散电感 Lstray', 'Stray inductance Lstray'),
  kQrr: loc('续流二极管 Qrr', 'Freewheel diode Qrr'),
  kBw: loc('探头带宽', 'Probe bandwidth'),
  kDeskew: loc('探头偏斜（电流相对电压延后）', 'Probe deskew (current later than voltage)'),
  circuitAria: loc(
    '双脉冲电路示意图：母线、负载电感、续流二极管、下管 DUT、栅极电阻和杂散电感',
    'Double-pulse circuit schematic: bus, load inductor, freewheel diode, low-side DUT, gate resistor and stray inductance',
  ),
  circuitCap: loc(
    '示意：母线 Vdc 经负载电感 L 给下管 DUT 供电；关断后电流经续流二极管 D 流走。Vds 探头跨在 DUT 两端，Id 探头在 DUT 电流路径上；Lstray 在换流回路中，关断时产生过冲。',
    'Schematic: the bus Vdc feeds the low-side DUT through the load inductor L; after turn-off the current freewheels through diode D. The Vds probe is across the DUT and the Id probe is in its current path; Lstray sits in the commutation loop and causes the overshoot at turn-off.',
  ),
  legendVds: loc('Vds 探头', 'Vds probe'),
  legendId: loc('Id 探头', 'Id probe'),
  legendD: loc('D：续流二极管', 'D: freewheel diode'),
  legendL: loc('L：负载电感', 'L: load inductor'),
  scopeAria: loc(
    '双脉冲波形：Vds、Id、Vgs 随时间变化，阴影为所选积分区间',
    'Double-pulse waveform: Vds, Id and Vgs over time; the shaded area is the selected integration window',
  ),
  scopeNote: loc(
    '教学示意：三条曲线各除以满量程（Vdc、I、Vdrive）放在同一坐标，读数以右侧为准；关断与开通之间的续流段压缩为 300 ns。',
    'Teaching illustration: each trace is divided by its full scale (Vdc, I, Vdrive) to share one axis; read the numbers on the right. The freewheel gap between turn-off and turn-on is compressed to 300 ns.',
  ),
  winPick: loc('积分区间', 'Integration window'),
  winOffLabel: loc('关断积分区间：Vds 上升，Id 下降', 'Turn-off window: Vds rises, Id falls'),
  winOnLabel: loc('开通积分区间：Id 上升（含 Qrr），Vds 下降', 'Turn-on window: Id rises (incl. Qrr), Vds falls'),
  trVds: loc('Vds（÷ Vdc）', 'Vds (÷ Vdc)'),
  trId: loc('Id（÷ I）', 'Id (÷ I)'),
  trVgs: loc('Vgs（÷ Vdrive）', 'Vgs (÷ Vdrive)'),
  scopeSummary: loc(
    'Vds 峰值 {0} V（Vdc = {1} V）；Id 峰值 {2} A（I = {3} A）；积分区间：{4}，时长 {5} ns，能量 {6} µJ。',
    'Vds peak {0} V (Vdc = {1} V); Id peak {2} A (I = {3} A); integration window: {4}, {5} ns long, energy {6} µJ.',
  ),
  rCurrent: loc('电流 I = Vdc·t1/L', 'Current I = Vdc·t1/L'),
  rDiDt: loc('di/dt（教学近似）', 'di/dt (teaching approximation)'),
  rDvDt: loc('dv/dt（教学近似）', 'dv/dt (teaching approximation)'),
  rOvershoot: loc('过冲 ΔV = Lstray·di/dt', 'Overshoot ΔV = Lstray·di/dt'),
  rEon: loc('Eon（波形积分）', 'Eon (waveform integral)'),
  rEoff: loc('Eoff（波形积分）', 'Eoff (waveform integral)'),
  rEonErr: loc('Eon 测量误差', 'Eon measurement error'),
  rEoffErr: loc('Eoff 测量误差', 'Eoff measurement error'),
  rEonFormula: loc('Eon 教学简化公式', 'Eon teaching-simplified formula'),
  rEoffFormula: loc('Eoff 教学简化公式（不含过冲）', 'Eoff teaching-simplified formula (no overshoot)'),
  formulaNote: loc(
    '教学简化公式：Eon ≈ ½·Vdc·I·(t_ri + t_fv) + Qrr·Vdc，Eoff ≈ ½·Vdc·I·(t_rv + t_fi)。Eon 公式未计反向恢复期间的 I·Vdc·t_rr（电流仍为 I、Vds 仍为 Vdc），所以比波形积分小。di/dt、dv/dt 的 Rg 依赖为教学近似。',
    'Teaching-simplified formula: Eon ≈ ½·Vdc·I·(t_ri + t_fv) + Qrr·Vdc, Eoff ≈ ½·Vdc·I·(t_rv + t_fi). The Eon formula leaves out I·Vdc·t_rr during reverse recovery (the current is still I and Vds is still Vdc), so it reads lower than the waveform integral. The Rg dependence of di/dt and dv/dt is a teaching approximation.',
  ),
  errNote: loc(
    '测量误差 = 测量链（偏斜、带宽）得到的值 ÷ 理想测量链的值 − 1。',
    'Measurement error = value from the measurement chain (skew, bandwidth) ÷ value from the ideal chain − 1.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实器件的 di/dt、dv/dt 随温度与电压变化，寄生电感与探头要用实测校准；这里只练电流设定、过冲、偏斜与积分。',
    'Real devices have di/dt and dv/dt that vary with temperature and voltage, and parasitics and probes must be calibrated by measurement; here we only practise current setting, overshoot, skew and integration.',
  ),
  next: loc('下一课：雪崩（UIS）、SOA 与热阻', 'Next: Avalanche (UIS), SOA and thermal resistance'),
  task1: loc('目标 I = 30 A，求第一脉冲 t1（Vdc 400 V、L 100 µH 时应为 7.5 µs）。', 'Target I = 30 A: find t1 (7.5 µs with Vdc 400 V and L 100 µH).'),
  task2: loc('把 Rg 调到使 di/dt 约 2 A/ns，再看 Lstray = 20 nH 时的过冲（应为 40 V）。', 'Set Rg so di/dt is about 2 A/ns, then read the overshoot with Lstray = 20 nH (should be 40 V).'),
  task3: loc('加入 5 ns 的探头偏斜，读 Eoff 的测量误差，并说明它的方向。', 'Add 5 ns of probe deskew, read the Eoff measurement error, and explain its sign.'),
  task4: loc('Rg 增大到 20 Ω 以上，比较开关能量与过冲，说出这个折中。', 'Raise Rg to 20 Ω or more; compare switching energy and overshoot and state the trade-off.'),
  vOverT: loc('过冲偏大', 'Overshoot too large'),
  vOverX: loc(
    'ΔV = Lstray·di/dt = {0} nH × {1} A/ns = {2} V，是 Vdc 的 {3}%。过冲叠在母线上，Vds 峰值约 {4} V，要留出器件耐压的余量。减小 Lstray，或增大 Rg 降低 di/dt（代价是开关损耗变大）。',
    'ΔV = Lstray·di/dt = {0} nH × {1} A/ns = {2} V, which is {3}% of Vdc. The overshoot stacks on the bus, so the Vds peak is about {4} V; keep margin below the device rating. Reduce Lstray, or raise Rg to lower di/dt (at the cost of more switching loss).',
  ),
  vSkewT: loc('测量偏斜', 'Probe skew'),
  vSkewX: loc(
    '电流探头比电压探头晚 {0} ns。结果：Eoff 偏大 {1}%，Eon 偏小 {2}%。偏斜让电流的沿与电压的沿错开，同一段能量被算到了另一个沿。偏斜与电流沿同量级时误差很大，做 DPT 前先校准 deskew。',
    'The current probe is {0} ns later than the voltage probe. Result: Eoff reads {1}% high and Eon reads {2}% low. Skew shifts the current edge against the voltage edge, so the same energy is credited to the other edge. When skew is comparable to the current edge, the error is large; calibrate deskew before a DPT.',
  ),
  vOkT: loc('参数合理', 'Settings look reasonable'),
  vOkX: loc(
    '过冲 {0} V，为 Vdc 的 {1}%（25% 以内）。测得 Eon {2} µJ，Eoff {3} µJ。',
    'Overshoot {0} V, which is {1}% of Vdc (within 25%). Measured Eon {2} µJ, Eoff {3} µJ.',
  ),
}

export const INTRO = [
  loc(
    '双脉冲测试（DPT）是功率开关最常用的动态测试：两个脉冲在同一个电流点上测出关断能量 Eoff 与开通能量 Eon。第一脉冲把负载电感的电流打到 I = Vdc·t1/L，然后关断；续流段电流经二极管流走；第二脉冲再开通，电流从零上升到 I。栅极电荷与电容的测法见 {@pwrGate}。',
    'The double-pulse test (DPT) is the standard dynamic test for power switches: two pulses set one current level and measure turn-off energy Eoff and turn-on energy Eon. The first pulse builds the load-inductor current to I = Vdc·t1/L, then turns off; the current freewheels through a diode; the second pulse turns on and the current rises from zero to I. Gate charge and capacitance are covered in {@pwrGate}.',
  ),
  loc(
    '开关能量是 E = ∫Vds·Id dt，关断沿和开通沿各要算一次。测量结果受探头偏斜、带宽和杂散电感影响；杂散电感 Lstray 在关断时会抬高 Vds，抬高的量是 Lstray·di/dt。夹具与大电流接法的基础见 {@pwrKelvin}。',
    'Switching energy is E = ∫Vds·Id dt, and the turn-off and turn-on edges are each integrated. The result is affected by probe skew, bandwidth and stray inductance; at turn-off the stray inductance Lstray lifts Vds by Lstray·di/dt. For fixtures and high-current hookup, see {@pwrKelvin}.',
  ),
  loc(
    'DPT 通常在专用台架上做，用于特性化与器件选型。量产时多用 Qg、电容等可以快速测的参数做替代，再与 DPT 做相关性。静态参数的基础见 {@pwrStatic}。',
    'DPT is usually run on a dedicated bench for characterization and device selection. In production, faster parameters such as Qg and capacitance are used as substitutes and correlated with DPT. For the static-parameter basics, see {@pwrStatic}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '能量只看一个开关沿。Eon 与 Eoff 各是一段积分：Eoff 含电压上升与电流下降，Eon 含电流上升、反向恢复 Qrr 和电压下降；两个沿都要算。',
    'Energy comes from one switching edge only. Eon and Eoff are each an integral: Eoff covers voltage rise and current fall; Eon covers current rise, reverse recovery Qrr and voltage fall. Both edges must be counted.',
  ),
  loc(
    '探头带宽够就行，偏斜不用管。带宽决定边沿的平滑程度，偏斜决定两路的时间对齐；偏斜与电流沿同量级时，Eon 和 Eoff 的误差可以达到两位数百分比。',
    'If the probe bandwidth is high enough, skew does not matter. Bandwidth sets how smooth an edge looks; skew sets how well the two channels line up in time. When skew is comparable to the current edge, the Eon and Eoff errors can reach tens of percent.',
  ),
  loc(
    'Rg 越大越好。Rg 增大让 di/dt 和 dv/dt 变慢，过冲变小，但开关能量变大；Rg 的选择是过冲、EMI 与损耗之间的折中。',
    'A larger Rg is always better. A larger Rg slows di/dt and dv/dt, lowering the overshoot but raising the switching energy; choosing Rg trades overshoot and EMI against loss.',
  ),
]

export const TAKEAWAY: LText = loc(
  'I = Vdc·t1/L 设定电流；Eoff 看关断两段，Eon 还要加上反向恢复 Qrr 与 I·Vdc·t_rr；过冲 ΔV = Lstray·di/dt，减小 di/dt 要靠加大 Rg，代价是开关损耗；探头偏斜与电流沿同量级时误差很大，测前先校准。',
  'I = Vdc·t1/L sets the current; Eoff is the turn-off integral, and Eon adds reverse recovery Qrr and I·Vdc·t_rr; the overshoot is ΔV = Lstray·di/dt, and reducing di/dt means raising Rg at the cost of switching loss; when skew is comparable to the current edge the error is large, so calibrate before measuring.',
)

/** 四张任务卡：完成与否由当前设置和仿真结果算出，重置后自动还原 */
export function taskItems(state: DptState, r: DptResult): TaskItem[] {
  return [
    { id: 'dpt-t1', text: S.task1, done: Math.abs(r.timing.current - 30) < 0.25 },
    { id: 'dpt-t2', text: S.task2, done: Math.abs(r.timing.diDt / 1e9 - 2) < 0.05 && Math.abs(r.timing.overshoot - 40) < 1 },
    { id: 'dpt-t3', text: S.task3, done: Math.abs(state.deskewNs - 5) < 0.25 },
    { id: 'dpt-t4', text: S.task4, done: state.rg >= 20 },
  ]
}

/** 右侧说明栏：先看过冲，再看偏斜；每个结论都写出原因 */
export function verdictOf(state: DptState, r: DptResult): { title: LText; text: LText } {
  const k = r.timing
  const ratio = (k.overshoot / state.vdc) * 100
  if (ratio > 25) {
    return {
      title: S.vOverT,
      text: fill(
        S.vOverX,
        state.lstrayNh.toFixed(0),
        (k.diDt / 1e9).toFixed(2),
        k.overshoot.toFixed(1),
        ratio.toFixed(0),
        r.vdsPeak.toFixed(0),
      ),
    }
  }
  if (state.deskewNs >= 2) {
    return {
      title: S.vSkewT,
      text: fill(
        S.vSkewX,
        state.deskewNs.toFixed(1),
        r.eoffErrPct.toFixed(1),
        r.eonErrPct.toFixed(1),
      ),
    }
  }
  return {
    title: S.vOkT,
    text: fill(
      S.vOkX,
      k.overshoot.toFixed(1),
      ratio.toFixed(0),
      (r.eon * 1e6).toFixed(1),
      (r.eoff * 1e6).toFixed(1),
    ),
  }
}

/* ---------- 复习题：多选题用组合选项；数值题的解释写出计算 ---------- */
const Q1_T1_US = (30 * 100) / 400
const Q2_DV = 20 * 2
const Q6_EON_UJ = (0.5 * 200 * 10 * 30e-9 + 50e-9 * 200) * 1e6

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'Vdc = 400 V、L = 100 µH。要把负载电感电流打到 30 A，第一脉冲 t1 应设为多少？',
      'Vdc = 400 V and L = 100 µH. To drive the load current to 30 A, what should the first pulse t1 be?',
    ),
    options: [
      { id: 'a', text: loc('0.75 µs', '0.75 µs') },
      { id: 'b', text: loc(`${Q1_T1_US} µs`, `${Q1_T1_US} µs`) },
      { id: 'c', text: loc('75 µs', '75 µs') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '由 I = Vdc·t1/L 得 t1 = I·L/Vdc = 30 × 100 µH / 400 V = {0} µs。注意单位：µH 与 V 相除得到 µs，不是 ms。',
        'From I = Vdc·t1/L, t1 = I·L/Vdc = 30 × 100 µH / 400 V = {0} µs. Note the units: µH divided by V gives µs.',
      ),
      String(Q1_T1_US),
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'di/dt = 2 A/ns，Lstray = 20 nH。关断时的过冲 ΔV 约是多少？',
      'di/dt = 2 A/ns and Lstray = 20 nH. About how large is the turn-off overshoot ΔV?',
    ),
    options: [
      { id: 'a', text: loc(`${Q2_DV} V`, `${Q2_DV} V`) },
      { id: 'b', text: loc('4 V', '4 V') },
      { id: 'c', text: loc('400 V', '400 V') },
    ],
    answer: 'a',
    explain: loc(
      `ΔV = Lstray·di/dt = 20 nH × 2 A/ns = 20 × 10⁻⁹ H × 2 × 10⁹ A/s = ${Q2_DV} V。`,
      `ΔV = Lstray·di/dt = 20 nH × 2 A/ns = 20 × 10⁻⁹ H × 2 × 10⁹ A/s = ${Q2_DV} V.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('其它条件不变，把栅极电阻 Rg 从 5 Ω 增大到 20 Ω，过冲和开关能量怎么变？', 'With everything else fixed, Rg rises from 5 Ω to 20 Ω. How do the overshoot and switching energy change?'),
    options: [
      { id: 'a', text: loc('过冲和开关能量都变大', 'Both the overshoot and the switching energy rise') },
      { id: 'b', text: loc('过冲变大，开关能量变小', 'Overshoot rises, switching energy falls') },
      { id: 'c', text: loc('过冲变小，开关能量变大', 'Overshoot falls, switching energy rises') },
      { id: 'd', text: loc('过冲和开关能量都变小', 'Both the overshoot and the switching energy fall') },
    ],
    answer: 'c',
    explain: loc(
      'di/dt ∝ 1/Rg，Rg 增大 4 倍，di/dt 和过冲都降到 1/4；但电流与电压的沿变慢，重叠时间变长，开关能量变大。这就是 Rg 的折中。',
      'di/dt ∝ 1/Rg: a 4× larger Rg cuts di/dt and the overshoot to 1/4. But the current and voltage edges get slower, so they overlap longer and the switching energy rises. This is the Rg trade-off.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '下列哪些说法正确？A. 能量只看一个开关沿就够了；B. Eon 中包含续流二极管反向恢复 Qrr 的贡献；C. 只要探头带宽够，偏斜就不用管；D. 电流探头偏斜会改变 Eon 或 Eoff 的测量值。',
      'Which statements are correct? A. One switching edge is enough for energy; B. Eon includes the reverse-recovery Qrr contribution of the freewheel diode; C. As long as the probe bandwidth is high, skew does not matter; D. Current-probe skew changes the measured Eon or Eoff.',
    ),
    options: [
      { id: 'a', text: loc('A 和 C', 'A and C') },
      { id: 'b', text: loc('A、B、C', 'A, B and C') },
      { id: 'c', text: loc('B 和 C', 'B and C') },
      { id: 'd', text: loc('B 和 D', 'B and D') },
    ],
    answer: 'd',
    explain: loc(
      'B 和 D 正确。A 错：Eon、Eoff 各要算一个沿。C 错：带宽决定边沿平滑度，偏斜决定两路对齐，两者都要管。',
      'B and D are correct. A is wrong: Eon and Eoff each need their own edge. C is wrong: bandwidth sets edge smoothness and skew sets alignment; both matter.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么 DPT 多用于特性化，较少用于每颗都做的量产测试？', 'Why is DPT used mostly for characterization rather than for every device in production?'),
    options: [
      { id: 'a', text: loc('DPT 无法测到开关能量', 'DPT cannot measure switching energy') },
      { id: 'b', text: loc('DPT 要专用台架、测试时间长，并对 DUT 施加较大应力；量产多用 Qg、电容等替代参数，再与 DPT 做相关性', 'DPT needs a dedicated bench, takes long and stresses the DUT; production uses substitutes such as Qg and capacitance, correlated with DPT') },
      { id: 'c', text: loc('DPT 的结果一定比其它测法差', 'DPT results are always worse than other methods') },
      { id: 'd', text: loc('DPT 只能测 Eon，不能测 Eoff', 'DPT can only measure Eon, not Eoff') },
    ],
    answer: 'b',
    explain: loc(
      'DPT 结果是可靠的，问题在成本与应力：台架昂贵、单颗耗时长，还会让器件经历完整的开关应力。量产用更快的替代参数，前提是先证明二者有相关性。',
      'DPT results are reliable; the issue is cost and stress: the bench is expensive, each device takes long, and the device sees full switching stress. Production uses faster substitutes, provided correlation with DPT has been shown.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      'Vdc = 200 V、I = 10 A、t_ri = 10 ns、t_fv = 20 ns、Qrr = 50 nC。按教学简化公式，Eon 约多少？',
      'Vdc = 200 V, I = 10 A, t_ri = 10 ns, t_fv = 20 ns, Qrr = 50 nC. By the teaching-simplified formula, about how large is Eon?',
    ),
    options: [
      { id: 'a', text: loc('20 µJ', '20 µJ') },
      { id: 'b', text: loc('30 µJ', '30 µJ') },
      { id: 'c', text: loc(`${Q6_EON_UJ.toFixed(0)} µJ`, `${Q6_EON_UJ.toFixed(0)} µJ`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'Eon ≈ ½·Vdc·I·(t_ri + t_fv) + Qrr·Vdc = ½ × 200 × 10 × 30 ns + 50 nC × 200 V = 30 µJ + 10 µJ = {0} µJ。',
        'Eon ≈ ½·Vdc·I·(t_ri + t_fv) + Qrr·Vdc = ½ × 200 × 10 × 30 ns + 50 nC × 200 V = 30 µJ + 10 µJ = {0} µJ.',
      ),
      Q6_EON_UJ.toFixed(0),
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '测得 Eoff 比预期偏大。下列哪些排查方向合理？A. 检查并校准两路探头的偏斜；B. 核对探头带宽与校准；C. 把 Rg 调大，看 Eoff 会不会下降。',
      'Measured Eoff is higher than expected. Which checks are reasonable? A. Check and calibrate the deskew of the two probes; B. Verify the probe bandwidth and calibration; C. Raise Rg and see whether Eoff falls.',
    ),
    options: [
      { id: 'a', text: loc('A 和 B', 'A and B') },
      { id: 'b', text: loc('A 和 C', 'A and C') },
      { id: 'c', text: loc('B 和 C', 'B and C') },
      { id: 'd', text: loc('A、B、C', 'A, B and C') },
    ],
    answer: 'a',
    explain: loc(
      'A、B 是测量链的检查。C 不是排查：Rg 增大让关断变慢，Eoff 通常更大，它改变的是器件工作条件，不是测量误差。',
      'A and B check the measurement chain. C is not a diagnostic: a larger Rg slows turn-off, so Eoff usually rises; it changes the device operating condition, not the measurement error.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('下列哪种情况下，Eon 的测量值会偏低？', 'Under which condition would the measured Eon read low?'),
    options: [
      { id: 'a', text: loc('电流探头比电压探头早到', 'The current probe is earlier than the voltage probe') },
      { id: 'b', text: loc('电流探头比电压探头晚到', 'The current probe is later than the voltage probe') },
      { id: 'c', text: loc('Rg 增大，开通变慢', 'Rg is larger, so turn-on is slower') },
      { id: 'd', text: loc('探头带宽提高到 1 GHz', 'The probe bandwidth is raised to 1 GHz') },
    ],
    answer: 'b',
    explain: loc(
      '电流晚到时，开通时的电流上升沿被推迟，Vds 仍为 Vdc 的那段时间里测到的电流更小，Eon 偏低；在 5 ns 偏斜的模型中可以直接看到（约 −13%）。早到则偏高。',
      'When the current arrives late, the current rise at turn-on is delayed, so less current is seen while Vds is still Vdc and Eon reads low; in the model with 5 ns of skew this is about −13%. Early arrival reads high.',
    ),
  },
]
