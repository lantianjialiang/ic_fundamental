import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一块板上有 0.4 mm 间距的 BGA，表面处理选哪个更合适？', 'A board carries a 0.4 mm-pitch BGA. Which surface finish suits it best?'),
    options: [
      { id: 'a', text: loc('无铅 HASL，焊料多，焊接最好', 'Lead-free HASL: lots of solder, best wetting') },
      { id: 'b', text: loc('ENIG，焊盘平整', 'ENIG: flat pads') },
      { id: 'c', text: loc('什么都不做，直接裸铜', 'Nothing: bare copper') },
    ],
    answer: 'b',
    explain: loc(
      'HASL 的焊料表面是圆顶，高低不一，0.4 mm 间距的 BGA 焊盘会放不平、还会桥连；ENIG 的镍金层很薄、表面平整，所以细间距 BGA 选它。裸铜放一会儿就氧化，更焊不上。',
      'HASL leaves a domed, uneven solder surface, so 0.4 mm BGA pads sit unevenly and can bridge; the nickel-gold layer of ENIG is thin and flat, which is why fine-pitch BGAs use it. Bare copper oxidises within a short time and will not solder at all.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('温度升到 Tg 以上，FR-4 会发生什么？', 'What happens to FR-4 when it is heated above its Tg?'),
    options: [
      { id: 'a', text: loc('树脂变软，板厚方向膨胀骤增，可能拉裂铜孔壁', 'The resin softens and thickness-direction expansion jumps, which can crack copper barrels') },
      { id: 'b', text: loc('玻纤熔化，板子立刻起火', 'The glass melts and the board ignites at once') },
      { id: 'c', text: loc('铜箔变薄，电阻变小', 'The copper thins and its resistance drops') },
    ],
    answer: 'a',
    explain: loc(
      'Tg 是树脂从硬的玻璃态变成软的橡胶态的温度，之后 Z 向膨胀系数升高约 5 倍，而铜孔壁只膨胀约 17 ppm/°C，多出来的拉力会把孔壁拉裂；玻纤要到 1000 °C 以上才熔化。',
      'Tg is where the resin goes from a hard glassy state to a soft rubbery one; beyond it the Z-axis expansion coefficient rises about five times while a copper barrel expands only about 17 ppm/°C, and the extra pull cracks the barrel; glass does not melt until above 1000 °C.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('一条软排线要在手机转轴里反复弯折几十万次，应该选哪种铜箔？', 'A flex cable must bend hundreds of thousands of times in a phone hinge. Which copper foil should it use?'),
    options: [
      { id: 'a', text: loc('ED 电解铜，因为便宜', 'ED copper, because it is cheap') },
      { id: 'b', text: loc('RA 压延退火铜', 'RA rolled-annealed copper') },
      { id: 'c', text: loc('2 oz 厚铜，因为厚更结实', '2 oz thick copper, because thicker is stronger') },
    ],
    answer: 'b',
    explain: loc(
      'RA 铜的晶粒被轧成扁平片、平行于板面，弯折时晶粒互相滑动；ED 铜是竖立的柱状晶，反复弯折会沿晶界裂开。铜越厚弯折时表面应变越大，反而更容易裂。',
      'RA copper has flat grains parallel to the board that slide over each other in bending, while ED copper has upright columnar grains that crack along grain boundaries under repeated bending. Thicker copper sees more surface strain when bent and cracks sooner, not later.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('一块 4 层板压合前，有一种材料不带铜、树脂没有完全固化，压合时流进内层线路的空隙。它是？', 'Before a 4-layer board is pressed, one material has no copper and uncured resin that flows into the gaps between inner traces. What is it?'),
    options: [
      { id: 'a', text: loc('芯板（Core）', 'Core') },
      { id: 'b', text: loc('半固化片（Prepreg）', 'Prepreg') },
      { id: 'c', text: loc('阻焊油墨', 'Solder-mask ink') },
    ],
    answer: 'b',
    explain: loc(
      '半固化片是浸了 B 阶段树脂的玻纤布，没有铜，受热先变软流动再固化，把各层粘在一起；芯板已经完全固化、两面覆铜，压合时不再流动；阻焊油墨是在外层表面涂的。',
      'Prepreg is glass cloth soaked with B-stage resin and has no copper; it softens, flows and then cures, bonding the layers together. A core is already fully cured and copper-clad and no longer flows in pressing; solder-mask ink is applied on the outer surfaces.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('一块 10 GHz 的射频板用普通 FR-4，信号衰减太大。换材料时最该看哪个参数？', 'A 10 GHz RF board on ordinary FR-4 loses too much signal. Which parameter matters most when changing the material?'),
    options: [
      { id: 'a', text: loc('Tg，越高损耗越小', 'Tg: higher means lower loss') },
      { id: 'b', text: loc('Df（损耗角正切），越小损耗越小', 'Df (loss tangent): smaller means less loss') },
      { id: 'c', text: loc('铜厚，越厚损耗越小', 'Copper weight: thicker means less loss') },
    ],
    answer: 'b',
    explain: loc(
      'Df 是介质每个周期吸收的能量比例，高频时介质损耗正比于频率和 Df；FR-4 的 Df 约 0.02，Rogers RO4350B 约 0.0037，所以选后者。Tg 管耐热，不管信号损耗；加厚铜对高频几乎没帮助，因为趋肤效应下电流只走表面。',
      'Df is the fraction of energy the dielectric absorbs per cycle, and at high frequency dielectric loss grows with frequency and Df; FR-4 has Df ≈ 0.02 and Rogers RO4350B ≈ 0.0037, hence the latter. Tg concerns heat tolerance, not signal loss, and thicker copper barely helps at high frequency because the skin effect keeps current at the surface.',
    ),
  },
]
