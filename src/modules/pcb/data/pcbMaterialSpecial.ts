import { loc, type LText } from '../../../i18n/locale'

export type SpecialId = 'fr4' | 'lowloss' | 'rogers' | 'ptfe' | 'alu' | 'ceramic'
export type MetricId = 'dk' | 'df' | 'k' | 'cost'

export type SpecialMat = {
  id: SpecialId
  name: LText
  short: LText
  dk: number
  df: number
  /** 热导率 W/(m·K)，铝基板填的是介质层 */
  k: number
  cost: number
  what: LText
  use: LText
  price: LText
}

export const SPECIALS: SpecialMat[] = [
  {
    id: 'fr4',
    name: loc('普通 FR-4（对照）', 'Ordinary FR-4 (reference)'),
    short: loc('普通 FR-4', 'Ordinary FR-4'),
    dk: 4.3,
    df: 0.02,
    k: 0.3,
    cost: 1,
    what: loc('玻纤布 + 环氧树脂，Dk 约 4.3、Df 约 0.02，热导率只有约 0.3 W/(m·K)，是后面所有材料的对照。', 'Glass cloth + epoxy with Dk ≈ 4.3, Df ≈ 0.02 and thermal conductivity only ≈ 0.3 W/(m·K); the reference for everything below.'),
    use: loc('绝大多数数字和低频模拟板。', 'Most digital and low-frequency analogue boards.'),
    price: loc('最便宜，工艺最成熟，所有板厂都会做。', 'Cheapest and best known; every fab can make it.'),
  },
  {
    id: 'lowloss',
    name: loc('低损耗高速板材', 'Low-loss high-speed laminate'),
    short: loc('低损耗板材', 'Low-loss laminate'),
    dk: 3.7,
    df: 0.006,
    k: 0.4,
    cost: 2.5,
    what: loc('改性环氧或其它树脂加玻纤，仍然用 FR-4 的工艺，但把 Df 降到 0.01 以下，Dk 也更稳。', 'Modified epoxy or other resins with glass, still processed like FR-4 but with Df brought below 0.01 and a steadier Dk.'),
    use: loc('10 Gbps 以上的服务器、交换机背板和高速串行链路。', 'Servers, switch backplanes and serial links above 10 Gbps.'),
    price: loc('比 FR-4 贵 2–3 倍，但不需要特殊工艺，常和 FR-4 混压。', '2–3 times the cost of FR-4, but needs no special process and is often hybridised with FR-4.'),
  },
  {
    id: 'rogers',
    name: loc('Rogers RO4350B（碳氢陶瓷）', 'Rogers RO4350B (hydrocarbon ceramic)'),
    short: loc('Rogers RO4350B', 'Rogers RO4350B'),
    dk: 3.48,
    df: 0.0037,
    k: 0.69,
    cost: 5,
    what: loc('填了陶瓷的碳氢树脂加玻纤，Dk 约 3.48、Df 约 0.0037（10 GHz），Dk 随温度和频率变化很小。', 'Ceramic-filled hydrocarbon resin with glass: Dk ≈ 3.48, Df ≈ 0.0037 at 10 GHz, with very little drift over temperature and frequency.'),
    use: loc('2–30 GHz 的射频、天线、功率放大器。', 'RF, antennas and power amplifiers from 2 to 30 GHz.'),
    price: loc('贵 3–6 倍；常只在射频层用 Rogers，其余层用 FR-4，做成混合叠层来省钱。', '3–6 times the cost; often only the RF layers use Rogers and the rest FR-4 in a hybrid stack-up to save money.'),
  },
  {
    id: 'ptfe',
    name: loc('PTFE（聚四氟乙烯）板材', 'PTFE (polytetrafluoroethylene) laminate'),
    short: loc('PTFE 板材', 'PTFE laminate'),
    dk: 2.2,
    df: 0.0009,
    k: 0.2,
    cost: 10,
    what: loc('以聚四氟乙烯为树脂，Dk 约 2.2、Df 不到 0.001，是损耗最小的一类，但很软、热膨胀大。', 'Uses PTFE as the resin with Dk ≈ 2.2 and Df below 0.001, the lowest-loss class, but it is soft and expands a lot.'),
    use: loc('微波、毫米波雷达和卫星通信。', 'Microwave and millimetre-wave radar and satellite links.'),
    price: loc('贵约 10 倍；孔壁要先做等离子处理才能镀上铜，加工难、良率低。', 'About 10 times the cost; hole walls need plasma treatment before copper will plate, so it is hard to process with lower yield.'),
  },
  {
    id: 'alu',
    name: loc('铝基板（金属基板）', 'Aluminium-base board (metal-core)'),
    short: loc('铝基板介质层', 'Al-base dielectric'),
    dk: 4.2,
    df: 0.02,
    k: 2,
    cost: 1.5,
    what: loc('铜线路 + 很薄（约 50–150 µm）的导热绝缘层 + 1–3 mm 的铝板。热从元件经薄介质层传到铝板再散出去，介质层热导率约 1–3 W/(m·K)，比 FR-4 高一个量级。', 'Copper circuit + a thin (≈ 50–150 µm) thermally conductive insulator + a 1–3 mm aluminium plate. Heat goes from the part through the thin dielectric into the aluminium and out; the dielectric is about 1–3 W/(m·K), an order of magnitude above FR-4.'),
    use: loc('LED 照明、电源模块、电机驱动。', 'LED lighting, power modules and motor drives.'),
    price: loc('比 FR-4 贵约 1.5 倍；多是单面，不方便做多层，也不适合高速信号。', 'About 1.5 times FR-4; mostly single-sided, awkward for multilayers and unsuitable for high-speed signals.'),
  },
  {
    id: 'ceramic',
    name: loc('氮化铝陶瓷基板', 'Aluminium-nitride ceramic substrate'),
    short: loc('氮化铝陶瓷', 'AlN ceramic'),
    dk: 8.8,
    df: 0.001,
    k: 170,
    cost: 20,
    what: loc('用陶瓷（AlN）当绝缘基板，铜直接结合在上面，热导率约 170 W/(m·K)，热膨胀接近硅芯片。', 'Ceramic (AlN) as the insulating substrate with copper bonded directly onto it; thermal conductivity ≈ 170 W/(m·K) and expansion close to silicon.'),
    use: loc('大功率激光器、IGBT 模块、车载功率器件。', 'High-power lasers, IGBT modules and automotive power devices.'),
    price: loc('贵十几倍，又脆，面积做不大。', 'More than ten times the cost, brittle, and limited in size.'),
  },
]

