import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------- 从晶圆到出货 ---------- */

export const FLOW_LEAD: LText[] = [
  loc(
    '1947 年晶体管诞生，半导体产业从此开始。今天一颗 VLSI（超大规模集成电路）里有上百万个晶体管。',
    'The semiconductor industry began with the invention of the transistor in 1947. Today a single VLSI (Very Large Scale Integration) chip contains millions of transistors.',
  ),
  loc(
    '芯片先做在晶圆（wafer）上：一片圆形的硅片，上面整齐排着很多个相同的电路，每一个叫一颗 die（复数 dice）。每颗 die 彼此独立。',
    'Chips are first built on a wafer: a round slice of silicon carrying a neat grid of identical circuits, each called a die (plural dice). Every die is independent of the others.',
  ),
  loc(
    '从晶圆到出货，芯片要被测两次：还在晶圆上时测一次（晶圆测试），装进封装后再测一次（成品测试）。点下面的步骤看细节。',
    'From wafer to shipment a chip is tested twice: once while still on the wafer (wafer sort) and again after packaging (final test). Click a step below for details.',
  ),
]

export const FLOW: Card[] = [
  {
    id: 'fab',
    title: loc('① 晶圆制造', '① Wafer fab'),
    sub: loc('Fab', 'Fab'),
    text: loc(
      '在硅片上做出成百上千颗相同的 die。晶圆上有平边或缺口作为方向标记，还有几颗 process monitor die 用来监控工艺。',
      'Hundreds or thousands of identical dice are built on a silicon wafer. The wafer has a flat or notch as an orientation mark, plus a few process monitor dice to monitor the process.',
    ),
    explain: [
      loc(
        '晶圆在制造和测试过程中都有一个平边（flat）或缺口（notch），通常朝上，用来定方向。',
        'Throughout fabrication and test the wafer has a flat or notch, usually facing up, used for orientation.',
      ),
      loc(
        '很多晶圆上有几颗 process monitor die（工艺监控片）。不管做什么产品，它们在所有晶圆上都一样，电特性是已知的。制造过程中在特定节点测它们，就能确认工艺是否正常。',
        'Many wafers carry a few process monitor dice. They are identical on every wafer regardless of product, with known electrical characteristics. Testing them at specific points during fabrication confirms that the process is on track.',
      ),
    ],
  },
  {
    id: 'probe',
    title: loc('② 晶圆测试', '② Wafer sort'),
    sub: loc('Wafer probe / Die sort', 'Wafer probe / Die sort'),
    text: loc(
      '用探针卡扎到每颗 die 的 bond pad 上，逐颗测电压、电流、时序和功能。',
      'A probe card touches down on the bond pads of each die, and voltage, current, timing and function are tested die by die.',
    ),
    explain: [
      loc(
        '制造完成后，每颗 die 都要彻底测一遍，这叫 wafer probing 或 die sort。要验证电压、电流、时序和功能，确认它满足器件规格。',
        'After fabrication every die is thoroughly tested; this is called wafer probing or die sort. Voltage, current, timing and function are verified to confirm the die meets the device specification.',
      ),
      loc(
        '探针扎到 bond pad 上，测试机通过探针卡和负载板给 die 加信号、读结果。',
        'The probes contact the bond pads, and the tester applies signals and reads results through the probe card and load board.',
      ),
    ],
  },
  {
    id: 'mark',
    title: loc('③ 标记坏片', '③ Mark rejects'),
    sub: loc('墨点 / 电子晶圆图', 'Ink dot / electronic wafer map'),
    text: loc(
      '不合格的 die 打一个墨点，或者把好坏位置存成电子晶圆图（wafer map）。',
      'Failing dice get an ink dot, or the good/bad locations are stored as an electronic wafer map.',
    ),
    explain: [
      loc('传统做法是给坏 die 点一个墨点（ink dot），后面一眼就能认出来。', 'Traditionally a bad die is marked with an ink dot so it can be spotted at a glance later.'),
      loc(
        '现在很多公司更喜欢电子晶圆图：把每颗 die 的位置和结果存成文件，封装时按图挑出好片。这样就没有打墨点装置带来的各种麻烦。',
        'Many companies now prefer an electronic wafer map: the location and result of every die are stored in a file, and good dice are picked by the map at assembly. This avoids the many problems of inking equipment.',
      ),
    ],
  },
  {
    id: 'saw',
    title: loc('④ 划片', '④ Sawing'),
    sub: loc('Sawing', 'Sawing'),
    text: loc(
      '把晶圆锯开，分成一颗颗 die。打了墨点（或晶圆图上标坏）的 die 直接报废。',
      'The wafer is sawed into individual dice. Inked dice (or those marked bad on the wafer map) are scrapped.',
    ),
  },
  {
    id: 'pkg',
    title: loc('⑤ 封装', '⑤ Assembly'),
    sub: loc('Assembly', 'Assembly'),
    text: loc(
      '好的 die 装进封装的 die cavity，用 bond wire 把 bond pad 连到封装引脚，再盖上盖子密封。',
      'Good dice are placed in the die cavity of a package, bond wires connect the bond pads to the package pins, and a lid seals it.',
    ),
  },
  {
    id: 'final',
    title: loc('⑥ 成品测试', '⑥ Final test'),
    sub: loc('Package / Final test', 'Package / Final test'),
    text: loc(
      '封装后再测一次。可能要在几个温度下各测一遍，保证对温度敏感的参数。',
      'The packaged part is tested again, possibly once at each of several temperatures to guarantee temperature-sensitive parameters.',
    ),
    explain: [
      loc(
        '如果探针卡或晶圆测试设备限制了速度和性能，成品测试可能要比晶圆测试更严格。',
        'If the probe card or wafer sort equipment limits speed and performance, final test may need to be more stringent than wafer sort.',
      ),
      loc(
        '对温度敏感的参数要在多个温度下测。选上面的等级看看要测哪几个温度。',
        'Temperature-sensitive parameters are tested at several temperatures. Pick a grade above to see which temperatures are required.',
      ),
    ],
  },
]

