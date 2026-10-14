import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerWafer: loc('晶圆', 'Wafer'),
  kickerMap: loc('晶圆图', 'Wafer map'),
  kickerLitho: loc('图形化', 'Patterning'),
  kickerStack: loc('金属层', 'Metal stack'),
  introTitle: loc('一颗芯片是怎么「长」出来的', 'How a chip is grown'),
  makeTitle: loc('从沙子到晶圆', 'From sand to wafer'),
  makeNote: loc('分步播放：每一步只说它把材料变成了什么。', 'Step through: each step says only what the material turns into.'),
  mapTitle: loc('一片晶圆上的 Die 和良率', 'Dies and yield on one wafer'),
  mapNote: loc(
    '同一片 300 mm 晶圆、同样的缺陷点，切换 Die 尺寸看良率怎么变。点一颗 Die 看它的状态。',
    'Same 300 mm wafer, same defects: switch the die size and watch the yield change. Click a die to see its status.',
  ),
  small: loc('小 Die 10 × 10 mm', 'Small die 10 × 10 mm'),
  large: loc('大 Die 20 × 20 mm', 'Large die 20 × 20 mm'),
  gross: loc('完整 Die 数', 'Whole dies'),
  good: loc('好 Die', 'Good dies'),
  goodDie: loc('好 Die', 'Good die'),
  badDie: loc('坏 Die', 'Bad die'),
  yieldLabel: loc('良率', 'Yield'),
  defects: loc('缺陷点', 'Defects'),
  lithoTitle: loc('光刻 + 刻蚀 + 注入：把一个窗口做进硅里', 'Litho + etch + implant: opening one window into silicon'),
  lithoNote: loc(
    '以「在氧化层上开一个窗、掺杂、再接上金属」为例。真实芯片要把这类循环重复几十次，每次换一张掩模版。',
    'Example: open a window in the oxide, dope through it, then contact it with metal. A real chip repeats such loops dozens of times, with a new mask each time.',
  ),
  stackTitle: loc('晶体管上面的金属层', 'The metal layers above the transistors'),
  stackNote: loc('剖面示意（纵向放大）。点右边的层名看它是干什么的、坏了测试会看到什么。', 'Cross-section (vertically exaggerated). Click a layer name on the right to see what it does and what test sees when it fails.'),
  cpTitle: loc('做完以后：CP、划片、KGD', 'After fab: CP, dicing, KGD'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  fails: loc('坏了测试会看到：', 'When it fails, test sees: '),
  asideLater: loc(
    'CP 的探针卡怎么扎到 Pad 上见 {@connection}；车间里的探针台、测试机见 {@fAte}。',
    'How a probe card lands on the pads: {@connection}; the prober and tester on the floor: {@fAte}.',
  ),
  next: loc('下一课：封装', 'Next: Packaging'),
}

export const INTRO: LText[] = [
  loc(
    '芯片不是一块一块装出来的，而是在一整片圆形硅片（晶圆）上，一层一层地「长」出来：长薄膜、照图形、刻掉、掺杂、再盖金属，几百道工序后，一片晶圆上同时做好几百颗芯片。',
    'Chips are not assembled piece by piece. They are grown layer by layer on a whole round slice of silicon (a wafer): deposit a film, print a pattern, etch, dope, add metal. After hundreds of steps, hundreds of chips are finished at once on one wafer.',
  ),
  loc(
    '这一课只讲测试工程师需要知道的部分：晶圆从哪来、Die 和良率是什么、图形是怎么做上去的、金属层坏了会变成什么样的故障。',
    'This lesson covers only what a test engineer needs: where the wafer comes from, what dies and yield are, how patterns are made, and what kind of fault a broken metal layer turns into.',
  ),
]

