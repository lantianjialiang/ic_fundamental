import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { VDD, VTN } from '../model'
import { BOARD, CASES, LED_VF, condLoss, nHighMaxLoad, switchState } from './mosSwitchModel'

const f1 = (x: number) => x.toFixed(1)
const f2 = (x: number) => x.toFixed(2)

const pLed = switchState('pHigh', false)
const loss = condLoss(5, 0.02)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `栅极接 VDD = ${f1(VDD)} V、Vth = ${f1(VTN)} V 的 NMOS 传输管，输入 1 时输出最高能到多少（忽略体效应）？`,
      `An NMOS pass transistor has its gate at VDD = ${f1(VDD)} V and Vth = ${f1(VTN)} V. How high can the output get when the input is 1 (body effect ignored)?`,
    ),
    options: [
      { id: 'a', text: loc(`${f1(VDD)} V`, `${f1(VDD)} V`) },
      { id: 'b', text: loc(`${f1(VDD - VTN)} V`, `${f1(VDD - VTN)} V`) },
      { id: 'c', text: loc(`${f1(VTN)} V`, `${f1(VTN)} V`) },
    ],
    answer: 'b',
    explain: loc(
      `输出就是 NMOS 的源极，输出升高时 Vgs = VDD − Vout 变小，升到 VDD − Vth = ${f1(VDD - VTN)} V 时 Vgs = Vth，管子关断，输出停在这里。`,
      `The output is the NMOS source; as it rises, Vgs = VDD − Vout shrinks, and at VDD − Vth = ${f1(VDD - VTN)} V we have Vgs = Vth, the device shuts off and the output stops there.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'PMOS 传输管（栅极接地）传 0 时，输出为什么停在 |Vtp| 而不是 0 V？',
      'Why does a PMOS pass transistor (gate grounded) passing a 0 stop at |Vtp| instead of 0 V?',
    ),
    options: [
      { id: 'a', text: loc('沟道在漏端被夹断了', 'The channel is pinched off at the drain') },
      { id: 'b', text: loc('体二极管导通，把输出钳住', 'The body diode conducts and clamps the output') },
      { id: 'c', text: loc('输出是源极，Vsg = Vout 随输出下降，降到 |Vtp| 沟道就消失', 'The output is the source, so Vsg = Vout falls with the output and the channel vanishes at |Vtp|') },
    ],
    answer: 'c',
    explain: loc(
      '夹断发生在饱和区，只限制电流大小，不会让电流变成 0；这里是 Vsg 降到 |Vtp| 以下，沟道没有了，电流才为 0。体二极管此时是反偏的，不起作用。',
      'Pinch-off happens in saturation and only limits the current size, it never makes it 0; here Vsg falls to |Vtp| and the channel disappears, which is what makes the current 0. The body diode is reverse-biased and plays no part.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '板级 NMOS 的 Rds(on) = 20 mΩ，持续通过 5 A，导通损耗大约是多少？',
      'A board-level NMOS has Rds(on) = 20 mΩ and carries 5 A continuously. About how much is the conduction loss?',
    ),
    options: [
      { id: 'a', text: loc(`${f2(loss)} W`, `${f2(loss)} W`) },
      { id: 'b', text: loc('0.1 W', '0.1 W') },
      { id: 'c', text: loc('100 W', '100 W') },
    ],
    answer: 'a',
    explain: loc(
      `P = I²·Rds(on) = 5² × 0.02 = ${f2(loss)} W。注意是电流的平方：只乘一次 I 得到的是 0.1 W，那是压降 I·Rds，不是损耗。`,
      `P = I²·Rds(on) = 5² × 0.02 = ${f2(loss)} W. Note the square of the current: multiplying I only once gives 0.1, which is the drop I·Rds in volts, not the loss.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `用 ${CASES.nHigh.vHigh} V 的 GPIO 直接驱动 ${CASES.nHigh.vdd} V 电源上的 NMOS 高边开关（Vth = ${BOARD.vth} V），负载上最多能得到多少电压？`,
      `A ${CASES.nHigh.vHigh} V GPIO drives an NMOS high-side switch on a ${CASES.nHigh.vdd} V supply (Vth = ${BOARD.vth} V). At most how much voltage can the load get?`,
    ),
    options: [
      { id: 'a', text: loc(`${CASES.nHigh.vdd} V`, `${CASES.nHigh.vdd} V`) },
      { id: 'b', text: loc(`约 ${f1(CASES.nHigh.vHigh)} V`, `About ${f1(CASES.nHigh.vHigh)} V`) },
      { id: 'c', text: loc(`约 ${f1(nHighMaxLoad(CASES.nHigh.vHigh))} V`, `About ${f1(nHighMaxLoad(CASES.nHigh.vHigh))} V`) },
    ],
    answer: 'c',
    explain: loc(
      `源极就是负载端，升到 Vg − Vth = ${f1(CASES.nHigh.vHigh)} − ${BOARD.vth} = ${f1(nHighMaxLoad(CASES.nHigh.vHigh))} V 时 Vgs 只剩 Vth，管子关断。要到 ${CASES.nHigh.vdd} V，栅极必须高于 ${CASES.nHigh.vdd + BOARD.vth} V，所以要自举或电荷泵。`,
      `The source is the load end; once it reaches Vg − Vth = ${f1(CASES.nHigh.vHigh)} − ${BOARD.vth} = ${f1(nHighMaxLoad(CASES.nHigh.vHigh))} V, Vgs is down to Vth and the device shuts off. To reach ${CASES.nHigh.vdd} V the gate must exceed ${CASES.nHigh.vdd + BOARD.vth} V, hence a bootstrap or charge pump.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `PMOS 高边开关（源极接 ${CASES.pHigh.vdd} V，串 ${CASES.pHigh.rSeries} Ω 和红色 LED，Vf ≈ ${LED_VF} V），GPIO 输出 0 V 时是什么状态？`,
      `A PMOS high-side switch has its source at ${CASES.pHigh.vdd} V, driving a ${CASES.pHigh.rSeries} Ω resistor and a red LED (Vf ≈ ${LED_VF} V). What is the state when the GPIO outputs 0 V?`,
    ),
    options: [
      { id: 'a', text: loc(`导通，Vsg = ${CASES.pHigh.vdd} V，LED 亮，约 ${(pLed.i * 1000).toFixed(0)} mA`, `On, Vsg = ${CASES.pHigh.vdd} V, LED lit, about ${(pLed.i * 1000).toFixed(0)} mA`) },
      { id: 'b', text: loc('截止，LED 灭', 'Off, LED dark') },
      { id: 'c', text: loc('导通，但 LED 不亮', 'On, but the LED stays dark') },
    ],
    answer: 'a',
    explain: loc(
      `PMOS 的 Vsg = ${CASES.pHigh.vdd} − 0 = ${CASES.pHigh.vdd} V，大于 Vth，管子导通。电流 I = (${CASES.pHigh.vdd} − ${LED_VF}) / ${CASES.pHigh.rSeries} ≈ ${(pLed.i * 1000).toFixed(2)} mA，足够点亮 LED。PMOS 高边是低电平有效。`,
      `The PMOS has Vsg = ${CASES.pHigh.vdd} − 0 = ${CASES.pHigh.vdd} V, above Vth, so it conducts. The current is I = (${CASES.pHigh.vdd} − ${LED_VF}) / ${CASES.pHigh.rSeries} ≈ ${(pLed.i * 1000).toFixed(2)} mA, enough to light the LED. A PMOS high-side switch is active low.`,
    ),
  },
]
