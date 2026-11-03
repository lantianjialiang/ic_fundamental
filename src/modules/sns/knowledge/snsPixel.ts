import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

/** SNS-03 像素与读出链 */
export const SNS_PIXEL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-4t',
      term: '4T pixel',
      name: loc('4T 像素', '4T pixel'),
      def: loc(
        '四个管子的 CMOS 像素：复位 RST、转移 TX、源跟随、行选 SEL，电荷落到浮空扩散 FD。顺序是复位、曝光、转移、读出。见 {@snsPixel}。',
        'A CMOS pixel with four transistors: reset RST, transfer TX, a source follower, and row select SEL. Charge lands on the floating diffusion FD. The order is reset, integration, transfer, and readout. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-cg',
      term: 'Conversion gain',
      name: loc('转换增益', 'Conversion gain'),
      def: loc(
        'FD 上每个电子对应的电压，CG = q/C。C = 1 fF 时约 160 µV/e-。再乘源跟随和列增益才是送到 ADC 的总增益。见 {@snsPixel}。',
        'The voltage on the FD per electron, CG = q/C. At C = 1 fF it is about 160 uV/e-. Multiply by the source-follower gain and the column gain to get the total gain into the ADC. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-cds',
      term: 'Correlated double sampling',
      name: loc('相关双采样', 'Correlated double sampling'),
      def: loc(
        '先采复位电平，再采转移后的信号电平，两者相减。复位 kTC 里相关的那一份被消掉。信号的散粒噪声和读出噪声并不相关，CDS 去不掉。见 {@snsPixel}。',
        'Sample the reset level, then the signal level after transfer, and subtract them. The correlated part of reset kTC cancels. Shot noise of the signal and read noise are not correlated, so CDS does not remove them. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-rolling',
      term: 'Rolling shutter',
      name: loc('卷帘快门', 'Rolling shutter'),
      def: loc(
        '逐行复位和读出。第一行和最后一行的时刻差是行时间乘行数。全局快门各行一起曝光，没有这项偏斜。CDS 减的是同一像素的两个电平，消不掉行与行的时间差。见 {@snsPixel}。',
        'Reset and readout proceed row by row. The time from the first row to the last is row time times the row count. A global shutter exposes every row together and does not have this skew. CDS subtracts two levels of the same pixel and does not remove the time gap between rows. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-fd',
      term: 'Floating diffusion',
      name: loc('浮空扩散（FD）', 'Floating diffusion (FD)'),
      def: loc(
        '4T 像素里接收转移电荷的电容节点。转换增益 CG = q/C_FD。C 越小，每个电子对应的电压越大，但满阱更早到顶。见 {@snsPixel}。',
        'The capacitive node in a 4T pixel that receives the transferred charge. Conversion gain CG = q/C_FD. A smaller C gives more volts per electron, but the full well hits the ceiling sooner. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-global-shutter',
      term: 'Global shutter',
      name: loc('全局快门', 'Global shutter'),
      def: loc(
        '各行同时曝光，再依次读出。没有卷帘快门那种行与行的时刻差，高速运动不会斜切。代价是像素更复杂，本课模型只对照卷帘的偏斜。见 {@snsPixel}。',
        'Every row integrates at the same time, then readout proceeds row by row. There is no rolling-shutter time gap between the first and last row, so fast motion is not sheared. The cost is a more complex pixel; this lesson’s model only contrasts the rolling skew. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-ktc',
      term: 'kTC noise',
      name: loc('复位 kTC 噪声', 'Reset kTC noise'),
      def: loc(
        '复位开关的热噪声，电子 rms 是 √(kTC)/q。1 fF、300 K 约 12.7 e-。CDS 减掉复位和信号里相关的那一份；散粒噪声和读出噪声不相关，减不掉。见 {@snsPixel}。',
        'Thermal noise of the reset switch; the electron rms is sqrt(kTC)/q. At 1 fF and 300 K it is about 12.7 e-. CDS removes the correlated part shared by the reset and signal samples. Shot noise and read noise are uncorrelated and stay. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-quant',
      term: 'Quantization noise',
      name: loc('量化噪声', 'Quantization noise'),
      def: loc(
        'ADC 把连续电压切成 DN 带来的误差，约 K/√12，K 的单位是 e-/DN。10 bit、1 V、总增益 100 µV/e- 时约 2.82 e-，常小于读出噪声。见 {@snsPixel}。',
        'The error from slicing a continuous voltage into DN, about K/sqrt(12), with K in e-/DN. At 10 bits, 1 V and 100 µV/e- total gain it is about 2.82 e-, often smaller than read noise. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-pixel-cds-shot',
      q: loc('打开 CDS 之后，散粒噪声为什么还在？', 'Why is shot noise still there after CDS is turned on?'),
      a: loc(
        'CDS 减去的是复位样本和信号样本里相同的那一份，也就是复位开关的 kTC。光子散粒噪声在 TX 转移时才出现，两份样本并不共享它，所以噪声和里去掉 kTC 以后，残余至少还有量化噪声，散粒和读出噪声也不在这个减法里。见 {@snsPixel}。',
        'CDS subtracts the part that is common to the reset sample and the signal sample, which is the kTC of the reset switch. Photon shot noise appears when TX transfers the charge, so the two samples do not share it. After kTC leaves the noise sum, the residual of that sum is the quantization noise, and shot noise and read noise are outside the subtraction. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-pixel-quant-read',
      q: loc('10 bit、1 V、总增益 100 µV/e- 时，量化噪声主导吗？', 'With 10 bits, 1 V, and 100 uV/e- total gain, does quantization noise dominate?'),
      a: loc(
        '不主导。K = 1 / (1024 · 100e-6) ≈ 9.77 e-/DN，量化噪声约 K/√12 ≈ 2.82 e-。拿模型里固定的 5 e- 读出噪声来比，2.82 更小，所以读出噪声更大。见 {@snsPixel}。',
        'No. K = 1 / (1024 * 100e-6) is about 9.77 e-/DN, and quantization noise is about K/sqrt(12), or 2.82 e-. Compared with the fixed 5 e- read noise in the model, 2.82 is smaller, so read noise is larger. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
    {
      id: 'sns-pixel-gain-fwc',
      q: loc('增益开得越大，满阱是不是越大？', 'Does a larger gain give a larger full well?'),
      a: loc(
        '正好相反。CG = q/C，C 变小则每个电子对应的电压变大，ADC 量程更早被占满，电子数满阱变小。总增益再乘源跟随和列增益，也会把同一电子数送到更大量程。高增益换的是读出灵敏度，不是更大的满阱。见 {@snsPixel}。',
        'The opposite. CG = q/C, so a smaller C gives more volts per electron, the ADC range fills sooner, and the electron full well shrinks. Extra source-follower or column gain also drives the same electron count into a larger share of the range. High gain buys readout sensitivity, not a larger full well. See {@snsPixel}.',
      ),
      lessons: ['snsPixel' as ModuleId],
    },
  ],
}
