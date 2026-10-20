import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-08 综合：时序扫描、眼图分析、BER 评估与测试报告 */
export const HS_CAPSTONE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'ber-bathtub',
      term: 'BER bathtub curve',
      name: loc('BER 浴盆曲线', 'BER bathtub curve'),
      def: loc(
        '把误码率随采样相位的变化画成曲线：两侧靠近边沿的地方 BER 高，中间平坦的底部 BER 低，形状像浴盆。底部最低的点就是最佳采样相位；底宽在某个 BER 下的值就是那个 BER 下的眼宽。见 {@hsCapstone}。',
        'A plot of bit error rate against sampling phase: BER is high near the two edges and low across the flat floor in the middle, so the curve looks like a bathtub. The lowest point is the best sampling phase, and the width at a given BER is the eye width at that BER. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
    {
      id: 'timing-sweep',
      term: 'Timing sweep',
      name: loc('时序扫描', 'Timing sweep'),
      def: loc(
        '在一个 UI 内按固定步长移动采样相位，每个相位都测一次误码率，得到浴盆曲线。它找出最佳采样相位，也给出时序裕量的粗略估计。见 {@hsCapstone}。',
        'Moving the sampling phase across one UI in fixed steps and measuring the bit error rate at each phase, which gives the bathtub curve. It finds the best sampling phase and gives a rough estimate of the timing margin. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
    {
      id: 'eye-margin-at-ber',
      term: 'Eye opening at BER',
      name: loc('BER 下的眼宽与眼高', 'Eye width and height at a BER'),
      def: loc(
        '在指定的误码率（如 1e-12）下量得的眼开口：眼宽 = UI − TJ(BER)，眼高 = EH₀ − 2·Q(BER)·σ。规格看的是这个 BER 下的余量，而不是中心一点的 BER。见 {@hsCapstone}。',
        'The eye opening measured at a specified bit error rate such as 1e-12: eye width = UI − TJ(BER), eye height = EH₀ − 2·Q(BER)·σ. The spec is the margin at that BER, not the BER at one centre point. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
  ],
  extraLessons: {
    'eye-diagram': ['hsCapstone'],
    'eye-mask': ['hsCapstone'],
    'random-jitter': ['hsCapstone'],
  },
  faqs: [
    {
      id: 'hs-capstone-why-not-count',
      q: loc('BER 1e-12 为什么不直接数错误？', 'Why not simply count errors to reach BER 1e-12?'),
      a: loc(
        '要有 95% 把握证明 BER 低于 1e-12，零错误需要约 3 × 10¹² 个比特，10 Gb/s 下约 300 s。实际做法是在 BER 较高的区域测得快，用浴盆曲线的 Q 函数尾部外推到 1e-12，并把外推模型写进报告。见 {@hsCapstone}。',
        'To be 95% confident that BER is below 1e-12 with zero errors you need about 3 × 10¹² bits, around 300 s at 10 Gb/s. In practice you measure where BER is higher, where it is quick, and extrapolate the Q-function tails of the bathtub to 1e-12, stating the model in the report. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
    {
      id: 'hs-capstone-center-not-best',
      q: loc('采样点一定放在眼的几何中心吗？', 'Must the sampling point always sit at the geometric centre of the eye?'),
      a: loc(
        '不一定。数据眼相对采样时钟会有偏移（skew），样片不同偏移也不同，最佳相位就是 skew + 0.5 UI。时序扫描直接找浴盆的最低点，比假设“在中间”更可靠。见 {@hsCapstone}。',
        'Not necessarily. The data eye is offset from the sampling clock by a skew that differs from sample to sample, so the best phase is skew + 0.5 UI. A timing sweep finds the bottom of the bathtub directly, which is more reliable than assuming the middle. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
    {
      id: 'hs-capstone-noise-vs-jitter',
      q: loc('样片失效时，怎样分辨是抖动还是噪声造成的？', 'When a sample fails, how do you tell whether jitter or noise is to blame?'),
      a: loc(
        '看报告里哪一项 FAIL。眼宽不够，通常是抖动（DJ、RJ）占去了 UI；眼高不够，通常是电压噪声把两个电平压向中间。浴盆曲线也能帮忙：噪声大时底部被抬高、变平，抖动大时两侧的壁向中心靠拢、底部变窄。见 {@hsCapstone}。',
        'Check which report item fails. A narrow eye width usually points to jitter (DJ, RJ) using up the UI; a low eye height usually points to voltage noise pulling the two levels inward. The bathtub also helps: large noise lifts and flattens the floor, while large jitter pushes the walls toward the centre and narrows the floor. See {@hsCapstone}.',
      ),
      lessons: ['hsCapstone'],
    },
  ],
}
