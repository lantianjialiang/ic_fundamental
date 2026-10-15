import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('同样的电流和温升，内层走线为什么要比外层更宽？', 'For the same current and temperature rise, why must an inner trace be wider than an outer one?'),
    options: [
      { id: 'a', text: loc('内层被树脂包住，散热差，IPC-2221 的 k 只有外层的一半', 'An inner trace is wrapped in resin and sheds heat poorly; the IPC-2221 k is half the external value') },
      { id: 'b', text: loc('内层的铜比外层薄', 'Inner copper is thinner than outer copper') },
      { id: 'c', text: loc('内层电阻率更高', 'Inner copper has a higher resistivity') },
    ],
    answer: 'a',
    explain: loc(
      '铜本身一样，差别在散热：k 外层 0.048、内层 0.024，按 A = (I / (k·ΔT^0.44))^(1/0.725) 算，内层所需面积约是外层的 2.6 倍（2^1.38）。IPC-2152 对靠近平面的内层给出更宽松的结果。',
      'The copper is the same; the difference is heat removal: k is 0.048 external and 0.024 internal, and in A = (I / (k·ΔT^0.44))^(1/0.725) the inner trace needs about 2.6 times the area (2^1.38). IPC-2152 is more lenient for inner traces near a plane.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('在两个高压导体之间开一条足够宽的槽，增加的是哪个量？', 'A wide-enough slot is cut between two high-voltage conductors. Which quantity does it increase?'),
    options: [
      { id: 'a', text: loc('爬电距离，因为沿表面的路径要绕过槽', 'Creepage, because the surface path must go around the slot') },
      { id: 'b', text: loc('电气间隙，因为导体之间空气变多了', 'Clearance, because there is more air between the conductors') },
      { id: 'c', text: loc('两者都增加一倍', 'Both, doubled') },
    ],
    answer: 'a',
    explain: loc(
      '电气间隙是空气里的最短直线，开槽不改变它；爬电距离沿材料表面量，槽迫使路径绕行。槽太窄（污染等级 2 时小于约 1 mm）会被灰尘填满，等于没开。',
      'Clearance is the straight line through air and a slot does not change it; creepage follows the material surface and the slot forces a detour. A slot that is too narrow (under about 1 mm at pollution degree 2) is filled by dust and gains nothing.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('接地大铜皮里的通孔插件脚，为什么常用热焊盘而不是全连接？', 'Why is a through-hole pin in a big ground pour usually given a thermal relief rather than a solid connection?'),
    options: [
      { id: 'a', text: loc('全连接时铜皮把焊接热量带走，焊盘升不到熔点，容易冷焊', 'A solid connection lets the pour carry the soldering heat away, the pad never melts the solder, and cold joints result') },
      { id: 'b', text: loc('热焊盘的导电性比全连接好', 'A thermal relief conducts better than a solid connection') },
      { id: 'c', text: loc('热焊盘可以省铜', 'A thermal relief saves copper') },
    ],
    answer: 'a',
    explain: loc(
      '辐条细，导热慢，焊盘能升温；代价是载流和散热能力下降，所以电源大电流脚要加宽辐条或多打过孔。',
      'Thin spokes conduct heat slowly, so the pad can warm up; the price is lower current and heat capacity, so on high-current supply pins widen the spokes or add vias.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('微带线其他条件不变，把介质厚度 h 加厚，Z0 会怎样？', 'With everything else unchanged, what happens to microstrip Z0 when the dielectric height h is increased?'),
    options: [
      { id: 'a', text: loc('变大，线离参考平面更远，对地电容变小', 'It rises: the trace is farther from the plane, so capacitance to ground falls') },
      { id: 'b', text: loc('变小，因为介质多了', 'It falls, because there is more dielectric') },
      { id: 'c', text: loc('不变', 'It stays the same') },
    ],
    answer: 'a',
    explain: loc(
      '公式里 h 在对数项的分子上，h 变大 Z0 变大；线宽、Er 变大则相反。IPC-2141 只在 0.1 < w/h < 2 内适用，是近似。',
      'In the formula h sits in the numerator of the logarithm, so a larger h gives a higher Z0; larger width or Er does the opposite. IPC-2141 is an approximation valid for 0.1 < w/h < 2.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('一个 0.3 × 0.7 mm 的焊盘，钢网厚 0.12 mm、1:1 开口，锡膏体积约是多少？', 'A 0.3 × 0.7 mm pad with a 0.12 mm stencil and a 1:1 aperture gets roughly how much paste?'),
    options: [
      { id: 'a', text: loc('约 0.025 mm³', 'About 0.025 mm³') },
      { id: 'b', text: loc('约 0.25 mm³', 'About 0.25 mm³') },
      { id: 'c', text: loc('约 0.0025 mm³', 'About 0.0025 mm³') },
    ],
    answer: 'a',
    explain: loc(
      '体积 = 开口面积 × 钢网厚度 = 0.3 × 0.7 × 0.12 = 0.0252 mm³。回流后焊料约是它的一半。面积比 = 0.21 / (2 × 1.0 × 0.12) ≈ 0.88，高于 0.66，脱模没问题。',
      'Volume = aperture area × stencil thickness = 0.3 × 0.7 × 0.12 = 0.0252 mm³; about half of it remains as solder after reflow. The area ratio is 0.21 / (2 × 1.0 × 0.12) ≈ 0.88, above 0.66, so it releases fine.',
    ),
  },
]
