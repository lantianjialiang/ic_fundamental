import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  ERR_LIMIT_PCT,
  fill,
  fixtureCurrentA,
  fmtAmp,
  fmtOhmHv,
  GUARD_IDS,
  IDSS_NA_OPTIONS,
  insulationEffOhm,
  MODE_IDS,
  RDUT_MOHM,
  twoWireMohm,
  type ContactAnalysis,
  type ContactState,
  type GuardMode,
  type HvAnalysis,
  type HvState,
  type WireMode,
} from './pwrKelvinModel'

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  introTitle: loc('毫欧与高压：误差从哪里来', 'Milliohms and high voltage: where the error comes from'),
  coreTitle: loc('拨一拨：接触电阻与夹具漏电', 'Try it: contact resistance and fixture leakage'),
  coreNote: loc(
    '上面两个标签页互不影响。先在“接触电阻”里比较 2 线与 4 线的读数，再到“高压漏电”里看 guard 的作用。',
    'The two tabs do not affect each other. On the contact tab compare 2-wire and 4-wire readings first; on the leakage tab see what guard does.',
  ),
  tabContact: loc('① 接触电阻', '① Contact resistance'),
  tabHv: loc('② 高压漏电', '② High-voltage leakage'),
  modeLabel: loc('接线方式', 'Wiring'),
  mode2w: loc('2 线', '2-wire'),
  mode4w: loc('4 线（Kelvin）', '4-wire (Kelvin)'),
  iLabel: loc('加压电流 I（A）', 'Force current I (A)'),
  rcLabel: loc('接触电阻 Rc（每个接触，mΩ）', 'Contact resistance Rc (each contact, mΩ)'),
  rleadLabel: loc('引线电阻 Rlead（每根线，mΩ）', 'Lead resistance Rlead (each lead, mΩ)'),
  rMeas: loc('测得电阻（当前接法）', 'Measured R (current wiring)'),
  rErr: loc('相对 2 mΩ 真值的误差', 'Error against the 2 mΩ truth'),
  r2w: loc('2 线读数', '2-wire reading'),
  r4w: loc('4 线读数', '4-wire reading'),
  vMeas: loc('电压读数 I × 测得 R', 'Voltage reading I × measured R'),
  vtestLabel: loc('测试电压 Vtest（V）', 'Test voltage Vtest (V)'),
  rinsLabel: loc('夹具绝缘电阻 R_ins', 'Fixture insulation R_ins'),
  rhLabel: loc('相对湿度 RH（%RH）', 'Relative humidity RH (%RH)'),
  guardLabel: loc('guard（保护环）', 'Guard ring'),
  guardOff: loc('关', 'Off'),
  guardOn: loc('开', 'On'),
  idssLabel: loc('DUT 漏电 Idss', 'DUT leakage Idss'),
  rIfix: loc('夹具漏电 I_fix', 'Fixture leakage I_fix'),
  rIdss: loc('DUT 漏电 Idss', 'DUT leakage Idss'),
  rIMeas: loc('测得电流 I_meas', 'Measured current I_meas'),
  rHvErr: loc('相对 Idss 的误差', 'Error against Idss'),
  rReff: loc('有效绝缘电阻 R_eff', 'Effective insulation R_eff'),
  humidityNote: loc(
    '教学示意：湿度超过 40 %RH 后，每升高 50 %RH，绝缘电阻降为十分之一。',
    'Teaching illustration: above 40 %RH, every 50 %RH rise cuts the insulation resistance tenfold.',
  ),
  standardNote: loc(
    '示例，以现行标准为准：这里的测试电压与误差门槛只用来演示，不是任何标准的取值。',
    'Example; follow the current standard: the test voltages and error limit here are for demonstration and are not any standard’s values.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的 ATE 还要看 DIB、Socket 的 Kelvin 设计与接触检查，以及大电流线缆的电感。这里只练两件事：2 线与 4 线的误差来源，和夹具漏电如何被 guard 分流。',
    'A real ATE also depends on the Kelvin design of the DIB and socket, the contact check, and cable inductance at high current. Here we practise two things: where 2-wire and 4-wire errors come from, and how guard diverts fixture leakage.',
  ),
  next: loc('下一课：动态参数：栅极电荷、电容与开关时间', 'Next: Dynamic parameters: gate charge, capacitance and switching time'),
  task1: loc(
    'T1：把 Rc 与 Rlead 都设成 0.5 mΩ，看 2 线读数 4 mΩ（误差 100%），4 线读数 2 mΩ。',
    'T1: Set both Rc and Rlead to 0.5 mΩ. See the 2-wire reading of 4 mΩ (100% error) and the 4-wire reading of 2 mΩ.',
  ),
  task2: loc(
    'T2：找到使 2 线误差不超过 5% 的条件（Rc + Rlead ≤ 0.05 mΩ）。',
    'T2: Find the condition that keeps the 2-wire error within 5% (Rc + Rlead ≤ 0.05 mΩ).',
  ),
  task3: loc(
    'T3：V = 1000 V、R_ins = 1e11 Ω、Idss = 20 nA 时夹具贡献 10 nA、误差 50%；开 guard 后恢复。',
    'T3: At V = 1000 V, R_ins = 1e11 Ω and Idss = 20 nA the fixture adds 10 nA (50% error); turn guard on to recover.',
  ),
  task4: loc(
    'T4：选择降压、换环境（降湿度）或加 guard 中的恰当措施，让高压漏电误差不超过 5%。',
    'T4: Choose a suitable action (lower the voltage, improve the environment by lowering humidity, or use guard) so the leakage error is within 5%.',
  ),
}

