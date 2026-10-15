import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerPart: loc('结构', 'Structure'),
  kickerSweep: loc('输入扫描', 'Input sweep'),
  kickerPhase: loc('分阶段', 'Phase by phase'),
  kickerNoise: loc('噪声容限', 'Noise margin'),
  kickerPower: loc('功耗', 'Power'),
  introTitle: loc('为什么从反相器开始', 'Why start with the inverter'),
  structTitle: loc('结构：PMOS 在上、NMOS 在下', 'Structure: PMOS on top, NMOS below'),
  structNote: loc('点下面的部件，图里会框出它的位置。', 'Click a part below and the figure outlines where it is.'),
  sweepTitle: loc('拖动输入电压，看两管怎么变', 'Drag the input and watch both transistors'),
  sweepNote: loc(
    '左边是电路，每个管子旁边写着它此刻的工作区和端电压；右边上图是电压传输特性 VTC，下图是从 VDD 直通到 GND 的电流。圆点是当前工作点。',
    'Left: the circuit, with each transistor’s present region and terminal voltages. Right, top: the voltage transfer characteristic (VTC); bottom: the current flowing straight from VDD to GND. The dot is the present operating point.',
  ),
  vin: loc('输入电压 Vin', 'Input voltage Vin'),
  vout: loc('输出 Vout', 'Output Vout'),
  idd: loc('直通电流 IDD', 'Shoot-through IDD'),
  gain: loc('增益 dVout/dVin', 'Gain dVout/dVin'),
  nReg: loc('NMOS 区域', 'NMOS region'),
  pReg: loc('PMOS 区域', 'PMOS region'),
  phase: loc('所处阶段', 'Phase'),
  phaseTitle: loc('逐帧：输入从 0 升到 VDD', 'Frame by frame: input rising from 0 to VDD'),
  phaseNote: loc(
    '每一帧把 Vin 停在一个阶段的典型值上。图和数字都由同一个模型算出来。',
    'Each frame parks Vin at a typical value inside one phase. The figure and numbers come from the same model.',
  ),
  satWin: loc('两管同时饱和的 Vin 范围', 'Vin range with both saturated'),
  phaseWhy: loc(
    '为什么说「四个阶段」：按「哪个管子导通、谁饱和」来分，两端各有一段只有一个管子导通（阶段 1、4），中间过渡区按「N 饱和 P 线性」和「N 线性 P 饱和」分成两段（阶段 2、3）。两段交界处的 VM 点两管同时饱和，理想模型（λ = 0）里它只是一个点，本模型里也只有几十毫伏宽（范围见下方读数），所以把它当成一个时刻单独看，不算第五个阶段。有的教材把它算作一段，就成了 A–E 五段，两种说法内容相同。',
    'Why “four phases”: split by which transistor conducts and which is saturated. At each end only one transistor conducts (phases 1 and 4); the transition in between splits into “N saturated, P linear” and “N linear, P saturated” (phases 2 and 3). At the boundary, the point VM, both are saturated. In the ideal model (λ = 0) that is a single point, and in this model it is only a few tens of millivolts wide (range in the readout below), so it is shown as one moment rather than a fifth phase. Some textbooks count it as a region and get five regions A–E; the content is the same.',
  ),
  noiseTitle: loc('VTC、开关阈值和噪声容限', 'VTC, switching threshold and noise margins'),
  noiseNote: loc(
    '左图在 VTC 上标出斜率为 −1 的两点（单位增益点），右图把前一级的输出电平和后一级的输入窗口并排放。选发送的电平，再加噪声，看后一级还认不认得。',
    'Left: the two points where the VTC slope is −1 (unity-gain points). Right: the previous stage’s output levels beside the next stage’s input windows. Pick the level being sent, add noise, and see whether the next stage still reads it correctly.',
  ),
  send1: loc('前级输出 1', 'Driver sends 1'),
  send0: loc('前级输出 0', 'Driver sends 0'),
  noise: loc('叠加的噪声', 'Added noise'),
  received: loc('后级收到', 'Receiver sees'),
  margin: loc('剩余容限', 'Margin left'),
  verdict: loc('判读', 'Read as'),
  readOk: loc('读对', 'Correct'),
  readBad: loc('不确定 / 读错', 'Undefined / wrong'),
  powerTitle: loc('静态功耗与动态功耗', 'Static and dynamic power'),
  powerNote: loc('先看功耗分哪几种，再用下面的旋钮算动态功耗。', 'First see what kinds of power there are, then use the knobs below to work out dynamic power.'),
  calcTitle: loc('P = C·V²·f 计算器', 'P = C·V²·f calculator'),
  cap: loc('翻转电容 C', 'Switched capacitance C'),
  volt: loc('电源电压 V', 'Supply voltage V'),
  freq: loc('翻转频率 f', 'Toggle frequency f'),
  pNow: loc('动态功耗 P', 'Dynamic power P'),
  pHalf: loc('电压减半后', 'With V halved'),
  eCycle: loc('每周期从电源取的能量 C·V²', 'Energy drawn per cycle C·V²'),
  iAvg: loc('平均电源电流 P/V', 'Average supply current P/V'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '芯片测试里的 VOH / VOL、IDD 见 DC 测试课；IDDQ 为什么能抓缺陷，见下面功耗一节。',
    'For VOH / VOL and IDD in chip test, see the DC test lessons; why IDDQ catches defects is in the power section below.',
  ),
  next: loc('下一课：用 MOS 管搭逻辑门', 'Next: Building gates from MOSFETs'),
}

