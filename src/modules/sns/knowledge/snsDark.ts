import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const asId = (id: string): ModuleId => id as ModuleId

/** SNS-05 暗场：暗电流、DSNU、热像素、黑电平 */
export const SNS_DARK_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-dark-current',
      term: 'Dark current',
      name: loc('暗电流', 'Dark current'),
      def: loc(
        '没有光照时像素仍然产生的电子。教学模型是 i(T) = i25 · 2^((T-25)/ΔT)，ΔT 是翻倍温度间隔，只作示意。暗电子 = i(T) · 曝光。见 {@snsDark}。',
        'Electrons a pixel still produces with no light. The teaching model is i(T) = i25 · 2^((T-25)/dT), where dT is a doubling interval used only as an illustration. Dark electrons = i(T) · exposure. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-dsnu',
      term: 'DSNU',
      name: loc('暗信号非均匀性（DSNU）', 'Dark signal non-uniformity (DSNU)'),
      def: loc(
        '每个像素先做时间平均，再取画面上的空间标准差。单帧标准差不是 DSNU，因为里面还有时间噪声；平均按 1/sqrt(N) 把这部分压低。见 {@snsDark}。',
        'Average each pixel over time, then take the spatial standard deviation. The single-frame standard deviation is not DSNU, because temporal noise is still in it. Averaging reduces that part as 1/sqrt(N). See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-hot-pixel',
      term: 'Hot pixel',
      name: loc('热像素', 'Hot pixel'),
      def: loc(
        '暗电流远高于邻居的像素，落在分布的长尾上。阈值要高于正常暗信号、低于热像素，同时看检出和误判。见 {@snsDark}。',
        'A pixel whose dark current is far above its neighbors, out on the tail of the distribution. The threshold has to sit above the normal dark signal and below the hot pixels, and both recall and false calls are read. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-black-level',
      term: 'Black level',
      name: loc('黑电平', 'Black level'),
      def: loc(
        '加在 DN 上的常数本底。暗信号 DN = 黑电平 + 暗电子 / K。比曝光时要比暗电子，不能把黑电平算进倍数。见 {@snsDark}。',
        'A constant floor added in DN. Dark signal in DN = black level + dark electrons / K. A ratio of exposures is taken in dark electrons, not in DN that still includes the black level. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-dark-frame',
      term: 'Dark frame',
      name: loc('暗帧', 'Dark frame'),
      def: loc(
        '快门关上或光源关掉时拍的帧。它含黑电平、暗电流和读出噪声，用来扣亮场、估 DSNU 和找热像素。单帧标准差还不是 DSNU。见 {@snsDark}。',
        'A frame taken with the shutter closed or the light off. It holds black level, dark current and read noise, and is used to subtract from a bright field, estimate DSNU and find hot pixels. The standard deviation of one frame is not yet DSNU. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-dark-not-dsnu',
      q: loc('单帧的标准差为什么不是 DSNU？', 'Why is the standard deviation of one frame not DSNU?'),
      a: loc(
        '单帧里还有读出噪声和暗散粒噪声。DSNU 要先按像素平均掉时间噪声，再算空间标准差。平均把时间噪声按 1/sqrt(N) 压低，热像素这种固定点还在。见 {@snsDark}。',
        'A single frame still contains read noise and dark shot noise. DSNU averages that temporal noise away on each pixel first, then takes the spatial standard deviation. Averaging reduces temporal noise as 1/sqrt(N). A fixed hot pixel stays. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-dark-doubling',
      q: loc('暗电流是不是随温度成直线？', 'Does dark current rise in a straight line with temperature?'),
      a: loc(
        '教学模型不是直线。每过一个翻倍间隔就乘 2。从 25 °C 到 60 °C、间隔 7 °C，倍数是 2^5 = 32。这个间隔是教学示意，不是某一款真实传感器的常数。见 {@snsDark}。',
        'The teaching model is not a straight line. The current doubles at every interval. From 25 °C to 60 °C with a 7 °C interval the factor is 2^5 = 32. That interval is a teaching illustration, not a constant of any real sensor. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
    {
      id: 'sns-dark-threshold',
      q: loc('热像素阈值是不是越低越好？', 'Is a lower hot-pixel threshold always better?'),
      a: loc(
        '不是。阈值要高于正常暗信号、低于真正的热像素。太低会把正常尾巴误判成热点，太高会漏掉长尾上的坏点。要同时看检出和误判，不能只拧阈值。见 {@snsDark}。',
        'No. The threshold has to sit above the normal dark signal and below the real hot pixels. Too low calls the normal tail as hot; too high misses the tail. Read both recall and false calls; do not only turn the threshold. See {@snsDark}.',
      ),
      lessons: [asId('snsDark')],
    },
  ],
}
