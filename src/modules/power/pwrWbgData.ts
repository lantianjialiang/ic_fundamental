import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  APP_BV,
  APP_ORDER,
  GAN_R0_MOHM,
  GAN_TAU_US,
  MATERIAL_ORDER,
  WBG_TAB_ORDER,
  ganRds,
  relSpecificRon,
  type AppId,
  type Material,
  type WbgAnalysis,
  type WbgState,
  type WbgTab,
} from './pwrWbgModel'

/** 把 {key} 换成数值字符串：中英文两套都替换，数字由调用方算好 */
export function fillText(text: LText, vars: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(vars).reduce((acc, key) => acc.split(`{${key}}`).join(vars[key]), s)
  return loc(apply(text.zh), text.en === undefined ? undefined : apply(text.en))
}

const pct = (x: number) => (x * 100).toFixed(1)

export const TAB_TEXT: Record<WbgTab, LText> = {
  material: loc('① 材料对比', '① Material comparison'),
  vth: loc('② SiC Vth 滞回', '② SiC Vth hysteresis'),
  gan: loc('③ GaN 动态 Rds(on)', '③ GaN dynamic Rds(on)'),
}

export const APP_TEXT: Record<AppId, LText> = {
  dcdc: loc('12 V → 1 V DC-DC（100 V 级）', '12 V → 1 V DC-DC (100 V class)'),
  pfc: loc('400 V PFC 母线（650 V 级）', '400 V PFC bus (650 V class)'),
  inverter: loc('800 V 车用逆变器（1200 V 级）', '800 V EV inverter (1200 V class)'),
}

export const MATERIAL_TEXT: Record<Material, LText> = {
  si: loc('Si', 'Si'),
  sic: loc('SiC（4H）', 'SiC (4H)'),
  gan: loc('GaN HEMT', 'GaN HEMT'),
}

/** 选择组：顺序取自模型文件的数组，初始值由调用方取 [0] */
export const TAB_SEG = WBG_TAB_ORDER.map((id) => ({ id, label: TAB_TEXT[id] }))
export const APP_SEG = APP_ORDER.map((id) => ({ id, label: APP_TEXT[id] }))
export const MAT_SEG = MATERIAL_ORDER.map((id) => ({ id, label: MATERIAL_TEXT[id] }))

