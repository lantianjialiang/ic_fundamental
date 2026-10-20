import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 模拟 / 混合信号轨道（ANA，轨道前缀 A）的课程 ID，顺序即课序 */
export const ANA_LESSONS = [
  'anaOverview',
  'anaMeasure',
  'anaResources',
  'anaSmu',
  'anaSignal',
  'anaSampling',
  'anaFft',
  'anaLeak',
  'anaLdo',
  'anaStatic',
  'anaDynamic',
  'anaPll',
  'anaTrim',
  'anaStats',
  'anaCapstone',
] as const

export type AnaLessonId = (typeof ANA_LESSONS)[number]

export const ANA_META: Record<AnaLessonId, LessonMeta> = {
  anaOverview: {
    title: loc('模拟芯片测试概述', 'Overview of Analog and Mixed-signal Test'),
    goal: loc(
      '说出模拟测试和数字测试的区别：测的是连续量，靠精度和噪声底判断；读懂规格书里的测试项，并判断哪些项需要测。',
      'Explain how analog test differs from digital test: it measures continuous quantities judged by accuracy and noise floor; read a datasheet and decide which items need testing.',
    ),
  },
  anaMeasure: {
    title: loc('电压、电流与测量基础', 'Voltage, Current and Measurement Basics'),
    goal: loc(
      '区分 Force 与 Measure；按误差带选对量程；说清 2 线与 4 线接法对低阻测量的影响。',
      'Tell Force from Measure; pick the range by its error band; explain how 2-wire and 4-wire hookups affect low-resistance measurements.',
    ),
  },
  anaResources: {
    title: loc('ATE 模拟资源与负载板', 'ATE Analog Resources and Load Board'),
    goal: loc(
      '认出 DPS、AWG、Digitizer、Relay 在负载板上的位置；知道建立时间和接地噪声会让读数怎样变。',
      'Locate DPS, AWG, digitizer and relays on the load board; know how settling time and ground noise change a reading.',
    ),
  },
  anaSmu: {
    title: loc('PMU / SMU 与 FVMI / FIMV', 'PMU / SMU and FVMI / FIMV'),
    goal: loc(
      '区分 FVMI 与 FIMV；理解 Compliance 限值如何钳住读数；用开路、短路判断 DUT 是否接好。',
      'Tell FVMI from FIMV; understand how a compliance limit clamps the reading; use opens and shorts to check that the DUT is connected.',
    ),
  },
  anaSignal: {
    title: loc('连续时间信号与频率', 'Continuous-time Signals and Frequency'),
    goal: loc(
      '说清周期、频率、幅度、相位的关系；会看两路正弦的相位差；认识带宽对信号的影响。',
      'Relate period, frequency, amplitude and phase; read the phase difference of two sine waves; see how bandwidth affects a signal.',
    ),
  },
  anaSampling: {
    title: loc('采样定理与 ADC 采样', 'Sampling Theorem and ADC Sampling'),
    goal: loc(
      '根据信号频率与采样率判断是否混叠；算出混叠后的表观频率；说清抗混叠滤波器的作用。',
      'Decide from signal frequency and sampling rate whether aliasing occurs; compute the apparent alias frequency; explain the role of the anti-aliasing filter.',
    ),
  },
  anaFft: {
    title: loc('波形采集与 FFT', 'Waveform Capture and FFT'),
    goal: loc(
      '说清时域与频域的对应关系；理解频率分辨率、窗函数和相干采样；从频谱读出基波与谐波。',
      'Map time-domain waveforms to the frequency domain; understand frequency resolution, windows and coherent sampling; read the fundamental and harmonics from a spectrum.',
    ),
  },
  anaLeak: {
    title: loc('模拟引脚漏电与静态电流判定', 'Analog Pin Leakage and Quiescent Current Judgement'),
    goal: loc(
      '按测试限值判断 Pass / Fail；说清漏电与静态电流的测法；把数字课的 IDDQ 思路用到模拟引脚上。',
      'Judge Pass / Fail against a test limit; explain how leakage and quiescent current are measured; apply the digital IDDQ idea to analog pins.',
    ),
  },
  anaLdo: {
    title: loc('LDO 测试', 'LDO Test'),
    goal: loc(
      '测输出电压、线性与负载调整率、静态电流和 PSRR；知道每一项在哪个条件下测。',
      'Measure output voltage, line and load regulation, quiescent current and PSRR; know the condition under which each one is measured.',
    ),
  },
  anaStatic: {
    title: loc('ADC / DAC 静态参数', 'ADC / DAC Static Parameters'),
    goal: loc(
      '理解 Offset、Gain、INL、DNL 与丢码的含义；用码密度直方图算出 DNL 和 INL。',
      'Understand offset, gain, INL, DNL and missing codes; compute DNL and INL from a code-density histogram.',
    ),
  },
  anaDynamic: {
    title: loc('ADC 动态参数', 'ADC Dynamic Parameters'),
    goal: loc(
      '说清 SNR、SINAD、THD、SFDR 与 ENOB 的关系；用 6.02N + 1.76 对比测得值与理论值。',
      'Relate SNR, SINAD, THD, SFDR and ENOB; compare measured values with the ideal 6.02N + 1.76.',
    ),
  },
  anaPll: {
    title: loc('PLL / 时钟测试', 'PLL and Clock Test'),
    goal: loc(
      '测频率偏差、锁定时间和抖动；知道参考时钟的质量如何影响结果。',
      'Measure frequency error, lock time and jitter; know how the quality of the reference clock affects the result.',
    ),
  },
  anaTrim: {
    title: loc('Trim 与 OTP', 'Trim and OTP'),
    goal: loc(
      '理解修调码的二分搜索、编程、回读与复测流程；知道 OTP 只能写一次的约束。',
      'Understand the trim-code binary search, programming, read-back and retest flow; know that OTP can only be written once.',
    ),
  },
  anaStats: {
    title: loc('测试限值与统计', 'Test Limits and Statistics'),
    goal: loc(
      '理解 Guardband、重复性、测量不确定度、良率与 Cpk；用限值和分布判断过杀与漏检。',
      'Understand guardband, repeatability, measurement uncertainty, yield and Cpk; use limits and distributions to judge overkill and underkill.',
    ),
  },
  anaCapstone: {
    title: loc('综合：混合信号芯片测试程序', 'Capstone: Mixed-signal Test Program'),
    goal: loc(
      '把前面各课串成一个完整测试程序：排序、条件、Bin 与报告，并运行一批虚拟芯片。',
      'Combine the earlier lessons into one full test program: ordering, conditions, bins and reports, run on a batch of virtual devices.',
    ),
  },
}
