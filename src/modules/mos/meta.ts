import { loc, type LText } from '../../i18n/locale'

export const MOS_LESSONS = [
  'mosPrimer',
  'mosIntro',
  'mosChannel',
  'mosRegion',
  'mosSwitch',
  'mosInverter',
  'mosGates',
  'mosDynamic',
  'mosApps',
  'mosReal',
  'mosSelect',
] as const

export type MosLessonId = (typeof MOS_LESSONS)[number]

export const MOS_META: Record<MosLessonId, { title: LText; goal: LText }> = {
  mosPrimer: {
    title: loc('预备：半导体与 RC 速览', 'Primer: Semiconductors and RC'),
    goal: loc(
      '（选修）说清 N 型、P 型、载流子和 PN 结；回顾电容和 RC 充放电；用自测判断要不要补这一课。',
      '(Optional) Explain N-type, P-type, carriers and the PN junction; review capacitors and RC charging; use the self-check to decide whether you need this lesson.',
    ),
  },
  mosIntro: {
    title: loc('MOS 管是什么', 'What a MOSFET Is'),
    goal: loc(
      '把 MOS 管看成栅极电压控制的开关；认识 G、D、S、B 四个端子和 NMOS / PMOS 符号；说出它和三极管的区别。',
      'See the MOSFET as a switch controlled by gate voltage; know the G, D, S, B terminals and the NMOS / PMOS symbols; say how it differs from a BJT.',
    ),
  },
  mosChannel: {
    title: loc('沟道是怎么形成的', 'How the Channel Forms'),
    goal: loc(
      '看懂 MOS 剖面；分清积累、耗尽、反型三种状态；说清阈值电压 Vth 的物理意义，以及 NMOS 和 PMOS 为什么极性相反。',
      'Read the MOS cross-section; tell accumulation, depletion and inversion apart; explain what the threshold voltage Vth means physically and why NMOS and PMOS have opposite polarity.',
    ),
  },
  mosRegion: {
    title: loc('三种工作状态', 'The Three Operating Regions'),
    goal: loc(
      '用 Vgs、Vds 判断截止区、线性区、饱和区；读懂输出特性和转移特性曲线；知道过驱动电压 Vov 的作用。',
      'Use Vgs and Vds to tell cutoff, linear and saturation apart; read the output and transfer curves; know what the overdrive voltage Vov does.',
    ),
  },
  mosSwitch: {
    title: loc('MOS 管作为开关', 'The MOSFET as a Switch'),
    goal: loc(
      '说清 NMOS 传好 0、PMOS 传好 1；会算 Rds(on) 的损耗；分清低边和高边开关，知道 NMOS 高边为什么要自举。',
      'Explain why NMOS passes a good 0 and PMOS a good 1; calculate Rds(on) loss; tell low-side from high-side switches and why an NMOS high-side switch needs a bootstrap.',
    ),
  },
  mosInverter: {
    title: loc('CMOS 反相器', 'The CMOS Inverter'),
    goal: loc(
      '按输入电压分阶段说出两管状态；读懂电压传输特性、开关阈值和噪声容限；会用 P = C·V²·f 估算动态功耗。',
      'Walk through both transistors’ states as the input rises; read the voltage transfer curve, switching threshold and noise margins; estimate dynamic power with P = C·V²·f.',
    ),
  },
  mosGates: {
    title: loc('用 MOS 管搭逻辑门', 'Building Gates from MOSFETs'),
    goal: loc(
      '画出 NAND、NOR 的上拉和下拉网络；用「串联是与、并联是或」和对偶关系自己搭门；认识传输门、三态门、异或和多路选择器。',
      'Draw the pull-up and pull-down networks of NAND and NOR; build gates yourself with “series is AND, parallel is OR” and duality; meet the transmission gate, tri-state buffer, XOR and multiplexer.',
    ),
  },
  mosDynamic: {
    title: loc('动态特性：为什么会有延时', 'Dynamics: Where Delay Comes From'),
    goal: loc(
      '认识 Cgs、Cgd、Cds 和米勒平台；读懂栅极电荷 Qg；会估算上升、下降和传播延时；说清栅极电阻和开关损耗的关系。',
      'Know Cgs, Cgd, Cds and the Miller plateau; read gate charge Qg; estimate rise, fall and propagation delay; explain how gate resistance relates to switching loss.',
    ),
  },
  mosApps: {
    title: loc('典型应用电路', 'Typical Board Circuits'),
    goal: loc(
      '读懂 GPIO 驱动、负载开关、防反接、I2C 电平转换、开漏、H 桥和软启动电路；每个都能说出功能、原理、关键参数和常见坑。',
      'Read GPIO drivers, load switches, reverse-polarity protection, I2C level shifting, open drain, H-bridges and soft start; for each, state the function, principle, key parameters and common pitfalls.',
    ),
  },
  mosReal: {
    title: loc('非理想特性与可靠性', 'Non-ideal Behaviour and Reliability'),
    goal: loc(
      '说清体二极管、亚阈值漏电、温度漂移、栅极 ESD、闩锁和工艺缩放各会带来什么问题。',
      'Explain what the body diode, subthreshold leakage, temperature drift, gate ESD, latch-up and process scaling each cause.',
    ),
  },
  mosSelect: {
    title: loc('读数据手册与选型', 'Reading Datasheets and Choosing a Part'),
    goal: loc(
      '读懂 Vds、Id、Rds(on)、Vgs(th)、Qg、电容和 SOA；判断 3.3 V 能否直接驱动；做热计算；完成「3.3 V MCU 控制 12 V 负载」的综合任务。',
      'Read Vds, Id, Rds(on), Vgs(th), Qg, capacitances and SOA; judge whether 3.3 V can drive the gate directly; do the thermal calculation; complete the capstone: a 3.3 V MCU switching a 12 V load.',
    ),
  },
}
