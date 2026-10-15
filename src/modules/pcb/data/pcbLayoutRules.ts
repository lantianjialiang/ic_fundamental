import { loc, type LText } from '../../../i18n/locale'
import { type DecapId } from './pcbLayoutModel'

export const DECAP_OPTS: Array<{ id: DecapId; label: LText; text: LText }> = [
  {
    id: 'far',
    label: loc('电容在 12 mm 处', 'Capacitor 12 mm away'),
    text: loc(
      '电容在 12 mm 以外。电流环要从电容走一长段线到引脚，再从芯片地脚经过孔回到电容，环又大又长，电感最大，芯片要的瞬时电流电容来不及给，电压就掉下去。',
      'The capacitor is 12 mm away. The current loop runs a long trace from the capacitor to the pin and back from the chip ground pin through vias to the capacitor: large and long, so the inductance is highest, the capacitor cannot deliver the instantaneous current in time, and the voltage dips.',
    ),
  },
  {
    id: 'mid',
    label: loc('电容在 5 mm 处', 'Capacitor 5 mm away'),
    text: loc(
      '电容在 5 mm 处。比远处好，但电流环还是不小，这段走线本身就是一段电感，所以高频时电容的效果仍然大打折扣。',
      'The capacitor is 5 mm away. Better than far away, but the current loop is still sizable and that stretch of trace is itself an inductor, so at high frequency the capacitor still loses much of its effect.',
    ),
  },
  {
    id: 'near',
    label: loc('电容紧贴引脚（1.5 mm）', 'Capacitor at the pin (1.5 mm)'),
    text: loc(
      '电容在 1.5 mm 处，电源线先经过电容焊盘再进引脚，地过孔就在电容焊盘旁边。环路最小，电感主要剩下电容自身和两个过孔，所以这样放电压跌落最小。',
      'The capacitor is 1.5 mm away, the supply trace passes its pad before reaching the pin and the ground via sits beside the pad. The loop is smallest and the inductance is mostly the capacitor itself plus two vias, so the voltage dip is smallest.',
    ),
  },
]

export const DECAP_RULES: LText[] = [
  loc(
    '顺序：电源过孔 → 电容焊盘 → 芯片引脚。让电流先经过电容再进芯片，电容才真正「在路上」，而不是挂在旁边的分支上。',
    'Order: power via, then capacitor pad, then chip pin. Making the current pass the capacitor before the chip puts the capacitor on the path instead of on a side branch.',
  ),
  loc(
    '过孔紧贴电容焊盘：电容另一端到地平面的过孔越近，回路里少一段走线。不要用一根细线把电容接到远处的过孔。',
    'Via right at the capacitor pad: the closer the via to the ground plane is to the other end, the less trace in the loop. Do not connect the capacitor to a distant via with a thin trace.',
  ),
  loc(
    '小电容最靠近引脚：小容值的电容自身电感小、能在更高频率工作，要处理最快的电流突变，所以回路必须最短；大容值（如 4.7 µF）管较慢的变化，可以离远一点。',
    'Smallest capacitor closest to the pin: a small-value capacitor has lower own inductance and works at higher frequency; it handles the fastest current steps, so its loop must be shortest. A large value (such as 4.7 uF) handles slower changes and may sit a little farther away.',
  ),
  loc(
    '每个电源脚一颗：几个 VDD 脚各配一颗，别指望一颗电容照顾整块芯片。开关电流的来源见 {@mosDynamic}。',
    'One per supply pin: give each VDD pin its own capacitor and do not expect one capacitor to serve the whole chip. Where switching currents come from: {@mosDynamic}.',
  ),
  loc(
    '测试板上同理：load board 上 DUT 电源脚旁的去耦电容放得不对，测出来的 IDD 和波形就会带着振铃，排查见 {@fProgram}。',
    'The same applies on test boards: decoupling capacitors placed wrongly beside the DUT supply pins put ringing on the measured IDD and waveforms; troubleshooting is in {@fProgram}.',
  ),
]

export type CardId = 'routing' | 'xtal' | 'split' | 'diff' | 'thermal'

export type RuleCard = { id: CardId; title: LText; sub: LText; text: LText; points: LText[] }

