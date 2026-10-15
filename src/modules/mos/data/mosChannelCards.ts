import { loc, type LText } from '../../../i18n/locale'
import { VTN, VTP } from '../model'
import { type ChState, type Dev } from './mosChannelModel'

/* ---------- MOS 电容分步 ---------- */

export type CapStep = {
  id: string
  st: ChState
  /** 归一化栅压（NMOS 就是 Vgs，PMOS 取 −Vgs）；null 表示取阈值 */
  vn: number | null
  label: LText
  balance: Record<Dev, LText>
}

export const CAP_STEPS: CapStep[] = [
  {
    id: 'acc',
    st: 'acc',
    vn: -1,
    label: loc('积累', 'Accumulation'),
    balance: {
      n: loc(
        '栅上 −Q，硅里 +Q：电荷由表面堆积的空穴提供，空穴是可动的，所以栅压稍变，表面电荷立刻跟着变，电容接近氧化层电容 Cox。',
        'Gate −Q, silicon +Q: the charge is supplied by holes piled up at the surface; they are mobile, so surface charge follows any change in gate voltage at once and the capacitance is close to the oxide capacitance Cox.',
      ),
      p: loc(
        '栅上 +Q，硅里 −Q：电荷由表面堆积的电子提供，电子是可动的，所以栅压稍变，表面电荷立刻跟着变，电容接近 Cox。',
        'Gate +Q, silicon −Q: the charge is supplied by electrons piled up at the surface; they are mobile, so surface charge follows any change in gate voltage at once and the capacitance is close to Cox.',
      ),
    },
  },
  {
    id: 'dep',
    st: 'dep',
    vn: 0.35,
    label: loc('耗尽', 'Depletion'),
    balance: {
      n: loc(
        '栅上 +Q，硅里 −Q：电荷由耗尽区里固定的负离子提供。Q 越大，耗尽区越深；氧化层电容再串上一个耗尽层电容，总电容变小。',
        'Gate +Q, silicon −Q: the charge comes from the fixed negative ions in the depletion region. The larger Q is, the deeper the region; a depletion-layer capacitance now sits in series with the oxide capacitance, so the total capacitance drops.',
      ),
      p: loc(
        '栅上 −Q，硅里 +Q：电荷由耗尽区里固定的正离子提供。Q 越大，耗尽区越深；氧化层电容再串上一个耗尽层电容，总电容变小。',
        'Gate −Q, silicon +Q: the charge comes from the fixed positive ions in the depletion region. The larger Q is, the deeper the region; a depletion-layer capacitance now sits in series with the oxide capacitance, so the total capacitance drops.',
      ),
    },
  },
  {
    id: 'th',
    st: 'th',
    vn: null,
    label: loc('阈值', 'Threshold'),
    balance: {
      n: loc(
        '栅上 +Q，硅里 −Q：此时电荷几乎全是耗尽区离子，耗尽区最深，表面刚开始出现电子。再加栅压，耗尽区就不再变深。',
        'Gate +Q, silicon −Q: the charge is still almost all depletion-region ions, the region is at its deepest, and electrons are just starting to appear at the surface. With more gate voltage the region will not get deeper.',
      ),
      p: loc(
        '栅上 −Q，硅里 +Q：此时电荷几乎全是耗尽区离子，耗尽区最深，表面刚开始出现空穴。再加负栅压，耗尽区就不再变深。',
        'Gate −Q, silicon +Q: the charge is still almost all depletion-region ions, the region is at its deepest, and holes are just starting to appear at the surface. With more negative gate voltage the region will not get deeper.',
      ),
    },
  },
  {
    id: 'inv',
    st: 'inv',
    vn: 2,
    label: loc('反型', 'Inversion'),
    balance: {
      n: loc(
        '栅上 +Q，硅里 −Q：新增的电荷由反型层电子承担，耗尽区不再加深。电子由 n+ 源漏供给、跟得上栅压变化，所以带源漏的 MOS 管电容又回到约 Cox。',
        'Gate +Q, silicon −Q: the added charge is taken by inversion-layer electrons and the depletion region stops deepening. The n+ source and drain supply those electrons fast enough to follow the gate, so with source and drain the capacitance returns to about Cox.',
      ),
      p: loc(
        '栅上 −Q，硅里 +Q：新增的电荷由反型层空穴承担，耗尽区不再加深。空穴由 p+ 源漏供给、跟得上栅压变化，所以电容又回到约 Cox。',
        'Gate −Q, silicon +Q: the added charge is taken by inversion-layer holes and the depletion region stops deepening. The p+ source and drain supply those holes fast enough to follow the gate, so the capacitance returns to about Cox.',
      ),
    },
  },
]