export type Grade = 'com' | 'mil'

export const GRADE_TEMPS: Record<Grade, number[]> = {
  com: [0, 25, 70],
  mil: [-55, 25, 125],
}

/* ---------- 晶圆探针测试 ---------- */

export const WAFER = { cx: 200, cy: 190, r: 165, pitch: 24, size: 21 }

export type Die = { id: string; col: number; row: number; x: number; y: number; pm: boolean; edge: number }

const PM_POS = ['-4,-1', '3,-2', '-2,3', '2,2']

function buildDice(): Die[] {
  const list: Die[] = []
  const { cx, cy, r, pitch, size } = WAFER
  for (let row = -7; row <= 6; row += 1) {
    for (let col = -7; col <= 6; col += 1) {
      const x = cx + col * pitch + (pitch - size) / 2
      const y = cy + row * pitch + (pitch - size) / 2
      const corners = [
        [x, y],
        [x + size, y],
        [x, y + size],
        [x + size, y + size],
      ]
      const inside = corners.every(([px, py]) => Math.hypot(px - cx, py - cy) <= r - 6)
      // 顶部缺口附近不放 die
      const nearNotch = Math.abs(x + size / 2 - cx) < 20 && y < cy - r + 34
      if (!inside || nearNotch) continue
      const edge = Math.hypot(x + size / 2 - cx, y + size / 2 - cy) / r
      list.push({ id: `${col},${row}`, col, row, x, y, pm: PM_POS.includes(`${col},${row}`), edge })
    }
  }
  return list
}

export const DICE = buildDice()

/** 探针走位：逐行蛇形，跳过 process monitor die */
export const PROBE_ORDER: number[] = (() => {
  const idx = DICE.map((d, i) => ({ d, i })).filter((item) => !item.d.pm)
  const rows = Array.from(new Set(idx.map((item) => item.d.row))).sort((p, q) => p - q)
  return rows.flatMap((row, k) => {
    const inRow = idx.filter((item) => item.d.row === row).sort((p, q) => p.d.col - q.d.col)
    return (k % 2 === 0 ? inRow : inRow.reverse()).map((item) => item.i)
  })
})()

export const DIE_BINS: Array<{ bin: number; label: LText }> = [
  { bin: 1, label: loc('好片', 'Good') },
  { bin: 2, label: loc('开短路失效', 'Opens/shorts fail') },
  { bin: 3, label: loc('DC 失效', 'DC fail') },
  { bin: 4, label: loc('功能失效', 'Functional fail') },
  { bin: 5, label: loc('AC 失效', 'AC fail') },
]

/** 给每颗 die 随机一个 bin；越靠边越容易坏 */
export function makeResults(): number[] {
  return DICE.map((d) => {
    const pFail = 0.06 + 0.3 * d.edge ** 6
    if (Math.random() >= pFail) return 1
    const r = Math.random()
    if (r < 0.2) return 2
    if (r < 0.45) return 3
    if (r < 0.8) return 4
    return 5
  })
}

export const WAFER_LEAD = loc(
  '探针从晶圆一角开始，一行一行蛇形走，每到一颗 die 就测一遍。紫色的是 process monitor die，产品测试时跳过。点任何一颗 die，右边会放大给你看。',
  'The prober starts at one corner of the wafer and snakes row by row, testing each die it reaches. Purple dice are process monitor dice, skipped during product test. Click any die to see it magnified on the right.',
)

export const DIE_NOTE: LText[] = [
  loc(
    'die 四周浅色的小方块是 bond pad。晶圆测试时探针扎在它上面；封装时 bond wire 也焊在它上面，连到封装引脚。',
    'The small light squares around the die are bond pads. During wafer sort the probes land on them; at assembly bond wires are attached to them and run to the package pins.',
  ),
  loc(
    'bond pad 是软铝做的，探针一扎就留下一个小坑，叫 probe mark。操作员在显微镜下看到每个 pad 都有 probe mark，就知道探针确实接触到了。',
    'Bond pads are soft aluminum, so each probe touchdown leaves a small dent called a probe mark. When an operator sees a probe mark on every pad under the microscope, they know the probes really made contact.',
  ),
]

/* ---------- 封装 ---------- */

export type PkgStyle = 'dual' | 'cerdip' | 'smd' | 'single' | 'module' | 'quad' | 'grid' | 'ball' | 'mcm'

const TWO = () => loc('两边', 'Two sides')
const FOUR = () => loc('四边', 'Four sides')
const GRID = () => loc('底面整片', 'Whole bottom')

