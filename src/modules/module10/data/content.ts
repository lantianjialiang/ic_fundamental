import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const POW2 = [
  { bits: 2, count: '4', note: loc('XOR 可以当场穷举。') },
  { bits: 8, count: '256', note: loc('一个字节的输入组合。') },
  { bits: 16, count: '65 536', note: loc('已经不适合人手写。') },
  { bits: 32, count: '4 294 967 296', note: loc('按 1 µs 一条，大约 72 分钟只跑完组合一次；顺序逻辑再乘状态，覆盖率仍没有保证。') },
]

export type ConceptId = 'func' | 'algo' | 'fault' | 'stuck' | 'tran' | 'atpg' | 'scan'

export const CONCEPTS: Array<{ id: ConceptId; title: string; text: LText }> = [
  {
    id: 'func',
    title: 'Functional Pattern',
    text: loc('按功能 / 真值表写的向量。上一课的 XOR 四行就是。'),
  },
  {
    id: 'algo',
    title: 'Algorithmic Pattern',
    text: loc('现场算出来，不预先存全部。Memory March 是典型，本阶段只记名字。'),
  },
  {
    id: 'fault',
    title: 'Fault Model',
    text: loc('我们假设电路会怎样坏。没有模型，就不知道“测完了”是什么意思。'),
  },
  {
    id: 'stuck',
    title: 'Stuck-at Fault',
    text: loc('某节点粘在 0 或 1。最常用的结构故障模型。'),
  },
  {
    id: 'tran',
    title: 'Transition Fault',
    text: loc('该跳变时跳不动。比 stuck-at 更靠近速度问题。'),
  },
  {
    id: 'atpg',
    title: 'ATPG',
    text: loc('按故障模型自动出向量。人不手写 2³²。'),
  },
  {
    id: 'scan',
    title: 'Scan',
    text: loc('把内部触发器串起来才能测到。下一课拆开。'),
  },
]

export const TAKEAWAY = loc(
  '32 个输入也不能靠穷举交货：时间耗尽，覆盖率仍对故障模型没有保证。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 32 个输入的组合逻辑也不能靠穷举交货？'),
    options: [
      { id: 'lazy', text: loc('只是工程师嫌麻烦') },
      { id: 'time', text: loc('向量数量把测试时间撑爆，而且穷举也不等于故障覆盖率') },
      { id: 'ate', text: loc('ATE 插不上 32 根脚') },
      { id: 'xor', text: loc('XOR 超过两输入就不存在') },
    ],
    answer: 'time',
    explain: loc('2³² ≈ 43 亿条。时间是硬约束；即便跑完，stuck-at / transition 仍可能没被激活。'),
  },
  {
    id: 'q2',
    prompt: loc('ATPG 是做什么的？'),
    options: [
      { id: 'fix', text: loc('修好失效芯片') },
      { id: 'gen', text: loc('按故障模型自动生成向量') },
      { id: 'bin', text: loc('打印 Bin 标签') },
      { id: '3d', text: loc('画 Load Board') },
    ],
    answer: 'gen',
    explain: loc('人写 Functional Pattern，机器按 stuck-at 等模型补结构向量。'),
  },
  {
    id: 'q3',
    prompt: loc('Stuck-at Fault 假设什么？'),
    options: [
      { id: 'fast', text: loc('芯片只会太慢') },
      { id: 'stick', text: loc('某个节点粘在 0 或 1') },
      { id: 'open', text: loc('一定是 Socket 开路') },
      { id: 'vdd', text: loc('电源永远是 3.3 V') },
    ],
    answer: 'stick',
    explain: loc('这是模型，不是现实里唯一的坏法。但没有模型就无法谈覆盖率。'),
  },
  {
    id: 'q4',
    prompt: loc('Scan 在这一课讲到哪？'),
    options: [
      { id: 'tool', text: loc('已经会用 DFT 工具') },
      { id: 'name', text: loc('只知道：要把内部 FF 串起来才能测到，下一课拆开') },
      { id: 'mem', text: loc('Scan 就是 Memory March') },
      { id: 'dc', text: loc('Scan 就是测 VOH') },
    ],
    answer: 'name',
    explain: loc('名字先就位。四步 Shift / Capture 留给下一课。'),
  },
]
