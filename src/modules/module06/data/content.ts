import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type GroupId = 'in' | 'out' | 'cur'

export const GROUPS: Array<{
  id: GroupId
  title: LText
  items: string
  text: LText
}> = [
  {
    id: 'in',
    title: loc('输入'),
    items: 'VIH · VIL',
    text: loc('问 DUT 把多高认成 1、多低认成 0。ATE 把输入赶到规格边沿，再看功能是否仍对。'),
  },
  {
    id: 'out',
    title: loc('输出'),
    items: 'VOH · VOL',
    text: loc('问 DUT 吐出来的电压。必须带着规定电流看：VOH @ IOH、VOL @ IOL。'),
  },
  {
    id: 'cur',
    title: loc('电流'),
    items: 'IIH · IIL · IOH · IOL · Leakage',
    text: loc('输入漏电、输出驱动电流、不该导通时的漏电。Continuity 也是电流/电压，不是 Pattern。'),
  },
]

export type IoId = 'source' | 'sink'

export const IO: Array<{ id: IoId; title: LText; dir: string; text: LText }> = [
  {
    id: 'source',
    title: loc('Source'),
    dir: 'Tester → DUT',
    text: loc('电流从 Tester 流向 DUT。测 IIL、某些 Leakage 时常见。箭头向外给。'),
  },
  {
    id: 'sink',
    title: loc('Sink'),
    dir: 'Tester ← DUT',
    text: loc('电流从 DUT 流进 Tester。测 VOH @ IOH 时，Tester 在“拉”这段电流，电压还得够高。'),
  },
]

export const VOH_LIMIT = 2.4
export const VDD = 3.3

export function vohAt(iohMa: number): number {
  return Math.max(0, VDD - iohMa * 0.12)
}

export const CONT = loc(
  '开路：灌一小电流，电压被顶高。短路：同样电流，电压掉到接近 0。DC 流程通常先做这一项，确认 Pin 接到了再测 VIH / VOH。',
)

export const TAKEAWAY = loc(
  'VOH @ IOH 不是孤立数字。输出高电平要在规定灌/拉电流下仍满足电压。电流方向先分清 Source / Sink。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('DC Test 的第一项通常是什么？'),
    options: [
      { id: 'scan', text: loc('先跑 Scan') },
      { id: 'cont', text: loc('Continuity（开短路），确认 Pin 接到了') },
      { id: 'fmax', text: loc('先测 fMAX') },
      { id: 'bin', text: loc('先写 Bin 号') },
    ],
    answer: 'cont',
    explain: loc('没接上就测 VIH，失败原因是接触，不是门槛。PMU 灌电流看电压。'),
  },
  {
    id: 'q2',
    prompt: loc('Sink current 的方向是？'),
    options: [
      { id: 'out', text: loc('Tester → DUT') },
      { id: 'in', text: loc('Tester ← DUT') },
      { id: 'none', text: loc('没有电流') },
      { id: 'clk', text: loc('只存在于时钟脚') },
    ],
    answer: 'in',
    explain: loc('Sink 是 Tester 把 DUT 吐出的电流“接住”。VOH @ IOH 就是在拉电流。'),
  },
  {
    id: 'q3',
    prompt: loc('为什么 Datasheet 写 VOH @ IOH，而不是只写 VOH？'),
    options: [
      { id: 'font', text: loc('只是排版习惯') },
      { id: 'load', text: loc('输出电压必须在规定电流负载下仍达标') },
      { id: 'time', text: loc('IOH 是时间') },
      { id: 'scan', text: loc('IOH 是扫描链长度') },
    ],
    answer: 'load',
    explain: loc('空载时电压看起来很高。一拉电流，VOH 掉下去，才知道驱动够不够。'),
  },
  {
    id: 'q4',
    prompt: loc('VIH / VIL 和 VOH / VOL 这一课怎么分组？'),
    options: [
      { id: 'ok', text: loc('VIH/VIL 输入门槛；VOH/VOL 输出驱动') },
      { id: 'swap', text: loc('VIH 是输出，VOH 是输入') },
      { id: 'ac', text: loc('四者都是频率') },
      { id: 'same', text: loc('四个符号同一个意思') },
    ],
    answer: 'ok',
    explain: loc('I 是 Input，O 是 Output。电流另属一组。'),
  },
]
