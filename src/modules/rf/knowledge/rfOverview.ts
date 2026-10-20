import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-01 概述：波长、频段与频谱 */
export const RF_OVERVIEW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'wavelength',
      term: 'Wavelength',
      name: loc('波长 λ', 'Wavelength λ'),
      def: loc(
        '电磁波一个周期走过的距离，λ = c / f。自由空间中 c ≈ 3×10⁸ m/s，2.4 GHz 的 λ 约 125 mm；在 PCB 等介质里波长会变短。它决定线缆、走线多长时要按射频处理。见 {@rfOverview}。',
        'The distance a wave travels in one cycle, λ = c / f. In free space c ≈ 3×10⁸ m/s, so λ at 2.4 GHz is about 125 mm; in a dielectric such as PCB material it gets shorter. It sets how long a cable or trace must be before it is treated as RF. See {@rfOverview}.',
      ),
      lessons: ['rfOverview'],
    },
    {
      id: 'rf-band',
      term: 'RF band',
      name: loc('射频频段', 'RF band'),
      def: loc(
        'ITU 把射频按频率分段：HF、VHF、UHF、SHF、EHF 等，每段相差约 10 倍。同一段的天线、器件和仪器常按段设计，所以先认出频段，就能知道该用什么仪器和夹具。见 {@rfOverview}。',
        'ITU splits RF into bands such as HF, VHF, UHF, SHF and EHF, each about ten times the last. Antennas, parts and instruments are often designed per band, so naming the band tells you which instruments and fixtures to use. See {@rfOverview}.',
      ),
      lessons: ['rfOverview'],
    },
    {
      id: 'spectrum',
      term: 'Spectrum',
      name: loc('频谱', 'Spectrum'),
      def: loc(
        '信号功率随频率的分布。频谱分析仪按频率看功率，能看到载波、谐波、杂散和邻道泄漏；同样的信号在时域波形上很难看清的东西，在频谱上一目了然。见 {@rfOverview}。',
        'How signal power is distributed over frequency. A spectrum analyzer shows power against frequency, revealing the carrier, harmonics, spurs and adjacent-channel leakage; what is hard to see in a time waveform is obvious on a spectrum. See {@rfOverview}.',
      ),
      lessons: ['rfOverview'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rf-why-not-dc',
      q: loc('射频测试为什么不能只用直流仪器？', 'Why can RF test not rely on DC instruments alone?'),
      a: loc(
        '直流仪器测的是电压、电流的平均值，读不出频率、杂散和反射。射频要看功率、频谱，还要保证源、线缆、夹具和 DUT 的阻抗匹配，否则读数会因反射而失真。见 {@rfOverview} 与 {@pmu}。',
        'DC instruments measure average voltage and current; they cannot show frequency, spurs or reflections. RF needs power and spectrum, and the source, cables, fixtures and DUT must be impedance-matched, or reflections distort the reading. See {@rfOverview} and {@pmu}.',
      ),
      lessons: ['rfOverview'],
    },
    {
      id: 'rf-wavelength-matters',
      q: loc('波长和测试有什么关系？', 'How does wavelength relate to testing?'),
      a: loc(
        '波长决定了线缆、走线和器件要多长才需要按传输线来看。经验上超过 λ/10 就要考虑：2.4 GHz 时 λ/10 约 12.5 mm，一根普通的 PCB 走线很容易超过它。见 {@rfOverview}。',
        'Wavelength sets how long a cable, trace or part can be before it must be treated as a transmission line. As a rule of thumb, beyond λ/10 you must consider it: at 2.4 GHz, λ/10 is about 12.5 mm, which an ordinary PCB trace easily exceeds. See {@rfOverview}.',
      ),
      lessons: ['rfOverview'],
    },
    {
      id: 'rf-band-first',
      q: loc('测试前为什么要先确定频段？', 'Why fix the band before testing?'),
      a: loc(
        '频段决定了用什么仪器、线缆、夹具和规格。同一个器件在 2.4 GHz 和 28 GHz 下的测试设备、夹具损耗与校准完全不同，选错频段，后面的数字都不可比。见 {@rfOverview}。',
        'The band decides which instruments, cables, fixtures and specs apply. The same device at 2.4 GHz and at 28 GHz needs different equipment, fixture loss and calibration, so picking the wrong band makes every later number incomparable. See {@rfOverview}.',
      ),
      lessons: ['rfOverview'],
    },
  ],
}
