import { loc, type LText } from '../../../i18n/locale'
import { type Edge } from '../dynamicModel'

export const SCOPE_LABEL = {
  rg: loc('栅极电阻 Rg', 'Gate resistor Rg'),
  cx: loc('负载电容 Cload（并在漏源）', 'Load capacitance Cload (across D-S)'),
  vdrive: loc('驱动电压 Vdrive', 'Drive voltage Vdrive'),
  freq: loc('开关频率 f', 'Switching frequency f'),
  plateau: loc('平台时长', 'Plateau duration'),
  tr: loc('开通交叠时间 tr', 'Turn-on overlap tr'),
  tf: loc('关断交叠时间 tf', 'Turn-off overlap tf'),
  tpd: loc('传播延时（50%–50%）', 'Propagation delay (50%–50%)'),
  slew: loc('Vds 变化率 dv/dt', 'Vds slew rate dv/dt'),
  ig: loc('栅极峰值电流 Vdrive / Rg', 'Peak gate current Vdrive / Rg'),
  eOn: loc('开通能量（积分）', 'Turn-on energy (integrated)'),
  eOff: loc('关断能量（积分）', 'Turn-off energy (integrated)'),
  pEst: loc('估算损耗 ½·V·I·(tr+tf)·f', 'Estimated loss ½·V·I·(tr+tf)·f'),
  pInt: loc('积分损耗 (Eon+Eoff)·f', 'Integrated loss (Eon+Eoff)·f'),
  cap: loc('示波器风格波形：三路共用底边为 0，CH1 Vgs 和 CH2 Vds 每格 2 V，CH3 Id 每格 1 A。虚线是区间分界，下方横杠是指令边沿到 Vds 过 50% 的传播延时（示意参数）。', 'Scope-style plot: all three channels share the bottom edge as zero; CH1 Vgs and CH2 Vds are 2 V per division, CH3 Id is 1 A per division. Dashed lines mark the interval boundaries and the bar below is the propagation delay from the command edge to Vds crossing 50% (illustrative values).'),
  trigger: loc('指令边沿', 'Command edge'),
}

export const EDGES: Array<{ id: Edge; label: LText; title: LText; text: LText; note: LText }> = [
  {
    id: 'on',
    label: loc('开通', 'Turn-on'),
    title: loc('开通：Rg 越大，平台越长', 'Turn-on: the larger Rg is, the longer the plateau'),
    text: loc(
      '平台上的栅极电流约为 (Vdrive − Vpl) / Rg，全部给 Cgd 充电，所以平台时长 ≈ Qgd · Rg / (Vdrive − Vpl)：Rg 翻倍，平台翻倍。负载电容越大，漏极要多放一份电荷，需要更大的管子电流，Vgs 在平台上会略微抬高，平台也更长。',
      'The gate current on the plateau is about (Vdrive − Vpl) / Rg and all of it charges Cgd, so plateau duration ≈ Qgd · Rg / (Vdrive − Vpl): doubling Rg doubles the plateau. A larger load capacitance means the drain must discharge extra charge, which takes more transistor current, so Vgs rises slightly on the plateau and the plateau lasts longer.',
    ),
    note: loc('开通的四个区间：t1 电流开始上升，t2 电流到达负载电流、Vds 开始下降，t3 Vds 到底、平台结束，t4 Vgs 到 90% 驱动电压。', 'The four turn-on boundaries: t1 current starts rising, t2 current reaches the load current and Vds starts falling, t3 Vds is down and the plateau ends, t4 Vgs reaches 90% of the drive voltage.'),
  },
  {
    id: 'off',
    label: loc('关断', 'Turn-off'),
    title: loc('关断：顺序反过来，栅极放电', 'Turn-off: the same steps in reverse, gate discharging'),
    text: loc(
      '关断时驱动电压回到 0，Vgs 先从驱动电压放电到平台电压（Vds 不变），然后进入平台：Cgd 被放电电流充电，Vds 上升，Vgs 停在平台。Vds 升到 VDD 后续流二极管接管负载电流，Id 才随 Vgs 降到 Vth 而归零。关断平台上的 Vgs 比 Vpl 略低，因为漏极电容分走了一部分电流。',
      'At turn-off the drive returns to 0. Vgs first discharges from the drive voltage down to the plateau voltage (Vds unchanged), then the plateau begins: the discharge current charges Cgd, Vds rises and Vgs stays on the plateau. Once Vds reaches VDD the freewheel diode takes over the load current, and only then does Id fall to zero as Vgs drops to Vth. The turn-off plateau sits slightly below Vpl because the drain capacitance takes part of the current.',
    ),
    note: loc('关断的三个分界：t1 Vgs 降到 Vpl、Vds 开始上升，t2 Vds 到 VDD、续流二极管接管，t3 电流降到 0。', 'The three turn-off boundaries: t1 Vgs falls to Vpl and Vds starts rising, t2 Vds reaches VDD and the freewheel diode takes over, t3 current reaches 0.'),
  },
]

export type DriverId = 'gpio' | 'gate'

