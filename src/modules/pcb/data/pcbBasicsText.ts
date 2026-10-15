import { loc, type LText } from '../../../i18n/locale'

export const WIDTH_S = {
  title: loc('线宽与载流：IPC-2221 小计算器', 'Trace width and current: an IPC-2221 calculator'),
  note: loc(
    '电流流过铜线会发热（P = I²R），温度升到比周围高 ΔT 度时就稳住了。线宽就是在选「允许升几度」。',
    'Current heats copper (P = I²R) until the trace settles ΔT degrees above its surroundings. Choosing the width is choosing how many degrees you allow.',
  ),
  kicker: loc('线宽', 'Trace width'),
  kickerTitle: loc('线宽与载流', 'Width and current'),
  modeA: loc('已知电流 → 求线宽', 'Current → width'),
  modeB: loc('已知线宽 → 求电流', 'Width → current'),
  ext: loc('外层 k = 0.048', 'External k = 0.048'),
  int: loc('内层 k = 0.024', 'Internal k = 0.024'),
  amp: loc('电流', 'Current'),
  dT: loc('允许温升 ΔT', 'Allowed rise ΔT'),
  width: loc('线宽', 'Width'),
  copper: loc('铜厚', 'Copper'),
  outW: loc('所需线宽', 'Required width'),
  outI: loc('可载电流', 'Current capacity'),
  area: loc('截面积', 'Cross-section'),
  thick: loc('铜厚度', 'Thickness'),
  r10: loc('每 10 mm 电阻', 'R per 10 mm'),
  drop10: loc('每 10 mm 压降', 'Drop per 10 mm'),
  cap: loc(
    '曲线：当前铜厚、温升、层别下，线宽随电流增长的关系。圆点是上面输入对应的工作点。电流翻倍，线宽要增加得比一倍还多一点（指数 1/0.725 ≈ 1.38）。',
    'Curve: required width against current for the chosen copper, rise and layer. The dot is the operating point from the inputs above. Doubling the current needs a bit more than double the width (exponent 1/0.725 ≈ 1.38).',
  ),
  capX: loc('电流 A', 'Current A'),
  capY: loc('线宽 mm', 'Width mm'),
}

export const WIDTH_NOTES: LText[] = [
  loc(
    '公式：I = k·ΔT^0.44·A^0.725。I 是电流（A），ΔT 是温升（°C），A 是铜截面积（mil²，等于线宽 mil × 铜厚 mil），1 oz 铜厚 1.378 mil（35 µm）。k 外层取 0.048，内层取 0.024：内层被树脂包住，散热差，同样温升下只能走外层一半左右的电流，所以内层要更宽。',
    'Formula: I = k·ΔT^0.44·A^0.725. I is current (A), ΔT the rise (°C), A the copper cross-section in mil² (width in mil × thickness in mil); 1 oz copper is 1.378 mil (35 µm). k is 0.048 external and 0.024 internal: an inner trace is wrapped in resin and sheds heat poorly, so for the same rise it carries about half the current and needs to be wider.',
  ),
  loc(
    'IPC-2221 的曲线数据大致覆盖 35 A 以内、温升 10–100 °C、铜厚 0.5–3 oz，超出范围就是外推，结果不可靠。它不考虑板厚、附近的铜平面和是否有风，所以偏保守。更新的 IPC-2152 用实测数据修正了这些影响（例如内层靠近平面时散热比 2221 估得好），更准确，但需要查图表；做初步估算时 IPC-2221 够用，要卡极限时改用 IPC-2152 或做热测试。',
    'The IPC-2221 data roughly cover up to 35 A, 10–100 °C rise and 0.5–3 oz copper; beyond that the result is an extrapolation and not reliable. It ignores board thickness, nearby copper planes and airflow, so it is conservative. The newer IPC-2152 corrects these with measured data (an inner trace next to a plane sheds heat better than 2221 predicts) and is more accurate, but needs chart lookup. IPC-2221 is fine for a first estimate; use IPC-2152 or a thermal test when you are near the limit.',
  ),
  loc(
    '线宽只是其中一环：焊盘、过孔、颈缩处和连接器引脚的载流常常比线更小，瓶颈由最窄的那一段决定。线短时压降和发热都小，可以放宽；线长则要按压降（右侧读数）再核一遍。',
    'Width is only one link: pads, vias, neck-downs and connector pins often carry less than the trace, and the narrowest segment sets the limit. A short trace has little drop and heating and can be relaxed; a long one must also be checked against the voltage drop shown in the readout.',
  ),
]

