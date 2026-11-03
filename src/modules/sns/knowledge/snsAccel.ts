import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const asId = (id: string): ModuleId => id as ModuleId

/** SNS-08 加速度计：灵敏度、噪声密度、翻转法、自检 */
export const SNS_ACCEL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-accel',
      term: 'MEMS accelerometer',
      name: loc('MEMS 加速度计', 'MEMS accelerometer'),
      def: loc(
        '质量块受力产生位移，再变成电压。教学模型是 V = 偏移 + 灵敏度 × 加速度，再加上非线性、温漂和噪声。VDUT-ACC1 取 0.3 V/g 和 1.65 V。见 {@snsAccel}。',
        'A proof mass moves under acceleration and that motion becomes a voltage. The teaching model is V = offset + sensitivity x acceleration, plus nonlinearity, temperature drift and noise. VDUT-ACC1 uses 0.3 V/g and 1.65 V. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
    {
      id: 'sns-noise-density',
      term: 'Noise density',
      name: loc('噪声密度', 'Noise density'),
      def: loc(
        '单位带宽里的噪声，常用 µg/√Hz。带宽内的有效值是 ND·√BW。150 µg/√Hz 和 50 Hz 约为 1.06 mg。见 {@snsAccel}。',
        'Noise per unit bandwidth, often in ug/rtHz. The rms inside a bandwidth is ND·sqrt(BW). 150 ug/rtHz and 50 Hz give about 1.06 mg. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
    {
      id: 'sns-flip-cal',
      term: 'Flip calibration',
      name: loc('翻转法校准', 'Flip calibration'),
      def: loc(
        '同一根轴对着 +1 g 和 −1 g 各读一次。偏移 = (V+ + V−) / 2，灵敏度 = (V+ − V−) / 2，单位 V/g。见 {@snsAccel}。',
        'Read the same axis once at +1 g and once at -1 g. Offset = (V+ + V-) / 2. Sensitivity = (V+ - V-) / 2, in V/g. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
    {
      id: 'sns-self-test',
      term: 'Self-test',
      name: loc('静电自检', 'Self-test'),
      def: loc(
        '在片内加一个等效加速度，用来确认模拟前端有反应。它覆盖不到真实重力、安装倾角和封装应力，所以代替不了物理激励。见 {@snsAccel}。',
        'An equivalent acceleration applied inside the die, to check that the analog front end responds. It does not cover real gravity, mount tilt or package stress, so it does not replace a physical stimulus. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-accel-self-test',
      q: loc('自检能不能代替把器件翻过来？', 'Can self-test replace flipping the part?'),
      a: loc(
        '不能。自检只证明电路有反应。1 g 的真实重力、安装倾角和封装应力都不在这条路径上。量产通常是自检加上少量物理标定。见 {@snsAccel}。',
        'No. Self-test only shows that the circuit responds. Real 1 g, mount tilt and package stress are not on that path. Production usually pairs self-test with a small amount of physical calibration. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
    {
      id: 'sns-accel-tilt',
      q: loc('安装歪 2° 有多大？', 'How large is a 2° mount error?'),
      a: loc(
        '有效重力变成 g·cosθ，相对误差是 1 − cosθ。2° 大约是 0.061%。规格紧的时候，这和灵敏度误差放在同一个量级。见 {@snsAccel}。',
        'Effective gravity becomes g·cosθ, and the relative error is 1 - cosθ. At 2° that is about 0.061%. On a tight spec it sits in the same range as the sensitivity error. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
    {
      id: 'sns-accel-sqrt-bw',
      q: loc('带宽加倍，噪声是不是也加倍？', 'If the bandwidth doubles, does the noise double?'),
      a: loc(
        '不是。带宽内的有效值是 ND·√BW。带宽加倍，噪声只变成 √2 倍，大约多 3 dB。150 µg/√Hz 和 50 Hz 约为 1.06 mg，100 Hz 才到约 1.50 mg。见 {@snsAccel}。',
        'No. The rms inside a bandwidth is ND·sqrt(BW). Doubling the bandwidth multiplies the noise by sqrt(2), about 3 dB. 150 ug/rtHz at 50 Hz is about 1.06 mg; at 100 Hz it is about 1.50 mg. See {@snsAccel}.',
      ),
      lessons: [asId('snsAccel')],
    },
  ],
}
