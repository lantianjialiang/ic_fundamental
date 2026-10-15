import { loc, type LText } from '../../../i18n/locale'
import { type PhaseId } from './mosInverter'

/** 图和读数里用的短标签（长说明在 mosInverter.ts） */
export const FL = {
  vtcTitle: loc('电压传输特性 VTC', 'Voltage transfer curve (VTC)'),
  iddTitle: loc('直通电流 IDD（mA）', 'Shoot-through current IDD (mA)'),
  outHigh: loc('高（1）', 'High (1)'),
  outLow: loc('低（0）', 'Low (0)'),
  outMid: loc('过渡', 'Transition'),
  sweepAria: loc('反相器电路、电压传输特性和直通电流曲线', 'Inverter circuit, voltage transfer curve and shoot-through current'),
  sweepCap: loc(
    '左：电路，每个管子旁写着它的工作区（绿 = 线性区，蓝 = 饱和区，灰 = 截止）。右：VTC 和直通电流，数字 1–4 是四个阶段，金色圆点是当前工作点。',
    'Left: the circuit, with each transistor’s region beside it (green = linear, blue = saturation, grey = cutoff). Right: VTC and shoot-through current; the numbers 1–4 mark the four phases and the gold dot is the present operating point.',
  ),
  structAria: loc('反相器的电路符号和剖面示意', 'Inverter symbol and cross-section sketch'),
  structCap: loc(
    '左：电路符号。右：同一个反相器的剖面示意（不按比例）：PMOS 做在 n 阱里，源漏是 p+；NMOS 直接做在 p 衬底上，源漏是 n+。n 阱经 n+ 接 VDD，衬底经 p+ 接 GND；两个栅极的多晶硅连成 IN，两个漏极用金属连成 OUT。',
    'Left: the circuit symbol. Right: a cross-section sketch of the same inverter (not to scale): the PMOS sits in an n-well with p+ source and drain; the NMOS sits directly in the p-substrate with n+ source and drain. The n-well ties to VDD through an n+ contact and the substrate to GND through a p+ contact; the two poly gates join as IN and the two drains join with metal as OUT.',
  ),
  nwell: loc('n 阱', 'n-well'),
  psub: loc('p 衬底', 'p-substrate'),
  connP: loc('S、B 接 VDD', 'S, B to VDD'),
  connN: loc('S、B 接 GND', 'S, B to GND'),
  connDG: loc('D 接 OUT，G 接 IN', 'D to OUT, G to IN'),
  read0: loc('读作 0', 'Reads 0'),
  read1: loc('读作 1', 'Reads 1'),
  noiseAria: loc('VTC 上的单位增益点和噪声容限', 'Unity-gain points on the VTC and the noise margins'),
  powerAria: loc('动态功耗随电源电压变化，以及充放电路径', 'Dynamic power against supply voltage, and the charge and discharge paths'),
  powerCap2: loc(
    '左：输出 0→1 时电流经导通的 PMOS 给 CL 充电；输出 1→0 时 CL 经导通的 NMOS 放电（灰色的管子截止）。右：功耗随 V 的平方增长。',
    'Left: on a 0→1 output change current flows through the conducting PMOS to charge CL; on 1→0 CL discharges through the conducting NMOS (the grey transistor is off). Right: power grows with the square of V.',
  ),
  charge: loc('0→1：充电', '0→1: charge'),
  discharge: loc('1→0：放电', '1→0: discharge'),
  supplyAxis: loc('电源电压 V（V）', 'Supply voltage V (V)'),
}

export const PHASE_SHORT: Record<PhaseId, LText> = {
  p1: loc('阶段 1', 'Phase 1'),
  p2: loc('阶段 2', 'Phase 2'),
  vm: loc('VM 点', 'At VM'),
  p3: loc('阶段 3', 'Phase 3'),
  p4: loc('阶段 4', 'Phase 4'),
}
