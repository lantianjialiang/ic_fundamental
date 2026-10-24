import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type Card } from '../fund/parts'
import {
  APPS,
  DEVICE_TYPES,
  PARAM_IDS,
  RATINGS,
  appOf,
  classOf,
  lossOf,
  ratingFit,
  type AppId,
  type DevicePick,
  type DeviceType,
  type ParamClass,
  type ParamId,
  type SelectorState,
} from './pwrSelectorModel'

/** 把 {key} 换成数值或译文；zh 与 en 同时替换，保证两种语言都有占位符 */
export function fillL(text: LText, vars: Record<string, LText | string>): LText {
  const apply = (source: string, pickOf: (value: LText) => string) =>
    Object.keys(vars).reduce((acc, key) => {
      const value = vars[key]
      const replacement = typeof value === 'string' ? value : pickOf(value)
      return acc.split(`{${key}}`).join(replacement)
    }, source)
  return {
    zh: apply(text.zh, (value) => value.zh),
    en: apply(text.en ?? text.zh, (value) => value.en ?? value.zh),
  }
}

export const DEVICE_LABEL: Record<DeviceType, LText> = {
  'si-mos': loc('Si MOSFET', 'Si MOSFET'),
  igbt: loc('IGBT', 'IGBT'),
  'sic-mos': loc('SiC MOSFET', 'SiC MOSFET'),
  'gan-hemt': loc('GaN HEMT', 'GaN HEMT'),
}

export const TYPE_SEG = DEVICE_TYPES.map((id) => ({ id, label: DEVICE_LABEL[id] }))
export const RATING_SEG = RATINGS.map((rating) => ({ id: String(rating), label: loc(`${rating} V`, `${rating} V`) }))

const APP_TEXT: Record<AppId, { title: LText; sub: LText }> = {
  dcdc12: {
    title: loc('12 V → 1 V DC-DC', '12 V → 1 V DC-DC'),
    sub: loc('低压、大电流、开关频率高', 'Low voltage, high current, high frequency'),
  },
  pfc400: {
    title: loc('400 V PFC', '400 V PFC'),
    sub: loc('母线 400 V，功率因数校正', 'Bus 400 V, power factor correction'),
  },
  auto800: {
    title: loc('800 V 车用逆变器', '800 V automotive inverter'),
    sub: loc('母线 800 V，电流大、频率较低', 'Bus 800 V, high current, lower frequency'),
  },
  charger400: {
    title: loc('手机快充（初级侧）', 'Phone fast charger (primary side)'),
    sub: loc('母线约 400 V，电流小、频率高', 'Bus about 400 V, low current, high frequency'),
  },
}

export type AppCard = Card & { id: AppId; title: LText; sub: LText; text: LText }

export const APP_CARDS: AppCard[] = APPS.map((app) => ({
  id: app.id,
  title: APP_TEXT[app.id].title,
  sub: APP_TEXT[app.id].sub,
  text: APP_TEXT[app.id].sub,
}))

export const PARAM_LABEL: Record<ParamId, LText> = {
  bvdss: loc('BVdss 击穿电压', 'BVdss breakdown voltage'),
  rdson: loc('Rds(on) 导通电阻', 'Rds(on) on-resistance'),
  vth: loc('Vth 阈值电压', 'Vth threshold voltage'),
  qg: loc('Qg 栅极电荷', 'Qg gate charge'),
  coss: loc('Coss 输出电容', 'Coss output capacitance'),
  qrr: loc('Qrr 反向恢复电荷', 'Qrr reverse-recovery charge'),
  eas: loc('E_AS 雪崩能量（UIS）', 'E_AS avalanche energy (UIS)'),
  soa: loc('SOA 安全工作区', 'SOA safe operating area'),
  tsc: loc('短路耐受时间', 'Short-circuit withstand time'),
  rthjc: loc('Rth(j-c) 结壳热阻', 'Rth(j-c) junction-to-case'),
  rthja: loc('Rth(j-a) 结到环境热阻', 'Rth(j-a) junction-to-ambient'),
  zth: loc('Zth(t) 瞬态热阻抗', 'Zth(t) transient thermal impedance'),
}

