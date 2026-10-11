import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/** 三组 DC 参数：一张短表 */
export const GROUPS: Array<{ id: string; group: LText; items: string; ask: LText; how: LText }> = [
  {
    id: 'in',
    group: loc('输入', 'Input'),
    items: 'VIH · VIL',
    ask: loc('多高认成 1、多低认成 0', 'How high reads as 1, how low reads as 0'),
    how: loc('输入给在门限边沿，跑功能向量', 'Drive inputs at the threshold edge and run functional vectors'),
  },
  {
    id: 'out',
    group: loc('输出', 'Output'),
    items: 'VOH · VOL',
    ask: loc('带着规定电流时，输出电压够不够', 'Is the output voltage good enough at the specified current?'),
    how: loc('PMU Force 电流，Measure 电压', 'PMU forces current, measures voltage'),
  },
  {
    id: 'cur',
    group: loc('电流', 'Current'),
    items: 'IIH · IIL · IOZ · IDD',
    ask: loc('漏电和电源电流超没超', 'Are leakage and supply current within limits?'),
    how: loc('PMU Force 电压，Measure 电流', 'PMU forces voltage, measures current'),
  },
]

export type Mode = 'voh' | 'vol'
export type Drive = 'good' | 'weak'

/** 分段按钮的显示顺序 */
export const MODE_IDS: Mode[] = ['voh', 'vol']
export const DRIVE_IDS: Drive[] = ['good', 'weak']

/** 测试时的电源：VDD 最低值。VDD 越低管子越弱、R_on 越大，是 VOH / VOL 的最坏情况 */
export const VDD = 3.0
/** 电压刻度上限（3.3 V 芯片的标称电压） */
export const VMAX = 3.3

/** 每种测法的规格与输出管等效电阻（Ω），按 VDD = 3.0 V 时取值 */
export const MODES: Record<
  Mode,
  { limit: number; specMa: number; ron: Record<Drive, number> }
> = {
  voh: { limit: 2.4, specMa: 4, ron: { good: 100, weak: 200 } },
  vol: { limit: 0.4, specMa: 8, ron: { good: 40, weak: 70 } },
}

/** VOH = VDD − IOH × R_on；VOL = IOL × R_on */
export function outVolt(mode: Mode, ma: number, ron: number): number {
  const drop = (ma / 1000) * ron
  return mode === 'voh' ? Math.max(0, VDD - drop) : Math.min(VDD, drop)
}

export function isPass(mode: Mode, volt: number): boolean {
  return mode === 'voh' ? volt >= MODES.voh.limit : volt <= MODES.vol.limit
}