export const PKGS: Array<{ id: string; name: string; full: LText; sides: LText; text: LText; style: PkgStyle; pins: number }> = [
  {
    id: 'dip',
    name: 'DIP',
    full: loc('双列直插封装', 'Dual Inline Package'),
    sides: TWO(),
    text: loc(
      'Dual Inline Package。dual 表示引脚在两条长边上，插进电路板的孔里。',
      'Dual Inline Package. "Dual" means the pins are on the two long sides and go through holes in the circuit board.',
    ),
    style: 'dual',
    pins: 8,
  },
  {
    id: 'cerdip',
    name: 'CerDIP',
    full: loc('陶瓷 DIP', 'Ceramic DIP'),
    sides: TWO(),
    text: loc(
      '陶瓷外壳的 DIP。die 装在中间的 die cavity 里，用金属盖密封，耐高温、气密性好，军品常用。',
      'A DIP with a ceramic body. The die sits in the central die cavity sealed with a metal lid; it tolerates high temperature and is hermetic, so it is common in military parts.',
    ),
    style: 'cerdip',
    pins: 8,
  },
  {
    id: 'pdip',
    name: 'PDIP',
    full: loc('塑封 DIP', 'Plastic DIP'),
    sides: TWO(),
    text: loc('塑料外壳的 DIP，便宜，民用最常见。', 'A DIP with a plastic body; cheap and the most common in commercial parts.'),
    style: 'dual',
    pins: 8,
  },
  {
    id: 'pga',
    name: 'PGA',
    full: loc('针栅阵列', 'Pin Grid Array'),
    sides: GRID(),
    text: loc(
      'Pin Grid Array。引脚是一根根针，排满底面，适合引脚很多的芯片，比如老式 CPU。',
      'Pin Grid Array. The pins are rows of needles covering the bottom, suited to chips with many pins, such as older CPUs.',
    ),
    style: 'grid',
    pins: 0,
  },
  {
    id: 'bga',
    name: 'BGA',
    full: loc('球栅阵列', 'Ball Grid Array'),
    sides: GRID(),
    text: loc(
      'Ball Grid Array。底面是一颗颗焊球，引脚密度高、走线短，现在的大芯片几乎都是 BGA。',
      'Ball Grid Array. The bottom is covered with solder balls, giving high pin density and short traces; almost all large chips today are BGA.',
    ),
    style: 'ball',
    pins: 0,
  },
  {
    id: 'sop',
    name: 'SOP',
    full: loc('小外形封装', 'Small Outline Package'),
    sides: TWO(),
    text: loc(
      'Small Outline Package。两边鸥翼形引脚，贴在板子表面焊接。',
      'Small Outline Package. Gull-wing pins on two sides, soldered onto the board surface.',
    ),
    style: 'smd',
    pins: 8,
  },
  {
    id: 'tsop',
    name: 'TSOP',
    full: loc('薄型小外形封装', 'Thin SOP'),
    sides: TWO(),
    text: loc('Thin SOP，更薄的 SOP，内存颗粒常用。', 'Thin SOP, a thinner SOP, common for memory chips.'),
    style: 'smd',
    pins: 12,
  },
  {
    id: 'tssop',
    name: 'TSSOP',
    full: loc('薄型缩小小外形封装', 'Thin Shrink SOP'),
    sides: TWO(),
    text: loc('Thin Shrink SOP，又薄、脚距又小，真的越来越小了。', 'Thin Shrink SOP: thinner with a finer pin pitch; packages really keep shrinking.'),
    style: 'smd',
    pins: 16,
  },
  {
    id: 'sip',
    name: 'SIP',
    full: loc('单列直插封装', 'Single Inline Package'),
    sides: loc('一边', 'One side'),
    text: loc('Single Inline Package，引脚只在一条边上排成一列。', 'Single Inline Package; the pins form a single row along one edge.'),
    style: 'single',
    pins: 10,
  },
  {
    id: 'simm',
    name: 'SIMM',
    full: loc('单列内存模组', 'Single Inline Memory Module'),
    sides: loc('一边（金手指）', 'One side (edge fingers)'),
    text: loc(
      'Single Inline Memory Module，就是电脑里的内存条：一块小板上焊着几颗内存，一边是金手指。',
      'Single Inline Memory Module, the memory stick in a computer: a small board with several memory chips and gold edge fingers on one side.',
    ),
    style: 'module',
    pins: 24,
  },
  {
    id: 'qfp',
    name: 'QFP',
    full: loc('四边扁平封装', 'Quad Flat Pack'),
    sides: FOUR(),
    text: loc('Quad Flat Pack。quad 表示四条边都有引脚。', 'Quad Flat Pack. "Quad" means there are pins on all four sides.'),
    style: 'quad',
    pins: 10,
  },
  {
    id: 'tqfp',
    name: 'TQFP',
    full: loc('薄型 QFP', 'Thin QFP'),
    sides: FOUR(),
    text: loc('Thin QFP，更薄的 QFP。', 'Thin QFP, a thinner QFP.'),
    style: 'quad',
    pins: 12,
  },
  {
    id: 'mqfp',
    name: 'MQFP',
    full: loc('公制 QFP', 'Metric QFP'),
    sides: FOUR(),
    text: loc('Metric QFP，尺寸按公制定义的 QFP。', 'Metric QFP, a QFP with dimensions defined in metric units.'),
    style: 'quad',
    pins: 10,
  },
  {
    id: 'mcm',
    name: 'MCM',
    full: loc('多芯片模组', 'Multi Chip Module'),
    sides: loc('看外壳', 'Depends on case'),
    text: loc(
      'Multi Chip Module，一个封装里装不止一颗 die，以前叫 hybrid（混合电路）。',
      'Multi Chip Module: more than one die in a single package, formerly called a hybrid.',
    ),
    style: 'mcm',
    pins: 10,
  },
]

export const BOND_TEXT: LText[] = [
  loc(
    '封装时，die 粘在封装中央的 die cavity 里。一根根极细的 bond wire 把 die 上的 bond pad 连到封装的引脚。最后盖上盖子密封。',
    'At assembly the die is attached in the die cavity at the center of the package. Very fine bond wires connect the bond pads on the die to the package pins. Finally a lid seals it.',
  ),
  loc(
    '晶圆测试时在显微镜下看，探针卡上的探针扎在 bond pad 上的样子，和这些 bond wire 很像。',
    'Under the microscope during wafer sort, the probe card needles landing on the bond pads look much like these bond wires.',
  ),
]

/* ---------- ATE ---------- */

export const ATE_LEAD: LText[] = [
  loc(
    '芯片越复杂，测试也越复杂。一颗 VLSI 可能要上百项电压、电流、时序测试，外加几百万步功能测试。对有些器件，测试是制造成本里最大的一块。',
    'The more complex the chip, the more complex the test. A VLSI device may need hundreds of voltage, current and timing tests plus millions of functional test steps. For some devices, test is the largest part of manufacturing cost.',
  ),
  loc(
    'ATE（Automatic Test Equipment，自动测试设备）就是一组由计算机控制的高性能测试仪器。仪器和计算机合在一起，就是一台测试系统。',
    'ATE (Automatic Test Equipment) is a set of high-performance test instruments controlled by a computer. The instruments and the computer together form a test system.',
  ),
  loc(
    '做集成电路有多种工艺：TTL（双极型）、ECL、SOS（蓝宝石上的硅）、CMOS。都要测，本课程主要讲数字 TTL 和 CMOS 电路。',
    'ICs are made in several technologies: TTL (bipolar), ECL, SOS (silicon on sapphire) and CMOS. All must be tested; this course focuses on digital TTL and CMOS circuits.',
  ),
]

