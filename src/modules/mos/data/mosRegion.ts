import { loc, type LText } from '../../../i18n/locale'
import { type Region } from '../model'

export const S = {
  kickerRegion: loc('当前工作区', 'Current region'),
  kickerFormula: loc('公式', 'Formula'),
  kickerFlow: loc('判断流程', 'Decision flow'),
  introTitle: loc('同一个管子，为什么有时像开关、有时像恒流源', 'One transistor: why does it act like a switch at times and a current source at others?'),
  coreTitle: loc('拖动 Vgs 和 Vds', 'Drag Vgs and Vds'),
  coreNote: loc(
    '左上：NMOS 剖面，沟道厚度按「栅极电压减去该点沟道电压」变化；右上：Id–Vds 输出特性，虚线是线性区和饱和区的边界；左下：Id–Vgs 转移特性。三张图的数字都来自同一个模型。',
    'Top left: NMOS cross-section, channel thickness follows “gate voltage minus local channel voltage”. Top right: the Id–Vds output curves, the dashed line is the linear / saturation boundary. Bottom left: the Id–Vgs transfer curve. All three use the same model.',
  ),
  vgs: loc('栅源电压 Vgs', 'Gate-source voltage Vgs'),
  vds: loc('漏源电压 Vds', 'Drain-source voltage Vds'),
  rVov: loc('过驱动 Vov = Vgs − Vth', 'Overdrive Vov = Vgs − Vth'),
  rRegion: loc('工作区', 'Region'),
  rId: loc('漏极电流 Id', 'Drain current Id'),
  rReq: loc('线性区等效 R ≈ 1/(k·Vov)', 'Linear-region R ≈ 1/(k·Vov)'),
  rRds: loc('此刻 Vds / Id', 'Vds / Id right now'),
  noValue: loc('—（不在线性区）', '— (not in linear)'),
  flowTitle: loc('过驱动电压和判断流程', 'Overdrive voltage and the decision flow'),
  flowNote: loc(
    '判断一个管子在哪个区，只要两步：先算 Vov，再比一比 Vds。图里高亮的是上面旋钮当前所走的路径。',
    'Telling the region takes two steps: compute Vov, then compare with Vds. The highlighted path is the one the knobs above currently take.',
  ),
  step1: loc('第 1 步：Vov = Vgs − Vth', 'Step 1: Vov = Vgs − Vth'),
  step2: loc('第 2 步：Vds 和 Vov 比大小', 'Step 2: compare Vds with Vov'),
  step2Skip: loc('Vov ≤ 0，不用比了，直接截止', 'Vov ≤ 0, no need to compare: it is cut off'),
  formulaTitle: loc('公式只讲结论', 'Formulas: conclusions only'),
  formulaNote: loc(
    '不推导，只记每个区的结论和它成立的原因。点一张卡片，下面用当前的 Vgs、Vds 代入，对比公式值和模型值。',
    'No derivations, only each region’s result and why it holds. Pick a card and the current Vgs and Vds are plugged in, comparing the formula with the model.',
  ),
  fValue: loc('公式值', 'Formula value'),
  fModel: loc('模型值 nId', 'Model value nId'),
  fApplies: loc('当前偏置适用吗', 'Applies at this bias?'),
  fYes: loc('适用', 'Yes'),
  fNo: loc('不适用', 'No'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '把管子当开关用时，只用截止区和线性区的两头，导通电阻 Rds(on) 见下一课「MOS 管作为开关」；两管串起来、在饱和区和线性区之间滑动，就是反相器的传输特性。',
    'Used as a switch, a MOSFET only uses the two ends: cutoff and deep linear region. Rds(on) is in the next lesson, “The MOSFET as a Switch”. Two transistors in series sliding between saturation and linear give the inverter’s transfer curve.',
  ),
  next: loc('下一课：MOS 管作为开关', 'Next: The MOSFET as a switch'),
}

export const INTRO: LText[] = [
  loc(
    '{@mosChannel} 讲了栅极电压怎么在硅表面「拉」出沟道。这一课再加一个量：漏源电压 Vds。沟道有了以后，漏极一加电压，沟道里各点的电势就不一样了，靠近漏的地方栅极「压」得没那么狠，沟道也就变薄。随着 Vds 变大，沟道厚薄的分布不同，MOS 管就出现了三种完全不同的脾气。',
    '{@mosChannel} showed how gate voltage pulls a channel out of the silicon surface. This lesson adds one more quantity: the drain-source voltage Vds. Once the channel exists and the drain is raised, the potential is no longer the same along the channel: near the drain the gate has less “pull”, so the channel gets thinner. How that thickness is distributed changes with Vds, and that gives the MOSFET three very different behaviours.',
  ),
  loc(
    '先把三个区分清：截止区像断开的开关，线性区像一个电阻（电阻值由 Vgs 控制），饱和区像一个电流源（电流由 Vgs 控制，和 Vds 几乎无关）。电阻、二极管这些元件的 I-V 曲线可以先看 {@pParts}；用万用表量电压电流的方法见 {@pMeasure}。',
    'First tell the three apart: cutoff is an open switch, the linear region is a resistor (its value set by Vgs), and saturation is a current source (its value set by Vgs, nearly independent of Vds). I-V curves of resistors and diodes are in {@pParts}; measuring voltage and current is in {@pMeasure}.',
  ),
]

