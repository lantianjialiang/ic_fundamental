import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { arrheniusAF, coffinMansonAF } from './core/reliability'
import { HOURS_PER_YEAR, MECH_FACTORS, MECH_IDS, type AccelAnalysis, type AccelState, type MechId } from './relAccelModel'

/** 把占位符 {key} 换成数字文字，中英文都替换（数字本身不翻译） */
export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

/**
 * 机理表（教学数据，相当于 mechanisms.json）：机理 → 诱因 → 表现 → 典型试验 → 所用模型。
 * 试验名称只是示例，每次显示都要带“示例，以现行标准为准”。
 */
export type Mechanism = {
  id: MechId
  short: LText
  name: LText
  cause: LText
  symptom: LText
  test: LText
  model: LText
}

export const MECHANISMS: Mechanism[] = [
  {
    id: 'em',
    short: loc('电迁移 EM', 'EM'),
    name: loc('电迁移（EM）', 'Electromigration (EM)'),
    cause: loc('金属导线电流密度高，金属原子顺着电子流方向迁移', 'High current density in metal lines moves metal atoms along the electron flow'),
    symptom: loc('导线变细、电阻增大，最终开路；电流密度高的地方先坏', 'Lines thin and resistance rises until they open; spots with high current density fail first'),
    test: loc('高温工作寿命（HTOL）等', 'High-temperature operating life (HTOL), etc.'),
    model: loc('Black 方程：MTTF ∝ J⁻ⁿ·exp(Ea/kT)', 'Black equation: MTTF ∝ J⁻ⁿ·exp(Ea/kT)'),
  },
  {
    id: 'tddb',
    short: loc('TDDB', 'TDDB'),
    name: loc('经时介质击穿（TDDB）', 'Time-dependent dielectric breakdown (TDDB)'),
    cause: loc('栅氧化层长期承受电场，缺陷逐渐连成导电通路', 'A gate oxide under long-term electric field grows defects that link into a conduction path'),
    symptom: loc('栅漏电逐渐增大，最后击穿短路', 'Gate leakage creeps up, then the oxide breaks down into a short'),
    test: loc('HTOL 带偏置、电压加速试验等', 'HTOL with bias, voltage-accelerated tests, etc.'),
    model: loc('Arrhenius 温度项 × 电压项 exp[γ(Vs − Vu)]', 'Arrhenius temperature term × voltage term exp[γ(Vs − Vu)]'),
  },
  {
    id: 'hci',
    short: loc('HCI', 'HCI'),
    name: loc('热载流子注入（HCI）', 'Hot-carrier injection (HCI)'),
    cause: loc('沟道中的高能载流子打入栅氧，在界面产生缺陷', 'High-energy carriers in the channel are injected into the gate oxide and create interface traps'),
    symptom: loc('阈值电压与驱动电流随时间漂移', 'Threshold voltage and drive current drift with time'),
    test: loc('HTOL 带偏置等', 'HTOL with bias, etc.'),
    model: loc('Arrhenius 温度项 × 电压项', 'Arrhenius temperature term × voltage term'),
  },
  {
    id: 'nbti',
    short: loc('NBTI / PBTI', 'NBTI / PBTI'),
    name: loc('负偏压温度不稳定性（NBTI / PBTI）', 'Negative / positive bias temperature instability (NBTI / PBTI)'),
    cause: loc('高温与栅偏压同时作用，界面态增加', 'High temperature with gate bias increases interface states'),
    symptom: loc('PMOS（或 NMOS）阈值电压上漂，速度变慢', 'The PMOS (or NMOS) threshold voltage drifts up and the device slows down'),
    test: loc('HTOL 带偏置等', 'HTOL with bias, etc.'),
    model: loc('Arrhenius 温度项 × 电压项', 'Arrhenius temperature term × voltage term'),
  },
  {
    id: 'tmf',
    short: loc('热机械疲劳', 'Thermo-mechanical fatigue'),
    name: loc('热机械疲劳（温度循环）', 'Thermo-mechanical fatigue (temperature cycling)'),
    cause: loc('各材料热膨胀系数不同，反复升降温使焊点、键合线受拉压', 'Materials with different expansion coefficients are stressed in tension and compression by repeated temperature cycles'),
    symptom: loc('焊点或键合线出现裂纹，电阻升高后开路', 'Solder joints or bond wires crack, then resistance rises and the path opens'),
    test: loc('温度循环（TC）等', 'Temperature cycling (TC), etc.'),
    model: loc('Coffin-Manson：AF = (ΔTs / ΔTu)ⁿ', 'Coffin-Manson: AF = (ΔTs / ΔTu)ⁿ'),
  },
  {
    id: 'corr',
    short: loc('腐蚀 / 湿气', 'Corrosion / moisture'),
    name: loc('腐蚀与湿气', 'Corrosion and moisture'),
    cause: loc('水汽与离子污染使金属在偏压下腐蚀', 'Moisture and ionic contamination corrode metal under bias'),
    symptom: loc('漏电增大、焊盘或金属线发绿、断开', 'Leakage rises and pads or lines corrode and open'),
    test: loc('高加速温湿度应力（HAST / uHAST）等', 'Highly accelerated temperature and humidity stress (HAST / uHAST), etc.'),
    model: loc('本页只建模温度项；湿度项不在本页范围', 'This page models only the temperature term; the humidity term is out of scope'),
  },
  {
    id: 'esd',
    short: loc('ESD / 闩锁', 'ESD / latch-up'),
    name: loc('ESD 与闩锁（Latch-up）', 'ESD and latch-up'),
    cause: loc('瞬态高压或大电流注入，超过器件承受的阈值', 'A transient high voltage or large current injection exceeds the device threshold'),
    symptom: loc('一次性击穿；或寄生结构导通后持续大电流', 'One-shot breakdown; or a parasitic path turns on and draws a large sustained current'),
    test: loc('人体模型（HBM）、器件充电模型（CDM）、闩锁试验', 'Human-body model (HBM), charged-device model (CDM), latch-up test'),
    model: loc('阈值试验，不用寿命加速因子', 'Threshold tests, not lifetime acceleration factors'),
  },
]

