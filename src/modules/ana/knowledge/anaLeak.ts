import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-08 模拟引脚漏电与静态电流判定：术语、已有词条的课程补充、常见问题 */
export const ANA_LEAK_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'iq',
      term: 'IQ',
      name: loc('静态工作电流 IQ', 'Quiescent current IQ'),
      def: loc(
        '器件不带负载、只保持内部电路上电时，从电源脚吸收的电流。它与偏置电路和漏电有关，规格通常写明电压与温度条件。IQ 测试和数字课的 IDDQ 一样，要等稳定之后再读，见 {@anaLeak}。',
        'The current drawn from the supply pin when the device has no load and only its internal circuits are powered. It depends on bias circuits and leakage, and the spec states the voltage and temperature conditions. Like IDDQ in digital test, IQ must be read after settling; see {@anaLeak}.',
      ),
      lessons: ['anaLeak'],
    },
    {
      id: 'rc-transient',
      term: 'RC transient',
      name: loc('RC 充电瞬态', 'RC charging transient'),
      def: loc(
        '加压后，引脚旁的去耦电容要经过线缆和源内阻充电，充电电流按 e^(−t/τ) 衰减，τ = R·C。在残余降到测量容差以内之前，读数都偏大，见 {@anaLeak}。',
        'After forcing, the decoupling capacitor at the pin charges through the cable and source resistance, and the charging current decays as e^(−t/τ) with τ = R·C. Until the residual falls within the measurement tolerance, the reading is too high; see {@anaLeak}.',
      ),
      lessons: ['anaLeak'],
    },
  ],
  extraLessons: {
    'iil-iih': ['anaLeak'],
    iddq: ['anaLeak'],
    idd: ['anaLeak'],
    'settling-time': ['anaLeak'],
    fvmi: ['anaLeak'],
    limit: ['anaLeak'],
    guardband: ['anaLeak'],
    overkill: ['anaLeak'],
  },
  faqs: [
    {
      id: 'ana-leak-settle',
      q: loc('加压后为什么不能马上读电流？', "Why can't the current be read right after forcing voltage?"),
      a: loc(
        '因为去耦电容和线缆要充电，瞬态电流是 V/R_S，按 RC 衰减。例如 5.0 V 经 100 kΩ，初值约 50 µA，要降到 1 µA 以下需要约 3.9 ms。读数偏大时，好件也会 FAIL，见 {@anaLeak}。',
        'Because the decoupling capacitor and the cable must charge, and the transient current is V/R_S, decaying with RC. For example, 5.0 V through 100 kΩ starts near 50 µA and needs about 3.9 ms to fall below 1 µA. While the reading is high, a good part can fail; see {@anaLeak}.',
      ),
      lessons: ['anaLeak'],
    },
    {
      id: 'ana-leak-guardband',
      q: loc('保护带应该设多大？', 'How large should the guardband be?'),
      a: loc(
        '至少覆盖仪器不确定度（示意为 1 µA），这样真值接近规格的坏件不会因读数偏低而漏检；再大就会把边缘好件误杀。要在良率和测试质量之间取舍，见 {@anaLeak}。',
        'At least enough to cover the instrument uncertainty (1 µA for illustration), so that a bad part near the spec is not missed by a low reading. Larger than that rejects good edge parts. It is a trade-off between yield and test quality; see {@anaLeak}.',
      ),
      lessons: ['anaLeak'],
    },
    {
      id: 'ana-leak-vforce',
      q: loc('能用低电压测漏电来判规格吗？', 'Can leakage measured at a lower voltage be used to judge the spec?'),
      a: loc(
        '不能直接判。漏电随电压变化，规格写的是规定电压（这里 5.0 V）下的值。换条件测出来的结果只对应一个别的测试点，不能对应到规格，见 {@anaLeak}。',
        'Not directly. Leakage changes with voltage, and the spec is written at the stated voltage (5.0 V here). A result taken at another condition describes a different test point and cannot be mapped onto the spec; see {@anaLeak}.',
      ),
      lessons: ['anaLeak'],
    },
  ],
}
