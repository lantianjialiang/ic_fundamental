import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { energyPerBitJ } from './core/photonics'
import {
  ROLE_CHOICES,
  TEST_ANSWER,
  WHY_ANSWER,
  WHY_IDS,
  stageChoices,
  type BlockId,
  type OverviewAnalysis,
  type OverviewState,
  type RoleId,
  type StageId,
  type TestId,
  type WhyId,
} from './picOverviewModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

function joinText(a: LText, b: LText): LText {
  return { zh: `${a.zh} ${b.zh}`, en: `${a.en ?? a.zh} ${b.en ?? b.zh}` }
}

const pjOf = (powerW: number, rateTbps: number) => (energyPerBitJ(powerW, rateTbps * 1e12) * 1e12).toFixed(2)

export const CHOICE_LABEL: Record<string, LText> = {
  dc: loc('只传输直流功率', 'Carries DC power only'),
  light: loc('在片上导光和处理光', 'Guides and processes light on chip'),
  drive: loc('驱动调制器并接收光电流', 'Drives modulators and receives photocurrent'),
  laser: loc('提供外置激光', 'Provides the external laser'),
  attach: loc('把光纤阵列贴到芯片上', 'Attaches the fiber array to the chip'),
  packets: loc('交换数据包', 'Switches packets'),
  span: loc('把光传到远处', 'Carries light over a distance'),
  couple: loc('把光纤模场耦合进波导', 'Couples the fiber mode into the waveguide'),
  encode: loc('把数据写到光上', 'Writes data onto the light'),
}

export const ROLE_TITLE: Record<RoleId, LText> = {
  pic: loc('PIC', 'PIC'),
  eic: loc('EIC', 'EIC'),
  els: loc('ELS', 'ELS'),
  fau: loc('FAU', 'FAU'),
  asic: loc('交换 ASIC', 'Switch ASIC'),
  fiber: loc('光纤', 'Fiber'),
  gc: loc('光栅耦合器', 'Grating coupler'),
  mod: loc('调制器', 'Modulator'),
}

export const TEST_TITLE: Record<TestId, LText> = {
  cutback: loc('波导 cut-back', 'Waveguide cut-back'),
  dark: loc('PD 暗电流', 'PD dark current'),
  kgd: loc('已知良好裸片筛选', 'Known-good-die screen'),
  loop: loc('光引擎回环', 'Optical-engine loopback'),
  align: loc('FAU 主动对准', 'FAU active alignment'),
  sys: loc('与交换 ASIC 的链路', 'Link with the switch ASIC'),
}

export const STAGE_LABEL: Record<StageId, LText> = {
  wafer: loc('晶圆级', 'Wafer'),
  kgd: loc('KGD', 'KGD'),
  engine: loc('光引擎', 'Optical engine'),
  package: loc('封装级', 'Package'),
}

export const WHY_LABEL: Record<WhyId, LText> = {
  brighter: loc('激光在短走线上更亮', 'The laser is brighter on a short trace'),
  loss: loc('损耗随速率增大，短的电通道需要的均衡更少', 'Loss grows with rate, so a shorter electrical path needs less equalization'),
  fiber: loc('短走线让光纤没有损耗', 'A short trace makes the fiber lossless'),
}

export const WHY_OPTIONS = WHY_IDS.map((id) => ({ id, label: WHY_LABEL[id] }))

export function roleOptions(id: RoleId) {
  return ROLE_CHOICES[id].map((choice) => ({ id: choice, label: CHOICE_LABEL[choice] }))
}

export function stageOptions(id: TestId) {
  return stageChoices(TEST_ANSWER[id]).map((stage) => ({ id: stage, label: STAGE_LABEL[stage] }))
}