export const INTRO: LText[] = [
  loc(
    '数字芯片里几乎每个逻辑门、触发器和输出驱动，拆开都是 CMOS 结构。最简单的 CMOS 电路就是反相器：一个 PMOS、一个 NMOS，输入 0 出 1，输入 1 出 0。',
    'Almost every gate, flip-flop and output driver in a digital chip is a CMOS structure underneath. The simplest CMOS circuit is the inverter: one PMOS and one NMOS; 0 in gives 1 out, 1 in gives 0 out.',
  ),
  loc(
    '上一课 {@mosSwitch} 说过：NMOS 传好 0，PMOS 传好 1。反相器正是把两者各用在擅长的一边：PMOS 负责把输出拉到 VDD，NMOS 负责拉到 GND。判断两个管子各处在什么区，用的是 {@mosRegion} 里的规则。',
    'The previous lesson {@mosSwitch} showed that NMOS passes a good 0 and PMOS a good 1. The inverter uses each where it is good: the PMOS pulls the output to VDD and the NMOS pulls it to GND. Telling which region each transistor is in uses the rules from {@mosRegion}.',
  ),
  loc(
    '这一课的数字都来自同一个教学模型（VDD = 3.3 V，Vtn = 0.7 V，Vtp = −0.7 V，KN = KP），所以开关阈值正好在 VDD/2。真实工艺里 PMOS 迁移率低，要把它做宽约 2–3 倍才能让 KP ≈ KN。',
    'All numbers here come from one teaching model (VDD = 3.3 V, Vtn = 0.7 V, Vtp = −0.7 V, KN = KP), so the switching threshold lands exactly at VDD/2. In a real process the PMOS has lower mobility, so it is made about 2–3 times wider to get KP ≈ KN.',
  ),
]

export type PartId = 'pmos' | 'nmos' | 'in' | 'out' | 'cl'

