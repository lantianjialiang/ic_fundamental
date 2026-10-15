import { loc, type LText } from '../../../i18n/locale'
import { type ChState, type Dev } from './mosChannelModel'

/** 图里和读数里用到的短文字 */
export const FIG = {
  anchorNote: loc('Vds ≈ 0 · S 和 B 同为 0 V', 'Vds ≈ 0 · S and B both at 0 V'),
  gate: loc('多晶硅栅', 'Poly-Si gate'),
  oxide: loc('栅氧 SiO₂', 'Gate oxide SiO₂'),
  sti: loc('STI', 'STI'),
  subN: loc('p 型衬底', 'p-type substrate'),
  subP: loc('n 阱', 'n-well'),
  hole: loc('空穴', 'Hole'),
  electron: loc('电子', 'Electron'),
  ionN: loc('固定负离子', 'Fixed negative ion'),
  ionP: loc('固定正离子', 'Fixed positive ion'),
  depletion: loc('耗尽区', 'Depletion region'),
  channel: loc('沟道', 'Channel'),
  accLayer: loc('积累层', 'Accumulation layer'),
  qGate: loc('栅上电荷', 'Gate charge'),
  qSi: loc('硅里电荷', 'Silicon charge'),
  contact: loc('金属接触', 'Metal contact'),
  capSi: loc('硅（没有源漏）', 'Silicon (no source or drain)'),
  capNoSd: loc('只剩 栅 – 氧化层 – 硅', 'Only gate – oxide – silicon'),
  partsCap: loc(
    'NMOS / PMOS 剖面（示意：氧化层、结深都画厚了，比例不按真实工艺）',
    'NMOS / PMOS cross-section (schematic: oxide and junction depths are exaggerated, not to process scale)',
  ),
  animCap: loc(
    '剖面里的粒子位置是固定的伪随机点，由 Vgs 决定哪些空穴被推走、多少电子进入表面；耗尽深度和电子数量用教学模型计算（示意参数）。',
    'Particle sites are fixed pseudo-random points; Vgs decides which holes are pushed away and how many electrons enter the surface. Depletion depth and electron count come from a teaching model (illustrative parameters).',
  ),
  capFigCap: loc(
    '去掉源漏的 MOS 电容：栅上多少电荷，硅里就出现等量反号电荷（示意）。',
    'The MOS capacitor without source and drain: whatever charge is on the gate appears as equal and opposite charge in the silicon (schematic).',
  ),
  plotCap: loc(
    '三条曲线都用同一个教学模型（Vth = 0.7 V，示意参数）；竖线是当前 Vgs，虚线是 Vth。',
    'All three curves use the same teaching model (Vth = 0.7 V, illustrative parameters); the vertical line is the current Vgs and the dashed line is Vth.',
  ),
  plotAcc: loc('积累层电荷', 'Accumulation charge'),
  plotDep: loc('耗尽深度', 'Depletion depth'),
  plotInv: loc('沟道电荷', 'Channel charge'),
  vthCap: loc(
    '示意参数：体内掺杂 1e17 cm⁻³，ni = 1e10 cm⁻³；阈值处表面少子浓度等于体内多子浓度。',
    'Illustrative parameters: bulk doping 1e17 cm⁻³, ni = 1e10 cm⁻³; at threshold the surface minority concentration equals the bulk majority concentration.',
  ),
  vthBulk: loc('体内多子浓度', 'Bulk majority concentration'),
  vthMin: loc('表面少子（沟道载流子）', 'Surface minority (channel carriers)'),
  vthMaj: loc('表面多子', 'Surface majority'),
  vthAfter: loc('改变后', 'After the change'),
  vthMark: loc('Vth', 'Vth'),
  relative: loc('相对值', 'Relative'),
  surfaceConc: loc('表面浓度 cm⁻³（对数）', 'Surface concentration, cm⁻³ (log)'),
}

export const STATE_SHORT: Record<ChState, LText> = {
  acc: loc('积累', 'Accumulation'),
  flat: loc('零偏（中性）', 'Zero bias (neutral)'),
  dep: loc('耗尽', 'Depletion'),
  th: loc('阈值', 'Threshold'),
  inv: loc('反型（沟道已通）', 'Inversion (channel on)'),
}

