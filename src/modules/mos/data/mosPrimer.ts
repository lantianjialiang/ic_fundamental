import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerLattice: loc('掺杂', 'Doping'),
  kickerJunction: loc('PN 结', 'PN junction'),
  kickerRc: loc('RC 回顾', 'RC recap'),
  introTitle: loc('为什么学 MOS 之前先看这一课', 'Why look at this before MOSFETs'),
  checkTitle: loc('学前自测', 'Pre-check'),
  checkNote: loc('5 道小题，答完给出建议：直接进下一课，还是先学完这一课。和文末复习题是两套题。', 'Five quick items. When you finish you get advice: go straight to the next lesson, or study this one first. These are separate from the review questions at the end.'),
  latticeTitle: loc('硅晶格：本征、N 型、P 型', 'The silicon lattice: intrinsic, N-type, P-type'),
  latticeNote: loc('切换掺杂，看晶格里多出来的是自由电子还是空穴。', 'Switch the doping and see whether the extras in the lattice are free electrons or holes.'),
  junctionTitle: loc('PN 结与偏置', 'The PN junction and bias'),
  junctionNote: loc('拖动偏置电压：正值表示 P 接正、N 接负。看耗尽区宽度和电流怎么变。', 'Drag the bias voltage: positive means P to plus and N to minus. Watch the depletion width and the current.'),
  rcTitle: loc('电容与 RC 充放电', 'Capacitors and RC charge / discharge'),
  rcNote: loc('调 R 和 C，切换充电 / 放电，曲线按 τ = R × C 实时计算。', 'Adjust R and C and switch between charge and discharge; the curve is computed from τ = R × C.'),
  bias: loc('偏置电压 V', 'Bias voltage V'),
  rKnob: loc('电阻 R', 'Resistance R'),
  cKnob: loc('电容 C', 'Capacitance C'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('MOS 管的源漏和衬底之间就是 PN 结；沟道怎么「反型」出来，见「沟道是怎么形成的」一课；栅极电容带来的延时，见「动态特性」一课。', 'The source / drain to body boundary of a MOSFET is a PN junction; how the channel is "inverted" is in the lesson How the Channel Forms; delay from gate capacitance is in the Dynamics lesson.'),
  next: loc('下一课：MOS 管是什么', 'Next: What a MOSFET is'),
}

export const INTRO: LText[] = [
  loc(
    'MOS 管全身都是掺杂过的硅：P 型衬底上做两块 N 型源漏，栅极下面靠电压「拉」出一层电子当沟道。源漏和衬底之间就是两个 PN 结，栅极和沟道之间又是一个电容。所以 N 型、P 型、PN 结和 RC 这四件事，是后面每一课的地基。',
    'A MOSFET is made entirely of doped silicon: two N-type source / drain regions in a P-type body, with a layer of electrons pulled up under the gate by voltage to form the channel. Source / drain and body form two PN junctions, and gate plus channel form a capacitor. So N-type, P-type, the PN junction and RC are the foundation of every later lesson.',
  ),
  loc(
    '这一课是选修。先做下面的自测：都会的话直接去 {@mosIntro}。晶圆怎么做出来见 {@pSilicon}；电阻、电容、二极管的符号和 I-V 曲线见 {@pParts}；欧姆定律和测量见 {@pMeasure}。',
    'This lesson is optional. Take the pre-check below; if you know it all, go straight to {@mosIntro}. How wafers are made is in {@pSilicon}; symbols and I-V curves of resistors, capacitors and diodes are in {@pParts}; Ohm’s law and measurement are in {@pMeasure}.',
  ),
]

/** 300 K 下硅的本征载流子浓度（取整），单位 cm⁻³ */
export const NI = 1e10
/** 示意掺杂浓度，单位 cm⁻³ */
export const DOPING = 1e16

export type LatticeId = 'i' | 'n' | 'p'

