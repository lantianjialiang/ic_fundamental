import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

/** SNS-04 光子传递曲线 */
export const SNS_PTC_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-ptc',
      term: 'Photon transfer curve',
      name: loc('光子传递曲线', 'Photon transfer curve'),
      def: loc(
        '每个曝光采两帧，均值减去暗场，方差用两帧之差除以 2。散粒噪声区里方差 = 均值 / K + 读噪方差，所以 K = 1 / 斜率。见 {@snsPtc}。',
        'Take two frames at each exposure, subtract the dark mean, and take the variance as the frame difference divided by 2. In the shot-noise region, variance = mean / K + read-noise variance, so K = 1 / slope. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
    {
      id: 'sns-fwc',
      term: 'Full well capacity',
      name: loc('满阱容量', 'Full well capacity'),
      def: loc(
        '像素在饱和前能装下的电子数。PTC 上方差掉下去的亮端就是饱和，满阱约等于饱和均值乘 K。见 {@snsPtc}。',
        'How many electrons a pixel can hold before it saturates. On a PTC the bright end where the variance falls is saturation, and full well is about the saturated mean times K. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
    {
      id: 'sns-fpn',
      term: 'Fixed pattern noise',
      name: loc('固定模式噪声', 'Fixed pattern noise'),
      def: loc(
        '不随时间变的像素间差异，PRNU 是其中随光响应走的一部分。差帧把它们减掉；单帧方差把它们留在斜率里，K 就会偏小。见 {@snsPtc}。',
        'Pixel-to-pixel differences that do not change with time. PRNU is the part that follows the photo-response. A frame difference removes them. Single-frame variance leaves them in the slope, and K comes out low. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
    {
      id: 'sns-dr',
      term: 'Dynamic range',
      name: loc('动态范围', 'Dynamic range'),
      def: loc(
        '满阱电子数除以读出噪声。只剩散粒噪声时 SNR 最大约是 √满阱。见 {@snsPtc}。',
        'Full-well electrons divided by read noise. With shot noise alone the maximum SNR is about the square root of full well. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
  ],
  extraLessons: {
    'sns-cg': ['snsPtc' as ModuleId],
  },
  faqs: [
    {
      id: 'sns-ptc-single',
      q: loc('为什么单帧方差会把 K 估小？', 'Why does single-frame variance estimate K too low?'),
      a: loc(
        '单帧的空间方差里还有 PRNU 和 FPN。信号越大，这部分方差越大，拟合斜率变陡。K 是斜率的倒数，斜率变大，K 就变小。差帧相减后再除以 2，固定图案被消掉，斜率才回到 1/K。见 {@snsPtc}。',
        'The spatial variance of one frame still contains PRNU and FPN. That part grows with the signal, so the fitted slope gets steeper. K is the reciprocal of the slope, so a larger slope makes K smaller. A frame difference divided by 2 removes the fixed pattern, and the slope returns to 1/K. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
    {
      id: 'sns-ptc-roi',
      q: loc('ROI 为什么不能只圈很小一块？', 'Why should the ROI not be a tiny patch?'),
      a: loc(
        '方差估计的相对误差大约是 √(2/(n−1))，n 是 ROI 像素数。像素少，K 就晃。边长 100 约有 1 万像素，相对误差约 1.4%，低于 2%。见 {@snsPtc}。',
        'The relative error of a variance estimate is about sqrt(2/(n-1)), where n is the ROI pixel count. Few pixels make K wander. A side of 100 is about 10000 pixels and a relative error near 1.4%, below 2%. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
    {
      id: 'sns-ptc-one-point',
      q: loc('一个曝光点够不够画出 PTC、读出 K？', 'Is one exposure enough to draw a PTC and read K?'),
      a: loc(
        '不够。K 是散粒噪声区里方差对均值的斜率倒数，一个点给不出斜率。至少要几个未饱和的曝光，再加一个饱和点才能读满阱。只用一个点，方差里的读噪项和饱和都被混在一起。见 {@snsPtc}。',
        'No. K is the reciprocal of the slope of variance versus mean in the shot-noise region; one point does not give a slope. You need several unsaturated exposures, plus one saturated point to read full well. A single point mixes the read-noise term in the variance with saturation. See {@snsPtc}.',
      ),
      lessons: ['snsPtc' as ModuleId],
    },
  ],
}
