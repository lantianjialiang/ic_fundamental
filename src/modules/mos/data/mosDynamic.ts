import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerCap: loc('寄生电容', 'Parasitic capacitance'),
  kickerMiller: loc('米勒平台', 'Miller plateau'),
  kickerScope: loc('示波器', 'Oscilloscope'),
  kickerDrive: loc('驱动与栅阻', 'Drive and gate resistor'),
  kickerCmos: loc('CMOS 延时', 'CMOS delay'),
  introTitle: loc('延时从哪里来', 'Where delay comes from'),
  capTitle: loc('三个寄生电容和数据手册上的 Ciss / Coss / Crss', 'Three parasitic capacitors and the datasheet Ciss / Coss / Crss'),
  capNote: loc('点右边的行，看它由哪几个电容组成；图中金色的电容就是被选中的那几个。', 'Click a row on the right to see which capacitors make it up; the gold capacitors in the figure are the selected ones.'),
  milTitle: loc('米勒效应与栅极电荷 Qg', 'The Miller effect and gate charge Qg'),
  milNote: loc('用「下一步」逐段看开通过程的四个区间；下面的曲线是 Vgs 对累计栅电荷的关系。', 'Use Next to step through the four turn-on intervals; the curve below is Vgs against accumulated gate charge.'),
  scopeTitle: loc('交互：调栅极电阻和负载电容，看示波器波形', 'Interactive: tune the gate resistor and load capacitance, watch the scope'),
  scopeNote: loc('Vgs（黄）、Vds（青）、Id（品红）来自一个分段模型，输入是 Qgs、Qgd、Rg 和负载电容。切换开通 / 关断。', 'Vgs (yellow), Vds (cyan) and Id (magenta) come from a piecewise model driven by Qgs, Qgd, Rg and the load capacitance. Switch between turn-on and turn-off.'),
  driveTitle: loc('驱动能力与栅极电阻的取舍', 'Drive capability and the gate-resistor trade-off'),
  driveNote: loc('先选谁来驱动，再选 Rg 的大小，表里的数字都是模型实时算出来的。', 'Pick who drives the gate, then the Rg size; every number in the table is computed live from the model.'),
  cmosTitle: loc('第二个演示：CMOS 输出推动负载电容', 'Second demo: a CMOS output driving a load capacitor'),
  cmosNote: loc('Ron 来自 3.3 V 下的教学模型，延时按 0.69 · Ron · C 估算。', 'Ron comes from the teaching model at 3.3 V; delay is estimated as 0.69 · Ron · C.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('电容怎么充放电见「预备」一课；片上反相器的 P = C·V²·f 见「CMOS 反相器」；Qg、Ciss 在数据手册里怎么找见「读数据手册与选型」。', 'How capacitors charge is in the Primer; P = C·V²·f of an on-chip inverter is in The CMOS Inverter; where to find Qg and Ciss in a datasheet is in Reading Datasheets.'),
  next: loc('下一课：典型应用电路', 'Next: Typical Board Circuits'),
  illus: loc('示意参数', 'Illustrative values'),
  illusCap: loc('示意参数：Qgs 2 nC、Qgd 3 nC、Vpl 2.5 V、Vth 1.5 V、VDD 12 V、负载 5 A。Cgs = Qgs / Vpl，Cgd = Qgd / VDD，Cds 取 300 pF，数据手册的实测值要按偏置条件查表。', 'Illustrative values: Qgs 2 nC, Qgd 3 nC, Vpl 2.5 V, Vth 1.5 V, VDD 12 V, load 5 A. Cgs = Qgs / Vpl, Cgd = Qgd / VDD, Cds is 300 pF; real datasheet values depend on the bias condition.'),
}