export const LATTICE: Array<{ id: LatticeId; label: LText; title: LText; text: LText; detail: LText; nd: number; na: number }> = [
  {
    id: 'i',
    label: loc('本征硅', 'Intrinsic Si'),
    title: loc('本征硅：电子 = 空穴', 'Intrinsic silicon: electrons = holes'),
    text: loc(
      '纯硅每个原子有 4 个价电子，和 4 个邻居各共用一对，全部被键「锁住」。室温的热运动偶尔打断一根键：放出一个自由电子，原地留下一个空位，就是空穴。电子和空穴总是成对产生，所以数量相等，而且很少，导电很差。',
      'Each silicon atom has 4 valence electrons and shares one pair with each of its 4 neighbours, so every electron is locked in a bond. At room temperature heat occasionally breaks a bond: a free electron leaves and an empty spot, the hole, stays behind. Electrons and holes are always created in pairs, so their numbers are equal, and small, so pure silicon conducts poorly.',
    ),
    detail: loc(
      '本征硅里 n = p = ni，室温下约 10¹⁰ cm⁻³，而硅原子约有 5 × 10²² cm⁻³，相当于一万亿个原子里才有一个键断开。',
      'In intrinsic silicon n = p = ni, about 10¹⁰ cm⁻³ at room temperature, against about 5 × 10²² silicon atoms per cm³: roughly one broken bond per trillion atoms.',
    ),
    nd: 0,
    na: 0,
  },
  {
    id: 'n',
    label: loc('N 型（掺磷）', 'N-type (phosphorus)'),
    title: loc('N 型：磷是施主，多子是电子', 'N-type: phosphorus donates, electrons are the majority'),
    text: loc(
      '磷有 5 个价电子。替换一个硅原子后，4 个用来成键，第 5 个没有键可去，室温下就脱离成为自由电子。磷原子失去一个电子，变成固定不动的正离子。所以磷叫施主，N 型硅里电子是多数载流子（多子），空穴是少数载流子（少子）。',
      'Phosphorus has 5 valence electrons. When it replaces a silicon atom, 4 go into bonds and the 5th has no bond, so at room temperature it breaks free as a free electron. The phosphorus atom, having lost an electron, becomes a fixed positive ion. That is why phosphorus is called a donor: in N-type silicon electrons are the majority carriers and holes the minority carriers.',
    ),
    detail: loc(
      '电子多了，和空穴相遇复合的机会也多了，空穴反而比本征时更少：n × p = ni² 保持不变。下面的浓度就是按这个关系算出来的。',
      'With more electrons, holes meet and recombine with them more often, so holes become even scarcer than in intrinsic silicon: n × p = ni² stays constant. The concentrations below are computed from that relation.',
    ),
    nd: DOPING,
    na: 0,
  },
  {
    id: 'p',
    label: loc('P 型（掺硼）', 'P-type (boron)'),
    title: loc('P 型：硼是受主，多子是空穴', 'P-type: boron accepts, holes are the majority'),
    text: loc(
      '硼只有 3 个价电子，和 4 个邻居成键时缺一个电子，留下一个空穴。邻近的电子很容易跳过来补上，空穴就挪到了别处，看起来像一个可以移动的正电荷。硼原子多拿了一个电子，变成固定不动的负离子。所以硼叫受主，P 型硅里空穴是多子，电子是少子。',
      'Boron has only 3 valence electrons, so one of its 4 bonds is missing an electron: a hole. A neighbouring electron easily jumps in to fill it, which moves the hole elsewhere, so the hole behaves like a mobile positive charge. Boron, having gained an electron, becomes a fixed negative ion. That is why boron is called an acceptor: in P-type silicon holes are the majority carriers and electrons the minority.',
    ),
    detail: loc(
      '空穴不是一个粒子，而是「缺一个电子的键」在移动；它往哪边走，实际是电子往反方向一个个补位。',
      'A hole is not a particle but a bond missing one electron moving around; when it moves one way, electrons are actually stepping in one by one the other way.',
    ),
    nd: 0,
    na: DOPING,
  },
]

export const LATTICE_LABEL = {
  electron: loc('自由电子', 'Free electron'),
  hole: loc('空穴', 'Hole'),
  donor: loc('施主离子（固定）', 'Donor ion (fixed)'),
  acceptor: loc('受主离子（固定）', 'Acceptor ion (fixed)'),
  bond: loc('共价键（一对电子）', 'Bond (an electron pair)'),
  majority: loc('多子', 'Majority'),
  minority: loc('少子', 'Minority'),
  equal: loc('电子和空穴一样多', 'Electrons equal holes'),
  electrons: loc('电子', 'electrons'),
  holes: loc('空穴', 'holes'),
  nConc: loc('电子浓度 n', 'Electron density n'),
  pConc: loc('空穴浓度 p', 'Hole density p'),
  cap: loc(
    '示意图：二维画法，真实硅是三维金刚石结构。图里只画了几个载流子表示多少关系，真实比例差 10¹² 倍，见下方读数（ni 取 10¹⁰ cm⁻³，掺杂 10¹⁶ cm⁻³）。',
    'Illustration: drawn in 2-D; real silicon is a 3-D diamond lattice. Only a few carriers are drawn to show which kind dominates; the real ratio is about 10¹², see the readout (ni = 10¹⁰ cm⁻³, doping 10¹⁶ cm⁻³).',
  ),
}

