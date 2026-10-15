import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { VTN } from '../model'

/** BJT / MOS 对比图的示意参数 */
export const BETA = 100
export const IB = 50e-6
export const CGS = 1e-9
export const VG = 3.3

export const CMP_HEAD = {
  item: loc('对比项', 'Aspect'),
  bjt: loc('三极管 BJT（NPN）', 'BJT (NPN)'),
  mos: loc('MOS 管（NMOS）', 'MOSFET (NMOS)'),
}

export type CmpId = 'ctrl' | 'law' | 'input' | 'drive' | 'drop' | 'use'

export const CMP: Array<{ id: CmpId; k: LText; bjt: LText; mos: LText; why: LText }> = [
  {
    id: 'ctrl',
    k: loc('控制量', 'Controlled by'),
    bjt: loc('基极电流 IB（电流控制）', 'Base current IB (current-controlled)'),
    mos: loc('栅源电压 Vgs（电压控制）', 'Gate-source voltage Vgs (voltage-controlled)'),
    why: loc(
      'BJT 的基极和发射极之间是一个正偏的 PN 结，要往里注入载流子才能开，所以控制它的是电流；MOS 的栅极被栅氧隔开，只能靠电场吸引载流子，所以控制它的是电压。',
      'A BJT’s base-emitter is a forward-biased PN junction that must have carriers injected to turn on, so current controls it. A MOSFET’s gate is insulated by oxide and can only attract carriers with its electric field, so voltage controls it.',
    ),
  },
  {
    id: 'law',
    k: loc('输出关系', 'Output law'),
    bjt: loc('IC = β·IB，β 约 50–300', 'IC = β·IB, β about 50–300'),
    mos: loc('Vgs 超过 Vth 后才有 Id，Id 随 Vgs 增大', 'Id appears only once Vgs passes Vth and grows with Vgs'),
    why: loc(
      'BJT 是“放大电流”：基极每多 1 µA，集电极多 β µA。MOS 是“电压换电流”：没有沟道就没有电流，所以有一个 Vth 门槛，之后的曲线在三种工作状态那一课细讲。',
      'A BJT amplifies current: every extra 1 µA into the base gives β µA more at the collector. A MOSFET converts voltage into current: no channel means no current, hence the Vth threshold; the curves beyond it are covered in the operating-regions lesson.',
    ),
  },
  {
    id: 'input',
    k: loc('输入电流', 'Input current'),
    bjt: loc('导通期间基极一直取电流', 'The base draws current the whole time it is on'),
    mos: loc('直流几乎为 0，但栅极有电容', 'Almost zero at DC, but the gate has capacitance'),
    why: loc(
      'BJT 的基极电流就是控制信号本身，停了管子就关。MOS 的栅氧是绝缘体，直流电流只有极小的漏电；但栅极和沟道构成电容，改变 Vgs 时必须充放电 Q = C·V，这一瞬间会有电流。',
      'A BJT’s base current is the control signal itself; stop it and the transistor turns off. A MOSFET’s gate oxide is an insulator, so only a tiny leakage flows at DC; but the gate and channel form a capacitor that must be charged or discharged by Q = C·V whenever Vgs changes, which takes current in that moment.',
    ),
  },
  {
    id: 'drive',
    k: loc('驱动功耗', 'Drive power'),
    bjt: loc('持续供 IB，导通越久耗得越多', 'IB must be supplied continuously; longer on-time costs more'),
    mos: loc('只在开关瞬间耗电，频率越高耗得越多', 'Costs power only while switching; more at higher frequency'),
    why: loc(
      '因为 MOS 静态时栅极不取电流，几十亿只 MOS 管的芯片才能在不翻转时几乎不耗电；翻转时每次都要给栅电容充放电，所以动态功耗随频率上升，见 CMOS 反相器一课。',
      'Because a MOSFET gate draws no static current, a chip with billions of transistors uses almost no power when nothing toggles; each toggle charges and discharges gate capacitance, so dynamic power rises with frequency, as shown in the CMOS inverter lesson.',
    ),
  },
  {
    id: 'drop',
    k: loc('导通压降', 'On-state drop'),
    bjt: loc('饱和时 VCE(sat) 约 0.1–0.3 V', 'VCE(sat) about 0.1–0.3 V when saturated'),
    mos: loc('像一个电阻：Vds = Id · Rds(on)', 'Behaves like a resistor: Vds = Id · Rds(on)'),
    why: loc(
      'BJT 饱和后总留着一个 PN 结相关的压降；MOS 导通后是一条沟道电阻，没有固定压降，Rds(on) 做得够小时压降可以远低于 0.1 V，所以电源开关多用 MOS。',
      'A saturated BJT always keeps a junction-related drop; a conducting MOSFET is a channel resistance with no fixed drop, and with a small enough Rds(on) the drop can be far below 0.1 V, which is why power switches mostly use MOSFETs.',
    ),
  },
  {
    id: 'use',
    k: loc('常见用途', 'Typical use'),
    bjt: loc('模拟放大、小信号开关、继电器驱动', 'Analog amplifiers, small-signal switches, relay drivers'),
    mos: loc('数字芯片（CMOS 逻辑）、电源开关、负载开关', 'Digital chips (CMOS logic), power switches, load switches'),
    why: loc(
      'MOS 静态不取电流、尺寸可以做得极小，所以芯片里的逻辑几乎全是 CMOS；BJT 的跨导高、匹配好，仍常用在模拟电路和简单驱动里。',
      'MOSFETs draw no static gate current and shrink extremely well, so on-chip logic is almost all CMOS; BJTs offer high transconductance and good matching, so they remain common in analog circuits and simple drivers.',
    ),
  },
]