export const MECH_BY_ID: Record<MechId, Mechanism> = Object.fromEntries(MECHANISMS.map((m) => [m.id, m])) as Record<MechId, Mechanism>

export const MECH_SEG = MECH_IDS.map((id) => ({ id, label: MECH_BY_ID[id].short }))

export const S = {
  kickerNow: loc('这一次加速', 'This acceleration'),
  introTitle: loc('失效机理：先知道在失效什么', 'Failure mechanisms: first, what is failing'),
  introNote: loc('先读 {@relBathtub}（REL-01）：它讲清了三段失效与 FIT、MTTF。本课回答的是：为什么可以用高温、高压、大电流去“加速”。', 'Read {@relBathtub} (REL-01) first: it defines the three failure segments, FIT and MTTF. This lesson answers why high temperature, high voltage and high current can be used to accelerate tests.'),
  tableTitle: loc('机理—诱因—表现—典型试验对照表', 'Mechanism, cause, symptom and typical test table'),
  tableNote: loc('试验名称仅为示例，以现行标准为准；不要把它当作标准条件使用。', 'Test names are examples only; follow the current standard. Do not treat them as standard conditions.'),
  colMech: loc('机理', 'Mechanism'),
  colCause: loc('诱因', 'Cause'),
  colSymptom: loc('表现', 'Symptom'),
  colTest: loc('典型试验（示例，以现行标准为准）', 'Typical test (example; follow the current standard)'),
  colModel: loc('所用模型', 'Model used'),
  coreTitle: loc('拨一拨：选机理，看各分项 AF 怎样相乘', 'Try it: pick a mechanism and see how the AF factors multiply'),
  coreNote: loc(
    '先选机理：它决定哪些应力分项计入总 AF。未计入的分项仍显示数值，但标注“本机理不计入”。时间单位为小时，换算年数按每年 8760 h。',
    'The mechanism sets which stress factors count toward the total AF. Factors not counted still show their value, marked as not counted for this mechanism. Time is in hours; years use 8760 h per year.',
  ),
  mechLabel: loc('失效机理', 'Failure mechanism'),
  tUseLabel: loc('使用温度 Tuse', 'Use temperature Tuse'),
  tStressLabel: loc('试验温度 Tstress', 'Stress temperature Tstress'),
  eaLabel: loc('激活能 Ea', 'Activation energy Ea'),
  hoursLabel: loc('试验小时 h', 'Test hours h'),
  gammaLabel: loc('电压系数 γ', 'Voltage coefficient γ'),
  vUseLabel: loc('使用电压 Vuse', 'Use voltage Vuse'),
  vStressLabel: loc('试验电压 Vstress', 'Stress voltage Vstress'),
  dtUseLabel: loc('使用循环幅度 ΔTuse', 'Use cycle swing ΔTuse'),
  dtStressLabel: loc('试验循环幅度 ΔTstress', 'Stress cycle swing ΔTstress'),
  nLabel: loc('指数 n（温度循环与电流共用）', 'Exponent n (shared by cycling and current)'),
  jLabel: loc('电流密度比 J = J_stress / J_use', 'Current-density ratio J = J_stress / J_use'),
  inTotal: loc('计入', 'counted'),
  notCounted: loc('本机理不计入', 'not counted for this mechanism'),
  rAfT: loc('AF_T：温度（Arrhenius）', 'AF_T: temperature (Arrhenius)'),
  rAfV: loc('AF_V：电压', 'AF_V: voltage'),
  rAfCm: loc('AF_CM：温度循环（Coffin-Manson）', 'AF_CM: cycling (Coffin-Manson)'),
  rAfJ: loc('AF_J：电流密度（Black）', 'AF_J: current density (Black)'),
  rTotal: loc('总 AF（计入分项相乘）', 'Total AF (product of counted factors)'),
  rUseH: loc('等效使用小时 = 试验小时 × AF', 'Equivalent use hours = test hours × AF'),
  rUseY: loc('换算年数 = 小时 / 8760', 'Years = hours / 8760'),
  rEaRange: loc('Ea ± 0.1 eV 时 AF_T 的范围', 'AF_T range for Ea ± 0.1 eV'),
  rBlack: loc('Black 方程核对（MTTF 比）', 'Black check (MTTF ratio)'),
  unitYear: loc('年', 'years'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '试验时长与样本量在 REL-03 展开；这里只练加速因子的计算，以及 Ea 与机理的对应关系。',
    'Test duration and sample size are covered in REL-03; here we practise computing acceleration factors and matching Ea to mechanisms.',
  ),
  next: loc('下一课：可靠性试验方法与样本量', 'Next: Reliability test methods and sample size'),
  task1: loc('Ea = 0.7 eV，Tuse = 55 °C，Tstress 调到 125 °C，读出 AF_T（约 77.7）。', 'Ea = 0.7 eV, Tuse = 55 °C, Tstress = 125 °C; read AF_T (about 77.7).'),
  task2: loc('ΔTuse = 65 °C、ΔTstress = 165 °C、n = 2，读出温度循环 AF_CM（约 6.44）。', 'ΔTuse = 65 °C, ΔTstress = 165 °C, n = 2; read AF_CM for temperature cycling (about 6.44).'),
  task3: loc('Black：电流密度比 J 调到 2、n = 2，看 MTTF 比变为 1/4。', 'Black: set the current-density ratio J to 2 with n = 2 and see the MTTF ratio become 1/4.'),
  task4: loc('把 Ea 改为 0.5 eV（Tuse 55 °C、Tstress 125 °C），AF 变为约 22.4，并看 Ea ± 0.1 的范围。', 'Change Ea to 0.5 eV (Tuse 55 °C, Tstress 125 °C): AF falls to about 22.4; also look at the Ea ± 0.1 range.'),
  vTemp: loc('按温度加速（Arrhenius）', 'Accelerated by temperature (Arrhenius)'),
  vTempText: loc(
    '本机理计入温度项：AF_T = {afT}。原因：温度升高，热激活的反应速率按 exp(−Ea/kT) 增大。Ea = {ea} eV，但 Ea 不确定：Ea ± 0.1 时 AF_T 落在 {lo}–{hi} 之间，结论要带上这个范围。',
    'This mechanism counts the temperature term: AF_T = {afT}. Reason: at higher temperature the thermally activated rate grows as exp(−Ea/kT). Ea = {ea} eV, but Ea is uncertain: for Ea ± 0.1 eV, AF_T lies between {lo} and {hi}, so report that range with the conclusion.',
  ),
  vVolt: loc('温度与电压一起加速', 'Temperature and voltage both accelerate'),
  vVoltText: loc(
    '本机理计入温度项与电压项，总 AF = {total}。原因：电压项 exp[γ(Vs − Vu)] 与温度项相乘，两种应力各自加速，效果相乘。',
    'This mechanism counts the temperature and voltage terms; total AF = {total}. Reason: the voltage term exp[γ(Vs − Vu)] multiplies the temperature term, so the two stresses act together and their effects multiply.',
  ),
  vCycle: loc('按温度循环幅度加速', 'Accelerated by the cycle swing'),
  vCycleText: loc(
    '热机械疲劳只看循环幅度：AF_CM = (ΔTs / ΔTu)ⁿ = {afCm}。原因：每次循环的应变与 ΔT 有关，幅度越大疲劳越快；这与最高温度本身关系不大，所以温度项不计入。',
    'Thermo-mechanical fatigue depends on the cycle swing: AF_CM = (ΔTs / ΔTu)ⁿ = {afCm}. Reason: strain per cycle depends on ΔT, so a larger swing fatigues faster; the peak temperature matters much less, so the temperature term is not counted.',
  ),
  vCurrent: loc('按电流密度加速（Black）', 'Accelerated by current density (Black)'),
  vCurrentText: loc(
    '电迁移：AF_J = J^n = {afJ}，与温度项相乘得到总 AF = {total}。Black 方程 MTTF ∝ J⁻ⁿ·exp(Ea/kT) 给出同样的比值（核对值 {black}）。',
    'Electromigration: AF_J = J^n = {afJ}; multiplied by the temperature term the total AF = {total}. The Black equation MTTF ∝ J⁻ⁿ·exp(Ea/kT) gives the same ratio (check value {black}).',
  ),
  vNone: loc('不适用寿命加速模型', 'Lifetime acceleration models do not apply'),
  vNoneText: loc(
    'ESD 与闩锁是阈值问题：冲击超过器件承受的阈值就坏，不随时间按温度慢慢累积。所以总 AF 取 1，改用阈值试验（HBM、CDM、闩锁）判断。',
    'ESD and latch-up are threshold problems: the device fails once the shock exceeds its threshold, rather than building up slowly with time and temperature. So the total AF is set to 1, and threshold tests (HBM, CDM, latch-up) are used instead.',
  ),
}