export const DRIVERS: Array<{ id: DriverId; name: LText; vdrive: number; limit: number; text: LText }> = [
  {
    id: 'gpio',
    name: loc('MCU GPIO 直接驱动', 'MCU GPIO drives directly'),
    vdrive: 3.3,
    limit: 0.01,
    text: loc(
      'GPIO 一般只能灌 / 拉约 10 mA，电压只有 3.3 V。Qg 要靠这点电流慢慢充，充电时间 ≈ Qg / Ig，会比专用驱动慢两个数量级；3.3 V 也可能让 Rds(on) 变大。',
      'A GPIO can usually sink or source only about 10 mA, at just 3.3 V. Qg has to be charged with that small current, so charging time ≈ Qg / Ig is about two orders of magnitude slower than with a dedicated driver, and 3.3 V can also leave Rds(on) larger.',
    ),
  },
  {
    id: 'gate',
    name: loc('专用栅极驱动芯片', 'Dedicated gate-driver IC'),
    vdrive: 10,
    limit: 2,
    text: loc(
      '驱动芯片有 10 V 左右的输出和安培级峰值电流，Rg 才成为限流的主角：Ig = Vdrive / Rg，Rg 取多大就决定边沿多快。',
      'A driver IC has an output around 10 V and amp-level peak current, so Rg becomes the dominant current limiter: Ig = Vdrive / Rg, and the Rg you choose sets the edge speed.',
    ),
  },
]

export const DRIVE_LABEL = {
  who: loc('驱动方式', 'Driver'),
  rg: loc('栅极电阻 Rg', 'Gate resistor Rg'),
  vdrive: loc('驱动电压', 'Drive voltage'),
  ig: loc('平均栅极电流 Ig', 'Gate current Ig'),
  qg: loc('需要的 Qg', 'Qg required'),
  tq: loc('充电时间 ≈ Qg / Ig', 'Charge time ≈ Qg / Ig'),
  limitedBy: loc('电流上限来自', 'Current limit set by'),
  byDriver: loc('驱动器', 'the driver'),
  byRg: loc('Rg', 'Rg'),
}

export type RgId = 'small' | 'mid' | 'large'

export const RG_PRESETS: Array<{ id: RgId; rg: number; label: LText; text: LText }> = [
  {
    id: 'small',
    rg: 2,
    label: loc('Rg 小', 'Small Rg'),
    text: loc(
      'Rg 小：边沿快、延时短、开关损耗小，但 dv/dt 和 di/dt 大，电流在寄生电感上产生 L · di/dt 的电压尖峰，漏极振铃、EMI 变差，严重时栅极和 Cds 一起振荡。',
      'Small Rg: fast edges, short delay and low switching loss, but large dv/dt and di/dt. The current change makes an L · di/dt voltage spike on parasitic inductance, so drain ringing and EMI get worse and in bad cases the gate and Cds oscillate together.',
    ),
  },
  {
    id: 'mid',
    rg: 10,
    label: loc('Rg 中', 'Medium Rg'),
    text: loc(
      'Rg 中：折中。边沿放慢以后 di/dt、dv/dt 都降下来，振铃明显变小，损耗只增加一点，常用做起点再根据实测微调。',
      'Medium Rg: the compromise. Slower edges bring di/dt and dv/dt down, ringing shrinks noticeably and loss rises only a little; it is a common starting point to fine-tune against measurements.',
    ),
  },
  {
    id: 'large',
    rg: 47,
    label: loc('Rg 大', 'Large Rg'),
    text: loc(
      'Rg 大：边沿很慢，EMI 最好，振铃最小；但平台长，Vds 和 Id 同时有值的时间长，开关损耗大，发热多；开关频率高时可能来不及开通。',
      'Large Rg: very slow edges, the best EMI and least ringing, but the plateau is long, Vds and Id are both non-zero for a long time, switching loss and heat are higher, and at high switching frequency the transistor may not finish turning on in time.',
    ),
  },
]

export const RG_LABEL = {
  tpd: loc('开通 tPD', 'Turn-on tPD'),
  cross: loc('开通交叠 tr', 'Overlap tr'),
  slew: loc('dv/dt', 'dv/dt'),
  didt: loc('di/dt', 'di/dt'),
  esw: loc('Eon + Eoff', 'Eon + Eoff'),
  ring: loc('振铃 / EMI 倾向', 'Ringing / EMI tendency'),
  high: loc('高', 'High'),
  mid: loc('中', 'Medium'),
  low: loc('低', 'Low'),
  unitNote: loc('比较条件：Vdrive 10 V、负载电容 100 pF、f 与上面的示波器相同。di/dt 取 t1 到 t2 的平均值，dv/dt 取平台上的变化率。', 'Comparison conditions: Vdrive 10 V, load capacitance 100 pF, f the same as in the scope above. di/dt is averaged from t1 to t2 and dv/dt is the slope on the plateau.'),
}

export type CmosEdge = 'rise' | 'fall'

export const CMOS_EDGES: Array<{ id: CmosEdge; label: LText }> = [
  { id: 'rise', label: loc('输出上升', 'Output rising') },
  { id: 'fall', label: loc('输出下降', 'Output falling') },
]

