import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-04 动态参数：栅极电荷、电容与开关时间（Ciss/Coss/Crss、Qgs/Qgd、栅极电荷曲线、驱动损耗） */
export const PWR_GATE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'ciss-coss-crss',
      term: 'Ciss / Coss / Crss',
      name: loc('输入 / 输出 / 反向传输电容', 'Input / output / reverse-transfer capacitance'),
      def: loc(
        'Ciss = Cgs + Cgd（输入电容，决定驱动端要充多少电）；Crss = Cgd（反向传输电容，即米勒电容）；Coss = Cds + Cgd（输出电容）。三者都随 Vds 非线性变化，数据表里要写明测试的 Vds。见 {@pwrGate} 与 {@pwrSelector}。',
        'Ciss = Cgs + Cgd (input capacitance, sets how much the driver must charge); Crss = Cgd (reverse-transfer capacitance, the Miller capacitance); Coss = Cds + Cgd (output capacitance). All three are non-linear in Vds, so datasheets state the test Vds. See {@pwrGate} and {@pwrSelector}.',
      ),
      lessons: ['pwrGate'],
    },
    {
      id: 'gate-charge-curve',
      term: 'Gate charge curve',
      name: loc('栅极电荷曲线', 'Gate charge curve'),
      def: loc(
        '用恒定电流 Ig 向栅极充电，记录 Vgs 随时间（即随累计电荷 Q = Ig·t）的变化。曲线分三段：充 Cgs 到平台、米勒平台、再充到驱动电压。平台的长度给出 Qgd。见 {@pwrGate}。',
        'Charge the gate with a constant current Ig and record Vgs against time, which is the accumulated charge Q = Ig·t. The curve has three parts: charging Cgs up to the plateau, the Miller plateau, and charging to the drive voltage. The plateau length gives Qgd. See {@pwrGate}.',
      ),
      lessons: ['pwrGate'],
    },
    {
      id: 'qgs-qgd',
      term: 'Qgs / Qgd',
      name: loc('Qgs（平台前电荷）/ Qgd（平台电荷）', 'Qgs (charge before the plateau) / Qgd (plateau charge)'),
      def: loc(
        'Qgs 是栅压升到平台电压前注入的电荷，主要充 Cgs；Qgd 是米勒平台期间注入的电荷，全部用来充 Cgd，它决定开关过程的时间。Qg 是总电荷，Qg = Qgs + Qgd + 平台后的部分。见 {@pwrGate}。',
        'Qgs is the charge injected before Vgs reaches the plateau voltage, mostly charging Cgs; Qgd is the charge injected during the Miller plateau, all of it charging Cgd, and it sets the switching time. Qg is the total charge, Qg = Qgs + Qgd + the part after the plateau. See {@pwrGate}.',
      ),
      lessons: ['pwrGate'],
    },
    {
      id: 'gate-drive-loss',
      term: 'Gate drive loss',
      name: loc('栅极驱动损耗', 'Gate drive loss'),
      def: loc(
        '驱动电路每次开关都要把栅极电荷 Qg 充到 Vdrive 再放掉，每秒重复 fsw 次，因此平均功率 P = Qg·Vdrive·fsw（教学简化公式）。开关频率越高，驱动损耗越大。见 {@pwrGate}。',
        'Each switching cycle the driver charges the gate charge Qg up to Vdrive and then discharges it, repeated fsw times per second, so the average power is P = Qg·Vdrive·fsw (teaching-simplified formula). Higher switching frequency means more drive loss. See {@pwrGate}.',
      ),
      lessons: ['pwrGate'],
    },
  ],
  extraLessons: {
    qg: ['pwrGate'],
    'miller-plateau': ['pwrGate'],
    vth: ['pwrGate'],
  },
  faqs: [
    {
      id: 'pwr-gate-qg-vs-ig',
      q: loc('测 Qg 时，恒流 Ig 大小会不会改变结果？', 'Does the size of the constant Ig change the measured Qg?'),
      a: loc(
        '总电荷 Qg 不会因为 Ig 改变：Q = Ig·t，Ig 大则 t 短，乘积不变。Ig 决定的是平台的时间长度。Ig 太大时平台被压缩到采样间隔附近，读 Qgd 变难；Ig 太小时漏电和漂移占比变大。所以测试通常选在两者之间，并在报告里写明 Ig。见 {@pwrGate}。',
        'Total Qg does not change with Ig: Q = Ig·t, so a larger Ig gives a shorter t and the product stays the same. Ig sets the plateau duration. If Ig is too large the plateau is squeezed toward the sample interval and Qgd is hard to read; if it is too small, leakage and drift take a bigger share. Tests therefore pick something in between and report Ig. See {@pwrGate}.',
      ),
      lessons: ['pwrGate'],
    },
    {
      id: 'pwr-gate-cgd-vds',
      q: loc('数据表里的 Ciss、Coss 为什么要写 Vds 条件？', 'Why do datasheet Ciss and Coss values state a Vds condition?'),
      a: loc(
        'Cgd 随 Vds 非线性变化，低压时大、高压时小；Ciss 与 Coss 都包含 Cgd，所以也随 Vds 变。不同 Vds 下测出的数字不能直接比较，选型时要按实际工作电压看对应的那一档。见 {@pwrSelector} 与 {@pwrGate}。',
        'Cgd is non-linear in Vds: large at low voltage and small at high voltage. Ciss and Coss both contain Cgd, so they change with Vds as well. Numbers measured at different Vds cannot be compared directly; when choosing a part, read the value at your actual operating voltage. See {@pwrSelector} and {@pwrGate}.',
      ),
      lessons: ['pwrGate', 'pwrSelector'],
    },
    {
      id: 'pwr-gate-drive-loss',
      q: loc('怎么估算栅极驱动损耗？', 'How do you estimate gate drive loss?'),
      a: loc(
        '用教学简化公式 P = Qg·Vdrive·fsw：Qg 取数据表的总栅极电荷，Vdrive 是驱动电压，fsw 是开关频率。例如 Qg = 60 nC、Vdrive = 10 V、fsw = 500 kHz 时，P ≈ 0.3 W。这只是估算，忽略了驱动电阻的损耗与开关损耗，实际设计要以现行标准和测量为准。见 {@pwrGate}。',
        'Use the teaching-simplified formula P = Qg·Vdrive·fsw: Qg is the total gate charge from the datasheet, Vdrive the drive voltage, and fsw the switching frequency. For example, Qg = 60 nC, Vdrive = 10 V and fsw = 500 kHz give P ≈ 0.3 W. This is only an estimate that ignores losses in the driver resistance and switching loss; real designs follow the current standard and measurement. See {@pwrGate}.',
      ),
      lessons: ['pwrGate'],
    },
  ],
}