export const INTRO: LText[] = [
  loc(
    '开关不是瞬间的。MOS 管的栅极、漏极、源极三者之间都隔着绝缘层或耗尽区，这些结构天然就是电容。驱动电路要先给这些电容充放电，管子才能开关，所以才有上升时间、下降时间和传播延时。',
    'Switching is never instant. Between gate, drain and source there are insulating layers or depletion regions, and each of these is naturally a capacitor. The driver must charge and discharge them before the transistor can switch, which is why rise time, fall time and propagation delay exist.',
  ),
  loc(
    '这一课用一个 12 V、5 A 的板级功率管做例子，所有数字都是示意参数。你会看到：三个电容怎样对应到数据手册的 Ciss、Coss、Crss；开通时 Vgs 为什么会出现一段「平台」；栅极电阻怎样在速度、振铃和损耗之间取舍。电容充电的基础见 {@mosPrimer}，片上反相器的 P = C·V²·f 见 {@mosInverter}，数据手册和选型见 {@mosSelect}，示波器测量见 {@pMeasure}。',
    'This lesson uses a 12 V, 5 A board-level power transistor as the example, and every number is illustrative. You will see how three capacitors map to the datasheet Ciss, Coss and Crss, why Vgs shows a flat plateau during turn-on, and how the gate resistor trades speed against ringing and loss. Capacitor charging basics are in {@mosPrimer}, P = C·V²·f of an on-chip inverter is in {@mosInverter}, datasheets and part choice are in {@mosSelect}, and scope measurement is in {@pMeasure}.',
  ),
  loc(
    '测试工程师为什么要关心：ATE 测的 tPD、tr、tf 就是这些电容被充放电的结果，见 {@timing} 和 {@fAc}。',
    'Why a test engineer cares: the tPD, tr and tf an ATE measures are the result of exactly these capacitors being charged and discharged; see {@timing} and {@fAc}.',
  ),
]

export type CapId = 'cgs' | 'cgd' | 'cds'
export type DsId = 'ciss' | 'coss' | 'crss'

export const CAPS: Array<{ id: CapId; name: string; title: LText; text: LText }> = [
  {
    id: 'cgs',
    name: 'Cgs',
    title: loc('Cgs：栅极和源极之间', 'Cgs: between gate and source'),
    text: loc(
      '栅极多晶硅和下面的沟道、源区隔着一层薄栅氧，这就是一个平板电容。开通时驱动先要把它从 0 充到 Vth 附近，这一段管子还没有电流，所以 Cgs 越大，开通前的「死时间」越长。它基本不随 Vds 变化。',
      'The gate polysilicon and the channel and source below it are separated by a thin gate oxide, which makes a parallel-plate capacitor. The driver must first charge it from 0 to about Vth, and no current flows during that time, so a larger Cgs means a longer dead time before turn-on. It barely changes with Vds.',
    ),
  },
  {
    id: 'cgd',
    name: 'Cgd',
    title: loc('Cgd：栅极和漏极之间（米勒电容）', 'Cgd: between gate and drain (the Miller capacitor)'),
    text: loc(
      '栅极和漏区交叠、以及栅极下方靠漏一侧的耦合。它跨在输入和输出之间，Vds 变化时它两端的电压变化最大，所以对开关速度影响最大；它还随 Vds 变化：Vds 很高时只有几十 pF，Vds 降到很低时会明显变大。',
      'It comes from the gate overlapping the drain region and the coupling beside the drain end. It bridges input and output, so its voltage changes the most when Vds swings, which makes it the most important for switching speed. It also depends on Vds: only tens of pF at high Vds, noticeably larger when Vds is low.',
    ),
  },
  {
    id: 'cds',
    name: 'Cds',
    title: loc('Cds：漏极和源极之间', 'Cds: between drain and source'),
    text: loc(
      '它是漏区和 P 型体区之间 PN 结的结电容，也就是体二极管的结电容，和栅极电压无关。Vds 越大，耗尽区越宽，电容越小。关断时它决定漏极电压能涨多快，并和线路电感一起引起振铃。',
      'It is the junction capacitance of the PN junction between the drain region and the P-type body, that is, the body diode’s capacitance, and it does not depend on gate voltage. A higher Vds widens the depletion region and lowers the capacitance. At turn-off it limits how fast the drain voltage can rise and, together with wiring inductance, causes ringing.',
    ),
  },
]

