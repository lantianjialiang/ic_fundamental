import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('NMOS 的体二极管阳极和阴极各在哪？同步降压的死区里低边电流为什么走它？', 'Where are the anode and cathode of an NMOS body diode? Why does the low-side current take it during the dead time of a synchronous buck?'),
    options: [
      { id: 'a', text: loc('阳极是源 / 体，阴极是漏；电感电流从 GND 流向 SW，使 Vds < 0，二极管正偏', 'Anode is source / body, cathode is drain; the inductor current flows from GND to SW, making Vds < 0 and forward biasing the diode') },
      { id: 'b', text: loc('阳极是漏，阴极是源；Vds > 0 时导通', 'Anode is drain, cathode is source; it conducts when Vds > 0') },
      { id: 'c', text: loc('阳极是栅，阴极是源；栅压为负时导通', 'Anode is gate, cathode is source; it conducts at negative gate voltage') },
    ],
    answer: 'a',
    explain: loc('体二极管是 p 型体（接源极）与 n+ 漏之间的 PN 结。电感电流不能突变，死区里沟道还没开，电流只能经它流进 SW，压降 Vf 约 0.7 V 以上；Vds > 0 时它是反偏。', 'The body diode is the PN junction between the p-type body (tied to source) and the n+ drain. Inductor current cannot jump and the channel is not on yet in the dead time, so the current can only enter SW through it, dropping Vf of about 0.7 V or more; with Vds > 0 it is reverse biased.'),
  },
  {
    id: 'q2',
    prompt: loc('工艺缩放把 Vth 从 0.7 V 降到 0.4 V，S 不变、约 80 mV/decade。Vgs = 0 时的 Ioff 大约变成多少倍？', 'Scaling lowers Vth from 0.7 V to 0.4 V with S unchanged at about 80 mV/decade. About how many times larger does Ioff at Vgs = 0 become?'),
    options: [
      { id: 'a', text: loc('约 2 倍', 'About 2 times') },
      { id: 'b', text: loc('约 5000 倍（3.75 个十倍频程）', 'About 5000 times (3.75 decades)') },
      { id: 'c', text: loc('不变，关断电流只由 Vgs 决定', 'Unchanged; off current depends only on Vgs') },
    ],
    answer: 'b',
    explain: loc('亚阈值电流随 (Vgs − Vth) / S 指数变化：Vth 少 0.3 V，就是 0.3 / 0.08 = 3.75 个十倍频程，10^3.75 ≈ 5600 倍，所以先进工艺漏电难管。', 'Subthreshold current varies exponentially with (Vgs − Vth) / S: 0.3 V less Vth is 0.3 / 0.08 = 3.75 decades, 10^3.75 ≈ 5600 times, which is why leakage is hard to control in advanced processes.'),
  },
  {
    id: 'q3',
    prompt: loc('判断：同一颗功率 MOSFET 的结温从 25 °C 升到 125 °C（栅压足够高），Vth 和 Rds(on) 怎么变？这对并联有什么影响？', 'Judge: a power MOSFET’s junction temperature rises from 25 °C to 125 °C (gate drive high enough). What happens to Vth and Rds(on), and what does it mean for paralleling?'),
    options: [
      { id: 'a', text: loc('Vth 下降约 0.2 V，Rds(on) 升到约 1.5 倍；热的那颗分流变少，可以并联均流', 'Vth falls about 0.2 V, Rds(on) rises to about 1.5 times; the hotter part takes less current, so parallel parts balance') },
      { id: 'b', text: loc('Vth 和 Rds(on) 都升高；热的那颗电流越来越大，并联会失控', 'Both Vth and Rds(on) rise; the hotter part draws ever more current and paralleling runs away') },
      { id: 'c', text: loc('Rds(on) 下降、Vth 上升；并联没有影响', 'Rds(on) falls and Vth rises; paralleling is unaffected') },
    ],
    answer: 'a',
    explain: loc('Vth 约 −2 mV/°C，所以少约 0.2 V；迁移率按 T^−1.5 下降，Rds(on) 约 ×1.5，是正温度系数，热的那颗电阻大、分流少，所以开关用功率管可以并联。', 'Vth is about −2 mV/°C, so about 0.2 V lower; mobility falls as T^−1.5 and Rds(on) is about ×1.5, a positive coefficient, so the hotter part has more resistance and takes less current, which is why switching power MOSFETs can be paralleled.'),
  },
  {
    id: 'q4',
    prompt: loc('一颗功率 MOSFET 的 Vgs 绝对最大值典型为 ±20 V，板上栅极直接接了 24 V 驱动电源。可以吗？', 'A power MOSFET’s Vgs absolute maximum is typically ±20 V, and the board drives its gate straight from a 24 V rail. Is that acceptable?'),
    options: [
      { id: 'a', text: loc('可以，内置的 ESD 稳压管会把电压钳住', 'Yes, the built-in ESD Zener will clamp the voltage') },
      { id: 'b', text: loc('不行，超过绝对最大值，氧化层受损；稳压管只扛瞬间静电脉冲，扛不了持续供电', 'No; beyond the absolute maximum the oxide is damaged, and the Zener survives only brief static pulses, not sustained supply') },
      { id: 'c', text: loc('可以，只要 Vds 够低', 'Yes, as long as Vds is low enough') },
    ],
    answer: 'b',
    explain: loc('Vgs 绝对最大值由栅氧的长期可靠性决定，和 Vds 无关；钳位器件很小，持续电压下电流大、发热快，会烧毁，之后栅极就没有保护了。', 'The Vgs absolute maximum is set by the long-term reliability of the gate oxide and has nothing to do with Vds; the clamp is tiny and under sustained voltage its current is large and it heats fast and burns out, leaving the gate unprotected.'),
  },
  {
    id: 'q5',
    prompt: loc('闩锁形成的是哪两个寄生三极管？为什么触发源撤掉后它还停不下来？', 'Which two parasitic transistors form latch-up, and why does it not stop after the trigger is removed?'),
    options: [
      { id: 'a', text: loc('PNP（p+ 源、n 阱、p 衬底）和 NPN（n+ 源、p 衬底、n 阱）；两者互相提供基极电流，β1 × β2 > 1 时正反馈自持', 'A PNP (p+ source, n-well, p-substrate) and an NPN (n+ source, p-substrate, n-well); each supplies the other’s base current, and with β1 × β2 > 1 the positive feedback holds itself') },
      { id: 'b', text: loc('两个 NMOS；栅极电荷放不掉', 'Two NMOS devices; the gate charge cannot drain') },
      { id: 'c', text: loc('体二极管和 ESD 二极管；它们并联一直导通', 'The body diode and the ESD diode; they are in parallel and stay on') },
    ],
    answer: 'a',
    explain: loc('Q1 的集电极电流流过 Rsub 给 Q2 供基极电流，Q2 的集电极电流流过 Rwell 给 Q1 供基极电流，形成可控硅，不再需要外部触发，只能断电再上电才能退出。', 'Q1’s collector current flows through Rsub and feeds Q2’s base, and Q2’s collector current flows through Rwell and feeds Q1’s base, forming a thyristor that no longer needs the external trigger; only cutting power and re-applying it exits the state.'),
  },
]