export const MAKE: Array<{ title: LText; tag: LText; text: LText }> = [
  {
    title: loc('石英砂', 'Quartz sand'),
    tag: loc('SiO₂', 'SiO₂'),
    text: loc(
      '原料是高纯石英砂（二氧化硅）。在电弧炉里和碳一起加热还原，得到约 98–99% 的冶金级硅——这对芯片来说还太脏。',
      'The raw material is high-purity quartz sand (silicon dioxide). Heated with carbon in an arc furnace it is reduced to metallurgical-grade silicon, about 98–99% pure, which is still far too dirty for chips.',
    ),
  },
  {
    title: loc('提纯多晶硅', 'Purified polysilicon'),
    tag: loc('9N–11N', '9N–11N'),
    text: loc(
      '通过化学提纯（常用西门子法）得到电子级多晶硅，纯度 99.9999999% 以上（9 个 9，写作 9N）。杂质会改变硅的导电性，所以要这么纯。',
      'Chemical purification (usually the Siemens process) yields electronic-grade polysilicon, 99.9999999% pure or better (nine 9s, written 9N). Impurities change how silicon conducts, which is why it must be this pure.',
    ),
  },
  {
    title: loc('拉单晶', 'Crystal pulling'),
    tag: loc('1414 °C', '1414 °C'),
    text: loc(
      '多晶硅在石英坩埚里熔化（硅熔点 1414 °C）。把一小块单晶籽晶浸进熔液，一边旋转一边慢慢往上提，硅原子按籽晶的晶格排好，长成一根单晶硅棒（直拉法，Czochralski）。',
      'Polysilicon is melted in a quartz crucible (silicon melts at 1414 °C). A small single-crystal seed is dipped into the melt and slowly pulled up while rotating; silicon atoms line up with the seed’s lattice and grow into a single-crystal ingot (the Czochralski method).',
    ),
  },
  {
    title: loc('滚圆、切片', 'Grinding and slicing'),
    tag: loc('线锯', 'Wire saw'),
    text: loc(
      '硅棒磨到准确的直径，在侧面磨出一个缺口（Notch）标记晶向，再用线锯切成一片片薄圆片。',
      'The ingot is ground to an exact diameter, a notch is ground into its side to mark the crystal orientation, and a wire saw slices it into thin discs.',
    ),
  },
  {
    title: loc('抛光成晶圆', 'Polished wafer'),
    tag: loc('300 mm', '300 mm'),
    text: loc(
      '研磨、腐蚀、化学机械抛光后得到镜面晶圆。今天主流是 300 mm 直径、约 775 µm 厚。表面越平，后面的光刻越准。',
      'Lapping, etching and chemical-mechanical polishing give a mirror-finish wafer. Today’s mainstream is 300 mm across and about 775 µm thick. The flatter the surface, the more accurate the lithography that follows.',
    ),
  },
]

export const DIE_SIZES = [
  { id: 'small', mm: 10, label: S.small },
  { id: 'large', mm: 20, label: S.large },
] as const

export type DieSizeId = (typeof DIE_SIZES)[number]['id']

export const MAP_TEXT = {
  good: loc('好 Die：这颗面积里没有落到缺陷，CP 判为通过（Bin 1）。', 'Good die: no defect landed in its area, so CP passes it (Bin 1).'),
  bad: loc('坏 Die：有缺陷点落在这颗里面。一个缺陷就可能让一条线开路或短路，所以整颗判坏。', 'Bad die: a defect landed inside it. One defect can open or short a wire, so the whole die is rejected.'),
  edge: loc(
    '边缘不完整的 Die：晶圆是圆的、Die 是方的，边上这一圈放不下整颗，也不送测。所以 Die 越大，边上浪费的面积比例越高。',
    'Partial edge die: the wafer is round and dies are square, so the outer ring cannot hold whole dies and they are not tested. The bigger the die, the larger the share of wasted edge area.',
  ),
  why: loc(
    '为什么大 Die 良率低：缺陷点的数量由工艺决定，和你的 Die 多大无关。Die 越大，每颗「接住」缺陷的机会越大，坏一颗损失的面积也越多。',
    'Why big dies yield worse: the number of defects is set by the process, not by your die size. A bigger die is more likely to catch a defect, and each bad die wastes more area.',
  ),
  terms: loc(
    'Wafer 是整片；Die 是片上的一颗；Lot 是一起流片的一批晶圆（通常 25 片），用来追溯；Yield 是好 Die 的比例，直接决定成本。',
    'Wafer is the whole slice; a die is one chip on it; a lot is a batch of wafers processed together (usually 25), used for traceability; yield is the share of good dies and directly sets the cost.',
  ),
}

