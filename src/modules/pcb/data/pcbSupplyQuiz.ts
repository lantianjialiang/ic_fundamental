import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('贴片机要知道每个元件放在板上哪个位置、转多少度，靠哪份文件？', 'Which file tells the placer where each part goes on the board and how far to rotate it?'),
    options: [
      { id: 'a', text: loc('坐标文件（Centroid / CPL）', 'The centroid file (Centroid / CPL)') },
      { id: 'b', text: loc('Gerber 的铜层', 'The Gerber copper layer') },
      { id: 'c', text: loc('钻孔文件', 'The drill file') },
    ],
    answer: 'a',
    explain: loc(
      '坐标文件每行是一个元件的位号、X、Y、角度和顶底面；Gerber 只画图形，钻孔文件只说孔，二者都不知道要贴什么元件。',
      'Each row of the centroid file gives a part’s designator, X, Y, angle and side; Gerber only draws shapes and the drill file only describes holes, so neither knows which part goes where.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('新设计里有一颗芯片的状态是 NRND，正确的做法是？', 'A chip in a new design is marked NRND. What is the right move?'),
    options: [
      { id: 'a', text: loc('照用，反正现在还能买到', 'Use it anyway; it can still be bought today') },
      { id: 'b', text: loc('换成 Active 的型号，或至少同时规划替代料', 'Swap to an Active part, or at least plan an alternate at the same time') },
      { id: 'c', text: loc('从独立现货商大量囤货', 'Stock up heavily from a broker') },
    ],
    answer: 'b',
    explain: loc(
      'NRND 表示原厂不建议新设计使用、以后可能停产；板子会生产好几年，所以新设计应选 Active，不然几年后就买不到了。',
      'NRND means the maker advises against new designs and may discontinue it; a board is built for years, so a new design should use an Active part or it may be unbuyable later.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('一块用 SAC305 的板子，回流峰值只有 228 °C。这条曲线怎么判断？', 'A board with SAC305 reflows at only 228 °C peak. How do you judge this profile?'),
    options: [
      { id: 'a', text: loc('偏冷：熔点以上时间太短，会冷焊、虚焊', 'Too cool: time above melting is too short, giving cold or dry joints') },
      { id: 'b', text: loc('刚好：已经高过 217 °C 就够了', 'Fine: being above 217 °C is enough') },
      { id: 'c', text: loc('偏热：元件会被烤坏', 'Too hot: parts will be damaged') },
    ],
    answer: 'a',
    explain: loc(
      '228 °C 虽然高过 217 °C，但只高 11 °C，熔点以上的时间远不到 45 s，焊料润湿不充分；目标峰值是 240–250 °C。',
      '228 °C is above 217 °C, but only by 11 °C, so the time above melting is far below 45 s and the solder wets poorly; the target peak is 240–250 °C.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('一块板子外形是圆角、还有一块凸出的耳朵，拼板时更适合用哪种分板方式？', 'A board has rounded corners and a protruding ear. Which depaneling method suits the panel better?'),
    options: [
      { id: 'a', text: loc('V-Cut', 'V-score') },
      { id: 'b', text: loc('邮票孔', 'Mouse bites') },
      { id: 'c', text: loc('两种都不行，必须单片生产', 'Neither; it must be made as single pieces') },
    ],
    answer: 'b',
    explain: loc(
      'V-Cut 只能走贯穿整张拼板的直线，圆角和凸出会被切到；邮票孔是在板间留桥连接，能适应不规则外形。',
      'V-score is a straight line across the whole panel and would cut into rounded or protruding outlines; mouse bites join boards with small bridges and cope with irregular shapes.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('一块板通过了 ICT，但上电后不能启动。下一步最该做的测试是？', 'A board passed ICT but will not boot when powered. Which test finds the cause next?'),
    options: [
      { id: 'a', text: loc('再做一次 AOI', 'Run AOI again') },
      { id: 'b', text: loc('FCT：上电并运行固件，看功能', 'FCT: power it, run firmware and check the function') },
      { id: 'c', text: loc('再看一遍钢网', 'Look at the stencil again') },
    ],
    answer: 'b',
    explain: loc(
      'ICT 只查元件值、开路和短路，说明「焊对了」；固件、时钟、电源时序这类功能问题只有 FCT 上电运行才暴露。',
      'ICT checks values, opens and shorts, which shows it was soldered correctly; functional faults such as firmware, clock or power sequencing only appear when FCT powers it and runs it.',
    ),
  },
]