export const CLASS_LABEL: Record<ParamClass, LText> = {
  static: loc('静态', 'Static'),
  dynamic: loc('动态', 'Dynamic'),
  limit: loc('极限', 'Limit'),
  thermal: loc('热', 'Thermal'),
}

export const S = {
  kickerNow: loc('这一次选型', 'This selection'),
  introTitle: loc('功率器件是什么，参数代表什么', 'What power devices are and what their parameters mean'),
  coreTitle: loc('拨一拨：为四个应用选器件与耐压', 'Try it: pick a device and rating for four applications'),
  coreNote: loc(
    '先点一个应用，再选器件类型与额定耐压；图和读数都按当前应用计算。这里的数值全部是教学示意，不引用任何标准或真实型号，损耗只是教学简化估算。',
    'Pick an application, then the device type and rated voltage; the charts and readouts follow the current application. All values here are teaching illustrations: no standard or real part is quoted, and the losses are teaching-simplified estimates.',
  ),
  appLabel: loc('应用', 'Application'),
  typeLabel: loc('器件类型', 'Device type'),
  ratingLabel: loc('额定耐压 V_DS', 'Rated voltage V_DS'),
  calcTitle: loc('导通损耗小计算器', 'Conduction loss calculator'),
  calcI: loc('导通电流 I', 'Conduction current I'),
  calcR: loc('Rds(on)', 'Rds(on)'),
  calcP: loc('P = I² · Rds(on)', 'P = I² · Rds(on)'),
  rBus: loc('母线电压', 'Bus voltage'),
  rRatio: loc('额定耐压 / 母线电压', 'Rating / bus voltage'),
  rFit: loc('耐压判断', 'Rating check'),
  rCond: loc('导通损耗 P_cond', 'Conduction loss P_cond'),
  rSw: loc('开关损耗 P_sw（粗估）', 'Switching loss P_sw (rough)'),
  rTotal: loc('合计（教学简化估算）', 'Total (teaching-simplified estimate)'),
  rNone: loc('教学表里没有这一档', 'No part at this rating in the teaching table'),
  fitOk: loc('1.5～2 倍，合适', '1.5–2×, suitable'),
  fitLow: loc('低于 1.5 倍，余量不足', 'Below 1.5×, too little margin'),
  fitHigh: loc('高于 2 倍，偏大', 'Above 2×, oversized'),
  noValue: loc('—', '—'),
  rdsAria: loc('Rds(on) 随额定耐压变化的折线图（教学示意）', 'Line chart of Rds(on) against rated voltage (teaching illustration)'),
  rdsTitle: loc('Rds(on) 随额定耐压（教学示意，对数纵轴）', 'Rds(on) against rated voltage (teaching illustration, log axis)'),
  rdsCap: loc(
    '同一类器件，耐压越高 Rds(on) 越大。在 650 V 档，SiC 与 GaN 的 Rds(on) 比同耐压的 Si 小。横轴是等间距的耐压档位，不是等比例；IGBT 不用 Rds(on)，见下面的损耗对比。',
    'For one device family, a higher rating gives a higher Rds(on). At the 650 V row, SiC and GaN have lower Rds(on) than Si at the same rating. The rating axis is equally spaced, not to scale; IGBT does not use Rds(on), see the loss comparison below.',
  ),
  rdsSummary: loc(
    '{type} 在 {rating} V 档：Rds(on) = {value} mΩ（教学示意）',
    '{type} at {rating} V: Rds(on) = {value} mΩ (teaching illustration)',
  ),
  rdsNoneSummary: loc('{type} 在 {rating} V 档没有数据（教学示意）', '{type} has no data at {rating} V (teaching illustration)'),
  lossAria: loc('四类器件导通与开关损耗的条形图（教学简化估算）', 'Bar chart of conduction and switching loss for four device types (teaching-simplified estimate)'),
  lossTitle: loc('当前应用、当前耐压下的粗估损耗（教学简化估算）', 'Rough loss at the current application and rating (teaching-simplified estimate)'),
  lossCap: loc(
    '开关频率高时，开关损耗往往先超过导通损耗；这时 IGBT 的拖尾会把它的损耗推得很高。',
    'At high switching frequency, switching loss often exceeds conduction loss; the IGBT tail current then pushes its loss up sharply.',
  ),
  formulaNote: loc(
    '教学简化公式：P_cond = I²·Rds(on)（IGBT 用 I·Vce(sat)）；P_sw ≈ ½·V·I·t_sw·f。',
    'Teaching-simplified formulas: P_cond = I²·Rds(on) (IGBT uses I·Vce(sat)); P_sw ≈ ½·V·I·t_sw·f.',
  ),
  legendCond: loc('导通', 'Conduction'),
  legendSw: loc('开关（粗估）', 'Switching (rough)'),
  notOffered: loc('此档无此器件', 'Not offered at this rating'),
  classTitle: loc('把 12 个参数分到四类', 'Sort the 12 parameters into four classes'),
  classNote: loc(
    '为每个参数选一类，初始都是“未分类”。分类决定用什么仪器：静态参数用 SMU，动态参数用栅极电荷与电容测试，极限参数用 UIS 或 SOA 台架，热参数用热阻与 Zth 测试。',
    'Give each parameter a class; all start as unassigned. The class decides the instrument: static parameters use an SMU, dynamic ones use gate-charge and capacitance tests, limits use a UIS or SOA bench, and thermal ones use thermal-resistance and Zth tests.',
  ),
  classAria: loc('参数分类', 'Parameter class'),
  unassigned: loc('未分类', 'Unassigned'),
  classCount: loc('已分类 {n} / 12', 'Assigned {n} / 12'),
  classAll: loc('全部分对', 'All correct'),
  classPartial: loc('已分类的部分正确', 'Assigned ones are correct so far'),
  classWrong: loc('有分错的，看一下每个参数的定义', 'Some are wrong; check each parameter’s definition'),
  introTitleNote: loc('本课不引用具体标准；数值为教学示意。', 'This lesson quotes no specific standard; the values are teaching illustrations.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。多选题用组合选项，题干会说明要选哪几条。', 'Pick an answer to see right or wrong with an explanation. Multi-select questions use combined options; the prompt says which statements to pick.'),
  asideLater: loc(
    '下一课用仪器测静态参数：Vth、Rds(on)、BVdss 与漏电各自怎么 force、怎么 measure。',
    'The next lesson measures static parameters with instruments: how Vth, Rds(on), BVdss and leakage are each forced and measured.',
  ),
  next: loc('下一课：静态参数测试', 'Next: Static parameter tests'),
  task1: loc('为四个应用各选一个额定耐压，都落在母线电压的 1.5～2 倍之内。', 'Pick a rating for each of the four applications, all within 1.5–2× the bus voltage.'),
  task2: loc(
    '用小计算器算 I = 10 A、Rds(on) = 5 mΩ 的导通损耗，读数应为 0.50 W（P = I²R）。',
    'With the calculator, work out I = 10 A and Rds(on) = 5 mΩ: the conduction loss should read 0.50 W (P = I²R).',
  ),
  task3: loc('把 12 个参数全部分到正确的一类。', 'Assign all 12 parameters to the correct class.'),
  task4: loc(
    '读图：在至少两个应用里改用不同的器件类型，比较 Rds(on) 随耐压的变化趋势。',
    'Read the chart: use different device types in at least two applications and compare how Rds(on) changes with rating.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '功率器件在开关电源、电机驱动和逆变器里做开关：导通时要让大电流的压降小，关断时要能承受高电压。常见的有功率二极管、MOSFET、IGBT，以及宽禁带的 SiC 与 GaN。选型先看两件事：额定耐压（能承受的最高电压）和导通电阻 Rds(on)（导通时的等效电阻）。',
    'Power devices act as switches in SMPS, motor drives and inverters: when on they must keep the voltage drop of a large current small, and when off they must block a high voltage. Common types are power diodes, MOSFETs and IGBTs, plus the wide-bandgap SiC and GaN. Selection starts with two numbers: the rated voltage (the highest voltage it can block) and the on-resistance Rds(on) (its equivalent resistance when on).',
  ),
  loc(
    '垂直结构的 MOSFET（如 VDMOS、沟槽栅）里，耐压靠加厚的漂移区来撑，漂移区越厚，导通电阻越大：耐压越高，Rds(on) 急剧上升（教学示意 R_on,sp ∝ BV^(2～2.5)）。所以高压器件不能只靠加大面积，要换结构或换材料，这就是 IGBT 与 SiC、GaN 的出现原因。',
    'In a vertical MOSFET (VDMOS or trench gate) the rating comes from a thick drift region, and a thicker drift region means a larger on-resistance: the higher the rating, the faster Rds(on) rises (teaching illustration R_on,sp ∝ BV^(2–2.5)). High-voltage parts therefore cannot rely on area alone; they need a different structure or material, which is why IGBTs and SiC and GaN devices exist.',
  ),
  loc(
    '选型的第一步是留余量：额定耐压取母线电压的 1.5～2 倍（教学经验），给开关过冲和线路尖峰留空间。导通损耗按 P = I²·Rds(on) 算，开关损耗随开关频率增大。两项相加，就是器件发热的主要来源。参数怎样测出来，见 {@pwrStatic}。',
    'The first selection step is margin: pick a rating 1.5–2× the bus voltage (a teaching rule of thumb) to leave room for switching overshoot and line spikes. Conduction loss is P = I²·Rds(on); switching loss grows with frequency. Together they are the main heat source. How the parameters are measured is in {@pwrStatic}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'Rds(on) 越小越好。同一工艺下，Rds(on) 小通常意味着芯片面积大，栅极电荷 Qg 和结电容也大，开关与驱动损耗变大，短路耐受也会变差。要和 Qg、成本一起比。',
    'Lower Rds(on) is always better. In the same process a low Rds(on) usually means a larger die, which brings more gate charge Qg and capacitance, more switching and drive loss, and weaker short-circuit withstand. Compare it together with Qg and cost.',
  ),
  loc(
    '耐压就是工作电压。额定耐压要留出母线电压的 1.5～2 倍余量，给开关过冲和尖峰留空间；工作电压贴着额定值，任何瞬态都可能把器件击穿。',
    'Rating equals working voltage. The rating needs 1.5–2× the bus voltage so there is room for switching overshoot and spikes; with the working voltage at the rating, any transient can break the device down.',
  ),
  loc(
    'IGBT 一定比 MOSFET 好。IGBT 有约 1.5～2 V 的饱和压降 Vce(sat)，关断时少子复合慢、有电流拖尾，开关频率高时损耗大；低压、高频场合 MOSFET 更合适，高压、大电流、低频场合 IGBT 才有优势。',
    'An IGBT is always better than a MOSFET. An IGBT has a saturation drop Vce(sat) of roughly 1.5–2 V and a turn-off current tail from slow minority-carrier recombination, so its loss is high at high frequency. MOSFETs suit low voltage and high frequency; IGBTs win at high voltage, high current and low frequency.',
  ),
]