export const LITHO: Array<{ title: LText; text: LText }> = [
  {
    title: loc('硅衬底', 'Silicon substrate'),
    text: loc('从一片 p 型硅开始（已经轻掺了硼）。', 'Start with a p-type silicon wafer (already lightly doped with boron).'),
  },
  {
    title: loc('氧化', 'Oxidation'),
    text: loc(
      '在高温氧气里，表面长出一层二氧化硅（SiO₂）。它是绝缘的，后面要当「挡板」，挡住不想掺杂的地方。',
      'In hot oxygen, a layer of silicon dioxide (SiO₂) grows on the surface. It insulates, and later it acts as a shield over places that must not be doped.',
    ),
  },
  {
    title: loc('涂光刻胶', 'Spin-coat resist'),
    text: loc('高速旋转晶圆，把光刻胶甩成均匀的薄层。光刻胶是一种对光敏感的材料。', 'The wafer spins fast to spread photoresist into an even thin layer. Photoresist is a light-sensitive material.'),
  },
  {
    title: loc('曝光', 'Exposure'),
    text: loc(
      '紫外光穿过掩模版（Mask）。掩模版上铬膜挡光，只有透明的窗口让光通过。被照到的那块胶性质改变（正胶会变得能被显影液溶解）。',
      'Ultraviolet light shines through the mask. Chrome on the mask blocks light; only the clear window lets it through. The resist that gets light changes (positive resist becomes soluble in developer).',
    ),
  },
  {
    title: loc('显影', 'Develop'),
    text: loc('用显影液洗掉被照过的胶，掩模版上的窗口就「印」到了胶上。', 'Developer washes away the exposed resist, so the mask window is now printed in the resist.'),
  },
  {
    title: loc('刻蚀', 'Etch'),
    text: loc(
      '刻蚀只攻击露出来的氧化层，胶盖住的地方不受影响。窗口里的氧化层被去掉，露出下面的硅。',
      'Etching attacks only the exposed oxide; areas under resist are untouched. The oxide in the window is removed, exposing the silicon below.',
    ),
  },
  {
    title: loc('去胶', 'Strip resist'),
    text: loc('胶完成了任务，全部去掉。现在氧化层上有一个窗口。', 'The resist has done its job and is removed. The oxide now has a window in it.'),
  },
  {
    title: loc('离子注入', 'Ion implant'),
    text: loc(
      '把磷离子加速打向整片晶圆。氧化层挡住了大部分区域，只有窗口里的离子进入硅，形成 n⁺ 区。这就是晶体管源、漏极的做法。',
      'Phosphorus ions are accelerated at the whole wafer. The oxide blocks most areas; only ions in the window enter the silicon and form an n⁺ region. This is how transistor sources and drains are made.',
    ),
  },
  {
    title: loc('金属接触', 'Metal contact'),
    text: loc(
      '沉积金属并再做一次光刻刻蚀，留下一块金属伸进窗口，和 n⁺ 区接上。电信号从此能进出这块硅。',
      'Metal is deposited and patterned with another litho-and-etch round, leaving metal that reaches into the window and touches the n⁺ region. Signals can now get in and out of this piece of silicon.',
    ),
  },
]

export const LITHO_LABEL = {
  sub: loc('p 型硅衬底', 'p-type Si substrate'),
  oxide: loc('SiO₂ 氧化层', 'SiO₂ oxide'),
  resist: loc('光刻胶', 'Photoresist'),
  exposed: loc('被曝光的胶', 'Exposed resist'),
  mask: loc('掩模版', 'Mask'),
  chrome: loc('铬（挡光）', 'Chrome (opaque)'),
  uv: loc('紫外光', 'UV light'),
  ions: loc('磷离子', 'P ions'),
  metal: loc('金属', 'Metal'),
  cap: loc('剖面示意，纵向尺寸放大。真实窗口宽度在几十纳米到几微米。', 'Cross-section, vertical scale exaggerated. Real windows range from tens of nanometres to a few micrometres.'),
}

export type StackId = 'pad' | 'global' | 'local' | 'contact' | 'feol'