export const PARTS: Array<{ id: PartId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'pmos',
    title: loc('PMOS（上拉管）', 'PMOS (pull-up)'),
    sub: loc('源极和衬底接 VDD', 'Source and body to VDD'),
    text: loc(
      'PMOS 放在上面，源极接 VDD，衬底（n 阱）也接 VDD。衬底接最高电位，是为了让 p+ 源漏和 n 阱之间的 PN 结一直反偏、不漏电。它在 Vsg = VDD − Vin 大于 |Vtp| 时导通，所以输入为低时它把输出拉到 VDD。',
      'The PMOS sits on top with its source at VDD and its body (the n-well) also at VDD. The body goes to the highest potential so the PN junctions between the p+ source/drain and the n-well stay reverse-biased and do not leak. It conducts when Vsg = VDD − Vin exceeds |Vtp|, so a low input lets it pull the output to VDD.',
    ),
  },
  {
    id: 'nmos',
    title: loc('NMOS（下拉管）', 'NMOS (pull-down)'),
    sub: loc('源极和衬底接 GND', 'Source and body to GND'),
    text: loc(
      'NMOS 放在下面，源极接 GND，衬底（p 型衬底）接最低电位 GND，原因同样是让 PN 结反偏。它在 Vgs = Vin 大于 Vtn 时导通，所以输入为高时它把输出拉到 GND。',
      'The NMOS sits below with its source at GND and its body (the p-substrate) at the lowest potential, GND, again to keep its PN junctions reverse-biased. It conducts when Vgs = Vin exceeds Vtn, so a high input lets it pull the output to GND.',
    ),
  },
  {
    id: 'in',
    title: loc('输入 IN（两个栅极接在一起）', 'Input IN (both gates tied)'),
    sub: loc('同一个电压控制两管', 'One voltage drives both'),
    text: loc(
      '两个栅极连在一起就是输入。栅极下面是绝缘的栅氧化层，静态时输入几乎不取电流，所以一个输出能带很多个输入（扇出）。但栅极是个电容，前级每次翻转都要给它充放电。',
      'Tying the two gates together forms the input. Under each gate is insulating gate oxide, so the input draws almost no static current and one output can drive many inputs (fan-out). The gate is still a capacitor, though, so the driving stage has to charge and discharge it on every transition.',
    ),
  },
  {
    id: 'out',
    title: loc('输出 OUT（两个漏极接在一起）', 'Output OUT (both drains tied)'),
    sub: loc('上拉或下拉二选一', 'Pulled up or pulled down'),
    text: loc(
      '两个漏极连在一起就是输出。稳态时只有一个管子导通：导通的那个把输出接到 VDD 或 GND，另一个关断，电源到地之间没有直流通路，所以输出能到满幅 0 V 或 3.3 V。',
      'Tying the two drains together forms the output. In steady state only one transistor conducts: it connects the output to VDD or GND while the other is off, so there is no DC path from supply to ground and the output reaches the full rail, 0 V or 3.3 V.',
    ),
  },
  {
    id: 'cl',
    title: loc('负载电容 CL', 'Load capacitance CL'),
    sub: loc('下一级栅极 + 连线', 'Next gates + wiring'),
    text: loc(
      'CL 不是专门放的元件，而是下一级的栅电容、连线电容和漏极结电容加在一起。输出每次从 0 变 1，PMOS 要给 CL 充电；从 1 变 0，NMOS 要给它放电。这就是动态功耗和延时的来源（延时见 {@mosDynamic}）。',
      'CL is not a part placed on purpose: it is the next stages’ gate capacitance, the wiring capacitance and the drain junction capacitance added up. Each 0→1 output change the PMOS must charge CL; each 1→0 change the NMOS must discharge it. That is where dynamic power and delay come from (delay: {@mosDynamic}).',
    ),
  },
]

export type PhaseId = 'p1' | 'p2' | 'vm' | 'p3' | 'p4'

