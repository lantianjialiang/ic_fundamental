import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerPart: loc('剖面结构', 'Cross-section'),
  kickerState: loc('沟道动画', 'Channel animation'),
  kickerCap: loc('MOS 电容', 'MOS capacitor'),
  kickerVth: loc('阈值电压', 'Threshold voltage'),
  kickerPol: loc('极性', 'Polarity'),
  introTitle: loc('栅极不碰沟道，凭什么控制电流', 'The gate never touches the channel, so how does it control current?'),
  partTitle: loc('先认剖面：一层一层是什么', 'First read the cross-section, layer by layer'),
  partNote: loc(
    '点图里的区域或下面的卡片，看这一层的材料、作用和为什么这样做。上面的 NMOS / PMOS 切换对全课的图都有效。',
    'Click a region in the figure or a card below to see what the layer is made of, what it does and why it is built that way. The NMOS / PMOS switch above applies to every figure in this lesson.',
  ),
  nmos: loc('NMOS', 'NMOS'),
  pmos: loc('PMOS', 'PMOS'),
  animTitle: loc('拖动 Vgs：沟道一点点长出来', 'Drag Vgs and watch the channel grow'),
  animNote: loc(
    'Vds ≈ 0，源极和衬底都接 0 V（PMOS 的源极和 n 阱接在一起）。金色圈里的 + 是空穴，蓝色点里的 − 是电子，方块是不能动的杂质离子；栅上的 + / − 是栅电荷。先点下面的按钮跳到某个状态，再拖滑块细看。',
    'Vds ≈ 0, and source and body are both at 0 V (for PMOS, the source and n-well are tied together). Gold circles with + are holes, blue dots with − are electrons, squares are fixed dopant ions that cannot move; the + / − on the gate are gate charge. Jump to a state with the buttons first, then drag the slider for detail.',
  ),
  afterAnim: loc(
    '沟道有了以后再加 Vds，电流怎么变、什么时候夹断，见 {@mosRegion}。',
    'Once the channel exists, what adding Vds does and when it pinches off is covered in {@mosRegion}.',
  ),
  jump: loc('跳到状态', 'Jump to a state'),
  shift: loc('变化', 'Change'),
  vthNow: loc('Vth（现在）', 'Vth (now)'),
  vgs: loc('栅源电压 Vgs', 'Gate-source voltage Vgs'),
  rState: loc('表面状态', 'Surface state'),
  rOver: loc('Vgs − Vth', 'Vgs − Vth'),
  rCharge: loc('沟道电荷（相对）', 'Channel charge (relative)'),
  rDepth: loc('耗尽深度（相对阈值时）', 'Depletion depth (vs. at threshold)'),
  why: loc('为什么：', 'Why: '),
  plotTitle: loc('电荷和耗尽深度随 Vgs 的变化', 'Charge and depletion depth versus Vgs'),
  capTitle: loc('MOS 电容：积累、耗尽、反型', 'The MOS capacitor: accumulation, depletion, inversion'),
  capNote: loc(
    '去掉源和漏，只剩「栅 – 氧化层 – 硅」，它就是一个平板电容。分步看栅上的电荷和硅里的电荷怎样一一对应。',
    'Remove the source and drain and only “gate – oxide – silicon” is left: a parallel-plate capacitor. Step through to see how the charge on the gate is matched by charge in the silicon.',
  ),
  vthTitle: loc('阈值电压 Vth 到底是什么', 'What the threshold voltage Vth really is'),
  vthNote: loc(
    '曲线是表面的电子、空穴浓度（对数坐标）。点卡片看哪些因素会把 Vth 往哪边推；虚线是改变以后的曲线。',
    'The curves are the electron and hole concentrations at the surface (log scale). Click a card to see which factors push Vth which way; the dashed curve is after the change.',
  ),
  polTitle: loc('NMOS 和 PMOS 为什么极性相反', 'Why NMOS and PMOS have opposite polarity'),
  polNote: loc('点一栏切换上面所有图里的管子类型。', 'Click a column to switch the transistor type in every figure above.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '沟道有了以后再加 Vds，电流怎么变、什么时候夹断，是下一课「三种工作状态」的内容。',
    'Once the channel exists, what happens when you add Vds, and when it pinches off, is the subject of the next lesson, “The Three Operating Regions”.',
  ),
  next: loc('下一课：三种工作状态', 'Next: The three operating regions'),
}

