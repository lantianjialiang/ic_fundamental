import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type ChainId = 'normal' | 'scan'

export const CHAINS: Array<{ id: ChainId; title: LText; text: LText; diagram: string }> = [
  {
    id: 'normal',
    title: loc('普通逻辑'),
    diagram: 'FF → Logic → FF → Logic → FF',
    text: loc('内部节点被组合逻辑挡住。外部 Pin 看不到中间 FF 的值，也无法任意设定。'),
  },
  {
    id: 'scan',
    title: loc('扫描链'),
    diagram: 'SI → FF → FF → FF → FF → SO',
    text: loc('测试模式把 FF 串成移位寄存器。状态可以移进、移出。'),
  },
]

export type StepId = 'shift1' | 'capture' | 'shift2' | 'compare'

export const STEPS: Array<{ id: StepId; title: string; text: LText }> = [
  { id: 'shift1', title: 'Shift', text: loc('从 SI 移入激励，把内部 FF 置成想要的状态。') },
  { id: 'capture', title: 'Capture', text: loc('回到功能时钟，让中间组合逻辑算一拍，结果打进下一组 FF。') },
  { id: 'shift2', title: 'Shift', text: loc('再进入扫描移位，把捕获到的状态从 SO 移出来。') },
  { id: 'compare', title: 'Compare', text: loc('移出的串和期望比。Fail 在链上的某一拍，而不是在一个外部数据脚。') },
]

export const TAKEAWAY = loc(
  '几十亿晶体管不可能靠外部 Pin 把内部状态都直接测出来。Scan 是数字测试里最干净的一个思想。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么需要 Scan？'),
    options: [
      { id: 'pretty', text: loc('让版图更好看') },
      { id: 'reach', text: loc('外部 Pin 够不到内部 FF 的状态') },
      { id: 'voh', text: loc('用来测 VOH') },
      { id: 'bin', text: loc('用来印 Bin 标签') },
    ],
    answer: 'reach',
    explain: loc('组合逻辑挡住了中间寄存器。串成链才能移进激励、移出响应。'),
  },
  {
    id: 'q2',
    prompt: loc('四步的顺序是？'),
    options: [
      { id: 'ok', text: loc('Shift → Capture → Shift → Compare') },
      { id: 'rev', text: loc('Compare → Capture → Shift') },
      { id: 'dc', text: loc('只 Force 电流') },
      { id: 'one', text: loc('只 Compare 一次就够，不用 Shift') },
    ],
    answer: 'ok',
    explain: loc('先把状态搬进去，捕获一拍功能，再搬出来比。'),
  },
  {
    id: 'q3',
    prompt: loc('Capture 在做什么？'),
    options: [
      { id: 'shift', text: loc('继续移位') },
      { id: 'func', text: loc('用功能时钟让组合逻辑算一拍') },
      { id: 'power', text: loc('关掉电源') },
      { id: 'bin', text: loc('写 Bin') },
    ],
    answer: 'func',
    explain: loc('没有 Capture，移进移出的只是同一个移位寄存器，测不到中间逻辑。'),
  },
  {
    id: 'q4',
    prompt: loc('这一课有没有讲压缩和 at-speed？'),
    options: [
      { id: 'yes', text: loc('已经讲完，可以上工具') },
      { id: 'no', text: loc('没有。只立思想，细节以后再补') },
      { id: 'mem', text: loc('压缩就是 Memory March') },
      { id: 'dc', text: loc('at-speed 就是 Continuity') },
    ],
    answer: 'no',
    explain: loc('点到为止。先能画那条链、说出四步。'),
  },
]
