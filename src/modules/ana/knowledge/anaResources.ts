import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-03 ATE 模拟资源与负载板：术语、已有词条的课程补充、常见问题 */
export const ANA_RESOURCES_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'awg',
      term: 'AWG',
      name: loc('任意波形发生器', 'Arbitrary waveform generator'),
      def: loc(
        'ATE 上给 DUT 输入脚加激励的模拟资源，能输出正弦、阶跃、任意形状的波形。它只负责出激励，不负责测量，见 {@anaResources}。',
        'The analog resource that drives stimulus into a DUT input pin; it can output sine waves, steps and arbitrary shapes. It only sources stimulus and does not measure; see {@anaResources}.',
      ),
      lessons: ['anaResources'],
    },
    {
      id: 'digitizer',
      term: 'Digitizer',
      name: loc('数字化仪', 'Digitizer'),
      def: loc(
        '按采样率把模拟电压采成一串数字码的资源，适合测波形和频谱。它的速度高，但噪声底比 DMM 高，所以精确的直流电压不用它来测。',
        'The resource that samples an analog voltage at a set rate into a stream of digital codes, suited to waveforms and spectra. It is fast but has a higher noise floor than a DMM, so precise DC voltages are not measured with it.',
      ),
      lessons: ['anaResources'],
    },
    {
      id: 'dmm',
      term: 'DMM',
      name: loc('数字万用表', 'Digital multimeter (DMM)'),
      def: loc(
        '只测量电压、电流、电阻的仪器，积分时间长，精度高、速度慢。它不能给引脚加压，因此 VDD 这类供电脚不能接 DMM。',
        'An instrument that measures voltage, current and resistance. Its integration time is long, so it is accurate but slow. It cannot force a voltage on a pin, so a supply pin such as VDD cannot be connected to a DMM.',
      ),
      lessons: ['anaResources'],
    },
    {
      id: 'ground-shield',
      term: 'Ground shield',
      name: loc('接地屏蔽', 'Ground shield'),
      def: loc(
        '用接地的金属罩或屏蔽层把信号路径包起来，切断接地回路带进来的噪声。它只压低接地噪声这一项，资源自身的噪声底和建立误差不会因此改变。',
        'A grounded metal cover or screen around the signal path that cuts off noise coming in through the ground loop. It only lowers the ground-noise term; the resource’s own noise floor and the settling error do not change.',
      ),
      lessons: ['anaResources'],
    },
  ],
  extraLessons: {
    dps: ['anaResources'],
    relay: ['anaResources'],
    'load-board': ['anaResources'],
    'settling-time': ['anaResources'],
  },
  faqs: [
    {
      id: 'ana-why-wait',
      q: loc('为什么 DPS 或 Relay 闭合后不能马上读数？', 'Why can a reading not be taken right after a DPS or relay closes?'),
      a: loc(
        'Relay 闭合时，资源到引脚的路径会有一个初始误差，它按 e^(−t/τ) 慢慢收敛。马上读，读到的是还没收敛的值。要等到误差降到限值以内，建立时间至少是 τ · ln(E0 / 限值)，见 {@anaResources}。',
        'When a relay closes, the path from resource to pin starts with an initial error that decays as e^(−t/τ). Reading immediately gives a value that has not converged. The settling time must be at least τ · ln(E0 / limit) before the error is inside the limit; see {@anaResources}.',
      ),
      lessons: ['anaResources', 'anaSmu'],
    },
    {
      id: 'ana-shield-what-it-fixes',
      q: loc('开接地屏蔽后读数还是抖，是屏蔽没用吗？', 'The reading still jitters with the ground shield on. Is the shield useless?'),
      a: loc(
        '不是。屏蔽只压低接地噪声这一项；如果抖动主要来自资源自身的噪声底（例如 Digitizer），屏蔽后仍然偏大，就要换一个噪声更低的测量资源。见 {@anaResources}。',
        'No. The shield only lowers the ground-noise term. If the jitter mostly comes from the resource’s own noise floor, as with a digitizer, it stays large with the shield on, and a quieter measurement resource is needed; see {@anaResources}.',
      ),
      lessons: ['anaResources'],
    },
  ],
}