export const CMP_FIG = {
  bjtTitle: loc('BJT：电流控制', 'BJT: current-controlled'),
  mosTitle: loc('MOS：电压控制', 'MOSFET: voltage-controlled'),
  gateDc: loc('直流 IG ≈ 0', 'DC IG ≈ 0'),
  baseDc: loc('基极一直取电流', 'Base current flows all the time'),
  gateCap: loc('栅氧是绝缘体，只有电容', 'Gate oxide insulates: only capacitance'),
  illustr: loc(
    `示意参数：β = ${BETA}，栅电容 Cgs = 1 nF（板级功率管的量级），Vgs = ${VG} V。`,
    `Illustrative values: β = ${BETA}, gate capacitance Cgs = 1 nF (board-level power MOSFET range), Vgs = ${VG} V.`,
  ),
}

export const CMP_LINE = loc(
  '一句话：BJT 要一直“喂”电流，MOS 只要“给电压”，但改变电压时要先给栅电容充电。开关有多快，取决于驱动能多快把这些电荷送进去，见 {@mosDynamic}。',
  'In one line: a BJT must be fed current continuously, a MOSFET only needs a voltage, but changing that voltage first charges the gate capacitance. How fast it switches depends on how fast the driver can deliver that charge, see {@mosDynamic}.',
)

export const TAKEAWAY: LText[] = [
  loc('MOS 管是电压控制的开关：Vgs 超过 Vth，D–S 接通；低于 Vth，断开——因为栅压要够大才能在栅下吸出导电沟道。', 'A MOSFET is a voltage-controlled switch: above Vth D–S conducts, below Vth it is open, because the gate needs enough voltage to pull a conducting channel under it.'),
  loc('四个端子 G、D、S、B；Vgs 以 S 为参考。分立器件把 B 接到 S，所以只有 3 个脚。', 'Four terminals G, D, S, B; Vgs is referenced to S. Discrete parts tie B to S, so only 3 pins come out.'),
  loc('符号箭头指向沟道是 NMOS，指向外面是 PMOS；沟道线断开是增强型（常关），实线是耗尽型（常开）。', 'Arrow into the channel = NMOS, out of it = PMOS; a broken channel line = enhancement (normally off), a solid one = depletion (normally on).'),
  loc('SOT-23 典型 1 G、2 S、3 D；TO-220 印字面朝自己从左到右 G、D、S，金属片是 D。都只是“典型”，以数据手册为准。', 'SOT-23 is typically 1 G, 2 S, 3 D; TO-220 with the marked side toward you is G, D, S left to right, and the tab is D. Both are only typical; the datasheet decides.'),
  loc('BJT 靠基极电流控制（IC = β·IB）；MOS 靠栅压控制，栅极直流几乎不取电流，但有电容，开关时要充放电。', 'A BJT is controlled by base current (IC = β·IB); a MOSFET by gate voltage, with almost no DC gate current but a capacitance that must be charged when switching.'),
]