export const ATE_PARTS: Card[] = [
  {
    id: 'inst',
    title: loc('测试仪器', 'Instruments'),
    sub: loc('Force / Measure', 'Force / Measure'),
    text: loc(
      '电源、PMU、管脚电子、时序发生器……负责给芯片加电压电流、发波形，并测量结果。',
      'Power supplies, PMU, pin electronics, timing generators... they apply voltage and current to the chip, generate waveforms and measure the results.',
    ),
  },
  {
    id: 'cpu',
    title: loc('计算机', 'Computer'),
    sub: loc('控制一切', 'Controls everything'),
    text: loc(
      '计算机控制所有测试硬件：什么时候加什么电压、发哪组图形、和哪个极限比。',
      'The computer controls all test hardware: when to apply which voltage, which pattern to run and which limit to compare against.',
    ),
  },
  {
    id: 'prog',
    title: loc('测试程序', 'Test program'),
    sub: loc('Test program', 'Test program'),
    text: loc(
      '计算机执行的一组指令就是测试程序。同一台测试机换一个程序，就能测另一种芯片。',
      'The set of instructions the computer executes is the test program. Load a different program and the same tester can test a different chip.',
    ),
  },
  {
    id: 'cal',
    title: loc('校准', 'Calibration'),
    sub: loc('Calibration', 'Calibration'),
    text: loc(
      '测试系统结果一致、可重复，靠的是定期校准：检查（必要时调整）所有加载和测量仪器的精度。',
      'Consistent, repeatable results depend on regular calibration: checking (and adjusting if needed) the accuracy of every force and measure instrument.',
    ),
  },
]

export type Hookup = 'cp' | 'hand' | 'handler'

export const HOOKUP_TEXT: Record<Hookup, LText> = {
  cp: loc(
    '晶圆测试：探针卡在物理上和电气上把测试系统接到 die 上。负载板（load board，也叫 performance board）把探针卡连到测试系统的仪器。两者配合，信号才能在测试机和 die 之间来回。',
    'Wafer sort: the probe card connects the test system to the die physically and electrically. The load board (also called the performance board) connects the probe card to the tester instruments. Together they carry signals between the tester and the die.',
  ),
  hand: loc(
    '手测（hand test）：把封装好的芯片一颗颗手动插进负载板上的测试座（socket）。适合工程调试，量大时太慢。',
    'Hand test: packaged chips are inserted one at a time by hand into a socket on the load board. Good for engineering debug, too slow for volume.',
  ),
  handler: loc(
    '分选机（handler）：自动抓起一颗未测芯片，压到测试位的接触器上，测完再按 Pass / Fail 结果放进对应的 Bin。适合量产。',
    'Handler: automatically picks an untested chip, presses it into the contactor at the test site, and after test places it in the bin matching its Pass / Fail result. Suited to production.',
  ),
}

/* ---------- 数字 vs 模拟 ---------- */

export const DA_LEAD: LText[] = [
  loc(
    '数字电路只认两种电平：0 是一个确定的电压，1 是另一个确定的电压。一个 0 或 1 就是一个 bit，8 个 bit 是一个 byte。数值越大、越精细，需要的 bit 越多。',
    'Digital circuits recognize only two levels: 0 is one defined voltage and 1 is another. A single 0 or 1 is a bit, and 8 bits make a byte. Larger or finer values need more bits.',
  ),
  loc(
    '模拟信号是连续的：任意两个电平之间都有无穷多个值。模拟电路可以用电压，也可以用电流表示数据。',
    'Analog signals are continuous: there are infinitely many values between any two levels. Analog circuits can represent data with voltage or with current.',
  ),
  loc(
    '用钟表来想：指针表的指针连续走，任何时刻都能读，读多准看你的眼力；数字表只显示整格，比最小一格还小的时间就看不到了。要更精确，就得加位数。',
    'Think of clocks: the hands of an analog clock move continuously and can be read at any moment, as precisely as your eyes allow; a digital clock shows only whole steps, and anything smaller than the last digit is invisible. More precision requires more digits.',
  ),
]

export type Res = 'min' | 'sec' | 'ds' | 'cs'

export const MIXED: Card[] = [
  { id: 'adc', title: loc('A/D 转换器', 'A/D converter'), sub: 'ADC', text: loc('把模拟量变成数字量。', 'Converts an analog quantity to a digital one.') },
  { id: 'dac', title: loc('D/A 转换器', 'D/A converter'), sub: 'DAC', text: loc('把数字量变成模拟量。', 'Converts a digital quantity to an analog one.') },
  {
    id: 'bdla',
    title: 'Big D Little A',
    sub: loc('以数字为主', 'Mostly digital'),
    text: loc('混合信号器件里大部分是数字电路，只有一小块模拟。', 'A mixed-signal device that is mostly digital circuitry with a small analog block.'),
  },
  {
    id: 'bald',
    title: 'Big A Little D',
    sub: loc('以模拟为主', 'Mostly analog'),
    text: loc('混合信号器件里大部分是模拟电路，只有一小块数字。', 'A mixed-signal device that is mostly analog circuitry with a small digital block.'),
  },
]

export const MIXED_LEAD = loc(
  '同时含有数字和模拟电路的器件叫混合信号（mixed signal）器件，ADC、DAC 就是典型。按哪部分占大头，又分 Big D Little A 和 Big A Little D。',
  'A device containing both digital and analog circuitry is a mixed-signal device; ADCs and DACs are typical examples. Depending on which part dominates, they are called Big D Little A or Big A Little D.',
)

/* ---------- 四类测试机 ---------- */