export const INTRO: LText[] = [
  loc(
    '{@mosIntro} 里把 MOS 管当成一个「电压控制的开关」。可是栅极和硅之间隔着一层绝缘的二氧化硅，没有电流流进去。它靠的是电场：栅极和硅就像电容的两块极板，栅上加了电荷，硅表面就必须出现等量的反号电荷。',
    'In {@mosIntro} the MOSFET was treated as a “voltage-controlled switch”. But between the gate and the silicon sits an insulating layer of silicon dioxide, so no current flows into the gate. It works through the electric field: gate and silicon are the two plates of a capacitor, so charge put on the gate must be matched by equal and opposite charge at the silicon surface.',
  ),
  loc(
    '这一课看 NMOS 硅表面的那层电荷怎样从「空穴」变成「没有可动电荷」，再变成「电子」。当表面电子多到能把 n+ 源和 n+ 漏连起来时，就有了沟道。这些层是怎么做出来的，见 {@pSilicon}。',
    'This lesson follows how the charge at an NMOS silicon surface changes from “holes” to “no mobile charge” to “electrons”. When there are enough surface electrons to connect the n+ source to the n+ drain, a channel exists. How these layers are fabricated is covered in {@pSilicon}.',
  ),
]

export type PartId = 'sub' | 'sd' | 'oxide' | 'gate' | 'body' | 'sti'