export const DS: Array<{ id: DsId; name: string; caps: CapId[]; formula: string; title: LText; text: LText }> = [
  {
    id: 'ciss',
    name: 'Ciss',
    caps: ['cgs', 'cgd'],
    formula: 'Cgs + Cgd',
    title: loc('Ciss = Cgs + Cgd：输入电容', 'Ciss = Cgs + Cgd: input capacitance'),
    text: loc(
      '测量时把漏极对源极交流短路，从栅极看进去，Cgs 和 Cgd 就并联在一起，所以 Ciss = Cgs + Cgd。它是驱动电路要充放电的那个电容，决定开通前的延时，所以选驱动能力时先看它。',
      'It is measured with the drain AC-shorted to the source, so from the gate Cgs and Cgd are in parallel and Ciss = Cgs + Cgd. This is the capacitor the driver has to charge and discharge and it sets the delay before turn-on, so look at it first when sizing the drive.',
    ),
  },
  {
    id: 'coss',
    name: 'Coss',
    caps: ['cds', 'cgd'],
    formula: 'Cds + Cgd',
    title: loc('Coss = Cds + Cgd：输出电容', 'Coss = Cds + Cgd: output capacitance'),
    text: loc(
      '测量时把栅极对源极交流短路，Cgs 被短掉，从漏极看进去 Cds 和 Cgd 并联，所以 Coss = Cds + Cgd。它决定漏极电压每个周期要充放多少电荷，硬开关时这部分能量变成损耗，高频电源里要关注它。',
      'It is measured with the gate AC-shorted to the source, which shorts Cgs out, so from the drain Cds and Cgd are in parallel and Coss = Cds + Cgd. It sets how much charge the drain node swings every cycle; in hard switching that energy turns into loss, so it matters in high-frequency supplies.',
    ),
  },
  {
    id: 'crss',
    name: 'Crss',
    caps: ['cgd'],
    formula: 'Cgd',
    title: loc('Crss = Cgd：反向传输电容', 'Crss = Cgd: reverse transfer capacitance'),
    text: loc(
      '测量时把 Cgs 和 Cds 的一端都接到交流地，只剩栅极到漏极这一个电容在两个端子之间，所以 Crss = Cgd，也就是米勒电容。它越大，开关边沿的米勒平台越长，开关损耗越大。',
      'It is measured with one end of both Cgs and Cds on AC ground, leaving only the gate-to-drain capacitor between the two terminals, so Crss = Cgd, the Miller capacitor. The larger it is, the longer the Miller plateau on the switching edge and the larger the switching loss.',
    ),
  },
]

export type PhaseId = 'p1' | 'p2' | 'p3' | 'p4'

export const PHASES: Array<{ id: PhaseId; range: string; title: LText; text: LText }> = [
  {
    id: 'p1',
    range: 't0 – t1',
    title: loc('t0–t1：给 Cgs 充电，Vgs 升到 Vth', 't0–t1: charge Cgs, Vgs rises to Vth'),
    text: loc(
      '驱动电压跳高后，栅极电流 Ig = (Vdrive − Vgs) / Rg 开始给 Cgs 充电，Vgs 按 RC 曲线上升。Vgs 还没到 Vth，沟道没形成，所以 Id = 0，Vds 保持 VDD。这段是纯延时，没有任何开关动作。',
      'After the drive voltage steps high, the gate current Ig = (Vdrive − Vgs) / Rg starts charging Cgs and Vgs rises along an RC curve. Vgs is still below Vth, so no channel exists, Id = 0 and Vds stays at VDD. This interval is pure delay with no switching action yet.',
    ),
  },
  {
    id: 'p2',
    range: 't1 – t2',
    title: loc('t1–t2：电流上升到负载电流，Vds 仍约等于 VDD', 't1–t2: current rises to the load current, Vds stays near VDD'),
    text: loc(
      'Vgs 过了 Vth，沟道出现，Id 随 Vgs 增大。Vds 此时不会降：负载电流是电感或续流二极管撑着的，管子电流没达到负载电流之前，续流二极管还在分走电流，漏极电压被钳在 VDD 附近。当 Id 升到负载电流（5 A），Vgs 正好到达平台电压 Vpl（2.5 V）。',
      'Once Vgs passes Vth a channel appears and Id grows with Vgs. Vds cannot fall yet: the load current is held up by an inductor and a freewheel diode, and until the transistor carries the full load current the diode still takes part of it, which clamps the drain near VDD. When Id reaches the load current (5 A), Vgs is exactly at the plateau voltage Vpl (2.5 V).',
    ),
  },
  {
    id: 'p3',
    range: 't2 – t3',
    title: loc('t2–t3：米勒平台，Vgs 不动，Vds 下降', 't2–t3: Miller plateau, Vgs flat while Vds falls'),
    text: loc(
      'Id 已经等于负载电流，Vgs 由它决定，所以基本不再变。这时全部栅极电流都流进 Cgd，用来让漏极电压下降：dVds/dt ≈ − Ig / Cgd。电荷都去给 Cgd 充电，Vgs 就停在一个平台上，这就是米勒平台，持续时间约为 Qgd · Rg / (Vdrive − Vpl)。',
      'Id already equals the load current and Vgs is set by it, so Vgs hardly moves. All of the gate current now flows into Cgd to pull the drain voltage down: dVds/dt ≈ − Ig / Cgd. Because the charge goes into Cgd, Vgs sits on a plateau, the Miller plateau, lasting about Qgd · Rg / (Vdrive − Vpl).',
    ),
  },
  {
    id: 'p4',
    range: 't3 – t4',
    title: loc('t3–t4：Vgs 继续升到驱动电压', 't3–t4: Vgs rises on to the drive voltage'),
    text: loc(
      'Vds 已经降到 Id × Rds(on) 的小值，平台结束，栅极电流重新给整个 Cgs + Cgd 充电，Vgs 升到驱动电压。管子被推得更深，Rds(on) 变得更小，Id 稳定在负载电流。这段不再影响开关损耗，只影响最终的导通电阻。',
      'Vds has fallen to the small value Id × Rds(on), the plateau ends, and the gate current charges the whole Cgs + Cgd again so Vgs rises to the drive voltage. The transistor is driven harder, Rds(on) gets smaller and Id settles at the load current. This interval no longer adds switching loss; it only sets the final on-resistance.',
    ),
  },
]

