import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '用 NMOS 低边开关驱动 5 V 继电器线圈，没有并联续流二极管。GPIO 从高变低的瞬间，最可能发生什么？',
      'A 5 V relay coil is driven by a low-side NMOS with no flyback diode. At the instant the GPIO goes from high to low, what is most likely to happen?',
    ),
    options: [
      { id: 'a', text: loc('漏极电压冲到远高于 5 V，可能击穿管子', 'The drain voltage spikes far above 5 V and may break down the transistor') },
      { id: 'b', text: loc('继电器释放得更快，没有任何副作用', 'The relay releases faster with no side effect') },
      { id: 'c', text: loc('漏极电压被钳在 0 V', 'The drain voltage is clamped at 0 V') },
    ],
    answer: 'a',
    explain: loc(
      '线圈是电感，v = L·di/dt。管子关断时电流想保持不变，只能把漏极电压推到很高，直到管子雪崩击穿或触点拉弧。并联续流二极管后，漏极只会被钳在 5 V 加 0.7 V。',
      'A coil is an inductor, v = L·di/dt. At turn-off the current insists on continuing and can only push the drain voltage very high, until the transistor avalanches or the contacts arc. With a flyback diode the drain is clamped at just 5 V plus 0.7 V.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'PMOS 防反接电路：漏极接电池正，源极接负载，栅极经电阻接地。电池接反时，PMOS 处于什么状态？',
      'PMOS reverse-polarity circuit: drain to battery plus, source to load, gate to ground through a resistor. With the battery connected backwards, what state is the PMOS in?',
    ),
    options: [
      { id: 'a', text: loc('体二极管导通，负载得到约 Vbat − 0.7 V 的反向电压', 'The body diode conducts and the load gets about Vbat − 0.7 V reversed') },
      { id: 'b', text: loc('Vgs = −Vbat，沟道导通', 'Vgs = −Vbat and the channel conducts') },
      { id: 'c', text: loc('Vgs = 0，体二极管反偏，沟道不形成，负载电压为 0', 'Vgs = 0, the body diode is reverse biased, no channel forms and the load sees 0 V') },
    ],
    answer: 'c',
    explain: loc(
      '反接时漏极电压比地低一个电池电压，栅极经电阻在 0 V，所以 Vgs = 0，沟道不形成；体二极管阳极（漏极）比阴极（源极）低，反偏。选项 A 是 PMOS 装反（源漏对调）时才会出现的现象。',
      'In reverse the drain sits one battery voltage below ground while the gate is at 0 V through the resistor, so Vgs = 0 and no channel forms; the body diode’s anode (drain) is below its cathode (source) and blocks. Option A happens only when the PMOS is mounted backwards (source and drain swapped).',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '单管 I2C 电平转换（栅极 3.3 V，源极在 3.3 V 侧，漏极在 5 V 侧）。5 V 一侧的器件把线拉低，3.3 V 侧原本是高电平。管子是怎么把低电平传过来的？',
      'Single-transistor I2C level shifter (gate 3.3 V, source on the 3.3 V side, drain on the 5 V side). The 5 V device pulls its line low while the 3.3 V side is high. How does the transistor pass the low across?',
    ),
    options: [
      { id: 'a', text: loc('体二极管先导通把源极拉到约 0.6 V，Vgs 增大后沟道导通', 'The body diode conducts first and pulls the source to about 0.6 V, then rising Vgs turns the channel on') },
      { id: 'b', text: loc('一开始 Vgs = 3.3 V，沟道直接导通', 'Vgs is 3.3 V from the start and the channel conducts at once') },
      { id: 'c', text: loc('传不过去，只有 3.3 V 侧能拉低 5 V 侧', 'It cannot; only the 3.3 V side can pull the 5 V side low') },
    ],
    answer: 'a',
    explain: loc(
      '开始时源极在 3.3 V，Vgs = 3.3 − 3.3 = 0，沟道不存在。漏极被拉低后，体二极管（阳极源极、阴极漏极）正向导通，源极降到约 0.6 V，Vgs ≈ 2.7 V 大于 Vth，沟道导通，把 3.3 V 侧拉到接近 0。所以两个方向都能传低电平。',
      'At the start the source is at 3.3 V, so Vgs = 3.3 − 3.3 = 0 and there is no channel. Once the drain is pulled low, the body diode (anode at the source, cathode at the drain) conducts, the source falls to about 0.6 V, Vgs ≈ 2.7 V exceeds Vth, the channel conducts and brings the 3.3 V side close to 0. A low therefore passes in both directions.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '开漏总线：上拉电阻 Rp = 4.7 kΩ，线电容 Cb = 100 pF。10–90 % 上升时间大约是多少？',
      'Open-drain bus: pull-up Rp = 4.7 kΩ, line capacitance Cb = 100 pF. About how long is the 10–90 % rise time?',
    ),
    options: [
      { id: 'a', text: loc('约 0.47 µs', 'About 0.47 µs') },
      { id: 'b', text: loc('约 1.0 µs', 'About 1.0 µs') },
      { id: 'c', text: loc('约 4.7 µs', 'About 4.7 µs') },
    ],
    answer: 'b',
    explain: loc(
      'RC = 4.7 kΩ × 100 pF = 0.47 µs，这只是电压升到 63 % 的时间。10–90 % 上升时间 = RC·ln9 ≈ 2.2·RC ≈ 1.03 µs。上升沿由上拉电阻决定，Rp 或 Cb 翻倍，上升时间也翻倍。',
      'RC = 4.7 kΩ × 100 pF = 0.47 µs, which is only the time to reach 63 %. The 10–90 % rise time = RC·ln9 ≈ 2.2·RC ≈ 1.03 µs. The pull-up sets the rising edge, so doubling Rp or Cb doubles the rise time.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      'H 桥里 Q1、Q2 在左桥臂（Q1 上管、Q2 下管），Q3、Q4 在右桥臂（Q3 上管、Q4 下管）。下面哪一种导通组合是禁止的？',
      'In an H-bridge, Q1 and Q2 are the left leg (Q1 high, Q2 low) and Q3 and Q4 the right leg (Q3 high, Q4 low). Which conduction combination is forbidden?',
    ),
    options: [
      { id: 'a', text: loc('Q1 + Q4（正转）', 'Q1 + Q4 (forward)') },
      { id: 'b', text: loc('Q2 + Q4（刹车）', 'Q2 + Q4 (brake)') },
      { id: 'c', text: loc('Q1 + Q2（同一桥臂）', 'Q1 + Q2 (the same leg)') },
    ],
    answer: 'c',
    explain: loc(
      'Q1 + Q2 同时导通，电源经两只管子直接短路到地，电流只被两个 Rds(on) 限制，可达上百安培，管子瞬间烧毁，这叫直通。换向时要加死区时间。正转（Q1 + Q4）和刹车（Q2 + Q4）都是正常状态。',
      'With Q1 + Q2 on together the supply is shorted to ground through two transistors, limited only by their two Rds(on), possibly hundreds of amps, and the transistors burn out at once; this is shoot-through, so a dead time is needed when reversing. Forward (Q1 + Q4) and brake (Q2 + Q4) are both normal states.',
    ),
  },
]