export const BLOCK_FIG: Record<BlockId, { title: LText; sub: LText }> = {
  asic: { title: loc('交换 ASIC', 'Switch ASIC'), sub: loc('数据包', 'Packets') },
  engine: { title: loc('光引擎', 'Optical engine'), sub: loc('PIC+EIC', 'PIC+EIC') },
  els: { title: loc('ELS', 'ELS'), sub: loc('外置激光', 'Laser') },
  fau: { title: loc('FAU', 'FAU'), sub: loc('光纤阵列', 'Fiber array') },
}

export const BLOCK_ASIDE: Record<BlockId, LText> = {
  asic: loc(
    '交换 ASIC 负责转发数据包。它和光引擎之间的电通道要到共封装之后才存在，所以在封装级用高速电学仪器测。原因：这条通道只有两边装到一起才成形。',
    'The switch ASIC forwards packets. The electrical channel to the optical engine exists only after co-packaging, so it is tested at package level with high-speed electrical instruments. Reason: that channel is formed only when the two parts are assembled.',
  ),
  engine: loc(
    '光引擎是 PIC 加 EIC：PIC 导光并调制，EIC 驱动调制器并接收光电流。它在两者组装之后、交给交换 ASIC 之前测试。原因：这时还能返修；装上昂贵的 ASIC 之后，报废成本高得多。',
    'The optical engine is the PIC plus the EIC: the PIC guides and modulates light, and the EIC drives the modulators and receives the photocurrent. It is tested after those two are assembled and before they are committed to the switch ASIC. Reason: repair is still practical; scrapping an expensive ASIC later costs much more.',
  ),
  els: loc(
    'ELS 是外置激光源，把大功率激光留在发热的 ASIC 外面。激光模块单独测 L-I 曲线和波长，耦合进封装后再在封装级核对功率。原因：激光器不是 PIC 晶圆上的一部分。',
    'The ELS is the external laser source, so the high-power laser stays off the hot ASIC. The laser module is tested on its own for the L-I curve and the wavelength, and the coupled power is checked again at package level. Reason: the laser is not part of the PIC wafer.',
  ),
  fau: loc(
    'FAU 是光纤阵列，把一排光纤对准到光栅耦合器。光纤在封装阶段才贴上，所以在封装级做主动对准并读耦合损耗。原因：光纤要等封装才在位。',
    'The FAU is the fiber array that aligns a row of fibers to the grating couplers. The fibers are attached at package, so active alignment and the coupling loss are tested at package level. Reason: the fibers are not in place until package.',
  ),
}

