import { loc, type LText } from '../../../i18n/locale'

export type ProblemId = 'conn' | 'power' | 'heat' | 'decap' | 'xtal' | 'stub' | 'diff' | 'slot'

export type Problem = {
  id: ProblemId
  title: LText
  problem: LText
  reason: LText
  fix: LText
  good: LText
}

// 顺序就是图上编号 1..8；默认选中第一个
export const PROBLEMS: Problem[] = [
  {
    id: 'conn',
    title: loc('接口没靠板边', 'Connector set back from the edge'),
    problem: loc(
      'USB 插座离板边还有一截，插头伸不到外壳开孔，插拔的力全靠焊点撑着。',
      'The USB receptacle sits well inside the board edge: the plug cannot reach the enclosure opening, and plug and unplug force is carried by the solder joints.',
    ),
    reason: loc(
      '接口是板子和外界的分界线。靠边才能让外壳开孔、线缆和板子对上；信号和电源从边上进来，也不必先穿过半块板子才到芯片，干扰更少。',
      'The connector is where the board meets the outside. At the edge, the enclosure opening, cable and board line up, and signals and power enter at the edge instead of crossing half the board first, so there is less interference.',
    ),
    fix: loc(
      '把插座放到板边，插口朝外，金属外壳脚用通孔固定；ESD 和共模抑制器件紧挨着插座。',
      'Put the receptacle at the edge with the opening facing out and anchor its shell legs in through-holes; keep ESD and common-mode parts right next to it.',
    ),
    good: loc(
      '插座贴着板边、插口朝外，稍微探出板外，插拔时外壳和铜箔一起受力。',
      'The receptacle sits at the edge with its opening facing out and overhangs slightly, so the shell and the copper take the plug force together.',
    ),
  },
  {
    id: 'power',
    title: loc('电源路径又细又长', 'Power path thin and long'),
    problem: loc(
      '5 V 从插座绕了一大圈才到 LDO，3.3 V 又用一根细线绕路送到 MCU。',
      'The 5 V takes a long detour to the LDO, and the 3.3 V reaches the MCU on a thin, winding trace.',
    ),
    reason: loc(
      '铜线有电阻也有电感：电流 I 在电阻 R 上掉 I × R；MCU 电流突然变大时，线上电感再让电压掉 L × di/dt。又细又长的线两项都大，MCU 的电源脚就会比 LDO 输出低。',
      'Copper has resistance and inductance: the current I drops I x R across the resistance, and when the MCU current suddenly rises the inductance adds a further L x di/dt dip. A thin, long trace is bad on both, so the MCU supply pin sits below the LDO output.',
    ),
    fix: loc(
      '电源线按电流算宽度（见 {@pcbBasics}），尽量短而直；LDO 放在电源入口和 MCU 之间，3.3 V 用宽线直接送到各个 VDD 脚。',
      'Size power traces for the current (see {@pcbBasics}) and keep them short and straight; put the LDO between the power entry and the MCU and feed every VDD pin with wide copper.',
    ),
    good: loc(
      '5 V 经一小段宽线进 LDO，3.3 V 经宽线直接到 MCU，路径短，压降和电感都小。',
      'The 5 V goes through a short wide trace into the LDO and the 3.3 V through wide copper straight to the MCU: short, so small drop and small inductance.',
    ),
  },
  {
    id: 'heat',
    title: loc('发热元件挤在一起', 'Hot parts crowded together'),
    problem: loc(
      'LDO 紧贴晶振和 MCU，它的地脚只有一根细线，没有铜皮散热。',
      'The LDO sits right beside the crystal and the MCU, and its ground pin has only a thin trace and no copper to spread heat.',
    ),
    reason: loc(
      'LDO 的功耗 = (Vin − Vout) × I，5 V 降到 3.3 V、100 mA 就是 0.17 W，全变成热，小封装会升温几十度。热会让晶振频率漂移，也把 MCU 附近的温度抬高。',
      'The LDO dissipates (Vin - Vout) x I: 5 V to 3.3 V at 100 mA is 0.17 W, all heat, and a small package warms up tens of degrees. Heat shifts the crystal frequency and raises the temperature around the MCU.',
    ),
    fix: loc(
      '热源分散放，远离晶振和模拟部分；让 LDO 的地脚接一块铜皮并打几个过孔，热量沿铜皮和过孔扩散到另一面（见后面的热设计）。',
      'Spread the heat sources away from the crystal and analog parts; connect the LDO ground pin to a copper area with a few vias so the heat spreads along the copper and to the other side (see thermal design below).',
    ),
    good: loc(
      'LDO 在电源入口旁、离晶振很远；地脚接一块带过孔的铜皮，热量往铜皮里扩散。',
      'The LDO sits by the power entry, far from the crystal; its ground pin joins a copper area with vias so the heat spreads into the copper.',
    ),
  },
  {
    id: 'decap',
    title: loc('去耦电容离电源脚太远', 'Decoupling capacitor too far from the pin'),
    problem: loc(
      '100 nF 电容挂在一段长线的末端，离 MCU 的 VDD 脚有一大截，地端的过孔也在更远的地方。',
      'The 100 nF capacitor hangs at the end of a long stub, well away from the MCU VDD pin, and its ground via is farther still.',
    ),
    reason: loc(
      '电容是给芯片提供瞬时电流的，要走的路径越长，回路电感越大（经验上约每毫米 0.5–1 nH），L × di/dt 的压降越大，电容就等于没放。',
      'The capacitor supplies the chip with instantaneous current; the longer its path, the larger the loop inductance (roughly 0.5-1 nH per mm as a rule of thumb) and the larger the L x di/dt dip, so the capacitor is as good as absent.',
    ),
    fix: loc(
      '每个电源脚旁放一颗，电容焊盘紧贴电源线，地端过孔紧贴电容焊盘；顺序是「电源过孔 → 电容 → 引脚」，容值小的最靠近引脚。下一节有定量比较。',
      'One capacitor per supply pin, its pad right on the supply trace and its ground via right at the other pad; the order is power via, capacitor, pin, and the smallest value goes closest to the pin. The next section compares them quantitatively.',
    ),
    good: loc(
      '电容紧挨着电源脚，电源线先经过电容焊盘再进引脚，地过孔就在电容另一端。',
      'The capacitor sits right at the supply pin, the supply trace passes its pad before reaching the pin, and the ground via is at its other end.',
    ),
  },
  {
    id: 'xtal',
    title: loc('晶振离 MCU 远、线又细又长', 'Crystal far from the MCU on long traces'),
    problem: loc(
      '晶振放在板子另一头，两根振荡线绕了很长一圈，周围没有地铜皮保护。',
      'The crystal is at the other end of the board on two long oscillator traces, with no ground copper guarding it.',
    ),
    reason: loc(
      '振荡线信号小、阻抗高。线越长，寄生电容越大，频率偏移、起振变慢，还会拾取旁边的噪声，反过来也辐射。负载电容要和线上的寄生电容一起算，线一长就算不准了。',
      'The oscillator nodes carry a small signal at high impedance. A longer trace adds parasitic capacitance, which pulls the frequency and slows start-up, picks up noise from its neighbors and radiates in return. The load capacitors are sized together with the trace capacitance, which a long trace makes unpredictable.',
    ),
    fix: loc(
      '晶振和两颗负载电容紧挨 MCU 的 OSC 脚，线尽量短；周围用地铜皮围一圈，下一层只留完整的地，不走任何信号线。',
      'Put the crystal and its two load capacitors right at the MCU OSC pins with the shortest traces; surround them with a ground guard and leave the layer below as solid ground with no signal traces.',
    ),
    good: loc(
      '晶振在 OSC 引脚正上方，线只有一两毫米；两颗负载电容各接地，周围是地铜皮，下面不走线。',
      'The crystal sits directly above the OSC pins on traces of a millimeter or two; each load capacitor goes to ground, a ground guard surrounds them, and nothing is routed below.',
    ),
  },
  {
    id: 'stub',
    title: loc('锐角和长分支', 'Acute angle and long stub'),
    problem: loc(
      '一根信号线在拐弯处折成锐角，又拉出一段长分支去接测试点。',
      'A signal trace folds into an acute angle and a long branch runs off it to a test point.',
    ),
    reason: loc(
      '锐角在蚀刻时容易留下药水死角，线宽不稳（见 {@pcbFab}）；分支的末端是开路，信号到了末端反射回来，叠在主线信号上形成振铃，分支越长越明显。',
      'An acute corner leaves a pocket for etchant and the width becomes uneven (see {@pcbFab}); the branch ends open, so the signal reflects at the end and rides on the main signal as ringing, more so the longer the branch.',
    ),
    fix: loc(
      '拐弯用 45° 或圆弧；测试点放在线上，让线直接穿过测试点焊盘，不拉分支；真要分支就让它越短越好。',
      'Turn with 45 degrees or an arc; put the test point on the trace so the trace runs through its pad instead of branching; if a branch is unavoidable, make it as short as possible.',
    ),
    good: loc(
      '拐弯是 45°，测试点就在线上，线穿过焊盘继续走，没有分支。',
      'The bend is 45 degrees and the test point sits on the trace, which runs through the pad and onward with no branch.',
    ),
  },
  {
    id: 'diff',
    title: loc('差分对不等长、间距忽大忽小', 'Differential pair unequal and unevenly spaced'),
    problem: loc(
      'USB 的 D+ 和 D− 两根线在中间被拉开，一根明显更长，拐弯位置也各不相同。',
      'The USB D+ and D- traces drift apart in the middle, one is clearly longer, and they turn at different places.',
    ),
    reason: loc(
      '差分信号靠两线之差传输，两线越对称，共模噪声抵消得越好。差分阻抗（USB 要求约 90 Ω）由线宽、间距和到平面的距离共同决定，间距一变阻抗就跳；长度不等则让两路信号到达时间不同，多出来的部分变成共模，向外辐射。',
      'A differential signal travels as the difference between two lines, and the more symmetric they are the better common-mode noise cancels. The differential impedance (USB asks for about 90 ohm) depends on width, spacing and height over the plane, so a spacing change makes it jump; a length mismatch makes the two edges arrive at different times and the excess becomes common mode that radiates.',
    ),
    fix: loc(
      '按叠层算出线宽和间距后固定下来；两线平行、一起拐弯，长度差越小越好（高速 USB 常按 1–2 mm 以内要求，是经验值）；换层时在旁边打一个地过孔。',
      'Fix the width and spacing from the stack-up calculation; run the two lines parallel and turn together with as little length difference as possible (high-speed USB often asks for within 1-2 mm, a rule of thumb); drop a ground via beside any layer change.',
    ),
    good: loc(
      '两线等宽、等距、一起拐 45°，长度几乎相等，从插座到 MCU 保持同一个间距。',
      'The two lines have equal width and spacing, turn together at 45 degrees, are almost equal in length and keep one spacing from the receptacle to the MCU.',
    ),
  },
  {
    id: 'slot',
    title: loc('地平面被切开，信号跨过缝隙', 'Ground plane cut, signal crosses the gap'),
    problem: loc(
      '底层的地铜皮被一道槽切开，USB 差分线正好从槽的上方穿过。',
      'A slot cuts the bottom-layer ground copper and the USB pair runs right across it.',
    ),
    reason: loc(
      '电流一定要回到源头，高频回流紧贴走线正下方的地平面，因为那条路电感最小。槽挡住了这条路，回流只能绕到槽的两端再回来，回路面积变大、电感变大，辐射和串扰都增加。见下面的回流路径动画。',
      'Current must return to its source, and at high frequency the return flows in the ground plane directly under the trace because that path has the lowest inductance. The slot blocks it, so the return detours around the slot ends and back; the loop area and inductance grow, and so do radiation and crosstalk. See the return-path animation below.',
    ),
    fix: loc(
      '不要在信号线下面的参考平面上开槽；必须开槽就让信号线绕开它，或者换层时在旁边打缝合地过孔，给回流一条近路。',
      'Do not cut slots in the reference plane under a signal; if a slot is unavoidable, route around it, or add stitching ground vias beside any layer change to give the return a shortcut.',
    ),
    good: loc(
      '地平面是完整的一整块，差分线下面处处是连续的地，回流可以紧贴走线下方通过。',
      'The ground plane is one solid piece, so there is continuous ground under the pair everywhere and the return can flow right under the trace.',
    ),
  },
]