export const VOV_TEXT: LText[] = [
  loc(
    '过驱动电压 Vov = Vgs − Vth，就是栅极电压超过阈值的那一截。它同时决定三件事：沟道有多厚（Vov 越大电子越多）、线性区的电阻（R = 1/(k·Vov)，Vov 越大越小）、饱和电流（Id = k/2·Vov²，Vov 越大越大）。Vov ≤ 0 时三件事都是「没有」，所以是截止区。',
    'The overdrive voltage Vov = Vgs − Vth is how far the gate voltage exceeds the threshold. It sets three things at once: how thick the channel is (the larger Vov, the more electrons), the linear-region resistance (R = 1/(k·Vov), smaller for larger Vov) and the saturation current (Id = k/2·Vov², larger for larger Vov). With Vov ≤ 0 all three are “none”, which is cutoff.',
  ),
  loc(
    'Vov 也是「线性和饱和」的分界线：Vds 小于 Vov，漏端沟道还有厚度；Vds 到达 Vov，漏端厚度刚好变成 0，开始夹断。所以同一个管子，Vgs 越大，要更大的 Vds 才会进入饱和区。',
    'Vov is also the line between linear and saturation: while Vds is below Vov the drain end still has thickness; when Vds reaches Vov the drain-end thickness just becomes 0 and pinch-off starts. So for the same transistor, a larger Vgs needs a larger Vds before it enters saturation.',
  ),
]

export type RegionItem = {
  id: Region
  name: LText
  cond: LText
  title: LText
  text: LText
  detail: LText
  tone?: 'warn' | 'bad' | 'ok'
}

/** 显示顺序：截止、线性、饱和；初始选中第 0 个 */
export const REGIONS: RegionItem[] = [
  {
    id: 'cutoff',
    name: loc('截止区', 'Cutoff'),
    cond: loc('Vgs ≤ Vth（Vov ≤ 0）', 'Vgs ≤ Vth (Vov ≤ 0)'),
    title: loc('截止区：没有沟道，Id ≈ 0', 'Cutoff: no channel, Id ≈ 0'),
    text: loc(
      'Vgs 还没到 Vth，硅表面没有反型出电子，源和漏之间隔着 p 型衬底，像两个背靠背的 PN 结，所以不管 Vds 多大，Id ≈ 0。管子相当于断开的开关。',
      'Vgs has not reached Vth, so the silicon surface has no inversion electrons. Source and drain are separated by p-type body, like two back-to-back PN junctions, so Id ≈ 0 whatever Vds is. The transistor is an open switch.',
    ),
    detail: loc(
      '为什么：Vgs ≤ Vth 时栅下面只有耗尽层（没有可动电子），源到漏的路径上有两个反向的 PN 结，电流被挡住。真实管子还会漏一点点亚阈值电流，这里的模型当作 0，见 {@mosReal}。',
      'Why: with Vgs ≤ Vth only a depletion layer sits under the gate (no mobile electrons), and the path from source to drain contains two opposing PN junctions that block current. Real devices leak a little subthreshold current; the model here counts it as 0, see {@mosReal}.',
    ),
    tone: 'warn',
  },
  {
    id: 'linear',
    name: loc('线性区', 'Linear'),
    cond: loc('Vgs > Vth 且 Vds < Vov', 'Vgs > Vth and Vds < Vov'),
    title: loc('线性区（三极管区）：受控电阻', 'Linear (triode) region: a controlled resistor'),
    text: loc(
      '沟道从源一直连到漏，只是越靠近漏越薄。Vds 很小时厚度近似处处相同，Id 和 Vds 成正比，管子是一个电阻 R = 1/(k·Vov)。Vgs 越大，Vov 越大，电阻越小。',
      'The channel runs unbroken from source to drain, just thinner towards the drain. For small Vds the thickness is nearly uniform and Id is proportional to Vds: the transistor is a resistor R = 1/(k·Vov). The larger Vgs, the larger Vov and the smaller R.',
    ),
    detail: loc(
      '为什么越靠近漏越薄：沟道里各点的电压从源的 0 V 逐渐升到 Vds，某一点上栅极和沟道之间只剩 Vgs − V(x) 的压差，而沟道电荷正比于 (Vgs − V(x) − Vth)。Vds 越大，漏端越薄；Vds 增大到 Vov 时，漏端的厚度刚好变成 0。',
      'Why thinner towards the drain: the voltage in the channel rises from 0 V at the source to Vds, so at a point x the gate-to-channel difference is only Vgs − V(x), and channel charge is proportional to (Vgs − V(x) − Vth). The larger Vds, the thinner the drain end; when Vds reaches Vov the drain-end thickness just hits 0.',
    ),
    tone: 'ok',
  },
  {
    id: 'sat',
    name: loc('饱和区', 'Saturation'),
    cond: loc('Vgs > Vth 且 Vds ≥ Vov', 'Vgs > Vth and Vds ≥ Vov'),
    title: loc('饱和区：沟道夹断，电流趋于恒定', 'Saturation: channel pinched off, current nearly constant'),
    text: loc(
      'Vds ≥ Vov 时，漏端附近栅极对沟道的压差已经低于 Vth，沟道在靠近漏的地方被夹断。电流没有断：电子从夹断点被漏极的电场扫过去。Id 只由 Vov 决定，Id = k/2·Vov²，再加 Vds 只让曲线略微上翘。',
      'When Vds ≥ Vov, near the drain the gate-to-channel difference falls below Vth and the channel pinches off. Current does not stop: electrons are swept from the pinch-off point to the drain by its field. Id depends on Vov only, Id = k/2·Vov², and more Vds just tilts the curve up slightly.',
    ),
    detail: loc(
      '为什么电流不再随 Vds 增长：夹断点处沟道电压固定在 Vov，源到夹断点之间的电压差永远是 Vov，驱动电流的「压差」就不变；多出来的 Vds − Vov 落在夹断点和漏之间的耗尽区上。Vds 越大，夹断点越向源极挪、沟道略变短，所以 Id 略增，斜率由沟道长度调制系数 λ 决定。',
      'Why current stops growing with Vds: at the pinch-off point the channel voltage is fixed at Vov, so the voltage across the part from source to pinch-off is always Vov and the driving difference does not change; the extra Vds − Vov drops across the depletion gap between pinch-off and drain. Larger Vds moves the pinch-off point towards the source, the channel gets slightly shorter and Id rises a little, with a slope set by the channel-length modulation coefficient λ.',
    ),
    tone: 'ok',
  },
]