export const METRICS: Array<{
  id: MetricId
  label: LText
  scale: 'lin' | 'log'
  unit: string
  note: LText
}> = [
  { id: 'dk', label: loc('介电常数 Dk', 'Dielectric constant Dk'), scale: 'lin', unit: '', note: loc('Dk 越小，信号在板里传得越快、同样线宽的阻抗越高；更要紧的是它别随频率和温度乱漂。', 'A lower Dk lets a signal travel faster and gives higher impedance for the same width; what matters more is that it does not drift with frequency and temperature.') },
  { id: 'df', label: loc('损耗角正切 Df', 'Loss tangent Df'), scale: 'log', unit: '', note: loc('Df 是介质每个周期吃掉的能量比例；越小，高频信号衰减越少。竖条用对数刻度，因为差了二十倍。', 'Df is the fraction of energy the dielectric absorbs each cycle; smaller means less high-frequency attenuation. The bars use a log scale because the values differ by twenty times.') },
  { id: 'k', label: loc('热导率（W/m·K）', 'Thermal conductivity (W/m·K)'), scale: 'log', unit: ' W/m·K', note: loc('热导率越大，热越容易从发热元件传走。FR-4 约 0.3，铝基板介质层约 2，氮化铝约 170；对数刻度。', 'The higher the conductivity, the easier heat leaves a hot part. FR-4 is about 0.3, an aluminium-base dielectric about 2 and AlN about 170; log scale.') },
  { id: 'cost', label: loc('相对成本（FR-4 = 1）', 'Relative cost (FR-4 = 1)'), scale: 'log', unit: '×', note: loc('同样面积的板材价格相对 FR-4 的倍数，示意值；越特殊越贵，加工难度也越高。', 'Board price for the same area relative to FR-4, an illustrative value; the more special the material, the higher both the price and the processing difficulty.') },
]

export const metricOf = (m: SpecialMat, id: MetricId): number => m[id]

/** 条形占比：线性从 0 起，对数从最小值的一半起 */
export function barFrac(metric: MetricId, v: number): number {
  const spec = METRICS.find((x) => x.id === metric) ?? METRICS[0]
  const vals = SPECIALS.map((m) => metricOf(m, metric))
  const hi = Math.max(...vals)
  if (spec.scale === 'lin') {
    return v / hi
  }
  const lo = Math.min(...vals) / 2
  return Math.log(v / lo) / Math.log(hi / lo)
}