export const S = {
  kickerNow: loc('这一块', 'This block'),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  introTitle: loc('为什么把光引擎挪到交换芯片旁边', 'Why the optical engine moves next to the switch'),
  coreTitle: loc('点一块：它做什么，在哪一级测', 'Pick a block: what it does, and where it is tested'),
  coreNote: loc(
    '从左到右是交换 ASIC、光引擎（PIC+EIC）、外置激光源 ELS、光纤阵列 FAU。点一块，右边写出它的职责和测试阶段。能耗用功率除以比特率。',
    'Left to right: the switch ASIC, the optical engine (PIC+EIC), the external laser ELS, and the fiber array FAU. Pick a block to read its job and the test stage. Energy uses power divided by bit rate.',
  ),
  powerLabel: loc('光引擎电功率', 'Optical-engine electrical power'),
  rateLabel: loc('总速率', 'Aggregate rate'),
  rPj: loc('每比特能量', 'Energy per bit'),
  rJoule: loc('每比特能量（J）', 'Energy per bit (J)'),
  roleTitle: loc('八个角色', 'Eight roles'),
  roleNote: loc(
    '先点一张卡片，再用下面的分段选择它的角色。每组的第一项都不是答案，八张都选对才算完成。',
    'Pick a card, then set its role with the segmented control. The first choice of each group is not the answer; the task is done when all eight are correct.',
  ),
  rolePick: loc('这张卡片的角色', 'Role of this card'),
  stageTitle: loc('六个测试项落在哪一级', 'Which stage each of the six tests belongs to'),
  stageNote: loc(
    '晶圆级、KGD、光引擎、封装级。同样先点卡片，再选阶段。第一项不是该卡片的答案。',
    'Wafer, KGD, optical engine, or package. Pick a card, then choose the stage. The first choice is not that card’s answer.',
  ),
  stagePick: loc('这项测试的阶段', 'Stage of this test'),
  whyTitle: loc('为什么更短的电通道能降低均衡功耗', 'Why a shorter electrical channel cuts equalizer power'),
  whyLabel: loc('原因', 'Reason'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '波长、dB 和器件在后面的课里展开。电通道损耗随速率增大，见 {@hsChannel}。',
    'Wavelength, dB and the devices are expanded in later lessons. Electrical-channel loss grows with rate; see {@hsChannel}.',
  ),
  next: loc('下一课：波长、功率与 dB', 'Next: wavelength, power and dB'),
  task1: loc(
    '把功率设为 10 W、速率设为 1.6 Tbps，读出每比特能量（应为 6.25 pJ/bit）。',
    'Set the power to 10 W and the rate to 1.6 Tbps, and read the energy per bit (it should be 6.25 pJ/bit).',
  ),
  task2: loc(
    '给 PIC、EIC、ELS、FAU、交换 ASIC、光纤、光栅耦合器、调制器八张卡片都选上正确角色。',
    'Set the correct role on all eight cards: PIC, EIC, ELS, FAU, switch ASIC, fiber, grating coupler and modulator.',
  ),
  task3: loc(
    '把六个测试项分别配到晶圆级、KGD、光引擎或封装级。',
    'Match the six test items to wafer, KGD, optical-engine or package stage.',
  ),
  task4: loc(
    '选择“更短的电通道为什么能降低均衡功耗”的物理原因：损耗随速率增大，所以需要的均衡更少。',
    'Choose the physical reason a shorter electrical channel cuts equalizer power: loss grows with rate, so less equalization is needed.',
  ),
  energyLine: loc(
    '当前 {p} W、{r} Tbps，每比特能量是 {pj} pJ/bit。原因：每比特能量 = 功率 / 比特率，焦耳再乘 10^12 就是 pJ/bit。',
    'At {p} W and {r} Tbps the energy is {pj} pJ/bit. Reason: energy per bit = power / bit rate, and multiplying joules by 10^12 gives pJ/bit.',
  ),
  whyHead: loc('短电通道降低均衡功耗', 'A short electrical path cuts equalizer power'),
  whyText: loc(
    '电通道变短能降低均衡功耗，是因为损耗随速率增大，短通道留下的损耗更小，均衡器要补的也更少。当前 {p} W、{r} Tbps 对应 {pj} pJ/bit，因为每比特能量 = 功率 / 比特率。',
    'A shorter electrical channel cuts equalizer power because loss grows with rate, so a short channel leaves less loss and the equalizer has less to undo. At {p} W and {r} Tbps the energy is {pj} pJ/bit, because energy per bit = power / bit rate.',
  ),
  figAria: loc('共封装光学的四个方块，当前选中 {name}', 'Four co-packaged-optics blocks, selected: {name}'),
  figSelected: loc('当前选中：{name}。方块的描边表示选中，名称写在方块里。', 'Selected: {name}. The outline marks the selection; the name is written in the block.'),
  hitAria: loc('选择{name}', 'Select {name}'),
}