export const PARTS: Array<{ id: PartId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'sub',
    title: loc('衬底 / 阱', 'Substrate / well'),
    sub: loc('NMOS：p 型；PMOS：n 阱', 'NMOS: p-type; PMOS: n-well'),
    text: loc(
      'NMOS 直接做在 p 型硅衬底上，里面掺了受主（如硼），可动的多数载流子是空穴。PMOS 需要 n 型的底，所以先在 p 衬底里扩散出一块 n 阱，多数载流子是电子。沟道就出现在衬底（或阱）紧贴栅氧的最上面几纳米。',
      'An NMOS is built directly on a p-type silicon substrate doped with acceptors (such as boron); its mobile majority carriers are holes. A PMOS needs an n-type base, so an n-well is first diffused into the p-substrate; its majority carriers are electrons. The channel appears in the top few nanometres of the substrate (or well), right against the gate oxide.',
    ),
  },
  {
    id: 'sd',
    title: loc('源极和漏极', 'Source and drain'),
    sub: loc('NMOS：n+；PMOS：p+', 'NMOS: n+; PMOS: p+'),
    text: loc(
      '源、漏是和衬底反型的重掺杂区（NMOS 是 n+），里面有大量电子。它们和 p 衬底之间是 PN 结，平时反偏或零偏，所以不加栅压时源漏之间是「背靠背两个二极管」，不导电。结构上源漏对称，接低电位的那个叫源。',
      'The source and drain are heavily doped regions of the opposite type to the substrate (n+ for NMOS), full of electrons. Each forms a PN junction with the p-substrate that is normally reverse- or zero-biased, so with no gate voltage the path from source to drain is “two back-to-back diodes” and does not conduct. Physically they are symmetric; whichever is at the lower potential is called the source.',
    ),
  },
  {
    id: 'oxide',
    title: loc('栅氧化层', 'Gate oxide'),
    sub: loc('很薄的 SiO₂，绝缘', 'Very thin SiO₂, an insulator'),
    text: loc(
      '栅和沟道之间的二氧化硅，先进工艺只有 1–2 nm，老工艺也只有几十 nm（图里为了看得见画厚了）。它越薄，单位面积电容 Cox 越大，同样的栅压能在表面感应出越多电荷，所以管子越「灵」；但太薄会漏电，也更怕静电击穿。',
      'The silicon dioxide between gate and channel is only 1–2 nm thick in advanced processes and a few tens of nm in old ones (drawn thicker here so you can see it). The thinner it is, the larger the capacitance per area Cox, so the same gate voltage induces more surface charge and the transistor responds more strongly; but too thin leaks and is more easily destroyed by static.',
    ),
  },
  {
    id: 'gate',
    title: loc('多晶硅栅', 'Poly-Si gate'),
    sub: loc('电容的上极板', 'The top plate of the capacitor'),
    text: loc(
      '栅极是重掺杂的多晶硅（NMOS 通常 n+ 多晶硅，PMOS 通常 p+），导电性好，用来在栅氧上加电压。新工艺换成金属栅加高 k 介质，但原理一样。栅的宽度方向就是源到漏的距离，叫沟道长度 L。',
      'The gate is heavily doped polycrystalline silicon (usually n+ poly for NMOS, p+ for PMOS); it conducts well and applies the voltage across the oxide. Newer processes switch to metal gates with high-k dielectrics, but the principle is the same. The gate width in the drawing is the source-to-drain distance, called the channel length L.',
    ),
  },
  {
    id: 'body',
    title: loc('衬底接触 B', 'Body contact B'),
    sub: loc('NMOS：p+；PMOS：n+', 'NMOS: p+; PMOS: n+'),
    text: loc(
      '衬底也要有确定的电位，否则表面电荷没有参照。p 型衬底用 p+ 区接金属（重掺杂才能形成欧姆接触，而不是二极管），NMOS 的 B 一般接最低电位 GND；PMOS 的 n 阱用 n+ 区接到 VDD。这样所有源漏 PN 结都不会正偏。',
      'The substrate must also sit at a defined potential, otherwise the surface charge has no reference. A p-type substrate is tied to metal through a p+ region (heavy doping gives an ohmic contact rather than a diode); the NMOS body B usually goes to the lowest potential, GND. A PMOS n-well is tied to VDD through an n+ region. That way no source/drain PN junction is ever forward-biased.',
    ),
  },
  {
    id: 'sti',
    title: loc('浅槽隔离 STI', 'Shallow trench isolation (STI)'),
    sub: loc('把相邻区域隔开的氧化物', 'Oxide separating neighbouring regions'),
    text: loc(
      '刻一条槽填满二氧化硅，把衬底接触和源极、以及相邻的管子隔开，表面不会意外形成导电通路。老工艺用 LOCOS 局部氧化，作用一样。',
      'A trench is etched and filled with silicon dioxide to separate the body contact from the source, and one transistor from the next, so no conducting path forms at the surface by accident. Older processes used LOCOS local oxidation for the same job.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc('栅、栅氧、硅构成一个电容：栅上有多少电荷，硅表面就有多少反号电荷，栅极本身不取直流电流。', 'Gate, oxide and silicon form a capacitor: whatever charge sits on the gate is matched by opposite charge at the silicon surface, and the gate draws no DC current.'),
  loc('NMOS 加正栅压先把空穴推走，留下不能动的负离子（耗尽）；栅压超过 Vth 后表面开始堆积电子（反型），连通 n+ 源漏才形成沟道。', 'A positive gate voltage on an NMOS first pushes the holes away, leaving immobile negative ions (depletion); above Vth electrons gather at the surface (inversion) and, connecting the n+ source and drain, form the channel.'),
  loc('Vth 的物理意义：表面变成和体内 p 型一样「浓」的 n 型。它由衬底掺杂、栅氧厚度和栅材料决定，不是随便定的数字。', 'Physical meaning of Vth: the surface has become as strongly n-type as the bulk is p-type. It is set by substrate doping, oxide thickness and gate material, not an arbitrary number.'),
  loc('超过 Vth 后，多出来的栅压几乎全部变成沟道电子，耗尽区不再加深，所以沟道电荷 ∝ Vgs − Vth。', 'Above Vth almost all extra gate voltage turns into channel electrons and the depletion region stops deepening, so channel charge ∝ Vgs − Vth.'),
  loc('PMOS 把所有掺杂类型对调（n 阱、p+ 源漏），载流子换成空穴，所以要负的 Vgs 才导通，Vth 是负数。', 'A PMOS swaps every doping type (n-well, p+ source/drain) and uses holes as carriers, so it needs a negative Vgs to turn on and its Vth is negative.'),
]