export const MODE_SEG: Array<{ id: WireMode; label: LText }> = [
  { id: MODE_IDS[0], label: S.mode2w },
  { id: MODE_IDS[1], label: S.mode4w },
]

export const GUARD_SEG: Array<{ id: GuardMode; label: LText }> = [
  { id: GUARD_IDS[0], label: S.guardOff },
  { id: GUARD_IDS[1], label: S.guardOn },
]

const IDSS_LABEL: Record<number, LText> = {
  10: loc('10 nA', '10 nA'),
  20: loc('20 nA', '20 nA'),
  100: loc('100 nA', '100 nA'),
  1000: loc('1 µA', '1 µA'),
  10000: loc('10 µA', '10 µA'),
}

export const IDSS_SEG: Array<{ id: string; label: LText }> = IDSS_NA_OPTIONS.map((na) => ({
  id: String(na),
  label: IDSS_LABEL[na],
}))

export const INTRO = [
  loc(
    '功率器件的导通电阻只有毫欧级。2 线测量让加压和感测共用同一对线，导线与接触电阻串进了读数，误差可能比 DUT 本身还大。4 线（开尔文）把感测线接到 DUT 引脚旁边，感测回路几乎不走电流，导线压降就不进读数。电阻测量的基本方法见 {@anaMeasure}。',
    'Power devices have on-resistances in the milliohm range. A 2-wire measurement shares one pair of leads for forcing and sensing, so lead and contact resistance enter the reading and can exceed the DUT itself. A 4-wire (Kelvin) measurement takes the sense lines to the DUT pins, where almost no current flows, so the lead drop stays out of the reading. The basic resistance method is in {@anaMeasure}.',
  ),
  loc(
    '高压测漏电有同样的问题：夹具（测试座、线缆）自己也有绝缘电阻，高压加在它上面会产生一股额外电流，和 DUT 的 Idss 混在一起被读出来。guard（保护环）把这条路径的测量端拉到加压电位，漏电就绕开了电流表。湿度和污染会让绝缘电阻下降。电流类参数的测法见 {@anaLeak}。',
    'High-voltage leakage has the same problem. The fixture (socket, cables) has its own insulation resistance, and the high voltage across it drives an extra current that mixes with the DUT Idss in the reading. A guard ring holds that path at the forcing potential, so the leakage bypasses the ammeter. Humidity and contamination lower the insulation resistance. For current-parameter methods see {@anaLeak}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '电流越大越准。欧姆定律是线性的：I 增大时 V 和 I 同比例变化，接触与引线电阻造成的误差比例不变；大电流还会让接触发热，并让线缆电感 L·di/dt 成为新问题。',
    'Higher current is more accurate. Ohm’s law is linear: when I rises, V and I scale together, so the contact and lead error stays the same in proportion; high current also heats the contacts and makes cable inductance L·di/dt a new problem.',
  ),
  loc(
    '接触电阻校零一次就可以忘。接触电阻会随磨损、脏污、换 Socket 而变，所以每次接触都要做接触检查（force–sense 开路检测），不能只校一次。',
    'Zeroing the contact resistance once is enough. Contact resistance changes with wear, dirt and socket changes, so every contact needs a contact check (force–sense open detection), not a single calibration.',
  ),
  loc(
    '高压漏电都是 DUT 的。夹具和线缆的绝缘电阻同样会漏电；湿度高、不开 guard 时，夹具漏电可以大过 DUT 的 Idss 本身。',
    'High-voltage leakage all belongs to the DUT. Fixture and cable insulation leaks too; at high humidity without guard, fixture leakage can exceed the DUT’s own Idss.',
  ),
]

