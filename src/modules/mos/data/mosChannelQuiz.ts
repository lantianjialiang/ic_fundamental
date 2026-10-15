import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { VTN, VTP } from '../model'
import { channelRatio } from './mosChannelModel'

const Q1_VGS = -1
const Q2_VGS = 0.4
const Q4_LOW = 1.7
const Q4_HIGH = 2.7
const Q5_VGS = -0.4

// 过驱动之比：沟道电荷 ∝ Vgs − Vth
const q4Ratio = channelRatio(Q4_HIGH, VTN) / channelRatio(Q4_LOW, VTN)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `NMOS 的 Vgs = ${Q1_VGS} V（Vds ≈ 0），栅氧下面的硅表面是什么状态？`,
      `An NMOS has Vgs = ${Q1_VGS} V (Vds ≈ 0). What is the silicon surface under the oxide doing?`,
    ),
    options: [
      { id: 'a', text: loc('耗尽：空穴被推开，露出固定负离子', 'Depletion: holes pushed away, fixed negative ions exposed') },
      { id: 'b', text: loc('反型：表面出现电子沟道', 'Inversion: an electron channel appears') },
      { id: 'c', text: loc('积累：空穴被拉到表面堆起来', 'Accumulation: holes are pulled up and pile at the surface') },
    ],
    answer: 'c',
    explain: loc(
      '栅压为负，栅上是负电荷，会吸引带正电的空穴到氧化层下面，所以是积累。表面没有电子，源漏之间仍然不导通；要把空穴推开、再吸来电子，需要正的栅压。',
      'A negative gate voltage puts negative charge on the gate, which attracts the positive holes up under the oxide, so this is accumulation. There are no electrons at the surface and source-drain still does not conduct; pushing holes away and attracting electrons needs a positive gate voltage.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `NMOS 的 Vth = ${VTN} V，现在 Vgs = +${Q2_VGS} V。表面是什么状态？D–S 通吗？`,
      `An NMOS has Vth = ${VTN} V and Vgs = +${Q2_VGS} V. What state is the surface in, and does D–S conduct?`,
    ),
    options: [
      { id: 'a', text: loc('反型，已有沟道，D–S 导通', 'Inversion, a channel exists, D–S conducts') },
      { id: 'b', text: loc('耗尽，还没有沟道，D–S 不通', 'Depletion, no channel yet, D–S does not conduct') },
      { id: 'c', text: loc('积累，空穴堆在表面，D–S 导通', 'Accumulation, holes pile at the surface, D–S conducts') },
    ],
    answer: 'b',
    explain: loc(
      `Vgs 为正，空穴已被推开，露出固定负离子，形成耗尽区；但 ${Q2_VGS} V < Vth = ${VTN} V，表面电子浓度还远低于体内空穴浓度，没有连通源漏的电子层，所以不通。`,
      `Vgs is positive, so the holes have been pushed away and fixed negative ions are exposed: a depletion region. But ${Q2_VGS} V < Vth = ${VTN} V, so the surface electron concentration is still far below the bulk hole concentration and no electron layer links source and drain; it does not conduct.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('下面哪一项不会改变 NMOS 的阈值电压 Vth？', 'Which of these does NOT change the threshold voltage Vth of an NMOS?'),
    options: [
      { id: 'a', text: loc('衬底掺杂浓度', 'Substrate doping concentration') },
      { id: 'b', text: loc('把沟道宽度 W 做大', 'Making the channel width W larger') },
      { id: 'c', text: loc('栅氧化层厚度', 'Gate oxide thickness') },
    ],
    answer: 'b',
    explain: loc(
      'Vth = VFB + 2φF + Qdep / Cox，只和掺杂（2φF、Qdep）、氧化层厚度（Cox）和栅材料（VFB）有关，都是单位面积上的性质。W 变大只是把沟道并联得更宽，电流成比例增大，表面翻转所需的栅压不变。',
      'Vth = VFB + 2φF + Qdep / Cox depends only on doping (2φF, Qdep), oxide thickness (Cox) and gate material (VFB), all per-unit-area properties. A larger W just puts more channel in parallel so the current grows in proportion, while the gate voltage needed to flip the surface stays the same.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `NMOS 已在反型区，Vgs 从 ${Q4_LOW} V 升到 ${Q4_HIGH} V（Vth = ${VTN} V）。沟道电子电荷和耗尽区深度怎么变？`,
      `An NMOS is already in inversion and Vgs rises from ${Q4_LOW} V to ${Q4_HIGH} V (Vth = ${VTN} V). What happens to the channel electron charge and the depletion depth?`,
    ),
    options: [
      { id: 'a', text: loc(`沟道电荷约变为 ${q4Ratio.toFixed(0)} 倍，耗尽区深度几乎不变`, `Channel charge about ×${q4Ratio.toFixed(0)}, depletion depth almost unchanged`) },
      { id: 'b', text: loc('沟道电荷不变，耗尽区继续变深', 'Channel charge unchanged, depletion keeps deepening') },
      { id: 'c', text: loc('沟道电荷和耗尽区深度都变为 2 倍', 'Both channel charge and depletion depth double') },
    ],
    answer: 'a',
    explain: loc(
      `沟道电荷 ∝ Cox·(Vgs − Vth)：过驱动从 ${(Q4_LOW - VTN).toFixed(1)} V 变到 ${(Q4_HIGH - VTN).toFixed(1)} V，电荷约 ${q4Ratio.toFixed(0)} 倍。过了阈值后新增的栅电荷由电子中和，耗尽区不再加深，所以深度几乎不变。`,
      `Channel charge ∝ Cox·(Vgs − Vth): the overdrive goes from ${(Q4_LOW - VTN).toFixed(1)} V to ${(Q4_HIGH - VTN).toFixed(1)} V, so the charge is about ×${q4Ratio.toFixed(0)}. Above threshold the added gate charge is balanced by electrons, so the depletion region stops deepening and its depth barely changes.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `PMOS 的 Vth = ${VTP} V，现在 Vgs = ${Q5_VGS} V（源和 n 阱接 0 V）。表面是什么状态？`,
      `A PMOS has Vth = ${VTP} V and Vgs = ${Q5_VGS} V (source and n-well at 0 V). What state is the surface in?`,
    ),
    options: [
      { id: 'a', text: loc('反型：空穴沟道已经形成', 'Inversion: the hole channel has formed') },
      { id: 'b', text: loc('积累：电子堆在表面', 'Accumulation: electrons pile at the surface') },
      { id: 'c', text: loc('耗尽：电子被推开，还没有沟道', 'Depletion: electrons pushed away, no channel yet') },
    ],
    answer: 'c',
    explain: loc(
      `Vgs 为负，栅上的负电荷把 n 阱里的电子推开，露出固定正离子；但 ${Q5_VGS} V 还没有比 Vth = ${VTP} V 更负，表面空穴不够多，没有沟道。PMOS 要 Vgs 低于 ${VTP} V 才导通。`,
      `Vgs is negative, so the negative gate charge pushes the n-well electrons away and exposes fixed positive ions; but ${Q5_VGS} V is not yet more negative than Vth = ${VTP} V, so there are not enough holes at the surface and no channel. A PMOS needs Vgs below ${VTP} V to conduct.`,
    ),
  },
]
