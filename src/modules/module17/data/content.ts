import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Period=10、Drive=2、Delay=4、Strobe=3，为什么 Fail？'),
    options: [
      { id: 'xor', text: loc('XOR 真值表反了') },
      { id: 'early', text: loc('Strobe 在 DUT 输出稳定之前，Compare 采到旧值') },
      { id: 'vdd', text: loc('一定是电源没接') },
      { id: 'ok', text: loc('其实应该 Pass') },
    ],
    answer: 'early',
    explain: loc('输出要到 Drive+Delay=6 ns 才变。3 ns 去采，窗口还没到。'),
  },
  {
    id: 'q2',
    prompt: loc('Leakage 测试的句子是哪一句？'),
    options: [
      { id: 'pat', text: loc('先跑 Pattern，再看 Bin') },
      { id: 'ok', text: loc('Force 电压 → Measure 电流 → 和 Limit 比较 → Pass / Fail') },
      { id: 'eye', text: loc('看眼图够不够开') },
      { id: 'scan', text: loc('先 Shift 再 Capture') },
    ],
    answer: 'ok',
    explain: loc('PMU 不问 0/1。拧紧 Limit，测到的电流没变，也会从 Pass 变成 Fail。'),
  },
  {
    id: 'q3',
    prompt: loc('同一颗漏电 3.2 μA 的芯片，Limit 从 10 μA 改成 2 μA，会怎样？'),
    options: [
      { id: 'same', text: loc('仍然 Pass，因为芯片没变') },
      { id: 'fail', text: loc('Fail。规格拧紧了，不是 DUT 突然坏了') },
      { id: 'burn', text: loc('芯片会被限流烧掉') },
      { id: 'strobe', text: loc('必须先改 Strobe') },
    ],
    answer: 'fail',
    explain: loc('Force / Measure 没变，变的是 Limit。测试是在判规格，不是在“看芯片心情”。'),
  },
  {
    id: 'q4',
    prompt: loc('Y[0] stuck-at-0 时，哪类向量会 Fail？'),
    options: [
      { id: 'all', text: loc('所有向量都 Fail') },
      { id: 'bit', text: loc('期望最低位为 1 的那些，因为坏了永远是 0') },
      { id: 'clk', text: loc('只有 Period 太长才会 Fail') },
      { id: 'idd', text: loc('只有 IDD 超了才会 Fail') },
    ],
    answer: 'bit',
    explain: loc('Stuck-at 不是整颗芯片全坏。只有激活到那一位、并能观察到差异的向量才会红。'),
  },
]