/* ---------- Vth 的影响因素 ---------- */

export type VthCard = { id: string; title: LText; sub: LText; text: LText; shift: number }

/** shift：|Vth| 的变化量，示意值，用来画虚线 */
export const VTH_CARDS: VthCard[] = [
  {
    id: 'def',
    title: loc('Vth 是什么', 'What Vth is'),
    sub: loc('表面翻成另一型', 'Surface flips type'),
    shift: 0,
    text: loc(
      'Vth 是让表面“翻转”的栅压：NMOS 在 Vgs = Vth 时，表面电子浓度等于体内空穴浓度，表面变得和体内一样浓，只是换成了 n 型。它由衬底掺杂、栅氧厚度和栅材料三件事决定。图里实线是表面电子（沟道载流子）和表面空穴的浓度，电子线在 Vth 处升到体内空穴浓度那条虚线。',
      'Vth is the gate voltage that flips the surface: for an NMOS at Vgs = Vth the surface electron concentration equals the bulk hole concentration, so the surface is as strongly doped as the bulk, only now n-type. It is set by three things: substrate doping, gate-oxide thickness and gate material. In the plot the solid curves are the surface electron (channel carrier) and surface hole concentrations; the electron curve reaches the dashed bulk-hole level at Vth.',
    ),
  },
  {
    id: 'doping',
    title: loc('衬底掺杂更浓', 'Heavier substrate doping'),
    sub: loc('Vth 升高', 'Vth rises'),
    shift: 0.3,
    text: loc(
      '掺杂越浓，体内多子浓度越高，表面要翻成同样浓的反型层，需要弯得更多；耗尽区里暴露的固定离子也更多，要更多栅电荷来平衡，所以 Vth 升高（虚线右移）。',
      'The heavier the doping, the higher the bulk majority concentration, so the surface must bend further to become an equally dense inverted layer; the depletion region also exposes more fixed ions that need more gate charge to balance, so Vth rises (dashed curve moves right).',
    ),
  },
  {
    id: 'oxide',
    title: loc('栅氧更厚', 'Thicker gate oxide'),
    sub: loc('Vth 升高', 'Vth rises'),
    shift: 0.25,
    text: loc(
      '氧化层越厚，单位面积电容 Cox 越小，同样的栅压感应出的电荷越少；要凑够耗尽区离子电荷，氧化层上要多承担电压 Qdep / Cox，所以 Vth 升高。这也是工艺把栅氧做薄就能降低 Vth 的原因。',
      'The thicker the oxide, the smaller the capacitance per area Cox, and the less charge a given gate voltage induces; to supply the depletion-region charge the oxide must drop more voltage, Qdep / Cox, so Vth rises. This is also why thinning the gate oxide lowers Vth.',
    ),
  },
  {
    id: 'gate',
    title: loc('栅材料的功函数', 'Gate-material work function'),
    sub: loc('把 Vth 整体平移', 'Shifts Vth as a whole'),
    shift: 0.4,
    text: loc(
      '栅材料和硅的功函数之差，决定了没加栅压时表面已经弯了多少（平带电压）。对 NMOS，栅功函数越大，要加更多正栅压才能把表面拉到反型，Vth 升高；PMOS 方向相反，功函数越小 |Vth| 越大。换栅材料（n+ 或 p+ 多晶硅、金属栅）就是在调这一项，图里用 0.4 V 示意。',
      'The work-function difference between gate material and silicon sets how much the surface is already bent with no gate voltage (the flat-band voltage). For an NMOS a larger gate work function needs more positive gate voltage to reach inversion, so Vth rises; for a PMOS it is reversed and a smaller work function gives a larger |Vth|. Changing the gate material (n+ or p+ poly, metal gate) tunes this term; 0.4 V is used here for illustration.',
    ),
  },
]