export const TAKEAWAY: LText = loc(
  '选型顺序：先看母线电压，再选额定耐压（1.5～2 倍），然后比较 Rds(on) 与 Qg 等参数，最后按开关频率看导通损耗与开关损耗谁大。参数分静态、动态、极限、热四类，每一类对应不同的测试仪器。',
  'Selection order: read the bus voltage, pick a rating at 1.5–2×, compare Rds(on) with Qg and the other parameters, then check by switching frequency whether conduction or switching loss dominates. Parameters fall into static, dynamic, limit and thermal classes, and each class maps to a different test instrument.',
)

/** 右侧说明栏：根据当前应用的选择给结论，并写出原因 */
export function verdictOf(state: SelectorState): { title: LText; text: LText } {
  const app = appOf(state.appId)
  const pick: DevicePick = state.picks[app.id]
  const fit = ratingFit(app, pick.rating)
  const loss = lossOf(app, pick)
  const vars = {
    bus: String(app.busV),
    rating: String(pick.rating),
    ratio: (pick.rating / app.busV).toFixed(2),
    type: DEVICE_LABEL[pick.type],
    cond: loss.conduction.toFixed(2),
    sw: loss.switching.toFixed(2),
  }
  if (!loss.offered) {
    return {
      title: loc('这一档没有这种器件', 'This device has no part at this rating'),
      text: fillL(
        loc(
          '教学表里，{type} 没有 {rating} V 这一档（例如 Si MOSFET 在 1200 V 没有合理的导通电阻）。换一种器件或耐压再看损耗。',
          '{type} has no {rating} V row in the teaching table (for example, a Si MOSFET has no practical on-resistance at 1200 V). Change the device or the rating to see the loss.',
        ),
        vars,
      ),
    }
  }
  if (fit === 'low') {
    return {
      title: S.fitLow,
      text: fillL(
        loc(
          '额定 {rating} V 只有母线 {bus} V 的 {ratio} 倍，低于 1.5 倍。开关过冲和尖峰很容易超过额定值，器件可能在某个瞬态被击穿。换到更高一档。',
          'The {rating} V rating is only {ratio}× the {bus} V bus, below 1.5×. Switching overshoot and spikes can easily exceed the rating and break the device on a transient. Move up a rating.',
        ),
        vars,
      ),
    }
  }
  if (fit === 'high') {
    return {
      title: S.fitHigh,
      text: fillL(
        loc(
          '额定 {rating} V 是母线 {bus} V 的 {ratio} 倍，超过 2 倍。耐压高意味着器件做得更厚，Rds(on) 与 Qg 随之变大（教学示意），损耗和成本都更差。回到 1.5～2 倍的档。',
          'The {rating} V rating is {ratio}× the {bus} V bus, above 2×. A higher rating means a thicker device, so Rds(on) and Qg grow (teaching illustration), and loss and cost get worse. Return to a 1.5–2× row.',
        ),
        vars,
      ),
    }
  }
  return {
    title: loc('耐压落在 1.5～2 倍之内', 'The rating is within 1.5–2×'),
    text: fillL(
      loc(
        '{type} 额定 {rating} V，是母线 {bus} V 的 {ratio} 倍，留出了开关过冲的余量。估算导通损耗 {cond} W，开关损耗 {sw} W（教学简化估算）。',
        '{type} rated {rating} V is {ratio}× the {bus} V bus, leaving room for switching overshoot. Estimated conduction loss {cond} W, switching loss {sw} W (teaching-simplified estimate).',
      ),
      vars,
    ),
  }
}