export const CARDS: RuleCard[] = [
  {
    id: 'routing',
    title: loc('走线基本规则', 'Routing basics'),
    sub: loc('锐角 · 分支 · 先后', 'Angles, stubs, order'),
    text: loc(
      '先决定谁先走：时钟、差分对、电源这类关键信号先布，因为它们对长度、间距和下方的平面最敏感，后布的线会把它们挤成绕路。',
      'Decide who goes first: route critical signals such as clocks, differential pairs and power first, because they are the most sensitive to length, spacing and the plane below, and later traces would push them into detours.',
    ),
    points: [
      loc(
        '避免锐角，用 45° 或圆弧：锐角在蚀刻时会留下药水死角，线宽不稳（见 {@pcbFab}）；90° 拐角在高速时会略增电容，所以首选 45°。',
        'Avoid acute angles; use 45 degrees or arcs: an acute corner leaves a pocket for etchant and the width becomes uneven (see {@pcbFab}); a 90 degree corner adds a little capacitance at speed, so 45 degrees is preferred.',
      ),
      loc(
        '避免长分支（stub）：分支末端开路，信号在那里反射，回来和主信号叠加成振铃，所以测试点要放在线上，线穿过测试点。',
        'Avoid long stubs: the branch ends open, the signal reflects there and returns to add to the main signal as ringing, so put the test point on the trace and let the trace run through it.',
      ),
      loc(
        '关键信号优先：先布时钟和差分对，再布一般信号，最后补地和铺铜。',
        'Critical signals first: route clocks and differential pairs, then ordinary signals, then finish with ground and copper pours.',
      ),
    ],
  },
  {
    id: 'xtal',
    title: loc('晶振', 'Crystal'),
    sub: loc('靠近 · 围地 · 下面不走线', 'Close, guarded, clear below'),
    text: loc(
      '晶振和它的两颗负载电容构成一个小而敏感的振荡环，要一起贴在 MCU 的 OSC 脚旁边，线最短，四周用地铜皮围住，下一层保持完整的地、不走任何信号线。',
      'The crystal and its two load capacitors form a small, sensitive oscillator loop; keep them together right by the MCU OSC pins on the shortest traces, surround them with ground copper, and leave the layer below as solid ground with no signal traces.',
    ),
    points: [
      loc(
        '为什么靠近：振荡线上的电压很小、阻抗很高，线越长寄生电容越大，频率越不准、起振越慢，还会拾取噪声。',
        'Why close: the oscillator nodes carry little voltage at high impedance; the longer the trace the larger the parasitic capacitance, the less accurate the frequency, the slower the start-up, and the more noise it picks up.',
      ),
      loc(
        '为什么下面不走线：下方的信号会耦合进振荡线，晶振的边沿也会反过来干扰它们；一块完整的地把两者隔开。',
        'Why nothing below: a signal underneath couples into the oscillator, and the crystal edges disturb it in return; a solid ground plane separates the two.',
      ),
      loc(
        '为什么远离热源：晶振的频率随温度漂移，LDO 这类发热元件要放远一些。',
        'Why away from heat: the crystal frequency drifts with temperature, so keep hot parts such as the LDO farther away.',
      ),
    ],
  },
  {
    id: 'split',
    title: loc('模拟与数字分区', 'Analog and digital partitioning'),
    sub: loc('一块地 · 分区摆放', 'One ground, zoned placement'),
    text: loc(
      '一块完整的地，加上分区摆放：模拟部分放在一边，数字部分放在另一边，让数字的返回电流留在数字区的地里，不去碰模拟区。很多时候这比把地切成「模拟地」和「数字地」两块更好。',
      'One solid ground with zoned placement: analog on one side, digital on the other, so the digital return currents stay in the digital area of the ground and never visit the analog area. Often this beats cutting the ground into an analog ground and a digital ground.',
    ),
    points: [
      loc(
        '为什么分割地常常有害：信号线一旦跨过两块地之间的缝，回流就没有近路，只能绕大圈（见回流路径一节），环路变大，辐射和串扰反而更严重。',
        'Why splitting the ground often hurts: once a signal crosses the gap between the two grounds its return has no short path and takes a large detour (see the return-path section), the loop grows, and radiation and crosstalk get worse, not better.',
      ),
      loc(
        '分区摆放怎么做：模拟前端、ADC 和基准放在一侧，数字和时钟放在另一侧，电源在两者之间；数字信号不要穿过模拟区。',
        'How zoned placement works: analog front end, ADC and reference on one side, digital and clock on the other, power in between; no digital signal runs through the analog area.',
      ),
      loc(
        '什么时候才分割：你清楚每一股电流怎么流，并且所有信号都不跨缝，只在一点相连。新手先不要这样做。',
        'When to split: only when you know how every current flows, no signal crosses the gap, and the grounds join at one point. A beginner should not start there.',
      ),
    ],
  },
  {
    id: 'diff',
    title: loc('差分对（USB 等）', 'Differential pairs (USB etc.)'),
    sub: loc('90 Ω · 等长 · 等距', '90 ohm, equal length, equal spacing'),
    text: loc(
      'USB 的 D+ 和 D− 是一对差分线，要求差分阻抗约 90 Ω。做法是：两线等宽、间距不变、平行走、一起拐弯、长度尽量相等，并且下面是完整的参考平面。',
      'USB D+ and D- are a differential pair that needs a differential impedance of about 90 ohm. Keep the two lines equal in width, constant in spacing, parallel, turning together and as equal in length as possible, over a solid reference plane.',
    ),
    points: [
      loc(
        '等距：间距变，差分阻抗就变，信号会在阻抗跳变处反射。',
        'Equal spacing: if the spacing changes so does the differential impedance, and the signal reflects at the jump.',
      ),
      loc(
        '等长：一根比另一根长，两路信号的边沿到达时间就差一点点，差出来的部分不再互相抵消，变成共模噪声向外辐射。',
        'Equal length: if one line is longer, the two edges arrive slightly apart, the difference no longer cancels and becomes common-mode noise that radiates.',
      ),
      loc(
        '线宽、间距、到平面的距离怎么选，见 {@pcbBasics} 的阻抗计算和 {@pcbStack} 的叠层。下面的计算用的是常用近似式，实际数字以板厂给的阻抗表为准。',
        'How to choose width, spacing and height is in the impedance calculation of {@pcbBasics} and the stack-ups of {@pcbStack}. The calculation below is a common approximation; the fab impedance table is authoritative.',
      ),
    ],
  },
  {
    id: 'thermal',
    title: loc('热设计：铜皮与散热过孔', 'Thermal design: copper and thermal vias'),
    sub: loc('裸露焊盘 · 过孔阵列', 'Exposed pad, via array'),
    text: loc(
      '很多发热的芯片（QFN、功率器件）底部有一块裸露焊盘。把它焊到板上的大铜焊盘上，再在焊盘里打一片过孔，把热量传到板子背面的大铜皮上，靠铜皮散出去。',
      'Many hot chips (QFN, power devices) have an exposed pad on the underside. Solder it to a large copper pad on the board and put an array of vias in the pad to carry the heat to a large copper area on the back, which spreads it out.',
    ),
    points: [
      loc(
        '为什么用铜：铜的热导率约 385 W/(m·K)，比 FR-4 的 0.3 左右大一千多倍，所以热量几乎只会沿铜走。',
        'Why copper: copper conducts about 385 W/(m K), over a thousand times FR-4 at roughly 0.3, so heat travels almost only along copper.',
      ),
      loc(
        '一个过孔的热阻有一百多 K/W（见下面的计算），要靠数量并联；孔太大会被焊料吸走（焊料灯芯效应），常用 0.3 mm 左右的小孔，或者做塞孔。',
        'One via has a thermal resistance above a hundred K/W (see the calculation below), so use many in parallel; a large hole wicks solder away, so use small holes of about 0.3 mm or plug them.',
      ),
      loc(
        '铜皮越大越好，但大铜皮会拖走焊接时的热，热焊盘的取舍见 {@pcbBasics}。',
        'The larger the copper the better, but a big pour also pulls away soldering heat; the trade-off with thermal reliefs is in {@pcbBasics}.',
      ),
    ],
  },
]