export const S = {
  kickerNow: loc('宽禁带', 'Wide bandgap'),
  introTitle: loc('Si 快到极限了：宽禁带器件为什么出现', 'Si is near its limit: why wide-bandgap devices appeared'),
  coreTitle: loc('拨一拨：材料、Vth 滞回与动态 Rds(on)', 'Try it: materials, Vth hysteresis and dynamic Rds(on)'),
  coreNote: loc(
    '三个标签页分别回答三个问题：这个耐压该选哪种材料；SiC 的 Vth 为什么测一次不够；GaN 的导通电阻为什么要过一段时间才稳定。图都是教学示意，数值不对应任何真实器件。',
    'The three tabs answer three questions: which material suits this voltage; why one Vth reading is not enough for SiC; why GaN on-resistance settles only after a delay. All figures are teaching illustrations; the values match no real device.',
  ),
  appLabel: loc('应用（决定耐压等级）', 'Application (sets the voltage class)'),
  matLabel: loc('选用材料', 'Material chosen'),
  rateLabel: loc('扫描速度 dVgs/dt', 'Sweep rate dVgs/dt'),
  vpreLabel: loc('预置栅压 Vpre', 'Preconditioning gate voltage Vpre'),
  tpreLabel: loc('预置时间 tpre', 'Preconditioning time tpre'),
  vsLabel: loc('关态应力电压 Vstress', 'Off-state stress voltage Vstress'),
  tsLabel: loc('应力时间 tstress', 'Stress time tstress'),
  delayLabel: loc('测量延时 t', 'Measurement delay t'),
  stdNote: loc('示例，以现行标准为准', 'Example; follow the current standard'),
  illus: loc('教学示意', 'Teaching illustration'),
  formulaMat: loc('教学简化公式：R_on,sp ∝ BV^2.5 / Ec^3', 'Teaching-simplified formula: R_on,sp ∝ BV^2.5 / Ec^3'),
  formulaVth: loc('教学简化公式：Δ = D(rate) · exp(−k(Vpre) · tpre)', 'Teaching-simplified formula: Δ = D(rate) · exp(−k(Vpre) · tpre)'),
  formulaGan: loc('教学简化公式：R(t) = R0 · (1 + k · e^(−t/τ))', 'Teaching-simplified formula: R(t) = R0 · (1 + k · e^(−t/τ))'),
  rBv: loc('耐压等级', 'Voltage class'),
  rSiSic: loc('Si 相对 SiC 的倍数', 'Si relative to SiC (times)'),
  rSicSi: loc('所选材料 ÷ Si 的比值', 'Selected material ÷ Si'),
  vthFwd: loc('正扫 Vth（1 mA 恒流点）', 'Forward Vth (1 mA constant-current point)'),
  vthRev: loc('反扫 Vth（1 mA 恒流点）', 'Reverse Vth (1 mA constant-current point)'),
  vthDiff: loc('Δ = 正扫 − 反扫', 'Δ = forward − reverse'),
  vthSweep: loc('单向扫描时间', 'One-way sweep time'),
  vthTarget: loc('判定（Δ ≤ 0.1 V）', 'Verdict (Δ ≤ 0.1 V)'),
  vthPass: loc('在 0.1 V 内', 'Within 0.1 V'),
  vthFail: loc('超出 0.1 V', 'Above 0.1 V'),
  ganTitle: loc('读数：GaN 动态 Rds(on)', 'Readout: GaN dynamic Rds(on)'),
  ganR0: loc('静态 R0', 'Static R0'),
  ganR1: loc('1 µs 处 R(t)', 'R(t) at 1 µs'),
  ganInc1: loc('1 µs 处增幅', 'Increase at 1 µs'),
  ganR100: loc('100 µs 处 R(t)', 'R(t) at 100 µs'),
  ganInc100: loc('100 µs 处增幅', 'Increase at 100 µs'),
  ganRDelay: loc('延时处 R(t)', 'R(t) at the delay'),
  ganIncDelay: loc('延时处增幅', 'Increase at the delay'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '预置序列、延时窗口、低电感夹具决定测量能否重复；这些条件要写进测试程序，而不是靠经验。',
    'The preconditioning sequence, the delay window and a low-inductance fixture decide whether a measurement repeats; these conditions belong in the test program, not in experience.',
  ),
  next: loc('下一课：综合测试程序', 'Next: Capstone test program'),
  task1: loc('把应用切到 800 V 车用逆变器，并为它选用 SiC。', 'Switch the application to the 800 V EV inverter and choose SiC for it.'),
  task2: loc('设置预置序列（电压与时间），使正扫与反扫的 Vth 差不超过 0.1 V。', 'Set the preconditioning sequence (voltage and time) so the forward and reverse Vth differ by 0.1 V or less.'),
  task3: loc('加大关态应力，让 1 µs 处的 Rds(on) 增幅达到 50% 以上；100 µs 处增幅应已降到 5% 以下。', 'Raise the off-state stress so the Rds(on) increase at 1 µs is 50% or more; the increase at 100 µs should be down to 5% or less.'),
  task4: loc('把测量延时设到 1 µs 以内，避免读到已经恢复的数值（低估动态增幅）。', 'Set the measurement delay to 1 µs or less so you do not read a value that has already recovered (which underestimates the dynamic increase).'),
  vMatSiHigh: loc('Si 在高压段的导通电阻偏高', 'Si on-resistance is high at high voltage'),
  vMatSiHighText: loc(
    '在 {bv} V 级，Si 的漂移区相对比导通电阻是 SiC 的 {x} 倍（教学示意）。原因：耐压越高，Si 漂移区越厚，R 随 BV^2.5 快速上升；禁带宽的材料临界场强高，同样耐压的漂移区薄得多。',
    'At the {bv} V class, the Si drift-region relative specific on-resistance is {x} times that of SiC (teaching illustration). Reason: the higher the voltage, the thicker the Si drift region, and R rises quickly with BV^2.5; a wide-bandgap material has a higher critical field, so its drift region can be much thinner at the same voltage.',
  ),
  vMatSiLow: loc('Si 在低压段的差距较小', 'The Si gap is small at low voltage'),
  vMatSiLowText: loc(
    '在 {bv} V 级，只算漂移区时 SiC 的相对比导通电阻约为 Si 的 {x} %（教学示意）。但真实器件还有沟道、衬底与封装电阻，低压段这些项占比大，优势会被稀释，所以低压段不能只看漂移区这一项。',
    'At the {bv} V class, counting the drift region alone, SiC relative specific on-resistance is about {x} % of Si (teaching illustration). Real devices also have channel, substrate and package resistance, which weigh more at low voltage and dilute the advantage, so do not judge low voltage by the drift region alone.',
  ),
  vMatSic: loc('SiC：同耐压下导通电阻低', 'SiC: lower on-resistance at the same voltage'),
  vMatSicText: loc(
    '在 {bv} V 级，SiC 的漂移区相对比导通电阻约为 Si 的 {x} %（教学示意）。原因：禁带约 3.3 eV，临界场强高，漂移区可以更薄。高压、高温、高频应用是它的主场（教学叙述）。',
    'At the {bv} V class, SiC drift-region relative specific on-resistance is about {x} % of Si (teaching illustration). Reason: the bandgap is about 3.3 eV, the critical field is high, and the drift region can be thinner. High voltage, high temperature and high frequency are its main field (teaching description).',
  ),
  vMatGan: loc('GaN：同耐压下导通电阻低，但电压等级有限', 'GaN: lower on-resistance, but within a limited voltage range'),
  vMatGanText: loc(
    '在 {bv} V 级，GaN 的漂移区相对比导通电阻约为 Si 的 {x} %（教学示意）。GaN HEMT 多见于 650 V 等级；1200 V 级更常见 SiC（教学叙述）。GaN 没有体二极管，反向导通经沟道，压降较高。',
    'At the {bv} V class, GaN drift-region relative specific on-resistance is about {x} % of Si (teaching illustration). GaN HEMTs are mostly seen at the 650 V class; SiC is more common at 1200 V (teaching description). GaN has no body diode; reverse conduction goes through the channel with a higher drop.',
  ),
  vVthOk: loc('正反扫 Vth 差已在 0.1 V 以内', 'Forward and reverse Vth differ by 0.1 V or less'),
  vVthOkText: loc(
    'Δ = {d} V。原因：预置 {vpre} V、{tpre} ms 让栅氧界面陷阱充放到接近稳定，正扫与反扫读到的 Vth 接近，测得值才可重复。',
    'Δ = {d} V. Reason: preconditioning at {vpre} V for {tpre} ms lets the gate-oxide interface traps settle close to a steady state, so the forward and reverse readings agree and the result can be repeated.',
  ),
  vVthBad: loc('正反扫 Vth 差还超标', 'The forward and reverse Vth difference is still too large'),
  vVthBadText: loc(
    'Δ = {d} V，超过 0.1 V。原因：预置时间 {tpre} ms 还不够，Δ 按 e^(−k·t) 下降，时间或预置电压不够就压不下去（预置电压为 0 时，时间再长也不会下降）；扫得越慢，陷阱充放越充分，Δ 也越大。',
    'Δ = {d} V, above 0.1 V. Reason: the preconditioning time of {tpre} ms is not enough; Δ falls as e^(−k·t), so without enough time or voltage it does not come down (at 0 V preconditioning it never falls, however long you wait). A slower sweep lets traps charge and discharge more fully, so Δ is larger.',
  ),
  vGanOk: loc('延时够短，增幅读得准', 'The delay is short enough to read the increase'),
  vGanOkText: loc(
    '延时 {t} µs 时增幅为 {inc} %，1 µs 处为 {inc1} %。原因：增幅按 e^(−t/τ) 衰减，τ = 10 µs；延时远小于 τ，读到的才接近真实的动态增幅（教学简化公式）。',
    'At a delay of {t} µs the increase is {inc} %, and at 1 µs it is {inc1} %. Reason: the increase decays as e^(−t/τ) with τ = 10 µs; only a delay well below τ reads close to the true dynamic increase (teaching-simplified formula).',
  ),
  vGanLow: loc('延时过长，增幅被低估', 'The delay is too long, so the increase is underestimated'),
  vGanLowText: loc(
    '延时 {t} µs 时增幅只剩 {inc} %，而 1 µs 处是 {inc1} %。原因：增幅按 e^(−t/τ) 在 τ = 10 µs 量级内恢复，测得越晚，读到的动态 Rds(on) 越接近静态值。',
    'At a delay of {t} µs the increase has fallen to {inc} %, while at 1 µs it is {inc1} %. Reason: the increase recovers as e^(−t/τ) on the order of τ = 10 µs, so the later you measure, the closer the reading is to the static value.',
  ),
}

