import { loc, type LText } from '../../../i18n/locale'

export type SubId = 'typ' | 'ideal' | 'poor'

export const SUB_ITEMS: Array<{ id: SubId; n: number; label: LText; title: LText; text: LText }> = [
  {
    id: 'typ',
    n: 1.4,
    label: loc('常见 n = 1.4', 'Typical n = 1.4'),
    title: loc('常见器件：约 80 到 85 mV/decade', 'Typical device: about 80 to 85 mV/decade'),
    text: loc(
      'n 是栅电容和耗尽层电容分压带来的因子，常见 1.3 到 1.5。室温下 Vgs 每少 n × 60 mV，电流才少 10 倍，约 80 mV。所以 Vgs 从 Vth 往下降 0.7 V，Id 要下降 8 个十倍频程以上。',
      'The factor n comes from the gate capacitance and depletion capacitance dividing the voltage, typically 1.3 to 1.5. At room temperature Vgs must fall by n × 60 mV for the current to drop 10 times, about 80 mV. So dropping Vgs 0.7 V below Vth lowers Id by more than 8 decades.',
    ),
  },
  {
    id: 'ideal',
    n: 1,
    label: loc('理想极限 n = 1', 'Ideal limit n = 1'),
    title: loc('理想极限：60 mV/decade', 'Ideal limit: 60 mV/decade'),
    text: loc(
      '栅极完全控制沟道势垒（n = 1）时，斜率只由 kT/q × ln10 决定，室温约 60 mV/decade。这是 MOS 管能做到的最陡，所以「再陡」要靠改变导通机理，这里不展开。',
      'When the gate fully controls the channel barrier (n = 1) the slope depends only on kT/q × ln10, about 60 mV/decade at room temperature. This is the steepest a MOSFET can do, so anything steeper needs a different conduction mechanism, not covered here.',
    ),
  },
  {
    id: 'poor',
    n: 1.7,
    label: loc('较差 n = 1.7', 'Poor n = 1.7'),
    title: loc('n = 1.7：约 100 mV/decade', 'n = 1.7: about 100 mV/decade'),
    text: loc(
      'n 越大，栅压对沟道势垒的控制越弱，曲线越平，关断后漏电流下降得越慢：同样的 Vth，Ioff 大得多。沟道很短、栅氧偏厚的器件常见这种情况。',
      'The larger n is, the weaker the gate’s control of the channel barrier, so the curve is flatter and leakage falls more slowly after turn-off: the same Vth gives a much larger Ioff. Very short channels and relatively thick oxide often look like this.',
    ),
  },
]

export const SUB_LABEL = {
  vgs: loc('栅压 Vgs', 'Gate voltage Vgs'),
  temp: loc('结温 T', 'Junction temperature T'),
  swing: loc('斜率 S（每十倍频程）', 'Slope S (per decade)'),
  id: loc('当前 Vgs 的 Id', 'Id at this Vgs'),
  ioff: loc('Ioff（Vgs = 0）', 'Ioff (Vgs = 0)'),
  ratio: loc('Ioff 相对 25 °C', 'Ioff versus 25 °C'),
  onoff: loc('Ion / Ioff', 'Ion / Ioff'),
  axisY: loc('Id（对数坐标）', 'Id (log scale)'),
  axisX: loc('Vgs（V）', 'Vgs (V)'),
  ref: loc('25 °C', '25 °C'),
  now: loc('当前温度', 'Present temperature'),
  decade: loc('1 个十倍频程', '1 decade'),
  vthMark: loc('Vth', 'Vth'),
  cap: loc(
    '示意参数：Vth = 0.7 V（25 °C），Vds = 3.3 V，Vgs = Vth 处的亚阈值电流取 100 nA，强反型沿用本轨的平方律模型；真实工艺的 Ioff 差别很大。',
    'Illustrative parameters: Vth = 0.7 V at 25 °C, Vds = 3.3 V, subthreshold current of 100 nA at Vgs = Vth, strong inversion from this track’s square-law model; Ioff in real processes varies widely.',
  ),
}