export const PHASE_TEXT: Record<PhaseId, { title: LText; text: LText }> = {
  p1: {
    title: loc('阶段 1：Vin < Vtn，NMOS 截止', 'Phase 1: Vin < Vtn, NMOS off'),
    text: loc(
      'NMOS 的 Vgs = Vin 还没到 0.7 V，没有沟道，截止。PMOS 的 Vsg = 3.3 V − Vin 远大于 0.7 V，沟道很强。NMOS 关着，电路里没有电流，PMOS 上就没有压降，Vsd ≈ 0 < Vsg − |Vtp|，所以 PMOS 在线性区，像一个小电阻把输出接到 VDD：Vout = 3.3 V，直通电流为 0。',
      'The NMOS Vgs = Vin is below 0.7 V, so there is no channel: it is off. The PMOS Vsg = 3.3 V − Vin is far above 0.7 V, so its channel is strong. With the NMOS off no current flows, so nothing drops across the PMOS: Vsd ≈ 0 < Vsg − |Vtp|, which puts the PMOS in the linear region, acting as a small resistor tying the output to VDD. Vout = 3.3 V and the shoot-through current is 0.',
    ),
  },
  p2: {
    title: loc('阶段 2：Vtn < Vin < VM，N 饱和、P 线性', 'Phase 2: Vtn < Vin < VM, N saturated, P linear'),
    text: loc(
      'NMOS 开始导通，但输出还很高，它的 Vds = Vout 大于 Vgs − Vtn，所以在饱和区，像一个电流源往下抽电流。PMOS 仍然强导通、Vsd 小，在线性区，像电阻。电流流过 PMOS 的电阻就产生压降，所以输出从 3.3 V 慢慢往下掉；Vin 越高，N 抽的电流越大，掉得越快。',
      'The NMOS starts to conduct, but the output is still high, so its Vds = Vout exceeds Vgs − Vtn: it is saturated and acts like a current source pulling current down. The PMOS is still strongly on with small Vsd, so it is linear and acts like a resistor. That current through the PMOS resistance causes a drop, so the output slides down from 3.3 V; the higher Vin, the more current the NMOS pulls and the faster it falls.',
    ),
  },
  vm: {
    title: loc('VM 点：两管同时饱和，增益最大', 'At VM: both saturated, maximum gain'),
    text: loc(
      'Vin = VM = 1.65 V 时，NMOS 的 Vgs 和 PMOS 的 Vsg 都是 1.65 V，又因为 KN = KP，两管在同样的过驱动下给出同样的电流，输出停在 1.65 V，两管的 Vds 都大于 Vov，都在饱和区。饱和区的管子是电流源，输出电阻很大（只有沟道长度调制 λ），Vin 稍微一动两管电流就失衡，输出大幅摆动，所以这里斜率最陡、增益最大。同时两管都导通，VDD 到 GND 的直通电流在这里达到峰值。',
      'At Vin = VM = 1.65 V the NMOS Vgs and the PMOS Vsg are both 1.65 V, and because KN = KP the two give the same current at the same overdrive, so the output sits at 1.65 V with both Vds above Vov: both saturated. A saturated transistor is a current source with very high output resistance (only channel-length modulation λ), so the slightest change in Vin unbalances the currents and the output swings a long way. That is why the slope is steepest and the gain highest here. Both transistors also conduct, so the shoot-through current from VDD to GND peaks here.',
    ),
  },
  p3: {
    title: loc('阶段 3：VM < Vin < VDD − |Vtp|，N 线性、P 饱和', 'Phase 3: VM < Vin < VDD − |Vtp|, N linear, P saturated'),
    text: loc(
      '和阶段 2 镜像：输出已经掉到低处，NMOS 的 Vds 小于 Vgs − Vtn，进入线性区当电阻；PMOS 的 Vsd = 3.3 V − Vout 很大，在饱和区当电流源。PMOS 往上送的电流越来越小，输出继续逼近 0 V。',
      'The mirror of phase 2: the output has dropped low, so the NMOS Vds is below Vgs − Vtn and it is linear, acting as a resistor; the PMOS Vsd = 3.3 V − Vout is large, so it is saturated, acting as a current source. The current the PMOS pushes up keeps shrinking and the output keeps closing in on 0 V.',
    ),
  },
  p4: {
    title: loc('阶段 4：Vin > VDD − |Vtp|，PMOS 截止', 'Phase 4: Vin > VDD − |Vtp|, PMOS off'),
    text: loc(
      'Vin 超过 3.3 − 0.7 = 2.6 V 后，PMOS 的 Vsg 不到 0.7 V，截止。NMOS 强导通，又没有电流流过，Vds ≈ 0，在线性区，把输出接到 GND：Vout = 0 V，直通电流又回到 0。',
      'Once Vin exceeds 3.3 − 0.7 = 2.6 V the PMOS Vsg is below 0.7 V and it turns off. The NMOS is strongly on, and with no current flowing its Vds ≈ 0, so it is linear and ties the output to GND: Vout = 0 V, and the shoot-through current is back to 0.',
    ),
  },
}