export const INTRO = [
  loc(
    '硅（Si）的耐压越高，导通电阻随耐压上升得越快，功率器件越来越难同时兼顾低导通损耗与高耐压。碳化硅（SiC）和氮化镓（GaN）禁带更宽，临界击穿场强高，所以同耐压下的漂移区可以更薄。它们的参数能测，但测法不能照搬 Si：Vth 有滞回，GaN 的 Rds(on) 会随关态应力动态上升。Si 的 Rds(on) 与耐压的关系见 {@pwrSelector}；静态参数的测法见 {@pwrStatic}。',
    'As Si devices are rated for higher voltage, their on-resistance rises faster, so it becomes harder to keep both low conduction loss and high voltage. Silicon carbide (SiC) and gallium nitride (GaN) have wider bandgaps and higher critical fields, so their drift regions can be thinner at the same voltage. Their parameters can be measured, but not with the Si methods: SiC Vth shows hysteresis, and GaN Rds(on) rises dynamically after off-state stress. For how Rds(on) scales with voltage, see {@pwrSelector}; for static test methods, see {@pwrStatic}.',
  ),
  loc(
    '这一课分三步：先比较材料（禁带、临界场强与导通电阻的关系）；再看 SiC 的 Vth 滞回怎样随扫描速度与预置序列变化；最后看 GaN 在关态应力之后，Rds(on) 怎样随测量延时恢复。双脉冲条件下的开关测试见 {@pwrDpt}。',
    'The lesson has three steps: compare materials (the link between bandgap, critical field and on-resistance); see how SiC Vth hysteresis changes with sweep rate and the preconditioning sequence; then see how GaN Rds(on) recovers with measurement delay after off-state stress. For switching tests under double-pulse conditions, see {@pwrDpt}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'SiC 和 GaN 的参数测法与 Si 完全一样。两者的 Vth 有滞回与漂移，GaN 的 Rds(on) 有动态上升，测法必须规定预置序列与测量延时，照搬 Si 的步骤会读到不可重复的数。',
    'SiC and GaN parameters are measured exactly as Si is. Their Vth shows hysteresis and drift, and GaN Rds(on) rises dynamically, so the preconditioning sequence and measurement delay must be specified; copying the Si steps gives readings that do not repeat.',
  ),
  loc(
    'SiC 的 Vth 测一次就稳定了。正扫与反扫的读数会差出一截，差值还随扫描速度和预置时间变化；只测一次，等于把某次扫描的陷阱状态当成了器件常数。',
    'SiC Vth is stable once measured. The forward and reverse readings can differ noticeably, and the gap changes with sweep rate and preconditioning time; one measurement treats one sweep’s trap state as a device constant.',
  ),
  loc(
    '动态 Rds(on) 就是静态参数，用 DC 测一次就行。动态 Rds(on) 是关态高压应力之后，随时间慢慢恢复的量；测早了读到的是应力后的高值，测晚了又会低估，必须同时规定应力条件与延时。',
    'Dynamic Rds(on) is just a static parameter, so one DC test is enough. Dynamic Rds(on) is a value that recovers slowly with time after off-state high-voltage stress; measured too early it reads the stressed high value, and measured too late it underestimates, so the stress condition and the delay must both be fixed.',
  ),
]

