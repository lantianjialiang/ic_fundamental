import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '同事只收到你发的 .SchDoc 和 .PcbDoc，没有 .PrjPcb 和库。他打开后最可能遇到什么？',
      'A colleague receives only your .SchDoc and .PcbDoc, without the .PrjPcb or libraries. What will he most likely hit?',
    ),
    options: [
      { id: 'a', text: loc('一切正常，工程信息都存在两个文件里', 'Everything works; the project information is inside the two files') },
      { id: 'b', text: loc('文件打不开', 'The files cannot be opened') },
      { id: 'c', text: loc('文件作为 Free Documents 打开，编译和 Update PCB 用不了', 'The files open as Free Documents and compile and Update PCB do not work') },
    ],
    answer: 'c',
    explain: loc(
      '工程里有哪些文档、ERC 选项、输出路径都记在 .PrjPcb 里；没有它，文档不属于任何工程，所以编译和同步都做不了。',
      'The list of documents, ERC options and output paths live in the .PrjPcb. Without it the documents belong to no project, so compile and sync cannot run.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '判断：在 PCB 里直接删掉了电阻 R1，原理图没改。以后再 Update PCB，R1 会怎样？',
      'Judge: you deleted resistor R1 directly in the PCB and did not touch the schematic. What happens to R1 at the next Update PCB?',
    ),
    options: [
      { id: 'a', text: loc('永久消失，PCB 的改动优先', 'It stays gone; the PCB edit wins') },
      { id: 'b', text: loc('被重新添加回来，因为原理图里还有它', 'It is added back, because the schematic still has it') },
    ],
    answer: 'b',
    explain: loc(
      '原理图是连接关系的唯一来源，ECO 按它去补差异，PCB 里缺的器件就会再被添加。要删就回原理图删，再 Update。',
      'The schematic is the single source of connectivity and the ECO fills in whatever the PCB lacks, so the missing part is added again. Delete it in the schematic and then update.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '判断：DRC 报告 0 个违规，所以板厂一定能照这个文件做出来。',
      'Judge: DRC reports 0 violations, so the board fab can definitely build this file.',
    ),
    options: [
      { id: 'a', text: loc('对', 'True') },
      { id: 'b', text: loc('错', 'False') },
    ],
    answer: 'b',
    explain: loc(
      'DRC 只比对你自己设的规则。如果线距规则设成 0.1 mm 而板厂最小只有 0.15 mm，检查照样通过，工厂却做不出来，所以规则要先按板厂能力设。',
      'DRC only compares against the rules you set. If the clearance rule is 0.1 mm but the fab’s minimum is 0.15 mm, the check still passes while the fab cannot build it, so set the rules from the fab’s capability first.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '报价单上把数量从 5 片改成 50 片，哪一行基本不会变？',
      'On the quote you change quantity from 5 to 50 pieces. Which line stays essentially the same?',
    ),
    options: [
      { id: 'a', text: loc('工程费', 'Engineering fee') },
      { id: 'b', text: loc('电测费', 'E-test') },
      { id: 'c', text: loc('板费', 'Board cost') },
    ],
    answer: 'a',
    explain: loc(
      '工程费是工厂做一次 CAM 审核的一次性费用，和做几片无关；电测按片收费，板费按面积收费，都会随数量上涨。',
      'The engineering fee covers one CAM review and does not depend on how many boards are built; E-test is charged per board and board cost by area, so both rise with quantity.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '正在用 P, T 布线，想一边走线一边换到背面，该按哪个键？',
      'You are routing with P, T and want to move the trace to the bottom side. Which key do you press?',
    ),
    options: [
      { id: 'a', text: loc('Shift + S，切到单层模式', 'Shift + S, single-layer mode') },
      { id: 'b', text: loc('数字键盘的 *，切到下一个信号层并自动打过孔', '* on the numeric keypad: go to the next signal layer and drop a via automatically') },
      { id: 'c', text: loc('Q，切换单位', 'Q, toggle units') },
    ],
    answer: 'b',
    explain: loc(
      '* 的作用就是布线时换层并放过孔；Shift + S 只是把其他层调暗，Q 只切换 mm 和 mil，都不会改变走线所在的层。',
      '* exists to change layer while routing and place the via. Shift + S only dims the other layers and Q only toggles mm and mil; neither changes the layer the trace is on.',
    ),
  },
]
