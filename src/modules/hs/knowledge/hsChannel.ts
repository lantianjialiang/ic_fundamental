import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-02 传输与信号完整性：阻抗、反射、损耗、ISI、串扰与均衡的概念 */
export const HS_CHANNEL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'reflection-gamma',
      term: 'Reflection coefficient Γ',
      name: loc('反射系数 Γ', 'Reflection coefficient Γ'),
      def: loc(
        '终端阻抗 ZL 与传输线特性阻抗 Z0 不一致时，反射电压与入射电压之比：Γ = (ZL − Z0) ÷ (ZL + Z0)。ZL = Z0 时 Γ = 0。回波损耗 RL = −20·log|Γ|。见 {@hsChannel}。',
        'The ratio of reflected to incident voltage when the termination ZL differs from the line’s characteristic impedance Z0: Γ = (ZL − Z0) ÷ (ZL + Z0). With ZL = Z0, Γ = 0. Return loss RL = −20·log|Γ|. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
    {
      id: 'isi',
      term: 'ISI',
      name: loc('码间干扰', 'Intersymbol interference (ISI)'),
      def: loc(
        '带宽有限的通道把每一位的能量拖到后面的位上，当前位的采样值里混进了前面位的尾巴。ISI 随速率升高而变严重，是眼图闭合的主要原因之一。见 {@hsChannel}。',
        'A band-limited channel smears each bit’s energy into later bits, so the sample of the current bit includes the tails of earlier ones. ISI grows with the rate and is a main cause of eye closure. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
    {
      id: 'pre-emphasis',
      term: 'Pre-emphasis',
      name: loc('预加重', 'Pre-emphasis'),
      def: loc(
        '发送端的一种均衡：跳变位输出满幅，连续同样的位输出被压低，相当于提高高频成分，补偿通道损耗。加得过多会压低连续位，使眼张开度反而变小。见 {@hsChannel}。',
        'A transmitter equaliser: transition bits are sent at full swing while runs of identical bits are reduced, boosting the high-frequency content to offset channel loss. Too much pulls down the runs and can shrink the eye. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
    {
      id: 'crosstalk',
      term: 'Crosstalk',
      name: loc('串扰', 'Crosstalk'),
      def: loc(
        '相邻信号线之间通过电容、电感耦合，把别的线上的信号“漏”过来。它与本线上的 ISI 不同，来自邻线而不是前一位。本课只讲概念，不建模。见 {@hsChannel}。',
        'Signals on neighbouring lines leak into one another through capacitive and inductive coupling. Unlike ISI, which comes from earlier bits on the same line, crosstalk comes from other lines. This lesson describes it without modelling it. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
  ],
  extraLessons: {
    impedance: ['hsChannel'],
    'rc-lowpass': ['hsChannel'],
    'eye-diagram': ['hsChannel'],
  },
  faqs: [
    {
      id: 'hs-channel-why-reflect',
      q: loc('阻抗不匹配为什么会产生反射？', 'Why does an impedance mismatch cause reflection?'),
      a: loc(
        '信号沿线传播时，电压与电流之比等于特性阻抗 Z0。遇到不同阻抗时，这个比例必须在交界处成立，于是一部分能量要反弹回去：Γ = (ZL − Z0) ÷ (ZL + Z0)。ZL 越偏离 Z0，|Γ| 越大，回波损耗越小。见 {@hsChannel}。',
        'As a signal travels, the ratio of voltage to current equals the characteristic impedance Z0. When the impedance changes, that ratio must still hold at the junction, so part of the energy bounces back: Γ = (ZL − Z0) ÷ (ZL + Z0). The further ZL is from Z0, the larger |Γ| and the smaller the return loss. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
    {
      id: 'hs-channel-pe-ctle-dfe',
      q: loc('预加重、CTLE、DFE 都是均衡，有什么区别？', 'Pre-emphasis, CTLE and DFE are all equalisation; what is the difference?'),
      a: loc(
        '位置不同、作用的对象不同。预加重在发送端加强跳变；CTLE 在接收端提高高频增益，相当于一个高通提升；DFE 用已经判决的前几位估计拖尾并减掉，只处理后标（post-cursor）ISI，不放大噪声。它们常组合使用。本课只讲概念。见 {@hsChannel}。',
        'They sit in different places and act on different things. Pre-emphasis boosts transitions at the transmitter; CTLE raises high-frequency gain at the receiver, like a high-pass boost; DFE estimates the tail from earlier decided bits and subtracts it, handling only post-cursor ISI without amplifying noise. They are often combined. This lesson only covers the concepts. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
    {
      id: 'hs-channel-loss-vs-isi',
      q: loc('通道损耗为什么会让眼图闭合，而不只是变小？', 'Why does channel loss close the eye, not just shrink it?'),
      a: loc(
        '损耗主要衰减高频，使边沿变慢。边沿拖长后，前一位还没走完就进入当前位，于是采样点同时包含了前后的能量（ISI），眼的中心既变窄又被压低。只看幅度会低估损耗的影响。见 {@hsChannel}。',
        'Loss mainly attenuates high frequencies, which slows the edges. With slower edges, the previous bit has not finished when the next begins, so the sample mixes energy from both bits (ISI); the eye centre becomes both narrower and lower. Looking at amplitude alone underestimates the damage. See {@hsChannel}.',
      ),
      lessons: ['hsChannel'],
    },
  ],
}