export const STACK: Array<{ id: StackId; title: LText; text: LText; fault: LText }> = [
  {
    id: 'pad',
    title: loc('Pad 与钝化层', 'Pads and passivation'),
    text: loc(
      '最上面是铝 Pad，外面盖一层氮化硅钝化层保护芯片，只在 Pad 上开口。CP 的探针、封装的键合线都落在 Pad 上。',
      'At the top are aluminium pads, under a silicon-nitride passivation layer that protects the chip and opens only over the pads. CP probes and package bond wires both land on the pads.',
    ),
    fault: loc(
      '探针扎得太深或太多次，Pad 被划破；Pad 下面裂了，封装后键合线接触不良，表现为开短路测试失败。',
      'Probing too hard or too often scratches through the pad; a crack under the pad leads to a poor bond after packaging, which shows up as an opens/shorts failure.',
    ),
  },
  {
    id: 'global',
    title: loc('上层粗金属', 'Thick upper metal'),
    text: loc('最上面几层金属又厚又宽，电阻小，主要用来铺电源网、地网和时钟。', 'The top few metal layers are thick and wide with low resistance, used mainly for power and ground grids and clocks.'),
    fault: loc(
      '电源网电阻偏大，芯片全速工作时电压塌下去（IR drop），表现为低电压或高频下功能失败。',
      'If the power grid resistance is too high, the supply sags when the chip runs at full speed (IR drop), showing up as functional failures at low voltage or high frequency.',
    ),
  },
  {
    id: 'local',
    title: loc('下层细金属与通孔', 'Fine lower metal and vias'),
    text: loc(
      'M1、M2… 线最细最密，把附近的晶体管连成门电路。层与层之间靠通孔（Via）接通。',
      'M1, M2 and so on have the finest, densest lines, wiring nearby transistors into gates. Layers connect through vias.',
    ),
    fault: loc(
      '两根线粘在一起（短路、桥接）或线 / 通孔断开（开路），对应 Scan 测试里的固定型和桥接故障；通孔半断则变慢，对应延迟故障。',
      'Two lines stuck together (short, bridge) or a broken line or via (open) map to stuck-at and bridging faults in Scan test; a half-broken via makes the path slow, a delay fault.',
    ),
  },
  {
    id: 'contact',
    title: loc('接触孔', 'Contacts'),
    text: loc('一根根钨柱，把第一层金属接到晶体管的源、漏和栅极上。', 'Tungsten plugs that connect the first metal layer to transistor sources, drains and gates.'),
    fault: loc('接触电阻偏大，晶体管驱动变弱，表现为速度变慢或输出电平不够。', 'High contact resistance weakens the transistor drive, showing up as slower speed or weak output levels.'),
  },
  {
    id: 'feol',
    title: loc('晶体管（前段）', 'Transistors (front end)'),
    text: loc(
      '在硅表面做出的 MOS 晶体管：栅极、薄栅氧、两边的源区和漏区。这部分叫前段工艺（FEOL），金属层叫后段（BEOL）。',
      'MOS transistors built at the silicon surface: gate, thin gate oxide, and source and drain on either side. This part is the front end (FEOL); the metal layers are the back end (BEOL).',
    ),
    fault: loc(
      '栅氧有缺陷会漏电，静态电流（IDDQ）偏大；阈值电压漂移会让速度和电平余量变小。',
      'A defective gate oxide leaks, raising the quiescent current (IDDQ); a threshold-voltage shift eats into speed and level margins.',
    ),
  },
]

export const STACK_CAP = loc(
  '剖面示意：越往上金属越厚、线越宽；纵向尺寸放大，层数因工艺而异（常见 6–15 层）。',
  'Cross-section: metal gets thicker and wider toward the top; vertical scale exaggerated, and the layer count depends on the process (commonly 6–15).',
)

export const CP_BODY: LText[] = [
  loc(
    '所有工序做完，晶圆还没切开，先上探针台做 CP（Chip Probing，晶圆测试）：探针卡上的针扎到每颗 Die 的 Pad 上，测试机逐颗测，结果画成上面那种晶圆图。原因是封装要花钱，坏 Die 不值得封。针卡和探针台见 {@connection}、{@fAte}。',
    'When fab is done and before the wafer is cut, it goes to the prober for CP (chip probing, wafer test): probe-card needles land on each die’s pads, the tester tests die by die, and the results form a wafer map like the one above. The reason: packaging costs money, and bad dies are not worth packaging. Probe cards and probers: {@connection}, {@fAte}.',
  ),
  loc(
    '然后晶圆被贴在膜上、用刀片或激光划片，切成一颗颗裸 Die。只有 CP 判好的 Die 会被捡去封装，下一课 {@pPackage} 接着讲。',
    'The wafer is then mounted on tape and diced with a blade or laser into individual bare dies. Only dies that passed CP are picked for packaging, which the next lesson {@pPackage} covers.',
  ),
  loc(
    '多颗 Die 封在一起（Chiplet）时，一颗坏了整颗报废，所以 CP 要测得更充分，保证每颗都是 KGD（Known Good Die，已知好 Die）。',
    'When several dies are packaged together (chiplets), one bad die scraps the whole part, so CP must be more thorough to make every die a KGD (known good die).',
  ),
]