export const FIG = {
  arrAria: loc(
    '阿伦尼乌斯加速因子随试验温度变化的曲线，对数纵轴，并给出 Ea 与 Ea ± 0.1 eV 的三条线',
    'Arrhenius acceleration factor against stress temperature on a log axis, with curves for Ea and Ea ± 0.1 eV',
  ),
  arrTitle: loc('AF_T 随试验温度变化（对数）', 'AF_T against stress temperature (log)'),
  arrCap: loc(
    '温度越高，AF_T 增长越快；Ea 越大，同样的温度差带来的加速越强。金线是当前 Ea，两条虚线是 Ea ± 0.1 eV，它们之间的距离就是 Ea 不确定性的影响。',
    'AF_T rises faster at higher temperature, and a larger Ea gives more acceleration for the same temperature step. The gold line is the current Ea; the two dashed lines are Ea ± 0.1 eV, and the gap between them is the effect of Ea uncertainty.',
  ),
  arrAxisT: loc('试验温度 Tstress（°C）', 'Stress temperature Tstress (°C)'),
  arrLegend: loc('金线：当前 Ea；虚线：Ea ± 0.1 eV', 'Gold: current Ea; dashed: Ea ± 0.1 eV'),
  facAria: loc('各分项 AF 的对数条形图，本机理未计入的分项标为未计入', 'Log bar chart of each AF factor, with factors not counted for this mechanism marked'),
  facTitle: loc('各分项 AF（对数条形，0 为中线）', 'AF factors (log bars, centre line = 1)'),
  facCap: loc(
    '条形向右表示加速（AF > 1），向左表示减速（AF < 1）。最右侧的数是该分项的值；未计入的分项不参与总 AF，总 AF 是计入分项的乘积。',
    'Bars to the right speed up the test (AF > 1); bars to the left slow it down (AF < 1). The value on the right is the factor’s value; factors not counted do not enter the total, which is the product of the counted factors.',
  ),
  facT: loc('AF_T 温度', 'AF_T temp.'),
  facV: loc('AF_V 电压', 'AF_V voltage'),
  facCm: loc('AF_CM 循环', 'AF_CM cycling'),
  facJ: loc('AF_J 电流', 'AF_J current'),
  facTotal: loc('总 AF', 'Total AF'),
  facNot: loc('未计入', 'not counted'),
}