/** 逐帧播放的 5 帧：4 个阶段 + VM 点 */
export const FRAMES: Array<{ id: PhaseId; vin: number }> = [
  { id: 'p1', vin: 0.35 },
  { id: 'p2', vin: 1.2 },
  { id: 'vm', vin: 1.65 },
  { id: 'p3', vin: 2.1 },
  { id: 'p4', vin: 2.95 },
]

export const REGION_NAME = {
  cutoff: loc('截止区', 'Cutoff'),
  linear: loc('线性区', 'Linear'),
  sat: loc('饱和区', 'Saturation'),
}

export const NOISE_TEXT = {
  vtc: loc(
    'VTC 是输出电压随输入电压变化的曲线。开关阈值 VM 是 Vout = Vin 的那一点（图里和 45° 虚线的交点），这里 KN = KP，VM 正好是 VDD/2 = 1.65 V。如果 PMOS 做窄了（KP < KN），NMOS 更强，VM 会往低处移。',
    'The VTC plots output voltage against input voltage. The switching threshold VM is where Vout = Vin (where the curve crosses the 45° dashed line). Here KN = KP, so VM is exactly VDD/2 = 1.65 V. If the PMOS were made narrower (KP < KN) the NMOS would be stronger and VM would move lower.',
  ),
  unity: loc(
    'VIL、VIH 取在斜率为 −1 的两点，原因是：在这两点之间增益的绝对值大于 1，输入上的噪声会被放大传到输出；在这两点以外增益小于 1，噪声会被压小。VOH、VOL 取输入恰好在 VIL、VIH 时的输出，这是合法输入范围边缘上最差的输出电平。',
    'VIL and VIH are taken where the slope is −1 because between them the gain magnitude exceeds 1, so noise on the input is amplified onto the output; outside them the gain is below 1 and noise is squeezed. VOH and VOL are the outputs when the input sits exactly at VIL and VIH: the worst output levels at the edge of the valid input range.',
  ),
  margins: loc(
    '噪声容限 NML = VIL − VOL、NMH = VOH − VIH，意思是：前级输出最差的 0（VOL）上还能叠加多少噪声，后级才仍然认作 0；最差的 1 同理。概念和 {@fBasics} 里一样；{@pDigital} 里 LVTTL 的 VIL 0.8 V / VIH 2.0 V 是芯片数据手册保证的值，比这里算出的单位增益点留了更多余量，因为要覆盖工艺、温度和电压的偏差。',
    'Noise margins NML = VIL − VOL and NMH = VOH − VIH say how much noise can ride on the driver’s worst 0 (VOL) while the receiver still reads 0, and likewise for the worst 1. The idea is the same as in {@fBasics}; the LVTTL VIL 0.8 V / VIH 2.0 V in {@pDigital} are datasheet guarantees that leave more room than the unity-gain points computed here, because they must cover process, temperature and voltage spread.',
  ),
  ok: loc(
    '收到的电压还在后级的合法窗口里，所以读对了。噪声再大到超过对应的噪声容限，就会掉进 VIL 和 VIH 之间的不确定区。',
    'The received voltage is still inside the receiver’s valid window, so it reads correctly. Noise larger than the matching noise margin would push it into the undefined zone between VIL and VIH.',
  ),
  bad: loc(
    '噪声比噪声容限还大，收到的电压掉进 VIL 和 VIH 之间（甚至越过去），后级的增益大于 1，会把这个错误放大，所以判读不可靠。',
    'The noise is larger than the noise margin, so the received voltage lands between VIL and VIH (or beyond). The receiver’s gain exceeds 1 there and amplifies the error, so the reading cannot be trusted.',
  ),
}

