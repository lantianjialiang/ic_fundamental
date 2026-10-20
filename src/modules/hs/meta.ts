import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 高速接口轨道（HS，轨道前缀 H）的课程 ID，顺序即课序 */
export const HS_LESSONS = [
  'hsBasics',
  'hsChannel',
  'hsTiming',
  'hsJitter',
  'hsEye',
  'hsInterface',
  'hsAteLimit',
  'hsCapstone',
] as const

export type HsLessonId = (typeof HS_LESSONS)[number]

export const HS_META: Record<HsLessonId, LessonMeta> = {
  hsBasics: {
    title: loc('高速信号基础', 'High-speed Signal Basics'),
    goal: loc('认识数据速率、UI 和上升时间；用 BW ≈ 0.35 / tr 估算带宽需求。', 'Know data rate, UI and rise time; estimate the bandwidth needed with BW ≈ 0.35 / tr.'),
  },
  hsChannel: {
    title: loc('传输与信号完整性', 'Transmission and Signal Integrity'),
    goal: loc('说清阻抗失配、损耗、串扰和 ISI 对波形的影响；知道均衡的作用。', 'Explain how impedance mismatch, loss, crosstalk and ISI distort the waveform; know what equalization does.'),
  },
  hsTiming: {
    title: loc('时钟与数据时序', 'Clock and Data Timing'),
    goal: loc('找出 Setup / Hold 边界，理解采样点位置和时序裕量。', 'Find the setup and hold boundaries; understand sampling point placement and timing margin.'),
  },
  hsJitter: {
    title: loc('抖动与噪声', 'Jitter and Noise'),
    goal: loc('区分随机抖动 RJ 与确定性抖动 DJ；用双狄拉克模型估算 TJ@BER。', 'Tell random jitter RJ from deterministic jitter DJ; estimate TJ@BER with the dual-Dirac model.'),
  },
  hsEye: {
    title: loc('眼图分析', 'Eye Diagram Analysis'),
    goal: loc(
      '在眼图上读出眼高、眼宽；用 Mask 判断违例；说清噪声与抖动分别压缩眼的哪一个方向。',
      'Read eye height and eye width from an eye diagram; judge mask violations; explain which direction noise and jitter close the eye.',
    ),
  },
  hsInterface: {
    title: loc('高速接口测试', 'High-speed Interface Test'),
    goal: loc('理解 PRBS、BER 与 Loopback；用时序扫描画出 BER 浴盆曲线。', 'Understand PRBS, BER and loopback; draw a BER bathtub curve with a timing sweep.'),
  },
  hsAteLimit: {
    title: loc('ATE 高速测试的限制', 'Limits of ATE for High-speed Test'),
    goal: loc(
      '说清 ATE 通道带宽、夹具损耗与去嵌入（de-embed）的影响；理解为什么常用 Loopback、Scan 与 BIST。',
      'Explain how ATE channel bandwidth, fixture loss and de-embedding affect results; understand why loopback, scan and BIST are common.',
    ),
  },
  hsCapstone: {
    title: loc('综合：高速接口测试', 'Capstone: High-speed Interface Test'),
    goal: loc('对虚拟 SerDes 完成时序扫描、眼图与 BER 评估，并写出测试报告。', 'Run a timing sweep, eye analysis and BER assessment on a virtual SerDes, and write the test report.'),
  },
}
