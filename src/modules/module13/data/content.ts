import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type CaseId = 'all' | 'pin' | 'freq'

export const CASES: Array<{
  id: CaseId
  title: LText
  scene: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
  order: LText
}> = [
  {
    id: 'all',
    title: loc('案例 1 — 所有 DUT 都 Fail'),
    scene: loc('换了好几颗芯片，同一项全红。'),
    options: [
      { id: 'dut', text: loc('这批 DUT 全坏') },
      { id: 'common', text: loc('先查共同路径：电源、Pin Mapping、Load Board / Socket / Tester') },
      { id: 'xor', text: loc('XOR 真值表在芯片里反了') },
      { id: 'yield', text: loc('直接报废产线') },
    ],
    answer: 'common',
    explain: loc(
      '“全部 Fail”首先像共同的东西坏了，不像每颗芯片约好一起坏。先查 Power、Mapping、板和座，再怀疑 Level / Timing / Pattern。',
    ),
    order: loc('建议顺序：Power → Pin Mapping → Load Board / Socket → Tester → Level / Timing / Pattern → 最后才是 DUT。'),
  },
  {
    id: 'pin',
    title: loc('案例 2 — 只有某一个 Pin Fail'),
    scene: loc('别的脚都过，只有这一只管 Fail。'),
    options: [
      { id: 'all', text: loc('整台 Tester 坏了') },
      { id: 'path', text: loc('沿这一管的路径查：Channel → Load Board 走线 → Socket → DUT Pin') },
      { id: 'vdd', text: loc('一定是 VDD 规格写错') },
      { id: 'scan', text: loc('一定是扫描链断了') },
    ],
    answer: 'path',
    explain: loc('单 Pin 把问题收窄到一条物理路径。回扣 {@connection}：点亮这一条，其余变暗。'),
    order: loc('建议顺序：确认是哪一根脚 → 看 Channel / 映射 → 板走线 → Socket 触点 → 最后才是这颗 DUT 的这一管。'),
  },
  {
    id: 'freq',
    title: loc('案例 3 — 100 MHz 全 Fail，80 MHz 全 Pass'),
    scene: loc('同一套向量，只改频率。'),
    options: [
      { id: 'dead', text: loc('芯片逻辑功能全错') },
      { id: 'speed', text: loc('速度 / Timing / 信号完整性：来不及，不是真值表反了') },
      { id: 'open', text: loc('全部开路') },
      { id: 'bin', text: loc('Bin 号写反了') },
    ],
    answer: 'speed',
    explain: loc('80 MHz 能过，说明功能大体在。100 MHz 挂掉，先回 {@timing} / {@ac}：Strobe、tpd、SI、电压。'),
    order: loc('建议顺序：确认 Period / Strobe → 电压是否在规格边 → Load Board 高频路径 → 再问 DUT 的 fMAX。'),
  },
]

export const TAKEAWAY = loc(
  '先查共同路径，不要先骂芯片。全部 Fail、单 Pin、只在高频 Fail，三种缩小范围的方法不一样。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('所有 DUT 同一项都 Fail，为什么不先判“芯片全坏”？'),
    options: [
      { id: 'never', text: loc('芯片永远不会坏') },
      { id: 'share', text: loc('共同路径（电、板、座、映射、程序）更能一次解释全部失败') },
      { id: 'xor', text: loc('因为一定是 XOR') },
      { id: 'ok', text: loc('应该先报废') },
    ],
    answer: 'share',
    explain: loc('一颗坏有可能。连续多颗同一项红，先假设你的系统。'),
  },
  {
    id: 'q2',
    prompt: loc('只有一个 Pin Fail，优先沿哪条看？'),
    options: [
      { id: 'all', text: loc('整柜重新校准所有通道') },
      { id: 'one', text: loc('这一管：Channel → 板走线 → Socket → DUT Pin') },
      { id: 'scan', text: loc('先改扫描链压缩比') },
      { id: 'yield', text: loc('先改良率公式') },
    ],
    answer: 'one',
    explain: loc('这是 {@connection} 的路径在 Debug 里的用法。'),
  },
  {
    id: 'q3',
    prompt: loc('低频过、高频挂，更像什么？'),
    options: [
      { id: 'truth', text: loc('真值表写反') },
      { id: 'ac', text: loc('来不及：Timing / tpd / SI / 电压') },
      { id: 'name', text: loc('芯片名字印错') },
      { id: 'cont', text: loc('一定 Continuity 失败') },
    ],
    answer: 'ac',
    explain: loc('功能还在，窗口没了。回扣 AC 课那句：来不来得及。'),
  },
]