export const TESTERS: Card[] = [
  {
    id: 'mem',
    title: loc('Memory 测试机', 'Memory tester'),
    sub: loc('APG · 并测', 'APG · parallel test'),
    text: loc(
      '存储器也是数字器件，DC 参数和普通数字芯片差不多，但功能测试要用专门的算法图形。',
      'Memories are digital devices too, with DC parameters much like ordinary digital chips, but functional test needs special algorithmic patterns.',
    ),
    explain: [
      loc(
        'Memory 测试机用 APG（Algorithmic Pattern Generator，算法图形发生器）在硬件里现场生成功能图形，不必像普通数字测试机那样预先把向量存进向量存储器。',
        'A memory tester uses an APG (Algorithmic Pattern Generator) to generate functional patterns in hardware on the fly, instead of pre-loading vectors into vector memory as an ordinary digital tester does.',
      ),
      loc(
        '典型图形有：checkerboard（棋盘格）、反棋盘格、walking ones、walking zeros、butterfly 等。下面可以看几种。',
        'Typical patterns include checkerboard, inverse checkerboard, walking ones, walking zeros, butterfly and more. A few are shown below.',
      ),
      loc(
        '存储器要跑的图形多，测试时间长。为了降低测试成本、提高产出，Memory 测试机通常同时并测很多颗。',
        'Memories run many patterns and take a long time to test. To cut test cost and raise throughput, memory testers usually test many devices in parallel.',
      ),
    ],
  },
  {
    id: 'ana',
    title: loc('模拟（线性）测试机', 'Analog (linear) tester'),
    sub: loc('µV · pA', 'µV · pA'),
    text: loc(
      '模拟器件需要非常精确地加、测电压和电流，有时要到微伏、皮安级，几乎不需要数字激励。',
      'Analog devices need very precise forcing and measuring of voltage and current, sometimes down to microvolts and picoamps, with almost no digital stimulus.',
    ),
    explain: [
      loc(
        '模拟器件的 DC 参数和数字电路完全不同，要用专门的仪器。模拟测试系统常用机架式仪器，按要测的器件专门挑选搭配。',
        'Analog DC parameters are completely different from digital ones and need specialized instruments. Analog test systems often use rack-mounted instruments chosen specifically for the devices to be tested.',
      ),
      loc(
        '典型参数：增益、输入失调电流和电压、线性度、共模抑制、电源抑制、动态响应、频率响应、建立时间、过冲、谐波失真、信噪比、响应时间、串扰、相邻通道干扰、精度、噪声。',
        'Typical parameters: gain, input offset current and voltage, linearity, common-mode rejection, power supply rejection, dynamic response, frequency response, settling time, overshoot, harmonic distortion, signal-to-noise ratio, response time, crosstalk, adjacent channel interference, accuracy and noise.',
      ),
    ],
  },
  {
    id: 'mix',
    title: loc('混合信号测试机', 'Mixed-signal tester'),
    sub: loc('数字 + 模拟', 'Digital + analog'),
    text: loc('同时带有测数字和测模拟的设备。', 'Equipment that can test both digital and analog circuitry.'),
    explain: [
      loc(
        'Big D Little A 测试机：面向以数字为主的电路，DC 和功能测试很强，只支持少量模拟测试。',
        'Big D Little A tester: aimed at mostly digital circuits, strong in DC and functional test, with limited analog test capability.',
      ),
      loc(
        'Big A Little D 测试机：面向以模拟为主的电路，模拟参数测得很准，功能测试能力很有限。',
        'Big A Little D tester: aimed at mostly analog circuits, measuring analog parameters very accurately, with very limited functional test capability.',
      ),
    ],
  },
  {
    id: 'dig',
    title: loc('数字测试机', 'Digital tester'),
    sub: loc('从台式到高端', 'Bench-top to high end'),
    text: loc(
      '只含数字电路的器件用数字测试机测。价格、性能、体积、选件差别非常大。',
      'Devices containing only digital circuitry are tested on digital testers, which vary enormously in price, performance, size and options.',
    ),
    explain: [
      loc(
        '低端是台式（bench-top）测试机：管脚少、复杂度低，最高约 20 MHz，能存的图形有限，测 SSI / MSI 小中规模电路。',
        'At the low end are bench-top testers: few pins, low complexity, up to about 20 MHz, limited pattern storage, for SSI / MSI circuits.',
      ),
      loc(
        '高端是超快、超多管脚的系统：测试频率可到 400 MHz，最多 1024 个通道，时序资源很准，能存几百万条功能图形。常用来做新 VLSI 的特性分析，但太贵，量产时往往用不起。',
        'At the high end are very fast, very high pin-count systems: test rates up to 400 MHz, up to 1024 channels, very accurate timing and storage for millions of functional vectors. They are used to characterize new VLSI devices but are often too expensive for production.',
      ),
      loc(
        '中端是行业的“老黄牛”：50–100 MHz，最多 256 通道，性能和成本搭配得最合适。',
        'The mid range is the industry "workhorse": 50–100 MHz, up to 256 channels, the best balance of performance and cost.',
      ),
    ],
  },
]

export type MemPat = 'checker' | 'inv' | 'walk1' | 'walk0'

export const MEM_PATS: Array<{ id: MemPat; label: LText | string; text: LText }> = [
  {
    id: 'checker',
    label: loc('棋盘格', 'Checkerboard'),
    text: loc(
      '相邻单元写相反的值，像棋盘一样。专抓相邻单元之间的短路和干扰。',
      'Adjacent cells are written with opposite values, like a checkerboard. It targets shorts and interference between neighboring cells.',
    ),
  },
  {
    id: 'inv',
    label: loc('反棋盘格', 'Inverse checker'),
    text: loc(
      '把棋盘格整体取反再写一遍，保证每个单元 0 和 1 都被验证过。',
      'The checkerboard is inverted and written again, so every cell is verified with both 0 and 1.',
    ),
  },
  {
    id: 'walk1',
    label: 'Walking 1',
    text: loc(
      '全 0 背景里只有一个 1，一格一格往前走。检查写一个单元会不会影响别的单元。',
      'A single 1 in a background of 0s moves forward one cell at a time. It checks whether writing one cell disturbs other cells.',
    ),
  },
  {
    id: 'walk0',
    label: 'Walking 0',
    text: loc(
      '全 1 背景里只有一个 0，一格一格往前走，是 walking 1 的反向版本。',
      'A single 0 in a background of 1s moves forward one cell at a time; the inverse of walking 1.',
    ),
  },
]