export const CONCERNS: Array<{ id: string; title: LText; text: LText }> = [
  {
    id: 'cost',
    title: loc('成本', 'Cost'),
    text: loc(
      '板材等级（标准 FR-4 → 高 Tg → 低损耗 → PTFE）、铜厚、层数和表面处理（OSP < HASL < 沉银 < ENIG）都会加价。常见做法是：能用标准 FR-4 加 HASL 或 OSP 就不升级；一定要升级，也只升级需要的那几层，用混合叠层。',
      'Laminate grade (standard FR-4 → high Tg → low loss → PTFE), copper weight, layer count and finish (OSP < HASL < immersion silver < ENIG) all add cost. The usual approach is not to upgrade when standard FR-4 with HASL or OSP will do; when you must, upgrade only the layers that need it with a hybrid stack-up.',
    ),
  },
  {
    id: 'rel',
    title: loc('可靠性', 'Reliability'),
    text: loc(
      'Tg 和分解温度决定能撑几次无铅回流和多高的工作温度；Z 向膨胀与铜孔壁是否匹配，决定温度循环时孔壁会不会拉裂；CTI 决定高压潮湿时会不会起痕；表面处理的保存期决定库存多久之后还能焊。',
      'Tg and decomposition temperature decide how many lead-free reflows and how much operating temperature it survives; how well Z-axis expansion matches the copper barrel decides whether barrels crack in thermal cycling; CTI decides whether tracking starts under high voltage and humidity; finish shelf life decides how long stock can wait before soldering.',
    ),
  },
  {
    id: 'speed',
    title: loc('高速性能', 'High-speed performance'),
    text: loc(
      '频率越高，介质损耗 Df 和介电常数 Dk 的稳定性越要紧。FR-4 的 Df 约 0.02，到 10 GHz 每英寸的损耗已经明显；还要留意玻纤编织疏密造成的时延差，以及铜箔粗糙度：粗糙的箔在趋肤效应下损耗更大，所以高速板用低粗糙度铜箔。',
      'The higher the frequency, the more dielectric loss Df and a stable Dk matter. FR-4 has Df ≈ 0.02, so the loss per inch is already clear at 10 GHz; also watch the skew from uneven glass weave and the copper roughness: rough foil loses more under the skin effect, so high-speed boards use low-roughness foil.',
    ),
  },
]

export type ScenarioId = 'toy' | 'ctrl' | 'rf' | 'led' | 'power'

export const SCENARIOS: Array<{
  id: ScenarioId
  label: LText
  base: LText
  copper: LText
  finish: LText
  why: LText
}> = [
  {
    id: 'toy',
    label: loc('低价消费类（2 层）', 'Low-cost consumer (2-layer)'),
    base: loc('标准 Tg FR-4', 'Standard-Tg FR-4'),
    copper: loc('1 oz', '1 oz'),
    finish: loc('OSP 或无铅 HASL', 'OSP or lead-free HASL'),
    why: loc('量大、价格敏感，没有细间距和高速信号，板子很快焊完，所以选最便宜又够用的组合；OSP 平，HASL 耐返修。', 'High volume and price-sensitive with no fine pitch or high-speed signals, and the board is soldered soon after fabrication, so pick the cheapest adequate combination; OSP is flat and HASL tolerates rework.'),
  },
  {
    id: 'ctrl',
    label: loc('工控 / 通信板（带 BGA）', 'Industrial / comms board (with BGA)'),
    base: loc('中 Tg FR-4（150 °C 左右）', 'Mid-Tg FR-4 (about 150 °C)'),
    copper: loc('外层 1 oz，内层 0.5 oz', 'Outer 1 oz, inner 0.5 oz'),
    finish: loc('ENIG', 'ENIG'),
    why: loc('层数多，要过无铅回流还可能返修，需要更高的 Tg；BGA 的焊盘必须平，ENIG 平整、保存也久。', 'More layers and lead-free reflow with possible rework need a higher Tg; BGA pads must be flat, and ENIG is flat and keeps well.'),
  },
  {
    id: 'rf',
    label: loc('射频 / 天线（5 GHz 以上）', 'RF / antenna (above 5 GHz)'),
    base: loc('Rogers 射频层 + FR-4 混压', 'Rogers RF layers hybridised with FR-4'),
    copper: loc('0.5–1 oz，低粗糙度铜箔', '0.5–1 oz, low-roughness foil'),
    finish: loc('沉银或 ENIG', 'Immersion silver or ENIG'),
    why: loc('射频走线损耗直接吃掉信号，要用低 Dk、低 Df 的板材；只在射频层用它，其余用 FR-4 省钱；沉银没有磁性的镍，高频损耗更小。', 'Loss on RF traces eats the signal directly, so use a low-Dk, low-Df laminate; use it only on the RF layers and FR-4 elsewhere to save money; immersion silver has no magnetic nickel, so its high-frequency loss is lower.'),
  },
  {
    id: 'led',
    label: loc('LED 照明灯板', 'LED lighting board'),
    base: loc('铝基板', 'Aluminium-base board'),
    copper: loc('1–2 oz', '1–2 oz'),
    finish: loc('HASL 或 OSP', 'HASL or OSP'),
    why: loc('LED 发热集中，热要通过介质层传到铝板散掉，热导率比 FR-4 高一个量级；单面板就够，所以选铝基板。', 'LED heat is concentrated and must pass through the dielectric into the aluminium plate; its conductivity is an order of magnitude above FR-4; a single-sided board is enough, so choose an aluminium base.'),
  },
  {
    id: 'power',
    label: loc('接市电的电源板', 'Mains-powered supply'),
    base: loc('高 CTI 的 FR-4（CTI ≥ 400 V）', 'High-CTI FR-4 (CTI ≥ 400 V)'),
    copper: loc('2 oz', '2 oz'),
    finish: loc('HASL', 'HASL'),
    why: loc('大电流要厚铜；高压加潮湿容易起痕，高 CTI 板材能让爬电距离更短；焊盘大、间距宽，HASL 就够。', 'Large current needs thick copper; high voltage plus humidity encourages tracking, and high-CTI laminate allows shorter creepage; pads are big and widely spaced, so HASL is enough.'),
  },
]

