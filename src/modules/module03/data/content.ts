import { loc, type LText } from '../../../i18n/locale'

export type LoopId = 'tester' | 'drive' | 'compare' | 'dut'
export type PeId = 'driver' | 'comparator' | 'timing' | 'level'

export const LOOP: Array<{ id: LoopId; title: string; text: LText }> = [
  {
    id: 'tester',
    title: 'Tester',
    text: loc(
      'ATE 主机。它不“修理”芯片，而是按程序自动：给信号、等一会儿、看回来的信号、再判定 Pass / Fail。',
      'The ATE mainframe. It does not repair the chip. It automatically drives, waits, looks at the return, and judges Pass / Fail.',
    ),
  },
  {
    id: 'drive',
    title: 'Drive',
    text: loc(
      'Tester 把规定的电平送到 DUT 输入。现在先记住：Drive 负责“给”。什么时候给，由 Timing 决定；给多高，由 Level 决定。',
      'The tester sends a defined level to a DUT input. Remember: Drive means “give”. When is Timing; how high is Level.',
    ),
  },
  {
    id: 'compare',
    title: 'Compare',
    text: loc(
      'Tester 在某个时刻看 DUT 输出是高还是低，再和期望值比。现在先记住：Compare 负责“看”。什么时候看，也由 Timing 决定。',
      'At a chosen instant the tester looks at a DUT output, high or low, and compares it to the expect. Compare means “look”. When is also Timing.',
    ),
  },
  {
    id: 'dut',
    title: 'DUT',
    text: loc(
      '被测器件。它被激励、被测量。信号不是从机柜直接扎进芯片，还要经过上一课的 Load Board 和 Socket（或 Probe Card）。',
      'The device under test. It is stimulated and measured. The signal does not stab the chip from the cabinet; it still goes through last lesson’s load board and socket (or probe card).',
    ),
  },
]

export const PE: Array<{ id: PeId; title: string; full: LText; text: LText }> = [
  {
    id: 'driver',
    title: 'Driver',
    full: loc('驱动器', 'Driver'),
    text: loc(
      'Digital Channel 里负责“给”的那一块。它按 Level 把电压送到 DUT 输入。没有 Driver，Tester 只能看，不能激励。',
      'The “give” block in a digital channel. It sends the Level voltage to a DUT input. Without a driver the tester can only look, not stimulate.',
    ),
  },
  {
    id: 'comparator',
    title: 'Comparator',
    full: loc('比较器', 'Comparator'),
    text: loc(
      'Digital Channel 里负责“看”的那一块。它把 DUT 输出和阈值比，得到逻辑 H / L。没有 Comparator，Tester 只是在盲打。',
      'The “look” block in a digital channel. It compares the DUT output to a threshold and yields H / L. Without it the tester is driving blind.',
    ),
  },
  {
    id: 'timing',
    title: 'Timing',
    full: loc('时序', 'Timing'),
    text: loc(
      '决定 Driver 何时给、Comparator 何时看。这一课只建立位置：每个 pin 都有 Timing。Period、Strobe、Setup / Hold 以后再讲。',
      'Decides when the driver gives and when the comparator looks. This lesson only places it: every pin has Timing. Period, Strobe, Setup / Hold come later.',
    ),
  },
  {
    id: 'level',
    title: 'Level',
    full: loc('电平', 'Level'),
    text: loc(
      '驱动幅度和比较门槛，比如以后会见到的 VIH / VIL / VOH / VOL。这一课只建立：0 和 1 在机器里首先是电压，不是抽象符号。',
      'Drive amplitude and compare thresholds, such as VIH / VIL / VOH / VOL later. For now: 0 and 1 are voltages on the machine, not abstract symbols.',
    ),
  },
]

export const TAKEAWAY = loc(
  'ATE 其实就是在非常精确地控制：什么时候给什么信号，以及什么时候检查返回什么信号。',
  'ATE is the precise control of when to apply which signal, and when to check what comes back.',
)

export const PMU_TEASER = loc(
  '每个 Channel 旁边通常还有 PMU（Parametric Measurement Unit），用来测电压和电流，而不是比 0/1。原理下一课再讲。现在只要知道：数字测试不只是 Pattern，旁边还有测参数的单元。',
  'Beside each channel there is usually a PMU (Parametric Measurement Unit) that measures voltage and current instead of comparing 0/1. Theory is next lesson. For now: digital test is not only patterns; a parametric unit sits beside them.',
)

export type QuizId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5'