export type PowerId = 'static' | 'short' | 'dynamic'

export const POWERS: Array<{ id: PowerId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'static',
    title: loc('静态功耗', 'Static power'),
    sub: loc('不翻转时的漏电', 'Leakage while idle'),
    text: loc(
      '输入停在 0 或 VDD 时总有一个管子截止，电源到地没有直流通路，理想情况下静态电流为 0（上面曲线两端就是 0）。实际只剩亚阈值漏电和结漏电，单个门在 pA–nA 级。正因为好芯片的静态电流极小，ATE 测 {@vate} 里的 IDDQ（静态电源电流）时，读数一旦大很多，就说明某处有短路、桥接或输入悬空造成的直流通路，见 {@fDc} 和 {@dc}。',
      'With the input parked at 0 or VDD one transistor is always off, so there is no DC path from supply to ground and ideally the static current is 0 (both ends of the curve above are 0). In practice only subthreshold and junction leakage remain, pA–nA per gate. Because a good chip’s static current is so small, when the ATE measures IDDQ (quiescent supply current, see {@vate}) a much larger reading means a short, a bridge or a floating input has created a DC path somewhere; see {@fDc} and {@dc}.',
    ),
  },
  {
    id: 'short',
    title: loc('短路（直通）功耗', 'Short-circuit (shoot-through) power'),
    sub: loc('翻转过程中两管同时导通', 'Both on during a transition'),
    text: loc(
      '输入从 Vtn 走到 VDD − |Vtp| 的这段时间里两管同时导通，有电流从 VDD 直接流到 GND（上面下图的鼓包，峰值在 VM）。输入边沿越慢，在这段停留越久，这部分功耗越大，所以要避免慢边沿驱动 CMOS 输入；输入悬空停在中间电平，直通电流会一直流。',
      'While the input travels from Vtn to VDD − |Vtp| both transistors conduct and current flows straight from VDD to GND (the hump in the lower plot above, peaking at VM). The slower the input edge, the longer it stays in that band and the larger this power, which is why slow edges should not drive CMOS inputs; a floating input parked mid-rail keeps this current flowing permanently.',
    ),
  },
  {
    id: 'dynamic',
    title: loc('动态（翻转）功耗', 'Dynamic (switching) power'),
    sub: loc('给负载电容充放电', 'Charging the load'),
    text: loc(
      '输出 0→1 时，电源经 PMOS 给 CL 充到 V，从电源取出能量 C·V²：一半 ½C·V² 存进电容，另一半烧在 PMOS 上。输出 1→0 时，存着的 ½C·V² 经 NMOS 放掉变成热。所以每个完整周期耗 C·V²，每秒翻 f 次就是 P = C·V²·f。它和管子的电阻无关，这也是数字芯片功耗的大头。',
      'On a 0→1 output change the supply charges CL to V through the PMOS and delivers energy C·V²: half, ½C·V², is stored in the capacitor and half is burned in the PMOS. On the 1→0 change the stored ½C·V² is dumped through the NMOS as heat. So each full cycle costs C·V², and f cycles per second give P = C·V²·f. It does not depend on the transistor resistance, and it is the bulk of a digital chip’s power.',
    ),
  },
]

export const CALC_TEXT = loc(
  'V 是平方关系：电压减半，同样 C 和 f 下功耗只剩 1/4（读数里两行正好差 4 倍）。这就是芯片内核电压从 5 V 一路降到 1 V 以下、以及低功耗模式要降压降频的原因。真实芯片还要乘一个翻转率 α（每个周期真正翻转的节点比例），这里取 α = 1。',
  'Voltage enters squared: halve V and, at the same C and f, power drops to 1/4 (the two readouts differ by exactly 4×). That is why core voltages fell from 5 V to below 1 V and why low-power modes cut both voltage and frequency. A real chip also multiplies by an activity factor α (the fraction of nodes that actually toggle each cycle); here α = 1.',
)

