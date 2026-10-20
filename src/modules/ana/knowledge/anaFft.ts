import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-07 波形采集与 FFT：术语、已有词条的课程补充、常见问题 */
export const ANA_FFT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'fft',
      term: 'FFT',
      name: loc('快速傅里叶变换（FFT）', 'Fast Fourier transform (FFT)'),
      def: loc(
        '把 N 点时域记录变成 N/2 根单边谱线的算法。相邻谱线间隔 Δf = fs / N，每根谱线的幅度对应该频率成分的峰值。FFT 要求 N 为 2 的幂，见 {@anaFft}。',
        'An algorithm that turns an N-point time record into N/2 single-sided spectral lines. Adjacent lines are spaced Δf = fs / N, and each line amplitude is the peak of that frequency component. The FFT requires N to be a power of 2; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'frequency-resolution',
      term: 'Frequency resolution',
      name: loc('频率分辨率（谱线间隔）', 'Frequency resolution (bin spacing)'),
      def: loc(
        '相邻两根谱线的间隔 Δf = fs / N。记录越长，Δf 越小，靠得很近的两个频率越能分开；但它不决定读数是否准确，那是泄漏的问题。见 {@anaFft}。',
        'The spacing between adjacent spectral lines, Δf = fs / N. A longer record gives a smaller Δf, so two closely spaced frequencies separate better; but Δf does not decide whether a reading is accurate, which is a leakage question. See {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'window-function',
      term: 'Window function',
      name: loc('窗函数', 'Window function'),
      def: loc(
        'FFT 前乘在记录上的一组系数。矩形窗不做处理；汉宁窗、Blackman-Harris 窗把记录两端压向零，减小截断跳变，远处旁瓣更低，代价是主瓣变宽。见 {@anaFft}。',
        'A set of coefficients multiplied onto the record before the FFT. The rectangular window applies no taper; the Hann and Blackman-Harris windows pull the record ends toward zero, reducing the truncation jump and the far sidelobes, at the cost of a wider main lobe. See {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'spectral-leakage',
      term: 'Spectral leakage',
      name: loc('频谱泄漏', 'Spectral leakage'),
      def: loc(
        '记录没有整数个周期时，截断的跳变把一个频率的能量分散到邻近多根谱线上。结果是峰值读数偏低，谐波也被泄漏搅乱。相干采样能让它消失，见 {@anaFft}。',
        'When the record does not hold a whole number of cycles, the truncation jump spreads one frequency\'s energy across neighbouring lines. The peak reading comes out low and the harmonics get scrambled. Coherent sampling removes it; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'coherent-sampling',
      term: 'Coherent sampling',
      name: loc('相干采样', 'Coherent sampling'),
      def: loc(
        '让输入频率 f_in = M·fs/N，M 与 N 互质，使记录内恰好是整数个周期。这时基波和谐波都落在整数谱线上，没有泄漏。要求激励源与采样时钟同源，见 {@anaFft}。',
        'Set the input frequency to f_in = M·fs/N with M coprime to N, so the record holds exactly a whole number of cycles. The fundamental and harmonics then sit on whole bins with no leakage. The stimulus must share a clock with the sampler; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'harmonic-distortion',
      term: 'HD2 / HD3',
      name: loc('谐波失真 HD2 / HD3', 'Harmonic distortion HD2 / HD3'),
      def: loc(
        'HD2、HD3 是二次、三次谐波幅度与基波幅度之比，常用百分比表示。它们是 THD 的组成部分；谱线读数的误差会直接传到失真比上，见 {@anaFft}。',
        'HD2 and HD3 are the second- and third-harmonic amplitudes divided by the fundamental amplitude, usually given as a percentage. They make up THD, and any error in the line readings passes straight into these ratios; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
  ],
  extraLessons: {
    'adc-dac': ['anaFft'],
  },
  faqs: [
    {
      id: 'ana-fft-window',
      q: loc('加了汉宁窗，频谱就准了吗？', 'With a Hann window, is the spectrum now accurate?'),
      a: loc(
        '不一定。窗函数压的是远处的旁瓣，主瓣却变宽，峰值仍会因 f_in 离谱线中心的位置而偏低（矩形窗最坏约 −3.9 dB）。要读准基波与谐波，要么相干采样，要么把 f_in 调到谱线上，见 {@anaFft}。',
        'Not necessarily. A window suppresses far sidelobes but widens the main lobe, and the peak still reads low depending on where f_in sits relative to a line centre (the rectangular worst case is about −3.9 dB). For accurate fundamental and harmonic readings, use coherent sampling or move f_in onto a line; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'ana-fft-bins',
      q: loc('N 越大，读数就越准吗？', 'Does a larger N make readings more accurate?'),
      a: loc(
        '不一定。N 变大让谱线更密（Δf 变小），但 f_in 相对谱线中心的位置不变，非相干时泄漏的相对比例几乎不变。N 决定的是分辨率，读数是否准要看相干采样，见 {@anaFft}。',
        'Not necessarily. A larger N packs the lines more tightly (Δf gets smaller), but the position of f_in relative to a line centre does not change, so in non-coherent sampling the leakage fraction barely changes. N sets the resolution; whether readings are accurate depends on coherent sampling; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
    {
      id: 'ana-fft-coherent',
      q: loc('相干采样要满足哪些条件？', 'What does coherent sampling require?'),
      a: loc(
        'f_in = M·fs/N，M 与 N 互质（N 为 2 的幂时 M 为奇数），并且激励源与采样时钟同源。只要有一条不满足，记录就不是整数个周期，泄漏仍会出现，见 {@anaFft}。',
        'f_in = M·fs/N with M coprime to N (M odd when N is a power of 2), and the stimulus must share a clock with the sampler. If any one condition fails, the record does not hold a whole number of cycles and leakage remains; see {@anaFft}.',
      ),
      lessons: ['anaFft'],
    },
  ],
}