export type Preset = { id: Region; vgs: number; vds: number }

/** 快速设置：和 REGIONS 同序 */
export const PRESETS: Preset[] = [
  { id: 'cutoff', vgs: 0.5, vds: 1.5 },
  { id: 'linear', vgs: 2.5, vds: 0.5 },
  { id: 'sat', vgs: 2, vds: 2.5 },
]

export const TAKEAWAY: LText[] = [
  loc(
    '先算 Vov = Vgs − Vth。Vov ≤ 0 是截止区，因为栅下没有电子沟道，Id ≈ 0。',
    'Compute Vov = Vgs − Vth first. Vov ≤ 0 is cutoff, because there is no electron channel under the gate and Id ≈ 0.',
  ),
  loc(
    'Vov > 0 时再比 Vds：Vds < Vov 是线性区，沟道从源通到漏，Vds 小时 Id ≈ k·Vov·Vds，像一个 R = 1/(k·Vov) 的电阻。',
    'With Vov > 0, compare Vds: Vds < Vov is the linear region, the channel runs from source to drain, and for small Vds Id ≈ k·Vov·Vds, a resistor of R = 1/(k·Vov).',
  ),
  loc(
    'Vds ≥ Vov 是饱和区：漏端沟道夹断，Id = k/2·Vov² 几乎不随 Vds 变，因为夹断点处的沟道电压固定为 Vov；Vds 越大夹断点越向源极挪，Id 略微上翘（λ）。',
    'Vds ≥ Vov is saturation: the channel pinches off at the drain end and Id = k/2·Vov² barely changes with Vds, because the channel voltage at the pinch-off point is fixed at Vov; larger Vds moves the pinch-off point towards the source and Id tilts up slightly (λ).',
  ),
  loc(
    '开关用的是截止区和线性区（见 {@mosSwitch}）；放大和恒流用饱和区；板上的 DC 测试用的就是这个判断：VOL 测的是下拉管在线性区的压降，见 {@dc} 和 {@fDc}。',
    'Switching uses cutoff and the linear region (see {@mosSwitch}); amplifiers and current sources use saturation. DC tests on the board rely on the same judgement: VOL measures the voltage drop of a pull-down transistor in the linear region, see {@dc} and {@fDc}.',
  ),
]
