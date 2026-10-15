import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { DECAP_DIST_MM, diffZ, loopNh } from './pcbLayoutModel'

const nhFar = loopNh(DECAP_DIST_MM.far).toFixed(1)
const nhNear = loopNh(DECAP_DIST_MM.near).toFixed(1)
const zNarrow = diffZ(0.3, 0.2).toFixed(0)
const zWide = diffZ(0.3, 0.5).toFixed(0)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('MCU 的一个 VDD 脚要放 100 nF 去耦电容，哪种放法最好？', 'A 100 nF decoupling capacitor is needed at one MCU VDD pin. Which placement is best?'),
    options: [
      { id: 'a', text: loc('紧贴 VDD 脚，地过孔就在电容焊盘旁边', 'Right at the VDD pin with the ground via beside its pad') },
      { id: 'b', text: loc('放在板子中央，一颗管整块芯片', 'In the middle of the board, one capacitor for the whole chip') },
      { id: 'c', text: loc('放在 LDO 输出旁，那里电压最稳', 'Next to the LDO output where the voltage is steadiest') },
    ],
    answer: 'a',
    explain: loc(
      `电容是给芯片提供瞬时电流的，路径越长回路电感越大，同样的电流突变掉的电压越多（ΔV = L·di/dt）。本课的示意参数下，离 12 mm 时回路约 ${nhFar} nH，紧贴引脚（1.5 mm）约 ${nhNear} nH，差四倍以上。`,
      `The capacitor supplies the chip with instantaneous current; the longer the path the larger the loop inductance and the more voltage a given current step costs (dV = L di/dt). With this lesson's illustrative parameters the loop is about ${nhFar} nH at 12 mm and about ${nhNear} nH right at the pin (1.5 mm), more than four times less.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('高频信号走在完整的地平面上方，回流电流主要走哪里？', 'A high-frequency signal runs over a solid ground plane. Where does the return current mainly flow?'),
    options: [
      { id: 'a', text: loc('走线正下方的平面里', 'In the plane directly under the trace') },
      { id: 'b', text: loc('均匀分布在整块平面上', 'Spread evenly over the whole plane') },
      { id: 'c', text: loc('沿最近的板边走', 'Along the nearest board edge') },
    ],
    answer: 'a',
    explain: loc(
      '高频时电感起主要作用，电流选总电感最小的路径，也就是回路面积最小的那条，就在走线正下方，分布约 h / (h² + x²)。低频时才因为电阻起主要作用而散开。',
      'At high frequency inductance dominates and the current takes the lowest-inductance path, the smallest loop, directly under the trace, with a distribution of about h / (h^2 + x^2). It only spreads out at low frequency, where resistance dominates.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('判断：一条走线跨过参考平面上的一道槽，用示波器看 10 MHz 信号很干净，所以这道槽没有问题。', 'Judge: a trace crosses a slot in its reference plane and a 10 MHz signal looks clean on the scope, so the slot is harmless.'),
    options: [
      { id: 'a', text: loc('对，波形干净就说明没问题', 'True: a clean waveform means no problem') },
      { id: 'b', text: loc('错，边沿里有高得多的频率成分，那里回流会被迫绕行', 'False: the edges contain much higher frequencies, and there the return is forced to detour') },
    ],
    answer: 'b',
    explain: loc(
      '低频回流本来就散开在平面里，槽只让它多绕一点，看不出问题。但上升时间 1 ns 的边沿含有约 0.35 / 1 ns ≈ 350 MHz 的成分，这部分回流贴着走线、被槽挡住，只能绕到槽端，回路变大，辐射和串扰变大，在 10 MHz 的慢信号上看不到。',
      'The low-frequency return is already spread over the plane and the slot only adds a small detour, so nothing shows. But an edge with a 1 ns rise time contains components up to about 0.35 / 1 ns = 350 MHz; that part of the return hugs the trace, is blocked by the slot and detours around its end, so the loop and the radiation and crosstalk grow, none of which shows on a slow 10 MHz signal.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('为什么把地切成「模拟地」和「数字地」两块常常反而更糟？', 'Why does cutting the ground into an analog ground and a digital ground often make things worse?'),
    options: [
      { id: 'a', text: loc('跨过缝隙的信号失去了紧邻的回流路径，只能绕大圈，环路变大', 'A signal crossing the gap loses its nearby return path and must take a large detour, so the loop grows') },
      { id: 'b', text: loc('两块地的铜电阻加起来更大', 'The copper resistance of the two grounds adds up to more') },
      { id: 'c', text: loc('两块地之间会产生电压', 'A voltage appears between the two grounds') },
    ],
    answer: 'a',
    explain: loc(
      '回流一定要回到源头。信号线一旦跨缝，下面就没有连续的地，回流只能绕到缝的尽头或穿过缝隙两侧的电容，和上面的槽是同一个问题。更稳妥的做法是一块完整的地，加上模拟和数字分区摆放。',
      'The return must reach the source. Once a trace crosses the gap there is no continuous ground below it and the return must go around the end of the gap or across a capacitor over it, the same problem as the slot above. The safer practice is one solid ground with analog and digital placed in separate zones.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('其他尺寸不变，把 USB 差分对的两根线拉远（间距 s 变大），差分阻抗会怎样？', 'With everything else unchanged, what happens to the USB pair differential impedance when the two lines are moved apart (spacing s increases)?'),
    options: [
      { id: 'a', text: loc('变大，因为两线之间的耦合变弱', 'It rises, because the coupling between the two lines weakens') },
      { id: 'b', text: loc('变小，因为两线离得越远越像两根独立的线', 'It falls, because lines farther apart behave more like two independent lines') },
      { id: 'c', text: loc('不变，差分阻抗只由线宽决定', 'No change: differential impedance depends only on width') },
    ],
    answer: 'a',
    explain: loc(
      `紧耦合时两线互相拉低对方的阻抗，差分阻抗 = 2·Z0·(1 − 0.48·e^(−0.96·s/h))，拉远后括号里的值趋近 1。按 εr = 4.3、h = 0.2 mm、w = 0.3 mm 算，s = 0.2 mm 时约 ${zNarrow} Ω，s = 0.5 mm 时约 ${zWide} Ω（常用近似式，以板厂阻抗表为准）。`,
      `When tightly coupled the two lines pull each other's impedance down, with Zdiff = 2 Z0 (1 - 0.48 e^(-0.96 s/h)); moving apart drives the bracket toward 1. With er = 4.3, h = 0.2 mm and w = 0.3 mm it is about ${zNarrow} ohm at s = 0.2 mm and about ${zWide} ohm at s = 0.5 mm (a common approximation; the fab impedance table is authoritative).`,
    ),
  },
]