export const INTRO = [
  loc(
    '失效并不是随便发生的：每种失效机理都有自己的诱因，也有自己对温度、电压、电流或温度循环的敏感程度。加速试验就是把某个应力调大，让机理在短时间内出现；前提是调大的应力确实作用于这个机理。',
    'Failures do not happen at random: each mechanism has its own cause and its own sensitivity to temperature, voltage, current or temperature cycling. An accelerated test raises one stress so the mechanism shows up in a short time, but only if that stress really acts on the mechanism.',
  ),
  loc(
    '最常用的温度加速是 Arrhenius 模型：AF_T = exp[(Ea/k)(1/Tu − 1/Ts)]，温度用开尔文计算，k = 8.617×10⁻⁵ eV/K。Ea 是激活能，由机理决定，本页的 0.7 eV 只是教学默认值。前置课见 {@relBathtub}（REL-01）。',
    'The most common temperature acceleration is the Arrhenius model: AF_T = exp[(Ea/k)(1/Tu − 1/Ts)], with temperature in kelvin and k = 8.617×10⁻⁵ eV/K. Ea is the activation energy, set by the mechanism; the 0.7 eV here is only a teaching default. Prerequisite: {@relBathtub} (REL-01).',
  ),
  loc(
    'ATE 关联：HTOL 与温度循环的应力怎么选，依据的就是本页的加速模型；而 ATE 的温控能力（室温、高温、低温分选）决定了能在量产中做哪些筛选，试验方法见 {@relStress}。',
    'ATE link: how stresses for HTOL and temperature cycling are chosen rests on the acceleration models here, while the ATE temperature capability (room, hot and cold sorting) determines which screens can run in production. Test methods are in {@relStress}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '所有失效都按 Arrhenius 加速。Arrhenius 只适用于热激活的机理；温度循环要用 Coffin-Manson，ESD 与闩锁是阈值问题，不能用寿命加速因子换算。',
    'All failures accelerate with Arrhenius. Arrhenius applies only to thermally activated mechanisms; temperature cycling needs Coffin-Manson, and ESD and latch-up are threshold problems that lifetime factors cannot convert.',
  ),
  loc(
    'Ea 是常数，换一个机理也一样。Ea 随机理而异，同一个器件的不同机理可以有完全不同的 Ea；Ea 的不确定性会让 AF 变化很大（见 AF_T 的范围读数）。',
    'Ea is a constant that is the same for every mechanism. Ea depends on the mechanism; different mechanisms in one device can have very different Ea, and Ea uncertainty can change AF a lot (see the AF_T range readout).',
  ),
  loc(
    '加速越狠越好。应力过高会引入使用条件下不存在的新机理，结果测出的是“假失效”；加速模型只在适用范围内成立。',
    'The harsher the acceleration the better. Excessive stress introduces new mechanisms that do not occur in use, so the test measures false failures; acceleration models hold only within their range of validity.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Arrhenius：AF_T = exp[(Ea/k)(1/Tu − 1/Ts)]，温度用 K；电压：AF_V = exp[γ(Vs − Vu)]；温度循环：AF_CM = (ΔTs/ΔTu)ⁿ；Black：MTTF ∝ J⁻ⁿ·exp(Ea/kT)。多应力时计入分项相乘；等效使用小时 = 试验小时 × AF。Ea 有不确定性，结论要带上范围。',
  'Arrhenius: AF_T = exp[(Ea/k)(1/Tu − 1/Ts)], temperature in K; voltage: AF_V = exp[γ(Vs − Vu)]; cycling: AF_CM = (ΔTs/ΔTu)ⁿ; Black: MTTF ∝ J⁻ⁿ·exp(Ea/kT). With several stresses multiply the counted factors; equivalent use hours = test hours × AF. Ea is uncertain, so report conclusions with a range.',
)

/** 小测题中的数字由同一套函数算出，与页面保持一致 */
const AF_70 = arrheniusAF(0.7, 55, 125)
const LIN_165 = 165 / 65
const AF_USE_Y = (1000 * AF_70) / HOURS_PER_YEAR

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Ea = 0.7 eV，使用 55 °C、试验 125 °C，Arrhenius 加速因子 AF_T 约是多少？', 'With Ea = 0.7 eV, use at 55 °C and stress at 125 °C, about what is the Arrhenius AF_T?'),
    options: [
      { id: 'a', text: fill(loc('约 {v}', 'About {v}'), { v: (AF_70 / 10).toFixed(1) }) },
      { id: 'b', text: fill(loc('约 {v}', 'About {v}'), { v: AF_70.toFixed(1) }) },
      { id: 'c', text: fill(loc('约 {v}', 'About {v}'), { v: (AF_70 * 10).toFixed(0) }) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'AF = exp[(0.7/8.617×10⁻⁵)(1/328.15 − 1/398.15)] ≈ {v}。温度要换成开尔文。把 AF 写成 1/10 或 10 倍都不对，指数里差的是倒数。',
        'AF = exp[(0.7/8.617×10⁻⁵)(1/328.15 − 1/398.15)] ≈ {v}. Temperatures must be in kelvin. Writing AF as one tenth or ten times the value is wrong; the exponent comes from the difference of reciprocals.',
      ),
      { v: AF_70.toFixed(1) },
    ),
  },
  {
    id: 'q2',
    prompt: loc('温度循环 ΔTuse = 65 °C、ΔTstress = 165 °C，n = 2，AF_CM = (ΔTs/ΔTu)ⁿ 约是多少？', 'Temperature cycling with ΔTuse = 65 °C, ΔTstress = 165 °C and n = 2: about what is AF_CM = (ΔTs/ΔTu)ⁿ?'),
    options: [
      { id: 'a', text: fill(loc('约 {v}（线性，n = 1）', 'About {v} (linear, n = 1)'), { v: LIN_165.toFixed(2) }) },
      { id: 'b', text: fill(loc('约 {v}（n = 3）', 'About {v} (n = 3)'), { v: (LIN_165 ** 3).toFixed(2) }) },
      { id: 'c', text: fill(loc('约 {v}（n = 2）', 'About {v} (n = 2)'), { v: coffinMansonAF(65, 165, 2).toFixed(2) }) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'AF_CM = (165/65)² = {v}。指数 n = 2 要用平方，不能只用比值。注意 ΔT 是温度循环幅度，不是最高温度。',
        'AF_CM = (165/65)² = {v}. The exponent n = 2 means squaring the ratio, not using the ratio alone. ΔT is the cycle swing, not the peak temperature.',
      ),
      { v: coffinMansonAF(65, 165, 2).toFixed(2) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('Black 方程中，电流密度加倍（J: 1 → 2），n = 2，MTTF 变为原来的多少？', 'In the Black equation, the current density doubles (J: 1 → 2) with n = 2. What fraction of the original MTTF is left?'),
    options: [
      { id: 'a', text: loc('1/2', '1/2') },
      { id: 'b', text: loc('1/8', '1/8') },
      { id: 'c', text: loc('1/4', '1/4') },
    ],
    answer: 'c',
    explain: loc(
      'MTTF ∝ J⁻ⁿ，J 从 1 变成 2，n = 2：2⁻² = 1/4。只看“加倍”会误以为是 1/2；指数 n 决定了电流密度对寿命的影响有多大。',
      'MTTF ∝ J⁻ⁿ; with J going from 1 to 2 and n = 2, 2⁻² = 1/4. Looking only at “doubling” gives 1/2 by mistake; the exponent n sets how strongly current density affects life.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '1000 h 试验（示例，以现行标准为准），AF = 77.7，等效使用时间约是多少年？（取每年 8760 h）',
      'A 1000 h test (example; follow the current standard), AF = 77.7: about how many years of use does it represent? (8760 h per year)',
    ),
    options: [
      { id: 'a', text: fill(loc('约 {v} 年', 'About {v} years'), { v: AF_USE_Y.toFixed(1) }) },
      { id: 'b', text: fill(loc('约 {v} 年', 'About {v} years'), { v: (AF_USE_Y / 10).toFixed(1) }) },
      { id: 'c', text: fill(loc('约 {v} 小时', 'About {v} hours'), { v: (1000 * 77.7).toFixed(0) }) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '等效使用小时 = 1000 × 77.7 = 77700 h，换算 77700 / 8760 ≈ {v} 年。把“小时”直接当“年”会差 8760 倍。',
        'Equivalent use hours = 1000 × 77.7 = 77700 h; 77700 / 8760 ≈ {v} years. Taking the hours directly as years would be off by a factor of 8760.',
      ),
      { v: AF_USE_Y.toFixed(1) },
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于各机理的加速模型，下列哪些说法正确？(1) TDDB 用 Arrhenius 温度项与电压项（γ）加速；(2) 热机械疲劳主要看温度循环幅度，用 Coffin-Manson；(3) 所有失效都按 Arrhenius 加速；(4) ESD 的 AF 用 Arrhenius 计算。',
      'Which statements about the acceleration models of the mechanisms are correct? (1) TDDB accelerates with the Arrhenius temperature term and the voltage term (γ); (2) thermo-mechanical fatigue depends mainly on the cycle swing and uses Coffin-Manson; (3) all failures accelerate with Arrhenius; (4) ESD’s AF is computed with Arrhenius.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'b',
    explain: loc(
      '(3) 错：Arrhenius 只适用于热激活机理。(4) 错：ESD 是阈值问题，不随时间按温度慢慢累积，不用寿命 AF。(1)(2) 与 MECH_FACTORS 中各机理计入的分项一致。',
      '(3) is wrong: Arrhenius applies only to thermally activated mechanisms. (4) is wrong: ESD is a threshold problem that does not build up slowly with time and temperature, so no lifetime AF is used. (1) and (2) match the factors each mechanism counts.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于激活能 Ea，下列哪些说法正确？(1) Ea 随机理而异，需要由数据确定；(2) Ea 是常数，换 Ea 不会影响结果；(3) Ea 从 0.7 eV 降到 0.5 eV（55 → 125 °C），AF 从约 77.7 降到约 22.4；(4) 加速越狠，Ea 的不确定性越没有影响。',
      'Which statements about activation energy Ea are correct? (1) Ea depends on the mechanism and must be determined from data; (2) Ea is a constant, so changing it does not affect results; (3) lowering Ea from 0.7 eV to 0.5 eV (55 → 125 °C) lowers AF from about 77.7 to about 22.4; (4) the harsher the acceleration, the less Ea uncertainty matters.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(4)', '(1), (4)') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '(2) 错：Ea 直接决定 AF，换 Ea 会明显改变结果。(4) 错：加速越大，指数里的 Ea 误差被放大，AF 的不确定性越大。(3) 的数值为 {hi} → {lo}（见 AF_T 读数）。',
        '(2) is wrong: Ea directly sets AF, so changing it changes the result a lot. (4) is wrong: a larger acceleration magnifies the Ea error in the exponent, so AF is more uncertain. In (3), AF is {hi} at Ea = 0.7 eV and {lo} at Ea = 0.5 eV (see the AF_T readout).',
      ),
      { hi: AF_70.toFixed(1), lo: arrheniusAF(0.5, 55, 125).toFixed(1) },
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '工程师想把 HTOL 的试验温度从 125 °C 提到 200 °C（温度只是示例，以现行标准为准），以缩短试验时间。下面哪句结论最合理？',
      'An engineer wants to raise the HTOL stress temperature from 125 °C to 200 °C (temperatures are examples; follow the current standard) to shorten the test. Which conclusion is most reasonable?',
    ),
    options: [
      { id: 'a', text: loc('可靠，温度越高 AF 越大，时间越短越好', 'Reliable: higher temperature gives a larger AF, so shorter is better') },
      { id: 'b', text: loc('不一定可靠：高温可能引入使用条件下不存在的机理，加速模型只在适用范围内成立', 'Not necessarily: high temperature may add mechanisms that do not occur in use, and the model holds only within its range') },
      { id: 'c', text: loc('可靠，只要 Ea 不变', 'Reliable, as long as Ea stays the same') },
    ],
    answer: 'b',
    explain: loc(
      '加速越狠，越可能让试验失效的原因与使用时不同，测到的是“假失效”。Ea 不变只保证公式形式不变，并不保证机理相同。',
      'The harsher the test, the more likely the failures differ from those in use, and the test measures false failures. Keeping Ea fixed only keeps the formula unchanged; it does not guarantee the same mechanism.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('ESD 与闩锁试验能否用 Arrhenius 加速因子换算成使用寿命？', 'Can ESD and latch-up test results be converted to service life with an Arrhenius acceleration factor?'),
    options: [
      { id: 'a', text: loc('不能：它们是阈值（冲击大小）问题，不随时间按温度加速', 'No: they are threshold problems (the size of the shock) and do not accelerate with time and temperature') },
      { id: 'b', text: loc('能，温度越高 AF 越大', 'Yes, higher temperature gives a larger AF') },
      { id: 'c', text: loc('能，只要 Ea 取 0.7 eV', 'Yes, as long as Ea is 0.7 eV') },
    ],
    answer: 'a',
    explain: loc(
      'ESD 与闩锁是“超过阈值就失效”，判断的是能否承受某个冲击，所以用阈值试验（HBM、CDM、闩锁试验）。把它们换算成寿命会得到没有意义的数字。',
      'ESD and latch-up fail once a threshold is exceeded, so they judge whether a device survives a given shock; threshold tests (HBM, CDM, latch-up) are used. Converting them to a lifetime gives a meaningless number.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置算出（浮点用容差），重置后自动还原 */
export function taskItems(state: AccelState): TaskItem[] {
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9
  return [
    {
      id: 'af-70',
      text: S.task1,
      done: near(state.ea, 0.7) && state.tUse === 55 && state.tStress === 125,
    },
    {
      id: 'cm-165',
      text: S.task2,
      done: state.dtUse === 65 && state.dtStress === 165 && near(state.n, 2),
    },
    {
      id: 'black-half',
      text: S.task3,
      done: near(state.j, 2) && near(state.n, 2),
    },
    {
      id: 'ea-05',
      text: S.task4,
      done: near(state.ea, 0.5) && state.tUse === 55 && state.tStress === 125,
    },
  ]
}

/** 右侧说明栏：按机理说明计入哪些分项，并给出数值与原因 */
export function verdictOf(state: AccelState, a: AccelAnalysis): { title: LText; text: LText } {
  const flags = MECH_FACTORS[state.mech]
  if (state.mech === 'esd') {
    return { title: S.vNone, text: S.vNoneText }
  }
  if (state.mech === 'tmf') {
    return {
      title: S.vCycle,
      text: fill(S.vCycleText, { afCm: a.afCm.toFixed(2) }),
    }
  }
  if (state.mech === 'em') {
    return {
      title: S.vCurrent,
      text: fill(S.vCurrentText, {
        afJ: a.afJ.toFixed(2),
        total: a.total.toFixed(2),
        black: a.blackRatio.toFixed(2),
      }),
    }
  }
  if (flags.volt) {
    return {
      title: S.vVolt,
      text: fill(S.vVoltText, { total: a.total.toFixed(2) }),
    }
  }
  return {
    title: S.vTemp,
    text: fill(S.vTempText, {
      afT: a.afT.toFixed(2),
      ea: state.ea.toFixed(2),
      lo: a.eaLow.toFixed(1),
      hi: a.eaHigh.toFixed(1),
    }),
  }
}
