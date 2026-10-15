import { loc } from '../i18n/locale'
import type { GlossaryTerm } from './terms'

/** MOS 管与数字电路（T 轨）的术语。和已有词条重名的概念，已有词条只追加 T 课引用，不在这里重复。 */
export const MOS_TERMS: GlossaryTerm[] = [
  {
    id: 'mosfet',
    term: 'MOSFET',
    name: loc('MOS 场效应管', 'MOS field-effect transistor'),
    def: loc(
      '栅极电压控制源漏之间导电沟道的三端器件：栅极上的电压形成电场，决定沟道通还是不通。T 轨讲的都是它。',
      'A three-terminal device whose gate voltage sets an electric field that opens or closes a conducting channel between source and drain. Everything in the MOS track is about this device.',
    ),
    lessons: ['mosPrimer', 'mosIntro'],
  },
  {
    id: 'nmos',
    term: 'NMOS',
    name: loc('N 沟道 MOS 管', 'N-channel MOS'),
    def: loc(
      '沟道靠电子导电。栅源电压超过正的阈值才开启；源极接地时最适合做低边开关，能把输出拉得很低。',
      'A channel that conducts with electrons. It turns on when Vgs exceeds a positive threshold; with the source at ground it suits low-side switches and pulls outputs low well.',
    ),
    lessons: ['mosIntro', 'mosChannel', 'mosSwitch'],
  },
  {
    id: 'pmos',
    term: 'PMOS',
    name: loc('P 沟道 MOS 管', 'P-channel MOS'),
    def: loc(
      '沟道靠空穴导电。栅源电压要低于负的阈值才开启；源极接电源时适合做高边开关，能把输出拉得很高。',
      'A channel that conducts with holes. It turns on when Vgs falls below a negative threshold; with the source at the supply it suits high-side switches and pulls outputs high well.',
    ),
    lessons: ['mosIntro', 'mosSwitch'],
  },
  {
    id: 'vth',
    term: 'Vth',
    name: loc('阈值电压', 'Threshold voltage'),
    def: loc(
      '刚好形成导电沟道时的栅源电压。NMOS 为正，PMOS 为负。它随工艺和温度变化，所以数据手册给的是最小、典型、最大三个值。',
      'The gate-source voltage at which a conducting channel just forms. Positive for NMOS, negative for PMOS. It varies with process and temperature, so datasheets give min, typical and max values.',
    ),
    lessons: ['mosChannel', 'mosSelect'],
  },
  {
    id: 'mos-channel',
    term: 'Channel (MOS)',
    name: loc('沟道', 'Channel'),
    def: loc(
      '栅极下面表面形成的一层导电薄层，源和漏就是通过它连起来的。沟道怎么形成见 {@mosChannel}。',
      'The thin conducting layer that forms under the gate surface and joins source and drain. How it forms: {@mosChannel}.',
    ),
    lessons: ['mosChannel'],
  },
  {
    id: 'depletion',
    term: 'Depletion',
    name: loc('耗尽', 'Depletion'),
    def: loc(
      '栅压把多数载流子赶走，表面留下不能移动的离子，形成耗尽层。它是沟道形成之前的中间状态。',
      'Gate voltage pushes majority carriers away, leaving immobile ions at the surface: a depletion layer. It is the transition state before a channel forms.',
    ),
    lessons: ['mosChannel'],
  },
  {
    id: 'inversion',
    term: 'Inversion',
    name: loc('反型', 'Inversion'),
    def: loc(
      '栅压把表面的载流子类型反转：NMOS 的 P 型衬底表面聚集了电子，形成沟道。Vgs 超过 Vth 后就是这个状态。',
      'The gate flips the carrier type at the surface: electrons gather at the surface of a P-type substrate in NMOS, forming the channel. This is the state once Vgs exceeds Vth.',
    ),
    lessons: ['mosChannel'],
  },
  {
    id: 'body-diode',
    term: 'Body diode',
    name: loc('体二极管', 'Body diode'),
    def: loc(
      '衬底与源极、衬底与漏极之间的 PN 结。沟道关着时它仍然存在，漏源之间的电压让它正偏就会导通；防反接、H 桥续流、I2C 电平转换都要用到它。',
      'The PN junction between body and source, and between body and drain. It exists even with the channel off, and conducts when the drain-source voltage forward-biases it; reverse-polarity protection, H-bridge freewheeling and I2C level shifting all depend on it.',
    ),
    lessons: ['mosIntro', 'mosApps'],
  },
  {
    id: 'triode-saturation',
    term: 'Triode / Saturation',
    name: loc('线性区 / 饱和区', 'Linear / saturation region'),
    def: loc(
      '导通后的两种状态：Vds 小时像一个电阻（线性区，也叫三极区）；Vds 大时电流基本不再随 Vds 变化（饱和区）。开关工作在线性区，放大和恒流工作在饱和区。',
      'Two regions once the channel is on: at small Vds the device acts like a resistor (linear, or triode); at large Vds the current barely changes with Vds (saturation). Switches work in the linear region; amplifiers and current sources in saturation.',
    ),
    lessons: ['mosRegion'],
  },
  {
    id: 'clm',
    term: 'λ (channel-length modulation)',
    name: loc('沟道长度调制', 'Channel-length modulation'),
    def: loc(
      '饱和区里 Vds 升高时，漏端耗尽区变宽，有效沟道变短，电流还会缓慢增加。λ 描述这个斜率；理想模型里取 0。',
      'In saturation a higher Vds widens the depletion region at the drain and shortens the effective channel, so current still rises slightly. λ sets that slope; the ideal model takes it as zero.',
    ),
    lessons: ['mosRegion'],
  },
  {
    id: 'vtc',
    term: 'VTC',
    name: loc('电压传输特性', 'Voltage transfer characteristic'),
    def: loc(
      '反相器输出电压随输入电压变化的曲线。中间一段很陡：输入在阈值附近时两管都在导通、增益很大，输入稍一变，输出就翻转。两端的平坦段和拐点决定噪声容限。',
      'The curve of inverter output against input voltage. The middle is steep: near the threshold both transistors conduct and the gain is high, so a small input change flips the output. The flat ends and the knee set the noise margins.',
    ),
    lessons: ['mosInverter'],
  },
  {
    id: 'transmission-gate',
    term: 'Transmission gate',
    name: loc('传输门', 'Transmission gate'),
    def: loc(
      '一个 NMOS 和一个 PMOS 并联，栅极互补驱动。NMOS 好传 0，PMOS 好传 1，并联后从 0 到 VDD 的整个范围都能完整地传过去。',
      'An NMOS and a PMOS in parallel with complementary gate drive. The NMOS passes 0 well and the PMOS passes 1 well, so together they pass the full range from 0 to VDD.',
    ),
    lessons: ['mosGates'],
  },
  {
    id: 'nand-nor',
    term: 'NAND / NOR',
    name: loc('与非门 / 或非门', 'NAND / NOR gates'),
    def: loc(
      'NAND 用串联 NMOS 下拉、并联 PMOS 上拉；NOR 反过来。串联的管子越多，拉的能力越弱，所以 NOR 的串联 PMOS 上拉比较慢。',
      'NAND pulls down through series NMOS and pulls up through parallel PMOS; NOR is the reverse. More series transistors weaken the pull, which is why NOR is slower (series PMOS pull-up).',
    ),
    lessons: ['mosGates'],
  },
  {
    id: 'miller-plateau',
    term: 'Miller plateau',
    name: loc('米勒平台', 'Miller plateau'),
    def: loc(
      '开关过程中栅压停在某一值不动的阶段：漏极电压正在变化，栅漏电容把电荷拉走，栅极驱动电荷大部分花在这里。它决定开关速度。',
      'The stage of a switching event where Vgs sits flat: the drain voltage is swinging and the gate-drain capacitance draws charge away. Much of the gate charge is spent here, so it sets switching speed.',
    ),
    lessons: ['mosDynamic'],
  },
  {
    id: 'qg',
    term: 'Qg',
    name: loc('栅极电荷', 'Gate charge'),
    def: loc(
      '把栅压从 0 充到规定值所需的电荷量。驱动器每次开关都要送进去、再拿出来；Qg 越大，驱动电流和开关损耗越大。',
      'The charge needed to take the gate from 0 to a specified voltage. The driver supplies it on every turn-on and removes it on turn-off; a larger Qg means more drive current and switching loss.',
    ),
    lessons: ['mosDynamic', 'mosSelect'],
  },
  {
    id: 'shoot-through',
    term: 'Shoot-through',
    name: loc('直通', 'Shoot-through'),
    def: loc(
      'H 桥或半桥里上下管同时导通，电源经两管直接对地短路，电流很大。靠死区时间把两管的开关时刻错开来避免。',
      'In an H-bridge or half-bridge the high and low devices conduct together, shorting the supply to ground through both with a large current. Dead time staggers their switching instants to prevent it.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'h-bridge',
    term: 'H-bridge',
    name: loc('H 桥', 'H-bridge'),
    def: loc(
      '四个开关接成 H 形，电机接在中间两点之间。对角一对管导通，电流方向就确定；制动和滑行也由哪几个管导通决定。',
      'Four switches in an H shape with the motor across the two middle nodes. Turning on one diagonal pair fixes the current direction; braking and coasting are also set by which switches conduct.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'bootstrap',
    term: 'Bootstrap',
    name: loc('自举', 'Bootstrap'),
    def: loc(
      '用一颗电容在低边导通时充电，开关节点升高时把电容的另一端一起抬起，让高边 NMOS 的栅极高过源极，从而能够导通。',
      'A capacitor charged while the low side conducts and then lifted with the switching node, so the high-side NMOS gate sits above its source and can turn on.',
    ),
    lessons: ['mosSwitch'],
  },
  {
    id: 'flyback-diode',
    term: 'Flyback diode',
    name: loc('续流二极管', 'Flyback (freewheeling) diode'),
    def: loc(
      '与感性负载并联的二极管。关断时线圈电流经它续流，把 L·di/dt 产生的高压限在一个二极管压降，保护 MOS 管。',
      'A diode across an inductive load. When the switch opens, the coil current freewheels through it, clamping the L·di/dt spike to about one diode drop and protecting the MOSFET.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'level-shifter',
    term: 'Level shifter',
    name: loc('电平转换', 'Level shifter'),
    def: loc(
      '在两段不同电压的总线之间传递信号。单管做法：栅接低压侧的电源，源接低压侧，漏接高压侧。高压侧把线拉低时，体二极管先把低压侧拉到约 0.6 V，Vgs 增大后沟道导通，把低压侧也拉低。',
      'A circuit that passes signals between buses at different voltages. Single-MOS version: gate to the low-side supply, source on the low side, drain on the high side. When the high side pulls low, the body diode first drags the low side to about 0.6 V, Vgs then rises and the channel conducts and pulls it low too.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'reverse-polarity',
    term: 'Reverse-polarity protection',
    name: loc('防反接', 'Reverse-polarity protection'),
    def: loc(
      '电池接反时，PMOS 的栅源电压变成 0，沟道关断，体二极管反偏，负载电压为 0。正接时沟道导通，压降只剩 I·Rds(on)，远小于二极管的约 0.6 V。',
      'With the battery reversed, the PMOS gate-source voltage is 0, the channel stays off, the body diode is reverse-biased and the load sees 0 V. With correct polarity the channel conducts and the drop is only I·Rds(on), far below a diode’s roughly 0.6 V.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'soft-start',
    term: 'Soft start',
    name: loc('软启动', 'Soft start'),
    def: loc(
      '用栅极 RC 放慢 Vgs 的上升，让输出电压缓慢爬升。涌入电流约等于负载电容乘以电压变化率，即 C·dV/dt。',
      'A gate RC that slows the rise of Vgs so the output ramps up gently. Inrush current is about the load capacitance times the voltage slope, C·dV/dt.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'inrush',
    term: 'Inrush current',
    name: loc('涌入电流', 'Inrush current'),
    def: loc(
      '上电瞬间给电容充电时的大电流。负载电容大、电压上升快时，涌入电流可以远超稳态电流，烧断保险或损坏开关。',
      'The large current at power-up while capacitors charge. With large load capacitance and a fast rise, inrush can far exceed steady-state current and blow a fuse or damage the switch.',
    ),
    lessons: ['mosApps'],
  },
  {
    id: 'soa',
    term: 'SOA',
    name: loc('安全工作区', 'Safe operating area'),
    def: loc(
      '数据手册上画出的 Id–Vds 允许范围，超出就可能烧毁。脉冲越长，允许的功率越小，因为热量来不及散开。',
      'The Id–Vds region in the datasheet where the device is safe. The longer the pulse, the less power is allowed, because heat has no time to spread.',
    ),
    lessons: ['mosSelect'],
  },
  {
    id: 'theta-ja',
    term: 'Thermal resistance (RθJA)',
    name: loc('热阻', 'Thermal resistance'),
    def: loc(
      '温升与功耗之比，单位 °C/W。结温 ≈ 环境温度 + 功耗 × 热阻；热阻越大，同样功耗下管子越烫。',
      'Temperature rise per watt, in °C/W. Junction temperature ≈ ambient + power × thermal resistance; a higher RθJA runs hotter at the same power.',
    ),
    lessons: ['mosSelect'],
  },
]
