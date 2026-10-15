import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerDiode: loc('体二极管', 'Body diode'),
  kickerSub: loc('亚阈值漏电', 'Subthreshold leakage'),
  kickerTemp: loc('温度', 'Temperature'),
  kickerEsd: loc('栅极保护', 'Gate protection'),
  kickerLatch: loc('闩锁', 'Latch-up'),
  kickerScale: loc('工艺缩放', 'Process scaling'),
  introTitle: loc('理想开关之外：六个真实问题', 'Beyond the ideal switch: six real-world issues'),
  diodeTitle: loc('体二极管：Vds < 0 时它先导通', 'Body diode: it conducts first when Vds < 0'),
  diodeNote: loc('在同步降压的半桥里切换三种状态，看电流走二极管还是沟道，以及压降和损耗差多少。', 'Switch the synchronous buck half-bridge between three states and see whether current takes the diode or the channel, and how much the drop and loss differ.'),
  subTitle: loc('亚阈值漏电：关断不是 0', 'Subthreshold leakage: off is not zero'),
  subNote: loc('对数坐标下 Vgs 低于 Vth 的部分是一条直线，斜率就是 S。拖 Vgs、换斜率因子、调温度。', 'Below Vth the curve is a straight line on a log scale, and its slope is S. Drag Vgs, change the slope factor, adjust temperature.'),
  tempTitle: loc('温度：Vth 往下走，Rds(on) 往上走', 'Temperature: Vth goes down, Rds(on) goes up'),
  tempNote: loc('拖温度，看转移特性曲线、Vth、Rds(on) 和两颗并联管子的电流怎么变。', 'Drag temperature and watch the transfer curve, Vth, Rds(on) and the current split between two parallel parts.'),
  esdTitle: loc('栅极 ESD 与 Vgs 绝对最大值', 'Gate ESD and the Vgs absolute maximum'),
  esdNote: loc('选器件类型，拖 Vgs 到绝对最大值之外，看分区和钳位器件的反应。', 'Pick a device type and drag Vgs beyond the absolute maximum to see the zones and the clamp respond.'),
  latchTitle: loc('闩锁：CMOS 里藏着一个可控硅', 'Latch-up: a thyristor hides inside CMOS'),
  latchNote: loc('从触发开始一步一步播放：先通 PNP，再通 NPN，最后互相锁住。', 'Play from the trigger: the PNP turns on, then the NPN, then they lock each other on.'),
  scaleTitle: loc('工艺缩放：越做越小，漏电越来越难管', 'Process scaling: smaller and smaller, leakage harder to control'),
  scaleNote: loc('选工艺节点，看 VDD、Vth、DIBL 和关断漏电的变化。所有数值是示意的量级。', 'Pick a process node and see VDD, Vth, DIBL and off leakage change. All values are illustrative orders of magnitude.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('这一课的结论在选型里都会用到：Rds(on) 随温度、栅压绝对最大值和体二极管参数，见「读数据手册与选型」；闩锁和漏电的测试方法见 Latch-up 与 DC Test 两课。', 'These conclusions all return in part selection: Rds(on) versus temperature, the gate maximum and body-diode parameters are in Reading Datasheets and Choosing a Part; how latch-up and leakage are tested is in the Latch-up and DC Test lessons.'),
  next: loc('下一课：读数据手册与选型', 'Next: Reading datasheets and choosing a part'),
}

export const INTRO: LText[] = [
  loc(
    '前面几课把 MOS 管当成「栅压高就通、栅压低就断」的理想开关。真实器件还有六件事要留意：源漏和衬底之间天然有一个 PN 结（体二极管）；关断时仍有亚阈值漏电；温度会改变 Vth 和 Rds(on)；栅氧很薄，怕过压和静电；CMOS 里藏着寄生可控硅（闩锁）；工艺越缩越小，又会带来短沟道效应。',
    'The earlier lessons treated the MOSFET as an ideal switch: gate high means on, gate low means off. Real parts need six more things kept in mind: a PN junction sits naturally between source / drain and body (the body diode); there is still subthreshold leakage when off; temperature changes Vth and Rds(on); the gate oxide is thin and fears overvoltage and static; CMOS hides a parasitic thyristor (latch-up); and as processes shrink, short-channel effects appear.',
  ),
  loc(
    '每一节都按「现象、原因、后果或对策」讲。这些问题在测试里都会遇到：关断漏电是 {@dc} 里静态电流和漏电项的来源，引脚上的 ESD 二极管是 {@fOpens} 开短路测试的依据，闩锁有专门的 {@latch} 和 {@fLatch}。想看测试台怎么测，去 {@vate}。板级的 H 桥和同步整流见 {@mosApps}。',
    'Each section goes phenomenon, cause, then consequence or fix. All of these show up in test: off leakage is the source of the static-current and leakage items in {@dc}, the ESD diodes on pins are what {@fOpens} relies on, and latch-up has its own {@latch} and {@fLatch}. To see how a tester measures them, go to {@vate}. Board-level H-bridges and synchronous rectification are in {@mosApps}.',
  ),
  loc(
    'n 阱、p 衬底、栅氧是怎么做出来的，见 {@pSilicon}；工艺为什么一代代缩小，见 {@pHistory}。',
    'How the n-well, p-substrate and gate oxide are made is in {@pSilicon}; why processes shrink generation after generation is in {@pHistory}.',
  ),
]

export type DiodeMode = 'dead' | 'sync' | 'block'