export const INTRO = [
  loc(
    '电互连的损耗随速率上升，均衡器要用更多功耗把眼图睁开。速率和端口一多，交换 ASIC 边缘的电通道就又挤又烫。把光引擎挪到 ASIC 旁边，电通道只剩很短的一截，这就是共封装光学（CPO）。',
    'Electrical loss grows with data rate, so the equalizer spends more power opening the eye. With more rate and more ports, the electrical channel at the edge of a switch ASIC gets crowded and hot. Co-packaged optics (CPO) puts the optical engine next to the ASIC so that electrical hop is only a short trace.',
  ),
  loc(
    '可插拔模块的电通道要穿过整块板。近封装光学（NPO）把光引擎放到 ASIC 附近的基板上，电通道已经变短，但还没有和 ASIC 封在同一个壳体里。CPO 更近：光引擎（PIC+EIC）和交换 ASIC 共封装。外置激光源（ELS）供电，光纤阵列（FAU）把光纤对准到芯片上。',
    'A pluggable module keeps an electrical path across the board. Near-packaged optics (NPO) puts the optical engine on a substrate near the ASIC, so the electrical path is already shorter, but it is not in the same package as the ASIC. CPO is closer: the optical engine (PIC+EIC) shares the package with the switch ASIC. An external laser source (ELS) supplies the light, and a fiber array unit (FAU) aligns the fibers to the chip.',
  ),
  loc(
    '光链路是激光、调制器、光纤、探测器和 TIA。测试不能只用电学：晶圆上要光学探针，组装后要光纤对准，而且越晚发现坏件，越可能赔上昂贵的 ASIC。电通道损耗的背景见 {@hsChannel}。',
    'An optical link is a laser, a modulator, fiber, a photodetector and a TIA. Test cannot be electrical only: the wafer needs an optical probe, and after assembly the fibers must be aligned. A defect found later can scrap an expensive ASIC. The electrical-loss background is in {@hsChannel}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '光互连没有损耗。光栅、波导、调制器和连接器都有 dB 损耗，只是不随电速率的平方恶化。',
    'An optical link has no loss. Gratings, the waveguide, the modulator and the connectors all have loss in dB; it just does not worsen with the square of the electrical rate.',
  ),
  loc(
    'CPO 就是把可插拔模块做小。可插拔、NPO 和 CPO 的差别是电通道有多长、光引擎什么时候和 ASIC 绑在一起，不是外壳尺寸。',
    'CPO is a smaller pluggable module. Pluggable, NPO and CPO differ in how long the electrical channel is and when the optical engine is tied to the ASIC, not in the size of the shell.',
  ),
  loc(
    '测试只需要电学。PIC 要光学激励和光纤接触，对准时间往往比电学项目更长，返修也更难。',
    'Test needs only electrical instruments. A PIC needs an optical stimulus and a fiber contact. Alignment often takes longer than the electrical items, and repair is harder.',
  ),
]

export const TAKEAWAY: LText = loc(
  'CPO 把光引擎（PIC+EIC）放到交换 ASIC 旁边，缩短电通道，从而少花均衡功耗，因为电损耗随速率增大。ELS 提供激光，FAU 完成光纤对准。每比特能量 = 功率 / 比特率，pJ/bit = 焦耳 × 10^12。测试要同时有光学接触和高速电学，并且尽量在装上 ASIC 之前完成。',
  'CPO places the optical engine (PIC+EIC) next to the switch ASIC. The shorter electrical channel needs less equalizer power, because electrical loss grows with rate. The ELS supplies the laser and the FAU aligns the fibers. Energy per bit = power / bit rate, and pJ/bit = joules times 10^12. Test needs both an optical contact and high-speed electrical instruments, and it should finish before the ASIC is committed.',
)