export type JunctionState = 'rev' | 'zero' | 'fwdWeak' | 'fwdOn'

export const JUNCTION_SHORT: Record<JunctionState, LText> = {
  zero: loc('零偏', 'Zero bias'),
  rev: loc('反偏截止', 'Reverse, blocking'),
  fwdWeak: loc('正偏未导通', 'Forward, not yet on'),
  fwdOn: loc('正偏导通', 'Forward, conducting'),
}

export const JUNCTION: Record<JunctionState, { title: LText; text: LText; tone: 'ok' | 'warn' | 'bad' }> = {
  zero: {
    title: loc('零偏：扩散和电场平衡', 'Zero bias: diffusion balances the field'),
    text: loc(
      'P 区空穴多、N 区电子多，交界处它们互相扩散、复合掉，留下一条没有自由载流子的耗尽区，里面只剩固定离子：P 侧是受主负离子，N 侧是施主正离子。正负离子之间形成从 N 指向 P 的内建电场，硅里内建电势约 0.7 V。电场把想继续扩散的载流子推回去，两股力量平衡，所以净电流为 0。',
      'The P side is rich in holes and the N side in electrons; at the boundary they diffuse into each other and recombine, leaving a depletion region with no free carriers, only fixed ions: negative acceptor ions on the P side, positive donor ions on the N side. Those ions create a built-in field pointing from N to P, a built-in potential of about 0.7 V in silicon. The field pushes back carriers that try to keep diffusing; the two balance, so the net current is 0.',
    ),
    tone: 'ok',
  },
  rev: {
    title: loc('反偏：耗尽区变宽，几乎不导电', 'Reverse bias: wider depletion, almost no current'),
    text: loc(
      'P 接负、N 接正，外加电压和内建电势同方向叠加，势垒升高到 0.7 V + |V|。电源把 P 区空穴和 N 区电子都从交界处拉走，露出更多固定离子，所以耗尽区变宽。多子翻不过势垒，只剩少子被电场扫过去形成极小的反向漏电流，而且基本不随电压变。',
      'With P to minus and N to plus, the applied voltage adds to the built-in potential, raising the barrier to 0.7 V + |V|. The supply pulls holes and electrons away from the boundary, exposing more fixed ions, so the depletion region widens. Majority carriers cannot climb the barrier; only minority carriers swept across by the field make a tiny reverse leakage current that hardly changes with voltage.',
    ),
    tone: 'bad',
  },
  fwdWeak: {
    title: loc('正偏但还不够：电流很小', 'Forward bias, not yet enough: tiny current'),
    text: loc(
      'P 接正、N 接负，外加电压抵消一部分内建电势，势垒降到 0.7 V − V，耗尽区变窄。能翻过势垒的载流子按指数增加，但离 0.7 V 还远时电流仍在微安以下，看起来像没导通。',
      'With P to plus and N to minus, the applied voltage cancels part of the built-in potential, lowering the barrier to 0.7 V − V and narrowing the depletion region. The number of carriers that can get over grows exponentially, but while V is well below 0.7 V the current is still under a microamp and looks like nothing.',
    ),
    tone: 'warn',
  },
  fwdOn: {
    title: loc('正偏导通：电压卡在 0.7 V 左右', 'Forward on: voltage sits near 0.7 V'),
    text: loc(
      '势垒几乎被抵消，耗尽区很窄，大量多子越过交界：空穴进 N 区、电子进 P 区，电流猛增。每多约 60 mV 电流大约 ×10，所以导通的硅二极管两端基本卡在 0.6–0.7 V，再加电压只会让电流暴涨，必须串电阻限流。',
      'The barrier is almost cancelled and the depletion region is very narrow, so many majority carriers cross: holes into the N side, electrons into the P side, and the current shoots up. Current rises about ×10 for every 60 mV, so a conducting silicon diode stays at about 0.6–0.7 V; more voltage only makes the current explode, which is why a series resistor must limit it.',
    ),
    tone: 'ok',
  },
}