export const CMOS_WIDTHS: Array<{ id: string; mult: number; label: LText }> = [
  { id: 'w1', mult: 1, label: loc('输出管 ×1', 'Output stage ×1') },
  { id: 'w2', mult: 2, label: loc('输出管 ×2', 'Output stage ×2') },
  { id: 'w4', mult: 4, label: loc('输出管 ×4', 'Output stage ×4') },
]

export const CMOS_LABEL = {
  cl: loc('负载电容 C_load', 'Load capacitance C_load'),
  ron: loc('导通电阻 Ron（3.3 V）', 'On-resistance Ron (3.3 V)'),
  tau: loc('时间常数 τ = Ron · C', 'Time constant τ = Ron · C'),
  tpd: loc('传播延时 ≈ 0.69 · Ron · C', 'Propagation delay ≈ 0.69 · Ron · C'),
  tr: loc('10%–90% 边沿 ≈ 2.2 · Ron · C', '10%–90% edge ≈ 2.2 · Ron · C'),
  energy: loc('每周期能量 C · V²', 'Energy per cycle C · V²'),
  cap: loc('输出级等效成 Ron 加 C_load 的 RC 电路；t = 0 时驱动指令是理想边沿，输出到 50% 的时刻就是传播延时。Ron = 1 / (k · (VDD − Vth))，用的是教学模型在 3.3 V 的值。', 'The output stage is modelled as an RC circuit of Ron and C_load; at t = 0 the drive command is an ideal edge, and the moment the output crosses 50% is the propagation delay. Ron = 1 / (k · (VDD − Vth)), using the teaching model at 3.3 V.'),
  out: loc('输出电压', 'Output voltage'),
  time: loc('时间', 'Time'),
  eq: loc('输出级等效电路', 'Output-stage equivalent'),
}

export const CMOS_TEXT = {
  why: loc(
    '输出要变化，就得经过 Ron 给 C_load 充放电，电压到一半（50%）的时刻是 0.69 · τ，因为 1 − e^(−t/τ) = 0.5 解出 t = ln2 · τ ≈ 0.69 τ。想更快：把输出管做宽，Ron 按比例下降，延时也按比例下降；或者减小负载电容。代价是更大的面积，以及前一级要推更大的输入电容。',
    'The output can only change by charging or discharging C_load through Ron, and the 50% point comes at 0.69 · τ because solving 1 − e^(−t/τ) = 0.5 gives t = ln2 · τ ≈ 0.69 τ. To go faster, make the output transistor wider so Ron and the delay shrink in proportion, or reduce the load capacitance. The price is more area and a larger input capacitance for the previous stage to drive.',
  ),
  energy: loc(
    '每个周期从电源取走的能量约 C · V²，所以动态功耗 P = C · V² · f，见 {@mosInverter}。ATE 测到的 tPD、tr、tf 就是这里的 RC 加上测试夹具的电容，见 {@timing} 和 {@fAc}。',
    'Each cycle draws about C · V² from the supply, so dynamic power is P = C · V² · f; see {@mosInverter}. The tPD, tr and tf an ATE measures are this RC plus the capacitance of the test fixture; see {@timing} and {@fAc}.',
  ),
}

export const TAKEAWAY: LText[] = [
  loc('Ciss = Cgs + Cgd，Coss = Cds + Cgd，Crss = Cgd：因为测量时分别把另一个端子交流短路，剩下的电容就并联在一起。', 'Ciss = Cgs + Cgd, Coss = Cds + Cgd, Crss = Cgd: each is measured with the other terminal AC-shorted, so only the listed capacitors remain in parallel.'),
  loc('米勒平台上 Vgs 不动、Vds 在降：因为 Id 已经等于负载电流，栅极电流全部给 Cgd 充电；平台时长 ≈ Qgd · Rg / (Vdrive − Vpl)。', 'On the Miller plateau Vgs is flat and Vds falls: Id already equals the load current, so all gate current charges Cgd; plateau duration ≈ Qgd · Rg / (Vdrive − Vpl).'),
  loc('Qg = Qgs + Qgd + 其余，充电时间 ≈ Qg / Ig：驱动电流越小，开关越慢，所以 GPIO 直接推大管子会慢很多。', 'Qg = Qgs + Qgd + the rest, and charge time ≈ Qg / Ig: the smaller the drive current, the slower the switching, so a GPIO driving a big transistor is much slower.'),
  loc('开关损耗 ≈ ½ · V · I · (tr + tf) · f：因为开关过程中电压和电流同时不为零，交叠时间越长、频率越高，损耗越大。', 'Switching loss ≈ ½ · V · I · (tr + tf) · f: voltage and current are both non-zero during the edge, so a longer overlap and a higher frequency mean more loss.'),
  loc('Rg 增大：边沿变慢、振铃和 EMI 变小，但损耗变大；Rg 减小则相反。CMOS 逻辑的延时 ≈ 0.69 · Ron · C，详见 {@timing}。', 'Larger Rg: slower edges, less ringing and EMI but more loss; smaller Rg does the opposite. CMOS logic delay ≈ 0.69 · Ron · C; see {@timing}.'),
]