export const FIG = {
  schemCap: loc(
    '示意参数：VDD 3.3 V，Vtn 0.7 V，Vtp −0.7 V，KN = KP = 2 mA/V²，λ = 0.04 /V。PMOS 衬底接 VDD、NMOS 衬底接 GND；箭头 NMOS 指向沟道、PMOS 背离沟道。绿色 = 导通，红色虚线 = VDD 到 GND 的直通电流路径。',
    'Illustrative parameters: VDD 3.3 V, Vtn 0.7 V, Vtp −0.7 V, KN = KP = 2 mA/V², λ = 0.04 /V. PMOS body to VDD, NMOS body to GND; the NMOS arrow points into the channel and the PMOS arrow away from it. Green = conducting; red dashes = shoot-through path from VDD to GND.',
  ),
  noiseCap: loc(
    '左：VTC 上斜率 −1 的两点决定 VIL、VIH，对应的输出是 VOH、VOL。右：前级输出电平和后级输入窗口；两者之差就是噪声容限。',
    'Left: the slope −1 points on the VTC fix VIL and VIH, and the outputs there are VOH and VOL. Right: driver output levels next to receiver input windows; the gaps are the noise margins.',
  ),
  powerCap: loc('P 随 V 按平方增长；空心点是电压减半时的功耗。C、f 为示意值。', 'P grows with the square of V; the hollow dot is the power at half the voltage. C and f are illustrative.'),
  driver: loc('前级输出', 'Driver output'),
  receiver: loc('后级输入', 'Receiver input'),
  undef: loc('不确定', 'Undefined'),
  path: loc('直通电流', 'Shoot-through'),
}

