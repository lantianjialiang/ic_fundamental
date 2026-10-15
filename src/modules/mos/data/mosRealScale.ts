import { loc, type LText } from '../../../i18n/locale'
import { type NodeId } from '../realModel'

export const SCALE_NODE: Record<NodeId, { title: LText; text: LText }> = {
  n500: {
    title: loc('500 nm：长沟道，几乎理想', '500 nm: long channel, nearly ideal'),
    text: loc(
      '沟道长，漏极电场伸不到源端，DIBL 很小（约 10 mV/V），Vth 稳定，曲线接近前几课的平方律。VDD 5 V、Vth 0.8 V，过驱动大，漏电极小。',
      'The channel is long, so the drain field cannot reach the source and DIBL is small (about 10 mV/V); Vth is stable and the curve is close to the square law of the earlier lessons. VDD of 5 V and Vth of 0.8 V give plenty of overdrive and tiny leakage.',
    ),
  },
  n350: {
    title: loc('350 nm：本轨教学模型', '350 nm: this track’s teaching model'),
    text: loc(
      'VDD 3.3 V、Vth 0.7 V，正是本轨前几课用的参数。短沟道效应开始出现，但还很弱。',
      'VDD of 3.3 V and Vth of 0.7 V are exactly the parameters used in the earlier lessons of this track. Short-channel effects begin to appear but are still weak.',
    ),
  },
  n180: {
    title: loc('180 nm：VDD 降到 1.8 V', '180 nm: VDD falls to 1.8 V'),
    text: loc(
      'VDD 降到 1.8 V，Vth 随之降到 0.5 V 左右，才能保住 Vov = VDD − Vth。Vth 低了，同样的斜率下关断漏电已经比前两代大几个数量级。DIBL 约 50 mV/V。',
      'VDD falls to 1.8 V and Vth falls to about 0.5 V to keep Vov = VDD − Vth. With a lower Vth and a similar slope, off leakage is already several orders of magnitude above the previous two nodes. DIBL is about 50 mV/V.',
    ),
  },
  n65: {
    title: loc('65 nm：漏电成为主角', '65 nm: leakage takes centre stage'),
    text: loc(
      'VDD 约 1.2 V、Vth 约 0.4 V。DIBL 约 100 mV/V：Vds 等于 VDD 时，源端势垒又被拉低 0.1 V 以上，约 1 个十倍频程的漏电。芯片待机漏电不再能忽略。',
      'VDD is about 1.2 V and Vth about 0.4 V. DIBL is about 100 mV/V: at Vds = VDD the source barrier is lowered by another 0.1 V or more, roughly one more decade of leakage. Standby leakage can no longer be ignored.',
    ),
  },
  n28: {
    title: loc('28 nm：平面 MOS 的尽头', '28 nm: the end of the road for planar MOS'),
    text: loc(
      'VDD 约 0.9 V、Vth 约 0.35 V，DIBL 约 130 mV/V，斜率也变平。为了让栅极重新控制住沟道，之后的工艺改用 FinFET，再往后是 GAA，这里只点名，不展开。',
      'VDD is about 0.9 V and Vth about 0.35 V, with DIBL of about 130 mV/V and a flatter slope. To make the gate regain control of the channel, later processes moved to FinFET and then GAA; they are only named here, not covered.',
    ),
  },
}

export const SCALE_LABEL = {
  node: loc('工艺节点', 'Process node'),
  vdd: loc('VDD', 'VDD'),
  vth: loc('Vth（长沟道值）', 'Vth (long-channel value)'),
  vthEff: loc('Vds = VDD 时的 Vth', 'Vth at Vds = VDD'),
  dibl: loc('DIBL', 'DIBL'),
  swing: loc('S（每十倍频程）', 'S (per decade)'),
  ioff: loc('Ioff 相对 500 nm', 'Ioff versus 500 nm'),
  energy: loc('动态能量相对 500 nm', 'Dynamic energy versus 500 nm'),
  axisY: loc('Id（对数坐标）', 'Id (log scale)'),
  axisX: loc('Vgs（V）', 'Vgs (V)'),
  low: loc('Vds = 0.05 V', 'Vds = 0.05 V'),
  high: loc('Vds = VDD', 'Vds = VDD'),
  gap: loc('DIBL 把曲线推向左边', 'DIBL pushes the curve left'),
  bars: loc('各节点的 VDD 与 Vth', 'VDD and Vth by node'),
  barVdd: loc('VDD', 'VDD'),
  barVth: loc('Vth', 'Vth'),
  cap: loc(
    '示意量级，不对应某家工艺：Ioff 取 Vgs = 0、Vds = VDD、25 °C；动态能量按 C ∝ L 和 E ∝ C·V² 估算。真实工艺会提供高 Vth / 低 Vth 多种器件来折中速度和漏电。',
    'Illustrative orders of magnitude, not any foundry’s process: Ioff is taken at Vgs = 0, Vds = VDD and 25 °C; dynamic energy is estimated with C ∝ L and E ∝ C·V². Real processes offer high-Vth and low-Vth devices to trade speed against leakage.',
  ),
}