/** 读数标签 */
export const RO = {
  state: loc('表面状态', 'Surface state'),
  overN: loc('Vgs − Vth', 'Vgs − Vth'),
  overP: loc('Vgs − Vth（负 = 导通）', 'Vgs − Vth (negative = on)'),
  charge: loc('沟道电荷（相对）', 'Channel charge (relative)'),
  depth: loc('耗尽深度（相对阈值时）', 'Depletion depth (vs. at threshold)'),
  gateQ: loc('栅上电荷（相对）', 'Gate charge (relative)'),
  accQ: loc('积累电荷（相对）', 'Accumulation charge (relative)'),
}

export type StateText = { title: LText; text: LText }

export const STATE_TEXT: Record<Dev, Record<ChState, StateText>> = {
  n: {
    acc: {
      title: loc('积累：空穴被拉向表面', 'Accumulation: holes are pulled to the surface'),
      text: loc(
        'Vgs 为负，栅上是负电荷，把硅里带正电的空穴吸到栅氧下面堆起来，表面比体内更“p”。表面上只有空穴、没有电子，n+ 源漏之间仍是背靠背两个 PN 结，所以不导通；空穴再多也不会形成沟道。',
        'Vgs is negative, so the gate carries negative charge and attracts the positive holes up under the oxide; the surface becomes even “more p” than the bulk. There are holes but no electrons at the surface, and between the n+ regions there are still two back-to-back PN junctions, so nothing conducts; more holes never make a channel.',
      ),
    },
    flat: {
      title: loc('零偏：表面和体内一样', 'Zero bias: the surface looks like the bulk'),
      text: loc(
        'Vgs = 0 时栅上没有净电荷，硅里处处是中性的：每个空穴旁边有一个固定的负离子，正负抵消。（教学模型把平带电压取 0；真实器件的平带电压由栅材料和氧化层电荷决定，通常不是 0。）',
        'At Vgs = 0 the gate carries no net charge and the silicon is neutral everywhere: every hole is paired with a fixed negative ion and they cancel. (The teaching model takes the flat-band voltage as 0; in a real device it depends on the gate material and oxide charge and is usually not 0.)',
      ),
    },
    dep: {
      title: loc('耗尽：空穴被推开，露出固定负离子', 'Depletion: holes are pushed away, exposing fixed negative ions'),
      text: loc(
        'Vgs 为正但还没到 Vth，栅上的正电荷把空穴往下推走。离开的地方留下不能动的受主负离子（−），这层没有可动载流子的区域就是耗尽区，它的负电荷正好等于栅上的正电荷。Vgs 越大耗尽区越深；但表面仍几乎没有电子，所以还没有沟道，D–S 不通。',
        'Vgs is positive but still below Vth, so the positive charge on the gate pushes the holes down and away. What is left behind are immobile acceptor ions (−); this layer with no mobile carriers is the depletion region, and its negative charge equals the positive charge on the gate. A larger Vgs makes it deeper, but there are still almost no electrons at the surface, so there is no channel yet and D–S does not conduct.',
      ),
    },
    th: {
      title: loc('阈值：表面电子浓度追上体内空穴浓度', 'Threshold: surface electrons match the bulk hole concentration'),
      text: loc(
        'Vgs = Vth 时，表面的电子浓度刚好等于体内的空穴浓度：表面变得“和体内一样浓，但是 n 型”。从这里开始电子才多到能连成导电层，耗尽区也达到最深，之后不再加深。',
        'At Vgs = Vth the electron concentration at the surface just equals the hole concentration in the bulk: the surface is “as strongly doped as the bulk, but n-type”. From here electrons are numerous enough to form a conducting layer, and the depletion region reaches its maximum depth and stops growing.',
      ),
    },
    inv: {
      title: loc('反型：电子聚成沟道，连通 n+ 源漏', 'Inversion: electrons form the channel linking the n+ source and drain'),
      text: loc(
        'Vgs 超过 Vth 后，多出来的栅电荷不再把耗尽区推得更深，而是被电子中和：n+ 源漏给表面供应电子，堆成一层很薄的电子层，把 n+ 源和 n+ 漏连成一条通道，这就是沟道。沟道电荷 ∝ Cox·(Vgs − Vth)，所以 Vgs 越高沟道越“厚”、电阻越小。',
        'Above Vth the extra gate charge no longer pushes the depletion region deeper; it is balanced by electrons instead: the n+ source and drain supply electrons that pile up in a very thin layer at the surface, linking the n+ source to the n+ drain, and that layer is the channel. Channel charge ∝ Cox·(Vgs − Vth), so a higher Vgs gives a “thicker” channel and a lower resistance.',
      ),
    },
  },
  p: {
    acc: {
      title: loc('积累：电子被拉向表面', 'Accumulation: electrons are pulled to the surface'),
      text: loc(
        'PMOS 的 Vgs 为正，栅上是正电荷，把 n 阱里带负电的电子吸到栅氧下面堆起来，表面比体内更“n”。表面上只有电子、没有空穴，p+ 源漏之间仍是背靠背两个 PN 结，所以不导通。',
        'For a PMOS a positive Vgs puts positive charge on the gate, which attracts the negative electrons of the n-well up under the oxide; the surface becomes even “more n” than the bulk. There are electrons but no holes at the surface, and between the p+ regions there are still two back-to-back PN junctions, so nothing conducts.',
      ),
    },
    flat: {
      title: loc('零偏：表面和体内一样', 'Zero bias: the surface looks like the bulk'),
      text: loc(
        'Vgs = 0 时栅上没有净电荷，n 阱里处处是中性的：每个电子旁边有一个固定的正离子，正负抵消。（教学模型把平带电压取 0。）',
        'At Vgs = 0 the gate carries no net charge and the n-well is neutral everywhere: every electron is paired with a fixed positive ion and they cancel. (The teaching model takes the flat-band voltage as 0.)',
      ),
    },
    dep: {
      title: loc('耗尽：电子被推开，露出固定正离子', 'Depletion: electrons are pushed away, exposing fixed positive ions'),
      text: loc(
        'Vgs 为负但还没到 Vth（−0.7 V），栅上的负电荷把电子往下推走，留下不能动的施主正离子（+）。这层没有可动载流子的区域是耗尽区，它的正电荷等于栅上的负电荷。Vgs 越负耗尽区越深；表面仍几乎没有空穴，所以还没有沟道。',
        'Vgs is negative but still above Vth (−0.7 V), so the negative charge on the gate pushes the electrons down and away, leaving immobile donor ions (+). This layer with no mobile carriers is the depletion region and its positive charge equals the negative charge on the gate. The more negative Vgs is, the deeper it gets; there are still almost no holes at the surface, so there is no channel yet.',
      ),
    },
    th: {
      title: loc('阈值：表面空穴浓度追上体内电子浓度', 'Threshold: surface holes match the bulk electron concentration'),
      text: loc(
        'Vgs = Vth（−0.7 V）时，表面的空穴浓度刚好等于 n 阱体内的电子浓度：表面变得“和体内一样浓，但是 p 型”。从这里开始空穴才多到能连成导电层，耗尽区也达到最深，之后不再加深。',
        'At Vgs = Vth (−0.7 V) the hole concentration at the surface just equals the electron concentration in the n-well bulk: the surface is “as strongly doped as the bulk, but p-type”. From here holes are numerous enough to form a conducting layer, and the depletion region reaches its maximum depth and stops growing.',
      ),
    },
    inv: {
      title: loc('反型：空穴聚成沟道，连通 p+ 源漏', 'Inversion: holes form the channel linking the p+ source and drain'),
      text: loc(
        'Vgs 比 Vth 更负以后，多出来的栅电荷不再把耗尽区推得更深，而是被空穴中和：p+ 源漏给表面供应空穴，堆成一层很薄的空穴层，把 p+ 源和 p+ 漏连起来，这就是 P 沟道。沟道电荷 ∝ Cox·(|Vgs| − |Vth|)，所以 Vgs 越负沟道越“厚”。',
        'Once Vgs is more negative than Vth the extra gate charge no longer pushes the depletion region deeper; it is balanced by holes instead: the p+ source and drain supply holes that pile up in a very thin layer, linking the p+ source to the p+ drain, and that layer is the P channel. Channel charge ∝ Cox·(|Vgs| − |Vth|), so the more negative Vgs is, the “thicker” the channel.',
      ),
    },
  },
}
