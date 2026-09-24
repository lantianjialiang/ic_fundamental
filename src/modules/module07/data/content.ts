import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type VecId = '00' | '01' | '10' | '11'

export type Vector = {
  id: VecId
  a: 0 | 1
  b: 0 | 1
  y: 0 | 1
}

export const VECTORS: Vector[] = [
  { id: '00', a: 0, b: 0, y: 0 },
  { id: '01', a: 0, b: 1, y: 1 },
  { id: '10', a: 1, b: 0, y: 1 },
  { id: '11', a: 1, b: 1, y: 0 },
]

export const PATTERN = loc(
  '量产 Tester 在高速重复“驱动 → 等待 → 比较”成千上万次。Pattern 就是这些向量的序列。每一拍有一个时刻在比——那个时刻叫 Strobe，下一课再拖。',
)

export const TAKEAWAY = loc(
  'Functional Test 按真值表（或等价行为）给输入、比输出。改错一个期望，Fail 会指到那一条 vector。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Functional Test 在做什么？'),
    options: [
      { id: 'v', text: loc('只量电压，不管功能') },
      { id: 'ok', text: loc('按真值表给输入，比较输出') },
      { id: 'fix', text: loc('把错的输出改正确') },
      { id: 'bin', text: loc('只分配 Bin 号') },
    ],
    answer: 'ok',
    explain: loc('XOR 四行就是最小例子。向量错一行，Compare 就会在那一行 Fail。'),
  },
  {
    id: 'q2',
    prompt: loc('一条 Test Vector 至少包含什么？'),
    options: [
      { id: 'in', text: loc('只有输入') },
      { id: 'both', text: loc('驱动的输入，加上期望的输出') },
      { id: 'vdd', text: loc('只有电源电压') },
      { id: 'photo', text: loc('芯片照片') },
    ],
    answer: 'both',
    explain: loc('没有期望值，Compare 不知道跟谁比。A B → Expected Y。'),
  },
  {
    id: 'q3',
    prompt: loc('Pattern 是什么？'),
    options: [
      { id: 'one', text: loc('只测一次 Continuity') },
      { id: 'seq', text: loc('向量的序列，在 Tester 上高速重复 Drive / 等待 / Compare') },
      { id: 'pcb', text: loc('Load Board 层叠图') },
      { id: 'op', text: loc('ALU 的操作码表') },
    ],
    answer: 'seq',
    explain: loc('四行 XOR 放大成千上万倍，就是量产 Functional Pattern。Timing 还没展开。'),
  },
  {
    id: 'q4',
    prompt: loc('期望值被改错时，应该看到什么？'),
    options: [
      { id: 'all', text: loc('所有芯片的所有项都 Fail') },
      { id: 'one', text: loc('错的那一条 vector Fail，并指出是哪一行') },
      { id: 'pass', text: loc('仍然全 Pass') },
      { id: 'latch', text: loc('一定是 Latch-up') },
    ],
    answer: 'one',
    explain: loc('这就是 Debug 的入口：先定位哪一拍、哪一根脚，再问为什么。'),
  },
  {
    id: 'q5',
    prompt: loc('XOR 的真值表里，A=1、B=1 时 Y 是什么？为什么不是 1？'),
    options: [
      { id: 'one', text: loc('1，因为两个输入都是高') },
      { id: 'zero', text: loc('0，相同就不为 1；那是 OR 才会出 1') },
      { id: 'x', text: loc('不确定，要看 Strobe') },
      { id: 'skip', text: loc('这一行不用测') },
    ],
    answer: 'zero',
    explain: loc('XOR 是“不同才为 1”。1 和 1 相同，所以 Y=0。OR 才会 1∨1=1。'),
  },
]
