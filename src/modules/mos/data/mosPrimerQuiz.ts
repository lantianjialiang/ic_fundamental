import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/** 学前自测：对 PASS 道及以上就建议跳过本课 */
export const CHECK_PASS = 4

export const CHECK_TEXT = {
  progress: loc('已答', 'Answered'),
  score: loc('答对', 'Correct'),
  reset: loc('重做自测', 'Retake the pre-check'),
  skip: loc(
    '基础够用，可以直接进入 {@mosIntro}。下面的内容想复习时再回来看。',
    'Your basics are solid enough: go straight to {@mosIntro}. Come back to the sections below whenever you want a refresher.',
  ),
  study: loc(
    '建议先学完这一课再去 {@mosIntro}：答错的题对应下面的小节，后面讲沟道、PN 结漏电和栅极延时都要用到。',
    'Study this lesson before {@mosIntro}: the items you missed map to the sections below, and channels, junction leakage and gate delay in later lessons all build on them.',
  ),
}

export const CHECK: QuizQuestion[] = [
  {
    id: 'c1',
    prompt: loc('在硅里掺入磷，得到什么型的半导体？', 'Doping silicon with phosphorus gives which type?'),
    options: [
      { id: 'a', text: loc('N 型', 'N-type') },
      { id: 'b', text: loc('P 型', 'P-type') },
      { id: 'c', text: loc('变成绝缘体', 'It becomes an insulator') },
    ],
    answer: 'a',
    explain: loc('磷有 5 个价电子，多出的一个成为自由电子。', 'Phosphorus has 5 valence electrons; the extra one becomes a free electron.'),
  },
  {
    id: 'c2',
    prompt: loc('P 型硅里的多数载流子是？', 'What are the majority carriers in P-type silicon?'),
    options: [
      { id: 'a', text: loc('电子', 'Electrons') },
      { id: 'b', text: loc('空穴', 'Holes') },
      { id: 'c', text: loc('硼离子', 'Boron ions') },
    ],
    answer: 'b',
    explain: loc('硼缺一个价电子，留下空穴；硼离子本身固定不动，不算载流子。', 'Boron lacks one valence electron, leaving a hole; the boron ion itself is fixed and is not a carrier.'),
  },
  {
    id: 'c3',
    prompt: loc('硅 PN 结正向导通时，两端电压大约是？', 'About what voltage sits across a conducting silicon PN junction?'),
    options: [
      { id: 'a', text: loc('0.07 V', '0.07 V') },
      { id: 'b', text: loc('0.7 V', '0.7 V') },
      { id: 'c', text: loc('7 V', '7 V') },
    ],
    answer: 'b',
    explain: loc('要抵消约 0.7 V 的内建电势才有明显电流，之后电流指数上涨、电压基本不再升。', 'About 0.7 V of built-in potential must be cancelled before current flows noticeably; after that current rises exponentially while voltage barely moves.'),
  },
  {
    id: 'c4',
    prompt: loc('PN 结加反向电压，耗尽区会？', 'Under reverse bias, the depletion region…'),
    options: [
      { id: 'a', text: loc('变窄', 'narrows') },
      { id: 'b', text: loc('变宽', 'widens') },
      { id: 'c', text: loc('不变', 'stays the same') },
    ],
    answer: 'b',
    explain: loc('反偏把载流子从交界处拉走，露出更多固定离子。', 'Reverse bias pulls carriers away from the boundary, exposing more fixed ions.'),
  },
  {
    id: 'c5',
    prompt: loc('RC 充电经过 1 个 τ，电容电压到了电源的多少？', 'After one τ of RC charging, the capacitor has reached what fraction of the supply?'),
    options: [
      { id: 'a', text: loc('约 37%', 'About 37%') },
      { id: 'b', text: loc('约 63%', 'About 63%') },
      { id: 'c', text: loc('100%', '100%') },
    ],
    answer: 'b',
    explain: loc('1 − e⁻¹ ≈ 63.2%；37% 是放电 1τ 后剩下的比例。', '1 − e⁻¹ ≈ 63.2%; 37% is what remains after 1τ of discharge.'),
  },
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('N 型硅里的少数载流子是什么？为什么比本征硅还少？', 'What are the minority carriers in N-type silicon, and why are they fewer than in intrinsic silicon?'),
    options: [
      { id: 'a', text: loc('空穴；电子多了复合也多，n × p = ni² 不变', 'Holes; more electrons mean more recombination, and n × p = ni² stays fixed') },
      { id: 'b', text: loc('电子；磷把电子吸走了', 'Electrons; phosphorus absorbs them') },
      { id: 'c', text: loc('磷离子；它们会慢慢移动', 'Phosphorus ions; they drift slowly') },
    ],
    answer: 'a',
    explain: loc('掺 10¹⁶ cm⁻³ 的磷后 n ≈ 10¹⁶，p = ni² / n ≈ 10⁴ cm⁻³，比本征的 10¹⁰ 少得多。', 'With 10¹⁶ cm⁻³ phosphorus, n ≈ 10¹⁶ and p = ni² / n ≈ 10⁴ cm⁻³, far below the intrinsic 10¹⁰.'),
  },
  {
    id: 'q2',
    prompt: loc('耗尽区里为什么几乎不导电？', 'Why does the depletion region barely conduct?'),
    options: [
      { id: 'a', text: loc('那里没有硅原子', 'There are no silicon atoms there') },
      { id: 'b', text: loc('自由电子和空穴复合掉了，只剩不能移动的固定离子', 'Free electrons and holes have recombined, leaving only immobile fixed ions') },
      { id: 'c', text: loc('那里温度更低', 'It is colder there') },
    ],
    answer: 'b',
    explain: loc('导电靠能移动的载流子；离子被晶格锁住，只贡献电荷和电场，不贡献电流。', 'Conduction needs mobile carriers; the ions are locked in the lattice, contributing charge and field but no current.'),
  },
  {
    id: 'q3',
    prompt: loc('判断状态：P 区接 0 V，N 区接 +3 V。', 'Judge the state: P side at 0 V, N side at +3 V.'),
    options: [
      { id: 'a', text: loc('正偏，导通', 'Forward biased, conducting') },
      { id: 'b', text: loc('反偏，只有极小漏电流', 'Reverse biased, only tiny leakage') },
      { id: 'c', text: loc('零偏，电流为 0', 'Zero bias, no current') },
    ],
    answer: 'b',
    explain: loc('V = VP − VN = −3 V，N 比 P 高就是反偏：势垒升到约 3.7 V，耗尽区变宽。', 'V = VP − VN = −3 V; N higher than P is reverse bias: the barrier rises to about 3.7 V and the depletion region widens.'),
  },
  {
    id: 'q4',
    prompt: loc('R = 10 kΩ、C = 1 µF，时间常数 τ 是多少？', 'With R = 10 kΩ and C = 1 µF, what is the time constant τ?'),
    options: [
      { id: 'a', text: loc('1 ms', '1 ms') },
      { id: 'b', text: loc('10 ms', '10 ms') },
      { id: 'c', text: loc('100 ms', '100 ms') },
    ],
    answer: 'b',
    explain: loc('τ = R × C = 10⁴ Ω × 10⁻⁶ F = 10⁻² s = 10 ms；约 5τ = 50 ms 后基本充满。', 'τ = R × C = 10⁴ Ω × 10⁻⁶ F = 10⁻² s = 10 ms; it is essentially full after about 5τ = 50 ms.'),
  },
  {
    id: 'q5',
    prompt: loc('NMOS 的 n+ 源漏做在 P 型衬底里，衬底接最低电位。源漏和衬底之间是什么状态？', 'An NMOS has n+ source / drain in a P-type body tied to the lowest potential. What is the state between source / drain and body?'),
    options: [
      { id: 'a', text: loc('正偏的 PN 结，有大电流', 'A forward-biased PN junction carrying large current') },
      { id: 'b', text: loc('零偏或反偏的 PN 结，只有极小漏电', 'A zero- or reverse-biased PN junction with only tiny leakage') },
      { id: 'c', text: loc('一个电阻', 'A resistor') },
    ],
    answer: 'b',
    explain: loc('P 衬底电位最低，N 区不低于它，所以结是零偏或反偏，源漏和衬底彼此隔离。', 'The P body is at the lowest potential and the N regions are never below it, so the junctions are zero- or reverse-biased and isolate source / drain from the body.'),
  },
]