export const SUB_TEXT: LText[] = [
  loc(
    'Vgs 低于 Vth 时沟道不是「没有」，而是电子很少。电子能越过源端势垒的比例随势垒高度指数变化（玻尔兹曼分布），所以 Id 随 Vgs 指数上升，在对数坐标里是一条直线：Id = Ith × 10^((Vgs − Vth) / S)，其中 S = n × (kT/q) × ln10，每少 S 毫伏，电流少 10 倍。Vgs = 0 时的电流就是 Ioff。',
    'Below Vth the channel is not absent, it just has very few electrons. The fraction of electrons that can climb over the source barrier changes exponentially with barrier height (a Boltzmann distribution), so Id rises exponentially with Vgs and is a straight line on a log scale: Id = Ith × 10^((Vgs − Vth) / S), with S = n × (kT/q) × ln10, so each S millivolts less gives 10 times less current. The current at Vgs = 0 is Ioff.',
  ),
  loc(
    '温度升高有两个作用：S 与 kT/q 成正比，斜率变平；Vth 同时下降。两者叠加，Vgs = 0 时的势垒更低，所以 Ioff 随温度升得很快。单管只有 fA 到 pA，但芯片上有几千万个管子，加起来就是待机电流，也是 {@dc} 里 IDD 静态电流测试要抓的对象，见 {@fDc}。',
    'Higher temperature does two things: S is proportional to kT/q, so the slope flattens, and Vth falls at the same time. Together they lower the barrier at Vgs = 0, so Ioff climbs fast with temperature. One device leaks only fA to pA, but a chip has tens of millions of them, and the sum is standby current, which the static IDD test in {@dc} is designed to catch; see {@fDc}.',
  ),
]

export const TEMP_NOTE: { title: LText; text: LText } = {
  title: loc('温度同时改变三件事', 'Temperature changes three things at once'),
  text: loc(
    'Vth 约每升高 1 °C 下降 2 mV，迁移率按 T 的 −1.5 次方下降使 Rds(on) 变大，亚阈值漏电随 Vth 下降和斜率变平而指数上升。同一个温度旋钮同时影响下面的转移特性、Rds(on) 和上面的漏电曲线。',
    'Vth falls about 2 mV per °C, mobility falls as T to the power −1.5 so Rds(on) rises, and subthreshold leakage grows exponentially as Vth falls and the slope flattens. The same temperature knob drives the transfer curve and Rds(on) below and the leakage curve above.',
  ),
}

export const TEMP_LABEL = {
  temp: loc('结温 T', 'Junction temperature T'),
  vth: loc('Vth（本轨模型）', 'Vth (track model)'),
  rds: loc('Rds(on) 示例', 'Rds(on) example'),
  ratio: loc('Rds(on) 相对 25 °C', 'Rds(on) versus 25 °C'),
  ztc: loc('温度补偿点约在 Vgs =', 'Compensation point at Vgs ≈'),
  share: loc('并联分流 A / B', 'Parallel split A / B'),
  axisY: loc('Id（mA）', 'Id (mA)'),
  axisX: loc('Vgs（V）', 'Vgs (V)'),
  now: loc('当前温度', 'Present temperature'),
  ref: loc('25 °C', '25 °C'),
  ztcTag: loc('温度补偿点', 'Compensation point'),
  above: loc('高于补偿点：升温 Id 变小', 'Above the point: hotter, less Id'),
  below: loc('低于补偿点：升温 Id 变大', 'Below the point: hotter, more Id'),
  partA: loc('A（当前温度）', 'A (present T)'),
  partB: loc('B（25 °C）', 'B (25 °C)'),
  total: loc('总电流', 'Total current'),
  parTitle: loc('两颗并联分流', 'Two parts in parallel'),
  cap: loc(
    '示意参数：转移特性用本轨平方律模型，Vds = 3.3 V，Vth 温度系数 −2 mV/°C，迁移率 ∝ T^−1.5。Rds(on) 示例是栅压足够高的功率管，25 °C 时 10 mΩ，只算迁移率项；并联两颗总电流 20 A。',
    'Illustrative parameters: the transfer curve uses the track square-law model with Vds = 3.3 V, a Vth coefficient of −2 mV/°C and mobility ∝ T^−1.5. The Rds(on) example is a power part with enough gate drive, 10 mΩ at 25 °C, counting only the mobility term; two parts in parallel carry 20 A in total.',
  ),
}

