import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 射频测试轨道（RF，轨道前缀 R）的课程 ID，顺序即课序 */
export const RF_LESSONS = [
  'rfOverview',
  'rfDb',
  'rfSystem',
  'rfSparam',
  'rfGain',
  'rfP1db',
  'rfIp3',
  'rfNf',
  'rfHarm',
  'rfPhaseNoise',
  'rfModulation',
  'rfEvm',
  'rfCal',
  'rfCapstone',
] as const

export type RfLessonId = (typeof RF_LESSONS)[number]

export const RF_META: Record<RfLessonId, LessonMeta> = {
  rfOverview: {
    title: loc('RF 测试概述', 'Overview of RF Test'),
    goal: loc(
      '说清 RF 测试与直流、低速测试的区别：频率、波长、功率与频谱；列出典型的测试场景。',
      'Explain how RF test differs from DC and low-speed test: frequency, wavelength, power and spectrum; list the typical test scenarios.',
    ),
  },
  rfDb: {
    title: loc('dB、dBm 与 dBc', 'dB, dBm and dBc'),
    goal: loc(
      '在 W、mW 与 dBm 之间换算；用 dB 把级联的增益与损耗相加，算出到达 DUT 的功率。',
      'Convert between W, mW and dBm; add gains and losses in dB across a cascade to find the power reaching the DUT.',
    ),
  },
  rfSystem: {
    title: loc('RF 测试系统与链路', 'RF Test System and Signal Path'),
    goal: loc(
      '认出信号源、分析仪、DUT、线缆与夹具在链路中的位置；按各段损耗算出到达 DUT 的功率。',
      'Locate the signal source, analyzer, DUT, cables and fixture in the path; compute the power reaching the DUT from each segment loss.',
    ),
  },
  rfSparam: {
    title: loc('阻抗匹配与 S 参数', 'Impedance Matching and S-parameters'),
    goal: loc(
      '由负载阻抗算出反射系数 Γ、回波损耗、VSWR 与失配损耗；理解 50 Ω 系统为什么要匹配。',
      'From a load impedance, compute the reflection coefficient Γ, return loss, VSWR and mismatch loss; explain why a 50 Ω system must be matched.',
    ),
  },
  rfGain: {
    title: loc('增益与插入损耗', 'Gain and Insertion Loss'),
    goal: loc('扫频绘制增益曲线，读出 3 dB 带宽与平坦度。', 'Sweep frequency to plot a gain curve; read the 3 dB bandwidth and flatness.'),
  },
  rfP1db: {
    title: loc('输出功率与 P1dB', 'Output Power and P1dB'),
    goal: loc('扫描输入功率，看出压缩与饱和，找到 P1dB 压缩点。', 'Sweep input power to see compression and saturation; find the P1dB compression point.'),
  },
  rfIp3: {
    title: loc('线性度：IP3 与 IMD', 'Linearity: IP3 and IMD'),
    goal: loc('用双音测试看到三阶交调 IM3，算出 IIP3 与 OIP3。', 'Use a two-tone test to see third-order intermodulation IM3; compute IIP3 and OIP3.'),
  },
  rfNf: {
    title: loc('噪声系数', 'Noise Figure'),
    goal: loc('用 Friis 公式算级联噪声系数，并用 Y 因子法求 NF。', 'Compute cascaded noise figure with the Friis formula; find NF with the Y-factor method.'),
  },
  rfHarm: {
    title: loc('谐波与杂散', 'Harmonics and Spurious'),
    goal: loc(
      '在频谱上找出谐波与杂散，用 dBc 标注，并判断是否超出频谱掩模。',
      'Find harmonics and spurs on a spectrum, label them in dBc, and judge whether they exceed the spectrum mask.',
    ),
  },
  rfPhaseNoise: {
    title: loc('相位噪声', 'Phase Noise'),
    goal: loc('读出偏移频率处的 dBc/Hz，并换算成积分相位噪声与抖动。', 'Read dBc/Hz at an offset frequency and convert it to integrated phase noise and jitter.'),
  },
  rfModulation: {
    title: loc('调制基础：I/Q 与星座图', 'Modulation Basics: I/Q and Constellations'),
    goal: loc(
      '说清 I/Q 两路的含义，看懂 QPSK 与 16QAM 星座图，以及 I/Q 失衡带来的变形。',
      'Explain the I and Q paths, read QPSK and 16QAM constellations, and see how I/Q imbalance distorts them.',
    ),
  },
  rfEvm: {
    title: loc('EVM 与 ACPR', 'EVM and ACPR'),
    goal: loc('算出 EVM 百分比，读出邻道功率泄漏 ACPR，理解二者分别反映什么。', 'Compute EVM in percent, read adjacent-channel leakage ACPR, and understand what each one reflects.'),
  },
  rfCal: {
    title: loc('RF 校准与误差', 'RF Calibration and Error'),
    goal: loc(
      '说清线缆与夹具损耗怎样污染测量；用校准与去嵌入把误差压到规格以内。',
      'Explain how cable and fixture loss corrupt a measurement; use calibration and de-embedding to bring the error within spec.',
    ),
  },
  rfCapstone: {
    title: loc('综合：RF 收发器测试', 'Capstone: RF Transceiver Test'),
    goal: loc(
      '按顺序完成 RF 收发器的 Tx 与 Rx 测试，判定各项限值并写出报告。',
      'Run the Tx and Rx tests of an RF transceiver in order, judge each limit, and write the report.',
    ),
  },
}