const Q4_IB = 20e-6
const Q4_BETA = 150
const q4mA = (Q4_IB * Q4_BETA * 1e3).toFixed(1)
const Q1_VGS = 0.4

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(`一只增强型 NMOS，Vth = ${VTN} V，现在 Vgs = ${Q1_VGS} V。D–S 之间是什么状态？`, `An enhancement NMOS has Vth = ${VTN} V and now Vgs = ${Q1_VGS} V. What is the D–S path?`),
    options: [
      { id: 'a', text: loc('断开（截止）', 'Open (off)') },
      { id: 'b', text: loc('接通（导通）', 'Closed (on)') },
      { id: 'c', text: loc('一半通一半断', 'Half open, half closed') },
    ],
    answer: 'a',
    explain: loc(`Vgs = ${Q1_VGS} V 低于 Vth = ${VTN} V，栅压不够在表面吸出沟道，D–S 之间没有导电通道，所以断开。`, `Vgs = ${Q1_VGS} V is below Vth = ${VTN} V, too little to pull a channel to the surface, so there is no conducting path and D–S is open.`),
  },
  {
    id: 'q2',
    prompt: loc('MOS 符号里体极的箭头从沟道指向外面，这是？', 'In a MOSFET symbol the body arrow points out of the channel. Which device is it?'),
    options: [
      { id: 'a', text: loc('NMOS', 'NMOS') },
      { id: 'b', text: loc('PMOS', 'PMOS') },
      { id: 'c', text: loc('NPN 三极管', 'NPN BJT') },
    ],
    answer: 'b',
    explain: loc('箭头沿 PN 结从 P 指向 N。PMOS 的沟道是 P 型、体是 N 型，所以箭头从沟道指向外；NMOS 正好相反，箭头指向沟道。', 'The arrow follows the PN junction from P to N. A PMOS has a P-type channel and an N-type body, so the arrow points out of the channel; an NMOS is the reverse and points in.'),
  },
  {
    id: 'q3',
    prompt: loc('SOT-23 小信号 MOS 管的典型引脚是？', 'What is the typical pinout of a SOT-23 small-signal MOSFET?'),
    options: [
      { id: 'a', text: loc('1 G、2 S、3 D', '1 G, 2 S, 3 D') },
      { id: 'b', text: loc('1 D、2 G、3 S', '1 D, 2 G, 3 S') },
      { id: 'c', text: loc('1 S、2 D、3 G', '1 S, 2 D, 3 G') },
    ],
    answer: 'a',
    explain: loc('典型是 1 G、2 S、3 D，单独在一边的 3 脚是漏极。但也有例外的型号，焊接前要对照数据手册。', 'Typically 1 G, 2 S, 3 D, with the lone pin 3 as drain. Some parts differ, so check the datasheet before soldering.'),
  },
  {
    id: 'q4',
    prompt: loc(`一只 NPN 的 β = ${Q4_BETA}，基极电流 IB = ${Q4_IB * 1e6} µA（在放大区），集电极电流约为？`, `An NPN has β = ${Q4_BETA} and base current IB = ${Q4_IB * 1e6} µA (in the active region). What is the collector current?`),
    options: [
      { id: 'a', text: loc(`${(Q4_IB * 1e6 / Q4_BETA).toFixed(2)} µA`, `${(Q4_IB * 1e6 / Q4_BETA).toFixed(2)} µA`) },
      { id: 'b', text: loc(`${q4mA} mA`, `${q4mA} mA`) },
      { id: 'c', text: loc('0，三极管不取电流', '0; a BJT draws no current') },
    ],
    answer: 'b',
    explain: loc(`IC = β·IB = ${Q4_BETA} × ${Q4_IB * 1e6} µA = ${q4mA} mA。BJT 是电流控制：基极必须一直有电流，集电极电流才跟着有。`, `IC = β·IB = ${Q4_BETA} × ${Q4_IB * 1e6} µA = ${q4mA} mA. A BJT is current-controlled: the base must carry current for the collector current to exist.`),
  },
  {
    id: 'q5',
    prompt: loc('一只耗尽型 NMOS（符号里沟道是实线），Vgs = 0 V 时 D–S 是什么状态？', 'A depletion NMOS (solid channel line in the symbol) has Vgs = 0 V. What is the D–S path?'),
    options: [
      { id: 'a', text: loc('断开，要加正 Vgs 才导通', 'Open; it needs a positive Vgs to conduct') },
      { id: 'b', text: loc('接通，要加负 Vgs 才关断', 'Closed; it needs a negative Vgs to turn off') },
      { id: 'c', text: loc('烧坏', 'Damaged') },
    ],
    answer: 'b',
    explain: loc('耗尽型在制造时就做好了沟道，所以 Vgs = 0 已经导通（常开）；NMOS 要把 Vgs 拉到负值，把沟道里的电子赶走，才关断。实线沟道正是表示“本来就有沟道”。', 'A depletion device has its channel built in, so it conducts at Vgs = 0 (normally on); an NMOS needs a negative Vgs to push the electrons out of the channel before it turns off. The solid channel line means “the channel is already there”.'),
  },
]