export const TEMP_TEXT: Array<{ title: LText; text: LText; tone?: 'ok' | 'warn' | 'bad' }> = [
  {
    title: loc('Vth 下降：热激发让反型更容易', 'Vth falls: thermal excitation makes inversion easier'),
    text: loc(
      'Vth 约每升高 1 °C 下降 2 mV：温度高，热激发的载流子多，形成反型层不需要那么高的栅压。从 25 °C 升到 125 °C，Vth 少约 0.2 V，同一个 Vgs 下管子更容易导通，关断漏电也更大。',
      'Vth falls about 2 mV per °C: hotter silicon has more thermally excited carriers, so inversion needs less gate voltage. From 25 °C to 125 °C Vth drops about 0.2 V, so at the same Vgs the device turns on more easily and leaks more when off.',
    ),
  },
  {
    title: loc('Rds(on) 上升：迁移率下降', 'Rds(on) rises: mobility falls'),
    text: loc(
      '温度升高，晶格振动加强，载流子被散射得更多，迁移率约按 T 的 −1.5 次方下降，沟道和漂移区电阻变大。硅功率 MOSFET 从 25 °C 到 125 °C，Rds(on) 大约变成 1.5 倍，数据手册里给的是「归一化 Rds(on) 对结温」曲线。所以算导通损耗要用工作温度下的 Rds(on)，不能用 25 °C 的值。',
      'As temperature rises, lattice vibration grows and carriers scatter more, so mobility falls roughly as T to the power −1.5 and the channel and drift-region resistance increase. A silicon power MOSFET’s Rds(on) becomes about 1.5 times larger from 25 °C to 125 °C; datasheets give a normalised Rds(on) versus junction temperature curve. So compute conduction loss with Rds(on) at the operating temperature, not the 25 °C value.',
    ),
    tone: 'warn',
  },
  {
    title: loc('正温度系数让并联自动均流', 'A positive coefficient balances parallel parts'),
    text: loc(
      '两颗并联时，热的那颗 Rds(on) 变大，分到的电流变少，电流自动往凉的那颗转移，温差就不会越拉越大，所以开关用的功率管可以直接并联。右下方的条形图就是这个分流：A 比 B 热，A 的电流反而小。',
      'With two parts in parallel, the hotter one has a larger Rds(on) and takes less current, so current shifts to the cooler one and the temperature gap does not keep growing; that is why switching power MOSFETs can be paralleled directly. The bars at lower right show the split: A is hotter than B and carries less current.',
    ),
    tone: 'ok',
  },
  {
    title: loc('转移特性上的温度补偿点', 'The temperature-compensation point on the transfer curve'),
    text: loc(
      '两条温度曲线会相交于一点：Vgs 高于它，迁移率下降占主导，升温 Id 变小；Vgs 低于它，Vth 下降占主导，升温 Id 反而变大。开关用的大栅压远在补偿点之上，所以并联安全；但把功率管长时间放在线性区、栅压很低时，就可能落在补偿点以下，热点电流越热越大，局部过热失控，要看数据手册的 SOA（见 {@mosSelect}）。',
      'The two temperature curves cross at one point. Above it mobility loss dominates and Id falls when hotter; below it the Vth drop dominates and Id rises when hotter. Switching drive is far above the compensation point, so paralleling is safe; but a power part held in the linear region at a low gate voltage can sit below it, where the hot spot draws more current as it heats and runs away locally, so check the SOA in the datasheet (see {@mosSelect}).',
    ),
    tone: 'warn',
  },
]
