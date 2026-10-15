import { loc, type LText } from '../../../i18n/locale'

export type FormulaId = 'cutoff' | 'linear' | 'sat' | 'edge'

export type FormulaItem = {
  id: FormulaId
  title: LText
  sub: LText
  text: LText
  formula: LText
  why: LText
}

/** 线性区小 Vds 近似：Vds 不超过 Vov 的这个比例才算「小」 */
export const SMALL_VDS = 0.2

/** 显示顺序：截止、线性、饱和、边界；初始选中第 0 个 */
export const FORMULAS: FormulaItem[] = [
  {
    id: 'cutoff',
    title: loc('截止区', 'Cutoff'),
    sub: loc('Id ≈ 0', 'Id ≈ 0'),
    text: loc('Vgs ≤ Vth', 'Vgs ≤ Vth'),
    formula: loc('Id ≈ 0（Vgs ≤ Vth）', 'Id ≈ 0 (Vgs ≤ Vth)'),
    why: loc(
      '为什么：栅下没有反型的电子层，源和漏之间只有 p 型硅和两个反向的 PN 结，没有导电路径。',
      'Why: there is no inverted electron layer under the gate, only p-type silicon and two opposing PN junctions between source and drain, so there is no conducting path.',
    ),
  },
  {
    id: 'linear',
    title: loc('线性区', 'Linear'),
    sub: loc('Id ≈ k·Vov·Vds', 'Id ≈ k·Vov·Vds'),
    text: loc('Vds 远小于 Vov', 'Vds much smaller than Vov'),
    formula: loc(
      'Id ≈ k·Vov·Vds，等效电阻 R = 1/(k·Vov)（Vds ≪ Vov）；完整形式 Id = k·(Vov·Vds − Vds²/2)',
      'Id ≈ k·Vov·Vds, equivalent resistance R = 1/(k·Vov) (Vds ≪ Vov); full form Id = k·(Vov·Vds − Vds²/2)',
    ),
    why: loc(
      '为什么：Vds 很小时沟道各处厚度几乎一样，像一块均匀的电阻，电流和电压成正比；Vov 越大沟道越厚、电阻越小。Vds 变大后沟道漏端变薄，电阻变大，曲线才开始向下弯，所以完整式里多了 −Vds²/2 这一项。',
      'Why: for small Vds the channel is almost equally thick everywhere, like a uniform resistor, so current is proportional to voltage; the larger Vov, the thicker the channel and the smaller R. As Vds grows the drain end thins and R rises, so the curve bends down, which is the −Vds²/2 term in the full form.',
    ),
  },
  {
    id: 'sat',
    title: loc('饱和区', 'Saturation'),
    sub: loc('Id = k/2·Vov²', 'Id = k/2·Vov²'),
    text: loc('Vds ≥ Vov', 'Vds ≥ Vov'),
    formula: loc(
      'Id = k/2·Vov²，计入沟道长度调制后乘以 (1 + λ·Vds)',
      'Id = k/2·Vov², multiplied by (1 + λ·Vds) once channel-length modulation is included',
    ),
    why: loc(
      '为什么：夹断点处沟道电压固定为 Vov，源到夹断点的压差不随 Vds 变，所以电流只由 Vov 决定，而且和 Vov 的平方成正比（沟道厚度和速度都随 Vov 增大）。Vds 增大只让夹断点向源挪动一点，沟道略变短，Id 略增，这就是 λ。',
      'Why: the channel voltage at the pinch-off point is fixed at Vov, so the voltage across source-to-pinch-off does not change with Vds and the current depends on Vov only, growing with its square (both channel thickness and drift grow with Vov). More Vds just moves the pinch-off point slightly towards the source, the channel gets a bit shorter and Id rises a bit: that is λ.',
    ),
  },
  {
    id: 'edge',
    title: loc('区域边界', 'Boundary'),
    sub: loc('Vds = Vov', 'Vds = Vov'),
    text: loc('Id = k/2·Vds²', 'Id = k/2·Vds²'),
    formula: loc(
      '边界：Vds = Vov；把 Vov = Vds 代入饱和公式，得到 Id = k/2·Vds²（含 λ 时再乘 (1 + λ·Vds)），输出特性上的虚线就是它',
      'Boundary: Vds = Vov; putting Vov = Vds into the saturation formula gives Id = k/2·Vds² (times (1 + λ·Vds) with λ), which is the dashed line on the output curves',
    ),
    why: loc(
      '为什么：Vds = Vov 时漏端沟道厚度刚好为 0，线性区公式和饱和区公式在这里给出同一个电流，所以曲线在这里平滑地从上升转为平坦。',
      'Why: at Vds = Vov the drain-end thickness is exactly 0 and the linear and saturation formulas give the same current there, so the curve changes smoothly from rising to flat.',
    ),
  },
]
