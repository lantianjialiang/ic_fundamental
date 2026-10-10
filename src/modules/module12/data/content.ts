import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type FlowId = 'power' | 'dc' | 'func' | 'ac' | 'mem' | 'scan' | 'bin'

export const FLOW: Array<{ id: FlowId; title: string; text: LText }> = [
  { id: 'power', title: 'Power Up', text: loc('先供电、查电流。没有稳妥的 VDD，后面全不可信。') },
  { id: 'dc', title: 'DC Test', text: loc('开短路、VIH/VOH、漏电。链回 {@dc}。') },
  { id: 'func', title: 'Functional Test', text: loc('按向量 Drive / Compare。链回 {@func}。') },
  { id: 'ac', title: 'AC Test', text: loc('Setup / Hold / tpd / fMAX。链回 {@timing} / {@ac}。') },
  { id: 'mem', title: 'Memory Test', text: loc('流程里占一个位置。March 算法本阶段不展开。') },
  { id: 'scan', title: 'Scan Test', text: loc('结构向量走扫描链。链回 {@scan}。') },
  { id: 'bin', title: 'Bin', text: loc('按失败项分箱。这是给后道和良率看的结果，不是再测一遍。') },
]

export type PieceId = 'flow' | 'item' | 'cond' | 'pattern' | 'timing' | 'level' | 'exec' | 'cmp' | 'result'

export const PIECES: Array<{ id: PieceId; title: string; text: LText }> = [
  { id: 'flow', title: 'Test Flow', text: loc('主顺序：先做什么、失败去哪。') },
  { id: 'item', title: 'Test Item', text: loc('Flow 里的一条，比如 “VIH on pin A”。') },
  { id: 'cond', title: 'Test Condition', text: loc('电压、温度、电流负载。DC 课的 VOH@IOH 就是条件。') },
  { id: 'pattern', title: 'Pattern', text: loc('向量序列。Functional / Scan 的主体。') },
  { id: 'timing', title: 'Timing', text: loc('Period、Drive、Strobe。链回 {@timing}。') },
  { id: 'level', title: 'Level', text: loc('VIH/VIL/VOH/VOL。链回 {@ate} / {@dc}。') },
  { id: 'exec', title: 'Execute', text: loc('Tester 真正跑起来。') },
  { id: 'cmp', title: 'Compare', text: loc('和期望或规格比。') },
  { id: 'result', title: 'Result', text: loc('Pass / Fail，再回到 Flow 决定下一跳或 Bin。') },
]

export const TAKEAWAY = loc(
  'Test Program = 把测试意图翻译成 Tester 能执行的程序：Flow → Item → Condition / Pattern / Timing / Level → Execute → Compare → Result。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Test Program 首先是什么？'),
    options: [
      { id: 'api', text: loc('某一家 Tester 的函数名') },
      { id: 'intent', text: loc('把测试意图译成机器可执行的流程') },
      { id: 'pcb', text: loc('Load Board 图纸') },
      { id: 'photo', text: loc('芯片照片') },
    ],
    answer: 'intent',
    explain: loc('API 各家不同。结构相同：Flow、Item、条件、向量、时序、电平、执行、比较。'),
  },
  {
    id: 'q2',
    prompt: loc('一条 Test Item 往下拆，通常落到什么？'),
    options: [
      { id: 'ok', text: loc('Condition、Pattern、Timing、Level，再 Execute / Compare') },
      { id: 'bin', text: loc('只有 Bin 号') },
      { id: '3d', text: loc('只有 3D 爆炸图') },
      { id: 'op', text: loc('只有 ALU 的 OP 表') },
    ],
    answer: 'ok',
    explain: loc('四块分别链回 DC、Functional、Timing、Pin Electronics。'),
  },
  {
    id: 'q3',
    prompt: loc('为什么 Power Up 通常在最前？'),
    options: [
      { id: 'habit', text: loc('只是习惯') },
      { id: 'base', text: loc('电源不稳，后面的 0/1 和电流都不可信') },
      { id: 'scan', text: loc('电源就是扫描链') },
      { id: 'last', text: loc('其实应该最后才供电') },
    ],
    answer: 'base',
    explain: loc('先确认 VDD / 电流，再开 DC 和 Functional。'),
  },
  {
    id: 'q4',
    prompt: loc('这一课要不要写某家 Tester 指令？'),
    options: [
      { id: 'yes', text: loc('要，否则不算程序') },
      { id: 'no', text: loc('不要。能复述结构就算入门') },
      { id: 'c', text: loc('必须用 C++') },
      { id: 'py', text: loc('必须用 Python') },
    ],
    answer: 'no',
    explain: loc('厂商指令放在入职以后。现在要的是意图和结构。'),
  },
]