export const JUNCTION_LABEL = {
  pSide: loc('P 区（掺硼）', 'P side (boron)'),
  nSide: loc('N 区（掺磷）', 'N side (phosphorus)'),
  depletion: loc('耗尽区', 'Depletion region'),
  field: loc('内建电场 E', 'Built-in field E'),
  anode: loc('阳极 A', 'Anode A'),
  cathode: loc('阴极 K', 'Cathode K'),
  barrier: loc('势垒 Vbi − V', 'Barrier Vbi − V'),
  width: loc('耗尽区宽度（相对零偏）', 'Depletion width (vs zero bias)'),
  current: loc('二极管电流', 'Diode current'),
  state: loc('状态', 'State'),
  cap: loc(
    '示意参数：Vbi = 0.7 V，两侧掺杂相同；宽度按 √((Vbi − V) / Vbi) 定性缩放；电流 I = Is(e^(V/VT) − 1)，Is = 10 fA，VT = 25.85 mV。',
    'Illustrative values: Vbi = 0.7 V, equal doping on both sides; width scaled qualitatively as √((Vbi − V) / Vbi); current I = Is(e^(V/VT) − 1), Is = 10 fA, VT = 25.85 mV.',
  ),
}

export type RcMode = 'charge' | 'discharge'

export const RC_MODES: Array<{ id: RcMode; label: LText; title: LText; text: LText }> = [
  {
    id: 'charge',
    label: loc('充电', 'Charge'),
    title: loc('充电：先快后慢', 'Charging: fast first, then slow'),
    text: loc(
      '开关拨到电源，电容电压从 0 往 3.3 V 爬。一开始电容两端没电压，电阻上压降最大，电流最大，所以涨得快；越接近 3.3 V，电阻上剩的电压越小，电流越小，所以越涨越慢。τ = R × C：1τ 到 63.2%，5τ 到 99.3%。',
      'With the switch on the supply, the capacitor climbs from 0 toward 3.3 V. At first it has no voltage, so the resistor sees the full drop and the current is largest: it rises fast. Closer to 3.3 V, less voltage is left across the resistor, so the current and the rise both slow down. τ = R × C: 63.2% at 1τ, 99.3% at 5τ.',
    ),
  },
  {
    id: 'discharge',
    label: loc('放电', 'Discharge'),
    title: loc('放电：同样是指数', 'Discharging: also exponential'),
    text: loc(
      '开关拨到地，电容通过电阻放电。电容电压越高，推出的电流越大，所以开头掉得快、后面掉得慢。1τ 剩 36.8%，5τ 剩 0.7%。MOS 管的栅极就是一个电容，驱动电阻越大，τ 越大，开关就越慢。',
      'With the switch on ground, the capacitor discharges through the resistor. The higher its voltage, the more current it pushes, so it falls fast at first and slowly later. 36.8% remains at 1τ and 0.7% at 5τ. A MOSFET gate is a capacitor, so a larger drive resistance means a larger τ and slower switching.',
    ),
  },
]

export const RC_LABEL = {
  tau: 'τ = R × C',
  at1: loc('1τ 时电压', 'Voltage at 1τ'),
  t99: loc('到 99% 需要', 'Time to 99%'),
  vc: loc('电容电压 Vc', 'Capacitor voltage Vc'),
  time: loc('时间 t（ms）', 'Time t (ms)'),
  cap: loc(
    '示意参数：电源 3.3 V，理想开关和电容；Vc = 3.3 V × (1 − e^(−t/τ)) 充电，Vc = 3.3 V × e^(−t/τ) 放电。',
    'Illustrative values: 3.3 V supply, ideal switch and capacitor; Vc = 3.3 V × (1 − e^(−t/τ)) when charging, Vc = 3.3 V × e^(−t/τ) when discharging.',
  ),
}

export const TAKEAWAY: LText[] = [
  loc('掺磷（5 个价电子）多出自由电子，是 N 型；掺硼（3 个价电子）多出空穴，是 P 型。掺进去的原子本身变成固定离子，不导电。', 'Phosphorus (5 valence electrons) adds free electrons: N-type. Boron (3) adds holes: P-type. The dopant atoms themselves become fixed ions that do not carry current.'),
  loc('多子由掺杂决定，少子由 n × p = ni² 决定，掺得越多少子越少。', 'Doping sets the majority carriers; n × p = ni² sets the minority, so heavier doping means fewer minority carriers.'),
  loc('PN 结交界处载流子复合掉，留下只有固定离子的耗尽区；硅的内建电势约 0.7 V。', 'At a PN junction the carriers recombine, leaving a depletion region of fixed ions only; silicon’s built-in potential is about 0.7 V.'),
  loc('正偏抵消势垒、耗尽区变窄、电流指数增大；反偏抬高势垒、耗尽区变宽、只剩极小漏电。', 'Forward bias cancels the barrier, narrows the depletion region and grows the current exponentially; reverse bias raises the barrier, widens the region and leaves only tiny leakage.'),
  loc('RC 充放电按指数走，τ = R × C；1τ 走完 63.2%，5τ 基本到头。', 'RC charge and discharge are exponential with τ = R × C; 63.2% of the way at 1τ, essentially done at 5τ.'),
]