export const VTH_FORMULA = loc(
  '常用写法：Vth = VFB + 2φF + Qdep / Cox。VFB 由栅材料决定，2φF 和 Qdep 由衬底掺杂决定，Cox 由栅氧厚度决定，正好对应上面三张卡片。',
  'A common way to write it: Vth = VFB + 2φF + Qdep / Cox. VFB is set by the gate material, 2φF and Qdep by the substrate doping, and Cox by the oxide thickness, matching the three cards above.',
)

/* ---------- NMOS / PMOS 对照 ---------- */

const v = (x: number) => `${x < 0 ? '−' : '+'}${Math.abs(x).toFixed(1)} V`

export type PolCol = { id: Dev; title: LText; rows: Array<{ k: LText; v: LText }> }

export const POL_COLS: PolCol[] = [
  {
    id: 'n',
    title: loc('NMOS（n 沟道）', 'NMOS (n-channel)'),
    rows: [
      { k: loc('底', 'Base'), v: loc('p 型衬底，多子是空穴', 'p-type substrate, majority carriers are holes') },
      { k: loc('源漏', 'S / D'), v: loc('n+ 重掺杂，里面全是电子', 'n+ heavily doped, full of electrons') },
      { k: loc('B 接法', 'B tied to'), v: loc('p+ 接触，接最低电位 GND', 'p+ contact, tied to the lowest potential, GND') },
      { k: loc('导通条件', 'Turns on'), v: loc(`Vgs > Vth = ${v(VTN)}：栅上正电荷排斥空穴、吸引电子`, `Vgs > Vth = ${v(VTN)}: positive gate charge repels holes and attracts electrons`) },
      { k: loc('沟道载流子', 'Channel carriers'), v: loc('电子（从 n+ 源漏来）', 'electrons (supplied by the n+ source and drain)') },
      { k: loc('符号箭头', 'Symbol arrow'), v: loc('指向沟道（p 体 → n 沟道）', 'points into the channel (p body → n channel)') },
    ],
  },
  {
    id: 'p',
    title: loc('PMOS（p 沟道）', 'PMOS (p-channel)'),
    rows: [
      { k: loc('底', 'Base'), v: loc('n 阱（做在 p 衬底里），多子是电子', 'n-well (built inside a p-substrate), majority carriers are electrons') },
      { k: loc('源漏', 'S / D'), v: loc('p+ 重掺杂，里面全是空穴', 'p+ heavily doped, full of holes') },
      { k: loc('B 接法', 'B tied to'), v: loc('n+ 阱接触，接最高电位 VDD', 'n+ well contact, tied to the highest potential, VDD') },
      { k: loc('导通条件', 'Turns on'), v: loc(`Vgs < Vth = ${v(VTP)}：栅上负电荷排斥电子、吸引空穴`, `Vgs < Vth = ${v(VTP)}: negative gate charge repels electrons and attracts holes`) },
      { k: loc('沟道载流子', 'Channel carriers'), v: loc('空穴（从 p+ 源漏来）', 'holes (supplied by the p+ source and drain)') },
      { k: loc('符号箭头', 'Symbol arrow'), v: loc('背离沟道（n 体 ← p 沟道）', 'points out of the channel (n body ← p channel)') },
    ],
  },
]

export const POL_WHY = loc(
  '为什么极性相反：PMOS 把每一种掺杂都换成相反类型，载流子由电子换成空穴，电荷符号全部反号，所以栅压、阈值也都反号：NMOS 要 Vgs 为正且超过 +0.7 V，PMOS 要 Vgs 为负且低于 −0.7 V。',
  'Why the polarity is opposite: a PMOS swaps every doping type, the carriers change from electrons to holes and every charge sign flips, so the gate voltage and threshold flip too: an NMOS needs Vgs positive and above +0.7 V, a PMOS needs Vgs negative and below −0.7 V.',
)