export const TAKEAWAY: LText = loc(
  '禁带越宽，临界场强越高，同耐压的漂移区越薄，相对比导通电阻越低（教学简化公式 R ∝ BV^2.5 / Ec^3）。SiC 的 Vth 滞回用固定的预置序列压住，正反扫差值 Δ = D·e^(−k·t) 下降；GaN 的动态 Rds(on) 在延时 t 处增幅为 k·e^(−t/τ)，延时要远小于 τ。',
  'The wider the bandgap, the higher the critical field, the thinner the drift region at the same voltage, and the lower the relative specific on-resistance (teaching-simplified formula R ∝ BV^2.5 / Ec^3). Fix SiC Vth hysteresis with a fixed preconditioning sequence, which brings the forward-reverse gap down as Δ = D·e^(−k·t). GaN dynamic Rds(on) has an increase of k·e^(−t/τ) at delay t, so the delay must be well below τ.',
)

/* 小测：多选题写成组合选项；数值题的解释写出计算过程；数字经 fillText 放入文字 */
const Q3_RATIO = Math.pow(1200 / 650, 2.5).toFixed(1)
const Q6_LN = Math.log(0.25 / 0.1).toFixed(2)
const Q8_R = ganRds(1, GAN_TAU_US).toFixed(1)
const Q4_RATIO = (relSpecificRon('si', APP_BV.inverter) / relSpecificRon('sic', APP_BV.inverter)).toFixed(0)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'wbg-q1',
    prompt: loc('宽禁带材料相对 Si 的主要优势，来自哪一条因果链？', 'Which causal chain gives wide-bandgap materials their main advantage over Si?'),
    options: [
      { id: 'a', text: loc('禁带更宽 → 临界击穿场强更高 → 漂移区可更薄 → 同耐压下导通电阻更低', 'Wider bandgap → higher critical field → thinner drift region → lower on-resistance at the same voltage') },
      { id: 'b', text: loc('电子迁移率一定比 Si 高', 'Electron mobility is always higher than Si') },
      { id: 'c', text: loc('只因为价格更便宜', 'Only because it is cheaper') },
    ],
    answer: 'a',
    explain: loc(
      '材料的禁带宽度决定临界场强，漂移区厚度由耐压与场强共同决定。场强高，同样耐压只需更薄的漂移区，导通电阻随之下降。迁移率与价格都不是这条链的核心。',
      'The bandgap sets the critical field, and the drift-region thickness follows from the voltage and that field. A higher field needs a thinner drift region for the same voltage, so the on-resistance drops. Mobility and price are not the core of this chain.',
    ),
  },
  {
    id: 'wbg-q2',
    prompt: loc('关于 SiC MOSFET 的 Vth 测试，哪一组说法都正确？（1）正扫与反扫可能读到不同 Vth；（2）预置栅压序列会改变读数；（3）测一次 Vth 就能永久使用。', 'For SiC MOSFET Vth testing, which option lists only correct statements? (1) forward and reverse sweeps can read different Vth; (2) the preconditioning gate sequence changes the reading; (3) one Vth measurement can be used forever.'),
    options: [
      { id: 'a', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'b', text: loc('（2）、（3）', '(2) and (3)') },
      { id: 'c', text: loc('（1）、（2）', '(1) and (2)') },
    ],
    answer: 'c',
    explain: loc(
      '（3）不对：陷阱状态随扫描与历史变化，同一颗器件的 Vth 读数会随条件移动。（1）与（2）正确：滞回让正反扫不同，预置序列决定陷阱处于什么状态，因此必须固定序列。',
      '(3) is wrong: trap state changes with the sweep and history, so the same device reads a different Vth under different conditions. (1) and (2) are correct: hysteresis makes forward and reverse differ, and the preconditioning sequence sets the trap state, so the sequence must be fixed.',
    ),
  },
  {
    id: 'wbg-q3',
    prompt: loc('按教学简化公式 R ∝ BV^2.5 / Ec^3，耐压从 650 V 提高到 1200 V 时，Si 的相对比导通电阻约增加到多少倍？', 'Using the teaching formula R ∝ BV^2.5 / Ec^3, roughly how many times does Si relative specific on-resistance grow when the voltage rises from 650 V to 1200 V?'),
    options: [
      { id: 'a', text: loc('1.8 倍（只按耐压比）', '1.8 times (voltage ratio only)') },
      { id: 'b', text: loc('10 倍', '10 times') },
      { id: 'c', text: fillText(loc('{v} 倍', '{v} times'), { v: Q3_RATIO }) },
    ],
    answer: 'c',
    explain: fillText(
      loc(
        '(1200 / 650)^2.5 = 1.846^2.5 ≈ {v}，约 {r} 倍。只按耐压比 1.85 倍会低估，因为指数是 2.5。',
        '(1200 / 650)^2.5 = 1.846^2.5 ≈ {v}, about {r} times. Using the voltage ratio alone (1.85) underestimates it, because the exponent is 2.5.',
      ),
      { v: Math.pow(1200 / 650, 2.5).toFixed(2), r: Q3_RATIO },
    ),
  },
  {
    id: 'wbg-q4',
    prompt: loc('为 1200 V 车用逆变器选材料，哪一条理由最站得住？', 'Which reason best supports choosing a material for a 1200 V EV inverter?'),
    options: [
      { id: 'a', text: loc('Si：便宜，耐压不是问题', 'Si: cheap, voltage is not a problem') },
      { id: 'b', text: loc('SiC：高压段相对导通电阻低（教学示意），开关损耗也较低', 'SiC: lower relative on-resistance at high voltage (teaching illustration), and lower switching loss') },
      { id: 'c', text: loc('GaN：只要比 SiC 好，就一定选它', 'GaN: if it looks better than SiC, always pick it') },
    ],
    answer: 'b',
    explain: fillText(
      loc(
        '按教学简化公式，1200 V 时 Si 的相对比导通电阻约为 SiC 的 {r} 倍，差距随耐压快速放大。选材料还要看器件成熟度、驱动和可靠性，不能只看一个数。',
        'By the teaching-simplified formula, at 1200 V the Si relative specific on-resistance is about {r} times that of SiC, and the gap widens quickly with voltage. Choosing a material also depends on device maturity, drive and reliability, not one number.',
      ),
      { r: Q4_RATIO },
    ),
  },
  {
    id: 'wbg-q5',
    prompt: loc('SiC MOSFET 的 Vth 滞回主要来自哪里？', 'Where does SiC MOSFET Vth hysteresis mainly come from?'),
    options: [
      { id: 'a', text: loc('万用表的读数误差', 'Multimeter reading error') },
      { id: 'b', text: loc('栅氧界面陷阱在栅偏下充放电，读数随扫描方向与历史不同', 'Gate-oxide interface traps charge and discharge under gate bias, so the reading depends on sweep direction and history') },
      { id: 'c', text: loc('探针的接触电阻', 'Probe contact resistance') },
    ],
    answer: 'b',
    explain: loc(
      '陷阱在栅偏下充放电，它的状态记住了之前的扫描，所以正扫与反扫读到的 Vth 不同。这是器件本身的界面效应，不是仪表误差，所以要靠固定预置序列来压住它。',
      'Traps charge and discharge under gate bias, and their state remembers earlier sweeps, so the forward and reverse Vth differ. This is an interface effect of the device, not instrument error, so it is controlled by a fixed preconditioning sequence.',
    ),
  },
  {
    id: 'wbg-q6',
    prompt: loc('预置后正反扫 Vth 差为 0.25 V。差值按 Δ = Δ0·e^(−k·t) 下降，要使 Δ ≤ 0.1 V，k·t 至少要多少？', 'After preconditioning the forward-reverse Vth gap is 0.25 V. It falls as Δ = Δ0·e^(−k·t). For Δ ≤ 0.1 V, what is the least k·t?'),
    options: [
      { id: 'a', text: loc('0.10', '0.10') },
      { id: 'b', text: fillText(loc('{v}', '{v}'), { v: Q6_LN }) },
      { id: 'c', text: loc('2.50', '2.50') },
    ],
    answer: 'b',
    explain: fillText(
      loc(
        'e^(−k·t) ≤ 0.1 / 0.25 = 0.4，取对数得 k·t ≥ ln(2.5) ≈ {v}。0.10 是目标值本身，不是 k·t；2.50 是 0.25 与 0.10 的比，还没有取对数，不是 k·t。',
        'e^(−k·t) ≤ 0.1 / 0.25 = 0.4, so k·t ≥ ln(2.5) ≈ {v}. 0.10 is the target itself, not k·t; 2.50 is the ratio 0.25 / 0.10 before taking the logarithm, so it is not k·t either.',
      ),
      { v: Q6_LN },
    ),
  },
  {
    id: 'wbg-q7',
    prompt: loc('测 GaN 动态 Rds(on) 时，哪些情况会让读到的动态增幅变小（低估）？（1）测量延时远大于 τ；（2）应力电压太低；（3）应力时间太短。', 'When measuring GaN dynamic Rds(on), which cases make the measured dynamic increase smaller (an underestimate)? (1) a delay much longer than τ; (2) too low a stress voltage; (3) too short a stress time.'),
    options: [
      { id: 'a', text: loc('（1）、（2）', '(1) and (2)') },
      { id: 'b', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'c', text: loc('（2）、（3）', '(2) and (3)') },
      { id: 'd', text: loc('（1）、（2）、（3）', '(1), (2) and (3)') },
    ],
    answer: 'd',
    explain: loc(
      '三种情况都让增幅变小：延时长时 e^(−t/τ) 已经接近 0；应力电压低或时间短时 k 本身就小。增幅 k·e^(−t/τ) 只要两个因子之一变小，读数就低。',
      'All three shrink the increase: a long delay drives e^(−t/τ) toward 0, while a low stress voltage or a short stress time makes k itself small. The increase k·e^(−t/τ) falls whenever either factor falls.',
    ),
  },
  {
    id: 'wbg-q8',
    prompt: fillText(
      loc('GaN 的静态 R0 = {r0} mΩ，k = 1，τ = {tau} µs。延时 10 µs 时的 Rds(on) 约是多少？', 'A GaN device has static R0 = {r0} mΩ, k = 1 and τ = {tau} µs. About what is Rds(on) at a 10 µs delay?'),
      { r0: String(GAN_R0_MOHM), tau: String(GAN_TAU_US) },
    ),
    options: [
      { id: 'a', text: loc(`${GAN_R0_MOHM.toFixed(1)} mΩ`, `${GAN_R0_MOHM.toFixed(1)} mΩ`) },
      { id: 'b', text: loc('100 mΩ', '100 mΩ') },
      { id: 'c', text: fillText(loc('{v} mΩ', '{v} mΩ'), { v: Q8_R }) },
    ],
    answer: 'c',
    explain: fillText(
      loc(
        'R(10 µs) = 50 × (1 + 1 × e^(−10/10)) = 50 × (1 + e^(−1)) ≈ 50 × 1.368 = {v} mΩ。t = τ 时增幅恰为初值的 e^(−1) ≈ 37%。',
        'R(10 µs) = 50 × (1 + 1 × e^(−10/10)) = 50 × (1 + e^(−1)) ≈ 50 × 1.368 = {v} mΩ. At t = τ the increase is exactly e^(−1), about 37%, of its initial value.',
      ),
      { v: Q8_R },
    ),
  },
  {
    id: 'wbg-q9',
    prompt: loc('关于 GaN 的动态 Rds(on)，哪一种说法正确？', 'Which statement about GaN dynamic Rds(on) is correct?'),
    options: [
      { id: 'a', text: loc('它就是静态参数，直接用 DC 测就行', 'It is just a static parameter; a DC test is enough') },
      { id: 'b', text: loc('延时越长读数越准，应尽量晚测', 'The longer the delay, the more accurate; measure as late as possible') },
      { id: 'c', text: loc('它是关态应力之后随时间恢复的量，要固定应力条件并规定测量延时', 'It is a value that recovers over time after off-state stress; the stress condition must be fixed and the measurement delay specified') },
    ],
    answer: 'c',
    explain: loc(
      '动态 Rds(on) 的增幅取决于应力电压、应力时间与延时，三者都要规定，否则不同实验室的数字无法比较。延时越长越接近静态值，所以“越晚越准”是误区。',
      'The dynamic increase depends on stress voltage, stress time and delay; all three must be specified or results from different labs cannot be compared. A longer delay gets closer to the static value, so “later is more accurate” is a misconception.',
    ),
  },
  {
    id: 'wbg-q10',
    prompt: loc('关于宽禁带器件的测试，哪一组说法都正确？（1）参数可以完全照搬 Si 的测法；（2）SiC 的预置序列应固定并写进测试程序；（3）GaN 没有体二极管，反向导通经沟道，压降较高（教学示意）。', 'For wide-bandgap device testing, which option lists only correct statements? (1) parameters can be measured exactly as for Si; (2) the SiC preconditioning sequence should be fixed and written into the test program; (3) GaN has no body diode, so reverse conduction goes through the channel with a higher drop (teaching illustration).'),
    options: [
      { id: 'a', text: loc('（1）、（2）', '(1) and (2)') },
      { id: 'b', text: loc('（2）、（3）', '(2) and (3)') },
      { id: 'c', text: loc('（1）、（3）', '(1) and (3)') },
      { id: 'd', text: loc('（1）、（2）、（3）', '(1), (2) and (3)') },
    ],
    answer: 'b',
    explain: loc(
      '（1）错：Vth 滞回与动态 Rds(on) 要求特定的预置与延时条件。（2）与（3）正确：固定序列让结果可重复；GaN 无体二极管，反向导通经沟道，压降通常高于带体二极管的器件（教学示意）。',
      '(1) is wrong: Vth hysteresis and dynamic Rds(on) require specific preconditioning and delay conditions. (2) and (3) are correct: a fixed sequence makes results repeatable, and GaN has no body diode, so reverse conduction through the channel usually has a higher drop than a device with a body diode (teaching illustration).',
    ),
  },
]

