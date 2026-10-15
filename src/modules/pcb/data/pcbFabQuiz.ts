import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { RULE, minDrill, minRing } from './pcbFabRules'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('外层 50 µm 铜，把线宽设计成比厂家最小线宽还细，最可能出什么问题？', 'On 50 µm outer copper, what most likely happens if you design a trace thinner than the fab’s minimum width?'),
    options: [
      { id: 'a', text: loc('线路被侧蚀掉大半甚至蚀断，成为开路', 'The trace is mostly or fully etched away from the sides, giving an open') },
      { id: 'b', text: loc('线路会变宽，造成短路', 'The trace gets wider and shorts') },
      { id: 'c', text: loc('没有影响，只是电阻略大', 'No effect except slightly more resistance') },
    ],
    answer: 'a',
    explain: loc('蚀刻是各向同性的，每边要侧蚀约 铜厚 ÷ 蚀刻因子；线本来就细，两边一咬就所剩无几。', 'Etching is isotropic and loses about copper thickness ÷ etch factor per side; a thin trace has little to lose, so it is gone after the sides are bitten.'),
  },
  {
    id: 'q2',
    prompt: loc(`板厚 ${RULE.boardMm} mm，厂家纵横比上限 ${RULE.arMax}:1，最小钻孔直径大约是多少？`, `With ${RULE.boardMm} mm board thickness and an aspect-ratio limit of ${RULE.arMax}:1, what is the approximate minimum drill diameter?`),
    options: [
      { id: 'a', text: loc(`${(minDrill / 2).toFixed(2)} mm`, `${(minDrill / 2).toFixed(2)} mm`) },
      { id: 'b', text: loc(`${minDrill.toFixed(2)} mm`, `${minDrill.toFixed(2)} mm`) },
      { id: 'c', text: loc(`${(minDrill * 2).toFixed(2)} mm`, `${(minDrill * 2).toFixed(2)} mm`) },
    ],
    answer: 'b',
    explain: loc(`最小孔径 = 板厚 ÷ 纵横比 = ${RULE.boardMm} ÷ ${RULE.arMax} = ${minDrill.toFixed(2)} mm。再细，钻头易断，镀铜药水也进不去。`, `Minimum drill = thickness ÷ aspect ratio = ${RULE.boardMm} ÷ ${RULE.arMax} = ${minDrill.toFixed(2)} mm. Finer than that the bit snaps and the plating bath cannot enter.`),
  },
  {
    id: 'q3',
    prompt: loc('孔环为什么不能做成 0？', 'Why can the annular ring not be zero?'),
    options: [
      { id: 'a', text: loc('钻头偏差和层间对位偏差叠加，孔会偏出焊盘，孔壁铜和焊盘断开', 'Drill error and layer registration error stack up, the hole drifts off the pad, and the wall copper loses contact with it') },
      { id: 'b', text: loc('孔环是给元件脚焊锡用的装饰', 'The ring is decoration for solder on the component lead') },
      { id: 'c', text: loc('钻头比焊盘大', 'The drill is bigger than the pad') },
    ],
    answer: 'a',
    explain: loc(`孔环 ≥ 钻孔偏差 + 对位偏差，示意值 ${RULE.drillPosTol} + ${RULE.layerRegTol} = ${minRing.toFixed(3)} mm。`, `Ring ≥ drill error + registration error; illustratively ${RULE.drillPosTol} + ${RULE.layerRegTol} = ${minRing.toFixed(3)} mm.`),
  },
  {
    id: 'q4',
    prompt: loc('字符油墨压在焊盘上，后果是什么？', 'What goes wrong when legend ink lies over a pad?'),
    options: [
      { id: 'a', text: loc('焊盘会导通得更好', 'The pad conducts better') },
      { id: 'b', text: loc('白油墨隔住焊锡，润湿不好，造成虚焊', 'The white ink blocks solder wetting and gives a poor joint') },
      { id: 'c', text: loc('没有后果，字符只是图案', 'Nothing, the legend is just graphics') },
    ],
    answer: 'b',
    explain: loc('油墨是绝缘的，也不沾锡。字符离焊盘要留余量，因为丝印对位有约 ±0.15 mm 的偏差。', 'The ink is an insulator and does not take solder. Keep legend away from pads because print registration is about ±0.15 mm.'),
  },
  {
    id: 'q5',
    prompt: loc('内层 AOI 为什么要在层压之前做？', 'Why is inner-layer AOI done before lamination?'),
    options: [
      { id: 'a', text: loc('层压后内层被树脂封在里面，看不见也修不了', 'After lamination the inner layer is sealed in resin, so it cannot be seen or repaired') },
      { id: 'b', text: loc('层压前设备比较便宜', 'The equipment is cheaper before lamination') },
      { id: 'c', text: loc('AOI 只能检查芯板', 'AOI can only inspect cores') },
    ],
    answer: 'a',
    explain: loc('一旦压成多层板，内层的开路、短路只能靠最后的电测发现，整块板都要报废。', 'Once pressed, an inner open or short can only be found by the final electrical test, and the whole board is scrapped.'),
  },
]