const PJ_10 = pjOf(10, 1.6)
const PJ_4 = pjOf(4, 0.8)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('光引擎电功率 10 W、总速率 1.6 Tbps，每比特能量是多少？', 'The optical engine uses 10 W at 1.6 Tbps. What is the energy per bit?'),
    options: [
      { id: 'a', text: loc(`${PJ_10} pJ/bit`, `${PJ_10} pJ/bit`) },
      { id: 'b', text: loc('16.0 pJ/bit', '16.0 pJ/bit') },
      { id: 'c', text: loc('0.16 pJ/bit', '0.16 pJ/bit') },
    ],
    answer: 'a',
    explain: loc(
      `每比特能量 = 10 W / 1.6×10^12 bit/s = ${PJ_10}×10^-12 J，也就是 ${PJ_10} pJ/bit。pJ/bit 等于焦耳乘 10^12。`,
      `Energy per bit = 10 W / 1.6e12 bit/s = ${PJ_10}e-12 J, which is ${PJ_10} pJ/bit. pJ/bit equals joules times 1e12.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('4 W、0.8 Tbps 的每比特能量是多少？', 'What is the energy per bit at 4 W and 0.8 Tbps?'),
    options: [
      { id: 'a', text: loc(`${PJ_4} pJ/bit`, `${PJ_4} pJ/bit`) },
      { id: 'b', text: loc('3.20 pJ/bit', '3.20 pJ/bit') },
      { id: 'c', text: loc('0.20 pJ/bit', '0.20 pJ/bit') },
    ],
    answer: 'a',
    explain: loc(
      `4 / 0.8e12 J = ${PJ_4} pJ/bit。功率减半、速率也减半时，每比特能量可以不变；这里 4 W 比 10 W 降得更多，所以是 ${PJ_4} 而不是 6.25。`,
      `4 / 0.8e12 J = ${PJ_4} pJ/bit. Halving both power and rate can leave the energy per bit unchanged; here the power fell by more than the rate, so the result is ${PJ_4} rather than 6.25.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '关于可插拔模块、NPO 和 CPO，下列哪些说法正确？(1) CPO 把光引擎放在交换 ASIC 旁边，电通道很短；(2) NPO 和 CPO 只是更小的可插拔模块的两个名字；(3) 可插拔模块的电通道要穿过电路板；(4) 改成光互连之后所有损耗都消失。',
      'Which of these statements about pluggable modules, NPO and CPO are correct? (1) CPO places the optical engine beside the switch ASIC, so the electrical channel is short; (2) NPO and CPO are two names for a smaller pluggable module; (3) a pluggable module keeps an electrical path across the board; (4) moving to optics removes every loss.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (3) 是三种做法的差别：电通道有多长。(2) 错：NPO 还没有和 ASIC 封在一起。(4) 错：光栅、波导和连接器仍有 dB 损耗。',
      '(1) and (3) are the real difference: how long the electrical channel is. (2) is wrong: NPO is not yet in the same package as the ASIC. (4) is wrong: gratings, the waveguide and connectors still have loss in dB.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于角色，下列哪些说法正确？(1) PIC 在片上导光和处理光；(2) ELS 是外置激光源；(3) FAU 负责交换数据包；(4) EIC 驱动调制器并接收光电流。',
      'Which of these statements about the roles are correct? (1) The PIC guides and processes light on chip; (2) the ELS is the external laser source; (3) the FAU switches packets; (4) the EIC drives the modulators and receives the photocurrent.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      'PIC 管光，EIC 管电驱动和接收，ELS 提供激光。FAU 是光纤阵列，用来对准，不交换数据包；交换是 ASIC 的工作。',
      'The PIC handles light, the EIC handles the electrical drive and the receiver, and the ELS supplies the laser. The FAU is the fiber array used for alignment; it does not switch packets. Switching is the ASIC.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('更短的电通道为什么能降低均衡功耗？', 'Why does a shorter electrical channel cut equalizer power?'),
    options: [
      { id: 'a', text: loc('激光在短走线上更亮', 'The laser is brighter on a short trace') },
      { id: 'b', text: loc('损耗随速率增大，短通道需要的均衡更少', 'Loss grows with rate, so a short channel needs less equalization') },
      { id: 'c', text: loc('短走线让光纤没有损耗', 'A short trace makes the fiber lossless') },
    ],
    answer: 'b',
    explain: loc(
      '电通道的损耗随速率增大，均衡器要用功耗把损失的高频补回来。通道短，留下的损耗小，均衡功耗就低。这和激光亮度、光纤有没有损耗不是一回事。',
      'Electrical-channel loss grows with rate, and the equalizer spends power restoring the lost high frequencies. A short channel leaves less loss, so the equalizer uses less power. That is separate from laser brightness and from whether the fiber has loss.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('光引擎最合适在什么时候测？', 'When is the optical engine best tested?'),
    options: [
      { id: 'a', text: loc('封进交换 ASIC 之后，因为必须有 ASIC 才能测', 'After it is sealed with the switch ASIC, because the ASIC must be present') },
      { id: 'b', text: loc('PIC 和 EIC 组装之后、交给 ASIC 之前，因为晚发现会报废昂贵的 ASIC', 'After the PIC and EIC are assembled and before the ASIC, because a late fail scraps an expensive ASIC') },
      { id: 'c', text: loc('只在晶圆上，因为光引擎是一颗裸片', 'Only on the wafer, because the optical engine is one die') },
    ],
    answer: 'b',
    explain: loc(
      '光引擎是 PIC 和 EIC 组装后的组件，晶圆级还看不到这个组合。等到和 ASIC 共封装再发现缺陷，报废的是整个昂贵封装。',
      'The optical engine is the PIC and EIC after they are assembled, so wafer test cannot see that assembly. A defect found only after co-packaging with the ASIC scraps the whole expensive package.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('CPO 的测试资源，哪句对？', 'Which statement about CPO test resources is right?'),
    options: [
      { id: 'a', text: loc('只用电学就够，光只是载波', 'Electrical test is enough, because light is only a carrier') },
      { id: 'b', text: loc('要同时有光学接触和高速电学，因为光引擎在两种信号之间转换', 'Both an optical contact and high-speed electrical instruments are required, because the engine converts between the two') },
      { id: 'c', text: loc('光纤对准可以省掉，光栅耦合器很宽', 'Fiber alignment can be skipped, because the grating coupler is wide') },
    ],
    answer: 'b',
    explain: loc(
      '调制和探测发生在光和电的界面上。没有光纤接触就读不到光，没有高速电学就驱动不了 EIC。对准公差虽然比边缘耦合宽，但仍然要对准。',
      'Modulation and detection sit on the optical-electrical boundary. Without a fiber contact there is no optical reading, and without high-speed electrical instruments the EIC cannot be driven. The alignment tolerance is wider than edge coupling, but alignment is still required.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于每比特能量，下列哪些说法正确？(1) 每比特能量 = 功率 / 比特率；(2) pJ/bit = 焦耳 × 10^12；(3) 同样的功率下，比特率更高则每比特能量更高；(4) 10 W、1.6 Tbps 是 6.25 pJ/bit。',
      'Which of these statements about energy per bit are correct? (1) Energy per bit = power / bit rate; (2) pJ/bit = joules times 10^12; (3) at the same power, a higher bit rate raises the energy per bit; (4) 10 W at 1.6 Tbps is 6.25 pJ/bit.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      `(1)(2)(4) 就是定义和 10/1.6 的结果，数值是 ${PJ_10} pJ/bit。(3) 反了：分母变大，每比特能量下降。`,
      `(1), (2) and (4) are the definition and the result of 10/1.6, which is ${PJ_10} pJ/bit. (3) is reversed: a larger denominator lowers the energy per bit.`,
    ),
  },
]

export function taskItems(analysis: OverviewAnalysis): TaskItem[] {
  return [
    { id: 'energy', text: S.task1, done: analysis.task1 },
    { id: 'roles', text: S.task2, done: analysis.rolesOk },
    { id: 'stages', text: S.task3, done: analysis.stagesOk },
    { id: 'why', text: S.task4, done: analysis.task4 },
  ]
}

export function verdictOf(state: OverviewState, analysis: OverviewAnalysis): { title: LText; text: LText } {
  const nums = {
    pj: analysis.pj.toFixed(2),
    p: Number.isInteger(state.powerW) ? String(state.powerW) : state.powerW.toFixed(1),
    r: state.rateTbps.toFixed(1),
  }
  const block = BLOCK_ASIDE[state.block]
  if (state.why === WHY_ANSWER) return { title: S.whyHead, text: joinText(fill(S.whyText, nums), block) }
  return { title: BLOCK_FIG[state.block].title, text: joinText(block, fill(S.energyLine, nums)) }
}