export const TAKEAWAY: LText[] = [
  loc('石英砂 → 9N 多晶硅 → 拉单晶 → 切片抛光 → 300 mm 晶圆。', 'Quartz sand → 9N polysilicon → crystal pulling → slicing and polishing → 300 mm wafer.'),
  loc('光刻把掩模版图形印到胶上，刻蚀和注入再把图形做进材料里；这个循环重复几十次。', 'Lithography prints the mask pattern into resist; etch and implant then carry it into the material. The loop repeats dozens of times.'),
  loc('缺陷数由工艺决定，Die 越大良率越低；边缘不完整的 Die 不算数。', 'Defect count is set by the process, so bigger dies yield worse; partial edge dies do not count.'),
  loc('金属层的开路、短路、通孔半断，就是后面 Scan 课里各种故障模型的物理来源。', 'Opens, shorts and half-broken vias in the metal are the physical origin of the fault models in the later Scan lessons.'),
  loc('CP 在划片前、封装前，先把坏 Die 挑出来。', 'CP picks out bad dies before dicing and before packaging.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么晶圆要用 9N 以上纯度的硅？', 'Why must wafers use silicon purer than 9N?'),
    options: [
      { id: 'a', text: loc('杂质会改变硅的导电性，器件就做不准', 'Impurities change how silicon conducts, so devices come out wrong') },
      { id: 'b', text: loc('为了让晶圆更亮', 'To make the wafer shinier') },
      { id: 'c', text: loc('纯度越高越便宜', 'Higher purity is cheaper') },
    ],
    answer: 'a',
    explain: loc('芯片靠精确控制掺杂浓度工作，原料里的杂质会打乱它。', 'Chips work by precisely controlled doping; impurities in the raw material upset it.'),
  },
  {
    id: 'q2',
    prompt: loc('正性光刻胶被紫外光照到的部分，显影后会怎样？', 'After developing, what happens to positive resist that was exposed to UV?'),
    options: [
      { id: 'a', text: loc('留下来', 'It stays') },
      { id: 'b', text: loc('被溶解去掉', 'It dissolves away') },
      { id: 'c', text: loc('变成金属', 'It turns into metal') },
    ],
    answer: 'b',
    explain: loc('正胶曝光后变得可溶，所以掩模版的透明窗口在胶上变成开口。', 'Positive resist becomes soluble when exposed, so the clear window of the mask becomes an opening in the resist.'),
  },
  {
    id: 'q3',
    prompt: loc('离子注入时，氧化层起什么作用？', 'What does the oxide do during ion implant?'),
    options: [
      { id: 'a', text: loc('挡住离子，只让窗口里的硅被掺杂', 'It blocks ions so only silicon in the window is doped') },
      { id: 'b', text: loc('加速离子', 'It accelerates ions') },
      { id: 'c', text: loc('导电', 'It conducts') },
    ],
    answer: 'a',
    explain: loc('氧化层是挡板，窗口的位置决定了掺杂区在哪。', 'The oxide is a shield; the window position decides where the doped region goes.'),
  },
  {
    id: 'q4',
    prompt: loc('同一工艺、同样缺陷密度，Die 面积变成 4 倍，良率会？', 'Same process and defect density, die area ×4. What happens to yield?'),
    options: [
      { id: 'a', text: loc('不变', 'Unchanged') },
      { id: 'b', text: loc('下降', 'It drops') },
      { id: 'c', text: loc('上升', 'It rises') },
    ],
    answer: 'b',
    explain: loc('每颗 Die 接住缺陷的机会变大，边缘浪费也变多。', 'Each die is more likely to catch a defect, and more edge area is wasted.'),
  },
  {
    id: 'q5',
    prompt: loc('M1 两根相邻金属线被一粒颗粒连在一起，Scan 测试里通常把它当成什么故障？', 'A particle bridges two adjacent M1 lines. What fault does Scan test usually model it as?'),
    options: [
      { id: 'a', text: loc('桥接故障', 'A bridging fault') },
      { id: 'b', text: loc('电源电压太高', 'Supply voltage too high') },
      { id: 'c', text: loc('封装裂开', 'A cracked package') },
    ],
    answer: 'a',
    explain: loc('两根本该独立的信号线短在一起，就是桥接；断开则是开路 / 固定型故障。', 'Two signals that should be independent are shorted: a bridge. A break would be an open or stuck-at fault.'),
  },
]