export const DIODE_MODES: Array<{ id: DiodeMode; label: LText; title: LText; text: LText; tone: 'ok' | 'warn' | 'bad' }> = [
  {
    id: 'dead',
    label: loc('死区：两管都关', 'Dead time: both off'),
    title: loc('死区时间：体二极管接力', 'Dead time: the body diode takes over'),
    text: loc(
      '高边刚关断，低边还没开：电感电流不能突变，必须继续流向负载，只能从 GND 经低边的体二极管流进 SW 点。NMOS 体二极管的阳极是源极 / 体，阴极是漏极，Vds < 0 就是二极管正偏，所以 Vds = −Vf，SW 点会短暂低于地。压降约 0.7 V 以上，损耗是 Vf × I，比沟道导通大得多。',
      'The high side has just turned off and the low side is not on yet: inductor current cannot jump, so it must keep flowing to the load, and its only path is from GND through the low-side body diode into the SW node. The NMOS body diode has its anode at source / body and cathode at drain, so Vds < 0 means the diode is forward biased: Vds = −Vf and SW dips briefly below ground. The drop is 0.7 V or more, and the loss Vf × I is much larger than channel conduction.',
    ),
    tone: 'warn',
  },
  {
    id: 'sync',
    label: loc('低边导通（同步整流）', 'Low side on (synchronous)'),
    title: loc('沟道接管：压降小一个数量级', 'The channel takes over: a tenth of the drop'),
    text: loc(
      '死区过后低边栅极拉高，沟道导通。沟道正反向都能导电，同一电流改走沟道，压降 = I × Rds(on)，例如 10 mΩ × 10 A 只有 0.1 V，比二极管的 0.7 V 以上小得多，损耗 = I² × Rds(on) 也小得多。这就是同步整流比二极管整流效率高的原因；体二极管只负责死区这一小段。',
      'After the dead time the low-side gate goes high and the channel conducts. A channel conducts in both directions, so the same current now takes the channel, with a drop of I × Rds(on), for example 10 mΩ × 10 A is only 0.1 V, far below the diode’s 0.7 V or more, and a loss of I² × Rds(on), also much smaller. That is why synchronous rectification beats diode rectification; the body diode only covers the short dead time.',
    ),
    tone: 'ok',
  },
  {
    id: 'block',
    label: loc('高边导通：低边关断', 'High side on, low side off'),
    title: loc('Vds > 0：体二极管反偏，不导通', 'Vds > 0: the body diode is reverse biased'),
    text: loc(
      '高边导通时 SW 点接近 VIN，低边的 Vds = +VIN。体二极管阴极（漏）比阳极（源）高，是反偏，所以不导通；低边靠它和关断的沟道一起承受 VIN，不漏电流。体二极管只在 Vds < 0 时才导通，这也是为什么选管子时要看 Vds 的额定值比 VIN 高。',
      'With the high side on, SW sits near VIN and the low side has Vds = +VIN. The body diode’s cathode (drain) is higher than its anode (source), so it is reverse biased and does not conduct; the low side withstands VIN with this reverse-biased junction and the off channel, leaking nothing. The body diode conducts only when Vds < 0, which is also why a part’s Vds rating must exceed VIN.',
    ),
    tone: 'ok',
  },
]

export const DIODE_LABEL = {
  current: loc('负载电流 I', 'Load current I'),
  vds: loc('低边 Vds', 'Low-side Vds'),
  loss: loc('低边导通损耗', 'Low-side conduction loss'),
  path: loc('电流路径', 'Current path'),
  viaDiode: loc('体二极管', 'Body diode'),
  viaChannel: loc('沟道', 'Channel'),
  viaNone: loc('无（HS → L）', 'None (HS → L)'),
  hsOn: loc('高边 开', 'HS on'),
  hsOff: loc('高边 关', 'HS off'),
  lsOn: loc('低边 开', 'LS on'),
  lsOff: loc('低边 关', 'LS off'),
  diode: loc('体二极管', 'body diode'),
  load: loc('负载', 'Load'),
  cap: loc(
    '示意电路：同步降压的半桥，金色粗线是当前电流路径。示意参数：低边 Rds(on) = 10 mΩ（25 °C），体二极管在 10 A 时 Vf = 0.75 V。',
    'Illustrative circuit: the half-bridge of a synchronous buck; the thick gold line is the present current path. Illustrative parameters: low-side Rds(on) = 10 mΩ at 25 °C, body-diode Vf = 0.75 V at 10 A.',
  ),
}

export const RECOVERY: LText[] = [
  loc(
    '反向恢复：二极管导通时 PN 结两侧存着少子电荷 Qrr。死区后高边重新打开、电流要反转时，这些电荷必须先被抽走，体二极管会反向导通一小段时间，形成从 VIN 经 SW 流到 GND 的尖峰电流，增加高边的开关损耗，也让 SW 点振铃。体二极管越慢（Qrr 越大）越明显，所以大电流半桥和 H 桥选管时要看 Qrr 和 trr。',
    'Reverse recovery: while the diode conducts, minority charge Qrr is stored on both sides of the PN junction. When the high side turns on again and the current has to reverse, that charge must be swept out first, so the body diode conducts backwards for a short time, giving a spike from VIN through SW to GND that adds switching loss in the high side and rings the SW node. A slower body diode (larger Qrr) makes this worse, so for high-current half-bridges and H-bridges check Qrr and trr when choosing a part.',
  ),
  loc(
    'H 桥驱动电机时道理一样：电机是电感，关断一对管子后电流靠另一侧的体二极管续流（见 {@mosApps}）。',
    'The same applies when an H-bridge drives a motor: the motor is an inductor, and after one pair turns off its current freewheels through the body diodes on the other side (see {@mosApps}).',
  ),
]
