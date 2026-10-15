import { loc, type LText } from '../../../i18n/locale'

export type PlaneId = 'solid' | 'slot'
export type FreqId = 'low' | 'high'

export const PLANES: Array<{ id: PlaneId; label: LText }> = [
  { id: 'solid', label: loc('完整地平面', 'Solid ground plane') },
  { id: 'slot', label: loc('地平面有一道槽', 'Plane with a slot') },
]

export const FREQS: Array<{ id: FreqId; label: LText }> = [
  { id: 'low', label: loc('低频', 'Low frequency') },
  { id: 'high', label: loc('高频', 'High frequency') },
]

export const RETURN_TEXT: Record<string, { title: LText; text: LText; tone?: 'ok' | 'bad' }> = {
  'solid-low': {
    title: loc('低频、完整平面：回流散开', 'Low frequency, solid plane: the return spreads out'),
    text: loc(
      '低频时电阻起主要作用，电流选总电阻最小的路径，在平面里从源到负载散成一束，越靠近直线越密。这时回路电感对它没影响（ωL 比 R 小得多），所以低频时回流在哪里无所谓，读数里回路面积偏大也不代表有问题。',
      'At low frequency resistance dominates and the current takes the lowest-resistance paths, fanning out as a bundle from source to load, densest near the straight line. Loop inductance does not matter to it (wL is far below R), so where the return flows hardly matters at low frequency, and the larger loop-area readout does not signal a problem.',
    ),
  },
  'solid-high': {
    title: loc('高频、完整平面：回流贴在走线正下方', 'High frequency, solid plane: the return hugs the trace'),
    tone: 'ok',
    text: loc(
      '高频时电感起主要作用，电流选总电感最小的路径，也就是回路面积最小的那条，正好在走线正下方。它在平面里的分布约为 J ∝ h / (h² + x²)，h 是走线到平面的距离，所以走线离平面越近，回流越窄、回路越小，辐射和串扰越低。这也是叠层（见 {@pcbStack}）要给信号线紧邻一个完整平面的原因。',
      'At high frequency inductance dominates and the current takes the lowest-inductance path, the one with the smallest loop area, directly under the trace. Its distribution in the plane is about J proportional to h / (h^2 + x^2), where h is the height of the trace over the plane, so the closer the plane the narrower the return and the smaller the loop, with less radiation and crosstalk. This is why the stack-up (see {@pcbStack}) puts a solid plane right next to the signal layer.',
    ),
  },
  'slot-low': {
    title: loc('低频、开槽：多走一点路，问题不明显', 'Low frequency, slotted: a little extra path, hardly visible'),
    text: loc(
      '槽挡住了正下方的一部分路径，电流从槽的两端绕过去，挤过槽端，回路面积也变大了。但低频时电流本来就在平面里散开，只是多走了一点路，而且电感不起主要作用，所以几乎看不出问题。同一块板到了高频就会暴露，不要以为低频测试没问题就可以开槽。',
      'The slot blocks part of the direct path and the current detours around the ends, squeezing past them, and the loop area grows too. But at low frequency the current was already spread out and only walks a bit farther, and inductance does not dominate, so the problem is hardly visible. The same board shows it at high frequency, so a clean low-frequency test is no excuse for a slot.',
    ),
  },
  'slot-high': {
    title: loc('高频、开槽：回流被迫绕大圈', 'High frequency, slotted: the return is forced on a large detour'),
    tone: 'bad',
    text: loc(
      '高频回流想走正下方，却被槽挡住，只能从槽的两端绕过去再回到走线下方。回路面积和电感随绕行距离变大，同样的信号电流产生更强的磁场，向外辐射（EMI）；信号和回流之间的耦合变差，边沿出现振铃和串扰（信号完整性）。解决办法是不在信号下面开槽，或换层时在旁边打缝合地过孔。',
      'The high-frequency return wants to flow directly underneath but the slot blocks it, so it goes around the slot ends and back under the trace. Loop area and inductance grow with the detour, the same signal current makes a stronger magnetic field that radiates (EMI), and the coupling between signal and return gets worse, giving ringing and crosstalk (signal integrity). The fix is no slot under signals, or stitching ground vias beside any layer change.',
    ),
  },
}

export const RET_LBL = {
  top: loc('俯视图', 'Top view'),
  section: loc('A–A 横截面', 'Cross-section A-A'),
  driver: loc('驱动', 'Driver'),
  receiver: loc('接收', 'Receiver'),
  plane: loc('地平面（下一层）', 'Ground plane (layer below)'),
  trace: loc('走线', 'Trace'),
  slot: loc('槽', 'Slot'),
  dielectric: loc('介质', 'Dielectric'),
  gnd: loc('地平面', 'Ground plane'),
  density: loc('地平面里的回流电流密度', 'Return current density in the plane'),
  signal: loc('信号电流', 'Signal current'),
  ret: loc('回流电流', 'Return current'),
  play: loc('播放动画', 'Play animation'),
  pause: loc('暂停动画', 'Pause animation'),
  rdArea: loc('回路面积', 'Loop area'),
  rdLen: loc('回流路径长度', 'Return path length'),
  rdUnder: loc('A–A 处走线下方的回流', 'Return under the trace at A-A'),
  ariaFig: loc(
    '回流路径示意：一根走线和下面的地平面，俯视图与横截面',
    'Return path illustration: a trace over a ground plane, top view and cross-section',
  ),
  cap: loc(
    '示意（不按比例，截面放大 3 倍）：蓝点是回流电流，走线上的亮点是信号电流。截面里的曲线是回流电流在平面里的分布，总电流相同，所以越窄越高。',
    'Illustration (not to scale, cross-section enlarged 3 times): blue dots are return current, the bright dots on the trace are signal current. The curve in the section is the return distribution across the plane; the total current is the same, so narrower means taller.',
  ),
}
