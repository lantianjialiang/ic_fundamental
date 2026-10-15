import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么静态 CMOS 逻辑门天然是反相的（NAND、NOR，而不是直接的 AND、OR）？', 'Why are static CMOS gates naturally inverting (NAND and NOR rather than a direct AND or OR)?'),
    options: [
      { id: 'a', text: loc('因为下拉只能用 NMOS、上拉只能用 PMOS，输入升高只会让 NMOS 更通、PMOS 更断，把输出往下拉', 'Because the pull-down can only be NMOS and the pull-up only PMOS, so a rising input only turns NMOS on more and PMOS off more, pulling the output down') },
      { id: 'b', text: loc('因为 PMOS 比 NMOS 慢，所以只能反相', 'Because PMOS is slower than NMOS, so it can only invert') },
      { id: 'c', text: loc('因为 AND、OR 在数学上不能用晶体管实现', 'Because AND and OR cannot be implemented with transistors mathematically') },
    ],
    answer: 'a',
    explain: loc(
      '用反了的话，NMOS 上拉只能到 VDD − Vtn，PMOS 下拉只能到 |Vtp|，电平不满幅。所以上拉用 PMOS、下拉用 NMOS，而输入升高只会加强下拉，输出必然下降。AND、OR 要在 NAND、NOR 后面再接一个反相器实现。',
      'Used the other way round, an NMOS pull-up only reaches VDD − Vtn and a PMOS pull-down only |Vtp|, so the levels are not full swing. So the pull-up is PMOS and the pull-down NMOS, and a rising input only strengthens the pull-down, so the output must fall. AND and OR are made by adding an inverter after NAND or NOR.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('NOR2 门，A = 1、B = 0。哪句描述是对的？', 'A NOR2 gate has A = 1, B = 0. Which description is correct?'),
    options: [
      { id: 'a', text: loc('A 的 NMOS 导通，OUT 接 GND，Y = 0；串联的 PMOS 被 A 的 PMOS 挡住', 'The NMOS of A conducts and ties OUT to GND, Y = 0; the series PMOS are blocked by the PMOS of A') },
      { id: 'b', text: loc('B 的 PMOS 导通，OUT 接 VDD，Y = 1', 'The PMOS of B conducts and ties OUT to VDD, Y = 1') },
      { id: 'c', text: loc('上拉和下拉都不通，OUT 浮空', 'Neither pull-up nor pull-down conducts and OUT floats') },
    ],
    answer: 'a',
    explain: loc(
      'NOR 的下拉是 NMOS 并联：A = 1 让 A 的 NMOS 导通，一条通路就够。上拉是 PMOS 串联，A = 1 时 A 的 PMOS 关断，串联链断开，所以 B 的 PMOS 虽然导通也没用。',
      'The NOR pull-down is NMOS in parallel: A = 1 turns the NMOS of A on, and one path is enough. The pull-up is PMOS in series, and with A = 1 the PMOS of A is off, so the chain is broken and the conducting PMOS of B does not help.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('AOI 门 Y = ¬(A·B + C) 的下拉网络是 (A 串 B) 再并联 C。它的上拉网络（PMOS）应该是？', 'An AOI gate Y = ¬(A·B + C) has a pull-down of (A in series with B) in parallel with C. What should its PMOS pull-up be?'),
    options: [
      { id: 'a', text: loc('A、B 并联，再和 C 串联', 'A and B in parallel, in series with C') },
      { id: 'b', text: loc('A、B 串联，再和 C 并联', 'A and B in series, in parallel with C') },
      { id: 'c', text: loc('A、B、C 三只全部并联', 'All three of A, B, C in parallel') },
    ],
    answer: 'a',
    explain: loc(
      '上拉是下拉的对偶：串联换并联，并联换串联。A·B 串联变成 A ∥ B，和 C 的并联变成串联。验证：上拉通的条件 (¬A + ¬B)·¬C 正好是 ¬(A·B + C)。',
      'The pull-up is the dual of the pull-down: series becomes parallel and parallel becomes series. A·B in series becomes A ∥ B, and the parallel with C becomes a series. Check: the pull-up conducts on (¬A + ¬B)·¬C, which is exactly ¬(A·B + C).',
    ),
  },
  {
    id: 'q4',
    prompt: loc('传输门（C = 1）要把 IN = 3.3 V 传到 OUT。此时哪只管子在起作用？', 'A transmission gate (C = 1) must pass IN = 3.3 V to OUT. Which transistor is doing the work?'),
    options: [
      { id: 'a', text: loc('NMOS：它导通最强，因为输入是高电平', 'The NMOS: it is strongest because the input is high') },
      { id: 'b', text: loc('PMOS：Vsg = 3.3 V，强导通；NMOS 的 Vgs = VDD − Vin = 0 已关断', 'The PMOS: Vsg = 3.3 V so it is strongly on; the NMOS has Vgs = VDD − Vin = 0 and is off') },
      { id: 'c', text: loc('两只一样强', 'Both are equally strong') },
    ],
    answer: 'b',
    explain: loc(
      'NMOS 栅极接 VDD、源极在 3.3 V，Vgs = 0，截止；PMOS 栅极接 0、源极 3.3 V，Vsg = 3.3 V，导通，把 OUT 传到满幅 3.3 V。这就是并联 PMOS 的作用：NMOS 单独传 1 只能到 2.6 V。NMOS 的导通要看 Vgs（栅极减源极），不是看输入高低。',
      'The NMOS gate is at VDD and its source at 3.3 V, so Vgs = 0 and it is off; the PMOS gate is at 0 and its source at 3.3 V, so Vsg = 3.3 V and it conducts, passing OUT to the full 3.3 V. That is the job of the parallel PMOS: an NMOS alone would only reach 2.6 V. An NMOS conducts according to Vgs (gate minus source), not according to whether the input is high.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('三态门 EN = 0 时，输出是什么状态？', 'What state is the output of a tri-state gate when EN = 0?'),
    options: [
      { id: 'a', text: loc('逻辑 0', 'Logic 0') },
      { id: 'b', text: loc('逻辑 1', 'Logic 1') },
      { id: 'c', text: loc('高阻 Z：上拉和下拉都关断，输出浮空', 'High-Z: pull-up and pull-down are both off and the output floats') },
    ],
    answer: 'c',
    explain: loc(
      'EN = 0 时靠近电源的 PMOS（栅极 ¬EN）和靠近地的 NMOS（栅极 EN）都关断，OUT 不通 VDD 也不通 GND。测试时这个状态的漏电流叫 IOZ，要在输出关断后单独测。',
      'With EN = 0 the PMOS next to the supply (gate ¬EN) and the NMOS next to ground (gate EN) are both off, so OUT connects to neither VDD nor GND. In test the leakage in this state is called IOZ and is measured separately with the output turned off.',
    ),
  },
]