export type TierId = 'bench' | 'mid' | 'high'

export const TIERS: Array<{ id: TierId; name: LText; maxF: number; maxPins: number; range: string; cost: LText }> = [
  { id: 'bench', name: loc('低端台式', 'Bench-top'), maxF: 20, maxPins: 64, range: '≤ 20 MHz', cost: loc('低', 'Low') },
  { id: 'mid', name: loc('中端', 'Mid range'), maxF: 100, maxPins: 256, range: '50–100 MHz, ≤ 256 ch', cost: loc('中', 'Medium') },
  { id: 'high', name: loc('高端', 'High end'), maxF: 400, maxPins: 1024, range: '≤ 400 MHz, ≤ 1024 ch', cost: loc('高', 'High') },
]

export function recommendTier(f: number, pins: number): TierId | null {
  const tier = TIERS.find((item) => f <= item.maxF && pins <= item.maxPins)
  return tier ? tier.id : null
}

export const TIER_NOTE = loc(
  '台式机的管脚上限教材没有给具体数字，这里按 64 通道示意。',
  'The textbook gives no exact pin limit for bench-top testers; 64 channels is used here for illustration.',
)

export const COST_TEXT = loc(
  '测试成本对半导体行业极其敏感，会在器件总制造成本里占很大一块。测试机性能要和器件需求匹配：用功能过剩的高端机，测试成本太高；用性能不够的低端机，测试覆盖不足。够用就好。',
  'Test cost is extremely sensitive in the semiconductor industry and can be a large share of total manufacturing cost. Match the tester to the device: an over-capable high-end tester makes test too expensive; an under-capable low-end tester leaves test coverage short. Just enough is best.',
)

/* ---------- 周边设备 ---------- */

export const PERIPH: Card[] = [
  {
    id: 'lb',
    title: loc('负载板', 'Load board'),
    sub: 'Loadboard / Performance board',
    text: loc(
      '测试头和被测器件之间的机械 + 电气接口，把管脚电子卡的信号送到 DUT。',
      'The mechanical and electrical interface between the test head and the device under test, carrying signals from the pin electronics cards to the DUT.',
    ),
    explain: [
      loc(
        '负载板把测试头接到被测器件。晶圆测试时它接探针卡；手测时测试座装在它上面；量产时它和分选机对接。要配合的设备五花八门，所以负载板种类也很多。',
        'The load board connects the test head to the device under test. At wafer sort it connects to the probe card; for hand test the socket is mounted on it; in production it docks to the handler. With so many kinds of equipment to match, there are many kinds of load boards.',
      ),
      loc(
        '测高速或大电流器件时要用定制负载板：走线必须阻抗匹配，保证信号完整性；各路信号常做等长，保证时序一致。定制负载板很贵，设计制造往往要几个月。',
        'High-speed or high-current devices need custom load boards: traces must be impedance matched for signal integrity, and signal paths are often length matched for consistent timing. Custom load boards are expensive and often take months to design and build.',
      ),
    ],
  },
  {
    id: 'prober',
    title: loc('探针台', 'Prober'),
    sub: 'Wafer prober',
    text: loc(
      '晶圆测试时，测试头翻过来压在探针台上，探针台负责搬晶圆、对准、让每颗 die 依次接触探针卡。',
      'For wafer sort the test head flips over onto the prober, which handles the wafers, aligns them and brings each die into contact with the probe card in turn.',
    ),
    explain: [
      loc(
        '晶圆测试时测试头翻转朝下，和探针台上装探针卡的接口组件对接，所以也叫 flip head sort。晶圆放在承片台（chuck）上，和探针卡对准后逐颗接触。',
        'During wafer sort the test head flips face down and docks to the probe card interface on the prober, hence the name flip head sort. The wafer sits on the chuck, is aligned to the probe card and contacted die by die.',
      ),
      loc(
        '早年晶圆一片片手动放上去，由熟练的操作员手动对准；测试区是敞开的，光和污染都能进来。后来发现有些参数会受光照影响而失效；器件尺寸越来越小，污染会导致参数漂移、失效，缩短器件寿命。',
        'In the early days wafers were loaded one by one and aligned by hand by skilled operators; the test area was open to light and contamination. It was later found that some parameters fail under light, and as geometries shrank, contamination caused parameter shifts, failures and shorter device life.',
      ),
      loc(
        '现在的探针台全封闭，光和污染都进不去。晶圆出厂时装在叫 boat 的保护盒里，一盒约 25 片，整盒放进探针台，搬运和对准全部自动完成。',
        'Modern probers are fully enclosed, keeping out light and contamination. Wafers leave the fab in protective carriers called boats, about 25 wafers each; the whole boat goes into the prober, and handling and alignment are fully automatic.',
      ),
      loc(
        '现代探针台也能打墨点，但很多公司改用电子晶圆图。它们非常可靠，基本不再需要熟练的探针操作员。',
        'Modern probers can still ink, but many companies now use electronic wafer maps. They are very reliable and no longer need skilled probe operators.',
      ),
    ],
  },
  {
    id: 'pc',
    title: loc('探针卡', 'Probe card'),
    sub: 'Probe card',
    text: loc('把测试头的电子资源连到 die 的每个 pad。', 'Connects the electronic resources of the test head to every pad on the die.'),
    explain: [
      loc(
        '探针卡机械上固定在测试头上。测试资源先经过有弹性的 pogo pin 接到探针卡背面，再沿板内走线到达每根探针，探针扎在 die 的 bond pad 上。',
        'The probe card is mechanically fixed to the test head. Tester resources pass through spring-loaded pogo pins to the back of the probe card, then along traces to each needle, which lands on a bond pad of the die.',
      ),
      loc(
        '有的探针卡直接做在负载板上，有的通过插座接到负载板。',
        'Some probe cards are built directly onto the load board; others connect to it through a socket.',
      ),
    ],
  },
  {
    id: 'handler',
    title: loc('分选机', 'Handler'),
    sub: 'Device handler',
    text: loc(
      '自动上料、送到测试位、按结果分 Bin 的机器。下面可以自己“开机”试试。',
      'A machine that loads parts automatically, delivers them to the test site and bins them by result. Try "running" one below.',
    ),
    explain: [
      loc(
        '封装种类有多少，分选机的样式就有多少。封装好的芯片放在料管或托盘里送到测试区，装进分选机的料仓。',
        'There are as many handler styles as there are package types. Packaged chips arrive at the test area in tubes or trays and are loaded into the handler input.',
      ),
      loc(
        '分选机挑一颗未测芯片送到接触区，插进接触器（contactor）。分选机发出“准备好了”，测试系统才开始测并做 Pass / Fail 判定，然后把 Bin 号告诉分选机。',
        'The handler takes an untested chip to the contact area and inserts it into the contactor. When the handler signals "ready", the test system tests it, makes the Pass / Fail decision, and tells the handler the bin number.',
      ),
      loc(
        '很多分选机带温度箱，可以在非室温下测试。能放多少个 Bin，受机器的物理尺寸限制。',
        'Many handlers have temperature chambers for testing away from room temperature. The number of bins is limited by the physical size of the machine.',
      ),
    ],
  },
  {
    id: 'temp',
    title: loc('温度强制单元', 'Temperature forcing unit'),
    sub: 'Temperature forcing unit',
    text: loc(
      '把一个温度罩扣在芯片上，按设定值加热或冷却。手测时控温的最佳办法。',
      'A thermal hood placed over the chip heats or cools it to a set point; the best way to control temperature during hand test.',
    ),
    explain: [
      loc(
        '有些器件规格要求在 −55 °C 到 +125 °C 都能正常工作，就得在不同温度下测。',
        'Some device specifications require correct operation from −55 °C to +125 °C, so they must be tested at different temperatures.',
      ),
      loc(
        '过去加热用手持热探头：费时、把手会烫、和芯片很难接触好，温度也控不准。降温用干冰或液氮：干冰约 −60 °C，而规格通常要 −55 °C 或 0 °C，根本控不准；还经常临时找不到干冰。',
        'In the past, heating used a hand-held heat probe: slow, hot to hold, hard to keep in good contact with the chip, and imprecise. Cooling used dry ice or liquid nitrogen: dry ice is about −60 °C while specs usually call for −55 °C or 0 °C, so control was impossible; and dry ice was often unavailable when needed.',
      ),
      loc(
        '温度强制系统可编程、精确、完全自给，只需要接电，是手测座上加热或冷却器件最好的办法。',
        'A temperature forcing system is programmable, accurate and fully self-contained, needing only power; it is the best way to heat or cool a device in a hand-test socket.',
      ),
    ],
  },
]