export const SCALE_TEXT: Array<{ title: LText; text: LText; tone?: 'ok' | 'warn' | 'bad' }> = [
  {
    title: loc('为什么 VDD 和 Vth 一起降', 'Why VDD and Vth fall together'),
    text: loc(
      '动态功耗 P = C·V²·f（见 {@mosInverter}），VDD 降一半，功耗降到四分之一；栅氧变薄、沟道变短后耐压也下降，VDD 不得不降。但 VDD 降了，要保持过驱动 Vov = VDD − Vth 够大、速度不掉，Vth 就得跟着降。',
      'Dynamic power is P = C·V²·f (see {@mosInverter}), so halving VDD cuts power to a quarter; thinner oxide and shorter channels also lower the voltage they can withstand, so VDD has to fall. But with VDD lower, Vth must fall too to keep the overdrive Vov = VDD − Vth large enough for speed.',
    ),
  },
  {
    title: loc('Vth 一降，漏电指数上升', 'When Vth falls, leakage rises exponentially'),
    text: loc(
      '亚阈值电流和 Vth 是指数关系：S 约 80 mV/decade 时，Vth 每降 80 mV，Ioff 就大 10 倍。速度和漏电互相拉扯，这是先进工艺的「功耗墙」。',
      'Subthreshold current depends exponentially on Vth: at S of about 80 mV/decade each 80 mV drop in Vth makes Ioff 10 times larger. Speed and leakage pull against each other, which is the power wall of advanced processes.',
    ),
    tone: 'warn',
  },
  {
    title: loc('短沟道效应：DIBL 与 Vth 滚降', 'Short-channel effects: DIBL and Vth roll-off'),
    text: loc(
      'DIBL（漏致势垒降低）：沟道缩短后，漏极电场能伸到源端，直接把源端势垒压低，Vds 越大 Vth 越低，图里高 Vds 的曲线整体左移。Vth 滚降：沟道越短，源漏耗尽区占沟道的比例越大，栅极控制力变弱，Vth 随 L 变短而下降。两者的结果都是：关断漏电变大、斜率变平，也更难测准 Vth。',
      'DIBL (drain-induced barrier lowering): in a short channel the drain field reaches the source and lowers the source barrier directly, so the higher Vds is, the lower Vth is, and in the figure the high-Vds curve shifts left as a whole. Vth roll-off: the shorter the channel, the larger the fraction taken by the source / drain depletion regions and the weaker the gate’s control, so Vth falls as L shrinks. Both mean larger off leakage, a flatter slope and a Vth that is harder to pin down.',
    ),
    tone: 'warn',
  },
  {
    title: loc('工艺怎么应对', 'How processes respond'),
    text: loc(
      '为了让栅极重新控制住沟道，器件从平面 MOS 演进到 FinFET，再到 GAA（环栅），本课只点名，不展开。晶圆怎么一层层做出来见 {@pSilicon}，行业为什么一直缩小见 {@pHistory}。',
      'To give the gate control of the channel back, devices moved from planar MOS to FinFET and then GAA (gate-all-around); they are only named in this lesson. How wafers are built up layer by layer is in {@pSilicon}, and why the industry kept shrinking is in {@pHistory}.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc(
    '体二极管：NMOS 的阳极是源 / 体，阴极是漏，Vds < 0 时导通，压降 0.7 V 以上；同步整流让沟道接管，是为了压降小一个数量级。',
    'Body diode: for an NMOS the anode is source / body and the cathode is drain; it conducts when Vds < 0 with a drop of 0.7 V or more; synchronous rectification lets the channel take over for a drop about ten times smaller.',
  ),
  loc(
    '亚阈值漏电：Vgs < Vth 时电流随 Vgs 指数变化，每 S（约 60 到 100 mV）差 10 倍；关断不是 0，芯片上管子多，加起来就是待机电流。',
    'Subthreshold leakage: below Vth the current changes exponentially with Vgs, 10 times per S (about 60 to 100 mV); off is not zero, and with so many devices on a chip the total becomes standby current.',
  ),
  loc(
    '温度：Vth 约每度降 2 mV，所以漏电随温度指数上升；Rds(on) 因迁移率下降而升高，25 到 125 °C 约 1.5 倍，所以并联会自动均流，算损耗要用工作温度的值。',
    'Temperature: Vth falls about 2 mV per degree, so leakage climbs exponentially with temperature; Rds(on) rises because mobility falls, about 1.5 times from 25 to 125 °C, so parallel parts self-balance and loss must use the value at operating temperature.',
  ),
  loc(
    '栅极：栅氧很薄、栅极没有泄放通路，所以不能超过 Vgs 绝对最大值（功率管典型 ±20 V，小逻辑管典型 ±8 / ±12 V）；钳位器件只扛瞬间静电，扛不了持续过压。',
    'Gate: the oxide is thin and the gate has no discharge path, so never exceed the Vgs absolute maximum (typically ±20 V for power parts, ±8 / ±12 V for small logic parts); the clamp survives only a brief static pulse, not a sustained overvoltage.',
  ),
  loc(
    '闩锁：n 阱和 p 衬底之间有寄生 PNP 和 NPN 组成的可控硅，互相给对方基极电流，β1 × β2 > 1 就锁住，VDD 到 GND 大电流，只能断电；用保护环和多打阱接触预防。',
    'Latch-up: the parasitic PNP and NPN between n-well and p-substrate form a thyristor that feeds each other’s base current; with β1 × β2 > 1 it locks, a large current flows from VDD to GND and only a power cycle clears it; prevent it with guard rings and more well taps.',
  ),
  loc(
    '工艺缩放：VDD 和 Vth 一起降省了动态功耗，但 Vth 低、DIBL 大，关断漏电指数增加，这就是先进工艺必须管住漏电的原因。',
    'Process scaling: lowering VDD and Vth together saves dynamic power, but a low Vth and large DIBL make off leakage grow exponentially, which is why advanced processes must keep leakage under control.',
  ),
]