export const TAKEAWAY: LText = loc(
  '2 线读数 = R_dut + 2(Rc + Rlead)，4 线的感测回路几乎无电流，读数 = R_dut。高压漏电读数 = Idss + V / R_ins（夹具），guard 把夹具那一项分流掉。误差门槛、测试电压与湿度取值都是教学示例，以现行标准为准。',
  'The 2-wire reading is R_dut + 2(Rc + Rlead); the 4-wire sense loop carries almost no current, so the reading is R_dut. The high-voltage reading is Idss + V / R_ins (fixture); guard diverts the fixture term. Error limits, test voltages and humidity values here are teaching examples; follow the current standard.',
)

/** 小测题里的数字全部由模型函数算出，与页面保持一致 */
const Q1_R = twoWireMohm(RDUT_MOHM, 0.5, 0.5)
const Q4_I = fixtureCurrentA(1000, insulationEffOhm(11, 40), false)
const Q5_ERR = (Q4_I / (20e-9)) * 100

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '2 线测量，R_dut = 2 mΩ，Rc = 0.5 mΩ，Rlead = 0.5 mΩ。2 线读数是多少？',
      '2-wire measurement: R_dut = 2 mΩ, Rc = 0.5 mΩ, Rlead = 0.5 mΩ. What does the 2-wire reading show?',
    ),
    options: [
      { id: 'a', text: loc('2 mΩ（读到真值）', '2 mΩ (reads the true value)') },
      { id: 'b', text: loc('3 mΩ（只加一个 Rc 与 Rlead）', '3 mΩ (only one Rc plus one Rlead added)') },
      { id: 'c', text: loc(`${Q1_R.toFixed(1)} mΩ`, `${Q1_R.toFixed(1)} mΩ`) },
    ],
    answer: 'c',
    explain: loc(
      `R_meas = R_dut + 2·(Rc + Rlead) = 2 + 2 × (0.5 + 0.5) = ${Q1_R.toFixed(1)} mΩ。两个接触和两根引线都在加压回路里，所以各计两次；误差 100%。`,
      `R_meas = R_dut + 2·(Rc + Rlead) = 2 + 2 × (0.5 + 0.5) = ${Q1_R.toFixed(1)} mΩ. Both contacts and both leads sit in the force loop, so each is counted twice; the error is 100%.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 4 线（Kelvin）测量，哪一组说法正确？①感测线几乎不走电流 ②Rc、Rlead 不在感测回路里，读数不受它们影响 ③残余误差来自热电势与感测输入偏置，教学上可以忽略 ④加压线也没有电阻',
      'About 4-wire (Kelvin) measurement, which combination is correct? ① sense lines carry almost no current ② Rc and Rlead are outside the sense loop, so they do not affect the reading ③ residual error from thermal EMF and sense bias is negligible for teaching ④ the force lines have no resistance',
    ),
    options: [
      { id: 'a', text: loc('①②', '① and ②') },
      { id: 'b', text: loc('①②③', '① ② and ③') },
      { id: 'c', text: loc('②④', '② and ④') },
    ],
    answer: 'b',
    explain: loc(
      '①②③ 正确。④ 错：加压线有电阻，电流经过它时会产生压降，正因为压降在加压回路里，才要用感测线绕开它。',
      '① ② and ③ are correct. ④ is wrong: the force lines do have resistance and drop voltage under current; that is why the sense lines bypass them.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('为什么不能靠加大测试电流来提高毫欧测量的准确度？', 'Why can’t a larger test current improve the accuracy of a milliohm measurement?'),
    options: [
      { id: 'a', text: loc('欧姆定律是线性的：I 增大时 V 同比例变大，接触和引线造成的误差比例不变，还会引入发热与电感问题', 'Ohm’s law is linear: as I grows, V grows in the same ratio, so the contact and lead error stays the same in proportion, and heating and inductance problems appear') },
      { id: 'b', text: loc('电流越大，电阻读数越准，因为分辨率按电流成比例提高', 'A larger current makes the resistance reading more accurate, because resolution grows with current') },
      { id: 'c', text: loc('大电流会让接触电阻变成零', 'High current makes the contact resistance zero') },
    ],
    answer: 'a',
    explain: loc(
      '接触与引线电阻造成的误差是比例误差：它们和 DUT 串联，电流对它们和对 DUT 的作用一样，比值不变。所以正确做法是用 4 线去掉这部分误差，而不是加大电流。',
      'The contact and lead error is a ratio error: they are in series with the DUT, so current acts on them and on the DUT alike and the ratio does not change. The fix is 4-wire sensing that removes this part, not more current.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '测试电压 V = 1000 V，夹具绝缘电阻 R_ins = 1e11 Ω，不计湿度。夹具漏电电流约是多少？',
      'Test voltage V = 1000 V, fixture insulation R_ins = 1e11 Ω, humidity ignored. About how large is the fixture leakage current?',
    ),
    options: [
      { id: 'a', text: loc('1 nA', '1 nA') },
      { id: 'b', text: loc(fmtAmp(Q4_I), fmtAmp(Q4_I)) },
      { id: 'c', text: loc('100 nA', '100 nA') },
    ],
    answer: 'b',
    explain: loc(
      `I_fix = V / R_ins = 1000 / 1e11 = 1e-8 A，即 ${fmtAmp(Q4_I)}。电压是 1000 V，绝缘电阻是 100 GΩ，所以漏电是 10 nA。`,
      `I_fix = V / R_ins = 1000 / 1e11 = 1e-8 A, which is ${fmtAmp(Q4_I)}. With 1000 V across 100 GΩ the leakage is 10 nA.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('DUT 的 Idss = 20 nA，夹具漏电 10 nA 同时流过电流表，测得电流的误差约是多少？', 'DUT Idss = 20 nA and fixture leakage of 10 nA also flows through the ammeter. About what is the error of the measured current?'),
    options: [
      { id: 'a', text: loc('10%', '10%') },
      { id: 'b', text: loc('100%', '100%') },
      { id: 'c', text: loc(`${Q5_ERR.toFixed(0)}%`, `${Q5_ERR.toFixed(0)}%`) },
    ],
    answer: 'c',
    explain: loc(
      `误差 = I_fix / Idss = 10 / 20 = ${Q5_ERR.toFixed(0)}%。读数 30 nA，比真值 20 nA 多 50%。`,
      `Error = I_fix / Idss = 10 / 20 = ${Q5_ERR.toFixed(0)}%. The reading is 30 nA against a true 20 nA, which is 50% high.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('湿度从 40 %RH 升到 90 %RH，教学模型里绝缘电阻和夹具漏电大约会怎样变？', 'In the teaching model, how do insulation resistance and fixture leakage change when humidity rises from 40 %RH to 90 %RH?'),
    options: [
      { id: 'a', text: loc('绝缘电阻上升，漏电减小', 'Insulation resistance rises and leakage falls') },
      { id: 'b', text: loc('绝缘电阻约降为十分之一，夹具漏电约增大十倍', 'Insulation resistance falls to about one tenth and fixture leakage grows about tenfold') },
      { id: 'c', text: loc('不变，湿度只影响 DUT', 'No change; humidity only affects the DUT') },
    ],
    answer: 'b',
    explain: loc(
      '湿度因子 = 10^(−(90−40)/50) = 0.1，R_eff 降为 0.1 倍，漏电 V / R_eff 变为 10 倍。湿度与污染是夹具漏电的主要来源之一。',
      'Humidity factor = 10^(−(90−40)/50) = 0.1, so R_eff falls to 0.1 times and the leakage V / R_eff becomes 10 times larger. Humidity and contamination are a main source of fixture leakage.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '下列哪些措施能减小高压夹具漏电带来的误差？①打开 guard ②降低 Vtest ③提高湿度 ④换用绝缘电阻更高的夹具',
      'Which actions reduce the error from high-voltage fixture leakage? ① turn guard on ② lower Vtest ③ raise humidity ④ use a fixture with higher insulation resistance',
    ),
    options: [
      { id: 'a', text: loc('①②④', '① ② and ④') },
      { id: 'b', text: loc('①②', '① and ②') },
      { id: 'c', text: loc('③④', '③ and ④') },
    ],
    answer: 'a',
    explain: loc(
      '①②④ 有效：guard 把漏电分流，降压让 V / R 变小，高绝缘电阻让 R 变大。③ 错：湿度升高会降低绝缘电阻，使漏电变大。',
      '① ② and ④ work: guard diverts the leakage, lower voltage makes V / R smaller, and higher insulation resistance makes R larger. ③ is wrong: higher humidity lowers insulation resistance and increases leakage.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('“高压漏电都是 DUT 的”这句话对吗？', 'Is it right that “high-voltage leakage all belongs to the DUT”?'),
    options: [
      { id: 'a', text: loc('对，夹具没有绝缘电阻', 'Yes, fixtures have no insulation resistance') },
      { id: 'b', text: loc('对，只要 Vtest 足够低就没有夹具漏电', 'Yes, with a low enough Vtest there is no fixture leakage') },
      { id: 'c', text: loc('不对：夹具和线缆的绝缘电阻也会漏电，要用 guard 把它分流后才能测到 DUT 本身', 'No: fixture and cable insulation also leaks, and guard must divert it before the DUT itself can be measured') },
    ],
    answer: 'c',
    explain: loc(
      '夹具与 DUT 并联在同一个测试电压下，它们的漏电都会进电流表。误差来自夹具的那一部分，所以需要 guard、降压或换夹具，而不是把误差算到 DUT 头上。',
      'The fixture and DUT are in parallel under the same test voltage, so both leakages reach the ammeter. The error from the fixture must be removed with guard, a lower voltage or a better fixture; it cannot be blamed on the DUT.',
    ),
  },
]

export function contactVerdict(s: ContactState, a: ContactAnalysis): { title: LText; text: LText } {
  if (s.mode === '4w') {
    return {
      title: loc('4 线：读数就是 R_dut', '4-wire: the reading is R_dut'),
      text: fill(
        loc(
          '感测线几乎不走电流，Rc 与 Rlead 不进读数，测得 {r} mΩ，误差 {e}%。原因：加压压降留在加压回路里，感测端的电压就是 DUT 引脚上的电压。',
          'The sense lines carry almost no current, so Rc and Rlead stay out of the reading: {r} mΩ, error {e}%. Reason: the forcing drop stays in the force loop, and the sense voltage equals the voltage at the DUT pin.',
        ),
        { r: a.rMeasMohm.toFixed(2), e: a.errPct.toFixed(1) },
      ),
    }
  }
  if (a.err2wPct > ERR_LIMIT_PCT) {
    return {
      title: loc('2 线读数偏大', '2-wire reading is too high'),
      text: fill(
        loc(
          '2 线读数 {r} mΩ，比真值 {t} mΩ 多出 {d} mΩ，误差 {e}%。原因：Rc 与 Rlead 串进了加压又感测的同一回路。换成 4 线，感测线几乎不走电流，读数回到 {t} mΩ。',
          '2-wire reading {r} mΩ is {d} mΩ above the {t} mΩ truth, an error of {e}%. Reason: Rc and Rlead sit in the one loop used for both forcing and sensing. Switch to 4-wire: the sense lines carry almost no current, and the reading returns to {t} mΩ.',
        ),
        {
          r: a.r2wMohm.toFixed(2),
          t: RDUT_MOHM.toFixed(0),
          d: (a.r2wMohm - RDUT_MOHM).toFixed(2),
          e: a.err2wPct.toFixed(1),
        },
      ),
    }
  }
  return {
    title: loc('2 线误差在门槛内', '2-wire error is within the limit'),
    text: fill(
      loc(
        '2 线误差 {e}%，不超过教学门槛 {l}%。Rc + Rlead = {s} mΩ 很小，所以这次 2 线也够用；接触一变脏，误差就会跟着涨。',
        '2-wire error {e}% is within the teaching limit of {l}%. Rc + Rlead = {s} mΩ is small, so 2-wire is adequate this time; a dirty contact makes the error grow.',
      ),
      { e: a.err2wPct.toFixed(1), l: ERR_LIMIT_PCT.toFixed(0), s: (s.rcMohm + s.rleadMohm).toFixed(2) },
    ),
  }
}

export function hvVerdict(s: HvState, a: HvAnalysis): { title: LText; text: LText } {
  if (a.guardOn) {
    return {
      title: loc('guard 开：夹具漏电被分流', 'Guard on: fixture leakage is diverted'),
      text: loc(
        '夹具漏电记为 0，读数只剩 DUT 的 Idss。原因：guard 把夹具绝缘路径的测量端拉到加压电位，这条路径上两端电位相同，电流不流进电流表。',
        'Fixture leakage is taken as 0 and the reading is just the DUT Idss. Reason: guard holds the measuring end of the fixture insulation path at the forcing potential, so both ends are at the same potential and no current reaches the ammeter.',
      ),
    }
  }
  if (a.errPct > ERR_LIMIT_PCT) {
    return {
      title: loc('夹具漏电超过门槛', 'Fixture leakage exceeds the limit'),
      text: fill(
        loc(
          'I_fix = V / R_eff = {v} V / {r} = {i}，DUT Idss = {d}，误差 {e}%。原因：夹具绝缘电阻与 DUT 并联在同一个高压上，它的漏电也被电流表读走。开 guard，或降压、降湿度、换高绝缘夹具，才能让误差回到门槛内。',
          'I_fix = V / R_eff = {v} V / {r} = {i}, DUT Idss = {d}, error {e}%. Reason: the fixture insulation sits in parallel with the DUT at the same high voltage, so its leakage is also read by the ammeter. Turn guard on, or lower the voltage, humidity or use a higher-insulation fixture, to bring the error back within the limit.',
        ),
        {
          v: s.vtest.toFixed(0),
          r: fmtOhmHv(a.rEffOhm),
          i: fmtAmp(a.ifixA),
          d: fmtAmp(a.idssA),
          e: a.errPct.toFixed(0),
        },
      ),
    }
  }
  return {
    title: loc('高压误差在门槛内', 'High-voltage error is within the limit'),
    text: fill(
      loc(
        '夹具漏电 {i} 与 Idss 相比误差 {e}%，不超过教学门槛 {l}%。这一组设置下夹具可以不用 guard，但湿度或电压一升，误差就会超过门槛。',
        'Fixture leakage {i} gives an error of {e}% against Idss, within the teaching limit of {l}%. With these settings the fixture can work without guard, but raising the voltage or humidity will push the error over the limit.',
      ),
      { i: fmtAmp(a.ifixA), e: a.errPct.toFixed(1), l: ERR_LIMIT_PCT.toFixed(0) },
    ),
  }
}

function approx(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6
}

/** 四张任务卡：完成与否由当前设置和读数算出，重置后自动还原 */
export function taskItems(c: ContactState, ca: ContactAnalysis, h: HvState, ha: HvAnalysis): TaskItem[] {
  return [
    { id: 'rc-rlead-half', text: S.task1, done: approx(c.rcMohm, 0.5) && approx(c.rleadMohm, 0.5) },
    { id: 'two-wire-5pct', text: S.task2, done: ca.err2wPct <= ERR_LIMIT_PCT + 1e-9 },
    { id: 'guard-recover', text: S.task3, done: approx(h.vtest, 1000) && h.rinsExp === 11 && h.idssNa === 20 && h.guard === 'on' },
    { id: 'hv-within-limit', text: S.task4, done: ha.errPct <= ERR_LIMIT_PCT + 1e-9 },
  ]
}