export type BinMode = 'min' | 'full'
export type BinCat = 's200' | 's166' | 's100' | 'dc' | 'ac' | 'func'

export const BIN_CATS: Array<{ id: BinCat; label: LText; good: boolean }> = [
  { id: 's200', label: loc('好品 200 MHz', 'Good 200 MHz'), good: true },
  { id: 's166', label: loc('好品 166 MHz', 'Good 166 MHz'), good: true },
  { id: 's100', label: loc('好品 100 MHz', 'Good 100 MHz'), good: true },
  { id: 'dc', label: loc('DC 坏品', 'DC reject'), good: false },
  { id: 'ac', label: loc('AC 坏品', 'AC reject'), good: false },
  { id: 'func', label: loc('功能坏品', 'Func reject'), good: false },
]

export function randomCat(): BinCat {
  const r = Math.random()
  if (r < 0.18) return 's200'
  if (r < 0.48) return 's166'
  if (r < 0.76) return 's100'
  if (r < 0.84) return 'dc'
  if (r < 0.92) return 'ac'
  return 'func'
}

export const HANDLER_TOTAL = 30

export const BIN_TEXT: Record<BinMode, LText> = {
  min: loc('分选机至少要 3 个 Bin：未测、好品、坏品。', 'A handler needs at least 3 bins: untested, good and reject.'),
  full: loc(
    'Bin 多了更方便：坏品按 DC / AC / 功能分开，便于分析失效原因；好品按速度分档（100 / 166 / 200 MHz），快的能卖更高价。',
    'More bins are more useful: rejects split by DC / AC / functional make failure analysis easier, and good parts sorted by speed (100 / 166 / 200 MHz) let the fast ones sell for more.',
  ),
}

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc(
    '芯片测两次：晶圆上测（probe / die sort，探针卡 + 负载板），封装后再测（final test，手测座或分选机），成品可能要测多个温度。',
    'Chips are tested twice: on the wafer (probe / die sort, probe card + load board) and after packaging (final test, hand socket or handler); final test may run at several temperatures.',
  ),
  loc(
    '坏 die 用墨点或电子晶圆图标记；bond pad 上的 probe mark 证明探针扎到了。',
    'Bad dice are marked with ink dots or an electronic wafer map; probe marks on the bond pads prove the probes made contact.',
  ),
  loc('ATE = 仪器 + 计算机 + 测试程序，靠定期校准保证结果一致。', 'ATE = instruments + computer + test program, kept consistent by regular calibration.'),
  loc(
    '测试机分 Memory、模拟、混合信号、数字四类；性能和器件需求匹配，够用就好，测试成本才可控。',
    'Testers fall into four classes: memory, analog, mixed-signal and digital. Match performance to the device; just enough keeps test cost under control.',
  ),
  loc(
    '负载板要阻抗匹配、等长；探针台全封闭防光防污染；分选机至少 3 个 Bin。',
    'Load boards need impedance and length matching; probers are fully enclosed against light and contamination; a handler needs at least 3 bins.',
  ),
  loc(
    'Fab 工艺主线与封装形态预习见 {@pSilicon}、{@pPackage}；DUT 怎么接到 ATE 的 3D 细节见 {@connection}。',
    'Preview the fab process spine and package shapes in {@pSilicon}, {@pPackage}; 3D DUT-to-ATE hookup is in {@connection}.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('晶圆测试中不合格的 die，常见的标记方式是？', 'How are failing dice usually marked during wafer sort?'),
    options: [
      { id: 'a', text: loc('打墨点，或记录到电子晶圆图', 'An ink dot, or a record in an electronic wafer map') },
      { id: 'b', text: loc('立刻用激光切掉', 'Cut out immediately with a laser') },
      { id: 'c', text: loc('在 bond pad 上留下 probe mark', 'A probe mark left on the bond pad') },
      { id: 'd', text: loc('不需要标记，封装后再挑', 'No marking; sort them after packaging') },
    ],
    answer: 'a',
    explain: loc(
      '传统做法是打墨点，划片后打墨点的 die 报废；现在很多公司用电子晶圆图记录好坏位置。probe mark 是每颗被扎过的 die 都会有的，不代表好坏。',
      'Traditionally bad dice are inked and scrapped after sawing; many companies now record good/bad locations in an electronic wafer map. Every probed die has probe marks, so they say nothing about good or bad.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('军用器件的成品测试，通常在哪几个温度下测？', 'At which temperatures is final test of military devices usually done?'),
    options: [
      { id: 'a', text: loc('−55 °C、25 °C、125 °C', '−55 °C, 25 °C, 125 °C') },
      { id: 'b', text: loc('0 °C、25 °C、70 °C', '0 °C, 25 °C, 70 °C') },
      { id: 'c', text: loc('只在 25 °C', 'Only at 25 °C') },
      { id: 'd', text: loc('−60 °C、25 °C、150 °C', '−60 °C, 25 °C, 150 °C') },
    ],
    answer: 'a',
    explain: loc(
      '军品是 −55 / 25 / 125 °C；0 / 25 / 70 °C 是商用级。对温度敏感的参数要在多个温度下分别保证。',
      'Military grade is −55 / 25 / 125 °C; 0 / 25 / 70 °C is commercial grade. Temperature-sensitive parameters must be guaranteed at each temperature.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('Memory 测试机为什么用 APG？', 'Why does a memory tester use an APG?'),
    options: [
      {
        id: 'a',
        text: loc(
          '棋盘格、walking 等图形可以由硬件现场算出来，不必预先存成大量向量',
          'Checkerboard, walking and similar patterns can be computed in hardware on the fly instead of stored as huge vector sets',
        ),
      },
      { id: 'b', text: loc('因为 APG 能测微伏级电压', 'Because an APG can measure microvolt-level voltages') },
      { id: 'c', text: loc('因为存储器没有 DC 参数', 'Because memories have no DC parameters') },
      { id: 'd', text: loc('因为 APG 比向量存储器更便宜', 'Because an APG is cheaper than vector memory') },
    ],
    answer: 'a',
    explain: loc(
      '存储器的功能图形很有规律，又非常长。APG 每次测试时在硬件里实时生成，而普通数字测试机要把预先生成的向量存在向量存储器里再读出来。',
      'Memory functional patterns are very regular and very long. An APG generates them in hardware in real time during each test, whereas an ordinary digital tester must store pre-generated vectors in vector memory and read them back.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '一颗数字芯片最高 80 MHz、160 个管脚。按教材的分档，量产最合适的是？',
      'A digital chip runs up to 80 MHz and has 160 pins. By the textbook tiers, which is best for production?',
    ),
    options: [
      { id: 'a', text: loc('中端测试机（50–100 MHz，≤ 256 通道）', 'Mid-range tester (50–100 MHz, ≤ 256 channels)') },
      { id: 'b', text: loc('高端测试机，越快越保险', 'High-end tester; faster is safer') },
      { id: 'c', text: loc('低端台式测试机', 'Low-end bench-top tester') },
      { id: 'd', text: loc('模拟测试机', 'Analog tester') },
    ],
    answer: 'a',
    explain: loc(
      '台式机最高约 20 MHz，测不了；高端机能测但贵，测试成本过高。中端机刚好覆盖 80 MHz、160 管脚，性能和成本最匹配。',
      'A bench-top tester tops out around 20 MHz and cannot do it; a high-end tester can but is expensive, making test cost too high. A mid-range tester just covers 80 MHz and 160 pins, the best match of performance and cost.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('分选机最少需要几个 Bin？', 'What is the minimum number of bins a handler needs?'),
    options: [
      { id: 'a', text: loc('3 个：未测、好品、坏品', '3: untested, good, reject') },
      { id: 'b', text: loc('2 个：好品、坏品', '2: good, reject') },
      { id: 'c', text: loc('6 个：按速度和失效类型分', '6: by speed and failure type') },
      { id: 'd', text: loc('1 个', '1') },
    ],
    answer: 'a',
    explain: loc(
      '未测芯片要有地方放，测完要分好坏，所以至少 3 个。按 DC / AC / 功能或速度档细分是“有了更好”，数量受机器物理尺寸限制。',
      'Untested chips need a place, and tested ones must be split into good and bad, so at least 3. Finer sorting by DC / AC / functional or speed grade is "nice to have", limited by the physical size of the machine.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('现代探针台为什么要做成全封闭？', 'Why are modern probers fully enclosed?'),
    options: [
      {
        id: 'a',
        text: loc(
          '光照会影响某些参数，污染会让参数漂移、器件失效、寿命缩短',
          'Light affects some parameters, and contamination causes parameter shifts, failures and shorter life',
        ),
      },
      { id: 'b', text: loc('为了降低噪音', 'To reduce acoustic noise') },
      { id: 'c', text: loc('为了让操作员看不到晶圆', 'So operators cannot see the wafer') },
      { id: 'd', text: loc('为了省电', 'To save power') },
    ],
    answer: 'a',
    explain: loc(
      '有些测试参数会受光影响而误判失效；器件尺寸越小，污染的危害越大。所以晶圆装在 boat 里整盒进机，全程封闭、自动搬运和对准。',
      'Some parameters are affected by light and can falsely fail; the smaller the geometry, the more harmful contamination is. So wafers enter the machine in a boat, fully enclosed, with automatic handling and alignment.',
    ),
  },
]