export const TAKEAWAY: LText[] = [
  loc('CMOS 反相器：PMOS 在上（源、衬底接 VDD），NMOS 在下（源、衬底接 GND），栅极相连是输入，漏极相连是输出。', 'CMOS inverter: PMOS on top (source and body to VDD), NMOS below (source and body to GND); the tied gates are the input and the tied drains the output.'),
  loc('两端只有一个管子导通，所以输出满幅、静态电流为 0；中间两管都导通，在 VM 处两管都饱和，增益最大、直通电流最大。', 'At either end only one transistor conducts, so the output is rail-to-rail and static current is 0; in between both conduct, and at VM both are saturated, giving the highest gain and the largest shoot-through current.'),
  loc('KN = KP 时 VM = VDD/2；噪声容限用斜率 −1 的点：NML = VIL − VOL，NMH = VOH − VIH。', 'With KN = KP, VM = VDD/2; noise margins use the slope −1 points: NML = VIL − VOL, NMH = VOH − VIH.'),
  loc('动态功耗 P = C·V²·f，因为每个周期要从电源取 C·V² 的能量；电压减半功耗降到 1/4。', 'Dynamic power P = C·V²·f because each cycle draws C·V² of energy from the supply; halving the voltage cuts power to 1/4.'),
  loc('好芯片静态电流极小，所以 IDDQ 偏大就是缺陷或悬空输入的信号。', 'A good chip’s static current is tiny, so a high IDDQ signals a defect or a floating input.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('VDD = 3.3 V，Vin = 0.3 V。两个管子的状态是？', 'VDD = 3.3 V, Vin = 0.3 V. What state are the two transistors in?'),
    options: [
      { id: 'a', text: loc('NMOS 截止，PMOS 线性区，输出 ≈ 3.3 V', 'NMOS off, PMOS linear, output ≈ 3.3 V') },
      { id: 'b', text: loc('NMOS 饱和，PMOS 饱和', 'NMOS saturated, PMOS saturated') },
      { id: 'c', text: loc('NMOS 线性区，PMOS 截止，输出 ≈ 0 V', 'NMOS linear, PMOS off, output ≈ 0 V') },
    ],
    answer: 'a',
    explain: loc(
      'Vgs = 0.3 V < Vtn，NMOS 截止；没有电流，PMOS 上没有压降，Vsd ≈ 0，所以 PMOS 在线性区，把输出接到 VDD。',
      'Vgs = 0.3 V < Vtn, so the NMOS is off; with no current there is no drop across the PMOS, Vsd ≈ 0, so the PMOS is linear and ties the output to VDD.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('在开关阈值 VM 附近，下面哪句是对的？', 'Near the switching threshold VM, which statement is true?'),
    options: [
      { id: 'a', text: loc('两管都截止，电流最小', 'Both are off and current is minimal') },
      { id: 'b', text: loc('两管都饱和，增益和直通电流都最大', 'Both are saturated; gain and shoot-through current are both at their peak') },
      { id: 'c', text: loc('只有 PMOS 导通', 'Only the PMOS conducts') },
    ],
    answer: 'b',
    explain: loc(
      '两管都饱和就是两个电流源对顶，输出电阻很大，Vin 一点变化就让输出大幅摆动；两管同时导通，VDD 到 GND 的电流也最大。',
      'Both saturated means two current sources fighting each other with very high output resistance, so a small change in Vin swings the output a long way; both conduct, so the VDD-to-GND current is largest too.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('某反相器 VIL = 1.4 V，VOL = 0.2 V。低电平噪声容限 NML 是多少？', 'An inverter has VIL = 1.4 V and VOL = 0.2 V. What is the low noise margin NML?'),
    options: [
      { id: 'a', text: loc('1.6 V', '1.6 V') },
      { id: 'b', text: loc('1.2 V', '1.2 V') },
      { id: 'c', text: loc('0.2 V', '0.2 V') },
    ],
    answer: 'b',
    explain: loc(
      'NML = VIL − VOL = 1.4 − 0.2 = 1.2 V：前级最差的 0 是 0.2 V，后级只要输入不超过 1.4 V 都认作 0，中间 1.2 V 就是能容忍的噪声。',
      'NML = VIL − VOL = 1.4 − 0.2 = 1.2 V: the driver’s worst 0 is 0.2 V and the receiver reads anything up to 1.4 V as 0, so 1.2 V of noise can be tolerated.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('C 和 f 不变，电源从 3.3 V 降到 1.65 V，动态功耗变成原来的？', 'With C and f unchanged, the supply drops from 3.3 V to 1.65 V. Dynamic power becomes what fraction?'),
    options: [
      { id: 'a', text: loc('1/2', '1/2') },
      { id: 'b', text: loc('1/4', '1/4') },
      { id: 'c', text: loc('不变', 'Unchanged') },
    ],
    answer: 'b',
    explain: loc('P = C·V²·f，V 减半，V² 变成 1/4。', 'P = C·V²·f; halving V makes V² a quarter.'),
  },
  {
    id: 'q5',
    prompt: loc('ATE 测 IDDQ 时，所有输入都停在 0 或 VDD，读数却比正常芯片大几个数量级。最可能的原因是？', 'During IDDQ test all inputs sit at 0 or VDD, yet the reading is orders of magnitude above a good chip. The most likely cause?'),
    options: [
      { id: 'a', text: loc('负载电容太大', 'The load capacitance is too large') },
      { id: 'b', text: loc('时钟频率太高', 'The clock frequency is too high') },
      { id: 'c', text: loc('某处有桥接短路或悬空节点，形成了 VDD 到 GND 的直流通路', 'A bridge, short or floating node somewhere has created a DC path from VDD to GND') },
    ],
    answer: 'c',
    explain: loc(
      '静态时好的 CMOS 每级总有一个管子截止，没有直流通路，只剩漏电。电容和频率只影响翻转时的动态电流，IDDQ 测的是不翻转时的电流，所以大电流只能来自本不该存在的直流通路。',
      'In a static state a good CMOS stage always has one transistor off, so there is no DC path, only leakage. Capacitance and frequency only affect dynamic current while switching; IDDQ is measured while nothing toggles, so a large current can only come from a DC path that should not exist.',
    ),
  },
]