export const SPACE_S = {
  title: loc('线距、安全间距与高压爬电', 'Clearance, safety spacing and creepage'),
  note: loc(
    '两个导体靠得太近，电压高时会击穿空气，板面脏了还会沿表面漏电。间距由电压决定，不是越窄越好。',
    'Conductors placed too close arc through air at high voltage, and a dirty surface leaks along the board. Spacing is set by voltage, and narrower is not better.',
  ),
  kicker: loc('间距', 'Spacing'),
  kickerTitle: loc('电气间隙与爬电距离', 'Clearance and creepage'),
  flat: loc('不开槽', 'No slot'),
  slot: loc('开槽', 'With a slot'),
  gap: loc('两个导体的板面间距', 'Surface gap between conductors'),
  slotW: loc('槽宽', 'Slot width'),
  volt: loc('工作电压', 'Working voltage'),
  clr: loc('电气间隙 Clearance', 'Clearance'),
  crp: loc('爬电距离 Creepage', 'Creepage'),
  req: loc('IPC-2221 B2 最小间距', 'IPC-2221 B2 minimum'),
  ok: loc('间隙够', 'Gap OK'),
  short: loc('间隙不够', 'Gap too small'),
  slotOn: loc('槽生效', 'Slot effective'),
  slotOff: loc('槽太窄，无效', 'Slot too narrow, no gain'),
  capAir: loc('电气间隙：空气中最短直线', 'Clearance: shortest line through air'),
  capSurf: loc('爬电距离：沿板面最短路径', 'Creepage: shortest path along the surface'),
  cap: loc(
    '剖面示意（槽深按 1.0 mm 画，板厚 1.6 mm）。蓝线 = 空气里的直线；金色虚线 = 沿板面的路径，开槽后要下到槽底再爬上来。',
    'Cross-section illustration (slot drawn 1.0 mm deep in a 1.6 mm board). Blue line = straight through air; gold dashed = along the surface, which with a slot must go down to the slot bottom and back up.',
  ),
}

export const SPACE_NOTES: LText[] = [
  loc(
    '电气间隙（clearance）是两个导体之间空气中的最短直线，管的是空气击穿和瞬间过电压；爬电距离（creepage）是沿绝缘材料表面的最短路径，管的是潮湿、灰尘使表面慢慢形成漏电通道。爬电距离永远不小于电气间隙，高压板上通常是它先卡住设计。',
    'Clearance is the shortest straight line through air between two conductors and covers air breakdown and transient overvoltage; creepage is the shortest path along the surface of the insulator and covers moisture and dust slowly forming a leakage track. Creepage is never shorter than clearance, and on high-voltage boards it is usually the one that limits the design.',
  ),
  loc(
    '开槽是加长爬电距离的办法：在两个导体之间铣掉一条槽，表面路径必须绕过去。槽要足够宽，否则灰尘会把它填满、路径又被「抄近路」：污染等级 2 时槽宽一般至少 1 mm，等级越高要求越大（等级 3 约 1.5 mm）。实际板子常铣成贯穿的槽，槽里没有材料，漏电只能绕过槽的两端，所以槽要比两个导体相对的长度更长。电气间隙开槽后并不增加。',
    'A slot lengthens creepage: route a slot out of the board between the conductors and the surface path has to go around. The slot must be wide enough or dust fills it and the path takes the shortcut again: for pollution degree 2 the minimum slot width is typically 1 mm, and it grows with the degree (about 1.5 mm for degree 3). Real boards usually get a through slot with no material in it, so leakage can only go around its ends; the slot must be longer than the length over which the conductors face each other. Clearance does not grow with a slot.',
  ),
  loc(
    '所需数值由工作电压、污染等级、材料组别（看 CTI，普通 FR-4 常落在 III 组）、海拔和安规标准（IEC 60664-1、IEC 62368-1）共同决定，例如 250 V 工作电压、污染等级 2、III 组材料时，爬电距离约 2.5 mm。右边读数用的是 IPC-2221 表 6-1 的 B2 列（外层、无涂覆、海拔 ≤ 3050 m）：500 V 以内分段取值，超过 500 V 每伏再加 0.005 mm，只是起点，不能代替安规认证。',
    'The required values come from working voltage, pollution degree, material group (look at CTI; ordinary FR-4 often falls in group III), altitude and the safety standard (IEC 60664-1, IEC 62368-1); for example 250 V working, pollution degree 2 and group III gives about 2.5 mm creepage. The readout uses the B2 column of IPC-2221 Table 6-1 (external, uncoated, up to 3050 m): banded up to 500 V, then add 0.005 mm per volt above 500 V. It is a starting point and does not replace safety certification.',
  ),
]