export type MaskItemId = 'opening' | 'dam' | 'silkOk' | 'silkBad'

export const MASK_ITEMS: Array<{ id: MaskItemId; name: LText; text: LText }> = [
  {
    id: 'opening',
    name: loc('阻焊开窗', 'Mask opening'),
    text: loc(
      '阻焊在焊盘位置“挖”出的洞，露出下面的铜（再镀表面处理）。开窗一般比焊盘每边大约 0.05–0.1 mm，留给对位误差：开窗太小，阻焊会压到焊盘边缘；太大，会露出旁边的走线。',
      'The hole the mask leaves over a pad, exposing the copper underneath (which then gets the finish). The opening is usually about 0.05–0.1 mm bigger than the pad on each side to allow for registration error: too small and mask creeps onto the pad edge, too large and it exposes the neighbouring trace.',
    ),
  },
  {
    id: 'dam',
    name: loc('阻焊桥', 'Mask dam'),
    text: loc(
      '两个相邻焊盘的开窗之间留下的那一小条阻焊，焊锡过不去，才不会桥连。板厂一般要求桥宽至少约 0.08–0.1 mm；焊盘间距太小做不出桥，这就是细间距元件容易短路的原因，这时只能把一排焊盘开成一整个大窗。',
      'The thin strip of mask left between the openings of two neighbouring pads; solder cannot cross it, so it cannot bridge. Fabs usually need a dam of at least about 0.08–0.1 mm; when pad spacing is too small no dam survives, which is why fine-pitch parts bridge easily, and the only option is to open one big window for the whole row of pads.',
    ),
  },
  {
    id: 'silkOk',
    name: loc('正确的丝印', 'Correct silkscreen'),
    text: loc(
      '丝印印在阻焊上，躲开焊盘。线宽不小于约 0.15 mm、字高不小于约 0.8 mm 才印得清楚，太细的字会糊成一团。',
      'Silkscreen sits on the mask and stays clear of the pads. A line width of at least about 0.15 mm and a character height of at least about 0.8 mm print legibly; finer text smears into a blob.',
    ),
  },
  {
    id: 'silkBad',
    name: loc('压在焊盘上的丝印', 'Silkscreen over a pad'),
    text: loc(
      '丝印油墨不可焊。多数板厂的 CAM 会把压在焊盘上的丝印自动裁掉，结果字缺一块；如果没有裁掉，焊盘被油墨盖住，就焊不上。所以丝印要在设计时就躲开焊盘。',
      'Silkscreen ink is not solderable. Most fabs’ CAM clips silkscreen that overlaps pads, leaving a missing chunk of text; if it is not clipped, the ink covers the pad and it cannot be soldered. So keep silkscreen off pads at design time.',
    ),
  },
]