export const TAKEAWAY: LText[] = [
  loc(
    '输出规格是“带负载的电压”：VOH @ IOH、VOL @ IOL。不带电流测，坏的驱动也能过。原因：输出级导通的那个 MOS 管相当于一个导通电阻 R_on。不带负载时没有电流流过 R_on，上面没有压降，输出就是 VDD 或 0 V；哪怕 R_on 变大了（驱动变弱、管子有缺陷、工艺偏差），读数也一模一样。只有拉出 / 灌入规定的 IOH / IOL 电流，压降 I × R_on 才显现：VOH = VDD − |IOH| × R_on，VOL = IOL × R_on。按本课的图（VDD = 3.0 V）：VOL @ 8 mA，正常下拉 40 Ω → 0.32 V Pass，偏弱 70 Ω → 0.56 V Fail；VOH @ 4 mA，正常上拉 100 Ω → 2.60 V Pass，偏弱 200 Ω → 2.20 V Fail。可空载（0 mA）时两颗芯片都是 0 V / 3.00 V，分不出来。',
    'Output specs are voltages under load: VOH @ IOH and VOL @ IOL. Without the current, a weak driver still passes. Why: the MOS transistor that is on in the output stage acts like an on-resistance R_on. With no load, no current flows through R_on, so there is no drop across it and the output is simply VDD or 0 V — even if R_on has grown (weaker drive, a defective transistor, process variation), the reading is identical. Only when the specified IOH / IOL is pulled out or pushed in does the drop I × R_on appear: VOH = VDD − |IOH| × R_on, VOL = IOL × R_on. In this lesson’s figure (VDD = 3.0 V): VOL @ 8 mA, a normal 40 Ω pull-down gives 0.32 V (Pass) while a weak 70 Ω one gives 0.56 V (Fail); VOH @ 4 mA, a normal 100 Ω pull-up gives 2.60 V (Pass) while a weak 200 Ω one gives 2.20 V (Fail). Unloaded (0 mA), both parts read 0 V / 3.00 V and cannot be told apart.',
  ),
  loc(
    'IOH / IOL 对应客户板上这根脚真实要带的负载：后级芯片的输入（尤其 TTL 类输入要吃电流）、上拉 / 下拉电阻、传输线和端接电阻。测试时用 PMU 模拟这份负载，带不动的芯片装到板上就会电平不够、被后级认错。',
    'IOH / IOL stand for the real load this pin must carry on the customer’s board: the next chip’s inputs (TTL-style inputs in particular draw current), pull-up / pull-down resistors, transmission lines and termination. The PMU stands in for that load during test; a part that cannot carry it will give marginal levels on the board and be misread by the next stage.',
  ),
  loc(
    '输出管可以看成一个导通电阻 R_on。电流越大，VOH 掉得越多、VOL 抬得越高。VDD 越低管子越弱，所以 VOH / VOL 在 VDD 最低值下测。',
    'An output transistor acts like an on-resistance R_on. More current pulls VOH down further and pushes VOL up further. A lower VDD makes the transistor weaker, so VOH / VOL are tested at the minimum VDD.',
  ),
  loc(
    '先分清电流方向：测 VOH 时 DUT Source、PMU 吸电流；测 VOL 时 PMU 灌电流、DUT Sink。',
    'Know the current direction: for VOH the DUT sources and the PMU draws current; for VOL the PMU pushes current in and the DUT sinks it.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 Datasheet 写 VOH @ IOH，而不是只写 VOH？', 'Why does the datasheet say VOH @ IOH instead of just VOH?'),
    options: [
      { id: 'font', text: loc('排版习惯', 'Formatting habit') },
      { id: 'load', text: loc('输出电压必须在规定电流下仍达标', 'The output voltage must still meet the limit at the specified current') },
      { id: 'time', text: loc('IOH 是时间', 'IOH is a time') },
      { id: 'scan', text: loc('IOH 是扫描链长度', 'IOH is a scan chain length') },
    ],
    answer: 'load',
    explain: loc(
      '空载时 VOH 几乎等于 VDD。一拉电流，R_on 上有压降，才看得出驱动够不够。',
      'With no load VOH is almost VDD. Only under current does R_on drop voltage and reveal whether the drive is strong enough.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('测 VOH 时，电流往哪个方向流？', 'During a VOH test, which way does current flow?'),
    options: [
      { id: 'out', text: loc('从 DUT 流出，进 PMU（DUT Source）', 'Out of the DUT into the PMU (DUT sources)') },
      { id: 'in', text: loc('从 PMU 流进 DUT（DUT Sink）', 'From the PMU into the DUT (DUT sinks)') },
      { id: 'none', text: loc('没有电流', 'No current') },
      { id: 'clk', text: loc('只在时钟脚有电流', 'Only on the clock pin') },
    ],
    answer: 'out',
    explain: loc(
      '输出为高，上拉管把 VDD 接到管脚，电流从 DUT 流出。测 VOL 时方向相反。',
      'The output is high, so the pull-up connects VDD to the pin and current flows out of the DUT. VOL is the opposite direction.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('上拉 R_on = 100 Ω，VDD = 3.0 V，IOH = 4 mA。VOH 是多少？', 'Pull-up R_on = 100 Ω, VDD = 3.0 V, IOH = 4 mA. What is VOH?'),
    options: [
      { id: 'a', text: loc('3.00 V', '3.00 V') },
      { id: 'b', text: loc('2.60 V', '2.60 V') },
      { id: 'c', text: loc('0.40 V', '0.40 V') },
      { id: 'd', text: loc('2.40 V', '2.40 V') },
    ],
    answer: 'b',
    explain: loc('压降 4 mA × 100 Ω = 0.4 V，VOH = 3.0 − 0.4 = 2.6 V，不低于 2.4 V，Pass。3.00 V 是空载读数。', 'Drop = 4 mA × 100 Ω = 0.4 V, so VOH = 3.0 − 0.4 = 2.6 V, not below 2.4 V: Pass. 3.00 V would be the unloaded reading.'),
  },
  {
    id: 'q4',
    prompt: loc('一颗芯片 VOL 测出 0.56 V（极限 ≤ 0.4 V @ 8 mA），最可能是什么问题？', 'A part reads VOL = 0.56 V (limit ≤ 0.4 V @ 8 mA). What is the most likely problem?'),
    options: [
      { id: 'weak', text: loc('下拉管太弱，R_on 偏大', 'The pull-down is weak; R_on is too high') },
      { id: 'vih', text: loc('输入门限太高', 'Input threshold too high') },
      { id: 'speed', text: loc('时钟太快', 'Clock too fast') },
      { id: 'ok', text: loc('没问题，0.56 V 也算低电平', 'No problem; 0.56 V still counts as low') },
    ],
    answer: 'weak',
    explain: loc('VOL = IOL × R_on。0.56 V ÷ 8 mA = 70 Ω，比正常的 40 Ω 大，驱动不够。', 'VOL = IOL × R_on. 0.56 V ÷ 8 mA = 70 Ω, larger than the normal 40 Ω: not enough drive.'),
  },
  {
    id: 'q5',
    prompt: loc('VIH / VIL 和 VOH / VOL 怎么分？', 'How do VIH / VIL differ from VOH / VOL?'),
    options: [
      { id: 'ok', text: loc('VIH / VIL 是输入门限；VOH / VOL 是输出驱动', 'VIH / VIL are input thresholds; VOH / VOL are output drive') },
      { id: 'swap', text: loc('VIH 是输出，VOH 是输入', 'VIH is an output, VOH is an input') },
      { id: 'ac', text: loc('四个都是 AC 参数', 'All four are AC parameters') },
      { id: 'same', text: loc('四个是同一个意思', 'They all mean the same thing') },
    ],
    answer: 'ok',
    explain: loc('I 是 Input，O 是 Output。电流类（IIH、IIL、IDD）另成一组。', 'I is input, O is output. Currents (IIH, IIL, IDD) form a separate group.'),
  },
]
