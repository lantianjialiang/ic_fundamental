import { loc } from '../../../i18n/locale'
import { KN, LAMBDA, VTN } from '../model'

/** 三张图和判断流程图里的文字 */
export const FIG = {
  crossCap: loc(
    'NMOS 剖面：沟道厚度随该点的栅极压差变化。示意图，夹断点的位移已放大，不按比例。',
    'NMOS cross-section: channel thickness follows the gate overdrive at each point. Illustration, the pinch-off shift is exaggerated and not to scale.',
  ),
  crossAria: loc('NMOS 剖面图：沟道随 Vgs 和 Vds 变化', 'NMOS cross-section: the channel changes with Vgs and Vds'),
  poly: loc('多晶硅栅', 'poly gate'),
  oxide: loc('栅氧', 'gate oxide'),
  substrate: loc('p 型衬底', 'p-type substrate'),
  legChannel: loc('沟道（电子）', 'Channel (e⁻)'),
  legDepl: loc('耗尽区', 'Depletion'),
  legPinch: loc('夹断点', 'Pinch-off point'),
  outCap: loc(
    `输出特性 Id–Vds：一组 Vgs 对应一族曲线。虚线 Vds = Vov 把线性区（左）和饱和区（右）分开。示意参数：k = ${KN * 1000} mA/V²，Vth = ${VTN} V，λ = ${LAMBDA} /V。`,
    `Output curves Id–Vds: one curve per Vgs. The dashed line Vds = Vov separates the linear region (left) from saturation (right). Illustrative parameters: k = ${KN * 1000} mA/V², Vth = ${VTN} V, λ = ${LAMBDA} /V.`,
  ),
  outAria: loc('输出特性曲线和当前工作点', 'Output curves with the current operating point'),
  edge: loc('Vds = Vov', 'Vds = Vov'),
  edgeEq: loc('Id = k/2·Vds²', 'Id = k/2·Vds²'),
  trCap: loc(
    '转移特性 Id–Vgs（Vds 固定为当前值）：Vgs 从小到大依次经过截止、饱和、线性。线段颜色就是所在的区。',
    'Transfer curve Id–Vgs (Vds fixed at the current value): as Vgs rises it passes cutoff, then saturation, then linear. The colour of each segment is its region.',
  ),
  trAria: loc('转移特性曲线和阈值电压', 'Transfer curve with the threshold voltage'),
  trVth: loc('Vth', 'Vth'),
  flowCap: loc(
    '判断流程：先看 Vgs 和 Vth，再比 Vds 和 Vov。高亮的路径是当前偏置走的路径。',
    'Decision flow: compare Vgs with Vth first, then Vds with Vov. The highlighted path is the one the current bias takes.',
  ),
  flowAria: loc('区域判断流程图', 'Region decision flowchart'),
  flowStart: loc('先算 Vov = Vgs − Vth', 'Compute Vov = Vgs − Vth'),
  yes: loc('是', 'Yes'),
  no: loc('否', 'No'),
  cutoffLine: loc('没有反型沟道', 'No inversion channel'),
  linearLine: loc('像电阻 R = 1/(k·Vov)', 'Acts as R = 1/(k·Vov)'),
  satLine: loc('夹断，电流几乎恒定', 'Pinched off, ~constant Id'),
}
