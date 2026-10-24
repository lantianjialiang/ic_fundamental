import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { easJ } from './core/power'
import { fill } from './pwrDptData'
import { SOA_IDMAX, soaBounds, soaLimit, thermalLimitId, type UisResult, type UisState } from './pwrUisModel'

export type PulseKey = 'p10us' | 'p100us' | 'p1ms' | 'p10ms'

/** 脉宽选择：显示顺序即数组顺序，默认取 [0] */
export const PULSE_SEG: Array<{ id: PulseKey; label: LText; sec: number }> = [
  { id: 'p10us', label: loc('10 µs', '10 µs'), sec: 10e-6 },
  { id: 'p100us', label: loc('100 µs', '100 µs'), sec: 100e-6 },
  { id: 'p1ms', label: loc('1 ms', '1 ms'), sec: 1e-3 },
  { id: 'p10ms', label: loc('10 ms', '10 ms'), sec: 10e-3 },
]

export const S = {
  kickerNow: loc('这一次雪崩与热', 'This avalanche and heat'),
  introTitle: loc('雪崩、SOA 与热阻：器件能承受多少能量与功率', 'Avalanche, SOA and thermal resistance: how much energy and power the device can take'),
  uisTitle: loc('UIS：电感能量在器件里耗散', 'UIS: the inductor energy is dissipated in the device'),
  uisNote: loc(
    '测试条件为教学示例，示例，以现行标准为准。电感电流从 Ipk 线性降到 0，Vds 钳位在 BV；能量 E_AS = ½·L·Ipk²·BV/(BV−Vdd)，雪崩时间 t_av = L·Ipk/(BV−Vdd)。',
    'Test conditions are teaching examples; example, follow the current standard. The inductor current falls linearly from Ipk to 0 while Vds is clamped at BV; the energy is E_AS = ½·L·Ipk²·BV/(BV−Vdd) and the avalanche time is t_av = L·Ipk/(BV−Vdd).',
  ),
  kL: loc('负载电感 L', 'Load inductor L'),
  kIpk: loc('雪崩前电流 Ipk', 'Current before avalanche Ipk'),
  kVdd: loc('母线电压 Vdd', 'Supply voltage Vdd'),
  kBv: loc('击穿电压 BVdss', 'Breakdown voltage BVdss'),
  kRated: loc('器件额定 E_AS', 'Device rated E_AS'),
  uisCircuitAria: loc('UIS 电路示意图：电感接在母线与下管漏极之间，下管源极接地', 'UIS circuit schematic: the inductor sits between the bus and the drain of the low-side device, whose source is grounded'),
  uisCircuitCap: loc(
    '示意：电感 L 从母线充电到 Ipk，然后器件关断；电感电流无处可去，Vds 升到 BVdss 并被雪崩钳住，能量在器件内耗散。',
    'Schematic: the inductor L charges from the bus to Ipk, then the device turns off; the inductor current has nowhere to go, so Vds rises to BVdss and is held by avalanche, and the energy is dissipated inside the device.',
  ),
  trId: loc('Id（÷ Ipk）', 'Id (÷ Ipk)'),
  trVds: loc('Vds（÷ BV）', 'Vds (÷ BV)'),
  uisShade: loc('雪崩期间：Vds 钳位在 BV', 'Avalanche: Vds clamped at BV'),
  uisScopeAria: loc('UIS 波形：电流线性下降，Vds 在雪崩期间钳位在 BV', 'UIS waveform: the current falls linearly while Vds is clamped at BV during avalanche'),
  uisScopeSummary: loc(
    '雪崩时间 {0} µs，Id 从 {1} A 线性降到 0，Vds 钳位在 {2} V；E_AS = {3} J，额定 {4} J。',
    'Avalanche time {0} µs; Id falls linearly from {1} A to 0 while Vds is clamped at {2} V; E_AS = {3} J, rated {4} J.',
  ),
  invalid: loc('Vdd 必须低于 BV，否则雪崩能量没有意义。', 'Vdd must be below BV, otherwise the avalanche energy is undefined.'),
  rEas: loc('E_AS（雪崩能量）', 'E_AS (avalanche energy)'),
  rTav: loc('t_av（雪崩时间）', 't_av (avalanche time)'),
  rIpkMax: loc('额定 E_AS 下的最大 Ipk', 'Max Ipk at the rated E_AS'),
  rUisVerdict: loc('判定（对额定 E_AS）', 'Verdict (vs rated E_AS)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  soaTitle: loc('SOA：四条边界与工作点', 'SOA: four boundaries and the operating point'),
  soaNote: loc(
    '教学示意：纵轴为允许的 Id，横轴为 Vds，两轴都是对数坐标。Rds(on) 限制随壳温变化；热限制随脉宽变化，短脉冲区（短于 1 ms）用 1/√t 近似。',
    'Teaching illustration: the vertical axis is the allowed Id and the horizontal axis is Vds, both logarithmic. The Rds(on) limit depends on case temperature; the thermal limit depends on pulse width, and the short-pulse region (below 1 ms) uses a 1/√t approximation.',
  ),
  kPulse: loc('脉宽', 'Pulse width'),
  kVds: loc('工作 Vds', 'Operating Vds'),
  kIop: loc('工作电流 Id', 'Operating current Id'),
  kTcase: loc('壳温 Tcase', 'Case temperature Tcase'),
  soaAria: loc(
    'SOA 对数坐标图：Rds(on)、最大电流、热限制、击穿电压四条边界，以及工作点',
    'Log-log SOA plot: the Rds(on), maximum current, thermal and breakdown boundaries, plus the operating point',
  ),
  axisX: loc('Vds (V)', 'Vds (V)'),
  axisY: loc('Id (A)', 'Id (A)'),
  bRds: loc('Rds(on) 限制', 'Rds(on) limit'),
  bMax: loc('最大电流', 'Maximum current'),
  bThermal: loc('热限制（所选脉宽）', 'Thermal limit (chosen pulse)'),
  bBv: loc('击穿电压 BV', 'Breakdown voltage BV'),
  bOp: loc('工作点', 'Operating point'),
  opOk: loc('在线下方，通过', 'below the lines, pass'),
  opBad: loc('在线上方，超出', 'above the lines, fail'),
  soaSummary: loc(
    '工作点 Vds = {0} V、Id = {1} A，脉宽 {2}：允许 Id = {3} A，受{4}限制。判定：{5}。',
    'Operating point Vds = {0} V, Id = {1} A, pulse {2}: allowed Id = {3} A, limited by {4}. Verdict: {5}.',
  ),
  soaAllowed: loc('允许 Id（取最小）', 'Allowed Id (minimum)'),
  soaBinding: loc('起限制作用的边界', 'Limiting boundary'),
  soaVerdict: loc('工作点判定', 'Operating-point verdict'),
  soaFailBv: loc('已超过击穿电压', 'above breakdown voltage'),
  rThermalLine: loc('热限制线（所选脉宽）', 'Thermal line (chosen pulse)'),
  thermalTitle: loc('热阻：Zth 与脉冲温升', 'Thermal resistance: Zth and the pulse temperature rise'),
  thermalNote: loc(
    '教学示意：Foster 网络 Zth(t) = Rth·(1 − e^(−t/τ))，ΔT = P·Zth(t)。Rth = 0.5 K/W、τ = 5 ms 为示例值，以现行标准为准。',
    'Teaching illustration: Foster network Zth(t) = Rth·(1 − e^(−t/τ)), ΔT = P·Zth(t). Rth = 0.5 K/W and τ = 5 ms are example values; follow the current standard.',
  ),
  kP: loc('脉冲功率 P', 'Pulse power P'),
  kT: loc('脉宽 t', 'Pulse width t'),
  rZth: loc('Zth(t)（K/W）', 'Zth(t) (K/W)'),
  rDT: loc('脉冲温升 ΔT = P·Zth(t)', 'Pulse temperature rise ΔT = P·Zth(t)'),
  rSteady: loc('稳态温升 P·Rth', 'Steady-state rise P·Rth'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    'TSEP（用体二极管压降估计结温）只讲概念：V_F 随温度变化的斜率因器件而异，需要先校准。',
    'TSEP (estimating junction temperature from the body-diode drop) is covered as a concept only: the slope of V_F against temperature depends on the device and must be calibrated first.',
  ),
  next: loc('下一课：宽禁带器件（SiC 与 GaN）', 'Next: Wide-bandgap devices (SiC and GaN)'),
  task1: loc('设 L = 1 mH、Ipk = 10 A、Vdd = 50 V、BV = 100 V，读出 E_AS（0.1 J）与 t_av（200 µs）。', 'Set L = 1 mH, Ipk = 10 A, Vdd = 50 V, BV = 100 V; read E_AS (0.1 J) and t_av (200 µs).'),
  task2: loc('把额定 E_AS 调到 0.5 J，读出此时的最大 Ipk（约 22.4 A）。', 'Set the rated E_AS to 0.5 J and read the maximum Ipk at that rating (about 22.4 A).'),
  task3: loc('选 1 ms 或更长的脉宽，读出热限制线的允许电流（低于 150 A 的最大电流限）。', 'Pick a pulse of 1 ms or longer and read the allowed current on the thermal line (below the 150 A maximum-current limit).'),
  task4: loc('设 P = 100 W、t = 1 ms，读出脉冲温升（约 9.06 K）。', 'Set P = 100 W and t = 1 ms; read the pulse temperature rise (about 9.06 K).'),
  vInvalidT: loc('参数无效', 'Invalid settings'),
  vUisFailT: loc('能量超过额定值', 'Energy above the rating'),
  vUisFailX: loc(
    'E_AS = {0} J 超过额定 {1} J。E_AS = ½·L·Ipk²·BV/(BV−Vdd)，能量随 Ipk² 增长，降低 Ipk 或 L 最直接；提高 BV 能把比值 BV/(BV−Vdd) 压低，也会让能量下降。',
    'E_AS = {0} J is above the rated {1} J. E_AS = ½·L·Ipk²·BV/(BV−Vdd) grows with Ipk², so lowering Ipk or L is most direct; a higher BV pulls the ratio BV/(BV−Vdd) down and also lowers the energy.',
  ),
  vSoaFailT: loc('工作点超出 SOA', 'Operating point outside the SOA'),
  vSoaFailX: loc(
    '工作点 Id = {0} A 高于允许的 {1} A，受{2}限制。脉宽越长，热限制线越低：同样的 Vds 下，长脉冲允许的电流更小。',
    'The operating current Id = {0} A is above the allowed {1} A, limited by {2}. The longer the pulse, the lower the thermal line: at the same Vds a long pulse allows less current.',
  ),
  vOkT: loc('参数合理', 'Settings look reasonable'),
  vOkX: loc(
    'E_AS = {0} J 不超过额定 {1} J，雪崩能量在器件承受范围之内。',
    'E_AS = {0} J does not exceed the rated {1} J, so the avalanche energy is within the device capability.',
  ),
  vInvalidX: loc('Vdd 不低于 BV 时，雪崩能量与时间都没有定义，请先把 Vdd 调到低于 BV。', 'When Vdd is not below BV, the avalanche energy and time are undefined; first set Vdd below BV.'),
}

export const INTRO = [
  loc(
    '非钳位感性开关（UIS）测的是器件关断一个电感电流时的能力：电感在关断后被迫把能量放进器件，器件以雪崩方式把 Vds 钳在 BVdss。能量与器件的热限制是两件事：一个管管雪崩能量，一个管持续功率。关于 SOA 的基础见 {@pwrStatic}。',
    'Unclamped inductive switching (UIS) tests a device that must switch off an inductor current: after turn-off the inductor forces its energy into the device, which holds Vds at BVdss by avalanche. Avalanche energy and thermal limits are two different things: one governs a single event, the other sustained power. For SOA basics, see {@pwrStatic}.',
  ),
  loc(
    '动态开关能量见 {@pwrDpt}；做 UIS 或 SOA 时，电流与电压都很大，夹具与接线的要求见 {@pwrKelvin}。',
    'Dynamic switching energy is in {@pwrDpt}; UIS and SOA tests carry high current and voltage, so fixture and hookup requirements are in {@pwrKelvin}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'UIS 能量只由 L 与 Ipk 决定。E_AS = ½·L·Ipk²·BV/(BV−Vdd)，还与 BV 和 Vdd 有关；BV 越接近 Vdd，比值 BV/(BV−Vdd) 越大。',
    'UIS energy depends only on L and Ipk. E_AS = ½·L·Ipk²·BV/(BV−Vdd) also depends on BV and Vdd; the closer BV is to Vdd, the larger the ratio BV/(BV−Vdd).',
  ),
  loc(
    'SOA 只看电流和电压。脉宽和壳温也决定热限制线：同一个 Vds、Id，在 10 µs 可以通过，在 10 ms 可能超出。',
    'SOA depends only on current and voltage. Pulse width and case temperature also set the thermal line: the same Vds and Id may pass at 10 µs and fail at 10 ms.',
  ),
  loc(
    'Rth 是常数。Rth 是稳态值；短脉冲的 Zth(t) 远小于 Rth，用 Rth 估算短脉冲温升会偏大（过于保守），要用 Zth(t) 对应这个脉宽。',
    'Rth is a constant. Rth is the steady-state value; for a short pulse Zth(t) is much smaller than Rth, so using Rth overestimates the rise (too conservative). Use Zth(t) for the pulse width.',
  ),
]

export const TAKEAWAY: LText = loc(
  'E_AS = ½·L·Ipk²·BV/(BV−Vdd)，t_av = L·Ipk/(BV−Vdd)；SOA 有四条边界，热限制随脉宽变化，短脉冲区用 1/√t 作教学近似；ΔT = P·Zth(t)，短脉冲用 Zth(t) 而不是 Rth；TSEP 用体二极管压降估计结温，要先校准。',
  'E_AS = ½·L·Ipk²·BV/(BV−Vdd), t_av = L·Ipk/(BV−Vdd); the SOA has four boundaries, the thermal one depends on pulse width and the short-pulse region uses a 1/√t teaching approximation; ΔT = P·Zth(t), so use Zth(t) rather than Rth for short pulses; TSEP estimates junction temperature from the body-diode drop and must be calibrated first.',
)

/** 任务卡：由当前参数与仿真结果算出，重置后自动还原 */
export function taskItems(state: UisState, r: UisResult, pulseSec: number, tPower: number, tMs: number): TaskItem[] {
  return [
    {
      id: 'uis-t1',
      text: S.task1,
      done: r.valid && Math.abs(r.eas - 0.1) < 1e-4 && Math.abs(r.tav - 200e-6) < 1e-6,
    },
    {
      id: 'uis-t2',
      text: S.task2,
      done: Math.abs(state.ratedE - 0.5) < 0.01 && Math.abs(r.ipkMax - 22.36) < 0.05,
    },
    {
      id: 'uis-t3',
      text: S.task3,
      done: pulseSec >= 1e-3 && thermalLimitId(pulseSec, 50, 25) < SOA_IDMAX,
    },
    {
      id: 'uis-t4',
      text: S.task4,
      done: Math.abs(tPower - 100) < 0.5 && Math.abs(tMs - 1) < 0.05,
    },
  ]
}

/** 右侧说明栏：先看参数是否有效，再看能量，再看 SOA；每个结论都写出原因 */
export function uisVerdictOf(state: UisState, r: UisResult): { title: LText; text: LText } {
  if (!r.valid) {
    return { title: S.vInvalidT, text: S.vInvalidX }
  }
  if (!r.pass) {
    return {
      title: S.vUisFailT,
      text: fill(S.vUisFailX, r.eas.toFixed(3), state.ratedE.toFixed(2)),
    }
  }
  return {
    title: S.vOkT,
    text: fill(S.vOkX, r.eas.toFixed(3), state.ratedE.toFixed(2)),
  }
}

/** SOA 工作点：允许电流、起限制作用的边界、是否通过 */
export function soaVerdictOf(
  vds: number,
  id: number,
  tPulse: number,
  tcase: number,
): { allowed: number; binding: LText; ok: boolean; overBv: boolean } {
  const b = soaBounds({ tPulse, vds, tcase })
  const allowed = soaLimit({ tPulse, vds, tcase })
  const pairs: Array<[number, LText]> = [
    [b.rds, S.bRds],
    [b.max, S.bMax],
    [b.thermal, S.bThermal],
  ]
  pairs.sort((x, y) => x[0] - y[0])
  const overBv = vds > b.bv
  return { allowed, binding: overBv ? S.bBv : pairs[0][1], ok: !overBv && id <= allowed, overBv }
}

/* ---------- 复习题 ---------- */
const Q2_EAS = easJ(2e-3, 5, 50, 100)
const Q6_TAV_US = ((0.5e-3 * 20) / (120 - 40)) * 1e6
const Q8_THERMAL_A = thermalLimitId(10e-3, 50, 25)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('UIS 测试中，电感关断后，Vds 被钳位在哪里？', 'In a UIS test, after the inductor is switched off, where is Vds clamped?'),
    options: [
      { id: 'a', text: loc('母线电压 Vdd', 'The supply voltage Vdd') },
      { id: 'b', text: loc('击穿电压 BVdss', 'The breakdown voltage BVdss') },
      { id: 'c', text: loc('0 V', '0 V') },
    ],
    answer: 'b',
    explain: loc(
      '电感电流不能突变，器件被迫进入雪崩，Vds 升到 BVdss 后被雪崩电流钳住。钳位点是 BV，不是 Vdd；Vdd 只决定能量公式里的 BV/(BV−Vdd)。',
      'Inductor current cannot change instantly, so the device is forced into avalanche; once Vds reaches BVdss the avalanche current holds it there. The clamp is at BV, not Vdd; Vdd only enters the energy formula through BV/(BV−Vdd).',
    ),
  },
  {
    id: 'q2',
    prompt: loc('L = 2 mH、Ipk = 5 A、Vdd = 50 V、BV = 100 V，E_AS 约为多少？', 'L = 2 mH, Ipk = 5 A, Vdd = 50 V, BV = 100 V: about how large is E_AS?'),
    options: [
      { id: 'a', text: loc('0.025 J', '0.025 J') },
      { id: 'b', text: loc('0.1 J', '0.1 J') },
      { id: 'c', text: loc(`${Q2_EAS.toFixed(3)} J`, `${Q2_EAS.toFixed(3)} J`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'E_AS = ½·L·Ipk²·BV/(BV−Vdd) = ½ × 2 mH × 5² × 100 / 50 = {0} J。注意 ½·L·Ipk² 只有 0.025 J，再乘 BV/(BV−Vdd) = 2 才是 0.05 J。',
        'E_AS = ½·L·Ipk²·BV/(BV−Vdd) = ½ × 2 mH × 5² × 100 / 50 = {0} J. Note ½·L·Ipk² alone is 0.025 J; the factor BV/(BV−Vdd) = 2 doubles it to 0.05 J.',
      ),
      Q2_EAS.toFixed(3),
    ),
  },
  {
    id: 'q3',
    prompt: loc('UIS 的雪崩能量只由 L 与 Ipk 决定，对吗？', 'Is UIS avalanche energy determined only by L and Ipk?'),
    options: [
      { id: 'a', text: loc('不对，还与 BV 和 Vdd 有关', 'No, it also depends on BV and Vdd') },
      { id: 'b', text: loc('对，E = ½·L·Ipk² 与器件无关', 'Yes, E = ½·L·Ipk² is independent of the device') },
      { id: 'c', text: loc('对，只要 L 不变能量就不变', 'Yes, as long as L is unchanged the energy is unchanged') },
    ],
    answer: 'a',
    explain: loc(
      'E_AS = ½·L·Ipk²·BV/(BV−Vdd)。½·L·Ipk² 是电感储能，BV/(BV−Vdd) 是器件把它耗散时的放大因子。BV 与 Vdd 变化，能量就变。',
      'E_AS = ½·L·Ipk²·BV/(BV−Vdd). The term ½·L·Ipk² is the stored inductor energy; BV/(BV−Vdd) is the factor set by how the device dissipates it. Changing BV or Vdd changes the energy.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '下列哪些说法正确？A. SOA 只看电流和电压；B. SOA 的热限制线随脉宽变化；C. 短脉冲热限用 1/√t 是教学近似；D. Rth 是与脉宽无关的常数。',
      'Which statements are correct? A. SOA depends only on current and voltage; B. the SOA thermal line changes with pulse width; C. the 1/√t short-pulse thermal limit is a teaching approximation; D. Rth is a constant independent of pulse width.',
    ),
    options: [
      { id: 'a', text: loc('A 和 D', 'A and D') },
      { id: 'b', text: loc('B 和 C', 'B and C') },
      { id: 'c', text: loc('A、B、D', 'A, B and D') },
      { id: 'd', text: loc('C 和 D', 'C and D') },
    ],
    answer: 'b',
    explain: loc(
      'B 和 C 正确。A 错：脉宽与壳温也决定热限。D 错：Rth 是稳态值，短脉冲的 Zth(t) 远小于 Rth。',
      'B and C are correct. A is wrong: pulse width and case temperature also set the thermal limit. D is wrong: Rth is the steady-state value, and a short-pulse Zth(t) is much smaller than Rth.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('瞬态热阻抗 Zth(t) 随脉宽 t 增大，会怎样变化？', 'As pulse width t grows, how does the transient thermal impedance Zth(t) change?'),
    options: [
      { id: 'a', text: loc('增大并趋于稳态的 Rth', 'Rises and approaches the steady-state Rth') },
      { id: 'b', text: loc('始终等于 Rth', 'Always equals Rth') },
      { id: 'c', text: loc('趋于 0', 'Tends to zero') },
    ],
    answer: 'a',
    explain: loc(
      'Zth(t) = Σ Rth_i·(1 − e^(−t/τ_i))。t 很短时指数项接近 1，Zth 很小；t 远大于 τ 时 Zth 趋近 ΣRth_i，即稳态的 Rth。',
      'Zth(t) = Σ Rth_i·(1 − e^(−t/τ_i)). For short t the exponentials are near 1, so Zth is small; for t much larger than τ, Zth approaches ΣRth_i, the steady-state Rth.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('L = 0.5 mH、Ipk = 20 A、Vdd = 40 V、BV = 120 V，雪崩时间 t_av 约为多少？', 'L = 0.5 mH, Ipk = 20 A, Vdd = 40 V, BV = 120 V: about how long is the avalanche time t_av?'),
    options: [
      { id: 'a', text: loc('50 µs', '50 µs') },
      { id: 'b', text: loc('250 µs', '250 µs') },
      { id: 'c', text: loc(`${Q6_TAV_US.toFixed(0)} µs`, `${Q6_TAV_US.toFixed(0)} µs`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        't_av = L·Ipk/(BV−Vdd) = 0.5 mH × 20 A / (120 − 40) V = {0} µs。',
        't_av = L·Ipk/(BV−Vdd) = 0.5 mH × 20 A / (120 − 40) V = {0} µs.',
      ),
      Q6_TAV_US.toFixed(0),
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '关于 Zth，下列哪些说法正确？A. Zth(t) 随 t 增大而增大；B. 稳态时 Zth 等于 Rth；C. 脉宽 1 ms 的温升等于 P·Rth；D. 脉冲温升 ΔT = P·Zth(t)。',
      'Which statements about Zth are correct? A. Zth(t) grows with t; B. in steady state Zth equals Rth; C. the rise for a 1 ms pulse equals P·Rth; D. the pulse rise is ΔT = P·Zth(t).',
    ),
    options: [
      { id: 'a', text: loc('A、B、D', 'A, B and D') },
      { id: 'b', text: loc('B 和 C', 'B and C') },
      { id: 'c', text: loc('A、C、D', 'A, C and D') },
      { id: 'd', text: loc('A 和 B', 'A and B') },
    ],
    answer: 'a',
    explain: loc(
      'A、B、D 正确。C 错：1 ms 的温升用 Zth(1 ms) 算，比 P·Rth 小（P = 100 W 时，9.06 K 对 50 K）。',
      'A, B and D are correct. C is wrong: the 1 ms rise uses Zth(1 ms), which is smaller than P·Rth (for P = 100 W, 9.06 K versus 50 K).',
    ),
  },
  {
    id: 'q8',
    prompt: loc('工作点 Vds = 50 V、Id = 10 A。脉宽从 10 µs 加到 10 ms，结果会怎样？', 'Operating point Vds = 50 V, Id = 10 A. As the pulse width goes from 10 µs to 10 ms, what happens?'),
    options: [
      { id: 'a', text: loc('始终通过，脉宽不影响', 'Always passes; pulse width has no effect') },
      { id: 'b', text: fill(loc('脉宽变长，热限制变低，10 ms 时允许 Id 约 {0} A，10 A 超出', 'Longer pulse, lower thermal line: at 10 ms the allowed Id is about {0} A, so 10 A is outside'), Q8_THERMAL_A.toFixed(1)) },
      { id: 'c', text: loc('脉宽变长，热限制变高', 'Longer pulse, higher thermal line') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '10 µs 时热限远高于 150 A 的最大电流限，起限制的是最大电流；10 ms 时 Zth ≈ 0.43 K/W，热限 ≈ {0} A，工作点的 10 A 超出。',
        'At 10 µs the thermal line is far above the 150 A maximum-current limit, so the maximum current binds; at 10 ms Zth ≈ 0.43 K/W, the thermal limit is about {0} A, and the 10 A operating point is outside.',
      ),
      Q8_THERMAL_A.toFixed(1),
    ),
  },
]