export type QuizQuestion = {
  id: QuizId
  prompt: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('ATE 最核心的工作是什么？', 'What is the core job of an ATE?'),
    options: [
      { id: 'fix', text: loc('把坏芯片修好', 'Repair the failing chip') },
      {
        id: 'when',
        text: loc(
          '精确控制什么时候给什么信号、什么时候检查返回什么信号',
          'Precisely control when to apply which signal and when to check the return',
        ),
      },
      { id: 'power', text: loc('只要给 DUT 供电就够了', 'Powering the DUT is enough') },
      { id: 'scope', text: loc('当示波器，把波形显示给工程师看', 'Act as a scope and show waveforms') },
    ],
    answer: 'when',
    explain: loc(
      '测试不是修理。ATE 按程序自动激励、测量、判定。核心是：何时 Drive、Drive 成什么样、何时 Compare。',
      'Test is not repair. ATE stimulates, measures, and judges from a program. The core is: when to drive, to what level, and when to compare.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'Digital Channel 上，Drive 和 Compare 分别做什么？',
      'On a digital channel, what do Drive and Compare do?',
    ),
    options: [
      { id: 'swap', text: loc('Drive 看输出，Compare 给输入', 'Drive looks at outputs; Compare drives inputs') },
      {
        id: 'ok',
        text: loc(
          'Drive 给 DUT 输入，Compare 在某个时刻看输出',
          'Drive stimulates DUT inputs; Compare looks at outputs at a chosen time',
        ),
      },
      { id: 'current', text: loc('两者都只测电流', 'Both only measure current') },
      { id: 'inside', text: loc('两者都做在 DUT 里面', 'Both live inside the DUT') },
    ],
    answer: 'ok',
    explain: loc(
      '记住这张回环图：Tester → Drive → DUT → Compare → Tester。给和看是两件事。',
      'Remember the loop: Tester → Drive → DUT → Compare → Tester. Giving and looking are two jobs.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('Pin Electronics 里的 Level 指什么？', 'What does Level mean in Pin Electronics?'),
    options: [
      { id: 'file', text: loc('测试程序的文件名', 'The test-program file name') },
      { id: 'period', text: loc('这一拍有多长', 'How long one cycle is') },
      { id: 'volt', text: loc('驱动和比较用的电压幅度 / 门槛', 'Drive amplitude and compare thresholds') },
      { id: 'layer', text: loc('Load Board 有几层铜', 'How many copper layers the load board has') },
    ],
    answer: 'volt',
    explain: loc(
      'Level 是电压。Timing 才是“什么时候”。具体 VIH / VOH 数字留给 Datasheet 和 DC 课。',
      'Level is voltage. Timing is “when”. VIH / VOH numbers wait for the datasheet and DC lessons.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('这一课有没有把 PMU 讲完？', 'Did this lesson finish the PMU?'),
    options: [
      { id: 'done', text: loc('讲完了，已经会设仪器', 'Yes — you can set up the instrument now') },
      {
        id: 'next',
        text: loc(
          '没有。PMU 只是旁边那个测电压 / 电流的单元，下一课再讲',
          'No. The PMU is only the nearby V/I unit; next lesson covers it',
        ),
      },
      { id: 'drv', text: loc('PMU 就是 Driver', 'The PMU is the Driver') },
      { id: 'sock', text: loc('PMU 就是 Socket', 'The PMU is the Socket') },
    ],
    answer: 'next',
    explain: loc(
      'Pin Electronics 管 0/1 的给和看。PMU 管“这个 pin 的电压、电流合不合格”。不要混成一块。',
      'Pin Electronics gives and looks at 0/1. The PMU asks whether this pin’s voltage or current meets spec. Do not merge them.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('DUT 是不是直接插在 Tester 机柜上？', 'Does the DUT plug straight into the tester cabinet?'),
    options: [
      { id: 'yes', text: loc('是，插上就能测', 'Yes — plug it in and test') },
      {
        id: 'no',
        text: loc(
          '不是。Channel 还要经过 Load Board 和 Socket（或 Probe Card）',
          'No. The channel still goes through a load board and socket (or probe card)',
        ),
      },
      { id: 'cp', text: loc('只有 CP 才直接插在机柜上', 'Only CP plugs into the cabinet') },
      { id: 'ft', text: loc('只有 FT 才直接插在机柜上', 'Only FT plugs into the cabinet') },
    ],
    answer: 'no',
    explain: loc(
      '这是上一课的结论。ATE 内部的 Drive / Compare 仍然要走那条物理路径才能到 DUT 引脚。',
      'That was the last lesson. Drive and Compare inside the ATE still travel that physical path to reach a DUT pin.',
    ),
  },
]