/** 四张任务卡：完成与否由当前选择与分类结果算出，重置后自动还原 */
export function taskItems(state: SelectorState, assign: Partial<Record<ParamId, ParamClass>>): TaskItem[] {
  const usedTypes = new Set(APPS.map((app) => state.picks[app.id].type))
  return [
    {
      id: 'rating-all',
      text: S.task1,
      done: APPS.every((app) => ratingFit(app, state.picks[app.id].rating) === 'ok'),
    },
    {
      id: 'calc-loss',
      text: S.task2,
      done: state.calcI === 10 && state.calcR === 5,
    },
    {
      id: 'classify',
      text: S.task3,
      done: PARAM_IDS.every((id) => assign[id] !== undefined && assign[id] === classOf(id)),
    },
    {
      id: 'compare-types',
      text: S.task4,
      done: usedTypes.size >= 2,
    },
  ]
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '12 V → 1 V、10 A 的 DC-DC 应用，下面哪一种器件最合适？',
      'For a 12 V → 1 V DC-DC stage at 10 A, which device fits best?',
    ),
    options: [
      { id: 'a', text: loc('1200 V 的 SiC MOSFET', '1200 V SiC MOSFET') },
      { id: 'b', text: loc('20 V 级的 Si MOSFET，Rds(on) 低、没有 IGBT 的拖尾', '20 V class Si MOSFET: low Rds(on), no IGBT tail') },
      { id: 'c', text: loc('IGBT，耐压高、导通压降小', 'IGBT: high voltage, low on-state drop') },
    ],
    answer: 'b',
    explain: loc(
      '12 V 母线只需要 18～24 V 的额定耐压，20 V 级 Si MOSFET 的 Rds(on) 最低。1200 V 器件的 Rds(on) 与 Qg 都大得多；IGBT 的 Vce(sat) 约 1.6 V 以上，在 1 V 输出时效率很差。',
      'A 12 V bus needs only an 18–24 V rating, and a 20 V class Si MOSFET has the lowest Rds(on). A 1200 V device has much higher Rds(on) and Qg; an IGBT’s Vce(sat) of about 1.6 V or more is far too large for a 1 V output.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '母线电压 400 V 的 PFC，按教学经验留 1.5～2 倍余量，额定耐压应落在哪个范围？',
      'For a 400 V bus PFC with a 1.5–2× margin (teaching rule), in which range should the rated voltage fall?',
    ),
    options: [
      { id: 'a', text: loc('200～300 V', '200–300 V') },
      { id: 'b', text: loc('400～500 V', '400–500 V') },
      { id: 'c', text: loc('600～800 V', '600–800 V') },
      { id: 'd', text: loc('1000～1200 V', '1000–1200 V') },
    ],
    answer: 'c',
    explain: loc(
      '400 × 1.5 = 600，400 × 2 = 800，所以落在 600～800 V。400～500 V 只有 1.0～1.25 倍，余量不够；1000 V 以上超过 2 倍，损耗会偏大。',
      '400 × 1.5 = 600 and 400 × 2 = 800, so the range is 600–800 V. 400–500 V is only 1.0–1.25×, too little margin; above 1000 V is more than 2×, so loss grows.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('I = 10 A、Rds(on) = 5 mΩ 时，导通损耗是多少？', 'What is the conduction loss at I = 10 A and Rds(on) = 5 mΩ?'),
    options: [
      { id: 'a', text: loc('50 W', '50 W') },
      { id: 'b', text: loc('0.05 W', '0.05 W') },
      { id: 'c', text: loc('5 W', '5 W') },
      { id: 'd', text: loc('0.5 W', '0.5 W') },
    ],
    answer: 'd',
    explain: loc(
      'P = I²·R = 10² × 0.005 Ω = 100 × 0.005 = 0.5 W。注意 mΩ 要换成 Ω，即 5 mΩ = 0.005 Ω。',
      'P = I²·R = 10² × 0.005 Ω = 100 × 0.005 = 0.5 W. Remember to convert milliohms to ohms: 5 mΩ = 0.005 Ω.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'PFC 上 V = 400 V、I = 5 A、t_sw = 20 ns、f = 65 kHz，按教学简化公式 P_sw = ½·V·I·t_sw·f，开关损耗约为多少？',
      'For a PFC with V = 400 V, I = 5 A, t_sw = 20 ns and f = 65 kHz, what is the switching loss by the teaching-simplified formula P_sw = ½·V·I·t_sw·f?',
    ),
    options: [
      { id: 'a', text: loc('0.13 W', '0.13 W') },
      { id: 'b', text: loc('1.3 W', '1.3 W') },
      { id: 'c', text: loc('13 W', '13 W') },
      { id: 'd', text: loc('130 W', '130 W') },
    ],
    answer: 'b',
    explain: loc(
      'P_sw = ½ × 400 × 5 × 20 × 10⁻⁹ × 65 × 10³ = 1000 × 2 × 10⁻⁸ × 6.5 × 10⁴ = 1.3 W。计算时 t_sw 用秒、f 用赫兹，量级不能错。',
      'P_sw = ½ × 400 × 5 × 20 × 10⁻⁹ × 65 × 10³ = 1000 × 2 × 10⁻⁸ × 6.5 × 10⁴ = 1.3 W. Use seconds for t_sw and hertz for f; a wrong power of ten changes the answer by 1000×.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '下列哪些说法正确？① Rds(on) 越小越好；② 额定耐压要留母线电压的 1.5～2 倍余量；③ 高压、大电流、低频时 IGBT 的导通压降有优势；④ 额定耐压就等于工作电压。',
      'Which statements are correct? ① Lower Rds(on) is always better; ② the rating needs 1.5–2× the bus voltage; ③ at high voltage, high current and low frequency, an IGBT has a conduction-drop advantage; ④ the rating equals the working voltage.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ④', '① and ④') },
      { id: 'b', text: loc('② 和 ③', '② and ③') },
      { id: 'c', text: loc('①、②、③', '①, ② and ③') },
      { id: 'd', text: loc('②、③、④', '②, ③ and ④') },
    ],
    answer: 'b',
    explain: loc(
      '② 对：1.5～2 倍余量给尖峰留空间。③ 对：高压大电流低频场合，IGBT 的导通损耗小于同等条件下的高压 MOSFET。① 错：Rds(on) 小通常伴随大面积、大 Qg 与差的短路耐受。④ 错：工作电压贴着额定值没有余量。',
      '② is right: 1.5–2× leaves room for spikes. ③ is right: at high voltage, high current and low frequency an IGBT has lower conduction loss than a high-voltage MOSFET. ① is wrong: low Rds(on) usually comes with a large die, high Qg and weak short-circuit withstand. ④ is wrong: a working voltage at the rating leaves no margin.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('下列参数中，哪些属于动态参数？① Qg；② Coss；③ Qrr；④ BVdss；⑤ E_AS。', 'Which of these are dynamic parameters? ① Qg; ② Coss; ③ Qrr; ④ BVdss; ⑤ E_AS.'),
    options: [
      { id: 'a', text: loc('①、②、③', '①, ② and ③') },
      { id: 'b', text: loc('①和④', '① and ④') },
      { id: 'c', text: loc('②、④、⑤', '②, ④ and ⑤') },
      { id: 'd', text: loc('③和⑤', '③ and ⑤') },
    ],
    answer: 'a',
    explain: loc(
      'Qg、Coss、Qrr 都是随开关过程变化的量，属于动态。BVdss 是直流击穿电压，属于静态；E_AS 是雪崩能量，属于极限。',
      'Qg, Coss and Qrr all change during switching, so they are dynamic. BVdss is a DC breakdown voltage, which is static; E_AS is an avalanche energy limit.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '同一类 Si MOSFET，耐压从 60 V 档（Rds(on) 4 mΩ）升到 200 V 档（25 mΩ），Rds(on) 约变为多少倍？',
      'For the same Si MOSFET family, going from the 60 V row (Rds(on) 4 mΩ) to the 200 V row (25 mΩ) multiplies Rds(on) by about how much?',
    ),
    options: [
      { id: 'a', text: loc('2 倍', '2×') },
      { id: 'b', text: loc('4 倍', '4×') },
      { id: 'c', text: loc('6 倍', '6×') },
      { id: 'd', text: loc('10 倍', '10×') },
    ],
    answer: 'c',
    explain: loc(
      '25 ÷ 4 = 6.25，约 6 倍。这是教学表的数值，只用来看趋势：耐压升高，Rds(on) 明显增大。',
      '25 ÷ 4 = 6.25, about 6×. These are teaching-table values, used only to read the trend: a higher rating gives a much larger Rds(on).',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '400 V PFC 上，650 V 器件的耐压是母线的 1.6 倍，1200 V 器件是 3 倍。工程师选了 1200 V，理由是“更安全”。最可能的代价是什么？',
      'On a 400 V PFC, a 650 V part is 1.6× the bus and a 1200 V part is 3×. An engineer picks 1200 V because it is “safer”. What is the most likely cost?',
    ),
    options: [
      { id: 'a', text: loc('没有代价，只是成本略高', 'No cost beyond a slightly higher price') },
      { id: 'b', text: loc('Rds(on) 与 Qg 增大，导通与驱动损耗变差（教学示意）', 'Higher Rds(on) and Qg, so conduction and drive loss get worse (teaching illustration)') },
      { id: 'c', text: loc('1200 V 器件无法在 400 V 下导通', 'A 1200 V part cannot conduct at 400 V') },
      { id: 'd', text: loc('开关频率必须降到 1 kHz', 'The switching frequency must drop to 1 kHz') },
    ],
    answer: 'b',
    explain: loc(
      '耐压超过 2 倍时，器件要做得更厚，Rds(on) 与 Qg 随之增大（教学示意）。这些损耗与成本，就是为“用不到的”耐压付的代价。1.5～2 倍是安全余量与损耗之间的折中。',
      'Above 2×, the device must be built thicker, so Rds(on) and Qg rise (teaching illustration). These losses and costs are paid for margin you do not need. 1.5–2× is the compromise between safety margin and loss.',
    ),
  },
  {
    id: 'q9',
    prompt: loc(
      '关于 Rds(on) 与损耗，哪些说法成立？① 导通损耗与电流平方成正比；② Rds(on) 减半、电流不变，导通损耗也减半；③ 其它条件不变时，开关损耗与开关频率成正比；④ 频率升高时，开关损耗可能超过导通损耗；⑤ Rds(on) 增大一倍，导通损耗减半。',
      'Which statements about Rds(on) and loss hold? ① Conduction loss is proportional to the square of the current; ② halving Rds(on) at the same current halves conduction loss; ③ at fixed other conditions, switching loss is proportional to frequency; ④ at high frequency switching loss can exceed conduction loss; ⑤ doubling Rds(on) halves conduction loss.',
    ),
    options: [
      { id: 'a', text: loc('①、②和⑤', '①, ② and ⑤') },
      { id: 'b', text: loc('①和⑤', '① and ⑤') },
      { id: 'c', text: loc('③和⑤', '③ and ⑤') },
      { id: 'd', text: loc('①、②、③、④', '①, ②, ③ and ④') },
    ],
    answer: 'd',
    explain: loc(
      '①②③④都符合 P = I²·R 与 P_sw ∝ f 的关系。⑤ 错：导通损耗与 R 成正比，R 加倍则损耗加倍，不是减半。',
      '①②③④ all follow from P = I²·R and P_sw ∝ f. ⑤ is wrong: conduction loss is proportional to R, so doubling R doubles the loss.',
    ),
  },
  {
    id: 'q10',
    prompt: loc('下面哪一对“参数 → 仪器”的对应最合理？', 'Which parameter-to-instrument pairing is most reasonable?'),
    options: [
      { id: 'a', text: loc('BVdss → SMU：强制电流、测电压，并设置 compliance 限压', 'BVdss → SMU: force current, measure voltage, set a voltage compliance') },
      { id: 'b', text: loc('Qg → 普通万用表测直流电阻', 'Qg → an ordinary multimeter measuring DC resistance') },
      { id: 'c', text: loc('Zth → 只用直流万用表', 'Zth → a DC multimeter only') },
      { id: 'd', text: loc('E_AS → 普通数字万用表', 'E_AS → an ordinary digital multimeter') },
    ],
    answer: 'a',
    explain: loc(
      'BVdss 是静态的 force I / measure V 测试，需要 SMU 的 compliance 限压。Qg 要用恒流充电并测电压的栅极电荷测试；Zth 要做瞬态热测量；E_AS 要用 UIS 台架。',
      'BVdss is a static force-I, measure-V test that needs an SMU with a voltage compliance. Qg needs a gate-charge test that charges at constant current and measures voltage; Zth needs a transient thermal measurement; E_AS needs a UIS bench.',
    ),
  },
]
