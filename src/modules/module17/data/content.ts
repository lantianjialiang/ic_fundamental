import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Period=10、Drive=2、tpd=4、Strobe=3，为什么 Fail？', 'Period=10, Drive=2, tpd=4, Strobe=3. Why does it fail?'),
    options: [
      { id: 'xor', text: loc('XOR 真值表反了', 'The XOR truth table is inverted') },
      { id: 'early', text: loc('Strobe 在 DUT 输出稳定之前，比较到的是旧值', 'The strobe is before the DUT output settles, so it compares the old value') },
      { id: 'vdd', text: loc('一定是电源没接', 'The power must be disconnected') },
      { id: 'ok', text: loc('其实应该 Pass', 'It should actually pass') },
    ],
    answer: 'early',
    explain: loc('输出要到 Drive + tpd = 6 ns 才变。3 ns 去采，采到的是上一拍。', 'The output only changes at Drive + tpd = 6 ns. Sampling at 3 ns reads the previous cycle.'),
  },
  {
    id: 'q2',
    prompt: loc('Period=6、Drive=2、tpd=5，Strobe 放在哪都 Fail，为什么？', 'Period=6, Drive=2, tpd=5. The strobe fails anywhere. Why?'),
    options: [
      { id: 'slow', text: loc('Drive + tpd = 7 ns 已超过周期，这一拍里输出来不及稳定', 'Drive + tpd = 7 ns exceeds the period; the output never settles within the cycle') },
      { id: 'limit', text: loc('Limit 设得太紧', 'The limit is too tight') },
      { id: 'stuck', text: loc('Y[0] 粘 0', 'Y[0] stuck-at-0') },
      { id: 'pmu', text: loc('PMU 没连上', 'The PMU is not connected') },
    ],
    answer: 'slow',
    explain: loc('要么加长 Period（降频），要么这颗芯片的 tpd 不满足这个速度。这正是 fMAX 测试在问的事。', 'Either lengthen the period (lower the frequency) or the chip\'s tpd cannot meet this speed. That is exactly what an fMAX test asks.'),
  },
  {
    id: 'q3',
    prompt: loc('同一颗漏电 3.2 μA 的芯片，Limit 从 10 μA 改成 2 μA，会怎样？', 'A chip leaks 3.2 μA. The limit changes from 10 μA to 2 μA. What happens?'),
    options: [
      { id: 'same', text: loc('仍然 Pass，因为芯片没变', 'Still pass; the chip did not change') },
      { id: 'fail', text: loc('Fail。规格拧紧了，不是 DUT 突然坏了', 'Fail. The limit got tighter; the DUT did not suddenly break') },
      { id: 'burn', text: loc('芯片会被烧掉', 'The chip burns out') },
      { id: 'strobe', text: loc('必须先改 Strobe', 'The strobe must be changed first') },
    ],
    answer: 'fail',
    explain: loc('Force 和测到的电流都没变，变的是 Limit。测试判的是规格。', 'Force and the measured current are unchanged; only the limit moved. A test judges against the spec.'),
  },
  {
    id: 'q4',
    prompt: loc('Y[0] stuck-at-0 时，哪类向量会 Fail？', 'With Y[0] stuck-at-0, which vectors fail?'),
    options: [
      { id: 'all', text: loc('所有向量都 Fail', 'Every vector fails') },
      { id: 'bit', text: loc('期望 Y[0] = 1 的那些，因为它永远是 0', 'Those expecting Y[0] = 1, because it is always 0') },
      { id: 'clk', text: loc('只有 Period 太长才会 Fail', 'Only when the period is too long') },
      { id: 'idd', text: loc('只有 IDD 超了才会 Fail', 'Only when IDD is over the limit') },
    ],
    answer: 'bit',
    explain: loc('Stuck-at 只在向量把那一位驱成相反值、并能在输出看到时才被测到。', 'A stuck-at fault is detected only when a vector drives that bit to the opposite value and the difference reaches an output.'),
  },
]