/** 四张任务卡：done 由当前状态与分析结果算出，重置后自动还原 */
export function taskItems(s: WbgState, a: WbgAnalysis): TaskItem[] {
  return [
    { id: 'wbg-app-material', text: S.task1, done: s.app === 'inverter' && s.material === 'sic' },
    { id: 'wbg-vth-diff', text: S.task2, done: a.vth.diff <= 0.1 },
    { id: 'wbg-delay-read', text: S.task3, done: a.inc1 >= 0.5 && a.inc100 <= 0.05 },
    { id: 'wbg-delay-short', text: S.task4, done: s.delay <= 1 },
  ]
}

/** 右侧说明栏：随当前标签页与参数变化，并写出原因 */
export function verdictOf(s: WbgState, a: WbgAnalysis): { title: LText; text: LText } {
  const bvText = String(a.bv)
  if (s.tab === 'material') {
    if (s.material === 'si' && a.bv >= 650) {
      return { title: S.vMatSiHigh, text: fillText(S.vMatSiHighText, { bv: bvText, x: (a.ron.si / a.ron.sic).toFixed(1) }) }
    }
    if (s.material === 'si') {
      return { title: S.vMatSiLow, text: fillText(S.vMatSiLowText, { bv: bvText, x: pct(a.ron.sic / a.ron.si) }) }
    }
    if (s.material === 'sic') {
      return { title: S.vMatSic, text: fillText(S.vMatSicText, { bv: bvText, x: pct(a.ron.sic / a.ron.si) }) }
    }
    return { title: S.vMatGan, text: fillText(S.vMatGanText, { bv: bvText, x: pct(a.ron.gan / a.ron.si) }) }
  }
  if (s.tab === 'vth') {
    const d = a.vth.diff.toFixed(3)
    if (a.vth.diff <= 0.1) {
      return { title: S.vVthOk, text: fillText(S.vVthOkText, { d, vpre: s.vpre.toFixed(0), tpre: s.tpre.toFixed(1) }) }
    }
    return { title: S.vVthBad, text: fillText(S.vVthBadText, { d, tpre: s.tpre.toFixed(1) }) }
  }
  const vars = { t: s.delay.toFixed(1), inc: pct(a.incDelay), inc1: pct(a.inc1) }
  if (s.delay <= 1) {
    return { title: S.vGanOk, text: fillText(S.vGanOkText, vars) }
  }
  return { title: S.vGanLow, text: fillText(S.vGanLowText, vars) }
}