export const MILLER: LText[] = [
  loc(
    '米勒效应：Cgd 跨在栅极和漏极之间，漏极电压变化 ΔVds 时，它要的电荷是 Cgd · ΔVds，而这些电荷要从栅极来。从栅极看，Cgd 好像被放大成 Cgd · (1 + 增益) 倍的电容。所以 Qgd 这块电荷在平台上占用了很长时间，驱动电流越小，平台越长。',
    'Miller effect: Cgd sits between gate and drain. When the drain voltage changes by ΔVds it needs a charge Cgd · ΔVds, and that charge has to come from the gate. Seen from the gate, Cgd looks like a capacitor multiplied by (1 + gain). So the charge Qgd keeps the plateau going for a long time, and the smaller the drive current the longer it lasts.',
  ),
  loc(
    '栅极电荷 Qg：从 0 开始把栅极充到驱动电压总共需要的电荷，Qg = Qgs + Qgd + 其余。Qgs 是充到平台前的电荷，Qgd 是平台上的电荷，其余是平台后充到驱动电压的电荷。用电荷算比用电容算更准，因为电容随电压在变，而电荷是累计量，直接和驱动电流相关：充电时间 ≈ Qg / Ig。',
    'Gate charge Qg: the total charge needed to charge the gate from 0 to the drive voltage, Qg = Qgs + Qgd + the rest. Qgs is the charge up to the plateau, Qgd is the charge on the plateau, and the rest charges Vgs on to the drive voltage. Charge is more accurate than capacitance, because capacitance changes with voltage while charge is a cumulative quantity tied directly to drive current: charging time ≈ Qg / Ig.',
  ),
]

export const QG_LABEL = {
  qgs: loc('Qgs（到平台前）', 'Qgs (up to plateau)'),
  qgd: loc('Qgd（平台）', 'Qgd (plateau)'),
  rest: loc('其余', 'Rest'),
  total: loc('Qg 总电荷', 'Total Qg'),
  vdrive: loc('驱动电压 Vdrive', 'Drive voltage Vdrive'),
  capQg: loc('Vgs 随累计栅电荷 Q 的曲线：先升到平台、平台上 Vgs 不变而电荷增加、再升到驱动电压（示意参数）。', 'Vgs against accumulated gate charge Q: rise to the plateau, flat Vgs while charge keeps adding up, then rise to the drive voltage (illustrative values).'),
  capTurn: loc('开通四个区间。时间轴按区间等宽画，不是真实比例，曲线形状由下面的分段模型算出（Rg 10 Ω、负载电容 100 pF）。', 'The four turn-on intervals. The time axis gives each interval equal width and is not to scale; curve shapes come from the piecewise model below (Rg 10 Ω, load capacitance 100 pF).'),
  gate: loc('栅极电压 Vgs', 'Gate voltage Vgs'),
  drain: loc('漏源电压 Vds', 'Drain-source voltage Vds'),
  cur: loc('漏极电流 Id', 'Drain current Id'),
  plateau: loc('平台', 'Plateau'),
  load: loc('负载电流', 'Load current'),
  time: loc('时间（示意）', 'Time (schematic)'),
}