/** 图的文字：标签、标题、无障碍名称 */
export const FIG = {
  matAria: loc('三种材料的相对比导通电阻条形图（教学示意，对数刻度）', 'Bar chart of relative specific on-resistance for three materials (teaching illustration, log scale)'),
  matTitle: loc('漂移区相对比导通电阻 @ {bv} V（对数刻度，Si @ 100 V = 1）', 'Drift-region relative specific on-resistance @ {bv} V (log scale, Si @ 100 V = 1)'),
  matCap: loc(
    '教学示意：条越长导通电阻越大。禁带越宽，同耐压下导通电阻越低；耐压越高，Si 与宽禁带之间的倍数越大。',
    'Teaching illustration: longer bars mean higher on-resistance. A wider bandgap gives lower on-resistance at the same voltage; the higher the voltage, the larger the gap between Si and the wide-bandgap materials.',
  ),
  matName: {
    si: loc('Si · 1.12 eV', 'Si · 1.12 eV'),
    sic: loc('4H-SiC · 3.3 eV', '4H-SiC · 3.3 eV'),
    gan: loc('GaN · 3.4 eV', 'GaN · 3.4 eV'),
  },
  vthAria: loc('SiC 栅压正扫与反扫的 Id–Vgs 曲线（教学示意）', 'Id–Vgs curves for forward and reverse gate sweeps of SiC (teaching illustration)'),
  vthTagF: loc('正扫', 'Fwd'),
  vthTagR: loc('反扫', 'Rev'),
  vthLegendF: loc('正扫（Vgs 由低到高）→', 'Forward (Vgs low → high) →'),
  vthLegendR: loc('← 反扫（由高到低）', '← Reverse (high → low)'),
  vthCap: loc('教学示意：两条曲线的横向差就是正反扫的 Vth 差 Δ。取 1 mA 恒流点读数。', 'Teaching illustration: the horizontal gap between the two curves is the forward-reverse Vth difference Δ, read at the 1 mA constant-current point.'),
  preAria: loc('预置脉冲、正扫与反扫的栅压时序示意', 'Schematic gate-voltage timing: preconditioning pulse, forward and reverse sweeps'),
  preTag: loc('预置', 'Precond.'),
  preFwd: loc('正扫', 'Fwd'),
  preRev: loc('反扫', 'Rev'),
  preCap: loc('教学示意：时间轴不按比例。预置电压与时间决定陷阱状态，然后才开始正扫、反扫。', 'Teaching illustration, time axis not to scale. The preconditioning voltage and time set the trap state before the forward and reverse sweeps begin.'),
  ganAria: loc('GaN 动态 Rds(on) 随测量延时衰减的曲线（教学简化公式）', 'GaN dynamic Rds(on) decaying with measurement delay (teaching-simplified formula)'),
  ganTagTau: loc('τ', 'τ'),
  ganTagDelay: loc('延时', 'Delay'),
  ganTagStatic: loc('静态 R0', 'Static R0'),
  ganTimeAxis: loc('测量延时 t（µs，对数）', 'Measurement delay t (µs, log)'),
  ganCap: loc(
    '教学简化公式：R(t) = R0·(1 + k·e^(−t/τ))。延时越长曲线越贴近 R0；竖线 1 µs、τ 和 100 µs 是读数点，金色竖线为当前延时。',
    'Teaching-simplified formula: R(t) = R0·(1 + k·e^(−t/τ)). The longer the delay, the closer the curve is to R0; the 1 µs, τ and 100 µs lines are readout points, and the gold line is the current delay.',
  ),
}
